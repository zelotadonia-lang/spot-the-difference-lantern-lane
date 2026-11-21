// Design tokens for Lantern Lane, in three layers: raw values, what they mean
// in the game, and how each piece of the interface uses them. The look comes
// from the ui-ux-pro-max search for this game: claymorphism, chunky rounded
// shapes, thick borders, soft shadows, warm lantern colours on a night sky.
// Text stays on the light side of the contrast rule: cream on deep indigo is
// above 4.5 to 1, and no label is smaller than 13px at the 1280 by 720 frame.
export const TOKENS = {
  // Layer 1: raw values.
  primitive: {
    ink: '#17122b',
    night: '#241b3a',
    nightDeep: '#120d24',
    paper: '#fdf2f8',
    cream: '#fff7e6',
    cloud: '#b8b0d6',
    lanternRed: '#e5484d',
    lanternPink: '#ec4899',
    lanternGold: '#f59e0b',
    lanternViolet: '#8b5cf6',
    lanternTeal: '#2dd4bf',
    leaf: '#4ade80',
    danger: '#dc2626',
  },
  // Layer 2: meaning.
  semantic: {
    background: '#17122b',
    backgroundDeep: '#120d24',
    panel: '#241b3a',
    panelBorder: '#f59e0b',
    hudSurface: '#2e2450',
    hudBorder: '#4c3d7d',
    text: '#fff7e6',
    textMuted: '#b8b0d6',
    accent: '#f59e0b',
    accentText: '#17122b',
    found: '#4ade80',
    hint: '#8b5cf6',
    danger: '#dc2626',
    timerFull: '#4ade80',
    timerLow: '#e5484d',
  },
  // Layer 3: components.
  component: {
    panelRadius: 18,
    panelBorderWidth: 4,
    hudRadius: 16,
    buttonRadius: 14,
    markerWidth: 5,
    markerRadius: 26,
    fontStack: '"Trebuchet MS", "Segoe UI", Verdana, sans-serif',
    fontTitle: 44,
    fontHud: 20,
    fontSmall: 14,
  },
};

// The frame the game draws into. The canvas scales to the browser window,
// the drawing coordinates never change.
export const VIEW = { width: 1280, height: 720 };

// One panel of the pair. Both panels share the same size; the left starts at
// x 40, the right at x 680, leaving an 80px lane between them for the divider.
export const PANEL = { width: 560, height: 452, y: 132, leftX: 40, rightX: 680 };
export const HUD = { height: 104, margin: 24 };
export const FOOTER = { y: 612, height: 84 };

// A level: its name, the seconds on its clock, how many differences it hides,
// and the seed its scene is painted from. The seed is fixed, so the same
// level always paints the same picture.
export const LEVELS = [
  { name: 'Gang Lentera', place: 'Pasar malam', seconds: 150, diffs: 8, seed: 11 },
  { name: 'Taman Karang', place: 'Bawah laut', seconds: 135, diffs: 10, seed: 23 },
  { name: 'Bengkel Jarum Jam', place: 'Ruang kerja', seconds: 120, diffs: 12, seed: 37 },
];

export const SCORE = {
  found: 100,
  wrongClick: -10,
  wrongTime: 3,
  hintCost: 50,
  levelTimeBonus: 5,
  maxHints: 3,
};

// Fixed step for the game loop, in seconds.
export const STEP = 1 / 60;
