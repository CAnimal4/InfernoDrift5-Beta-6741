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

const DEFAULT_LEADERBOARD = [
  { username: "Ghost Apex", rating: 1480, playlist: "ranked" },
  { username: "Cinderline", rating: 1320, playlist: "casual" },
  { username: "Neon Rookie", rating: 1000, playlist: "casual" },
];

const BOT_NAMES = [
  "Ash Bot",
  "Boost Bot",
  "Cinder Bot",
  "Drift Bot",
  "Ember Bot",
  "Flux Bot",
];

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
    this.leaderboard = DEFAULT_LEADERBOARD;
  }

  async fetch(request) {
    if (request.headers.get("upgrade") !== "websocket") {
      return json({ ok: true, room: this.room, players: this.sessions.size });
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
      rate: [],
      latestInput: null,
    });
    ws.accept();
    send(ws, { type: "hello", id, server: "InfernoDrift4 Worker" });
    send(ws, this.roomSnapshot());
    ws.addEventListener("message", (event) => this.onMessage(id, event.data));
    ws.addEventListener("close", () => this.onClose(id));
    ws.addEventListener("error", () => this.onClose(id));
  }

  onMessage(id, raw) {
    const session = this.sessions.get(id);
    if (!session) return;
    const parsed = validateClientMessage(raw);
    if (!parsed.ok)
      return send(session.ws, { type: "error", error: parsed.error });
    const msg = parsed.data;
    if (msg.type === "ping") {
      send(session.ws, { type: "pong", at: msg.at ?? msg.t ?? Date.now() });
      return;
    }
    if (msg.type === "auth.guest") {
      session.user.username = normalizeUsername(
        msg.username || session.user.username,
        session.user.username,
      );
      session.user.age = msg.age === undefined ? undefined : Number(msg.age);
      session.user.deviceId = msg.deviceId;
      send(session.ws, { type: "auth.ok", user: session.user });
      send(session.ws, this.friendsSnapshot());
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
    if (msg.type === "friend.request") {
      send(session.ws, {
        type: "friend.requested",
        username: normalizeUsername(msg.username, msg.username),
        status: "pending",
      });
      send(session.ws, this.friendsSnapshot());
      return;
    }
    if (msg.type === "friend.list") {
      send(session.ws, this.friendsSnapshot());
    }
  }

  handleChat(id, msg) {
    const session = this.sessions.get(id);
    const now = Date.now();
    session.rate = session.rate.filter((time) => now - time < 5000);
    if (session.rate.length >= 5) {
      send(session.ws, { type: "error", error: "rate_limited" });
      return;
    }
    session.rate.push(now);
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
    if (!text) return;
    this.broadcast({
      type: "chat.message",
      from: session.user.username,
      text,
      quick: msg.type === "quick.send",
    });
  }

  onClose(id) {
    this.sessions.delete(id);
    this.broadcast(this.roomSnapshot());
  }

  broadcast(payload, exceptId = "") {
    for (const [id, session] of this.sessions) {
      if (id !== exceptId) send(session.ws, payload);
    }
  }

  leaderboardSnapshot(playlist = "") {
    const filtered =
      playlist && playlist !== "casual"
        ? this.leaderboard.filter(
            (row) => !row.playlist || row.playlist === playlist,
          )
        : this.leaderboard;
    return (filtered.length ? filtered : this.leaderboard).slice(0, 10);
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
    const players = [...this.sessions.values()].map((session) => session.user);
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

  friendsSnapshot() {
    const players = [...this.sessions.values()].map((session) => session.user);
    return {
      type: "friends.snapshot",
      friends: [],
      recentPlayers: players,
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
      });
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
