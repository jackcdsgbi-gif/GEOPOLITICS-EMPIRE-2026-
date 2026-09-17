package com.dollardoctrine.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dollardoctrine.core.designsystem.*
import com.dollardoctrine.core.utils.NumberFormatter
import com.dollardoctrine.data.model.GameState

@Composable
fun AnimatedHeader(
    gameState: GameState,
    onOpenIntelligenceRail: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier
            .fillMaxWidth()
            .shadow(4.dp, spotColor = Color(0x0F000000)),
        color = SurfaceWhite
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(vertical = 8.dp)
        ) {
            // Top Row: Title, Era, and Bell / Rail Toggle
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "THE DOLLAR DOCTRINE",
                        style = Typography.titleMedium.copy(
                            fontWeight = FontWeight.Black,
                            letterSpacing = 0.5.sp
                        ),
                        color = TextPrimary
                    )
                    Text(
                        text = gameState.currentEraName.uppercase(),
                        style = Typography.labelSmall.copy(
                            fontWeight = FontWeight.Bold,
                            color = AccentTechBlue
                        )
                    )
                }

                // Notification Bell with Badge
                IconButton(
                    onClick = onOpenIntelligenceRail,
                    modifier = Modifier
                        .size(40.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(SurfaceMuted)
                        .border(1.dp, SurfaceBorder, RoundedCornerShape(10.dp))
                ) {
                    Box(contentAlignment = Alignment.TopEnd) {
                        Icon(
                            imageVector = Icons.Default.Notifications,
                            contentDescription = "Alertas de Inteligência",
                            tint = TextPrimary,
                            modifier = Modifier.size(20.dp)
                        )
                        if (gameState.activeCrises.isNotEmpty()) {
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(AccentCrimson)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Micro-Indicators Scrollable Strip
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                AnimatedIndicator(
                    label = "Dólar",
                    value = NumberFormatter.formatCompact(gameState.balance),
                    indicatorColor = AccentEmerald,
                    isPulsing = false
                )

                AnimatedIndicator(
                    label = "Nível",
                    value = "Lvl ${gameState.level}",
                    indicatorColor = AccentTechBlue,
                    isPulsing = false
                )

                AnimatedIndicator(
                    label = "População",
                    value = NumberFormatter.formatInteger(gameState.population),
                    indicatorColor = TextSecondary,
                    isPulsing = false
                )

                AnimatedIndicator(
                    label = "Estabilidade",
                    value = NumberFormatter.formatPercentage(gameState.stabilityPercentage),
                    indicatorColor = if (gameState.stabilityPercentage > 60) AccentEmerald else AccentCrimson,
                    isPulsing = gameState.stabilityPercentage <= 50
                )

                AnimatedIndicator(
                    label = "Energia",
                    value = NumberFormatter.formatPercentage(gameState.energySecurityPercentage),
                    indicatorColor = if (gameState.energySecurityPercentage > 70) AccentEmerald else AccentAmber,
                    isPulsing = gameState.energySecurityPercentage < 50
                )

                AnimatedIndicator(
                    label = "Logística",
                    value = NumberFormatter.formatPercentage(gameState.logisticsResiliencePercentage),
                    indicatorColor = AccentTechBlue,
                    isPulsing = false
                )

                AnimatedIndicator(
                    label = "Risco Ormuz",
                    value = NumberFormatter.formatPercentage(gameState.globalRiskPercentage),
                    indicatorColor = if (gameState.globalRiskPercentage > 50) AccentCrimson else AccentEmerald,
                    isPulsing = gameState.globalRiskPercentage > 60
                )
            }
        }
    }
}
