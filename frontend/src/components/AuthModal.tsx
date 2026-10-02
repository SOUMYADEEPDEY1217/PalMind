import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { api } from '../api/client';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'signin'
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [goal, setGoal] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Quick Google Demo accounts picker toggle
  const [showGoogleAccounts, setShowGoogleAccounts] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccessMsg(null);
  };

  const handleSwitchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setError(null);
    setSuccessMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please provide a valid Gmail or email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const res = await api.signUp({
          name: name.trim(),
          email: cleanEmail,
          password,
          goal: goal.trim() || undefined,
        });
        localStorage.setItem('palmind_token', res.token);
        setSuccessMsg(res.message || 'Account created successfully!');
        setTimeout(() => {
          onAuthSuccess(res.user);
          onClose();
        }, 1000);
      } else {
        const res = await api.signIn({
          email: cleanEmail,
          password,
        });
        localStorage.setItem('palmind_token', res.token);
        setSuccessMsg(res.message || 'Signed in successfully!');
        setTimeout(() => {
          onAuthSuccess(res.user);
          onClose();
        }, 800);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async (customEmail?: string, customName?: string, customPicture?: string) => {
    setError(null);
    setLoading(true);
    try {
      const gEmail = customEmail || (email.trim().endsWith('@gmail.com') ? email.trim() : 'alex.scholar@gmail.com');
      const gName = customName || (name.trim() || 'Alex Scholar');
      const gPic = customPicture || 'https://lh3.googleusercontent.com/a/default-user';

      const res = await api.googleAuth({
        email: gEmail,
        name: gName,
        picture: gPic,
      });

      localStorage.setItem('palmind_token', res.token);
      setSuccessMsg(`Welcome, ${res.user.name}!`);
      setTimeout(() => {
        onAuthSuccess(res.user);
        onClose();
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
      setShowGoogleAccounts(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#0a0f18]/95 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-coral-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-coral-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-coral-500/10 border border-coral-500/30 flex items-center justify-center text-coral-400 shadow-[0_0_20px_rgba(255,87,34,0.3)]">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {mode === 'signin' ? 'Welcome Back to PalMind' : 'Create Your Second Brain'}
          </h2>
          <p className="text-xs text-slate-400">
            {mode === 'signin'
              ? 'Access your private local memories, tasks, and notes'
              : 'Start your zero-cloud AI companion on this device'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-white/[0.04] border border-white/5 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => handleSwitchMode('signin')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'signin'
                ? 'bg-coral-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode('signup')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'signup'
                ? 'bg-coral-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* GOOGLE SIGN IN BUTTON */}
        <div className="space-y-3 mb-6">
          <button
            type="button"
            onClick={() => setShowGoogleAccounts(!showGoogleAccounts)}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 text-white text-xs font-bold flex items-center justify-center gap-3 transition shadow-sm hover:border-coral-500/30 group"
          >
            {/* Official Google G SVG */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Quick Google Profile Selector Dropdown */}
          {showGoogleAccounts && (
            <div className="p-3 bg-[#05080e] border border-white/10 rounded-2xl space-y-2 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-1">
                Choose a Google Account
              </p>
              <button
                type="button"
                onClick={() => handleGoogleAuth('alex.scholar@gmail.com', 'Alex Scholar', 'https://lh3.googleusercontent.com/a/default')}
                className="w-full p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] flex items-center gap-3 transition text-left"
              >
                <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                  A
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">Alex Scholar</p>
                  <p className="text-[10px] text-slate-400 truncate">alex.scholar@gmail.com</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleGoogleAuth('maya.lin@gmail.com', 'Maya Lin', 'https://lh3.googleusercontent.com/a/default')}
                className="w-full p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] flex items-center gap-3 transition text-left"
              >
                <div className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center shrink-0">
                  M
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">Maya Lin</p>
                  <p className="text-[10px] text-slate-400 truncate">maya.lin@gmail.com</p>
                </div>
              </button>

              {email.includes('@') && (
                <button
                  type="button"
                  onClick={() => handleGoogleAuth(email.trim(), name.trim() || 'Google User')}
                  className="w-full p-2 rounded-xl bg-coral-500/10 hover:bg-coral-500/20 border border-coral-500/20 flex items-center gap-3 transition text-left text-coral-300"
                >
                  <Sparkles className="w-4 h-4 shrink-0 text-coral-400" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">Sign in as {email}</p>
                    <p className="text-[10px] opacity-80">Use typed address via Google</p>
                  </div>
                </button>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-[1px] bg-white/10" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              or continue with email
            </span>
            <div className="flex-1 h-[1px] bg-white/10" />
          </div>
        </div>

        {/* FEEDBACK BANNERS */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* EMAIL & PASSWORD FORM */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-2xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-coral-500/60 transition"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-300">
                Gmail or Email Address
              </label>
              <button
                type="button"
                onClick={() => setEmail((prev) => (prev && !prev.includes('@') ? `${prev}@gmail.com` : prev))}
                className="text-[10px] text-coral-400 hover:text-coral-300"
              >
                +@gmail.com
              </button>
            </div>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-2xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-coral-500/60 transition"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Password {mode === 'signup' && <span className="text-slate-500 font-normal">(min 6 chars)</span>}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 bg-white/[0.04] border border-white/10 rounded-2xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-coral-500/60 transition"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-2xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-coral-500/60 transition"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Primary Learning Goal <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Master Machine Learning & Ace Finals"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-2xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-coral-500/60 transition"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-coral w-full py-3 text-xs font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 mt-4 transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In to PalMind' : 'Create My Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer switch and trust notice */}
        <div className="mt-5 text-center space-y-3">
          <p className="text-xs text-slate-400">
            {mode === 'signin' ? "Don't have an account yet?" : 'Already have an account?'}
            <button
              type="button"
              onClick={() => handleSwitchMode(mode === 'signin' ? 'signup' : 'signin')}
              className="ml-1 text-coral-400 hover:text-coral-300 font-bold transition"
            >
              {mode === 'signin' ? 'Create one now' : 'Sign in here'}
            </button>
          </p>

          <div className="inline-flex items-center gap-1.5 text-[10px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Private • Stored securely on your device</span>
          </div>
        </div>
      </div>
    </div>
  );
};
