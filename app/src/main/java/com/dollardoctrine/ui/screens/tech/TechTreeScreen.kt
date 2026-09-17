package com.dollardoctrine.ui.screens.tech

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dollardoctrine.core.designsystem.*
import com.dollardoctrine.core.utils.NumberFormatter
import com.dollardoctrine.data.model.GameState
import com.dollardoctrine.data.model.TechBranch
import com.dollardoctrine.data.model.TechNode
import java.math.BigDecimal

@Composable
fun TechTreeScreen(
    gameState: GameState,
    onResearchTech: (String) -> Unit
) {
    var selectedBranch by remember { mutableStateOf(TechBranch.ENERGIA) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(SurfaceBackground)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(top = 12.dp, bottom = 100.dp)
    ) {
        // 1. Tech Tree Overview Header
        item {
            StrategicCard(
                title = "Árvore Tecnológica Soberana",
                badgeText = "P&D: ${NumberFormatter.formatCompact(gameState.researchPoints)} PONTOS",
                badgeColor = AccentTechBlue,
                badgeBgColor = AccentTechBlueLight
            ) {
                Text(
                    text = "Desenvolva tecnologias disruptivas nos 6 ramos estratégicos para blindar o país contra embargos e alcançar supremacia autônoma:",
                    style = Typography.bodyMedium,
                    color = TextSecondary
                )

                Spacer(modifier = Modifier.height(10.dp))

                Text(
                    text = "Geração Científica: +${NumberFormatter.formatCompact(gameState.researchPointsPerSecond)} P&D/seg",
                    style = Typography.labelLarge.copy(fontSize = 12.sp, color = AccentEmerald)
                )
            }
        }

        // 2. Branch Selector Tabs (Horizontal Scrollable)
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                TechBranch.values().forEach { branch ->
                    val isSelected = branch == selectedBranch
                    val bgColor = if (isSelected) AccentTechBlueLight else SurfaceWhite
                    val borderColor = if (isSelected) AccentTechBlue else SurfaceBorder
                    val textColor = if (isSelected) AccentTechBlue else TextPrimary

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(bgColor)
                            .border(1.dp, borderColor, RoundedCornerShape(12.dp))
                            .clickable { selectedBranch = branch }
                            .padding(horizontal = 12.dp, vertical = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(branch.icon, fontSize = 16.sp)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = branch.displayName,
                                style = Typography.labelSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 11.sp
                                ),
                                color = textColor
                            )
                        }
                    }
                }
            }
        }

        // 3. Branch Description Card
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(SurfaceMuted)
                    .padding(12.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(selectedBranch.icon, fontSize = 24.sp)
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = selectedBranch.displayName.uppercase(),
                            style = Typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                            color = TextMuted
                        )
                        Text(
                            text = selectedBranch.description,
                            style = Typography.bodySmall,
                            color = TextSecondary
                        )
                    }
                }
            }
        }

        // 4. Technologies in Selected Branch (Tier 1 to 7)
        val branchTechs = gameState.technologies.filter { it.branch == selectedBranch }

        items(branchTechs, key = { it.id }) { tech ->
            TechNodeCard(
                tech = tech,
                availablePoints = gameState.researchPoints,
                onResearch = { onResearchTech(tech.id) }
            )
        }
    }
}

@Composable
private fun TechNodeCard(
    tech: TechNode,
    availablePoints: BigDecimal,
    onResearch: () -> Unit
) {
    val canAfford = availablePoints >= tech.researchCost && tech.isAvailable && !tech.isResearched

    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .border(
                1.dp,
                when {
                    tech.isResearched -> AccentEmerald
                    tech.isAvailable -> SurfaceBorder
                    else -> SurfaceBorderSubtle
                },
                RoundedCornerShape(16.dp)
            ),
        color = when {
            tech.isResearched -> SurfaceWhite
            tech.isAvailable -> SurfaceWhite
            else -> SurfaceMuted.copy(alpha = 0.5f)
        }
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = tech.name,
                        style = Typography.titleMedium.copy(fontSize = 14.sp),
                        fontWeight = FontWeight.Bold,
                        color = if (tech.isResearched || tech.isAvailable) TextPrimary else TextMuted
                    )
                    Text(
                        text = "Tier ${tech.tier} • ${tech.branch.displayName}",
                        style = Typography.labelSmall.copy(fontSize = 10.sp),
                        color = TextMuted
                    )
                }

                StatusPill(
                    text = when {
                        tech.isResearched -> "PESQUISADO"
                        tech.isAvailable -> "${NumberFormatter.formatCompact(tech.researchCost)} P&D"
                        else -> "BLOQUEADO"
                    },
                    textColor = when {
                        tech.isResearched -> AccentEmerald
                        tech.isAvailable -> AccentTechBlue
                        else -> TextMuted
                    },
                    backgroundColor = when {
                        tech.isResearched -> AccentEmeraldLight
                        tech.isAvailable -> AccentTechBlueLight
                        else -> SurfaceMuted
                    }
                )
            }

            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = tech.description,
                style = Typography.bodySmall.copy(fontSize = 11.sp),
                color = if (tech.isResearched || tech.isAvailable) TextSecondary else TextMuted
            )

            Spacer(modifier = Modifier.height(10.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "★ " + tech.primaryModifierText,
                        style = Typography.labelSmall.copy(
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (tech.isResearched) AccentEmerald else AccentTechBlue
                        )
                    )
                    Text(
                        text = "• " + tech.secondaryModifierText,
                        style = Typography.labelSmall.copy(fontSize = 9.sp, color = TextMuted)
                    )
                }

                if (!tech.isResearched) {
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = onResearch,
                        enabled = canAfford,
                        colors = ButtonDefaults.buttonColors(containerColor = AccentTechBlue),
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp),
                        modifier = Modifier.height(32.dp)
                    ) {
                        Text(
                            text = if (tech.isAvailable) "Pesquisar" else "Trancado",
                            style = Typography.labelSmall.copy(fontSize = 10.sp, color = TextInverse)
                        )
                    }
                }
            }
        }
    }
}
