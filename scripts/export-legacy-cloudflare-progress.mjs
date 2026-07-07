import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputPath = path.join(root, "legacy-cloudflare-progress.json");

const sql = `
SELECT
  c.username_key,
  u.username,
  u.rating,
  u.created_at,
  u.updated_at,
  s.xp AS stats_xp,
  s.level AS stats_level,
  s.runs,
  s.wins,
  l.xp AS leaderboard_xp,
  l.score AS leaderboard_score,
  csave.payload_json,
  csave.server_updated_at AS save_updated_at
FROM account_credentials c
LEFT JOIN users u ON u.id = c.user_id
LEFT JOIN stats s ON s.user_id = c.user_id
LEFT JOIN cloud_saves csave ON csave.user_id = c.user_id
LEFT JOIN leaderboards l ON l.user_id = c.user_id AND l.mode_id = 'all-modes'
ORDER BY c.username_key;
`;

function parseWranglerJson(stdout) {
  const parsed = JSON.parse(stdout);
  const first = Array.isArray(parsed) ? parsed[0] : parsed;
  if (!first?.success) {
    throw new Error(`Cloudflare D1 export failed: ${stdout}`);
  }
  return Array.isArray(first.results) ? first.results : [];
}

function normalizeUsernameKey(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getSaveXp(payload = {}) {
  return Math.max(
    0,
    Math.floor(
      Number(payload?.progressionV2?.totalXp ?? payload?.progressionV2?.xp) ||
        0,
    ),
  );
}

function buildSyntheticPayload(row) {
  const xp = Math.max(
    0,
    Math.floor(
      Number(
        row.stats_xp ??
          row.leaderboard_xp ??
          row.leaderboard_score ??
          row.rating ??
          0,
      ) || 0,
    ),
  );
  return {
    progressionV2: {
      xp,
      totalXp: xp,
      level: Math.max(1, Math.floor(xp / 500) + 1),
      medals: {},
      personalBests: {},
      ghostSamples: {},
      unlockedRewards: ["starter-loadout"],
      rewardLog: [],
    },
  };
}

function parseSavePayload(row) {
  let parsed = null;
  if (row.payload_json) {
    try {
      parsed = JSON.parse(row.payload_json);
    } catch {
      parsed = null;
    }
  }
  const synthetic = buildSyntheticPayload(row);
  if (!parsed || typeof parsed !== "object") return synthetic;
  return getSaveXp(parsed) >= getSaveXp(synthetic) ? parsed : synthetic;
}

const stdout = execFileSync(
  "npx",
  [
    "wrangler",
    "d1",
    "execute",
    "infernodrift4",
    "--remote",
    "--json",
    "--command",
    sql,
  ],
  {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  },
);

const rows = parseWranglerJson(stdout);
const accounts = {};
for (const row of rows) {
  const username = String(row.username || row.username_key || "").trim();
  const usernameLower = normalizeUsernameKey(row.username_key || username);
  if (!username || !usernameLower) continue;
  const payload = parseSavePayload(row);
  const xp = getSaveXp(payload);
  accounts[usernameLower] = {
    username,
    usernameLower,
    xp,
    level: Math.max(1, Math.floor(xp / 500) + 1),
    runs: Math.max(0, Number(row.runs) || 0),
    wins: Math.max(0, Number(row.wins) || 0),
    saveUpdatedAt: row.save_updated_at || row.updated_at || row.created_at || "",
    payload,
  };
}

const manifest = {
  schemaVersion: 1,
  source: "cloudflare-d1",
  exportedAt: new Date().toISOString(),
  note: "Legacy InfernoDrift4 account saves exported from Cloudflare D1. Contains no password hashes, salts, sessions, or private tokens.",
  accounts,
};

fs.writeFileSync(`${outputPath}.tmp`, `${JSON.stringify(manifest, null, 2)}\n`);
fs.renameSync(`${outputPath}.tmp`, outputPath);

console.log(
  JSON.stringify(
    {
      output: path.relative(root, outputPath),
      accounts: Object.keys(accounts).length,
      nonZeroXp: Object.values(accounts).filter((account) => account.xp > 0)
        .length,
    },
    null,
    2,
  ),
);
