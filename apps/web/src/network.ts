import {
  protocolVersion,
  type ClientMessage,
  type ServerMessage,
} from "@infernodrift4/protocol";

export type NetworkState = {
  status: "offline" | "connecting" | "online" | "error";
  message: string;
  roomCode?: string;
  username: string;
};

export class NetworkClient {
  private ws?: WebSocket;
  private seq = 0;
  private listeners = new Set<(state: NetworkState) => void>();
  state: NetworkState = {
    status: "offline",
    message: "Backend offline: bot mode ready.",
    username: "Guest",
  };

  constructor(private readonly url: string | undefined) {}

  subscribe(listener: (state: NetworkState) => void) {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  connect(username: string) {
    if (!this.url) {
      this.update({
        status: "offline",
        message: "Backend offline: bot mode ready.",
        username,
      });
      return;
    }
    this.update({
      status: "connecting",
      message: "Connecting to InfernoDrift4 backend...",
      username,
    });
    this.ws = new WebSocket(this.url);
    this.ws.addEventListener("open", () => {
      this.send({
        v: protocolVersion,
        type: "auth.resume",
        seq: this.nextSeq(),
        payload: { deviceId: deviceId(), username },
      });
    });
    this.ws.addEventListener("message", (event) => {
      const msg = JSON.parse(String(event.data)) as ServerMessage;
      if (msg.type === "auth.ok")
        this.update({
          status: "online",
          message: `Online as ${msg.payload.username}`,
          username: msg.payload.username,
        });
      if (msg.type === "room.snapshot")
        this.update({
          ...this.state,
          roomCode: msg.payload.code,
          message: `Room ${msg.payload.code} ready with ${msg.payload.players.length} rider(s).`,
        });
      if (msg.type === "error")
        this.update({ ...this.state, message: msg.payload.message });
    });
    this.ws.addEventListener("error", () =>
      this.update({
        status: "error",
        message:
          "Backend unreachable. Offline bot mode is still fully playable.",
        username,
      }),
    );
    this.ws.addEventListener("close", () => {
      if (this.state.status !== "offline")
        this.update({
          status: "offline",
          message: "Backend disconnected. Offline bot mode is active.",
          username,
        });
    });
  }

  createRoom(
    mode: ClientMessage & { type: "room.create" } extends never
      ? never
      : string,
    teamSize: 1 | 2 | 3,
  ) {
    this.send({
      v: protocolVersion,
      type: "room.create",
      seq: this.nextSeq(),
      payload: { mode: mode as never, private: true, teamSize },
    });
  }

  queue(
    mode: string,
    queue: "casual" | "ranked" | "bot-match",
    teamSize: 1 | 2 | 3,
  ) {
    this.send({
      v: protocolVersion,
      type: "queue.join",
      seq: this.nextSeq(),
      payload: { mode: mode as never, queue, teamSize, skill: 1000 },
    });
  }

  chat(text: string) {
    this.send({
      v: protocolVersion,
      type: "chat.send",
      seq: this.nextSeq(),
      payload: { text },
    });
  }

  private send(message: ClientMessage) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify(message));
  }

  private nextSeq() {
    this.seq += 1;
    return this.seq;
  }

  private update(state: NetworkState) {
    this.state = state;
    for (const listener of this.listeners) listener(state);
  }
}

function deviceId() {
  const key = "infernodrift4.deviceId";
  const current = localStorage.getItem(key);
  if (current) return current;
  const next = `id4-${crypto.randomUUID()}`;
  localStorage.setItem(key, next);
  return next;
}
