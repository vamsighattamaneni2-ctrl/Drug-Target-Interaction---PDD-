package com.drugtarget.discovery.ui.screens

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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.drugtarget.discovery.ui.theme.*
import com.drugtarget.discovery.ui.viewmodel.DiscoveryViewModel
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    viewModel: DiscoveryViewModel,
    onBack: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val scrollState = rememberScrollState()
    val coroutineScope = rememberCoroutineScope()

    var backendUrl by remember { mutableStateOf("http://10.0.2.2:8000") }
    var notificationsEnabled by remember { mutableStateOf(true) }
    var autoSync by remember { mutableStateOf(true) }

    Scaffold(
        containerColor = WebBackground,
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("Platform Settings", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = WebTextPrimary)
                        Text("Backend Configuration & Preferences", fontSize = 10.sp, color = WebTextMuted)
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
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(scrollState)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Backend Configuration Card
            Card(
                colors = CardDefaults.cardColors(containerColor = WebCard),
                shape = RoundedCornerShape(16.dp),
                border = BorderStroke(1.dp, WebBorder)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Cloud, contentDescription = null, tint = WebNavy)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Backend API Configuration", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = WebTextPrimary)
                    }

                    OutlinedTextField(
                        value = backendUrl,
                        onValueChange = { backendUrl = it },
                        label = { Text("API Base URL") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(10.dp)
                                    .background(
                                        if (uiState.isBackendOnline == true) WebEmerald else WebAmber,
                                        shape = RoundedCornerShape(5.dp)
                                    )
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                if (uiState.isBackendOnline == true) "Status: Online (Connected)" else "Status: Offline / Simulation Mode",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Medium,
                                color = WebTextSecondary
                            )
                        }

                        Button(
                            onClick = { viewModel.checkBackendHealth() },
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = WebTeal)
                        ) {
                            Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Test", fontSize = 11.sp)
                        }
                    }
                }
            }

            // Preferences Card
            Card(
                colors = CardDefaults.cardColors(containerColor = WebCard),
                shape = RoundedCornerShape(16.dp),
                border = BorderStroke(1.dp, WebBorder)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    Text("Workspace Preferences", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = WebTextPrimary)

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Push Notifications", fontWeight = FontWeight.Medium, fontSize = 14.sp, color = WebTextPrimary)
                            Text("Notify when batch screening or docking completes", fontSize = 11.sp, color = WebTextMuted)
                        }
                        Switch(checked = notificationsEnabled, onCheckedChange = { notificationsEnabled = it })
                    }

                    HorizontalDivider(color = WebBorder)

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Cloud Auto-Sync", fontWeight = FontWeight.Medium, fontSize = 14.sp, color = WebTextPrimary)
                            Text("Sync research projects and session logs automatically", fontSize = 11.sp, color = WebTextMuted)
                        }
                        Switch(checked = autoSync, onCheckedChange = { autoSync = it })
                    }
                }
            }

            // App Info Card
            Card(
                colors = CardDefaults.cardColors(containerColor = WebCard),
                shape = RoundedCornerShape(16.dp),
                border = BorderStroke(1.dp, WebBorder)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("About Platform", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = WebTextPrimary)
                    Text("Drug–Target Interaction Analysis Platform", fontSize = 13.sp, color = WebTextSecondary)
                    Text("Version 2.4 (Build 240)", fontSize = 11.sp, color = WebTextMuted)
                    Text("Engine: Jetpack Compose + PyTorch / AutoDock Vina", fontSize = 11.sp, color = WebTextMuted)
                }
            }
        }
    }
}
