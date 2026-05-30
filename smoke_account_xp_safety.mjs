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
      stored: JSON.parse(localStorage.getItem(SAVE_STORAGE_KEY) || "{}"),
    };
  }, SAVE_STORAGE_KEY);
  assert.equal(result.progression.totalXp, 0);
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

console.log("account XP safety smoke passed");
