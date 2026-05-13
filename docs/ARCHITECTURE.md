# Architecture

InfernoDrift4 separates the game into a static client, shared simulation, shared protocol, and optional backend.

## Client

`apps/web` uses React for menus/HUD/settings and Three.js for gameplay rendering. The canvas is driven by `InfernoDriftSim`, a fixed-step simulation from `packages/game-core`.

The client exposes:

- `window.render_game_to_text()`: concise JSON state for automation.
- `window.advanceTime(ms)`: deterministic simulation stepping.
- `window.__infernodrift4`: small debug/test API.

## Simulation

`packages/game-core` owns mode configs, car handling, bot roles, pickups, objectives, scoring, saves, and replay events. It intentionally keeps rendering and DOM input out of core logic.

## Protocol

`packages/protocol` defines Zod schemas for versioned WebSocket messages. Clients send intent/input only. The server rejects impossible input, malformed messages, stale sequences, and unsafe chat.

## Backend

`apps/server` runs a Node `ws` server with local persistence. It implements guest accounts, queues, private rooms, chat, friends scaffolding, and authoritative room ticks. A production deployment can replace local JSON storage with SQLite/Postgres without changing the client protocol.
