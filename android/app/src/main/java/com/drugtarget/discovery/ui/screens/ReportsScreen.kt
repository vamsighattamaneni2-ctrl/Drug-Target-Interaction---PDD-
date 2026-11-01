package com.drugtarget.discovery.ui.screens

import android.content.Context
import android.widget.Toast
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.drugtarget.discovery.data.model.AnalysisReport
import com.drugtarget.discovery.data.repository.ReportRepository
import com.drugtarget.discovery.ui.theme.*
import com.drugtarget.discovery.util.PdfReportGenerator
import java.io.File

import com.drugtarget.discovery.ui.viewmodel.DiscoveryViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReportsScreen(
    viewModel: DiscoveryViewModel,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val scrollState = rememberScrollState()
    val uiState by viewModel.uiState.collectAsState()
    val userName = uiState.currentUser.name.ifBlank { "Researcher" }

    // Collect synchronized reports (present and past) from ReportRepository
    val reportsList by ReportRepository.reports.collectAsState()

    var searchQuery by remember { mutableStateOf("") }
    var selectedFilter by remember { mutableStateOf("ALL") }

    // Dialog state for viewing full evaluation dossier
    var selectedReportForDetails by remember { mutableStateOf<AnalysisReport?>(null) }

    // Dialog state for PDF export success & preview
    var generatedPdfFile by remember { mutableStateOf<File?>(null) }
    var pdfExportReportTitle by remember { mutableStateOf("") }

    // Filter user-specific reports
    val currentUser = uiState.currentUser
    val filteredReports = remember(reportsList, searchQuery, selectedFilter, currentUser) {
        reportsList.filter { rep ->
            val isUserReport = rep.submittedBy.equals(currentUser.name, ignoreCase = true) ||
                    rep.submittedBy.equals(currentUser.email, ignoreCase = true) ||
                    (currentUser.name.isNotBlank() && rep.submittedBy.contains(currentUser.name, ignoreCase = true)) ||
                    (rep.submittedBy.isNotBlank() && currentUser.name.contains(rep.submittedBy, ignoreCase = true))

            val matchesSearch = searchQuery.isBlank() ||
                    rep.compoundName.contains(searchQuery, ignoreCase = true) ||
                    rep.targetGene.contains(searchQuery, ignoreCase = true) ||
                    rep.id.contains(searchQuery, ignoreCase = true) ||
                    rep.title.contains(searchQuery, ignoreCase = true) ||
                    rep.submittedBy.contains(searchQuery, ignoreCase = true)

            val matchesFilter = when (selectedFilter) {
                "MY_REPORTS" -> isUserReport
                "HIGH_AFFINITY" -> rep.predictedKdNm < 50.0
                "KINASE" -> rep.targetGene.contains("ABL", true) || rep.targetGene.contains("EGFR", true)
                "RECENT" -> rep.dateSubmitted.startsWith("2026")
                else -> true
            }

            matchesSearch && matchesFilter
        }
    }

    // PDF Download Success & Actions Dialog
    if (generatedPdfFile != null) {
        AlertDialog(
            onDismissRequest = { generatedPdfFile = null },
            icon = {
                Icon(
                    imageVector = Icons.Default.PictureAsPdf,
                    contentDescription = null,
                    tint = Color(0xFFDC2626),
                    modifier = Modifier.size(36.dp)
                )
            },
            title = {
                Text(
                    text = "PDF Dossier Exported Successfully",
                    fontWeight = FontWeight.Bold,
                    fontSize = 17.sp,
                    color = WebTextPrimary
                )
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        text = "Scientific evaluation report for $pdfExportReportTitle has been compiled and saved to device storage:",
                        fontSize = 13.sp,
                        color = WebTextSecondary
                    )
                    Surface(
                        color = WebSurfaceSubtle,
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = generatedPdfFile?.name ?: "report.pdf",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = WebNavy,
                            modifier = Modifier.padding(10.dp)
                        )
                    }
                    Text(
                        text = "Includes binding energetics (ΔG), estimated Kd, interaction contacts, and ADMET profile.",
                        fontSize = 11.sp,
                        color = WebTextMuted
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val file = generatedPdfFile
                        if (file != null) {
                            try {
                                val intent = PdfReportGenerator.createViewPdfIntent(context, file)
                                context.startActivity(intent)
                            } catch (e: Exception) {
                                Toast.makeText(context, "No PDF viewer app found. Saved to Documents.", Toast.LENGTH_LONG).show()
                            }
                        }
                        generatedPdfFile = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = WebNavy),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(Icons.Default.Visibility, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Open PDF")
                }
            },
            dismissButton = {
                OutlinedButton(
                    onClick = {
                        val file = generatedPdfFile
                        if (file != null) {
                            try {
                                val intent = PdfReportGenerator.createSharePdfIntent(context, file)
                                context.startActivity(intent)
                            } catch (e: Exception) {
                                Toast.makeText(context, "Unable to share file.", Toast.LENGTH_SHORT).show()
                            }
                        }
                        generatedPdfFile = null
                    },
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(Icons.Default.Share, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Share")
                }
            },
            containerColor = WebCard,
            shape = RoundedCornerShape(16.dp)
        )
    }

    // Full Detailed Dossier Inspection Modal Dialog
    if (selectedReportForDetails != null) {
        val rep = selectedReportForDetails!!
        AlertDialog(
            onDismissRequest = { selectedReportForDetails = null },
            title = {
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            color = Color(0xFFECFDF5),
                            shape = RoundedCornerShape(6.dp)
                        ) {
                            Text(
                                text = "COMPLETED",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF047857),
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                        Text(text = rep.id, fontSize = 11.sp, color = WebTextMuted)
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "${rep.compoundName} vs ${rep.targetGene}",
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp,
                        color = WebNavy
                    )
                }
            },
            text = {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(max = 450.dp)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Summary card
                    Surface(
                        color = WebSurfaceSubtle,
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text("Evaluation Summary", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = WebTextPrimary)
                            Text(rep.summary, fontSize = 12.sp, color = WebTextSecondary)
                        }
                    }

                    // Three Key Numbers
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Surface(
                            modifier = Modifier.weight(1f),
                            color = Color(0xFFF0FDF4),
                            shape = RoundedCornerShape(8.dp),
                            border = BorderStroke(1.dp, Color(0xFFBBF7D0))
                        ) {
                            Column(modifier = Modifier.padding(8.dp)) {
                                Text("BINDING ENERGY", fontSize = 8.sp, fontWeight = FontWeight.Bold, color = Color(0xFF15803D))
                                Text("${rep.dockingScore}", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF166534))
                                Text("kcal/mol (ΔG)", fontSize = 8.sp, color = Color(0xFF15803D))
                            }
                        }
                        Surface(
                            modifier = Modifier.weight(1f),
                            color = Color(0xFFF0FDFA),
                            shape = RoundedCornerShape(8.dp),
                            border = BorderStroke(1.dp, Color(0xFF99F6E4))
                        ) {
                            Column(modifier = Modifier.padding(8.dp)) {
                                Text("ESTIMATED KD", fontSize = 8.sp, fontWeight = FontWeight.Bold, color = Color(0xFF0F766E))
                                Text("${rep.predictedKdNm} nM", fontSize = 15.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF115E59))
                                Text("pKd: ${rep.bindingAffinityPkd}", fontSize = 8.sp, color = Color(0xFF0F766E))
                            }
                        }
                        Surface(
                            modifier = Modifier.weight(1f),
                            color = Color(0xFFEFF6FF),
                            shape = RoundedCornerShape(8.dp),
                            border = BorderStroke(1.dp, Color(0xFFBFDBFE))
                        ) {
                            Column(modifier = Modifier.padding(8.dp)) {
                                Text("CONFIDENCE", fontSize = 8.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1D4ED8))
                                Text(rep.confidence, fontSize = 15.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF1E40AF))
                                Text("RMSD: ${rep.dockingRmsd}Å", fontSize = 8.sp, color = Color(0xFF1D4ED8))
                            }
                        }
                    }

                    // SMILES
                    if (rep.compoundSmiles.isNotBlank()) {
                        Column {
                            Text("Canonical SMILES", fontWeight = FontWeight.Bold, fontSize = 11.sp, color = WebTextPrimary)
                            Surface(color = WebSurfaceSubtle, shape = RoundedCornerShape(6.dp)) {
                                Text(rep.compoundSmiles, fontSize = 9.sp, color = WebTextSecondary, modifier = Modifier.padding(8.dp))
                            }
                        }
                    }

                    // Key Contacts
                    if (rep.contacts.isNotEmpty()) {
                        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text("Key Interaction Contacts", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = WebTextPrimary)
                            rep.contacts.forEach { c ->
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text("• ${c.residue} (${c.type})", fontSize = 11.sp, color = WebTextSecondary)
                                    Text(c.distance, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = WebTeal)
                                }
                            }
                        }
                    }

                    // ADMET Summary
                    if (rep.admet != null) {
                        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text("In Silico Pharmacokinetics (ADMET)", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = WebTextPrimary)
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("Human GI Absorption:", fontSize = 11.sp, color = WebTextMuted)
                                Text(rep.admet.giAbsorption, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = WebNavy)
                            }
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("Plasma Protein Binding:", fontSize = 11.sp, color = WebTextMuted)
                                Text("${rep.admet.plasmaProteinBindingPct}%", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = WebNavy)
                            }
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("hERG Cardiotoxicity Risk:", fontSize = 11.sp, color = WebTextMuted)
                                Text(rep.admet.hergInhibitionRisk, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF047857))
                            }
                        }
                    }

                    Text("Evaluator: ${rep.submittedBy} • Platform v2.4", fontSize = 10.sp, color = WebTextMuted)
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val currentRep = selectedReportForDetails
                        selectedReportForDetails = null
                        if (currentRep != null) {
                            val pdfFile = PdfReportGenerator.generateReportPdf(context, currentRep)
                            generatedPdfFile = pdfFile
                            pdfExportReportTitle = "${currentRep.compoundName} & ${currentRep.targetGene}"
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = WebNavy),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Download PDF")
                }
            },
            dismissButton = {
                OutlinedButton(
                    onClick = { selectedReportForDetails = null },
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("Close")
                }
            },
            containerColor = WebCard,
            shape = RoundedCornerShape(16.dp)
        )
    }

    Scaffold(
        containerColor = WebBackground,
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Reports & Scientific Dossiers",
                            fontWeight = FontWeight.Bold,
                            fontSize = 17.sp,
                            color = WebTextPrimary
                        )
                        Text(
                            text = "Synchronized Discovery Reports • Present & Past",
                            fontSize = 11.sp,
                            color = WebTextMuted
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = WebTextPrimary)
                    }
                },
                actions = {
                    IconButton(onClick = {
                        ReportRepository.syncWithBackend()
                        Toast.makeText(context, "Synchronizing with Web & Backend...", Toast.LENGTH_SHORT).show()
                    }) {
                        Icon(Icons.Default.Sync, contentDescription = "Refresh & Sync", tint = WebNavy)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = WebCard)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(scrollState)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Header Overview Card
            Card(
                colors = CardDefaults.cardColors(containerColor = WebNavy),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "EVALUATION DOSSIERS",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = WebCyan
                        )
                        Surface(
                            color = Color.White.copy(alpha = 0.15f),
                            shape = RoundedCornerShape(6.dp)
                        ) {
                            Text(
                                text = "${reportsList.size} Saved Reports",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                            )
                        }
                    }
                    Text(
                        text = "Synchronized Multi-Platform Reports",
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp,
                        color = Color.White
                    )
                    Text(
                        text = "All past and present analyses conducted on Web or Mobile are accessible here with identical thermodynamic binding energies, Kd values, and downloadable PDF dossiers.",
                        fontSize = 12.sp,
                        color = Color.White.copy(alpha = 0.85f),
                        lineHeight = 16.sp
                    )
                }
            }

            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("Search by compound, target gene, or Job ID...", fontSize = 13.sp) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = WebTextMuted) },
                trailingIcon = {
                    if (searchQuery.isNotBlank()) {
                        IconButton(onClick = { searchQuery = "" }) {
                            Icon(Icons.Default.Clear, contentDescription = "Clear", tint = WebTextMuted)
                        }
                    }
                },
                singleLine = true,
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = WebCard,
                    unfocusedContainerColor = WebCard,
                    focusedBorderColor = WebNavy,
                    unfocusedBorderColor = WebBorder
                )
            )

            // Filter Chips
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                FilterChip(
                    selected = selectedFilter == "ALL",
                    onClick = { selectedFilter = "ALL" },
                    label = { Text("All (${reportsList.size})", fontSize = 11.sp) }
                )
                FilterChip(
                    selected = selectedFilter == "MY_REPORTS",
                    onClick = { selectedFilter = "MY_REPORTS" },
                    label = { Text("My Analyses", fontSize = 11.sp) }
                )
                FilterChip(
                    selected = selectedFilter == "HIGH_AFFINITY",
                    onClick = { selectedFilter = "HIGH_AFFINITY" },
                    label = { Text("High Affinity", fontSize = 11.sp) }
                )
                FilterChip(
                    selected = selectedFilter == "KINASE",
                    onClick = { selectedFilter = "KINASE" },
                    label = { Text("Kinases", fontSize = 11.sp) }
                )
                FilterChip(
                    selected = selectedFilter == "RECENT",
                    onClick = { selectedFilter = "RECENT" },
                    label = { Text("Recent", fontSize = 11.sp) }
                )
            }

            // Section Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Saved Analysis Reports (${filteredReports.size})",
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = WebTextPrimary
                )
                Text(
                    text = "User: $userName",
                    fontSize = 11.sp,
                    color = WebTextMuted
                )
            }

            // Empty State
            if (filteredReports.isEmpty()) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = WebCard),
                    shape = RoundedCornerShape(16.dp),
                    border = BorderStroke(1.dp, WebBorder),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(Icons.Default.SearchOff, contentDescription = null, modifier = Modifier.size(48.dp), tint = WebTextMuted)
                        Text("No Matching Reports Found", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = WebTextPrimary)
                        Text("Try clearing your search query or run a new simulation to generate a report.", fontSize = 12.sp, color = WebTextSecondary)
                    }
                }
            }

            // Reports Cards List
            filteredReports.forEach { rep ->
                Card(
                    colors = CardDefaults.cardColors(containerColor = WebCard),
                    shape = RoundedCornerShape(16.dp),
                    border = BorderStroke(1.dp, WebBorder),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        // Card Top Row: Job ID + Status Chip
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Surface(
                                color = WebNavy.copy(alpha = 0.08f),
                                shape = RoundedCornerShape(6.dp)
                            ) {
                                Text(
                                    text = rep.id,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = WebNavy,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                                )
                            }
                            Surface(
                                color = Color(0xFFECFDF5),
                                shape = RoundedCornerShape(6.dp)
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.CheckCircle,
                                        contentDescription = null,
                                        tint = Color(0xFF047857),
                                        modifier = Modifier.size(12.dp)
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(
                                        text = rep.status.uppercase(),
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFF047857)
                                    )
                                }
                            }
                        }

                        // Title & Target / Compound details
                        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text(
                                text = rep.title,
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp,
                                color = WebTextPrimary
                            )
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Surface(
                                    color = WebTeal.copy(alpha = 0.1f),
                                    shape = RoundedCornerShape(4.dp)
                                ) {
                                    Text(
                                        text = "${rep.targetGene} (${rep.targetPdbId})",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = WebTeal,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                                Text("•", color = WebTextMuted)
                                Text(
                                    text = rep.compoundName,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = WebTextSecondary
                                )
                            }
                        }

                        // Energetics & Dissociation metrics row (Synchronized with Web)
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Surface(
                                modifier = Modifier.weight(1f),
                                color = Color(0xFFF0FDF4),
                                shape = RoundedCornerShape(8.dp),
                                border = BorderStroke(1.dp, Color(0xFFBBF7D0))
                            ) {
                                Column(modifier = Modifier.padding(8.dp)) {
                                    Text("BINDING ENERGY", fontSize = 8.sp, fontWeight = FontWeight.Bold, color = Color(0xFF15803D))
                                    Text("${rep.dockingScore} kcal/mol", fontSize = 13.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF166534))
                                    Text("ΔG (Force-Field)", fontSize = 8.sp, color = Color(0xFF15803D))
                                }
                            }
                            Surface(
                                modifier = Modifier.weight(1f),
                                color = Color(0xFFF0FDFA),
                                shape = RoundedCornerShape(8.dp),
                                border = BorderStroke(1.dp, Color(0xFF99F6E4))
                            ) {
                                Column(modifier = Modifier.padding(8.dp)) {
                                    Text("ESTIMATED KD", fontSize = 8.sp, fontWeight = FontWeight.Bold, color = Color(0xFF0F766E))
                                    Text("${rep.predictedKdNm} nM", fontSize = 13.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF115E59))
                                    Text("pKd: ${rep.bindingAffinityPkd}", fontSize = 8.sp, color = Color(0xFF0F766E))
                                }
                            }
                            Surface(
                                modifier = Modifier.weight(1f),
                                color = Color(0xFFEFF6FF),
                                shape = RoundedCornerShape(8.dp),
                                border = BorderStroke(1.dp, Color(0xFFBFDBFE))
                            ) {
                                Column(modifier = Modifier.padding(8.dp)) {
                                    Text("CONFIDENCE", fontSize = 8.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1D4ED8))
                                    Text(rep.confidence, fontSize = 13.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF1E40AF))
                                    Text("H-Bonds: ${rep.hydrogenBondsCount}", fontSize = 8.sp, color = Color(0xFF1D4ED8))
                                }
                            }
                        }

                        // Date & Submitter Info
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Submitted: ${rep.dateSubmitted}",
                                fontSize = 11.sp,
                                color = WebTextMuted
                            )
                            Text(
                                text = "Method: ${rep.method}",
                                fontSize = 11.sp,
                                color = WebTextMuted
                            )
                        }

                        Divider(color = WebBorder, thickness = 0.8.dp)

                        // Action Buttons: View Dossier & Download PDF
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.End,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            OutlinedButton(
                                onClick = { selectedReportForDetails = rep },
                                shape = RoundedCornerShape(8.dp),
                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                            ) {
                                Icon(Icons.Default.MenuBook, contentDescription = null, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("View Dossier", fontSize = 11.sp)
                            }
                            Spacer(modifier = Modifier.width(8.dp))
                            Button(
                                onClick = {
                                    try {
                                        val pdfFile = PdfReportGenerator.generateReportPdf(context, rep)
                                        generatedPdfFile = pdfFile
                                        pdfExportReportTitle = "${rep.compoundName} vs ${rep.targetGene}"
                                        Toast.makeText(context, "PDF generated: ${pdfFile.name}", Toast.LENGTH_SHORT).show()
                                    } catch (e: Exception) {
                                        Toast.makeText(context, "Error generating PDF: ${e.message}", Toast.LENGTH_LONG).show()
                                    }
                                },
                                shape = RoundedCornerShape(8.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = WebNavy),
                                contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
                            ) {
                                Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(14.dp), tint = Color.White)
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Download PDF", fontSize = 11.sp, color = Color.White, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }
    }
}
