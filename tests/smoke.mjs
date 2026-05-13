import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";

const port = 4173;
const url = `http://127.0.0.1:${port}/InfernoDrift4/`;
mkdirSync("output/smoke", { recursive: true });

const server = spawn(
  "npm",
  [
    "--workspace",
    "apps/web",
    "run",
    "preview",
    "--",
    "--host",
    "127.0.0.1",
    "--port",
    String(port),
  ],
  {
    stdio: ["ignore", "pipe", "pipe"],
  },
);

try {
  await waitFor(url);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 760 },
  });
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Campaign Survival" }).click();
  await page.keyboard.down("w");
  await page.keyboard.down("Shift");
  await page.waitForTimeout(900);
  await page.keyboard.up("Shift");
  await page.keyboard.up("w");
  await page.screenshot({ path: "output/smoke/desktop-gameplay.png" });
  const state = JSON.parse(
    await page.evaluate(() => window.render_game_to_text?.() ?? "{}"),
  );
  if (state.mode !== "campaign")
    throw new Error(`Expected campaign mode, got ${state.mode}`);
  if (state.player.speed <= 0) throw new Error("Expected player to move");
  if (errors.length) throw new Error(`Console errors: ${errors.join("\n")}`);

  const mobile = await browser.newPage({
    viewport: { width: 844, height: 390 },
    isMobile: true,
    hasTouch: true,
  });
  await mobile.goto(url, { waitUntil: "domcontentloaded" });
  await mobile.getByRole("button", { name: "Start Tutorial Race" }).tap();
  await mobile.screenshot({ path: "output/smoke/mobile-landscape.png" });
  await browser.close();
  console.log("smoke passed", { mode: state.mode, speed: state.player.speed });
} finally {
  server.kill("SIGTERM");
}

async function waitFor(target) {
  const started = Date.now();
  while (Date.now() - started < 60_000) {
    try {
      const response = await fetch(target);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for ${target}`);
}
