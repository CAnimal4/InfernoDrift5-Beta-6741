export type MachineState =
  | "boot"
  | "title"
  | "guest"
  | "menu"
  | "garage"
  | "matchmaking"
  | "lobby"
  | "loading"
  | "playing"
  | "paused"
  | "replay"
  | "results"
  | "rewards"
  | "offline"
  | "error";

export type ModeId =
  | "tutorial"
  | "campaign"
  | "max"
  | "race"
  | "time-trial"
  | "stunt"
  | "hunter"
  | "boss"
  | "drift-score"
  | "battle"
  | "ramp-rush"
  | "boost-bowling"
  | "lava-floor"
  | "king-zone"
  | "trick-combo"
  | "bot-escape";

export type CarClassId =
  | "balanced"
  | "lightweight"
  | "bruiser"
  | "stunt"
  | "speed";

export type BotPersonality =
  | "rammer"
  | "predictor"
  | "blocker"
  | "stalker"
  | "sprinter"
  | "boss";

export interface InputFrame {
  throttle: number;
  steer: number;
  drift: boolean;
  boost: boolean;
  jump: boolean;
  backflip: boolean;
}

export interface Vehicle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  heading: number;
  speed: number;
  boost: number;
  shield: number;
  lives: number;
  airborne: boolean;
  airTime: number;
  trickCharge: number;
  landingBoost: number;
  driftCombo: number;
  driftScore: number;
  classId: CarClassId;
  lastLanding: LandingGrade | null;
  nearMissTimer: number;
}

export interface Bot {
  id: number;
  role: string;
  personality: BotPersonality;
  team: "blue" | "red" | "hunter";
  x: number;
  z: number;
  heading: number;
  speed: number;
  cooldown: number;
}

export interface Ball {
  x: number;
  z: number;
  vx: number;
  vz: number;
}

export interface ObjectiveMarker {
  id: string;
  x: number;
  z: number;
  radius: number;
  kind: "checkpoint" | "target" | "zone" | "hazard" | "gate";
  active: boolean;
  complete: boolean;
}

export interface ObjectiveState {
  label: string;
  help: string;
  progress: number;
  target: number;
  complete: boolean;
  failReason: string | null;
  markerIndex: number;
}

export interface RadarEntity {
  id: string;
  kind: string;
  label: string;
  right: number;
  forward: number;
  sector: "front" | "rear" | "left" | "right";
  edge: boolean;
  distance: number;
  bearing: number;
  priority: number;
  threat: number;
  closingSpeed: number;
  screenX: number;
  screenY: number;
  status: "near" | "mid" | "far" | "edge";
  team: Bot["team"] | "neutral";
  active: boolean;
}

export interface ProgressionState {
  xp: number;
  level: number;
  medals: Record<string, string>;
  unlocked: string[];
  rewardLog: string[];
  dailySeed: string;
  weeklySeed: string;
}

export interface GameState {
  schemaVersion: 2;
  machine: MachineState;
  mode: ModeId;
  baseMode: "infernodrift33" | "infernodriftmax1";
  elapsed: number;
  timeRemaining: number;
  score: number;
  combo: number;
  world: string;
  player: Vehicle;
  bots: Bot[];
  ball: Ball | null;
  markers: ObjectiveMarker[];
  objective: ObjectiveState;
  radar: RadarEntity[];
  replay: {
    active: boolean;
    meta: string;
    timer: number;
  };
  stats: {
    goalsBlue: number;
    goalsRed: number;
    demolitions: number;
    nearMisses: number;
    landings: number;
    shots: number;
  };
  progression: ProgressionState;
  online: {
    status: "offline" | "connecting" | "live" | "error";
    roomCode: string | null;
    latencyMs: number;
  };
}

export type LandingGrade = "rough" | "clean" | "perfect" | "inferno";

const WORLD_HALF = 220;
const DT = 1 / 60;
const RADAR_RANGE = 180;

export const MODE_META: Record<
  ModeId,
  {
    label: string;
    baseMode: GameState["baseMode"];
    help: string;
    target: number;
  }
> = {
  tutorial: {
    label: "First Ignition",
    baseMode: "infernodrift33",
    help: "Steer, drift, boost, jump, land clean, then clear the final gate.",
    target: 7,
  },
  campaign: {
    label: "Campaign Survival",
    baseMode: "infernodrift33",
    help: "Survive hunter pressure, clear objectives, and bank medals.",
    target: 90,
  },
  max: {
    label: "Max Arena",
    baseMode: "infernodriftmax1",
    help: "Hit the ball into the red goal while team bots rotate.",
    target: 3,
  },
  race: {
    label: "Race",
    baseMode: "infernodrift33",
    help: "Hit checkpoints fast and keep a clean line.",
    target: 6,
  },
  "time-trial": {
    label: "Time Trial",
    baseMode: "infernodrift33",
    help: "Beat the ghost split and finish with clean checkpoints.",
    target: 6,
  },
  stunt: {
    label: "Stunt Park",
    baseMode: "infernodrift33",
    help: "Chain ramps, backflips, drifts, and landing grades.",
    target: 8,
  },
  hunter: {
    label: "Hunter Tag",
    baseMode: "infernodrift33",
    help: "Thread escape gates while hunters close from off-screen.",
    target: 5,
  },
  boss: {
    label: "Boss Chase",
    baseMode: "infernodrift33",
    help: "Survive a readable boss pattern and punish weak moments.",
    target: 4,
  },
  "drift-score": {
    label: "Drift Score Attack",
    baseMode: "infernodrift33",
    help: "Hold long drifts, near misses, and multiplier chains.",
    target: 2500,
  },
  battle: {
    label: "Battle Arena",
    baseMode: "infernodriftmax1",
    help: "Win by hits, pickups, and ball pressure before stocks run out.",
    target: 5,
  },
  "ramp-rush": {
    label: "Ramp Rush",
    baseMode: "infernodrift33",
    help: "Hit ramp gates in sequence and land for boost medals.",
    target: 7,
  },
  "boost-bowling": {
    label: "Boost Bowling",
    baseMode: "infernodrift33",
    help: "Use boost lanes to smash target pins.",
    target: 10,
  },
  "lava-floor": {
    label: "Lava Floor",
    baseMode: "infernodrift33",
    help: "Move between safe zones before heat rises.",
    target: 45,
  },
  "king-zone": {
    label: "King of the Zone",
    baseMode: "infernodrift33",
    help: "Hold the zone while drifting and fending off bots.",
    target: 30,
  },
  "trick-combo": {
    label: "Trick Combo",
    baseMode: "infernodrift33",
    help: "Chain flips, drifts, near misses, and perfect landings.",
    target: 12,
  },
  "bot-escape": {
    label: "Bot Escape",
    baseMode: "infernodrift33",
    help: "Survive escalating hunter waves through decoy gates.",
    target: 60,
  },
};

const MODE_TIME_LIMITS: Record<ModeId, number> = {
  tutorial: 180,
  campaign: 120,
  max: 240,
  race: 105,
  "time-trial": 70,
  stunt: 120,
  hunter: 95,
  boss: 140,
  "drift-score": 95,
  battle: 180,
  "ramp-rush": 85,
  "boost-bowling": 80,
  "lava-floor": 52,
  "king-zone": 90,
  "trick-combo": 100,
  "bot-escape": 70,
};

const MODE_REWARDS: Record<ModeId, string[]> = {
  tutorial: ["campaign-license", "radar-basics"],
  campaign: ["hunter-briefing", "ember-rims"],
  max: ["max-arena-kit", "blue-team-decal"],
  race: ["speed-car"],
  "time-trial": ["ghost-splits", "chrono-trail"],
  stunt: ["stunt-car", "air-control-kit"],
  hunter: ["decoy-gates", "hunter-tag-card"],
  boss: ["abyssal-crown", "boss-flames"],
  "drift-score": ["ember-trail", "combo-meter-plus"],
  battle: ["bruiser-class", "arena-shield"],
  "ramp-rush": ["ramp-rush-ticket", "landing-boost-tune"],
  "boost-bowling": ["pin-crusher-horn", "boost-lane-paint"],
  "lava-floor": ["magma-tires", "heat-shield"],
  "king-zone": ["zone-crown", "control-aura"],
  "trick-combo": ["trick-chain-livery", "showoff-exhaust"],
  "bot-escape": ["escape-smoke", "bot-decoy"],
};

const MODE_MEDAL_SCORES: Record<
  ModeId,
  { bronze: number; silver: number; gold: number; inferno: number }
> = {
  tutorial: { bronze: 500, silver: 900, gold: 1300, inferno: 1800 },
  campaign: { bronze: 900, silver: 1600, gold: 2500, inferno: 3600 },
  max: { bronze: 600, silver: 1200, gold: 1900, inferno: 2800 },
  race: { bronze: 700, silver: 1350, gold: 2100, inferno: 3100 },
  "time-trial": { bronze: 800, silver: 1600, gold: 2600, inferno: 3800 },
  stunt: { bronze: 900, silver: 1800, gold: 3000, inferno: 4600 },
  hunter: { bronze: 850, silver: 1550, gold: 2400, inferno: 3500 },
  boss: { bronze: 1000, silver: 1900, gold: 3000, inferno: 4500 },
  "drift-score": { bronze: 1200, silver: 2500, gold: 4200, inferno: 6500 },
  battle: { bronze: 800, silver: 1500, gold: 2400, inferno: 3600 },
  "ramp-rush": { bronze: 900, silver: 1700, gold: 2700, inferno: 4000 },
  "boost-bowling": { bronze: 700, silver: 1400, gold: 2300, inferno: 3400 },
  "lava-floor": { bronze: 800, silver: 1450, gold: 2200, inferno: 3200 },
  "king-zone": { bronze: 850, silver: 1550, gold: 2500, inferno: 3700 },
  "trick-combo": { bronze: 1100, silver: 2200, gold: 3600, inferno: 5400 },
  "bot-escape": { bronze: 900, silver: 1700, gold: 2600, inferno: 3900 },
};

export const CAR_CLASSES: Record<
  CarClassId,
  {
    label: string;
    accel: number;
    maxSpeed: number;
    grip: number;
    drift: number;
    mass: number;
    air: number;
  }
> = {
  balanced: {
    label: "Balanced Street",
    accel: 92,
    maxSpeed: 142,
    grip: 1,
    drift: 1,
    mass: 1,
    air: 1,
  },
  lightweight: {
    label: "Lightweight Drift",
    accel: 104,
    maxSpeed: 136,
    grip: 0.92,
    drift: 1.22,
    mass: 0.75,
    air: 1.12,
  },
  bruiser: {
    label: "Heavy Bruiser",
    accel: 74,
    maxSpeed: 128,
    grip: 1.08,
    drift: 0.86,
    mass: 1.45,
    air: 0.82,
  },
  stunt: {
    label: "Stunt Car",
    accel: 90,
    maxSpeed: 134,
    grip: 0.96,
    drift: 1.06,
    mass: 0.95,
    air: 1.42,
  },
  speed: {
    label: "Speed Car",
    accel: 86,
    maxSpeed: 166,
    grip: 0.84,
    drift: 0.96,
    mass: 0.9,
    air: 1,
  },
};

export function createInitialGameState(mode: ModeId = "tutorial"): GameState {
  const meta = MODE_META[mode];
  const player = createVehicle(classForMode(mode));
  const state: GameState = {
    schemaVersion: 2,
    machine: "title",
    mode,
    baseMode: meta.baseMode,
    elapsed: 0,
    timeRemaining: MODE_TIME_LIMITS[mode],
    score: 0,
    combo: 1,
    world: worldForMode(mode),
    player,
    bots: createBots(mode),
    ball:
      meta.baseMode === "infernodriftmax1"
        ? { x: 0, z: 0, vx: 0, vz: 0 }
        : null,
    markers: createMarkers(mode),
    objective: {
      label: meta.label,
      help: meta.help,
      progress: 0,
      target: meta.target,
      complete: false,
      failReason: null,
      markerIndex: 0,
    },
    radar: [],
    replay: { active: false, meta: "", timer: 0 },
    stats: {
      goalsBlue: 0,
      goalsRed: 0,
      demolitions: 0,
      nearMisses: 0,
      landings: 0,
      shots: 0,
    },
    progression: createProgression(),
    online: { status: "offline", roomCode: null, latencyMs: 0 },
  };
  state.radar = createRadar(state);
  return state;
}

export function startGame(state: GameState, mode = state.mode): GameState {
  const next = createInitialGameState(mode);
  next.machine = "playing";
  next.progression = state.progression;
  next.online = { ...state.online };
  return next;
}

export function stepGame(
  state: GameState,
  input: InputFrame,
  dt = DT,
): GameState {
  if (state.machine !== "playing" && state.machine !== "replay") {
    state.radar = createRadar(state);
    return state;
  }
  const clampedDt = Math.min(0.05, Math.max(0, dt));
  if (state.replay.active) {
    state.replay.timer -= clampedDt;
    if (state.replay.timer <= 0) {
      state.replay.active = false;
      state.machine = "playing";
    } else {
      state.elapsed += clampedDt;
      state.timeRemaining = Math.max(0, state.timeRemaining - clampedDt);
      state.radar = createRadar(state);
      return state;
    }
  }
  state.elapsed += clampedDt;
  state.timeRemaining = Math.max(0, state.timeRemaining - clampedDt);
  updatePlayer(state, input, clampedDt);
  updateBots(state, clampedDt);
  updateBall(state, clampedDt);
  updateObjectives(state, input, clampedDt);
  if (
    state.machine === "playing" &&
    state.timeRemaining <= 0 &&
    !state.objective.complete
  ) {
    completeRun(state, didWinOnTimeout(state), timeoutReason(state));
  }
  state.radar = createRadar(state);
  return state;
}

export function cloneGameState(state: GameState): GameState {
  return {
    ...state,
    player: { ...state.player },
    bots: state.bots.map((bot) => ({ ...bot })),
    ball: state.ball ? { ...state.ball } : null,
    markers: state.markers.map((marker) => ({ ...marker })),
    objective: { ...state.objective },
    radar: state.radar.map((entity) => ({ ...entity })),
    replay: { ...state.replay },
    stats: { ...state.stats },
    progression: {
      ...state.progression,
      medals: { ...state.progression.medals },
      unlocked: [...state.progression.unlocked],
      rewardLog: [...state.progression.rewardLog],
    },
    online: { ...state.online },
  };
}

export function createRadar(state: GameState): RadarEntity[] {
  const heading = state.player.heading;
  const sin = Math.sin(heading);
  const cos = Math.cos(heading);
  const entities: Array<{
    id: string;
    kind: string;
    label: string;
    x: number;
    z: number;
    vx: number;
    vz: number;
    priority: number;
    threat: number;
    team: RadarEntity["team"];
    active: boolean;
  }> = [];
  if (state.ball)
    entities.push({
      id: "ball",
      kind: "ball",
      label: "Ball",
      x: state.ball.x,
      z: state.ball.z,
      vx: state.ball.vx,
      vz: state.ball.vz,
      priority: state.mode === "max" || state.mode === "battle" ? 95 : 45,
      threat: 0.15,
      team: "neutral",
      active: true,
    });
  for (const bot of state.bots) {
    const botThreat = radarThreatForBot(state, bot);
    entities.push({
      id: `bot-${bot.id}`,
      kind: bot.role,
      label: `${bot.personality} ${bot.role}`,
      x: bot.x,
      z: bot.z,
      vx: Math.sin(bot.heading) * bot.speed,
      vz: Math.cos(bot.heading) * bot.speed,
      priority: 60 + botThreat * 35 + (bot.personality === "boss" ? 25 : 0),
      threat: botThreat,
      team: bot.team,
      active: true,
    });
  }
  for (const marker of state.markers.filter(
    (marker) => marker.active && !marker.complete,
  )) {
    const isCurrentMarker =
      marker.id === state.markers[state.objective.markerIndex]?.id;
    entities.push({
      id: marker.id,
      kind: marker.kind,
      label: markerLabel(marker, state),
      x: marker.x,
      z: marker.z,
      vx: 0,
      vz: 0,
      priority: isCurrentMarker ? 88 : marker.kind === "hazard" ? 75 : 52,
      threat: marker.kind === "hazard" ? 0.9 : 0,
      team: "neutral",
      active: marker.active,
    });
  }
  return entities
    .map((entity) => {
      const dx = entity.x - state.player.x;
      const dz = entity.z - state.player.z;
      const right = dx * cos - dz * sin;
      const forward = dx * sin + dz * cos;
      const distance = Math.hypot(right, forward);
      const edge = distance > RADAR_RANGE;
      const scaledDistance = Math.max(1, distance);
      const closingSpeed =
        ((state.player.vx - entity.vx) * dx +
          (state.player.vz - entity.vz) * dz) /
        scaledDistance;
      const screenScale = Math.min(1, RADAR_RANGE / scaledDistance);
      const sector: RadarEntity["sector"] =
        Math.abs(forward) >= Math.abs(right)
          ? forward >= 0
            ? "front"
            : "rear"
          : right >= 0
            ? "right"
            : "left";
      const status: RadarEntity["status"] = edge
        ? "edge"
        : distance < 45
          ? "near"
          : distance < 115
            ? "mid"
            : "far";
      return {
        id: entity.id,
        kind: entity.kind,
        label: entity.label,
        right: round(right),
        forward: round(forward),
        sector,
        edge,
        distance: round(distance),
        bearing: round(Math.atan2(right, forward), 3),
        priority: round(entity.priority),
        threat: round(entity.threat, 2),
        closingSpeed: round(closingSpeed),
        screenX: round((right / RADAR_RANGE) * screenScale, 3),
        screenY: round((forward / RADAR_RANGE) * screenScale, 3),
        status,
        team: entity.team,
        active: entity.active,
      };
    })
    .sort((a, b) => b.priority - a.priority || a.distance - b.distance);
}

export function migrateSave(value: unknown): {
  schemaVersion: 2;
  progression: ProgressionState;
} {
  const fallback = {
    schemaVersion: 2 as const,
    progression: createProgression(),
  };
  if (!value || typeof value !== "object") return fallback;
  const record = value as {
    schemaVersion?: unknown;
    progression?: Partial<ProgressionState>;
  };
  return {
    schemaVersion: 2,
    progression: {
      ...fallback.progression,
      ...(record.progression ?? {}),
      medals: { ...(record.progression?.medals ?? {}) },
      unlocked: Array.isArray(record.progression?.unlocked)
        ? record.progression!.unlocked!
        : fallback.progression.unlocked,
      rewardLog: Array.isArray(record.progression?.rewardLog)
        ? record.progression!.rewardLog!
        : fallback.progression.rewardLog,
    },
  };
}

export function awardFounderBadge(
  username: string,
  progression: ProgressionState,
): ProgressionState {
  if (username !== "Clark" || progression.unlocked.includes("founder-badge"))
    return progression;
  return {
    ...progression,
    unlocked: [...progression.unlocked, "founder-badge"],
  };
}

function createVehicle(classId: CarClassId): Vehicle {
  return {
    x: 0,
    y: 0,
    z: -118,
    vx: 0,
    vy: 0,
    vz: 0,
    heading: 0,
    speed: 0,
    boost: 1,
    shield: 1,
    lives: 5,
    airborne: false,
    airTime: 0,
    trickCharge: 0,
    landingBoost: 0,
    driftCombo: 1,
    driftScore: 0,
    classId,
    lastLanding: null,
    nearMissTimer: 0,
  };
}

function createProgression(): ProgressionState {
  return {
    xp: 0,
    level: 1,
    medals: {},
    unlocked: ["balanced", "basic-wheels", "ember-paint", "quick-chat"],
    rewardLog: [],
    dailySeed: new Date().toISOString().slice(0, 10),
    weeklySeed: weeklySeed(new Date()),
  };
}

function createBots(mode: ModeId): Bot[] {
  const personalities = botPersonalitiesForMode(mode);
  return personalities.map((personality, index) => ({
    id: index + 1,
    role:
      personality === "boss"
        ? "boss"
        : mode === "max" || mode === "battle"
          ? ["goalie", "wing", "striker", "support", "defender", "sweeper"][
              index
            ]
          : botRoleForMode(mode, personality, index),
    personality,
    team:
      mode === "max" || mode === "battle"
        ? index < 3
          ? "blue"
          : "red"
        : "hunter",
    x: (index - personalities.length / 2) * 26,
    z:
      mode === "max" || mode === "battle"
        ? index < 3
          ? -80
          : 80
        : mode === "tutorial" || mode === "race" || mode === "time-trial"
          ? 120 + index * 24
          : 30 + index * 26,
    heading: Math.PI,
    speed: 0,
    cooldown: 0,
  }));
}

function createMarkers(mode: ModeId): ObjectiveMarker[] {
  if (mode === "max") return [];
  if (mode === "king-zone")
    return [
      {
        id: "king-zone-0",
        x: 0,
        z: 18,
        radius: 42,
        kind: "zone",
        active: true,
        complete: false,
      },
    ];
  const count = markerCountForMode(mode);
  return Array.from({ length: count }, (_, index) => {
    const angle =
      (index / count) * Math.PI * 2 + (mode.includes("rush") ? 0.2 : -0.5);
    const radius =
      mode === "boss"
        ? 92
        : mode === "lava-floor"
          ? 82
          : mode === "boost-bowling"
            ? 64 + (index % 3) * 22
            : 70 + index * 13;
    return {
      id: `${mode}-${index}`,
      x: Math.sin(angle) * radius,
      z: Math.cos(angle) * radius,
      radius:
        mode === "lava-floor"
          ? 30
          : mode === "boost-bowling"
            ? 16
            : mode === "boss"
              ? 18
              : 14,
      kind: markerKindForMode(mode),
      active: initialMarkerActive(mode, index),
      complete: false,
    };
  });
}

function updatePlayer(state: GameState, input: InputFrame, dt: number): void {
  const car = state.player;
  const spec = CAR_CLASSES[car.classId];
  const airborne = car.y > 0.04 || car.airborne;
  const throttle = clamp(input.throttle, -1, 1);
  const throttleAbs = Math.abs(throttle);
  const boostActive = input.boost && car.boost > 0.015;
  const driftActive = input.drift && !airborne && Math.abs(car.speed) > 14;
  const boostDirection = Math.sign(car.speed) || Math.sign(throttle) || 1;
  const launchAssist =
    throttleAbs > 0.05 && Math.abs(car.speed) < 24
      ? throttle * (22 / Math.sqrt(spec.mass))
      : 0;
  const landingPush = car.landingBoost > 0 ? 38 * boostDirection : 0;
  const boostKick = boostActive
    ? boostDirection * (104 + clamp(car.driftCombo - 1, 0, 4) * 7)
    : 0;
  const accel =
    throttle * spec.accel * (1.08 / Math.sqrt(spec.mass)) +
    boostKick +
    landingPush -
    brakingForce(car.speed, throttle, airborne) +
    launchAssist;
  const grip = coastGrip(state.mode, spec, driftActive, airborne, throttleAbs);
  car.landingBoost = Math.max(0, car.landingBoost - dt);
  car.speed += accel * dt;
  car.speed *= Math.pow(grip, dt * 60);
  if (!airborne && throttleAbs < 0.05 && Math.abs(car.speed) < 3.2)
    car.speed = 0;
  car.speed = clamp(
    car.speed,
    -48,
    spec.maxSpeed * (boostActive ? 1.28 : 1) + Math.abs(landingPush),
  );
  const turnPower =
    (airborne
      ? spec.air * 0.95
      : driftActive
        ? 2.05 * spec.drift
        : 1.16 * spec.grip) *
    input.steer *
    (boostActive && !driftActive ? 0.94 : 1);
  car.heading += turnPower * dt * clamp(Math.abs(car.speed) / 44, 0.22, 2.6);
  if (boostActive) {
    car.boost = Math.max(0, car.boost - dt * 0.3);
    state.score += dt * (24 + Math.max(0, car.driftCombo - 1) * 8);
  } else {
    car.boost = Math.min(1, car.boost + dt * (driftActive ? 0.16 : 0.045));
  }
  const forwardX = Math.sin(car.heading);
  const forwardZ = Math.cos(car.heading);
  car.vx = forwardX * car.speed;
  car.vz = forwardZ * car.speed;
  car.x += car.vx * dt;
  car.z += car.vz * dt;
  if (input.jump && !airborne && Math.abs(car.speed) > 8) {
    car.vy = 38 + clamp(Math.abs(car.speed) * 0.11, 0, 18);
    car.airborne = true;
    car.trickCharge = Math.min(2.5, car.trickCharge + 0.18);
    if (isAirScoringMode(state.mode)) state.score += 60;
  }
  if (input.backflip && airborne) {
    car.vy += 9 * spec.air * dt;
    car.trickCharge = Math.min(2.5, car.trickCharge + dt * spec.air * 2.8);
    state.score += dt * 160;
    car.driftCombo += dt * 0.9;
  }
  updateRampAndVertical(state, input, dt);
  if (driftActive) {
    const steerCommitment = clamp(Math.abs(input.steer), 0.25, 1);
    car.driftCombo = Math.min(
      9.9,
      car.driftCombo +
        dt * (1.8 + steerCommitment * 1.7 + (boostActive ? 0.35 : 0)),
    );
    const driftGain =
      dt *
      Math.abs(car.speed) *
      car.driftCombo *
      (1.1 + steerCommitment * 0.45);
    car.driftScore += driftGain;
    state.score += dt * 42 * car.driftCombo + driftGain * 0.05;
  } else {
    car.driftCombo = Math.max(1, car.driftCombo - dt * 0.9);
  }
  state.combo = round(car.driftCombo, 2);
  if (Math.abs(car.x) > WORLD_HALF) {
    car.x = clamp(car.x, -WORLD_HALF, WORLD_HALF);
    car.speed *= -0.34;
  }
  if (Math.abs(car.z) > WORLD_HALF) {
    car.z = clamp(car.z, -WORLD_HALF, WORLD_HALF);
    car.speed *= -0.34;
  }
}

function updateRampAndVertical(
  state: GameState,
  input: InputFrame,
  dt: number,
): void {
  const car = state.player;
  const nextMarker = state.markers[state.objective.markerIndex];
  const rampNear =
    nextMarker &&
    nextMarker.kind === "checkpoint" &&
    distance2(car.x, car.z, nextMarker.x, nextMarker.z) < 18;
  if (
    rampNear &&
    !car.airborne &&
    ["stunt", "ramp-rush", "trick-combo"].includes(state.mode)
  ) {
    car.vy = 46 + Math.min(22, Math.abs(car.speed) * 0.18);
    car.airborne = true;
    car.trickCharge = Math.min(2.5, car.trickCharge + 0.22);
  }
  if (car.airborne || car.y > 0) {
    car.airTime += dt;
    if (isAirScoringMode(state.mode)) {
      const controlBonus = input.backflip ? 58 : input.drift ? 28 : 16;
      state.score += dt * (controlBonus + car.trickCharge * 32);
      if (input.drift)
        car.trickCharge = Math.min(2.5, car.trickCharge + dt * 0.7);
    }
    car.vy -= 94 * dt;
    car.y += car.vy * dt;
    if (car.y <= 0) {
      const impact = Math.abs(car.vy);
      car.y = 0;
      car.vy = 0;
      car.airborne = false;
      awardLanding(state, impact, input);
      car.airTime = 0;
      car.trickCharge = 0;
    }
  }
}

function updateBots(state: GameState, dt: number): void {
  for (const bot of state.bots) {
    bot.cooldown = Math.max(0, bot.cooldown - dt);
    const target = botTarget(state, bot);
    const dx = target.x - bot.x;
    const dz = target.z - bot.z;
    const desired = Math.atan2(dx, dz);
    const turnLimit =
      dt *
      (bot.personality === "sprinter"
        ? 2
        : bot.personality === "blocker"
          ? 1.8
          : bot.personality === "boss"
            ? 1.55
            : bot.personality === "rammer"
              ? 2.75
              : 2.4);
    bot.heading += clamp(
      angleDiff(desired, bot.heading),
      -turnLimit,
      turnLimit,
    );
    const speedScale =
      bot.personality === "boss"
        ? 1.18
        : bot.personality === "sprinter"
          ? 1.24
          : bot.personality === "rammer"
            ? 1.14
            : bot.personality === "predictor"
              ? 1.04
              : bot.personality === "stalker"
                ? 0.78
                : bot.personality === "blocker"
                  ? 0.92
                  : 1;
    const pressure = botPressureForMode(state.mode, state.elapsed);
    bot.speed += (58 * speedScale * pressure - bot.speed) * dt * 1.4;
    bot.x += Math.sin(bot.heading) * bot.speed * dt;
    bot.z += Math.cos(bot.heading) * bot.speed * dt;
    bot.x = clamp(bot.x, -WORLD_HALF, WORLD_HALF);
    bot.z = clamp(bot.z, -WORLD_HALF, WORLD_HALF);
    const dist = Math.hypot(bot.x - state.player.x, bot.z - state.player.z);
    if (
      state.mode === "battle" &&
      dist < 18 &&
      Math.abs(state.player.speed) > Math.max(46, bot.speed * 0.65) &&
      bot.cooldown <= 0
    ) {
      state.stats.demolitions += 1;
      state.objective.progress = Math.min(
        state.objective.target,
        state.objective.progress + 1,
      );
      state.score += 260 + Math.round(Math.abs(state.player.speed));
      state.player.boost = Math.min(1, state.player.boost + 0.18);
      bot.cooldown = 1.4;
      respawnBot(bot, state.stats.demolitions);
    } else if (dist < 17) {
      const damageRate = botDamageRate(bot, state.mode);
      state.player.shield = Math.max(
        0,
        state.player.shield -
          dt * damageRate * (state.player.nearMissTimer > 0 ? 0.72 : 1),
      );
      state.player.driftCombo = Math.max(1, state.player.driftCombo - dt * 1.4);
      if (state.player.shield <= 0) {
        state.player.lives = Math.max(0, state.player.lives - 1);
        state.player.shield = 1;
        if (state.player.lives <= 0)
          completeRun(state, false, botFailureReason(state.mode, bot));
      }
    } else if (
      dist < nearMissRadiusForMode(state.mode) &&
      state.player.speed > 38 &&
      bot.cooldown <= 0
    ) {
      state.stats.nearMisses += 1;
      state.player.nearMissTimer = 0.5;
      bot.cooldown = 0.72;
      const nearMissScore =
        state.mode === "drift-score" || state.mode === "trick-combo"
          ? 160
          : state.mode === "hunter" || state.mode === "bot-escape"
            ? 130
            : 90;
      const styleMultiplier =
        1 +
        clamp(state.player.driftCombo - 1, 0, 4) * 0.18 +
        (state.player.airborne ? 0.35 : 0);
      state.score += Math.round(nearMissScore * styleMultiplier);
      state.player.boost = Math.min(1, state.player.boost + 0.12);
      state.player.driftCombo = Math.min(9.9, state.player.driftCombo + 0.22);
      if (state.mode === "drift-score")
        state.player.driftScore += nearMissScore * styleMultiplier;
      if (state.mode === "trick-combo")
        state.objective.progress = Math.min(
          state.objective.target,
          state.objective.progress + 0.45,
        );
      if (state.mode === "hunter" || state.mode === "bot-escape")
        state.objective.progress = Math.min(
          state.objective.target,
          state.objective.progress + 0.35,
        );
    }
  }
  state.player.nearMissTimer = Math.max(0, state.player.nearMissTimer - dt);
}

function updateBall(state: GameState, dt: number): void {
  if (!state.ball) return;
  const ball = state.ball;
  const px = state.player.x - ball.x;
  const pz = state.player.z - ball.z;
  const dist = Math.hypot(px, pz);
  if (dist < 18) {
    const shotStyle =
      1 +
      (state.player.boost > 0.02 ? 0.18 : 0) +
      (state.player.driftCombo > 1.25 ? 0.14 : 0);
    const force = Math.max(48, Math.abs(state.player.speed) * 1.45 * shotStyle);
    ball.vx -= (px / Math.max(1, dist)) * force;
    ball.vz -= (pz / Math.max(1, dist)) * force;
    state.stats.shots += 1;
    state.score += 45 + Math.round(Math.abs(state.player.speed) * 0.45);
    if (state.mode === "battle")
      state.objective.progress = Math.min(
        state.objective.target,
        state.objective.progress + 0.08,
      );
  }
  for (const bot of state.bots) {
    const dx = bot.x - ball.x;
    const dz = bot.z - ball.z;
    const d = Math.hypot(dx, dz);
    if (d < 15) {
      ball.vx -= (dx / Math.max(1, d)) * 34;
      ball.vz -= (dz / Math.max(1, d)) * 34;
    }
  }
  ball.x += ball.vx * dt;
  ball.z += ball.vz * dt;
  ball.vx *= Math.pow(0.988, dt * 60);
  ball.vz *= Math.pow(0.988, dt * 60);
  if (Math.abs(ball.x) > WORLD_HALF - 18) {
    ball.x = clamp(ball.x, -WORLD_HALF + 18, WORLD_HALF - 18);
    ball.vx *= -0.72;
  }
  if (ball.z > WORLD_HALF - 12 || ball.z < -WORLD_HALF + 12) {
    if (Math.abs(ball.x) < 62) {
      const scorer = ball.z > 0 ? "blue" : "red";
      if (scorer === "blue") {
        state.stats.goalsBlue += 1;
        state.objective.progress += state.mode === "battle" ? 0.7 : 1;
        state.score += state.mode === "battle" ? 180 : 320;
        state.player.boost = Math.min(1, state.player.boost + 0.25);
      } else {
        state.stats.goalsRed += 1;
        state.score = Math.max(0, state.score - 120);
        state.player.shield = Math.max(0, state.player.shield - 0.18);
      }
      state.replay = { active: true, meta: "Goal replay", timer: 2.2 };
      state.machine = "replay";
      ball.x = 0;
      ball.z = 0;
      ball.vx = 0;
      ball.vz = 0;
      if (state.stats.goalsRed >= state.objective.target) {
        completeRun(
          state,
          false,
          "The red team reached the goal target first. Rotate back sooner.",
        );
      } else if (state.objective.progress >= state.objective.target) {
        completeRun(state, true);
      }
    } else {
      ball.z = clamp(ball.z, -WORLD_HALF + 12, WORLD_HALF - 12);
      ball.vz *= -0.72;
    }
  }
}

function updateObjectives(
  state: GameState,
  input: InputFrame,
  dt: number,
): void {
  const objective = state.objective;
  if (objective.complete) return;
  updateModePassiveObjective(state, input, dt);
  if (state.machine === "results") return;
  const marker = hitMarker(state);
  if (marker) handleMarkerHit(state, marker, input);
  if (objective.progress >= objective.target) completeRun(state, true);
}

function updateModePassiveObjective(
  state: GameState,
  input: InputFrame,
  dt: number,
): void {
  const objective = state.objective;
  switch (state.mode) {
    case "tutorial":
      updateTutorialObjective(state, input);
      break;
    case "campaign":
      objective.progress = Math.min(
        objective.target,
        objective.progress + dt * (state.player.shield > 0.55 ? 1 : 0.65),
      );
      state.score += dt * (state.player.nearMissTimer > 0 ? 42 : 14);
      break;
    case "drift-score":
      objective.progress = Math.min(
        objective.target,
        Math.max(
          objective.progress,
          state.player.driftScore +
            state.stats.nearMisses * 190 +
            state.stats.landings * 130 +
            state.player.trickCharge * 85,
        ),
      );
      break;
    case "battle":
      updateBattlePressureObjective(state, dt);
      break;
    case "lava-floor":
      updateLavaFloorObjective(state, dt);
      break;
    case "king-zone":
      updateKingZoneObjective(state, input, dt);
      break;
    case "trick-combo":
      objective.progress = Math.min(
        objective.target,
        Math.max(
          objective.progress,
          state.player.driftCombo +
            state.stats.landings * 1.4 +
            state.stats.nearMisses * 1.2 +
            state.player.trickCharge,
        ),
      );
      break;
    case "bot-escape":
      updateBotEscapeObjective(state, dt);
      break;
    default:
      break;
  }
}

function updateTutorialObjective(state: GameState, input: InputFrame): void {
  const step = Math.floor(state.objective.progress);
  if (step === 0 && Math.abs(state.player.speed) > 18)
    awardObjectiveProgress(state, 1, 80);
  else if (step === 1 && Math.abs(input.steer) > 0.3)
    awardObjectiveProgress(state, 1, 80);
  else if (step === 2 && input.drift && state.player.driftCombo > 1.08)
    awardObjectiveProgress(state, 1, 120);
  else if (step === 3 && input.boost && state.player.boost < 0.98)
    awardObjectiveProgress(state, 1, 120);
  else if (step === 4 && state.player.airborne)
    awardObjectiveProgress(state, 1, 140);
  else if (
    step === 5 &&
    state.player.lastLanding &&
    state.player.lastLanding !== "rough"
  )
    awardObjectiveProgress(state, 1, 180);

  const finalGate = state.markers[state.markers.length - 1];
  if (finalGate) {
    finalGate.active = state.objective.progress >= 6 && !finalGate.complete;
    state.objective.markerIndex = state.markers.length - 1;
  }
}

function updateLavaFloorObjective(state: GameState, dt: number): void {
  if (state.markers.length === 0) return;
  const activeIndex = Math.floor(state.elapsed / 7) % state.markers.length;
  for (const [index, marker] of state.markers.entries())
    marker.active = index === activeIndex && !marker.complete;
  const zone = state.markers[activeIndex];
  const inZone =
    zone &&
    distance2(state.player.x, state.player.z, zone.x, zone.z) < zone.radius;
  if (inZone) {
    state.objective.progress = Math.min(
      state.objective.target,
      state.objective.progress + dt,
    );
    state.player.shield = Math.min(1, state.player.shield + dt * 0.05);
    state.score += dt * 45;
  } else {
    state.player.shield = Math.max(0, state.player.shield - dt * 0.24);
    state.score = Math.max(0, state.score - dt * 10);
    if (state.player.shield <= 0) {
      state.player.lives = Math.max(0, state.player.lives - 1);
      state.player.shield = 0.55;
      if (state.player.lives <= 0)
        completeRun(
          state,
          false,
          "The floor overheated the car. Rotate to the lit safe zone sooner.",
        );
    }
  }
}

function updateKingZoneObjective(
  state: GameState,
  input: InputFrame,
  dt: number,
): void {
  const zone = state.markers[0];
  if (!zone) return;
  const playerInside =
    distance2(state.player.x, state.player.z, zone.x, zone.z) < zone.radius;
  if (!playerInside) return;
  const contested = state.bots.some(
    (bot) => distance2(bot.x, bot.z, zone.x, zone.z) < zone.radius,
  );
  const speedBonus = clamp(Math.abs(state.player.speed) / 90, 0.25, 1.25);
  const holdRate =
    (input.drift ? 2.1 : 0.8) * speedBonus * (contested ? 0.45 : 1);
  state.objective.progress = Math.min(
    state.objective.target,
    state.objective.progress + dt * holdRate,
  );
  state.score += dt * (contested ? 42 : 96) * speedBonus;
  state.player.boost = Math.min(1, state.player.boost + dt * 0.045);
  if (contested && Math.abs(state.player.speed) < 22)
    state.player.shield = Math.max(0, state.player.shield - dt * 0.08);
}

function updateBattlePressureObjective(state: GameState, dt: number): void {
  if (!state.ball) return;
  const ballDistance = distance2(
    state.player.x,
    state.player.z,
    state.ball.x,
    state.ball.z,
  );
  if (ballDistance > 52 || Math.abs(state.player.speed) < 36) return;
  const pressure = clamp(1 - ballDistance / 52, 0.1, 1);
  state.objective.progress = Math.min(
    state.objective.target,
    state.objective.progress + dt * pressure * 0.08,
  );
  state.score += dt * 30 * pressure;
}

function updateBotEscapeObjective(state: GameState, dt: number): void {
  const closest = state.bots.reduce(
    (best, bot) =>
      Math.min(best, distance2(bot.x, bot.z, state.player.x, state.player.z)),
    Number.POSITIVE_INFINITY,
  );
  const escapeRate = closest < 38 ? 0.35 : closest < 68 ? 0.72 : 1;
  state.objective.progress = Math.min(
    state.objective.target,
    state.objective.progress + dt * escapeRate,
  );
  state.score += dt * (closest > 68 ? 36 : 12);
  if (closest < 30)
    state.player.shield = Math.max(0, state.player.shield - dt * 0.06);
}

function hitMarker(state: GameState): ObjectiveMarker | null {
  if (state.mode === "boost-bowling") {
    return (
      state.markers.find(
        (marker) =>
          marker.active &&
          !marker.complete &&
          distance2(state.player.x, state.player.z, marker.x, marker.z) <
            marker.radius,
      ) ?? null
    );
  }
  const marker = state.markers[state.objective.markerIndex];
  if (
    marker &&
    marker.active &&
    !marker.complete &&
    distance2(state.player.x, state.player.z, marker.x, marker.z) <
      marker.radius
  )
    return marker;
  return null;
}

function handleMarkerHit(
  state: GameState,
  marker: ObjectiveMarker,
  input: InputFrame,
): void {
  switch (state.mode) {
    case "tutorial":
      if (state.objective.progress >= 6) completeMarker(state, marker, 1, 220);
      break;
    case "campaign":
      completeMarker(state, marker, 8, 180);
      state.player.boost = Math.min(1, state.player.boost + 0.12);
      break;
    case "race":
      completeMarker(
        state,
        marker,
        1,
        checkpointScore(state, 180 + Math.round(state.timeRemaining * 2)),
      );
      state.player.boost = Math.min(1, state.player.boost + 0.08);
      break;
    case "time-trial":
      completeMarker(
        state,
        marker,
        1,
        checkpointScore(state, 240 + Math.round(state.timeRemaining * 3)),
      );
      state.timeRemaining = Math.min(
        MODE_TIME_LIMITS[state.mode],
        state.timeRemaining +
          (Math.abs(state.player.speed) > 86 && !state.player.airborne
            ? 2.3
            : 1.4),
      );
      break;
    case "stunt":
      completeMarker(
        state,
        marker,
        state.player.airborne ? 1.25 + state.player.trickCharge * 0.12 : 0.45,
        state.player.airborne
          ? 220 + Math.round(state.player.trickCharge * 120)
          : 120,
      );
      break;
    case "hunter":
      completeMarker(state, marker, 1, 190);
      state.player.boost = Math.min(1, state.player.boost + 0.16);
      state.player.shield = Math.min(1, state.player.shield + 0.1);
      break;
    case "boss":
      if (
        input.boost ||
        input.drift ||
        state.player.lastLanding === "inferno"
      ) {
        completeMarker(state, marker, 1, 360);
        const boss = state.bots.find((bot) => bot.personality === "boss");
        if (boss) {
          boss.cooldown = 1.8;
          boss.speed *= 0.55;
        }
      } else {
        state.player.shield = Math.max(0, state.player.shield - 0.18);
        state.score = Math.max(0, state.score - 60);
      }
      break;
    case "battle":
      completeMarker(
        state,
        marker,
        0.55,
        150 + Math.round(Math.abs(state.player.speed) * 0.7),
      );
      state.player.shield = Math.min(1, state.player.shield + 0.08);
      break;
    case "ramp-rush":
      completeMarker(
        state,
        marker,
        state.player.airborne ? 1.05 : 0.35,
        state.player.airborne
          ? 250 + Math.round(Math.abs(state.player.speed))
          : 90,
      );
      state.player.boost = Math.min(1, state.player.boost + 0.14);
      break;
    case "boost-bowling": {
      const speed = Math.abs(state.player.speed);
      const boostedHit = input.boost || speed > 58;
      if (!boostedHit) {
        state.score += 65;
        state.player.boost = Math.min(1, state.player.boost + 0.05);
        return;
      }
      completeMarker(
        state,
        marker,
        1,
        230 +
          Math.round(clamp(speed - 58, 0, 90) * 2.2) +
          (input.boost ? 90 : 0),
      );
      state.player.boost = Math.min(1, state.player.boost + 0.08);
      break;
    }
    case "bot-escape":
      completeMarker(state, marker, 4, 220);
      for (const bot of state.bots) bot.cooldown = Math.max(bot.cooldown, 0.8);
      state.player.boost = Math.min(1, state.player.boost + 0.14);
      break;
    default:
      completeMarker(state, marker, 1, 120);
      break;
  }
}

function completeMarker(
  state: GameState,
  marker: ObjectiveMarker,
  progress: number,
  score: number,
): void {
  marker.complete = true;
  awardObjectiveProgress(state, progress, score);
  if (state.mode === "boost-bowling") return;
  state.objective.markerIndex += 1;
  const next = state.markers[state.objective.markerIndex];
  if (next) next.active = true;
}

function awardObjectiveProgress(
  state: GameState,
  progress: number,
  score: number,
): void {
  state.objective.progress = Math.min(
    state.objective.target,
    state.objective.progress + progress,
  );
  state.score += score;
}

function completeRun(
  state: GameState,
  won: boolean,
  reason: string | null = null,
): void {
  if (state.machine === "results") return;
  state.objective.complete = won;
  state.objective.failReason = won
    ? null
    : reason || "The run ended before the objective was complete.";
  state.machine = "results";
  state.replay = { active: false, meta: "", timer: 0 };
  const medal = medalForRun(state, won);
  state.progression.medals[state.mode] = medal;
  const xpAward = won
    ? 120 +
      Math.round(state.score / 28) +
      Math.round(state.objective.progress * 3)
    : 35 +
      Math.round(Math.min(state.objective.progress, state.objective.target));
  state.progression.xp += xpAward;
  state.progression.level = 1 + Math.floor(state.progression.xp / 500);
  const unlocks = won ? rewardsForRun(state, medal) : [];
  for (const unlock of unlocks) {
    if (!state.progression.unlocked.includes(unlock))
      state.progression.unlocked.push(unlock);
  }
  state.progression.rewardLog = [
    `${state.mode}:${won ? medal : "Failed"}:+${xpAward}xp`,
    ...unlocks.map((unlock) => `unlock:${unlock}`),
    ...state.progression.rewardLog,
  ].slice(0, 12);
}

function classForMode(mode: ModeId): CarClassId {
  if (mode === "stunt" || mode === "ramp-rush" || mode === "trick-combo")
    return "stunt";
  if (mode === "race" || mode === "time-trial") return "speed";
  if (mode === "battle" || mode === "boost-bowling") return "bruiser";
  if (mode === "hunter" || mode === "bot-escape") return "lightweight";
  return "balanced";
}

function isAirScoringMode(mode: ModeId): boolean {
  return mode === "stunt" || mode === "ramp-rush" || mode === "trick-combo";
}

function checkpointScore(state: GameState, base: number): number {
  const speedBonus = clamp(Math.abs(state.player.speed) - 45, 0, 95) * 1.4;
  const cleanBonus = state.player.shield > 0.82 ? 55 : 0;
  const driftBonus =
    state.player.driftCombo > 1.4 ? state.player.driftCombo * 24 : 0;
  return Math.round(base + speedBonus + cleanBonus + driftBonus);
}

function botDamageRate(bot: Bot, mode: ModeId): number {
  const base =
    bot.personality === "boss"
      ? 0.78
      : bot.personality === "rammer"
        ? 0.52
        : bot.personality === "blocker"
          ? 0.42
          : bot.personality === "sprinter"
            ? 0.36
            : 0.3;
  return mode === "bot-escape" || mode === "hunter" ? base * 1.08 : base;
}

function botFailureReason(mode: ModeId, bot: Bot): string {
  if (mode === "boss")
    return "The boss pattern caught you. Wait for the weak point, then boost or drift through it.";
  if (mode === "bot-escape")
    return `${bot.personality} hunter pressure broke the car. Use decoy gates and near misses to refill boost.`;
  if (mode === "battle")
    return "Arena hits depleted your shield. Build speed before committing to contact.";
  return "Hunters boxed you in. Drift earlier and use boost through open lanes.";
}

function brakingForce(
  speed: number,
  throttle: number,
  airborne: boolean,
): number {
  if (airborne || Math.abs(throttle) < 0.05) return 0;
  const opposingThrottle = Math.sign(throttle) !== Math.sign(speed);
  return opposingThrottle ? Math.sign(speed) * 92 : 0;
}

function coastGrip(
  mode: ModeId,
  spec: (typeof CAR_CLASSES)[CarClassId],
  driftActive: boolean,
  airborne: boolean,
  throttleAbs: number,
): number {
  if (airborne) return 0.992;
  if (driftActive) return 0.985 - spec.drift * 0.02;
  if (throttleAbs < 0.05) {
    const raceRoll = mode === "race" || mode === "time-trial" ? 0.012 : 0;
    return 0.89 + raceRoll - spec.grip * 0.012;
  }
  return 0.955 - spec.grip * 0.018;
}

function markerCountForMode(mode: ModeId): number {
  if (mode === "tutorial") return 7;
  if (mode === "boost-bowling") return 10;
  if (mode === "lava-floor") return 5;
  if (mode === "boss") return MODE_META[mode].target;
  if (MODE_META[mode].target > 20) return 5;
  return Math.max(4, Math.min(10, MODE_META[mode].target));
}

function markerKindForMode(mode: ModeId): ObjectiveMarker["kind"] {
  if (mode === "boost-bowling" || mode === "boss" || mode === "battle")
    return "target";
  if (mode === "lava-floor" || mode === "king-zone") return "zone";
  if (mode === "bot-escape" || mode === "hunter" || mode === "tutorial")
    return "gate";
  return "checkpoint";
}

function initialMarkerActive(mode: ModeId, index: number): boolean {
  if (mode === "boost-bowling") return true;
  if (mode === "lava-floor") return index === 0;
  if (mode === "tutorial") return false;
  return index === 0;
}

function botPersonalitiesForMode(mode: ModeId): BotPersonality[] {
  switch (mode) {
    case "tutorial":
      return ["stalker"];
    case "race":
    case "time-trial":
      return ["sprinter", "predictor", "blocker"];
    case "stunt":
    case "ramp-rush":
    case "trick-combo":
      return ["stalker", "sprinter"];
    case "hunter":
      return ["rammer", "predictor", "blocker", "stalker"];
    case "boss":
      return ["boss", "predictor", "blocker", "sprinter"];
    case "drift-score":
      return ["stalker", "blocker", "predictor"];
    case "max":
    case "battle":
      return [
        "blocker",
        "predictor",
        "rammer",
        "stalker",
        "sprinter",
        "rammer",
      ];
    case "lava-floor":
    case "king-zone":
      return ["blocker", "stalker", "predictor"];
    case "bot-escape":
      return ["rammer", "predictor", "sprinter", "blocker", "stalker"];
    default:
      return ["rammer", "predictor", "blocker", "stalker", "sprinter"];
  }
}

function botRoleForMode(
  mode: ModeId,
  personality: BotPersonality,
  index: number,
): string {
  if (mode === "race" || mode === "time-trial") return `rival-${index + 1}`;
  if (mode === "hunter" || mode === "bot-escape") return "hunter";
  if (mode === "lava-floor") return index === 0 ? "zone-denier" : "hunter";
  if (mode === "king-zone") return index === 0 ? "contestant" : "blocker";
  if (personality === "stalker") return "shadow";
  return personality;
}

function awardLanding(
  state: GameState,
  impact: number,
  input: InputFrame,
): void {
  const car = state.player;
  const speedQuality = clamp(Math.abs(car.speed) / 115, 0, 1);
  const airQuality = clamp(car.airTime / 1.2, 0, 1.4);
  const trickQuality = clamp(car.trickCharge / 1.8, 0, 1.35);
  const steeringControl = input.drift
    ? 0.12
    : Math.max(0, 0.16 - Math.abs(input.steer) * 0.08);
  const impactPenalty = clamp((impact - 42) / 52, 0, 1.4);
  const quality =
    speedQuality + airQuality + trickQuality + steeringControl - impactPenalty;
  const grade: LandingGrade =
    quality >= 2.3
      ? "inferno"
      : quality >= 1.65
        ? "perfect"
        : quality >= 0.9
          ? "clean"
          : "rough";
  car.lastLanding = grade;
  state.stats.landings += 1;
  const bonus =
    grade === "inferno"
      ? 440
      : grade === "perfect"
        ? 280
        : grade === "clean"
          ? 130
          : 20;
  state.score += bonus;
  car.boost = Math.min(1, car.boost + bonus / 760);
  car.driftCombo = Math.min(
    9.9,
    car.driftCombo +
      (grade === "inferno"
        ? 0.75
        : grade === "perfect"
          ? 0.45
          : grade === "clean"
            ? 0.18
            : 0.04),
  );
  if (grade !== "rough") {
    car.landingBoost =
      grade === "inferno" ? 1.45 : grade === "perfect" ? 1 : 0.55;
    car.speed += grade === "inferno" ? 22 : grade === "perfect" ? 14 : 8;
    if (state.mode === "drift-score") car.driftScore += bonus * 1.4;
    if (
      state.mode === "stunt" ||
      state.mode === "ramp-rush" ||
      state.mode === "trick-combo"
    ) {
      const landingProgress =
        grade === "inferno" ? 1.65 : grade === "perfect" ? 1.05 : 0.65;
      state.objective.progress = Math.min(
        state.objective.target,
        state.objective.progress + landingProgress,
      );
    }
    if (state.mode === "tutorial" && state.objective.progress >= 5)
      state.objective.progress = Math.max(state.objective.progress, 6);
  }
}

function botTarget(state: GameState, bot: Bot): { x: number; z: number } {
  if (state.baseMode === "infernodriftmax1" && state.ball)
    return arenaBotTarget(state, bot);
  if (bot.cooldown > 0 && state.mode === "bot-escape") {
    return { x: -state.player.x * 0.4, z: -state.player.z * 0.4 };
  }
  if (bot.personality === "boss") {
    const angle = state.elapsed * 0.85 + bot.id;
    return {
      x: state.player.x + Math.sin(angle) * 34,
      z: state.player.z + Math.cos(angle) * 34,
    };
  }
  if (bot.personality === "rammer") {
    return {
      x: state.player.x + Math.sin(state.player.heading) * 10,
      z: state.player.z + Math.cos(state.player.heading) * 10,
    };
  }
  if (bot.personality === "predictor")
    return predictPlayer(state.player, "predictor");
  if (bot.personality === "blocker") {
    const ahead = predictPlayer(state.player, "predictor");
    const side = bot.id % 2 === 0 ? 1 : -1;
    return {
      x: ahead.x + Math.cos(state.player.heading) * 24 * side,
      z: ahead.z - Math.sin(state.player.heading) * 24 * side,
    };
  }
  if (bot.personality === "stalker") {
    return {
      x: state.player.x - Math.sin(state.player.heading) * 34,
      z: state.player.z - Math.cos(state.player.heading) * 34,
    };
  }
  if (bot.personality === "sprinter") {
    const marker = state.markers.find(
      (candidate) => candidate.active && !candidate.complete,
    );
    if (marker) return { x: marker.x, z: marker.z };
    return predictPlayer(state.player, "predictor");
  }
  return predictPlayer(state.player, bot.personality);
}

function arenaBotTarget(state: GameState, bot: Bot): { x: number; z: number } {
  const ball = state.ball!;
  const defendZ = bot.team === "blue" ? -WORLD_HALF + 32 : WORLD_HALF - 32;
  const attackZ = bot.team === "blue" ? WORLD_HALF - 42 : -WORLD_HALF + 42;
  const side = bot.id % 2 === 0 ? 1 : -1;
  if (bot.role === "goalie")
    return {
      x: clamp(ball.x * 0.45, -64, 64),
      z: defendZ,
    };
  if (bot.role === "defender" || bot.role === "sweeper")
    return {
      x: ball.x * 0.65 + side * 20,
      z: (ball.z + defendZ) * 0.5,
    };
  if (bot.role === "support" || bot.role === "wing")
    return {
      x: ball.x + side * 30,
      z: ball.z + (bot.team === "blue" ? -24 : 24),
    };
  if (bot.personality === "rammer" && bot.team === "red")
    return { x: state.player.x, z: state.player.z };
  return {
    x: ball.x * 0.85,
    z: (ball.z + attackZ) * 0.32,
  };
}

function botPressureForMode(mode: ModeId, elapsed: number): number {
  const ramp = Math.min(0.35, elapsed / 220);
  if (mode === "tutorial") return 0.38;
  if (mode === "race" || mode === "time-trial") return 0.88 + ramp;
  if (mode === "hunter" || mode === "bot-escape") return 1.08 + ramp * 1.6;
  if (mode === "boss") return 1.16 + ramp;
  if (mode === "battle") return 1.05 + ramp;
  return 1 + ramp;
}

function nearMissRadiusForMode(mode: ModeId): number {
  if (mode === "drift-score" || mode === "trick-combo") return 34;
  if (mode === "hunter" || mode === "bot-escape") return 32;
  return 28;
}

function respawnBot(bot: Bot, seed: number): void {
  const side = seed % 2 === 0 ? 1 : -1;
  bot.x = side * (80 + (seed % 3) * 18);
  bot.z = -40 + ((seed * 37) % 120);
  bot.speed = 0;
  bot.heading = Math.PI;
}

function didWinOnTimeout(state: GameState): boolean {
  switch (state.mode) {
    case "campaign":
    case "lava-floor":
    case "bot-escape":
      return state.objective.progress >= state.objective.target;
    case "max":
      return (
        state.stats.goalsBlue > state.stats.goalsRed ||
        state.objective.progress >= state.objective.target
      );
    case "battle":
      return state.objective.progress >= state.objective.target;
    default:
      return false;
  }
}

function timeoutReason(state: GameState): string {
  switch (state.mode) {
    case "max":
      return "The horn sounded before blue took the match. Clear the ball earlier.";
    case "time-trial":
      return "The ghost split expired before every checkpoint was cleared.";
    case "drift-score":
      return "Score attack time expired before the drift target was banked.";
    case "lava-floor":
      return "The lava cycle ended before enough safe-zone time was banked.";
    default:
      return "Time expired before the mode objective was complete.";
  }
}

function medalForRun(state: GameState, won: boolean): string {
  if (!won) return "None";
  const thresholds = MODE_MEDAL_SCORES[state.mode];
  if (state.score >= thresholds.inferno) return "Inferno";
  if (state.score >= thresholds.gold) return "Gold";
  if (state.score >= thresholds.silver) return "Silver";
  if (state.score >= thresholds.bronze) return "Bronze";
  return "Bronze";
}

function rewardsForRun(state: GameState, medal: string): string[] {
  const rewards = [...MODE_REWARDS[state.mode]];
  if (medal === "Inferno") rewards.push(`inferno-${state.mode}-medal`);
  if (state.progression.level >= 3) rewards.push("garage-tier-2");
  return rewards.filter(
    (reward) => !state.progression.unlocked.includes(reward),
  );
}

function radarThreatForBot(state: GameState, bot: Bot): number {
  const distance = distance2(bot.x, bot.z, state.player.x, state.player.z);
  const base =
    bot.personality === "boss"
      ? 0.85
      : bot.team === "red" || bot.team === "hunter"
        ? 0.55
        : bot.team === "blue"
          ? 0.18
          : 0.35;
  const proximity = clamp(1 - distance / 140, 0, 0.45);
  return clamp(base + proximity, 0, 1);
}

function markerLabel(marker: ObjectiveMarker, state: GameState): string {
  if (state.mode === "lava-floor") return "Safe zone";
  if (state.mode === "boss") return "Weak point";
  if (state.mode === "boost-bowling") return "Pin";
  if (marker.kind === "gate") return "Gate";
  if (marker.kind === "zone") return "Zone";
  if (marker.kind === "target") return "Target";
  return "Checkpoint";
}

function predictPlayer(
  player: Vehicle,
  personality: BotPersonality,
): { x: number; z: number } {
  const lookAhead =
    personality === "predictor"
      ? 0.9
      : personality === "blocker"
        ? 0.55
        : personality === "stalker"
          ? 0.25
          : 0.4;
  return {
    x: player.x + player.vx * lookAhead,
    z: player.z + player.vz * lookAhead,
  };
}

function worldForMode(mode: ModeId): string {
  if (mode === "boss") return "Abyssal Finale";
  if (mode === "max" || mode === "battle") return "Max Forge";
  if (mode === "stunt" || mode === "ramp-rush" || mode === "trick-combo")
    return "Skyline Stunt Park";
  if (mode === "lava-floor") return "Magma Grid";
  return "Cinder Circuit";
}

function weeklySeed(date: Date): string {
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((date.getTime() - start.getTime()) / 86400000 + start.getUTCDay() + 1) / 7,
  );
  return `${date.getUTCFullYear()}-W${week}`;
}

function distance2(ax: number, az: number, bx: number, bz: number): number {
  return Math.hypot(ax - bx, az - bz);
}

function angleDiff(a: number, b: number): number {
  return Math.atan2(Math.sin(a - b), Math.cos(a - b));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, precision = 1): number {
  const scale = 10 ** precision;
  return Math.round(value * scale) / scale;
}
