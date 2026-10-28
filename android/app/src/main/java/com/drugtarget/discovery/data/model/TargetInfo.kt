package com.drugtarget.discovery.data.model

import com.google.gson.annotations.SerializedName

data class TargetInfo(
    @SerializedName("target_id") val targetId: String,
    @SerializedName("target_name") val targetName: String,
    @SerializedName("gene_symbol") val geneSymbol: String?,
    @SerializedName("organism") val organism: String,
    @SerializedName("uniprot_id") val uniprotId: String?,
    @SerializedName("target_type") val targetType: String
)

data class DTIPredictionRequest(
    @SerializedName("target_id") val targetId: String,
    @SerializedName("compound_smiles") val compoundSmiles: String,
    @SerializedName("algorithm") val algorithm: String = "deep_dti_transformer"
)

data class DTIPredictionResponse(
    @SerializedName("target_id") val targetId: String,
    @SerializedName("compound_smiles") val compoundSmiles: String,
    @SerializedName("binding_affinity_pkd") val bindingAffinityPkd: Double,
    @SerializedName("predicted_kd_nm") val predictedKdNm: Double,
    @SerializedName("confidence_score") val confidenceScore: Double,
    @SerializedName("interaction_type") val interactionType: String,
    @SerializedName("key_contact_residues") val keyContactResidues: List<String>
)

data class HealthResponse(
    @SerializedName("status") val status: String,
    @SerializedName("service") val service: String,
    @SerializedName("version") val version: String,
    @SerializedName("timestamp") val timestamp: String,
    @SerializedName("environment") val environment: String
)
