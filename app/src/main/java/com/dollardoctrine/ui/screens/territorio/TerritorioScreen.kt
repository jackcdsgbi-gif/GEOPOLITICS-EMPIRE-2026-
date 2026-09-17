package com.dollardoctrine.ui.screens.territorio

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import com.dollardoctrine.core.utils.NumberFormatter
import com.dollardoctrine.data.model.DistrictTile
import com.dollardoctrine.data.model.GameState
import com.dollardoctrine.data.model.TileBiome
import com.dollardoctrine.data.model.TileState

@Composable
fun TerritorioScreen(
    gameState: GameState,
    onUnlockDistrict: (DistrictTile) -> Unit,
    onProspectBiome: (TileBiome) -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(SurfaceBackground)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(top = 12.dp, bottom = 100.dp)
    ) {
        // 1. Overview Card
        item {
            StrategicCard(
                title = "Geografia Soberana & Biomas",
                badgeText = "CAPITAL POLÍTICO: ${gameState.capitalPolitico} CP",
                badgeColor = AccentTechBlue,
                badgeBgColor = AccentTechBlueLight
            ) {
                Text(
                    text = "Gerencie a expansão territorial, anexe lotes fronteiriços e execute prospecção geológica para descobrir reservas minerais e petrolíferas ocultas:",
                    style = Typography.bodyMedium,
                    color = TextSecondary
                )
            }
        }

        // 2. Biomes of the Nation
        item {
            StrategicCard(
                title = "Biomas Reconhecidos no Território",
                badgeText = "5 ECOSSISTEMAS",
                badgeColor = AccentEmerald,
                badgeBgColor = AccentEmeraldLight
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    TileBiome.values().forEach { biome ->
                        Surface(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(10.dp))
                                .border(1.dp, SurfaceBorder, RoundedCornerShape(10.dp)),
                            color = SurfaceWhite
                        ) {
                            Row(
                                modifier = Modifier.padding(10.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(biome.icon, fontSize = 22.sp)
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Column {
                                        Text(biome.label, style = Typography.labelLarge.copy(fontSize = 12.sp), color = TextPrimary)
                                        Text(biome.bonusText, style = Typography.bodySmall.copy(fontSize = 10.sp, color = AccentEmerald))
                                    }
                                }
                                Button(
                                    onClick = { onProspectBiome(biome) },
                                    colors = ButtonDefaults.buttonColors(containerColor = AccentTechBlue),
                                    shape = RoundedCornerShape(8.dp),
                                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp),
                                    modifier = Modifier.height(28.dp)
                                ) {
                                    Text("Prospectar", style = Typography.labelSmall.copy(fontSize = 9.sp, color = TextInverse))
                                }
                            }
                        }
                    }
                }
            }
        }

        // 3. District Annexation Queue
        item {
            StrategicCard(
                title = "Lotes Territoriais Disponíveis para Anexação",
                badgeText = "EXPANSÃO",
                badgeColor = AccentGold,
                badgeBgColor = AccentGoldLight
            ) {
                val lockedTiles = gameState.districtsGrid.filter { it.state == TileState.LOCKED }
                if (lockedTiles.isEmpty()) {
                    Text("Todos os 9 distritos do setor metropolitano inicial já foram anexados e estão operacionais!", style = Typography.bodyMedium, color = AccentEmerald)
                } else {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        lockedTiles.forEach { tile ->
                            val canAfford = gameState.balance >= tile.unlockCost
                            Surface(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(10.dp))
                                    .border(1.dp, SurfaceBorder, RoundedCornerShape(10.dp)),
                                color = SurfaceWhite
                            ) {
                                Row(
                                    modifier = Modifier.padding(10.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(tile.biome.icon, fontSize = 20.sp)
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Column {
                                            Text(tile.name, style = Typography.labelLarge.copy(fontSize = 12.sp), color = TextPrimary)
                                            Text("Bioma: ${tile.biome.label}", style = Typography.bodySmall.copy(fontSize = 10.sp, color = TextMuted))
                                        }
                                    }
                                    Button(
                                        onClick = { onUnlockDistrict(tile) },
                                        enabled = canAfford,
                                        colors = ButtonDefaults.buttonColors(containerColor = AccentEmerald),
                                        shape = RoundedCornerShape(8.dp),
                                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp),
                                        modifier = Modifier.height(28.dp)
                                    ) {
                                        Text(
                                            "Anexar (${NumberFormatter.formatCurrency(tile.unlockCost)})",
                                            style = Typography.labelSmall.copy(fontSize = 9.sp, color = TextInverse)
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
}
