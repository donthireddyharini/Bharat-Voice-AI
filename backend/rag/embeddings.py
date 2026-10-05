"""Multilingual embedding model wrapper (Hugging Face sentence-transformers via LangChain)."""
import os
from functools import lru_cache
from langchain_huggingface import HuggingFaceEmbeddings

# Multilingual model: works across English, Hindi, Telugu, Kannada and 50+ languages.
EMBEDDING_MODEL = os.getenv(
    "EMBEDDING_MODEL", "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
)


@lru_cache(maxsize=1)
def get_embeddings():
    return HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL,
        encode_kwargs={"normalize_embeddings": True}
    )
