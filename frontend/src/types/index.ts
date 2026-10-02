export interface UserProfile {
  id: number;
  name: string;
  email?: string | null;
  goal: string;
  productive_time: string;
  preferences: Record<string, any>;
  onboarded: boolean;
  auth_provider?: 'local' | 'email' | 'google' | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
  message: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'To Do' | 'In Progress' | 'Completed';
  due_date?: string | null;
  estimated_minutes: number;
  ai_priority_score: number;
  ai_priority_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Memory {
  id: number;
  content: string;
  memory_type: 'Academic' | 'People' | 'Commitment' | 'Deadline' | 'Preference' | 'Project' | 'Personal' | 'Other';
  importance: number;
  source: string;
  is_pinned: boolean;
  created_at: string;
  last_accessed: string;
  similarity?: number;
}

export interface DocumentItem {
  id: number;
  filename: string;
  file_type: string;
  file_size: number;
  summary?: string | null;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string | null;
  chunk_count: number;
  created_at: string;
}

export interface SourceCitation {
  type: 'document' | 'memory' | 'task';
  title: string;
  snippet: string;
  page?: number | null;
  id?: number | null;
}

export interface Message {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources: SourceCitation[];
  created_at: string;
}

export interface Conversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  messages?: Message[];
}

export interface StudyTopic {
  time_range: string;
  topic: string;
  activity: string;
}

export interface StudyPlan {
  subject: string;
  duration_minutes: number;
  plan: StudyTopic[];
  advice: string;
}

export interface StudySession {
  id: number;
  title: string;
  subject: string;
  duration_minutes: number;
  planned_topics: any[];
  completed: boolean;
  actual_duration_minutes: number;
  created_at: string;
}

export interface StudyStats {
  sessions_today: number;
  today_minutes: number;
  total_study_minutes: number;
  weekly_study_minutes: number;
  recent_sessions: StudySession[];
}

export interface Reminder {
  id: number;
  title: string;
  description?: string | null;
  remind_at: string;
  completed: boolean;
  created_at: string;
}

export interface DailyBrief {
  date: string;
  user_name: string;
  greeting: string;
  focus_for_today: string;
  urgent_tasks: Task[];
  upcoming_deadlines: Task[];
  pending_reminders: Reminder[];
  recommended_study: {
    subject: string;
    recommended_minutes: number;
    reason: string;
  };
  forgotten_commitments: Memory[];
  recent_documents: DocumentItem[];
  motivational_tip: string;
}

export interface SearchResultItem {
  id: number;
  type: 'task' | 'memory' | 'document' | 'note';
  title: string;
  content: string;
  snippet: string;
  date: string;
  metadata: Record<string, any>;
}

export interface GlobalSearchResponse {
  query: string;
  total_results: number;
  results: SearchResultItem[];
}

export interface AIStatus {
  available: boolean;
  configured_model: string;
  active_model?: string | null;
  installed_models: string[];
  ollama_url: string;
  embedding_model: string;
  error_message?: string | null;
}

export interface AITestResult {
  success: boolean;
  message: string;
  latency_ms?: number | null;
  model_used?: string | null;
}

export interface AppSettings {
  ollama_url: string;
  ollama_model: string;
  embedding_model: string;
  theme: string;
  productive_time: string;
  temperature: number;
  auto_priority_enabled: boolean;
}
