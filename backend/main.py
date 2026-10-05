"""
BharathVoice AI — FastAPI backend entrypoint.

Run with:  uvicorn main:app --reload --port 8000   (from inside backend/)
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.db import init_db
from api import chat, voice, document, search, translate, categories, sources, conversations, health, profile

app = FastAPI(
    title="BharathVoice AI API",
    description="Multilingual, voice-first public-service assistant for Bharat — RAG grounded in a trusted knowledge base.",
    version="1.0.0",
)

origins_env = os.getenv("CORS_ORIGINS", "*")
if origins_env.strip() == "*":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[o.strip() for o in origins_env.split(",") if o.strip()],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.on_event("startup")
def on_startup():
    init_db()
    # Pre-warm embeddings and vector store in memory so user queries return in <300ms immediately
    try:
        from rag.embeddings import get_embeddings
        from rag.vector_store import get_vector_store
        get_embeddings()
        get_vector_store()
        print("[Startup] Embeddings & FAISS vector store pre-warmed successfully!")
    except Exception as e:
        print(f"[Startup] Notice pre-warming models: {e}")


app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])
app.include_router(voice.router, prefix="/api", tags=["Voice"])
app.include_router(document.router, prefix="/api", tags=["Documents"])
app.include_router(search.router, prefix="/api", tags=["Search"])
app.include_router(translate.router, prefix="/api", tags=["Translate"])
app.include_router(categories.router, prefix="/api", tags=["Categories"])
app.include_router(sources.router, prefix="/api", tags=["Sources"])
app.include_router(conversations.router, prefix="/api", tags=["Conversations"])
app.include_router(profile.router, prefix="/api", tags=["Profile"])


@app.get("/")
def root():
    return {"message": "BharathVoice AI backend is running. See /docs for API documentation."}
