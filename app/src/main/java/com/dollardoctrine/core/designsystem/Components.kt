package com.dollardoctrine.core.designsystem

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties

/**
 * Modern Clean White Card with Subtle Border and Header
 */
@Composable
fun StrategicCard(
    modifier: Modifier = Modifier,
    title: String? = null,
    badgeText: String? = null,
    badgeColor: Color = AccentTechBlue,
    badgeBgColor: Color = AccentTechBlueLight,
    actionButtonText: String? = null,
    onActionClick: (() -> Unit)? = null,
    content: @Composable ColumnScope.() -> Unit
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .shadow(elevation = 2.dp, shape = RoundedCornerShape(16.dp), spotColor = Color(0x0A000000))
            .border(width = 1.dp, color = SurfaceBorder, shape = RoundedCornerShape(16.dp)),
        colors = CardDefaults.cardColors(containerColor = SurfaceCard),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            if (title != null || badgeText != null) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    if (title != null) {
                        Text(
                            text = title,
                            style = Typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                    }
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        if (badgeText != null) {
                            StatusPill(
                                text = badgeText,
                                textColor = badgeColor,
                                backgroundColor = badgeBgColor
                            )
                        }
                        if (actionButtonText != null && onActionClick != null) {
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = actionButtonText,
                                style = Typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                color = AccentTechBlue,
                                modifier = Modifier
                                    .clickable(onClick = onActionClick)
                                    .padding(4.dp)
                            )
                        }
                    }
                }
            }
            content()
        }
    }
}

/**
 * Compact Status Pill with high-contrast text and rounded edges
 */
@Composable
fun StatusPill(
    text: String,
    textColor: Color,
    backgroundColor: Color,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(8.dp))
            .background(backgroundColor)
            .padding(horizontal = 8.dp, vertical = 4.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = text.uppercase(),
            style = Typography.labelSmall.copy(
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 0.5.sp
            ),
            color = textColor
        )
    }
}

/**
 * Animated Indicator with glowing colored dot and pulse animation
 */
@Composable
fun AnimatedIndicator(
    label: String,
    value: String,
    indicatorColor: Color,
    isPulsing: Boolean = false,
    onClick: (() -> Unit)? = null
) {
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val alpha by if (isPulsing) {
        infiniteTransition.animateFloat(
            initialValue = 0.4f,
            targetValue = 1f,
            animationSpec = infiniteRepeatable(
                animation = tween(800, easing = LinearEasing),
                repeatMode = RepeatMode.Reverse
            ),
            label = "pulseAlpha"
        )
    } else {
        remember { mutableFloatStateOf(1f) }
    }

    Surface(
        modifier = Modifier
            .clip(RoundedCornerShape(10.dp))
            .border(1.dp, SurfaceBorder, RoundedCornerShape(10.dp))
            .clickable(enabled = onClick != null) { onClick?.invoke() },
        color = SurfaceWhite
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(7.dp)
                    .clip(CircleShape)
                    .background(indicatorColor.copy(alpha = alpha))
            )
            Spacer(modifier = Modifier.width(6.dp))
            Column {
                Text(
                    text = label.uppercase(),
                    style = Typography.labelSmall.copy(fontSize = 8.sp, fontWeight = FontWeight.SemiBold),
                    color = TextMuted
                )
                Text(
                    text = value,
                    style = MonospaceSmall.copy(fontSize = 12.sp, fontWeight = FontWeight.Bold),
                    color = TextPrimary
                )
            }
        }
    }
}

/**
 * Modern Operational Modal for Crises, Dossiers, and Briefings
 */
@Composable
fun OperationalModal(
    title: String,
    subtitle: String? = null,
    onDismissRequest: () -> Unit,
    confirmText: String? = null,
    onConfirm: (() -> Unit)? = null,
    confirmColor: Color = AccentTechBlue,
    content: @Composable ColumnScope.() -> Unit
) {
    Dialog(
        onDismissRequest = onDismissRequest,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.45f))
                .clickable(
                    interactionSource = remember { MutableInteractionSource() },
                    indication = null,
                    onClick = onDismissRequest
                ),
            contentAlignment = Alignment.Center
        ) {
            Surface(
                modifier = Modifier
                    .fillMaxWidth(0.92f)
                    .clip(RoundedCornerShape(20.dp))
                    .border(1.dp, SurfaceBorder, RoundedCornerShape(20.dp))
                    .clickable(
                        interactionSource = remember { MutableInteractionSource() },
                        indication = null,
                        onClick = {} // Intercept clicks
                    ),
                color = SurfaceWhite,
                shadowElevation = 16.dp
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = title,
                                style = Typography.titleLarge,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                            if (subtitle != null) {
                                Text(
                                    text = subtitle,
                                    style = Typography.bodyMedium,
                                    color = TextSecondary
                                )
                            }
                        }
                        IconButton(onClick = onDismissRequest) {
                            Icon(
                                imageVector = Icons.Default.Close,
                                contentDescription = "Fechar",
                                tint = TextSecondary
                            )
                        }
                    }

                    HorizontalDivider(
                        modifier = Modifier.padding(vertical = 12.dp),
                        color = SurfaceBorderSubtle
                    )

                    content()

                    if (confirmText != null && onConfirm != null) {
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(
                            onClick = onConfirm,
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(containerColor = confirmColor),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text(
                                text = confirmText,
                                style = Typography.labelLarge,
                                color = TextInverse
                            )
                        }
                    }
                }
            }
        }
    }
}

/**
 * Floating Tab Bar with Icons and Badges
 */
@Composable
fun FloatingTabBar(
    tabs: List<Pair<String, ImageVector>>,
    selectedTabIndex: Int,
    onTabSelected: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier
            .padding(horizontal = 16.dp, vertical = 8.dp)
            .shadow(8.dp, RoundedCornerShape(28.dp), spotColor = Color(0x1A000000))
            .border(1.dp, SurfaceBorder, RoundedCornerShape(28.dp)),
        color = SurfaceWhite,
        shape = RoundedCornerShape(28.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 6.dp, horizontal = 6.dp),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically
        ) {
            tabs.forEachIndexed { index, (label, icon) ->
                val isSelected = selectedTabIndex == index
                val bgColor = if (isSelected) AccentTechBlueLight else Color.Transparent
                val contentColor = if (isSelected) AccentTechBlue else TextSecondary

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(bgColor)
                        .clickable { onTabSelected(index) }
                        .padding(horizontal = 14.dp, vertical = 8.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = icon,
                            contentDescription = label,
                            tint = contentColor,
                            modifier = Modifier.size(18.dp)
                        )
                        if (isSelected) {
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = label,
                                style = Typography.labelLarge.copy(fontSize = 12.sp),
                                color = contentColor
                            )
                        }
                    }
                }
            }
        }
    }
}

/**
 * Expandable Action Speed Dial FAB
 */
@Composable
fun ExpandableActionButton(
    isExpanded: Boolean,
    onToggle: () -> Unit,
    items: List<ExpandableItem>
) {
    Column(
        horizontalAlignment = Alignment.End,
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        AnimatedVisibility(
            visible = isExpanded,
            enter = fadeIn() + expandVertically(expandFrom = Alignment.Bottom),
            exit = fadeOut() + shrinkVertically(shrinkTowards = Alignment.Bottom)
        ) {
            Column(
                horizontalAlignment = Alignment.End,
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items.forEach { item ->
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier
                            .clickable {
                                item.onClick()
                                onToggle()
                            }
                            .padding(end = 4.dp)
                    ) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = SurfaceWhite,
                            shadowElevation = 3.dp,
                            border = androidx.compose.foundation.BorderStroke(1.dp, SurfaceBorder)
                        ) {
                            Text(
                                text = item.label,
                                style = Typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                                color = TextPrimary,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                            )
                        }
                        FloatingActionButton(
                            onClick = {
                                item.onClick()
                                onToggle()
                            },
                            modifier = Modifier.size(44.dp),
                            containerColor = item.containerColor,
                            contentColor = TextInverse,
                            shape = CircleShape,
                            elevation = FloatingActionButtonDefaults.elevation(4.dp)
                        ) {
                            Icon(
                                imageVector = item.icon,
                                contentDescription = item.label,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }
                }
            }
        }

        FloatingActionButton(
            onClick = onToggle,
            containerColor = AccentTechBlue,
            contentColor = TextInverse,
            shape = CircleShape,
            elevation = FloatingActionButtonDefaults.elevation(6.dp)
        ) {
            Text(
                text = if (isExpanded) "✕" else "⚡",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

data class ExpandableItem(
    val label: String,
    val icon: ImageVector,
    val containerColor: Color,
    val onClick: () -> Unit
)
