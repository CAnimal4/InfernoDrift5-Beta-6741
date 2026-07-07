# InfernoDrift4 Chat Handoff Summary

Last updated: May 20, 2026

This file is meant to let a brand-new Codex chat pick up the InfernoDrift4 work without rereading the whole original conversation.

## Project And Workspace

- Main workspace: `/Users/amandaalden/Downloads/Codex App Test/InfernoDrift4`
- Shipped product: root static game, not the React/Vite reference client.
- Primary launch files:
  - `index.html`
  - `script.js`
  - `style.css`
  - `scripts/build-site.mjs`
- Public game URL: `https://canimal4.github.io/InfernoDrift4/`
- Cloudflare Worker URL: `https://infernodrift4-online.clarkbythebay.workers.dev`
- Worker WebSocket path: `/ws`
- Worker health path: `/health`
- D1 database name: `infernodrift4`
- D1 database id: `830d1cce-a09c-4112-8a28-24b421c4acda`
- Worker config: `wrangler.jsonc`

The user wants InfernoDrift4 treated as the active product name. Do not refer to “ID3”, “ID3.3”, or “ID4” in user-facing copy. Say “InfernoDrift4”.

## User Preferences And Working Style

- The user wants implementation, testing, commit, push, and deploy when they ask for fixes.
- Do not stop at suggestions if the issue is actionable.
- Use subagents when explicitly requested or when multiple independent workstreams make sense.
- Keep changes focused when the user says this is a debug/fix pass.
- Do not broadly redesign unless explicitly asked.
- Preserve current game/UI/style unless a change is needed to fix the issue.
- Do not fake online success states.
- Do not expose secrets.
- Do not retrieve or reveal user passwords. Offer password reset instead.
- If Cloudflare dashboard work is needed, the user prefers Safari/Computer Use when possible, but local Wrangler commands have been used safely for Worker/D1 work.

## Current Product Direction

InfernoDrift4 is a browser game with:

- Static Three.js gameplay in `script.js`
- HTML/CSS UI in `index.html` and `style.css`
- Local and backend-backed online systems
- GitHub Pages static hosting
- Cloudflare Worker + Durable Object + D1 backend

The root static game remains the launch product. The React/Vite code is reference/scaffolding only unless a future parity gate proves otherwise.

## Major Implemented Areas

### Phase 1

- Stabilized the current InfernoDrift4 driving loop.
- Removed user-facing “Risk mode” references.
- Reworked jump/backflip to use `X`.
- Re-added visible ground speed/reference lines.
- Improved boost, drift, landing, hunter warning, impact, pickup, and score feedback.
- Removed persistent Drift HUD pill.
- Moved Boost and Shield into the main HUD row.

### Phase 2

- Revamped HUD/menu/garage within the root static UI.
- Added cleaner HUD clusters and smaller mobile radar.
- Added better pause/results/settings/controls/profile/online surfaces.
- Turned Customize into Garage.
- Added loadouts, car classes, keyboard remapping, touch settings, and controller support.
- Added `Q` exit-link action:
  - Fixed key: `Q`
  - Default URL: `https://lbusd.instructure.com/?login_success=1`
  - URL editable in Controls, key not remappable.
  - `Q` should type normally inside text inputs.

### Phase 3

- Added offline modes/minigames and progression.
- Public modes should currently include:
  - Campaign Survival
  - Max Arena
  - Race
  - Time Trial
  - Stunt Park
  - Hunter Tag
  - Battle Arena
  - Ramp Rush
  - Boost Bowling
  - Lava Floor
  - King of the Zone
- Removed public:
  - Boss Chase
  - Drift Score Attack
  - Trick Combo
  - Bot Escape
- Added XP/progression shared across all games and minigames.
- Leaderboard should be global Total XP.
- Daily gift:
  - Once per day
  - 100 to 1000 XP
  - Lower amounts more common
  - Claim should sync XP and leaderboard.
- Friending Founder account `Clark` grants +1000 XP once.

### Phase 4 Online

Backend goals:

- Real accounts and guest play.
- Password accounts, username uniqueness, age gate.
- Guest account fallback with random username and no durable account progress.
- Friends, friend requests, accepts, blocks, reports.
- Chat, quick chat, 13+ free chat, under-13 quick-chat only.
- Direct messages through `/dm`.
- Reports through `/report`.
- Rooms with unique codes, mode selection, share-to-chat as clickable invite.
- Leaderboard sorted by Total XP for all accounts with XP, even offline.
- Profile tab with logout/delete account.
- Feedback popup saves to backend and sends email when configured.
- Moderation:
  - MODERATOR can kick/ban.
  - Kicks should disconnect current session only.
  - Bans should last 24 hours, block account/device online access, then expire automatically.

## Known Accounts And Badges

Seeded/badged accounts are intended to act like normal accounts with badges, not special fake leaderboard rows.

- `Joshua`
  - Password: known to repo/test as `footballcards`
  - Badge: `Advanced Player`
- `Tosh the Sigma`
  - Password: known to repo/test as `642066`
  - Badge: `Rizzler`
- `Clark`
  - Password: known to repo/test as `ibelikesheesh`
  - Badge: `Founder`
  - Should not get admin powers by default.
- `MODERATOR`
  - Password: known to repo/test as `thefoxjumpedoverthelazyriver`
  - Badge: `MOD`
  - Has moderation powers.
- `Billy`
  - Password: known to repo/test as `BillyK2012`
  - Badge: `Advanced Player 2.0`

Do not reveal stored passwords from the backend. If someone asks for an account password, refuse and offer a reset tool/flow.

## Recent Important Fixes

### Chat Command Fix

Problem: typing `/dm` and clicking Send did nothing for some users.

Root causes:

- Chat input/send controls were disabled when free chat was unavailable, which also blocked command handling.
- Blank `/dm` was being sanitized into fallback username `Player`.

Fix:

- Chat inputs remain enabled so `/dm` and `/report` work.
- Free-text chat still remains age-gated.
- Added optional username sanitizer that returns blank instead of `Player`.
- Verified `/dm` opens DM command panel and `/report` opens report command panel.
- Commit pushed: `39573ee` with final command fix.

### Google Favicon Fix

Problem: favicon did not show in Google.

Fix:

- Added explicit favicon tags to `index.html`.
- Added `icon-48.png`, `icon-192.png`, `apple-touch-icon`, manifest, theme color.
- Added `robots.txt`, `sitemap.xml`, canonical URL.
- Verified live icon assets return HTTP 200.
- Commit pushed: `48fae68`.

Google can take days/weeks to update search result favicon. Use Google Search Console URL Inspection / Request Indexing if available.

### Ban Expiration Fix

Problem: user kicked/banned themselves yesterday and was still banned today.

Findings:

- Live D1 had an active ban row for a guest/device ban.
- Expired bans were removed from in-memory state, but D1 `account_bans` rows could survive and rehydrate stale bans into Durable Object state after reload.

Fix:

- Removed live ban rows from D1.
- Added pruning of expired/invalid bans in local server storage.
- Worker now clears stale Durable Object bans and reloads active bans from D1.
- D1 expired bans are deleted during hydration.
- Active ban checker now looks through account/device bans and prunes expired entries instead of getting stuck on a stale first candidate.
- Regression test confirms:
  - Ban blocks account.
  - Ban blocks same device guest.
  - Expired ban lets account sign in again.
  - Expired account/device ban records are removed.
- Worker deployed:
  - Version ID: `e1b9c3b2-7995-4e40-99f5-3af8c8724171`
- Commit pushed: `5e785e9`.

## Current Open Issue From User

The user reported on a school computer:

> account error: message too large

Then they asked for this handoff file before the issue was debugged.

The next chat should prioritize this.

Likely areas to inspect:

- WebSocket message-size validation in `apps/worker/src/protocol.js`.
- Client auth/account payload size in `script.js`.
- Any `auth.account`, `save.sync`, `profile`, or `cloud save` payload being sent during sign-in.
- School computer may have stale localStorage/save data that makes the client send a huge account/save payload.
- Backend may reject oversized messages with `message_too_large`.
- Need graceful handling:
  - Do not hang.
  - Show clear error.
  - If local save is too large, trim/compress or sync after auth in chunks.
  - Never send huge local diagnostics/chat/history/account payload during login.

Suggested first actions:

1. Search for `message_too_large`, `message too large`, `MAX_MESSAGE`, `max`, and protocol validation.
2. Inspect auth and save sync payload flow in `script.js`.
3. Reproduce by artificially inflating localStorage save/progression/chat state and signing in.
4. Add client-side payload size guard and logging.
5. Make sign-in send only username/password/age/device/session basics.
6. Move save sync to after auth and cap/sanitize its payload.
7. Add tests for oversized saved data and school-style stale cache/localStorage.

## Current Dirty Working Tree Warning

Before this handoff file was created, `git status --short` showed these files already modified:

- `apps/server/src/index.js`
- `index.html`
- `package-lock.json`
- `package.json`
- `script.js`

Those changes were pre-existing relative to this handoff request. Do not revert them unless the user asks. Inspect before editing.

This handoff file itself is new:

- `INFERNODRIFT4_CHAT_HANDOFF.md`

## Useful Commands

Run from `/Users/amandaalden/Downloads/Codex App Test/InfernoDrift4`.

Core checks:

```bash
node --check script.js
npm run format
npm run typecheck
npm test
npm run build
npm run smoke
npm run test:e2e
npm run smoke:online-local
npm run worker:check
npm run worker:types
```

Deploy Worker:

```bash
npm run deploy:worker
```

Build static site:

```bash
npm run build:web
```

Check Worker health:

```bash
curl -fsSL https://infernodrift4-online.clarkbythebay.workers.dev/health
```

Query D1 active bans:

```bash
npx wrangler d1 execute infernodrift4 --remote --command "SELECT COUNT(*) AS active_bans FROM account_bans WHERE banned_until > datetime('now');"
```

List recent bans:

```bash
npx wrangler d1 execute infernodrift4 --remote --command "SELECT user_id, username, banned_until, reason, created_at FROM account_bans ORDER BY created_at DESC LIMIT 25;"
```

Remove expired bans:

```bash
npx wrangler d1 execute infernodrift4 --remote --command "DELETE FROM account_bans WHERE banned_until <= datetime('now') OR banned_until = '';"
```

## Backend/Cloudflare Services

Used:

- Cloudflare Workers
- Durable Objects
- D1
- Resend from Worker for feedback/report email when configured

Not currently central:

- R2 is not used for gameplay.
- Turnstile was planned/optional, not necessarily fully configured.

Known Worker secrets/config:

- `RESEND_API_KEY`
- `FEEDBACK_FROM`
  - Desired sender: `InfernoDrift4 <clark.alden@lbusd.org>`
- `FEEDBACK_TO`
  - `clarkbythebay@gmail.com,clark.alden@lbusd.org`

Feedback health previously showed:

```json
{
  "ok": true,
  "optionalBindings": { "d1": true, "resend": true },
  "feedback": {
    "ready": true,
    "apiKeyConfigured": true,
    "fromConfigured": true,
    "toConfigured": true,
    "toCount": 2
  }
}
```

## Online Reliability Goals To Preserve

- Accounts/chat/leaderboard should have HTTPS fallback if WebSocket is blocked.
- Rooms are WebSocket-only and should say clearly when live connection is required.
- Login must never hang forever.
- Chat must not silently fail.
- `C` opens chat or an honest offline explanation.
- School computers/networks may block `workers.dev` or WebSockets; UI must fail clearly.
- A connection test button exists or should exist to test:
  - backend health
  - account auth
  - HTTPS chat
  - WebSocket rooms
  - what is blocked

## Chat Commands

Expected behavior:

- `/dm`
  - Opens DM menu in chat popout.
  - Shows friends.
  - Allows typing username.
  - Opens private DM thread.
  - DMs are still filtered/moderated.
  - Recipient gets minimal popup notification.
- `/report`
  - Opens report menu.
  - User enters username and reason.
  - Backend stores report and sends email to:
    - `aidan.dwight@lbusd.org`
    - `clark.alden@lbusd.org`
  - Report includes recent chat history, including DMs.

## Moderation Expected Behavior

Kick:

- Moderator-only.
- Removes target from live session/room immediately.
- Forces target to account screen.
- Does not delete progress.
- Does not create a lasting ban.
- User can sign in again immediately.

Ban:

- Moderator-only.
- Duration: 24 hours.
- Blocks account and online identity/device/session from online access.
- Should automatically expire after 24 hours.
- Expired bans must not come back from Durable Object cache or D1.
- Ban should not prevent offline local play unless explicitly designed later.

Self-moderation:

- Server should reject moderator trying to kick/ban their own active account.

## Leaderboard/XP Expected Behavior

- All games and minigames share one XP total.
- Leaderboard is global Total XP.
- All real accounts with XP should appear, even if offline.
- Seeded/badged accounts act like normal accounts; badges are display metadata only.
- XP gain should update:
  - Progress tab
  - Profile tab
  - Leaderboard
  - Server save
- Client should sync progress/leaderboard roughly every 30 seconds while signed in.
- Do not trust client-submitted fake rank/result messages.

## Rooms Expected Behavior

- Private room codes unique per room.
- Creating a room requires choosing mode.
- Joining a room should move the player into that room and mode.
- Friends should not auto-join just because another friend created a room.
- Share code posts once to chat and then disables/shows Shared.
- Chat room invite should render as a clickable join button.
- Multiple rooms can exist simultaneously.
- Remote players should show:
  - position
  - heading
  - airborne/backflip/barrel-roll/trick state
  - boost
  - skin/cosmetics
  - team tint only in team modes
  - nametag

## Gameplay Areas With Past Bugs

Battle Arena:

- Red vs blue.
- Player on blue.
- Team-colored cars only inside Battle Arena.
- Split red/blue floor.
- Solid cover boxes/barriers.
- Lasers on `F`.
- Lasers should not pass through solid boxes.
- Boxes should not glitch player.
- Slower/less twitchy handling for aiming.
- Health/ammo/shields.
- Flag capture and return pads.
- Bots should understand the mode.

Race/Time Trial:

- Should feel clean, wide, readable, arcade-racing-like.
- No hunters.
- Time Trial solo.
- Race rivals should race/bump, not damage/chase.
- Track should be winding, not a simple circle or neon blob.
- Better handling than survival.

Max Arena:

- Controls should match other modes.
- Player can jump/backflip.
- Ctrl near ball should hit ball toward opponent goal.
- Goal explosion/replay should be visible long enough.

Feedback:

- Limit 2500 characters.
- Live character counter.
- Backend validates too.
- No silent truncation.

School warning screen:

- A schedule-based warning was requested:
  - During school class periods: show “It looks like you may be in school, are you sure you want to continue?”
  - Big Leave button closes/replaces tab.
  - Smaller “I know the risks, continue” link opens normal game.
  - No warning before/after school, weekends, break/snack/lunch.
- Check whether current implementation exists before modifying.

## Testing Expectations

When fixing online issues, test:

- Fresh browser/localStorage.
- Deployed public URL.
- Backend unavailable.
- WebSocket blocked/timeout.
- HTTPS fallback.
- Slow backend.
- Oversized/stale local save.
- Account sign-in.
- Guest sign-in.
- Chat.
- DM.
- Report.
- Friends request/accept.
- Rooms create/join/share.
- Leaderboard after XP gain.
- Kick/ban live action.

When fixing game issues, test with browser/playwright and inspect `window.render_game_to_text()`.

## Public Browser APIs To Preserve

- `window.render_game_to_text()`
- `window.advanceTime(ms)`
- `window.__infernodriftTestApi`

These are used heavily by smoke tests and should remain stable.

## Suggested Next Chat Prompt

If starting a new chat, paste this:

> Read `/Users/amandaalden/Downloads/Codex App Test/InfernoDrift4/INFERNODRIFT4_CHAT_HANDOFF.md` first. Continue the InfernoDrift4 work from there. The current urgent bug is: on a school computer, account sign-in shows `account error: message too large`. Diagnose the real cause, fix it without faking success, test local and deployed behavior, then commit/push/deploy if needed. Preserve the current static InfernoDrift4 architecture and do not broadly redesign.

