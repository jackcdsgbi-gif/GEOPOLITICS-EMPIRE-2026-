package com.dollardoctrine.ui.components.minigames

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
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
import kotlinx.coroutines.delay

@Composable
fun OrmuzDefenseMinigame(
    onDismiss: () -> Unit,
    onComplete: (success: Boolean, score: Int) -> Unit
) {
    var score by remember { mutableIntStateOf(0) }
    var tankerIntegrity by remember { mutableIntStateOf(100) }
    var timeRemaining by remember { mutableIntStateOf(25) }
    var targets by remember {
        mutableStateOf(
            listOf(
                TargetBoat(1, 0.2f, 0.3f, true),
                TargetBoat(2, 0.7f, 0.4f, true),
                TargetBoat(3, 0.4f, 0.6f, true)
            )
        )
    }

    // Timer tick
    LaunchedEffect(timeRemaining, tankerIntegrity) {
        if (timeRemaining > 0 && tankerIntegrity > 0) {
            delay(1000L)
            timeRemaining--
            // Occasionally hit tanker if targets remain
            val activeCount = targets.count { it.isActive }
            if (activeCount > 0 && timeRemaining % 3 == 0) {
                tankerIntegrity = (tankerIntegrity - (activeCount * 4)).coerceAtLeast(0)
            }
            // Spawn new targets periodically
            if (timeRemaining % 4 == 0 && targets.size < 8) {
                val newId = targets.size + 1
                val randomX = ((timeRemaining * 17) % 80 + 10) / 100f
                val randomY = ((timeRemaining * 31) % 60 + 20) / 100f
                targets = targets + TargetBoat(newId, randomX, randomY, true)
            }
        } else {
            val isSuccess = tankerIntegrity > 0
            onComplete(isSuccess, score)
        }
    }

    OperationalModal(
        title = "Intercepção no Estreito de Ormuz",
        subtitle = "Toque nas ameaças navais para enviar drones Vectus antes que atinjam os petroleiros!",
        onDismissRequest = onDismiss
    ) {
        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Live Status Bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(SurfaceMuted)
                    .padding(12.dp),
                horizontalArrangement = Arrangement.SpaceAround
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("TEMPO RESTANTE", style = Typography.labelSmall, color = TextMuted)
                    Text("${timeRemaining}s", style = MonospaceLarge, color = if (timeRemaining < 10) AccentCrimson else TextPrimary)
                }
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("INTEGRIDADE PETROLEIRO", style = Typography.labelSmall, color = TextMuted)
                    Text("$tankerIntegrity%", style = MonospaceLarge, color = if (tankerIntegrity < 40) AccentCrimson else AccentEmerald)
                }
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("INCURSÕES NEUTRALIZADAS", style = Typography.labelSmall, color = TextMuted)
                    Text("$score", style = MonospaceLarge, color = AccentTechBlue)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Tactical Radar Arena (Clean White with Grid Lines)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(280.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(SurfaceWhite)
                    .border(2.dp, SurfaceBorder, RoundedCornerShape(16.dp))
            ) {
                // Central Oil Tanker Icon
                Box(
                    modifier = Modifier
                        .align(Alignment.Center)
                        .size(54.dp)
                        .clip(CircleShape)
                        .background(AccentEmeraldLight)
                        .border(2.dp, AccentEmerald, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Text("⚓", fontSize = 24.sp)
                }

                // Render Targets
                targets.filter { it.isActive }.forEach { target ->
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .align(Alignment.TopStart)
                                .offset(
                                    x = (target.x * 240).dp,
                                    y = (target.y * 200).dp
                                )
                                .size(46.dp)
                                .clip(CircleShape)
                                .background(AccentCrimsonLight)
                                .border(2.dp, AccentCrimson, CircleShape)
                                .clickable {
                                    targets = targets.map {
                                        if (it.id == target.id) it.copy(isActive = false) else it
                                    }
                                    score++
                                },
                            contentAlignment = Alignment.Center
                        ) {
                            Text("🚤", fontSize = 20.sp)
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = "⚡ Vetores Furtivos Vectus prontos na catapulta de lançamento.",
                style = Typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                color = AccentTechBlue
            )
        }
    }
}

data class TargetBoat(
    val id: Int,
    val x: Float,
    val y: Float,
    val isActive: Boolean
)
