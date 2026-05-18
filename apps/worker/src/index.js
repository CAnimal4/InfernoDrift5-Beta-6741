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
      iterations: 120000,
      hash: "SHA-256",
    },
    key,
    256,
  );
  return bytesToHex(bits);
}

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

function emptyData() {
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
  state.feedback = Array.isArray(state.feedback) ? state.feedback : [];
  state.leaderboard =
    Array.isArray(state.leaderboard) && state.leaderboard.length
      ? state.leaderboard
      : DEFAULT_LEADERBOARD;
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
  };
}

async function deliverFeedback(row, env) {
  const apiKey = env.RESEND_API_KEY;
  const to = env.FEEDBACK_TO ?? env.FEEDBACK_EMAIL_TO;
  if (!apiKey || !to) return "stored";
  const from =
    env.FEEDBACK_FROM ??
    env.FEEDBACK_EMAIL_FROM ??
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
    this.data = normalizeData(stored);
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
    });
    ws.accept();
    send(ws, { type: "hello", id, server: "InfernoDrift4 Worker" });
    send(ws, this.roomSnapshot());
    ws.addEventListener("message", (event) => {
      this.onMessage(id, event.data).catch(() =>
        send(ws, { type: "error", error: "server_error" }),
      );
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

  isBlockedBetween(fromUserId, toUserId) {
    const fromState = this.data.friends[fromUserId] ?? {};
    const toState = this.data.friends[toUserId] ?? {};
    return Boolean(
      fromState.blocked?.[toUserId] || toState.blocked?.[fromUserId],
    );
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
    if (
      key === "clark" &&
      (!this.env.CLARK_RESERVATION_TOKEN ||
        msg.turnstileToken !== this.env.CLARK_RESERVATION_TOKEN)
    ) {
      return { ok: false, error: "username_reserved" };
    }
    const ownerId = this.data.usernameClaims[key];
    const existing = ownerId ? this.data.users[ownerId] : null;
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
      (!this.env.CLARK_RESERVATION_TOKEN ||
        msg.turnstileToken !== this.env.CLARK_RESERVATION_TOKEN)
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
        msg.username = session.user.username;
        msg.deviceId = session.user.deviceId ?? "";
      }
      const auth = this.createOrRestoreUser(session, msg);
      await this.persist();
      send(session.ws, {
        type: msg.type === "reconnect" ? "reconnect.ok" : "auth.ok",
        user: publicUser(auth.user),
        sessionToken: auth.sessionToken,
        restored: auth.restored,
        save: this.data.saves[auth.user.id] ?? null,
      });
      send(session.ws, this.friendsSnapshot(session));
      return;
    }
    if (msg.type === "auth.account") {
      const auth = await this.handleAccountAuth(session, msg);
      if (!auth.ok)
        return send(session.ws, { type: "error", error: auth.error });
      await this.persist();
      send(session.ws, {
        type: "auth.ok",
        user: publicUser(auth.user),
        sessionToken: auth.sessionToken,
        restored: auth.restored,
        save: this.data.saves[auth.user.id] ?? null,
      });
      send(session.ws, this.friendsSnapshot(session));
      this.broadcast(this.roomSnapshot());
      return;
    }
    if (msg.type === "profile.claimUsername") {
      const result = this.claimUsername(session, msg);
      if (!result.ok)
        return send(session.ws, { type: "error", error: result.error });
      await this.persist();
      send(session.ws, {
        type: "profile.usernameClaimed",
        username: result.username,
        user: publicUser(session.user),
      });
      this.broadcast(this.roomSnapshot());
      return;
    }
    if (msg.type === "room.create" || msg.type === "queue.join") {
      const roomOptions = normalizeRoomOptions(msg);
      this.room.code = (this.room.code || makePrivateCode()).toUpperCase();
      this.room.mode = roomOptions.mode;
      this.room.playlist = roomOptions.playlist;
      this.room.size = roomOptions.size;
      this.room.teamSize = roomOptions.teamSize;
      this.room.ranked = roomOptions.ranked;
      this.room.botFill = roomOptions.botFill;
      await this.persist();
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
      return;
    }
    if (msg.type === "room.join") {
      this.room.code = String(msg.code || this.room.code).toUpperCase();
      await this.persist();
      this.broadcast(this.roomSnapshot());
      return;
    }
    if (msg.type === "room.leave" || msg.type === "queue.cancel") {
      send(session.ws, { type: "room.left" });
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
      Number.isInteger(session.user.age) &&
      session.user.age < 13
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
    this.broadcast(
      {
        type: "chat.message",
        from: session.user.username,
        userId: session.user.id,
        text,
        quick: msg.type === "quick.send",
      },
      "",
      session.user.id,
    );
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
    await this.persist();
    send(session.ws, {
      type: "save.synced",
      schemaVersion: row.schemaVersion,
      payload: row.payload,
      serverUpdatedAt: row.serverUpdatedAt,
    });
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
    if (session?.user?.id && this.data.users[session.user.id]) {
      this.data.users[session.user.id].online = false;
      this.data.users[session.user.id].updatedAt = nowIso();
      this.persist().catch(() => {});
    }
    this.sessions.delete(id);
    this.broadcast(this.roomSnapshot());
  }

  broadcast(payload, exceptId = "", fromUserId = "") {
    for (const [id, session] of this.sessions) {
      if (id === exceptId) continue;
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
      .map((row) => ({
        id: row.id ?? `server-${claimKey(row.username) || crypto.randomUUID()}`,
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
  }

  botPlayers() {
    if (!this.room.botFill) return [];
    return BOT_NAMES.slice(
      0,
      Math.max(0, this.room.size - this.sessions.size),
    ).map((name, index) => ({
      id: `bot-${this.room.id}-${index + 1}`,
      username: name,
      rating: 900 + index * 25,
      bot: true,
    }));
  }

  roomSnapshot() {
    const players = [...this.sessions.values()].map((session) =>
      publicUser(session.user),
    );
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
      players: [...this.sessions.values()].map((session) => ({
        id: session.user.id,
        username: session.user.username,
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
          resend: Boolean(
            env.RESEND_API_KEY && (env.FEEDBACK_TO || env.FEEDBACK_EMAIL_TO),
          ),
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
