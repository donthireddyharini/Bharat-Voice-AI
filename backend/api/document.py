from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from langchain_core.documents import Document as LCDocument

from database.db import get_db
from models import db_models
from models.schemas import DocumentUploadResponse
from documents.extractor import extract_text
from documents.summarizer import summarize_document
from rag.vector_store import reload_index_with_extra_documents

router = APIRouter()

ALLOWED_EXTENSIONS = (".pdf", ".txt", ".png", ".jpg", ".jpeg")
MAX_FILE_SIZE_MB = 10


@router.post("/document", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    language: str = Form("en"),
    db: Session = Depends(get_db),
):
    if not file.filename.lower().endswith(ALLOWED_EXTENSIONS):
        raise HTTPException(status_code=422, detail="Unsupported file type. Please upload a PDF, TXT, PNG or JPG file.")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=422, detail=f"File too large. Max size is {MAX_FILE_SIZE_MB}MB.")
    if len(contents) == 0:
        raise HTTPException(status_code=422, detail="Uploaded file is empty.")

    extracted = extract_text(file.filename, contents)
    explanation = summarize_document(extracted, language)

    record = db_models.DocumentRecord(
        filename=file.filename,
        file_type=file.filename.split(".")[-1],
        extracted_text=extracted,
        summary=explanation.summary,
        language=language,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    # Make the uploaded notification searchable for future related questions.
    try:
        reload_index_with_extra_documents(
            [
                LCDocument(
                    page_content=f"Title: {file.filename}\nDescription: {extracted[:2000]}",
                    metadata={
                        "doc_id": record.id,
                        "title": file.filename,
                        "category": "Uploaded Document",
                        "source": "User-uploaded document (unverified — user supplied)",
                        "last_updated": str(record.created_at.date()),
                        "eligibility": explanation.eligibility,
                        "benefits": explanation.benefits,
                        "documents_required": explanation.documents_required,
                        "application_process": explanation.application_steps,
                        "states": [],
                        "education_level": [],
                    },
                )
            ]
        )
    except Exception:
        pass  # indexing failure should never block returning the summary to the user

    return DocumentUploadResponse(
        document_id=record.id,
        filename=file.filename,
        extracted_text_preview=(extracted[:500] + "...") if len(extracted) > 500 else extracted,
        explanation=explanation,
        language=language,
    )
