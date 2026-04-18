import os
import argparse
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
    manufacturers = ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Sony', 'Asus']
    # Pools for random selection
    ram_pool = [6, 8, 12, 16, 18, 24]
    storage_pool = [128, 256, 512, 1024]
    
    mock_phones = []

    for i in range(1, num_phones + 1):
        manufacturer = random.choice(manufacturers)
        
        # Apple must have iOS and others have Android
        is_apple = manufacturer == 'Apple'
        os_name = f"iOS {random.choice(['16', '17', '18'])}" if is_apple else f"Android {random.choice(['13', '14', '15'])}"
        
        # Picks a random number of options (1 to 3) from the pools and sorts them
        phone_ram = sorted(random.sample(ram_pool, k=random.randint(1, 3)))
        phone_storage = sorted(random.sample(storage_pool, k=random.randint(1, 3)))

        # Generates a random release date in the last 2 years
        release_date = datetime.now() - timedelta(days=random.randint(0, 365*2))
        
        # Establishing a random pool of carriers
        carrier_pool = [
            "Verizon", "T-Mobile", "AT&T", "Google Fi", 
            "Mint Mobile", "Visible", "Cricket", "Boost Mobile", 
            "US Cellular", "Metro by T-Mobile"
        ]
        selected_carriers = random.sample(carrier_pool, k=random.randint(4, 7))

        # Randomly picking carrier compatibility/incompatibility
        carrier_compatibility = []
        for carrier in selected_carriers:
            is_compatible = random.choices([True, False], weights=[85, 15])[0]
            carrier_compatibility.append({
                "name": carrier, 
                "compatible": is_compatible
            })

        # Creating the phone
        phone = {
            "id": f"{manufacturer.lower()}-x{i}-pro",
            "name": f"{manufacturer} X{i} Pro",
            "manufacturer": manufacturer,
            "releaseDate": release_date,
            "price": random.randint(399, 1899), 
            "images": {"main": f"https://picsum.photos/seed/phone{i}/400/600",},
            "specs": {
                "display": {
                    "screenSizeInches": round(random.uniform(5.4, 6.9), 1), # Added small phone support
                    "resolution": f"{random.choice([1080, 1440, 2160])}x{random.choice([2340, 3120, 3840])}",
                    "technology": random.choice(["OLED", "AMOLED", "Super Retina XDR", "Dynamic AMOLED"]),
                    "refreshRateHz": random.choice([60, 90, 120, 144, 165]), # Added gaming refresh rates
                    "peakBrightnessNits": random.randint(1000, 3000),
                    "pixelDensityPpi": random.randint(300, 600),
                },
                "performance": {
                    "processor": f"{'A' if is_apple else 'Snapdragon '} {random.randint(12, 18)}",
                    "cpu": f"{random.randint(6, 10)}-core CPU",
                    "gpu": f"{manufacturer} GPU v{random.randint(1, 5)}",
                    "ram": {
                        "options": phone_ram, # Variable RAM
                        "technology": random.choice(["LPDDR5", "LPDDR5X"])
                    },
                    "storageOptions": phone_storage, # Variable Storage
                    "operatingSystem": os_name,
                    "expandableStorage": random.choice([True, False]) if not is_apple else False,
                },
                "benchmarks": {
                    "geekbenchSingleCore": random.randint(1500, 3000),
                    "geekbenchMultiCore": random.randint(4000, 9000),
                    "antutuScore": random.randint(800000, 2000000),
                },
                "camera": {
                    "mainMegapixels": random.choice([12, 48, 50, 108, 200]),
                    "ultrawideMegapixels": random.choice([None, 12, 16, 48]),
                    "telephotoMegapixels": random.choice([None, 10, 12, 48, 64]),
                    "frontMegapixels": random.choice([12, 32, 40]),
                    "features": random.sample(["Night Mode", "OIS", "8K Video", "Macro", "RAW support"], 3)
                },
                "battery": {
                    "capacitymAh": random.randint(3000, 6000),
                    "chargingSpeedW": random.choice([20, 25, 45, 65, 80, 120]),
                    "batteryType": "Li-Po",
                    "wirelessCharging": random.choice([True, False]),
                },
                "design": {
                    "dimensionsMm": f"{random.uniform(140, 170):.1f} x {random.uniform(68, 78):.1f} x {random.uniform(7, 9.5):.1f} mm",
                    "weightGrams": random.randint(160, 240),
                    "buildMaterials": random.choice(["Glass/Titanium", "Glass/Aluminum", "Eco-Leather", "Plastic"]),
                    "colorsAvailable": random.sample(["Midnight", "Starlight", "Titanium Grey", "Forest Green", "Deep Sea Blue"], 3),
                },
                "connectivity": {
                    "has5G": True,
                    "bluetoothVersion": random.choice(["5.0", "5.3", "5.4"]),
                    "hasNfc": True,
                    "headphoneJack": random.choice([True, False]) if not is_apple else False,
                },
                "sensors": {
                    "fingerprint": random.choice(["Under-display", "Side-mounted", "None"]),
                    "faceRecognition": True,
                    "accelerometer": True,
                    "gyroscope": True,
                    "proximity": True,
                    "compass": True,
                    "barometer": random.choice([True, False]),
                }
            },
            "carrierCompatibility": carrier_compatibility,
            "reviews": [],
        }
        mock_phones.append(phone)
    return mock_phones

def populate_phone_db(num_phones=12, clear_first=False):
    try: # Attempting to connect Mongo client to DB and add mock phones
        client = get_mongodb_client()
        if client is None: return

        db = client[DB_NAME]
        phones_collection = db.phones

        # Deletes existing phones in DB if --clear flag is set
        if clear_first:
            delete_result = phones_collection.delete_many({})
            print(f"Cleared existing phones in the database. Deleted {delete_result.deleted_count} documents.")

        # Generates and upserts mock phones into DB (update or insert if not exist)
        mock_phones = generate_mock_phones(num_phones)
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
    parser = argparse.ArgumentParser(description="Populate the phone database with mock data.")
    parser.add_argument("--numPhones", type=int, default=12, help="Number of mock phones to generate (default: 12)")
    parser.add_argument("--clear", action="store_true", help="Clear existing phones in the database before populating")
    args = parser.parse_args()
    populate_phone_db(args.numPhones, args.clear)
