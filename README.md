# Captain Suji V7b.2 — development candidate

This build contains Level 1 and a new playable Level 2 Cockpit Pilot. Level 3 remains locked.

Run `python -m http.server 8000` in this folder, then open `http://localhost:8000/`.

Level 2: drag the ship vertically, pull left to launch, hold ◀/▶ to steer, or use keyboard arrows. The top-right mini-map and cockpit gravity meter show flight guidance. The same saved discovery key is retained.

**NOT ACCEPTED:** the final Level 2 Node fairness suite failed. Steering pilot landed 1503/2460 (61.10%), below the 95% per-pair target, and median landing flight was 9.442 s, below the 12 s target. See `test-results.txt` for measurements for all 123 pairs.

Rendering and real iPad browser performance remain unverified. The V6 production branch is unchanged.


## V7b.2 reviewer status
The replacement 0.3-second lookahead fairness pilot landed 490/492 attempts across 123 pairs (4 each). Pairs 105 and 109 landed 3/4 and fail the required >=98% per pair. Landing median 9.175 s, maximum 27.954 s. Browser performance targets and screenshot checks are pending external reviewer; no fabricated frame-time values.


## How to play
Level 1: slide the Swift Comet up or down on its dotted lane; pull back to aim and release to launch. Learn about gravity and the black hole.

Level 2 — Cockpit Pilot: plan a launch the same way, then hold ◀ or ▶ (or keyboard arrows) to steer in the cockpit. Watch the coasting path on the mini-map and aim to land on the Planet. This level teaches how small sideways pushes change a spaceship’s direction.

Level 3: coming soon. The 📚 discoveries can be read any time. Add `?debug=1` to the URL for frame diagnostics.
