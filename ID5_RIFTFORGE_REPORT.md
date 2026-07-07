# ID5 RiftForge Report

RiftForge is the local-first custom challenge builder. It works fully offline, needs no account, and shares builds through `ID5-RIFT` codes.

## Share code contract

Format: `ID5-RIFT1.{checksum}.{payload}`

- Prefix `ID5-RIFT`, version digit, then an 8-hex FNV-1a checksum of the JSON, then a base64url payload.
- Payloads are versioned (`v: 1`) and validated before touching runtime state. Decode rejects wrong prefixes, unknown versions, damaged base64, checksum mismatches, unknown piece types, out-of-bounds coordinates, and over-limit builds, each with a friendly error message.
- Titles are sanitized (angle brackets, ampersands, control characters stripped, 40 char cap) at every entry point, so imported codes cannot inject markup.
- Limits: 48 pieces max, coordinates clamped to plus or minus 220, per-type piece caps (for example 1 Start, 24 Gates, 16 Ramps), codes capped at 6000 characters.

## Piece and challenge types

Pieces: Start Pad, Finish Gate, Checkpoint Gate, Boost Pad, Ramp, Air Ring, Flag Home, Hold Zone, Barrier Wall, Safe Pad. Each has position, rotation, and a 1 to 3 size.

Challenge types map to real modes: Race Route and Boost Course launch Race, Stunt Run launches Stunt Park, Flag Route launches Battle Arena, Zone Challenge launches King of the Zone, Lava Floor launches Lava Floor. Every type ships a valid starter layout and lists its required pieces in the validation panel.

## Builder UI (Forge tab)

Title input, type select with per-type hints, a visual piece palette with live per-type counts, a selectable piece list, nudge and rotate and size and delete controls for the selected piece, undo (24 steps), reset starter, save build, and Test Drive. A top-down canvas preview draws the whole layout with the race route traced, plus a validation panel, export code box with copy, import box with clear success or failure notices, and a saved-builds list (20 slots, stored at `infernoDrift5.riftforge.v1`).

## Test Drive runtime, honest coverage

Test Drive always launches the real target mode with the layout stored on `state.riftforge.testDrive`.

Live right now:

- Custom race tracks. When a Race Route or any track-mode test drive has a Start plus 2 or more Gates, `getRaceTrackLayout` builds the actual drivable track from those points through the existing Catmull-Rom pipeline: road segments, side rails, sequential checkpoint markers, direction arrows, and the start line all generate from the player's layout, and the mode target becomes the gate count.
- Boost Pads, Ramps (size picks normal, mega, or titan), and Barrier Walls spawn as real objects in every non-arena mode through the existing creators, with barrier collision registered.
- Custom Start spawn repositions the car in non-track modes.
- The mode definition merges a `RiftForge: {title}` label, custom objective copy, and the gate-based target, and results show a RiftForge row.

Preview-only for now (drawn on the build map, validated, but not yet spawned as scoring objects): Air Rings, Hold Zones, Flag Homes, Safe Pads. The validation panel states this in plain language so the builder never overpromises.

## Verified behavior

Unit tests cover starter validity for all six types, encode and decode round trips, tamper and checksum and version rejection, piece and coordinate limits, title sanitization, and runtime grouping with correct mode mapping. A simulation confirms all six challenge types round-trip end to end.

## Next steps

Spawn rings, zones, flag homes, and safe pads as live objectives, add drag placement on the preview canvas, per-piece z-order editing, a 3D launch preview, and (after Firestore rules deploy) featured and friend challenge sharing through the online service.
