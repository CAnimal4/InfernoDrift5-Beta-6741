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
const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
page.setDefaultTimeout(9000);
page.on("console", (msg) => console.log("browser:", msg.type(), msg.text()));
page.on("dialog", async (dialog) => {
  await dialog.accept("ibelikesheesh");
});

const smokeUrl = process.env.SMOKE_URL || "http://127.0.0.1:4173/index.html";
await page.goto(smokeUrl, { waitUntil: "commit", timeout: 45000 });
await waitForGameHook(page);
await page.waitForTimeout(1200);

await page.locator("#start-btn").click({ force: true });
await page.waitForTimeout(800);

const campaignState = JSON.parse(
  await page.evaluate(() => window.render_game_to_text()),
);
assert.equal(campaignState.mode, "campaign-survival");
assert.equal(campaignState.running, true);
assert.equal(campaignState.player.demolished, false);
assert.ok(campaignState.bots.length >= 4);
assert.match(await page.locator("#hud-world").textContent(), /\S/);
assert.match(await page.locator("#hud-level").textContent(), /\S/);

await page.evaluate(() => {
  const state = JSON.parse(window.render_game_to_text());
  window.__infernodriftTestApi.setRemoteHumanPlayers([
    {
      id: "friend-1",
      username: "Clark",
      team: "blue",
      x: state.player.x,
      y: 0,
      z: state.player.z + 30,
      heading: 0,
      speed: 24,
    },
  ]);
});
await page.evaluate(() => window.advanceTime(300));
const remoteTags = await page.evaluate(() =>
  window.__infernodriftTestApi.getRemoteNameTags(),
);
assert.equal(remoteTags[0].text, "Clark");
assert.equal(remoteTags[0].hidden, false);
const campaignWithFriend = JSON.parse(
  await page.evaluate(() => window.render_game_to_text()),
);
assert.equal(campaignWithFriend.humanPlayers[0].username, "Clark");
assert.equal(campaignWithFriend.humanPlayers[0].nameTagVisible, true);
const friendRadar = campaignWithFriend.radar.entities.find(
  (entity) => entity.kind === "human" && entity.label === "Clark",
);
assert.ok(friendRadar);

await page.evaluate(() => {
  const state = JSON.parse(window.render_game_to_text());
  window.__infernodriftTestApi.setRemoteHumanPlayers([
    {
      id: "radar-front",
      username: "FrontProbe",
      team: "blue",
      x: state.player.x,
      y: 0,
      z: state.player.z + 80,
      heading: 0,
      speed: 0,
    },
    {
      id: "radar-left",
      username: "LeftProbe",
      team: "blue",
      x: state.player.x - 80,
      y: 0,
      z: state.player.z,
      heading: 0,
      speed: 0,
    },
  ]);
});
await page.evaluate(() => window.advanceTime(120));
const radarProbeState = JSON.parse(
  await page.evaluate(() => window.render_game_to_text()),
);
const frontProbe = radarProbeState.radar.entities.find(
  (entity) => entity.kind === "human" && entity.label === "FrontProbe",
);
const leftProbe = radarProbeState.radar.entities.find(
  (entity) => entity.kind === "human" && entity.label === "LeftProbe",
);
assert.equal(frontProbe.sector, "front");
assert.ok(frontProbe.forward > 0);
assert.ok(frontProbe.screenY < 0.5);
assert.equal(leftProbe.sector, "left");
assert.ok(leftProbe.right < 0);
assert.ok(leftProbe.screenX < 0.5);

await openMenu(page);
await page.locator('[data-tab="online"]').click({ force: true });
await page.waitForTimeout(150);
assert.match(
  (await page.locator("#online-status").textContent()) ?? "",
  /offline|backend/i,
);
await page.locator("#online-username").fill("SmokeRacer");
await page.locator("#online-age").fill("12");
await page.locator("#online-claim").click({ force: true });
await page.waitForTimeout(120);
let onlineUiState = JSON.parse(
  await page.evaluate(() => window.render_game_to_text()),
);
assert.equal(onlineUiState.ui.tab, "online");
assert.equal(onlineUiState.online.username, "SmokeRacer");
assert.equal(onlineUiState.online.ageGate.under13QuickChatOnly, true);
assert.equal(await page.locator("#online-chat-input").isDisabled(), true);
await page.locator("#online-friend-name").fill("");
await page.locator("#online-friend-name").focus();
await page.keyboard.type("cfh");
assert.equal(await page.locator("#online-friend-name").inputValue(), "cfh");
onlineUiState = JSON.parse(
  await page.evaluate(() => window.render_game_to_text()),
);
assert.equal(onlineUiState.online.chat.popoutOpen, false);
await page.locator('[data-tab="leaderboard"]').click({ force: true });
await page.waitForTimeout(120);
onlineUiState = JSON.parse(
  await page.evaluate(() => window.render_game_to_text()),
);
assert.equal(onlineUiState.ui.tab, "leaderboard");
assert.equal(await page.locator("#online-leaderboard").isVisible(), true);
await page.locator('[data-tab="online"]').click({ force: true });
await page.keyboard.press("c");
await page.waitForTimeout(180);
onlineUiState = JSON.parse(
  await page.evaluate(() => window.render_game_to_text()),
);
assert.equal(onlineUiState.online.chat.popoutOpen, true);
assert.equal(await page.locator("#chat-popout").isVisible(), true);
await page.locator("#menu-feedback").click({ force: true });
await page.waitForTimeout(150);
assert.equal(
  await page
    .locator("#feedback-modal")
    .evaluate((el) => el.classList.contains("show")),
  true,
);
await page.locator("#feedback-message").fill("Smoke feedback message");
await page.locator("#feedback-submit").click({ force: true });
await page.waitForTimeout(180);
assert.equal(
  await page.locator("#menu").evaluate((el) => el.classList.contains("show")),
  false,
);
assert.match(
  (await page.locator("#feedback-status").textContent()) ?? "",
  /not configured|not saved|feedback/i,
);
await page.screenshot({
  path: "output/playwright/phase4-online-feedback.png",
  fullPage: false,
  timeout: 30000,
});
await page.locator("#feedback-close").click({ force: true });
await page.waitForTimeout(120);
assert.equal(
  await page.locator("#menu").evaluate((el) => el.classList.contains("show")),
  true,
);
assert.equal(
  await page
    .locator("#feedback-modal")
    .evaluate((el) => el.classList.contains("show")),
  false,
);
await page.locator("#menu-resume").click({ force: true });
await page.waitForTimeout(120);
await page.keyboard.press("c");
await page.waitForTimeout(180);
assert.equal(await page.locator("#chat-popout").isVisible(), true);
assert.equal(
  await page.locator("#menu").evaluate((el) => el.classList.contains("show")),
  false,
);
await page.locator("#chat-popout-close").click({ force: true });

await openMenu(page);
await page.locator('[data-tab="settings"]').click({ force: true });
await page.locator("#dev-mode-toggle").click({ force: true });
await page.waitForTimeout(300);
assert.equal(await page.locator("#dev-mode-toggle").isChecked(), true);
assert.match(
  (await page.locator("#dev-mode-hint").textContent()) ?? "",
  /enabled/i,
);

await page.locator("#games-tab-btn").click({ force: true });
assert.equal(await page.locator("#games-tab-btn").isHidden(), false);
await page.screenshot({
  path: "output/playwright/phase3-play-board.png",
  fullPage: false,
  timeout: 30000,
});
await domClick(page, "#game-card-max1");
await page.waitForTimeout(300);
await page.evaluate(() => window.__infernodriftTestApi.startMode("max-arena"));
await page.waitForTimeout(900);
await page.evaluate(() => window.advanceTime(900));

const maxState = JSON.parse(
  await page.evaluate(() => window.render_game_to_text()),
);
assert.equal(maxState.mode, "max-arena");
assert.ok(maxState.ball);
assert.ok(maxState.bots.some((bot) => bot.team === "red"));
assert.ok(maxState.bots.some((bot) => bot.team === "blue"));
assert.match(await page.locator("#hud-world").textContent(), /\S/);
assert.match(await page.locator("#hud-level").textContent(), /\S/);

await page.keyboard.down("w");
await page.evaluate(() => window.advanceTime(1400));
await page.keyboard.up("w");
const maxSpeedState = JSON.parse(
  await page.evaluate(() => window.render_game_to_text()),
);
assert.ok(
  maxSpeedState.player.speed_mph >= 38,
  `Max Arena acceleration should feel lively, got ${maxSpeedState.player.speed_mph} mph`,
);
await page.keyboard.press("x");
await page.evaluate(() => window.advanceTime(220));
const maxJumpState = JSON.parse(
  await page.evaluate(() => window.render_game_to_text()),
);
assert.ok(maxJumpState.player.y > 0.12);
await page.keyboard.press("x");
await page.evaluate(() => window.advanceTime(180));
const maxFlipState = JSON.parse(
  await page.evaluate(() => window.render_game_to_text()),
);
assert.equal(
  maxFlipState.player.backflipActive ||
    /Backflip|Jump/i.test(maxFlipState.effects.lastToast),
  true,
);

await page.evaluate(() => window.__infernodriftTestApi.forceMaxGoal("blue"));
await page.waitForTimeout(150);
await page.evaluate(() => window.advanceTime(1600));
const matchStats = await page.evaluate(() =>
  window.__infernodriftTestApi.getMatchStats(),
);
assert.equal(matchStats.teams.blue.goals, 1);

await openMenu(page);
await page.locator("#games-tab-btn").click({ force: true });
await domClick(page, "#game-card-id33");
await page.waitForTimeout(350);
await page.keyboard.press("Escape");
await page.waitForTimeout(700);
const restoredState = JSON.parse(
  await page.evaluate(() => window.render_game_to_text()),
);
assert.equal(restoredState.mode, "campaign-survival");
assert.equal(restoredState.ball, null);

const requiredModes = [
  "campaign-survival",
  "max-arena",
  "race",
  "time-trial",
  "stunt-park",
  "hunter-tag",
  "battle-arena",
  "ramp-rush",
  "boost-bowling",
  "lava-floor",
  "king-zone",
];
const catalog = await page.evaluate(() =>
  window.__infernodriftTestApi.getModeCatalog(),
);
assert.deepEqual(
  requiredModes.every((modeId) => catalog.some((mode) => mode.id === modeId)),
  true,
);
for (const removedModeId of [
  "boss-chase",
  "drift-score",
  "trick-combo",
  "bot-escape",
]) {
  assert.equal(
    catalog.some((mode) => mode.id === removedModeId),
    false,
    `${removedModeId} should not be public in the Play board catalog`,
  );
}

for (const modeId of requiredModes) {
  const state = await page.evaluate((id) => {
    window.__infernodriftTestApi.startMode(id);
    window.advanceTime(420);
    return JSON.parse(window.render_game_to_text());
  }, modeId);
  assert.equal(state.mode, modeId);
  assert.equal(state.running, true);
  assert.ok(state.modeInfo.label);
  assert.ok(state.modeInfo.objective);
  assert.ok(state.modeInfo.rewardPreview);
  assert.ok(state.progression.levelNumber >= 1);
  if (
    [
      "race",
      "time-trial",
      "stunt-park",
      "battle-arena",
      "ramp-rush",
      "boost-bowling",
      "lava-floor",
    ].includes(modeId)
  ) {
    await page.screenshot({
      path: `output/playwright/phase3-${modeId}.png`,
      fullPage: false,
      animations: "disabled",
      timeout: 8000,
    });
  }
  const helpState = await page.evaluate(() =>
    window.__infernodriftTestApi.openModeHelp(),
  );
  assert.equal(helpState.visible, true);
  assert.ok(helpState.title);
  assert.ok(helpState.objective);
  const helpUiState = JSON.parse(
    await page.evaluate(() => window.render_game_to_text()),
  );
  assert.equal(helpUiState.modeHelp.visible, true);
  assert.equal(helpUiState.modeHelp.placement, "bottom-right");
  assert.equal(
    await page.locator("#menu").evaluate((el) => el.classList.contains("show")),
    false,
  );
  assert.equal(await page.locator("#mode-help-card").isVisible(), true);
  if (modeId === "race") {
    assert.equal(state.modeInfo.scene, "track");
    assert.ok(state.track.checkpoints >= 9);
    assert.equal(
      typeof (state.race?.trackBounded ?? state.track.trackBounded),
      "boolean",
    );
    assert.ok(state.bots.some((bot) => String(bot.role).startsWith("rival")));
    assert.equal(
      state.bots.some((bot) => bot.team === "hunter"),
      false,
    );
  }
  if (modeId === "time-trial") {
    assert.equal(state.modeInfo.scene, "track");
    assert.ok(state.track.checkpoints >= 9);
    assert.equal(state.bots.length, 0);
  }
  if (modeId === "stunt-park") {
    assert.equal(state.bots.length, 0);
    assert.ok(state.markers.some((marker) => marker.kind === "loop"));
    assert.equal(typeof state.stunt.combo, "number");
  }
  if (modeId === "ramp-rush") {
    assert.equal(state.bots.length, 0);
    assert.ok(
      state.markers.filter((marker) => marker.kind === "ring").length >= 8,
    );
  }
  if (modeId === "lava-floor") {
    assert.equal(state.modeInfo.scene, "lava");
    assert.ok(state.lava.platformHeight > 0);
    assert.ok(state.bots.length >= 1);
  }
  if (modeId === "boost-bowling") {
    assert.equal(state.modeInfo.scene, "bowling");
    assert.equal(
      state.markers.filter((marker) => marker.kind === "pin").length,
      10,
    );
    assert.equal(state.bowling.frame, 1);
    assert.equal(state.bowling.pinsStanding, 10);
    assert.equal(state.battlePickups.length, 0);
  }
  if (modeId === "battle-arena") {
    assert.equal(state.modeInfo.scene, "battle");
    assert.equal(state.battle.team, "blue");
    assert.equal(state.battle.health, 180);
    assert.equal(state.battle.ammo, 10);
    assert.equal(state.battle.targetScore, 3);
    assert.equal(state.battle.flags.length, 2);
    assert.ok(state.battlePickups.length >= 5);
    assert.ok(state.bots.some((bot) => bot.team === "red"));
  }
  if (modeId !== "campaign-survival" && modeId !== "max-arena") {
    assert.ok(
      state.markers.length > 0 || state.battlePickups.length > 0,
      `${modeId} should expose local objectives`,
    );
  }
}

const battleProbe = await page.evaluate(() => {
  window.__infernodriftTestApi.startMode("battle-arena");
  window.__infernodriftTestApi.setBattleAmmo(3);
  const fired = window.__infernodriftTestApi.fireBattleLaser();
  window.advanceTime(120);
  const state = JSON.parse(window.render_game_to_text());
  return {
    fired,
    ammo: state.battle.ammo,
    cooldown: state.battle.laserCooldown,
  };
});
assert.ok(battleProbe.ammo <= 2);
assert.ok(battleProbe.cooldown > 0);

const battleCoverProbe = await page.evaluate(() => {
  window.__infernodriftTestApi.startMode("battle-arena");
  window.__infernodriftTestApi.setBattleAmmo(10);
  window.__infernodriftTestApi.setBattleActorPose("player", {
    x: 0,
    z: -80,
    heading: 0,
  });
  window.__infernodriftTestApi.setBattleActorPose("red", {
    x: 0,
    z: -18,
    heading: Math.PI,
    health: 180,
  });
  const hit = window.__infernodriftTestApi.fireBattleLaser();
  window.advanceTime(80);
  const state = JSON.parse(window.render_game_to_text());
  return {
    hit,
    ammo: state.battle.ammo,
    redHealth: state.bots.find((bot) => bot.team === "red")?.health,
    lastLaserHit: state.battle.lastLaserHit,
    lastLaserBlocked: state.battle.lastLaserBlocked,
    coverBlocksLasers: state.battle.coverBlocksLasers,
    debug: window.__infernodriftTestApi.getBattleArenaDebug(),
  };
});
assert.equal(battleCoverProbe.hit, false);
assert.equal(battleCoverProbe.redHealth, 180);
assert.equal(battleCoverProbe.lastLaserBlocked, true);
assert.ok(battleCoverProbe.coverBlocksLasers >= 8);
assert.ok(
  battleCoverProbe.debug.solidCover.every((cover) => cover.blocksLasers),
);
assert.ok(
  battleCoverProbe.debug.solidCover.some((cover) => cover.standable === false),
);

const battleCoverCollisionProbe = await page.evaluate(() => {
  window.__infernodriftTestApi.startMode("battle-arena");
  window.__infernodriftTestApi.setBattleActorPose("player", {
    x: 0,
    z: -60,
    heading: 0,
    speed: 92,
  });
  window.advanceTime(420);
  const state = JSON.parse(window.render_game_to_text());
  return {
    z: state.player.z,
    speed: state.player.speed_mph,
    demolished: state.player.demolished,
  };
});
assert.ok(battleCoverCollisionProbe.z <= -51);
assert.ok(battleCoverCollisionProbe.speed < 90);
assert.equal(battleCoverCollisionProbe.demolished, false);

const battleCockpitProbe = await page.evaluate(() => {
  window.__infernodriftTestApi.startMode("battle-arena");
  window.__infernodriftTestApi.setBattleCockpitCamera(true);
  window.advanceTime(120);
  const state = JSON.parse(window.render_game_to_text());
  const debug = window.__infernodriftTestApi.getBattleArenaDebug();
  window.__infernodriftTestApi.setBattleCockpitCamera(false);
  return {
    camera: state.camera,
    debug,
    scopeClass: document.body.classList.contains("battle-cockpit-scope"),
  };
});
assert.equal(battleCockpitProbe.camera.battleCockpitEnabled, true);
assert.equal(battleCockpitProbe.camera.cockpit, true);
assert.equal(battleCockpitProbe.camera.scope, true);
assert.equal(battleCockpitProbe.debug.cockpitActive, true);
assert.equal(battleCockpitProbe.scopeClass, true);

const bowlingProbe = await page.evaluate(() => {
  window.__infernodriftTestApi.startMode("boost-bowling");
  window.__infernodriftTestApi.forceBowlingRollComplete(10);
  return window.__infernodriftTestApi.getBowlingState();
});
assert.equal(bowlingProbe.rolls[0], 10);
assert.equal(bowlingProbe.frame, 2);

const phase3Result = await page.evaluate(() => {
  window.__infernodriftTestApi.startMode("race");
  window.advanceTime(120);
  return window.__infernodriftTestApi.completeModeObjective();
});
assert.equal(phase3Result.screen, "results");
assert.equal(
  await page
    .locator("#message")
    .evaluate((el) => el.classList.contains("show")),
  true,
);
const phase3Progress = await page.evaluate(() =>
  window.__infernodriftTestApi.getProgressionSnapshot(),
);
assert.ok(phase3Progress.xp > 0);

const garageUnlockState = await page.evaluate(() => {
  window.__infernodriftTestApi.resetLocalProgressionForTest();
  window.__infernodriftTestApi.openMenuTab("customize");
  return JSON.parse(window.render_game_to_text()).garage;
});
assert.equal(garageUnlockState.unlockRule, "xp-level");
assert.equal(garageUnlockState.xpLevel, 1);
assert.ok(garageUnlockState.lockedCount > 0);
assert.ok(garageUnlockState.nextUnlock.level >= 2);
assert.ok(phase3Progress.personalBests.race);
await page.waitForTimeout(1500);
await page.screenshot({
  path: "output/playwright/phase3-results.png",
  fullPage: false,
  timeout: 30000,
});

await page.screenshot({
  path: "output/playwright/games-smoke.png",
  fullPage: false,
  timeout: 30000,
});

console.log(
  JSON.stringify(
    {
      campaign: {
        mode: campaignState.mode,
        bots: campaignState.bots.length,
        speed: campaignState.player.speed_mph,
        humanNameTag: campaignWithFriend.humanPlayers[0].username,
      },
      max: {
        mode: maxState.mode,
        ball: Boolean(maxState.ball),
        goals: matchStats.teams.blue.goals,
      },
      restored: { mode: restoredState.mode, running: restoredState.running },
    },
    null,
    2,
  ),
);

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

async function openMenu(page) {
  await page.evaluate(() => {
    const menu = document.getElementById("menu");
    if (!menu?.classList.contains("show")) {
      document.getElementById("menu-btn")?.click();
    }
  });
  await page.waitForTimeout(180);
}

async function domClick(page, selector) {
  await page.evaluate((targetSelector) => {
    const target = document.querySelector(targetSelector);
    if (!(target instanceof HTMLElement)) {
      throw new Error(`Missing clickable target ${targetSelector}`);
    }
    target.click();
  }, selector);
}
