package com.dollardoctrine.ui.screens.instituicoes

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import com.dollardoctrine.data.model.GameState
import com.dollardoctrine.data.model.StrategicDoctrine
import com.dollardoctrine.data.model.StrategicInstitution

@Composable
fun InstituicoesScreen(
    gameState: GameState,
    onUpgradeInstitution: (String) -> Unit,
    onToggleDoctrine: (String) -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(SurfaceBackground)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(top = 12.dp, bottom = 100.dp)
    ) {
        // 1. Strategic Institutions Overview
        item {
            StrategicCard(
                title = "Instituições Soberanas & Conselhos",
                badgeText = "${gameState.institutions.size} ÓRGÃOS DE ESTADO",
                badgeColor = AccentTechBlue,
                badgeBgColor = AccentTechBlueLight
            ) {
                Text(
                    text = "Aprimore as instituições republicanas e os conselhos de segurança para expandir a resiliência institucional e a eficácia das respostas táticas:",
                    style = Typography.bodyMedium,
                    color = TextSecondary
                )

                Spacer(modifier = Modifier.height(12.dp))

                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    gameState.institutions.forEach { inst ->
                        InstitutionItem(
                            institution = inst,
                            playerBalance = gameState.balance,
                            onUpgrade = { onUpgradeInstitution(inst.id) }
                        )
                    }
                }
            }
        }

        // 2. Strategic Doctrines Selector
        item {
            StrategicCard(
                title = "Matriz de Doutrinas Estratégicas",
                badgeText = "POSTURA NACIONAL",
                badgeColor = AccentCyberPurple,
                badgeBgColor = AccentCyberPurpleLight
            ) {
                Text(
                    text = "Ative doutrinas para conferir bônus táticos a sua rede de sensores, estoques de energia ou dissuasão militar:",
                    style = Typography.bodyMedium,
                    color = TextSecondary
                )

                Spacer(modifier = Modifier.height(12.dp))

                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    gameState.doctrines.forEach { doctrine ->
                        DoctrineItem(
                            doctrine = doctrine,
                            playerLevel = gameState.level,
                            onToggle = { onToggleDoctrine(doctrine.id) }
                        )
                    }
                }
            }
        }

        // 3. Prestige Reset - Global Constitution
        item {
            StrategicCard(
                title = "Constituição Global Soberana",
                badgeText = "RESET DE PRESTÍGIO (LVL 1000)",
                badgeColor = AccentGold,
                badgeBgColor = AccentGoldLight
            ) {
                Text(
                    text = "Ao atingir o Nível 1000 e a Fase VII (O Império), você pode promulgar a Constituição Global Soberana. A simulação é reiniciada com multiplicadores permanentes de inteligência, dissuasão e soberania.",
                    style = Typography.bodyMedium,
                    color = TextSecondary
                )

                Spacer(modifier = Modifier.height(14.dp))

                Button(
                    onClick = { /* Prestige Reset trigger when level >= 1000 */ },
                    enabled = gameState.level >= 1000,
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = AccentGold),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        text = if (gameState.level >= 1000) "PROMULGAR CONSTITUIÇÃO GLOBAL" else "BLOQUEADO (REQUER NÍVEL 1000)",
                        style = Typography.labelLarge,
                        color = TextInverse
                    )
                }
            }
        }
    }
}

@Composable
private fun InstitutionItem(
    institution: StrategicInstitution,
    playerBalance: java.math.BigDecimal,
    onUpgrade: () -> Unit
) {
    val canAfford = playerBalance >= institution.upgradeCost

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
                    Text(institution.name, style = Typography.titleMedium.copy(fontSize = 13.sp), color = TextPrimary)
                    Text(institution.mandate, style = Typography.bodySmall.copy(fontSize = 10.sp), color = TextSecondary)
                }
                StatusPill(
                    text = "NV. ${institution.level}",
                    textColor = AccentTechBlue,
                    backgroundColor = AccentTechBlueLight
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = institution.operationalEffect,
                    style = Typography.labelSmall.copy(color = AccentEmerald, fontWeight = FontWeight.Bold)
                )

                Button(
                    onClick = onUpgrade,
                    enabled = canAfford,
                    colors = ButtonDefaults.buttonColors(containerColor = AccentTechBlue),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp),
                    modifier = Modifier.height(30.dp)
                ) {
                    Text(
                        text = "Evoluir (${NumberFormatter.formatCurrency(institution.upgradeCost)})",
                        style = Typography.labelSmall.copy(fontSize = 9.sp, color = TextInverse)
                    )
                }
            }
        }
    }
}

@Composable
private fun DoctrineItem(
    doctrine: StrategicDoctrine,
    playerLevel: Int,
    onToggle: () -> Unit
) {
    val isUnlocked = playerLevel >= doctrine.requiredLevel

    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .border(1.dp, if (doctrine.isActive) AccentCyberPurple else SurfaceBorder, RoundedCornerShape(12.dp))
            .clickable(enabled = isUnlocked, onClick = onToggle),
        color = if (doctrine.isActive) AccentCyberPurpleLight.copy(alpha = 0.3f) else SurfaceWhite
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(doctrine.name, style = Typography.titleMedium.copy(fontSize = 13.sp), color = TextPrimary)
                StatusPill(
                    text = if (!isUnlocked) "REQ. LVL ${doctrine.requiredLevel}" else if (doctrine.isActive) "ATIVA" else "INATIVA",
                    textColor = if (doctrine.isActive) AccentCyberPurple else TextMuted,
                    backgroundColor = if (doctrine.isActive) AccentCyberPurpleLight else SurfaceMuted
                )
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text(doctrine.flavorDescription, style = Typography.bodySmall.copy(fontSize = 10.sp), color = TextSecondary)
            Spacer(modifier = Modifier.height(6.dp))
            Text(doctrine.primaryBenefit, style = Typography.labelSmall.copy(color = AccentEmerald, fontWeight = FontWeight.Bold))
        }
    }
}
