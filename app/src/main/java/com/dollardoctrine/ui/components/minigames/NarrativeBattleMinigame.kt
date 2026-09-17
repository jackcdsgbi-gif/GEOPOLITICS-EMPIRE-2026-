package com.dollardoctrine.ui.components.minigames

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dollardoctrine.core.designsystem.*

@Composable
fun NarrativeBattleMinigame(
    onDismiss: () -> Unit,
    onComplete: (success: Boolean, score: Int) -> Unit
) {
    var step by remember { mutableIntStateOf(0) }
    var score by remember { mutableIntStateOf(0) }

    val narrativeRounds = remember {
        listOf(
            NarrativeQuestion(
                headline = "Fake News: 'Petroleiro atacado por forças navais governamentais no Estreito de Ormuz!'",
                correctEvidence = "Publicar telemetria do satélite Vigia comprovando que o petroleiro foi escoltado em segurança e que as lanchas agressoras eram de milícia assimétrica.",
                wrongEvidence = "Ignorar a matéria e esperar que a repercussão diminua nas redes sociais."
            ),
            NarrativeQuestion(
                headline = "Propaganda Hostil: 'Usinas nacionais utilizam energia poluente e violam tratados climáticos!'",
                correctEvidence = "Apresentar auditoria transparente da Agência Energética comprovando 78% de matriz renovável e terminais de hidrogênio verde.",
                wrongEvidence = "Ameaçar cortar fornecimento de energia a todos os países vizinhos."
            ),
            NarrativeQuestion(
                headline = "Boato Especulativo: 'Reservas financeiras em dólar colapsaram após ataque cibernético!'",
                correctEvidence = "Conceder coletiva com o Banco Central Soberano exibindo chaves públicas criptográficas e liquidez intacta.",
                wrongEvidence = "Censurar todas as plataformas de notícias sem apresentar dados técnicos."
            )
        )
    }

    OperationalModal(
        title = "Guerra de Narrativas & Fact-Checking",
        subtitle = "Desmonte as campanhas de desinformação global escolhendo as evidências forenses corretas!",
        onDismissRequest = onDismiss
    ) {
        if (step < narrativeRounds.size) {
            val current = narrativeRounds[step]

            Column(modifier = Modifier.fillMaxWidth()) {
                // Round indicator
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("RODADA ${step + 1} DE ${narrativeRounds.size}", style = Typography.labelSmall, color = TextMuted)
                    Text("REPUTAÇÃO PRESERVADA: +${score * 10}%", style = Typography.labelSmall.copy(fontWeight = FontWeight.Bold), color = AccentEmerald)
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Headline card
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(AccentCrimsonLight)
                        .border(1.dp, AccentCrimson, RoundedCornerShape(12.dp))
                        .padding(14.dp)
                ) {
                    Column {
                        Text("MANCHETE VIRAL IDENTIFICADA", style = Typography.labelSmall, color = AccentCrimson)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(current.headline, style = Typography.titleMedium, color = TextPrimary)
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text("SELECIONE A RESPOSTA ESTRATÉGICA:", style = Typography.labelSmall, color = TextMuted)

                Spacer(modifier = Modifier.height(8.dp))

                // Option A
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(SurfaceWhite)
                        .border(1.5.dp, SurfaceBorder, RoundedCornerShape(12.dp))
                        .clickable {
                            score++
                            step++
                            if (step >= narrativeRounds.size) onComplete(true, score)
                        }
                        .padding(14.dp)
                ) {
                    Text(
                        text = "A) " + current.correctEvidence,
                        style = Typography.bodyLarge,
                        color = TextPrimary
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Option B
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(SurfaceWhite)
                        .border(1.5.dp, SurfaceBorder, RoundedCornerShape(12.dp))
                        .clickable {
                            step++
                            if (step >= narrativeRounds.size) onComplete(score >= 2, score)
                        }
                        .padding(14.dp)
                ) {
                    Text(
                        text = "B) " + current.wrongEvidence,
                        style = Typography.bodyLarge,
                        color = TextSecondary
                    )
                }
            }
        }
    }
}

data class NarrativeQuestion(
    val headline: String,
    val correctEvidence: String,
    val wrongEvidence: String
)
