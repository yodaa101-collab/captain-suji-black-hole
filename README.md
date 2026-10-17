# Captain Suji V7b.4 — development candidate

This build contains Level 1 and a new playable Level 2 Cockpit Pilot. Level 3 remains locked.

Run `python -m http.server 8000` in this folder, then open `http://localhost:8000/`.

Level 2: drag the ship vertically, pull left to launch, hold ◀/▶ to steer, or use keyboard arrows. The top-right mini-map and cockpit gravity meter show flight guidance. The same saved discovery key is retained.

**Historical V7b.4 test only:** an older pilot recorded 1503/2460. This result does not apply to the V7b.4 rate-steering engine. See `test-results.txt` for current test status.

Rendering and real iPad browser performance remain unverified. The V6 production branch is unchanged.


## V7b.4 reviewer status
The replacement 0.3-second lookahead fairness pilot landed 490/492 attempts across 123 pairs (4 each). Pairs 105 and 109 landed 3/4 and fail the required >=98% per pair. Landing median 9.175 s, maximum 27.954 s. Browser performance targets and screenshot checks are pending external reviewer; no fabricated frame-time values.


## How to play
Level 1: slide the Swift Comet up or down on its dotted lane; pull back to aim and release to launch. Learn about gravity and the black hole.

Level 2 — Cockpit Pilot: plan a launch the same way, then hold ◀ or ▶ (or keyboard arrows) to steer in the cockpit. Watch the coasting path on the mini-map and aim to land on the Planet. This level teaches how small sideways pushes change a spaceship’s direction.

Level 3: coming soon. The 📚 discoveries can be read any time. Add `?debug=1` to the URL for frame diagnostics.

## V7b.4 changes and limitations

Deterministic 40°/s velocity rotation, speed preservation, 120°/s camera-follow cap, 0.12s input ramp, 0.15s touch pulse, worker-based ORBIT route search, persistent NAV toggle, cyan route on map/windscreen, alignment and speed panel, widened object projection, minimum object sizes, edge direction chips, thumb-positioned controls, and extended landing hold. Level 1 gameplay source and Level 2 planning layout remain unchanged.

**Development only:** This is not a validated V7b.4 release. The complete V7b.4 request includes visual effects, fully continuous landing choreography, measured iPad viewport boxes, fairness and navigation pilot coverage, and real browser 1×/4× frame timing. Those are not all implemented or verified here. Do not merge this build into production without finishing and measuring them.

## V7b.4 quick fixes
Adjusted toast position, cockpit HUD layout, edge-chip units, banking, star streaks, and cached thruster flare. Level 1 and deterministic 40°/s steering unchanged.
