"""CLI helper: `python -m rag.load_kb` builds/rebuilds the FAISS index from knowledge_base/*.json"""
from rag.vector_store import build_index

if __name__ == "__main__":
    store = build_index()
    print(f"FAISS index built and saved. Vectors: {store.index.ntotal}")
