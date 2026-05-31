import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl =
  process.env.SMOKE_URL ||
  process.env.INFERNO_BASE_URL ||
  "http://127.0.0.1:4173/";
const SAVE_STORAGE_KEY = "infernoDrift4.save.v1";
const ONLINE_STORAGE_KEY = "infernoDrift4.online.v1";
const ACCOUNT_SAVE_STORAGE_PREFIX = "infernoDrift4.accountSave.v1:";
const EXPECTED_CLIENT_BUILD_ID = "20260531-no-zero-repair-v4";

async function openPageWithStorage(seedStorage) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.addInitScript(
    ({ seedStorage }) => {
      localStorage.clear();
      sessionStorage.clear();
      for (const [key, value] of Object.entries(seedStorage)) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    },
    { seedStorage },
  );
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    () => window.__infernodriftTestApi && window.render_game_to_text,
    null,
    { timeout: 15000 },
  );
  return { browser, page };
}

const dirtySave = {
  saveMeta: { updatedAtMs: 1_000 },
  progressionV2: {
    xp: 100450,
    totalXp: 100450,
    embers: 1200,
  },
};

{
  const { browser, page } = await openPageWithStorage({
    [ONLINE_STORAGE_KEY]: {
      backendMode: "firebase",
      profileMode: "account",
      username: "Clark",
      sessionToken: "",
    },
    [SAVE_STORAGE_KEY]: dirtySave,
  });
  const result = await page.evaluate((SAVE_STORAGE_KEY) => {
    const diagnostics = JSON.parse(window.render_game_to_text());
    return {
      progression: diagnostics.progression,
      leaderboard: diagnostics.online.leaderboard,
      stored: JSON.parse(localStorage.getItem(SAVE_STORAGE_KEY) || "{}"),
    };
  }, SAVE_STORAGE_KEY);
  assert.equal(result.progression.clientBuildId, EXPECTED_CLIENT_BUILD_ID);
  assert.equal(result.progression.totalXp, 0);
  assert.equal(result.leaderboard[0]?.username, "ChatGPT (Codex)");
  assert.ok(result.leaderboard[0]?.xp < 90000);
  assert.equal(
    result.progression.accountProgressRepair?.source,
    "special-badge-tainted-xp-blocked",
  );
  assert.equal(result.stored.progressionV2?.totalXp, 0);
  assert.equal(
    result.stored.progressionV2?.accountProgressRepair?.source,
    "special-badge-tainted-xp-blocked",
  );
  await browser.close();
}

{
  const accountId = "clark-local-cache-targeted";
  const accountKey = `${ACCOUNT_SAVE_STORAGE_PREFIX}${accountId}`;
  const { browser, page } = await openPageWithStorage({
    [ONLINE_STORAGE_KEY]: {
      backendMode: "firebase",
      profileMode: "account",
      username: "Clark",
      sessionToken: "",
    },
    [accountKey]: dirtySave,
  });
  const result = await page.evaluate(
    ({ accountKey }) => {
      window.__infernodriftTestApi.resetLocalProgressionForTest();
      window.__infernodriftTestApi.simulateOnlineMessageForTest({
        type: "auth.ok",
        user: {
          id: "clark-local-cache-targeted",
          username: "Clark",
          account: true,
          backendMode: "firebase",
        },
        sessionToken: "clark-local-cache-targeted",
        preferAccountLocal: true,
      });
      const diagnostics = JSON.parse(window.render_game_to_text());
      return {
        progression: diagnostics.progression,
        profile: diagnostics.online.profile,
        stored: JSON.parse(localStorage.getItem(accountKey) || "{}"),
      };
    },
    { accountKey },
  );
  assert.equal(result.progression.totalXp, 0);
  assert.equal(result.stored.progressionV2?.totalXp, 0);
  assert.equal(
    result.stored.progressionV2?.accountProgressRepair?.source,
    "special-badge-tainted-xp-blocked",
  );
  assert.equal(
    result.profile.progressDiagnostics[0]?.source,
    "account-local-save-sanitized",
  );
  await browser.close();
}

{
  const { browser, page } = await openPageWithStorage({
    [ONLINE_STORAGE_KEY]: {
      backendMode: "firebase",
      profileMode: "account",
      username: "Clark",
      sessionToken: "",
    },
    [SAVE_STORAGE_KEY]: {
      ...dirtySave,
      progressionV2: {
        ...dirtySave.progressionV2,
        personalBests: { race: { score: 12500 } },
        medals: { race: "Gold" },
      },
    },
  });
  const result = await page.evaluate((SAVE_STORAGE_KEY) => {
    const diagnostics = JSON.parse(window.render_game_to_text());
    return {
      progression: diagnostics.progression,
      stored: JSON.parse(localStorage.getItem(SAVE_STORAGE_KEY) || "{}"),
    };
  }, SAVE_STORAGE_KEY);
  assert.equal(result.progression.totalXp, 0);
  assert.equal(result.progression.embers, 0);
  assert.equal(
    result.progression.accountProgressRepair?.source,
    "special-badge-tainted-xp-blocked",
  );
  assert.equal(result.stored.progressionV2?.totalXp, 0);
  await browser.close();
}

{
  const { browser, page } = await openPageWithStorage({});
  const result = await page.evaluate(() => {
    window.__infernodriftTestApi.resetLocalProgressionForTest();
    window.__infernodriftTestApi.configureOnlineForTest({
      backendMode: "firebase",
      username: "Clark",
    });
    window.__infernodriftTestApi.simulateOnlineMessageForTest({
      type: "auth.ok",
      user: {
        id: "clark-clean-before-dirty-profile",
        username: "Clark",
        account: true,
        backendMode: "firebase",
      },
      sessionToken: "clark-clean-before-dirty-profile",
      save: {
        payload: {
          progressionV2: {
            xp: 23175,
            totalXp: 23175,
            embers: 250,
            updatedAtMs: 8000,
          },
        },
      },
      preferAccountLocal: false,
    });
    window.__infernodriftTestApi.simulateOnlineMessageForTest({
      type: "profile.snapshot",
      user: {
        id: "clark-clean-before-dirty-profile",
        username: "Clark",
        account: true,
        backendMode: "firebase",
        progressRepairHint: {
          publicProfileTotalXp: 100450,
          publicProfileRepairSource: "unmarked-cache",
        },
      },
      save: {
        payload: {
          progressionV2: {
            xp: 100450,
            totalXp: 100450,
            embers: 1400,
            updatedAtMs: 9000,
          },
        },
      },
      preferAccountLocal: false,
      realtime: true,
    });
    const diagnostics = JSON.parse(window.render_game_to_text());
    return {
      progression: diagnostics.progression,
      profile: diagnostics.online.profile,
    };
  });
  assert.equal(result.progression.totalXp, 23175);
  assert.equal(result.progression.embers, 250);
  assert.equal(result.profile.snapshot?.save?.payload?.progressionV2?.embers, 0);
  await browser.close();
}

{
  const { browser, page } = await openPageWithStorage({});
  const result = await page.evaluate(() => {
    window.__infernodriftTestApi.resetLocalProgressionForTest();
    window.__infernodriftTestApi.configureOnlineForTest({
      backendMode: "firebase",
      username: "Clark",
    });
    window.__infernodriftTestApi.simulateOnlineMessageForTest({
      type: "auth.ok",
      user: {
        id: "clark-auth-unmarked-targeted",
        username: "Clark",
        account: true,
        backendMode: "firebase",
        progressRepairHint: {
          publicProfileTotalXp: 100450,
          publicProfileRepairSource: "unmarked-cache",
        },
      },
      sessionToken: "clark-auth-unmarked-targeted",
      save: {
        payload: {
          progressionV2: { xp: 100450, totalXp: 100450, embers: 1200 },
        },
      },
      preferAccountLocal: false,
      cleanPollutedFresh: false,
    });
    const syncResult = window.__infernodriftTestApi.forceOnlineProgressSync();
    const diagnostics = JSON.parse(window.render_game_to_text());
    return {
      syncResult,
      progression: diagnostics.progression,
      profile: diagnostics.online.profile,
    };
  });
  assert.equal(result.syncResult, false);
  assert.equal(result.progression.totalXp, 0);
  assert.equal(
    result.progression.accountProgressRepair?.source,
    "special-badge-tainted-xp-blocked",
  );
  assert.equal(
    result.profile.progressDiagnostics[0]?.source,
    "special-badge-tainted-xp-blocked",
  );
  assert.match(result.profile.actionStatus, /admin review/i);
  await browser.close();
}

{
  const { browser, page } = await openPageWithStorage({});
  const result = await page.evaluate(() => {
    window.__infernodriftTestApi.resetLocalProgressionForTest();
    const before = window.__infernodriftTestApi.buildPersistentSaveForTest();
    window.__infernodriftTestApi.grantGarageCosmeticForTest("bodyId", "monster");
    window.__infernodriftTestApi.equipGarageCosmetic("bodyId", "monster");
    const after = window.__infernodriftTestApi.buildPersistentSaveForTest();
    return {
      before: before.saveMeta,
      after: after.saveMeta,
      bodyId: after.customization.bodyId,
    };
  });
  assert.equal(result.before.customizationUpdatedAtMs, 0);
  assert.equal(result.before.garageUpdatedAtMs, 0);
  assert.ok(result.after.customizationUpdatedAtMs > 0);
  assert.ok(result.after.garageUpdatedAtMs > 0);
  assert.equal(result.bodyId, "monster");
  await browser.close();
}

{
  const { browser, page } = await openPageWithStorage({});
  const result = await page.evaluate(() => {
    window.__infernodriftTestApi.resetLocalProgressionForTest();
    window.__infernodriftTestApi.configureOnlineForTest({
      backendMode: "firebase",
      username: "Clark",
    });
    window.__infernodriftTestApi.simulateOnlineMessageForTest({
      type: "save.repair-needed",
      payload: {
        progressionV2: {
          xp: 0,
          totalXp: 0,
          accountProgressRepair: {
            source: "special-badge-tainted-xp-blocked",
            blockedTotalXp: 100450,
            markerSource: "public-profile",
            requiresReview: true,
          },
        },
      },
    });
    const diagnostics = JSON.parse(window.render_game_to_text());
    return {
      progression: diagnostics.progression,
      profile: diagnostics.online.profile,
      leaderboardState: diagnostics.online.leaderboardState,
    };
  });
  assert.equal(result.progression.totalXp, 0);
  assert.equal(
    result.progression.accountProgressRepair?.source,
    "special-badge-tainted-xp-blocked",
  );
  assert.match(result.profile.actionStatus, /Admin review is required/i);
  assert.equal(result.leaderboardState.syncStatus, "repair-needed");
  await browser.close();
}

{
  const { browser, page } = await openPageWithStorage({});
  const result = await page.evaluate(() => {
    window.__infernodriftTestApi.resetLocalProgressionForTest();
    window.__infernodriftTestApi.configureOnlineForTest({
      backendMode: "firebase",
      username: "Clark",
    });
    window.__infernodriftTestApi.simulateOnlineMessageForTest({
      type: "auth.ok",
      user: {
        id: "clark-profile-snapshot-targeted",
        username: "Clark",
        account: true,
        backendMode: "firebase",
      },
      sessionToken: "clark-profile-snapshot-targeted",
      save: { payload: { progressionV2: { xp: 0, totalXp: 0, embers: 0 } } },
      preferAccountLocal: false,
    });
    window.__infernodriftTestApi.simulateOnlineMessageForTest({
      type: "profile.snapshot",
      user: {
        id: "clark-profile-snapshot-targeted",
        username: "Clark",
        account: true,
        backendMode: "firebase",
        progressRepairHint: {
          publicProfileTotalXp: 100450,
          publicProfileRepairSource: "unmarked-cache",
        },
      },
      save: {
        payload: {
          progressionV2: {
            xp: 100450,
            totalXp: 100450,
            embers: 1400,
          },
        },
      },
      preferAccountLocal: false,
      realtime: true,
    });
    const syncResult = window.__infernodriftTestApi.forceOnlineProgressSync();
    const diagnostics = JSON.parse(window.render_game_to_text());
    return {
      syncResult,
      progression: diagnostics.progression,
      profile: diagnostics.online.profile,
    };
  });
  assert.equal(result.syncResult, false);
  assert.equal(result.progression.totalXp, 0);
  assert.equal(
    result.progression.accountProgressRepair?.source,
    "special-badge-tainted-xp-blocked",
  );
  assert.equal(
    result.progression.accountProgressRepair?.blockedTotalXp,
    100450,
  );
  assert.equal(
    result.profile.snapshot?.save?.payload?.progressionV2?.totalXp,
    0,
  );
  assert.equal(
    result.profile.snapshot?.save?.payload?.progressionV2?.accountProgressRepair
      ?.source,
    "special-badge-tainted-xp-blocked",
  );
  assert.equal(
    result.profile.snapshot?.user?.progressRepairHint?.publicProfileTotalXp,
    undefined,
  );
  assert.equal(
    result.profile.snapshot?.user?.progressRepairHint
      ?.publicProfileTotalXpRedacted,
    true,
  );
  assert.match(result.profile.actionStatus, /admin review/i);
  await browser.close();
}

{
  const { browser, page } = await openPageWithStorage({});
  const result = await page.evaluate(() => {
    window.__infernodriftTestApi.resetLocalProgressionForTest();
    window.__infernodriftTestApi.setOnlineUserForTest({
      id: "clark-leaderboard-dirty",
      username: "Clark",
    });
    window.__infernodriftTestApi.setLeaderboardRowsForTest(
      [
        {
          userId: "clark-leaderboard-dirty",
          username: "Clark",
          source: "server",
          account: true,
          xp: 100450,
          totalXp: 100450,
        },
      ],
      {
        userId: "clark-leaderboard-dirty",
        username: "Clark",
        source: "server",
        account: true,
        xp: 100450,
        totalXp: 100450,
      },
    );
    const diagnostics = JSON.parse(window.render_game_to_text());
    return {
      progression: diagnostics.progression,
      leaderboard: diagnostics.online.leaderboard,
      playerRow: diagnostics.online.leaderboardState.playerRow,
    };
  });
  assert.equal(result.progression.totalXp, 0);
  assert.equal(result.leaderboard[0].username, "ChatGPT (Codex)");
  assert.ok(result.leaderboard[0].xp < 90000);
  assert.equal(
    result.leaderboard.find((row) => row.username === "Clark")?.quarantined,
    true,
  );
  assert.equal(result.playerRow.quarantined, true);
  assert.equal(result.playerRow.totalXp, 0);
  await browser.close();
}

{
  const { browser, page } = await openPageWithStorage({});
  const result = await page.evaluate(() => {
    window.__infernodriftTestApi.resetLocalProgressionForTest();
    window.__infernodriftTestApi.setLeaderboardRowsForTest([
      {
        userId: "clark-displayname-dirty",
        displayName: "Clark",
        source: "server",
        account: true,
        score: 100450,
      },
    ]);
    const diagnostics = JSON.parse(window.render_game_to_text());
    return {
      leaderboard: diagnostics.online.leaderboard,
    };
  });
  const clark = result.leaderboard.find((row) => row.displayName === "Clark");
  assert.equal(clark?.quarantined, true);
  assert.equal(clark?.score, 0);
  assert.equal(result.leaderboard[0].username, "ChatGPT (Codex)");
  assert.ok(result.leaderboard[0].xp < 90000);
  await browser.close();
}

{
  const { browser, page } = await openPageWithStorage({});
  const result = await page.evaluate(() => {
    window.__infernodriftTestApi.resetLocalProgressionForTest();
    window.__infernodriftTestApi.setLeaderboardRowsForTest([
      {
        userId: "system-chatgpt-codex",
        displayName: "ChatGPT (Codex)",
        source: "server",
        xp: 100450,
        totalXp: 100450,
      },
      {
        userId: "real-driver",
        username: "RealDriver",
        source: "server",
        account: true,
        xp: 23175,
        totalXp: 23175,
      },
    ]);
    const diagnostics = JSON.parse(window.render_game_to_text());
    return {
      leaderboard: diagnostics.online.leaderboard,
    };
  });
  const codex = result.leaderboard.find(
    (row) => row.username === "ChatGPT (Codex)",
  );
  assert.ok(codex, "Codex row is present");
  assert.ok(codex.xp < 90000, "dirty server Codex XP is ignored");
  assert.equal(result.leaderboard[0].username, "ChatGPT (Codex)");
  await browser.close();
}

{
  const { browser, page } = await openPageWithStorage({});
  const result = await page.evaluate(() => {
    window.__infernodriftTestApi.resetLocalProgressionForTest();
    window.__infernodriftTestApi.grantGarageCosmeticForTest("bodyId", "monster");
    window.__infernodriftTestApi.equipGarageCosmetic("bodyId", "monster");
    const currentBody =
      window.__infernodriftTestApi.getCarVisualConfigForTest().body;
    const stalePayload = window.__infernodriftTestApi.buildFreshAccountSaveForTest();
    stalePayload.saveMeta = {
      updatedAtMs: 1,
      customizationUpdatedAtMs: 1,
      garageUpdatedAtMs: 1,
    };
    stalePayload.customization = {
      ...stalePayload.customization,
      bodyId: "street",
    };
    window.__infernodriftTestApi.applySavePayloadForTest(stalePayload, {
      forceProgression: true,
    });
    const afterStale =
      window.__infernodriftTestApi.getCarVisualConfigForTest().body;
    const freshPayload = window.__infernodriftTestApi.buildFreshAccountSaveForTest();
    freshPayload.saveMeta = {
      updatedAtMs: Date.now() + 1000,
      customizationUpdatedAtMs: Date.now() + 1000,
      garageUpdatedAtMs: Date.now() + 1000,
    };
    freshPayload.progressionV2 = {
      ...freshPayload.progressionV2,
      xp: 12000,
      totalXp: 12000,
      ownedCosmetics: [
        ...(freshPayload.progressionV2.ownedCosmetics || []),
        "bodyId-muscle",
      ],
    };
    freshPayload.customization = {
      ...freshPayload.customization,
      bodyId: "muscle",
    };
    freshPayload.garage.loadouts[0] = {
      ...freshPayload.garage.loadouts[0],
      bodyId: "muscle",
    };
    window.__infernodriftTestApi.applySavePayloadForTest(freshPayload, {
      forceProgression: true,
    });
    const afterFresh =
      window.__infernodriftTestApi.getCarVisualConfigForTest().body;
    return { currentBody, afterStale, afterFresh };
  });
  assert.equal(result.currentBody, "monster");
  assert.equal(result.afterStale, "monster");
  assert.equal(result.afterFresh, "muscle");
  await browser.close();
}

{
  const { browser, page } = await openPageWithStorage({});
  const result = await page.evaluate(() => {
    window.__infernodriftTestApi.resetLocalProgressionForTest();
    window.__infernodriftTestApi.applySavePayloadForTest(
      {
        saveMeta: { updatedAtMs: 1000, progressionUpdatedAtMs: 1000 },
        progressionV2: {
          xp: 4000,
          totalXp: 4000,
          embers: 500,
        },
      },
      { forceProgression: true },
    );
    const staleShell = window.__infernodriftTestApi.buildFreshAccountSaveForTest();
    staleShell.saveMeta = {
      updatedAtMs: Date.now() + 5000,
      progressionUpdatedAtMs: 500,
    };
    staleShell.progressionV2 = {
      ...staleShell.progressionV2,
      xp: 4500,
      totalXp: 4500,
      embers: 0,
    };
    window.__infernodriftTestApi.applySavePayloadForTest(staleShell, {
      forceProgression: true,
    });
    const afterStale = JSON.parse(window.render_game_to_text()).progression;
    const freshEconomy = window.__infernodriftTestApi.buildFreshAccountSaveForTest();
    freshEconomy.saveMeta = {
      updatedAtMs: Date.now() + 7000,
      progressionUpdatedAtMs: 2000,
    };
    freshEconomy.progressionV2 = {
      ...freshEconomy.progressionV2,
      xp: 5000,
      totalXp: 5000,
      embers: 650,
    };
    window.__infernodriftTestApi.applySavePayloadForTest(freshEconomy, {
      forceProgression: true,
    });
    const afterFresh = JSON.parse(window.render_game_to_text()).progression;
    const plainSave = window.__infernodriftTestApi.buildPersistentSaveForTest();
    return {
      afterStale: {
        xp: afterStale.totalXp,
        embers: afterStale.embers,
      },
      afterFresh: {
        xp: afterFresh.totalXp,
        embers: afterFresh.embers,
      },
      saveMeta: plainSave.saveMeta,
    };
  });
  assert.equal(result.afterStale.xp, 4500);
  assert.equal(result.afterStale.embers, 500);
  assert.equal(result.afterFresh.xp, 5000);
  assert.equal(result.afterFresh.embers, 650);
  assert.equal(result.saveMeta.progressionUpdatedAtMs, 2000);
  await browser.close();
}

console.log("account XP safety smoke passed");
