import time
import httpx

BASE_URL = "http://127.0.0.1:8000/api/v1"
test_lat, test_lon = 26.182, 91.742

def benchmark():
    print("Benchmarking current endpoints...")
    with httpx.Client(timeout=30.0) as client:
        # 1. Risk Analyse
        t0 = time.perf_counter()
        resp_risk = client.post(f"{BASE_URL}/risk/analyse", json={"latitude": test_lat, "longitude": test_lon})
        t1 = time.perf_counter()
        risk_time = t1 - t0
        print(f"1. /risk/analyse: status={resp_risk.status_code}, time={risk_time:.3f}s")

        # 2. Alerts Generate
        t0 = time.perf_counter()
        resp_alerts = client.post(f"{BASE_URL}/alerts/generate", json={"latitude": test_lat, "longitude": test_lon})
        t1 = time.perf_counter()
        alerts_time = t1 - t0
        print(f"2. /alerts/generate: status={resp_alerts.status_code}, time={alerts_time:.3f}s")

        # 3. Route
        t0 = time.perf_counter()
        resp_route = client.post(f"{BASE_URL}/route", json={"latitude": test_lat, "longitude": test_lon, "prefer_accessible": False})
        t1 = time.perf_counter()
        route_time = t1 - t0
        print(f"3. /route: status={resp_route.status_code}, time={route_time:.3f}s")

        # 4. Total parallel as frontend does it:
        t0 = time.perf_counter()
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
            f1 = executor.submit(client.post, f"{BASE_URL}/risk/analyse", json={"latitude": test_lat, "longitude": test_lon})
            f2 = executor.submit(client.post, f"{BASE_URL}/alerts/generate", json={"latitude": test_lat, "longitude": test_lon})
            f3 = executor.submit(client.post, f"{BASE_URL}/route", json={"latitude": test_lat, "longitude": test_lon, "prefer_accessible": False})
            f1.result()
            f2.result()
            f3.result()
        t1 = time.perf_counter()
        total_time = t1 - t0
        print(f"Total Promise.all equivalent time: {total_time:.3f}s")

if __name__ == "__main__":
    benchmark()
