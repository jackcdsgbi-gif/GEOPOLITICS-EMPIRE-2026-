/**
 * GEOPOLITICS EMPIRE 2026 — Expanded Master Data Registry
 * Correções 3, 4, 5, 6:
 * - 64 Commodities em 8 Famílias
 * - 195 Nações Reais da ONU com Bônus e Personalidades IA
 * - Sistema de Defesa & Dissuasão (5 Forças, 40+ Unidades, DEFCON 5->1, MAD, 12 Bases, 8 Missões)
 * - Árvore Tecnológica (8 Ramos, 5 Eras, 400+ Techs, Eurekas)
 */

(function() {
  window.GAME_DATA = window.GAME_DATA || {};

  // ══════════════════════════════════════════════════════════
  // 🔴 CORREÇÃO 3 — CADEIA DE SUPRIMENTOS EXPANDIDA (64 COMMODITIES)
  // ══════════════════════════════════════════════════════════
  window.GAME_DATA.commodityFamilies = [
    { id: 'agro',         name: 'Agro',            icon: '🌾', color: '#4ADE80', desc: 'Grãos, alimentos básicos, fibras e proteínas' },
    { id: 'mining',       name: 'Minérios',        icon: '⛏️', color: '#A78BFA', desc: 'Metais básicos, industriais e de transição' },
    { id: 'hydrocarbons', name: 'Hidrocarbonetos', icon: '🛢️', color: '#FB923C', desc: 'Combustíveis fósseis e derivados petroquímicos' },
    { id: 'rare_earths',  name: 'Terras Raras',    icon: '🧲', color: '#C084FC', desc: 'Elementos lantanídeos críticos para alta tecnologia' },
    { id: 'tech',         name: 'Tech',            icon: '🔬', color: '#38BDF8', desc: 'Semicondutores, componentes e fotônica' },
    { id: 'energy',       name: 'Energia',         icon: '⚡', color: '#FACC15', desc: 'Vetor elétrico, renováveis, nuclear e fusão' },
    { id: 'industrial',   name: 'Industrial',      icon: '🏭', color: '#60A5FA', desc: 'Insumos pesados, polímeros e bens manufaturados' },
    { id: 'premium',      name: 'Premium',         icon: '💎', color: '#F43F5E', desc: 'Metais preciosos e gemas de reserva soberana' }
  ];

  window.GAME_DATA.commodities = [
    // 🌾 Agro (8)
    { id:'wheat',     family:'agro', name:'Trigo',           icon:'🌾', unit:'bu',    basePrice:6.20,   volatility:0.45, desc:'Grão essencial para soberania alimentar.' },
    { id:'soy',       family:'agro', name:'Soja',            icon:'🌱', unit:'bu',    basePrice:12.80,  volatility:0.85, desc:'Base da ração animal e complexo oleaginoso.' },
    { id:'corn',      family:'agro', name:'Milho',           icon:'🌽', unit:'bu',    basePrice:4.90,   volatility:0.35, desc:'Insumo calórico para nutrição e etanol.' },
    { id:'coffee',    family:'agro', name:'Café',            icon:'☕', unit:'lb',    basePrice:2.35,   volatility:0.25, desc:'Commodity nobre de exportação tropical.' },
    { id:'cocoa',     family:'agro', name:'Cacau',           icon:'🍫', unit:'t',     basePrice:4800,   volatility:320,  desc:'Amêndoas nobres para confeitaria e manteiga.' },
    { id:'cotton',    family:'agro', name:'Algodão',         icon:'🧶', unit:'lb',    basePrice:0.92,   volatility:0.07, desc:'Fibra natural para a cadeia têxtil global.' },
    { id:'sugar',     family:'agro', name:'Açúcar',          icon:'🍬', unit:'lb',    basePrice:0.24,   volatility:0.02, desc:'Sacarose para alimentos e biopolímeros.' },
    { id:'meat',      family:'agro', name:'Carne',           icon:'🥩', unit:'cwt',   basePrice:188,    volatility:12,   desc:'Proteína animal refrigerada para consumo de massa.' },

    // ⛏️ Minérios (8)
    { id:'iron',      family:'mining', name:'Ferro',         icon:'🔩', unit:'t',     basePrice:115,    volatility:9.5,  desc:'Espinha dorsal da indústria de aço e construção.' },
    { id:'copper',    family:'mining', name:'Cobre',         icon:'🪙', unit:'lb',    basePrice:4.30,   volatility:0.28, desc:'Metal condutor para redes elétricas e motores.' },
    { id:'lithium',   family:'mining', name:'Lítio',         icon:'⚡', unit:'t',     basePrice:24500,  volatility:1650, desc:'Sal de lítio para baterias de veículos elétricos.' },
    { id:'nickel',    family:'mining', name:'Níquel',        icon:'🔘', unit:'t',     basePrice:17200,  volatility:1100, desc:'Componente crucial de baterias e aços inoxidáveis.' },
    { id:'cobalt',    family:'mining', name:'Cobalto',       icon:'🧪', unit:'t',     basePrice:31500,  volatility:1900, desc:'Mineral estratégico para cátodos de alta densidade.' },
    { id:'aluminum',  family:'mining', name:'Alumínio',      icon:'🥫', unit:'t',     basePrice:2380,   volatility:140,  desc:'Metal leve para fuselagens e linhas de transmissão.' },
    { id:'tin',       family:'mining', name:'Estanho',       icon:'📦', unit:'t',     basePrice:27500,  volatility:1500, desc:'Solda crítica para toda a indústria de circuitos.' },
    { id:'tungsten',  family:'mining', name:'Tungstênio',    icon:'💡', unit:'t',     basePrice:33000,  volatility:1800, desc:'Metal superdenso para blindagens e brocas industriais.' },

    // 🛢️ Hidrocarbonetos (8)
    { id:'oil',       family:'hydrocarbons', name:'Petróleo Bruto',icon:'🛢️', unit:'bbl', basePrice:82.5,   volatility:5.5,  desc:'O sangue negro da matriz logística global.' },
    { id:'gas',       family:'hydrocarbons', name:'Gás Natural',   icon:'🌡️', unit:'mmbtu',basePrice:3.25,   volatility:0.35, desc:'Gás metano para termelétricas e fertilizantes.' },
    { id:'gasoline',  family:'hydrocarbons', name:'Gasolina',      icon:'⛽', unit:'gal',   basePrice:2.75,   volatility:0.18, desc:'Combustível leve para frotas urbanas.' },
    { id:'diesel',    family:'hydrocarbons', name:'Diesel',        icon:'🚛', unit:'gal',   basePrice:3.15,   volatility:0.22, desc:'Combustível pesado para transporte de cargas.' },
    { id:'kerosene',  family:'hydrocarbons', name:'Querosene',     icon:'✈️', unit:'gal',   basePrice:2.95,   volatility:0.20, desc:'Jet-A1 para aviação civil e esquadrões militares.' },
    { id:'lpg',       family:'hydrocarbons', name:'GLP',           icon:'🔥', unit:'t',     basePrice:590,    volatility:35,   desc:'Gás liquefeito de petróleo para aquecimento e cocção.' },
    { id:'naphtha',   family:'hydrocarbons', name:'Nafta',         icon:'🧪', unit:'t',     basePrice:660,    volatility:42,   desc:'Fração líquida usada como carga nos craqueadores.' },
    { id:'asphalt',   family:'hydrocarbons', name:'Asfalto',       icon:'🛣️', unit:'t',     basePrice:410,    volatility:25,   desc:'Betume pesado para pavimentação de rodovias.' },

    // 🧲 Terras Raras (8)
    { id:'neodymium', family:'rare_earths', name:'Neodímio', icon:'🧲', unit:'kg',    basePrice:135,    volatility:11.5, desc:'Superímãs para geradores e motores elétricos.' },
    { id:'dysprosium',family:'rare_earths', name:'Disprósio',icon:'💎', unit:'kg',    basePrice:360,    volatility:26.0, desc:'Estabilizador térmico para motores de combate.' },
    { id:'terbium',   family:'rare_earths', name:'Térbio',   icon:'🔮', unit:'kg',    basePrice:1180,   volatility:85.0, desc:'Fósforos verdes e transdutores magnetoestritivos.' },
    { id:'europium',  family:'rare_earths', name:'Európio',  icon:'💠', unit:'kg',    basePrice:72,     volatility:5.5,  desc:'Emissor vermelho em telas e barras de controle nuclear.' },
    { id:'yttrium',   family:'rare_earths', name:'Ítrio',    icon:'🧪', unit:'kg',    basePrice:44,     volatility:3.5,  desc:'Supercondutores de alta temperatura e lasers YAG.' },
    { id:'cerium',    family:'rare_earths', name:'Cério',    icon:'⚪', unit:'kg',    basePrice:12,     volatility:1.2,  desc:'Polimento de precisão óptica e catalisadores.' },
    { id:'lanthanum', family:'rare_earths', name:'Lantânio', icon:'🔬', unit:'kg',    basePrice:14,     volatility:1.4,  desc:'Vidros ópticos especiais e eletrodos de baterias.' },
    { id:'gadolinium',family:'rare_earths', name:'Gadolínio',icon:'🧲', unit:'kg',    basePrice:62,     volatility:4.8,  desc:'Agentes de contraste MRI e blindagens contra nêutrons.' },

    // 🔬 Tech (8)
    { id:'silicon',   family:'tech', name:'Silício',         icon:'🧪', unit:'kg',    basePrice:29,     volatility:2.2,  desc:'Silício policristalino grau eletrônico (9N purity).' },
    { id:'wafer',     family:'tech', name:'Wafer',           icon:'💿', unit:'un',    basePrice:88,     volatility:6.5,  desc:'Disco semicondutor polido de 300mm para litografia.' },
    { id:'circuit',   family:'tech', name:'Circuito',        icon:'🎛️', unit:'un',    basePrice:45,     volatility:3.2,  desc:'Placa multicamada de circuito impresso HDI.' },
    { id:'capacitor', family:'tech', name:'Capacitor',       icon:'🔋', unit:'k-un',  basePrice:16,     volatility:1.2,  desc:'MLCC cerâmico para filtragem de energia em placas.' },
    { id:'resistor',  family:'tech', name:'Resistor',        icon:'⚡', unit:'k-un',  basePrice:8.5,    volatility:0.6,  desc:'Resistores de precisão metálica SMD.' },
    { id:'transistor',family:'tech', name:'Transistor',      icon:'🔬', unit:'k-un',  basePrice:125,    volatility:9.5,  desc:'Portas lógicas FinFET e GAA de 2nm/3nm.' },
    { id:'led',       family:'tech', name:'LED',             icon:'💡', unit:'k-un',  basePrice:24,     volatility:1.8,  desc:'Diodo emissor de luz para iluminação e displays.' },
    { id:'fiber',     family:'tech', name:'Fibra Óptica',    icon:'🌐', unit:'km',    basePrice:38,     volatility:2.7,  desc:'Cabos de sílica monomodo para tráfego transoceânico.' },

    // ⚡ Energia (8)
    { id:'solar',     family:'energy', name:'Solar',         icon:'☀️', unit:'kW',    basePrice:210,    volatility:14,   desc:'Módulos fotovoltaicos de silício heterojunção.' },
    { id:'wind',      family:'energy', name:'Eólica',        icon:'🌬️', unit:'kW',    basePrice:315,    volatility:20,   desc:'Turbinas marítimas e terrestres de acionamento direto.' },
    { id:'nuclear',   family:'energy', name:'Nuclear',       icon:'☢️', unit:'kg',    basePrice:1900,   volatility:120,  desc:'Pastilhas de UO2 enriquecidas a 4.5% de U-235.' },
    { id:'coal',      family:'energy', name:'Carvão',        icon:'🪨', unit:'t',     basePrice:140,    volatility:11,   desc:'Carvão mineral antracito e coque metalúrgico.' },
    { id:'hydro',     family:'energy', name:'Hidrelétrica',  icon:'💧', unit:'MWh',   basePrice:54,     volatility:3.8,  desc:'Geração hídrica por turbinas Francis e Kaplan.' },
    { id:'biomass',   family:'energy', name:'Biomassa',      icon:'🌿', unit:'t',     basePrice:82,     volatility:5.5,  desc:'Pellets de madeira e resíduos agrícolas prensados.' },
    { id:'geothermal',family:'energy', name:'Geotérmica',    icon:'♨️', unit:'MWh',   basePrice:66,     volatility:4.2,  desc:'Energia entálpica de reservatórios vulcânicos.' },
    { id:'fusion',    family:'energy', name:'Fusão',         icon:'⚛️', unit:'g',     basePrice:33500,  volatility:2200, desc:'Mistura de Deutério-Trítio para reatores Tokamak.' },

    // 🏭 Industrial (8)
    { id:'steel',     family:'industrial', name:'Aço',       icon:'🏗️', unit:'t',     basePrice:760,    volatility:48,   desc:'Chapas de aço estrutural laminadas a quente.' },
    { id:'cement',    family:'industrial', name:'Cimento',   icon:'🧱', unit:'t',     basePrice:108,    volatility:7.5,  desc:'Clinquer Portland para infraestrutura urbana.' },
    { id:'glass',     family:'industrial', name:'Vidro',     icon:'🪟', unit:'m²',    basePrice:36,     volatility:2.8,  desc:'Vidro float temperado de alta transparência.' },
    { id:'plastic',   family:'industrial', name:'Plástico',  icon:'🧴', unit:'t',     basePrice:1320,   volatility:85,   desc:'Pellets de polietileno e polipropileno virgem.' },
    { id:'rubber',    family:'industrial', name:'Borracha',  icon:'🛞', unit:'t',     basePrice:1680,   volatility:98,   desc:'Elastômero sintético vulcanizado para pneus e correias.' },
    { id:'paper',     family:'industrial', name:'Papel',     icon:'📦', unit:'t',     basePrice:810,    volatility:52,   desc:'Celulose branqueada e papelão ondulado para logística.' },
    { id:'chemicals', family:'industrial', name:'Químicos',  icon:'🧪', unit:'t',     basePrice:2050,   volatility:130,  desc:'Ácido sulfúrico, amônia e cloro de base industrial.' },
    { id:'textiles',  family:'industrial', name:'Têxteis',   icon:'🧵', unit:'km',    basePrice:440,    volatility:30,   desc:'Tecidos industriais de alta resistência ao atrito.' },

    // 💎 Premium (8)
    { id:'gold',      family:'premium', name:'Ouro',         icon:'🥇', unit:'oz',    basePrice:2380,   volatility:75,   desc:'Lingotes bancários 99.99% de reserva internacional.' },
    { id:'silver',    family:'premium', name:'Prata',        icon:'🥈', unit:'oz',    basePrice:28.8,   volatility:2.1,  desc:'Metal de reserva com alta condutividade fotovoltaica.' },
    { id:'platinum',  family:'premium', name:'Platina',      icon:'🪙', unit:'oz',    basePrice:990,    volatility:58,   desc:'Metal nobre para catalisadores e semicondutores.' },
    { id:'diamond',   family:'premium', name:'Diamante',     icon:'💎', unit:'ct',    basePrice:3150,   volatility:240,  desc:'Gemas brutas e diamantes sintéticos de corte térmico.' },
    { id:'ruby',      family:'premium', name:'Rubi',         icon:'🔴', unit:'ct',    basePrice:2550,   volatility:180,  desc:'Coríndon vermelho para ótica laser e joalheria real.' },
    { id:'sapphire',  family:'premium', name:'Safira',       icon:'🔵', unit:'ct',    basePrice:1920,   volatility:140,  desc:'Substrato monocristalino para janelas de mísseis.' },
    { id:'emerald',   family:'premium', name:'Esmeralda',    icon:'🟢', unit:'ct',    basePrice:2180,   volatility:160,  desc:'Berilo precioso com inclusões de cromo.' },
    { id:'pearl',     family:'premium', name:'Pérola',       icon:'⚪', unit:'un',    basePrice:840,    volatility:65,   desc:'Gema orgânica marinha cultivada no Pacífico.' }
  ];

  // ══════════════════════════════════════════════════════════
  // 🔴 CORREÇÃO 4 — MUNDO EXPANDIDO (195 NAÇÕES DA ONU)
  // ══════════════════════════════════════════════════════════
  const KEY_NATIONS = [
    { id:'usa', name:'Estados Unidos', flag:'🇺🇸', bonus:'+25% tech/militar', archetype:'TECNOCRATA', power:9800, gdp:'$28.2T', pop:'335M', region:'América do Norte' },
    { id:'chn', name:'China', flag:'🇨🇳', bonus:'+25% manufatura', archetype:'EXPANSIONISTA', power:8900, gdp:'$18.6T', pop:'1.41B', region:'Ásia' },
    { id:'rus', name:'Rússia', flag:'🇷🇺', bonus:'+20% gás/militar', archetype:'AGRESSIVO', power:7300, gdp:'$2.1T', pop:'144M', region:'Europa' },
    { id:'bra', name:'Brasil', flag:'🇧🇷', bonus:'+25% agro/minério', archetype:'DIPLOMATA', power:5200, gdp:'$2.2T', pop:'215M', region:'América do Sul' },
    { id:'ind', name:'Índia', flag:'🇮🇳', bonus:'+20% população', archetype:'MERCANTILISTA', power:6800, gdp:'$3.9T', pop:'1.43B', region:'Ásia' },
    { id:'jpn', name:'Japão', flag:'🇯🇵', bonus:'+20% tech', archetype:'TECNOCRATA', power:6100, gdp:'$4.2T', pop:'124M', region:'Ásia' },
    { id:'deu', name:'Alemanha', flag:'🇩🇪', bonus:'+20% indústria', archetype:'ECONOMICO', power:5900, gdp:'$4.5T', pop:'84M', region:'Europa' },
    { id:'fra', name:'França', flag:'🇫🇷', bonus:'+15% diplomacia', archetype:'DIPLOMATA', power:5700, gdp:'$3.1T', pop:'68M', region:'Europa' },
    { id:'gbr', name:'Reino Unido', flag:'🇬🇧', bonus:'+15% finanças', archetype:'MERCANTILISTA', power:5800, gdp:'$3.4T', pop:'67M', region:'Europa' },
    { id:'sau', name:'Arábia Saudita', flag:'🇸🇦', bonus:'+30% petróleo', archetype:'MERCANTILISTA', power:5100, gdp:'$1.1T', pop:'36M', region:'Oriente Médio' },
    { id:'aus', name:'Austrália', flag:'🇦🇺', bonus:'+20% mineração', archetype:'ISOLACIONISTA', power:4800, gdp:'$1.7T', pop:'26M', region:'Oceania' },
    { id:'can', name:'Canadá', flag:'🇨🇦', bonus:'+20% recursos', archetype:'DEFENSIVO', power:4900, gdp:'$2.2T', pop:'40M', region:'América do Norte' }
  ];

  const OTHER_RAW_NATIONS = [
    // Europa (40)
    ['ita','Itália','🇮🇹','+15% manufatura luxo','ECONOMICO','Europa',2100,'59M'],
    ['esp','Espanha','🇪🇸','+15% turismo & energia','DIPLOMATA','Europa',1600,'48M'],
    ['nld','Países Baixos','🇳🇱','+20% logística portuária','MERCANTILISTA','Europa',1100,'18M'],
    ['che','Suíça','🇨🇭','+25% estabilidade financeira','ISOLACIONISTA','Europa',900,'9M'],
    ['pol','Polônia','🇵🇱','+15% manufatura pesada','DEFENSIVO','Europa',850,'38M'],
    ['swe','Suécia','🇸🇪','+18% inovação e defesa','TECNOCRATA','Europa',600,'10M'],
    ['nor','Noruega','🇳🇴','+22% fundo soberano & gás','ISOLACIONISTA','Europa',550,'5.5M'],
    ['bel','Bélgica','🇧🇪','+15% diplomacia europeia','DIPLOMATA','Europa',620,'12M'],
    ['aut','Áustria','🇦🇹','+14% indústria de precisão','DEFENSIVO','Europa',520,'9M'],
    ['dnk','Dinamarca','🇩🇰','+20% energia eólica','TECNOCRATA','Europa',410,'6M'],
    ['fin','Finlândia','🇫🇮','+18% ciberdefesa & educação','DEFENSIVO','Europa',300,'5.6M'],
    ['prt','Portugal','🇵🇹','+12% economia marítima','DIPLOMATA','Europa',280,'10M'],
    ['grc','Grécia','🇬🇷','+20% marinha mercante','MERCANTILISTA','Europa',240,'10M'],
    ['irl','Irlanda','🇮🇪','+22% sedes tecnológicas','ECONOMICO','Europa',540,'5.1M'],
    ['cze','Tchéquia','🇨🇿','+15% automotivo','ECONOMICO','Europa',330,'10.5M'],
    ['rou','Romênia','🇷🇴','+14% agricultura cerealífera','EXPANSIONISTA','Europa',350,'19M'],
    ['hun','Hungria','🇭🇺','+12% eletrônica','ISOLACIONISTA','Europa',210,'9.6M'],
    ['ukr','Ucrânia','🇺🇦','+18% terras raras & trigo','DEFENSIVO','Europa',180,'38M'],
    ['svk','Eslováquia','🇸🇰','+15% montadoras de veículos','ECONOMICO','Europa',130,'5.4M'],
    ['blr','Bielorrússia','🇧🇾','+12% fertilizantes potássicos','AGRESSIVO','Europa',75,'9.2M'],
    ['bgr','Bulgária','🇧🇬','+10% mineração de cobre','DEFENSIVO','Europa',100,'6.5M'],
    ['hrv','Croácia','🇭🇷','+12% costa adriática','DIPLOMATA','Europa',80,'4M'],
    ['srb','Sérvia','🇷🇸','+10% indústria bélica leve','AGRESSIVO','Europa',75,'6.7M'],
    ['ltu','Lituânia','🇱🇹','+15% biotecnologia laser','TECNOCRATA','Europa',80,'2.8M'],
    ['svn','Eslovênia','🇸🇮','+14% farmacêutica','ECONOMICO','Europa',70,'2.1M'],
    ['lva','Letônia','🇱🇻','+10% logística báltica','DEFENSIVO','Europa',45,'1.9M'],
    ['est','Estônia','🇪🇪','+25% governo digital soberano','TECNOCRATA','Europa',40,'1.3M'],
    ['cyp','Chipre','🇨🇾','+12% serviços marítimos','MERCANTILISTA','Europa',32,'1.2M'],
    ['isl','Islândia','🇮🇸','+20% geotermia e alumínio','ISOLACIONISTA','Europa',30,'0.4M'],
    ['lux','Luxemburgo','🇱🇺','+25% private banking','MERCANTILISTA','Europa',85,'0.7M'],
    ['bih','Bósnia e Herzegovina','🇧🇦','+8% hidreletricidade','DEFENSIVO','Europa',25,'3.2M'],
    ['alb','Albânia','🇦🇱','+10% extração de cromo','DIPLOMATA','Europa',23,'2.8M'],
    ['mkd','Macedônia do Norte','🇲🇰','+8% agricultura','DEFENSIVO','Europa',15,'1.8M'],
    ['mda','Moldávia','🇲🇩','+10% vitivinicultura','DIPLOMATA','Europa',16,'2.5M'],
    ['mlt','Malta','🇲🇹','+14% registro naval e iGaming','MERCANTILISTA','Europa',20,'0.5M'],
    ['mne','Montenegro','🇲🇪','+10% metalurgia leve','DIPLOMATA','Europa',7,'0.6M'],
    ['s mr','San Marino','🇸🇲','+12% reservas financeiras','ISOLACIONISTA','Europa',2,'0.03M'],
    ['mco','Mônaco','🇲🇨','+20% riqueza per capita','MERCANTILISTA','Europa',8,'0.04M'],
    ['lie','Liechtenstein','🇱🇮','+18% manufatura de precisão','ISOLACIONISTA','Europa',7,'0.04M'],
    ['and','Andorra','🇦🇩','+10% comércio isento','ISOLACIONISTA','Europa',4,'0.08M'],
    ['vat','Vaticano','🇻🇦','+50% influência moral diplomática','DIPLOMATA','Europa',1,'0.001M'],

    // Ásia & Oriente Médio (45)
    ['kor','Coreia do Sul','🇰🇷','+25% chips e eletrônica','TECNOCRATA','Ásia',1710,'52M'],
    ['idn','Indonésia','🇮🇩','+20% níquel e óleo de palma','EXPANSIONISTA','Ásia',1400,'278M'],
    ['tur','Turquia','🇹🇷','+18% trânsito de estreitos & drones','EXPANSIONISTA','Oriente Médio',1150,'85M'],
    ['irn','Irã','🇮🇷','+20% petróleo & mísseis','AGRESSIVO','Oriente Médio',400,'89M'],
    ['tha','Tailândia','🇹🇭','+15% eletrônicos automotivos','ECONOMICO','Ásia',515,'72M'],
    ['vnm','Vietnã','🇻🇳','+22% polo fabril alternativo','EXPANSIONISTA','Ásia',435,'98M'],
    ['mys','Malásia','🇲🇾','+18% semicondutores backend','MERCANTILISTA','Ásia',430,'34M'],
    ['phl','Filipinas','🇵🇭','+15% mineração de níquel','DEFENSIVO','Ásia',440,'115M'],
    ['sgp','Cingapura','🇸🇬','+25% hub financeiro & refino','MERCANTILISTA','Ásia',500,'6M'],
    ['are','Emirados Árabes','🇦🇪','+22% logística aérea e portuária','MERCANTILISTA','Oriente Médio',510,'10M'],
    ['isr','Israel','🇮🇱','+25% cibersegurança & P&D','TECNOCRATA','Oriente Médio',530,'10M'],
    ['pak','Paquistão','🇵🇰','+15% arsenal de dissuasão','DEFENSIVO','Ásia',340,'240M'],
    ['bgd','Bangladesh','🇧🇩','+20% confecções têxteis','ECONOMICO','Ásia',460,'170M'],
    ['qat','Catar','🇶🇦','+30% exportação de GNL','MERCANTILISTA','Oriente Médio',235,'3M'],
    ['kwt','Kuwait','🇰🇼','+25% reservas de petróleo','MERCANTILISTA','Oriente Médio',160,'4.5M'],
    ['kaz','Cazaquistão','🇰🇿','+25% urânio e petróleo','EXPANSIONISTA','Ásia',260,'20M'],
    ['irq','Iraque','🇮🇶','+22% bacia petrolífera de Basra','AGRESSIVO','Oriente Médio',250,'45M'],
    ['omn','Omã','🇴🇲','+15% rota marítima de Hormuz','DIPLOMATA','Oriente Médio',110,'5M'],
    ['uzb','Uzbequistão','🇺🇿','+14% ouro e algodão','ECONOMICO','Ásia',90,'36M'],
    ['lka','Sri Lanka','🇱🇰','+12% rotas do Índico','DIPLOMATA','Ásia',85,'22M'],
    ['aze','Azerbaijão','🇦🇿','+20% gás do Cáspio','AGRESSIVO','Ásia',75,'10M'],
    ['jor','Jordânia','🇯🇴','+10% estabilidade diplomática','DIPLOMATA','Oriente Médio',50,'11M'],
    ['bhr','Bahrein','🇧🇭','+14% refino e alumínio','MERCANTILISTA','Oriente Médio',45,'1.5M'],
    ['tkm','Turcomenistão','🇹🇲','+22% megacampo de gás Galkynysh','ISOLACIONISTA','Ásia',80,'6.5M'],
    ['mmr','Mianmar','🇲🇲','+15% terras raras e jade','AGRESSIVO','Ásia',65,'54M'],
    ['khm','Camboja','🇰🇭','+12% manufatura leve','ECONOMICO','Ásia',32,'17M'],
    ['npl','Nepal','🇳🇵','+15% potencial hidroelétrico','DEFENSIVO','Ásia',42,'31M'],
    ['brn','Brunei','🇧🇳','+20% hidrocarbonetos per capita','ISOLACIONISTA','Ásia',16,'0.5M'],
    ['geo','Geórgia','🇬🇪','+12% corredor de trânsito eurasiático','DIPLOMATA','Ásia',30,'3.7M'],
    ['arm','Armênia','🇦🇲','+12% software e P&D','DEFENSIVO','Ásia',24,'3M'],
    ['mng','Mongólia','🇲🇳','+22% jazidas de carvão e cobre','EXPANSIONISTA','Ásia',20,'3.5M'],
    ['lao','Laos','🇱🇦','+14% bateria fluvial do sudeste asiático','ECONOMICO','Ásia',15,'7.5M'],
    ['prk','Coreia do Norte','🇰🇵','+30% militarização e túneis','AGRESSIVO','Ásia',30,'26M'],
    ['afg','Afeganistão','🇦🇫','+25% depósitos inexplorados de lítio','ISOLACIONISTA','Ásia',15,'41M'],
    ['kgz','Quirguistão','🇰🇬','+12% mineração de ouro Kumtor','DEFENSIVO','Ásia',13,'7M'],
    ['tjk','Tajiquistão','🇹🇯','+15% alumínio e barragens','DEFENSIVO','Ásia',12,'10M'],
    ['syr','Síria','🇸🇾','+8% reconstrução e fosfatos','AGRESSIVO','Oriente Médio',20,'22M'],
    ['lbn','Líbano','🇱🇧','+10% diáspora e comércio','DIPLOMATA','Oriente Médio',18,'5.5M'],
    ['yem','Iêmen','🇾🇪','+15% controle de Bab-el-Mandeb','AGRESSIVO','Oriente Médio',22,'34M'],
    ['pse','Palestina','🇵🇸','+10% resiliência urbana','DEFENSIVO','Oriente Médio',18,'5.4M'],
    ['tls','Timor-Leste','🇹🇱','+14% gás offshore','DIPLOMATA','Ásia',3,'1.3M'],
    ['mdv','Maldivas','🇲🇻','+12% turismo insular','DIPLOMATA','Ásia',6,'0.5M'],
    ['btn','Butão','🇧🇹','+20% hidroeletricidade verde e BTC','ISOLACIONISTA','Ásia',3,'0.8M'],

    // Américas (35)
    ['mex','México','🇲🇽','+22% manufatura automotiva e nearshoring','ECONOMICO','América do Norte',1800,'128M'],
    ['arg','Argentina','🇦🇷','+20% xisto Vaca Muerta e agro','DEFENSIVO','América do Sul',640,'46M'],
    ['col','Colômbia','🇨🇴','+15% café, carvão e petróleo','DIPLOMATA','América do Sul',360,'52M'],
    ['chl','Chile','🇨🇱','+25% mineração de cobre e lítio','ECONOMICO','América do Sul',340,'19.5M'],
    ['per','Peru','🇵🇪','+20% mineração polimetálica','DEFENSIVO','América do Sul',270,'34M'],
    ['ven','Venezuela','🇻🇪','+25% maiores reservas de petróleo bruto','AGRESSIVO','América do Sul',100,'29M'],
    ['ecu','Equador','🇪🇨','+15% petróleo e banana','DEFENSIVO','América do Sul',120,'18M'],
    ['dom','República Dominicana','🇩🇴','+15% zonas francas','MERCANTILISTA','América Central',120,'11M'],
    ['gtm','Guatemala','🇬🇹','+12% agro exportação','DEFENSIVO','América Central',105,'18M'],
    ['pan','Panamá','🇵🇦','+30% trânsito pelo Canal interoceânico','MERCANTILISTA','América Central',82,'4.4M'],
    ['ury','Uruguai','🇺🇾','+18% tecnologia e carne rastreada','DIPLOMATA','América do Sul',77,'3.4M'],
    ['cri','Costa Rica','🇨🇷','+20% semicondutores e ecologia','DIPLOMATA','América Central',86,'5.2M'],
    ['bol','Bolívia','🇧🇴','+25% maiores salares de lítio do mundo','ISOLACIONISTA','América do Sul',46,'12M'],
    ['pry','Paraguai','🇵🇾','+22% energia hidrelétrica de Itaipu','ECONOMICO','América do Sul',44,'6.8M'],
    ['hnd','Honduras','🇭🇳','+10% mineração e café','DEFENSIVO','América Central',34,'10.5M'],
    ['slv','El Salvador','🇸🇻','+18% infraestrutura e inovação BTC','EXPANSIONISTA','América Central',34,'6.3M'],
    ['nic','Nicarágua','🇳🇮','+10% pecuária e ouro','ISOLACIONISTA','América Central',17,'7M'],
    ['tto','Trinidad e Tobago','🇹🇹','+20% gás natural e amônia','MERCANTILISTA','Caribe',28,'1.5M'],
    ['jam','Jamaica','🇯🇲','+15% bauxita e alumina','DIPLOMATA','Caribe',18,'2.8M'],
    ['guy','Guiana','🇬🇾','+40% maior boom petrolífero per capita','EXPANSIONISTA','América do Sul',17,'0.8M'],
    ['bhs','Bahamas','🇧🇸','+15% praça financeira offshore','MERCANTILISTA','Caribe',14,'0.4M'],
    ['hti','Haiti','🇭🇹','+8% mão de obra fabril','DEFENSIVO','Caribe',20,'11.5M'],
    ['sur','Suriname','🇸🇷','+20% descobertas de petróleo offshore','ECONOMICO','América do Sul',4,'0.6M'],
    ['brb','Barbados','🇧🇧','+12% diplomacia caribenha','DIPLOMATA','Caribe',6,'0.3M'],
    ['blz','Belize','🇧🇿','+10% ecoturismo e madeira','ISOLACIONISTA','América Central',3,'0.4M'],
    ['lca','Santa Lúcia','🇱🇨','+10% serviços marítimos','DIPLOMATA','Caribe',2,'0.2M'],
    ['atg','Antígua e Barbuda','🇦🇬','+10% regulação náutica','MERCANTILISTA','Caribe',2,'0.1M'],
    ['grd','Granada','🇬🇩','+10% especiarias e noz-moscada','DIPLOMATA','Caribe',1.2,'0.12M'],
    ['vct','São Vicente e Granadinas','🇻🇨','+10% pesca oceânica','DIPLOMATA','Caribe',1,'0.1M'],
    ['kna','São Cristóvão e Neves','🇰🇳','+12% cidadania por investimento','MERCANTILISTA','Caribe',1,'0.05M'],
    ['dma','Dominica','🇩🇲','+10% energia geotérmica insular','DIPLOMATA','Caribe',0.7,'0.07M'],
    ['cub','Cuba','🇨🇺','+15% biotecnologia e médicos','ISOLACIONISTA','Caribe',105,'11M'],

    // África (54)
    ['zaf','África do Sul','🇿🇦','+22% platina, cromo e ouro','ECONOMICO','África',400,'60M'],
    ['egy','Egito','🇪🇬','+25% Canal de Suez e têxteis','EXPANSIONISTA','África',390,'110M'],
    ['nga','Nigéria','🇳🇬','+22% petróleo Bonny Light e fintech','EXPANSIONISTA','África',375,'220M'],
    ['dza','Argélia','🇩🇿','+22% gás canalizado para a Europa','DEFENSIVO','África',240,'45M'],
    ['mar','Marrocos','🇲🇦','+30% maiores reservas de fosfato','MERCANTILISTA','África',150,'37M'],
    ['eth','Etiópia','🇪🇹','+18% Grande Represa do Renascimento','EXPANSIONISTA','África',160,'125M'],
    ['ken','Quênia','🇰🇪','+18% hub tech e logística do leste','TECNOCRATA','África',120,'54M'],
    ['ago','Angola','🇦🇴','+22% petróleo e diamantes','AGRESSIVO','África',95,'36M'],
    ['civ','Costa do Marfim','🇨🇮','+25% maior produtor mundial de cacau','ECONOMICO','África',80,'29M'],
    ['tza','Tanzânia','🇹🇿','+18% ouro e corredor de trânsito','ECONOMICO','África',85,'65M'],
    ['gha','Gana','🇬🇭','+18% ouro e cacau certificados','DIPLOMATA','África',76,'34M'],
    ['cod','Rep. Dem. do Congo','🇨🇩','+35% maiores reservas de cobalto','AGRESSIVO','África',68,'100M'],
    ['uga','Uganda','🇺🇬','+15% petróleo do Lago Albert','DEFENSIVO','África',50,'48M'],
    ['tun','Tunísia','🇹🇳','+14% componentes aeronáuticos','DIPLOMATA','África',50,'12M'],
    ['cmr','Camarões','🇨🇲','+12% madeira e hidrocarbonetos','DEFENSIVO','África',48,'28M'],
    ['zmb','Zâmbia','🇿🇲','+25% cinturão de cobre africano','ECONOMICO','África',28,'20M'],
    ['sen','Senegal','🇸🇳','+18% novos campos de gás e porto','DIPLOMATA','África',31,'17M'],
    ['zwe','Zimbábue','🇿🇼','+25% depósitos gigantes de lítio','ISOLACIONISTA','África',27,'16M'],
    ['gnq','Guiné Equatorial','🇬🇶','+20% hidrocarbonetos per capita','ISOLACIONISTA','África',12,'1.7M'],
    ['gin','Guiné','🇬🇳','+35% maiores reservas de bauxita','EXPANSIONISTA','África',23,'14M'],
    ['moz','Moçambique','🇲🇿','+25% megaprojetos de GNL offshore','ECONOMICO','África',21,'33M'],
    ['bwa','Botsuana','🇧🇼','+22% indústria de diamantes De Beers','DIPLOMATA','África',21,'2.6M'],
    ['gab','Gabão','🇬🇦','+20% manganês e petróleo leve','DEFENSIVO','África',21,'2.4M'],
    ['nam','Namíbia','🇳🇦','+22% urânio a céu aberto e diamantes','DIPLOMATA','África',13,'2.6M'],
    ['tcd','Chade','🇹🇩','+12% petróleo e gado','AGRESSIVO','África',13,'18M'],
    ['cog','República do Congo','🇨🇬','+15% bacia petrolífera marítima','DEFENSIVO','África',15,'6M'],
    ['mus','Maurício','🇲🇺','+20% praça financeira africana','MERCANTILISTA','África',14,'1.3M'],
    ['rwa','Ruanda','🇷🇼','+22% polo de tecnologia e governança','TECNOCRATA','África',14,'14M'],
    ['mdg','Madagascar','🇲🇬','+18% baunilha e níquel','ISOLACIONISTA','África',16,'30M'],
    ['mli','Mali','🇲🇱','+18% mineração de ouro e algodão','AGRESSIVO','África',21,'23M'],
    ['ner','Níger','🇳🇪','+25% jazidas estratégicas de urânio','AGRESSIVO','África',17,'26M'],
    ['bfa','Burquina Fasso','🇧🇫','+15% minas de ouro','AGRESSIVO','África',20,'23M'],
    ['sdn','Sudão','🇸🇩','+14% ouro e controle do Nilo','AGRESSIVO','África',25,'48M'],
    ['ssd','Sudão do Sul','🇸🇸','+20% campos de petróleo do Nilo','AGRESSIVO','África',5,'11M'],
    ['mwi','Malaui','🇲🇼','+10% tabaco e agricultura','DEFENSIVO','África',13,'20M'],
    ['ben','Benim','🇧🇯','+12% trânsito de algodão e porto','DIPLOMATA','África',20,'13M'],
    ['lbr','Libéria','🇱🇧','+25% maior bandeira de conveniência marítima','MERCANTILISTA','África',4.3,'5.3M'],
    ['sle','Serra Leoa','🇸🇱','+15% diamantes aluviais','DIPLOMATA','África',4.2,'8.8M'],
    ['som','Somália','🇸🇴','+18% maior litoral marítimo africano','AGRESSIVO','África',11,'18M'],
    ['mrt','Mauritânia','🇲🇷','+20% minério de ferro de Zouérat','DEFENSIVO','África',10,'4.8M'],
    ['eri','Eritreia','🇪🇷','+12% posição militar no Mar Vermelho','ISOLACIONISTA','África',2.5,'3.7M'],
    ['swz','Essuatíni','🇸🇿','+10% agroindústria de açúcar','ISOLACIONISTA','África',5,'1.2M'],
    ['lso','Lesoto','🇱🇸','+15% exportação de água para Gauteng','ISOLACIONISTA','África',2.5,'2.3M'],
    ['tgo','Togo','🇹🇬','+14% porto de águas profundas de Lomé','MERCANTILISTA','África',9,'9M'],
    ['caf','República Centro-Africana','🇨🇫','+14% madeira nobre e diamantes','AGRESSIVO','África',2.7,'5.5M'],
    ['lby','Líbia','🇱🇾','+25% petróleo leve de Sirte','AGRESSIVO','África',45,'7M'],
    ['dji','Djibuti','🇩🇯','+30% aluguel de bases navais globais','MERCANTILISTA','África',4,'1M'],
    ['gmb','Gâmbia','🇬🇲','+10% amendoim e rio navegável','DIPLOMATA','África',2.3,'2.7M'],
    ['gnb','Guiné-Bissau','🇬🇼','+12% castanha de caju','DIPLOMATA','África',2,'2.1M'],
    ['cpv','Cabo Verde','🇨🇻','+15% logística aérea atlântica','DIPLOMATA','África',2.6,'0.6M'],
    ['syc','Seicheles','🇸🇨','+15% zona econômica exclusiva marítima','DIPLOMATA','África',2,'0.1M'],
    ['com','Comores','🇰🇲','+10% baunilha e perfume ylang-ylang','DIPLOMATA','África',1.3,'0.9M'],
    ['stp','São Tomé e Príncipe','🇸🇹','+12% cacau fino e petróleo offshore','DIPLOMATA','África',0.6,'0.23M'],

    // Oceania (14)
    ['nzl','Nova Zelândia','🇳🇿','+20% laticínios e carne ovina','DIPLOMATA','Oceania',250,'5.2M'],
    ['png','Papua-Nova Guiné','🇵🇬','+22% ouro, cobre e gás natural','DEFENSIVO','Oceania',32,'10M'],
    ['fji','Fiji','🇫🇯','+14% hub do Pacífico Sul','DIPLOMATA','Oceania',5.5,'0.9M'],
    ['slb','Ilhas Salomão','🇸🇧','+12% madeira e pesca pelágica','DEFENSIVO','Oceania',1.6,'0.7M'],
    ['vut','Vanuatu','🇻🇺','+12% serviços marítimos offshore','DIPLOMATA','Oceania',1.1,'0.3M'],
    ['wsm','Samoa','🇼🇸','+10% agricultura tropical','DIPLOMATA','Oceania',0.9,'0.2M'],
    ['kir','Quiribáti','🇰🇮','+15% vasta zona marítima no equador','ISOLACIONISTA','Oceania',0.3,'0.13M'],
    ['fsm','Micronésia','🇫🇲','+12% pesca de atum do Pacífico','DEFENSIVO','Oceania',0.4,'0.11M'],
    ['ton','Tonga','🇹🇴','+10% agropecuária tradicional','ISOLACIONISTA','Oceania',0.5,'0.1M'],
    ['mhl','Ilhas Marshall','🇲🇭','+20% segundo maior registro de navios','MERCANTILISTA','Oceania',0.3,'0.04M'],
    ['plw','Palau','🇵🇼','+15% santuário marinho e turismo','DIPLOMATA','Oceania',0.3,'0.02M'],
    ['nru','Nauru','🇳🇷','+14% mineração submarina de nódulos','ISOLACIONISTA','Oceania',0.15,'0.01M'],
    ['tuv','Tuvalu','🇹🇻','+20% domínio .tv e licenças oceânicas','ISOLACIONISTA','Oceania',0.06,'0.01M']
  ];

  const processedOtherNations = OTHER_RAW_NATIONS.map(([id, name, flag, bonus, archetype, region, gdpNum, pop]) => {
    return {
      id,
      name,
      flag,
      bonus,
      archetype,
      region,
      power: Math.round(1500 + (Math.log10(Math.max(2, gdpNum)) * 800)),
      gdp: `$${gdpNum >= 1000 ? (gdpNum/1000).toFixed(1) + 'T' : gdpNum + 'B'}`,
      pop,
      alliance: 'neutral',
      ideology: 'misto'
    };
  });

  window.GAME_DATA.nations = [...KEY_NATIONS, ...processedOtherNations];

  // ══════════════════════════════════════════════════════════
  // 🔴 CORREÇÃO 5 — DEFESA & DISSUASÃO EXPANDIDA
  // ══════════════════════════════════════════════════════════
  window.GAME_DATA.defense = {
    forces: [
      { id: 'army',  name: 'Exército',       icon: '🪖', desc: 'Domínio terrestre, blindados pesados, artilharia e fuzileiros.' },
      { id: 'navy',  name: 'Marinha',        icon: '⚓', desc: 'Projeção naval de poder, submarinos nucleares e porta-aviões.' },
      { id: 'air',   name: 'Força Aérea',    icon: '✈️', desc: 'Superioridade aérea, caças furtivos 5G/6G e bombardeiros.' },
      { id: 'space', name: 'Força Espacial', icon: '🛰️', desc: 'Vigilância orbital, satélites espiões e armas de energia cinética.' },
      { id: 'cyber', name: 'Cibercomando',   icon: '💻', desc: 'Guerra eletrônica, proteção de infraestrutura crítica e IA tática.' }
    ],

    defconLevels: [
      { level: 5, name: 'DEFCON 5', title: 'Paz Normal', color: '#10B981', glow: 'rgba(16, 185, 129, 0.4)', desc: 'Prontidão ordinária de tempo de paz. Operações de treinamento rotineiras.' },
      { level: 4, name: 'DEFCON 4', title: 'Inteligência Elevada', color: '#3B82F6', glow: 'rgba(59, 130, 246, 0.4)', desc: 'Segurança intensificada nas fronteiras e aumento da coleta de inteligência.' },
      { level: 3, name: 'DEFCON 3', title: 'Mobilização Ativa', color: '#EAB308', glow: 'rgba(234, 179, 8, 0.4)', desc: 'Forças aéreas em prontidão para decolagem em 15 min. Tropas em alerta nos quartéis.' },
      { level: 2, name: 'DEFCON 2', title: 'Guerra Iminente', color: '#F97316', glow: 'rgba(249, 115, 22, 0.5)', desc: 'Forças armadas prontas para desdobramento de combate total em menos de 6 horas.' },
      { level: 1, name: 'DEFCON 1', title: 'Alerta Máximo Nuclear', color: '#EF4444', glow: 'rgba(239, 68, 68, 0.8)', desc: 'Ataque iminente ou em andamento. Todas as defesas e tríade nuclear engajadas!' }
    ],

    nuclearDeterrenceLevels: [
      { level: 1, name: 'Nenhum', icon: '🕊️', mult: 1.0, cost: 0, desc: 'Nenhum programa ou capacidade de retaliação em massa.' },
      { level: 2, name: 'Capacidade Latente', icon: '🧪', mult: 1.25, cost: 50000, desc: 'Centrífugas e material suficiente para montagem rápida em caso de ameaça existencial.' },
      { level: 3, name: 'Dissuasão Mínima', icon: '☢️', mult: 1.60, cost: 250000, desc: 'Arsenal atômico tático capaz de destruir os principais centros operacionais de um agressor.' },
      { level: 4, name: 'Segunda Resposta Garantida', icon: '🚀', mult: 2.20, cost: 1000000, desc: 'Tríade de submarinos nucleares furtivos garantindo retaliação catastrófica garantida.' },
      { level: 5, name: 'M.A.D. (Destruição Mútua)', icon: '💀', mult: 3.50, cost: 5000000, desc: 'Aniquilação total e automática de qualquer nação agressora. Dissuasão existencial suprema.' }
    ],

    // 40+ Tipos de Unidades no Arsenal
    units: [
      // Exército (8)
      { id:'u_inf_1', force:'army', name:'Infantaria Leve Mecanizada', icon:'🪖', cost:150, upkeep:2, power:15, desc:'Fuzileiros equipados com fuzis de assalto e visão térmica noturna.' },
      { id:'u_mbt_1', force:'army', name:'Tanque Principal MBT Leo-3', icon:'🛡️', cost:850, upkeep:12, power:95, desc:'Blindagem reativa composta e canhão eletrotérmico de 120mm.' },
      { id:'u_apc_1', force:'army', name:'Blindado de Transporte 8x8', icon:'🚐', cost:400, upkeep:5, power:40, desc:'Proteção contra minas terrestres (MRAP) e torre remota de 30mm.' },
      { id:'u_art_1', force:'army', name:'Artilharia Autopropulsada', icon:'💥', cost:950, upkeep:14, power:110, desc:'Obuseiro de 155mm com munição guiada por GPS de longo alcance.' },
      { id:'u_sam_1', force:'army', name:'Bateria Antiaérea Móvel', icon:'🎯', cost:1200, upkeep:18, power:140, desc:'Mísseis de intercepção de mísseis balísticos e caças furtivos.' },
      { id:'u_exo_1', force:'army', name:'Batalhão de Exoesqueletos', icon:'🦾', cost:2400, upkeep:35, power:280, desc:'Infantaria pesada com servomotores hidráulicos e armamento pesado.' },
      { id:'u_mlrs_1',force:'army', name:'Lança-Foguetes MLRS HIMARS', icon:'🚀', cost:1800, upkeep:25, power:210, desc:'Saturação tática de foguetes guiados de alta precisão.' },
      { id:'u_laser_1',force:'army',name:'Canhão Laser de Defesa Aérea', icon:'⚡', cost:4500, upkeep:60, power:520, desc:'Arma de energia dirigida destruindo enxames de drones em segundos.' },

      // Marinha (8)
      { id:'u_corv_1', force:'navy', name:'Corveta Litorânea Stealth', icon:'⛵', cost:1200, upkeep:15, power:130, desc:'Patrulha costeira com canhões rápidos e sonares de águas rasas.' },
      { id:'u_frig_1', force:'navy', name:'Fragata Multimissão Aegis', icon:'🚢', cost:2800, upkeep:38, power:320, desc:'Radar phased-array e lançadores verticais de mísseis antinavio.' },
      { id:'u_dest_1', force:'navy', name:'Contratorpedeiro Destroyer', icon:'🛥️', cost:5500, upkeep:75, power:640, desc:'Defesa de frota contra satélites e mísseis hipersônicos.' },
      { id:'u_sub_1',  force:'navy', name:'Submarino de Ataque Diesel-AIP', icon:'🦈', cost:3400, upkeep:45, power:410, desc:'Propulsão independente de ar operando em silêncio absoluto.' },
      { id:'u_ssbn_1', force:'navy', name:'Submarino Nuclear Balístico', icon:'🌊', cost:12000, upkeep:160, power:1450, desc:'Silos nucleares submarinos indetectáveis no fundo do oceano.' },
      { id:'u_cvn_1',  force:'navy', name:'Super Porta-Aviões Nuclear', icon:'⚓', cost:25000, upkeep:320, power:3200, desc:'Base aérea flutuante de 100 mil toneladas com catapulta eletromagnética.' },
      { id:'u_amph_1', force:'navy', name:'Navio de Assalto Anfíbio', icon:'⛴️', cost:4200, upkeep:55, power:480, desc:'Desembarque de tropas de fuzileiros e hovercrafts de assalto.' },
      { id:'u_uuv_1',  force:'navy', name:'Enxame UUV Drone Submarino', icon:'🤖', cost:2200, upkeep:30, power:260, desc:'Drones subaquáticos autônomos para minagem e escolta furtiva.' },

      // Força Aérea (8)
      { id:'u_f16_1',  force:'air', name:'Caça Multifunção 4.5G Viper', icon:'🛩️', cost:1600, upkeep:22, power:180, desc:'Aeronave veloz para interceptação e bombardeio de precisão.' },
      { id:'u_f35_1',  force:'air', name:'Caça Stealth 5ª Geração', icon:'✈️', cost:4200, upkeep:58, power:510, desc:'Invisível ao radar com fusão de sensores de teatro em tempo real.' },
      { id:'u_f22_1',  force:'air', name:'Supremacia Aérea 6ª Geração', icon:'🦅', cost:8500, upkeep:110, power:1050, desc:'Supercruzeiro hipersônico com canhões laser e escolta de drones.' },
      { id:'u_b2_1',   force:'air', name:'Bombardeiro Furtivo Asa Voadora', icon:'🦇', cost:14000, upkeep:190, power:1700, desc:'Penetra qualquer defesa aérea continental sem ser detectado.' },
      { id:'u_awacs_1',force:'air', name:'Avião Radar AWACS de Comando', icon:'📡', cost:3200, upkeep:44, power:390, desc:'Olhos no céu gerenciando batalhas aéreas a 500km de distância.' },
      { id:'u_drone_1',force:'air', name:'Drone de Ataque MQ-9 Reaper', icon:'🛸', cost:950, upkeep:12, power:115, desc:'Voo de 30 horas com mísseis Hellfire guiados a laser.' },
      { id:'u_swarm_1',force:'air', name:'Enxame de Drones Kamikaze IA', icon:'🐝', cost:1500, upkeep:18, power:190, desc:'Milhares de microdrones suicidas saturando radares inimigos.' },
      { id:'u_hyper_1',force:'air', name:'Míssil Planador Hipersônico', icon:'⚡', cost:6000, upkeep:80, power:780, desc:'Velocidade Mach 9 com trajetória imprevisível impossível de interceptar.' },

      // Força Espacial (8)
      { id:'u_sat_opt',force:'space', name:'Satélite de Reconhecimento Óptico', icon:'🛰️', cost:2500, upkeep:32, power:300, desc:'Resolução de 10cm do solo atualizada a cada 90 minutos.' },
      { id:'u_sat_com',force:'space', name:'Constelação Militar Criptografada', icon:'🌐', cost:3800, upkeep:48, power:460, desc:'Comunicações imunes a pulso eletromagnético (EMP).' },
      { id:'u_sat_ir', force:'space', name:'Satélite Alerta Precoce IR', icon:'🔴', cost:5200, upkeep:68, power:630, desc:'Detecta assinaturas térmicas de lançamentos balísticos mundiais.' },
      { id:'u_sat_asat',force:'space', name:'Interceptor Cinético Anti-Satélite', icon:'☄️', cost:4800, upkeep:62, power:580, desc:'Projétil de impacto direto desativando satélites adversários.' },
      { id:'u_rod_god',force:'space', name:'Plataforma Orbital Vara de Deus', icon:'🪐', cost:18000, upkeep:240, power:2250, desc:'Barras de tungstênio lançadas da órbita com poder de ogiva tática sem radiação.' },
      { id:'u_sp_base',force:'space', name:'Estação Militar Orbital Blindada', icon:'🛸', cost:22000, upkeep:300, power:2800, desc:'Quartel-general espacial controlando o tráfego cislunar.' },
      { id:'u_dew_sat',force:'space', name:'Satélite Laser Espelho Refrator', icon:'✨', cost:9500, upkeep:125, power:1200, desc:'Redireciona lasers terrestres para qualquer ponto do globo instantaneamente.' },
      { id:'u_debr_net',force:'space',name:'Rede de Varredura e Bloqueio', icon:'🕸️', cost:3500, upkeep:45, power:420, desc:'Blindagem da órbita baixa contra fragmentos e satélites espiões.' },

      // Cibercomando (8)
      { id:'u_cyb_fire',force:'cyber', name:'Muralha Quântica Soberana', icon:'🛡️', cost:1800, upkeep:22, power:220, desc:'Criptografia baseada em reticulados imune a supercomputadores.' },
      { id:'u_cyb_bot', force:'cyber', name:'Botnet Global Mirai Militar', icon:'🕷️', cost:2400, upkeep:30, power:290, desc:'Milhões de nós zumbis para derrubar infraestrutura elétrica adversária.' },
      { id:'u_cyb_stux',force:'cyber', name:'Worm de Sabotagem SCADA 0-Day', icon:'🐛', cost:4500, upkeep:58, power:560, desc:'Sobrecarga e destruição física de centrífugas e geradores.' },
      { id:'u_cyb_ai',  force:'cyber', name:'IA Tática de Batalha Cibernética', icon:'🤖', cost:6200, upkeep:82, power:780, desc:'Respostas autônomas a ataques em microssegundos.' },
      { id:'u_cyb_emp', force:'cyber', name:'Dispositivo EMP Não-Nuclear', icon:'⚡', cost:3900, upkeep:50, power:490, desc:'Apagão total de redes e eletrônicos em raio de 10km.' },
      { id:'u_cyb_ech', force:'cyber', name:'Rede Global de Interceptação', icon:'🎧', cost:5100, upkeep:65, power:640, desc:'Quebra de cabos submarinos e análise semântica por IA.' },
      { id:'u_cyb_kill',force:'cyber', name:'Protocolo de Desconexão Soberana', icon:'🔌', cost:7500, upkeep:95, power:950, desc:'Isolamento da internet nacional funcionando em intranet impenetrável.' },
      { id:'u_cyb_qnt', force:'cyber', name:'Processador Quântico Criptoanalítico', icon:'🔮', cost:16000, upkeep:210, power:2100, desc:'Capacidade de quebrar qualquer chave RSA clássica em minutos.' }
    ],

    // 12 Instalações Militares Específicas
    militaryBases: [
      { id:'b_c4isr',   name:'Centro de Comando Estratégico C4ISR', icon:'🏢', cost:5000, bonus:'+20% eficácia de todas as forças', desc:'Bunker hiperprotegido com comando centralizado de teatro de guerra.' },
      { id:'b_air_base',name:'Base Aérea Fortificada Subterrânea', icon:'🛫', cost:8000, bonus:'+25% capacidade da Força Aérea', desc:'Hangares escavados sob montanhas para suportar bombardeios pesados.' },
      { id:'b_nav_base',name:'Base Naval de Águas Profundas',      icon:'⚓', cost:10000, bonus:'+25% capacidade da Marinha', desc:'Docas e oficinas com guindastes de 500 toneladas e ancoradouros.' },
      { id:'b_icbm',    name:'Silos Blindados de Mísseis ICBM',     icon:'🚀', cost:15000, bonus:'+40% poder de retaliação nuclear', desc:'Poços verticais reforçados com concreto de alta densidade.' },
      { id:'b_radar',   name:'Radar de Alerta OTH Sobre-Horizonte', icon:'📡', cost:6000, bonus:'Alerta antecipado de ataques em 20 min', desc:'Varredura da ionosfera para rastrear ameaças a 4.000km.' },
      { id:'b_cyber',   name:'Bunker Subterrâneo do Cibercomando',  icon:'💻', cost:7500, bonus:'+30% ataque e defesa digital', desc:'Instalação imune a interceptações e gaiola de Faraday militar.' },
      { id:'b_tank_fac',name:'Complexo Fabril de Blindados MBT',    icon:'🏭', cost:9000, bonus:'-25% tempo e custo de veículos', desc:'Linhas robotizadas de solda de blindagem e montagem de canhões.' },
      { id:'b_spaceport',name:'Espaçoporto Militar Tático',         icon:'🪐', cost:18000, bonus:'Capacidade de lançar satélites sob demanda', desc:'Plataforma para foguetes de resposta rápida em caso de guerra espacial.' },
      { id:'b_spec_ops',name:'Centro de Forças Especiais Ghost',    icon:'🥷', cost:6500, bonus:'+35% sucesso em operações secretas', desc:'Treinamento para sabotagem, resgate de inteligência e ação direta.' },
      { id:'b_sub_dock',name:'Doca Seca de Submarinos Nucleares',   icon:'🦈', cost:14000, bonus:'+30% prontidão de submarinos balísticos', desc:'Infraestrutura para troca de combustível nuclear e manutenção de cascos.' },
      { id:'b_s500',    name:'Complexo Anti-Míssil Domo Soberano',  icon:'🛡️', cost:12500, bonus:'Intercepta até 80% dos ataques balísticos', desc:'Baterias de mísseis hipersônicos de defesa de alta altitude.' },
      { id:'b_darpa',   name:'Laboratório Secreto de Armas Avançadas',icon:'🔬', cost:20000, bonus:'Desbloqueia armas protótipo de 6ª geração', desc:'Engenharia reversa e desenvolvimento de armamento de última fronteira.' }
    ],

    // 8 Operações Militares
    militaryOperations: [
      { id:'op_rec',   name:'Reconhecimento de Teatro', icon:'🔍', time:60,  risk:'Baixo', reward:'Descobre defesas e força do alvo', cost:500 },
      { id:'op_siege', name:'Cerco Tático Terrestre',    icon:'🧱', time:180, risk:'Médio', reward:'Corta suprimentos e enfraquece o PIB', cost:2500 },
      { id:'op_block', name:'Bloqueio Naval de Rotas',  icon:'⚓', time:240, risk:'Médio', reward:'Interrompe comércio internacional de commodities', cost:4000 },
      { id:'op_strike',name:'Ataque Cirúrgico Furtivo', icon:'🎯', time:90,  risk:'Alto',  reward:'Destrói instalações militares estratégicas', cost:6000 },
      { id:'op_ew',    name:'Guerra Eletrônica & Apagão',icon:'⚡', time:120, risk:'Médio', reward:'Desativa defesas antiaéreas e radares', cost:3500 },
      { id:'op_cyber', name:'Infiltração Cibernética',  icon:'💻', time:150, risk:'Baixo', reward:'Rouba reservas cambiais e P&D', cost:4500 },
      { id:'op_deter', name:'Dissuasão de Força Total', icon:'☢️', time:300, risk:'Alto',  reward:'Força o adversário a recuar e assinar trégua', cost:10000 },
      { id:'op_invade',name:'Invasão Territorial de Zona',icon:'⚔️',time:600, risk:'Crítico',reward:'Anexa concessões industriais e dobra influência', cost:25000 }
    ]
  };

  // ══════════════════════════════════════════════════════════
  // 🔴 CORREÇÃO 6 — ÁRVORE TECNOLÓGICA EXPANSÍVEL (8 RAMOS, 5 ERAS)
  // ══════════════════════════════════════════════════════════
  window.GAME_DATA.techTree = {
    branches: [
      { id:'militar',    name:'Militar',     icon:'⚔️', color:'#EF4444', desc:'Doutrina bélica, arsenal moderno e defesa territorial.' },
      { id:'economico',  name:'Econômico',   icon:'💰', color:'#F59E0B', desc:'Finanças soberanas, comércio, tributação e bancos centrais.' },
      { id:'cientifico', name:'Científico',  icon:'🔬', color:'#3B82F6', desc:'P&D fundamental, novos materiais e laboratórios nacionais.' },
      { id:'diplomatico',name:'Diplomático', icon:'🤝', color:'#10B981', desc:'Alianças globais, tratados multilaterais e soft power.' },
      { id:'social',     name:'Social',      icon:'🏛️', color:'#8B5CF6', desc:'Bem-estar da população, educação, saúde e estabilidade política.' },
      { id:'espacial',   name:'Espacial',    icon:'🚀', color:'#6366F1', desc:'Propulsão orbital, constelações de satélites e estações.' },
      { id:'cibernetico',name:'Cibernético', icon:'💻', color:'#06B6D4', desc:'Computação quântica, IA autônoma e telecomunicações.' },
      { id:'energetico', name:'Energético',  icon:'⚡', color:'#EC4899', desc:'Matriz de base, renováveis limpas e reatores de fusão.' }
    ],

    eras: [
      { id:1, name:'Fundação',    sub:'Stone / Básico',   icon:'🌱', reqLevel:0  },
      { id:2, name:'Manufatura',  sub:'Vapor / Mecânico', icon:'⚙️', reqLevel:10 },
      { id:3, name:'Industrial',  sub:'Atômica / Fóssil', icon:'🏭', reqLevel:25 },
      { id:4, name:'Digital',     sub:'Informação / Chips',icon:'🌐',reqLevel:50 },
      { id:5, name:'Orbital',     sub:'Quântica / Futuro',icon:'🪐', reqLevel:100}
    ],

    // Exemplos de tecnologias estruturadas por ramo/era
    techs: [
      // Militar
      { id:'mil_1', branch:'militar', era:1, name:'Doutrina de Guarda Nacional', cost:25, time:15, prereqs:[], effect:'+15% defesa territorial', icon:'🛡️' },
      { id:'mil_2', branch:'militar', era:2, name:'Artilharia Estriada e Blindagem', cost:250, time:45, prereqs:['mil_1'], effect:'Desbloqueia canhões e veículos blindados', icon:'💥' },
      { id:'mil_3', branch:'militar', era:3, name:'Doutrina de Armas Combinadas', cost:2500, time:120, prereqs:['mil_2'], effect:'+30% poder de combate em todas as forças', icon:'⚔️' },
      { id:'mil_4', branch:'militar', era:4, name:'Guerra Centrada em Redes & Stealth', cost:15000, time:300, prereqs:['mil_3'], effect:'Invisibilidade ao radar e ataques cirúrgicos', icon:'🦇' },
      { id:'mil_5', branch:'militar', era:5, name:'Armamento Cinético e Hipersônico', cost:100000, time:600, prereqs:['mil_4'], effect:'Mísseis Mach 9 e supremacia militar orbital', icon:'⚡' },

      // Econômico
      { id:'eco_1', branch:'economico', era:1, name:'Padronização Monetária Soberana', cost:20, time:12, prereqs:[], effect:'+10% receita manual por toque', icon:'🪙' },
      { id:'eco_2', branch:'economico', era:2, name:'Banco Central e Crédito Produtivo', cost:200, time:40, prereqs:['eco_1'], effect:'+20% produção de todas as instalações', icon:'🏦' },
      { id:'eco_3', branch:'economico', era:3, name:'Mercado Integrado de Capitais', cost:2200, time:110, prereqs:['eco_2'], effect:'Rendimento automático de títulos soberanos', icon:'📈' },
      { id:'eco_4', branch:'economico', era:4, name:'Liquidação Instantânea em Tempo Real', cost:14000, time:280, prereqs:['eco_3'], effect:'+40% velocidade de transações e PIB', icon:'💳' },
      { id:'eco_5', branch:'economico', era:5, name:'A Doutrina do Dólar Global', cost:95000, time:550, prereqs:['eco_4'], effect:'Moeda torna-se reserva padrão do planeta (+150% PIB)', icon:'💵' },

      // Científico
      { id:'sci_1', branch:'cientifico', era:1, name:'Método Científico e Laboratórios', cost:30, time:20, prereqs:[], effect:'+15% velocidade de todas as pesquisas', icon:'🔬' },
      { id:'sci_2', branch:'cientifico', era:2, name:'Termodinâmica e Química Industrial', cost:300, time:50, prereqs:['sci_1'], effect:'Desbloqueia refino de fertilizantes e polímeros', icon:'⚗️' },
      { id:'sci_3', branch:'cientifico', era:3, name:'Física Nuclear e Semicondutores', cost:3200, time:140, prereqs:['sci_2'], effect:'Desbloqueia energia atômica e chips básicos', icon:'⚛️' },
      { id:'sci_4', branch:'cientifico', era:4, name:'Nanotecnologia e Genômica', cost:18000, time:320, prereqs:['sci_3'], effect:'+50% eficiência na extração de terras raras', icon:'🧬' },
      { id:'sci_5', branch:'cientifico', era:5, name:'Manipulação Subatômica de Matéria', cost:120000, time:700, prereqs:['sci_4'], effect:'Geração ilimitada de recursos raros em reatores', icon:'🔮' },

      // Cibernético
      { id:'cyb_1', branch:'cibernetico', era:1, name:'Telegrafia e Código Numérico', cost:25, time:15, prereqs:[], effect:'Reduz tempo de comunicação nacional', icon:'📠' },
      { id:'cyb_2', branch:'cibernetico', era:2, name:'Automação Eletromecânica', cost:240, time:45, prereqs:['cyb_1'], effect:'+15% produção de manufatura', icon:'⚙️' },
      { id:'cyb_3', branch:'cibernetico', era:3, name:'Mainframes e Redes Militares', cost:2800, time:130, prereqs:['cyb_2'], effect:'Desbloqueia Cibercomando defensivo', icon:'🖥️' },
      { id:'cyb_4', branch:'cibernetico', era:4, name:'Inteligência Artificial Soberana', cost:20000, time:350, prereqs:['cyb_3'], effect:'+50% ganho de toques automáticos via IA', icon:'🤖' },
      { id:'cyb_5', branch:'cibernetico', era:5, name:'Consciência Sintética Quântica', cost:150000, time:800, prereqs:['cyb_4'], effect:'Automação total da economia nacional', icon:'🧠' },

      // Energético
      { id:'nrg_1', branch:'energetico', era:1, name:'Moagem Hidráulica e Térmica', cost:20, time:12, prereqs:[], effect:'+10% fornecimento elétrico inicial', icon:'💧' },
      { id:'nrg_2', branch:'energetico', era:2, name:'Rede Elétrica em Corrente Alternada', cost:220, time:40, prereqs:['nrg_1'], effect:'Interconecta fábricas e reduz custo industrial', icon:'⚡' },
      { id:'nrg_3', branch:'energetico', era:3, name:'Fissão Nuclear Civil Avançada', cost:2600, time:120, prereqs:['nrg_2'], effect:'Energia limpa em massa com zero poluição fóssil', icon:'☢️' },
      { id:'nrg_4', branch:'energetico', era:4, name:'Matriz Renovável Inteligente (Smart Grid)', cost:16000, time:300, prereqs:['nrg_3'], effect:'+60% eficiência energética de todo o território', icon:'☀️' },
      { id:'nrg_5', branch:'energetico', era:5, name:'Confinamento Magnético de Fusão (Tokamak)', cost:110000, time:650, prereqs:['nrg_4'], effect:'Energia inesgotável e barata para toda a civilização', icon:'⚛️' },

      // Espacial
      { id:'spc_1', branch:'espacial', era:1, name:'Astronomia de Precisão e Óptica', cost:25, time:15, prereqs:[], effect:'+10% precisão na navegação mercante', icon:'🔭' },
      { id:'spc_2', branch:'espacial', era:2, name:'Foguetes Químicos Suborbitais', cost:280, time:48, prereqs:['spc_1'], effect:'Capacidade inicial de exploração atmosférica', icon:'🚀' },
      { id:'spc_3', branch:'espacial', era:3, name:'Satélites em Órbita Terrestre Baixa', cost:3000, time:135, prereqs:['spc_2'], effect:'Desbloqueia Força Espacial e radar global', icon:'🛰️' },
      { id:'spc_4', branch:'espacial', era:4, name:'Estações Espaciais e Lançamentos Reutilizáveis', cost:19000, time:330, prereqs:['spc_3'], effect:'-50% custo de satélites e novos ativos orbitais', icon:'🛸' },
      { id:'spc_5', branch:'espacial', era:5, name:'Mineração de Asteroides e Elevador Espacial', cost:130000, time:750, prereqs:['spc_4'], effect:'Extração maciça de platina, ouro e níquel do espaço', icon:'🪐' },

      // Diplomático
      { id:'dip_1', branch:'diplomatico', era:1, name:'Chancelaria e Imunidade Consular', cost:20, time:12, prereqs:[], effect:'+15% relações iniciais com nações vizinhas', icon:'📜' },
      { id:'dip_2', branch:'diplomatico', era:2, name:'Tratados de Comércio Mais Favorecido', cost:210, time:38, prereqs:['dip_1'], effect:'+20% lucro em vendas no mercado de commodities', icon:'🤝' },
      { id:'dip_3', branch:'diplomatico', era:3, name:'Blocos Econômicos Multilaterais', cost:2400, time:115, prereqs:['dip_2'], effect:'Pode fundar ou liderar blocos geopolíticos', icon:'🌐' },
      { id:'dip_4', branch:'diplomatico', era:4, name:'Soft Power & Hegemonia Cultural', cost:15000, time:290, prereqs:['dip_3'], effect:'+40% influência diplomática passiva por hora', icon:'🎭' },
      { id:'dip_5', branch:'diplomatico', era:5, name:'Conselho de Governança Planetária', cost:105000, time:600, prereqs:['dip_4'], effect:'Direito a veto sobre sanções e guerras globais', icon:'👑' },

      // Social
      { id:'soc_1', branch:'social', era:1, name:'Saneamento Básico e Cadastro Cívico', cost:20, time:12, prereqs:[], effect:'+15% crescimento populacional', icon:'🚰' },
      { id:'soc_2', branch:'social', era:2, name:'Educação Técnica Universal', cost:230, time:42, prereqs:['soc_1'], effect:'+20% produtividade de trabalhadores nas fábricas', icon:'🎓' },
      { id:'soc_3', branch:'social', era:3, name:'Seguridade Social e SUS Soberano', cost:2500, time:125, prereqs:['soc_2'], effect:'+30% estabilidade nacional contra crises', icon:'🏥' },
      { id:'soc_4', branch:'social', era:4, name:'Cidades Inteligentes e Autonomia Cidadã', cost:17000, time:310, prereqs:['soc_3'], effect:'-50% poluição urbana e +20% felicidade', icon:'🏙️' },
      { id:'soc_5', branch:'social', era:5, name:'Pós-Escassez e Renda Universal Soberana', cost:115000, time:680, prereqs:['soc_4'], effect:'Estabilidade travada em 100% permanente', icon:'🕊️' }
    ],

    eurekaEvents: [
      { id:'euk_lithium',  name:'Descoberta de Salar Rico em Lítio', branch:'cientifico', boost:'Avança pesquisa de baterias em 50%', chance:0.15 },
      { id:'euk_chip',     name:'Avanço Inesperado em Litografia UV', branch:'cibernetico', boost:'Acelera semicondutores em 60%', chance:0.12 },
      { id:'euk_fusion',   name:'Confinamento de Plasma Estável por 10s', branch:'energetico', boost:'Reduz custo de fusão em 40%', chance:0.08 },
      { id:'euk_trade',    name:'Demanda Súbita de Parceiro Comercial', branch:'diplomatico', boost:'+100% influência diplomática', chance:0.20 },
      { id:'euk_stealth',  name:'Teste Bem-Sucedido de Metamaterial', branch:'militar', boost:'Desbloqueia camuflagem de caças', chance:0.10 }
    ]
  };

  window.GAME_DATA.hegemonyUpgrades = [
    {
      id: 'doctrine',
      name: 'Doutrina Imperial',
      icon: '👑',
      desc: '+50% na produção e PIB de todas as indústrias por nível',
      baseCost: 2,
      costMult: 1.8,
      maxLevel: 25,
      effectFmt: (lvl) => `+${lvl * 50}% PIB Global`
    },
    {
      id: 'midas',
      name: 'Toque de Midas Soberano',
      icon: '🖐️',
      desc: '+100% no rendimento de cada toque no Núcleo por nível',
      baseCost: 1,
      costMult: 1.5,
      maxLevel: 50,
      effectFmt: (lvl) => `+${lvl * 100}% Ganho por Toque`
    },
    {
      id: 'industry',
      name: 'Complexo Otimizado',
      icon: '⚙️',
      desc: '-15% no custo de compra e upgrade de todas as instalações',
      baseCost: 3,
      costMult: 2.0,
      maxLevel: 5,
      effectFmt: (lvl) => `-${lvl * 15}% Custo de Obras`
    },
    {
      id: 'fund',
      name: 'Fundo Soberano Perpétuo',
      icon: '🏦',
      desc: '+$10.000/h de renda passiva incondicional por nível',
      baseCost: 2,
      costMult: 1.6,
      maxLevel: 30,
      effectFmt: (lvl) => `+$${(lvl * 10000).toLocaleString('pt-BR')}/h Renda Fixa`
    },
    {
      id: 'military',
      name: 'Supremacia Bélica',
      icon: '🛡️',
      desc: '+30% em Dissuasão Nuclear e Força Militar de combate',
      baseCost: 2,
      costMult: 1.7,
      maxLevel: 20,
      effectFmt: (lvl) => `+${lvl * 30}% Força de Dissuasão`
    },
    {
      id: 'science',
      name: 'Aceleração Quântica',
      icon: '🔬',
      desc: '-20% no tempo de todas as pesquisas científicas',
      baseCost: 3,
      costMult: 2.2,
      maxLevel: 4,
      effectFmt: (lvl) => `-${lvl * 20}% Tempo de Pesquisa`
    },
    {
      id: 'market',
      name: 'Hegemonia Cambial',
      icon: '📈',
      desc: '+20% na margem de lucro na venda de todas commodities',
      baseCost: 2,
      costMult: 1.8,
      maxLevel: 20,
      effectFmt: (lvl) => `+${lvl * 20}% Lucro em Commodities`
    },
    {
      id: 'goldStart',
      name: 'Largada Dourada',
      icon: '💰',
      desc: 'Inicia cada novo ciclo de reset com +$100.000 no Tesouro',
      baseCost: 1,
      costMult: 1.5,
      maxLevel: 20,
      effectFmt: (lvl) => `+$${(lvl * 100000).toLocaleString('pt-BR')} Inicial`
    }
  ];

  // ══════════════════════════════════════════════════════════
  // 🏛️ INSTITUIÇÕES & GOVERNANÇA EXPANDIDA
  // ══════════════════════════════════════════════════════════

  // 1. Gabinete de Ministros Expandido (6 Ministros com Projetos)
  window.GAME_DATA.ministersExpanded = [
    {
      id: 'min_eco',
      name: 'Min. da Fazenda & Economia',
      icon: '📈',
      effect: '+5% PIB/nível e -2% custo de compra',
      bio: 'Lidera a política fiscal, arrecadação e atração de investimentos soberanos.',
      project: {
        id: 'proj_eco',
        name: 'Auditoria Fiscal Soberana',
        icon: '📊',
        duration: 90, // 90 segundos
        cost: 300,
        rewardCashMult: 15, // 15x gdpPerHour ou min $1.000
        desc: 'Identifica e recupera tributos sonegados, gerando injeção expressa de liquidez.'
      }
    },
    {
      id: 'min_def',
      name: 'Min. da Defesa & Forças Armadas',
      icon: '🛡️',
      effect: '+8% Poder Militar/nível e +5% sucesso em operações',
      bio: 'Arquiteto da dissuasão nuclear e modernização tática do teatro militar.',
      project: {
        id: 'proj_def',
        name: 'Operação Fronteira Blindada',
        icon: '🪖',
        duration: 120,
        cost: 600,
        rewardCashMult: 10,
        rewardStability: 8,
        desc: 'Manobra militar integrada para repelir incursões e estabilizar províncias.'
      }
    },
    {
      id: 'min_tech',
      name: 'Min. de Ciência & Inovação',
      icon: '🔬',
      effect: '-10% tempo de pesquisa/nível e patentes aceleradas',
      bio: 'Conduz o desenvolvimento de IA quântica, fusão nuclear e semicondutores.',
      project: {
        id: 'proj_tech',
        name: 'Hackathon Tecnológico Soberano',
        icon: '💻',
        duration: 90,
        cost: 450,
        rewardTechSeconds: 60,
        rewardXp: 150,
        desc: 'Mobiliza cientistas nacionais para conceder avanço instantâneo na pesquisa ativa.'
      }
    },
    {
      id: 'min_agro',
      name: 'Min. da Agricultura & Alimentos',
      icon: '🌾',
      effect: '+10% produção de agro-commodities e -5% poluição',
      bio: 'Garante o abastecimento alimentar da população e superávit na balança comercial.',
      project: {
        id: 'proj_agro',
        name: 'Safra Estratégica Recorde',
        icon: '🚜',
        duration: 90,
        cost: 350,
        rewardCommodity: 'food',
        rewardApproval: 5,
        desc: 'Escoa estoques agrícolas, aumentando a aprovação popular e estoques de comida.'
      }
    },
    {
      id: 'min_ext',
      name: 'Min. das Relações Exteriores',
      icon: '🌍',
      effect: '+15% Influência Global/nível e +8% lucro no comércio',
      bio: 'Comanda o corpo diplomático nas capitais estrangeiras e fóruns multilaterais.',
      project: {
        id: 'proj_ext',
        name: 'Cúpula Bilateral de Emergência',
        icon: '🤝',
        duration: 120,
        cost: 800,
        rewardInfluence: 20,
        rewardCashMult: 12,
        desc: 'Negocia acordos comerciais bilaterais de curto prazo com superpotências aliadas.'
      }
    },
    {
      id: 'min_saude',
      name: 'Min. da Saúde & Cidadania',
      icon: '🏥',
      effect: '+15% velocidade de cura hospitalar e -12% óbitos',
      bio: 'Coordena o SUS soberano, ampliação de leitos e respostas a crises epidemiológicas.',
      project: {
        id: 'proj_saude',
        name: 'Mutirão Nacional de Saúde & Cura',
        icon: '💉',
        duration: 90,
        cost: 400,
        rewardHeal: 40,
        rewardStability: 6,
        desc: 'Disponibiliza leitos de retaguarda e cura imediatamente dezenas de enfermos.'
      }
    }
  ];

  // 2. Agências Reguladoras do Estado
  window.GAME_DATA.regulatoryAgencies = [
    {
      id: 'bacen',
      name: 'Banco Central Soberano (BACEN)',
      acronym: 'BACEN',
      icon: '🏛️',
      color: '#F59E0B',
      desc: 'Autoridade monetária máxima. Regula a taxa básica Selic, combate a inflação e emite títulos soberanos.',
      baseCost: 2000,
      costMult: 2.1,
      maxLevel: 10,
      effectDesc: '+4% rendimento de juros do Tesouro e +5% PIB/nível',
      action: {
        id: 'act_bacen',
        name: 'Emissão de Títulos da Dívida',
        icon: '💵',
        cd: 120, // cooldown 120s
        desc: 'Captação extraordinária de liquidez nos mercados primários.',
        rewardCashMult: 20 // 20 min de PIB
      }
    },
    {
      id: 'aeb',
      name: 'Agência Espacial Nacional (AEB)',
      acronym: 'AEB',
      icon: '🚀',
      color: '#6366F1',
      desc: 'Comanda os espaçoportos, lançamentos de satélites de observação e monitoramento orbital.',
      baseCost: 5000,
      costMult: 2.3,
      maxLevel: 10,
      effectDesc: '+6% velocidade de P&D e +20 Dissuasão Orbital/nível',
      action: {
        id: 'act_aeb',
        name: 'Lançar Satélite de Observação',
        icon: '🛰️',
        cd: 150,
        desc: 'Posiciona satélite de inteligência, gerando +15% de PIB por 3 minutos.',
        duration: 180,
        gdpBuff: 0.15
      }
    },
    {
      id: 'abin',
      name: 'Agência de Inteligência Soberana (ABIN)',
      acronym: 'ABIN',
      icon: '🕵️',
      color: '#EF4444',
      desc: 'Inteligência estratégica de Estado, contrainteligência cibernética e detecção de sabotagens.',
      baseCost: 3500,
      costMult: 2.2,
      maxLevel: 10,
      effectDesc: '-15% risco de crises e +12% defesa nacional/nível',
      action: {
        id: 'act_abin',
        name: 'Operação Cavalo de Troia',
        icon: '💻',
        cd: 140,
        desc: 'Infiltra servidores estrangeiros para recuperar ativos e inteligência tática.',
        rewardCashFlat: 5000,
        rewardInfluence: 15
      }
    },
    {
      id: 'anvisa',
      name: 'Agência de Vigilância Sanitária (ANVISA)',
      acronym: 'ANVISA',
      icon: '🧪',
      color: '#10B981',
      desc: 'Fiscalização de biossegurança de indústrias, controle de patógenos e aprovação de vacinas.',
      baseCost: 2500,
      costMult: 2.1,
      maxLevel: 10,
      effectDesc: '+30 leitos hospitalares e -12% risco de surtos/nível',
      action: {
        id: 'act_anvisa',
        name: 'Protocolo de Biossegurança Imediata',
        icon: '🛡️',
        cd: 120,
        desc: 'Esterilização e normas rígidas que curam 30 internados e previnem contaminações.',
        rewardHeal: 30,
        rewardStability: 5
      }
    },
    {
      id: 'anp',
      name: 'Agência Nacional do Petróleo & Energia (ANP)',
      acronym: 'ANP',
      icon: '⚡',
      color: '#EC4899',
      desc: 'Gestão de reservas estratégicas de petróleo, termoelétricas e transição energética renovável.',
      baseCost: 4000,
      costMult: 2.2,
      maxLevel: 10,
      effectDesc: '+8% produção de fábricas pesadas e -6% poluição/nível',
      action: {
        id: 'act_anp',
        name: 'Liberação de Reservas Estratégicas',
        icon: '🛢️',
        cd: 160,
        desc: 'Injeta combustíveis no parque fabril, concedendo +25% de produção por 2 minutos.',
        duration: 120,
        gdpBuff: 0.25
      }
    }
  ];

  // 3. Decretos Executivos & Reformas Presidenciais
  window.GAME_DATA.executiveDecrees = [
    {
      id: 'dec_guerra_eco',
      name: 'Decreto nº 101 — Mobilização Econômica de Guerra',
      icon: '⚔️',
      category: 'Economia',
      desc: 'Converte a capacidade fabril civil e ociosa em produção acelerada de alta intensidade.',
      pros: '+30% PIB/hora',
      cons: '-10% Estabilidade e +15% Poluição',
      costCash: 1000,
      costStability: 10,
      buffGdp: 0.30,
      penaltyPol: 15,
      penaltyStab: -10
    },
    {
      id: 'dec_fomento_tech',
      name: 'Decreto nº 102 — Marco Legal da Inovação & P&D',
      icon: '🔬',
      category: 'Ciência',
      desc: 'Concede isenção fiscal integral e incentivos a laboratórios de tecnologia e semicondutores.',
      pros: '+40% Velocidade de Pesquisa Tecnológica',
      cons: 'Custo orçamentário contínuo de $250/h',
      costCash: 2000,
      costStability: 0,
      buffResearchSpeed: 0.40,
      upkeepPerHour: 250
    },
    {
      id: 'dec_pacto_verde',
      name: 'Decreto nº 103 — Pacto Verde & Descarbonização',
      icon: '🌿',
      category: 'Meio Ambiente',
      desc: 'Instalação mandatória de filtros antipoluição e transição forçada para renováveis.',
      pros: '-50% Geração de Poluição e +15% Aprovação Popular',
      cons: '-8% Margem das indústrias pesadas',
      costCash: 1500,
      costStability: 5,
      buffPollutionReduction: 0.50,
      buffApproval: 15,
      penaltyGdp: -0.08
    },
    {
      id: 'dec_fronteira_segura',
      name: 'Decreto nº 104 — Regime de Soberania de Fronteiras',
      icon: '🛂',
      category: 'Soberania',
      desc: 'Controle biométrico estrito na entrada de imigrantes para equilibrar o mercado de trabalho.',
      pros: '+15% Estabilidade e reduz desemprego desordenado',
      cons: '-10% Influência Internacional',
      costCash: 1200,
      costStability: 0,
      buffStability: 15,
      penaltyInfluence: -10
    },
    {
      id: 'dec_reforma_trabalho',
      name: 'Decreto nº 105 — Flexibilização do Trabalho Soberano',
      icon: '💼',
      category: 'Trabalho',
      desc: 'Desonera a folha de pagamento fabril e incentiva contratações em turnos contínuos.',
      pros: '+20% Criação de Vagas e +8% PIB',
      cons: '-8% Aprovação Popular',
      costCash: 800,
      costStability: 5,
      buffJobsMult: 1.20,
      buffGdp: 0.08,
      penaltyApproval: -8
    },
    {
      id: 'dec_emergencia_saude',
      name: 'Decreto nº 106 — Estado de Emergência Sanitária',
      icon: '🏥',
      category: 'Saúde',
      desc: 'Convocação emergencial de profissionais de saúde e requisição de leitos adicionais.',
      pros: '+80 Leitos Hospitalares e cura +40% mais rápida',
      cons: 'Custo de custeio de $300/h',
      costCash: 1000,
      costStability: 5,
      buffHospitalBeds: 80,
      buffHealRate: 0.40,
      upkeepPerHour: 300
    },
    {
      id: 'dec_livre_comercio',
      name: 'Decreto nº 107 — Desregulamentação & Livre Comércio',
      icon: '📈',
      category: 'Mercado',
      desc: 'Abertura total de portos e redução de tarifas de exportação de commodities.',
      pros: '+20% Lucro em Commodities e +10% PIB',
      cons: '+20% Poluição',
      costCash: 2500,
      costStability: 5,
      buffCommodityProfit: 0.20,
      buffGdp: 0.10,
      penaltyPol: 20
    },
    {
      id: 'dec_seguranca_total',
      name: 'Decreto nº 108 — Prontidão de Defesa & Dissuasão',
      icon: '🛡️',
      category: 'Defesa',
      desc: 'Mobilização preventiva de baterias de mísseis, patrulhas aéreas e ciberdefesa.',
      pros: '+40% Poder Militar e proteção contra crises',
      cons: '-12% Aprovação Popular',
      costCash: 3500,
      costStability: 8,
      buffMilitaryPower: 0.40,
      penaltyApproval: -12
    }
  ];

  // ══════════════════════════════════════════════════════════
  // 🎯 CAMPANHA NACIONAL & MISSÕES DE ESTADO
  // ══════════════════════════════════════════════════════════

  window.GAME_DATA.campaignMissions = [
    // ── CAPÍTULO I: FUNDAÇÃO DO ESTADO SOBERANO ──
    {
      id: 'm_cap1_1',
      chapter: 1,
      chapterName: 'Capítulo I — Fundação Soberana',
      title: 'Primeiros Passos Soberanos',
      icon: '👆',
      desc: 'Realize 25 toques soberanos na tela inicial para extrair liquidez direta.',
      check: (s) => (s.stats?.totalClicks || 0) >= 25,
      progress: (s) => Math.min(100, Math.round(((s.stats?.totalClicks || 0) / 25) * 100)),
      targetText: '25 cliques',
      reward: { cash: 100, xp: 50, desc: '$100 + 50 XP' }
    },
    {
      id: 'm_cap1_2',
      chapter: 1,
      chapterName: 'Capítulo I — Fundação Soberana',
      title: 'Primeiro Parque Industrial',
      icon: '🏭',
      desc: 'Construa ou evolua qualquer instalação nacional pelo menos ao Nível 1.',
      check: (s) => Object.values(s.facilities || {}).some(f => (f.level || 0) >= 1),
      progress: (s) => Object.values(s.facilities || {}).some(f => (f.level || 0) >= 1) ? 100 : 0,
      targetText: '1 indústria ativa',
      reward: { cash: 250, xp: 80, desc: '$250 + 80 XP' }
    },
    {
      id: 'm_cap1_3',
      chapter: 1,
      chapterName: 'Capítulo I — Fundação Soberana',
      title: 'Formação do Gabinete Ministerial',
      icon: '🎩',
      desc: 'Promova qualquer um dos seus Ministros de Estado para o Nível 2.',
      check: (s) => Object.values(s.ministers || {}).some(m => (m.level || 1) >= 2),
      progress: (s) => Object.values(s.ministers || {}).some(m => (m.level || 1) >= 2) ? 100 : 0,
      targetText: '1 ministro Nv.2',
      reward: { cash: 500, influence: 5, desc: '$500 + 5 Influência' }
    },
    {
      id: 'm_cap1_4',
      chapter: 1,
      chapterName: 'Capítulo I — Fundação Soberana',
      title: 'Acúmulo de Reservas',
      icon: '💰',
      desc: 'Acumule um saldo de pelo menos $1.000 no Tesouro Nacional.',
      check: (s) => (s.balance || 0) >= 1000,
      progress: (s) => Math.min(100, Math.round(((s.balance || 0) / 1000) * 100)),
      targetText: '$1.000 no Tesouro',
      reward: { cash: 800, xp: 120, desc: '$800 + 120 XP' }
    },

    // ── CAPÍTULO II: INDUSTRIALIZAÇÃO & MERCADO DE TRABALHO ──
    {
      id: 'm_cap2_1',
      chapter: 2,
      chapterName: 'Capítulo II — Industrialização & Trabalho',
      title: 'Empregos para o Povo',
      icon: '💼',
      desc: 'Crie postos de trabalho suficientes para empregar pelo menos 100 trabalhadores.',
      check: (s, eng) => (eng?.getTotalJobs ? eng.getTotalJobs() : 0) >= 100,
      progress: (s, eng) => Math.min(100, Math.round(((eng?.getTotalJobs ? eng.getTotalJobs() : 0) / 100) * 100)),
      targetText: '100 vagas de emprego',
      reward: { cash: 2000, stability: 10, desc: '$2.000 + 10% Estabilidade' }
    },
    {
      id: 'm_cap2_2',
      chapter: 2,
      chapterName: 'Capítulo II — Industrialização & Trabalho',
      title: 'Educação & Alfabetização',
      icon: '📚',
      desc: 'Alcance uma taxa de alfabetização de pelo menos 75% da população.',
      check: (s) => (s.literacyRate || 0) >= 75.0,
      progress: (s) => Math.min(100, Math.round(((s.literacyRate || 0) / 75.0) * 100)),
      targetText: '75% alfabetização',
      reward: { cash: 2500, xp: 200, desc: '$2.500 + 200 XP' }
    },
    {
      id: 'm_cap2_3',
      chapter: 2,
      chapterName: 'Capítulo II — Industrialização & Trabalho',
      title: 'Motor do PIB em Aceleração',
      icon: '📈',
      desc: 'Alcance uma produção de riqueza de pelo menos $5.000 por hora.',
      check: (s) => (s.gdpPerHour || 0) >= 5000,
      progress: (s) => Math.min(100, Math.round(((s.gdpPerHour || 0) / 5000) * 100)),
      targetText: '$5.000 PIB/hora',
      reward: { cash: 4000, influence: 15, desc: '$4.000 + 15 Influência' }
    },
    {
      id: 'm_cap2_4',
      chapter: 2,
      chapterName: 'Capítulo II — Industrialização & Trabalho',
      title: 'Poder do Decreto Presidencial',
      icon: '📜',
      desc: 'Promulgue o seu primeiro Decreto Executivo Presidencial na guia Instituições.',
      check: (s) => (s.activeDecrees || []).length >= 1,
      progress: (s) => (s.activeDecrees || []).length >= 1 ? 100 : 0,
      targetText: '1 decreto ativo',
      reward: { cash: 3500, stability: 12, desc: '$3.500 + 12% Estabilidade' }
    },

    // ── CAPÍTULO III: POTÊNCIA REGIONAL & DISSUASÃO ──
    {
      id: 'm_cap3_1',
      chapter: 3,
      chapterName: 'Capítulo III — Potência Regional & Dissuasão',
      title: 'Capacidade Hospitalar de Retaguarda',
      icon: '🏥',
      desc: 'Expanda o sistema de saúde para alcançar pelo menos 150 leitos hospitalares.',
      check: (s) => (s.hospitalCapacity || 0) >= 150,
      progress: (s) => Math.min(100, Math.round(((s.hospitalCapacity || 0) / 150) * 100)),
      targetText: '150 leitos hospitalares',
      reward: { cash: 8000, approval: 10, desc: '$8.000 + 10% Aprovação' }
    },
    {
      id: 'm_cap3_2',
      chapter: 3,
      chapterName: 'Capítulo III — Potência Regional & Dissuasão',
      title: 'Escudo Militar Soberano',
      icon: '🛡️',
      desc: 'Alcance pelo menos 300 pontos no Score de Poder ou Força Militar.',
      check: (s) => Math.max(s.militarySize || 0, s.powerScore || 0) >= 300,
      progress: (s) => Math.min(100, Math.round((Math.max(s.militarySize || 0, s.powerScore || 0) / 300) * 100)),
      targetText: '300 Poder/Militar',
      reward: { cash: 15000, hegemonyPoints: 1, desc: '$15.000 + 1 Ponto Hegemonia' }
    },
    {
      id: 'm_cap3_3',
      chapter: 3,
      chapterName: 'Capítulo III — Potência Regional & Dissuasão',
      title: 'Agência Estatal Fortalecida',
      icon: '🏢',
      desc: 'Evolua qualquer Agência Reguladora Nacional para o Nível 3.',
      check: (s) => Object.values(s.agencies || {}).some(a => (a.level || 1) >= 3),
      progress: (s) => Object.values(s.agencies || {}).some(a => (a.level || 1) >= 3) ? 100 : 0,
      targetText: '1 agência Nv.3',
      reward: { cash: 20000, xp: 500, desc: '$20.000 + 500 XP' }
    },
    {
      id: 'm_cap3_4',
      chapter: 3,
      chapterName: 'Capítulo III — Potência Regional & Dissuasão',
      title: 'Cofre dos Milionários',
      icon: '💎',
      desc: 'Acumule $1.000.000 ($1M) em fundos líquidos no Tesouro.',
      check: (s) => (s.balance || 0) >= 1000000,
      progress: (s) => Math.min(100, Math.round(((s.balance || 0) / 1000000) * 100)),
      targetText: '$1.000.000 no Tesouro',
      reward: { cash: 50000, hegemonyPoints: 2, desc: '$50.000 + 2 Pontos Hegemonia' }
    },

    // ── CAPÍTULO IV: SUPERPOTÊNCIA GLOBAL & ASCENSÃO HEGEMÔNICA ──
    {
      id: 'm_cap4_1',
      chapter: 4,
      chapterName: 'Capítulo IV — Superpotência & Hegemonia',
      title: 'Gigante Econômico Mundial',
      icon: '👑',
      desc: 'Alcance uma produção econômica astronômica de $100.000 por hora.',
      check: (s) => (s.gdpPerHour || 0) >= 100000,
      progress: (s) => Math.min(100, Math.round(((s.gdpPerHour || 0) / 100000) * 100)),
      targetText: '$100.000 PIB/hora',
      reward: { cash: 150000, hegemonyPoints: 3, desc: '$150.000 + 3 Pontos Hegemonia' }
    },
    {
      id: 'm_cap4_2',
      chapter: 4,
      chapterName: 'Capítulo IV — Superpotência & Hegemonia',
      title: 'Gabinete de Titãs',
      icon: '🎩',
      desc: 'Evolua todos os 6 Ministros Soberanos para o Nível 5 ou superior.',
      check: (s) => Object.values(s.ministers || {}).filter(m => (m.level || 1) >= 5).length >= 6,
      progress: (s) => Math.min(100, Math.round((Object.values(s.ministers || {}).filter(m => (m.level || 1) >= 5).length / 6) * 100)),
      targetText: '6 ministros Nv.5',
      reward: { cash: 300000, hegemonyPoints: 5, desc: '$300.000 + 5 Pontos Hegemonia' }
    },
    {
      id: 'm_cap4_3',
      chapter: 4,
      chapterName: 'Capítulo IV — Superpotência & Hegemonia',
      title: 'Supremacia Geopolítica',
      icon: '🌐',
      desc: 'Alcance 1.000 pontos no Score de Poder ou Influência Global.',
      check: (s) => Math.max(s.influence || 0, s.powerScore || 0) >= 1000,
      progress: (s) => Math.min(100, Math.round((Math.max(s.influence || 0, s.powerScore || 0) / 1000) * 100)),
      targetText: '1.000 Influência/Poder',
      reward: { cash: 500000, hegemonyPoints: 8, desc: '$500.000 + 8 Pontos Hegemonia' }
    },
    {
      id: 'm_cap4_4',
      chapter: 4,
      chapterName: 'Capítulo IV — Superpotência & Hegemonia',
      title: 'O Limiar da Hegemonia ($1B)',
      icon: '🌌',
      desc: 'Atinja $1.000.000.000 ($1 Bilhão) e desbloqueie a Ascensão no Grande Reset!',
      check: (s) => (s.balance || 0) >= 1000000000,
      progress: (s) => Math.min(100, Math.round(((s.balance || 0) / 1000000000) * 100)),
      targetText: '$1.000.000.000 ($1B)',
      reward: { cash: 5000000, hegemonyPoints: 15, desc: 'Glória Eterna + 15 Pontos Hegemonia' }
    }
  ];

  // 4. Pool de Contratos Diários Operacionais (Bounties)
  window.GAME_DATA.dailyBountiesPool = [
    {
      id: 'bounty_tap',
      title: 'Operação Choque de Caixa',
      icon: '👆',
      desc: 'Extraia fundos manualmente 50 vezes pelo botão virtual.',
      target: 50,
      check: (s) => (s.stats?.totalClicks || 0),
      reward: { cash: 800, xp: 100 }
    },
    {
      id: 'bounty_heal',
      title: 'Vigilância Epidemiológica',
      icon: '💉',
      desc: 'Mantenha a estabilidade nacional acima de 60%.',
      target: 60,
      check: (s) => Math.round(s.stability || 0),
      reward: { cash: 1200, stability: 5 }
    },
    {
      id: 'bounty_gdp',
      title: 'Pico Industrial',
      icon: '⚡',
      desc: 'Mantenha um PIB sustentado de pelo menos $2.000/h.',
      target: 2000,
      check: (s) => Math.round(s.gdpPerHour || 0),
      reward: { cash: 2000, xp: 150 }
    },
    {
      id: 'bounty_minister',
      title: 'Despacho Ministerial',
      icon: '🎩',
      desc: 'Promova ou mantenha qualquer ministro no Nível 3 ou superior.',
      target: 3,
      check: (s) => Math.max(...Object.values(s.ministers || {}).map(m => m.level || 1)),
      reward: { cash: 1500, influence: 10 }
    },
    {
      id: 'bounty_decree',
      title: 'Ato Executivo',
      icon: '📜',
      desc: 'Mantenha pelo menos 1 Decreto Executivo Presidencial em vigor.',
      target: 1,
      check: (s) => (s.activeDecrees || []).length,
      reward: { cash: 1800, stability: 8 }
    },
    {
      id: 'bounty_literacy',
      title: 'Cruzada pela Alfabetização',
      icon: '📖',
      desc: 'Garanta uma taxa de alfabetização igual ou superior a 70%.',
      target: 70,
      check: (s) => Math.round(s.literacyRate || 0),
      reward: { cash: 2200, xp: 250 }
    }
  ];

  // 5. Operações Geopolíticas Táticas
  window.GAME_DATA.tacticalMissions = [
    {
      id: 'tac_spy',
      name: 'Infiltração de Contraespionagem',
      icon: '🕵️',
      time: 45, // 45 segundos
      risk: 'Baixo (10%)',
      cost: 500,
      rewardDesc: 'Confisca $3.000 de fundos rivais e +80 XP',
      rewardCash: 3000,
      rewardXp: 80
    },
    {
      id: 'tac_patrol',
      name: 'Patrulha Naval em Águas Internacionais',
      icon: '⚓',
      time: 60,
      risk: 'Médio (25%)',
      cost: 1200,
      rewardDesc: '+30 Poder Militar e +5% Estabilidade',
      rewardPower: 30,
      rewardStability: 5
    },
    {
      id: 'tac_diplo',
      name: 'Resgate de Inteligência Diplomática',
      icon: '🤝',
      time: 90,
      risk: 'Alto (40%)',
      cost: 2500,
      rewardDesc: '+25 Influência Global e $8.000',
      rewardInfluence: 25,
      rewardCash: 8000
    },
    {
      id: 'tac_raid',
      name: 'Ataque Cirúrgico de Drones Furtivos',
      icon: '🎯',
      time: 120,
      risk: 'Crítico (50%)',
      cost: 6000,
      rewardDesc: '+1 Ponto de Hegemonia e $20.000',
      rewardHegemony: 1,
      rewardCash: 20000
    }
  ];

  console.log('✅ GAME_DATA expandido carregado com sucesso: 64 Commodities, 195 Nações, 6 Ministérios com Projetos, 5 Agências Reguladoras, 8 Decretos, 16 Missões em 4 Capítulos.');
})();

