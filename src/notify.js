// Agendamento de notificações locais (Capacitor Local Notifications).
// Todas as notificações são repetitivas ("on"), por isso funcionam mesmo com a app fechada
// e são repostas pelo próprio plugin depois de reiniciar o telemóvel.
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { SESSIONS } from './data.js';

export const isNative = () => Capacitor.isNativePlatform();

const CHANNELS = [
  { id: 'treino', name: 'Treinos', description: 'Lembretes de treino' },
  { id: 'agua', name: 'Água', description: 'Lembretes para beber água' },
  { id: 'peso', name: 'Peso e cintura', description: 'Registo de peso e cintura' },
  { id: 'cerveja', name: 'Fim do trabalho', description: 'Troca da primeira cerveja' },
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

export function buildNotifications(state) {
  const s = state.settings;
  const list = [];
  const base = { allowWhileIdle: true };

  // Treinos: aviso X minutos antes de cada sessão
  if (s.notifTreino) {
    for (let d = 0; d < 7; d++) {
      for (const slot of ['am', 'pm']) {
        const day = state.week[d][slot];
        if (!day || day.s === 'REST') continue;
        const ses = SESSIONS[day.s];
        const { h, m } = minus(day.t, s.treinoAntes);
        list.push({
          id: 1000 + d * 10 + (slot === 'am' ? 1 : 2),
          title: `${slot === 'am' ? '🌅' : parseInt(day.t) < 17 ? '☀️' : '🌙'} ${ses.title}`,
          body: `Às ${day.t} · ${ses.dur} · ${ses.place}`,
          channelId: 'treino',
          actionTypeId: 'TREINO',
          extra: { kind: 'treino', slot },
          schedule: { ...base, on: { weekday: d + 1, hour: h, minute: m } },
        });
      }
    }
  }

  // Água
  if (s.notifAgua) {
    const a = parseT(s.aguaInicio).h * 60 + parseT(s.aguaInicio).m;
    const b = parseT(s.aguaFim).h * 60 + parseT(s.aguaFim).m;
    let i = 0;
    for (let t = a; t <= b && i < 40; t += s.aguaIntervalo, i++) {
      list.push({
        id: 2000 + i,
        title: '💧 Hora de beber água',
        body: `Um copo de ${s.copoMl} ml. Meta de hoje: ${(s.metaAgua / 1000).toFixed(1).replace('.', ',')} L.`,
        channelId: 'agua',
        actionTypeId: 'AGUA',
        extra: { kind: 'agua' },
        schedule: { ...base, on: { hour: Math.floor(t / 60), minute: t % 60 } },
      });
    }
  }

  // Peso diário e cintura semanal
  if (s.notifPeso) {
    const p = parseT(s.pesoHora);
    list.push({
      id: 3001,
      title: '⚖️ Pesagem diária',
      body: 'Em jejum, depois da casa de banho e antes de beber água.',
      channelId: 'peso',
      extra: { kind: 'peso' },
      schedule: { ...base, on: { hour: p.h, minute: p.m } },
    });
    const c = minus(s.pesoHora, -1);
    list.push({
      id: 3002,
      title: '📏 Medir a cintura',
      body: 'Fita métrica à altura do umbigo, barriga relaxada, a expirar.',
      channelId: 'peso',
      extra: { kind: 'cintura' },
      schedule: { ...base, on: { weekday: Number(s.cinturaDia) + 1, hour: c.h, minute: c.m } },
    });
  }

  // Fim do trabalho: troca da primeira cerveja
  if (s.notifCerveja) {
    for (let d = 1; d <= 6; d++) {
      const t = parseT(d === 6 ? s.cervejaSabado : s.cervejaHora);
      list.push({
        id: 4000 + d,
        title: '🍺 Antes da cerveja…',
        body: '500 ml de água ou infusão gelada primeiro. Depois decide.',
        channelId: 'cerveja',
        extra: { kind: 'cerveja' },
        schedule: { ...base, on: { weekday: d + 1, hour: t.h, minute: t.m } },
      });
    }
  }

  // Chás
  if (s.notifChas) {
    const m = parseT(s.chaManha), n = parseT(s.chaNoite);
    list.push({
      id: 5001, title: '🍵 Chá da manhã', body: 'Chá verde, gengibre ou moringa — sem açúcar.',
      channelId: 'chas', extra: { kind: 'cha' }, schedule: { ...base, on: { hour: m.h, minute: m.m } },
    });
    list.push({
      id: 5002, title: '🌿 Infusão da noite', body: 'Camomila, erva-príncipe ou funcho. Ajuda a dormir e a desinchar.',
      channelId: 'chas', extra: { kind: 'cha' }, schedule: { ...base, on: { hour: n.h, minute: n.m } },
    });
  }
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
