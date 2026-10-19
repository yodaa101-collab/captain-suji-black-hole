# Prompts for OpenAI – V7c → V7d

Send them **one at a time, in order**. Don't start Prompt 2 until Prompt 1's smoke test shows 0 errors. After each step, bring the zip back to Claude for audit.

✅ Decided 2026-10-18: Level 3 keeps TWO legs (start → blue planet, then blue → green planet). The go-ahead prompt at the bottom overrides any single-flight wording in Prompt 2.

---

## Prompt 0 – Ground rules (paste first)

```
You are working on "Captain Suji – Black Hole Challenge", a browser game for a child,
played on an iPad. I am attaching Captain_Suji_V7c.zip. Produce Captain_Suji_V7d.

Hard rules for every task I give you:
1. Do NOT change Level 1 or Level 2 behaviour. engine.js, level2_engine.js, nav_worker.js,
   game.js and cockpit.js must stay byte-identical unless I explicitly say otherwise.
   Prove it with a SHA-256 list of those files before and after.
2. Write readable source: normal line breaks, indentation, named functions. No minified
   one-line files.
3. Do not claim something passes unless you actually ran it. For each acceptance item,
   report PASS / FAIL / NOT RUN with the real number measured.
4. Deliver: the full zip, an updated test-results.txt, and screenshots of what you changed.
5. Keep all drawing on canvas, no external libraries, no network assets. It must work
   offline on GitHub Pages.
```

---

## Prompt 1 – Fix Level 3 so it actually runs

```
Task 1 – Level 3 is broken and cannot start. Fix it before anything else.

Audit findings:
- game/level3.js calls E.layout(), E.sceneFor(), E.launch(layout, leg, 0) and
  E.CFG.planetRadius, but level3_engine.js only exports layouts, makeScene(), launch(scene)
  and has no CFG.
- level3.js looks up 21 element IDs (l3Canvas, l3Map, l3Arena, l3Frame, l3Back, l3Nav,
  l3Pause, l3Ask, l3Bulb, l3TrafficText, l3Lesson, l3Result, l3ResultTitle, l3ResultText,
  l3Again, l3NewMission, l3Leg, l3Message, l3Speed, l3Distance, l3RingsUsed) that do not
  exist. index.html uses level3Canvas, level3Back, etc. and has no pause/ask/traffic-light/
  result elements. The script throws on load at $('l3Canvas').getContext, so the Level 3
  button never gets a click handler.
- There are two Level 3 workers. level3_worker.js is unused. nav_worker3.js has a wrong
  "V7b.5" header.

Do:
- Make level3_engine.js, level3.js, the worker and the Level 3 HTML/CSS agree on ONE API and
  ONE set of element IDs. Export a CFG object (planetRadius, holeRadius, etc.) from the engine.
- Delete the unused worker. Fix the header comment.
- Add a real browser smoke test (Playwright + Chromium, served over http://, not file://,
  because Web Workers fail on file://). It must: open the start page, click Level 3, fly
  for 5 seconds holding right, then fly 5 seconds holding left, and fail on ANY console
  error or page error. Test at 1366x1024, 1194x834 and 1024x768.

Acceptance:
- Smoke test: 0 errors at all 3 sizes; screenshots of Level 3 in flight at each size.
- Route worker returns at least one plan within 1 second of launch (report the time).
```

---

## Prompt 2 – Make Level 3 harder (between two black holes)

```
Task 2 – Make Level 3 navigation more challenging and more interesting.

Mission (decided 2026-10-18): TWO legs. Leg 1: launch point → BLUE planet. Leg 2:
launch from the blue planet → GREEN planet. On every leg, the best route threads the gap
BETWEEN the two black holes. A failure restarts only the current leg.

Audit measurements of the current V7c engine (reproduce these first to prove your harness
matches mine):
- No-steering: 5/24 legs land (20.8%), all in about 5.6 s.
- Every leg-1 route lands in about 5.5 s with one 0.3–0.6 s tap. Far too easy and short.
- In 6 of 12 layouts, the leg-2 ship falls into a hole 0.7–2.0 s after launch.
- The layouts only really vary by i%4, so there are effectively 4 layouts, not 12.

Do:
- Redesign 12 genuinely different layouts (vary hole positions, hole masses, gap width,
  green planet position and blue planet position independently, deterministic seeds).
- In every layout the straight line from start to the blue planet must pass inside a black
  hole's danger zone, so flying straight is never the answer.
- Black holes at least 1100 units apart. The gap between them must be wide enough to fly
  through: at least 3x the ship's turning radius at cruise speed.
- Gravity from all 4 bodies, deterministic fixed-timestep physics (keep DT=1/240 and the
  40°/s steering rate shared with Level 2).

Acceptance (measure across all 12 layouts, plus 1000 randomised launch-angle/speed
variations around each layout's start):
- No-steering landing rate below 10%.
- No unavoidable death: the ship never hits a hole within 4 s of launch with no steering.
- The best route found by the planner needs at least 2 separate steering inputs in at least
  8 of 12 layouts.
- The planner finds a winning route from launch in 100% of the 12 layouts, and from at least
  90% of the randomised starts.
- Median flight time to the blue planet with the planner's route: 15–30 s.
- A "rings follower" bot (steers to the next ring only) lands in at least 90% of layouts.
- Report a table: layout, no-steer outcome, best route, flight time, number of steering inputs.
```

---

## Prompt 3 – More realistic space, black holes and planets

```
Task 3 – Make Level 3 look realistic (think the film Interstellar, but friendly for a child).
Replace the cartoon look.

Black holes:
- Pure black shadow (event horizon) with a thin, bright photon ring at its edge.
- Tilted accretion disk with hot white-yellow inner glow fading to orange/red at the edge.
- Doppler beaming: one side of the disk clearly brighter than the other.
- Gravitational lensing: the far side of the disk is visible bent up over the top of the
  shadow. Stars behind and near the hole are visibly stretched/distorted.
- Slow disk rotation animation.

Planets:
- Lit from one consistent star direction, with a soft day/night terminator line.
- Procedural surface texture (noise-based continents/oceans for blue, bands/storms for
  green), separate slowly drifting cloud layer, thin glowing atmosphere rim.
- No black outlines or flat cartoon fills.

Background:
- Starfield with realistic star colours (blue-white to orange) and sizes, 3 parallax depths.
- Faint Milky Way band and soft nebula clouds, subtle and dark.
- A small distant sun that matches the lighting direction on the planets.

Landing:
- Cinematic approach: the blue planet grows to fill the lower screen, the atmosphere glows,
  then touchdown with dust. The ship must visibly touch the surface (gap of 3 px or less) and
  must not jump (no more than 4% of viewport width in one frame).

Performance (this is an iPad game):
- Pre-render all heavy artwork once to offscreen canvases at 2–3 sizes. No per-frame noise
  generation, no per-frame shadowBlur on large shapes.
- Frame time p95 at most 17.5 ms at 1x CPU and at most 25 ms with Chrome 4x CPU throttling.
  Measure and report it.

Deliver screenshots: each black hole up close, each planet up close, mid-flight between the
two holes, and the landing.
```

---

## Prompt 4 – Better cockpit

```
Task 4 – Redraw the Level 3 cockpit so it feels like a real spaceship cockpit.

- Canopy: the window frame drawn as 3D metal struts (shading, highlights, bolts/rivets),
  following the curve of a cockpit window, not flat lines. A very faint glass reflection
  and edge glare on the window.
- Dashboard across the bottom 20–25% of the screen: a dark panel with depth (bevels,
  shadows), containing real-looking instruments:
  • Speed dial with needle.
  • Gravity gauge showing which body is pulling hardest, with an arrow toward it.
  • Traffic light (red/amber/green) as glowing lamps: green = "let go, gravity will
    carry us".
  • Radar/minimap in a round bezel: both holes, both planets, ship, route.
  • RINGS ON/OFF toggle as a physical-looking switch.
  • Distance to the blue planet as a digital readout.
- Left/right steering buttons at least 88x88 px, styled like physical cockpit buttons,
  with a pressed state. Usable with thumbs on an iPad held in landscape.
- The ship's heading change should tilt the horizon/starfield slightly when steering.
- Cache the whole static cockpit frame to an offscreen canvas and redraw it only on resize.
- Must not cover the flight view: the centre 60% of the screen stays clear.
- Text readable by a child: at least 16 px, high contrast.

Acceptance: screenshots at 1366x1024, 1194x834, 1024x768 and an iPad landscape size; no
overlapping UI elements (report element bounding boxes); frame p95 still within Task 3
limits.
```

---

## Prompt 5 – Final evidence (use last)

```
Task 5 – Final check. Re-run every test (old Level 1/2 tests + all new ones) and give me:
1. test-results.txt with PASS/FAIL/NOT RUN and real numbers for every acceptance item in
   Tasks 1–4.
2. SHA-256 of the Level 1/2 files proving they are unchanged from V7c.
3. All screenshots in an /evidence folder.
4. A list of anything not done. Do not hide gaps.
```

---

## Send-back prompt after audit of OpenAI's rebuild (2026-10-18)

```
Audit result for your rebuild in C:\Users\vikaa\codex-work\Captain_Suji_V7c:
the Level 3 crash fix is ACCEPTED as the new base.
Saving: always save your latest work by OVERWRITING
C:\Users\vikaa\Downloads\Suji Captain\Captain_Suji_V7c.zip (keep that exact name).
Do not create extra zips or new version names until I say we are starting the next
version. After saving, tell me the zip's size and time so I can confirm it updated.

Fix these audit findings first:
1. tests/level2_acceptance.test.js prints "FINAL RESULT: FAIL" but exits 0, and you
   reported it as PASS. Report it as FAIL (pre-existing; same result in V7c). Do not
   hide failures because of exit codes.
2. You changed Level 2 files: cockpit.js and nav_worker.js (search queueing). The rule
   was Level 2 unchanged. Either revert them to V7c, or list every Level 2 change, why it
   was needed, and give side-by-side Level 2 screenshots against live V7b.5 (folder
   7bGitUpload) to prove gameplay looks and plays the same. Your Level 2 screenshot shows
   the minimap overlapping the canopy frame and an empty flight view: fix that.
3. With the default aim, layouts 0, 4 and 8 land on BOTH legs with no steering (6/24).
   No layout may win without steering from its default aim.
4. The second black hole (x≈4200) sits beyond the blue planet (x≈3200–3400), so the flight
   to the blue planet never passes between two black holes. Layouts are still patterned
   by i%4 and i%3, and the green planet is always at x=6750.
5. Source files are still minified one-liners. Make them readable.

Then do Prompts 2, 3 and 4 (difficulty, realistic visuals, realistic cockpit). The current
visuals are still cartoon: black disc with an orange ring for black holes, striped balls
for planets, flat gold lines for the canopy and plain round badges on the dashboard.
None of the realism or 3D cockpit requirements were implemented yet.

Same reporting rules: PASS / FAIL / NOT RUN with real numbers, screenshots, and
SHA-256 proof for every Level 1/2 file.
```

---

## Go-ahead prompt (two legs) – sent after Codex's plan in codex-work\updated.txt

```
Go ahead with your plan in C:\Users\vikaa\codex-work\updated.txt, with these answers:

1. Mission: KEEP TWO LEGS. This replaces the single-flight wording in Prompt 2.
   - Leg 1: launch point → BLUE planet. Leg 2: launch from the blue planet → GREEN planet.
   - On EACH leg, the best route must thread the gap BETWEEN the two black holes. Place the
     holes so that both legs have to pass between them (not around the outside).
   - A failure restarts only the current leg. Rings start ON for leg 1 and OFF for leg 2
     (turning them on in leg 2 counts as "rings used").
   - Apply every Prompt 2 target PER LEG (12 layouts x 2 legs = 24 cases): zero
     default-aim no-steering wins; randomised no-steering landings below 10%; no hole
     collision within 4 s of launch; at least 2 steering inputs in at least 8 of 12
     layouts per leg; planner route 100% from default starts and at least 90% from
     randomised starts; median flight time 10–25 s per leg (mission total 20–50 s);
     rings-follower success at least 90% per leg.
   - The leg-2 launch from the blue planet's surface must be safe and look right (ship on
     the surface, launching outward).
2. Level 2 is FROZEN this round. Do not edit engine.js, level2_engine.js, nav_worker.js,
   game.js or cockpit.js. Only DOCUMENT the earlier Level 2 changes (vs original V7c and
   live V7b.5) and the minimap/canopy overlap. We will fix Level 2 in a separate round.
3. Readability: leave the five protected files as they are; make the Level 3 sources and
   any new files readable.
4. Live V7b.5 is at C:\Users\vikaa\Downloads\Suji Captain\7bGitUpload. Read only; never
   modify it.
5. Playwright is allowed for testing only. Nothing external may ship in the game.
6. "Offline" means no internet/CDN assets. No service worker needed.
7. Saving: you cannot write to Downloads, so save the finished build as
   C:\Users\vikaa\codex-work\Captain_Suji_V7c.zip (overwrite it each time, no other zips),
   with test-results.txt and an evidence folder of screenshots. My auditor will check it
   and copy it to Downloads. Report the zip's size and time when done.

Work in this order and stop to report after each: (a) Level 3 layouts/difficulty with
the per-leg results table, (b) realistic visuals with screenshots, (c) cockpit with
screenshots and bounding boxes, (d) final full test run.
```

---

## Stage (a) send-back (2026-10-19)

```
Stage (a) audit of C:\Users\vikaa\codex-work\Captain_Suji_V7c (resume-report.md).
I re-ran level3_engine.js myself and your default-start table matches exactly. Your
statistics pass. Thank you for reporting the Level 2 FAILs honestly.
Verdict: SEND BACK. The numbers pass, but the layouts do not meet the design.

1. The 12 layouts are one layout with small changes. In every design the start is at x=330,
   BH-1 sits on the straight start->blue line (only 15–60 units from it), BH-2 is
   about 1800–2200 directly below, blue is at x≈4200–4800 at about the start's height,
   and green is near the start. "Zero no-steer wins" happens only because the default
   aim points straight at BH-1.
   Fix: make 12 layouts that really differ. Vary the start position/edge, the gap's
   angle (not always vertical), the gap's position (not always mid-map), and which side
   blue is on. Report for each layout: the gap angle, the gap centre, and the default-aim
   miss distance to the nearest hole. Across the 12 layouts:
   - gap angle range at least 90 degrees;
   - start positions spread over at least 2 edges;
   - the default aim must not point within 350 units of a hole centre in more than 4 of
     12 layouts per leg. Get the difficulty from curved gravity, not from aiming the
     launch at a hole.
2. The green planet is in leg 1's launch path (170–460 units off the leg-1 line,
   530–950 from the start). In Crosswind, no-steer leg 1 hits green at 2.65 s. Leg 1
   must not pass within 600 units of green. No leg may end with a planet collision
   within 4 s of launch.
3. Leg 2: 6/12 no-steer runs fall into a hole. That is allowed, but none may fall
   before 6 s. 8/24 no-steer runs drift until the 45 s cap. End a no-steer flight as
   "lost" once it is clearly off course (for example, more than 1500 units past the
   target or heading away for 5 s), so a child doesn't watch 45 s of nothing.
4. "Protected files unchanged: PASS" compares against your own stage-a-before snapshot.
   Also report hashes against live V7b.5 (7bGitUpload). Today cockpit.js and
   nav_worker.js differ from live. Keep them frozen and label them
   "documented differences", not PASS.
5. Run the browser smoke test (Playwright is allowed for tests). If approval blocks
   it, say exactly which command was blocked. Then save
   C:\Users\vikaa\codex-work\Captain_Suji_V7c.zip with test-results.txt and evidence.
   Include one screenshot per layout showing both holes, both planets, and the
   planner route for both legs.

Keep every existing Stage (a) target (per leg: 0 default no-steer wins, randomised
no-steer <10%, no hole death <4 s, ≥2 steering inputs in ≥8/12, planner 100%/≥90%,
median 10–25 s, rings ≥90%). Re-report the full per-leg table, then STOP for audit
before stage (b).
```

---

## Stage (a) accepted → go-ahead for Stage (b) (2026-10-19, audit of zip 11:48, SHA 39c79ffb…)

```
Stage (a) audit of C:\Users\vikaa\codex-work\Captain_Suji_V7c.zip (11:48, SHA-256 39c79ffb…).
I re-ran level3_engine.js and level3_planner.js independently with my own random seed
(300 launches per leg per layout). Your geometry, default no-steer outcomes, planner
results, early-death checks and hashes against live V7b.5 all reproduce.
Verdict: STAGE (a) ACCEPTED. Go ahead with Stage (b) (Prompt 3, realistic visuals).
Keep level3_engine.js physics, the 12 layouts and the lost rules FROZEN in Stage (b).
Any physics change means re-running the full Stage (a) sweep.

Fix this first, before any visual work:

0. Blank flight view at iPad sizes. In your own evidence, browser-flight-1194x834.png,
   browser-flight-1024x768.png and browser-flight-1180x820.png show an EMPTY flight view:
   no stars, no planet, no hole, no route. Only 1366x1024 shows the scene. The smoke test
   still says PASS, because it never checks the pixels. Find the cause (resize() resets the
   canvas; does a frame really get drawn afterwards, and does it get drawn on a real
   rotate or resize while the game loop is running?). Fix it if it's a game bug. If it's
   only a capture timing problem, prove that.
   Acceptance: at all four sizes, take the screenshot after at least 3 real
   requestAnimationFrame frames (not manualFrames). Do the same after a resize in the
   MIDDLE of a flight (1366x1024 -> 1180x820). Add a pixel check to the smoke test:
   the flight canvas must have at least 200 non-background pixels and the target planet
   or a hole must be visibly drawn. Make the test FAIL when the view is blank.
1. At 1024x768 the bottom row (NAV OFF / Ask ORBIT) is cut off at the screen edge, and
   "Sound on" overlaps the DISTANCE badge. Record this now. You will fix it in Stage (c)
   (cockpit, with bounding-box checks).

Notes (no change needed now): leg-1 randomised no-steer is close to the 10% limit in some
layouts (Northwest Passage 9.9%, Northeast Turn 10.0% in my sample). Stage (b) must not
change the physics, so these numbers must stay exactly the same.

Then do Stage (b) per Prompt 3 and STOP for audit. Deliver: the screenshots Prompt 3
asks for, taken at 1180x820 AND 1366x1024; frame-time p95 at 1x and 4x CPU throttling;
proof that the Stage (a) sweep numbers are unchanged (same per-leg table, or a hash of
level3_engine.js plus layouts unchanged). Save over C:\Users\vikaa\codex-work\Captain_Suji_V7c.zip.
```

---

## Stage (b) accepted with fixes → go-ahead for Stage (c) (2026-10-19, audit of zip 15:24, SHA 4b6de8b2…)

```
Stage (b) audit of C:\Users\vikaa\codex-work\Captain_Suji_V7c.zip (15:24, SHA-256 4b6de8b2…).
Checked: level3_engine.js, level3_planner.js, nav_worker3.js and all Level 1/2 files are
byte-identical to the accepted Stage (a) zip. Only index.html, level3.js and
realistic-art.js changed. Nothing loads from the internet. The blank-view fix and its
pixel test look right. Planets, background, sun and the close-up black holes are a big
improvement.
Verdict: STAGE (b) ACCEPTED, with 4 fixes. Do them FIRST, in this round, then do Stage (c).
Physics stays FROZEN (same hashes as above).

Fixes from Stage (b):
B1. Dust is not visible. In landing-dust-1180x820.png and landing-dust-1366x1024.png there
    is no dust: the dust is drawn only from 3.0 to 4.2 s and has faded by capture time.
    Make the dust last at least 1.5 s after touchdown. Capture the dust screenshot while
    the dust is at least 50% opaque, and report the time and opacity of each capture.
B2. All artwork bakes when the page loads (level3.js line 4: ART.assets()), even when
    Suji only plays Level 1 or 2. I timed the pixel maths alone at about 340 ms on a
    desktop, without the 36 black-hole canvas frames. Bake lazily when Level 3 starts,
    behind a short "Preparing deep space…" screen, or spread it over idle frames.
    Report: bake time at 1x and 4x CPU; the main-thread long tasks on the title screen
    (must be under 100 ms); total canvas memory of the baked art in MB.
B3. The planet looks blocky in the landing shots: the 1024 texture is stretched to about
    2000+ px, and the limb shows stair steps. Use a 2048 texture only for landing (baked
    lazily per B2) or smooth the edge. Its edge must have no visible steps at 1366x1024.
B4. Black-hole realism, from Prompt 3: (i) Doppler beaming must be CLEARLY visible.
    Measure the mean brightness of the brighter disk side vs the dimmer side: the ratio
    must be at least 1.6. (ii) The lensed far side of the disk must be clearly visible as
    a bright arc over the top of the shadow, not a faint halo. (iii) From far away
    (flight-*.png, between-holes-*.png) the holes look like small ringed planets. Make
    them read as black holes at a distance: a dark shadow with a glow and a light-bending
    halo, and a disk smaller relative to the shadow.

Then Stage (c) – Better cockpit (Prompt 4, repeated below), plus these items you already
recorded:
- At 1024x768 the NAV / Ask ORBIT row is cut off, and "Sound on" overlaps DISTANCE.
- Edge labels: "GREEN PLANET" and "BH-1" draw on top of each other, and labels sit under
  the canopy struts (hole-1/hole-2/planet-2 screenshots). Labels must not overlap each
  other or the struts. Stack them or move them inside the clear view.
- In landing-touchdown, the "Touchdown!" text is hidden behind the result card.
- The red full-screen tint near a black hole hides the new artwork. Make the danger
  warning an edge vignette or a cockpit warning lamp, so the centre of the view stays
  clear.

Prompt 4 (cockpit):
- Canopy: the window frame drawn as 3D metal struts (shading, highlights, bolts/rivets),
  following the curve of a cockpit window, not flat lines. A very faint glass reflection
  and edge glare on the window.
- Dashboard across the bottom 20–25% of the screen: a dark panel with depth (bevels,
  shadows), with real-looking instruments: speed dial with needle; gravity gauge showing
  which body pulls hardest, with an arrow toward it; traffic light (red/amber/green) as
  glowing lamps (green = "let go, gravity will carry us"); radar/minimap in a round bezel
  showing both holes, both planets, ship and route; RINGS ON/OFF as a physical-looking
  switch; distance to the target planet as a digital readout.
- Left/right steering buttons at least 88x88 px, styled like physical cockpit buttons,
  with a pressed state. Usable with thumbs on an iPad held in landscape.
- Heading changes tilt the horizon/starfield slightly while steering.
- Cache the static cockpit frame to an offscreen canvas; redraw it only on resize.
- The centre 60% of the screen stays clear.
- Text readable by a child: at least 16 px, high contrast.
- Level 3 only. Do NOT edit cockpit.js or the other frozen Level 1/2 files.

Acceptance for this round: screenshots at 1366x1024, 1194x834, 1024x768 and 1180x820
(landscape), plus 820x1180 portrait; an automated check of the element bounding boxes
(every control fully inside the viewport, no overlapping pairs, steering buttons ≥88x88,
text ≥16 px) that FAILS on overlap; frame p95 render work and displayed cadence still
within Prompt 3 limits at 1x and 4x; the B1–B4 numbers; proof that the physics are
unchanged (hashes). Save over C:\Users\vikaa\codex-work\Captain_Suji_V7c.zip and STOP
for audit before Stage (d).
```

---

## Stage (d) add-on – "Suji-proof" stress test (draft, send with Stage (d) after (c) passes)

```
Stage (d) must include a "child stress test". A child broke the last release within
10 minutes. Automate each case below in the browser (real events, not debug calls) on
Level 1, Level 2 and Level 3, at 1180x820 and 820x1180. Each case: no JS exception, no
stuck screen (a button that works must be visible within 2 s), and the game can still
finish a leg/level afterwards. Report PASS/FAIL per case per level.

1. Button mashing: 20 taps per second on every visible button for 30 s, including
   ◀ ▶ together, NAV/RINGS, Ask ORBIT, Sound, Space facts, Continue/Retry.
2. Multi-touch: 2–5 fingers at once, holding both steering buttons, a swipe starting on
   a button and ending off it (the button must not stay "pressed"/steering).
3. Double/triple taps on Start, Launch, Continue, Retry, Back (no double launch, no
   skipped leg, no two game loops running: check requestAnimationFrame count).
4. Back in the middle of a flight, a landing, the lesson, the result card, then
   re-enter the level 10 times in a row (no duplicate workers, timers or sounds; memory
   must not keep growing: report JS heap before/after).
5. Rotate portrait <-> landscape during aim, flight, landing and result (10 times).
6. Switch away from the tab or app for 30 s mid-flight and come back (visibilitychange
   / pagehide): the game pauses or resumes sensibly; no giant time jump that kills the ship.
7. Pinch-zoom, long-press, text selection and pull-to-refresh / swipe-back gestures
   must not zoom the page, select text, open menus or leave the game.
8. Leave the game running untouched for 10 minutes at each screen (no crash; no growing
   memory; worker idle).
9. Play the whole Level 3 mission 20 times in a row with random inputs; then complete it
   once with the planner route. No layout or leg may get stuck.
10. Reload in the middle of every screen; the game restarts cleanly from the title.

Fix every failure, re-run the whole list, and include the final table in test-results.txt.
```

---

## Stage (d) add-on – Level 2 decision (user, 2026-10-19): KEEP OpenAI's Level 2 changes

```
Level 2 decision: keep your current cockpit.js and nav_worker.js (the documented
differences from live V7b.5) in the release. Because Level 2 will now change for the
player, it must be proven, not just frozen:

L1. Explain in plain words what each Level 2 difference changes for the player (look,
    controls, planner behaviour) vs live V7b.5, with before/after screenshots at
    1180x820 and 1366x1024. Include the minimap/canopy overlap: fix it if it's still there.
L2. level2_acceptance.test.js prints "FINAL RESULT: FAIL". Find the failing checks.
    Fix the game if it's a real Level 2 bug. If the test is out of date, update the test
    and explain each changed expectation. The test must exit non-zero when it fails.
    End state: PASS, honestly.
L3. learning_pilot.test.js (130/200): same treatment: fix it, or explain why the target
    is wrong and agree a new one with me before changing it.
L4. Play every Level 2 lesson/layout through to the end in the browser (real events), at
    1180x820 and 820x1180, with no exceptions. The Level 2 planner must reply within the
    same time limits as live V7b.5 (report p95 for both).
L5. Level 2 is included in the "Suji-proof" stress test.
```

---

## Stage (c) accepted → FULL Stage (d) prompt (2026-10-19, audit of zip 15:50, SHA cde3e18f…)

```
Stage (c) audit of C:\Users\vikaa\codex-work\Captain_Suji_V7c.zip (15:50, SHA-256 cde3e18f…).
Checked: level3_engine.js, level3_planner.js, nav_worker3.js and all Level 1/2 files
(engine, level2_engine, game, gesture, cockpit, nav_worker, cockpit-kit) are
byte-identical to the accepted Stage (a) zip. Screenshots reviewed at all 5 sizes.
Verdict: STAGE (c) ACCEPTED. The cockpit, black holes, dust and the preparing screen are
good work. Now do Stage (d), the final round. Physics stays FROZEN.

PART 1 – Small polish from the Stage (c) audit
P1. Landing contact: in landing-dust-1366x1024.png the ship looks about 10–15 px ABOVE
    the drawn planet limb. Your 0 px gap is measured against the formula line
    (h*0.8), not against the pixels. Measure the gap from the actual pixels (the lowest
    opaque ship pixel vs the first planet pixel in the same columns). It must be ≤3 px.
P2. Gravity gauge: in hole-1/hole-2 close-ups it says "BLUE" while the view sits next to
    a black hole. If that's only the paused camera fixture, prove it with a test: place
    the ship 500 units from BH-1, BH-2, blue and green in turn; the gauge must name that
    body and point at it.
P3. Radar: the contents are too small and dim for a child. Holes, planets and the ship
    must be clearly visible (dots ≥6 px, bright colours) at 1024x768.
P4. The red danger lamp floats alone between GRAVITY and ORBIT. Give it a label (e.g.
    "DANGER") or put it inside an instrument.
P5. Memory: the baked Level 3 art is 71 MB (+2048 landing textures). Free it when the
    player leaves Level 3 (set canvas sizes to 0, drop references) and re-bake on the
    next entry, so Level 1/2 don't run with 71 MB held. Report the JS heap / canvas
    memory before entry, during Level 3, and after Back.

PART 2 – Level 2 (decision: KEEP your cockpit.js / nav_worker.js changes in the release)
L1. Explain in plain words what each Level 2 difference vs live V7b.5
    (C:\Users\vikaa\Downloads\Suji Captain\7bGitUpload, read-only) changes for the
    player: look, controls, planner. Include before/after screenshots at 1180x820 and
    1366x1024. Fix the minimap/canopy overlap if it's still there.
L2. level2_acceptance.test.js prints "FINAL RESULT: FAIL". Find the failing checks. Fix
    the game if it's a real Level 2 bug. If the test is out of date, update it and
    explain each changed expectation. The test must exit non-zero when it fails.
    End state: an honest PASS.
L3. learning_pilot.test.js (130/200): fix it, or explain why the target is wrong and ASK
    ME before changing the target.
L4. Play every Level 2 lesson/layout to the end in the browser with real events, at
    1180x820 and 820x1180, with no exceptions. The Level 2 planner reply time p95 must be
    no worse than live V7b.5 (report both).
Level 2 files may now be edited ONLY for L1–L4 and the stress-test fixes. List every
change with a reason.

PART 3 – "Suji-proof" stress test (a child broke the last release within 10 minutes)
Automate each case in the browser with real events (not debug calls) on Level 1, Level 2
and Level 3, at 1180x820 and 820x1180. Each case passes when: no JS exception; no stuck
screen (a working button is visible within 2 s); the level can still be finished
afterwards. Report PASS/FAIL per case per level.
 S1. Button mashing: 20 taps/s on every visible button for 30 s, including both steering
     buttons together, RINGS, Ask ORBIT, Facts, Sound, Continue/Retry/Launch.
 S2. Multi-touch: 2–5 fingers at once; both steering buttons held; a swipe that starts
     on a button and ends off it (the button must not stay pressed or keep steering).
 S3. Double/triple taps on Start, Launch, Continue, Retry, Back: no double launch, no
     skipped leg, never two game loops (count active requestAnimationFrame loops).
 S4. Back during flight, landing, lesson, the "Preparing" screen and the result card,
     then re-enter 10 times in a row: no duplicate workers, timers or sounds; memory
     doesn't keep growing (report heap before/after).
 S5. Rotate portrait <-> landscape during aim, flight, landing and result, 10 times.
 S6. Hide the tab/app for 30 s mid-flight, then return (visibilitychange/pagehide): the
     game pauses or resumes sensibly; no huge time jump that kills the ship.
 S7. Pinch-zoom, double-tap zoom, long-press, text selection, pull-to-refresh and
     swipe-back must not zoom the page, select text, open menus or leave the game.
 S8. Leave each screen untouched for 10 minutes: no crash, memory stable, worker idle.
 S9. Play the full Level 3 mission 20 times in a row with random inputs, then finish it
     once on the planner route. No layout or leg gets stuck.
 S10. Reload on every screen: clean restart from the title.
Fix every failure, then re-run the whole list.

PART 4 – Final evidence (Prompt 5)
1. test-results.txt: PASS / FAIL / NOT RUN with real numbers for EVERY acceptance item
   from Stages (a), (b), (c), Parts 1–3 above, and every old Level 1/2 test.
2. SHA-256 of every game file. Physics files must match the accepted Stage (a) hashes.
   List the Level 2 files that changed, with reasons.
3. All screenshots in /evidence, with one gallery.html.
4. A DEPLOY list: exactly which files and folders to upload to GitHub Pages (no tests,
   no evidence), and a check that the game runs from a plain static web server with
   only those files.
5. A list of anything not done. Real-iPad testing will be done by me, so mark it NOT RUN.

Save over C:\Users\vikaa\codex-work\Captain_Suji_V7c.zip and STOP for the final audit.
```

---

## Reply to OpenAI's learning_pilot question (2026-10-19)

```
Yes, with conditions. I checked: engine.js and learning_pilot.test.js are byte-identical to
live V7b.5, so this test has been failing in the live game Suji already plays. The test is
out of date, not the game. Do NOT change engine.js or any Level 1 behaviour to satisfy it.

Note the real failures: 70/200 trials never land, and the SHORTEST flight is 4.5 s (below
8 s). The longest is only 12.2 s. So don't jump to 30 s:
1. Duration: set the allowed range from the live game's real successful flights (report
   the min/max you measure, e.g. about 4–15 s), not the 30 s engine cap.
2. Learner: it must stay child-like. It may only use what a child sees on screen (did the
   ship pass above or below the planet, fall into the hole, fall short or overshoot) and
   adjust aim and pull. No access to engine internals, no search, no planner. Keep
   12 attempts max, median ≤4 and p90 ≤8 unchanged.
3. Before you change it: report which layouts and start errors the OLD learner failed on,
   and why. If the failures cluster on one or two layouts, tell me. That may be a real
   Level 1 difficulty note for later (don't fix Level 1 now).
4. In test-results.txt show both results: OLD test = FAIL 130/200 (retired: out of date,
   with the reason) and NEW test = PASS/FAIL with numbers. Keep the old test file
   renamed as learning_pilot_v7b5_legacy.test.js.
```

## Go-ahead after Stage (d) resume status audit (2026-10-19, 17:06)

```
Your status audit is accepted. You were right about the dates: the 17:08–18:26 scripts are
from 18 October, my mistake. I independently confirmed the zip SHA (cde3e18f…) and the
frozen-file hashes.

Go ahead and finish Stage (d), in this order. Keep every rule from the full Stage (d) prompt.

1. Level 2 route failures first: pair 1 and pair 5 at 1180x820 didn't land even though the
   planner replied found=true every time. Before running more routes, explain why: a game
   bug (cockpit.js/nav_worker.js changes), a weak test follower, or a pair that's too hard
   in live V7b.5 too. Run the same 2 pairs against the read-only live baseline and compare.
   Fix the game if it's a game bug. If it's the follower, fix the follower and say so.
2. Then run the full 246-case Level 2 route run (both orientations). Report landed / failed /
   p95 planner latency vs live.
3. Idle: results.json shows a null getBoundingClientRect exception after 3 windows, but
   idle-stage-d.log reaches about 541–544 s. Explain the conflict. Fix the harness (or the
   missing element if the game removed one), then rerun all 12 windows for the full 600 s.
   PASS only if every window reaches 600 s with no exception, stable memory and an idle worker.
4. P3 (radar ≥6 px at 1024x768, measured pixels), P4 (lamp proof screenshot) and P5 (5x
   repeated enter/Back cycles; canvas bytes return to 0 and heap doesn't keep growing).
5. L1–L4 and S1–S10 at landscape + portrait on all 3 levels, using real input events.
6. Fix failures, rerun the full matrix, then the final aggregate report (every test PASS/FAIL/
   NOT RUN, SHA256s, Level 2 change reasons, evidence gallery, DEPLOY file list and a
   static-server test of exactly that list).

Only then overwrite codex-work\Captain_Suji_V7c.zip and STOP for my final audit.
If you have to pause again, update CAPTAIN_SUJI_CHECKPOINT.txt first.
```

## Optional: split Stage (d) across two Codex sessions (2026-10-19) – NOT USED: user chose a single session
Open two terminals, run `cd C:\Users\vikaa\codex-work` then `codex` in each, and paste one prompt into each.

### Agent A – Level 2
```
You are AGENT A of two Codex sessions working in C:\Users\vikaa\codex-work at the same time.
Read CAPTAIN_SUJI_CHECKPOINT.txt and the full Stage (d) prompt plus the latest go-ahead at the
bottom of C:\Users\vikaa\headroom\Suji Game\prompts-V7d.md. All rules still apply.

YOUR JOB (Level 2 only): go-ahead steps 1, 2, and L1–L4.
- Explain and fix the pair 1 / pair 5 failures (compare with the read-only live baseline).
- Run the full 246-case Level 2 route run and report landed/failed.
- L1–L4 evidence.

FILES YOU MAY EDIT: game/cockpit.js, game/nav_worker.js, tests/level2_*, tests/probe_level2_*,
and files under evidence/stage-d/level2/. Do NOT edit any other game file. Agent B owns
level3.js, realistic-art.js, deep-cockpit.css and the idle/polish tests. If you need a change
in one of B's files, write it in AGENT_A_NOTES.txt and don't make it.
Use Chrome profiles named .chrome-A-* and debug ports 9300–9349 only.
Planner latency p95 measured while Agent B is running is NOT final. Mark it "provisional".
Never touch Captain_Suji_V7c.zip. When done, write AGENT_A_DONE.txt (what changed, SHA256 of
every file you edited, results with PASS/FAIL/NOT RUN) and STOP.
```

### Agent B – Level 3, idle and polish
```
You are AGENT B of two Codex sessions working in C:\Users\vikaa\codex-work at the same time.
Read CAPTAIN_SUJI_CHECKPOINT.txt and the full Stage (d) prompt plus the latest go-ahead at the
bottom of C:\Users\vikaa\headroom\Suji Game\prompts-V7d.md. All rules still apply.

YOUR JOB: go-ahead steps 3 and 4.
- Explain the idle conflict (results.json exception vs the ~541–544 s log), and fix the
  harness or the game.
- P3 radar ≥6 px at 1024x768 (measured pixels), P4 lamp proof, P5 5x enter/Back memory cycles.
- Do a 600 s idle dry run so the harness is proven to work. The official 12-window 600 s idle
  run happens later, alone, in the final step.

FILES YOU MAY EDIT: game/level3.js, game/realistic-art.js, game/deep-cockpit.css,
tests/stage_d_idle.py, tests/stage_d_polish_probe.py, tests/stage_d_contact_probe.js, and
files under evidence/stage-d/idle|polish/. Do NOT edit cockpit.js, nav_worker.js or any
physics file. Agent A owns Level 2. If you need a change in one of A's files, write it in
AGENT_B_NOTES.txt and don't make it.
Use Chrome profiles named .chrome-B-* and debug ports 9350–9399 only.
Memory/timing numbers measured while Agent A is running are NOT final. Mark them "provisional".
Never touch Captain_Suji_V7c.zip. When done, write AGENT_B_DONE.txt (what changed, SHA256 of
every file you edited, results with PASS/FAIL/NOT RUN) and STOP.
```

### After BOTH are done – one session only
```
Agents A and B are finished. Read AGENT_A_DONE.txt, AGENT_B_DONE.txt and both NOTES files.
Confirm that no file was edited by both agents (compare SHA256s), and apply any cross-notes.
Then, with NOTHING else running, do go-ahead steps 5 and 6: S1–S10 on all 3 levels in landscape
and portrait, then rerun the FULL matrix, including the official 600 s idle windows and the
Level 2 latency p95. These final numbers replace every "provisional" one. Produce the final
aggregate report, overwrite Captain_Suji_V7c.zip, and STOP for my audit.
```

## LEAN finish prompt – OpenAI session nearly out (2026-10-19 ~17:50)

```
SESSION BUDGET IS LOW. Finish Stage (d) with ONLY the essential work below. No extra
re-checks, no repeated runs, no long log dumps (read summary/result JSON only, never full logs).

ALREADY ACCEPTED BY ME (do NOT rerun unless you change the file it tests):
- Level 2 routes 246/246 + live 246/246 (full-246-comparison). Final unless cockpit.js or
  nav_worker.js changes.
- P3/P4/P5 polish-v2 PASS. Final unless level3.js, realistic-art.js or deep-cockpit.css changes.
- Pairs 1/5 diagnosis, learner, frozen hashes.

DO, in this order:
1. Let the running 600 s idle run finish. If all 12 windows pass, it is FINAL. Don't rerun it.
2. Run S1–S10 ONCE (all 3 levels, landscape + portrait, real input events).
3. Fix only real failures: a crash, a freeze, a stuck screen, a leak, or a wrong result. Rerun
   ONLY the failed case plus any accepted test whose file you changed. Cosmetic issues: list
   them, don't fix them.
4. L1: one before/after screenshot pair + minimap/canopy overlap yes/no. L3: run the new
   learning_pilot test once and save its console output.
5. Instead of a full-matrix rerun: record the SHA256 of every game file at the end. For each
   test, state which game-file hashes it ran against. Any test run on an older hash of a file
   that changed later must be rerun. Nothing else.
6. Make the DEPLOY file list. Smoke test that exact list with a PLAIN static server (no injected
   telemetry): all 3 levels load, start and go Back, with no console errors.
7. FINAL_REPORT.md: ONE table (every test: PASS/FAIL/NOT RUN + evidence path), game-file
   SHA256s, Level 2 change reasons in 3 lines, and the open cosmetic issues. Keep it short.
8. Overwrite codex-work\Captain_Suji_V7c.zip with the release files and STOP.

If you run out of budget first, update CAPTAIN_SUJI_CHECKPOINT.txt (done / not done / next
command), then stop.
```

## Nudge while supervisor runs (2026-10-19 ~19:00) – budget saver

```
Budget is very low. Keep the supervisor running, but:
1. Don't poll it often. Check the log tail every ~10 minutes, and only the last few lines.
2. Latency gate: change it to PASS if working p95 ≤ live p95 × 1.10 (182 vs 177 ms is noise).
   Don't do any more planner optimisation.
3. If S3 Level 3 worker-load fails again, fix the GAME: on a worker error, terminate it and
   recreate it once, then show a "Try again" message instead of hanging. Rerun only S3 + S4.
4. When every gate passes, run stage_d_aggregate.py --package, verify the zip SHA, and STOP.
   If the budget runs out first, update the checkpoint and stop.
```
