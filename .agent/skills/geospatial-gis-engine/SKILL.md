---
name: geospatial-gis-engine
description: High-fidelity geospatial calculations, DEM slope profiling, hazard polygon intersection, and accessibility-constrained physical road routing.
---

# Geospatial GIS Engine Skill

## 1. Purpose
Provide authoritative spatial computing, Digital Elevation Model (DEM) terrain gradient analysis, hazard buffer intersections, and physical highway routing for the SmartLogix disaster platform. Guarantees that routes follow real mountain roads and never cross active flood or landslide zones.

---

## 2. Core Rules & Requirements

1. **Coordinate Reference Systems (CRS)**:
   - **Storage & External APIs**: Standard WGS84 (`EPSG:4326`) for GeoJSON, Leaflet markers, and database records.
   - **Internal Metric Computations**: Reproject to **UTM Zone 46N (`EPSG:32646`)** when computing distances, polygon buffer radii, hazard areas, or slope calculations in Northeast India.
   - Never compute Euclidean distances directly on raw latitude/longitude degrees.

2. **Real-Road Geometry & OSRM Routing**:
   - **No Straight Lines**: Never render straight chords across mountain ridges.
   - All navigation paths must be resolved through physical road network coordinates from OSRM or Valhalla (`geometries=geojson&overview=full`).
   - For offline/fallback operation, retain high-density pre-computed highway corridors (NH-13, NH-6, NH-29, NH-306) with at least 500+ road curvature vertices per segment.

3. **Hazard Intersection & Virtual Obstacles**:
   - When a disaster event (landslide, flood) is confirmed, construct a geometric buffer:
     - Landslide debris cone: 1.5 km to 3.0 km buffer.
     - Flash flood / river swell: 2.0 km to 5.0 km river corridor envelope.
   - Use `shapely.intersects` to find severed highway segments.
   - Inject virtual roadblocks into the route solver by setting the edge cost to infinity or penalizing traversal speed to zero.

4. **Digital Elevation Model (DEM) & Slope Constraints**:
   - Extract elevation profiles from Copernicus 30m or SRTM DEM along road paths.
   - Calculate longitudinal slope gradient:
     Slope (%) = (Delta Elevation / Delta Horizontal Distance) * 100
   - **Accessibility Hard Limits**:
     - Standard logistics: Slope <= 14%.
     - Wheelchair-accessible / Heavy medical logistics: Slope <= 8% (4.6 degrees).
     - Routes exceeding accessibility limits must be tagged with gradient warnings.

5. **PostGIS Spatial Operations**:
   - Tables containing geospatial features (`safe_locations`, `hazard_zones`, `corridors`) must store PostGIS geometry types.
   - Spatial columns must have spatial GiST indexes (`CREATE INDEX ... USING GIST(geom)`).
   - Use `ST_DWithin` and `ST_Contains` for instant geofenced driver proximity queries.

---

## 3. Required Technologies & Libraries
- **Spatial Geometry**: `shapely>=2.0.0`, `geopandas>=1.0.0`, `pyproj>=3.6.0`
- **Raster / Elevation**: `rasterio>=1.3.0`, `richdem>=0.3.4`
- **Routing Engine**: Project OSRM (`/route/v1/driving/...`), `geopy>=2.4.0`
- **Spatial Database**: `PostgreSQL` + `PostGIS`, `GeoAlchemy2>=0.15.0`

---

## 4. Implementation Guidance for SmartLogix

### Hazard-to-Road Intersection Check
```python
from shapely.geometry import shape, LineString, Point
from shapely.ops import transform
import pyproj

# EPSG:4326 to EPSG:32646 (Metric UTM Zone 46N)
project_to_utm = pyproj.Transformer.from_crs("EPSG:4326", "EPSG:32646", always_xy=True).transform
project_to_wgs = pyproj.Transformer.from_crs("EPSG:32646", "EPSG:4326", always_xy=True).transform

def is_route_severed(route_polyline_coords: list[tuple[float, float]], hazard_geojson: dict, buffer_meters: float = 1500.0) -> bool:
    route_geom_wgs = LineString([(lon, lat) for lat, lon in route_polyline_coords])
    hazard_geom_wgs = shape(hazard_geojson)
    
    # Project to metric UTM
    route_utm = transform(project_to_utm, route_geom_wgs)
    hazard_utm = transform(project_to_utm, hazard_geom_wgs).buffer(buffer_meters)
    
    return route_utm.intersects(hazard_utm)
```

---

## 5. Validation & Testing Requirements
- **CRS Accuracy Tests**: Verify that 1 degree of latitude in Guwahati projects to approximately 111 km +/- 0.5 km.
- **Intersection Tests**: Test simulated landslide at Sela Pass (KM 45); assert that NH-13 route solver identifies the blockage and returns the alternate bypass corridor.
- **Slope Verification Tests**: Run elevation gradient calculation on known high passes; verify that gradients over 8% trigger wheelchair accessibility warnings.
- **Routing Geometry Tests**: Verify route GeoJSON matches road network line strings, not direct chords.

---

## 6. Integration Guidance
- Ingests risk scores from `.agent/skills/disaster-ml-prediction`.
- Delivers route polylines and affected corridor geometries to frontend Leaflet components and `.agent/skills/cap-emergency-alerts`.
