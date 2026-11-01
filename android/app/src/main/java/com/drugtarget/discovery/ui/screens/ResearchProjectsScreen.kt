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
import com.drugtarget.discovery.ui.viewmodel.DiscoveryViewModel
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.drugtarget.discovery.ui.theme.*

data class ResearchProjectRecord(
    val id: String,
    val title: String,
    val description: String,
    val targetGene: String,
    val pdbId: String,
    val compoundName: String,
    val date: String,
    val compoundsCount: Int,
    val status: String // "Active", "Completed", "Draft"
)

val INITIAL_PROJECTS = listOf(
    ResearchProjectRecord(
        id = "PRJ-2026-01",
        title = "EGFR Kinase Inhibitor Lead Optimization",
        description = "Molecular docking and ADMET profiling of quinazoline derivatives against EGFR L858R and T790M mutant conformations.",
        targetGene = "EGFR",
        pdbId = "1M17",
        compoundName = "Erlotinib / Osimertinib",
        date = "2026-02-18",
        compoundsCount = 24,
        status = "Active"
    ),
    ResearchProjectRecord(
        id = "PRJ-2026-02",
        title = "Breast Cancer ER-Alpha Targeted Screen",
        description = "Virtual screening of natural product core scaffolds against the Estrogen Receptor Alpha ligand-binding pocket.",
        targetGene = "ESR1",
        pdbId = "3ERT",
        compoundName = "Tamoxifen",
        date = "2026-02-10",
        compoundsCount = 128,
        status = "Completed"
    ),
    ResearchProjectRecord(
        id = "PRJ-2026-03",
        title = "BCR-ABL1 T315I Gatekeeper Overcoming Cohort",
        description = "Evaluating novel allosteric and dual ATP-pocket inhibitors against drug-resistant chronic myeloid leukemia.",
        targetGene = "BCR-ABL1",
        pdbId = "1IEP",
        compoundName = "Imatinib / Dasatinib",
        date = "2026-01-28",
        compoundsCount = 45,
        status = "Active"
    ),
    ResearchProjectRecord(
        id = "PRJ-2026-04",
        title = "PARP1 Synthetic Lethality Investigation",
        description = "Structure-based pose comparison and pharmacokinetic evaluation for synthetic lethality in BRCA-deficient carcinomas.",
        targetGene = "PARP1",
        pdbId = "4UND",
        compoundName = "Olaparib",
        date = "2026-01-15",
        compoundsCount = 12,
        status = "Draft"
    )
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ResearchProjectsScreen(
    viewModel: DiscoveryViewModel,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsState()
    val investigatorName = uiState.currentUser.name.ifBlank { "Researcher" }

    var projects by remember { mutableStateOf(INITIAL_PROJECTS) }
    var searchQuery by remember { mutableStateOf("") }
    var selectedStatus by remember { mutableStateOf("ALL") }
    var showNewProjectDialog by remember { mutableStateOf(false) }

    // Dialog state
    var newTitle by remember { mutableStateOf("") }
    var newDesc by remember { mutableStateOf("") }
    var newTarget by remember { mutableStateOf("EGFR") }
    var newCompound by remember { mutableStateOf("Imatinib") }

    val filteredProjects = remember(searchQuery, selectedStatus, projects) {
        projects.filter { p ->
            val matchesSearch = searchQuery.isBlank() ||
                    p.title.contains(searchQuery, ignoreCase = true) ||
                    p.description.contains(searchQuery, ignoreCase = true) ||
                    p.targetGene.contains(searchQuery, ignoreCase = true) ||
                    p.compoundName.contains(searchQuery, ignoreCase = true)

            val matchesStatus = selectedStatus == "ALL" || p.status == selectedStatus
            matchesSearch && matchesStatus
        }
    }

    if (showNewProjectDialog) {
        AlertDialog(
            onDismissRequest = { showNewProjectDialog = false },
            title = {
                Text(
                    text = "New Research Project",
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.Bold,
                        color = WebTextPrimary
                    )
                )
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(
                        value = newTitle,
                        onValueChange = { newTitle = it },
                        label = { Text("Project Title") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        shape = RoundedCornerShape(8.dp)
                    )
                    OutlinedTextField(
                        value = newDesc,
                        onValueChange = { newDesc = it },
                        label = { Text("Study Description & Objectives") },
                        modifier = Modifier.fillMaxWidth(),
                        maxLines = 3,
                        shape = RoundedCornerShape(8.dp)
                    )
                    OutlinedTextField(
                        value = newTarget,
                        onValueChange = { newTarget = it },
                        label = { Text("Target Gene Symbol (e.g. EGFR, ABL1)") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        shape = RoundedCornerShape(8.dp)
                    )
                    OutlinedTextField(
                        value = newCompound,
                        onValueChange = { newCompound = it },
                        label = { Text("Reference Compound (e.g. Imatinib)") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        shape = RoundedCornerShape(8.dp)
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (newTitle.isNotBlank()) {
                            val newRecord = ResearchProjectRecord(
                                id = "PRJ-2026-${(projects.size + 1).toString().padStart(2, '0')}",
                                title = newTitle.trim(),
                                description = newDesc.ifBlank { "In silico structure-based therapeutic evaluation." },
                                targetGene = newTarget.trim().uppercase(),
                                pdbId = if (newTarget.contains("ABL", true)) "1IEP" else "1M17",
                                compoundName = newCompound.trim(),
                                date = "2026-03-01",
                                compoundsCount = 1,
                                status = "Active"
                            )
                            projects = listOf(newRecord) + projects
                            showNewProjectDialog = false
                            newTitle = ""
                            newDesc = ""
                            Toast.makeText(context, "Created project ${newRecord.id}", Toast.LENGTH_SHORT).show()
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = WebNavy),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("Create Workspace", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showNewProjectDialog = false }) {
                    Text("Cancel", color = WebTextSecondary)
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
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(34.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(Brush.linearGradient(listOf(WebNavy, Color(0xFF2563EB)))),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.FolderOpen, contentDescription = null, tint = Color.White, modifier = Modifier.size(18.dp))
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Text(
                                    text = "Research Projects",
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
                                        text = "Session Archive",
                                        color = WebBlue,
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                            }
                            Text(
                                text = "Reproducible Computational Workspaces",
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
                actions = {
                    IconButton(onClick = { showNewProjectDialog = true }) {
                        Icon(Icons.Default.Add, contentDescription = "New Project", tint = WebNavy)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = WebCard)
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showNewProjectDialog = true },
                containerColor = WebNavy,
                contentColor = Color.White,
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(Icons.Default.Add, contentDescription = "New Project")
            }
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
                            tint = WebNavy,
                            modifier = Modifier.size(18.dp).padding(top = 2.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "Reproducible In Silico Campaign Workspaces",
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = WebNavy
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "Organize screening runs, molecular docking experiments, and binding free energy calculations into persistent research projects with JSON export capability.",
                                fontSize = 11.sp,
                                color = Color(0xFF1E40AF),
                                lineHeight = 16.sp
                            )
                        }
                    }
                }
            }

            // 2. Search & Filter Bar
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = WebCard),
                    shape = RoundedCornerShape(12.dp),
                    border = BorderStroke(1.dp, WebBorder)
                ) {
                    Column(
                        modifier = Modifier.padding(12.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        OutlinedTextField(
                            value = searchQuery,
                            onValueChange = { searchQuery = it },
                            placeholder = { Text("Search projects by title, target, or drug...", fontSize = 11.sp) },
                            leadingIcon = {
                                Icon(Icons.Default.Search, contentDescription = null, tint = WebTeal, modifier = Modifier.size(18.dp))
                            },
                            trailingIcon = {
                                if (searchQuery.isNotBlank()) {
                                    IconButton(onClick = { searchQuery = "" }) {
                                        Icon(Icons.Default.Close, contentDescription = "Clear", tint = WebTextMuted, modifier = Modifier.size(16.dp))
                                    }
                                }
                            },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            shape = RoundedCornerShape(8.dp)
                        )

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            listOf("ALL", "Active", "Completed", "Draft").forEach { st ->
                                FilterChip(
                                    selected = selectedStatus == st,
                                    onClick = { selectedStatus = st },
                                    label = { Text(st, fontSize = 11.sp, fontWeight = FontWeight.SemiBold) },
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

            // 3. Projects Count
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Research Projects (${filteredProjects.size})",
                        style = MaterialTheme.typography.titleSmall.copy(
                            fontWeight = FontWeight.Bold,
                            color = WebTextPrimary
                        )
                    )
                    Text(
                        text = "Investigator: $investigatorName",
                        fontSize = 10.sp,
                        color = WebTextMuted
                    )
                }
            }

            // 4. Projects Cards
            items(filteredProjects) { proj ->
                ProjectItemCard(
                    project = proj,
                    onExportJson = {
                        Toast.makeText(context, "Exported ${proj.id} session JSON archive", Toast.LENGTH_SHORT).show()
                    },
                    onOpen = {
                        Toast.makeText(context, "Opening ${proj.title} workspace", Toast.LENGTH_SHORT).show()
                    }
                )
            }
        }
    }
}

@Composable
fun ProjectItemCard(
    project: ResearchProjectRecord,
    onExportJson: () -> Unit,
    onOpen: () -> Unit
) {
    val statusColor = when (project.status) {
        "Active" -> Color(0xFF10B981)
        "Completed" -> Color(0xFF2563EB)
        else -> Color(0xFFF59E0B)
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
            // Header Row: Title & Status Badge
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = project.title,
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.Bold,
                            color = WebTextPrimary,
                            fontSize = 15.sp
                        )
                    )
                    Text(
                        text = "${project.id} • Created ${project.date}",
                        fontSize = 10.sp,
                        color = WebTextMuted,
                        fontFamily = FontFamily.Monospace
                    )
                }

                Surface(
                    color = statusColor.copy(alpha = 0.12f),
                    shape = RoundedCornerShape(6.dp),
                    border = BorderStroke(1.dp, statusColor.copy(alpha = 0.3f))
                ) {
                    Text(
                        text = project.status,
                        color = statusColor,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }
            }

            Text(
                text = project.description,
                style = MaterialTheme.typography.bodySmall.copy(
                    color = WebTextSecondary,
                    fontSize = 11.sp,
                    lineHeight = 15.sp
                )
            )

            // Chips: Target & Drug & Compounds Count
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    color = Color(0xFFEFF6FF),
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Text(
                        text = "Target: ${project.targetGene} (${project.pdbId})",
                        color = WebBlue,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                    )
                }
                Surface(
                    color = Color(0xFFCCFBF1),
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Text(
                        text = project.compoundName,
                        color = Color(0xFF0F766E),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                    )
                }
                Surface(
                    color = WebSurfaceSubtle,
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Text(
                        text = "${project.compoundsCount} Leads",
                        color = WebTextSecondary,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                    )
                }
            }

            Divider(color = WebBorder, thickness = 0.8.dp)

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedButton(
                    onClick = onExportJson,
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                    border = BorderStroke(1.dp, WebBorder)
                ) {
                    Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(13.dp), tint = WebNavy)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Export Session JSON", fontSize = 11.sp, color = WebNavy, fontWeight = FontWeight.Bold)
                }

                Button(
                    onClick = onOpen,
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = WebNavy),
                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
                ) {
                    Icon(Icons.Default.ArrowForward, contentDescription = null, modifier = Modifier.size(13.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Open Workspace", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
