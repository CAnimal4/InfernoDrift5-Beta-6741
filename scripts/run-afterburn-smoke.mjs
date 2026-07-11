import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const cwd = process.cwd();
const outputDir = path.join(cwd, "output", "afterburn", "smoke");
fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });
const webPort = Number(process.env.AFTERBURN_SMOKE_WEB_PORT || 4174);
const serverPort = Number(process.env.AFTERBURN_SMOKE_SERVER_PORT || 8788);
const baseUrl = `http://127.0.0.1:${webPort}`;
const processes = [];

function start(command, args, env = {}) {
  const child = spawn(command, args, {
    cwd,
    env: { ...process.env, ...env },
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout.on("data", (chunk) => process.stdout.write(chunk));
  child.stderr.on("data", (chunk) => process.stderr.write(chunk));
  processes.push(child);
  return child;
}

async function waitForHttp(url, timeoutMs = 12_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 120));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function state(page) {
  return JSON.parse(await page.evaluate(() => window.render_game_to_text?.() ?? "{}"));
}

async function noErrors(errors, label) {
  assert.deepEqual(errors, [], `${label} emitted browser errors:\n${errors.join("\n")}`);
}

start("npm", ["run", "dev:server"], { PORT: String(serverPort), AFTERBURN_REGION: "smoke-local" });
start("npm", ["run", "dev:web", "--", "--port", String(webPort)], {
  VITE_AFTERBURN_WS: `ws://127.0.0.1:${serverPort}`,
});

let browser;
try {
  await Promise.all([waitForHttp(`${baseUrl}/`), waitForHttp(`http://127.0.0.1:${serverPort}/health`)]);
  browser = await chromium.launch({ headless: true, args: ["--use-gl=angle", "--use-angle=swiftshader", "--disable-dev-shm-usage"] });

  const desktop = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  await desktop.addInitScript(() => {
    localStorage.setItem("infernodrift.afterburn.v1", JSON.stringify({
      schemaVersion: 1,
      credits: 0,
      reputation: 0,
      chassis: ["vandal"],
      activeChassis: "vandal",
      paints: ["afterglow"],
      activePaint: "afterglow",
      veteran: false,
      contractsCompleted: 0,
      bests: {},
      settings: { quality: "low", reducedMotion: true, cameraShake: 0, masterVolume: 0 },
    }));
  });
  const page = await desktop.newPage();
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`page: ${error.message}`));
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.waitForSelector("#quick-run-btn");
  console.log("Afterburn smoke: title loaded");
  await page.locator("#quick-run-btn").evaluate((element) => element.click());
  await page.waitForSelector(".screen-playing");
  await page.waitForTimeout(650);
  console.log("Afterburn smoke: local run started");
  await page.evaluate(() => window.__infernodriftTestApi?.skipCountdown());
  await page.keyboard.down("KeyW");
  await page.evaluate(() => window.advanceTime?.(2400));
  await page.keyboard.down("Space");
  await page.keyboard.down("KeyD");
  await page.evaluate(() => window.advanceTime?.(450));
  console.log("Afterburn smoke: deterministic drive advanced");
  await page.keyboard.up("KeyD");
  await page.keyboard.up("Space");
  await page.keyboard.up("KeyW");
  await page.waitForTimeout(320);
  const gameplayState = await state(page);
  assert.equal(gameplayState.screen, "playing");
  assert.equal(gameplayState.mode, "burn-run");
  assert.ok(gameplayState.player.speed > 10, `expected driving speed, got ${gameplayState.player.speed}`);
  assert.ok(gameplayState.hunters.length >= 4);
  await page.evaluate(() => window.__infernodriftTestApi?.freeze(true));
  await page.waitForTimeout(180);
  await page.screenshot({ path: path.join(outputDir, "desktop-burn-run.png"), timeout: 60_000 });
  await page.evaluate(() => window.__infernodriftTestApi?.freeze(false));
  await page.evaluate(() => window.__infernodriftTestApi?.forceFinish());
  await page.waitForSelector(".results-screen", { timeout: 15_000 });
  const resultState = await state(page);
  assert.equal(resultState.result.finished, true);
  await page.screenshot({ path: path.join(outputDir, "desktop-results.png") });
  await noErrors(errors, "desktop local flow");
  await page.close();

  const menuPage = await desktop.newPage();
  const menuErrors = [];
  menuPage.on("console", (message) => { if (message.type() === "error") menuErrors.push(message.text()); });
  menuPage.on("pageerror", (error) => menuErrors.push(error.message));
  await menuPage.goto(baseUrl, { waitUntil: "networkidle" });
  await menuPage.locator("#start-btn").evaluate((element) => element.click());
  await menuPage.waitForSelector(".menu-shell");
  await menuPage.waitForTimeout(450);
  await menuPage.screenshot({ path: path.join(outputDir, "desktop-safehouse.png") });
  await menuPage.locator(".mode-list button", { hasText: "Burn Crew" }).click();
  await menuPage.getByLabel("Driver name").fill("Smoke Driver");
  await menuPage.getByRole("button", { name: "Connect" }).click();
  await menuPage.waitForFunction(() => document.body.textContent?.includes("Afterburn server online"));
  await menuPage.getByRole("button", { name: "Quick play" }).click();
  await menuPage.waitForSelector(".screen-playing", { timeout: 5000 });
  await menuPage.waitForFunction(() => {
    const raw = window.render_game_to_text?.();
    if (!raw) return false;
    const value = JSON.parse(raw);
    return value.online.status === "online" && value.players.length === 4;
  });
  await menuPage.waitForTimeout(650);
  const multiplayerState = await state(menuPage);
  assert.match(multiplayerState.online.roomCode, /^[A-Z0-9]{6}$/);
  assert.equal(multiplayerState.players.length, 4);
  assert.equal(multiplayerState.player.downed, false);
  await menuPage.evaluate(() => window.__infernodriftTestApi?.freeze(true));
  await menuPage.waitForTimeout(180);
  await menuPage.screenshot({ path: path.join(outputDir, "desktop-burn-crew-online.png"), timeout: 60_000 });
  await noErrors(menuErrors, "multiplayer flow");
  await desktop.close();

  const mobile = await browser.newContext({
    viewport: { width: 844, height: 390 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 1,
  });
  await mobile.addInitScript(() => {
    localStorage.setItem("infernodrift.afterburn.v1", JSON.stringify({
      schemaVersion: 1,
      credits: 0,
      reputation: 0,
      chassis: ["vandal"],
      activeChassis: "vandal",
      paints: ["afterglow"],
      activePaint: "afterglow",
      veteran: false,
      contractsCompleted: 0,
      bests: {},
      settings: { quality: "low", reducedMotion: true, cameraShake: 0, masterVolume: 0 },
    }));
  });
  const mobilePage = await mobile.newPage();
  const mobileErrors = [];
  mobilePage.on("console", (message) => { if (message.type() === "error") mobileErrors.push(message.text()); });
  mobilePage.on("pageerror", (error) => mobileErrors.push(error.message));
  await mobilePage.goto(baseUrl, { waitUntil: "networkidle" });
  await mobilePage.locator("#quick-run-btn").evaluate((element) => element.click());
  await mobilePage.waitForSelector(".touch-controls");
  await mobilePage.waitForTimeout(520);
  await mobilePage.evaluate(() => window.__infernodriftTestApi?.skipCountdown());
  await mobilePage.evaluate(() => window.__infernodriftTestApi?.setTouch({ throttle: 1, steer: -0.45, drift: true }));
  await mobilePage.evaluate(() => window.advanceTime?.(1800));
  const mobileState = await state(mobilePage);
  assert.ok(mobileState.player.speed > 10);
  const overflow = await mobilePage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(overflow <= 1, `mobile horizontal overflow: ${overflow}px`);
  await mobilePage.screenshot({ path: path.join(outputDir, "mobile-burn-run.png") });
  await noErrors(mobileErrors, "mobile flow");
  await mobile.close();

  console.log(`Afterburn browser smoke passed. Artifacts: ${outputDir}`);
} finally {
  if (browser) await browser.close();
  for (const child of processes) child.kill("SIGTERM");
}
