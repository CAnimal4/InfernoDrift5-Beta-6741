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
    validateClientMessage(JSON.stringify({ type: "profile.get" })).ok,
    true,
  );
  assert.equal(
    validateClientMessage(JSON.stringify({ type: "profile.logout" })).ok,
    true,
  );
  assert.equal(
    validateClientMessage(
      JSON.stringify({ type: "profile.delete", confirmUsername: "Drifter" }),
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
        type: "input.frame",
        seq: 4,
        dt: 0.016,
        throttle: 1,
        steer: 0.2,
        drift: true,
        boost: true,
        jump: false,
        y: 3,
        heading: 1.2,
        airborne: true,
        backflip: true,
        barrelRoll: false,
        trick: "backflip",
        cosmetics: { paintId: "red-hot", glowId: "cyan" },
        client: { x: 4, y: 3, z: -8, speed: 92, heading: 1.2 },
      }),
    ).ok,
    true,
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
    validateClientMessage(
      JSON.stringify({
        type: "moderation.kick",
        username: "RacerOne",
        reason: "relogin please",
      }),
    ).ok,
    true,
  );
  assert.equal(
    validateClientMessage(
      JSON.stringify({
        type: "moderation.ban",
        userId: "seed-joshua",
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
  assert.ok(Object.keys(app.db.data.usernameClaims).includes("accountace"));

  const guest = await makeWsClient(port);
  guest.ws.send(
    JSON.stringify({
      type: "auth.guest",
      username: "UpgradeAce",
      age: 13,
      deviceId: "upgrade-device",
    }),
  );
  await waitForMessage(guest.messages, (msg) => msg.type === "auth.ok");
  guest.ws.send(
    JSON.stringify({ type: "profile.claimUsername", username: "UpgradeAce" }),
  );
  await waitForMessage(
    guest.messages,
    (msg) => msg.type === "profile.usernameClaimed",
  );
  const upgraded = await makeWsClient(port);
  upgraded.ws.send(
    JSON.stringify({
      type: "auth.account",
      mode: "auto",
      username: "UpgradeAce",
      password: "secret456",
      age: 13,
      deviceId: "upgrade-device",
    }),
  );
  const upgradeAuth = await waitForMessage(
    upgraded.messages,
    (msg) => msg.type === "auth.ok",
  );
  assert.equal(upgradeAuth.user.username, "UpgradeAce");
  assert.equal(upgradeAuth.user.account, true);

  const clark = await makeWsClient(port);
  clark.ws.send(
    JSON.stringify({
      type: "auth.account",
      mode: "signin",
      username: "Clark",
      password: "ibelikesheesh",
      age: 13,
    }),
  );
  const clarkAuth = await waitForMessage(
    clark.messages,
    (msg) => msg.type === "auth.ok",
  );
  assert.equal(clarkAuth.user.badge, "Founder");
  assert.equal(clarkAuth.user.account, true);

  a.ws.terminate();
  wrong.ws.terminate();
  signin.ws.terminate();
  clark.ws.terminate();
  guest.ws.terminate();
  upgraded.ws.terminate();
});

test("profile logout/delete and 30 minute chat history are live", async (t) => {
  const app = createInfernoServer({
    port: 0,
    dataDir: path.join(os.tmpdir(), `id4-profile-${Date.now()}`),
    allowedOrigins: "http://127.0.0.1:5173",
  });
  const server = await app.listen();
  t.after(async () => {
    await app.close();
  });
  const port = server.address().port;
  const alpha = await makeWsClient(port);

  alpha.ws.send(
    JSON.stringify({
      type: "auth.account",
      mode: "auto",
      username: "HistoryAce",
      password: "secret123",
      age: 13,
      deviceId: "history-device",
    }),
  );
  const alphaAuth = await waitForMessage(
    alpha.messages,
    (msg) => msg.type === "auth.ok",
  );
  await waitForMessage(
    alpha.messages,
    (msg) => msg.type === "profile.snapshot",
  );

  alpha.ws.send(JSON.stringify({ type: "chat.send", text: "hi from lobby" }));
  await waitForMessage(
    alpha.messages,
    (msg) => msg.type === "chat.message" && msg.text === "hi from lobby",
  );

  const beta = await makeWsClient(port);
  beta.ws.send(
    JSON.stringify({
      type: "auth.guest",
      username: "HistoryGuest",
      age: 13,
      deviceId: "history-guest-device",
    }),
  );
  await waitForMessage(beta.messages, (msg) => msg.type === "auth.ok");
  const history = await waitForMessage(
    beta.messages,
    (msg) =>
      msg.type === "chat.history" &&
      msg.messages.some((entry) => entry.text === "hi from lobby"),
  );
  assert.equal(history.windowMs, 30 * 60 * 1000);

  alpha.ws.send(JSON.stringify({ type: "profile.logout" }));
  await waitForMessage(
    alpha.messages,
    (msg) => msg.type === "profile.loggedOut",
  );
  const reconnect = await makeWsClient(port);
  reconnect.ws.send(
    JSON.stringify({ type: "reconnect", sessionToken: alphaAuth.sessionToken }),
  );
  await waitForMessage(
    reconnect.messages,
    (msg) => msg.type === "error" && msg.error === "session_expired",
  );

  const deleteClient = await makeWsClient(port);
  deleteClient.ws.send(
    JSON.stringify({
      type: "auth.account",
      mode: "signin",
      username: "HistoryAce",
      password: "secret123",
      age: 13,
    }),
  );
  await waitForMessage(deleteClient.messages, (msg) => msg.type === "auth.ok");
  deleteClient.ws.send(
    JSON.stringify({
      type: "profile.delete",
      confirmUsername: "HistoryAce",
    }),
  );
  await waitForMessage(
    deleteClient.messages,
    (msg) => msg.type === "profile.deleted",
  );
  assert.equal(app.db.data.usernameClaims.historyace, undefined);
  assert.equal(app.db.data.users[alphaAuth.user.id], undefined);
  assert.equal(
    app.db.data.chatMessages.some(
      (message) =>
        message.userId === alphaAuth.user.id &&
        message.from === "Deleted Player",
    ),
    true,
  );

  alpha.ws.terminate();
  beta.ws.terminate();
  reconnect.ws.terminate();
  deleteClient.ws.terminate();
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

test("websocket backend supports two clients, chat filtering, and private join", async (t) => {
  const app = createInfernoServer({
    port: 0,
    dataDir: path.join(os.tmpdir(), `id4-two-${Date.now()}`),
    allowedOrigins: "http://127.0.0.1:5173",
  });
  const server = await app.listen();
  let a;
  let b;
  t.after(async () => {
    a?.ws.terminate();
    b?.ws.terminate();
    await app.close();
  });
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
  a = await makeClient();
  b = await makeClient();
  a.ws.send(JSON.stringify({ type: "auth.guest", username: "Alpha", age: 13 }));
  b.ws.send(JSON.stringify({ type: "auth.guest", username: "Beta", age: 13 }));
  await waitForMessage(a.messages, (msg) => msg.type === "auth.ok");
  await waitForMessage(b.messages, (msg) => msg.type === "auth.ok");
  a.ws.send(JSON.stringify({ type: "room.create", mode: "casual", size: 2 }));
  await new Promise((resolve) => setTimeout(resolve, 120));
  const code = a.messages.find((msg) => msg.type === "room.snapshot").room.code;
  a.ws.send(JSON.stringify({ type: "room.share" }));
  await waitForMessage(
    a.messages,
    (msg) => msg.type === "room.shared" && msg.status === "shared",
  );
  a.ws.send(JSON.stringify({ type: "room.share" }));
  await waitForMessage(
    a.messages,
    (msg) => msg.type === "room.shared" && msg.status === "already_shared",
  );
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
    b.messages.some(
      (msg) => msg.type === "chat.message" && msg.text === `Room code ${code}`,
    ),
  );
  assert.equal(
    a.messages.filter(
      (msg) => msg.type === "chat.message" && msg.text === `Room code ${code}`,
    ).length,
    1,
  );
  assert.ok(
    a.messages.some(
      (msg) => msg.type === "room.snapshot" && msg.room.players.length === 2,
    ),
  );
});

test("private rooms use unique codes, modes, isolated snapshots, and rich live state", async (t) => {
  const app = createInfernoServer({
    port: 0,
    dataDir: path.join(os.tmpdir(), `id4-rooms-${Date.now()}`),
    allowedOrigins: "http://127.0.0.1:5173",
  });
  const server = await app.listen();
  t.after(async () => {
    await app.close();
  });
  const port = server.address().port;
  const hostA = await makeWsClient(port);
  const joinA = await makeWsClient(port);
  const hostB = await makeWsClient(port);
  const joinB = await makeWsClient(port);

  hostA.ws.send(
    JSON.stringify({ type: "auth.guest", username: "RoomA", age: 13 }),
  );
  joinA.ws.send(
    JSON.stringify({ type: "auth.guest", username: "JoinA", age: 13 }),
  );
  hostB.ws.send(
    JSON.stringify({ type: "auth.guest", username: "RoomB", age: 13 }),
  );
  joinB.ws.send(
    JSON.stringify({ type: "auth.guest", username: "JoinB", age: 13 }),
  );
  await waitForMessage(hostA.messages, (msg) => msg.type === "auth.ok");
  await waitForMessage(joinA.messages, (msg) => msg.type === "auth.ok");
  await waitForMessage(hostB.messages, (msg) => msg.type === "auth.ok");
  await waitForMessage(joinB.messages, (msg) => msg.type === "auth.ok");

  hostA.ws.send(
    JSON.stringify({
      type: "room.create",
      mode: "battle-arena",
      playlist: "private",
      teamSize: 1,
      botFill: false,
    }),
  );
  hostB.ws.send(
    JSON.stringify({
      type: "room.create",
      mode: "boost-bowling",
      playlist: "private",
      teamSize: 1,
      botFill: false,
    }),
  );
  const roomA = await waitForMessage(
    hostA.messages,
    (msg) => msg.type === "room.snapshot" && msg.room.mode === "battle-arena",
  );
  const roomB = await waitForMessage(
    hostB.messages,
    (msg) => msg.type === "room.snapshot" && msg.room.mode === "boost-bowling",
  );
  assert.notEqual(roomA.room.code, roomB.room.code);

  joinA.ws.send(JSON.stringify({ type: "room.join", code: roomA.room.code }));
  joinB.ws.send(JSON.stringify({ type: "room.join", code: roomB.room.code }));
  await waitForMessage(
    joinA.messages,
    (msg) =>
      msg.type === "room.snapshot" &&
      msg.room.code === roomA.room.code &&
      msg.room.players.length === 2,
  );
  await waitForMessage(
    joinB.messages,
    (msg) =>
      msg.type === "room.snapshot" &&
      msg.room.code === roomB.room.code &&
      msg.room.players.length === 2,
  );

  hostA.ws.send(
    JSON.stringify({
      type: "input.frame",
      seq: 8,
      dt: 0.016,
      throttle: 1,
      steer: 0.1,
      drift: false,
      boost: true,
      jump: false,
      x: 12,
      y: 4,
      z: -32,
      heading: 0.72,
      speed: 98,
      airborne: true,
      backflip: true,
      cosmetics: { paintId: "red-hot", glowId: "cyan" },
    }),
  );
  const snapshotA = await waitForMessage(
    joinA.messages,
    (msg) =>
      msg.type === "match.snapshot" &&
      msg.roomCode === roomA.room.code &&
      msg.players.some((player) => player.username === "RoomA"),
  );
  const hostAState = snapshotA.players.find(
    (player) => player.username === "RoomA",
  );
  assert.equal(hostAState.input.backflip, true);
  assert.equal(hostAState.input.cosmetics.paintId, "red-hot");
  assert.equal(
    joinB.messages.some(
      (msg) =>
        msg.type === "match.snapshot" &&
        msg.players?.some((player) => player.username === "RoomA"),
    ),
    false,
  );
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
        msg.leaderboard.some(
          (row) => row.username === "Clark" && row.badge === "Founder",
        ),
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

test("friending Clark grants a one-time founder XP bonus", async (t) => {
  const app = createInfernoServer({
    port: 0,
    dataDir: path.join(os.tmpdir(), `id4-founder-friend-${Date.now()}`),
    allowedOrigins: "http://127.0.0.1:5173",
  });
  const server = await app.listen();
  t.after(async () => {
    await app.close();
  });
  const port = server.address().port;
  const player = await makeWsClient(port);

  player.ws.send(
    JSON.stringify({
      type: "auth.account",
      mode: "create",
      username: "FounderFan",
      password: "founderfanpass",
      age: 13,
    }),
  );
  await waitForMessage(player.messages, (msg) => msg.type === "auth.ok");
  player.ws.send(JSON.stringify({ type: "friend.request", username: "Clark" }));

  const request = await waitForMessage(
    player.messages,
    (msg) =>
      msg.type === "friend.requested" &&
      msg.username === "Clark" &&
      msg.status === "accepted",
  );
  assert.ok(request.requestId);
  await waitForMessage(
    player.messages,
    (msg) => msg.type === "friend.accepted" && msg.username === "Clark",
  );
  const reward = await waitForMessage(
    player.messages,
    (msg) =>
      msg.type === "progression.reward" && msg.reason === "founder_friend",
  );
  assert.equal(reward.xp, 1000);
  assert.equal(reward.totalXp, 1000);
  assert.equal(reward.payload.progressionV2.totalXp, 1000);
  await waitForMessage(
    player.messages,
    (msg) =>
      msg.type === "friends.snapshot" &&
      msg.friends?.some((friend) => friend.username === "Clark"),
  );
  const leaderboard = await waitForMessage(
    player.messages,
    (msg) =>
      msg.type === "leaderboard.snapshot" &&
      msg.leaderboard.some(
        (row) => row.username === "FounderFan" && row.xp === 1000,
      ),
  );
  assert.ok(leaderboard.leaderboard[0].xp >= 1000);

  player.ws.send(JSON.stringify({ type: "friend.request", username: "Clark" }));
  await new Promise((resolve) => setTimeout(resolve, 120));
  assert.equal(
    player.messages.filter(
      (msg) =>
        msg.type === "progression.reward" && msg.reason === "founder_friend",
    ).length,
    1,
  );
  player.ws.terminate();
});

test("seeded accounts expose badges and moderator can kick and one-day ban", async (t) => {
  const app = createInfernoServer({
    port: 0,
    dataDir: path.join(os.tmpdir(), `id4-moderation-${Date.now()}`),
    allowedOrigins: "http://127.0.0.1:5173",
  });
  const server = await app.listen();
  t.after(async () => {
    await app.close();
  });
  const port = server.address().port;
  const moderator = await makeWsClient(port);
  const joshua = await makeWsClient(port);

  moderator.ws.send(
    JSON.stringify({
      type: "auth.account",
      mode: "signin",
      username: "MODERATOR",
      password: "thefoxjumpedoverthelazyriver",
      age: 13,
    }),
  );
  const modAuth = await waitForMessage(
    moderator.messages,
    (msg) => msg.type === "auth.ok",
  );
  assert.equal(modAuth.user.badge, "MOD");
  assert.equal(modAuth.user.moderator, true);

  joshua.ws.send(
    JSON.stringify({
      type: "auth.account",
      mode: "signin",
      username: "Joshua",
      password: "footballcards",
      age: 13,
      deviceId: "joshua-device",
    }),
  );
  const joshuaAuth = await waitForMessage(
    joshua.messages,
    (msg) => msg.type === "auth.ok",
  );
  assert.equal(joshuaAuth.user.badge, "Advanced Player");

  moderator.ws.send(
    JSON.stringify({ type: "leaderboard.get", playlist: "ranked" }),
  );
  const leaderboard = await waitForMessage(
    moderator.messages,
    (msg) => msg.type === "leaderboard.snapshot",
  );
  assert.ok(
    leaderboard.leaderboard.some(
      (row) =>
        row.username === "MODERATOR" &&
        row.badge === "MOD" &&
        row.moderator === true,
    ),
  );
  assert.ok(
    leaderboard.leaderboard.some(
      (row) => row.username === "Joshua" && row.badge === "Advanced Player",
    ),
  );

  joshua.ws.send(
    JSON.stringify({
      type: "save.sync",
      schemaVersion: 4,
      payload: { progressionV2: { xp: 9350, totalXp: 9350, level: 18 } },
    }),
  );
  await waitForMessage(joshua.messages, (msg) => msg.type === "save.synced");
  joshua.ws.send(
    JSON.stringify({ type: "leaderboard.get", playlist: "casual" }),
  );
  const updatedLeaderboard = await waitForMessage(
    joshua.messages,
    (msg) =>
      msg.type === "leaderboard.snapshot" &&
      msg.leaderboard.some(
        (row) => row.username === "Joshua" && row.xp === 9350,
      ),
  );
  const updatedJoshua = updatedLeaderboard.leaderboard.find(
    (row) => row.username === "Joshua",
  );
  assert.equal(updatedJoshua.xp, 9350);
  assert.equal(updatedJoshua.badge, "Advanced Player");

  moderator.ws.send(
    JSON.stringify({
      type: "moderation.kick",
      username: "Joshua",
      reason: "relogin test",
    }),
  );
  await waitForMessage(
    moderator.messages,
    (msg) => msg.type === "moderation.done" && msg.action === "kick",
  );
  await waitForMessage(
    joshua.messages,
    (msg) => msg.type === "moderation.kicked",
  );
  joshua.ws.terminate();

  const joshuaAgain = await makeWsClient(port);
  joshuaAgain.ws.send(
    JSON.stringify({
      type: "auth.account",
      mode: "signin",
      username: "Joshua",
      password: "footballcards",
      age: 13,
      deviceId: "joshua-device",
    }),
  );
  await waitForMessage(joshuaAgain.messages, (msg) => msg.type === "auth.ok");

  moderator.ws.send(
    JSON.stringify({
      type: "moderation.ban",
      username: "Joshua",
      reason: "one day test",
    }),
  );
  await waitForMessage(
    moderator.messages,
    (msg) => msg.type === "moderation.done" && msg.action === "ban",
  );
  await waitForMessage(
    joshuaAgain.messages,
    (msg) => msg.type === "moderation.banned",
  );
  joshuaAgain.ws.terminate();

  const banned = await makeWsClient(port);
  banned.ws.send(
    JSON.stringify({
      type: "auth.account",
      mode: "signin",
      username: "Joshua",
      password: "footballcards",
      age: 13,
      deviceId: "joshua-device",
    }),
  );
  const error = await waitForMessage(
    banned.messages,
    (msg) => msg.type === "error" && msg.error === "account_banned",
  );
  assert.ok(error.until);

  const bannedGuest = await makeWsClient(port);
  bannedGuest.ws.send(
    JSON.stringify({
      type: "auth.guest",
      username: "GuestAfterBan",
      age: 13,
      deviceId: "joshua-device",
    }),
  );
  await waitForMessage(
    bannedGuest.messages,
    (msg) => msg.type === "error" && msg.error === "account_banned",
  );

  moderator.ws.terminate();
  banned.ws.terminate();
  bannedGuest.ws.terminate();
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

  a.ws.send(
    JSON.stringify({
      type: "auth.account",
      mode: "create",
      username: "Alpha",
      password: "alpha-password",
      age: 13,
    }),
  );
  b.ws.send(
    JSON.stringify({
      type: "auth.account",
      mode: "create",
      username: "Bravo",
      password: "bravo-password",
      age: 13,
    }),
  );
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
  a.ws.send(JSON.stringify({ type: "leaderboard.get", playlist: "casual" }));
  const initialLeaderboard = await waitForMessage(
    a.messages,
    (msg) =>
      msg.type === "leaderboard.snapshot" &&
      msg.playerRow?.username === "RacerOne",
  );
  assert.equal(initialLeaderboard.playerRow.xp, 0);
  assert.equal(initialLeaderboard.playerRow.scope, "Total XP");
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
    (msg) => msg.type === "error" && msg.error === "username_taken",
  );
  b.ws.send(
    JSON.stringify({
      type: "profile.claimUsername",
      username: "BravoPrime",
    }),
  );
  await waitForMessage(
    b.messages,
    (msg) =>
      msg.type === "profile.usernameClaimed" && msg.username === "BravoPrime",
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
    (msg) => msg.type === "friend.accepted" && msg.username === "BravoPrime",
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
      username: "BravoPrime",
      reason: "Repeated bumping after the race ended",
    }),
  );
  const report = await waitForMessage(
    a.messages,
    (msg) => msg.type === "friend.reported",
  );
  assert.equal(report.username, "BravoPrime");
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
    (msg) =>
      msg.type === "feedback.received" &&
      msg.delivery === "stored_email_not_configured",
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
    (msg) =>
      msg.type === "leaderboard.snapshot" &&
      msg.leaderboard.some(
        (row) =>
          row.username === "RacerOne" &&
          row.xp === 450 &&
          row.score === 450 &&
          row.scope === "Total XP",
      ),
  );
  assert.ok(leaderboard.leaderboard.every((row) => row.source === "server"));
  assert.equal(leaderboard.playerRow.username, "RacerOne");
  assert.equal(leaderboard.playerRow.xp, 450);
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
    Object.keys(app.db.data.usernameClaims).includes("racerone"),
    true,
  );
  assert.equal(
    Object.keys(app.db.data.usernameClaims).includes("bravoprime"),
    true,
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
  assert.equal(payload.delivery, "stored_email_not_configured");
  assert.equal(app.db.data.feedback.length, 1);
  assert.equal(app.db.data.feedback[0].feedbackType, "fix");
  assert.equal(
    app.db.data.feedback[0].message,
    "The bowling reset is boost after a spare.",
  );
  assert.equal(app.db.data.feedback[0].replyEmail, "");
});

test("http feedback endpoint sends through configured Resend transport truthfully", async (t) => {
  const deliveries = [];
  const app = createInfernoServer({
    port: 0,
    dataDir: path.join(os.tmpdir(), `id4-feedback-email-${Date.now()}`),
    allowedOrigins: "http://127.0.0.1:5173",
    resendApiKey: "test-resend-key",
    feedbackFrom: "InfernoDrift4 <feedback@example.com>",
    feedbackTo: "clarkbythebay@gmail.com,clark.alden@lbusd.org",
    feedbackFetch: async (url, options) => {
      deliveries.push({
        url,
        body: JSON.parse(options.body),
        headers: options.headers,
      });
      return Response.json({ id: "email-test" });
    },
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
      feedbackType: "feature",
      message: "Please add a cleaner room invite flow.",
      age13OrOlder: true,
      replyEmail: "driver@example.com",
      diagnostics: { room: "ABCD12" },
    }),
  });
  const payload = await response.json();
  assert.equal(response.status, 200);
  assert.equal(payload.delivery, "delivered");
  assert.equal(payload.emailConfigured, true);
  assert.equal(deliveries.length, 1);
  assert.deepEqual(deliveries[0].body.to, [
    "clarkbythebay@gmail.com",
    "clark.alden@lbusd.org",
  ]);
  assert.equal(deliveries[0].body.from, "InfernoDrift4 <feedback@example.com>");
  assert.match(
    deliveries[0].body.text,
    /Please add a cleaner room invite flow/,
  );
});
