# Captain Suji – Black Hole Challenge V6 – updated

**Status: validation candidate, NOT an approved final iPad release.** This remains V6.

## Controls
- **Space Cadet:** tap/drag height, press **LAUNCH**. Green stripes, gravity meter and full preview. Fixed speed 450.
- **Space Pilot:** tap/drag height, press **LAUNCH**. Gravity meter and partial preview, no green stripes. Fixed speed 550.
- **Space Commander:** choose height, pull back to set speed and aim, release to launch. Forward or <=28-unit pulls cancel. Backward finger cone ±60°, mapped at sensitivity **0.5** to **±30° actual heading**; dotted arrow and launch velocity use identical mapping. Three ORBIT hints.

## Physics and visual landing
The DOM-free `game/engine.js` uses fixed-timestep 2D softened Newtonian gravity, not general relativity. Outcomes come from the simulated path crossing the black-hole event horizon, entering the planet landing radius, or leaving bounds/timing out. All levels draw a dashed landing-zone ring. The 1.5-second announced autopilot landing is a **visual-only** transition after the physics-determined success.

## Current parameters
| Level | Black-hole mu | Planet mu | Horizon | Planet radius | Arrival radius | Launch speed |
|---|---:|---:|---:|---:|---:|---|
| Cadet | 6000000 | 900000 | 45 | 80 | 230 | fixed 450 |
| Pilot | 6000000 | 300000 | 65 | 60 | 156 | fixed 550 |
| Commander | 50000000 | 300000 | 65 | 45 | **150** | pull-controlled 420–1020 |

## Latest measured coverage (seed 20261016; 12,000 random gestures per level)
- Cadet: **72.1%** of sampled heights successful.
- Pilot: **44.2%** of sampled heights successful.
- Commander: **20.2%** of **valid backward pulls** successful (8.5% of all random gestures including cancellations). Steering sensitivity is **0.5**, producing ±30° flight headings. Across five seeds Commander valid-pull success ranged **18.7–20.2%**.
- These are sampled-input coverage measurements, **not observed child win rates**.

## Vikas's design decision
**Vikas, Papa for Suji, chose sensitivity 0.5 (about 21% Commander success) so Suji's aim clearly changes the flight while she still wins about 1 in 5 tries.** This supersedes the earlier 0.14 sensitivity / ≥25% calibration and its ±8.4° steering trade-off. The accepted trade-off is **more responsive steering but fewer successful random valid launches**; Commander retains a realistic 150-unit arrival radius, unchanged gravity and speed settings, and ±60° input cone.

## Verification and blockers
Run `node --check game/*.js tests/*.js` individually, `node tests/engine.test.js`, `node tests/stress.test.js` (seed configurable via `SUJI_SEED`; random count via `SUJI_RUNS`), and `node tests/large.test.js`. See `test-results.txt` and `evidence/` for measured outputs.

**Not all final-release acceptance checks have passed.** The large-run worst-case prediction time exceeded 8 ms during an isolated scheduling spike. Headless Chromium navigation was blocked by the execution environment, so requested browser play-throughs, screenshots and real-iPad testing are outstanding. Do not claim full acceptance.

## Files
`game/index.html`, `game/style.css`, `game/game.js`, `game/engine.js`, `game/ship.png`, `game/manifest.webmanifest`, `tests/engine.test.js`, `tests/stress.test.js`, `tests/large.test.js`, `tests/browser_check.py`, `docs/TECHNICAL_REVIEW.md`, `test-results.txt`, `evidence/`.

## Next version ideas (not in V6)
- Engine burns for a full orbit lap and a Commander **Burn** button.
- Space Pilot speed-choice buttons (Slow / Medium / Fast).

No new gameplay features were added in this V6 update. Browser speech synthesis is the default, with optional local ORBIT recordings and a mute toggle. The game contains no ads, telemetry, or external network dependencies; a service worker is not included.

## Fixes — V6 updated (discovery and ORBIT)
- First successful launch initiation now calls `unlock('gravity')` immediately after `attempt++`, preserving the GRAVITY card through the existing save mechanism.
- Drift outcomes now display and speak the same `reasonForFlight()` text; after 1.2 seconds ORBIT speaks the fun fact alone, without repeating the reason. Fall and success speech paths remain unchanged.
- Every fall increments `store.falls` and immediately calls `save()`, preserving progress across page reloads even before the SPAGHETTI card unlocks.
- Only `game/game.js` was changed in game code; physics and tuning remain untouched.
