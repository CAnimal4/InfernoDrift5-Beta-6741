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

const DEFAULT_LEADERBOARD = [
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

const ALLOWED_FEEDBACK_TYPES = new Set(["bug", "feature", "fix", "other"]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

function nowIso() {
  return new Date().toISOString();
}

const cryptoRuntime = globalThis.crypto ?? webcrypto;
const textEncoder = new TextEncoder();

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
      iterations: 120000,
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
    feedback: [],
    leaderboard: DEFAULT_LEADERBOARD,
  };
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
  db.feedback = Array.isArray(db.feedback) ? db.feedback : [];
  db.leaderboard =
    Array.isArray(db.leaderboard) && db.leaderboard.length
      ? db.leaderboard
      : DEFAULT_LEADERBOARD;
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
  };
}

function makeCode() {
  return makePrivateCode();
}

function compareLeaderboard(a, b) {
  return getLeaderboardXp(b) - getLeaderboardXp(a);
}

function getLeaderboardXp(row) {
  return Math.max(
    0,
    Math.floor(
      Number(row?.xp ?? row?.totalXp ?? row?.score ?? row?.rating) || 0,
    ),
  );
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

async function deliverFeedback(row, options) {
  const apiKey = options.resendApiKey ?? process.env.RESEND_API_KEY;
  const to =
    options.feedbackTo ??
    options.feedbackEmailTo ??
    process.env.FEEDBACK_TO ??
    process.env.FEEDBACK_EMAIL_TO;
  if (!apiKey || !to || typeof fetch !== "function") return "stored";
  const from =
    options.feedbackFrom ??
    options.feedbackEmailFrom ??
    process.env.FEEDBACK_FROM ??
    process.env.FEEDBACK_EMAIL_FROM ??
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
  const clarkReservationToken =
    options.clarkReservationToken ?? process.env.CLARK_RESERVATION_TOKEN ?? "";
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
          resend: Boolean(
            process.env.RESEND_API_KEY &&
            (process.env.FEEDBACK_TO || process.env.FEEDBACK_EMAIL_TO),
          ),
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
          delivery,
          emailConfigured: delivery === "delivered",
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

  function clientByUserId(userId) {
    return [...clients.values()].find((client) => client.user.id === userId);
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

  function checkRate(client, key, limit, windowMs) {
    const now = Date.now();
    const bucket = client.rate.get(key) ?? [];
    const recent = bucket.filter((time) => now - time < windowMs);
    if (recent.length >= limit) return false;
    recent.push(now);
    client.rate.set(key, recent);
    return true;
  }

  function leaderboardSnapshot(playlist = "") {
    const rows = Array.isArray(db.data.leaderboard)
      ? db.data.leaderboard
      : DEFAULT_LEADERBOARD;
    const rankedRows = (rows.length ? rows : DEFAULT_LEADERBOARD)
      .map((row) => ({
        id: row.id ?? `server-${claimKey(row.username) || randomUUID()}`,
        username: normalizeUsername(row.username, "Driver"),
        xp: getLeaderboardXp(row),
        totalXp: getLeaderboardXp(row),
        rating: getLeaderboardXp(row),
        score: getLeaderboardXp(row),
        playlist: "all modes",
        requestedPlaylist: playlist || "all",
        scope: "Total XP",
        source: "server",
      }))
      .sort(compareLeaderboard)
      .slice(0, 10);
    return rankedRows;
  }

  function buildBotPlayers(room) {
    if (!room.botFill) return [];
    return BOT_NAMES.slice(0, Math.max(0, room.size - room.players.size)).map(
      (name, index) => ({
        id: `bot-${room.id}-${index + 1}`,
        username: name,
        rating: 900 + index * 25,
        bot: true,
      }),
    );
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
        players: [...room.players]
          .map((id) => publicUser(clients.get(id)?.user))
          .filter(Boolean),
        bots: bots.length,
        botPlayers: bots,
        leaderboard: leaderboardSnapshot(room.playlist),
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
      code: makeCode(),
      source,
      mode: options.mode,
      playlist: options.playlist,
      size: options.size,
      teamSize: options.teamSize,
      ranked: options.ranked,
      botFill: options.botFill,
      players: new Set(),
    };
  }

  function joinRoom(id, room) {
    const client = clients.get(id);
    if (!client) return;
    if (client.roomId && client.roomId !== room.id) leaveRoom(id);
    room.players.add(id);
    client.roomId = room.id;
    broadcast(room, roomSnapshot(room));
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
    };
    db.data.users[userId] = user;
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
    if (
      key === "clark" &&
      (!clarkReservationToken || msg.turnstileToken !== clarkReservationToken)
    ) {
      return { ok: false, error: "username_reserved" };
    }
    const ownerId = db.data.usernameClaims[key];
    const existing = ownerId ? db.data.users[ownerId] : null;
    const mode = msg.mode ?? "auto";
    if (!existing && mode === "signin")
      return { ok: false, error: "account_not_found" };
    if (existing && !existing.passwordHash)
      return { ok: false, error: "account_requires_upgrade" };

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
        online: true,
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
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
    }
    const sessionToken = randomUUID();
    db.data.users[user.id] = user;
    db.data.usernameClaims[key] = user.id;
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
    const request = {
      id: randomUUID(),
      fromUserId: client.user.id,
      fromUsername: client.user.username,
      toUserId: target?.id ?? "",
      toUsername: username,
      status: "pending",
      createdAt: nowIso(),
    };
    db.data.friendRequests[request.id] = request;
    db.save();
    send(client.ws, {
      type: "friend.requested",
      requestId: request.id,
      username,
      status: "pending",
    });
    send(client.ws, friendsSnapshot(client));
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
    db.save();
    send(client.ws, {
      type: "friend.accepted",
      requestId: request.id,
      username: request.fromUsername,
    });
    send(client.ws, friendsSnapshot(client));
    const sourceClient = clientByUserId(request.fromUserId);
    if (sourceClient) send(sourceClient.ws, friendsSnapshot(sourceClient));
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
    const saveXp = extractSaveXp(msg.payload);
    const totalXp = Math.max(saveXp, Number(client.user.xp) || 0);
    client.user.xp = totalXp;
    client.user.rating = totalXp;
    client.user.updatedAt = nowIso();
    db.data.users[client.user.id] = client.user;
    db.data.leaderboard = [
      {
        id: `xp-${client.user.id}`,
        userId: client.user.id,
        username: client.user.username,
        xp: totalXp,
        totalXp,
        score: totalXp,
        rating: totalXp,
        playlist: "all modes",
        scope: "Total XP",
        source: "server",
        updatedAt: nowIso(),
      },
      ...db.data.leaderboard.filter(
        (row) =>
          row.id !== `xp-${client.user.id}` && row.userId !== client.user.id,
      ),
    ].sort(compareLeaderboard);
    const row = {
      userId: client.user.id,
      schemaVersion: Number(msg.schemaVersion),
      payload: msg.payload,
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
  }

  async function handleFeedbackSubmit(client, msg) {
    if (!checkRate(client, "feedback", 3, 60_000))
      return send(client.ws, { type: "error", error: "rate_limited" });
    const result = buildFeedbackRow(msg, client.user);
    if (!result.ok)
      return send(client.ws, { type: "error", error: result.error });
    db.data.feedback.push(result.row);
    db.save();
    let delivery = "stored";
    try {
      delivery = await deliverFeedback(result.row, options);
    } catch {
      delivery = "stored";
    }
    send(client.ws, {
      type: "feedback.received",
      feedbackId: result.row.id,
      delivery,
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
            msg.username = client.user.username;
            msg.deviceId = client.user.deviceId ?? "";
          }
          const auth = createOrRestoreUser(client, msg);
          send(ws, {
            type: msg.type === "reconnect" ? "reconnect.ok" : "auth.ok",
            user: publicUser(auth.user),
            sessionToken: auth.sessionToken,
            restored: auth.restored,
            save: db.data.saves[auth.user.id] ?? null,
          });
          send(ws, friendsSnapshot(client));
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
          if (!auth.ok) return send(ws, { type: "error", error: auth.error });
          send(ws, {
            type: "auth.ok",
            user: publicUser(auth.user),
            sessionToken: auth.sessionToken,
            restored: auth.restored,
            save: db.data.saves[auth.user.id] ?? null,
          });
          send(ws, friendsSnapshot(client));
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

        if (msg.type === "chat.send" || msg.type === "quick.send") {
          if (!checkRate(client, "chat", 5, 5000))
            return send(ws, { type: "error", error: "rate_limited" });
          if (
            msg.type === "chat.send" &&
            Number.isInteger(client.user.age) &&
            client.user.age < 13
          ) {
            return send(ws, { type: "error", error: "chat_requires_13_plus" });
          }
          const text =
            msg.type === "quick.send" && QUICK_CHAT.has(msg.text)
              ? msg.text
              : sanitizeChat(msg.text);
          if (!text || text === "[blocked]")
            return send(ws, { type: "error", error: "message_blocked" });
          const room = rooms.get(client.roomId);
          const payload = {
            type: "chat.message",
            from: client.user.username,
            userId: client.user.id,
            text,
            quick: msg.type === "quick.send",
          };
          if (room) broadcast(room, payload, client.user.id);
          else send(ws, payload);
          return;
        }

        if (msg.type === "input.frame") {
          const input = {
            tick: Number(msg.tick ?? msg.seq ?? 0),
            x: Number(msg.x ?? msg.client?.x ?? 0),
            z: Number(msg.z ?? msg.client?.z ?? 0),
            speed: Number(msg.speed ?? msg.client?.speed ?? 0),
            at: Date.now(),
          };
          client.latestInput = input;
          send(ws, { type: "input.accepted", tick: input.tick });
          const room = rooms.get(client.roomId);
          if (room) {
            broadcast(room, {
              type: "match.snapshot",
              players: [...room.players].map((playerId) => ({
                id: clients.get(playerId)?.user.id,
                username: clients.get(playerId)?.user.username,
                input: clients.get(playerId)?.latestInput ?? null,
              })),
            });
          }
          return;
        }

        if (msg.type === "leaderboard.get") {
          send(ws, {
            type: "leaderboard.snapshot",
            leaderboard: leaderboardSnapshot(msg.playlist),
          });
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
