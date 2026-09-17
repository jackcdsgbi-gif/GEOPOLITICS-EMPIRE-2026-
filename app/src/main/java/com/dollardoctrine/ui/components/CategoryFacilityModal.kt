package com.dollardoctrine.ui.components

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
import com.dollardoctrine.data.model.CategoryDefinition
import com.dollardoctrine.data.model.DefaultCategoriesAndFacilities
import com.dollardoctrine.data.model.FacilityDefinition
import java.math.BigDecimal

@Composable
fun CategorySelectionModal(
    playerLevel: Int,
    onDismiss: () -> Unit,
    onSelectCategory: (CategoryDefinition) -> Unit
) {
    OperationalModal(
        title = "DIRETÓRIO DE CONSTRUÇÃO",
        subtitle = "Selecione uma categoria para abrir o catálogo de instalações:",
        onDismissRequest = onDismiss
    ) {
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            items(DefaultCategoriesAndFacilities.categories) { category ->
                val isUnlocked = playerLevel >= category.unlockLevel

                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .border(1.dp, if (isUnlocked) SurfaceBorder else SurfaceBorderSubtle, RoundedCornerShape(12.dp))
                        .clickable(enabled = isUnlocked) { onSelectCategory(category) },
                    color = if (isUnlocked) SurfaceWhite else SurfaceMuted.copy(alpha = 0.5f)
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                            Text(category.icon, fontSize = 24.sp)
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text(
                                    text = category.name,
                                    style = Typography.titleMedium.copy(fontSize = 13.sp),
                                    fontWeight = FontWeight.Bold,
                                    color = if (isUnlocked) TextPrimary else TextMuted
                                )
                                Text(
                                    text = category.description,
                                    style = Typography.bodySmall.copy(fontSize = 10.sp),
                                    color = if (isUnlocked) TextSecondary else TextMuted
                                )
                            }
                        }
                        StatusPill(
                            text = if (isUnlocked) "${category.facilitiesCount} OBRAS" else "REQ. NV. ${category.unlockLevel}",
                            textColor = if (isUnlocked) AccentTechBlue else TextMuted,
                            backgroundColor = if (isUnlocked) AccentTechBlueLight else SurfaceMuted
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun FacilitySelectionModal(
    category: CategoryDefinition,
    playerBalance: BigDecimal,
    playerLevel: Int,
    onDismiss: () -> Unit,
    onBuildFacility: (FacilityDefinition) -> Unit
) {
    val facilities = remember(category.id) {
        DefaultCategoriesAndFacilities.facilities.filter { it.categoryId == category.id }
    }

    OperationalModal(
        title = "${category.icon} ${category.name}",
        subtitle = "Plantas de engenharia e instalações autorizadas:",
        onDismissRequest = onDismiss
    ) {
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(10.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            items(facilities) { fac ->
                val canAfford = playerBalance >= fac.dollarCost
                val isLevelMet = playerLevel >= fac.requiredLevel
                val isAvailable = canAfford && isLevelMet

                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .border(1.dp, if (isAvailable) SurfaceBorder else SurfaceBorderSubtle, RoundedCornerShape(12.dp)),
                    color = SurfaceWhite
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = fac.name,
                                style = Typography.titleMedium.copy(fontSize = 13.sp),
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                            StatusPill(
                                text = NumberFormatter.formatCurrency(fac.dollarCost),
                                textColor = if (canAfford) AccentEmerald else AccentCrimson,
                                backgroundColor = if (canAfford) AccentEmeraldLight else AccentCrimsonLight
                            )
                        }

                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = fac.description,
                            style = Typography.bodySmall.copy(fontSize = 11.sp),
                            color = TextSecondary
                        )

                        Spacer(modifier = Modifier.height(8.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = "Entrada: ${fac.primaryInputText} ➔ Saída: ${fac.primaryOutputText}",
                                    style = Typography.labelSmall.copy(fontSize = 10.sp, color = AccentTechBlue)
                                )
                                Text(
                                    text = "Rendimento: +${NumberFormatter.formatCurrency(fac.revenuePerSecond)}/s | Operários: ${fac.workersRequired}",
                                    style = Typography.labelSmall.copy(fontSize = 9.sp, color = TextMuted)
                                )
                            }

                            Button(
                                onClick = { onBuildFacility(fac) },
                                enabled = isAvailable,
                                colors = ButtonDefaults.buttonColors(containerColor = AccentTechBlue),
                                shape = RoundedCornerShape(8.dp),
                                contentPadding = PaddingValues(horizontal = 14.dp, vertical = 4.dp),
                                modifier = Modifier.height(30.dp)
                            ) {
                                Text(
                                    text = if (!isLevelMet) "Req. Nv. ${fac.requiredLevel}" else "Construir",
                                    style = Typography.labelSmall.copy(fontSize = 10.sp, color = TextInverse)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
