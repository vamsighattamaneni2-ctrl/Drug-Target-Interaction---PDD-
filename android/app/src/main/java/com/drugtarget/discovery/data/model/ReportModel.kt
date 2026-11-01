package com.drugtarget.discovery.data.model

import com.google.gson.annotations.SerializedName

data class ReportContact(
    @SerializedName("type") val type: String = "Hydrogen Bond",
    @SerializedName("residue") val residue: String = "Core Residue",
    @SerializedName("distance") val distance: String = "2.85 Å",
    @SerializedName("role") val role: String = "Catalytic Hinge Anchor"
)

data class ReportAdmet(
    @SerializedName("giAbsorption") val giAbsorption: String = "High",
    @SerializedName("caco2Permeability") val caco2Permeability: Double = 19.5,
    @SerializedName("plasmaProteinBindingPct") val plasmaProteinBindingPct: Double = 92.0,
    @SerializedName("hergInhibitionRisk") val hergInhibitionRisk: String = "Low Risk",
    @SerializedName("hepatotoxicityRisk") val hepatotoxicityRisk: String = "Low-Moderate"
)

data class AnalysisReport(
    @SerializedName("id") val id: String,
    @SerializedName("title") val title: String,
    @SerializedName("compoundId") val compoundId: String = "DB00619",
    @SerializedName("compoundName") val compoundName: String,
    @SerializedName("compoundSmiles") val compoundSmiles: String = "",
    @SerializedName("targetId") val targetId: String = "TARGET",
    @SerializedName("targetGene") val targetGene: String,
    @SerializedName("targetPdbId") val targetPdbId: String = "1IEP",
    @SerializedName("targetName") val targetName: String = "",
    @SerializedName("method") val method: String = "AutoDock Vina",
    @SerializedName("dockingScore") val dockingScore: Double = -10.2, // kcal/mol
    @SerializedName("bindingAffinityPkd") val bindingAffinityPkd: Double = 7.48, // pKd
    @SerializedName("predictedKdNm") val predictedKdNm: Double = 33.1, // nM
    @SerializedName("confidence") val confidence: String = "High",
    @SerializedName("hydrogenBondsCount") val hydrogenBondsCount: Int = 4,
    @SerializedName("saltBridgesCount") val saltBridgesCount: Int = 1,
    @SerializedName("dockingRmsd") val dockingRmsd: Double = 0.85,
    @SerializedName("summary") val summary: String = "",
    @SerializedName("status") val status: String = "completed",
    @SerializedName("dateSubmitted") val dateSubmitted: String,
    @SerializedName("completedAt") val completedAt: String? = null,
    @SerializedName("submittedBy") val submittedBy: String = "Dr. Vamsi Ghattamaneni",
    @SerializedName("contacts") val contacts: List<ReportContact> = emptyList(),
    @SerializedName("admet") val admet: ReportAdmet? = null
)

