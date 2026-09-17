package com.dollardoctrine.ui.screens.mundo

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import com.dollardoctrine.data.model.Chokepoint
import com.dollardoctrine.data.model.GameState

@Composable
fun MundoScreen(
    gameState: GameState,
    onOpenCrisis: (String) -> Unit
) {
    var inspectedChokepoint by remember { mutableStateOf<Chokepoint?>(null) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(SurfaceBackground)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(top = 12.dp, bottom = 100.dp)
    ) {
        // 1. Interactive World Map Canvas (Visualização de Rotas e Nós)
        item {
            InteractiveWorldMapCanvas(
                chokepoints = gameState.chokepoints,
                onSelectChokepoint = { chk ->
                    inspectedChokepoint = chk
                }
            )
        }

        // 2. Strait of Hormuz - Focal Spotlight
        val ormuz = gameState.chokepoints.find { it.id == "chk_ormuz" }
        if (ormuz != null) {
            item {
                StrategicCard(
                    title = "EPICENTRO TÁTICO: Estreito de Ormuz",
                    badgeText = ormuz.militaryTension.uppercase(),
                    badgeColor = HormuzOrange,
                    badgeBgColor = HormuzOrangeLight
                ) {
                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(
                            text = ormuz.activeThreatDescription,
                            style = Typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                            color = TextPrimary
                        )
                        Text(
                            text = ormuz.strategicImportance,
                            style = Typography.bodySmall,
                            color = TextSecondary
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Fluxo: ${ormuz.dailyOilFlowMillionBarrels}M bbl/dia", style = MonospaceSmall, color = TextPrimary)
                            Text("Seguro: ${ormuz.insuranceMultiplier}x", style = MonospaceSmall, color = AccentCrimson)
                            Text("Risco: ${ormuz.riskLevelPercentage.toInt()}%", style = MonospaceSmall, color = AccentCrimson)
                        }
                    }
                }
            }
        }

        // 3. Other Global Chokepoints Catalog
        item {
            StrategicCard(
                title = "Estreitos Globais Monitorados",
                badgeText = "VIGILÂNCIA CONTÍNUA",
                badgeColor = AccentTechBlue,
                badgeBgColor = AccentTechBlueLight
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    gameState.chokepoints.filterNot { it.id == "chk_ormuz" }.forEach { chk ->
                        ChokepointRowItem(chokepoint = chk)
                    }
                }
            }
        }

        // 4. Narrative Warfare & Disinformation Defense
        item {
            StrategicCard(
                title = "Guerra de Narrativas & Resiliência Cognitiva",
                badgeText = "DEFESA INFORMACIONAL",
                badgeColor = AccentCyberPurple,
                badgeBgColor = AccentCyberPurpleLight
            ) {
                Text(
                    text = "A propaganda e narrativas assimétricas buscam isolar diplomatas e abalar a estabilidade do mercado financeiro. Responda com transparência e dados orbitais de satélite.",
                    style = Typography.bodyMedium,
                    color = TextSecondary
                )

                Spacer(modifier = Modifier.height(10.dp))

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(SurfaceMuted)
                        .padding(10.dp)
                ) {
                    Text(
                        text = "📡 Sistema de telemetria aberto ao público neutralizou 84% das alegações falsas.",
                        style = Typography.bodySmall.copy(fontSize = 11.sp),
                        color = TextPrimary
                    )
                }
            }
        }
    }
}

@Composable
private fun ChokepointRowItem(chokepoint: Chokepoint) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .background(SurfaceMuted)
            .padding(10.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(chokepoint.name, style = Typography.labelLarge.copy(fontSize = 12.sp), color = TextPrimary)
            Text(chokepoint.region, style = Typography.bodySmall.copy(fontSize = 10.sp), color = TextMuted)
        }
        Column(horizontalAlignment = Alignment.End) {
            Text(
                text = "Risco: ${chokepoint.riskLevelPercentage.toInt()}%",
                style = MonospaceSmall.copy(fontWeight = FontWeight.Bold),
                color = if (chokepoint.riskLevelPercentage > 50) AccentCrimson else AccentEmerald
            )
            Text(
                text = chokepoint.militaryTension,
                style = Typography.labelSmall.copy(fontSize = 9.sp),
                color = TextSecondary
            )
        }
    }
}
