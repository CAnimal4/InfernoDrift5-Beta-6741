import { createServer } from "node:http";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { WebSocketServer, type WebSocket } from "ws";
import {
  InfernoDriftSim,
  defaultInput,
  type InputFrame,
} from "@infernodrift4/game-core";
import {
  parseClientMessage,
  protocolVersion,
  sanitizeChat,
  type ServerMessage,
} from "@infernodrift4/protocol";

type Account = {
  id: string;
  username: string;
  deviceId: string;
  rating: number;
  friends: string[];
  recent: string[];
};

type Client = {
  id: string;
  account?: Account;
  socket: WebSocket;
  seq: number;
  roomId?: string;
  lastChatAt: number;
  input: InputFrame;
};

type Room = {
  id: string;
  code: string;
  mode: string;
  private: boolean;
  teamSize: 1 | 2 | 3;
  sim: InfernoDriftSim;
  clients: Set<string>;
  createdAt: number;
};

type Store = {
  accounts: Account[];
  leaderboards: Array<{
    accountId: string;
    username: string;
    rating: number;
    wins: number;
  }>;
};

const port = Number(process.env.PORT ?? 8787);
const dataDir = process.env.DATA_DIR ?? join(process.cwd(), "data");
const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ??
  "http://127.0.0.1:5173,http://localhost:5173,https://canimal4.github.io"
)
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const storePath = join(dataDir, "infernodrift4-server.json");
const clients = new Map<string, Client>();
const rooms = new Map<string, Room>();
const queues = new Map<string, string[]>();
const store = loadStore();

const server = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        ok: true,
        rooms: rooms.size,
        clients: clients.size,
        server: "InfernoDrift4",
      }),
    );
    return;
  }
  res.writeHead(404, { "content-type": "application/json" });
  res.end(JSON.stringify({ error: "not_found" }));
});

const wss = new WebSocketServer({
  server,
  verifyClient: ({ origin }, done) => {
    if (!origin || allowedOrigins.some((allowed) => origin.startsWith(allowed)))
      done(true);
    else done(false, 403, "Origin rejected");
  },
});

wss.on("connection", (socket) => {
  const id = randomId("client");
  const client: Client = {
    id,
    socket,
    seq: 0,
    lastChatAt: 0,
    input: defaultInput(),
  };
  clients.set(id, client);
  send(client, {
    v: protocolVersion,
    type: "hello",
    payload: {
      serverTime: Date.now(),
      features: [
        "guest-accounts",
        "private-rooms",
        "casual-queue",
        "ranked-queue",
        "friends",
        "safe-chat",
        "bot-fill",
      ],
    },
  });

  socket.on("message", (buffer) => {
    try {
      const message = parseClientMessage(JSON.parse(String(buffer)));
      if (message.seq <= client.seq && message.type !== "input.frame") {
        sendError(client, "stale_seq", "Message sequence was stale.");
        return;
      }
      client.seq = Math.max(client.seq, message.seq);

      switch (message.type) {
        case "auth.resume": {
          const username = normalizeUsername(
            message.payload.username ??
              `Rider${message.payload.deviceId.slice(-4)}`,
          );
          let account = store.accounts.find(
            (item) => item.deviceId === message.payload.deviceId,
          );
          if (!account) {
            account = {
              id: randomId("acct"),
              username,
              deviceId: message.payload.deviceId,
              rating: 1000,
              friends: [],
              recent: [],
            };
            store.accounts.push(account);
            saveStore();
          } else {
            account.username = username;
          }
          client.account = account;
          send(client, {
            v: protocolVersion,
            type: "auth.ok",
            payload: {
              accountId: account.id,
              username: account.username,
              rating: account.rating,
            },
          });
          break;
        }
        case "room.create": {
          const room = createRoom(
            message.payload.mode,
            message.payload.private,
            message.payload.teamSize,
          );
          joinRoom(client, room);
          break;
        }
        case "room.join": {
          const room = [...rooms.values()].find(
            (candidate) =>
              candidate.code === message.payload.code.toUpperCase(),
          );
          if (!room)
            sendError(client, "room_missing", "Private match code not found.");
          else joinRoom(client, room);
          break;
        }
        case "room.leave": {
          leaveRoom(client);
          break;
        }
        case "queue.join": {
          const key = `${message.payload.queue}:${message.payload.mode}:${message.payload.teamSize}`;
          const queue = queues.get(key) ?? [];
          queue.push(client.id);
          queues.set(key, queue);
          send(client, {
            v: protocolVersion,
            type: "queue.state",
            payload: {
              status: "queued",
              estimateSeconds: Math.max(4, 14 - queue.length * 2),
            },
          });
          if (
            queue.length >= message.payload.teamSize * 2 ||
            message.payload.queue === "bot-match"
          ) {
            const room = createRoom(
              message.payload.mode,
              false,
              message.payload.teamSize,
            );
            const selected = queue.splice(0, message.payload.teamSize * 2);
            for (const clientId of selected) {
              const queuedClient = clients.get(clientId);
              if (queuedClient) joinRoom(queuedClient, room);
            }
            sendRoomEvent(
              room,
              "match_ready",
              "Bot fill enabled for open slots.",
            );
          }
          break;
        }
        case "input.frame": {
          if (!client.roomId) return;
          if (
            Math.abs(message.payload.throttle) > 1 ||
            Math.abs(message.payload.steer) > 1
          ) {
            sendError(client, "invalid_input", "Input outside legal range.");
            return;
          }
          client.input = {
            throttle: message.payload.throttle,
            steer: message.payload.steer,
            drift: message.payload.drift,
            boost: message.payload.boost,
            jump: message.payload.jump,
            brake: false,
          };
          send(client, {
            v: protocolVersion,
            type: "input.ack",
            payload: { seq: message.seq, tick: message.payload.tick },
          });
          break;
        }
        case "chat.send": {
          const now = Date.now();
          if (now - client.lastChatAt < 850) {
            send(client, {
              v: protocolVersion,
              type: "rate_limited",
              payload: { retryAfterMs: 850 - (now - client.lastChatAt) },
            });
            return;
          }
          client.lastChatAt = now;
          const text = message.payload.quick
            ? message.payload.quick.replace(/-/g, " ")
            : sanitizeChat(message.payload.text);
          broadcastToRoom(client.roomId, {
            v: protocolVersion,
            type: "chat.message",
            payload: {
              from: client.account?.username ?? "Guest",
              text,
              quick: message.payload.quick,
              sentAt: now,
            },
          });
          break;
        }
        case "friend.request": {
          const target = store.accounts.find(
            (account) =>
              account.username.toLowerCase() ===
              message.payload.username.toLowerCase(),
          );
          if (!target || !client.account)
            sendError(client, "friend_missing", "Friend was not found.");
          else {
            if (!target.friends.includes(client.account.id))
              target.friends.push(client.account.id);
            saveStore();
            send(client, {
              v: protocolVersion,
              type: "presence.update",
              payload: { accountId: target.id, status: "request_sent" },
            });
          }
          break;
        }
        case "friend.accept": {
          if (
            client.account &&
            !client.account.friends.includes(message.payload.accountId)
          ) {
            client.account.friends.push(message.payload.accountId);
            saveStore();
          }
          break;
        }
        case "presence.set": {
          if (client.account)
            broadcast({
              v: protocolVersion,
              type: "presence.update",
              payload: {
                accountId: client.account.id,
                status: message.payload.status,
              },
            });
          break;
        }
      }
    } catch (error) {
      sendError(
        client,
        "bad_message",
        error instanceof Error ? error.message : "Message was invalid.",
      );
    }
  });

  socket.on("close", () => {
    leaveRoom(client);
    clients.delete(id);
  });
});

setInterval(() => {
  for (const room of rooms.values()) {
    const input = averageRoomInput(room);
    room.sim.step(input);
    if (room.sim.state.tick % 6 === 0) {
      broadcastToRoom(room.id, {
        v: protocolVersion,
        type: "room.snapshot",
        payload: {
          roomId: room.id,
          code: room.code,
          tick: room.sim.state.tick,
          players: [...room.clients].map((clientId, index) => {
            const account = clients.get(clientId)?.account;
            return {
              id: clientId,
              username: account?.username ?? `Guest ${index + 1}`,
              team: index % 2 ? "red" : "blue",
            };
          }),
        },
      });
    }
  }
}, 1000 / 60);

server.listen(port, () => {
  console.log(`InfernoDrift4 server listening on http://127.0.0.1:${port}`);
});

function send(client: Client, message: ServerMessage) {
  if (client.socket.readyState === client.socket.OPEN)
    client.socket.send(JSON.stringify(message));
}

function broadcast(message: ServerMessage) {
  for (const client of clients.values()) send(client, message);
}

function broadcastToRoom(roomId: string | undefined, message: ServerMessage) {
  if (!roomId) return;
  const room = rooms.get(roomId);
  if (!room) return;
  for (const clientId of room.clients) {
    const client = clients.get(clientId);
    if (client) send(client, message);
  }
}

function sendError(client: Client, code: string, message: string) {
  send(client, {
    v: protocolVersion,
    type: "error",
    payload: { code, message },
  });
}

function sendRoomEvent(room: Room, event: string, detail: string) {
  broadcastToRoom(room.id, {
    v: protocolVersion,
    type: "room.event",
    payload: { roomId: room.id, event, detail },
  });
}

function createRoom(
  mode: string,
  privateRoom: boolean,
  teamSize: 1 | 2 | 3,
): Room {
  const sim = new InfernoDriftSim(Date.now() % 100000);
  sim.startMode(mode as never);
  const room: Room = {
    id: randomId("room"),
    code: randomCode(),
    mode,
    private: privateRoom,
    teamSize,
    sim,
    clients: new Set(),
    createdAt: Date.now(),
  };
  rooms.set(room.id, room);
  return room;
}

function joinRoom(client: Client, room: Room) {
  leaveRoom(client);
  client.roomId = room.id;
  room.clients.add(client.id);
  send(client, {
    v: protocolVersion,
    type: "room.snapshot",
    payload: {
      roomId: room.id,
      code: room.code,
      tick: room.sim.state.tick,
      players: [...room.clients].map((clientId, index) => {
        const account = clients.get(clientId)?.account;
        return {
          id: clientId,
          username: account?.username ?? `Guest ${index + 1}`,
          team: index % 2 ? "red" : "blue",
        };
      }),
    },
  });
  sendRoomEvent(
    room,
    "joined",
    `${client.account?.username ?? "Guest"} joined.`,
  );
}

function leaveRoom(client: Client) {
  if (!client.roomId) return;
  const room = rooms.get(client.roomId);
  if (room) {
    room.clients.delete(client.id);
    if (room.clients.size === 0) rooms.delete(room.id);
  }
  client.roomId = undefined;
}

function averageRoomInput(room: Room): InputFrame {
  const active = [...room.clients]
    .map((clientId) => clients.get(clientId)?.input)
    .filter((input): input is InputFrame => Boolean(input));
  if (active.length === 0) return defaultInput();
  return {
    throttle:
      active.reduce((sum, input) => sum + input.throttle, 0) / active.length,
    steer: active.reduce((sum, input) => sum + input.steer, 0) / active.length,
    drift: active.some((input) => input.drift),
    boost: active.some((input) => input.boost),
    jump: active.some((input) => input.jump),
    brake: active.some((input) => input.brake),
  };
}

function loadStore(): Store {
  mkdirSync(dataDir, { recursive: true });
  try {
    return JSON.parse(readFileSync(storePath, "utf8")) as Store;
  } catch {
    return { accounts: [], leaderboards: [] };
  }
}

function saveStore() {
  writeFileSync(storePath, JSON.stringify(store, null, 2));
}

function normalizeUsername(value: string) {
  return (
    value.replace(/[^a-z0-9_-]/gi, "").slice(0, 18) ||
    `Rider${Math.floor(Math.random() * 9999)}`
  );
}

function randomId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function randomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}
