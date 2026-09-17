package com.dollardoctrine.ui.components

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dollardoctrine.core.designsystem.*

@Composable
fun OnboardingModal(
    onDismiss: () -> Unit
) {
    var currentStep by remember { mutableIntStateOf(0) }

    val steps = remember {
        listOf(
            OnboardingStep(
                icon = "🏛️",
                title = "Bem-vindo ao The Dollar Doctrine",
                subtitle = "Fase I: O Sobrevivente",
                body = "Você assume a liderança de um território pioneiro com $0,00 e 150 habitantes. Toque no Núcleo de Soberania para acumular os primeiros recursos da nação.",
                accentColor = AccentEmerald
            ),
            OnboardingStep(
                icon = "⚙️",
                title = "A Cadeia Produtiva Soberana",
                subtitle = "Extração • Refino • Logística",
                body = "Sem recursos, a nação colapsa. Com produção, ela cresce. Com excedente, ela domina. Construa instalações através das 12 Categorias Industriais.",
                accentColor = AccentTechBlue
            ),
            OnboardingStep(
                icon = "🗺️",
                title = "O Grid Territorial 3×3",
                subtitle = "Expansão Distrital e Biomas",
                body = "Explore o mapa de 9 lotes iniciais. Utilize Capital Político para anexar planícies agrícolas, bacias petrolíferas e complexos costeiros.",
                accentColor = AccentAmber
            ),
            OnboardingStep(
                icon = "🚀",
                title = "Defesa Autônoma & Chokepoints",
                subtitle = "Matilha de Silício no Estreito de Ormuz",
                body = "Assegure as rotas globais de petróleo e gás com drones furtivos Vectus, embarcações USVs e ciberdefesa contra ameaças assimétricas.",
                accentColor = AccentCrimson
            ),
            OnboardingStep(
                icon = "📜",
                title = "A Nova Ordem Constitucional",
                subtitle = "Do Nível 0 ao Nível 1000",
                body = "Evolua instituições republicanas (STF, Banco Central, Conselho de Segurança) até alcançar a hegemonia e promulgar a Constituição Global.",
                accentColor = AccentGold
            )
        )
    }

    OperationalModal(
        title = "DIRETRIZ ESTRATÉGICA",
        subtitle = "Protocolo de Fundação Nacional",
        onDismissRequest = onDismiss
    ) {
        val step = steps[currentStep]

        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Icon Pill
            Box(
                modifier = Modifier
                    .size(72.dp)
                    .clip(CircleShape)
                    .background(step.accentColor.copy(alpha = 0.15f))
                    .border(2.dp, step.accentColor, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Text(step.icon, fontSize = 34.sp)
            }

            Spacer(modifier = Modifier.height(14.dp))

            Text(
                text = step.title,
                style = Typography.titleLarge.copy(fontSize = 18.sp, fontWeight = FontWeight.Black),
                color = TextPrimary,
                textAlign = TextAlign.Center
            )

            Text(
                text = step.subtitle.uppercase(),
                style = Typography.labelSmall.copy(fontWeight = FontWeight.Bold, color = step.accentColor),
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = step.body,
                style = Typography.bodyMedium,
                color = TextSecondary,
                textAlign = TextAlign.Center,
                lineHeight = 22.sp
            )

            Spacer(modifier = Modifier.height(20.dp))

            // Step Indicator Dots
            Row(
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                steps.indices.forEach { index ->
                    val isActive = index == currentStep
                    Box(
                        modifier = Modifier
                            .height(6.dp)
                            .width(if (isActive) 24.dp else 6.dp)
                            .clip(RoundedCornerShape(3.dp))
                            .background(if (isActive) step.accentColor else SurfaceBorder)
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Action Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (currentStep < steps.size - 1) {
                    TextButton(onClick = onDismiss) {
                        Text("Pular Introdução", style = Typography.labelSmall, color = TextMuted)
                    }
                    Button(
                        onClick = { currentStep++ },
                        colors = ButtonDefaults.buttonColors(containerColor = step.accentColor),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Próximo ➔", style = Typography.labelLarge, color = TextInverse)
                    }
                } else {
                    Button(
                        onClick = onDismiss,
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = AccentEmerald),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Iniciar Fundação Nacional ➔", style = Typography.labelLarge, color = TextInverse)
                    }
                }
            }
        }
    }
}

data class OnboardingStep(
    val icon: String,
    val title: String,
    val subtitle: String,
    val body: String,
    val accentColor: Color
)
