package com.dollardoctrine.core.designsystem

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val LightColorScheme = lightColorScheme(
    primary = AccentTechBlue,
    onPrimary = TextInverse,
    primaryContainer = AccentTechBlueLight,
    onPrimaryContainer = AccentTechBlue,
    secondary = AccentEmerald,
    onSecondary = TextInverse,
    secondaryContainer = AccentEmeraldLight,
    onSecondaryContainer = AccentEmerald,
    tertiary = AccentCyberPurple,
    onTertiary = TextInverse,
    background = SurfaceBackground,
    onBackground = TextPrimary,
    surface = SurfaceWhite,
    onSurface = TextPrimary,
    surfaceVariant = SurfaceMuted,
    onSurfaceVariant = TextSecondary,
    outline = SurfaceBorder
)

@Composable
fun DollarDoctrineTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        typography = Typography,
        content = content
    )
}
