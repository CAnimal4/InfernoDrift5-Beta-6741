import {
  QUICK_CHAT,
  makePrivateCode,
  normalizeRoomOptions,
  normalizeUsername,
  sanitizeChat,
  validateClientMessage,
} from "./protocol.js";

function json(payload, init = {}) {
  return new Response(JSON.stringify(payload), {
    ...init,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
      ...(init.headers ?? {}),
    },
  });
}

function send(ws, payload) {
  try {
    ws.send(JSON.stringify(payload));
  } catch {
    // Cloudflare will close dead sockets; stale sessions are cleaned on close.
  }
}

function nowIso() {
  return new Date().toISOString();
}

const textEncoder = new TextEncoder();
const PASSWORD_HASH_ITERATIONS = 100000;

function bytesToHex(bytes) {
  return [...new Uint8Array(bytes)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function randomHex(byteLength = 16) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

async function hashPassword(password, salt) {
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(String(password)),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: textEncoder.encode(String(salt)),
      iterations: PASSWORD_HASH_ITERATIONS,
      hash: "SHA-256",
    },
    key,
    256,
  );
  return bytesToHex(bits);
}

const SEEDED_ACCOUNTS = [
  {
    id: "seed-joshua",
    username: "Joshua",
    badge: "Advanced Player",
    role: "player",
    xp: 5700,
    passwordSalt: "seed-joshua-v1",
    passwordHash:
      "cc5bb9482d5d701976e3c3b8a97aa38a05a785d0f53e889bd3e5f87085b0f8c7",
  },
  {
    id: "seed-tosh",
    username: "Tosh the Sigma",
    badge: "Rizzler",
    role: "player",
    xp: 4300,
    passwordSalt: "seed-tosh-v1",
    passwordHash:
      "4608dbb0977c18f33a22907cb8bcb4d09639aaf16b3debd9d777563539b1c490",
  },
  {
    id: "seed-clark",
    username: "Clark",
    badge: "Founder",
    role: "player",
    xp: 8200,
    passwordSalt: "seed-clark-v1",
    passwordHash:
      "1f0e592ec2d82bf6ee3a993e3b648074784a88edbeac932b207d9586524ccb43",
  },
  {
    id: "seed-moderator",
    username: "MODERATOR",
    badge: "MOD",
    role: "moderator",
    xp: 7600,
    passwordSalt: "seed-moderator-v1",
    passwordHash:
      "b94ceaed791c740d20f74f2578603868fcf6280afc9fbb636603a607dc92b7a6",
  },
];

const DEFAULT_LEADERBOARD = [
  ...SEEDED_ACCOUNTS.map((account) => ({
    id: `seed-xp-${account.id}`,
    userId: account.id,
    username: account.username,
    badge: account.badge,
    moderator: account.role === "moderator",
    xp: account.xp,
    rating: account.xp,
    score: account.xp,
    playlist: "all modes",
    scope: "Total XP",
    source: "server",
  })),
  {
    id: "seed-ranked-ghost",
    username: "Ghost Apex",
    xp: 4200,
    rating: 4200,
    score: 4200,
    playlist: "all modes",
    source: "server",
  },
  {
    id: "seed-casual-cinder",
    username: "Cinderline",
    xp: 2600,
    rating: 2600,
    score: 2600,
    playlist: "all modes",
    source: "server",
  },
  {
    id: "seed-casual-neon",
    username: "Neon Rookie",
    xp: 950,
    rating: 950,
    score: 950,
    playlist: "all modes",
    source: "server",
  },
];

const BOT_NAMES = [
  "Ash Bot",
  "Boost Bot",
  "Cinder Bot",
  "Drift Bot",
  "Ember Bot",
  "Flux Bot",
];

const BAN_DURATION_MS = 24 * 60 * 60 * 1000;
const CHAT_HISTORY_WINDOW_MS = 15 * 60 * 1000;
const CHAT_HISTORY_LIMIT = 100;
const ALLOWED_FEEDBACK_TYPES = new Set(["bug", "feature", "fix", "other"]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const PLACEHOLDER_SECRET_VALUES = new Set([
  "",
  "not-configured",
  "not_configured",
  "not configured",
  "disabled",
  "replace-me",
  "replace_me",
  "placeholder",
]);

function emptyData() {
  return {
    users: {},
    sessions: {},
    usernameClaims: {},
    saves: {},
    friends: {},
    friendRequests: {},
    reports: [],
    moderationLogs: [],
    bans: {},
    feedback: [],
    chatMessages: [],
    accountDeletions: [],
    leaderboard: DEFAULT_LEADERBOARD,
  };
}

function seedSystemAccounts(state) {
  for (const account of SEEDED_ACCOUNTS) {
    const key = claimKey(account.username);
    const claimedId = state.usernameClaims[key];
    const id = claimedId && state.users[claimedId] ? claimedId : account.id;
    const existing = state.users[id] ?? {};
    const xp = Math.max(Number(existing.xp) || 0, account.xp);
    state.users[id] = {
      ...existing,
      id,
      username: account.username,
      age: Number.isFinite(existing.age) ? existing.age : 13,
      rating: Math.max(Number(existing.rating) || 0, xp),
      xp,
      online: Boolean(existing.online),
      claimedUsername: account.username,
      authProvider: "password",
      passwordSalt: account.passwordSalt,
      passwordHash: account.passwordHash,
      badge: account.badge,
      role: account.role,
      moderator: account.role === "moderator",
      deviceId: existing.deviceId ?? "",
      createdAt: existing.createdAt ?? nowIso(),
      updatedAt: existing.updatedAt ?? nowIso(),
    };
    state.usernameClaims[key] = id;
    state.leaderboard = [
      {
        id: `seed-xp-${id}`,
        userId: id,
        username: account.username,
        badge: account.badge,
        moderator: account.role === "moderator",
        xp,
        totalXp: xp,
        score: xp,
        rating: xp,
        playlist: "all modes",
        scope: "Total XP",
        source: "server",
        updatedAt: state.users[id].updatedAt,
      },
      ...state.leaderboard.filter(
        (row) => row.id !== `seed-xp-${id}` && row.userId !== id,
      ),
    ];
  }
  state.leaderboard = state.leaderboard.sort(compareLeaderboard);
}

function normalizeData(data) {
  const state = {
    ...emptyData(),
    ...(data && typeof data === "object" ? data : {}),
  };
  state.users =
    state.users &&
    typeof state.users === "object" &&
    !Array.isArray(state.users)
      ? state.users
      : {};
  state.sessions =
    state.sessions &&
    typeof state.sessions === "object" &&
    !Array.isArray(state.sessions)
      ? state.sessions
      : {};
  state.usernameClaims =
    state.usernameClaims &&
    typeof state.usernameClaims === "object" &&
    !Array.isArray(state.usernameClaims)
      ? state.usernameClaims
      : {};
  state.saves =
    state.saves &&
    typeof state.saves === "object" &&
    !Array.isArray(state.saves)
      ? state.saves
      : {};
  state.friends =
    state.friends &&
    typeof state.friends === "object" &&
    !Array.isArray(state.friends)
      ? state.friends
      : {};
  state.friendRequests =
    state.friendRequests &&
    typeof state.friendRequests === "object" &&
    !Array.isArray(state.friendRequests)
      ? state.friendRequests
      : {};
  state.reports = Array.isArray(state.reports) ? state.reports : [];
  state.moderationLogs = Array.isArray(state.moderationLogs)
    ? state.moderationLogs
    : [];
  state.bans =
    state.bans && typeof state.bans === "object" && !Array.isArray(state.bans)
      ? state.bans
      : {};
  state.feedback = Array.isArray(state.feedback) ? state.feedback : [];
  state.chatMessages = Array.isArray(state.chatMessages)
    ? state.chatMessages
    : [];
  state.accountDeletions = Array.isArray(state.accountDeletions)
    ? state.accountDeletions
    : [];
  state.leaderboard =
    Array.isArray(state.leaderboard) && state.leaderboard.length
      ? state.leaderboard
      : DEFAULT_LEADERBOARD;
  seedSystemAccounts(state);
  return state;
}

function claimKey(username) {
  return normalizeUsername(username, "").trim().toLowerCase();
}

function getLeaderboardXp(row) {
  return Math.max(
    0,
    Math.floor(
      Number(row?.xp ?? row?.totalXp ?? row?.score ?? row?.rating) || 0,
    ),
  );
}

function compareLeaderboard(a, b) {
  return getLeaderboardXp(b) - getLeaderboardXp(a);
}

function extractSaveXp(payload = {}) {
  const progress =
    payload.progressionV2 && typeof payload.progressionV2 === "object"
      ? payload.progressionV2
      : {};
  return Math.max(
    0,
    Math.floor(
      Number(
        progress.totalXp ?? progress.xp ?? payload.totalXp ?? payload.xp,
      ) || 0,
    ),
  );
}

function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    rating: Number.isFinite(user.rating) ? user.rating : 1000,
    xp: Math.max(0, Number(user.xp) || 0),
    online: Boolean(user.online),
    claimed: Boolean(user.claimedUsername),
    account: user.authProvider === "password",
    ageGate: Number.isFinite(user.age) ? user.age : null,
    badge: user.badge || "",
    role: user.role || "player",
    moderator: Boolean(user.moderator || user.role === "moderator"),
  };
}

function usableSecret(value) {
  const normalized = String(value ?? "").trim();
  if (!normalized) return "";
  return PLACEHOLDER_SECRET_VALUES.has(normalized.toLowerCase())
    ? ""
    : normalized;
}

function hasResendConfig(env) {
  return Boolean(
    usableSecret(env.RESEND_API_KEY) &&
    usableSecret(env.FEEDBACK_TO ?? env.FEEDBACK_EMAIL_TO),
  );
}

async function deliverFeedback(row, env) {
  const apiKey = usableSecret(env.RESEND_API_KEY);
  const to = usableSecret(env.FEEDBACK_TO ?? env.FEEDBACK_EMAIL_TO);
  if (!apiKey || !to) return "stored";
  const from =
    usableSecret(env.FEEDBACK_FROM ?? env.FEEDBACK_EMAIL_FROM) ||
    "InfernoDrift4 <feedback@infernodrift.local>";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: `InfernoDrift4 feedback: ${row.feedbackType}`,
      text: [
        `Feedback ID: ${row.id}`,
        `From: ${row.username} (${row.userId})`,
        `Reply: ${row.replyEmail || "none"}`,
        `Type: ${row.feedbackType}`,
        "",
        row.message,
        "",
        `Diagnostics: ${JSON.stringify(row.diagnostics ?? {})}`,
      ].join("\n"),
    }),
  });
  return response.ok ? "delivered" : "stored";
}

function normalizeFeedbackType(value) {
  const type = String(value ?? "")
    .trim()
    .toLowerCase();
  return ALLOWED_FEEDBACK_TYPES.has(type) ? type : "other";
}

function buildFeedbackRow(payload, user = {}) {
  const message = sanitizeChat(payload.message).slice(0, 2000);
  if (!message || message === "[blocked]") {
    return { ok: false, error: "feedback_rejected" };
  }
  const age13OrOlder =
    payload.age13OrOlder === true ||
    Number(payload.age) >= 13 ||
    Number(user.age) >= 13;
  const replyEmail = String(payload.replyEmail ?? "").trim();
  const safeReplyEmail =
    age13OrOlder && (!replyEmail || EMAIL_PATTERN.test(replyEmail))
      ? replyEmail.slice(0, 120)
      : "";
  return {
    ok: true,
    row: {
      id: crypto.randomUUID(),
      userId: user.id ?? "feedback-http",
      username: normalizeUsername(
        user.username ?? payload.username ?? "Feedback Guest",
        "Feedback Guest",
      ),
      feedbackType: normalizeFeedbackType(payload.feedbackType ?? payload.type),
      message,
      replyEmail: safeReplyEmail,
      diagnostics:
        payload.diagnostics &&
        typeof payload.diagnostics === "object" &&
        !Array.isArray(payload.diagnostics)
          ? payload.diagnostics
          : {},
      createdAt: nowIso(),
      storageShape: "d1-feedback-v1",
    },
  };
}

async function writeFeedbackToD1(env, row) {
  if (!env.INFERNO_DB?.prepare) return false;
  await env.INFERNO_DB.prepare(
    `INSERT INTO feedback (id, user_id, username, feedback_type, message, reply_email, diagnostics_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      row.id,
      row.userId,
      row.username,
      row.feedbackType,
      row.message,
      row.replyEmail,
      JSON.stringify(row.diagnostics ?? {}),
      row.createdAt,
    )
    .run();
  return true;
}

async function writeChatMessageToD1(env, row) {
  if (!env.INFERNO_DB?.prepare) return false;
  await env.INFERNO_DB.prepare(
    `INSERT INTO chat_messages (id, channel, user_id, username, badge, moderator, message_text, quick, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      row.id,
      row.channel,
      row.userId,
      row.from,
      row.badge || "",
      row.moderator ? 1 : 0,
      row.text,
      row.quick ? 1 : 0,
      row.createdAt,
    )
    .run();
  return true;
}

async function writeSaveAndLeaderboardToD1(env, user, row, totalXp) {
  if (!env.INFERNO_DB?.prepare) return false;
  const now = row.serverUpdatedAt || nowIso();
  await env.INFERNO_DB.batch([
    env.INFERNO_DB.prepare(
      `INSERT OR REPLACE INTO cloud_saves (user_id, schema_version, payload_json, server_updated_at)
       VALUES (?, ?, ?, ?)`,
    ).bind(user.id, row.schemaVersion, JSON.stringify(row.payload), now),
    env.INFERNO_DB.prepare(
      `INSERT OR REPLACE INTO stats (user_id, xp, level, runs, wins, updated_at)
       VALUES (?, ?, ?, COALESCE((SELECT runs FROM stats WHERE user_id = ?), 0), COALESCE((SELECT wins FROM stats WHERE user_id = ?), 0), ?)`,
    ).bind(
      user.id,
      totalXp,
      Math.max(1, Math.floor(totalXp / 500) + 1),
      user.id,
      user.id,
      now,
    ),
    env.INFERNO_DB.prepare(
      `INSERT OR REPLACE INTO leaderboards (id, user_id, username, playlist, mode_id, rating, score, season_id, source, updated_at, xp, badge, moderator)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      `xp-${user.id}`,
      user.id,
      user.username,
      "all modes",
      "global-xp",
      totalXp,
      totalXp,
      "preseason",
      "server",
      now,
      totalXp,
      user.badge || "",
      user.moderator || user.role === "moderator" ? 1 : 0,
    ),
  ]);
  return true;
}

async function writeUserSessionToD1(env, user, sessionToken, session = {}) {
  if (!env.INFERNO_DB?.prepare) return false;
  const now = user.updatedAt || nowIso();
  const ageGate = Number.isFinite(user.age)
    ? user.age >= 13
      ? "13+"
      : "under13"
    : "unset";
  const statements = [
    env.INFERNO_DB.prepare(
      `INSERT OR REPLACE INTO users (id, username, age_gate, device_id, rating, founder_badge, created_at, updated_at, badge, role, banned_until)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      user.id,
      user.username,
      ageGate,
      user.deviceId || "",
      Number(user.rating) || Number(user.xp) || 1000,
      user.badge === "Founder" ? 1 : 0,
      user.createdAt || now,
      now,
      user.badge || "",
      user.role || "player",
      user.bannedUntil || "",
    ),
  ];
  if (user.claimedUsername) {
    statements.push(
      env.INFERNO_DB.prepare(
        `INSERT OR REPLACE INTO username_claims (username_key, user_id, username, created_at)
         VALUES (?, ?, ?, ?)`,
      ).bind(
        claimKey(user.claimedUsername),
        user.id,
        user.claimedUsername,
        now,
      ),
    );
  }
  if (user.passwordHash && user.passwordSalt) {
    statements.push(
      env.INFERNO_DB.prepare(
        `INSERT OR REPLACE INTO account_credentials (user_id, username_key, password_hash, password_salt, auth_provider, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ).bind(
        user.id,
        claimKey(user.username),
        user.passwordHash,
        user.passwordSalt,
        user.authProvider || "password",
        user.createdAt || now,
        now,
      ),
    );
  }
  if (sessionToken) {
    statements.push(
      env.INFERNO_DB.prepare(
        `INSERT OR REPLACE INTO sessions (token_hash, user_id, device_id, created_at, last_seen_at)
         VALUES (?, ?, ?, ?, ?)`,
      ).bind(
        sessionToken,
        user.id,
        session.deviceId || user.deviceId || "",
        session.createdAt || now,
        now,
      ),
    );
  }
  await env.INFERNO_DB.batch(statements);
  return true;
}

async function deleteUserFromD1(env, user) {
  if (!env.INFERNO_DB?.prepare) return false;
  const deletionId = crypto.randomUUID();
  await env.INFERNO_DB.batch([
    env.INFERNO_DB.prepare(
      "INSERT INTO account_deletions (id, user_id, username_key, deleted_at) VALUES (?, ?, ?, ?)",
    ).bind(deletionId, user.id, claimKey(user.username), nowIso()),
    env.INFERNO_DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(
      user.id,
    ),
    env.INFERNO_DB.prepare("DELETE FROM cloud_saves WHERE user_id = ?").bind(
      user.id,
    ),
    env.INFERNO_DB.prepare("DELETE FROM stats WHERE user_id = ?").bind(user.id),
    env.INFERNO_DB.prepare("DELETE FROM ranked_ratings WHERE user_id = ?").bind(
      user.id,
    ),
    env.INFERNO_DB.prepare("DELETE FROM leaderboards WHERE user_id = ?").bind(
      user.id,
    ),
    env.INFERNO_DB.prepare(
      "DELETE FROM username_claims WHERE user_id = ?",
    ).bind(user.id),
    env.INFERNO_DB.prepare(
      "DELETE FROM account_credentials WHERE user_id = ?",
    ).bind(user.id),
    env.INFERNO_DB.prepare(
      "DELETE FROM friends WHERE user_id = ? OR friend_user_id = ?",
    ).bind(user.id, user.id),
    env.INFERNO_DB.prepare(
      "DELETE FROM blocks WHERE user_id = ? OR blocked_user_id = ?",
    ).bind(user.id, user.id),
    env.INFERNO_DB.prepare("DELETE FROM account_bans WHERE user_id = ?").bind(
      user.id,
    ),
    env.INFERNO_DB.prepare("DELETE FROM room_members WHERE user_id = ?").bind(
      user.id,
    ),
    env.INFERNO_DB.prepare(
      "UPDATE friend_requests SET from_username = 'Deleted Player' WHERE from_user_id = ?",
    ).bind(user.id),
    env.INFERNO_DB.prepare(
      "UPDATE friend_requests SET to_username = 'Deleted Player' WHERE to_user_id = ?",
    ).bind(user.id),
    env.INFERNO_DB.prepare(
      "UPDATE moderation_reports SET reporter_username = 'Deleted Player' WHERE reporter_user_id = ?",
    ).bind(user.id),
    env.INFERNO_DB.prepare(
      "UPDATE moderation_reports SET target_username = 'Deleted Player' WHERE target_user_id = ?",
    ).bind(user.id),
    env.INFERNO_DB.prepare(
      "UPDATE moderation_logs SET user_id = '' WHERE user_id = ?",
    ).bind(user.id),
    env.INFERNO_DB.prepare(
      "UPDATE chat_messages SET username = 'Deleted Player' WHERE user_id = ?",
    ).bind(user.id),
    env.INFERNO_DB.prepare("DELETE FROM users WHERE id = ?").bind(user.id),
  ]);
  return true;
}

async function deleteSessionFromD1(env, token) {
  if (!env.INFERNO_DB?.prepare || !token) return false;
  await env.INFERNO_DB.prepare("DELETE FROM sessions WHERE token_hash = ?")
    .bind(token)
    .run();
  return true;
}

async function deleteSessionsForUserFromD1(env, userId) {
  if (!env.INFERNO_DB?.prepare || !userId) return false;
  await env.INFERNO_DB.prepare("DELETE FROM sessions WHERE user_id = ?")
    .bind(userId)
    .run();
  return true;
}

async function d1All(env, sql, bindings = []) {
  if (!env.INFERNO_DB?.prepare) return [];
  try {
    const statement = env.INFERNO_DB.prepare(sql);
    const result = bindings.length
      ? await statement.bind(...bindings).all()
      : await statement.all();
    return Array.isArray(result?.results) ? result.results : [];
  } catch {
    return [];
  }
}

function ageFromGate(value, fallback = undefined) {
  const gate = String(value ?? "").toLowerCase();
  if (gate === "under13") return 12;
  if (gate === "13+" || gate === "adult") return 13;
  return Number.isFinite(fallback) ? fallback : undefined;
}

function parseJsonColumn(value, fallback = {}) {
  try {
    const parsed = JSON.parse(String(value ?? ""));
    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch {
    return fallback;
  }
}

async function hydrateDataFromD1(env, stored) {
  const state = normalizeData(stored);
  if (!env.INFERNO_DB?.prepare) return state;

  const userRows = await d1All(
    env,
    `SELECT u.*, s.xp AS stats_xp, c.password_hash, c.password_salt, c.auth_provider
     FROM users u
     LEFT JOIN stats s ON s.user_id = u.id
     LEFT JOIN account_credentials c ON c.user_id = u.id`,
  );
  for (const row of userRows) {
    const existing = state.users[row.id] ?? {};
    const xp = Math.max(Number(existing.xp) || 0, Number(row.stats_xp) || 0);
    state.users[row.id] = {
      ...existing,
      id: row.id,
      username: row.username || existing.username || "Player",
      age: ageFromGate(row.age_gate, existing.age),
      deviceId: row.device_id || existing.deviceId || "",
      rating: Math.max(
        Number(row.rating) || 0,
        xp,
        Number(existing.rating) || 0,
      ),
      xp,
      online: false,
      claimedUsername: row.username || existing.claimedUsername || null,
      authProvider: row.auth_provider || existing.authProvider || "guest",
      passwordSalt: row.password_salt || existing.passwordSalt || "",
      passwordHash: row.password_hash || existing.passwordHash || "",
      badge:
        row.badge ||
        (Number(row.founder_badge) ? "Founder" : "") ||
        existing.badge ||
        "",
      role: row.role || existing.role || "player",
      moderator: row.role === "moderator" || Boolean(existing.moderator),
      bannedUntil: row.banned_until || existing.bannedUntil || "",
      createdAt: row.created_at || existing.createdAt || nowIso(),
      updatedAt: row.updated_at || existing.updatedAt || nowIso(),
    };
  }

  for (const row of await d1All(
    env,
    "SELECT username_key, user_id, username FROM username_claims",
  )) {
    if (row.username_key && row.user_id) {
      state.usernameClaims[row.username_key] = row.user_id;
      if (state.users[row.user_id] && row.username) {
        state.users[row.user_id].claimedUsername = row.username;
      }
    }
  }

  for (const row of await d1All(
    env,
    "SELECT token_hash, user_id, device_id, created_at, last_seen_at FROM sessions",
  )) {
    if (row.token_hash && row.user_id && state.users[row.user_id]) {
      state.sessions[row.token_hash] = {
        token: row.token_hash,
        userId: row.user_id,
        deviceId: row.device_id || "",
        account: state.users[row.user_id].authProvider === "password",
        createdAt: row.created_at || nowIso(),
        lastSeenAt: row.last_seen_at || nowIso(),
      };
    }
  }

  for (const row of await d1All(
    env,
    "SELECT user_id, schema_version, payload_json, server_updated_at FROM cloud_saves",
  )) {
    if (row.user_id) {
      state.saves[row.user_id] = {
        userId: row.user_id,
        schemaVersion: Number(row.schema_version) || 1,
        payload: parseJsonColumn(row.payload_json, {}),
        serverUpdatedAt: row.server_updated_at || nowIso(),
      };
    }
  }

  const leaderboardRows = await d1All(
    env,
    `SELECT id, user_id, username, playlist, mode_id, rating, score, source, updated_at, xp, badge, moderator
     FROM leaderboards`,
  );
  if (leaderboardRows.length) {
    state.leaderboard = leaderboardRows
      .map((row) => ({
        id: row.id,
        userId: row.user_id || "",
        username: row.username || "Player",
        playlist: row.playlist || "all modes",
        modeId: row.mode_id || "global-xp",
        rating: Number(row.rating) || Number(row.xp) || 0,
        score: Number(row.score) || Number(row.xp) || 0,
        xp: Number(row.xp) || Number(row.score) || Number(row.rating) || 0,
        totalXp: Number(row.xp) || Number(row.score) || Number(row.rating) || 0,
        badge: row.badge || "",
        moderator: Boolean(Number(row.moderator)),
        source: row.source || "server",
        updatedAt: row.updated_at || nowIso(),
      }))
      .sort(compareLeaderboard);
  }

  const cutoff = new Date(Date.now() - CHAT_HISTORY_WINDOW_MS).toISOString();
  state.chatMessages = (
    await d1All(
      env,
      `SELECT id, channel, user_id, username, badge, moderator, message_text, quick, created_at
       FROM chat_messages
       WHERE created_at >= ?
       ORDER BY created_at ASC
       LIMIT ?`,
      [cutoff, CHAT_HISTORY_LIMIT],
    )
  ).map((row) => ({
    id: row.id,
    channel: row.channel || "lobby",
    from: row.username || "Player",
    userId: row.user_id || "",
    badge: row.badge || "",
    moderator: Boolean(Number(row.moderator)),
    text: row.message_text || "",
    quick: Boolean(Number(row.quick)),
    createdAt: row.created_at || nowIso(),
  }));

  for (const row of await d1All(
    env,
    "SELECT user_id, friend_user_id, created_at FROM friends",
  )) {
    if (!row.user_id || !row.friend_user_id) continue;
    state.friends[row.user_id] ??= {
      friends: {},
      blocked: {},
      blockedUsernames: {},
    };
    state.friends[row.user_id].friends[row.friend_user_id] = {
      since: row.created_at || nowIso(),
    };
  }

  for (const row of await d1All(
    env,
    "SELECT id, from_user_id, from_username, to_user_id, to_username, status, created_at, responded_at FROM friend_requests",
  )) {
    if (!row.id) continue;
    state.friendRequests[row.id] = {
      id: row.id,
      fromUserId: row.from_user_id || "",
      fromUsername: row.from_username || "",
      toUserId: row.to_user_id || "",
      toUsername: row.to_username || "",
      status: row.status || "pending",
      createdAt: row.created_at || nowIso(),
      respondedAt: row.responded_at || "",
    };
  }

  for (const row of await d1All(
    env,
    "SELECT user_id, blocked_user_id, blocked_username, created_at FROM blocks",
  )) {
    if (!row.user_id) continue;
    state.friends[row.user_id] ??= {
      friends: {},
      blocked: {},
      blockedUsernames: {},
    };
    if (row.blocked_user_id) {
      state.friends[row.user_id].blocked[row.blocked_user_id] = {
        username: row.blocked_username || "",
        createdAt: row.created_at || nowIso(),
      };
    } else if (row.blocked_username) {
      state.friends[row.user_id].blockedUsernames[row.blocked_username] = {
        createdAt: row.created_at || nowIso(),
      };
    }
  }

  state.reports = (
    await d1All(
      env,
      "SELECT id, reporter_user_id, reporter_username, target_user_id, target_username, reason, created_at FROM moderation_reports",
    )
  ).map((row) => ({
    id: row.id,
    reporterUserId: row.reporter_user_id || "",
    reporterUsername: row.reporter_username || "",
    targetUserId: row.target_user_id || "",
    targetUsername: row.target_username || "",
    reason: row.reason || "",
    createdAt: row.created_at || nowIso(),
  }));

  state.moderationLogs = (
    await d1All(
      env,
      "SELECT id, user_id, action, reason, metadata_json, created_at FROM moderation_logs",
    )
  ).map((row) => ({
    id: row.id,
    targetUserId: row.user_id || "",
    action: row.action || "",
    reason: row.reason || "",
    metadata: parseJsonColumn(row.metadata_json, {}),
    createdAt: row.created_at || nowIso(),
  }));

  for (const row of await d1All(
    env,
    "SELECT user_id, username, banned_until, banned_by_user_id, reason, created_at FROM account_bans",
  )) {
    if (!row.user_id) continue;
    const ban = {
      userId: row.user_id,
      username: row.username || "",
      until: row.banned_until || "",
      byUserId: row.banned_by_user_id || "",
      reason: row.reason || "",
      createdAt: row.created_at || nowIso(),
    };
    state.bans[row.user_id] = ban;
    const deviceId = state.users[row.user_id]?.deviceId;
    if (deviceId)
      state.bans[`device:${deviceId}`] = {
        ...ban,
        userId: `device:${deviceId}`,
      };
  }

  seedSystemAccounts(state);
  state.leaderboard = state.leaderboard.sort(compareLeaderboard);
  return state;
}

async function writeFriendRequestToD1(env, request) {
  if (!env.INFERNO_DB?.prepare) return false;
  await env.INFERNO_DB.prepare(
    `INSERT OR REPLACE INTO friend_requests (id, from_user_id, from_username, to_user_id, to_username, status, created_at, responded_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      request.id,
      request.fromUserId,
      request.fromUsername,
      request.toUserId || "",
      request.toUsername,
      request.status,
      request.createdAt,
      request.respondedAt || "",
    )
    .run();
  return true;
}

async function writeFriendPairToD1(env, userId, friendUserId, createdAt) {
  if (!env.INFERNO_DB?.prepare) return false;
  await env.INFERNO_DB.prepare(
    `INSERT OR REPLACE INTO friends (user_id, friend_user_id, created_at)
     VALUES (?, ?, ?)`,
  )
    .bind(userId, friendUserId, createdAt || nowIso())
    .run();
  return true;
}

async function writeBlockToD1(env, userId, target, username) {
  if (!env.INFERNO_DB?.prepare) return false;
  await env.INFERNO_DB.prepare(
    `INSERT OR REPLACE INTO blocks (user_id, blocked_user_id, blocked_username, created_at)
     VALUES (?, ?, ?, ?)`,
  )
    .bind(
      userId,
      target?.id || "",
      username || target?.username || "",
      nowIso(),
    )
    .run();
  return true;
}

async function writeReportToD1(env, report) {
  if (!env.INFERNO_DB?.prepare) return false;
  await env.INFERNO_DB.prepare(
    `INSERT INTO moderation_reports (id, reporter_user_id, reporter_username, target_user_id, target_username, reason, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      report.id,
      report.reporterUserId,
      report.reporterUsername,
      report.targetUserId || "",
      report.targetUsername,
      report.reason,
      report.createdAt,
    )
    .run();
  return true;
}

async function writeModerationToD1(env, record) {
  if (!env.INFERNO_DB?.prepare) return false;
  const statements = [
    env.INFERNO_DB.prepare(
      `INSERT INTO moderation_logs (id, user_id, action, reason, metadata_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).bind(
      record.id,
      record.targetUserId || "",
      record.action,
      record.reason,
      JSON.stringify({
        moderatorUserId: record.moderatorUserId,
        moderatorUsername: record.moderatorUsername,
        targetUsername: record.targetUsername,
        until: record.until || "",
      }),
      record.createdAt,
    ),
  ];
  if (record.action === "ban") {
    statements.push(
      env.INFERNO_DB.prepare(
        `INSERT OR REPLACE INTO account_bans (user_id, username, banned_until, banned_by_user_id, reason, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      ).bind(
        record.targetUserId,
        record.targetUsername,
        record.until,
        record.moderatorUserId,
        record.reason,
        record.createdAt,
      ),
    );
  }
  await env.INFERNO_DB.batch(statements);
  return true;
}

async function writeRoomMemberToD1(env, room, user, left = false) {
  if (!env.INFERNO_DB?.prepare || !room?.code || !user?.id) return false;
  const now = nowIso();
  await env.INFERNO_DB.prepare(
    `INSERT OR REPLACE INTO room_members (room_code, user_id, username, mode_id, playlist, joined_at, left_at)
     VALUES (?, ?, ?, ?, ?, COALESCE((SELECT joined_at FROM room_members WHERE room_code = ? AND user_id = ?), ?), ?)`,
  )
    .bind(
      room.code,
      user.id,
      user.username,
      room.mode || "",
      room.playlist || "",
      room.code,
      user.id,
      now,
      left ? now : "",
    )
    .run();
  return true;
}

export class InfernoRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map();
    this.room = {
      id: state.id?.toString?.() ?? "room",
      code: "",
      mode: "casual",
      playlist: "casual",
      size: 6,
      teamSize: 3,
      ranked: false,
      botFill: true,
    };
    this.data = emptyData();
    this.ready = this.load();
  }

  async load() {
    const stored = await this.state.storage.get("infernodrift4-state");
    const room = await this.state.storage.get("infernodrift4-room");
    this.data = await hydrateDataFromD1(this.env, stored);
    if (room && typeof room === "object") {
      this.room = { ...this.room, ...room };
    }
  }

  async persist() {
    await Promise.all([
      this.state.storage.put("infernodrift4-state", this.data),
      this.state.storage.put("infernodrift4-room", this.room),
    ]);
  }

  async fetch(request) {
    await this.ready;
    const url = new URL(request.url);
    if (url.pathname === "/feedback-store" && request.method === "POST") {
      const row = await request.json();
      this.data.feedback.push(row);
      await this.persist();
      return json({ ok: true, stored: true });
    }
    if (request.headers.get("upgrade") !== "websocket") {
      return json({
        ok: true,
        room: this.room,
        players: this.sessions.size,
        persistence: "durable-object",
      });
    }
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.accept(server, new URL(request.url));
    return new Response(null, { status: 101, webSocket: client });
  }

  accept(ws, url) {
    const id = crypto.randomUUID();
    const roomFromUrl = url.searchParams.get("room");
    this.room.code = (
      roomFromUrl ||
      this.room.code ||
      makePrivateCode()
    ).toUpperCase();
    const user = {
      id,
      username: `Guest-${id.slice(0, 4)}`,
      rating: 1000,
      online: true,
    };
    this.sessions.set(id, {
      ws,
      user,
      sessionToken: "",
      rate: new Map(),
      latestInput: null,
      inRoom: false,
    });
    ws.accept();
    send(ws, { type: "hello", id, server: "InfernoDrift4 Worker" });
    ws.addEventListener("message", (event) => {
      this.onMessage(id, event.data).catch((error) => {
        console.error(
          "infernodrift4_worker_message_error",
          error?.message || "unknown",
        );
        send(ws, { type: "error", error: "server_error" });
      });
    });
    ws.addEventListener("close", () => this.onClose(id));
    ws.addEventListener("error", () => this.onClose(id));
  }

  checkRate(session, key, limit, windowMs) {
    const now = Date.now();
    const bucket = session.rate.get(key) ?? [];
    const recent = bucket.filter((time) => now - time < windowMs);
    if (recent.length >= limit) return false;
    recent.push(now);
    session.rate.set(key, recent);
    return true;
  }

  clientByUserId(userId) {
    return [...this.sessions.values()].find(
      (session) => session.user.id === userId,
    );
  }

  clientRecordByUserId(userId) {
    for (const [id, session] of this.sessions.entries()) {
      if (session.user?.id === userId) return { id, session };
    }
    return null;
  }

  activeBanForUser(userId, deviceId = "") {
    const candidates = [
      this.data.bans?.[userId],
      deviceId ? this.data.bans?.[`device:${deviceId}`] : null,
    ].filter(Boolean);
    const ban = candidates[0];
    if (!ban) return null;
    const untilMs = Date.parse(ban.until);
    if (!Number.isFinite(untilMs) || untilMs <= Date.now()) {
      delete this.data.bans[userId];
      if (deviceId) delete this.data.bans[`device:${deviceId}`];
      return null;
    }
    return ban;
  }

  isModeratorUser(user) {
    return Boolean(user?.moderator || user?.role === "moderator");
  }

  isBlockedBetween(fromUserId, toUserId) {
    const fromState = this.data.friends[fromUserId] ?? {};
    const toState = this.data.friends[toUserId] ?? {};
    return Boolean(
      fromState.blocked?.[toUserId] || toState.blocked?.[fromUserId],
    );
  }

  pruneChatMessages() {
    const cutoff = Date.now() - CHAT_HISTORY_WINDOW_MS;
    this.data.chatMessages = this.data.chatMessages.filter((message) => {
      const createdAt = Date.parse(message.createdAt);
      return Number.isFinite(createdAt) && createdAt >= cutoff;
    });
  }

  chatChannelForSession(session) {
    return session?.inRoom ? `room:${this.room.code || this.room.id}` : "lobby";
  }

  chatHistoryPayload(session) {
    this.pruneChatMessages();
    const channel = this.chatChannelForSession(session);
    return {
      type: "chat.history",
      channel,
      windowMs: CHAT_HISTORY_WINDOW_MS,
      messages: this.data.chatMessages
        .filter((message) => message.channel === channel)
        .slice(-CHAT_HISTORY_LIMIT)
        .map((message) => ({
          from: message.from,
          userId: message.userId,
          badge: message.badge || "",
          moderator: Boolean(message.moderator),
          text: message.text,
          quick: Boolean(message.quick),
          at: message.createdAt,
        })),
    };
  }

  ensureFriendState(userId) {
    if (!this.data.friends[userId]) {
      this.data.friends[userId] = {
        friends: {},
        blocked: {},
        blockedUsernames: {},
      };
    }
    this.data.friends[userId].friends ??= {};
    this.data.friends[userId].blocked ??= {};
    this.data.friends[userId].blockedUsernames ??= {};
    return this.data.friends[userId];
  }

  findUserByUsername(username) {
    const key = claimKey(username);
    if (!key) return null;
    const claimedId = this.data.usernameClaims[key];
    if (claimedId && this.data.users[claimedId])
      return this.data.users[claimedId];
    return (
      Object.values(this.data.users).find(
        (user) => claimKey(user.username) === key,
      ) ?? null
    );
  }

  createOrRestoreUser(session, msg) {
    const token = typeof msg.sessionToken === "string" ? msg.sessionToken : "";
    const restoredSession = token ? this.data.sessions[token] : null;
    const restoredUser = restoredSession
      ? this.data.users[restoredSession.userId]
      : null;
    const userId = restoredUser?.id ?? crypto.randomUUID();
    const existing = restoredUser ?? {};
    const fallbackName = existing.username ?? session.user.username;
    const requested =
      msg.type === "reconnect"
        ? fallbackName
        : normalizeUsername(msg.username || fallbackName, fallbackName);
    const requestedKey = claimKey(requested);
    const claimedByOther =
      requestedKey &&
      this.data.usernameClaims[requestedKey] &&
      this.data.usernameClaims[requestedKey] !== userId;
    const clarkBlocked =
      requestedKey === "clark" && this.data.usernameClaims.clark !== userId;
    const user = {
      id: userId,
      username: claimedByOther || clarkBlocked ? fallbackName : requested,
      age: msg.age === undefined ? existing.age : Number(msg.age),
      deviceId: msg.deviceId ?? existing.deviceId,
      rating: Number.isFinite(existing.rating) ? existing.rating : 1000,
      xp: Math.max(0, Number(existing.xp) || 0),
      online: true,
      claimedUsername: existing.claimedUsername ?? null,
      createdAt: existing.createdAt ?? nowIso(),
      updatedAt: nowIso(),
      badge: existing.badge || "",
      role: existing.role || "player",
      moderator: Boolean(existing.moderator || existing.role === "moderator"),
    };
    const sessionToken = restoredSession ? token : crypto.randomUUID();
    this.data.users[userId] = user;
    this.data.sessions[sessionToken] = {
      token: sessionToken,
      userId,
      deviceId: msg.deviceId ?? existing.deviceId ?? "",
      createdAt: restoredSession?.createdAt ?? nowIso(),
      lastSeenAt: nowIso(),
    };
    session.user = user;
    session.sessionToken = sessionToken;
    return { user, sessionToken, restored: Boolean(restoredUser) };
  }

  async handleAccountAuth(session, msg) {
    if (!this.checkRate(session, "auth", 8, 60_000)) {
      return { ok: false, error: "rate_limited" };
    }
    const username = normalizeUsername(msg.username, "");
    const key = claimKey(username);
    if (!key || username.length < 2)
      return { ok: false, error: "invalid_username" };
    const ownerId = this.data.usernameClaims[key];
    const existing = ownerId ? this.data.users[ownerId] : null;
    if (
      key === "clark" &&
      (!existing || existing.id !== "seed-clark") &&
      (!usableSecret(this.env.CLARK_RESERVATION_TOKEN) ||
        msg.turnstileToken !== usableSecret(this.env.CLARK_RESERVATION_TOKEN))
    ) {
      return { ok: false, error: "username_reserved" };
    }
    const mode = msg.mode ?? "auto";
    if (!existing && mode === "signin")
      return { ok: false, error: "account_not_found" };
    if (existing && !existing.passwordHash)
      return { ok: false, error: "account_requires_upgrade" };
    const ban = existing
      ? this.activeBanForUser(existing.id, msg.deviceId ?? existing.deviceId)
      : this.activeBanForUser("", msg.deviceId ?? "");
    if (ban) return { ok: false, error: "account_banned", until: ban.until };

    let user = existing;
    let restored = false;
    if (existing) {
      const passwordHash = await hashPassword(
        msg.password,
        existing.passwordSalt,
      );
      if (passwordHash !== existing.passwordHash) {
        return { ok: false, error: "invalid_credentials" };
      }
      restored = true;
      user = {
        ...existing,
        username: existing.username || username,
        age: Number(msg.age),
        deviceId: msg.deviceId ?? existing.deviceId ?? "",
        online: true,
        updatedAt: nowIso(),
      };
    } else {
      const salt = randomHex(16);
      user = {
        id: crypto.randomUUID(),
        username,
        age: Number(msg.age),
        deviceId: msg.deviceId ?? "",
        rating: 1000,
        xp: 0,
        online: true,
        claimedUsername: username,
        authProvider: "password",
        passwordSalt: salt,
        passwordHash: await hashPassword(msg.password, salt),
        badge: "",
        role: "player",
        moderator: false,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
    }
    const sessionToken = crypto.randomUUID();
    this.data.users[user.id] = user;
    this.data.usernameClaims[key] = user.id;
    this.data.sessions[sessionToken] = {
      token: sessionToken,
      userId: user.id,
      deviceId: msg.deviceId ?? user.deviceId ?? "",
      account: true,
      createdAt: nowIso(),
      lastSeenAt: nowIso(),
    };
    session.user = user;
    session.sessionToken = sessionToken;
    return { ok: true, user, sessionToken, restored };
  }

  claimUsername(session, msg) {
    const username = normalizeUsername(msg.username, "");
    const key = claimKey(username);
    if (!key) return { ok: false, error: "invalid_username" };
    if (
      key === "clark" &&
      (!usableSecret(this.env.CLARK_RESERVATION_TOKEN) ||
        msg.turnstileToken !== usableSecret(this.env.CLARK_RESERVATION_TOKEN))
    ) {
      return { ok: false, error: "username_reserved" };
    }
    const existingOwner = this.data.usernameClaims[key];
    if (existingOwner && existingOwner !== session.user.id) {
      return { ok: false, error: "username_taken" };
    }
    if (
      session.user.claimedUsername &&
      claimKey(session.user.claimedUsername) !== key
    ) {
      delete this.data.usernameClaims[claimKey(session.user.claimedUsername)];
    }
    session.user.username = username;
    session.user.claimedUsername = username;
    session.user.updatedAt = nowIso();
    this.data.users[session.user.id] = session.user;
    this.data.usernameClaims[key] = session.user.id;
    return { ok: true, username };
  }

  async onMessage(id, raw) {
    await this.ready;
    const session = this.sessions.get(id);
    if (!session) return;
    const parsed = validateClientMessage(raw);
    if (!parsed.ok)
      return send(session.ws, { type: "error", error: parsed.error });
    const msg = parsed.data;
    if (!this.checkRate(session, "protocol", 60, 10_000)) {
      return send(session.ws, { type: "error", error: "rate_limited" });
    }
    if (msg.type === "ping") {
      send(session.ws, { type: "pong", at: msg.at ?? msg.t ?? Date.now() });
      return;
    }
    if (msg.type === "auth.guest" || msg.type === "reconnect") {
      if (msg.type === "reconnect") {
        if (!this.data.sessions[msg.sessionToken]) {
          return send(session.ws, { type: "error", error: "session_expired" });
        }
        msg.username = session.user.username;
        msg.deviceId = session.user.deviceId ?? "";
      }
      const auth = this.createOrRestoreUser(session, msg);
      const ban = this.activeBanForUser(auth.user.id, auth.user.deviceId);
      if (ban) {
        await this.persist();
        send(session.ws, {
          type: "error",
          error: "account_banned",
          until: ban.until,
        });
        session.ws.close(4003, "banned");
        return;
      }
      await this.persist();
      await writeUserSessionToD1(
        this.env,
        auth.user,
        auth.sessionToken,
        this.data.sessions[auth.sessionToken],
      ).catch(() => false);
      send(session.ws, {
        type: msg.type === "reconnect" ? "reconnect.ok" : "auth.ok",
        user: publicUser(auth.user),
        sessionToken: auth.sessionToken,
        restored: auth.restored,
        save: this.data.saves[auth.user.id] ?? null,
      });
      send(session.ws, this.profileSnapshot(session));
      send(session.ws, this.friendsSnapshot(session));
      send(session.ws, this.chatHistoryPayload(session));
      return;
    }
    if (msg.type === "auth.account") {
      const auth = await this.handleAccountAuth(session, msg);
      if (!auth.ok)
        return send(session.ws, {
          type: "error",
          error: auth.error,
          until: auth.until || null,
        });
      await this.persist();
      await writeUserSessionToD1(
        this.env,
        auth.user,
        auth.sessionToken,
        this.data.sessions[auth.sessionToken],
      ).catch(() => false);
      send(session.ws, {
        type: "auth.ok",
        user: publicUser(auth.user),
        sessionToken: auth.sessionToken,
        restored: auth.restored,
        save: this.data.saves[auth.user.id] ?? null,
      });
      send(session.ws, this.profileSnapshot(session));
      send(session.ws, this.friendsSnapshot(session));
      send(session.ws, this.chatHistoryPayload(session));
      if (session.inRoom) this.broadcast(this.roomSnapshot());
      return;
    }
    if (msg.type === "profile.claimUsername") {
      const result = this.claimUsername(session, msg);
      if (!result.ok)
        return send(session.ws, { type: "error", error: result.error });
      await this.persist();
      await writeUserSessionToD1(
        this.env,
        session.user,
        session.sessionToken,
        this.data.sessions[session.sessionToken],
      ).catch(() => false);
      send(session.ws, {
        type: "profile.usernameClaimed",
        username: result.username,
        user: publicUser(session.user),
      });
      send(session.ws, this.profileSnapshot(session));
      send(session.ws, {
        type: "leaderboard.snapshot",
        leaderboard: this.leaderboardSnapshot("casual"),
      });
      if (session.inRoom) this.broadcast(this.roomSnapshot());
      return;
    }
    if (msg.type === "profile.get") {
      send(session.ws, this.profileSnapshot(session));
      return;
    }
    if (msg.type === "profile.logout") {
      await this.handleProfileLogout(session);
      return;
    }
    if (msg.type === "profile.delete") {
      await this.handleProfileDelete(id, session, msg);
      return;
    }
    if (msg.type === "room.create" || msg.type === "queue.join") {
      const roomOptions = normalizeRoomOptions(msg);
      session.inRoom = true;
      this.room.code = (this.room.code || makePrivateCode()).toUpperCase();
      this.room.mode = roomOptions.mode;
      this.room.playlist = roomOptions.playlist;
      this.room.size = roomOptions.size;
      this.room.teamSize = roomOptions.teamSize;
      this.room.ranked = roomOptions.ranked;
      this.room.botFill = roomOptions.botFill;
      await this.persist();
      await writeRoomMemberToD1(this.env, this.room, session.user).catch(
        () => false,
      );
      if (msg.type === "queue.join") {
        send(session.ws, {
          type: "queue.joined",
          playlist: this.room.playlist,
          teamSize: this.room.teamSize,
          ranked: this.room.ranked,
          botFill: this.room.botFill,
        });
      }
      this.broadcast(this.roomSnapshot());
      send(session.ws, this.chatHistoryPayload(session));
      return;
    }
    if (msg.type === "room.join") {
      session.inRoom = true;
      this.room.code = String(msg.code || this.room.code).toUpperCase();
      await this.persist();
      await writeRoomMemberToD1(this.env, this.room, session.user).catch(
        () => false,
      );
      this.broadcast(this.roomSnapshot());
      send(session.ws, this.chatHistoryPayload(session));
      return;
    }
    if (msg.type === "room.leave" || msg.type === "queue.cancel") {
      session.inRoom = false;
      await writeRoomMemberToD1(this.env, this.room, session.user, true).catch(
        () => false,
      );
      send(session.ws, { type: "room.left" });
      this.broadcast(this.roomSnapshot());
      return;
    }
    if (msg.type === "chat.send" || msg.type === "quick.send") {
      this.handleChat(id, msg);
      return;
    }
    if (msg.type === "input.frame") {
      session.latestInput = {
        tick: Number(msg.tick ?? msg.seq ?? 0),
        x: Number(msg.x ?? msg.client?.x ?? 0),
        z: Number(msg.z ?? msg.client?.z ?? 0),
        speed: Number(msg.speed ?? msg.client?.speed ?? 0),
        at: Date.now(),
      };
      send(session.ws, {
        type: "input.accepted",
        tick: session.latestInput.tick,
      });
      this.broadcast(this.matchSnapshot(), id);
      return;
    }
    if (msg.type === "leaderboard.get") {
      send(session.ws, {
        type: "leaderboard.snapshot",
        leaderboard: this.leaderboardSnapshot(msg.playlist),
      });
      return;
    }
    if (msg.type === "save.sync") {
      await this.handleSaveSync(session, msg);
      return;
    }
    if (msg.type === "friend.request") {
      await this.handleFriendRequest(session, msg);
      return;
    }
    if (msg.type === "friend.accept") {
      await this.handleFriendAccept(session, msg);
      return;
    }
    if (msg.type === "friend.block") {
      await this.handleFriendBlock(session, msg);
      return;
    }
    if (msg.type === "friend.report") {
      await this.handleFriendReport(session, msg);
      return;
    }
    if (msg.type === "friend.list") {
      send(session.ws, this.friendsSnapshot(session));
      return;
    }
    if (msg.type === "feedback.submit") {
      await this.handleFeedbackSubmit(session, msg);
      return;
    }
    if (msg.type === "moderation.kick") {
      await this.handleModerationAction(session, msg, "kick");
      return;
    }
    if (msg.type === "moderation.ban") {
      await this.handleModerationAction(session, msg, "ban");
    }
  }

  handleChat(id, msg) {
    const session = this.sessions.get(id);
    if (!this.checkRate(session, "chat", 5, 5000)) {
      send(session.ws, { type: "error", error: "rate_limited" });
      return;
    }
    if (
      msg.type === "chat.send" &&
      (!Number.isInteger(session.user.age) || session.user.age < 13)
    ) {
      send(session.ws, { type: "error", error: "chat_requires_13_plus" });
      return;
    }
    const text =
      msg.type === "quick.send" && QUICK_CHAT.has(msg.text)
        ? msg.text
        : sanitizeChat(msg.text);
    if (!text || text === "[blocked]") {
      send(session.ws, { type: "error", error: "message_blocked" });
      return;
    }
    const channel = this.chatChannelForSession(session);
    const payload = {
      type: "chat.message",
      from: session.user.username,
      userId: session.user.id,
      badge: session.user.badge || "",
      moderator: this.isModeratorUser(session.user),
      text,
      quick: msg.type === "quick.send",
      at: nowIso(),
      channel,
    };
    this.pruneChatMessages();
    const chatRow = {
      id: crypto.randomUUID(),
      channel,
      from: payload.from,
      userId: payload.userId,
      badge: payload.badge,
      moderator: payload.moderator,
      text: payload.text,
      quick: payload.quick,
      createdAt: payload.at,
    };
    this.data.chatMessages.push(chatRow);
    writeChatMessageToD1(this.env, chatRow).catch(() => {});
    this.persist().catch(() => {});
    this.broadcast(payload, "", session.user.id, {
      roomOnly: session.inRoom,
      channel,
    });
  }

  async handleSaveSync(session, msg) {
    if (!this.checkRate(session, "save", 12, 60_000))
      return send(session.ws, { type: "error", error: "rate_limited" });
    const saveXp = extractSaveXp(msg.payload);
    const totalXp = Math.max(saveXp, Number(session.user.xp) || 0);
    session.user.xp = totalXp;
    session.user.rating = totalXp;
    session.user.updatedAt = nowIso();
    this.data.users[session.user.id] = session.user;
    this.data.leaderboard = [
      {
        id: `xp-${session.user.id}`,
        userId: session.user.id,
        username: session.user.username,
        badge: session.user.badge || "",
        moderator: this.isModeratorUser(session.user),
        xp: totalXp,
        totalXp,
        score: totalXp,
        rating: totalXp,
        playlist: "all modes",
        scope: "Total XP",
        source: "server",
        updatedAt: nowIso(),
      },
      ...this.data.leaderboard.filter(
        (row) =>
          row.id !== `xp-${session.user.id}` && row.userId !== session.user.id,
      ),
    ].sort(compareLeaderboard);
    const row = {
      userId: session.user.id,
      schemaVersion: Number(msg.schemaVersion),
      payload: msg.payload,
      serverUpdatedAt: nowIso(),
    };
    this.data.saves[session.user.id] = row;
    await writeSaveAndLeaderboardToD1(
      this.env,
      session.user,
      row,
      totalXp,
    ).catch(() => false);
    await this.persist();
    send(session.ws, {
      type: "save.synced",
      schemaVersion: row.schemaVersion,
      payload: row.payload,
      serverUpdatedAt: row.serverUpdatedAt,
    });
    send(session.ws, {
      type: "leaderboard.snapshot",
      leaderboard: this.leaderboardSnapshot("casual"),
    });
    send(session.ws, this.profileSnapshot(session));
  }

  async handleModerationAction(session, msg, action) {
    if (!this.checkRate(session, "moderation", 10, 60_000)) {
      return send(session.ws, { type: "error", error: "rate_limited" });
    }
    if (!this.isModeratorUser(session.user)) {
      return send(session.ws, { type: "error", error: "moderator_required" });
    }
    const target =
      (msg.userId && this.data.users[msg.userId]) ||
      this.findUserByUsername(msg.username || "");
    if (!target) {
      return send(session.ws, { type: "error", error: "player_not_found" });
    }
    if (target.id === session.user.id) {
      return send(session.ws, {
        type: "error",
        error: "moderation_self_rejected",
      });
    }
    const reason = sanitizeChat(msg.reason || "Moderator action");
    const record = {
      id: crypto.randomUUID(),
      action,
      moderatorUserId: session.user.id,
      moderatorUsername: session.user.username,
      targetUserId: target.id,
      targetUsername: target.username,
      reason: reason === "[blocked]" ? "Moderator action" : reason,
      createdAt: nowIso(),
    };
    if (action === "ban") {
      record.until = new Date(Date.now() + BAN_DURATION_MS).toISOString();
      const banRecord = {
        userId: target.id,
        username: target.username,
        until: record.until,
        byUserId: session.user.id,
        reason: record.reason,
        createdAt: record.createdAt,
      };
      this.data.bans[target.id] = banRecord;
      if (target.deviceId) {
        this.data.bans[`device:${target.deviceId}`] = {
          ...banRecord,
          userId: `device:${target.deviceId}`,
        };
      }
    }
    this.data.moderationLogs.push(record);
    await writeModerationToD1(this.env, record).catch(() => false);
    await this.persist();
    for (const [targetId, targetSession] of this.sessions.entries()) {
      if (targetSession.user?.id !== target.id) continue;
      targetSession.inRoom = false;
      if (targetSession.sessionToken) {
        delete this.data.sessions[targetSession.sessionToken];
        await deleteSessionFromD1(this.env, targetSession.sessionToken).catch(
          () => false,
        );
      }
      send(targetSession.ws, {
        type: action === "ban" ? "moderation.banned" : "moderation.kicked",
        username: target.username,
        until: record.until || null,
        reason: record.reason,
      });
      targetSession.ws.close(action === "ban" ? 4003 : 4002, action);
      this.sessions.delete(targetId);
    }
    await this.persist();
    send(session.ws, {
      type: "moderation.done",
      action,
      username: target.username,
      userId: target.id,
      until: record.until || null,
    });
    this.broadcast(this.roomSnapshot());
  }

  async handleFriendRequest(session, msg) {
    if (!this.checkRate(session, "social", 10, 60_000))
      return send(session.ws, { type: "error", error: "rate_limited" });
    const username = normalizeUsername(msg.username, "");
    const target = this.findUserByUsername(username);
    if (target?.id === session.user.id)
      return send(session.ws, { type: "error", error: "friend_self_rejected" });
    const request = {
      id: crypto.randomUUID(),
      fromUserId: session.user.id,
      fromUsername: session.user.username,
      toUserId: target?.id ?? "",
      toUsername: username,
      status: "pending",
      createdAt: nowIso(),
    };
    this.data.friendRequests[request.id] = request;
    await writeFriendRequestToD1(this.env, request).catch(() => false);
    await this.persist();
    send(session.ws, {
      type: "friend.requested",
      requestId: request.id,
      username,
      status: "pending",
    });
    send(session.ws, this.friendsSnapshot(session));
    if (target) {
      const targetSession = this.clientByUserId(target.id);
      if (targetSession)
        send(targetSession.ws, this.friendsSnapshot(targetSession));
    }
  }

  async handleFriendAccept(session, msg) {
    if (!this.checkRate(session, "social", 10, 60_000))
      return send(session.ws, { type: "error", error: "rate_limited" });
    const request = this.data.friendRequests[msg.requestId];
    if (
      !request ||
      request.status !== "pending" ||
      request.toUserId !== session.user.id
    ) {
      return send(session.ws, {
        type: "error",
        error: "friend_request_not_found",
      });
    }
    request.status = "accepted";
    request.respondedAt = nowIso();
    this.ensureFriendState(session.user.id).friends[request.fromUserId] = {
      since: request.respondedAt,
    };
    this.ensureFriendState(request.fromUserId).friends[session.user.id] = {
      since: request.respondedAt,
    };
    await Promise.all([
      writeFriendRequestToD1(this.env, request),
      writeFriendPairToD1(
        this.env,
        session.user.id,
        request.fromUserId,
        request.respondedAt,
      ),
      writeFriendPairToD1(
        this.env,
        request.fromUserId,
        session.user.id,
        request.respondedAt,
      ),
    ]).catch(() => false);
    await this.persist();
    send(session.ws, {
      type: "friend.accepted",
      requestId: request.id,
      username: request.fromUsername,
    });
    send(session.ws, this.friendsSnapshot(session));
    const sourceSession = this.clientByUserId(request.fromUserId);
    if (sourceSession)
      send(sourceSession.ws, this.friendsSnapshot(sourceSession));
  }

  async handleFriendBlock(session, msg) {
    if (!this.checkRate(session, "social", 10, 60_000))
      return send(session.ws, { type: "error", error: "rate_limited" });
    const username = normalizeUsername(msg.username, "");
    const target = this.findUserByUsername(username);
    const state = this.ensureFriendState(session.user.id);
    if (target) {
      state.blocked[target.id] = {
        username: target.username,
        createdAt: nowIso(),
      };
      delete state.friends[target.id];
      const targetState = this.ensureFriendState(target.id);
      delete targetState.friends[session.user.id];
    } else {
      state.blockedUsernames[username] = { createdAt: nowIso() };
    }
    await writeBlockToD1(this.env, session.user.id, target, username).catch(
      () => false,
    );
    await this.persist();
    send(session.ws, {
      type: "friend.blocked",
      username,
      userId: target?.id ?? "",
    });
    send(session.ws, this.friendsSnapshot(session));
  }

  async handleFriendReport(session, msg) {
    if (!this.checkRate(session, "report", 3, 60_000))
      return send(session.ws, { type: "error", error: "rate_limited" });
    const username = normalizeUsername(msg.username, "");
    const reason = sanitizeChat(msg.reason);
    if (!username || reason === "[blocked]")
      return send(session.ws, { type: "error", error: "report_rejected" });
    const target = this.findUserByUsername(username);
    const report = {
      id: crypto.randomUUID(),
      reporterUserId: session.user.id,
      reporterUsername: session.user.username,
      targetUserId: target?.id ?? "",
      targetUsername: username,
      reason,
      createdAt: nowIso(),
    };
    this.data.reports.push(report);
    await writeReportToD1(this.env, report).catch(() => false);
    await this.persist();
    send(session.ws, {
      type: "friend.reported",
      reportId: report.id,
      username,
    });
  }

  async handleFeedbackSubmit(session, msg) {
    if (!this.checkRate(session, "feedback", 3, 60_000))
      return send(session.ws, { type: "error", error: "rate_limited" });
    const result = buildFeedbackRow(msg, session.user);
    if (!result.ok)
      return send(session.ws, { type: "error", error: result.error });
    this.data.feedback.push(result.row);
    let d1Stored = false;
    try {
      d1Stored = await writeFeedbackToD1(this.env, result.row);
    } catch {
      d1Stored = false;
    }
    await this.persist();
    let delivery = "stored";
    try {
      delivery = await deliverFeedback(result.row, this.env);
    } catch {
      delivery = "stored";
    }
    send(session.ws, {
      type: "feedback.received",
      feedbackId: result.row.id,
      delivery,
      d1Stored,
    });
  }

  onClose(id) {
    const session = this.sessions.get(id);
    const wasInRoom = Boolean(session?.inRoom);
    if (session?.user?.id && this.data.users[session.user.id]) {
      this.data.users[session.user.id].online = false;
      this.data.users[session.user.id].updatedAt = nowIso();
      this.persist().catch(() => {});
    }
    this.sessions.delete(id);
    if (wasInRoom) this.broadcast(this.roomSnapshot());
  }

  broadcast(payload, exceptId = "", fromUserId = "", options = {}) {
    for (const [id, session] of this.sessions) {
      if (id === exceptId) continue;
      if (options.roomOnly && !session.inRoom) continue;
      if (fromUserId && this.isBlockedBetween(fromUserId, session.user.id))
        continue;
      send(session.ws, payload);
    }
  }

  leaderboardSnapshot(playlist = "") {
    const rows = Array.isArray(this.data.leaderboard)
      ? this.data.leaderboard
      : DEFAULT_LEADERBOARD;
    return (rows.length ? rows : DEFAULT_LEADERBOARD)
      .map((row) => {
        const user = row.userId ? this.data.users[row.userId] : null;
        const xp = getLeaderboardXp(row);
        return {
          id:
            row.id ?? `server-${claimKey(row.username) || crypto.randomUUID()}`,
          userId: row.userId ?? user?.id ?? "",
          username: normalizeUsername(row.username, "Driver"),
          xp,
          totalXp: xp,
          rating: xp,
          score: xp,
          badge: row.badge || user?.badge || "",
          moderator: Boolean(row.moderator || this.isModeratorUser(user)),
          playlist: "all modes",
          requestedPlaylist: playlist || "all",
          scope: "Total XP",
          source: "server",
        };
      })
      .sort(compareLeaderboard)
      .slice(0, 10);
  }

  botPlayers() {
    if (!this.room.botFill) return [];
    const activePlayers = [...this.sessions.values()].filter(
      (session) => session.inRoom,
    ).length;
    return BOT_NAMES.slice(0, Math.max(0, this.room.size - activePlayers)).map(
      (name, index) => ({
        id: `bot-${this.room.id}-${index + 1}`,
        username: name,
        rating: 900 + index * 25,
        badge: "BOT",
        bot: true,
      }),
    );
  }

  roomSnapshot() {
    const players = [...this.sessions.values()]
      .filter((session) => session.inRoom)
      .map((session) => publicUser(session.user));
    const bots = this.botPlayers();
    return {
      type: "room.snapshot",
      room: {
        ...this.room,
        players,
        bots: bots.length,
        botPlayers: bots,
        leaderboard: this.leaderboardSnapshot(this.room.playlist),
      },
    };
  }

  matchSnapshot() {
    return {
      type: "match.snapshot",
      players: [...this.sessions.values()]
        .filter((session) => session.inRoom)
        .map((session) => ({
          id: session.user.id,
          username: session.user.username,
          badge: session.user.badge || "",
          moderator: this.isModeratorUser(session.user),
          input: session.latestInput,
        })),
    };
  }

  friendsSnapshot(session) {
    const state = this.ensureFriendState(session.user.id);
    const pending = Object.values(this.data.friendRequests).filter(
      (request) => request.status === "pending",
    );
    return {
      type: "friends.snapshot",
      friends: Object.keys(state.friends)
        .map((userId) => publicUser(this.data.users[userId]))
        .filter(Boolean),
      incomingRequests: pending.filter(
        (request) => request.toUserId === session.user.id,
      ),
      outgoingRequests: pending.filter(
        (request) => request.fromUserId === session.user.id,
      ),
      blocked: [
        ...Object.keys(state.blocked)
          .map((userId) => publicUser(this.data.users[userId]))
          .filter(Boolean),
        ...Object.keys(state.blockedUsernames).map((username) => ({
          username,
        })),
      ],
      recentPlayers: [...this.sessions.values()]
        .map((peer) => publicUser(peer.user))
        .filter((user) => user && user.id !== session.user.id),
    };
  }

  profileSnapshot(session) {
    return {
      type: "profile.snapshot",
      user: publicUser(session.user),
      profileMode:
        session.user?.authProvider === "password" ? "account" : "guest",
      sessionActive: Boolean(session.sessionToken),
      save: this.data.saves[session.user.id] ?? null,
      leaderboardRow:
        this.data.leaderboard.find((row) => row.userId === session.user.id) ??
        null,
      restrictions: {
        banned: Boolean(
          this.activeBanForUser(session.user.id, session.user.deviceId),
        ),
        ban: this.activeBanForUser(session.user.id, session.user.deviceId),
      },
    };
  }

  async handleProfileLogout(session) {
    if (session.sessionToken) delete this.data.sessions[session.sessionToken];
    await deleteSessionFromD1(this.env, session.sessionToken).catch(
      () => false,
    );
    if (session.user?.id && this.data.users[session.user.id]) {
      this.data.users[session.user.id].online = false;
      this.data.users[session.user.id].updatedAt = nowIso();
    }
    await this.persist();
    send(session.ws, { type: "profile.loggedOut" });
  }

  anonymizeUserRecords(userId, username) {
    const anonymousName = "Deleted Player";
    for (const request of Object.values(this.data.friendRequests)) {
      if (request.fromUserId === userId) request.fromUsername = anonymousName;
      if (request.toUserId === userId) request.toUsername = anonymousName;
    }
    for (const report of this.data.reports) {
      if (report.reporterUserId === userId)
        report.reporterUsername = anonymousName;
      if (report.targetUserId === userId) report.targetUsername = anonymousName;
    }
    for (const log of this.data.moderationLogs) {
      if (log.moderatorUserId === userId) log.moderatorUsername = anonymousName;
      if (log.targetUserId === userId) log.targetUsername = anonymousName;
    }
    for (const message of this.data.chatMessages) {
      if (message.userId === userId) message.from = anonymousName;
    }
    this.data.accountDeletions.push({
      id: crypto.randomUUID(),
      userId,
      usernameKey: claimKey(username),
      deletedAt: nowIso(),
    });
  }

  async handleProfileDelete(id, session, msg) {
    const user = session.user;
    if (claimKey(msg.confirmUsername) !== claimKey(user.username)) {
      return send(session.ws, {
        type: "error",
        error: "profile_delete_confirmation_mismatch",
      });
    }
    if (user.claimedUsername)
      delete this.data.usernameClaims[claimKey(user.claimedUsername)];
    delete this.data.usernameClaims[claimKey(user.username)];
    delete this.data.saves[user.id];
    delete this.data.users[user.id];
    delete this.data.friends[user.id];
    delete this.data.bans[user.id];
    this.data.leaderboard = this.data.leaderboard.filter(
      (row) => row.userId !== user.id,
    );
    for (const state of Object.values(this.data.friends)) {
      delete state.friends?.[user.id];
      delete state.blocked?.[user.id];
    }
    for (const [token, savedSession] of Object.entries(this.data.sessions)) {
      if (savedSession?.userId === user.id) delete this.data.sessions[token];
    }
    await deleteSessionsForUserFromD1(this.env, user.id).catch(() => false);
    this.anonymizeUserRecords(user.id, user.username);
    await deleteUserFromD1(this.env, user).catch(() => false);
    await this.persist();
    send(session.ws, { type: "profile.deleted", username: user.username });
    for (const [peerId, peer] of this.sessions.entries()) {
      if (peer.user?.id !== user.id) continue;
      peer.inRoom = false;
      send(peer.ws, { type: "session.revoked", reason: "profile_deleted" });
      peer.ws.close(4001, "profile_deleted");
      this.sessions.delete(peerId);
    }
    if (session.inRoom) this.broadcast(this.roomSnapshot());
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "GET,POST,OPTIONS",
          "access-control-allow-headers": "content-type",
        },
      });
    }
    if (url.pathname === "/health") {
      return json({
        ok: true,
        server: "InfernoDrift4 Worker",
        durableObjects: true,
        optionalBindings: {
          d1: Boolean(env.INFERNO_DB),
          resend: hasResendConfig(env),
        },
      });
    }
    if (url.pathname === "/api/feedback" && request.method === "POST") {
      try {
        const payload = await request.json();
        const result = buildFeedbackRow(payload);
        if (!result.ok)
          return json({ ok: false, error: result.error }, { status: 400 });
        let d1Stored = false;
        try {
          d1Stored = await writeFeedbackToD1(env, result.row);
        } catch {
          d1Stored = false;
        }
        const roomName = `feedback-${new Date().toISOString().slice(0, 10)}`;
        const stub = env.INFERNO_ROOM.get(
          env.INFERNO_ROOM.idFromName(roomName),
        );
        await stub.fetch(
          new Request(`https://infernodrift4.local/feedback-store`, {
            method: "POST",
            body: JSON.stringify(result.row),
          }),
        );
        let delivery = "stored";
        try {
          delivery = await deliverFeedback(result.row, env);
        } catch {
          delivery = "stored";
        }
        return json({
          ok: true,
          feedbackId: result.row.id,
          delivery,
          d1Stored,
          emailConfigured: delivery === "delivered",
        });
      } catch {
        return json({ ok: false, error: "invalid_feedback" }, { status: 400 });
      }
    }
    if (url.pathname === "/ws") {
      const roomName =
        url.searchParams.get("room") ||
        url.searchParams.get("code") ||
        `queue-${url.searchParams.get("playlist") || "casual"}`;
      const stub = env.INFERNO_ROOM.get(env.INFERNO_ROOM.idFromName(roomName));
      return stub.fetch(request);
    }
    return json({
      ok: true,
      server: "InfernoDrift4 Worker",
      endpoints: ["/health", "/ws?room=PRIVATE1"],
    });
  },
};
