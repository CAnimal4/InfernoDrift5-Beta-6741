import fs from "node:fs";
import assert from "node:assert/strict";
import { chromium } from "playwright";

fs.mkdirSync("output/playwright", { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: [
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--ignore-gpu-blocklist",
    "--use-gl=angle",
  ],
});
const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
page.setDefaultTimeout(9000);
page.on("console", (msg) => console.log("browser:", msg.type(), msg.text()));

const smokeUrl = process.env.SMOKE_URL || "http://127.0.0.1:4173/index.html";
await page.goto(smokeUrl, { waitUntil: "domcontentloaded", timeout: 18000 });
await page.waitForTimeout(1800);
await page.evaluate(() => {
  window.prompt = () => "ibelikesheesh";
});

await page.locator("#start-btn").click({ force: true });
await page.waitForTimeout(900);
await page.keyboard.press("Escape");
await page.evaluate(() => {
  document.getElementById("dev-mode-toggle").click();
});
await page.waitForTimeout(350);

const gamesVisible = !(await page.locator("#games-tab-btn").isHidden());
await page.locator("#games-tab-btn").click({ force: true });
await page.locator("#game-card-max1").click({ force: true });
const gameHint = await page.locator("#game-mode-hint").textContent();
await page.locator("#menu-btn").click({ force: true });
await page.waitForTimeout(200);
await page.locator('[data-tab="settings"]').click({ force: true });
const maxDifficultyVisible = !(await page
  .locator("#max-difficulty-field")
  .isHidden());
await page.selectOption("#max-difficulty-select", "brutal");
await page.keyboard.press("Escape");
await page.locator("#menu-btn").click({ force: true });
await page.waitForTimeout(250);
await page.keyboard.press("Escape");
await page.waitForTimeout(1200);
await page.evaluate(() => window.advanceTime(1200));

const maxHud = {
  blue: await page.locator("#hud-world").textContent(),
  red: await page.locator("#hud-level").textContent(),
  mode: await page.locator("#hud-score").textContent(),
  speed: await page.locator("#hud-speed").textContent(),
};
const initialText = JSON.parse(
  await page.evaluate(() => window.render_game_to_text()),
);
await page.evaluate(() => window.__infernodriftTestApi.forceMaxGoal("blue"));
await page.waitForTimeout(150);
await page.evaluate(() => window.advanceTime(1600));
const replayState = await page.evaluate(() =>
  window.__infernodriftTestApi.getReplayState(),
);
const matchStats = await page.evaluate(() =>
  window.__infernodriftTestApi.getMatchStats(),
);
const replayMeta = await page.locator("#match-panel-meta").textContent();

const riskHint = gameHint;
const riskText = initialText;

await page.locator("#menu-btn").click({ force: true });
await page.waitForTimeout(250);
await page.locator('[data-tab="settings"]').click({ force: true });
await page.selectOption("#dev-max-boost-variant", "hyper");
await page.click("#dev-force-demo");
await page.waitForTimeout(150);
await page.keyboard.press("Escape");
await page.evaluate(() => window.advanceTime(2400));
const postDemoText = JSON.parse(
  await page.evaluate(() => window.render_game_to_text()),
);

await page.keyboard.press("Escape");
await page.locator("#games-tab-btn").click({ force: true });
await page.locator("#game-card-id33").click({ force: true });
await page.locator("#menu-btn").click({ force: true });
await page.waitForTimeout(200);
await page.locator('[data-tab="settings"]').click({ force: true });
const maxDifficultyHiddenInCampaign = await page
  .locator("#max-difficulty-field")
  .isHidden();
await page.keyboard.press("Escape");
await page.locator("#menu-btn").click({ force: true });
await page.waitForTimeout(250);
await page.keyboard.press("Escape");
await page.waitForTimeout(1000);

const idHud = {
  world: await page.locator("#hud-world").textContent(),
  level: await page.locator("#hud-level").textContent(),
};

async function openGamesMenu() {
  await page.evaluate(() => {
    const menu = document.getElementById("menu");
    if (!menu?.classList.contains("show")) {
      document.getElementById("menu-btn")?.click();
    }
  });
  await page.waitForTimeout(120);
  await page.locator("#games-tab-btn").click({ force: true });
}

const modeChecks = [];
for (const mode of [
  "tutorial",
  "campaign",
  "race",
  "stunt",
  "hunter",
  "boss",
  "battle",
  "minigames",
]) {
  await openGamesMenu();
  await page.locator(`[data-id4-mode="${mode}"]`).click({ force: true });
  await page.waitForTimeout(160);
  await page.evaluate(() => window.advanceTime(360));
  const text = JSON.parse(
    await page.evaluate(() => window.render_game_to_text()),
  );
  modeChecks.push({
    selected: mode,
    id4Mode: text.id4Mode,
    gameMode: text.mode,
    objective: text.objective,
    objectiveState: text.objectiveState,
  });
  assert.equal(text.id4Mode, mode);
  assert.match(text.objective, /\S/);
  if (mode === "battle") assert.equal(text.mode, "infernodriftmax1");
  else assert.equal(text.mode, "infernodrift33");
}

assert.equal(gamesVisible, true);
assert.equal(maxDifficultyVisible, true);
assert.equal(maxDifficultyHiddenInCampaign, true);
assert.match(gameHint, /Battle Arena/);
assert.equal(initialText.mode, "infernodriftmax1");
assert.equal(initialText.id4Mode, "battle");
assert.equal(initialText.online.status, "offline");
assert.match(initialText.radar.coordinateSystem, /top\/front/);
assert.ok(initialText.radar.entities.some((entity) => entity.kind === "ball"));
assert.ok(
  initialText.radar.entities.some((entity) => entity.sector === "front"),
);
assert.match(replayMeta, /Replay/);
assert.equal(matchStats.teams.blue.goals, 1);
assert.ok(postDemoText.stats.player.demolitions >= 1);
assert.match(idHud.world, /\S/);

await page.screenshot({
  path: "output/playwright/games-smoke.png",
  fullPage: false,
  timeout: 30000,
});
console.log(
  JSON.stringify(
    {
      gamesVisible,
      gameHint,
      maxDifficultyVisible,
      maxDifficultyHiddenInCampaign,
      maxHud,
      initialText,
      replayState,
      replayMeta,
      matchStats,
      riskHint,
      riskText,
      postDemoText,
      idHud,
      modeChecks,
    },
    null,
    2,
  ),
);
await browser.close();
