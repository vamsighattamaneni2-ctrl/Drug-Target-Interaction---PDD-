package com.drugtarget.discovery.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = BioCyan,
    onPrimary = BioDark,
    primaryContainer = BioSurface,
    onPrimaryContainer = BioCyanGlow,
    secondary = BioIndigo,
    onSecondary = TextPrimary,
    tertiary = BioEmerald,
    background = BioDark,
    onBackground = TextPrimary,
    surface = BioSurface,
    onSurface = TextPrimary,
    surfaceVariant = BioCard,
    onSurfaceVariant = TextSecondary,
    outline = BioBorder
)

@Composable
fun DrugTargetDiscoveryTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = Typography,
        content = content
    )
}
