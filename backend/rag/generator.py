"""Generation step: turns retrieved KB documents into a structured, grounded answer."""
import os
import json
from typing import List, Tuple
from langchain_core.documents import Document

from models.schemas import StructuredAnswer, SourceRef
from services import language as lang_service
from services import llm_client

# Load instant pre-translated scheme cache for zero-latency retrieval
SCHEME_CACHE = {}
_cache_path = os.path.join(os.path.dirname(__file__), "..", "services", "scheme_translations.json")
if os.path.exists(_cache_path):
    try:
        with open(_cache_path, "r", encoding="utf-8") as f:
            SCHEME_CACHE = json.load(f)
    except Exception as e:
        print(f"[Generator] Notice loading scheme translations: {e}")


def build_sources(results: List[Tuple[Document, float]]) -> List[SourceRef]:
    sources = []
    seen = set()
    for doc, score in results:
        doc_id = doc.metadata["doc_id"]
        if doc_id in seen:
            continue
        seen.add(doc_id)
        sources.append(
            SourceRef(
                title=doc.metadata["title"],
                category=doc.metadata["category"],
                source=doc.metadata["source"],
                last_updated=doc.metadata["last_updated"],
                doc_id=doc_id,
                url=doc.metadata.get("url"),
                verified=doc.metadata.get("verified", True),
            )
        )
    return sources


def build_structured_answer(query: str, language: str, results: List[Tuple[Document, float]], grounded: bool = True) -> StructuredAnswer:
    """Compose a factual StructuredAnswer from the top retrieved document."""
    if not results or not grounded:
        msg = lang_service.t("no_source_found", language)
        return StructuredAnswer(
            summary=msg,
            eligibility=[],
            benefits=[],
            documents_required=[],
            application_steps=[],
            clarifying_question=msg,
            grounded=False,
        )

    top_doc, top_score = results[0]
    meta = top_doc.metadata
    doc_id = meta.get("doc_id", "")

    # 1. Check instant pre-translated cache first for sub-second responses
    if language != "en" and language in SCHEME_CACHE and doc_id in SCHEME_CACHE[language]:
        cached = SCHEME_CACHE[language][doc_id]
        return StructuredAnswer(
            scheme_name=cached.get("title", meta["title"]),
            summary=cached.get("summary", ""),
            eligibility=cached.get("eligibility", meta.get("eligibility", [])),
            benefits=cached.get("benefits", meta.get("benefits", [])),
            documents_required=cached.get("documents_required", meta.get("documents_required", [])),
            application_steps=cached.get("application_process", meta.get("application_process", [])),
            grounded=True,
        )

    # 2. Fallback: Base fields from the trusted KB record
    summary_en = f"{meta['title']}: {top_doc.page_content.splitlines()[2].replace('Description: ', '')}"
    eligibility = meta.get("eligibility", [])
    benefits = meta.get("benefits", [])
    documents_required = meta.get("documents_required", [])
    steps = meta.get("application_process", [])

    summary = summary_en
    scheme_name = meta["title"]

    if language != "en":
        if llm_client.is_configured():
            grounding_block = (
                f"Scheme: {meta['title']}\n"
                f"Description: {top_doc.page_content}\n"
            )
            prompt = (
                f"You are a public-service assistant. Using ONLY the facts below, write a 2-sentence "
                f"friendly summary in {lang_service.LANGUAGE_NAMES.get(language, language)} answering the user's question. "
                f"Do not add any information not present in the facts.\n\n"
                f"User question: {query}\n\nFacts:\n{grounding_block}"
            )
            llm_summary = llm_client.generate(prompt, max_tokens=200)
            if llm_summary:
                summary = llm_summary.strip()
            else:
                summary = lang_service.translate(summary_en, language)
        else:
            summary = lang_service.translate(summary_en, language)

        scheme_name = lang_service.translate(meta["title"], language)
        eligibility = lang_service.translate_list(eligibility, language)
        benefits = lang_service.translate_list(benefits, language)
        documents_required = lang_service.translate_list(documents_required, language)
        steps = lang_service.translate_list(steps, language)

    return StructuredAnswer(
        scheme_name=scheme_name,
        summary=summary,
        eligibility=eligibility,
        benefits=benefits,
        documents_required=documents_required,
        application_steps=steps,
        grounded=True,
    )


def build_followups(results: List[Tuple[Document, float]], language: str) -> List[str]:
    if not results:
        return []
    followups_en = [
        "What documents do I need for this?",
        "Am I eligible based on my state?",
        "How do I apply step by step?",
    ]
    if language == "te":
        return [
            "దీనికి కావలసిన పత్రాలు ఏమిటి?",
            "నేను దరఖాస్తు చేసుకోవడానికి అర్హుడనా?",
            "దరఖాస్తు విధానం దశలవారీగా చెప్పండి"
        ]
    elif language == "hi":
        return [
            "इसके लिए कौन-से दस्तावेज चाहिए?",
            "क्या मैं इसके लिए पात्र हूँ?",
            "आवेदन प्रक्रिया विस्तार से बताएं"
        ]
    elif language == "kn":
        return [
            "ಇದಕ್ಕೆ ಯಾವ ದಾಖಲೆಗಳು ಬೇಕು?",
            "ನಾನು ಇದಕ್ಕೆ ಅರ್ಹನೇ?",
            "ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ವಿಧಾನವನ್ನು ತಿಳಿಸಿ"
        ]
    return followups_en
