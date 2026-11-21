# spot-the-difference-lantern-lane

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/zelotadonia-lang/spot-the-difference-lantern-lane/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/zelotadonia-lang/spot-the-difference-lantern-lane/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

Lantern Lane is a spot-the-difference game. Two near-identical pictures sit side by side: a lantern-lit night market, a coral garden, then a clockmaker's workshop. Every scene is drawn in code, nothing is a photo. Find 8 differences on level 1, 10 on level 2, and 12 on level 3, before the clock runs out. A found difference gets a green ring and a chime. A wrong click costs 3 seconds. Hints cost 50 points and ring one difference that is still hidden.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. No build step, no network request: every file the game loads sits under `game/`, and its sounds are made with the Web Audio API.

## Controls

- Mouse: click a difference on either panel.
- Enter: start, next level, play again.
- H: hint (3 per level, 50 points each).
- P or Esc: pause.
- R: restart the level.
- M: mute.

## How it is built

- `game/src/config.js`: design tokens and level settings.
- `game/src/random.js`: the seeded generator behind every scene.
- `game/src/scenes.js`: the three scenes, painted procedurally, and where each difference sits.
- `game/src/world.js`: the state: differences, found, timer, hints, score.
- `game/src/render.js`: the panels, the rings, the HUD, and the screens.
- `game/src/input.js`: clicks and keys, mapped into panel space.
- `game/src/audio.js`: procedural sounds, Web Audio only.
- `game/src/shots.js`: the four screenshot scenes, staged by playing the real rules.
- `game/src/main.js`: the fixed-step loop and the `?shot=` staging.
- `main.ts`: copies `game/` and `screenshots/` to `/output` and writes `dossier.json`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=yk7ez00m&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
