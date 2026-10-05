from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.db import get_db
from models import db_models
from models.schemas import ConversationSummary, ConversationDetail, MessageItem

router = APIRouter()


@router.get("/conversations", response_model=list[ConversationSummary])
def list_conversations(user_id: str | None = None, db: Session = Depends(get_db)):
    q = db.query(db_models.Conversation)
    if user_id:
        q = q.filter_by(user_id=user_id)
    conversations = q.order_by(db_models.Conversation.updated_at.desc()).all()
    return [
        ConversationSummary(
            id=c.id,
            title=c.title,
            language=c.language,
            updated_at=str(c.updated_at),
            message_count=len(c.messages),
        )
        for c in conversations
    ]


@router.get("/conversations/{conversation_id}", response_model=ConversationDetail)
def get_conversation(conversation_id: str, db: Session = Depends(get_db)):
    conversation = db.query(db_models.Conversation).filter_by(id=conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return ConversationDetail(
        id=conversation.id,
        title=conversation.title,
        language=conversation.language,
        messages=[
            MessageItem(
                id=m.id, role=m.role, content=m.content, language=m.language,
                sources=m.sources or [], created_at=str(m.created_at),
            )
            for m in conversation.messages
        ],
    )
