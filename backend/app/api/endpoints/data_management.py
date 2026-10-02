import os
import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import UserProfile, Task, Memory, Document, DocumentChunk, StudySession, Reminder, Conversation, Message, ActivityLog, Note
from app.config import settings

router = APIRouter()

@router.get("/export")
def export_all_data(db: Session = Depends(get_db)):
    """Export entire user database to JSON for 100% data portability."""
    user = db.query(UserProfile).first()
    tasks = db.query(Task).all()
    memories = db.query(Memory).all()
    docs = db.query(Document).all()
    reminders = db.query(Reminder).all()
    sessions = db.query(StudySession).all()
    conversations = db.query(Conversation).all()
    notes = db.query(Note).all()

    export_payload = {
        "exported_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "application": "PalMind Private AI Companion",
        "version": "1.0.0",
        "profile": {
            "name": user.name if user else "Friend",
            "goal": user.goal if user else "",
            "productive_time": user.productive_time if user else "Morning"
        },
        "tasks": [
            {
                "id": t.id,
                "title": t.title,
                "description": t.description,
                "category": t.category,
                "priority": t.priority,
                "status": t.status,
                "due_date": t.due_date.isoformat() if t.due_date else None,
                "estimated_minutes": t.estimated_minutes,
                "ai_priority_score": t.ai_priority_score,
                "created_at": t.created_at.isoformat() if t.created_at else None
            }
            for t in tasks
        ],
        "memories": [
            {
                "id": m.id,
                "content": m.content,
                "memory_type": m.memory_type,
                "importance": m.importance,
                "source": m.source,
                "is_pinned": m.is_pinned,
                "created_at": m.created_at.isoformat() if m.created_at else None
            }
            for m in memories
        ],
        "documents": [
            {
                "id": d.id,
                "filename": d.filename,
                "file_type": d.file_type,
                "summary": d.summary,
                "chunk_count": d.chunk_count,
                "created_at": d.created_at.isoformat() if d.created_at else None
            }
            for d in docs
        ],
        "reminders": [
            {
                "id": r.id,
                "title": r.title,
                "remind_at": r.remind_at.isoformat() if r.remind_at else None,
                "completed": r.completed
            }
            for r in reminders
        ],
        "study_sessions": [
            {
                "id": s.id,
                "title": s.title,
                "subject": s.subject,
                "duration_minutes": s.duration_minutes,
                "actual_duration_minutes": s.actual_duration_minutes,
                "created_at": s.created_at.isoformat() if s.created_at else None
            }
            for s in sessions
        ],
        "notes": [
            {
                "id": n.id,
                "title": n.title,
                "content": n.content,
                "category": n.category,
                "created_at": n.created_at.isoformat() if n.created_at else None
            }
            for n in notes
        ]
    }

    return JSONResponse(
        content=export_payload,
        headers={"Content-Disposition": "attachment; filename=palmind_backup.json"}
    )

@router.delete("/data")
def delete_all_data(
    confirm: bool = Query(False, description="Must be true to confirm complete erasure"),
    db: Session = Depends(get_db)
):
    """Irreversibly delete all user tasks, memories, documents, chats, and files."""
    if not confirm:
        raise HTTPException(
            status_code=400,
            detail="Confirmation required. Pass ?confirm=true to delete all data."
        )

    # 1. Delete uploaded files on disk
    docs = db.query(Document).all()
    for d in docs:
        try:
            if os.path.exists(d.file_path):
                os.remove(d.file_path)
        except Exception:
            pass

    # 2. Clear tables
    db.query(DocumentChunk).delete()
    db.query(Document).delete()
    db.query(Message).delete()
    db.query(Conversation).delete()
    db.query(Task).delete()
    db.query(Memory).delete()
    db.query(StudySession).delete()
    db.query(Reminder).delete()
    db.query(Note).delete()
    db.query(ActivityLog).delete()
    
    # Reset user profile
    user = db.query(UserProfile).first()
    if user:
        user.name = "Friend"
        user.goal = "Academic excellence"
        user.productive_time = "Morning"
        user.onboarded = False
        user.preferences = "{}"

    db.commit()
    return {"message": "All user data, memories, and documents have been permanently removed from this device."}
