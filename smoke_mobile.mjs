import fs from "node:fs";
import assert from "node:assert/strict";
import { chromium } from "playwright";

fs.mkdirSync("output/playwright", { recursive: true });

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

const errors = [];

async function makePage({ width, height, isMobile = false, hasTouch = false }) {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: isMobile ? 2 : 1,
    isMobile,
    hasTouch,
  });
  page.setDefaultTimeout(12000);
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
    else console.log("browser:", msg.type(), msg.text());
  });
  await page.goto(smokeUrl, { waitUntil: "commit", timeout: 45000 });
  await waitForGameHook(page);
  await page.waitForTimeout(1200);
  await page.evaluate(() => {
    localStorage.removeItem("infernodrift4.mobile.rotatePromptDismissed");
    const state = JSON.parse(window.render_game_to_text());
    if (state.ui?.schoolGate?.visible) {
      window.__infernodriftTestApi.dismissSchoolGateForTest();
    }
  });
  return page;
}

async function startAsGuest(page, deviceMode) {
  await page.evaluate((mode) => {
    window.__infernodriftTestApi?.setDeviceMode?.(mode);
    window.__infernodriftTestApi?.startMode?.("race");
  }, deviceMode);
  await page.waitForTimeout(550);
  await page.evaluate(() => window.advanceTime(600));
  await page.waitForTimeout(250);
}

async function getState(page) {
  return JSON.parse(await page.evaluate(() => window.render_game_to_text()));
}

async function screenshot(page, name) {
  await page.screenshot({
    path: `output/playwright/${name}.png`,
    fullPage: false,
    timeout: 30000,
  });
}

const phoneLandscape = await makePage({
  width: 844,
  height: 390,
  isMobile: true,
  hasTouch: true,
});
await startAsGuest(phoneLandscape, "phone");
let state = await getState(phoneLandscape);
assert.equal(state.mode, "race");
assert.equal(state.running, true);
assert.equal(state.device.profile, "phone");
assert.equal(state.device.touchEnabled, true);
assert.equal(state.device.rotatePromptVisible, false);
const touchButtons = await phoneLandscape
  .locator("#touch-controls button:visible")
  .evaluateAll((nodes) =>
    nodes.map((node) => {
      const box = node.getBoundingClientRect();
      return { id: node.id, width: box.width, height: box.height, text: node.textContent };
    }),
  );
assert.ok(touchButtons.length >= 3);
for (const button of touchButtons) {
  assert.ok(button.width >= 52, `${button.id} width ${button.width}`);
  assert.ok(button.height >= 52, `${button.id} height ${button.height}`);
}
await phoneLandscape.evaluate(() => window.__infernodriftTestApi?.openModeHelp?.());
const helpText = await phoneLandscape.locator("#mode-help-card").textContent();
assert.ok(!/\bWASD\b|Arrow Up|Shift boosts/i.test(helpText || ""));
await phoneLandscape.locator("#mode-help-resume").click({ force: true });
await phoneLandscape.evaluate(() =>
  window.__infernodriftTestApi?.setTouchInputForTest?.({
    steer: 0.72,
    boost: true,
    drift: true,
  }),
);
await phoneLandscape.evaluate(() => window.advanceTime(250));
state = await getState(phoneLandscape);
assert.ok(Math.abs(state.controls.touchState.steer) > 0.05);
assert.equal(state.controls.touchState.boost, true);
assert.equal(state.controls.touchState.drift, true);
assert.equal(state.device.rotatePromptVisible, false);
assert.equal(await phoneLandscape.locator("#mobile-rotate-prompt").isVisible(), false);
await screenshot(phoneLandscape, "mobile-phone-landscape-game");
await phoneLandscape.close();

const phonePortrait = await makePage({
  width: 390,
  height: 844,
  isMobile: true,
  hasTouch: true,
});
await startAsGuest(phonePortrait, "phone");
state = await getState(phonePortrait);
assert.equal(state.device.profile, "phone");
assert.equal(state.device.rotatePromptVisible, true);
assert.equal(state.running, false);
const rotateVisible = await phonePortrait.locator("#mobile-rotate-prompt").isVisible();
assert.equal(rotateVisible, true);
await screenshot(phonePortrait, "mobile-phone-portrait-rotate");
await phonePortrait.locator("#mobile-rotate-continue").click({ force: true });
await phonePortrait.waitForTimeout(200);
state = await getState(phonePortrait);
assert.equal(state.device.rotatePromptVisible, false);
await phonePortrait.close();

for (const scenario of [
  { name: "tablet-portrait", width: 820, height: 1180, device: "tablet" },
  { name: "tablet-landscape", width: 1180, height: 820, device: "tablet" },
  { name: "small-laptop", width: 1024, height: 650, device: "desktop" },
  { name: "desktop", width: 1440, height: 900, device: "desktop" },
]) {
  const page = await makePage({
    width: scenario.width,
    height: scenario.height,
    isMobile: scenario.device !== "desktop",
    hasTouch: scenario.device !== "desktop",
  });
  await startAsGuest(page, scenario.device);
  const scenarioState = await getState(page);
  assert.equal(scenarioState.mode, "race");
  assert.equal(scenarioState.device.profile, scenario.device);
  assert.equal(scenarioState.device.rotatePromptVisible, false);
  if (scenario.device === "desktop") {
    assert.equal(scenarioState.device.touchEnabled, false);
    const touchOpacity = await page
      .locator("#touch-controls")
      .evaluate((node) => getComputedStyle(node).opacity);
    assert.equal(touchOpacity, "0");
  } else {
    assert.equal(scenarioState.device.touchEnabled, true);
  }
  await screenshot(page, `mobile-${scenario.name}-game`);
  await page.close();
}

const battlePage = await makePage({
  width: 844,
  height: 390,
  isMobile: true,
  hasTouch: true,
});
await battlePage.evaluate(() => {
  window.__infernodriftTestApi?.setDeviceMode?.("phone");
  window.__infernodriftTestApi?.startMode?.("battle-arena");
});
await battlePage.waitForTimeout(500);
state = await getState(battlePage);
assert.equal(state.mode, "battle-arena");
assert.equal(await battlePage.locator("#touch-laser").isVisible(), true);
await battlePage.close();

const maxPage = await makePage({
  width: 844,
  height: 390,
  isMobile: true,
  hasTouch: true,
});
await maxPage.evaluate(() => {
  window.__infernodriftTestApi?.setDeviceMode?.("phone");
  window.__infernodriftTestApi?.startMode?.("max-arena");
});
await maxPage.waitForTimeout(500);
const maxBoostText = await maxPage.locator("#touch-boost").textContent();
assert.match(maxBoostText || "", /Hit|Boost/);
await maxPage.close();

assert.deepEqual(errors, []);
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
