package com.dollardoctrine.domain.engine

import com.dollardoctrine.data.model.TechBranch
import com.dollardoctrine.data.model.TechNode
import java.math.BigDecimal
import java.math.RoundingMode

class TechTreeEngine {

    /**
     * Calcula a taxa de geração de pontos de pesquisa (P&D por segundo)
     * baseada nas tecnologias já desbloqueadas e nos distritos ativos.
     */
    fun calculateResearchPointsPerSecond(
        unlockedDistricts: Int,
        technologies: List<TechNode>
    ): BigDecimal {
        var basePoints = BigDecimal(unlockedDistricts).multiply(BigDecimal("2.5"))

        // Bônus específicos por tecnologias de IA e Computação
        technologies.filter { it.isResearched }.forEach { tech ->
            when (tech.id) {
                "tech_dig_1" -> basePoints = basePoints.add(BigDecimal("4.0"))
                "tech_dig_4" -> basePoints = basePoints.multiply(BigDecimal("1.75"))
                "tech_dig_7" -> basePoints = basePoints.multiply(BigDecimal("2.5"))
                "tech_esp_1" -> basePoints = basePoints.add(BigDecimal("6.0"))
                "tech_int_1" -> basePoints = basePoints.add(BigDecimal("3.0"))
            }
        }

        return basePoints.setScale(2, RoundingMode.HALF_UP)
    }

    /**
     * Tenta pesquisar uma tecnologia verificando pré-requisitos e saldo de P&D / Dólar.
     */
    fun attemptResearchTech(
        techId: String,
        currentPoints: BigDecimal,
        technologies: List<TechNode>
    ): Pair<List<TechNode>, BigDecimal>? {
        val targetTech = technologies.find { it.id == techId } ?: return null
        if (targetTech.isResearched || !targetTech.isAvailable) return null

        if (currentPoints < targetTech.researchCost) return null

        val remainingPoints = currentPoints.subtract(targetTech.researchCost)

        // Atualiza a tecnologia como pesquisada e desbloqueia as dependentes
        val updatedList = technologies.map { tech ->
            if (tech.id == techId) {
                tech.copy(isResearched = true)
            } else tech
        }.map { tech ->
            // Se o pré-requisito da tech agora foi pesquisado, torna ela disponível
            if (!tech.isResearched && tech.prerequisiteTechId == techId) {
                tech.copy(isAvailable = true)
            } else tech
        }

        return Pair(updatedList, remainingPoints)
    }

    /**
     * Calcula o multiplicador econômico e de defesa concedido pelas tecnologias
     */
    fun computeGlobalModifiers(technologies: List<TechNode>): TechModifiers {
        var defenseBonus = 1.0
        var energyBonus = 1.0
        var logisticsBonus = 1.0
        var revenueBonus = 1.0
        var ormuzRiskReduction = 0.0

        technologies.filter { it.isResearched }.forEach { tech ->
            when (tech.branch) {
                TechBranch.ENERGIA -> {
                    energyBonus += 0.08
                    if (tech.tier >= 3) ormuzRiskReduction += 4.0
                }
                TechBranch.INDUSTRIA -> {
                    logisticsBonus += 0.07
                    revenueBonus += 0.05
                }
                TechBranch.TECNOLOGIA_DIGITAL -> {
                    defenseBonus += 0.06
                    revenueBonus += 0.08
                }
                TechBranch.ESPACO -> {
                    defenseBonus += 0.10
                    ormuzRiskReduction += 5.0
                }
                TechBranch.DEFESA -> {
                    defenseBonus += 0.15
                    ormuzRiskReduction += 6.0
                }
                TechBranch.INTELIGENCIA -> {
                    revenueBonus += 0.06
                    ormuzRiskReduction += 4.0
                }
            }
        }

        return TechModifiers(
            defenseMultiplier = defenseBonus,
            energyMultiplier = energyBonus,
            logisticsMultiplier = logisticsBonus,
            revenueMultiplier = revenueBonus,
            ormuzRiskMitigationPercentage = ormuzRiskReduction
        )
    }
}

data class TechModifiers(
    val defenseMultiplier: Double,
    val energyMultiplier: Double,
    val logisticsMultiplier: Double,
    val revenueMultiplier: Double,
    val ormuzRiskMitigationPercentage: Double
)
