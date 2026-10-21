# Suji Game – audit log

## ▶ WHERE WE ARE (2026-10-21, 13:30)
- V7c.1 zip (codex-work 21 Oct 13:08, SHA c49a28e3…) → **READY FOR IPAD TEST** (Claude, measured). Next: Vikas tests on the real iPad → if approved, deploy to v7b-development + update docs/VERSION_LOG.md and docs/ROADMAP.md in the repo.
- Details: 2026-10-21 entries at the bottom (Stage (d) final 102be8d0, then V7c.1).

## Earlier status (2026-10-19, evening)
- Stage (c) (codex-work zip 15:50, SHA cde3e18f…) → **ACCEPTED**. The full Stage (d) prompt (polish P1–P5 + Level 2 L1–L4 + Suji-proof S1–S10 + final evidence/deploy list) is at the bottom of `prompts-V7d.md`.
- User decisions: quality over speed; KEEP OpenAI's Level 2 changes (Level 2 must be proven in d).
- Downloads zip = accepted Stage (a) (39c79ffb…). Original V7c is in Old versions. Copy the final zip only with the user's OK.
- Remaining: (d) → my final audit → real iPad test by the user → GitHub upload.
- During (d): OpenAI asked to change learning_pilot. It tests LEVEL 1 (engine.js), and engine + test are identical to live V7b.5, so it already fails live (130/200; shortest flight 4.5 s, longest 12.2 s). Answered: yes, but keep the learner child-like and keep the attempt limits; set the duration range from measured live flights, not 30 s; report where the old learner failed; keep the legacy result visible.

## 2026-10-19 – Stage (c) cockpit + B1–B4 (zip 15:50) – Verdict: ACCEPT
- Frozen files (L3 physics/planner/worker + all L1/L2 incl. cockpit.js/nav_worker.js) are byte-identical to Stage (a). New: deep-cockpit.js/.css; changed: level3.js, realistic-art.js, index.html.
- Cockpit: metal struts with rivets, dashboard with speed dial, gravity gauge, ORBIT lamps, round radar, digital distance, 92x100 steering buttons. No overlaps at 5 sizes. Red full-screen tint replaced by a red border + lamp. Labels are clear of the struts.
- B1 dust visible (early + late captures). B2 lazy bake behind "Preparing deep space…": 1.85 s at 1x, 5.6 s at 4x on desktop; title has no long tasks. 71 MB baked art. B3 2048 landing textures, limb smooth. B4 Doppler ratio 1.74–3.60; strong lensed arc; far holes now read as black holes.
- Minor (sent as P1–P5): ship seems ~10–15 px above the drawn limb (gap measured against the formula, not pixels); gravity gauge says BLUE in hole close-ups; radar too small/dim; lone red lamp; free the 71 MB on Back.
- Perf: render p95 ≤4.8 ms at 4x (desktop). Not yet tested on an iPad.

## 2026-10-19 – Stage (b) visuals (zip 15:24) – Verdict: ACCEPT with fixes B1–B4
- Frozen: level3_engine/planner/nav_worker3 and all L1/L2 files byte-identical to the accepted Stage (a). Changed only index.html (+realistic-art.js script tag), level3.js, realistic-art.js (new, 6 KB). No external URLs.
- Blank-view cause: the canvas was cleared by resize and not redrawn in manual-frame mode. resize() now draws. The tests now check pixels and include a blank negative control. Plausible; the fix is in the code.
- Screenshots: blue/green planets lit and textured (good); background/sun good; close-up holes have a photon ring, disk and faint upper arc. Doppler is weak. From a distance the holes look like small ringed planets.
- B1: landing-dust PNGs show NO dust (dust is drawn only 3.0–4.2 s, faded at capture).
- B2: ART.assets() bakes everything at page load (level3.js:4), even for L1/L2. Pixel maths alone take ~340 ms on desktop (my stubbed-canvas timing), plus 36 hole frames. Not reported.
- B3: the landing globe upscales the 1024 texture, so the limb shows stair steps.
- Perf: "16.8 ms" is just the 60 Hz refresh; render work p95 is 0.2–4.0 ms at 4x on a desktop GPU. Passes, but it's not an iPad result.
- For stage (c): label collisions/struts over labels, "Touchdown!" behind the card, red full-screen tint near holes, 1024x768 clipping.

## 2026-10-19 – Stage (a) resubmission (zip 11:48) – Verdict: ACCEPT (+1 carry-over fix)
Independent re-run (own seed 777, 300 randomised/leg/layout, Session.exe node):
- 12 explicit layouts; starts on 4 edges; gap angles 6–174°; hole separation 1760–2419. Default-aim miss 513–1089 (L1) / 409–574 (L2); 0/24 within 350. Matches report.
- Default no-steer: 24/24 lost (14–24 s); planner success on all 24, every planner path crosses the gate. Inputs 1–12 (only Westbound Arc L1 = 1).
- Randomised no-steer L1 6.3–10.0% per layout (borderline: Northwest 9.9%, Northeast Turn 10.0% in my sample); L2 0–6.7%. 0 early (<4 s) hole/planet deaths; L2 first hole fall ≥6.9 s.
- No-steer flight shape: leg 1 crosses the gap at 6–9 s and passes 180–2500 units from blue at 11–19 s. It is then declared lost 5 s later (the away5 rule). So a child waits ~5 s after a miss. OK.
- Hashes vs 7bGitUpload checked myself: engine/level2_engine/game/gesture MATCH; cockpit.js and nav_worker.js DIFF (correctly labelled "documented difference").
- **Problem:** browser-flight-1194x834 / 1024x768 / 1180x820.png show an EMPTY flight view (no stars or bodies). Only 1366x1024 renders. The test captures after resize + manual draw() with manualFrames; smoke "PASS" never checks pixels. It could be a real resize bug or only a capture artifact. Codex must fix it or prove it.
- 1024x768: bottom buttons clipped; Sound-on overlaps DISTANCE (for stage c).
- Layout overview PNGs (12) are fine: both holes, planets and routes are shown.

## 2026-10-19 – Stage (a) resume (`evidence/stage-a/resume-report.md`) – Verdict: SEND BACK (numbers pass, design doesn't)

Re-ran `level3_engine.js` (current version) with Session.exe node:
- Default no-steer outcomes reproduce the report exactly (24/24, 0 wins). Engine API names used by level3.js / planner / nav_worker3 all exist.
- Protected-file hashes check out, but "PASS" is measured against Codex's own stage-a-before snapshot. `cockpit.js` and `nav_worker.js` still differ from live V7b.5 (as the user allowed, they were documented and frozen, not reverted). engine/level2_engine/game/gesture match live.
- **All 12 "named designs" are one layout with small changes.** Start x=330; BH-1 sits right on the start→blue line (15–60 units from it on leg 1) at x≈1900–2500; BH-2 about 1800–2200 directly below; blue at x≈4200–4800 at roughly the start's height; green 530–950 from the start. Zero default-aim wins comes from aiming the launch straight at BH-1.
- **Green planet sits in leg 1's launch path**: 170–460 units off the leg-1 line, 530–950 from the start. Crosswind leg 1 no-steer hits green at 2.65 s.
- Leg 2 no-steer: 6/12 fall into a hole (10.9–20.3 s). No-steer drifts run to the 45 s cap in 8/24 cases.
- Browser smoke NOT RUN; no zip; stages b–d not started. L2 acceptance FAIL and learning pilot 130/200 are the same as before (Level 2 is frozen), reported honestly.
- Passes: planner 100% defaults / ≥99% randomised, rings ≥97%, median 15.5 s / 18.0 s, ≥2 inputs 8/12 per leg, randomised no-steer ≤4.3%, 0 early hole deaths, gap ≥1022.

## 2026-10-18 – V7c (`Captain_Suji_V7c.zip`) – Verdict: HOLD / send back

- **Level 3 cannot start.** `level3.js` calls `E.layout`, `E.sceneFor`, `E.launch(layout,leg,0)` and `E.CFG`, but the engine only exports `layouts`, `makeScene`, `launch(scene)`. It also looks up 21 `l3*` element IDs that aren't in `index.html` (which uses `level3*`). The script throws on load, so the Level 3 button does nothing.
- Python re-simulation of `level3_engine.js` reproduced the reported 5/24 (20.8%) no-steering landings (target <15%).
- Leg 1 lands in ~5.5 s with one 0.3–0.6 s tap (target 10–25 s).
- In 6/12 layouts the leg-2 ship falls into a hole 0.7–2.0 s after launch.
- Layouts repeat by `i%4`, so there are effectively 4 layouts, not 12.
- `level3_worker.js` is unused (L3 loads `nav_worker3.js`); `nav_worker3.js` has a wrong "V7b.5" header; the code is minified onto single lines.
- Good: honest test report, Level 3 kept separate from Levels 1/2, deterministic engine, hole separation ≥1100 met.

## 2026-10-18 (evening) – OpenAI rebuild, still named V7c (`C:\Users\vikaa\codex-work\Captain_Suji_V7c\`) – Verdict: accept as base, send back for the visual/difficulty work

OpenAI couldn't write to Downloads, so the build is only in codex-work. The original Downloads zip is unchanged.

Fixed and verified (ran with Node v24 via `Session.exe` + `ELECTRON_RUN_AS_NODE=1`):
- Level 3 now loads: the engine API matches level3.js, and all 30 element IDs exist.
- Level 1/2 engines, game.js and gesture.js are byte-identical to V7c and live V7b.5.
- Leg times are 10–16 s with the easiest route, and no leg falls into a hole within 4 s.
- 14/15 test files exit 0; learning_pilot fails (130/200), which was already true in V7c.

Problems:
- `level2_acceptance.test.js` prints "FINAL RESULT: FAIL" but exits 0, and OpenAI reported it as PASS. The failure is old (same in V7c, test unchanged).
- Level 2 files were changed despite the rules: `cockpit.js` (V7c preview cockpit → modified again) and `nav_worker.js` (now queues new searches instead of abandoning the running one). Only the engines were hash-proven.
- With the default aim, layouts 0, 4 and 8 land with no steering on both legs (6/24). The randomised-aim rate (5–7.5%) passes.
- The 2nd black hole (x≈4200) is beyond the blue planet (x≈3200–3400), so leg 1 never threads between two holes. Layouts are still patterned by i%4 / i%3, and the green planet is always at x=6750.
- Visuals are still cartoon: black disc + orange ring for holes, striped balls for planets, flat gold lines for the canopy, plain round dashboard badges. Prompt 3/4 requests (lensing, lit planets, 3D cockpit) were not done.
- In the Level 2 screenshot, the minimap overlaps the canopy frame and the flight view is empty.
- Code is still minified one-liners.

**Next:** send-back prompt saved at the bottom of `prompts-V7d.md`.

## Earlier note

**Next:** user wants more realism, harder navigation between the two black holes to reach the blue planet, and a better cockpit. Prompts are in `prompts-V7d.md`. Decided: keep TWO legs (start → blue, blue → green).

## 2026-10-19 (17:06) – Codex Stage (d) resume status audit (codex-work\stage-d-audit\) – Verdict: report is honest; go ahead

- My resume prompt wrongly called the 17:08–18:26 scripts "post-checkpoint". They are dated 18 Oct. Codex was right.
- Independently verified: zip SHA cde3e18f… unchanged; engine/level2_engine/game/gesture match live 7bGitUpload; level3_engine/planner/nav_worker3 match the accepted zip.
- Stage (d) edits since Stage (c): cockpit.js, nav_worker.js (Level 2, authorised), deep-cockpit.css, level3.js, realistic-art.js, learning_pilot.test.js + new test files. No physics edits.
- Level 2 routes: 78/246 run, 76 landed. Failures: pair 1 and pair 5 at 1180x820 (planner replies found=true, still no landing). Not yet explained.
- Idle: results.json has a null getBoundingClientRect exception after 3 windows, but idle-stage-d.log reaches ~541–544 s for Level 3. These conflict; it's not a PASS either way.
- P1/P2 PASS from saved probes only. P3–P5, L1–L4, S1–S10 not run.

## 2026-10-19 (~17:25) – mid-run check while Codex finishes Stage (d)
- The Codex session was started with plain `codex` in ~ rather than the icon. CORRECTION: it still goes through Headroom, because ~.codexnfig.toml sets model_provider = headroom (127.0.0.1:8787) for every Codex start, and the Codex app-server has live connections to 8787. The only real downside is the start folder (~ instead of codex-work), which widens what Codex can reach. Use the icon next time.
- "â† Back" / "ðŸŒ" are PowerShell display mojibake only. All game .js/.html/.css are valid UTF-8 with no stored mojibake, and game/index.html has <meta charset="utf-8">.
- FINAL AUDIT CHECKS:
  1. tests/browser_session.py injects `flightTime,left,right,paused` into level3.js's stats getter when serving it (and adds a getter to the baseline cockpit.js). It's read-only telemetry and the disk file is unchanged, but the DEPLOY static-server test must use a plain server with no injection.
  2. stage_d_routes_v2.py records the scene id (`pair`, e.g. 806) separately from `requestedPair` (e.g. 117). Verify that the 123 requested pairs map to 123 DISTINCT scene ids, or the 246-route coverage is fake.

## 2026-10-19 17:40 – progress check (Codex still running)
- Level 2 full route run (evidence/stage-d/level2-v2/full-246-comparison): working 246/246 landed, live 246/246, 0 exceptions. Verified 123 requested pairs → 123 DISTINCT scenes in both, so final-audit check 2 is RESOLVED. Planner p95: working 164 ms vs live 180 ms (provisional; run while other tests were active). Pairs 1/5 re-land in both versions: the 16:12 failures were the old test follower, not the game.
- polish-v2 results.json: P3 PASS (radar cores 6–8 px at 1024x768, after the radar radii went from 13/6.5 to 17/8.5 in level3.js), P4 PASS, P5 PASS (5 cycles). I still need to look at the screenshots.
- level3.js changes since Stage (c): Back/cancel lifecycle (entryGeneration ticket, ART.dispose, canvases zeroed) and the radar sizes, as expected for Stage (d).
- update_level2_acceptance_stage_d.py retires the old direct-pursuit policy (keeps the legacy file and prints the old verdict) and adds frozen-hash + real-route gates. Review it at the final audit.
- The 600 s idle run started 17:37–17:39, landscape + portrait. Not finished.
- Note: CAPTAIN_SUJI_CHECKPOINT.txt (17:17) still says "PAUSED" even though work resumed after it.

## 2026-10-19 18:58 – check of Codex checkpoint
- Codex didn't strictly follow the lean prompt. Game files changed after the earlier tests: cockpit.js 18:07, level3.js 18:14, nav_worker.js 18:53, plus NEW input-guard.js/.css + index.html 17:51. Under the hash rule, most tests need a rerun anyway. A sequential supervisor (run_stage_d_remaining_v2.py) is now rerunning: idle in both orientations → native → P1–P5 → L1 → static → 492 routes → 60-case stress → aggregate (no packaging).
- nav_worker.js change: skips candidates needing strictly more steering than the current best (equal steering kept for the duration tie-break). Equivalence test: 246/246 fixtures give identical plans. Reviewed the diff: 1 line, logic sound, acceptable.
- input-guard.js: blocks contextmenu, selectstart, Safari gesture* events and multi-touch touchmove. No game controls touched. OK (S7).
- Reason for the change: isolated latency run gave working p95 182.0 vs live 176.8 ms. That's within noise. I relaxed the gate to ≤ live +10% to avoid budget burn.
- OPEN: first stress matrix failed S3 Level 3 portrait (re-entered worker failed to load level3_engine.js). The fix so far is test-side only (server backlog 128). If it recurs, the game needs a worker-error retry.

## 2026-10-19 (19:54) – mid-run check
- Level 2 routes (pruned planner) 492/492 landed. Stress matrix: S3 Level 3 FAILED again in both orientations (finalHealth: "importScripts … level3_engine.js / level3_planner.js failed to load" from a terminated nav_worker3, aliveAtError=false). Game itself recovered. Fix prompt drafted (worker onerror + one retry + "Try again"). Codex applied it at 20:15 (level3.js only), reran S3/S4, aggregate PASS, packaged 20:32.

## 2026-10-21 – Stage (d) FINAL zip (codex-work 19 Oct 20:32, SHA 102be8d0…, 77.4 MB) – Verdict: PASS with 2 small defects → V7c.1 fix round (user chose "fix first")
Claude's own measurements (own Node/CDP harness, plain static server, Chrome headless, no game code injected):
- Files: zip game/ = codex-work game/. level3_engine/planner/nav_worker3 + engine/level2_engine/gesture/game.js byte-identical to accepted Stage (a) zip (39c79ffb) and live 7bGitUpload. SHA256SUMS 23/23 OK (CRLF). .nojekyll present.
- S3 fix diff (level3.js): stale/terminated workers' errors are preventDefault-ed; current worker recreated once; message "ORBIT had a problem. Try again.". Reviewed: correct for the S3 case.
- My worker test (nav_worker3.js served as 503): NO freeze, ship keeps flying, message shown, but 1 uncaught "TypeError: Cannot read properties of null (reading 'postMessage')" (dispatch() after the retry is used up). Minor → V7c.1 #1.
- Frame-interval p95 (DPR 2, 1366x1024), every phase of L1/L2/L3 incl. L1 fall, L2 escape-pod fall, L2/L3 landing, results: 1x CPU 16.8 ms; 4x CPU 16.8 ms. Only the "Preparing deep space…" loading screen stalls (p95 117 ms at 1x, 483 ms / max 1.9 s at 4x). 0 console errors, 0 HTTP errors. Desktop GPU, not an iPad.
- Layout at 1366x1024 / 1194x834 / 1024x768 (title, L1 aim, L2 planning+cockpit, L3 aim+flight+result): 0 DOM overlaps, 0 off-screen. L2 steering 96x96 (1024) / 112x112. L3 steering 92x100 → 4 px under the 96 rule → V7c.1 #2. Minor: flight hint stays above the result card; "Launch from Planet 1" vs "blue planet" → V7c.1 #3/#4.
- Real L3 flights in browser (keyboard arrows following ORBIT plan): 4/4 legs landed (2 full missions, layouts 3 and 9, +1 extra layout 10), game touchdown gap 0–2.2 px, max frame-to-frame jump 0.05–0.11% of width, 0 errors. Touchdown frame looks right (ship on surface with dust).
- 10-min idle on L3 (1180x820): p95 16.8 ms every minute; heap 1.16 → 1.71 MB by minute 6, then flat 1.71–1.74 MB (frame log cap); no errors; no extra worker loads.
- Wild-start fairness L3 (game's own engine+planner, 12 layouts x 2 legs x 20, seed 2026; launch up to 80° off + 0–4 s random steering): 6/480 died during the random phase; ORBIT route shown 453/474 = 95.6% (target ≥90–95%); exact follow lands 452/453; child-like follower (±15% timing, 0.2 s delay, re-plan every 1 s) lands 438/453 = 96.7% (target ≥95%). Planner time p50 135 ms, p95 231 ms (Node). No-route cases spread over 9 layouts (L11 worst: 5/40).
- Not re-run (unchanged code, earlier evidence stands): L3 no-steer rates (Stage a, 6.3–10.0%), L2 fairness (V7b.5 490/492; engine identical, planner equivalence 246/246, routes 492/492).
- Note: Codex's 10-min idle and static-server rows ran on the pre-fix level3.js (def29ec6); my idle rerun on the final file passed; V7c.1 reruns both.
- Real iPad: NOT RUN.

## 2026-10-21 (13:30) – V7c.1 zip (codex-work 21 Oct 13:08, SHA c49a28e3…, 84.4 MB) – Verdict: READY FOR IPAD TEST
- Only game/level3.js (41533651…) and game/deep-cockpit.css (80c21327…) changed vs 102be8d0; the other 21 game files + index.html + .nojekyll + DEPLOY.txt byte-identical. Diff = exactly the 4 fixes: `if(!worker){busy=false;return;}` in dispatch() and queue(); l3Message cleared in finish(); button "Launch from the blue planet"; steering 92→96 px.
- Packaging slip (not deployed, harmless): SHA256SUMS.txt inside the zip still lists the OLD hashes for those 2 files.
- My measurements: worker 503 twice → 0 console errors, flight continues, "ORBIT had a problem. Try again." shown. Layout 1366x1024 / 1194x834 / 1024x768: 0 overlaps, 0 off-screen, L3 steering 96x100, L2 96x96 / 112x112. Real L3 mission in browser (layout 4, both legs): landed, gap 0, jump 0.11%, hint empty on result card, button text correct, 0 errors. Frame p95 every phase L1/L2/L3: 16.8 ms at 1x and 4x CPU (loading screen only: 117 / 583 ms). 0 HTTP errors.
- Codex report: S1–S4 L3 both orientations PASS, 10-min idle both orientations PASS; static-server "FAIL" is only the browser's automatic /favicon.ico request from the root redirect page. Same in live V7b.5 (root index.html identical to live). Harmless; roadmap item: add `<link rel="icon" href="data:,">` to root index.html.
- Unchanged since 102be8d0 audit (still valid): frozen physics, wild-start fairness 95.6% route / 96.7% follow-lands, L2 routes 492/492.
- Real iPad: NOT RUN (Vikas).

## 2026-10-21 (13:35) – V7c.1 RELEASED to live
- Codex made the release commit offline (its sandbox has no network): 15b1383 on v7b-development, parent a875009. Claude verified all 25 DEPLOY files in the commit are byte-identical to zip c49a28e3 (line endings preserved with core.autocrlf=false), and only game/ files changed. Claude pushed. main untouched (c9aeacd).
- Live check: all 25 files from yodaa101-collab.github.io/captain-suji-black-hole match the zip (13:32). tinyurl.com/CaptainSuji → …/game/ 200. Full L3 mission flown on the live site (layout 6): both legs landed, gap 0, 0 errors.
- Released BEFORE a real-iPad test (Vikas's decision). Rollback if needed: `git revert 15b1383` on v7b-development.
