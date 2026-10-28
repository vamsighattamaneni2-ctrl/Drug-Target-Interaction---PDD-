package com.drugtarget.discovery.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.drugtarget.discovery.ui.screens.DashboardScreen
import com.drugtarget.discovery.ui.screens.PocketAnalysisScreen
import com.drugtarget.discovery.ui.screens.TargetListScreen
import com.drugtarget.discovery.ui.viewmodel.DiscoveryViewModel

sealed class Screen(val route: String) {
    object Dashboard : Screen("dashboard")
    object Targets : Screen("targets")
    object Pocket : Screen("pocket")
}

@Composable
fun AppNavigation(
    navController: NavHostController,
    viewModel: DiscoveryViewModel
) {
    NavHost(
        navController = navController,
        startDestination = Screen.Dashboard.route
    ) {
        composable(Screen.Dashboard.route) {
            DashboardScreen(
                viewModel = viewModel,
                onNavigateToTargets = { navController.navigate(Screen.Targets.route) },
                onNavigateToPocket = { navController.navigate(Screen.Pocket.route) }
            )
        }
        composable(Screen.Targets.route) {
            TargetListScreen(
                viewModel = viewModel,
                onBack = { navController.popBackStack() }
            )
        }
        composable(Screen.Pocket.route) {
            PocketAnalysisScreen(
                onBack = { navController.popBackStack() }
            )
        }
    }
}
