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
    matches = re.findall(r"(\d+)(GB|TB)(?!\s*RAM)", str(internal_str))
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
    pattern = rf"{key}:\s*([\d,]+)"
    matches = re.findall(pattern, str(test_str), re.IGNORECASE)
    if not matches:
        return 0
    scores = [int(m.replace(",", "")) for m in matches]
    return max(scores)

def parse_os_version(os_str):
    if not os_str: return 0
    # Specifically looking for the first digit after "Android" or "iOS"
    match = re.search(r"(?:Android|iOS)\s*(\d+)", str(os_str), re.I)
    return int(match.group(1)) if match else 0

def parse_build_materials(body_raw_dict):
    """Detects and returns a comma-separated list of premium materials."""
    build_str = (body_raw_dict or {}).get("Build", "").lower()
    materials = []
    
    if "glass" in build_str: materials.append("Glass")
    if "aluminum" in build_str: materials.append("Aluminum")
    if "titanium" in build_str: materials.append("Titanium")
    if "plastic" in build_str: materials.append("Polycarbonate")
    return ", ".join(materials) if materials else "Premium Composite"

def check_us_compatibility(network_doc):
    bands = str(network_doc.get("bands4G", "")) + str(network_doc.get("bands5G", ""))
    # Common US Band markers often found in GSMArena strings
    us_markers = ["12", "13", "17", "66", "71", "n260", "n261"]
    return any(m in bands for m in us_markers) or "usa" in bands.lower()

def calculate_msrp(prices_list):
    """
    Parses price from scraped output to determine MSRP. Prioritizes USD but
    if USD is 15% off from global maximum price of phone (that are plausible)
    then USD pricing is most likely not MSRP price.
    """
    if not prices_list:
        return 0

    rates = {"USD": 1.0, "GBP": 1.28, "EUR": 1.09, "CAD": 0.74, "INR": 0.012}
    plausible_entries = []

    for p in prices_list:
        curr = p.get("currency", "USD").upper()
        amt = p.get("amount", 0)
        usd_val = amt * rates.get(curr, 1.0)
        
        # Checks if price is within a plausible range for phones
        if 50 < usd_val < 2500:
            plausible_entries.append({"val": usd_val, "is_native": (curr == "USD")})

    if not plausible_entries:
        return 0

    # Gets the max global price within plausible range
    max_global = max(e["val"] for e in plausible_entries)
    native_usd = [e for e in plausible_entries if e["is_native"]]

    # Checks USD price against global max to check if it is MSRP (within 15% of each other)
    if native_usd:
        best_native = max(e["val"] for e in native_usd)
        if best_native >= (max_global * 0.85):
            return round(best_native, 2)
    
    return round(max_global, 2)

def transform_to_prod(doc):
    raw = doc.get("raw", {}) or {}
    ext = doc.get("extracted", {}) or {}
    
    tests = raw.get("Our Tests", {}) or raw.get("Tests", {}) or {}
    perf_str = tests.get("Performance", "")

    raw_id = doc.get("sourceId", "unknown")
    clean_id = re.sub(r"-\d+$", "", raw_id)

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

    raw_prot = (raw.get("Display", {}) or {}).get("Protection", "Glass")
    prot_match = re.search(r"(Victus\s?\d?|Gorilla\sGlass\s?\d?|Ceramic\sShield|Saphire)", raw_prot, re.I)
    protection_name = prot_match.group(0) if prot_match else "Standard Glass"

    is_us_ready = check_us_compatibility(ext.get("networkBands", {}))

    # Launch Date: Using ext['announcedParsed'] from Screenshot 1
    try:
        iso_date = ext.get("announcedParsed", "").replace('Z', '')
        rel_date = datetime.fromisoformat(iso_date) if iso_date else datetime.now()
    except:
        rel_date = datetime.now()

    return {
        "id": clean_id,
        "name": ext.get("modelName") or "Unknown Model",
        "manufacturer": ext.get("brand") or "Unknown Brand",
        "releaseDate": rel_date,
        "price": calculate_msrp(ext.get("price", {}).get("prices", [])),
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
                "peakBrightnessNits": parse_numeric(tests.get("Display", "800").split("nits")[0]),
                "protection": protection_name,
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
                "operatingSystem": {
                    "raw": ext.get("os", "Android"),
                    "version": parse_os_version(ext.get("os"))
                },
                "expandableStorage": "no" not in (raw.get("Memory", {}) or {}).get("Card slot", "").lower(),
            },
            "benchmarks": {
                "antutuScore": get_benchmark(perf_str, "AnTuTu"),
                "geekbenchMultiCore": get_benchmark(perf_str, "GeekBench"),
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
                "buildMaterials": parse_build_materials(raw.get("Body")),
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
            {"name": "Verizon", "compatible": is_us_ready, "type": "MNO"},
            {"name": "AT&T", "compatible": is_us_ready, "type": "MNO"},
            {"name": "T-Mobile", "compatible": is_us_ready, "type": "MNO"},
            {"name": "Mint Mobile", "compatible": is_us_ready, "type": "MVNO"},
            {"name": "Google Fi", "compatible": is_us_ready, "type": "MVNO"},
            {"name": "Visible", "compatible": is_us_ready, "type": "MVNO"}
        ]
    }

def run_migration():
    client = MongoClient(MONGO_URI) 
    db = client[DB_NAME]
    source_col = db["scrape_output"] 
    destination_col = db["phones"] 

    print(f"Starting scraper output conversion...")
    
    existing_ids = set(destination_col.distinct("id"))
    print(f"\tDetected {len(existing_ids)} phones already in production.")

    ops = []
    skipped = 0
    
    for raw_doc in source_col.find():
        try:
            # Pre-check ID before transforming
            raw_id = raw_doc.get("sourceId", "unknown")
            clean_id = re.sub(r"-\d+$", "", raw_id)

            if clean_id in existing_ids:
                skipped += 1
                continue

            prod_data = transform_to_prod(raw_doc)
            ops.append(UpdateOne({"id": prod_data["id"]}, {"$set": prod_data}, upsert=True))
            
        except Exception as e:
            print(f"\tFailed to transform {raw_doc.get('sourceId')}: {e}")

    if ops:
        res = destination_col.bulk_write(ops)
        print(f"Done! Upserted: {res.upserted_count}, Modified: {res.modified_count}, Skipped: {skipped}")
    else:
        print(f"No new phones found to migrate. Skipped: {skipped}")

if __name__ == "__main__":
    run_migration()
