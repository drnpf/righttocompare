import os
import random
from datetime import datetime, timedelta
from pymongo import MongoClient
from dotenv import load_dotenv
from pathlib import Path

# --- SETUP ---
SCRIPT_DIR = Path(__file__).resolve().parent
load_dotenv(SCRIPT_DIR.parent / ".env")

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

def fix_dates(days_back=180):
    try:
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        reviews_col = db["reviews"]

        print(f"Finding reviews to backdate...")
        reviews = list(reviews_col.find({}))
        
        if not reviews:
            print("No reviews found to modify.")
            return

        print(f"Backdating {len(reviews)} reviews over a {days_back}-day window...")

        count = 0
        for review in reviews:
            # Generate a random date between (Now) and (Now - days_back)
            random_days = random.randint(0, days_back)
            random_hours = random.randint(0, 23)
            random_minutes = random.randint(0, 59)
            
            new_date = datetime.now() - timedelta(
                days=random_days, 
                hours=random_hours, 
                minutes=random_minutes
            )

            # Direct update in MongoDB
            reviews_col.update_one(
                {"_id": review["_id"]},
                {"$set": {"date": new_date}}
            )
            count += 1

        print(f"Successfully updated {count} review timestamps.")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()
        print("MongoDB connection closed.")

if __name__ == "__main__":
    fix_dates(days_back=180)
