# Account Sync And XP Safety

This note documents the recurring XP/account sync bug fixed in the Firebase
account pipeline.

## Root Cause

Older special-badge account repair code wrote real progression fields for badge
accounts. That produced contaminated saved data such as `100450 XP` for Clark
with markers like `specialBadgeProgressSource: "special-badge-xp-repair"` and
`specialBadgeProgressBaselineXp: 22000`.

The later account merge logic treated XP as "highest value wins." That is safe
for normal earned progress, but unsafe when the higher value came from an
obsolete repair marker. The contaminated value could live in more than one
place:

- `progress/{uid}.payload.progressionV2`
- `users/{uid}.progress`
- `leaderboards/all-modes/scores/{uid}`
- local account save or cross-tab sync payload

If any writer re-saved a contaminated payload, the bad XP could keep spreading
across sessions and devices.

A second-order form of the same bug can happen after an older client has already
stripped the obsolete marker and cached the bad `100k+` number locally. The
current client treats unmarked special-badge XP in the contaminated range as
suspicious unless it is backed by gameplay evidence such as medals, personal
bests, ghost samples, gameplay reward-log entries, tutorial completion, or Daily
Sparks progress. Embers alone are not enough proof because contaminated saves can
carry inflated Embers too.

## Current Invariants

- Special badge accounts are badge metadata only. Badge status must not grant,
  cap, reset, or otherwise change XP, Embers, cosmetics, garage, or inventory.
- Firebase save writers strip obsolete special-badge repair markers before
  choosing a seed payload or merging a progress sync, but they do not lower the
  account's XP or Embers while doing it.
- Special-badge status itself must never grant, cap, or reset XP, Embers,
  cosmetics, garage state, inventory, or claimed rewards.
- Signed-in account merges keep the highest XP already present in the account
  payloads unless that XP is still tagged with an obsolete badge-repair marker
  and is in the known contaminated range. Marked contaminated XP is blocked from
  becoming active profile state. The client no longer "rescues" these accounts
  by copying a stale clean-looking local value such as `22000 XP`; that value can
  be just another old cache. A known-good real account value must be restored by
  the explicit admin-reviewed repair flow below.
- Unmarked cached special-badge XP in the contaminated range is blocked unless
  it carries an explicit admin-reviewed progress marker. Gameplay metadata such
  as medals or personal bests is not enough to trust a `90k+` special-badge
  payload because the old contaminated XP can be attached to otherwise real
  saved progress.
- Firebase account-profile repair hints also treat unmarked `90k+`
  special-badge profile progress as suspicious unless it carries the
  `admin-reviewed-real-account` progress marker. That keeps a dirty public
  `users/{uid}.progress` row from re-seeding `progress/{uid}` during sign-in or
  sync.
- Public leaderboard rows are sanitized before display. Suspicious old
  special-badge leaderboard scores and test/smoke/runner/pilot rows are ignored
  client-side.
- ChatGPT (Codex) is leaderboard-only. It may stay slightly ahead of real
  visible players, but it must not write to real player profiles. Its ranking
  logic sanitizes input rows before chasing the top score, so dirty `100k+`
  Clark/cache rows cannot drag Codex up to `100k+`.

## Admin Data Cleanup

The client can quarantine obsolete owner-writable private markers on sign-in and
hide dirty public rows, but it cannot delete or edit other users' Firestore
documents under the current production rules. Physical cleanup of stale public profile,
leaderboard, and test account rows requires Firebase owner/admin credentials or
an explicit one-time admin cleanup path.

Use `npm run audit:firebase-public -- --summary` to list currently visible
public rows that the client is ignoring.

Use `SMOKE_URL=<url> npm run smoke:account-xp:target` to run the XP safety smoke
against a deployed or otherwise already-running build. That smoke seeds dirty
Clark/local/Firebase-style data in the browser and fails if the rendered profile
or leaderboard lets `100k+` special-badge XP or Codex contamination through.

Use `npm run cleanup:firebase-public` for a dry-run cleanup plan. To actually
delete the public test-like rows and contaminated leaderboard score rows, first
run `firebase login` with project owner/admin access, then run:

```bash
FIREBASE_CLEANUP_CONFIRM=delete-public-test-data npm run cleanup:firebase-public -- --execute
```

The cleanup script intentionally does not delete real special-badge user
profiles such as Clark's profile. Those rows are reported under `reviewPaths`
because the correct action is an explicit manual admin review with a known-good
XP value; the client will not guess or cap real-account progress.

After a known-good real-account XP and Ember value has been verified by an
admin, the cleanup script can apply that reviewed repair to `progress/{uid}`,
`users/{uid}`, and the public leaderboard row. This path requires both an
explicit UID/username/XP and a short-lived Google OAuth access token:

```bash
GOOGLE_OAUTH_ACCESS_TOKEN="$(gcloud auth print-access-token)" \
FIREBASE_REPAIR_CONFIRM=repair-reviewed-real-account \
npm run cleanup:firebase-public -- \
  --repair-reviewed-account \
  --uid C86jDYuYNWZs5f9g7X1r94DO2cq2 \
  --username Clark \
  --xp <KNOWN_GOOD_XP> \
  --embers <KNOWN_GOOD_EMBERS> \
  --execute
```

Run the same command without `--execute` first to print the dry-run summary.
Do not use this repair command unless the XP/Ember values are independently
verified; it is intentionally not an automatic guess.

After the repair, run the reviewed verification command with the same known-good
values. It reads `progress/{uid}`, `users/{uid}`, and the public leaderboard row
with admin credentials and fails if any copy still has the wrong XP, wrong
Embers, wrong username, missing admin-reviewed marker, or obsolete special-badge
repair markers:

```bash
GOOGLE_OAUTH_ACCESS_TOKEN="$(gcloud auth print-access-token)" \
npm run cleanup:firebase-public -- \
  --verify-reviewed-account \
  --uid C86jDYuYNWZs5f9g7X1r94DO2cq2 \
  --username Clark \
  --xp <KNOWN_GOOD_XP> \
  --embers <KNOWN_GOOD_EMBERS>
```

The public audit can read `users/{uid}` and leaderboard rows. It cannot read
`progress/{uid}` without owner/admin credentials; a public REST read returning
`403 Missing or insufficient permissions` is expected and means private progress
cleanup must be verified by an admin.
