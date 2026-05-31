import { spawnSync } from "node:child_process";

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "infernodrift4-online";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const PAGE_SIZE = 100;
const MAX_FETCH_ATTEMPTS = 4;
const EXECUTE = process.argv.includes("--execute");
const SUMMARY_ONLY = process.argv.includes("--summary");
const CONFIRM_VALUE = "delete-public-test-data";
const REPAIR_CONFIRM_VALUE = "repair-reviewed-real-account";
const ACCOUNT_PROGRESS_REVIEW_SOURCE = "admin-reviewed-real-account";
const SPECIAL_BADGE_SUSPECT_XP = 90_000;
const REPAIR_REVIEWED_ACCOUNT = process.argv.includes("--repair-reviewed-account");
const VERIFY_REVIEWED_ACCOUNT = process.argv.includes("--verify-reviewed-account");

const TEST_NAME_PATTERN =
  /^(test|teest|smoke|fresh|runner|pilot|test-removed)[a-z0-9_-]*/i;
const SPECIAL_BADGE_NAMES = new Set([
  "clark",
  "billy",
  "jfine",
  "moderator",
  "joshua",
  "tosh_the_sigma",
  "tosh the sigma",
]);
const KNOWN_TEST_NAMES = new Set([
  "ajhdfiumhziwuehrmz",
  "akfjicoajsodifjmoi",
  "sajoumzjeimxuhen",
]);

function readFirestoreValue(value) {
  if (!value) return undefined;
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("timestampValue" in value) return value.timestampValue;
  if ("arrayValue" in value) {
    return (value.arrayValue.values || []).map(readFirestoreValue);
  }
  if ("mapValue" in value) {
    return Object.fromEntries(
      Object.entries(value.mapValue.fields || {}).map(([key, child]) => [
        key,
        readFirestoreValue(child),
      ]),
    );
  }
  return undefined;
}

function firestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(firestoreValue) } };
  }
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    return Number.isInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: value };
  }
  if (typeof value === "object") {
    return {
      mapValue: {
        fields: Object.fromEntries(
          Object.entries(value)
            .filter(([, child]) => child !== undefined)
            .map(([key, child]) => [key, firestoreValue(child)]),
        ),
      },
    };
  }
  return { stringValue: String(value) };
}

function firestoreFields(object = {}) {
  return Object.fromEntries(
    Object.entries(object)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, firestoreValue(value)]),
  );
}

function readFirestoreDocument(document) {
  return {
    id: String(document.name || "").split("/").pop(),
    ...Object.fromEntries(
      Object.entries(document.fields || {}).map(([key, value]) => [
        key,
        readFirestoreValue(value),
      ]),
    ),
  };
}

async function listDocuments(path) {
  const documents = [];
  let pageToken = "";
  do {
    const url = new URL(`${BASE_URL}/${path}`);
    url.searchParams.set("pageSize", String(PAGE_SIZE));
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const response = await fetchWithRetry(url);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        `${path} ${response.status}: ${JSON.stringify(payload).slice(0, 400)}`,
      );
    }
    documents.push(...(payload.documents || []).map(readFirestoreDocument));
    pageToken = payload.nextPageToken || "";
  } while (pageToken);
  return documents;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options = {}) {
  let lastResponse = null;
  for (let attempt = 1; attempt <= MAX_FETCH_ATTEMPTS; attempt += 1) {
    lastResponse = await fetch(url, options);
    if (lastResponse.status !== 429 && lastResponse.status < 500) {
      return lastResponse;
    }
    if (attempt < MAX_FETCH_ATTEMPTS) {
      const retryAfter = Number(lastResponse.headers.get("retry-after")) || 0;
      const delayMs = retryAfter
        ? retryAfter * 1000
        : 500 * Math.pow(2, attempt - 1);
      await wait(delayMs);
    }
  }
  return lastResponse;
}

async function fetchFirestoreDocument(path, token) {
  const response = await fetchWithRetry(`${BASE_URL}/${path}`, {
    headers: { authorization: `Bearer ${token}` },
  });
  const payload = await response.json().catch(() => ({}));
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(
      `${path} ${response.status}: ${JSON.stringify(payload).slice(0, 400)}`,
    );
  }
  return readFirestoreDocument(payload);
}

async function patchFirestoreDocument(path, fields, token) {
  const url = new URL(`${BASE_URL}/${path}`);
  Object.keys(fields).forEach((fieldPath) =>
    url.searchParams.append("updateMask.fieldPaths", fieldPath),
  );
  const response = await fetchWithRetry(url, {
    method: "PATCH",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ fields: firestoreFields(fields) }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      `${path} ${response.status}: ${JSON.stringify(payload).slice(0, 600)}`,
    );
  }
  return readFirestoreDocument(payload);
}

function normalizedName(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function usernameClaimKey(value = "") {
  return normalizedName(value).replace(/\s+/g, "_");
}

function isTestLikeName(value = "") {
  const compact = normalizedName(value).replace(/[^a-z0-9_-]/g, "");
  return TEST_NAME_PATTERN.test(compact) || KNOWN_TEST_NAMES.has(compact);
}

function compactName(value = "") {
  return normalizedName(value).replace(/[^a-z0-9]/g, "");
}

function isSpecialBadgeName(value = "") {
  const normalized = normalizedName(value);
  const compact = compactName(value);
  return (
    SPECIAL_BADGE_NAMES.has(normalized) ||
    SPECIAL_BADGE_NAMES.has(normalized.replace(/\s+/g, "_")) ||
    Array.from(SPECIAL_BADGE_NAMES).some((name) => compactName(name) === compact)
  );
}

function getXp(row = {}) {
  return Math.max(
    0,
    Math.floor(
      Number(row.score ?? row.xp ?? row.totalXp ?? row.progress?.totalXp ?? row.progress?.xp) ||
        0,
    ),
  );
}

function argValue(name) {
  const prefix = `${name}=`;
  const inline = process.argv.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : "";
}

function xpRequiredForLevel(level = 1) {
  const safeLevel = Math.max(1, Math.floor(Number(level) || 1));
  return Math.round(400 + safeLevel * 150 + Math.pow(safeLevel, 1.55) * 120);
}

function getXPForLevel(level = 1) {
  const targetLevel = Math.max(1, Math.floor(Number(level) || 1));
  let total = 0;
  for (let current = 1; current < targetLevel; current += 1) {
    total += xpRequiredForLevel(current);
  }
  return total;
}

function getLevelFromXP(totalXp = 0) {
  const xp = Math.max(0, Math.floor(Number(totalXp) || 0));
  let level = 1;
  while (level < 99 && xp >= getXPForLevel(level + 1)) level += 1;
  return level;
}

function getReviewedRepairRequest() {
  if (!REPAIR_REVIEWED_ACCOUNT && !VERIFY_REVIEWED_ACCOUNT) return null;
  const uid = argValue("--uid").trim();
  const username = argValue("--username").trim();
  const xp = Math.floor(Number(argValue("--xp")));
  const embersRaw = argValue("--embers");
  const embers = embersRaw === "" ? null : Math.floor(Number(embersRaw));
  if (!uid || !username || !Number.isFinite(xp) || xp < 0) {
    throw new Error(
      "--repair-reviewed-account requires --uid <uid> --username <username> --xp <non-negative number>",
    );
  }
  if (embersRaw !== "" && (!Number.isFinite(embers) || embers < 0)) {
    throw new Error("--embers must be a non-negative number when provided");
  }
  return { uid, username, xp, embers };
}

function hasObsoleteRepairMarker(progression = {}) {
  return Boolean(
    progression?.specialBadgeRepairVersion ||
      progression?.specialBadgeProgressRepairedAt ||
      Number.isFinite(Number(progression?.specialBadgeProgressBaselineXp)) ||
      progression?.specialBadgeProgressEarnedAfterRepair === true ||
      progression?.specialBadgeProgressSource ||
      progression?.accountProgressRepair,
  );
}

function repairMarkerSnapshot(progression = {}) {
  if (!hasObsoleteRepairMarker(progression)) return null;
  return {
    specialBadgeRepairVersion: progression?.specialBadgeRepairVersion,
    specialBadgeProgressSource: progression?.specialBadgeProgressSource,
    specialBadgeProgressBaselineXp: progression?.specialBadgeProgressBaselineXp,
    accountProgressRepair: progression?.accountProgressRepair,
  };
}

function isSuspiciousSpecialBadgeAccount(row = {}) {
  const username = row.username || row.displayName || "";
  return isSpecialBadgeName(username) && getXp(row) >= SPECIAL_BADGE_SUSPECT_XP;
}

function makeCleanupPlan({ scores = [], users = [] } = {}) {
  const deletePaths = [];
  const reviewPaths = [];

  scores.forEach((row) => {
    if (isTestLikeName(row.username) || isSuspiciousSpecialBadgeAccount(row)) {
      deletePaths.push({
        path: `leaderboards/all-modes/scores/${row.id}`,
        username: row.username || "",
        xp: getXp(row),
        reason: isSuspiciousSpecialBadgeAccount(row)
          ? "delete contaminated leaderboard score; real account can re-sync"
          : "delete test-like leaderboard score",
      });
    }
  });

  users.forEach((row) => {
    if (isTestLikeName(row.username || row.displayName)) {
      const username = row.username || row.displayName || "";
      deletePaths.push({
        path: `users/${row.id}`,
        username,
        xp: getXp(row),
        reason: "delete test-like public user profile",
      });
      deletePaths.push({
        path: `progress/${row.id}`,
        username,
        xp: getXp(row),
        reason: "delete test-like private progress document",
      });
      if (usernameClaimKey(username)) {
        deletePaths.push({
          path: `usernames/${usernameClaimKey(username)}`,
          username,
          xp: 0,
          reason: "delete test-like username claim",
        });
      }
      return;
    }
    if (isSuspiciousSpecialBadgeAccount(row)) {
      reviewPaths.push({
        path: `users/${row.id}`,
        username: row.username || row.displayName || "",
        xp: getXp(row),
        reason:
          "real account public profile is contaminated; do not delete automatically",
      });
      reviewPaths.push({
        path: `progress/${row.id}`,
        username: row.username || row.displayName || "",
        xp: getXp(row),
        reason:
          "private account progress may also be contaminated; admin-only review required",
      });
    }
  });

  return { deletePaths, reviewPaths };
}

function runFirebaseDelete(path) {
  const result = spawnSync(
    "npx",
    [
      "firebase-tools",
      "firestore:delete",
      path,
      "--project",
      PROJECT_ID,
      "--yes",
      "--force",
    ],
    { encoding: "utf8", stdio: "pipe" },
  );
  return {
    path,
    ok: result.status === 0,
    status: result.status,
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim(),
  };
}

async function repairReviewedAccountProgress(request, token) {
  const now = new Date().toISOString();
  const progressDoc = await fetchFirestoreDocument(
    `progress/${request.uid}`,
    token,
  );
  const existingPayload = progressDoc?.payload || {};
  const existingProgression = existingPayload.progressionV2 || {};
  const embers =
    request.embers === null
      ? Math.max(0, Math.floor(Number(existingProgression.embers) || 0))
      : request.embers;
  const progressionV2 = {
    ...existingProgression,
    schemaVersion: 3,
    xp: request.xp,
    totalXp: request.xp,
    level: getLevelFromXP(request.xp),
    embers,
    updatedAtClient: now,
    accountProgressReviewedAt: now,
    accountProgressReviewedSource: ACCOUNT_PROGRESS_REVIEW_SOURCE,
  };
  delete progressionV2.specialBadgeRepairVersion;
  delete progressionV2.specialBadgeProgressRepairedAt;
  delete progressionV2.specialBadgeProgressBaselineXp;
  delete progressionV2.specialBadgeProgressEarnedAfterRepair;
  delete progressionV2.specialBadgeProgressSource;
  delete progressionV2.accountProgressRepair;

  const payload = {
    ...existingPayload,
    saveMeta: {
      ...(existingPayload.saveMeta || {}),
      updatedAtClient: now,
      updatedAtMs: Date.now(),
      repairedBy: "cleanup-firebase-public-data",
    },
    progressionV2,
  };
  const userFields = {
    progress: progressionV2,
    stats: progressionV2,
    lastAdminRepairAt: now,
  };
  const progressFields = {
    uid: request.uid,
    username: request.username,
    payload,
    stats: progressionV2,
    updatedAtClient: now,
    adminRepair: {
      source: "reviewed-real-account-repair",
      username: request.username,
      xp: request.xp,
      embers,
      at: now,
    },
  };
  const leaderboardFields = {
    uid: request.uid,
    userId: request.uid,
    username: request.username,
    mode: "all-modes",
    score: request.xp,
    xp: request.xp,
    totalXp: request.xp,
    rating: request.xp,
    updatedAtClient: now,
    adminRepair: "reviewed-real-account-repair",
  };
  return {
    request,
    progress: await patchFirestoreDocument(
      `progress/${request.uid}`,
      progressFields,
      token,
    ),
    user: await patchFirestoreDocument(`users/${request.uid}`, userFields, token),
    leaderboard: await patchFirestoreDocument(
      `leaderboards/all-modes/scores/${request.uid}`,
      leaderboardFields,
      token,
    ),
  };
}

function getDocumentXp(document = {}) {
  return getXp(document?.payload?.progressionV2 || document?.progress || document);
}

function getProgressionXp(progression = {}) {
  return getXp(progression);
}

function getDocumentEmbers(document = {}) {
  const raw =
    document?.payload?.progressionV2?.embers ??
    document?.progress?.embers ??
    document?.stats?.embers;
  return Math.max(0, Math.floor(Number(raw) || 0));
}

async function verifyReviewedAccountProgress(request, token) {
  const [progress, user, leaderboard] = await Promise.all([
    fetchFirestoreDocument(`progress/${request.uid}`, token),
    fetchFirestoreDocument(`users/${request.uid}`, token),
    fetchFirestoreDocument(`leaderboards/all-modes/scores/${request.uid}`, token),
  ]);
  const progressPayloadProgression = progress?.payload?.progressionV2 || {};
  const progressStats = progress?.stats || {};
  const userProgress = user?.progress || {};
  const userStats = user?.stats || {};
  const expectedName = normalizedName(request.username);
  const userName = user?.username || user?.displayName || "";
  const leaderboardName = leaderboard?.username || leaderboard?.displayName || "";
  const checks = [
    {
      name: "progress exists",
      ok: Boolean(progress),
      actual: Boolean(progress),
      expected: true,
    },
    {
      name: "user exists",
      ok: Boolean(user),
      actual: Boolean(user),
      expected: true,
    },
    {
      name: "leaderboard exists",
      ok: Boolean(leaderboard),
      actual: Boolean(leaderboard),
      expected: true,
    },
    {
      name: "progress payload xp",
      ok: getProgressionXp(progressPayloadProgression) === request.xp,
      actual: getProgressionXp(progressPayloadProgression),
      expected: request.xp,
    },
    {
      name: "progress stats xp",
      ok: getProgressionXp(progressStats) === request.xp,
      actual: getProgressionXp(progressStats),
      expected: request.xp,
    },
    {
      name: "user progress xp",
      ok: getProgressionXp(userProgress) === request.xp,
      actual: getProgressionXp(userProgress),
      expected: request.xp,
    },
    {
      name: "user stats xp",
      ok: getProgressionXp(userStats) === request.xp,
      actual: getProgressionXp(userStats),
      expected: request.xp,
    },
    {
      name: "leaderboard xp",
      ok: getXp(leaderboard) === request.xp,
      actual: getXp(leaderboard),
      expected: request.xp,
    },
    {
      name: "progress payload repair markers absent",
      ok: !hasObsoleteRepairMarker(progressPayloadProgression),
      actual: repairMarkerSnapshot(progressPayloadProgression),
      expected: null,
    },
    {
      name: "progress stats repair markers absent",
      ok: !hasObsoleteRepairMarker(progressStats),
      actual: repairMarkerSnapshot(progressStats),
      expected: null,
    },
    {
      name: "user progress repair markers absent",
      ok: !hasObsoleteRepairMarker(userProgress),
      actual: repairMarkerSnapshot(userProgress),
      expected: null,
    },
    {
      name: "user stats repair markers absent",
      ok: !hasObsoleteRepairMarker(userStats),
      actual: repairMarkerSnapshot(userStats),
      expected: null,
    },
    {
      name: "progress payload reviewed marker present",
      ok:
        progressPayloadProgression?.accountProgressReviewedSource ===
        ACCOUNT_PROGRESS_REVIEW_SOURCE,
      actual: progressPayloadProgression?.accountProgressReviewedSource || null,
      expected: ACCOUNT_PROGRESS_REVIEW_SOURCE,
    },
    {
      name: "progress stats reviewed marker present",
      ok:
        progressStats?.accountProgressReviewedSource ===
        ACCOUNT_PROGRESS_REVIEW_SOURCE,
      actual: progressStats?.accountProgressReviewedSource || null,
      expected: ACCOUNT_PROGRESS_REVIEW_SOURCE,
    },
    {
      name: "user progress reviewed marker present",
      ok:
        userProgress?.accountProgressReviewedSource ===
        ACCOUNT_PROGRESS_REVIEW_SOURCE,
      actual: userProgress?.accountProgressReviewedSource || null,
      expected: ACCOUNT_PROGRESS_REVIEW_SOURCE,
    },
    {
      name: "user stats reviewed marker present",
      ok:
        userStats?.accountProgressReviewedSource ===
        ACCOUNT_PROGRESS_REVIEW_SOURCE,
      actual: userStats?.accountProgressReviewedSource || null,
      expected: ACCOUNT_PROGRESS_REVIEW_SOURCE,
    },
    {
      name: "progress username",
      ok: !progress?.username || normalizedName(progress.username) === expectedName,
      actual: progress?.username || null,
      expected: request.username,
    },
    {
      name: "user username",
      ok: !userName || normalizedName(userName) === expectedName,
      actual: userName || null,
      expected: request.username,
    },
    {
      name: "leaderboard username",
      ok: !leaderboardName || normalizedName(leaderboardName) === expectedName,
      actual: leaderboardName || null,
      expected: request.username,
    },
  ];
  if (request.embers !== null) {
    checks.push(
      {
        name: "progress payload embers",
        ok:
          getDocumentEmbers({
            payload: { progressionV2: progressPayloadProgression },
          }) === request.embers,
        actual: getDocumentEmbers({
          payload: { progressionV2: progressPayloadProgression },
        }),
        expected: request.embers,
      },
      {
        name: "progress stats embers",
        ok: getDocumentEmbers({ stats: progressStats }) === request.embers,
        actual: getDocumentEmbers({ stats: progressStats }),
        expected: request.embers,
      },
      {
        name: "user progress embers",
        ok: getDocumentEmbers({ progress: userProgress }) === request.embers,
        actual: getDocumentEmbers({ progress: userProgress }),
        expected: request.embers,
      },
      {
        name: "user stats embers",
        ok: getDocumentEmbers({ stats: userStats }) === request.embers,
        actual: getDocumentEmbers({ stats: userStats }),
        expected: request.embers,
      },
    );
  }
  return {
    uid: request.uid,
    username: request.username,
    expectedXp: request.xp,
    expectedEmbers: request.embers,
    ok: checks.every((check) => check.ok),
    checks,
  };
}

const scores = await listDocuments("leaderboards/all-modes/scores");
const users = await listDocuments("users");
const plan = makeCleanupPlan({ scores, users });
const reviewedRepair = getReviewedRepairRequest();
const output = {
  projectId: PROJECT_ID,
  generatedAt: new Date().toISOString(),
  execute: EXECUTE,
  summary: {
    deleteCount: plan.deletePaths.length,
    reviewCount: plan.reviewPaths.length,
    destructiveActionsRequire: `--execute and FIREBASE_CLEANUP_CONFIRM=${CONFIRM_VALUE}`,
    reviewedRepairRequires: `--repair-reviewed-account --execute and FIREBASE_REPAIR_CONFIRM=${REPAIR_CONFIRM_VALUE} plus GOOGLE_OAUTH_ACCESS_TOKEN`,
    reviewedVerifyRequires: `--verify-reviewed-account plus GOOGLE_OAUTH_ACCESS_TOKEN`,
    firebaseAuthRequired: "Run firebase login with project owner/admin access first.",
  },
  deletePaths: plan.deletePaths,
  reviewPaths: plan.reviewPaths,
  results: [],
  reviewedRepair: reviewedRepair
    ? {
        uid: reviewedRepair.uid,
        username: reviewedRepair.username,
        xp: reviewedRepair.xp,
        embers: reviewedRepair.embers,
      }
    : null,
};

function compactOutputForSummary(fullOutput = output) {
  return {
    projectId: fullOutput.projectId,
    generatedAt: fullOutput.generatedAt,
    execute: fullOutput.execute,
    summary: fullOutput.summary,
    sampleDeletePaths: fullOutput.deletePaths.slice(0, 12),
    reviewPaths: fullOutput.reviewPaths,
    reviewedRepair: fullOutput.reviewedRepair,
    reviewedRepairResult: fullOutput.reviewedRepairResult || null,
    reviewedVerification: fullOutput.reviewedVerification || null,
    results: fullOutput.results,
  };
}

function printOutputForError() {
  console.error(
    JSON.stringify(SUMMARY_ONLY ? compactOutputForSummary() : output, null, 2),
  );
}

if (EXECUTE && plan.deletePaths.length) {
  if (process.env.FIREBASE_CLEANUP_CONFIRM !== CONFIRM_VALUE) {
    printOutputForError();
    throw new Error(
      `Refusing cleanup without FIREBASE_CLEANUP_CONFIRM=${CONFIRM_VALUE}`,
    );
  }
  output.results = plan.deletePaths.map((entry) => runFirebaseDelete(entry.path));
  output.summary.deletedCount = output.results.filter((entry) => entry.ok).length;
  output.summary.failedCount = output.results.filter((entry) => !entry.ok).length;
}

if (EXECUTE && reviewedRepair) {
  if (process.env.FIREBASE_REPAIR_CONFIRM !== REPAIR_CONFIRM_VALUE) {
    printOutputForError();
    throw new Error(
      `Refusing reviewed repair without FIREBASE_REPAIR_CONFIRM=${REPAIR_CONFIRM_VALUE}`,
    );
  }
  const token = process.env.GOOGLE_OAUTH_ACCESS_TOKEN || process.env.GCLOUD_ACCESS_TOKEN;
  if (!token) {
    printOutputForError();
    throw new Error(
      "Reviewed repair requires GOOGLE_OAUTH_ACCESS_TOKEN, for example: GOOGLE_OAUTH_ACCESS_TOKEN=$(gcloud auth print-access-token)",
    );
  }
  output.reviewedRepairResult = await repairReviewedAccountProgress(
    reviewedRepair,
    token,
  );
}

if (VERIFY_REVIEWED_ACCOUNT && reviewedRepair) {
  const token = process.env.GOOGLE_OAUTH_ACCESS_TOKEN || process.env.GCLOUD_ACCESS_TOKEN;
  if (!token) {
    printOutputForError();
    throw new Error(
      "Reviewed verification requires GOOGLE_OAUTH_ACCESS_TOKEN, for example: GOOGLE_OAUTH_ACCESS_TOKEN=$(gcloud auth print-access-token)",
    );
  }
  output.reviewedVerification = await verifyReviewedAccountProgress(
    reviewedRepair,
    token,
  );
  if (!output.reviewedVerification.ok) {
    printOutputForError();
    throw new Error("Reviewed account verification failed");
  }
}

if (SUMMARY_ONLY) {
  console.log(JSON.stringify(compactOutputForSummary(), null, 2));
} else {
  console.log(JSON.stringify(output, null, 2));
}
