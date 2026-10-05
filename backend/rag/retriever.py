"""Retrieval step of the RAG pipeline: query -> relevant KB documents with scores."""
from typing import List, Tuple
from langchain_core.documents import Document

from rag.vector_store import get_vector_store

RELEVANCE_THRESHOLD = 0.35  # tuned for multilingual cross-lingual retrieval (Telugu, Hindi, Kannada)


def retrieve(query: str, top_k: int = 4) -> List[Tuple[Document, float]]:
    """Return (document, similarity_score) pairs, most relevant first.
    similarity_score is normalised to [0, 1], higher = more relevant.
    """
    store = get_vector_store()
    results = store.similarity_search_with_score(query, k=top_k)
    normalised = []
    for doc, distance in results:
        # FAISS returns L2 distance; convert to a bounded similarity score for display/threshold logic.
        similarity = 1.0 / (1.0 + float(distance))
        normalised.append((doc, similarity))
    return normalised


def has_grounded_context(results: List[Tuple[Document, float]]) -> bool:
    return any(score >= RELEVANCE_THRESHOLD for _, score in results)
