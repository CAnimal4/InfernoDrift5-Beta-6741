import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";
import { createInfernoServer } from "./apps/server/src/index.js";

let app = null;
let serverUrl = process.env.INFERNO_ONLINE_SMOKE_URL || "";
if (!serverUrl) {
  app = createInfernoServer({
    port: 0,
    dataDir: path.join(os.tmpdir(), `id4-online-smoke-${Date.now()}`),
    allowedOrigins: "",
  });
  const server = await app.listen();
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 8787;
  serverUrl = `ws://127.0.0.1:${port}`;
}

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
const errors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});
page.on("pageerror", (error) => errors.push(String(error)));

const smokeUrl = process.env.SMOKE_URL || "http://127.0.0.1:4173/index.html";

try {
  await page.addInitScript((url) => {
    localStorage.setItem("infernoDrift4.serverUrl", url);
  }, serverUrl);
  await page.goto(smokeUrl, { waitUntil: "commit", timeout: 45000 });
  await waitForGameHook(page);
  await page.waitForTimeout(1200);
  await page.evaluate(() => {
    const menu = document.getElementById("menu");
    if (!menu?.classList.contains("show")) {
      document.getElementById("menu-btn")?.click();
    }
  });
  await page.locator('[data-tab="online"]').click({ force: true });
  await page.fill("#online-username", "LocalSmoke");
  const ageInput = page.locator("#online-age");
  if ((await ageInput.count()) > 0) await ageInput.fill("13");
  await page.click("#online-connect", { force: true });
  await page.waitForTimeout(600);
  await page.click("#online-create-room", { force: true });
  await page.waitForTimeout(600);
  await page.fill("#online-chat-input", "<b>nice shit drift</b>");
  await page.click("#online-chat-send", { force: true });
  await page.waitForTimeout(600);

  const result = await page.evaluate(() => ({
    text: JSON.parse(window.render_game_to_text()),
    statusText:
      document.getElementById("online-status-card")?.textContent ?? "",
    consoleText: document.getElementById("online-console")?.textContent ?? "",
    roomText: document.getElementById("online-room-state")?.textContent ?? "",
    chatText: document.getElementById("online-chat-log")?.textContent ?? "",
  }));

  assert.deepEqual(errors, []);
  assert.equal(result.text.online.status, "live");
  assert.ok(result.text.online.roomCode);
  assert.ok(result.text.online.players >= 1);
  assert.match(`${result.statusText} ${result.consoleText}`, /connected/i);
  assert.match(result.roomText, /Room/i);
  assert.match(result.chatText, /nice boost drift/);

  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
  await app?.close();
}

async function waitForGameHook(page) {
  for (let i = 0; i < 90; i += 1) {
    const ready = await page
      .evaluate(() => typeof window.render_game_to_text === "function")
      .catch(() => false);
    if (ready) return;
    if (errors.length > 0) {
      assert.fail(`Browser failed before online smoke: ${errors.join(" | ")}`);
    }
    await page.waitForTimeout(500);
  }
  assert.fail("render_game_to_text did not initialize");
}
