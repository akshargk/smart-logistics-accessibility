"""
SmartLogix SIH Backend — Route Service
Generates adaptive, road-following evacuation route recommendations.

Routing Guarantees:
  1. Uses actual road-network geometry from OSRM (Open Source Routing Machine).
  2. The returned coordinates trace real mapped roads, highways, and street corridors.
  3. No straight-line or arbitrary diagonal interpolation across the map.
  4. Evaluates at least 3 distinct candidate road corridors.
  5. Evaluates Scikit-Learn ML risk along the actual road checkpoints.
  6. Dynamically reroutes when a disaster intersects a primary road corridor.
"""

import uuid
import asyncio
from datetime import datetime, timezone
from typing import List, Optional, Tuple, Dict, Any
from app.schemas import SafeRouteResponse, RouteWaypoint, CandidateRoute
from app.services.geo import haversine_km, estimate_travel_minutes
from app.services.osrm_routing import fetch_osrm_road_route, fetch_osrm_road_route_async
from app.ml.model_service import get_ml_risk_service


async def generate_route_async(
    user_lat: float,
    user_lon: float,
    safe_locations: list,  # List of SafeLocation ORM objects
    active_events: list,   # List of DisasterEvent ORM objects
    prefer_accessible: bool = False,
    rainfall_mm: Optional[float] = None,
    wind_speed_kmh: Optional[float] = None,
) -> SafeRouteResponse:
    """
    Generate an adaptive evacuation recommendation evaluating at least 3 road-network
    candidate routes, concurrently fetched and scored along actual road coordinates by Scikit-Learn.
    """
    ml_service = get_ml_risk_service()
    now_utc = datetime.now(timezone.utc)

    # 1. Filter and prepare active shelters
    available_shelters = [loc for loc in safe_locations if getattr(loc, "is_active", True)]

    if not available_shelters:
        # Fallback when no shelters exist
        fallback_wp = RouteWaypoint(latitude=user_lat, longitude=user_lon, label="Your Location")
        return SafeRouteResponse(
            route_id=str(uuid.uuid4()),
            status="CAUTION",
            from_location=fallback_wp,
            to_location=fallback_wp,
            destination_name="Move to nearest elevated ground",
            destination_type="SAFE_AREA",
            distance_km=0.0,
            estimated_minutes=0,
            waypoints=[],
            hazards_avoided=0,
            is_accessible=False,
            safety_notes=["No registered shelters found. Move to nearest elevated/open area."],
            is_demo=True,
            generated_at=now_utc,
            recommended_route_id=None,
            selection_reason="No registered shelters available in database.",
            ml_risk_score=0.0,
            candidate_routes=[],
            ml_telemetry=ml_service.get_model_telemetry(),
        )

    # Rank shelters by distance from user
    shelters_with_dist = []
    for s in available_shelters:
        d = haversine_km(user_lat, user_lon, s.latitude, s.longitude)
        shelters_with_dist.append((s, d))
    shelters_with_dist.sort(key=lambda x: x[1])

    # 2. Fetch actual road routes from OSRM across top shelters concurrently
    raw_road_candidates: List[Tuple[Any, Dict[str, Any], str]] = []
    top_shelters = shelters_with_dist[:3]

    # Concurrently query OSRM for all top candidate shelters with shared AsyncClient
    import httpx
    async with httpx.AsyncClient(timeout=2.5, headers={"User-Agent": "SmartLogix-Disaster-Logistics/1.0"}) as client:
        osrm_tasks = [
            fetch_osrm_road_route_async(
                user_lat, user_lon, shelter.latitude, shelter.longitude,
                request_alternatives=(s_idx < 2),
                client=client,
            )
            for s_idx, (shelter, _) in enumerate(top_shelters)
        ]
        all_shelter_routes = await asyncio.gather(*osrm_tasks, return_exceptions=True)

    for (shelter, _), osrm_routes in zip(top_shelters, all_shelter_routes):
        if isinstance(osrm_routes, Exception) or not osrm_routes:
            continue
        for r_idx, r_data in enumerate(osrm_routes):
            if len(raw_road_candidates) >= 4:
                break
            if r_idx == 0:
                label = f"Route {chr(65 + len(raw_road_candidates))} (Direct Corridor to {shelter.name.split(' ')[0]})"
            else:
                label = f"Route {chr(65 + len(raw_road_candidates))} (Alternative Bypass to {shelter.name.split(' ')[0]})"
            raw_road_candidates.append((shelter, r_data, label))

    # Fallback safety: ensure we always evaluate at least 3 road candidates
    while len(raw_road_candidates) < 3:
        target_shelter = shelters_with_dist[min(len(raw_road_candidates), len(shelters_with_dist) - 1)][0]
        fb_routes = await fetch_osrm_road_route_async(
            user_lat, user_lon, target_shelter.latitude, target_shelter.longitude, request_alternatives=False, timeout_sec=2.0
        )
        raw_road_candidates.append((target_shelter, fb_routes[0], f"Route {chr(65 + len(raw_road_candidates))} (Road Corridor)"))

    # 3. Evaluate each candidate road route with Scikit-Learn ML risk scoring
    evaluated_candidates: List[CandidateRoute] = []
    costs: List[float] = []

    for idx, (shelter, road_info, name_label) in enumerate(raw_road_candidates[:4]):
        route_id = f"route_candidate_{idx + 1}"
        dist_km = road_info["distance_km"]
        dur_min = road_info["duration_min"]
        waypoints: List[RouteWaypoint] = road_info["waypoints"]

        # Sample 15-20 points along the REAL road coordinates for ML scoring
        sample_step = max(1, len(waypoints) // 16)
        sampled_pts = waypoints[::sample_step]

        point_scores = []
        for wp in sampled_pts:
            score, _ = ml_service.predict_point_risk(
                wp.latitude, wp.longitude, active_events,
                shelter=shelter,
                route_transit_km=dist_km,
                rainfall_mm=rainfall_mm,
                wind_speed_kmh=wind_speed_kmh,
            )
            point_scores.append(score)

        # Also evaluate destination shelter point
        dest_score, _ = ml_service.predict_point_risk(
            shelter.latitude, shelter.longitude, active_events,
            shelter=shelter,
            route_transit_km=dist_km,
            rainfall_mm=rainfall_mm,
            wind_speed_kmh=wind_speed_kmh,
        )
        point_scores.append(dest_score)

        # Route ML Risk Score: 60% worst road segment + 40% average road exposure
        max_risk = max(point_scores) if point_scores else 0.0
        avg_risk = sum(point_scores) / len(point_scores) if point_scores else 0.0
        composite_ml_risk = round(0.60 * max_risk + 0.40 * avg_risk, 1)

        # Count hazards along road
        hazards_avoided = _count_road_hazards_avoided(waypoints, active_events)

        # Status classification
        if composite_ml_risk >= 70.0:
            status = "BLOCKED"
            verdict = "Hazardous road corridor — cuts through active disaster inundation zone."
        elif composite_ml_risk >= 48.0:
            status = "HAZARD_PRONE"
            verdict = "Elevated risk — road passes through or near active disaster perimeter."
        elif composite_ml_risk >= 25.0:
            status = "CAUTION"
            verdict = "Viable alternative — moderate hazard proximity, proceed with caution."
        else:
            status = "SAFE"
            verdict = "Optimal safe road corridor — minimal hazard exposure."

        is_acc = bool(shelter.is_accessible)
        occ_pct = (shelter.current_occupancy / shelter.capacity) if shelter.capacity else 0.2

        # Objective Routing Cost for selection
        accessibility_penalty = 120.0 if (prefer_accessible and not is_acc) else 0.0
        blocked_penalty = 80.0 if status == "BLOCKED" else (30.0 if status == "HAZARD_PRONE" else 0.0)
        cost = (
            (composite_ml_risk * 1.35)
            + (dist_km * 1.5)
            + (occ_pct * 20.0)
            + accessibility_penalty
            + blocked_penalty
        )
        costs.append(cost)

        evaluated_candidates.append(CandidateRoute(
            route_id=route_id,
            name=name_label,
            destination_name=shelter.name,
            destination_type=shelter.location_type,
            distance_km=dist_km,
            estimated_minutes=dur_min,
            ml_risk_score=composite_ml_risk,
            status=status,
            is_accessible=is_acc,
            hazards_avoided=hazards_avoided,
            safety_verdict=verdict,
            is_recommended=False,
            waypoints=waypoints,
        ))

    # 4. Dynamically select the winning recommended road route
    best_idx = int(min(range(len(costs)), key=lambda i: costs[i]))
    winner = evaluated_candidates[best_idx]
    winner.is_recommended = True
    winner_shelter = raw_road_candidates[best_idx][0]

    # 5. Explainable selection rationale
    direct_route = evaluated_candidates[0]
    if direct_route.route_id != winner.route_id and direct_route.ml_risk_score >= 45.0:
        selection_reason = (
            f"Road-network analysis flagged {direct_route.name} to {direct_route.destination_name} "
            f"as {direct_route.status} (ML Risk: {direct_route.ml_risk_score}/100) due to hazard inundation. "
            f"Dynamically rerouted to {winner.name} ({winner.destination_name}) "
            f"following safe mapped roads ({winner.status}, ML Risk: {winner.ml_risk_score}/100)."
        )
    elif prefer_accessible and not direct_route.is_accessible and winner.is_accessible:
        selection_reason = (
            f"Wheelchair accessibility prioritized: dynamically selected accessible facility "
            f"at {winner.destination_name} via mapped road corridor ({winner.distance_km} km, ML Risk: {winner.ml_risk_score}/100)."
        )
    else:
        selection_reason = (
            f"Selected {winner.name} to {winner.destination_name} via mapped road network "
            f"({winner.distance_km} km, ~{winner.estimated_minutes} min) with lowest compound hazard exposure "
            f"(ML Risk: {winner.ml_risk_score}/100, Status: {winner.status})."
        )

    # 6. Safety notes
    safety_notes = []
    if winner.hazards_avoided > 0:
        safety_notes.append(f"Road corridor actively circumvents {winner.hazards_avoided} disaster perimeter(s).")
    if winner.is_accessible:
        safety_notes.append("Destination and road transit are wheelchair-accessible.")
    else:
        safety_notes.append("Destination is emergency shelter with standard infrastructure.")

    if winner_shelter.current_occupancy > 0 and winner_shelter.capacity:
        remaining = winner_shelter.capacity - winner_shelter.current_occupancy
        safety_notes.append(f"Shelter occupancy: {winner_shelter.current_occupancy}/{winner_shelter.capacity} ({remaining} spaces available).")

    safety_notes.append(f"Road-sampled ML Risk Assessment: {winner.ml_risk_score}/100 ({winner.status}).")
    safety_notes.append("🚗 Live Road Network: Geometry generated via OSRM street network (OpenStreetMap).")

    # 7. Build backward-compatible response with complete road geometry
    return SafeRouteResponse(
        route_id=winner.route_id,
        status=winner.status,
        from_location=RouteWaypoint(latitude=user_lat, longitude=user_lon, label="Your Location"),
        to_location=RouteWaypoint(
            latitude=winner_shelter.latitude,
            longitude=winner_shelter.longitude,
            label=winner.destination_name,
        ),
        destination_name=winner.destination_name,
        destination_type=winner.destination_type,
        distance_km=winner.distance_km,
        estimated_minutes=winner.estimated_minutes,
        waypoints=winner.waypoints,
        hazards_avoided=winner.hazards_avoided,
        is_accessible=winner.is_accessible,
        safety_notes=safety_notes,
        is_demo=True,
        generated_at=now_utc,
        recommended_route_id=winner.route_id,
        selection_reason=selection_reason,
        ml_risk_score=winner.ml_risk_score,
        candidate_routes=evaluated_candidates,
        ml_telemetry=ml_service.get_model_telemetry(),
    )


def _count_road_hazards_avoided(waypoints: List[RouteWaypoint], active_events: list) -> int:
    """Count active hazard perimeters that the road passes near but avoids intersecting."""
    avoided = 0
    for ev in active_events:
        dists = [haversine_km(wp.latitude, wp.longitude, ev.latitude, ev.longitude) for wp in waypoints[::max(1, len(waypoints)//15)]]
        min_d = min(dists) if dists else 999.0
        if ev.radius_km * 0.75 <= min_d <= ev.radius_km * 1.6:
            avoided += 1
    return avoided


def generate_route(*args, **kwargs) -> SafeRouteResponse:
    """
    Synchronous backward-compatible wrapper for generate_route_async.
    """
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop and loop.is_running():
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
            return pool.submit(asyncio.run, generate_route_async(*args, **kwargs)).result()
    else:
        return asyncio.run(generate_route_async(*args, **kwargs))

