import assert from "node:assert/strict";
import { chromium } from "playwright";
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
page.on("dialog", async (dialog) => {
  await dialog.accept("ibelikesheesh");
});
const smokeUrl = process.env.SMOKE_URL || "http://127.0.0.1:4173/index.html";
await page.goto(smokeUrl, { waitUntil: "commit", timeout: 45000 });
await waitForGameHook(page);
await page.waitForTimeout(1200);
await page.locator("#start-btn").click({ force: true });
await page.waitForTimeout(600);
await page.locator("#menu-btn").click({ force: true });
await page.waitForTimeout(250);
await page.locator('[data-tab="settings"]').click({ force: true });
await page.locator("#dev-mode-toggle").click();
await page.waitForTimeout(350);
const enabled = await page.locator("#dev-mode-toggle").isChecked();
const hint = await page.locator("#dev-mode-hint").textContent();
assert.equal(enabled, true);
assert.match(hint ?? "", /enabled/i);
console.log(JSON.stringify({ enabled, hint }, null, 2));
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
