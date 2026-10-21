# Captain Suji – Black Hole Challenge

An educational iPad browser game about gravity, made by Vikas for his daughter Suji (age 7–8,
bright, loves black holes). Plain static HTML/JS/CSS, no build step, hosted on GitHub Pages.

- Level 1 – Space Commander: aim and launch past one black hole (frozen, live).
- Level 2 – Cockpit Pilot: launch, then steer ◀ ▶ in a cockpit with ORBIT route guidance (live V7b.5).
- Level 3 – Deep Space Mission (V7c, in progress): two black holes, two planets, two legs
  (start → blue planet, then blue → green). Each leg threads between the two holes.

## Live URL and branches
- Live: https://tinyurl.com/CaptainSuji → GitHub Pages serves branch **v7b-development**.
- **main** = V6 backup. Never deploy over it.
- Repo: https://github.com/yodaa101-collab/captain-suji-black-hole
- Local clone: `C:\Users\vikaa\repos\captain-suji-black-hole`

## File map
```
index.html            redirect to game/
.nojekyll             required for GitHub Pages
game/index.html       single page, loads all scripts
game/engine.js        Level 1 physics (frozen)
game/game.js          Level 1 UI, menus, discoveries, storage
game/gesture.js       touch gesture classifier (frozen)
game/level2_engine.js Level 2 physics (frozen)
game/cockpit.js       Level 2 cockpit UI and render loop
game/nav_worker.js    Level 2 ORBIT route search (Web Worker)
game/style.css, manifest.webmanifest, ship.png
--- added in V7c ---
game/level3_engine.js   Level 3 two-leg physics (frozen since Stage a)
game/level3_planner.js  Level 3 route search (frozen since Stage a)
game/nav_worker3.js     Level 3 ORBIT worker
game/level3.js          Level 3 game flow, radar, entry/Back lifecycle
game/realistic-art.js   baked planets, black holes, lensing (Level 3 only)
game/deep-cockpit.js/.css  Level 3 instruments and canopy
game/cockpit-kit.js, cockpit-v7c.css  shared presentation
game/mission-cards.js, mission.css    new discovery cards
game/input-guard.js/.css  blocks long-press menu, text select, pinch zoom
docs/                 VERSION_LOG.md, ROADMAP.md, history/ (audit log, prompts, handoffs)
tests/, evidence/     test scripts and saved results
```

## Workflow
1. Vikas describes what he wants.
2. Claude writes the Codex prompt with measurable acceptance criteria.
3. Codex (OpenAI) builds it in `C:\Users\vikaa\codex-work\` and delivers a zip.
4. Claude audits the zip with **measured** tests in a real browser and gives ACCEPT / SEND BACK.
5. Vikas tests on the real iPad with Suji.
6. After approval: deploy to v7b-development (GitHub Pages).

**Claude never edits game code** unless Vikas explicitly asks. It writes prompts for Codex.
**After every version, update docs/VERSION_LOG.md and docs/ROADMAP.md.**

## Local folders (Vikas's Windows PC)
| What | Path |
|---|---|
| Codex working build | `C:\Users\vikaa\codex-work\Captain_Suji_V7c\` |
| Codex working zip | `C:\Users\vikaa\codex-work\Captain_Suji_V7c.zip` |
| Codex resume checkpoint | `C:\Users\vikaa\codex-work\CAPTAIN_SUJI_CHECKPOINT.txt` |
| Status, audit log, prompts | `C:\Users\vikaa\headroom\Suji Game\` |
| Live game files (READ ONLY, never delete) | `C:\Users\vikaa\Downloads\Suji Captain\7bGitUpload\` |
| Old builds | `C:\Users\vikaa\Downloads\Suji Captain\Old versions\` |

Tools: no Node install – use `ELECTRON_RUN_AS_NODE=1 C:\Users\vikaa\AppData\Local\Programs\Session\Session.exe`.
Python 3.13 and Chrome are available. Never stop a running Codex background test script.

## Non-negotiables (audit every build against these)
- 60 fps: frame p95 ≤17.5 ms at 1× CPU (DPR 2, 1366×1024), ≤25 ms at 4× CPU, in every phase
  (planning, transition, cockpit, landing, fall, result). Measured in a real browser
  (Playwright/Chromium), not by reading code.
- Physics deterministic; prediction uses the same engine as flight; no per-frame gradients or
  allocations; all motion time-based and eased; no console errors; `.nojekyll` present;
  relative paths, no 404s.
- Viewports 1366×1024, 1194×834, 1024×768: no overlapping UI; buttons ≥96 CSS px at thumb height.
- Fairness, measured with pilots that only use what the child sees:
  - child-style pilot (coast when light/meter is green, else steer toward planet/route) lands ≥95%;
  - no steering lands rarely (<10–15%);
  - wild starts (launch up to 80° off + 0–4 s random steering): ORBIT shows a route ≥90–95%,
    and following it lands ≥95%.
- Landing: ship touches the planet surface (gap ≤3 px); no frame-to-frame jump >4% of screen width.
- Visibility (added after the V7c.1 rollback): measure from screenshot pixels the size of everything drawn on
  the canvas, on EVERY screen (start/aim, flight, landing, result) at all iPad viewports. The target must be
  obvious at a glance. V7c.1 shipped with 16–23 px planets on the Level 3 start screen.
- Level 1 and Level 2 regression: unchanged behaviour unless the prompt says otherwise.
- Report every number. If a target fails, report the measured number and write a short fix
  prompt for Codex. Never call a build ready without measurements.

## Child-design rules (from real playtests)
- Suji mastered Level 1 fast and almost mastered Level 2 in one evening by flying by feel.
- She did NOT understand the gravity meter and IGNORED ORBIT's text arrows → guidance must be
  IN the windscreen (route rings, traffic light, spoken hints), not gauges or text.
- Simple words for an 8-year-old. Nothing gory – defeated things turn to stardust.
- Scores use only 10/20/50/100. No accuracy-based points for now.
- Quality over speed: Suji broke one release within 10 minutes, so builds get "Suji-proof"
  stress tests (rapid taps, Back mid-flight, re-entry, rotation, long idle).
