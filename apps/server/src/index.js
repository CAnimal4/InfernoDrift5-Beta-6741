import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { randomUUID, webcrypto } from "node:crypto";
import { fileURLToPath } from "node:url";
import { WebSocketServer } from "ws";
import {
  QUICK_CHAT,
  makePrivateCode,
  normalizeRoomOptions,
  normalizeUsername,
  sanitizeChat,
  validateClientMessage,
} from "../../worker/src/protocol.js";

export { sanitizeChat, validateClientMessage };

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
    id: "seed-billy",
    username: "Billy",
    badge: "Advanced Player 2.0",
    role: "player",
    xp: 6100,
    passwordSalt: "seed-billy-v1",
    passwordHash:
      "aef6bd6fe7a081f2ff1ecac7d743d10f621ac0bd1d9b704f07d26668c630a927",
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
const CHAT_HISTORY_WINDOW_MS = 30 * 60 * 1000;
const CHAT_HISTORY_LIMIT = 100;
const FOUNDER_USERNAME = "Clark";
const FOUNDER_FRIEND_XP_REWARD = 1000;
const DAILY_GIFT_MIN_XP = 100;
const DAILY_GIFT_MAX_XP = 1000;
const DAILY_GIFT_STEP_XP = 25;
const FEEDBACK_MESSAGE_LIMIT = 2500;
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

function nowIso() {
  return new Date().toISOString();
}

const cryptoRuntime = globalThis.crypto ?? webcrypto;
const textEncoder = new TextEncoder();
const PASSWORD_HASH_ITERATIONS = 100000;

function bytesToHex(bytes) {
  return [...new Uint8Array(bytes)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function randomHex(byteLength = 16) {
  const bytes = new Uint8Array(byteLength);
  cryptoRuntime.getRandomValues(bytes);
  return bytesToHex(bytes);
}

async function hashPassword(password, salt) {
  const key = await cryptoRuntime.subtle.importKey(
    "raw",
    textEncoder.encode(String(password)),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await cryptoRuntime.subtle.deriveBits(
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

function loadLocalEnvFile(file = ".env") {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const equals = trimmed.indexOf("=");
    if (equals <= 0) continue;
    const key = trimmed.slice(0, equals).trim();
    const value = trimmed
      .slice(equals + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");
    if (/^[A-Z0-9_]+$/i.test(key) && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function emptyDb() {
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

function seedSystemAccounts(db) {
  for (const account of SEEDED_ACCOUNTS) {
    const key = claimKey(account.username);
    const claimedId = db.usernameClaims[key];
    const id = claimedId && db.users[claimedId] ? claimedId : account.id;
    const existing = db.users[id] ?? {};
    const xp = Math.max(Number(existing.xp) || 0, account.xp);
    db.users[id] = {
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
      founderFriendXpClaimed: Boolean(existing.founderFriendXpClaimed),
      deviceId: existing.deviceId ?? "",
      createdAt: existing.createdAt ?? nowIso(),
      updatedAt: existing.updatedAt ?? nowIso(),
    };
    db.usernameClaims[key] = id;
    db.leaderboard = [
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
        updatedAt: db.users[id].updatedAt,
      },
      ...db.leaderboard.filter(
        (row) => row.id !== `seed-xp-${id}` && row.userId !== id,
      ),
    ];
  }
  db.leaderboard = db.leaderboard.sort(compareLeaderboard);
}

function normalizeDbShape(data) {
  const db = {
    ...emptyDb(),
    ...(data && typeof data === "object" ? data : {}),
  };
  db.users =
    db.users && typeof db.users === "object" && !Array.isArray(db.users)
      ? db.users
      : {};
  db.sessions =
    db.sessions &&
    typeof db.sessions === "object" &&
    !Array.isArray(db.sessions)
      ? db.sessions
      : {};
  db.usernameClaims =
    db.usernameClaims &&
    typeof db.usernameClaims === "object" &&
    !Array.isArray(db.usernameClaims)
      ? db.usernameClaims
      : {};
  db.saves =
    db.saves && typeof db.saves === "object" && !Array.isArray(db.saves)
      ? db.saves
      : {};
  db.friends =
    db.friends && typeof db.friends === "object" && !Array.isArray(db.friends)
      ? db.friends
      : {};
  db.friendRequests =
    db.friendRequests &&
    typeof db.friendRequests === "object" &&
    !Array.isArray(db.friendRequests)
      ? db.friendRequests
      : {};
  db.reports = Array.isArray(db.reports) ? db.reports : [];
  db.moderationLogs = Array.isArray(db.moderationLogs) ? db.moderationLogs : [];
  db.bans =
    db.bans && typeof db.bans === "object" && !Array.isArray(db.bans)
      ? db.bans
      : {};
  db.feedback = Array.isArray(db.feedback) ? db.feedback : [];
  db.chatMessages = Array.isArray(db.chatMessages) ? db.chatMessages : [];
  db.accountDeletions = Array.isArray(db.accountDeletions)
    ? db.accountDeletions
    : [];
  db.leaderboard =
    Array.isArray(db.leaderboard) && db.leaderboard.length
      ? db.leaderboard
      : DEFAULT_LEADERBOARD;
  seedSystemAccounts(db);
  ensureAllAccountLeaderboardRows(db);
  return db;
}

function loadDb(dataDir) {
  fs.mkdirSync(dataDir, { recursive: true });
  const file = path.join(dataDir, "infernodrift4-db.json");
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(emptyDb(), null, 2));
  }
  const db = {
    file,
    data: normalizeDbShape(JSON.parse(fs.readFileSync(file, "utf8"))),
    save() {
      fs.writeFileSync(file, JSON.stringify(this.data, null, 2));
    },
  };
  db.save();
  return db;
}

function claimKey(username) {
  return normalizeUsername(username, "").trim().toLowerCase();
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

function makeCode() {
  return makePrivateCode();
}

function compareLeaderboard(a, b) {
  return getLeaderboardXp(b) - getLeaderboardXp(a);
}

function isLeaderboardEligibleUser(user) {
  return Boolean(
    user?.id &&
    user?.username &&
    (user.authProvider === "password" || user.account === true),
  );
}

function getLeaderboardXp(row) {
  return Math.max(
    0,
    Math.floor(
      Number(row?.xp ?? row?.totalXp ?? row?.score ?? row?.rating) || 0,
    ),
  );
}

function getLeaderboardRowForUser(data, user) {
  if (!user) return null;
  const usernameKey = claimKey(user.username);
  return (
    (Array.isArray(data.leaderboard) ? data.leaderboard : []).find(
      (row) =>
        (user.id && row.userId === user.id) ||
        (usernameKey && claimKey(row.username) === usernameKey),
    ) ?? null
  );
}

function progressionLevelForXp(totalXp) {
  return Math.max(1, Math.floor(Math.max(0, Number(totalXp) || 0) / 500) + 1);
}

function makeDailySeed(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function randomUnit() {
  const bytes = new Uint32Array(1);
  cryptoRuntime.getRandomValues(bytes);
  return bytes[0] / 4294967296;
}

function pickSteppedReward(min, max, step, unit) {
  const steps = Math.max(0, Math.floor((max - min) / step));
  return min + Math.round(Math.min(0.999999, Math.max(0, unit)) * steps) * step;
}

function rollDailyGiftAmount() {
  const rarity = randomUnit();
  const amountRoll = randomUnit();
  if (rarity < 0.7)
    return pickSteppedReward(100, 350, DAILY_GIFT_STEP_XP, amountRoll);
  if (rarity < 0.92)
    return pickSteppedReward(375, 650, DAILY_GIFT_STEP_XP, amountRoll);
  if (rarity < 0.99)
    return pickSteppedReward(675, 900, DAILY_GIFT_STEP_XP, amountRoll);
  return pickSteppedReward(925, 1000, DAILY_GIFT_STEP_XP, amountRoll);
}

function normalizeServerDailyGiftPayload(
  incomingPayload = {},
  previousPayload = {},
) {
  const payload = structuredClone(
    incomingPayload && typeof incomingPayload === "object"
      ? incomingPayload
      : {},
  );
  const previous =
    previousPayload && typeof previousPayload === "object"
      ? previousPayload
      : {};
  const today = makeDailySeed();
  const incomingProgress =
    payload.progressionV2 && typeof payload.progressionV2 === "object"
      ? payload.progressionV2
      : {};
  const previousProgress =
    previous.progressionV2 && typeof previous.progressionV2 === "object"
      ? previous.progressionV2
      : {};
  const incomingGift =
    incomingProgress.dailyGift && typeof incomingProgress.dailyGift === "object"
      ? incomingProgress.dailyGift
      : {};
  const previousGift =
    previousProgress.dailyGift && typeof previousProgress.dailyGift === "object"
      ? previousProgress.dailyGift
      : {};
  const hasStoredGift = previousGift.seed === today;
  const hasIncomingGift = incomingGift.seed === today;
  const baseAmount = hasStoredGift
    ? previousGift.amount
    : hasIncomingGift
      ? incomingGift.amount
      : rollDailyGiftAmount();
  const amount = Math.min(
    DAILY_GIFT_MAX_XP,
    Math.max(
      DAILY_GIFT_MIN_XP,
      Math.round(Number(baseAmount) || rollDailyGiftAmount()),
    ),
  );
  const claimed = Boolean(previousGift.claimed || incomingGift.claimed);
  const claimedAt =
    (claimed &&
      String(incomingGift.claimedAt || previousGift.claimedAt || "")) ||
    "";
  payload.progressionV2 = {
    ...incomingProgress,
    dailyGift: {
      seed: today,
      amount,
      claimed,
      claimedAt,
      randomSource: "server",
      serverOwned: true,
    },
  };
  return payload;
}

function isFounderUsername(username) {
  return claimKey(username) === claimKey(FOUNDER_USERNAME);
}

function seededAccountForUsername(username) {
  const key = claimKey(username);
  return SEEDED_ACCOUNTS.find((account) => claimKey(account.username) === key);
}

function applySeededAccountCredentials(user, seeded) {
  if (!user || !seeded) return user;
  return {
    ...user,
    username: seeded.username,
    claimedUsername: seeded.username,
    authProvider: "password",
    passwordSalt: seeded.passwordSalt,
    passwordHash: seeded.passwordHash,
    badge: seeded.badge,
    role: seeded.role,
    moderator: seeded.role === "moderator",
    xp: Math.max(Number(user.xp) || 0, seeded.xp),
    rating: Math.max(Number(user.rating) || 0, seeded.xp),
  };
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

function buildFounderFriendSavePayload(payload = {}, user = {}) {
  const next = structuredClone(
    payload && typeof payload === "object" ? payload : {},
  );
  const progress =
    next.progressionV2 && typeof next.progressionV2 === "object"
      ? next.progressionV2
      : {};
  const totalXp =
    Math.max(extractSaveXp(next), Math.max(0, Number(user.xp) || 0)) +
    FOUNDER_FRIEND_XP_REWARD;
  next.progressionV2 = {
    ...progress,
    xp: totalXp,
    totalXp,
    level: progressionLevelForXp(totalXp),
    rewardLog: [
      {
        modeId: "founder-friend",
        label: "Founder Friend",
        medal: "Bonus",
        xp: FOUNDER_FRIEND_XP_REWARD,
        reward: `Founder Friend +${FOUNDER_FRIEND_XP_REWARD} XP`,
        at: nowIso(),
      },
      ...(Array.isArray(progress.rewardLog) ? progress.rewardLog : []),
    ].slice(0, 12),
  };
  return { payload: next, totalXp };
}

function upsertXpLeaderboard(data, user, totalXp) {
  if (!isLeaderboardEligibleUser(user)) return null;
  const xp = Math.max(0, Math.floor(Number(totalXp) || 0));
  const row = {
    id: `xp-${user.id}`,
    userId: user.id,
    username: user.username,
    badge: user.badge || "",
    moderator: Boolean(user.moderator || user.role === "moderator"),
    xp,
    totalXp: xp,
    score: xp,
    rating: xp,
    playlist: "all modes",
    scope: "Total XP",
    source: "server",
    updatedAt: nowIso(),
  };
  data.leaderboard = [
    row,
    ...data.leaderboard.filter(
      (row) => row.id !== `xp-${user.id}` && row.userId !== user.id,
    ),
  ].sort(compareLeaderboard);
  return row;
}

function canonicalAccountXp(data, user, payload = null) {
  return Math.max(
    extractSaveXp(payload ?? data.saves?.[user.id]?.payload ?? {}),
    Math.max(0, Number(user?.xp) || 0),
    getLeaderboardXp(getLeaderboardRowForUser(data, user)),
  );
}

function savePayloadWithXp(payload = {}, totalXp = 0) {
  const next = structuredClone(
    payload && typeof payload === "object" ? payload : {},
  );
  const progress =
    next.progressionV2 && typeof next.progressionV2 === "object"
      ? next.progressionV2
      : {};
  const xp = Math.max(0, Math.floor(Number(totalXp) || 0));
  next.progressionV2 = {
    ...progress,
    xp,
    totalXp: xp,
    level: Math.max(
      progressionLevelForXp(xp),
      Math.max(1, Number(progress.level) || 1),
    ),
  };
  return next;
}

function ensureCanonicalAccountProgress(data, user) {
  if (!isLeaderboardEligibleUser(user)) return null;
  const previous = data.saves?.[user.id] ?? null;
  const totalXp = canonicalAccountXp(data, user, previous?.payload);
  user.xp = totalXp;
  user.rating = Math.max(Number(user.rating) || 0, totalXp);
  user.updatedAt = user.updatedAt || nowIso();
  const previousXp = extractSaveXp(previous?.payload ?? {});
  if (totalXp > previousXp || !previous) {
    data.saves[user.id] = {
      userId: user.id,
      schemaVersion: Math.max(2, Number(previous?.schemaVersion) || 2),
      payload: savePayloadWithXp(previous?.payload ?? {}, totalXp),
      clientUpdatedAt: previous?.clientUpdatedAt ?? null,
      serverUpdatedAt: nowIso(),
    };
  }
  return {
    totalXp,
    save: data.saves[user.id] ?? previous,
    leaderboardRow: upsertXpLeaderboard(data, user, totalXp),
  };
}

function ensureUserLeaderboardRow(data, user) {
  if (!isLeaderboardEligibleUser(user)) return null;
  return ensureCanonicalAccountProgress(data, user)?.leaderboardRow ?? null;
}

function ensureAllAccountLeaderboardRows(data) {
  for (const user of Object.values(data.users ?? {})) {
    ensureUserLeaderboardRow(data, user);
  }
}

function usableSecret(value) {
  const normalized = String(value ?? "").trim();
  if (!normalized) return "";
  return PLACEHOLDER_SECRET_VALUES.has(normalized.toLowerCase())
    ? ""
    : normalized;
}

function hasResendConfig(options = {}) {
  return Boolean(
    usableSecret(options.resendApiKey ?? process.env.RESEND_API_KEY) &&
    usableSecret(
      options.feedbackTo ??
        options.feedbackEmailTo ??
        process.env.FEEDBACK_TO ??
        process.env.FEEDBACK_EMAIL_TO,
    ) &&
    usableFeedbackSender(
      options.feedbackFrom ??
        options.feedbackEmailFrom ??
        process.env.FEEDBACK_FROM ??
        process.env.FEEDBACK_EMAIL_FROM,
    ),
  );
}

function parseFeedbackRecipients(value) {
  return usableSecret(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function usableFeedbackSender(value) {
  const sender = usableSecret(value);
  const email = sender.match(/<([^>]+)>/)?.[1] ?? sender;
  if (!EMAIL_PATTERN.test(email)) return "";
  if (email.toLowerCase().endsWith(".local")) return "";
  return sender;
}

function feedbackEmailHtml(text) {
  return `<pre>${text.replace(/[&<>]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[char])}</pre>`;
}

function isResendSenderVerificationError(message) {
  const text = String(message ?? "").toLowerCase();
  return (
    text.includes("domain is not verified") ||
    text.includes("verify a domain") ||
    text.includes("only send testing emails") ||
    (text.includes("sender") && text.includes("verify"))
  );
}

async function sendFeedbackEmail({
  apiKey,
  transport,
  row,
  from,
  to,
  text,
  idempotencyKey,
}) {
  const response = await transport("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
      "idempotency-key": idempotencyKey,
    },
    body: JSON.stringify({
      from,
      to,
      subject: `InfernoDrift4 feedback: ${row.feedbackType}`,
      text,
      html: feedbackEmailHtml(text),
    }),
  });
  if (response.ok) return { ok: true, error: "" };
  const body = await response.json().catch(() => ({}));
  return {
    ok: false,
    error: body?.message || body?.error || `resend_${response.status}`,
  };
}

async function deliverFeedback(row, options) {
  const apiKey = usableSecret(
    options.resendApiKey ?? process.env.RESEND_API_KEY,
  );
  const to = parseFeedbackRecipients(
    options.feedbackTo ??
      options.feedbackEmailTo ??
      process.env.FEEDBACK_TO ??
      process.env.FEEDBACK_EMAIL_TO,
  );
  const from = usableFeedbackSender(
    options.feedbackFrom ??
      options.feedbackEmailFrom ??
      process.env.FEEDBACK_FROM ??
      process.env.FEEDBACK_EMAIL_FROM,
  );
  const transport = options.feedbackFetch ?? fetch;
  if (!apiKey || !to.length || !from || typeof transport !== "function") {
    return { delivery: "stored_email_not_configured", emailConfigured: false };
  }
  const text = [
    `Feedback ID: ${row.id}`,
    `From: ${row.username} (${row.userId})`,
    `Reply: ${row.replyEmail || "none"}`,
    `Type: ${row.feedbackType}`,
    `At: ${row.createdAt}`,
    "",
    row.message,
    "",
    `Diagnostics: ${JSON.stringify(row.diagnostics ?? {})}`,
  ].join("\n");
  const primary = await sendFeedbackEmail({
    apiKey,
    transport,
    row,
    from,
    to,
    text,
    idempotencyKey: `feedback-${row.id}`,
  });
  if (primary.ok) return { delivery: "delivered", emailConfigured: true };
  if (isResendSenderVerificationError(primary.error)) {
    const sandboxTo = to.includes("clark.alden@lbusd.org")
      ? ["clark.alden@lbusd.org"]
      : [to[0]].filter(Boolean);
    const sandbox = await sendFeedbackEmail({
      apiKey,
      transport,
      row,
      from: "InfernoDrift4 <onboarding@resend.dev>",
      to: sandboxTo,
      text,
      idempotencyKey: `feedback-${row.id}-sandbox`,
    });
    if (sandbox.ok) {
      return {
        delivery: "delivered_sandbox",
        emailConfigured: true,
        deliveredTo: sandboxTo,
        emailWarning:
          "Gmail copy requires a verified sender domain; delivered through Resend sandbox.",
      };
    }
    return {
      delivery: "stored_email_failed",
      emailConfigured: true,
      emailError: `${primary.error}; sandbox_fallback_failed: ${sandbox.error}`,
    };
  }
  return {
    delivery: "stored_email_failed",
    emailConfigured: true,
    emailError: primary.error,
  };
}

function normalizeFeedbackType(value) {
  const type = String(value ?? "")
    .trim()
    .toLowerCase();
  return ALLOWED_FEEDBACK_TYPES.has(type) ? type : "other";
}

function buildFeedbackRow(payload, user = {}) {
  const rawMessage = String(payload.message ?? "");
  if (rawMessage.length > FEEDBACK_MESSAGE_LIMIT) {
    return { ok: false, error: "feedback_too_long" };
  }
  const message = sanitizeChat(rawMessage).slice(0, FEEDBACK_MESSAGE_LIMIT);
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
      id: randomUUID(),
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

async function readJsonBody(req, maxBytes = 24_000) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.byteLength;
    if (size > maxBytes) throw new Error("body_too_large");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

export function createInfernoServer(options = {}) {
  const port = Number(options.port ?? process.env.PORT ?? 8787);
  const dataDir = options.dataDir ?? process.env.DATA_DIR ?? "./data";
  const allowedOrigins = String(
    options.allowedOrigins ?? process.env.ALLOWED_ORIGINS ?? "",
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const clarkReservationToken = usableSecret(
    options.clarkReservationToken ?? process.env.CLARK_RESERVATION_TOKEN,
  );
  const db = loadDb(dataDir);
  const rooms = new Map();
  const clients = new Map();
  const httpRate = new Map();

  function originAllowed(req) {
    const origin = req.headers.origin;
    return !allowedOrigins.length || !origin || allowedOrigins.includes(origin);
  }

  function corsHeaders(req) {
    const origin = req.headers.origin;
    return {
      "access-control-allow-origin":
        origin && (!allowedOrigins.length || allowedOrigins.includes(origin))
          ? origin
          : "*",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "content-type",
      vary: "Origin",
    };
  }

  function writeJson(res, req, status, payload) {
    res.writeHead(status, {
      "content-type": "application/json",
      ...corsHeaders(req),
    });
    res.end(JSON.stringify(payload));
  }

  function checkHttpRate(req, key, limit, windowMs) {
    const remote = req.socket.remoteAddress ?? "local";
    const bucketKey = `${key}:${remote}`;
    const now = Date.now();
    const bucket = httpRate.get(bucketKey) ?? [];
    const recent = bucket.filter((time) => now - time < windowMs);
    if (recent.length >= limit) return false;
    recent.push(now);
    httpRate.set(bucketKey, recent);
    return true;
  }

  function makeHttpClient(user = null, sessionToken = "") {
    return {
      id: `http-${randomUUID()}`,
      user: user ?? {
        id: "",
        username: "HTTPS Guest",
        age: null,
        rating: 1000,
        online: false,
      },
      sessionToken,
      roomId: null,
      rate: new Map(),
      ws: { send() {} },
    };
  }

  function clientFromHttpSession(token) {
    const sessionToken = String(token || "");
    const session = sessionToken ? db.data.sessions[sessionToken] : null;
    const user = session ? db.data.users[session.userId] : null;
    if (!session || !user) return null;
    session.lastSeenAt = nowIso();
    user.online = true;
    user.updatedAt = nowIso();
    db.data.sessions[sessionToken] = session;
    db.data.users[user.id] = user;
    return makeHttpClient(user, sessionToken);
  }

  function httpSessionTokenFrom(req, url, payload = {}) {
    const auth = String(req.headers.authorization || "");
    if (auth.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
    return String(
      payload.sessionToken || url.searchParams.get("sessionToken") || "",
    );
  }

  function chatSendPayload(client, payload = {}) {
    if (!checkRate(client, "chat", 5, 5000))
      return { ok: false, error: "rate_limited" };
    if (!Number.isInteger(client.user.age) || client.user.age < 13) {
      return { ok: false, error: "chat_requires_13_plus" };
    }
    const text = sanitizeChat(payload.text);
    if (!text || text === "[blocked]")
      return { ok: false, error: "message_blocked" };
    const direct = resolveDirectChatTarget(client, payload);
    if (!direct.ok) return { ok: false, error: direct.error };
    const channel = direct.direct
      ? direct.channel
      : chatChannelForClient(client);
    const message = {
      type: "chat.message",
      from: client.user.username,
      userId: client.user.id,
      badge: client.user.badge || "",
      moderator: isModeratorUser(client.user),
      text,
      quick: false,
      at: nowIso(),
      channel,
      direct: Boolean(direct.direct),
      toUserId: direct.target?.id ?? "",
      toUsername: direct.target?.username ?? "",
    };
    pruneChatMessages();
    db.data.chatMessages.push({
      id: randomUUID(),
      channel,
      from: message.from,
      userId: message.userId,
      badge: message.badge,
      moderator: message.moderator,
      text: message.text,
      quick: false,
      createdAt: message.at,
    });
    db.save();
    if (direct.direct) {
      send(client.ws, message);
      if (direct.targetClient) send(direct.targetClient.ws, message);
    } else {
      broadcastAll(message, client.user.id);
    }
    return { ok: true, message };
  }

  const server = http.createServer(async (req, res) => {
    const url = new URL(
      req.url ?? "/",
      `http://${req.headers.host ?? "127.0.0.1"}`,
    );
    if (req.method === "OPTIONS") {
      res.writeHead(originAllowed(req) ? 204 : 403, corsHeaders(req));
      res.end();
      return;
    }
    if (!originAllowed(req)) {
      writeJson(res, req, 403, { ok: false, error: "origin_not_allowed" });
      return;
    }
    if (url.pathname === "/health") {
      writeJson(res, req, 200, {
        ok: true,
        server: "InfernoDrift4",
        rooms: rooms.size,
        clients: clients.size,
        persistence: "local-json",
        optionalBindings: {
          resend: hasResendConfig(options),
        },
      });
      return;
    }
    if (url.pathname === "/api/feedback" && req.method === "POST") {
      if (!checkHttpRate(req, "feedback", 3, 60_000)) {
        writeJson(res, req, 429, { ok: false, error: "rate_limited" });
        return;
      }
      try {
        const payload = await readJsonBody(req);
        const result = buildFeedbackRow(payload);
        if (!result.ok) {
          writeJson(res, req, 400, { ok: false, error: result.error });
          return;
        }
        db.data.feedback.push(result.row);
        db.save();
        const delivery = await deliverFeedback(result.row, options);
        writeJson(res, req, 200, {
          ok: true,
          feedbackId: result.row.id,
          ...delivery,
        });
      } catch (error) {
        writeJson(res, req, error?.message === "body_too_large" ? 413 : 400, {
          ok: false,
          error:
            error?.message === "body_too_large"
              ? "message_too_large"
              : "invalid_feedback",
        });
      }
      return;
    }
    if (url.pathname === "/api/auth/account" && req.method === "POST") {
      if (!checkHttpRate(req, "auth-http", 8, 60_000)) {
        writeJson(res, req, 429, { ok: false, error: "rate_limited" });
        return;
      }
      try {
        const payload = await readJsonBody(req);
        const client = makeHttpClient();
        const auth = await handleAccountAuth(client, {
          ...payload,
          type: "auth.account",
        });
        if (!auth.ok) {
          writeJson(res, req, 400, {
            ok: false,
            error: auth.error,
            until: auth.until,
          });
          return;
        }
        const leaderboard = leaderboardSnapshot("casual", auth.user);
        writeJson(res, req, 200, {
          ok: true,
          user: publicUser(auth.user),
          sessionToken: auth.sessionToken,
          restored: auth.restored,
          save: db.data.saves[auth.user.id] ?? null,
          profile: profileSnapshot(client),
          friends: friendsSnapshot(client),
          chat: chatHistoryPayload(client),
          leaderboard: leaderboard.rows,
          playerRow: leaderboard.playerRow,
        });
      } catch {
        writeJson(res, req, 400, { ok: false, error: "invalid_auth" });
      }
      return;
    }
    if (url.pathname === "/api/profile" && req.method === "GET") {
      const client = clientFromHttpSession(httpSessionTokenFrom(req, url));
      if (!client) {
        writeJson(res, req, 401, { ok: false, error: "session_expired" });
        return;
      }
      writeJson(res, req, 200, { ok: true, ...profileSnapshot(client) });
      return;
    }
    if (url.pathname === "/api/leaderboard" && req.method === "GET") {
      const client = clientFromHttpSession(httpSessionTokenFrom(req, url));
      if (!client) {
        writeJson(res, req, 401, { ok: false, error: "session_expired" });
        return;
      }
      const snapshot = leaderboardSnapshot(
        url.searchParams.get("playlist") || "casual",
        client.user,
      );
      writeJson(res, req, 200, {
        ok: true,
        leaderboard: snapshot.rows,
        playerRow: snapshot.playerRow,
      });
      return;
    }
    if (url.pathname === "/api/chat/history" && req.method === "GET") {
      const client = clientFromHttpSession(httpSessionTokenFrom(req, url));
      if (!client) {
        writeJson(res, req, 401, { ok: false, error: "session_expired" });
        return;
      }
      writeJson(res, req, 200, { ok: true, ...chatHistoryPayload(client) });
      return;
    }
    if (url.pathname === "/api/chat/send" && req.method === "POST") {
      if (!checkHttpRate(req, "chat-http", 12, 60_000)) {
        writeJson(res, req, 429, { ok: false, error: "rate_limited" });
        return;
      }
      try {
        const payload = await readJsonBody(req);
        const client = clientFromHttpSession(
          httpSessionTokenFrom(req, url, payload),
        );
        if (!client) {
          writeJson(res, req, 401, { ok: false, error: "session_expired" });
          return;
        }
        const result = chatSendPayload(client, payload);
        writeJson(res, req, result.ok ? 200 : 400, result);
      } catch {
        writeJson(res, req, 400, { ok: false, error: "invalid_chat" });
      }
      return;
    }
    writeJson(res, req, 404, { ok: false, error: "not_found" });
  });

  const wss = new WebSocketServer({
    server,
    verifyClient: ({ origin }, done) => {
      if (!allowedOrigins.length || !origin || allowedOrigins.includes(origin))
        done(true);
      else done(false, 403, "origin not allowed");
    },
  });

  function send(ws, payload) {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(payload));
  }

  function clientRecordByUserId(userId) {
    for (const [id, client] of clients.entries()) {
      if (client.user?.id === userId) return { id, client };
    }
    return null;
  }

  function clientByUserId(userId) {
    return clientRecordByUserId(userId)?.client ?? null;
  }

  function activeBanForUser(userId, deviceId = "") {
    const candidates = [
      db.data.bans?.[userId],
      deviceId ? db.data.bans?.[`device:${deviceId}`] : null,
    ].filter(Boolean);
    const ban = candidates[0];
    if (!ban) return null;
    const untilMs = Date.parse(ban.until);
    if (!Number.isFinite(untilMs) || untilMs <= Date.now()) {
      delete db.data.bans[userId];
      if (deviceId) delete db.data.bans[`device:${deviceId}`];
      db.save();
      return null;
    }
    return ban;
  }

  function isModeratorUser(user) {
    return Boolean(user?.moderator || user?.role === "moderator");
  }

  function isBlockedBetween(fromUserId, toUserId) {
    const fromState = db.data.friends[fromUserId] ?? {};
    const toState = db.data.friends[toUserId] ?? {};
    return Boolean(
      fromState.blocked?.[toUserId] || toState.blocked?.[fromUserId],
    );
  }

  function broadcast(room, payload, fromUserId = "") {
    for (const id of room.players) {
      const peer = clients.get(id);
      if (!peer) continue;
      if (fromUserId && isBlockedBetween(fromUserId, peer.user.id)) continue;
      send(peer.ws, payload);
    }
  }

  function broadcastAll(payload, fromUserId = "") {
    for (const peer of clients.values()) {
      if (fromUserId && isBlockedBetween(fromUserId, peer.user.id)) continue;
      send(peer.ws, payload);
    }
  }

  function pruneChatMessages() {
    const cutoff = Date.now() - CHAT_HISTORY_WINDOW_MS;
    db.data.chatMessages = db.data.chatMessages.filter((message) => {
      const createdAt = Date.parse(message.createdAt);
      return Number.isFinite(createdAt) && createdAt >= cutoff;
    });
  }

  function chatChannelForClient(client) {
    const room = client?.roomId ? rooms.get(client.roomId) : null;
    return room ? `room:${room.code || room.id}` : "lobby";
  }

  function directChatChannel(userA = "", userB = "") {
    return `dm:${[String(userA), String(userB)].sort().join(":")}`;
  }

  function resolveDirectChatTarget(client, msg) {
    if (msg.channel !== "friend") return { ok: true, direct: false };
    const target =
      (msg.userId && db.data.users[msg.userId]) ||
      findUserByUsername(msg.username || "");
    if (!target || target.id === client.user.id) {
      return { ok: false, error: "friend_chat_target_not_found" };
    }
    if (isBlockedBetween(client.user.id, target.id)) {
      return { ok: false, error: "friend_chat_blocked" };
    }
    const friendState = ensureFriendState(client.user.id);
    if (!friendState.friends?.[target.id]) {
      return { ok: false, error: "friend_required" };
    }
    return {
      ok: true,
      direct: true,
      target,
      targetClient: clientByUserId(target.id),
      channel: directChatChannel(client.user.id, target.id),
    };
  }

  function chatHistoryPayload(client) {
    pruneChatMessages();
    const channel = chatChannelForClient(client);
    return {
      type: "chat.history",
      channel,
      windowMs: CHAT_HISTORY_WINDOW_MS,
      messages: db.data.chatMessages
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

  function checkRate(client, key, limit, windowMs) {
    const now = Date.now();
    const bucket = client.rate.get(key) ?? [];
    const recent = bucket.filter((time) => now - time < windowMs);
    if (recent.length >= limit) return false;
    recent.push(now);
    client.rate.set(key, recent);
    return true;
  }

  function leaderboardSnapshot(playlist = "", viewerUser = null) {
    ensureAllAccountLeaderboardRows(db.data);
    if (viewerUser) ensureUserLeaderboardRow(db.data, viewerUser);
    const rows = Array.isArray(db.data.leaderboard)
      ? db.data.leaderboard
      : DEFAULT_LEADERBOARD;
    const mappedRows = (rows.length ? rows : DEFAULT_LEADERBOARD)
      .map((row) => {
        const user = row.userId ? db.data.users[row.userId] : null;
        const xp = getLeaderboardXp(row);
        return {
          id: row.id ?? `server-${claimKey(row.username) || randomUUID()}`,
          userId: row.userId ?? user?.id ?? "",
          username: normalizeUsername(row.username, "Driver"),
          xp,
          totalXp: xp,
          rating: xp,
          score: xp,
          badge: row.badge || user?.badge || "",
          moderator: Boolean(row.moderator || isModeratorUser(user)),
          playlist: "all modes",
          requestedPlaylist: playlist || "all",
          scope: "Total XP",
          source: "server",
        };
      })
      .sort(compareLeaderboard);
    const playerRow =
      viewerUser?.id && mappedRows.find((row) => row.userId === viewerUser.id);
    return {
      rows: mappedRows.slice(0, 10),
      playerRow: playerRow || null,
    };
  }

  function sendLeaderboardSnapshot(client, playlist = "casual") {
    const snapshot = leaderboardSnapshot(playlist, client?.user);
    send(client.ws, {
      type: "leaderboard.snapshot",
      leaderboard: snapshot.rows,
      playerRow: snapshot.playerRow,
    });
  }

  function buildBotPlayers(room) {
    if (!room.botFill) return [];
    return BOT_NAMES.slice(0, Math.max(0, room.size - room.players.size)).map(
      (name, index) => ({
        id: `bot-${room.id}-${index + 1}`,
        username: name,
        rating: 900 + index * 25,
        badge: "BOT",
        bot: true,
      }),
    );
  }

  function makeUniqueRoomCode() {
    const activeCodes = new Set(
      [...rooms.values()].map((room) => String(room.code || "").toUpperCase()),
    );
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const code = makeCode().toUpperCase();
      if (!activeCodes.has(code)) return code;
    }
    return `${makeCode().slice(0, 4)}${String(rooms.size % 99).padStart(2, "0")}`.toUpperCase();
  }

  function clampNumber(value, min, max, fallback = 0) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return fallback;
    return Math.min(max, Math.max(min, numeric));
  }

  function sanitizeLiveInput(msg) {
    const client =
      msg.client && typeof msg.client === "object" ? msg.client : {};
    const cosmetics =
      msg.cosmetics && typeof msg.cosmetics === "object"
        ? Object.fromEntries(
            Object.entries(msg.cosmetics)
              .filter(([, value]) => typeof value === "string")
              .slice(0, 12),
          )
        : {};
    return {
      tick: Math.floor(clampNumber(msg.tick ?? msg.seq, 0, 1e9, 0)),
      x: clampNumber(msg.x ?? client.x, -1000, 1000),
      y: clampNumber(msg.y ?? client.y, -40, 160),
      z: clampNumber(msg.z ?? client.z, -1000, 1000),
      heading: clampNumber(msg.heading ?? client.heading, -20, 20),
      speed: clampNumber(msg.speed ?? client.speed, -420, 420),
      throttle: clampNumber(msg.throttle, -1, 1),
      steer: clampNumber(msg.steer, -1, 1),
      drift: Boolean(msg.drift),
      boost: Boolean(msg.boost),
      jump: Boolean(msg.jump),
      airborne: Boolean(msg.airborne ?? client.airborne),
      backflip: Boolean(msg.backflip),
      barrelRoll: Boolean(msg.barrelRoll),
      trick: String(msg.trick || "").slice(0, 32),
      shield: clampNumber(msg.shield, 0, 1),
      health: clampNumber(msg.health, 0, 500),
      ammo: clampNumber(msg.ammo, 0, 50),
      team: ["blue", "red", "neutral"].includes(msg.team)
        ? msg.team
        : "neutral",
      mode: String(msg.mode || "").slice(0, 32),
      cosmetics,
      at: Date.now(),
    };
  }

  function ensureFriendState(userId) {
    if (!db.data.friends[userId]) {
      db.data.friends[userId] = {
        friends: {},
        blocked: {},
        blockedUsernames: {},
      };
    }
    db.data.friends[userId].friends ??= {};
    db.data.friends[userId].blocked ??= {};
    db.data.friends[userId].blockedUsernames ??= {};
    return db.data.friends[userId];
  }

  function findUserByUsername(username) {
    const key = claimKey(username);
    if (!key) return null;
    const claimedId = db.data.usernameClaims[key];
    if (claimedId && db.data.users[claimedId]) return db.data.users[claimedId];
    return (
      Object.values(db.data.users).find(
        (user) => claimKey(user.username) === key,
      ) ?? null
    );
  }

  function friendsSnapshot(client) {
    const state = ensureFriendState(client.user.id);
    const pending = Object.values(db.data.friendRequests).filter(
      (request) => request.status === "pending",
    );
    return {
      type: "friends.snapshot",
      friends: Object.keys(state.friends)
        .map((userId) => publicUser(db.data.users[userId]))
        .filter(Boolean),
      incomingRequests: pending.filter(
        (request) => request.toUserId === client.user.id,
      ),
      outgoingRequests: pending.filter(
        (request) => request.fromUserId === client.user.id,
      ),
      blocked: [
        ...Object.keys(state.blocked)
          .map((userId) => publicUser(db.data.users[userId]))
          .filter(Boolean),
        ...Object.keys(state.blockedUsernames).map((username) => ({
          username,
        })),
      ],
      recentPlayers: [...clients.values()]
        .map((peer) => publicUser(peer.user))
        .filter((user) => user && user.id !== client.user.id),
    };
  }

  function awardFounderFriendXp(user) {
    if (!user || isFounderUsername(user.username)) return null;
    if (user.founderFriendXpClaimed) return null;
    const previousSave = db.data.saves[user.id] ?? {
      userId: user.id,
      schemaVersion: 2,
      payload: {},
      serverUpdatedAt: nowIso(),
    };
    const { payload, totalXp } = buildFounderFriendSavePayload(
      previousSave.payload,
      user,
    );
    user.founderFriendXpClaimed = true;
    user.xp = totalXp;
    user.rating = Math.max(Number(user.rating) || 0, totalXp);
    user.updatedAt = nowIso();
    db.data.users[user.id] = user;
    db.data.saves[user.id] = {
      ...previousSave,
      userId: user.id,
      schemaVersion: Math.max(2, Number(previousSave.schemaVersion) || 2),
      payload,
      serverUpdatedAt: user.updatedAt,
    };
    upsertXpLeaderboard(db.data, user, totalXp);
    return {
      type: "progression.reward",
      reason: "founder_friend",
      label: "Founder Friend",
      xp: FOUNDER_FRIEND_XP_REWARD,
      totalXp,
      payload,
      user: publicUser(user),
    };
  }

  function sendFounderFriendReward(userId, reward) {
    if (!reward) return;
    const targetClient = clientByUserId(userId);
    if (!targetClient) return;
    send(targetClient.ws, reward);
    send(targetClient.ws, {
      type: "save.synced",
      schemaVersion: 2,
      payload: reward.payload,
      serverUpdatedAt: nowIso(),
    });
    sendLeaderboardSnapshot(targetClient);
    send(targetClient.ws, profileSnapshot(targetClient));
  }

  function profileSnapshot(client) {
    ensureCanonicalAccountProgress(db.data, client.user);
    return {
      type: "profile.snapshot",
      user: publicUser(client.user),
      profileMode:
        client.user?.authProvider === "password" ? "account" : "guest",
      sessionActive: Boolean(client.sessionToken),
      save: db.data.saves[client.user.id] ?? null,
      leaderboardRow:
        db.data.leaderboard.find((row) => row.userId === client.user.id) ??
        null,
      restrictions: {
        banned: Boolean(activeBanForUser(client.user.id, client.user.deviceId)),
        ban: activeBanForUser(client.user.id, client.user.deviceId),
      },
    };
  }

  function invalidateSessionsForUser(userId, reason = "session_revoked") {
    for (const [token, session] of Object.entries(db.data.sessions)) {
      if (session?.userId === userId) delete db.data.sessions[token];
    }
    for (const [clientId, peer] of clients.entries()) {
      if (peer.user?.id !== userId) continue;
      leaveRoom(clientId);
      send(peer.ws, { type: "session.revoked", reason });
      peer.ws.close(4001, reason);
      clients.delete(clientId);
    }
  }

  function handleProfileLogout(client) {
    if (client.sessionToken) delete db.data.sessions[client.sessionToken];
    if (client.user?.id && db.data.users[client.user.id]) {
      db.data.users[client.user.id].online = false;
      db.data.users[client.user.id].updatedAt = nowIso();
    }
    db.save();
    send(client.ws, { type: "profile.loggedOut" });
  }

  function anonymizeUserRecords(userId, username) {
    const anonymousName = "Deleted Player";
    for (const request of Object.values(db.data.friendRequests)) {
      if (request.fromUserId === userId) request.fromUsername = anonymousName;
      if (request.toUserId === userId) request.toUsername = anonymousName;
    }
    for (const report of db.data.reports) {
      if (report.reporterUserId === userId)
        report.reporterUsername = anonymousName;
      if (report.targetUserId === userId) report.targetUsername = anonymousName;
    }
    for (const log of db.data.moderationLogs) {
      if (log.moderatorUserId === userId) log.moderatorUsername = anonymousName;
      if (log.targetUserId === userId) log.targetUsername = anonymousName;
    }
    for (const message of db.data.chatMessages) {
      if (message.userId === userId) message.from = anonymousName;
    }
    db.data.accountDeletions.push({
      id: randomUUID(),
      userId,
      usernameKey: claimKey(username),
      deletedAt: nowIso(),
    });
  }

  function handleProfileDelete(client, msg) {
    const user = client.user;
    const confirmed = claimKey(msg.confirmUsername) === claimKey(user.username);
    if (!confirmed) {
      return send(client.ws, {
        type: "error",
        error: "profile_delete_confirmation_mismatch",
      });
    }
    if (user.claimedUsername)
      delete db.data.usernameClaims[claimKey(user.claimedUsername)];
    delete db.data.usernameClaims[claimKey(user.username)];
    delete db.data.saves[user.id];
    delete db.data.users[user.id];
    delete db.data.friends[user.id];
    delete db.data.bans[user.id];
    db.data.leaderboard = db.data.leaderboard.filter(
      (row) => row.userId !== user.id,
    );
    for (const state of Object.values(db.data.friends)) {
      delete state.friends?.[user.id];
      delete state.blocked?.[user.id];
    }
    anonymizeUserRecords(user.id, user.username);
    db.save();
    send(client.ws, { type: "profile.deleted", username: user.username });
    invalidateSessionsForUser(user.id, "profile_deleted");
  }

  function roomSnapshot(room) {
    const bots = buildBotPlayers(room);
    return {
      type: "room.snapshot",
      room: {
        id: room.id,
        code: room.code,
        mode: room.mode,
        playlist: room.playlist,
        size: room.size,
        teamSize: room.teamSize,
        ranked: room.ranked,
        botFill: room.botFill,
        sharedBy: [...(room.sharedBy ?? new Set())],
        players: [...room.players]
          .map((id) => publicUser(clients.get(id)?.user))
          .filter(Boolean),
        bots: bots.length,
        botPlayers: bots,
        leaderboard: leaderboardSnapshot(room.playlist).rows,
      },
    };
  }

  function leaveRoom(id, { notify = false } = {}) {
    const client = clients.get(id);
    const room = client?.roomId ? rooms.get(client.roomId) : null;
    if (!client || !room) return;
    room.players.delete(id);
    client.roomId = null;
    if (room.players.size === 0) rooms.delete(room.id);
    else broadcast(room, roomSnapshot(room));
    if (notify) send(client.ws, { type: "room.left" });
  }

  function makeRoom(options, source = "private") {
    return {
      id: randomUUID(),
      code: makeUniqueRoomCode(),
      source,
      mode: options.mode,
      playlist: options.playlist,
      size: options.size,
      teamSize: options.teamSize,
      ranked: options.ranked,
      botFill: options.botFill,
      players: new Set(),
      sharedBy: new Set(),
    };
  }

  function joinRoom(id, room) {
    const client = clients.get(id);
    if (!client) return;
    if (client.roomId && client.roomId !== room.id) leaveRoom(id);
    room.players.add(id);
    client.roomId = room.id;
    broadcast(room, roomSnapshot(room));
    send(client.ws, chatHistoryPayload(client));
  }

  function findQueuedRoom(options) {
    return [...rooms.values()].find(
      (room) =>
        room.source === "queue" &&
        room.playlist === options.playlist &&
        room.teamSize === options.teamSize &&
        room.ranked === options.ranked &&
        room.players.size < room.size,
    );
  }

  function createOrRestoreUser(client, msg) {
    const token = typeof msg.sessionToken === "string" ? msg.sessionToken : "";
    const restoredSession = token ? db.data.sessions[token] : null;
    const restoredUser = restoredSession
      ? db.data.users[restoredSession.userId]
      : null;
    const userId = restoredUser?.id ?? randomUUID();
    const existing = restoredUser ?? {};
    const fallbackName = existing.username ?? client.user.username;
    const requested =
      msg.type === "reconnect"
        ? fallbackName
        : normalizeUsername(msg.username || fallbackName, fallbackName);
    const requestedKey = claimKey(requested);
    const claimedByOther =
      requestedKey &&
      db.data.usernameClaims[requestedKey] &&
      db.data.usernameClaims[requestedKey] !== userId;
    const clarkBlocked =
      requestedKey === "clark" && db.data.usernameClaims.clark !== userId;
    const username = claimedByOther || clarkBlocked ? fallbackName : requested;
    const sessionToken = restoredSession ? token : randomUUID();
    const user = {
      id: userId,
      username,
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
      founderFriendXpClaimed: Boolean(existing.founderFriendXpClaimed),
    };
    db.data.users[userId] = user;
    ensureUserLeaderboardRow(db.data, user);
    db.data.sessions[sessionToken] = {
      token: sessionToken,
      userId,
      deviceId: msg.deviceId ?? existing.deviceId ?? "",
      createdAt: restoredSession?.createdAt ?? nowIso(),
      lastSeenAt: nowIso(),
    };
    db.save();
    client.sessionToken = sessionToken;
    client.user = user;
    return { user, sessionToken, restored: Boolean(restoredUser) };
  }

  async function handleAccountAuth(client, msg) {
    if (!checkRate(client, "auth", 8, 60_000))
      return { ok: false, error: "rate_limited" };
    const username = normalizeUsername(msg.username, "");
    const key = claimKey(username);
    if (!key || username.length < 2)
      return { ok: false, error: "invalid_username" };
    const ownerId = db.data.usernameClaims[key];
    let existing = ownerId ? db.data.users[ownerId] : null;
    const seeded = seededAccountForUsername(username);
    if (existing && seeded && !existing.passwordHash) {
      existing = applySeededAccountCredentials(existing, seeded);
      db.data.users[existing.id] = existing;
      db.data.usernameClaims[key] = existing.id;
      ensureCanonicalAccountProgress(db.data, existing);
    }
    if (
      key === "clark" &&
      (!existing || existing.id !== "seed-clark") &&
      (!clarkReservationToken || msg.turnstileToken !== clarkReservationToken)
    ) {
      return { ok: false, error: "username_reserved" };
    }
    const mode = msg.mode ?? "auto";
    if (!existing && mode === "signin")
      return { ok: false, error: "account_not_found" };
    if (existing && !existing.passwordHash && mode === "signin")
      return { ok: false, error: "account_requires_upgrade" };
    const ban = existing
      ? activeBanForUser(existing.id, msg.deviceId ?? existing.deviceId)
      : activeBanForUser("", msg.deviceId ?? "");
    if (ban) return { ok: false, error: "account_banned", until: ban.until };

    let user = existing;
    let restored = false;
    if (existing?.passwordHash) {
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
    } else if (existing) {
      const salt = randomHex(16);
      restored = true;
      user = {
        ...existing,
        username: existing.username || username,
        age: Number(msg.age),
        deviceId: msg.deviceId ?? existing.deviceId ?? "",
        online: true,
        claimedUsername: username,
        authProvider: "password",
        passwordSalt: salt,
        passwordHash: await hashPassword(msg.password, salt),
        updatedAt: nowIso(),
      };
    } else {
      const salt = randomHex(16);
      user = {
        id: randomUUID(),
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
    const sessionToken = randomUUID();
    db.data.users[user.id] = user;
    db.data.usernameClaims[key] = user.id;
    ensureUserLeaderboardRow(db.data, user);
    db.data.sessions[sessionToken] = {
      token: sessionToken,
      userId: user.id,
      deviceId: msg.deviceId ?? user.deviceId ?? "",
      account: true,
      createdAt: nowIso(),
      lastSeenAt: nowIso(),
    };
    db.save();
    client.user = user;
    client.sessionToken = sessionToken;
    return { ok: true, user, sessionToken, restored };
  }

  function claimUsername(client, msg) {
    const username = normalizeUsername(msg.username, "");
    const key = claimKey(username);
    if (!key) return { ok: false, error: "invalid_username" };
    if (
      key === "clark" &&
      (!clarkReservationToken || msg.turnstileToken !== clarkReservationToken)
    ) {
      return { ok: false, error: "username_reserved" };
    }
    const existingOwner = db.data.usernameClaims[key];
    if (existingOwner && existingOwner !== client.user.id) {
      return { ok: false, error: "username_taken" };
    }
    if (
      client.user.claimedUsername &&
      claimKey(client.user.claimedUsername) !== key
    ) {
      delete db.data.usernameClaims[claimKey(client.user.claimedUsername)];
    }
    client.user.username = username;
    client.user.claimedUsername = username;
    client.user.updatedAt = nowIso();
    db.data.users[client.user.id] = client.user;
    db.data.usernameClaims[key] = client.user.id;
    ensureUserLeaderboardRow(db.data, client.user);
    db.save();
    return { ok: true, username };
  }

  function handleFriendRequest(client, msg) {
    if (!checkRate(client, "social", 10, 60_000))
      return send(client.ws, { type: "error", error: "rate_limited" });
    const username = normalizeUsername(msg.username, "");
    const target = findUserByUsername(username);
    if (target?.id === client.user.id)
      return send(client.ws, { type: "error", error: "friend_self_rejected" });
    const isFounderTarget = target && isFounderUsername(target.username);
    const request = {
      id: randomUUID(),
      fromUserId: client.user.id,
      fromUsername: client.user.username,
      toUserId: target?.id ?? "",
      toUsername: username,
      status: isFounderTarget ? "accepted" : "pending",
      createdAt: nowIso(),
      respondedAt: isFounderTarget ? nowIso() : "",
    };
    db.data.friendRequests[request.id] = request;
    let founderReward = null;
    if (isFounderTarget) {
      ensureFriendState(client.user.id).friends[target.id] = {
        since: request.respondedAt,
      };
      ensureFriendState(target.id).friends[client.user.id] = {
        since: request.respondedAt,
      };
      founderReward = awardFounderFriendXp(client.user);
    }
    db.save();
    send(client.ws, {
      type: "friend.requested",
      requestId: request.id,
      username,
      status: request.status,
    });
    if (isFounderTarget) {
      send(client.ws, {
        type: "friend.accepted",
        requestId: request.id,
        username: target.username,
      });
    }
    send(client.ws, friendsSnapshot(client));
    sendFounderFriendReward(client.user.id, founderReward);
    if (target) {
      const targetClient = clientByUserId(target.id);
      if (targetClient) send(targetClient.ws, friendsSnapshot(targetClient));
    }
  }

  function handleFriendAccept(client, msg) {
    if (!checkRate(client, "social", 10, 60_000))
      return send(client.ws, { type: "error", error: "rate_limited" });
    const request = db.data.friendRequests[msg.requestId];
    if (
      !request ||
      request.status !== "pending" ||
      request.toUserId !== client.user.id
    ) {
      return send(client.ws, {
        type: "error",
        error: "friend_request_not_found",
      });
    }
    request.status = "accepted";
    request.respondedAt = nowIso();
    ensureFriendState(client.user.id).friends[request.fromUserId] = {
      since: request.respondedAt,
    };
    ensureFriendState(request.fromUserId).friends[client.user.id] = {
      since: request.respondedAt,
    };
    const rewardUserId = isFounderUsername(client.user.username)
      ? request.fromUserId
      : isFounderUsername(request.fromUsername)
        ? client.user.id
        : "";
    const founderReward = rewardUserId
      ? awardFounderFriendXp(db.data.users[rewardUserId])
      : null;
    db.save();
    send(client.ws, {
      type: "friend.accepted",
      requestId: request.id,
      username: request.fromUsername,
    });
    send(client.ws, friendsSnapshot(client));
    const sourceClient = clientByUserId(request.fromUserId);
    if (sourceClient) {
      send(sourceClient.ws, friendsSnapshot(sourceClient));
    }
    sendFounderFriendReward(rewardUserId, founderReward);
  }

  function handleFriendBlock(client, msg) {
    if (!checkRate(client, "social", 10, 60_000))
      return send(client.ws, { type: "error", error: "rate_limited" });
    const username = normalizeUsername(msg.username, "");
    const target = findUserByUsername(username);
    const state = ensureFriendState(client.user.id);
    if (target) {
      state.blocked[target.id] = {
        username: target.username,
        createdAt: nowIso(),
      };
      delete state.friends[target.id];
      const targetState = ensureFriendState(target.id);
      delete targetState.friends[client.user.id];
    } else {
      state.blockedUsernames[username] = { createdAt: nowIso() };
    }
    db.save();
    send(client.ws, {
      type: "friend.blocked",
      username,
      userId: target?.id ?? "",
    });
    send(client.ws, friendsSnapshot(client));
  }

  function handleFriendReport(client, msg) {
    if (!checkRate(client, "report", 3, 60_000))
      return send(client.ws, { type: "error", error: "rate_limited" });
    const username = normalizeUsername(msg.username, "");
    const reason = sanitizeChat(msg.reason);
    if (!username || reason === "[blocked]")
      return send(client.ws, { type: "error", error: "report_rejected" });
    const target = findUserByUsername(username);
    const report = {
      id: randomUUID(),
      reporterUserId: client.user.id,
      reporterUsername: client.user.username,
      targetUserId: target?.id ?? "",
      targetUsername: username,
      reason,
      createdAt: nowIso(),
    };
    db.data.reports.push(report);
    db.save();
    send(client.ws, { type: "friend.reported", reportId: report.id, username });
  }

  function handleSaveSync(client, msg) {
    if (!checkRate(client, "save", 12, 60_000))
      return send(client.ws, { type: "error", error: "rate_limited" });
    const payload = normalizeServerDailyGiftPayload(
      msg.payload,
      db.data.saves[client.user.id]?.payload ?? {},
    );
    const saveXp = extractSaveXp(payload);
    const totalXp = Math.max(saveXp, Number(client.user.xp) || 0);
    client.user.xp = totalXp;
    client.user.rating = totalXp;
    client.user.updatedAt = nowIso();
    db.data.users[client.user.id] = client.user;
    upsertXpLeaderboard(db.data, client.user, totalXp);
    const row = {
      userId: client.user.id,
      schemaVersion: Number(msg.schemaVersion),
      payload,
      clientUpdatedAt: msg.clientUpdatedAt ?? null,
      serverUpdatedAt: nowIso(),
    };
    db.data.saves[client.user.id] = row;
    db.save();
    send(client.ws, {
      type: "save.synced",
      schemaVersion: row.schemaVersion,
      payload: row.payload,
      serverUpdatedAt: row.serverUpdatedAt,
    });
    sendLeaderboardSnapshot(client);
    send(client.ws, profileSnapshot(client));
  }

  function handleModerationAction(client, msg, action) {
    if (!checkRate(client, "moderation", 10, 60_000)) {
      return send(client.ws, { type: "error", error: "rate_limited" });
    }
    if (!isModeratorUser(client.user)) {
      return send(client.ws, { type: "error", error: "moderator_required" });
    }
    const target =
      (msg.userId && db.data.users[msg.userId]) ||
      findUserByUsername(msg.username || "");
    if (!target) {
      return send(client.ws, { type: "error", error: "player_not_found" });
    }
    if (target.id === client.user.id) {
      return send(client.ws, {
        type: "error",
        error: "moderation_self_rejected",
      });
    }
    const reason = sanitizeChat(msg.reason || "Moderator action");
    const record = {
      id: randomUUID(),
      action,
      moderatorUserId: client.user.id,
      moderatorUsername: client.user.username,
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
        byUserId: client.user.id,
        reason: record.reason,
        createdAt: record.createdAt,
      };
      db.data.bans[target.id] = banRecord;
      if (target.deviceId) {
        db.data.bans[`device:${target.deviceId}`] = {
          ...banRecord,
          userId: `device:${target.deviceId}`,
        };
      }
    }
    db.data.moderationLogs.push(record);
    db.save();

    for (const [targetId, targetClient] of clients.entries()) {
      if (targetClient.user?.id !== target.id) continue;
      leaveRoom(targetId);
      send(targetClient.ws, {
        type: action === "ban" ? "moderation.banned" : "moderation.kicked",
        username: target.username,
        until: record.until || null,
        reason: record.reason,
      });
      if (targetClient.sessionToken)
        delete db.data.sessions[targetClient.sessionToken];
      targetClient.ws.close(action === "ban" ? 4003 : 4002, action);
      clients.delete(targetId);
    }
    db.save();
    send(client.ws, {
      type: "moderation.done",
      action,
      username: target.username,
      userId: target.id,
      until: record.until || null,
    });
  }

  async function handleFeedbackSubmit(client, msg) {
    if (!checkRate(client, "feedback", 3, 60_000))
      return send(client.ws, { type: "error", error: "rate_limited" });
    const result = buildFeedbackRow(msg, client.user);
    if (!result.ok)
      return send(client.ws, { type: "error", error: result.error });
    db.data.feedback.push(result.row);
    db.save();
    let delivery = {
      delivery: "stored_email_failed",
      emailConfigured: hasResendConfig(options),
      emailError: "delivery_exception",
    };
    try {
      delivery = await deliverFeedback(result.row, options);
    } catch (error) {
      delivery.emailError = error?.message || "delivery_exception";
    }
    send(client.ws, {
      type: "feedback.received",
      feedbackId: result.row.id,
      ...delivery,
    });
  }

  wss.on("connection", (ws) => {
    const id = randomUUID();
    const guestUser = {
      id,
      username: `Guest-${id.slice(0, 4)}`,
      rating: 1000,
      online: true,
    };
    clients.set(id, {
      ws,
      user: guestUser,
      sessionToken: "",
      roomId: null,
      latestInput: null,
      rate: new Map(),
    });
    send(ws, { type: "hello", id, server: "InfernoDrift4" });

    ws.on("message", (raw) => {
      void (async () => {
        const parsed = validateClientMessage(raw);
        if (!parsed.ok) return send(ws, { type: "error", error: parsed.error });
        const client = clients.get(id);
        if (!client) return;
        const msg = parsed.data;

        if (!checkRate(client, "protocol", 60, 10_000)) {
          return send(ws, { type: "error", error: "rate_limited" });
        }

        if (msg.type === "ping") {
          send(ws, { type: "pong", at: msg.at ?? msg.t ?? Date.now() });
          return;
        }

        if (msg.type === "auth.guest" || msg.type === "reconnect") {
          if (msg.type === "reconnect") {
            if (!db.data.sessions[msg.sessionToken]) {
              return send(ws, { type: "error", error: "session_expired" });
            }
            msg.username = client.user.username;
            msg.deviceId = client.user.deviceId ?? "";
          }
          const auth = createOrRestoreUser(client, msg);
          const ban = activeBanForUser(auth.user.id, auth.user.deviceId);
          if (ban) {
            send(ws, {
              type: "error",
              error: "account_banned",
              until: ban.until,
            });
            ws.close(4003, "banned");
            return;
          }
          send(ws, {
            type: msg.type === "reconnect" ? "reconnect.ok" : "auth.ok",
            user: publicUser(auth.user),
            sessionToken: auth.sessionToken,
            restored: auth.restored,
            save: db.data.saves[auth.user.id] ?? null,
          });
          send(ws, profileSnapshot(client));
          send(ws, friendsSnapshot(client));
          send(ws, chatHistoryPayload(client));
          sendLeaderboardSnapshot(client);
          if (msg.roomCode) {
            const room = [...rooms.values()].find(
              (candidate) =>
                candidate.code === String(msg.roomCode).toUpperCase(),
            );
            if (room && room.players.size < room.size) joinRoom(id, room);
          }
          return;
        }

        if (msg.type === "auth.account") {
          const auth = await handleAccountAuth(client, msg);
          if (!auth.ok)
            return send(ws, {
              type: "error",
              error: auth.error,
              until: auth.until || null,
            });
          send(ws, {
            type: "auth.ok",
            user: publicUser(auth.user),
            sessionToken: auth.sessionToken,
            restored: auth.restored,
            save: db.data.saves[auth.user.id] ?? null,
          });
          send(ws, profileSnapshot(client));
          send(ws, friendsSnapshot(client));
          send(ws, chatHistoryPayload(client));
          sendLeaderboardSnapshot(client);
          return;
        }

        if (msg.type === "profile.claimUsername") {
          const result = claimUsername(client, msg);
          if (!result.ok)
            return send(ws, { type: "error", error: result.error });
          send(ws, {
            type: "profile.usernameClaimed",
            username: result.username,
            user: publicUser(client.user),
          });
          send(ws, profileSnapshot(client));
          sendLeaderboardSnapshot(client);
          return;
        }

        if (msg.type === "profile.get") {
          send(ws, profileSnapshot(client));
          return;
        }

        if (msg.type === "profile.logout") {
          handleProfileLogout(client);
          return;
        }

        if (msg.type === "profile.delete") {
          handleProfileDelete(client, msg);
          return;
        }

        if (msg.type === "room.create") {
          const room = makeRoom(normalizeRoomOptions(msg), "private");
          rooms.set(room.id, room);
          joinRoom(id, room);
          return;
        }

        if (msg.type === "queue.join") {
          const roomOptions = normalizeRoomOptions(msg);
          const room =
            findQueuedRoom(roomOptions) || makeRoom(roomOptions, "queue");
          if (!rooms.has(room.id)) rooms.set(room.id, room);
          send(ws, {
            type: "queue.joined",
            playlist: room.playlist,
            teamSize: room.teamSize,
            ranked: room.ranked,
            botFill: room.botFill,
          });
          joinRoom(id, room);
          return;
        }

        if (msg.type === "room.join") {
          const room = [...rooms.values()].find(
            (candidate) =>
              candidate.code === String(msg.code || "").toUpperCase(),
          );
          if (!room)
            return send(ws, { type: "error", error: "room_not_found" });
          if (room.players.size >= room.size && !room.players.has(id))
            return send(ws, { type: "error", error: "room_full" });
          joinRoom(id, room);
          return;
        }

        if (msg.type === "room.leave" || msg.type === "queue.cancel") {
          leaveRoom(id, { notify: true });
          return;
        }

        if (msg.type === "room.share") {
          if (!checkRate(client, "room-share", 4, 60_000))
            return send(ws, { type: "error", error: "rate_limited" });
          const room = rooms.get(client.roomId);
          if (!room?.code)
            return send(ws, { type: "error", error: "no_room_code" });
          room.sharedBy ??= new Set();
          if (room.sharedBy.has(client.user.id)) {
            send(ws, {
              type: "room.shared",
              code: room.code,
              status: "already_shared",
            });
            return;
          }
          room.sharedBy.add(client.user.id);
          const payload = {
            type: "chat.message",
            from: client.user.username,
            userId: client.user.id,
            badge: client.user.badge || "",
            moderator: isModeratorUser(client.user),
            text: `Room code ${room.code}`,
            quick: true,
            at: nowIso(),
            channel: "lobby",
            roomCode: room.code,
            roomMode: room.mode,
            roomInvite: {
              code: room.code,
              mode: room.mode,
              playlist: room.playlist,
              teamSize: room.teamSize,
              size: room.size,
            },
          };
          pruneChatMessages();
          db.data.chatMessages.push({
            id: randomUUID(),
            channel: "lobby",
            from: payload.from,
            userId: payload.userId,
            badge: payload.badge,
            moderator: payload.moderator,
            text: payload.text,
            quick: true,
            createdAt: payload.at,
          });
          db.save();
          broadcastAll(payload, client.user.id);
          send(ws, { type: "room.shared", code: room.code, status: "shared" });
          broadcast(room, roomSnapshot(room));
          return;
        }

        if (msg.type === "chat.send" || msg.type === "quick.send") {
          if (!checkRate(client, "chat", 5, 5000))
            return send(ws, { type: "error", error: "rate_limited" });
          if (
            msg.type === "chat.send" &&
            (!Number.isInteger(client.user.age) || client.user.age < 13)
          ) {
            return send(ws, { type: "error", error: "chat_requires_13_plus" });
          }
          const text =
            msg.type === "quick.send" && QUICK_CHAT.has(msg.text)
              ? msg.text
              : sanitizeChat(msg.text);
          if (!text || text === "[blocked]")
            return send(ws, { type: "error", error: "message_blocked" });
          const direct = resolveDirectChatTarget(client, msg);
          if (!direct.ok)
            return send(ws, { type: "error", error: direct.error });
          const room = rooms.get(client.roomId);
          const channel = direct.direct
            ? direct.channel
            : room
              ? `room:${room.code || room.id}`
              : "lobby";
          const payload = {
            type: "chat.message",
            from: client.user.username,
            userId: client.user.id,
            badge: client.user.badge || "",
            moderator: isModeratorUser(client.user),
            text,
            quick: msg.type === "quick.send",
            at: nowIso(),
            channel,
            direct: Boolean(direct.direct),
            toUserId: direct.target?.id ?? "",
            toUsername: direct.target?.username ?? "",
          };
          pruneChatMessages();
          db.data.chatMessages.push({
            id: randomUUID(),
            channel,
            from: payload.from,
            userId: payload.userId,
            badge: payload.badge,
            moderator: payload.moderator,
            text: payload.text,
            quick: payload.quick,
            createdAt: payload.at,
          });
          db.save();
          if (direct.direct) {
            send(ws, payload);
            if (direct.targetClient) send(direct.targetClient.ws, payload);
          } else if (room) broadcast(room, payload, client.user.id);
          else broadcastAll(payload, client.user.id);
          return;
        }

        if (msg.type === "input.frame") {
          const input = sanitizeLiveInput(msg);
          client.latestInput = input;
          send(ws, { type: "input.accepted", tick: input.tick });
          const room = rooms.get(client.roomId);
          if (room) {
            broadcast(room, {
              type: "match.snapshot",
              roomCode: room.code || "",
              mode: room.mode || "",
              tick: Date.now(),
              players: [...room.players].map((playerId) => ({
                id: clients.get(playerId)?.user.id,
                username: clients.get(playerId)?.user.username,
                badge: clients.get(playerId)?.user.badge || "",
                moderator: isModeratorUser(clients.get(playerId)?.user),
                input: clients.get(playerId)?.latestInput ?? null,
              })),
            });
          }
          return;
        }

        if (msg.type === "leaderboard.get") {
          sendLeaderboardSnapshot(client, msg.playlist);
          return;
        }

        if (msg.type === "save.sync") {
          handleSaveSync(client, msg);
          return;
        }

        if (msg.type === "friend.request") {
          handleFriendRequest(client, msg);
          return;
        }

        if (msg.type === "friend.accept") {
          handleFriendAccept(client, msg);
          return;
        }

        if (msg.type === "friend.block") {
          handleFriendBlock(client, msg);
          return;
        }

        if (msg.type === "friend.report") {
          handleFriendReport(client, msg);
          return;
        }

        if (msg.type === "friend.list") {
          send(ws, friendsSnapshot(client));
          return;
        }

        if (msg.type === "feedback.submit") {
          await handleFeedbackSubmit(client, msg);
          return;
        }

        if (msg.type === "moderation.kick") {
          handleModerationAction(client, msg, "kick");
          return;
        }

        if (msg.type === "moderation.ban") {
          handleModerationAction(client, msg, "ban");
        }
      })().catch(() => send(ws, { type: "error", error: "server_error" }));
    });

    ws.on("close", () => {
      const client = clients.get(id);
      if (client?.user?.id && db.data.users[client.user.id]) {
        db.data.users[client.user.id].online = false;
        db.data.users[client.user.id].updatedAt = nowIso();
        db.save();
      }
      leaveRoom(id);
      clients.delete(id);
    });
  });

  return {
    server,
    wss,
    rooms,
    clients,
    db,
    listen: () =>
      new Promise((resolve) => server.listen(port, () => resolve(server))),
    close: () =>
      new Promise((resolve) => {
        for (const client of clients.values()) client.ws.close();
        wss.close(() => server.close(resolve));
      }),
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  loadLocalEnvFile();
  const app = createInfernoServer();
  app.listen().then((server) => {
    const address = server.address();
    console.log(
      `InfernoDrift4 backend listening on ${typeof address === "object" ? address.port : address}`,
    );
  });
}
