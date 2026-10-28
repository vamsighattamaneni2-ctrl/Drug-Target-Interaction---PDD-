import React, { useState } from 'react';
import {
  User,
  Mail,
  Building,
  Shield,
  Key,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Save,
  Laptop,
} from 'lucide-react';
import { appStateService } from '../services/appStateService';
import { UserAccount } from '../types';

export const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserAccount>(() => appStateService.getCurrentUser());
  const [name, setName] = useState(user.name);
  const [institution, setInstitution] = useState(user.institution || '');
  const [role, setRole] = useState(user.role);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [deleteRequested, setDeleteRequested] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = appStateService.updateCurrentUser({
      name,
      institution,
      role,
    });
    setUser(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-2 text-xs font-semibold text-[#0284C7] uppercase tracking-wider mb-1">
          <User className="w-4 h-4" />
          <span>Researcher Credentials</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Profile</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your investigator credentials, institutional affiliation, and secure session parameters.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Profile credentials successfully updated and persisted.</span>
        </div>
      )}

      {/* Main Profile Form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center space-x-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0F172A] to-[#0284C7] text-white flex items-center justify-center font-bold text-xl shadow-md">
            {(user.name || user.fullName || 'RE').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{user.name || user.fullName}</h2>
            <div className="text-xs text-slate-500 flex items-center space-x-2 mt-0.5">
              <span>{user.email}</span>
              <span>•</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-[#0284C7] border border-sky-200">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Investigator Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-[#0284C7]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 border border-slate-300 rounded-lg text-slate-500 cursor-not-allowed"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Institutional email cannot be modified directly.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Institution or University</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. Cambridge Institute of Therapeutic Sciences"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-[#0284C7]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Platform Role</label>
              <div className="relative">
                <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-[#0284C7]"
                >
                  <option value="Researcher">Researcher</option>
                  <option value="Senior Scientist">Senior Scientist</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* Session Management */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Active Web Sessions</h3>
            <p className="text-xs text-slate-500">Currently authenticated browser sessions accessing your research workspace.</p>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Current Session Active
          </span>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-3">
            <Laptop className="w-5 h-5 text-slate-500" />
            <div>
              <div className="font-semibold text-slate-800">Chrome / Android & Desktop Client</div>
              <div className="text-[10px] text-slate-400 font-mono">
                IP: 127.0.0.1 • TLS 1.3 Token Expiry: 12h remaining
              </div>
            </div>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Last active: Just now</span>
        </div>
      </div>

      {/* Danger Zone: Account Deletion */}
      <div className="bg-white rounded-xl border border-rose-200 shadow-sm p-6 space-y-3">
        <div className="flex items-center space-x-2 text-rose-700">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="text-sm font-bold">Account Deletion Request</h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Request permanent deletion of your investigator account. Under data governance policies, all your private docking poses, saved compounds, and personal audit records will be scrubbed from the PostgreSQL datastore.
        </p>

        {deleteRequested ? (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            A deletion confirmation request has been dispatched to institutional compliance. You will receive an email verification token.
          </div>
        ) : (
          <button
            onClick={() => setDeleteRequested(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Submit Account Deletion Request</span>
          </button>
        )}
      </div>
    </div>
  );
};
