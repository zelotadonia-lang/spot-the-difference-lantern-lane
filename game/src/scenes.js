// The three scenes, painted fresh from code every frame. Nothing here is an
// image file: every roof, lantern, coral and gear is drawn with canvas paths
// from a fixed seed, so the left and right panels match exactly except for
// the differences the right panel applies.
//
// A difference is a small change the right panel paints on top of the same
// base picture: a colour swapped, an object added, an object left out, a
// shape moved. Each level lists its differences with a centre and a radius
// for the click test in input.js.
import { LEVELS } from './config.js';
import { mulberry32, range } from './random.js';

const W = 560;
const H = 452;

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// A paper lantern: a ribbed oval with a glow, hanging from a short string.
function lantern(ctx, x, y, r, colour, glow) {
  ctx.strokeStyle = '#3a2b1c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y - r - 14);
  ctx.lineTo(x, y - r);
  ctx.stroke();
  if (glow) {
    const halo = ctx.createRadialGradient(x, y, r * 0.4, x, y, r * 2.4);
    halo.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
    halo.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = halo;
    circle(ctx, x, y, r * 2.4);
  }
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 1.15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.lineWidth = 1.5;
  for (let i = -1; i <= 1; i += 1) {
    ctx.beginPath();
    ctx.ellipse(x, y, r * (0.55 + 0.18 * Math.abs(i)), r * 1.15, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = '#3a2b1c';
  ctx.fillRect(x - 5, y - r * 1.15 - 3, 10, 4);
  ctx.fillRect(x - 5, y + r * 1.15 - 1, 10, 4);
}

function starField(ctx, rng, count, top, bottom) {
  for (let i = 0; i < count; i += 1) {
    const x = range(rng, 6, W - 6);
    const y = range(rng, top, bottom);
    const r = range(rng, 0.8, 2.2);
    ctx.fillStyle = rng() < 0.2 ? '#f59e0b' : '#fff7e6';
    ctx.globalAlpha = range(rng, 0.4, 1);
    circle(ctx, x, y, r);
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------------------
// Level 1: Gang Lentera, a night market lane.
// ---------------------------------------------------------------------------
export function paintLanternLane(ctx, applied) {
  const rng = mulberry32(LEVELS[0].seed);
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#17122b');
  sky.addColorStop(0.55, '#2c1f56');
  sky.addColorStop(1, '#4a2b63');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  starField(ctx, rng, 42, 8, 150);

  // The moon, top right. Difference 0: full moon, or a crescent.
  ctx.fillStyle = '#ffeec2';
  circle(ctx, 486, 52, 30);
  if (applied.has(0)) {
    ctx.fillStyle = '#241b3a';
    circle(ctx, 498, 44, 26);
  }

  // Difference 7: a red balloon drifting over the left roofs.
  if (applied.has(7)) {
    ctx.strokeStyle = '#b8b0d6';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(96, 118);
    ctx.quadraticCurveTo(104, 138, 98, 156);
    ctx.stroke();
    ctx.fillStyle = '#e5484d';
    ctx.beginPath();
    ctx.ellipse(96, 100, 15, 19, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(96, 119);
    ctx.lineTo(90, 128);
    ctx.lineTo(102, 128);
    ctx.closePath();
    ctx.fill();
  }

  // Rooftops and the far buildings.
  ctx.fillStyle = '#1d1533';
  ctx.beginPath();
  ctx.moveTo(0, 210);
  ctx.lineTo(70, 168);
  ctx.lineTo(140, 210);
  ctx.lineTo(210, 172);
  ctx.lineTo(280, 210);
  ctx.lineTo(350, 176);
  ctx.lineTo(420, 210);
  ctx.lineTo(490, 170);
  ctx.lineTo(560, 210);
  ctx.lineTo(560, 300);
  ctx.lineTo(0, 300);
  ctx.closePath();
  ctx.fill();

  // Difference 6: the left building's window, lit warm or dark.
  ctx.fillStyle = applied.has(6) ? '#241b3a' : '#ffd166';
  ctx.fillRect(52, 218, 26, 34);
  ctx.fillStyle = applied.has(6) ? '#2c1f56' : '#ffe9a8';
  ctx.fillRect(52, 218, 26, 10);
  ctx.strokeStyle = '#17122b';
  ctx.lineWidth = 2;
  ctx.strokeRect(52, 218, 26, 34);
  ctx.beginPath();
  ctx.moveTo(65, 218);
  ctx.lineTo(65, 252);
  ctx.stroke();

  // A second small window, always dark, for contrast.
  ctx.fillStyle = '#241b3a';
  ctx.fillRect(428, 224, 22, 28);
  ctx.strokeStyle = '#17122b';
  ctx.lineWidth = 2;
  ctx.strokeRect(428, 224, 22, 28);

  // The street.
  const street = ctx.createLinearGradient(0, 300, 0, H);
  street.addColorStop(0, '#5b4636');
  street.addColorStop(1, '#3a2b1c');
  ctx.fillStyle = street;
  ctx.fillRect(0, 300, W, H - 300);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
  ctx.lineWidth = 2;
  for (let y = 318; y < H; y += 26) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // A string of lanterns across the lane.
  ctx.strokeStyle = '#17122b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 176);
  ctx.quadraticCurveTo(280, 214, 560, 176);
  ctx.stroke();
  const lanternSpots = [70, 168, 266, 364, 462];
  const lanternColours = ['#e5484d', '#f59e0b', '#e5484d', '#ec4899', '#f59e0b'];
  lanternSpots.forEach((x, i) => {
    const y = 176 + Math.sin((x / W) * Math.PI) * 26 + 16;
    // Difference 1: the middle lantern is teal instead of red.
    const colour = i === 2 && applied.has(1) ? '#2dd4bf' : lanternColours[i];
    lantern(ctx, x, y, 17, colour, true);
  });

  // Difference 2: the cat on the right roof.
  if (!applied.has(2)) {
    ctx.fillStyle = '#17122b';
    ctx.beginPath();
    ctx.moveTo(452, 176);
    ctx.quadraticCurveTo(448, 158, 462, 156);
    ctx.quadraticCurveTo(470, 150, 478, 158);
    ctx.quadraticCurveTo(492, 158, 490, 176);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(462, 156);
    ctx.lineTo(458, 144);
    ctx.lineTo(466, 154);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(476, 156);
    ctx.lineTo(480, 144);
    ctx.lineTo(484, 156);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(490, 170);
    ctx.quadraticCurveTo(504, 162, 500, 150);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#17122b';
    ctx.stroke();
  }

  paintStall(ctx, 24, 268, 168, '#e5484d', '#f59e0b', applied.has(3) ? '酒' : '茶');
  // Difference 4: the middle awning's stripes turn teal instead of gold.
  paintStall(ctx, 196, 252, 168, '#8b5cf6', applied.has(4) ? '#2dd4bf' : '#f59e0b', '面');
  paintStall(ctx, 368, 268, 168, '#2dd4bf', '#ec4899', '灯');

  // Difference 5: an extra plate of dumplings on the middle stall.
  if (applied.has(5)) {
    ctx.fillStyle = '#fff7e6';
    ctx.beginPath();
    ctx.ellipse(280, 402, 26, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f5e6c8';
    circle(ctx, 270, 396, 7);
    circle(ctx, 282, 394, 7);
    circle(ctx, 292, 397, 7);
  }

  // Crates and a basket by the left stall.
  ctx.fillStyle = '#7a5a34';
  ctx.fillRect(178, 408, 30, 26);
  ctx.strokeStyle = '#4a3419';
  ctx.lineWidth = 2;
  ctx.strokeRect(178, 408, 30, 26);
  ctx.beginPath();
  ctx.moveTo(178, 408);
  ctx.lineTo(208, 434);
  ctx.moveTo(208, 408);
  ctx.lineTo(178, 434);
  ctx.stroke();
  ctx.fillStyle = '#a8763e';
  ctx.beginPath();
  ctx.ellipse(150, 428, 22, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // A puddle catching the lantern light.
  ctx.fillStyle = 'rgba(245, 158, 11, 0.16)';
  ctx.beginPath();
  ctx.ellipse(330, 436, 70, 9, 0, 0, Math.PI * 2);
  ctx.fill();
}

// One market stall: striped awning, signboard, counter, goods.
function paintStall(ctx, x, y, w, awning, stripe, sign) {
  // Awning. Difference 3 (left stall) / 4 (middle stall): stripe colour.
  ctx.fillStyle = awning;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w - 12, y + 34);
  ctx.lineTo(x + 12, y + 34);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = stripe;
  for (let i = 0; i < 4; i += 1) {
    const sx = x + 14 + i * (w - 28) / 3.5;
    ctx.beginPath();
    ctx.moveTo(sx, y);
    ctx.lineTo(sx + 16, y);
    ctx.lineTo(sx + 12, y + 34);
    ctx.lineTo(sx - 4, y + 34);
    ctx.closePath();
    ctx.fill();
  }
  // Signboard with one painted character.
  ctx.fillStyle = '#3a2b1c';
  roundRect(ctx, x + w / 2 - 34, y + 42, 68, 34, 6);
  ctx.fill();
  ctx.fillStyle = '#fff7e6';
  ctx.font = 'bold 24px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(sign, x + w / 2, y + 60);
  // Counter and goods.
  ctx.fillStyle = '#6b4a2a';
  ctx.fillRect(x + 6, y + 84, w - 12, 52);
  ctx.fillStyle = '#8a6238';
  ctx.fillRect(x + 6, y + 84, w - 12, 8);
  ctx.fillStyle = '#e5484d';
  circle(ctx, x + 30, y + 76, 8);
  circle(ctx, x + 48, y + 76, 8);
  ctx.fillStyle = '#4ade80';
  circle(ctx, x + w - 34, y + 76, 8);
  circle(ctx, x + w - 52, y + 76, 8);
}

// ---------------------------------------------------------------------------
// Level 2: Taman Karang, a coral garden under the sea.
// ---------------------------------------------------------------------------
function coralBranch(ctx, x, y, len, angle, width, colour, depth) {
  if (depth === 0 || len < 8) return;
  const tipX = x + Math.cos(angle) * len;
  const tipY = y + Math.sin(angle) * len;
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();
  coralBranch(ctx, tipX, tipY, len * 0.72, angle - 0.5, width * 0.7, colour, depth - 1);
  coralBranch(ctx, tipX, tipY, len * 0.72, angle + 0.45, width * 0.7, colour, depth - 1);
}

function fish(ctx, x, y, size, colour, facing) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.ellipse(x, y, size, size * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - facing * size * 0.8, y);
  ctx.lineTo(x - facing * size * 1.5, y - size * 0.55);
  ctx.lineTo(x - facing * size * 1.5, y + size * 0.55);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#17122b';
  circle(ctx, x + facing * size * 0.45, y - size * 0.12, size * 0.09);
}

function seaweed(ctx, x, baseY, height, colour) {
  ctx.strokeStyle = colour;
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, baseY);
  ctx.quadraticCurveTo(x + 14, baseY - height * 0.5, x - 6, baseY - height);
  ctx.stroke();
}

export function paintCoralGarden(ctx, applied) {
  const rng = mulberry32(LEVELS[1].seed);
  const water = ctx.createLinearGradient(0, 0, 0, H);
  water.addColorStop(0, '#0e7490');
  water.addColorStop(0.5, '#155e75');
  water.addColorStop(1, '#0c2d4d');
  ctx.fillStyle = water;
  ctx.fillRect(0, 0, W, H);

  // Light rays from the surface.
  ctx.fillStyle = 'rgba(255, 247, 230, 0.07)';
  for (let i = 0; i < 4; i += 1) {
    const x = 60 + i * 130;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 50, 0);
    ctx.lineTo(x + 110, 340);
    ctx.lineTo(x + 20, 340);
    ctx.closePath();
    ctx.fill();
  }

  // Difference 4: one bubble drifting up, or nothing there.
  if (!applied.has(4)) {
    ctx.strokeStyle = 'rgba(255, 247, 230, 0.7)';
    ctx.lineWidth = 1.5;
    circle(ctx, 150, 96, 7);
    ctx.stroke();
    circle(ctx, 168, 70, 5);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(255, 247, 230, 0.5)';
  ctx.lineWidth = 1.5;
  circle(ctx, 420, 120, 6);
  ctx.stroke();

  // The sandy floor.
  ctx.fillStyle = '#e7c98f';
  ctx.beginPath();
  ctx.moveTo(0, 380);
  ctx.quadraticCurveTo(140, 362, 280, 380);
  ctx.quadraticCurveTo(420, 396, 560, 376);
  ctx.lineTo(560, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d9b878';
  for (let i = 0; i < 14; i += 1) {
    circle(ctx, range(rng, 10, W - 10), range(rng, 396, 440), range(rng, 2, 5));
  }

  // Corals. Difference 2: the middle coral loses its top branch.
  coralBranch(ctx, 90, 384, 52, -Math.PI / 2, 9, '#ec4899', 3);
  if (!applied.has(2)) coralBranch(ctx, 280, 386, 58, -Math.PI / 2, 10, '#f59e0b', 3);
  else coralBranch(ctx, 280, 386, 34, -Math.PI / 2, 10, '#f59e0b', 2);
  coralBranch(ctx, 470, 384, 48, -Math.PI / 2, 9, '#8b5cf6', 3);

  // Seaweed. Difference 6: the tall strand by the left coral is shorter.
  seaweed(ctx, 150, 392, applied.has(6) ? 42 : 96, '#4ade80');
  seaweed(ctx, 330, 394, 70, '#22c55e');
  seaweed(ctx, 510, 390, 84, '#4ade80');

  // Rocks.
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.ellipse(200, 392, 42, 18, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.ellipse(400, 394, 34, 14, 0, Math.PI, 0);
  ctx.fill();

  // The clam and its pearl. Difference 7: the pearl is gone.
  ctx.fillStyle = '#f472b6';
  ctx.beginPath();
  ctx.ellipse(300, 408, 34, 16, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#ec4899';
  ctx.beginPath();
  ctx.ellipse(300, 408, 34, 10, 0, 0, Math.PI);
  ctx.fill();
  if (!applied.has(7)) {
    ctx.fillStyle = '#fff7e6';
    circle(ctx, 300, 402, 9);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    circle(ctx, 297, 399, 3);
  }

  // Difference 5: the starfish is pink, or gold.
  ctx.fillStyle = applied.has(5) ? '#f59e0b' : '#ec4899';
  drawStarfish(ctx, 120, 420, 16);

  // Difference 1: an extra shell on the sand.
  if (applied.has(1)) {
    ctx.fillStyle = '#fda4af';
    ctx.beginPath();
    ctx.ellipse(452, 424, 18, 11, 0, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#be123c';
    ctx.lineWidth = 1.5;
    for (let i = -2; i <= 2; i += 1) {
      ctx.beginPath();
      ctx.moveTo(452 + i * 6, 424);
      ctx.lineTo(452 + i * 8, 412);
      ctx.stroke();
    }
  }

  // Difference 9: a small crab on the left rock.
  if (applied.has(9)) {
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.ellipse(200, 378, 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(192, 374);
    ctx.lineTo(184, 366);
    ctx.moveTo(208, 374);
    ctx.lineTo(216, 366);
    ctx.stroke();
    ctx.fillStyle = '#17122b';
    circle(ctx, 196, 374, 1.8);
    circle(ctx, 204, 374, 1.8);
  }

  // The turtle, top right. Difference 3: its eye is open, or shut.
  ctx.fillStyle = '#2dd4bf';
  ctx.beginPath();
  ctx.ellipse(452, 150, 34, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#14b8a6';
  ctx.beginPath();
  ctx.ellipse(452, 150, 24, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0f766e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(452, 150, 24, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#2dd4bf';
  circle(ctx, 486, 142, 12);
  ctx.fillStyle = '#17122b';
  if (applied.has(3)) {
    ctx.strokeStyle = '#17122b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(484, 140);
    ctx.lineTo(492, 140);
    ctx.stroke();
  } else {
    circle(ctx, 488, 140, 2.5);
  }
  ctx.strokeStyle = '#2dd4bf';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(424, 166);
  ctx.lineTo(412, 178);
  ctx.moveTo(478, 166);
  ctx.lineTo(490, 178);
  ctx.stroke();

  // The fish. Difference 0: the middle fish is teal, not orange.
  fish(ctx, 120, 220, 20, '#f59e0b', 1);
  fish(ctx, 250, 160, 16, applied.has(0) ? '#2dd4bf' : '#f97316', -1);
  fish(ctx, 380, 250, 18, '#ec4899', 1);
  fish(ctx, 500, 210, 14, '#f59e0b', -1);
  fish(ctx, 180, 300, 13, '#8b5cf6', 1);

  // Difference 8: a seahorse drifting by the right coral.
  if (applied.has(8)) {
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(508, 300);
    ctx.quadraticCurveTo(520, 280, 512, 262);
    ctx.quadraticCurveTo(506, 248, 516, 240);
    ctx.stroke();
    ctx.fillStyle = '#f59e0b';
    circle(ctx, 518, 238, 6);
    ctx.beginPath();
    ctx.moveTo(524, 236);
    ctx.lineTo(532, 232);
    ctx.lineTo(524, 242);
    ctx.closePath();
    ctx.fill();
  }
}

function drawStarfish(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 5; i += 1) {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
    const a2 = a + Math.PI / 5;
    ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    ctx.lineTo(x + Math.cos(a2) * r * 0.45, y + Math.sin(a2) * r * 0.45);
  }
  ctx.closePath();
  ctx.fill();
}

// ---------------------------------------------------------------------------
// Level 3: Bengkel Jarum Jam, a clockmaker's workshop.
// ---------------------------------------------------------------------------
function gear(ctx, x, y, radius, teeth, colour, missingTooth) {
  ctx.fillStyle = colour;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < teeth; i += 1) {
    if (missingTooth && i === 2) continue;
    const a = (i / teeth) * Math.PI * 2;
    const a2 = ((i + 0.5) / teeth) * Math.PI * 2;
    ctx.moveTo(x + Math.cos(a) * radius * 0.82, y + Math.sin(a) * radius * 0.82);
    ctx.lineTo(x + Math.cos(a) * radius, y + Math.sin(a) * radius);
    ctx.lineTo(x + Math.cos(a2) * radius, y + Math.sin(a2) * radius);
    ctx.lineTo(x + Math.cos(a2) * radius * 0.82, y + Math.sin(a2) * radius * 0.82);
  }
  ctx.fill();
  circle(ctx, x, y, radius * 0.78);
  ctx.fillStyle = '#3a2b1c';
  circle(ctx, x, y, radius * 0.2);
  ctx.fillStyle = 'rgba(255, 247, 230, 0.5)';
  circle(ctx, x - radius * 0.25, y - radius * 0.25, radius * 0.1);
}

export function paintWorkshop(ctx, applied) {
  const rng = mulberry32(LEVELS[2].seed);
  // Plank wall.
  ctx.fillStyle = '#6b4a2a';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.lineWidth = 2;
  for (let y = 0; y < H; y += 46) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
  for (let i = 0; i < 8; i += 1) {
    ctx.fillRect(range(rng, 0, W - 60), range(rng, 0, 300), 46, 3);
  }

  // Window with the night outside. Difference 7: rain on the glass.
  ctx.fillStyle = '#17122b';
  roundRect(ctx, 36, 36, 130, 150, 8);
  ctx.fill();
  const night = ctx.createLinearGradient(36, 36, 36, 186);
  night.addColorStop(0, '#241b3a');
  night.addColorStop(1, '#4a2b63');
  ctx.fillStyle = night;
  ctx.fillRect(42, 42, 118, 138);
  ctx.fillStyle = '#ffeec2';
  circle(ctx, 130, 70, 16);
  ctx.fillStyle = '#fff7e6';
  for (let i = 0; i < 10; i += 1) {
    circle(ctx, range(rng, 50, 150), range(rng, 50, 170), range(rng, 1, 2));
  }
  if (applied.has(7)) {
    ctx.strokeStyle = 'rgba(255, 247, 230, 0.55)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 7; i += 1) {
      const x = range(rng, 52, 150);
      const y = range(rng, 52, 150);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 3, y + 12);
      ctx.stroke();
    }
  }
  ctx.strokeStyle = '#3a2b1c';
  ctx.lineWidth = 5;
  ctx.strokeRect(36, 36, 130, 150);
  ctx.beginPath();
  ctx.moveTo(101, 36);
  ctx.lineTo(101, 186);
  ctx.moveTo(36, 111);
  ctx.lineTo(166, 111);
  ctx.stroke();

  // The big wall clock. Difference 1: its hands show a different time.
  ctx.fillStyle = '#fff7e6';
  circle(ctx, 300, 110, 58);
  ctx.strokeStyle = '#3a2b1c';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(300, 110, 58, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#17122b';
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2;
    circle(ctx, 300 + Math.cos(a) * 48, 110 + Math.sin(a) * 48, 3);
  }
  const hands = applied.has(1)
    ? { hour: 2.8, minute: 5.2 }
    : { hour: 10.2, minute: 0.35 };
  const hourAngle = (hands.hour / 12) * Math.PI * 2 - Math.PI / 2;
  const minAngle = (hands.minute / 12) * Math.PI * 2 - Math.PI / 2;
  ctx.strokeStyle = '#17122b';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(300, 110);
  ctx.lineTo(300 + Math.cos(hourAngle) * 28, 110 + Math.sin(hourAngle) * 28);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(300, 110);
  ctx.lineTo(300 + Math.cos(minAngle) * 44, 110 + Math.sin(minAngle) * 44);
  ctx.stroke();
  circle(ctx, 300, 110, 5);

  // Gears on the wall. Difference 0: the big gear loses a tooth.
  // Difference 4: the small gear is teal, not brass.
  gear(ctx, 452, 96, 46, 12, '#b45309', applied.has(0));
  gear(ctx, 516, 176, 28, 10, applied.has(4) ? '#2dd4bf' : '#d97706', false);
  gear(ctx, 392, 196, 22, 9, '#92400e', false);

  // Wall sign. Difference 11: the number on it.
  ctx.fillStyle = '#3a2b1c';
  roundRect(ctx, 196, 176, 84, 44, 6);
  ctx.fill();
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 26px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(applied.has(11) ? 'No. 1' : 'No. 7', 238, 199);

  // Shelves with jars.
  ctx.fillStyle = '#4a3419';
  ctx.fillRect(196, 236, 180, 10);
  ctx.fillRect(392, 236, 132, 10);
  const jarColours = ['#2dd4bf', '#ec4899', '#f59e0b', '#8b5cf6'];
  jarColours.forEach((c, i) => {
    ctx.fillStyle = c;
    roundRect(ctx, 206 + i * 42, 200, 28, 36, 6);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 247, 230, 0.6)';
    ctx.fillRect(210 + i * 42, 206, 6, 24);
  });
  ctx.fillStyle = '#e5484d';
  circle(ctx, 420, 222, 12);
  ctx.fillStyle = '#4ade80';
  circle(ctx, 448, 222, 12);
  ctx.fillStyle = '#f59e0b';
  circle(ctx, 476, 222, 12);

  // Hanging lamp. Difference 3: lit, or dark.
  ctx.strokeStyle = '#17122b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(300, 0);
  ctx.lineTo(300, 34);
  ctx.stroke();
  if (!applied.has(3)) {
    const glow = ctx.createRadialGradient(300, 60, 4, 300, 60, 90);
    glow.addColorStop(0, 'rgba(255, 209, 102, 0.5)');
    glow.addColorStop(1, 'rgba(255, 209, 102, 0)');
    ctx.fillStyle = glow;
    circle(ctx, 300, 60, 90);
  }
  ctx.fillStyle = applied.has(3) ? '#4a3419' : '#ffd166';
  ctx.beginPath();
  ctx.moveTo(282, 44);
  ctx.lineTo(318, 44);
  ctx.lineTo(310, 76);
  ctx.lineTo(290, 76);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#3a2b1c';
  ctx.fillRect(296, 76, 8, 6);

  // The workbench.
  ctx.fillStyle = '#8a6238';
  ctx.fillRect(0, 330, W, 122);
  ctx.fillStyle = '#6b4a2a';
  ctx.fillRect(0, 330, W, 10);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 380);
  ctx.lineTo(W, 380);
  ctx.stroke();

  // Books. Difference 8: three books, or four.
  const bookColours = ['#e5484d', '#2dd4bf', '#f59e0b', '#8b5cf6'];
  const bookCount = applied.has(8) ? 4 : 3;
  for (let i = 0; i < bookCount; i += 1) {
    ctx.fillStyle = bookColours[i];
    ctx.fillRect(40, 330 - 14 - i * 14, 84, 12);
    ctx.fillStyle = 'rgba(255, 247, 230, 0.7)';
    ctx.fillRect(46, 330 - 14 - i * 14, 72, 3);
  }

  // The cat asleep on the bench. Difference 9: eyes open.
  ctx.fillStyle = '#4c3d7d';
  ctx.beginPath();
  ctx.ellipse(160, 322, 34, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(140, 312, 16, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(128, 304);
  ctx.lineTo(126, 292);
  ctx.lineTo(134, 300);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(146, 302);
  ctx.lineTo(150, 291);
  ctx.lineTo(154, 301);
  ctx.closePath();
  ctx.fill();
  if (applied.has(9)) {
    ctx.fillStyle = '#f59e0b';
    circle(ctx, 136, 310, 2.5);
    circle(ctx, 146, 310, 2.5);
  } else {
    ctx.strokeStyle = '#17122b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(132, 310);
    ctx.lineTo(140, 310);
    ctx.moveTo(142, 310);
    ctx.lineTo(150, 310);
    ctx.stroke();
  }

  // The robot toy. Difference 6: its eye is red, not green.
  ctx.fillStyle = '#94a3b8';
  roundRect(ctx, 452, 268, 56, 62, 8);
  ctx.fill();
  ctx.fillStyle = '#64748b';
  ctx.fillRect(476, 252, 8, 16);
  ctx.fillStyle = applied.has(6) ? '#e5484d' : '#4ade80';
  circle(ctx, 480, 288, 7);
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(452, 290);
  ctx.lineTo(438, 306);
  ctx.moveTo(508, 290);
  ctx.lineTo(522, 306);
  ctx.stroke();

  // The pipe and its steam. Difference 10: steam, or none.
  ctx.fillStyle = '#475569';
  ctx.fillRect(536, 250, 24, 80);
  ctx.fillStyle = '#334155';
  ctx.fillRect(536, 250, 24, 10);
  if (!applied.has(10)) {
    ctx.strokeStyle = 'rgba(255, 247, 230, 0.55)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(548, 246);
    ctx.quadraticCurveTo(538, 224, 548, 204);
    ctx.quadraticCurveTo(558, 186, 548, 168);
    ctx.stroke();
  }

  // Difference 5: the blueprint roll on the bench.
  if (!applied.has(5)) {
    ctx.fillStyle = '#e0e7ff';
    ctx.beginPath();
    ctx.ellipse(330, 356, 44, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c7d2fe';
    ctx.beginPath();
    ctx.ellipse(330, 356, 44, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(300, 352);
    ctx.lineTo(330, 348);
    ctx.lineTo(356, 354);
    ctx.stroke();
  }

  // Difference 2: an extra wrench on the bench.
  if (applied.has(2)) {
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(240, 400);
    ctx.lineTo(286, 372);
    ctx.stroke();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(290, 368, 9, 0.6, 4.4);
    ctx.stroke();
  }

  // A hammer and a screwdriver, always there.
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(60, 420);
  ctx.lineTo(96, 396);
  ctx.stroke();
  ctx.fillStyle = '#92400e';
  ctx.fillRect(94, 388, 22, 12);
  ctx.strokeStyle = '#e5484d';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(400, 420);
  ctx.lineTo(424, 402);
  ctx.stroke();
}

// ---------------------------------------------------------------------------
// Dispatcher and difference lists.
// ---------------------------------------------------------------------------
const PAINTERS = [paintLanternLane, paintCoralGarden, paintWorkshop];

// Paint one level into the current context, which must already be clipped to
// the panel. `applied` holds the indices of the differences this panel shows.
export function paintScene(ctx, levelIndex, applied) {
  PAINTERS[levelIndex](ctx, applied);
}

// Where each difference sits, in panel coordinates, with a click radius.
export const DIFFERENCES = [
  [
    { x: 486, y: 52, r: 34, label: 'bulan' },
    { x: 266, y: 218, r: 26, label: 'lentera tengah' },
    { x: 472, y: 162, r: 26, label: 'kucing di atap' },
    { x: 108, y: 328, r: 26, label: 'tulisan papan' },
    { x: 280, y: 269, r: 26, label: 'garis awning' },
    { x: 280, y: 398, r: 26, label: 'piring pangsit' },
    { x: 65, y: 235, r: 26, label: 'jendela menyala' },
    { x: 96, y: 100, r: 26, label: 'balon merah' },
  ],
  [
    { x: 250, y: 160, r: 26, label: 'ikan tengah' },
    { x: 452, y: 420, r: 26, label: 'kerang' },
    { x: 280, y: 340, r: 30, label: 'ujung karang' },
    { x: 488, y: 140, r: 24, label: 'mata kura-kura' },
    { x: 158, y: 84, r: 26, label: 'gelembung' },
    { x: 120, y: 420, r: 24, label: 'bintang laut' },
    { x: 150, y: 350, r: 26, label: 'rumput laut' },
    { x: 300, y: 402, r: 24, label: 'mutiara' },
    { x: 514, y: 262, r: 26, label: 'kuda laut' },
    { x: 200, y: 376, r: 24, label: 'kepiting' },
  ],
  [
    { x: 452, y: 96, r: 34, label: 'gigi gir' },
    { x: 300, y: 110, r: 34, label: 'jarum jam' },
    { x: 264, y: 388, r: 26, label: 'kunci inggris' },
    { x: 300, y: 60, r: 30, label: 'lampu gantung' },
    { x: 516, y: 176, r: 26, label: 'gir kecil' },
    { x: 330, y: 356, r: 28, label: 'gulungan cetak biru' },
    { x: 480, y: 288, r: 24, label: 'mata robot' },
    { x: 101, y: 111, r: 30, label: 'hujan di jendela' },
    { x: 82, y: 306, r: 26, label: 'tumpukan buku' },
    { x: 141, y: 310, r: 24, label: 'mata kucing' },
    { x: 548, y: 206, r: 28, label: 'uap pipa' },
    { x: 238, y: 198, r: 26, label: 'nomor dinding' },
  ],
];

export function levelDifferences(levelIndex) {
  return DIFFERENCES[levelIndex];
}
