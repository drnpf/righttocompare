import re
from datetime import datetime
from pymongo import MongoClient, UpdateOne
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI") or "mongodb://localhost:27017"
DB_NAME = os.getenv("DB_NAME") or "test"

def parse_numeric(text):
    if not text or text is None: return 0
    match = re.search(r"(\d+\.?\d*)", str(text))
    return float(match.group(1)) if match else 0

def parse_storage(internal_str):
    if not internal_str: return []
    matches = re.findall(r"(\d+)(GB|TB)", str(internal_str))
    storage = []
    for val, unit in matches:
        n = int(val)
        if unit == "TB": n *= 1024
        if n not in storage: storage.append(n)
    return sorted(list(set(storage)))

def parse_ram(internal_str):
    if not internal_str: return []
    matches = re.findall(r"(\d+)GB\s*RAM", str(internal_str))
    return sorted(list(set([int(m) for m in matches])))

def get_benchmark(test_str, key):
    if not test_str: return 0
    pattern = rf"{key}:\s*(\d+)"
    match = re.search(pattern, str(test_str), re.IGNORECASE)
    return int(match.group(1)) if match else 0

def transform_to_prod(doc):
    raw = doc.get("raw", {}) or {}
    ext = doc.get("extracted", {}) or {}
    tests = raw.get("Our Tests", {}) or {}
    
    # Prices
    price_container = ext.get("price", {}) or {}
    prices_list = price_container.get("prices", []) or []
    
    price_val = 0
    if prices_list:
        # 1. Try to find USD first if it's already there
        usd_entry = next((p for p in prices_list if p.get("currency") == "USD"), None)
        
        if usd_entry:
            price_val = usd_entry.get("amount", 0)
        else:
            # 2. Convert the first available currency (likely EUR or GBP)
            first_price = prices_list[0]
            amount = first_price.get("amount", 0)
            currency = first_price.get("currency", "USD").upper()
            
            # Approx 2026 Conversion Rates
            conversion_rates = {
                "GBP": 1.28,
                "EUR": 1.09,
                "USD": 1.0
            }
            
            rate = conversion_rates.get(currency, 1.0)
            price_val = round(amount * rate, 2)

    cam_section = raw.get("Main Camera", {}) or {}
    cam_spec_str = ""
    for k in ['Single', 'Dual', 'Triple', 'Quad', 'Five']:
        if k in cam_section:
            cam_spec_str = str(cam_section[k])
            break
    
    main_mp = parse_numeric(cam_spec_str.split("MP")[0]) if "MP" in cam_spec_str else 0

    # Safety wrapper for Ultrawide
    uw_match = re.search(r"(\d+)\s*MP.*ultrawide", cam_spec_str, re.I)
    ultrawide = parse_numeric(uw_match.group(1)) if uw_match else 0

    # Safety wrapper for Telephoto
    tp_match = re.search(r"(\d+)\s*MP.*telephoto", cam_spec_str, re.I)
    telephoto = parse_numeric(tp_match.group(1)) if tp_match else 0

    selfie_section = raw.get("Selfie Camera", {}) or {}
    selfie_str = selfie_section.get("Single", "")

    feat_raw = raw.get("Features", {}) or {}
    sensors_str = feat_raw.get("Sensors", "").lower()
    charge_str = (raw.get("Battery", {}) or {}).get("Charging", "").lower()

    # Launch Date: Using ext['announcedParsed'] from Screenshot 1
    try:
        iso_date = ext.get("announcedParsed", "").replace('Z', '')
        rel_date = datetime.fromisoformat(iso_date) if iso_date else datetime.now()
    except:
        rel_date = datetime.now()

    return {
        "id": doc.get("sourceId", "unknown"),
        "name": ext.get("modelName") or "Unknown Model",
        "manufacturer": ext.get("brand") or "Unknown Brand",
        "releaseDate": rel_date,
        "price": price_val,
        "images": { "main": ext.get("imageUrl") or "" },
        "totalReviews": 0,
        "aggregateRating": 0,
        "categoryAverages": {"camera": 0, "battery": 0, "design": 0, "performance": 0, "value": 0},
        "sentimentSummary": {"pros": [], "cons": [], "totalAnalyzed": 0},
        "specs": {
            "display": {
                "screenSizeInches": ext.get("displaySizeIn", 0),
                "resolution": (raw.get("Display", {}) or {}).get("Resolution", "Unknown"),
                "technology": (raw.get("Display", {}) or {}).get("Type", "").split(",")[0] or "OLED",
                "refreshRateHz": ext.get("refreshRateHz", 60),
                # Pulling measured brightness from "Our Tests" (Screenshot 2)
                "peakBrightnessNits": parse_numeric(tests.get("Display", "800").split("nits")[0]),
                "protection": (raw.get("Display", {}) or {}).get("Protection", "None"),
                "pixelDensityPpi": parse_numeric((raw.get("Display", {}) or {}).get("Resolution", "").split("~")[-1]) or 400,
            },
            "performance": {
                "processor": ext.get("chipset", "Unknown"),
                "cpu": (raw.get("Platform", {}) or {}).get("CPU", ""),
                "gpu": (raw.get("Platform", {}) or {}).get("GPU", ""),
                "ram": {
                    "options": parse_ram((raw.get("Memory", {}) or {}).get("Internal", "")),
                    "technology": "LPDDR5"
                },
                "storageOptions": parse_storage((raw.get("Memory", {}) or {}).get("Internal", "")),
                "operatingSystem": ext.get("os", "Android"),
                "expandableStorage": "no" not in (raw.get("Memory", {}) or {}).get("Card slot", "").lower(),
            },
            "benchmarks": {
                "antutuScore": get_benchmark(tests.get("Performance", ""), "AnTuTu"),
                "geekbenchMultiCore": get_benchmark(tests.get("Performance", ""), "GeekBench"),
                "geekbenchSingleCore": 0 
            },
            "camera": {
                "mainMegapixels": main_mp,
                "ultrawideMegapixels": ultrawide,
                "telephotoMegapixels": telephoto,
                "frontMegapixels": parse_numeric(selfie_str.split("MP")[0]) if "MP" in str(selfie_str) else 0,
                "features": cam_section.get("Features", "").split(", ") if cam_section.get("Features") else []
            },
            "battery": {
                "capacitymAh": ext.get("batteryMah", 0),
                "chargingSpeedW": parse_numeric(charge_str.split("wired")[0]) or 30,
                "batteryType": "Li-Po",
                "wirelessCharging": "wireless" in charge_str,
            },
            "design": {
                "dimensionsMm": (raw.get("Body", {}) or {}).get("Dimensions", "N/A"),
                "weightGrams": parse_numeric((raw.get("Body", {}) or {}).get("Weight", "0")),
                "buildMaterials": (raw.get("Body", {}) or {}).get("Build", "Not specified"),
                "colorsAvailable": (raw.get("Misc", {}) or {}).get("Colors", "Standard").split(", ")
            },
            "connectivity": {
                "has5G": ext.get("has5g", False),
                "bluetoothVersion": (raw.get("Comms", {}) or {}).get("Bluetooth", "5.3").split(",")[0],
                "hasNfc": "yes" in (raw.get("Comms", {}) or {}).get("NFC", "").lower(),
                "headphoneJack": "yes" in (raw.get("Sound", {}) or {}).get("3.5mm jack", "").lower()
            },
            "sensors": {
                "fingerprint": (raw.get("Features", {}) or {}).get("Sensors", "").split(",")[0],
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
    source_col = db["scrape_output"] 
    destination_col = db["phones_test2"] 

    print(f"--- Starting Migration ---")
    ops = []
    for raw_doc in source_col.find():
        try:
            prod_data = transform_to_prod(raw_doc)
            ops.append(UpdateOne({"id": prod_data["id"]}, {"$set": prod_data}, upsert=True))
        except Exception as e:
            print(f"Failed to transform {raw_doc.get('sourceId')}: {e}")

    if ops:
        res = destination_col.bulk_write(ops)
        print(f"Upserted: {res.upserted_count}, Modified: {res.modified_count}")

if __name__ == "__main__":
    run_migration()