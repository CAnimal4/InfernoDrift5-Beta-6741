import type { ChassisId, InputFrame, MatchSnapshot, ModeId, RunResult } from "../../../packages/afterburn-core/src/index";
import { AFTERBURN_PROTOCOL_VERSION, type RoomSnapshot, type ServerMessage } from "../../../packages/afterburn-protocol/src/index";

export interface NetworkState {
  status: "offline" | "connecting" | "online" | "reconnecting" | "error";
  playerId: string | null;
  room: RoomSnapshot | null;
  snapshot: MatchSnapshot | null;
  result: RunResult | null;
  region: string;
  ping: number;
  packetLoss: number;
  message: string;
  quickMessage: string;
}

type Listener = (state: NetworkState) => void;

export class MultiplayerClient {
  readonly state: NetworkState = {
    status: "offline",
    playerId: null,
    room: null,
    snapshot: null,
    result: null,
    region: "offline",
    ping: 0,
    packetLoss: 0,
    message: "Local drive ready",
    quickMessage: "",
  };
  private socket: WebSocket | null = null;
  private listener: Listener | null = null;
  private pingTimer: number | null = null;
  private reconnectTimer: number | null = null;
  private attempts = 0;
  private sentFrames = 0;
  private acknowledgedFrames = 0;
  private name = "Drifter";
  private idToken: string | null = null;

  constructor(private readonly url: string) {}

  subscribe(listener: Listener) {
    this.listener = listener;
    listener({ ...this.state });
    return () => {
      if (this.listener === listener) this.listener = null;
    };
  }

  connect(name: string, idToken: string | null = null) {
    this.name = name.trim().slice(0, 20) || "Drifter";
    this.idToken = idToken;
    this.clearReconnect();
    if (this.socket?.readyState === WebSocket.OPEN) return;
    this.patch({ status: "connecting", message: "Contacting Afterburn server…" });
    const socket = new WebSocket(this.url);
    this.socket = socket;
    socket.addEventListener("open", () => {
      this.attempts = 0;
      const resumeToken = localStorage.getItem("infernodrift.afterburn.session") ?? undefined;
      this.send(
        this.idToken
          ? { type: "session.firebase", version: AFTERBURN_PROTOCOL_VERSION, idToken: this.idToken, name: this.name, resumeToken }
          : { type: "session.guest", version: AFTERBURN_PROTOCOL_VERSION, name: this.name, resumeToken },
      );
    });
    socket.addEventListener("message", (event) => this.handle(JSON.parse(String(event.data)) as ServerMessage));
    socket.addEventListener("close", () => this.handleDisconnect());
    socket.addEventListener("error", () => this.patch({ status: "error", message: "Server unavailable — local play still works" }));
  }

  disconnect() {
    this.clearReconnect();
    if (this.pingTimer !== null) window.clearInterval(this.pingTimer);
    this.socket?.close();
    this.socket = null;
    this.patch({ status: "offline", room: null, snapshot: null, message: "Local drive ready" });
  }

  createRoom(mode: Exclude<ModeId, "burn-run" | "wreckyard">, botFill = true) {
    this.send({ type: "room.create", mode, botFill });
  }

  quickPlay(mode: Exclude<ModeId, "burn-run" | "wreckyard">) {
    this.send({ type: "queue.join", mode });
  }

  joinRoom(code: string) {
    this.send({ type: "room.join", code: code.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6) });
  }

  ready(ready: boolean) {
    this.send({ type: "match.ready", ready });
  }

  selectChassis(chassis: ChassisId) {
    this.send({ type: "chassis.select", chassis });
  }

  sendInput(input: InputFrame) {
    if (this.state.room?.phase !== "running" && this.state.room?.phase !== "countdown") return;
    this.sentFrames += 1;
    this.send({ type: "input.frame", ...input });
  }

  quick(text: string) {
    this.send({ type: "quick.send", text });
  }

  rematch() {
    this.send({ type: "match.rematch" });
  }

  private send(message: Record<string, unknown>) {
    if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify(message));
  }

  private handle(message: ServerMessage) {
    if (message.type === "hello") {
      this.patch({ region: message.region });
      return;
    }
    if (message.type === "session.accepted") {
      localStorage.setItem("infernodrift.afterburn.session", message.sessionToken);
      this.patch({ status: "online", playerId: message.playerId, message: message.resumed ? "Run reconnected" : "Afterburn server online" });
      if (this.pingTimer === null) {
        this.pingTimer = window.setInterval(() => this.send({ type: "ping", sentAt: Date.now() }), 2000);
      }
      return;
    }
    if (message.type === "room.snapshot") {
      this.patch({ room: message.room, message: `Room ${message.room.code} · ${message.room.players.length}/6` });
      return;
    }
    if (message.type === "match.started") {
      this.patch({ result: null, message: "Ignition sequence" });
      return;
    }
    if (message.type === "match.snapshot") {
      this.acknowledgedFrames = Math.max(this.acknowledgedFrames, message.ack);
      const loss = this.sentFrames ? Math.max(0, (this.sentFrames - this.acknowledgedFrames - 2) / this.sentFrames) : 0;
      this.patch({ snapshot: message.snapshot, packetLoss: loss });
      return;
    }
    if (message.type === "match.result") {
      this.patch({ result: message.result, message: "Verified result received" });
      return;
    }
    if (message.type === "quick.message") {
      this.patch({ quickMessage: `${message.name}: ${message.text}` });
      window.setTimeout(() => this.patch({ quickMessage: "" }), 2400);
      return;
    }
    if (message.type === "pong") {
      this.patch({ ping: Math.max(0, Date.now() - message.sentAt) });
      return;
    }
    if (message.type === "error") this.patch({ message: message.code.replaceAll("_", " "), status: message.recoverable ? this.state.status : "error" });
  }

  private handleDisconnect() {
    if (this.state.status === "offline") return;
    if (this.pingTimer !== null) window.clearInterval(this.pingTimer);
    this.pingTimer = null;
    this.attempts += 1;
    if (this.attempts > 5) return this.patch({ status: "error", message: "Server lost — continue offline" });
    this.patch({ status: "reconnecting", message: `Reconnecting ${this.attempts}/5…` });
    this.reconnectTimer = window.setTimeout(() => this.connect(this.name), Math.min(5000, 700 * 2 ** this.attempts));
  }

  private clearReconnect() {
    if (this.reconnectTimer !== null) window.clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }

  private patch(patch: Partial<NetworkState>) {
    Object.assign(this.state, patch);
    this.listener?.({ ...this.state });
  }
}
