# Roadmap – Captain Suji

Update this file after every version (see CLAUDE.md).

## Now – finish V7c (from STATUS-handoff.md, 2026-10-19)
1. Wait for the background script (`run_stage_d_remaining_v2.py`) to finish, then Claude checks
   the route and stress results (especially S3).
2. After 20:59, send Codex ONE short prompt: either "run stage_d_aggregate.py --package, verify
   the zip SHA, STOP", or one specific fix if a stress test failed.
3. Claude does the final audit of the new zip.
4. The user tests on a real iPad (suggested tomorrow, fresh).
5. After that, copy the zip to Downloads and upload to GitHub Pages.

Open risk: S3 (Level 3 portrait re-entry, worker failed to load `level3_engine.js`). If it fails
again, the game needs a worker-error retry plus a "Try again" message.

## Next – Level 4

## Level 4 – "Alien Monster Attack"
- Built on Level 3's map (two black holes, two planets); goal: reach the blue planet. 5–9 alien monsters arrive one at a time (6–8 s apart), each announced by ORBIT.
- Controls: ◀ ▶ steering; FIRE by tapping the monster (touch-and-hold shows a curved aim line, release fires) plus a FIRE button above ▶; 0.4 s cooldown, unlimited shots, max 3 on screen.
- Gravity weapons: plasma bolts use the same gravity engine and bend near black holes; the aim line shows the curve; "Gravity Shot" bonus when a bolt curves round a black hole and hits.
- Monsters: Blob (slow, straight), Zigzag (weaves), Orbiter (slingshots round a black hole), Boss last (3 hits). They fire slow glowing orbs she can dodge; orbs bend with gravity too. Defeated monsters burst into stardust.
- Lives: 3 lives per session; each life has 3 shield bars; losing all shields or falling into a black hole costs a life (escape pod, respawn at last checkpoint with full shields); shields recharge at the planet-1 stop; 0 lives = mission over with final score.
- Scoring (only 10/20/50/100): Blob 10, Zigzag 20, Orbiter 50, Boss 100, Gravity Shot +50, landing on the blue planet +100, +20 per shield bar left, +50 per life left. No accuracy bonus for now; route rings not scored.
- Screen: live score at the top with "+20" pop-ups, shield bars, lives, "Monsters 3/7", cooldown ring on FIRE; result breakdown; "Captain Suji's Hall of Fame" (best 5 scores saved on the device, with date) and a "New High Score!" celebration.
- New cards: GRAVITY SHOT, SPACE DEFENDER. Monster count and types scale with pilot rank; never two monsters at once early.
- Acceptance: aim-line bot hits within 3 shots ≥80%; ring-following pilot survives and lands ≥90%; 60 fps with monsters and bolts on screen.
