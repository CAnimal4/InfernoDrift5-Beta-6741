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

function waitForMessage(messages, predicate, timeoutMs = 800) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const timer = setInterval(() => {
      const found = messages.find(predicate);
      if (found) {
        clearInterval(timer);
        resolve(found);
      } else if (Date.now() - started > timeoutMs) {
        clearInterval(timer);
        reject(new Error("timed out waiting for websocket message"));
      }
    }, 10);
  });
}

async function makeWsClient(port) {
  const ws = new WebSocket(`ws://127.0.0.1:${port}`, {
    origin: "http://127.0.0.1:5173",
  });
  const messages = [];
  ws.on("message", (data) => messages.push(JSON.parse(data)));
  await new Promise((resolve) => ws.once("open", resolve));
  return { ws, messages };
}

test("protocol accepts known messages and rejects unknown messages", () => {
  assert.equal(
    validateClientMessage(
      JSON.stringify({ type: "auth.guest", username: "Drifter" }),
    ).ok,
    true,
  );
  assert.equal(
    validateClientMessage(
      JSON.stringify({
        type: "auth.account",
        mode: "auto",
        username: "Drifter",
        password: "secret123",
        age: 13,
      }),
    ).ok,
    true,
  );
  assert.equal(
    validateClientMessage(
      JSON.stringify({
        type: "auth.account",
        username: "Drifter",
        password: "short",
        age: 13,
      }),
    ).ok,
    false,
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
  assert.equal(
    validateClientMessage(JSON.stringify({ type: "chat.send", text: "hello" }))
      .ok,
    true,
  );
  assert.equal(
    validateClientMessage(
      JSON.stringify({ type: "chat.send", age: 12, text: "hello" }),
    ).error,
    "chat_requires_13_plus",
  );
  assert.equal(
    validateClientMessage(
      JSON.stringify({ type: "chat.send", age: 13, text: "hello" }),
    ).ok,
    true,
  );
  assert.equal(
    validateClientMessage(
      JSON.stringify({ type: "room.create", playlist: "private", teamSize: 3 }),
    ).ok,
    true,
  );
  assert.equal(
    validateClientMessage(
      JSON.stringify({ type: "quick.send", text: "custom taunt" }),
    ).error,
    "invalid_quick_chat",
  );
  assert.equal(
    validateClientMessage(
      JSON.stringify({ type: "input.frame", speed: 100, score: 100000 }),
    ).error,
    "authoritative_rejected",
  );
  assert.equal(
    validateClientMessage(
      JSON.stringify({
        type: "results.commit",
        mode: "campaign-survival",
        runId: "local-run",
        stats: { score: 999999, win: true },
      }),
    ).error,
    "authoritative_rejected",
  );
  assert.equal(
    validateClientMessage(
      JSON.stringify({
        type: "save.sync",
        schemaVersion: 1,
        payload: { xp: 120, medals: { casual: "bronze" } },
      }),
    ).ok,
    true,
  );
  assert.equal(
    validateClientMessage(
      JSON.stringify({
        type: "feedback.submit",
        feedbackType: "bug",
        message: "The jump replay clipped through the arena wall.",
        replyEmail: "driver@example.com",
      }),
    ).ok,
    true,
  );
  assert.equal(
    validateClientMessage(JSON.stringify({ type: "room.create", size: 5 }))
      .error,
    "invalid_protocol",
  );
});

test("websocket backend supports password account create and sign in", async (t) => {
  const app = createInfernoServer({
    port: 0,
    dataDir: path.join(os.tmpdir(), `id4-account-${Date.now()}`),
    allowedOrigins: "http://127.0.0.1:5173",
    clarkReservationToken: "founder-token",
  });
  const server = await app.listen();
  t.after(async () => {
    await app.close();
  });
  const port = server.address().port;
  const a = await makeWsClient(port);

  a.ws.send(
    JSON.stringify({
      type: "auth.account",
      mode: "auto",
      username: "AccountAce",
      password: "secret123",
      age: 13,
    }),
  );
  const created = await waitForMessage(
    a.messages,
    (msg) => msg.type === "auth.ok",
  );
  assert.equal(created.user.username, "AccountAce");
  assert.equal(created.user.account, true);
  assert.equal(created.user.claimed, true);

  const wrong = await makeWsClient(port);
  wrong.ws.send(
    JSON.stringify({
      type: "auth.account",
      mode: "signin",
      username: "AccountAce",
      password: "wrongpass",
      age: 13,
    }),
  );
  await waitForMessage(
    wrong.messages,
    (msg) => msg.type === "error" && msg.error === "invalid_credentials",
  );

  const signin = await makeWsClient(port);
  signin.ws.send(
    JSON.stringify({
      type: "auth.account",
      mode: "signin",
      username: "AccountAce",
      password: "secret123",
      age: 14,
    }),
  );
  const restored = await waitForMessage(
    signin.messages,
    (msg) => msg.type === "auth.ok",
  );
  assert.equal(restored.user.id, created.user.id);
  assert.equal(restored.user.ageGate, 14);
  assert.equal(Object.keys(app.db.data.usernameClaims).join(","), "accountace");

  const clark = await makeWsClient(port);
  clark.ws.send(
    JSON.stringify({
      type: "auth.account",
      mode: "auto",
      username: "Clark",
      password: "secret123",
      age: 13,
    }),
  );
  await waitForMessage(
    clark.messages,
    (msg) => msg.type === "error" && msg.error === "username_reserved",
  );

  a.ws.terminate();
  wrong.ws.terminate();
  signin.ws.terminate();
  clark.ws.terminate();
});

test("chat sanitizer strips markup and basic profanity", () => {
  assert.equal(sanitizeChat("<b>nice shit drift</b>"), "nice boost drift");
});

test("chat sanitizer blocks hate, harassment, explicit content, and PII", () => {
  assert.equal(
    sanitizeChat("ping me at racer@example.com"),
    "ping me at [private]",
  );
  assert.equal(
    sanitizeChat("call 555-123-4567 after the race"),
    "call [private] after the race",
  );
  assert.equal(sanitizeChat("h3il hitler"), "[blocked]");
  assert.equal(sanitizeChat("white power"), "[blocked]");
  assert.equal(sanitizeChat("you are trash"), "[blocked]");
  assert.equal(sanitizeChat("go die"), "[blocked]");
  assert.equal(sanitizeChat("f4ggot"), "[blocked]");
  assert.equal(sanitizeChat("n1gger"), "[blocked]");
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
    JSON.stringify({
      type: "chat.send",
      age: 13,
      text: "<b>nice shit drift</b>",
    }),
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

test("websocket backend supports queue, age gate, quick chat, leaderboard, and social shell", async () => {
  const app = createInfernoServer({
    port: 0,
    dataDir: path.join(os.tmpdir(), `id4-social-${Date.now()}`),
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

  ws.send(JSON.stringify({ type: "auth.guest", username: "Junior", age: 12 }));
  ws.send(
    JSON.stringify({
      type: "queue.join",
      playlist: "casual",
      teamSize: 3,
      botFill: false,
    }),
  );
  ws.send(JSON.stringify({ type: "chat.send", text: "free chat?" }));
  ws.send(JSON.stringify({ type: "quick.send", text: "Nice drift!" }));
  ws.send(JSON.stringify({ type: "leaderboard.get", playlist: "ranked" }));
  ws.send(JSON.stringify({ type: "friend.request", username: "Beta" }));
  await new Promise((resolve) => setTimeout(resolve, 200));

  assert.ok(
    messages.some(
      (msg) =>
        msg.type === "queue.joined" &&
        msg.playlist === "casual" &&
        msg.teamSize === 3 &&
        msg.botFill === false,
    ),
  );
  assert.ok(
    messages.some(
      (msg) =>
        msg.type === "room.snapshot" &&
        msg.room.size === 6 &&
        msg.room.bots === 0,
    ),
  );
  assert.ok(
    messages.some(
      (msg) => msg.type === "error" && msg.error === "chat_requires_13_plus",
    ),
  );
  assert.ok(
    messages.some(
      (msg) =>
        msg.type === "chat.message" &&
        msg.quick === true &&
        msg.text === "Nice drift!",
    ),
  );
  assert.ok(
    messages.some(
      (msg) =>
        msg.type === "leaderboard.snapshot" &&
        msg.leaderboard[0]?.username === "Ghost Apex",
    ),
  );
  assert.ok(
    messages.some(
      (msg) =>
        msg.type === "friend.requested" &&
        msg.username === "Beta" &&
        msg.status === "pending",
    ),
  );
  assert.ok(
    messages.some(
      (msg) =>
        msg.type === "friends.snapshot" && Array.isArray(msg.recentPlayers),
    ),
  );
  ws.terminate();
  await app.close();
});

test("websocket backend persists sessions, claims, saves, friends, reports, feedback, and authoritative leaderboards", async (t) => {
  const dataDir = path.join(os.tmpdir(), `id4-phase4-${Date.now()}`);
  const app = createInfernoServer({
    port: 0,
    dataDir,
    allowedOrigins: "http://127.0.0.1:5173",
    clarkReservationToken: "founder-token",
  });
  const server = await app.listen();
  t.after(async () => {
    await app.close();
  });
  const port = server.address().port;
  const a = await makeWsClient(port);
  const b = await makeWsClient(port);

  a.ws.send(JSON.stringify({ type: "auth.guest", username: "Alpha", age: 13 }));
  b.ws.send(JSON.stringify({ type: "auth.guest", username: "Bravo", age: 13 }));
  const authA = await waitForMessage(
    a.messages,
    (msg) => msg.type === "auth.ok",
  );
  await waitForMessage(b.messages, (msg) => msg.type === "auth.ok");

  a.ws.send(
    JSON.stringify({ type: "profile.claimUsername", username: "RacerOne" }),
  );
  await waitForMessage(
    a.messages,
    (msg) =>
      msg.type === "profile.usernameClaimed" && msg.username === "RacerOne",
  );
  b.ws.send(
    JSON.stringify({ type: "profile.claimUsername", username: "RacerOne" }),
  );
  await waitForMessage(
    b.messages,
    (msg) => msg.type === "error" && msg.error === "username_taken",
  );
  b.ws.send(
    JSON.stringify({ type: "profile.claimUsername", username: "Clark" }),
  );
  await waitForMessage(
    b.messages,
    (msg) => msg.type === "error" && msg.error === "username_reserved",
  );
  b.ws.send(
    JSON.stringify({
      type: "profile.claimUsername",
      username: "Clark",
      turnstileToken: "founder-token",
    }),
  );
  await waitForMessage(
    b.messages,
    (msg) => msg.type === "profile.usernameClaimed" && msg.username === "Clark",
  );

  a.ws.send(
    JSON.stringify({
      type: "save.sync",
      schemaVersion: 1,
      payload: { xp: 450, medals: { "campaign-survival": "gold" } },
    }),
  );
  const saved = await waitForMessage(
    a.messages,
    (msg) => msg.type === "save.synced",
  );
  assert.equal(saved.payload.xp, 450);

  b.ws.send(JSON.stringify({ type: "friend.request", username: "RacerOne" }));
  const request = await waitForMessage(
    b.messages,
    (msg) => msg.type === "friend.requested" && msg.username === "RacerOne",
  );
  await waitForMessage(
    a.messages,
    (msg) =>
      msg.type === "friends.snapshot" &&
      msg.incomingRequests?.some(
        (incoming) => incoming.id === request.requestId,
      ),
  );
  a.ws.send(
    JSON.stringify({ type: "friend.accept", requestId: request.requestId }),
  );
  await waitForMessage(
    a.messages,
    (msg) => msg.type === "friend.accepted" && msg.username === "Clark",
  );
  await waitForMessage(
    b.messages,
    (msg) =>
      msg.type === "friends.snapshot" &&
      msg.friends?.some((friend) => friend.username === "RacerOne"),
  );

  a.ws.send(
    JSON.stringify({
      type: "friend.report",
      username: "Clark",
      reason: "Repeated bumping after the race ended",
    }),
  );
  const report = await waitForMessage(
    a.messages,
    (msg) => msg.type === "friend.reported",
  );
  assert.equal(report.username, "Clark");
  b.ws.send(JSON.stringify({ type: "friend.block", username: "RacerOne" }));
  await waitForMessage(
    b.messages,
    (msg) => msg.type === "friend.blocked" && msg.username === "RacerOne",
  );

  a.ws.send(
    JSON.stringify({
      type: "feedback.submit",
      feedbackType: "bug",
      message: "Please store this backend feedback locally for review.",
      replyEmail: "",
      diagnostics: { mode: "max-arena" },
    }),
  );
  await waitForMessage(
    a.messages,
    (msg) => msg.type === "feedback.received" && msg.delivery === "stored",
  );

  a.ws.send(
    JSON.stringify({
      type: "results.commit",
      mode: "campaign-survival",
      runId: "fake-win",
      stats: { score: 999999, win: true, rating: 9000 },
    }),
  );
  await waitForMessage(
    a.messages,
    (msg) => msg.type === "error" && msg.error === "authoritative_rejected",
  );
  a.ws.send(JSON.stringify({ type: "leaderboard.get", playlist: "ranked" }));
  const leaderboard = await waitForMessage(
    a.messages,
    (msg) => msg.type === "leaderboard.snapshot",
  );
  assert.ok(leaderboard.leaderboard.every((row) => row.source === "server"));
  assert.ok(
    leaderboard.leaderboard.some(
      (row) =>
        row.username === "RacerOne" &&
        row.xp === 450 &&
        row.score === 450 &&
        row.scope === "Total XP",
    ),
    "synced account save should enter the global XP leaderboard",
  );
  assert.equal(
    leaderboard.leaderboard.some((row) => row.rating === 9000),
    false,
  );

  const reconnect = await makeWsClient(port);
  reconnect.ws.send(
    JSON.stringify({
      type: "reconnect",
      sessionToken: authA.sessionToken,
    }),
  );
  const restored = await waitForMessage(
    reconnect.messages,
    (msg) => msg.type === "reconnect.ok",
  );
  assert.equal(restored.user.username, "RacerOne");
  assert.equal(restored.save.payload.xp, 450);

  assert.equal(app.db.data.feedback.length, 1);
  assert.equal(app.db.data.reports.length, 1);
  assert.equal(
    Object.keys(app.db.data.usernameClaims).sort().join(","),
    "clark,racerone",
  );

  a.ws.terminate();
  b.ws.terminate();
  reconnect.ws.terminate();
});

test("http feedback endpoint stores sanitized submissions and keeps reply email 13 plus only", async (t) => {
  const app = createInfernoServer({
    port: 0,
    dataDir: path.join(os.tmpdir(), `id4-feedback-${Date.now()}`),
    allowedOrigins: "http://127.0.0.1:5173",
  });
  const server = await app.listen();
  t.after(async () => {
    await app.close();
  });
  const port = server.address().port;

  const response = await fetch(`http://127.0.0.1:${port}/api/feedback`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "http://127.0.0.1:5173",
    },
    body: JSON.stringify({
      feedbackType: "fix",
      message: "<b>The bowling reset is shit after a spare.</b>",
      age13OrOlder: false,
      replyEmail: "driver@example.com",
      diagnostics: { mode: "boost-bowling" },
    }),
  });
  const payload = await response.json();
  assert.equal(response.status, 200);
  assert.equal(payload.ok, true);
  assert.equal(payload.delivery, "stored");
  assert.equal(app.db.data.feedback.length, 1);
  assert.equal(app.db.data.feedback[0].feedbackType, "fix");
  assert.equal(
    app.db.data.feedback[0].message,
    "The bowling reset is boost after a spare.",
  );
  assert.equal(app.db.data.feedback[0].replyEmail, "");
});
