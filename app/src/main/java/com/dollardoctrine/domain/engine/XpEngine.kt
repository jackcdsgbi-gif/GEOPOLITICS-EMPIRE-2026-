package com.dollardoctrine.domain.engine

data class XpProgressionResult(
    val newLevel: Int,
    val remainingXp: Long,
    val levelsGained: Int,
    val nextLevelRequiredXp: Long
)

class XpEngine {
    companion object {
        const val XP_PER_GDP = 0.001
        const val XP_PER_BUILDING_PRODUCTION = 0.01
        const val XP_PER_MINISTER_LEVEL = 0.5
    }

    /**
     * Curva de XP necessária por nível em 5 estágios:
     * - Níveis 0 a 50: 150 × level^1.4
     * - Níveis 51 a 150: 500 × level^1.6
     * - Níveis 151 a 350: 2000 × level^1.8
     * - Níveis 351 a 700: 10000 × level^2.0
     * - Níveis 701+: 100000 × 1.01^(level - 700)
     */
    fun xpNeededForLevel(level: Int): Long {
        if (level <= 0) return 100L
        val lvl = level.toDouble()
        val needed = when {
            level <= 50 -> 150.0 * Math.pow(lvl, 1.4)
            level <= 150 -> 500.0 * Math.pow(lvl, 1.6)
            level <= 350 -> 2000.0 * Math.pow(lvl, 1.8)
            level <= 700 -> 10000.0 * Math.pow(lvl, 2.0)
            else -> 100000.0 * Math.pow(1.01, (level - 700).toDouble())
        }
        return needed.toLong().coerceAtLeast(100L)
    }

    /**
     * XP passivo por segundo gerado pela atividade econômica da nação.
     */
    fun xpPerSecond(gdpIncome: Double, buildingCount: Int, ministerLevels: Int): Double {
        val fromGdp = gdpIncome * XP_PER_GDP
        val fromBuildings = buildingCount * XP_PER_BUILDING_PRODUCTION
        val fromMinisters = ministerLevels * XP_PER_MINISTER_LEVEL
        return (fromGdp + fromBuildings + fromMinisters).coerceAtLeast(0.0)
    }

    /**
     * XP residual gerado por toque manual.
     */
    fun xpPerTap(tapLevel: Int): Long {
        return (1L + (tapLevel / 5)).coerceAtLeast(1L)
    }

    /**
     * Aplica XP ganho e calcula subidas de nível sucessivas.
     */
    fun applyXp(currentLevel: Int, currentXp: Long, gainedXp: Long): XpProgressionResult {
        var level = currentLevel
        var xp = currentXp + gainedXp
        var levelsGained = 0

        while (true) {
            val req = xpNeededForLevel(level + 1)
            if (xp >= req) {
                xp -= req
                level++
                levelsGained++
            } else {
                break
            }
        }

        return XpProgressionResult(
            newLevel = level,
            remainingXp = xp,
            levelsGained = levelsGained,
            nextLevelRequiredXp = xpNeededForLevel(level + 1)
        )
    }
}
