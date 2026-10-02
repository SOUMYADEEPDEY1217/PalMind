from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import Reminder, ActivityLog
from app.schemas.schemas import ReminderCreate, ReminderUpdate, ReminderOut

router = APIRouter()

@router.get("/reminders", response_model=list[ReminderOut])
def get_reminders(completed: Optional[bool] = None, db: Session = Depends(get_db)):
    q = db.query(Reminder)
    if completed is not None:
        q = q.filter(Reminder.completed == completed)
    return q.order_by(Reminder.remind_at.asc()).all()

@router.post("/reminders", response_model=ReminderOut, status_code=201)
def create_reminder(data: ReminderCreate, db: Session = Depends(get_db)):
    reminder = Reminder(
        title=data.title.strip(),
        description=data.description,
        remind_at=data.remind_at,
        completed=False
    )
    db.add(reminder)
    db.add(ActivityLog(action="create_reminder", details=f"Scheduled reminder: {reminder.title}"))
    db.commit()
    db.refresh(reminder)
    return reminder

@router.put("/reminders/{reminder_id}", response_model=ReminderOut)
def update_reminder(reminder_id: int, data: ReminderUpdate, db: Session = Depends(get_db)):
    rem = db.query(Reminder).filter(Reminder.id == reminder_id).first()
    if not rem:
        raise HTTPException(status_code=404, detail="Reminder not found")

    if data.title is not None:
        rem.title = data.title.strip()
    if data.description is not None:
        rem.description = data.description
    if data.remind_at is not None:
        rem.remind_at = data.remind_at
    if data.completed is not None:
        rem.completed = data.completed

    db.commit()
    db.refresh(rem)
    return rem

@router.delete("/reminders/{reminder_id}", status_code=200)
def delete_reminder(reminder_id: int, db: Session = Depends(get_db)):
    rem = db.query(Reminder).filter(Reminder.id == reminder_id).first()
    if not rem:
        raise HTTPException(status_code=404, detail="Reminder not found")
    db.delete(rem)
    db.commit()
    return {"message": "Reminder deleted successfully", "id": reminder_id}
