import test from "node:test";
import assert from "node:assert/strict";
import {
  EMPTY_INPUT,
  applyLocalDifficulty,
  applyResult,
  calculateResult,
  cloneSnapshot,
  createSimulation,
  defaultSave,
  roadCenter,
  sanitizeSave,
  stepSimulation,
  type InputFrame,
} from "../packages/afterburn-core/src/index";
import { parseClientMessage } from "../packages/afterburn-protocol/src/index";

const drive: InputFrame = {
  ...EMPTY_INPUT,
  seq: 1,
  throttle: 1,
  steer: 0.38,
  drift: true,
  boost: true,
};

test("simulation is deterministic for equal seed and input frames", () => {
  const entrants = [{ id: "p1", name: "Drifter", chassis: "vandal" as const }];
  const a = createSimulation("burn-run", 4242, entrants);
  const b = createSimulation("burn-run", 4242, entrants);
  a.countdown = 0;
  b.countdown = 0;
  for (let tick = 0; tick < 900; tick += 1) {
    const input = { ...drive, seq: tick + 1, steer: Math.sin(tick / 90) * 0.5 };
    stepSimulation(a, { p1: input });
    stepSimulation(b, { p1: input });
  }
  assert.deepEqual(cloneSnapshot(a), cloneSnapshot(b));
});

test("local difficulty changes pressure without changing online protocol rules", () => {
  const entrants = [{ id: "p1", name: "Drifter", chassis: "vandal" as const }];
  const rookie = applyLocalDifficulty(createSimulation("burn-run", 12, entrants), "rookie");
  const standard = applyLocalDifficulty(createSimulation("burn-run", 12, entrants), "standard");
  const inferno = applyLocalDifficulty(createSimulation("burn-run", 12, entrants), "inferno");
  assert.equal(rookie.hunters.length, 2);
  assert.equal(standard.hunters.length, 4);
  assert.equal(inferno.hunters.length, 4);
  assert.ok(inferno.hunters[0].z > standard.hunters[0].z);
  assert.ok(rookie.hazards.length < standard.hazards.length);
});
test("drift driving builds score, boost use spends charge, and recovery returns to road", () => {
  const state = createSimulation("burn-run", 81, [{ id: "p1", name: "Drifter", chassis: "wraith" }]);
  state.countdown = 0;
  for (let tick = 0; tick < 600; tick += 1) {
    stepSimulation(state, { p1: { ...drive, seq: tick + 1, steer: tick < 200 ? 0 : 0.7 } });
  }
  const player = state.players.p1;
  assert.ok(player.speed > 20);
  assert.ok(player.driftScore > 10);
  assert.ok(player.boost < 1);
  player.x = roadCenter(player.z, state.seed, state.mode) + 120;
  stepSimulation(state, { p1: { ...EMPTY_INPUT, seq: 700, recover: true } });
  assert.ok(Math.abs(player.x - roadCenter(player.z, state.seed, state.mode)) < 0.01);
  assert.ok(player.integrity > 0.9);
});

test("server-style result calculation and SaveV1 rewards are bounded", () => {
  const state = createSimulation("heat-circuit", 99, [{ id: "p1", name: "Drifter" }]);
  state.phase = "running";
  const player = state.players.p1;
  player.z = state.routeLength + 1;
  player.driftScore = 2200;
  player.cores = 4;
  stepSimulation(state, { p1: EMPTY_INPUT });
  const result = calculateResult(state, "p1");
  assert.equal(result.finished, true);
  assert.ok(result.score >= 7000);
  const save = applyResult(defaultSave(true), result);
  assert.equal(save.veteran, true);
  assert.ok(save.credits > 0);
  assert.ok(save.reputation > 0);
  assert.deepEqual(save.paints, ["afterglow", "oil-black", "veteran-black"]);
  assert.equal(save.activeDecal, "veteran");
  assert.equal(save.settings.cameraMode, "chase");
});

test("expanded settings and customization sanitize invalid save values", () => {
  const save = sanitizeSave({
    ...defaultSave(),
    paints: ["afterglow", "fake-paint"],
    activePaint: "fake-paint",
    rims: ["factory", "cyan"],
    activeRim: "cyan",
    settings: {
      ...defaultSave().settings,
      cameraDistance: 99,
      hudScale: 0.1,
      colorAssist: "deuteranopia",
      particleDensity: "medium",
    },
  });
  assert.deepEqual(save.paints, ["afterglow"]);
  assert.equal(save.activePaint, "afterglow");
  assert.equal(save.activeRim, "cyan");
  assert.equal(save.settings.cameraDistance, 1.4);
  assert.equal(save.settings.hudScale, 0.8);
  assert.equal(save.settings.colorAssist, "deuteranopia");
  assert.equal(save.settings.particleDensity, "medium");
  const migrated = sanitizeSave({ ...defaultSave(), settings: { quality: "high" } });
  assert.equal(migrated.settings.masterVolume, 0.75);
  assert.equal(migrated.settings.cameraShake, 0.7);
});

test("protocol v2 rejects client-authored results and oversized payloads", () => {
  assert.equal(
    parseClientMessage(JSON.stringify({
      type: "input.frame",
      seq: 1,
      throttle: 1,
      steer: 0,
      drift: false,
      boost: false,
      jump: false,
      recover: false,
      score: 999999,
    })).ok,
    false,
  );
  const oversized = JSON.stringify({ type: "session.guest", version: 2, name: "x".repeat(5000) });
  const parsed = parseClientMessage(oversized);
  assert.equal(parsed.ok, false);
  if (!parsed.ok) assert.equal(parsed.error, "message_too_large");
});
