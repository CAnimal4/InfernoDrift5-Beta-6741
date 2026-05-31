import { spawnSync } from "node:child_process";

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "infernodrift4-online";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const PAGE_SIZE = 100;
const EXECUTE = process.argv.includes("--execute");
const SUMMARY_ONLY = process.argv.includes("--summary");
const CONFIRM_VALUE = "delete-public-test-data";
const REPAIR_CONFIRM_VALUE = "repair-reviewed-real-account";
const REPAIR_REVIEWED_ACCOUNT = process.argv.includes("--repair-reviewed-account");

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

async function fetchFirestoreDocument(path, token) {
  const response = await fetch(`${BASE_URL}/${path}`, {
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
  const response = await fetch(url, {
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
  if (!REPAIR_REVIEWED_ACCOUNT) return null;
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

if (EXECUTE && plan.deletePaths.length) {
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

if (EXECUTE && reviewedRepair) {
  if (process.env.FIREBASE_REPAIR_CONFIRM !== REPAIR_CONFIRM_VALUE) {
    console.error(JSON.stringify(output, null, 2));
    throw new Error(
      `Refusing reviewed repair without FIREBASE_REPAIR_CONFIRM=${REPAIR_CONFIRM_VALUE}`,
    );
  }
  const token = process.env.GOOGLE_OAUTH_ACCESS_TOKEN || process.env.GCLOUD_ACCESS_TOKEN;
  if (!token) {
    console.error(JSON.stringify(output, null, 2));
    throw new Error(
      "Reviewed repair requires GOOGLE_OAUTH_ACCESS_TOKEN, for example: GOOGLE_OAUTH_ACCESS_TOKEN=$(gcloud auth print-access-token)",
    );
  }
  output.reviewedRepairResult = await repairReviewedAccountProgress(
    reviewedRepair,
    token,
  );
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
        reviewedRepair: output.reviewedRepair,
        reviewedRepairResult: output.reviewedRepairResult || null,
        results: output.results,
      },
      null,
      2,
    ),
  );
} else {
  console.log(JSON.stringify(output, null, 2));
}
