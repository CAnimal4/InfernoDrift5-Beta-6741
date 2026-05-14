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
  ws.close();
  await new Promise((resolve) => server.close(resolve));
});
