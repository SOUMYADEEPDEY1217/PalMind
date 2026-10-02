from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import Task, Memory, Document, Note
from app.schemas.schemas import GlobalSearchOut, SearchResultItem
from app.services.vector_store import vector_store

router = APIRouter()

@router.get("/search", response_model=GlobalSearchOut)
def global_search(
    q: str = Query(..., min_length=1),
    limit: int = 20,
    db: Session = Depends(get_db)
):
    query_str = q.strip()
    results: list[SearchResultItem] = []

    # 1. Search Tasks
    tasks = db.query(Task).filter(
        (Task.title.ilike(f"%{query_str}%")) |
        (Task.description.ilike(f"%{query_str}%")) |
        (Task.category.ilike(f"%{query_str}%"))
    ).limit(8).all()

    for t in tasks:
        results.append(SearchResultItem(
            id=t.id,
            type="task",
            title=t.title,
            content=t.description or "",
            snippet=f"Priority: {t.priority} • Status: {t.status} • Category: {t.category}",
            date=t.created_at,
            metadata={"status": t.status, "priority": t.priority, "category": t.category}
        ))

    # 2. Search Memories (Semantic + keyword)
    memories = vector_store.search_memories(db, query=query_str, top_k=6, min_similarity=0.20)
    for m in memories:
        results.append(SearchResultItem(
            id=m["id"],
            type="memory",
            title=f"Memory ({m['memory_type']})",
            content=m["content"],
            snippet=m["content"],
            date=m["created_at"],
            metadata={"memory_type": m["memory_type"], "importance": m["importance"]}
        ))

    # 3. Search Documents
    docs = db.query(Document).filter(
        (Document.filename.ilike(f"%{query_str}%")) |
        (Document.summary.ilike(f"%{query_str}%"))
    ).limit(5).all()

    for d in docs:
        results.append(SearchResultItem(
            id=d.id,
            type="document",
            title=d.filename,
            content=d.summary or "",
            snippet=d.summary or f"Uploaded {d.file_type.upper()} document with {d.chunk_count} chunks",
            date=d.created_at,
            metadata={"file_type": d.file_type, "chunk_count": d.chunk_count}
        ))

    # 4. Search Notes
    notes = db.query(Note).filter(
        (Note.title.ilike(f"%{query_str}%")) |
        (Note.content.ilike(f"%{query_str}%"))
    ).limit(5).all()

    for n in notes:
        results.append(SearchResultItem(
            id=n.id,
            type="note",
            title=n.title,
            content=n.content,
            snippet=n.content[:150] + ("..." if len(n.content) > 150 else ""),
            date=n.created_at,
            metadata={"category": n.category}
        ))

    return GlobalSearchOut(
        query=query_str,
        total_results=len(results),
        results=results[:limit]
    )
