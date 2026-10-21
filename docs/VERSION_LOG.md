# Version log – Captain Suji

Newest first. Every number here is copied from a source file (named in each entry). Nothing is
estimated. Where the sources record no measurement, the entry says so.

Sources: `docs/history/STATUS-handoff.md`, `docs/history/audit-log.md`,
`docs/history/prompts-V7d.md`, `docs/history/CAPTAIN_SUJI_CHECKPOINT.txt`, and for V6–V7b this
repo's git history, `README.md` and `test-results.txt`.

---

## V7c.2b – Level 3 with a clear start screen (LIVE)
**Date:** 2026-10-21 · **Status:** LIVE on v7b-development (commit c824ea8, zip SHA b7f72b39…).
Released before a real-iPad look, by Vikas's decision.
- **Changes vs V7c.1:** only `level3.js`. The start (aim) view zooms to the bodies with ONE uniform scale.
  Fixed sprite sizes: planet 84 px (globe ~74), hole 100 px, ship 48 px. The target planet gets a glow,
  a pulsing ring and a label "BLUE/GREEN PLANET - land here!". The other planet and the holes get small labels. On leg 2
  only the departure blue-planet sprite may move (≤50 px) so the ship sits on its edge.
- **Measured by Claude (144 scenes = 12 layouts × 2 legs × 6 viewports):** stretch 1.0000. Direction
  error on screen vs real (ship→target, ship→holes) 0.00°. Planet globe ≥65 px (1024×768), 73–74 px
  elsewhere; hole ≥88 px. Smallest gap between objects 28.7 px. Leg-2 offset ≤49.5 px. Real drags aimed at
  the drawn target: leg 1 within 0.04°, leg 2 within 1.92°. Frame p95 16.8 ms in all phases at 1× and 4×. After deploy: 25/25 live files match the zip; a full L3 mission flown on the live site landed both legs.
  Real missions in the browser: 4/4 legs landed, gap 0. Worker failing twice: 0 errors. 0 overlaps, steering 96×100.
- **Open:** no real-iPad check yet (Safari, real touch, loading time, readability of the 12 px labels).

## V7c.2 – first start-screen fix (NOT RELEASED)
**Date:** 2026-10-21 (zip a3322c1f) · **Verdict:** NOT READY. Planets became big and labelled, but the view
used different horizontal and vertical scales: stretch up to 4.6×, and the direction to the target on screen
was up to 37° off the real one (landscape median 12–14°). Fixed in V7c.2b.

## ROLLBACK – V7b.5 live again (until V7c.2b)
**Date:** 2026-10-21 · commit 80140eb reverts 15b1383. Game files are identical to the
pre-release live commit 504a24a. Reason: Vikas's iPad test of V7c.1 found the Level 3 start-screen
planets too small to see (16–23 px in landscape). The fix is V7c.2 (codex-work/FIX_V7c2_PROMPT.txt).

## V7c.1 – Level 3 Deep Space Mission (ROLLED BACK)
**Date:** 2026-10-21 · **Status:** was live 13:32–about 13:45 (commit 15b1383, zip SHA c49a28e3…), then rolled back.
Released before a real-iPad test, by Vikas's decision.
- **iPad finding (Vikas):** at the Level 3 start (aim) the planets are almost invisible.
  Measured planet globe: 16 px (1024×768), 18 px (1180×820 / 1194×834), 23 px (1366×1024),
  25 px (820×1180), 31 px (1024×1366). Holes 27–51 px. The ship is a fixed 56 px. The start view fits the whole
  6400×5400 world, so the map uses about half the width. No target label. Claude's audit missed this: it
  did not measure the size of objects drawn on the canvas.
- **Changes vs Stage (d) zip 102be8d0:** only `level3.js` and `deep-cockpit.css`. If the ORBIT
  worker fails twice, the game no longer throws an error. Level 3 steering buttons go from 92 to 96 px. The flight hint
  is cleared on the result card. The button now says "Launch from the blue planet".
- **Measured by Claude (own Chrome/CDP harness, plain server):**
  - Frame p95 16.8 ms in every phase of L1/L2/L3 at 1× and 4× CPU (DPR 2, 1366×1024).
    Only the "Preparing deep space…" loading screen stalls (p95 117 ms at 1×, 583 ms at 4×).
  - 1366×1024, 1194×834, 1024×768: 0 overlaps, 0 off-screen. L3 steering 96×100,
    L2 96×96 / 112×112. 0 console errors, 0 missing files.
  - Worker served as HTTP 503 twice: 0 console errors, flight continues, "ORBIT had a problem. Try again."
  - Real L3 missions flown in the browser: every leg landed (6/6 across 102be8d0 and V7c.1),
    touchdown gap 0–2.2 px, max frame-to-frame jump 0.11% of width.
  - Wild starts (80° off + 0–4 s random steering, 480 flights, on 102be8d0, same physics):
    ORBIT route shown 95.6%; child-like follower lands 96.7%.
  - 10-minute idle on L3: p95 16.8 ms, heap flat at 1.71–1.74 MB, no errors.
  - After deploy: all 25 live files on GitHub Pages byte-identical to the zip (13:32 IST).
    tinyurl.com/CaptainSuji → …github.io/captain-suji-black-hole/game/ (200). One full L3
    mission flown on the live site: both legs landed, gap 0, 0 errors.
- **Codex:** S1–S4 L3 both orientations PASS; 10-min idle both orientations PASS.
- **Open issues:** real iPad not tested yet. The root `index.html` makes the browser
  request `/favicon.ico`, which gives a 404 (same as V7b.5, harmless). `SHA256SUMS.txt` inside the zip lists the old
  hashes for the 2 changed files (the file is not deployed).

## V7c Stage (d) final – polish, Level 2 proof, "Suji-proof" stress, final package
**Date:** 2026-10-19 (zip 20:32, SHA 102be8d0…) · **Verdict:** PASS with 2 small defects, fixed in V7c.1.
Codex fixed S3 at 20:15 (`level3.js`: worker error handling + one retry + "Try again"), reran
S3/S4, aggregate PASS. Claude's audit (2026-10-21): every non-negotiable passed except L3 steering
92 px (<96) and 1 console error when the worker fails twice.

### Stage (d) progress notes (2026-10-19, before the final zip)
- **Changes:** P1–P5 polish; Level 2 changes kept by user decision and proved (L1–L4); new
  `input-guard.js/.css` (blocks long-press menu, text selection, pinch-zoom); one-line planner
  change in `nav_worker.js` (skips routes that need more steering than the best one found).
  Game deltas vs Stage (c): cockpit.js, nav_worker.js, deep-cockpit.css, level3.js,
  realistic-art.js, input-guard.css/js, game/index.html. No frozen engine or Stage (a) tuning changes.
- **Measured:**
  - P1/P2: contact gap 3 px at both sizes; all 4 gauges point to named 500-unit fixtures.
  - P3: radar dots 6–8 px at 1024×768. P4: danger lamp inside the gauge.
    P5: 5 enter/Back cycles release 71,106,560 canvas bytes to 0; heap growth 30,180 bytes.
  - 10-minute idle: 12/12 windows landscape and 12/12 portrait.
  - Native tests: 16 active PASS; 2 documented legacy-policy FAIL.
  - Learning test: old learner retired as FAIL 130/200 (out of date); new child-like learner
    200/200, median 3 attempts, p90 5, max 8.
  - Level 2 routes: earlier run 246/246 working and 246/246 live (123 distinct missions).
    Isolated run before the planner change: 246/246 each, latency working p95 182.0 ms vs live
    176.8 ms. Planner change equivalence: identical plans in 246/246 cases.
  - Latency gate (user decision): PASS if working p95 ≤ live p95 × 1.10.
  - Frozen physics hashes verified (Level 1/2 match live, Level 3 matches accepted zip).
  - Static-server test of the exact deploy file list: all 3 levels pass.
- **Open issues:**
  - First stress matrix failed **S3** (Level 3 portrait re-entry: worker failed to load
    `level3_engine.js`). Fix so far is test-side only. If it fails again, the game needs a
    worker-error retry plus a "Try again" message.
  - Final rerun (492 routes → 60-case stress S1–S10 → aggregate) running since 19:08.
  - Not yet tested on a real iPad.

## V7c Stage (c) – cockpit (+ fixes B1–B4)
**Date:** 2026-10-19 (zip 15:50, SHA cde3e18f…) · **Verdict:** ACCEPTED
- **Changes:** new deep-cockpit.js/.css; changed level3.js, realistic-art.js, index.html. Metal
  struts with rivets, dashboard with speed dial, gravity gauge, ORBIT lamps, round radar, digital
  distance, 92×100 steering buttons. Red full-screen tint replaced by a red border + lamp.
- **Measured:** no overlaps at 5 sizes. B2 lazy bake behind "Preparing deep space…": 1.85 s at
  1×, 5.6 s at 4× (desktop); 71 MB baked art. B3 2048 landing textures. B4 Doppler ratio
  1.74–3.60. Render p95 ≤4.8 ms at 4× (desktop).
- **Open issues (sent as P1–P5):** ship ~10–15 px above the drawn limb; gravity gauge says BLUE
  in hole close-ups; radar too small/dim; lone red lamp; free the 71 MB on Back. Not tested on iPad.

## V7c Stage (b) – realistic visuals
**Date:** 2026-10-19 (zip 15:24, SHA 4b6de8b2…) · **Verdict:** ACCEPTED with fixes B1–B4 (folded into c)
- **Changes:** index.html (+realistic-art.js), level3.js, new realistic-art.js (6 KB). Blank-view
  bug fixed (resize now redraws). Lit, textured planets; holes with photon ring and disk.
- **Measured:** render work p95 0.2–4.0 ms at 4× on a desktop GPU (not an iPad result).
- **Open issues:** B1 landing dust not visible; B2 art baked at page load even for L1/L2
  (~340 ms pixel maths); B3 landing limb shows stair steps; B4 weak Doppler, far holes look
  like ringed planets.

## V7c Stage (a) – Level 3 layouts and difficulty
**Date:** 2026-10-19 (zip 11:48, SHA 39c79ffb…) · **Verdict:** ACCEPTED (+1 carry-over fix)
- **Changes:** 12 explicit layouts, starts on 4 edges, gap angles 6–174°, hole separation 1760–2419.
- **Measured (Claude's own re-run, seed 777, 300 randomised per leg/layout):** default-aim no-steer
  24/24 lost (14–24 s); planner succeeds on all 24. Randomised no-steer L1 6.3–10.0% per layout,
  L2 0–6.7%. 0 early (<4 s) hole/planet deaths; L2 first hole fall ≥6.9 s.
- **Earlier send-back (same day):** the 12 "designs" were one layout with small changes; green
  planet sat in leg 1's launch path.
- **Open issues:** empty flight view in screenshots at 1194×834 / 1024×768 / 1180×820 (fixed in
  b); 1024×768 bottom buttons clipped, Sound-on overlaps DISTANCE (fixed in c).

## V7c – first build and rebuild
**Date:** 2026-10-18 · **Verdict:** HOLD / send back, then accepted as base
- First zip: Level 3 could not start (engine API and element-ID mismatches); 5/24 (20.8%)
  no-steering landings; leg 1 landed in ~5.5 s; effectively 4 layouts.
- Rebuild (codex-work): Level 3 loads, leg times 10–16 s, 14/15 test files exit 0;
  learning_pilot 130/200 (already failing in V7c). Visuals still cartoon; 2nd hole beyond the
  blue planet.

## V7b.5 – richer ORBIT routes
**Date:** 2026-10-17 · **Status:** was live on v7b-development (commit 504a24a); replaced by V7c.2b on 2026-10-21 (and briefly by V7c.1 earlier that day)
- **Changes:** 25-second segmented ORBIT worker search, 1500-unit soft world boundary,
  45-second flight limit, off-path recovery advice, map auto-framing, explicit left/right ORBIT
  arrows, forced fresh cockpit assets.
- **Measured (repo README):** 0.3 s lookahead fairness pilot landed 490/492 (123 pairs × 4);
  pairs 105 and 109 landed 3/4. Landing median 9.175 s, max 27.954 s.
- **Open issues:** browser frame timing and iPad performance not measured. Playtest: Suji
  ignored the text arrows and did not understand the gravity meter.

## V7b.2 – V7b.4 – cockpit navigation
**Date:** 2026-10-17
- V7b.2: Cockpit Navigation Build (Level 2 added) with a release-gate doc.
- V7b.4: steering, ORBIT nav computer, cleaner HUD, star streaks.
- V7b.3 steering test (repo test-results.txt): 40.0000 °/s at speeds 150, 260, 380.
- No other measured results recorded.

## V7a – start of V7
**Date:** 2026-10-17 · Implementation started with a scoped acceptance tracker. No measured
results recorded.

## V6 – first release (backup on branch main)
**Date:** 2026-10-16 · First GitHub Pages release (Level 1). Kept on `main` as a backup.
No measured results recorded.
