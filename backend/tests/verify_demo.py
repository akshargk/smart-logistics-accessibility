"""Quick verification of all demo scenarios and the dashboard."""
import asyncio, httpx, sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

async def check():
    async with httpx.AsyncClient(base_url='http://127.0.0.1:8000', timeout=15) as c:

        # ── FLOOD SCENARIO ──────────────────────────────────────
        r = await c.post('/api/v1/demo/scenario', json={'scenario': 'flood'})
        d = r.json()
        ra = d['risk_analysis']
        sr = d['safe_route']
        print('=== FLOOD SCENARIO ===')
        print(f"  status_code  : {r.status_code}")
        print(f"  risk_level   : {ra['risk_level']}")
        print(f"  risk_score   : {ra['risk_score']}")
        print(f"  factors      : {len(ra['factors'])} factors")
        print(f"  nearby_events: {len(ra['nearby_events'])} events")
        print(f"  alerts       : {len(d['alerts'])}")
        if d['alerts']:
            print(f"  alert_title  : {d['alerts'][0]['title']}")
        print(f"  route_dest   : {sr['destination_name']}")
        print(f"  route_km     : {sr['distance_km']} km")
        print(f"  route_status : {sr['status']}")
        print(f"  route_access : {sr['is_accessible']}")
        print(f"  disclaimer   : {d['disclaimer'][:55]}...")

        # ── SAFE SCENARIO ────────────────────────────────────────
        r2 = await c.post('/api/v1/demo/scenario', json={'scenario': 'safe'})
        d2 = r2.json()
        ra2 = d2['risk_analysis']
        print('\n=== SAFE SCENARIO ===')
        print(f"  status_code  : {r2.status_code}")
        print(f"  risk_level   : {ra2['risk_level']}")
        print(f"  risk_score   : {ra2['risk_score']}")
        print(f"  alerts       : {len(d2['alerts'])}")
        print(f"  safe_route   : {d2['safe_route']}")

        # ── MULTI-HAZARD SCENARIO ────────────────────────────────
        r3 = await c.post('/api/v1/demo/scenario', json={'scenario': 'multi_hazard'})
        d3 = r3.json()
        ra3 = d3['risk_analysis']
        print('\n=== MULTI-HAZARD SCENARIO ===')
        print(f"  risk_level   : {ra3['risk_level']}")
        print(f"  risk_score   : {ra3['risk_score']}")
        print(f"  reason       : {ra3['reason'][:80]}...")
        for f in ra3['factors']:
            print(f"    factor [{f['contribution']:5.1f}]: {f['factor']}")

        # ── DASHBOARD ────────────────────────────────────────────
        r4 = await c.get('/api/v1/demo/dashboard')
        d4 = r4.json()
        print('\n=== DEMO DASHBOARD ===')
        print(f"  status_code      : {r4.status_code}")
        print(f"  backend_status   : {d4['backend_status']}")
        print(f"  active_events    : {d4['active_events_count']}")
        print(f"  active_alerts    : {d4['active_alerts_count']}")
        print(f"  safe_locations   : {d4['safe_locations_count']}")
        print(f"  demo_mode        : {d4['demo_mode']}")

        # ── API DOCS ─────────────────────────────────────────────
        r5 = await c.get('/docs')
        r6 = await c.get('/redoc')
        print('\n=== DOCS ===')
        print(f"  /docs  : {r5.status_code}")
        print(f"  /redoc : {r6.status_code}")

        print('\nAll checks complete.')

asyncio.run(check())
