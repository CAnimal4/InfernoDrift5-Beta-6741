# Implementation Plan

## Direction

InfernoDrift4 restarts from the real current InfernoDrift codebase in the parent repo. The rejected standalone monorepo is preserved on `backup/rejected-monorepo-683a77c`.

## Phases

1. Preserve rejected work, port current InfernoDrift into `InfernoDrift4`, and verify parity.
2. Rename/reskin to InfernoDrift4 while preserving current arcade readability.
3. Add ID4 mode selection, progression, daily/weekly challenges, PWA shell, and backend-offline status.
4. Add local Node/WebSocket backend with validation, guest users, rooms, queues, chat safety, and room snapshots.
5. Run local tests, browser/game smokes, push, verify GitHub Actions, and verify Pages.

## Acceptance

- The live Pages game is visibly the current InfernoDrift made better.
- Tutorial, campaign, Max Arena, menu tabs, customization, touch layout, and deterministic test hooks work.
- Backend runs locally and does not pretend to be hosted.
