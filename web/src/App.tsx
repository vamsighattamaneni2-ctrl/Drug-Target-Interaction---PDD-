import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppLayout } from './layouts/AppLayout';

// Core Application Pages (Section 5 Navigation Drawer Architecture)
import { DashboardPage } from './pages/DashboardPage';
import { CompoundLibraryPage } from './pages/CompoundLibraryPage';
import { ProteinTargetLibraryPage } from './pages/ProteinTargetLibraryPage';
import { NewAnalysisPage } from './pages/NewAnalysisPage';
import { AnalysisHistoryPage } from './pages/AnalysisHistoryPage';
import { InteractionViewerPage } from './pages/InteractionViewerPage';
import { AdmetEvaluationPage } from './pages/AdmetEvaluationPage';
import { CompareCandidatesPage } from './pages/CompareCandidatesPage';
import { ReportsPage } from './pages/ReportsPage';
import { SavedCompoundsPage } from './pages/SavedCompoundsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { DockingPage } from './pages/DockingPage';
import { PocketDetectionPage } from './pages/PocketDetectionPage';
import { BatchScreeningPage } from './pages/BatchScreeningPage';
import { MolecularSimilarityPage } from './pages/MolecularSimilarityPage';
import { CompoundPrioritizationPage } from './pages/CompoundPrioritizationPage';
import { StructureComparisonPage } from './pages/StructureComparisonPage';
import { ResearchProjectsPage } from './pages/ResearchProjectsPage';
import { HelpDocumentationPage } from './pages/HelpDocumentationPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

// Authentication Pages
import { SignInPage } from './pages/SignInPage';
import { SignOutPage } from './pages/SignOutPage';

// Supplemental Detail & Discovery Pages
import { DrugDetailPage } from './pages/DrugDetailPage';
import { TargetDetailPage } from './pages/TargetDetailPage';
import { DiseaseExplorerPage } from './pages/DiseaseExplorerPage';
import { DiseaseDetailPage } from './pages/DiseaseDetailPage';
import { PathwayExplorerPage } from './pages/PathwayExplorerPage';
import { PathwayDetailPage } from './pages/PathwayDetailPage';
import { InteractionAnalysisPage } from './pages/InteractionAnalysisPage';
import { NetworkAnalysisPage } from './pages/NetworkAnalysisPage';
import { EvidenceExplorerPage } from './pages/EvidenceExplorerPage';
import { TherapeuticOpportunitiesPage } from './pages/TherapeuticOpportunitiesPage';
import { DrugRepurposingPage } from './pages/DrugRepurposingPage';
import { TargetPrioritizationPage } from './pages/TargetPrioritizationPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ComparisonWorkspacePage } from './pages/ComparisonWorkspacePage';
import { SavedAnalysesPage } from './pages/SavedAnalysesPage';
import { ReportsExportPage } from './pages/ReportsExportPage';
import { DataSourcesPage } from './pages/DataSourcesPage';
import { AboutPage } from './pages/AboutPage';
import { InteractionDatabasePage } from './pages/InteractionDatabasePage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Standalone Authentication Routes */}
          <Route path="/login" element={<SignInPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/register" element={<SignInPage />} />
          <Route path="/signout" element={<SignOutPage />} />
          <Route path="/logout" element={<SignOutPage />} />

          {/* Main Application with Drawer Navigation Architecture */}
          <Route path="/" element={<AppLayout />}>
            {/* 1. Dashboard (Strictly no visible navigation options until hamburger clicked) */}
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<DashboardPage />} />

            {/* 2. Drug / Compound Library */}
            <Route path="compounds" element={<CompoundLibraryPage />} />
            <Route path="compounds/:id" element={<DrugDetailPage />} />
            <Route path="drugs" element={<CompoundLibraryPage />} />
            <Route path="drugs/:id" element={<DrugDetailPage />} />

            {/* 3. Protein Target Library */}
            <Route path="targets" element={<ProteinTargetLibraryPage />} />
            <Route path="targets/:id" element={<TargetDetailPage />} />

            {/* 4. New Interaction Analysis (Wizard: Compound -> Target -> Parameters -> Submit -> Results) */}
            <Route path="analysis/new" element={<NewAnalysisPage />} />
            <Route path="analysis/create" element={<NewAnalysisPage />} />

            {/* 5. Analysis History */}
            <Route path="history" element={<AnalysisHistoryPage />} />
            <Route path="analysis/history" element={<AnalysisHistoryPage />} />

            {/* 6. Interaction Viewer (3D Molecular Viewer & Contact Matrix) */}
            <Route path="viewer" element={<InteractionViewerPage />} />
            <Route path="interaction-viewer" element={<InteractionViewerPage />} />

            {/* 7. ADMET Evaluation (Absorption, Distribution, Metabolism, Excretion, Toxicity, Lipinski) */}
            <Route path="admet" element={<AdmetEvaluationPage />} />
            <Route path="admet-evaluation" element={<AdmetEvaluationPage />} />

            {/* Molecular Docking & Binding-Pocket Detection (Feature 1) */}
            <Route path="docking" element={<DockingPage />} />
            <Route path="pockets" element={<PocketDetectionPage />} />
            <Route path="binding-pockets" element={<PocketDetectionPage />} />

            {/* Batch Virtual Screening (Feature 2) */}
            <Route path="batch-screening" element={<BatchScreeningPage />} />
            <Route path="batch" element={<BatchScreeningPage />} />

            {/* Molecular Similarity Search (Feature 3) */}
            <Route path="similarity" element={<MolecularSimilarityPage />} />
            <Route path="molecular-similarity" element={<MolecularSimilarityPage />} />

            {/* Advanced Interaction Analysis (Feature 4) */}
            <Route path="interactions" element={<InteractionAnalysisPage />} />

            {/* Compound Prioritization (Feature 5) */}
            <Route path="prioritization" element={<CompoundPrioritizationPage />} />
            <Route path="compound-prioritization" element={<CompoundPrioritizationPage />} />

            {/* Structure & Pose Comparison (Feature 6) */}
            <Route path="structure-comparison" element={<StructureComparisonPage />} />
            <Route path="pose-comparison" element={<StructureComparisonPage />} />

            {/* Research Project History & Reproducibility Sessions (Feature 7) */}
            <Route path="projects" element={<ResearchProjectsPage />} />
            <Route path="research-projects" element={<ResearchProjectsPage />} />

            {/* Database Search Shortcut */}
            <Route path="search" element={<CompoundLibraryPage />} />

            {/* 8. Compare Candidates */}
            <Route path="compare" element={<CompareCandidatesPage />} />
            <Route path="compare-candidates" element={<CompareCandidatesPage />} />
            <Route path="insights/compare" element={<CompareCandidatesPage />} />

            {/* 9. Reports (Audit-grade Scientific Dossiers, PDF & CSV Export) */}
            <Route path="reports" element={<ReportsPage />} />
            <Route path="reports/export" element={<ReportsPage />} />

            {/* 10. Saved Compounds & Target Collections */}
            <Route path="saved" element={<SavedCompoundsPage />} />
            <Route path="saved-compounds" element={<SavedCompoundsPage />} />
            <Route path="reports/saved" element={<SavedCompoundsPage />} />

            {/* Account & Administration Routes */}
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="help" element={<HelpDocumentationPage />} />
            <Route path="docs" element={<HelpDocumentationPage />} />
            <Route path="admin" element={<AdminDashboardPage />} />

            {/* Supplemental Network, Pathway, and Evidence Explorers */}
            <Route path="diseases" element={<DiseaseExplorerPage />} />
            <Route path="diseases/:id" element={<DiseaseDetailPage />} />
            <Route path="pathways" element={<PathwayExplorerPage />} />
            <Route path="pathways/:id" element={<PathwayDetailPage />} />
            <Route path="analysis/interaction" element={<InteractionAnalysisPage />} />
            <Route path="interaction-analysis" element={<InteractionAnalysisPage />} />
            <Route path="analysis/network" element={<NetworkAnalysisPage />} />
            <Route path="network" element={<NetworkAnalysisPage />} />
            <Route path="analysis/evidence" element={<EvidenceExplorerPage />} />
            <Route path="discovery/opportunities" element={<TherapeuticOpportunitiesPage />} />
            <Route path="therapeutic-discovery" element={<TherapeuticOpportunitiesPage />} />
            <Route path="discovery/repurposing" element={<DrugRepurposingPage />} />
            <Route path="drug-repurposing" element={<DrugRepurposingPage />} />
            <Route path="discovery/target-prioritization" element={<TargetPrioritizationPage />} />
            <Route path="insights/analytics" element={<AnalyticsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="reference/data-sources" element={<DataSourcesPage />} />
            <Route path="data-sources" element={<DataSourcesPage />} />
            <Route path="reference/about" element={<AboutPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="interactions" element={<InteractionDatabasePage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
