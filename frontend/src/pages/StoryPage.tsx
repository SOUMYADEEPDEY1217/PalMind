import React from 'react';
import {
  Heart,
  Brain,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  Quote
} from 'lucide-react';

interface StoryPageProps {
  onNavigate: (tab: string) => void;
}

export const StoryPage: React.FC<StoryPageProps> = ({ onNavigate }) => {
  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-4xl mx-auto">
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-coral-500/10 border border-coral-500/25 text-coral-400 text-xs font-bold shadow-inner">
        <Heart className="w-3.5 h-3.5 fill-coral-500/30 text-coral-400" />
        <span>Build for a Friend Hackathon Challenge</span>
      </div>

      {/* Main Headline */}
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          "I built PalMind for a friend who was tired of forgetting the things that mattered."
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          A personal, private AI memory companion that brings scattered notes, exam deadlines, PDFs, and daily promises into one calm, private space.
        </p>
      </div>

      {/* The Problem & The Friend */}
      <div className="glass-panel card-3d-tilt p-6 sm:p-8 rounded-3xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>The Friend & The Problem</span>
        </h2>
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            My close friend Alex is an ambitious university student balancing demanding engineering courses, hackathons, and personal commitments. But their life was fragmented across a dozen disconnected apps:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400">
            <li>Exam schedules were hidden in academic portals and calendar alerts.</li>
            <li>Class slides and research papers were buried in the Downloads folder.</li>
            <li>Crucial hints dropped by professors in lecture ("Hamming code will be on the midterm") vanished into scrap paper.</li>
            <li>Promises made to teammates ("I promised Rahul the presentation slides tomorrow") were kept in their head until they were almost forgotten.</li>
          </ul>
          <p>
            Generic todo lists didn't help because they lack memory and context. Cloud-based AI chatbots required constantly copy-pasting private lecture notes and uploading personal documents to someone else's servers.
          </p>
        </div>
      </div>

      {/* What I Built */}
      <div className="glass-panel card-3d-tilt p-6 sm:p-8 rounded-3xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-coral-400" />
          <span>What I Built: Private AI Memory + Study Companion</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Instead of building another generic task tracker, I created <strong>PalMind</strong>: an AI companion designed around a simple, powerful architecture:
        </p>

        <div className="p-4 rounded-2xl bg-[#06090e] border border-white/10 font-mono text-xs text-coral-300 text-center leading-loose">
          USER'S LIFE (Tasks + Notes + PDFs + Promises)<br />
          ↓<br />
          LOCAL AI ENGINE (Ollama + Sentence Transformers)<br />
          ↓<br />
          PERSONAL MEMORY LAYER (Vector Search + Semantic Vault)<br />
          ↓<br />
          CONTEXT-AWARE COMPANION (Priorities, Grounded Answers & Study Mode)
        </div>
      </div>

      {/* Why Open Innovation Matters */}
      <div className="glass-panel card-3d-tilt p-6 sm:p-8 rounded-3xl space-y-4 border-coral-500/30">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-coral-400" />
          <span>Why Open Source AI Matters</span>
        </h2>
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            Open-source AI is the foundational pillar of PalMind, not an afterthought:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <p className="font-bold text-white">Zero Inference Cost</p>
              <p className="text-xs text-slate-400">Students cannot afford paying per-token API charges for daily study companions.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <p className="font-bold text-white">100% Privacy by Design</p>
              <p className="text-xs text-slate-400">Personal notes, professor hints, and private promises never leave the user's computer.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <p className="font-bold text-white">Interchangeable Models</p>
              <p className="text-xs text-slate-400">Swap seamlessly between Qwen 2.5, Llama 3.2, or Gemma without vendor lock-in.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <p className="font-bold text-white">Offline Capability</p>
              <p className="text-xs text-slate-400">Works in library basements and during campus flights with no active internet connection.</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-coral-950/20 border border-coral-500/30 text-coral-300 font-semibold text-center mt-4 shadow-inner">
            "Your memories shouldn't require sending your life to someone else's server."
          </div>
        </div>
      </div>

      {/* Real Friend Feedback Placeholder */}
      <div className="glass-panel card-3d-tilt p-6 sm:p-8 rounded-3xl space-y-3 border-emerald-500/20">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Quote className="w-4 h-4 text-emerald-400" />
          <span>What My Friend Said</span>
        </h3>
        <div className="p-4 rounded-2xl bg-emerald-950/15 border border-emerald-500/20 text-xs text-slate-300 italic">
          "Having an AI that already remembers what my professor hinted last Tuesday and what promises I made to my team—without sending my notes to the cloud—is an absolute superpower."
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={() => onNavigate('dashboard')}
          className="btn-coral flex items-center gap-2 px-6 py-3 text-xs font-bold shadow-xl active:scale-95"
        >
          <span>Explore PalMind Workspace</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
