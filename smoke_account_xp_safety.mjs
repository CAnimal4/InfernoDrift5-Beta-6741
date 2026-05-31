import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl =
  process.env.SMOKE_URL ||
  process.env.INFERNO_BASE_URL ||
  "http://127.0.0.1:4173/";
const SAVE_STORAGE_KEY = "infernoDrift4.save.v1";
const ONLINE_STORAGE_KEY = "infernoDrift4.online.v1";

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

console.log("account XP safety smoke passed");
