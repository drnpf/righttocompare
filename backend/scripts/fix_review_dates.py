import os
import random
import argparse
from datetime import datetime, timedelta
from pymongo import MongoClient, UpdateOne
from dotenv import load_dotenv
from pathlib import Path

# --- SETUP ---
SCRIPT_DIR = Path(__file__).resolve().parent
load_dotenv(SCRIPT_DIR.parent / ".env")

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

def fix_dates(days_back, recent_window):
    try:
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        reviews_col = db["reviews"]
        phones_col = db["phones"]

        # 1. Map phone release dates for quick lookup
        phone_releases = {p["id"]: p["releaseDate"] for p in phones_col.find({}, {"id": 1, "releaseDate": 1})}

        reviews = list(reviews_col.find({}))
        if not reviews: return

        print(f"Applying temporal-consistent backdating to {len(reviews)} reviews...")

        bulk_ops = []
        for review in reviews:
            p_id = review.get("phoneId")
            release_date = phone_releases.get(p_id, datetime.now() - timedelta(days=365))
            
            # The earliest a review can be is the release date
            days_since_release = (datetime.now() - release_date).days
            
            # Use the smaller of the two: your global days_back or the phone actual age
            max_back = min(days_back, days_since_release)
            # Adjust the recent window to not exceed the phone age
            current_window = min(recent_window, max_back)

            if random.random() > 0.3:
                target_days = random.randint(0, current_window)
            else:
                target_days = random.randint(current_window, max_back)

            new_date = datetime.now() - timedelta(
                days=target_days,
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59)
            )

            bulk_ops.append(
                UpdateOne({"_id": review["_id"]}, {"$set": {"date": new_date}})
            )

        if bulk_ops:
            reviews_col.bulk_write(bulk_ops)
            print(f"Successfully backdated reviews while respecting release dates.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Intelligent backdating for MongoDB review documents.")
    
    parser.add_argument("--days", type=int, default=180, 
                        help="Total days to look back from today (default: 180)")
    parser.add_argument("--window", type=int, default=60, 
                        help="The 'recent' cluster window in days (default: 60)")
    args = parser.parse_args()

    if args.window >= args.days:
        print("Warning: window is >= days. All reviews will be in the recent window.")
    fix_dates(days_back=args.days, recent_window=args.window)