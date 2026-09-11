"""
SmartLogix SIH Backend — Demo / Simulation Data

Pre-loaded disaster scenarios for the SIH prototype demonstration.
All data is clearly labelled as DEMO.

Northeast India locations used:
  - Assam (Guwahati / Kamrup Metro, Tezpur, Silchar, Haflong / Dima Hasao)
  - Meghalaya (Shillong, East Khasi Hills)
  - Arunachal Pradesh (Itanagar, Papum Pare)
  - Nagaland (Dimapur, Kohima)
  - Sikkim (Gangtok)
  - Tripura (Agartala)
"""
from datetime import datetime, timezone


# ── Safe Shelters / Locations (realistic Northeast India) ─────
DEMO_SAFE_LOCATIONS = [
    {
        "name": "Sarusajai Stadium Relief Hub",
        "location_type": "SHELTER",
        "latitude": 26.1210, "longitude": 91.7640,
        "capacity": 1500, "current_occupancy": 320,
        "is_accessible": True,
        "contact": "0361-2237001",
        "address": "Indira Gandhi Athletic Stadium Complex, Sarusajai, Guwahati",
    },
    {
        "name": "Gauhati Medical College Evacuation Wing",
        "location_type": "HOSPITAL",
        "latitude": 26.1550, "longitude": 91.7720,
        "capacity": 600, "current_occupancy": 150,
        "is_accessible": True,
        "contact": "0361-2529457",
        "address": "GMCH Complex, Narakasur Hilltop, Bhangagarh, Guwahati",
    },
    {
        "name": "Shillong Polo Ground Relief Camp",
        "location_type": "RELIEF_CAMP",
        "latitude": 25.5890, "longitude": 91.8980,
        "capacity": 1200, "current_occupancy": 480,
        "is_accessible": True,
        "contact": "0364-2224201",
        "address": "Polo Grounds, 5th Furlong, Shillong, Meghalaya",
    },
    {
        "name": "Tezpur Collegiate School Shelter Hub",
        "location_type": "SHELTER",
        "latitude": 26.6340, "longitude": 92.7980,
        "capacity": 850, "current_occupancy": 190,
        "is_accessible": True,
        "contact": "03712-220012",
        "address": "Collegiate Field Road, Tezpur, Sonitpur, Assam",
    },
    {
        "name": "Dimapur Municipal Emergency Shelter",
        "location_type": "SHELTER",
        "latitude": 25.9120, "longitude": 93.7310,
        "capacity": 1000, "current_occupancy": 0,
        "is_accessible": True,
        "contact": "03862-226600",
        "address": "Municipal Council Complex, Clock Tower, Dimapur, Nagaland",
    },
    {
        "name": "Itanagar Golden Jubilee Banquet Shelter",
        "location_type": "SHELTER",
        "latitude": 27.0980, "longitude": 93.6190,
        "capacity": 700, "current_occupancy": 85,
        "is_accessible": True,
        "contact": "0360-2212351",
        "address": "Bank Tinali, VIP Road, Itanagar, Arunachal Pradesh",
    },
    {
        "name": "Agartala Indoor Stadium Relief Center",
        "location_type": "SHELTER",
        "latitude": 23.8380, "longitude": 91.2820,
        "capacity": 1400, "current_occupancy": 110,
        "is_accessible": True,
        "contact": "0381-2325555",
        "address": "Badharghat Stadium Complex, Agartala, Tripura",
    },
]


# ── Demo Disaster Events (Northeast India) ────────────────────
DEMO_EVENTS = [
    {
        "disaster_type": "FLOOD",
        "name": "Brahmaputra Basin Flood — Guwahati",
        "description": (
            "Severe monsoon inundation along Brahmaputra river plain. "
            "Water levels 1.2m above danger mark at Pandu port ghat. "
            "Low-lying Kamrup Metro riverfront settlements evacuated."
        ),
        "latitude": 26.1850, "longitude": 91.7450,
        "severity": "HIGH",
        "radius_km": 12.0,
        "status": "ACTIVE",
        "evacuees": 14200,
        "source": "DEMO — Assam State Disaster Management Authority",
    },
    {
        "disaster_type": "LANDSLIDE",
        "name": "Shillong Bypass Slope Failure",
        "description": (
            "Critical mudslide along NH-6 Shillong bypass following continuous torrential rain. "
            "Multi-axle traffic halted; alternative light-vehicle diversion active via Umsning."
        ),
        "latitude": 25.6100, "longitude": 91.9200,
        "severity": "HIGH",
        "radius_km": 8.5,
        "status": "ACTIVE",
        "evacuees": 2450,
        "source": "DEMO — Meghalaya State Disaster Management Authority",
    },
    {
        "disaster_type": "LANDSLIDE",
        "name": "Dima Hasao Hill Debris Flow",
        "description": (
            "Severe mountain slope failure and flash debris torrent in Haflong hill section. "
            "Lumding-Badarpur rail line disrupted; road clearances in progress."
        ),
        "latitude": 25.1700, "longitude": 93.0200,
        "severity": "CRITICAL",
        "radius_km": 15.0,
        "status": "ACTIVE",
        "evacuees": 5800,
        "source": "DEMO — North East Frontier Disaster Division",
    },
    {
        "disaster_type": "FLOOD",
        "name": "Papum Pare Flash Inundation",
        "description": (
            "Dikrong river water surge and flash flooding in Naharlagun-Itanagar belt. "
            "Temporary bridges compromised; vulnerable bank huts moved to higher ground."
        ),
        "latitude": 27.0844, "longitude": 93.6053,
        "severity": "MEDIUM",
        "radius_km": 10.0,
        "status": "MONITORING",
        "evacuees": 920,
        "source": "DEMO — Arunachal Pradesh Disaster Cell",
    },
    {
        "disaster_type": "FLOOD",
        "name": "Barak River Water Watch — Silchar",
        "description": (
            "Barak river at Annapurna Ghat monitoring station holding at 84% of danger mark. "
            "Sluice gates operational; Cachar district administration on standby."
        ),
        "latitude": 24.8333, "longitude": 92.7789,
        "severity": "MEDIUM",
        "radius_km": 18.0,
        "status": "ACTIVE",
        "evacuees": 0,
        "source": "DEMO — Central Water Commission Northeast",
    },
]


# ── Simulation Scenarios (Northeast India) ────────────────────
DEMO_SCENARIOS = {
    "safe": {
        "description": "User in Gangtok, Sikkim — far from active plains flood and landslides. LOW risk result expected.",
        "latitude": 27.3314, "longitude": 88.6138,  # Gangtok, Sikkim (safe zone)
    },
    "flood": {
        "description": "User near Guwahati riverfront — inside active Brahmaputra flood radius. HIGH/CRITICAL risk + flood alert.",
        "latitude": 26.1820, "longitude": 91.7420,  # Guwahati Brahmaputra riverside
    },
    "landslide": {
        "description": "User near East Khasi Hills / Shillong bypass slope failure. HIGH risk + landslide warning.",
        "latitude": 25.6050, "longitude": 91.9150,  # Near Shillong bypass NH-6
    },
    "multi_hazard": {
        "description": "User in Kamakhya foothill riverbank — overlapping flood inundation and hill slope erosion. Compounded risk.",
        "latitude": 26.1750, "longitude": 91.7150,  # Overlapping hazard zone
    },
}
