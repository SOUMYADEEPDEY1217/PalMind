import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Sparkles,
  Calendar,
  Clock,
  Trash2,
  Filter,
  Search,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Circle,
  ArrowRight
} from 'lucide-react';
import { api } from '../api/client';
import { Task } from '../types';

interface TasksPageProps {
  onOpenQuickAdd: (type: 'task') => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({ onOpenQuickAdd }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('To Do');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [smartInput, setSmartInput] = useState('');
  const [submittingSmart, setSubmittingSmart] = useState(false);
  const [activeReasonId, setActiveReasonId] = useState<number | null>(null);

  const fetchTasks = async () => {
    try {
      const data = await api.getTasks({
        status: statusFilter === 'All' ? undefined : statusFilter,
        category: categoryFilter || undefined,
        search: searchQuery || undefined,
      });
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, categoryFilter, searchQuery]);

  const handleSmartSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smartInput.trim() || submittingSmart) return;
    setSubmittingSmart(true);
    try {
      await api.createSmartTask(smartInput.trim());
      setSmartInput('');
      fetchTasks();
    } catch (err) {
      console.error('Failed to parse smart task:', err);
    } finally {
      setSubmittingSmart(false);
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const nextStatus = task.status === 'Completed' ? 'To Do' : 'Completed';
    try {
      await api.updateTask(task.id, { status: nextStatus });
      fetchTasks();
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteTask(id);
      fetchTasks();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Smart Tasks</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tasks prioritized by deadline proximity, effort, and AI importance score.
          </p>
        </div>
        <button
          onClick={() => onOpenQuickAdd('task')}
          className="btn-coral self-start sm:self-center flex items-center gap-1.5 px-5 py-2 text-xs font-bold active:scale-95 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Natural Language Smart Task Input Bar */}
      <div className="glass-panel p-4 rounded-3xl relative overflow-hidden border-coral-500/30 shadow-xl">
        <form onSubmit={handleSmartSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex items-center gap-2 px-3 text-coral-400 shrink-0">
            <Sparkles className="w-4 h-4 text-coral-400" />
            <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">AI Natural Add</span>
          </div>
          <input
            type="text"
            placeholder='Type: "Finish Computer Networks assignment by Friday at 5 PM with High priority"'
            value={smartInput}
            onChange={(e) => setSmartInput(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-coral-500/60 focus:bg-white/[0.06] transition"
          />
          <button
            type="submit"
            disabled={!smartInput.trim() || submittingSmart}
            className="btn-coral px-6 py-2.5 disabled:opacity-40 text-xs font-bold transition shadow-md shrink-0 active:scale-95"
          >
            {submittingSmart ? 'Extracting...' : 'Add Directive'}
          </button>
        </form>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Status Tabs with Cryptox Pills */}
        <div className="flex p-1 bg-white/[0.03] border border-white/5 rounded-full text-xs">
          {['To Do', 'In Progress', 'Completed', 'All'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-1.5 rounded-full font-medium transition ${
                statusFilter === s
                  ? 'bg-gradient-to-r from-coral-500 to-[#ff3b14] text-white font-bold shadow-[0_0_12px_rgba(255,87,34,0.35)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Category & Search Input */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3.5 py-1.5 rounded-full bg-[#0a0f19] border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-coral-500/50"
          >
            <option value="">All Categories</option>
            <option value="Academic">Academic</option>
            <option value="Exam">Exam</option>
            <option value="Project">Project</option>
            <option value="Personal">Personal</option>
          </select>

          <div className="relative flex-1 sm:w-52">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white/[0.04] border border-white/10 rounded-full text-xs text-white placeholder-slate-500 focus:outline-none focus:border-coral-500/50"
            />
          </div>
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white/5 rounded-2xl" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="glass-panel py-16 text-center rounded-3xl space-y-3">
          <CheckSquare className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No tasks found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search filters or add a new task using natural language above.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const isCompleted = task.status === 'Completed';
            const isReasonOpen = activeReasonId === task.id;

            return (
              <div
                key={task.id}
                className="glass-card card-3d-tilt p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Checkbox and Details */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <button
                    onClick={() => handleToggleStatus(task)}
                    className="mt-1 text-slate-400 hover:text-coral-400 transition shrink-0"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shadow-[0_0_8px_#34d399]" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500 hover:text-coral-400" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-semibold truncate ${
                        isCompleted ? 'line-through text-slate-500' : 'text-slate-100'
                      }`}>
                        {task.title}
                      </p>
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-white/5 text-slate-400">
                        {task.category}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 flex-wrap">
                      {task.due_date && (
                        <span className="flex items-center gap-1 text-amber-300 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(task.due_date).toLocaleDateString()}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>~{task.estimated_minutes}m</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Priority Badge, AI Score, Delete */}
                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  {/* AI Priority Score pill */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveReasonId(isReasonOpen ? null : task.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-coral-500/10 border border-coral-500/20 text-coral-300 hover:bg-coral-500/20 transition text-xs font-bold"
                    >
                      <Sparkles className="w-3 h-3 text-coral-400" />
                      <span>{task.ai_priority_score} pts</span>
                      <HelpCircle className="w-3 h-3 text-coral-400/80 ml-0.5" />
                    </button>

                    {isReasonOpen && (
                      <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-[#0a0f19] border border-white/10 rounded-2xl shadow-2xl z-50 text-[11px] text-slate-300 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100">
                        <div className="font-bold text-white mb-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-coral-400" />
                          <span>AI Priority Rationale</span>
                        </div>
                        <p className="text-slate-400">{task.ai_priority_reason || 'Score calculated by priority and deadline.'}</p>
                      </div>
                    )}
                  </div>

                  {/* Priority Tag */}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    task.priority === 'Urgent'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : task.priority === 'High'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-white/5 text-slate-300 border border-white/10'
                  }`}>
                    {task.priority}
                  </span>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
