package com.dollardoctrine.core.utils

import java.math.BigDecimal
import java.math.RoundingMode
import java.text.DecimalFormat
import java.text.DecimalFormatSymbols
import java.util.Locale

object NumberFormatter {

    private val ptBrLocale = Locale("pt", "BR")
    private val symbols = DecimalFormatSymbols(ptBrLocale).apply {
        groupingSeparator = '.'
        decimalSeparator = ','
    }

    private val standardFormat = DecimalFormat("#,##0.00", symbols)
    private val integerFormat = DecimalFormat("#,##0", symbols)

    fun formatCurrency(value: BigDecimal): String {
        return "$ " + formatCompact(value)
    }

    fun formatFullCurrency(value: BigDecimal): String {
        return "$ " + standardFormat.format(value)
    }

    fun formatCompact(value: BigDecimal): String {
        val absValue = value.abs()
        val thousand = BigDecimal(1_000)
        val million = BigDecimal(1_000_000)
        val billion = BigDecimal(1_000_000_000)
        val trillion = BigDecimal("1000000000000")
        val quadrillion = BigDecimal("1000000000000000")

        val prefix = if (value.signum() < 0) "-" else ""

        return when {
            absValue < thousand -> prefix + standardFormat.format(absValue)
            absValue < million -> prefix + standardFormat.format(absValue.divide(thousand, 2, RoundingMode.HALF_UP)) + " K"
            absValue < billion -> prefix + standardFormat.format(absValue.divide(million, 2, RoundingMode.HALF_UP)) + " M"
            absValue < trillion -> prefix + standardFormat.format(absValue.divide(billion, 2, RoundingMode.HALF_UP)) + " B"
            absValue < quadrillion -> prefix + standardFormat.format(absValue.divide(trillion, 2, RoundingMode.HALF_UP)) + " T"
            else -> prefix + standardFormat.format(absValue.divide(quadrillion, 2, RoundingMode.HALF_UP)) + " Qa"
        }
    }

    fun formatInteger(value: Long): String {
        return integerFormat.format(value)
    }

    fun formatPercentage(value: Double): String {
        return String.format(ptBrLocale, "%.1f%%", value)
    }

    fun formatRate(value: BigDecimal): String {
        return "+$ " + formatCompact(value) + "/s"
    }
}
