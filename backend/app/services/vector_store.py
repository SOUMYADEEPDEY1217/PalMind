import json
import logging
from typing import Optional
import numpy as np
from sqlalchemy.orm import Session
from app.database.models import DocumentChunk, Document, Memory
from app.services.embedding_service import embedding_service

logger = logging.getLogger("palmind.vector_store")

class VectorStore:
    def __init__(self):
        pass

    def search_document_chunks(
        self,
        db: Session,
        query: str,
        document_id: Optional[int] = None,
        top_k: int = 5,
        min_similarity: float = 0.25
    ) -> list[dict]:
        """Search document chunks using semantic similarity."""
        query_vec = np.array(embedding_service.encode(query), dtype=np.float32)
        norm_q = np.linalg.norm(query_vec)
        if norm_q == 0:
            return []

        # Query chunks from DB
        q = db.query(DocumentChunk, Document).join(Document, DocumentChunk.document_id == Document.id)
        if document_id is not None:
            q = q.filter(DocumentChunk.document_id == document_id)
        
        records = q.all()
        if not records:
            return []

        results = []
        for chunk, doc in records:
            if not chunk.embedding:
                continue
            try:
                emb = np.array(json.loads(chunk.embedding), dtype=np.float32)
                norm_e = np.linalg.norm(emb)
                if norm_e > 0:
                    sim = float(np.dot(query_vec, emb) / (norm_q * norm_e))
                else:
                    sim = 0.0

                if sim >= min_similarity:
                    results.append({
                        "chunk_id": chunk.id,
                        "document_id": doc.id,
                        "filename": doc.filename,
                        "content": chunk.content,
                        "page_number": chunk.page_number,
                        "similarity": sim
                    })
            except Exception as e:
                continue

        # Sort by similarity descending
        results.sort(key=lambda x: x["similarity"], reverse=True)
        return results[:top_k]

    def search_memories(
        self,
        db: Session,
        query: str,
        memory_type: Optional[str] = None,
        top_k: int = 5,
        min_similarity: float = 0.20
    ) -> list[dict]:
        """Search user memories using semantic similarity."""
        query_vec = np.array(embedding_service.encode(query), dtype=np.float32)
        norm_q = np.linalg.norm(query_vec)
        if norm_q == 0:
            return []

        q = db.query(Memory)
        if memory_type:
            q = q.filter(Memory.memory_type == memory_type)

        memories = q.all()
        results = []

        for mem in memories:
            sim = 0.0
            if mem.embedding:
                try:
                    emb = np.array(json.loads(mem.embedding), dtype=np.float32)
                    norm_e = np.linalg.norm(emb)
                    if norm_e > 0:
                        sim = float(np.dot(query_vec, emb) / (norm_q * norm_e))
                except Exception:
                    sim = 0.0
            
            # Keyword token overlap boost for grounded ranking
            q_lower = query.lower()
            m_lower = mem.content.lower()
            matching_terms = [t for t in q_lower.split() if len(t) > 2 and t in m_lower]
            if matching_terms:
                sim += 0.3 * len(matching_terms)

            if sim >= min_similarity:
                results.append({
                    "id": mem.id,
                    "content": mem.content,
                    "memory_type": mem.memory_type,
                    "importance": mem.importance,
                    "source": mem.source,
                    "is_pinned": mem.is_pinned,
                    "similarity": sim,
                    "created_at": mem.created_at,
                    "last_accessed": mem.last_accessed
                })

        # Pinned memories get a slight boost
        results.sort(key=lambda x: (x["is_pinned"], x["similarity"]), reverse=True)
        return results[:top_k]

vector_store = VectorStore()
