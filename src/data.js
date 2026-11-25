// Conteúdos da app: plano semanal, sessões, chás e receitas.

export const SESSIONS = {
  A: {
    title: 'Calistenia A — parte superior + core',
    place: 'Circuito do condomínio',
    dur: '40–45 min',
    note: 'Aquecimento de 5–8 min primeiro. Pausas por tipo de exercício (ajustáveis em Definições). Experimente o modo pares.',
    pairs: [[1, 3], [2, 4], [5, 7], [6]],
    items: [
      'Aquecimento: marcha rápida 3 min, círculos de braços, rotações de anca, 10 agachamentos, 20 s suspenso na barra',
      'Remada australiana na barra baixa — 3 × 8–12',
      'Elevações na barra — 3 × máximo (ou 3–5 negativas lentas)',
      'Flexões — 3 × 8–15 (mãos no banco se for difícil)',
      'Fundos no banco — 3 × 8–12',
      'Press de ombro com haltere 3 kg — 3 × 12 cada braço',
      'Elevação de joelhos suspenso na barra — 3 × 8–12',
      'Prancha frontal — 3 × 30–45 s',
    ],
  },
  B: {
    title: 'Calistenia B — pernas + core',
    place: 'Circuito do condomínio',
    dur: '45–50 min',
    note: 'Pausas por tipo de exercício (ajustáveis em Definições). Experimente o modo pares.',
    pairs: [[1, 6], [2, 7], [3, 5], [4]],
    items: [
      'Aquecimento: marcha rápida 3 min, rotações de anca e tornozelos, 10 agachamentos',
      'Agachamento goblet com haltere 3 kg — 3 × 15',
      'Afundos alternados — 3 × 10 cada perna',
      'Subidas ao banco (step-up) — 3 × 10 cada perna',
      'Saltos laterais sobre a trave — 3 × 20–30 s',
      'Ponte de glúteos — 3 × 15 (2 s em cima)',
      'Abdominais no banco inclinado — 3 × 10–15',
      'Dead bug — 3 × 8 cada lado',
    ],
  },
  C: {
    title: 'Calistenia C — circuito corpo inteiro',
    place: 'Circuito do condomínio',
    dur: '35–40 min',
    note: '40 s de trabalho / 20 s de pausa. 3 voltas (4 a partir da 3.ª semana), 1–2 min entre voltas.',
    guided: { type: 'circuit', work: 40, rest: 20, roundRest: 90, rounds: [3, 4], ex: ['Agachamento com salto', 'Remada australiana', 'Saltos frontais sobre a trave', 'Flexões', 'Mountain climbers', 'Elevação de pernas no banco', 'Prancha lateral'] },
    items: [
      'Aquecimento 5 min',
      'Agachamento com salto (ou burpees)',
      'Remada australiana',
      'Saltos frontais sobre a trave',
      'Flexões',
      'Mountain climbers',
      'Elevação de pernas no banco',
      'Prancha lateral — 20 s cada lado',
      'Volta 2 concluída',
      'Volta 3 concluída',
    ],
  },
  CORE: {
    title: 'Core em casa — roda + haltere',
    place: 'Casa',
    dur: '15 min',
    note: 'Na roda, ir só até onde consegue manter a lombar direita.',
    pairs: [[0, 1], [2, 3], [4]],
    items: [
      'Roda de abdominais, de joelhos — 3 × 6–10',
      'Russian twist com haltere 3 kg — 3 × 20',
      'Hollow hold — 3 × 20–30 s',
      'Prancha lateral — 3 × 20–30 s cada lado',
      'Vacuum abdominal — 3 × 20 s',
      'Alongamentos 3 min',
    ],
  },
  WALK: {
    title: 'Caminhada rápida',
    place: 'Rua / condomínio',
    dur: '25–30 min',
    note: 'Passo acelerado, braços a acompanhar. Se houver subidas, melhor. De madrugada leve um agasalho.',
    items: ['Copo de água ao acordar', 'Caminhada 25–30 min', 'Alongamentos 3 min'],
  },
  JOG: {
    title: 'Caminhada + jogging leve',
    place: 'Rua / condomínio',
    dur: '25 min',
    note: 'Alternar 2 min a andar com 1 min a correr devagar. Jogging = corrida lenta em que ainda consegue dizer frases curtas (esforço 5–6 em 10). Se não consegue falar, abrande. No Lubango a altitude cansa mais: ritmo confortável.',
    guided: { type: 'intervals', warm: 300, reps: 6, work: 60, rest: 120 },
    items: ['Copo de água ao acordar', '5 min a andar', '6 × (1 min jogging + 2 min a andar)', 'Alongamentos 3 min'],
  },
  BIKE: {
    title: 'Bicicleta — ritmo moderado',
    place: 'Rua / trilho',
    dur: '30 min',
    note: 'Ritmo em que consegue falar frases curtas. Luzes e colete refletor de madrugada.',
    items: ['Copo de água ao acordar', 'Pedalada 30 min', 'Alongamentos 3 min'],
  },
  BIKELONG: {
    title: 'Volta longa de bicicleta',
    place: 'Trilho',
    dur: '1h30–2h',
    note: 'Ritmo confortável, subidas à vontade. Levar 1 L de água e um snack (banana).',
    items: ['Garrafa de água + snack', 'Volta 1h30–2h', 'Alongamentos 5 min'],
  },
  WALKLONG: {
    title: 'Caminhada longa e leve',
    place: 'Rua / natureza',
    dur: '45–60 min',
    note: 'Ritmo tranquilo. Pode ser em família.',
    items: ['Caminhada 45–60 min', 'Mobilidade 5 min'],
  },
  WALKPM: {
    title: 'Caminhada rápida (noite)',
    place: 'Condomínio',
    dur: '40 min',
    note: 'Passo acelerado. Boa altura para ouvir um podcast.',
    items: ['Caminhada 40 min', 'Alongamentos 3 min'],
  },
  CASA: {
    title: 'Corpo inteiro em casa (sem material)',
    place: 'Casa / parque',
    dur: '35–40 min',
    note: 'Sem equipamento. 3 séries de cada exercício; ideal em modo pares. Uma cadeira firme chega.',
    pairs: [[2, 1], [4, 3], [5, 6], [7]],
    items: [
      'Aquecimento: marcha no lugar 3 min, círculos de braços, 10 agachamentos',
      'Agachamento — 3 × 15–20',
      'Flexões — 3 × 8–15 (mãos numa mesa se for difícil)',
      'Afundos alternados — 3 × 10 cada perna',
      'Fundos numa cadeira — 3 × 8–12',
      'Ponte de glúteos — 3 × 15',
      'Prancha frontal — 3 × 30–45 s',
      'Dead bug — 3 × 8 cada lado',
    ],
  },
  COREPT: {
    title: 'Core em casa (sem material)',
    place: 'Casa',
    dur: '15 min',
    note: 'Lombar sempre controlada.',
    pairs: [[0, 1], [2, 3], [4]],
    items: [
      'Hollow hold — 3 × 20–30 s',
      'Dead bug — 3 × 8 cada lado',
      'Prancha lateral — 3 × 20–30 s cada lado',
      'Mountain climbers — 3 × 30 s',
      'Vacuum abdominal — 3 × 20 s',
    ],
  },
  BTT: {
    title: 'Volta de BTT',
    place: 'Trilho',
    dur: '1h30–2h',
    note: 'Frio de dezembro: camadas, luvas e corta-vento. Levar água e uma banana. Regressar antes de escurecer (≈17h).',
    items: ['Água + snack + luzes', 'Volta 1h30–2h', 'Alongamentos 5 min'],
  },
  BTTCURTA: {
    title: 'BTT curta / estrada',
    place: 'Rua / trilho',
    dur: '1h',
    note: 'Ritmo moderado, em que consegue falar.',
    items: ['Água', 'Pedalada 1h', 'Alongamentos 3 min'],
  },
  PASSEIO: {
    title: 'Caminhada / passeio',
    place: 'Rua / natureza',
    dur: '45–60 min',
    note: 'Passo rápido. Pode ser em família, na praia ou na serra.',
    items: ['Caminhada 45–60 min', 'Alongamentos 3 min'],
  },
  REST: {
    title: 'Descanso + mobilidade',
    place: 'Casa',
    dur: '10 min',
    note: 'Dormir bem também é treino.',
    items: ['Mobilidade / alongamentos 10 min'],
  },
};

// Índice JS do dia: 0 = domingo … 6 = sábado
export const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export const DEFAULT_WEEK = {
  1: { am: { s: 'WALK', t: '05:20' }, pm: { s: 'A', t: '18:45' } },
  2: { am: { s: 'BIKE', t: '05:20' }, pm: { s: 'CORE', t: '19:00' } },
  3: { am: { s: 'JOG', t: '05:20' }, pm: { s: 'B', t: '18:45' } },
  4: { am: { s: 'BIKE', t: '05:20' }, pm: { s: 'WALKPM', t: '18:45' } },
  5: { am: { s: 'WALK', t: '05:20' }, pm: { s: 'C', t: '18:45' } },
  6: { am: { s: 'WALK', t: '05:20' }, pm: { s: 'BIKELONG', t: '15:30' } },
  0: { am: { s: 'WALKLONG', t: '07:00' }, pm: { s: 'CORE', t: '18:45' } },
};

// Férias em Portugal: acordar ≈10h, treino ao fim da manhã, 5 dias com treino
export const DEFAULT_WEEK_FERIAS = {
  1: { am: { s: 'BTTCURTA', t: '11:30' }, pm: { s: 'CASA', t: '17:30' } },
  2: { am: { s: 'PASSEIO', t: '11:30' }, pm: { s: 'REST', t: '17:30' } },
  3: { am: { s: 'BTT', t: '11:00' }, pm: { s: 'COREPT', t: '17:30' } },
  4: { am: { s: 'REST', t: '11:30' }, pm: { s: 'REST', t: '17:30' } },
  5: { am: { s: 'PASSEIO', t: '11:30' }, pm: { s: 'CASA', t: '17:30' } },
  6: { am: { s: 'BTT', t: '11:00' }, pm: { s: 'REST', t: '17:30' } },
  0: { am: { s: 'REST', t: '11:30' }, pm: { s: 'REST', t: '17:30' } },
};

export const TEAS = [
  {
    name: 'Água com limão e gengibre',
    when: 'Ao acordar, morna',
    good: 'Ajuda a começar o dia hidratado e dá sabor à água sem açúcar.',
    how: '1 copo de água morna, sumo de ½ limão, 2–3 rodelas de gengibre fresco.',
  },
  {
    name: 'Gengibre',
    when: 'Depois das refeições',
    good: 'Ajuda na digestão, nas náuseas e na sensação de inchaço.',
    how: '3–4 rodelas de raiz fresca em água a ferver, 5–10 min. Pode juntar limão.',
  },
  {
    name: 'Hortelã',
    when: 'Depois das refeições',
    good: 'Alivia gases e inchaço. Evite se tiver refluxo ou azia.',
    how: 'Um punhado de folhas frescas em água quente, 5 min.',
  },
  {
    name: 'Erva-príncipe (capim-limão)',
    when: 'À noite',
    good: 'Fácil de encontrar em Angola. Calmante e digestiva, sem cafeína.',
    how: '3–4 folhas lavadas e cortadas, ferver 5 min. Também é ótima gelada.',
  },
  {
    name: 'Camomila',
    when: 'Antes de dormir',
    good: 'Relaxa e ajuda a adormecer. Também acalma o estômago.',
    how: '1 saqueta ou 1 c. sopa de flores secas, 5 min tapado.',
  },
  {
    name: 'Funcho / erva-doce',
    when: 'Depois do jantar',
    good: 'Das melhores para gases e barriga inchada.',
    how: '1 c. chá de sementes ligeiramente esmagadas, 10 min tapado.',
  },
  {
    name: 'Chá verde',
    when: 'Manhã ou início da tarde',
    good: 'Antioxidantes e um pouco de cafeína. Ajuda pouco a queimar gordura; vale mais como troca de bebidas açucaradas.',
    how: 'Água quente, não a ferver, 2–3 min. Até 3 chávenas por dia, nunca à noite.',
  },
  {
    name: 'Hibisco (gelado)',
    when: 'À tarde, como refresco',
    good: 'Refrescante e sem calorias. Pode baixar a tensão: cuidado se tomar medicação para a tensão.',
    how: '1 c. sopa de flores secas por 500 ml, 10 min, deixar arrefecer, gelo e limão.',
  },
  {
    name: 'Canela com cravinho',
    when: 'Quando apetecer doce',
    good: 'Sabor adocicado sem açúcar. Ajuda a matar a vontade de doces.',
    how: '1 pau de canela + 2 cravinhos, ferver 5 min.',
  },
  {
    name: 'Moringa',
    when: 'Manhã',
    good: 'Folhas ricas em vitaminas e minerais. Sabor a erva.',
    how: '1 c. chá de folha seca ou um punhado de folha fresca, 5 min. Junte limão.',
  },
  {
    name: 'Água aromatizada fresca',
    when: 'Fim do trabalho, em vez da 1.ª cerveja',
    good: 'Hidrata, enche o estômago e quebra o hábito "chego e abro uma cerveja".',
    how: '1 L de água fria, rodelas de pepino e limão, folhas de hortelã. Deixar no frigorífico de manhã.',
  },
];

export const DETOX_NOTE =
  'Sobre "detox": quem desintoxica o corpo são o fígado e os rins. Estes chás não queimam gordura sozinhos. Ajudam porque hidratam, aliviam o inchaço e substituem cerveja, refrigerantes e sumos açucarados — e isso faz muita diferença.';

// cat: frescos | proteina | mercearia | lacticinios
const ing = (q, i, c) => ({ q, i, c });
export const RECIPES = [
  // --- Pequeno-almoço ---
  {
    id: 'papas', name: 'Papas de aveia com banana', meal: 'Pequeno-almoço', time: '10 min', serves: 1,
    ing: [ing('40 g', 'Aveia', 'mercearia'), ing('200 ml', 'Leite meio-gordo', 'lacticinios'), ing('1', 'Banana', 'frescos'), ing('1 c. sopa', 'Amendoim torrado sem sal', 'mercearia'), ing('q.b.', 'Canela', 'mercearia')],
    steps: ['Cozer a aveia no leite 4–5 min, mexendo.', 'Servir com a banana às rodelas, o amendoim picado e canela.'],
    tip: 'Sem açúcar: a banana já adoça.',
  },
  {
    id: 'panquecas', name: 'Panquecas de aveia e banana', meal: 'Pequeno-almoço', time: '15 min', serves: 1,
    ing: [ing('2', 'Ovos', 'lacticinios'), ing('1', 'Banana', 'frescos'), ing('40 g', 'Aveia', 'mercearia'), ing('q.b.', 'Canela', 'mercearia'), ing('1 peça', 'Papaia ou manga', 'frescos')],
    steps: ['Triturar ovos, banana, aveia e canela (ou esmagar com um garfo).', 'Fazer 4–5 panquecas numa frigideira antiaderente, sem óleo.', 'Servir com fruta às fatias.'],
    tip: 'Sabe a doce e tem muita proteína.',
  },
  {
    id: 'ovos-mexidos', name: 'Ovos mexidos com tomate e pão escuro', meal: 'Pequeno-almoço', time: '10 min', serves: 1,
    ing: [ing('3', 'Ovos', 'lacticinios'), ing('1', 'Tomate', 'frescos'), ing('½', 'Cebola', 'frescos'), ing('1 fatia', 'Pão de forma integral', 'mercearia')],
    steps: ['Saltear a cebola e o tomate picados 3 min.', 'Juntar os ovos batidos com sal e mexer em lume brando.', 'Servir com a fatia de pão torrada.'],
    tip: 'Uma fatia de pão, não três.',
  },
  // --- Marisco ---
  {
    id: 'camarao', name: 'Camarão salteado com alho e legumes', meal: 'Almoço / jantar', time: '20 min', serves: 2,
    ing: [ing('400 g', 'Camarão', 'peixe'), ing('4 dentes', 'Alho', 'frescos'), ing('1', 'Pimento', 'frescos'), ing('1', 'Cebola', 'frescos'), ing('1', 'Courgette ou cenoura', 'frescos'), ing('q.b.', 'Coentros', 'frescos'), ing('q.b.', 'Jindungo', 'frescos'), ing('1', 'Limão', 'frescos'), ing('1 c. sopa', 'Azeite', 'mercearia')],
    steps: ['Saltear alho e jindungo no azeite 1 min.', 'Juntar os legumes às tiras e saltear 4–5 min (ficam estaladiços).', 'Juntar o camarão descascado, 3–4 min até ficar rosado.', 'Temperar com limão, sal e coentros.'],
    tip: 'Com salada ou meia chávena de arroz. O camarão tem muita proteína e poucas calorias.',
  },
  {
    id: 'ameijoas', name: 'Amêijoas à Bulhão Pato', meal: 'Jantar / petisco', time: '20 min', serves: 2,
    ing: [ing('1 kg', 'Amêijoas', 'peixe'), ing('5 dentes', 'Alho', 'frescos'), ing('1 molho', 'Coentros', 'frescos'), ing('1', 'Limão', 'frescos'), ing('2 c. sopa', 'Azeite', 'mercearia')],
    steps: ['Deixar as amêijoas 1–2 h em água com sal para largarem a areia.', 'Alourar o alho laminado no azeite.', 'Juntar as amêijoas, tapar e abanar o tacho até abrirem (5 min).', 'Juntar coentros picados e limão. Deitar fora as que não abrirem.'],
    tip: 'Ótimo petisco para a noite em vez de amendoins e batatas fritas.',
  },
  {
    id: 'mexilhao', name: 'Mexilhão com tomate e cebolada', meal: 'Jantar', time: '25 min', serves: 2,
    ing: [ing('1 kg', 'Mexilhão', 'peixe'), ing('2', 'Cebola', 'frescos'), ing('3', 'Tomate', 'frescos'), ing('3 dentes', 'Alho', 'frescos'), ing('1', 'Pimento', 'frescos'), ing('q.b.', 'Salsa ou coentros', 'frescos'), ing('1 c. sopa', 'Azeite', 'mercearia')],
    steps: ['Lavar e raspar os mexilhões.', 'Fazer um refogado de cebola, alho, pimento e tomate.', 'Juntar os mexilhões, tapar e cozinhar 6–8 min até abrirem.', 'Polvilhar com salsa.'],
    tip: 'Molhe pouco pão no molho — é aí que se escondem as calorias.',
  },
  {
    id: 'lulas', name: 'Lulas grelhadas com salada', meal: 'Almoço / jantar', time: '20 min', serves: 2,
    ing: [ing('600 g', 'Lulas limpas', 'peixe'), ing('3 dentes', 'Alho', 'frescos'), ing('1', 'Limão', 'frescos'), ing('½ pé', 'Alface', 'frescos'), ing('2', 'Tomate', 'frescos'), ing('1', 'Cebola', 'frescos'), ing('1 c. sopa', 'Azeite', 'mercearia')],
    steps: ['Temperar as lulas com alho, limão e sal.', 'Grelhar na frigideira bem quente, 2–3 min de cada lado (mais tempo ficam duras).', 'Servir com salada de alface, tomate e cebola.'],
    tip: 'Com 1–2 batatas-doces cozidas fica uma refeição completa.',
  },
  {
    id: 'polvo', name: 'Salada de polvo', meal: 'Almoço / jantar', time: '50 min', serves: 3,
    ing: [ing('1 kg', 'Polvo', 'peixe'), ing('1', 'Cebola', 'frescos'), ing('1', 'Pimento vermelho', 'frescos'), ing('1', 'Pimento verde', 'frescos'), ing('1 molho', 'Coentros', 'frescos'), ing('2 c. sopa', 'Azeite', 'mercearia'), ing('2 c. sopa', 'Vinagre', 'mercearia')],
    steps: ['Cozer o polvo em água sem sal, 40–45 min (de preferência congelado antes, fica mais tenro).', 'Deixar arrefecer e cortar aos pedaços.', 'Misturar com cebola, pimentos e coentros picados; temperar com azeite, vinagre e sal.'],
    tip: 'Melhor no dia seguinte. Dá para 2–3 refeições.',
  },
  {
    id: 'choco', name: 'Choco estufado com tomate', meal: 'Almoço / jantar', time: '40 min', serves: 3,
    ing: [ing('800 g', 'Choco limpo', 'peixe'), ing('2', 'Cebola', 'frescos'), ing('4', 'Tomate', 'frescos'), ing('4 dentes', 'Alho', 'frescos'), ing('1', 'Pimento', 'frescos'), ing('1 folha', 'Louro', 'mercearia'), ing('1 c. sopa', 'Azeite', 'mercearia')],
    steps: ['Refogar cebola, alho, pimento e louro no azeite.', 'Juntar o tomate e o choco às tiras.', 'Tapar e estufar 25–30 min em lume brando.'],
    tip: 'Com arroz ou batata-doce cozida — meia chávena chega.',
  },
  // --- Peixe ---
  {
    id: 'peixe-grelhado', name: 'Corvina ou garoupa grelhada com legumes', meal: 'Almoço / jantar', time: '25 min', serves: 1,
    ing: [ing('250 g', 'Corvina, garoupa ou pescada (posta ou filete)', 'peixe'), ing('1', 'Limão', 'frescos'), ing('2 dentes', 'Alho', 'frescos'), ing('2', 'Cenoura', 'frescos'), ing('100 g', 'Feijão-verde', 'frescos'), ing('1 média', 'Batata-doce', 'frescos')],
    steps: ['Temperar o peixe com alho, limão e sal 15 min.', 'Cozer a batata-doce, a cenoura e o feijão-verde.', 'Grelhar o peixe na frigideira, 4–5 min de cada lado.', 'Regar tudo com um fio de azeite.'],
    tip: 'Metade do prato legumes, ¼ peixe, ¼ batata-doce.',
  },
  {
    id: 'caldeirada', name: 'Caldeirada leve de peixe', meal: 'Almoço / jantar', time: '40 min', serves: 3,
    ing: [ing('800 g', 'Peixe variado (garoupa, corvina, pescada)', 'peixe'), ing('2', 'Cebola', 'frescos'), ing('4', 'Tomate', 'frescos'), ing('1', 'Pimento', 'frescos'), ing('2 médias', 'Batata-doce', 'frescos'), ing('4 dentes', 'Alho', 'frescos'), ing('q.b.', 'Coentros', 'frescos'), ing('1 c. sopa', 'Azeite', 'mercearia')],
    steps: ['No tacho, fazer camadas: cebola, tomate, pimento, batata-doce às rodelas e peixe. Repetir.', 'Juntar alho, coentros, sal, o azeite e um copo de água.', 'Tapar e cozinhar 25 min sem mexer (abanar o tacho).'],
    tip: 'Pode juntar também camarão ou mexilhão.',
  },
  // --- Carne / ovos ---
  {
    id: 'frango-frigideira', name: 'Frango na frigideira com legumes salteados', meal: 'Almoço / jantar', time: '25 min', serves: 2,
    ing: [ing('400 g', 'Peito de frango', 'proteina'), ing('2', 'Cenoura', 'frescos'), ing('1', 'Pimento', 'frescos'), ing('1', 'Cebola', 'frescos'), ing('3 dentes', 'Alho', 'frescos'), ing('1', 'Limão', 'frescos'), ing('q.b.', 'Colorau e oregãos', 'mercearia'), ing('1 c. sopa', 'Azeite ou óleo', 'mercearia')],
    steps: ['Cortar o frango em bifes finos e temperar com alho, limão, colorau, oregãos e sal.', 'Grelhar na frigideira 4–5 min de cada lado e reservar.', 'Na mesma frigideira, saltear os legumes às tiras 5 min.'],
    tip: 'Faça a dobrar e leve para o almoço do dia seguinte.',
  },
  {
    id: 'frango-arroz', name: 'Arroz de frango com legumes', meal: 'Almoço', time: '35 min', serves: 3,
    ing: [ing('400 g', 'Peito de frango', 'proteina'), ing('1 chávena', 'Arroz', 'mercearia'), ing('1 saco', 'Legumes congelados (ervilha, cenoura, feijão-verde)', 'mercearia'), ing('1', 'Cebola', 'frescos'), ing('2 dentes', 'Alho', 'frescos'), ing('2', 'Tomate', 'frescos')],
    steps: ['Refogar cebola, alho e tomate.', 'Juntar o frango aos cubos e alourar.', 'Juntar o arroz, os legumes e 2,5 chávenas de água; 15–18 min tapado.'],
    tip: 'Mais legumes do que arroz no prato.',
  },
  {
    id: 'bolonhesa', name: 'Esparguete à bolonhesa leve', meal: 'Almoço / jantar', time: '30 min', serves: 3,
    ing: [ing('400 g', 'Carne picada de vaca (magra)', 'proteina'), ing('200 g', 'Esparguete', 'mercearia'), ing('1 lata', 'Tomate pelado', 'mercearia'), ing('2', 'Cenoura', 'frescos'), ing('1', 'Cebola', 'frescos'), ing('2 dentes', 'Alho', 'frescos'), ing('1', 'Pimento', 'frescos')],
    steps: ['Refogar cebola e alho com pouco óleo; juntar a carne e deixar alourar.', 'Juntar cenoura ralada, pimento picado e o tomate; 15 min em lume brando.', 'Cozer a massa e servir com bastante molho e pouca massa.'],
    tip: 'A cenoura e o pimento "esticam" o molho: mais volume, menos calorias.',
  },
  {
    id: 'omelete', name: 'Omelete de espinafres e queijo', meal: 'Jantar rápido', time: '10 min', serves: 1,
    ing: [ing('3', 'Ovos', 'lacticinios'), ing('1 mão', 'Espinafres (ou gimboa)', 'frescos'), ing('1 fatia', 'Queijo flamengo', 'lacticinios'), ing('½', 'Cebola', 'frescos'), ing('1 c. chá', 'Azeite ou óleo', 'mercearia')],
    steps: ['Saltear cebola e espinafres 2–3 min.', 'Juntar os ovos batidos com sal e o queijo em tiras.', 'Cozinhar em lume brando e dobrar.'],
    tip: 'Pronta em 10 minutos depois do treino da noite.',
  },
  {
    id: 'grao-atum', name: 'Salada de grão com atum', meal: 'Almoço rápido', time: '10 min', serves: 1,
    ing: [ing('1 lata', 'Atum ao natural', 'peixe'), ing('½ lata', 'Grão-de-bico cozido', 'mercearia'), ing('½', 'Cebola', 'frescos'), ing('1', 'Tomate', 'frescos'), ing('1', 'Ovos', 'lacticinios'), ing('q.b.', 'Coentros', 'frescos'), ing('1', 'Limão', 'frescos')],
    steps: ['Cozer o ovo 10 min.', 'Misturar atum escorrido, grão passado por água, cebola e tomate picados.', 'Temperar com limão, sal e coentros; juntar o ovo às rodelas.'],
    tip: 'Ótima para levar para o trabalho.',
  },
  {
    id: 'muamba', name: 'Muamba de galinha leve', meal: 'Almoço de fim de semana', time: '60 min', serves: 4,
    ing: [ing('800 g', 'Frango sem pele', 'proteina'), ing('300 g', 'Quiabo', 'frescos'), ing('400 g', 'Abóbora', 'frescos'), ing('2', 'Cebola', 'frescos'), ing('3', 'Tomate', 'frescos'), ing('4 dentes', 'Alho', 'frescos'), ing('q.b.', 'Jindungo', 'frescos'), ing('2 c. sopa', 'Óleo de palma (dendém)', 'mercearia')],
    steps: ['Refogar cebola, alho e tomate no óleo de palma.', 'Juntar o frango e cozinhar 20 min com um pouco de água.', 'Juntar a abóbora e o quiabo e cozinhar mais 20 min.'],
    tip: 'Menos dendém do que o habitual e frango sem pele. Com funge: uma concha pequena.',
  },
  // --- Sopas ---
  {
    id: 'sopa', name: 'Sopa de abóbora e legumes (sem batata)', meal: 'Entrada / jantar leve', time: '30 min', serves: 5,
    ing: [ing('700 g', 'Abóbora', 'frescos'), ing('3', 'Cenoura', 'frescos'), ing('2', 'Cebola', 'frescos'), ing('3 dentes', 'Alho', 'frescos'), ing('1', 'Courgette ou chuchu', 'frescos'), ing('3 folhas', 'Couve', 'frescos')],
    steps: ['Cozer tudo (menos a couve) em 1,5 L de água com sal, 20 min. A abóbora espessa a sopa sem precisar de batata.', 'Triturar e juntar a couve cortada fina; ferver mais 5 min.', 'Um fio de azeite no fim, já no prato.'],
    tip: 'Faça uma panela para 4–5 dias. Uma tigela antes do jantar ajuda a comer menos do resto.',
  },
  {
    id: 'sopa-peixe', name: 'Sopa de peixe com abóbora', meal: 'Jantar', time: '40 min', serves: 4,
    ing: [ing('500 g', 'Pescada ou garoupa (com cabeça para o caldo)', 'peixe'), ing('500 g', 'Abóbora', 'frescos'), ing('2', 'Cenoura', 'frescos'), ing('2', 'Tomate', 'frescos'), ing('1', 'Cebola', 'frescos'), ing('3 dentes', 'Alho', 'frescos'), ing('q.b.', 'Coentros', 'frescos')],
    steps: ['Cozer o peixe em 1,5 L de água com sal e cebola, 15 min. Retirar, limpar de peles e espinhas.', 'No caldo, cozer abóbora, cenoura, tomate e alho 20 min e triturar.', 'Juntar o peixe desfiado e os coentros.'],
    tip: 'É um jantar completo e leve. Pode juntar camarão nos últimos 3 min.',
  },
  // --- Lanches / petiscos ---
  {
    id: 'fruta-amendoim', name: 'Fruta com amendoim', meal: 'Lanche', time: '2 min', serves: 1,
    ing: [ing('1 peça', 'Fruta da época (papaia, manga, maçã, banana)', 'frescos'), ing('1 mão pequena', 'Amendoim torrado sem sal', 'mercearia')],
    steps: ['Uma peça de fruta e uma mão pequena (cerca de 20 g) de amendoim.'],
    tip: 'A gordura e a proteína do amendoim seguram a fome até ao jantar.',
  },
  {
    id: 'batido', name: 'Batido de banana e leite', meal: 'Pós-treino', time: '5 min', serves: 1,
    ing: [ing('1', 'Banana', 'frescos'), ing('250 ml', 'Leite meio-gordo', 'lacticinios'), ing('2 c. sopa', 'Aveia', 'mercearia'), ing('1 c. sopa', 'Manteiga de amendoim', 'mercearia')],
    steps: ['Triturar tudo com gelo.'],
    tip: 'Bom depois da calistenia: proteína e hidratos para recuperar.',
  },
  {
    id: 'ovos-cozidos', name: 'Ovos cozidos + fruta', meal: 'Lanche antes de sair do trabalho', time: '12 min', serves: 1,
    ing: [ing('2', 'Ovos', 'lacticinios'), ing('1 peça', 'Maçã ou banana', 'frescos')],
    steps: ['Cozer os ovos 10 min (pode cozer 6 de uma vez para a semana).', 'Comer com uma peça de fruta.'],
    tip: 'Chegar a casa com fome é meio caminho para o petisco.',
  },
  {
    id: 'petisco-tv', name: 'Petiscos para a TV', meal: 'Petisco da noite', time: '5 min', serves: 1,
    ing: [ing('1', 'Pepino', 'frescos'), ing('2', 'Cenoura', 'frescos'), ing('100 g', 'Camarão cozido', 'peixe'), ing('1', 'Limão', 'frescos'), ing('q.b.', 'Tremoços', 'mercearia')],
    steps: ['Palitos de pepino e cenoura com limão e sal.', 'Camarão cozido frio ou uma taça de tremoços.'],
    tip: 'Trocar batatas fritas e amendoins salgados por isto corta muitas calorias da noite.',
  },
];

export const CAT_NAMES = {
  frescos: 'Frescos (fruta e legumes)',
  peixe: 'Peixe e marisco',
  proteina: 'Carne',
  lacticinios: 'Ovos e lacticínios',
  mercearia: 'Mercearia',
};

export const ALC_TIPS = [
  'Antes do primeiro copo, um copo grande de água. Muitas vezes é sede.',
  'Vinho: copo de 150 ml, não cheio até cima. Sirva e guarde a garrafa.',
  'Dias sem álcool durante a semana (ex.: segunda a quinta) valem mais do que cortar um pouco todos os dias.',
  'Alterne: uma bebida, um copo de água.',
  'Uma cerveja de 330 ml ≈ 140 kcal; um copo de vinho de 150 ml ≈ 120 kcal; um destilado com água ou soda ≈ 100 kcal.',
  'O álcool à noite piora o sono — e dormir mal aumenta a fome no dia seguinte.',
  'Cuidado com o petisco: com álcool come-se mais sem dar conta.',
  'Cerveja sem álcool ou água com gás e limão também "fazem companhia" à TV.',
];
