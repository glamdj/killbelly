// Treinador: temporizador com voz para séries, pausas, circuitos e intervalos.
import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { KeepAwake } from '@capacitor-community/keep-awake';

let voiceOn = true;
export const setVoice = (v) => { voiceOn = v; };

export function say(text) {
  if (!voiceOn || !text) return;
  if (Capacitor.isNativePlatform()) {
    TextToSpeech.stop().catch(() => {}).finally(() =>
      TextToSpeech.speak({ text, lang: 'pt-PT', rate: 1.05, pitch: 1.0, volume: 1.0, category: 'playback' }).catch(() => {}));
  } else if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = 'pt-PT'; window.speechSynthesis.speak(u);
  }
}

let actx = null;
function beep(freq = 880, ms = 140) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain();
    o.frequency.value = freq; o.connect(g); g.connect(actx.destination);
    g.gain.setValueAtTime(0.25, actx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + ms / 1000);
    o.start(); o.stop(actx.currentTime + ms / 1000);
  } catch {}
  try { navigator.vibrate && navigator.vibrate(80); } catch {}
}

// step: { kind: 'prep'|'work'|'rest', label, sec, say, mid: [{at, say}], onEnd }
let steps = [], idx = 0, endAt = 0, paused = null, timer = null, onFinish = null, spoken = {};
const bar = document.createElement('div');
bar.id = 'coach';
document.body.appendChild(bar);

const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
export const isRunning = () => steps.length > 0;

function draw() {
  document.body.classList.toggle('coaching', steps.length > 0);
  if (!steps.length) { bar.className = ''; bar.innerHTML = ''; return; }
  const st = steps[idx];
  const rem = st.manual ? Math.floor((Date.now() - endAt) / 1000) : paused != null ? paused : Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
  const pct = st.manual ? 0 : st.sec ? Math.min(100, ((st.sec - rem) / st.sec) * 100) : 0;
  const next = steps[idx + 1];
  bar.className = `on ${st.kind}`;
  bar.innerHTML = `<div class="c-top"><span class="c-kind">${st.kind === 'rest' ? 'Pausa' : st.kind === 'prep' ? 'Prepare-se' : st.manual ? 'Série — toque em Feito no fim' : 'Trabalho'}</span>
    <span class="c-step">${idx + 1}/${steps.length}</span></div>
    <div class="c-label">${st.label}</div>
    <div class="c-time">${fmt(rem)}</div>
    <div class="c-prog"><div style="width:${pct}%"></div></div>
    ${st.reps ? `<div class="c-reps">${st.reps} repetições</div>` : ''}
    ${next ? `<div class="c-next">A seguir: ${next.label}</div>` : ''}
    <div class="c-btns">${st.manual ? '<button data-c="skip" class="done">✓ Feito</button>' : `<button data-c="minus">−15 s</button><button data-c="pause">${paused != null ? '▶ Retomar' : '⏸ Pausa'}</button><button data-c="plus">+15 s</button><button data-c="skip">⏭</button>`}<button data-c="stop">✕</button></div>`;
}

function startStep(i) {
  idx = i; spoken = {};
  const st = steps[idx];
  endAt = st.manual ? Date.now() : Date.now() + st.sec * 1000; paused = null;
  if (st.say) say(st.say);
  beep(st.kind === 'work' ? 1040 : 660, 220);
  draw();
}

function finishStep() {
  const st = steps[idx];
  try { st.onEnd && st.onEnd(); } catch {}
  if (idx + 1 < steps.length) startStep(idx + 1);
  else end(true);
}

function tick() {
  if (!steps.length || paused != null) return;
  const st = steps[idx];
  if (st.manual) { draw(); return; }
  const rem = Math.ceil((endAt - Date.now()) / 1000);
  const elapsed = st.sec - rem;
  for (const m of st.mid || []) if (elapsed >= m.at && !spoken['m' + m.at]) { spoken['m' + m.at] = 1; say(m.say); beep(760, 160); }
  if (st.kind === 'rest' && st.sec >= 20 && rem === 10 && !spoken.t10) { spoken.t10 = 1; say('Dez segundos'); }
  if (rem <= 3 && rem >= 1 && !spoken['c' + rem]) { spoken['c' + rem] = 1; beep(880, 120); }
  if (rem <= 0) finishStep();
  else draw();
}

function end(completed) {
  clearInterval(timer); timer = null;
  const cb = onFinish; steps = []; onFinish = null; paused = null;
  draw();
  KeepAwake.allowSleep().catch(() => {});
  if (cb) cb(completed);
}

export function run(newSteps, finished) {
  if (timer) { clearInterval(timer); timer = null; }
  steps = newSteps.filter((s) => s.manual || s.sec > 0); onFinish = finished || null;
  if (!steps.length) { if (finished) finished(true); return; }
  KeepAwake.keepAwake().catch(() => {});
  startStep(0);
  timer = setInterval(tick, 250);
}
export const stop = () => end(false);

bar.addEventListener('click', (e) => {
  const b = e.target.closest('[data-c]'); if (!b || !steps.length) return;
  const c = b.dataset.c;
  if (c === 'stop') return end(false);
  if (c === 'skip') return finishStep();
  if (c === 'pause') {
    if (paused == null) { paused = Math.max(0, Math.ceil((endAt - Date.now()) / 1000)); say('Pausa'); }
    else { endAt = Date.now() + paused * 1000; paused = null; }
  }
  if (c === 'plus' || c === 'minus') {
    const d = c === 'plus' ? 15 : -15;
    if (paused != null) paused = Math.max(1, paused + d); else endAt = Math.max(Date.now() + 1000, endAt + d * 1000);
    steps[idx].sec = Math.max(1, steps[idx].sec + d);
  }
  draw();
});
