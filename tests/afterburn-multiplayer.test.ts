import test from "node:test";
import assert from "node:assert/strict";
import WebSocket from "ws";
import { createAfterburnServer } from "../apps/afterburn-server/src/index";

interface TestClient {
  ws: WebSocket;
  messages: Array<Record<string, unknown>>;
}

async function connect(port: number, name: string): Promise<TestClient> {
  const ws = new WebSocket(`ws://127.0.0.1:${port}`, { origin: "http://127.0.0.1:4173" });
  const messages: Array<Record<string, unknown>> = [];
  ws.on("message", (data) => messages.push(JSON.parse(String(data))));
  await new Promise<void>((resolve) => ws.once("open", () => resolve()));
  ws.send(JSON.stringify({ type: "session.guest", version: 2, name }));
  await waitFor(messages, (message) => message.type === "session.accepted");
  return { ws, messages };
}

async function waitFor(
  messages: Array<Record<string, unknown>>,
  predicate: (message: Record<string, unknown>) => boolean,
  timeoutMs = 2500,
) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const found = messages.find(predicate);
    if (found) return found;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error("timed out waiting for multiplayer message");
}

async function runRoomScenario(clientCount: 2 | 4 | 6) {
  const instance = createAfterburnServer({ port: 0, logger: () => undefined });
  const port = await instance.listen();
  const clients: TestClient[] = [];
  try {
    for (let index = 0; index < clientCount; index += 1) clients.push(await connect(port, `Driver ${index + 1}`));
    clients[0].ws.send(JSON.stringify({ type: "room.create", mode: "heat-circuit", botFill: false }));
    const created = await waitFor(clients[0].messages, (message) => message.type === "room.snapshot");
    const code = (created.room as { code: string }).code;
    for (const client of clients.slice(1)) {
      client.ws.send(JSON.stringify({ type: "room.join", code }));
      await waitFor(client.messages, (message) => message.type === "room.snapshot");
    }
    const latestHostRoom = () => [...clients[0].messages].reverse().find((message) => message.type === "room.snapshot");
    await waitFor(clients[0].messages, (message) => {
      if (message.type !== "room.snapshot") return false;
      return ((message.room as { players: unknown[] }).players?.length ?? 0) === clientCount;
    });
    for (const client of clients) client.ws.send(JSON.stringify({ type: "match.ready", ready: true }));
    await Promise.all(clients.map((client) => waitFor(client.messages, (message) => message.type === "match.started")));
    const internalRoom = instance.rooms.get(code) as unknown as { simulation: { countdown: number } | null };
    assert.ok(internalRoom.simulation);
    internalRoom.simulation!.countdown = 0;
    for (let seq = 1; seq <= 12; seq += 1) {
      clients.forEach((client, index) => client.ws.send(JSON.stringify({
        type: "input.frame",
        seq,
        throttle: 1,
        steer: index % 2 ? 0.1 : -0.1,
        drift: seq > 5,
        boost: seq % 3 === 0,
        jump: false,
        recover: false,
      })));
      await new Promise((resolve) => setTimeout(resolve, 8));
    }
    const snapshots = await Promise.all(clients.map((client) => waitFor(client.messages, (message) => message.type === "match.snapshot" && (message.snapshot as { phase: string }).phase === "running")));
    for (const snapshotMessage of snapshots) {
      const snapshot = snapshotMessage.snapshot as { players: Record<string, { z: number }> };
      assert.equal(Object.keys(snapshot.players).length, clientCount);
      assert.ok(Object.values(snapshot.players).some((player) => player.z >= 0));
    }
    assert.equal(((latestHostRoom()?.room as { code: string })?.code), code);
  } finally {
    clients.forEach((client) => client.ws.close());
    await instance.close();
  }
}

test("authoritative room supports two clients", () => runRoomScenario(2));
test("authoritative room supports four clients", () => runRoomScenario(4));
test("authoritative room supports six clients", () => runRoomScenario(6));

test("server exposes health, readiness, and metrics", async () => {
  const instance = createAfterburnServer({ port: 0, logger: () => undefined });
  const port = await instance.listen();
  try {
    const health = await fetch(`http://127.0.0.1:${port}/health`).then((response) => response.json()) as { ok: boolean };
    const ready = await fetch(`http://127.0.0.1:${port}/ready`).then((response) => response.json()) as { ready: boolean };
    const metrics = await fetch(`http://127.0.0.1:${port}/metrics`).then((response) => response.text());
    assert.equal(health.ok, true);
    assert.equal(ready.ready, true);
    assert.match(metrics, /afterburn_connections/);
  } finally {
    await instance.close();
  }
});
