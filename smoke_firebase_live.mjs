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
page.setDefaultTimeout(18_000);

const consoleErrors = [];
page.on("console", (msg) => {
  const text = msg.text();
  if (msg.type() === "error" && !/WebGL|GL Driver/i.test(text)) {
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

  let state = JSON.parse(
    await page.evaluate(() => window.render_game_to_text()),
  );
  assert.equal(state.online.backendMode, "firebase");
  assert.equal(state.online.firebase.configured, true);
  assert.equal(state.online.firebase.projectId, "infernodrift4-online");
  assert.equal(state.online.configured, true);
  assert.equal(state.online.backendUrl, "");
  assert.deepEqual(state.online.backupBackendUrls, []);

  const result = await page.evaluate(() =>
    window.__infernodriftTestApi.runConnectionTest(),
  );
  assert.equal(result.status, "ok");
  assert.equal(result.activeBackendUrl, "");
  assert.equal(result.report[0]?.health?.ok, true);
  assert.equal(result.report[0]?.httpFallback?.auth, true);
  assert.equal(result.report[0]?.httpFallback?.firestore, true);
  assert.equal(result.report[0]?.websocket?.ok, false);
  assert.equal(
    result.report[0]?.websocket?.error,
    "firebase_no_authoritative_websocket",
  );

  await page.waitForFunction(() => {
    const state = JSON.parse(window.render_game_to_text());
    return (
      state.online.backendHealth?.ok === true &&
      state.online.transport === "firebase" &&
      state.online.authenticated === true
    );
  });

  state = JSON.parse(await page.evaluate(() => window.render_game_to_text()));
  assert.equal(state.online.firebase.diagnosticsStatus, "ok");
  assert.equal(state.online.firebase.firestoreStatus, "ready");
  assert.ok(["ready", "listening"].includes(state.online.firebase.chatStatus));
  assert.equal(state.online.backendUrl, "");
  assert.deepEqual(state.online.backupBackendUrls, []);

  await page.evaluate(() => window.__infernodriftTestApi.openMenuTab("online"));
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
  assert.match(
    (await page.locator("#online-diagnostics").textContent()) ?? "",
    /Backend mode firebase.*Firebase project infernodrift4-online.*Diagnostics ok/i,
  );

  assert.deepEqual(consoleErrors, []);
  console.log(
    JSON.stringify(
      {
        firebaseDefault: state.online.backendMode,
        projectId: state.online.firebase.projectId,
        diagnostics: state.online.firebase.diagnosticsStatus,
        transport: state.online.transport,
        websocket: result.report[0]?.websocket?.error,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
