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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dollardoctrine.core.designsystem.*
import kotlinx.coroutines.delay

@Composable
fun CyberContainmentMinigame(
    onDismiss: () -> Unit,
    onComplete: (success: Boolean, score: Int) -> Unit
) {
    var timer by remember { mutableIntStateOf(20) }
    var purifiedNodes by remember { mutableIntStateOf(0) }
    var nodes by remember {
        mutableStateOf(
            List(16) { index ->
                CyberNode(id = index, isInfected = index % 3 == 0)
            }
        )
    }

    LaunchedEffect(timer) {
        if (timer > 0) {
            delay(1000L)
            timer--
            // Randomly infect a clean node if any
            if (timer % 2 == 0) {
                val cleanIndices = nodes.indices.filter { !nodes[it].isInfected }
                if (cleanIndices.isNotEmpty()) {
                    val targetIndex = cleanIndices.random()
                    nodes = nodes.toMutableList().also {
                        it[targetIndex] = it[targetIndex].copy(isInfected = true)
                    }
                }
            }
        } else {
            val infectedCount = nodes.count { it.isInfected }
            val isSuccess = infectedCount <= 3
            onComplete(isSuccess, purifiedNodes)
        }
    }

    OperationalModal(
        title = "Contenção Cibernética SCADA",
        subtitle = "Isole e purifique os servidores infectados por malware antes do colapso da rede elétrica!",
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
                    .padding(12.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("TEMPO: ${timer}s", style = MonospaceMedium, color = if (timer < 7) AccentCrimson else TextPrimary)
                Text("PURIFICADOS: $purifiedNodes", style = MonospaceMedium, color = AccentCyberPurple)
                Text("INFECTADOS: ${nodes.count { it.isInfected }}", style = MonospaceMedium, color = AccentCrimson)
            }

            Spacer(modifier = Modifier.height(16.dp))

            // 4x4 Grid of Server Nodes
            LazyVerticalGrid(
                columns = GridCells.Fixed(4),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(240.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(nodes, key = { it.id }) { node ->
                    val bgColor = if (node.isInfected) AccentCrimsonLight else AccentEmeraldLight
                    val borderColor = if (node.isInfected) AccentCrimson else AccentEmerald
                    val label = if (node.isInfected) "☣" else "🛡"

                    Box(
                        modifier = Modifier
                            .aspectRatio(1f)
                            .clip(RoundedCornerShape(12.dp))
                            .background(bgColor)
                            .border(2.dp, borderColor, RoundedCornerShape(12.dp))
                            .clickable {
                                if (node.isInfected) {
                                    nodes = nodes.toMutableList().also {
                                        it[node.id] = it[node.id].copy(isInfected = false)
                                    }
                                    purifiedNodes++
                                }
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Text(text = label, fontSize = 22.sp)
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = "Toque nos nós em vermelho com símbolo [☣] para aplicar patches quânticos de firewall.",
                style = Typography.bodyMedium,
                color = TextSecondary
            )
        }
    }
}

data class CyberNode(
    val id: Int,
    val isInfected: Boolean
)
