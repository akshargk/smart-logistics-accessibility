"""
SmartLogix SIH Backend — Ingestion Engine Package
Provides fault-tolerant asynchronous data ingestion, normalization,
resilient circuit-breaking, local caching, and ML candidate feature contracts.
"""

from app.ingestion.schemas import (
    NormalizedWeather,
    NormalizedEarthquake,
    NormalizedInfrastructure,
    CandidateMLSignals,
    DataQualityFlag,
    CircuitState,
)
from app.ingestion.service import DataIngestionService

__all__ = [
    "NormalizedWeather",
    "NormalizedEarthquake",
    "NormalizedInfrastructure",
    "CandidateMLSignals",
    "DataQualityFlag",
    "CircuitState",
    "DataIngestionService",
]
