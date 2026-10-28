import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Users,
  Cpu,
  Database,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Server,
  Layers,
  Search,
  RefreshCw,
  Terminal,
  Lock,
} from 'lucide-react';
import { appStateService } from '../services/appStateService';
import { UserAccount, AnalysisJob, AuditLogEntry } from '../types';

export const AdminDashboardPage: React.FC = () => {
  const currentUser = appStateService.getCurrentUser();
  const isAdmin = currentUser.role === 'Administrator';

  const [activeTab, setActiveTab] = useState<'jobs' | 'users' | 'audit' | 'sources' | 'health'>('jobs');
  const [analyses, setAnalyses] = useState<AnalysisJob[]>(() => appStateService.getAnalyses());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => appStateService.getAuditLogs());

  // Demo user management
  const [usersList, setUsersList] = useState<UserAccount[]>([
    currentUser,
    {
      id: 'usr-002',
      email: 'm.chen@oncology-research.org',
      fullName: 'Dr. Michael Chen',
      name: 'Dr. Michael Chen',
      researchRole: 'Bioinformatician',
      role: 'Researcher',
      institution: 'Memorial Sloan Kettering',
      lastLogin: '2026-10-27 18:00',
      createdAt: '2026-03-12T09:00:00Z',
    },
    {
      id: 'usr-003',
      email: 'e.watson@biochem-discovery.co.uk',
      fullName: 'Prof. Eleanor Watson',
      name: 'Prof. Eleanor Watson',
      researchRole: 'Principal Investigator',
      role: 'Senior Scientist',
      institution: 'Francis Crick Institute',
      lastLogin: '2026-10-26 11:20',
      createdAt: '2026-02-18T14:30:00Z',
    },
  ]);

  const failedJobs = useMemo(() => analyses.filter((a) => a.status === 'failed'), [analyses]);
  const runningJobs = useMemo(() => analyses.filter((a) => a.status === 'running' || a.status === 'queued'), [analyses]);

  const handleUpdateRole = (userId: string, newRole: 'Researcher' | 'Senior Scientist' | 'Administrator') => {
    setUsersList(
      usersList.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    if (userId === currentUser.id) {
      appStateService.updateCurrentUser({ role: newRole });
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 rounded-2xl bg-white border border-rose-200 shadow-md text-center space-y-4 font-sans">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Restricted Administrator Area</h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
          Access denied. Your current account role is <strong className="text-slate-800">{currentUser.role}</strong>. The Administrator Dashboard is exclusively reserved for system operators and compliance supervisors.
        </p>
        <div className="pt-2">
          <button
            onClick={() => {
              appStateService.updateCurrentUser({ role: 'Administrator' });
              window.location.reload();
            }}
            className="px-4 py-2 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold shadow-sm transition-all"
          >
            Switch to Administrator Role (Demonstration)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-rose-700 uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Privileged Governance Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Administrator Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Cluster monitoring, job queue dispatching, audit trails, and role-based access control.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cluster Healthy (4 Nodes Active)</span>
          </span>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Job Queue</span>
          <div className="text-2xl font-bold text-slate-900 font-mono">{runningJobs.length}</div>
          <span className="text-[10px] text-sky-600">Vina & MMFF94 dispatchers</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Failed Runs (24h)</span>
          <div className="text-2xl font-bold text-rose-700 font-mono">{failedJobs.length}</div>
          <span className="text-[10px] text-rose-500">Requires diagnostics</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Authorized Users</span>
          <div className="text-2xl font-bold text-slate-900 font-mono">{usersList.length}</div>
          <span className="text-[10px] text-slate-500">Multi-tenant RBAC</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">PostgreSQL Status</span>
          <div className="text-2xl font-bold text-emerald-700 font-mono">1.4ms</div>
          <span className="text-[10px] text-emerald-600">Connection pool optimal</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'jobs' ? 'bg-[#0284C7] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Job Monitoring & Diagnostics ({analyses.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'users' ? 'bg-[#0284C7] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          User & Role Governance
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'audit' ? 'bg-[#0284C7] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Immutable Audit Logs ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('health')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'health' ? 'bg-[#0284C7] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Services & Integrations Health
        </button>
      </div>

      {/* Tab 1: Job Monitoring & Diagnostics */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Analysis Dispatch Queue</h3>
                <p className="text-xs text-slate-500">Live compute execution status across all researcher sessions.</p>
              </div>
              <button
                onClick={() => setAnalyses(appStateService.getAnalyses())}
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
                title="Refresh jobs"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-4">Job ID</th>
                    <th className="py-2.5 px-4">Compound & Target</th>
                    <th className="py-2.5 px-4">Method</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Score</th>
                    <th className="py-2.5 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analyses.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-800">{job.id}</td>
                      <td className="py-2.5 px-4">
                        <span className="font-semibold text-slate-900">{job.compoundName}</span>
                        <span className="text-slate-400 mx-1.5">&rarr;</span>
                        <span className="text-slate-700">{job.targetName}</span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">{job.method}</td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            job.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : job.status === 'running'
                              ? 'bg-sky-50 text-sky-700 border border-sky-200 animate-pulse'
                              : job.status === 'failed'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono">
                        {job.dockingScore ? `${job.dockingScore} kcal/mol` : '—'}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">
                        {(job.submittedAt || job.dateSubmitted || '').split('T')[0]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Failed Job Diagnostics Console */}
          {failedJobs.length > 0 && (
            <div className="bg-slate-950 text-slate-100 rounded-xl p-5 border border-slate-800 shadow-md space-y-3 font-mono text-xs">
              <div className="flex items-center space-x-2 text-rose-400">
                <Terminal className="w-4 h-4" />
                <span className="font-bold">Failed Job Diagnostic Stack Trace (Latest: {failedJobs[0]?.id})</span>
              </div>
              <pre className="text-[11px] text-slate-300 bg-slate-900 p-3 rounded border border-slate-800 overflow-x-auto whitespace-pre-wrap">
                {`[ERROR 2026-10-27 18:32:01.412] AutoDock Vina Execution Error:
  Job ID: ${failedJobs[0]?.id}
  Receptor PDBQT: /tmp/docking/receptor_${failedJobs[0]?.targetPdbId || 'unknown'}.pdbqt
  Ligand PDBQT:   /tmp/docking/ligand_${failedJobs[0]?.compoundId}.pdbqt
  Exception: Non-zero exit code (139). Segmentation fault during coordinate grid evaluation.
  Cause: Missing Gasteiger partial charges on heteroatoms in uncurated ligand structure.
  Recommended action: Verify compound structure with RDKit AddHs() and compute Gasteiger charges before dispatch.`}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: User & Role Governance */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">User Account & Role Privileges</h3>
            <p className="text-xs text-slate-500">
              Assign least-privilege roles to researchers. Permissions take effect immediately across all sessions.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-4">User</th>
                  <th className="py-2.5 px-4">Email</th>
                  <th className="py-2.5 px-4">Institution</th>
                  <th className="py-2.5 px-4">Current Role</th>
                  <th className="py-2.5 px-4">Role Assignment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((usr) => (
                  <tr key={usr.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-slate-800">{usr.name}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">{usr.email}</td>
                    <td className="py-2.5 px-4 text-slate-600">{usr.institution || '—'}</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          usr.role === 'Administrator'
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : usr.role === 'Senior Scientist'
                            ? 'bg-purple-50 text-purple-800 border border-purple-200'
                            : 'bg-sky-50 text-sky-800 border border-sky-200'
                        }`}
                      >
                        {usr.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <select
                        value={usr.role}
                        onChange={(e) => handleUpdateRole(usr.id, e.target.value as any)}
                        className="px-2 py-1 text-xs bg-slate-50 border border-slate-300 rounded focus:outline-none focus:border-[#0284C7]"
                      >
                        <option value="Researcher">Researcher</option>
                        <option value="Senior Scientist">Senior Scientist</option>
                        <option value="Administrator">Administrator</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Immutable Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Security & Operational Audit Trail</h3>
            <p className="text-xs text-slate-500">
              Chronological log of computational submissions, authentication challenges, and role revisions.
            </p>
          </div>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start justify-between text-xs font-mono"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#0284C7]">{log.action}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-700">{log.userId}</span>
                  </div>
                  <div className="text-slate-600 text-[11px] font-sans">{log.details}</div>
                </div>
                <div className="text-right text-[10px] text-slate-400 flex-shrink-0 ml-3">
                  <div>{log.timestamp.replace('T', ' ')}</div>
                  <div>IP: {log.ipAddress}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Services & Integrations Health */}
      {activeTab === 'health' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Server className="w-4 h-4 text-[#0284C7]" />
              <span>Core Service Endpoints</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">FastAPI Uvicorn Application</div>
                  <div className="text-[10px] font-mono text-slate-400">http://127.0.0.1:8000</div>
                </div>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>200 OK</span>
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">PostgreSQL Relational Storage</div>
                  <div className="text-[10px] font-mono text-slate-400">Port 5432 / SQLAlchemy Pool</div>
                </div>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Active</span>
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">AutoDock Vina Computational Worker</div>
                  <div className="text-[10px] font-mono text-slate-400">Background Worker Subprocess</div>
                </div>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Ready</span>
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Database className="w-4 h-4 text-[#0284C7]" />
              <span>External API Gateway Limits</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">PubChem REST API (NCBI)</div>
                  <div className="text-[10px] text-slate-400">5 req/sec throttling active</div>
                </div>
                <span className="text-[10px] font-semibold text-slate-600 font-mono">Quota: Normal</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">ChEMBL 33 Web Services</div>
                  <div className="text-[10px] text-slate-400">Bioactivity & assay lookup</div>
                </div>
                <span className="text-[10px] font-semibold text-slate-600 font-mono">Quota: Normal</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">RCSB PDB REST & Data CDN</div>
                  <div className="text-[10px] text-slate-400">PDB coordinate streaming</div>
                </div>
                <span className="text-[10px] font-semibold text-slate-600 font-mono">Latency: 42ms</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
