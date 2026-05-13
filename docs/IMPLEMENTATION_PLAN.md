# InfernoDrift4 Implementation Plan

## Goals

Build a real sequel in `CAnimal4/InfernoDrift4`, preserving the empty repo history and shipping a playable GitHub Pages game plus a local/production-ready backend.

## Acceptance Criteria

- Static client loads at `/InfernoDrift4/` with correct asset paths.
- Offline mode is fully playable with bots and clear backend-offline status.
- Tutorial, campaign, Max Arena, race, stunt, hunter, boss, time trial, drift score, battle, and rotating minigames can be started.
- Garage, progression, settings, controls, mobile touch UI, save export/import, debug overlay, and credits exist.
- Backend runs locally with guest accounts, rooms, queues, private codes, chat safety, friends scaffolding, and server-side protocol validation.
- Tests pass: typecheck, unit, build, smoke, e2e.
- Pages workflow deploys `apps/web/dist`.

## Milestones

1. Scaffold monorepo, workflows, docs, package scripts.
2. Implement deterministic game core and mode data.
3. Implement React/Three.js client and offline playable flow.
4. Implement Node/WebSocket backend and protocol validation.
5. Add tests, smoke screenshots, docs, final report.
6. Push to GitHub and verify Pages.
