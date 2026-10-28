package com.drugtarget.discovery.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.drugtarget.discovery.ui.theme.*
import com.drugtarget.discovery.ui.viewmodel.DiscoveryUiState
import com.drugtarget.discovery.ui.viewmodel.DiscoveryViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    viewModel: DiscoveryViewModel,
    onNavigateToTargets: () -> Unit,
    onNavigateToPocket: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val scrollState = rememberScrollState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(
                                    Brush.linearGradient(
                                        listOf(BioCyan, BioIndigo)
                                    )
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Science,
                                contentDescription = "Logo",
                                tint = Color.White,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = "DrugTarget Discovery",
                                style = MaterialTheme.typography.titleMedium.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                            )
                            Text(
                                text = "Native Therapeutic Analysis Hub",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    color = BioCyan,
                                    fontSize = 10.sp
                                )
                            )
                        }
                    }
                },
                actions = {
                    IconButton(onClick = { viewModel.checkBackendHealth() }) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "Refresh",
                            tint = TextSecondary
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = BioDark
                )
            )
        },
        containerColor = BioDark
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(scrollState)
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // System Infrastructure Status Banner
            ConnectivityBanner(uiState)

            // DTI Prediction Testbench Card
            Card(
                colors = CardDefaults.cardColors(containerColor = BioSurface),
                shape = RoundedCornerShape(16.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, BioBorder),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Bolt,
                                contentDescription = null,
                                tint = BioCyan,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "DTI PREDICTION TESTBENCH",
                                style = MaterialTheme.typography.labelSmall
                            )
                        }
                        Text(
                            text = "Model: DeepDTI",
                            style = MaterialTheme.typography.labelSmall.copy(color = TextMuted)
                        )
                    }

                    Text(
                        text = "Kinase & Receptor Affinity Estimator",
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    )

                    // Target Selector
                    Text(
                        text = "1. TARGET RECEPTOR",
                        style = MaterialTheme.typography.labelSmall.copy(color = TextSecondary)
                    )

                    val targetsList = listOf(
                        "CHEMBL203" to "EGFR (erbB1)",
                        "CHEMBL1862" to "ABL1 (BCR-ABL)",
                        "CHEMBL260" to "KDR (VEGFR2)",
                        "CHEMBL2842" to "BRAF Kinase"
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        targetsList.forEach { (id, name) ->
                            val isSelected = uiState.selectedTargetId == id
                            FilterChip(
                                selected = isSelected,
                                onClick = { viewModel.selectTarget(id) },
                                label = {
                                    Text(
                                        text = name.split(" ")[0],
                                        style = MaterialTheme.typography.labelSmall.copy(
                                            color = if (isSelected) BioDark else TextSecondary
                                        )
                                    )
                                },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = BioCyan,
                                    containerColor = BioCard
                                )
                            )
                        }
                    }

                    // Candidate Compound
                    Text(
                        text = "2. CANDIDATE COMPOUND",
                        style = MaterialTheme.typography.labelSmall.copy(color = TextSecondary)
                    )

                    val sampleDrugs = listOf(
                        "Gefitinib" to "COC1=C(OCC2=CC=CC=C2)C=C2C(=C1)N=CN=C2NC1=CC(Cl)=C(F)C=C1",
                        "Imatinib" to "CC1=C(C=C(C=C1)NC(=O)C2=CC=C(CN3CCN(C)CC3)C=C2)NC4=NC=CC(=N4)C5=CN=CC=C5",
                        "Sorafenib" to "CNC(=O)C1=NC=CC(OC2=CC=C(NC(=O)NC3=CC(=C(C=C3)Cl)C(F)(F)F)C=C2)=C1"
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        sampleDrugs.forEach { (name, smiles) ->
                            val isSelected = uiState.selectedCompoundName.startsWith(name)
                            SuggestionChip(
                                onClick = { viewModel.selectCompound(name, smiles) },
                                label = {
                                    Text(
                                        text = name,
                                        style = MaterialTheme.typography.labelSmall.copy(
                                            color = if (isSelected) BioCyan else TextSecondary
                                        )
                                    )
                                },
                                border = SuggestionChipDefaults.suggestionChipBorder(
                                    enabled = true,
                                    borderColor = if (isSelected) BioCyan else BioBorder
                                )
                            )
                        }
                    }

                    // Canonical SMILES Input
                    OutlinedTextField(
                        value = uiState.compoundSmiles,
                        onValueChange = { viewModel.updateCompoundSmiles(it) },
                        label = { Text("Canonical SMILES", style = MaterialTheme.typography.labelSmall) },
                        textStyle = MaterialTheme.typography.bodyMedium.copy(
                            fontFamily = FontFamily.Monospace,
                            fontSize = 12.sp,
                            color = BioCyanGlow
                        ),
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = BioCard,
                            unfocusedContainerColor = BioCard,
                            focusedBorderColor = BioCyan,
                            unfocusedBorderColor = BioBorder
                        )
                    )

                    // Execute Prediction Button
                    Button(
                        onClick = { viewModel.runPrediction() },
                        enabled = !uiState.isPredicting,
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = BioCyan,
                            contentColor = BioDark
                        )
                    ) {
                        if (uiState.isPredicting) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(18.dp),
                                color = BioDark,
                                strokeWidth = 2.dp
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Computing Affinity...", fontWeight = FontWeight.Bold)
                        } else {
                            Icon(Icons.Default.PlayArrow, contentDescription = null)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Compute Interaction", fontWeight = FontWeight.Bold)
                        }
                    }

                    // Error Message Display
                    uiState.errorMessage?.let { error ->
                        Text(
                            text = error,
                            style = MaterialTheme.typography.bodyMedium.copy(
                                color = BioRose,
                                fontSize = 12.sp
                            )
                        )
                    }

                    // Telemetry Results
                    uiState.predictionResult?.let { result ->
                        Divider(color = BioBorder, modifier = Modifier.padding(vertical = 4.dp))
                        PredictionResultCard(result)
                    }
                }
            }

            // Quick Access Cards
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                ActionCard(
                    title = "Therapeutic Targets",
                    subtitle = "Inspect kinases & UniProt IDs",
                    icon = Icons.Default.Dna,
                    color = BioCyan,
                    modifier = Modifier.weight(1f),
                    onClick = onNavigateToTargets
                )
                ActionCard(
                    title = "Pocket Analysis",
                    subtitle = "Binding residues & scoring",
                    icon = Icons.Default.Layers,
                    color = BioIndigo,
                    modifier = Modifier.weight(1f),
                    onClick = onNavigateToPocket
                )
            }
        }
    }
}

@Composable
fun ConnectivityBanner(uiState: DiscoveryUiState) {
    Card(
        colors = CardDefaults.cardColors(containerColor = BioSurface),
        shape = RoundedCornerShape(12.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, BioBorder),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .padding(12.dp)
                .fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .clip(CircleShape)
                        .background(
                            when (uiState.isBackendOnline) {
                                true -> BioEmerald
                                false -> BioAmber
                                else -> TextMuted
                            }
                        )
                )
                Spacer(modifier = Modifier.width(8.dp))
                Column {
                    Text(
                        text = if (uiState.isBackendOnline == true) "FastAPI Scientific Engine Online" else "Backend Standby (10.0.2.2:8000)",
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color.White
                        )
                    )
                    Text(
                        text = if (uiState.isBackendOnline == true) "Service v${uiState.backendInfo?.version ?: "0.1.0"}" else "Start backend server to enable live telemetry",
                        style = MaterialTheme.typography.bodyMedium.copy(
                            fontSize = 11.sp,
                            color = TextSecondary
                        )
                    )
                }
            }

            Text(
                text = "Native Compose",
                style = MaterialTheme.typography.labelSmall.copy(color = BioCyan)
            )
        }
    }
}

@Composable
fun PredictionResultCard(result: com.drugtarget.discovery.data.model.DTIPredictionResponse) {
    Column(
        verticalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(10.dp))
            .background(BioCard)
            .padding(12.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column {
                Text(
                    text = "pKd (-log10 Kd)",
                    style = MaterialTheme.typography.labelSmall.copy(color = TextMuted)
                )
                Text(
                    text = "%.2f".format(result.bindingAffinityPkd),
                    style = MaterialTheme.typography.headlineMedium.copy(
                        color = BioCyan,
                        fontWeight = FontWeight.Bold
                    )
                )
            }
            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = "Estimated Kd",
                    style = MaterialTheme.typography.labelSmall.copy(color = TextMuted)
                )
                Text(
                    text = "%.2f nM".format(result.predictedKdNm),
                    style = MaterialTheme.typography.headlineMedium.copy(
                        color = BioEmerald,
                        fontWeight = FontWeight.Bold
                    )
                )
            }
        }

        Text(
            text = "Mechanism: ${result.interactionType}",
            style = MaterialTheme.typography.bodyMedium.copy(
                fontSize = 12.sp,
                color = TextSecondary
            )
        )

        Text(
            text = "Contact Residues: ${result.keyContactResidues.joinToString(", ")}",
            style = MaterialTheme.typography.labelSmall.copy(
                color = BioCyanGlow,
                fontSize = 11.sp
            )
        )
    }
}

@Composable
fun ActionCard(
    title: String,
    subtitle: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    color: Color,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        colors = CardDefaults.cardColors(containerColor = BioSurface),
        shape = RoundedCornerShape(12.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, BioBorder),
        modifier = modifier
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = color,
                modifier = Modifier.size(24.dp)
            )
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = Color.White
                )
            )
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodyMedium.copy(
                    fontSize = 11.sp,
                    color = TextSecondary
                )
            )
        }
    }
}
