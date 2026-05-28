# InfernoDrift4 Firebase Backend Handoff

Read this first when continuing InfernoDrift4 online/backend work from an older Codex chat that still assumes Cloudflare Workers, Replit, or a required WebSocket backend.

## Quick Start For A New Codex Chat

Use this repo and this policy:

- Work in `CAnimal4/InfernoDrift4`; the public game still deploys to `https://canimal4.github.io/InfernoDrift4`.
- Treat Firebase as the production online backend unless the owner explicitly asks for legacy Worker/WebSocket work.
- Keep Cloudflare Workers as legacy fallback/import/reference only.
- Do not use Replit for production and do not ask the owner to pay for Replit.
- Do not expose Firebase Admin SDK keys, service-account JSON, cookies, GitHub tokens, or private credentials.
- Do not rename player-facing UI back to "Firebase"; normal players should see "online services", "online guest", and "online lobby". Firebase wording is fine in Advanced Server settings, diagnostics, docs, tests, and source identifiers.
- Never make the game block play while online services load. Guest Offline and local modes must keep working.
- When backend behavior changes, update the Firebase client, `firestore.rules`, tests/smokes, and this handoff.
- Publish backend rules to Firebase, then push the repo so GitHub Pages deploys the frontend.

Current high-signal files:

- `firebase-config.js`: checked-in public Firebase web config and backend mode constant.
- `firebase-online-core.js`: validation/sanitization helpers for usernames, scores, chat, feedback, and lobby codes.
- `firebase-online.js`: Firebase Auth, Firestore reads/writes, lobbies, chat, friends, feedback, progress, diagnostics.
- `script.js`: live game integration, offline fallback, Online tab, legacy import bridge.
- `firestore.rules`: Firebase backend security rules.
- `smoke_firebase_live.mjs`: deployed/live Firebase behavior smoke.
- `smoke_firebase_offline.mjs`: unavailable-network/offline fallback smoke.
- `docs/FIREBASE_MIGRATION.md`, `docs/BACKEND.md`, `docs/CODEX_ONLINE_BACKEND_PROMPT.md`: related docs that should stay aligned.

## Current Direction

Firebase is now the default production backend for InfernoDrift4 online-lite features.

- Main game URL: `https://canimal4.github.io/InfernoDrift4`
- Firebase project ID: `infernodrift4-online`
- Firebase plan: Spark/no-cost
- Backend mode for production: `firebase`
- Replit is not used for production.
- Replit dev URLs are not acceptable as production.
- Cloudflare Workers are no longer the primary backend for school users.
- The old Worker backend can remain as a fallback/reference/import source, but new default backend work should target Firebase.
- `script.js` currently sets `DEFAULT_BACKEND_MODE = BACKEND_MODE_FIREBASE`.
- `firebase-config.js` currently exports `FIREBASE_BACKEND_MODE = "firebase"` and project ID `infernodrift4-online`.

Do not change the production default back to `workers.dev`, Replit, or a required `WS_URL` unless the owner explicitly asks for legacy server work.

## What Firebase Handles Now

Firebase is responsible for:

- registered accounts
- Firebase anonymous/guest users
- username uniqueness
- saved progress
- XP preservation and cloud progress sync
- leaderboard reads/writes
- lobby chat
- Firebase lobby creation/join/share codes
- friends and friend requests
- feedback
- diagnostics
- offline fallback when Firebase is blocked or unreachable
- old Cloudflare/Worker progress import into Firebase when a matching legacy save exists
- `playerRow` leaderboard recovery so the signed-in player can see their own total-XP row even outside the top page
- lobby membership subscriptions so hosts see joiners after a shared invite/code join

The main implementation files are:

- `firebase-config.js`
- `firebase-online-core.js`
- `firebase-online.js`
- `script.js`
- `firestore.rules`
- `firebase.json`
- `.firebaserc`

Docs that should stay aligned:

- `docs/FIREBASE_MIGRATION.md`
- `docs/BACKEND.md`
- `docs/CODEX_ONLINE_BACKEND_PROMPT.md`
- this file

## What Firebase Does Not Replace

Firebase is not a free server-authoritative WebSocket multiplayer physics backend.

Do not claim Firebase provides authoritative live multiplayer. In Firebase mode:

- private room codes are Firebase lobbies for social grouping, membership display, lobby chat, and invite sharing
- live queue/matchmaking is unavailable unless a real server backend is configured
- real-time authoritative racing still needs a trusted WebSocket/server backend
- local play, bots, saves, and offline guest mode must keep working

The UI should say this plainly. It should not fake online racing success.

Current player-facing wording should avoid provider names. Use phrases like:

- "Online services are ready when available."
- "Create Online Lobby"
- "Online lobby ... Chat and invites are active; live racing needs a dedicated game server."
- "Online services are unavailable on this network. You can still play Guest Offline."

Keep "Firebase" visible only in developer/diagnostic surfaces such as Advanced Server settings and Run Firebase Test output.

## Old Backend Status

Old blocked Worker endpoints:

- `https://infernodrift4-online.clarkbythebay.workers.dev`
- `wss://infernodrift4-online.clarkbythebay.workers.dev/ws`

These should not be the default production backend anymore.

They may still be useful for:

- legacy fallback in networks where Workers are reachable
- reference behavior while porting features
- importing old account/profile/save data into Firebase
- testing the old authoritative WebSocket server
- `npm run smoke:online-local` and Worker checks when intentionally changing legacy server behavior

Do not delete the Worker backend without explicit owner approval.

## Replit Status

Replit was abandoned for production because publishing required payment.

Rules:

- do not publish to Replit
- do not use Replit dev links in production
- do not ask the owner to pay for Replit
- any Replit code can only be used as behavioral reference

## Progress And XP Preservation

A major migration requirement is that players must not lose old XP/progress.

The current bridge does this:

- exports password-account save data from the old Cloudflare D1 database into `legacy-cloudflare-progress.json`
- ships that manifest with the static GitHub Pages build
- automatically checks the manifest after Firebase account sign-in/create for the same normalized username
- imports the higher-XP old Cloudflare save into Firebase without any player-facing recovery button
- detects an existing old Worker online session stored in browser localStorage
- uses the old Worker `/api/profile` path when a legacy session token exists
- compares old backend save XP, current local save XP, and Firebase cloud save XP
- syncs the highest-progress save into Firebase
- prevents Firebase sign-in from overwriting a higher Firestore save with lower local data
- refreshes progress and writes the canonical total-XP leaderboard row on auth/sign-in
- records a local one-time import marker under `infernoDrift4.legacyImport.v1:<username>` so repeated sign-ins do not keep reimporting the same bundled save

Important implementation concepts:

- the bundled manifest must never include password hashes, salts, sessions, private tokens, or service credentials
- old usernames with spaces are valid Firebase usernames now, and their derived Firebase Auth email replaces spaces with dots
- if a legacy username has no Firebase Auth user yet, the sign-in path may create the Firebase Auth user and then import progress automatically
- never blindly overwrite Firestore progress during login
- use total XP comparison before choosing a save payload
- Firebase cloud progress should win if it has more XP
- old Cloudflare/Worker progress should be imported if it has more XP
- local offline progress should still survive if it has more XP
- leaderboard sync must use total XP from `progressionV2`, not a per-mode run score
- no player should need to click a recovery button; legacy import is a quiet one-time account sign-in side effect

Do not add a manual "Recover Old Save" flow unless the owner explicitly asks for one. The intended player experience is: sign in normally, keep playing, and let the one-time migration run quietly.

To refresh the one-time Cloudflare export, run:

```bash
node scripts/export-legacy-cloudflare-progress.mjs
```

Then rebuild and publish the static site so `dist/legacy-cloudflare-progress.json` is updated.

If that export script cannot run because Cloudflare credentials are missing, do not invent progress data. Report that the bundled manifest could not be refreshed and keep the existing checked-in/static manifest behavior.

## Firebase Data Model

Expected Firestore collections:

- `users/{uid}`
- `usernames/{usernameLower}`
- `progress/{uid}`
- `leaderboards/{mode}/scores/{scoreId}`
- `chatRooms/{roomId}/messages/{messageId}`
- `lobbies/{code}`
- `feedback/{feedbackId}`
- `friendRequests/{requestId}`
- `friends/{uid}/items/{friendUid}`
- `diagnostics/{uid}`

Do not add Firebase Admin SDK keys or service-account JSON to the repo. The public Firebase web config is allowed in frontend code; security comes from Firebase Auth and Firestore rules.

## Firestore Rules

`firestore.rules` is part of the backend. If backend behavior changes, update and publish Firestore rules too.

Current rules cover:

- signed-in-only writes
- own-profile and own-progress writes
- username claim uniqueness shape, including legacy usernames with single spaces
- leaderboard score limits
- chat message length and room-invite payloads
- lobby create/join document rules
- feedback length and field restrictions
- friend request boundaries
- diagnostics writes

Deployment command when Firebase CLI auth exists:

```bash
firebase deploy --only firestore:rules
```

If CLI auth is unavailable, publish the rules manually in the Firebase Console for project `infernodrift4-online`.

Do not leave Firestore in open test mode.

## Frontend Behavior Requirements

The game must not block launch on online services.

Required behavior:

- Firebase is checked after page load, not as a hard gate before play.
- Users can create account, sign in, continue as guest, or continue offline.
- If Firebase fails, show a clear offline fallback message.
- The game must never stay stuck on `Connecting to account...`.
- Local modes, bots, local saves, and local best scores must keep working.
- Server settings should no longer show the Worker WebSocket as the default in Firebase mode.
- Diagnostics should show backend mode `firebase`, Firebase project ID, auth status, Firestore status, chat status, leaderboard status, last error, and offline fallback status.

## Firebase Feature Map

| Feature                | Firebase path                              | Notes                                                                                 |
| ---------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------- |
| Account sign-in/create | Firebase Auth plus `users/{uid}`           | Username maps to a derived Firebase email internally.                                 |
| Username uniqueness    | `usernames/{usernameLower}`                | Claimed transactionally by the client with rules support.                             |
| Guest online           | Firebase Anonymous Auth                    | Falls back to local guest if Firebase is blocked.                                     |
| Progress               | `progress/{uid}`                           | Uses XP-aware best-save selection.                                                    |
| Leaderboard            | `leaderboards/all-modes/scores/{uid}`      | Client-submitted total-XP row, sanity checked, includes `playerRow`, not cheat-proof. |
| Lobby chat             | `chatRooms/lobby/messages`                 | Uses Firestore realtime listeners.                                                    |
| Firebase lobbies       | `lobbies/{code}`                           | Create/join/share code plus membership subscription, not authoritative racing.        |
| Feedback               | `feedback/{feedbackId}`                    | 2500-character limit.                                                                 |
| Friends                | `friendRequests` and `friends/{uid}/items` | Basic request/accept architecture.                                                    |
| Diagnostics            | `diagnostics/{uid}`                        | Used by Online -> Run Firebase Test.                                                  |

## Current UI And Diagnostics Contract

The normal game should not say "Firebase" except inside developer areas.

Expected player-facing Online tab behavior:

- the Online tab status uses generic "online services" language
- guest flow says "online guest" or "Guest Offline"
- room button says `Create Online Lobby`
- lobby state says chat/invites are active and live racing needs a dedicated game server
- queue button is disabled as `Live Queue Unavailable` in Firebase mode
- feedback copy says feedback saves online when signed in or online guest

Expected developer/diagnostic behavior:

- Advanced Server settings may mention Firebase and legacy WebSocket fallback.
- `Run Firebase Test` may mention `Backend mode firebase`, `Firebase project infernodrift4-online`, diagnostics, Firestore, chat, leaderboard, and `firebase_no_authoritative_websocket`.
- `render_game_to_text().online` exposes backend mode, transport, Firebase status, legacy import status, leaderboard `playerRow`, room/lobby state, feedback status, and diagnostics.

## Testing Checklist

Before shipping online/backend changes, run the relevant local checks:

```bash
node --check script.js
node --check firebase-online.js
node --check smoke_firebase_live.mjs
npm run typecheck
npm test
npm run build
npm run smoke:firebase
npm run smoke:firebase-live
npm run smoke
npm run test:e2e
```

Use these legacy checks only when intentionally touching legacy WebSocket/Worker behavior:

```bash
npm run smoke:online-local
npm run worker:check
npm run worker:types
```

After publishing to GitHub Pages, test the public URL with cache-bust:

```bash
SMOKE_URL='https://canimal4.github.io/InfernoDrift4/?firebaseLive=<commit>' node smoke_firebase_live.mjs
SMOKE_URL='https://canimal4.github.io/InfernoDrift4/?firebaseOffline=<commit>' node smoke_firebase_offline.mjs
```

Expected live smoke shape:

- `firebaseDefault` is `firebase`
- `projectId` is `infernodrift4-online`
- `transport` is `firebase`
- Firebase lobby code is created
- diagnostics are `ok`
- WebSocket state is `firebase_no_authoritative_websocket`
- the smoke verifies account create/sign-in, XP/progress sync, leaderboard `playerRow`, logout/sign-in restore, chat/lobby invite, second-client lobby join, diagnostics, and honest non-authoritative WebSocket state

For player-facing copy checks after UI/backend wording changes, run a live or local browser text audit that removes `.advanced-online-settings` before scanning the page text for `Firebase` / `FireBase`. The expected result outside Advanced/developer areas is no provider-name match.

Recent known-good validation from the current Firebase cleanup/publish path:

- `npm run typecheck`
- `npm test` with 42 tests
- `npm run build`
- `npm run smoke`
- `npm run smoke:firebase`
- `npm run smoke:firebase-live`
- develop-web-game Playwright client against `http://127.0.0.1:4173/index.html`
- public smoke against `https://canimal4.github.io/InfernoDrift4/?v=279a8fd`
- GitHub Actions for commit `279a8fd`: CI, Deploy GitHub Pages, Pages build/deployment, and peer sync all passed

## Deployment Rules For Future Codex Chats

For normal ID4 backend/online work:

1. Update Firebase client code and Firestore rules.
2. Run tests.
3. Publish Firestore rules to Firebase with `firebase deploy --only firestore:rules` when CLI auth is available, or manually in the Firebase Console when it is not.
4. Push the repo so GitHub Pages deploys.
5. Verify the public GitHub Pages URL.
6. If old account save data changed in Cloudflare D1, refresh `legacy-cloudflare-progress.json` and ship it with the client.
7. If player-facing assets are cached, bump the `script.js?v=...` query in `index.html` and verify the live page serves the new query.

Do not deploy Cloudflare or Replit as part of normal Firebase backend work.

Only touch Cloudflare when the task explicitly says to work on the legacy authoritative WebSocket server or Worker fallback. Only touch Replit if the owner explicitly asks for historical reference cleanup.

## Recent Migration Commits To Understand First

These commits define the current Firebase transition baseline:

- `0edaccc` - made Firebase the default online backend.
- `196ad6c` - fixed Firebase account sign-in flow.
- `22f001a` - added Firebase lobby and progress migration support.
- `c9f664c` - restored legacy Cloudflare saves into Firebase.
- `e8b743f` - fixed Firebase lobby join flow.
- `c675ed5` - cache-busted Firebase lobby modules.
- `18f2709` - hardened Firebase progress/leaderboard parity.
- `279a8fd` - removed provider-name wording from normal player-facing online UI.

## Progression Economy Note

The shipped static client now stores the progression/economy refresh inside `progressionV2` schema version 3 in the existing `progress/{uid}.payload` document. New fields include `embers`, `ownedCosmetics`, `claimedLevelRewards`, `dailySparks`, `seenModeIntros`, `tutorialComplete`, and `recentRewards`.

Do not add Firestore top-level fields for these unless a future feature genuinely needs indexed/queryable data. Keep leaderboard ranking sourced from `progressionV2.totalXp`, and preserve the highest total XP when merging local, Firebase, and legacy saves.

If a new chat sees old guidance saying the default server is Workers or Replit, treat that guidance as stale unless the current repo contradicts this file.

## Safety Rules

- Do not ask the owner to pay for Replit.
- Do not enable Firebase billing or Blaze without explicit approval.
- Do not expose secrets, service accounts, admin keys, tokens, or cookies.
- Do not fake login, chat, leaderboard, lobby, or multiplayer success.
- Do not silently drop old progress.
- Do not make Worker/Replit the primary backend again.
- Do not disable offline/local play.
- Do not delete the Worker backend until a separate explicit removal task exists.

## Known Limitation

Firebase Spark is good enough for online-lite social and persistence features, but not for secure authoritative multiplayer. Leaderboard scores are client-submitted and sanity checked, not cheat-proof. True authoritative live racing would require either keeping a reachable free/approved WebSocket server, adding a paid/approved server platform, or redesigning multiplayer around non-authoritative asynchronous features.
