import datetime as dt
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.db import get_db
from models import db_models
from models.schemas import ChatRequest, ChatResponse
from services import language as lang_service
from rag.pipeline import run_pipeline
from database.supabase_client import store_conversation_supabase, store_message_supabase

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest, db: Session = Depends(get_db)):
    query = payload.query.strip()
    if not query:
        raise HTTPException(status_code=422, detail=lang_service.t("empty_query", payload.language))

    try:
        result = run_pipeline(query, payload.language)
    except Exception:
        raise HTTPException(status_code=500, detail=lang_service.t("generation_error", payload.language))

    # Persist conversation + messages
    conversation = None
    if payload.conversation_id:
        conversation = db.query(db_models.Conversation).filter_by(id=payload.conversation_id).first()
    if conversation is None:
        conversation = db_models.Conversation(
            user_id=payload.user_id, language=payload.language, title=query[:60]
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    user_msg = db_models.Message(
        conversation_id=conversation.id, role="user", content=query, language=payload.language
    )
    db.add(user_msg)

    assistant_msg = db_models.Message(
        conversation_id=conversation.id,
        role="assistant",
        content=result.answer.summary,
        language=result.language,
        sources=[s.model_dump() for s in result.sources],
    )
    db.add(assistant_msg)
    conversation.updated_at = dt.datetime.utcnow()
    db.commit()
    db.refresh(assistant_msg)

    # Sync to Supabase cloud storage if configured
    try:
        store_conversation_supabase(conversation.id, conversation.title, conversation.language, payload.user_id)
        store_message_supabase(conversation.id, "user", query, payload.language)
        store_message_supabase(conversation.id, "assistant", result.answer.summary, result.language, [s.model_dump() for s in result.sources])
    except Exception:
        pass

    result.conversation_id = conversation.id
    result.message_id = assistant_msg.id
    return result
