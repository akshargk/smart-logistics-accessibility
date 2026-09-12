# Geospatial Navigation Skill

## Purpose
Handle affected-area detection, evacuation centers, blocked roads, and safe routing.

## Rules
- Use PostGIS for authoritative spatial operations.
- Keep API geometry formats consistent, preferably GeoJSON.
- Validate latitude/longitude and geometry validity.
- Find affected users with spatial predicates.
- Find evacuation centers using distance plus capacity/accessibility constraints.
- Treat road closures/blockages as routing constraints.
- Prefer safe routes over merely shortest routes.
- Consider disaster severity, blocked roads, risk zones, and evacuation-center accessibility.
- Never claim a route is safe without stating the data/model basis.
- Keep expensive spatial operations indexed and bounded.

## SIH flow
User location + risk zones + road status + evacuation centers -> candidate routes -> risk filtering -> safest practical route -> map/GeoJSON response.
