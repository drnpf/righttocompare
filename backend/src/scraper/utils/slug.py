import re
from urllib.parse import urlparse


def gsmarena_source_id_from_url(url: str) -> str:
    """
    GSMArena phone URLs look like:
      https://www.gsmarena.com/apple_iphone_15_pro-12557.php

    We'll store sourceId as:
      apple_iphone_15_pro-12557
    """
    path = urlparse(url).path  # /apple_iphone_15_pro-12557.php
    fname = path.rsplit("/", 1)[-1]
    if fname.endswith(".php"):
        fname = fname[:-4]
    return fname


def normalize_brand(s: str) -> str:
    return re.sub(r"\s+", " ", s.strip()).lower()
