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
const smokeUsername = `RunnerRacer${Date.now().toString().slice(-6)}`;
await page.goto(smokeUrl, { waitUntil: "commit", timeout: 45000 });
await waitForGameHook(page);
await page.evaluate((username) => {
  window.__infernodriftTestApi.configureOnlineForTest({
    backendMode: "websocket",
    backendUrl: "",
    username,
    age: 13,
  });
}, smokeUsername);
await page.waitForTimeout(1200);

assert.equal(await page.locator("#start-here-btn").textContent(), "PLAY NOW");
assert.equal(
  await page.locator("#start-account-submit").textContent(),
  "Login / Sign Up",
);
assert.equal(await page.locator("#start-btn").textContent(), "Play as Guest");
assert.equal(await page.locator("#tutorial-btn").textContent(), "Start Tutorial");

const playNowRouting = await page.evaluate(() => {
  const username = document.getElementById("start-account-username");
  const password = document.getElementById("start-account-password");
  const age = document.getElementById("start-account-age");
  username.value = "";
  password.value = "";
  age.value = "";
  const blank = window.__infernodriftTestApi.hasStartAccountCredentialsForTest();
  username.value = "SmokePlayNow";
  password.value = "";
  age.value = "13";
  const usernameOnly = window.__infernodriftTestApi.hasStartAccountCredentialsForTest();
  username.value = "";
  password.value = "";
  age.value = "13";
  const ageOnly = window.__infernodriftTestApi.hasStartAccountCredentialsForTest();
  username.value = "SmokePlayNow";
  password.value = "smoke-secret";
  age.value = "13";
  const filled = window.__infernodriftTestApi.hasStartAccountCredentialsForTest();
  username.value = "";
  password.value = "";
  age.value = "";
  return { ageOnly, blank, filled, usernameOnly };
});
assert.equal(playNowRouting.blank, false);
assert.equal(playNowRouting.usernameOnly, false);
assert.equal(playNowRouting.ageOnly, false);
assert.equal(playNowRouting.filled, true);

const schoolGateProbe = await page.evaluate(() => {
  const api = window.__infernodriftTestApi;
  const mondayClass = api.getSchoolGateStatus("2026-05-18T09:00:00");
  const mondayBreak = api.getSchoolGateStatus("2026-05-18T10:35:00");
  const mondayLunch = api.getSchoolGateStatus("2026-05-18T12:50:00");
  const fridayBefore = api.getSchoolGateStatus("2026-05-22T08:45:00");
  const weekend = api.getSchoolGateStatus("2026-05-23T09:00:00");
  const forced = api.forceSchoolGateAt("2026-05-18T09:00:00");
  const forcedState = JSON.parse(window.render_game_to_text()).ui;
  const dismissed = api.dismissSchoolGateForTest();
  return {
    mondayClass,
    mondayBreak,
    mondayLunch,
    fridayBefore,
    weekend,
    forced,
    forcedState,
    dismissed,
  };
});
assert.equal(schoolGateProbe.mondayClass.active, true);
assert.equal(schoolGateProbe.mondayClass.block, "Period 1");
assert.equal(schoolGateProbe.mondayBreak.active, false);
assert.equal(schoolGateProbe.mondayLunch.active, false);
assert.equal(schoolGateProbe.fridayBefore.active, false);
assert.equal(schoolGateProbe.weekend.active, false);
assert.equal(schoolGateProbe.forced.active, true);
assert.equal(schoolGateProbe.forcedState.screen, "school-gate");
assert.equal(schoolGateProbe.forcedState.schoolGate.visible, true);
assert.equal(schoolGateProbe.dismissed.dismissed, true);

await page.locator("#start-btn").click({ force: true });
await page.waitForTimeout(800);
if (await page.locator("#mode-help-card").isVisible()) {
  await page.locator("#mode-help-resume").click({ force: true });
}
await page.waitForTimeout(1200);

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
  const heading = Number(state.player.heading || 0);
  window.__infernodriftTestApi.setRemoteHumanPlayers([
    {
      id: "friend-1",
      username: "Clark",
      team: "blue",
      x: state.player.x + Math.sin(heading) * 16,
      y: 0,
      z: state.player.z + Math.cos(heading) * 16,
      heading,
      speed: 24,
    },
  ]);
});
await page.evaluate(() => {
  for (let i = 0; i < 20; i += 1) window.advanceTime(16);
});
const remoteTags = await page.evaluate(() =>
  window.__infernodriftTestApi.getRemoteNameTags(),
);
const clarkRemoteTag = remoteTags.find((tag) => tag.text === "Clark");
assert.ok(clarkRemoteTag);
assert.equal(typeof clarkRemoteTag.hidden, "boolean");
const campaignWithFriend = JSON.parse(
  await page.evaluate(() => window.render_game_to_text()),
);
assert.equal(campaignWithFriend.humanPlayers[0].username, "Clark");
assert.equal(
  campaignWithFriend.humanPlayers[0].nameTagVisible,
  !clarkRemoteTag.hidden,
);
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
  /online|connected|backend|firebase/i,
);
await page.locator("#online-username").fill(smokeUsername);
await page.locator("#online-age").fill("12");
await page.locator("#online-claim").click({ force: true });
await page.waitForFunction(
  (username) =>
    JSON.parse(window.render_game_to_text()).online.username === username,
  smokeUsername,
);
let onlineUiState = JSON.parse(
  await page.evaluate(() => window.render_game_to_text()),
);
assert.equal(onlineUiState.ui.tab, "online");
assert.equal(onlineUiState.online.username, smokeUsername);
assert.equal(onlineUiState.online.ageGate.under13QuickChatOnly, true);
assert.equal(await page.locator("#online-chat-input").isDisabled(), false);
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
const dedupedLeaderboard = await page.evaluate(() =>
  window.__infernodriftTestApi.setLeaderboardRowsForTest(
    [
      {
        userId: "guest-intel",
        username: "inteloftheeon",
        badge: "Guest",
        source: "server",
        guest: true,
        xp: 120,
        totalXp: 120,
      },
      {
        userId: "account-intel",
        username: "inteloftheeon",
        source: "server",
        account: true,
        xp: 900,
        totalXp: 900,
      },
      {
        userId: "guest-michael",
        username: "micheeal",
        badge: "Guest",
        source: "server",
        guest: true,
        xp: 300,
        totalXp: 300,
      },
      {
        userId: "account-michael",
        username: "micheeal",
        source: "server",
        account: true,
        xp: 700,
        totalXp: 700,
      },
    ],
    {
      userId: "account-intel",
      username: "inteloftheeon",
      source: "server",
      account: true,
      xp: 950,
      totalXp: 950,
    },
  ),
);
assert.equal(
  dedupedLeaderboard.filter((row) => row.username === "inteloftheeon").length,
  1,
);
assert.equal(
  dedupedLeaderboard.filter((row) => row.username === "micheeal").length,
  1,
);
assert.equal(
  dedupedLeaderboard.find((row) => row.username === "inteloftheeon").xp,
  950,
);
assert.equal(dedupedLeaderboard[0].username, "ChatGPT (Codex)");
assert.equal(dedupedLeaderboard[0].isSystemPlayer, true);
const chasedLeaderboard = await page.evaluate(() =>
  window.__infernodriftTestApi.setLeaderboardRowsForTest([
    {
      userId: "account-top",
      username: "RealTopDriver",
      source: "server",
      account: true,
      xp: 10000,
      totalXp: 10000,
    },
  ]),
);
assert.equal(chasedLeaderboard[0].username, "ChatGPT (Codex)");
assert.ok(chasedLeaderboard[0].xp >= 22153);
assert.equal(chasedLeaderboard[1].username, "RealTopDriver");
const pollutedCodexLeaderboard = await page.evaluate(() =>
  window.__infernodriftTestApi.setLeaderboardRowsForTest([
    {
      userId: "system-chatgpt-codex",
      username: "ChatGPT (Codex)",
      source: "system",
      isSystemPlayer: true,
      xp: 100000,
      totalXp: 100000,
      score: 100000,
    },
  ]),
);
assert.equal(pollutedCodexLeaderboard[0].username, "ChatGPT (Codex)");
assert.equal(pollutedCodexLeaderboard[0].xp, 22153);
const clarkSpecialProgress = await page.evaluate(() => {
  window.__infernodriftTestApi.setOnlineUserForTest({
    id: "clark-test",
    username: "Clark",
  });
  window.__infernodriftTestApi.applySavePayloadForTest(
    {
      progressionV2: {
        xp: 100000,
        totalXp: 100000,
        embers: 9999,
        specialBadgeRepairVersion: "old-bad-cap",
        specialBadgeProgressRepairedAt: "2026-05-23T00:00:00.000Z",
        specialBadgeProgressBaselineXp: 22000,
        specialBadgeProgressSource: "special-badge-xp-repair",
        rewardLog: [
          { at: "2026-05-23T00:00:05.000Z", xp: 325, modeId: "daily-gift" },
          { at: "2026-05-22T23:59:59.000Z", xp: 9000, modeId: "race" },
        ],
      },
    },
    { forceProgression: true, replaceProgression: true },
  );
  return JSON.parse(window.render_game_to_text()).progression;
});
assert.equal(clarkSpecialProgress.totalXp, 100000);
assert.equal(clarkSpecialProgress.embers, 9999);
assert.equal(clarkSpecialProgress.specialBadgeRepairVersion, undefined);
assert.equal(clarkSpecialProgress.specialBadgeProgressBaselineXp, undefined);
assert.equal(clarkSpecialProgress.accountProgressRepair?.previousTotalXp, undefined);
const clarkUnmarkedProgress = await page.evaluate(() => {
  window.__infernodriftTestApi.resetLocalProgressionForTest();
  window.__infernodriftTestApi.setOnlineUserForTest({
    id: "clark-clean",
    username: "Clark",
  });
  window.__infernodriftTestApi.applySavePayloadForTest(
    { progressionV2: { xp: 100000, totalXp: 100000, embers: 9999 } },
    { forceProgression: true, replaceProgression: true },
  );
  return JSON.parse(window.render_game_to_text()).progression;
});
assert.equal(clarkUnmarkedProgress.totalXp, 100000);
assert.equal(clarkUnmarkedProgress.embers, 9999);
const clarkPublicMarkerRepair = await page.evaluate(() => {
  window.__infernodriftTestApi.resetLocalProgressionForTest();
  window.__infernodriftTestApi.setOnlineUserForTest({
    id: "clark-public-marker",
    username: "Clark",
    progressRepairHint: {
      specialBadgeRepairVersion: "2026-05-23-badge-xp-repair-v3",
      specialBadgeProgressRepairedAt: "2026-05-23T00:00:00.000Z",
      specialBadgeProgressBaselineXp: 22000,
      specialBadgeProgressSource: "special-badge-xp-repair",
      publicProfileTotalXp: 100450,
    },
  });
  window.__infernodriftTestApi.applySavePayloadForTest(
    {
      progressionV2: {
        xp: 100450,
        totalXp: 100450,
        embers: 1200,
        rewardLog: [
          { at: "2026-05-23T00:00:05.000Z", xp: 450, modeId: "race" },
        ],
      },
    },
    { forceProgression: true, replaceProgression: true },
  );
  return JSON.parse(window.render_game_to_text()).progression;
});
assert.equal(clarkPublicMarkerRepair.totalXp, 100450);
assert.equal(clarkPublicMarkerRepair.embers, 1200);
assert.equal(
  clarkPublicMarkerRepair.accountProgressRepair?.markerSource,
  undefined,
);
const specialBadgeStatsAreDisplayOnly = await page.evaluate(() => {
  const usernames = ["MODERATOR", "Joshua", "Tosh_the_Sigma", "Billy", "JFine"];
  return usernames.map((username, index) => {
    window.__infernodriftTestApi.resetLocalProgressionForTest();
    window.__infernodriftTestApi.setOnlineUserForTest({
      id: `badge-display-${index}`,
      username,
    });
    window.__infernodriftTestApi.applySavePayloadForTest(
      { progressionV2: { xp: 90000 + index, totalXp: 90000 + index, embers: 500 + index } },
      { forceProgression: true, replaceProgression: true },
    );
    const progression = JSON.parse(window.render_game_to_text()).progression;
    return { username, totalXp: progression.totalXp, embers: progression.embers };
  });
});
specialBadgeStatsAreDisplayOnly.forEach((entry, index) => {
  assert.equal(entry.totalXp, 90000 + index);
  assert.equal(entry.embers, 500 + index);
});
const leaderboardRecoveryState = await page.evaluate(() => {
  window.__infernodriftTestApi.resetLocalProgressionForTest();
  window.__infernodriftTestApi.setOnlineUserForTest({
    id: "clark-live",
    username: "Clark",
  });
  window.__infernodriftTestApi.applySavePayloadForTest(
    { progressionV2: { xp: 22000, totalXp: 22000, embers: 875 } },
    { forceProgression: true, replaceProgression: true },
  );
  window.__infernodriftTestApi.setLeaderboardRowsForTest(
    [
      {
        userId: "clark-live",
        username: "Clark",
        source: "server",
        account: true,
        xp: 100000,
        totalXp: 100000,
      },
    ],
    {
      userId: "clark-live",
      username: "Clark",
      source: "server",
      account: true,
      xp: 100000,
      totalXp: 100000,
    },
  );
  const diagnostics = JSON.parse(window.render_game_to_text());
  return {
    progression: diagnostics.progression,
    leaderboard: diagnostics.online.leaderboard,
    playerRow: diagnostics.online.leaderboardState.playerRow,
  };
});
assert.equal(leaderboardRecoveryState.progression.totalXp, 22000);
assert.equal(leaderboardRecoveryState.progression.embers, 875);
assert.equal(leaderboardRecoveryState.leaderboard[0].username, "ChatGPT (Codex)");
assert.ok(leaderboardRecoveryState.leaderboard[0].xp < 90000);
assert.equal(
  leaderboardRecoveryState.leaderboard.find((row) => row.username === "Clark")?.quarantined,
  true,
);
assert.equal(leaderboardRecoveryState.playerRow.quarantined, true);
assert.equal(leaderboardRecoveryState.playerRow.totalXp, 0);
await page.locator('[data-tab="profile"]').click({ force: true });
await page.waitForTimeout(150);
onlineUiState = JSON.parse(
  await page.evaluate(() => window.render_game_to_text()),
);
assert.equal(onlineUiState.ui.tab, "profile");
assert.equal(onlineUiState.online.profile.tabVisible, true);
assert.match(await page.locator("#profile-display-name").textContent(), /\S/);
assert.match(
  (await page.locator("#profile-action-status").textContent()) ?? "",
  /delete|account|guest|online/i,
);
await page.locator('[data-tab="online"]').click({ force: true });
await page.keyboard.press("c");
await page.waitForTimeout(180);
onlineUiState = JSON.parse(
  await page.evaluate(() => window.render_game_to_text()),
);
assert.equal(onlineUiState.online.chat.popoutOpen, true);
assert.equal(await page.locator("#chat-popout").isVisible(), true);
await page.locator("#chat-popout-input").fill("/dm");
await page.locator("#chat-popout-send").click({ force: true });
await page.waitForTimeout(120);
onlineUiState = JSON.parse(
  await page.evaluate(() => window.render_game_to_text()),
);
assert.equal(onlineUiState.online.chat.mode, "dm");
assert.equal(await page.locator("#chat-command-panel").isVisible(), true);
const dmEchoState = await page.evaluate(() =>
  window.__infernodriftTestApi.simulateSentDirectMessageForTest({
    username: "DmSmokeFriend",
    userId: "dm-smoke-friend",
    text: "private smoke hello",
  }),
);
assert.equal(dmEchoState.mode, "dm");
assert.equal(dmEchoState.activeDmUsername, "DmSmokeFriend");
assert.ok(dmEchoState.dmMessageCount >= 1);
assert.equal(dmEchoState.lastMessage.text, "private smoke hello");
await page.locator("#chat-popout-close").click({ force: true });
let noticeState = await page.evaluate(() =>
  window.__infernodriftTestApi.simulateIncomingChatForTest({
    username: "LobbyFriend",
    userId: "lobby-friend",
    text: "join the goal push",
  }),
);
assert.equal(noticeState.noticeVisible, true);
assert.equal(noticeState.noticeDmUsername, "");
await page.locator("#chat-notice").click({ force: true });
onlineUiState = JSON.parse(
  await page.evaluate(() => window.render_game_to_text()),
);
assert.equal(onlineUiState.online.chat.popoutOpen, true);
assert.equal(onlineUiState.online.chat.mode, "lobby");
await page.locator("#chat-popout-close").click({ force: true });
noticeState = await page.evaluate(() =>
  window.__infernodriftTestApi.simulateIncomingChatForTest({
    id: "dm-smoke-inbox-1",
    username: "DmSmokeFriend",
    userId: "dm-smoke-friend",
    text: "private smoke ping",
    direct: true,
  }),
);
assert.equal(noticeState.noticeVisible, true);
assert.equal(noticeState.noticeDmUsername, "DmSmokeFriend");
const duplicateDmState = await page.evaluate(() =>
  window.__infernodriftTestApi.simulateIncomingChatForTest({
    id: "dm-smoke-inbox-1",
    username: "DmSmokeFriend",
    userId: "dm-smoke-friend",
    text: "private smoke ping",
    direct: true,
  }),
);
assert.equal(duplicateDmState.messageCount, noticeState.messageCount);
await page.locator("#chat-notice").click({ force: true });
onlineUiState = JSON.parse(
  await page.evaluate(() => window.render_game_to_text()),
);
assert.equal(onlineUiState.online.chat.popoutOpen, true);
assert.equal(onlineUiState.online.chat.mode, "dm");
assert.equal(onlineUiState.online.chat.activeDmUsername, "DmSmokeFriend");
await page.locator("#chat-popout-close").click({ force: true });
const offlineDigestState = await page.evaluate(() => {
  const first = window.__infernodriftTestApi.simulateIncomingDmDigestForTest({
    username: "OfflineOne",
    userId: "offline-one",
    count: 3,
  });
  const second = window.__infernodriftTestApi.simulateIncomingDmDigestForTest({
    username: "OfflineTwo",
    userId: "offline-two",
    count: 2,
  });
  return { first, second };
});
assert.equal(offlineDigestState.second.noticeVisible, true);
assert.equal(offlineDigestState.second.noticeCount, 2);
assert.deepEqual(offlineDigestState.second.noticeUsernames, [
  "OfflineTwo",
  "OfflineOne",
]);
assert.equal(await page.locator(".chat-notice:not([hidden])").count(), 2);
await page.locator("#chat-notice").click({ force: true });
onlineUiState = JSON.parse(
  await page.evaluate(() => window.render_game_to_text()),
);
assert.equal(onlineUiState.online.chat.mode, "dm");
assert.equal(onlineUiState.online.chat.activeDmUsername, "OfflineTwo");
await page.locator("#chat-popout-close").click({ force: true });
await page.locator("#chat-notice-close").click({ force: true });
const ownOnlineState = await page.evaluate(() =>
  window.__infernodriftTestApi.getOnlineState(),
);
const selfDmState = await page.evaluate((ownState) =>
  window.__infernodriftTestApi.simulateIncomingChatForTest({
    id: "dm-smoke-self",
    username: ownState.username,
    userId: ownState.userId || "test-user",
    text: "private self ping",
    direct: true,
  }), ownOnlineState,
);
assert.equal(selfDmState.noticeVisible, false);
await page.evaluate(() =>
  window.__infernodriftTestApi.simulateIncomingChatForTest({
    id: "lobby-smoke-report-open",
    username: "LobbyFriend",
    userId: "lobby-friend",
    text: "open report path",
  }),
);
await page.locator("#chat-notice").click({ force: true });
await page.locator("#chat-popout-input").fill("/report");
await page.locator("#chat-popout-send").click({ force: true });
await page.waitForTimeout(120);
onlineUiState = JSON.parse(
  await page.evaluate(() => window.render_game_to_text()),
);
assert.equal(onlineUiState.online.chat.mode, "report");
assert.equal(await page.locator("#chat-command-panel").isVisible(), true);
const feedbackNudge = await page.evaluate(() => {
  window.__infernodriftTestApi.resetFeedbackNudgeForTest();
  window.__infernodriftTestApi.openMenuTab("games");
  const first = window.__infernodriftTestApi.getFeedbackNudgeStateForTest();
  window.__infernodriftTestApi.closeMenuForTest();
  window.__infernodriftTestApi.openMenuTab("games");
  const second = window.__infernodriftTestApi.getFeedbackNudgeStateForTest();
  return { first, second };
});
assert.equal(feedbackNudge.first.visible, true);
assert.equal(feedbackNudge.first.hidden, false);
assert.match(feedbackNudge.first.text, /ideas shape/i);
assert.equal(feedbackNudge.second.visible, false);
await page.locator("#menu-feedback").click({ force: true });
await page.waitForTimeout(150);
assert.equal(
  await page
    .locator("#feedback-modal")
    .evaluate((el) => el.classList.contains("show")),
  true,
);
await page.locator("#feedback-message").fill("Smoke feedback message");
const feedbackLimitProbe = await page.evaluate(() => {
  window.__infernodriftTestApi.setFeedbackTextForTest("x".repeat(8000));
  const atLimit = window.__infernodriftTestApi.getFeedbackLimitState();
  window.__infernodriftTestApi.setFeedbackTextForTest("x".repeat(8100));
  const overLimit = window.__infernodriftTestApi.getFeedbackLimitState();
  return { atLimit, overLimit };
});
assert.equal(feedbackLimitProbe.atLimit.count, 8000);
assert.equal(feedbackLimitProbe.overLimit.count, 8100);
assert.equal(feedbackLimitProbe.overLimit.tooLong, true);
assert.match(feedbackLimitProbe.overLimit.counter, /8,100 \/ 8,000/);
assert.match(feedbackLimitProbe.overLimit.error, /100 characters too long/);
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

const onlineFailureProbe = await page.evaluate(() => {
  const unavailable = window.__infernodriftTestApi.simulateBackendFailure(
    "backend_unreachable",
  );
  const timeout =
    window.__infernodriftTestApi.forceOnlineTimeout("auth_timeout");
  const state = JSON.parse(window.render_game_to_text());
  return { unavailable, timeout, online: state.online };
});
assert.equal(onlineFailureProbe.unavailable.transport, "offline");
assert.equal(onlineFailureProbe.timeout.connectionStage, "failed");
assert.equal(onlineFailureProbe.online.transport, "offline");
assert.match(onlineFailureProbe.online.lastError || "", /timed out|too long/i);

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
const xpBalance = await page.evaluate(() => ({
  fastRace: window.__infernodriftTestApi.estimateModeRewardsForTest("race", {
    won: true,
    score: 1200,
    progress: 10,
    timeLeft: 92,
  }),
  slowRace: window.__infernodriftTestApi.estimateModeRewardsForTest("race", {
    won: true,
    score: 1800,
    progress: 10,
    timeLeft: 18,
  }),
  maxWin: window.__infernodriftTestApi.estimateModeRewardsForTest("max-arena", {
    won: true,
    score: 1200,
    progress: 5,
    timeLeft: 55,
  }),
}));
assert.ok(
  xpBalance.fastRace.xp > xpBalance.slowRace.xp,
  `fast race should beat slow high-score race: ${JSON.stringify(xpBalance)}`,
);
assert.ok(
  xpBalance.maxWin.xp > xpBalance.fastRace.xp,
  `long Max win should pay more than quick race: ${JSON.stringify(xpBalance)}`,
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

const maxCtrlProbe = await page.evaluate(() => {
  window.__infernodriftTestApi.setMaxBallNearPlayer(7, 0);
  const before = JSON.parse(window.render_game_to_text()).ball;
  const ok = window.__infernodriftTestApi.pressMaxCtrlForTest();
  window.advanceTime(120);
  const state = JSON.parse(window.render_game_to_text());
  return { ok, before, after: state.ball, max: state.max };
});
assert.equal(maxCtrlProbe.ok, true);
assert.equal(maxCtrlProbe.max.lastCtrlTarget, "ball");
assert.ok(Math.abs(maxCtrlProbe.after.vz) > Math.abs(maxCtrlProbe.before.vz));
assert.ok(maxCtrlProbe.max.ballImpulse > 0);

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
      timeout: 20000,
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
    assert.equal(state.battle.returnPads.length, 2);
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

const battleFlagProbe = await page.evaluate(() => {
  window.__infernodriftTestApi.startMode("battle-arena");
  window.__infernodriftTestApi.setBattleFlagCarrier("red", "player");
  window.__infernodriftTestApi.movePlayerToBattleReturnPad("blue");
  window.advanceTime(120);
  const state = JSON.parse(window.render_game_to_text());
  return {
    score: state.battle.score.blue,
    lastFlagEvent: state.battle.lastFlagEvent,
    flagMessage: state.battle.flagMessage,
    pads: state.battle.returnPads,
  };
});
assert.equal(battleFlagProbe.score, 1);
assert.match(battleFlagProbe.lastFlagEvent, /blue_scored/);
assert.equal(battleFlagProbe.pads.length, 2);

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
assert.equal(phase3Progress.totalXp, phase3Progress.xp);
assert.ok(phase3Progress.embers > 0);
assert.ok(Array.isArray(phase3Progress.ownedCosmetics));
assert.ok(Array.isArray(phase3Progress.claimedLevelRewards));
const dailyGiftProgress = await page.evaluate(() => {
  window.__infernodriftTestApi.resetLocalProgressionForTest();
  const before = window.__infernodriftTestApi.getDailyGiftState();
  const first = window.__infernodriftTestApi.redeemDailyGift();
  const second = window.__infernodriftTestApi.redeemDailyGift();
  const textState = JSON.parse(window.render_game_to_text()).progression;
  return { before, first, second, textState };
});
assert.equal(dailyGiftProgress.before.available, true);
assert.ok(dailyGiftProgress.before.amount >= 100);
assert.ok(dailyGiftProgress.before.amount <= 1000);
assert.equal(dailyGiftProgress.first.ok, true);
assert.equal(dailyGiftProgress.first.amount, dailyGiftProgress.before.amount);
assert.equal(
  dailyGiftProgress.first.progression.xp,
  dailyGiftProgress.before.amount,
);
assert.equal(dailyGiftProgress.second.ok, false);
assert.equal(dailyGiftProgress.textState.dailyGift.claimed, true);
assert.equal(dailyGiftProgress.textState.dailyGift.available, false);
assert.equal(dailyGiftProgress.textState.dailyGiftNoticeVisible, false);
assert.ok(dailyGiftProgress.textState.embers >= dailyGiftProgress.first.embers);
assert.ok(Array.isArray(dailyGiftProgress.textState.dailySparks.items));
assert.equal(dailyGiftProgress.textState.dailySparks.items.length, 3);
assert.equal(dailyGiftProgress.textState.levelTrack.length, 50);
const dailyGiftDistribution = await page.evaluate(() =>
  window.__infernodriftTestApi.sampleDailyGiftRolls(1200),
);
assert.ok(
  dailyGiftDistribution.every((amount) => amount >= 100 && amount <= 1000),
);
assert.ok(
  dailyGiftDistribution.filter((amount) => amount <= 350).length >
    dailyGiftDistribution.filter((amount) => amount >= 675).length,
);
const currentSchemaProgressionGuard = await page.evaluate(() =>
  window.__infernodriftTestApi.normalizeProgressionForTest({
    schemaVersion: 3,
    xp: 0,
    totalXp: 0,
    level: 7,
    embers: 0,
  }),
);
assert.equal(currentSchemaProgressionGuard.level, 1);
assert.equal(currentSchemaProgressionGuard.xp, 0);
const legacyLevelProgressionGuard = await page.evaluate(() =>
  window.__infernodriftTestApi.normalizeProgressionForTest({
    schemaVersion: 2,
    xp: 0,
    totalXp: 0,
    level: 7,
    embers: 0,
  }),
);
assert.equal(legacyLevelProgressionGuard.level, 7);
assert.ok(legacyLevelProgressionGuard.xp > 0);
const exitLinkState = await page.evaluate(() => {
  window.__infernodriftTestApi.setExitLinkUrl("https://example.com/class");
  return {
    url: window.__infernodriftTestApi.getExitLinkUrl(),
    controls: JSON.parse(window.render_game_to_text()).controls,
  };
});
assert.equal(exitLinkState.url, "https://example.com/class");
assert.equal(exitLinkState.controls.exitLinkKey, "Q");
assert.equal(exitLinkState.controls.exitLinkUrl, "https://example.com/class");
const sharedXpProgress = await page.evaluate(() => {
  window.__infernodriftTestApi.setLeaderboardRowsForTest([], null);
  window.__infernodriftTestApi.resetLocalProgressionForTest();
  window.__infernodriftTestApi.startMode("campaign-survival");
  window.advanceTime(120);
  const campaignResult = window.__infernodriftTestApi.completeModeObjective();
  const afterCampaign = campaignResult.progression.xp;
  window.__infernodriftTestApi.startMode("boost-bowling");
  window.advanceTime(120);
  const bowlingResult = window.__infernodriftTestApi.completeModeObjective();
  const final = window.__infernodriftTestApi.getProgressionSnapshot();
  window.__infernodriftTestApi.openMenuTab("leaderboard");
  const leaderboard = JSON.parse(window.render_game_to_text()).online
    .leaderboard;
  return {
    afterCampaign,
    afterBowling: final.xp,
    bowlingGain: bowlingResult.progression.xp - afterCampaign,
    totalXp: final.totalXp,
    leaderboard,
  };
});
assert.ok(sharedXpProgress.afterCampaign > 0);
assert.ok(sharedXpProgress.bowlingGain > 0);
assert.equal(sharedXpProgress.afterBowling, sharedXpProgress.totalXp);
assert.ok(
  sharedXpProgress.leaderboard.some(
    (row) => row.xp === sharedXpProgress.afterBowling,
  ),
);
assert.ok(sharedXpProgress.leaderboard.length > 1);
const leaderboardTiers = sharedXpProgress.leaderboard.map((row) => row.tier);
assert.equal(leaderboardTiers[0], "Inferno");
assert.equal(leaderboardTiers.filter((tier) => tier === "Inferno").length, 1);
if (leaderboardTiers.length > 1) assert.equal(leaderboardTiers[1], "Platinum");
if (leaderboardTiers.length > 2) assert.equal(leaderboardTiers[2], "Platinum");
if (leaderboardTiers.length > 3) assert.equal(leaderboardTiers[3], "Gold");

const playLayout = await page.evaluate(() => {
  window.__infernodriftTestApi.openMenuTab("games");
  const board = document.querySelector("#mode-board")?.getBoundingClientRect();
  const card = document.querySelector(".mode-card")?.getBoundingClientRect();
  const art = document
    .querySelector(".mode-card-art")
    ?.getBoundingClientRect();
  return {
    boardWidth: board?.width || 0,
    cardWidth: card?.width || 0,
    leftGap: card && board ? card.left - board.left : 999,
    artWidth: art?.width || 0,
    artHeight: art?.height || 0,
  };
});
assert.ok(playLayout.cardWidth >= 360);
assert.ok(playLayout.leftGap < 30);
assert.ok(playLayout.artWidth >= 90);
assert.ok(playLayout.artHeight >= 70);

const garageUnlockState = await page.evaluate(() => {
  window.__infernodriftTestApi.resetLocalProgressionForTest();
  window.__infernodriftTestApi.openMenuTab("customize");
  const legacyVisible =
    document.querySelector(".garage-legacy-controls")?.getBoundingClientRect()
      .height > 0;
  const emberPill = document.querySelector(".garage-ember-pill");
  const categoryIcon = document.querySelector(".garage-category-icon");
  return {
    garage: JSON.parse(window.render_game_to_text()).garage,
    legacyVisible,
    emberPill: emberPill?.textContent || "",
    categoryIcon: categoryIcon?.textContent || "",
  };
});
assert.equal(garageUnlockState.legacyVisible, false);
assert.match(garageUnlockState.emberPill, /Embers/);
assert.match(garageUnlockState.categoryIcon, /\S/);
assert.equal(garageUnlockState.garage.unlockRule, "xp-level");
assert.equal(garageUnlockState.garage.xpLevel, 1);
assert.ok(garageUnlockState.garage.lockedCount > 0);
assert.ok(garageUnlockState.garage.nextUnlock.level >= 2);
assert.ok(garageUnlockState.garage.market.length >= 12);
assert.ok(
  garageUnlockState.garage.market.some(
    (category) =>
      category.key === "boostTrailId" &&
      category.options.some((option) => option.id === "blue-flare"),
  ),
);
const legacyGarageMigration = await page.evaluate(() => {
  window.__infernodriftTestApi.resetLocalProgressionForTest();
  window.__infernodriftTestApi.applySavePayloadForTest(
    {
      progressionV2: { schemaVersion: 2, xp: 0, totalXp: 0, level: 7, embers: 180 },
      customization: { paintId: "frost" },
    },
    { forceProgression: true },
  );
  const garage = JSON.parse(window.render_game_to_text()).garage;
  return garage.market
    .find((category) => category.key === "paintId")
    .options.find((option) => option.id === "frost");
});
assert.equal(legacyGarageMigration.unlockLevel, 3);
assert.equal(legacyGarageMigration.unlocked, true);
assert.equal(legacyGarageMigration.owned, true);
assert.equal(legacyGarageMigration.equipped, true);
const freshAccountResetState = await page.evaluate(() => {
  window.__infernodriftTestApi.resetLocalProgressionForTest();
  window.__infernodriftTestApi.applySavePayloadForTest(
    { progressionV2: { xp: 5700, totalXp: 5700, level: 6, embers: 0 } },
    { forceProgression: true },
  );
  const before = window.__infernodriftTestApi.getProgressionSnapshot();
  const freshPayload = window.__infernodriftTestApi.buildFreshAccountSaveForTest();
  window.__infernodriftTestApi.applySavePayloadForTest(freshPayload, {
    forceProgression: true,
    replaceProgression: true,
  });
  const after = window.__infernodriftTestApi.getProgressionSnapshot();
  const polluted = window.__infernodriftTestApi.isPollutedFreshAccountSaveForTest({
    worldIndex: 0,
    levelIndex: 0,
    progressionV2: { schemaVersion: 3, xp: 5700, totalXp: 5700, level: 6 },
  });
  const protectedSave = window.__infernodriftTestApi.isPollutedFreshAccountSaveForTest({
    worldIndex: 0,
    levelIndex: 0,
    progressionV2: {
      schemaVersion: 3,
      xp: 5700,
      totalXp: 5700,
      level: 6,
      personalBests: { race: 88 },
    },
  });
  return { before, after, polluted, protectedSave };
});
assert.ok(freshAccountResetState.before.totalXp >= 5700);
assert.equal(freshAccountResetState.after.totalXp, 0);
assert.equal(freshAccountResetState.after.level, 1);
assert.equal(freshAccountResetState.polluted, true);
assert.equal(freshAccountResetState.protectedSave, false);
const garageBuyState = await page.evaluate(() => {
  window.__infernodriftTestApi.resetLocalProgressionForTest();
  window.__infernodriftTestApi.applySavePayloadForTest(
    { progressionV2: { xp: 12000, totalXp: 12000, embers: 500 } },
    { forceProgression: true },
  );
  const buy = window.__infernodriftTestApi.buyGarageCosmetic(
    "boostTrailId",
    "blue-flare",
  );
  const beforeBody = window.__infernodriftTestApi.getCarVisualConfigForTest();
  const buyMuscle = window.__infernodriftTestApi.buyGarageCosmetic(
    "bodyId",
    "muscle",
  );
  const afterBody = window.__infernodriftTestApi.getCarVisualConfigForTest();
  const duplicate = window.__infernodriftTestApi.buyGarageCosmetic(
    "boostTrailId",
    "blue-flare",
  );
  const equipLocked = window.__infernodriftTestApi.equipGarageCosmetic(
    "goalExplosionId",
    "blue-nova",
  );
  const state = JSON.parse(window.render_game_to_text());
  return {
    buy,
    buyMuscle,
    duplicate,
    equipLocked,
    garage: state.garage,
    skin: state.player.skin,
    beforeBody,
    afterBody,
  };
});
assert.equal(garageBuyState.buy.ok, true);
assert.equal(garageBuyState.buyMuscle.ok, true);
assert.equal(garageBuyState.duplicate.reason, "Already owned.");
assert.equal(garageBuyState.equipLocked.ok, false);
assert.equal(garageBuyState.skin.boostTrail, "blue-flare");
assert.equal(garageBuyState.skin.body, "muscle");
assert.notDeepEqual(
  garageBuyState.beforeBody.bodyScale,
  garageBuyState.afterBody.bodyScale,
);
assert.equal(garageBuyState.afterBody.body, "muscle");
assert.ok(
  garageBuyState.garage.market
    .find((category) => category.key === "boostTrailId")
    .options.find((option) => option.id === "blue-flare").equipped,
);
const garageVisualCategories = await page.evaluate(() => {
  window.__infernodriftTestApi.resetLocalProgressionForTest();
  window.__infernodriftTestApi.setOnlineUserForTest({
    id: "garage-premium-test",
    username: "GarageTester",
  });
  window.__infernodriftTestApi.applySavePayloadForTest(
    { progressionV2: { xp: 160000, totalXp: 160000, embers: 99999 } },
    { forceProgression: true, replaceProgression: true },
  );
  const before = window.__infernodriftTestApi.getCarVisualConfigForTest();
  [
    ["tireId", "rally"],
    ["stanceId", "lifted"],
    ["plateId", "legend"],
    ["finishId", "lava-glow"],
    ["bodyId", "monster"],
  ].forEach(([category, option]) => {
    window.__infernodriftTestApi.grantGarageCosmeticForTest(category, option);
    window.__infernodriftTestApi.equipGarageCosmetic(category, option);
  });
  const after = window.__infernodriftTestApi.getCarVisualConfigForTest();
  const premiumSteps = [];
  [
    ["bodyId", "juggernaut"],
    ["wheelId", "reactor"],
    ["tireId", "titan"],
    ["stanceId", "wide-pro"],
    ["decalId", "solar-fangs"],
    ["liveryId", "voidline"],
    ["boostTrailId", "plasma-crown"],
    ["exhaustId", "quad-star"],
    ["plateId", "mythic"],
    ["finishId", "prismatic"],
  ].forEach(([category, option]) => {
    const granted = window.__infernodriftTestApi.grantGarageCosmeticForTest(
      category,
      option,
    );
    const equipped = window.__infernodriftTestApi.equipGarageCosmetic(
      category,
      option,
    );
    premiumSteps.push({ category, option, granted, equipped });
  });
  const premium = window.__infernodriftTestApi.getCarVisualConfigForTest();
  return { before, after, premium, premiumSteps };
});
assert.equal(garageVisualCategories.after.body, "monster");
assert.equal(garageVisualCategories.after.tireTread, "knobby");
assert.equal(garageVisualCategories.after.stanceStyle, "lifted");
assert.equal(garageVisualCategories.after.plateText, "L");
assert.equal(garageVisualCategories.after.finishDetail, "lava");
assert.ok(garageVisualCategories.after.rideHeight > garageVisualCategories.before.rideHeight + 0.5);
assert.ok(garageVisualCategories.after.wheelRadius > garageVisualCategories.before.wheelRadius + 0.25);
assert.notEqual(garageVisualCategories.after.wheelColor, garageVisualCategories.before.wheelColor);
assert.equal(
  garageVisualCategories.premium.body,
  "juggernaut",
  JSON.stringify(garageVisualCategories.premiumSteps),
);
assert.equal(garageVisualCategories.premium.tireTread, "titan");
assert.equal(garageVisualCategories.premium.decalStyle, "fang");
assert.equal(garageVisualCategories.premium.finishDetail, "prism");
assert.equal(garageVisualCategories.premium.plateText, "M");
assert.equal(garageVisualCategories.premium.exhaustStyle, "quad");
assert.notEqual(garageVisualCategories.premium.boostColor, garageVisualCategories.before.boostColor);
const tutorialState = await page.evaluate(() => {
  window.__infernodriftTestApi.resetLocalProgressionForTest();
  return window.__infernodriftTestApi.startFirstDriveTutorial();
});
assert.equal(tutorialState.active, true);
assert.equal(tutorialState.mode, "race");
const roomJoinState = await page.evaluate(() => {
  window.__infernodriftTestApi.openMenuTab("online");
  return window.__infernodriftTestApi.simulateRoomJoinForTest({
    code: "BTTL7",
    mode: "battle-arena",
    firebaseLobby: true,
  });
});
assert.equal(roomJoinState.mode, "battle-arena");
assert.equal(roomJoinState.running, true);
assert.equal(roomJoinState.ui.screen, "playing");
assert.equal(roomJoinState.online.room.code, "BTTL7");
assert.equal(roomJoinState.online.room.liveRole, "host");
const duelRoomState = await page.evaluate(() => {
  window.__infernodriftTestApi.simulateRoomJoinForTest({
    code: "DUEL1",
    mode: "battle-arena",
    ownId: "joiner-user",
    hostUid: "host-user",
    liveHostUid: "host-user",
    teamSize: 1,
    botFill: false,
    players: [
      { id: "host-user", uid: "host-user", username: "Host", team: "blue" },
      { id: "joiner-user", uid: "joiner-user", username: "Joiner", team: "red" },
    ],
  });
  window.__infernodriftTestApi.startMode("battle-arena");
  return JSON.parse(window.render_game_to_text());
});
assert.equal(duelRoomState.battle.team, "red");
assert.equal(duelRoomState.bots.length, 0);
assert.equal(duelRoomState.online.room.botFill, false);
const maxLiveState = await page.evaluate(() => {
  window.__infernodriftTestApi.simulateRoomJoinForTest({
    code: "MAX77",
    mode: "max-arena",
    ownId: "client-user",
    hostUid: "host-user",
    liveHostUid: "host-user",
    players: [
      { id: "client-user", uid: "client-user", username: "Client" },
      { id: "host-user", uid: "host-user", username: "Host" },
    ],
  });
  return window.__infernodriftTestApi.simulateFirebaseLiveSnapshotForTest({
    code: "MAX77",
    mode: "max-arena",
    ownId: "client-user",
    liveSeq: 5,
    livePlayers: {
      "host-user": {
        id: "host-user",
        uid: "host-user",
        username: "Host",
        team: "red",
        x: 16,
        y: 0,
        z: -22,
        heading: 0.4,
        speed: 38,
        boost: true,
        backflip: true,
        backflipProgress: 0.42,
        cosmetics: { bodyId: "monster", paintId: "ember" },
      },
    },
  });
});
assert.equal(maxLiveState.mode, "max-arena");
assert.equal(maxLiveState.online.room.liveRole, "client");
assert.equal(maxLiveState.online.firebaseLive.appliedSeq, 5);
assert.equal(maxLiveState.hud.score.blue, 2);
assert.equal(maxLiveState.hud.score.red, 1);
assert.equal(maxLiveState.ball.x, 5);
assert.ok(maxLiveState.bots.some((bot) => bot.x === -12 && bot.z === 18));
assert.equal(maxLiveState.humanPlayers.length, 1);
assert.match(maxLiveState.online.remotePlayers[0].cosmeticsKey, /monster/);
assert.equal(maxLiveState.online.remotePlayers[0].backflip, true);
assert.ok(maxLiveState.online.remotePlayers[0].backflipProgress >= 0.4);
const twoWayLiveState = await page.evaluate(() => {
  window.__infernodriftTestApi.simulateRoomJoinForTest({
    code: "TWOWAY",
    mode: "max-arena",
    ownId: "host-user",
    hostUid: "host-user",
    liveHostUid: "host-user",
    players: [
      { id: "host-user", uid: "host-user", username: "Host" },
      { id: "client-user", uid: "client-user", username: "Joiner" },
    ],
  });
  window.__infernodriftTestApi.simulateFirebaseLiveSnapshotForTest({
    code: "TWOWAY",
    mode: "max-arena",
    ownId: "host-user",
    hostUid: "host-user",
    liveHostUid: "host-user",
    liveSeq: 11,
    players: [
      { id: "host-user", uid: "host-user", username: "Host" },
      { id: "client-user", uid: "client-user", username: "Joiner" },
    ],
    livePlayers: {
      "host-user": {
        id: "host-user",
        uid: "host-user",
        username: "Host",
        x: 0,
        y: 0,
        z: -90,
      },
      "client-user": {
        id: "client-user",
        uid: "client-user",
        username: "Joiner",
        team: "blue",
        x: 42,
        y: 0,
        z: -18,
        heading: 1.35,
        speed: 55,
        cosmetics: { bodyId: "monster", paintId: "cyan" },
      },
      staleUser: {
        id: "staleUser",
        uid: "staleUser",
        username: "Gone",
        x: 8,
        y: 0,
        z: 8,
        at: "2020-01-01T00:00:00.000Z",
      },
    },
  });
  window.advanceTime(180);
  return {
    state: JSON.parse(window.render_game_to_text()),
    debug: window.__infernodriftTestApi.getFirebaseLiveDebugForTest(),
  };
});
assert.equal(twoWayLiveState.state.online.room.liveRole, "host");
assert.equal(twoWayLiveState.state.online.remotePlayers.length, 1);
assert.equal(twoWayLiveState.state.online.remotePlayers[0].username, "Joiner");
assert.match(twoWayLiveState.state.online.remotePlayers[0].cosmeticsKey, /monster/);
assert.ok(twoWayLiveState.state.online.remotePlayers[0].x > 35);
assert.deepEqual(twoWayLiveState.debug.stalePlayerIds, ["staleUser"]);
const battleLiveState = await page.evaluate(() => {
  window.__infernodriftTestApi.simulateRoomJoinForTest({
    code: "BTT88",
    mode: "battle-arena",
    ownId: "client-user",
    hostUid: "host-user",
    liveHostUid: "host-user",
    players: [
      { id: "client-user", uid: "client-user", username: "Client" },
      { id: "host-user", uid: "host-user", username: "Host" },
    ],
  });
  return window.__infernodriftTestApi.simulateFirebaseLiveSnapshotForTest({
    code: "BTT88",
    mode: "battle-arena",
    ownId: "client-user",
    liveSeq: 8,
  });
});
assert.equal(battleLiveState.mode, "battle-arena");
assert.equal(battleLiveState.battle.score.blue, 1);
assert.match(battleLiveState.battle.flagMessage, /Blue flag point/);
const battleFollowerLaserState = await page.evaluate(() => {
  window.__infernodriftTestApi.simulateRoomJoinForTest({
    code: "BTTF1",
    mode: "battle-arena",
    ownId: "client-user",
    hostUid: "host-user",
    liveHostUid: "host-user",
    players: [
      { id: "client-user", uid: "client-user", username: "Client" },
      { id: "host-user", uid: "host-user", username: "Host" },
    ],
  });
  window.__infernodriftTestApi.closeMenuForTest();
  window.__infernodriftTestApi.setBattleAmmo(2);
  window.__infernodriftTestApi.setLaserHeldForTest(true);
  window.advanceTime(80);
  window.__infernodriftTestApi.setLaserHeldForTest(false);
  return JSON.parse(window.render_game_to_text());
});
assert.equal(battleFollowerLaserState.mode, "battle-arena");
assert.ok(battleFollowerLaserState.battle.ammo < 2);
assert.ok(battleFollowerLaserState.battle.laserCooldown > 0);
const levelRevealState = await page.evaluate(() =>
  window.__infernodriftTestApi.forceLevelUpRevealForTest(),
);
assert.equal(levelRevealState.visible, true);
assert.match(levelRevealState.text, /Level Up/);
assert.match(levelRevealState.text, /Next reward/i);
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
