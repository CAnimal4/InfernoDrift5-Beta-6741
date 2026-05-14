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
await page.goto(smokeUrl, { waitUntil: "domcontentloaded", timeout: 18000 });
await page.waitForTimeout(1800);
await page.evaluate(() => window.__infernodriftTestApi.setDeviceMode("phone"));
await page.locator("#start-btn").click({ force: true });
await page.waitForTimeout(700);
await page.evaluate(() => window.advanceTime(900));
await page.waitForTimeout(1200);

const state = JSON.parse(
  await page.evaluate(() => window.render_game_to_text()),
);
const overlayClass = await page.locator("#overlay").getAttribute("class");
const hudBox = await page.locator(".hud").boundingBox();
const radarBox = await page.locator(".minimap-wrap").boundingBox();
const touchBox = await page.locator("#touch-controls").boundingBox();
const menuUserSelect = await page
  .locator("#touch-controls")
  .evaluate((node) => {
    const style = getComputedStyle(node);
    return `${style.userSelect}/${style.webkitUserSelect}`;
  });

assert.equal(state.mode, "infernodrift33");
assert.equal(state.running, true);
assert.equal(state.online.status, "offline");
assert.equal(state.device.type, "phone");
assert.equal(state.device.touchActive, true);
assert.equal(overlayClass, "overlay");
assert.ok(state.radar.entities.length > 5);
assert.ok(hudBox && hudBox.height < 92);
assert.ok(radarBox && radarBox.width <= 150 && radarBox.height <= 170);
assert.ok(touchBox && touchBox.y > 160);
assert.match(menuUserSelect, /none/);

await page.screenshot({
  path: "output/playwright/mobile-landscape-smoke.png",
  fullPage: false,
  timeout: 30000,
});
console.log(
  JSON.stringify(
    {
      viewport: "844x390@2",
      mode: state.mode,
      radarEntities: state.radar.entities.length,
      hudBox,
      radarBox,
      touchBox,
      menuUserSelect,
      overlayClass,
    },
    null,
    2,
  ),
);
await browser.close();
