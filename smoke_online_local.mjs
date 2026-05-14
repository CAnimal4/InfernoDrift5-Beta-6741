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
const errors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});
page.on("pageerror", (error) => errors.push(String(error)));

const smokeUrl = process.env.SMOKE_URL || "http://127.0.0.1:4173/index.html";
const serverUrl =
  process.env.INFERNO_ONLINE_SMOKE_URL || "ws://127.0.0.1:8787/ws";

await page.goto(smokeUrl, { waitUntil: "domcontentloaded", timeout: 18000 });
await page.waitForTimeout(1200);
await page.evaluate((url) => {
  localStorage.setItem("infernoDrift4.serverUrl", url);
}, serverUrl);
await page.reload({ waitUntil: "domcontentloaded" });
await page.waitForTimeout(1200);
await page.evaluate(() => {
  const menu = document.getElementById("menu");
  if (!menu?.classList.contains("show")) {
    document.getElementById("menu-btn")?.click();
  }
});
await page.locator('[data-tab="online"]').click({ force: true });
await page.fill("#online-username", "LocalSmoke");
await page.click("#online-connect", { force: true });
await page.waitForTimeout(600);
await page.click("#online-create-room", { force: true });
await page.waitForTimeout(600);
await page.fill("#online-chat-input", "<b>nice shit drift</b>");
await page.click("#online-chat-send", { force: true });
await page.waitForTimeout(600);

const result = await page.evaluate(() => ({
  text: JSON.parse(window.render_game_to_text()),
  consoleText: document.getElementById("online-console")?.textContent ?? "",
  roomText: document.getElementById("online-room-state")?.textContent ?? "",
  chatText: document.getElementById("online-chat-log")?.textContent ?? "",
}));

assert.deepEqual(errors, []);
assert.equal(result.text.online.status, "live");
assert.ok(result.text.online.roomCode);
assert.ok(result.text.online.players >= 1);
assert.match(result.consoleText, /connected/i);
assert.match(result.roomText, /Room/i);
assert.match(result.chatText, /nice boost drift/);

console.log(JSON.stringify(result, null, 2));
await browser.close();
