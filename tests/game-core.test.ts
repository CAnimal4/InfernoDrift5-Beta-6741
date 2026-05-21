import test from "node:test";
import assert from "node:assert/strict";
import {
  createInitialGameState,
  createRadar,
  getLevelFromXP,
  getLevelRewards,
  getXPForLevel,
  getXPProgressInCurrentLevel,
  migrateSave,
  startGame,
  stepGame,
  xpRequiredForLevel,
  type GameState,
  type InputFrame,
  type ModeId,
} from "../packages/game-core/src/index";

function input(overrides: Partial<InputFrame> = {}): InputFrame {
  return {
    throttle: 0,
    steer: 0,
    drift: false,
    boost: false,
    jump: false,
    backflip: false,
    ...overrides,
  };
}

function playing(mode: ModeId): GameState {
  const state = createInitialGameState(mode);
  state.machine = "playing";
  return state;
}

function advance(state: GameState, seconds: number, frame = input()): void {
  const steps = Math.ceil(seconds / 0.05);
  for (let index = 0; index < steps; index += 1) stepGame(state, frame, 0.05);
}

test("progression curve scales levels, progress, rewards, and migrated Embers", () => {
  assert.equal(xpRequiredForLevel(1), 670);
  assert.ok(xpRequiredForLevel(8) > xpRequiredForLevel(2));
  assert.equal(getXPForLevel(1), 0);
  assert.equal(getLevelFromXP(0), 1);
  assert.equal(getLevelFromXP(getXPForLevel(3)), 3);

  const progress = getXPProgressInCurrentLevel(getXPForLevel(4) + 120);
  assert.equal(progress.level, 4);
  assert.equal(progress.current, 120);
  assert.ok(progress.required > progress.current);

  const rewards = getLevelRewards(5);
  assert.ok(rewards.some((reward) => reward.type === "embers"));
  assert.ok(
    rewards.some(
      (reward) => reward.type === "cosmetic" && reward.id === "bodyId-muscle",
    ),
  );

  const migrated = migrateSave({
    progression: { xp: getXPForLevel(4) + 12, level: 2, embers: 140 },
  });
  assert.equal(migrated.progression.level, 4);
  assert.equal(migrated.progression.embers, 140);
  assert.deepEqual(migrated.progression.claimedLevelRewards, []);

  const legacyLevelOnly = migrateSave({
    progression: { xp: 0, level: 7, embers: 25 },
  });
  assert.equal(legacyLevelOnly.progression.level, 7);
  assert.equal(legacyLevelOnly.progression.xp, getXPForLevel(7));
});

test("radar exposes IDs, labels, priority, threat, closing speed, and normalized position", () => {
  const state = playing("boss");
  state.player.x = 0;
  state.player.z = 0;
  state.player.heading = 0;
  state.player.vz = 40;
  const boss = state.bots.find((bot) => bot.personality === "boss");
  assert.ok(boss);
  boss.x = 20;
  boss.z = 35;
  boss.heading = Math.PI;
  boss.speed = 30;

  const radar = createRadar(state);
  const bossDot = radar.find((entity) => entity.id === `bot-${boss.id}`);

  assert.ok(bossDot);
  assert.equal(bossDot.kind, "boss");
  assert.match(bossDot.label, /boss/);
  assert.equal(bossDot.team, "hunter");
  assert.ok(bossDot.priority > 80);
  assert.ok(bossDot.threat > 0.8);
  assert.equal(bossDot.sector, "front");
  assert.equal(bossDot.status, "near");
  assert.equal(Number.isFinite(bossDot.closingSpeed), true);
  assert.ok(Math.abs(bossDot.screenX) <= 1);
  assert.ok(Math.abs(bossDot.screenY) <= 1);
});

test("Max Arena only blue goals advance the objective, while red can fail the match", () => {
  const blue = playing("max");
  assert.ok(blue.ball);
  blue.ball.z = 211;

  stepGame(blue, input(), 0.05);

  assert.equal(blue.stats.goalsBlue, 1);
  assert.equal(blue.stats.goalsRed, 0);
  assert.equal(blue.objective.progress, 1);
  assert.ok(blue.score > 0);

  const red = playing("max");
  assert.ok(red.ball);
  red.stats.goalsRed = red.objective.target - 1;
  red.ball.z = -211;

  stepGame(red, input(), 0.05);

  assert.equal(red.machine, "results");
  assert.equal(red.objective.complete, false);
  assert.match(red.objective.failReason ?? "", /red team/i);
});

test("landing grades add boost, landing push, score, and stunt progress", () => {
  const state = playing("stunt");
  state.player.y = 0.1;
  state.player.vy = -18;
  state.player.airborne = true;
  state.player.airTime = 1.5;
  state.player.trickCharge = 2.2;
  state.player.speed = 92;
  state.player.boost = 0.2;
  const scoreBefore = state.score;

  stepGame(state, input({ drift: true }), 0.05);

  assert.equal(state.stats.landings, 1);
  assert.match(state.player.lastLanding ?? "", /perfect|inferno/);
  assert.ok(state.player.boost > 0.2);
  assert.ok(state.player.landingBoost > 0);
  assert.ok(state.score > scoreBefore);
  assert.ok(state.objective.progress > 0);
});

test("coasting bleeds speed to a stop instead of rolling forever", () => {
  const state = playing("race");
  state.player.speed = 92;
  const speedAfterThrottle = state.player.speed;

  advance(state, 1.6);

  assert.ok(state.player.speed < speedAfterThrottle * 0.1);
  assert.equal(state.player.speed, 0);
});

test("near misses are discrete scoring events with boost rewards and cooldown", () => {
  const state = playing("hunter");
  const bot = state.bots[0];
  bot.x = state.player.x + 25;
  bot.z = state.player.z;
  bot.speed = 0;
  state.player.speed = 62;
  const scoreBefore = state.score;

  stepGame(state, input(), 0.05);
  const scoreAfterFirstMiss = state.score;
  stepGame(state, input(), 0.05);

  assert.equal(state.stats.nearMisses, 1);
  assert.ok(scoreAfterFirstMiss > scoreBefore);
  assert.equal(state.score, scoreAfterFirstMiss);
  assert.ok(state.player.boost > 0);
});

test("Boost Bowling only clears pins from boosted or high-speed hits", () => {
  const weak = playing("boost-bowling");
  const weakPin = weak.markers[0];
  weak.player.x = weakPin.x;
  weak.player.z = weakPin.z;
  weak.player.speed = 34;

  stepGame(weak, input(), 0.05);

  assert.equal(weakPin.complete, false);
  assert.equal(weak.objective.progress, 0);
  assert.equal(weak.score, 65);

  const strong = playing("boost-bowling");
  const strongPin = strong.markers[0];
  strong.player.x = strongPin.x;
  strong.player.z = strongPin.z;
  strong.player.speed = 82;

  stepGame(strong, input({ boost: true }), 0.05);

  assert.equal(strongPin.complete, true);
  assert.equal(strong.objective.progress, 1);
  assert.ok(strong.score > weak.score + 250);
});

test("goal replay freezes play until the replay timer ends", () => {
  const state = playing("max");
  assert.ok(state.ball);
  state.ball.z = 211;

  stepGame(state, input(), 0.05);
  assert.equal(state.machine, "replay");

  const xAfterGoal = state.player.x;
  stepGame(state, input({ throttle: 1, steer: 1, boost: true }), 0.05);

  assert.equal(state.machine, "replay");
  assert.equal(state.player.x, xAfterGoal);
  assert.equal(state.stats.goalsBlue, 1);
});

test("Lava Floor banks progress only in the safe zone and burns shield outside", () => {
  const state = playing("lava-floor");
  const zone = state.markers[0];
  state.player.x = zone.x;
  state.player.z = zone.z;
  state.player.shield = 0.5;

  advance(state, 0.3);

  assert.ok(state.objective.progress > 0);
  assert.ok(state.player.shield > 0.5);

  const shieldAfterSafeZone = state.player.shield;
  state.player.x = 210;
  state.player.z = 210;
  advance(state, 0.6);

  assert.ok(state.player.shield < shieldAfterSafeZone);
});

test("fast restart clears result and replay state while preserving persistent progress", () => {
  const state = playing("hunter");
  state.machine = "results";
  state.objective.failReason = "boxed in";
  state.replay = { active: true, meta: "Goal replay", timer: 1.2 };
  state.progression.xp = 620;
  state.progression.unlocked.push("test-unlock");
  state.online = { status: "live", roomCode: "ABCD", latencyMs: 42 };

  const restarted = startGame(state);

  assert.equal(restarted.machine, "playing");
  assert.equal(restarted.mode, "hunter");
  assert.equal(restarted.objective.failReason, null);
  assert.equal(restarted.replay.active, false);
  assert.equal(restarted.score, 0);
  assert.equal(restarted.progression.xp, 620);
  assert.ok(restarted.progression.unlocked.includes("test-unlock"));
  assert.deepEqual(restarted.online, {
    status: "live",
    roomCode: "ABCD",
    latencyMs: 42,
  });
});

test("winning a mode grants mode rewards and records the reward log", () => {
  const state = playing("tutorial");
  state.score = 2000;
  state.objective.progress = state.objective.target;

  stepGame(state, input(), 0.05);

  assert.equal(state.machine, "results");
  assert.equal(state.objective.complete, true);
  assert.ok(state.progression.unlocked.includes("campaign-license"));
  assert.ok(state.progression.unlocked.includes("radar-basics"));
  assert.match(state.progression.rewardLog[0], /tutorial:/);
});
