package com.drugtarget.discovery.data.repository

import com.drugtarget.discovery.data.api.ApiClient
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import com.google.gson.Gson
import com.drugtarget.discovery.data.api.DrugTargetApiService
import com.drugtarget.discovery.data.model.AnalysisReport
import com.drugtarget.discovery.data.model.ReportAdmet
import com.drugtarget.discovery.data.model.ReportContact
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

object ReportRepository {

    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private val apiService: DrugTargetApiService by lazy { ApiClient.apiService }

    // Unified canonical benchmark reports matching backend and web application
    private val BENCHMARK_REPORTS = listOf(
        AnalysisReport(
            id = "DTI-2026-8941",
            title = "Imatinib binding to BCR-ABL1 kinase pocket",
            compoundId = "DB00619",
            compoundName = "Imatinib",
            compoundSmiles = "CC1=C(C=C(C=C1)NC(=O)C2=CC=C(CN3CCN(C)CC3)C=C2)NC4=NC=CC(=N4)C5=CN=CC=C5",
            targetId = "BCR-ABL1",
            targetGene = "BCR-ABL1",
            targetPdbId = "1IEP",
            targetName = "Tyrosine-protein kinase ABL1",
            method = "AutoDock Vina",
            dockingScore = -10.2,
            bindingAffinityPkd = 7.48,
            predictedKdNm = 33.1,
            confidence = "High",
            hydrogenBondsCount = 4,
            saltBridgesCount = 1,
            dockingRmsd = 0.85,
            summary = "Strong favorable binding energy (-10.2 kcal/mol) with canonical hydrogen bond interactions at Thr315, Glu286, and Asp381 in the inactive DFG-out conformation.",
            status = "completed",
            dateSubmitted = "2026-10-27 14:32",
            completedAt = "2026-10-27 14:38",
            submittedBy = "Dr. Vamsi Ghattamaneni",
            contacts = listOf(
                ReportContact("Hydrogen Bond", "THR-315", "2.74 Å", "Gatekeeper Anchor"),
                ReportContact("Hydrogen Bond", "GLU-286", "2.82 Å", "Catalytic Hinge"),
                ReportContact("Salt Bridge", "ASP-381", "3.12 Å", "DFG Inward Stabilizer"),
                ReportContact("Hydrophobic", "MET-318", "3.65 Å", "Lipophilic Pocket Packing")
            ),
            admet = ReportAdmet(
                giAbsorption = "High",
                caco2Permeability = 18.4,
                plasmaProteinBindingPct = 95.0,
                hergInhibitionRisk = "Low Risk",
                hepatotoxicityRisk = "Moderate Risk"
            )
        ),
        AnalysisReport(
            id = "DTI-2026-8912",
            title = "Erlotinib docking into EGFR Kinase Domain",
            compoundId = "DB00530",
            compoundName = "Erlotinib",
            compoundSmiles = "COCCOC1=C(C=C2C(=C1)C(=NC=N2)NC3=CC=CC(=C3)C#C)OCCOC",
            targetId = "EGFR",
            targetGene = "EGFR",
            targetPdbId = "1M17",
            targetName = "Epidermal Growth Factor Receptor",
            method = "AutoDock Vina",
            dockingScore = -9.8,
            bindingAffinityPkd = 7.19,
            predictedKdNm = 64.6,
            confidence = "High",
            hydrogenBondsCount = 2,
            saltBridgesCount = 0,
            dockingRmsd = 1.12,
            summary = "Occupies the ATP-binding cleft of EGFR with primary hydrogen bonding to Met793 in the hinge region and favorable hydrophobic interactions in the deep lipophilic pocket.",
            status = "completed",
            dateSubmitted = "2026-10-26 11:15",
            completedAt = "2026-10-26 11:21",
            submittedBy = "Dr. Vamsi Ghattamaneni",
            contacts = listOf(
                ReportContact("Hydrogen Bond", "MET-793", "2.88 Å", "Hinge Backbone NH"),
                ReportContact("Hydrogen Bond", "THR-854", "3.05 Å", "DFG Pocket Anchor"),
                ReportContact("Hydrophobic", "LEU-718", "3.72 Å", "P-loop Packing")
            ),
            admet = ReportAdmet(
                giAbsorption = "High",
                caco2Permeability = 24.1,
                plasmaProteinBindingPct = 93.0,
                hergInhibitionRisk = "Low Risk",
                hepatotoxicityRisk = "Low Risk"
            )
        ),
        AnalysisReport(
            id = "DTI-2026-8805",
            title = "Gefitinib cross-docking against mutant EGFR (2ITX)",
            compoundId = "DB00317",
            compoundName = "Gefitinib",
            compoundSmiles = "COC1=C(OCC2=CC=CC=C2)C=C2C(=C1)N=CN=C2NC1=CC(Cl)=C(F)C=C1",
            targetId = "EGFR",
            targetGene = "EGFR",
            targetPdbId = "2ITX",
            targetName = "Epidermal Growth Factor Receptor",
            method = "AutoDock Vina",
            dockingScore = -9.4,
            bindingAffinityPkd = 6.90,
            predictedKdNm = 125.9,
            confidence = "High",
            hydrogenBondsCount = 3,
            saltBridgesCount = 0,
            dockingRmsd = 0.94,
            summary = "Predicted tight fit into EGFR pocket with selectivity for kinase hinge configuration.",
            status = "completed",
            dateSubmitted = "2026-10-25 16:40",
            completedAt = "2026-10-25 16:44",
            submittedBy = "Dr. Vamsi Ghattamaneni",
            contacts = listOf(
                ReportContact("Hydrogen Bond", "MET-793", "2.91 Å", "Hinge Linker"),
                ReportContact("Hydrophobic", "CYS-797", "3.78 Å", "Covalent Neighbor")
            ),
            admet = ReportAdmet(
                giAbsorption = "High",
                caco2Permeability = 21.0,
                plasmaProteinBindingPct = 90.0,
                hergInhibitionRisk = "Low Risk",
                hepatotoxicityRisk = "Moderate Risk"
            )
        ),
        AnalysisReport(
            id = "DTI-2026-8742",
            title = "Osimertinib targeting mutant EGFR (1IVO)",
            compoundId = "DB09330",
            compoundName = "Osimertinib",
            compoundSmiles = "CC(=O)N(C)C1=CC(=C(C=C1)NC2=NC=CC(=N2)C3=CN(C4=CC=CC=C34)C)NC(=O)C=C",
            targetId = "EGFR",
            targetGene = "EGFR",
            targetPdbId = "1IVO",
            targetName = "Epidermal Growth Factor Receptor",
            method = "AutoDock Vina",
            dockingScore = -10.5,
            bindingAffinityPkd = 7.70,
            predictedKdNm = 20.0,
            confidence = "High",
            hydrogenBondsCount = 4,
            saltBridgesCount = 1,
            dockingRmsd = 0.78,
            summary = "Irreversible covalent and non-covalent binding profile in EGFR kinase cleft with high sub-micromolar inhibitory potency.",
            status = "completed",
            dateSubmitted = "2026-10-24 09:12",
            completedAt = "2026-10-24 09:18",
            submittedBy = "Dr. Vamsi Ghattamaneni",
            contacts = listOf(
                ReportContact("Hydrogen Bond", "MET-793", "2.71 Å", "Hinge Anchor"),
                ReportContact("Covalent Bond", "CYS-797", "1.82 Å", "Michael Addition Linker"),
                ReportContact("Hydrophobic", "LEU-718", "3.60 Å", "P-loop Hydrophobic")
            ),
            admet = ReportAdmet(
                giAbsorption = "High",
                caco2Permeability = 19.8,
                plasmaProteinBindingPct = 94.0,
                hergInhibitionRisk = "Low Risk",
                hepatotoxicityRisk = "Low-Moderate"
            )
        ),
        AnalysisReport(
            id = "DTI-2026-8740",
            title = "Tamoxifen binding to Estrogen Receptor Alpha",
            compoundId = "DB00675",
            compoundName = "Tamoxifen",
            compoundSmiles = "CCC(=C(C1=CC=CC=C1)C2=CC=C(C=C2)OCCN(C)C)C3=CC=CC=C3",
            targetId = "ESR1",
            targetGene = "ESR1",
            targetPdbId = "3ERT",
            targetName = "Estrogen Receptor Alpha",
            method = "AutoDock Vina",
            dockingScore = -10.0,
            bindingAffinityPkd = 7.34,
            predictedKdNm = 46.1,
            confidence = "High",
            hydrogenBondsCount = 1,
            saltBridgesCount = 1,
            dockingRmsd = 0.72,
            summary = "Displaces Helix 12 of ESR1, inducing the antagonist conformational state and blocking coactivator recruitment.",
            status = "completed",
            dateSubmitted = "2026-10-24 08:30",
            completedAt = "2026-10-24 08:36",
            submittedBy = "Dr. Vamsi Ghattamaneni",
            contacts = listOf(
                ReportContact("Hydrogen Bond", "GLU-353", "2.68 Å", "Pocket Anchor"),
                ReportContact("Salt Bridge", "ASP-351", "2.95 Å", "Basic Amine Salt Bridge")
            ),
            admet = ReportAdmet(
                giAbsorption = "High",
                caco2Permeability = 32.5,
                plasmaProteinBindingPct = 99.0,
                hergInhibitionRisk = "Moderate Risk",
                hepatotoxicityRisk = "Moderate Risk"
            )
        )
    )

    private val _reports = MutableStateFlow<List<AnalysisReport>>(BENCHMARK_REPORTS)
    val reports: StateFlow<List<AnalysisReport>> = _reports.asStateFlow()

    init {
        syncWithBackend()
    }

    fun syncWithBackend() {
        scope.launch {
            try {
                val db = FirebaseFirestore.getInstance()
                val currentUid = com.google.firebase.auth.FirebaseAuth.getInstance().currentUser?.uid ?: "2rUmXhKSYugcJYo4mwQwPLBOKE82"
                db.collection("users").document(currentUid).collection("predictions").addSnapshotListener { querySnapshot, err ->
                    if (err != null || querySnapshot == null || querySnapshot.isEmpty) return@addSnapshotListener
                    val currentMap = _reports.value.associateBy { it.id }.toMutableMap()
                    for (doc in querySnapshot.documents) {
                        val id = doc.getString("id") ?: doc.id
                        val title = doc.getString("title") ?: "Interaction Analysis"
                        val compoundName = doc.getString("compoundName") ?: "Compound"
                        val targetGene = doc.getString("targetGene") ?: "Target"
                        val dockingScore = doc.getDouble("dockingScore") ?: -9.5
                        val fetchedReport = AnalysisReport(
                            id = id,
                            title = title,
                            compoundId = doc.getString("compoundId") ?: "CMP",
                            compoundName = compoundName,
                            compoundSmiles = doc.getString("compoundSmiles") ?: "",
                            targetId = doc.getString("targetId") ?: targetGene,
                            targetGene = targetGene,
                            targetPdbId = doc.getString("targetPdbId") ?: "1IEP",
                            targetName = doc.getString("targetName") ?: "",
                            method = doc.getString("method") ?: "AutoDock Vina",
                            dockingScore = dockingScore,
                            bindingAffinityPkd = doc.getDouble("bindingAffinityPkd") ?: 7.2,
                            predictedKdNm = doc.getDouble("predictedKdNm") ?: 50.0,
                            confidence = doc.getString("confidence") ?: "High",
                            hydrogenBondsCount = doc.getLong("hydrogenBondsCount")?.toInt() ?: 3,
                            saltBridgesCount = doc.getLong("saltBridgesCount")?.toInt() ?: 1,
                            dockingRmsd = doc.getDouble("dockingRmsd") ?: 0.85,
                            summary = doc.getString("summary") ?: "",
                            status = doc.getString("status") ?: "completed",
                            dateSubmitted = doc.getString("dateSubmitted") ?: "2026-10-31",
                            completedAt = doc.getString("completedAt") ?: "2026-10-31",
                            submittedBy = doc.getString("submittedBy") ?: "Dr. Vamsi Ghattamaneni"
                        )
                        currentMap[id] = fetchedReport
                    }
                    _reports.value = currentMap.values.sortedByDescending { it.dateSubmitted }
                }

                db.collection("user_reports").addSnapshotListener { querySnapshot, err ->
                    if (err != null || querySnapshot == null || querySnapshot.isEmpty) return@addSnapshotListener
                    val currentMap = _reports.value.associateBy { it.id }.toMutableMap()
                    for (doc in querySnapshot.documents) {
                        val id = doc.getString("id") ?: doc.id
                        val title = doc.getString("title") ?: "Interaction Analysis"
                        val compoundId = doc.getString("compoundId") ?: "CMP"
                        val compoundName = doc.getString("compoundName") ?: "Compound"
                        val compoundSmiles = doc.getString("compoundSmiles") ?: ""
                        val targetId = doc.getString("targetId") ?: "TARGET"
                        val targetGene = doc.getString("targetGene") ?: "Target"
                        val targetPdbId = doc.getString("targetPdbId") ?: "1IEP"
                        val targetName = doc.getString("targetName") ?: ""
                        val method = doc.getString("method") ?: "AutoDock Vina"
                        val dockingScore = doc.getDouble("dockingScore") ?: -9.5
                        val bindingAffinityPkd = doc.getDouble("bindingAffinityPkd") ?: (Math.abs(dockingScore) / 1.363)
                        val predictedKdNm = doc.getDouble("predictedKdNm") ?: 50.0
                        val confidence = doc.getString("confidence") ?: "High"
                        val hydrogenBondsCount = doc.getLong("hydrogenBondsCount")?.toInt() ?: 3
                        val saltBridgesCount = doc.getLong("saltBridgesCount")?.toInt() ?: 1
                        val dockingRmsd = doc.getDouble("dockingRmsd") ?: 0.85
                        val summary = doc.getString("summary") ?: ""
                        val status = doc.getString("status") ?: "completed"
                        val dateSubmitted = doc.getString("dateSubmitted") ?: "2026-10-30"
                        val completedAt = doc.getString("completedAt") ?: dateSubmitted
                        val submittedBy = doc.getString("submittedBy") ?: "Researcher"

                        val fetchedReport = AnalysisReport(
                            id = id,
                            title = title,
                            compoundId = compoundId,
                            compoundName = compoundName,
                            compoundSmiles = compoundSmiles,
                            targetId = targetId,
                            targetGene = targetGene,
                            targetPdbId = targetPdbId,
                            targetName = targetName,
                            method = method,
                            dockingScore = dockingScore,
                            bindingAffinityPkd = bindingAffinityPkd,
                            predictedKdNm = predictedKdNm,
                            confidence = confidence,
                            hydrogenBondsCount = hydrogenBondsCount,
                            saltBridgesCount = saltBridgesCount,
                            dockingRmsd = dockingRmsd,
                            summary = summary,
                            status = status,
                            dateSubmitted = dateSubmitted,
                            completedAt = completedAt,
                            submittedBy = submittedBy,
                            contacts = listOf(
                                ReportContact("Hydrogen Bond", "Core Active Site", "2.78 Å", "Catalytic Anchor"),
                                ReportContact("Hydrophobic", "Lipophilic Pocket", "3.65 Å", "Hydrophobic Envelope")
                            ),
                            admet = ReportAdmet(
                                giAbsorption = "High",
                                caco2Permeability = 19.5,
                                plasmaProteinBindingPct = 92.0,
                                hergInhibitionRisk = "Low Risk",
                                hepatotoxicityRisk = "Low-Moderate"
                            )
                        )
                        currentMap[id] = fetchedReport
                    }
                    _reports.value = currentMap.values.sortedByDescending { it.dateSubmitted }
                }
            } catch (_: Exception) {}

            try {
                val remoteReports = apiService.getReports()
                if (remoteReports.isNotEmpty()) {
                    val currentMap = _reports.value.associateBy { it.id }.toMutableMap()
                    for (remote in remoteReports) {
                        currentMap[remote.id] = remote
                    }
                    _reports.value = currentMap.values.sortedByDescending { it.dateSubmitted }
                }
            } catch (_: Exception) {}
        }
    }

    fun addReport(report: AnalysisReport) {
        // Prepend to local state immediately
        val updated = mutableListOf<AnalysisReport>()
        updated.add(report)
        updated.addAll(_reports.value.filter { it.id != report.id })
        _reports.value = updated

        // Push to Firebase Firestore & backend API asynchronously so it appears on Web application as well
        scope.launch {
            try {
                val db = FirebaseFirestore.getInstance()
                val reportMap = mapOf(
                    "id" to report.id,
                    "title" to report.title,
                    "compoundId" to report.compoundId,
                    "compoundName" to report.compoundName,
                    "compoundSmiles" to report.compoundSmiles,
                    "targetId" to report.targetId,
                    "targetGene" to report.targetGene,
                    "targetPdbId" to report.targetPdbId,
                    "targetName" to report.targetName,
                    "method" to report.method,
                    "dockingScore" to report.dockingScore,
                    "bindingAffinityPkd" to report.bindingAffinityPkd,
                    "predictedKdNm" to report.predictedKdNm,
                    "confidence" to report.confidence,
                    "hydrogenBondsCount" to report.hydrogenBondsCount,
                    "saltBridgesCount" to report.saltBridgesCount,
                    "dockingRmsd" to report.dockingRmsd,
                    "summary" to report.summary,
                    "status" to report.status,
                    "dateSubmitted" to report.dateSubmitted,
                    "submittedBy" to report.submittedBy
                )
                val currentUid = com.google.firebase.auth.FirebaseAuth.getInstance().currentUser?.uid ?: "2rUmXhKSYugcJYo4mwQwPLBOKE82"
                db.collection("users").document(currentUid).collection("predictions").document(report.id).set(reportMap)
                db.collection("user_reports").document(report.id).set(reportMap)

                // Mirror in real-time to Firebase Realtime Database
                try {
                    val jsonStr = Gson().toJson(reportMap)
                    val reqBody = jsonStr.toRequestBody("application/json".toMediaType())
                    val rtdbUrl = "https://drug-target-interaction-ef745-default-rtdb.firebaseio.com/user_reports/${report.id}.json"
                    val req = Request.Builder().url(rtdbUrl).put(reqBody).build()
                    ApiClient.okHttpClient.newCall(req).enqueue(object : okhttp3.Callback {
                        override fun onFailure(call: okhttp3.Call, e: java.io.IOException) {}
                        override fun onResponse(call: okhttp3.Call, response: okhttp3.Response) { response.close() }
                    })
                } catch (_: Exception) {}
            } catch (_: Exception) {}

            try {
                apiService.saveReport(report)
            } catch (_: Exception) {}
        }
    }

    fun getReportById(id: String): AnalysisReport? {
        return _reports.value.find { it.id == id }
    }
}

