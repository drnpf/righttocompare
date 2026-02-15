import os
import re
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime, timedelta
import random


# Loading environment variables from .env file
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

# Seeding RNG
seed = 8
random.seed(seed)


def get_mongodb_client():
    try: # Gets MongoDB client
        client = MongoClient(MONGO_URI)
        print("SUCCESSFULLY connected to MongoDB.")
        return client
    except Exception as e:
        print(f"An error occurred: {e}")
        return None


def generate_mock_phones(num_phones=12):
    manufacturers = ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi']
    mock_phones = []

    # Generates mock phones
    for i in range(1, num_phones + 1):
        manufacturer = random.choice(manufacturers)

        # Generates a random release date in the last 2 years
        release_date = datetime.now() - timedelta(days=random.randint(0, 365*2))
        
        phone = {
            "id": f"{manufacturer.lower()}-x{i}-pro",
            "name": f"{manufacturer} X{i} Pro",
            "manufacturer": manufacturer,
            "releaseDate": release_date,
            "price": random.choice([699, 799, 899, 999, 1099, 1199]),
            "images": {"main": f"https://picsum.photos/seed/phone{i}/400/600"}, # using a random pic from picsum
            "specs": {
                "display": {
                    "screenSizeInches": round(random.uniform(6.1, 6.9), 1),
                    "resolution": f"{random.choice([1080, 1440, 2160, 3200])}x{random.choice([2400, 3200, 3840])}",
                    "technology": random.choice(["OLED", "AMOLED", "LCD"]),
                    "refreshRateHz": random.choice([60, 90, 120]),
                    "peakBrightnessNits": random.randint(1500, 2600)
                },
                "performance": {
                    "processor": f"MockChip v{random.randint(1, 5)}",
                    "cpu": f"{random.randint(2, 8)}-core CPU",
                    "gpu": f"MockGPU v{random.randint(1, 5)}",
                    "ram": {"options": [8, 12], "technology": "LPDDR5X"},
                    "storageOptions": [128, 256, 512],
                    "operatingSystem": f"Android {random.choice(['12', '13', '14'])}"
                },
                "benchmarks": {
                    "geekbenchSingleCore": random.randint(1500, 2500),
                    "geekbenchMultiCore": random.randint(5000, 7500),
                    "antutuScore": random.randint(1000000, 1600000)
                },
                "camera": {
                    "mainMegapixels": random.choice([48, 50, 108, 200]),
                    "frontMegapixels": 12
                },
                "battery": {
                    "capacitymAh": random.choice([4500, 5000]),
                    "chargingSpeedW": random.choice([25, 45, 65, 80]),
                    "batteryType": "Li-Ion",
                    "wirelessCharging": random.choice([True, False])
                },
                "connectivity": {
                    "has5G": True,
                    "bluetoothVersion": "5.3",
                    "hasNfc": True,
                    "headphoneJack": False
                },
                "sensors": {
                    "fingerprint": "Under-display",
                    "faceRecognition": True,
                    "accelerometer": True,
                    "gyroscope": True,
                    "proximity": True,
                    "compass": True,
                    "barometer": True
                }
            },
            "carrierCompatibility": [
                {"name": "Verizon", "compatible": True},
                {"name": "T-Mobile", "compatible": True}
            ],
            "reviews": []
        }
        mock_phones.append(phone)
    return mock_phones


def populate_phone_db():
    try: # Attempting to connect Mongo client to DB and add mock phones
        client = get_mongodb_client()
        if client is None: return

        db = client[DB_NAME]
        phones_collection = db.phones

        # Generates and upserts mock phones into DB (update or insert if not exist)
        mock_phones = generate_mock_phones()
        for phone in mock_phones:
            phones_collection.update_one({"id": phone["id"]}, {"$set": phone}, upsert=True)
        print(f"Successfully upserted {len(mock_phones)} mock phones into the database.")

    except Exception as e: # Handles failure to connect to Mongo client
        print(f"An error occurred: {e}")

    finally: # Closing Mongo client
        if client:
            client.close()
            print("Closed MongoDB connection.")


if __name__ == "__main__":
    populate_phone_db()
