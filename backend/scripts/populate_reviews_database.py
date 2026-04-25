import os
import json
import random
import argparse
import requests
import time
from pymongo import MongoClient
from dotenv import load_dotenv
from pathlib import Path

# Setup paths relative to script
SCRIPT_DIR = Path(__file__).resolve().parent
DATA_DIR = SCRIPT_DIR / "data"
load_dotenv(SCRIPT_DIR.parent / ".env")

from helper.firebase_tool import get_firebase_id_token

# --- CONFIG ---
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")
FIREBASE_WEB_API_KEY = os.getenv("FIREBASE_WEB_API_KEY")
API_BASE_URL = "http://localhost:5001/api/phones"

def clear_all_reviews(db):
    """Wipes the reviews collection and resets phone metadata to zero."""
    print("Clearing existing reviews and resetting phone metadata...")
    
    # Delete all reviews
    rev_result = db.reviews.delete_many({})
    
    # Reset all phone metadata fields to default/empty state
    phone_result = db.phones.update_many({}, {
        "$set": {
            "totalReviews": 0,
            "aggregateRating": 0,
            "categoryAverages": {
                "camera": 0,
                "battery": 0,
                "design": 0,
                "performance": 0,
                "value": 0
            },
            "sentimentSummary": {
                "pros": [],
                "cons": [],
                "totalAnalyzed": 0
            }
        }
    })
    
    print(f"   Deleted {rev_result.deleted_count} reviews.")
    print(f"   Reset metadata for {phone_result.modified_count} phones.")

def run_api_seeder(chance, clear):
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    
    # Handle clearing database first if clear flag
    if clear:
        clear_all_reviews(db)

    # Load templates and accounts
    with open(DATA_DIR / "test_accounts.txt", "r") as f:
        accounts_list = [line.strip().split(" ") for line in f if line.strip()]
    with open(DATA_DIR / "review_templates.txt", "r") as f:
        templates = json.load(f)

    # We store tokens in a dictionary: { "email": "token_string" }
    print("Logging into test accounts and caching tokens...")
    token_cache = {}
    for email, password in accounts_list:
        token = get_firebase_id_token(email, password)
        if token:
            token_cache[email] = token
            print(f"   Token cached for {email}")
        time.sleep(0.5) # Sleep to rate limit on firebase

    if not token_cache:
        print("Could not authenticate any users. Quota might still be exceeded.")
        return

    # Review injection loop
    phones = list(db.phones.find({}, {"id": 1, "name": 1}))
    print(f"\nStarting injection for {len(phones)} phones...")

    success_count = 0

    for phone in phones:
        p_id = phone["id"]
        print(f"Processing: {phone['name']}")

        for email, _ in accounts_list:
            if random.random() > chance:
                continue

            # Reuse the token from our cache! No more hitting Firebase Auth.
            token = token_cache.get(email)
            if not token: continue

            tmpl = random.choice(templates)
            payload = {
                "title": tmpl["title"],
                "review": tmpl["review"],
                "categoryRatings": tmpl["ratings"]
            }
            
            headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
            
            try:
                response = requests.post(f"{API_BASE_URL}/{p_id}/reviews", json=payload, headers=headers)
                if response.status_code == 201:
                    print(f"   {email.split('@')[0]} posted: {tmpl['title'][:30]}...")
                    success_count += 1
                elif response.status_code == 409:
                    print(f"   {email.split('@')[0]} already reviewed.")
            except Exception as e:
                print(f"   Request failed: {e}")
            
            time.sleep(0.05) # Super fast because we are hitting our server

    print(f"\nDone! {success_count} reviews created.")
    client.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed reviews via Node.js API with token caching.")
    parser.add_argument("--chance", type=float, default=0.6, help="Chance (0.0 to 1.0) that a user reviews a phone")
    parser.add_argument("--clear", action="store_true", help="Clear all reviews and reset phone stats before seeding")
    args = parser.parse_args()

    if not FIREBASE_WEB_API_KEY:
        print("FIREBASE_WEB_API_KEY is missing from .env")
    else:
        run_api_seeder(args.chance, args.clear)
