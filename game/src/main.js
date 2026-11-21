// Boot: fit the 1280 by 720 frame to the window, wire input and sound, run a
// fixed-step loop, and stage a screenshot scene when the page opens with
// ?shot=start|play|play2|end.
import { VIEW, STEP } from './config.js';
import { SoundBank } from './audio.js';
import { drawGame } from './render.js';
import { attachInput } from './input.js';
import { stageShot } from './shots.js';
import {
  EVENT_FOUND, EVENT_WRONG, EVENT_LEVEL_DONE, EVENT_WIN, EVENT_OVER,
  EVENT_HINT, createWorld, stepWorld,
} from './world.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');
const sounds = new SoundBank();
const world = createWorld();

// Keep the frame's proportions whatever the window size.
function fitCanvas() {
  const scale = Math.min(window.innerWidth / VIEW.width, window.innerHeight / VIEW.height);
  canvas.width = VIEW.width;
  canvas.height = VIEW.height;
  canvas.style.width = `${Math.floor(VIEW.width * scale)}px`;
  canvas.style.height = `${Math.floor(VIEW.height * scale)}px`;
}
window.addEventListener('resize', fitCanvas);
fitCanvas();

// Announce the state for screen readers, in one short line.
function announce() {
  if (!status) return;
  const left = world.diffs.length - world.found.size;
  status.textContent =
    world.screen === 'play'
      ? `Level ${world.levelIndex + 1}, ${left} perbedaan tersisa, skor ${world.score}`
      : world.screen;
}

// Map a world event to its sound.
function playEvent(flag) {
  sounds.unlock();
  if (flag & EVENT_FOUND) sounds.found();
  else if (flag & EVENT_WRONG) sounds.wrong();
  else if (flag & EVENT_HINT) sounds.hint();
  else if (flag & EVENT_WIN) sounds.win();
  else if (flag & EVENT_LEVEL_DONE) sounds.levelClear();
  else if (flag & EVENT_OVER) sounds.timeUp();
  else if (flag === 64) sounds.click();
  announce();
}

attachInput(canvas, world, playEvent);
window.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'm') {
    sounds.unlock();
    sounds.toggleMute();
  }
});

// A screenshot scene freezes the world where the shot stages it: no clock,
// no loop advance, just the one frame.
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
let frozen = false;
if (shot) {
  stageShot(shot, world);
  frozen = true;
  drawGame(ctx, world, 1000);
  announce();
}

// The live game: fixed steps, then one draw per animation frame.
let last = performance.now();
let accumulator = 0;
function frame(now) {
  const elapsed = Math.min(0.25, (now - last) / 1000);
  last = now;
  if (!frozen) {
    accumulator += elapsed;
    while (accumulator >= STEP) {
      stepWorld(world, STEP);
      accumulator -= STEP;
    }
    drawGame(ctx, world, now);
  }
  requestAnimationFrame(frame);
}
if (!frozen) requestAnimationFrame(frame);
