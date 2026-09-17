package com.dollardoctrine.ui.components.minigames

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
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
fun SwarmCoordinationMinigame(
    onDismiss: () -> Unit,
    onComplete: (success: Boolean, score: Int) -> Unit
) {
    var timer by remember { mutableIntStateOf(25) }
    var score by remember { mutableIntStateOf(0) }
    var interceptedCount by remember { mutableIntStateOf(0) }

    // 5x5 Grid of Sectors (25 tiles)
    // 0 = Empty, 1 = Hostile Fast Boat (Boat), 2 = Vectus Drone Deployed (Drone)
    var gridSectors by remember {
        mutableStateOf(
            List(25) { index ->
                SwarmTile(
                    id = index,
                    hasHostile = index == 3 || index == 11 || index == 21,
                    hasDrone = false
                )
            }
        )
    }

    LaunchedEffect(timer) {
        if (timer > 0) {
            delay(1000L)
            timer--

            // Periodicamente, lanchas tentam se mover para setores adjacentes
            if (timer % 3 == 0) {
                val currentHostiles = gridSectors.filter { it.hasHostile && !it.hasDrone }
                if (currentHostiles.isNotEmpty() && gridSectors.count { it.hasHostile } < 6) {
                    val emptyIndices = gridSectors.indices.filter { !gridSectors[it].hasHostile && !gridSectors[it].hasDrone }
                    if (emptyIndices.isNotEmpty()) {
                        val newSpot = emptyIndices.random()
                        gridSectors = gridSectors.toMutableList().also {
                            it[newSpot] = it[newSpot].copy(hasHostile = true)
                        }
                    }
                }
            }
        } else {
            val remainingHostiles = gridSectors.count { it.hasHostile && !it.hasDrone }
            val isSuccess = interceptedCount >= 4 && remainingHostiles <= 2
            onComplete(isSuccess, score)
        }
    }

    OperationalModal(
        title = "Coordenação de Enxame Vectus",
        subtitle = "Toque nos setores marítimos para despachar drones furtivos e cercar as lanchas hostis!",
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
                horizontalArrangement = Arrangement.SpaceAround
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("TEMPO RESTANTE", style = Typography.labelSmall, color = TextMuted)
                    Text("${timer}s", style = MonospaceLarge, color = if (timer < 8) AccentCrimson else TextPrimary)
                }
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("INTERCEPTADAS", style = Typography.labelSmall, color = TextMuted)
                    Text("$interceptedCount", style = MonospaceLarge, color = AccentTechBlue)
                }
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("PONTOS TÁTICOS", style = Typography.labelSmall, color = TextMuted)
                    Text("$score", style = MonospaceLarge, color = AccentEmerald)
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // 5x5 Tactical Matrix
            LazyVerticalGrid(
                columns = GridCells.Fixed(5),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(260.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                items(gridSectors, key = { it.id }) { tile ->
                    val bgColor = when {
                        tile.hasDrone && tile.hasHostile -> AccentEmeraldLight
                        tile.hasDrone -> AccentTechBlueLight
                        tile.hasHostile -> AccentCrimsonLight
                        else -> SurfaceWhite
                    }
                    val borderColor = when {
                        tile.hasDrone && tile.hasHostile -> AccentEmerald
                        tile.hasDrone -> AccentTechBlue
                        tile.hasHostile -> AccentCrimson
                        else -> SurfaceBorder
                    }

                    Box(
                        modifier = Modifier
                            .aspectRatio(1f)
                            .clip(RoundedCornerShape(8.dp))
                            .background(bgColor)
                            .border(1.5.dp, borderColor, RoundedCornerShape(8.dp))
                            .clickable {
                                if (tile.hasHostile && !tile.hasDrone) {
                                    // Interceptação com drone Vectus
                                    gridSectors = gridSectors.toMutableList().also {
                                        it[tile.id] = it[tile.id].copy(hasDrone = true)
                                    }
                                    interceptedCount++
                                    score += 250
                                } else if (!tile.hasDrone && !tile.hasHostile) {
                                    // Posiciona patrulha preventiva
                                    gridSectors = gridSectors.toMutableList().also {
                                        it[tile.id] = it[tile.id].copy(hasDrone = true)
                                    }
                                    score += 50
                                }
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = when {
                                tile.hasDrone && tile.hasHostile -> "💥"
                                tile.hasDrone -> "✈️"
                                tile.hasHostile -> "🚤"
                                else -> "·"
                            },
                            fontSize = if (tile.hasDrone || tile.hasHostile) 18.sp else 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (tile.hasDrone || tile.hasHostile) TextPrimary else TextMuted
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = "Legenda: [🚤] Lancha Inimiga | [✈️] Drone Vectus | [💥] Alvo Neutralizado",
                style = Typography.bodySmall.copy(fontSize = 10.sp),
                color = TextSecondary
            )
        }
    }
}

data class SwarmTile(
    val id: Int,
    val hasHostile: Boolean,
    val hasDrone: Boolean
)
