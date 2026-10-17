# Captain Suji – V7a build tracker

Status: **IN DEVELOPMENT — NOT APPROVED**. Live V6 on `main` is unchanged.

## Locked scope
- Only Level 1 Space Commander playable; Levels 2–3 locked Coming soon. Remove Cadet/Pilot from code, tests and docs.
- Destination name: **Planet**. At least 20 independently verified nonconsecutive layouts; no hidden landing radius.
- Valid backward pull: 1:1 aim and speed, near-ship 90px touch start, scaled pull distance, three ORBIT hints, no prelaunch success disclosure.
- Last three ghost trails remain visible even across different layouts.
- Single canvas and one requestAnimationFrame loop; fixed 1/240 s physics, accumulator/interpolation, DPR <=2, smooth camera and endings.
- Escape pod ejects **before** the event horizon; rename spaghetti discovery to SWALLOWED! with preserved count.
- V7b cockpit, steering and extra hazards are documentation only.

## Gates (all pending until measured)
1. Layout sampling and deterministic engine tests; 10,000+ random launch comparisons; every layout >=10% success and all three outcomes.
2. Five-seed aggregate 25–35% success; successful flights 8–12 seconds; p99 prediction <8ms and mean <1ms.
3. Browser at 1366x1024, 1194x834, 1024x768; each ending, camera, controls, text, no console errors.
4. 4x CPU throttle: p95 frame <=16.7ms, no flight frame >33ms; screen continuity <=2x expected; rotation <=12deg/frame; camera no overshoot; ending transition continuous.
5. Two independent reconciliation passes matching README and test-results to actual measurements.

**No gate is marked passed by creating this tracker.** iPad Safari validation requires external device review.