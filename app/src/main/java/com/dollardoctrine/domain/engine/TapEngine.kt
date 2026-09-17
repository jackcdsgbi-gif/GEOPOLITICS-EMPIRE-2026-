package com.dollardoctrine.domain.engine

import java.math.BigDecimal
import java.math.RoundingMode
import kotlin.random.Random

data class TapResult(
    val amount: BigDecimal,
    val isCritical: Boolean,
    val xpEarned: Long,
    val comboMultiplier: Double
)

class TapEngine(
    private val baseCriticalChance: Double = 0.12,
    private val criticalMultiplier: Double = 3.5
) {
    /**
     * Calcula o custo para subir o nível do tap:
     * Custo = 25 × 1.35^nível
     */
    fun tapUpgradeCost(tapLevel: Int): BigDecimal {
        val costDouble = 25.0 * Math.pow(1.35, tapLevel.toDouble())
        return BigDecimal(costDouble).setScale(2, RoundingMode.HALF_UP)
    }

    /**
     * Calcula o valor do tap considerando nível, multiplicadores de prestígio, combo e crítico.
     */
    fun calculateTapValue(
        tapLevel: Int,
        baseMultiplier: Double = 1.0,
        doctrineMultiplier: Double = 1.0,
        currentCombo: Int = 0,
        randomSource: Random = Random.Default
    ): TapResult {
        val baseTap = 0.50 + (tapLevel * 0.40)
        val comboMult = 1.0 + (currentCombo.coerceAtMost(50) * 0.02)
        
        val isCrit = randomSource.nextDouble() < baseCriticalChance
        val critFactor = if (isCrit) criticalMultiplier else 1.0

        val totalValue = baseTap * baseMultiplier * doctrineMultiplier * comboMult * critFactor
        val tapBigDecimal = BigDecimal(totalValue).setScale(2, RoundingMode.HALF_UP)
        val xp = if (isCrit) 5L else 1L

        return TapResult(
            amount = tapBigDecimal,
            isCritical = isCrit,
            xpEarned = xp,
            comboMultiplier = comboMult
        )
    }
}
