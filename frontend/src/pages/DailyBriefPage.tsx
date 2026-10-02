import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Calendar,
  CheckSquare,
  Brain,
  Timer,
  Bell,
  ArrowRight,
  RefreshCw,
  Award
} from 'lucide-react';
import { api } from '../api/client';
import { DailyBrief } from '../types';

interface DailyBriefPageProps {
  onNavigate: (tab: string) => void;
}

export const DailyBriefPage: React.FC<DailyBriefPageProps> = ({ onNavigate }) => {
  const [brief, setBrief] = useState<DailyBrief | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBrief = async () => {
    try {
      setLoading(true);
      const data = await api.getDailyBrief();
      setBrief(data);
    } catch (err) {
      console.error('Failed to load daily brief:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrief();
  }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-white/5 rounded-2xl" />
        <div className="h-44 bg-white/5 rounded-3xl" />
        <div className="h-64 bg-white/5 rounded-3xl" />
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center py-20 text-slate-400">
        Could not load daily briefing.
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Date & Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-coral-400">
            Personal AI Briefing
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            {brief.greeting}
          </h1>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-coral-400" />
            <span>{brief.date}</span>
          </p>
        </div>
        <button
          onClick={fetchBrief}
          className="p-2.5 rounded-full bg-white/[0.04] border border-white/10 text-slate-400 hover:text-white hover:border-coral-500/30 transition"
          title="Refresh Briefing"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Focus For Today - Cryptox Luxury Glass */}
      <div className="glass-panel card-3d-tilt p-6 sm:p-8 rounded-3xl border-coral-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-coral-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-2 mb-3">
          <span className="p-1.5 rounded-xl bg-coral-500/20 text-coral-400">
            <Sparkles className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold text-coral-400 uppercase tracking-wider">
            AI Focus Recommendation
          </span>
        </div>
        <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed">
          {brief.focus_for_today}
        </p>

        {/* Motivational Tip */}
        <p className="mt-4 pt-4 border-t border-white/5 text-xs text-slate-400 italic">
          "{brief.motivational_tip}"
        </p>
      </div>

      {/* Grid of Brief Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 perspective-1000">
        {/* Urgent Action Items */}
        <div className="glass-card card-3d-tilt p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-coral-400" />
              <h2 className="text-sm font-bold text-white">Top Priorities</h2>
            </div>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs font-semibold text-coral-400 hover:text-coral-300 transition"
            >
              Open Tasks
            </button>
          </div>

          {brief.urgent_tasks.length === 0 ? (
            <p className="text-xs text-slate-400 py-3">No urgent tasks today.</p>
          ) : (
            <div className="space-y-2">
              {brief.urgent_tasks.map((t) => (
                <div key={t.id} className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-xs flex items-center justify-between">
                  <span className="text-slate-200 font-semibold truncate mr-2">{t.title}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-coral-500/20 text-coral-300 border border-coral-500/30 shrink-0">
                    {t.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Commitments & Promises */}
        <div className="glass-card card-3d-tilt p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Don't Forget: Promises</h2>
            </div>
            <button
              onClick={() => onNavigate('memory')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
            >
              Memory Vault
            </button>
          </div>

          {brief.forgotten_commitments.length === 0 ? (
            <p className="text-xs text-slate-400 py-3">No promises logged.</p>
          ) : (
            <div className="space-y-2">
              {brief.forgotten_commitments.map((m) => (
                <div key={m.id} className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-xs">
                  <p className="text-slate-200 leading-snug">"{m.content}"</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Study Sprint */}
        <div className="glass-card card-3d-tilt p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-coral-400" />
              <h2 className="text-sm font-bold text-white">Recommended Study Block</h2>
            </div>
            <button
              onClick={() => onNavigate('study')}
              className="text-xs font-semibold text-coral-400 hover:text-coral-300 transition"
            >
              Start Timer
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-coral-950/20 border border-coral-500/20 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold">
              <span className="text-white text-sm">{brief.recommended_study.subject}</span>
              <span className="text-coral-300 font-mono">
                {brief.recommended_study.recommended_minutes} mins
              </span>
            </div>
            <p className="text-slate-400">{brief.recommended_study.reason}</p>
          </div>
        </div>

        {/* Reminders */}
        <div className="glass-card card-3d-tilt p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white">Today's Reminders</h2>
            </div>
            <button
              onClick={() => onNavigate('reminders')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition"
            >
              All Reminders
            </button>
          </div>

          {brief.pending_reminders.length === 0 ? (
            <p className="text-xs text-slate-400 py-3">No reminders for today.</p>
          ) : (
            <div className="space-y-2">
              {brief.pending_reminders.map((r) => (
                <div key={r.id} className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-xs flex items-center justify-between">
                  <span className="text-slate-200 font-medium truncate mr-2">{r.title}</span>
                  <span className="text-[11px] text-amber-400 shrink-0">
                    {new Date(r.remind_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
