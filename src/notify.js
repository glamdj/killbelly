// Agendamento de notificações locais (Capacitor Local Notifications).
// Agendadas para 14 dias de cada vez (funcionam com a app fechada e são repostas pelo plugin
// depois de reiniciar o telemóvel). Sempre que a app abre, os 14 dias são recalculados.
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { SESSIONS, SNACKS } from './data.js';

// Snack do dia: muda todos os dias (manhã e tarde diferentes)
export function snacksFor(date) {
  const d0 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 864e5;
  const i = (d0 * 2) % SNACKS.length;
  return [SNACKS[i], SNACKS[(i + 1) % SNACKS.length]];
}

export const isNative = () => Capacitor.isNativePlatform();

const CHANNELS = [
  { id: 'treino', name: 'Treinos', description: 'Lembretes de treino' },
  { id: 'agua', name: 'Água', description: 'Lembretes para beber água' },
  { id: 'peso', name: 'Peso e cintura', description: 'Registo de peso e cintura' },
  { id: 'cerveja', name: 'Antes de beber', description: 'Água antes da primeira bebida' },
  { id: 'chas', name: 'Chás e infusões', description: 'Sugestões de chás' },
];

const parseT = (t) => {
  const [h, m] = t.split(':').map(Number);
  return { h, m };
};
const minus = (t, mins) => {
  let { h, m } = parseT(t);
  let total = h * 60 + m - mins;
  if (total < 0) total += 1440;
  return { h: Math.floor(total / 60), m: total % 60 };
};

export async function setupNotifications() {
  if (!isNative()) return { ok: false, reason: 'web' };
  let perm = await LocalNotifications.checkPermissions();
  if (perm.display !== 'granted') perm = await LocalNotifications.requestPermissions();
  for (const c of CHANNELS) {
    // importância 5 = alta: aparece no ecrã, vibra e é reencaminhada para o relógio
    await LocalNotifications.createChannel({ ...c, importance: 5, visibility: 1, vibration: true, lights: true });
  }
  await LocalNotifications.registerActionTypes({
    types: [
      { id: 'AGUA', actions: [{ id: 'drink', title: 'Bebi 250 ml' }] },
      { id: 'TREINO', actions: [{ id: 'done', title: 'Feito ✔' }] },
    ],
  });
  return { ok: perm.display === 'granted' };
}

export async function exactAlarmStatus() {
  if (!isNative()) return 'granted';
  try {
    const r = await LocalNotifications.checkExactNotificationSetting();
    return r.exact_alarm;
  } catch {
    return 'granted';
  }
}

export async function openExactAlarmSettings() {
  if (!isNative()) return;
  try { await LocalNotifications.changeExactNotificationSetting(); } catch {}
}

// ---------- Perfil ativo (normal ou férias) ----------
const pad = (n) => String(n).padStart(2, '0');
const dkey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
// Horas em que costuma fumar (aprende com os registos dos últimos 14 dias)
export function smokeHours(state, now = new Date()) {
  const log = state.smokeLog || {}, cnt = {};
  let total = 0;
  for (let i = 0; i < 14; i++) {
    const d = new Date(now); d.setDate(now.getDate() - i);
    for (const t of log[dkey(d)] || []) { const h = new Date(t).getHours(); cnt[h] = (cnt[h] || 0) + 1; total++; }
  }
  if (total < 15) return { learned: false, hours: (state.settings.tabacoHoras || '07:30,13:30,20:30').split(',').map((x) => x.trim()).filter(Boolean) };
  const top = Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([h]) => Number(h)).sort((a, b) => a - b);
  return { learned: true, hours: top.map((h) => `${String(h).padStart(2, '0')}:00`) };
}
export function smokeGoal(state, date = new Date()) {
  const s = state.settings;
  const base = Number(s.tabacoMeta) || 0;
  if (!s.tabacoReduzir || !s.tabacoInicio) return base;
  const weeks = Math.floor((date - new Date(s.tabacoInicio + 'T00:00:00')) / (7 * 864e5));
  return Math.max(0, base - Math.max(0, weeks) * Number(s.tabacoReduzir));
}

export function isVacation(state, date = new Date()) {
  const s = state.settings;
  if (s.feriasModo === 'on') return true;
  if (s.feriasModo === 'off') return false;
  const k = dkey(date);
  return !!(s.feriasInicio && s.feriasFim && k >= s.feriasInicio && k <= s.feriasFim);
}
export function profile(state, date = new Date()) {
  const s = state.settings;
  if (!isVacation(state, date)) return { vac: false, week: state.week, s };
  return {
    vac: true,
    week: state.weekFerias,
    s: {
      ...s,
      pesoHora: s.vPeso, aguaInicio: s.vAguaInicio, aguaFim: s.vAguaFim, metaAgua: s.vMetaAgua,
      cervejaHora: s.vCerveja, cervejaSabado: s.vCerveja, chaManha: s.vChaManha, chaNoite: s.vChaNoite,
      snackManha: '', snackTarde: s.vSnackTarde, snackPrep: '',
    },
  };
}

const DAYS_AHEAD = 14;
const at = (date, t) => { const { h, m } = parseT(t); const d = new Date(date); d.setHours(h, m, 0, 0); return d; };

// Notificações únicas ("at") para os próximos 14 dias, cada dia com o seu perfil.
// São recalculadas sempre que a app abre, por isso a mudança para férias é automática.
export function buildNotifications(state, from = new Date(), { startDay = null, days = DAYS_AHEAD, all = false } = {}) {
  const list = [];
  const now = from.getTime();
  const sd = startDay || from;
  const start = new Date(sd.getFullYear(), sd.getMonth(), sd.getDate());
  for (let di = 0; di < days; di++) {
    const day = new Date(start); day.setDate(start.getDate() + di);
    const { vac, week, s } = profile(state, day);
    const wd = day.getDay();
    const base = 10000 + di * 100;
    const push = (n) => { if (all || n.schedule.at.getTime() > now + 30000) list.push({ ...n, schedule: { ...n.schedule, allowWhileIdle: true } }); };

    if (s.notifTreino) {
      for (const slot of ['am', 'pm']) {
        const cfg = week[wd][slot];
        if (!cfg || cfg.s === 'REST') continue;
        const ses = SESSIONS[cfg.s];
        const when = at(day, cfg.t); when.setMinutes(when.getMinutes() - s.treinoAntes);
        push({
          id: base + (slot === 'am' ? 1 : 2),
          title: `${slot === 'am' ? (parseInt(cfg.t) < 12 ? '🌅' : '☀️') : parseInt(cfg.t) < 17 ? '☀️' : '🌙'} ${ses.title}`,
          body: `Às ${cfg.t} · ${ses.dur} · ${ses.place}`,
          channelId: 'treino', actionTypeId: 'TREINO', extra: { kind: 'treino', slot },
          schedule: { at: when },
        });
      }
    }
    if (s.notifAgua) {
      const a = parseT(s.aguaInicio), b = parseT(s.aguaFim);
      let i = 0;
      for (let t = a.h * 60 + a.m; t <= b.h * 60 + b.m && i < 30; t += Number(s.aguaIntervalo), i++) {
        push({
          id: base + 40 + i,
          title: '💧 Hora de beber água',
          body: `Um copo de ${s.copoMl} ml. Meta de hoje: ${(s.metaAgua / 1000).toFixed(1).replace('.', ',')} L.`,
          channelId: 'agua', actionTypeId: 'AGUA', extra: { kind: 'agua' },
          schedule: { at: at(day, `${Math.floor(t / 60)}:${t % 60}`) },
        });
      }
    }
    if (s.notifPeso) {
      push({ id: base + 10, title: '⚖️ Pesagem diária', body: 'Em jejum, depois da casa de banho e antes de beber água.', channelId: 'peso', extra: { kind: 'peso' }, schedule: { at: at(day, s.pesoHora) } });
      if (wd === Number(s.cinturaDia)) {
        const w = at(day, s.pesoHora); w.setMinutes(w.getMinutes() + 1);
        push({ id: base + 11, title: '📏 Medir a cintura', body: 'Fita métrica à altura do umbigo, barriga relaxada, a expirar.', channelId: 'peso', extra: { kind: 'cintura' }, schedule: { at: w } });
      }
    }
    if (s.notifCerveja && (vac || wd !== 0)) {
      push({ id: base + 20, title: '🍷 Antes de beber…', body: 'Primeiro 500 ml de água ou infusão. Depois decide.', channelId: 'cerveja', extra: { kind: 'cerveja' }, schedule: { at: at(day, wd === 6 ? s.cervejaSabado : s.cervejaHora) } });
    }
    if (s.notifSnack) {
      const [sm, st] = snacksFor(day);
      if (s.snackManha && wd !== 0) push({ id: base + 50, title: '🍎 Lanche da manhã', body: sm.name, channelId: 'chas', extra: { kind: 'snack' }, schedule: { at: at(day, s.snackManha) } });
      if (s.snackTarde) push({ id: base + 51, title: '🍌 Lanche da tarde', body: st.name, channelId: 'chas', extra: { kind: 'snack' }, schedule: { at: at(day, s.snackTarde) } });
      // À noite, preparar os snacks de amanhã (se amanhã for dia de trabalho e não for férias)
      const tmr = new Date(day); tmr.setDate(day.getDate() + 1);
      const pt = profile(state, tmr);
      if (s.snackPrep && !pt.vac && tmr.getDay() !== 0) {
        const [a1, a2] = snacksFor(tmr);
        push({ id: base + 52, title: '🥡 Preparar os snacks de amanhã', body: `Manhã: ${a1.name}. Tarde: ${a2.name}. Preparar: ${a1.prep}${a2.prep !== a1.prep ? `; ${a2.prep}` : ''}. Toque para ver o menu de amanhã.`, channelId: 'chas', extra: { kind: 'snack' }, schedule: { at: at(day, s.snackPrep) } });
      }
    }
    if (s.notifTabaco) {
      smokeHours(state, day).hours.forEach((h, n) => {
        const w = at(day, h); w.setMinutes(w.getMinutes() - 10);
        push({ id: base + 60 + n, title: '🚭 Costuma fumar por esta hora', body: 'Experimente antes: um chá, 10 min a andar ou 2 min a respirar. A vontade passa em 3–5 min.', channelId: 'chas', extra: { kind: 'tabaco' }, schedule: { at: w } });
      });
    }
    if (s.notifChas) {
      push({ id: base + 30, title: '🍵 Chá', body: vac ? 'Chá verde, gengibre ou moringa — sem açúcar.' : 'Chá verde, gengibre ou moringa — sem açúcar.', channelId: 'chas', extra: { kind: 'cha' }, schedule: { at: at(day, s.chaManha) } });
      push({ id: base + 31, title: '🌿 Infusão da noite', body: 'Camomila, erva-príncipe ou funcho. Ajuda a dormir e a desinchar.', channelId: 'chas', extra: { kind: 'cha' }, schedule: { at: at(day, s.chaNoite) } });
    }
  }
  if (all) return list;
  // Aviso de segurança caso a app não seja aberta durante quase 2 semanas
  const renew = new Date(start); renew.setDate(start.getDate() + DAYS_AHEAD - 2); renew.setHours(12, 0, 0, 0);
  list.push({ id: 9000, title: '🔄 KillBelly', body: 'Abra a app para renovar os lembretes das próximas semanas.', channelId: 'treino', schedule: { at: renew, allowWhileIdle: true } });
  return list;
}

export async function rescheduleAll(state) {
  if (!isNative()) return { count: buildNotifications(state).length, web: true };
  const pending = await LocalNotifications.getPending();
  if (pending.notifications.length) {
    await LocalNotifications.cancel({ notifications: pending.notifications.map((n) => ({ id: n.id })) });
  }
  const list = buildNotifications(state);
  let warning = null;
  if (list.length) {
    const r = await LocalNotifications.schedule({ notifications: list });
    warning = r.warning || null;
  }
  return { count: list.length, warning };
}

export async function testNotification() {
  if (!isNative()) {
    alert('As notificações só funcionam na app instalada no Android.');
    return;
  }
  await LocalNotifications.schedule({
    notifications: [{
      id: 9999,
      title: '✅ KillBelly — teste',
      body: 'Se isto apareceu no relógio, está tudo pronto.',
      channelId: 'treino',
      schedule: { at: new Date(Date.now() + 5000), allowWhileIdle: true },
    }],
  });
}

export function onAction(handler) {
  if (!isNative()) return;
  LocalNotifications.addListener('localNotificationActionPerformed', handler);
}

// Histórico (últimas 48 h) e próximos lembretes, reconstruídos a partir do horário
export function notificationFeed(state, now = new Date()) {
  const y = new Date(now); y.setDate(now.getDate() - 1);
  const all = buildNotifications(state, now, { startDay: y, days: 3, all: true })
    .map((n) => ({ id: n.id, title: n.title, body: n.body, at: n.schedule.at, kind: (n.extra && n.extra.kind) || '', slot: n.extra && n.extra.slot }))
    .sort((a, b) => a.at - b.at);
  const t = now.getTime();
  const past = all.filter((n) => n.at.getTime() <= t && n.at.getTime() > t - 48 * 3600e3).reverse();
  const next = all.filter((n) => n.at.getTime() > t).slice(0, 6);
  return { past, next };
}
