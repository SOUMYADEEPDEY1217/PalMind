import React, { useState, useEffect } from 'react';
import {
  Settings,
  Cpu,
  User,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Loader2,
  LogIn,
  LogOut,
  Shield,
  Mail
} from 'lucide-react';
import { api } from '../api/client';
import { UserProfile, AIStatus, AITestResult, AppSettings } from '../types';

interface SettingsPageProps {
  user: UserProfile | null;
  onUserUpdate: (u: UserProfile) => void;
  onRefreshAIStatus: () => void;
  onOpenAuthModal?: (mode?: 'signin' | 'signup') => void;
  onLogout?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  user,
  onUserUpdate,
  onRefreshAIStatus,
  onOpenAuthModal,
  onLogout,
}) => {
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileGoal, setGoal] = useState(user?.goal || '');
  const [productiveTime, setProductiveTime] = useState(user?.productive_time || 'Morning');
  const [profileSaved, setProfileSaved] = useState(false);

  // AI settings
  const [settingsData, setSettingsData] = useState<AppSettings | null>(null);
  const [aiStatus, setAIStatus] = useState<AIStatus | null>(null);
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState('qwen2.5:7b');
  const [temperature, setTemperature] = useState(0.3);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Test AI
  const [testingAI, setTestingAI] = useState(false);
  const [testResult, setTestResult] = useState<AITestResult | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [s, ai] = await Promise.all([
          api.getSettings(),
          api.getAIStatus()
        ]);
        setSettingsData(s);
        setAIStatus(ai);
        setOllamaUrl(s.ollama_url);
        setOllamaModel(s.ollama_model);
        setTemperature(s.temperature);
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await api.updateProfile({
        name: profileName.trim(),
        goal: profileGoal.trim(),
        productive_time: productiveTime,
      });
      onUserUpdate(updated);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (err) {
      console.error('Failed to save profile:', err);
    }
  };

  const handleSaveAISettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const updated = await api.updateSettings({
        ollama_url: ollamaUrl.trim(),
        ollama_model: ollamaModel.trim(),
        temperature,
      });
      setSettingsData(updated);
      setSettingsSaved(true);
      onRefreshAIStatus();
      setTimeout(() => setSettingsSaved(false), 2500);
    } catch (err) {
      console.error('Failed to update settings:', err);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingAI(true);
    setTestResult(null);
    try {
      const res = await api.testAI();
      setTestResult(res);
      onRefreshAIStatus();
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Connection test failed',
      });
    } finally {
      setTestingAI(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Customize your profile, local AI inference model, and companion preferences.
        </p>
      </div>

      {/* Account & Authentication Card */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name}
              className="w-12 h-12 rounded-2xl object-cover border border-coral-500/40 shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-coral-500/10 border border-coral-500/30 text-coral-400 font-bold text-base flex items-center justify-center shrink-0">
              {user?.name ? user.name[0].toUpperCase() : 'F'}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm sm:text-base font-extrabold text-white truncate">
                {user?.name || 'Local Friend'}
              </p>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-coral-500/10 text-coral-400 border border-coral-500/20 capitalize">
                {user?.auth_provider || 'Local'} Account
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {user?.email || 'No email attached • Running in local offline guest mode'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!user?.email ? (
            <button
              onClick={() => onOpenAuthModal && onOpenAuthModal('signin')}
              className="btn-coral px-4 py-2 text-xs font-bold flex items-center gap-2 shadow-md"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Create Account</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => onOpenAuthModal && onOpenAuthModal('signin')}
                className="px-3.5 py-2 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-slate-200 border border-white/10 transition flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-400" />
                <span>Switch Account</span>
              </button>
              <button
                onClick={() => onLogout && onLogout()}
                className="px-3.5 py-2 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-xs font-semibold text-rose-300 border border-rose-500/20 transition flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Sign Out</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 perspective-1000">
        {/* Profile Settings */}
        <div className="glass-panel card-3d-tilt p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2.5 font-bold text-sm text-white">
            <User className="w-4 h-4 text-coral-400" />
            <span>Profile & Learning Goals</span>
          </div>

          {profileSaved && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-2xl text-white text-xs focus:outline-none focus:border-coral-500/60 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Current Goal / Focus</label>
              <input
                type="text"
                value={profileGoal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-2xl text-white text-xs focus:outline-none focus:border-coral-500/60 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Most Productive Time</label>
              <select
                value={productiveTime}
                onChange={(e) => setProductiveTime(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0e1422] border border-white/10 rounded-2xl text-white text-xs focus:outline-none focus:border-coral-500/60 transition"
              >
                <option value="Morning">Morning (6 AM - 12 PM)</option>
                <option value="Afternoon">Afternoon (12 PM - 5 PM)</option>
                <option value="Evening">Evening (5 PM - 10 PM)</option>
                <option value="Night">Night Owl (10 PM - 3 AM)</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn-coral px-6 py-2.5 text-xs font-bold shadow-md"
            >
              Save Profile
            </button>
          </form>
        </div>

        {/* AI & Ollama Configuration */}
        <div className="glass-panel card-3d-tilt p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2.5 font-bold text-sm text-white">
            <Cpu className="w-4 h-4 text-coral-400" />
            <span>Local AI Model Configuration</span>
          </div>

          {settingsSaved && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>AI settings updated without restarting!</span>
            </div>
          )}

          <form onSubmit={handleSaveAISettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Ollama Host URL</label>
              <input
                type="text"
                value={ollamaUrl}
                onChange={(e) => setOllamaUrl(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-2xl text-white text-xs font-mono focus:outline-none focus:border-coral-500/60 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Model Name (Swap dynamically)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                  placeholder="e.g. qwen2.5:7b, qwen2.5:3b, llama3.2"
                  className="flex-1 px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-2xl text-white text-xs font-mono focus:outline-none focus:border-coral-500/60 transition"
                />
                {aiStatus?.installed_models && aiStatus.installed_models.length > 0 && (
                  <select
                    onChange={(e) => {
                      if (e.target.value) setOllamaModel(e.target.value);
                    }}
                    value=""
                    className="px-3 py-2 bg-[#0e1422] border border-white/10 rounded-2xl text-xs text-slate-300"
                    title="Choose from detected local models"
                  >
                    <option value="" disabled>Pick Installed</option>
                    {aiStatus.installed_models.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                )}
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                You can swap models at any time without changing application code.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Creativity / Temperature</span>
                <span className="font-mono text-coral-400">{temperature}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-coral-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={savingSettings}
                className="btn-coral px-6 py-2.5 text-xs font-bold shadow-md disabled:opacity-40"
              >
                {savingSettings ? 'Saving...' : 'Apply Changes'}
              </button>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingAI}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-semibold border border-white/10 transition"
              >
                {testingAI ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                <span>Test AI Connection</span>
              </button>
            </div>
          </form>

          {/* Test Results Output */}
          {testResult && (
            <div className={`p-3.5 rounded-2xl border text-xs animate-in fade-in duration-100 ${
              testResult.success
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
            }`}>
              <div className="flex items-center gap-2 font-bold mb-1">
                {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
                <span>{testResult.success ? 'Connected & Ready' : 'Connection Failed'}</span>
                {testResult.latency_ms && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 ml-auto">
                    {testResult.latency_ms} ms
                  </span>
                )}
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">{testResult.message}</p>
            </div>
          )}

          {/* Troubleshooting Checklist */}
          <div className="pt-2 text-[11px] text-slate-500 space-y-1">
            <p className="font-semibold text-slate-400">Troubleshooting Ollama:</p>
            <p>1. Open terminal and run: <code className="text-slate-300 bg-white/5 px-1 py-0.5 rounded">ollama serve</code></p>
            <p>2. Pull your model: <code className="text-slate-300 bg-white/5 px-1 py-0.5 rounded">ollama pull {ollamaModel}</code></p>
            <p>3. Click "Test AI Connection" above to verify response latency.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
