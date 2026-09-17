package com.dollardoctrine.domain.engine

import com.dollardoctrine.data.model.*
import java.math.BigDecimal
import java.util.Random

class DynamicEventEngine(
    private val random: Random = Random()
) {
    /**
     * Avalia a cada intervalo se um novo evento geopolítico deve ser disparado
     * baseado no nível de risco dos chokepoints e estado de tensão.
     */
    fun evaluateEventTrigger(
        currentState: GameState,
        activeCrisisCount: Int
    ): GeopoliticalCrisis? {
        // Limita a 2 crises ativas simultâneas para não sobrecarregar o jogador
        if (activeCrisisCount >= 2) return null

        val templates = GeopoliticalEventCatalog.getAllEventTemplates()
        val ormuzChokepoint = currentState.chokepoints.find { it.id == "chk_ormuz" }
        val ormuzRisk = ormuzChokepoint?.riskLevelPercentage ?: 50.0

        // Chance base aumenta se o risco de Ormuz estiver alto
        val roll = random.nextDouble()
        val triggerThreshold = if (ormuzRisk > 60.0) 0.35 else 0.15

        if (roll < triggerThreshold) {
            val candidate = templates[random.nextInt(templates.size)]

            // Converte o template em GeopoliticalCrisis viva
            val options = mutableListOf<CrisisOption>()
            options.add(
                CrisisOption(
                    id = candidate.optionA.id,
                    title = candidate.optionA.label,
                    description = candidate.optionA.narrativeResolutionText,
                    dollarCost = candidate.optionA.requiredDollarCost,
                    deterrenceRequired = candidate.optionA.requiredDeterrence,
                    successChance = candidate.optionA.successProbability,
                    stabilityImpact = candidate.optionA.stabilityChange,
                    narrativeImpact = candidate.optionA.cognitiveChange,
                    triggerMinigameId = candidate.optionA.triggerMinigameId
                )
            )
            options.add(
                CrisisOption(
                    id = candidate.optionB.id,
                    title = candidate.optionB.label,
                    description = candidate.optionB.narrativeResolutionText,
                    dollarCost = candidate.optionB.requiredDollarCost,
                    deterrenceRequired = candidate.optionB.requiredDeterrence,
                    successChance = candidate.optionB.successProbability,
                    stabilityImpact = candidate.optionB.stabilityChange,
                    narrativeImpact = candidate.optionB.cognitiveChange,
                    triggerMinigameId = candidate.optionB.triggerMinigameId
                )
            )

            candidate.optionC?.let { optC ->
                options.add(
                    CrisisOption(
                        id = optC.id,
                        title = optC.label,
                        description = optC.narrativeResolutionText,
                        dollarCost = optC.requiredDollarCost,
                        deterrenceRequired = optC.requiredDeterrence,
                        successChance = optC.successProbability,
                        stabilityImpact = optC.stabilityChange,
                        narrativeImpact = optC.cognitiveChange,
                        triggerMinigameId = optC.triggerMinigameId
                    )
                )
            }

            return GeopoliticalCrisis(
                id = candidate.id + "_" + System.currentTimeMillis(),
                title = candidate.title,
                severity = candidate.severity,
                relatedChokepointId = candidate.targetChokepointId,
                contextDescription = candidate.detailedBriefing,
                economicConsequence = candidate.marketImpactSummary,
                options = options,
                timeRemainingSeconds = candidate.durationSeconds
            )
        }

        return null
    }

    /**
     * Aplica os efeitos de uma opção de crise resolvida
     */
    fun resolveEventConsequences(
        state: GameState,
        crisis: GeopoliticalCrisis,
        option: CrisisOption
    ): GameState {
        val success = random.nextDouble() <= option.successChance
        val netStabilityChange = if (success) option.stabilityImpact else -option.stabilityImpact.coerceAtLeast(5.0)
        val netCognitiveChange = if (success) option.narrativeImpact else -option.narrativeImpact.coerceAtLeast(4.0)

        val updatedStability = (state.stabilityPercentage + netStabilityChange).coerceIn(10.0, 100.0)
        val updatedCognitive = (state.cognitiveResiliencePercentage + netCognitiveChange).coerceIn(10.0, 100.0)

        // Se a crise foi em Ormuz, ajusta o risco do estreito
        val updatedChokepoints = state.chokepoints.map { chk ->
            if (chk.id == crisis.relatedChokepointId) {
                val riskDelta = if (success) -15.0 else 10.0
                chk.copy(
                    riskLevelPercentage = (chk.riskLevelPercentage + riskDelta).coerceIn(10.0, 100.0),
                    militaryTension = if (success) "Estável (Monitoramento)" else "Conflito Iminente"
                )
            } else chk
        }

        val logMessage = if (success) {
            "Operação '${option.title}' foi bem-sucedida. ${crisis.title} contida."
        } else {
            "Ação '${option.title}' enfrentou resistência assimétrica. Instabilidade aumentou."
        }

        return state.copy(
            stabilityPercentage = updatedStability,
            cognitiveResiliencePercentage = updatedCognitive,
            chokepoints = updatedChokepoints,
            activeCrises = state.activeCrises.filterNot { it.id == crisis.id },
            intelBriefings = listOf(logMessage) + state.intelBriefings.take(8)
        )
    }
}
