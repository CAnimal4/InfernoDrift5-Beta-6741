import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
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

function loadDb(dataDir) {
  fs.mkdirSync(dataDir, { recursive: true });
  const file = path.join(dataDir, "infernodrift4-db.json");
  if (!fs.existsSync(file))
    fs.writeFileSync(
      file,
      JSON.stringify({ users: {}, leaderboard: DEFAULT_LEADERBOARD }, null, 2),
    );
  return {
    file,
    data: JSON.parse(fs.readFileSync(file, "utf8")),
    save() {
      fs.writeFileSync(file, JSON.stringify(this.data, null, 2));
    },
  };
}

function makeCode() {
  return makePrivateCode();
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
  const db = loadDb(dataDir);
  if (!Array.isArray(db.data.leaderboard) || db.data.leaderboard.length === 0) {
    db.data.leaderboard = DEFAULT_LEADERBOARD;
    db.save();
  }
  const rooms = new Map();
  const clients = new Map();
  const rate = new Map();

  const server = http.createServer((req, res) => {
    if (req.url === "/health") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          ok: true,
          server: "InfernoDrift4",
          rooms: rooms.size,
          clients: clients.size,
        }),
      );
      return;
    }
    res.writeHead(404);
    res.end("not found");
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

  function broadcast(room, payload) {
    for (const id of room.players) {
      const peer = clients.get(id);
      if (peer) send(peer.ws, payload);
    }
  }

  function leaderboardSnapshot(playlist = "") {
    const rows = Array.isArray(db.data.leaderboard)
      ? db.data.leaderboard
      : DEFAULT_LEADERBOARD;
    const filtered =
      playlist && playlist !== "casual"
        ? rows.filter((row) => !row.playlist || row.playlist === playlist)
        : rows;
    return (filtered.length ? filtered : rows).slice(0, 10);
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

  function friendsSnapshot() {
    return {
      type: "friends.snapshot",
      friends: [],
      recentPlayers: [...clients.values()].map((peer) => peer.user),
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
          .map((id) => clients.get(id)?.user)
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

  wss.on("connection", (ws) => {
    const id = randomUUID();
    clients.set(id, {
      ws,
      user: {
        id,
        username: `Guest-${id.slice(0, 4)}`,
        rating: 1000,
        online: true,
      },
      roomId: null,
      latestInput: null,
    });
    send(ws, { type: "hello", id, server: "InfernoDrift4" });

    ws.on("message", (raw) => {
      const parsed = validateClientMessage(raw);
      if (!parsed.ok) return send(ws, { type: "error", error: parsed.error });
      const client = clients.get(id);
      if (!client) return;
      const msg = parsed.data;

      if (msg.type === "ping") {
        send(ws, { type: "pong", at: msg.at ?? msg.t ?? Date.now() });
        return;
      }

      if (msg.type === "auth.guest") {
        const username = normalizeUsername(
          msg.username || client.user.username,
          client.user.username,
        );
        client.user = {
          ...client.user,
          username,
          age: msg.age === undefined ? undefined : Number(msg.age),
          deviceId: msg.deviceId,
          online: true,
        };
        db.data.users[id] = client.user;
        db.save();
        send(ws, { type: "auth.ok", user: client.user });
        send(ws, friendsSnapshot());
        return;
      }

      if (msg.type === "room.create") {
        const room = makeRoom(normalizeRoomOptions(msg), "private");
        rooms.set(room.id, room);
        joinRoom(id, room);
        return;
      }

      if (msg.type === "queue.join") {
        const options = normalizeRoomOptions(msg);
        const room = findQueuedRoom(options) || makeRoom(options, "queue");
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
        if (!room) return send(ws, { type: "error", error: "room_not_found" });
        if (room.players.size >= room.size && !room.players.has(id)) {
          return send(ws, { type: "error", error: "room_full" });
        }
        joinRoom(id, room);
        return;
      }

      if (msg.type === "room.leave" || msg.type === "queue.cancel") {
        leaveRoom(id, { notify: true });
        return;
      }

      if (msg.type === "chat.send" || msg.type === "quick.send") {
        const now = Date.now();
        const bucket = rate.get(id) ?? [];
        const recent = bucket.filter((time) => now - time < 5000);
        if (recent.length >= 5)
          return send(ws, { type: "error", error: "rate_limited" });
        recent.push(now);
        rate.set(id, recent);
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
        if (!text) return;
        const room = rooms.get(client.roomId);
        const payload = {
          type: "chat.message",
          from: client.user.username,
          text,
          quick: msg.type === "quick.send",
        };
        if (room) broadcast(room, payload);
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

      if (msg.type === "friend.request") {
        send(ws, {
          type: "friend.requested",
          username: normalizeUsername(msg.username, msg.username),
          status: "pending",
        });
        send(ws, friendsSnapshot());
        return;
      }

      if (msg.type === "friend.list") {
        send(ws, friendsSnapshot());
      }
    });

    ws.on("close", () => {
      leaveRoom(id);
      clients.delete(id);
      rate.delete(id);
    });
  });

  return {
    server,
    wss,
    rooms,
    clients,
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
  const app = createInfernoServer();
  app.listen().then((server) => {
    const address = server.address();
    console.log(
      `InfernoDrift4 backend listening on ${typeof address === "object" ? address.port : address}`,
    );
  });
}
