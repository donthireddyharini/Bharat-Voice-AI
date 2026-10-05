from fastapi import APIRouter
from models.schemas import TranslateRequest, TranslateResponse
from services import language as lang_service

router = APIRouter()


@router.post("/translate", response_model=TranslateResponse)
def translate(payload: TranslateRequest):
    translated = lang_service.translate(payload.text, payload.target_language)
    return TranslateResponse(translated_text=translated, target_language=payload.target_language)
