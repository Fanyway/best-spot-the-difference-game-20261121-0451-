// scenes.js — the three hand-drawn scenes and their difference specs.
// Every scene is drawn twice by one function: variant 0 is the left panel,
// variant 1 is the right panel with the 7 differences applied. All art is
// procedural canvas 2D — no images, no fonts loaded from anywhere.

export const PANEL_W = 620;
export const PANEL_H = 540;

export const LEVELS = [
  {
    name: 'Sunset Market',
    sub: 'Level 1 · Warm-up',
    time: 90,
    diffs: [
      { id: 'cat',     kind: 'missing', x: 430, y: 288, r: 34, label: 'The market cat vanished' },
      { id: 'sun',     kind: 'color',   x: 110, y: 110, r: 56, label: 'The sun changed colour' },
      { id: 'balloon', kind: 'extra',   x: 556, y: 150, r: 30, label: 'An extra balloon appeared' },
      { id: 'flag',    kind: 'flipped', x: 122, y: 152, r: 30, label: 'The stall flag flipped' },
      { id: 'apples',  kind: 'size',    x: 172, y: 330, r: 36, label: 'The apples grew bigger' },
      { id: 'bird',    kind: 'moved',   x: 522, y: 176, x2: 150, y2: 176, r: 30, label: 'The bird moved across the awning' },
      { id: 'rug',     kind: 'pattern', x: 310, y: 445, r: 40, label: 'The rug pattern changed' },
    ],
  },
  {
    name: 'Coral Reef',
    sub: 'Level 2 · Deeper water',
    time: 90,
    diffs: [
      { id: 'starfish', kind: 'missing', x: 150, y: 472, r: 32, label: 'The starfish is gone' },
      { id: 'bluefish', kind: 'color',   x: 420, y: 140, r: 34, label: 'The blue fish turned purple' },
      { id: 'minnow',   kind: 'extra',   x: 92,  y: 222, r: 28, label: 'A little fish swam in' },
      { id: 'turtle',   kind: 'flipped', x: 350, y: 332, r: 38, label: 'The turtle turned around' },
      { id: 'chest',    kind: 'size',    x: 482, y: 462, r: 40, label: 'The treasure chest grew' },
      { id: 'anchor',   kind: 'moved',   x: 88,  y: 452, x2: 548, y2: 452, r: 34, label: 'The anchor slid across the sand' },
      { id: 'coral',    kind: 'pattern', x: 122, y: 382, r: 42, label: 'The coral pattern changed' },
    ],
  },
  {
    name: 'Night Train',
    sub: 'Level 3 · Last stop',
    time: 90,
    diffs: [
      { id: 'lamp',   kind: 'missing', x: 560, y: 318, r: 34, label: 'The lamp post disappeared' },
      { id: 'signal', kind: 'color',   x: 92,  y: 302, r: 30, label: 'The signal turned green' },
      { id: 'pine',   kind: 'extra',   x: 420, y: 356, r: 30, label: 'A pine tree sprouted' },
      { id: 'vane',   kind: 'flipped', x: 182, y: 268, r: 28, label: 'The weathervane flipped' },
      { id: 'moon',   kind: 'size',    x: 500, y: 100, r: 52, label: 'The moon got bigger' },
      { id: 'house',  kind: 'moved',   x: 182, y: 306, x2: 252, y2: 306, r: 36, label: 'The house moved down the hill' },
      { id: 'stripe', kind: 'pattern', x: 472, y: 384, r: 36, label: 'The engine stripe doubled' },
    ],
  },
];

// ---------- small drawing helpers ----------
function circle(ctx, x, y, r, fill) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill();
}
function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill();
}
function rr(ctx, x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
}
function star(ctx, x, y, r, fill) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? r : r * 0.45;
    const px = x + Math.cos(a) * rad, py = y + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
}
function poly(ctx, points, fill) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
}

function drawFish(ctx, x, y, s, flip, body, fin) {
  ctx.save(); ctx.translate(x, y); ctx.scale(flip ? -s : s, s);
  ellipse(ctx, 0, 0, 26, 14, body);                       // body
  poly(ctx, [[-24, 0], [-38, -12], [-38, 12]], fin);      // tail
  ellipse(ctx, 12, -4, 6, 3, 'rgba(255,255,255,0.35)');   // shine
  circle(ctx, 16, -3, 3, '#10243a');                       // eye
  ctx.restore();
}
function drawBird(ctx, x, y, s, body) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ellipse(ctx, 0, 0, 14, 9, body);
  circle(ctx, 11, -7, 7, body);
  poly(ctx, [[17, -8], [25, -5], [17, -3]], '#f5a623');   // beak
  circle(ctx, 13, -9, 2, '#10243a');
  poly(ctx, [[-2, -8], [-12, -20], [-4, -4]], body);      // wing
  ctx.restore();
}
function drawBalloon(ctx, x, y, s, color) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = '#5b4a3a'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 26); ctx.quadraticCurveTo(6, 44, 0, 58); ctx.stroke();
  ellipse(ctx, 0, 0, 20, 26, color);
  ellipse(ctx, -6, -8, 6, 9, 'rgba(255,255,255,0.4)');
  ctx.restore();
}
function drawCat(ctx, x, y, s, coat) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ellipse(ctx, 0, 8, 18, 13, coat);                        // body
  circle(ctx, 12, -8, 11, coat);                          // head
  poly(ctx, [[4, -16], [8, -26], [13, -15]], coat);       // ears
  poly(ctx, [[13, -16], [17, -26], [21, -15]], coat);
  ctx.strokeStyle = coat; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-16, 6); ctx.quadraticCurveTo(-30, -6, -26, -18); ctx.stroke(); // tail
  circle(ctx, 15, -10, 1.8, '#10243a');                   // eye
  poly(ctx, [[22, -7], [26, -5], [22, -3]], '#e88ca0');   // nose
  ctx.restore();
}

// ---------- scene 1: Sunset Market ----------
function drawMarket(ctx, v) {
  // sky
  const sky = ctx.createLinearGradient(0, 0, 0, 380);
  sky.addColorStop(0, '#ff9a5c'); sky.addColorStop(0.55, '#ff7e5f'); sky.addColorStop(1, '#ffd9a0');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, PANEL_W, 380);
  // sun (color difference)
  circle(ctx, 110, 110, 52, v === 1 ? '#ff5e62' : '#ffcf3f');
  circle(ctx, 110, 110, 40, v === 1 ? '#ff8a7a' : '#ffe27a');
  // clouds
  ctx.fillStyle = 'rgba(255,240,220,0.85)';
  ellipse(ctx, 330, 90, 62, 18, 'rgba(255,240,220,0.85)');
  ellipse(ctx, 360, 80, 44, 16, 'rgba(255,240,220,0.85)');
  ellipse(ctx, 500, 60, 48, 14, 'rgba(255,240,220,0.85)');
  // distant rooftops
  poly(ctx, [[0, 380], [0, 330], [70, 330], [110, 300], [150, 330], [220, 330], [260, 305], [300, 330], [620, 330], [620, 380]], '#c96f4a');
  // ground
  ctx.fillStyle = '#e8c491'; ctx.fillRect(0, 380, PANEL_W, 160);
  ctx.fillStyle = '#d9b47e';
  for (let gy = 392; gy < 540; gy += 26) for (let gx = (gy % 52 ? 0 : 24); gx < PANEL_W; gx += 48) {
    ellipse(ctx, gx + 18, gy + 10, 20, 9, '#d9b47e');
  }
  // rug (pattern difference)
  if (v === 1) {
    ctx.fillStyle = '#7fb069'; ctx.fillRect(240, 420, 140, 50);
    ctx.fillStyle = '#f5efe0';
    for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) ctx.fillRect(252 + i * 34, 428 + j * 24, 16, 12);
  } else {
    ctx.fillStyle = '#7fb069'; ctx.fillRect(240, 420, 140, 50);
    ctx.fillStyle = '#f5efe0';
    for (let i = 0; i < 5; i++) ctx.fillRect(246 + i * 28, 420, 10, 50);
  }
  // stall poles + counter
  ctx.fillStyle = '#8a5a33';
  ctx.fillRect(96, 210, 12, 180); ctx.fillRect(512, 210, 12, 180);
  rr(ctx, 80, 300, 460, 92, 10, '#a9713f');
  rr(ctx, 80, 300, 460, 16, 8, '#c98d54');
  // awning stripes
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#e63946' : '#f5efe0';
    ctx.fillRect(88 + i * 57, 178, 57, 62);
  }
  for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.arc(88 + i * 57 + 28, 240, 28, 0, Math.PI); ctx.fillStyle = i % 2 === 0 ? '#e63946' : '#f5efe0'; ctx.fill(); }
  // flag (flipped difference)
  ctx.fillStyle = '#8a5a33'; ctx.fillRect(116, 118, 5, 62);
  if (v === 1) poly(ctx, [[121, 122], [88, 134], [121, 146]], '#ffd166');
  else poly(ctx, [[121, 122], [154, 134], [121, 146]], '#ffd166');
  // bird (moved difference)
  drawBird(ctx, v === 1 ? 150 : 522, 176, 1, '#3d405b');
  // hanging sign
  ctx.strokeStyle = '#8a5a33'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(280, 240); ctx.lineTo(280, 258); ctx.moveTo(340, 240); ctx.lineTo(340, 258); ctx.stroke();
  rr(ctx, 248, 258, 124, 40, 8, '#fff3d6');
  ctx.fillStyle = '#3d405b'; ctx.font = 'bold 24px Trebuchet MS, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('MARKET', 310, 286);
  // lanterns
  for (const lx of [180, 310, 440]) {
    ctx.strokeStyle = '#8a5a33'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(lx, 240); ctx.lineTo(lx, 252); ctx.stroke();
    circle(ctx, lx, 264, 12, '#ff9f1c'); circle(ctx, lx, 264, 7, '#ffe08a');
  }
  // apple crate (size difference)
  rr(ctx, 128, 312, 92, 52, 6, '#7a4a21');
  const ar = v === 1 ? 14 : 9;
  for (const [ax, ay] of [[148, 330], [172, 326], [196, 330], [160, 344], [184, 344]]) circle(ctx, ax, ay, ar, '#e63946');
  circle(ctx, 148, 326, 3, 'rgba(255,255,255,0.5)');
  // orange crate
  rr(ctx, 400, 312, 92, 52, 6, '#7a4a21');
  for (const [ox, oy] of [[420, 330], [444, 326], [468, 330], [432, 344], [456, 344]]) circle(ctx, ox, oy, 9, '#ff9f1c');
  // cat (missing difference)
  if (v === 0) drawCat(ctx, 430, 288, 1, '#3d405b');
  // balloons
  drawBalloon(ctx, 470, 118, 1, '#e63946');
  drawBalloon(ctx, 522, 88, 0.85, '#4361ee');
  if (v === 1) drawBalloon(ctx, 556, 150, 0.8, '#06d6a0'); // extra balloon
  // flower pots on the counter ends
  circle(ctx, 104, 296, 12, '#06d6a0'); circle(ctx, 516, 296, 12, '#ef476f');
}

// ---------- scene 2: Coral Reef ----------
function drawReef(ctx, v) {
  const water = ctx.createLinearGradient(0, 0, 0, 540);
  water.addColorStop(0, '#2a9d8f'); water.addColorStop(0.5, '#1b6ca8'); water.addColorStop(1, '#0b3d66');
  ctx.fillStyle = water; ctx.fillRect(0, 0, PANEL_W, 540);
  // light rays
  ctx.fillStyle = 'rgba(255,255,220,0.10)';
  poly(ctx, [[120, 0], [180, 0], [260, 440], [180, 440]], 'rgba(255,255,220,0.10)');
  poly(ctx, [[380, 0], [420, 0], [520, 440], [460, 440]], 'rgba(255,255,220,0.08)');
  // sand
  ctx.fillStyle = '#e8cf9a'; ctx.fillRect(0, 440, PANEL_W, 100);
  ellipse(ctx, 200, 470, 90, 14, '#dfc083'); ellipse(ctx, 450, 500, 110, 16, '#dfc083');
  // pink coral (pattern difference)
  ctx.strokeStyle = '#ff6b9d'; ctx.lineWidth = 9; ctx.lineCap = 'round';
  for (const [bx, by, ex, ey] of [[122, 440, 100, 360], [122, 440, 122, 330], [122, 440, 146, 366], [122, 380, 96, 330], [122, 380, 148, 322]]) {
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo((bx + ex) / 2, (by + ey) / 2 - 20, ex, ey); ctx.stroke();
  }
  if (v === 1) {
    ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 3;
    for (const [sx, sy] of [[106, 372], [122, 356], [140, 372], [112, 344], [134, 336]]) {
      ctx.beginPath(); ctx.moveTo(sx - 8, sy); ctx.lineTo(sx + 8, sy); ctx.stroke();
    }
  } else {
    ctx.fillStyle = '#ffd166';
    for (const [dx, dy] of [[106, 372], [122, 356], [140, 372], [112, 344], [134, 336]]) circle(ctx, dx, dy, 4, '#ffd166');
  }
  // purple coral right
  ctx.strokeStyle = '#9b5de5'; ctx.lineWidth = 8; ctx.lineCap = 'round';
  for (const [bx, by, ex, ey] of [[520, 440, 500, 370], [520, 440, 524, 350], [520, 440, 548, 376]]) {
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo((bx + ex) / 2, (by + ey) / 2 - 16, ex, ey); ctx.stroke();
  }
  // orange coral center
  ctx.strokeStyle = '#f15bb5'; ctx.lineWidth = 7;
  for (const [bx, by, ex, ey] of [[320, 440, 300, 400], [320, 440, 322, 392], [320, 440, 342, 404]]) {
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo((bx + ex) / 2, (by + ey) / 2 - 12, ex, ey); ctx.stroke();
  }
  // seaweed
  ctx.strokeStyle = '#2a9d8f'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(58, 440); ctx.quadraticCurveTo(40, 380, 62, 330); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(566, 440); ctx.quadraticCurveTo(584, 390, 562, 340); ctx.stroke();
  // fish
  drawFish(ctx, 200, 180, 1, false, '#ff9f1c', '#e07b00');
  drawFish(ctx, 420, 140, 1, true, v === 1 ? '#9b5de5' : '#4361ee', v === 1 ? '#7a3fd1' : '#2f4bc7'); // color difference
  drawFish(ctx, 300, 262, 0.8, false, '#ffd166', '#e0a800');
  if (v === 1) drawFish(ctx, 92, 222, 0.6, false, '#06d6a0', '#039e77'); // extra fish
  // turtle (flipped difference)
  ctx.save(); ctx.translate(350, 332); ctx.scale(v === 1 ? -1 : 1, 1);
  ellipse(ctx, 0, 0, 30, 20, '#2a9d8f');
  circle(ctx, 34, -6, 10, '#2a9d8f'); circle(ctx, 37, -8, 2, '#10243a');
  ellipse(ctx, -28, 10, 10, 5, '#21867a'); ellipse(ctx, 28, 10, 10, 5, '#21867a');
  ellipse(ctx, -28, -10, 10, 5, '#21867a'); ellipse(ctx, 28, -10, 10, 5, '#21867a');
  ctx.restore();
  // bubbles
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2;
  for (const [bx, by, br] of [[500, 300, 8], [516, 278, 6], [492, 262, 10], [528, 240, 5], [470, 320, 6]]) {
    ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.stroke();
  }
  // starfish (missing difference)
  if (v === 0) star(ctx, 150, 472, 22, '#ff9f1c');
  // treasure chest (size difference)
  const cs = v === 1 ? 1.35 : 1;
  ctx.save(); ctx.translate(482, 462); ctx.scale(cs, cs);
  rr(ctx, -34, -14, 68, 30, 6, '#7a4a21');
  ctx.beginPath(); ctx.arc(0, -14, 34, Math.PI, 0); ctx.fillStyle = '#8a5a33'; ctx.fill();
  ctx.fillStyle = '#ffd166'; ctx.fillRect(-4, -22, 8, 16);
  circle(ctx, -22, 0, 5, '#ffd166'); circle(ctx, 22, 0, 5, '#ffd166');
  ctx.restore();
  // anchor (moved difference)
  const ax = v === 1 ? 548 : 88;
  ctx.save(); ctx.translate(ax, 452);
  ctx.strokeStyle = '#5b6b7a'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, -22); ctx.lineTo(0, 18); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-14, -14); ctx.lineTo(14, -14); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 26, 14, 0.3, Math.PI - 0.3); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -24, 6, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

// ---------- scene 3: Night Train ----------
function drawTrain(ctx, v) {
  const night = ctx.createLinearGradient(0, 0, 0, 420);
  night.addColorStop(0, '#0d1b3e'); night.addColorStop(1, '#274b7a');
  ctx.fillStyle = night; ctx.fillRect(0, 0, PANEL_W, 420);
  // stars
  ctx.fillStyle = '#ffffff';
  for (const [sx, sy, sr] of [[60, 60, 2], [140, 40, 2.5], [230, 80, 2], [300, 50, 2.5], [380, 90, 2], [430, 40, 2], [560, 180, 2], [80, 140, 2], [260, 130, 1.8], [340, 150, 2]]) circle(ctx, sx, sy, sr, '#ffffff');
  // moon (size difference)
  const mr = v === 1 ? 56 : 40;
  circle(ctx, 500, 100, mr, '#fff8d6');
  circle(ctx, 486, 92, 8, '#e8dcb0'); circle(ctx, 512, 112, 6, '#e8dcb0'); circle(ctx, 496, 118, 5, '#e8dcb0');
  // hills
  ctx.fillStyle = '#1d3a2f'; ctx.fillRect(0, 360, PANEL_W, 80);
  ellipse(ctx, 140, 380, 180, 46, '#234636'); ellipse(ctx, 480, 384, 200, 50, '#234636');
  // house (moved difference)
  const hx = v === 1 ? 252 : 182;
  ctx.save(); ctx.translate(hx, 306);
  rr(ctx, -34, -22, 68, 46, 4, '#5b4a68');
  poly(ctx, [[-40, -22], [0, -48], [40, -22]], '#3d2f4a');
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(-24, -8, 14, 14); ctx.fillRect(10, -8, 14, 14);
  // weathervane (flipped difference)
  ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, -48); ctx.lineTo(0, -64); ctx.stroke();
  if (v === 1) poly(ctx, [[0, -64], [-16, -59], [0, -54]], '#ffd166');
  else poly(ctx, [[0, -64], [16, -59], [0, -54]], '#ffd166');
  ctx.restore();
  // pine trees (extra difference)
  const pine = (px, py, s) => {
    ctx.save(); ctx.translate(px, py); ctx.scale(s, s);
    ctx.fillStyle = '#1d5c3f';
    poly(ctx, [[0, -46], [-22, 0], [22, 0]], '#1d5c3f');
    poly(ctx, [[0, -30], [-18, 8], [18, 8]], '#256b49');
    ctx.fillStyle = '#5b3a1e'; ctx.fillRect(-4, 6, 8, 14);
    ctx.restore();
  };
  pine(60, 356, 1); pine(330, 360, 0.85);
  if (v === 1) pine(420, 356, 0.9);
  // signal post (color difference)
  ctx.save(); ctx.translate(92, 302);
  ctx.fillStyle = '#3d3a4a'; ctx.fillRect(-3, -40, 6, 84);
  circle(ctx, 0, -46, 12, '#2a2836');
  circle(ctx, 0, -46, 8, v === 1 ? '#06d6a0' : '#ff3b30');
  ctx.restore();
  // lamp post (missing difference)
  if (v === 0) {
    ctx.save(); ctx.translate(560, 318);
    ctx.fillStyle = '#3d3a4a'; ctx.fillRect(-3, -58, 6, 100);
    circle(ctx, 0, -62, 10, '#ffe08a');
    const glow = ctx.createRadialGradient(0, -62, 4, 0, -62, 44);
    glow.addColorStop(0, 'rgba(255,224,138,0.5)'); glow.addColorStop(1, 'rgba(255,224,138,0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, -62, 44, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  // track
  ctx.fillStyle = '#3d2f24'; ctx.fillRect(0, 440, PANEL_W, 100);
  ctx.fillStyle = '#8a7a68';
  for (let tx = 0; tx < PANEL_W; tx += 34) ctx.fillRect(tx, 448, 20, 8);
  ctx.fillStyle = '#c9c9c9'; ctx.fillRect(0, 470, PANEL_W, 5); ctx.fillRect(0, 498, PANEL_W, 5);
  // train cars (behind engine)
  const car = (cx, body, stripe) => {
    rr(ctx, cx, 356, 96, 76, 8, body);
    ctx.fillStyle = '#ffd166';
    for (let i = 0; i < 3; i++) ctx.fillRect(cx + 14 + i * 28, 372, 18, 20);
    ctx.fillStyle = stripe; ctx.fillRect(cx, 404, 96, 8);
    circle(ctx, cx + 22, 434, 9, '#222'); circle(ctx, cx + 74, 434, 9, '#222');
  };
  car(60, '#4361ee', '#ffd166');
  car(168, '#e63946', '#ffd166');
  car(276, '#06a77d', '#ffd166');
  // locomotive (pattern difference: stripe)
  ctx.save(); ctx.translate(392, 0);
  rr(ctx, 0, 348, 128, 84, 10, '#2b2d42');
  ctx.fillStyle = '#ffd166'; ctx.fillRect(14, 362, 34, 22); // cab window
  ctx.fillStyle = '#8ecae6'; ctx.fillRect(66, 362, 44, 22); // front window
  ctx.fillStyle = '#ffd166';
  if (v === 1) { ctx.fillRect(0, 402, 128, 5); ctx.fillRect(0, 412, 128, 5); }
  else ctx.fillRect(0, 406, 128, 8);
  // chimney + smoke
  ctx.fillStyle = '#1a1b2e'; ctx.fillRect(96, 322, 18, 30);
  ctx.fillStyle = 'rgba(230,230,240,0.75)';
  circle(ctx, 118, 306, 10, 'rgba(230,230,240,0.75)');
  circle(ctx, 132, 292, 13, 'rgba(230,230,240,0.6)');
  circle(ctx, 148, 276, 16, 'rgba(230,230,240,0.45)');
  // headlight
  circle(ctx, 122, 392, 9, '#fff3b0');
  const beam = ctx.createLinearGradient(122, 392, 200, 392);
  beam.addColorStop(0, 'rgba(255,243,176,0.5)'); beam.addColorStop(1, 'rgba(255,243,176,0)');
  ctx.fillStyle = beam; poly(ctx, [[122, 384], [200, 372], [200, 412], [122, 400]], 'rgba(255,243,176,0.4)');
  circle(ctx, 24, 434, 9, '#222'); circle(ctx, 104, 434, 9, '#222');
  ctx.restore();
}

// ---------- public entry ----------
export function drawScene(ctx, levelIndex, variant, ox, oy) {
  ctx.save();
  ctx.translate(ox, oy);
  ctx.beginPath(); ctx.rect(0, 0, PANEL_W, PANEL_H); ctx.clip();
  if (levelIndex === 0) drawMarket(ctx, variant);
  else if (levelIndex === 1) drawReef(ctx, variant);
  else drawTrain(ctx, variant);
  ctx.restore();
}

// Hit position of a difference on a given panel (0 = left, 1 = right).
export function diffPosition(diff, panel) {
  if (panel === 1 && diff.x2 !== undefined) return { x: diff.x2, y: diff.y2 };
  return { x: diff.x, y: diff.y };
}
