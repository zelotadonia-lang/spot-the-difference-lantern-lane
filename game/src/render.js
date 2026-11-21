// Everything on screen: the two panels, the markers on found differences, the
// HUD with its counter and timer, and the title, pause, level-done, win and
// game-over cards. The scenes themselves are painted once per level into two
// offscreen canvases (left: no differences, right: all of them) and blitted
// each frame; only the markers and the HUD move.
import { TOKENS, VIEW, PANEL, HUD, FOOTER, LEVELS } from './config.js';
import { paintScene } from './scenes.js';
import {
  SCREEN_TITLE, SCREEN_PLAY, SCREEN_LEVEL_DONE, SCREEN_WIN, SCREEN_OVER,
  SCREEN_PAUSED, clockSeconds, remaining,
} from './world.js';

const T = TOKENS.semantic;
const C = TOKENS.component;

let cache = { levelIndex: -1, left: null, right: null };

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function paintPanels(world) {
  if (cache.levelIndex === world.levelIndex && cache.left) return;
  const left = document.createElement('canvas');
  left.width = PANEL.width;
  left.height = PANEL.height;
  const right = document.createElement('canvas');
  right.width = PANEL.width;
  right.height = PANEL.height;
  paintScene(left.getContext('2d'), world.levelIndex, new Set());
  const all = new Set();
  for (let i = 0; i < world.diffs.length; i += 1) all.add(i);
  paintScene(right.getContext('2d'), world.levelIndex, all);
  cache = { levelIndex: world.levelIndex, left, right };
}

function pill(ctx, x, y, w, h, fill, stroke) {
  roundRectPath(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawBackground(ctx) {
  const sky = ctx.createLinearGradient(0, 0, 0, VIEW.height);
  sky.addColorStop(0, T.backgroundDeep);
  sky.addColorStop(1, T.background);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
}

function formatClock(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function drawHud(ctx, world) {
  const font = C.fontStack;
  // Title block, left.
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = T.accent;
  ctx.font = `bold 26px ${font}`;
  ctx.fillText('LANTERN LANE', HUD.margin, 44);
  ctx.fillStyle = T.textMuted;
  ctx.font = `15px ${font}`;
  ctx.fillText(`Level ${world.levelIndex + 1} · ${world.level.name}`, HUD.margin, 70);

  // Timer bar, centre.
  const barW = 330;
  const barX = (VIEW.width - barW) / 2;
  const barY = 30;
  const fraction = Math.max(0, world.timeLeft / world.level.seconds);
  ctx.fillStyle = T.hudSurface;
  roundRectPath(ctx, barX - 10, barY - 8, barW + 20, 52, 14);
  ctx.fill();
  ctx.strokeStyle = T.hudBorder;
  ctx.lineWidth = 2;
  ctx.stroke();
  const fillColour = fraction > 0.5 ? T.timerFull : fraction > 0.25 ? T.accent : T.timerLow;
  ctx.fillStyle = 'rgba(255, 247, 230, 0.14)';
  roundRectPath(ctx, barX, barY, barW, 16, 8);
  ctx.fill();
  if (fraction > 0) {
    ctx.fillStyle = fillColour;
    roundRectPath(ctx, barX, barY, Math.max(16, barW * fraction), 16, 8);
    ctx.fill();
  }
  ctx.fillStyle = T.text;
  ctx.font = `bold 18px ${font}`;
  ctx.textAlign = 'center';
  ctx.fillText(formatClock(clockSeconds(world)), VIEW.width / 2, barY + 38);

  // Score, hints, remaining, right.
  const right = VIEW.width - HUD.margin;
  ctx.textAlign = 'right';
  ctx.fillStyle = T.textMuted;
  ctx.font = `15px ${font}`;
  ctx.fillText('SKOR', right, 34);
  ctx.fillStyle = T.text;
  ctx.font = `bold 24px ${font}`;
  ctx.fillText(String(world.score), right, 62);
  ctx.fillStyle = T.accent;
  ctx.font = `bold 22px ${font}`;
  ctx.fillText(`${remaining(world)} tersisa`, right - 130, 44);
  ctx.fillStyle = T.textMuted;
  ctx.font = `15px ${font}`;
  ctx.fillText(`Petunjuk: ${world.hintsLeft}`, right - 130, 68);
}

function drawPanelFrame(ctx, x, label) {
  ctx.fillStyle = T.textMuted;
  ctx.font = `15px ${C.fontStack}`;
  ctx.textAlign = 'left';
  ctx.fillText(label, x + 4, PANEL.y - 10);
}

function drawPanels(ctx, world, now) {
  paintPanels(world);
  const dim = world.screen === SCREEN_TITLE ? 0.45 : 1;
  ctx.save();
  ctx.globalAlpha = dim;
  for (const [x, image] of [[PANEL.leftX, cache.left], [PANEL.rightX, cache.right]]) {
    ctx.save();
    roundRectPath(ctx, x, PANEL.y, PANEL.width, PANEL.height, C.panelRadius);
    ctx.clip();
    ctx.drawImage(image, x, PANEL.y);
    ctx.restore();
    ctx.strokeStyle = T.panelBorder;
    ctx.lineWidth = C.panelBorderWidth;
    roundRectPath(ctx, x, PANEL.y, PANEL.width, PANEL.height, C.panelRadius);
    ctx.stroke();
  }
  ctx.restore();

  drawPanelFrame(ctx, PANEL.leftX, 'Kiri');
  drawPanelFrame(ctx, PANEL.rightX, 'Kanan');

  // The lane between the panels: a small lantern and the level dots.
  const midX = (PANEL.leftX + PANEL.width + PANEL.rightX) / 2;
  ctx.fillStyle = T.accent;
  ctx.beginPath();
  ctx.arc(midX, PANEL.y + PANEL.height / 2, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = T.accentText;
  ctx.font = `bold 15px ${C.fontStack}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('VS', midX, PANEL.y + PANEL.height / 2 + 1);
  ctx.textBaseline = 'alphabetic';

  if (world.screen === SCREEN_TITLE) return;

  // Rings on every difference already found, on both panels.
  const pulse = 1 + 0.12 * Math.sin(now / 160);
  for (const index of world.found) {
    const d = world.diffs[index];
    const fresh = world.foundFlash > 0 && index === [...world.found].pop();
    for (const x of [PANEL.leftX, PANEL.rightX]) {
      ctx.strokeStyle = T.found;
      ctx.lineWidth = C.markerWidth;
      ctx.beginPath();
      ctx.arc(x + d.x, PANEL.y + d.y, d.r * (fresh ? pulse : 1), 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = T.found;
      ctx.beginPath();
      ctx.arc(x + d.x, PANEL.y + d.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // The hint ring: violet, breathing, on both panels.
  if (world.hinted >= 0 && world.hintTimer > 0) {
    const d = world.diffs[world.hinted];
    const breathe = 1 + 0.18 * Math.sin(now / 130);
    ctx.strokeStyle = T.hint;
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 7]);
    for (const x of [PANEL.leftX, PANEL.rightX]) {
      ctx.beginPath();
      ctx.arc(x + d.x, PANEL.y + d.y, d.r * breathe + 4, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  // A wrong click flashes a red edge on both panels.
  if (world.wrongFlash > 0) {
    ctx.strokeStyle = `rgba(220, 38, 38, ${world.wrongFlash * 2})`;
    ctx.lineWidth = 6;
    for (const x of [PANEL.leftX, PANEL.rightX]) {
      roundRectPath(ctx, x, PANEL.y, PANEL.width, PANEL.height, C.panelRadius);
      ctx.stroke();
    }
  }
}

function drawFooter(ctx, world) {
  const font = C.fontStack;
  ctx.textAlign = 'left';
  ctx.fillStyle = T.textMuted;
  ctx.font = `15px ${font}`;
  ctx.fillText(
    `${world.level.place} · ${world.diffs.length} perbedaan · Klik perbedaan di panel kiri atau kanan`,
    HUD.margin, FOOTER.y + 26,
  );
  ctx.fillText('Enter mulai · H petunjuk · P jeda · R ulang · M suara', HUD.margin, FOOTER.y + 52);

  // Level progress dots, right.
  const dots = LEVELS.length;
  const dotX = VIEW.width - HUD.margin - (dots - 1) * 34;
  for (let i = 0; i < dots; i += 1) {
    ctx.fillStyle = i < world.levelIndex ? T.found : i === world.levelIndex ? T.accent : T.hudBorder;
    ctx.beginPath();
    ctx.arc(dotX + i * 34, FOOTER.y + 36, 9, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = T.textMuted;
  ctx.font = `13px ${font}`;
  ctx.textAlign = 'right';
  ctx.fillText('Level', VIEW.width - HUD.margin, FOOTER.y + 62);

  // A short message after each find or miss.
  if (world.messageTimer > 0 && world.message) {
    ctx.font = `bold 17px ${font}`;
    const w = ctx.measureText(world.message).width + 36;
    pill(ctx, (VIEW.width - w) / 2, FOOTER.y - 6, w, 32, 'rgba(23, 18, 43, 0.92)', T.hudBorder);
    ctx.fillStyle = T.text;
    ctx.textAlign = 'center';
    ctx.fillText(world.message, VIEW.width / 2, FOOTER.y + 17);
  }
}

function card(ctx, w, h) {
  const x = (VIEW.width - w) / 2;
  const y = (VIEW.height - h) / 2;
  ctx.fillStyle = 'rgba(18, 13, 36, 0.82)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = T.hudSurface;
  roundRectPath(ctx, x, y, w, h, 22);
  ctx.fill();
  ctx.strokeStyle = T.accent;
  ctx.lineWidth = 3;
  ctx.stroke();
  return { x, y, w, h };
}

function drawTitle(ctx, world, now) {
  const font = C.fontStack;
  // The title band sits over the top of the frame; the panels stay visible
  // below it, so the cover shot shows the game itself.
  ctx.fillStyle = 'rgba(18, 13, 36, 0.78)';
  ctx.fillRect(0, 0, VIEW.width, HUD.height + 8);
  ctx.fillStyle = T.accent;
  ctx.font = `bold ${C.fontTitle}px ${font}`;
  ctx.textAlign = 'center';
  ctx.fillText('LANTERN LANE', VIEW.width / 2, 58);
  ctx.fillStyle = T.text;
  ctx.font = `20px ${font}`;
  ctx.fillText('Cari perbedaannya · dua gambar, satu jalan lentera', VIEW.width / 2, 92);

  // The counter still shows on the cover, top right of the band.
  ctx.fillStyle = T.accent;
  ctx.font = `bold 22px ${font}`;
  ctx.textAlign = 'right';
  ctx.fillText(`${remaining(world)} tersisa`, VIEW.width - 24, 52);
  if (world.best > 0) {
    ctx.fillStyle = T.textMuted;
    ctx.font = `15px ${font}`;
    ctx.fillText(`Skor terbaik: ${world.best}`, VIEW.width - 24, 80);
  }

  // The instruction strip sits under the panels.
  const stripY = FOOTER.y - 4;
  ctx.fillStyle = 'rgba(18, 13, 36, 0.85)';
  ctx.fillRect(0, stripY, VIEW.width, VIEW.height - stripY);
  ctx.textAlign = 'center';
  ctx.fillStyle = T.text;
  ctx.font = `18px ${font}`;
  ctx.fillText(
    'Dua gambar hampir sama. Klik perbedaan di panel mana pun. Temukan semua sebelum waktu habis.',
    VIEW.width / 2, stripY + 30,
  );
  ctx.fillStyle = T.textMuted;
  ctx.font = `16px ${font}`;
  ctx.fillText(
    'Level 1 Gang Lentera · 8 perbedaan · Level 2 Taman Karang · 10 perbedaan · Level 3 Bengkel Jarum Jam · 12 perbedaan',
    VIEW.width / 2, stripY + 58,
  );
  const blink = Math.floor(now / 500) % 2 === 0;
  if (blink) {
    ctx.fillStyle = T.accent;
    ctx.font = `bold 20px ${font}`;
    ctx.fillText('Tekan Enter untuk mulai', VIEW.width / 2, stripY + 90);
  }
}

function drawLevelDone(ctx, world) {
  const { x, y, w } = card(ctx, 560, 300);
  const font = C.fontStack;
  ctx.textAlign = 'center';
  ctx.fillStyle = T.found;
  ctx.font = `bold 34px ${font}`;
  ctx.fillText('Level selesai!', VIEW.width / 2, y + 66);
  ctx.fillStyle = T.text;
  ctx.font = `20px ${font}`;
  ctx.fillText(`${world.level.name} · semua ${world.diffs.length} perbedaan ketemu`, VIEW.width / 2, y + 108);
  ctx.fillText(`Bonus waktu: +${world.levelBonus}`, VIEW.width / 2, y + 142);
  ctx.fillStyle = T.accent;
  ctx.font = `bold 24px ${font}`;
  ctx.fillText(`Skor: ${world.score}`, VIEW.width / 2, y + 182);
  ctx.fillStyle = T.textMuted;
  ctx.font = `18px ${font}`;
  ctx.fillText('Tekan Enter untuk level berikutnya', VIEW.width / 2, y + 232);
  void x;
  void w;
}

function drawWin(ctx, world) {
  const { y } = card(ctx, 600, 330);
  const font = C.fontStack;
  ctx.textAlign = 'center';
  ctx.fillStyle = T.accent;
  ctx.font = `bold 36px ${font}`;
  ctx.fillText('Kamu menang!', VIEW.width / 2, y + 70);
  ctx.fillStyle = T.text;
  ctx.font = `20px ${font}`;
  ctx.fillText('Tiga tempat, tiga puluh perbedaan: semuanya ketemu.', VIEW.width / 2, y + 112);
  ctx.fillText(`30 perbedaan · ${world.wrongCount} klik salah`, VIEW.width / 2, y + 144);
  ctx.fillStyle = T.accent;
  ctx.font = `bold 28px ${font}`;
  ctx.fillText(`Skor akhir: ${world.score}`, VIEW.width / 2, y + 192);
  ctx.fillStyle = T.textMuted;
  ctx.font = `18px ${font}`;
  ctx.fillText('Tekan Enter untuk main lagi', VIEW.width / 2, y + 242);
}

function drawOver(ctx, world) {
  const { y } = card(ctx, 560, 300);
  const font = C.fontStack;
  ctx.textAlign = 'center';
  ctx.fillStyle = T.danger;
  ctx.font = `bold 34px ${font}`;
  ctx.fillText('Waktu habis', VIEW.width / 2, y + 66);
  ctx.fillStyle = T.text;
  ctx.font = `20px ${font}`;
  ctx.fillText(
    `${remaining(world)} perbedaan belum ketemu di ${world.level.name}`,
    VIEW.width / 2, y + 108,
  );
  ctx.fillStyle = T.accent;
  ctx.font = `bold 24px ${font}`;
  ctx.fillText(`Skor: ${world.score}`, VIEW.width / 2, y + 152);
  ctx.fillStyle = T.textMuted;
  ctx.font = `18px ${font}`;
  ctx.fillText('Tekan R untuk coba level ini lagi', VIEW.width / 2, y + 202);
}

function drawPaused(ctx) {
  const { y } = card(ctx, 480, 200);
  ctx.textAlign = 'center';
  ctx.fillStyle = TOKENS.semantic.text;
  ctx.font = `bold 32px ${C.fontStack}`;
  ctx.fillText('Jeda', VIEW.width / 2, y + 80);
  ctx.fillStyle = TOKENS.semantic.textMuted;
  ctx.font = `18px ${C.fontStack}`;
  ctx.fillText('Tekan P untuk lanjut', VIEW.width / 2, y + 124);
}

// Draw one frame. `now` is a millisecond clock for the marker pulse.
export function drawGame(ctx, world, now) {
  drawBackground(ctx);
  // The title screen has its own band and strip, so the HUD and footer stay
  // out of its way and nothing overlaps.
  if (world.screen !== SCREEN_TITLE) drawHud(ctx, world);
  drawPanels(ctx, world, now);
  if (world.screen !== SCREEN_TITLE) drawFooter(ctx, world);
  if (world.screen === SCREEN_TITLE) drawTitle(ctx, world, now);
  else if (world.screen === SCREEN_LEVEL_DONE) drawLevelDone(ctx, world);
  else if (world.screen === SCREEN_WIN) drawWin(ctx, world);
  else if (world.screen === SCREEN_OVER) drawOver(ctx, world);
  else if (world.screen === SCREEN_PAUSED) drawPaused(ctx);
}
