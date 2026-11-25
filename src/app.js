import { SESSIONS, DAY_NAMES, DEFAULT_WEEK, TEAS, DETOX_NOTE, RECIPES, CAT_NAMES, BEER_TIPS } from './data.js';
import { animFor, ANIMS, startAnimLoop } from './anims.js';
import { setupNotifications, rescheduleAll, testNotification, exactAlarmStatus, openExactAlarmSettings, onAction, isNative } from './notify.js';

// ---------- Estado ----------
const KEY = 'killbelly.v1';
const DEFAULT_SETTINGS = {
  nome: 'Luís',
  notifTreino: true, treinoAntes: 10,
  notifAgua: true, aguaInicio: '06:00', aguaFim: '21:00', aguaIntervalo: 60, copoMl: 250, metaAgua: 3000,
  notifPeso: true, pesoHora: '05:05', cinturaDia: 1,
  notifCerveja: true, cervejaHora: '17:30', cervejaSabado: '13:30', metaCerveja: 10,
  notifChas: true, chaManha: '10:00', chaNoite: '21:15',
  metaPeso: '',
};

const clone = (o) => JSON.parse(JSON.stringify(o));
function load() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(KEY)); } catch {}
  s = s || {};
  return {
    week: s.week || clone(DEFAULT_WEEK),
    settings: { ...DEFAULT_SETTINGS, ...(s.settings || {}) },
    water: s.water || {}, weight: s.weight || {}, waist: s.waist || {}, beer: s.beer || {},
    log: s.log || {}, shop: s.shop || { sel: [], checked: {} },
  };
}
let state = load();
function save(resched = false) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  if (resched) scheduleSoon();
}
let schedTimer = null, lastSched = null;
function scheduleSoon() {
  clearTimeout(schedTimer);
  schedTimer = setTimeout(async () => {
    try { lastSched = await rescheduleAll(state); } catch (e) { lastSched = { error: String(e) }; }
    if (tab === 'def') render();
  }, 600);
}

// ---------- Datas ----------
const pad = (n) => String(n).padStart(2, '0');
const dkey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromKey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const mondayOf = (d = new Date()) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); const wd = (x.getDay() + 6) % 7; return addDays(x, -wd); };
const fmtShort = (k) => { const d = fromKey(k); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`; };
const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const num = (v, dec = 1) => Number(v).toFixed(dec).replace('.', ',');

// ---------- Lógica ----------
const waterToday = () => state.water[dkey()] || 0;
function addWater(ml) {
  const k = dkey();
  state.water[k] = Math.max(0, (state.water[k] || 0) + ml);
  save();
}
function beerWeek(monday = mondayOf()) {
  let t = 0;
  for (let i = 0; i < 7; i++) t += state.beer[dkey(addDays(monday, i))] || 0;
  return t;
}
function slotLog(k, slot) {
  state.log[k] = state.log[k] || {};
  state.log[k][slot] = state.log[k][slot] || { checks: [], done: false };
  return state.log[k][slot];
}
function dayDone(k) {
  const l = state.log[k];
  return !!(l && ((l.am && l.am.done) || (l.pm && l.pm.done)));
}
function streak() {
  let d = new Date(), n = 0;
  if (!dayDone(dkey(d))) d = addDays(d, -1);
  while (dayDone(dkey(d))) { n++; d = addDays(d, -1); }
  return n;
}
function avg7(endKey) {
  const end = fromKey(endKey); const vals = [];
  for (let i = 0; i < 7; i++) { const v = state.weight[dkey(addDays(end, -i))]; if (v) vals.push(v); }
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
}
const sortedKeys = (o) => Object.keys(o).sort();

// ---------- Gráficos (SVG) ----------
function lineChart(series, { h = 170, unit = '', avg = null } = {}) {
  const W = 340, H = h, P = { l: 34, r: 8, t: 10, b: 22 };
  if (series.length < 2) return `<p class="muted">Precisa de pelo menos 2 registos para ver o gráfico.</p>`;
  const xs = series.map((p) => fromKey(p.k).getTime());
  const all = series.map((p) => p.v).concat(avg ? avg.map((p) => p.v) : []);
  let min = Math.min(...all), max = Math.max(...all);
  if (max - min < 1) { min -= 0.5; max += 0.5; }
  const pad2 = (max - min) * 0.1; min -= pad2; max += pad2;
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  const X = (t) => P.l + ((t - x0) / (x1 - x0 || 1)) * (W - P.l - P.r);
  const Y = (v) => P.t + (1 - (v - min) / (max - min)) * (H - P.t - P.b);
  const path = (arr) => arr.map((p, i) => `${i ? 'L' : 'M'}${X(fromKey(p.k).getTime()).toFixed(1)},${Y(p.v).toFixed(1)}`).join('');
  const ticks = [min + (max - min) * 0.15, (min + max) / 2, max - (max - min) * 0.15];
  let g = ticks.map((v) => `<line x1="${P.l}" x2="${W - P.r}" y1="${Y(v)}" y2="${Y(v)}" class="grid"/><text x="${P.l - 4}" y="${Y(v) + 3}" class="axis" text-anchor="end">${num(v, 1)}</text>`).join('');
  g += `<text x="${P.l}" y="${H - 6}" class="axis">${fmtShort(series[0].k)}</text><text x="${W - P.r}" y="${H - 6}" class="axis" text-anchor="end">${fmtShort(series[series.length - 1].k)}</text>`;
  const dots = series.length <= 40 ? series.map((p) => `<circle cx="${X(fromKey(p.k).getTime())}" cy="${Y(p.v)}" r="2.6" class="dot"/>`).join('') : '';
  return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img">${g}
    <path d="${path(series)}" class="${avg ? 'line-raw' : 'line'}"/>${avg ? `<path d="${path(avg)}" class="line"/>` : ''}${dots}</svg>`;
}
function barChart(bars, { goal = null, h = 130 } = {}) {
  const W = 340, H = h, P = { l: 8, r: 8, t: 20, b: 20 };
  const max = Math.max(goal || 0, ...bars.map((b) => b.v), 1) * 1.1;
  const bw = (W - P.l - P.r) / bars.length;
  const Y = (v) => P.t + (1 - v / max) * (H - P.t - P.b);
  let s = bars.map((b, i) => {
    const x = P.l + i * bw + bw * 0.18, w = bw * 0.64, y = Y(b.v);
    const over = goal != null && b.over;
    return `<rect x="${x}" y="${y}" width="${w}" height="${H - P.b - y}" rx="3" class="${over ? 'bar-over' : 'bar'}"/>
      <text x="${x + w / 2}" y="${y - 3}" class="axis" text-anchor="middle">${b.label2 ?? b.v}</text>
      <text x="${x + w / 2}" y="${H - 6}" class="axis" text-anchor="middle">${b.label}</text>`;
  }).join('');
  if (goal) s += `<line x1="${P.l}" x2="${W - P.r}" y1="${Y(goal)}" y2="${Y(goal)}" class="goal"/>`;
  return `<svg viewBox="0 0 ${W} ${H}" class="chart">${s}</svg>`;
}

// ---------- UI ----------
let tab = 'hoje', nutriTab = 'chas', open = {}, exactStatus = 'granted', notifOk = true;
const app = document.getElementById('app');
const TABS = [
  ['hoje', '🏠', 'Hoje'], ['treino', '💪', 'Treino'], ['prog', '📈', 'Progresso'], ['nutri', '🥗', 'Nutrição'], ['def', '⚙️', 'Definições'],
];

function render() {
  const views = { hoje: vHoje, treino: vTreino, prog: vProg, nutri: vNutri, def: vDef };
  app.innerHTML = `<main>${views[tab]()}</main>
  <nav>${TABS.map(([id, ic, l]) => `<button data-tab="${id}" class="${tab === id ? 'on' : ''}"><span>${ic}</span>${l}</button>`).join('')}</nav>`;
}

function animBtn(text, key) {
  const id = animFor(text);
  if (!id) return '';
  return `<button class="play ${open[key] ? 'on' : ''}" data-toggle="${key}" aria-label="Ver animação">${open[key] ? '■' : '▶'}</button>`;
}
function animBox(text, key) {
  const id = animFor(text);
  if (!id || !open[key]) return '';
  return `<div class="anim"><svg viewBox="0 0 160 110" data-anim="${id}"></svg><p class="small">${ANIMS[id].tip}</p></div>`;
}

function sessionCard(k, slot, cfg, editable = true) {
  if (!cfg) return '';
  const ses = SESSIONS[cfg.s];
  const lg = (state.log[k] && state.log[k][slot]) || { checks: [], done: false };
  const id = `${k}-${slot}`;
  const isOpen = open[id];
  const n = lg.checks.length, tot = ses.items.length;
  return `<div class="ses ${lg.done ? 'done' : ''}">
    <div class="ses-h" data-toggle="${id}">
      <div><div class="ses-t">${slot === 'am' ? '🌅 Manhã' : parseInt(cfg.t) < 17 ? '☀️ Tarde' : '🌙 Noite'} · ${cfg.t}</div><b>${ses.title}</b>
      <div class="muted">${ses.dur} · ${ses.place}${tot > 1 ? ` · ${n}/${tot}` : ''}</div></div>
      <div class="chev">${lg.done ? '✅' : isOpen ? '▴' : '▾'}</div>
    </div>
    ${isOpen ? `<div class="ses-b"><p class="note">${ses.note}</p>
      ${ses.items.map((it, i) => `<div class="ex"><div class="ex-row"><label class="chk"><input type="checkbox" ${editable ? '' : 'disabled'} data-check="${k}|${slot}|${i}" ${lg.checks.includes(i) ? 'checked' : ''}><span>${it}</span></label>${animBtn(it, `an-${id}-${i}`)}</div>${animBox(it, `an-${id}-${i}`)}</div>`).join('')}
      ${editable ? `<button class="btn ${lg.done ? 'ghost' : ''}" data-done="${k}|${slot}">${lg.done ? 'Desmarcar' : 'Marcar treino como feito'}</button>` : ''}
    </div>` : ''}
  </div>`;
}

function banners() {
  let b = '';
  if (isNative() && !notifOk) b += `<div class="warn">As notificações estão desligadas. <button class="link" data-act="perm">Ativar</button></div>`;
  if (isNative() && exactStatus !== 'granted') b += `<div class="warn">Para os alarmes tocarem à hora certa, permita "Alarmes e lembretes". <button class="link" data-act="exact">Abrir definição</button></div>`;
  return b;
}

function vHoje() {
  const now = new Date(), k = dkey(now), cfg = state.week[now.getDay()];
  const s = state.settings;
  const w = waterToday(), pct = Math.min(100, Math.round((w / s.metaAgua) * 100));
  const hr = now.getHours();
  const greet = hr < 12 ? 'Bom dia' : hr < 19 ? 'Boa tarde' : 'Boa noite';
  const wt = state.weight[k];
  const prevKeys = sortedKeys(state.weight).filter((x) => x < k);
  const last = prevKeys.length ? state.weight[prevKeys[prevKeys.length - 1]] : null;
  const a7 = avg7(k), a7prev = avg7(dkey(addDays(now, -7)));
  const monday = dkey(mondayOf());
  const waistThisWeek = sortedKeys(state.waist).filter((x) => x >= monday);
  const showWaist = now.getDay() === Number(s.cinturaDia) || !waistThisWeek.length;
  const bw = beerWeek(), bt = state.beer[k] || 0;
  const tip = BEER_TIPS[now.getDate() % BEER_TIPS.length];
  const tea = hr < 12 ? TEAS[0] : hr < 16 ? TEAS[6] : hr < 19 ? TEAS[10] : TEAS[hr < 21 ? 5 : 4];
  const st = streak();
  return `<header><div><h1>${greet}, ${s.nome}</h1><div class="muted">${DAY_NAMES[now.getDay()]}, ${now.getDate()} de ${MONTHS[now.getMonth()]}</div></div>
    <div class="streak" title="Dias seguidos com treino">🔥 ${st}</div></header>
    ${banners()}
    <section class="card"><h2>Treino de hoje</h2>${sessionCard(k, 'am', cfg.am)}${sessionCard(k, 'pm', cfg.pm)}</section>
    <section class="card"><h2>💧 Água <span class="right">${num(w / 1000, 2)} / ${num(s.metaAgua / 1000, 1)} L</span></h2>
      <div class="bar-wrap"><div class="bar-fill" style="width:${pct}%"></div></div>
      <div class="row"><button class="btn sm ghost" data-water="-${s.copoMl}">−${s.copoMl}</button><button class="btn sm" data-water="${s.copoMl}">+ copo ${s.copoMl} ml</button><button class="btn sm" data-water="500">+ garrafa 500 ml</button></div>
      <p class="muted small">Chá e infusões sem açúcar também contam.</p></section>
    <section class="card"><h2>⚖️ Peso de hoje</h2>
      <div class="row"><input id="inPeso" type="number" inputmode="decimal" step="0.1" placeholder="kg" value="${wt ?? ''}"><button class="btn sm" data-act="savePeso">Guardar</button></div>
      <p class="muted small">${a7 ? `Média 7 dias: <b>${num(a7)} kg</b>${a7prev ? ` (${a7 - a7prev <= 0 ? '' : '+'}${num(a7 - a7prev)} vs. semana anterior)` : ''}` : last ? `Último: ${num(last)} kg` : 'O peso oscila de dia para dia — o que conta é a média semanal.'}</p>
      ${showWaist ? `<h3>📏 Cintura (semanal)</h3><div class="row"><input id="inCintura" type="number" inputmode="decimal" step="0.5" placeholder="cm" value="${state.waist[k] ?? ''}"><button class="btn sm" data-act="saveCintura">Guardar</button></div>
      <p class="muted small">À altura do umbigo, barriga relaxada, a expirar.</p>` : ''}
    </section>
    <section class="card"><h2>🍺 Cerveja <span class="right ${bw > s.metaCerveja ? 'bad' : ''}">${bw} / ${s.metaCerveja} esta semana</span></h2>
      <div class="row"><button class="btn sm ghost" data-beer="-1">−1</button><div class="big">${bt} hoje</div><button class="btn sm" data-beer="1">+1</button></div>
      <p class="muted small">💡 ${tip}</p></section>
    <section class="card tea"><h2>🍵 Sugestão para agora</h2><b>${tea.name}</b><p class="small">${tea.good}</p><p class="muted small">${tea.how}</p></section>`;
}

function vTreino() {
  const today = new Date();
  const order = [1, 2, 3, 4, 5, 6, 0];
  const opts = (sel) => Object.entries(SESSIONS).map(([id, s]) => `<option value="${id}" ${id === sel ? 'selected' : ''}>${s.title}</option>`).join('');
  // histórico 28 dias
  let cells = '';
  const start = addDays(mondayOf(), -21);
  for (let i = 0; i < 28; i++) {
    const d = addDays(start, i), k = dkey(d), l = state.log[k] || {};
    const c = (l.am && l.am.done ? 1 : 0) + (l.pm && l.pm.done ? 1 : 0);
    cells += `<div class="cell c${c} ${k === dkey() ? 'today' : ''} ${d > today ? 'fut' : ''}" title="${fmtShort(k)}">${d.getDate()}</div>`;
  }
  let weekDone = 0, weekPlanned = 0;
  for (let i = 0; i < 7; i++) {
    const d = addDays(mondayOf(), i), l = state.log[dkey(d)] || {}, cfg = state.week[d.getDay()];
    for (const sl of ['am', 'pm']) { if (cfg[sl] && cfg[sl].s !== 'REST') weekPlanned++; if (l[sl] && l[sl].done) weekDone++; }
  }
  const recent = sortedKeys(state.log).reverse().filter(dayDone).slice(0, 10);
  return `<header><h1>Treino</h1><div class="streak">🔥 ${streak()}</div></header>
  <section class="card"><h2>Esta semana <span class="right">${weekDone} / ${weekPlanned} sessões</span></h2>
    <div class="bar-wrap"><div class="bar-fill" style="width:${weekPlanned ? Math.round((weekDone / weekPlanned) * 100) : 0}%"></div></div>
    <div class="cal">${['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((x) => `<div class="cal-h">${x}</div>`).join('')}${cells}</div>
    <p class="muted small">Últimas 4 semanas · verde claro = 1 sessão, verde escuro = 2.</p></section>
  <section class="card"><h2>Plano semanal</h2><p class="muted small">Toque num dia para editar a sessão ou a hora. Os alarmes atualizam-se sozinhos.</p>
    ${order.map((d) => {
      const c = state.week[d], id = `plan-${d}`;
      return `<div class="plan-d ${d === today.getDay() ? 'is-today' : ''}"><div class="plan-h" data-toggle="${id}"><b>${DAY_NAMES[d]}</b>
        <span class="muted small">${c.am.t} ${SESSIONS[c.am.s].title.split(' —')[0]} · ${c.pm.t} ${SESSIONS[c.pm.s].title.split(' —')[0]}</span></div>
        ${open[id] ? ['am', 'pm'].map((sl) => `<div class="plan-e"><span>${sl === 'am' ? '🌅' : '🌙'}</span><input type="time" value="${c[sl].t}" data-plan-t="${d}|${sl}"><select data-plan-s="${d}|${sl}">${opts(c[sl].s)}</select></div>`).join('') : ''}
      </div>`;
    }).join('')}
    <button class="btn ghost sm" data-act="resetPlan">Repor plano original</button></section>
  <section class="card"><h2>Sessões</h2>${Object.entries(SESSIONS).filter(([id]) => ['A', 'B', 'C', 'CORE'].includes(id)).map(([id, s]) => {
    const oid = `sesinfo-${id}`;
    return `<div class="plan-d"><div class="plan-h" data-toggle="${oid}"><b>${s.title}</b><span class="muted small">${s.dur}</span></div>${open[oid] ? `<p class="note">${s.note}</p><div class="small">${s.items.map((x, i) => `<div class="ex"><div class="ex-row"><span class="ex-t">${i + 1}. ${x}</span>${animBtn(x, `an-${oid}-${i}`)}</div>${animBox(x, `an-${oid}-${i}`)}</div>`).join('')}</div>` : ''}</div>`;
  }).join('')}
    <p class="muted small"><b>Progressão:</b> semana 1 com 2 séries; semana 2 com 3; semana 3 mais reps ou menos descanso (circuito C com 4 voltas); semana 4 manter ou aliviar, e reavaliar.</p></section>
  <section class="card"><h2>Histórico</h2>${recent.length ? recent.map((k) => {
    const l = state.log[k], c = state.week[fromKey(k).getDay()];
    const parts = ['am', 'pm'].filter((sl) => l[sl] && l[sl].done).map((sl) => SESSIONS[(l[sl].s) || c[sl].s].title.split(' —')[0]);
    return `<div class="hist"><span>${DAY_NAMES[fromKey(k).getDay()].slice(0, 3)} ${fmtShort(k)}</span><span>${parts.join(' + ')}</span></div>`;
  }).join('') : '<p class="muted">Ainda sem treinos registados. O primeiro é o mais difícil 💪</p>'}</section>`;
}

function vProg() {
  const s = state.settings;
  const wk = sortedKeys(state.weight);
  const since = dkey(addDays(new Date(), -120));
  const series = wk.filter((k) => k >= since).map((k) => ({ k, v: state.weight[k] }));
  const avgS = series.map((p) => ({ k: p.k, v: avg7(p.k) }));
  const first = wk.length ? state.weight[wk[0]] : null;
  const cur = wk.length ? avg7(wk[wk.length - 1]) : null;
  const ck = sortedKeys(state.waist);
  const cSeries = ck.map((k) => ({ k, v: state.waist[k] }));
  const waterBars = [];
  for (let i = 6; i >= 0; i--) {
    const d = addDays(new Date(), -i), v = state.water[dkey(d)] || 0;
    waterBars.push({ v: v / 1000, label: DAY_NAMES[d.getDay()].slice(0, 3), label2: num(v / 1000, 1) });
  }
  const beerBars = [];
  for (let i = 7; i >= 0; i--) {
    const m = addDays(mondayOf(), -7 * i), v = beerWeek(m);
    beerBars.push({ v, label: fmtShort(dkey(m)), over: v > s.metaCerveja });
  }
  const entries = wk.slice(-14).reverse();
  return `<header><h1>Progresso</h1></header>
  <section class="card"><h2>⚖️ Peso</h2>
    <div class="stats"><div><small>Início</small><b>${first ? num(first) : '—'}</b></div><div><small>Média 7 dias</small><b>${cur ? num(cur) : '—'}</b></div>
    <div><small>Variação</small><b class="${first && cur && cur - first <= 0 ? 'good' : ''}">${first && cur ? `${cur - first > 0 ? '+' : ''}${num(cur - first)}` : '—'}</b></div>
    ${s.metaPeso ? `<div><small>Meta</small><b>${num(s.metaPeso)}</b></div>` : ''}</div>
    ${lineChart(series, { avg: avgS })}
    <p class="muted small">Linha clara = pesagens diárias. Linha forte = média de 7 dias (é esta que conta).</p>
    ${entries.length ? `<details><summary>Últimos registos</summary>${entries.map((k) => `<div class="hist"><span>${fmtShort(k)}</span><span>${num(state.weight[k])} kg <button class="link" data-del="weight|${k}">apagar</button></span></div>`).join('')}</details>` : ''}
  </section>
  <section class="card"><h2>📏 Cintura</h2>
    <div class="stats"><div><small>Início</small><b>${ck.length ? num(state.waist[ck[0]]) : '—'}</b></div><div><small>Atual</small><b>${ck.length ? num(state.waist[ck[ck.length - 1]]) : '—'}</b></div>
    <div><small>Variação</small><b>${ck.length > 1 ? `${num(state.waist[ck[ck.length - 1]] - state.waist[ck[0]])} cm` : '—'}</b></div></div>
    ${lineChart(cSeries)}
    ${ck.length ? `<details><summary>Registos</summary>${ck.slice().reverse().map((k) => `<div class="hist"><span>${fmtShort(k)}</span><span>${num(state.waist[k])} cm <button class="link" data-del="waist|${k}">apagar</button></span></div>`).join('')}</details>` : ''}
  </section>
  <section class="card"><h2>💧 Água — últimos 7 dias (L)</h2>${barChart(waterBars, { goal: s.metaAgua / 1000 })}</section>
  <section class="card"><h2>🍺 Cerveja por semana</h2>${barChart(beerBars, { goal: s.metaCerveja })}<p class="muted small">A linha é a sua meta semanal (${s.metaCerveja}).</p></section>`;
}

function vNutri() {
  const sub = { chas: 'Chás', receitas: 'Receitas', compras: 'Compras' };
  let body = '';
  if (nutriTab === 'chas') {
    body = `<p class="note">${DETOX_NOTE}</p>${TEAS.map((t) => `<section class="card tea"><b>${t.name}</b><div class="muted small">⏰ ${t.when}</div><p class="small">${t.good}</p><p class="muted small">🫖 ${t.how}</p></section>`).join('')}`;
  } else if (nutriTab === 'receitas') {
    body = `<p class="muted small">Ingredientes fáceis de encontrar em Angola. Regra do prato: ½ legumes, ¼ proteína, ¼ hidratos (funge, arroz, batata-doce, mandioca).</p>` +
      RECIPES.map((r) => {
        const sel = state.shop.sel.includes(r.id), oid = `rec-${r.id}`;
        return `<section class="card"><div class="plan-h" data-toggle="${oid}"><div><b>${r.name}</b><div class="muted small">${r.meal} · ${r.time} · ${r.serves} ${r.serves > 1 ? 'pessoas' : 'pessoa'}</div></div><div class="chev">${open[oid] ? '▴' : '▾'}</div></div>
        ${open[oid] ? `<h3>Ingredientes</h3><ul class="small">${r.ing.map((x) => `<li>${x.q} ${x.i}</li>`).join('')}</ul><h3>Preparação</h3><ol class="small">${r.steps.map((x) => `<li>${x}</li>`).join('')}</ol><p class="note">💡 ${r.tip}</p>` : ''}
        <button class="btn sm ${sel ? 'ghost' : ''}" data-shop="${r.id}">${sel ? '✓ Na lista de compras' : '+ Lista de compras'}</button></section>`;
      }).join('');
  } else {
    const agg = {};
    for (const id of state.shop.sel) {
      const r = RECIPES.find((x) => x.id === id); if (!r) continue;
      for (const ing of r.ing) {
        agg[ing.c] = agg[ing.c] || {};
        agg[ing.c][ing.i] = agg[ing.c][ing.i] || [];
        agg[ing.c][ing.i].push(ing.q);
      }
    }
    const cats = Object.keys(CAT_NAMES).filter((c) => agg[c]);
    body = !state.shop.sel.length ? `<p class="muted">A lista está vazia. Vá a <b>Receitas</b> e toque em "+ Lista de compras".</p>` :
      `<p class="muted small">Receitas: ${state.shop.sel.map((id) => RECIPES.find((r) => r.id === id)?.name).filter(Boolean).join(', ')}</p>` +
      cats.map((c) => `<section class="card"><h3>${CAT_NAMES[c]}</h3>${Object.entries(agg[c]).sort().map(([item, qs]) => {
        const key = `${c}|${item}`;
        return `<label class="chk"><input type="checkbox" data-buy="${key}" ${state.shop.checked[key] ? 'checked' : ''}><span>${item} <span class="muted">— ${qs.join(' + ')}</span></span></label>`;
      }).join('')}</section>`).join('') +
      `<button class="btn ghost" data-act="clearShop">Limpar lista</button>`;
  }
  return `<header><h1>Nutrição</h1></header><div class="seg">${Object.entries(sub).map(([id, l]) => `<button data-nutri="${id}" class="${nutriTab === id ? 'on' : ''}">${l}${id === 'compras' && state.shop.sel.length ? ` (${state.shop.sel.length})` : ''}</button>`).join('')}</div>${body}`;
}

function vDef() {
  const s = state.settings;
  const tg = (k, l) => `<label class="tg"><span>${l}</span><input type="checkbox" data-set="${k}" ${s[k] ? 'checked' : ''}></label>`;
  const tm = (k, l) => `<label class="fld"><span>${l}</span><input type="time" data-set="${k}" value="${s[k]}"></label>`;
  const nm = (k, l, step = 1) => `<label class="fld"><span>${l}</span><input type="number" inputmode="decimal" step="${step}" data-set="${k}" value="${s[k]}"></label>`;
  return `<header><h1>Definições</h1></header>${banners()}
  <section class="card"><h2>Notificações</h2>
    ${tg('notifTreino', '💪 Treinos')}${nm('treinoAntes', 'Avisar quantos minutos antes')}
    ${tg('notifAgua', '💧 Água')}${tm('aguaInicio', 'Desde')}${tm('aguaFim', 'Até')}
    <label class="fld"><span>Intervalo</span><select data-set="aguaIntervalo">${[45, 60, 90, 120].map((v) => `<option value="${v}" ${s.aguaIntervalo == v ? 'selected' : ''}>${v} min</option>`).join('')}</select></label>
    ${tg('notifPeso', '⚖️ Peso diário + cintura semanal')}${tm('pesoHora', 'Hora da pesagem')}
    <label class="fld"><span>Dia da cintura</span><select data-set="cinturaDia">${DAY_NAMES.map((d, i) => `<option value="${i}" ${s.cinturaDia == i ? 'selected' : ''}>${d}</option>`).join('')}</select></label>
    ${tg('notifCerveja', '🍺 Lembrete antes da cerveja')}${tm('cervejaHora', 'Seg–Sex')}${tm('cervejaSabado', 'Sábado')}
    ${tg('notifChas', '🍵 Chás')}${tm('chaManha', 'Chá da manhã')}${tm('chaNoite', 'Infusão da noite')}
    <p class="muted small">${lastSched ? (lastSched.error ? `Erro ao agendar: ${lastSched.error}` : `${lastSched.count} lembretes agendados${lastSched.web ? ' (pré-visualização web)' : ''}${lastSched.warning ? ' — sem permissão de alarme exato, podem atrasar' : ''}.`) : ''}</p>
    <button class="btn" data-act="test">Enviar notificação de teste (5 s)</button></section>
  <section class="card"><h2>Metas</h2>${nm('metaAgua', 'Água por dia (ml)', 250)}${nm('copoMl', 'Tamanho do copo (ml)', 50)}${nm('metaCerveja', 'Cervejas por semana (máx.)')}${nm('metaPeso', 'Peso objetivo (kg)', 0.5)}
    <p class="muted small">Água: cerca de 35 ml por kg de peso. No Lubango (altitude, ar seco) e nos dias de treino, 3 L é um bom alvo.</p></section>
  <section class="card"><h2>⌚ Huawei Watch GT 6</h2><ol class="small">
    <li>Na app <b>Huawei Health</b> → Dispositivos → GT 6 → <b>Notificações</b>: ative e ligue o <b>KillBelly</b>.</li>
    <li>No telemóvel, em Definições → Apps → KillBelly → Notificações: tudo ligado, incluindo "Mostrar no ecrã bloqueado".</li>
    <li>Bateria: Definições → Apps → KillBelly → Bateria → <b>Sem restrições</b> (Huawei: "Gerir manualmente" e ativar tudo em "Iniciar aplicações").</li>
    <li>Permita <b>"Alarmes e lembretes"</b> quando a app pedir.</li>
    <li>Use o botão de teste acima com o ecrã bloqueado para confirmar que o relógio vibra.</li>
    <li>O relógio não mostra notificações enquanto está a ser usado o telemóvel (o ecrã do telemóvel ligado) — é normal.</li>
  </ol></section>
  <section class="card"><h2>Cópia de segurança</h2><p class="muted small">Copie o texto e guarde-o (ex.: email para si próprio). Para restaurar, cole e toque em Importar.</p>
    <textarea id="backup" rows="4" placeholder="Cole aqui para importar"></textarea>
    <div class="row"><button class="btn sm ghost" data-act="export">Exportar</button><button class="btn sm ghost" data-act="import">Importar</button></div></section>
  <p class="muted small center">KillBelly · os dados ficam só no seu telemóvel.</p>`;
}

// ---------- Eventos ----------
app.addEventListener('click', async (e) => {
  const t = e.target.closest('[data-tab],[data-toggle],[data-done],[data-water],[data-beer],[data-act],[data-nutri],[data-shop],[data-del]');
  if (!t) return;
  const d = t.dataset;
  if (d.tab) { tab = d.tab; render(); window.scrollTo(0, 0); return; }
  if (d.toggle) { open[d.toggle] = !open[d.toggle]; render(); return; }
  if (d.done) {
    const [k, sl] = d.done.split('|'); const l = slotLog(k, sl);
    l.done = !l.done; l.s = state.week[fromKey(k).getDay()][sl].s;
    if (l.done) { l.checks = SESSIONS[l.s].items.map((_, i) => i); open[`${k}-${sl}`] = false; }
    save(); render(); return;
  }
  if (d.water) { addWater(Number(d.water)); render(); return; }
  if (d.beer) { const k = dkey(); state.beer[k] = Math.max(0, (state.beer[k] || 0) + Number(d.beer)); save(); render(); return; }
  if (d.nutri) { nutriTab = d.nutri; render(); return; }
  if (d.shop) {
    const i = state.shop.sel.indexOf(d.shop);
    if (i >= 0) state.shop.sel.splice(i, 1); else state.shop.sel.push(d.shop);
    save(); render(); return;
  }
  if (d.del) { const [obj, k] = d.del.split('|'); delete state[obj][k]; save(); render(); return; }
  switch (d.act) {
    case 'savePeso': {
      const v = parseFloat(String(document.getElementById('inPeso').value).replace(',', '.'));
      if (v > 30 && v < 300) { state.weight[dkey()] = Math.round(v * 10) / 10; save(); render(); }
      break;
    }
    case 'saveCintura': {
      const v = parseFloat(String(document.getElementById('inCintura').value).replace(',', '.'));
      if (v > 40 && v < 250) { state.waist[dkey()] = v; save(); render(); }
      break;
    }
    case 'clearShop': state.shop = { sel: [], checked: {} }; save(); render(); break;
    case 'resetPlan': if (confirm('Repor o plano semanal original?')) { state.week = clone(DEFAULT_WEEK); save(true); render(); } break;
    case 'test': await testNotification(); break;
    case 'perm': { const r = await setupNotifications(); notifOk = r.ok; save(true); render(); break; }
    case 'exact': await openExactAlarmSettings(); break;
    case 'export': { const ta = document.getElementById('backup'); ta.value = JSON.stringify(state); ta.select(); try { await navigator.clipboard.writeText(ta.value); } catch {} break; }
    case 'import': {
      try {
        const v = JSON.parse(document.getElementById('backup').value);
        if (!v.settings || !v.week) throw new Error();
        if (confirm('Substituir os dados atuais pela cópia?')) { localStorage.setItem(KEY, JSON.stringify(v)); state = load(); save(true); render(); }
      } catch { alert('Texto inválido.'); }
      break;
    }
  }
});

app.addEventListener('change', (e) => {
  const t = e.target, d = t.dataset;
  if (d.check) {
    const [k, sl, i] = d.check.split('|'); const l = slotLog(k, sl); const n = Number(i);
    if (t.checked) { if (!l.checks.includes(n)) l.checks.push(n); } else l.checks = l.checks.filter((x) => x !== n);
    l.s = state.week[fromKey(k).getDay()][sl].s;
    if (l.checks.length === SESSIONS[l.s].items.length) l.done = true;
    save(); render();
  } else if (d.buy) {
    state.shop.checked[d.buy] = t.checked; save();
  } else if (d.planT) {
    const [day, sl] = d.planT.split('|'); state.week[day][sl].t = t.value; save(true); render();
  } else if (d.planS) {
    const [day, sl] = d.planS.split('|'); state.week[day][sl].s = t.value; save(true); render();
  } else if (d.set) {
    const k = d.set; let v;
    if (t.type === 'checkbox') v = t.checked;
    else if (t.type === 'number' || k === 'aguaIntervalo' || k === 'cinturaDia') v = t.value === '' ? '' : Number(t.value);
    else v = t.value;
    state.settings[k] = v; save(true);
  }
});

// Ações vindas das notificações (telemóvel ou relógio)
onAction((a) => {
  const n = a.notification, extra = n.extra || {};
  if (a.actionId === 'drink') addWater(state.settings.copoMl);
  else if (a.actionId === 'done' && extra.slot) {
    const k = dkey(), l = slotLog(k, extra.slot);
    l.done = true; l.s = state.week[new Date().getDay()][extra.slot].s; l.checks = SESSIONS[l.s].items.map((_, i) => i); save();
  } else if (extra.kind) tab = 'hoje';
  render();
});

// Ao voltar à app, atualizar o ecrã (ex.: mudou o dia)
document.addEventListener('visibilitychange', async () => {
  if (!document.hidden) { exactStatus = await exactAlarmStatus(); render(); }
});

(async function init() {
  render();
  startAnimLoop();
  try {
    const r = await setupNotifications();
    notifOk = r.ok !== false || r.reason === 'web';
    exactStatus = await exactAlarmStatus();
    lastSched = await rescheduleAll(state);
  } catch (e) { lastSched = { error: String(e) }; }
  render();
})();
