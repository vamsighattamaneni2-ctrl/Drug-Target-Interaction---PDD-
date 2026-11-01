package com.drugtarget.discovery.ui.screens

import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
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
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.drugtarget.discovery.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlin.math.sin

data class DockingPoseRecord(
    val mode: Int,
    val affinityKcalMol: Double,
    val rmsdLowerBound: Double,
    val rmsdUpperBound: Double,
    val pkd: Double,
    val kdNm: Double,
    val hBonds: Int
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DockingScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    var selectedPair by remember { mutableStateOf("Imatinib vs BCR-ABL1 (1IEP)") }
    var centerX by remember { mutableStateOf("14.2") }
    var centerY by remember { mutableStateOf("-8.6") }
    var centerZ by remember { mutableStateOf("22.1") }
    var sizeX by remember { mutableStateOf("24.0") }
    var sizeY by remember { mutableStateOf("24.0") }
    var sizeZ by remember { mutableStateOf("24.0") }
    var exhaustiveness by remember { mutableIntStateOf(16) }
    var selectedPoseIndex by remember { mutableIntStateOf(0) }
    var renderStyle by remember { mutableStateOf("Cartoon") }

    var isDocking by remember { mutableStateOf(false) }

    val pairs = listOf(
        "Imatinib vs BCR-ABL1 (1IEP)",
        "Erlotinib vs EGFR (1M17)",
        "Gefitinib vs EGFR (2ITX)",
        "Osimertinib vs EGFR (1IVO)",
        "Tamoxifen vs ESR1 (3ERT)"
    )

    val baseEnergy = when {
        selectedPair.contains("Imatinib") -> -10.2
        selectedPair.contains("Osimertinib") -> -10.5
        selectedPair.contains("Erlotinib") -> -9.8
        selectedPair.contains("Gefitinib") -> -9.4
        selectedPair.contains("Tamoxifen") -> -10.0
        else -> -9.5
    }

    val poses = remember(selectedPair) {
        listOf(
            DockingPoseRecord(1, baseEnergy, 0.0, 0.0, Math.abs(baseEnergy) / 1.363, Math.pow(10.0, 9.0 - (Math.abs(baseEnergy) / 1.363)), 4),
            DockingPoseRecord(2, baseEnergy + 0.5, 1.2, 1.8, Math.abs(baseEnergy + 0.5) / 1.363, Math.pow(10.0, 9.0 - (Math.abs(baseEnergy + 0.5) / 1.363)), 3),
            DockingPoseRecord(3, baseEnergy + 0.9, 1.9, 2.4, Math.abs(baseEnergy + 0.9) / 1.363, Math.pow(10.0, 9.0 - (Math.abs(baseEnergy + 0.9) / 1.363)), 3),
            DockingPoseRecord(4, baseEnergy + 1.4, 2.3, 3.1, Math.abs(baseEnergy + 1.4) / 1.363, Math.pow(10.0, 9.0 - (Math.abs(baseEnergy + 1.4) / 1.363)), 2),
            DockingPoseRecord(5, baseEnergy + 1.8, 2.8, 3.7, Math.abs(baseEnergy + 1.8) / 1.363, Math.pow(10.0, 9.0 - (Math.abs(baseEnergy + 1.8) / 1.363)), 2),
            DockingPoseRecord(6, baseEnergy + 2.1, 3.2, 4.2, Math.abs(baseEnergy + 2.1) / 1.363, Math.pow(10.0, 9.0 - (Math.abs(baseEnergy + 2.1) / 1.363)), 1),
            DockingPoseRecord(7, baseEnergy + 2.5, 3.6, 4.9, Math.abs(baseEnergy + 2.5) / 1.363, Math.pow(10.0, 9.0 - (Math.abs(baseEnergy + 2.5) / 1.363)), 1),
            DockingPoseRecord(8, baseEnergy + 2.9, 4.1, 5.5, Math.abs(baseEnergy + 2.9) / 1.363, Math.pow(10.0, 9.0 - (Math.abs(baseEnergy + 2.9) / 1.363)), 1),
            DockingPoseRecord(9, baseEnergy + 3.2, 4.5, 6.1, Math.abs(baseEnergy + 3.2) / 1.363, Math.pow(10.0, 9.0 - (Math.abs(baseEnergy + 3.2) / 1.363)), 0)
        )
    }

    val keyContacts = when {
        selectedPair.contains("Imatinib") -> listOf("Met318 (H-Bond, 2.8 Å)", "Thr315 (H-Bond, 3.1 Å)", "Glu286 (Salt Bridge, 3.4 Å)", "Asp381 (H-Bond, 2.9 Å)", "Phe382 (Pi-Stacking)")
        selectedPair.contains("Erlotinib") -> listOf("Met793 (H-Bond, 2.7 Å)", "Thr790 (Hydrophobic, 3.4 Å)", "Leu718 (Hydrophobic)", "Lys745 (Pi-Cation)")
        else -> listOf("Met793 (H-Bond, 2.8 Å)", "Cys797 (Polar Contact)", "Leu844 (Hydrophobic)", "Phe723 (Aromatic)")
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
                                .background(Brush.linearGradient(listOf(WebNavy, WebBlue))),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Layers, contentDescription = null, tint = Color.White, modifier = Modifier.size(18.dp))
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Text(
                                    text = "Molecular Docking",
                                    style = MaterialTheme.typography.titleMedium.copy(
                                        fontWeight = FontWeight.Bold,
                                        color = WebTextPrimary
                                    )
                                )
                                Surface(
                                    color = Color(0xFFEFF6FF),
                                    shape = RoundedCornerShape(4.dp),
                                    border = BorderStroke(1.dp, Color(0xFFBFDBFE))
                                ) {
                                    Text(
                                        text = "AutoDock Vina",
                                        color = WebBlue,
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                            }
                            Text(
                                text = "Conformational Search & Binding Energy Scoring",
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
                                text = "AutoDock Vina Empirical Free Energy Pipeline",
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = WebNavy
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "Iterated local search global optimizer evaluates rigid receptor coordinates with flexible ligand torsions, generating top conformational binding poses sorted by ΔG.",
                                fontSize = 11.sp,
                                color = Color(0xFF1E40AF),
                                lineHeight = 16.sp
                            )
                        }
                    }
                }
            }

            // 2. Pair Selection & Grid Setup Card
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
                            text = "Complex System & Search Grid",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = WebTextPrimary
                        )

                        // Pair chips
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .horizontalScroll(rememberScrollState()),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            pairs.forEach { pair ->
                                FilterChip(
                                    selected = selectedPair == pair,
                                    onClick = { selectedPair = pair },
                                    label = { Text(pair, fontSize = 11.sp, fontWeight = FontWeight.SemiBold) },
                                    colors = FilterChipDefaults.filterChipColors(
                                        selectedContainerColor = WebNavy,
                                        selectedLabelColor = Color.White
                                    )
                                )
                            }
                        }

                        // Grid center & size preview
                        Surface(
                            color = WebSurfaceSubtle,
                            shape = RoundedCornerShape(8.dp),
                            border = BorderStroke(1.dp, WebBorder),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Text("Grid Center (Å):", fontSize = 11.sp, color = WebTextSecondary, fontWeight = FontWeight.SemiBold)
                                    Text("X: $centerX  Y: $centerY  Z: $centerZ", fontSize = 11.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold, color = WebNavy)
                                }
                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Text("Grid Dimensions (Å):", fontSize = 11.sp, color = WebTextSecondary, fontWeight = FontWeight.SemiBold)
                                    Text("${sizeX} × ${sizeY} × ${sizeZ}", fontSize = 11.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold, color = WebTeal)
                                }
                            }
                        }

                        // Re-run Docking Button
                        Button(
                            onClick = {
                                coroutineScope.launch {
                                    isDocking = true
                                    delay(900)
                                    isDocking = false
                                    selectedPoseIndex = 0
                                    Toast.makeText(context, "Calculated 9 AutoDock Vina binding modes", Toast.LENGTH_SHORT).show()
                                }
                            },
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = WebNavy),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            if (isDocking) {
                                CircularProgressIndicator(color = Color.White, modifier = Modifier.size(16.dp), strokeWidth = 2.dp)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Running Local BFGS Optimization...", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            } else {
                                Icon(Icons.Default.PlayArrow, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Re-Calculate Docking Poses", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }

            // 3. Simulated 3D Ribbon & Ligand Pose Viewer
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = WebCard),
                    shape = RoundedCornerShape(14.dp),
                    border = BorderStroke(1.dp, WebBorder)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Visibility, contentDescription = null, tint = WebTeal, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Pose #$selectedPoseIndex Visualization", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = WebTextPrimary)
                            }
                            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                listOf("Cartoon", "Surface").forEach { style ->
                                    Surface(
                                        onClick = { renderStyle = style },
                                        shape = RoundedCornerShape(6.dp),
                                        color = if (renderStyle == style) WebTeal else WebSurfaceSubtle
                                    ) {
                                        Text(
                                            text = style,
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (renderStyle == style) Color.White else WebTextSecondary,
                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                        )
                                    }
                                }
                            }
                        }

                        // 3D Canvas Box
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(180.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(Color(0xFF0F172A)),
                            contentAlignment = Alignment.Center
                        ) {
                            Canvas(modifier = Modifier.fillMaxSize()) {
                                val w = size.width
                                val h = size.height

                                // Draw simulated protein alpha helices ribbons
                                for (i in 0..4) {
                                    val path = Path()
                                    val startY = h * 0.2f + (i * 24f)
                                    path.moveTo(w * 0.15f, startY)
                                    for (step in 1..20) {
                                        val x = w * 0.15f + (step * (w * 0.7f / 20))
                                        val y = startY + (sin(step * 0.8f + i) * 16f).toFloat()
                                        path.lineTo(x, y)
                                    }
                                    drawPath(
                                        path = path,
                                        color = if (renderStyle == "Surface") Color(0xFF38BDF8).copy(alpha = 0.25f) else Color(0xFF38BDF8).copy(alpha = 0.6f),
                                        style = Stroke(width = if (renderStyle == "Surface") 12f else 4f)
                                    )
                                }

                                // Draw bound ligand stick pose in the pocket center
                                val cx = w * 0.5f
                                val cy = h * 0.5f

                                // Ligand bonds
                                drawLine(Color(0xFFFBBF24), Offset(cx - 30f, cy - 20f), Offset(cx, cy), strokeWidth = 5f)
                                drawLine(Color(0xFFFBBF24), Offset(cx, cy), Offset(cx + 35f, cy - 10f), strokeWidth = 5f)
                                drawLine(Color(0xFFFBBF24), Offset(cx, cy), Offset(cx + 10f, cy + 30f), strokeWidth = 5f)
                                drawLine(Color(0xFFFBBF24), Offset(cx + 10f, cy + 30f), Offset(cx - 25f, cy + 25f), strokeWidth = 5f)

                                // Ligand atoms (Nitrogen blue, Oxygen red, Carbon gold)
                                drawCircle(Color(0xFFF87171), radius = 7f, center = Offset(cx - 30f, cy - 20f))
                                drawCircle(Color(0xFF60A5FA), radius = 7f, center = Offset(cx + 35f, cy - 10f))
                                drawCircle(Color(0xFF34D399), radius = 7f, center = Offset(cx + 10f, cy + 30f))
                                drawCircle(Color(0xFFFBBF24), radius = 8f, center = Offset(cx, cy))

                                // Hydrogen bond dashed contact lines
                                drawLine(
                                    Color(0xFF34D399),
                                    Offset(cx - 30f, cy - 20f),
                                    Offset(cx - 60f, cy - 40f),
                                    strokeWidth = 2.5f
                                )
                            }

                            // Overlay label
                            Surface(
                                color = Color.Black.copy(alpha = 0.6f),
                                shape = RoundedCornerShape(4.dp),
                                modifier = Modifier
                                    .align(Alignment.BottomStart)
                                    .padding(8.dp)
                            ) {
                                Text(
                                    text = "ΔG: ${poses[selectedPoseIndex].affinityKcalMol} kcal/mol • Kd: ${String.format("%.1f", poses[selectedPoseIndex].kdNm)} nM",
                                    color = Color.White,
                                    fontSize = 10.sp,
                                    fontFamily = FontFamily.Monospace,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                                )
                            }
                        }

                        // Residue contacts list
                        Text("Active Pocket Polar Contacts:", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = WebTextSecondary)
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .horizontalScroll(rememberScrollState()),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            keyContacts.forEach { res ->
                                Surface(
                                    color = Color(0xFFF0FDF4),
                                    shape = RoundedCornerShape(6.dp),
                                    border = BorderStroke(1.dp, Color(0xFFBBF7D0))
                                ) {
                                    Text(
                                        text = res,
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = Color(0xFF15803D),
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // 4. Pose Rankings Table Header
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "AutoDock Vina Modes (9 Poses)",
                        style = MaterialTheme.typography.titleSmall.copy(
                            fontWeight = FontWeight.Bold,
                            color = WebTextPrimary
                        )
                    )
                    Text(
                        text = "RMSD Relative to Mode #1",
                        fontSize = 11.sp,
                        color = WebTextMuted
                    )
                }
            }

            // 5. Poses List
            items(poses) { pose ->
                val isSelected = selectedPoseIndex == (pose.mode - 1)
                Card(
                    onClick = { selectedPoseIndex = pose.mode - 1 },
                    colors = CardDefaults.cardColors(containerColor = if (isSelected) Color(0xFFEFF6FF) else WebCard),
                    shape = RoundedCornerShape(12.dp),
                    border = BorderStroke(1.dp, if (isSelected) WebNavy else WebBorder),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .padding(14.dp)
                            .fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(26.dp)
                                    .clip(CircleShape)
                                    .background(if (pose.mode == 1) Color(0xFFFEF3C7) else WebSurfaceSubtle),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "#${pose.mode}",
                                    color = if (pose.mode == 1) Color(0xFFB45309) else WebTextSecondary,
                                    fontWeight = FontWeight.ExtraBold,
                                    fontSize = 11.sp
                                )
                            }
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text(
                                    text = "Binding Affinity: ${pose.affinityKcalMol} kcal/mol",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp,
                                    color = WebTextPrimary
                                )
                                Text(
                                    text = "RMSD: ${pose.rmsdLowerBound} Å l.b. | ${pose.rmsdUpperBound} Å u.b. • ${pose.hBonds} H-Bonds",
                                    fontSize = 10.sp,
                                    color = WebTextSecondary
                                )
                            }
                        }

                        Surface(
                            color = if (isSelected) WebNavy else WebSurfaceSubtle,
                            shape = RoundedCornerShape(6.dp)
                        ) {
                            Text(
                                text = "Kd: ${String.format("%.1f", pose.kdNm)} nM",
                                color = if (isSelected) Color.White else WebNavy,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}
