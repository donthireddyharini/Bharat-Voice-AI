"""
Full RAG pipeline orchestration:

USER QUERY -> LANGUAGE UNDERSTANDING -> QUERY PROCESSING -> EMBEDDING ->
VECTOR SEARCH -> RELEVANT DOCUMENTS -> CONTEXT CONSTRUCTION -> LLM ->
GROUNDED ANSWER -> SOURCE REFERENCES
"""
import re
from typing import Optional

from rag.retriever import retrieve, has_grounded_context
from rag.generator import build_structured_answer, build_sources, build_followups
from models.schemas import ChatResponse, StructuredAnswer

# Unicode ranges used for lightweight script-based language detection,
# so mixed-language / code-switched queries (e.g. Telugu+English) are handled.
SCRIPT_RANGES = {
    "hi": (0x0900, 0x097F),  # Devanagari
    "te": (0x0C00, 0x0C7F),  # Telugu
    "kn": (0x0C80, 0x0CFF),  # Kannada
}


def detect_language(text: str, fallback: str) -> str:
    counts = {"hi": 0, "te": 0, "kn": 0}
    for ch in text:
        code = ord(ch)
        for lang, (start, end) in SCRIPT_RANGES.items():
            if start <= code <= end:
                counts[lang] += 1
    best_lang = max(counts, key=counts.get)
    if counts[best_lang] > 0:
        return best_lang
    return fallback  # pure Latin script / English or romanised mixed query


def run_pipeline(query: str, requested_language: str, top_k: int = 4) -> ChatResponse:
    detected_language = detect_language(query, fallback=requested_language)

    results = retrieve(query, top_k=top_k)
    grounded = has_grounded_context(results)

    answer: StructuredAnswer = build_structured_answer(query, detected_language, results, grounded)
    sources = build_sources(results) if grounded else []
    followups = build_followups(results, detected_language) if grounded else []

    return ChatResponse(
        conversation_id="",  # filled by caller after persistence
        message_id="",
        answer=answer,
        sources=sources,
        language=detected_language,
        suggested_followups=followups,
    )
