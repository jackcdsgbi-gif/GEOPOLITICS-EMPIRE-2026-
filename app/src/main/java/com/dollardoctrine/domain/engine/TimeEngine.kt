package com.dollardoctrine.domain.engine

data class GameTime(
    val totalRealSeconds: Long = 0,
    val inGameHour: Int = 0,        // 0 to 23
    val inGameDay: Int = 1,         // 1 to 30
    val inGameMonth: Int = 1,       // 1 to 12
    val inGameYear: Int = 2026,
    val isDayTime: Boolean = true
) {
    val formattedDate: String
        get() = String.format("Dia %02d/%02d/%d • %02d:00", inGameDay, inGameMonth, inGameYear, inGameHour)

    val currentCycleName: String
        get() = when {
            inGameHour in 6..11 -> "Turno da Manhã"
            inGameHour in 12..17 -> "Turno da Tarde"
            inGameHour in 18..22 -> "Turno da Noite"
            else -> "Madrugada (Manutenção)"
        }
}

class TimeEngine {
    companion object {
        const val SECONDS_PER_GAME_HOUR = 1
    }

    fun realSecondsToGameHours(realSec: Long): Long = realSec * SECONDS_PER_GAME_HOUR
    fun gameHoursToRealSeconds(gameHours: Long): Long = gameHours / SECONDS_PER_GAME_HOUR

    /**
     * Formatação flexível do tempo de jogo
     */
    fun formatGameTime(hours: Long): String {
        val totalDays = hours / 24
        val remainingHours = hours % 24
        val years = totalDays / 360
        val days = totalDays % 360

        return if (years > 0) {
            "Ano $years, Dia $days • ${remainingHours}h"
        } else if (days > 0) {
            "Mês ${(days / 30) + 1}, Dia ${days % 30} • ${remainingHours}h"
        } else {
            "Dia 1 • ${remainingHours}h"
        }
    }

    /**
     * Multiplicador de atividade baseado na hora do dia:
     * 1.2 no dia, 1.0 à noite, 0.6 na madrugada
     */
    fun activityMultiplier(gameHour: Int): Double {
        return when (gameHour) {
            in 6..18 -> 1.2
            in 19..23 -> 1.0
            else -> 0.6
        }
    }

    /**
     * Avança o relógio determinístico acelerado:
     * 1 segundo real = 1 hora no jogo (60 minutos de jogo).
     * 24 segundos reais = 1 dia no jogo.
     */
    fun advanceOneRealSecond(currentTime: GameTime): GameTime {
        val nextSec = currentTime.totalRealSeconds + 1
        val nextHour = (currentTime.inGameHour + 1) % 24
        var nextDay = currentTime.inGameDay
        var nextMonth = currentTime.inGameMonth
        var nextYear = currentTime.inGameYear

        if (nextHour == 0) {
            nextDay += 1
            if (nextDay > 30) {
                nextDay = 1
                nextMonth += 1
                if (nextMonth > 12) {
                    nextMonth = 1
                    nextYear += 1
                }
            }
        }

        val isDay = nextHour in 6..18

        return GameTime(
            totalRealSeconds = nextSec,
            inGameHour = nextHour,
            inGameDay = nextDay,
            inGameMonth = nextMonth,
            inGameYear = nextYear,
            isDayTime = isDay
        )
    }
}
