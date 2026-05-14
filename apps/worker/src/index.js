import {
  QUICK_CHAT,
  makePrivateCode,
  normalizeRoomSize,
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

export class InfernoRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map();
    this.room = {
      id: state.id?.toString?.() ?? "room",
      code: "",
      mode: "casual",
      size: 6,
      ranked: false,
      botFill: true,
    };
    this.leaderboard = [
      { username: "Ghost Apex", rating: 1480 },
      { username: "Cinderline", rating: 1320 },
      { username: "Neon Rookie", rating: 1000 },
    ];
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
      send(session.ws, { type: "pong", at: msg.at ?? Date.now() });
      return;
    }
    if (msg.type === "auth.guest") {
      session.user.username =
        sanitizeChat(msg.username || session.user.username).slice(0, 24) ||
        session.user.username;
      send(session.ws, { type: "auth.ok", user: session.user });
      this.broadcast(this.friendsSnapshot());
      return;
    }
    if (
      msg.type === "room.create" ||
      msg.type === "room.join" ||
      msg.type === "queue.join"
    ) {
      this.room.code = String(
        msg.code || this.room.code || makePrivateCode(),
      ).toUpperCase();
      this.room.mode = msg.mode || this.room.mode;
      this.room.size = normalizeRoomSize(msg.size);
      this.room.ranked = Boolean(msg.ranked);
      this.room.botFill = msg.botFill !== false;
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
        tick: Number(msg.tick ?? 0),
        x: Number(msg.x ?? 0),
        z: Number(msg.z ?? 0),
        speed: Number(msg.speed ?? 0),
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
        leaderboard: this.leaderboard,
      });
      return;
    }
    if (msg.type === "friend.request" || msg.type === "friend.list") {
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

  roomSnapshot() {
    const players = [...this.sessions.values()].map((session) => session.user);
    return {
      type: "room.snapshot",
      room: {
        ...this.room,
        players,
        bots: this.room.botFill
          ? Math.max(0, this.room.size - players.length)
          : 0,
        leaderboard: this.leaderboard,
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
