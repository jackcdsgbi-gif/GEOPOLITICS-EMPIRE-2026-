package com.dollardoctrine.ui.components

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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dollardoctrine.core.designsystem.*
import com.dollardoctrine.core.utils.NumberFormatter
import com.dollardoctrine.data.model.CrisisOption
import com.dollardoctrine.data.model.GeopoliticalCrisis

@Composable
fun CrisisModalSheet(
    crisis: GeopoliticalCrisis,
    playerBalance: java.math.BigDecimal,
    onDismiss: () -> Unit,
    onSelectOption: (option: CrisisOption) -> Unit
) {
    OperationalModal(
        title = "SALA DE CRISE: " + crisis.title.uppercase(),
        subtitle = "Tempo Crítico Restante: ${crisis.timeRemainingSeconds}s",
        onDismissRequest = onDismiss
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            // Context Briefing
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(AccentCrimsonLight)
                    .border(1.dp, AccentCrimson, RoundedCornerShape(12.dp))
                    .padding(14.dp)
            ) {
                Column {
                    Text(
                        text = "INCIDENTE GEOPOLÍTICO OPERACIONAL",
                        style = Typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                        color = AccentCrimson
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = crisis.contextDescription,
                        style = Typography.bodyMedium,
                        color = TextPrimary
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "IMPACTO DE MERCADO: ${crisis.economicConsequence}",
                        style = Typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                        color = TextPrimary
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "OPÇÕES DE RESPOSTA NACIONAL:",
                style = Typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                color = TextMuted
            )

            Spacer(modifier = Modifier.height(8.dp))

            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(10.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(crisis.options) { option ->
                    val canAfford = playerBalance >= option.dollarCost

                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .border(1.dp, if (canAfford) SurfaceBorder else AccentCrimsonLight, RoundedCornerShape(12.dp))
                            .clickable(enabled = canAfford) {
                                onSelectOption(option)
                            },
                        color = SurfaceWhite
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = option.title,
                                    style = Typography.titleMedium.copy(fontSize = 14.sp),
                                    color = TextPrimary
                                )
                                StatusPill(
                                    text = if (canAfford) NumberFormatter.formatCurrency(option.dollarCost) else "SALDO INSUFICIENTE",
                                    textColor = if (canAfford) AccentTechBlue else AccentCrimson,
                                    backgroundColor = if (canAfford) AccentTechBlueLight else AccentCrimsonLight
                                )
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = option.description,
                                style = Typography.bodySmall,
                                color = TextSecondary
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                Text(
                                    text = "Sucesso: ${(option.successChance * 100).toInt()}%",
                                    style = Typography.labelSmall,
                                    color = AccentEmerald
                                )
                                Text(
                                    text = "Estabilidade: ${if (option.stabilityImpact >= 0) "+" else ""}${option.stabilityImpact.toInt()}%",
                                    style = Typography.labelSmall,
                                    color = if (option.stabilityImpact >= 0) AccentEmerald else AccentCrimson
                                )
                                if (option.triggerMinigameId != null) {
                                    Text(
                                        text = "🎮 Modo Tático",
                                        style = Typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                        color = AccentCyberPurple
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
