import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Database, Dna, Cpu, Smartphone } from 'lucide-react';
import { checkBackendHealth, type HealthResponse } from '../services/api';
import { isFirebaseConfigured } from '../services/firebase';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [backendHealth, setBackendHealth] = useState<HealthResponse | null>(null);
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    checkBackendHealth()
      .then((res) => {
        if (isMounted) {
          setBackendHealth(res);
          setIsBackendHealthy(true);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsBackendHealthy(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const navLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'Target Exploration', path: '/targets' },
    { name: 'Docking & Binding', path: '/docking' },
    { name: 'Therapeutic Screening', path: '/screening' },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-[#070B14]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-200">
              <Dna className="w-5 h-5 animate-pulse-slow" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-300 bg-clip-text text-transparent">
                DrugTarget<span className="text-white font-mono">Discovery</span>
              </span>
              <span className="hidden sm:block text-[10px] text-slate-400 tracking-wider uppercase font-mono">
                Therapeutic Interaction Tool
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Infrastructure Health Badges */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Backend status */}
            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border ${
                isBackendHealthy === true
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : isBackendHealthy === false
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700'
              }`}
              title={
                isBackendHealthy === true
                  ? `FastAPI ${backendHealth?.version} Online`
                  : 'Backend offline or not yet started (port 8000)'
              }
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isBackendHealthy === true
                    ? 'bg-emerald-400 animate-ping'
                    : isBackendHealthy === false
                    ? 'bg-amber-400'
                    : 'bg-slate-500'
                }`}
              />
              <Cpu className="w-3 h-3" />
              <span>{isBackendHealthy ? 'API Online' : 'API Standby'}</span>
            </div>

            {/* Firebase Status */}
            <div
              className={`hidden sm:flex items-center space-x-1 px-2 py-1 rounded-full text-[11px] font-mono border ${
                isFirebaseConfigured
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700/60'
              }`}
              title={
                isFirebaseConfigured
                  ? 'Firebase credentials configured'
                  : 'Firebase credentials pending in web/.env'
              }
            >
              <Database className="w-3 h-3" />
              <span>{isFirebaseConfigured ? 'Firebase' : 'Firebase Ready'}</span>
            </div>

            {/* Native Android Companion Link/Badge */}
            <div
              className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/30"
              title="Native Android Jetpack Compose app available in /android"
            >
              <Smartphone className="w-3 h-3" />
              <span className="hidden sm:inline">Android Native</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
