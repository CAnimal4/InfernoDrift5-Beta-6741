# ID5 Test Results

Session date: 2026-07-07. Environment: Linux sandbox, node with npm ci from the lockfile. Playwright browser binaries cannot download in this environment, so browser and mobile smokes are listed as pending and must run on a real machine before any deploy.

## Baseline (before any ID5 change)

- `git status --short`: clean tree at `2ac388f`.
- `npm run typecheck`: PASS.
- `npm test`: PASS, 50 tests in the .mjs runner, 15 tests in the .ts runner, 0 failures.
- `npx playwright install chromium`: FAILS in this sandbox (network blocked), recorded as the reason browser smokes are deferred.

## After the ID5 pass

- `node --check script.js`: PASS (run after every edit cluster, 10+ times).
- `npm run typecheck` (tsc plus node --check on script.js and every smoke and server entry): PASS.
- `npm test`: PASS. 65 total: 50 in the .mjs runner (35 pre-existing plus 15 new in `tests/id5-systems.test.mjs`), 15 in the .ts runner. 0 failures.
- `npm run build:web`: PASS. `dist/` now includes `id5-systems.js` and `id5-audio.js` alongside the existing launch files.
- JSON validity of `package.json` and `manifest.webmanifest`: PASS.

## New unit coverage (tests/id5-systems.test.mjs, 15 tests)

Save chain order and id4 fallback, secondary key fallbacks, heatline campaign shape (5 worlds, 26 unique nodes, ordered medal thresholds), unlock chain, no medal downgrade plus single first-clear payout, failed attempts record bests without advancing, medal threshold evaluation, malformed save repair, starter validity for all six forge types, share code round trip with the ID5-RIFT prefix, tamper and malformed and wrong-version rejection, piece limits and coordinate clamps, runtime grouping and mode mapping, title sanitization, audio event catalog completeness.

## Simulations run in-session (node, real modules)

- Full 26-node campaign walk with a fail then a gold win then an inferno replay per node: campaign completes 26/26, first-clear pays exactly 26 times (11,030 XP, 2,385 Embers total), no double rewards, all medals upgrade to Inferno on replay.
- Forge round trip for all six challenge types through encode, decode, and runtime mapping: PASS.

## Pending on a real machine (required before deploy)

```bash
npm run smoke
npm run smoke:account-xp
npm run smoke:firebase
npm run smoke:online-local
npm run test:e2e
```

`smoke_games.mjs` title assertions were already updated to the ID5 product strings so the suite matches the rebrand. Live Firebase proof additionally needs Amanda's CLI auth, the Firestore rules deploy, then `npm run smoke:firebase-live` reporting `room2: "passed"`.
