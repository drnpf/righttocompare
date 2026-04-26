from pymongo import MongoClient, ASCENDING
from pymongo.collection import Collection

from .config import Settings


def get_collection(settings: Settings) -> Collection:
    client = MongoClient(settings.mongo_uri)
    db = client[settings.mongo_db]
    col = db[settings.mongo_collection]

    # Ensure useful indexes (safe to call repeatedly)
    col.create_index([("source", ASCENDING), ("sourceId", ASCENDING)], unique=True)
    col.create_index([("status", ASCENDING)])
    col.create_index([("scrapedAt", ASCENDING)])
    col.create_index([("extracted.brand", ASCENDING)])
    col.create_index([("extracted.modelName", ASCENDING)])

    return col


def upsert_scrape_output(col: Collection, doc: dict) -> None:
    """
    Upsert by (source, sourceId). Updates the document contents and scrapedAt each run.
    """
    key = {"source": doc.get("source"), "sourceId": doc.get("sourceId")}
    update = {"$set": doc}
    col.update_one(key, update, upsert=True)