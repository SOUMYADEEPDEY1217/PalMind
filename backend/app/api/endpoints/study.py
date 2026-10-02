import json
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.connection import get_db
from app.database.models import StudySession, ActivityLog
from app.schemas.schemas import StudyPlanRequest, StudyPlanResponse, StudySessionCreate, StudySessionOut, StudyStatsOut
from app.services.rag_service import rag_service

router = APIRouter()

@router.post("/study/plan", response_model=StudyPlanResponse)
async def generate_study_plan(data: StudyPlanRequest, db: Session = Depends(get_db)):
    plan_data = await rag_service.generate_study_plan(
        db=db,
        subject=data.subject,
        duration_minutes=data.duration_minutes,
        focus_topic=data.focus_topic,
        document_id=data.document_id
    )
    return StudyPlanResponse(**plan_data)

@router.post("/study/session", response_model=StudySessionOut, status_code=201)
def save_study_session(data: StudySessionCreate, db: Session = Depends(get_db)):
    session = StudySession(
        title=data.title,
        subject=data.subject,
        duration_minutes=data.duration_minutes,
        actual_duration_minutes=data.actual_duration_minutes,
        planned_topics_json=json.dumps(data.planned_topics),
        completed=data.completed
    )
    db.add(session)
    db.add(ActivityLog(
        action="complete_study_session",
        details=f"Completed {session.actual_duration_minutes} min study session on {session.subject}"
    ))
    db.commit()
    db.refresh(session)

    return StudySessionOut(
        id=session.id,
        title=session.title,
        subject=session.subject,
        duration_minutes=session.duration_minutes,
        planned_topics=data.planned_topics,
        completed=session.completed,
        actual_duration_minutes=session.actual_duration_minutes,
        created_at=session.created_at
    )

@router.get("/study/stats", response_model=StudyStatsOut)
def get_study_stats(db: Session = Depends(get_db)):
    now = datetime.datetime.now(datetime.timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - datetime.timedelta(days=today_start.weekday())

    # Today's sessions
    today_sessions = db.query(StudySession).filter(
        StudySession.created_at >= today_start,
        StudySession.completed == True
    ).all()
    sessions_today = len(today_sessions)
    today_minutes = sum(s.actual_duration_minutes for s in today_sessions)

    # Week's sessions
    week_sessions = db.query(StudySession).filter(
        StudySession.created_at >= week_start,
        StudySession.completed == True
    ).all()
    weekly_minutes = sum(s.actual_duration_minutes for s in week_sessions)

    # All-time minutes
    total_minutes = db.query(func.sum(StudySession.actual_duration_minutes)).filter(
        StudySession.completed == True
    ).scalar() or 0

    # Recent sessions
    recent_db = db.query(StudySession).order_by(StudySession.created_at.desc()).limit(10).all()
    recent_out = []
    for s in recent_db:
        topics = []
        if s.planned_topics_json:
            try:
                topics = json.loads(s.planned_topics_json)
            except Exception:
                topics = []
        recent_out.append(StudySessionOut(
            id=s.id,
            title=s.title,
            subject=s.subject,
            duration_minutes=s.duration_minutes,
            planned_topics=topics,
            completed=s.completed,
            actual_duration_minutes=s.actual_duration_minutes,
            created_at=s.created_at
        ))

    return StudyStatsOut(
        sessions_today=sessions_today,
        today_minutes=today_minutes,
        total_study_minutes=int(total_minutes),
        weekly_study_minutes=weekly_minutes,
        recent_sessions=recent_out
    )
