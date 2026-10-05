from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.db import get_db
from models import db_models
from models.schemas import ProfileUpdateRequest

router = APIRouter()


@router.post("/profile")
def upsert_profile(payload: ProfileUpdateRequest, db: Session = Depends(get_db)):
    user = None
    if payload.user_id:
        user = db.query(db_models.User).filter_by(id=payload.user_id).first()
    if user is None:
        user = db_models.User()
        db.add(user)

    if payload.name is not None:
        user.name = payload.name
    if payload.preferred_language is not None:
        user.preferred_language = payload.preferred_language
    if payload.state is not None:
        user.state = payload.state
    if payload.education_level is not None:
        user.education_level = payload.education_level
    if payload.occupation is not None:
        user.occupation = payload.occupation
    if payload.interests is not None:
        user.interests = payload.interests

    db.commit()
    db.refresh(user)

    # Sync to Supabase cloud storage if configured
    try:
        from database.supabase_client import store_profile_supabase
        store_profile_supabase(user.id, {
            "name": user.name,
            "preferred_language": user.preferred_language,
            "state": user.state,
            "education_level": user.education_level,
            "occupation": user.occupation,
            "interests": user.interests,
        })
    except Exception:
        pass

    return {
        "user_id": user.id,
        "name": user.name,
        "preferred_language": user.preferred_language,
        "state": user.state,
        "education_level": user.education_level,
        "occupation": user.occupation,
        "interests": user.interests,
    }


@router.get("/profile/{user_id}")
def get_profile(user_id: str, db: Session = Depends(get_db)):
    user = db.query(db_models.User).filter_by(id=user_id).first()
    if not user:
        return {"error": "not_found"}
    return {
        "user_id": user.id,
        "name": user.name,
        "preferred_language": user.preferred_language,
        "state": user.state,
        "education_level": user.education_level,
        "occupation": user.occupation,
        "interests": user.interests,
    }
