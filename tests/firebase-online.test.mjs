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
  repairSavePayloadWithProfileMarker,
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
    ["Clark", "JFine", "Billy"],
  );
  assert.deepEqual(getFirebaseBadges("Billy"), ["Advanced Player 2.0"]);
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
  const replaced = mergeFirebaseSavePayload(olderServer, newerDevice, {
    replaceProgression: true,
  });
  assert.equal(replaced.progressionV2.totalXp, 8500);
  assert.equal(replaced.progressionV2.xp, 8500);
  assert.equal(replaced.progressionV2.embers, 140);

  assert.equal(
    chooseLatestSavePayload(olderServer, {
      customization: { bodyId: "stale-no-date" },
      progressionV2: { totalXp: 1, xp: 1, embers: 1 },
    }).customization.bodyId,
    "street",
  );
  const newerServer = {
    saveMeta: {
      updatedAtMs: 5_000,
      customizationUpdatedAtMs: 5_000,
      garageUpdatedAtMs: 5_000,
    },
    customization: { bodyId: "monster", wheelId: "reactor" },
    garage: { activeLoadoutId: "loadout-b" },
    progressionV2: {
      totalXp: 1000,
      xp: 1000,
      embers: 200,
      ownedCosmetics: ["bodyId-monster"],
    },
  };
  const staleBrowser = {
    saveMeta: {
      updatedAtMs: 10_000,
      customizationUpdatedAtMs: 1_000,
      garageUpdatedAtMs: 1_000,
    },
    customization: { bodyId: "interceptor", wheelId: "grip" },
    garage: { activeLoadoutId: "loadout-a" },
    progressionV2: { totalXp: 1000, xp: 1000, embers: 250 },
  };
  const mergedStale = mergeFirebaseSavePayload(newerServer, staleBrowser);
  assert.equal(mergedStale.customization.bodyId, "monster");
  assert.equal(mergedStale.customization.wheelId, "reactor");
  assert.equal(mergedStale.garage.activeLoadoutId, "loadout-b");
  assert.equal(mergedStale.progressionV2.embers, 250);

  const unmarkedProfileOnlyContamination = repairSavePayloadWithProfileMarker(
    {
      saveMeta: { updatedAtMs: 7_000 },
      progressionV2: {
        totalXp: 100450,
        xp: 100450,
        embers: 976,
      },
    },
    {
      username: "Clark",
      progress: {
        totalXp: 100450,
        xp: 100450,
        embers: 976,
      },
    },
  );
  assert.equal(unmarkedProfileOnlyContamination.progressionV2.totalXp, 0);
  assert.equal(unmarkedProfileOnlyContamination.progressionV2.xp, 0);
  assert.equal(
    unmarkedProfileOnlyContamination.progressionV2.accountProgressRepair?.source,
    "special-badge-tainted-xp-blocked",
  );
  assert.equal(
    unmarkedProfileOnlyContamination.progressionV2.accountProgressRepair?.markerSource,
    "public-profile",
  );

  const hardEarnedButUnreviewedHighXp = repairSavePayloadWithProfileMarker(
    {
      saveMeta: { updatedAtMs: 8_000 },
      progressionV2: {
        totalXp: 100450,
        xp: 100450,
        embers: 976,
        personalBests: { race: { score: 12500 } },
      },
    },
    {
      username: "Clark",
      progress: {
        totalXp: 100450,
        xp: 100450,
        embers: 976,
      },
    },
  );
  assert.equal(hardEarnedButUnreviewedHighXp.progressionV2.totalXp, 0);
  assert.equal(
    hardEarnedButUnreviewedHighXp.progressionV2.accountProgressRepair?.source,
    "special-badge-tainted-xp-blocked",
  );

  const adminReviewedHighXp = repairSavePayloadWithProfileMarker(
    {
      saveMeta: { updatedAtMs: 8_500 },
      progressionV2: {
        totalXp: 100450,
        xp: 100450,
        embers: 976,
        personalBests: { race: { score: 12500 } },
        accountProgressReviewedSource: "admin-reviewed-real-account",
        accountProgressReviewedAt: "2026-05-31T00:00:00.000Z",
      },
    },
    {
      username: "Clark",
      progress: {
        totalXp: 100450,
        xp: 100450,
        embers: 976,
        accountProgressReviewedSource: "admin-reviewed-real-account",
      },
    },
  );
  assert.equal(adminReviewedHighXp.progressionV2.totalXp, 100450);
  assert.equal(adminReviewedHighXp.progressionV2.accountProgressRepair, undefined);

  const timestampOnlyReviewMarker = repairSavePayloadWithProfileMarker(
    {
      saveMeta: { updatedAtMs: 8_750 },
      progressionV2: {
        totalXp: 100450,
        xp: 100450,
        embers: 976,
        accountProgressReviewedAt: "2026-05-31T00:00:00.000Z",
      },
    },
    {
      username: "Clark",
      progress: {
        totalXp: 100450,
        xp: 100450,
        accountProgressReviewedAt: "2026-05-31T00:00:00.000Z",
      },
    },
  );
  assert.equal(timestampOnlyReviewMarker.progressionV2.totalXp, 0);
  assert.equal(
    timestampOnlyReviewMarker.progressionV2.accountProgressRepair?.source,
    "special-badge-tainted-xp-blocked",
  );

  const obsoleteCapWithoutMarker = repairSavePayloadWithProfileMarker(
    {
      saveMeta: { updatedAtMs: 8_900 },
      progressionV2: {
        totalXp: 22000,
        xp: 22000,
        embers: 875,
      },
    },
    {
      username: "Clark",
      progress: {
        totalXp: 22000,
        xp: 22000,
        embers: 875,
      },
    },
  );
  assert.equal(obsoleteCapWithoutMarker.progressionV2.totalXp, 0);
  assert.equal(obsoleteCapWithoutMarker.progressionV2.xp, 0);
  assert.equal(
    obsoleteCapWithoutMarker.progressionV2.accountProgressRepair?.source,
    "special-badge-tainted-xp-blocked",
  );
  assert.equal(
    obsoleteCapWithoutMarker.progressionV2.accountProgressRepair?.markerSource,
    "obsolete-badge-cap",
  );

  const contaminatedServer = {
    saveMeta: { updatedAtMs: 5_000 },
    worldIndex: 9,
    levelIndex: 9,
    progressionV2: {
      totalXp: 100450,
      xp: 100450,
      embers: 976,
      specialBadgeProgressSource: "special-badge-xp-repair",
      specialBadgeProgressRepairedAt: "2026-05-29T14:27:34.733Z",
      specialBadgeProgressBaselineXp: 22000,
    },
  };
  const markerStrippedDevice = {
    saveMeta: { updatedAtMs: 6_000 },
    worldIndex: 2,
    levelIndex: 3,
    progressionV2: {
      totalXp: 23175,
      xp: 23175,
      embers: 976,
    },
  };
  const mergedRepair = mergeFirebaseSavePayload(contaminatedServer, markerStrippedDevice);
  assert.equal(mergedRepair.progressionV2.totalXp, 23175);
  assert.equal(mergedRepair.progressionV2.xp, 23175);
  assert.equal(mergedRepair.worldIndex, 2);
  assert.equal(mergedRepair.levelIndex, 3);
  assert.equal(mergedRepair.progressionV2.specialBadgeProgressSource, undefined);
  assert.equal(mergedRepair.progressionV2.specialBadgeProgressBaselineXp, undefined);
  assert.notEqual(
    mergedRepair.progressionV2.accountProgressRepair?.source,
    "special-badge-contamination-v1",
  );

  const onlyContaminated = mergeFirebaseSavePayload(contaminatedServer, {
    saveMeta: { updatedAtMs: 6_000 },
    progressionV2: {
      totalXp: 100450,
      xp: 100450,
      specialBadgeProgressSource: "special-badge-xp-repair",
      specialBadgeProgressBaselineXp: 22000,
    },
  });
  assert.equal(onlyContaminated.progressionV2.totalXp, 0);
  assert.equal(onlyContaminated.progressionV2.xp, 0);

  const blockedCloudWithCleanLocal = mergeFirebaseSavePayload(
    {
      saveMeta: { updatedAtMs: 5_000 },
      progressionV2: {
        totalXp: 0,
        xp: 0,
        accountProgressRepair: {
          source: "special-badge-tainted-xp-blocked",
          blockedTotalXp: 100450,
        },
      },
    },
    markerStrippedDevice,
  );
  assert.equal(blockedCloudWithCleanLocal.progressionV2.totalXp, 23175);
  assert.equal(blockedCloudWithCleanLocal.progressionV2.xp, 23175);
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
    sanitizeFirebaseText("tell me your d i s c o r d").error,
    "text_rejected",
  );
  assert.equal(
    sanitizeFirebaseText("you are so dummm").error,
    "text_rejected",
  );
  assert.equal(
    sanitizeFirebaseText("x".repeat(FIREBASE_CHAT_LIMIT + 20)).text.length,
    FIREBASE_CHAT_LIMIT,
  );
  assert.equal(validateFirebaseFeedback("Useful bug report").ok, true);
  const longFeedback = `start\n${"x".repeat(7000)}\nend`;
  const feedbackResult = validateFirebaseFeedback(longFeedback);
  assert.equal(feedbackResult.ok, true);
  assert.equal(feedbackResult.text, longFeedback);
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
    mapFirebaseError({ code: "auth/too-many-requests" }),
    "firebase_rate_limited",
  );
  assert.equal(
    mapFirebaseError({ message: "HTTP 429 quota exceeded" }),
    "firebase_rate_limited",
  );
  assert.equal(
    mapFirebaseError({ code: "resource-exhausted" }),
    "firebase_rate_limited",
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
    /else \{\s*setOfflineGuestFallbackStatus\(errorCode\);\s*\}/,
  );
  assert.doesNotMatch(
    script,
    new RegExp("Online services are unavailable" + " on this network"),
  );
  assert.match(script, /firebase_rate_limited/);
  assert.match(script, /resource\[-_ \]\?exhausted\|quota\|429\|rate/);
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
  assert.ok(manifest.accounts.clark.payload.progressionV2.medals);
  assert.equal(manifest.accounts.billy.username, "Billy");
  assert.equal(manifest.accounts.billy.payload.progressionV2.medals, undefined);
  assert.equal(manifest.accounts["tosh the sigma"].username, "Tosh the Sigma");
  assert.deepEqual(
    manifest.accounts["tosh the sigma"].payload.progressionV2.medals,
    {},
  );
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
    /safeMessage\.user\?\.backendMode !== BACKEND_MODE_FIREBASE[\s\S]*!isFirebaseBackendMode\(\)[\s\S]*Boolean\(safeMessage\.user\?\.account\)/,
  );
  assert.match(script, /function sanitizeOnlineProfileSnapshotMessage\(message = {}\)/);
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
  assert.match(firebaseOnline, /function chooseTrustedAccountSeedPayload/);
  assert.match(firebaseOnline, /function getProfileProgressRepairHint/);
  assert.match(firebaseOnline, /progressRepairHint: getProfileProgressRepairHint\(profile\)/);
  assert.match(firebaseOnline, /function repairSavePayloadWithProfileMarker/);
  assert.match(firebaseOnline, /const progressHasMarker = hasObsoleteSpecialBadgeRepairMarker\(progression\);/);
  assert.match(firebaseOnline, /repairSavePayloadWithProfileMarker\(\s*existingPayload,\s*existingProfile,\s*\)/);
  assert.match(firebaseOnline, /repairSavePayloadWithProfileMarker\(\s*payload,\s*internals\.userProfile \|\| \{\},\s*\)/);
  assert.match(
    firebaseOnline,
    /seedClientSave\s*\|\|\s*shouldUseClientRepair[\s\S]{0,120}\?\s*chooseTrustedAccountSeedPayload\(cleanExistingPayload, cleanSavePayload\)[\s\S]{0,120}:\s*chooseTrustedAccountSeedPayload\(cleanExistingPayload\)/s,
  );
  assert.match(firebaseOnline, /function hasTrustedRepairProgress/);
  assert.doesNotMatch(
    firebaseOnline,
    /seedClientSave\s*\?\s*chooseBestSavePayload\(existingPayload, savePayload\)\s*:\s*chooseBestSavePayload\(existingPayload\)/s,
  );
  assert.match(firebaseOnline, /const safeBestPayload = stripUndefinedForFirestore\(bestPayload\);/);
  assert.match(firebaseOnline, /payload: safeBestPayload,/);
  assert.match(
    firebaseOnline,
    /replace\s*&&\s*!isBlockedTaintedRepairPayload\(cleanPayload\)[\s\S]{0,120}\?\s*cleanPayload[\s\S]{0,120}:\s*mergeFirebaseSavePayload\(cleanExistingPayload, cleanPayload\)/,
  );
  assert.match(firebaseOnline, /function isBlockedTaintedRepairPayload/);
  assert.match(firebaseOnline, /state\.leaderboardStatus = "repair-needed"/);
  assert.match(firebaseOnline, /function writeProgressPayload\(payload, \{ silent = false \} = \{\}\)/);
  assert.match(firebaseOnline, /emit\("save\.repair-needed", \{ payload: cleanPayload \}\)/);
  assert.match(firebaseOnline, /return cleanPayload;/);
  assert.doesNotMatch(firebaseOnline, /return writeProgressPayload\(cleanPayload, \{ silent \}\);/);
  assert.match(firebaseOnline, /stripUndefinedForFirestore\(\{\s*uid: state\.uid,/);
  assert.match(firebaseOnline, /stripUndefinedForFirestore\(\{\s*progress: safePayload\.progressionV2 \|\| \{\},/);
  assert.match(
    firebaseOnline,
    /seedClientSave: Boolean\(allowLegacyAutoCreate\)/,
  );
  assert.match(firebaseOnline, /function chooseTrustedAccountSeedPayload/);
  assert.doesNotMatch(
    firebaseOnline,
    /const bestPayload = seedClientSave[\s\S]{0,140}chooseBestSavePayload\(existingPayload, savePayload\)/,
  );
  assert.match(
    script,
    /const legacyLevelXp = hasCurrentSchema \? 0 : getLegacyLevelFloorXp\(source\);/,
  );
  assert.match(script, /const SPECIAL_BADGE_ACCOUNT_KEYS = new Set/);
  assert.doesNotMatch(script, /const SPECIAL_BADGE_PROGRESS_POLICIES = new Map/);
  assert.match(script, /function hasHardEarnedProgressEvidence\(payload = \{\}\)/);
  assert.match(script, /function stripUnearnedSpecialProgressPayload/);
  assert.match(script, /cleanUnearnedSpecialProgress: Boolean\(message\.user\?\.account\)/);
  assert.match(script, /replaceNextProgressSync = true/);
  assert.match(script, /function sanitizeSpecialBadgeLeaderboardRow\(row = \{\}\)/);
  assert.match(script, /special-badge-leaderboard-quarantined/);
  assert.doesNotMatch(script, /repairNote: "special-badge-xp-cap"/);
  assert.match(script, /function sanitizeSpecialBadgeProgression\(/);
  assert.doesNotMatch(script, /source:\s*"special-badge-contamination-v1"/);
  assert.match(script, /special-badge-tainted-xp-blocked/);
  assert.match(script, /unmarked-cache/);
  assert.match(script, /function hasReviewedAccountProgress/);
  assert.match(script, /ACCOUNT_PROGRESS_REVIEW_SOURCE/);
  assert.doesNotMatch(script, /special-badge-contamination-quarantine-v2/);
  assert.doesNotMatch(script, /repairXp:\s*22000/i);
  assert.doesNotMatch(script, /maxEmbers:\s*875/i);
  assert.doesNotMatch(script, /preservedLocalTotalXp/);
  assert.doesNotMatch(script, /getCleanAccountLocalProgressionXp/);
  assert.doesNotMatch(script, /\["billy",\s*\{\s*repairXp:/i);
  assert.doesNotMatch(script, /\["jfine",\s*\{\s*repairXp:/i);
  assert.match(script, /function hasEarnedSpecialProgressAfterRepair\(/);
  assert.doesNotMatch(script, /specialBadgeProgressEarnedAfterRepair = true/);
  assert.match(script, /function removeSpecialBadgeRepairMarkers\(/);
  assert.doesNotMatch(script, /function recoverAccountProgressFromLeaderboard\(/);
  assert.doesNotMatch(script, /leaderboard-xp-recovery/);
  assert.match(script, /Blocked a contaminated account progress value\. Admin review is required before any cloud XP repair is written\./);
  assert.match(script, /message\.type === "save\.repair-needed"/);
  assert.doesNotMatch(script, /blocked-tainted-progress-repair/);
  assert.doesNotMatch(script, /setTimeout\(\(\) => forceOnlineProgressSync\(\{ force: true \}\), 0\)/);
  assert.match(script, /accountSaveDirty: false/);
  assert.match(script, /function markAccountSaveDirty\(reason = "local-change"\)/);
  assert.match(script, /markAccountSaveDirty\("garage-equip"\)/);
  assert.match(script, /!onlineState\.accountSaveDirty[\s\S]*!onlineState\.replaceNextProgressSync[\s\S]*!onlineState\.freshAccountSaveSyncPending/);
  assert.match(script, /function updateModeDecorFx\(dt\)/);
  assert.match(script, /onlineRoomCode\?\.addEventListener\("keydown"/);
  assert.match(script, /joinRoomPending: false/);
  const joinLobbySource = firebaseOnline.slice(
    firebaseOnline.indexOf("async function joinLobby"),
    firebaseOnline.indexOf("async function leaveLobby"),
  );
  assert.match(firebaseOnline, /async function joinLobby\(code\)[\s\S]*firestore\.getDoc\(ref\)[\s\S]*firestore\.updateDoc\(ref,/);
  assert.doesNotMatch(joinLobbySource, /runTransaction/);
  assert.match(script, /const CODEX_LEADERBOARD_BASELINE_XP = 22153;/);
  assert.match(script, /codexLeaderboardXp = CODEX_LEADERBOARD_BASELINE_XP;/);
  assert.match(firebaseOnline, /syncProgress\(payload, \{ silent = false, replace = false \} = \{\}\)/);
  assert.match(firebaseOnline, /replace\s*&&\s*!isBlockedTaintedRepairPayload\(cleanPayload\)/);
  assert.doesNotMatch(firebaseOnline, /replace\s*\?\s*payload\s*:\s*mergeFirebaseSavePayload/);
  assert.match(firebaseOnline, /await firestore\.getDoc\(ref\)\.catch\(\(\) => null\)/);
  assert.match(script, /room_left_ignored/);
  assert.match(script, /onlineState\.firebaseLiveStatus = "idle"/);
  const rules = fs.readFileSync(
    new URL("../firestore.rules", import.meta.url),
    "utf8",
  );
  assert.match(rules, /'serverUpdatedAt'/);
  assert.match(rules, /'updatedAt'/);
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
  assert.match(script, /function sanitizeOnlineLeaderboardRows\(rows = \[\]\)/);
  assert.match(script, /sanitizeOnlineLeaderboardRows\(message\.leaderboard\)/);
  assert.match(script, /sanitizeOnlineLeaderboardRow\(\s*message\.playerRow,\s*\)/);
  assert.match(firebaseOnline, /function isFirebaseTestLikeAccountName\(value = ""\)/);
  assert.match(firebaseOnline, /hidden-test-account/);
  assert.match(firebaseOnline, /filter\(\(row\) => !isFirebaseTestLikeAccountName\(row\.username\)\)/);
  assert.match(firebaseOnline, /\(test\|teest\|smoke\|fresh\|runner\|pilot\)/);
  assert.match(script, /\(test\|teest\|smoke\|fresh\|runner\|pilot\)/);
  assert.match(firebaseSmoke, /const accountUsername = `Smoke/);
  assert.doesNotMatch(firebaseSmoke, /const accountUsername = `Pilot/);
});

test("Firebase cleanup supports targeted owner-auth reviewed repair", () => {
  const cleanupScript = fs.readFileSync(
    new URL("../scripts/cleanup-firebase-public-data.mjs", import.meta.url),
    "utf8",
  );
  assert.match(cleanupScript, /--owner-auth/);
  assert.match(cleanupScript, /signInWithPassword/);
  assert.match(cleanupScript, /Owner auth UID mismatch/);
  assert.match(cleanupScript, /skipped_for_targeted_reviewed_account/);
  assert.match(cleanupScript, /FIREBASE_REPAIR_OWNER_PASSWORD/);
  const auditScript = fs.readFileSync(
    new URL("../scripts/audit-firebase-public-data.mjs", import.meta.url),
    "utf8",
  );
  assert.match(auditScript, /function gameplayEvidenceSummary\(row = \{\}\)/);
  assert.match(auditScript, /Evidence only, not an automatic repair value/);
  assert.match(auditScript, /function reviewedRepairCommand/);
  assert.match(auditScript, /--xp <KNOWN_GOOD_XP>/);
});

test("Firebase progress sync merges server and device economy state", () => {
  const firebaseOnline = fs.readFileSync(
    new URL("../firebase-online.js", import.meta.url),
    "utf8",
  );
  assert.match(firebaseOnline, /export function mergeFirebaseSavePayload\(/);
  assert.match(firebaseOnline, /function mergeFirebaseProgression\(existing = {}, incoming = {}\)/);
  assert.match(firebaseOnline, /const existingProgress = await firestore\.getDoc\(progressRef\)/);
  assert.match(firebaseOnline, /return writeProgressPayload\(mergedPayload, \{ silent \}\);/);
  assert.match(firebaseOnline, /function getPayloadUpdatedAt\(payload = \{\}\)/);
  assert.match(firebaseOnline, /const latestShell = chooseLatestSavePayload\(existingPayload, incomingPayload\)/);
  assert.match(firebaseOnline, /embers: Math\.max\(0, Math\.floor\(Number\(latestProgression\.embers\) \|\| 0\)\)/);
  assert.match(firebaseOnline, /ownedCosmetics: uniqueArrayValues\(/);
  assert.match(firebaseOnline, /claimedLevelRewards: uniqueArrayValues\(/);
  assert.match(firebaseOnline, /dailySparks: mergeFirebaseDailySparks\(existing\.dailySparks, incoming\.dailySparks\)/);
  assert.match(firebaseOnline, /function getPayloadFieldUpdatedAt\(payload = \{\}, fieldName = ""\)/);
  assert.match(firebaseOnline, /chooseLatestSavePayloadField\(existingPayload, incomingPayload, "customization"\)/);
  assert.match(firebaseOnline, /chooseLatestSavePayloadField\(existingPayload, incomingPayload, "garage"\)/);
  assert.doesNotMatch(firebaseOnline, /customization: latestShell\.customization/);
  assert.doesNotMatch(firebaseOnline, /garage: latestShell\.garage/);
  assert.doesNotMatch(firebaseOnline, /fail\(error, "chat_listener_failed"\)/);
  assert.match(firebaseOnline, /if \(!silent\) emit\("save\.synced", \{ payload: safePayload \}\)/);
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
    /saveMeta: \{\s*updatedAtClient: savedAt,\s*updatedAtMs: savedAtMs,[\s\S]*customizationUpdatedAtMs:/,
  );
  assert.match(
    script,
    /dailySparks: mergeDailySparksProgress\(existing\.dailySparks, next\.dailySparks\)/,
  );
});
