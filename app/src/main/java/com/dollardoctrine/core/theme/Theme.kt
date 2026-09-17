package com.dollardoctrine.core.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

object DDColors {
    val Background = Color(0xFFFFFFFF)
    val Surface = Color(0xFFF8FAFC)
    val Surface2 = Color(0xFFF1F5F9)
    val Border = Color(0xFFE2E8F0)
    val Ink = Color(0xFF0F172A)
    val InkStrong = Color(0xFF000000)
    val Muted = Color(0xFF64748B)
    val Muted2 = Color(0xFF94A3B8)
    val Primary = Color(0xFF1E3A8A)
    val Primary2 = Color(0xFF4F46E5)
    val Success = Color(0xFF20B26C)
    val Danger = Color(0xFFE5484D)
    val Gold = Color(0xFFD4AF37)
    val Warning = Color(0xFFD97706)
    val Mint = Color(0xFF10B981)
    val Cyan = Color(0xFF06B6D4)
}

object DDTypography {
    val Display = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Black,
        fontSize = 28.sp,
        color = DDColors.InkStrong
    )
    val Headline = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Bold,
        fontSize = 22.sp,
        color = DDColors.InkStrong
    )
    val Title = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Bold,
        fontSize = 16.sp,
        color = DDColors.Ink
    )
    val Body = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        color = DDColors.Ink
    )
    val Caption = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Medium,
        fontSize = 12.sp,
        color = DDColors.Muted
    )
    val Mono = TextStyle(
        fontFamily = FontFamily.Monospace,
        fontWeight = FontWeight.Bold,
        fontSize = 13.sp,
        color = DDColors.InkStrong
    )
}

private val LightColors = lightColorScheme(
    primary = DDColors.Primary,
    onPrimary = Color.White,
    primaryContainer = DDColors.Surface2,
    onPrimaryContainer = DDColors.Primary,
    background = DDColors.Background,
    onBackground = DDColors.Ink,
    surface = DDColors.Background,
    onSurface = DDColors.Ink,
    surfaceVariant = DDColors.Surface,
    onSurfaceVariant = DDColors.Muted,
    outline = DDColors.Border
)

@Composable
fun DollarDoctrineTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColors,
        typography = Typography(
            displayLarge = DDTypography.Display,
            headlineMedium = DDTypography.Headline,
            titleMedium = DDTypography.Title,
            bodyLarge = DDTypography.Body,
            bodySmall = DDTypography.Caption
        ),
        content = content
    )
}
