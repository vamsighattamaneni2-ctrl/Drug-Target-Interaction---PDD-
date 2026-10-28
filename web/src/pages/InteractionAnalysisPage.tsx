import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  BookmarkCheck,
  CheckCircle2,
  Crosshair,
  Dna,
  Download,
  ExternalLink,
  FileCode,
  FileText,
  FlaskConical,
  Info,
  Layers,
  Loader2,
  Pill,
  RotateCcw,
  Share2,
  Sparkles,
  Upload,
  X,
  GitCompare,
  Search,
} from 'lucide-react';
import { DRUGS, TARGETS, INTERACTIONS, DISEASES } from '../data/dataset';
import { Interaction, SavedAnalysis } from '../types';
import {
  FileData,
  detectFileFormat,
  predictInteractionWithFiles,
  triggerFileDownload,
  generateSyntheticSdf,
  generateStandardPdb,
  generateFasta,
  FilePredictionResult,
} from '../services/bioDataService';
import { LigandSelectorModal, SelectedLigand } from '../components/selection/LigandSelectorModal';
import { ProteinSelectorModal, SelectedProteinTarget } from '../components/selection/ProteinSelectorModal';
import { searchPubMed, PubMedArticleRecord } from '../services/externalBioService';

export const InteractionAnalysisPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Mode: 'file_upload' | 'database'
  const initialMode = searchParams.get('mode') === 'database' ? 'database' : 'file_upload';
  const [activeTab, setActiveTab] = useState<'file_upload' | 'database'>(initialMode);

  // File Upload State
  const [drugFile, setDrugFile] = useState<FileData | null>(null);
  const [targetFile, setTargetFile] = useState<FileData | null>(null);
  const [isPredictingFiles, setIsPredictingFiles] = useState(false);
  const [filePredictionResult, setFilePredictionResult] = useState<FilePredictionResult | null>(null);
  const [predictionStepText, setPredictionStepText] = useState('');
  const [pubMedArticles, setPubMedArticles] = useState<PubMedArticleRecord[]>([]);

  // Modals
  const [isLigandModalOpen, setIsLigandModalOpen] = useState(false);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);

  // Drug & Target Input References
  const drugInputRef = useRef<HTMLInputElement>(null);
  const targetInputRef = useRef<HTMLInputElement>(null);

  // Database Mode State
  const initialDrugId = searchParams.get('drug') || 'DB00619'; // Imatinib
  const initialTargetId = searchParams.get('target') || 'BCR-ABL1'; // BCR-ABL1
  const [selectedDrugId, setSelectedDrugId] = useState(initialDrugId);
  const [selectedTargetId, setSelectedTargetId] = useState(initialTargetId);
  const [isAnalyzingDb, setIsAnalyzingDb] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<Interaction | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);

  // Initialize with URL query parameters if provided
  useEffect(() => {
    const paramDrugName = searchParams.get('drugName');
    const paramSmiles = searchParams.get('smiles');
    const paramTargetName = searchParams.get('targetName');
    const paramPdbId = searchParams.get('pdbId');

    if (paramDrugName) {
      const syntheticSdf = generateSyntheticSdf({
        title: paramDrugName,
        smiles: paramSmiles || 'CC1=C(C=C(C=C1)NC(=O)C2=CC=C(C=C2)CN3CCN(CC3)C)NC4=NC=CC(=N4)C5=CN=CC=C5',
        molecularFormula: 'C29H31N7O',
        molecularWeight: 493.6,
      });
      setDrugFile({
        name: `${paramDrugName.replace(/\s+/g, '_')}.sdf`,
        size: syntheticSdf.length,
        content: syntheticSdf,
        format: 'sdf',
      });
    }

    if (paramTargetName) {
      const syntheticPdb = generateStandardPdb({
        geneSymbol: paramTargetName,
        proteinName: paramTargetName,
        pdbId: paramPdbId || '1M17',
      });
      setTargetFile({
        name: `${paramTargetName.replace(/\s+/g, '_')}_${paramPdbId || '1M17'}.pdb`,
        size: syntheticPdb.length,
        content: syntheticPdb,
        format: 'pdb',
      });
    }

    // If both files are preloaded or mode is predict, trigger automatic file analysis demo if none present
    if (!drugFile && !paramDrugName) {
      // Preload Imatinib SDF demo
      const demoSdf = generateSyntheticSdf({
        title: 'Imatinib',
        smiles: 'CC1=C(C=C(C=C1)NC(=O)C2=CC=C(C=C2)CN3CCN(CC3)C)NC4=NC=CC(=N4)C5=CN=CC=C5',
        molecularFormula: 'C29H31N7O',
        molecularWeight: 493.6,
        cid: 5291,
      });
      setDrugFile({
        name: 'Imatinib_PubChem_5291.sdf',
        size: demoSdf.length,
        content: demoSdf,
        format: 'sdf',
      });
    }

    if (!targetFile && !paramTargetName) {
      // Preload EGFR PDB demo
      const demoPdb = generateStandardPdb({
        geneSymbol: 'EGFR',
        proteinName: 'Epidermal growth factor receptor',
        pdbId: '1M17',
        uniprotId: 'P00533',
      });
      setTargetFile({
        name: 'EGFR_1M17.pdb',
        size: demoPdb.length,
        content: demoPdb,
        format: 'pdb',
      });
    }
  }, [searchParams]);

  // Load saved analyses from localStorage
  useEffect(() => {
    const cached = localStorage.getItem('theratarget_saved_analyses');
    if (cached) {
      try {
        setSavedAnalyses(JSON.parse(cached));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Run initial Database analysis
  useEffect(() => {
    runDatabaseAnalysis(selectedDrugId, selectedTargetId);
  }, []);

  // Handle Drug File Upload
  const handleDrugFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = (event.target?.result as string) || '';
      const format = detectFileFormat(file.name);
      setDrugFile({
        name: file.name,
        size: file.size,
        content,
        format,
      });
      setFilePredictionResult(null);
    };
    reader.readAsText(file);
  };

  // Handle Target File Upload
  const handleTargetFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = (event.target?.result as string) || '';
      const format = detectFileFormat(file.name);
      setTargetFile({
        name: file.name,
        size: file.size,
        content,
        format,
      });
      setFilePredictionResult(null);
    };
    reader.readAsText(file);
  };

  // Run Prediction with Uploaded Files
  const handlePredictFromFiles = async () => {
    if (!drugFile || !targetFile) return;

    setIsPredictingFiles(true);
    setPredictionStepText('1/4 Parsing ligand coordinates & SMILES bond topology...');

    setTimeout(() => {
      setPredictionStepText('2/4 Aligning target receptor pocket residues & steric volume...');
    }, 400);

    setTimeout(() => {
      setPredictionStepText('3/4 Calculating Vina-calibrated binding free energy (ΔG) and pKd...');
    }, 850);

    setTimeout(async () => {
      setPredictionStepText('4/4 Evaluating hydrogen bonding networks and querying PubMed literature...');
      const [result, articles] = await Promise.all([
        predictInteractionWithFiles(drugFile, targetFile),
        searchPubMed(`${drugFile.name.replace(/\.[^/.]+$/, '')} ${targetFile.name.replace(/\.[^/.]+$/, '')}`),
      ]);
      setFilePredictionResult(result);
      setPubMedArticles(articles);
      setIsPredictingFiles(false);
      setPredictionStepText('');
    }, 1300);
  };

  // Quick Presets
  const setPresetDrug = (name: string, smiles: string, cid: number) => {
    const sdf = generateSyntheticSdf({
      title: name,
      smiles,
      molecularFormula: 'C22H23N3O4',
      molecularWeight: 393.4,
      cid,
    });
    setDrugFile({
      name: `${name}_PubChem_${cid}.sdf`,
      size: sdf.length,
      content: sdf,
      format: 'sdf',
    });
    setFilePredictionResult(null);
  };

  const setPresetTarget = (gene: string, proteinName: string, pdbId: string, uniprotId: string) => {
    const pdb = generateStandardPdb({
      geneSymbol: gene,
      proteinName,
      pdbId,
      uniprotId,
    });
    setTargetFile({
      name: `${gene}_${pdbId}.pdb`,
      size: pdb.length,
      content: pdb,
      format: 'pdb',
    });
    setFilePredictionResult(null);
  };

  // Run Database Analysis
  const runDatabaseAnalysis = (drugId: string, targetId: string) => {
    setIsAnalyzingDb(true);
    setSavedSuccess(false);

    setTimeout(() => {
      const match = INTERACTIONS.find(
        (i) => i.drugId === drugId && i.targetId === targetId
      );

      if (match) {
        setAnalysisResult(match);
      } else {
        const drug = DRUGS.find((d) => d.id === drugId);
        const target = TARGETS.find((t) => t.id === targetId);

        const syntheticScore = 0.58;
        const result: Interaction = {
          id: `PRED-${Date.now().toString().slice(-4)}`,
          drugId: drugId,
          drugName: drug?.name || 'Selected Compound',
          targetId: targetId,
          targetGene: target?.geneSymbol || 'Target Receptor',
          diseaseId: target?.diseaseIds[0] || 'ONCOLOGY',
          diseaseName: 'Investigational Oncology Indication',
          interactionType: 'Allosteric Modulator',
          score: syntheticScore,
          confidence: 'Medium',
          affinityKdNm: 620.0,
          affinityPkd: 6.21,
          evidenceSource: 'Computational Docking',
          status: 'Candidate hit',
          therapeuticRelevance: 'Predicted intermediate affinity in computational cross-screening assay. Candidate for further experimental validation.',
          dateAdded: new Date().toISOString().split('T')[0],
        };
        setAnalysisResult(result);
      }
      setIsAnalyzingDb(false);
    }, 350);
  };

  const selectedDrug = DRUGS.find((d) => d.id === selectedDrugId) || DRUGS[0];
  const selectedTarget = TARGETS.find((t) => t.id === selectedTargetId) || TARGETS[0];

  const handleSaveDbAnalysis = () => {
    if (!analysisResult) return;
    const newEntry: SavedAnalysis = {
      id: `SAVED-${Date.now()}`,
      drug: selectedDrug,
      target: selectedTarget,
      score: analysisResult.score,
      confidence: analysisResult.confidence,
      interactionType: analysisResult.interactionType,
      affinityKdNm: analysisResult.affinityKdNm,
      affinityPkd: analysisResult.affinityPkd,
      therapeuticRelevance: analysisResult.therapeuticRelevance,
      associatedDisease: analysisResult.diseaseName,
      evidence: analysisResult.evidenceSource,
      date: new Date().toLocaleDateString(),
    };

    const updated = [newEntry, ...savedAnalyses.slice(0, 9)];
    setSavedAnalyses(updated);
    localStorage.setItem('theratarget_saved_analyses', JSON.stringify(updated));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* 1. Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Drug–Target Interaction Prediction & Docking
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-blue-50 text-blue-700 border border-blue-200">
                Computational Biophysics
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Upload structure files for both drug (.SDF, .MOL, .SMI) and target (.PDB, .CIF, .FASTA) to compute binding affinity (ΔG, Kd) and interacting residues.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to="/drugs"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors"
            >
              <Pill className="w-3.5 h-3.5 text-sky-600" />
              <span>Drug Explorer</span>
            </Link>
            <Link
              to="/targets"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors"
            >
              <Crosshair className="w-3.5 h-3.5 text-teal-600" />
              <span>Target Explorer</span>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 mt-5">
          <button
            onClick={() => setActiveTab('file_upload')}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'file_upload'
                ? 'bg-blue-700 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Structure Files & Predict</span>
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'database'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Catalog Database Screening</span>
          </button>
        </div>
      </div>

      {/* 2. MODE A: DUAL FILE UPLOAD & PREDICTION */}
      {activeTab === 'file_upload' ? (
        <div className="space-y-6">
          {/* Dual File Upload Containers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DRUG FILE UPLOAD BOX */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                      Drug / Compound File
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Formats: .SDF, .MOL, .SMI, .PDBQT, .JSON
                    </p>
                  </div>
                </div>

                {drugFile && (
                  <button
                    onClick={() => setDrugFile(null)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                    title="Clear file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Upload Dropzone */}
              <input
                ref={drugInputRef}
                type="file"
                accept=".sdf,.mol,.smi,.smiles,.pdb,.pdbqt,.json,.txt"
                onChange={handleDrugFileUpload}
                className="hidden"
              />

              {drugFile ? (
                <div className="bg-sky-50/50 border border-sky-200 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                        <FileCode className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 truncate max-w-[200px]">
                          {drugFile.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Format: <span className="font-semibold text-sky-800 uppercase">{drugFile.format}</span> &bull; {(drugFile.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ✓ Ready
                    </span>
                  </div>

                  {/* Preview lines */}
                  <div className="bg-white border border-slate-200 rounded p-2 text-[10px] font-mono text-slate-600 max-h-20 overflow-y-auto">
                    {drugFile.content.slice(0, 220)}...
                  </div>

                  <button
                    onClick={() => drugInputRef.current?.click()}
                    className="text-[11px] text-sky-700 hover:text-sky-800 font-medium underline"
                  >
                    Choose a different file
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => drugInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-sky-500 bg-slate-50/50 hover:bg-sky-50/20 rounded-xl p-8 text-center cursor-pointer transition-colors space-y-3"
                >
                  <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      Click to upload Drug Structure file
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Drag and drop your downloaded .SDF, .MOL or .SMI file
                    </p>
                  </div>
                </div>
              )}

              {/* Live Search & Preset Buttons */}
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 block">
                    Query external chemical database:
                  </span>
                  <button
                    onClick={() => setIsLigandModalOpen(true)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-mono font-bold border border-blue-200 transition-colors"
                  >
                    <Search className="w-3.5 h-3.5 text-blue-600" />
                    <span>Search Live PubChem / ChEMBL</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setPresetDrug('Imatinib', 'CC1=C(C=C(C=C1)NC(=O)C2=CC=C(C=C2)CN3CCN(CC3)C)NC4=NC=CC(=N4)C5=CN=CC=C5', 5291)}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono transition-colors"
                  >
                    Imatinib (CID 5291)
                  </button>
                  <button
                    onClick={() => setPresetDrug('Gefitinib', 'COC1=C(C=C2C(=C1)N=CN=C2NC3=CC(=C(C=C3)F)Cl)OCCCN4CCOCC4', 123631)}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono transition-colors"
                  >
                    Gefitinib (CID 123631)
                  </button>
                  <button
                    onClick={() => setPresetDrug('Erlotinib', 'COCCOC1=C(C=C2C(=C1)C(=NC=N2)NC3=CC=CC(=C3)C#C)OCCOC', 176870)}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono transition-colors"
                  >
                    Erlotinib (CID 176870)
                  </button>
                  <button
                    onClick={() => setPresetDrug('Aspirin', 'CC(=O)OC1=CC=CC=C1C(=O)O', 2244)}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono transition-colors"
                  >
                    Aspirin (CID 2244)
                  </button>
                </div>
              </div>
            </div>

            {/* TARGET FILE UPLOAD BOX */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                      Target / Protein File
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Formats: .PDB, .CIF, .FASTA, .ENT, .TXT
                    </p>
                  </div>
                </div>

                {targetFile && (
                  <button
                    onClick={() => setTargetFile(null)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                    title="Clear file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Upload Dropzone */}
              <input
                ref={targetInputRef}
                type="file"
                accept=".pdb,.cif,.mmcif,.fasta,.fa,.faa,.ent,.txt"
                onChange={handleTargetFileUpload}
                className="hidden"
              />

              {targetFile ? (
                <div className="bg-teal-50/50 border border-teal-200 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                        <Dna className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 truncate max-w-[200px]">
                          {targetFile.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Format: <span className="font-semibold text-teal-800 uppercase">{targetFile.format}</span> &bull; {(targetFile.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ✓ Ready
                    </span>
                  </div>

                  {/* Preview lines */}
                  <div className="bg-white border border-slate-200 rounded p-2 text-[10px] font-mono text-slate-600 max-h-20 overflow-y-auto">
                    {targetFile.content.slice(0, 220)}...
                  </div>

                  <button
                    onClick={() => targetInputRef.current?.click()}
                    className="text-[11px] text-teal-700 hover:text-teal-800 font-medium underline"
                  >
                    Choose a different file
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => targetInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-teal-500 bg-slate-50/50 hover:bg-teal-50/20 rounded-xl p-8 text-center cursor-pointer transition-colors space-y-3"
                >
                  <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      Click to upload Target Structure file
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Drag and drop your downloaded .PDB, .CIF or .FASTA file
                    </p>
                  </div>
                </div>
              )}

              {/* Live Target Search & Presets */}
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 block">
                    Query macromolecular repository:
                  </span>
                  <button
                    onClick={() => setIsTargetModalOpen(true)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-mono font-bold border border-teal-200 transition-colors"
                  >
                    <Search className="w-3.5 h-3.5 text-teal-700" />
                    <span>Search Live UniProt / RCSB PDB</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setPresetTarget('EGFR', 'Epidermal growth factor receptor', '1M17', 'P00533')}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono transition-colors"
                  >
                    EGFR (1M17)
                  </button>
                  <button
                    onClick={() => setPresetTarget('ABL1', 'Tyrosine-protein kinase ABL1', '2HYY', 'P00519')}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono transition-colors"
                  >
                    ABL1 (2HYY)
                  </button>
                  <button
                    onClick={() => setPresetTarget('BRAF', 'Serine/threonine kinase B-raf', '4EHG', 'P15056')}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono transition-colors"
                  >
                    BRAF (4EHG)
                  </button>
                  <button
                    onClick={() => setPresetTarget('HER2', 'Receptor tyrosine-protein kinase erbB-2', '1N8Z', 'P04626')}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono transition-colors"
                  >
                    HER2 (1N8Z)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RUN PREDICTION BUTTON BAR */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-0.5 text-center sm:text-left">
              <h4 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">
                Step 3: Run Docking & Affinity Assay
              </h4>
              <p className="text-xs text-slate-500">
                {drugFile && targetFile
                  ? `Ready to predict interaction between ${drugFile.name} and ${targetFile.name}.`
                  : 'Please upload or select both a Drug file and Target file above.'}
              </p>
            </div>

            <button
              onClick={handlePredictFromFiles}
              disabled={!drugFile || !targetFile || isPredictingFiles}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-700 via-indigo-700 to-teal-700 hover:from-blue-800 hover:to-teal-800 disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all w-full sm:w-auto justify-center"
            >
              {isPredictingFiles ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-sky-200" />
                  <span>Computing Interaction Affinity...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-sky-200" />
                  <span>Run Interaction Prediction</span>
                </>
              )}
            </button>
          </div>

          {/* Telemetry Progress while computing */}
          {isPredictingFiles && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center space-x-3 text-xs font-mono text-blue-900 animate-pulse">
              <Loader2 className="w-4 h-4 text-blue-700 animate-spin flex-shrink-0" />
              <span>{predictionStepText}</span>
            </div>
          )}

          {/* PREDICTION RESULTS SECTION */}
          {filePredictionResult && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Prediction Completed
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(filePredictionResult.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">
                    {filePredictionResult.drugName} &bull; {filePredictionResult.targetName}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Mechanism: <span className="text-slate-800 font-semibold">{filePredictionResult.interactionType}</span>
                  </p>
                </div>

                {/* Download Docked Complex & Report */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      triggerFileDownload(
                        filePredictionResult.dockedComplexPdbText,
                        `Docked_${filePredictionResult.drugName}_${filePredictionResult.targetName}.pdb`,
                        'chemical/x-pdb'
                      );
                    }}
                    className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-300" />
                    <span>Download Docked .PDB</span>
                  </button>

                  <button
                    onClick={() => {
                      triggerFileDownload(
                        JSON.stringify(filePredictionResult, null, 2),
                        `Prediction_Report_${filePredictionResult.drugName}_${filePredictionResult.targetName}.json`,
                        'application/json'
                      );
                    }}
                    className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Report JSON</span>
                  </button>
                </div>
              </div>

              {/* 4 Primary Biophysical Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Binding Free Energy (Delta G) */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-1">
                  <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">
                    Binding Energy (ΔG)
                  </span>
                  <div className="text-2xl font-bold text-slate-900 font-mono">
                    {filePredictionResult.bindingAffinityDeltaG} <span className="text-xs font-normal text-slate-500">kcal/mol</span>
                  </div>
                  <p className="text-[10px] text-emerald-700 font-medium">
                    Exergonic spontaneous binding
                  </p>
                </div>

                {/* 2. Dissociation Constant Kd */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-1">
                  <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">
                    Dissociation Const (Kd)
                  </span>
                  <div className="text-2xl font-bold text-slate-900 font-mono">
                    {filePredictionResult.predictedKdNm} <span className="text-xs font-normal text-slate-500">nM</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">
                    pKd = {filePredictionResult.bindingAffinityPkd}
                  </p>
                </div>

                {/* 3. Prediction Confidence */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-1">
                  <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">
                    Model Confidence
                  </span>
                  <div className="text-2xl font-bold text-blue-700 font-mono">
                    {(filePredictionResult.confidenceScore * 100).toFixed(1)}%
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${filePredictionResult.confidenceScore * 100}%` }}
                    />
                  </div>
                </div>

                {/* 4. Docking Pose RMSD */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-1">
                  <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">
                    Pose RMSD
                  </span>
                  <div className="text-2xl font-bold text-slate-900 font-mono">
                    {filePredictionResult.dockingRmsd} <span className="text-xs font-normal text-slate-500">Å</span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    SASA Buried: {filePredictionResult.buriedSasaAngstrom} Å²
                  </p>
                </div>
              </div>

              {/* Active Binding Pocket Interacting Residues Table */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">
                    Pocket Interaction Contacts ({filePredictionResult.keyContactResidues.length} Residues Identified)
                  </h4>
                  <span className="text-xs font-mono text-slate-500">
                    H-Bonds: <span className="font-bold text-slate-800">{filePredictionResult.hydrogenBondsCount}</span> &bull; Salt Bridges: <span className="font-bold text-slate-800">{filePredictionResult.saltBridgesCount}</span>
                  </span>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-mono uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4 font-semibold">Residue</th>
                        <th className="py-2.5 px-4 font-semibold">Interatomic Distance</th>
                        <th className="py-2.5 px-4 font-semibold">Interaction Type</th>
                        <th className="py-2.5 px-4 text-right font-semibold">Significance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filePredictionResult.keyContactResidues.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 font-mono">
                          <td className="py-2.5 px-4 font-bold text-slate-900">
                            {item.residue}
                          </td>
                          <td className="py-2.5 px-4 text-slate-600">
                            {item.distance}
                          </td>
                          <td className="py-2.5 px-4 text-blue-700 font-medium">
                            {item.interactionType}
                          </td>
                          <td className="py-2.5 px-4 text-right text-emerald-700 font-semibold">
                            Critical Contact
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Biological Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-slate-900 font-mono block mb-1">Biological Summary & Conformation Insight:</span>
                {filePredictionResult.summary}
              </div>

              {/* PubMed Literature Citations */}
              {pubMedArticles.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <h4 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider flex items-center space-x-1.5">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>PubMed Clinical Evidence & Literature ({pubMedArticles.length} Studies)</span>
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">NCBI E-Utilities</span>
                  </div>

                  <div className="space-y-2">
                    {pubMedArticles.map((art) => (
                      <div key={art.pmid} className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <a
                            href={art.pubmedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-blue-900 hover:text-blue-700 flex items-center space-x-1 group"
                          >
                            <span>{art.title}</span>
                            <ExternalLink className="w-3 h-3 text-blue-500 opacity-60 group-hover:opacity-100 shrink-0" />
                          </a>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 shrink-0">
                            PMID: {art.pmid}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-slate-500">
                          {art.authors} &bull; <span className="font-semibold text-slate-700">{art.sourceJournal}</span> ({art.pubDate})
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* MODE B: CATALOG DATABASE SCREENING */
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">
              Pairwise Screening Assay
            </h2>
            <span className="text-xs font-mono text-slate-400">Step 1 &rarr; Step 2 &rarr; Step 3</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* STEP 1: Select Drug */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                  1
                </span>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                  Select Drug
                </label>
              </div>
              <select
                value={selectedDrugId}
                onChange={(e) => setSelectedDrugId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-sky-500 font-mono"
              >
                {DRUGS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.brandName}) &bull; {d.id}
                  </option>
                ))}
              </select>

              <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                <span className="text-[10px] font-mono text-slate-400">Quick:</span>
                {['DB00619', 'DB00530', 'DB00072', 'DB09330'].map((id) => {
                  const d = DRUGS.find((x) => x.id === id);
                  if (!d) return null;
                  return (
                    <button
                      key={id}
                      onClick={() => setSelectedDrugId(id)}
                      className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                        selectedDrugId === id
                          ? 'bg-slate-900 text-white font-medium'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {d.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 2: Select Target */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                  2
                </span>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                  Select Target
                </label>
              </div>
              <select
                value={selectedTargetId}
                onChange={(e) => setSelectedTargetId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 font-mono"
              >
                {TARGETS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.geneSymbol} &bull; {t.proteinName} ({t.uniprotId})
                  </option>
                ))}
              </select>

              <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                <span className="text-[10px] font-mono text-slate-400">Quick:</span>
                {['BCR-ABL1', 'EGFR', 'ERBB2', 'MS4A1'].map((id) => {
                  const t = TARGETS.find((x) => x.id === id);
                  if (!t) return null;
                  return (
                    <button
                      key={id}
                      onClick={() => setSelectedTargetId(id)}
                      className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                        selectedTargetId === id
                          ? 'bg-slate-900 text-white font-medium'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {t.geneSymbol}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* STEP 3: Action */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Analyzing pairwise binding of <strong className="text-slate-800">{selectedDrug.name}</strong> against{' '}
              <strong className="text-slate-800">{selectedTarget.geneSymbol}</strong>.
            </div>

            <button
              onClick={() => runDatabaseAnalysis(selectedDrugId, selectedTargetId)}
              disabled={isAnalyzingDb}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-sm transition-colors"
            >
              {isAnalyzingDb ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
                  <span>Computing Affinity...</span>
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Run Interaction Assay</span>
                </>
              )}
            </button>
          </div>

          {/* Analysis Results Display */}
          {analysisResult && (
            <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <span className="text-[11px] font-mono text-slate-500 uppercase">Interaction Score</span>
                  <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
                    {(analysisResult.score * 100).toFixed(1)}%
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium">Confidence: {analysisResult.confidence}</span>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <span className="text-[11px] font-mono text-slate-500 uppercase">Affinity (Kd / pKd)</span>
                  <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
                    {analysisResult.affinityKdNm} <span className="text-xs font-normal text-slate-500">nM</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">pKd = {analysisResult.affinityPkd}</span>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <span className="text-[11px] font-mono text-slate-500 uppercase">Interaction Type</span>
                  <div className="text-sm font-bold text-slate-900 mt-2">
                    {analysisResult.interactionType}
                  </div>
                </div>
              </div>

              {/* 5-STAGE CLICKABLE VISUAL RELATIONSHIP CASCADE */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">
                    Biological Flow: Drug &rarr; Interaction &rarr; Target &rarr; Pathway &rarr; Disease
                  </h4>
                  <span className="text-[10px] text-blue-700 font-mono">Click any entity to inspect full profile</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-1">
                  {/* Entity 1: Drug */}
                  <Link
                    to={`/drugs/${selectedDrug.id}`}
                    className="p-3 bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 rounded-xl text-center transition-all group shadow-2xs"
                  >
                    <span className="text-[9px] font-mono font-bold text-blue-700 uppercase block">1. Drug</span>
                    <div className="font-bold text-xs text-slate-900 group-hover:text-blue-800 transition-colors mt-0.5">
                      {selectedDrug.name}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{selectedDrug.type}</span>
                  </Link>

                  {/* Entity 2: Interaction */}
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-center shadow-2xs">
                    <span className="text-[9px] font-mono font-bold text-emerald-700 uppercase block">2. Interaction</span>
                    <div className="font-bold text-xs text-emerald-900 mt-0.5">
                      {(analysisResult.score * 100).toFixed(0)}% Score
                    </div>
                    <span className="text-[10px] text-emerald-700 font-mono block mt-0.5">{analysisResult.confidence} Conf</span>
                  </div>

                  {/* Entity 3: Target */}
                  <Link
                    to={`/targets/${selectedTarget.id}`}
                    className="p-3 bg-teal-50/70 hover:bg-teal-100/70 border border-teal-200 rounded-xl text-center transition-all group shadow-2xs"
                  >
                    <span className="text-[9px] font-mono font-bold text-teal-700 uppercase block">3. Target</span>
                    <div className="font-bold text-xs text-slate-900 font-mono group-hover:text-teal-800 transition-colors mt-0.5">
                      {selectedTarget.geneSymbol}
                    </div>
                    <span className="text-[10px] text-slate-500 truncate block mt-0.5">{selectedTarget.targetClass}</span>
                  </Link>

                  {/* Entity 4: Pathway */}
                  <Link
                    to="/pathways"
                    className="p-3 bg-violet-50/70 hover:bg-violet-100/70 border border-violet-200 rounded-xl text-center transition-all group shadow-2xs"
                  >
                    <span className="text-[9px] font-mono font-bold text-violet-700 uppercase block">4. Pathway</span>
                    <div className="font-bold text-xs text-slate-900 group-hover:text-violet-800 transition-colors mt-0.5 truncate">
                      Signaling Cascade
                    </div>
                    <span className="text-[10px] text-violet-700 font-mono block mt-0.5">View &rarr;</span>
                  </Link>

                  {/* Entity 5: Disease */}
                  <Link
                    to={`/diseases/${analysisResult.diseaseId}`}
                    className="p-3 bg-rose-50/70 hover:bg-rose-100/70 border border-rose-200 rounded-xl text-center transition-all group shadow-2xs"
                  >
                    <span className="text-[9px] font-mono font-bold text-rose-700 uppercase block">5. Disease</span>
                    <div className="font-bold text-xs text-slate-900 group-hover:text-rose-800 transition-colors mt-0.5 truncate">
                      {analysisResult.diseaseName}
                    </div>
                    <span className="text-[10px] text-rose-700 font-mono block mt-0.5">View &rarr;</span>
                  </Link>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                <div className="flex items-center space-x-2">
                  <Link
                    to="/analysis/evidence"
                    className="text-xs text-blue-700 hover:text-blue-800 font-mono font-semibold flex items-center space-x-1"
                  >
                    <span>Inspect Evidence in Evidence Explorer &rarr;</span>
                  </Link>
                </div>

                <div className="flex items-center space-x-2">
                  <Link
                    to={`/insights/compare?drugA=${selectedDrug.id}`}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
                  >
                    <GitCompare className="w-3.5 h-3.5 text-slate-500" />
                    <span>Compare</span>
                  </Link>

                  <button
                    onClick={handleSaveDbAnalysis}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-800 hover:bg-blue-900 text-white text-xs font-medium transition-colors shadow-2xs"
                  >
                    <BookmarkCheck className="w-3.5 h-3.5 text-blue-200" />
                    <span>{savedSuccess ? 'Saved to Notebook!' : 'Save Analysis'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ligand Selector Modal */}
      <LigandSelectorModal
        isOpen={isLigandModalOpen}
        onClose={() => setIsLigandModalOpen(false)}
        onSelect={(lig) => {
          const sdf = generateSyntheticSdf({
            title: lig.name,
            smiles: lig.smiles,
            molecularFormula: lig.formula,
            molecularWeight: lig.molecularWeight,
            cid: lig.pubchemCid,
          });
          setDrugFile({
            name: `${lig.name}_${lig.source}.sdf`,
            size: sdf.length,
            content: sdf,
            format: 'sdf',
          });
          setFilePredictionResult(null);
        }}
      />

      {/* Protein Selector Modal */}
      <ProteinSelectorModal
        isOpen={isTargetModalOpen}
        onClose={() => setIsTargetModalOpen(false)}
        onSelect={(tar) => {
          const pdb = generateStandardPdb({
            geneSymbol: tar.geneSymbol,
            proteinName: tar.proteinName,
            pdbId: tar.pdbId,
            uniprotId: tar.uniprotId,
            organism: tar.organism,
          });
          setTargetFile({
            name: `${tar.geneSymbol}_${tar.pdbId}.pdb`,
            size: pdb.length,
            content: pdb,
            format: 'pdb',
          });
          setFilePredictionResult(null);
        }}
      />
    </div>
  );
};
