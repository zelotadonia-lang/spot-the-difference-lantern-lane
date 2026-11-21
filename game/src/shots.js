// The screenshot scenes behind ?shot=start|play|play2|end. Each one plays the
// real rules forward from a fresh world with a fixed seed, so the frame is
// what a short game really looks like and the same seed always gives the same
// frame. The autopilot clicks real differences through clickAt, never by
// drawing markers directly.
import { STEP } from './config.js';
import {
  SCREEN_TITLE, SCREEN_PLAY, SCREEN_LEVEL_DONE, SCREEN_WIN,
  createWorld, startLevel, clickAt, useHint, stepWorld, remaining,
} from './world.js';

// Advance the clock by `seconds` of fixed steps.
function advance(world, seconds) {
  const steps = Math.round(seconds / STEP);
  for (let i = 0; i < steps; i += 1) stepWorld(world, STEP);
}

// Click the first `count` differences of the current level, in list order.
function findSome(world, count) {
  for (let i = 0; i < count; i += 1) {
    const d = world.diffs[i];
    clickAt(world, d.x, d.y);
  }
}

// Play a whole level through, clicking every difference in list order.
function clearLevel(world) {
  for (let i = 0; i < world.diffs.length; i += 1) {
    clickAt(world, world.diffs[i].x, world.diffs[i].y);
  }
}

// Set `world` to the named scene and return the screen to draw and the best
// score to show. Unknown names stage the title.
export function stageShot(name, world) {
  const fresh = createWorld();
  Object.assign(world, fresh);
  if (name === 'play') {
    // Level 1, two differences found: six remain, rings on both panels.
    startLevel(world, 0);
    advance(world, 24);
    findSome(world, 2);
    useHint(world);
    return { screen: SCREEN_PLAY, best: world.best };
  }
  if (name === 'play2') {
    // Level 2, three differences found: seven remain.
    world.score = 200;
    startLevel(world, 1);
    advance(world, 31);
    findSome(world, 3);
    return { screen: SCREEN_PLAY, best: world.best };
  }
  if (name === 'end') {
    // All three levels cleared, so the win card shows with a real score.
    startLevel(world, 0);
    clearLevel(world);
    advance(world, 1);
    if (world.screen === SCREEN_LEVEL_DONE) {
      startLevel(world, 1);
      clearLevel(world);
      advance(world, 1);
    }
    if (world.screen === SCREEN_LEVEL_DONE) {
      startLevel(world, 2);
      clearLevel(world);
      advance(world, 1);
    }
    return { screen: world.screen === SCREEN_WIN ? SCREEN_WIN : SCREEN_PLAY, best: world.best };
  }
  // The title: level 1 behind the title band, clock untouched.
  startLevel(world, 0);
  world.screen = SCREEN_TITLE;
  world.timeLeft = world.level.seconds;
  return { screen: SCREEN_TITLE, best: 0 };
}

export { SCREEN_TITLE, SCREEN_PLAY, SCREEN_LEVEL_DONE, SCREEN_WIN, remaining };
