package com.dollardoctrine.ui.screens.fundacao

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dollardoctrine.core.designsystem.*
import com.dollardoctrine.core.utils.NumberFormatter
import com.dollardoctrine.data.model.DistrictTile
import com.dollardoctrine.data.model.GameState
import com.dollardoctrine.data.model.TileState

@Composable
fun FundacaoScreen(
    gameState: GameState,
    onTapAction: () -> Unit,
    onTileClick: (DistrictTile) -> Unit,
    onOpenCrisis: (String) -> Unit
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.93f else 1.0f,
        animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy),
        label = "tapScale"
    )

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(SurfaceBackground)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(top = 12.dp, bottom = 100.dp)
    ) {
        // 1. Central 180dp Tap Button & Foundation Header
        item {
            StrategicCard(
                title = "Centro de Comando Nacional",
                badgeText = "${gameState.gameTime.currentCycleName.uppercase()} • ${gameState.gameTime.formattedDate}",
                badgeColor = AccentTechBlue,
                badgeBgColor = AccentTechBlueLight
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Toque no Núcleo de Soberania para injetar liquidez nacional imediata.",
                        style = Typography.bodyMedium,
                        color = TextSecondary
                    )

                    Spacer(modifier = Modifier.height(18.dp))

                    // 180dp Circular Button with Elevation & Soft Glow
                    Box(
                        modifier = Modifier
                            .size(180.dp)
                            .scale(scale)
                            .shadow(16.dp, CircleShape, spotColor = Color(0x242563EB))
                            .clip(CircleShape)
                            .background(SurfaceWhite)
                            .border(3.5.dp, AccentTechBlue, CircleShape)
                            .clickable(
                                interactionSource = interactionSource,
                                indication = null,
                                onClick = onTapAction
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("🏛️", fontSize = 48.sp)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "+${NumberFormatter.formatCurrency(gameState.tapPower)}",
                                style = MonospaceMedium.copy(fontWeight = FontWeight.Black, fontSize = 16.sp),
                                color = AccentTechBlue
                            )
                            Text(
                                text = "NÚCLEO SOBERANO",
                                style = Typography.labelSmall.copy(fontSize = 8.sp, fontWeight = FontWeight.Bold),
                                color = TextMuted
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceAround
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("PRODUÇÃO PASSIVA", style = Typography.labelSmall, color = TextMuted)
                            Text(NumberFormatter.formatRate(gameState.incomePerSecond), style = MonospaceSmall, color = AccentEmerald)
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("CAPITAL POLÍTICO", style = Typography.labelSmall, color = TextMuted)
                            Text("${gameState.capitalPolitico} CP", style = MonospaceSmall, color = AccentTechBlue)
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("POPULAÇÃO", style = Typography.labelSmall, color = TextMuted)
                            Text(NumberFormatter.formatInteger(gameState.population), style = MonospaceSmall, color = TextPrimary)
                        }
                    }
                }
            }
        }

        // 2. Active 3x3 District Viewport
        item {
            StrategicCard(
                title = "Grid Territorial Ativo (3×3)",
                badgeText = "9 DISTRITOS",
                badgeColor = AccentEmerald,
                badgeBgColor = AccentEmeraldLight
            ) {
                Text(
                    text = "Toque em um distrito vazio para construir ou em um distrito ativo para inspecionar:",
                    style = Typography.bodyMedium,
                    color = TextSecondary
                )

                Spacer(modifier = Modifier.height(12.dp))

                // 3x3 Square Tile Grid
                LazyVerticalGrid(
                    columns = GridCells.Fixed(3),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(310.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(gameState.districtsGrid, key = { it.id }) { tile ->
                        SquareDistrictTile(
                            tile = tile,
                            onClick = { onTileClick(tile) }
                        )
                    }
                }
            }
        }

        // 3. Active Crises Alerts on Foundation
        if (gameState.activeCrises.isNotEmpty()) {
            item {
                gameState.activeCrises.forEach { crisis ->
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(16.dp))
                            .background(AccentCrimsonLight)
                            .border(1.5.dp, AccentCrimson, RoundedCornerShape(16.dp))
                            .clickable { onOpenCrisis(crisis.id) }
                            .padding(14.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "🚨 CRISE EM ANDAMENTO: ${crisis.title}",
                                    style = Typography.titleMedium.copy(fontSize = 13.sp),
                                    fontWeight = FontWeight.Bold,
                                    color = AccentCrimson
                                )
                                Text(
                                    text = crisis.contextDescription,
                                    style = Typography.bodySmall.copy(fontSize = 11.sp),
                                    color = TextPrimary,
                                    maxLines = 2
                                )
                            }
                            Spacer(modifier = Modifier.width(8.dp))
                            StatusPill(
                                text = "RESPONDER",
                                textColor = TextInverse,
                                backgroundColor = AccentCrimson
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun SquareDistrictTile(
    tile: DistrictTile,
    onClick: () -> Unit
) {
    val borderColor = when (tile.state) {
        TileState.ACTIVE -> AccentEmerald
        TileState.BUILDING -> AccentTechBlue
        TileState.EMPTY -> SurfaceBorder
        TileState.LOCKED -> SurfaceBorderSubtle
        TileState.ALERT -> AccentCrimson
    }

    val bgColor = when (tile.state) {
        TileState.ACTIVE -> SurfaceWhite
        TileState.BUILDING -> AccentTechBlueLight.copy(alpha = 0.3f)
        TileState.EMPTY -> SurfaceWhite
        TileState.LOCKED -> SurfaceMuted.copy(alpha = 0.6f)
        TileState.ALERT -> AccentCrimsonLight
    }

    Surface(
        modifier = Modifier
            .aspectRatio(1f)
            .clip(RoundedCornerShape(12.dp))
            .border(1.5.dp, borderColor, RoundedCornerShape(12.dp))
            .clickable(onClick = onClick),
        color = bgColor
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(6.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            when (tile.state) {
                TileState.ACTIVE -> {
                    Text(tile.facilityIcon ?: tile.biome.icon, fontSize = 24.sp)
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = tile.facilityName ?: tile.name,
                        style = Typography.labelSmall.copy(fontSize = 9.sp, fontWeight = FontWeight.Bold),
                        color = TextPrimary,
                        maxLines = 1
                    )
                    Text(
                        text = "Nv. ${tile.level}",
                        style = Typography.labelSmall.copy(fontSize = 8.sp, color = AccentTechBlue)
                    )
                }
                TileState.EMPTY -> {
                    Text(tile.biome.icon, fontSize = 22.sp)
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "Livre",
                        style = Typography.labelSmall.copy(fontSize = 10.sp, fontWeight = FontWeight.Bold),
                        color = AccentTechBlue
                    )
                    Text("+Construir", style = Typography.labelSmall.copy(fontSize = 8.sp, color = TextMuted))
                }
                TileState.LOCKED -> {
                    Text("🔒", fontSize = 20.sp)
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = NumberFormatter.formatCurrency(tile.unlockCost),
                        style = MonospaceSmall.copy(fontSize = 9.sp),
                        color = TextMuted
                    )
                    Text("Anexar", style = Typography.labelSmall.copy(fontSize = 8.sp, color = TextMuted))
                }
                TileState.BUILDING -> {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        strokeWidth = 3.dp,
                        color = AccentTechBlue
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("Obras...", style = Typography.labelSmall.copy(fontSize = 8.sp, color = AccentTechBlue))
                }
                TileState.ALERT -> {
                    Text("⚠️", fontSize = 22.sp)
                    Spacer(modifier = Modifier.height(2.dp))
                    Text("Gargalo!", style = Typography.labelSmall.copy(fontSize = 9.sp, color = AccentCrimson))
                }
            }
        }
    }
}
