import argparse
from typing import List, Optional, Tuple, Dict, Any

from .config import get_settings
from .db import get_collection, upsert_scrape_output
from .utils.http import HttpClient

from .discovery.gsmarena_discover import discover_candidate_urls as gsm_discover
from .parsers.gsmarena_phone_parser import (
    parse_phone_page as gsm_parse,
    quick_get_tables as gsm_quick_tables,
    is_phone_only_device as gsm_is_phone_only,
)
from .utils.dates import parse_gsmarena_announced


def build_arg_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        description="Phone scraper -> Mongo scrape_output (GSMArena)"
    )
    p.add_argument("--limit", type=int, default=25, help="How many PHONES to insert.")
    p.add_argument(
        "--brand",
        type=str,
        default=None,
        help="Optional brand filter. Example: samsung/apple/google",
    )
    p.add_argument(
        "--max-pages",
        type=int,
        default=3,
        help="How many listing pages to scan.",
    )
    p.add_argument(
        "--pool-mult",
        type=int,
        default=5,
        help="Candidate pool multiplier for sorting. Pool size = limit * pool_mult.",
    )
    p.add_argument(
        "--delay",
        type=float,
        default=None,
        help="Override request delay seconds (polite throttling).",
    )
    return p


def newest_sort_urls(
    http: HttpClient,
    urls: List[str],
    limit: int,
    pool_mult: int,
) -> List[str]:
    """
    Phone-only + fill-to-target:
    Scan forward through urls, collect enough PHONE candidates,
    score by date (newest-first), then return top URLs.

    This guarantees we don't stop early just because the first N are
    tablets / watches / other non-phone devices.
    """
    target_candidates = max(limit * pool_mult, limit)
    scored: List[Tuple[Optional[int], str]] = []

    for u in urls:
        try:
            tables = gsm_quick_tables(http, u)

            if not gsm_is_phone_only(tables):
                continue

            launch = tables.get("Launch", {}) or {}
            announced_str = launch.get("Announced")
            dt = parse_gsmarena_announced(announced_str)
            key = dt.year * 10000 + dt.month * 100 + dt.day if dt else None

            scored.append((key, u))

            if len(scored) >= target_candidates:
                break

        except Exception:
            continue

    # Sort newest first; unknown dates last
    scored.sort(key=lambda x: (x[0] is None, -(x[0] or 0)))
    return [u for _, u in scored][:limit]


def scrape_and_insert(
    http: HttpClient,
    col,
    urls_sorted: List[str],
    hard_limit: int,
) -> int:
    """
    Insert up to hard_limit PHONES (skipping non-phones and errors).
    Returns number inserted.
    """
    inserted = 0

    for i, url in enumerate(urls_sorted, start=1):
        if inserted >= hard_limit:
            break

        try:
            scraped = gsm_parse(http=http, url=url)
            doc: Dict[str, Any] = scraped.to_mongo()

            raw_tables = doc.get("raw", {}) or {}
            model_name = (doc.get("extracted", {}) or {}).get("modelName")

            if not gsm_is_phone_only(raw_tables, model_name=model_name):
                print(
                    f"[gsmarena {i}/{len(urls_sorted)}] skipped non-phone: "
                    f"{doc.get('sourceId')} ({model_name})"
                )
                continue

            upsert_scrape_output(col, doc)
            inserted += 1
            print(
                f"[gsmarena {i}/{len(urls_sorted)}] upserted: "
                f"{doc['sourceId']} ({doc.get('extracted', {}).get('modelName')})"
            )

        except Exception as e:
            print(f"[gsmarena {i}/{len(urls_sorted)}] ERROR scraping {url}: {e}")

    return inserted


def main() -> int:
    args = build_arg_parser().parse_args()
    settings = get_settings()

    http = HttpClient(
        user_agent=settings.user_agent,
        timeout_seconds=settings.request_timeout_seconds,
        retries=settings.request_retries,
        delay_seconds=(
            args.delay if args.delay is not None else settings.request_delay_seconds
        ),
    )

    col = get_collection(settings)

    # 1) Discover
    urls = gsm_discover(http=http, brand=args.brand, max_pages=args.max_pages)

    if not urls:
        print("[gsmarena] No URLs discovered. Check brand spelling / increase --max-pages.")
        print(
            f"Done. Total inserted=0. Collection={settings.mongo_db}.{settings.mongo_collection}"
        )
        return 0

    # 2) Sort newest-first from a phone-only pool
    top = newest_sort_urls(http, urls, limit=args.limit, pool_mult=args.pool_mult)
    print(f"[gsmarena] Discovered {len(urls)} URLs. Candidate top={len(top)}.")

    # 3) Scrape + insert (phones-only), up to args.limit
    inserted = scrape_and_insert(http, col, top, hard_limit=args.limit)
    print(f"[gsmarena] Inserted phones={inserted}/{args.limit}.")

    print(
        f"Done. Total inserted={inserted}. "
        f"Collection={settings.mongo_db}.{settings.mongo_collection}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())