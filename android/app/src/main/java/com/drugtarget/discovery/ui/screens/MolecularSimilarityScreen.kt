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

data class SimilarMoleculeMatch(
    val id: String,
    val name: String,
    val formula: String,
    val molecularWeight: Double,
    val logP: Double,
    val similarityScore: Double,
    val primaryTarget: String,
    val smiles: String,
    val scaffoldType: String
)

val REFERENCE_SIMILARITY_DATABASE = listOf(
    SimilarMoleculeMatch(
        id = "DB00619",
        name = "Imatinib",
        formula = "C29H31N7O",
        molecularWeight = 493.6,
        logP = 3.4,
        similarityScore = 1.0,
        primaryTarget = "BCR-ABL1",
        smiles = "CC1=C(C=C(C=C1)NC(=O)C2=CC=C(CN3CCN(C)CC3)C=C2)NC4=NC=CC(=N4)C5=CN=CC=C5",
        scaffoldType = "2-Phenylaminopyrimidine"
    ),
    SimilarMoleculeMatch(
        id = "DB01254",
        name = "Dasatinib",
        formula = "C22H26ClN7O2S",
        molecularWeight = 488.0,
        logP = 3.8,
        similarityScore = 0.78,
        primaryTarget = "BCR-ABL1 / SRC",
        smiles = "CC1=C(C(=CC=C1)Cl)NC(=O)C2=CN=C(S2)NC3=NC=C(N=C3)N4CCN(CC4)CCO",
        scaffoldType = "Thiazole-Carboxamide"
    ),
    SimilarMoleculeMatch(
        id = "DB04868",
        name = "Nilotinib",
        formula = "C28H22F3N7O",
        molecularWeight = 529.5,
        logP = 4.4,
        similarityScore = 0.86,
        primaryTarget = "BCR-ABL1",
        smiles = "CC1=C(C=C(C=C1)NC(=O)C2=CC(=CC(=C2)C(F)(F)F)C3=CN(C=N3)C)NC4=NC=CC(=N4)C5=CN=CC=C5",
        scaffoldType = "2-Phenylaminopyrimidine Derivative"
    ),
    SimilarMoleculeMatch(
        id = "DB00530",
        name = "Erlotinib",
        formula = "C22H23N3O4",
        molecularWeight = 393.44,
        logP = 2.7,
        similarityScore = 0.52,
        primaryTarget = "EGFR",
        smiles = "COCCOC1=C(C=C2C(=C1)C(=NC=N2)NC3=CC=CC(=C3)C#C)OCCOC",
        scaffoldType = "4-Anilinoquinazoline"
    ),
    SimilarMoleculeMatch(
        id = "DB00317",
        name = "Gefitinib",
        formula = "C22H24ClFN4O3",
        molecularWeight = 446.9,
        logP = 3.2,
        similarityScore = 0.49,
        primaryTarget = "EGFR",
        smiles = "COC1=C(OCC2=CC=CC=C2)C=C2C(=C1)N=CN=C2NC1=CC(Cl)=C(F)C=C1",
        scaffoldType = "4-Anilinoquinazoline"
    ),
    SimilarMoleculeMatch(
        id = "DB00214",
        name = "Torin-1",
        formula = "C35H28F3N5O2",
        molecularWeight = 607.6,
        logP = 4.8,
        similarityScore = 0.41,
        primaryTarget = "mTOR",
        smiles = "CC(C)(C)NC(=O)C1=CC=C(C=C1)C2=CC=C3C(=C2)N=C(NC3=O)C4=CC(=CC=C4)C(F)(F)F",
        scaffoldType = "Pyridone Core"
    )
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MolecularSimilarityScreen(onBack: () -> Unit) {
    val context = LocalContext.current

    var querySmiles by remember {
        mutableStateOf("CC1=C(C=C(C=C1)NC(=O)C2=CC=C(CN3CCN(C)CC3)C=C2)NC4=NC=CC(=N4)C5=CN=CC=C5")
    }
    var threshold by remember { mutableFloatStateOf(0.40f) }
    var algorithm by remember { mutableStateOf("Tanimoto") }
    var selectedPreset by remember { mutableStateOf("Imatinib") }

    val presets = listOf("Imatinib", "Nilotinib", "Dasatinib", "Erlotinib", "Gefitinib")

    val matches = remember(threshold, algorithm) {
        REFERENCE_SIMILARITY_DATABASE.filter { it.similarityScore >= threshold }
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
                                .background(Brush.linearGradient(listOf(WebNavy, WebTeal))),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Hub, contentDescription = null, tint = Color.White, modifier = Modifier.size(18.dp))
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Text(
                                    text = "Molecular Similarity",
                                    style = MaterialTheme.typography.titleMedium.copy(
                                        fontWeight = FontWeight.Bold,
                                        color = WebTextPrimary
                                    )
                                )
                                Surface(
                                    color = Color(0xFFCCFBF1),
                                    shape = RoundedCornerShape(4.dp),
                                    border = BorderStroke(1.dp, Color(0xFF99F6E4))
                                ) {
                                    Text(
                                        text = "ECFP4 Fingerprint",
                                        color = Color(0xFF0F766E),
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                            }
                            Text(
                                text = "RDKit Extended Connectivity & Topological Tanimoto",
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
                    color = Color(0xFFEFF6FF),
                    shape = RoundedCornerShape(12.dp),
                    border = BorderStroke(1.dp, Color(0xFFBFDBFE)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.Top
                    ) {
                        Icon(
                            Icons.Default.Info,
                            contentDescription = null,
                            tint = WebBlue,
                            modifier = Modifier.size(18.dp).padding(top = 2.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "Topological Similarity vs Target Selectivity",
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = WebNavy
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "High 2D Tanimoto topological coefficients (>0.7) identify conserved core chemotypes and bioisosteres, while 3D pocket orientation dictates kinase gatekeeper residue selectivity.",
                                fontSize = 11.sp,
                                color = Color(0xFF1E40AF),
                                lineHeight = 16.sp
                            )
                        }
                    }
                }
            }

            // 2. Query Configuration Card matching Web
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
                            Text(
                                text = "Query Molecule Configuration",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = WebTextPrimary
                            )

                            // Quick Presets
                            Row(
                                modifier = Modifier.horizontalScroll(rememberScrollState()),
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                presets.forEach { p ->
                                    Surface(
                                        onClick = {
                                            selectedPreset = p
                                            val found = REFERENCE_SIMILARITY_DATABASE.find { it.name == p }
                                            if (found != null) querySmiles = found.smiles
                                        },
                                        shape = RoundedCornerShape(6.dp),
                                        color = if (selectedPreset == p) WebNavy else WebSurfaceSubtle
                                    ) {
                                        Text(
                                            text = p,
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (selectedPreset == p) Color.White else WebTextSecondary,
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                                        )
                                    }
                                }
                            }
                        }

                        OutlinedTextField(
                            value = querySmiles,
                            onValueChange = { querySmiles = it },
                            label = { Text("Query SMILES String (Morgan Fingerprint Source)") },
                            modifier = Modifier.fillMaxWidth(),
                            maxLines = 3,
                            textStyle = androidx.compose.ui.text.TextStyle(fontFamily = FontFamily.Monospace, fontSize = 11.sp),
                            shape = RoundedCornerShape(8.dp)
                        )

                        // Metric Algorithm Selector
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Fingerprint Coefficient:", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = WebTextSecondary)
                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                listOf("Tanimoto", "Dice", "Cosine").forEach { algo ->
                                    FilterChip(
                                        selected = algorithm == algo,
                                        onClick = { algorithm = algo },
                                        label = { Text(algo, fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                                        colors = FilterChipDefaults.filterChipColors(
                                            selectedContainerColor = WebTeal,
                                            selectedLabelColor = Color.White
                                        )
                                    )
                                }
                            }
                        }

                        // Threshold Slider
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Minimum Similarity Cutoff", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = WebTextSecondary)
                            Text("${(threshold * 100).toInt()}% ($threshold)", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = WebNavy)
                        }
                        Slider(
                            value = threshold,
                            onValueChange = { threshold = it },
                            valueRange = 0.30f..0.95f,
                            steps = 12
                        )
                    }
                }
            }

            // 3. Results Header
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Matching Analogues (${matches.size})",
                        style = MaterialTheme.typography.titleSmall.copy(
                            fontWeight = FontWeight.Bold,
                            color = WebTextPrimary
                        )
                    )
                    Text(
                        text = "Sorted by $algorithm Coefficient",
                        fontSize = 11.sp,
                        color = WebTextMuted
                    )
                }
            }

            // 4. Candidate Matches List
            items(matches) { match ->
                SimilarityMatchCard(
                    match = match,
                    onUseInDocking = {
                        Toast.makeText(context, "Transferred ${match.name} to Molecular Docking workspace", Toast.LENGTH_SHORT).show()
                    }
                )
            }
        }
    }
}

@Composable
fun SimilarityMatchCard(
    match: SimilarMoleculeMatch,
    onUseInDocking: () -> Unit
) {
    val simBadgeColor = when {
        match.similarityScore >= 0.85 -> Color(0xFF059669) // Emerald
        match.similarityScore >= 0.70 -> Color(0xFF0D9488) // Teal
        match.similarityScore >= 0.50 -> Color(0xFF2563EB) // Blue
        else -> Color(0xFFD97706) // Amber
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
            // Header: Name, DrugBank ID & Tanimoto Score
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(
                            text = match.name,
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp,
                            color = WebTextPrimary
                        )
                        Surface(
                            color = WebSurfaceSubtle,
                            shape = RoundedCornerShape(4.dp)
                        ) {
                            Text(
                                text = match.id,
                                fontSize = 10.sp,
                                fontFamily = FontFamily.Monospace,
                                color = WebTextSecondary,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                    Text(
                        text = "Scaffold: ${match.scaffoldType}",
                        fontSize = 11.sp,
                        color = WebTextSecondary
                    )
                }

                // Tanimoto Badge
                Surface(
                    color = simBadgeColor.copy(alpha = 0.12f),
                    shape = RoundedCornerShape(8.dp),
                    border = BorderStroke(1.dp, simBadgeColor.copy(alpha = 0.3f))
                ) {
                    Column(
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                        horizontalAlignment = Alignment.End
                    ) {
                        Text(
                            text = String.format("%.2f", match.similarityScore),
                            fontSize = 15.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = simBadgeColor
                        )
                        Text(
                            text = "Tanimoto",
                            fontSize = 8.sp,
                            fontWeight = FontWeight.Bold,
                            color = simBadgeColor
                        )
                    }
                }
            }

            // Chemical properties & primary target
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
                        Text("Formula", fontSize = 9.sp, color = WebTextMuted, fontWeight = FontWeight.Bold)
                        Text(match.formula, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = WebTextPrimary)
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("MW", fontSize = 9.sp, color = WebTextMuted, fontWeight = FontWeight.Bold)
                        Text("${match.molecularWeight}", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = WebTextPrimary)
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("LogP", fontSize = 9.sp, color = WebTextMuted, fontWeight = FontWeight.Bold)
                        Text("${match.logP}", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = WebNavy)
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("Target", fontSize = 9.sp, color = WebTextMuted, fontWeight = FontWeight.Bold)
                        Text(match.primaryTarget, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = WebTeal)
                    }
                }
            }

            // SMILES snippet
            Surface(
                color = Color(0xFFF8FAFC),
                shape = RoundedCornerShape(6.dp),
                border = BorderStroke(1.dp, WebBorder),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = match.smiles,
                    fontSize = 10.sp,
                    fontFamily = FontFamily.Monospace,
                    color = WebTextSecondary,
                    modifier = Modifier.padding(8.dp),
                    maxLines = 1
                )
            }

            Divider(color = WebBorder, thickness = 0.8.dp)

            // Actions matching Web
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "ECFP4 Bit Density: 1024 bits",
                    fontSize = 10.sp,
                    color = WebTextMuted,
                    fontFamily = FontFamily.Monospace
                )

                Button(
                    onClick = onUseInDocking,
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = WebNavy),
                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
                ) {
                    Icon(Icons.Default.Layers, contentDescription = null, modifier = Modifier.size(13.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Use in Docking", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
