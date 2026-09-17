package com.dollardoctrine.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dollardoctrine.core.net.NetworkClient
import com.dollardoctrine.data.model.*
import com.dollardoctrine.data.repository.GameRepository
import com.dollardoctrine.domain.engine.TapEngine
import com.dollardoctrine.domain.engine.TimeEngine
import com.dollardoctrine.domain.engine.XpEngine
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.math.BigDecimal
import java.math.RoundingMode

class GameViewModel(
    private val repository: GameRepository = GameRepository(),
    private val timeEngine: TimeEngine = TimeEngine(),
    private val tapEngine: TapEngine = TapEngine(),
    private val xpEngine: XpEngine = XpEngine(),
    private val networkClient: NetworkClient = NetworkClient()
) : ViewModel() {

    val gameState: StateFlow<GameState> = repository.gameState
    val isNetworkConnected: StateFlow<Boolean> = networkClient.connected

    private val _selectedTabIndex = MutableStateFlow(0)
    val selectedTabIndex: StateFlow<Int> = _selectedTabIndex.asStateFlow()

    private val _isIntelligenceRailOpen = MutableStateFlow(false)
    val isIntelligenceRailOpen: StateFlow<Boolean> = _isIntelligenceRailOpen.asStateFlow()

    private val _activeCrisisIdForModal = MutableStateFlow<String?>(null)
    val activeCrisisIdForModal: StateFlow<String?> = _activeCrisisIdForModal.asStateFlow()

    private val _isExpandableFabOpen = MutableStateFlow(false)
    val isExpandableFabOpen: StateFlow<Boolean> = _isExpandableFabOpen.asStateFlow()

    private val _isTechTreeOpen = MutableStateFlow(false)
    val isTechTreeOpen: StateFlow<Boolean> = _isTechTreeOpen.asStateFlow()

    // Modais de Construção por Categoria
    private val _selectedTileForBuild = MutableStateFlow<DistrictTile?>(null)
    val selectedTileForBuild: StateFlow<DistrictTile?> = _selectedTileForBuild.asStateFlow()

    private val _selectedCategoryForFacility = MutableStateFlow<CategoryDefinition?>(null)
    val selectedCategoryForFacility: StateFlow<CategoryDefinition?> = _selectedCategoryForFacility.asStateFlow()

    private var gameLoopJob: Job? = null
    private var autoSaveCounter = 0

    init {
        startGameLoop()
    }

    fun startGameLoop() {
        gameLoopJob?.cancel()
        gameLoopJob = viewModelScope.launch {
            while (isActive) {
                delay(1000L)
                tick()
            }
        }
    }

    /**
     * Tick de 1Hz: produção passiva, XP passivo, avanço de tempo, decaimento de combo e autosave.
     */
    fun tick() {
        val current = gameState.value
        val advancedTime = timeEngine.advanceOneRealSecond(current.gameTime)
        val timeMult = timeEngine.activityMultiplier(advancedTime.inGameHour)

        // 1. Receita passiva
        val gdpIncome = current.incomePerSecond.toDouble() * timeMult
        val gdpGainBigDecimal = BigDecimal(gdpIncome).setScale(2, RoundingMode.HALF_UP)
        val newBalance = current.balance.add(gdpGainBigDecimal)
        val newLifetime = current.lifetimeDollar.add(gdpGainBigDecimal)

        // 2. XP desacoplado passivo
        val passiveXp = xpEngine.xpPerSecond(
            gdpIncome = gdpIncome,
            buildingCount = current.unlockedDistricts,
            ministerLevels = current.institutions.sumOf { it.level }
        ).toLong()

        val xpResult = xpEngine.applyXp(current.level, current.xp, passiveXp)
        val decayedCombo = if (current.combo > 0) current.combo - 1 else 0

        val nextState = current.copy(
            gameTime = advancedTime,
            balance = newBalance,
            lifetimeDollar = newLifetime,
            level = xpResult.newLevel,
            xp = xpResult.remainingXp,
            xpRequiredForNextLevel = xpResult.nextLevelRequiredXp,
            combo = decayedCombo,
            lastSave = System.currentTimeMillis()
        )

        repository.save(nextState)

        autoSaveCounter++
        if (autoSaveCounter >= 5) {
            autoSaveCounter = 0
            // Sincronização periódica / autosave DataStore
        }
    }

    /**
     * Aplica toque manual: cálculo com TapEngine, crítico e bônus de XP.
     */
    fun onTap() {
        val current = gameState.value
        val tapResult = tapEngine.calculateTapValue(
            tapLevel = current.tapLevel,
            baseMultiplier = current.baseMultiplier,
            doctrineMultiplier = doctrineMultiplier(current.doctrine),
            currentCombo = current.combo
        )

        val newBalance = current.balance.add(tapResult.amount)
        val newLifetime = current.lifetimeDollar.add(tapResult.amount)
        val xpResult = xpEngine.applyXp(current.level, current.xp, tapResult.xpEarned)
        val newCombo = (current.combo + 1).coerceAtMost(100)

        repository.save(
            current.copy(
                balance = newBalance,
                lifetimeDollar = newLifetime,
                level = xpResult.newLevel,
                xp = xpResult.remainingXp,
                xpRequiredForNextLevel = xpResult.nextLevelRequiredXp,
                combo = newCombo,
                comboMultiplier = tapResult.comboMultiplier
            )
        )
    }

    fun onUpgradeTap() {
        val current = gameState.value
        val cost = tapEngine.tapUpgradeCost(current.tapLevel)
        if (current.balance >= cost) {
            val newBalance = current.balance.subtract(cost)
            val newTapLevel = current.tapLevel + 1
            repository.save(
                current.copy(
                    balance = newBalance,
                    tapLevel = newTapLevel,
                    tapPower = current.tapPower.add(BigDecimal("0.40"))
                )
            )
        }
    }

    fun onBuild(id: String, cost: BigDecimal, production: BigDecimal) {
        val current = gameState.value
        if (current.balance >= cost) {
            val newBalance = current.balance.subtract(cost)
            val newIncome = current.incomePerSecond.add(production)
            val xpResult = xpEngine.applyXp(current.level, current.xp, 25L)
            repository.save(
                current.copy(
                    balance = newBalance,
                    incomePerSecond = newIncome,
                    level = xpResult.newLevel,
                    xp = xpResult.remainingXp,
                    xpRequiredForNextLevel = xpResult.nextLevelRequiredXp
                )
            )
        }
    }

    fun doctrineMultiplier(doctrine: String): Double {
        return when (doctrine.lowercase()) {
            "merchant", "mercador" -> 1.25
            "raider", "saqueador" -> 1.35
            "industrial" -> 1.20
            "tech" -> 1.15
            else -> 1.0
        }
    }

    fun connectMultiplayer(jwtToken: String? = null) {
        networkClient.connect(jwtToken)
    }

    fun disconnectMultiplayer() {
        networkClient.disconnect()
    }

    fun selectTab(index: Int) {
        _selectedTabIndex.value = index
        _isTechTreeOpen.value = false
    }

    fun openTechTree() {
        _isTechTreeOpen.value = true
    }

    fun closeTechTree() {
        _isTechTreeOpen.value = false
    }

    fun openIntelligenceRail() {
        _isIntelligenceRailOpen.value = true
    }

    fun closeIntelligenceRail() {
        _isIntelligenceRailOpen.value = false
    }

    fun toggleExpandableFab() {
        _isExpandableFabOpen.value = !_isExpandableFabOpen.value
    }

    fun openCrisisModal(crisisId: String) {
        _activeCrisisIdForModal.value = crisisId
    }

    fun closeCrisisModal() {
        _activeCrisisIdForModal.value = null
    }

    fun onTileClick(tile: DistrictTile) {
        if (tile.state == TileState.EMPTY) {
            _selectedTileForBuild.value = tile
        } else if (tile.state == TileState.LOCKED) {
            unlockDistrict(tile)
        }
    }

    fun closeCategoryModal() {
        _selectedTileForBuild.value = null
        _selectedCategoryForFacility.value = null
    }

    fun selectCategory(category: CategoryDefinition) {
        _selectedCategoryForFacility.value = category
    }

    fun closeFacilityModal() {
        _selectedCategoryForFacility.value = null
    }

    fun buildFacility(facility: FacilityDefinition) {
        val tile = _selectedTileForBuild.value ?: return
        val current = gameState.value
        if (current.balance < facility.dollarCost) return

        val newBalance = current.balance.subtract(facility.dollarCost)
        val updatedGrid = current.districtsGrid.map {
            if (it.id == tile.id) {
                it.copy(
                    state = TileState.ACTIVE,
                    facilityId = facility.id,
                    facilityName = facility.name,
                    facilityIcon = DefaultCategoriesAndFacilities.categories.find { c -> c.id == facility.categoryId }?.icon,
                    level = 1
                )
            } else it
        }

        val newIncome = current.incomePerSecond.add(facility.revenuePerSecond)
        val xpResult = xpEngine.applyXp(current.level, current.xp, 25L)

        repository.save(
            current.copy(
                balance = newBalance,
                incomePerSecond = newIncome,
                districtsGrid = updatedGrid,
                level = xpResult.newLevel,
                xp = xpResult.remainingXp,
                xpRequiredForNextLevel = xpResult.nextLevelRequiredXp
            )
        )

        closeCategoryModal()
    }

    fun unlockDistrict(tile: DistrictTile) {
        val current = gameState.value
        if (current.balance < tile.unlockCost) return

        val newBalance = current.balance.subtract(tile.unlockCost)
        val updatedGrid = current.districtsGrid.map {
            if (it.id == tile.id) it.copy(state = TileState.EMPTY) else it
        }

        repository.save(
            current.copy(
                balance = newBalance,
                districtsGrid = updatedGrid
            )
        )
    }

    fun performTap() {
        onTap()
    }

    fun researchTechnology(techId: String) {
        repository.researchTechnology(techId)
    }

    fun resolveCrisisOption(crisisId: String, option: CrisisOption) {
        repository.resolveCrisis(crisisId, option.id)
        _activeCrisisIdForModal.value = null
    }

    fun buildDefenseAsset(assetId: String) {
        repository.buildDefenseAsset(assetId)
    }

    fun toggleDoctrine(doctrineId: String) {
        repository.toggleDoctrine(doctrineId)
    }

    fun upgradeInstitution(institutionId: String) {
        repository.upgradeInstitution(institutionId)
    }

    fun launchMinigame(minigameId: String) {
        repository.openMinigame(minigameId)
    }

    fun closeMinigame() {
        repository.closeMinigame()
    }

    fun completeMinigame(minigameId: String, success: Boolean, score: Int) {
        repository.completeMinigame(minigameId, success, score)
    }
}
