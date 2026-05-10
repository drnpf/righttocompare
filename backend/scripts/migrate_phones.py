import re
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

def parse_numeric(text):
    if not text or text is None: return 0
    match = re.search(r"(\d+\.?\d*)", str(text))
    return float(match.group(1)) if match else 0

def parse_storage(internal_str):
    if not internal_str: return []
    matches = re.findall(r"(\d+)(GB|TB)", internal_str)
    storage = []
    for val, unit in matches:
        n = int(val)
        if unit == "TB": n *= 1024
        if n not in storage: storage.append(n)
    return sorted(list(set(storage)))

def parse_ram(internal_str):
    if not internal_str: return []
    matches = re.findall(r"(\d+)GB\s*RAM", internal_str)
    return sorted(list(set([int(m) for m in matches])))

def get_benchmark(test_str, key):
    # Parses "AnTuTu: 2430575 (v10)" or "GeekBench: 9923 (v6)"
    if not test_str: return 0
    pattern = rf"{key}:\s*(\d+)"
    match = re.search(pattern, test_str, re.IGNORECASE)
    return int(match.group(1)) if match else 0

def transform_to_prod(doc):
    raw = doc.get("raw", {})
    ext = doc.get("extracted", {})
    tests = raw.get("Our Tests", {})
    
    prices = doc.get("prices", [])
    price_val = prices[0].get("amount", 0) if prices else 0

    cam_section = raw.get("Main Camera", {})
    main_cam_str = next((v for k, v in cam_section.items() if k in ['Single', 'Dual', 'Triple', 'Quad', 'Five']), "")
    main_mp = parse_numeric(main_cam_str.split("MP")[0]) if "MP" in main_cam_str else 0
    
    selfie_section = raw.get("Selfie camera", {})
    selfie_str = next((v for k, v in selfie_section.items() if k in ['Single', 'Dual']), "")

    feat_raw = raw.get("Features", {})
    sensors_str = feat_raw.get("Sensors", "").lower()
    charge_str = raw.get("Battery", {}).get("Charging", "").lower()

    return {
        "id": doc.get("sourceId", "unknown"),
        "name": ext.get("modelName"),
        "manufacturer": ext.get("brand"),
        "releaseDate": datetime.fromisoformat(ext.get("announcedParsed").replace('Z', '')),
        "price": price_val,
        "images": { 
            "main": ext.get("imageUrl") or "https://placehold.co/600x400?text=No+Image+Available" 
        },
        "totalReviews": 0,
        "aggregateRating": 0,
        "categoryAverages": {"camera": 0, "battery": 0, "design": 0, "performance": 0, "value": 0},
        "sentimentSummary": {"pros": [], "cons": [], "totalAnalyzed": 0},

        "specs": {
            "display": {
                "screenSizeInches": ext.get("displaySizeIn", 0),
                "resolution": raw.get("Display", {}).get("Resolution", "Unknown"),
                "technology": raw.get("Display", {}).get("Type", "").split(",")[0],
                "refreshRateHz": ext.get("refreshRateHz", 60),
                "peakBrightnessNits": parse_numeric(raw.get("Display", {}).get("Type", "").split("nits")[0].split(",")[-1]) or 800,
                "protection": raw.get("Display", {}).get("Protection", "None"),
                "pixelDensityPpi": parse_numeric(raw.get("Display", {}).get("Resolution", "").split("~")[-1]) or 400,
            },
            "performance": {
                "processor": ext.get("chipset", "Unknown"),
                "cpu": raw.get("Platform", {}).get("CPU", ""),
                "gpu": raw.get("Platform", {}).get("GPU", ""),
                "ram": {
                    "options": parse_ram(raw.get("Memory", {}).get("Internal", "")),
                    "technology": "LPDDR5X"
                },
                "storageOptions": parse_storage(raw.get("Memory", {}).get("Internal", "")),
                "operatingSystem": ext.get("os", "Android"),
                "expandableStorage": "no" not in raw.get("Memory", {}).get("Card slot", "").lower(),
            },
            "benchmarks": {
                "antutuScore": get_benchmark(tests.get("Performance", ""), "AnTuTu"),
                "geekbenchMultiCore": get_benchmark(tests.get("Performance", ""), "GeekBench"),
                "geekbenchSingleCore": 0 
            },
            "camera": {
                "mainMegapixels": main_mp,
                "frontMegapixels": parse_numeric(selfie_str.split("MP")[0]) if "MP" in selfie_str else 0,
                "features": cam_section.get("Features", "").split(", ")
            },
            "battery": {
                "capacitymAh": ext.get("batteryMah", 0),
                "chargingSpeedW": parse_numeric(charge_str.split("wired")[0]) or 25,
                "batteryType": raw.get("Battery", {}).get("Type", "Li-Ion"),
                "wirelessCharging": "wireless" in charge_str,
            },
            "connectivity": {
                "has5G": ext.get("has5g", False),
                "bluetoothVersion": raw.get("Comms", {}).get("Bluetooth", "5.3").split(",")[0],
                "hasNfc": "yes" in raw.get("Comms", {}).get("NFC", "").lower(),
                "headphoneJack": "yes" in raw.get("Sound", {}).get("3.5mm jack", "").lower()
            },
            "sensors": {
                "fingerprint": raw.get("Features", {}).get("Sensors", "").split(",")[0],
                "faceRecognition": any(x in sensors_str for x in ["face id", "face recognition"]),
                "accelerometer": "accelerometer" in sensors_str,
                "gyroscope": "gyro" in sensors_str,
                "proximity": True, "compass": True, "barometer": True
            }
        },
        "carrierCompatibility": [
            {"name": "Verizon", "compatible": True},
            {"name": "AT&T", "compatible": True},
            {"name": "T-Mobile", "compatible": True}
        ]
    }

def run_migration():
    client = MongoClient(MONGO_URI) 
    db = client[DB_NAME]
    
    # Collections
    source_col = db["scrape_output"] 
    destination_col = db["phones_test"] 

    print(f"--- Starting Migration ---")
    print(f"Source: {source_col.name} | Target: {destination_col.name}")

    count = 0
    for raw_doc in source_col.find():
        try:
            # Converts scraped data to production data
            prod_data = transform_to_prod(raw_doc)
            
            # Updates (or inserts new) phone to production documnet
            destination_col.update_one(
                {"id": prod_data["id"]},
                {"$set": prod_data},
                upsert=True
            )
            
            print(f"Migrated: {prod_data['name']}")
            count += 1
            
        except Exception as e:
            print(f"Failed to migrate {raw_doc.get('sourceId', 'Unknown')}: {e}")

    print(f"{count} phones processed.")

if __name__ == "__main__":
    run_migration()