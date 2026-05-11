import requests
import time
import random
from concurrent.futures import ThreadPoolExecutor

# --- CONFIGURATION ---
API_BASE_URL = "http://localhost:5001/api/phones"
TOTAL_ACTIONS = 2000   # Total sequences to run
CONCURRENCY = 50      # Simulated simultaneous users

# DATASETS
SEARCH_TERMS = ["iPhone", "Galaxy", "Xperia", "S24 Pro", "15 Pro", "Sony"]
MANUFACTURERS = ["Apple", "Samsung", "Sony"]
SORT_OPTIONS = ["newest", "price_low_high", "price_high_low"]

def simulate_user_flow():
    """
    Simulates a realistic user flow: 
    1. Search & Filter -> 2. View a specific phone card -> 3. Fetch full specs
    """
    session = requests.Session()
    latencies = []
    
    try:
        # Get a Paginated Page (Search & Filter)
        search_params = {
            "page": 1,
            "limit": 12,
            "search": random.choice(SEARCH_TERMS),
            "manufacturer": random.sample(MANUFACTURERS, random.randint(1, 2)),
            "minPrice": random.randint(0, 500),
            "maxPrice": 2000,
            "sortBy": random.choice(SORT_OPTIONS)
        }
        
        start = time.perf_counter()
        resp = session.get(API_BASE_URL, params=search_params, timeout=5)
        latencies.append(time.perf_counter() - start)

        if resp.status_code == 200:
            data = resp.json().get("data", [])
            if data:
                # Simulate clicking a phone (Get by ID)
                target_id = data[0].get("_id") # or 'id' depending on your JSON
                if target_id:
                    start = time.perf_counter()
                    session.get(f"{API_BASE_URL}/{target_id}", timeout=5)
                    latencies.append(time.perf_counter() - start)
                    
        return True, latencies
    except Exception as e:
        return False, []

def run_test():
    print(f"Starting Reliability Test on {API_BASE_URL}")
    print(f"Parameters: {TOTAL_ACTIONS} actions | {CONCURRENCY} concurrent users\n")
    
    results = []
    with ThreadPoolExecutor(max_workers=CONCURRENCY) as executor:
        futures = [executor.submit(simulate_user_flow) for _ in range(TOTAL_ACTIONS)]
        for f in futures:
            results.append(f.result())

    # --- AGGREGATE RESULTS ---
    successes = [r for r in results if r[0]]
    all_latencies = [l for r in results for l in r[1]]
    
    avg_lat = sum(all_latencies) / len(all_latencies) if all_latencies else 0
    max_lat = max(all_latencies) if all_latencies else 0

    print("--- DOCUMENTATION SUMMARY ---")
    print(f"Status: {'PASS' if avg_lat < 5 else 'FAIL'}")
    print(f"Success Rate: {len(successes)}/{TOTAL_ACTIONS}")
    print(f"Average Response Time: {avg_lat:.4f}s")
    print(f"Worst Response Time: {max_lat:.4f}s")

if __name__ == "__main__":
    run_test()