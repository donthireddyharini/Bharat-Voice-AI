"""Summarize an uploaded document into a structured, regional-language explanation."""
from models.schemas import StructuredAnswer
from services import llm_client, language as lang_service


def summarize_document(text: str, target_language: str) -> StructuredAnswer:
    if not text or text.startswith("["):
        return StructuredAnswer(
            summary=lang_service.t("no_source_found", target_language),
            grounded=False,
        )

    truncated = text[:6000]  # keep prompt bounded

    if llm_client.is_configured():
        prompt = (
            "You are a public-service document assistant. Read the notification below and produce a "
            f"clear explanation in {lang_service.LANGUAGE_NAMES[target_language]}, strictly grounded in the document text. "
            "Respond in this exact format:\n"
            "SUMMARY: <one paragraph plain-language summary>\n"
            "ELIGIBILITY: <bullet items separated by semicolons>\n"
            "BENEFITS: <bullet items separated by semicolons>\n"
            "DOCUMENTS: <bullet items separated by semicolons>\n"
            "STEPS: <bullet items separated by semicolons>\n\n"
            f"DOCUMENT:\n{truncated}"
        )
        raw = llm_client.generate(prompt, max_tokens=600)
        if raw:
            return _parse_llm_document_summary(raw)

    # Deterministic fallback: extractive summary (first ~2 sentences) with a
    # clear notice that no LLM is configured, so nothing is fabricated.
    sentences = [s.strip() for s in truncated.replace("\n", " ").split(".") if s.strip()]
    extractive_summary = ". ".join(sentences[:3]) + ("." if sentences else "")
    return StructuredAnswer(
        summary=extractive_summary or "Document uploaded. Configure an LLM provider (see .env.example) for full AI-generated explanations.",
        eligibility=[],
        benefits=[],
        documents_required=[],
        application_steps=[],
        grounded=True,
    )


def _parse_llm_document_summary(raw: str) -> StructuredAnswer:
    fields = {"SUMMARY": "", "ELIGIBILITY": "", "BENEFITS": "", "DOCUMENTS": "", "STEPS": ""}
    current = None
    for line in raw.splitlines():
        matched = False
        for key in fields:
            if line.strip().upper().startswith(key + ":"):
                current = key
                fields[key] = line.split(":", 1)[1].strip()
                matched = True
                break
        if not matched and current:
            fields[current] += " " + line.strip()

    def split_items(value: str):
        return [item.strip() for item in value.split(";") if item.strip()]

    return StructuredAnswer(
        summary=fields["SUMMARY"] or raw[:400],
        eligibility=split_items(fields["ELIGIBILITY"]),
        benefits=split_items(fields["BENEFITS"]),
        documents_required=split_items(fields["DOCUMENTS"]),
        application_steps=split_items(fields["STEPS"]),
        grounded=True,
    )
