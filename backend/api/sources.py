import glob
import json
import os
from fastapi import APIRouter

router = APIRouter()
KB_DIR = os.getenv("KNOWLEDGE_BASE_DIR", os.path.join(os.path.dirname(__file__), "..", "..", "knowledge_base"))


@router.get("/sources")
def get_sources():
    """Returns the full list of trusted demo knowledge-base documents and their metadata."""
    all_records = []
    for path in glob.glob(os.path.join(KB_DIR, "*.json")):
        with open(path, "r", encoding="utf-8") as f:
            records = json.load(f)
        all_records.extend(records)
    return {"count": len(all_records), "sources": all_records, "note": "Demo/sample data — not live government data."}
