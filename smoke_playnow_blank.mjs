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
const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
page.setDefaultTimeout(20000);
page.on("console", (message) => console.log("browser:", message.type(), message.text()));
page.on("pageerror", (error) => console.error("pageerror:", error.message));

try {
  const smokeUrl = process.env.SMOKE_URL || "http://127.0.0.1:4173/index.html";
  await page.goto(smokeUrl, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForFunction(
    () => window.__infernodriftTestApi && window.render_game_to_text,
  );
  await page.evaluate(() => {
    window.__infernodriftTestApi.configureOnlineForTest({
      backendMode: "firebase",
      username: "SmokeNoPassword",
      age: 13,
    });
    document.getElementById("start-account-username").value = "SmokeNoPassword";
    document.getElementById("start-account-password").value = "";
    document.getElementById("start-account-age").value = "13";
  });
  await page.locator("#start-here-btn").click({ force: true });
  await page.waitForTimeout(1200);
  if (await page.locator("#mode-help-card").isVisible()) {
    await page.locator("#mode-help-resume").click({ force: true });
    await page.waitForTimeout(400);
  }
  const result = await page.evaluate(() => ({
    game: JSON.parse(window.render_game_to_text()),
    online: window.__infernodriftTestApi.getOnlineState(),
    status: document.getElementById("start-account-status")?.textContent || "",
  }));
  assert.equal(result.online.authenticated, false, JSON.stringify(result));
  assert.equal(result.online.username.startsWith("Guest"), true, JSON.stringify(result));
  assert.equal(
    /Password must be at least 6 characters/.test(result.status),
    false,
    JSON.stringify(result),
  );
  assert.equal(result.game.mode, "race", JSON.stringify(result));
  assert.equal(result.game.running, true, JSON.stringify(result));
  console.log(
    JSON.stringify({
      ok: true,
      mode: result.game.mode,
      status: result.status,
      username: result.online.username,
    }),
  );
} finally {
  await browser.close();
}
