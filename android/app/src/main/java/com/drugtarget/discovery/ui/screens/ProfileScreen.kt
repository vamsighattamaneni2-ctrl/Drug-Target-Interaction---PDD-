package com.drugtarget.discovery.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.drugtarget.discovery.ui.theme.*
import com.drugtarget.discovery.ui.viewmodel.DiscoveryViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    viewModel: DiscoveryViewModel,
    onBack: () -> Unit,
    onSignOut: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val user = uiState.currentUser
    val scrollState = rememberScrollState()

    var name by remember { mutableStateOf(user.name.ifBlank { "Dr. Vamsi Ghattamaneni" }) }
    var email by remember { mutableStateOf(user.email.ifBlank { "vamsi@theratarget.org" }) }
    var role by remember { mutableStateOf(user.role.ifBlank { "Lead Computational Oncologist" }) }
    var institution by remember { mutableStateOf(user.institution.ifBlank { "Therapeutic Discovery Institute" }) }

    Scaffold(
        containerColor = WebBackground,
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("User Profile & Account", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = WebTextPrimary)
                        Text("Research Credentials & Workspace", fontSize = 10.sp, color = WebTextMuted)
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
            verticalArrangement = Arrangement.spacedBy(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Avatar Header
            Box(
                modifier = Modifier
                    .size(80.dp)
                    .clip(CircleShape)
                    .background(WebNavy),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = user.avatarInitials.ifBlank { "VG" },
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }

            Text(name, fontWeight = FontWeight.Bold, fontSize = 20.sp, color = WebTextPrimary)
            Text(role, fontSize = 13.sp, color = WebTextSecondary)

            // Stats row
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Card(modifier = Modifier.weight(1f), colors = CardDefaults.cardColors(containerColor = WebCard), border = BorderStroke(1.dp, WebBorder)) {
                    Column(modifier = Modifier.padding(12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("34", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = WebNavy)
                        Text("Analyses", fontSize = 11.sp, color = WebTextMuted)
                    }
                }
                Card(modifier = Modifier.weight(1f), colors = CardDefaults.cardColors(containerColor = WebCard), border = BorderStroke(1.dp, WebBorder)) {
                    Column(modifier = Modifier.padding(12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("8", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = WebTeal)
                        Text("Projects", fontSize = 11.sp, color = WebTextMuted)
                    }
                }
                Card(modifier = Modifier.weight(1f), colors = CardDefaults.cardColors(containerColor = WebCard), border = BorderStroke(1.dp, WebBorder)) {
                    Column(modifier = Modifier.padding(12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("128", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = WebBlue)
                        Text("Compounds", fontSize = 11.sp, color = WebTextMuted)
                    }
                }
            }

            // Edit Form Card
            Card(
                colors = CardDefaults.cardColors(containerColor = WebCard),
                shape = RoundedCornerShape(16.dp),
                border = BorderStroke(1.dp, WebBorder),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    Text("Credentials & Affiliation", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = WebTextPrimary)

                    OutlinedTextField(
                        value = name,
                        onValueChange = { name = it },
                        label = { Text("Full Name") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )

                    OutlinedTextField(
                        value = email,
                        onValueChange = { email = it },
                        label = { Text("Email Address") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )

                    OutlinedTextField(
                        value = role,
                        onValueChange = { role = it },
                        label = { Text("Research Role") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )

                    OutlinedTextField(
                        value = institution,
                        onValueChange = { institution = it },
                        label = { Text("Institution / Organization") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )

                    Button(
                        onClick = {
                            viewModel.updateProfile(name, email, role, institution)
                        },
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = WebNavy),
                        modifier = Modifier.fillMaxWidth().height(48.dp)
                    ) {
                        Text("Save Profile Changes", fontWeight = FontWeight.Bold, color = Color.White)
                    }
                }
            }

            // Sign Out Button
            OutlinedButton(
                onClick = {
                    viewModel.signOut()
                    onSignOut()
                },
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = WebRose),
                border = BorderStroke(1.dp, WebRose),
                modifier = Modifier.fillMaxWidth().height(48.dp)
            ) {
                Icon(Icons.Default.Logout, contentDescription = null, tint = WebRose)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Sign Out of Workspace", fontWeight = FontWeight.Bold)
            }
        }
    }
}
