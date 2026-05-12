import os
import json
import random
import argparse
import requests
import time
from pymongo import MongoClient
from dotenv import load_dotenv
from pathlib import Path

# Setup paths
SCRIPT_DIR = Path(__file__).resolve().parent
DATA_DIR = SCRIPT_DIR / "data"
load_dotenv(SCRIPT_DIR.parent / ".env")

from helper.firebase_tool import get_firebase_id_token

# --- CONFIG ---
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME") or "test"
# Use the dynamic collection name we added to .env
PHONE_COLLECTION = os.getenv("PHONE_COLLECTION") or "phones" 
FIREBASE_WEB_API_KEY = os.getenv("FIREBASE_WEB_API_KEY")
API_BASE_URL = "http://localhost:5001/api/phones"
INTERNAL_BYPASS_KEY = os.getenv("INTERNAL_BYPASS_KEY")

def clear_all_reviews(db):
    print(f"Clearing reviews and resetting metadata in {PHONE_COLLECTION}...")
    db.reviews.delete_many({})
    db[PHONE_COLLECTION].update_many({}, {
        "$set": {
            "totalReviews": 0, "aggregateRating": 0,
            "categoryAverages": {"camera": 0, "battery": 0, "design": 0, "performance": 0, "value": 0},
            "sentimentSummary": {"pros": [], "cons": [], "totalAnalyzed": 0}
        }
    })

def run_api_seeder(chance, clear):
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    
    if clear: clear_all_reviews(db)

    with open(DATA_DIR / "test_accounts.txt", "r") as f:
        accounts_list = [line.strip().split(" ") for line in f if line.strip()]
    with open(DATA_DIR / "review_templates.txt", "r") as f:
        templates = json.load(f)

    print("Authenticating test accounts...")
    token_cache = {email: get_firebase_id_token(email, pw) for email, pw in accounts_list}
    token_cache = {k: v for k, v in token_cache.items() if v}

    # Fetching phones with enough specs to do "Smart Filtering"
    phones = list(db[PHONE_COLLECTION].find({}, {
        "id": 1, "name": 1, "price": 1, 
        "specs.camera.telephotoMegapixels": 1,
        "specs.display.screenSizeInches": 1
    }))
    
    print(f"\nStarting seeding for {len(phones)} phones...")
    success_count = 0

    for phone in phones:
        p_id = phone["id"]
        price = phone.get("price", 0)
        has_telephoto = phone.get("specs", {}).get("camera", {}).get("telephotoMegapixels", 0) > 0
        phone_review_count = 0 # Reset per phone to manage NLP trigger

        # --- SMART FILTERING ---
        suitable_templates = []
        for t in templates:
            tags = t.get("tags", [])
            if "flagship" in tags and price < 700: continue
            if "budget" in tags and price > 350: continue
            if "camera" in tags and not has_telephoto: continue
            suitable_templates.append(t)
        
        pool = suitable_templates if suitable_templates else templates

        for email, _ in accounts_list:
            if random.random() > chance: continue
            token = token_cache.get(email)
            if not token: continue

            tmpl = random.choice(pool)
            payload = {
                "title": tmpl["title"],
                "review": tmpl["review"],
                "categoryRatings": tmpl["ratings"]
            }
            
            headers = {
                "Authorization": f"Bearer {token}", 
                "Content-Type": "application/json"
            }

            # TRIGGER LOGIC:
            # First 2 reviews for EVERY phone get analyzed (no bypass).
            # Everything else uses the bypass to keep the script fast.
            if phone_review_count >= 2:
                headers["x-internal-bypass"] = INTERNAL_BYPASS_KEY
            else:
                print(f"   [NLP TRIGGER] Analyzing sentiment for {phone['name']}...")

            try:
                response = requests.post(f"{API_BASE_URL}/{p_id}/reviews", json=payload, headers=headers)
                if response.status_code == 201:
                    success_count += 1
                    phone_review_count += 1
            except Exception as e:
                print(f"   Error: {e}")
            
            time.sleep(0.02) # Fast, local hit

    print(f"\nSeeding Complete: {success_count} reviews created across {len(phones)} phones.")
    client.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--chance", type=float, default=0.6)
    parser.add_argument("--clear", action="store_true")
    args = parser.parse_args()
    run_api_seeder(args.chance, args.clear)