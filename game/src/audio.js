// audio.js — tiny WebAudio synth for game sounds. No audio files, no network.
// Everything is an oscillator + gain envelope, created lazily on first user
// gesture so browsers allow it.

let ctx = null;
let muted = false;

export function ensureAudio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function setMuted(m) { muted = m; }
export function isMuted() { return muted; }

function tone(freq, at, dur, type, vol, slideTo) {
  if (!ctx || muted) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + at);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + at + dur);
  gain.gain.setValueAtTime(0.0001, ctx.currentTime + at);
  gain.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + at + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(ctx.currentTime + at);
  osc.stop(ctx.currentTime + at + dur + 0.05);
}

// Bright two-note chime when a difference is found; pitch climbs with combo.
export function playFind(combo) {
  if (!ensureAudio()) return;
  const base = 660 * Math.pow(1.059, Math.min(combo, 8));
  tone(base, 0, 0.16, 'sine', 0.22);
  tone(base * 1.5, 0.09, 0.22, 'sine', 0.2);
  tone(base * 2, 0.16, 0.18, 'triangle', 0.08);
}

// Soft low buzz + pitch drop for a wrong click.
export function playWrong() {
  if (!ensureAudio()) return;
  tone(180, 0, 0.22, 'sawtooth', 0.1, 110);
}

// Gentle pluck when a hint is used.
export function playHint() {
  if (!ensureAudio()) return;
  tone(520, 0, 0.12, 'triangle', 0.14);
  tone(780, 0.08, 0.16, 'triangle', 0.12);
}

// Short rising arpeggio for a level clear.
export function playWin() {
  if (!ensureAudio()) return;
  [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.3, 'triangle', 0.18));
}

// Descending phrase for game over.
export function playLose() {
  if (!ensureAudio()) return;
  [392, 330, 262, 196].forEach((f, i) => tone(f, i * 0.14, 0.3, 'sine', 0.16));
}

// Tiny click for buttons and menu.
export function playClick() {
  if (!ensureAudio()) return;
  tone(880, 0, 0.06, 'sine', 0.1);
}
