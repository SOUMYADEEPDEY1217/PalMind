from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import Task, ActivityLog
from app.schemas.schemas import TaskCreate, TaskSmartCreate, TaskUpdate, TaskOut
from app.services.task_priority_service import task_priority_service

router = APIRouter()

@router.get("/tasks", response_model=list[TaskOut])
def get_tasks(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = Query("priority_score", pattern="^(priority_score|due_date|created_at)$"),
    db: Session = Depends(get_db)
):
    query = db.query(Task)
    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)
    if category:
        query = query.filter(Task.category == category)
    if search:
        query = query.filter(Task.title.ilike(f"%{search}%") | Task.description.ilike(f"%{search}%"))

    if sort_by == "priority_score":
        tasks = query.order_by(Task.ai_priority_score.desc(), Task.due_date.asc().nullslast()).all()
    elif sort_by == "due_date":
        tasks = query.order_by(Task.due_date.asc().nullslast(), Task.ai_priority_score.desc()).all()
    else:
        tasks = query.order_by(Task.created_at.desc()).all()

    return tasks

@router.post("/tasks", response_model=TaskOut, status_code=201)
def create_task(data: TaskCreate, db: Session = Depends(get_db)):
    score, reason = task_priority_service.calculate_priority_score(
        priority=data.priority,
        due_date=data.due_date,
        estimated_minutes=data.estimated_minutes,
        status=data.status
    )

    task = Task(
        title=data.title,
        description=data.description,
        category=data.category,
        priority=data.priority,
        status=data.status,
        due_date=data.due_date,
        estimated_minutes=data.estimated_minutes,
        ai_priority_score=score,
        ai_priority_reason=reason
    )
    db.add(task)
    db.add(ActivityLog(action="create_task", details=f"Created task: {task.title}"))
    db.commit()
    db.refresh(task)
    return task

@router.post("/tasks/smart", response_model=TaskOut, status_code=201)
async def create_smart_task(data: TaskSmartCreate, db: Session = Depends(get_db)):
    parsed = await task_priority_service.parse_natural_language_task(data.text)
    
    score, reason = task_priority_service.calculate_priority_score(
        priority=parsed["priority"],
        due_date=parsed["due_date"],
        estimated_minutes=parsed["estimated_minutes"],
        status="To Do"
    )

    task = Task(
        title=parsed["title"],
        description=f"Auto-extracted from: '{data.text}'",
        category=parsed["category"],
        priority=parsed["priority"],
        status="To Do",
        due_date=parsed["due_date"],
        estimated_minutes=parsed["estimated_minutes"],
        ai_priority_score=score,
        ai_priority_reason=reason
    )
    db.add(task)
    db.add(ActivityLog(action="create_smart_task", details=f"Natural language task added: {task.title}"))
    db.commit()
    db.refresh(task)
    return task

@router.get("/tasks/{task_id}", response_model=TaskOut)
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/tasks/{task_id}", response_model=TaskOut)
def update_task(task_id: int, data: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if data.title is not None:
        task.title = data.title
    if data.description is not None:
        task.description = data.description
    if data.category is not None:
        task.category = data.category
    if data.priority is not None:
        task.priority = data.priority
    if data.status is not None:
        task.status = data.status
    if data.due_date is not None:
        task.due_date = data.due_date
    if data.estimated_minutes is not None:
        task.estimated_minutes = data.estimated_minutes

    # Recalculate priority
    score, reason = task_priority_service.calculate_priority_score(
        priority=task.priority,
        due_date=task.due_date,
        estimated_minutes=task.estimated_minutes,
        status=task.status
    )
    task.ai_priority_score = score
    task.ai_priority_reason = reason

    db.commit()
    db.refresh(task)
    return task

@router.delete("/tasks/{task_id}", status_code=200)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully", "id": task_id}
