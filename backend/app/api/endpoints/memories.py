import json
import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import Memory, ActivityLog
from app.schemas.schemas import MemoryCreate, MemoryUpdate, MemoryOut, MemorySearchQuery
from app.services.embedding_service import embedding_service
from app.services.vector_store import vector_store
from app.services.rag_service import rag_service

router = APIRouter()

@router.get("/memories", response_model=list[MemoryOut])
def get_memories(
    memory_type: Optional[str] = None,
    search: Optional[str] = None,
    pinned_first: bool = True,
    db: Session = Depends(get_db)
):
    query = db.query(Memory)
    if memory_type:
        query = query.filter(Memory.memory_type == memory_type)
    if search:
        query = query.filter(Memory.content.ilike(f"%{search}%"))

    if pinned_first:
        memories = query.order_by(Memory.is_pinned.desc(), Memory.created_at.desc()).all()
    else:
        memories = query.order_by(Memory.created_at.desc()).all()

    return memories

@router.post("/memories", response_model=MemoryOut, status_code=201)
def create_memory(data: MemoryCreate, db: Session = Depends(get_db)):
    # Classify memory if type is empty or 'Other'
    mem_type = data.memory_type
    importance = data.importance
    if not mem_type or mem_type == "Other":
        auto_type, auto_imp = rag_service.classify_memory(data.content)
        mem_type = mem_type or auto_type
        importance = auto_imp or importance

    # Compute dense vector embedding
    embedding_vec = embedding_service.encode(data.content)

    memory = Memory(
        content=data.content.strip(),
        memory_type=mem_type or "Other",
        importance=importance,
        source=data.source,
        is_pinned=False,
        embedding=json.dumps(embedding_vec)
    )
    db.add(memory)
    db.add(ActivityLog(action="create_memory", details=f"New memory ({memory.memory_type}): {memory.content[:50]}..."))
    db.commit()
    db.refresh(memory)
    return memory

@router.post("/memories/search", response_model=list[MemoryOut])
def search_memories(data: MemorySearchQuery, db: Session = Depends(get_db)):
    results = vector_store.search_memories(
        db=db,
        query=data.query,
        memory_type=data.memory_type,
        top_k=data.limit,
        min_similarity=0.15
    )
    
    # Update last_accessed for top retrieved memory
    if results:
        top_id = results[0]["id"]
        top_mem = db.query(Memory).filter(Memory.id == top_id).first()
        if top_mem:
            top_mem.last_accessed = datetime.datetime.now(datetime.timezone.utc)
            db.commit()

    return results

@router.put("/memories/{memory_id}", response_model=MemoryOut)
def update_memory(memory_id: int, data: MemoryUpdate, db: Session = Depends(get_db)):
    memory = db.query(Memory).filter(Memory.id == memory_id).first()
    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found")

    if data.content is not None:
        memory.content = data.content.strip()
        # Re-encode embedding
        new_vec = embedding_service.encode(memory.content)
        memory.embedding = json.dumps(new_vec)
    if data.memory_type is not None:
        memory.memory_type = data.memory_type
    if data.importance is not None:
        memory.importance = data.importance
    if data.is_pinned is not None:
        memory.is_pinned = data.is_pinned

    memory.last_accessed = datetime.datetime.now(datetime.timezone.utc)
    db.commit()
    db.refresh(memory)
    return memory

@router.delete("/memories/{memory_id}", status_code=200)
def delete_memory(memory_id: int, db: Session = Depends(get_db)):
    memory = db.query(Memory).filter(Memory.id == memory_id).first()
    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found")
    db.delete(memory)
    db.commit()
    return {"message": "Memory deleted successfully", "id": memory_id}
