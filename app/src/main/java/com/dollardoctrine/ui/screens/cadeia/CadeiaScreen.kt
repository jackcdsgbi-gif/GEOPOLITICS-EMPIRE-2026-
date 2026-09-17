package com.dollardoctrine.ui.screens.cadeia

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import com.dollardoctrine.data.model.StrategicResource

@Composable
fun CadeiaScreen(
    gameState: GameState
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(SurfaceBackground)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(top = 12.dp, bottom = 100.dp)
    ) {
        // 1. Energy Security & Strategic Reserves Overview
        item {
            StrategicCard(
                title = "Corredor Energético & Reservas Estratégicas",
                badgeText = "SEGURANÇA ENERGÉTICA ${NumberFormatter.formatPercentage(gameState.energySecurityPercentage)}",
                badgeColor = if (gameState.energySecurityPercentage > 70) AccentEmerald else AccentAmber,
                badgeBgColor = if (gameState.energySecurityPercentage > 70) AccentEmeraldLight else AccentAmberLight
            ) {
                Text(
                    text = "Acompanhamento em tempo real dos fluxos de hidrocarbonetos, terminais de LNG e tanques subterrâneos de emergência:",
                    style = Typography.bodyMedium,
                    color = TextSecondary
                )

                Spacer(modifier = Modifier.height(14.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    ReserveTankCard(
                        title = "Óleo Cru (SPR)",
                        amount = "420.000 Barris",
                        capacity = "Capacidade: 1.000.000 Bbl",
                        status = "Autonomia: 62 Dias",
                        accentColor = AccentAmber,
                        modifier = Modifier.weight(1f)
                    )
                    ReserveTankCard(
                        title = "Gás Líquido (LNG)",
                        amount = "180.000 m³",
                        capacity = "Capacidade: 500.000 m³",
                        status = "Autonomia: 45 Dias",
                        accentColor = AccentTechBlue,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        // 2. Strategic Resources Production Lines
        item {
            StrategicCard(
                title = "Cadeia de Produção & Semicondutores",
                badgeText = "TIER 3 A 5 ATIVOS",
                badgeColor = AccentTechBlue,
                badgeBgColor = AccentTechBlueLight
            ) {
                Text(
                    text = "Insumos tecnológicos e minerais estratégicos processados para defesa nacional e mercado exterior:",
                    style = Typography.bodyMedium,
                    color = TextSecondary
                )

                Spacer(modifier = Modifier.height(12.dp))

                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    gameState.resources.forEach { resource ->
                        ResourceRow(resource = resource)
                    }
                }
            }
        }

        // 3. Maritime Freight & Safe Routes
        item {
            StrategicCard(
                title = "Rotas Comerciais & Custo de Frete",
                badgeText = "SEGURO MARÍTIMO 2.4X",
                badgeColor = AccentCrimson,
                badgeBgColor = AccentCrimsonLight
            ) {
                Text(
                    text = "A tensão no Estreito de Ormuz eleva as apólices de seguro naval e pressiona as margens de exportação.",
                    style = Typography.bodyMedium,
                    color = TextSecondary
                )

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(SurfaceMuted)
                        .padding(10.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("ROTA SOBERANA DO GOLFO", style = Typography.labelMedium.copy(fontWeight = FontWeight.Bold), color = TextPrimary)
                        Text("Escolta por USVs e monitoramento Vectus", style = Typography.bodySmall.copy(fontSize = 11.sp), color = AccentEmerald)
                    }
                    Text("-18% Risco", style = MonospaceSmall.copy(fontWeight = FontWeight.Bold), color = AccentEmerald)
                }
            }
        }
    }
}

@Composable
private fun ReserveTankCard(
    title: String,
    amount: String,
    capacity: String,
    status: String,
    accentColor: Color,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .border(1.dp, SurfaceBorder, RoundedCornerShape(12.dp)),
        color = SurfaceWhite
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(title, style = Typography.labelMedium.copy(fontWeight = FontWeight.Bold), color = TextPrimary)
            Spacer(modifier = Modifier.height(6.dp))
            Text(amount, style = MonospaceMedium.copy(fontSize = 13.sp), color = accentColor)
            Text(capacity, style = Typography.bodySmall.copy(fontSize = 10.sp), color = TextMuted)
            Spacer(modifier = Modifier.height(4.dp))
            Text(status, style = Typography.labelSmall.copy(fontSize = 10.sp), color = TextSecondary)
        }
    }
}

@Composable
private fun ResourceRow(resource: StrategicResource) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(10.dp))
            .background(SurfaceMuted)
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = resource.name,
                    style = Typography.titleMedium.copy(fontSize = 13.sp),
                    color = TextPrimary
                )
                Spacer(modifier = Modifier.width(6.dp))
                StatusPill(
                    text = "T${resource.tier}",
                    textColor = AccentTechBlue,
                    backgroundColor = AccentTechBlueLight
                )
            }
            Text(
                text = "${resource.description} | Estoque: ${NumberFormatter.formatCompact(resource.currentAmount)} ${resource.unit}",
                style = Typography.bodySmall.copy(fontSize = 10.sp),
                color = TextSecondary
            )
        }
        Text(
            text = NumberFormatter.formatCurrency(resource.basePrice),
            style = MonospaceSmall.copy(fontWeight = FontWeight.Bold),
            color = TextPrimary
        )
    }
}
