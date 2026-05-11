from app.models.prefs import PreferenceProfile


def _text_lower(x):
    return (x or "").lower()


def _price(doc: dict) -> float | None:
    price = doc.get("price")
    if isinstance(price, (int, float)):
        return float(price)
    return None


def score(profile: PreferenceProfile, doc: dict) -> tuple[float, dict, list[str]]:
    specs = doc.get("specs") or {}
    display = specs.get("display") or {}
    performance = specs.get("performance") or {}
    benchmarks = specs.get("benchmarks") or {}
    camera = specs.get("camera") or {}
    battery = specs.get("battery") or {}
    connectivity = specs.get("connectivity") or {}
    category_averages = doc.get("categoryAverages") or {}

    why: list[str] = []

    weights = {
        "price": 1.0,
        "battery": 1.2 if "battery" in profile.priorities else 0.3,
        "display": 1.0 if "display" in profile.priorities else 0.3,
        "performance": 1.2 if "performance" in profile.priorities else 0.3,
        "camera": 1.0 if "camera" in profile.priorities else 0.3,
        "rating": 0.7,
        "features": 0.5,
    }

    breakdown = {
        "price": 0,
        "battery": 0,
        "display": 0,
        "performance": 0,
        "camera": 0,
        "rating": 0,
        "features": 0,
    }

    # PRICE
    usd = _price(doc)
    if profile.budget.max_amount and usd:
        if usd <= profile.budget.max_amount:
            # Higher score when comfortably within budget
            ratio = usd / profile.budget.max_amount
            breakdown["price"] = max(0, 10 - ratio * 4)
            why.append(f"within budget (${usd:,.0f})")
        else:
            breakdown["price"] = -10
    else:
        breakdown["price"] = -1

    # BATTERY
    mah = battery.get("capacitymAh") or 0
    if mah:
        battery_score = min(10, mah / 500)
        avg_battery = category_averages.get("battery")
        if isinstance(avg_battery, (int, float)):
            battery_score += avg_battery
        breakdown["battery"] = min(10, battery_score)
        if "battery" in profile.priorities:
            why.append(f"{mah} mAh battery")

    # DISPLAY
    hz = display.get("refreshRateHz") or 60
    display_score = min(10, hz / 12)

    tech = display.get("technology") or ""
    if "oled" in _text_lower(tech) or "amoled" in _text_lower(tech):
        display_score += 2
        why.append(f"{tech} display")

    breakdown["display"] = min(10, display_score)
    if hz >= 120:
        why.append(f"{hz}Hz display")

    # PERFORMANCE
    processor = performance.get("processor") or ""
    antutu = benchmarks.get("antutuScore") or 0
    geekbench_multi = benchmarks.get("geekbenchMultiCore") or 0

    perf_score = 2

    if "3 nm" in processor:
        perf_score = 10
        why.append("high-end chipset (3 nm)")
    elif "4 nm" in processor:
        perf_score = 8
        why.append("strong chipset (4 nm)")
    elif "5 nm" in processor:
        perf_score = 6
    elif "snapdragon" in _text_lower(processor):
        perf_score = 5

    if isinstance(antutu, (int, float)) and antutu > 0:
        perf_score += min(3, antutu / 300000)
        why.append(f"AnTuTu score around {int(antutu):,}")

    if isinstance(geekbench_multi, (int, float)) and geekbench_multi > 0:
        perf_score += min(2, geekbench_multi / 1500)

    avg_perf = category_averages.get("performance")
    if isinstance(avg_perf, (int, float)):
        perf_score += avg_perf / 2

    breakdown["performance"] = min(10, perf_score)

    # CAMERA
    cam_score = 0
    main_mp = camera.get("mainMegapixels") or 0
    ultra_mp = camera.get("ultrawideMegapixels") or 0
    tele_mp = camera.get("telephotoMegapixels") or 0

    if main_mp:
        cam_score += min(5, main_mp / 10)
    if ultra_mp:
        cam_score += min(2, ultra_mp / 25)
    if tele_mp:
        cam_score += 2
        why.append("telephoto camera included")

    avg_camera = category_averages.get("camera")
    if isinstance(avg_camera, (int, float)):
        cam_score += avg_camera / 2

    breakdown["camera"] = min(10, cam_score)

    if "camera" in profile.priorities and main_mp:
        why.append(f"{main_mp}MP main camera")

    # RATINGS / REVIEWS
    rating = doc.get("aggregateRating")
    if isinstance(rating, (int, float)):
        breakdown["rating"] = min(10, rating * 2)
        why.append(f"user rating {rating}/5")

    # FEATURES
    feature_score = 0

    if profile.must_5g and connectivity.get("has5G"):
        feature_score += 3
        why.append("has 5G")

    if profile.must_nfc:
        if connectivity.get("hasNfc"):
            feature_score += 2
            why.append("has NFC")
        else:
            feature_score -= 2

    breakdown["features"] = feature_score

    total = 0
    for k in breakdown:
        total += breakdown[k] * weights[k]

    # Fallback explanation
    if not why:
        why.append("matches your requested preferences")

    return total, breakdown, why


def rank_candidates(profile: PreferenceProfile, docs: list[dict], top_k: int = 5) -> list[dict]:
    scored: list[dict] = []

    for d in docs:
        s, breakdown, why = score(profile, d)
        out = dict(d)

        out["_score"] = round(s, 2)
        out["_score_breakdown"] = breakdown
        out["_why"] = why

        scored.append(out)

    scored.sort(key=lambda x: x.get("_score", 0.0), reverse=True)
    return scored[:top_k]