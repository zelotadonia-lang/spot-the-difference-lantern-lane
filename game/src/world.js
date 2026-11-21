// The game state: which screen is up, which level is being played, what has
// been found, how much time is left, and the score. Rendering reads this and
// nothing else; input writes to it through the methods below.
import { LEVELS, SCORE, STEP } from './config.js';
import { levelDifferences } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_LEVEL_DONE = 'levelDone';
export const SCREEN_WIN = 'win';
export const SCREEN_OVER = 'over';
export const SCREEN_PAUSED = 'paused';

export const EVENT_NONE = 0;
export const EVENT_FOUND = 1;
export const EVENT_WRONG = 2;
export const EVENT_LEVEL_DONE = 4;
export const EVENT_WIN = 8;
export const EVENT_OVER = 16;
export const EVENT_HINT = 32;

// A fresh world: title screen, level 1 ready behind it, no score yet.
export function createWorld() {
  return {
    screen: SCREEN_TITLE,
    levelIndex: 0,
    level: LEVELS[0],
    diffs: levelDifferences(0),
    found: new Set(),
    hinted: -1,
    hintTimer: 0,
    hintsLeft: SCORE.maxHints,
    timeLeft: LEVELS[0].seconds,
    score: 0,
    best: 0,
    levelBonus: 0,
    foundFlash: 0,
    wrongFlash: 0,
    wrongCount: 0,
    startedAt: 0,
    elapsed: 0,
    message: '',
    messageTimer: 0,
  };
}

export function resetWorld(world) {
  const fresh = createWorld();
  Object.assign(world, fresh);
}

// Start (or restart) a level: fresh differences, full clock, full hints.
export function startLevel(world, levelIndex) {
  world.levelIndex = levelIndex;
  world.level = LEVELS[levelIndex];
  world.diffs = levelDifferences(levelIndex);
  world.found = new Set();
  world.hinted = -1;
  world.hintTimer = 0;
  world.hintsLeft = SCORE.maxHints;
  world.timeLeft = world.level.seconds;
  world.elapsed = 0;
  world.screen = SCREEN_PLAY;
  world.message = '';
  world.messageTimer = 0;
}

export function startGame(world) {
  world.score = 0;
  world.wrongCount = 0;
  startLevel(world, 0);
}

// How many differences are still unfound on this level.
export function remaining(world) {
  return world.diffs.length - world.found.size;
}

// The right panel shows every difference; the left shows none. The set the
// painter receives is what makes the two pictures differ.
export function appliedDiffs(world) {
  const all = new Set();
  for (let i = 0; i < world.diffs.length; i += 1) all.add(i);
  return all;
}

// Click at panel coordinates (x, y inside one 560 by 452 panel). A click on
// either panel counts: the pictures are the same size and the differences sit
// in the same place on both. Returns an event flag.
export function clickAt(world, x, y) {
  if (world.screen !== SCREEN_PLAY) return EVENT_NONE;
  for (let i = 0; i < world.diffs.length; i += 1) {
    if (world.found.has(i)) continue;
    const d = world.diffs[i];
    const dx = x - d.x;
    const dy = y - d.y;
    if (dx * dx + dy * dy <= d.r * d.r) {
      world.found.add(i);
      world.score += SCORE.found;
      world.foundFlash = 0.45;
      world.message = `Ketemu: ${d.label}`;
      world.messageTimer = 1.6;
      if (world.hinted === i) {
        world.hinted = -1;
        world.hintTimer = 0;
      }
      if (remaining(world) === 0) return finishLevel(world);
      return EVENT_FOUND;
    }
  }
  world.score = Math.max(0, world.score + SCORE.wrongClick);
  world.timeLeft = Math.max(0, world.timeLeft - SCORE.wrongTime);
  world.wrongFlash = 0.4;
  world.wrongCount += 1;
  world.message = 'Bukan itu. -3 detik';
  world.messageTimer = 1.4;
  if (world.timeLeft <= 0) return endGame(world, false);
  return EVENT_WRONG;
}

// Spend one hint: briefly ring a difference that is still unfound.
export function useHint(world) {
  if (world.screen !== SCREEN_PLAY) return EVENT_NONE;
  if (world.hintsLeft <= 0 || world.hintTimer > 0) return EVENT_NONE;
  const left = [];
  for (let i = 0; i < world.diffs.length; i += 1) {
    if (!world.found.has(i)) left.push(i);
  }
  if (left.length === 0) return EVENT_NONE;
  const pick = left[Math.floor(left.length / 2)];
  world.hinted = pick;
  world.hintTimer = 2.6;
  world.hintsLeft -= 1;
  world.score = Math.max(0, world.score - SCORE.hintCost);
  world.message = 'Petunjuk: cari cincin ungu';
  world.messageTimer = 1.6;
  return EVENT_HINT;
}

function finishLevel(world) {
  world.levelBonus = Math.round(world.timeLeft) * SCORE.levelTimeBonus;
  world.score += world.levelBonus;
  if (world.levelIndex + 1 >= LEVELS.length) {
    world.screen = SCREEN_WIN;
    world.best = Math.max(world.best, world.score);
    return EVENT_WIN;
  }
  world.screen = SCREEN_LEVEL_DONE;
  return EVENT_LEVEL_DONE;
}

export function nextLevel(world) {
  startLevel(world, world.levelIndex + 1);
}

function endGame(world, won) {
  world.screen = won ? SCREEN_WIN : SCREEN_OVER;
  world.best = Math.max(world.best, world.score);
  return won ? EVENT_WIN : EVENT_OVER;
}

// Advance the clock and the short-lived effects by one fixed step.
export function stepWorld(world, dt) {
  if (world.screen !== SCREEN_PLAY) return EVENT_NONE;
  world.elapsed += dt;
  world.timeLeft -= dt;
  if (world.foundFlash > 0) world.foundFlash = Math.max(0, world.foundFlash - dt);
  if (world.wrongFlash > 0) world.wrongFlash = Math.max(0, world.wrongFlash - dt);
  if (world.messageTimer > 0) world.messageTimer = Math.max(0, world.messageTimer - dt);
  if (world.hintTimer > 0) {
    world.hintTimer = Math.max(0, world.hintTimer - dt);
    if (world.hintTimer === 0) world.hinted = -1;
  }
  if (world.timeLeft <= 0) {
    world.timeLeft = 0;
    return endGame(world, false);
  }
  return EVENT_NONE;
}

export function togglePause(world) {
  if (world.screen === SCREEN_PLAY) {
    world.screen = SCREEN_PAUSED;
  } else if (world.screen === SCREEN_PAUSED) {
    world.screen = SCREEN_PLAY;
  }
}

// Seconds shown on the clock, never negative, never a fraction.
export function clockSeconds(world) {
  return Math.max(0, Math.ceil(world.timeLeft));
}

export { STEP };
