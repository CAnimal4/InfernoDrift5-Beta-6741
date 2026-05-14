import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { WebSocketServer } from "ws";

const QUICK_CHAT = new Set([
  "Nice drift!",
  "Defending",
  "Need boost",
  "Centering",
  "Good run!",
  "Again?",
]);
const BAD_WORDS = /\b(?:damn|hell|shit|fuck|bitch|asshole)\b/gi;

export function sanitizeChat(input) {
  return String(input ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(BAD_WORDS, "boost")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

export function validateClientMessage(raw) {
  let data;
  try {
    data =
      typeof raw === "string" ? JSON.parse(raw) : JSON.parse(raw.toString());
  } catch {
    return { ok: false, error: "invalid_json" };
  }
  if (!data || typeof data !== "object" || typeof data.type !== "string")
    return { ok: false, error: "invalid_shape" };
  const allowed = new Set([
    "hello",
    "auth.guest",
    "room.create",
    "room.join",
    "queue.join",
    "chat.send",
    "quick.send",
    "input.frame",
    "friend.request",
  ]);
  if (!allowed.has(data.type)) return { ok: false, error: "unknown_type" };
  return { ok: true, data };
}

function loadDb(dataDir) {
  fs.mkdirSync(dataDir, { recursive: true });
  const file = path.join(dataDir, "infernodrift4-db.json");
  if (!fs.existsSync(file))
    fs.writeFileSync(
      file,
      JSON.stringify({ users: {}, leaderboard: [] }, null, 2),
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
  return Math.random().toString(36).slice(2, 8).toUpperCase();
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
      if (
        !allowedOrigins.length ||
        !origin ||
        allowedOrigins.includes(origin) ||
        allowedOrigins.some((allowed) => origin.startsWith(allowed))
      )
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

  function roomSnapshot(room) {
    return {
      type: "room.snapshot",
      room: {
        id: room.id,
        code: room.code,
        mode: room.mode,
        size: room.size,
        ranked: room.ranked,
        players: [...room.players]
          .map((id) => clients.get(id)?.user)
          .filter(Boolean),
        bots: Math.max(0, room.size - room.players.size),
        leaderboard: db.data.leaderboard.slice(0, 10),
      },
    };
  }

  wss.on("connection", (ws) => {
    const id = randomUUID();
    clients.set(id, {
      ws,
      user: { id, username: `Guest-${id.slice(0, 4)}`, rating: 1000 },
      roomId: null,
    });
    send(ws, { type: "hello", id, server: "InfernoDrift4" });

    ws.on("message", (raw) => {
      const parsed = validateClientMessage(raw);
      if (!parsed.ok) return send(ws, { type: "error", error: parsed.error });
      const client = clients.get(id);
      const msg = parsed.data;

      if (msg.type === "auth.guest") {
        const username =
          sanitizeChat(msg.username || client.user.username).slice(0, 24) ||
          client.user.username;
        client.user = { ...client.user, username };
        db.data.users[id] = client.user;
        db.save();
        send(ws, { type: "auth.ok", user: client.user });
      }

      if (msg.type === "room.create" || msg.type === "queue.join") {
        const size = [2, 4, 6].includes(Number(msg.size))
          ? Number(msg.size)
          : 2;
        const room = {
          id: randomUUID(),
          code: makeCode(),
          mode: msg.mode || "campaign",
          size,
          ranked: Boolean(msg.ranked),
          players: new Set([id]),
        };
        rooms.set(room.id, room);
        client.roomId = room.id;
        send(ws, roomSnapshot(room));
      }

      if (msg.type === "room.join") {
        const room = [...rooms.values()].find(
          (candidate) =>
            candidate.code === String(msg.code || "").toUpperCase(),
        );
        if (!room) return send(ws, { type: "error", error: "room_not_found" });
        room.players.add(id);
        client.roomId = room.id;
        broadcast(room, roomSnapshot(room));
      }

      if (msg.type === "chat.send" || msg.type === "quick.send") {
        const now = Date.now();
        const bucket = rate.get(id) ?? [];
        const recent = bucket.filter((time) => now - time < 5000);
        if (recent.length >= 5)
          return send(ws, { type: "error", error: "rate_limited" });
        recent.push(now);
        rate.set(id, recent);
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
      }

      if (msg.type === "input.frame") {
        const speed = Math.abs(Number(msg.speed ?? 0));
        if (speed > 420)
          return send(ws, { type: "error", error: "speed_rejected" });
        send(ws, { type: "input.accepted", tick: Number(msg.tick ?? 0) });
      }
    });

    ws.on("close", () => {
      const client = clients.get(id);
      if (client?.roomId) {
        const room = rooms.get(client.roomId);
        room?.players.delete(id);
        if (room && room.players.size === 0) rooms.delete(room.id);
        else if (room) broadcast(room, roomSnapshot(room));
      }
      clients.delete(id);
    });
  });

  return {
    server,
    wss,
    rooms,
    clients,
    listen: () =>
      new Promise((resolve) => server.listen(port, () => resolve(server))),
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
