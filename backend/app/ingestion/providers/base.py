"""
SmartLogix SIH Backend — Base Provider Adapter
Provides abstract client lifecycle, 3-state circuit breaking,
exponential backoff with jitter, and observability tracking.
"""

import abc
import asyncio
import logging
import random
import time
from datetime import datetime, timezone
from typing import Optional, Dict, Any
import httpx

from app.ingestion.schemas import CircuitState, ProviderHealthStatus

logger = logging.getLogger(__name__)


class CircuitBreakerOpenException(Exception):
    """Raised when an execution attempt is blocked by an OPEN circuit."""
    pass


class BaseProvider(abc.ABC):
    """
    Abstract base provider for all external disaster telemetry feeds.
    Enforces circuit-breaker safety, connection limits, and retry policies.
    """

    def __init__(
        self,
        name: str,
        failure_threshold: int = 3,
        recovery_timeout_seconds: float = 60.0,
        request_timeout_seconds: float = 10.0,
        max_retries: int = 3,
    ):
        self.name = name
        self.failure_threshold = failure_threshold
        self.recovery_timeout_seconds = recovery_timeout_seconds
        self.request_timeout_seconds = request_timeout_seconds
        self.max_retries = max_retries

        # Circuit breaker state
        self.circuit_state = CircuitState.CLOSED
        self.consecutive_failures = 0
        self.last_state_change = time.time()

        # Telemetry & metrics
        self.total_requests = 0
        self.successful_requests = 0
        self.last_latency_ms: Optional[float] = None
        self.last_success_timestamp: Optional[datetime] = None
        self.last_error: Optional[str] = None

        # Shared reusable async HTTP client
        self._client: Optional[httpx.AsyncClient] = None

    async def get_client(self) -> httpx.AsyncClient:
        """Returns or creates a pooled AsyncClient."""
        if self._client is None or self._client.is_closed:
            limits = httpx.Limits(max_connections=20, max_keepalive_connections=10)
            timeout = httpx.Timeout(self.request_timeout_seconds, connect=5.0)
            self._client = httpx.AsyncClient(limits=limits, timeout=timeout)
        return self._client

    async def close(self):
        """Cleanly close underlying HTTP connection pool."""
        if self._client is not None and not self._client.is_closed:
            await self._client.aclose()

    def _check_circuit(self):
        """Transitions OPEN to HALF_OPEN when recovery window expires."""
        now = time.time()
        if self.circuit_state == CircuitState.OPEN:
            if now - self.last_state_change >= self.recovery_timeout_seconds:
                logger.info(f"[{self.name}] Circuit transitioning OPEN -> HALF_OPEN (probing)")
                self.circuit_state = CircuitState.HALF_OPEN
                self.last_state_change = now
            else:
                remaining = round(self.recovery_timeout_seconds - (now - self.last_state_change), 1)
                raise CircuitBreakerOpenException(
                    f"[{self.name}] Circuit is OPEN. Request blocked for safety ({remaining}s remaining)."
                )

    def _record_success(self, latency_ms: float):
        """Records a successful network interaction."""
        self.total_requests += 1
        self.successful_requests += 1
        self.consecutive_failures = 0
        self.last_latency_ms = round(latency_ms, 2)
        self.last_success_timestamp = datetime.now(timezone.utc)
        self.last_error = None

        if self.circuit_state in (CircuitState.OPEN, CircuitState.HALF_OPEN):
            logger.info(f"[{self.name}] Circuit recovered -> CLOSED")
            self.circuit_state = CircuitState.CLOSED
            self.last_state_change = time.time()

    def _record_failure(self, exc: Exception):
        """Records a network failure and trips circuit if threshold exceeded."""
        self.total_requests += 1
        self.consecutive_failures += 1
        self.last_error = str(exc)
        logger.warning(f"[{self.name}] Failure #{self.consecutive_failures}: {exc}")

        if self.circuit_state == CircuitState.HALF_OPEN:
            logger.warning(f"[{self.name}] Probe failed in HALF_OPEN -> Re-opening circuit for {self.recovery_timeout_seconds}s")
            self.circuit_state = CircuitState.OPEN
            self.last_state_change = time.time()
        elif self.consecutive_failures >= self.failure_threshold and self.circuit_state == CircuitState.CLOSED:
            logger.error(f"[{self.name}] Failure threshold {self.failure_threshold} reached. Tripping circuit to OPEN!")
            self.circuit_state = CircuitState.OPEN
            self.last_state_change = time.time()

    async def execute_with_resilience(self, request_coro_factory):
        """
        Executes an HTTP coroutine with:
        1. Circuit breaker gatekeeper
        2. Exponential backoff + randomized jitter
        3. Telemetry recording
        """
        self._check_circuit()

        last_exc: Optional[Exception] = None
        for attempt in range(self.max_retries):
            start_time = time.perf_counter()
            try:
                client = await self.get_client()
                response = await request_coro_factory(client)
                latency_ms = (time.perf_counter() - start_time) * 1000.0

                # Check HTTP status
                if hasattr(response, "is_error") and response.is_error:
                    # Non-retryable 4xx client errors (except 429 Too Many Requests)
                    if 400 <= response.status_code < 500 and response.status_code != 429:
                        self._record_failure(httpx.HTTPStatusError(
                            f"Client error {response.status_code}", request=response.request, response=response
                        ))
                        response.raise_for_status()
                    response.raise_for_status()

                self._record_success(latency_ms)
                return response

            except (httpx.TimeoutException, httpx.NetworkError, httpx.HTTPStatusError) as exc:
                last_exc = exc
                latency_ms = (time.perf_counter() - start_time) * 1000.0
                logger.debug(f"[{self.name}] Attempt {attempt + 1}/{self.max_retries} failed: {exc}")

                # If this was the last attempt or non-retryable 4xx, stop retrying
                if attempt == self.max_retries - 1:
                    break

                # Exponential backoff with jitter: min(30s, base * 2^attempt) + uniform(0, jitter)
                backoff = min(10.0, 0.5 * (2 ** attempt)) + random.uniform(0.1, 0.5)
                await asyncio.sleep(backoff)

            except Exception as exc:
                last_exc = exc
                break

        # If all retries failed, register provider failure
        self._record_failure(last_exc or RuntimeError("Unknown execution failure"))
        raise last_exc or RuntimeError(f"[{self.name}] Execution failed after {self.max_retries} attempts.")

    def get_health_status(self) -> ProviderHealthStatus:
        """Constructs an observability status snapshot."""
        if self.circuit_state == CircuitState.OPEN:
            status = "CIRCUIT_OPEN"
        elif self.circuit_state == CircuitState.HALF_OPEN:
            status = "PROBING_HALF_OPEN"
        elif self.consecutive_failures > 0:
            status = "DEGRADED"
        else:
            status = "HEALTHY"

        return ProviderHealthStatus(
            provider_name=self.name,
            status=status,
            circuit_state=self.circuit_state,
            consecutive_failures=self.consecutive_failures,
            total_requests=self.total_requests,
            successful_requests=self.successful_requests,
            last_latency_ms=self.last_latency_ms,
            last_success_timestamp=self.last_success_timestamp,
            last_error=self.last_error,
        )
