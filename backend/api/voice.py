from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session

from database.db import get_db
from models import db_models
from models.schemas import VoiceTranscriptRequest, ChatResponse, TTSRequest
from services import language as lang_service
from services.tts import synthesize_speech
from rag.pipeline import run_pipeline

router = APIRouter()


@router.post("/voice", response_model=ChatResponse)
def voice(payload: VoiceTranscriptRequest, db: Session = Depends(get_db)):
    """
    Accepts a transcript produced by the browser's Web Speech API (real STT,
    client-side), runs it through the same grounded RAG pipeline as /api/chat,
    and returns a response the frontend speaks aloud via SpeechSynthesis (TTS).
    """
    transcript = payload.transcript.strip()
    if not transcript:
        raise HTTPException(status_code=422, detail=lang_service.t("empty_query", payload.language))

    try:
        result = run_pipeline(transcript, payload.language)
    except Exception:
        raise HTTPException(status_code=500, detail=lang_service.t("generation_error", payload.language))

    conversation = None
    if payload.conversation_id:
        conversation = db.query(db_models.Conversation).filter_by(id=payload.conversation_id).first()
    if conversation is None:
        conversation = db_models.Conversation(
            user_id=payload.user_id, language=payload.language, title=transcript[:60]
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    db.add(db_models.Message(conversation_id=conversation.id, role="user", content=transcript, language=payload.language))
    assistant_msg = db_models.Message(
        conversation_id=conversation.id,
        role="assistant",
        content=result.answer.summary,
        language=result.language,
        sources=[s.model_dump() for s in result.sources],
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    result.conversation_id = conversation.id
    result.message_id = assistant_msg.id
    return result


@router.post("/voice/tts")
async def tts_post(payload: TTSRequest):
    """
    Synthesizes authentic high-definition regional speech for Indian languages (Telugu, Hindi, Kannada, English)
    using Microsoft Edge Neural TTS or Google Translate TTS. Returns MP3 audio stream.
    """
    try:
        audio_bytes = await synthesize_speech(payload.text, payload.language)
        return Response(content=audio_bytes, media_type="audio/mpeg", headers={
            "Content-Disposition": "inline; filename=speech.mp3",
            "Cache-Control": "public, max-age=86400",
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS synthesis error: {str(e)}")


@router.get("/voice/tts")
async def tts_get(text: str = Query(..., min_length=1), language: str = Query("te")):
    """
    GET endpoint for direct streaming into HTML5 <audio> elements.
    """
    try:
        audio_bytes = await synthesize_speech(text, language)
        return Response(content=audio_bytes, media_type="audio/mpeg", headers={
            "Content-Disposition": "inline; filename=speech.mp3",
            "Cache-Control": "public, max-age=86400",
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS synthesis error: {str(e)}")
