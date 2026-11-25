// Conteúdos da app: plano semanal, sessões, chás e receitas.

export const SESSIONS = {
  A: {
    title: 'Calistenia A — parte superior + core',
    place: 'Circuito do condomínio',
    dur: '40–45 min',
    note: 'Aquecimento de 5–8 min primeiro. Descanso de 60–90 s entre séries.',
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
    note: 'Descanso de 60 s entre séries.',
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
    note: 'Alternar 2 min a andar com 1 min a correr devagar. Lembre-se da altitude do Lubango: ritmo confortável.',
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
export const RECIPES = [
  {
    id: 'papas', name: 'Papas de aveia com banana e ginguba', meal: 'Pequeno-almoço', time: '10 min', serves: 1,
    ing: [
      { q: '40 g', i: 'Aveia', c: 'mercearia' },
      { q: '200 ml', i: 'Leite (ou água)', c: 'lacticinios' },
      { q: '1', i: 'Banana', c: 'frescos' },
      { q: '1 c. sopa', i: 'Ginguba torrada sem sal', c: 'mercearia' },
      { q: 'q.b.', i: 'Canela', c: 'mercearia' },
    ],
    steps: ['Cozer a aveia no leite 4–5 min, mexendo.', 'Servir com a banana às rodelas, a ginguba picada e canela.'],
    tip: 'Sem açúcar: a banana já adoça.',
  },
  {
    id: 'omelete', name: 'Omelete de gimboa e tomate', meal: 'Pequeno-almoço / jantar', time: '10 min', serves: 1,
    ing: [
      { q: '3', i: 'Ovos', c: 'lacticinios' },
      { q: '1 mão', i: 'Gimboa (ou espinafre)', c: 'frescos' },
      { q: '½', i: 'Cebola', c: 'frescos' },
      { q: '1', i: 'Tomate', c: 'frescos' },
      { q: '1 c. chá', i: 'Óleo', c: 'mercearia' },
    ],
    steps: ['Saltear a cebola e a gimboa picadas no óleo 3 min.', 'Juntar os ovos batidos com sal e o tomate em cubos.', 'Cozinhar em lume brando e dobrar.'],
    tip: 'Muita proteína e quase sem hidratos.',
  },
  {
    id: 'cacusso', name: 'Cacusso grelhado com batata-doce e salada', meal: 'Almoço / jantar', time: '35 min', serves: 1,
    ing: [
      { q: '1 médio', i: 'Cacusso (tilápia)', c: 'proteina' },
      { q: '1 média', i: 'Batata-doce', c: 'frescos' },
      { q: '1', i: 'Limão', c: 'frescos' },
      { q: '2 dentes', i: 'Alho', c: 'frescos' },
      { q: '½ pé', i: 'Alface', c: 'frescos' },
      { q: '1', i: 'Tomate', c: 'frescos' },
      { q: '½', i: 'Pepino', c: 'frescos' },
    ],
    steps: ['Temperar o cacusso com alho, limão e sal 15 min.', 'Cozer ou assar a batata-doce com casca.', 'Grelhar o peixe 5–6 min de cada lado.', 'Servir com salada de alface, tomate e pepino.'],
    tip: 'Metade do prato salada, ¼ peixe, ¼ batata-doce.',
  },
  {
    id: 'carapau', name: 'Carapau no forno com legumes', meal: 'Almoço / jantar', time: '40 min', serves: 2,
    ing: [
      { q: '4', i: 'Carapau', c: 'proteina' },
      { q: '1', i: 'Cebola', c: 'frescos' },
      { q: '1', i: 'Pimento', c: 'frescos' },
      { q: '2', i: 'Tomate', c: 'frescos' },
      { q: '2', i: 'Cenoura', c: 'frescos' },
      { q: '3 dentes', i: 'Alho', c: 'frescos' },
      { q: '1', i: 'Limão', c: 'frescos' },
      { q: '1 c. sopa', i: 'Óleo', c: 'mercearia' },
    ],
    steps: ['Forrar o tabuleiro com cebola, pimento, tomate e cenoura às rodelas.', 'Pôr o carapau por cima, temperado com alho, limão e sal.', 'Regar com o óleo e levar ao forno a 200 °C, 25–30 min.'],
    tip: 'Peixe barato, rico em ómega-3.',
  },
  {
    id: 'frango-feijao', name: 'Frango grelhado com feijão e couve', meal: 'Almoço', time: '25 min', serves: 1,
    ing: [
      { q: '150 g', i: 'Peito de frango', c: 'proteina' },
      { q: '½ chávena', i: 'Feijão cozido', c: 'mercearia' },
      { q: '3 folhas', i: 'Couve', c: 'frescos' },
      { q: '2 dentes', i: 'Alho', c: 'frescos' },
      { q: '1', i: 'Limão', c: 'frescos' },
      { q: 'opcional', i: 'Jindungo', c: 'frescos' },
    ],
    steps: ['Temperar o frango com alho, limão, sal e jindungo.', 'Grelhar 5–6 min de cada lado.', 'Saltear a couve cortada fina 3 min e juntar o feijão para aquecer.'],
    tip: 'O feijão dá fibra e saciedade — mas se inchar, comece com pouco.',
  },
  {
    id: 'atum-frade', name: 'Salada de atum com feijão-frade', meal: 'Almoço rápido', time: '10 min', serves: 1,
    ing: [
      { q: '1 lata', i: 'Atum ao natural', c: 'proteina' },
      { q: '1 chávena', i: 'Feijão-frade cozido', c: 'mercearia' },
      { q: '½', i: 'Cebola', c: 'frescos' },
      { q: '1', i: 'Tomate', c: 'frescos' },
      { q: 'q.b.', i: 'Coentros ou salsa', c: 'frescos' },
      { q: '1', i: 'Limão', c: 'frescos' },
    ],
    steps: ['Misturar o atum escorrido, o feijão-frade, a cebola e o tomate picados.', 'Temperar com limão, sal e coentros.'],
    tip: 'Ótima para levar para o trabalho.',
  },
  {
    id: 'sopa', name: 'Sopa de abóbora e cenoura', meal: 'Entrada / jantar leve', time: '30 min', serves: 4,
    ing: [
      { q: '500 g', i: 'Abóbora', c: 'frescos' },
      { q: '3', i: 'Cenoura', c: 'frescos' },
      { q: '1', i: 'Cebola', c: 'frescos' },
      { q: '2 dentes', i: 'Alho', c: 'frescos' },
      { q: '1 pequena', i: 'Batata', c: 'frescos' },
      { q: 'q.b.', i: 'Couve', c: 'frescos' },
    ],
    steps: ['Cozer tudo (menos a couve) em 1,5 L de água com sal, 20 min.', 'Triturar e juntar couve cortada fina; ferver mais 5 min.'],
    tip: 'Uma tigela antes do jantar ajuda a comer menos do resto.',
  },
  {
    id: 'muamba', name: 'Muamba de galinha leve', meal: 'Almoço de fim de semana', time: '60 min', serves: 4,
    ing: [
      { q: '800 g', i: 'Frango sem pele', c: 'proteina' },
      { q: '300 g', i: 'Quiabo', c: 'frescos' },
      { q: '400 g', i: 'Abóbora', c: 'frescos' },
      { q: '2', i: 'Cebola', c: 'frescos' },
      { q: '3', i: 'Tomate', c: 'frescos' },
      { q: '4 dentes', i: 'Alho', c: 'frescos' },
      { q: 'q.b.', i: 'Jindungo', c: 'frescos' },
      { q: '2 c. sopa', i: 'Óleo de palma (dendém)', c: 'mercearia' },
    ],
    steps: ['Refogar a cebola, o alho e o tomate no óleo de palma.', 'Juntar o frango e cozinhar 20 min em lume médio com um pouco de água.', 'Juntar a abóbora e o quiabo e cozinhar mais 20 min.'],
    tip: 'Menos dendém do que o habitual e frango sem pele. Com funge: uma concha pequena.',
  },
  {
    id: 'kizaca', name: 'Kizaca com peixe grelhado', meal: 'Almoço / jantar', time: '45 min', serves: 2,
    ing: [
      { q: '400 g', i: 'Folha de mandioca pisada (kizaca)', c: 'frescos' },
      { q: '1', i: 'Cebola', c: 'frescos' },
      { q: '2', i: 'Tomate', c: 'frescos' },
      { q: '3 dentes', i: 'Alho', c: 'frescos' },
      { q: '2 c. sopa', i: 'Ginguba moída', c: 'mercearia' },
      { q: '400 g', i: 'Peixe (cacusso, carapau ou corvina)', c: 'proteina' },
    ],
    steps: ['Cozer a kizaca 20–25 min.', 'Refogar cebola, alho e tomate com pouco óleo, juntar a kizaca e a ginguba moída; 10 min.', 'Servir com o peixe grelhado.'],
    tip: 'Folhas verdes à vontade; a ginguba em pouca quantidade.',
  },
  {
    id: 'batido', name: 'Batido de papaia e aveia', meal: 'Lanche / pós-treino', time: '5 min', serves: 1,
    ing: [
      { q: '1 fatia grande', i: 'Papaia', c: 'frescos' },
      { q: '2 c. sopa', i: 'Aveia', c: 'mercearia' },
      { q: '1', i: 'Iogurte natural', c: 'lacticinios' },
      { q: '100 ml', i: 'Água ou leite', c: 'lacticinios' },
    ],
    steps: ['Triturar tudo com gelo.'],
    tip: 'A papaia é ótima para o trânsito intestinal.',
  },
  {
    id: 'ovos-abacate', name: 'Ovos cozidos com abacate e tomate', meal: 'Lanche', time: '12 min', serves: 1,
    ing: [
      { q: '2', i: 'Ovos', c: 'lacticinios' },
      { q: '½', i: 'Abacate', c: 'frescos' },
      { q: '1', i: 'Tomate', c: 'frescos' },
      { q: '½', i: 'Limão', c: 'frescos' },
    ],
    steps: ['Cozer os ovos 10 min.', 'Servir com abacate e tomate às fatias, limão e sal.'],
    tip: 'Mata a fome até ao jantar e evita o petisco com a cerveja.',
  },
  {
    id: 'feijoada', name: 'Feijoada leve com legumes', meal: 'Almoço', time: '35 min', serves: 3,
    ing: [
      { q: '3 chávenas', i: 'Feijão cozido', c: 'mercearia' },
      { q: '2', i: 'Cenoura', c: 'frescos' },
      { q: '4 folhas', i: 'Couve', c: 'frescos' },
      { q: '1', i: 'Cebola', c: 'frescos' },
      { q: '2', i: 'Tomate', c: 'frescos' },
      { q: '3 dentes', i: 'Alho', c: 'frescos' },
      { q: '300 g', i: 'Peito de frango', c: 'proteina' },
    ],
    steps: ['Refogar cebola, alho e tomate com pouco óleo.', 'Juntar o frango aos cubos e a cenoura; 10 min.', 'Juntar o feijão, um pouco de água e a couve; 15 min.'],
    tip: 'Sem chouriço nem toucinho — o sabor vem do refogado.',
  },
  {
    id: 'frango-manga', name: 'Salada de frango com manga', meal: 'Jantar', time: '20 min', serves: 1,
    ing: [
      { q: '120 g', i: 'Peito de frango', c: 'proteina' },
      { q: '½', i: 'Manga', c: 'frescos' },
      { q: '½ pé', i: 'Alface', c: 'frescos' },
      { q: '½', i: 'Cebola', c: 'frescos' },
      { q: '1', i: 'Limão', c: 'frescos' },
    ],
    steps: ['Grelhar o frango e cortar em tiras.', 'Misturar com alface, manga em cubos e cebola fina.', 'Temperar com limão, sal e um fio de óleo.'],
    tip: 'Jantar leve depois do treino da noite.',
  },
];

export const CAT_NAMES = {
  frescos: 'Frescos (fruta e legumes)',
  proteina: 'Peixe e carne',
  lacticinios: 'Ovos e lacticínios',
  mercearia: 'Mercearia',
};

export const BEER_TIPS = [
  'Beba primeiro 500 ml de água ou infusão gelada. Muitas vezes é sede, não vontade de cerveja.',
  'Coma algo antes (ovos, fruta, ginguba): de estômago vazio bebe-se mais e mais depressa.',
  'Alterne: cerveja, água, cerveja.',
  'Escolha dias sem cerveja na semana (ex.: segunda a quinta) em vez de cortar tudo de uma vez.',
  'Garrafa pequena em vez de grande. Cerveja sem álcool também conta como boa troca.',
  'Cada cerveja de 330 ml tem cerca de 140 kcal — 4 por dia são quase uma refeição extra.',
];
