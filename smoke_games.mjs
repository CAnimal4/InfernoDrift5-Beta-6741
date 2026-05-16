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
page.on("dialog", async (dialog) => {
  await dialog.accept("ibelikesheesh");
});

const smokeUrl = process.env.SMOKE_URL || "http://127.0.0.1:4173/index.html";
await page.goto(smokeUrl, { waitUntil: "commit", timeout: 45000 });
await waitForGameHook(page);
await page.waitForTimeout(1200);

await page.locator("#start-btn").click({ force: true });
await page.waitForTimeout(800);

const campaignState = JSON.parse(
  await page.evaluate(() => window.render_game_to_text()),
);
assert.equal(campaignState.mode, "infernodrift33");
assert.equal(campaignState.running, true);
assert.equal(campaignState.player.demolished, false);
assert.ok(campaignState.bots.length >= 4);
assert.match(await page.locator("#hud-world").textContent(), /\S/);
assert.match(await page.locator("#hud-level").textContent(), /\S/);

await page.evaluate(() => {
  const state = JSON.parse(window.render_game_to_text());
  window.__infernodriftTestApi.setRemoteHumanPlayers([
    {
      id: "friend-1",
      username: "Clark",
      team: "blue",
      x: state.player.x + 2,
      y: 0,
      z: state.player.z,
      heading: 0,
      speed: 24,
    },
  ]);
});
await page.evaluate(() => window.advanceTime(300));
const remoteTags = await page.evaluate(() =>
  window.__infernodriftTestApi.getRemoteNameTags(),
);
assert.equal(remoteTags[0].text, "Clark");
assert.equal(remoteTags[0].hidden, false);
const campaignWithFriend = JSON.parse(
  await page.evaluate(() => window.render_game_to_text()),
);
assert.equal(campaignWithFriend.humanPlayers[0].username, "Clark");
assert.equal(campaignWithFriend.humanPlayers[0].nameTagVisible, true);
const friendRadar = campaignWithFriend.radar.entities.find(
  (entity) => entity.kind === "human" && entity.label === "Clark",
);
assert.ok(friendRadar);

await page.evaluate(() => {
  const state = JSON.parse(window.render_game_to_text());
  window.__infernodriftTestApi.setRemoteHumanPlayers([
    {
      id: "radar-front",
      username: "FrontProbe",
      team: "blue",
      x: state.player.x,
      y: 0,
      z: state.player.z + 80,
      heading: 0,
      speed: 0,
    },
    {
      id: "radar-left",
      username: "LeftProbe",
      team: "blue",
      x: state.player.x - 80,
      y: 0,
      z: state.player.z,
      heading: 0,
      speed: 0,
    },
  ]);
});
await page.evaluate(() => window.advanceTime(120));
const radarProbeState = JSON.parse(
  await page.evaluate(() => window.render_game_to_text()),
);
const frontProbe = radarProbeState.radar.entities.find(
  (entity) => entity.kind === "human" && entity.label === "FrontProbe",
);
const leftProbe = radarProbeState.radar.entities.find(
  (entity) => entity.kind === "human" && entity.label === "LeftProbe",
);
assert.equal(frontProbe.sector, "front");
assert.ok(frontProbe.forward > 0);
assert.ok(frontProbe.screenY < 0.5);
assert.equal(leftProbe.sector, "left");
assert.ok(leftProbe.right < 0);
assert.ok(leftProbe.screenX < 0.5);

await openMenu(page);
await page.locator('[data-tab="settings"]').click({ force: true });
await page.locator("#dev-mode-toggle").click({ force: true });
await page.waitForTimeout(300);
assert.equal(await page.locator("#dev-mode-toggle").isChecked(), true);
assert.match(
  (await page.locator("#dev-mode-hint").textContent()) ?? "",
  /enabled/i,
);

await page.locator("#games-tab-btn").click({ force: true });
assert.equal(await page.locator("#games-tab-btn").isHidden(), false);
await domClick(page, "#game-card-max1");
await page.waitForTimeout(300);
await page.keyboard.press("Escape");
await page.waitForTimeout(900);
await page.evaluate(() => window.advanceTime(900));

const maxState = JSON.parse(
  await page.evaluate(() => window.render_game_to_text()),
);
assert.equal(maxState.mode, "infernodriftmax1");
assert.ok(maxState.ball);
assert.ok(maxState.bots.some((bot) => bot.team === "red"));
assert.ok(maxState.bots.some((bot) => bot.team === "blue"));
assert.match(await page.locator("#hud-world").textContent(), /\S/);
assert.match(await page.locator("#hud-level").textContent(), /\S/);

await page.evaluate(() => window.__infernodriftTestApi.forceMaxGoal("blue"));
await page.waitForTimeout(150);
await page.evaluate(() => window.advanceTime(1600));
const matchStats = await page.evaluate(() =>
  window.__infernodriftTestApi.getMatchStats(),
);
assert.equal(matchStats.teams.blue.goals, 1);

await openMenu(page);
await page.locator("#games-tab-btn").click({ force: true });
await domClick(page, "#game-card-id33");
await page.waitForTimeout(350);
await page.keyboard.press("Escape");
await page.waitForTimeout(700);
const restoredState = JSON.parse(
  await page.evaluate(() => window.render_game_to_text()),
);
assert.equal(restoredState.mode, "infernodrift33");
assert.equal(restoredState.ball, null);

await page.screenshot({
  path: "output/playwright/games-smoke.png",
  fullPage: false,
  timeout: 30000,
});

console.log(
  JSON.stringify(
    {
      campaign: {
        mode: campaignState.mode,
        bots: campaignState.bots.length,
        speed: campaignState.player.speed_mph,
        humanNameTag: campaignWithFriend.humanPlayers[0].username,
      },
      max: {
        mode: maxState.mode,
        ball: Boolean(maxState.ball),
        goals: matchStats.teams.blue.goals,
      },
      restored: { mode: restoredState.mode, running: restoredState.running },
    },
    null,
    2,
  ),
);

await browser.close();

async function waitForGameHook(page) {
  for (let i = 0; i < 90; i += 1) {
    const ready = await page
      .evaluate(() => typeof window.render_game_to_text === "function")
      .catch(() => false);
    if (ready) return;
    await page.waitForTimeout(500);
  }
  assert.fail("render_game_to_text did not initialize");
}

async function openMenu(page) {
  await page.evaluate(() => {
    const menu = document.getElementById("menu");
    if (!menu?.classList.contains("show")) {
      document.getElementById("menu-btn")?.click();
    }
  });
  await page.waitForTimeout(180);
}

async function domClick(page, selector) {
  await page.evaluate((targetSelector) => {
    const target = document.querySelector(targetSelector);
    if (!(target instanceof HTMLElement)) {
      throw new Error(`Missing clickable target ${targetSelector}`);
    }
    target.click();
  }, selector);
}
