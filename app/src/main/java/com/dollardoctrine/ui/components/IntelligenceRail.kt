package com.dollardoctrine.ui.components

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dollardoctrine.core.designsystem.*
import com.dollardoctrine.data.model.GameState

@Composable
fun IntelligenceRail(
    isOpen: Boolean,
    gameState: GameState,
    onClose: () -> Unit,
    onLaunchMinigame: (String) -> Unit
) {
    AnimatedVisibility(
        visible = isOpen,
        enter = slideInHorizontally(initialOffsetX = { it }) + fadeIn(),
        exit = slideOutHorizontally(targetOffsetX = { it }) + fadeOut()
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.4f))
                .clickable(onClick = onClose),
            contentAlignment = Alignment.CenterEnd
        ) {
            Surface(
                modifier = Modifier
                    .fillMaxHeight()
                    .width(340.dp)
                    .clickable(enabled = false) {}, // prevent click-through
                color = SurfaceWhite,
                shadowElevation = 16.dp
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .statusBarsPadding()
                        .padding(16.dp)
                ) {
                    // Header
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "INTELLIGENCE RAIL",
                                style = Typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                color = TextPrimary
                            )
                            Text(
                                text = "Sala de Situação & Alertas Críticos",
                                style = Typography.labelSmall,
                                color = TextMuted
                            )
                        }
                        IconButton(onClick = onClose) {
                            Icon(
                                imageVector = Icons.Default.Close,
                                contentDescription = "Fechar Rail",
                                tint = TextSecondary
                            )
                        }
                    }

                    HorizontalDivider(
                        modifier = Modifier.padding(vertical = 12.dp),
                        color = SurfaceBorderSubtle
                    )

                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(14.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        // 1. Next Best Action
                        item {
                            StrategicCard(
                                title = "Recomendação Prioritária",
                                badgeText = "AÇÃO IMEDIATA",
                                badgeColor = AccentTechBlue,
                                badgeBgColor = AccentTechBlueLight
                            ) {
                                Text(
                                    text = if (gameState.activeCrises.isNotEmpty()) {
                                        "Crise ativa detectada no Estreito de Ormuz. Despache drones Vectus ou libere estoques de petróleo."
                                    } else {
                                        "Expanda o parque de semicondutores para garantir autossuficiência nas linhas de drones autônomos."
                                    },
                                    style = Typography.bodyMedium,
                                    color = TextSecondary
                                )
                            }
                        }

                        // 2. Quick Operations / Minigames Launcher
                        item {
                            StrategicCard(
                                title = "Simulações Táticas Ativas",
                                badgeText = "MINIGAMES",
                                badgeColor = AccentCyberPurple,
                                badgeBgColor = AccentCyberPurpleLight
                            ) {
                                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                    MinigameLaunchItem(
                                        title = "Intercepção em Ormuz",
                                        subtitle = "Defesa naval com drones furtivos Vectus",
                                        icon = "🚤",
                                        onClick = {
                                            onClose()
                                            onLaunchMinigame("minigame_ormuz")
                                        }
                                    )
                                    MinigameLaunchItem(
                                        title = "Contenção Cibernética SCADA",
                                        subtitle = "Isolar vírus da subestação de gás LNG",
                                        icon = "⚡",
                                        onClick = {
                                            onClose()
                                            onLaunchMinigame("minigame_cyber")
                                        }
                                    )
                                    MinigameLaunchItem(
                                        title = "Combate à Desinformação",
                                        subtitle = "Guerra de narrativas e evidências orbitais",
                                        icon = "📡",
                                        onClick = {
                                            onClose()
                                            onLaunchMinigame("minigame_narrative")
                                        }
                                    )
                                }
                            }
                        }

                        // 3. Live Intel Feed
                        item {
                            Text(
                                text = "ÚLTIMOS RELATÓRIOS FORENSES",
                                style = Typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                color = TextMuted
                            )
                        }

                        items(gameState.intelBriefings) { briefing ->
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(SurfaceMuted)
                                    .padding(10.dp)
                            ) {
                                Text(
                                    text = briefing,
                                    style = Typography.bodySmall.copy(fontSize = 11.sp),
                                    color = TextPrimary
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun MinigameLaunchItem(
    title: String,
    subtitle: String,
    icon: String,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(10.dp))
            .border(1.dp, SurfaceBorder, RoundedCornerShape(10.dp))
            .clickable(onClick = onClick)
            .padding(10.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.weight(1f)
        ) {
            Text(icon, fontSize = 20.sp)
            Spacer(modifier = Modifier.width(10.dp))
            Column {
                Text(title, style = Typography.labelLarge.copy(fontSize = 12.sp), color = TextPrimary)
                Text(subtitle, style = Typography.bodySmall.copy(fontSize = 10.sp), color = TextMuted)
            }
        }
        Icon(
            imageVector = Icons.Default.PlayArrow,
            contentDescription = "Jogar",
            tint = AccentTechBlue,
            modifier = Modifier.size(18.dp)
        )
    }
}
