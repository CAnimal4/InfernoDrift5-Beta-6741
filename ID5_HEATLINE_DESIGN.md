# ID5 Heatline Design

Heatline is the guided campaign for InfernoDrift5. It turns the 15-mode roster into one path: five worlds, 26 heats, medals that never downgrade, and first-clear rewards that pay exactly once.

## Data home

All campaign data and logic live in `id5-systems.js` so both the browser runtime and node tests share one source of truth.

- `HEATLINE_WORLDS`: 5 worlds (Ignition Yard, Neon Route, Arena Circuit, Skyfire Stunts, Rift Core).
- `HEATLINE_NODES`: 26 nodes. Each node has `id`, `worldId`, `title`, `modeId` (a real existing mode), `brief` objective copy, `medal` thresholds (bronze, silver, gold, inferno), `firstClear` reward (xp, embers), and optional `overrides` (time, target, botCount, botSpeed).
- Saved state lives at `progressionV2.heatline` with `currentNodeId`, `medals`, `bestScores`, `completions`, `attempts`, `rewardsClaimed`, `completedAt`. `normalizeHeatlineState` repairs malformed data on load and drops unknown node ids.

## World map

1. Ignition Yard (teach): First Ignition (race, tutorial pace, no rivals), Drift Basics (drift-score), Boost Lanes (race, one rival), First Heat (campaign-survival), Yard Trial (time-trial).
2. Neon Route (speed): Street Race, Clean Lines, Rush Hour (5 fast rivals), Ghost Chase, Night Heat (survival).
3. Arena Circuit (arena): Max Rookie, Zone Holder, Laser Drill, Max Clash, Flag Runner, Arena Final.
4. Skyfire Stunts (tricks and minigames): Ramp School, Ring Run, Trick Combo, Bowling Break, Lava Steps, Skyfire Final.
5. Rift Core (mastery): Hunter Gauntlet, Boss Heat, Escape The Core, Inferno Final (survival, campaign finale, routes to RiftForge).

## Runtime integration

- Launch: `startHeatlineNode(nodeId)` checks unlock, sets a transient `state.heatline.activeNodeId`, switches the active mode, and calls `startRun(true)`. The first screen has a Continue Heatline button that mirrors the PLAY NOW account or guest flow.
- Config injection: `getModeDefinition()` merges the active node's overrides (time, target, bots, medal table, title, objective) over the base mode. Nothing downstream changed; HUD, spawn, bots, and medal scoring all read the merged definition. A small cache avoids per-frame object churn.
- Completion: `awardModeProgression` calls the pure reducer `applyHeatlineResult`. Wins record the medal (max only), count the completion, pay first-clear rewards once through the normal `awardXP` pipeline, and advance `currentNodeId`. Fails still record best score and attempts for progress feel.
- Results: the results table leads with Heatline rows (node, medal, what unlocked). The primary button becomes Next Heat, which launches the next node through the `heatline-next` action. Finishing node 26 shows Heatline Complete and an Open RiftForge button.
- Leaving: manually picking any mode from the Play board clears the active node so campaign overrides never leak into free play. Fast retry keeps the node active.

## Reward pacing

First-clear totals across the full campaign: 11,030 XP and 2,385 Embers (verified by simulation). Early nodes pay around 220 to 300 XP, the finale pays 800 XP and 200 Embers. Medal thresholds start around 0.6x of the base mode tables in Ignition Yard and rise past 1.2x in Rift Core and world finals.

## Verified behavior

Unit tests plus a full 26-node simulation confirm: unlocks walk strictly in order, fails never advance, medals never downgrade, first-clear pays exactly once per node even on replay, replays can still upgrade medals and bests, and completing every node reports `campaignComplete`.

## Still needs (next pass)

Hands-on medal threshold tuning on real hardware, a full-chain playthrough feel test, per-node seed variation for track nodes, and an objective clarity pass on survival nodes for brand-new players.
