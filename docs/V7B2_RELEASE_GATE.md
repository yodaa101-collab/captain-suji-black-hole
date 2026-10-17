# Captain Suji V7b.2 — release gate

Status: staging branch only. Live V6 on main remains unchanged.

The V7b.2 ZIP has not yet been transferred into this branch. Do not treat this branch as the playable V7b.2 build.

Before release:
- Commit and verify the full V7b.2 source and assets from the ZIP.
- Verify zero missing assets/404s and GitHub Pages paths.
- Check single black hole during launch transition at 0.2/0.4/0.6/0.8/1.0 seconds.
- Check cinematic touchdown gap <=6 CSS px and no result-panel overlap.
- Verify frame-time p95 <=17.5ms at 1x and <=20ms at 4x across phases.
- Recheck Level 2 fairness, including pairs 105 and 109.

Do not merge into main before review.
