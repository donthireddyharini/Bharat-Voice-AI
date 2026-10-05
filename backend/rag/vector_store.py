"""FAISS vector store construction and loading, via LangChain."""
import os
import json
import glob
from typing import List

from langchain_core.documents import Document
from langchain_community.vectorstores import FAISS

from rag.embeddings import get_embeddings

KB_DIR = os.getenv("KNOWLEDGE_BASE_DIR", os.path.join(os.path.dirname(__file__), "..", "..", "knowledge_base"))
INDEX_DIR = os.getenv("FAISS_INDEX_DIR", os.path.join(os.path.dirname(__file__), "..", "faiss_index"))

_vector_store = None


def _load_kb_documents() -> List[Document]:
    documents = []
    for path in glob.glob(os.path.join(KB_DIR, "*.json")):
        with open(path, "r", encoding="utf-8") as f:
            records = json.load(f)
        for rec in records:
            content = "\n".join(
                [
                    f"Title: {rec['title']}",
                    f"Category: {rec['category']}",
                    f"Description: {rec['description']}",
                    "Eligibility: " + "; ".join(rec.get("eligibility", [])),
                    "Benefits: " + "; ".join(rec.get("benefits", [])),
                    "Documents Required: " + "; ".join(rec.get("documents_required", [])),
                    "Application Process: " + "; ".join(rec.get("application_process", [])),
                ]
            )
            documents.append(
                Document(
                    page_content=content,
                    metadata={
                        "doc_id": rec["id"],
                        "title": rec["title"],
                        "category": rec["category"],
                        "source": rec["source"],
                        "url": rec.get("url"),
                        "verified": True,
                        "last_updated": rec["last_updated"],
                        "eligibility": rec.get("eligibility", []),
                        "benefits": rec.get("benefits", []),
                        "documents_required": rec.get("documents_required", []),
                        "application_process": rec.get("application_process", []),
                        "states": rec.get("states", []),
                        "education_level": rec.get("education_level", []),
                    },
                )
            )
    return documents


def build_index() -> FAISS:
    """Build the FAISS index from the JSON knowledge base and persist it to disk."""
    docs = _load_kb_documents()
    store = FAISS.from_documents(docs, get_embeddings())
    os.makedirs(INDEX_DIR, exist_ok=True)
    store.save_local(INDEX_DIR)
    return store


def get_vector_store() -> FAISS:
    """Load the persisted FAISS index, building it on first run."""
    global _vector_store
    if _vector_store is not None:
        return _vector_store

    if os.path.exists(os.path.join(INDEX_DIR, "index.faiss")):
        _vector_store = FAISS.load_local(
            INDEX_DIR, get_embeddings(), allow_dangerous_deserialization=True
        )
    else:
        _vector_store = build_index()
    return _vector_store


def reload_index_with_extra_documents(documents: List[Document]):
    """Add newly uploaded/summarized documents into the live index (used by document upload flow)."""
    store = get_vector_store()
    store.add_documents(documents)
    store.save_local(INDEX_DIR)
    return store
