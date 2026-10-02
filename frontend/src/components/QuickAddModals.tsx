import React, { useState } from 'react';
import {
  X, CheckSquare, Brain, FileUp, Bell, Sparkles, AlertCircle, Loader2
} from 'lucide-react';
import { api } from '../api/client';
import { Task, Memory, DocumentItem, Reminder } from '../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
}

// ---------------- TASK MODAL ----------------
export const AddTaskModal: React.FC<ModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'smart' | 'manual'>('smart');
  const [smartText, setSmartText] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Academic');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(45);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (mode === 'smart') {
        if (!smartText.trim()) return;
        const task = await api.createSmartTask(smartText.trim());
        onSuccess(task);
      } else {
        if (!title.trim()) return;
        const task = await api.createTask({
          title: title.trim(),
          description: description.trim() || undefined,
          category,
          priority,
          status: 'To Do',
          due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
          estimated_minutes: estimatedMinutes,
        });
        onSuccess(task);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#080d16] border border-white/10 rounded-3xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
          <div className="flex items-center gap-2.5">
            <CheckSquare className="w-5 h-5 text-coral-400" />
            <h3 className="text-base font-bold text-white">Add Smart Directive</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="flex p-1 bg-white/[0.04] border border-white/5 rounded-full mb-4">
          <button
            type="button"
            onClick={() => setMode('smart')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-full transition ${
              mode === 'smart' ? 'bg-gradient-to-r from-coral-500 to-[#ff3b14] text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Natural Language</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition ${
              mode === 'manual' ? 'bg-gradient-to-r from-coral-500 to-[#ff3b14] text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Manual Form
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'smart' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tell PalMind what you need to do naturally:
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Finish Computer Networks lab report before Friday at 5 PM with High priority"
                value={smartText}
                onChange={(e) => setSmartText(e.target.value)}
                autoFocus
                className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-2xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-coral-500/60 transition"
              />
              <p className="mt-1.5 text-[11px] text-slate-500">
                PalMind will automatically extract the title, deadline, priority, and calculate its priority score.
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Revise Computer Networks Chapter 4"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-coral-500/60 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0e1422] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-coral-500/60 transition"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Exam">Exam</option>
                    <option value="Project">Project</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#0e1422] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-coral-500/60 transition"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date</label>
                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-coral-500/60 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Time (mins)</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(parseInt(e.target.value) || 30)}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-coral-500/60 transition"
                  />
                </div>
              </div>
            </>
          )}

          <div className="pt-3 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-coral flex items-center gap-1.5 px-6 py-2 text-xs font-semibold shadow-md transition disabled:opacity-40"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------- MEMORY MODAL ----------------
export const AddMemoryModal: React.FC<ModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [content, setContent] = useState('');
  const [memoryType, setMemoryType] = useState('Academic');
  const [importance, setImportance] = useState(3);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const mem = await api.createMemory({
        content: content.trim(),
        memory_type: memoryType,
        importance,
      });
      onSuccess(mem);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save memory');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#080d16] border border-white/10 rounded-3xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
          <div className="flex items-center gap-2.5">
            <Brain className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Record Memory Note</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              What do you want PalMind to remember? *
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Professor said ARQ and Hamming Code are important for the upcoming exam."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              autoFocus
              className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-2xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-coral-500/60 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Type</label>
              <select
                value={memoryType}
                onChange={(e) => setMemoryType(e.target.value)}
                className="w-full px-3 py-2 bg-[#0e1422] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-coral-500/60 transition"
              >
                <option value="Academic">Academic</option>
                <option value="Commitment">Commitment (Promise)</option>
                <option value="People">People</option>
                <option value="Deadline">Deadline</option>
                <option value="Preference">Preference</option>
                <option value="Project">Project</option>
                <option value="Personal">Personal</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Importance ({importance}/5)
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={importance}
                onChange={(e) => setImportance(parseInt(e.target.value))}
                className="w-full mt-2 accent-coral-500"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-coral flex items-center gap-1.5 px-6 py-2 text-xs font-semibold shadow-md transition disabled:opacity-40"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Memory</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------- DOCUMENT MODAL ----------------
export const UploadDocumentModal: React.FC<ModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const doc = await api.uploadDocument(file);
      onSuccess(doc);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#080d16] border border-white/10 rounded-3xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
          <div className="flex items-center gap-2.5">
            <FileUp className="w-5 h-5 text-coral-400" />
            <h3 className="text-base font-bold text-white">Upload Knowledge Document</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="border-2 border-dashed border-white/15 hover:border-coral-500/50 rounded-2xl p-6 text-center transition">
            <FileUp className="w-8 h-8 text-coral-400/80 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-200 mb-1">
              Select or drop a study document
            </p>
            <p className="text-[11px] text-slate-400 mb-3">
              Supports PDF, TXT, Markdown, DOCX (Max 25MB)
            </p>
            <input
              type="file"
              accept=".pdf,.txt,.md,.docx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3.5 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-coral-500/20 file:text-coral-300 hover:file:bg-coral-500/30 cursor-pointer"
            />
          </div>

          {file && (
            <div className="p-3 bg-white/[0.04] rounded-xl text-xs flex items-center justify-between">
              <span className="font-medium text-slate-200 truncate">{file.name}</span>
              <span className="text-slate-400 shrink-0 ml-2">{(file.size / 1024).toFixed(1)} KB</span>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || uploading}
              className="btn-coral flex items-center gap-1.5 px-6 py-2 text-xs font-semibold shadow-md transition disabled:opacity-40"
            >
              {uploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{uploading ? 'Processing RAG...' : 'Upload & Index'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------- REMINDER MODAL ----------------
export const AddReminderModal: React.FC<ModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [remindAt, setRemindAt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !remindAt) return;
    setSubmitting(true);
    setError(null);
    try {
      const rem = await api.createReminder({
        title: title.trim(),
        description: description.trim() || undefined,
        remind_at: new Date(remindAt).toISOString(),
      });
      onSuccess(rem);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create reminder');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#080d16] border border-white/10 rounded-3xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-coral-400" />
            <h3 className="text-base font-bold text-white">Create Reminder</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Reminder Title *</label>
            <input
              type="text"
              placeholder="e.g. Revise Computer Networks sliding window protocols"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              className="w-full px-4 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-coral-500/60 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Details (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Don't forget lecture slides 12-28"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-coral-500/60 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Date & Time *</label>
            <input
              type="datetime-local"
              value={remindAt}
              onChange={(e) => setRemindAt(e.target.value)}
              required
              className="w-full px-4 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-coral-500/60 transition"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-coral flex items-center gap-1.5 px-6 py-2 text-xs font-semibold shadow-md transition disabled:opacity-40"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Reminder</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
