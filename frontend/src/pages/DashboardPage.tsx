import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckSquare,
  Brain,
  FileUp,
  MessageSquare,
  Clock,
  Calendar,
  AlertCircle,
  ArrowRight,
  Timer,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Cpu,
  Shield,
  Layers,
  Search,
  ExternalLink,
  Zap,
  Sliders,
  Database,
  Lock,
  Compass,
  Play
} from 'lucide-react';
import { api } from '../api/client';
import { UserProfile, DailyBrief, Task, Memory, StudyStats } from '../types';
import { Hero3DVortexCanvas } from '../components/3d/Hero3DVortexCanvas';
import { Interactive3DCard } from '../components/3d/Interactive3DCard';

interface DashboardProps {
  user: UserProfile | null;
  onNavigate: (tab: string) => void;
  onOpenQuickAdd: (type: 'task' | 'memory' | 'document' | 'reminder') => void;
}

export const DashboardPage: React.FC<DashboardProps> = ({
  user,
  onNavigate,
  onOpenQuickAdd,
}) => {
  const [brief, setBrief] = useState<DailyBrief | null>(null);
  const [studyStats, setStudyStats] = useState<StudyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeChartRange, setActiveChartRange] = useState<'1H' | '1D' | '1W' | '1M' | '1Y' | 'ALL'>('1D');
  const [quickQueryInput, setQuickQueryInput] = useState('');

  const fetchDashboardData = async () => {
    try {
      const [briefData, statsData] = await Promise.all([
        api.getDailyBrief(),
        api.getStudyStats()
      ]);
      setBrief(briefData);
      setStudyStats(statsData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleTask = async (task: Task) => {
    try {
      const newStatus = task.status === 'Completed' ? 'To Do' : 'Completed';
      await api.updateTask(task.id, { status: newStatus });
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const handleQuickQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQueryInput.trim()) {
      onNavigate('chat');
      return;
    }
    onNavigate('chat');
  };

  if (loading) {
    return (
      <div className="p-6 sm:p-12 space-y-8 max-w-7xl mx-auto animate-pulse">
        <div className="h-16 w-80 bg-white/5 rounded-3xl mx-auto" />
        <div className="h-96 bg-white/5 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-white/5 rounded-3xl" />
          <div className="h-64 bg-white/5 rounded-3xl" />
          <div className="h-64 bg-white/5 rounded-3xl" />
        </div>
      </div>
    );
  }

  const greeting = brief?.greeting || `Hello, ${user?.name || 'Friend'}`;

  return (
    <div className="relative min-h-screen p-4 sm:p-8 lg:p-12 space-y-16 max-w-7xl mx-auto overflow-hidden">
      
      {/* ========================================================================= */}
      {/* 3D WEBGL INTERACTIVE VORTEX CANVAS + ATMOSPHERIC LIGHT RING */}
      {/* ========================================================================= */}
      <div className="vortex-container">
        {/* Real-time Interactive 3D Three.js WebGL Vortex */}
        <Hero3DVortexCanvas />
        {/* Soft Ambient Core Glow */}
        <div className="vortex-ambient-glow" />
        {/* Outer Radiant Molten Ring */}
        <div className="vortex-ring animate-vortex-spin" />
        {/* Inner Razor-Thin Specular Ring with Glow Highlights */}
        <div className="vortex-ring-inner" />
      </div>

      {/* ========================================================================= */}
      {/* HERO SECTION WITH 3D FLOATING CHIPS & PERSPECTIVE */}
      {/* ========================================================================= */}
      <div className="relative z-10 pt-4 sm:pt-8 text-center space-y-6">
        
        {/* Floating 3D Pills (Left & Right of Hero Headline with Interactive 3D depth) */}
        <div className="hidden lg:block perspective-1000">
          {/* Top Left Pill */}
          <div className="absolute -top-4 left-6 floating-chip animate-float-slow hover:scale-110 transition-transform cursor-pointer shadow-[0_15px_30px_rgba(0,0,0,0.8)]">
            <span className="w-2 h-2 rounded-full bg-coral-500 animate-ping" />
            <Cpu className="w-3.5 h-3.5 text-coral-400" />
            <span>Local Qwen2.5 7B</span>
          </div>

          {/* Bottom Left Pill */}
          <div className="absolute top-28 left-0 floating-chip animate-float-medium hover:scale-110 transition-transform cursor-pointer shadow-[0_15px_30px_rgba(0,0,0,0.8)]">
            <Lock className="w-3.5 h-3.5 text-coral-400" />
            <span>Zero Cloud Leakage</span>
          </div>

          {/* Top Right Pill */}
          <div className="absolute -top-2 right-8 floating-chip animate-float-fast hover:scale-110 transition-transform cursor-pointer shadow-[0_15px_30px_rgba(0,0,0,0.8)]">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Vector RAG Memory</span>
          </div>

          {/* Bottom Right Pill */}
          <div className="absolute top-24 right-2 floating-chip animate-float-slow hover:scale-110 transition-transform cursor-pointer shadow-[0_15px_30px_rgba(0,0,0,0.8)]">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% On-Device Sandbox</span>
          </div>
        </div>

        {/* Hero Title Matching Cryptox Typography */}
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-semibold text-coral-400 mb-2 shadow-inner">
            <Sparkles className="w-3 h-3 text-coral-400" />
            <span>{greeting} • PalMind Autonomous Second Brain</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.08] drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)]">
            Step Into The Future Of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
              Cognitive Companion
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-normal pt-1">
            AI-optimized personal memory and proactive focus with human-grade reasoning and absolute on-device privacy.
          </p>
        </div>

        {/* Hero Coral Action Button */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('chat')}
            className="btn-coral px-8 py-3.5 text-sm font-bold flex items-center gap-2.5 shadow-2xl active:scale-95 group"
          >
            <span>Ask PalMind</span>
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </div>
          </button>
          
          <button
            onClick={() => {
              setRefreshing(true);
              fetchDashboardData();
            }}
            disabled={refreshing}
            className="px-5 py-3.5 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition backdrop-blur-md"
            title="Refresh daily intelligence"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-coral-400' : ''}`} />
            <span className="hidden sm:inline">Refresh Intel</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3D FLOATING CARDS PERSPECTIVE ROW WITH SPECULAR GLOW & TILT */}
      {/* ========================================================================= */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch perspective-1500 pt-4">
        
        {/* CARD 1 (LEFT - 4 cols): "Mind Stream & Activity" */}
        <Interactive3DCard
          maxTilt={7}
          className="lg:col-span-4 glass-card p-5 sm:p-6 rounded-3xl"
          contentClassName="flex flex-col justify-between h-full"
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-coral-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">Mind Stream</h3>
              </div>
              <button
                onClick={() => onNavigate('memory')}
                className="text-xs font-semibold text-coral-400 hover:text-coral-300 transition flex items-center gap-1"
              >
                <span>See All</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Mind stream activity list with mini sparklines */}
            <div className="mt-4 space-y-3.5">
              {/* Row 1: Focus Level */}
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between hover:bg-white/[0.04] transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-coral-500/10 border border-coral-500/20 flex items-center justify-center text-coral-400">
                    <Timer className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Study Sessions</p>
                    <p className="text-[10px] text-slate-400">{studyStats?.sessions_today || 0} completed today</p>
                  </div>
                </div>
                {/* Mini SVG Sparkline */}
                <div className="text-right">
                  <p className="text-xs font-mono font-bold text-white">{studyStats?.today_minutes || 0}m</p>
                  <p className="text-[10px] text-emerald-400 font-semibold">+18.4%</p>
                </div>
              </div>

              {/* Row 2: Tasks Done */}
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between hover:bg-white/[0.04] transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Smart Action Items</p>
                    <p className="text-[10px] text-slate-400">{brief?.urgent_tasks?.length || 0} priority queue</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono font-bold text-white">{brief?.urgent_tasks?.length || 0} Active</p>
                  <p className="text-[10px] text-coral-400 font-semibold">Priority</p>
                </div>
              </div>

              {/* Row 3: Memory Vault */}
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between hover:bg-white/[0.04] transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Memory Knowledge</p>
                    <p className="text-[10px] text-slate-400">{brief?.forgotten_commitments?.length || 0} commitments</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono font-bold text-white">Indexed</p>
                  <p className="text-[10px] text-emerald-400 font-semibold">100% Vector</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onOpenQuickAdd('memory')}
            className="mt-4 w-full py-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-slate-200 hover:text-white transition flex items-center justify-center gap-2"
          >
            <span>+ Store New Memory</span>
          </button>
        </Interactive3DCard>

        {/* CARD 2 (CENTER - 4 cols): ELEVATED 3D MOBILE FOCUS FRAME */}
        <Interactive3DCard
          maxTilt={9}
          className="lg:col-span-4 glass-panel p-6 rounded-3xl relative shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] border-coral-500/30 animate-float-medium"
          contentClassName="flex flex-col justify-between h-full relative"
        >
          {/* Subtle Top Specular Ring Light */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-coral-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Top Mock Header */}
          <div>
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-coral-500 shadow-[0_0_8px_#ff5722]" />
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Cognitive State</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>ACTIVE</span>
              </div>
            </div>

            {/* Pill Switcher */}
            <div className="flex items-center justify-between p-1 rounded-full bg-white/[0.04] border border-white/5 my-3 text-[10px]">
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex-1 py-1 rounded-full bg-gradient-to-r from-coral-500 to-coral-600 text-white font-bold shadow-sm"
              >
                Focus
              </button>
              <button
                onClick={() => onNavigate('tasks')}
                className="flex-1 py-1 rounded-full text-slate-400 hover:text-white transition"
              >
                Tasks
              </button>
              <button
                onClick={() => onNavigate('study')}
                className="flex-1 py-1 rounded-full text-slate-400 hover:text-white transition"
              >
                Timer
              </button>
              <button
                onClick={() => onNavigate('chat')}
                className="flex-1 py-1 rounded-full text-slate-400 hover:text-white transition"
              >
                RAG
              </button>
            </div>

            {/* Main Center Stat */}
            <div className="pt-2 text-center">
              <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
                98.4<span className="text-coral-400 font-sans text-xl ml-1">%</span>
              </p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Cognitive Focus Score • Optimal Mind State
              </p>
            </div>

            {/* Smooth Glowing Line Wave */}
            <div className="my-5 relative h-24 flex items-center justify-center">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="centerGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ff5722" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#ff5722" stopOpacity="0.0" />
                  </linearGradient>
                  <filter id="shadowFilter" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#ff5722" floodOpacity="0.5" />
                  </filter>
                </defs>
                {/* Wave Area Fill */}
                <path
                  d="M0 60 Q 50 15, 100 50 T 200 30 T 300 45 L 300 100 L 0 100 Z"
                  fill="url(#centerGlow)"
                />
                {/* Glowing Stroke Path */}
                <path
                  d="M0 60 Q 50 15, 100 50 T 200 30 T 300 45"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  filter="url(#shadowFilter)"
                />
                {/* Accent Pulsing Node Point */}
                <circle cx="200" cy="30" r="4.5" fill="#ff5722" stroke="#ffffff" strokeWidth="2" />
              </svg>
            </div>

            {/* Bottom Balance Strip */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
              <span className="text-slate-400">Total Study Time</span>
              <span className="font-mono font-bold text-emerald-400">+{studyStats?.total_study_minutes || 0}m (+18%)</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('study')}
            className="btn-coral w-full py-2.5 mt-4 text-xs font-bold flex items-center justify-center gap-2 shadow-lg"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Deep Focus Session</span>
          </button>
        </Interactive3DCard>

        {/* CARD 3 (RIGHT - 4 cols): "Autonomous Quick RAG Query" */}
        <Interactive3DCard
          maxTilt={7}
          className="lg:col-span-4 glass-card p-5 sm:p-6 rounded-3xl"
          contentClassName="flex flex-col justify-between h-full"
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-coral-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">Instant AI Query</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-coral-500/10 border border-coral-500/30 text-[10px] font-bold text-coral-400">
                Ollama 7B
              </span>
            </div>

            {/* Quick Prompt Input Box */}
            <form onSubmit={handleQuickQuerySubmit} className="mt-4 space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Ask your second brain</label>
                <div className="relative">
                  <input
                    type="text"
                    value={quickQueryInput}
                    onChange={(e) => setQuickQueryInput(e.target.value)}
                    placeholder="e.g. When is my machine learning exam?"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-coral-500/60 focus:bg-white/[0.05] transition"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 p-1.5 rounded-lg bg-coral-500 text-white hover:bg-coral-600 transition"
                  >
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Sample Pre-Engineered Prompts */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Suggested Queries</p>
                <div className="space-y-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setQuickQueryInput('What promises or commitments did I make this week?');
                    }}
                    className="w-full text-left p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:border-coral-500/30 text-slate-300 hover:text-white transition truncate"
                  >
                    💬 "What promises did I make this week?"
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQuickQueryInput('Summarize my pending tasks by urgency');
                    }}
                    className="w-full text-left p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:border-coral-500/30 text-slate-300 hover:text-white transition truncate"
                  >
                    ⚡ "Summarize my pending tasks by urgency"
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
              Zero Cloud Latency
            </span>
            <span className="font-mono text-slate-500">100% On-Device</span>
          </div>
        </Interactive3DCard>

      </div>

      {/* ========================================================================= */}
      {/* TRUST & OPEN-SOURCE AI ARCHITECTURE LOGO STRIP */}
      {/* ========================================================================= */}
      <div className="pt-4 text-center space-y-4">
        <p className="text-xs uppercase font-bold tracking-widest text-slate-400">
          Simplifying Cognitive Workflows For Autonomous Thinkers
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 opacity-85 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-white/[0.03] px-3.5 py-1.5 rounded-full border border-white/5 hover:border-coral-500/40 hover:scale-105 transition-all">
            <Cpu className="w-3.5 h-3.5 text-coral-400" />
            <span>Ollama Qwen2.5</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-white/[0.03] px-3.5 py-1.5 rounded-full border border-white/5 hover:border-coral-500/40 hover:scale-105 transition-all">
            <Brain className="w-3.5 h-3.5 text-coral-400" />
            <span>Sentence-Transformers</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-white/[0.03] px-3.5 py-1.5 rounded-full border border-white/5 hover:border-coral-500/40 hover:scale-105 transition-all">
            <Database className="w-3.5 h-3.5 text-coral-400" />
            <span>SQLite Vector RAG</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-white/[0.03] px-3.5 py-1.5 rounded-full border border-white/5 hover:border-coral-500/40 hover:scale-105 transition-all">
            <Shield className="w-3.5 h-3.5 text-coral-400" />
            <span>Zero Cloud Telemetry</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECOND SECTION: POWERFUL FEATURES FOR SMARTER COGNITIVE LIVING */}
      {/* ========================================================================= */}
      <div className="space-y-8 pt-6">
        
        {/* Section Header */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Powerful Features <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-coral-400 to-[#ff3b14]">
              For Smarter Living & Memory
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            AI-optimized memory with human-grade contextual recall and zero cloud footprint.
          </p>
        </div>

        {/* LARGE FEATURE HERO CARD WITH GLOWING ORANGE WAVE AREA CHART */}
        <Interactive3DCard
          maxTilt={4}
          className="glass-panel p-6 sm:p-10 rounded-3xl relative overflow-hidden border-t-coral-500/40 shadow-2xl"
          contentClassName="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full"
        >
          
          {/* Left Side: Copy and Action */}
          <div className="lg:col-span-5 space-y-4 min-w-0 w-full">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-coral-500/10 border border-coral-500/30 text-[11px] font-bold text-coral-400 whitespace-nowrap shrink-0">
              <Zap className="w-3.5 h-3.5 text-coral-400 shrink-0" />
              <span>Cognitive Analytics Engine</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Tools For Deep Memory & Autonomous Knowledge
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg">
              Smart local platform designed to help you analyze study trends, remember personal promises, and make confident decisions without compromising personal data.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('study')}
                className="btn-coral px-6 py-2.5 text-xs font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
              >
                <span>Start Study Session</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Side: Radiant Molten Orange Wave Area Chart with Range Selectors */}
          <div className="lg:col-span-7 bg-[#070b12]/90 border border-white/10 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl relative min-w-0 w-full">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-white">Focus & Memory Retention Curve</p>
                <p className="text-[11px] text-slate-400">Local Vector Embeddings vs. Retention</p>
              </div>

              {/* Time Range Pill Toggles (1H, 1D, 1W, 1M, 1Y, ALL) */}
              <div className="flex items-center p-1 rounded-full bg-white/[0.04] border border-white/5 text-[10px]">
                {(['1H', '1D', '1W', '1M', '1Y', 'ALL'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setActiveChartRange(range)}
                    className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                      activeChartRange === range
                        ? 'bg-coral-500 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* Glowing Orange SVG Wave Area Graphic */}
            <div className="relative h-44 sm:h-52 w-full pt-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="moltenOrangeGradient" x1="0%" y1="0%" x2="0%" y2="1">
                    <stop offset="0%" stopColor="#ff5722" stopOpacity="0.45" />
                    <stop offset="60%" stopColor="#ff5722" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#ff5722" stopOpacity="0.0" />
                  </linearGradient>
                  <filter id="waveGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#ff5722" floodOpacity="0.8" />
                  </filter>
                </defs>

                {/* Grid guidelines */}
                <line x1="0" y1="50" x2="600" y2="50" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
                <line x1="0" y1="100" x2="600" y2="100" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
                <line x1="0" y1="150" x2="600" y2="150" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />

                {/* Orange Area Gradient */}
                <path
                  d="M0 130 C 90 90, 150 170, 240 80 C 330 10, 420 120, 510 50 C 560 20, 580 40, 600 35 L 600 200 L 0 200 Z"
                  fill="url(#moltenOrangeGradient)"
                />

                {/* Sharp Radiant Orange Curve */}
                <path
                  d="M0 130 C 90 90, 150 170, 240 80 C 330 10, 420 120, 510 50 C 560 20, 580 40, 600 35"
                  fill="none"
                  stroke="#ff5722"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  filter="url(#waveGlow)"
                />

                {/* Highlight Apex Dots with Pulsing Halo */}
                <circle cx="240" cy="80" r="5" fill="#ffffff" stroke="#ff5722" strokeWidth="2.5" />
                <circle cx="510" cy="50" r="5" fill="#ffffff" stroke="#ff5722" strokeWidth="2.5" />
              </svg>
            </div>

            {/* Bottom Chart Footer Info */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5 font-mono">
              <span className="text-slate-400">Total Cognitive Output</span>
              <span className="text-coral-400 font-bold">{studyStats?.total_study_minutes || 48} Focus Points</span>
            </div>
          </div>

        </Interactive3DCard>

        {/* SPLIT BOTTOM CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 perspective-1000">
          
          {/* Card A (Left): Priority Task & Memory Records with Avatar Badges */}
          <Interactive3DCard
            maxTilt={5}
            className="glass-card p-6 sm:p-7 rounded-3xl"
            contentClassName="space-y-4 w-full h-full flex flex-col justify-between"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-coral-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">Active Action Directives</h3>
              </div>
              <button
                onClick={() => onNavigate('tasks')}
                className="text-xs font-semibold text-coral-400 hover:text-coral-300 transition"
              >
                Manage Tasks
              </button>
            </div>

            {(!brief?.urgent_tasks || brief.urgent_tasks.length === 0) ? (
              <div className="py-8 text-center text-xs text-slate-400">
                All clear! No pending urgent tasks recorded.
              </div>
            ) : (
              <div className="space-y-3">
                {brief.urgent_tasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-coral-500/30 transition flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-coral-500/10 border border-coral-500/20 flex items-center justify-center text-coral-400 font-bold text-xs shrink-0">
                        {task.category ? task.category[0].toUpperCase() : 'T'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate group-hover:text-coral-400 transition">
                          {task.title}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {task.ai_priority_reason || task.category}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        task.priority === 'Urgent'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-coral-500/20 text-coral-300 border border-coral-500/30'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Interactive3DCard>

          {/* Card B (Right): Privacy Shield Node Architecture */}
          <Interactive3DCard
            maxTilt={5}
            className="glass-card p-6 sm:p-7 rounded-3xl"
            contentClassName="flex flex-col justify-between space-y-4 w-full h-full"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white tracking-tight">On-Device Trust Architecture</h3>
                </div>
                <button
                  onClick={() => onNavigate('privacy')}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
                >
                  Verify Sandbox
                </button>
              </div>

              {/* Node Diagram Graphic with Glowing Orange Central Shield */}
              <div className="py-6 flex flex-col items-center justify-center relative">
                {/* Connecting lines */}
                <div className="absolute top-1/2 left-12 right-12 h-[2px] bg-gradient-to-r from-coral-500/20 via-coral-500 to-coral-500/20 -translate-y-1/2 z-0" />

                {/* Central Shield with Vibrant Glow */}
                <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-tr from-[#ff3b14] to-[#ff5722] p-1 shadow-[0_0_40px_rgba(255,87,34,0.6)] flex items-center justify-center hover:scale-105 transition-transform">
                  <div className="w-full h-full rounded-full bg-[#06090e] flex items-center justify-center">
                    <Shield className="w-8 h-8 text-coral-400" />
                  </div>
                </div>

                {/* Peripheral Sandbox Nodes */}
                <div className="w-full grid grid-cols-3 gap-2 mt-6 z-10 text-center">
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-coral-500/30 hover:scale-105 transition-all">
                    <Database className="w-4 h-4 text-coral-400 mx-auto mb-1" />
                    <p className="text-[11px] font-bold text-white">Local SQLite</p>
                    <p className="text-[9px] text-slate-400">Encrypted DB</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-coral-500/30 hover:scale-105 transition-all">
                    <Cpu className="w-4 h-4 text-coral-400 mx-auto mb-1" />
                    <p className="text-[11px] font-bold text-white">Local Ollama</p>
                    <p className="text-[9px] text-slate-400">Zero Cloud API</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-coral-500/30 hover:scale-105 transition-all">
                    <Lock className="w-4 h-4 text-coral-400 mx-auto mb-1" />
                    <p className="text-[11px] font-bold text-white">No Telemetry</p>
                    <p className="text-[9px] text-slate-400">Offline Safe</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
              <span>All documents, tasks, and memory remain on this machine.</span>
              <span className="text-emerald-400 font-bold">100% Private</span>
            </div>
          </Interactive3DCard>

        </div>

      </div>

    </div>
  );
};
