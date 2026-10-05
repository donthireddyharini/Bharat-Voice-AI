from fastapi import APIRouter
from rag.vector_store import get_vector_store
from services import llm_client

router = APIRouter()


@router.get("/health")
def health():
    try:
        store = get_vector_store()
        vector_count = store.index.ntotal
    except Exception as exc:
        vector_count = f"error: {exc}"
    from database.supabase_client import is_supabase_configured
    return {
        "status": "ok",
        "service": "BharathVoice AI backend",
        "vector_index_size": vector_count,
        "llm_configured": llm_client.is_configured(),
        "supabase_configured": is_supabase_configured(),
    }
