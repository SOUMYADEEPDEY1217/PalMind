import os
import sys
import json
import datetime
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from app.database.connection import SessionLocal, init_db
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
from app.database.models import UserProfile, Task, Memory, Document, DocumentChunk, StudySession, Reminder, Note, ActivityLog
from app.services.embedding_service import embedding_service
from app.services.task_priority_service import task_priority_service
from app.config import settings

def seed_demo_data():
    print("🌱 Initializing PalMind demo database...")
    init_db()
    db = SessionLocal()

    try:
        # 1. User Profile
        user = db.query(UserProfile).first()
        if not user:
            user = UserProfile(id=1)
            db.add(user)
        user.name = "Alex"
        user.goal = "Prepare for university exams and keep promises to friends"
        user.productive_time = "Morning"
        user.onboarded = True
        user.preferences = json.dumps({"theme": "dark", "notifications_enabled": True})
        db.commit()
        print("  ✓ Profile seeded: Alex")

        # 2. Tasks
        now = datetime.datetime.now(datetime.timezone.utc)
        tasks_data = [
            {
                "title": "Revise Computer Networks before October 10",
                "description": "Focus heavily on Stop-and-Wait, Go-Back-N, Selective Repeat ARQ, and Hamming Code calculations.",
                "category": "Exam",
                "priority": "Urgent",
                "status": "To Do",
                "due_date": now + datetime.timedelta(days=2),
                "estimated_minutes": 90,
            },
            {
                "title": "Submit Software Engineering assignment",
                "description": "Finalize UML diagram and submit via university portal.",
                "category": "Academic",
                "priority": "High",
                "status": "In Progress",
                "due_date": now + datetime.timedelta(days=3),
                "estimated_minutes": 60,
            },
            {
                "title": "Finish chapters 3 and 4 of Operating Systems",
                "description": "Process synchronization, Semaphores, and Peterson's Algorithm.",
                "category": "Academic",
                "priority": "Medium",
                "status": "To Do",
                "due_date": now + datetime.timedelta(days=5),
                "estimated_minutes": 120,
            },
            {
                "title": "Prepare presentation slides for group project with Rahul",
                "description": "System architecture diagram and benchmark results.",
                "category": "Project",
                "priority": "High",
                "status": "To Do",
                "due_date": now + datetime.timedelta(days=1),
                "estimated_minutes": 45,
            }
        ]

        for td in tasks_data:
            score, reason = task_priority_service.calculate_priority_score(
                priority=td["priority"],
                due_date=td["due_date"],
                estimated_minutes=td["estimated_minutes"],
                status=td["status"]
            )
            task = Task(
                title=td["title"],
                description=td["description"],
                category=td["category"],
                priority=td["priority"],
                status=td["status"],
                due_date=td["due_date"],
                estimated_minutes=td["estimated_minutes"],
                ai_priority_score=score,
                ai_priority_reason=reason
            )
            db.add(task)
        db.commit()
        print(f"  ✓ {len(tasks_data)} Tasks seeded")

        # 3. Flagship Memories
        memories_data = [
            {
                "content": "Professor said ARQ and Hamming Code are guaranteed to appear on the CN exam.",
                "memory_type": "Academic",
                "importance": 5,
                "is_pinned": True
            },
            {
                "content": "I promised Rahul I'll send the presentation slides by tomorrow evening.",
                "memory_type": "Commitment",
                "importance": 4,
                "is_pinned": True
            },
            {
                "content": "Rahul prefers meetings after 6 PM on weekdays.",
                "memory_type": "People",
                "importance": 3,
                "is_pinned": False
            },
            {
                "content": "CN exam is October 12 at 10 AM in Hall B.",
                "memory_type": "Deadline",
                "importance": 5,
                "is_pinned": True
            },
            {
                "content": "Best quiet study spot on campus: 3rd floor science library corner table near the window.",
                "memory_type": "Preference",
                "importance": 2,
                "is_pinned": False
            }
        ]

        for md in memories_data:
            emb = embedding_service.encode(md["content"])
            mem = Memory(
                content=md["content"],
                memory_type=md["memory_type"],
                importance=md["importance"],
                is_pinned=md["is_pinned"],
                source="seed_demo",
                embedding=json.dumps(emb)
            )
            db.add(mem)
        db.commit()
        print(f"  ✓ {len(memories_data)} Memories seeded with dense vector embeddings")

        # 4. Reminders
        reminders_data = [
            {
                "title": "Revise Computer Networks sliding window protocols",
                "description": "Go through professor's lecture slides 12-28",
                "remind_at": now + datetime.timedelta(hours=4),
                "completed": False
            },
            {
                "title": "Send presentation slides to Rahul",
                "description": "Export slides to PDF before 6 PM meeting",
                "remind_at": now + datetime.timedelta(hours=22),
                "completed": False
            }
        ]
        for rd in reminders_data:
            db.add(Reminder(**rd))
        db.commit()
        print(f"  ✓ {len(reminders_data)} Reminders seeded")

        # 5. Study Sessions History
        study_data = [
            {
                "title": "OSI Physical & Data Link Layers",
                "subject": "Computer Networks",
                "duration_minutes": 45,
                "actual_duration_minutes": 45,
                "planned_topics_json": json.dumps([
                    {"time_range": "0-15 min", "topic": "Framing and Bit Stuffing", "activity": "Lecture review"},
                    {"time_range": "15-45 min", "topic": "Error detection CRC", "activity": "Problem sets"}
                ]),
                "completed": True,
                "created_at": now - datetime.timedelta(days=1)
            },
            {
                "title": "ARQ Protocol Deep Dive",
                "subject": "Computer Networks",
                "duration_minutes": 25,
                "actual_duration_minutes": 25,
                "planned_topics_json": json.dumps([
                    {"time_range": "0-15 min", "topic": "Go-Back-N vs Selective Repeat", "activity": "Window size formulas"},
                    {"time_range": "15-25 min", "topic": "Quick recall quiz", "activity": "Flashcard testing"}
                ]),
                "completed": True,
                "created_at": now - datetime.timedelta(hours=3)
            }
        ]
        for sd in study_data:
            db.add(StudySession(**sd))
        db.commit()
        print(f"  ✓ {len(study_data)} Study Sessions seeded (70 total minutes recorded)")

        # 6. Sample Document: Computer Networks Revision Guide
        doc_filename = "CN_Exam_Revision_Guide.txt"
        doc_path = settings.UPLOAD_DIR / doc_filename
        doc_content = """# Computer Networks Midterm Revision Guide

## 1. Flow and Error Control
The Data Link Layer is responsible for node-to-node frame delivery.
Key ARQ (Automatic Repeat reQuest) protocols:
- Stop-and-Wait ARQ: Sender transmits one frame and waits for an ACK before sending the next. Highly inefficient on channels with high propagation delay (Bandwidth-Delay product).
- Go-Back-N (GBN) ARQ: Sender can transmit up to N frames (sliding window) without waiting for an ACK. Receiver only accepts frames strictly in-order and uses cumulative ACKs. If a packet is lost, sender must retransmit the lost packet and all subsequent packets.
- Selective Repeat (SR) ARQ: Sender only retransmits the specific frames that were corrupted or lost. Receiver maintains a receive window and buffers out-of-order packets. Maximum window size must be <= 2^(m-1) to avoid sequence number overlap.

## 2. Error Detection and Correction
- Parity Check: Adds 1 bit. Can detect single-bit errors.
- Checksum: Internet checksum adds 16-bit 1's complement sum.
- CRC (Cyclic Redundancy Check): Polynomial division over GF(2). Highly effective at burst error detection.
- Hamming Code: Single error correcting, double error detecting code. Uses redundant parity bits placed at bit positions that are powers of 2 (positions 1, 2, 4, 8, etc.). The equation to determine required parity bits is: 2^p >= m + p + 1.

## 3. Important Exam Tips from Professor
- Expect a calculation question on Hamming Code parity bit placement.
- Compare Go-Back-N vs Selective Repeat window sizes and bandwidth utilization."""

        with open(doc_path, "w", encoding="utf-8") as f:
            f.write(doc_content)

        # Check if already in DB
        existing_doc = db.query(Document).filter(Document.filename == doc_filename).first()
        if not existing_doc:
            doc = Document(
                filename=doc_filename,
                file_type="txt",
                file_path=str(doc_path),
                file_size=len(doc_content.encode("utf-8")),
                summary="Core Data Link Layer revision notes covering ARQ protocols (Stop-and-Wait, Go-Back-N, Selective Repeat) and Hamming Code error correction.",
                processing_status="completed",
                chunk_count=3
            )
            db.add(doc)
            db.commit()
            db.refresh(doc)

            # Chunks
            chunks = [
                ("Flow and Error Control: Stop-and-Wait, Go-Back-N, and Selective Repeat ARQ protocols with window size analysis.", 1),
                ("Error Detection and Correction: Parity, Checksum, CRC, and Hamming Code equations (2^p >= m + p + 1) for single-bit correction.", 1),
                ("Important Exam Tips from Professor: Calculation question on Hamming Code and comparison of Go-Back-N vs Selective Repeat bandwidth efficiency.", 1)
            ]
            for idx, (text_content, pg) in enumerate(chunks):
                emb = embedding_service.encode(text_content)
                db.add(DocumentChunk(
                    document_id=doc.id,
                    content=text_content,
                    chunk_index=idx,
                    page_number=pg,
                    embedding=json.dumps(emb)
                ))
            db.commit()
            print("  ✓ Document 'CN_Exam_Revision_Guide.txt' indexed with RAG vectors")

        print("\n✨ PalMind demo dataset ready! Launch the application to explore.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_demo_data()
