// Animações de exercícios: boneco em SVG com poses-chave interpoladas.
// Coordenadas num quadro 160 × 110, chão em y = 100.

const STAND = {
  h: [80, 22], n: [80, 32], p: [80, 62],
  k1: [80, 81], f1: [80, 100], k2: [80, 81], f2: [80, 100],
  e1: [80, 48], w1: [80, 63], e2: [80, 48], w2: [80, 63],
};
const J = Object.keys(STAND);
// Pose = base + alterações; "both" aplica o mesmo valor aos dois lados
function P(over = {}, base = STAND, dx = 0, dy = 0) {
  const o = {};
  for (const k of J) o[k] = [base[k][0] + dx, base[k][1] + dy];
  for (const [k, v] of Object.entries(over)) {
    if (k === 'arm') { o.e1 = v[0]; o.w1 = v[1]; o.e2 = v[0]; o.w2 = v[1]; }
    else if (k === 'leg') { o.k1 = v[0]; o.f1 = v[1]; o.k2 = v[0]; o.f2 = v[1]; }
    else o[k] = v;
  }
  return o;
}
const shift = (pose, dx, dy) => P({}, pose, dx, dy);

// --- Poses base reutilizadas ---
const PUSH_UP = P({ h: [117, 66], n: [106, 70], p: [74, 85], leg: [[57, 92], [40, 100]], arm: [[107, 85], [108, 100]] });
const PUSH_DOWN = P({ h: [117, 86], n: [106, 88], p: [73, 94], leg: [[56, 97], [40, 100]], arm: [[94, 86], [108, 100]] });
const HANG = P({ h: [80, 25], n: [80, 34], p: [80, 64], leg: [[80, 82], [77, 99]], arm: [[73, 22], [72, 10]] });
const SQUAT_LOW = P({ h: [87, 44], n: [83, 54], p: [62, 76], leg: [[86, 78], [82, 100]], arm: [[92, 64], [90, 56]] });
const FRONT = P({ k1: [74, 81], f1: [71, 100], k2: [86, 81], f2: [89, 100], e1: [70, 46], w1: [67, 60], e2: [90, 46], w2: [93, 60] });
const FRONT_AIR = P({ k1: [75, 79], f1: [74, 96], k2: [85, 79], f2: [86, 96], e1: [68, 38], w1: [64, 26], e2: [92, 38], w2: [96, 26] }, STAND, 0, -14);

const BAR = (y, x1 = 50, x2 = 110) => [{ t: 'line', a: [x1, y], b: [x2, y], w: 3 }, { t: 'line', a: [x1, y], b: [x1, 100], w: 2, c: 'post' }, { t: 'line', a: [x2, y], b: [x2, 100], w: 2, c: 'post' }];
const BENCH = (x, y, w, h = 6) => [{ t: 'rect', x, y, w, h }, { t: 'line', a: [x + 4, y + h], b: [x + 4, 100], w: 2, c: 'post' }, { t: 'line', a: [x + w - 4, y + h], b: [x + w - 4, 100], w: 2, c: 'post' }];
const TRAVE = (x) => [{ t: 'rect', x, y: 95, w: 8, h: 5 }];

export const ANIMS = {
  squat: {
    dur: 2400,
    frames: [P({ arm: [[88, 46], [86, 38]] }), { ...SQUAT_LOW, e1: [92, 60], w1: [90, 52], e2: [92, 60], w2: [90, 52] }],
    props: [{ t: 'dumbbell', at: 'w1' }],
    tip: 'Peito aberto, peso nos calcanhares, joelhos na direção dos pés.',
  },
  jumpsquat: {
    dur: 1500,
    frames: [SQUAT_LOW, P({ arm: [[84, 18], [88, 4]] }, STAND, 0, -12), P({}, STAND), SQUAT_LOW],
    tip: 'Aterrar suave, a dobrar os joelhos.',
  },
  lunge: {
    dur: 2600,
    frames: [STAND, P({ h: [80, 32], n: [80, 42], p: [80, 72], k1: [98, 76], f1: [99, 100], k2: [70, 94], f2: [52, 99], arm: [[80, 58], [80, 72]] })],
    tip: 'Tronco direito; o joelho de trás quase toca no chão.',
  },
  stepup: {
    dur: 2600,
    frames: [
      P({ k1: [82, 70], f1: [90, 82] }, STAND, -12, 0),
      P({ k2: [84, 74], f2: [76, 88] }, STAND, 26, -16),
    ],
    props: BENCH(84, 82, 44, 0),
    tip: 'Suba com a força da perna da frente, sem dar impulso com a de trás.',
  },
  pushup: { dur: 2200, frames: [PUSH_UP, PUSH_DOWN], tip: 'Corpo em linha reta, cotovelos a 45°.' },
  plank: {
    dur: 3000,
    frames: [
      P({ h: [117, 79], n: [106, 82], p: [73, 88], leg: [[56, 94], [40, 100]], arm: [[106, 100], [124, 100]] }),
      P({ h: [117, 78], n: [106, 81], p: [73, 86], leg: [[56, 93], [40, 100]], arm: [[106, 100], [124, 100]] }),
    ],
    tip: 'Contrair barriga e glúteos. Não deixar a anca cair.',
  },
  sideplank: {
    dur: 3000,
    frames: [
      P({ h: [118, 72], n: [108, 79], p: [74, 86], leg: [[57, 93], [40, 100]], e1: [110, 100], w1: [124, 100], e2: [108, 63], w2: [109, 47] }),
      P({ h: [118, 73], n: [108, 80], p: [74, 91], leg: [[57, 96], [40, 100]], e1: [110, 100], w1: [124, 100], e2: [108, 64], w2: [109, 48] }),
    ],
    tip: 'Apoio no antebraço, corpo em linha. Pequenas descidas de anca.',
  },
  hollow: {
    dur: 3000,
    frames: [
      P({ h: [114, 84], n: [106, 89], p: [80, 97], leg: [[61, 92], [41, 86]], arm: [[122, 83], [137, 78]] }),
      P({ h: [114, 85], n: [106, 90], p: [80, 97], leg: [[61, 93], [41, 89]], arm: [[122, 84], [137, 80]] }),
    ],
    tip: 'Lombar colada ao chão; ombros e pernas no ar.',
  },
  deadbug: {
    dur: 2600,
    frames: [
      P({ h: [116, 94], n: [106, 96], p: [80, 97], leg: [[78, 78], [62, 78]], e1: [107, 81], w1: [108, 65], e2: [105, 81], w2: [106, 65] }),
      P({ h: [116, 94], n: [106, 96], p: [80, 97], k1: [78, 78], f1: [62, 78], k2: [60, 91], f2: [40, 94], e1: [120, 92], w1: [135, 90], e2: [105, 81], w2: [106, 65] }),
    ],
    tip: 'Estender braço e perna opostos devagar, lombar sempre no chão.',
  },
  bridge: {
    dur: 2400,
    frames: [
      P({ h: [123, 94], n: [112, 96], p: [88, 97], leg: [[75, 79], [67, 100]], arm: [[100, 98], [90, 99]] }),
      P({ h: [123, 94], n: [112, 95], p: [88, 78], leg: [[73, 75], [67, 100]], arm: [[100, 98], [90, 99]] }),
    ],
    tip: 'Empurrar pelos calcanhares e apertar os glúteos em cima.',
  },
  pullup: {
    dur: 2800,
    frames: [HANG, P({ h: [80, 7], n: [80, 17], p: [80, 47], leg: [[80, 65], [77, 82]], arm: [[66, 22], [72, 10]] })],
    props: BAR(10),
    noGround: true,
    tip: 'Peito à barra, descer controlado até braços esticados.',
  },
  negative: {
    dur: 4000,
    frames: [P({ h: [80, 7], n: [80, 17], p: [80, 47], leg: [[80, 65], [77, 82]], arm: [[66, 22], [72, 10]] }), HANG],
    props: BAR(10),
    noGround: true,
    tip: 'Comece em cima (com um salto) e desça o mais devagar possível.',
  },
  row: {
    dur: 2400,
    frames: [
      P({ h: [111, 82], n: [100, 84], p: [64, 93], leg: [[47, 97], [30, 100]], arm: [[102, 72], [104, 58]] }),
      P({ h: [108, 62], n: [98, 66], p: [63, 84], leg: [[46, 92], [30, 100]], arm: [[88, 60], [104, 58]] }),
    ],
    props: BAR(58, 90, 140),
    tip: 'Corpo direito como uma prancha; puxar o peito até à barra.',
  },
  dips: {
    dur: 2400,
    frames: [
      P({ h: [87, 40], n: [85, 50], p: [88, 78], leg: [[112, 84], [134, 100]], arm: [[83, 63], [80, 76]] }),
      P({ h: [88, 54], n: [86, 64], p: [88, 92], leg: [[112, 92], [134, 100]], arm: [[70, 66], [80, 76]] }),
    ],
    props: BENCH(40, 76, 40),
    tip: 'Ombros longe das orelhas; descer até 90° nos cotovelos.',
  },
  press: {
    dur: 2400,
    frames: [P({ e1: [87, 44], w1: [87, 30], e2: [73, 44], w2: [73, 30] }), P({ e1: [86, 20], w1: [87, 4], e2: [74, 20], w2: [73, 4] })],
    props: [{ t: 'dumbbell', at: 'w1' }],
    tip: 'Barriga contraída, sem arquear as costas.',
  },
  kneeraise: {
    dur: 2400,
    frames: [HANG, P({ k1: [100, 62], f1: [100, 82], k2: [100, 62], f2: [100, 82] }, HANG)],
    props: BAR(10),
    noGround: true,
    tip: 'Subir os joelhos sem balançar o corpo.',
  },
  legraise: {
    dur: 2600,
    frames: [
      P({ h: [120, 78], n: [110, 80], p: [82, 81], leg: [[60, 81], [38, 81]], arm: [[122, 72], [130, 80]] }),
      P({ h: [120, 78], n: [110, 80], p: [82, 81], leg: [[78, 59], [76, 37]], arm: [[122, 72], [130, 80]] }),
    ],
    props: BENCH(40, 84, 92),
    tip: 'Descer as pernas devagar, sem tocar no banco.',
  },
  situp: {
    dur: 2600,
    frames: [
      P({ h: [116, 92], n: [106, 90], p: [80, 82], leg: [[60, 70], [44, 82]], arm: [[96, 84], [100, 80]] }),
      P({ h: [70, 54], n: [72, 64], p: [80, 82], leg: [[60, 70], [44, 82]], arm: [[78, 70], [82, 66]] }),
    ],
    props: [{ t: 'line', a: [44, 78], b: [130, 98], w: 6, c: 'bench' }],
    tip: 'Subir enrolando a coluna; descer devagar.',
  },
  climbers: {
    dur: 900,
    frames: [
      P({ k1: [94, 90], f1: [86, 99] }, PUSH_UP),
      P({ k2: [94, 90], f2: [86, 99] }, PUSH_UP),
    ],
    tip: 'Ombros sobre as mãos, ritmo rápido.',
  },
  lateralhop: {
    dur: 1400,
    frames: [shift(FRONT, -20, 0), shift(FRONT_AIR, 0, 0), shift(FRONT, 20, 0), shift(FRONT_AIR, 0, 0)],
    props: TRAVE(76),
    tip: 'Pés juntos, saltos curtos e rápidos.',
  },
  fronthop: {
    dur: 1600,
    frames: [P({}, SQUAT_LOW, -30, 0), P({ arm: [[84, 18], [88, 4]] }, STAND, -4, -16), P({}, SQUAT_LOW, 24, 0), P({ arm: [[84, 18], [88, 4]] }, STAND, -4, -16)],
    props: TRAVE(78),
    tip: 'Salto para a frente e para trás sobre a trave.',
  },
  wheel: {
    dur: 3200,
    frames: [
      P({ h: [94, 56], n: [84, 62], p: [66, 76], leg: [[60, 98], [42, 99]], arm: [[90, 78], [96, 92]] }),
      P({ h: [116, 78], n: [106, 82], p: [78, 87], leg: [[60, 98], [42, 99]], arm: [[122, 88], [134, 92]] }),
    ],
    props: [{ t: 'wheel', at: 'w1' }],
    tip: 'Só até onde a lombar fica direita. Voltar com a barriga.',
  },
  twist: {
    dur: 1800,
    frames: [
      P({ h: [80, 54], n: [80, 64], p: [80, 92], k1: [72, 80], f1: [66, 92], k2: [88, 80], f2: [94, 92], e1: [70, 72], w1: [62, 80], e2: [74, 76], w2: [64, 81] }),
      P({ h: [80, 54], n: [80, 64], p: [80, 92], k1: [72, 80], f1: [66, 92], k2: [88, 80], f2: [94, 92], e1: [90, 72], w1: [98, 80], e2: [86, 76], w2: [96, 81] }),
    ],
    props: [{ t: 'dumbbell', at: 'w1' }],
    tip: 'Rodar o tronco, não só os braços. Pés no chão para começar.',
  },
  walk: {
    dur: 1100,
    frames: [
      P({ k1: [86, 80], f1: [92, 100], k2: [76, 82], f2: [68, 99], e1: [74, 47], w1: [70, 60], e2: [86, 47], w2: [92, 58] }),
      P({ k2: [86, 80], f2: [92, 100], k1: [76, 82], f1: [68, 99], e2: [74, 47], w2: [70, 60], e1: [86, 47], w1: [92, 58] }),
    ],
    tip: 'Passo largo e rápido, braços a acompanhar.',
  },
};

const MAP = [
  [/goblet|Agachamento goblet/i, 'squat'],
  [/Agachamento com salto|burpee/i, 'jumpsquat'],
  [/Afundos/i, 'lunge'],
  [/step-up|Subidas ao banco/i, 'stepup'],
  [/^Flexões/i, 'pushup'],
  [/Prancha lateral/i, 'sideplank'],
  [/Prancha/i, 'plank'],
  [/Hollow/i, 'hollow'],
  [/Dead bug/i, 'deadbug'],
  [/Ponte de glúteos/i, 'bridge'],
  [/Elevações na barra/i, 'pullup'],
  [/Remada australiana/i, 'row'],
  [/Fundos/i, 'dips'],
  [/Press de ombro/i, 'press'],
  [/joelhos suspenso/i, 'kneeraise'],
  [/Elevação de pernas/i, 'legraise'],
  [/Abdominais no banco/i, 'situp'],
  [/Mountain climbers/i, 'climbers'],
  [/Saltos laterais/i, 'lateralhop'],
  [/Saltos frontais/i, 'fronthop'],
  [/Roda de abdominais/i, 'wheel'],
  [/Russian twist/i, 'twist'],
  [/Caminhada|jogging|a andar/i, 'walk'],
];
export function animFor(text) {
  for (const [re, id] of MAP) if (re.test(text)) return id;
  return null;
}

// --- Desenho ---
const ease = (t) => 0.5 - Math.cos(Math.PI * t) / 2;
function poseAt(a, t) {
  const n = a.frames.length;
  const pos = (t % 1) * n, i = Math.floor(pos), f = ease(pos - i);
  const A = a.frames[i], B = a.frames[(i + 1) % n], o = {};
  for (const k of J) o[k] = [A[k][0] + (B[k][0] - A[k][0]) * f, A[k][1] + (B[k][1] - A[k][1]) * f];
  return o;
}
const L = (a, b, cls = 'limb') => `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" class="${cls}"/>`;
function drawProps(a, p) {
  return (a.props || []).map((pr) => {
    if (pr.t === 'line') return `<line x1="${pr.a[0]}" y1="${pr.a[1]}" x2="${pr.b[0]}" y2="${pr.b[1]}" class="prop ${pr.c || ''}" stroke-width="${pr.w || 3}"/>`;
    if (pr.t === 'rect') return `<rect x="${pr.x}" y="${pr.y}" width="${pr.w}" height="${Math.max(pr.h, 3)}" rx="1.5" class="prop-fill"/>`;
    const j = p[pr.at];
    if (pr.t === 'dumbbell') return `<rect x="${(j[0] - 7).toFixed(1)}" y="${(j[1] - 2).toFixed(1)}" width="14" height="4" rx="1" class="prop-fill"/><rect x="${(j[0] - 8).toFixed(1)}" y="${(j[1] - 4).toFixed(1)}" width="4" height="8" rx="1" class="prop-fill"/><rect x="${(j[0] + 4).toFixed(1)}" y="${(j[1] - 4).toFixed(1)}" width="4" height="8" rx="1" class="prop-fill"/>`;
    if (pr.t === 'wheel') return `<circle cx="${j[0].toFixed(1)}" cy="${(100 - 7).toFixed(1)}" r="7" class="wheel"/>`;
    return '';
  }).join('');
}
export function drawFrame(id, t) {
  const a = ANIMS[id]; if (!a) return '';
  const p = poseAt(a, t);
  return `${a.noGround ? '' : '<line x1="6" y1="100.5" x2="154" y2="100.5" class="ground"/>'}${drawProps(a, p)}
    ${L(p.n, p.e2, 'limb back')}${L(p.e2, p.w2, 'limb back')}${L(p.p, p.k2, 'limb back')}${L(p.k2, p.f2, 'limb back')}
    ${L(p.n, p.p, 'limb torso')}${L(p.p, p.k1)}${L(p.k1, p.f1)}${L(p.n, p.e1)}${L(p.e1, p.w1)}
    <circle cx="${p.h[0].toFixed(1)}" cy="${p.h[1].toFixed(1)}" r="7" class="head"/>`;
}

// Ciclo único que anima todos os SVG visíveis com data-anim
let running = false;
export function startAnimLoop() {
  if (running) return; running = true;
  let last = 0;
  const tick = (now) => {
    if (now - last > 33) {
      last = now;
      document.querySelectorAll('svg[data-anim]').forEach((svg) => {
        const a = ANIMS[svg.dataset.anim]; if (!a) return;
        svg.innerHTML = drawFrame(svg.dataset.anim, now / a.dur);
      });
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
