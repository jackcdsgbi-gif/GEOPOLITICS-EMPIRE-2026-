package com.dollardoctrine

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.dollardoctrine.core.designsystem.*
import com.dollardoctrine.ui.components.*
import com.dollardoctrine.ui.components.minigames.*
import com.dollardoctrine.ui.screens.cadeia.CadeiaScreen
import com.dollardoctrine.ui.screens.defesa.DefesaScreen
import com.dollardoctrine.ui.screens.fundacao.FundacaoScreen
import com.dollardoctrine.ui.screens.instituicoes.InstituicoesScreen
import com.dollardoctrine.ui.screens.mundo.MundoScreen
import com.dollardoctrine.ui.screens.tech.TechTreeScreen
import com.dollardoctrine.ui.screens.territorio.TerritorioScreen
import com.dollardoctrine.ui.viewmodel.GameViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: GameViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            DollarDoctrineTheme {
                val gameState by viewModel.gameState.collectAsState()
                val selectedTab by viewModel.selectedTabIndex.collectAsState()
                val isIntelRailOpen by viewModel.isIntelligenceRailOpen.collectAsState()
                val activeCrisisModalId by viewModel.activeCrisisIdForModal.collectAsState()
                val isFabOpen by viewModel.isExpandableFabOpen.collectAsState()
                val isTechTreeOpen by viewModel.isTechTreeOpen.collectAsState()
                val selectedTileForBuild by viewModel.selectedTileForBuild.collectAsState()
                val selectedCategoryForFacility by viewModel.selectedCategoryForFacility.collectAsState()

                var showOnboarding by remember { mutableStateOf(!gameState.hasSeenOnboarding) }

                // As 5 Abas Oficiais da Doutrina do Dólar v2.0
                val tabs = remember {
                    listOf(
                        "Fundação" to Icons.Default.Home,
                        "Território" to Icons.Default.Terrain,
                        "Cadeia" to Icons.Default.Build,
                        "Instituições" to Icons.Default.AccountBalance,
                        "Mundo" to Icons.Default.Public
                    )
                }

                val expandableFabItems = remember {
                    listOf(
                        ExpandableItem(
                            label = "Árvore Tecnológica",
                            icon = Icons.Default.Science,
                            containerColor = AccentTechBlue,
                            onClick = { viewModel.openTechTree() }
                        ),
                        ExpandableItem(
                            label = "Enxame Vectus",
                            icon = Icons.Default.Flight,
                            containerColor = AccentTechBlue,
                            onClick = { viewModel.launchMinigame("minigame_swarm") }
                        ),
                        ExpandableItem(
                            label = "Decodificar Sinal",
                            icon = Icons.Default.Sensors,
                            containerColor = AccentCyberPurple,
                            onClick = { viewModel.launchMinigame("minigame_signal") }
                        ),
                        ExpandableItem(
                            label = "Injeção de Liquidez",
                            icon = Icons.Default.FlashOn,
                            containerColor = AccentEmerald,
                            onClick = { viewModel.performTap() }
                        ),
                        ExpandableItem(
                            label = "Sala de Situação",
                            icon = Icons.Default.Warning,
                            containerColor = AccentCrimson,
                            onClick = { viewModel.openIntelligenceRail() }
                        )
                    )
                }

                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(SurfaceBackground)
                ) {
                    Column(modifier = Modifier.fillMaxSize()) {
                        // 1. Dynamic Live Animated Header
                        AnimatedHeader(
                            gameState = gameState,
                            onOpenIntelligenceRail = { viewModel.openIntelligenceRail() }
                        )

                        // 2. Active Screen Content (ou Árvore Tecnológica)
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .fillMaxWidth()
                        ) {
                            if (isTechTreeOpen) {
                                TechTreeScreen(
                                    gameState = gameState,
                                    onResearchTech = { viewModel.researchTechnology(it) }
                                )
                            } else {
                                when (selectedTab) {
                                    0 -> FundacaoScreen(
                                        gameState = gameState,
                                        onTapAction = { viewModel.performTap() },
                                        onTileClick = { viewModel.onTileClick(it) },
                                        onOpenCrisis = { viewModel.openCrisisModal(it) }
                                    )
                                    1 -> TerritorioScreen(
                                        gameState = gameState,
                                        onUnlockDistrict = { viewModel.unlockDistrict(it) },
                                        onProspectBiome = { /* Prospecção */ }
                                    )
                                    2 -> CadeiaScreen(gameState = gameState)
                                    3 -> InstituicoesScreen(
                                        gameState = gameState,
                                        onUpgradeInstitution = { viewModel.upgradeInstitution(it) },
                                        onToggleDoctrine = { viewModel.toggleDoctrine(it) }
                                    )
                                    4 -> MundoScreen(
                                        gameState = gameState,
                                        onOpenCrisis = { viewModel.openCrisisModal(it) }
                                    )
                                }
                            }
                        }
                    }

                    // 3. Floating Tab Navigation Bar at the Bottom (5 Abas)
                    FloatingTabBar(
                        tabs = tabs,
                        selectedTabIndex = if (isTechTreeOpen) -1 else selectedTab,
                        onTabSelected = { viewModel.selectTab(it) },
                        modifier = Modifier
                            .align(Alignment.BottomCenter)
                            .navigationBarsPadding()
                            .padding(bottom = 12.dp)
                    )

                    // 4. Expandable Speed Dial FAB
                    Box(
                        modifier = Modifier
                            .align(Alignment.BottomEnd)
                            .navigationBarsPadding()
                            .padding(end = 16.dp, bottom = 84.dp)
                    ) {
                        ExpandableActionButton(
                            isExpanded = isFabOpen,
                            onToggle = { viewModel.toggleExpandableFab() },
                            items = expandableFabItems
                        )
                    }

                    // 5. Retractable Intelligence Rail Overlay
                    IntelligenceRail(
                        isOpen = isIntelRailOpen,
                        gameState = gameState,
                        onClose = { viewModel.closeIntelligenceRail() },
                        onLaunchMinigame = { viewModel.launchMinigame(it) }
                    )

                    // 6. Category Selection Modal
                    if (selectedTileForBuild != null && selectedCategoryForFacility == null) {
                        CategorySelectionModal(
                            playerLevel = gameState.level,
                            onDismiss = { viewModel.closeCategoryModal() },
                            onSelectCategory = { viewModel.selectCategory(it) }
                        )
                    }

                    // 7. Facility Selection Modal (Dentro da Categoria)
                    if (selectedCategoryForFacility != null) {
                        FacilitySelectionModal(
                            category = selectedCategoryForFacility!!,
                            playerBalance = gameState.balance,
                            playerLevel = gameState.level,
                            onDismiss = { viewModel.closeFacilityModal() },
                            onBuildFacility = { viewModel.buildFacility(it) }
                        )
                    }

                    // 8. Onboarding & Welcome Modal
                    if (showOnboarding) {
                        OnboardingModal(
                            onDismiss = { showOnboarding = false }
                        )
                    }

                    // 9. Geopolitical Crisis War Room Modal
                    if (activeCrisisModalId != null) {
                        val activeCrisis = gameState.activeCrises.find { it.id == activeCrisisModalId }
                        if (activeCrisis != null) {
                            CrisisModalSheet(
                                crisis = activeCrisis,
                                playerBalance = gameState.balance,
                                onDismiss = { viewModel.closeCrisisModal() },
                                onSelectOption = { option ->
                                    viewModel.resolveCrisisOption(activeCrisis.id, option)
                                }
                            )
                        }
                    }

                    // 10. Interactive Minigames Modals
                    when (gameState.activeMinigame) {
                        "minigame_ormuz" -> {
                            OrmuzDefenseMinigame(
                                onDismiss = { viewModel.closeMinigame() },
                                onComplete = { success, score ->
                                    viewModel.completeMinigame("minigame_ormuz", success, score)
                                }
                            )
                        }
                        "minigame_cyber" -> {
                            CyberContainmentMinigame(
                                onDismiss = { viewModel.closeMinigame() },
                                onComplete = { success, score ->
                                    viewModel.completeMinigame("minigame_cyber", success, score)
                                }
                            )
                        }
                        "minigame_narrative" -> {
                            NarrativeBattleMinigame(
                                onDismiss = { viewModel.closeMinigame() },
                                onComplete = { success, score ->
                                    viewModel.completeMinigame("minigame_narrative", success, score)
                                }
                            )
                        }
                        "minigame_swarm" -> {
                            SwarmCoordinationMinigame(
                                onDismiss = { viewModel.closeMinigame() },
                                onComplete = { success, score ->
                                    viewModel.completeMinigame("minigame_swarm", success, score)
                                }
                            )
                        }
                        "minigame_signal" -> {
                            SignalDecryptionMinigame(
                                onDismiss = { viewModel.closeMinigame() },
                                onComplete = { success, score ->
                                    viewModel.completeMinigame("minigame_signal", success, score)
                                }
                            )
                        }
                        "minigame_lng" -> {
                            LNGDefenseMinigame(
                                onDismiss = { viewModel.closeMinigame() },
                                onComplete = { success, score ->
                                    viewModel.completeMinigame("minigame_lng", success, score)
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}
