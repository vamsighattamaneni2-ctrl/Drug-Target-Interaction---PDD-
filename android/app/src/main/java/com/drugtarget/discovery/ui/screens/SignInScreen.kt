package com.drugtarget.discovery.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.drugtarget.discovery.ui.theme.*
import com.drugtarget.discovery.ui.viewmodel.DiscoveryViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SignInScreen(
    viewModel: DiscoveryViewModel,
    onNavigateToDashboard: () -> Unit
) {
    var mode by remember { mutableStateOf("signin") } // "signin" or "signup"
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var showPassword by remember { mutableStateOf(false) }
    var fullName by remember { mutableStateOf("") }
    var institution by remember { mutableStateOf("") }
    var role by remember { mutableStateOf("") }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var showForgotPasswordDialog by remember { mutableStateOf(false) }

    // Welcome popup state
    var showSuccessModal by remember { mutableStateOf(false) }
    var authenticatedName by remember { mutableStateOf("") }

    val scrollState = rememberScrollState()

    Scaffold(
        containerColor = WebBackground
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(scrollState)
                    .padding(horizontal = 20.dp, vertical = 24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(20.dp)
            ) {
                // Brand Header
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(top = 8.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(
                                Brush.linearGradient(
                                    listOf(WebNavy, WebTeal)
                                )
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Science,
                            contentDescription = "Logo",
                            tint = Color.White,
                            modifier = Modifier.size(24.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(12.dp))

                    Column {
                        Text(
                            text = "Drug–Target Analysis",
                            style = MaterialTheme.typography.titleLarge.copy(
                                fontWeight = FontWeight.ExtraBold,
                                color = WebTextPrimary,
                                fontSize = 20.sp
                            )
                        )
                        Text(
                            text = "Therapeutic Discovery Platform v2.4",
                            style = MaterialTheme.typography.labelSmall.copy(
                                color = WebTextSecondary,
                                fontSize = 11.sp
                            )
                        )
                    }
                }

                // Scientific Banner Card
                Card(
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = HeroDark),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier
                            .background(
                                Brush.verticalGradient(
                                    listOf(HeroDark, HeroDarkVariant)
                                )
                            )
                            .padding(18.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Surface(
                            color = WebTeal.copy(alpha = 0.2f),
                            shape = RoundedCornerShape(16.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, WebTeal.copy(alpha = 0.4f))
                        ) {
                            Text(
                                text = "Bioinformatics & Pharmacology Studio",
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                                fontSize = 10.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Color(0xFF5EEAD4)
                            )
                        }

                        Text(
                            text = "Discover Better Therapeutic Candidates",
                            style = MaterialTheme.typography.titleMedium.copy(
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        )

                        Text(
                            text = "Secure institutional workspace supporting computational biophysics, molecular docking simulations, and pharmacological evidence.",
                            style = MaterialTheme.typography.bodySmall.copy(
                                color = Color(0xFFE2E8F0),
                                fontSize = 11.sp,
                                lineHeight = 16.sp
                            )
                        )
                    }
                }

                // Authentication Form Card
                Card(
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = WebCard),
                    border = androidx.compose.foundation.BorderStroke(1.dp, WebBorder),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        // Title for current mode
                        Text(
                            text = if (mode == "signin") "Sign In to Workspace" else "Create Research Account",
                            style = MaterialTheme.typography.titleMedium.copy(
                                fontWeight = FontWeight.Bold,
                                color = WebTextPrimary
                            )
                        )

                        // Error Banner
                        errorMessage?.let { error ->
                            Surface(
                                color = Color(0xFFFFF1F2),
                                shape = RoundedCornerShape(10.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFFECDD3)),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text(
                                    text = error,
                                    color = Color(0xFFBE123C),
                                    fontSize = 11.sp,
                                    modifier = Modifier.padding(10.dp)
                                )
                            }
                        }

                        // Full Name (Registration only)
                        if (mode == "signup") {
                            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                Text(
                                    text = "Full Scientific Name & Title",
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        fontWeight = FontWeight.Bold,
                                        color = WebTextPrimary
                                    )
                                )
                                OutlinedTextField(
                                    value = fullName,
                                    onValueChange = { fullName = it },
                                    modifier = Modifier.fillMaxWidth(),
                                    placeholder = { Text("e.g. Dr. Jane Smith, Ph.D.", fontSize = 12.sp) },
                                    shape = RoundedCornerShape(10.dp),
                                    singleLine = true,
                                    leadingIcon = {
                                        Icon(Icons.Default.Person, contentDescription = null, tint = WebTextMuted, modifier = Modifier.size(18.dp))
                                    }
                                )
                            }
                        }

                        // Email Field
                        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text(
                                text = "Institutional Email Address",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = WebTextPrimary
                                )
                            )
                            OutlinedTextField(
                                value = email,
                                onValueChange = { email = it },
                                modifier = Modifier.fillMaxWidth(),
                                placeholder = { Text("researcher@institute.edu", fontSize = 12.sp) },
                                shape = RoundedCornerShape(10.dp),
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                                leadingIcon = {
                                    Icon(Icons.Default.Email, contentDescription = null, tint = WebTextMuted, modifier = Modifier.size(18.dp))
                                }
                            )
                        }

                        // Password Field
                        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = "Security Password",
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        fontWeight = FontWeight.Bold,
                                        color = WebTextPrimary
                                    )
                                )
                                if (mode == "signin") {
                                    TextButton(
                                        onClick = { showForgotPasswordDialog = true },
                                        contentPadding = PaddingValues(0.dp)
                                    ) {
                                        Text("Forgot Password?", fontSize = 11.sp, color = WebTeal, fontWeight = FontWeight.SemiBold)
                                    }
                                }
                            }
                            OutlinedTextField(
                                value = password,
                                onValueChange = { password = it },
                                modifier = Modifier.fillMaxWidth(),
                                placeholder = { Text("••••••••••••", fontSize = 12.sp) },
                                shape = RoundedCornerShape(10.dp),
                                singleLine = true,
                                visualTransformation = if (showPassword) VisualTransformation.None else PasswordVisualTransformation(),
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                                leadingIcon = {
                                    Icon(Icons.Default.Lock, contentDescription = null, tint = WebTextMuted, modifier = Modifier.size(18.dp))
                                },
                                trailingIcon = {
                                    IconButton(onClick = { showPassword = !showPassword }) {
                                        Icon(
                                            imageVector = if (showPassword) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                            contentDescription = if (showPassword) "Hide password" else "Show password",
                                            tint = WebTextMuted,
                                            modifier = Modifier.size(18.dp)
                                        )
                                    }
                                }
                            )
                        }

                        // Institution & Role (Registration only)
                        if (mode == "signup") {
                            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                Text(
                                    text = "Affiliated Institution",
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        fontWeight = FontWeight.Bold,
                                        color = WebTextPrimary
                                    )
                                )
                                OutlinedTextField(
                                    value = institution,
                                    onValueChange = { institution = it },
                                    modifier = Modifier.fillMaxWidth(),
                                    placeholder = { Text("Research Center / University", fontSize = 12.sp) },
                                    shape = RoundedCornerShape(10.dp),
                                    singleLine = true
                                )
                            }
                        }

                        // Primary Action Button (Sign In / Register)
                        Button(
                            onClick = {
                                errorMessage = null
                                if (mode == "signin") {
                                    if (email.isBlank() || password.isBlank()) {
                                        errorMessage = "Please enter both email and password."
                                        return@Button
                                    }
                                    viewModel.signInUser(email, password) { success, error ->
                                        if (success) {
                                            authenticatedName = email.substringBefore("@").replaceFirstChar { it.uppercase() }
                                            showSuccessModal = true
                                        } else {
                                            errorMessage = error ?: "Sign in failed. Please check your credentials or create an account."
                                        }
                                    }
                                } else {
                                    if (fullName.isBlank() || email.isBlank() || password.isBlank()) {
                                        errorMessage = "Please fill in all registration fields."
                                        return@Button
                                    }
                                    viewModel.signUpUser(fullName, email, role, institution, password) { success, error ->
                                        if (success) {
                                            authenticatedName = fullName
                                            showSuccessModal = true
                                        } else {
                                            errorMessage = error ?: "Registration failed. Please try again."
                                        }
                                    }
                                }
                            },
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = WebNavy),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(48.dp)
                        ) {
                            Text(
                                text = if (mode == "signin") "Sign In to Workspace" else "Register & Create Account",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Icon(
                                imageVector = Icons.Default.ArrowForward,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp)
                            )
                        }

                        HorizontalDivider(color = WebBorder, modifier = Modifier.padding(vertical = 4.dp))

                        // Below password / sign in button: Create Research Account toggle button
                        if (mode == "signin") {
                            OutlinedButton(
                                onClick = { mode = "signup"; errorMessage = null },
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.outlinedButtonColors(contentColor = WebTeal),
                                border = androidx.compose.foundation.BorderStroke(1.dp, WebTeal),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(44.dp)
                            ) {
                                Icon(Icons.Default.PersonAdd, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Create Research Account", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            }
                        } else {
                            TextButton(
                                onClick = { mode = "signin"; errorMessage = null },
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text("Already have a research account? Sign In", fontSize = 12.sp, color = WebBlue, fontWeight = FontWeight.SemiBold)
                            }
                        }
                    }
                }
            }

            // Forgot Password Dialog
            if (showForgotPasswordDialog) {
                AlertDialog(
                    onDismissRequest = { showForgotPasswordDialog = false },
                    title = { Text("Reset Password", fontWeight = FontWeight.Bold) },
                    text = { Text("Password reset instructions have been sent to your institutional email address.") },
                    confirmButton = {
                        Button(onClick = { showForgotPasswordDialog = false }, colors = ButtonDefaults.buttonColors(containerColor = WebNavy)) {
                            Text("OK")
                        }
                    }
                )
            }

            // WELCOME MODAL POPUP
            if (showSuccessModal) {
                Dialog(
                    onDismissRequest = {
                        showSuccessModal = false
                        onNavigateToDashboard()
                    }
                ) {
                    Card(
                        shape = RoundedCornerShape(22.dp),
                        colors = CardDefaults.cardColors(containerColor = WebCard),
                        border = androidx.compose.foundation.BorderStroke(1.dp, WebBorder),
                        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(16.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .width(48.dp)
                                    .height(4.dp)
                                    .clip(CircleShape)
                                    .background(WebTeal)
                            )

                            Box(
                                modifier = Modifier
                                    .size(64.dp)
                                    .clip(RoundedCornerShape(18.dp))
                                    .background(Color(0xFFECFDF5))
                                    .border(1.dp, Color(0xFFA7F3D0), RoundedCornerShape(18.dp)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.CheckCircle,
                                    contentDescription = null,
                                    tint = Color(0xFF10B981),
                                    modifier = Modifier.size(36.dp)
                                )
                            }

                            Surface(
                                color = Color(0xFFECFDF5),
                                shape = RoundedCornerShape(16.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFA7F3D0))
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Check,
                                        contentDescription = null,
                                        tint = Color(0xFF059669),
                                        modifier = Modifier.size(14.dp)
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(
                                        text = "Signed in successfully",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFF047857)
                                    )
                                }
                            }

                            Text(
                                text = authenticatedName.ifBlank { "Researcher" },
                                style = MaterialTheme.typography.titleLarge.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = WebTextPrimary,
                                    fontSize = 20.sp
                                )
                            )

                            Surface(
                                color = Color(0xFFEFF6FF),
                                shape = RoundedCornerShape(12.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFBFDBFE)),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Column(
                                    modifier = Modifier.padding(12.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.spacedBy(4.dp)
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(
                                            imageVector = Icons.Default.Science,
                                            contentDescription = null,
                                            tint = WebNavy,
                                            modifier = Modifier.size(16.dp)
                                        )
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text(
                                            text = "Welcome to Drug Target Interaction",
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 13.sp,
                                            color = WebNavy
                                        )
                                    }
                                    Text(
                                        text = "Therapeutic Discovery & Molecular Biophysics Studio",
                                        fontSize = 10.sp,
                                        color = WebTextSecondary
                                    )
                                }
                            }

                            Button(
                                onClick = {
                                    showSuccessModal = false
                                    onNavigateToDashboard()
                                },
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = WebNavy),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(48.dp)
                            ) {
                                Text(
                                    text = "OK",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.ExtraBold
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Icon(
                                    imageVector = Icons.Default.ArrowForward,
                                    contentDescription = null,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
