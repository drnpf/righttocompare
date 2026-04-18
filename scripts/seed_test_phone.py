"""
Seed a single test phone into MongoDB for testing the aggregate rating system.
Phone ID: "mock-phone-x1"

Usage:
    python3 seed_test_phone.py
    python3 seed_test_phone.py --clear  # Remove the phone first
"""
import os
import argparse
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

MOCK_PHONE_ID = "mock-phone-x1"

MOCK_PHONE = {
    "id": MOCK_PHONE_ID,
    "name": "MockPhone X1 Pro",
    "brand": "MockTech",
    "releaseDate": datetime(2025, 1, 15),
    "price": 799,
    "images": {
        "main": "https://picsum.photos/seed/mockphone/400/600"
    },
    "specs": {
        "display": {
            "screenSizeInches": 6.5,
            "resolution": "2400x1080",
            "technology": "AMOLED",
            "refreshRateHz": 120,
            "peakBrightnessNits": 1800,
            "protection": "Gorilla Glass 6",
            "pixelDensityPpi": 403,
            "screenToBodyRatioPercent": 88.5,
        },
        "performance": {
            "processor": "MockChip Elite v1",
            "cpu": "Octa-core (1x3.2 GHz + 3x2.8 GHz + 4x2.0 GHz)",
            "gpu": "MockGPU Ultra",
            "ram": {"options": [8, 12], "technology": "LPDDR5X"},
            "storageOptions": [128, 256, 512],
            "expandableStorage": False,
            "operatingSystem": "Android 15",
            "upgradability": "4 years OS updates, 5 years security",
        },
        "benchmarks": {
            "geekbenchSingleCore": 1900,
            "geekbenchMultiCore": 5800,
            "antutuScore": 1200000,
        },
        "camera": {
            "mainMegapixels": 108,
            "ultrawideMegapixels": 12,
            "telephotoMegapixels": 10,
            "frontMegapixels": 16,
            "features": ["Night Mode", "4K Video", "OIS", "PDAF"],
        },
        "battery": {
            "capacitymAh": 5000,
            "chargingSpeedW": 65,
            "batteryType": "Li-Ion, non-removable",
            "wirelessCharging": True,
            "chargingTimeHours": 1.2,
        },
        "design": {
            "dimensionsMm": "160.2 x 74.5 x 8.2 mm",
            "weightGrams": 195,
            "buildMaterials": "Aluminum frame, Gorilla Glass front and back",
            "colorsAvailable": ["Midnight Black", "Arctic White", "Ocean Blue"],
        },
        "connectivity": {
            "has5G": True,
            "has4GLte": True,
            "bluetoothVersion": "5.3",
            "hasNfc": True,
            "headphoneJack": False,
        },
        "audio": {
            "speakers": "Stereo speakers",
            "hasHeadphoneJack": False,
            "audioFeatures": ["Dolby Atmos"],
        },
        "sensors": {
            "fingerprint": "Under-display optical",
            "faceRecognition": True,
            "accelerometer": True,
            "gyroscope": True,
            "proximity": True,
            "compass": True,
            "barometer": True,
        },
    },
    "carrierCompatibility": [
        {"name": "Verizon", "compatible": True, "notes": "Full 5G support"},
        {"name": "AT&T", "compatible": True, "notes": "Full 5G support"},
        {"name": "T-Mobile", "compatible": True, "notes": "Full 5G support"},
        {"name": "US Cellular", "compatible": True},
        {"name": "Mint Mobile", "compatible": True, "notes": "Runs on T-Mobile network"},
    ],
    "reviews": [],
}


def seed_test_phone(clear_first: bool = False):
    client = None
    try:
        client = MongoClient(MONGO_URI)
        print("Connected to MongoDB.")
        db = client[DB_NAME]
        phones = db.phones

        if clear_first:
            result = phones.delete_one({"id": MOCK_PHONE_ID})
            if result.deleted_count:
                print(f"Removed existing phone '{MOCK_PHONE_ID}'.")

        phones.update_one(
            {"id": MOCK_PHONE_ID},
            {"$set": MOCK_PHONE},
            upsert=True,
        )
        print(f"Upserted test phone '{MOCK_PHONE_ID}' into the database.")
        print("You can now visit /phones/mock-phone-x1 in the app to test ratings.")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        if client:
            client.close()
            print("Closed MongoDB connection.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed a test phone for aggregate rating testing.")
    parser.add_argument("--clear", action="store_true", help="Remove the existing test phone before seeding")
    args = parser.parse_args()
    seed_test_phone(args.clear)
