import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff,
  Building,
  Key,
  FlaskConical,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp, isLoading } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [institution, setInstitution] = useState('');
  const [role, setRole] = useState('Computational Biologist');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Forgot password flow state
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [resetToken, setResetToken] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (mode === 'forgot') {
      if (resetStep === 1) {
        if (!email) {
          setError('Please provide your registered institutional email.');
          return;
        }
        setSuccessMsg('A secure password-reset authorization token has been dispatched to your email.');
        setResetStep(2);
        setResetToken('RESET-' + Math.floor(100000 + Math.random() * 900000));
      } else {
        if (!resetToken || !newResetPassword) {
          setError('Please enter the reset token and your new password.');
          return;
        }
        setSuccessMsg('Your password has been successfully reset. You may now sign in.');
        setTimeout(() => {
          setMode('signin');
          setResetStep(1);
        }, 1800);
      }
      return;
    }

    if (!email || !password) {
      setError('Please provide your institutional email and security password.');
      return;
    }

    if (mode === 'signup') {
      if (!fullName) {
        setError('Please provide your full scientific name.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (password.length < 8) {
        setError('Password must contain at least 8 characters.');
        return;
      }
      if (!agreeTerms) {
        setError('Please review and accept the research ethics protocol and privacy guidelines.');
        return;
      }
    }

    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(fullName, email, password, role, institution || 'Research Institute');
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Subtle Ambient Background Gradient Blobs */}
      <div className="absolute top-10 left-1/4 w-[450px] h-[450px] bg-sky-100/70 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[450px] h-[450px] bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Return Link */}
      <div className="max-w-4xl w-full mx-auto mb-4 flex items-center justify-between z-10 px-2">
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-2 text-xs font-medium text-slate-600 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Return to Research Dashboard</span>
        </Link>
        <span className="text-[11px] font-mono text-slate-400">
          Therapeutic Discovery Platform v2.4
        </span>
      </div>

      {/* Main Container - Clean White Theme */}
      <div className="max-w-4xl w-full mx-auto grid grid-cols-1 md:grid-cols-12 rounded-2xl border border-slate-200/90 bg-white shadow-xl shadow-slate-200/60 overflow-hidden relative z-10">
        {/* Left Column: Real Human Scientific Lab Photography (5 cols) */}
        <div className="md:col-span-5 relative flex flex-col justify-between bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#1E3A8A] text-white p-8 overflow-hidden min-h-[360px] md:min-h-[520px]">
          {/* Authentic Scientific Lab Photography */}
          <img
            src="/images/hero_researchers_lab.jpg"
            alt="Pharmaceutical Computational Research Laboratory"
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-[#0F172A]/40 to-transparent" />

          {/* Top Brand Tag */}
          <div className="relative z-10">
            <Link to="/dashboard" className="inline-flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-blue-900/30">
                <FlaskConical className="w-5 h-5 text-cyan-100" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-white block leading-tight">
                  Drug–Target <span className="text-sky-300">Analysis</span>
                </span>
                <span className="text-[10px] font-mono text-slate-300 block">
                  Therapeutic Discovery Platform
                </span>
              </div>
            </Link>
          </div>

          {/* Bottom Branding Statement */}
          <div className="relative z-10 space-y-2 mt-auto pt-16">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-sky-200 text-[10px] font-mono">
              <Sparkles className="w-3 h-3 text-sky-300" />
              <span>Bioinformatics & Pharmacology Studio</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
              Discover Better Therapeutic Candidates
            </h2>
            <p className="text-xs text-sky-100/90 leading-relaxed font-sans">
              Secure institutional workspace supporting computational biophysics, molecular docking simulations, and pharmacological evidence.
            </p>
          </div>
        </div>

        {/* Right Column: Clean White Theme Auth Form (7 cols) */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white text-slate-800">
          {/* Header & Mode Switcher */}
          <div className="mb-6">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-700 flex items-center space-x-1.5 mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>
                {mode === 'signin'
                  ? 'Investigator Authentication'
                  : mode === 'signup'
                  ? 'New Researcher Registration'
                  : 'Credential Recovery Protocol'}
              </span>
            </span>

            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {mode === 'signin'
                ? 'Sign In to Workspace'
                : mode === 'signup'
                ? 'Create Research Account'
                : 'Reset Security Password'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {mode === 'signin'
                ? 'Access your saved docking simulations, batch virtual screenings, and reproducibility dossiers.'
                : mode === 'signup'
                ? 'Register with your research institution to run computational biophysics workflows.'
                : 'Enter your registered institutional email to receive an authorization token.'}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Clean White Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Registration: Full Name */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Scientific Name & Title
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Jane Smith, Ph.D."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Institutional Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="researcher@institute.edu"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 transition-colors font-mono"
                />
              </div>
            </div>

            {/* Password Field (Sign In & Sign Up) */}
            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Security Password</label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setError(null);
                        setSuccessMsg(null);
                      }}
                      className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Registration: Confirm Password */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Security Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 transition-colors font-mono"
                  />
                </div>
              </div>
            )}

            {/* Registration: Institution & Role */}
            {mode === 'signup' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Affiliated Institution</label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="e.g. Research Center"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Discipline</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-600"
                  >
                    <option value="Computational Biologist">Computational Biologist</option>
                    <option value="Medicinal Chemist">Medicinal Chemist</option>
                    <option value="Structural Pharmacologist">Structural Pharmacologist</option>
                    <option value="Bioinformatics Scholar">Bioinformatics Scholar</option>
                  </select>
                </div>
              </div>
            )}

            {/* Forgot Password Flow: Step 2 Token & New Password */}
            {mode === 'forgot' && resetStep === 2 && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Security Token</label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      placeholder="RESET-XXXXXX"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-blue-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">New Security Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="password"
                      value={newResetPassword}
                      onChange={(e) => setNewResetPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-blue-600"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Checkboxes: Remember Me or Terms */}
            {mode === 'signin' && (
              <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Preserve active authentication session on this terminal</span>
              </label>
            )}

            {mode === 'signup' && (
              <label className="flex items-start space-x-2 text-[11px] text-slate-600 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  I agree to abide by the scientific integrity protocol, computational ethics, and institutional data governance.
                </span>
              </label>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-60 mt-3 cursor-pointer"
            >
              {isLoading ? (
                <span>Authenticating Credentials...</span>
              ) : (
                <>
                  <span>
                    {mode === 'signin'
                      ? 'Sign In to Workspace'
                      : mode === 'signup'
                      ? 'Complete Registration'
                      : resetStep === 1
                      ? 'Send Verification Token'
                      : 'Set New Password'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Mode Switchers */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs space-y-2">
            {mode === 'signin' && (
              <p className="text-slate-500">
                New investigator?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="text-blue-600 hover:text-blue-800 font-semibold transition-colors underline-offset-2 hover:underline cursor-pointer"
                >
                  Create research account
                </button>
              </p>
            )}

            {mode === 'signup' && (
              <p className="text-slate-500">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="text-blue-600 hover:text-blue-800 font-semibold transition-colors underline-offset-2 hover:underline cursor-pointer"
                >
                  Sign in to existing account
                </button>
              </p>
            )}

            {mode === 'forgot' && (
              <p className="text-slate-500">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="text-blue-600 hover:text-blue-800 font-semibold transition-colors underline-offset-2 hover:underline cursor-pointer"
                >
                  Return to sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
