# Captain Suji – project status handoff (2026-10-19, 19:20 IST)

## What the project is
"Captain Suji – Black Hole Challenge": an iPad browser game for a child (Suji), hosted on GitHub Pages.
- Level 1 – Space Commander (frozen, live)
- Level 2 – Cockpit Pilot (live version V7b.5; small approved Stage (d) changes)
- Level 3 – Deep Space Mission: NEW in V7c. Two black holes and two planets, two legs (start → blue planet, then blue → green). Each leg threads between the two holes.

## Who does what
- OpenAI Codex (GPT-6.1-Sol) writes all the code.
- Claude is the auditor only: it verifies Codex's claims independently, gives an accept or send-back verdict, and writes the next Codex prompt with measurable acceptance criteria. Claude never edits game files.
- The user wants quality over speed. Suji broke the last release within 10 minutes, hence the "Suji-proof" stress tests.

## Stage progress for V7c
| Stage | Content | Status |
|---|---|---|
| (a) | Level 3 layouts and difficulty | ACCEPTED (zip SHA 39c79ffb…) |
| (b) | Realistic visuals | ACCEPTED with fixes B1–B4 folded into (c) (SHA 4b6de8b2…) |
| (c) | Cockpit | ACCEPTED (SHA cde3e18f…, current working zip) |
| (d) | Polish P1–P5, Level 2 proof L1–L4, stress S1–S10, final package | IN PROGRESS (automated rerun running) |

## Stage (d) results (verified by Claude from Codex's files, 19:19)
- P1–P5 polish: PASS (radar dots 6–8 px, danger lamp inside the gauge, 5 enter/Back cycles release all canvas memory).
- 10-minute idle test: PASS, 12/12 windows in landscape AND 12/12 in portrait.
- Native test suite, L1 screenshots, deploy-file static-server test: all exit 0.
- Level 2 routes: an earlier run landed 246/246 (live game also 246/246, 123 distinct missions verified). A final rerun after a planner speed-up has been running since 19:08.
- Planner change (`nav_worker.js`, one line): skips routes that need more steering than the best one found. An equivalence test shows identical plans in 246/246 cases. Claude reviewed it: OK.
- New `input-guard.js`: blocks the long-press menu, text selection and pinch-zoom. OK.
- Physics files are frozen and their hashes were verified (Level 1/2 match the live game, Level 3 matches the accepted zip).
- OPEN RISK: the first stress run failed S3 (Level 3 portrait re-entry: the worker failed to load `level3_engine.js`). So far the fix is test-side only. If it fails again, the game needs a worker-error retry plus a "Try again" message.
- Learning test: the old test is retired as FAIL 130/200 (out of date). The new child-like learner passes 200/200, median 3 attempts, p90 5.

## What is running now
- A background script, `run_stage_d_remaining_v2.py` (log `stage-d-remaining-v2.log`), runs in sequence: 492-case route comparison → 60-case stress matrix S1–S10 → aggregate report (no packaging). It stops at the first failed gate.
- The Codex session limit is nearly used up (4% left, resets at 20:59). Plan: press Esc in Codex (NOT /stop, which kills the script) and let the script finish alone.
- Latency gate decision: PASS if the working p95 ≤ live p95 × 1.10.

## Next steps
1. Wait for the script to finish, then Claude checks the route and stress results (especially S3).
2. After 20:59, send Codex ONE short prompt: either "run stage_d_aggregate.py --package, verify the zip SHA, STOP", or one specific fix if a stress test failed.
3. Claude does the final audit of the new zip.
4. The user tests on a real iPad (suggested tomorrow, fresh).
5. After that, copy the zip to Downloads and upload to GitHub Pages.

## File locations (all on the user's Windows PC)
| What | Path |
|---|---|
| Codex working folder (game source) | `C:\Users\vikaa\codex-work\Captain_Suji_V7c\` |
| Codex working zip (still Stage (c), SHA cde3e18f…) | `C:\Users\vikaa\codex-work\Captain_Suji_V7c.zip` |
| Codex resume checkpoint | `C:\Users\vikaa\codex-work\CAPTAIN_SUJI_CHECKPOINT.txt` |
| Stage (d) evidence | `C:\Users\vikaa\codex-work\Captain_Suji_V7c\evidence\stage-d\` |
| Supervisor log | `C:\Users\vikaa\codex-work\stage-d-remaining-v2.log` (UTF-16) |
| All Codex prompts (latest at bottom) | `C:\Users\vikaa\headroom\Suji Game\prompts-V7d.md` |
| Audit log | `C:\Users\vikaa\headroom\Suji Game\audit-log.md` |
| Project rules | `C:\Users\vikaa\headroom\Suji Game\CLAUDE.md` |
| Live game V7b.5 (READ ONLY, never delete) | `C:\Users\vikaa\Downloads\Suji Captain\7bGitUpload\` |
| Release copy (still Stage (a)) | `C:\Users\vikaa\Downloads\Suji Captain\Captain_Suji_V7c.zip` |
| Old builds | `C:\Users\vikaa\Downloads\Suji Captain\Old versions\` |

## Tips
- Start Codex from the desktop icon "Codex + Headroom" (it starts in codex-work). Codex goes through Headroom either way, via `~\.codex\config.toml`.
- Tests use Node via `ELECTRON_RUN_AS_NODE=1 C:\Users\vikaa\AppData\Local\Programs\Session\Session.exe` (no Node installed). Python 3.13 and Chrome are available.
