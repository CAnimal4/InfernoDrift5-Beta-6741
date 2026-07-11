import http from "node:http";
import { randomBytes, randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocket, WebSocketServer } from "ws";
import {
  CHASSIS,
  EMPTY_INPUT,
  calculateResult,
  cloneSnapshot,
  createSimulation,
  stepSimulation,
  type ChassisId,
  type InputFrame,
  type ModeId,
  type RunResult,
  type SimulationState,
} from "../../../packages/afterburn-core/src/index.js";
import {
  AFTERBURN_PROTOCOL_VERSION,
  encodeServerMessage,
  parseClientMessage,
  type ClientMessage,
  type RoomPlayer,
  type RoomSnapshot,
  type ServerMessage,
} from "../../../packages/afterburn-protocol/src/index.js";
import { createFirebaseServerServices } from "./firebase.js";

type MultiplayerMode = Exclude<ModeId, "burn-run" | "wreckyard">;

export interface AuthIdentity {
  uid: string;
  name?: string;
}

export interface ResultStore {
  commit(playerId: string, result: RunResult): Promise<void>;
  leaderboard(mode: ModeId, limit?: number): Promise<Array<{ playerId: string; result: RunResult }>>;
}

export interface AfterburnServerOptions {
  port?: number;
  host?: string;
  allowedOrigins?: string[];
  region?: string;
  now?: () => number;
  verifyFirebaseToken?: (token: string) => Promise<AuthIdentity>;
  resultStore?: ResultStore;
  logger?: (entry: Record<string, unknown>) => void;
}

interface ClientState {
  connectionId: string;
  playerId: string | null;
  name: string;
  sessionToken: string | null;
  ws: WebSocket;
  roomCode: string | null;
  chassis: ChassisId;
  latestInput: InputFrame;
  messageTimes: number[];
  connectedAt: number;
}

interface SessionState {
  token: string;
  playerId: string;
  name: string;
  roomCode: string | null;
  chassis: ChassisId;
  disconnectedAt: number | null;
}

interface RoomState {
  code: string;
  mode: MultiplayerMode;
  phase: RoomSnapshot["phase"];
  hostId: string;
  seed: number;
  botFill: boolean;
  players: Map<string, RoomPlayer>;
  simulation: SimulationState | null;
  inputByPlayer: Record<string, InputFrame>;
  tickTimer: ReturnType<typeof setInterval> | null;
  snapshotEvery: number;
  rematchVotes: Set<string>;
}

class MemoryResultStore implements ResultStore {
  private readonly results: Array<{ playerId: string; result: RunResult }> = [];

  async commit(playerId: string, result: RunResult) {
    this.results.push({ playerId, result: structuredClone(result) });
  }

  async leaderboard(mode: ModeId, limit = 20) {
    return this.results
      .filter((entry) => entry.result.mode === mode)
      .sort((a, b) => b.result.score - a.result.score || a.result.time - b.result.time)
      .slice(0, limit)
      .map((entry) => structuredClone(entry));
  }
}

export function createAfterburnServer(options: AfterburnServerOptions = {}) {
  const now = options.now ?? Date.now;
  const region = options.region ?? process.env.AFTERBURN_REGION ?? "local-west";
  const environmentOrigins = (process.env.AFTERBURN_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const allowedOrigins = new Set(
    options.allowedOrigins ?? (environmentOrigins.length ? environmentOrigins : [
      "http://127.0.0.1:4173",
      "http://localhost:4173",
      "http://127.0.0.1:4174",
      "http://localhost:4174",
      "https://canimal4.github.io",
    ]),
  );
  const resultStore = options.resultStore ?? new MemoryResultStore();
  const logger = options.logger ?? ((entry) => console.log(JSON.stringify(entry)));
  const clients = new Map<string, ClientState>();
  const sessions = new Map<string, SessionState>();
  const rooms = new Map<string, RoomState>();
  const metrics = {
    connections: 0,
    messages: 0,
    rejectedMessages: 0,
    matchesStarted: 0,
    matchesFinished: 0,
    reconnects: 0,
  };

  const server = http.createServer((request, response) => {
    if (request.url === "/health") {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ ok: true, service: "infernodrift-afterburn", version: 2 }));
      return;
    }
    if (request.url === "/ready") {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ ready: true, rooms: rooms.size, connections: clients.size }));
      return;
    }
    if (request.url === "/metrics") {
      response.writeHead(200, { "content-type": "text/plain; version=0.0.4" });
      response.end(
        [
          `afterburn_connections ${clients.size}`,
          `afterburn_rooms ${rooms.size}`,
          ...Object.entries(metrics).map(([key, value]) => `afterburn_${key} ${value}`),
        ].join("\n"),
      );
      return;
    }
    response.writeHead(404).end();
  });

  const wss = new WebSocketServer({ noServer: true, maxPayload: 4096 });
  server.on("upgrade", (request, socket, head) => {
    const origin = request.headers.origin ?? "";
    if (origin && !allowedOrigins.has(origin)) {
      socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
      socket.destroy();
      return;
    }
    wss.handleUpgrade(request, socket, head, (ws) => wss.emit("connection", ws, request));
  });

  wss.on("connection", (ws) => {
    const connectionId = randomUUID();
    const client: ClientState = {
      connectionId,
      playerId: null,
      name: "Drifter",
      sessionToken: null,
      ws,
      roomCode: null,
      chassis: "vandal",
      latestInput: { ...EMPTY_INPUT },
      messageTimes: [],
      connectedAt: now(),
    };
    clients.set(connectionId, client);
    metrics.connections += 1;
    send(client, { type: "hello", version: 2, region, serverTime: now() });

    ws.on("message", async (data) => {
      metrics.messages += 1;
      if (!allowMessage(client, now())) {
        metrics.rejectedMessages += 1;
        return send(client, { type: "error", code: "rate_limited", recoverable: true });
      }
      const parsed = parseClientMessage(data.toString());
      if (!parsed.ok) {
        metrics.rejectedMessages += 1;
        return send(client, { type: "error", code: parsed.error, recoverable: true });
      }
      try {
        await handleMessage(client, parsed.value);
      } catch (error) {
        logger({ level: "error", event: "message_failed", error: error instanceof Error ? error.message : String(error) });
        send(client, { type: "error", code: "server_error", recoverable: true });
      }
    });

    ws.on("close", () => disconnectClient(client));
    ws.on("error", () => disconnectClient(client));
  });

  async function handleMessage(client: ClientState, message: ClientMessage) {
    if (message.type === "session.guest") {
      return acceptGuestSession(client, message.name, message.resumeToken);
    }
    if (message.type === "session.firebase") {
      if (!options.verifyFirebaseToken) {
        return send(client, { type: "error", code: "firebase_auth_unavailable", recoverable: true });
      }
      const identity = await options.verifyFirebaseToken(message.idToken);
      return acceptFirebaseSession(client, identity, message.name, message.resumeToken);
    }
    if (!client.playerId) return send(client, { type: "error", code: "session_required", recoverable: true });

    if (message.type === "room.create") {
      leaveRoom(client);
      const room = makeRoom(message.mode, message.botFill, client.playerId);
      rooms.set(room.code, room);
      joinRoom(client, room);
      return;
    }
    if (message.type === "queue.join") {
      leaveRoom(client);
      const room =
        [...rooms.values()].find(
          (candidate) => candidate.mode === message.mode && candidate.phase === "lobby" && candidate.players.size < 6 && candidate.botFill,
        ) ?? makeRoom(message.mode, true, client.playerId);
      rooms.set(room.code, room);
      joinRoom(client, room);
      const player = room.players.get(client.playerId);
      if (player) player.ready = true;
      maybeStartRoom(room);
      return;
    }
    if (message.type === "room.join") {
      const room = rooms.get(message.code);
      if (!room) return send(client, { type: "error", code: "room_not_found", recoverable: true });
      if (room.players.size >= 6 && !room.players.has(client.playerId)) {
        return send(client, { type: "error", code: "room_full", recoverable: true });
      }
      if (room.phase === "running") return send(client, { type: "error", code: "match_in_progress", recoverable: true });
      leaveRoom(client);
      joinRoom(client, room);
      return;
    }
    if (message.type === "room.leave") return leaveRoom(client);
    if (message.type === "chassis.select") {
      client.chassis = message.chassis;
      const room = roomFor(client);
      const player = room?.players.get(client.playerId);
      if (player && room?.phase === "lobby") player.chassis = message.chassis;
      if (room) broadcastRoom(room);
      return;
    }
    if (message.type === "match.ready") {
      const room = roomFor(client);
      const player = room?.players.get(client.playerId);
      if (!room || !player || room.phase !== "lobby") return;
      player.ready = message.ready;
      broadcastRoom(room);
      maybeStartRoom(room);
      return;
    }
    if (message.type === "input.frame") {
      const room = roomFor(client);
      if (!room || room.phase !== "running") return;
      const previous = room.inputByPlayer[client.playerId];
      if (previous && message.seq <= previous.seq) return;
      room.inputByPlayer[client.playerId] = message;
      client.latestInput = message;
      return;
    }
    if (message.type === "quick.send") {
      const room = roomFor(client);
      if (!room) return;
      broadcast(room, { type: "quick.message", playerId: client.playerId, name: client.name, text: message.text });
      return;
    }
    if (message.type === "match.rematch") {
      const room = roomFor(client);
      if (!room || room.phase !== "finished") return;
      room.rematchVotes.add(client.playerId);
      const humans = [...room.players.values()].filter((player) => !player.bot && player.connected);
      if (humans.every((player) => room.rematchVotes.has(player.id))) resetRoom(room);
      return;
    }
    if (message.type === "ping") {
      return send(client, { type: "pong", sentAt: message.sentAt, serverTime: now() });
    }
  }

  function acceptGuestSession(client: ClientState, name: string, resumeToken?: string) {
    if (resumeToken) {
      const session = sessions.get(resumeToken);
      if (session && session.disconnectedAt && now() - session.disconnectedAt <= 30_000) {
        metrics.reconnects += 1;
        client.playerId = session.playerId;
        client.name = session.name;
        client.sessionToken = session.token;
        client.roomCode = session.roomCode;
        client.chassis = session.chassis;
        session.disconnectedAt = null;
        const room = session.roomCode ? rooms.get(session.roomCode) : null;
        const roomPlayer = room?.players.get(session.playerId);
        if (roomPlayer) roomPlayer.connected = true;
        send(client, { type: "session.accepted", playerId: session.playerId, sessionToken: session.token, resumed: true });
        if (room) broadcastRoom(room);
        return;
      }
    }
    acceptIdentity(client, `guest-${randomUUID()}`, cleanName(name), false);
  }

  function acceptFirebaseSession(client: ClientState, identity: AuthIdentity, requestedName: string, resumeToken?: string) {
    if (resumeToken) {
      const session = sessions.get(resumeToken);
      if (session?.playerId === identity.uid && session.disconnectedAt && now() - session.disconnectedAt <= 30_000) {
        metrics.reconnects += 1;
        client.playerId = session.playerId;
        client.name = session.name;
        client.sessionToken = session.token;
        client.roomCode = session.roomCode;
        client.chassis = session.chassis;
        session.disconnectedAt = null;
        const room = session.roomCode ? rooms.get(session.roomCode) : null;
        const roomPlayer = room?.players.get(session.playerId);
        if (roomPlayer) roomPlayer.connected = true;
        send(client, { type: "session.accepted", playerId: session.playerId, sessionToken: session.token, resumed: true });
        if (room) broadcastRoom(room);
        return;
      }
    }
    acceptIdentity(client, identity.uid, identity.name ?? requestedName, false);
  }

  function acceptIdentity(client: ClientState, playerId: string, name: string, resumed: boolean) {
    const token = randomBytes(24).toString("base64url");
    client.playerId = playerId;
    client.name = cleanName(name);
    client.sessionToken = token;
    sessions.set(token, {
      token,
      playerId,
      name: client.name,
      roomCode: null,
      chassis: client.chassis,
      disconnectedAt: null,
    });
    send(client, { type: "session.accepted", playerId, sessionToken: token, resumed });
  }

  function makeRoom(mode: MultiplayerMode, botFill: boolean, hostId: string): RoomState {
    return {
      code: uniqueRoomCode(rooms),
      mode,
      phase: "lobby",
      hostId,
      seed: Math.floor(now() % 2_000_000_000),
      botFill,
      players: new Map(),
      simulation: null,
      inputByPlayer: {},
      tickTimer: null,
      snapshotEvery: 0,
      rematchVotes: new Set(),
    };
  }

  function joinRoom(client: ClientState, room: RoomState) {
    if (!client.playerId) return;
    room.players.set(client.playerId, {
      id: client.playerId,
      name: client.name,
      ready: false,
      connected: true,
      bot: false,
      chassis: client.chassis,
    });
    client.roomCode = room.code;
    const session = client.sessionToken ? sessions.get(client.sessionToken) : null;
    if (session) session.roomCode = room.code;
    broadcastRoom(room);
  }

  function leaveRoom(client: ClientState) {
    const room = roomFor(client);
    if (!room || !client.playerId) return;
    room.players.delete(client.playerId);
    delete room.inputByPlayer[client.playerId];
    client.roomCode = null;
    const session = client.sessionToken ? sessions.get(client.sessionToken) : null;
    if (session) session.roomCode = null;
    if (!room.players.size) destroyRoom(room);
    else {
      if (room.hostId === client.playerId) room.hostId = [...room.players.keys()][0];
      broadcastRoom(room);
    }
  }

  function maybeStartRoom(room: RoomState) {
    if (room.phase !== "lobby") return;
    const humans = [...room.players.values()].filter((player) => !player.bot && player.connected);
    if (!humans.length || !humans.every((player) => player.ready)) return;
    startRoom(room);
  }

  function startRoom(room: RoomState) {
    room.phase = "countdown";
    room.players.forEach((player, id) => {
      if (player.bot) room.players.delete(id);
    });
    if (room.botFill) {
      const desired = room.mode === "burn-crew" ? 4 : 6;
      while (room.players.size < desired) {
        const number = room.players.size + 1;
        const id = `bot-${room.code}-${number}`;
        room.players.set(id, {
          id,
          name: ["Ash", "Cinder", "Rook", "Nova", "Torque", "Hex"][number - 1] ?? `Bot ${number}`,
          ready: true,
          connected: true,
          bot: true,
          chassis: (["vandal", "apex", "warden", "wraith"] as ChassisId[])[number % 4],
        });
      }
    }
    room.simulation = createSimulation(
      room.mode,
      room.seed,
      [...room.players.values()].map((player, index) => ({
        id: player.id,
        name: player.name,
        chassis: player.chassis,
        bot: player.bot,
        team: room.mode === "burn-crew" ? "ember" : index % 2 ? "cyan" : "ember",
      })),
    );
    room.inputByPlayer = {};
    room.rematchVotes.clear();
    metrics.matchesStarted += 1;
    for (const player of room.players.values()) {
      if (!player.bot) sendToPlayer(player.id, { type: "match.started", roomCode: room.code, seed: room.seed, playerId: player.id });
    }
    room.tickTimer = setInterval(() => tickRoom(room), 1000 / 30);
    broadcastRoom(room);
  }

  function tickRoom(room: RoomState) {
    const simulation = room.simulation;
    if (!simulation) return;
    const events = stepSimulation(simulation, room.inputByPlayer, 1 / 30);
    room.phase = simulation.phase === "countdown" ? "countdown" : simulation.phase;
    room.snapshotEvery += 1;
    if (room.snapshotEvery >= 2) {
      room.snapshotEvery = 0;
      const snapshot = cloneSnapshot(simulation);
      snapshot.serverTime = now();
      for (const player of room.players.values()) {
        if (player.bot) continue;
        const ack = simulation.players[player.id]?.lastInputSeq ?? 0;
        sendToPlayer(player.id, { type: "match.snapshot", snapshot, ack });
      }
    }
    if (events.length) broadcast(room, { type: "match.events", events });
    if (simulation.phase === "finished") void finishRoom(room);
  }

  async function finishRoom(room: RoomState) {
    if (room.tickTimer) clearInterval(room.tickTimer);
    room.tickTimer = null;
    room.phase = "finished";
    metrics.matchesFinished += 1;
    if (!room.simulation) return;
    for (const player of room.players.values()) {
      if (player.bot) continue;
      const result = calculateResult(room.simulation, player.id);
      await resultStore.commit(player.id, result);
      sendToPlayer(player.id, { type: "match.result", result, verified: true });
    }
    broadcastRoom(room);
  }

  function resetRoom(room: RoomState) {
    if (room.tickTimer) clearInterval(room.tickTimer);
    room.tickTimer = null;
    room.phase = "lobby";
    room.simulation = null;
    room.seed += 1;
    room.rematchVotes.clear();
    room.players.forEach((player, id) => {
      if (player.bot) room.players.delete(id);
      else player.ready = false;
    });
    broadcastRoom(room);
  }

  function disconnectClient(client: ClientState) {
    if (!clients.delete(client.connectionId)) return;
    if (client.sessionToken) {
      const session = sessions.get(client.sessionToken);
      if (session) session.disconnectedAt = now();
    }
    const room = roomFor(client);
    const player = room && client.playerId ? room.players.get(client.playerId) : null;
    if (player) {
      player.connected = false;
      broadcastRoom(room!);
      const expiryTimer = setTimeout(() => {
        const session = client.sessionToken ? sessions.get(client.sessionToken) : null;
        if (session?.disconnectedAt && now() - session.disconnectedAt >= 30_000) {
          const staleRoom = session.roomCode ? rooms.get(session.roomCode) : null;
          staleRoom?.players.delete(session.playerId);
          if (staleRoom && !staleRoom.players.size) destroyRoom(staleRoom);
          else if (staleRoom) broadcastRoom(staleRoom);
          sessions.delete(session.token);
        }
      }, 30_100);
      expiryTimer.unref();
    }
  }

  function roomFor(client: ClientState): RoomState | null {
    return client.roomCode ? rooms.get(client.roomCode) ?? null : null;
  }

  function roomSnapshot(room: RoomState): RoomSnapshot {
    return {
      code: room.code,
      mode: room.mode,
      phase: room.phase,
      players: [...room.players.values()],
      botFill: room.botFill,
      hostId: room.hostId,
      seed: room.seed,
    };
  }

  function broadcastRoom(room: RoomState) {
    broadcast(room, { type: "room.snapshot", room: roomSnapshot(room) });
  }

  function broadcast(room: RoomState, message: ServerMessage) {
    for (const player of room.players.values()) {
      if (!player.bot) sendToPlayer(player.id, message);
    }
  }

  function sendToPlayer(playerId: string, message: ServerMessage) {
    for (const client of clients.values()) {
      if (client.playerId === playerId) send(client, message);
    }
  }

  function send(client: ClientState, message: ServerMessage) {
    if (client.ws.readyState === WebSocket.OPEN) client.ws.send(encodeServerMessage(message));
  }

  function destroyRoom(room: RoomState) {
    if (room.tickTimer) clearInterval(room.tickTimer);
    room.tickTimer = null;
    rooms.delete(room.code);
  }

  async function listen() {
    const port = options.port ?? (Number(process.env.PORT) || 8787);
    const host = options.host ?? process.env.HOST ?? "127.0.0.1";
    await new Promise<void>((resolve) => server.listen(port, host, resolve));
    const address = server.address();
    const actualPort = typeof address === "object" && address ? address.port : port;
    logger({ level: "info", event: "server_listening", host, port: actualPort, region });
    return actualPort;
  }

  async function close() {
    for (const room of rooms.values()) if (room.tickTimer) clearInterval(room.tickTimer);
    for (const client of clients.values()) client.ws.close();
    await new Promise<void>((resolve) => wss.close(() => resolve()));
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }

  return { listen, close, server, wss, rooms, clients, sessions, metrics, resultStore };
}

function allowMessage(client: ClientState, time: number): boolean {
  client.messageTimes = client.messageTimes.filter((stamp) => time - stamp < 1000);
  if (client.messageTimes.length >= 50) return false;
  client.messageTimes.push(time);
  return true;
}

function cleanName(value: string): string {
  return value.replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 20) || "Drifter";
}

function uniqueRoomCode(rooms: Map<string, unknown>): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (;;) {
    let code = "";
    for (let index = 0; index < 6; index += 1) code += alphabet[Math.floor(Math.random() * alphabet.length)];
    if (!rooms.has(code)) return code;
  }
}

const isEntryPoint = Boolean(process.argv[1]) && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isEntryPoint) {
  const firebase = createFirebaseServerServices();
  const instance = createAfterburnServer({
    verifyFirebaseToken: firebase?.verifyFirebaseToken,
    resultStore: firebase?.resultStore,
  });
  void instance.listen();
  const shutdown = () => void instance.close().finally(() => process.exit(0));
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}
