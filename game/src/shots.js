// shots.js — deterministic scenes for screenshots (?shot=cover|play|complete).
// Each shot freezes the countdown so the frame never changes, sets up a fixed
// game state, and raises window.__shotReady once the scene has rendered.
// No timers, no randomness: the same URL always renders the same frame.

import { LEVELS } from './scenes.js';
import * as ui from './ui.js';

// Mark diffs as found without sounds, toasts or score popups — pure state.
function markFound(api, levelIndex, count) {
  const level = LEVELS[levelIndex];
  const now = performance.now();
  for (let i = 0; i < count && i < level.diffs.length; i++) {
    api.state.found.push({ ...level.diffs[i], foundAt: now - 1000 });
  }
  ui.setCounter(api.state.found.length, level.diffs.length);
}

export function applyShot(api) {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot) return false;

  api.state.frozen = true;
  const now = performance.now();

  if (shot === 'cover') {
    // Level 1 mid-game: 3 differences found (gold rings visible), 4 still
    // hidden, counter reads "3 / 7", timer held at 62s.
    api.startLevel(0, false);
    markFound(api, 0, 3);
    api.state.score = 400;
    api.state.levelScore = 400;
    api.state.combo = 3;
    api.state.timeLeft = 62;
    ui.setScore(400);
    ui.setCombo(3);
    ui.setTimeLeft(62, 90);
  } else if (shot === 'play') {
    // Level 2 fresh hunt: 1 difference found, timer held at 74s.
    api.startLevel(1, true);
    markFound(api, 1, 1);
    api.state.score = 650;
    api.state.levelScore = 100;
    api.state.combo = 2;
    api.state.timeLeft = 74;
    ui.setScore(650);
    ui.setCombo(2);
    ui.setTimeLeft(74, 90);
  } else if (shot === 'complete') {
    // Level 1 cleared: all 7 found, level-clear screen with 3 stars.
    api.startLevel(0, false);
    markFound(api, 0, 7);
    api.state.score = 1450;
    api.state.levelScore = 750;
    api.state.timeLeft = 48;
    api.state.screen = 'complete';
    ui.setScore(1450);
    ui.setTimeLeft(48, 90);
    ui.showLevelComplete(LEVELS[0], 3, 750, 480, false,
      () => api.startLevel(1, true),
      () => api.startLevel(0, false));
  } else {
    return false;
  }

  // One painted frame, then signal readiness for the screenshot.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { window.__shotReady = true; });
  });
  return true;
}
