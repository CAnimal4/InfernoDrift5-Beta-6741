// InfernoDrift5: RiftForge Online, pure systems module.
// Zero dependencies, safe to import from the browser runtime and from node tests.
// Contains: ID5 save key chain, Heatline campaign data and reducers,
// RiftForge share-code codec and validation, and the audio event catalog.

export const ID5_PRODUCT_NAME = "InfernoDrift5: RiftForge Online";
export const ID5_PRODUCT_SHORT = "InfernoDrift5";
export const ID5_SCHEMA_VERSION = 4;

// ---------------------------------------------------------------------------
// Save keys and migration chain
// ---------------------------------------------------------------------------

export const ID5_SAVE_KEYS = {
  save: "infernoDrift5.save.v1",
  online: "infernoDrift5.online.v1",
  feedback: "infernoDrift5.feedback.v1",
  feedbackNudge: "infernoDrift5.feedbackNudgeSeen.v1",
  onboarding: "infernoDrift5.onboarding.v1",
  releaseWelcome: "infernoDrift5.releaseWelcome.5_0",
  rotatePrompt: "infernoDrift5.mobile.rotatePromptDismissed",
  riftforge: "infernoDrift5.riftforge.v1",
};

// Ordered oldest-compatible fallback chain. The live key is always first.
export const ID5_LEGACY_SAVE_CHAIN = [
  ID5_SAVE_KEYS.save,
  "infernoDrift4.save.v1",
  "infernoDrift3.save.v1",
];

export const ID5_LEGACY_KEY_FALLBACKS = {
  [ID5_SAVE_KEYS.online]: ["infernoDrift4.online.v1"],
  [ID5_SAVE_KEYS.feedback]: ["infernoDrift4.feedback.v1"],
  [ID5_SAVE_KEYS.feedbackNudge]: ["infernoDrift4.feedbackNudgeSeen.v1"],
  [ID5_SAVE_KEYS.onboarding]: ["infernoDrift4.onboarding.v1"],
  [ID5_SAVE_KEYS.rotatePrompt]: ["infernodrift4.mobile.rotatePromptDismissed"],
};

// readFn(key) -> string | null. Returns the first hit walking the chain.
export function resolveFirstSaveRaw(readFn, chain = ID5_LEGACY_SAVE_CHAIN) {
  if (typeof readFn !== "function") return { key: null, raw: null };
  for (const key of chain) {
    let raw = null;
    try {
      raw = readFn(key);
    } catch {
      raw = null;
    }
    if (raw !== null && raw !== undefined && raw !== "") {
      return { key, raw };
    }
  }
  return { key: null, raw: null };
}

export function resolveKeyWithFallback(readFn, primaryKey) {
  const chain = [primaryKey, ...(ID5_LEGACY_KEY_FALLBACKS[primaryKey] ?? [])];
  return resolveFirstSaveRaw(readFn, chain);
}

// ---------------------------------------------------------------------------
// Small shared utils
// ---------------------------------------------------------------------------

export function clampNumber(value, min, max, fallback = min) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}

export function hashStringFnv1a(text) {
  let hash = 0x811c9dc5;
  const source = String(text ?? "");
  for (let i = 0; i < source.length; i += 1) {
    hash ^= source.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function sanitizeLabel(text, maxLength = 40) {
  return String(text ?? "")
    .replace(/[<>&\u0000-\u001f]/g, "")
    .trim()
    .slice(0, maxLength);
}

function toBase64Url(text) {
  const utf8 =
    typeof TextEncoder !== "undefined"
      ? new TextEncoder().encode(text)
      : Uint8Array.from(Buffer.from(text, "utf8"));
  let binary = "";
  utf8.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  const base64 =
    typeof btoa === "function"
      ? btoa(binary)
      : Buffer.from(binary, "binary").toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(payload) {
  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary =
    typeof atob === "function"
      ? atob(padded)
      : Buffer.from(padded, "base64").toString("binary");
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return typeof TextDecoder !== "undefined"
    ? new TextDecoder().decode(bytes)
    : Buffer.from(bytes).toString("utf8");
}

// ---------------------------------------------------------------------------
// Heatline campaign
// ---------------------------------------------------------------------------

export const HEATLINE_MEDAL_ORDER = [
  "Clear",
  "Bronze",
  "Silver",
  "Gold",
  "Inferno",
];

export function heatlineMedalRank(medal) {
  const index = HEATLINE_MEDAL_ORDER.indexOf(String(medal ?? ""));
  return index < 0 ? -1 : index;
}

export const HEATLINE_WORLDS = [
  {
    id: "ignition-yard",
    name: "Ignition Yard",
    tagline: "Learn the car. Light the fire.",
  },
  {
    id: "neon-route",
    name: "Neon Route",
    tagline: "Speed, checkpoints, cleaner lines.",
  },
  {
    id: "arena-circuit",
    name: "Arena Circuit",
    tagline: "Goals, zones, and laser pressure.",
  },
  {
    id: "skyfire-stunts",
    name: "Skyfire Stunts",
    tagline: "Ramps, rings, tricks, and lava.",
  },
  {
    id: "rift-core",
    name: "Rift Core",
    tagline: "Everything you learned, on fire.",
  },
];

function node(
  id,
  worldId,
  title,
  modeId,
  brief,
  medal,
  firstClear,
  overrides = {},
) {
  return { id, worldId, title, modeId, brief, medal, firstClear, overrides };
}

export const HEATLINE_NODES = [
  // World 1: Ignition Yard
  node(
    "ign-first-ignition",
    "ignition-yard",
    "First Ignition",
    "race",
    "Tutorial pace. Accelerate, steer, and clear 4 easy gates. No rivals yet.",
    { bronze: 300, silver: 600, gold: 1000, inferno: 1600 },
    { xp: 220, embers: 40 },
    { time: 100, target: 4, botCount: 0, botSpeed: 0 },
  ),
  node(
    "ign-drift-basics",
    "ignition-yard",
    "Drift Basics",
    "drift-score",
    "Hold Drift through corners and bank your first style chain.",
    { bronze: 500, silver: 900, gold: 1500, inferno: 2400 },
    { xp: 240, embers: 45 },
    { time: 90 },
  ),
  node(
    "ign-boost-lanes",
    "ignition-yard",
    "Boost Lanes",
    "race",
    "Ride the glowing pads, manage Boost, and beat one gentle rival.",
    { bronze: 550, silver: 1000, gold: 1600, inferno: 2500 },
    { xp: 260, embers: 50 },
    { time: 110, target: 6, botCount: 1, botSpeed: 40 },
  ),
  node(
    "ign-first-heat",
    "ignition-yard",
    "First Heat",
    "campaign-survival",
    "Survive your first hunter heat. Keep moving, use pads, protect the shield.",
    { bronze: 600, silver: 1100, gold: 1800, inferno: 2700 },
    { xp: 300, embers: 60 },
    {},
  ),
  node(
    "ign-yard-trial",
    "ignition-yard",
    "Yard Trial",
    "time-trial",
    "Solo time attack around the yard. Clean gates set your first ghost.",
    { bronze: 550, silver: 1000, gold: 1700, inferno: 2600 },
    { xp: 280, embers: 55 },
    { time: 75, target: 7 },
  ),
  // World 2: Neon Route
  node(
    "neo-street-race",
    "neon-route",
    "Street Race",
    "race",
    "Three rivals on the wide neon road. Bump back, hit every checkpoint.",
    { bronze: 800, silver: 1400, gold: 2200, inferno: 3200 },
    { xp: 320, embers: 65 },
    { time: 120, target: 10, botCount: 3, botSpeed: 46 },
  ),
  node(
    "neo-clean-lines",
    "neon-route",
    "Clean Lines",
    "time-trial",
    "No rivals, no excuses. Tighten the racing line and beat your ghost.",
    { bronze: 850, silver: 1500, gold: 2400, inferno: 3600 },
    { xp: 330, embers: 65 },
    { time: 80, target: 10 },
  ),
  node(
    "neo-rush-hour",
    "neon-route",
    "Rush Hour",
    "race",
    "Five fast rivals. Use Drift to carry speed through the hard corners.",
    { bronze: 950, silver: 1650, gold: 2500, inferno: 3600 },
    { xp: 360, embers: 75 },
    { time: 120, target: 11, botCount: 5, botSpeed: 50 },
  ),
  node(
    "neo-ghost-chase",
    "neon-route",
    "Ghost Chase",
    "time-trial",
    "Your best ghost is fast now. Beat it with cleaner drift exits.",
    { bronze: 1000, silver: 1800, gold: 2800, inferno: 4100 },
    { xp: 380, embers: 80 },
    { time: 80, target: 11 },
  ),
  node(
    "neo-night-heat",
    "neon-route",
    "Night Heat",
    "campaign-survival",
    "The hunters learned your habits. Survive the neon night heat.",
    { bronze: 1000, silver: 1800, gold: 2800, inferno: 4000 },
    { xp: 400, embers: 85 },
    {},
  ),
  // World 3: Arena Circuit
  node(
    "arc-max-rookie",
    "arena-circuit",
    "Max Rookie",
    "max-arena",
    "First ball match. Push the ball, guard your goal, score for Blue.",
    { bronze: 500, silver: 1000, gold: 1700, inferno: 2600 },
    { xp: 400, embers: 85 },
    {},
  ),
  node(
    "arc-zone-holder",
    "arena-circuit",
    "Zone Holder",
    "king-zone",
    "Hold the active zone. When it moves, move first.",
    { bronze: 800, silver: 1450, gold: 2300, inferno: 3400 },
    { xp: 400, embers: 85 },
    { time: 110 },
  ),
  node(
    "arc-laser-drill",
    "arena-circuit",
    "Laser Drill",
    "battle-arena",
    "Blue vs Red laser tag. Use cover, watch ammo, protect the shield.",
    { bronze: 750, silver: 1450, gold: 2300, inferno: 3500 },
    { xp: 420, embers: 90 },
    { time: 150 },
  ),
  node(
    "arc-max-clash",
    "arena-circuit",
    "Max Clash",
    "max-arena",
    "The bots hit harder now. Win the arena with smart bumps and boost saves.",
    { bronze: 800, silver: 1500, gold: 2300, inferno: 3300 },
    { xp: 440, embers: 95 },
    {},
  ),
  node(
    "arc-flag-runner",
    "arena-circuit",
    "Flag Runner",
    "battle-arena",
    "Push deeper into Red territory and keep your score streak alive.",
    { bronze: 950, silver: 1750, gold: 2700, inferno: 4000 },
    { xp: 460, embers: 100 },
    { time: 165 },
  ),
  node(
    "arc-arena-final",
    "arena-circuit",
    "Arena Final",
    "king-zone",
    "Longer holds, faster swaps. Own every zone to take the circuit.",
    { bronze: 1100, silver: 1950, gold: 3000, inferno: 4400 },
    { xp: 500, embers: 110 },
    { time: 120 },
  ),
  // World 4: Skyfire Stunts
  node(
    "sky-ramp-school",
    "skyfire-stunts",
    "Ramp School",
    "ramp-rush",
    "Hit the ramp line, land clean, and keep the rush chain going.",
    { bronze: 800, silver: 1500, gold: 2400, inferno: 3600 },
    { xp: 460, embers: 100 },
    { time: 85, target: 10 },
  ),
  node(
    "sky-ring-run",
    "skyfire-stunts",
    "Ring Run",
    "stunt-park",
    "Thread the air rings. Loops and barrel rolls multiply the score.",
    { bronze: 1000, silver: 1900, gold: 3100, inferno: 4700 },
    { xp: 480, embers: 105 },
    { time: 120, target: 9 },
  ),
  node(
    "sky-trick-combo",
    "skyfire-stunts",
    "Trick Combo",
    "trick-combo",
    "Chain flips, rolls, and clean landings without dropping the combo.",
    { bronze: 1000, silver: 1900, gold: 3000, inferno: 4500 },
    { xp: 500, embers: 110 },
    {},
  ),
  node(
    "sky-bowling-break",
    "skyfire-stunts",
    "Bowling Break",
    "boost-bowling",
    "Bonus stage. Line up the launch and send every pin flying.",
    { bronze: 700, silver: 1300, gold: 2100, inferno: 3200 },
    { xp: 420, embers: 95 },
    {},
  ),
  node(
    "sky-lava-steps",
    "skyfire-stunts",
    "Lava Steps",
    "lava-floor",
    "The floor is rising. Read the safe pads and never stop climbing.",
    { bronze: 800, silver: 1500, gold: 2400, inferno: 3600 },
    { xp: 480, embers: 105 },
    {},
  ),
  node(
    "sky-stunt-final",
    "skyfire-stunts",
    "Skyfire Final",
    "stunt-park",
    "Every ramp, every ring, one giant run. Make the sky remember you.",
    { bronze: 1400, silver: 2500, gold: 3900, inferno: 5600 },
    { xp: 540, embers: 120 },
    { time: 120, target: 10 },
  ),
  // World 5: Rift Core
  node(
    "rift-hunter-gauntlet",
    "rift-core",
    "Hunter Gauntlet",
    "hunter-tag",
    "Evade the pack. If they tag you, tag back fast and keep the gates coming.",
    { bronze: 950, silver: 1700, gold: 2600, inferno: 3800 },
    { xp: 520, embers: 115 },
    { time: 100, target: 5, botCount: 5, botSpeed: 44 },
  ),
  node(
    "rift-boss-heat",
    "rift-core",
    "Boss Heat",
    "boss-chase",
    "The Rift Boss hunts alone and it does not miss. Outdrive it.",
    { bronze: 1000, silver: 1800, gold: 2800, inferno: 4100 },
    { xp: 560, embers: 125 },
    {},
  ),
  node(
    "rift-escape-core",
    "rift-core",
    "Escape The Core",
    "bot-escape",
    "Break out of the swarm. Every clean escape charges the finale.",
    { bronze: 1000, silver: 1800, gold: 2800, inferno: 4000 },
    { xp: 560, embers: 125 },
    {},
  ),
  node(
    "rift-inferno-final",
    "rift-core",
    "Inferno Final",
    "campaign-survival",
    "The final heat. Survive the core and the Heatline is yours.",
    { bronze: 1400, silver: 2400, gold: 3600, inferno: 5200 },
    { xp: 800, embers: 200 },
    {},
  ),
];

const HEATLINE_NODE_BY_ID = Object.fromEntries(
  HEATLINE_NODES.map((entry) => [entry.id, entry]),
);

export function getHeatlineNode(nodeId) {
  return HEATLINE_NODE_BY_ID[String(nodeId ?? "")] ?? null;
}

export function getHeatlineNodeIndex(nodeId) {
  return HEATLINE_NODES.findIndex((entry) => entry.id === nodeId);
}

export function getFirstHeatlineNodeId() {
  return HEATLINE_NODES[0].id;
}

export function getNextHeatlineNodeId(nodeId) {
  const index = getHeatlineNodeIndex(nodeId);
  if (index < 0 || index >= HEATLINE_NODES.length - 1) return null;
  return HEATLINE_NODES[index + 1].id;
}

export function createHeatlineState() {
  return {
    currentNodeId: getFirstHeatlineNodeId(),
    medals: {},
    bestScores: {},
    completions: {},
    attempts: {},
    rewardsClaimed: {},
    completedAt: {},
  };
}

export function normalizeHeatlineState(raw = {}) {
  const base = createHeatlineState();
  const source = raw && typeof raw === "object" ? raw : {};
  const cleanRecord = (value, mapFn) => {
    const out = {};
    if (!value || typeof value !== "object") return out;
    for (const [key, entry] of Object.entries(value)) {
      if (!HEATLINE_NODE_BY_ID[key]) continue;
      const mapped = mapFn(entry);
      if (mapped !== undefined) out[key] = mapped;
    }
    return out;
  };
  const medals = cleanRecord(source.medals, (entry) =>
    heatlineMedalRank(entry) >= 0 ? String(entry) : undefined,
  );
  const bestScores = cleanRecord(source.bestScores, (entry) => {
    const num = Math.max(0, Math.floor(Number(entry) || 0));
    return num > 0 ? num : undefined;
  });
  const completions = cleanRecord(source.completions, (entry) => {
    const num = Math.max(0, Math.floor(Number(entry) || 0));
    return num > 0 ? num : undefined;
  });
  const attempts = cleanRecord(source.attempts, (entry) => {
    const num = Math.max(0, Math.floor(Number(entry) || 0));
    return num > 0 ? num : undefined;
  });
  const rewardsClaimed = cleanRecord(source.rewardsClaimed, (entry) =>
    entry ? true : undefined,
  );
  const completedAt = cleanRecord(source.completedAt, (entry) => {
    const text = String(entry ?? "");
    return text ? text.slice(0, 40) : undefined;
  });
  let currentNodeId = String(source.currentNodeId ?? "");
  if (!HEATLINE_NODE_BY_ID[currentNodeId]) {
    currentNodeId = "";
  }
  if (!currentNodeId) {
    const firstOpen = HEATLINE_NODES.find((entry) => !completions[entry.id]);
    currentNodeId = firstOpen ? firstOpen.id : getFirstHeatlineNodeId();
  }
  return {
    ...base,
    currentNodeId,
    medals,
    bestScores,
    completions,
    attempts,
    rewardsClaimed,
    completedAt,
  };
}

export function isHeatlineNodeUnlocked(heatline, nodeId) {
  const index = getHeatlineNodeIndex(nodeId);
  if (index < 0) return false;
  if (index === 0) return true;
  const previous = HEATLINE_NODES[index - 1];
  return Boolean(heatline?.completions?.[previous.id]);
}

export function evaluateHeatlineMedal(nodeOrId, score) {
  const target =
    typeof nodeOrId === "string" ? getHeatlineNode(nodeOrId) : nodeOrId;
  if (!target?.medal) return "Clear";
  const value = Math.max(0, Math.floor(Number(score) || 0));
  if (value >= target.medal.inferno) return "Inferno";
  if (value >= target.medal.gold) return "Gold";
  if (value >= target.medal.silver) return "Silver";
  if (value >= target.medal.bronze) return "Bronze";
  return "Clear";
}

// Pure reducer. Returns a new heatline state plus a result summary.
// Never downgrades medals or best scores. First-clear rewards pay once.
export function applyHeatlineResult(heatline, nodeId, { won, score, now } = {}) {
  const target = getHeatlineNode(nodeId);
  const state = normalizeHeatlineState(heatline);
  if (!target) {
    return {
      state,
      medal: null,
      improvedMedal: false,
      improvedBest: false,
      firstClear: false,
      advanced: false,
      nextNodeId: null,
      reward: null,
      campaignComplete: false,
    };
  }
  const cleanScore = Math.max(0, Math.floor(Number(score) || 0));
  state.attempts[nodeId] = (state.attempts[nodeId] ?? 0) + 1;
  const previousBest = state.bestScores[nodeId] ?? 0;
  const improvedBest = cleanScore > previousBest;
  if (improvedBest) state.bestScores[nodeId] = cleanScore;
  if (!won) {
    return {
      state,
      medal: null,
      improvedMedal: false,
      improvedBest,
      firstClear: false,
      advanced: false,
      nextNodeId: null,
      reward: null,
      campaignComplete: false,
    };
  }
  const medal = evaluateHeatlineMedal(target, cleanScore);
  const previousMedal = state.medals[nodeId] ?? "";
  const improvedMedal = heatlineMedalRank(medal) > heatlineMedalRank(previousMedal);
  if (improvedMedal) state.medals[nodeId] = medal;
  const firstClear = !(state.completions[nodeId] > 0);
  state.completions[nodeId] = (state.completions[nodeId] ?? 0) + 1;
  if (firstClear) {
    state.completedAt[nodeId] = String(now ?? "");
  }
  let reward = null;
  if (firstClear && !state.rewardsClaimed[nodeId]) {
    state.rewardsClaimed[nodeId] = true;
    reward = { ...target.firstClear };
  }
  const nextNodeId = getNextHeatlineNodeId(nodeId);
  let advanced = false;
  if (state.currentNodeId === nodeId && nextNodeId) {
    state.currentNodeId = nextNodeId;
    advanced = true;
  } else if (!nextNodeId && state.currentNodeId === nodeId) {
    advanced = true;
  }
  const campaignComplete = HEATLINE_NODES.every(
    (entry) => state.completions[entry.id] > 0,
  );
  return {
    state,
    medal,
    improvedMedal,
    improvedBest,
    firstClear,
    advanced,
    nextNodeId,
    reward,
    campaignComplete,
  };
}

export function summarizeHeatline(heatline) {
  const state = normalizeHeatlineState(heatline);
  const total = HEATLINE_NODES.length;
  let completed = 0;
  const medalCounts = { Clear: 0, Bronze: 0, Silver: 0, Gold: 0, Inferno: 0 };
  HEATLINE_NODES.forEach((entry) => {
    if (state.completions[entry.id]) completed += 1;
    const medal = state.medals[entry.id];
    if (medal && medalCounts[medal] !== undefined) medalCounts[medal] += 1;
  });
  return {
    completed,
    total,
    percent: total ? completed / total : 0,
    medalCounts,
    currentNodeId: state.currentNodeId,
    campaignComplete: completed >= total,
  };
}

// ---------------------------------------------------------------------------
// RiftForge builder codec
// ---------------------------------------------------------------------------

export const RIFT_CODE_PREFIX = "ID5-RIFT";
export const RIFT_CODE_VERSION = 1;

export const RIFT_LIMITS = {
  maxPieces: 48,
  maxTitle: 40,
  coordRange: 220,
  maxCodeLength: 6000,
};

export const RIFT_PIECE_TYPES = [
  { id: "start", label: "Start Pad", max: 1 },
  { id: "finish", label: "Finish Gate", max: 2 },
  { id: "gate", label: "Checkpoint Gate", max: 24 },
  { id: "boost", label: "Boost Pad", max: 24 },
  { id: "ramp", label: "Ramp", max: 16 },
  { id: "ring", label: "Air Ring", max: 20 },
  { id: "flag", label: "Flag Home", max: 4 },
  { id: "zone", label: "Hold Zone", max: 8 },
  { id: "barrier", label: "Barrier Wall", max: 24 },
  { id: "pad", label: "Safe Pad", max: 20 },
];

const RIFT_PIECE_BY_ID = Object.fromEntries(
  RIFT_PIECE_TYPES.map((entry) => [entry.id, entry]),
);

export const RIFT_CHALLENGE_TYPES = [
  {
    id: "race-route",
    label: "Race Route",
    modeId: "race",
    requires: { start: 1, gate: 2 },
    hint: "Needs a Start plus at least 2 Checkpoint Gates. Finish Gate optional.",
  },
  {
    id: "boost-course",
    label: "Boost Course",
    modeId: "race",
    requires: { start: 1, boost: 3 },
    hint: "Needs a Start plus at least 3 Boost Pads.",
  },
  {
    id: "stunt-run",
    label: "Stunt Run",
    modeId: "stunt-park",
    requires: { start: 1, ring: 3, ramp: 1 },
    hint: "Needs a Start, 3 Air Rings, and at least 1 Ramp.",
  },
  {
    id: "flag-route",
    label: "Flag Route",
    modeId: "battle-arena",
    requires: { start: 1, flag: 1, pad: 1 },
    hint: "Needs a Start, a Flag Home, and a Safe Pad return point.",
  },
  {
    id: "zone-challenge",
    label: "Zone Challenge",
    modeId: "king-zone",
    requires: { start: 1, zone: 2 },
    hint: "Needs a Start plus at least 2 Hold Zones.",
  },
  {
    id: "lava-floor",
    label: "Lava Floor",
    modeId: "lava-floor",
    requires: { start: 1, pad: 3 },
    hint: "Needs a Start plus at least 3 Safe Pads in climb order.",
  },
];

const RIFT_TYPE_BY_ID = Object.fromEntries(
  RIFT_CHALLENGE_TYPES.map((entry) => [entry.id, entry]),
);

export function getRiftChallengeType(typeId) {
  return RIFT_TYPE_BY_ID[String(typeId ?? "")] ?? null;
}

export function createRiftPiece(typeId, x = 0, z = 0, r = 0, s = 1) {
  const range = RIFT_LIMITS.coordRange;
  return {
    t: RIFT_PIECE_BY_ID[typeId] ? typeId : "gate",
    x: Math.round(clampNumber(x, -range, range, 0)),
    z: Math.round(clampNumber(z, -range, range, 0)),
    r: Math.round(clampNumber(r, 0, 359, 0)),
    s: Math.round(clampNumber(s, 1, 3, 1)),
  };
}

export function createStarterRiftChallenge(typeId = "race-route") {
  const type = getRiftChallengeType(typeId) ?? RIFT_CHALLENGE_TYPES[0];
  const pieces = [createRiftPiece("start", 0, -60, 0)];
  if (type.id === "race-route") {
    pieces.push(
      createRiftPiece("gate", 0, 0, 0),
      createRiftPiece("gate", 40, 60, 45),
      createRiftPiece("gate", -30, 110, 315),
      createRiftPiece("boost", 0, 30, 0),
      createRiftPiece("finish", 0, 150, 0),
    );
  } else if (type.id === "boost-course") {
    pieces.push(
      createRiftPiece("boost", 0, -10, 0),
      createRiftPiece("boost", 25, 40, 0),
      createRiftPiece("boost", -25, 90, 0),
      createRiftPiece("gate", 0, 140, 0),
    );
  } else if (type.id === "stunt-run") {
    pieces.push(
      createRiftPiece("ramp", 0, -10, 0, 2),
      createRiftPiece("ring", 0, 30, 0),
      createRiftPiece("ring", 20, 70, 0),
      createRiftPiece("ring", -20, 110, 0),
    );
  } else if (type.id === "flag-route") {
    pieces.push(
      createRiftPiece("flag", 0, 120, 0),
      createRiftPiece("pad", 0, -40, 0),
      createRiftPiece("barrier", 30, 40, 90),
      createRiftPiece("barrier", -30, 40, 90),
    );
  } else if (type.id === "zone-challenge") {
    pieces.push(
      createRiftPiece("zone", 0, 40, 0, 2),
      createRiftPiece("zone", 60, 110, 0, 2),
      createRiftPiece("boost", -30, 70, 0),
    );
  } else if (type.id === "lava-floor") {
    pieces.push(
      createRiftPiece("pad", 0, -10, 0, 2),
      createRiftPiece("pad", 30, 40, 0, 2),
      createRiftPiece("pad", -20, 90, 0, 2),
      createRiftPiece("pad", 10, 140, 0, 2),
    );
  }
  return {
    v: RIFT_CODE_VERSION,
    id: `rift-${hashStringFnv1a(`${type.id}-${pieces.length}`)}`,
    title: `${type.label} Draft`,
    type: type.id,
    pieces,
  };
}

export function validateRiftChallenge(challenge) {
  const errors = [];
  if (!challenge || typeof challenge !== "object") {
    return { ok: false, errors: ["Challenge payload is missing."] };
  }
  const type = getRiftChallengeType(challenge.type);
  if (!type) errors.push("Unknown challenge type.");
  const title = sanitizeLabel(challenge.title, RIFT_LIMITS.maxTitle);
  if (!title) errors.push("Give the challenge a title.");
  const pieces = Array.isArray(challenge.pieces) ? challenge.pieces : null;
  if (!pieces) {
    errors.push("Piece list is missing.");
    return { ok: false, errors };
  }
  if (pieces.length === 0) errors.push("Add at least one piece.");
  if (pieces.length > RIFT_LIMITS.maxPieces) {
    errors.push(`Too many pieces. Limit is ${RIFT_LIMITS.maxPieces}.`);
  }
  const counts = {};
  pieces.forEach((piece, index) => {
    const def = RIFT_PIECE_BY_ID[piece?.t];
    if (!def) {
      errors.push(`Piece ${index + 1} has an unknown type.`);
      return;
    }
    counts[def.id] = (counts[def.id] ?? 0) + 1;
    const range = RIFT_LIMITS.coordRange;
    const badCoord = [piece.x, piece.z].some(
      (value) => !Number.isFinite(Number(value)) || Math.abs(Number(value)) > range,
    );
    if (badCoord) {
      errors.push(`Piece ${index + 1} (${def.label}) is outside the build area.`);
    }
  });
  Object.entries(counts).forEach(([pieceId, count]) => {
    const def = RIFT_PIECE_BY_ID[pieceId];
    if (def && count > def.max) {
      errors.push(`Too many ${def.label} pieces. Limit is ${def.max}.`);
    }
  });
  if (type) {
    Object.entries(type.requires).forEach(([pieceId, needed]) => {
      if ((counts[pieceId] ?? 0) < needed) {
        const def = RIFT_PIECE_BY_ID[pieceId];
        errors.push(
          `${type.label} needs at least ${needed} ${def?.label ?? pieceId} piece${needed > 1 ? "s" : ""}.`,
        );
      }
    });
  }
  return { ok: errors.length === 0, errors };
}

export function normalizeRiftChallenge(raw) {
  if (!raw || typeof raw !== "object") return null;
  const type = getRiftChallengeType(raw.type) ?? RIFT_CHALLENGE_TYPES[0];
  const pieces = (Array.isArray(raw.pieces) ? raw.pieces : [])
    .slice(0, RIFT_LIMITS.maxPieces)
    .map((piece) => createRiftPiece(piece?.t, piece?.x, piece?.z, piece?.r, piece?.s));
  return {
    v: RIFT_CODE_VERSION,
    id: sanitizeLabel(raw.id, 48) || `rift-${hashStringFnv1a(JSON.stringify(pieces))}`,
    title: sanitizeLabel(raw.title, RIFT_LIMITS.maxTitle) || `${type.label} Build`,
    type: type.id,
    pieces,
  };
}

export function encodeRiftShareCode(challenge) {
  const normalized = normalizeRiftChallenge(challenge);
  const validation = validateRiftChallenge(normalized);
  if (!validation.ok) {
    return { ok: false, code: null, errors: validation.errors };
  }
  const json = JSON.stringify(normalized);
  const checksum = hashStringFnv1a(json);
  const payload = toBase64Url(json);
  const code = `${RIFT_CODE_PREFIX}${RIFT_CODE_VERSION}.${checksum}.${payload}`;
  if (code.length > RIFT_LIMITS.maxCodeLength) {
    return {
      ok: false,
      code: null,
      errors: ["Challenge is too large to share. Remove some pieces."],
    };
  }
  return { ok: true, code, errors: [] };
}

export function decodeRiftShareCode(rawCode) {
  const fail = (error) => ({ ok: false, challenge: null, error });
  const code = String(rawCode ?? "").trim();
  if (!code) return fail("Paste a share code first.");
  if (code.length > RIFT_LIMITS.maxCodeLength) {
    return fail("That code is too long to be a RiftForge code.");
  }
  if (!code.startsWith(RIFT_CODE_PREFIX)) {
    return fail(`RiftForge codes start with ${RIFT_CODE_PREFIX}.`);
  }
  const body = code.slice(RIFT_CODE_PREFIX.length);
  const match = body.match(/^(\d+)\.([0-9a-f]{8})\.([A-Za-z0-9_-]+)$/);
  if (!match) return fail("That code is not a valid RiftForge share code.");
  const version = Number(match[1]);
  if (version !== RIFT_CODE_VERSION) {
    return fail(`Unsupported RiftForge code version ${version}.`);
  }
  let json = "";
  try {
    json = fromBase64Url(match[3]);
  } catch {
    return fail("The code payload is damaged and cannot be read.");
  }
  if (hashStringFnv1a(json) !== match[2]) {
    return fail("Checksum mismatch. The code was changed or copied badly.");
  }
  let parsed = null;
  try {
    parsed = JSON.parse(json);
  } catch {
    return fail("The code payload is not valid challenge data.");
  }
  const challenge = normalizeRiftChallenge(parsed);
  const validation = validateRiftChallenge(challenge);
  if (!validation.ok) {
    return fail(`Imported challenge failed validation: ${validation.errors[0]}`);
  }
  return { ok: true, challenge, error: null };
}

export function riftChallengeToRuntime(challenge) {
  const normalized = normalizeRiftChallenge(challenge);
  if (!normalized) return null;
  const type = getRiftChallengeType(normalized.type) ?? RIFT_CHALLENGE_TYPES[0];
  const grouped = {
    start: null,
    finish: [],
    gates: [],
    boosts: [],
    ramps: [],
    rings: [],
    flags: [],
    zones: [],
    barriers: [],
    pads: [],
  };
  normalized.pieces.forEach((piece) => {
    const entry = { x: piece.x, z: piece.z, r: piece.r, s: piece.s };
    if (piece.t === "start" && !grouped.start) grouped.start = entry;
    else if (piece.t === "finish") grouped.finish.push(entry);
    else if (piece.t === "gate") grouped.gates.push(entry);
    else if (piece.t === "boost") grouped.boosts.push(entry);
    else if (piece.t === "ramp") grouped.ramps.push(entry);
    else if (piece.t === "ring") grouped.rings.push(entry);
    else if (piece.t === "flag") grouped.flags.push(entry);
    else if (piece.t === "zone") grouped.zones.push(entry);
    else if (piece.t === "barrier") grouped.barriers.push(entry);
    else if (piece.t === "pad") grouped.pads.push(entry);
  });
  return {
    id: normalized.id,
    title: normalized.title,
    typeId: type.id,
    modeId: type.modeId,
    seed: parseInt(hashStringFnv1a(`${normalized.id}:${normalized.pieces.length}`), 16),
    ...grouped,
  };
}

// ---------------------------------------------------------------------------
// Audio event catalog (pure list, used for diagnostics and smoke proof)
// ---------------------------------------------------------------------------

export const ID5_AUDIO_EVENTS = [
  "ui-click",
  "ui-tab",
  "countdown",
  "go",
  "boost-start",
  "boost-pad",
  "jump",
  "land",
  "land-hard",
  "collision",
  "checkpoint",
  "ring",
  "goal",
  "flag-pickup",
  "flag-score",
  "zone-hold",
  "bowling-strike",
  "lava-warning",
  "hunter-danger",
  "stuck-warning",
  "medal",
  "reward",
  "level-up",
  "run-complete",
  "run-failed",
];
