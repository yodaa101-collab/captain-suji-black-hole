# Roadmap – Captain Suji

Update this file after every version (see CLAUDE.md).

## Now – V7c.2b is live (2026-10-21, commit c824ea8)
1. Vikas looks at the LIVE game on the real iPad: the Level 3 start screen (planets, labels), the
   "Preparing deep space…" wait, ◀ ▶ feel, Levels 1/2 unchanged. Rollback if needed: `git revert c824ea8`.
2. Ideas from the iPad look go into V7c.3 (for example bigger labels for the holes and the other planet if they are hard to read).
3. Small tidy-up items, can go into V7c.3:
   - add `<link rel="icon" href="data:,">` to root `index.html` (stops the /favicon.ico 404);
   - regenerate `SHA256SUMS.txt` in the packaged zip after any file change.
4. Copy the released zip to `Downloads\Suji Captain\` as the new release copy (Vikas's OK first).

## Done – finish V7c (from STATUS-handoff.md, 2026-10-19)
All five steps done 2026-10-19 → 2026-10-21. The S3 risk was fixed in Stage (d) and V7c.1.
The real-iPad test was moved to after the release, by Vikas's decision.

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
