import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { WebSocket } from "ws";
import { createInfernoServer } from "./apps/server/src/index.js";

let app = null;
let serverUrl = process.env.INFERNO_ONLINE_SMOKE_URL || "";
if (!serverUrl) {
  app = createInfernoServer({
    port: 0,
    dataDir: path.join(os.tmpdir(), `id4-online-smoke-${Date.now()}`),
    allowedOrigins: "",
  });
  const server = await app.listen();
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 8787;
  serverUrl = `ws://127.0.0.1:${port}`;
}

try {
  const host = await connectClient(serverUrl);
  const guest = await connectClient(serverUrl);
  const child = await connectClient(serverUrl);

  host.send({ type: "auth.guest", username: "LocalSmokeHost", age: 13 });
  guest.send({ type: "auth.guest", username: "LocalSmokeGuest", age: 13 });
  child.send({ type: "auth.guest", username: "LocalSmokeChild", age: 12 });
  await host.waitFor("auth.ok");
  await guest.waitFor("auth.ok");
  await child.waitFor("auth.ok");

  host.send({
    type: "room.create",
    playlist: "casual",
    teamSize: 2,
    botFill: true,
    private: true,
  });
  const firstRoom = await host.waitFor("room.snapshot");
  const code = firstRoom.room.code;
  assert.match(code, /^[A-Z0-9]{4,10}$/);
  assert.equal(firstRoom.room.players.length, 1);

  guest.send({ type: "room.join", code });
  const joinedHostRoom = await host.waitFor(
    "room.snapshot",
    (message) => message.room.players.length === 2,
  );
  const joinedGuestRoom = await guest.waitFor(
    "room.snapshot",
    (message) => message.room.players.length === 2,
  );
  assert.equal(joinedHostRoom.room.code, code);
  assert.equal(joinedGuestRoom.room.code, code);

  host.send({ type: "quick.send", text: "Nice drift!" });
  const quick = await guest.waitFor("chat.message");
  assert.equal(quick.quick, true);
  assert.equal(quick.text, "Nice drift!");

  guest.send({
    type: "chat.send",
    text: "<b>nice shit drift</b>",
    channel: "lobby",
  });
  const chat = await host.waitFor(
    "chat.message",
    (message) => message.quick === false,
  );
  assert.equal(chat.quick, false);
  assert.equal(chat.text, "nice boost drift");

  child.send({
    type: "chat.send",
    text: "I should be quick chat only",
    channel: "lobby",
  });
  const gated = await child.waitFor("error");
  assert.equal(gated.error, "chat_requires_13_plus");

  host.send({
    type: "input.frame",
    seq: 1,
    dt: 0.016,
    throttle: 1,
    steer: 0.25,
    drift: true,
    boost: false,
    jump: false,
    client: { x: 4, z: -9, speed: 82 },
  });
  const inputAccepted = await host.waitFor("input.accepted");
  assert.equal(inputAccepted.tick, 1);
  const snapshot = await guest.waitFor("match.snapshot");
  assert.ok(snapshot.players.some((player) => player.input?.speed === 82));

  host.send({ type: "leaderboard.get", playlist: "casual" });
  const leaderboard = await host.waitFor("leaderboard.snapshot");
  assert.ok(leaderboard.leaderboard.length >= 1);

  const feedbackResponse = await fetch(deriveFeedbackUrl(serverUrl), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      feedbackType: "bug",
      message: "Online smoke feedback storage check.",
      age13OrOlder: false,
      diagnostics: { smoke: "online-local" },
    }),
  });
  const feedback = await feedbackResponse.json();
  assert.equal(feedbackResponse.status, 200);
  assert.equal(feedback.ok, true);
  assert.match(feedback.feedbackId, /.+/);

  host.close();
  guest.close();
  child.close();

  console.log(
    JSON.stringify(
      {
        serverUrl,
        roomCode: code,
        players: joinedHostRoom.room.players.length,
        bots: joinedHostRoom.room.bots,
        sanitizedChat: chat.text,
        childChatGate: gated.error,
        leaderboardRows: leaderboard.leaderboard.length,
        feedbackDelivery: feedback.delivery,
      },
      null,
      2,
    ),
  );
} finally {
  await app?.close();
}

function deriveFeedbackUrl(wsUrl) {
  const url = new URL(wsUrl);
  url.protocol = url.protocol === "wss:" ? "https:" : "http:";
  url.pathname = "/api/feedback";
  url.search = "";
  url.hash = "";
  return url.toString();
}

function connectClient(url) {
  const ws = new WebSocket(url);
  const inbox = [];
  const waiters = [];
  ws.on("message", (raw) => {
    const message = JSON.parse(String(raw));
    inbox.push(message);
    for (const waiter of [...waiters]) waiter.check();
  });
  return new Promise((resolve, reject) => {
    ws.on("open", () => {
      resolve({
        send(payload) {
          ws.send(JSON.stringify(payload));
        },
        close() {
          ws.close();
        },
        waitFor(type, predicate = () => true, timeoutMs = 5000) {
          return new Promise((waitResolve, waitReject) => {
            const deadline = setTimeout(() => {
              const index = waiters.findIndex(
                (waiter) => waiter.check === check,
              );
              if (index >= 0) waiters.splice(index, 1);
              waitReject(new Error(`Timed out waiting for ${type}`));
            }, timeoutMs);
            function check() {
              const index = inbox.findIndex(
                (message) => message.type === type && predicate(message),
              );
              if (index < 0) return;
              clearTimeout(deadline);
              const waiterIndex = waiters.findIndex(
                (waiter) => waiter.check === check,
              );
              if (waiterIndex >= 0) waiters.splice(waiterIndex, 1);
              waitResolve(inbox.splice(index, 1)[0]);
            }
            waiters.push({ check });
            check();
          });
        },
      });
    });
    ws.on("error", reject);
  });
}
