package com.dollardoctrine.ui.components.minigames

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dollardoctrine.core.designsystem.*
import kotlinx.coroutines.delay

@Composable
fun LNGDefenseMinigame(
    onDismiss: () -> Unit,
    onComplete: (success: Boolean, score: Int) -> Unit
) {
    var timer by remember { mutableIntStateOf(18) }
    var tank1Pressure by remember { mutableFloatStateOf(32.0f) }
    var tank2Pressure by remember { mutableFloatStateOf(28.0f) }
    var tank3Pressure by remember { mutableFloatStateOf(35.0f) }
    var score by remember { mutableIntStateOf(0) }

    LaunchedEffect(timer) {
        if (timer > 0) {
            delay(1000L)
            timer--
            // Pressão sobe naturalmente por causa da sabotagem
            tank1Pressure = (tank1Pressure + 1.8f).coerceAtMost(50f)
            tank2Pressure = (tank2Pressure + 2.1f).coerceAtMost(50f)
            tank3Pressure = (tank3Pressure + 1.5f).coerceAtMost(50f)

            if (tank1Pressure >= 48f || tank2Pressure >= 48f || tank3Pressure >= 48f) {
                // Explosão iminente
            }
        } else {
            val allSafe = tank1Pressure < 38f && tank2Pressure < 38f && tank3Pressure < 38f
            onComplete(allSafe, score)
        }
    }

    OperationalModal(
        title = "Defesa do Terminal Criogênico LNG",
        subtitle = "Alivie a sobrepressão dos tanques de gás liquefeito tocando nas válvulas!",
        onDismissRequest = onDismiss
    ) {
        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(SurfaceMuted)
                    .padding(10.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("TEMPO RESTANTE: ${timer}s", style = MonospaceMedium, color = if (timer < 6) AccentCrimson else TextPrimary)
                Text("PONTOS: $score", style = MonospaceMedium, color = AccentEmerald)
            }

            Spacer(modifier = Modifier.height(16.dp))

            // 3 Tanks Pressure Gauges
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                TankPressureColumn(
                    tankName = "Tanque A",
                    pressure = tank1Pressure,
                    modifier = Modifier.weight(1f),
                    onVent = {
                        tank1Pressure = (tank1Pressure - 6.5f).coerceAtLeast(10f)
                        score += 50
                    }
                )
                TankPressureColumn(
                    tankName = "Tanque B",
                    pressure = tank2Pressure,
                    modifier = Modifier.weight(1f),
                    onVent = {
                        tank2Pressure = (tank2Pressure - 6.5f).coerceAtLeast(10f)
                        score += 50
                    }
                )
                TankPressureColumn(
                    tankName = "Tanque C",
                    pressure = tank3Pressure,
                    modifier = Modifier.weight(1f),
                    onVent = {
                        tank3Pressure = (tank3Pressure - 6.5f).coerceAtLeast(10f)
                        score += 50
                    }
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            Text(
                text = "Mantenha a pressão abaixo de 38 bar até que os técnicos concluam o isolamento da sabotagem.",
                style = Typography.bodySmall,
                color = TextSecondary
            )
        }
    }
}

@Composable
private fun TankPressureColumn(
    tankName: String,
    pressure: Float,
    modifier: Modifier = Modifier,
    onVent: () -> Unit
) {
    val isCritical = pressure > 40f
    val isWarning = pressure > 34f
    val color = when {
        isCritical -> AccentCrimson
        isWarning -> AccentAmber
        else -> AccentEmerald
    }

    Surface(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .border(1.5.dp, color, RoundedCornerShape(12.dp)),
        color = SurfaceWhite
    ) {
        Column(
            modifier = Modifier.padding(10.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(tankName, style = Typography.labelSmall.copy(fontWeight = FontWeight.Bold), color = TextPrimary)
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = String.format("%.1f", pressure),
                style = MonospaceLarge.copy(fontSize = 18.sp),
                color = color
            )
            Text("bar", style = MonospaceSmall.copy(fontSize = 10.sp), color = TextMuted)
            Spacer(modifier = Modifier.height(10.dp))
            Button(
                onClick = onVent,
                colors = ButtonDefaults.buttonColors(containerColor = color),
                shape = RoundedCornerShape(8.dp),
                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                modifier = Modifier.height(32.dp)
            ) {
                Text("ALIVIAR", style = Typography.labelSmall.copy(fontSize = 9.sp, color = TextInverse))
            }
        }
    }
}
