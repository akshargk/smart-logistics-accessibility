"""
SmartLogix SIH Backend — Automated Test Suite

Tests the main API flows without external dependencies.
Run with: .venv/Scripts/python.exe -m pytest tests/ -v

Or the quick test script:
    .venv/Scripts/python.exe tests/test_api.py
"""
import asyncio
import json
import sys
from datetime import datetime

# Fix Windows console encoding for Unicode output
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')



# ── Simple async HTTP test runner (uses httpx) ────────────────
try:
    import httpx
    HTTPX_AVAILABLE = True
except ImportError:
    HTTPX_AVAILABLE = False


BASE_URL = "http://127.0.0.1:8000"

PASS = "  ✓"
FAIL = "  ✗"


async def run_tests():
    if not HTTPX_AVAILABLE:
        print("httpx not available — install it: uv pip install httpx")
        return

    passed, failed = 0, 0
    print("\n" + "═" * 60)
    print("  SIH Backend — API Test Suite")
    print("═" * 60)

    async with httpx.AsyncClient(base_url=BASE_URL, timeout=15.0) as client:

        # ── Health ────────────────────────────────────────────
        print("\n[Health]")

        resp = await client.get("/health")
        if resp.status_code == 200 and resp.json()["status"] == "ok":
            print(f"{PASS} GET /health → 200 ok")
            passed += 1
        else:
            print(f"{FAIL} GET /health → {resp.status_code}: {resp.text[:80]}")
            failed += 1

        resp = await client.get("/api/v1/status")
        if resp.status_code == 200:
            print(f"{PASS} GET /api/v1/status → 200 ok")
            passed += 1
        else:
            print(f"{FAIL} GET /api/v1/status → {resp.status_code}")
            failed += 1

        # ── Events ────────────────────────────────────────────
        print("\n[Disaster Events]")

        resp = await client.get("/api/v1/events")
        events = resp.json()
        if resp.status_code == 200 and len(events) >= 5:
            print(f"{PASS} GET /api/v1/events → {len(events)} events")
            passed += 1
        else:
            print(f"{FAIL} GET /api/v1/events → {resp.status_code}, count={len(events) if isinstance(events, list) else '?'}")
            failed += 1

        resp = await client.get("/api/v1/events/active")
        if resp.status_code == 200 and len(resp.json()) > 0:
            print(f"{PASS} GET /api/v1/events/active → {len(resp.json())} active events")
            passed += 1
        else:
            print(f"{FAIL} GET /api/v1/events/active → {resp.status_code}")
            failed += 1

        # Create a test event
        payload = {
            "disaster_type": "FLOOD",
            "name": "Test Flood Event",
            "latitude": 26.15, "longitude": 91.75,
            "severity": "MEDIUM",
            "radius_km": 3.0,
        }
        resp = await client.post("/api/v1/events", json=payload)
        if resp.status_code == 201:
            test_event = resp.json()
            print(f"{PASS} POST /api/v1/events → 201 created, id={test_event['id'][:8]}...")
            passed += 1
            # Delete it
            del_resp = await client.delete(f"/api/v1/events/{test_event['id']}")
            if del_resp.status_code == 204:
                print(f"{PASS} DELETE /api/v1/events/{{id}} → 204 deleted")
                passed += 1
            else:
                print(f"{FAIL} DELETE /api/v1/events/{{id}} → {del_resp.status_code}")
                failed += 1
        else:
            print(f"{FAIL} POST /api/v1/events → {resp.status_code}: {resp.text[:80]}")
            failed += 1

        # ── Risk Analysis ─────────────────────────────────────
        print("\n[Risk Analysis]")

        # Safe location (Gangtok, Sikkim — far from plains disasters)
        resp = await client.post("/api/v1/risk/analyse", json={"latitude": 27.3314, "longitude": 88.6138})
        if resp.status_code == 200:
            risk = resp.json()
            print(f"{PASS} POST /api/v1/risk/analyse (safe) → {risk['risk_level']} (score={risk['risk_score']})")
            if risk["risk_level"] == "LOW":
                print(f"{PASS} Safe location correctly returns LOW risk")
                passed += 2
            else:
                print(f"{FAIL} Expected LOW risk, got {risk['risk_level']}")
                passed += 1
                failed += 1
        else:
            print(f"{FAIL} POST /api/v1/risk/analyse → {resp.status_code}")
            failed += 1

        # Inside flood zone (Guwahati Brahmaputra riverfront)
        resp = await client.post("/api/v1/risk/analyse", json={"latitude": 26.1820, "longitude": 91.7420})
        if resp.status_code == 200:
            risk = resp.json()
            print(f"{PASS} POST /api/v1/risk/analyse (flood zone) → {risk['risk_level']} (score={risk['risk_score']})")
            if risk["risk_level"] in ("HIGH", "CRITICAL"):
                print(f"{PASS} Flood zone correctly returns HIGH/CRITICAL risk")
                passed += 2
            else:
                print(f"{FAIL} Expected HIGH/CRITICAL, got {risk['risk_level']}")
                passed += 1
                failed += 1
        else:
            print(f"{FAIL} POST /api/v1/risk/analyse (flood) → {resp.status_code}")
            failed += 1

        resp = await client.get("/api/v1/risk/zones")
        if resp.status_code == 200 and resp.json()["count"] > 0:
            print(f"{PASS} GET /api/v1/risk/zones → {resp.json()['count']} zones")
            passed += 1
        else:
            print(f"{FAIL} GET /api/v1/risk/zones → {resp.status_code}")
            failed += 1

        # ── Alerts ────────────────────────────────────────────
        print("\n[Alerts]")

        resp = await client.post("/api/v1/alerts/generate", json={"latitude": 26.1820, "longitude": 91.7420})
        if resp.status_code == 201 and len(resp.json()) > 0:
            alerts_created = resp.json()
            print(f"{PASS} POST /api/v1/alerts/generate → {len(alerts_created)} alert(s) created")
            passed += 1
            alert_id = alerts_created[0]["id"]
            # Acknowledge
            ack_resp = await client.post(f"/api/v1/alerts/{alert_id}/acknowledge")
            if ack_resp.status_code == 200 and ack_resp.json()["status"] == "ACKNOWLEDGED":
                print(f"{PASS} POST /api/v1/alerts/{{id}}/acknowledge → ACKNOWLEDGED")
                passed += 1
            else:
                print(f"{FAIL} acknowledge → {ack_resp.status_code}")
                failed += 1
        else:
            print(f"{FAIL} POST /api/v1/alerts/generate → {resp.status_code}")
            failed += 1

        resp = await client.get("/api/v1/alerts")
        if resp.status_code == 200:
            print(f"{PASS} GET /api/v1/alerts → {len(resp.json())} alerts")
            passed += 1
        else:
            print(f"{FAIL} GET /api/v1/alerts → {resp.status_code}")
            failed += 1

        # ── Routes ────────────────────────────────────────────
        print("\n[Routes & Locations]")

        resp = await client.get("/api/v1/locations")
        if resp.status_code == 200 and len(resp.json()) > 0:
            print(f"{PASS} GET /api/v1/locations → {len(resp.json())} safe locations")
            passed += 1
        else:
            print(f"{FAIL} GET /api/v1/locations → {resp.status_code}")
            failed += 1

        resp = await client.post("/api/v1/route", json={"latitude": 26.1820, "longitude": 91.7420})
        if resp.status_code == 200:
            route = resp.json()
            print(f"{PASS} POST /api/v1/route → {route['status']}, {route['distance_km']}km to '{route['destination_name'][:30]}'")
            passed += 1
        else:
            print(f"{FAIL} POST /api/v1/route → {resp.status_code}: {resp.text[:80]}")
            failed += 1

        # ── Demo / Dashboard ──────────────────────────────────
        print("\n[Demo / Dashboard]")

        resp = await client.get("/api/v1/demo/dashboard")
        if resp.status_code == 200:
            dash = resp.json()
            print(f"{PASS} GET /api/v1/demo/dashboard → {dash['active_events_count']} events, {dash['active_alerts_count']} alerts")
            passed += 1
        else:
            print(f"{FAIL} GET /api/v1/demo/dashboard → {resp.status_code}")
            failed += 1

        resp = await client.get("/api/v1/demo/scenarios")
        if resp.status_code == 200 and len(resp.json()["scenarios"]) == 4:
            print(f"{PASS} GET /api/v1/demo/scenarios → {len(resp.json()['scenarios'])} scenarios")
            passed += 1
        else:
            print(f"{FAIL} GET /api/v1/demo/scenarios → {resp.status_code}")
            failed += 1

        for scenario in ["safe", "flood", "landslide", "multi_hazard"]:
            resp = await client.post("/api/v1/demo/scenario", json={"scenario": scenario})
            if resp.status_code == 200:
                data = resp.json()
                print(f"{PASS} POST /api/v1/demo/scenario ({scenario}) → risk={data['risk_analysis']['risk_level']}")
                passed += 1
            else:
                print(f"{FAIL} POST /api/v1/demo/scenario ({scenario}) → {resp.status_code}: {resp.text[:60]}")
                failed += 1

        # ── Validation ────────────────────────────────────────
        print("\n[Validation]")

        resp = await client.post("/api/v1/risk/analyse", json={"latitude": 999, "longitude": 76.0})
        if resp.status_code == 422:
            print(f"{PASS} Invalid lat=999 correctly returns 422 Unprocessable")
            passed += 1
        else:
            print(f"{FAIL} Invalid coordinates should return 422, got {resp.status_code}")
            failed += 1

        resp = await client.get("/api/v1/events/nonexistent-id-xyz")
        if resp.status_code == 404:
            print(f"{PASS} GET nonexistent event returns 404")
            passed += 1
        else:
            print(f"{FAIL} Expected 404, got {resp.status_code}")
            failed += 1

    # ── Summary ───────────────────────────────────────────────
    print("\n" + "─" * 60)
    total = passed + failed
    print(f"  {passed}/{total} tests passed" + (f"  ({failed} FAILED)" if failed else "  🎉"))
    print("═" * 60 + "\n")
    return failed == 0


if __name__ == "__main__":
    success = asyncio.run(run_tests())
    sys.exit(0 if success else 1)
