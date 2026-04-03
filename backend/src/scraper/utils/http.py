import time
from typing import Optional, Dict

import requests


class HttpClient:
    def __init__(
        self,
        user_agent: str,
        timeout_seconds: int,
        retries: int,
        delay_seconds: float,
        cache_enabled: bool = True,
        cache_max_entries: int = 512,
    ):
        self.user_agent = user_agent
        self.timeout_seconds = timeout_seconds
        self.retries = retries
        self.delay_seconds = delay_seconds

        # Reuse connections (faster than requests.get each time)
        self._session = requests.Session()

        # Simple in-memory cache: url -> html
        self.cache_enabled = cache_enabled
        self.cache_max_entries = cache_max_entries
        self._cache: Dict[str, str] = {}

    def get_text(self, url: str) -> str:
        # Cache hit (biggest speed gain: avoids double-fetch between sort and parse)
        if self.cache_enabled and url in self._cache:
            return self._cache[url]

        headers = {
            "User-Agent": self.user_agent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
            "Referer": "https://www.kimovil.com/en/",
            "Upgrade-Insecure-Requests": "1",
                }
        last_err: Optional[Exception] = None

        for attempt in range(1, self.retries + 1):
            try:
                # polite delay between requests
                if self.delay_seconds > 0:
                    time.sleep(self.delay_seconds)

                resp = self._session.get(url, headers=headers, timeout=self.timeout_seconds)
                resp.raise_for_status()
                text = resp.text

                if self.cache_enabled:
                    # basic cap to prevent unbounded growth
                    if len(self._cache) >= self.cache_max_entries:
                        # drop one arbitrary entry (good enough for this project)
                        self._cache.pop(next(iter(self._cache)))
                    self._cache[url] = text

                return text

            except Exception as e:
                last_err = e
                # small backoff
                time.sleep(min(1.5 * attempt, 5.0))

        raise RuntimeError(f"GET failed after {self.retries} retries: {url} :: {last_err}")
