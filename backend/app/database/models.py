import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from app.database.connection import Base

def utcnow():
    return datetime.datetime.now(datetime.timezone.utc)

class UserProfile(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=True)
    password_hash = Column(String(255), nullable=True)
    auth_provider = Column(String(50), default="local")  # local, google
    avatar_url = Column(String(500), nullable=True)
    access_token = Column(String(255), nullable=True, index=True)
    name = Column(String(100), default="Friend")
    goal = Column(String(255), default="Academic and personal excellence")
    productive_time = Column(String(50), default="Morning")  # Morning, Afternoon, Evening, Night
    preferences = Column(Text, default="{}")  # JSON string
    onboarded = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), default="General")  # e.g., Academic, Project, Personal, Exam
    priority = Column(String(50), default="Medium")  # Low, Medium, High, Urgent
    status = Column(String(50), default="To Do")  # To Do, In Progress, Completed
    due_date = Column(DateTime, nullable=True)
    estimated_minutes = Column(Integer, default=30)
    ai_priority_score = Column(Float, default=0.0)
    ai_priority_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    __table_args__ = (
        Index("idx_tasks_status_due", "status", "due_date"),
    )

class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(100), default="General")
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # pdf, txt, md, docx
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, default=0)
    summary = Column(Text, nullable=True)
    processing_status = Column(String(50), default="pending")  # pending, processing, completed, failed
    error_message = Column(Text, nullable=True)
    chunk_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=utcnow)

    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    chunk_index = Column(Integer, nullable=False)
    page_number = Column(Integer, nullable=True)
    embedding = Column(Text, nullable=True)  # JSON-serialized vector
    metadata_json = Column(Text, default="{}")
    created_at = Column(DateTime, default=utcnow)

    document = relationship("Document", back_populates="chunks")

class Memory(Base):
    __tablename__ = "memories"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    memory_type = Column(String(50), default="Other")  # Academic, People, Commitment, Deadline, Preference, Project, Personal, Other
    importance = Column(Integer, default=3)  # 1 to 5
    source = Column(String(100), default="user_note")
    is_pinned = Column(Boolean, default=False)
    embedding = Column(Text, nullable=True)  # JSON-serialized vector
    created_at = Column(DateTime, default=utcnow)
    last_accessed = Column(DateTime, default=utcnow)

    __table_args__ = (
        Index("idx_memories_type", "memory_type"),
    )

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), default="New Chat")
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    sources_json = Column(Text, default="[]")  # JSON list of citations
    created_at = Column(DateTime, default=utcnow)

    conversation = relationship("Conversation", back_populates="messages")

class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    subject = Column(String(100), default="General")
    duration_minutes = Column(Integer, nullable=False)
    planned_topics_json = Column(Text, default="[]")  # JSON breakdown
    completed = Column(Boolean, default=False)
    actual_duration_minutes = Column(Integer, default=0)
    created_at = Column(DateTime, default=utcnow)

class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    remind_at = Column(DateTime, nullable=False, index=True)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=utcnow, index=True)

class AppSetting(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False, index=True)
    value = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)
