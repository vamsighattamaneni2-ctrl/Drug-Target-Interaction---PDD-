import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, Link } from 'react-router-dom';
import {
  Menu,
  X,
  FlaskConical,
  Pill,
  Crosshair,
  Activity,
  Layers,
  Search,
  Dna,
  ShieldCheck,
  FileText,
  LayoutDashboard,
  Sparkles,
  GitCompare,
  FolderKanban,
  SlidersHorizontal,
  FolderGit2,
  LogIn,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const AppLayout: React.FC = () => {
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Handle keyboard Escape to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItemClass = (isActive: boolean) =>
    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
      isActive
        ? 'bg-[#1E3A8A] text-white shadow-sm shadow-blue-900/10 font-semibold'
        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col antialiased font-sans">
      {/* 1. Header: Strictly minimal with Hamburger Button & Project Title only */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Hamburger Button & Application Title */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              id="hamburger-menu-btn"
              onClick={() => setDrawerOpen(!drawerOpen)}
              aria-label="Toggle navigation drawer"
              className="p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] cursor-pointer"
            >
              {drawerOpen ? <X className="w-5 h-5 text-slate-900" /> : <Menu className="w-5 h-5 text-slate-800" />}
            </button>

            {/* Application Logo & Title */}
            <Link to="/dashboard" className="flex items-center space-x-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1E3A8A] to-[#0D9488] flex items-center justify-center text-white shadow-sm shadow-blue-900/20">
                <FlaskConical className="w-4 h-4 text-cyan-200" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm sm:text-base text-slate-900 tracking-tight leading-none group-hover:text-blue-900 transition-colors">
                  Drug–Target Interaction Analysis
                </span>
                <span className="text-[10px] font-mono text-slate-500 hidden sm:block mt-0.5">
                  Therapeutic Discovery Platform
                </span>
              </div>
            </Link>
          </div>

          {/* Right: Clean Scientific Platform Status & Auth Action */}
          <div className="flex items-center space-x-3">
            <span className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Bioinformatics Online</span>
            </span>

            {user ? (
              <Link
                to="/signout"
                id="header-signout-btn"
                title="Sign out of current research session"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-slate-700 text-xs font-medium transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-500" />
                <span>Sign Out</span>
              </Link>
            ) : (
              <Link
                to="/signin"
                id="header-signin-btn"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 2. Slide-out Navigation Drawer: Restricted Strictly to Essential Research Items */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />

          {/* Navigation Drawer Container */}
          <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200 border-r border-slate-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#1E3A8A] flex items-center justify-center text-white">
                  <FlaskConical className="w-3.5 h-3.5 text-cyan-200" />
                </div>
                <span className="font-bold text-xs text-slate-900 uppercase font-mono tracking-wider">
                  Research Navigation
                </span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Scrollable Navigation Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Core Discovery Workflow */}
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-3 block mb-2">
                  Discovery Workflow
                </span>
                <nav className="space-y-1">
                  <NavLink to="/dashboard" className={({ isActive }) => navItemClass(isActive)}>
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </NavLink>

                  <NavLink to="/analysis/new" className={({ isActive }) => navItemClass(isActive)}>
                    <Sparkles className="w-4 h-4 text-cyan-500" />
                    <span>Start New Analysis</span>
                  </NavLink>

                  <NavLink to="/search" className={({ isActive }) => navItemClass(isActive)}>
                    <Search className="w-4 h-4" />
                    <span>Database Search</span>
                  </NavLink>

                  <NavLink to="/targets" className={({ isActive }) => navItemClass(isActive)}>
                    <Crosshair className="w-4 h-4" />
                    <span>Protein Targets</span>
                  </NavLink>

                  <NavLink to="/compounds" className={({ isActive }) => navItemClass(isActive)}>
                    <Pill className="w-4 h-4" />
                    <span>Compound Library</span>
                  </NavLink>
                </nav>
              </div>

              {/* Advanced Computational Physics & Structural Tools */}
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-3 block mb-2">
                  Molecular & Structure Tools
                </span>
                <nav className="space-y-1">
                  <NavLink to="/pockets" className={({ isActive }) => navItemClass(isActive)}>
                    <Dna className="w-4 h-4 text-amber-500" />
                    <span>Binding-Pocket Detection</span>
                  </NavLink>

                  <NavLink to="/docking" className={({ isActive }) => navItemClass(isActive)}>
                    <Layers className="w-4 h-4 text-blue-500" />
                    <span>Molecular Docking</span>
                  </NavLink>

                  <NavLink to="/batch-screening" className={({ isActive }) => navItemClass(isActive)}>
                    <FolderKanban className="w-4 h-4 text-indigo-500" />
                    <span>Batch Virtual Screening</span>
                  </NavLink>

                  <NavLink to="/similarity" className={({ isActive }) => navItemClass(isActive)}>
                    <Search className="w-4 h-4 text-teal-500" />
                    <span>Molecular Similarity</span>
                  </NavLink>

                  <NavLink to="/interactions" className={({ isActive }) => navItemClass(isActive)}>
                    <Activity className="w-4 h-4 text-rose-500" />
                    <span>Interaction Analysis</span>
                  </NavLink>

                  <NavLink to="/prioritization" className={({ isActive }) => navItemClass(isActive)}>
                    <SlidersHorizontal className="w-4 h-4 text-violet-500" />
                    <span>Compound Prioritization</span>
                  </NavLink>

                  <NavLink to="/structure-comparison" className={({ isActive }) => navItemClass(isActive)}>
                    <GitCompare className="w-4 h-4 text-emerald-500" />
                    <span>Structure & Pose Comparison</span>
                  </NavLink>

                  <NavLink to="/admet" className={({ isActive }) => navItemClass(isActive)}>
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <span>ADMET Evaluation</span>
                  </NavLink>
                </nav>
              </div>

              {/* Projects & Documentation */}
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-3 block mb-2">
                  Reproducibility & Records
                </span>
                <nav className="space-y-1">
                  <NavLink to="/projects" className={({ isActive }) => navItemClass(isActive)}>
                    <FolderGit2 className="w-4 h-4 text-blue-600" />
                    <span>Research Projects</span>
                  </NavLink>

                  <NavLink to="/reports" className={({ isActive }) => navItemClass(isActive)}>
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span>Reports & Data Export</span>
                  </NavLink>
                </nav>
              </div>
            </div>

            {/* Drawer Footer with Session Controls */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/80 space-y-3">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="truncate">
                      <div className="font-bold text-slate-900 truncate">{user.displayName || user.email}</div>
                      <div className="text-[10px] font-mono text-slate-500 truncate">{user.role || 'Investigator'}</div>
                    </div>
                  </div>
                  <Link
                    to="/signout"
                    onClick={() => setDrawerOpen(false)}
                    className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-slate-700 text-xs font-medium transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </Link>
                </div>
              ) : (
                <Link
                  to="/signin"
                  onClick={() => setDrawerOpen(false)}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In to Account</span>
                </Link>
              )}
              <div className="text-[10px] text-slate-400 font-mono text-center pt-1 border-t border-slate-200/60">
                Therapeutic Discovery Platform v2.4
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Application Content Area */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
