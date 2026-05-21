import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  FIREBASE_CHAT_LIMIT,
  FIREBASE_FEEDBACK_LIMIT,
  FIREBASE_LEADERBOARD_MODE,
  createFirebaseLobbyCode,
  getFirebaseBadges,
  mapFirebaseError,
  normalizeFirebaseLobbyCode,
  normalizeFirebaseUsernameKey,
  sanitizeFirebaseText,
  validateFirebaseLobbyCode,
  usernameToFirebaseEmail,
  validateFirebaseFeedback,
  validateFirebaseScore,
  validateFirebaseUsername,
} from "../firebase-online-core.js";

test("Firebase username validation enforces launch-safe names", () => {
  assert.equal(validateFirebaseUsername("Clark").ok, true);
  assert.deepEqual(getFirebaseBadges("Clark"), ["Founder"]);
  assert.equal(getFirebaseBadges("clark").length, 0);
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
    usernameToFirebaseEmail("Drift-King_4"),
    "id4.drift-king_4@infernodrift4.firebaseapp.com",
  );
  assert.equal(
    usernameToFirebaseEmail("Tosh the Sigma"),
    "id4.tosh.the.sigma@infernodrift4.firebaseapp.com",
  );
});

test("Firebase chat and feedback filters block unsafe text", () => {
  assert.equal(
    sanitizeFirebaseText("<b>nice shit drift</b>").text,
    "nice boost drift",
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
    "go hurt yourself",
    "n u d e s",
  ];
  for (const message of abusiveMessages) {
    assert.equal(sanitizeFirebaseText(message).ok, false, message);
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
  const serialized = JSON.stringify(manifest).toLowerCase();
  assert.doesNotMatch(serialized, /passwordhash|passwordsalt|sessiontoken/);
  assert.doesNotMatch(serialized, /olduserid|user_id/);
});

test("Firebase account attach prefers legacy XP over lower local save", () => {
  const script = fs.readFileSync(
    new URL("../script.js", import.meta.url),
    "utf8",
  );
  assert.match(
    script,
    /const signInSavePayload = chooseBestSavePayload\(\s*currentPayload,\s*bundledLegacyEntry\?\.payload \|\| null,\s*\);/s,
  );
  assert.match(script, /savePayload: signInSavePayload,/);
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
});
