import glob
import json
import os
from fastapi import APIRouter
from models.schemas import CategoryItem

router = APIRouter()

KB_DIR = os.getenv("KNOWLEDGE_BASE_DIR", os.path.join(os.path.dirname(__file__), "..", "..", "knowledge_base"))

CATEGORY_META = {
    "Education": {"icon": "🎓", "description": "Schools, higher education and student support programs."},
    "Agriculture": {"icon": "🌾", "description": "Farmer income support, insurance and input subsidies."},
    "Employment": {"icon": "💼", "description": "Skilling programs and self-employment credit support."},
    "Government Services": {"icon": "🏛", "description": "Identity, certificates and citizen service processes."},
    "Welfare": {"icon": "👨‍👩‍👧", "description": "Health cover and social security for vulnerable groups."},
    "Scholarships": {"icon": "📚", "description": "Merit and need-based scholarships for students."},
    "Documents": {"icon": "📄", "description": "Upload a notification for a plain-language explanation."},
    "Public Information": {"icon": "🔎", "description": "General public-service procedures and notifications."},
}


@router.get("/categories", response_model=list[CategoryItem])
def get_categories():
    counts = {}
    for path in glob.glob(os.path.join(KB_DIR, "*.json")):
        with open(path, "r", encoding="utf-8") as f:
            records = json.load(f)
        for rec in records:
            counts[rec["category"]] = counts.get(rec["category"], 0) + 1

    items = []
    for name, meta in CATEGORY_META.items():
        items.append(
            CategoryItem(
                key=name.lower().replace(" ", "_"),
                label=name,
                icon=meta["icon"],
                description=meta["description"],
                doc_count=counts.get(name, 0),
            )
        )
    return items
