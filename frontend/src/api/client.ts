import {
  UserProfile, Task, Memory, DocumentItem, Conversation,
  StudyPlan, StudySession, StudyStats, Reminder, DailyBrief,
  GlobalSearchResponse, AIStatus, AITestResult, AppSettings, AuthResponse
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  const token = localStorage.getItem('palmind_token');
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'An unexpected error occurred.';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorJson.error || JSON.stringify(errorJson);
    } catch {
      errorDetail = await response.text() || `HTTP ${response.status} ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }

  // Handle 204 or empty responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // Health
  getHealth: () => request<any>('/health'),

  // Authentication
  signUp: (data: { name: string; email: string; password: string; goal?: string; productive_time?: string }) =>
    request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  signIn: (data: { email: string; password: string }) =>
    request<AuthResponse>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  googleAuth: (data: { credential?: string; email?: string; name?: string; picture?: string }) =>
    request<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getCurrentUser: () => request<UserProfile>('/auth/me'),
  logout: () => {
    localStorage.removeItem('palmind_token');
    return request<{ message: string }>('/auth/logout', { method: 'POST' });
  },

  // Profile & Onboarding
  getProfile: () => request<UserProfile>('/profile'),
  updateProfile: (data: Partial<UserProfile>) => request<UserProfile>('/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Tasks
  getTasks: (params?: { status?: string; priority?: string; category?: string; search?: string; sort_by?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.append('status', params.status);
    if (params?.priority) q.append('priority', params.priority);
    if (params?.category) q.append('category', params.category);
    if (params?.search) q.append('search', params.search);
    if (params?.sort_by) q.append('sort_by', params.sort_by);
    return request<Task[]>(`/tasks?${q.toString()}`);
  },
  createTask: (data: Partial<Task>) => request<Task>('/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  createSmartTask: (text: string) => request<Task>('/tasks/smart', {
    method: 'POST',
    body: JSON.stringify({ text }),
  }),
  updateTask: (id: number, data: Partial<Task>) => request<Task>(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteTask: (id: number) => request<{ message: string; id: number }>(`/tasks/${id}`, {
    method: 'DELETE',
  }),

  // Memories
  getMemories: (params?: { memory_type?: string; search?: string; pinned_first?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.memory_type) q.append('memory_type', params.memory_type);
    if (params?.search) q.append('search', params.search);
    if (params?.pinned_first !== undefined) q.append('pinned_first', String(params.pinned_first));
    return request<Memory[]>(`/memories?${q.toString()}`);
  },
  createMemory: (data: { content: string; memory_type?: string; importance?: number }) => request<Memory>('/memories', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateMemory: (id: number, data: Partial<Memory>) => request<Memory>(`/memories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteMemory: (id: number) => request<{ message: string; id: number }>(`/memories/${id}`, {
    method: 'DELETE',
  }),
  searchMemories: (query: string, memory_type?: string) => request<Memory[]>('/memories/search', {
    method: 'POST',
    body: JSON.stringify({ query, memory_type }),
  }),

  // Documents
  getDocuments: () => request<DocumentItem[]>('/documents'),
  uploadDocument: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<DocumentItem>('/documents/upload', {
      method: 'POST',
      body: formData,
    });
  },
  getDocument: (id: number) => request<DocumentItem>(`/documents/${id}`),
  deleteDocument: (id: number) => request<{ message: string; id: number }>(`/documents/${id}`, {
    method: 'DELETE',
  }),
  askDocument: (id: number, question: string) => request<any>(`/documents/${id}/ask`, {
    method: 'POST',
    body: JSON.stringify({ question }),
  }),

  // Chat & Conversations
  getConversations: () => request<Conversation[]>('/conversations'),
  getConversation: (id: number) => request<Conversation>(`/conversations/${id}`),
  deleteConversation: (id: number) => request<{ message: string }>(`/conversations/${id}`, {
    method: 'DELETE',
  }),
  sendChatMessage: (message: string, conversation_id?: number) => request<{
    conversation_id: number;
    message: string;
    sources: any[];
    created_at: string;
  }>('/chat', {
    method: 'POST',
    body: JSON.stringify({ message, conversation_id }),
  }),

  // Study Mode
  getStudyPlan: (data: { subject: string; duration_minutes: number; focus_topic?: string; document_id?: number }) =>
    request<StudyPlan>('/study/plan', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  saveStudySession: (data: {
    title: string;
    subject: string;
    duration_minutes: number;
    actual_duration_minutes: number;
    planned_topics?: any[];
    completed?: boolean;
  }) => request<StudySession>('/study/session', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getStudyStats: () => request<StudyStats>('/study/stats'),

  // Reminders
  getReminders: (completed?: boolean) => {
    const q = completed !== undefined ? `?completed=${completed}` : '';
    return request<Reminder[]>(`/reminders${q}`);
  },
  createReminder: (data: { title: string; description?: string; remind_at: string }) => request<Reminder>('/reminders', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateReminder: (id: number, data: Partial<Reminder>) => request<Reminder>(`/reminders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteReminder: (id: number) => request<{ message: string }>(`/reminders/${id}`, {
    method: 'DELETE',
  }),

  // Daily Brief
  getDailyBrief: () => request<DailyBrief>('/daily-brief'),

  // Global Search
  search: (q: string) => request<GlobalSearchResponse>(`/search?q=${encodeURIComponent(q)}`),

  // Settings & AI
  getSettings: () => request<AppSettings>('/settings'),
  updateSettings: (data: Partial<AppSettings>) => request<AppSettings>('/settings', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  getAIStatus: () => request<AIStatus>('/ai/status'),
  testAI: () => request<AITestResult>('/ai/test', { method: 'POST' }),

  // Data Export & Reset
  getExportUrl: () => `${BASE_URL}/export`,
  resetAllData: () => request<{ message: string }>('/data?confirm=true', { method: 'DELETE' }),
};
