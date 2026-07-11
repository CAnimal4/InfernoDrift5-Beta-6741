import assert from "node:assert/strict";
import { test } from "node:test";

import {
  ID5_SAVE_KEYS,
  ID5_LEGACY_SAVE_CHAIN,
  resolveFirstSaveRaw,
  resolveKeyWithFallback,
  HEATLINE_NODES,
  HEATLINE_WORLDS,
  getHeatlineNode,
  getFirstHeatlineNodeId,
  getNextHeatlineNodeId,
  createHeatlineState,
  normalizeHeatlineState,
  isHeatlineNodeUnlocked,
  evaluateHeatlineMedal,
  applyHeatlineResult,
  summarizeHeatline,
  RIFT_CHALLENGE_TYPES,
  RIFT_LIMITS,
  createStarterRiftChallenge,
  createRiftPiece,
  validateRiftChallenge,
  encodeRiftShareCode,
  decodeRiftShareCode,
  riftChallengeToRuntime,
  ID5_AUDIO_EVENTS,
  sanitizeLabel,
} from "../id5-systems.js";

test("id5 save chain prefers the id5 key then falls back to id4 and id3", () => {
  assert.equal(ID5_LEGACY_SAVE_CHAIN[0], ID5_SAVE_KEYS.save);
  assert.deepEqual(ID5_LEGACY_SAVE_CHAIN.slice(1), [
    "infernoDrift4.save.v1",
    "infernoDrift3.save.v1",
  ]);
  const store = new Map([["infernoDrift4.save.v1", '{"xp":500}']]);
  const hit = resolveFirstSaveRaw((key) => store.get(key) ?? null);
  assert.equal(hit.key, "infernoDrift4.save.v1");
  assert.equal(hit.raw, '{"xp":500}');
  store.set(ID5_SAVE_KEYS.save, '{"xp":900}');
  const hit2 = resolveFirstSaveRaw((key) => store.get(key) ?? null);
  assert.equal(hit2.key, ID5_SAVE_KEYS.save);
  const miss = resolveFirstSaveRaw(() => null);
  assert.equal(miss.key, null);
  assert.equal(miss.raw, null);
});

test("id5 secondary keys fall back to their id4 names", () => {
  const store = new Map([["infernoDrift4.onboarding.v1", '{"seen":true}']]);
  const hit = resolveKeyWithFallback(
    (key) => store.get(key) ?? null,
    ID5_SAVE_KEYS.onboarding,
  );
  assert.equal(hit.key, "infernoDrift4.onboarding.v1");
  store.set(ID5_SAVE_KEYS.onboarding, '{"seen":false}');
  const hit2 = resolveKeyWithFallback(
    (key) => store.get(key) ?? null,
    ID5_SAVE_KEYS.onboarding,
  );
  assert.equal(hit2.key, ID5_SAVE_KEYS.onboarding);
});

test("heatline campaign shape matches the ID5 spec direction", () => {
  assert.equal(HEATLINE_WORLDS.length, 5);
  assert.ok(HEATLINE_NODES.length >= 24 && HEATLINE_NODES.length <= 30);
  const ids = new Set();
  HEATLINE_NODES.forEach((node) => {
    assert.ok(!ids.has(node.id), `duplicate node id ${node.id}`);
    ids.add(node.id);
    assert.ok(
      HEATLINE_WORLDS.some((world) => world.id === node.worldId),
      `node ${node.id} references unknown world`,
    );
    assert.ok(node.medal.bronze < node.medal.silver);
    assert.ok(node.medal.silver < node.medal.gold);
    assert.ok(node.medal.gold < node.medal.inferno);
    assert.ok(node.firstClear.xp > 0);
    assert.ok(node.brief.length > 10);
  });
  HEATLINE_WORLDS.forEach((world) => {
    assert.ok(
      HEATLINE_NODES.some((node) => node.worldId === world.id),
      `world ${world.id} has no nodes`,
    );
  });
});

test("heatline unlock walks the chain in order", () => {
  const fresh = createHeatlineState();
  const first = getFirstHeatlineNodeId();
  const second = getNextHeatlineNodeId(first);
  assert.equal(fresh.currentNodeId, first);
  assert.equal(isHeatlineNodeUnlocked(fresh, first), true);
  assert.equal(isHeatlineNodeUnlocked(fresh, second), false);
  const afterFirst = applyHeatlineResult(fresh, first, {
    won: true,
    score: 700,
  });
  assert.equal(isHeatlineNodeUnlocked(afterFirst.state, second), true);
  assert.equal(afterFirst.state.currentNodeId, second);
  assert.equal(afterFirst.advanced, true);
});

test("heatline medals never downgrade and first clear pays exactly once", () => {
  const first = getFirstHeatlineNodeId();
  const node = getHeatlineNode(first);
  let state = createHeatlineState();
  const goldRun = applyHeatlineResult(state, first, {
    won: true,
    score: node.medal.gold + 10,
  });
  state = goldRun.state;
  assert.equal(goldRun.medal, "Gold");
  assert.equal(goldRun.firstClear, true);
  assert.deepEqual(goldRun.reward, node.firstClear);
  const bronzeRun = applyHeatlineResult(state, first, {
    won: true,
    score: node.medal.bronze + 5,
  });
  state = bronzeRun.state;
  assert.equal(state.medals[first], "Gold", "medal must not downgrade");
  assert.equal(bronzeRun.firstClear, false);
  assert.equal(bronzeRun.reward, null, "first clear reward pays only once");
  assert.equal(state.completions[first], 2);
  assert.equal(state.bestScores[first], node.medal.gold + 10);
});

test("heatline failed attempts record best score without advancing", () => {
  const first = getFirstHeatlineNodeId();
  const failed = applyHeatlineResult(createHeatlineState(), first, {
    won: false,
    score: 480,
  });
  assert.equal(failed.advanced, false);
  assert.equal(failed.medal, null);
  assert.equal(failed.state.bestScores[first], 480);
  assert.equal(failed.state.completions[first] ?? 0, 0);
  assert.equal(failed.state.currentNodeId, first);
});

test("heatline medal evaluation follows node thresholds", () => {
  const node = getHeatlineNode(getFirstHeatlineNodeId());
  assert.equal(evaluateHeatlineMedal(node, node.medal.bronze - 1), "Clear");
  assert.equal(evaluateHeatlineMedal(node, node.medal.bronze), "Bronze");
  assert.equal(evaluateHeatlineMedal(node, node.medal.silver), "Silver");
  assert.equal(evaluateHeatlineMedal(node, node.medal.gold), "Gold");
  assert.equal(evaluateHeatlineMedal(node, node.medal.inferno + 50), "Inferno");
});

test("heatline normalize repairs malformed saved data", () => {
  const messy = normalizeHeatlineState({
    currentNodeId: "not-a-node",
    medals: { "fake-node": "Gold", [getFirstHeatlineNodeId()]: "Silver" },
    bestScores: { [getFirstHeatlineNodeId()]: "9001" },
    completions: { [getFirstHeatlineNodeId()]: 3 },
    rewardsClaimed: { [getFirstHeatlineNodeId()]: 1 },
  });
  assert.equal(messy.medals["fake-node"], undefined);
  assert.equal(messy.medals[getFirstHeatlineNodeId()], "Silver");
  assert.equal(messy.bestScores[getFirstHeatlineNodeId()], 9001);
  assert.equal(
    messy.currentNodeId,
    getNextHeatlineNodeId(getFirstHeatlineNodeId()),
    "current node repairs to first uncompleted node",
  );
  const summary = summarizeHeatline(messy);
  assert.equal(summary.completed, 1);
  assert.equal(summary.total, HEATLINE_NODES.length);
});

test("riftforge starter builds validate for every challenge type", () => {
  RIFT_CHALLENGE_TYPES.forEach((type) => {
    const draft = createStarterRiftChallenge(type.id);
    const result = validateRiftChallenge(draft);
    assert.deepEqual(result.errors, [], `${type.id} starter should validate`);
    assert.equal(result.ok, true);
  });
});

test("riftforge share codes round trip with the ID5-RIFT prefix", () => {
  const draft = createStarterRiftChallenge("race-route");
  draft.title = "Roman's First Route";
  const encoded = encodeRiftShareCode(draft);
  assert.equal(encoded.ok, true);
  assert.ok(encoded.code.startsWith("ID5-RIFT1."));
  const decoded = decodeRiftShareCode(encoded.code);
  assert.equal(decoded.ok, true, decoded.error ?? "");
  assert.equal(decoded.challenge.title, "Roman's First Route");
  assert.equal(decoded.challenge.type, "race-route");
  assert.equal(decoded.challenge.pieces.length, draft.pieces.length);
});

test("riftforge decode rejects tampered, malformed, and wrong-version codes", () => {
  const encoded = encodeRiftShareCode(createStarterRiftChallenge("stunt-run"));
  const tampered = `${encoded.code.slice(0, -2)}zz`;
  assert.equal(decodeRiftShareCode(tampered).ok, false);
  assert.equal(decodeRiftShareCode("").ok, false);
  assert.equal(decodeRiftShareCode("hello world").ok, false);
  assert.equal(decodeRiftShareCode("ID5-RIFT9.deadbeef.QQ").ok, false);
  const flippedChecksum = encoded.code.replace(
    /^(ID5-RIFT1\.)([0-9a-f]{8})/,
    (match, prefix, sum) =>
      `${prefix}${sum.endsWith("0") ? sum.slice(0, 7) + "1" : sum.slice(0, 7) + "0"}`,
  );
  const flippedResult = decodeRiftShareCode(flippedChecksum);
  assert.equal(flippedResult.ok, false);
  assert.match(flippedResult.error, /checksum/i);
});

test("riftforge enforces piece limits and coordinate bounds", () => {
  const draft = createStarterRiftChallenge("race-route");
  for (let i = 0; i < RIFT_LIMITS.maxPieces + 4; i += 1) {
    draft.pieces.push({ t: "gate", x: 0, z: i, r: 0, s: 1 });
  }
  const overLimit = validateRiftChallenge(draft);
  assert.equal(overLimit.ok, false);
  assert.ok(overLimit.errors.some((entry) => /Too many/i.test(entry)));

  const outOfBounds = createStarterRiftChallenge("race-route");
  outOfBounds.pieces.push({ t: "gate", x: 9999, z: 0, r: 0, s: 1 });
  const boundsResult = validateRiftChallenge(outOfBounds);
  assert.equal(boundsResult.ok, false);
  assert.ok(boundsResult.errors.some((entry) => /build area/i.test(entry)));

  const clamped = createRiftPiece("gate", 9999, -9999, 720, 99);
  assert.equal(clamped.x, RIFT_LIMITS.coordRange);
  assert.equal(clamped.z, -RIFT_LIMITS.coordRange);
  assert.equal(clamped.r, 359);
  assert.equal(clamped.s, 3);
});

test("riftforge runtime mapping groups pieces and picks the right mode", () => {
  const draft = createStarterRiftChallenge("race-route");
  const runtime = riftChallengeToRuntime(draft);
  assert.equal(runtime.modeId, "race");
  assert.ok(runtime.start);
  assert.equal(runtime.gates.length, 3);
  assert.equal(runtime.boosts.length, 1);
  assert.equal(runtime.finish.length, 1);
  assert.ok(Number.isFinite(runtime.seed));
  const lava = riftChallengeToRuntime(createStarterRiftChallenge("lava-floor"));
  assert.equal(lava.modeId, "lava-floor");
  assert.equal(lava.pads.length, 4);
});

test("riftforge sanitizes titles against markup injection", () => {
  const draft = createStarterRiftChallenge("race-route");
  draft.title = '<img src=x onerror=alert(1)> & "quotes"  ';
  const encoded = encodeRiftShareCode(draft);
  assert.equal(encoded.ok, true);
  const decoded = decodeRiftShareCode(encoded.code);
  assert.equal(decoded.ok, true);
  assert.ok(!decoded.challenge.title.includes("<"));
  assert.ok(!decoded.challenge.title.includes(">"));
  assert.ok(!decoded.challenge.title.includes("&"));
  assert.equal(sanitizeLabel("a".repeat(200), 40).length, 40);
});

test("id5 audio event catalog covers the spec feedback list", () => {
  const required = [
    "boost-start",
    "collision",
    "checkpoint",
    "goal",
    "lava-warning",
    "hunter-danger",
    "level-up",
    "ui-click",
    "run-complete",
    "run-failed",
  ];
  required.forEach((eventName) => {
    assert.ok(
      ID5_AUDIO_EVENTS.includes(eventName),
      `missing audio event ${eventName}`,
    );
  });
  assert.equal(new Set(ID5_AUDIO_EVENTS).size, ID5_AUDIO_EVENTS.length);
});
