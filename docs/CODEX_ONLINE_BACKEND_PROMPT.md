# Codex Online Backend Direction

Use this guidance for future InfernoDrift4 online/backend prompts.

## Default Backend

InfernoDrift4 production online now defaults to Firebase:

- `BACKEND_MODE=firebase`
- Firebase project ID `infernodrift4-online`
- Firebase Auth for accounts and anonymous guests
- Firestore for usernames, progress, leaderboard, Firebase lobby rooms, chat, friends, feedback, and diagnostics
- GitHub Pages remains the frontend host at `https://canimal4.github.io/InfernoDrift4`

## Do Not Use As Production

- Do not use Replit publish unless the owner explicitly approves a paid plan.
- Do not use Replit dev URLs as production.
- Do not make `workers.dev` primary for school users.
- Do not make Cloudflare/Worker/D1 primary again. A one-time legacy progress import bridge may read old Worker account saves and write the best XP/progress into Firebase.
- Do not deploy or mutate Cloudflare unless the owner explicitly asks for legacy WebSocket room-server work.

## Required Behavior

- Never block game launch on online services.
- Never leave account UI stuck on "Connecting to account...".
- If Firebase is unreachable, show that online is unavailable and allow Guest Offline.
- Do not fake authoritative multiplayer: Firebase lobby rooms cover social/invites, not trusted realtime physics rooms.
- Keep local/bot/offline play working.
- Do not commit Admin SDK keys, service accounts, passwords, tokens, or private credentials.

## When Backend Work Is Requested

1. Check `firebase-config.js`, `firebase-online.js`, `firebase-online-core.js`, and `firestore.rules`.
2. Update Firestore rules and client Firebase service code.
3. Publish Firestore rules to Firebase project `infernodrift4-online` with Firebase Console or `firebase deploy --only firestore:rules` when the CLI is authenticated.
4. Stop before any billing, Blaze, paid extension, key creation beyond normal Firebase Web app config, or security-sensitive prompt.
5. Run local tests/builds, then verify from the deployed GitHub Pages frontend.
