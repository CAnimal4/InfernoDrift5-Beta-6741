import assert from "node:assert/strict";
import { chromium } from "playwright";

const smokeUrl = process.env.SMOKE_URL || "http://127.0.0.1:4173/index.html";

const browser = await chromium.launch({
  headless: true,
  args: [
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--ignore-gpu-blocklist",
    "--use-gl=angle",
  ],
});

const page = await browser.newPage({ viewport: { width: 1280, height: 820 } });
page.setDefaultTimeout(10_000);
await page.route(/https:\/\/www\.gstatic\.com\/firebasejs\/.*/i, (route) =>
  route.abort("failed"),
);

const consoleErrors = [];
page.on("console", (msg) => {
  const text = msg.text();
  if (
    msg.type() === "error" &&
    !/WebGL|GL Driver|Failed to load resource: net::ERR_FAILED/i.test(text)
  ) {
    consoleErrors.push(text);
  }
});

try {
  await page.addInitScript(() => {
    localStorage.setItem(
      "infernoDrift4.online.v1",
      JSON.stringify({
        backendUrl: "wss://infernodrift4-online.clarkbythebay.workers.dev/ws",
        backupBackendUrls: [
          "wss://infernodrift4-online.clarkbythebay.workers.dev/ws",
        ],
      }),
    );
  });
  await page.goto(smokeUrl, { waitUntil: "commit", timeout: 45_000 });
  await page.waitForFunction(
    () => typeof window.render_game_to_text === "function",
  );
  await page.evaluate(() =>
    window.__infernodriftTestApi.dismissSchoolGateForTest(),
  );
  await page.waitForFunction(
    () =>
      !document.querySelector("#school-gate")?.classList.contains("show") &&
      document.querySelector("#overlay")?.classList.contains("show"),
  );

  const scriptText = await fetch(new URL("script.js", smokeUrl)).then(
    (response) => response.text(),
  );
  assert.match(scriptText, /DEFAULT_BACKEND_MODE = BACKEND_MODE_FIREBASE/);
  assert.doesNotMatch(scriptText, /replit\.dev|replit\.app|janeway\.replit/i);

  let state = JSON.parse(
    await page.evaluate(() => window.render_game_to_text()),
  );
  assert.equal(state.online.backendMode, "firebase");
  assert.equal(state.online.firebase.configured, true);
  assert.equal(state.online.firebase.projectId, "infernodrift4-online");
  assert.equal(state.online.configured, true);
  assert.equal(state.online.backendUrl, "");
  assert.deepEqual(state.online.backupBackendUrls, []);

  await page.locator("#start-account-username").fill("bad name!");
  await page.locator("#start-account-password").fill("secret1");
  await page.locator("#start-account-age").fill("13");
  await page.locator("#start-account-submit").click();
  await page.waitForTimeout(150);
  assert.match(
    (await page.locator("#start-account-status").textContent()) ?? "",
    /letters, numbers, (spaces, )?underscores, or hyphens|unavailable|Guest Offline/i,
  );

  await page.locator("#start-account-username").fill("StressUser_1");
  await page.locator("#start-account-submit").click();
  await page.waitForFunction(() =>
    /unavailable|Guest Offline/i.test(
      document.querySelector("#start-account-status")?.textContent || "",
    ),
  );
  assert.equal(
    await page.locator("#start-btn").textContent(),
    "Continue Offline",
  );
  assert.doesNotMatch(
    (await page.locator("#start-account-status").textContent()) ?? "",
    /Connecting account/i,
  );

  await page.locator("#start-btn").click({ force: true });
  await page.waitForFunction(
    () => JSON.parse(window.render_game_to_text()).running,
  );
  state = JSON.parse(await page.evaluate(() => window.render_game_to_text()));
  assert.equal(state.running, true);
  assert.equal(state.online.backendMode, "firebase");
  assert.equal(state.online.transport, "offline");

  await page.locator("#menu-btn").click({ force: true });
  await page.locator('[data-tab="online"]').click({ force: true });
  await page
    .locator(".advanced-online-settings summary")
    .click({ force: true });
  await page.waitForTimeout(120);
  assert.equal(
    await page.locator("#online-test-connection").textContent(),
    "Run Firebase Test",
  );
  assert.equal(await page.locator("#online-backend-url").inputValue(), "");
  assert.equal(await page.locator("#online-backup-urls").inputValue(), "");
  await page.locator("#online-test-connection").click({ force: true });
  await page.waitForFunction(() =>
    /firebase_unavailable|unavailable/i.test(
      document.querySelector("#online-diagnostics")?.textContent || "",
    ),
  );
  state = JSON.parse(await page.evaluate(() => window.render_game_to_text()));
  assert.equal(state.online.backendMode, "firebase");
  assert.equal(state.online.firebase.projectId, "infernodrift4-online");

  await page.locator("#online-connect").click({ force: true });
  await page.waitForFunction(() =>
    /unavailable/i.test(
      document.querySelector("#online-status")?.textContent || "",
    ),
  );
  state = JSON.parse(await page.evaluate(() => window.render_game_to_text()));
  assert.equal(state.online.transport, "offline");
  assert.equal(state.online.chat.popoutOpen, false);

  await page.locator("#menu-feedback").click({ force: true });
  await page.locator("#feedback-message").fill("x".repeat(2501));
  await page.locator("#feedback-submit").click({ force: true });
  await page.waitForTimeout(150);
  assert.match(
    (await page.locator("#feedback-status").textContent()) ?? "",
    /too long|2,500/i,
  );

  assert.deepEqual(consoleErrors, []);
  console.log(
    JSON.stringify(
      {
        firebaseDefault: state.online.backendMode,
        configured: state.online.firebase.configured,
        fallback: state.online.transport,
        status: state.online.status,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
