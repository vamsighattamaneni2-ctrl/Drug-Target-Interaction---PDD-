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

data class GlobalSearchDiscoveryItem(
    val id: String,
    val source: String, // "NCBI", "PDB", "DrugBank", "ADMET"
    val title: String,
    val subtitle: String,
    val description: String,
    val badge: String,
    val metric: String
)

val GLOBAL_DATABASE_CATALOG = listOf(
    GlobalSearchDiscoveryItem("CHEMBL203", "NCBI", "EGFR (Epidermal Growth Factor Receptor)", "Gene ID: 1956 • Homo sapiens", "Receptor tyrosine kinase frequently amplified and mutated in non-small cell lung cancer (NSCLC). Primary target for reversible and covalent TKIs.", "Target", "28 Approved Drugs"),
    GlobalSearchDiscoveryItem("1IVO", "PDB", "Crystal Structure of EGFR Kinase Domain", "Resolution: 2.10 Å • X-ray Diffraction", "Atomic crystallographic model with active catalytic pocket conformation, suitable for Vina molecular docking.", "Structure", "Cavity Vol: 1420 Å³"),
    GlobalSearchDiscoveryItem("DB00619", "DrugBank", "Imatinib (Gleevec)", "Formula: C29H31N7O • MW: 493.6 Da", "2-Phenylaminopyrimidine ATP-competitive inhibitor stabilizing the inactive conformation of BCR-ABL1 kinase in chronic myeloid leukemia.", "Small Molecule", "LogP: 3.4 • HBD: 2"),
    GlobalSearchDiscoveryItem("CHEMBL205", "NCBI", "ESR1 (Estrogen Receptor Alpha)", "Gene ID: 2099 • Homo sapiens", "Nuclear receptor transcription factor driving estrogen-dependent gene transcription in mammary carcinoma.", "Target", "15 Approved Drugs"),
    GlobalSearchDiscoveryItem("1IEP", "PDB", "Structure of ABL Kinase with Imatinib", "Resolution: 2.10 Å • RCSB Archive", "Canonical co-crystal showing key hydrogen bond to Met318 and the Asp381-Phe382-Gly383 (DFG-out) state.", "Structure", "Cavity Vol: 1180 Å³"),
    GlobalSearchDiscoveryItem("DB04630", "DrugBank", "Gefitinib (Iressa)", "Formula: C22H24ClFN4O3 • MW: 446.9 Da", "First-generation anilinoquinazoline EGFR tyrosine kinase inhibitor targeting exon 19 deletions and L858R.", "Small Molecule", "LogP: 3.2 • HBD: 1"),
    GlobalSearchDiscoveryItem("ADMET-01", "ADMET", "Imatinib Pharmacokinetic Profile", "Oral Bioavailability: 98% • HIA: High", "Lipinski: Passed (0 violations) • BBB: Non-Penetrant • hERG Cardiotoxicity: Safe margin (>30-fold).", "ADMET Profile", "Safety: 94.5 / 100"),
    GlobalSearchDiscoveryItem("CHEMBL217", "NCBI", "ACE (Angiotensin-Converting Enzyme)", "Gene ID: 1636 • Homo sapiens", "Zinc metallopeptidase regulating vascular tone and arterial blood pressure via angiotensin II conversion.", "Target", "22 Approved Drugs")
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GlobalSearchScreen(onBack: () -> Unit) {
    val context = LocalContext.current

    var searchQuery by remember { mutableStateOf("") }
    var selectedSource by remember { mutableStateOf("ALL") }

    val sources = listOf("ALL", "NCBI", "PDB", "DrugBank", "ADMET")
    val suggestions = listOf("EGFR", "Imatinib", "1M17", "ESR1", "Tamoxifen", "1IEP")

    val filtered = remember(searchQuery, selectedSource) {
        GLOBAL_DATABASE_CATALOG.filter { item ->
            val matchesSource = selectedSource == "ALL" || item.source == selectedSource
            val matchesSearch = searchQuery.isBlank() ||
                    item.title.contains(searchQuery, ignoreCase = true) ||
                    item.subtitle.contains(searchQuery, ignoreCase = true) ||
                    item.description.contains(searchQuery, ignoreCase = true) ||
                    item.id.contains(searchQuery, ignoreCase = true)

            matchesSource && matchesSearch
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
                                .background(Brush.linearGradient(listOf(WebNavy, WebCyan))),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.TravelExplore, contentDescription = null, tint = Color.White, modifier = Modifier.size(18.dp))
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Text(
                                    text = "Global Discovery Search",
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
                                        text = "Cross-Database",
                                        color = WebBlue,
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                            }
                            Text(
                                text = "NCBI Gene • RCSB PDB • DrugBank • ADMET",
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
            // 1. Search Box with Suggestions
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = WebCard),
                    shape = RoundedCornerShape(12.dp),
                    border = BorderStroke(1.dp, WebBorder)
                ) {
                    Column(
                        modifier = Modifier.padding(14.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        OutlinedTextField(
                            value = searchQuery,
                            onValueChange = { searchQuery = it },
                            placeholder = { Text("Search targets, PDB coordinates, chemotypes, or ADMET profiles...", fontSize = 11.sp) },
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

                        // Suggestion Pills
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .horizontalScroll(rememberScrollState()),
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Try:", fontSize = 10.sp, color = WebTextMuted, fontWeight = FontWeight.Bold)
                            suggestions.forEach { sug ->
                                Surface(
                                    onClick = { searchQuery = sug },
                                    shape = RoundedCornerShape(6.dp),
                                    color = WebSurfaceSubtle
                                ) {
                                    Text(
                                        text = sug,
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = WebNavy,
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                    )
                                }
                            }
                        }

                        // Source Tabs
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .horizontalScroll(rememberScrollState()),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            sources.forEach { src ->
                                FilterChip(
                                    selected = selectedSource == src,
                                    onClick = { selectedSource = src },
                                    label = { Text(src, fontSize = 11.sp, fontWeight = FontWeight.SemiBold) },
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

            // 2. Results Header
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Discovery Entries (${filtered.size})",
                        style = MaterialTheme.typography.titleSmall.copy(
                            fontWeight = FontWeight.Bold,
                            color = WebTextPrimary
                        )
                    )
                    Text(
                        text = "Unified Knowledge Graph",
                        fontSize = 10.sp,
                        color = WebTextMuted
                    )
                }
            }

            // 3. Search Results List
            items(filtered) { item ->
                GlobalSearchResultCard(
                    item = item,
                    onInspect = {
                        Toast.makeText(context, "Inspecting ${item.title} (${item.source})", Toast.LENGTH_SHORT).show()
                    }
                )
            }
        }
    }
}

@Composable
fun GlobalSearchResultCard(
    item: GlobalSearchDiscoveryItem,
    onInspect: () -> Unit
) {
    val sourceColor = when (item.source) {
        "NCBI" -> WebTeal
        "PDB" -> Color(0xFF2563EB)
        "DrugBank" -> WebNavy
        else -> Color(0xFF059669)
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
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Surface(
                        color = sourceColor.copy(alpha = 0.12f),
                        shape = RoundedCornerShape(6.dp),
                        border = BorderStroke(1.dp, sourceColor.copy(alpha = 0.3f))
                    ) {
                        Text(
                            text = item.source,
                            color = sourceColor,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.ExtraBold,
                            fontFamily = FontFamily.Monospace,
                            modifier = Modifier.padding(horizontal = 7.dp, vertical = 3.dp)
                        )
                    }

                    Surface(
                        color = WebSurfaceSubtle,
                        shape = RoundedCornerShape(4.dp)
                    ) {
                        Text(
                            text = item.id,
                            fontSize = 10.sp,
                            fontFamily = FontFamily.Monospace,
                            color = WebTextSecondary,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }

                Surface(
                    color = Color(0xFFF1F5F9),
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Text(
                        text = item.metric,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = WebNavy,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }
            }

            Column {
                Text(
                    text = item.title,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = WebTextPrimary
                )
                Text(
                    text = item.subtitle,
                    fontSize = 10.sp,
                    color = WebTextSecondary,
                    fontFamily = FontFamily.Monospace
                )
            }

            Text(
                text = item.description,
                fontSize = 11.sp,
                color = WebTextSecondary,
                lineHeight = 15.sp
            )

            Divider(color = WebBorder, thickness = 0.8.dp)

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    color = Color(0xFFF8FAFC),
                    shape = RoundedCornerShape(4.dp)
                ) {
                    Text(
                        text = "Type: ${item.badge}",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = WebTextMuted,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }

                Button(
                    onClick = onInspect,
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = WebNavy),
                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
                ) {
                    Icon(Icons.Default.ArrowForward, contentDescription = null, modifier = Modifier.size(13.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Explore Record", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
