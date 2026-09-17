package com.dollardoctrine.ui.screens.mundo

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dollardoctrine.core.designsystem.*
import com.dollardoctrine.data.model.Chokepoint

@Composable
fun InteractiveWorldMapCanvas(
    chokepoints: List<Chokepoint>,
    onSelectChokepoint: (Chokepoint) -> Unit,
    modifier: Modifier = Modifier
) {
    var selectedChokepoint by remember { mutableStateOf(chokepoints.find { it.id == "chk_ormuz" }) }

    val infiniteTransition = rememberInfiniteTransition(label = "shippingAnimation")
    val waveOffset by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 40f,
        animationSpec = infiniteRepeatable(
            animation = tween(2000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "waveOffset"
    )

    Column(modifier = modifier.fillMaxWidth()) {
        StrategicCard(
            title = "Painel Tático Global & Rotas de Petróleo",
            badgeText = "MAPA EM TEMPO REAL",
            badgeColor = AccentTechBlue,
            badgeBgColor = AccentTechBlueLight
        ) {
            Text(
                text = "Toque nos nós táticos dos 8 chokepoints para inspecionar fluxo de óleo cru, seguro e nível de prontidão militar:",
                style = Typography.bodyMedium,
                color = TextSecondary
            )

            Spacer(modifier = Modifier.height(14.dp))

            // Tactical Canvas
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(240.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(SurfaceWhite)
                    .border(1.5.dp, SurfaceBorder, RoundedCornerShape(16.dp))
            ) {
                Canvas(
                    modifier = Modifier
                        .fillMaxSize()
                        .pointerInput(Unit) {
                            detectTapGestures { tapOffset ->
                                val width = size.width
                                val height = size.height

                                // Mapeamento de coordenadas percentuais
                                val tapped = chokepoints.minByOrNull { chk ->
                                    val (cx, cy) = getChokepointCoordinates(chk.id, width, height)
                                    val distance = kotlin.math.hypot(tapOffset.x - cx, tapOffset.y - cy)
                                    distance
                                }

                                if (tapped != null) {
                                    val (cx, cy) = getChokepointCoordinates(tapped.id, width, height)
                                    if (kotlin.math.hypot(tapOffset.x - cx, tapOffset.y - cy) < 60f) {
                                        selectedChokepoint = tapped
                                        onSelectChokepoint(tapped)
                                    }
                                }
                            }
                        }
                ) {
                    val w = size.width
                    val h = size.height

                    // 1. Desenha linhas de rota de navegação animadas
                    val ormuz = getChokepointCoordinates("chk_ormuz", w, h)
                    val malacca = getChokepointCoordinates("chk_malaca", w, h)
                    val suez = getChokepointCoordinates("chk_suez", w, h)
                    val bab = getChokepointCoordinates("chk_bab_el_mandeb", w, h)
                    val baltic = getChokepointCoordinates("chk_baltico", w, h)
                    val panama = getChokepointCoordinates("chk_panama", w, h)

                    val dashEffect = PathEffect.dashPathEffect(floatArrayOf(15f, 10f), waveOffset)

                    // Ormuz -> Malaca (Rota da Ásia)
                    drawLine(
                        color = Color(0xFF94A3B8),
                        start = Offset(ormuz.first, ormuz.second),
                        end = Offset(malacca.first, malacca.second),
                        strokeWidth = 3f,
                        pathEffect = dashEffect
                    )

                    // Ormuz -> Bab el-Mandeb -> Suez (Rota Europeia)
                    drawLine(
                        color = Color(0xFF94A3B8),
                        start = Offset(ormuz.first, ormuz.second),
                        end = Offset(bab.first, bab.second),
                        strokeWidth = 3f,
                        pathEffect = dashEffect
                    )
                    drawLine(
                        color = Color(0xFF94A3B8),
                        start = Offset(bab.first, bab.second),
                        end = Offset(suez.first, suez.second),
                        strokeWidth = 3f,
                        pathEffect = dashEffect
                    )

                    // Suez -> Báltico
                    drawLine(
                        color = Color(0xFFCBD5E1),
                        start = Offset(suez.first, suez.second),
                        end = Offset(baltic.first, baltic.second),
                        strokeWidth = 2f,
                        pathEffect = dashEffect
                    )

                    // 2. Desenha os nós de cada Chokepoint
                    chokepoints.forEach { chk ->
                        val (cx, cy) = getChokepointCoordinates(chk.id, w, h)
                        val isSelected = chk.id == selectedChokepoint?.id

                        val nodeColor = when {
                            chk.riskLevelPercentage > 60.0 -> AccentCrimson
                            chk.riskLevelPercentage > 35.0 -> AccentAmber
                            else -> AccentEmerald
                        }

                        // Anel de seleção
                        if (isSelected) {
                            drawCircle(
                                color = nodeColor.copy(alpha = 0.25f),
                                radius = 22f,
                                center = Offset(cx, cy)
                            )
                        }

                        // Ponto central
                        drawCircle(
                            color = nodeColor,
                            radius = if (isSelected) 10f else 7f,
                            center = Offset(cx, cy)
                        )

                        drawCircle(
                            color = SurfaceWhite,
                            radius = if (isSelected) 4f else 3f,
                            center = Offset(cx, cy)
                        )
                    }
                }

                // Legenda flutuante no Canvas
                Box(
                    modifier = Modifier
                        .align(Alignment.BottomStart)
                        .padding(10.dp)
                        .clip(RoundedCornerShape(6.dp))
                        .background(SurfaceWhite.copy(alpha = 0.9f))
                        .border(1.dp, SurfaceBorder, RoundedCornerShape(6.dp))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "● Verde: Estável | ● Âmbar: Atenção | ● Vermelho: Risco Iminente",
                        style = Typography.labelSmall.copy(fontSize = 9.sp),
                        color = TextSecondary
                    )
                }
            }

            // Inspecção do nó selecionado
            selectedChokepoint?.let { chk ->
                Spacer(modifier = Modifier.height(12.dp))
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(SurfaceMuted)
                        .padding(12.dp),
                    color = SurfaceMuted
                ) {
                    Column {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = chk.name,
                                style = Typography.titleMedium.copy(fontSize = 14.sp),
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                            StatusPill(
                                text = "RISCO ${chk.riskLevelPercentage.toInt()}%",
                                textColor = if (chk.riskLevelPercentage > 50) AccentCrimson else AccentEmerald,
                                backgroundColor = if (chk.riskLevelPercentage > 50) AccentCrimsonLight else AccentEmeraldLight
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "${chk.region} • Fluxo: ${chk.dailyOilFlowMillionBarrels}M barris/dia • Seguro: ${chk.insuranceMultiplier}x",
                            style = Typography.bodySmall.copy(fontSize = 11.sp),
                            color = TextSecondary
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = chk.activeThreatDescription,
                            style = Typography.labelSmall.copy(color = TextPrimary)
                        )
                    }
                }
            }
        }
    }
}

private fun getChokepointCoordinates(id: String, width: Float, height: Float): Pair<Float, Float> {
    return when (id) {
        "chk_ormuz" -> Pair(width * 0.60f, height * 0.52f)
        "chk_malaca" -> Pair(width * 0.78f, height * 0.65f)
        "chk_suez" -> Pair(width * 0.52f, height * 0.44f)
        "chk_bab_el_mandeb" -> Pair(width * 0.55f, height * 0.58f)
        "chk_bosforo" -> Pair(width * 0.53f, height * 0.35f)
        "chk_panama" -> Pair(width * 0.25f, height * 0.62f)
        "chk_baltico" -> Pair(width * 0.48f, height * 0.25f)
        "chk_artico" -> Pair(width * 0.38f, height * 0.12f)
        else -> Pair(width * 0.5f, height * 0.5f)
    }
}
