package com.dollardoctrine.ui.screens.defesa

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
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
import com.dollardoctrine.core.utils.NumberFormatter
import com.dollardoctrine.data.model.DefenseAsset
import com.dollardoctrine.data.model.GameState

@Composable
fun DefesaScreen(
    gameState: GameState,
    onBuildAsset: (String) -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(SurfaceBackground)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(top = 12.dp, bottom = 100.dp)
    ) {
        // 1. National Deterrence & Readiness Center
        item {
            StrategicCard(
                title = "Comando de Defesa & Dissuasão",
                badgeText = "DISSUASÃO ${NumberFormatter.formatPercentage(gameState.deterrencePower)}",
                badgeColor = AccentTechBlue,
                badgeBgColor = AccentTechBlueLight
            ) {
                Text(
                    text = "Capacidade de resposta assimétrica integrada entre vetores autônomos, satélites de observação e ciberdefesa:",
                    style = Typography.bodyMedium,
                    color = TextSecondary
                )

                Spacer(modifier = Modifier.height(14.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    DeterrenceMetricBox(
                        label = "Prontidão",
                        value = "DEFCON 2",
                        color = AccentAmber,
                        modifier = Modifier.weight(1f)
                    )
                    DeterrenceMetricBox(
                        label = "Vigilância",
                        value = "94.2%",
                        color = AccentTechBlue,
                        modifier = Modifier.weight(1f)
                    )
                    DeterrenceMetricBox(
                        label = "Ciberdefesa",
                        value = "99.1%",
                        color = AccentCyberPurple,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        // 2. Autonomous Warfare & Silicon Swarm (Projeto Vectus & USVs)
        item {
            StrategicCard(
                title = "Laboratório de Guerra Autônoma (Vectus & USVs)",
                badgeText = "MATILHA DE SILÍCIO",
                badgeColor = AccentTechBlue,
                badgeBgColor = AccentTechBlueLight
            ) {
                Text(
                    text = "Drones furtivos, embarcações rápidas não tripuladas e sensores inteligentes para patrulha de estreitos sem risco de vidas humanas:",
                    style = Typography.bodyMedium,
                    color = TextSecondary
                )

                Spacer(modifier = Modifier.height(12.dp))

                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    gameState.defenseAssets.forEach { asset ->
                        DefenseAssetItem(
                            asset = asset,
                            playerBalance = gameState.balance,
                            onBuild = { onBuildAsset(asset.id) }
                        )
                    }
                }
            }
        }

        // 3. Orbital Constellation (Satélites de Alerta Precoce)
        item {
            StrategicCard(
                title = "Rede Orbital & Guerra Eletrônica",
                badgeText = "6 SATÉLITES ÓRBITA BAIXA",
                badgeColor = AccentOrbitalCyan,
                badgeBgColor = AccentOrbitalCyanLight
            ) {
                Text(
                    text = "Constelação de sensoriamento óptico e enlaces a laser para desmonte imediato de falsas narrativas e proteção de GPS de comboios de petróleo.",
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
                        text = "🛰 Enlace laser inter-satélite ativo com criptografia de ponta a ponta.",
                        style = Typography.bodySmall.copy(fontSize = 11.sp),
                        color = TextPrimary
                    )
                }
            }
        }
    }
}

@Composable
private fun DeterrenceMetricBox(
    label: String,
    value: String,
    color: Color,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier
            .clip(RoundedCornerShape(10.dp))
            .border(1.dp, SurfaceBorder, RoundedCornerShape(10.dp)),
        color = SurfaceWhite
    ) {
        Column(
            modifier = Modifier.padding(10.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(label.uppercase(), style = Typography.labelSmall.copy(fontSize = 9.sp), color = TextMuted)
            Spacer(modifier = Modifier.height(2.dp))
            Text(value, style = MonospaceSmall.copy(fontWeight = FontWeight.Bold, fontSize = 13.sp), color = color)
        }
    }
}

@Composable
private fun DefenseAssetItem(
    asset: DefenseAsset,
    playerBalance: java.math.BigDecimal,
    onBuild: () -> Unit
) {
    val buildCost = asset.operationalCostPerSecond.multiply(java.math.BigDecimal(50))
    val canAfford = playerBalance >= buildCost

    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .border(1.dp, SurfaceBorder, RoundedCornerShape(12.dp)),
        color = SurfaceWhite
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(asset.name, style = Typography.titleMedium.copy(fontSize = 13.sp), color = TextPrimary)
                    Text(asset.type.label, style = Typography.labelSmall.copy(fontSize = 10.sp), color = AccentTechBlue)
                }
                StatusPill(
                    text = "${asset.count} UNIDADES",
                    textColor = AccentTechBlue,
                    backgroundColor = AccentTechBlueLight
                )
            }

            Spacer(modifier = Modifier.height(4.dp))
            Text(asset.description, style = Typography.bodySmall.copy(fontSize = 11.sp), color = TextSecondary)

            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Dissuasão: +${asset.deterrencePower.toInt()} | ${asset.autonomyLevel}",
                    style = Typography.labelSmall,
                    color = AccentEmerald
                )

                Button(
                    onClick = onBuild,
                    enabled = canAfford,
                    colors = ButtonDefaults.buttonColors(containerColor = AccentTechBlue),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp),
                    modifier = Modifier.height(32.dp)
                ) {
                    Text(
                        text = "+1 (${NumberFormatter.formatCurrency(buildCost)})",
                        style = Typography.labelSmall.copy(fontSize = 10.sp, color = TextInverse)
                    )
                }
            }
        }
    }
}
