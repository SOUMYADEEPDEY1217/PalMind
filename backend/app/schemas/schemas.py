import datetime
from typing import Optional, Any
from pydantic import BaseModel, Field

# Base schemas
class OrmBase(BaseModel):
    class Config:
        from_attributes = True

# --- User Profile ---
class UserProfileBase(BaseModel):
    name: str = "Friend"
    goal: str = "Prepare for university exams"
    productive_time: str = "Morning"  # Morning, Afternoon, Evening, Night
    preferences: dict[str, Any] = Field(default_factory=dict)

class UserProfileCreate(UserProfileBase):
    pass

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    avatar_url: Optional[str] = None
    goal: Optional[str] = None
    productive_time: Optional[str] = None
    preferences: Optional[dict[str, Any]] = None
    onboarded: Optional[bool] = None
    new_password: Optional[str] = None
    current_password: Optional[str] = None

class UserProfileOut(OrmBase):
    id: int
    name: str
    email: Optional[str] = None
    goal: str
    productive_time: str
    preferences: dict[str, Any]
    onboarded: bool
    auth_provider: Optional[str] = "local"
    avatar_url: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

# --- Authentication Schemas ---
class UserSignUp(BaseModel):
    name: str
    email: str
    password: str
    goal: Optional[str] = "Academic and personal excellence"
    productive_time: Optional[str] = "Morning"

class UserSignIn(BaseModel):
    email: str
    password: str

class GoogleAuthRequest(BaseModel):
    credential: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    picture: Optional[str] = None

class AuthResponse(BaseModel):
    token: str
    user: UserProfileOut
    message: str

# --- Tasks ---
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = "Academic"
    priority: str = "Medium"  # Low, Medium, High, Urgent
    status: str = "To Do"  # To Do, In Progress, Completed
    due_date: Optional[datetime.datetime] = None
    estimated_minutes: int = 30

class TaskCreate(TaskBase):
    pass

class TaskSmartCreate(BaseModel):
    text: str  # e.g., "Finish MongoDB assignment by Friday at 5 PM"

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[datetime.datetime] = None
    estimated_minutes: Optional[int] = None

class TaskOut(OrmBase):
    id: int
    title: str
    description: Optional[str] = None
    category: str
    priority: str
    status: str
    due_date: Optional[datetime.datetime] = None
    estimated_minutes: int
    ai_priority_score: float
    ai_priority_reason: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

# --- Notes ---
class NoteCreate(BaseModel):
    title: str
    content: str
    category: str = "General"

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None

class NoteOut(OrmBase):
    id: int
    title: str
    content: str
    category: str
    created_at: datetime.datetime
    updated_at: datetime.datetime

# --- Memories ---
class MemoryCreate(BaseModel):
    content: str
    memory_type: Optional[str] = None  # Academic, People, Commitment, Deadline, Preference, Project, Personal, Other (Auto-classified if empty)
    importance: int = 3
    source: str = "user_input"

class MemoryUpdate(BaseModel):
    content: Optional[str] = None
    memory_type: Optional[str] = None
    importance: Optional[int] = None
    is_pinned: Optional[bool] = None

class MemoryOut(OrmBase):
    id: int
    content: str
    memory_type: str
    importance: int
    source: str
    is_pinned: bool
    created_at: datetime.datetime
    last_accessed: datetime.datetime
    similarity: Optional[float] = None

class MemorySearchQuery(BaseModel):
    query: str
    limit: int = 10
    memory_type: Optional[str] = None

# --- Documents ---
class DocumentOut(OrmBase):
    id: int
    filename: str
    file_type: str
    file_size: int
    summary: Optional[str] = None
    processing_status: str
    error_message: Optional[str] = None
    chunk_count: int
    created_at: datetime.datetime

class DocumentChunkOut(OrmBase):
    id: int
    document_id: int
    content: str
    chunk_index: int
    page_number: Optional[int] = None

class DocumentAskQuery(BaseModel):
    question: str

# --- Chat & RAG ---
class SourceCitation(BaseModel):
    type: str  # document, memory, task
    title: str
    snippet: str
    page: Optional[int] = None
    id: Optional[int] = None

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[int] = None

class ChatResponse(BaseModel):
    conversation_id: int
    message: str
    sources: list[SourceCitation] = []
    created_at: datetime.datetime

class MessageOut(OrmBase):
    id: int
    conversation_id: int
    role: str
    content: str
    sources: list[SourceCitation] = []
    created_at: datetime.datetime

class ConversationOut(OrmBase):
    id: int
    title: str
    created_at: datetime.datetime
    updated_at: datetime.datetime

class ConversationDetailOut(ConversationOut):
    messages: list[MessageOut] = []

# --- Study Mode ---
class StudyTopic(BaseModel):
    time_range: str
    topic: str
    activity: str

class StudyPlanRequest(BaseModel):
    subject: str
    duration_minutes: int  # 25, 45, 60, custom
    focus_topic: Optional[str] = None
    document_id: Optional[int] = None

class StudyPlanResponse(BaseModel):
    subject: str
    duration_minutes: int
    plan: list[StudyTopic]
    advice: str

class StudySessionCreate(BaseModel):
    title: str
    subject: str
    duration_minutes: int
    actual_duration_minutes: int
    planned_topics: list[dict[str, Any]] = []
    completed: bool = True

class StudySessionOut(OrmBase):
    id: int
    title: str
    subject: str
    duration_minutes: int
    planned_topics: list[dict[str, Any]] = []
    completed: bool
    actual_duration_minutes: int
    created_at: datetime.datetime

class StudyStatsOut(BaseModel):
    sessions_today: int
    today_minutes: int
    total_study_minutes: int
    weekly_study_minutes: int
    recent_sessions: list[StudySessionOut] = []

# --- Reminders ---
class ReminderCreate(BaseModel):
    title: str
    description: Optional[str] = None
    remind_at: datetime.datetime

class ReminderUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    remind_at: Optional[datetime.datetime] = None
    completed: Optional[bool] = None

class ReminderOut(OrmBase):
    id: int
    title: str
    description: Optional[str] = None
    remind_at: datetime.datetime
    completed: bool
    created_at: datetime.datetime

# --- Daily Brief ---
class DailyBriefOut(BaseModel):
    date: str
    user_name: str
    greeting: str
    focus_for_today: str
    urgent_tasks: list[TaskOut]
    upcoming_deadlines: list[TaskOut]
    pending_reminders: list[ReminderOut]
    recommended_study: dict[str, Any]
    forgotten_commitments: list[MemoryOut]
    recent_documents: list[DocumentOut]
    motivational_tip: str

# --- Global Search ---
class SearchResultItem(BaseModel):
    id: int
    type: str  # task, memory, document, note
    title: str
    content: str
    snippet: str
    date: datetime.datetime
    metadata: dict[str, Any] = {}

class GlobalSearchOut(BaseModel):
    query: str
    total_results: int
    results: list[SearchResultItem]

# --- AI & Settings ---
class AIStatusOut(BaseModel):
    available: bool
    configured_model: str
    active_model: Optional[str] = None
    installed_models: list[str] = []
    ollama_url: str
    embedding_model: str
    error_message: Optional[str] = None

class AITestResponse(BaseModel):
    success: bool
    message: str
    latency_ms: Optional[float] = None
    model_used: Optional[str] = None

class SettingsOut(BaseModel):
    ollama_url: str
    ollama_model: str
    embedding_model: str
    theme: str
    productive_time: str
    temperature: float
    auto_priority_enabled: bool

class SettingsUpdate(BaseModel):
    ollama_url: Optional[str] = None
    ollama_model: Optional[str] = None
    theme: Optional[str] = None
    temperature: Optional[float] = None
    auto_priority_enabled: Optional[bool] = None
