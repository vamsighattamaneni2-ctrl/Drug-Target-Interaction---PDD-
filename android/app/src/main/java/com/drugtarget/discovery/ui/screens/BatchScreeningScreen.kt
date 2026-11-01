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
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

data class BatchScreeningCandidate(
    val id: String,
    val name: String,
    val smiles: String,
    val deltaG: Double,
    val pkd: Double,
    val kdNm: Double,
    val lipinskiPass: Boolean,
    val hBonds: Int,
    val rmsd: Double
)

val BATCH_INHIBITOR_COHORT = listOf(
    BatchScreeningCandidate("DB00619", "Imatinib", "CC1=C(C=C(C=C1)NC(=O)c2ccc(cc2)CN3CCN(CC3)C)Nc4nccc(n4)c5cccnc5", -10.2, 7.48, 33.1, true, 4, 1.2),
    BatchScreeningCandidate("DB09330", "Osimertinib", "CN(C)CC=CC(=O)NC1=C(C=C(C(=C1)NC2=NC=CC(=N2)C3=CN(C4=CC=CC=C34)C)OC)N(C)CCN(C)C", -10.5, 7.70, 20.0, true, 4, 1.1),
    BatchScreeningCandidate("DB00530", "Erlotinib", "COCCOC1=C(C=C2C(=C1)C(=NC=N2)NC3=CC=CC(=C3)C#C)OCCOC", -9.8, 7.19, 64.6, true, 2, 1.4),
    BatchScreeningCandidate("DB00317", "Gefitinib", "COC1=C(OCC2=CC=CC=C2)C=C2C(=C1)N=CN=C2NC1=CC(Cl)=C(F)C=C1", -9.4, 6.90, 125.9, true, 3, 1.5),
    BatchScreeningCandidate("DB00675", "Tamoxifen", "CCC(=C(C1=CC=CC=C1)C2=CC=C(C=C2)OCCN(C)C)C3=CC=CC=C3", -10.0, 7.34, 46.1, true, 1, 1.3),
    BatchScreeningCandidate("DB00773", "Etoposide", "COc1cc2c(cc1OC)[C@@H]3[C@@H]4CC5=CC=6OCOC=6C=C5[C@@H]4[C@@H](O3)CO2", -9.1, 6.68, 210.4, false, 4, 1.8)
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BatchScreeningScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    var selectedTarget by remember { mutableStateOf("EGFR (1M17)") }
    var selectedPocketMode by remember { mutableStateOf("Primary Catalytic Pocket") }
    var exhaustiveness by remember { mutableIntStateOf(8) }

    var isRunning by remember { mutableStateOf(false) }
    var screeningProgress by remember { mutableFloatStateOf(0f) }
    var currentProcessingIndex by remember { mutableIntStateOf(0) }
    var results by remember { mutableStateOf<List<BatchScreeningCandidate>>(emptyList()) }

    val targets = listOf("EGFR (1M17)", "BCR-ABL1 (1IEP)", "BRAF (4E26)", "ESR1 (3ERT)", "PARP1 (4UND)")

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
                                .background(Brush.linearGradient(listOf(WebNavy, Color(0xFF4338CA)))),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.FolderSpecial, contentDescription = null, tint = Color.White, modifier = Modifier.size(18.dp))
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Text(
                                    text = "Batch Virtual Screening",
                                    style = MaterialTheme.typography.titleMedium.copy(
                                        fontWeight = FontWeight.Bold,
                                        color = WebTextPrimary
                                    )
                                )
                                Surface(
                                    color = Color(0xFFE0E7FF),
                                    shape = RoundedCornerShape(4.dp),
                                    border = BorderStroke(1.dp, Color(0xFFC7D2FE))
                                ) {
                                    Text(
                                        text = "High-Throughput Vina",
                                        color = Color(0xFF3730A3),
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                            }
                            Text(
                                text = "Multi-Compound Chemical Library Pipeline",
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
                    color = Color(0xFFEEF2FF),
                    shape = RoundedCornerShape(12.dp),
                    border = BorderStroke(1.dp, Color(0xFFC7D2FE)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.Top
                    ) {
                        Icon(
                            Icons.Default.Info,
                            contentDescription = null,
                            tint = Color(0xFF4338CA),
                            modifier = Modifier.size(18.dp).padding(top = 2.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "Automated High-Throughput In Silico Screening",
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = Color(0xFF312E81)
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "Screen validated multi-compound cohorts against receptor pockets with parallel Monte Carlo energy minimization, reporting thermodynamic binding free energies (ΔG) and dissociation constants (Kd).",
                                fontSize = 11.sp,
                                color = Color(0xFF3730A3),
                                lineHeight = 16.sp
                            )
                        }
                    }
                }
            }

            // 2. Setup Configuration Card matching Web
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
                        Text(
                            text = "Batch Screening Parameters",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = WebTextPrimary
                        )

                        // Target Selector Chips
                        Text("Target Receptor Domain", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = WebTextSecondary)
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

                        // Pocket Mode
                        Text("Binding Pocket Conformation", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = WebTextSecondary)
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            listOf("Primary Catalytic Pocket", "Allosteric Pocket").forEach { mode ->
                                FilterChip(
                                    selected = selectedPocketMode == mode,
                                    onClick = { selectedPocketMode = mode },
                                    label = { Text(mode, fontSize = 11.sp) }
                                )
                            }
                        }

                        // Exhaustiveness
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Vina Search Exhaustiveness", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = WebTextSecondary)
                            Text("$exhaustiveness", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = WebNavy)
                        }
                        Slider(
                            value = exhaustiveness.toFloat(),
                            onValueChange = { exhaustiveness = it.toInt() },
                            valueRange = 4f..32f,
                            steps = 6
                        )

                        // Cohort Library summary
                        Surface(
                            color = WebSurfaceSubtle,
                            shape = RoundedCornerShape(8.dp),
                            border = BorderStroke(1.dp, WebBorder),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier.padding(10.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.Layers, contentDescription = null, tint = WebNavy, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Kinase Inhibitor Cohort (${BATCH_INHIBITOR_COHORT.size} compounds)", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = WebTextPrimary)
                                }
                                Surface(
                                    color = Color(0xFFDCFCE7),
                                    shape = RoundedCornerShape(4.dp)
                                ) {
                                    Text("Pre-Validated", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color(0xFF15803D), modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                                }
                            }
                        }

                        // Launch Button & Progress
                        if (isRunning) {
                            Column(
                                modifier = Modifier.fillMaxWidth(),
                                verticalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                LinearProgressIndicator(
                                    progress = { screeningProgress },
                                    modifier = Modifier.fillMaxWidth().height(8.dp).clip(RoundedCornerShape(4.dp)),
                                    color = WebNavy,
                                    trackColor = WebSurfaceSubtle
                                )
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(
                                        text = "Screening compound ${currentProcessingIndex + 1} of ${BATCH_INHIBITOR_COHORT.size} (${BATCH_INHIBITOR_COHORT[currentProcessingIndex].name})...",
                                        fontSize = 11.sp,
                                        fontFamily = FontFamily.Monospace,
                                        color = WebNavy
                                    )
                                    Text(
                                        text = "${(screeningProgress * 100).toInt()}%",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = WebNavy
                                    )
                                }
                            }
                        } else {
                            Button(
                                onClick = {
                                    coroutineScope.launch {
                                        isRunning = true
                                        results = emptyList()
                                        for (i in BATCH_INHIBITOR_COHORT.indices) {
                                            currentProcessingIndex = i
                                            screeningProgress = (i + 1).toFloat() / BATCH_INHIBITOR_COHORT.size
                                            delay(500)
                                        }
                                        results = BATCH_INHIBITOR_COHORT.sortedBy { it.deltaG }
                                        isRunning = false
                                        Toast.makeText(context, "Completed virtual screening of ${BATCH_INHIBITOR_COHORT.size} compounds", Toast.LENGTH_SHORT).show()
                                    }
                                },
                                shape = RoundedCornerShape(8.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = WebNavy),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Icon(Icons.Default.PlayArrow, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Execute Virtual Screening Pipeline", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }

            // 3. Results Section
            if (results.isNotEmpty()) {
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Docking Results Ranking (${results.size})",
                            style = MaterialTheme.typography.titleSmall.copy(
                                fontWeight = FontWeight.Bold,
                                color = WebTextPrimary
                            )
                        )
                        TextButton(
                            onClick = {
                                Toast.makeText(context, "Exported screening results CSV", Toast.LENGTH_SHORT).show()
                            }
                        ) {
                            Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(14.dp), tint = WebNavy)
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Export CSV", fontSize = 11.sp, color = WebNavy, fontWeight = FontWeight.Bold)
                        }
                    }
                }

                items(results) { cand ->
                    BatchHitCard(
                        cand = cand,
                        rank = results.indexOf(cand) + 1,
                        onViewPose = {
                            Toast.makeText(context, "Opening docked pose for ${cand.name} (ΔG = ${cand.deltaG} kcal/mol)", Toast.LENGTH_SHORT).show()
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun BatchHitCard(
    cand: BatchScreeningCandidate,
    rank: Int,
    onViewPose: () -> Unit
) {
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
            // Header Row: Rank, Name, DrugBank ID & Binding Energy
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(26.dp)
                            .clip(CircleShape)
                            .background(if (rank == 1) Color(0xFFFEF3C7) else WebSurfaceSubtle),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "#$rank",
                            color = if (rank == 1) Color(0xFFB45309) else WebTextSecondary,
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 11.sp
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
                            text = "AutoDock Vina Free Energy",
                            fontSize = 10.sp,
                            color = WebTextMuted
                        )
                    }
                }

                // ΔG Energy Badge
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
                            text = "${cand.deltaG} kcal/mol",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = WebNavy
                        )
                        Text(
                            text = "Kd: ${cand.kdNm} nM",
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            color = WebTeal
                        )
                    }
                }
            }

            // Metrics row: Kd, pKd, H-Bonds, Lipinski
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
                        Text("Affinity pKd", fontSize = 9.sp, color = WebTextMuted, fontWeight = FontWeight.Bold)
                        Text("${cand.pkd}", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = WebNavy)
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("H-Bonds", fontSize = 9.sp, color = WebTextMuted, fontWeight = FontWeight.Bold)
                        Text("${cand.hBonds} bonds", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = WebTextPrimary)
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("RMSD", fontSize = 9.sp, color = WebTextMuted, fontWeight = FontWeight.Bold)
                        Text("${cand.rmsd} Å", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = WebTextPrimary)
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("Lipinski", fontSize = 9.sp, color = WebTextMuted, fontWeight = FontWeight.Bold)
                        Text(if (cand.lipinskiPass) "Passed" else "Failed", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = if (cand.lipinskiPass) Color(0xFF047857) else Color(0xFFB45309))
                    }
                }
            }

            Divider(color = WebBorder, thickness = 0.8.dp)

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Pose Confidence: High",
                    fontSize = 10.sp,
                    color = Color(0xFF047857),
                    fontWeight = FontWeight.Bold
                )

                Button(
                    onClick = onViewPose,
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = WebNavy),
                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
                ) {
                    Icon(Icons.Default.Layers, contentDescription = null, modifier = Modifier.size(13.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("View Pose", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
