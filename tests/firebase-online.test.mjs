import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  FIREBASE_CHAT_LIMIT,
  FIREBASE_FEEDBACK_LIMIT,
  FIREBASE_LEADERBOARD_MODE,
  FIREBASE_PASSWORD_BADGE_ACCOUNTS,
  FIREBASE_STATIC_BADGE_ACCOUNTS,
  createFirebaseLobbyCode,
  getFirebaseBadges,
  getFirebaseCredentialBadges,
  getFirebasePasswordBadgeAccount,
  isFirebaseCredentialUsername,
  mapFirebaseError,
  normalizeFirebaseLobbyCode,
  normalizeFirebaseUsernameKey,
  sanitizeFirebaseText,
  validateFirebaseAccountCredentials,
  validateFirebaseLobbyCode,
  usernameToFirebaseEmail,
  validateFirebaseFeedback,
  validateFirebaseScore,
  validateFirebaseUsername,
} from "../firebase-online-core.js";
import {
  chooseLatestSavePayload,
  mergeFirebaseSavePayload,
} from "../firebase-online.js";

test("Firebase username validation enforces launch-safe names", () => {
  assert.equal(validateFirebaseUsername("Clark").ok, true);
  assert.deepEqual(getFirebaseBadges("Clark"), ["Founder"]);
  assert.deepEqual(getFirebaseBadges("JFine"), ["Advanced Player"]);
  assert.equal(getFirebaseBadges("clark").length, 0);
  assert.deepEqual(
    getFirebaseCredentialBadges("Tosh_the_Sigma", "iamthesigma"),
    ["Rizzler"],
  );
  assert.deepEqual(
    getFirebaseCredentialBadges("Joshua", "footballcards"),
    ["Advanced Player"],
  );
  assert.deepEqual(
    getFirebaseCredentialBadges(
      "MODERATOR",
      "thefoxjumpedoverthelazyriver",
    ),
    ["MOD"],
  );
  assert.deepEqual(getFirebaseCredentialBadges("Tosh_the_Sigma", "wrong"), []);
  assert.deepEqual(getFirebaseCredentialBadges("Joshua", "wrong"), []);
  assert.deepEqual(getFirebaseCredentialBadges("MODERATOR", "wrong"), []);
  assert.deepEqual(getFirebaseCredentialBadges("Tosh the Sigma", "iamthesigma"), ["Rizzler"]);
  assert.deepEqual(
    FIREBASE_STATIC_BADGE_ACCOUNTS.map((entry) => entry.username),
    ["Clark", "JFine"],
  );
  assert.deepEqual(
    FIREBASE_PASSWORD_BADGE_ACCOUNTS.map((entry) => entry.username),
    ["Tosh_the_Sigma", "Joshua", "MODERATOR"],
  );
  assert.equal(
    getFirebasePasswordBadgeAccount("Tosh the Sigma", "iamthesigma")?.username,
    "Tosh_the_Sigma",
  );
  assert.equal(normalizeFirebaseUsernameKey(" Drift-King_4 "), "drift-king_4");
  assert.equal(normalizeFirebaseUsernameKey(" Tosh   the Sigma "), "tosh the sigma");
  assert.equal(validateFirebaseUsername("ab").error, "username_invalid");
  assert.equal(validateFirebaseUsername("Tosh the Sigma").ok, true);
  assert.equal(validateFirebaseUsername("bad name!").error, "username_invalid");
  assert.equal(
    validateFirebaseUsername("x".repeat(21)).error,
    "username_invalid",
  );
  assert.equal(
    validateFirebaseUsername("h3il_hitler").error,
    "username_rejected",
  );
  assert.equal(
    validateFirebaseUsername("ChatGPT (Codex)").error,
    "username_reserved",
  );
  assert.equal(
    validateFirebaseUsername("ChatGPT Codex").error,
    "username_reserved",
  );
  assert.equal(validateFirebaseUsername("MODERATOR").error, "username_rejected");
  assert.equal(isFirebaseCredentialUsername("MODERATOR"), true);
  assert.equal(isFirebaseCredentialUsername("Tosh the Sigma"), true);
  assert.equal(isFirebaseCredentialUsername("moderator"), false);
  assert.equal(
    validateFirebaseAccountCredentials(
      "MODERATOR",
      "thefoxjumpedoverthelazyriver",
    ).ok,
    true,
  );
  assert.equal(
    validateFirebaseAccountCredentials("Tosh the Sigma", "iamthesigma").username,
    "Tosh_the_Sigma",
  );
  assert.equal(
    validateFirebaseAccountCredentials("MODERATOR", "wrongpass").error,
    "invalid_credentials",
  );
  assert.equal(
    validateFirebaseAccountCredentials("moderator", "wrongpass").error,
    "username_rejected",
  );
  assert.equal(
    validateFirebaseAccountCredentials("testy", "secret123").ok,
    true,
  );
  assert.equal(
    usernameToFirebaseEmail("Drift-King_4"),
    "id4.drift-king_4@infernodrift4.firebaseapp.com",
  );
  assert.equal(
    usernameToFirebaseEmail("Tosh the Sigma"),
    "id4.tosh.the.sigma@infernodrift4.firebaseapp.com",
  );
});

test("Firebase account save merge keeps highest XP and newest device state", () => {
  const olderServer = {
    saveMeta: { updatedAtMs: 1_000 },
    customization: { bodyId: "street", paintId: "ember" },
    garage: { activeLoadoutId: "loadout-a" },
    progressionV2: {
      totalXp: 9000,
      xp: 9000,
      embers: 80,
      ownedCosmetics: ["bodyId-street"],
      dailyGift: { seed: "2026-05-23", claimed: false },
      dailySparks: {
        seed: "2026-05-23",
        items: [{ id: "boost", progress: 2, claimed: false }],
      },
    },
  };
  const newerDevice = {
    saveMeta: { updatedAtMs: 2_000 },
    customization: { bodyId: "monster", paintId: "cyan" },
    garage: { activeLoadoutId: "loadout-b" },
    progressionV2: {
      totalXp: 8500,
      xp: 8500,
      embers: 140,
      ownedCosmetics: ["paintId-cyan"],
      dailyGift: { seed: "2026-05-23", claimed: true, claimedAt: "now" },
      dailySparks: {
        seed: "2026-05-23",
        items: [{ id: "boost", progress: 5, claimed: true }],
      },
    },
  };
  const merged = mergeFirebaseSavePayload(olderServer, newerDevice);
  assert.equal(merged.progressionV2.totalXp, 9000);
  assert.equal(merged.progressionV2.xp, 9000);
  assert.equal(merged.progressionV2.embers, 140);
  assert.equal(merged.customization.bodyId, "monster");
  assert.equal(merged.garage.activeLoadoutId, "loadout-b");
  assert.deepEqual(
    new Set(merged.progressionV2.ownedCosmetics),
    new Set(["bodyId-street", "paintId-cyan"]),
  );
  assert.equal(merged.progressionV2.dailyGift.claimed, true);
  assert.equal(merged.progressionV2.dailySparks.items[0].progress, 5);
  assert.equal(merged.progressionV2.dailySparks.items[0].claimed, true);

  assert.equal(
    chooseLatestSavePayload(olderServer, {
      customization: { bodyId: "stale-no-date" },
      progressionV2: { totalXp: 1, xp: 1, embers: 1 },
    }).customization.bodyId,
    "street",
  );
});

test("Firebase chat and feedback filters block unsafe text", () => {
  assert.equal(
    sanitizeFirebaseText("<b>nice shit drift</b>").text,
    "nice stuff drift",
  );
  assert.equal(
    sanitizeFirebaseText("dang that was h*e*l*l").text,
    "dang that was heck",
  );
  assert.equal(
    sanitizeFirebaseText("text me your phone number").error,
    "text_rejected",
  );
  assert.equal(
    sanitizeFirebaseText("x".repeat(FIREBASE_CHAT_LIMIT + 20)).text.length,
    FIREBASE_CHAT_LIMIT,
  );
  assert.equal(validateFirebaseFeedback("Useful bug report").ok, true);
  assert.equal(
    validateFirebaseFeedback("x".repeat(FIREBASE_FEEDBACK_LIMIT + 1)).error,
    "feedback_too_long",
  );
});

test("Firebase leaderboard checks stay conservative", () => {
  assert.deepEqual(validateFirebaseScore({ totalXp: 250 }), {
    ok: true,
    score: 250,
    mode: FIREBASE_LEADERBOARD_MODE,
  });
  assert.equal(validateFirebaseScore({ score: -1 }).error, "score_rejected");
  assert.equal(
    validateFirebaseScore({ score: 1_000_001 }).error,
    "score_rejected",
  );
  assert.equal(
    validateFirebaseScore({ score: 100, mode: "Max Arena!" }).mode,
    "max-arena-",
  );
});

test("Firebase lobby code helpers create joinable room codes", () => {
  const deterministic = {
    getRandomValues(bytes) {
      bytes.set([0, 1, 2, 3, 4]);
      return bytes;
    },
  };
  const code = createFirebaseLobbyCode({ random: deterministic });
  assert.equal(code, "ABCDE");
  assert.equal(validateFirebaseLobbyCode(code).ok, true);
  assert.equal(normalizeFirebaseLobbyCode(" ab-c 12 "), "ABC12");
  assert.equal(validateFirebaseLobbyCode("abc").error, "room_not_found");
  assert.equal(validateFirebaseLobbyCode("ABC12345").ok, true);
});

test("Firebase error mapping feeds the offline fallback state machine", () => {
  assert.equal(
    mapFirebaseError({ code: "auth/invalid-credential" }),
    "invalid_credentials",
  );
  assert.equal(
    mapFirebaseError({ message: "INVALID_LOGIN_CREDENTIALS" }),
    "invalid_credentials",
  );
  assert.equal(
    mapFirebaseError(new Error("Firebase: network request failed")),
    "firebase_unavailable",
  );
  assert.equal(
    mapFirebaseError({ code: "permission-denied" }),
    "permission_denied",
  );
});

test("Firebase guardrails survive stress inputs", () => {
  const allowedNames = ["Racer_001", "drift-king", "Clark", "MAX_RUNNER_20"];
  for (const username of allowedNames) {
    assert.equal(validateFirebaseUsername(username).ok, true, username);
    assert.doesNotThrow(() => usernameToFirebaseEmail(username));
  }

  const rejectedNames = [
    "",
    "ab",
    "bad@name",
    "name!",
    "x".repeat(64),
    "admin",
    "h1tl3r",
  ];
  for (const username of rejectedNames) {
    assert.equal(validateFirebaseUsername(username).ok, false, username);
  }

  const abusiveMessages = [
    "where do you live",
    "text me your phone number",
    "send password",
    "what the fuck",
    "what the f*ck",
    "f u c k",
    "f$ck",
    "f u c k",
    "f*ck",
    "go hurt yourself",
    "n u d e s",
    "y o u  a r e  t r a s h",
    "n0 0ne likes u",
    "what is your email",
    "where do u live",
  ];
  for (const message of abusiveMessages) {
    assert.equal(sanitizeFirebaseText(message).ok, false, message);
  }
  const allowedMessages = [
    "Nice drift!",
    "Can you defend the left goal?",
    "That bot is tough.",
  ];
  for (const message of allowedMessages) {
    assert.equal(sanitizeFirebaseText(message).ok, true, message);
  }

  for (let score = 0; score <= 1_000_000; score += 125_000) {
    assert.equal(
      validateFirebaseScore({ score, mode: "Campaign Survival" }).ok,
      true,
    );
  }
  assert.equal(
    validateFirebaseScore({ score: Number.NaN }).error,
    "score_rejected",
  );
  assert.equal(validateFirebaseScore({}).error, "score_rejected");
  assert.equal(
    validateFirebaseScore({ score: Number.POSITIVE_INFINITY }).error,
    "score_rejected",
  );
});

test("production source defaults to Firebase and keeps Replit out of shipped URLs", () => {
  const script = fs.readFileSync(
    new URL("../script.js", import.meta.url),
    "utf8",
  );
  const buildScript = fs.readFileSync(
    new URL("../scripts/build-site.mjs", import.meta.url),
    "utf8",
  );
  assert.match(script, /const DEFAULT_BACKEND_MODE = BACKEND_MODE_FIREBASE;/);
  assert.match(script, /const DEFAULT_PRODUCTION_BACKEND_URL = "";/);
  assert.match(buildScript, /firebase-config\.js/);
  assert.match(buildScript, /firebase-online\.js/);
  assert.match(buildScript, /legacy-cloudflare-progress\.json/);
  assert.doesNotMatch(script, /replit\.dev|replit\.app|janeway\.replit/i);
});

test("Firebase start account errors distinguish credentials from outages", () => {
  const script = fs.readFileSync(
    new URL("../script.js", import.meta.url),
    "utf8",
  );
  assert.match(
    script,
    /function isAccountAuthFailureCode\(error = ""\)/,
  );
  assert.match(
    script,
    /isAccountAuthFailureCode\(errorCode\)[\s\S]*setStartAccountStatus\(describeOnlineError\(errorCode\), "error"\)/,
  );
  assert.match(
    script,
    /else \{\s*setOfflineGuestFallbackStatus\(\);\s*\}/,
  );
});

test("legacy Cloudflare progress manifest restores old account XP without secrets", () => {
  const manifest = JSON.parse(
    fs.readFileSync(
      new URL("../legacy-cloudflare-progress.json", import.meta.url),
      "utf8",
    ),
  );
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.source, "cloudflare-d1");
  assert.ok(Object.keys(manifest.accounts).length >= 17);
  assert.ok(manifest.accounts.clark.xp >= 11317);
  assert.ok(manifest.accounts.billy.xp >= 6100);
  assert.ok(manifest.accounts["tosh the sigma"].xp >= 4300);
  assert.equal(manifest.accounts.moderator.username, "MODERATOR");
  assert.equal(manifest.accounts.joshua.username, "Joshua");
  const serialized = JSON.stringify(manifest).toLowerCase();
  assert.doesNotMatch(serialized, /passwordhash|passwordsalt|sessiontoken/);
  assert.doesNotMatch(serialized, /olduserid|user_id/);
});

test("Firebase account attach repairs legacy Auth and Firestore splits safely", () => {
  const script = fs.readFileSync(
    new URL("../script.js", import.meta.url),
    "utf8",
  );
  const firebaseOnline = fs.readFileSync(
    new URL("../firebase-online.js", import.meta.url),
    "utf8",
  );
  assert.match(
    script,
    /const signInSavePayload = bundledLegacyEntry\?\.payload \|\| null;/,
  );
  assert.match(script, /function getLegacyProgressAliases\(username = ""\)/);
  assert.match(script, /punctuationAsSpace/);
  assert.match(script, /compactLegacyProgressKey/);
  assert.match(script, /savePayload: signInSavePayload,/);
  assert.match(script, /preferAccountLocal: false,/);
  assert.match(script, /cleanPollutedFresh: !guest,/);
  assert.match(script, /function isPollutedFreshAccountPayload\(payload = {}\)/);
  assert.match(script, /replaceProgression: Boolean\(\s*message\.user\?\.account && !message\.save\?\.payload,\s*\)/);
  assert.match(script, /finishInitialAccountProgressLoad\(\);/);
  assert.match(
    script,
    /preferAccountLocal:\s*message\.preferAccountLocal !== false && message\.user\?\.account,/,
  );
  assert.match(
    script,
    /message\.user\?\.backendMode !== BACKEND_MODE_FIREBASE[\s\S]*!isFirebaseBackendMode\(\)[\s\S]*Boolean\(message\.user\?\.account\)/,
  );
  assert.match(firebaseOnline, /async function ensureFirebaseAccountDocs\(/);
  assert.match(firebaseOnline, /function stripUndefinedForFirestore\(value\)/);
  assert.match(
    firebaseOnline,
    /auth\.signInWithEmailAndPassword[\s\S]*auth\.createUserWithEmailAndPassword/,
  );
  assert.match(firebaseOnline, /isFirebaseCredentialUsername\(rawUsername\)/);
  assert.match(
    firebaseOnline,
    /if \(existingUsername\.exists\(\) && !allowLegacyAutoCreate\)/,
  );
  assert.match(firebaseOnline, /repair\.staleUsernameClaim = true;/);
  assert.match(
    firebaseOnline,
    /seedClientSave\s*\?\s*chooseBestSavePayload\(existingPayload, savePayload\)\s*:\s*chooseBestSavePayload\(existingPayload\)/s,
  );
  assert.match(firebaseOnline, /const safeBestPayload = stripUndefinedForFirestore\(bestPayload\);/);
  assert.match(firebaseOnline, /payload: safeBestPayload,/);
  assert.match(
    firebaseOnline,
    /const mergedPayload = stripUndefinedForFirestore\(\s*mergeFirebaseSavePayload\(existingPayload, payload\),\s*\);/,
  );
  assert.match(firebaseOnline, /stripUndefinedForFirestore\(\{\s*uid: state\.uid,/);
  assert.match(firebaseOnline, /stripUndefinedForFirestore\(\{\s*progress: mergedPayload\.progressionV2 \|\| \{\},/);
  assert.match(
    firebaseOnline,
    /seedClientSave: Boolean\(allowLegacyAutoCreate\)/,
  );
  assert.match(
    script,
    /const legacyLevelXp = hasCurrentSchema \? 0 : getLegacyLevelFloorXp\(source\);/,
  );
});

test("Firebase leaderboard hides and stops syncing test-like accounts", () => {
  const script = fs.readFileSync(
    new URL("../script.js", import.meta.url),
    "utf8",
  );
  const firebaseOnline = fs.readFileSync(
    new URL("../firebase-online.js", import.meta.url),
    "utf8",
  );
  const firebaseSmoke = fs.readFileSync(
    new URL("../smoke_firebase_live.mjs", import.meta.url),
    "utf8",
  );
  assert.match(script, /function isTestLikeAccountName\(value = ""\)/);
  assert.match(script, /TEST_ACCOUNT_NAME_BLOCKLIST/);
  assert.match(script, /function filterTestLikeLeaderboardRows\(rows = \[\]\)/);
  assert.match(script, /filterTestLikeLeaderboardRows\(message\.leaderboard\)/);
  assert.match(firebaseOnline, /function isFirebaseTestLikeAccountName\(value = ""\)/);
  assert.match(firebaseOnline, /hidden-test-account/);
  assert.match(firebaseOnline, /filter\(\(row\) => !isFirebaseTestLikeAccountName\(row\.username\)\)/);
  assert.doesNotMatch(firebaseSmoke, /const accountUsername = `Smoke/);
  assert.match(firebaseSmoke, /const accountUsername = `Runner/);
});

test("Firebase progress sync merges server and device economy state", () => {
  const firebaseOnline = fs.readFileSync(
    new URL("../firebase-online.js", import.meta.url),
    "utf8",
  );
  assert.match(firebaseOnline, /function mergeFirebaseSavePayload\(existingPayload = null, incomingPayload = null\)/);
  assert.match(firebaseOnline, /function mergeFirebaseProgression\(existing = {}, incoming = {}\)/);
  assert.match(firebaseOnline, /const existingProgress = await firestore\.getDoc\(progressRef\)/);
  assert.match(firebaseOnline, /payload: mergedPayload,/);
  assert.match(firebaseOnline, /function getPayloadUpdatedAt\(payload = \{\}\)/);
  assert.match(firebaseOnline, /const latestShell = chooseLatestSavePayload\(existingPayload, incomingPayload\)/);
  assert.match(firebaseOnline, /embers: Math\.max\(0, Math\.floor\(Number\(latestProgression\.embers\) \|\| 0\)\)/);
  assert.match(firebaseOnline, /ownedCosmetics: uniqueArrayValues\(/);
  assert.match(firebaseOnline, /claimedLevelRewards: uniqueArrayValues\(/);
  assert.match(firebaseOnline, /dailySparks: mergeFirebaseDailySparks\(existing\.dailySparks, incoming\.dailySparks\)/);
  assert.match(firebaseOnline, /customization: latestShell\.customization/);
  assert.match(firebaseOnline, /garage: latestShell\.garage/);
  assert.doesNotMatch(firebaseOnline, /fail\(error, "chat_listener_failed"\)/);
  assert.match(firebaseOnline, /emit\("save\.synced", \{ payload: mergedPayload \}\)/);
});

test("legacy import marker cannot hide downgraded Firebase progress", () => {
  const script = fs.readFileSync(
    new URL("../script.js", import.meta.url),
    "utf8",
  );
  assert.match(
    script,
    /const markerXp =\s*Number\(previousMarker\.importedXp \|\| previousMarker\.legacyXp\) \|\| 0;/,
  );
  assert.match(
    script,
    /const currentXp = getSavePayloadTotalXp\(buildPersistentSavePayload\(\)\);/,
  );
  assert.match(script, /if \(currentXp >= markerXp\) \{/);
  assert.match(
    script,
    /saveMeta: \{\s*updatedAtClient: savedAt,\s*updatedAtMs: Date\.now\(\),\s*\}/,
  );
  assert.match(
    script,
    /dailySparks: mergeDailySparksProgress\(existing\.dailySparks, next\.dailySparks\)/,
  );
});
