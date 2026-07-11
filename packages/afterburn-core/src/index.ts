export const AFTERBURN_SIM_VERSION = 1;
export const FIXED_STEP = 1 / 60;

export type ModeId =
  | "burn-run"
  | "burn-crew"
  | "heat-circuit"
  | "drift-clash"
  | "wreckyard";
export type ChassisId = "vandal" | "apex" | "warden" | "wraith";
export type TeamId = "ember" | "cyan" | "solo";
export type MatchPhase = "countdown" | "running" | "finished";

export interface InputFrame {
  seq: number;
  throttle: number;
  steer: number;
  drift: boolean;
  boost: boolean;
  jump: boolean;
  recover: boolean;
}

export interface VehicleConfig {
  id: ChassisId;
  name: string;
  tagline: string;
  acceleration: number;
  topSpeed: number;
  grip: number;
  driftGrip: number;
  turnRate: number;
  armor: number;
  boostPower: number;
  color: string;
}

export interface VehicleState {
  id: string;
  name: string;
  chassis: ChassisId;
  team: TeamId;
  bot: boolean;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  heading: number;
  speed: number;
  slip: number;
  steering: number;
  boost: number;
  integrity: number;
  heat: number;
  combo: number;
  driftScore: number;
  checkpoint: number;
  cores: number;
  finished: boolean;
  finishTime: number | null;
  downed: boolean;
  revive: number;
  lastInputSeq: number;
  recoveryCooldown: number;
}

export interface HunterState {
  id: string;
  archetype: "rammer" | "interceptor" | "warden" | "reaper";
  x: number;
  z: number;
  vx: number;
  vz: number;
  heading: number;
  integrity: number;
  targetId: string;
}

export interface PickupState {
  id: string;
  kind: "core" | "boost" | "repair";
  x: number;
  z: number;
  active: boolean;
}

export interface HazardState {
  id: string;
  kind: "lava" | "barrier" | "vent";
  x: number;
  z: number;
  radius: number;
  phase: number;
}

export interface MatchEvent {
  tick: number;
  type:
    | "checkpoint"
    | "pickup"
    | "impact"
    | "downed"
    | "revived"
    | "finish"
    | "boss"
    | "match-finished";
  actorId?: string;
  targetId?: string;
  detail?: string;
  value?: number;
}

export interface SimulationState {
  version: number;
  seed: number;
  mode: ModeId;
  phase: MatchPhase;
  tick: number;
  elapsed: number;
  countdown: number;
  duration: number;
  routeLength: number;
  district: 1 | 2 | 3;
  bossActive: boolean;
  bossIntegrity: number;
  players: Record<string, VehicleState>;
  hunters: HunterState[];
  pickups: PickupState[];
  hazards: HazardState[];
  events: MatchEvent[];
  winnerIds: string[];
}

export interface MatchSnapshot extends SimulationState {
  serverTime?: number;
}

export interface RunResult {
  mode: ModeId;
  seed: number;
  placement: number;
  finished: boolean;
  time: number;
  score: number;
  cores: number;
  credits: number;
  reputation: number;
}

export interface SaveV1 {
  schemaVersion: 1;
  credits: number;
  reputation: number;
  chassis: ChassisId[];
  activeChassis: ChassisId;
  paints: string[];
  activePaint: string;
  veteran: boolean;
  contractsCompleted: number;
  bests: Partial<Record<ModeId, number>>;
  settings: {
    quality: "low" | "medium" | "high";
    reducedMotion: boolean;
    cameraShake: number;
    masterVolume: number;
  };
}

export interface ProfileStore {
  load(): Promise<SaveV1 | null>;
  save(value: SaveV1): Promise<void>;
}

export const CHASSIS: Record<ChassisId, VehicleConfig> = {
  vandal: {
    id: "vandal",
    name: "Vandal GT",
    tagline: "Balanced street weapon",
    acceleration: 43,
    topSpeed: 76,
    grip: 8.3,
    driftGrip: 2.25,
    turnRate: 1.78,
    armor: 1,
    boostPower: 35,
    color: "#ff5a1f",
  },
  apex: {
    id: "apex",
    name: "Apex R",
    tagline: "Fast, sharp, unforgiving",
    acceleration: 46,
    topSpeed: 84,
    grip: 9.5,
    driftGrip: 2.65,
    turnRate: 1.95,
    armor: 0.82,
    boostPower: 37,
    color: "#41efff",
  },
  warden: {
    id: "warden",
    name: "Warden HX",
    tagline: "Heavy rescue bruiser",
    acceleration: 36,
    topSpeed: 69,
    grip: 7.4,
    driftGrip: 1.9,
    turnRate: 1.5,
    armor: 1.38,
    boostPower: 31,
    color: "#f5c45b",
  },
  wraith: {
    id: "wraith",
    name: "Wraith S",
    tagline: "Drift-built phantom",
    acceleration: 40,
    topSpeed: 79,
    grip: 6.9,
    driftGrip: 1.45,
    turnRate: 2.15,
    armor: 0.9,
    boostPower: 39,
    color: "#c889ff",
  },
};

export const EMPTY_INPUT: InputFrame = {
  seq: 0,
  throttle: 0,
  steer: 0,
  drift: false,
  boost: false,
  jump: false,
  recover: false,
};

export function defaultSave(veteran = false): SaveV1 {
  return {
    schemaVersion: 1,
    credits: 0,
    reputation: 0,
    chassis: ["vandal"],
    activeChassis: "vandal",
    paints: veteran ? ["afterglow", "veteran-black"] : ["afterglow"],
    activePaint: veteran ? "veteran-black" : "afterglow",
    veteran,
    contractsCompleted: 0,
    bests: {},
    settings: {
      quality: "high",
      reducedMotion: false,
      cameraShake: 0.7,
      masterVolume: 0.75,
    },
  };
}

export function sanitizeSave(value: unknown, veteran = false): SaveV1 {
  if (!value || typeof value !== "object") return defaultSave(veteran);
  const source = value as Partial<SaveV1>;
  if (source.schemaVersion !== 1) return defaultSave(veteran);
  const chassis = (source.chassis ?? []).filter((id): id is ChassisId => id in CHASSIS);
  const fallback = defaultSave(veteran || Boolean(source.veteran));
  return {
    ...fallback,
    credits: clamp(Math.floor(Number(source.credits) || 0), 0, 10_000_000),
    reputation: clamp(Math.floor(Number(source.reputation) || 0), 0, 1_000_000),
    chassis: chassis.length ? [...new Set(chassis)] : fallback.chassis,
    activeChassis:
      source.activeChassis && chassis.includes(source.activeChassis)
        ? source.activeChassis
        : fallback.activeChassis,
    paints: Array.isArray(source.paints)
      ? [...new Set(source.paints.filter((paint): paint is string => typeof paint === "string"))].slice(0, 64)
      : fallback.paints,
    activePaint: typeof source.activePaint === "string" ? source.activePaint : fallback.activePaint,
    veteran: veteran || Boolean(source.veteran),
    contractsCompleted: clamp(Math.floor(Number(source.contractsCompleted) || 0), 0, 100_000),
    bests: source.bests && typeof source.bests === "object" ? source.bests : {},
    settings: {
      quality: ["low", "medium", "high"].includes(source.settings?.quality ?? "")
        ? source.settings!.quality
        : fallback.settings.quality,
      reducedMotion: Boolean(source.settings?.reducedMotion),
      cameraShake: clamp(Number(source.settings?.cameraShake) || 0, 0, 1),
      masterVolume: clamp(Number(source.settings?.masterVolume) || 0, 0, 1),
    },
  };
}

export function createSimulation(
  mode: ModeId,
  seed: number,
  entrants: Array<{
    id: string;
    name: string;
    chassis?: ChassisId;
    team?: TeamId;
    bot?: boolean;
  }>,
): SimulationState {
  const normalizedSeed = Math.abs(Math.floor(seed)) || 1;
  const routeLength = mode === "drift-clash" || mode === "wreckyard" ? 900 : 3600;
  const duration = mode === "drift-clash" ? 150 : mode === "wreckyard" ? 0 : 480;
  const players: Record<string, VehicleState> = {};
  entrants.slice(0, 6).forEach((entrant, index) => {
    players[entrant.id] = createVehicle(
      entrant.id,
      entrant.name,
      entrant.chassis ?? "vandal",
      entrant.team ?? (mode === "burn-crew" ? "ember" : index % 2 ? "cyan" : "ember"),
      Boolean(entrant.bot),
      index,
    );
  });
  return {
    version: AFTERBURN_SIM_VERSION,
    seed: normalizedSeed,
    mode,
    phase: "countdown",
    tick: 0,
    elapsed: 0,
    countdown: 3.4,
    duration,
    routeLength,
    district: 1,
    bossActive: false,
    bossIntegrity: 100,
    players,
    hunters: createHunters(mode, normalizedSeed, Object.keys(players)),
    pickups: createPickups(mode, normalizedSeed, routeLength),
    hazards: createHazards(mode, normalizedSeed, routeLength),
    events: [],
    winnerIds: [],
  };
}

function createVehicle(
  id: string,
  name: string,
  chassis: ChassisId,
  team: TeamId,
  bot: boolean,
  index: number,
): VehicleState {
  return {
    id,
    name: name.slice(0, 24),
    chassis,
    team,
    bot,
    x: (index % 2 ? 1 : -1) * (3.2 + Math.floor(index / 2) * 2.4),
    y: 0,
    z: Math.floor(index / 2) * 9,
    vx: 0,
    vy: 0,
    vz: 0,
    heading: 0,
    speed: 0,
    slip: 0,
    steering: 0,
    boost: 1,
    integrity: 1,
    heat: 0,
    combo: 1,
    driftScore: 0,
    checkpoint: 0,
    cores: 0,
    finished: false,
    finishTime: null,
    downed: false,
    revive: 0,
    lastInputSeq: 0,
    recoveryCooldown: 0,
  };
}

export function stepSimulation(
  state: SimulationState,
  inputs: Record<string, InputFrame | undefined>,
  dt = FIXED_STEP,
): MatchEvent[] {
  dt = clamp(dt, 0, 0.05);
  state.events = [];
  state.tick += 1;
  if (state.phase === "countdown") {
    state.countdown = Math.max(0, state.countdown - dt);
    if (state.countdown <= 0) state.phase = "running";
  }
  if (state.phase !== "running") return state.events;
  state.elapsed += dt;

  for (const vehicle of Object.values(state.players)) {
    const input = vehicle.bot ? botInput(state, vehicle) : inputs[vehicle.id] ?? EMPTY_INPUT;
    stepVehicle(state, vehicle, input, dt);
  }
  stepHunters(state, dt);
  resolvePlayerContacts(state);
  updateObjectives(state, dt);
  return state.events;
}

function stepVehicle(
  state: SimulationState,
  vehicle: VehicleState,
  rawInput: InputFrame,
  dt: number,
) {
  const config = CHASSIS[vehicle.chassis];
  const input = normalizeInput(rawInput);
  vehicle.lastInputSeq = Math.max(vehicle.lastInputSeq, input.seq);
  vehicle.recoveryCooldown = Math.max(0, vehicle.recoveryCooldown - dt);

  if (vehicle.finished) {
    vehicle.vx *= Math.exp(-3 * dt);
    vehicle.vz *= Math.exp(-3 * dt);
    vehicle.x += vehicle.vx * dt;
    vehicle.z += vehicle.vz * dt;
    return;
  }
  if (vehicle.downed) {
    vehicle.vx *= Math.exp(-6 * dt);
    vehicle.vz *= Math.exp(-6 * dt);
    if (state.mode !== "burn-crew" && state.mode !== "burn-run") recoverVehicle(state, vehicle, 0.55);
    return;
  }

  const forwardX = Math.sin(vehicle.heading);
  const forwardZ = Math.cos(vehicle.heading);
  const rightX = forwardZ;
  const rightZ = -forwardX;
  let forwardSpeed = vehicle.vx * forwardX + vehicle.vz * forwardZ;
  let lateralSpeed = vehicle.vx * rightX + vehicle.vz * rightZ;
  const speedAbs = Math.abs(forwardSpeed);
  const drifting = input.drift && speedAbs > 10 && vehicle.y < 0.1;
  const boosting = input.boost && vehicle.boost > 0.02 && input.throttle > 0 && vehicle.y < 1.5;
  const grip = drifting ? config.driftGrip : config.grip;
  lateralSpeed *= Math.exp(-grip * dt);

  const traction = vehicle.y > 0.1 ? 0.24 : 1;
  const acceleration = input.throttle >= 0 ? config.acceleration : config.acceleration * 0.72;
  forwardSpeed += input.throttle * acceleration * traction * dt;
  if (boosting) {
    forwardSpeed += config.boostPower * dt;
    vehicle.boost = Math.max(0, vehicle.boost - 0.22 * dt);
    vehicle.heat = Math.min(1, vehicle.heat + 0.16 * dt);
  } else {
    vehicle.boost = Math.min(1, vehicle.boost + (drifting ? 0.085 : 0.035) * dt);
    vehicle.heat = Math.max(0, vehicle.heat - 0.055 * dt);
  }
  const topSpeed = config.topSpeed * (boosting ? 1.22 : 1);
  forwardSpeed = clamp(forwardSpeed, -20, topSpeed);
  if (Math.abs(input.throttle) < 0.05) forwardSpeed *= Math.exp(-0.55 * dt);

  const steerResponse = 1 - Math.exp(-10 * dt);
  vehicle.steering += (input.steer - vehicle.steering) * steerResponse;
  const speedSteer = clamp(speedAbs / 18, 0.18, 1);
  const driftTurn = drifting ? 1.18 : 1;
  vehicle.heading +=
    vehicle.steering * config.turnRate * driftTurn * speedSteer * Math.sign(forwardSpeed || 1) * traction * dt;

  const newForwardX = Math.sin(vehicle.heading);
  const newForwardZ = Math.cos(vehicle.heading);
  const newRightX = newForwardZ;
  const newRightZ = -newForwardX;
  vehicle.vx = newForwardX * forwardSpeed + newRightX * lateralSpeed;
  vehicle.vz = newForwardZ * forwardSpeed + newRightZ * lateralSpeed;
  vehicle.x += vehicle.vx * dt;
  vehicle.z += vehicle.vz * dt;
  vehicle.speed = Math.hypot(vehicle.vx, vehicle.vz);
  vehicle.slip = clamp(Math.abs(lateralSpeed) / Math.max(8, speedAbs), 0, 1);

  if (drifting && vehicle.slip > 0.08) {
    vehicle.combo = Math.min(8, vehicle.combo + vehicle.slip * 0.85 * dt);
    vehicle.driftScore += vehicle.speed * vehicle.slip * vehicle.combo * dt * 3;
  } else {
    vehicle.combo = Math.max(1, vehicle.combo - 0.8 * dt);
  }

  if (input.jump && vehicle.y <= 0.001 && vehicle.speed > 8) vehicle.vy = 10.8;
  vehicle.vy -= 28 * dt;
  vehicle.y += vehicle.vy * dt;
  if (vehicle.y < 0) {
    vehicle.y = 0;
    vehicle.vy = 0;
  }

  const center = roadCenter(vehicle.z, state.seed, state.mode);
  const width = roadWidth(state.mode);
  const offset = vehicle.x - center;
  if (Math.abs(offset) > width) {
    const excess = Math.abs(offset) - width;
    vehicle.x -= Math.sign(offset) * Math.min(excess, 18 * dt);
    vehicle.vx *= Math.exp(-3.5 * dt);
    vehicle.vz *= Math.exp(-1.1 * dt);
    vehicle.integrity = Math.max(0, vehicle.integrity - excess * 0.0018 * dt / config.armor);
  }

  for (const hazard of state.hazards) {
    if (distanceSquared(vehicle.x, vehicle.z, hazard.x, hazard.z) > hazard.radius ** 2) continue;
    if (hazard.kind === "lava") vehicle.integrity -= 0.2 * dt / config.armor;
    if (hazard.kind === "vent" && Math.sin(state.elapsed * 2.4 + hazard.phase) > 0.55) {
      vehicle.vy = Math.max(vehicle.vy, 8);
      vehicle.integrity -= 0.08 * dt / config.armor;
    }
    if (hazard.kind === "barrier") {
      vehicle.vx *= -0.25;
      vehicle.vz *= 0.65;
      vehicle.integrity -= 0.06 / config.armor;
      emit(state, "impact", vehicle.id, hazard.id, "barrier", 0.06);
    }
  }

  if (input.recover && vehicle.recoveryCooldown <= 0) recoverVehicle(state, vehicle, 0.94);
  if (vehicle.integrity <= 0) {
    vehicle.integrity = 0;
    vehicle.downed = true;
    emit(state, "downed", vehicle.id, undefined, "integrity");
  }
}

function updateObjectives(state: SimulationState, dt: number) {
  const players = Object.values(state.players);
  const activePlayers = players.filter((player) => !player.finished && !player.downed);
  for (const vehicle of activePlayers) {
    const checkpoint = Math.max(0, Math.floor(vehicle.z / 300));
    if (checkpoint > vehicle.checkpoint) {
      vehicle.checkpoint = checkpoint;
      vehicle.boost = Math.min(1, vehicle.boost + 0.22);
      emit(state, "checkpoint", vehicle.id, undefined, `gate-${checkpoint}`, checkpoint);
    }
    for (const pickup of state.pickups) {
      if (!pickup.active || distanceSquared(vehicle.x, vehicle.z, pickup.x, pickup.z) > 30) continue;
      pickup.active = false;
      if (pickup.kind === "core") vehicle.cores += 1;
      if (pickup.kind === "boost") vehicle.boost = Math.min(1, vehicle.boost + 0.42);
      if (pickup.kind === "repair") vehicle.integrity = Math.min(1, vehicle.integrity + 0.28);
      emit(state, "pickup", vehicle.id, pickup.id, pickup.kind, 1);
    }
    if ((state.mode === "burn-run" || state.mode === "burn-crew") && vehicle.z > 3000 && !state.bossActive) {
      state.bossActive = true;
      emit(state, "boss", vehicle.id, undefined, "interceptor-inbound");
    }
    if (state.mode !== "drift-clash" && state.mode !== "wreckyard" && vehicle.z >= state.routeLength) {
      finishVehicle(state, vehicle);
    }
  }

  if (state.mode === "burn-crew") {
    for (const downed of players.filter((player) => player.downed)) {
      const rescuer = activePlayers.find(
        (player) => player.id !== downed.id && distanceSquared(player.x, player.z, downed.x, downed.z) < 180,
      );
      downed.revive = rescuer ? downed.revive + dt : Math.max(0, downed.revive - dt * 0.5);
      if (downed.revive >= 2.4) {
        downed.downed = false;
        downed.integrity = 0.45;
        downed.revive = 0;
        emit(state, "revived", rescuer?.id, downed.id, "crew-revive");
      }
    }
  }

  const maxProgress = Math.max(0, ...players.map((player) => player.z));
  state.district = maxProgress > 2400 ? 3 : maxProgress > 1200 ? 2 : 1;
  if (state.bossActive) {
    state.bossIntegrity = Math.max(0, 100 - Math.max(0, maxProgress - 3000) * 0.15);
  }

  const timeExpired = state.duration > 0 && state.elapsed >= state.duration;
  const everyoneDone = players.length > 0 && players.every((player) => player.finished || player.downed);
  if (state.mode === "drift-clash" && timeExpired) {
    const ranking = [...players].sort((a, b) => b.driftScore - a.driftScore);
    state.winnerIds = ranking.slice(0, 1).map((player) => player.id);
    finishMatch(state);
  } else if (timeExpired || everyoneDone) {
    const ranking = [...players].sort(compareRaceProgress);
    state.winnerIds = ranking.filter((player) => player.finished).slice(0, state.mode === "burn-crew" ? 6 : 1).map((p) => p.id);
    finishMatch(state);
  }
}

function stepHunters(state: SimulationState, dt: number) {
  if (state.mode === "heat-circuit" || state.mode === "drift-clash" || state.mode === "wreckyard") return;
  const targets = Object.values(state.players).filter((player) => !player.downed && !player.finished);
  if (!targets.length) return;
  for (const hunter of state.hunters) {
    const target = state.players[hunter.targetId] && !state.players[hunter.targetId].downed
      ? state.players[hunter.targetId]
      : targets[0];
    hunter.targetId = target.id;
    const dx = target.x - hunter.x;
    const dz = target.z - hunter.z;
    const distance = Math.max(0.001, Math.hypot(dx, dz));
    const archetypeSpeed = hunter.archetype === "reaper" ? 79 : hunter.archetype === "interceptor" ? 72 : 64;
    const desiredVx = (dx / distance) * archetypeSpeed;
    const desiredVz = (dz / distance) * archetypeSpeed;
    const response = 1 - Math.exp(-(hunter.archetype === "rammer" ? 1.6 : 2.4) * dt);
    hunter.vx += (desiredVx - hunter.vx) * response;
    hunter.vz += (desiredVz - hunter.vz) * response;
    hunter.x += hunter.vx * dt;
    hunter.z += hunter.vz * dt;
    hunter.heading = Math.atan2(hunter.vx, hunter.vz);
    if (distance < 7.4) {
      const impulse = hunter.archetype === "reaper" ? 15 : 9;
      target.vx += (dx / distance) * impulse;
      target.vz += (dz / distance) * impulse;
      target.integrity = Math.max(0, target.integrity - (hunter.archetype === "reaper" ? 0.1 : 0.055) / CHASSIS[target.chassis].armor);
      hunter.vx *= -0.35;
      hunter.vz *= -0.35;
      emit(state, "impact", hunter.id, target.id, hunter.archetype, impulse);
    }
  }
}

function resolvePlayerContacts(state: SimulationState) {
  const players = Object.values(state.players).filter((player) => !player.downed && !player.finished);
  for (let i = 0; i < players.length; i += 1) {
    for (let j = i + 1; j < players.length; j += 1) {
      const a = players[i];
      const b = players[j];
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const distance = Math.hypot(dx, dz);
      if (distance >= 5.4 || distance < 0.001) continue;
      const overlap = 5.4 - distance;
      const nx = dx / distance;
      const nz = dz / distance;
      const push = Math.min(7, overlap * 2.4);
      a.x -= nx * overlap * 0.5;
      a.z -= nz * overlap * 0.5;
      b.x += nx * overlap * 0.5;
      b.z += nz * overlap * 0.5;
      a.vx -= nx * push;
      a.vz -= nz * push;
      b.vx += nx * push;
      b.vz += nz * push;
    }
  }
}

function recoverVehicle(state: SimulationState, vehicle: VehicleState, integrity: number) {
  const center = roadCenter(vehicle.z, state.seed, state.mode);
  vehicle.x = center;
  vehicle.y = 0;
  vehicle.vx = 0;
  vehicle.vy = 0;
  vehicle.vz = 8;
  vehicle.heading = 0;
  vehicle.integrity = Math.max(vehicle.integrity, integrity);
  vehicle.downed = false;
  vehicle.revive = 0;
  vehicle.recoveryCooldown = 3;
}

function finishVehicle(state: SimulationState, vehicle: VehicleState) {
  vehicle.finished = true;
  vehicle.finishTime = state.elapsed;
  if (!state.winnerIds.length) state.winnerIds = [vehicle.id];
  emit(state, "finish", vehicle.id, undefined, "extracted", Math.round(state.elapsed * 1000));
  if (Object.values(state.players).every((player) => player.finished || player.downed)) finishMatch(state);
}

function finishMatch(state: SimulationState) {
  if (state.phase === "finished") return;
  state.phase = "finished";
  emit(state, "match-finished", state.winnerIds[0], undefined, state.mode);
}

export function calculateResult(state: SimulationState, playerId: string): RunResult {
  const player = state.players[playerId];
  if (!player) throw new Error("player_not_found");
  const ranking = Object.values(state.players).sort(
    state.mode === "drift-clash" ? (a, b) => b.driftScore - a.driftScore : compareRaceProgress,
  );
  const placement = Math.max(1, ranking.findIndex((entry) => entry.id === playerId) + 1);
  const score = Math.round(player.driftScore + player.cores * 800 + player.checkpoint * 250 + (player.finished ? 2500 : 0));
  return {
    mode: state.mode,
    seed: state.seed,
    placement,
    finished: player.finished,
    time: player.finishTime ?? state.elapsed,
    score,
    cores: player.cores,
    credits: Math.max(40, Math.round(score / 14)),
    reputation: Math.max(15, Math.round(score / 38)),
  };
}

export function applyResult(save: SaveV1, result: RunResult): SaveV1 {
  const next = sanitizeSave(save);
  next.credits = clamp(next.credits + result.credits, 0, 10_000_000);
  next.reputation = clamp(next.reputation + result.reputation, 0, 1_000_000);
  next.contractsCompleted += result.finished ? 1 : 0;
  const previous = next.bests[result.mode];
  if (result.finished && (previous === undefined || result.time < previous)) next.bests[result.mode] = result.time;
  if (next.reputation >= 1200 && !next.chassis.includes("apex")) next.chassis.push("apex");
  if (next.reputation >= 2600 && !next.chassis.includes("warden")) next.chassis.push("warden");
  if (next.reputation >= 4800 && !next.chassis.includes("wraith")) next.chassis.push("wraith");
  return next;
}

export function roadCenter(z: number, seed: number, mode: ModeId): number {
  if (mode === "drift-clash" || mode === "wreckyard") return 0;
  const phase = (seed % 997) * 0.001;
  const broad = Math.sin(z * 0.0024 + phase) * 24;
  const detail = Math.sin(z * 0.0073 + phase * 4.1) * 9;
  return broad + detail;
}

export function roadWidth(mode: ModeId): number {
  return mode === "drift-clash" || mode === "wreckyard" ? 88 : 29;
}

export function districtName(district: 1 | 2 | 3): string {
  return district === 1 ? "The Black Mile" : district === 2 ? "Furnace Works" : "Caldera Crown";
}

export function dailySeed(date = new Date()): number {
  return Number(`${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, "0")}${String(date.getUTCDate()).padStart(2, "0")}`);
}

export function cloneSnapshot(state: SimulationState): MatchSnapshot {
  return JSON.parse(JSON.stringify(state)) as MatchSnapshot;
}

function createPickups(mode: ModeId, seed: number, routeLength: number): PickupState[] {
  const rng = mulberry32(seed ^ 0x14c0ffee);
  const pickups: PickupState[] = [];
  const count = mode === "drift-clash" || mode === "wreckyard" ? 18 : 22;
  for (let index = 0; index < count; index += 1) {
    const z = mode === "drift-clash" || mode === "wreckyard" ? (rng() - 0.5) * 150 : 150 + (index / count) * (routeLength - 300);
    const center = roadCenter(z, seed, mode);
    pickups.push({
      id: `pickup-${index}`,
      kind: index % 5 === 0 ? "repair" : index % 3 === 0 ? "boost" : "core",
      x: center + (rng() - 0.5) * roadWidth(mode) * 1.35,
      z,
      active: true,
    });
  }
  return pickups;
}

function createHazards(mode: ModeId, seed: number, routeLength: number): HazardState[] {
  const rng = mulberry32(seed ^ 0x51adf00d);
  const hazards: HazardState[] = [];
  const count = mode === "drift-clash" || mode === "wreckyard" ? 14 : 18;
  for (let index = 0; index < count; index += 1) {
    const z = mode === "drift-clash" || mode === "wreckyard" ? (rng() - 0.5) * 180 : 260 + (index / count) * (routeLength - 500);
    const kind = index % 4 === 0 ? "vent" : index % 3 === 0 ? "barrier" : "lava";
    hazards.push({
      id: `hazard-${index}`,
      kind,
      x: roadCenter(z, seed, mode) + (rng() - 0.5) * roadWidth(mode) * 1.6,
      z,
      radius: kind === "barrier" ? 3.4 : 5 + rng() * 4,
      phase: rng() * Math.PI * 2,
    });
  }
  return hazards;
}

function createHunters(mode: ModeId, seed: number, playerIds: string[]): HunterState[] {
  if (mode !== "burn-run" && mode !== "burn-crew") return [];
  const rng = mulberry32(seed ^ 0x0badcafe);
  const archetypes: HunterState["archetype"][] = ["rammer", "interceptor", "warden", "reaper"];
  return archetypes.map((archetype, index) => ({
    id: `hunter-${archetype}`,
    archetype,
    x: (rng() - 0.5) * 20,
    z: -80 - index * 70,
    vx: 0,
    vz: 0,
    heading: 0,
    integrity: archetype === "reaper" ? 2 : 1,
    targetId: playerIds[index % Math.max(1, playerIds.length)] ?? "player",
  }));
}

function botInput(state: SimulationState, vehicle: VehicleState): InputFrame {
  if (state.mode === "drift-clash" || state.mode === "wreckyard") {
    const angle = state.elapsed * (0.32 + (hashString(vehicle.id) % 10) * 0.015) + (hashString(vehicle.id) % 360);
    const targetX = Math.sin(angle) * 58;
    const targetZ = Math.cos(angle) * 58;
    return steerToward(vehicle, targetX, targetZ, true, state.tick);
  }
  const lookAhead = 45 + Math.min(60, vehicle.speed * 0.8);
  const targetZ = vehicle.z + lookAhead;
  const targetX = roadCenter(targetZ, state.seed, state.mode);
  return steerToward(vehicle, targetX, targetZ, Math.abs(vehicle.x - targetX) > 7, state.tick);
}

function steerToward(vehicle: VehicleState, x: number, z: number, drift: boolean, seq: number): InputFrame {
  const targetHeading = Math.atan2(x - vehicle.x, z - vehicle.z);
  const delta = wrapAngle(targetHeading - vehicle.heading);
  return {
    seq,
    throttle: 1,
    steer: clamp(delta * 1.8, -1, 1),
    drift: drift && vehicle.speed > 24,
    boost: vehicle.boost > 0.3 && Math.abs(delta) < 0.28,
    jump: false,
    recover: false,
  };
}

function normalizeInput(input: InputFrame): InputFrame {
  return {
    seq: Math.max(0, Math.floor(Number(input.seq) || 0)),
    throttle: clamp(Number(input.throttle) || 0, -1, 1),
    steer: clamp(Number(input.steer) || 0, -1, 1),
    drift: Boolean(input.drift),
    boost: Boolean(input.boost),
    jump: Boolean(input.jump),
    recover: Boolean(input.recover),
  };
}

function compareRaceProgress(a: VehicleState, b: VehicleState): number {
  if (a.finished && b.finished) return (a.finishTime ?? Infinity) - (b.finishTime ?? Infinity);
  if (a.finished) return -1;
  if (b.finished) return 1;
  return b.z - a.z;
}

function emit(
  state: SimulationState,
  type: MatchEvent["type"],
  actorId?: string,
  targetId?: string,
  detail?: string,
  value?: number,
) {
  state.events.push({ tick: state.tick, type, actorId, targetId, detail, value });
}

function distanceSquared(ax: number, az: number, bx: number, bz: number): number {
  return (ax - bx) ** 2 + (az - bz) ** 2;
}

function wrapAngle(value: number): number {
  while (value > Math.PI) value -= Math.PI * 2;
  while (value < -Math.PI) value += Math.PI * 2;
  return value;
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
