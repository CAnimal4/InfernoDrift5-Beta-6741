import test from "node:test";
import assert from "node:assert/strict";
import {
  createInitialGameState,
  createRadar,
  stepGame,
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

test("drift-score mode wins from banked drift points instead of checkpoint count", () => {
  const state = playing("drift-score");
  state.player.driftScore = state.objective.target;

  stepGame(state, input(), 0.05);

  assert.equal(state.machine, "results");
  assert.equal(state.objective.complete, true);
  assert.ok(state.progression.medals["drift-score"]);
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
