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
page.setDefaultTimeout(30_000);

async function waitForRemotePlayer(targetPage, predicate, label, arg = null) {
  try {
    await targetPage.waitForFunction(predicate, arg, { timeout: 30_000 });
  } catch (error) {
    const state = JSON.parse(
      await targetPage.evaluate(() => window.render_game_to_text()),
    );
    throw new Error(
      `${label}: ${JSON.stringify({
        room: state.online.room,
        firebaseLive: state.online.firebaseLive,
        remotePlayers: state.online.remotePlayers,
        humanPlayers: state.humanPlayers,
      })}`,
      { cause: error },
    );
  }
}

async function cleanupSmokeAccount(targetPage) {
  if (!targetPage || targetPage.isClosed()) return false;
  try {
    const startedAt = await targetPage.evaluate(() => {
      const state = JSON.parse(window.render_game_to_text());
      return Number(state.online.profile?.saveSyncedAt || 0);
    });
    const started = await targetPage.evaluate(() =>
      window.__infernodriftTestApi.cleanupSmokeAccountProgressForTest(),
    );
    if (!started) return false;
    await targetPage.waitForFunction((previous) => {
      const state = JSON.parse(window.render_game_to_text());
      return (
        Number(state.online.profile?.saveSyncedAt || 0) > Number(previous || 0) &&
        Number(state.progression?.totalXp || 0) === 0
      );
    }, startedAt);
    return true;
  } catch (error) {
    console.warn("Smoke account cleanup failed", error?.message || error);
    return false;
  }
}

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

let joinerContext = null;
let joiner = null;

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

  const giftResult = await page.evaluate(() => {
    window.__infernodriftTestApi.resetLocalProgressionForTest();
    return window.__infernodriftTestApi.redeemDailyGift();
  });
  assert.equal(giftResult.ok, true);
  assert.ok(giftResult.amount > 0);
  const syncStartedAt = await page.evaluate(() => {
    const state = JSON.parse(window.render_game_to_text());
    return state.online.profile?.saveSyncedAt || 0;
  });
  await page.evaluate(() => window.__infernodriftTestApi.forceOnlineProgressSync());
  await page.waitForFunction((startedAt) => {
    const state = JSON.parse(window.render_game_to_text());
    return Number(state.online.profile?.saveSyncedAt || 0) > Number(startedAt || 0);
  }, syncStartedAt);
  let syncedProgressState = JSON.parse(
    await page.evaluate(() => window.render_game_to_text()),
  );
  assert.equal(syncedProgressState.progression.totalXp, giftResult.progression.totalXp);

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
  await page.evaluate(() =>
    window.__infernodriftTestApi.openMenuTab("leaderboard"),
  );
  await page.waitForTimeout(500);
  syncedProgressState = JSON.parse(
    await page.evaluate(() => window.render_game_to_text()),
  );
  assert.equal(
    syncedProgressState.progression.totalXp,
    giftResult.progression.totalXp,
  );

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

  await page.evaluate(() => {
    window.__infernodriftTestApi.selectMode("max-arena");
    window.__infernodriftTestApi.openMenuTab("online");
  });
  await page.waitForFunction(() =>
    /Create Online Lobby/i.test(
      document.querySelector("#online-create-room")?.textContent || "",
    ),
  );
  await page.locator("#online-room-mode").selectOption("infernodriftmax1");
  await page.locator("#online-create-room").click({ force: true });
  await page.waitForTimeout(1500);
  const afterCreateState = JSON.parse(
    await page.evaluate(() => window.render_game_to_text()),
  );
  if (!afterCreateState.online.room?.code) {
    throw new Error(
      `Firebase lobby create did not produce a room: ${afterCreateState.online.chat?.lastMessage?.text || afterCreateState.online.accountStatus || "no status"}`,
    );
  }
  if (
    !["infernodriftmax1", "max-arena"].includes(afterCreateState.online.room.modeId)
  ) {
    throw new Error(
      `Firebase live smoke expected a Max lobby but created ${afterCreateState.online.room.modeId}`,
    );
  }
  await page.waitForFunction(() => {
    const state = JSON.parse(window.render_game_to_text());
    return (
      state.online.room?.firebaseLobby === true &&
      ["infernodriftmax1", "max-arena"].includes(state.online.room?.modeId) &&
      /^[A-Z0-9]{4,8}$/.test(state.online.room.code || "")
    );
  });
  let lobbyState = JSON.parse(
    await page.evaluate(() => window.render_game_to_text()),
  );
  const lobbyCode = lobbyState.online.room.code;
  assert.match(
    (await page.locator("#online-room-state").textContent()) ?? "",
    /Online lobby .*Shared live room active/i,
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

  joinerContext = await browser.newContext({
    viewport: { width: 1280, height: 820 },
  });
  joiner = await joinerContext.newPage();
  joiner.setDefaultTimeout(30_000);
  const joinerConsoleErrors = [];
  joiner.on("console", (msg) => {
    const text = msg.text();
    if (
      msg.type() === "error" &&
      !/WebGL|GL Driver/i.test(text) &&
      !/Failed to load resource: the server responded with a status of 400/i.test(
        text,
      )
    ) {
      joinerConsoleErrors.push(text);
    }
  });
  const joinerUsername = `Join${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`;
  await joiner.goto(smokeUrl, { waitUntil: "commit", timeout: 45_000 });
  await joiner.waitForFunction(
    () => typeof window.render_game_to_text === "function",
  );
  await joiner.evaluate(() =>
    window.__infernodriftTestApi.dismissSchoolGateForTest(),
  );
  await joiner.locator("#start-account-username").fill(joinerUsername);
  await joiner.locator("#start-account-password").fill("smoke12345");
  await joiner.locator("#start-account-age").fill("13");
  await joiner.evaluate(() =>
    document
      .querySelector("#start-account-submit")
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true })),
  );
  await joiner.waitForFunction((username) => {
    const state = JSON.parse(window.render_game_to_text());
    return (
      state.online.authenticated === true &&
      state.online.username === username &&
      state.online.transport === "firebase"
    );
  }, joinerUsername);
  await joiner.evaluate(() => window.__infernodriftTestApi.openMenuTab("online"));
  await joiner.waitForFunction((code) => {
    return [...document.querySelectorAll(".chat-room-invite")].some((button) =>
      new RegExp(`Join\\s+${code}`, "i").test(button.textContent || ""),
    );
  }, lobbyCode);
  await joiner.locator("#online-room-code").fill(lobbyCode);
  await joiner.locator("#online-join-room").click({ force: true });
  await joiner.waitForFunction((code) => {
    const state = JSON.parse(window.render_game_to_text());
    return (
      state.online.room?.firebaseLobby === true &&
      state.online.room?.code === code
    );
  }, lobbyCode);
  await page.waitForFunction((joinerName) => {
    const state = JSON.parse(window.render_game_to_text());
    return (
      state.online.room?.players >= 2 &&
      state.online.room?.members?.some?.(
        (member) => member.username === joinerName,
      )
    );
  }, joinerUsername);

  await page.evaluate(() => window.__infernodriftTestApi.startMode("max-arena"));
  await joiner.evaluate(() => window.__infernodriftTestApi.startMode("max-arena"));
  await page.evaluate(() => {
    window.__infernodriftTestApi.grantGarageCosmeticForTest("bodyId", "monster");
    window.__infernodriftTestApi.equipGarageCosmetic("bodyId", "monster");
    window.__infernodriftTestApi.setBattleActorPose("player", {
      x: 32,
      z: -18,
      heading: 0.75,
      speed: 0,
    });
    return window.__infernodriftTestApi.forceFirebaseLivePublishForTest();
  });
  await waitForRemotePlayer(joiner, (hostUsername) => {
    const state = JSON.parse(window.render_game_to_text());
    const remote = state.online.remotePlayers?.find?.(
      (player) => player.username === hostUsername,
    );
    return (
      remote &&
      Math.abs(Number(remote.x) - 32) < 2 &&
      Math.abs(Number(remote.z) + 18) < 2 &&
      String(remote.cosmeticsKey || "").includes("monster")
    );
  }, "Joiner did not receive host live snapshot", accountUsername);

  await joiner.evaluate(() => {
    window.__infernodriftTestApi.setBattleActorPose("player", {
      x: -24,
      z: 14,
      heading: -0.45,
      speed: 18,
    });
    return window.__infernodriftTestApi.forceFirebaseLivePublishForTest();
  });
  await waitForRemotePlayer(page, (username) => {
    const state = JSON.parse(window.render_game_to_text());
    const remote = state.online.remotePlayers?.find?.(
      (player) => player.username === username,
    );
    return (
      remote &&
      Math.abs(Number(remote.x) + 24) < 2 &&
      Math.abs(Number(remote.z) - 14) < 2
    );
  }, "Host did not receive joiner live snapshot", joinerUsername);

  await page.evaluate(() => {
    window.__infernodriftTestApi.forceMaxGoal("blue");
    window.__infernodriftTestApi.setMaxBallState({ x: 7, y: 0.6, z: -11 });
    return window.__infernodriftTestApi.forceFirebaseLivePublishForTest();
  });
  await joiner.waitForFunction(() => {
    const state = JSON.parse(window.render_game_to_text());
    return (
      state.mode === "max-arena" &&
      state.hud?.score?.blue >= 1 &&
      Math.abs(Number(state.ball?.x) - 7) < 2
    );
  });

  assert.deepEqual(joinerConsoleErrors, []);
  await cleanupSmokeAccount(joiner);
  await joinerContext.close();
  joiner = null;
  joinerContext = null;

  await page.locator("#online-room-code").fill(lobbyCode);
  await page.locator("#online-join-room").click({ force: true });
  await page.waitForFunction((code) => {
    const state = JSON.parse(window.render_game_to_text());
    return state.online.room?.code === code;
  }, lobbyCode);
  lobbyState = JSON.parse(await page.evaluate(() => window.render_game_to_text()));
  assert.equal(lobbyState.online.room.firebaseLobby, true);
  assert.equal(lobbyState.online.room.live, true);
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
  await cleanupSmokeAccount(joiner);
  await joinerContext?.close().catch(() => undefined);
  await cleanupSmokeAccount(page);
  await browser.close();
}
