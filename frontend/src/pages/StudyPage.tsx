import React, { useState, useEffect, useRef } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Sparkles,
  BookOpen,
  Calendar,
  Clock,
  Award,
  ChevronRight,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { api } from '../api/client';
import { StudyPlan, StudyStats, StudyTopic } from '../types';

export const StudyPage: React.FC = () => {
  const [subject, setSubject] = useState('Computer Networks');
  const [focusTopic, setFocusTopic] = useState('ARQ Protocols and Hamming Code');
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);

  // Timer states
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [timerCompleted, setTimerCompleted] = useState(false);
  const [savingSession, setSavingSession] = useState(false);
  const timerRef = useRef<any>(null);

  const fetchStats = async () => {
    try {
      const data = await api.getStudyStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load study stats:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Timer tick effect
  useEffect(() => {
    if (timerActive && secondsRemaining > 0) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimerActive(false);
            setTimerCompleted(true);
            handleCompleteSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, secondsRemaining]);

  const handleSelectDuration = (mins: number) => {
    setDurationMinutes(mins);
    setSecondsRemaining(mins * 60);
    setTimerActive(false);
    setTimerCompleted(false);
  };

  const handleStartTimer = () => {
    setTimerActive(true);
  };

  const handlePauseTimer = () => {
    setTimerActive(false);
  };

  const handleResetTimer = () => {
    setTimerActive(false);
    setSecondsRemaining(durationMinutes * 60);
    setTimerCompleted(false);
  };

  const handleGeneratePlan = async () => {
    setGeneratingPlan(true);
    try {
      const plan = await api.getStudyPlan({
        subject: subject.trim(),
        duration_minutes: durationMinutes,
        focus_topic: focusTopic.trim() || undefined,
      });
      setStudyPlan(plan);
    } catch (err) {
      console.error('Failed to generate study plan:', err);
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleCompleteSession = async () => {
    setSavingSession(true);
    try {
      await api.saveStudySession({
        title: `${subject} Focus Sprint`,
        subject: subject,
        duration_minutes: durationMinutes,
        actual_duration_minutes: durationMinutes,
        planned_topics: studyPlan?.plan || [],
        completed: true,
      });
      fetchStats();
    } catch (err) {
      console.error('Failed to save completed study session:', err);
    } finally {
      setSavingSession(false);
    }
  };

  // Format MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.max(
    0,
    Math.min(100, ((durationMinutes * 60 - secondsRemaining) / (durationMinutes * 60)) * 100)
  );

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Study Mode
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Eliminate distractions with structured AI study plans and focused countdown sessions.
          </p>
        </div>
      </div>

      {/* Main Study Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 perspective-1000">
        {/* Left 2 Cols: Timer & Controls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel card-3d-tilt p-6 sm:p-8 rounded-3xl text-center relative overflow-hidden border-t-coral-500/30">
            {/* Glowing Molten Ambient Backdrop */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-coral-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Subject Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-coral-500/15 border border-coral-500/30 text-coral-300 text-xs font-bold mb-6">
              <BookOpen className="w-3.5 h-3.5 text-coral-400" />
              <span>{subject || 'General Focus'}</span>
            </div>

            {/* Big Countdown Timer Display with Neon Precision */}
            <div className="relative my-4">
              <div className="text-6xl sm:text-7xl md:text-8xl font-black font-mono tracking-tight text-white select-none drop-shadow-[0_0_25px_rgba(255,87,34,0.3)]">
                {formatTime(secondsRemaining)}
              </div>
              <p className="text-xs text-slate-400 mt-2 font-medium">
                {timerActive ? 'Deep Work session in progress...' : timerCompleted ? 'Session Complete! Great focus.' : 'Ready to start'}
              </p>
            </div>

            {/* Progress Bar with Molten Gradient */}
            <div className="w-full max-w-md mx-auto h-2.5 bg-white/5 rounded-full overflow-hidden my-6 border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-coral-600 via-coral-500 to-[#ffa143] transition-all duration-300 shadow-[0_0_12px_#ff5722]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Timer Buttons */}
            <div className="flex items-center justify-center gap-3">
              {!timerActive ? (
                <button
                  onClick={handleStartTimer}
                  className="btn-coral flex items-center gap-2 px-8 py-3.5 text-sm font-bold shadow-xl active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Focus</span>
                </button>
              ) : (
                <button
                  onClick={handlePauseTimer}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-xl shadow-amber-600/30 transition active:scale-95"
                >
                  <Pause className="w-4 h-4 fill-white" />
                  <span>Pause</span>
                </button>
              )}

              <button
                onClick={handleResetTimer}
                className="p-3.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 transition"
                title="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={handleCompleteSession}
                disabled={savingSession}
                className="flex items-center gap-1.5 px-5 py-3.5 rounded-full bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600 hover:text-white font-semibold text-xs transition"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{savingSession ? 'Saving...' : 'Finish Early'}</span>
              </button>
            </div>

            {/* Duration Presets */}
            <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-white/5 flex-wrap">
              {[25, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleSelectDuration(mins)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                    durationMinutes === mins
                      ? 'bg-gradient-to-r from-coral-500 to-[#ff3b14] text-white shadow-[0_0_12px_rgba(255,87,34,0.35)]'
                      : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  {mins} min {mins === 25 ? '(Pomodoro)' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* AI Study Plan Breakdown */}
          <div className="glass-panel card-3d-tilt p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-coral-400" />
                <h3 className="text-sm font-bold text-white">AI Structured Study Schedule</h3>
              </div>
              <button
                onClick={handleGeneratePlan}
                disabled={generatingPlan}
                className="btn-coral flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold shadow-md"
              >
                {generatingPlan && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{studyPlan ? 'Regenerate Plan' : 'Generate Plan'}</span>
              </button>
            </div>

            {!studyPlan ? (
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center text-xs text-slate-400 space-y-2">
                <p>Click "Generate Plan" to get an AI breakdown for your {durationMinutes} minute session.</p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Focus topic (e.g. ARQ Protocols)"
                    value={focusTopic}
                    onChange={(e) => setFocusTopic(e.target.value)}
                    className="px-4 py-2 bg-white/[0.04] border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 w-72 focus:outline-none focus:border-coral-500/60"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3 animate-in fade-in duration-150">
                <p className="text-xs text-coral-300 italic p-3 rounded-2xl bg-coral-950/20 border border-coral-500/20">
                  💡 {studyPlan.advice}
                </p>

                <div className="space-y-2">
                  {studyPlan.plan.map((slot, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-3 text-xs"
                    >
                      <span className="px-2.5 py-1 rounded-full bg-coral-500/20 text-coral-300 font-mono font-bold shrink-0 border border-coral-500/30">
                        {slot.time_range}
                      </span>
                      <div>
                        <p className="font-bold text-slate-100">{slot.topic}</p>
                        <p className="text-slate-400 mt-0.5">{slot.activity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Real Analytics & Recent Sessions */}
        <div className="space-y-6">
          <div className="glass-panel card-3d-tilt p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Study Analytics</h2>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-slate-400">Sessions Completed Today</p>
                  <p className="text-2xl font-black text-white mt-1">
                    {stats?.sessions_today || 0}
                  </p>
                </div>
                <Award className="w-8 h-8 text-coral-400/80" />
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-slate-400">Study Time Today</p>
                  <p className="text-2xl font-black text-coral-400 mt-1">
                    {stats?.today_minutes || 0} mins
                  </p>
                </div>
                <Clock className="w-8 h-8 text-coral-400/80" />
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-slate-400">Total All-Time Focus</p>
                  <p className="text-2xl font-black text-emerald-400 mt-1">
                    {stats?.total_study_minutes || 0} mins
                  </p>
                </div>
                <Timer className="w-8 h-8 text-emerald-400/80" />
              </div>
            </div>
          </div>

          {/* Recent Study Sessions */}
          <div className="glass-panel card-3d-tilt p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white">Recent Sessions</h3>
            {(!stats?.recent_sessions || stats.recent_sessions.length === 0) ? (
              <p className="text-xs text-slate-500 py-4 text-center">No completed study sessions yet.</p>
            ) : (
              <div className="space-y-2">
                {stats.recent_sessions.slice(0, 5).map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-200">{s.subject}</p>
                      <p className="text-[10px] text-slate-500">
                        {new Date(s.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="font-mono text-coral-400 font-bold">
                      +{s.actual_duration_minutes}m
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
