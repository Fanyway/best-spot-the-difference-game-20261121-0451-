// main.js — boot and game loop for DOUBLE TAKE.
// Owns the state machine (menu / playing / complete / gameover), mouse and
// keyboard input, the countdown, scoring and combos. Drawing lives in
// render.js, scenes in scenes.js, sounds in audio.js, DOM chrome in ui.js.

import { LEVELS, diffPosition } from './scenes.js';
import { drawPanels, pickPanel, makeBurst } from './render.js';
import * as audio from './audio.js';
import * as ui from './ui.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const WRONG_PENALTY_S = 3;
const MAX_COMBO = 5;

const state = {
  screen: 'menu', // menu | playing | complete | gameover
  levelIndex: 0,
  found: [],      // [{...diff, foundAt}]
  score: 0,
  levelScore: 0,
  combo: 1,
  hintsLeft: 3,
  timeLeft: 90,
  timeTotal: 90,
  bursts: [],
  floats: [],
  hint: null,     // { diff, until }
  shakeUntil: 0,
  frozen: false,  // shot mode: the timer never ticks
  doneLevels: new Set(),
};

let lastNow = 0;

// ---------- level flow ----------
function startLevel(index, keepScore) {
  const level = LEVELS[index];
  state.levelIndex = index;
  state.found = [];
  state.bursts = [];
  state.floats = [];
  state.hint = null;
  state.combo = 1;
  state.hintsLeft = 3;
  state.levelScore = 0;
  state.timeLeft = level.time;
  state.timeTotal = level.time;
  if (!keepScore) state.score = 0;
  state.screen = 'playing';
  ui.setLevelName(level.name);
  ui.setCounter(0, level.diffs.length);
  ui.setScore(state.score);
  ui.setCombo(1);
  ui.setTimeLeft(state.timeLeft, state.timeTotal);
  ui.setHintsLeft(state.hintsLeft);
  ui.buildLevelDots(LEVELS.length, index, state.doneLevels);
  ui.hideOverlay();
  ui.hideToast();
}

function levelComplete() {
  const level = LEVELS[state.levelIndex];
  const timeBonus = Math.ceil(state.timeLeft) * 10;
  state.score += timeBonus;
  state.doneLevels.add(state.levelIndex);
  const stars = state.timeLeft > 45 ? 3 : state.timeLeft > 20 ? 2 : 1;
  const isLast = state.levelIndex === LEVELS.length - 1;
  state.screen = 'complete';
  audio.playWin();
  ui.setScore(state.score);
  ui.showLevelComplete(level, stars, state.levelScore, timeBonus, isLast,
    () => startLevel(state.levelIndex + 1, true),
    () => { state.doneLevels.clear(); startLevel(0, false); });
}

function gameOver() {
  const level = LEVELS[state.levelIndex];
  state.screen = 'gameover';
  audio.playLose();
  ui.showGameOver(level, state.found.length,
    () => startLevel(state.levelIndex, true),
    () => showMenu());
}

function showMenu() {
  state.screen = 'menu';
  state.doneLevels.clear();
  ui.setLevelName(LEVELS[0].name);
  ui.setCounter(0, 7);
  ui.setScore(0);
  ui.setCombo(1);
  ui.setTimeLeft(LEVELS[0].time, LEVELS[0].time);
  ui.setHintsLeft(3);
  ui.buildLevelDots(LEVELS.length, 0, state.doneLevels);
  ui.showMenu(() => { audio.ensureAudio(); audio.playClick(); startLevel(0, false); });
}

// ---------- input ----------
function handleClick(clientX, clientY) {
  if (state.screen !== 'playing') return;
  audio.ensureAudio();
  const rect = canvas.getBoundingClientRect();
  const x = (clientX - rect.left) * (canvas.width / rect.width);
  const y = (clientY - rect.top) * (canvas.height / rect.height);
  const pick = pickPanel(x, y);
  if (!pick) return;
  const level = LEVELS[state.levelIndex];
  const now = performance.now();

  for (const diff of level.diffs) {
    if (state.found.some((f) => f.id === diff.id)) continue;
    const p = diffPosition(diff, pick.panel);
    const dx = pick.x - p.x, dy = pick.y - p.y;
    if (dx * dx + dy * dy <= diff.r * diff.r) {
      foundDifference(diff, pick.panel, now);
      return;
    }
  }
  wrongClick(now);
}

function foundDifference(diff, panel, now) {
  const found = { ...diff, foundAt: now };
  state.found.push(found);
  const points = 100 + 50 * (state.combo - 1);
  state.score += points;
  state.levelScore += points;
  // burst + floating text on both panels
  for (const pi of [0, 1]) {
    const p = diffPosition(diff, pi);
    const panelX = pi === 0 ? 10 : 650;
    const burst = makeBurst(panelX + p.x, 10 + p.y);
    burst.born = now;
    state.bursts.push(burst);
  }
  const p0 = diffPosition(diff, 0);
  state.floats.push({ x: 10 + p0.x, y: 10 + p0.y - 30, text: '+' + points, born: now });
  state.combo = Math.min(state.combo + 1, MAX_COMBO);
  audio.playFind(state.combo);
  ui.setCounter(state.found.length, LEVELS[state.levelIndex].diffs.length);
  ui.setScore(state.score);
  ui.setCombo(state.combo);
  ui.showToast(diff.label);
  if (state.found.length === LEVELS[state.levelIndex].diffs.length) {
    setTimeout(levelComplete, 650);
  }
}

function wrongClick(now) {
  state.timeLeft = Math.max(0, state.timeLeft - WRONG_PENALTY_S);
  state.combo = 1;
  state.shakeUntil = now + 250;
  audio.playWrong();
  ui.setCombo(1);
  ui.setTimeLeft(state.timeLeft, state.timeTotal);
  ui.showToast('−' + WRONG_PENALTY_S + 's — not there!', true);
  if (state.timeLeft <= 0) gameOver();
}

function useHint() {
  if (state.screen !== 'playing') return;
  if (state.hintsLeft <= 0) return;
  const level = LEVELS[state.levelIndex];
  const remaining = level.diffs.filter((d) => !state.found.some((f) => f.id === d.id));
  if (remaining.length === 0) return;
  audio.ensureAudio();
  const diff = remaining[Math.floor(Math.random() * remaining.length)];
  state.hint = { diff, until: performance.now() + 3000 };
  state.hintsLeft -= 1;
  audio.playHint();
  ui.setHintsLeft(state.hintsLeft);
}

// ---------- keyboard ----------
window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (k === 'h') useHint();
  else if (k === 'r') {
    if (state.screen === 'complete' && state.levelIndex === LEVELS.length - 1) {
      state.doneLevels.clear(); startLevel(0, false);
    } else if (state.screen === 'gameover' || state.screen === 'complete' || state.screen === 'playing') {
      startLevel(state.levelIndex, state.screen !== 'playing');
    }
  } else if (k === 'n') {
    if (state.screen === 'complete' && state.levelIndex < LEVELS.length - 1) {
      startLevel(state.levelIndex + 1, true);
    }
  }
});

canvas.addEventListener('click', (e) => handleClick(e.clientX, e.clientY));
ui.bindHintButton(useHint);

// ---------- main loop ----------
function frame(now) {
  const dt = lastNow ? (now - lastNow) / 1000 : 0;
  lastNow = now;

  if (state.screen === 'playing' && !state.frozen) {
    state.timeLeft -= dt;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      ui.setTimeLeft(0, state.timeTotal);
      gameOver();
    } else {
      ui.setTimeLeft(state.timeLeft, state.timeTotal);
    }
  }
  // prune spent effects
  state.bursts = state.bursts.filter((b) => now - b.born < 900);
  state.floats = state.floats.filter((f) => now - f.born < 1000);
  if (state.hint && state.hint.until <= now) state.hint = null;

  drawPanels(ctx, state.levelIndex, state, now);
  requestAnimationFrame(frame);
}

// ---------- boot ----------
showMenu();
// Deterministic screenshot scenes (?shot=cover|play|complete) and the
// window.__game handle used by automated play-tests.
const api = {
  state,
  startLevel,
  useHint,
  showMenu,
  handleClick,
  levelComplete,
  gameOver,
};
window.__game = api;
applyShot(api);
requestAnimationFrame(frame);
