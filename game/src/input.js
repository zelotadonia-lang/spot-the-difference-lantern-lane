// Pointer and keyboard input. The canvas is scaled to the window, so a click
// is mapped back into the 1280 by 720 frame first, then into panel space:
// whichever panel the click lands in, the same panel coordinates are tested,
// because the differences sit in the same place on both pictures.
import { VIEW, PANEL } from './config.js';
import {
  SCREEN_TITLE, SCREEN_PLAY, SCREEN_LEVEL_DONE, SCREEN_WIN, SCREEN_OVER,
  SCREEN_PAUSED, clickAt, useHint, startGame, nextLevel, togglePause,
  startLevel,
} from './world.js';

// Convert a browser click on the canvas into frame coordinates.
export function toFrame(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * VIEW.width,
    y: ((clientY - rect.top) / rect.height) * VIEW.height,
  };
}

// Which panel a frame point falls in, with its panel-local coordinates.
// Returns null outside both panels.
export function toPanel(frameX, frameY) {
  if (frameY < PANEL.y || frameY > PANEL.y + PANEL.height) return null;
  if (frameX >= PANEL.leftX && frameX <= PANEL.leftX + PANEL.width) {
    return { x: frameX - PANEL.leftX, y: frameY - PANEL.y };
  }
  if (frameX >= PANEL.rightX && frameX <= PANEL.rightX + PANEL.width) {
    return { x: frameX - PANEL.rightX, y: frameY - PANEL.y };
  }
  return null;
}

// Handle a click. Returns the world event flag, so main.js can play a sound.
export function handleClick(world, canvas, clientX, clientY) {
  const frame = toFrame(canvas, clientX, clientY);
  const panel = toPanel(frame.x, frame.y);
  if (panel === null) return 0;
  return clickAt(world, panel.x, panel.y);
}

// Handle a key. Returns the world event flag.
export function handleKey(world, key) {
  const k = key.toLowerCase();
  if (k === 'enter') {
    if (world.screen === SCREEN_TITLE || world.screen === SCREEN_WIN) {
      startGame(world);
      return 64;
    }
    if (world.screen === SCREEN_LEVEL_DONE) {
      nextLevel(world);
      return 64;
    }
    if (world.screen === SCREEN_OVER) {
      startLevel(world, world.levelIndex);
      return 64;
    }
    return 0;
  }
  if (k === 'h') return useHint(world);
  if (k === 'p' || k === 'escape') {
    togglePause(world);
    return 64;
  }
  if (k === 'r') {
    if (
      world.screen === SCREEN_PLAY ||
      world.screen === SCREEN_OVER ||
      world.screen === SCREEN_PAUSED
    ) {
      startLevel(world, world.levelIndex);
      return 64;
    }
    return 0;
  }
  return 0;
}

// Wire the canvas and the keyboard up. `onEvent` receives each event flag.
export function attachInput(canvas, world, onEvent) {
  canvas.addEventListener('pointerdown', (event) => {
    const flag = handleClick(world, canvas, event.clientX, event.clientY);
    onEvent(flag);
  });
  window.addEventListener('keydown', (event) => {
    if (['Enter', ' '].includes(event.key)) event.preventDefault();
    const flag = handleKey(world, event.key);
    onEvent(flag);
  });
}
