# PostgreSQL + PostGIS Skill

## Purpose
Design reliable spatial storage and queries for disaster detection, targeting, evacuation, and navigation.

## Rules
- Use PostgreSQL as the primary relational database.
- Enable PostGIS through migrations.
- Standardize geographic coordinates and SRIDs; use WGS84/EPSG:4326 for API GeoJSON unless the application has an explicit alternative.
- Add spatial indexes to frequently queried geometry/geography columns.
- Use spatial predicates rather than calculating distances manually in application code.
- Use `ST_DWithin`, `ST_Distance`, `ST_Within`, `ST_Contains`, and `ST_Intersects` where appropriate.
- Validate geometries and coordinate ranges.
- Use transactions for multi-table disaster/alert updates.
- Add normal relational indexes for severity, status, timestamps, and foreign keys.
- Never expose raw SQL to untrusted input.

## SIH use cases
- Find users inside an affected polygon.
- Find evacuation centers near a user.
- Exclude blocked roads.
- Query risk zones intersecting a route.
- Find accessible evacuation facilities.
- Store GeoJSON-compatible geographic responses.

## Performance
Use `EXPLAIN` for slow queries and keep spatial predicates index-friendly.
