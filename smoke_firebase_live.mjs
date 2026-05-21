import assert from "node:assert/strict";
import { chromium } from "playwright";

const smokeUrl = process.env.SMOKE_URL || "http://127.0.0.1:4173/index.html";

const browser = await chromium.launch({
  headless: true,
  args: [
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--ignore-gpu-blocklist",
    "--use-gl=angle",
  ],
});

const page = await browser.newPage({ viewport: { width: 1280, height: 820 } });
page.setDefaultTimeout(18_000);

const consoleErrors = [];
page.on("console", (msg) => {
  const text = msg.text();
  if (
    msg.type() === "error" &&
    !/WebGL|GL Driver/i.test(text) &&
    !/Failed to load resource: the server responded with a status of 400/i.test(
      text,
    )
  ) {
    consoleErrors.push(text);
  }
});

try {
  await page.addInitScript(() => {
    localStorage.setItem(
      "infernoDrift4.online.v1",
      JSON.stringify({
        backendUrl: "wss://infernodrift4-online.clarkbythebay.workers.dev/ws",
        backupBackendUrls: [
          "wss://infernodrift4-online.clarkbythebay.workers.dev/ws",
        ],
      }),
    );
  });

  await page.goto(smokeUrl, { waitUntil: "commit", timeout: 45_000 });
  await page.waitForFunction(
    () => typeof window.render_game_to_text === "function",
  );
  await page.evaluate(() =>
    window.__infernodriftTestApi.dismissSchoolGateForTest(),
  );
  await page.waitForFunction(
    () =>
      !document.querySelector("#school-gate")?.classList.contains("show") &&
      document.querySelector("#overlay")?.classList.contains("show"),
  );
  await page.waitForTimeout(300);

  let state = JSON.parse(
    await page.evaluate(() => window.render_game_to_text()),
  );
  assert.equal(state.online.backendMode, "firebase");
  assert.equal(state.online.firebase.configured, true);
  assert.equal(state.online.firebase.projectId, "infernodrift4-online");
  assert.equal(state.online.configured, true);
  assert.equal(state.online.backendUrl, "");
  assert.deepEqual(state.online.backupBackendUrls, []);

  const accountUsername = `Smoke${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`;
  await page.locator("#start-account-username").fill(accountUsername);
  await page.locator("#start-account-password").fill("smoke12345");
  await page.locator("#start-account-age").fill("13");
  await page.evaluate(() =>
    document
      .querySelector("#start-account-submit")
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true })),
  );
  await page
    .waitForFunction((username) => {
      const state = JSON.parse(window.render_game_to_text());
      return (
        state.online.authenticated === true &&
        state.online.username === username &&
        state.online.transport === "firebase"
      );
    }, accountUsername)
    .catch(async (error) => {
      const state = JSON.parse(
        await page.evaluate(() => window.render_game_to_text()),
      );
      throw new Error(
        `Firebase account smoke failed: ${error.message}; status=${JSON.stringify(
          {
            online: state.online,
            startStatus:
              (await page.locator("#start-account-status").textContent()) ?? "",
            consoleErrors,
          },
        )}`,
      );
    });

  await page.evaluate(() =>
    window.__infernodriftTestApi.openMenuTab("profile"),
  );
  await page.evaluate(() =>
    document
      .querySelector("#profile-logout")
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true })),
  );
  await page.waitForFunction(() => {
    const state = JSON.parse(window.render_game_to_text());
    return state.online.authenticated === false;
  });
  await page.evaluate((username) => {
    const setValue = (selector, value) => {
      const input = document.querySelector(selector);
      if (!input) return;
      input.value = value;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    };
    setValue("#start-account-username", username);
    setValue("#start-account-password", "smoke12345");
    setValue("#start-account-age", "13");
    document
      .querySelector("#start-account-submit")
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }, accountUsername);
  await page.waitForFunction((username) => {
    const state = JSON.parse(window.render_game_to_text());
    return (
      state.online.authenticated === true &&
      state.online.username === username &&
      state.online.transport === "firebase"
    );
  }, accountUsername);

  const result = await page.evaluate(() =>
    window.__infernodriftTestApi.runConnectionTest(),
  );
  assert.equal(result.status, "ok");
  assert.equal(result.activeBackendUrl, "");
  assert.equal(result.report[0]?.health?.ok, true);
  assert.equal(result.report[0]?.httpFallback?.auth, true);
  assert.equal(result.report[0]?.httpFallback?.firestore, true);
  assert.equal(result.report[0]?.websocket?.ok, false);
  assert.equal(
    result.report[0]?.websocket?.error,
    "firebase_no_authoritative_websocket",
  );

  await page.waitForFunction(() => {
    const state = JSON.parse(window.render_game_to_text());
    return (
      state.online.backendHealth?.ok === true &&
      state.online.transport === "firebase" &&
      state.online.authenticated === true
    );
  });

  state = JSON.parse(await page.evaluate(() => window.render_game_to_text()));
  assert.equal(state.online.firebase.diagnosticsStatus, "ok");
  assert.equal(state.online.firebase.firestoreStatus, "ready");
  assert.ok(["ready", "listening"].includes(state.online.firebase.chatStatus));
  assert.equal(state.online.backendUrl, "");
  assert.deepEqual(state.online.backupBackendUrls, []);

  await page.evaluate(() => window.__infernodriftTestApi.openMenuTab("online"));
  await page.waitForFunction(() =>
    /Create Firebase Lobby/i.test(
      document.querySelector("#online-create-room")?.textContent || "",
    ),
  );
  await page.locator("#online-create-room").click({ force: true });
  await page.waitForFunction(() => {
    const state = JSON.parse(window.render_game_to_text());
    return (
      state.online.room?.firebaseLobby === true &&
      /^[A-Z0-9]{4,8}$/.test(state.online.room.code || "")
    );
  });
  let lobbyState = JSON.parse(
    await page.evaluate(() => window.render_game_to_text()),
  );
  const lobbyCode = lobbyState.online.room.code;
  assert.match(
    (await page.locator("#online-room-state").textContent()) ?? "",
    /Firebase lobby .*Chat and invites are active/i,
  );
  assert.equal(await page.locator("#online-queue").isDisabled(), true);
  await page.locator("#online-share-room").click({ force: true });
  await page.waitForFunction(() => {
    const state = JSON.parse(window.render_game_to_text());
    return (
      state.online.room?.shared === true &&
      state.online.chat.lastMessage?.roomInvite?.code ===
        state.online.room.code
    );
  });
  await page.locator("#online-room-code").fill(lobbyCode);
  await page.locator("#online-join-room").click({ force: true });
  await page.waitForFunction((code) => {
    const state = JSON.parse(window.render_game_to_text());
    return state.online.room?.code === code;
  }, lobbyCode);
  lobbyState = JSON.parse(await page.evaluate(() => window.render_game_to_text()));
  assert.equal(lobbyState.online.room.firebaseLobby, true);
  assert.equal(lobbyState.online.room.live, false);
  assert.doesNotMatch(
    lobbyState.online.chat.lastMessage?.text || "",
    /Server-authoritative rooms are unavailable/i,
  );
  await page
    .locator(".advanced-online-settings summary")
    .click({ force: true });
  await page.waitForTimeout(120);
  assert.equal(
    await page.locator("#online-test-connection").textContent(),
    "Run Firebase Test",
  );
  assert.equal(await page.locator("#online-backend-url").inputValue(), "");
  assert.equal(await page.locator("#online-backup-urls").inputValue(), "");
  assert.match(
    (await page.locator("#online-diagnostics").textContent()) ?? "",
    /Backend mode firebase.*Firebase project infernodrift4-online.*Diagnostics ok/i,
  );

  assert.deepEqual(consoleErrors, []);
  console.log(
    JSON.stringify(
      {
        firebaseDefault: state.online.backendMode,
        projectId: state.online.firebase.projectId,
        account: accountUsername,
        lobby: lobbyCode,
        diagnostics: state.online.firebase.diagnosticsStatus,
        transport: state.online.transport,
        websocket: result.report[0]?.websocket?.error,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
