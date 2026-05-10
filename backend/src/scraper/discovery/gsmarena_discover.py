from typing import Dict, List, Optional, Tuple
from urllib.parse import urljoin

from bs4 import BeautifulSoup

from ..utils.http import HttpClient
from ..utils.slug import normalize_brand

GSMARENA_BASE = "https://www.gsmarena.com/"
MAKERS_URL = urljoin(GSMARENA_BASE, "makers.php3")

COMMON_BRANDS = {
    "samsung": "https://www.gsmarena.com/samsung-phones-9.php",
    "apple": "https://www.gsmarena.com/apple-phones-48.php",
    "google": "https://www.gsmarena.com/google-phones-107.php",
    "nothing": "https://www.gsmarena.com/nothing-phones-128.php",
    "oneplus": "https://www.gsmarena.com/oneplus-phones-95.php",
    "sony": "https://www.gsmarena.com/sony-phones-7.php",
    "huawei": "https://www.gsmarena.com/huawei-phones-58.php",
    "xiaomi": "https://www.gsmarena.com/xiaomi-phones-80.php",
}

def fetch_brand_directory(http: HttpClient) -> Dict[str, str]:
    """
    Scrapes makers.php3 to build a mapping:
      "samsung" -> "https://www.gsmarena.com/samsung-phones-9.php"
      "apple"   -> "https://www.gsmarena.com/apple-phones-48.php"
    Returns dict: normalized_brand -> absolute_url
    """
    import re
    from bs4 import BeautifulSoup

    html = http.get_text(MAKERS_URL)
    soup = BeautifulSoup(html, "lxml")

    mapping: Dict[str, str] = {}

    # GSMArena brand links on makers.php3 consistently contain "-phones-"
    for a in soup.select("a[href]"):
        href = a.get("href", "")
        if not href:
            continue
        if "-phones-" not in href:
            continue
        if not href.endswith(".php") and ".php3" not in href:
            continue

        name = a.get_text(" ", strip=True)
        if not name:
            continue

        # makers page sometimes includes counts in the text; strip trailing digits and extras
        # e.g. "Samsung 1234" -> "Samsung"
        name = re.sub(r"\s*\d+.*$", "", name).strip()
        if not name:
            continue

        b = normalize_brand(name)
        mapping[b] = urljoin(GSMARENA_BASE, href)

    return mapping


def discover_phone_urls_for_brand(http: HttpClient, brand_url: str, max_pages: int) -> List[str]:
    """
    Given a brand listing URL (e.g., samsung-phones-9.php),
    walk pages and collect phone spec page URLs.

    GSMArena brand pages commonly paginate like:
      samsung-phones-9.php
      samsung-phones-f-9-0-p2.php  (varies)
    We'll implement a best-effort by following "Next" links.
    """
    urls: List[str] = []
    next_url: Optional[str] = brand_url
    pages = 0

    # These keywords indicate the link is NOT a phone
    DENY_KEYWORDS = ["watch", "tablet", "pad", "tab", "laptop", "macbook"]    

    while next_url and pages < max_pages:
        html = http.get_text(next_url)
        soup = BeautifulSoup(html, "lxml")

        # Phone items on brand pages are usually in "div.makers" or "div.section-body"
        # Best-effort: collect links that look like phone pages (contain "-<digits>.php")
        for a in soup.select("a[href]"):
            href = a.get("href", "")
            if not href:
                continue
            
            # Skips if not a phone (saves a request for getting actual page)
            if any(k in href.lower() for k in DENY_KEYWORDS):
                continue

            if href.endswith(".php") and "-" in href and "phones" not in href and "makers" not in href:
                abs_url = urljoin(GSMARENA_BASE, href)
                if abs_url.startswith(GSMARENA_BASE) and abs_url not in urls:
                    urls.append(abs_url)

        # find "Next" pagination link
        next_link = soup.select_one("a[title='Next page']")
        if next_link and next_link.get("href"):
            next_url = urljoin(GSMARENA_BASE, next_link["href"])
        else:
            next_url = None

        pages += 1

    return urls


def discover_candidate_urls(
    http: HttpClient,
    brand: Optional[str],
    max_pages: int,
) -> List[str]:
    """
    If brand is provided, only scrape that brand.
    Else, scrape all brands (slow).
    """
    # Goes directly to brand page using static dictionary to save a request
    if brand:
        b_norm = normalize_brand(brand)
        if b_norm in COMMON_BRANDS:
            print(f"   [discovery] Using static route for {brand}...")
            return discover_phone_urls_for_brand(http, COMMON_BRANDS[b_norm], max_pages=max_pages)

    # Fetches brand page
    directory = fetch_brand_directory(http)
    if brand:
        b = normalize_brand(brand)
        if b not in directory:
            known = ", ".join(sorted(list(directory.keys()))[:20])
            raise ValueError(f"Brand '{brand}' not found in GSMArena makers list. Example known brands: {known} ...")
        return discover_phone_urls_for_brand(http, directory[b], max_pages=max_pages)

    # All brands
    all_urls: List[str] = []
    for _, brand_url in directory.items():
        brand_urls = discover_phone_urls_for_brand(http, brand_url, max_pages=max_pages)
        for u in brand_urls:
            if u not in all_urls:
                all_urls.append(u)
    return all_urls
