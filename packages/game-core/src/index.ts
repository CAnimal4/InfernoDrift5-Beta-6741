import type { GameMode } from "@infernodrift4/protocol";
export type { GameMode } from "@infernodrift4/protocol";

export const SIM_DT = 1 / 60;

export type Vec2 = { x: number; z: number };
export type Phase =
  | "menu"
  | "tutorial"
  | "running"
  | "paused"
  | "won"
  | "failed"
  | "replay";
export type BotRole =
  | "hunter"
  | "racer"
  | "blocker"
  | "goalie"
  | "striker"
  | "support"
  | "bruiser"
  | "boss";
export type BotPersonality =
  | "aggressive"
  | "patient"
  | "chaotic"
  | "defensive"
  | "opportunist"
  | "rubberBand"
  | "showoff";

export type InputFrame = {
  throttle: number;
  steer: number;
  drift: boolean;
  boost: boolean;
  jump: boolean;
  brake: boolean;
};

export type CarState = {
  id: string;
  x: number;
  y: number;
  z: number;
  heading: number;
  vx: number;
  vy: number;
  vz: number;
  speed: number;
  boost: number;
  heat: number;
  health: number;
  grounded: boolean;
  driftCombo: number;
  airTime: number;
  landingGrade: "none" | "rough" | "clean" | "perfect";
  classId: string;
  paint: string;
};

export type BotState = CarState & {
  role: BotRole;
  personality: BotPersonality;
  team: "blue" | "red" | "neutral";
  mistake: number;
  target: Vec2;
  alert: number;
};

export type BallState = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
};

export type PickupState = {
  id: string;
  kind: "boost" | "shield" | "xp" | "repair" | "event";
  x: number;
  z: number;
  active: boolean;
  pulse: number;
};

export type ObjectiveState = {
  label: string;
  detail: string;
  target: number;
  progress: number;
  timer: number;
  medal: "none" | "bronze" | "silver" | "gold" | "inferno";
  failReason?: string;
};

export type ProgressionState = {
  xp: number;
  level: number;
  credits: number;
  streak: number;
  dailyDone: number;
  weeklyDone: number;
  unlocked: string[];
  loadouts: Loadout[];
  activeLoadout: number;
};

export type Loadout = {
  name: string;
  classId: string;
  paint: string;
  underglow: string;
  spoiler: string;
  trail: string;
  horn: string;
  goalExplosion: string;
};

export type SettingsState = {
  reducedMotion: boolean;
  cameraShake: number;
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  colorblind: boolean;
  touchPreset: "default" | "reachable" | "compact" | "lefty";
  graphics: "auto" | "performance" | "quality";
};

export type ReplayEvent = {
  tick: number;
  kind: "goal" | "near-miss" | "trick" | "crash" | "escape";
  label: string;
};

export type GameState = {
  tick: number;
  seed: number;
  phase: Phase;
  mode: GameMode;
  minigame: string;
  world: number;
  score: number;
  lives: number;
  player: CarState;
  bots: BotState[];
  ball: BallState;
  pickups: PickupState[];
  objective: ObjectiveState;
  progression: ProgressionState;
  settings: SettingsState;
  replay: ReplayEvent[];
  messages: string[];
  backend: "offline" | "connecting" | "online" | "reconnecting";
};

export type ModeConfig = {
  id: GameMode;
  name: string;
  short: string;
  target: number;
  duration: number;
  botRoles: BotRole[];
  worldIdentity: string;
};

export const modes: ModeConfig[] = [
  {
    id: "tutorial",
    name: "First Ignition",
    short: "Learn drift, boost, jump, and clean landings.",
    target: 4,
    duration: 90,
    botRoles: ["racer"],
    worldIdentity: "training-lane",
  },
  {
    id: "campaign",
    name: "Campaign Survival",
    short: "One more run through heat storms and hunter packs.",
    target: 1800,
    duration: 120,
    botRoles: ["hunter", "blocker", "bruiser"],
    worldIdentity: "cinder-city",
  },
  {
    id: "max-arena",
    name: "Max Arena",
    short: "Team car-ball combat with goals, replays, and roles.",
    target: 3,
    duration: 180,
    botRoles: ["goalie", "striker", "support"],
    worldIdentity: "max-dome",
  },
  {
    id: "race",
    name: "Race",
    short: "Hit flaming checkpoints before rival drivers steal the line.",
    target: 8,
    duration: 100,
    botRoles: ["racer", "blocker"],
    worldIdentity: "neon-circuit",
  },
  {
    id: "stunt-park",
    name: "Stunt Park",
    short: "Chain ramps, backflips, clean landings, and drift gates.",
    target: 2200,
    duration: 110,
    botRoles: ["showoff" as BotRole, "hunter"],
    worldIdentity: "solar-rampworks",
  },
  {
    id: "hunter-tag",
    name: "Hunter Tag",
    short: "Break pursuit and cash near misses before the pack adapts.",
    target: 10,
    duration: 105,
    botRoles: ["hunter", "hunter", "blocker"],
    worldIdentity: "tempest-grid",
  },
  {
    id: "boss-chase",
    name: "Boss Chase",
    short: "Survive phase attacks from an oversized world finale hunter.",
    target: 100,
    duration: 130,
    botRoles: ["boss", "hunter", "support"],
    worldIdentity: "obsidian-finale",
  },
  {
    id: "time-trial",
    name: "Time Trial",
    short: "Ghost your best run through clean gates.",
    target: 7,
    duration: 80,
    botRoles: [],
    worldIdentity: "ghostline",
  },
  {
    id: "drift-score",
    name: "Drift Score Attack",
    short: "Hold angle, dodge threats, and keep the combo alive.",
    target: 3200,
    duration: 100,
    botRoles: ["hunter"],
    worldIdentity: "smoke-yard",
  },
  {
    id: "battle-arena",
    name: "Battle Arena",
    short: "Demolish rivals, hold zones, and survive sudden death.",
    target: 6,
    duration: 150,
    botRoles: ["bruiser", "support", "blocker"],
    worldIdentity: "impact-bowl",
  },
  {
    id: "minigame",
    name: "Rotating Minigames",
    short:
      "Ramp Rush, Boost Bowling, Lava Floor, King of the Zone, Trick Combo, Bot Escape.",
    target: 5,
    duration: 75,
    botRoles: ["hunter", "racer"],
    worldIdentity: "event-stack",
  },
];

export const minigames = [
  "Ramp Rush",
  "Boost Bowling",
  "Lava Floor",
  "King of the Zone",
  "Trick Combo",
  "Bot Escape",
];

const personalities: BotPersonality[] = [
  "aggressive",
  "patient",
  "chaotic",
  "defensive",
  "opportunist",
  "rubberBand",
  "showoff",
];
const classTuning: Record<
  string,
  { accel: number; turn: number; grip: number; boost: number; mass: number }
> = {
  ember: { accel: 42, turn: 2.2, grip: 4.8, boost: 58, mass: 1 },
  comet: { accel: 48, turn: 2.45, grip: 4.2, boost: 64, mass: 0.9 },
  titan: { accel: 36, turn: 1.9, grip: 5.4, boost: 52, mass: 1.25 },
  phantom: { accel: 44, turn: 2.75, grip: 3.8, boost: 68, mass: 0.86 },
};

export function createRng(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function length2(x: number, z: number) {
  return Math.hypot(x, z);
}

function normalize(x: number, z: number): Vec2 {
  const len = length2(x, z) || 1;
  return { x: x / len, z: z / len };
}

function defaultLoadout(): Loadout {
  return {
    name: "Ignition",
    classId: "ember",
    paint: "Molten Red",
    underglow: "Cyan",
    spoiler: "Street Wing",
    trail: "Fireline",
    horn: "Pulse",
    goalExplosion: "Solar Burst",
  };
}

function makePlayer(): CarState {
  return {
    id: "player",
    x: 0,
    y: 0,
    z: -48,
    heading: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    speed: 0,
    boost: 1,
    heat: 0,
    health: 100,
    grounded: true,
    driftCombo: 1,
    airTime: 0,
    landingGrade: "none",
    classId: "ember",
    paint: "Molten Red",
  };
}

function makeObjective(config: ModeConfig): ObjectiveState {
  return {
    label: config.name,
    detail: config.short,
    target: config.target,
    progress: 0,
    timer: config.duration,
    medal: "none",
  };
}

export function createDefaultState(seed = 444): GameState {
  const config = modes[0]!;
  return {
    tick: 0,
    seed,
    phase: "menu",
    mode: "tutorial",
    minigame: minigames[0]!,
    world: 0,
    score: 0,
    lives: 3,
    player: makePlayer(),
    bots: [],
    ball: { x: 0, y: 4, z: 0, vx: 0, vy: 0, vz: 0 },
    pickups: [],
    objective: makeObjective(config),
    progression: {
      xp: 0,
      level: 1,
      credits: 0,
      streak: 0,
      dailyDone: 0,
      weeklyDone: 0,
      unlocked: ["ember", "Molten Red", "Cyan", "Fireline"],
      loadouts: [defaultLoadout()],
      activeLoadout: 0,
    },
    settings: {
      reducedMotion: false,
      cameraShake: 0.7,
      masterVolume: 0.85,
      musicVolume: 0.55,
      sfxVolume: 0.8,
      colorblind: false,
      touchPreset: "default",
      graphics: "auto",
    },
    replay: [],
    messages: ["Backend offline: bot mode ready."],
    backend: "offline",
  };
}

export class InfernoDriftSim {
  state: GameState;
  private rng: () => number;
  private jumpLatch = false;

  constructor(seed = 444) {
    this.state = createDefaultState(seed);
    this.rng = createRng(seed);
  }

  startMode(id: GameMode) {
    const config = modes.find((mode) => mode.id === id) ?? modes[0]!;
    const loadout =
      this.state.progression.loadouts[this.state.progression.activeLoadout] ??
      defaultLoadout();
    this.state.mode = config.id;
    this.state.phase = config.id === "tutorial" ? "tutorial" : "running";
    this.state.tick = 0;
    this.state.score = 0;
    this.state.lives = 3;
    this.state.player = {
      ...makePlayer(),
      classId: loadout.classId,
      paint: loadout.paint,
    };
    this.state.objective = makeObjective(config);
    this.state.ball = {
      x: 0,
      y: 4,
      z: config.id === "max-arena" ? 0 : 28,
      vx: 0,
      vy: 0,
      vz: 0,
    };
    this.state.minigame =
      minigames[Math.floor(this.rng() * minigames.length)] ?? minigames[0]!;
    this.state.bots = this.createBots(config);
    this.state.pickups = this.createPickups(config);
    this.state.replay = [];
    this.state.messages = [`${config.name} armed. ${config.short}`];
  }

  togglePause() {
    if (this.state.phase === "running" || this.state.phase === "tutorial")
      this.state.phase = "paused";
    else if (this.state.phase === "paused")
      this.state.phase =
        this.state.mode === "tutorial" ? "tutorial" : "running";
  }

  applyLoadout(loadout: Partial<Loadout>) {
    const index = this.state.progression.activeLoadout;
    const current = this.state.progression.loadouts[index] ?? defaultLoadout();
    this.state.progression.loadouts[index] = { ...current, ...loadout };
    this.state.player.classId = this.state.progression.loadouts[index]!.classId;
    this.state.player.paint = this.state.progression.loadouts[index]!.paint;
  }

  addLoadout() {
    if (this.state.progression.loadouts.length >= 4) return;
    this.state.progression.loadouts.push({
      ...defaultLoadout(),
      name: `Loadout ${this.state.progression.loadouts.length + 1}`,
    });
    this.state.progression.activeLoadout =
      this.state.progression.loadouts.length - 1;
  }

  step(input: InputFrame, dt = SIM_DT) {
    if (!["running", "tutorial"].includes(this.state.phase)) return;
    this.state.tick += 1;
    this.state.objective.timer = Math.max(0, this.state.objective.timer - dt);
    this.updatePlayer(input, dt);
    this.updateBots(dt);
    this.updateBall(dt);
    this.updatePickups();
    this.updateObjective(dt);
    this.checkEndConditions();
  }

  serialize() {
    const { state } = this;
    return {
      coordinateSystem: "x right, z forward, y up, origin arena center",
      tick: state.tick,
      phase: state.phase,
      mode: state.mode,
      minigame: state.minigame,
      score: Math.round(state.score),
      lives: state.lives,
      backend: state.backend,
      objective: state.objective,
      player: {
        x: Number(state.player.x.toFixed(2)),
        y: Number(state.player.y.toFixed(2)),
        z: Number(state.player.z.toFixed(2)),
        speed: Number(state.player.speed.toFixed(2)),
        boost: Number(state.player.boost.toFixed(2)),
        heat: Number(state.player.heat.toFixed(2)),
        health: Math.round(state.player.health),
        grounded: state.player.grounded,
        driftCombo: Number(state.player.driftCombo.toFixed(2)),
        landingGrade: state.player.landingGrade,
        classId: state.player.classId,
      },
      bots: state.bots.map((bot) => ({
        id: bot.id,
        role: bot.role,
        personality: bot.personality,
        team: bot.team,
        x: Number(bot.x.toFixed(1)),
        z: Number(bot.z.toFixed(1)),
        alert: Number(bot.alert.toFixed(2)),
      })),
      ball: {
        x: Number(state.ball.x.toFixed(1)),
        z: Number(state.ball.z.toFixed(1)),
        y: Number(state.ball.y.toFixed(1)),
      },
      pickups: state.pickups
        .filter((pickup) => pickup.active)
        .map((pickup) => ({
          id: pickup.id,
          kind: pickup.kind,
          x: pickup.x,
          z: pickup.z,
        })),
      replay: state.replay.slice(-5),
      messages: state.messages.slice(-3),
    };
  }

  private updatePlayer(input: InputFrame, dt: number) {
    const car = this.state.player;
    const tuning = classTuning[car.classId] ?? classTuning.ember!;
    const forward = { x: Math.sin(car.heading), z: Math.cos(car.heading) };
    const speedRatio = clamp(car.speed / 75, 0, 1);
    const driftMult = input.drift ? 1.35 : 1;
    const turn =
      input.steer * tuning.turn * (0.35 + speedRatio) * driftMult * dt;
    car.heading -= turn;

    const throttleForce = input.throttle * tuning.accel;
    const boostForce = input.boost && car.boost > 0 ? tuning.boost : 0;
    if (input.boost && car.boost > 0) {
      car.boost = Math.max(0, car.boost - dt * 0.28);
      this.addReplay("escape", "Boost surge");
    }
    car.vx += forward.x * (throttleForce + boostForce) * dt;
    car.vz += forward.z * (throttleForce + boostForce) * dt;

    if (input.brake) {
      car.vx *= 0.975;
      car.vz *= 0.975;
    }

    if (input.jump && !this.jumpLatch && car.grounded) {
      car.vy = 12;
      car.grounded = false;
      car.airTime = 0;
      this.addReplay("trick", "Ramp launch");
    }
    this.jumpLatch = input.jump;

    const lateral =
      car.vx * Math.cos(car.heading) - car.vz * Math.sin(car.heading);
    const grip = input.drift ? tuning.grip * 0.42 : tuning.grip;
    car.vx -= Math.cos(car.heading) * lateral * grip * dt;
    car.vz += Math.sin(car.heading) * lateral * grip * dt;

    const maxSpeed = (input.boost ? 92 : 68) + (car.grounded ? 0 : 7);
    const planar = length2(car.vx, car.vz);
    if (planar > maxSpeed) {
      car.vx = (car.vx / planar) * maxSpeed;
      car.vz = (car.vz / planar) * maxSpeed;
    }

    car.vx *= 1 - dt * (input.drift ? 0.18 : 0.42);
    car.vz *= 1 - dt * (input.drift ? 0.18 : 0.42);
    car.vy -= 24 * dt;
    car.x += car.vx * dt;
    car.y += car.vy * dt;
    car.z += car.vz * dt;

    if (Math.abs(car.x) > 145) {
      car.x = Math.sign(car.x) * 145;
      car.vx *= -0.45;
      car.health -= 2;
      this.addReplay("crash", "Wall impact");
    }
    if (Math.abs(car.z) > 145) {
      car.z = Math.sign(car.z) * 145;
      car.vz *= -0.45;
      car.health -= 2;
      this.addReplay("crash", "Wall impact");
    }

    if (car.y <= 0) {
      if (!car.grounded) {
        const grade =
          car.airTime > 1.2 && Math.abs(lateral) < 8
            ? "perfect"
            : car.airTime > 0.7
              ? "clean"
              : "rough";
        car.landingGrade = grade;
        if (grade === "perfect") {
          car.boost = Math.min(1, car.boost + 0.22);
          this.state.score += 180;
          this.addReplay("trick", "Perfect landing boost");
        }
      }
      car.y = 0;
      car.vy = 0;
      car.grounded = true;
      car.airTime = 0;
    } else {
      car.grounded = false;
      car.airTime += dt;
    }

    car.speed = length2(car.vx, car.vz);
    if (input.drift && car.speed > 18) {
      car.driftCombo = Math.min(9.9, car.driftCombo + dt * 0.9);
      stateAddScore(this.state, 40 * car.driftCombo * dt);
    } else {
      car.driftCombo = Math.max(1, car.driftCombo - dt * 0.6);
    }
    car.heat = clamp(
      car.heat +
        dt *
          (this.state.mode === "campaign" || this.state.mode === "boss-chase"
            ? 0.035
            : 0.015) -
        (input.boost ? dt * 0.03 : 0),
      0,
      1,
    );
  }

  private updateBots(dt: number) {
    const player = this.state.player;
    for (const bot of this.state.bots) {
      const toPlayer = normalize(player.x - bot.x, player.z - bot.z);
      const isGoalie = bot.role === "goalie";
      const target =
        this.state.mode === "max-arena" && !isGoalie
          ? { x: this.state.ball.x, z: this.state.ball.z }
          : bot.target;
      const toTarget = normalize(target.x - bot.x, target.z - bot.z);
      const pressure =
        bot.personality === "patient"
          ? 0.78
          : bot.personality === "chaotic"
            ? 1.12
            : 1;
      const speed =
        bot.role === "boss"
          ? 35
          : bot.role === "bruiser"
            ? 28
            : bot.role === "racer"
              ? 34
              : 31;
      const desired =
        bot.role === "hunter" || bot.role === "boss" ? toPlayer : toTarget;
      bot.vx += desired.x * speed * pressure * dt;
      bot.vz += desired.z * speed * pressure * dt;
      bot.vx *= 1 - dt * 0.8;
      bot.vz *= 1 - dt * 0.8;
      bot.x += bot.vx * dt;
      bot.z += bot.vz * dt;
      bot.heading = Math.atan2(bot.vx, bot.vz);
      bot.speed = length2(bot.vx, bot.vz);
      bot.alert = clamp(
        1 - length2(player.x - bot.x, player.z - bot.z) / 70,
        0,
        1,
      );

      if (bot.alert > 0.78) {
        this.state.score += 6;
        if (this.state.tick % 40 === 0)
          this.addReplay(
            "near-miss",
            `${bot.personality} ${bot.role} near miss`,
          );
      }
      if (
        length2(player.x - bot.x, player.z - bot.z) <
        (bot.role === "boss" ? 8 : 5.5)
      ) {
        player.health -= bot.role === "boss" ? 20 * dt : 12 * dt;
        player.heat = clamp(player.heat + dt * 0.08, 0, 1);
      }

      if (Math.abs(bot.x) > 145) bot.x = Math.sign(bot.x) * 145;
      if (Math.abs(bot.z) > 145) bot.z = Math.sign(bot.z) * 145;
    }
  }

  private updateBall(dt: number) {
    if (!["max-arena", "battle-arena", "minigame"].includes(this.state.mode))
      return;
    const ball = this.state.ball;
    const player = this.state.player;
    const hitPlayer = length2(player.x - ball.x, player.z - ball.z) < 8;
    if (hitPlayer) {
      const dir = normalize(ball.x - player.x, ball.z - player.z);
      ball.vx += dir.x * (18 + player.speed * 0.34);
      ball.vz += dir.z * (18 + player.speed * 0.34);
      this.state.score += 16;
      this.addReplay("goal", "Ball touch");
    }
    for (const bot of this.state.bots) {
      if (length2(bot.x - ball.x, bot.z - ball.z) < 7) {
        const dir = normalize(ball.x - bot.x, ball.z - bot.z);
        ball.vx += dir.x * 16;
        ball.vz += dir.z * 16;
      }
    }
    ball.vy -= 18 * dt;
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;
    ball.z += ball.vz * dt;
    ball.vx *= 0.992;
    ball.vz *= 0.992;
    if (ball.y < 3.2) {
      ball.y = 3.2;
      ball.vy = Math.abs(ball.vy) * 0.42;
    }
    if (Math.abs(ball.x) > 135) {
      ball.x = Math.sign(ball.x) * 135;
      ball.vx *= -0.7;
    }
    if (Math.abs(ball.z) > 142) {
      if (this.state.mode === "max-arena" && Math.abs(ball.x) < 36) {
        this.state.objective.progress += 1;
        this.state.score += 500;
        this.addReplay("goal", "Goal replay");
        ball.x = 0;
        ball.z = 0;
        ball.vx = 0;
        ball.vz = 0;
      } else {
        ball.z = Math.sign(ball.z) * 142;
        ball.vz *= -0.72;
      }
    }
  }

  private updatePickups() {
    for (const pickup of this.state.pickups) {
      pickup.pulse += 0.08;
      if (!pickup.active) continue;
      if (
        length2(
          this.state.player.x - pickup.x,
          this.state.player.z - pickup.z,
        ) < 7
      ) {
        pickup.active = false;
        if (pickup.kind === "boost") this.state.player.boost = 1;
        if (pickup.kind === "repair")
          this.state.player.health = Math.min(
            100,
            this.state.player.health + 35,
          );
        if (pickup.kind === "xp") this.state.progression.xp += 25;
        this.state.score += 120;
        this.state.objective.progress += this.state.mode === "minigame" ? 1 : 0;
        this.state.messages.push(`${pickup.kind} pickup collected`);
      }
    }
  }

  private updateObjective(dt: number) {
    const state = this.state;
    switch (state.mode) {
      case "tutorial":
        state.objective.progress = Math.max(
          state.objective.progress,
          Math.min(
            4,
            Math.floor(state.tick / 360) + (state.player.boost < 0.8 ? 1 : 0),
          ),
        );
        break;
      case "campaign":
      case "drift-score":
        state.objective.progress = Math.max(
          state.objective.progress,
          state.score,
        );
        break;
      case "race":
      case "time-trial":
        state.objective.progress = Math.max(
          state.objective.progress,
          Math.floor((state.player.z + 150) / 35),
        );
        if (state.player.z > 144) {
          state.player.z = -144;
          state.player.x *= -0.3;
        }
        break;
      case "stunt-park":
        state.objective.progress = Math.max(
          state.objective.progress,
          state.score + state.player.airTime * 220,
        );
        break;
      case "hunter-tag":
        state.objective.progress += state.bots.reduce(
          (sum, bot) => sum + (bot.alert > 0.7 ? dt : 0),
          0,
        );
        break;
      case "boss-chase":
        state.objective.progress = Math.min(
          100,
          state.objective.progress + dt * (state.player.speed > 30 ? 3.4 : 1.4),
        );
        break;
      case "battle-arena":
        state.objective.progress += state.bots.filter(
          (bot) => bot.health <= 0,
        ).length;
        break;
      default:
        break;
    }
  }

  private checkEndConditions() {
    const state = this.state;
    if (state.player.health <= 0 || state.player.heat >= 1) {
      state.lives -= 1;
      state.player.health = 100;
      state.player.heat = 0.45;
      state.messages.push("Crash recovered. One life spent.");
      this.addReplay("crash", "Critical crash");
      if (state.lives <= 0)
        this.fail(state.player.heat >= 1 ? "Heat critical" : "Car wrecked");
    }
    if (state.objective.progress >= state.objective.target)
      this.win("Objective complete");
    if (state.objective.timer <= 0) {
      if (
        ["campaign", "hunter-tag", "boss-chase", "drift-score"].includes(
          state.mode,
        )
      )
        this.win("Survived the clock");
      else this.fail("Time expired");
    }
  }

  private win(reason: string) {
    if (this.state.phase === "won") return;
    this.state.phase = "won";
    this.state.objective.medal =
      this.state.objective.timer > 30
        ? "gold"
        : this.state.objective.timer > 12
          ? "silver"
          : "bronze";
    this.state.progression.xp += 100 + Math.round(this.state.score / 25);
    this.state.progression.credits += 35;
    this.state.progression.streak += 1;
    this.unlockRewards();
    this.state.messages.push(reason);
  }

  private fail(reason: string) {
    if (this.state.phase === "failed") return;
    this.state.phase = "failed";
    this.state.objective.failReason = reason;
    this.state.progression.streak = 0;
    this.state.messages.push(reason);
  }

  private unlockRewards() {
    const unlocks = [
      "Comet Chassis",
      "Inferno Underglow",
      "Specter Paint",
      "Meteor Spoiler",
      "Solar Burst",
      "Phantom Class",
    ];
    const next = unlocks.find(
      (item) => !this.state.progression.unlocked.includes(item),
    );
    if (next) this.state.progression.unlocked.push(next);
    this.state.progression.level =
      1 + Math.floor(this.state.progression.xp / 500);
  }

  private addReplay(kind: ReplayEvent["kind"], label: string) {
    if (
      this.state.replay.at(-1)?.label === label &&
      this.state.tick - (this.state.replay.at(-1)?.tick ?? 0) < 25
    )
      return;
    this.state.replay.push({ tick: this.state.tick, kind, label });
    if (this.state.replay.length > 32) this.state.replay.shift();
  }

  private createBots(config: ModeConfig): BotState[] {
    return config.botRoles.map((role, index) => {
      const angle =
        (Math.PI * 2 * index) / Math.max(1, config.botRoles.length) +
        this.rng() * 0.4;
      const radius = role === "boss" ? 60 : 42 + this.rng() * 46;
      return {
        ...makePlayer(),
        id: `bot-${index + 1}`,
        x: Math.sin(angle) * radius,
        z: Math.cos(angle) * radius,
        role,
        personality:
          personalities[
            (index + Math.floor(this.rng() * personalities.length)) %
              personalities.length
          ]!,
        team: index % 2 === 0 ? "red" : "blue",
        mistake: this.rng() * 0.35,
        target: { x: (this.rng() - 0.5) * 150, z: (this.rng() - 0.5) * 150 },
        alert: 0,
        classId: role === "boss" ? "titan" : "comet",
        paint: role === "boss" ? "Obsidian" : "Rival Neon",
      };
    });
  }

  private createPickups(config: ModeConfig): PickupState[] {
    const count = config.id === "tutorial" ? 4 : 10;
    return Array.from({ length: count }, (_, index) => {
      const kind =
        index % 5 === 0
          ? "repair"
          : index % 3 === 0
            ? "xp"
            : config.id === "minigame"
              ? "event"
              : "boost";
      return {
        id: `pickup-${index}`,
        kind,
        x: Math.round((this.rng() - 0.5) * 230),
        z: Math.round((this.rng() - 0.5) * 230),
        active: true,
        pulse: this.rng() * 10,
      };
    });
  }
}

function stateAddScore(state: GameState, points: number) {
  state.score += points;
}

export function saveState(state: GameState) {
  return JSON.stringify({
    version: 1,
    progression: state.progression,
    settings: state.settings,
    activeMode: state.mode,
    savedAt: Date.now(),
  });
}

export function restoreState(
  raw: string,
  state = createDefaultState(),
): GameState {
  const parsed = JSON.parse(raw) as Partial<{
    version: number;
    progression: ProgressionState;
    settings: SettingsState;
    activeMode: GameMode;
  }>;
  if (parsed.version !== 1) return state;
  if (parsed.progression) state.progression = parsed.progression;
  if (parsed.settings) state.settings = parsed.settings;
  if (parsed.activeMode) state.mode = parsed.activeMode;
  return state;
}

export function defaultInput(): InputFrame {
  return {
    throttle: 0,
    steer: 0,
    drift: false,
    boost: false,
    jump: false,
    brake: false,
  };
}
