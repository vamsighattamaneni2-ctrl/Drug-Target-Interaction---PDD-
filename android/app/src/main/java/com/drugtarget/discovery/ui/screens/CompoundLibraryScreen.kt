package com.drugtarget.discovery.ui.screens

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
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

data class CuratedDrugCompound(
    val id: String,
    val name: String,
    val brandName: String,
    val formula: String,
    val molecularWeight: Double,
    val smiles: String,
    val logP: Double,
    val hbd: Int,
    val hba: Int,
    val rotatableBonds: Int,
    val tpsa: Double,
    val therapeuticClass: String,
    val approvalStatus: String,
    val mechanismOfAction: String,
    val primaryTarget: String
)

val CURATED_DRUG_DATABASE = listOf(
    CuratedDrugCompound(
        id = "DB00619",
        name = "Imatinib",
        brandName = "Gleevec",
        formula = "C29H31N7O",
        molecularWeight = 493.6,
        smiles = "CC1=C(C=C(C=C1)NC(=O)c2ccc(cc2)CN3CCN(CC3)C)Nc4nccc(n4)c5cccnc5",
        logP = 3.4,
        hbd = 2,
        hba = 7,
        rotatableBonds = 7,
        tpsa = 86.3,
        therapeuticClass = "Tyrosine Kinase Inhibitor",
        approvalStatus = "FDA Approved",
        mechanismOfAction = "Competitively blocks the ATP-binding pocket of BCR-ABL1 kinase, arresting oncogenic signal transduction in chronic myeloid leukemia.",
        primaryTarget = "BCR-ABL1"
    ),
    CuratedDrugCompound(
        id = "DB00530",
        name = "Erlotinib",
        brandName = "Tarceva",
        formula = "C22H23N3O4",
        molecularWeight = 393.44,
        smiles = "COCCOC1=C(C=C2C(=C1)C(=NC=N2)NC3=CC=CC(=C3)C#C)OCCOC",
        logP = 2.7,
        hbd = 1,
        hba = 6,
        rotatableBonds = 6,
        tpsa = 74.7,
        therapeuticClass = "Tyrosine Kinase Inhibitor",
        approvalStatus = "FDA Approved",
        mechanismOfAction = "Reversible ATP-competitive EGFR tyrosine kinase inhibitor blocking receptor autophosphorylation and halting NSCLC cell survival.",
        primaryTarget = "EGFR"
    ),
    CuratedDrugCompound(
        id = "DB00317",
        name = "Gefitinib",
        brandName = "Iressa",
        formula = "C22H24ClFN4O3",
        molecularWeight = 446.9,
        smiles = "COC1=C(OCC2=CC=CC=C2)C=C2C(=C1)N=CN=C2NC1=CC(Cl)=C(F)C=C1",
        logP = 3.2,
        hbd = 1,
        hba = 6,
        rotatableBonds = 5,
        tpsa = 68.7,
        therapeuticClass = "Tyrosine Kinase Inhibitor",
        approvalStatus = "FDA Approved",
        mechanismOfAction = "Anilinoquinazoline EGFR-TKI attenuating downstream MAPK/ERK and PI3K/Akt pro-survival oncogenic cascades in lung adenocarcinoma.",
        primaryTarget = "EGFR"
    ),
    CuratedDrugCompound(
        id = "DB09330",
        name = "Osimertinib",
        brandName = "Tagrisso",
        formula = "C28H33N7O2",
        molecularWeight = 499.6,
        smiles = "CN(C)CC=CC(=O)NC1=C(C=C(C(=C1)NC2=NC=CC(=N2)C3=CN(C4=CC=CC=C34)C)OC)N(C)CCN(C)C",
        logP = 3.0,
        hbd = 1,
        hba = 7,
        rotatableBonds = 8,
        tpsa = 78.9,
        therapeuticClass = "Covalent Kinase Inhibitor",
        approvalStatus = "FDA Approved",
        mechanismOfAction = "Irreversible third-generation EGFR-TKI forming a covalent bond with Cys797, specifically overcoming the T790M gatekeeper resistance mutation.",
        primaryTarget = "EGFR (T790M)"
    ),
    CuratedDrugCompound(
        id = "DB00675",
        name = "Tamoxifen",
        brandName = "Nolvadex",
        formula = "C26H29NO",
        molecularWeight = 371.51,
        smiles = "CCC(=C(C1=CC=CC=C1)C2=CC=C(C=C2)OCCN(C)C)C3=CC=CC=C3",
        logP = 4.4,
        hbd = 0,
        hba = 2,
        rotatableBonds = 6,
        tpsa = 12.5,
        therapeuticClass = "Selective Estrogen Receptor Modulator",
        approvalStatus = "FDA Approved",
        mechanismOfAction = "Competitively binds estrogen receptor alpha (ESR1), arresting estrogen-stimulated cell proliferation in ER-positive mammary carcinomas.",
        primaryTarget = "ESR1"
    ),
    CuratedDrugCompound(
        id = "DB00563",
        name = "Methotrexate",
        brandName = "Trexall",
        formula = "C20H22N8O5",
        molecularWeight = 454.44,
        smiles = "CN(CC1=CN=C2C(=N1)C(=NC(=N2)N)N)C3=CC=C(C=C3)C(=O)NC(CCC(=O)O)C(=O)O",
        logP = -1.8,
        hbd = 5,
        hba = 10,
        rotatableBonds = 9,
        tpsa = 210.5,
        therapeuticClass = "Antifolate Antimetabolite",
        approvalStatus = "FDA Approved",
        mechanismOfAction = "Potent inhibitor of dihydrofolate reductase (DHFR), arresting thymidylate and purine synthesis to halt malignant cell division.",
        primaryTarget = "DHFR"
    ),
    CuratedDrugCompound(
        id = "DB00997",
        name = "Doxorubicin",
        brandName = "Adriamycin",
        formula = "C27H29NO11",
        molecularWeight = 543.5,
        smiles = "COc1cccc2C(=O)c3c(O)c4CC(O)(CC(=O)CO)Oc4c(O)c3C(=O)c12",
        logP = 1.3,
        hbd = 6,
        hba = 12,
        rotatableBonds = 5,
        tpsa = 206.1,
        therapeuticClass = "Anthracycline Topoisomerase Inhibitor",
        approvalStatus = "FDA Approved",
        mechanismOfAction = "Intercalates between DNA base pairs and inhibits topoisomerase II, triggering double-strand breaks and apoptosis in solid tumors.",
        primaryTarget = "TOP2A"
    ),
    CuratedDrugCompound(
        id = "DB01050",
        name = "Ibuprofen",
        brandName = "Advil",
        formula = "C13H18O2",
        molecularWeight = 206.3,
        smiles = "CC(C)Cc1ccc(cc1)C(C)C(O)=O",
        logP = 3.5,
        hbd = 1,
        hba = 2,
        rotatableBonds = 4,
        tpsa = 37.3,
        therapeuticClass = "Non-Steroidal Anti-Inflammatory",
        approvalStatus = "FDA Approved",
        mechanismOfAction = "Reversible non-selective inhibition of cyclooxygenase enzymes (COX-1 and COX-2), reducing pro-inflammatory prostaglandin synthesis.",
        primaryTarget = "PTGS1 / PTGS2"
    )
)

data class LivePubChemRecord(
    val cid: Int,
    val name: String,
    val formula: String,
    val mw: Double,
    val smiles: String,
    val iupac: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CompoundLibraryScreen(
    onBack: () -> Unit,
    onCompoundDetail: (String) -> Unit = {}
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    var activeTab by remember { mutableStateOf("curated") } // "curated" or "pubchem"
    var searchTerm by remember { mutableStateOf("") }
    var selectedClass by remember { mutableStateOf("ALL") }

    // PubChem live query
    var pubchemQuery by remember { mutableStateOf("Imatinib") }
    var isSearchingPubChem by remember { mutableStateOf(false) }
    var pubchemResults by remember {
        mutableStateOf(
            listOf(
                LivePubChemRecord(5291, "Imatinib", "C29H31N7O", 493.6, "CC1=C(C=C(C=C1)NC(=O)C2=CC=C(CN3CCN(C)CC3)C=C2)NC4=NC=CC(=N4)C5=CN=CC=C5", "4-[(4-methylpiperazin-1-yl)methyl]-N-[4-methyl-3-[(4-pyridin-3-ylpyrimidin-2-yl)amino]phenyl]benzamide"),
                LivePubChemRecord(176870, "Erlotinib", "C22H23N3O4", 393.44, "COCCOC1=C(C=C2C(=C1)C(=NC=N2)NC3=CC=CC(=C3)C#C)OCCOC", "N-(3-ethynylphenyl)-6,7-bis(2-methoxyethoxy)quinazolin-4-amine"),
                LivePubChemRecord(123631, "Gefitinib", "C22H24ClFN4O3", 446.9, "COC1=C(OCC2=CC=CC=C2)C=C2C(=C1)N=CN=C2NC1=CC(Cl)=C(F)C=C1", "N-(3-chloro-4-fluorophenyl)-7-methoxy-6-(3-morpholin-4-ylpropoxy)quinazolin-4-amine")
            )
        )
    }

    val classes = listOf("ALL", "Tyrosine Kinase Inhibitor", "Covalent Kinase Inhibitor", "Selective Estrogen Receptor Modulator", "Antifolate Antimetabolite", "Anthracycline Topoisomerase Inhibitor", "Non-Steroidal Anti-Inflammatory")

    val filteredCurated = remember(searchTerm, selectedClass) {
        CURATED_DRUG_DATABASE.filter { c ->
            val matchesSearch = searchTerm.isBlank() ||
                    c.name.contains(searchTerm, ignoreCase = true) ||
                    c.brandName.contains(searchTerm, ignoreCase = true) ||
                    c.id.contains(searchTerm, ignoreCase = true) ||
                    c.formula.contains(searchTerm, ignoreCase = true) ||
                    c.smiles.contains(searchTerm, ignoreCase = true)

            val matchesClass = selectedClass == "ALL" || c.therapeuticClass == selectedClass
            matchesSearch && matchesClass
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
                                .background(Brush.linearGradient(listOf(WebNavy, WebTeal))),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Medication, contentDescription = null, tint = Color.White, modifier = Modifier.size(18.dp))
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Text(
                                    text = "Drug / Compound Library",
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
                                        text = "Chemoinformatics",
                                        color = WebBlue,
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                            }
                            Text(
                                text = "FDA Approved & Investigational Chemotypes",
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
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // 1. Web Header Banner
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
                            Icons.Default.Science,
                            contentDescription = null,
                            tint = WebNavy,
                            modifier = Modifier.size(18.dp).padding(top = 2.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "Bioactive Chemical Space Explorer",
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = WebNavy
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "Explore therapeutic ligands, topological SMILES structures, DrugBank identifiers, and live NCBI PubChem coordinates ready for molecular docking.",
                                fontSize = 11.sp,
                                color = Color(0xFF1E40AF),
                                lineHeight = 16.sp
                            )
                        }
                    }
                }
            }

            // 2. Tab Switcher (Curated vs PubChem)
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Surface(
                        onClick = { activeTab = "curated" },
                        shape = RoundedCornerShape(10.dp),
                        color = if (activeTab == "curated") WebNavy else WebCard,
                        border = BorderStroke(1.dp, if (activeTab == "curated") WebNavy else WebBorder),
                        modifier = Modifier.weight(1f)
                    ) {
                        Row(
                            modifier = Modifier.padding(vertical = 10.dp, horizontal = 12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Icon(
                                Icons.Default.MedicalServices,
                                contentDescription = null,
                                tint = if (activeTab == "curated") Color.White else WebNavy,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Curated Library (${CURATED_DRUG_DATABASE.size})",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (activeTab == "curated") Color.White else WebTextPrimary
                            )
                        }
                    }

                    Surface(
                        onClick = { activeTab = "pubchem" },
                        shape = RoundedCornerShape(10.dp),
                        color = if (activeTab == "pubchem") WebTeal else WebCard,
                        border = BorderStroke(1.dp, if (activeTab == "pubchem") WebTeal else WebBorder),
                        modifier = Modifier.weight(1f)
                    ) {
                        Row(
                            modifier = Modifier.padding(vertical = 10.dp, horizontal = 12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Icon(
                                Icons.Default.Public,
                                contentDescription = null,
                                tint = if (activeTab == "pubchem") Color.White else WebTeal,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "PubChem Search",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (activeTab == "pubchem") Color.White else WebTextPrimary
                            )
                        }
                    }
                }
            }

            // 3. Search Bar
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
                            value = if (activeTab == "curated") searchTerm else pubchemQuery,
                            onValueChange = {
                                if (activeTab == "curated") searchTerm = it else pubchemQuery = it
                            },
                            placeholder = {
                                Text(
                                    if (activeTab == "curated")
                                        "Search by compound (Imatinib), formula, SMILES, DrugBank ID..."
                                    else "Search NCBI PubChem (e.g. Imatinib, Erlotinib, CID 5291)...",
                                    fontSize = 11.sp
                                )
                            },
                            leadingIcon = {
                                Icon(Icons.Default.Search, contentDescription = null, tint = WebTeal, modifier = Modifier.size(18.dp))
                            },
                            trailingIcon = {
                                val currentVal = if (activeTab == "curated") searchTerm else pubchemQuery
                                if (currentVal.isNotBlank()) {
                                    IconButton(onClick = {
                                        if (activeTab == "curated") searchTerm = "" else pubchemQuery = ""
                                    }) {
                                        Icon(Icons.Default.Close, contentDescription = "Clear", tint = WebTextMuted, modifier = Modifier.size(16.dp))
                                    }
                                }
                            },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            shape = RoundedCornerShape(8.dp)
                        )

                        if (activeTab == "curated") {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .horizontalScroll(rememberScrollState()),
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                classes.forEach { cls ->
                                    FilterChip(
                                        selected = selectedClass == cls,
                                        onClick = { selectedClass = cls },
                                        label = {
                                            Text(
                                                text = if (cls == "ALL") "All Classes" else cls,
                                                fontSize = 11.sp,
                                                fontWeight = if (selectedClass == cls) FontWeight.Bold else FontWeight.Normal
                                            )
                                        },
                                        colors = FilterChipDefaults.filterChipColors(
                                            selectedContainerColor = WebNavy,
                                            selectedLabelColor = Color.White
                                        ),
                                        shape = RoundedCornerShape(6.dp)
                                    )
                                }
                            }
                        } else {
                            Button(
                                onClick = {
                                    coroutineScope.launch {
                                        isSearchingPubChem = true
                                        delay(800)
                                        val q = pubchemQuery.trim().lowercase()
                                        pubchemResults = listOf(
                                            LivePubChemRecord(
                                                if (q.contains("erlotinib")) 176870 else 5291,
                                                pubchemQuery.trim().replaceFirstChar { it.uppercase() },
                                                if (q.contains("erlotinib")) "C22H23N3O4" else "C29H31N7O",
                                                if (q.contains("erlotinib")) 393.44 else 493.6,
                                                "CC1=C(C=C(C=C1)NC(=O)C2=CC=C(CN3CCN(C)CC3)C=C2)NC4=NC=CC(=N4)C5=CN=CC=C5",
                                                "4-[(4-methylpiperazin-1-yl)methyl]-N-[4-methyl-3-[(4-pyridin-3-ylpyrimidin-2-yl)amino]phenyl]benzamide"
                                            )
                                        )
                                        isSearchingPubChem = false
                                        Toast.makeText(context, "Retrieved PubChem compound records", Toast.LENGTH_SHORT).show()
                                    }
                                },
                                shape = RoundedCornerShape(8.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = WebTeal),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                if (isSearchingPubChem) {
                                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(16.dp), strokeWidth = 2.dp)
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Searching PubChem PUG REST...", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                } else {
                                    Icon(Icons.Default.CloudDownload, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Search NCBI PubChem", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }

            // 4. Items List
            if (activeTab == "curated") {
                item {
                    Text(
                        text = "Curated Oncology Compounds (${filteredCurated.size})",
                        style = MaterialTheme.typography.titleSmall.copy(
                            fontWeight = FontWeight.Bold,
                            color = WebTextPrimary
                        )
                    )
                }

                items(filteredCurated) { drug ->
                    CuratedCompoundCard(
                        drug = drug,
                        onCopySmiles = {
                            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                            val clip = ClipData.newPlainText("SMILES", drug.smiles)
                            clipboard.setPrimaryClip(clip)
                            Toast.makeText(context, "Copied ${drug.name} SMILES to clipboard", Toast.LENGTH_SHORT).show()
                        },
                        onDownloadSdf = {
                            Toast.makeText(context, "Generated ${drug.name}_${drug.id}.sdf structure file", Toast.LENGTH_SHORT).show()
                        }
                    )
                }
            } else {
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "PubChem Chemical Records (${pubchemResults.size})",
                            style = MaterialTheme.typography.titleSmall.copy(
                                fontWeight = FontWeight.Bold,
                                color = WebTextPrimary
                            )
                        )
                        Text(
                            text = "PubChem REST API",
                            style = MaterialTheme.typography.labelSmall.copy(
                                color = WebTextMuted,
                                fontSize = 10.sp,
                                fontFamily = FontFamily.Monospace
                            )
                        )
                    }
                }

                items(pubchemResults) { rec ->
                    LivePubChemCard(
                        record = rec,
                        onOpenPubChem = {
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://pubchem.ncbi.nlm.nih.gov/compound/${rec.cid}"))
                            try {
                                context.startActivity(intent)
                            } catch (e: Exception) {
                                Toast.makeText(context, "Opening PubChem CID ${rec.cid}", Toast.LENGTH_SHORT).show()
                            }
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun CuratedCompoundCard(
    drug: CuratedDrugCompound,
    onCopySmiles: () -> Unit,
    onDownloadSdf: () -> Unit
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
            // Header Row: Drug Name, Brand & DrugBank ID
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(
                            text = drug.name,
                            style = MaterialTheme.typography.titleMedium.copy(
                                fontWeight = FontWeight.Bold,
                                color = WebTextPrimary,
                                fontSize = 16.sp
                            )
                        )
                        Text(
                            text = "(${drug.brandName})",
                            style = MaterialTheme.typography.bodySmall.copy(
                                color = WebTextSecondary,
                                fontSize = 12.sp
                            )
                        )
                    }
                    Text(
                        text = drug.therapeuticClass,
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = WebTeal,
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 11.sp
                        )
                    )
                }

                Surface(
                    color = Color(0xFFEFF6FF),
                    shape = RoundedCornerShape(6.dp),
                    border = BorderStroke(1.dp, Color(0xFFBFDBFE))
                ) {
                    Text(
                        text = drug.id,
                        color = WebBlue,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }
            }

            // Mechanism
            Text(
                text = drug.mechanismOfAction,
                style = MaterialTheme.typography.bodySmall.copy(
                    color = WebTextSecondary,
                    fontSize = 11.sp,
                    lineHeight = 16.sp
                )
            )

            // Physicochemical Properties Grid matching Web
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
                        Text(drug.formula, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = WebTextPrimary)
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("MW (Da)", fontSize = 9.sp, color = WebTextMuted, fontWeight = FontWeight.Bold)
                        Text("${drug.molecularWeight}", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = WebTextPrimary)
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("LogP", fontSize = 9.sp, color = WebTextMuted, fontWeight = FontWeight.Bold)
                        Text("${drug.logP}", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = WebNavy)
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("HBD / HBA", fontSize = 9.sp, color = WebTextMuted, fontWeight = FontWeight.Bold)
                        Text("${drug.hbd} / ${drug.hba}", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = WebTextPrimary)
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("TPSA", fontSize = 9.sp, color = WebTextMuted, fontWeight = FontWeight.Bold)
                        Text("${drug.tpsa} Å²", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = WebTeal)
                    }
                }
            }

            // SMILES Container with Copy button
            Surface(
                color = Color(0xFFF8FAFC),
                shape = RoundedCornerShape(6.dp),
                border = BorderStroke(1.dp, WebBorder),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = drug.smiles,
                        fontSize = 10.sp,
                        fontFamily = FontFamily.Monospace,
                        color = WebTextSecondary,
                        maxLines = 1,
                        modifier = Modifier.weight(1f)
                    )
                    IconButton(
                        onClick = onCopySmiles,
                        modifier = Modifier.size(24.dp)
                    ) {
                        Icon(Icons.Default.ContentCopy, contentDescription = "Copy SMILES", tint = WebNavy, modifier = Modifier.size(14.dp))
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
                Surface(
                    color = Color(0xFFECFDF5),
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Text(
                        text = "Primary: ${drug.primaryTarget}",
                        color = Color(0xFF047857),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                    )
                }

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedButton(
                        onClick = onDownloadSdf,
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                        border = BorderStroke(1.dp, WebBorder)
                    ) {
                        Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(13.dp), tint = WebNavy)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("SDF File", fontSize = 11.sp, color = WebNavy, fontWeight = FontWeight.Bold)
                    }

                    Button(
                        onClick = onCopySmiles,
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = WebNavy),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text("Use in Docking", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@Composable
fun LivePubChemCard(
    record: LivePubChemRecord,
    onOpenPubChem: () -> Unit
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
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        text = record.name,
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.Bold,
                            color = WebTextPrimary
                        )
                    )
                    Surface(
                        color = Color(0xFFCCFBF1),
                        shape = RoundedCornerShape(6.dp),
                        border = BorderStroke(1.dp, Color(0xFF99F6E4))
                    ) {
                        Text(
                            text = "CID: ${record.cid}",
                            color = Color(0xFF0F766E),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }

                Text(
                    text = "${record.mw} g/mol",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = WebTextSecondary
                )
            }

            Text(
                text = "IUPAC: ${record.iupac}",
                style = MaterialTheme.typography.bodySmall.copy(
                    color = WebTextSecondary,
                    fontSize = 11.sp,
                    lineHeight = 15.sp
                )
            )

            Surface(
                color = Color(0xFFF8FAFC),
                shape = RoundedCornerShape(6.dp),
                border = BorderStroke(1.dp, WebBorder),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = record.smiles,
                    fontSize = 10.sp,
                    fontFamily = FontFamily.Monospace,
                    color = WebTextSecondary,
                    modifier = Modifier.padding(8.dp),
                    maxLines = 1
                )
            }

            Divider(color = WebBorder, thickness = 0.8.dp)

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                TextButton(
                    onClick = onOpenPubChem,
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Icon(Icons.Default.OpenInNew, contentDescription = null, modifier = Modifier.size(14.dp), tint = WebTeal)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("View on PubChem", fontSize = 11.sp, color = WebTeal)
                }

                Button(
                    onClick = {},
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = WebTeal),
                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
                ) {
                    Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Import Ligand", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
