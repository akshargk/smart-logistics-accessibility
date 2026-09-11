import httpx

client = httpx.Client(timeout=10)

# 1. Test /api/v1/route directly (Guwahati Riverfront to Sarusajai / GMCH)
res = client.post(
    'http://127.0.0.1:8000/api/v1/route',
    json={'latitude': 26.1820, 'longitude': 91.7420, 'prefer_accessible': False}
).json()

print("=" * 60)
print("LIVE /api/v1/route VERIFICATION")
print("=" * 60)
print(f"Recommended Destination: {res['destination_name']}")
print(f"Road Distance: {res['distance_km']} km | Estimated Time: ~{res['estimated_minutes']} min")
print(f"Total Road Coordinates Traced: {len(res['waypoints'])} points")
print(f"ML Risk Score: {res['ml_risk_score']}/100 ({res['status']})")
print(f"Candidate Routes Evaluated: {len(res['candidate_routes'])}")

for idx, c in enumerate(res['candidate_routes']):
    name = c['name']
    dest = c['destination_name']
    dist = c['distance_km']
    pts = len(c['waypoints'])
    stat = c['status']
    risk = c['ml_risk_score']
    rec = c['is_recommended']
    print(f"  [{idx+1}] {name} -> {dest}")
    print(f"      Distance: {dist} km | Road Points: {pts} | ML Risk: {risk} ({stat}) | Recommended: {rec}")

# 2. Test Flood Scenario
print("\n" + "=" * 60)
print("LIVE /api/v1/demo/scenario (FLOOD TRIGGERED) VERIFICATION")
print("=" * 60)
flood = client.post('http://127.0.0.1:8000/api/v1/demo/scenario', json={'scenario': 'flood'}).json()
f_route = flood['safe_route']
print(f"Recommended Destination: {f_route['destination_name']}")
print(f"Status: {f_route['status']} | ML Risk: {f_route['ml_risk_score']}/100")
print(f"Selection Reason: {f_route['selection_reason']}")
print(f"Candidates during flood:")
for idx, c in enumerate(f_route['candidate_routes']):
    name = c['name']
    dest = c['destination_name']
    dist = c['distance_km']
    pts = len(c['waypoints'])
    stat = c['status']
    risk = c['ml_risk_score']
    rec = c['is_recommended']
    print(f"  [{idx+1}] {name} -> {dest}")
    print(f"      Distance: {dist} km | Road Points: {pts} | ML Risk: {risk} ({stat}) | Recommended: {rec}")
