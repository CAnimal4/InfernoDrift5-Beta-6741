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
- Firebase account-profile repair hints also treat the old markerless
  `22000 XP` / `875 Embers` badge-repair cap as suspicious when it belongs to a
  special-badge account and has no reviewed marker or gameplay proof. This is
  important because some older clients stripped the obsolete marker first, then
  re-saved the cap as if it were normal progress.
- When the signed-in Firebase client receives a blocked tainted payload, it
  quarantines that value locally and marks the account as `repair-needed`, but
  it does **not** write a zero-XP repair payload back to Firebase. That matters
  because a guessed zero repair would be just as destructive as the old guessed
  `22000 XP` cap. Raw account XP changes for contaminated real accounts require
  the explicit reviewed repair flow below.
- Public leaderboard rows are sanitized before display. Suspicious old
  special-badge leaderboard scores and test/smoke/runner/pilot rows are ignored
  client-side.
- ChatGPT (Codex) is leaderboard-only. It may stay slightly ahead of real
  visible players, but it must not write to real player profiles. Its ranking
  logic sanitizes input rows before chasing the top score, so dirty `100k+`
  Clark/cache rows cannot drag Codex up to `100k+`.
- Account save timestamps are field-specific where needed. Normal progression
  saves must not refresh `customizationUpdatedAtMs` or `garageUpdatedAtMs`,
  because an old tab can otherwise make stale equipped cosmetics look newer than
  the real garage choice from another browser. Those timestamps move only when a
  garage/customization mutation actually happens.

## Admin Data Cleanup

The client can quarantine obsolete owner-writable private markers on sign-in and
hide dirty public rows, but it cannot delete or edit other users' Firestore
documents under the current production rules. Physical cleanup of stale public profile,
leaderboard, and test account rows requires Firebase owner/admin credentials or
an explicit one-time admin cleanup path.

Use `npm run audit:firebase-public -- --summary` to list currently visible
public rows that the client is ignoring. The summary includes the dirty public
field paths, such as `leaderboards/all-modes/scores/{uid}.score` or
`users/{uid}.progress.totalXp`, plus whether the row can be self-cleaned by the
owner signing in or requires owner/admin cleanup.

If Firestore returns `429 RESOURCE_EXHAUSTED`, the audit reports
`publicReadStatus: "partial_or_failed"` and `displayLeakRisk:
"unknown_public_read_failed"` instead of pretending the data is clean. In the
player UI, this maps to the rate-limited online-service message, not a generic
password or account failure.

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
profiles such as Clark, MODERATOR, Joshua, Tosh, Billy, or JFine. Those rows are
reported under `reviewPaths` because the correct action is an explicit manual
admin review with a known-good XP value; the client will not guess, grant, or cap
real-account progress based on badge status.

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

On 2026-05-31, the public audit could read production again and showed the raw
Firebase state was still physically dirty even though the client guards were
active:

- `leaderboards/all-modes/scores/C86jDYuYNWZs5f9g7X1r94DO2cq2.score = 100450`
  for `Clark`, unreviewed.
- `users/C86jDYuYNWZs5f9g7X1r94DO2cq2.progress.totalXp`,
  `users/C86jDYuYNWZs5f9g7X1r94DO2cq2.progress.xp`,
  `users/C86jDYuYNWZs5f9g7X1r94DO2cq2.stats.totalXp`, and
  `users/C86jDYuYNWZs5f9g7X1r94DO2cq2.stats.xp` were also `100450`,
  unreviewed.
- The cleanup dry run reported hundreds of test-like public rows to delete and
  `reviewPaths` for Clark's `users/{uid}` and `progress/{uid}` docs. Those
  require owner/admin credentials or owner-auth repair; the client must not
  guess the correct XP.
- The public audit can now include evidence summaries for contaminated public
  profiles. For Clark it reported `baselineXp: 22000`, `rewardXp: 9232`,
  `personalBestCount: 8`, `medalCount: 9`, and an obsolete repair marker. This
  evidence explains why the row needs review, but it is intentionally not an
  automatic repair value.

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

If Firebase public collection reads are quota-limited, the targeted reviewed
repair path can skip the public scan and authenticate as the exact owner account
instead of requiring Firebase admin login. This still requires independently
verified XP/Embers and the account password, and it refuses to run if Firebase
Auth returns a different UID:

```bash
FIREBASE_REPAIR_OWNER_PASSWORD="<ACCOUNT_PASSWORD>" \
FIREBASE_REPAIR_CONFIRM=repair-reviewed-real-account \
npm run cleanup:firebase-public -- \
  --repair-reviewed-account \
  --owner-auth \
  --uid C86jDYuYNWZs5f9g7X1r94DO2cq2 \
  --username Clark \
  --xp <KNOWN_GOOD_XP> \
  --embers <KNOWN_GOOD_EMBERS> \
  --execute
```

Verify with the same owner-auth path:

```bash
FIREBASE_REPAIR_OWNER_PASSWORD="<ACCOUNT_PASSWORD>" \
npm run cleanup:firebase-public -- \
  --verify-reviewed-account \
  --owner-auth \
  --uid C86jDYuYNWZs5f9g7X1r94DO2cq2 \
  --username Clark \
  --xp <KNOWN_GOOD_XP> \
  --embers <KNOWN_GOOD_EMBERS>
```
