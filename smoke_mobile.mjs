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
const page = await browser.newPage({
  viewport: { width: 844, height: 390 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
page.setDefaultTimeout(9000);
page.on("console", (msg) => console.log("browser:", msg.type(), msg.text()));

const smokeUrl = process.env.SMOKE_URL || "http://127.0.0.1:4173/index.html";
await page.goto(smokeUrl, { waitUntil: "commit", timeout: 45000 });
await waitForGameHook(page);
await page.waitForTimeout(1200);
await page.evaluate(() => {
  const state = JSON.parse(window.render_game_to_text());
  if (state.ui?.schoolGate?.visible) {
    window.__infernodriftTestApi.dismissSchoolGateForTest();
  }
  window.__infernodriftTestApi?.setDeviceMode?.("phone");
});
await page.locator("#start-btn").click({ force: true });
await page.waitForTimeout(700);
await page.evaluate(() => window.advanceTime(900));
await page.waitForTimeout(700);

const state = JSON.parse(
  await page.evaluate(() => window.render_game_to_text()),
);
const overlayClass = await page.locator("#overlay").getAttribute("class");
const hudBox = await page.locator(".hud").boundingBox();
const radarBox = await page.locator(".minimap-wrap").boundingBox();
const touchBox = await page.locator("#touch-controls").boundingBox();
const touchUserSelect = await page
  .locator("#touch-controls")
  .evaluate((node) => {
    const style = getComputedStyle(node);
    return `${style.userSelect}/${style.webkitUserSelect}`;
  });

console.log(
  JSON.stringify(
    {
      viewport: "844x390@2",
      mode: state.mode,
      running: state.running,
      hudBox,
      radarBox,
      touchBox,
      touchUserSelect,
      overlayClass,
    },
    null,
    2,
  ),
);

await page.screenshot({
  path: "output/playwright/mobile-landscape-smoke.png",
  fullPage: false,
  timeout: 30000,
});

assert.equal(state.mode, "campaign-survival");
assert.equal(state.running, true);
assert.equal(state.player.demolished, false);
assert.equal(overlayClass, "overlay");
assert.ok(hudBox && hudBox.height < 150);
assert.ok(radarBox && radarBox.width <= 280 && radarBox.height <= 280);
assert.ok(touchBox && touchBox.y > 150);
assert.match(touchUserSelect, /none/);

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
