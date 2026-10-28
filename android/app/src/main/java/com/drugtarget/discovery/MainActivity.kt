package com.drugtarget.discovery

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.navigation.compose.rememberNavController
import com.drugtarget.discovery.ui.navigation.AppNavigation
import com.drugtarget.discovery.ui.theme.DrugTargetDiscoveryTheme
import com.drugtarget.discovery.ui.viewmodel.DiscoveryViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: DiscoveryViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            DrugTargetDiscoveryTheme {
                val navController = rememberNavController()
                AppNavigation(
                    navController = navController,
                    viewModel = viewModel
                )
            }
        }
    }
}
