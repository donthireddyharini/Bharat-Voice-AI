from fastapi import APIRouter
from models.schemas import SearchRequest, SearchResponse, SearchResultItem
from rag.retriever import retrieve

router = APIRouter()


@router.post("/search", response_model=SearchResponse)
def search(payload: SearchRequest):
    if not payload.query.strip():
        return SearchResponse(results=[], query=payload.query)

    results = retrieve(payload.query, top_k=payload.top_k)
    items = [
        SearchResultItem(
            doc_id=doc.metadata["doc_id"],
            title=doc.metadata["title"],
            category=doc.metadata["category"],
            snippet=doc.page_content.splitlines()[2].replace("Description: ", "")[:220],
            score=round(score, 3),
            source=doc.metadata["source"],
        )
        for doc, score in results
    ]
    return SearchResponse(results=items, query=payload.query)
