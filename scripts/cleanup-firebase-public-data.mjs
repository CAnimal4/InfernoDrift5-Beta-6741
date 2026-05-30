import { spawnSync } from "node:child_process";

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "infernodrift4-online";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const PAGE_SIZE = 100;
const EXECUTE = process.argv.includes("--execute");
const SUMMARY_ONLY = process.argv.includes("--summary");
const CONFIRM_VALUE = "delete-public-test-data";

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

function usernameClaimKey(value = "") {
  return normalizedName(value).replace(/\s+/g, "_");
}

function isTestLikeName(value = "") {
  const compact = normalizedName(value).replace(/[^a-z0-9_-]/g, "");
  return TEST_NAME_PATTERN.test(compact) || KNOWN_TEST_NAMES.has(compact);
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

function isSuspiciousClark(row = {}) {
  const username = row.username || row.displayName || "";
  return normalizedName(username) === "clark" && getXp(row) >= 90_000;
}

function makeCleanupPlan({ scores = [], users = [] } = {}) {
  const deletePaths = [];
  const reviewPaths = [];

  scores.forEach((row) => {
    if (isTestLikeName(row.username) || isSuspiciousClark(row)) {
      deletePaths.push({
        path: `leaderboards/all-modes/scores/${row.id}`,
        username: row.username || "",
        xp: getXp(row),
        reason: isSuspiciousClark(row)
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
    if (isSuspiciousClark(row)) {
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

const scores = await listDocuments("leaderboards/all-modes/scores");
const users = await listDocuments("users");
const plan = makeCleanupPlan({ scores, users });
const output = {
  projectId: PROJECT_ID,
  generatedAt: new Date().toISOString(),
  execute: EXECUTE,
  summary: {
    deleteCount: plan.deletePaths.length,
    reviewCount: plan.reviewPaths.length,
    destructiveActionsRequire: `--execute and FIREBASE_CLEANUP_CONFIRM=${CONFIRM_VALUE}`,
    firebaseAuthRequired: "Run firebase login with project owner/admin access first.",
  },
  deletePaths: plan.deletePaths,
  reviewPaths: plan.reviewPaths,
  results: [],
};

if (EXECUTE) {
  if (process.env.FIREBASE_CLEANUP_CONFIRM !== CONFIRM_VALUE) {
    console.error(JSON.stringify(output, null, 2));
    throw new Error(
      `Refusing cleanup without FIREBASE_CLEANUP_CONFIRM=${CONFIRM_VALUE}`,
    );
  }
  output.results = plan.deletePaths.map((entry) => runFirebaseDelete(entry.path));
  output.summary.deletedCount = output.results.filter((entry) => entry.ok).length;
  output.summary.failedCount = output.results.filter((entry) => !entry.ok).length;
}

if (SUMMARY_ONLY) {
  console.log(
    JSON.stringify(
      {
        projectId: output.projectId,
        generatedAt: output.generatedAt,
        execute: output.execute,
        summary: output.summary,
        sampleDeletePaths: output.deletePaths.slice(0, 12),
        reviewPaths: output.reviewPaths,
        results: output.results,
      },
      null,
      2,
    ),
  );
} else {
  console.log(JSON.stringify(output, null, 2));
}
