import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import UserProfile, Task, Reminder, Memory, Document
from app.schemas.schemas import DailyBriefOut, TaskOut, ReminderOut, MemoryOut, DocumentOut
from app.services.ollama_service import ollama_service

router = APIRouter()

@router.get("/daily-brief", response_model=DailyBriefOut)
async def get_daily_brief(db: Session = Depends(get_db)):
    user = db.query(UserProfile).first()
    user_name = user.name if user else "Friend"

    now = datetime.datetime.now(datetime.timezone.utc)
    hour = now.hour
    if 5 <= hour < 12:
        greeting = f"Good morning, {user_name}"
    elif 12 <= hour < 17:
        greeting = f"Good afternoon, {user_name}"
    elif 17 <= hour < 22:
        greeting = f"Good evening, {user_name}"
    else:
        greeting = f"Good night, {user_name}"

    # 1. Urgent & active tasks
    tasks = db.query(Task).filter(Task.status != "Completed").order_by(Task.ai_priority_score.desc()).all()
    urgent_tasks = [t for t in tasks if t.priority in ("Urgent", "High") or t.ai_priority_score >= 40][:5]
    
    # 2. Upcoming deadlines within 7 days
    seven_days = now + datetime.timedelta(days=7)
    upcoming_deadlines = [
        t for t in tasks
        if t.due_date and (t.due_date.replace(tzinfo=datetime.timezone.utc) if t.due_date.tzinfo is None else t.due_date) <= seven_days
    ][:5]

    # 3. Pending reminders
    reminders = db.query(Reminder).filter(Reminder.completed == False).order_by(Reminder.remind_at.asc()).limit(5).all()

    # 4. Forgotten commitments or promises
    commitments = db.query(Memory).filter(
        (Memory.memory_type == "Commitment") | 
        (Memory.content.ilike("%promised%")) | 
        (Memory.content.ilike("%promise%"))
    ).order_by(Memory.created_at.desc()).limit(3).all()

    # 5. Recent documents
    recent_docs = db.query(Document).order_by(Document.created_at.desc()).limit(3).all()

    # 6. Generate AI Focus For Today
    focus_summary = ""
    context_items = []
    if upcoming_deadlines:
        first_d = upcoming_deadlines[0]
        context_items.append(f"Upcoming deadline: {first_d.title} (due {first_d.due_date})")
    if urgent_tasks:
        context_items.append(f"Top priority task: {urgent_tasks[0].title} (priority: {urgent_tasks[0].priority})")
    if commitments:
        context_items.append(f"Promise to keep: {commitments[0].content}")

    context_str = "; ".join(context_items) if context_items else "No critical deadlines or commitments."

    try:
        status = await ollama_service.get_status()
        if status["available"] and context_items:
            prompt = f"""You are PalMind, private AI companion for {user_name}.
Current active items: {context_str}

Write a direct, 2-3 sentence 'FOCUS FOR TODAY' summary advising what {user_name} should prioritize and tackle first today.
Be motivating, realistic, and specific."""
            focus_summary = await ollama_service.generate(prompt, temperature=0.3)
        else:
            if upcoming_deadlines:
                focus_summary = f"Your top deadline is '{upcoming_deadlines[0].title}'. Tackle this first to stay ahead of your schedule."
            elif urgent_tasks:
                focus_summary = f"Focus on '{urgent_tasks[0].title}'. It carries your highest priority rating today."
            elif commitments:
                focus_summary = f"Remember your promise: '{commitments[0].content}'. Check in on this early."
            else:
                focus_summary = "All clear! You have no pressing deadlines today. Great time for deep learning or tackling backlog items."
    except Exception:
        focus_summary = "Focus on your highest priority task and keep your momentum going today!"

    recommended_study = {
        "subject": upcoming_deadlines[0].category if upcoming_deadlines else "Revision",
        "recommended_minutes": 45,
        "reason": f"Based on your upcoming deadline for '{upcoming_deadlines[0].title}'" if upcoming_deadlines else "Daily maintenance study block"
    }

    return DailyBriefOut(
        date=now.strftime("%A, %B %d, %Y"),
        user_name=user_name,
        greeting=greeting,
        focus_for_today=focus_summary,
        urgent_tasks=urgent_tasks,
        upcoming_deadlines=upcoming_deadlines,
        pending_reminders=reminders,
        recommended_study=recommended_study,
        forgotten_commitments=commitments,
        recent_documents=recent_docs,
        motivational_tip="Small consistent efforts compound into remarkable achievements. Protect your focus."
    )
