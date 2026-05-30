const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "infernodrift4-online";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const PAGE_SIZE = 100;
const SUMMARY_ONLY = process.argv.includes("--summary");

const TEST_NAME_PATTERN =
  /^(test|teest|smoke|fresh|runner|pilot|test-removed)[a-z0-9_-]*/i;
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
    const response = await fetch(url);
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

function isSuspiciousClarkXp(username = "", xp = 0) {
  return normalizedName(username) === "clark" && Number(xp) >= 90_000;
}

function scoreXp(row) {
  return Math.max(0, Math.floor(Number(row.score ?? row.xp ?? row.totalXp) || 0));
}

function profileXp(row) {
  return Math.max(
    0,
    Math.floor(Number(row.progress?.totalXp ?? row.progress?.xp) || 0),
  );
}

function auditScores(scores) {
  return scores
    .filter(
      (row) =>
        isTestLikeName(row.username) || isSuspiciousClarkXp(row.username, scoreXp(row)),
    )
    .map((row) => ({
      path: `leaderboards/all-modes/scores/${row.id}`,
      id: row.id,
      uid: row.uid || row.id,
      username: row.username || "",
      score: scoreXp(row),
      reason: isSuspiciousClarkXp(row.username, scoreXp(row))
        ? "special-badge-contaminated-score"
        : "test-like-score-row",
    }))
    .sort((a, b) => b.score - a.score || a.username.localeCompare(b.username));
}

function auditUsers(users) {
  return users
    .filter(
      (row) =>
        isTestLikeName(row.username) || isSuspiciousClarkXp(row.username, profileXp(row)),
    )
    .map((row) => ({
      path: `users/${row.id}`,
      id: row.id,
      username: row.username || row.displayName || "",
      xp: profileXp(row),
      source: row.progress?.specialBadgeProgressSource || "",
      baseline: row.progress?.specialBadgeProgressBaselineXp ?? null,
      reason: isSuspiciousClarkXp(row.username, profileXp(row))
        ? "special-badge-contaminated-profile"
        : "test-like-public-user",
    }))
    .sort((a, b) => b.xp - a.xp || a.username.localeCompare(b.username));
}

const scores = await listDocuments("leaderboards/all-modes/scores");
const users = await listDocuments("users");
const publicLeaderboardRowsToIgnore = auditScores(scores);
const publicUserRowsToIgnore = auditUsers(users);
const contaminatedLeaderboardRows = publicLeaderboardRowsToIgnore.filter(
  (row) => row.reason === "special-badge-contaminated-score",
);
const contaminatedPublicProfiles = publicUserRowsToIgnore.filter(
  (row) => row.reason === "special-badge-contaminated-profile",
);
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
    testLikeLeaderboardRows: testLikeLeaderboardRows.length,
    testLikePublicProfiles: testLikePublicProfiles.length,
    displayLeakRisk:
      contaminatedLeaderboardRows.length || contaminatedPublicProfiles.length
        ? "guarded_by_client_but_requires_admin_cleanup"
        : "none_detected",
    adminCleanupRequired:
      publicLeaderboardRowsToIgnore.length > 0 || publicUserRowsToIgnore.length > 0,
    cleanupRequires:
      "Firebase owner/admin credentials; production rules block public client deletes.",
  },
  cleanupPlan: {
    deleteLeaderboardScorePaths: publicLeaderboardRowsToIgnore.map((row) => row.path),
    reviewOrDeletePublicUserPaths: publicUserRowsToIgnore.map((row) => row.path),
    note:
      "Client-side code ignores these rows. Physical cleanup should be done with admin credentials only.",
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
        },
      },
      null,
      2,
    ),
  );
} else {
  console.log(JSON.stringify(report, null, 2));
}
