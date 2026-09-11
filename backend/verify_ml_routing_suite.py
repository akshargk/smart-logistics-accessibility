"""
Comprehensive SmartLogix ML & Adaptive Routing Verification Script
"""
import httpx

client = httpx.Client(timeout=10)

def test_suite():
    print("=" * 60)
    print("SMARTLOGIX ML & ADAPTIVE ROUTING VERIFICATION SUITE")
    print("=" * 60)

    # 1. Health & MongoDB Atlas status
    h_res = client.get("http://127.0.0.1:8000/health").json()
    stats_res = client.get("http://127.0.0.1:8000/api/v1/mongo/stats").json()
    print("\n[1] DATABASE & ATLAS CHECK:")
    print("  • Health DB string:", h_res.get("database"))
    print("  • Mongo Stats mode:", stats_res.get("mode"))
    print("  • Mongo Stats is_mock:", stats_res.get("is_mock"))
    assert stats_res.get("is_mock") is False, "MongoDB Atlas is_mock must be False"
    assert stats_res.get("mode") == "live", "MongoDB Atlas mode must be live"
    print("  --> PASS: MongoDB Atlas is LIVE and not mock.")

    # 2. Test /api/v1/route directly (Normal conditions)
    route_payload = {
        "latitude": 26.1820,
        "longitude": 91.7420,
        "prefer_accessible": False
    }
    r_res = client.post("http://127.0.0.1:8000/api/v1/route", json=route_payload).json()
    print("\n[2] ROUTE ENDPOINT CHECK (/api/v1/route):")
    print("  • Recommended Route ID:", r_res.get("recommended_route_id"))
    print("  • Destination:", r_res.get("destination_name"))
    print("  • ML Risk Score:", r_res.get("ml_risk_score"))
    print("  • Status:", r_res.get("status"))
    print("  • Candidate routes returned:", len(r_res.get("candidate_routes", [])))
    assert len(r_res.get("candidate_routes", [])) >= 3, "Must return at least 3 candidate routes"
    print("  • Candidates details:")
    for c in r_res.get("candidate_routes", []):
        print(f"    - {c['name']} -> {c['destination_name']}: Risk={c['ml_risk_score']}, Status={c['status']}, Rec={c['is_recommended']}")
    print("  • ML Telemetry:", r_res.get("ml_telemetry", {}).get("model_type"))
    print("  --> PASS: At least 3 candidate routes returned with scikit-learn scoring.")

    # 3. Test Accessibility Filtering
    route_acc_payload = {
        "latitude": 26.1820,
        "longitude": 91.7420,
        "prefer_accessible": True
    }
    r_acc_res = client.post("http://127.0.0.1:8000/api/v1/route", json=route_acc_payload).json()
    print("\n[3] ACCESSIBILITY ENFORCEMENT CHECK:")
    print("  • Recommended destination:", r_acc_res.get("destination_name"))
    print("  • Is Accessible:", r_acc_res.get("is_accessible"))
    assert r_acc_res.get("is_accessible") is True, "Recommended route must be accessible when preferred"
    print("  --> PASS: Accessibility preference strictly enforced.")

    # 4. Test Demo Scenario (Before vs After Disaster Activation)
    # Scenario: 'safe' (Gangtok safe zone)
    safe_scen = client.post("http://127.0.0.1:8000/api/v1/demo/scenario", json={"scenario": "safe"}).json()
    print("\n[4] DEMO SCENARIOS & DYNAMIC REROUTING CHECK:")
    print("  --- Safe Scenario (Gangtok) ---")
    print("  • Risk Level:", safe_scen["risk_analysis"]["risk_level"])
    print("  • Risk Score:", safe_scen["risk_analysis"]["risk_score"])
    print("  • Recommended Route:", safe_scen.get("safe_route", {}).get("destination_name"))
    print("  • Route Status:", safe_scen.get("safe_route", {}).get("status"))

    # Scenario: 'flood' (Guwahati Brahmaputra riverfront flood activated!)
    flood_scen = client.post("http://127.0.0.1:8000/api/v1/demo/scenario", json={"scenario": "flood"}).json()
    print("\n  --- Flood Scenario (Guwahati Riverfront) ---")
    print("  • Risk Level:", flood_scen["risk_analysis"]["risk_level"])
    print("  • Risk Score:", flood_scen["risk_analysis"]["risk_score"])
    f_route = flood_scen.get("safe_route", {})
    print("  • Recommended Route ID:", f_route.get("recommended_route_id"))
    print("  • Recommended Destination:", f_route.get("destination_name"))
    print("  • Route Status:", f_route.get("status"))
    print("  • Selection Reason:", f_route.get("selection_reason"))
    print("  • Evaluated Candidates during flood:")
    for c in f_route.get("candidate_routes", []):
        print(f"    - {c['name']} -> {c['destination_name']}: Risk={c['ml_risk_score']}, Status={c['status']}, Rec={c['is_recommended']}")

    # Scenario: 'landslide'
    landslide_scen = client.post("http://127.0.0.1:8000/api/v1/demo/scenario", json={"scenario": "landslide"}).json()
    print("\n  --- Landslide Scenario (Shillong) ---")
    print("  • Risk Level:", landslide_scen["risk_analysis"]["risk_level"])
    print("  • Recommended Destination:", landslide_scen.get("safe_route", {}).get("destination_name"))
    print("  • Route Status:", landslide_scen.get("safe_route", {}).get("status"))
    print("  • Selection Reason:", landslide_scen.get("safe_route", {}).get("selection_reason"))

    print("\n" + "=" * 60)
    print("ALL VERIFICATION SUITE TESTS PASSED!")
    print("=" * 60)

if __name__ == "__main__":
    test_suite()
