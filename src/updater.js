// Atualizações: conteúdo web por OTA (sem confirmação) e aviso de APK nova (quando muda algo nativo).
import { Capacitor } from '@capacitor/core';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { LocalNotifications } from '@capacitor/local-notifications';
import { NATIVE, WEB } from './version.js';

const BASE = 'https://raw.githubusercontent.com/glamdj/killbelly-updates/main/';
export const status = { native: NATIVE, web: WEB, latest: null, apkUrl: null, pending: null, checking: false, error: null, lastCheck: 0 };

export async function appReady() {
  if (!Capacitor.isNativePlatform()) return;
  try { await CapacitorUpdater.notifyAppReady(); } catch {}
}

export async function checkUpdates({ manual = false } = {}) {
  if (status.checking) return status;
  status.checking = true; status.error = null;
  try {
    const r = await fetch(`${BASE}latest.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const L = await r.json();
    status.latest = L; status.lastCheck = Date.now();
    if (L.native > NATIVE) {
      status.apkUrl = BASE + L.apk;
      const seen = Number(localStorage.getItem('kb.apkNotified') || 0);
      if (Capacitor.isNativePlatform() && (manual || seen < L.native)) {
        localStorage.setItem('kb.apkNotified', String(L.native));
        await LocalNotifications.schedule({ notifications: [{
          id: 9100, title: '⬆️ Nova versão do KillBelly',
          body: `${L.notes || 'Melhorias'} — toque para instalar.`,
          channelId: 'treino', extra: { kind: 'apk' }, schedule: { at: new Date(Date.now() + 1500), allowWhileIdle: true },
        }] }).catch(() => {});
      }
    } else if (L.minNative <= NATIVE && L.web > WEB && Capacitor.isNativePlatform()) {
      const b = await CapacitorUpdater.download({ url: BASE + L.zip, version: String(L.web), checksum: L.sha256 });
      await CapacitorUpdater.next({ id: b.id });
      status.pending = { id: b.id, web: L.web, notes: L.notes };
    }
  } catch (e) { status.error = String(e.message || e); }
  status.checking = false;
  return status;
}

// Aplica já o conteúdo descarregado (a app recarrega)
export async function applyNow() {
  if (status.pending) await CapacitorUpdater.set({ id: status.pending.id });
}

export function openApk() {
  if (status.apkUrl) window.location.href = status.apkUrl;
}
