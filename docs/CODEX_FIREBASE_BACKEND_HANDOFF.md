# InfernoDrift4 Firebase Backend Handoff

Read this first when continuing InfernoDrift4 online/backend work from an older Codex chat that still assumes Cloudflare Workers, Replit, or a required WebSocket backend.

## Current Direction

Firebase is now the default production backend for InfernoDrift4 online-lite features.

- Main game URL: `https://canimal4.github.io/InfernoDrift`
- Firebase project ID: `infernodrift4-online`
- Firebase plan: Spark/no-cost
- Backend mode for production: `firebase`
- Replit is not used for production.
- Replit dev URLs are not acceptable as production.
- Cloudflare Workers are no longer the primary backend for school users.
- The old Worker backend can remain as a fallback/reference/import source, but new default backend work should target Firebase.

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

- private room codes are Firebase lobbies for social grouping, chat, and invite sharing
- live queue/matchmaking is unavailable unless a real server backend is configured
- real-time authoritative racing still needs a trusted WebSocket/server backend
- local play, bots, saves, and offline guest mode must keep working

The UI should say this plainly. It should not fake online racing success.

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

Important implementation concepts:

- the bundled manifest must never include password hashes, salts, sessions, private tokens, or service credentials
- old usernames with spaces are valid Firebase usernames now, and their derived Firebase Auth email replaces spaces with dots
- if a legacy username has no Firebase Auth user yet, the sign-in path may create the Firebase Auth user and then import progress automatically
- never blindly overwrite Firestore progress during login
- use total XP comparison before choosing a save payload
- Firebase cloud progress should win if it has more XP
- old Cloudflare/Worker progress should be imported if it has more XP
- local offline progress should still survive if it has more XP

Do not add a manual "Recover Old Save" flow unless the owner explicitly asks for one. The intended player experience is: sign in normally, keep playing, and let the one-time migration run quietly.

To refresh the one-time Cloudflare export, run:

```bash
node scripts/export-legacy-cloudflare-progress.mjs
```

Then rebuild and publish the static site so `dist/legacy-cloudflare-progress.json` is updated.

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

| Feature | Firebase path | Notes |
| --- | --- | --- |
| Account sign-in/create | Firebase Auth plus `users/{uid}` | Username maps to a derived Firebase email internally. |
| Username uniqueness | `usernames/{usernameLower}` | Claimed transactionally by the client with rules support. |
| Guest online | Firebase Anonymous Auth | Falls back to local guest if Firebase is blocked. |
| Progress | `progress/{uid}` | Uses XP-aware best-save selection. |
| Leaderboard | `leaderboards/all-modes/scores/{uid}` | Client-submitted, sanity checked, not cheat-proof. |
| Lobby chat | `chatRooms/lobby/messages` | Uses Firestore realtime listeners. |
| Firebase lobbies | `lobbies/{code}` | Create/join/share code, not authoritative racing. |
| Feedback | `feedback/{feedbackId}` | 2500-character limit. |
| Friends | `friendRequests` and `friends/{uid}/items` | Basic request/accept architecture. |
| Diagnostics | `diagnostics/{uid}` | Used by Online -> Run Firebase Test. |

## Testing Checklist

Before shipping online/backend changes, run the relevant local checks:

```bash
npm run typecheck
npm test
npm run build
npm run smoke:firebase
npm run smoke:firebase-live
npm run smoke
npm run test:e2e
```

Use the old server smoke only when intentionally touching legacy WebSocket behavior:

```bash
npm run smoke:online-local
```

After publishing to GitHub Pages, test the public URL with cache-bust:

```bash
SMOKE_URL='https://canimal4.github.io/InfernoDrift/?firebaseLive=<commit>' node smoke_firebase_live.mjs
SMOKE_URL='https://canimal4.github.io/InfernoDrift/?firebaseOffline=<commit>' node smoke_firebase_offline.mjs
```

Expected live smoke shape:

- `firebaseDefault` is `firebase`
- `projectId` is `infernodrift4-online`
- `transport` is `firebase`
- Firebase lobby code is created
- diagnostics are `ok`
- WebSocket state is `firebase_no_authoritative_websocket`

## Deployment Rules For Future Codex Chats

For normal ID4 backend/online work:

1. Update Firebase client code and Firestore rules.
2. Run tests.
3. Publish Firestore rules to Firebase.
4. Push the repo so GitHub Pages deploys.
5. Verify the public GitHub Pages URL.
6. If old account save data changed in Cloudflare D1, refresh `legacy-cloudflare-progress.json` and ship it with the client.

Do not deploy Cloudflare or Replit as part of normal Firebase backend work.

Only touch Cloudflare when the task explicitly says to work on the legacy authoritative WebSocket server or Worker fallback. Only touch Replit if the owner explicitly asks for historical reference cleanup.

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
