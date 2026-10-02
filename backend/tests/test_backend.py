import os
os.environ["TESTING"] = "1"
import json
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.config import settings
from app.database.connection import Base, get_db
from app.database.models import UserProfile, Task, Memory, Document, StudySession, Reminder

# Test in-memory SQLite database
TEST_DB_URL = "sqlite:///./data/test_palmind.db"
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    engine.dispose()
    if os.path.exists("./data/test_palmind.db"):
        try:
            os.remove("./data/test_palmind.db")
        except Exception:
            pass

@pytest.fixture
def client():
    return TestClient(app)

def test_health_check(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert "status" in data
    assert "ai" in data

def test_profile_onboarding(client):
    # Initial profile
    res = client.get("/api/profile")
    assert res.status_code == 200
    assert res.json()["name"] == "Friend"

    # Update profile during onboarding
    res = client.put("/api/profile", json={
        "name": "Alex",
        "goal": "Prepare for university exams",
        "productive_time": "Morning",
        "onboarded": True
    })
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "Alex"
    assert data["goal"] == "Prepare for university exams"
    assert data["onboarded"] is True

def test_task_crud_and_priority(client):
    # Create task with deadline
    res = client.post("/api/tasks", json={
        "title": "Revise Computer Networks before October 10",
        "category": "Academic",
        "priority": "High",
        "status": "To Do",
        "estimated_minutes": 90
    })
    assert res.status_code == 201
    task = res.json()
    assert task["title"] == "Revise Computer Networks before October 10"
    assert task["priority"] == "High"
    assert task["ai_priority_score"] > 0
    assert task["ai_priority_reason"] is not None
    task_id = task["id"]

    # Smart natural language task
    smart_res = client.post("/api/tasks/smart", json={
        "text": "Finish MongoDB assignment by Friday at 5 PM"
    })
    assert smart_res.status_code == 201
    smart_task = smart_res.json()
    assert "MongoDB" in smart_task["title"]
    assert smart_task["priority"] in ["Medium", "High", "Urgent"]

    # List tasks
    list_res = client.get("/api/tasks")
    assert list_res.status_code == 200
    tasks = list_res.json()
    assert len(tasks) >= 2

    # Update task
    up_res = client.put(f"/api/tasks/{task_id}", json={"status": "In Progress"})
    assert up_res.status_code == 200
    assert up_res.json()["status"] == "In Progress"

def test_memory_crud_and_semantic_search(client):
    # Add memory
    res = client.post("/api/memories", json={
        "content": "Professor said ARQ and Hamming Code are important for the exam.",
        "importance": 5
    })
    assert res.status_code == 201
    mem = res.json()
    assert "ARQ" in mem["content"]
    assert mem["memory_type"] in ["Academic", "Deadline", "Exam"]

    # Add promise commitment memory
    res2 = client.post("/api/memories", json={
        "content": "I promised Rahul I'll send the presentation tomorrow.",
        "importance": 4
    })
    assert res2.status_code == 201
    assert res2.json()["memory_type"] == "Commitment"

    # Search memories
    s_res = client.post("/api/memories/search", json={
        "query": "Hamming Code exam topics"
    })
    assert s_res.status_code == 200
    results = s_res.json()
    assert len(results) > 0
    assert "ARQ" in results[0]["content"]

def test_document_upload_and_invalid_handling(client, tmp_path):
    # Test invalid file format
    res_bad = client.post(
        "/api/documents/upload",
        files={"file": ("malicious.exe", b"binarycontent", "application/octet-stream")}
    )
    assert res_bad.status_code == 400
    assert "Unsupported file format" in res_bad.json()["detail"]

    # Test valid text/markdown upload
    content = b"""# Computer Networks Notes

Chapter 4: Data Link Layer
ARQ (Automatic Repeat reQuest) protocols include:
1. Stop-and-Wait ARQ
2. Go-Back-N ARQ
3. Selective Repeat ARQ

Hamming Code is used for error detection and correction.
It uses parity bits calculated at powers of 2."""

    res_good = client.post(
        "/api/documents/upload",
        files={"file": ("CN_Notes.txt", content, "text/plain")}
    )
    assert res_good.status_code == 201
    doc = res_good.json()
    assert doc["filename"].startswith("CN_Notes")
    assert doc["processing_status"] == "completed"
    assert doc["chunk_count"] >= 1

    # Ask document
    doc_id = doc["id"]
    ask_res = client.post(f"/api/documents/{doc_id}/ask", json={"question": "What is Hamming Code used for?"})
    assert ask_res.status_code == 200
    assert "answer" in ask_res.json()
    assert len(ask_res.json()["sources"]) > 0

def test_study_session_and_stats(client):
    # Study plan
    plan_res = client.post("/api/study/plan", json={
        "subject": "Computer Networks",
        "duration_minutes": 25,
        "focus_topic": "ARQ Protocols"
    })
    assert plan_res.status_code == 200
    assert len(plan_res.json()["plan"]) > 0

    # Save completed study session
    sess_res = client.post("/api/study/session", json={
        "title": "CN Sprint",
        "subject": "Computer Networks",
        "duration_minutes": 25,
        "actual_duration_minutes": 25,
        "completed": True
    })
    assert sess_res.status_code == 201

    # Check stats
    stats_res = client.get("/api/study/stats")
    assert stats_res.status_code == 200
    data = stats_res.json()
    assert data["sessions_today"] >= 1
    assert data["today_minutes"] >= 25

def test_reminders_crud(client):
    res = client.post("/api/reminders", json={
        "title": "Revise CN Chapter 3",
        "description": "Look over sliding window notes",
        "remind_at": "2026-10-10T19:00:00"
    })
    assert res.status_code == 201
    rem = res.json()
    rem_id = rem["id"]

    list_res = client.get("/api/reminders")
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # Complete reminder
    up = client.put(f"/api/reminders/{rem_id}", json={"completed": True})
    assert up.status_code == 200
    assert up.json()["completed"] is True

def test_daily_brief(client):
    res = client.get("/api/daily-brief")
    assert res.status_code == 200
    data = res.json()
    assert "Good" in data["greeting"]
    assert "Alex" in data["greeting"]
    assert "focus_for_today" in data
    assert len(data["focus_for_today"]) > 0

def test_global_search(client):
    res = client.get("/api/search?q=Computer Networks")
    assert res.status_code == 200
    data = res.json()
    assert data["total_results"] >= 1
    types_found = {r["type"] for r in data["results"]}
    assert "task" in types_found or "document" in types_found

def test_data_export_and_reset(client):
    # Test export
    export_res = client.get("/api/export")
    assert export_res.status_code == 200
    export_data = export_res.json()
    assert "tasks" in export_data
    assert "memories" in export_data
    assert "documents" in export_data
    assert len(export_data["tasks"]) >= 1

    # Test reset with confirmation
    reset_res = client.delete("/api/data?confirm=true")
    assert reset_res.status_code == 200

    # Verify cleared
    tasks_res = client.get("/api/tasks")
    assert len(tasks_res.json()) == 0
