const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "infernodrift4-online";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const PAGE_SIZE = 100;
const MAX_FETCH_ATTEMPTS = 4;
const SUMMARY_ONLY = process.argv.includes("--summary");

const TEST_NAME_PATTERN =
  /^(test|teest|smoke|fresh|runner|pilot|join|test-removed)[a-z0-9_-]*/i;
const SPECIAL_BADGE_SUSPECT_XP = 90_000;
const ACCOUNT_PROGRESS_REVIEW_SOURCE = "admin-reviewed-real-account";
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

async function safeListDocuments(path) {
  try {
    return { documents: await listDocuments(path), error: null };
  } catch (error) {
    return {
      documents: [],
      error: {
        path,
        message: String(error?.message || error || "unknown_error"),
        code: /429|quota|RESOURCE_EXHAUSTED/i.test(String(error?.message || ""))
          ? "firestore_quota_exceeded"
          : "firestore_read_failed",
      },
    };
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url) {
  let lastResponse = null;
  for (let attempt = 1; attempt <= MAX_FETCH_ATTEMPTS; attempt += 1) {
    lastResponse = await fetch(url);
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

function normalizedName(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
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

function isReviewedProgress(progress = {}) {
  return (
    progress?.accountProgressReviewedSource === ACCOUNT_PROGRESS_REVIEW_SOURCE ||
    progress?.adminRepair?.source === ACCOUNT_PROGRESS_REVIEW_SOURCE ||
    progress?.adminRepair === "reviewed-real-account-repair"
  );
}

function numericXp(value) {
  return Math.max(0, Math.floor(Number(value) || 0));
}

function collectXpFields(row = {}, fields = []) {
  return fields
    .map(({ path, value, reviewed = false }) => ({
      path,
      xp: numericXp(value),
      reviewed: Boolean(reviewed),
    }))
    .filter((field) => field.xp > 0);
}

function scoreXpFields(row = {}) {
  return collectXpFields(row, [
    { path: "score", value: row.score },
    { path: "xp", value: row.xp },
    { path: "totalXp", value: row.totalXp },
    { path: "rating", value: row.rating },
  ]);
}

function publicProfileXpFields(row = {}) {
  return collectXpFields(row, [
    {
      path: "progress.totalXp",
      value: row.progress?.totalXp,
      reviewed: isReviewedProgress(row.progress),
    },
    {
      path: "progress.xp",
      value: row.progress?.xp,
      reviewed: isReviewedProgress(row.progress),
    },
    {
      path: "stats.totalXp",
      value: row.stats?.totalXp,
      reviewed: isReviewedProgress(row.stats),
    },
    {
      path: "stats.xp",
      value: row.stats?.xp,
      reviewed: isReviewedProgress(row.stats),
    },
    {
      path: "payload.progressionV2.totalXp",
      value: row.payload?.progressionV2?.totalXp,
      reviewed: isReviewedProgress(row.payload?.progressionV2),
    },
    {
      path: "payload.progressionV2.xp",
      value: row.payload?.progressionV2?.xp,
      reviewed: isReviewedProgress(row.payload?.progressionV2),
    },
  ]);
}

function dirtySpecialBadgeFields(username = "", fields = []) {
  if (!isSpecialBadgeName(username)) return [];
  return fields.filter(
    (field) => field.xp >= SPECIAL_BADGE_SUSPECT_XP && !field.reviewed,
  );
}

function highUnreviewedXpFields(fields = []) {
  return fields.filter(
    (field) => field.xp >= SPECIAL_BADGE_SUSPECT_XP && !field.reviewed,
  );
}

function scoreXp(row) {
  return numericXp(row.score ?? row.xp ?? row.totalXp);
}

function profileXp(row) {
  return Math.max(0, ...publicProfileXpFields(row).map((field) => field.xp));
}

function arrayValue(value) {
  return Array.isArray(value) ? value : [];
}

function sumRewardXp(...rewardLists) {
  const seen = new Set();
  return rewardLists.flatMap(arrayValue).reduce((total, reward) => {
    const key = JSON.stringify({
      at: reward?.at || "",
      type: reward?.type || reward?.modeId || reward?.source || "",
      label: reward?.label || "",
      xp: numericXp(reward?.xp),
    });
    if (seen.has(key)) return total;
    seen.add(key);
    return total + numericXp(reward?.xp);
  }, 0);
}

function gameplayEvidenceSummary(row = {}) {
  const progress = row.progress || {};
  const stats = row.stats || {};
  const payloadProgress = row.payload?.progressionV2 || {};
  const rewardXp = sumRewardXp(
    progress.rewardLog,
    progress.recentRewards,
    stats.rewardLog,
    stats.recentRewards,
    payloadProgress.rewardLog,
    payloadProgress.recentRewards,
  );
  const personalBestCount = new Set([
    ...Object.keys(progress.personalBests || {}),
    ...Object.keys(stats.personalBests || {}),
    ...Object.keys(payloadProgress.personalBests || {}),
  ]).size;
  const medalCount = new Set([
    ...Object.keys(progress.medals || {}),
    ...Object.keys(stats.medals || {}),
    ...Object.keys(payloadProgress.medals || {}),
  ]).size;
  const baselineXp =
    progress.specialBadgeProgressBaselineXp ??
    stats.specialBadgeProgressBaselineXp ??
    payloadProgress.specialBadgeProgressBaselineXp ??
    null;
  return {
    rewardXp,
    personalBestCount,
    medalCount,
    baselineXp,
    hasObsoleteRepairMarker: Boolean(
      progress.specialBadgeRepairVersion ||
        progress.specialBadgeProgressSource ||
        stats.specialBadgeRepairVersion ||
        stats.specialBadgeProgressSource ||
        payloadProgress.specialBadgeRepairVersion ||
        payloadProgress.specialBadgeProgressSource,
    ),
    note:
      "Evidence only, not an automatic repair value. Reviewed repair must be chosen by an owner/admin.",
  };
}

function reviewedRepairCommand({ uid = "<UID>", username = "<USERNAME>" } = {}) {
  const safeUid = uid || "<UID>";
  const safeUsername = username || "<USERNAME>";
  return [
    "FIREBASE_REPAIR_CONFIRM=repair-reviewed-real-account",
    "npm run cleanup:firebase-public --",
    "--repair-reviewed-account",
    "--owner-auth",
    `--uid ${safeUid}`,
    `--username ${safeUsername}`,
    "--xp <KNOWN_GOOD_XP>",
    "--embers <KNOWN_GOOD_EMBERS>",
    "--execute",
  ].join(" ");
}

function auditScores(scores) {
  return scores
    .map((row) => {
      const fields = scoreXpFields(row);
      const username = row.username || row.displayName || row.name || "";
      const dirtyFields = dirtySpecialBadgeFields(username, fields);
      const reviewFields = highUnreviewedXpFields(fields);
      return {
        path: `leaderboards/all-modes/scores/${row.id}`,
        id: row.id,
        uid: row.uid || row.userId || row.id,
        username,
        score: scoreXp(row),
        xpFields: fields,
        dirtyFields,
        reviewFields,
        ownerSelfCleanPossible: Boolean(row.uid || row.userId || row.id),
        requiresOwnerSignInOrAdmin: dirtyFields.length > 0,
        reason: dirtyFields.length
          ? "special-badge-contaminated-score"
          : isTestLikeName(username)
            ? "test-like-score-row"
            : reviewFields.length
              ? "high-unreviewed-score"
              : "clean",
      };
    })
    .filter(
      (row) =>
        row.dirtyFields.length > 0 ||
        row.reviewFields.length > 0 ||
        isTestLikeName(row.username),
    )
    .sort((a, b) => b.score - a.score || a.username.localeCompare(b.username));
}

function auditUsers(users) {
  return users
    .map((row) => {
      const username = row.username || row.displayName || "";
      const fields = publicProfileXpFields(row);
      const dirtyFields = dirtySpecialBadgeFields(username, fields);
      const reviewFields = highUnreviewedXpFields(fields);
      return {
        path: `users/${row.id}`,
        id: row.id,
        username,
        xp: profileXp(row),
        xpFields: fields,
        dirtyFields,
        reviewFields,
        source:
          row.progress?.specialBadgeProgressSource ||
          row.stats?.specialBadgeProgressSource ||
          "",
        baseline:
          row.progress?.specialBadgeProgressBaselineXp ??
          row.stats?.specialBadgeProgressBaselineXp ??
          null,
        evidence: gameplayEvidenceSummary(row),
        ownerSelfCleanPossible: true,
        requiresOwnerSignInOrAdmin: dirtyFields.length > 0,
        progressPath: `progress/${row.id}`,
        reason: dirtyFields.length
          ? "special-badge-contaminated-profile"
          : isTestLikeName(username)
            ? "test-like-public-user"
            : reviewFields.length
              ? "high-unreviewed-public-user"
              : "clean",
      };
    })
    .filter(
      (row) =>
        row.dirtyFields.length > 0 ||
        row.reviewFields.length > 0 ||
        isTestLikeName(row.username),
    )
    .sort((a, b) => b.xp - a.xp || a.username.localeCompare(b.username));
}

const [scoreRead, userRead] = await Promise.all([
  safeListDocuments("leaderboards/all-modes/scores"),
  safeListDocuments("users"),
]);
const scores = scoreRead.documents;
const users = userRead.documents;
const auditErrors = [scoreRead.error, userRead.error].filter(Boolean);
const auditedLeaderboardRows = auditScores(scores);
const auditedPublicUserRows = auditUsers(users);
const publicLeaderboardRowsToIgnore = auditedLeaderboardRows.filter((row) =>
  ["special-badge-contaminated-score", "test-like-score-row"].includes(
    row.reason,
  ),
);
const publicUserRowsToIgnore = auditedPublicUserRows.filter((row) =>
  ["special-badge-contaminated-profile", "test-like-public-user"].includes(
    row.reason,
  ),
);
const contaminatedLeaderboardRows = publicLeaderboardRowsToIgnore.filter(
  (row) => row.reason === "special-badge-contaminated-score",
);
const contaminatedPublicProfiles = publicUserRowsToIgnore.filter(
  (row) => row.reason === "special-badge-contaminated-profile",
);
const highUnreviewedLeaderboardRows = auditedLeaderboardRows
  .filter((row) => row.reason === "high-unreviewed-score")
  .sort((a, b) => b.score - a.score || a.username.localeCompare(b.username));
const highUnreviewedPublicProfiles = auditedPublicUserRows
  .filter((row) => row.reason === "high-unreviewed-public-user")
  .sort((a, b) => b.xp - a.xp || a.username.localeCompare(b.username));
const testLikeLeaderboardRows = publicLeaderboardRowsToIgnore.filter(
  (row) => row.reason === "test-like-score-row",
);
const testLikePublicProfiles = publicUserRowsToIgnore.filter(
  (row) => row.reason === "test-like-public-user",
);
const report = {
  projectId: PROJECT_ID,
  generatedAt: new Date().toISOString(),
  summary: {
    publicLeaderboardRowsIgnoredByClient: publicLeaderboardRowsToIgnore.length,
    publicUserRowsIgnoredByClient: publicUserRowsToIgnore.length,
    contaminatedLeaderboardRows: contaminatedLeaderboardRows.length,
    contaminatedPublicProfiles: contaminatedPublicProfiles.length,
    highUnreviewedLeaderboardRows: highUnreviewedLeaderboardRows.length,
    highUnreviewedPublicProfiles: highUnreviewedPublicProfiles.length,
    testLikeLeaderboardRows: testLikeLeaderboardRows.length,
    testLikePublicProfiles: testLikePublicProfiles.length,
    displayLeakRisk: auditErrors.length
      ? "unknown_public_read_failed"
      : contaminatedLeaderboardRows.length || contaminatedPublicProfiles.length
        ? "guarded_by_client_but_requires_admin_cleanup"
        : highUnreviewedLeaderboardRows.length || highUnreviewedPublicProfiles.length
          ? "manual_review_required_for_high_unreviewed_xp"
          : "none_detected",
    adminCleanupRequired:
      publicLeaderboardRowsToIgnore.length > 0 ||
      publicUserRowsToIgnore.length > 0 ||
      highUnreviewedLeaderboardRows.length > 0 ||
      highUnreviewedPublicProfiles.length > 0 ||
      auditErrors.length > 0,
    cleanupRequires:
      "Firebase owner/admin credentials; production rules block public client deletes.",
    publicReadStatus: auditErrors.length ? "partial_or_failed" : "ok",
  },
  auditErrors,
  cleanupPlan: {
    deleteLeaderboardScorePaths: publicLeaderboardRowsToIgnore.map((row) => row.path),
    reviewOrDeletePublicUserPaths: publicUserRowsToIgnore.map((row) => row.path),
    reviewHighXpLeaderboardPaths: highUnreviewedLeaderboardRows.map(
      (row) => row.path,
    ),
    reviewHighXpPublicUserPaths: highUnreviewedPublicProfiles.map(
      (row) => row.path,
    ),
    note:
      "Client-side code ignores known test/special contaminated rows. High unreviewed non-special XP is reported for human review before any cleanup.",
  },
  publicLeaderboardRowsToIgnore,
  publicUserRowsToIgnore,
};

if (SUMMARY_ONLY) {
  console.log(
    JSON.stringify(
      {
        projectId: report.projectId,
        generatedAt: report.generatedAt,
        summary: report.summary,
        sampleCleanupPaths: {
          contaminatedLeaderboardRows: contaminatedLeaderboardRows
            .slice(0, 5)
            .map((row) => row.path),
          contaminatedPublicProfiles: contaminatedPublicProfiles
            .slice(0, 5)
            .map((row) => row.path),
          testLikeLeaderboardRows: testLikeLeaderboardRows
            .slice(0, 5)
            .map((row) => row.path),
          testLikePublicProfiles: testLikePublicProfiles
            .slice(0, 5)
            .map((row) => row.path),
          highUnreviewedLeaderboardRows: highUnreviewedLeaderboardRows
            .slice(0, 5)
            .map((row) => row.path),
          highUnreviewedPublicProfiles: highUnreviewedPublicProfiles
            .slice(0, 5)
            .map((row) => row.path),
        },
        auditErrors: report.auditErrors,
        contaminatedDetails: {
          leaderboard: contaminatedLeaderboardRows.slice(0, 8).map((row) => ({
            path: row.path,
            uid: row.uid,
            username: row.username,
            score: row.score,
            dirtyFields: row.dirtyFields,
            ownerSelfCleanPossible: row.ownerSelfCleanPossible,
            requiresOwnerSignInOrAdmin: row.requiresOwnerSignInOrAdmin,
          })),
          publicProfiles: contaminatedPublicProfiles.slice(0, 8).map((row) => ({
            path: row.path,
            progressPath: row.progressPath,
            id: row.id,
            username: row.username,
            xp: row.xp,
            evidence: row.evidence,
            reviewedRepairCommand: reviewedRepairCommand({
              uid: row.id,
              username: row.username,
            }),
            dirtyFields: row.dirtyFields,
            ownerSelfCleanPossible: row.ownerSelfCleanPossible,
            requiresOwnerSignInOrAdmin: row.requiresOwnerSignInOrAdmin,
          })),
        },
        highUnreviewedDetails: {
          leaderboard: highUnreviewedLeaderboardRows.slice(0, 8).map((row) => ({
            path: row.path,
            uid: row.uid,
            username: row.username,
            score: row.score,
            reviewFields: row.reviewFields,
            reviewReason:
              "non-special account has high unreviewed XP; inspect before cleanup",
          })),
          publicProfiles: highUnreviewedPublicProfiles.slice(0, 8).map((row) => ({
            path: row.path,
            progressPath: row.progressPath,
            id: row.id,
            username: row.username,
            xp: row.xp,
            evidence: row.evidence,
            reviewFields: row.reviewFields,
            reviewReason:
              "non-special account has high unreviewed XP; inspect before cleanup",
          })),
        },
      },
      null,
      2,
    ),
  );
} else {
  console.log(JSON.stringify(report, null, 2));
}
