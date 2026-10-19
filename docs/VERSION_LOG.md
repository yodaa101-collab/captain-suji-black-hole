# Version log – Captain Suji

Newest first. Every number here is copied from a source file (named in each entry). Nothing is
estimated. Where the sources record no measurement, the entry says so.

Sources: `docs/history/STATUS-handoff.md`, `docs/history/audit-log.md`,
`docs/history/prompts-V7d.md`, `docs/history/CAPTAIN_SUJI_CHECKPOINT.txt`, and for V6–V7b this
repo's git history, `README.md` and `test-results.txt`.

---

## V7c Stage (d) – polish, Level 2 proof, "Suji-proof" stress, final package
**Date:** 2026-10-19 · **Status:** IN PROGRESS (not packaged, not deployed)
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

## V7b.5 – richer ORBIT routes (LIVE)
**Date:** 2026-10-17 · **Status:** live on v7b-development (tinyurl.com/CaptainSuji)
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
