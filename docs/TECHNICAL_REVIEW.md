# Technical Review — Captain Suji V6 – updated

## Change scope
Commander-only `COMMANDER_AIM_SENSITIVITY`: **0.14 → 0.5**. The same `commanderPull` correction drives launch velocity and the dotted aiming arrow. The existing ±60° backward input cone therefore produces ±30° actual heading. `arrival=150`, `planetRadius=45`, cancel rules, Cadet and Pilot settings remain unchanged. Stress acceptance now requires 18–24% Commander success **among valid launches**. The stress harness supports configurable `SUJI_SEED` and `SUJI_RUNS` for reproducible checks; a separate large-run test was added.

## Vikas approval and trade-off
Vikas chose sensitivity 0.5 (about 21% Commander success) so Suji's aim clearly changes the flight while she still wins about 1 in 5 tries. This **replaces** the former 0.14 / ≥25% decision. More steering responsiveness means fewer random successful valid launches; the planet capture radius is not inflated.

## Physics and scientific limits
Fixed-step semi-implicit Euler, softened 2D Newtonian attraction from black hole and planet. No general relativity, no frame dragging, no relativistic light bending. A stationary gravity source changes a trajectory but does not grant a permanent gravity-assist speed gain. Simulation decides outcomes; only the final successful landing is autopilot animation.

## Tests and measured coverage
For seed 20261016, 12,000 random gestures/level: Cadet **72.1%**, Pilot **44.2%**, Commander **20.2% valid backward pulls**. Across five seeds: Cadet 71.7–72.2%, Pilot 43.7–44.2%, Commander 18.7–20.2%. A 50,000-gesture-per-level additional test recorded Cadet 71.46%, Pilot 43.93%, Commander 18.95% of valid pulls; all simulated outcomes matched predictions.

## Open acceptance items
1. One observed prediction wall-clock maximum **46.4955 ms** in the 50,000-gesture Cadet run, exceeding the requested 8 ms threshold (averages under 1 ms). Likely an operating-system/GC scheduling outlier, not proof of algorithmic correctness under a strict worst-case requirement.
2. Browser automation could launch Chromium but navigation to both `file://` and localhost returned `net::ERR_BLOCKED_BY_ADMINISTRATOR`. Thus 3-screen-size, 3-outcome UI testing, screenshots and accessibility checks are **not verified**.
3. No physical iPad testing has occurred.
4. The ship drifting out of the world is intentionally offscreen at its final state; a literal requirement that it stay onscreen for the *entire* drift is inconsistent with drift-by-leaving-bounds.

See `test-results.txt` for commands, outputs, test pass/fail and reconciliation details. This candidate is **not final-release approved**.
