import React, { useState, useEffect } from 'react';
import {
  Bell,
  Plus,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { api } from '../api/client';
import { Reminder } from '../types';

interface RemindersPageProps {
  onOpenQuickAdd: (type: 'reminder') => void;
}

export const RemindersPage: React.FC<RemindersPageProps> = ({ onOpenQuickAdd }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');

  const fetchReminders = async () => {
    try {
      const data = await api.getReminders();
      setReminders(data);
    } catch (err) {
      console.error('Failed to load reminders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
    if ('Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  const handleRequestPermission = async () => {
    if ('Notification' in window) {
      const res = await Notification.requestPermission();
      setNotifPermission(res);
      if (res === 'granted') {
        new Notification('PalMind Reminders Enabled', {
          body: 'You will receive gentle local reminders for your study commitments.',
        });
      }
    }
  };

  const handleToggleComplete = async (rem: Reminder) => {
    try {
      await api.updateReminder(rem.id, { completed: !rem.completed });
      fetchReminders();
    } catch (err) {
      console.error('Failed to update reminder:', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteReminder(id);
      fetchReminders();
    } catch (err) {
      console.error('Failed to delete reminder:', err);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Reminders
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Local time-based alerts for study sessions, deadlines, and promises.
          </p>
        </div>
        <button
          onClick={() => onOpenQuickAdd('reminder')}
          className="btn-coral self-start sm:self-center flex items-center gap-1.5 px-5 py-2 text-xs font-bold active:scale-95 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>New Reminder</span>
        </button>
      </div>

      {/* Browser Notification Banner */}
      {'Notification' in window && notifPermission !== 'granted' && (
        <div className="p-4 rounded-3xl glass-panel border-coral-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-coral-400 shrink-0" />
            <span className="text-slate-300">
              Enable browser notifications so PalMind can alert you when it's time to revise.
            </span>
          </div>
          <button
            onClick={handleRequestPermission}
            className="btn-coral px-4 py-1.5 text-xs font-semibold self-start sm:self-center shrink-0"
          >
            Allow Notifications
          </button>
        </div>
      )}

      {/* Reminders List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-white/5 rounded-2xl" />
          ))}
        </div>
      ) : reminders.length === 0 ? (
        <div className="glass-panel py-16 text-center rounded-3xl space-y-3">
          <Bell className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No reminders scheduled</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Schedule a reminder for your next exam topic or promised task.
          </p>
        </div>
      ) : (
        <div className="space-y-3 perspective-1000">
          {reminders.map((rem) => {
            const isPast = new Date(rem.remind_at) < new Date();

            return (
              <div
                key={rem.id}
                className="glass-card card-3d-tilt p-4 rounded-2xl flex items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <button
                    onClick={() => handleToggleComplete(rem)}
                    className="mt-0.5 text-slate-400 hover:text-coral-400 transition shrink-0"
                  >
                    {rem.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shadow-[0_0_8px_#34d399]" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500 hover:text-coral-400" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <p className={`text-xs sm:text-sm font-semibold truncate ${
                      rem.completed ? 'line-through text-slate-500' : 'text-slate-100'
                    }`}>
                      {rem.title}
                    </p>
                    {rem.description && (
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                        {rem.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                      <span className={`flex items-center gap-1 font-medium ${
                        isPast && !rem.completed ? 'text-rose-400 font-bold' : 'text-coral-300'
                      }`}>
                        <Clock className="w-3 h-3 text-coral-400" />
                        <span>{new Date(rem.remind_at).toLocaleString()}</span>
                      </span>
                      {isPast && !rem.completed && (
                        <span className="text-rose-400 text-[10px]">(Past due)</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(rem.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition shrink-0"
                  title="Delete reminder"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
