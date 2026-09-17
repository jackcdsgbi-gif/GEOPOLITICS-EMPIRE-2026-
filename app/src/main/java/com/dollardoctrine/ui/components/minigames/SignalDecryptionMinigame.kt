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
fun SignalDecryptionMinigame(
    onDismiss: () -> Unit,
    onComplete: (success: Boolean, score: Int) -> Unit
) {
    var timer by remember { mutableIntStateOf(20) }
    var currentFrequency by remember { mutableFloatStateOf(142.5f) }
    val targetFrequency = remember { 156.8f } // Frequência VHF marítima de ataque
    var cipherIndex by remember { mutableIntStateOf(0) }
    val requiredCodes = remember { listOf("DELTA-7", "ORMUZ-9", "VECTUS-X") }
    var score by remember { mutableIntStateOf(0) }

    val isFrequencyAligned = remember(currentFrequency) {
        kotlin.math.abs(currentFrequency - targetFrequency) < 0.8f
    }

    LaunchedEffect(timer) {
        if (timer > 0) {
            delay(1000L)
            timer--
        } else {
            val isSuccess = cipherIndex >= 2
            onComplete(isSuccess, score)
        }
    }

    OperationalModal(
        title = "Interceptação & Decodificação SIGINT",
        subtitle = "Ajuste a frequência de rádio militar e decodifique a transmissão inimiga!",
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
                Text("TEMPO: ${timer}s", style = MonospaceMedium, color = if (timer < 6) AccentCrimson else TextPrimary)
                Text("CÓDIGOS: $cipherIndex/3", style = MonospaceMedium, color = AccentTechBlue)
                Text("SCORE: $score", style = MonospaceMedium, color = AccentEmerald)
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Frequency Display Box
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .border(2.dp, if (isFrequencyAligned) AccentEmerald else AccentAmber, RoundedCornerShape(12.dp)),
                color = SurfaceWhite
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text("SINTONIA DE CANAL MILITAR (VHF)", style = Typography.labelSmall, color = TextMuted)
                    Text(
                        text = String.format("%.1f MHz", currentFrequency),
                        style = MonospaceLarge.copy(fontSize = 28.sp),
                        color = if (isFrequencyAligned) AccentEmerald else TextPrimary
                    )
                    Text(
                        text = if (isFrequencyAligned) "SINAL INTERCEPTADO: CLARO & NÍTIDO" else "RUIDO ESTÁTICO: AJUSTE O DIAL",
                        style = Typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                        color = if (isFrequencyAligned) AccentEmerald else AccentAmber
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Slider / Buttons to adjust frequency
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Button(
                    onClick = { currentFrequency = (currentFrequency - 2.5f).coerceAtLeast(120.0f) },
                    colors = ButtonDefaults.buttonColors(containerColor = SurfaceMuted),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("-2.5", color = TextPrimary, style = MonospaceSmall)
                }
                Button(
                    onClick = { currentFrequency = (currentFrequency - 0.5f).coerceAtLeast(120.0f) },
                    colors = ButtonDefaults.buttonColors(containerColor = SurfaceMuted),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("-0.5", color = TextPrimary, style = MonospaceSmall)
                }
                Button(
                    onClick = { currentFrequency = (currentFrequency + 0.5f).coerceAtMost(180.0f) },
                    colors = ButtonDefaults.buttonColors(containerColor = SurfaceMuted),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("+0.5", color = TextPrimary, style = MonospaceSmall)
                }
                Button(
                    onClick = { currentFrequency = (currentFrequency + 2.5f).coerceAtMost(180.0f) },
                    colors = ButtonDefaults.buttonColors(containerColor = SurfaceMuted),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("+2.5", color = TextPrimary, style = MonospaceSmall)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Decryption Option
            if (isFrequencyAligned && cipherIndex < requiredCodes.size) {
                Button(
                    onClick = {
                        cipherIndex++
                        score += 350
                        if (cipherIndex >= requiredCodes.size) {
                            onComplete(true, score + 500)
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = AccentTechBlue),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        text = "DECODIFICAR PACOTE: ${requiredCodes[cipherIndex]}",
                        style = Typography.labelLarge,
                        color = TextInverse
                    )
                }
            } else if (!isFrequencyAligned) {
                Text(
                    text = "Aproxime a frequência do alvo (156.8 MHz) para abrir o canal criptográfico.",
                    style = Typography.bodySmall,
                    color = TextSecondary
                )
            }
        }
    }
}
