import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Database,
  Dna,
  ExternalLink,
  Flame,
  Layers,
  Search,
  Shield,
  Smartphone,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  checkBackendHealth,
  predictInteraction,
  type HealthResponse,
  type DTIPredictionResponse,
} from '../services/api';
import { isFirebaseConfigured } from '../services/firebase';

const SAMPLE_COMPOUNDS = [
  {
    name: 'Gefitinib (Iressa)',
    smiles: 'COC1=C(OCC2=CC=CC=C2)C=C2C(=C1)N=CN=C2NC1=CC(Cl)=C(F)C=C1',
    indication: 'Non-small cell lung cancer (EGFR)',
  },
  {
    name: 'Imatinib (Gleevec)',
    smiles: 'CC1=C(C=C(C=C1)NC(=O)C2=CC=C(CN3CCN(C)CC3)C=C2)NC4=NC=CC(=N4)C5=CN=CC=C5',
    indication: 'Chronic myelogenous leukemia (BCR-ABL)',
  },
  {
    name: 'Sorafenib (Nexavar)',
    smiles: 'CNC(=O)C1=NC=CC(OC2=CC=C(NC(=O)NC3=CC(=C(C=C3)Cl)C(F)(F)F)C=C2)=C1',
    indication: 'Renal cell & hepatocellular carcinoma (VEGFR/BRAF)',
  },
];

export const LandingPage: React.FC = () => {
  const [backendHealth, setBackendHealth] = useState<HealthResponse | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState<boolean>(true);

  // DTI Sandbox State
  const [selectedTarget, setSelectedTarget] = useState<string>('CHEMBL203');
  const [selectedSmiles, setSelectedSmiles] = useState<string>(SAMPLE_COMPOUNDS[0].smiles);
  const [compoundName, setCompoundName] = useState<string>(SAMPLE_COMPOUNDS[0].name);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [predictionResult, setPredictionResult] = useState<DTIPredictionResponse | null>(null);
  const [predictionError, setPredictionError] = useState<string | null>(null);

  useEffect(() => {
    checkBackendHealth()
      .then((res) => {
        setBackendHealth(res);
        setIsLoadingHealth(false);
      })
      .catch((err) => {
        setHealthError(err.message || 'Could not connect to FastAPI server at http://localhost:8000');
        setIsLoadingHealth(false);
      });
  }, []);

  const handleRunPrediction = async () => {
    setIsPredicting(true);
    setPredictionError(null);
    try {
      const res = await predictInteraction({
        target_id: selectedTarget,
        compound_smiles: selectedSmiles,
        algorithm: 'deep_dti_transformer',
      });
      setPredictionResult(res);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Prediction request failed';
      setPredictionError(errorMessage);
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 pb-20">
      {/* Background Glow Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-48 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>BIOINFORMATICS & PHARMACOGENOMICS PLATFORM</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Drug–Target Interaction Analysis Tool for{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              Therapeutic Discovery
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-normal">
            A full-stack computational system bridging molecular docking algorithms, binding affinity estimation (Kd/Ki), and high-throughput candidate screening across web and native Android platforms.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <Link
              to="/targets"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-medium text-sm shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02]"
            >
              <Dna className="w-4 h-4" />
              <span>Explore Therapeutic Targets</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl glass-card hover:bg-slate-800/80 text-slate-200 font-medium text-sm border border-slate-700/80 transition-all hover:border-slate-600"
            >
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>FastAPI Swagger Docs</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Infrastructure & Architecture Status Strip */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {/* Backend Status Card */}
          <div className="glass-panel rounded-2xl p-4 border border-slate-800/90 hover:border-cyan-500/30 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>FASTAPI SCIENTIFIC ENGINE</span>
              </div>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                  backendHealth
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {backendHealth ? 'LIVE' : isLoadingHealth ? 'CHECKING...' : 'STANDBY'}
              </span>
            </div>
            <div className="text-sm font-semibold text-white">
              {backendHealth ? backendHealth.service : 'Python REST API'}
            </div>
            <div className="text-xs text-slate-400 mt-1 font-mono">
              {backendHealth ? (
                <>Version: {backendHealth.version} &bull; Port: 8000</>
              ) : healthError ? (
                <span className="text-amber-400/90">{healthError}</span>
              ) : (
                'Run backend server: uvicorn app.main:app'
              )}
            </div>
          </div>

          {/* Firebase Backend Card */}
          <div className="glass-panel rounded-2xl p-4 border border-slate-800/90 hover:border-indigo-500/30 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                <Database className="w-4 h-4 text-indigo-400" />
                <span>SHARED CLOUD BACKEND</span>
              </div>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                  isFirebaseConfigured
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {isFirebaseConfigured ? 'READY' : 'TEMPLATE'}
              </span>
            </div>
            <div className="text-sm font-semibold text-white">Firebase Auth & Firestore</div>
            <div className="text-xs text-slate-400 mt-1">
              {isFirebaseConfigured
                ? 'Client SDK configured with environment variables'
                : 'Configure web/.env with your Firebase project keys'}
            </div>
          </div>

          {/* Native Android Card */}
          <div className="glass-panel rounded-2xl p-4 border border-slate-800/90 hover:border-teal-500/30 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                <Smartphone className="w-4 h-4 text-teal-400" />
                <span>NATIVE MOBILE CLIENT</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                COMPOSE
              </span>
            </div>
            <div className="text-sm font-semibold text-white">Kotlin & Jetpack Compose</div>
            <div className="text-xs text-slate-400 mt-1">
              Material 3, Coroutines, Navigation Compose, Retrofit in <code className="text-teal-300 font-mono">android/</code>
            </div>
          </div>
        </div>

        {/* Live Interactive DTI Prediction Sandbox */}
        <div className="mt-12 max-w-5xl mx-auto glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-6">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-mono text-cyan-400">
                <Zap className="w-3.5 h-3.5" />
                <span>LIVE PREDICTION TESTBENCH</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                Drug–Target Affinity & Pocket Binding Estimator
              </h2>
            </div>
            <div className="text-xs font-mono text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
              Protocol: Transformer DTI / Biopython Hook
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Controls */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  1. Select Target Protein Receptor
                </label>
                <select
                  aria-label="Target Protein Receptor"
                  value={selectedTarget}
                  onChange={(e) => setSelectedTarget(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 font-mono transition-colors"
                >
                  <option value="CHEMBL203">EGFR (erbB1) - UniProt: P00533 [Kinase]</option>
                  <option value="CHEMBL1862">ABL1 (BCR-ABL) - UniProt: P00519 [Kinase]</option>
                  <option value="CHEMBL260">KDR (VEGFR2) - UniProt: P35968 [Receptor]</option>
                  <option value="CHEMBL2842">BRAF - UniProt: P15056 [Serine/Threonine]</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    2. Select Sample Candidate Compound
                  </label>
                  <span className="text-[11px] text-cyan-400 font-mono">{compoundName}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {SAMPLE_COMPOUNDS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        setSelectedSmiles(c.smiles);
                        setCompoundName(c.name);
                      }}
                      className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-all border ${
                        selectedSmiles === c.smiles
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-200 shadow-sm'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold truncate">{c.name.split(' ')[0]}</div>
                      <div className="text-[10px] text-slate-400 truncate">{c.name.split(' ')[1] || ''}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Canonical SMILES String
                </label>
                <textarea
                  rows={3}
                  value={selectedSmiles}
                  onChange={(e) => setSelectedSmiles(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Enter chemical SMILES representation..."
                />
              </div>

              <button
                type="button"
                onClick={handleRunPrediction}
                disabled={isPredicting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
              >
                {isPredicting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Computing Interaction Metrics...</span>
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4" />
                    <span>Run Interaction Prediction</span>
                  </>
                )}
              </button>

              {predictionError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
                  {predictionError}
                </div>
              )}
            </div>

            {/* Prediction Output Results */}
            <div className="glass-card rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-mono text-slate-400">BINDING TELEMETRY</span>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Calculated Affinity
                  </span>
                </div>

                {predictionResult ? (
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                        <div className="text-[11px] text-slate-400 uppercase font-mono">pKd (-log10 Kd)</div>
                        <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">
                          {predictionResult.binding_affinity_pkd.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">High nanomolar potency</div>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                        <div className="text-[11px] text-slate-400 uppercase font-mono">Estimated Kd</div>
                        <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                          {predictionResult.predicted_kd_nm.toFixed(2)} <span className="text-xs">nM</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Sub-micromolar hit</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">Confidence Score:</span>
                        <span className="text-indigo-300 font-bold">
                          {(predictionResult.confidence_score * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-2 rounded-full"
                          style={{ width: `${predictionResult.confidence_score * 100}%` }}
                        />
                      </div>
                      <div className="text-xs text-slate-300 pt-1">
                        <span className="font-semibold text-slate-400">Mechanism:</span>{' '}
                        {predictionResult.interaction_type}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-mono text-slate-400 mb-2">KEY POCKET CONTACT RESIDUES:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {predictionResult.key_contact_residues.map((residue) => (
                          <span
                            key={residue}
                            className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300"
                          >
                            {residue}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-8 text-center py-8 space-y-3">
                    <Activity className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      Select a protein target and candidate compound SMILES, then execute the calculation to visualize predicted dissociation constants and contact residues.
                    </p>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-slate-400 font-mono pt-4 border-t border-slate-800 flex items-center justify-between">
                <span>Model: DeepDTI-Kinase-v1</span>
                <span>REST Endpoint: /api/v1/interactions/predict</span>
              </div>
            </div>
          </div>
        </div>

        {/* Planned Features Navigation Cards */}
        <div className="mt-16 max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Planned Platform Modules
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Architectural roadmap spanning target genomics, molecular physics, and cross-platform synchronization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Feature 1 */}
            <Link
              to="/targets"
              className="glass-panel p-5 rounded-xl border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900/60 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 border border-cyan-500/20 group-hover:scale-110 transition-transform">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                Target Exploration
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Browse cataloged human protein targets, mapped gene symbols, UniProt accessions, and known kinase inhibitor domains.
              </p>
              <div className="mt-4 flex items-center text-xs font-semibold text-cyan-400 space-x-1">
                <span>Explore Targets</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Feature 2 */}
            <Link
              to="/docking"
              className="glass-panel p-5 rounded-xl border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900/60 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                Docking & Pocket Analysis
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Identify ATP-binding pockets, hydrogen-bond networks, and steric clash metrics for small molecule ligands.
              </p>
              <div className="mt-4 flex items-center text-xs font-semibold text-indigo-400 space-x-1">
                <span>View Docking View</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Feature 3 */}
            <Link
              to="/screening"
              className="glass-panel p-5 rounded-xl border border-slate-800 hover:border-teal-500/40 hover:bg-slate-900/60 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center mb-4 border border-teal-500/20 group-hover:scale-110 transition-transform">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
                Therapeutic Screening
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Batch screen chemical libraries against cancer targets with automated Lipinski Rule of 5 filters and toxicity alerts.
              </p>
              <div className="mt-4 flex items-center text-xs font-semibold text-teal-400 space-x-1">
                <span>Open Screening</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Feature 4 */}
            <div className="glass-panel p-5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                Cloud Sync & Security
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Synchronized research notebooks stored in Cloud Firestore with role-based Firebase Security Rules.
              </p>
              <div className="mt-4 flex items-center text-xs font-mono text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                <span>Multi-tenant Isolation</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
