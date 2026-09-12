---
name: cap-emergency-alerts
description: Common Alerting Protocol (CAP-v1.2) emergency authoring, geo-targeted validation, WebSocket streaming, and NDMA/SACHET interoperability.
---

# CAP Emergency Alerts Skill

## 1. Purpose
Author, parse, validate, and broadcast emergency alert notifications adhering strictly to the international OASIS Common Alerting Protocol (CAP-v1.2 / ITU-T X.1303). Powers real-time disaster alerts, cockpit HUD notifications, and SMS/mesh fallbacks across Northeast India.

---

## 2. Core Rules & Requirements

1. **CAP v1.2 Schema Compliance**:
   - Every generated emergency alert must conform to standard CAP-v1.2 structure:
     - `<identifier>`: Unique globally scoped alert ID (e.g. `IN-AS-SMARTLOGIX-2026-0042`).
     - `<sender>`: Authoritative sender identifier (`dispatch@smartlogix.ne.gov.in`).
     - `<sent>`: ISO-8601 UTC timestamp with timezone offset (`YYYY-MM-DDThh:mm:ss+05:30`).
     - `<status>`: One of `Actual`, `Exercise`, `System`, `Test`, `Draft`.
     - `<msgType>`: One of `Alert`, `Update`, `Cancel`, `Ack`, `Error`.
     - `<scope>`: One of `Public`, `Restricted`, `Private`.
     - `<info>`: Language-specific alert block containing severity, urgency, certainty, and event.

2. **Standard Severity, Urgency & Certainty**:
   - **Severity**: `Extreme` (threat to life/infrastructure), `Severe` (serious injury/damage), `Moderate` (possible disruption), `Minor` (minimal impact), `Unknown`.
   - **Urgency**: `Immediate` (action now), `Expected` (action within 1 hr), `Future`, `Past`, `Unknown`.
   - **Certainty**: `Observed` (verified on ground), `Likely` (>50% probability), `Possible`, `Unlikely`, `Unknown`.

3. **Geo-Targeting Specification**:
   - Every `<area>` tag must contain:
     - `<areaDesc>`: Human-readable region description (e.g., *"NH-13 Sela Pass Corridor, West Kameng, Arunachal Pradesh"*).
     - `<circle>`: `lat,lon,radius_km` for radial alerts (e.g., `27.505,92.102,15.0`).
     - `<polygon>`: Space-delimited coordinate pairs for mountain valley corridors.

4. **Alert Deduplication & Rate Limiting**:
   - Compute an idempotency hash: `SHA256(hazard_type + corridor_id + severity + hour_bucket)`.
   - Suppress identical alert broadcasts within a 60-minute window unless `msgType == "Update"` or severity escalates.
   - Prevent alert fatigue by rate-limiting push notifications per user geofence.

5. **Multi-Channel & Multilingual Dispatch**:
   - **WebSocket Push**: Stream real-time JSON-converted CAP payloads to active web/mobile clients.
   - **Browser Web Notifications**: Trigger high-priority audio alert toasts on client devices.
   - **SMS Fallback Format**: Condense alert into <= 160 GSM characters with actionable instructions and coordinates.
   - **Northeast India Languages**: Support multi-lingual `<info>` elements:
     - `en-IN` (English)
     - `as-IN` (Assamese)
     - `bn-IN` (Bengali)
     - `hi-IN` (Hindi)
     - `brx-IN` (Bodo)

---

## 3. Required Technologies & Libraries
- **CAP Parsing & XML**: `xmltodict>=0.13.0`, `defusedxml>=0.7.0` (prevents XXE attacks)
- **Validation**: `pydantic>=2.10.0` with strict schema validation
- **Real-Time Push**: `fastapi.websockets`, `starlette.websockets`
- **Encoding & Hash**: `hashlib`, `uuid`

---

## 4. Implementation Guidance for SmartLogix

### Standard CAP Payload Generator
```python
import uuid
from datetime import datetime, timezone

def generate_cap_alert(
    hazard_type: str,
    severity: str,
    corridor_name: str,
    center_lat: float,
    center_lon: float,
    radius_km: float,
    headline: str,
    instruction: str,
    lang: str = "en-IN"
) -> dict:
    alert_id = f"IN-NE-LOGIX-{uuid.uuid4().hex[:8].upper()}"
    now_iso = datetime.now(timezone.utc).isoformat()
    
    return {
        "identifier": alert_id,
        "sender": "dispatch@smartlogix.ne.gov.in",
        "sent": now_iso,
        "status": "Actual",
        "msgType": "Alert",
        "scope": "Public",
        "info": {
            "language": lang,
            "category": "Geo",
            "event": hazard_type,
            "urgency": "Immediate",
            "severity": severity,
            "certainty": "Observed",
            "headline": headline,
            "description": f"{hazard_type} confirmed on {corridor_name}. Road traversal compromised.",
            "instruction": instruction,
            "area": {
                "areaDesc": corridor_name,
                "circle": f"{center_lat},{center_lon},{radius_km}"
            }
        }
    }
```

---

## 5. Validation & Testing Requirements
- **XML/JSON Equivalence**: Ensure CAP payloads serialize and deserialize cleanly without data loss.
- **XXE Security Tests**: Verify that `defusedxml` rejects malicious external entities in parsed CAP XML.
- **Deduplication Tests**: Dispatch identical alert parameters twice within 5 minutes; assert second alert is suppressed or marked duplicate.
- **WebSocket Broadcast Tests**: Verify connected clients receive payload in < 50ms.

---

## 6. Integration Guidance
- Triggered by risk evaluations from `.agent/skills/disaster-ml-prediction` and road cuts from `.agent/skills/geospatial-gis-engine`.
- Pushes payloads to active frontend subscribers via `backend/app/routers/alerts.py`.
