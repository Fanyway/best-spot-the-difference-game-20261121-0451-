// render.js — draws the two panels, found markers, hint pulse, particles,
// floating score text and screen shake. Pure canvas; no DOM here.

import { drawScene, diffPosition, PANEL_W, PANEL_H } from './scenes.js';

export const PANEL_LEFT = { x: 10, y: 10 };
export const PANEL_RIGHT = { x: 650, y: 10 };
export const PANEL_GAP = 20;

const GOLD = '#ffd166';
const GOLD_DARK = '#b3541e';

// One burst of gold sparks plus a fading ring at a found difference.
export function makeBurst(x, y) {
  const parts = [];
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2 + Math.random() * 0.4;
    const sp = 90 + Math.random() * 160;
    parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.55 + Math.random() * 0.3, size: 2 + Math.random() * 3.5 });
  }
  return { x, y, parts, age: 0, ring: 0 };
}

export function drawPanels(ctx, levelIndex, state, now) {
  ctx.clearRect(0, 0, 1280, 560);
  // shake offset while the penalty shake is alive
  let sx = 0, sy = 0;
  if (state.shakeUntil > now) {
    const k = (state.shakeUntil - now) / 250;
    sx = (Math.random() - 0.5) * 10 * k;
    sy = (Math.random() - 0.5) * 10 * k;
  }
  ctx.save();
  ctx.translate(sx, sy);

  // panels
  drawScene(ctx, levelIndex, 0, PANEL_LEFT.x, PANEL_LEFT.y);
  drawScene(ctx, levelIndex, 1, PANEL_RIGHT.x, PANEL_RIGHT.y);

  // panel frames + labels
  for (const [panel, label] of [[PANEL_LEFT, 'A'], [PANEL_RIGHT, 'B']]) {
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 4;
    ctx.strokeRect(panel.x - 2, panel.y - 2, PANEL_W + 4, PANEL_H + 4);
    ctx.fillStyle = '#1c1a26';
    ctx.beginPath(); ctx.arc(panel.x + 26, panel.y + 26, 18, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffd166';
    ctx.font = '900 22px Trebuchet MS, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label, panel.x + 26, panel.y + 27);
  }

  // hint pulse rings (both panels, same difference)
  if (state.hint && state.hint.until > now) {
    const t = (state.hint.until - now) / 3000; // 1 -> 0
    const pulse = 1 + 0.18 * Math.sin(now / 130);
    const alpha = 0.35 + 0.65 * t;
    for (const panel of [PANEL_LEFT, PANEL_RIGHT]) {
      const p = diffPosition(state.hint.diff, panel === PANEL_LEFT ? 0 : 1);
      const cx = panel.x + p.x, cy = panel.y + p.y;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = GOLD; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(cx, cy, 34 * pulse, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, 26 * pulse, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
  }

  // found markers: gold ring + check on both panels
  for (const diff of state.found) {
    for (const [panel, pi] of [[PANEL_LEFT, 0], [PANEL_RIGHT, 1]]) {
      const p = diffPosition(diff, pi);
      const cx = panel.x + p.x, cy = panel.y + p.y;
      const born = diff.foundAt ?? now;
      const age = Math.min(1, (now - born) / 260); // pop-in scale
      const r = (diff.r + 6) * (0.7 + 0.3 * easeOutBack(age));
      ctx.save();
      ctx.strokeStyle = GOLD; ctx.lineWidth = 5;
      ctx.shadowColor = 'rgba(255,209,102,0.9)'; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.42, cy);
      ctx.lineTo(cx - r * 0.12, cy + r * 0.34);
      ctx.lineTo(cx + r * 0.46, cy - r * 0.34);
      ctx.stroke();
      ctx.restore();
    }
  }

  // particles
  for (const b of state.bursts) {
    for (const p of b.parts) {
      const age = (now - b.born) / 1000;
      if (age > p.life) continue;
      const px = p.x + p.vx * age;
      const py = p.y + p.vy * age + 120 * age * age;
      ctx.globalAlpha = 1 - age / p.life;
      ctx.fillStyle = GOLD;
      ctx.beginPath(); ctx.arc(px, py, p.size * (1 - age / p.life * 0.5), 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    const ringAge = Math.min(1, (now - b.born) / 420);
    ctx.strokeStyle = GOLD; ctx.lineWidth = 3 * (1 - ringAge);
    ctx.beginPath(); ctx.arc(b.x, b.y, 10 + ringAge * 46, 0, Math.PI * 2); ctx.stroke();
  }

  // floating "+100" texts
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const f of state.floats) {
    const age = (now - f.born) / 1000;
    if (age > 1) continue;
    ctx.globalAlpha = 1 - age;
    ctx.font = '900 26px Trebuchet MS, sans-serif';
    ctx.fillStyle = '#ffd166';
    ctx.fillText(f.text, f.x, f.y - age * 46);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

function easeOutBack(t) {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// Map a canvas click (CSS pixels, already scaled to canvas space) to a panel
// and panel-local point. Returns null when the click is in the gap.
export function pickPanel(canvasX, canvasY) {
  if (canvasY >= PANEL_LEFT.y && canvasY <= PANEL_LEFT.y + PANEL_H) {
    if (canvasX >= PANEL_LEFT.x && canvasX <= PANEL_LEFT.x + PANEL_W) {
      return { panel: 0, x: canvasX - PANEL_LEFT.x, y: canvasY - PANEL_LEFT.y };
    }
    if (canvasX >= PANEL_RIGHT.x && canvasX <= PANEL_RIGHT.x + PANEL_W) {
      return { panel: 1, x: canvasX - PANEL_RIGHT.x, y: canvasY - PANEL_RIGHT.y };
    }
  }
  return null;
}
