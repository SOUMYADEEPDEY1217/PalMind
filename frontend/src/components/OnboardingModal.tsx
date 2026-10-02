import React, { useState } from 'react';
import { Brain, Sparkles, Check, ArrowRight, Sun, Sunset, Moon, Sunrise, ShieldCheck } from 'lucide-react';
import { api } from '../api/client';
import { UserProfile } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (user: UserProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('Prepare for university exams');
  const [productiveTime, setProductiveTime] = useState('Morning');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const goalOptions = [
    'Prepare for university exams',
    'Keep track of college coursework & assignments',
    'Build software projects & hackathons',
    'Career growth & interview preparation',
    'Personal balance & daily commitments'
  ];

  const productiveOptions = [
    { id: 'Morning', label: 'Morning (6 AM - 12 PM)', icon: Sunrise },
    { id: 'Afternoon', label: 'Afternoon (12 PM - 5 PM)', icon: Sun },
    { id: 'Evening', label: 'Evening (5 PM - 10 PM)', icon: Sunset },
    { id: 'Night', label: 'Night Owl (10 PM - 3 AM)', icon: Moon },
  ];

  const handleFinish = async () => {
    setSaving(true);
    try {
      const updated = await api.updateProfile({
        name: name.trim() || 'Friend',
        goal: goal,
        productive_time: productiveTime,
        onboarded: true,
      });
      onComplete(updated);
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#080d16] border border-coral-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-coral-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ff3b14] to-[#ff5722] text-white shadow-lg shadow-coral-500/30">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Welcome to PalMind</h2>
            <p className="text-xs text-slate-400">An autonomous AI companion that remembers what matters to you.</p>
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step
                  ? 'w-8 bg-coral-500 shadow-[0_0_8px_#ff5722]'
                  : s < step
                  ? 'w-4 bg-coral-400/40'
                  : 'w-2 bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Name */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right duration-200">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">What should I call you?</h3>
              <p className="text-xs text-slate-400">
                I'll use this to personalize your daily briefings, reminders, and study plans.
              </p>
            </div>
            <input
              type="text"
              placeholder="e.g. Alex"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-coral-500/60 transition"
            />
            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!name.trim()}
                className="btn-coral flex items-center gap-2 px-6 py-2.5 text-xs font-semibold shadow-lg active:scale-95 disabled:opacity-40"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Goal */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right duration-200">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">What are you currently working toward?</h3>
              <p className="text-xs text-slate-400">
                PalMind will align its recommendations with your main focus.
              </p>
            </div>
            <div className="space-y-2">
              {goalOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setGoal(opt)}
                  className={`flex items-center justify-between w-full p-3.5 rounded-2xl border text-xs font-medium text-left transition ${
                    goal === opt
                      ? 'bg-coral-500/15 border-coral-500/40 text-white font-semibold shadow-sm'
                      : 'bg-white/[0.02] border-white/5 text-slate-300 hover:bg-white/[0.05]'
                  }`}
                >
                  <span>{opt}</span>
                  {goal === opt && <Check className="w-4 h-4 text-coral-400 shrink-0" />}
                </button>
              ))}
            </div>
            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="btn-coral flex items-center gap-2 px-6 py-2.5 text-xs font-semibold shadow-lg active:scale-95"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Productive Time */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right duration-200">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">When are you usually most productive?</h3>
              <p className="text-xs text-slate-400">
                Helps schedule intensive study blocks when your cognitive energy is highest.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {productiveOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = productiveTime === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setProductiveTime(opt.id)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border text-xs font-medium text-left transition ${
                      isSelected
                        ? 'bg-coral-500/15 border-coral-500/40 text-white font-semibold'
                        : 'bg-white/[0.02] border-white/5 text-slate-300 hover:bg-white/[0.05]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-coral-400' : 'text-slate-400'}`} />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-3 text-xs">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <span>100% Private: All preferences stay exclusively on this machine.</span>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                disabled={saving}
                className="btn-coral flex items-center gap-2 px-6 py-2.5 text-xs font-bold shadow-xl active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>{saving ? 'Setting up...' : 'Enter My Workspace'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
