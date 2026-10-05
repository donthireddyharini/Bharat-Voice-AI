"""Pydantic request/response models for the API."""
from typing import List, Optional, Literal
from pydantic import BaseModel, Field

Language = Literal["en", "hi", "te", "kn", "ta", "mr", "bn", "gu", "ml", "pa", "or"]


class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Text to synthesize to speech")
    language: Language = "te"


class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, description="User's message")
    language: Language = "en"
    conversation_id: Optional[str] = None
    user_id: Optional[str] = None


class SourceRef(BaseModel):
    title: str
    category: str
    source: str
    last_updated: str
    doc_id: str
    url: Optional[str] = None
    verified: bool = True


class StructuredAnswer(BaseModel):
    scheme_name: Optional[str] = None
    summary: str
    eligibility: List[str] = []
    benefits: List[str] = []
    documents_required: List[str] = []
    application_steps: List[str] = []
    clarifying_question: Optional[str] = None
    grounded: bool = True


class ChatResponse(BaseModel):
    conversation_id: str
    message_id: str
    answer: StructuredAnswer
    sources: List[SourceRef] = []
    language: Language
    suggested_followups: List[str] = []


class VoiceTranscriptRequest(BaseModel):
    """Frontend performs STT/TTS in-browser (Web Speech API); this endpoint
    accepts the transcribed text plus detected language and routes it through
    the same pipeline as /api/chat, returning text meant for TTS playback."""
    transcript: str = Field(..., min_length=1)
    language: Language = "en"
    conversation_id: Optional[str] = None
    user_id: Optional[str] = None


class TranslateRequest(BaseModel):
    text: str
    target_language: Language


class TranslateResponse(BaseModel):
    translated_text: str
    target_language: Language


class SearchRequest(BaseModel):
    query: str
    language: Language = "en"
    top_k: int = 4


class SearchResultItem(BaseModel):
    doc_id: str
    title: str
    category: str
    snippet: str
    score: float
    source: str


class SearchResponse(BaseModel):
    results: List[SearchResultItem]
    query: str


class CategoryItem(BaseModel):
    key: str
    label: str
    icon: str
    description: str
    doc_count: int


class DocumentExplainRequest(BaseModel):
    document_id: str
    language: Language = "en"


class DocumentUploadResponse(BaseModel):
    document_id: str
    filename: str
    extracted_text_preview: str
    explanation: StructuredAnswer
    language: Language


class ConversationSummary(BaseModel):
    id: str
    title: str
    language: str
    updated_at: str
    message_count: int


class MessageItem(BaseModel):
    id: str
    role: str
    content: str
    language: str
    sources: list = []
    created_at: str


class ConversationDetail(BaseModel):
    id: str
    title: str
    language: str
    messages: List[MessageItem]


class ProfileUpdateRequest(BaseModel):
    user_id: Optional[str] = None
    name: Optional[str] = None
    preferred_language: Optional[Language] = None
    state: Optional[str] = None
    education_level: Optional[str] = None
    occupation: Optional[str] = None
    interests: Optional[List[str]] = None
