import os
import json
import logging
import shutil
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import Document, DocumentChunk, ActivityLog
from app.schemas.schemas import DocumentOut, DocumentAskQuery, SourceCitation
from app.services.document_parser import document_parser
from app.services.embedding_service import embedding_service
from app.services.vector_store import vector_store
from app.services.ollama_service import ollama_service
from app.config import settings

logger = logging.getLogger("palmind.documents")
router = APIRouter()

@router.get("/documents", response_model=list[DocumentOut])
def get_documents(db: Session = Depends(get_db)):
    return db.query(Document).order_by(Document.created_at.desc()).all()

@router.post("/documents/upload", response_model=DocumentOut, status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # 1. Validate file extension
    clean_filename = document_parser.sanitize_filename(file.filename or "uploaded_file")
    if not document_parser.is_allowed_file(clean_filename):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format. Supported formats: PDF, TXT, Markdown, DOCX."
        )

    # 2. Check file size during streaming write
    file_ext = Path(clean_filename).suffix.lower().lstrip(".")
    save_path = settings.UPLOAD_DIR / clean_filename
    
    # Avoid overwriting identically named files
    counter = 1
    base_stem = Path(clean_filename).stem
    while save_path.exists():
        clean_filename = f"{base_stem}_{counter}.{file_ext}"
        save_path = settings.UPLOAD_DIR / clean_filename
        counter += 1

    total_bytes = 0
    max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024

    try:
        with open(save_path, "wb") as buffer:
            while chunk := await file.read(1024 * 1024):  # 1MB buffer
                total_bytes += len(chunk)
                if total_bytes > max_bytes:
                    raise HTTPException(
                        status_code=400,
                        detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_MB}MB."
                    )
                buffer.write(chunk)
    except HTTPException:
        if save_path.exists():
            os.remove(save_path)
        raise
    except Exception as e:
        if save_path.exists():
            os.remove(save_path)
        raise HTTPException(status_code=500, detail=f"Failed to save uploaded file: {str(e)}")

    # 3. Create Document DB entry
    doc = Document(
        filename=clean_filename,
        file_type=file_ext,
        file_path=str(save_path),
        file_size=total_bytes,
        processing_status="processing"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # 4. Extract text & Chunk
    try:
        pages_data = document_parser.extract_text_and_pages(str(save_path), file_ext)
        if not pages_data:
            doc.processing_status = "failed"
            doc.error_message = "No readable text content found in document."
            db.commit()
            return doc

        chunks = document_parser.chunk_document(pages_data)
        if not chunks:
            doc.processing_status = "failed"
            doc.error_message = "Could not generate text chunks from document."
            db.commit()
            return doc

        # 5. Generate embeddings for chunks
        chunk_texts = [c["content"] for c in chunks]
        embeddings = embedding_service.encode_batch(chunk_texts)

        # 6. Save chunks in DB
        for c, emb in zip(chunks, embeddings):
            db_chunk = DocumentChunk(
                document_id=doc.id,
                content=c["content"],
                chunk_index=c["chunk_index"],
                page_number=c.get("page_number"),
                embedding=json.dumps(emb)
            )
            db.add(db_chunk)

        doc.chunk_count = len(chunks)
        doc.processing_status = "completed"

        # 7. Generate brief summary using first few chunks
        intro_text = " ".join([c["content"] for c in chunks[:3]])[:1200]
        try:
            status = await ollama_service.get_status()
            if status["available"]:
                summary_prompt = f"Summarize this document excerpt in 2-3 clear, informative sentences:\n\n{intro_text}"
                doc.summary = await ollama_service.generate(summary_prompt, temperature=0.2)
            else:
                doc.summary = intro_text[:250] + "..."
        except Exception:
            doc.summary = intro_text[:250] + "..."

        db.add(ActivityLog(action="upload_document", details=f"Uploaded and indexed: {doc.filename} ({doc.chunk_count} chunks)"))
        db.commit()
        db.refresh(doc)
        return doc

    except Exception as e:
        logger.error(f"Document processing failed: {e}")
        doc.processing_status = "failed"
        doc.error_message = str(e)
        db.commit()
        return doc

@router.get("/documents/{document_id}", response_model=DocumentOut)
def get_document(document_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.delete("/documents/{document_id}", status_code=200)
def delete_document(document_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Remove file from disk
    try:
        if os.path.exists(doc.file_path):
            os.remove(doc.file_path)
    except Exception as e:
        logger.warning(f"Failed to remove file from disk: {e}")

    db.delete(doc)
    db.commit()
    return {"message": "Document deleted successfully", "id": document_id}

@router.post("/documents/{document_id}/ask")
async def ask_document(
    document_id: int,
    query: DocumentAskQuery,
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Search chunks in this document
    chunks = vector_store.search_document_chunks(
        db=db,
        query=query.question,
        document_id=document_id,
        top_k=4,
        min_similarity=0.15
    )

    if not chunks:
        # Fallback to first 2 chunks if no similarity match
        first_chunks = db.query(DocumentChunk).filter(DocumentChunk.document_id == document_id).limit(3).all()
        chunks = [{
            "chunk_id": c.id,
            "filename": doc.filename,
            "content": c.content,
            "page_number": c.page_number,
            "similarity": 0.5
        } for c in first_chunks]

    context_str = "\n\n".join([
        f"[Page {c.get('page_number') or 1}]: {c['content']}"
        for c in chunks
    ])

    citations = [
        SourceCitation(
            type="document",
            title=doc.filename,
            snippet=c["content"][:200] + ("..." if len(c["content"]) > 200 else ""),
            page=c.get("page_number"),
            id=doc.id
        )
        for c in chunks
    ]

    prompt = f"""You are PalMind Document Assistant.
DOCUMENT: {doc.filename}
EXCERPTS:
{context_str}

USER QUESTION:
{query.question}

Answer the user's question accurately using ONLY information from the excerpts above.
Mention page numbers where relevant. If the answer cannot be found in the document, explicitly say so."""

    try:
        answer = await ollama_service.generate(prompt, temperature=0.2)
    except Exception as e:
        answer = f"*(Local AI is currently offline)* Found relevant passage in {doc.filename}:\n\n" + (chunks[0]["content"] if chunks else "No relevant excerpts.")

    return {
        "document_id": doc.id,
        "filename": doc.filename,
        "question": query.question,
        "answer": answer,
        "sources": citations
    }
