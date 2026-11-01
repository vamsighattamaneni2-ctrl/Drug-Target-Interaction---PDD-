package com.drugtarget.discovery.ui.screens

import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.drugtarget.discovery.ui.theme.*

data class CandidatePrioritizationRecord(
    val id: String,
    val name: String,
    val smiles: String,
    val targetGene: String,
    val dockingScoreKcalMol: Double,
    val molecularWeight: Double,
    val logP: Double,
    val lipinskiViolations: Int,
    val giAbsorption: String,
    val hergSafetyScore: Double,
    val interactionContactsCount: Int
)

val INITIAL_PRIORITIZATION_CANDIDATES = listOf(
    CandidatePrioritizationRecord(
        id = "DB00619",
        name = "Imatinib",
        smiles = "CC1=C(C=C(C=C1)NC(=O)C2=CC=C(CN3CCN(C)CC3)C=C2)NC4=NC=CC(=N4)C5=CN=CC=C5",
        targetGene = "BCR-ABL1",
        dockingScoreKcalMol = -10.2,
        molecularWeight = 493.6,
        logP = 3.4,
        lipinskiViolations = 0,
        giAbsorption = "High",
        hergSafetyScore = 0.85,
        interactionContactsCount = 6
    ),
    CandidatePrioritizationRecord(
        id = "DB00530",
        name = "Erlotinib",
        smiles = "COCCOC1=C(C=C2C(=C1)C(=NC=N2)NC3=CC=CC(=C3)C#C)OCCOC",
        targetGene = "EGFR",
        dockingScoreKcalMol = -9.8,
        molecularWeight = 393.44,
        logP = 2.7,
        lipinskiViolations = 0,
        giAbsorption = "High",
        hergSafetyScore = 0.88,
        interactionContactsCount = 5
    ),
    CandidatePrioritizationRecord(
        id = "DB00317",
        name = "Gefitinib",
        smiles = "COC1=C(OCC2=CC=CC=C2)C=C2C(=C1)N=CN=C2NC1=CC(Cl)=C(F)C=C1",
        targetGene = "EGFR",
        dockingScoreKcalMol = -9.4,
        molecularWeight = 446.9,
        logP = 3.2,
        lipinskiViolations = 0,
        giAbsorption = "High",
        hergSafetyScore = 0.80,
        interactionContactsCount = 5
    ),
    CandidatePrioritizationRecord(
        id = "DB09330",
        name = "Osimertinib",
        smiles = "CN(C)CC=CC(=O)NC1=C(C=C(C(=C1)NC2=NC=CC(=N2)C3=CN(C4=CC=CC=C34)C)OC)N(C)CCN(C)C",
        targetGene = "EGFR",
        dockingScoreKcalMol = -10.5,
        molecularWeight = 499.6,
        logP = 3.0,
        lipinskiViolations = 0,
        giAbsorption = "High",
        hergSafetyScore = 0.82,
        interactionContactsCount = 6
    ),
    CandidatePrioritizationRecord(
        id = "DB00675",
        name = "Tamoxifen",
        smiles = "CCC(=C(C1=CC=CC=C1)C2=CC=C(C=C2)OCCN(C)C)C3=CC=CC=C3",
        targetGene = "ESR1",
        dockingScoreKcalMol = -10.0,
        molecularWeight = 371.51,
        logP = 4.4,
        lipinskiViolations = 0,
        giAbsorption = "High",
        hergSafetyScore = 0.78,
        interactionContactsCount = 4
    ),
    CandidatePrioritizationRecord(
        id = "DB00773",
        name = "Etoposide",
        smiles = "COc1cc2c(cc1OC)[C@@H]3[C@@H]4CC5=CC=6OCOC=6C=C5[C@@H]4[C@@H](O3)CO2",
        targetGene = "TOP2A",
        dockingScoreKcalMol = -9.1,
        molecularWeight = 588.6,
        logP = 1.1,
        lipinskiViolations = 1,
        giAbsorption = "Moderate",
        hergSafetyScore = 0.75,
        interactionContactsCount = 4
    )
)

data class ScoredCandidate(
    val record: CandidatePrioritizationRecord,
    val compositeScore: Double,
    val rank: Int
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CompoundPrioritizationScreen(onBack: () -> Unit) {
    val context = LocalContext.current

    // 4 Configurable Ranking Weights (Summing to 100%)
    var weightDocking by remember { mutableFloatStateOf(35f) }
    var weightLipinski by remember { mutableFloatStateOf(25f) }
    var weightAdmet by remember { mutableFloatStateOf(25f) }
    var weightContacts by remember { mutableFloatStateOf(15f) }

    // Filters
    var maxMw by remember { mutableFloatStateOf(550f) }
    var maxLogP by remember { mutableFloatStateOf(5.0f) }
    var maxViolations by remember { mutableIntStateOf(1) }
    var selectedTarget by remember { mutableStateOf("ALL") }

    val targets = listOf("ALL", "BCR-ABL1", "EGFR", "ESR1", "TOP2A")

    // Calculate composite MPO score for each candidate
    val rankedCandidates = remember(
        weightDocking, weightLipinski, weightAdmet, weightContacts,
        maxMw, maxLogP, maxViolations, selectedTarget
    ) {
        val totalWeight = (weightDocking + weightLipinski + weightAdmet + weightContacts).coerceAtLeast(1f)

        INITIAL_PRIORITIZATION_CANDIDATES
            .filter { c ->
                (selectedTarget == "ALL" || c.targetGene == selectedTarget) &&
                c.molecularWeight <= maxMw &&
                c.logP <= maxLogP &&
                c.lipinskiViolations <= maxViolations
            }
            .map { c ->
                // Normalized sub-scores 0 to 100
                val dockingNorm = ((-c.dockingScoreKcalMol - 6.0) / 6.0 * 100).coerceIn(0.0, 100.0)
                val lipinskiNorm = if (c.lipinskiViolations == 0) 100.0 else 50.0
                val admetNorm = (c.hergSafetyScore * 100.0).coerceIn(0.0, 100.0)
                val contactsNorm = (c.interactionContactsCount / 8.0 * 100.0).coerceIn(0.0, 100.0)

                val score = (dockingNorm * (weightDocking / totalWeight)) +
                            (lipinskiNorm * (weightLipinski / totalWeight)) +
                            (admetNorm * (weightAdmet / totalWeight)) +
                            (contactsNorm * (weightContacts / totalWeight))

                Math.round(score * 10.0) / 10.0 to c
            }
            .sortedByDescending { it.first }
            .mapIndexed { index, pair ->
                ScoredCandidate(record = pair.second, compositeScore = pair.first, rank = index + 1)
            }
    }

    Scaffold(
        containerColor = WebBackground,
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(34.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(Brush.linearGradient(listOf(WebNavy, Color(0xFF7C3AED)))),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Tune, contentDescription = null, tint = Color.White, modifier = Modifier.size(18.dp))
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Text(
                                    text = "Compound Prioritization",
                                    style = MaterialTheme.typography.titleMedium.copy(
                                        fontWeight = FontWeight.Bold,
                                        color = WebTextPrimary
                                    )
                                )
                                Surface(
                                    color = Color(0xFFEDE9FE),
                                    shape = RoundedCornerShape(4.dp),
                                    border = BorderStroke(1.dp, Color(0xFFDDD6FE))
                                ) {
                                    Text(
                                        text = "MPO Engine",
                                        color = Color(0xFF6D28D9),
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                            }
                            Text(
                                text = "Multi-Parametric Optimization & Candidate Ranking",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    color = WebTextMuted,
                                    fontSize = 11.sp
                                )
                            )
                        }
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = WebTextPrimary)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = WebCard)
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // 1. Scientific Overview Banner matching Web
            item {
                Surface(
                    color = Color(0xFFF5F3FF),
                    shape = RoundedCornerShape(12.dp),
                    border = BorderStroke(1.dp, Color(0xFFDDD6FE)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.Top
                    ) {
                        Icon(
                            Icons.Default.Info,
                            contentDescription = null,
                            tint = Color(0xFF7C3AED),
                            modifier = Modifier.size(18.dp).padding(top = 2.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "Multi-Parametric Lead Optimization (MPO)",
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = Color(0xFF5B21B6)
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "Composite scoring integrates biophysical docking affinity (ΔG), Lipinski Rule-of-5 compliance, ADMET/hERG safety, and non-covalent polar contact density.",
                                fontSize = 11.sp,
                                color = Color(0xFF6D28D9),
                                lineHeight = 16.sp
                            )
                        }
                    }
                }
            }

            // 2. Weight Adjustment Controls Card
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = WebCard),
                    shape = RoundedCornerShape(14.dp),
                    border = BorderStroke(1.dp, WebBorder)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Tune, contentDescription = null, tint = WebNavy, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Scoring Weights (Sum: ${(weightDocking + weightLipinski + weightAdmet + weightContacts).toInt()}%)", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = WebTextPrimary)
                            }
                            TextButton(
                                onClick = {
                                    weightDocking = 35f
                                    weightLipinski = 25f
                                    weightAdmet = 25f
                                    weightContacts = 15f
                                },
                                contentPadding = PaddingValues(0.dp)
                            ) {
                                Text("Reset Default", fontSize = 11.sp, color = WebTeal)
                            }
                        }

                        // Sliders Grid
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            // Weight 1: Docking
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("AutoDock Vina Affinity (ΔG)", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = WebTextSecondary)
                                Text("${weightDocking.toInt()}%", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = WebNavy)
                            }
                            Slider(value = weightDocking, onValueChange = { weightDocking = it }, valueRange = 0f..100f, steps = 19)

                            // Weight 2: Lipinski
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("Lipinski Rule-of-5 Compliance", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = WebTextSecondary)
                                Text("${weightLipinski.toInt()}%", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = WebTeal)
                            }
                            Slider(value = weightLipinski, onValueChange = { weightLipinski = it }, valueRange = 0f..100f, steps = 19)

                            // Weight 3: ADMET
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("ADMET Druggability & hERG Safety", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = WebTextSecondary)
                                Text("${weightAdmet.toInt()}%", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF7C3AED))
                            }
                            Slider(value = weightAdmet, onValueChange = { weightAdmet = it }, valueRange = 0f..100f, steps = 19)

                            // Weight 4: Contacts
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("PLIP Interaction Contacts Count", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = WebTextSecondary)
                                Text("${weightContacts.toInt()}%", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFFD97706))
                            }
                            Slider(value = weightContacts, onValueChange = { weightContacts = it }, valueRange = 0f..100f, steps = 19)
                        }

                        Divider(color = WebBorder)

                        // Target Filter Chips
                        Text("Target Protein Filter", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = WebTextPrimary)
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .horizontalScroll(rememberScrollState()),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            targets.forEach { tgt ->
                                FilterChip(
                                    selected = selectedTarget == tgt,
                                    onClick = { selectedTarget = tgt },
                                    label = { Text(tgt, fontSize = 11.sp, fontWeight = FontWeight.SemiBold) },
                                    colors = FilterChipDefaults.filterChipColors(
                                        selectedContainerColor = WebNavy,
                                        selectedLabelColor = Color.White
                                    )
                                )
                            }
                        }
                    }
                }
            }

            // 3. Ranked Candidates List Header
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Ranked Drug Candidates (${rankedCandidates.size})",
                        style = MaterialTheme.typography.titleSmall.copy(
                            fontWeight = FontWeight.Bold,
                            color = WebTextPrimary
                        )
                    )
                    TextButton(
                        onClick = {
                            Toast.makeText(context, "Exported TSV summary of ${rankedCandidates.size} prioritized leads", Toast.LENGTH_SHORT).show()
                        }
                    ) {
                        Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(14.dp), tint = WebNavy)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Export TSV", fontSize = 11.sp, color = WebNavy, fontWeight = FontWeight.Bold)
                    }
                }
            }

            // 4. Candidate Cards
            items(rankedCandidates) { item ->
                PrioritizedCandidateCard(
                    item = item,
                    onSendToDocking = {
                        Toast.makeText(context, "Transferred ${item.record.name} to Molecular Docking workspace", Toast.LENGTH_SHORT).show()
                    }
                )
            }
        }
    }
}

@Composable
fun PrioritizedCandidateCard(
    item: ScoredCandidate,
    onSendToDocking: () -> Unit
) {
    val cand = item.record
    val rankColor = when (item.rank) {
        1 -> Color(0xFFD97706) // Gold
        2 -> Color(0xFF64748B) // Silver
        3 -> Color(0xFFB45309) // Bronze
        else -> WebTextSecondary
    }

    Card(
        colors = CardDefaults.cardColors(containerColor = WebCard),
        shape = RoundedCornerShape(14.dp),
        border = BorderStroke(1.dp, WebBorder),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // Header Row: Rank badge, Name, DrugBank ID, Target Gene
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(28.dp)
                            .clip(CircleShape)
                            .background(rankColor.copy(alpha = 0.15f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "#${item.rank}",
                            color = rankColor,
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 12.sp
                        )
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text(
                                text = cand.name,
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp,
                                color = WebTextPrimary
                            )
                            Surface(
                                color = WebSurfaceSubtle,
                                shape = RoundedCornerShape(4.dp)
                            ) {
                                Text(
                                    text = cand.id,
                                    fontSize = 10.sp,
                                    fontFamily = FontFamily.Monospace,
                                    color = WebTextSecondary,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }
                        Text(
                            text = "Target: ${cand.targetGene}",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            color = WebTeal
                        )
                    }
                }

                // Composite MPO Score Badge
                Surface(
                    color = Color(0xFFEFF6FF),
                    shape = RoundedCornerShape(8.dp),
                    border = BorderStroke(1.dp, Color(0xFFBFDBFE))
                ) {
                    Column(
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                        horizontalAlignment = Alignment.End
                    ) {
                        Text(
                            text = "${item.compositeScore}",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = WebNavy
                        )
                        Text(
                            text = "MPO Score",
                            fontSize = 8.sp,
                            fontWeight = FontWeight.Bold,
                            color = WebBlue
                        )
                    }
                }
            }

            // Score Progress Bar
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                LinearProgressIndicator(
                    progress = { (item.compositeScore / 100f).toFloat().coerceIn(0f, 1f) },
                    modifier = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp)),
                    color = if (item.compositeScore >= 85) Color(0xFF10B981) else if (item.compositeScore >= 75) WebNavy else Color(0xFFF59E0B),
                    trackColor = WebSurfaceSubtle
                )
            }

            // 4-Metric Grid matching Web
            Surface(
                color = WebSurfaceSubtle,
                shape = RoundedCornerShape(8.dp),
                border = BorderStroke(1.dp, WebBorder),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(10.dp).fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("Docking ΔG", fontSize = 9.sp, color = WebTextMuted, fontWeight = FontWeight.Bold)
                        Text("${cand.dockingScoreKcalMol} kcal/mol", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = WebNavy)
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("MW | LogP", fontSize = 9.sp, color = WebTextMuted, fontWeight = FontWeight.Bold)
                        Text("${cand.molecularWeight.toInt()} | ${cand.logP}", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = WebTextPrimary)
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("Lipinski", fontSize = 9.sp, color = WebTextMuted, fontWeight = FontWeight.Bold)
                        Text(if (cand.lipinskiViolations == 0) "0 Violations" else "${cand.lipinskiViolations} Violation", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = if (cand.lipinskiViolations == 0) Color(0xFF047857) else Color(0xFFB45309))
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("Contacts", fontSize = 9.sp, color = WebTextMuted, fontWeight = FontWeight.Bold)
                        Text("${cand.interactionContactsCount} Polar", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = WebTeal)
                    }
                }
            }

            Divider(color = WebBorder, thickness = 0.8.dp)

            // Actions matching Web
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "GI: ${cand.giAbsorption} • hERG: ${(cand.hergSafetyScore * 100).toInt()}% Safe",
                    fontSize = 10.sp,
                    color = WebTextSecondary,
                    fontFamily = FontFamily.Monospace
                )

                Button(
                    onClick = onSendToDocking,
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = WebNavy),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Icon(Icons.Default.Layers, contentDescription = null, modifier = Modifier.size(13.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Docking Pose", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
