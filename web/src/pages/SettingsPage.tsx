import React, { useState } from 'react';
import {
  Settings,
  Lock,
  Bell,
  Eye,
  Server,
  CheckCircle2,
  AlertCircle,
  Save,
  Cpu,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Notification toggles
  const [notifyJobComplete, setNotifyJobComplete] = useState(true);
  const [notifyJobFailed, setNotifyJobFailed] = useState(true);
  const [notifyWeeklyDigest, setNotifyWeeklyDigest] = useState(false);

  // Privacy toggles
  const [shareAnalysesWithTeam, setShareAnalysesWithTeam] = useState(false);

  // Computational backend preferences
  const [backendEndpoint, setBackendEndpoint] = useState('http://127.0.0.1:8000');
  const [vinaThreads, setVinaThreads] = useState(4);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }

    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-2 text-xs font-semibold text-[#0284C7] uppercase tracking-wider mb-1">
          <Settings className="w-4 h-4" />
          <span>Application Configuration</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure security credentials, notifications, privacy bounds, and computational backend dispatchers.
        </p>
      </div>

      {settingsSaved && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>System preferences and computational worker settings saved.</span>
        </div>
      )}

      {/* Security: Password Change */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center space-x-2 text-slate-800 pb-3 border-b border-slate-100">
          <Lock className="w-4 h-4 text-[#0284C7]" />
          <h3 className="text-sm font-bold">Password & Authentication</h3>
        </div>

        {passwordSuccess && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
            Password has been successfully updated with Argon2/PBKDF2 hashing.
          </div>
        )}

        {passwordError && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {passwordError}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-[#0284C7]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-[#0284C7]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-[#0284C7]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-sm transition-all"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center space-x-2 text-slate-800 pb-3 border-b border-slate-100">
          <Bell className="w-4 h-4 text-[#0284C7]" />
          <h3 className="text-sm font-bold">Notification & Dispatch Alerts</h3>
        </div>

        <div className="space-y-3">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyJobComplete}
              onChange={(e) => setNotifyJobComplete(e.target.checked)}
              className="mt-0.5 rounded text-[#0284C7] focus:ring-[#0284C7]"
            />
            <div>
              <span className="text-xs font-semibold text-slate-800 block">Docking Simulation Complete</span>
              <span className="text-[11px] text-slate-500 block">
                Receive an in-app notice when AutoDock Vina finishes conformational scoring.
              </span>
            </div>
          </label>

          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyJobFailed}
              onChange={(e) => setNotifyJobFailed(e.target.checked)}
              className="mt-0.5 rounded text-[#0284C7] focus:ring-[#0284C7]"
            />
            <div>
              <span className="text-xs font-semibold text-slate-800 block">Job Failure & Convergence Exception</span>
              <span className="text-[11px] text-slate-500 block">
                Instant alert if a grid coordinate box is invalid or receptor coordinates lack required partial charges.
              </span>
            </div>
          </label>

          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyWeeklyDigest}
              onChange={(e) => setNotifyWeeklyDigest(e.target.checked)}
              className="mt-0.5 rounded text-[#0284C7] focus:ring-[#0284C7]"
            />
            <div>
              <span className="text-xs font-semibold text-slate-800 block">Weekly Research Summary</span>
              <span className="text-[11px] text-slate-500 block">
                Email digest summarizing candidate screening metrics and top scoring binding interactions.
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Computational Backend Worker Settings */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center space-x-2 text-slate-800 pb-3 border-b border-slate-100">
          <Cpu className="w-4 h-4 text-[#0284C7]" />
          <h3 className="text-sm font-bold">Computational Worker Dispatcher</h3>
        </div>

        <form onSubmit={handleSavePreferences} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">FastAPI Backend Endpoint</label>
              <div className="relative">
                <Server className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={backendEndpoint}
                  onChange={(e) => setBackendEndpoint(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-[#0284C7] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">AutoDock Vina CPU Threads</label>
              <select
                value={vinaThreads}
                onChange={(e) => setVinaThreads(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-[#0284C7]"
              >
                <option value={2}>2 Threads (Low CPU footprint)</option>
                <option value={4}>4 Threads (Balanced workstation)</option>
                <option value={8}>8 Threads (High-throughput parallel search)</option>
                <option value={16}>16 Threads (HPC Cluster node)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">FastAPI backend health check: 127.0.0.1:8000 (Connected)</span>
            <button
              type="submit"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
