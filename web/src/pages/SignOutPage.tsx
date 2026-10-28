import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  LogOut,
  ArrowRight,
  ShieldCheck,
  LayoutDashboard,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const SignOutPage: React.FC = () => {
  const { signOut } = useAuth();
  const [timestamp, setTimestamp] = useState<string>('');
  const [sessionHash, setSessionHash] = useState<string>('');

  useEffect(() => {
    // Automatically trigger session termination
    signOut();
    const now = new Date();
    setTimestamp(now.toUTCString());
    setSessionHash('TERM-' + Math.random().toString(36).substring(2, 10).toUpperCase());
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Background Soft Ambient Accents */}
      <div className="absolute top-1/4 left-1/3 w-[450px] h-[450px] bg-sky-100/70 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[450px] h-[450px] bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Return Link */}
      <div className="max-w-md w-full mx-auto mb-4 flex items-center justify-between z-10 px-2">
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-2 text-xs font-medium text-slate-600 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Return to Dashboard</span>
        </Link>
        <span className="text-[11px] font-mono text-slate-400">Session Guard</span>
      </div>

      {/* Main Confirmation Card - Clean White Theme */}
      <div className="max-w-md w-full mx-auto relative z-10">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 space-y-6 text-center">
          {/* Header Icon */}
          <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 flex items-center justify-center text-blue-700 shadow-md shadow-blue-900/5">
            <LogOut className="w-8 h-8" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-mono">
              <ShieldCheck className="w-3 h-3 text-blue-600" />
              <span>Session Terminated Successfully</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Researcher Signed Out
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Your active investigator session on the Therapeutic Discovery Platform has been securely closed.
            </p>
          </div>

          {/* Security Telemetry Badge */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-600 border-b border-slate-200 pb-2">
              <span>Security Event:</span>
              <span className="text-emerald-700 font-bold">TOKENS_FLUSHED</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Closed At:</span>
              <span className="text-slate-800 text-[11px] font-medium">{timestamp || 'Just now'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Audit Ref:</span>
              <span className="text-blue-700 font-bold text-[11px]">{sessionHash}</span>
            </div>
            <div className="text-[11px] text-slate-500 pt-1 leading-relaxed font-sans">
              Confidential molecular queries, docking parameters, and research history remain safely encrypted on the backend database.
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2.5 pt-2">
            <Link
              to="/signin"
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center space-x-2"
            >
              <span>Sign In to Another Session</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/dashboard"
              className="w-full py-2 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium text-xs transition-colors flex items-center justify-center space-x-2"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-400" />
              <span>Return to Public Dashboard</span>
            </Link>
          </div>

          {/* Footer Branding */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Drug–Target Discovery</span>
            <span>Platform v2.4</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignOutPage;
