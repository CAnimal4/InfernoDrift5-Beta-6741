# InfernoDrift4 Firebase Backend Migration

Firebase is the primary production online backend path. Replit publish is not needed, Replit dev links are not production, and `workers.dev` is not required for school users.

## Compatibility Map

| Current feature               | Old endpoint/message/storage                                | Frontend caller                           | Firebase replacement                                                                                         | Launch priority  | Limitation                                                                           |
| ----------------------------- | ----------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------- | ------------------------------------------------------------------------------------ |
| Health/diagnostics            | `GET /health`, Online tab test                              | `runOnlineConnectionTest()`               | Firebase init plus Auth/Firestore diagnostics write/read to `diagnostics/{uid}`                              | Required         | No HTTP `/health`; the client tests Firebase directly.                               |
| Registered account            | `auth.account`, `POST /api/auth/account`                    | Start screen account form                 | Firebase Auth email/password wrapper using username-derived email plus `users/{uid}` and `usernames/{lower}` | Required         | Password reset/email verification is not implemented yet.                            |
| Guest account                 | `auth.guest`                                                | Play as Guest / Online Claim              | Firebase Anonymous Auth when reachable; local session guest when unreachable                                 | Required         | Anonymous guest persistence depends on browser/Firebase auth state.                  |
| Username uniqueness           | Worker/D1 `username_claims`                                 | Account create/sign-in                    | Firestore transaction on `usernames/{usernameLower}`                                                         | Required         | Security rules prevent duplicates but moderation is mostly client-side.              |
| Profile/progress              | `profile.get`, `save.sync`, `GET /api/profile`              | profile tab, save sync                    | `users/{uid}` and `progress/{uid}`                                                                           | Required         | Client can only write its own save; no trusted server validation.                    |
| Leaderboard                   | `leaderboard.get`, `/api/leaderboard`                       | leaderboard tab, run completion/save sync | `leaderboards/all-modes/scores/{uid}` ordered by score                                                       | Required         | Client-submitted and not cheat-proof without Cloud Functions/server.                 |
| Lobby chat                    | `chat.send`, `quick.send`, `chat.history`, `/api/chat/*`    | Online tab and C popout                   | `chatRooms/lobby/messages` with Firestore realtime listener                                                  | Required         | Firestore is online-lite chat, not low-latency game transport.                       |
| Direct messages/reports       | `friend.report`, DM metadata                                | `/dm`, `/report` chat commands            | Reports save to `feedback`; DM architecture exists but should stay guarded                                   | Nice             | Unrestricted youth DMs should not be expanded without stronger safeguards.           |
| Friends                       | `friend.request`, `friend.accept`, `friends.snapshot`       | Online Friends panel                      | `friendRequests/{requestId}` and `friends/{uid}/items/{friendUid}`                                           | Required-lite    | No trusted anti-spam server yet.                                                     |
| Feedback                      | `feedback.submit`, `POST /api/feedback`                     | Feedback modal                            | `feedback/{feedbackId}`                                                                                      | Required         | Email delivery is not configured in Firebase Spark.                                  |
| Presence                      | Worker room snapshots                                       | Online/Friends UI                         | `users/{uid}.lastSeenAt` online-ish timestamps                                                               | Nice             | Realtime Database presence is not enabled yet.                                       |
| Live rooms/queues/match input | `/ws`, `room.*`, `queue.*`, `input.frame`, `match.snapshot` | Online Rooms panel, live driving          | Disabled in Firebase mode with clear copy                                                                    | Required honesty | Firebase is not an authoritative multiplayer physics server. Use local/bots/offline. |

## Firebase Services

- Firebase Auth: Email/Password and Anonymous providers.
- Cloud Firestore: profiles, usernames, progress, leaderboard, chat, friends, feedback, diagnostics.
- Realtime Database: not used in this migration.
- Analytics: not used.
- Admin SDK/service accounts: not used and must not be committed.

## Current Firebase Project

- Project ID: `infernodrift4-online`.
- Plan: Spark/no-cost.
- Web app: `InfernoDrift4 Web`.
- Auth providers enabled: Email/Password and Anonymous.
- Firestore database: `(default)`, Standard edition, `nam5`.
- Authorized frontend domain: `canimal4.github.io`.

## Collections

- `users/{uid}`
- `usernames/{usernameLower}`
- `progress/{uid}`
- `leaderboards/{mode}/scores/{scoreId}`
- `chatRooms/{roomId}/messages/{messageId}`
- `feedback/{feedbackId}`
- `friendRequests/{requestId}`
- `friends/{uid}/items/{friendUid}`
- `diagnostics/{uid}`

## Firebase Console Status

The free Firebase project is set up and the checked-in public web config points at it. Keep `firestore.rules` synchronized with the Firebase Console before launch. Open the deployed Pages game and use Online -> Server settings -> Run Firebase Test after each deploy.

Do not add billing, Blaze, Admin SDK keys, service-account JSON, private API keys, or paid extensions.

## Future Codex Rule

Future Codex backend prompts for InfernoDrift4 should publish/update Firebase config and Firestore rules, not Replit or Cloudflare. Do not "sync" Cloudflare/Replit data with Firebase unless the project owner explicitly asks for a one-time migration. Cloudflare and the local Node server are legacy room-server references only.
