# Codex Online Backend Direction

Use this guidance for future InfernoDrift4 online/backend prompts.

## Default Backend

InfernoDrift4 production online now defaults to Firebase:

- `BACKEND_MODE=firebase`
- Firebase project ID `infernodrift4-online`
- Firebase Auth for accounts and anonymous guests
- Firestore for usernames, progress, leaderboard, chat, friends, feedback, and diagnostics
- GitHub Pages remains the frontend host at `https://canimal4.github.io/InfernoDrift`

## Do Not Use As Production

- Do not use Replit publish unless the owner explicitly approves a paid plan.
- Do not use Replit dev URLs as production.
- Do not make `workers.dev` primary for school users.
- Do not automatically sync Cloudflare/Worker/D1 state into Firebase.
- Do not deploy or mutate Cloudflare unless the owner explicitly asks for legacy WebSocket room-server work.

## Required Behavior

- Never block game launch on online services.
- Never leave account UI stuck on "Connecting to account...".
- If Firebase is unreachable, show that online is unavailable and allow Guest Offline.
- Do not fake authoritative multiplayer: Firebase online-lite covers social/persistence, not trusted realtime physics rooms.
- Keep local/bot/offline play working.
- Do not commit Admin SDK keys, service accounts, passwords, tokens, or private credentials.

## When Backend Work Is Requested

1. Check `firebase-config.js`, `firebase-online.js`, `firebase-online-core.js`, and `firestore.rules`.
2. Update Firestore rules and client Firebase service code.
3. Use Firebase Console/manual steps only for free Auth/Firestore setup.
4. Stop before any billing, Blaze, paid extension, key creation beyond normal Firebase Web app config, or security-sensitive prompt.
5. Run local tests/builds, then verify from the deployed GitHub Pages frontend.
