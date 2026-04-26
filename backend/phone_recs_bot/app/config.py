from pydantic import BaseModel
from dotenv import load_dotenv
import os

load_dotenv()

class Settings(BaseModel):
    mongo_uri: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    mongo_db: str = os.getenv("MONGO_DB", "phones_db")
    mongo_collection: str = os.getenv("MONGO_COLLECTION", "scrape_output")
    max_candidates: int = int(os.getenv("MAX_CANDIDATES", "200"))

settings = Settings()