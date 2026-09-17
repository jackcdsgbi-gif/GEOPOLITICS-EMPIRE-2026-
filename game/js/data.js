/**
 * GEOPOLITICS EMPIRE 2026 — Data Registry
 * 12 Grandes Categorias | 150+ Instalações | Nações | Commodities | Eventos
 */

window.GAME_DATA = {

  // ══════════════════════════════════════════
  // 12 GRANDES CATEGORIAS DE INSTALAÇÕES
  // ══════════════════════════════════════════
  categories: [
    { id: 'agro',    name: 'Campos Agrícolas',    icon: '🌾', color: '#4ADE80', bg: '#052e16', desc: 'Alimentação, bioenergia e soberania alimentar nacional.' },
    { id: 'water',   name: 'Complexo Hídrico',    icon: '💧', color: '#38BDF8', bg: '#082f49', desc: 'Captação, tratamento e distribuição estratégica de água.' },
    { id: 'energy',  name: 'Energia Primária',    icon: '⚡', color: '#FACC15', bg: '#1c1503', desc: 'Geração elétrica de base até energias do futuro.' },
    { id: 'petro',   name: 'Hidrocarbonetos',     icon: '🛢️', color: '#FB923C', bg: '#1c0a00', desc: 'Petróleo, gás natural e refinamento industrial.' },
    { id: 'mining',  name: 'Mineração & Metais',  icon: '⛏️', color: '#A78BFA', bg: '#1e1b4b', desc: 'Extração de minérios estratégicos e terras raras.' },
    { id: 'mfg',     name: 'Manufatura Pesada',   icon: '🏭', color: '#60A5FA', bg: '#0c1a2e', desc: 'Siderurgia, automotivo, bens de capital e indústria 4.0.' },
    { id: 'tech',    name: 'Tecnologia & IA',     icon: '🔬', color: '#C084FC', bg: '#1a0533', desc: 'Semicondutores, IA soberana, computação quântica.' },
    { id: 'defense', name: 'Complexo Militar',    icon: '🛡️', color: '#F87171', bg: '#1c0a0a', desc: 'Defesa terrestre, aérea, naval e espacial.' },
    { id: 'infra',   name: 'Infraestrutura',      icon: '🏗️', color: '#34D399', bg: '#022c22', desc: 'Logística, portos, ferrovias maglev e megacidades.' },
    { id: 'finance', name: 'Sistema Financeiro',  icon: '🏦', color: '#FDE68A', bg: '#1c1503', desc: 'Bancos soberanos, bolsa, bonds e reservas cambiais.' },
    { id: 'social',  name: 'Capital Humano',      icon: '🏥', color: '#F9A8D4', bg: '#1c0533', desc: 'Saúde, educação, ciência e bem-estar nacional.' },
    { id: 'space',   name: 'Programa Espacial',   icon: '🚀', color: '#818CF8', bg: '#0c0a1e', desc: 'Satélites, estações orbitais e colonização espacial.' }
  ],

  // ══════════════════════════════════════════
  // 150 INSTALAÇÕES (12-13 por categoria)
  // ══════════════════════════════════════════
  facilities: [

    // ═══════════════════════════
    // 🌾 CAMPOS AGRÍCOLAS (13)
    // ═══════════════════════════
    {
      id:'agro_1', cat:'agro', name:'Roça Familiar', icon:'🌱', phase:1, reqLevel:0,
      cost:5, prodPerHour:0.5, jobs:2, pollution:0, energy:0,
      desc:'Pequenas hortas comunitárias de subsistência. Primeiro passo da soberania alimentar.',
      inputs:[], outputs:['Alimentos'],
      upgrades:[
        {name:'Semente Melhorada',cost:12,bonus:'+30% produção'},
        {name:'Irrigação Básica',cost:25,bonus:'+50% produção, -20% clima'}
      ]
    },
    {
      id:'agro_2', cat:'agro', name:'Fazenda de Grãos', icon:'🌾', phase:1, reqLevel:2,
      cost:80, prodPerHour:4, jobs:8, pollution:1, energy:2,
      desc:'Cultivo extensivo de milho, soja e trigo com maquinário básico.',
      inputs:['Água'], outputs:['Grãos','Alimentos'],
      upgrades:[
        {name:'Colheitadeira Autopilot',cost:200,bonus:'+60% produção'},
        {name:'Drones Agrícolas',cost:500,bonus:'+40% eficiência, -30% trabalhadores'}
      ]
    },
    {
      id:'agro_3', cat:'agro', name:'Complexo Avícola', icon:'🐔', phase:1, reqLevel:3,
      cost:150, prodPerHour:7, jobs:15, pollution:2, energy:3,
      desc:'Produção industrial de frango e ovos para exportação.',
      inputs:['Grãos','Água'], outputs:['Proteína Animal'],
      upgrades:[
        {name:'Biossegurança Máxima',cost:300,bonus:'+25% saúde do plantel'},
        {name:'Linha de Processamento Robótica',cost:800,bonus:'+80% produção'}
      ]
    },
    {
      id:'agro_4', cat:'agro', name:'Silos de Armazenamento', icon:'🛖', phase:1, reqLevel:4,
      cost:200, prodPerHour:2, jobs:5, pollution:0, energy:1,
      desc:'Armazenamento atmosférico controlado reduzindo perdas pós-colheita.',
      inputs:['Grãos'], outputs:['Reserva Alimentar'],
      upgrades:[
        {name:'Atmosfera de Nitrogênio',cost:400,bonus:'0% perdas'},
        {name:'IA de Monitoramento',cost:900,bonus:'+15% capacidade'}
      ]
    },
    {
      id:'agro_5', cat:'agro', name:'Agroindústria de Suco', icon:'🍊', phase:1, reqLevel:5,
      cost:400, prodPerHour:14, jobs:22, pollution:1, energy:4,
      desc:'Processamento de frutas tropicais para exportação de alto valor.',
      inputs:['Frutas','Água','Energia'], outputs:['Suco Concentrado'],
      upgrades:[
        {name:'Liofilização',cost:1000,bonus:'+50% vida útil do produto'},
        {name:'Certificação Orgânica',cost:2000,bonus:'+40% preço de venda'}
      ]
    },
    {
      id:'agro_6', cat:'agro', name:'Fazenda Vertical LED', icon:'🥬', phase:2, reqLevel:10,
      cost:1200, prodPerHour:40, jobs:12, pollution:0, energy:15,
      desc:'Produção urbana em torres com LEDs e 95% menos água que o campo.',
      inputs:['Energia','Água'], outputs:['Vegetais Premium'],
      upgrades:[
        {name:'Espectro Fotônico Ótimo',cost:3000,bonus:'+35% crescimento'},
        {name:'Hidroponia Aeropônica',cost:7000,bonus:'+60% produção'}
      ]
    },
    {
      id:'agro_7', cat:'agro', name:'Polo de Biocombustíveis', icon:'🌿', phase:2, reqLevel:13,
      cost:3500, prodPerHour:85, jobs:30, pollution:1, energy:8,
      desc:'Etanol de cana e biodiesel de soja substituindo importações de petróleo.',
      inputs:['Cana','Energia'], outputs:['Etanol','Biodiesel'],
      upgrades:[
        {name:'Etanol de 2ª Geração',cost:8000,bonus:'+70% eficiência energética'},
        {name:'Gasificação de Biomassa',cost:18000,bonus:'+Gás verde local'}
      ]
    },
    {
      id:'agro_8', cat:'agro', name:'Planta de Biofertilizantes', icon:'🧪', phase:2, reqLevel:15,
      cost:6000, prodPerHour:120, jobs:20, pollution:0, energy:6,
      desc:'Fertilizantes biológicos soberanos substituindo importações russas e chinesas.',
      inputs:['Biomassa','Energia'], outputs:['Biofertilizante'],
      upgrades:[
        {name:'Fixação Biológica de N₂',cost:15000,bonus:'100% soberania em nitrogênio'},
        {name:'Micobioma Nativo',cost:30000,bonus:'+45% produtividade do solo'}
      ]
    },
    {
      id:'agro_9', cat:'agro', name:'Dessalinização Solar Agrícola', icon:'🚰', phase:2, reqLevel:18,
      cost:14000, prodPerHour:200, jobs:18, pollution:0, energy:20,
      desc:'Água do mar convertida em irrigação para áridas regiões internas.',
      inputs:['Energia Solar','Água Salgada'], outputs:['Água Doce Agrícola'],
      upgrades:[
        {name:'Osmose Reversa Quantum',cost:35000,bonus:'-50% energia por litro'},
        {name:'Escala Continental',cost:80000,bonus:'+200% capacidade'}
      ]
    },
    {
      id:'agro_10', cat:'agro', name:'Biofábrica de Proteína', icon:'🥩', phase:2, reqLevel:22,
      cost:28000, prodPerHour:380, jobs:35, pollution:0, energy:25,
      desc:'Carne e laticínios cultivados em biorreatores sem animais.',
      inputs:['Células-tronco','Energia','Água'], outputs:['Proteína Cultivada'],
      upgrades:[
        {name:'Biorreator de Alta Densidade',cost:70000,bonus:'+80% produção'},
        {name:'Sabor e Textura Premium',cost:150000,bonus:'+60% preço'}
      ]
    },
    {
      id:'agro_11', cat:'agro', name:'Domos Climáticos Herméticos', icon:'🛡️', phase:3, reqLevel:30,
      cost:80000, prodPerHour:900, jobs:60, pollution:0, energy:50,
      desc:'Colheitas protegidas de qualquer adversidade climática global.',
      inputs:['Energia','CO₂ Controlado'], outputs:['Alimentos Garantidos'],
      upgrades:[
        {name:'Geosphere Dome v2',cost:200000,bonus:'+100% estabilidade de colheita'},
        {name:'Ecossistema Fechado',cost:500000,bonus:'Zero impacto externo'}
      ]
    },
    {
      id:'agro_12', cat:'agro', name:'CRISPR Super-Culturas', icon:'🧬', phase:3, reqLevel:40,
      cost:250000, prodPerHour:2500, jobs:45, pollution:0, energy:30,
      desc:'Sementes ultra-resilientes com fotossíntese acelerada C4 e genes de seca.',
      inputs:['Laboratório'], outputs:['Sementes Supremas'],
      upgrades:[
        {name:'Gene de Resistência Universal',cost:600000,bonus:'+200% em qualquer clima'},
        {name:'Fotossíntese Artificial C5',cost:2000000,bonus:'+500% produtividade'}
      ]
    },
    {
      id:'agro_13', cat:'agro', name:'Agro-Orbital Hidropônico', icon:'🛸', phase:3, reqLevel:55,
      cost:1200000, prodPerHour:8000, jobs:20, pollution:0, energy:100,
      desc:'Estufas orbitais aproveitando luz solar 24h sem atmosfera para cultivo.',
      inputs:['Energia Orbital','Água Reciclada'], outputs:['Alimentos Orbitais'],
      upgrades:[
        {name:'Gravidade Artificial',cost:3000000,bonus:'+80% variedade de cultivos'},
        {name:'Módulo de Exportação Orbital',cost:8000000,bonus:'Exporta para estações espaciais'}
      ]
    },

    // ═══════════════════════════
    // 💧 COMPLEXO HÍDRICO (12)
    // ═══════════════════════════
    {
      id:'water_1', cat:'water', name:'Poço Artesiano', icon:'🕳️', phase:1, reqLevel:0,
      cost:10, prodPerHour:1, jobs:1, pollution:0, energy:0,
      desc:'Extração de água subterrânea para uso comunitário básico.',
      inputs:[], outputs:['Água'],
      upgrades:[{name:'Bomba Elétrica Solar',cost:30,bonus:'+100% vazão'}]
    },
    {
      id:'water_2', cat:'water', name:'Estação de Tratamento', icon:'🏭', phase:1, reqLevel:2,
      cost:120, prodPerHour:5, jobs:8, pollution:0, energy:3,
      desc:'Tratamento de água superficial para consumo humano seguro.',
      inputs:['Água Bruta'], outputs:['Água Potável'],
      upgrades:[{name:'Ozônio + UV',cost:300,bonus:'+99.9% pureza'}]
    },
    {
      id:'water_3', cat:'water', name:'Reservatório Estratégico', icon:'🏞️', phase:1, reqLevel:3,
      cost:300, prodPerHour:8, jobs:5, pollution:0, energy:1,
      desc:'Armazenamento de água em reservatório para garantir oferta anual.',
      inputs:['Água'], outputs:['Reserva Hídrica'],
      upgrades:[{name:'Impermeabilização Geotêxtil',cost:700,bonus:'-30% evaporação'}]
    },
    {
      id:'water_4', cat:'water', name:'Rede de Distribuição Urbana', icon:'🔧', phase:1, reqLevel:4,
      cost:500, prodPerHour:12, jobs:20, pollution:0, energy:5,
      desc:'Tubulações inteligentes com sensores de vazamento em tempo real.',
      inputs:['Água Potável'], outputs:['Distribuição Urbana'],
      upgrades:[{name:'Tubos de HDPE sem Corrosão',cost:1200,bonus:'-80% perdas'}]
    },
    {
      id:'water_5', cat:'water', name:'Usina Hidrelétrica de Médio Porte', icon:'🌊', phase:1, reqLevel:6,
      cost:900, prodPerHour:28, jobs:18, pollution:1, energy:-50,
      desc:'Geração de energia a fio d\'água com turbinas Kaplan.',
      inputs:['Rio'], outputs:['Energia Elétrica','Água Regulada'],
      upgrades:[{name:'Turbina de Baixa Queda',cost:2200,bonus:'+40% geração'}]
    },
    {
      id:'water_6', cat:'water', name:'Aqueduto Continental', icon:'🌁', phase:2, reqLevel:12,
      cost:3000, prodPerHour:60, jobs:40, pollution:0, energy:8,
      desc:'Transposição de rio interligando bacias deficitárias do interior.',
      inputs:['Engenharia'], outputs:['Água para Regiões Áridas'],
      upgrades:[{name:'Canal Coberto Anti-Evaporação',cost:7000,bonus:'-40% perdas de transporte'}]
    },
    {
      id:'water_7', cat:'water', name:'Dessalinizadora Industrial', icon:'🌊', phase:2, reqLevel:15,
      cost:6500, prodPerHour:110, jobs:30, pollution:1, energy:30,
      desc:'Plantas de osmose reversa produzindo água doce do oceano.',
      inputs:['Energia','Água Salgada'], outputs:['Água Doce'],
      upgrades:[{name:'Osmose Nanofiltrada',cost:15000,bonus:'+50% eficiência energética'}]
    },
    {
      id:'water_8', cat:'water', name:'Sistema de Irrigação Precisa', icon:'💦', phase:2, reqLevel:17,
      cost:9000, prodPerHour:150, jobs:15, pollution:0, energy:12,
      desc:'Gotejamento com sensores IoT reduzindo consumo agrícola em 70%.',
      inputs:['Água','Energia','Sensores'], outputs:['Produção Agrícola'],
      upgrades:[{name:'IA de Previsão de Solo',cost:22000,bonus:'-70% desperdício'}]
    },
    {
      id:'water_9', cat:'water', name:'Central de Reciclagem de Água', icon:'♻️', phase:2, reqLevel:20,
      cost:18000, prodPerHour:220, jobs:25, pollution:0, energy:20,
      desc:'100% da água industrial retorna ao ciclo após tratamento.',
      inputs:['Água Residual'], outputs:['Água Reciclada'],
      upgrades:[{name:'Circuito Fechado Zero-Descarte',cost:45000,bonus:'100% reaproveitamento'}]
    },
    {
      id:'water_10', cat:'water', name:'Captação de Névoa Atmosférica', icon:'🌫️', phase:2, reqLevel:24,
      cost:35000, prodPerHour:320, jobs:10, pollution:0, energy:5,
      desc:'Redes captam umidade do ar em regiões áridas costeiras.',
      inputs:['Tecnologia'], outputs:['Água de Névoa'],
      upgrades:[{name:'Malha de Grafeno',cost:80000,bonus:'+300% captação'}]
    },
    {
      id:'water_11', cat:'water', name:'Barragem Hidrelétrica Colossal', icon:'🏔️', phase:3, reqLevel:35,
      cost:150000, prodPerHour:900, jobs:200, pollution:3, energy:-300,
      desc:'Megabarragem gerando energia para toda uma região nacional.',
      inputs:['Rio Caudaloso'], outputs:['Energia Massiva','Reserva Nacional'],
      upgrades:[{name:'Turbinas de Titânio',cost:400000,bonus:'+35% eficiência'},
                {name:'Monitoramento Sísmico IA',cost:800000,bonus:'Segurança máxima'}]
    },
    {
      id:'water_12', cat:'water', name:'Extração de Aquífero Profundo', icon:'🌍', phase:3, reqLevel:45,
      cost:400000, prodPerHour:2200, jobs:80, pollution:1, energy:40,
      desc:'Perfuração a 3km extraindo aquíferos fósseis de bilhões de anos.',
      inputs:['Perfuratriz','Energia'], outputs:['Água Fóssil Pura'],
      upgrades:[{name:'Sensor de Ressonância Magnética',cost:1000000,bonus:'Mapeia 100% do aquífero'}]
    },

    // ═══════════════════════════
    // ⚡ ENERGIA PRIMÁRIA (13)
    // ═══════════════════════════
    {
      id:'energy_1', cat:'energy', name:'Gerador a Diesel', icon:'⛽', phase:1, reqLevel:0,
      cost:8, prodPerHour:0.8, jobs:1, pollution:3, energy:-5,
      desc:'Geração emergencial básica para os primeiros dias da nação.',
      inputs:['Diesel'], outputs:['Energia'],
      upgrades:[{name:'Recuperador de Calor',cost:20,bonus:'+20% eficiência'}]
    },
    {
      id:'energy_2', cat:'energy', name:'Usina Termelétrica a Gás', icon:'🔥', phase:1, reqLevel:2,
      cost:200, prodPerHour:10, jobs:12, pollution:2, energy:-80,
      desc:'Geração confiável de resposta rápida com turbinas a gás natural.',
      inputs:['Gás Natural'], outputs:['Energia Elétrica'],
      upgrades:[{name:'Ciclo Combinado CCGT',cost:500,bonus:'+40% eficiência térmica'}]
    },
    {
      id:'energy_3', cat:'energy', name:'Parque Solar Fotovoltaico', icon:'☀️', phase:1, reqLevel:3,
      cost:500, prodPerHour:18, jobs:8, pollution:0, energy:-120,
      desc:'Painéis monocristalinos em fazenda solar de 50MW.',
      inputs:[], outputs:['Energia Solar'],
      upgrades:[{name:'Rastreadores Solares Duplos',cost:1200,bonus:'+35% captação'},
                {name:'Painel Bifacial 700W',cost:3000,bonus:'+25% adicional'}]
    },
    {
      id:'energy_4', cat:'energy', name:'Parque Eólico Terrestre', icon:'🌬️', phase:1, reqLevel:5,
      cost:900, prodPerHour:32, jobs:10, pollution:0, energy:-150,
      desc:'Turbinas de 5MW em planaltos com ventos constantes acima de 8m/s.',
      inputs:[], outputs:['Energia Eólica'],
      upgrades:[{name:'Lâminas de Fibra de Carbono',cost:2200,bonus:'+30% captação'}]
    },
    {
      id:'energy_5', cat:'energy', name:'Parque Eólico Offshore', icon:'💨', phase:2, reqLevel:10,
      cost:4000, prodPerHour:100, jobs:20, pollution:0, energy:-400,
      desc:'Turbinas marítimas flutuantes de 15MW com ventos constantes.',
      inputs:[], outputs:['Energia Eólica Marítima'],
      upgrades:[{name:'Fundação Monopile',cost:9000,bonus:'+45% em águas profundas'},
                {name:'Cable HVDC Submarino',cost:20000,bonus:'Transmissão de 0% perda'}]
    },
    {
      id:'energy_6', cat:'energy', name:'Usina Hidrelétrica Inteligente', icon:'🌊', phase:2, reqLevel:12,
      cost:8000, prodPerHour:200, jobs:30, pollution:1, energy:-600,
      desc:'Barragem com turbinas Kaplan e telemetria preditiva.',
      inputs:['Água'], outputs:['Energia Hidrelétrica'],
      upgrades:[{name:'Turbinas Reversíveis (Pumped Storage)',cost:20000,bonus:'+armazenamento de energia'}]
    },
    {
      id:'energy_7', cat:'energy', name:'Usina Geotérmica Profunda', icon:'🌋', phase:2, reqLevel:16,
      cost:22000, prodPerHour:420, jobs:25, pollution:0, energy:-800,
      desc:'Extração de vapor supercrítico a 5km de profundidade geotérmica.',
      inputs:[], outputs:['Energia Geotérmica'],
      upgrades:[{name:'Perfuração Geotérmica Enhanced EGS',cost:55000,bonus:'Funciona em qualquer região'}]
    },
    {
      id:'energy_8', cat:'energy', name:'Reator Nuclear PWR Gen III+', icon:'⚛️', phase:2, reqLevel:22,
      cost:80000, prodPerHour:1200, jobs:150, pollution:1, energy:-2000,
      desc:'Reator de água pressurizada com sistema passivo de resfriamento.',
      inputs:['Urânio Enriquecido'], outputs:['Energia Nuclear'],
      upgrades:[{name:'Combustível MOX',cost:200000,bonus:'+20% eficiência com urânio reciclado'},
                {name:'Revestimento de Zircônia',cost:450000,bonus:'Segurança máxima contra fusão'}]
    },
    {
      id:'energy_9', cat:'energy', name:'Reatores Modulares SMR', icon:'🔋', phase:3, reqLevel:30,
      cost:250000, prodPerHour:3000, jobs:80, pollution:0, energy:-5000,
      desc:'Mini reatores compactos descentralizados de próxima geração.',
      inputs:['Urânio de Alta Assay'], outputs:['Energia Nuclear Distribuída'],
      upgrades:[{name:'Reator de Sal Fundido',cost:600000,bonus:'+50% eficiência, impossível fundir'}]
    },
    {
      id:'energy_10', cat:'energy', name:'Complexo de Hidrogênio Verde', icon:'🧪', phase:3, reqLevel:35,
      cost:600000, prodPerHour:5000, jobs:60, pollution:0, energy:-3000,
      desc:'Eletrólise em escala industrial com energia 100% renovável.',
      inputs:['Energia Renovável','Água'], outputs:['Hidrogênio Verde'],
      upgrades:[{name:'Eletrolisador de Alta Pressão',cost:1500000,bonus:'+60% eficiência'}]
    },
    {
      id:'energy_11', cat:'energy', name:'Matriz Solar Espacial', icon:'🛰️', phase:3, reqLevel:50,
      cost:2000000, prodPerHour:18000, jobs:40, pollution:0, energy:-10000,
      desc:'Satélites coletam energia solar 24/7 e transmitem via micro-ondas.',
      inputs:[], outputs:['Energia Orbital'],
      upgrades:[{name:'Transmissor MASER 100GW',cost:5000000,bonus:'+200% transmissão'}]
    },
    {
      id:'energy_12', cat:'energy', name:'Usina de Fusão Tokamak', icon:'🌟', phase:3, reqLevel:70,
      cost:8000000, prodPerHour:80000, jobs:200, pollution:0, energy:-50000,
      desc:'Fusão nuclear magnética com plasma de deutério-trítio confinado.',
      inputs:['Deutério','Trítio'], outputs:['Energia Infinita'],
      upgrades:[{name:'Magnetos Supercondutores HTS',cost:20000000,bonus:'Confinamento perfeito de plasma'}]
    },
    {
      id:'energy_13', cat:'energy', name:'Rede de Supercondutores Nacionais', icon:'🔌', phase:3, reqLevel:60,
      cost:4000000, prodPerHour:30000, jobs:100, pollution:0, energy:5000,
      desc:'Grid elétrico de alta temperatura zero-perda interligando todo o país.',
      inputs:['Supercondutores','Energia'], outputs:['Distribuição Zero-Perda'],
      upgrades:[{name:'Cabo YBCO Criogênico',cost:10000000,bonus:'0% perda em transmissão de longa distância'}]
    },

    // ═══════════════════════════
    // 🛢️ HIDROCARBONETOS (12)
    // ═══════════════════════════
    {
      id:'petro_1', cat:'petro', name:'Poço de Petróleo Terrestre', icon:'🛢️', phase:1, reqLevel:2,
      cost:300, prodPerHour:12, jobs:15, pollution:3, energy:0,
      desc:'Extração onshore de petróleo com bombeamento mecânico.',
      inputs:['Campo Petrolífero'], outputs:['Petróleo Bruto'],
      upgrades:[{name:'Fraturamento Hidráulico',cost:800,bonus:'+60% extração'}]
    },
    {
      id:'petro_2', cat:'petro', name:'Campo de Gás Natural', icon:'🌡️', phase:1, reqLevel:3,
      cost:450, prodPerHour:16, jobs:12, pollution:2, energy:0,
      desc:'Extração e processamento de gás natural para uso industrial.',
      inputs:['Campo Gasífero'], outputs:['Gás Natural'],
      upgrades:[{name:'Captura de CO₂ do Gás',cost:1100,bonus:'-50% emissões'}]
    },
    {
      id:'petro_3', cat:'petro', name:'Refinaria de Petróleo', icon:'🏭', phase:1, reqLevel:5,
      cost:1200, prodPerHour:45, jobs:40, pollution:4, energy:20,
      desc:'Destilação fracionada produzindo gasolina, diesel, querosene e nafta.',
      inputs:['Petróleo Bruto'], outputs:['Gasolina','Diesel','Querosene'],
      upgrades:[{name:'Hidrocraqueamento',cost:3000,bonus:'+35% rendimento em derivados nobres'},
                {name:'Coqueamento Retardado',cost:7000,bonus:'Zero resíduo de borra'}]
    },
    {
      id:'petro_4', cat:'petro', name:'Terminal de GNL', icon:'❄️', phase:2, reqLevel:10,
      cost:4000, prodPerHour:90, jobs:35, pollution:1, energy:15,
      desc:'Liquefação de gás natural para exportação e armazenamento de longa duração.',
      inputs:['Gás Natural','Energia'], outputs:['GNL Exportável'],
      upgrades:[{name:'Trem de Liquefação APCI',cost:10000,bonus:'+50% capacidade'}]
    },
    {
      id:'petro_5', cat:'petro', name:'Plataforma Offshore Rasa', icon:'⛽', phase:2, reqLevel:12,
      cost:7000, prodPerHour:160, jobs:50, pollution:3, energy:0,
      desc:'Plataforma em águas rasas de até 200m com produção de 100k bpd.',
      inputs:['Campo Offshore'], outputs:['Petróleo Offshore'],
      upgrades:[{name:'Injeção de Polímeros EOR',cost:18000,bonus:'+40% recuperação'}]
    },
    {
      id:'petro_6', cat:'petro', name:'Plataforma FPSO Águas Profundas', icon:'🚢', phase:2, reqLevel:18,
      cost:22000, prodPerHour:380, jobs:80, pollution:3, energy:0,
      desc:'Navio-plataforma operando no pré-sal com 250k barris/dia.',
      inputs:['Campo Pré-sal'], outputs:['Petróleo Ultraleve'],
      upgrades:[{name:'FPSO de Última Geração',cost:60000,bonus:'+30% produção com menos pessoal'}]
    },
    {
      id:'petro_7', cat:'petro', name:'Petroquímica Integrada', icon:'🔬', phase:2, reqLevel:20,
      cost:35000, prodPerHour:600, jobs:100, pollution:4, energy:30,
      desc:'Craqueamento de nafta e etileno para plásticos e fertilizantes nitrogenados.',
      inputs:['Nafta','Energia'], outputs:['Plásticos','Fertilizantes','Fibras'],
      upgrades:[{name:'Craqueamento Catalítico Fluido FCC',cost:85000,bonus:'+45% rendimento'}]
    },
    {
      id:'petro_8', cat:'petro', name:'Oleoduto Continental', icon:'🛤️', phase:2, reqLevel:22,
      cost:50000, prodPerHour:800, jobs:60, pollution:1, energy:8,
      desc:'Malha de oleodutos garantindo distribuição nacional sem caminhões.',
      inputs:['Petróleo Bruto'], outputs:['Distribuição Nacional'],
      upgrades:[{name:'Monitoramento SCADA 4.0',cost:120000,bonus:'Zero vazamentos detectados'}]
    },
    {
      id:'petro_9', cat:'petro', name:'Unidade de Captura de CO₂', icon:'🌿', phase:2, reqLevel:25,
      cost:70000, prodPerHour:400, jobs:40, pollution:-3, energy:40,
      desc:'Captura e armazenamento geológico de carbono das refinarias.',
      inputs:['Emissões','Energia'], outputs:['Créditos de Carbono'],
      upgrades:[{name:'Mineralização de CO₂',cost:180000,bonus:'CO₂ virado rocha permanentemente'}]
    },
    {
      id:'petro_10', cat:'petro', name:'Refinaria de Ultra-Baixo Enxofre', icon:'⚗️', phase:3, reqLevel:35,
      cost:200000, prodPerHour:1500, jobs:150, pollution:1, energy:50,
      desc:'Refino Euro VI produzindo combustíveis 500x mais limpos.',
      inputs:['Petróleo Pesado','Hidrogênio'], outputs:['Combustíveis Limpos'],
      upgrades:[{name:'Hidrotratamento de Ultra-Precisão',cost:500000,bonus:'Zero enxofre (<10ppm)'}]
    },
    {
      id:'petro_11', cat:'petro', name:'Hub de Exportação Energética', icon:'🌍', phase:3, reqLevel:42,
      cost:500000, prodPerHour:3500, jobs:120, pollution:2, energy:0,
      desc:'Terminal multimodal exportando para 30 nações simultaneamente.',
      inputs:['GNL','Diesel','Petróleo'], outputs:['Divisas','Influência Geopolítica'],
      upgrades:[{name:'Porto de Águas Ultra-Profundas',cost:1200000,bonus:'Navios VLCC de 300k toneladas'}]
    },
    {
      id:'petro_12', cat:'petro', name:'Mineração de Metano Gelado', icon:'🧊', phase:3, reqLevel:55,
      cost:1500000, prodPerHour:9000, jobs:80, pollution:2, energy:20,
      desc:'Extração de hidratos de metano do fundo oceânico.',
      inputs:['Tecnologia Submarina'], outputs:['Metano Clathrate'],
      upgrades:[{name:'ROV de Perfuração Quântica',cost:4000000,bonus:'Acessa depósitos a 4km'}]
    },

    // ═══════════════════════════
    // ⛏️ MINERAÇÃO & METAIS (12)
    // ═══════════════════════════
    {
      id:'mining_1', cat:'mining', name:'Pedreira de Granito', icon:'🪨', phase:1, reqLevel:0,
      cost:15, prodPerHour:1.5, jobs:5, pollution:1, energy:1,
      desc:'Extração de rochas para construção civil e exportação.',
      inputs:[], outputs:['Granito','Brita'],
      upgrades:[{name:'Explosivos de Precisão',cost:40,bonus:'+50% volume extraído'}]
    },
    {
      id:'mining_2', cat:'mining', name:'Mina de Ferro', icon:'🔩', phase:1, reqLevel:2,
      cost:100, prodPerHour:6, jobs:20, pollution:2, energy:5,
      desc:'Minério de ferro com teor acima de 60% Fe para siderurgia.',
      inputs:[], outputs:['Minério de Ferro'],
      upgrades:[{name:'Flotação de Alta Recuperação',cost:250,bonus:'+40% teor do minério'}]
    },
    {
      id:'mining_3', cat:'mining', name:'Jazida de Cobre', icon:'🪙', phase:1, reqLevel:3,
      cost:250, prodPerHour:11, jobs:18, pollution:2, energy:8,
      desc:'Metal condutor fundamental para a eletrificação e eletrônica.',
      inputs:[], outputs:['Cobre'],
      upgrades:[{name:'Lixiviação Heap Leach',cost:600,bonus:'+30% recuperação de cobre'}]
    },
    {
      id:'mining_4', cat:'mining', name:'Complexo Aurífero', icon:'👑', phase:1, reqLevel:5,
      cost:600, prodPerHour:22, jobs:30, pollution:3, energy:10,
      desc:'Mineração subterrânea com refino de barras 99.9% de pureza.',
      inputs:[], outputs:['Ouro','Prata'],
      upgrades:[{name:'Cianetação em Circuito Fechado',cost:1500,bonus:'+50% recuperação, sem vazamentos'}]
    },
    {
      id:'mining_5', cat:'mining', name:'Extração de Lítio em Salares', icon:'🧂', phase:1, reqLevel:6,
      cost:1000, prodPerHour:35, jobs:25, pollution:1, energy:6,
      desc:'Evaporação solar de salmoura extraindo lítio para baterias.',
      inputs:['Salar'], outputs:['Carbonato de Lítio'],
      upgrades:[{name:'Extração por Adsorção Seletiva',cost:2500,bonus:'+80% velocidade de extração'}]
    },
    {
      id:'mining_6', cat:'mining', name:'Mina de Terras Raras', icon:'💎', phase:2, reqLevel:12,
      cost:4500, prodPerHour:90, jobs:45, pollution:4, energy:20,
      desc:'Neodímio, disprósio e lantânio para ímãs, radares e semicondutores.',
      inputs:[], outputs:['Terras Raras'],
      upgrades:[{name:'Refino por Extração por Solvente',cost:11000,bonus:'Pureza 99.99%'}]
    },
    {
      id:'mining_7', cat:'mining', name:'Complexo de Urânio', icon:'☢️', phase:2, reqLevel:18,
      cost:15000, prodPerHour:200, jobs:60, pollution:3, energy:15,
      desc:'Mineração in-situ com lixiviação ácida controlada e enriquecimento.',
      inputs:[], outputs:['Urânio U₃O₈'],
      upgrades:[{name:'ISR - Lixiviação In-Situ',cost:40000,bonus:'Zero impacto na superfície'}]
    },
    {
      id:'mining_8', cat:'mining', name:'Refinaria de Aço Primário', icon:'🏗️', phase:2, reqLevel:15,
      cost:10000, prodPerHour:160, jobs:80, pollution:4, energy:60,
      desc:'Alto-forno convertendo minério de ferro em aço bruto.',
      inputs:['Minério de Ferro','Coque','Calcário'], outputs:['Aço Bruto'],
      upgrades:[{name:'Injeção de Pulverizado de Carvão PCI',cost:25000,bonus:'-30% consumo de coque'}]
    },
    {
      id:'mining_9', cat:'mining', name:'Siderúrgica de Aço Verde', icon:'♻️', phase:2, reqLevel:20,
      cost:28000, prodPerHour:350, jobs:60, pollution:1, energy:80,
      desc:'Redução direta de ferro com hidrogênio verde — zero CO₂.',
      inputs:['Minério de Ferro','Hidrogênio Verde','Energia'], outputs:['Aço Verde'],
      upgrades:[{name:'DRI-EAF Integrado',cost:70000,bonus:'100% elétrico, zero carvão'}]
    },
    {
      id:'mining_10', cat:'mining', name:'Dragagem Abissal de Nódulos', icon:'🚢', phase:3, reqLevel:35,
      cost:120000, prodPerHour:800, jobs:40, pollution:2, energy:30,
      desc:'Colheita submarina de nódulos polimetálicos de níquel, cobalto e manganês.',
      inputs:['Tecnologia Submarina'], outputs:['Cobalto','Níquel','Manganês'],
      upgrades:[{name:'ROV Autônomo de Colheita',cost:300000,bonus:'+100% área coberta'}]
    },
    {
      id:'mining_11', cat:'mining', name:'Fundição de Metais Raros', icon:'🔮', phase:3, reqLevel:40,
      cost:300000, prodPerHour:1800, jobs:80, pollution:2, energy:100,
      desc:'Fusão e purificação de platina, irídio e ósmio para hi-tech.',
      inputs:['Platinóides'], outputs:['Metais Ultrararos Purificados'],
      upgrades:[{name:'Refusão por Feixe de Elétrons',cost:750000,bonus:'Pureza 99.9999%'}]
    },
    {
      id:'mining_12', cat:'mining', name:'Mineração de Asteroides', icon:'☄️', phase:3, reqLevel:70,
      cost:3000000, prodPerHour:15000, jobs:30, pollution:0, energy:200,
      desc:'Robôs capturadores de asteroides próximos ricos em metais preciosos.',
      inputs:['Foguete','Robôs Mineiros'], outputs:['Platina Espacial','Ferro Sideral'],
      upgrades:[{name:'Propulsão Iônica de Alta Impulso',cost:8000000,bonus:'Alcança cinturão de asteroides'}]
    },

    // ═══════════════════════════
    // 🏭 MANUFATURA PESADA (13)
    // ═══════════════════════════
    {
      id:'mfg_1', cat:'mfg', name:'Oficina Metalmecânica', icon:'⚙️', phase:1, reqLevel:1,
      cost:50, prodPerHour:3, jobs:6, pollution:1, energy:3,
      desc:'Usinagem, solda e reparos mecânicos básicos para o mercado local.',
      inputs:['Aço','Energia'], outputs:['Peças Metálicas'],
      upgrades:[{name:'Torno CNC Básico',cost:120,bonus:'+60% precisão e produção'}]
    },
    {
      id:'mfg_2', cat:'mfg', name:'Indústria Têxtil Automatizada', icon:'🧵', phase:1, reqLevel:2,
      cost:150, prodPerHour:8, jobs:20, pollution:1, energy:5,
      desc:'Teares robóticos para tecidos industriais, uniformes e militares.',
      inputs:['Algodão','Energia'], outputs:['Tecidos','Uniformes'],
      upgrades:[{name:'Fibras Sintéticas de Alta Performance',cost:400,bonus:'+50% valor agregado'}]
    },
    {
      id:'mfg_3', cat:'mfg', name:'Montadora de Veículos Elétricos', icon:'🚗', phase:1, reqLevel:5,
      cost:1000, prodPerHour:38, jobs:60, pollution:1, energy:20,
      desc:'Linha automatizada de VEs com braços robóticos de alta cadência.',
      inputs:['Aço','Baterias','Eletrônica'], outputs:['Veículos Elétricos'],
      upgrades:[{name:'Robótica Colaborativa Cobot',cost:2500,bonus:'+45% velocidade de linha'}]
    },
    {
      id:'mfg_4', cat:'mfg', name:'Cimenteira de Alta Capacidade', icon:'🏗️', phase:1, reqLevel:4,
      cost:600, prodPerHour:22, jobs:30, pollution:4, energy:15,
      desc:'Produção de cimento Portland para construção civil em escala nacional.',
      inputs:['Calcário','Energia'], outputs:['Cimento'],
      upgrades:[{name:'Forno de Baixo NOx',cost:1500,bonus:'-40% emissões'}]
    },
    {
      id:'mfg_5', cat:'mfg', name:'Fábrica de Baterias de Estado Sólido', icon:'🔋', phase:2, reqLevel:12,
      cost:6000, prodPerHour:120, jobs:50, pollution:0, energy:25,
      desc:'Células ultra-densas para mobilidade elétrica e armazenamento de rede.',
      inputs:['Lítio','Cobalto','Eletrônica'], outputs:['Baterias'],
      upgrades:[{name:'Anodo de Silício-Carbono',cost:15000,bonus:'+40% densidade de energia'}]
    },
    {
      id:'mfg_6', cat:'mfg', name:'Indústria Aeroespacial', icon:'✈️', phase:2, reqLevel:15,
      cost:12000, prodPerHour:200, jobs:100, pollution:1, energy:30,
      desc:'Fabricação de componentes para aviação comercial e militar.',
      inputs:['Titânio','Alumínio','Eletrônica'], outputs:['Aeronaves','Componentes Aéreos'],
      upgrades:[{name:'Compostos de Fibra de Carbono CFRP',cost:30000,bonus:'-30% peso das aeronaves'}]
    },
    {
      id:'mfg_7', cat:'mfg', name:'Complexo de Robótica Autônoma', icon:'🤖', phase:2, reqLevel:18,
      cost:22000, prodPerHour:350, jobs:30, pollution:0, energy:40,
      desc:'Robôs bípedes e industriais para automação total de fábricas.',
      inputs:['Eletrônica','IA','Aço'], outputs:['Robôs Industriais'],
      upgrades:[{name:'Visão Computacional 3D LiDAR',cost:55000,bonus:'Navegação autônoma perfeita'}]
    },
    {
      id:'mfg_8', cat:'mfg', name:'Centro de Manufatura Aditiva 3D', icon:'🖨️', phase:2, reqLevel:20,
      cost:40000, prodPerHour:600, jobs:25, pollution:0, energy:35,
      desc:'Impressão industrial em titânio, superligas e polímeros avançados.',
      inputs:['Pós Metálicos','Energia'], outputs:['Peças Complexas'],
      upgrades:[{name:'Impressão Multi-material Simultânea',cost:100000,bonus:'5 materiais em uma peça'}]
    },
    {
      id:'mfg_9', cat:'mfg', name:'Indústria Naval', icon:'⚓', phase:2, reqLevel:22,
      cost:60000, prodPerHour:800, jobs:200, pollution:2, energy:50,
      desc:'Construção de navios porta-contêineres, graneleiros e navios de guerra.',
      inputs:['Aço','Eletrônica','Componentes'], outputs:['Navios','Submarinos'],
      upgrades:[{name:'Solda por Laser de Alta Potência',cost:150000,bonus:'+50% velocidade de construção'}]
    },
    {
      id:'mfg_10', cat:'mfg', name:'Usina de Supercondutores HTS', icon:'🧲', phase:3, reqLevel:30,
      cost:150000, prodPerHour:1800, jobs:80, pollution:0, energy:60,
      desc:'Cabos elétricos de perda zero para levitação e armazenamento.',
      inputs:['YBCO','Nitrogênio Líquido'], outputs:['Supercondutores'],
      upgrades:[{name:'HTS a Temperatura Ambiente',cost:400000,bonus:'Sem refrigeração necessária'}]
    },
    {
      id:'mfg_11', cat:'mfg', name:'Nanofábrica de Grafeno', icon:'🧬', phase:3, reqLevel:38,
      cost:350000, prodPerHour:3500, jobs:50, pollution:0, energy:80,
      desc:'Materiais 200x mais resistentes que o aço para aeroespacial e biomédico.',
      inputs:['Carbono','Energia'], outputs:['Grafeno','Nanotubos de Carbono'],
      upgrades:[{name:'CVD de Grafeno em Escala Industrial',cost:900000,bonus:'+300% produção'}]
    },
    {
      id:'mfg_12', cat:'mfg', name:'Fundição de Metamateriais Ópticos', icon:'🔮', phase:3, reqLevel:50,
      cost:900000, prodPerHour:8000, jobs:60, pollution:0, energy:100,
      desc:'Materiais de índice de refração negativo para camuflagem e fotônica.',
      inputs:['Nanoestruturas','Energia'], outputs:['Metamateriais'],
      upgrades:[{name:'Metamaterial de Cloaking',cost:2500000,bonus:'Invisibilidade para radar e infravermelho'}]
    },
    {
      id:'mfg_13', cat:'mfg', name:'Complexo de Impressão Molecular', icon:'⚗️', phase:3, reqLevel:65,
      cost:3000000, prodPerHour:25000, jobs:40, pollution:0, energy:150,
      desc:'Síntese de materiais átomo por átomo usando STM avançado.',
      inputs:['Átomos Individuais','Quantum Computing'], outputs:['Materiais Perfeitos'],
      upgrades:[{name:'Assemblagem Molecular Autônoma',cost:8000000,bonus:'Constrói qualquer molécula programada'}]
    },

    // ═══════════════════════════
    // 🔬 TECNOLOGIA & IA (13)
    // ═══════════════════════════
    {
      id:'tech_1', cat:'tech', name:'Parque de Startups', icon:'💡', phase:1, reqLevel:1,
      cost:60, prodPerHour:4, jobs:10, pollution:0, energy:2,
      desc:'Incubadora de empresas digitais e patentes tecnológicas nacionais.',
      inputs:['Capital','Talentos'], outputs:['Patentes','Startups'],
      upgrades:[{name:'Acelerador Y-Combinator Nacional',cost:150,bonus:'+80% taxa de sucesso'}]
    },
    {
      id:'tech_2', cat:'tech', name:'Data Center Tier IV', icon:'🖥️', phase:1, reqLevel:3,
      cost:400, prodPerHour:16, jobs:15, pollution:0, energy:30,
      desc:'Infraestrutura soberana de dados com uptime 99.995%.',
      inputs:['Energia','Resfriamento'], outputs:['Capacidade de Dados'],
      upgrades:[{name:'Resfriamento Líquido por Imersão',cost:1000,bonus:'-40% consumo de energia'}]
    },
    {
      id:'tech_3', cat:'tech', name:'Fábrica de Chips 28nm', icon:'💾', phase:1, reqLevel:5,
      cost:1500, prodPerHour:55, jobs:80, pollution:1, energy:30,
      desc:'Semicondutores para uso automotivo, industrial e de consumo.',
      inputs:['Silício','Gás Especial','Energia'], outputs:['Chips 28nm'],
      upgrades:[{name:'Litografia DUV 193nm',cost:4000,bonus:'+30% densidade'}]
    },
    {
      id:'tech_4', cat:'tech', name:'Constelação de Satélites LEO', icon:'🛰️', phase:2, reqLevel:10,
      cost:5000, prodPerHour:100, jobs:40, pollution:0, energy:20,
      desc:'500 satélites de comunicação global de baixa latência.',
      inputs:['Foguetes','Eletrônica'], outputs:['Cobertura Global de Internet'],
      upgrades:[{name:'Inter-Sat Laser Links',cost:12000,bonus:'Latência <2ms global'}]
    },
    {
      id:'tech_5', cat:'tech', name:'Fundição EUV 3nm', icon:'🔬', phase:2, reqLevel:18,
      cost:35000, prodPerHour:600, jobs:200, pollution:1, energy:100,
      desc:'Litografia EUV produzindo processadores de ponta competitivos.',
      inputs:['Máquina EUV','Silício','Energia'], outputs:['Chips 3nm'],
      upgrades:[{name:'Litografia com Feixe de Elétrons',cost:90000,bonus:'Padrões <1nm'}]
    },
    {
      id:'tech_6', cat:'tech', name:'Supercomputador IA Soberana', icon:'🧠', phase:2, reqLevel:22,
      cost:70000, prodPerHour:1000, jobs:150, pollution:0, energy:500,
      desc:'Cluster de H200s treinando modelos de linguagem nacionais e IA militar.',
      inputs:['Energia','GPUs','Resfriamento'], outputs:['Modelos de IA','Capacidade de Processamento'],
      upgrades:[{name:'Cluster de 100.000 GPUs',cost:180000,bonus:'+500% capacidade de treinamento'}]
    },
    {
      id:'tech_7', cat:'tech', name:'Instituto de Cibersegurança', icon:'🔐', phase:2, reqLevel:20,
      cost:40000, prodPerHour:500, jobs:80, pollution:0, energy:15,
      desc:'Defesa e ataque cibernético de última geração com IA.',
      inputs:['Talentos','Hardware'], outputs:['Ciberdefesa','Inteligência Digital'],
      upgrades:[{name:'Honeypot Quântico',cost:100000,bonus:'Atrai e neutraliza ataques automaticamente'}]
    },
    {
      id:'tech_8', cat:'tech', name:'Laboratório Quântico Criogênico', icon:'🧊', phase:3, reqLevel:32,
      cost:200000, prodPerHour:2500, jobs:100, pollution:0, energy:200,
      desc:'Computador quântico de 1000 qubits resolvendo problemas intratáveis.',
      inputs:['Hélio Líquido','Eletrônica Quântica','Energia'], outputs:['Processamento Quântico'],
      upgrades:[{name:'1 Milhão de Qubits Lógicos',cost:500000,bonus:'Supremacia quântica absoluta'}]
    },
    {
      id:'tech_9', cat:'tech', name:'Rede Neural Bioneomórfica', icon:'👁️', phase:3, reqLevel:40,
      cost:500000, prodPerHour:6000, jobs:80, pollution:0, energy:100,
      desc:'Chips biológicos emulando eficiência energética do cérebro humano.',
      inputs:['Neurônios Sintéticos','Silício'], outputs:['IA Neuromorfa'],
      upgrades:[{name:'Interface Cérebro-Computador BCI',cost:1200000,bonus:'Pensamento como input direto'}]
    },
    {
      id:'tech_10', cat:'tech', name:'Centro de Criptografia Pós-Quântica', icon:'🗝️', phase:3, reqLevel:35,
      cost:280000, prodPerHour:3000, jobs:60, pollution:0, energy:30,
      desc:'Algoritmos CRYSTALS e FALCON tornando comunicações invioláveis.',
      inputs:['Quantum Computing'], outputs:['Segurança Inviolável'],
      upgrades:[{name:'Distribuição de Chave Quântica QKD',cost:700000,bonus:'Fisicamente impossível de espionar'}]
    },
    {
      id:'tech_11', cat:'tech', name:'Instituto de Biotecnologia', icon:'🧬', phase:3, reqLevel:38,
      cost:400000, prodPerHour:4500, jobs:120, pollution:0, energy:50,
      desc:'CRISPR, vacinas mRNA e fármacos de precisão desenvolvidos soberanamente.',
      inputs:['Laboratório','Talentos'], outputs:['Medicamentos','Vacinas','Tecnologia CRISPR'],
      upgrades:[{name:'Síntese de Proteínas Automatizada',cost:1000000,bonus:'Desenvolve novos fármacos em 48h'}]
    },
    {
      id:'tech_12', cat:'tech', name:'Matriz de AGI Sintética', icon:'🌌', phase:3, reqLevel:80,
      cost:5000000, prodPerHour:50000, jobs:50, pollution:0, energy:1000,
      desc:'Superinteligência artificial governamental com cognição geral.',
      inputs:['Quantum Computing','IA','Energia'], outputs:['Decisões Estratégicas Ótimas'],
      upgrades:[{name:'Alinhamento de Valores Humanos',cost:15000000,bonus:'AGI permanece sob controle nacional'}]
    },
    {
      id:'tech_13', cat:'tech', name:'Internet das Coisas Nacional', icon:'📡', phase:2, reqLevel:25,
      cost:90000, prodPerHour:1200, jobs:60, pollution:0, energy:80,
      desc:'Bilhões de sensores conectados monitorando infraestrutura do país.',
      inputs:['Chips','Rede 6G','Energia'], outputs:['Dados Nacionais em Tempo Real'],
      upgrades:[{name:'Rede 6G Soberana',cost:220000,bonus:'1 Tbps de velocidade, cobertura 100%'}]
    },

    // ═══════════════════════════
    // 🛡️ COMPLEXO MILITAR (12)
    // ═══════════════════════════
    {
      id:'defense_1', cat:'defense', name:'Quartel de Infantaria', icon:'🎖️', phase:1, reqLevel:2,
      cost:100, prodPerHour:5, jobs:50, pollution:0, energy:2,
      desc:'Treinamento e prontidão das forças de reação rápida nacional.',
      inputs:['Equipamento','Alimentos'], outputs:['Força de Combate'],
      upgrades:[{name:'Treinamento de Operações Especiais',cost:250,bonus:'+50% eficácia em missões'}]
    },
    {
      id:'defense_2', cat:'defense', name:'Fábrica de Armamentos Leves', icon:'🔫', phase:1, reqLevel:3,
      cost:200, prodPerHour:10, jobs:30, pollution:1, energy:5,
      desc:'Rifles, pistolas e munições para o exército nacional.',
      inputs:['Aço','Plástico'], outputs:['Armamento'],
      upgrades:[{name:'Polímeros Balísticos',cost:500,bonus:'+30% leveza sem perder proteção'}]
    },
    {
      id:'defense_3', cat:'defense', name:'Fábrica de Blindados 8x8', icon:'🛡️', phase:2, reqLevel:8,
      cost:2000, prodPerHour:60, jobs:80, pollution:2, energy:15,
      desc:'Veículos de combate com proteção balística modular e mobilidade.',
      inputs:['Aço Especial','Eletrônica'], outputs:['Viaturas Blindadas'],
      upgrades:[{name:'Blindagem Ativa ERA',cost:5000,bonus:'Neutraliza RPGs automaticamente'}]
    },
    {
      id:'defense_4', cat:'defense', name:'Base Aérea com Caças 5ª Geração', icon:'✈️', phase:2, reqLevel:12,
      cost:8000, prodPerHour:160, jobs:120, pollution:2, energy:30,
      desc:'Esquadrão stealth multifunção com mísseis BVR e guerra eletrônica.',
      inputs:['Combustível','Aeronaves','Energia'], outputs:['Supremacia Aérea'],
      upgrades:[{name:'Piloto IA Copiloto',cost:20000,bonus:'+40% eficiência em combate'}]
    },
    {
      id:'defense_5', cat:'defense', name:'Estaleiro Naval de Fragatas', icon:'⚓', phase:2, reqLevel:15,
      cost:20000, prodPerHour:320, jobs:200, pollution:2, energy:25,
      desc:'Fragatas e corvetas para patrulha soberana da ZEE oceânica.',
      inputs:['Aço Naval','Eletrônica','Torpedo'], outputs:['Capacidade Naval'],
      upgrades:[{name:'Sonar Ativo Avançado',cost:50000,bonus:'Detecta sub a 500km'}]
    },
    {
      id:'defense_6', cat:'defense', name:'Bateria Antiaérea C-RAM', icon:'🎯', phase:2, reqLevel:16,
      cost:28000, prodPerHour:400, jobs:80, pollution:0, energy:20,
      desc:'Sistema integrado contra mísseis cruise, drones e foguetes.',
      inputs:['Radar','Mísseis','Energia'], outputs:['Domo de Proteção Aérea'],
      upgrades:[{name:'Iron Beam Laser Antidrône',cost:70000,bonus:'Intercepta a $0 por disparo'}]
    },
    {
      id:'defense_7', cat:'defense', name:'Complexo de Drones Vectus', icon:'🚀', phase:2, reqLevel:20,
      cost:60000, prodPerHour:700, jobs:60, pollution:0, energy:30,
      desc:'Enxames de drones autônomos com coordenação algorítmica de ataque.',
      inputs:['Eletrônica','IA','Energia'], outputs:['Drone Combat Pack'],
      upgrades:[{name:'Enxame Autônomo Distribuído',cost:150000,bonus:'1000 drones por missão coordenada'}]
    },
    {
      id:'defense_8', cat:'defense', name:'Submarinos de Propulsão Nuclear', icon:'🌊', phase:3, reqLevel:28,
      cost:200000, prodPerHour:1800, jobs:150, pollution:1, energy:50,
      desc:'Dissuasão estratégica silenciosa nos oceanos com misseis Trident.',
      inputs:['Urânio','Titânio','Eletrônica'], outputs:['Dissuasão Nuclear'],
      upgrades:[{name:'Propulsão Stealth Anecóica',cost:500000,bonus:'Indetectável por qualquer sonar'}]
    },
    {
      id:'defense_9', cat:'defense', name:'Míssil Hipersônico Glider', icon:'☄️', phase:3, reqLevel:35,
      cost:500000, prodPerHour:3500, jobs:100, pollution:0, energy:20,
      desc:'Velocidade Mach 12 capaz de furar qualquer defesa antimísseis.',
      inputs:['Titânio','Propelente','Eletrônica'], outputs:['Vetor Estratégico Hipersônico'],
      upgrades:[{name:'Glider Scramjet MACH 20',cost:1500000,bonus:'Mach 20, impossível de interceptar'}]
    },
    {
      id:'defense_10', cat:'defense', name:'Armas de Energia Dirigida DEW', icon:'⚡', phase:3, reqLevel:42,
      cost:1200000, prodPerHour:8000, jobs:80, pollution:0, energy:500,
      desc:'Lasers de 300kW interceptando drones e mísseis à velocidade da luz.',
      inputs:['Energia Massiva','Óptica'], outputs:['Defesa de Energia Dirigida'],
      upgrades:[{name:'Laser de 1 Megawatt',cost:3000000,bonus:'Destrói satélites inimigos em órbita'}]
    },
    {
      id:'defense_11', cat:'defense', name:'Sistema de Ciberguerra Ofensiva', icon:'💻', phase:3, reqLevel:38,
      cost:800000, prodPerHour:5000, jobs:60, pollution:0, energy:50,
      desc:'Ataques cibernéticos em infraestrutura crítica adversária.',
      inputs:['IA','Talentos'], outputs:['Capacidade de Ciberguerra'],
      upgrades:[{name:'IA de Zero-Day Exploits',cost:2000000,bonus:'Explora vulnerabilidades automaticamente'}]
    },
    {
      id:'defense_12', cat:'defense', name:'Domo Orbital de Defesa Espacial', icon:'🌐', phase:3, reqLevel:60,
      cost:5000000, prodPerHour:30000, jobs:100, pollution:0, energy:300,
      desc:'Satélites cinéticos com interceptores de ogivas e anti-satélite.',
      inputs:['Satélites','Foguetes','Energia Orbital'], outputs:['Supremacia Espacial Militar'],
      upgrades:[{name:'Laser Anti-Satélite Orbital',cost:15000000,bonus:'Elimina qualquer satélite inimigo'}]
    },

    // ═══════════════════════════
    // 🏗️ INFRAESTRUTURA (12)
    // ═══════════════════════════
    {
      id:'infra_1', cat:'infra', name:'Rodovias Básicas', icon:'🛣️', phase:1, reqLevel:0,
      cost:30, prodPerHour:2, jobs:20, pollution:2, energy:1,
      desc:'Estradas asfaltadas ligando cidades ao núcleo econômico.',
      inputs:['Cimento','Asfalto'], outputs:['Conectividade Territorial'],
      upgrades:[{name:'Rodovia Duplicada',cost:80,bonus:'+50% fluxo de mercadorias'}]
    },
    {
      id:'infra_2', cat:'infra', name:'Terminal Ferroviário', icon:'🚂', phase:1, reqLevel:3,
      cost:400, prodPerHour:16, jobs:35, pollution:1, energy:8,
      desc:'Transporte de cargas reduzindo custos logísticos em 60%.',
      inputs:['Aço','Energia'], outputs:['Logística de Carga'],
      upgrades:[{name:'Bitola Larga de Alta Velocidade',cost:1000,bonus:'+80% capacidade de carga'}]
    },
    {
      id:'infra_3', cat:'infra', name:'Porto Automatizado', icon:'🚢', phase:1, reqLevel:5,
      cost:1000, prodPerHour:40, jobs:60, pollution:2, energy:15,
      desc:'Guindastes elétricos STS operando 24/7 com IA de otimização.',
      inputs:['Energia','Tecnologia'], outputs:['Movimentação Portuária'],
      upgrades:[{name:'AGVs de Pátio Autônomos',cost:2500,bonus:'+40% eficiência sem trabalhadores'}]
    },
    {
      id:'infra_4', cat:'infra', name:'Aeroporto Internacional Hub', icon:'🛫', phase:2, reqLevel:10,
      cost:5000, prodPerHour:110, jobs:200, pollution:3, energy:40,
      desc:'Conexão com 5 continentes e frete aéreo expressão global.',
      inputs:['Combustível','Energia'], outputs:['Conectividade Global'],
      upgrades:[{name:'Pista de 4km para A380',cost:12000,bonus:'Capacidade para mega-cargueiros'}]
    },
    {
      id:'infra_5', cat:'infra', name:'Terminal de GNL', icon:'❄️', phase:2, reqLevel:12,
      cost:7000, prodPerHour:140, jobs:50, pollution:1, energy:20,
      desc:'Liquefação e exportação de gás natural em navios criogênicos.',
      inputs:['Gás Natural'], outputs:['GNL Exportado'],
      upgrades:[{name:'Train de Liquefação AP-X',cost:18000,bonus:'+50% capacidade'}]
    },
    {
      id:'infra_6', cat:'infra', name:'Ferrovia Maglev 600km/h', icon:'🚄', phase:2, reqLevel:20,
      cost:30000, prodPerHour:500, jobs:100, pollution:0, energy:100,
      desc:'Levitação magnética conectando metrópoles em minutos.',
      inputs:['Supercondutores','Energia'], outputs:['Mobilidade Ultrarrápida'],
      upgrades:[{name:'Vácuo Parcial HyperVactrain',cost:80000,bonus:'1000km/h sem resistência do ar'}]
    },
    {
      id:'infra_7', cat:'infra', name:'Rede de Fibra Óptica Nacional', icon:'🌐', phase:2, reqLevel:14,
      cost:12000, prodPerHour:200, jobs:80, pollution:0, energy:20,
      desc:'Internet de 10 Gbps cobrindo 100% do território nacional.',
      inputs:['Fibra','Energia'], outputs:['Conectividade Digital'],
      upgrades:[{name:'Backbone de Fibra Quântica',cost:30000,bonus:'Comunicação inviolável nacional'}]
    },
    {
      id:'infra_8', cat:'infra', name:'Sistema de Esgoto Inteligente', icon:'♻️', phase:1, reqLevel:6,
      cost:800, prodPerHour:20, jobs:30, pollution:-2, energy:5,
      desc:'Coleta, tratamento e reuso de água de esgoto urbano.',
      inputs:['Água Residual'], outputs:['Água Reciclada','Biogás'],
      upgrades:[{name:'Metanização do Lodo',cost:2000,bonus:'+Geração de biogás da biomassa'}]
    },
    {
      id:'infra_9', cat:'infra', name:'Complexo Logístico Intermodal', icon:'📦', phase:2, reqLevel:22,
      cost:50000, prodPerHour:750, jobs:150, pollution:1, energy:40,
      desc:'Integração de porto, ferrovia e rodoviária com IA de despacho.',
      inputs:['Energia','IA'], outputs:['Cadeia de Suprimentos Otimizada'],
      upgrades:[{name:'Digital Twin da Cadeia',cost:120000,bonus:'0% atrasos na entrega'}]
    },
    {
      id:'infra_10', cat:'infra', name:'Metrô e BRT Inteligentes', icon:'🚇', phase:2, reqLevel:18,
      cost:25000, prodPerHour:400, jobs:500, pollution:0, energy:80,
      desc:'Transporte público de massa reduzindo congestionamento e emissões.',
      inputs:['Energia','Tecnologia'], outputs:['Mobilidade Urbana'],
      upgrades:[{name:'Metrô Autônomo Sem Motorista',cost:60000,bonus:'+30% frequência de trens'}]
    },
    {
      id:'infra_11', cat:'infra', name:'Mega Cidade Tecnológica Planejada', icon:'🏙️', phase:3, reqLevel:40,
      cost:500000, prodPerHour:5000, jobs:10000, pollution:0, energy:500,
      desc:'Metrópole planejada com emissões zero e qualidade de vida máxima.',
      inputs:['Capital','Tecnologia','Energia'], outputs:['Capital Humano','Inovação'],
      upgrades:[{name:'Cidade Completamente Autônoma',cost:1500000,bonus:'Governa-se com IA sem burocracia'}]
    },
    {
      id:'infra_12', cat:'infra', name:'Elevador Espacial', icon:'🪐', phase:3, reqLevel:80,
      cost:8000000, prodPerHour:50000, jobs:5000, pollution:0, energy:1000,
      desc:'Cabo de nanotubos barateia em 99% o envio de cargas à órbita.',
      inputs:['Nanotubos de Carbono','Engenharia'], outputs:['Acesso Orbital Barato'],
      upgrades:[{name:'Contrapeso Orbital de Asteroid',cost:20000000,bonus:'Opera sem energia propulsora'}]
    },

    // ═══════════════════════════
    // 🏦 SISTEMA FINANCEIRO (12)
    // ═══════════════════════════
    {
      id:'finance_1', cat:'finance', name:'Banco Central Nacional', icon:'🏛️', phase:1, reqLevel:1,
      cost:100, prodPerHour:6, jobs:40, pollution:0, energy:2,
      desc:'Emissor soberano da moeda nacional e regulador do sistema financeiro.',
      inputs:['Capital'], outputs:['Moeda Nacional','Crédito'],
      upgrades:[{name:'Política Monetária de Inflação Zero',cost:250,bonus:'+20% estabilidade econômica'}]
    },
    {
      id:'finance_2', cat:'finance', name:'Banco de Desenvolvimento Nacional', icon:'🏦', phase:1, reqLevel:3,
      cost:300, prodPerHour:14, jobs:60, pollution:0, energy:3,
      desc:'Financiamento de longo prazo para infraestrutura e inovação.',
      inputs:['Capital'], outputs:['Crédito para Infraestrutura'],
      upgrades:[{name:'Green Bonds Soberanos',cost:750,bonus:'+Acesso a capital internacional'}]
    },
    {
      id:'finance_3', cat:'finance', name:'Bolsa de Valores Nacional', icon:'📈', phase:2, reqLevel:8,
      cost:1500, prodPerHour:55, jobs:50, pollution:0, energy:5,
      desc:'Mercado de ações listando empresas nacionais e atraindo investidores.',
      inputs:['Capital','Tecnologia'], outputs:['Liquidez','Investimento'],
      upgrades:[{name:'HFT e Trading Algorítmico',cost:4000,bonus:'+50% volume diário'}]
    },
    {
      id:'finance_4', cat:'finance', name:'Sistema de Pagamentos Instantâneos', icon:'⚡', phase:1, reqLevel:5,
      cost:600, prodPerHour:22, jobs:30, pollution:0, energy:4,
      desc:'PIX nacional processando trilhões em transações em milissegundos.',
      inputs:['Tecnologia','Energia'], outputs:['Fluidez Financeira'],
      upgrades:[{name:'Integração com 50 países',cost:1500,bonus:'Pagamentos internacionais sem taxas'}]
    },
    {
      id:'finance_5', cat:'finance', name:'Reservas de Ouro e Divisas', icon:'🥇', phase:2, reqLevel:12,
      cost:5000, prodPerHour:100, jobs:20, pollution:0, energy:1,
      desc:'Reservas internacionais em ouro, dólares e euros garantindo estabilidade.',
      inputs:['Ouro','Divisas'], outputs:['Estabilidade Cambial'],
      upgrades:[{name:'Desmolarização — Reserva em Bitcoin',cost:12000,bonus:'+Diversificação contra sanções'}]
    },
    {
      id:'finance_6', cat:'finance', name:'Fintech Hub Soberano', icon:'📱', phase:2, reqLevel:15,
      cost:8000, prodPerHour:160, jobs:200, pollution:0, energy:10,
      desc:'Ecossistema de fintechs de pagamento, crédito e investimento.',
      inputs:['Capital','Talentos'], outputs:['Inovação Financeira'],
      upgrades:[{name:'Open Banking + Open Finance',cost:20000,bonus:'100% dos serviços via celular'}]
    },
    {
      id:'finance_7', cat:'finance', name:'Moeda Digital do Banco Central (CBDC)', icon:'🪙', phase:2, reqLevel:18,
      cost:15000, prodPerHour:280, jobs:100, pollution:0, energy:15,
      desc:'Real Digital programável com smart contracts nativos.',
      inputs:['Blockchain Nacional'], outputs:['CBDC','Rastreabilidade Fiscal 100%'],
      upgrades:[{name:'CBDC Interoperável Internacional',cost:40000,bonus:'Troca direta sem dólar intermediário'}]
    },
    {
      id:'finance_8', cat:'finance', name:'Fundo Soberano Nacional', icon:'💰', phase:2, reqLevel:22,
      cost:30000, prodPerHour:500, jobs:80, pollution:0, energy:5,
      desc:'Investimentos no exterior gerando renda passiva para o país.',
      inputs:['Capital Excedente'], outputs:['Renda de Capital','Influência'],
      upgrades:[{name:'Portfólio de $1 Trilhão',cost:80000,bonus:'Maior fundo soberano do mundo'}]
    },
    {
      id:'finance_9', cat:'finance', name:'Hub de Seguros Estratégicos', icon:'🛡️', phase:2, reqLevel:20,
      cost:20000, prodPerHour:350, jobs:120, pollution:0, energy:6,
      desc:'Resseguradoras nacionais eliminando dependência de mercados externos.',
      inputs:['Capital','Atuários'], outputs:['Proteção de Ativos Nacionais'],
      upgrades:[{name:'Seguro Paramétrico via Satélite',cost:50000,bonus:'Paga automaticamente com dados climáticos'}]
    },
    {
      id:'finance_10', cat:'finance', name:'Câmara de Compensação Nacional', icon:'🔄', phase:3, reqLevel:30,
      cost:80000, prodPerHour:1200, jobs:60, pollution:0, energy:20,
      desc:'Clearing house alternativo ao SWIFT processando transações soberanas.',
      inputs:['Tecnologia Blockchain'], outputs:['Independência do Sistema SWIFT'],
      upgrades:[{name:'CBDC Multilateral com BRICS',cost:200000,bonus:'Alternativa ao dólar estabelecida'}]
    },
    {
      id:'finance_11', cat:'finance', name:'Plataforma de Títulos Soberanos', icon:'📋', phase:3, reqLevel:35,
      cost:150000, prodPerHour:2000, jobs:80, pollution:0, energy:10,
      desc:'Emissão de bonds soberanos em mercados internacionais.',
      inputs:['Rating de Crédito','Capital'], outputs:['Dívida Soberana Barata'],
      upgrades:[{name:'Rating AAA Soberano',cost:400000,bonus:'Juros zero em emissões futuras'}]
    },
    {
      id:'finance_12', cat:'finance', name:'Banco de Câmbio Multilateral', icon:'🌍', phase:3, reqLevel:50,
      cost:500000, prodPerHour:6000, jobs:200, pollution:0, energy:30,
      desc:'Sistema de câmbio soberano substituindo o FMI para países aliados.',
      inputs:['Reservas Internacionais','Aliados'], outputs:['Hegemonia Financeira Regional'],
      upgrades:[{name:'Moeda de Reserva Regional',cost:1500000,bonus:'Sua moeda vira o dólar da região'}]
    },

    // ═══════════════════════════
    // 🏥 CAPITAL HUMANO (12)
    // ═══════════════════════════
    {
      id:'social_1', cat:'social', name:'Posto de Saúde Comunitário', icon:'🏥', phase:1, reqLevel:0,
      cost:20, prodPerHour:1.5, jobs:5, pollution:0, energy:1,
      desc:'Atenção primária à saúde cobrindo a população local.',
      inputs:['Medicamentos'], outputs:['Saúde Básica'],
      upgrades:[{name:'Telemedicina 24h',cost:50,bonus:'Atende 5x mais pacientes remotamente'}]
    },
    {
      id:'social_2', cat:'social', name:'Escola de Ensino Básico', icon:'📚', phase:1, reqLevel:0,
      cost:15, prodPerHour:1, jobs:8, pollution:0, energy:1,
      desc:'Educação fundamental formando cidadãos e trabalhadores qualificados.',
      inputs:['Professores'], outputs:['Talento Humano Básico'],
      upgrades:[{name:'Tablets e Lousa Digital',cost:40,bonus:'+30% desempenho estudantil'}]
    },
    {
      id:'social_3', cat:'social', name:'Hospital Regional', icon:'🏨', phase:1, reqLevel:3,
      cost:200, prodPerHour:10, jobs:80, pollution:0, energy:8,
      desc:'Atenção secundária e cirurgias de média complexidade.',
      inputs:['Medicamentos','Energia','Equipamentos'], outputs:['Saúde Secundária'],
      upgrades:[{name:'Robótica Cirúrgica Da Vinci',cost:500,bonus:'+60% taxa de sucesso cirúrgico'}]
    },
    {
      id:'social_4', cat:'social', name:'Universidade de Pesquisa', icon:'🎓', phase:1, reqLevel:4,
      cost:500, prodPerHour:20, jobs:100, pollution:0, energy:10,
      desc:'Formação de cientistas e pesquisadores produzindo patentes nacionais.',
      inputs:['Capital','Professores'], outputs:['Pesquisa','Talento Humano Superior'],
      upgrades:[{name:'Liga das Universidades Top 10 Global',cost:1200,bonus:'+Retenção de talentos internacionais'}]
    },
    {
      id:'social_5', cat:'social', name:'Centro de Treinamento Vocacional', icon:'🔧', phase:1, reqLevel:5,
      cost:300, prodPerHour:14, jobs:30, pollution:0, energy:4,
      desc:'Formação técnica para soldadores, programadores e eletricistas.',
      inputs:['Professores Técnicos'], outputs:['Mão de Obra Qualificada'],
      upgrades:[{name:'EAD Nacional em Parceria com MIT',cost:750,bonus:'+100% alcance com custo igual'}]
    },
    {
      id:'social_6', cat:'social', name:'Sistema de Saneamento Universal', icon:'🚿', phase:2, reqLevel:8,
      cost:1000, prodPerHour:35, jobs:60, pollution:-1, energy:6,
      desc:'100% da população com água tratada e esgoto coletado.',
      inputs:['Água','Tecnologia'], outputs:['Saúde Pública','Dignidade'],
      upgrades:[{name:'Planta de Recuperação de Fósforo',cost:2500,bonus:'Fósforo do esgoto vira fertilizante'}]
    },
    {
      id:'social_7', cat:'social', name:'Hospital de Alta Complexidade', icon:'🧬', phase:2, reqLevel:12,
      cost:5000, prodPerHour:120, jobs:300, pollution:0, energy:30,
      desc:'Transplantes, oncologia e neurologia de ponta com tecnologia de vanguarda.',
      inputs:['Energia','Medicamentos Especiais'], outputs:['Saúde de Alta Complexidade'],
      upgrades:[{name:'Medicina de Precisão Genômica',cost:12000,bonus:'Tratamentos personalizados para cada paciente'}]
    },
    {
      id:'social_8', cat:'social', name:'Institutos de Pesquisa Científica', icon:'🔭', phase:2, reqLevel:15,
      cost:8000, prodPerHour:180, jobs:150, pollution:0, energy:20,
      desc:'P&D em física, química, biologia e ciências da computação.',
      inputs:['Capital','Talentos'], outputs:['Inovação Científica','Patentes'],
      upgrades:[{name:'Acelerador de Partículas Nacional',cost:20000,bonus:'Descobertas de classe Nobel'}]
    },
    {
      id:'social_9', cat:'social', name:'Programa Olímpico Nacional', icon:'🏅', phase:2, reqLevel:14,
      cost:6000, prodPerHour:100, jobs:200, pollution:0, energy:15,
      desc:'Alto desempenho esportivo elevando o soft power e moral nacional.',
      inputs:['Capital','Atletas'], outputs:['Medalhas','Soft Power'],
      upgrades:[{name:'Centro de Treinamento de Elite de Altitude',cost:15000,bonus:'+Chances de medalha de ouro'}]
    },
    {
      id:'social_10', cat:'social', name:'Centro de Inteligência Cultural', icon:'🎭', phase:2, reqLevel:18,
      cost:12000, prodPerHour:200, jobs:300, pollution:0, energy:10,
      desc:'Cinema, música e artes projetando a cultura nacional globalmente.',
      inputs:['Capital','Artistas'], outputs:['Soft Power','Influência Cultural'],
      upgrades:[{name:'Plataforma de Streaming Nacional',cost:30000,bonus:'Exporta cultura para 100 países'}]
    },
    {
      id:'social_11', cat:'social', name:'Sistema de Previdência Social', icon:'👴', phase:3, reqLevel:25,
      cost:50000, prodPerHour:600, jobs:500, pollution:0, energy:5,
      desc:'Aposentadoria e proteção social cobrindo 100% da população formal.',
      inputs:['Contribuições'], outputs:['Estabilidade Social','Aprovação Popular'],
      upgrades:[{name:'Fundo Previdenciário Investidor',cost:130000,bonus:'Previdência rende 3x mais'}]
    },
    {
      id:'social_12', cat:'social', name:'Academia de IA Cidadã Nacional', icon:'🤖', phase:3, reqLevel:35,
      cost:120000, prodPerHour:1500, jobs:200, pollution:0, energy:30,
      desc:'Alfabetização digital em IA para 100% da força de trabalho.',
      inputs:['Tecnologia','Professores'], outputs:['Força de Trabalho do Futuro'],
      upgrades:[{name:'IA Tutora Personalizada para Cada Cidadão',cost:300000,bonus:'Cada cidadão aprende 5x mais rápido'}]
    },

    // ═══════════════════════════
    // 🚀 PROGRAMA ESPACIAL (12)
    // ═══════════════════════════
    {
      id:'space_1', cat:'space', name:'Centro de Lançamento Espacial', icon:'🚀', phase:2, reqLevel:15,
      cost:10000, prodPerHour:200, jobs:300, pollution:2, energy:50,
      desc:'Base de lançamento de foguetes para órbita terrestre baixa.',
      inputs:['Foguetes','Combustível','Energia'], outputs:['Capacidade de Lançamento'],
      upgrades:[{name:'Plataforma Offshore para Equatorial',cost:25000,bonus:'+15% eficiência orbital'}]
    },
    {
      id:'space_2', cat:'space', name:'Agência Espacial Nacional', icon:'🌍', phase:2, reqLevel:12,
      cost:5000, prodPerHour:100, jobs:200, pollution:0, energy:20,
      desc:'Coordena missões, contratos e parcerias espaciais internacionais.',
      inputs:['Capital','Cientistas'], outputs:['Política Espacial Soberana'],
      upgrades:[{name:'Parceria com ESA e JAXA',cost:12000,bonus:'Acesso a tecnologia de ponta compartilhada'}]
    },
    {
      id:'space_3', cat:'space', name:'Satélites de Observação da Terra', icon:'🛰️', phase:2, reqLevel:14,
      cost:8000, prodPerHour:160, jobs:100, pollution:0, energy:30,
      desc:'Monitoramento de lavouras, desastres, tráfego e fronteiras.',
      inputs:['Foguetes','Eletrônica'], outputs:['Dados de Observação','Segurança Territorial'],
      upgrades:[{name:'Satélites de Alta Resolução Sub-Métrica',cost:20000,bonus:'Detecta objetos de 50cm do espaço'}]
    },
    {
      id:'space_4', cat:'space', name:'Constelação GPS/GNSS Nacional', icon:'📍', phase:2, reqLevel:18,
      cost:20000, prodPerHour:350, jobs:150, pollution:0, energy:40,
      desc:'Sistema de posicionamento independente do GPS americano.',
      inputs:['Satélites','Rede de Solo'], outputs:['Posicionamento Soberano'],
      upgrades:[{name:'Precisão Centimétrica',cost:50000,bonus:'Erro de posição <1cm'}]
    },
    {
      id:'space_5', cat:'space', name:'Fábrica de Foguetes Reutilizáveis', icon:'🔭', phase:2, reqLevel:20,
      cost:35000, prodPerHour:600, jobs:400, pollution:2, energy:60,
      desc:'Veículos lançadores reusáveis à la Falcon 9 reduzindo custos em 90%.',
      inputs:['Alumínio','Titânio','Eletrônica'], outputs:['Foguetes Reutilizáveis'],
      upgrades:[{name:'Pouso Propulsivo Autônomo',cost:90000,bonus:'100% de taxa de reutilização'}]
    },
    {
      id:'space_6', cat:'space', name:'Estação Espacial Nacional em LEO', icon:'🌐', phase:3, reqLevel:35,
      cost:200000, prodPerHour:2000, jobs:200, pollution:0, energy:100,
      desc:'Laboratório orbital permanente para pesquisa e soberania espacial.',
      inputs:['Módulos','Foguetes','Energia Solar'], outputs:['Pesquisa Orbital','Presença Espacial'],
      upgrades:[{name:'Ampliação para 20 Módulos',cost:500000,bonus:'Capacidade de 50 astronautas'}]
    },
    {
      id:'space_7', cat:'space', name:'Telescópio Espacial Nacional', icon:'🔭', phase:3, reqLevel:32,
      cost:150000, prodPerHour:1500, jobs:80, pollution:0, energy:50,
      desc:'Observatório orbital mapeando recursos de asteroides e exoplanetas.',
      inputs:['Óptica','Eletrônica'], outputs:['Mapas de Recursos Espaciais','Ciência'],
      upgrades:[{name:'Interferômetro de Baseline Terrestre',cost:400000,bonus:'Resolução 1000x Hubble'}]
    },
    {
      id:'space_8', cat:'space', name:'Missão à Lua — Base Permanente', icon:'🌕', phase:3, reqLevel:50,
      cost:1000000, prodPerHour:8000, jobs:500, pollution:0, energy:200,
      desc:'Primeira base lunar nacional minerando hélio-3 e água gelada.',
      inputs:['Foguetes Pesados','Módulos Habitacionais'], outputs:['Hélio-3','Água Lunar','Prestígio'],
      upgrades:[{name:'Domo Habitacional Pressurizado',cost:3000000,bonus:'Base permanente de 100 pessoas'}]
    },
    {
      id:'space_9', cat:'space', name:'Mineração de Asteroides C-Type', icon:'☄️', phase:3, reqLevel:60,
      cost:2000000, prodPerHour:20000, jobs:200, pollution:0, energy:300,
      desc:'Extração robótica de platina e minerais raros de asteroides carbonáceos.',
      inputs:['Foguetes','Robôs Mineiros'], outputs:['Minerais Espaciais'],
      upgrades:[{name:'Processamento In-Situ no Espaço',cost:5000000,bonus:'Retorna apenas metal refinado'}]
    },
    {
      id:'space_10', cat:'space', name:'Missão a Marte — Colônia', icon:'🔴', phase:3, reqLevel:75,
      cost:8000000, prodPerHour:60000, jobs:1000, pollution:0, energy:500,
      desc:'Colonização marciana com 10.000 habitantes e economia própria.',
      inputs:['Foguetes MCT','Habitat Marciano'], outputs:['Colônia Marciana','Recursos de Marte'],
      upgrades:[{name:'Terraformação Atmosférica',cost:25000000,bonus:'Inicia processo de criação de oxigênio em Marte'}]
    },
    {
      id:'space_11', cat:'space', name:'Arma Orbital Cinética', icon:'💥', phase:3, reqLevel:65,
      cost:3000000, prodPerHour:25000, jobs:100, pollution:0, energy:200,
      desc:'Projéteis de tungstênio em órbita equivalentes a bombas nucleares.',
      inputs:['Tungstênio','Satélite de Controle'], outputs:['Dissuasão Estratégica Orbital'],
      upgrades:[{name:'Tungstênio de Alta Velocidade MACH 30',cost:8000000,bonus:'Destruição garantida de qualquer alvo'}]
    },
    {
      id:'space_12', cat:'space', name:'Rede de Computação Quântica Orbital', icon:'💻', phase:3, reqLevel:90,
      cost:12000000, prodPerHour:100000, jobs:500, pollution:0, energy:1000,
      desc:'Satélites quânticos retransmitindo computação distribuída global.',
      inputs:['Quantum Chips','Satélites'], outputs:['Processamento Quântico Global'],
      upgrades:[{name:'Internet Quântica Global',cost:30000000,bonus:'Zero latência, zero espionagem no planeta'}]
    }
  ],

  // ══════════════════════════════════════════
  // FASES DE EVOLUÇÃO NACIONAL
  // ══════════════════════════════════════════
  phases: [
    { id:1, name:'O Sobrevivente', icon:'🌱', color:'#4ADE80', range:'$0 → $10K',   levels:'0-9',   desc:'Da terra nua aos primeiros dias de nação. Cada centavo conta.' },
    { id:2, name:'A Nação Industrial', icon:'⚙️', color:'#FACC15', range:'$10K → $1B', levels:'10-49', desc:'Industrialização, exportação e afirmação geopolítica regional.' },
    { id:3, name:'O Império Global', icon:'👑', color:'#818CF8', range:'$1B+',       levels:'50+',   desc:'Hegemonia tecnológica, militar e econômica. Você faz as regras.' }
  ],

  // ══════════════════════════════════════════
  // NAÇÕES DO MUNDO (para Aba Mundo)
  // ══════════════════════════════════════════
  nations: [
    { id:'usa',    name:'Estados Unidos',  icon:'🇺🇸', power:9800, gdp:'$28T',  alliance:'neutral', ideology:'liberal'  },
    { id:'china',  name:'China',           icon:'🇨🇳', power:8900, gdp:'$18T',  alliance:'neutral', ideology:'estatista'},
    { id:'russia', name:'Rússia',          icon:'🇷🇺', power:7200, gdp:'$2.2T', alliance:'neutral', ideology:'autoritário'},
    { id:'eu',     name:'União Europeia',  icon:'🇪🇺', power:7500, gdp:'$18T',  alliance:'neutral', ideology:'liberal'  },
    { id:'india',  name:'Índia',           icon:'🇮🇳', power:6100, gdp:'$3.7T', alliance:'neutral', ideology:'democrático'},
    { id:'brazil', name:'Brasil',          icon:'🇧🇷', power:3200, gdp:'$2.1T', alliance:'neutral', ideology:'democrático'},
    { id:'uk',     name:'Reino Unido',     icon:'🇬🇧', power:5800, gdp:'$3.1T', alliance:'neutral', ideology:'liberal'  },
    { id:'japan',  name:'Japão',           icon:'🇯🇵', power:5500, gdp:'$4.2T', alliance:'neutral', ideology:'liberal'  },
    { id:'korea',  name:'Coreia do Sul',   icon:'🇰🇷', power:4200, gdp:'$1.7T', alliance:'neutral', ideology:'liberal'  },
    { id:'saudi',  name:'Arábia Saudita',  icon:'🇸🇦', power:4000, gdp:'$1.1T', alliance:'neutral', ideology:'monarquia'},
    { id:'iran',   name:'Irã',            icon:'🇮🇷', power:3600, gdp:'$400B', alliance:'neutral', ideology:'teocrático'},
    { id:'turkey', name:'Turquia',         icon:'🇹🇷', power:3800, gdp:'$900B', alliance:'neutral', ideology:'islâmico' },
    { id:'africa', name:'União Africana',  icon:'🌍', power:2500, gdp:'$3T',   alliance:'neutral', ideology:'misto'    },
    { id:'asean',  name:'ASEAN',           icon:'🌏', power:4500, gdp:'$4T',   alliance:'neutral', ideology:'misto'    }
  ],

  // ══════════════════════════════════════════
  // COMMODITIES DE MERCADO
  // ══════════════════════════════════════════
  commodities: [
    { id:'oil',   name:'Petróleo',    icon:'🛢️', unit:'bbl', basePrice:80,   volatility:8  },
    { id:'gold',  name:'Ouro',        icon:'🥇', unit:'oz',  basePrice:2000, volatility:60 },
    { id:'wheat', name:'Trigo',       icon:'🌾', unit:'bu',  basePrice:5.5,  volatility:0.5},
    { id:'litio', name:'Lítio',       icon:'⚡', unit:'t',   basePrice:25000,volatility:2000},
    { id:'rare',  name:'Terras Raras',icon:'💎', unit:'kg',  basePrice:850,  volatility:80 },
    { id:'copper',name:'Cobre',       icon:'🪙', unit:'lb',  basePrice:3.8,  volatility:0.3},
    { id:'gas',   name:'Gás Natural', icon:'🌡️', unit:'mmbtu',basePrice:3.2, volatility:0.5},
    { id:'iron',  name:'Minério Fe',  icon:'🔩', unit:'t',   basePrice:120,  volatility:15 }
  ],

  // ══════════════════════════════════════════
  // EVENTOS ALEATÓRIOS
  // ══════════════════════════════════════════
  events: [
    { id:'drought',   name:'Seca Severa',       icon:'🌵', type:'crisis',  impact:'agro -40%',    duration:300 },
    { id:'oilspike',  name:'Choque do Petróleo', icon:'🛢️', type:'crisis',  impact:'petro +80%',   duration:180 },
    { id:'cyberwar',  name:'Ciberataque Global', icon:'💻', type:'crisis',  impact:'tech -30%',    duration:120 },
    { id:'pandemic',  name:'Pandemia Global',    icon:'🦠', type:'crisis',  impact:'social -50%',  duration:600 },
    { id:'boom',      name:'Boom Econômico',     icon:'📈', type:'bonus',   impact:'all +25%',     duration:240 },
    { id:'discover',  name:'Descoberta de Minério',icon:'💎',type:'bonus',  impact:'mining +60%',  duration:180 },
    { id:'treaty',    name:'Tratado de Paz',     icon:'🕊️', type:'bonus',   impact:'influence +30',duration:300 },
    { id:'tech_leap', name:'Salto Tecnológico',  icon:'🚀', type:'bonus',   impact:'tech +50%',    duration:180 }
  ],

  // ══════════════════════════════════════════
  // MINIJOGOS (Entre US style tasks)
  // ══════════════════════════════════════════
  minigames: [
    { id:'reactor',  name:'Consertar Reator',      icon:'⚛️',  color:'#F87171', desc:'Reative o núcleo alinhando os painéis de controle.' },
    { id:'swipe',    name:'Passar Credencial',      icon:'💳',  color:'#60A5FA', desc:'Deslize o cartão na velocidade correta.' },
    { id:'wires',    name:'Conectar Fios',          icon:'🔌',  color:'#4ADE80', desc:'Una fios da mesma cor antes do tempo acabar.' },
    { id:'asteroids',name:'Desviar de Asteroides',  icon:'☄️',  color:'#FACC15', desc:'Pilote a nave desviando de destroços espaciais.' },
    { id:'download', name:'Download de Inteligência',icon:'📡', color:'#C084FC', desc:'Mantenha a barra de download na zona verde.' },
    { id:'vote',     name:'Voto no Conselho',       icon:'🗳️',  color:'#FDE68A', desc:'Vote estrategicamente para aprovar sua agenda.' }
  ],

  // ══════════════════════════════════════════
  // MULTIPLICADORES & UPGRADES SOBERANOS
  // ══════════════════════════════════════════
  multipliers: [
    // ── MULTIPLICADORES DE TOQUE (EXTRAÇÃO MANUAL) ──
    {
      id: 'tap_midas_1',
      category: 'tap',
      name: 'Toque de Midas I',
      icon: '👆',
      cost: 0.50,
      reqLevel: 0,
      bonusDesc: '+$0.05 base por toque',
      desc: 'Melhora a eficiência imediata dos primeiros cliques soberanos.',
      apply: (s) => { s.tapBonusBase = (s.tapBonusBase || 0) + 0.05; }
    },
    {
      id: 'tap_mult_1',
      category: 'tap',
      name: 'Alavancagem Financeira I',
      icon: '⚡',
      cost: 2.00,
      reqLevel: 1,
      bonusDesc: 'Dobra o ganho por toque (×2)',
      desc: 'Alavanca seus rendimentos por toque multiplicando o valor final por 2.',
      apply: (s) => { s.tapMultiplier = (s.tapMultiplier || 1) * 2; }
    },
    {
      id: 'tap_gdp_1',
      category: 'tap',
      name: 'Sinergia com PIB I',
      icon: '📈',
      cost: 10.00,
      reqLevel: 2,
      bonusDesc: '+0.5% do PIB/h a cada toque',
      desc: 'Cada toque extrai uma fração direta da riqueza gerada por toda a economia nacional.',
      apply: (s) => { s.tapGdpPct = (s.tapGdpPct || 0.001) + 0.005; }
    },
    {
      id: 'tap_crit_1',
      category: 'tap',
      name: 'Sobrecarga Crítica I',
      icon: '🎯',
      cost: 25.00,
      reqLevel: 3,
      bonusDesc: '+10% chance crítica & crítico ×5',
      desc: 'Aumenta consideravelmente os golpes de sorte e picos de receita no toque.',
      apply: (s) => { s.critChance = Math.min(0.75, (s.critChance || 0.12) + 0.10); s.critMult = (s.critMult || 3.5) + 1.5; }
    },
    {
      id: 'tap_auto_1',
      category: 'tap',
      name: 'Drones de Extração (Auto-Tap I)',
      icon: '🤖',
      cost: 50.00,
      reqLevel: 4,
      bonusDesc: '1 toque automático por segundo',
      desc: 'Drones autônomos coletam receitas continuamente mesmo sem tocar na tela.',
      apply: (s) => { s.autoClickRate = (s.autoClickRate || 0) + 1; }
    },
    {
      id: 'tap_midas_2',
      category: 'tap',
      name: 'Toque de Midas II',
      icon: '🪙',
      cost: 200.00,
      reqLevel: 6,
      bonusDesc: '+$0.50 base por toque',
      desc: 'Fluxo massivo de capital direto para o Tesouro a cada extração.',
      apply: (s) => { s.tapBonusBase = (s.tapBonusBase || 0) + 0.50; }
    },
    {
      id: 'tap_mult_2',
      category: 'tap',
      name: 'Alavancagem Financeira II',
      icon: '💎',
      cost: 1000.00,
      reqLevel: 9,
      bonusDesc: 'Multiplica o toque por ×5',
      desc: 'Multiplicador exponencial de valor por toque soberano.',
      apply: (s) => { s.tapMultiplier = (s.tapMultiplier || 1) * 5; }
    },
    {
      id: 'tap_auto_2',
      category: 'tap',
      name: 'Rede de Drones IA (Auto-Tap II)',
      icon: '🛸',
      cost: 5000.00,
      reqLevel: 12,
      bonusDesc: '+5 toques automáticos por segundo',
      desc: 'Enxame de inteligência artificial minerando riqueza a cada instante.',
      apply: (s) => { s.autoClickRate = (s.autoClickRate || 0) + 5; }
    },
    {
      id: 'tap_gdp_2',
      category: 'tap',
      name: 'Sinergia com PIB II',
      icon: '🌐',
      cost: 20000.00,
      reqLevel: 15,
      bonusDesc: '+2% do PIB/h a cada toque',
      desc: 'Conexão quântica direta entre o núcleo de soberania e toda a indústria nacional.',
      apply: (s) => { s.tapGdpPct = (s.tapGdpPct || 0.001) + 0.02; }
    },
    {
      id: 'tap_supreme',
      category: 'tap',
      name: 'Toque Soberano Absoluto',
      icon: '👑',
      cost: 100000.00,
      reqLevel: 25,
      bonusDesc: 'Toque ×10 & +10 toques auto/s',
      desc: 'Poder supremo de emitir riqueza ilimitada sob demanda.',
      apply: (s) => { s.tapMultiplier = (s.tapMultiplier || 1) * 10; s.autoClickRate = (s.autoClickRate || 0) + 10; }
    },

    // ── MULTIPLICADORES DO TESOURO NACIONAL & PIB ──
    {
      id: 'treasury_eff_1',
      category: 'treasury',
      name: 'Modernização Arrecadatória',
      icon: '🏛️',
      cost: 15.00,
      reqLevel: 1,
      bonusDesc: '+15% em todas as instalações',
      desc: 'Sistema digital de arrecadação eliminando gargalos fiscais.',
      apply: (s) => { s.treasuryMultiplier = (s.treasuryMultiplier || 1) * 1.15; }
    },
    {
      id: 'treasury_interest_1',
      category: 'treasury',
      name: 'Reserva Rendeira Soberana',
      icon: '🏦',
      cost: 75.00,
      reqLevel: 3,
      bonusDesc: 'Tesouro rende 0.2% a cada 10s',
      desc: 'O saldo em caixa é aplicado em títulos de liquidez diária e gera juros compostos.',
      apply: (s) => { s.treasuryInterestRate = (s.treasuryInterestRate || 0) + 0.002; }
    },
    {
      id: 'treasury_logistics_1',
      category: 'treasury',
      name: 'Malha Logística Soberana',
      icon: '🚛',
      cost: 300.00,
      reqLevel: 5,
      bonusDesc: '+25% de PIB nacional',
      desc: 'Redução drástica do custo de frete e transporte entre todos os setores produtivos.',
      apply: (s) => { s.treasuryMultiplier = (s.treasuryMultiplier || 1) * 1.25; }
    },
    {
      id: 'treasury_trade_1',
      category: 'treasury',
      name: 'Isenção Alfandegária Estratégica',
      icon: '🚢',
      cost: 1500.00,
      reqLevel: 8,
      bonusDesc: '+35% no PIB nacional',
      desc: 'Zonas francas e incentivos fiscais aceleram o faturamento da indústria.',
      apply: (s) => { s.treasuryMultiplier = (s.treasuryMultiplier || 1) * 1.35; }
    },
    {
      id: 'treasury_swift_1',
      category: 'treasury',
      name: 'Rede Bancária Interconectada',
      icon: '💳',
      cost: 8000.00,
      reqLevel: 12,
      bonusDesc: 'Dobra a receita do PIB (×2)',
      desc: 'Soberania financeira plena permitindo transações instantâneas sem taxas estrangeiras.',
      apply: (s) => { s.treasuryMultiplier = (s.treasuryMultiplier || 1) * 2; }
    },
    {
      id: 'treasury_petrodollar',
      category: 'treasury',
      name: 'A Doutrina do Dólar Soberano',
      icon: '💵',
      cost: 50000.00,
      reqLevel: 18,
      bonusDesc: 'Multiplica o PIB por ×3',
      desc: 'Sua moeda se torna o padrão internacional de liquidação para matérias-primas.',
      apply: (s) => { s.treasuryMultiplier = (s.treasuryMultiplier || 1) * 3; }
    },
    {
      id: 'treasury_hegemony',
      category: 'treasury',
      name: 'Império Monetário Global',
      icon: '🪐',
      cost: 500000.00,
      reqLevel: 30,
      bonusDesc: 'Multiplica o PIB por ×5 & +1% juros/min',
      desc: 'Controle irrestrito sobre a riqueza e o comércio de todo o planeta.',
      apply: (s) => { s.treasuryMultiplier = (s.treasuryMultiplier || 1) * 5; s.treasuryInterestRate = (s.treasuryInterestRate || 0) + 0.01; }
    }
  ],

  // ══════════════════════════════════════════
  // ESPECIALIZAÇÕES REGIONAIS PARA TILES/PROVÍNCIAS
  // ══════════════════════════════════════════
  provinceSpecializations: [
    { id:'capital',   name:'Distrito da Capital',        icon:'🏛️', color:'#FDE68A', catBonus:'finance', mult:1.5, desc:'+50% em Bancos e Sistema Financeiro.' },
    { id:'agro_hub',  name:'Pólo Agroindustrial',        icon:'🌾', color:'#4ADE80', catBonus:'agro',    mult:1.5, desc:'+50% em Produção Agrícola e Alimentos.' },
    { id:'water_res', name:'Bacia Hídrica Estratégica',  icon:'💧', color:'#38BDF8', catBonus:'water',   mult:1.5, desc:'+50% em Complexo Hídrico e Saneamento.' },
    { id:'energy_grid',name:'Matriz Energética Limpa',   icon:'⚡', color:'#FACC15', catBonus:'energy',  mult:1.5, desc:'+50% em Geração de Energia Primária.' },
    { id:'oil_field', name:'Bacia Petrolífera & Gás',    icon:'🛢️', color:'#FB923C', catBonus:'petro',   mult:1.5, desc:'+50% em Hidrocarbonetos e Refinarias.' },
    { id:'mineral_belt',name:'Cinturão Mineral & Metais',icon:'⛏️', color:'#A78BFA', catBonus:'mining',  mult:1.5, desc:'+50% em Mineração e Terras Raras.' },
    { id:'ind_park',  name:'Parque Fabril Pesado',       icon:'🏭', color:'#60A5FA', catBonus:'mfg',     mult:1.5, desc:'+50% em Manufatura e Indústria Pesada.' },
    { id:'tech_valley',name:'Vale Tecnológico & IA',     icon:'🔬', color:'#C084FC', catBonus:'tech',    mult:1.5, desc:'+50% em Chips, Software e Inteligência Artificial.' },
    { id:'mil_base',  name:'Fortaleza Militar de Defesa',icon:'🛡️', color:'#F87171', catBonus:'defense', mult:1.5, desc:'+50% no Complexo Militar e Segurança.' },
    { id:'log_corridor',name:'Corredor de Logística',    icon:'🏗️', color:'#34D399', catBonus:'infra',   mult:1.5, desc:'+50% em Obras de Infraestrutura e Portos.' },
    { id:'edu_campus',name:'Cidade Universitária & Saúde',icon:'🏥',color:'#F9A8D4', catBonus:'social',  mult:1.5, desc:'+50% em Capital Humano e Saúde Pública.' },
    { id:'spaceport', name:'Espaçoporto Equatorial',     icon:'🚀', color:'#818CF8', catBonus:'space',   mult:1.5, desc:'+50% em Satélites e Programa Espacial.' }
  ]
};
