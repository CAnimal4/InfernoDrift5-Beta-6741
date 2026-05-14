import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import WebSocket from "ws";
import {
  createInfernoServer,
  sanitizeChat,
  validateClientMessage,
} from "../apps/server/src/index.js";

test("protocol accepts known messages and rejects unknown messages", () => {
  assert.equal(
    validateClientMessage(
      JSON.stringify({ type: "auth.guest", username: "Drifter" }),
    ).ok,
    true,
  );
  assert.equal(
    validateClientMessage(JSON.stringify({ type: "admin.dev.win" })).ok,
    false,
  );
  assert.equal(
    validateClientMessage(JSON.stringify({ type: "input.frame", speed: 999 }))
      .error,
    "speed_rejected",
  );
  assert.equal(
    validateClientMessage(
      JSON.stringify({ type: "queue.join", ranked: true, devMode: true }),
    ).error,
    "ranked_dev_rejected",
  );
});

test("chat sanitizer strips markup and basic profanity", () => {
  assert.equal(sanitizeChat("<b>nice shit drift</b>"), "nice boost drift");
});

test("websocket backend supports guest auth and private room snapshots", async () => {
  const app = createInfernoServer({
    port: 0,
    dataDir: path.join(os.tmpdir(), `id4-${Date.now()}`),
    allowedOrigins: "http://127.0.0.1:5173",
  });
  const server = await app.listen();
  const port = server.address().port;
  const ws = new WebSocket(`ws://127.0.0.1:${port}`, {
    origin: "http://127.0.0.1:5173",
  });
  const messages = [];
  ws.on("message", (data) => messages.push(JSON.parse(data)));
  await new Promise((resolve) => ws.once("open", resolve));
  ws.send(JSON.stringify({ type: "auth.guest", username: "SmokeTwo" }));
  ws.send(
    JSON.stringify({
      type: "room.create",
      mode: "max-arena",
      size: 4,
      ranked: true,
    }),
  );
  await new Promise((resolve) => setTimeout(resolve, 150));
  assert.ok(
    messages.some(
      (msg) => msg.type === "auth.ok" && msg.user.username === "SmokeTwo",
    ),
  );
  const room = messages.find((msg) => msg.type === "room.snapshot");
  assert.equal(room.room.mode, "max-arena");
  assert.equal(room.room.size, 4);
  assert.equal(room.room.bots, 3);
  ws.terminate();
  await app.close();
});

test("websocket backend rejects origin prefix spoofing", async () => {
  const app = createInfernoServer({
    port: 0,
    dataDir: path.join(os.tmpdir(), `id4-origin-${Date.now()}`),
    allowedOrigins: "http://127.0.0.1:5173",
  });
  const server = await app.listen();
  const port = server.address().port;
  const ws = new WebSocket(`ws://127.0.0.1:${port}`, {
    origin: "http://127.0.0.1:5173.evil.test",
  });
  const error = await new Promise((resolve) => {
    ws.once("unexpected-response", (_request, response) =>
      resolve(response.statusCode),
    );
    ws.once("open", () => resolve("opened"));
  });
  assert.equal(error, 403);
  await app.close();
});

test("websocket backend supports two clients, chat filtering, and private join", async () => {
  const app = createInfernoServer({
    port: 0,
    dataDir: path.join(os.tmpdir(), `id4-two-${Date.now()}`),
    allowedOrigins: "http://127.0.0.1:5173",
  });
  const server = await app.listen();
  const port = server.address().port;
  const makeClient = async () => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}`, {
      origin: "http://127.0.0.1:5173",
    });
    const messages = [];
    ws.on("message", (data) => messages.push(JSON.parse(data)));
    await new Promise((resolve) => ws.once("open", resolve));
    return { ws, messages };
  };
  const a = await makeClient();
  const b = await makeClient();
  a.ws.send(JSON.stringify({ type: "auth.guest", username: "Alpha" }));
  b.ws.send(JSON.stringify({ type: "auth.guest", username: "Beta" }));
  a.ws.send(JSON.stringify({ type: "room.create", mode: "casual", size: 2 }));
  await new Promise((resolve) => setTimeout(resolve, 120));
  const code = a.messages.find((msg) => msg.type === "room.snapshot").room.code;
  b.ws.send(JSON.stringify({ type: "room.join", code }));
  b.ws.send(
    JSON.stringify({ type: "chat.send", text: "<b>nice shit drift</b>" }),
  );
  await new Promise((resolve) => setTimeout(resolve, 180));
  assert.ok(
    a.messages.some(
      (msg) => msg.type === "chat.message" && msg.text === "nice boost drift",
    ),
  );
  assert.ok(
    a.messages.some(
      (msg) => msg.type === "room.snapshot" && msg.room.players.length === 2,
    ),
  );
  a.ws.terminate();
  b.ws.terminate();
  await app.close();
});
