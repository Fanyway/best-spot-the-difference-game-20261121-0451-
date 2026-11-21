// ui.js — the DOM chrome around the canvas: HUD numbers, timer bar, level
// dots, hint button, toast popups and the menu / level-clear / game-over
// overlay screens. The canvas itself is owned by render.js.

const $ = (id) => document.getElementById(id);

let toastTimer = null;

export function setLevelName(name) { $('level-name').textContent = name; }

export function setCounter(found, total) {
  $('found-count').textContent = String(found);
  $('total-count').textContent = String(total);
}

export function setScore(score) { $('score').textContent = String(score); }

export function setCombo(combo) {
  $('combo').textContent = '×' + Math.max(1, combo);
  $('combo-box').classList.toggle('hot', combo >= 3);
}

export function setTimeLeft(seconds, total) {
  const s = Math.max(0, Math.ceil(seconds));
  $('time-label').textContent = s + 's';
  const fill = $('timefill');
  fill.style.width = Math.max(0, (seconds / total) * 100) + '%';
  fill.classList.toggle('low', seconds <= 15);
}

export function setHintsLeft(n) {
  $('hints-left').textContent = '(' + n + ')';
  $('hint-btn').disabled = n <= 0;
}

export function buildLevelDots(count, current, done) {
  const box = $('level-dots');
  box.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const d = document.createElement('div');
    d.className = 'level-dot' + (done.has(i) ? ' done' : i === current ? ' now' : '');
    box.appendChild(d);
  }
}

export function showToast(text, bad) {
  const t = $('toast');
  t.textContent = text;
  t.classList.toggle('bad', !!bad);
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 750);
}

export function hideToast() {
  $('toast').classList.remove('show');
  clearTimeout(toastTimer);
}

function showOverlay() { $('overlay').classList.add('show'); }
export function hideOverlay() { $('overlay').classList.remove('show'); }

export function showMenu(onStart) {
  $('overlay-kicker').textContent = 'SPOT THE DIFFERENCE';
  $('overlay-title').textContent = 'DOUBLE TAKE';
  $('overlay-text').textContent =
    'Two pictures, side by side. They look the same — they are not. ' +
    'Find all 7 differences in each scene before the clock runs out.';
  $('overlay-stars').textContent = '';
  $('overlay-stats').innerHTML = '';
  $('overlay-btn').textContent = '▶ Start playing';
  $('overlay-foot').textContent = '3 scenes · 7 differences each · hints cost nothing but pride';
  $('overlay-btn').onclick = onStart;
  showOverlay();
}

export function showLevelComplete(level, stars, score, timeBonus, isLast, onNext, onReplay) {
  $('overlay-kicker').textContent = level.name.toUpperCase() + ' — CLEAR!';
  $('overlay-title').textContent = isLast ? 'YOU DID IT!' : 'LEVEL CLEAR';
  $('overlay-text').textContent = isLast
    ? 'Every difference in every scene, found. The twin scenes hold no more secrets from you.'
    : 'All 7 differences found. Take a breath — the next scene is trickier.';
  $('overlay-stars').textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
  $('overlay-stats').innerHTML =
    'Score this level: <b>' + score + '</b><br>Time bonus: <b>+' + timeBonus + '</b>';
  $('overlay-btn').textContent = isLast ? '↻ Play again' : '▶ Next scene (N)';
  $('overlay-foot').textContent = isLast ? 'Press R to play again' : 'Press N for the next scene';
  $('overlay-btn').onclick = isLast ? onReplay : onNext;
  showOverlay();
}

export function showGameOver(level, found, onRetry, onMenu) {
  $('overlay-kicker').textContent = level.name.toUpperCase() + ' — TIME UP';
  $('overlay-title').textContent = 'SO CLOSE!';
  $('overlay-text').textContent =
    'The clock ran out with ' + (7 - found) + ' difference' + (7 - found === 1 ? '' : 's') +
    ' still hiding. They were there all along — look again.';
  $('overlay-stars').textContent = '';
  $('overlay-stats').innerHTML = 'Found: <b>' + found + ' / 7</b>';
  $('overlay-btn').textContent = '↻ Try again (R)';
  $('overlay-foot').textContent = 'Press R to retry this scene';
  $('overlay-btn').onclick = onRetry;
  showOverlay();
}

export function bindHintButton(onHint) { $('hint-btn').onclick = onHint; }
