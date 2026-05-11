import time
from typing import Optional, Dict
import random

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

    def _get_gaussian_delay(self):
        """Gets delay based on a Gaussian Distribution of the delay"""
        mu = self.delay_seconds
        sigma = mu * 0.2 # Spread of delay
        delay = random.gauss(mu, sigma)

        # Bounds on delay
        lower_bound = mu * 0.5
        upper_bound = mu * 3
        return max(lower_bound, min(delay, upper_bound))

    def _reset_session(self):
        """Destroy and recreate the session to clear fingerprinting/cookies"""
        self._session.close()
        self._session = requests.Session()
        print("Resetting session to clear fingerprinting/cookies.")

    def get_text(self, url: str) -> str:
        # Cache hit (biggest speed gain: avoids double-fetch between sort and parse)
        if self.cache_enabled and url in self._cache:
            return self._cache[url]
        
        # List of different UAs to change to during test
        USER_AGENTS = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15",
            "Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0",
        ]

        # List of different referrers to change to during test
        REFERRERS = [
            "https://www.google.com/",
            "https://www.bing.com/",
            "https://duckduckgo.com/",
            "https://www.gsmarena.com/"
        ]

        headers = {
            "User-Agent": self.user_agent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Referer": "https://www.google.com/", 
            "DNT": "1",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
        }
        last_err: Optional[Exception] = None

        for attempt in range(1, self.retries + 1):
            try:

                headers["User-Agent"] = random.choice(USER_AGENTS)
                headers["Referer"] = random.choice(REFERRERS)

                # polite delay between requests -- randomized delay
                if self.delay_seconds > 0:
                    time.sleep(self._get_gaussian_delay())

                resp = self._session.get(url, headers=headers, timeout=self.timeout_seconds)

                # Check for failure status code (rate limits/failure to comm with server)
                if resp.status_code in [403, 429]:
                    wait = self.delay_seconds * 15
                    print(f"\tBlocked ({resp.status_code}). Sleeping for {wait}s.", flush=True)
                    time.sleep(wait)
                    self._reset_session()
                    continue
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
                # Exponential backoff based on attempt
                wait = 2.0**attempt + random.random()
                print(f"\tAttempt {attempt} failed for {url}: {e}. Retrying in {wait}s.", flush=True)
                time.sleep(wait)

        raise RuntimeError(f"GET failed after {self.retries} retries: {url} :: {last_err}")
