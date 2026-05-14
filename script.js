import * as THREE from "https://unpkg.com/three@0.161.0/build/three.module.js";

const canvas = document.getElementById("game");
const overlay = document.getElementById("overlay");
const message = document.getElementById("message");
const messageTitle = document.getElementById("message-title");
const messageBody = document.getElementById("message-body");
const startBtn = document.getElementById("start-btn");
const overlaySubtitle = document.getElementById("overlay-subtitle");
const tutorialBtn = document.getElementById("tutorial-btn");
const tips = document.getElementById("tips");
const controlsList = document.getElementById("controls-list");
const howtoList = document.getElementById("howto-list");
const nextBtn = document.getElementById("next-btn");
const retryBtn = document.getElementById("retry-btn");
const boostBar = document.getElementById("boost-bar");
const shieldBar = document.getElementById("shield-bar");
const statusLabelNodes = document.querySelectorAll(".status .pill .label");
const debugHud = document.getElementById("debug-hud");
const matchPanel = document.getElementById("match-panel");
const matchPanelScore = document.getElementById("match-panel-score");
const matchPanelStats = document.getElementById("match-panel-stats");
const matchPanelMeta = document.getElementById("match-panel-meta");
const progressBar = document.getElementById("progress");
const hudWorld = document.getElementById("hud-world");
const hudLevel = document.getElementById("hud-level");
const hudTime = document.getElementById("hud-time");
const hudScore = document.getElementById("hud-score");
const hudSpeed = document.getElementById("hud-speed");
const hudLives = document.getElementById("hud-lives");
const hudHearts = document.getElementById("hud-hearts");
const hudCombo = document.getElementById("hud-combo");
const hudLabelNodes = document.querySelectorAll(".hud .pill .label");
const hudWorldPill = hudWorld?.closest(".pill");
const hudLevelPill = hudLevel?.closest(".pill");
const hudTimePill = hudTime?.closest(".pill");
const hudScorePill = hudScore?.closest(".pill");
const hudSpeedPill = hudSpeed?.closest(".pill");
const hudLivesPill = hudLives?.closest(".pill");
const hudComboPill = hudCombo?.closest(".pill");
const touchJump = document.getElementById("touch-jump");
const touchDrift = document.getElementById("touch-drift");
const touchBoost = document.getElementById("touch-boost");
const touchBackflip = document.getElementById("touch-backflip");
const minimapCanvas = document.getElementById("minimap");
const minimapCtx = minimapCanvas ? minimapCanvas.getContext("2d") : null;
const menu = document.getElementById("menu");
const menuBtn = document.getElementById("menu-btn");
const menuClose = document.getElementById("menu-close");
const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");
const gamesTabBtn = document.getElementById("games-tab-btn");
const gameModeHint = document.getElementById("game-mode-hint");
const gameCards = document.querySelectorAll("[data-game-mode]");
const id4ModeCards = document.querySelectorAll("[data-id4-mode]");
const progressionBoard = document.getElementById("progression-board");
const challengeList = document.getElementById("challenge-list");
const onlineStatusCard = document.getElementById("online-status-card");
const onlineFeatureList = document.getElementById("online-feature-list");
const onlineServerUrlInput = document.getElementById("online-server-url");
const onlineUsernameInput = document.getElementById("online-username");
const onlineRoomCodeInput = document.getElementById("online-room-code");
const onlinePlaylistSelect = document.getElementById("online-playlist");
const onlineBotfillToggle = document.getElementById("online-botfill");
const onlineConnectBtn = document.getElementById("online-connect");
const onlineDisconnectBtn = document.getElementById("online-disconnect");
const onlineCreateRoomBtn = document.getElementById("online-create-room");
const onlineJoinRoomBtn = document.getElementById("online-join-room");
const onlineQueueBtn = document.getElementById("online-queue");
const onlineRoomState = document.getElementById("online-room-state");
const onlineRoomList = document.getElementById("online-room-list");
const onlineChatLog = document.getElementById("online-chat-log");
const onlineChatInput = document.getElementById("online-chat-input");
const onlineChatSend = document.getElementById("online-chat-send");
const onlineQuickChatButtons = document.querySelectorAll("[data-quick-chat]");
const onlineLeaderboard = document.getElementById("online-leaderboard");
const onlineSocialList = document.getElementById("online-social-list");
const difficultySelect = document.getElementById("difficulty-select");
const campaignAiSelect = document.getElementById("campaign-ai-select");
const maxDifficultyField = document.getElementById("max-difficulty-field");
const maxDifficultySelect = document.getElementById("max-difficulty-select");
const invertToggle = document.getElementById("invert-toggle");
const cameraToggle = document.getElementById("camera-toggle");
const rampDensitySelect = document.getElementById("ramp-density-select");
const modeSettingsHint = document.getElementById("mode-settings-hint");
const devModeToggle = document.getElementById("dev-mode-toggle");
const devModeStatus = document.getElementById("dev-mode-status");
const devModeHint = document.getElementById("dev-mode-hint");
const devTools = document.getElementById("dev-tools");
const devPlayerSpeed = document.getElementById("dev-player-speed");
const devPlayerSpeedValue = document.getElementById("dev-player-speed-value");
const devBotSpeed = document.getElementById("dev-bot-speed");
const devBotSpeedValue = document.getElementById("dev-bot-speed-value");
const devInfiniteBoost = document.getElementById("dev-infinite-boost");
const devInvulnerable = document.getElementById("dev-invulnerable");
const devFreezeBots = document.getElementById("dev-freeze-bots");
const devWorldSelect = document.getElementById("dev-world-select");
const devLevelSelect = document.getElementById("dev-level-select");
const devDebugHud = document.getElementById("dev-debug-hud");
const devDebugLogs = document.getElementById("dev-debug-logs");
const devMaxDemoToggle = document.getElementById("dev-max-demo-toggle");
const devMaxReplayToggle = document.getElementById("dev-max-replay-toggle");
const devMaxBoostVariant = document.getElementById("dev-max-boost-variant");
const devWorldModifierSelect = document.getElementById(
  "dev-world-modifier-select",
);
const devMaxSummary = document.getElementById("dev-max-summary");
const devId33Panel = document.getElementById("dev-id33-panel");
const devMaxPanel = document.getElementById("dev-max-panel");
const devRefillBoost = document.getElementById("dev-refill-boost");
const devRefillShield = document.getElementById("dev-refill-shield");
const devCoolBots = document.getElementById("dev-cool-bots");
const devHeal = document.getElementById("dev-heal");
const devClearLevel = document.getElementById("dev-clear-level");
const devResetMatch = document.getElementById("dev-reset-match");
const devResetScore = document.getElementById("dev-reset-score");
const devTriggerReplay = document.getElementById("dev-trigger-replay");
const devForceDemo = document.getElementById("dev-force-demo");
const devResetTuning = document.getElementById("dev-reset-tuning");
const deviceModeSelect = document.getElementById("device-mode-select");
const deviceModeActive = document.getElementById("device-mode-active");
const bodySelect = document.getElementById("body-select");
const wheelSelect = document.getElementById("wheel-select");
const styleSelect = document.getElementById("style-select");
const powerSelect = document.getElementById("power-select");
const paintSelect = document.getElementById("paint-select");
const accentSelect = document.getElementById("accent-select");
const tintSelect = document.getElementById("tint-select");
const spoilerSelect = document.getElementById("spoiler-select");
const glowSelect = document.getElementById("glow-select");
const customStats = document.getElementById("custom-stats");
const customHint = document.getElementById("custom-hint");
const touchControlsRoot = document.getElementById("touch-controls");
const touchSteerPad = document.getElementById("touch-steer-pad");
const touchSteerKnob = document.getElementById("touch-steer-knob");

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = false;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0b0f14, 48, 620);

const camera = new THREE.PerspectiveCamera(
  62,
  window.innerWidth / window.innerHeight,
  0.1,
  860,
);
camera.position.set(0, 7.5, 14);

const hemi = new THREE.HemisphereLight(0xf4fbff, 0x12334f, 1.05);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xffd8aa, 1.15);
sun.position.set(18, 28, 14);
scene.add(sun);

const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x0c1016,
  roughness: 0.9,
});
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(1800, 1800),
  groundMaterial,
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.02;
scene.add(ground);

const arena = new THREE.Group();
const props = new THREE.Group();
scene.add(arena, props);

const WORLD_SIZE = 820;
const HALF_WORLD = WORLD_SIZE / 2;
const CAR_RADIUS = 1.4;
const BOT_RADIUS = 1.4;
const POWERUP_PICKUP_RADIUS = 3.1;
const POWERUP_VISUAL_SCALE = 1.45;
const GRAVITY = -20;
const PHYSICS_SUBSTEPS_BASE = 2;
const PHYSICS_SUBSTEPS_MAX = 7;
const RAMP_TRIGGER_THICKNESS = 1.4;
const RAMP_SPEED_MARGIN_MULT = 0.145;
const RAMP_LAUNCH_VERTICAL_MULT = 1.24;
const RAMP_NEAR_MISS_FIX_ENABLED = true;
const RAMP_MAX_SPEED_MARGIN = 6.2;
const RAMP_MIN_CENTER_BOOST = 0.33;
const RAMP_MAX_GROUNDED_Y_FOR_TRIGGER = 0.45;
const RAMP_MIN_INWARD_APPROACH_DOT = 0.28;
const RAMP_CORE_RADIUS_FACTOR = 0.62;
const BOT_HIT_RADIUS = BOT_RADIUS + CAR_RADIUS + 0.65;
const BOT_VERTICAL_HIT_TOLERANCE = 1.05;
const BOT_COLLISION_HEIGHT = 0.8;
const BOT_HIT_COOLDOWN_MS = 420;
const POST_HIT_SAFE_FRAMES = 8;
const SPEED_TO_MPH_MULT = 2.32;
const PLAYER_MAX_SPEED = 64;
const PLAYER_BOOST_SPEED_MULT = 1.32;
const PLAYER_ACCEL_MULT = 1.16;
const PAD_SPEED_BOOST_DURATION = 2.1;
const PAD_SPEED_BOOST_MULT = 1.34;
const AIRBORNE_CRUISE_MPH = 320;
const AIRBORNE_BOOST_MPH = 348;
const AIRBORNE_SPEED_BONUS = 6.5;
const AIRBORNE_BOOST_ACCEL_MULT = 1.14;
const AIRBORNE_BOOST_CAP_MULT = 1.18;
const DEV_MODE_PASSWORDS = ["ibelikesheesh", "pandamo2011"];
const BACKFLIP_DURATION = 0.78;
const BACKFLIP_RECOVERY_DURATION = 0.3;
const SAVE_STORAGE_KEY = "infernoDrift4.save.v2";
const GAME_MODE_ID33 = "infernodrift33";
const GAME_MODE_MAX1 = "infernodriftmax1";
const GAME_MODE_RISK = "tryatyourownrisk";
const ID4_MODE_DEFAULT = "tutorial";
const MAX_DIFFICULTY_SUPER_EASY = "super_easy";
const MAX_DIFFICULTY_CASUAL = "casual";
const MAX_DIFFICULTY_CLASSIC = "classic";
const MAX_DIFFICULTY_BRUTAL = "brutal";
const MAX_MODE_MATCH_TIME = 180;
const MAX_MODE_GOAL_TARGET = 5;
const MAX_ARENA_HALF_WIDTH = 136;
const MAX_ARENA_HALF_LENGTH = 182;
const MAX_ARENA_WALL_HEIGHT = 20;
const MAX_GOAL_WIDTH = 52;
const MAX_GOAL_HEIGHT = 19;
const MAX_GOAL_DEPTH = 18;
const MAX_GOAL_LINE_Z = MAX_ARENA_HALF_LENGTH - 26;
const MAX_BALL_RADIUS = 4.2;
const MAX_BALL_DRAG = 0.996;
const MAX_BALL_BOUNCE = 0.78;
const MAX_CAR_BUMP_FORCE = 16;
const MAX_MODE_SPEED_MULT = 0.9;
const MAX_MODE_TURN_MULT = 0.98;
const MAX_HEALTH_MAX = 100;
const MAX_STUN_DURATION = 1.15;
const MAX_HEALTH_REFILL_RATE = 18;
const MAX_BALL_LUNGE_RANGE = 54;
const MAX_BALL_LUNGE_COOLDOWN = 0.8;
const MAX_BOT_LUNGE_RANGE = 42;
const MAX_BOT_LUNGE_COOLDOWN = 1.1;
const DEFAULT_CUSTOMIZATION = {
  bodyId: "street",
  wheelId: "grip",
  styleId: "balanced",
  powerId: "nitro_core",
  paintId: "ember",
  accentId: "carbon",
  tintId: "smoke",
  spoilerId: "none",
  glowId: "cyan",
};
const DEFAULT_MAX_TEAM_CUSTOMIZATION = {
  blue: {
    paintId: "frost",
    accentId: "ice",
    tintId: "midnight",
    glowId: "cyan",
  },
  red: {
    paintId: "ember",
    accentId: "copper",
    tintId: "sunset",
    glowId: "lava",
  },
};
const DEFAULT_DEV_TUNING = {
  playerSpeedMult: 1,
  botSpeedMult: 1,
  infiniteBoost: false,
  invulnerable: false,
  freezeBots: false,
  allowDemolitions: true,
  allowReplay: true,
  maxBoostVariant: "super",
  worldModifier: "world",
};
const RISK_MODE_RULES = {
  teamPressureBase: 1.18,
  reactionLead: 0.66,
  recoveryLead: 0.34,
  passingBias: 0.3,
  rotationMemoryWeight: 0.28,
  emergencyDropDepth: 52,
  lungeRateMult: 1.45,
  boostTriggerRange: 40,
  supportSpacing: 58,
};
const DRIVING_TUNING = {
  grounded: {
    steerFilter: 10.2,
    driftSteerFilter: 6.3,
    turnAssistBase: 0.9,
    turnAssistLowSpeedBonus: 0.52,
    driftTurnMult: 1.28,
    coastDragBase: 7.2,
    coastDragSpeedMult: 4.6,
    brakeMult: 1.08,
    touchSlipMult: 0.88,
  },
  airborne: {
    steerMult: 0.68,
    accelMult: 0.88,
    boostAccelMult: 1.24,
    carryCoastMult: 0.36,
  },
  maxMode: {
    speedMult: 0.78,
    steerFilter: 6.8,
    turnMult: 0.86,
    capMult: 0.96,
    turnAssistBase: 1.08,
    turnAssistLowSpeedBonus: 0.56,
    coastDragBase: 5.8,
    coastDragSpeedMult: 3.2,
    roadSlipMult: 0.4,
    driftTurnMult: 1.16,
  },
};
const WORLD_RULES = [
  {
    id: "cinder_city",
    name: "Cinder City",
    gripMult: 0.99,
    driftSlipMult: 1.08,
    boostMult: 1.04,
    coastDragMult: 0.97,
    padEnergyMult: 1.06,
    rampKickMult: 1.02,
  },
  {
    id: "glacier_surge",
    name: "Glacier Surge",
    gripMult: 0.9,
    driftSlipMult: 1.18,
    boostMult: 0.98,
    coastDragMult: 0.92,
    padEnergyMult: 1,
    rampKickMult: 1.01,
  },
  {
    id: "solar_rift",
    name: "Solar Rift",
    gripMult: 1.02,
    driftSlipMult: 1,
    boostMult: 1.08,
    coastDragMult: 0.96,
    padEnergyMult: 1.1,
    rampKickMult: 1.08,
  },
  {
    id: "tempest_grid",
    name: "Tempest Grid",
    gripMult: 1.06,
    driftSlipMult: 0.94,
    boostMult: 1.03,
    coastDragMult: 1.02,
    padEnergyMult: 1.02,
    rampKickMult: 0.98,
  },
  {
    id: "obsidian_expanse",
    name: "Obsidian Expanse",
    gripMult: 1.1,
    driftSlipMult: 0.9,
    boostMult: 0.99,
    coastDragMult: 1.05,
    padEnergyMult: 0.96,
    rampKickMult: 1.04,
  },
];
const WORLD_MODIFIER_RULES = {
  world: {
    label: "World Native",
    gripMult: 1,
    driftSlipMult: 1,
    boostMult: 1,
    coastDragMult: 1,
    padEnergyMult: 1,
    rampKickMult: 1,
  },
  neutral: {
    label: "Neutral",
    gripMult: 1,
    driftSlipMult: 1,
    boostMult: 1,
    coastDragMult: 1,
    padEnergyMult: 1,
    rampKickMult: 1,
  },
  traction_lab: {
    label: "Traction Lab",
    gripMult: 1.12,
    driftSlipMult: 0.88,
    boostMult: 1.02,
    coastDragMult: 1.03,
    padEnergyMult: 0.98,
    rampKickMult: 0.96,
  },
  drift_lab: {
    label: "Drift Lab",
    gripMult: 0.86,
    driftSlipMult: 1.18,
    boostMult: 1.03,
    coastDragMult: 0.94,
    padEnergyMult: 1.02,
    rampKickMult: 1,
  },
  boost_lab: {
    label: "Boost Lab",
    gripMult: 1,
    driftSlipMult: 1,
    boostMult: 1.14,
    coastDragMult: 0.95,
    padEnergyMult: 1.18,
    rampKickMult: 1.05,
  },
};
const MAX_BOOST_VARIANTS = [
  {
    id: "standard",
    name: "Standard",
    pickupBoost: 0.32,
    padSpeedMult: 1.18,
    padDuration: 1.6,
    ballImpulseMult: 1,
    carImpulseMult: 1,
  },
  {
    id: "super",
    name: "Super Boost",
    pickupBoost: 0.48,
    padSpeedMult: 1.3,
    padDuration: 2.4,
    ballImpulseMult: 1.18,
    carImpulseMult: 1.12,
  },
  {
    id: "hyper",
    name: "Hyper Charge",
    pickupBoost: 0.62,
    padSpeedMult: 1.42,
    padDuration: 2.7,
    ballImpulseMult: 1.28,
    carImpulseMult: 1.18,
  },
];
const MAX_BALL_TUNING = {
  kickoffSpeed: 0,
  dragGrounded: 0.9952,
  dragAirborne: 0.9969,
  groundRetention: 0.988,
  bounceY: 0.56,
  wallBounce: 0.74,
  carImpulseBase: 7.8,
  carImpulseSpeedMult: 0.4,
  boostImpulseBonus: 5.6,
  verticalImpulseBase: 0.28,
  verticalImpulseSpeedMult: 1.7,
  minHitForce: 7.4,
};
const MAX_GOAL_RULES = {
  frontPlaneOffset: 2,
  backPlanePadding: 4,
  mouthWidthPadding: 2,
  mouthHeightPadding: 1,
};
const MAX_DEMOLITION_RULES = {
  respawnDelay: 2.35,
  relativeSpeedThreshold: 47,
  approachDotThreshold: 0.55,
  impactDamage: 999,
  explosionBurstCount: 32,
};
const MAX_REPLAY_RULES = {
  sampleRate: 1 / 24,
  maxFrames: 42,
  playbackFps: 24,
  playbackDuration: 1.75,
};
const MAX_WALL_RIDE_RULES = {
  startBand: 9,
  maxHeight: 1.15,
  pitchMax: Math.PI * 0.032,
  stickSpeed: 44,
};
const MAX_GOAL_AIM_RULES = {
  baseBias: 2.8,
  speedBiasMult: 0.08,
  lateralDampen: 0.9,
  verticalDampen: 0.94,
};
const MAX_DIFFICULTY_PROFILES = {
  [MAX_DIFFICULTY_SUPER_EASY]: {
    label: "Super Easy",
    arenaScale: 0.76,
    player: {
      speedMult: 0.7,
      accelMult: 0.82,
      steerFilter: 4.6,
      turnMult: 0.64,
      turnAssistBase: 0.84,
      turnAssistLowSpeedBonus: 0.26,
      moveHeadingLerp: 0.92,
    },
    camera: {
      distanceMult: 0.76,
      heightMult: 0.92,
      replayDistanceMult: 0.84,
      replayHeightMult: 0.9,
    },
    ball: {
      dragGrounded: 0.9981,
      dragAirborne: 0.9978,
      groundRetention: 0.9945,
      bounceY: 0.42,
      wallBounce: 0.62,
      carImpulseBase: 5.6,
      carImpulseSpeedMult: 0.28,
      boostImpulseBonus: 3.4,
      verticalImpulseBase: 0.18,
      verticalImpulseSpeedMult: 1.08,
      minHitForce: 5.6,
      driveAimBase: 3.2,
      driveAimSpeedMult: 0.085,
      lungeAimBase: 6.1,
      lungeAimSpeedMult: 0.11,
      lateralDampen: 0.78,
      verticalDampen: 0.9,
    },
    ai: {
      skillMult: 0.72,
      reactionLead: 0.38,
      recoveryLead: 0.2,
      supportSpacing: 70,
      emergencyDropDepth: 70,
      boostTriggerRange: 58,
      lungeRateMult: 0.42,
      pressureMult: 0.72,
      passingBias: 0.16,
      rotationMemoryWeight: 0.16,
      teamPressureBase: 0.88,
      reactionWeight: 0.78,
      attackSpeedBonus: -6,
      topSpeedMult: 0.82,
      separationRadius: 72,
    },
  },
  [MAX_DIFFICULTY_CASUAL]: {
    label: "Casual",
    arenaScale: 0.88,
    player: {
      speedMult: 0.75,
      accelMult: 0.88,
      steerFilter: 5.1,
      turnMult: 0.7,
      turnAssistBase: 0.9,
      turnAssistLowSpeedBonus: 0.32,
      moveHeadingLerp: 0.98,
    },
    camera: {
      distanceMult: 0.82,
      heightMult: 0.95,
      replayDistanceMult: 0.88,
      replayHeightMult: 0.94,
    },
    ball: {
      dragGrounded: 0.9975,
      dragAirborne: 0.9973,
      groundRetention: 0.993,
      bounceY: 0.46,
      wallBounce: 0.66,
      carImpulseBase: 6.2,
      carImpulseSpeedMult: 0.31,
      boostImpulseBonus: 4.1,
      verticalImpulseBase: 0.2,
      verticalImpulseSpeedMult: 1.2,
      minHitForce: 6.1,
      driveAimBase: 2.3,
      driveAimSpeedMult: 0.07,
      lungeAimBase: 4.9,
      lungeAimSpeedMult: 0.095,
      lateralDampen: 0.82,
      verticalDampen: 0.92,
    },
    ai: {
      skillMult: 0.86,
      reactionLead: 0.48,
      recoveryLead: 0.24,
      supportSpacing: 64,
      emergencyDropDepth: 62,
      boostTriggerRange: 50,
      lungeRateMult: 0.66,
      pressureMult: 0.88,
      passingBias: 0.22,
      rotationMemoryWeight: 0.2,
      teamPressureBase: 0.96,
      reactionWeight: 0.9,
      attackSpeedBonus: -2,
      topSpeedMult: 0.9,
      separationRadius: 66,
    },
  },
  [MAX_DIFFICULTY_CLASSIC]: {
    label: "Classic",
    arenaScale: 0.98,
    player: {
      speedMult: 0.8,
      accelMult: 0.94,
      steerFilter: 5.6,
      turnMult: 0.78,
      turnAssistBase: 0.98,
      turnAssistLowSpeedBonus: 0.4,
      moveHeadingLerp: 1.02,
    },
    camera: {
      distanceMult: 0.88,
      heightMult: 1,
      replayDistanceMult: 0.94,
      replayHeightMult: 0.98,
    },
    ball: {
      dragGrounded: 0.9969,
      dragAirborne: 0.9969,
      groundRetention: 0.991,
      bounceY: 0.5,
      wallBounce: 0.7,
      carImpulseBase: 6.9,
      carImpulseSpeedMult: 0.35,
      boostImpulseBonus: 4.8,
      verticalImpulseBase: 0.24,
      verticalImpulseSpeedMult: 1.38,
      minHitForce: 6.8,
      driveAimBase: 1.4,
      driveAimSpeedMult: 0.052,
      lungeAimBase: 3.8,
      lungeAimSpeedMult: 0.08,
      lateralDampen: 0.88,
      verticalDampen: 0.94,
    },
    ai: {
      skillMult: 1,
      reactionLead: 0.58,
      recoveryLead: 0.3,
      supportSpacing: 58,
      emergencyDropDepth: 56,
      boostTriggerRange: 42,
      lungeRateMult: 0.96,
      pressureMult: 1,
      passingBias: 0.28,
      rotationMemoryWeight: 0.24,
      teamPressureBase: 1.06,
      reactionWeight: 1,
      attackSpeedBonus: 2,
      topSpeedMult: 0.98,
      separationRadius: 60,
    },
  },
  [MAX_DIFFICULTY_BRUTAL]: {
    label: "Brutal",
    arenaScale: 1.12,
    player: {
      speedMult: 0.82,
      accelMult: 0.98,
      steerFilter: 6.1,
      turnMult: 0.8,
      turnAssistBase: 1,
      turnAssistLowSpeedBonus: 0.44,
      moveHeadingLerp: 1.06,
    },
    camera: {
      distanceMult: 0.94,
      heightMult: 1.03,
      replayDistanceMult: 1,
      replayHeightMult: 1.02,
    },
    ball: {
      dragGrounded: 0.9964,
      dragAirborne: 0.9965,
      groundRetention: 0.989,
      bounceY: 0.54,
      wallBounce: 0.72,
      carImpulseBase: 7.3,
      carImpulseSpeedMult: 0.38,
      boostImpulseBonus: 5.2,
      verticalImpulseBase: 0.26,
      verticalImpulseSpeedMult: 1.52,
      minHitForce: 7.1,
      driveAimBase: 0.58,
      driveAimSpeedMult: 0.028,
      lungeAimBase: 2.05,
      lungeAimSpeedMult: 0.052,
      lateralDampen: 0.94,
      verticalDampen: 0.96,
    },
    ai: {
      skillMult: 1.16,
      reactionLead: 0.72,
      recoveryLead: 0.38,
      supportSpacing: 52,
      emergencyDropDepth: 50,
      boostTriggerRange: 34,
      lungeRateMult: 1.34,
      pressureMult: 1.22,
      passingBias: 0.36,
      rotationMemoryWeight: 0.34,
      teamPressureBase: 1.18,
      reactionWeight: 1.14,
      attackSpeedBonus: 6,
      topSpeedMult: 1.08,
      separationRadius: 54,
    },
  },
};
const MINIMAP_HEADING_SMOOTH = 12;
const MINIMAP_USE_MOVE_HEADING = true;
const CAMERA_HEIGHT = 6.2;
const CAMERA_BACK_DISTANCE = 11.4;
const CAMERA_LOOK_HEIGHT = 1.05;
const CAMERA_SPEED_LOOKAHEAD = 5.8;
const CAMERA_SPEED_DISTANCE_GAIN = 2.5;
const CAMERA_SPEED_HEIGHT_GAIN = 1.2;
const CAMERA_PLAYER_SCREEN_BIAS = 0.92;
const CAMERA_BASE_FOV = 63;
const CAMERA_BOOST_FOV_GAIN = 7;
const CAMERA_DRIFT_SIDE_GAIN = 0.78;
const CAMERA_SHAKE_DECAY = 1.35;
const DEBUG_FLAGS = {
  enabled: false,
  input: false,
  world: false,
  ramps: false,
  hits: false,
  menu: false,
  powerups: false,
  minimap: false,
};
const PLAYER_SPAWN_X = 0;
const PLAYER_SPAWN_Z = -90;
const DEVICE_PROFILES = {
  desktop: {
    type: "desktop",
    usesTouch: false,
    compactHud: false,
    hudScale: 1,
    overlayScale: 1,
    minimapSize: 180,
    cameraDistanceMult: 1,
    cameraHeightMult: 1,
    controlScale: 1,
    touchStickSize: 132,
    touchButtonSize: 1,
    touchSteerScale: 0.98,
    touchDeadzone: 0.07,
    touchResponse: 0.22,
    botSpeedMult: 1,
    botReactionMult: 1,
    powerupRadiusMult: 1,
    boostPadRadiusMult: 1,
    rampForgiveness: 0,
  },
  tablet: {
    type: "tablet",
    usesTouch: true,
    compactHud: true,
    hudScale: 0.96,
    overlayScale: 0.96,
    minimapSize: 150,
    cameraDistanceMult: 0.93,
    cameraHeightMult: 0.94,
    controlScale: 1.03,
    touchStickSize: 150,
    touchButtonSize: 1.18,
    touchSteerScale: 0.9,
    touchDeadzone: 0.05,
    touchResponse: 0.19,
    botSpeedMult: 0.95,
    botReactionMult: 0.96,
    powerupRadiusMult: 1.12,
    boostPadRadiusMult: 1.08,
    rampForgiveness: 0.03,
  },
  phone: {
    type: "phone",
    usesTouch: true,
    compactHud: true,
    hudScale: 0.9,
    overlayScale: 0.9,
    minimapSize: 116,
    cameraDistanceMult: 0.78,
    cameraHeightMult: 0.78,
    controlScale: 0.84,
    touchStickSize: 118,
    touchButtonSize: 0.94,
    touchSteerScale: 0.82,
    touchDeadzone: 0.04,
    touchResponse: 0.16,
    botSpeedMult: 0.89,
    botReactionMult: 0.9,
    powerupRadiusMult: 1.22,
    boostPadRadiusMult: 1.14,
    rampForgiveness: 0.06,
  },
};

const colorWhite = new THREE.MeshStandardMaterial({
  color: 0xfaf4ea,
  roughness: 0.4,
});
const colorBlack = new THREE.MeshStandardMaterial({
  color: 0x10131a,
  roughness: 0.6,
});
const colorGlass = new THREE.MeshStandardMaterial({
  color: 0x2d5b7a,
  roughness: 0.2,
  metalness: 0.3,
});

const worldData = [
  {
    name: "Cinder City",
    fog: 0x121c2a,
    sky: 0x10263b,
    ground: 0x16283a,
    accents: [0xff4d2d, 0xffa24c],
    levels: [
      { name: "Heatline Run", time: 70, bots: 4, botSpeed: 36, spawnRate: 0.6 },
      {
        name: "Neon Harriers",
        time: 80,
        bots: 5,
        botSpeed: 40,
        spawnRate: 0.7,
      },
      {
        name: "Ashfall Siege",
        time: 90,
        bots: 6,
        botSpeed: 44,
        spawnRate: 0.75,
      },
      {
        name: "Molten Gauntlet",
        time: 100,
        bots: 7,
        botSpeed: 48,
        spawnRate: 0.82,
      },
    ],
  },
  {
    name: "Glacier Surge",
    fog: 0x0f2332,
    sky: 0x11425e,
    ground: 0x16394f,
    accents: [0x20d4ff, 0x5ee1ff],
    levels: [
      {
        name: "Frostbite Drift",
        time: 80,
        bots: 5,
        botSpeed: 38,
        spawnRate: 0.65,
      },
      {
        name: "Aurora Raiders",
        time: 90,
        bots: 6,
        botSpeed: 42,
        spawnRate: 0.75,
      },
      { name: "Polar Rift", time: 100, bots: 7, botSpeed: 46, spawnRate: 0.8 },
      {
        name: "Whiteout Pursuit",
        time: 110,
        bots: 8,
        botSpeed: 50,
        spawnRate: 0.85,
      },
    ],
  },
  {
    name: "Solar Rift",
    fog: 0x2a1a0f,
    sky: 0x47200f,
    ground: 0x372212,
    accents: [0xff6b3f, 0xffc457],
    levels: [
      { name: "Helios Gate", time: 90, bots: 6, botSpeed: 40, spawnRate: 0.7 },
      {
        name: "Redline Tempest",
        time: 100,
        bots: 7,
        botSpeed: 46,
        spawnRate: 0.8,
      },
      {
        name: "Supernova Run",
        time: 110,
        bots: 8,
        botSpeed: 50,
        spawnRate: 0.85,
      },
      {
        name: "Corona Breaker",
        time: 120,
        bots: 9,
        botSpeed: 54,
        spawnRate: 0.9,
      },
    ],
  },
  {
    name: "Tempest Grid",
    fog: 0x14172d,
    sky: 0x2b2f66,
    ground: 0x1d2450,
    accents: [0x7bb0ff, 0x80fff1],
    levels: [
      { name: "Ion Relay", time: 105, bots: 7, botSpeed: 46, spawnRate: 0.82 },
      {
        name: "Arc Flash Alley",
        time: 115,
        bots: 8,
        botSpeed: 50,
        spawnRate: 0.87,
      },
      {
        name: "Stormline Apex",
        time: 125,
        bots: 9,
        botSpeed: 54,
        spawnRate: 0.91,
      },
      {
        name: "Thunder Crown",
        time: 135,
        bots: 10,
        botSpeed: 58,
        spawnRate: 0.95,
      },
    ],
  },
  {
    name: "Obsidian Expanse",
    fog: 0x120f14,
    sky: 0x2f2134,
    ground: 0x1c1620,
    accents: [0xff80d0, 0xa7c0ff],
    levels: [
      {
        name: "Void Approach",
        time: 115,
        bots: 8,
        botSpeed: 50,
        spawnRate: 0.88,
      },
      {
        name: "Phantom Causeway",
        time: 125,
        bots: 9,
        botSpeed: 54,
        spawnRate: 0.92,
      },
      {
        name: "Nocturne Collider",
        time: 135,
        bots: 10,
        botSpeed: 58,
        spawnRate: 0.96,
      },
      {
        name: "Abyssal Finale",
        time: 145,
        bots: 11,
        botSpeed: 62,
        spawnRate: 1.0,
      },
    ],
  },
];

const BODY_OPTIONS = [
  {
    id: "street",
    name: "Street",
    unlock: { worldIndex: 0, levelIndex: 0 },
    visual: {
      primary: 0xfff1d0,
      accent: 0x12151c,
      bodyScale: [1.8, 0.5, 3.2],
      hoodScale: [1.6, 0.35, 1.2],
      cabinScale: [1.3, 0.45, 1.2],
      trunkScale: [1.4, 0.3, 0.8],
      lightScale: 1,
    },
    stats: { topSpeed: 0, accel: 0, grip: 0.02, drift: 0, boost: 0.02 },
  },
  {
    id: "muscle",
    name: "Muscle",
    unlock: { worldIndex: 1, levelIndex: 1 },
    visual: {
      primary: 0xff8a5c,
      accent: 0x24110f,
      bodyScale: [2.05, 0.58, 3.45],
      hoodScale: [1.75, 0.4, 1.3],
      cabinScale: [1.2, 0.42, 1.05],
      trunkScale: [1.55, 0.34, 0.92],
      lightScale: 1.08,
    },
    stats: { topSpeed: 4, accel: 0.08, grip: -0.06, drift: 0.16, boost: 0.06 },
  },
  {
    id: "interceptor",
    name: "Interceptor",
    unlock: { worldIndex: 2, levelIndex: 0 },
    visual: {
      primary: 0x8fe7ff,
      accent: 0x0d1c29,
      bodyScale: [1.72, 0.46, 3.42],
      hoodScale: [1.48, 0.3, 1.35],
      cabinScale: [1.12, 0.42, 1.34],
      trunkScale: [1.26, 0.28, 0.9],
      lightScale: 0.94,
    },
    stats: { topSpeed: 6, accel: -0.03, grip: 0.08, drift: -0.04, boost: 0.03 },
  },
  {
    id: "prototype",
    name: "Prototype",
    unlock: { worldIndex: 3, levelIndex: 2 },
    visual: {
      primary: 0xcfd6ff,
      accent: 0x111329,
      bodyScale: [1.68, 0.44, 3.58],
      hoodScale: [1.42, 0.26, 1.44],
      cabinScale: [1.06, 0.38, 1.4],
      trunkScale: [1.18, 0.24, 0.82],
      lightScale: 0.88,
    },
    stats: { topSpeed: 8, accel: 0.04, grip: -0.02, drift: 0.02, boost: 0.1 },
  },
  {
    id: "rally",
    name: "Rally",
    unlock: { worldIndex: 4, levelIndex: 1 },
    visual: {
      primary: 0xffd28f,
      accent: 0x2a1b0e,
      bodyScale: [1.88, 0.56, 3.28],
      hoodScale: [1.6, 0.36, 1.26],
      cabinScale: [1.24, 0.46, 1.18],
      trunkScale: [1.42, 0.34, 0.86],
      lightScale: 1.04,
    },
    stats: { topSpeed: 2, accel: 0.1, grip: 0.12, drift: -0.02, boost: 0.02 },
  },
];

const WHEEL_OPTIONS = [
  {
    id: "grip",
    name: "Grip",
    unlock: { worldIndex: 0, levelIndex: 0 },
    visual: { radius: 0.35, width: 0.4, color: 0x0b0f14, rim: 0xc4d7ea },
    stats: { topSpeed: 0, accel: 0.04, grip: 0.1, drift: -0.08, boost: 0 },
  },
  {
    id: "drift",
    name: "Drift",
    unlock: { worldIndex: 1, levelIndex: 0 },
    visual: { radius: 0.37, width: 0.34, color: 0x12161d, rim: 0xffb866 },
    stats: { topSpeed: 1, accel: 0.02, grip: -0.08, drift: 0.18, boost: 0.04 },
  },
  {
    id: "heavy",
    name: "Heavy",
    unlock: { worldIndex: 3, levelIndex: 0 },
    visual: { radius: 0.4, width: 0.46, color: 0x0e1118, rim: 0x86f0ff },
    stats: { topSpeed: 2, accel: -0.06, grip: 0.14, drift: -0.04, boost: 0.08 },
  },
  {
    id: "aero",
    name: "Aero",
    unlock: { worldIndex: 2, levelIndex: 2 },
    visual: { radius: 0.34, width: 0.32, color: 0x10131a, rim: 0xb6f4ff },
    stats: { topSpeed: 3, accel: 0.02, grip: 0.02, drift: 0.02, boost: 0.12 },
  },
  {
    id: "offroad",
    name: "Offroad",
    unlock: { worldIndex: 4, levelIndex: 2 },
    visual: { radius: 0.43, width: 0.5, color: 0x141414, rim: 0xffd77a },
    stats: { topSpeed: -1, accel: 0.08, grip: 0.18, drift: -0.06, boost: 0.03 },
  },
];

const STYLE_OPTIONS = [
  {
    id: "balanced",
    name: "Balanced",
    unlock: { worldIndex: 0, levelIndex: 0 },
    description: "Even handling with reliable grip and boost.",
    stats: { topSpeed: 0, accel: 0, turnRate: 0, grip: 0, drift: 0, boost: 0 },
  },
  {
    id: "drift",
    name: "Drift",
    unlock: { worldIndex: 0, levelIndex: 2 },
    description:
      "Looser rear end, faster drift combo build, weaker straight-line hold.",
    stats: {
      topSpeed: 1,
      accel: 0.05,
      turnRate: 0.22,
      grip: -0.18,
      drift: 0.26,
      boost: 0.02,
    },
  },
  {
    id: "grip",
    name: "Grip",
    unlock: { worldIndex: 1, levelIndex: 2 },
    description: "Sharper turn-in and stronger traction with less drift angle.",
    stats: {
      topSpeed: -1,
      accel: 0.08,
      turnRate: 0.14,
      grip: 0.24,
      drift: -0.18,
      boost: 0.04,
    },
  },
  {
    id: "boost",
    name: "Boost",
    unlock: { worldIndex: 2, levelIndex: 2 },
    description:
      "Higher straight-line pace and stronger surge, with lighter corner hold.",
    stats: {
      topSpeed: 4,
      accel: 0.06,
      turnRate: -0.06,
      grip: -0.12,
      drift: 0.08,
      boost: 0.18,
    },
  },
  {
    id: "control",
    name: "Control",
    unlock: { worldIndex: 3, levelIndex: 3 },
    description: "Stable steering and easier recovery with lower drift snap.",
    stats: {
      topSpeed: -2,
      accel: 0.06,
      turnRate: 0.08,
      grip: 0.18,
      drift: -0.22,
      boost: 0.06,
    },
  },
];

const POWER_OPTIONS = [
  {
    id: "nitro_core",
    name: "Nitro Core",
    unlock: { worldIndex: 0, levelIndex: 0 },
    description:
      "Higher boost ceiling with slower drain and stronger pad surge.",
    stats: {
      boostReserve: 0.18,
      boostDrainMult: 0.78,
      padSpeedMult: 0.1,
      padDuration: 0.2,
    },
  },
  {
    id: "shock_guard",
    name: "Shock Guard",
    unlock: { worldIndex: 2, levelIndex: 1 },
    description: "Longer post-hit safety window and stronger shield retention.",
    stats: { invincibleBonus: 0.4, shieldRetention: 0.08 },
  },
  {
    id: "air_control",
    name: "Air Control",
    unlock: { worldIndex: 3, levelIndex: 1 },
    description: "Better aerial steering and smoother landings off ramps.",
    stats: { airTurnRate: 1.5, landingBoost: 0.14, rampStick: 0.08 },
  },
  {
    id: "mag_traction",
    name: "Mag Traction",
    unlock: { worldIndex: 4, levelIndex: 0 },
    description: "Cuts slide, improves ramp contact, and stabilizes exits.",
    stats: { grip: 0.18, drift: -0.15, rampStick: 0.18 },
  },
  {
    id: "pulse_charger",
    name: "Pulse Charger",
    unlock: { worldIndex: 1, levelIndex: 3 },
    description: "Boost pads hit harder and chain longer.",
    stats: { padSpeedMult: 0.18, padDuration: 0.45, boostReserve: 0.06 },
  },
  {
    id: "guardian_shell",
    name: "Guardian Shell",
    unlock: { worldIndex: 2, levelIndex: 3 },
    description: "Extra shield hold with longer hit recovery.",
    stats: { invincibleBonus: 0.55, shieldRetention: 0.12 },
  },
  {
    id: "slipstream",
    name: "Slipstream",
    unlock: { worldIndex: 3, levelIndex: 2 },
    description: "Better high-speed retention and cleaner boost efficiency.",
    stats: { boostReserve: 0.12, boostDrainMult: 0.72, grip: 0.05 },
  },
  {
    id: "ramp_catalyst",
    name: "Ramp Catalyst",
    unlock: { worldIndex: 4, levelIndex: 3 },
    description:
      "Stronger ramp exits with more aerial control and landing gain.",
    stats: {
      airTurnRate: 1.8,
      landingBoost: 0.2,
      rampStick: 0.22,
      padSpeedMult: 0.08,
    },
  },
];

const PAINT_OPTIONS = [
  {
    id: "ember",
    name: "Ember",
    unlock: { worldIndex: 0, levelIndex: 0 },
    color: 0xff8a5c,
  },
  {
    id: "frost",
    name: "Frost",
    unlock: { worldIndex: 1, levelIndex: 0 },
    color: 0x8fe7ff,
  },
  {
    id: "nova",
    name: "Nova",
    unlock: { worldIndex: 2, levelIndex: 1 },
    color: 0xff6eb5,
  },
  {
    id: "volt",
    name: "Volt",
    unlock: { worldIndex: 3, levelIndex: 1 },
    color: 0xc6ff6e,
  },
  {
    id: "phantom",
    name: "Phantom",
    unlock: { worldIndex: 4, levelIndex: 0 },
    color: 0xd5d9e6,
  },
];

const ACCENT_OPTIONS = [
  {
    id: "carbon",
    name: "Carbon",
    unlock: { worldIndex: 0, levelIndex: 0 },
    color: 0x12151c,
  },
  {
    id: "chrome",
    name: "Chrome",
    unlock: { worldIndex: 1, levelIndex: 2 },
    color: 0xc4d7ea,
  },
  {
    id: "copper",
    name: "Copper",
    unlock: { worldIndex: 2, levelIndex: 2 },
    color: 0xb56e3b,
  },
  {
    id: "ice",
    name: "Ice",
    unlock: { worldIndex: 3, levelIndex: 0 },
    color: 0x6de6ff,
  },
];

const TINT_OPTIONS = [
  {
    id: "smoke",
    name: "Smoke",
    unlock: { worldIndex: 0, levelIndex: 0 },
    color: 0x2d5b7a,
  },
  {
    id: "midnight",
    name: "Midnight",
    unlock: { worldIndex: 1, levelIndex: 1 },
    color: 0x1d2e4a,
  },
  {
    id: "sunset",
    name: "Sunset",
    unlock: { worldIndex: 2, levelIndex: 3 },
    color: 0x7a3b56,
  },
  {
    id: "ion",
    name: "Ion",
    unlock: { worldIndex: 4, levelIndex: 1 },
    color: 0x3b7a78,
  },
];

const SPOILER_OPTIONS = [
  {
    id: "none",
    name: "None",
    unlock: { worldIndex: 0, levelIndex: 0 },
    style: "none",
  },
  {
    id: "street_kit",
    name: "Street Kit",
    unlock: { worldIndex: 1, levelIndex: 1 },
    style: "street",
  },
  {
    id: "race_wing",
    name: "Race Wing",
    unlock: { worldIndex: 2, levelIndex: 2 },
    style: "wing",
  },
  {
    id: "twin_fin",
    name: "Twin Fin",
    unlock: { worldIndex: 4, levelIndex: 2 },
    style: "fin",
  },
];

const GLOW_OPTIONS = [
  {
    id: "cyan",
    name: "Cyan",
    unlock: { worldIndex: 0, levelIndex: 0 },
    color: 0x5feaff,
  },
  {
    id: "lava",
    name: "Lava",
    unlock: { worldIndex: 1, levelIndex: 3 },
    color: 0xff8a4f,
  },
  {
    id: "violet",
    name: "Violet",
    unlock: { worldIndex: 3, levelIndex: 1 },
    color: 0xb88cff,
  },
  {
    id: "gold",
    name: "Gold",
    unlock: { worldIndex: 4, levelIndex: 3 },
    color: 0xffd35f,
  },
];

const ID4_MODE_RULES = {
  tutorial: {
    label: "First Ignition",
    mode: GAME_MODE_ID33,
    worldIndex: 0,
    levelIndex: 0,
    toast: "Tutorial Run",
    subtitle:
      "First Ignition teaches drift, boost, jumps, and clean landings before the Risk hunters wake up.",
    objective:
      "Complete the run while trying one drift, one boost, one jump, and one ramp landing.",
  },
  campaign: {
    label: "Campaign Survival",
    mode: GAME_MODE_ID33,
    toast: "Campaign",
    subtitle:
      "Risk hunters learn from escapes, collapse lanes faster, and coordinate pressure as a pack.",
    objective:
      "Survive the timer, chain drifts, collect powerups, and unlock the next world.",
  },
  race: {
    label: "Race / Time Trial",
    mode: GAME_MODE_ID33,
    toast: "Time Trial",
    subtitle:
      "Run the current world as a cleaner, faster ghost route with score pressure and fast restarts.",
    objective:
      "Finish with the highest speed, lowest damage, and strongest drift multiplier.",
  },
  stunt: {
    label: "Stunt Park",
    mode: GAME_MODE_ID33,
    toast: "Stunt Park",
    subtitle:
      "Ramps, backflips, landing boosts, and trick combos become the main path to medals.",
    objective:
      "Use jump, backflip, boost, and ramps to stack airtime and landing bonuses.",
  },
  hunter: {
    label: "Hunter Tag",
    mode: GAME_MODE_ID33,
    toast: "Hunter Tag",
    subtitle:
      "Near misses, threat warnings, and escape chains turn the survival loop into tag.",
    objective:
      "Stay close enough to bait hunters, but far enough to keep your lives.",
  },
  boss: {
    label: "Boss Chase",
    mode: GAME_MODE_ID33,
    worldIndex: 4,
    levelIndex: 3,
    toast: "Boss Chase",
    subtitle:
      "The Abyssal finale starts immediately with the heaviest coordinated hunter pressure.",
    objective:
      "Beat the finale pack, use every boost pad, and survive the boss pressure.",
  },
  battle: {
    label: "Battle Arena",
    mode: GAME_MODE_MAX1,
    toast: "Battle Arena",
    subtitle:
      "Max arena hits, team roles, ball lunges, health, and goal replay carry the battle loop.",
    objective:
      "Score goals, defend your net, and use target lunges to disrupt rotations.",
  },
  minigames: {
    label: "Rotating Minigames",
    mode: GAME_MODE_ID33,
    toast: "Minigames",
    subtitle:
      "Ramp Rush, Boost Bowling, Lava Floor, King of the Zone, Trick Combo, and Bot Escape rotate through current arenas.",
    objective:
      "Treat the active world as a short challenge board with one-more-run scoring.",
  },
};

const ID4_MINIGAME_RULES = [
  {
    id: "ramp-rush",
    label: "Ramp Rush",
    objective: "Hit the flame gates in order and land cleanly for medal time.",
    markerCount: 5,
    color: 0xff9f45,
    type: "checkpoints",
  },
  {
    id: "boost-bowling",
    label: "Boost Bowling",
    objective:
      "Use boost lanes to knock out target pins before the clock melts.",
    markerCount: 8,
    color: 0xffdf7a,
    type: "targets",
  },
  {
    id: "lava-floor",
    label: "Lava Floor",
    objective:
      "Stay inside the moving safe ring while the outside floor burns.",
    markerCount: 1,
    color: 0xff5a3d,
    type: "zone",
  },
  {
    id: "king-zone",
    label: "King of the Zone",
    objective: "Hold the capture ring while drifting and blocking hunters.",
    markerCount: 1,
    color: 0x68ffba,
    type: "zone",
  },
  {
    id: "trick-combo",
    label: "Trick Combo",
    objective: "Chain drift, boost, backflip, near miss, and landing bonuses.",
    markerCount: 4,
    color: 0x9fe7ff,
    type: "combo",
  },
  {
    id: "bot-escape",
    label: "Bot Escape",
    objective: "Thread escape gates while hunter waves tighten behind you.",
    markerCount: 6,
    color: 0xff6f86,
    type: "checkpoints",
  },
];

const MODE_OBJECTIVE_DEFAULT = {
  label: "Free Run",
  detail: "Survive, score, and restart fast.",
  type: "survival",
  progress: 0,
  target: 1,
  checkpointIndex: 0,
  timer: 0,
  comboTarget: "",
  minigameId: "",
  completed: false,
};

const input = {
  left: false,
  right: false,
  throttle: false,
  brake: false,
  drift: false,
  boost: false,
  pointerActive: false,
  pointerX: 0,
  pointerStartX: 0,
  focusCamera: false,
  backflip: false,
  touchEnabled: false,
  touchSteer: 0,
  touchSteerTarget: 0,
};

const settings = {
  difficulty: "classic",
  campaignAiMode: "risk",
  maxDifficulty: "classic",
  invertSteer: true,
  cameraFocus: false,
  rampDensity: "normal",
  deviceMode: "auto",
  devMode: false,
  activeGameMode: GAME_MODE_ID33,
  id4Mode: ID4_MODE_DEFAULT,
  reducedMotion: false,
  audioEnabled: true,
};

const customization = {
  ...DEFAULT_CUSTOMIZATION,
};

const maxTeamCustomization = {
  blue: { ...DEFAULT_MAX_TEAM_CUSTOMIZATION.blue },
  red: { ...DEFAULT_MAX_TEAM_CUSTOMIZATION.red },
};

const devTuning = {
  ...DEFAULT_DEV_TUNING,
};

const state = {
  running: false,
  worldIndex: 0,
  levelIndex: 0,
  score: 0,
  lives: 3,
  combo: 1,
  boost: 1,
  shield: 0,
  shieldTimer: 0,
  invincible: 0,
  timeLeft: 0,
  elapsed: 0,
  heat: 0,
  pendingAction: "next",
  airTime: 0,
  wasAirborne: false,
  livesPulse: 0,
  steerSmoothed: 0,
  throttleSmoothed: 0,
  cameraShake: 0,
  isBuildingWorld: false,
  buildCount: 0,
  hitCount: 0,
  missedHitSamples: 0,
  missedVerticalHitSamples: 0,
  lastHitAt: 0,
  lastHitByBotId: -1,
  postHitSafeFrames: 0,
  slowBotsTimer: 0,
  padSpeedTimer: 0,
  padSpeedMult: 1,
  effectToast: "",
  effectToastTimer: 0,
  minimapHeading: 0,
  minimapDebugTimer: 0,
  radarSnapshot: {
    heading: 0,
    range: 0,
    entities: [],
  },
  cameraTelemetry: {
    distance: CAMERA_BACK_DISTANCE,
    height: CAMERA_HEIGHT,
    lookAhead: 0,
    ballCam: false,
  },
  noBotsRecoveryTimer: 0,
  backflipQueueTimer: 0,
  devJumpComboTimer: 0,
  devJumpActive: false,
  devJumpCarrySpeed: 0,
  backflipChainCount: 0,
  ballLungeCooldown: 0,
  botLungeCooldown: 0,
  ballCam: false,
  deviceInputMode: "auto",
  overtime: false,
  playerLoadoutStats: null,
  modeObjective: { ...MODE_OBJECTIVE_DEFAULT },
  deviceProfile: { mode: "auto", ...DEVICE_PROFILES.desktop },
  steppingExternally: false,
  campaignRisk: {
    recentHits: 0,
    recentEscapes: 0,
    nearMisses: 0,
  },
  progression: {
    xp: 0,
    runs: 0,
    bestScore: 0,
    medals: {},
    completedTutorial: false,
    dailySeed: new Date().toISOString().slice(0, 10),
  },
};

const maxMode = {
  ball: null,
  ballVelocity: new THREE.Vector3(),
  ballSpin: 0,
  ballPrevPosition: new THREE.Vector3(),
  blueScore: 0,
  redScore: 0,
  goalFlashTimer: 0,
  teamCars: [],
  lastScoredTeam: null,
  touchChain: [],
  stats: null,
  replayBuffer: [],
  replaySampleTimer: 0,
  replayActive: false,
  replayFrames: [],
  replayFrameIndex: 0,
  replayFrameTimer: 0,
  replayMeta: "",
  pendingKickoff: null,
  riskMemory: {
    blueConceded: 0,
    redConceded: 0,
    playerTouches: 0,
    recentMisses: 0,
  },
};

const onlineState = {
  socket: null,
  status: "offline",
  serverUrl: "",
  user: null,
  room: null,
  latencyMs: 0,
  lastPingAt: 0,
  inputTimer: 0,
  messages: [],
  pendingMessages: [],
  leaderboard: [],
  recentPlayers: [],
  friends: [],
};

let audioContext = null;
function playTone(kind = "ui") {
  if (navigator.webdriver) return;
  if (!settings.audioEnabled) return;
  try {
    audioContext ??= new (window.AudioContext || window.webkitAudioContext)();
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const table = {
      boost: [115, 240, 0.09],
      hit: [80, 44, 0.14],
      score: [330, 660, 0.2],
      jump: [220, 360, 0.12],
      ui: [180, 260, 0.06],
    };
    const [start, end, length] = table[kind] ?? table.ui;
    osc.type = kind === "hit" ? "sawtooth" : "triangle";
    osc.frequency.setValueAtTime(start, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, end), now + length);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + length);
    osc.connect(gain).connect(audioContext.destination);
    osc.start(now);
    osc.stop(now + length + 0.02);
  } catch {
    settings.audioEnabled = false;
  }
}

function setDebugFlagsEnabled(enabled) {
  DEBUG_FLAGS.enabled = enabled;
  if (!enabled) {
    DEBUG_FLAGS.input = false;
    DEBUG_FLAGS.world = false;
    DEBUG_FLAGS.ramps = false;
    DEBUG_FLAGS.hits = false;
    DEBUG_FLAGS.menu = false;
    DEBUG_FLAGS.powerups = false;
    DEBUG_FLAGS.minimap = false;
    return;
  }
  DEBUG_FLAGS.world = true;
  DEBUG_FLAGS.menu = true;
  DEBUG_FLAGS.hits = true;
}

function isCarAirborne(car) {
  return car.position.y > 0.18 || car.verticalVel > 0.3;
}

function getCollisionRadius(car) {
  return car?.collisionRadius ?? (car?.isBot ? BOT_RADIUS : CAR_RADIUS);
}

function isMaxMode() {
  return (
    settings.activeGameMode === GAME_MODE_MAX1 ||
    settings.activeGameMode === GAME_MODE_RISK
  );
}

function isRiskMode() {
  return isMaxMode();
}

function getMaxDifficultyProfile() {
  return (
    MAX_DIFFICULTY_PROFILES[settings.maxDifficulty] ??
    MAX_DIFFICULTY_PROFILES[MAX_DIFFICULTY_CLASSIC]
  );
}

function getMaxArenaDimensions() {
  const profile = getMaxDifficultyProfile();
  const halfWidth = Math.round(MAX_ARENA_HALF_WIDTH * profile.arenaScale);
  const halfLength = Math.round(MAX_ARENA_HALF_LENGTH * profile.arenaScale);
  return {
    scale: profile.arenaScale,
    halfWidth,
    halfLength,
    wallHeight: MAX_ARENA_WALL_HEIGHT,
    goalWidth: MAX_GOAL_WIDTH,
    goalHeight: MAX_GOAL_HEIGHT,
    goalDepth: MAX_GOAL_DEPTH,
    goalLineZ: halfLength - 26,
  };
}

function getMaxBallTuning() {
  return { ...MAX_BALL_TUNING, ...getMaxDifficultyProfile().ball };
}

function getMaxAiRules() {
  const profile = getMaxDifficultyProfile();
  return {
    ...RISK_MODE_RULES,
    reactionLead: profile.ai.reactionLead,
    recoveryLead: profile.ai.recoveryLead,
    supportSpacing: profile.ai.supportSpacing,
    emergencyDropDepth: profile.ai.emergencyDropDepth,
    boostTriggerRange: profile.ai.boostTriggerRange,
    lungeRateMult: profile.ai.lungeRateMult,
    passingBias: profile.ai.passingBias,
    rotationMemoryWeight: profile.ai.rotationMemoryWeight,
    teamPressureBase: profile.ai.teamPressureBase,
    pressureMult: profile.ai.pressureMult,
    reactionWeight: profile.ai.reactionWeight,
    attackSpeedBonus: profile.ai.attackSpeedBonus,
    topSpeedMult: profile.ai.topSpeedMult,
    separationRadius: profile.ai.separationRadius,
    skillMult: profile.ai.skillMult,
  };
}

function getActiveGameMeta() {
  const id4Rule = getId4ModeRule();
  if (isMaxMode()) {
    return {
      id: GAME_MODE_MAX1,
      title:
        id4Rule.label === "Battle Arena"
          ? "InfernoDrift4 Battle Arena"
          : "InfernoDrift4 Max Arena",
      subtitle: `${getMaxDifficultyProfile().label} Arena`,
    };
  }
  return {
    id: GAME_MODE_ID33,
    title: "InfernoDrift4",
    subtitle: id4Rule.label,
  };
}

function getId4ModeRule() {
  return ID4_MODE_RULES[settings.id4Mode] ?? ID4_MODE_RULES[ID4_MODE_DEFAULT];
}

function clampWorldIndex(index) {
  return THREE.MathUtils.clamp(index, 0, worldData.length - 1);
}

function clampLevelIndex(worldIndex, levelIndex) {
  const safeWorld = clampWorldIndex(worldIndex);
  const maxLevel = worldData[safeWorld].levels.length - 1;
  return THREE.MathUtils.clamp(levelIndex, 0, maxLevel);
}

function resolveDeviceClassFromViewport() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const shortest = Math.min(width, height);
  if (shortest <= 540 || width <= 820) return "phone";
  if (shortest <= 1024 || width <= 1366) return "tablet";
  return "desktop";
}

function detectTouchCapability() {
  const coarsePointer = window.matchMedia
    ? window.matchMedia("(pointer: coarse)").matches
    : false;
  const touchPoints = navigator.maxTouchPoints || 0;
  return coarsePointer || touchPoints > 0;
}

function detectLikelyPortableTouch() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const longest = Math.max(width, height);
  return detectTouchCapability() && longest <= 1400;
}

function updateAutoInputMode(mode) {
  if (settings.deviceMode !== "auto") return;
  if (state.deviceInputMode === mode) return;
  state.deviceInputMode = mode;
  applyDeviceProfile();
}

function getDeviceAssistTuning() {
  return state.deviceProfile ?? { mode: "auto", ...DEVICE_PROFILES.desktop };
}

function setMinimapSize(size) {
  if (!minimapCanvas) return;
  const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));
  minimapCanvas.width = Math.round(size * dpr);
  minimapCanvas.height = Math.round(size * dpr);
  minimapCanvas.style.width = `${size}px`;
  minimapCanvas.style.height = `${size}px`;
}

function applyDeviceProfile() {
  const touchAvailable = detectTouchCapability();
  const viewportType = resolveDeviceClassFromViewport();
  const likelyPortableTouch = detectLikelyPortableTouch();
  let resolvedType = settings.deviceMode;
  if (settings.deviceMode === "auto") {
    if (state.deviceInputMode === "desktop") {
      resolvedType = "desktop";
    } else if (state.deviceInputMode === "touch") {
      resolvedType = viewportType === "phone" ? "phone" : "tablet";
    } else if (viewportType === "phone") {
      resolvedType = "phone";
    } else if (viewportType === "tablet" && likelyPortableTouch) {
      resolvedType = "tablet";
    } else {
      resolvedType = "desktop";
    }
  }
  const profile = DEVICE_PROFILES[resolvedType] ?? DEVICE_PROFILES.desktop;
  const touchActive =
    settings.deviceMode === "auto"
      ? state.deviceInputMode === "touch"
        ? touchAvailable
        : resolvedType !== "desktop" && touchAvailable && likelyPortableTouch
      : profile.usesTouch;
  state.deviceProfile = {
    mode: settings.deviceMode,
    type: resolvedType,
    viewportType,
    touchAvailable,
    touchActive,
    inputMode: state.deviceInputMode,
    ...profile,
  };
  document.body.classList.remove(
    "device-desktop",
    "device-tablet",
    "device-phone",
  );
  document.body.classList.add(`device-${resolvedType}`);
  document.documentElement.style.setProperty(
    "--minimap-size",
    `${profile.minimapSize}px`,
  );
  document.documentElement.style.setProperty(
    "--touch-scale",
    String(profile.controlScale),
  );
  document.documentElement.style.setProperty(
    "--touch-stick-size",
    `${profile.touchStickSize}px`,
  );
  document.documentElement.style.setProperty(
    "--touch-button-size",
    String(profile.touchButtonSize),
  );
  document.documentElement.style.setProperty(
    "--overlay-panel-scale",
    String(profile.overlayScale),
  );
  document.documentElement.style.setProperty(
    "--hud-scale",
    String(profile.hudScale),
  );
  setMinimapSize(profile.minimapSize);
  input.touchEnabled = touchActive;
  touchControlsRoot.classList.toggle("enabled", input.touchEnabled);
  if (!input.touchEnabled) {
    input.touchSteer = 0;
    input.touchSteerTarget = 0;
    input.drift = false;
    input.boost = false;
    input.throttle = false;
    input.brake = false;
  }
  refreshDevModeUi();
  if (deviceModeSelect) deviceModeSelect.value = settings.deviceMode;
  if (deviceModeActive) {
    const label = resolvedType.charAt(0).toUpperCase() + resolvedType.slice(1);
    if (settings.deviceMode === "auto") {
      deviceModeActive.textContent = `Active device: ${label} (Auto, last input ${state.deviceInputMode}, touch ${touchActive ? "on" : "off"})`;
    } else {
      deviceModeActive.textContent = `Active device: ${label} (Manual, touch ${touchActive ? "on" : "off"})`;
    }
  }
}

function isProgressAtLeast(progress, unlock) {
  if (!unlock) return true;
  const worldIndex = progress?.worldIndex ?? 0;
  const levelIndex = progress?.levelIndex ?? 0;
  if (worldIndex > unlock.worldIndex) return true;
  if (worldIndex < unlock.worldIndex) return false;
  return levelIndex >= (unlock.levelIndex ?? 0);
}

function getProgressSnapshot() {
  return {
    worldIndex: state.worldIndex,
    levelIndex: state.levelIndex,
  };
}

function isOptionUnlocked(option, progress = getProgressSnapshot()) {
  return isProgressAtLeast(progress, option.unlock);
}

function getUnlockedOptions(group, progress = getProgressSnapshot()) {
  return group.filter((option) => isOptionUnlocked(option, progress));
}

function getOptionById(group, id, fallbackId) {
  return (
    group.find((option) => option.id === id) ??
    group.find((option) => option.id === fallbackId) ??
    group[0]
  );
}

function getUnlockLabel(option) {
  if (!option.unlock) return "Unlocked";
  const worldLabel = `World ${option.unlock.worldIndex + 1}`;
  const levelLabel = `Level ${option.unlock.levelIndex + 1}`;
  return option.unlock.levelIndex > 0
    ? `Unlocks at ${worldLabel}, ${levelLabel}`
    : `Unlocks at ${worldLabel}`;
}

function clampCustomizationToUnlocks(progress = getProgressSnapshot()) {
  const groups = [
    [BODY_OPTIONS, "bodyId", DEFAULT_CUSTOMIZATION.bodyId],
    [WHEEL_OPTIONS, "wheelId", DEFAULT_CUSTOMIZATION.wheelId],
    [STYLE_OPTIONS, "styleId", DEFAULT_CUSTOMIZATION.styleId],
    [POWER_OPTIONS, "powerId", DEFAULT_CUSTOMIZATION.powerId],
    [PAINT_OPTIONS, "paintId", DEFAULT_CUSTOMIZATION.paintId],
    [ACCENT_OPTIONS, "accentId", DEFAULT_CUSTOMIZATION.accentId],
    [TINT_OPTIONS, "tintId", DEFAULT_CUSTOMIZATION.tintId],
    [SPOILER_OPTIONS, "spoilerId", DEFAULT_CUSTOMIZATION.spoilerId],
    [GLOW_OPTIONS, "glowId", DEFAULT_CUSTOMIZATION.glowId],
  ];
  for (const [group, key, fallbackId] of groups) {
    const selected = getOptionById(group, customization[key], fallbackId);
    if (isOptionUnlocked(selected, progress)) continue;
    const fallback =
      getUnlockedOptions(group, progress)[0] ??
      getOptionById(group, fallbackId, fallbackId);
    customization[key] = fallback.id;
  }
}

function getCurrentCustomization() {
  const activeTeamSkin =
    isMaxMode() && player.team && maxTeamCustomization[player.team]
      ? maxTeamCustomization[player.team]
      : customization;
  return {
    body: getOptionById(
      BODY_OPTIONS,
      customization.bodyId,
      DEFAULT_CUSTOMIZATION.bodyId,
    ),
    wheels: getOptionById(
      WHEEL_OPTIONS,
      customization.wheelId,
      DEFAULT_CUSTOMIZATION.wheelId,
    ),
    style: getOptionById(
      STYLE_OPTIONS,
      customization.styleId,
      DEFAULT_CUSTOMIZATION.styleId,
    ),
    power: getOptionById(
      POWER_OPTIONS,
      customization.powerId,
      DEFAULT_CUSTOMIZATION.powerId,
    ),
    paint: getOptionById(
      PAINT_OPTIONS,
      activeTeamSkin.paintId,
      DEFAULT_CUSTOMIZATION.paintId,
    ),
    accent: getOptionById(
      ACCENT_OPTIONS,
      activeTeamSkin.accentId,
      DEFAULT_CUSTOMIZATION.accentId,
    ),
    tint: getOptionById(
      TINT_OPTIONS,
      activeTeamSkin.tintId,
      DEFAULT_CUSTOMIZATION.tintId,
    ),
    spoiler: getOptionById(
      SPOILER_OPTIONS,
      customization.spoilerId,
      DEFAULT_CUSTOMIZATION.spoilerId,
    ),
    glow: getOptionById(
      GLOW_OPTIONS,
      activeTeamSkin.glowId,
      DEFAULT_CUSTOMIZATION.glowId,
    ),
  };
}

function computePlayerLoadoutStats() {
  const loadout = getCurrentCustomization();
  const topSpeed =
    PLAYER_MAX_SPEED +
    loadout.body.stats.topSpeed +
    loadout.wheels.stats.topSpeed +
    loadout.style.stats.topSpeed;
  const accelMult =
    PLAYER_ACCEL_MULT +
    loadout.body.stats.accel +
    loadout.wheels.stats.accel +
    loadout.style.stats.accel;
  const gripBias =
    loadout.body.stats.grip +
    loadout.wheels.stats.grip +
    loadout.style.stats.grip +
    (loadout.power.stats.grip ?? 0);
  const driftBias =
    loadout.body.stats.drift +
    loadout.wheels.stats.drift +
    loadout.style.stats.drift +
    (loadout.power.stats.drift ?? 0);
  const boostBias =
    loadout.body.stats.boost +
    loadout.wheels.stats.boost +
    loadout.style.stats.boost;
  return {
    topSpeed,
    accel: 22 * accelMult,
    turnRate: 2.8 + loadout.style.stats.turnRate,
    normalGrip: 3.9 + gripBias * 1.6,
    driftGrip: 1.25 + gripBias * 0.6 - driftBias * 0.25,
    driftSlip: 0.58 + driftBias * 0.35,
    roadSlip: Math.max(0.08, 0.18 + driftBias * 0.12 - gripBias * 0.06),
    boostSpeedMult:
      PLAYER_BOOST_SPEED_MULT +
      boostBias * 0.12 +
      (loadout.power.stats.boostReserve ?? 0),
    boostDrainMult: loadout.power.stats.boostDrainMult ?? 1,
    padSpeedMult:
      PAD_SPEED_BOOST_MULT + (loadout.power.stats.padSpeedMult ?? 0),
    padDuration:
      PAD_SPEED_BOOST_DURATION + (loadout.power.stats.padDuration ?? 0),
    invincibleDuration: 1.15 + (loadout.power.stats.invincibleBonus ?? 0),
    shieldRetention: loadout.power.stats.shieldRetention ?? 0,
    airTurnRate: loadout.power.stats.airTurnRate ?? 1,
    landingBoost: loadout.power.stats.landingBoost ?? 0,
    rampStick: loadout.power.stats.rampStick ?? 0,
    appearance: {
      paintName: loadout.paint.name,
      accentName: loadout.accent.name,
      tintName: loadout.tint.name,
      spoilerName: loadout.spoiler.name,
      glowName: loadout.glow.name,
    },
  };
}

function applyRuntimePlayerStats() {
  const loadoutStats = state.playerLoadoutStats ?? computePlayerLoadoutStats();
  const playerSpeedMult = settings.devMode ? devTuning.playerSpeedMult : 1;
  player.maxSpeed = loadoutStats.topSpeed * playerSpeedMult;
  player.accel = loadoutStats.accel * (0.94 + (playerSpeedMult - 1) * 0.45);
  player.turnRate = loadoutStats.turnRate;
  player.normalGrip = loadoutStats.normalGrip;
  player.driftGrip = loadoutStats.driftGrip;
}

function getCurrentWorldRule() {
  if (isMaxMode()) {
    return {
      id: "max_arena",
      name: "Max Arena",
      gripMult: 1,
      driftSlipMult: 1,
      boostMult: 1,
      coastDragMult: 1,
      padEnergyMult: 1,
      rampKickMult: 1,
    };
  }
  return WORLD_RULES[state.worldIndex] ?? WORLD_RULES[0];
}

function getWorldModifierRule() {
  return (
    WORLD_MODIFIER_RULES[devTuning.worldModifier] ?? WORLD_MODIFIER_RULES.world
  );
}

function getCombinedWorldRule() {
  const base = getCurrentWorldRule();
  const modifier = getWorldModifierRule();
  if (devTuning.worldModifier === "neutral") {
    return {
      id: "neutral",
      name: "Neutral",
      gripMult: 1,
      driftSlipMult: 1,
      boostMult: 1,
      coastDragMult: 1,
      padEnergyMult: 1,
      rampKickMult: 1,
    };
  }
  return {
    id: base.id,
    name:
      modifier.label === "World Native"
        ? base.name
        : `${base.name} + ${modifier.label}`,
    gripMult: base.gripMult * modifier.gripMult,
    driftSlipMult: base.driftSlipMult * modifier.driftSlipMult,
    boostMult: base.boostMult * modifier.boostMult,
    coastDragMult: base.coastDragMult * modifier.coastDragMult,
    padEnergyMult: base.padEnergyMult * modifier.padEnergyMult,
    rampKickMult: base.rampKickMult * modifier.rampKickMult,
  };
}

function getActiveMaxBoostVariant() {
  return (
    MAX_BOOST_VARIANTS.find(
      (variant) => variant.id === devTuning.maxBoostVariant,
    ) ?? MAX_BOOST_VARIANTS[1]
  );
}

function createEmptyMatchStats() {
  return {
    events: [],
    lastGoal: null,
    teams: {
      blue: { goals: 0, shots: 0, saves: 0, demolitions: 0 },
      red: { goals: 0, shots: 0, saves: 0, demolitions: 0 },
    },
  };
}

function resetCarMatchStats(car) {
  car.matchStats = {
    goals: 0,
    assists: 0,
    saves: 0,
    shots: 0,
    demolitions: 0,
  };
  car.lastTouchAt = 0;
  car.lastTouchType = null;
  car.lastShotAt = 0;
}

function resetMaxMatchState() {
  maxMode.stats = createEmptyMatchStats();
  maxMode.touchChain = [];
  maxMode.replayBuffer = [];
  maxMode.replaySampleTimer = 0;
  maxMode.replayActive = false;
  maxMode.replayFrames = [];
  maxMode.replayFrameIndex = 0;
  maxMode.replayFrameTimer = 0;
  maxMode.replayMeta = "";
  maxMode.pendingKickoff = null;
  maxMode.riskMemory = {
    blueConceded: 0,
    redConceded: 0,
    playerTouches: 0,
    recentMisses: 0,
  };
  [player, ...bots].forEach(resetCarMatchStats);
}

function resetCampaignRiskMemory() {
  state.campaignRisk = {
    recentHits: 0,
    recentEscapes: 0,
    nearMisses: 0,
  };
}

function getTeamSpawnSlots(team) {
  const dims = getMaxArenaDimensions();
  const halfWidth = dims.halfWidth;
  const halfLength = dims.halfLength;
  return team === "blue"
    ? [
        [0, Math.round(-halfLength * 0.6)],
        [0, Math.round(-halfLength * 0.76)],
        [Math.round(-halfWidth * 0.32), Math.round(-halfLength * 0.47)],
        [Math.round(halfWidth * 0.32), Math.round(-halfLength * 0.47)],
        [0, Math.round(-halfLength * 0.28)],
      ]
    : [
        [0, Math.round(halfLength * 0.76)],
        [Math.round(-halfWidth * 0.32), Math.round(halfLength * 0.47)],
        [0, Math.round(halfLength * 0.31)],
        [Math.round(halfWidth * 0.32), Math.round(halfLength * 0.47)],
        [0, Math.round(halfLength * 0.58)],
      ];
}

function getCarLabel(car) {
  if (car === player) return "Player";
  if (car?.team)
    return `${car.team === "blue" ? "Blue" : "Red"} ${car.role ?? "car"}`;
  return "Bot";
}

function addMatchEvent(type, payload = {}) {
  if (!maxMode.stats) maxMode.stats = createEmptyMatchStats();
  maxMode.stats.events.unshift({
    type,
    at: Number(state.elapsed.toFixed(2)),
    ...payload,
  });
  maxMode.stats.events = maxMode.stats.events.slice(0, 8);
}

function savePersistentState() {
  const payload = {
    worldIndex: state.worldIndex,
    levelIndex: state.levelIndex,
    settings: {
      difficulty: settings.difficulty,
      campaignAiMode: settings.campaignAiMode,
      maxDifficulty: settings.maxDifficulty,
      invertSteer: settings.invertSteer,
      cameraFocus: settings.cameraFocus,
      rampDensity: settings.rampDensity,
      deviceMode: settings.deviceMode,
      devMode: settings.devMode,
      activeGameMode: settings.activeGameMode,
      id4Mode: settings.id4Mode,
      reducedMotion: settings.reducedMotion,
      audioEnabled: settings.audioEnabled,
    },
    progression: {
      xp: state.progression.xp,
      runs: state.progression.runs,
      bestScore: state.progression.bestScore,
      medals: state.progression.medals,
      completedTutorial: state.progression.completedTutorial,
      dailySeed: state.progression.dailySeed,
    },
    devTuning: {
      playerSpeedMult: devTuning.playerSpeedMult,
      botSpeedMult: devTuning.botSpeedMult,
      infiniteBoost: devTuning.infiniteBoost,
      invulnerable: devTuning.invulnerable,
      freezeBots: devTuning.freezeBots,
      allowDemolitions: devTuning.allowDemolitions,
      allowReplay: devTuning.allowReplay,
      maxBoostVariant: devTuning.maxBoostVariant,
      worldModifier: devTuning.worldModifier,
    },
    customization: {
      bodyId: customization.bodyId,
      wheelId: customization.wheelId,
      styleId: customization.styleId,
      powerId: customization.powerId,
      paintId: customization.paintId,
      accentId: customization.accentId,
      tintId: customization.tintId,
      spoilerId: customization.spoilerId,
      glowId: customization.glowId,
    },
    maxTeamCustomization: {
      blue: { ...maxTeamCustomization.blue },
      red: { ...maxTeamCustomization.red },
    },
  };
  try {
    localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    debugLog("menu", "save_failed", error?.message || error);
  }
}

function loadPersistentState() {
  try {
    const raw = localStorage.getItem(SAVE_STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") return;
    if (data.settings && typeof data.settings === "object") {
      if (typeof data.settings.difficulty === "string")
        settings.difficulty = data.settings.difficulty;
      if (typeof data.settings.campaignAiMode === "string")
        settings.campaignAiMode = data.settings.campaignAiMode;
      if (typeof data.settings.maxDifficulty === "string")
        settings.maxDifficulty = data.settings.maxDifficulty;
      if (typeof data.settings.invertSteer === "boolean")
        settings.invertSteer = data.settings.invertSteer;
      if (typeof data.settings.cameraFocus === "boolean")
        settings.cameraFocus = data.settings.cameraFocus;
      if (typeof data.settings.rampDensity === "string")
        settings.rampDensity = data.settings.rampDensity;
      if (typeof data.settings.deviceMode === "string")
        settings.deviceMode = data.settings.deviceMode;
      if (typeof data.settings.devMode === "boolean")
        settings.devMode = data.settings.devMode;
      if (typeof data.settings.activeGameMode === "string")
        settings.activeGameMode = data.settings.activeGameMode;
      if (typeof data.settings.id4Mode === "string")
        settings.id4Mode = data.settings.id4Mode;
      if (typeof data.settings.reducedMotion === "boolean")
        settings.reducedMotion = data.settings.reducedMotion;
      if (typeof data.settings.audioEnabled === "boolean")
        settings.audioEnabled = data.settings.audioEnabled;
    }
    if (data.progression && typeof data.progression === "object") {
      if (Number.isFinite(data.progression.xp))
        state.progression.xp = data.progression.xp;
      if (Number.isFinite(data.progression.runs))
        state.progression.runs = data.progression.runs;
      if (Number.isFinite(data.progression.bestScore))
        state.progression.bestScore = data.progression.bestScore;
      if (
        data.progression.medals &&
        typeof data.progression.medals === "object"
      )
        state.progression.medals = data.progression.medals;
      if (typeof data.progression.completedTutorial === "boolean")
        state.progression.completedTutorial =
          data.progression.completedTutorial;
      if (typeof data.progression.dailySeed === "string")
        state.progression.dailySeed = data.progression.dailySeed;
    }
    if (data.devTuning && typeof data.devTuning === "object") {
      if (Number.isFinite(data.devTuning.playerSpeedMult))
        devTuning.playerSpeedMult = data.devTuning.playerSpeedMult;
      if (Number.isFinite(data.devTuning.botSpeedMult))
        devTuning.botSpeedMult = data.devTuning.botSpeedMult;
      if (typeof data.devTuning.infiniteBoost === "boolean")
        devTuning.infiniteBoost = data.devTuning.infiniteBoost;
      if (typeof data.devTuning.invulnerable === "boolean")
        devTuning.invulnerable = data.devTuning.invulnerable;
      if (typeof data.devTuning.freezeBots === "boolean")
        devTuning.freezeBots = data.devTuning.freezeBots;
      if (typeof data.devTuning.allowDemolitions === "boolean")
        devTuning.allowDemolitions = data.devTuning.allowDemolitions;
      if (typeof data.devTuning.allowReplay === "boolean")
        devTuning.allowReplay = data.devTuning.allowReplay;
      if (typeof data.devTuning.maxBoostVariant === "string")
        devTuning.maxBoostVariant = data.devTuning.maxBoostVariant;
      if (typeof data.devTuning.worldModifier === "string")
        devTuning.worldModifier = data.devTuning.worldModifier;
    }
    if (data.customization && typeof data.customization === "object") {
      if (typeof data.customization.bodyId === "string")
        customization.bodyId = data.customization.bodyId;
      if (typeof data.customization.wheelId === "string")
        customization.wheelId = data.customization.wheelId;
      if (typeof data.customization.styleId === "string")
        customization.styleId = data.customization.styleId;
      if (typeof data.customization.powerId === "string")
        customization.powerId = data.customization.powerId;
      if (typeof data.customization.paintId === "string")
        customization.paintId = data.customization.paintId;
      if (typeof data.customization.accentId === "string")
        customization.accentId = data.customization.accentId;
      if (typeof data.customization.tintId === "string")
        customization.tintId = data.customization.tintId;
      if (typeof data.customization.spoilerId === "string")
        customization.spoilerId = data.customization.spoilerId;
      if (typeof data.customization.glowId === "string")
        customization.glowId = data.customization.glowId;
    }
    if (
      data.maxTeamCustomization &&
      typeof data.maxTeamCustomization === "object"
    ) {
      ["blue", "red"].forEach((team) => {
        const teamConfig = data.maxTeamCustomization[team];
        if (!teamConfig || typeof teamConfig !== "object") return;
        if (typeof teamConfig.paintId === "string")
          maxTeamCustomization[team].paintId = teamConfig.paintId;
        if (typeof teamConfig.accentId === "string")
          maxTeamCustomization[team].accentId = teamConfig.accentId;
        if (typeof teamConfig.tintId === "string")
          maxTeamCustomization[team].tintId = teamConfig.tintId;
        if (typeof teamConfig.glowId === "string")
          maxTeamCustomization[team].glowId = teamConfig.glowId;
      });
    }
    const worldIndex = Number.isFinite(data.worldIndex) ? data.worldIndex : 0;
    const safeWorld = clampWorldIndex(worldIndex);
    const levelIndex = Number.isFinite(data.levelIndex) ? data.levelIndex : 0;
    state.worldIndex = safeWorld;
    state.levelIndex = clampLevelIndex(safeWorld, levelIndex);
    clampCustomizationToUnlocks({
      worldIndex: safeWorld,
      levelIndex: state.levelIndex,
    });
    if (settings.activeGameMode === GAME_MODE_RISK)
      settings.activeGameMode = GAME_MODE_MAX1;
  } catch (error) {
    debugLog("menu", "load_failed", error?.message || error);
  }
}

function refreshDevModeUi() {
  const maxModeActive = isMaxMode();
  if (campaignAiSelect) {
    campaignAiSelect.value = settings.campaignAiMode;
  }
  if (devModeToggle) devModeToggle.checked = settings.devMode;
  document.body.classList.toggle("dev-mode-enabled", settings.devMode);
  touchControlsRoot?.classList.toggle("dev-mode", settings.devMode);
  if (touchJump) {
    touchJump.hidden = !input.touchEnabled;
  }
  if (touchBackflip) {
    touchBackflip.hidden = !input.touchEnabled;
  }
  if (devTools) {
    devTools.hidden = !settings.devMode;
  }
  if (devId33Panel) devId33Panel.hidden = !settings.devMode || maxModeActive;
  if (devMaxPanel) devMaxPanel.hidden = !settings.devMode || !maxModeActive;
  if (devPlayerSpeed) {
    devPlayerSpeed.value = String(Math.round(devTuning.playerSpeedMult * 100));
  }
  if (devPlayerSpeedValue) {
    devPlayerSpeedValue.textContent = `${Math.round(devTuning.playerSpeedMult * 100)}%`;
  }
  if (devBotSpeed) {
    devBotSpeed.value = String(Math.round(devTuning.botSpeedMult * 100));
  }
  if (devBotSpeedValue) {
    devBotSpeedValue.textContent = `${Math.round(devTuning.botSpeedMult * 100)}%`;
  }
  if (devInfiniteBoost) {
    devInfiniteBoost.checked = settings.devMode && devTuning.infiniteBoost;
  }
  if (devInvulnerable) {
    devInvulnerable.checked = settings.devMode && devTuning.invulnerable;
  }
  if (devFreezeBots) {
    devFreezeBots.checked = settings.devMode && devTuning.freezeBots;
  }
  if (devMaxDemoToggle) {
    devMaxDemoToggle.checked = settings.devMode && devTuning.allowDemolitions;
  }
  if (devMaxReplayToggle) {
    devMaxReplayToggle.checked = settings.devMode && devTuning.allowReplay;
  }
  if (devDebugHud) {
    devDebugHud.checked = DEBUG_FLAGS.enabled;
  }
  if (devDebugLogs) {
    devDebugLogs.checked =
      DEBUG_FLAGS.enabled &&
      DEBUG_FLAGS.world &&
      DEBUG_FLAGS.menu &&
      DEBUG_FLAGS.hits;
  }
  if (devModeHint) {
    devModeHint.hidden = !settings.devMode;
    devModeHint.textContent = settings.devMode
      ? maxModeActive
        ? "Dev Mode enabled. Arena debug controls and protected tuning tools are unlocked."
        : "Dev Mode enabled. Protected tuning tools and quick debug actions are unlocked."
      : "Dev Mode only unlocks protected tuning, debug, and force-action tools.";
  }
  if (devModeStatus) {
    devModeStatus.hidden = !settings.devMode;
    devModeStatus.textContent = `Status: ${settings.devMode ? "Enabled" : "Disabled"}`;
  }
  if (devWorldSelect) {
    devWorldSelect.innerHTML = "";
    worldData.forEach((world, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = `World ${index + 1} - ${world.name}`;
      option.selected = index === state.worldIndex;
      devWorldSelect.appendChild(option);
    });
  }
  if (devLevelSelect) {
    devLevelSelect.innerHTML = "";
    const world = worldData[state.worldIndex];
    world.levels.forEach((level, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = `Level ${index + 1} - ${level.name}`;
      option.selected = index === state.levelIndex;
      devLevelSelect.appendChild(option);
    });
  }
  if (devMaxBoostVariant) {
    devMaxBoostVariant.innerHTML = "";
    MAX_BOOST_VARIANTS.forEach((variant) => {
      const option = document.createElement("option");
      option.value = variant.id;
      option.textContent = variant.name;
      option.selected = variant.id === devTuning.maxBoostVariant;
      devMaxBoostVariant.appendChild(option);
    });
  }
  if (devWorldModifierSelect) {
    devWorldModifierSelect.innerHTML = "";
    Object.entries(WORLD_MODIFIER_RULES).forEach(([id, rule]) => {
      const option = document.createElement("option");
      option.value = id;
      option.textContent = rule.label;
      option.selected = id === devTuning.worldModifier;
      devWorldModifierSelect.appendChild(option);
    });
  }
  if (devMaxSummary) {
    const boostVariant = getActiveMaxBoostVariant();
    const worldRule = getCombinedWorldRule();
    devMaxSummary.innerHTML = `
      <div class="match-stat"><span>Replay</span><strong>${maxMode.replayMeta || "Ready"}</strong></div>
      <div class="match-stat"><span>Boost</span><strong>${boostVariant.name}</strong></div>
      <div class="match-stat"><span>World</span><strong>${worldRule.name}</strong></div>
      <div class="match-stat"><span>Demos</span><strong>${devTuning.allowDemolitions ? "On" : "Off"}</strong></div>
    `;
  }
  refreshGamesUi();
}

function setDevMode(enabled, { save = true, announce = true } = {}) {
  const wasEnabled = settings.devMode;
  settings.devMode = enabled;
  if (!enabled) {
    state.ballCam = false;
    state.ballLungeCooldown = 0;
    state.botLungeCooldown = 0;
  }
  applyRuntimePlayerStats();
  if (enabled && !wasEnabled) {
    setActiveTab("settings");
  } else if (!enabled) {
    setActiveTab("settings");
  }
  refreshDevModeUi();
  refreshGamesUi();
  if (announce) {
    setEffectToast(enabled ? "Dev Mode Enabled" : "Dev Mode Disabled");
  }
  if (save) savePersistentState();
}

function setDevTuningValue(key, value) {
  devTuning[key] = value;
  applyRuntimePlayerStats();
  refreshDevModeUi();
  savePersistentState();
}

function resetMaxMatch() {
  maxMode.blueScore = 0;
  maxMode.redScore = 0;
  state.overtime = false;
  state.timeLeft = MAX_MODE_MATCH_TIME;
  startRun(true);
}

function performMaxBallLunge(actor = player) {
  if (!isMaxMode() || !maxMode.ball) return false;
  if (actor === player && state.ballLungeCooldown > 0) return false;
  const toBall = maxMode.ball.position.clone().sub(actor.position);
  const flatDistance = Math.hypot(toBall.x, toBall.z);
  if (flatDistance > MAX_BALL_LUNGE_RANGE || flatDistance < 0.001) return false;
  toBall.y = 0;
  toBall.normalize();
  actor.velocity.addScaledVector(toBall, 12);
  actor.speed = Math.min(actor.maxSpeed * 1.05, Math.max(actor.speed, 19));
  actor.heading = Math.atan2(toBall.x, toBall.z);
  actor.moveHeading = actor.heading;
  actor.maxBallLungeTimer = 0.18;
  if (actor === player) {
    state.ballLungeCooldown = MAX_BALL_LUNGE_COOLDOWN;
    setEffectToast("Ball Lunge");
  }
  return true;
}

function getNearestEnemyBotInRange(range = MAX_BOT_LUNGE_RANGE) {
  let best = null;
  let bestDist = range;
  bots.forEach((bot) => {
    if (bot.team === "blue") return;
    const distance = bot.position.distanceTo(player.position);
    if (distance < bestDist) {
      best = bot;
      bestDist = distance;
    }
  });
  return best;
}

function performMaxBotLunge(actor = player, explicitTarget = null) {
  if (!isMaxMode()) return false;
  if (actor === player && state.botLungeCooldown > 0) return false;
  const target =
    explicitTarget ??
    (actor === player
      ? getNearestEnemyBotInRange()
      : bots
          .filter((candidate) => candidate.team !== actor.team)
          .sort(
            (a, b) =>
              actor.position.distanceTo(a.position) -
              actor.position.distanceTo(b.position),
          )[0]);
  if (!target) return false;
  const toTarget = target.position.clone().sub(actor.position);
  const flatDistance = Math.hypot(toTarget.x, toTarget.z);
  if (flatDistance > MAX_BOT_LUNGE_RANGE || flatDistance < 0.001) return false;
  toTarget.y = 0;
  toTarget.normalize();
  actor.velocity.addScaledVector(toTarget, 20);
  actor.speed = Math.min(actor.maxSpeed * 1.22, Math.max(actor.speed, 32));
  actor.heading = Math.atan2(toTarget.x, toTarget.z);
  actor.moveHeading = actor.heading;
  actor.maxBotLungeTimer = 0.2;
  if (actor === player) {
    state.botLungeCooldown = MAX_BOT_LUNGE_COOLDOWN;
    setEffectToast("Target Lunge");
  }
  return true;
}

function jumpToCampaignLevel(worldIndex, levelIndex) {
  state.worldIndex = clampWorldIndex(worldIndex);
  state.levelIndex = clampLevelIndex(state.worldIndex, levelIndex);
  applyPlayerCustomization();
  buildWorld();
  clearBotState();
  spawnBots();
  if (!state.running) {
    spawnPowerups();
    player.setPosition(PLAYER_SPAWN_X, 0, PLAYER_SPAWN_Z);
    player.speed = 0;
    player.velocity.set(0, 0, 0);
    player.verticalVel = 0;
  } else {
    resetLevel();
  }
  refreshDevModeUi();
  updateHud();
  savePersistentState();
}

function refreshGamesUi() {
  const activeMeta = getActiveGameMeta();
  const maxProfile = getMaxDifficultyProfile();
  const id4Rule = getId4ModeRule();
  gameCards.forEach((card) => {
    const active = card.dataset.gameMode === settings.activeGameMode;
    card.classList.toggle("active", active);
    card.setAttribute("aria-pressed", active ? "true" : "false");
  });
  id4ModeCards.forEach((card) => {
    const active = card.dataset.id4Mode === settings.id4Mode;
    card.classList.toggle("active", active);
    card.setAttribute("aria-pressed", active ? "true" : "false");
  });
  if (gameModeHint) {
    gameModeHint.textContent = `Current game: ${activeMeta.title} - ${activeMeta.subtitle}. Objective: ${id4Rule.objective}`;
  }
  if (startBtn) {
    startBtn.textContent = `Start ${id4Rule.label}`;
  }
  if (overlaySubtitle) {
    overlaySubtitle.textContent = isMaxMode()
      ? `${id4Rule.subtitle} ${maxProfile.label} arena rules are active.`
      : id4Rule.subtitle;
  }
  const maxModeActive = isMaxMode();
  document.body.classList.toggle("max-mode", maxModeActive);
  difficultySelect?.closest(".field")?.toggleAttribute("hidden", maxModeActive);
  rampDensitySelect
    ?.closest(".field")
    ?.toggleAttribute("hidden", maxModeActive);
  campaignAiSelect?.closest(".field")?.toggleAttribute("hidden", maxModeActive);
  if (maxDifficultyField) {
    maxDifficultyField.toggleAttribute("hidden", !maxModeActive);
    maxDifficultyField.style.display = maxModeActive ? "" : "none";
    maxDifficultyField.setAttribute(
      "aria-hidden",
      maxModeActive ? "false" : "true",
    );
  }
  if (maxDifficultySelect) {
    maxDifficultySelect.value = settings.maxDifficulty;
  }
  if (modeSettingsHint) {
    modeSettingsHint.textContent = maxModeActive
      ? `Max settings: ${maxProfile.label} controls arena size, assist, camera, and enemy squad difficulty. Campaign difficulty and ID4 Hunter AI do not apply here.`
      : `Campaign settings: hunter difficulty, ramp density, free-play options, and ID4 Hunter AI (${settings.campaignAiMode === "risk" ? "Risk" : "Normal"}).`;
  }
  if (devClearLevel) {
    devClearLevel.textContent = maxModeActive ? "Golden Goal" : "Clear Level";
  }
  if (devResetMatch) {
    devResetMatch.hidden = !maxModeActive;
  }
  if (devResetScore) {
    devResetScore.hidden = !maxModeActive;
  }
  refreshModeCopy();
  refreshProgressionUi();
  refreshOnlineUi();
}

function setId4Mode(mode, { save = true, reset = false } = {}) {
  const nextMode = ID4_MODE_RULES[mode] ? mode : ID4_MODE_DEFAULT;
  const rule = ID4_MODE_RULES[nextMode];
  settings.id4Mode = nextMode;
  settings.activeGameMode = rule.mode;
  if (Number.isFinite(rule.worldIndex))
    state.worldIndex = clampWorldIndex(rule.worldIndex);
  if (Number.isFinite(rule.levelIndex))
    state.levelIndex = clampLevelIndex(state.worldIndex, rule.levelIndex);
  if (nextMode === "tutorial") {
    settings.campaignAiMode = "normal";
    settings.rampDensity = "normal";
  } else if (!isMaxMode()) {
    settings.campaignAiMode = "risk";
  }
  if (nextMode === "stunt") settings.rampDensity = "high";
  if (nextMode === "race") settings.difficulty = "casual";
  if (nextMode === "hunter" || nextMode === "boss")
    settings.difficulty = "brutal";
  refreshGamesUi();
  refreshDevModeUi();
  if (save) savePersistentState();
  if (reset || state.running) startRun(true);
  setEffectToast(rule.toast);
}

function refreshProgressionUi() {
  const level = Math.max(1, Math.floor(state.progression.xp / 1200) + 1);
  const nextXp = level * 1200;
  const best = Math.floor(state.progression.bestScore);
  const tutorialStatus = state.progression.completedTutorial
    ? "Complete"
    : "Next run";
  if (progressionBoard) {
    progressionBoard.innerHTML = `
      <div class="progression-tile"><span>Driver Level</span><strong>${level}</strong><small>${state.progression.xp} / ${nextXp} XP</small></div>
      <div class="progression-tile"><span>Runs</span><strong>${state.progression.runs}</strong><small>Fast restart loop</small></div>
      <div class="progression-tile"><span>Best Score</span><strong>${best}</strong><small>Saved locally</small></div>
      <div class="progression-tile"><span>Tutorial</span><strong>${tutorialStatus}</strong><small>First Ignition</small></div>
    `;
  }
  if (challengeList) {
    const minigame = getActiveMinigameRule();
    challengeList.innerHTML = `
      <li><strong>Daily:</strong> Earn 900 drift score in ${getId4ModeRule().label}.</li>
      <li><strong>Weekly:</strong> Clear ${minigame.label}, one campaign world, and score once in Max Arena.</li>
      <li><strong>Live event:</strong> ${minigame.objective}</li>
    `;
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getConfiguredServerUrl() {
  return (
    onlineServerUrlInput?.value?.trim() ||
    window.INFERNO_SERVER_URL ||
    localStorage.getItem("infernoDrift4.serverUrl") ||
    ""
  );
}

function normalizeServerUrl(url) {
  const trimmed = String(url || "").trim();
  if (!trimmed) return "";
  const withProtocol =
    trimmed.startsWith("ws://") || trimmed.startsWith("wss://")
      ? trimmed
      : trimmed.startsWith("http://")
        ? `ws://${trimmed.slice(7)}`
        : trimmed.startsWith("https://")
          ? `wss://${trimmed.slice(8)}`
          : `wss://${trimmed}`;
  try {
    const parsed = new URL(withProtocol);
    if (!parsed.pathname || parsed.pathname === "/") parsed.pathname = "/ws";
    return parsed.toString();
  } catch {
    return withProtocol;
  }
}

function addOnlineMessage(from, text, quick = false) {
  onlineState.messages.push({ from, text, quick, at: Date.now() });
  onlineState.messages = onlineState.messages.slice(-24);
  refreshOnlineUi();
}

function sendOnline(payload) {
  if (onlineState.socket?.readyState !== WebSocket.OPEN) {
    onlineState.pendingMessages.push(payload);
    onlineState.pendingMessages = onlineState.pendingMessages.slice(-12);
    if (onlineState.status === "offline") connectOnline();
    addOnlineMessage("System", "Queued until backend connects.", true);
    return true;
  }
  onlineState.socket.send(JSON.stringify(payload));
  return true;
}

function updateOnlineTelemetry(dt) {
  if (onlineState.socket?.readyState !== WebSocket.OPEN || !onlineState.room)
    return;
  onlineState.inputTimer += dt;
  if (onlineState.inputTimer < 0.25) return;
  onlineState.inputTimer = 0;
  sendOnline({
    type: "input.frame",
    tick: Math.round(state.elapsed * 60),
    mode: settings.id4Mode,
    x: Number(player.position.x.toFixed(2)),
    z: Number(player.position.z.toFixed(2)),
    speed: Number((Math.abs(player.speed) * SPEED_TO_MPH_MULT).toFixed(1)),
    boost: Number(state.boost.toFixed(2)),
  });
}

function connectOnline() {
  const serverUrl = normalizeServerUrl(getConfiguredServerUrl());
  if (!serverUrl) {
    addOnlineMessage(
      "System",
      "Backend offline - set a Worker or local ws URL.",
    );
    refreshOnlineUi();
    return;
  }
  localStorage.setItem("infernoDrift4.serverUrl", serverUrl);
  onlineState.serverUrl = serverUrl;
  onlineState.status = "connecting";
  refreshOnlineUi();
  try {
    onlineState.socket?.close();
    const socket = new WebSocket(serverUrl);
    onlineState.socket = socket;
    socket.addEventListener("open", () => {
      onlineState.status = "live";
      const username =
        onlineUsernameInput?.value?.trim() ||
        localStorage.getItem("infernoDrift4.username") ||
        `Drifter-${Math.floor(Math.random() * 900 + 100)}`;
      localStorage.setItem("infernoDrift4.username", username);
      sendOnline({ type: "auth.guest", username });
      const pending = onlineState.pendingMessages.splice(0);
      pending.forEach((message) => sendOnline(message));
      onlineState.lastPingAt = performance.now();
      sendOnline({ type: "ping", at: Date.now() });
      addOnlineMessage("System", "Connected to InfernoDrift4 online.");
      refreshOnlineUi();
    });
    socket.addEventListener("message", (event) => {
      let msg;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }
      handleOnlineMessage(msg);
    });
    socket.addEventListener("close", () => {
      onlineState.status = "offline";
      onlineState.room = null;
      addOnlineMessage(
        "System",
        "Disconnected. Offline bot mode is still playable.",
      );
      refreshOnlineUi();
    });
    socket.addEventListener("error", () => {
      onlineState.status = "error";
      addOnlineMessage("System", "Backend connection failed.");
      refreshOnlineUi();
    });
  } catch (error) {
    onlineState.status = "error";
    addOnlineMessage("System", error?.message || "Backend connection failed.");
  }
}

function handleOnlineMessage(msg) {
  if (msg.type === "hello") {
    onlineState.serverId = msg.id;
  } else if (msg.type === "auth.ok") {
    onlineState.user = msg.user;
  } else if (msg.type === "room.snapshot") {
    onlineState.room = msg.room;
    onlineState.leaderboard = msg.room?.leaderboard ?? onlineState.leaderboard;
    onlineState.recentPlayers = msg.room?.players ?? onlineState.recentPlayers;
    if (onlineRoomCodeInput && msg.room?.code)
      onlineRoomCodeInput.value = msg.room.code;
  } else if (msg.type === "chat.message") {
    onlineState.messages.push({
      from: msg.from || "Player",
      text: msg.text || "",
      quick: Boolean(msg.quick),
      at: Date.now(),
    });
    onlineState.messages = onlineState.messages.slice(-24);
  } else if (msg.type === "leaderboard.snapshot") {
    onlineState.leaderboard = msg.leaderboard ?? [];
  } else if (msg.type === "friends.snapshot") {
    onlineState.friends = msg.friends ?? [];
    onlineState.recentPlayers = msg.recentPlayers ?? onlineState.recentPlayers;
  } else if (msg.type === "pong") {
    onlineState.latencyMs = Math.max(
      0,
      Math.round(performance.now() - onlineState.lastPingAt),
    );
  } else if (msg.type === "error") {
    addOnlineMessage("Server", msg.error || "Request rejected.");
  }
  refreshOnlineUi();
}

function refreshOnlineUi() {
  const configuredUrl = getConfiguredServerUrl();
  if (onlineServerUrlInput && !onlineServerUrlInput.value) {
    onlineServerUrlInput.value = configuredUrl;
  }
  if (onlineUsernameInput && !onlineUsernameInput.value) {
    onlineUsernameInput.value =
      localStorage.getItem("infernoDrift4.username") || "Drifter";
  }
  const live = onlineState.status === "live";
  const offline = !configuredUrl || onlineState.status === "offline";
  if (onlineStatusCard) {
    onlineStatusCard.innerHTML = `
      <div class="online-dot ${live ? "live" : offline ? "offline" : "pending"}"></div>
      <div><strong>${live ? "Online backend connected" : offline ? "Backend offline - bot mode active" : "Backend connecting"}</strong><span>${live ? `${escapeHtml(onlineState.serverUrl)} · ${onlineState.latencyMs || 0}ms` : configuredUrl ? escapeHtml(configuredUrl) : "Set a Cloudflare Worker or local ws URL for online rooms."}</span></div>
    `;
  }
  if (onlineRoomState) {
    onlineRoomState.textContent = onlineState.room
      ? `${onlineState.room.mode} room ${onlineState.room.code} · ${onlineState.room.players?.length ?? 0}/${onlineState.room.size} players · ${onlineState.room.bots} bot fill`
      : live
        ? "Connected - create, join, or queue for a room."
        : "Offline bot mode";
  }
  if (onlineRoomList) {
    onlineRoomList.innerHTML = onlineState.room
      ? (onlineState.room.players ?? [])
          .map(
            (playerInfo) =>
              `<li><strong>${escapeHtml(playerInfo.username)}</strong> <span>${Math.round(playerInfo.rating ?? 1000)} SR</span></li>`,
          )
          .join("")
      : `<li><strong>Bot Match:</strong> all modes remain playable offline.</li>`;
  }
  if (onlineChatLog) {
    onlineChatLog.innerHTML =
      onlineState.messages.length === 0
        ? `<div class="chat-line"><strong>System</strong><span>Safe chat appears here after connecting.</span></div>`
        : onlineState.messages
            .map(
              (msg) =>
                `<div class="chat-line"><strong>${escapeHtml(msg.from)}${msg.quick ? " · quick" : ""}</strong><span>${escapeHtml(msg.text)}</span></div>`,
            )
            .join("");
    onlineChatLog.scrollTop = onlineChatLog.scrollHeight;
  }
  if (onlineLeaderboard) {
    onlineLeaderboard.innerHTML =
      onlineState.leaderboard.length > 0
        ? onlineState.leaderboard
            .slice(0, 6)
            .map(
              (entry, index) =>
                `<li><strong>#${index + 1} ${escapeHtml(entry.username ?? entry.name ?? "Driver")}</strong> ${Math.round(entry.rating ?? entry.score ?? 1000)}</li>`,
            )
            .join("")
        : `<li><strong>Bronze:</strong> 1000 SR placement baseline</li><li><strong>Silver:</strong> 1200 SR</li><li><strong>Gold:</strong> 1450 SR</li>`;
  }
  if (onlineSocialList) {
    const friends = onlineState.friends.length
      ? onlineState.friends
          .map((friend) => escapeHtml(friend.username ?? friend))
          .join(", ")
      : "Friends sync when backend is connected.";
    const recent = onlineState.recentPlayers.length
      ? onlineState.recentPlayers
          .map((playerInfo) => escapeHtml(playerInfo.username ?? playerInfo))
          .join(", ")
      : "Recent players appear after a room.";
    onlineSocialList.innerHTML = `<li><strong>Friends:</strong> ${friends}</li><li><strong>Recent:</strong> ${recent}</li>`;
  }
  if (onlineFeatureList) {
    onlineFeatureList.innerHTML = `
      <li><strong>Offline:</strong> campaign, Max Arena, bots, progression, garage, saves, and challenges work now.</li>
      <li><strong>Online backend:</strong> guest accounts, rooms, private codes, matchmaking queues, bot fill, recent players, friends shell, chat, ranks, and leaderboards use the configured WebSocket backend.</li>
      <li><strong>Safety:</strong> chat is sanitized and rate limited; gameplay messages are schema checked server-side.</li>
    `;
  }
}

function setActiveTab(tabName = "settings") {
  tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabName);
  });
  tabPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === `tab-${tabName}`);
  });
}

function setActiveGameMode(mode, { save = true, reset = false } = {}) {
  const normalizedMode = mode === GAME_MODE_RISK ? GAME_MODE_MAX1 : mode;
  const nextMode =
    normalizedMode === GAME_MODE_MAX1 ? GAME_MODE_MAX1 : GAME_MODE_ID33;
  settings.id4Mode = nextMode === GAME_MODE_MAX1 ? "battle" : "campaign";
  if (settings.activeGameMode === nextMode && !reset) {
    refreshGamesUi();
    return;
  }
  settings.activeGameMode = nextMode;
  state.ballCam = false;
  state.ballLungeCooldown = 0;
  state.botLungeCooldown = 0;
  lastLivesRendered = -1;
  refreshGamesUi();
  if (save) savePersistentState();
  if (reset) startRun(true);
  else if (state.running) resetLevel();
}

function refreshModeCopy() {
  const maxModeActive = isMaxMode();
  if (tips) {
    tips.innerHTML = maxModeActive
      ? `
        <div><span>Forward:</span> W / Arrow Up</div>
        <div><span>Left:</span> A / Arrow Left</div>
        <div><span>Right:</span> D / Arrow Right</div>
        <div><span>Reverse:</span> S / Arrow Down</div>
        <div><span>Ball Lunge:</span> Space (close to ball)</div>
        <div><span>Target Lunge:</span> Ctrl / Command (close to enemy)</div>
        <div><span>Boost:</span> Shift</div>
        <div><span>Ball Cam:</span> L</div>
        <div><span>Restart:</span> R</div>
        <div><span>Menu:</span> Esc</div>
      `
      : `
        <div><span>Forward:</span> W / Arrow Up</div>
        <div><span>Left:</span> A / Arrow Left</div>
        <div><span>Right:</span> D / Arrow Right</div>
        <div><span>Reverse:</span> S / Arrow Down</div>
        <div><span>Handbrake:</span> Space</div>
        <div><span>Boost:</span> Shift</div>
        <div><span>Jump:</span> X</div>
        <div><span>Backflip:</span> C</div>
        <div><span>Restart:</span> R</div>
        <div><span>Menu:</span> Esc</div>
        <div><span>Start / Next:</span> Enter</div>
      `;
  }
  if (controlsList) {
    controlsList.innerHTML = maxModeActive
      ? `
        <li><strong>Forward:</strong> W / Arrow Up</li>
        <li><strong>Left:</strong> A / Arrow Left</li>
        <li><strong>Right:</strong> D / Arrow Right</li>
        <li><strong>Reverse:</strong> S / Arrow Down</li>
        <li><strong>Ball Lunge:</strong> Space when close to the ball</li>
        <li><strong>Target Lunge:</strong> Ctrl / Command when close to an enemy bot</li>
        <li><strong>Boost:</strong> Shift</li>
        <li><strong>Ball Cam:</strong> L</li>
        <li><strong>Restart:</strong> R</li>
        <li><strong>Menu:</strong> Esc</li>
      `
      : `
        <li><strong>Forward:</strong> W / Arrow Up</li>
        <li><strong>Left:</strong> A / Arrow Left</li>
        <li><strong>Right:</strong> D / Arrow Right</li>
        <li><strong>Reverse:</strong> S / Arrow Down</li>
        <li><strong>Handbrake:</strong> Space</li>
        <li><strong>Boost:</strong> Shift</li>
        <li><strong>Jump:</strong> X</li>
        <li><strong>Backflip:</strong> C</li>
        <li><strong>Restart:</strong> R</li>
        <li><strong>Menu:</strong> Esc</li>
      `;
  }
  if (howtoList) {
    howtoList.innerHTML = maxModeActive
      ? `
        <li>Score by driving or striking the ball into the red goal.</li>
        <li>Use <strong>Space</strong> when semi-close to the ball to lunge into a play.</li>
        <li>Use <strong>Ctrl</strong> or <strong>Command</strong> near enemy bots to slam them and cut off rotations.</li>
        <li>Your <strong>Health</strong> starts full, drops on enemy impacts, and a zero bar causes a short stun before refilling.</li>
        <li>Boost pads and Ball Cam help you recover faster and stay on the play.</li>
        <li>Blue is your team. Protect your goal, pressure theirs, and let the goalie recover behind you.</li>
      `
      : `
        <li>Stay alive until the timer ends to clear the level.</li>
        <li>Hunter bots will chase you — dodge or bait them wide.</li>
        <li>Hit neon ramps to launch and earn airtime bonus.</li>
        <li>Boost pads refill boost and sling you forward.</li>
        <li>Use Jump and Backflip to set up trick landings and airborne recoveries.</li>
        <li>Collect powerups: Boost, Shield, Life, or Slow.</li>
      `;
  }
  if (touchDrift) {
    touchDrift.textContent = maxModeActive ? "Ball Lunge" : "Drift";
  }
  if (touchBackflip) {
    touchBackflip.textContent = maxModeActive ? "Target" : "Backflip";
  }
}

function resetDevTuning() {
  Object.assign(devTuning, DEFAULT_DEV_TUNING);
  applyRuntimePlayerStats();
  refreshDevModeUi();
  savePersistentState();
}

function getNextProgressIndices() {
  const world = getWorld();
  if (state.levelIndex < world.levels.length - 1) {
    return { worldIndex: state.worldIndex, levelIndex: state.levelIndex + 1 };
  }
  if (state.worldIndex < worldData.length - 1) {
    return { worldIndex: state.worldIndex + 1, levelIndex: 0 };
  }
  return { worldIndex: state.worldIndex, levelIndex: state.levelIndex };
}

const obstacles = [];
const ramps = [];
const powerups = [];
const boostPads = [];
const modeMarkers = [];
const bots = [];

const tempVector = new THREE.Vector3();
const tempVectorB = new THREE.Vector3();
const tempVectorC = new THREE.Vector3();
let lastLivesRendered = -1;
const FX_POOL_SIZE = 160;
const fxPool = [];
let botIdSeed = 1;

const groundGrid = new THREE.GridHelper(WORLD_SIZE, 44, 0x355c80, 0x243f5a);
groundGrid.position.y = 0.01;
if (Array.isArray(groundGrid.material)) {
  groundGrid.material.forEach((material) => {
    material.transparent = true;
    material.opacity = 0;
  });
} else {
  groundGrid.material.transparent = true;
  groundGrid.material.opacity = 0;
}
scene.add(groundGrid);

function pointSegmentDistance2D(px, pz, ax, az, bx, bz) {
  const abx = bx - ax;
  const abz = bz - az;
  const apx = px - ax;
  const apz = pz - az;
  const abLenSq = abx * abx + abz * abz;
  if (abLenSq === 0) return Math.hypot(px - ax, pz - az);
  const t = THREE.MathUtils.clamp((apx * abx + apz * abz) / abLenSq, 0, 1);
  const cx = ax + abx * t;
  const cz = az + abz * t;
  return Math.hypot(px - cx, pz - cz);
}

function segmentSegmentDistance2D(a0x, a0z, a1x, a1z, b0x, b0z, b1x, b1z) {
  const distances = [
    pointSegmentDistance2D(a0x, a0z, b0x, b0z, b1x, b1z),
    pointSegmentDistance2D(a1x, a1z, b0x, b0z, b1x, b1z),
    pointSegmentDistance2D(b0x, b0z, a0x, a0z, a1x, a1z),
    pointSegmentDistance2D(b1x, b1z, a0x, a0z, a1x, a1z),
  ];
  return Math.min(...distances);
}

function debugLog(channel, ...args) {
  if (!DEBUG_FLAGS.enabled) return;
  if (!DEBUG_FLAGS[channel]) return;
  console.log(`[debug:${channel}]`, ...args);
}

function disposeObject3D(root) {
  if (!root) return;
  root.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (Array.isArray(child.material)) {
      child.material.forEach((mat) => mat && mat.dispose && mat.dispose());
    } else if (child.material && child.material.dispose) {
      child.material.dispose();
    }
  });
}

class Car {
  constructor({ color = 0xff4d2d, accent = 0x10131a, isBot = false } = {}) {
    this.group = new THREE.Group();
    this.visualRoot = new THREE.Group();
    this.wheels = [];
    this.group.add(this.visualRoot);
    this.group.castShadow = false;

    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.heading = 0;
    this.moveHeading = 0;
    this.speed = 0;
    this.maxSpeed = isBot ? 48 : PLAYER_MAX_SPEED;
    this.accel = isBot ? 18 : 22 * PLAYER_ACCEL_MULT;
    this.turnRate = isBot ? 2.3 : 2.8;
    this.driftGrip = 1.1;
    this.normalGrip = 3.4;
    this.verticalVel = 0;
    this.isBot = isBot;
    this.collisionRadius = isBot ? BOT_RADIUS : CAR_RADIUS;
    this.boosted = false;
    this.target = null;
    this.lastRampTime = 0;
    this.aiBurstCooldown = 0;
    this.prevPosition = new THREE.Vector3();
    this.visualConfig = null;
    this.underglow = null;
    this.backflipActive = false;
    this.backflipProgress = 0;
    this.backflipRecovery = 0;
    this.maxHealth = MAX_HEALTH_MAX;
    this.maxStunTimer = 0;
    this.maxBoostTimer = 0;
    this.maxBotLungeTimer = 0;
    this.demolished = false;
    this.respawnTimer = 0;
    this.respawnPoint = null;
    this.lastTouchAt = 0;
    this.lastTouchType = null;
    this.lastShotAt = 0;
    this.onWall = false;
    this.surfacePitch = 0;
    this.surfaceRoll = 0;
    this.matchStats = {
      goals: 0,
      assists: 0,
      saves: 0,
      shots: 0,
      demolitions: 0,
    };
    this.healthBarGroup = new THREE.Group();
    this.healthBarBg = new THREE.Mesh(
      new THREE.PlaneGeometry(2.1, 0.18),
      new THREE.MeshBasicMaterial({
        color: 0x09111a,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
      }),
    );
    this.healthBarFill = new THREE.Mesh(
      new THREE.PlaneGeometry(2.02, 0.1),
      new THREE.MeshBasicMaterial({
        color: 0x8dffb2,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
      }),
    );
    this.healthBarFill.position.z = 0.01;
    this.healthBarGroup.add(this.healthBarBg, this.healthBarFill);
    this.healthBarGroup.visible = false;
    scene.add(this.healthBarGroup);

    this.rebuildVisual({
      primary: color,
      accent,
      bodyScale: [1.8, 0.5, 3.2],
      hoodScale: [1.6, 0.35, 1.2],
      cabinScale: [1.3, 0.45, 1.2],
      trunkScale: [1.4, 0.3, 0.8],
      lightScale: 1,
      wheelRadius: 0.35,
      wheelWidth: 0.4,
      wheelColor: 0x0b0f14,
      rimColor: 0xbcc9d6,
      spoiler: "none",
      glowColor: 0x5feaff,
      tintColor: 0x2d5b7a,
    });
    this.group.position.copy(this.position);
    this.prevPosition.copy(this.position);
  }

  rebuildVisual(config) {
    while (this.visualRoot.children.length) {
      const child =
        this.visualRoot.children[this.visualRoot.children.length - 1];
      this.visualRoot.remove(child);
      disposeObject3D(child);
    }
    this.wheels = [];
    this.visualConfig = config;
    const primaryMat = new THREE.MeshStandardMaterial({
      color: config.primary,
      roughness: 0.4,
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: config.accent,
      roughness: 0.5,
    });
    const lightMat = new THREE.MeshStandardMaterial({
      color: 0xffd4b5,
      emissive: 0xff7a45,
      emissiveIntensity: 1,
    });
    const tailMat = new THREE.MeshStandardMaterial({
      color: 0xff4d2d,
      emissive: 0xff4d2d,
      emissiveIntensity: 1,
    });
    const rimMat = new THREE.MeshStandardMaterial({
      color: config.rimColor,
      roughness: 0.25,
      metalness: 0.55,
    });
    const wheelMat = new THREE.MeshStandardMaterial({
      color: config.wheelColor,
      roughness: 0.82,
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: config.tintColor,
      roughness: 0.18,
      metalness: 0.25,
      transparent: true,
      opacity: 0.86,
    });

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(...config.bodyScale),
      primaryMat,
    );
    body.position.y = 0.45 + (config.bodyScale[1] - 0.5) * 0.3;

    const hood = new THREE.Mesh(
      new THREE.BoxGeometry(...config.hoodScale),
      accentMat,
    );
    hood.position.set(
      0,
      0.65 + (config.hoodScale[1] - 0.35) * 0.4,
      0.8 + (config.hoodScale[2] - 1.2) * 0.2,
    );

    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(...config.cabinScale),
      glassMat,
    );
    cabin.position.set(0, 0.85 + (config.cabinScale[1] - 0.45) * 0.4, -0.08);

    const trunk = new THREE.Mesh(
      new THREE.BoxGeometry(...config.trunkScale),
      accentMat.clone(),
    );
    trunk.position.set(
      0,
      0.62 + (config.trunkScale[1] - 0.3) * 0.32,
      -1.2 - (config.trunkScale[2] - 0.8) * 0.3,
    );

    this.visualRoot.add(body, hood, cabin, trunk);

    if (
      config.spoiler === "street" ||
      config.spoiler === "wing" ||
      config.spoiler === "fin"
    ) {
      const spoiler = new THREE.Mesh(
        new THREE.BoxGeometry(1.22, 0.08, 0.52),
        accentMat.clone(),
      );
      spoiler.position.set(0, 1.08, -1.75);
      const spoilerStandL = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.22, 0.08),
        accentMat.clone(),
      );
      const spoilerStandR = spoilerStandL.clone();
      spoilerStandL.position.set(-0.38, 0.94, -1.66);
      spoilerStandR.position.set(0.38, 0.94, -1.66);
      this.visualRoot.add(spoiler, spoilerStandL, spoilerStandR);
      if (config.spoiler === "fin") {
        spoiler.scale.set(0.78, 1, 0.7);
        const fin = new THREE.Mesh(
          new THREE.BoxGeometry(0.14, 0.42, 0.08),
          accentMat.clone(),
        );
        fin.position.set(0, 1.18, -1.72);
        this.visualRoot.add(fin);
      }
      if (config.spoiler === "street") {
        spoiler.scale.set(0.95, 1, 0.82);
      }
    }

    const wheelGeo = new THREE.CylinderGeometry(
      config.wheelRadius,
      config.wheelRadius,
      config.wheelWidth,
      16,
    );
    const rimGeo = new THREE.CylinderGeometry(
      config.wheelRadius * 0.58,
      config.wheelRadius * 0.58,
      config.wheelWidth + 0.02,
      12,
    );
    const wheelOffsets = [
      [-0.9, 0.25, 1.1],
      [0.9, 0.25, 1.1],
      [-0.9, 0.25, -1.1],
      [0.9, 0.25, -1.1],
    ];
    wheelOffsets.forEach(([x, y, z]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, y + (config.wheelRadius - 0.35) * 0.35, z);
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.z = Math.PI / 2;
      wheel.add(rim);
      this.visualRoot.add(wheel);
      this.wheels.push(wheel);
    });

    const lightGeo = new THREE.BoxGeometry(0.2 * config.lightScale, 0.15, 0.1);
    const lightLeft = new THREE.Mesh(lightGeo, lightMat);
    const lightRight = lightLeft.clone();
    lightLeft.position.set(-0.55, 0.55, 1.7);
    lightRight.position.set(0.55, 0.55, 1.7);

    const tailGeo = new THREE.BoxGeometry(0.22 * config.lightScale, 0.1, 0.1);
    const tailLeft = new THREE.Mesh(tailGeo, tailMat);
    const tailRight = tailLeft.clone();
    tailLeft.position.set(-0.55, 0.55, -1.7);
    tailRight.position.set(0.55, 0.55, -1.7);
    this.visualRoot.add(lightLeft, lightRight, tailLeft, tailRight);

    const glow = new THREE.Mesh(
      new THREE.CylinderGeometry(1.05, 1.3, 0.02, 18),
      new THREE.MeshBasicMaterial({
        color: config.glowColor,
        transparent: true,
        opacity: 0.42,
      }),
    );
    glow.position.set(0, 0.08, 0);
    this.visualRoot.add(glow);
    this.underglow = glow;
  }

  setPosition(x, y, z) {
    this.position.set(x, y, z);
    this.group.position.copy(this.position);
    this.prevPosition.copy(this.position);
  }

  updateWheels(speed) {
    this.wheels.forEach((wheel) => {
      wheel.rotation.x -= speed * 0.05;
    });
  }

  update(dt) {
    this.prevPosition.copy(this.position);
    if (this.demolished) {
      this.group.visible = false;
      this.healthBarGroup.visible = false;
      return;
    }
    this.position.addScaledVector(this.velocity, dt);
    this.group.position.copy(this.position);
    this.group.rotation.y = this.heading;
    if (this.backflipActive) {
      this.backflipProgress = Math.min(
        1,
        this.backflipProgress + dt / BACKFLIP_DURATION,
      );
      const spinAngle = this.backflipProgress * Math.PI * 2;
      this.visualRoot.rotation.x = -spinAngle;
      this.visualRoot.rotation.z =
        Math.sin(this.backflipProgress * Math.PI * 2) * 0.035;
      if (this.backflipProgress >= 1) {
        this.backflipActive = false;
        this.backflipRecovery =
          input.backflip && this.position.y > 0.08
            ? 0
            : BACKFLIP_RECOVERY_DURATION;
      }
    } else if (this.backflipRecovery > 0) {
      this.backflipRecovery = Math.max(0, this.backflipRecovery - dt);
      const settle = this.backflipRecovery / BACKFLIP_RECOVERY_DURATION;
      this.visualRoot.rotation.x = -settle * settle * 0.18;
      this.visualRoot.rotation.z = settle * 0.04;
    } else {
      this.visualRoot.rotation.x = THREE.MathUtils.lerp(
        this.visualRoot.rotation.x,
        0,
        Math.min(1, dt * 12),
      );
      this.visualRoot.rotation.z = THREE.MathUtils.lerp(
        this.visualRoot.rotation.z,
        0,
        Math.min(1, dt * 12),
      );
    }
    this.visualRoot.rotation.z += this.surfaceRoll;
    this.visualRoot.rotation.x += this.surfacePitch;
    this.updateWheels(this.speed * dt);
    this.healthBarGroup.position.set(
      this.position.x,
      this.position.y + 2.8,
      this.position.z,
    );
    this.healthBarGroup.quaternion.copy(camera.quaternion);
    this.group.visible = true;
  }

  triggerBackflip() {
    this.backflipActive = true;
    this.backflipProgress = 0;
    this.backflipRecovery = 0;
    this.visualRoot.rotation.x = 0;
    this.visualRoot.rotation.z = 0;
  }

  setHealthBar(percent, visible) {
    this.healthBarGroup.visible = visible && !this.demolished;
    if (!visible) return;
    const clamped = THREE.MathUtils.clamp(percent, 0, 1);
    this.healthBarFill.scale.x = Math.max(0.001, clamped);
    this.healthBarFill.position.x = -1.01 + clamped * 1.01;
    const color =
      clamped > 0.6 ? 0x8dffb2 : clamped > 0.3 ? 0xffd86d : 0xff7979;
    this.healthBarFill.material.color.setHex(color);
  }

  setDemolished(demolished) {
    this.demolished = demolished;
    this.group.visible = !demolished;
    this.healthBarGroup.visible = false;
    if (demolished) {
      this.speed = 0;
      this.velocity.set(0, 0, 0);
      this.verticalVel = 0;
      this.maxStunTimer = 0;
    }
  }
}

const player = new Car({ color: 0xfff1d0, accent: 0x12151c, isBot: false });
scene.add(player.group);

function rebuildPlayerCarMesh() {
  const loadout = getCurrentCustomization();
  player.rebuildVisual({
    ...loadout.body.visual,
    primary: loadout.paint.color,
    accent: loadout.accent.color,
    tintColor: loadout.tint.color,
    wheelRadius: loadout.wheels.visual.radius,
    wheelWidth: loadout.wheels.visual.width,
    wheelColor: loadout.wheels.visual.color,
    rimColor: loadout.wheels.visual.rim,
    spoiler:
      loadout.spoiler.style === "none" && loadout.body.id === "interceptor"
        ? "wing"
        : loadout.spoiler.style,
    glowColor: loadout.glow.color,
  });
}

function applyPlayerCustomization(options = {}) {
  clampCustomizationToUnlocks(options.progress);
  state.playerLoadoutStats = computePlayerLoadoutStats();
  applyRuntimePlayerStats();
  rebuildPlayerCarMesh();
  refreshCustomizationMenu();
}

function makeBot(color) {
  const bot = new Car({ color, accent: 0x14141a, isBot: true });
  bot.botId = botIdSeed++;
  scene.add(bot.group);
  return bot;
}

function getDifficultyProfile() {
  return {
    no_bots: {
      botSkill: 0,
      leadFactor: 0.2,
      reaction: 1.2,
      burstChance: 0,
      speedMultiplier: 0.95,
      heatRamp: 0.75,
      teamwork: 0,
    },
    casual: {
      botSkill: 0.72,
      leadFactor: 0.38,
      reaction: 1.9,
      burstChance: 0.06,
      speedMultiplier: 1.07,
      heatRamp: 0.75,
      teamwork: 0.15,
    },
    classic: {
      botSkill: 0.92,
      leadFactor: 0.62,
      reaction: 2.4,
      burstChance: 0.11,
      speedMultiplier: 1.23,
      heatRamp: 1,
      teamwork: 0.62,
    },
    brutal: {
      botSkill: 1.12,
      leadFactor: 0.84,
      reaction: 3.1,
      burstChance: 0.18,
      speedMultiplier: 1.46,
      heatRamp: 1.4,
      teamwork: 0.9,
    },
  }[settings.difficulty];
}

function getBotRole(index, count, teamwork) {
  if (teamwork < 0.3) return "chase";
  if (index === 0) return "intercept";
  if (index % 4 === 1) return "left_flank";
  if (index % 4 === 2) return "right_flank";
  if (index === count - 1) return "cutoff";
  return "pressure";
}

function createFxPool() {
  for (let i = 0; i < FX_POOL_SIZE; i += 1) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 6, 6),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
      }),
    );
    mesh.visible = false;
    scene.add(mesh);
    fxPool.push({
      mesh,
      velocity: new THREE.Vector3(),
      life: 0,
      maxLife: 0.45,
    });
  }
}

function spawnFx(position, velocity, color, scale = 1, life = 0.45) {
  const particle = fxPool.find((item) => item.life <= 0);
  if (!particle) return;
  particle.mesh.visible = true;
  particle.mesh.position.copy(position);
  particle.mesh.scale.setScalar(scale);
  particle.mesh.material.color.setHex(color);
  particle.mesh.material.opacity = 1;
  particle.velocity.copy(velocity);
  particle.life = life;
  particle.maxLife = life;
}

function updateFx(dt) {
  for (const particle of fxPool) {
    if (particle.life <= 0) continue;
    particle.life -= dt;
    if (particle.life <= 0) {
      particle.mesh.visible = false;
      particle.mesh.material.opacity = 0;
      continue;
    }
    particle.velocity.multiplyScalar(0.96);
    particle.velocity.y += 0.5 * dt;
    particle.mesh.position.addScaledVector(particle.velocity, dt);
    const alpha = particle.life / particle.maxLife;
    particle.mesh.material.opacity = alpha;
    particle.mesh.scale.setScalar(0.18 + alpha * 0.55);
  }
}

function makePowerup(type) {
  const colors = {
    boost: 0x28d7ff,
    shield: 0x7bff9d,
    life: 0xff4d2d,
    slow: 0xffc457,
  };
  const geo = new THREE.IcosahedronGeometry(0.9 * POWERUP_VISUAL_SCALE, 0);
  const mesh = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({
      color: colors[type],
      emissive: colors[type],
      emissiveIntensity: 0.6,
    }),
  );
  mesh.userData.type = type;
  mesh.userData.spin = Math.random() * Math.PI * 2;
  scene.add(mesh);
  return mesh;
}

function setEffectToast(text) {
  state.effectToast = text;
  state.effectToastTimer = 1.4;
  if (/boost|surge|lunge/i.test(text)) playTone("boost");
  else if (/stun|demol|critical|hit/i.test(text)) playTone("hit");
  else if (/clear|win|goal|medal|champion/i.test(text)) playTone("score");
  else if (/jump|flip|landing/i.test(text)) playTone("jump");
  else playTone("ui");
}

function makeRamp(kind = "normal") {
  const isMega = kind === "mega";
  const isTitan = kind === "titan";
  const baseRadius = isTitan ? 21 : isMega ? 10.5 : 6.2;
  const jumpLift = isTitan ? 26 : isMega ? 8.8 : 4;
  const speedKick = isTitan ? 31 : isMega ? 16 : 11;
  const launchMult = isTitan ? 1.33 : 1;
  const rampGroup = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(
      baseRadius,
      baseRadius,
      isTitan ? 0.9 : isMega ? 0.58 : 0.45,
      32,
    ),
    new THREE.MeshStandardMaterial({ color: 0x1a2028, roughness: 0.5 }),
  );
  base.position.y = isTitan ? 0.46 : isMega ? 0.28 : 0.22;
  const dome = new THREE.Mesh(
    new THREE.ConeGeometry(
      isTitan ? 14.2 : isMega ? 7.2 : 4.8,
      isTitan ? 5.4 : isMega ? 2.6 : 1.8,
      32,
    ),
    new THREE.MeshStandardMaterial({
      color: 0xff7a45,
      emissive: 0x5a1e10,
      roughness: 0.35,
    }),
  );
  dome.position.y = isTitan ? 3.2 : isMega ? 1.6 : 1.1;
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(
      baseRadius + 0.35,
      isTitan ? 0.5 : isMega ? 0.35 : 0.25,
      12,
      46,
    ),
    new THREE.MeshStandardMaterial({
      color: 0xffa24c,
      emissive: 0xff6b2e,
      emissiveIntensity: 0.9,
      roughness: 0.2,
    }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = isTitan ? 0.78 : isMega ? 0.5 : 0.38;

  rampGroup.add(base, dome, ring);
  rampGroup.userData.radius = isTitan ? 22 : isMega ? 10.8 : 6.4;
  rampGroup.userData.jumpLift = jumpLift;
  rampGroup.userData.speedKick = speedKick;
  rampGroup.userData.launchMult = launchMult;
  rampGroup.userData.kind = kind;
  scene.add(rampGroup);
  return rampGroup;
}

function makeBuilding(x, z, height, color) {
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.86 });
  const supportWidth = 2.6;
  const supportDepth = 2.6;
  const clearance = Math.max(5.4, Math.min(7.2, height * 0.58));
  const span = 10;
  const capHeight = Math.max(1.2, height - clearance);

  const leftSupport = new THREE.Mesh(
    new THREE.BoxGeometry(supportWidth, clearance, supportDepth),
    mat,
  );
  const rightSupport = new THREE.Mesh(
    new THREE.BoxGeometry(supportWidth, clearance, supportDepth),
    mat,
  );
  const cap = new THREE.Mesh(
    new THREE.BoxGeometry(span, capHeight, supportDepth + 0.5),
    mat,
  );
  const glow = new THREE.Mesh(
    new THREE.BoxGeometry(span + 0.8, 0.22, supportDepth + 1.2),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.24,
      transparent: true,
      opacity: 0.55,
    }),
  );

  leftSupport.position.set(
    x - span * 0.5 + supportWidth * 0.5,
    clearance * 0.5,
    z,
  );
  rightSupport.position.set(
    x + span * 0.5 - supportWidth * 0.5,
    clearance * 0.5,
    z,
  );
  cap.position.set(x, clearance + capHeight * 0.5, z);
  glow.position.set(x, clearance + 0.28, z);
  arena.add(leftSupport, rightSupport, cap, glow);

  obstacles.push({
    mesh: leftSupport,
    size: new THREE.Vector3(supportWidth, clearance, supportDepth),
  });
  obstacles.push({
    mesh: rightSupport,
    size: new THREE.Vector3(supportWidth, clearance, supportDepth),
  });
}

function makeBarrier(x, z, width, depth) {
  const geo = new THREE.BoxGeometry(width, 2, depth);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x2a2f3b,
    roughness: 0.7,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, 1, z);
  props.add(mesh);
  obstacles.push({ mesh, size: new THREE.Vector3(width, 2, depth) });
}

function makeBoostPad() {
  const padGroup = new THREE.Group();
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(3.2, 3.2, 0.18, 24),
    new THREE.MeshStandardMaterial({
      color: 0x0d3c4d,
      emissive: 0x0b8fb8,
      emissiveIntensity: 0.45,
      roughness: 0.35,
    }),
  );
  disc.position.y = 0.09;
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.8, 0.24, 12, 40),
    new THREE.MeshStandardMaterial({
      color: 0x27f2ff,
      emissive: 0x27f2ff,
      emissiveIntensity: 0.9,
      roughness: 0.2,
    }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.24;
  const beacon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 1.1, 1.9, 18, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0x56e9ff,
      emissive: 0x56e9ff,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
    }),
  );
  beacon.position.y = 1.08;
  padGroup.add(disc, ring, beacon);
  padGroup.userData.radius = 3.3;
  padGroup.userData.disc = disc;
  padGroup.userData.ring = ring;
  padGroup.userData.beacon = beacon;
  padGroup.userData.phase = Math.random() * Math.PI * 2;
  scene.add(padGroup);
  return padGroup;
}

function clearModeObjectives() {
  modeMarkers.forEach((marker) => {
    marker.parent?.remove(marker);
    disposeObject3D(marker);
  });
  modeMarkers.splice(0, modeMarkers.length);
  state.modeObjective = { ...MODE_OBJECTIVE_DEFAULT };
}

function makeModeMarker({
  x,
  z,
  color = 0x9fe7ff,
  label = "Objective",
  radius = 8,
  kind = "objective",
  index = 0,
}) {
  const group = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(radius, 0.36, 10, 52),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.82,
      roughness: 0.24,
    }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.36;
  const beacon = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.12, radius * 0.55, 3.2, 18, 1, true),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.36,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
    }),
  );
  beacon.position.y = 1.75;
  group.add(ring, beacon);
  group.position.set(x, 0, z);
  group.userData = {
    label,
    radius,
    kind,
    index,
    complete: false,
    ring,
    beacon,
    radarKind: "objective",
    radarColor: `#${color.toString(16).padStart(6, "0")}`,
  };
  props.add(group);
  modeMarkers.push(group);
  return group;
}

function getActiveMinigameRule() {
  const seed = state.progression.runs + state.worldIndex + state.levelIndex;
  return ID4_MINIGAME_RULES[seed % ID4_MINIGAME_RULES.length];
}

function objectivePoints(count, radius = HALF_WORLD * 0.58, phase = 0) {
  return Array.from({ length: count }, (_, index) => {
    const angle = phase + (index / count) * Math.PI * 2;
    return {
      x: Math.cos(angle) * radius,
      z: Math.sin(angle) * radius,
    };
  });
}

function spawnModeObjectives() {
  clearModeObjectives();
  const mode = settings.id4Mode;
  if (isMaxMode()) {
    state.modeObjective = {
      ...MODE_OBJECTIVE_DEFAULT,
      label: mode === "battle" ? "Battle Arena" : "Max Arena",
      detail: "Score, defend, and use target lunges to win the arena.",
      type: "max",
      target: MAX_MODE_GOAL_TARGET,
    };
    return;
  }
  let rule = {
    label: getId4ModeRule().label,
    objective: getId4ModeRule().objective,
    markerCount: 0,
    color: 0x9fe7ff,
    type: "survival",
  };
  if (mode === "race") {
    rule = {
      label: "Race / Time Trial",
      objective: "Clear all six checkpoints before time expires.",
      markerCount: 6,
      color: 0x86f4ff,
      type: "checkpoints",
    };
  } else if (mode === "stunt") {
    rule = {
      label: "Stunt Park",
      objective:
        "Hit stunt gates, then land flips and drifts for a combo medal.",
      markerCount: 5,
      color: 0xffc76b,
      type: "combo",
    };
  } else if (mode === "hunter" || mode === "boss") {
    rule = {
      label: mode === "boss" ? "Boss Chase" : "Hunter Tag",
      objective:
        mode === "boss"
          ? "Survive the finale boss pack and clear escape gates."
          : "Bait hunters through gates without losing all lives.",
      markerCount: mode === "boss" ? 4 : 5,
      color: mode === "boss" ? 0xff4a2e : 0xff6f86,
      type: "checkpoints",
    };
  } else if (mode === "minigames") {
    rule = getActiveMinigameRule();
  }

  state.modeObjective = {
    ...MODE_OBJECTIVE_DEFAULT,
    label: rule.label,
    detail: rule.objective,
    type: rule.type,
    target:
      rule.type === "zone"
        ? 8
        : rule.type === "combo"
          ? 6
          : Math.max(1, rule.markerCount || 1),
    minigameId: rule.id ?? "",
    comboTarget:
      rule.type === "combo"
        ? "drift + boost + air + landing"
        : rule.type === "zone"
          ? "hold the lit zone"
          : "",
  };

  if (rule.type === "survival") return;
  const markerRadius =
    rule.type === "zone" ? 26 : rule.type === "targets" ? 5 : 8;
  const points =
    rule.type === "zone"
      ? [{ x: 0, z: 12 }]
      : objectivePoints(
          rule.markerCount,
          rule.type === "targets" ? HALF_WORLD * 0.42 : HALF_WORLD * 0.58,
          mode === "stunt" ? Math.PI * 0.2 : Math.PI * -0.38,
        );
  points.forEach((point, index) => {
    const marker = makeModeMarker({
      ...point,
      color: rule.color,
      label: rule.label,
      radius: markerRadius,
      kind: rule.type,
      index,
    });
    marker.visible =
      index === 0 || rule.type === "targets" || rule.type === "zone";
    if (rule.type === "targets") {
      const pin = new THREE.Mesh(
        new THREE.CylinderGeometry(1.2, 1.5, 4.4, 14),
        new THREE.MeshStandardMaterial({
          color: 0xfaf4ea,
          emissive: rule.color,
          emissiveIntensity: 0.2,
          roughness: 0.38,
        }),
      );
      pin.position.y = 2.2;
      marker.add(pin);
    }
  });
}

function completeModeMarker(marker, value = 1) {
  if (!marker || marker.userData.complete) return;
  marker.userData.complete = true;
  marker.visible = false;
  state.modeObjective.progress += value;
  state.score += Math.round(140 * value * Math.max(1, state.combo));
  state.boost = Math.min(1, state.boost + 0.14);
  setEffectToast(
    `${state.modeObjective.label}: ${state.modeObjective.progress}/${state.modeObjective.target}`,
  );
  const next = modeMarkers.find(
    (candidate) =>
      !candidate.userData.complete &&
      candidate.userData.index === marker.userData.index + 1,
  );
  if (next && state.modeObjective.type !== "targets") next.visible = true;
}

function updateModeObjectives(dt) {
  const objective = state.modeObjective;
  if (!objective || objective.completed) return;
  if (isMaxMode()) {
    objective.progress = Math.max(maxMode.blueScore, maxMode.redScore);
    objective.target = MAX_MODE_GOAL_TARGET;
    objective.detail = `${maxMode.blueScore}-${maxMode.redScore} with ${player.role ?? "striker"} role active.`;
    return;
  }
  if (objective.type === "survival") {
    objective.progress = Math.max(0, getLevel().time - state.timeLeft);
    objective.target = getLevel().time;
    return;
  }
  objective.timer += dt;
  modeMarkers.forEach((marker, index) => {
    if (marker.userData.complete || !marker.visible) return;
    if (objective.type === "zone") {
      const orbit =
        state.elapsed * (objective.minigameId === "lava-floor" ? 0.42 : 0.28);
      marker.position.x = Math.cos(orbit) * HALF_WORLD * 0.22;
      marker.position.z = Math.sin(orbit * 0.82) * HALF_WORLD * 0.22;
    }
    marker.rotation.y += dt * 0.8;
    const distance = Math.hypot(
      player.position.x - marker.position.x,
      player.position.z - marker.position.z,
    );
    const inside = distance <= marker.userData.radius + CAR_RADIUS;
    if (objective.type === "zone") {
      if (inside) {
        const driftBonus = input.drift ? 1.8 : 1;
        objective.progress = Math.min(
          objective.target,
          objective.progress + dt * driftBonus,
        );
        state.score += dt * 38 * driftBonus;
        state.boost = Math.min(1, state.boost + dt * 0.02);
      } else if (objective.minigameId === "lava-floor" && state.running) {
        state.heat = Math.min(1.35, state.heat + dt * 0.04);
        state.score = Math.max(0, state.score - dt * 16);
      }
      return;
    }
    if (!inside) return;
    const value =
      objective.type === "combo"
        ? Math.max(1, Math.min(3, state.combo + state.airTime * 0.6))
        : 1;
    completeModeMarker(marker, value);
    if (objective.type === "targets") {
      for (let i = 0; i < 10; i += 1) {
        spawnFx(
          marker.position.clone().add(new THREE.Vector3(0, 1.2, 0)),
          new THREE.Vector3(
            (Math.random() - 0.5) * 5,
            1.5 + Math.random() * 2.4,
            (Math.random() - 0.5) * 5,
          ),
          0xffdf7a,
          0.8,
          0.34,
        );
      }
    }
    if (objective.type !== "targets") {
      state.modeObjective.checkpointIndex = Math.max(
        state.modeObjective.checkpointIndex,
        index + 1,
      );
    }
  });
  if (objective.type === "combo") {
    objective.progress = Math.max(objective.progress, Math.floor(state.combo));
    if (state.backflipChainCount > 0) objective.progress += dt * 0.7;
  }
  if (objective.progress >= objective.target && !objective.completed) {
    objective.completed = true;
    setEffectToast(`${objective.label} Cleared`);
    state.score += 450;
    if (state.running && settings.id4Mode !== "campaign") {
      completeLevel();
    }
  }
}

function generateSpacedPolarPoints(
  count,
  minRadius,
  maxRadius,
  minSpacing,
  maxAttempts = 2200,
) {
  const points = [];
  let attempts = 0;
  while (points.length < count && attempts < maxAttempts) {
    attempts += 1;
    const angle = Math.random() * Math.PI * 2;
    const radius = THREE.MathUtils.lerp(
      minRadius,
      maxRadius,
      Math.pow(Math.random(), 0.85),
    );
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    let tooClose = false;
    for (let i = 0; i < points.length; i += 1) {
      const dx = x - points[i].x;
      const dz = z - points[i].z;
      if (dx * dx + dz * dz < minSpacing * minSpacing) {
        tooClose = true;
        break;
      }
    }
    if (!tooClose) points.push({ x, z });
  }
  return points;
}

function getRampDensityConfig(density) {
  const table = {
    low: {
      randomCount: 6,
      spacing: 118,
      megaEvery: 9,
      extras: [{ x: 0, z: 108, kind: "normal" }],
    },
    normal: {
      randomCount: 18,
      spacing: 62,
      megaEvery: 5,
      extras: [
        { x: 0, z: 92, kind: "normal" },
        { x: -62, z: -44, kind: "mega" },
      ],
    },
    high: {
      randomCount: 56,
      spacing: 24,
      megaEvery: 3,
      extras: [
        { x: 0, z: 92, kind: "normal" },
        { x: -62, z: -44, kind: "mega" },
        { x: 74, z: -28, kind: "mega" },
        { x: -94, z: 34, kind: "mega" },
        { x: 96, z: 36, kind: "mega" },
        { x: -108, z: -84, kind: "normal" },
        { x: 108, z: -82, kind: "normal" },
      ],
    },
    extra_high: {
      randomCount: 110,
      spacing: 14,
      megaEvery: 2,
      extras: [
        { x: 0, z: 92, kind: "normal" },
        { x: -62, z: -44, kind: "mega" },
        { x: 74, z: -28, kind: "mega" },
        { x: -86, z: 78, kind: "normal" },
        { x: 86, z: 74, kind: "normal" },
        { x: -128, z: 0, kind: "mega" },
        { x: 128, z: 0, kind: "mega" },
        { x: 0, z: 128, kind: "mega" },
        { x: 0, z: -128, kind: "mega" },
        { x: -148, z: 96, kind: "normal" },
        { x: 148, z: 96, kind: "normal" },
        { x: -148, z: -96, kind: "normal" },
        { x: 148, z: -96, kind: "normal" },
      ],
    },
  };
  return table[density] ?? table.normal;
}

function spawnRampLayout(config) {
  ramps.length = 0;
  const titanRamp = makeRamp("titan");
  titanRamp.position.set(0, 0, 0);
  ramps.push(titanRamp);

  const rampPoints = generateSpacedPolarPoints(
    config.randomCount,
    120,
    HALF_WORLD - 55,
    config.spacing,
  );
  rampPoints.forEach(({ x, z }, index) => {
    const kind = index % config.megaEvery === 0 ? "mega" : "normal";
    const ramp = makeRamp(kind);
    ramp.position.set(x, 0, z);
    ramps.push(ramp);
  });

  config.extras.forEach(({ x, z, kind }) => {
    const ramp = makeRamp(kind);
    ramp.position.set(x, 0, z);
    ramps.push(ramp);
  });
}

function makeNeonBeacon(x, z, height, color) {
  const group = new THREE.Group();
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.9, 1.2, height, 10),
    new THREE.MeshStandardMaterial({ color: 0x1c2430, roughness: 0.7 }),
  );
  stem.position.y = height * 0.5;
  const glow = new THREE.Mesh(
    new THREE.CylinderGeometry(1.4, 1.4, 0.6, 16),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.8,
      roughness: 0.18,
    }),
  );
  glow.position.y = height + 0.35;
  group.add(stem, glow);
  group.position.set(x, 0, z);
  arena.add(group);
}

function makeHazardStrip(x, z, width, depth, color) {
  const strip = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.06, depth),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.45,
      roughness: 0.3,
    }),
  );
  strip.position.set(x, 0.04, z);
  props.add(strip);
}

function spawnExtraBoostPad(x, z) {
  const pad = makeBoostPad();
  pad.position.set(x, 0, z);
  boostPads.push(pad);
}

function getLevelFeatureConfig() {
  const variants = {
    "0-0": {
      layout: "open",
      padLane: "center",
      landmark: "beacons",
      extraRamps: [{ x: -84, z: 84, kind: "normal" }],
    },
    "0-1": {
      layout: "split",
      padLane: "north",
      landmark: "corner_towers",
      extraRamps: [{ x: 96, z: -58, kind: "mega" }],
    },
    "0-2": {
      layout: "outer",
      padLane: "east",
      landmark: "gateposts",
      extraRamps: [{ x: -126, z: 0, kind: "normal" }],
    },
    "0-3": {
      layout: "center",
      padLane: "ring",
      landmark: "beacons",
      extraRamps: [{ x: 0, z: -134, kind: "mega" }],
    },
    "1-0": {
      layout: "lanes",
      padLane: "south",
      landmark: "stacks",
      extraRamps: [{ x: 118, z: 62, kind: "normal" }],
    },
    "1-1": {
      layout: "diagonal",
      padLane: "west",
      landmark: "beacons",
      extraRamps: [{ x: -110, z: -72, kind: "mega" }],
    },
    "1-2": {
      layout: "outer",
      padLane: "center",
      landmark: "gateposts",
      extraRamps: [{ x: 124, z: 0, kind: "normal" }],
    },
    "1-3": {
      layout: "boost",
      padLane: "ring",
      landmark: "corner_towers",
      extraRamps: [{ x: 0, z: 136, kind: "mega" }],
    },
    "2-0": {
      layout: "lanes",
      padLane: "north",
      landmark: "stacks",
      extraRamps: [{ x: -132, z: 48, kind: "normal" }],
    },
    "2-1": {
      layout: "split",
      padLane: "east",
      landmark: "gateposts",
      extraRamps: [{ x: 138, z: -24, kind: "mega" }],
    },
    "2-2": {
      layout: "diagonal",
      padLane: "south",
      landmark: "stacks",
      extraRamps: [{ x: -96, z: -118, kind: "normal" }],
    },
    "2-3": {
      layout: "center",
      padLane: "center",
      landmark: "beacons",
      extraRamps: [{ x: 94, z: 118, kind: "mega" }],
    },
    "3-0": {
      layout: "outer",
      padLane: "west",
      landmark: "gateposts",
      extraRamps: [{ x: -144, z: 0, kind: "normal" }],
    },
    "3-1": {
      layout: "boost",
      padLane: "ring",
      landmark: "corner_towers",
      extraRamps: [{ x: 146, z: 34, kind: "mega" }],
    },
    "3-2": {
      layout: "open",
      padLane: "north",
      landmark: "beacons",
      extraRamps: [{ x: 0, z: -148, kind: "normal" }],
    },
    "3-3": {
      layout: "center",
      padLane: "center",
      landmark: "corner_towers",
      extraRamps: [{ x: 0, z: 150, kind: "mega" }],
    },
    "4-0": {
      layout: "diagonal",
      padLane: "east",
      landmark: "stacks",
      extraRamps: [{ x: -120, z: -104, kind: "normal" }],
    },
    "4-1": {
      layout: "split",
      padLane: "south",
      landmark: "gateposts",
      extraRamps: [{ x: 116, z: -116, kind: "mega" }],
    },
    "4-2": {
      layout: "boost",
      padLane: "west",
      landmark: "beacons",
      extraRamps: [{ x: -148, z: 60, kind: "normal" }],
    },
    "4-3": {
      layout: "outer",
      padLane: "ring",
      landmark: "corner_towers",
      extraRamps: [{ x: 148, z: 82, kind: "mega" }],
    },
  };
  return variants[`${state.worldIndex}-${state.levelIndex}`] ?? variants["0-0"];
}

function applyLevelIdentity(world) {
  if (isMaxMode()) return;
  const feature = getLevelFeatureConfig();
  const [primaryAccent, secondaryAccent] = world.accents;
  const beaconColor = secondaryAccent ?? primaryAccent;

  switch (feature.landmark) {
    case "corner_towers":
      [-132, 132].forEach((x) => {
        [-132, 132].forEach((z) =>
          makeNeonBeacon(x, z, 9 + Math.abs(x) / 44, beaconColor),
        );
      });
      break;
    case "stacks":
      [
        [-108, -44, 12],
        [108, 44, 16],
        [-122, 78, 10],
        [122, -78, 10],
      ].forEach(([x, z, height]) => makeBuilding(x, z, height, 0x2d2f35));
      break;
    case "gateposts":
      [
        [-118, -16],
        [118, 16],
        [-16, 118],
        [16, -118],
      ].forEach(([x, z]) => makeNeonBeacon(x, z, 8.5, primaryAccent));
      break;
    default:
      [-116, 0, 116].forEach((x, idx) =>
        makeNeonBeacon(x, idx % 2 === 0 ? 108 : -108, 8 + idx, beaconColor),
      );
      break;
  }

  switch (feature.layout) {
    case "lanes":
      [
        [-78, -36, 14],
        [-78, 36, 14],
        [78, -36, 14],
        [78, 36, 14],
      ].forEach(([x, z, h]) => makeBuilding(x, z, h, 0x30333c));
      break;
    case "split":
      [
        [-48, 46, 12],
        [48, -46, 12],
        [-102, 0, 10],
        [102, 0, 10],
      ].forEach(([x, z, h]) => makeBuilding(x, z, h, 0x34323b));
      break;
    case "diagonal":
      [
        [-88, -88, 10],
        [-28, -28, 12],
        [32, 32, 12],
        [92, 92, 10],
      ].forEach(([x, z, h]) => makeBuilding(x, z, h, 0x32353b));
      break;
    case "center":
      [
        [-34, 0, 11],
        [34, 0, 11],
        [0, -34, 11],
        [0, 34, 11],
      ].forEach(([x, z, h]) => makeBuilding(x, z, h, 0x353038));
      break;
    case "outer":
      [
        [-128, -26, 14],
        [128, 26, 14],
        [-26, 128, 14],
        [26, -128, 14],
      ].forEach(([x, z, h]) => makeBuilding(x, z, h, 0x2e3238));
      break;
    case "boost":
      [
        [-60, 66, 12],
        [60, 66, 12],
        [-60, -66, 12],
        [60, -66, 12],
      ].forEach(([x, z, h]) => makeBuilding(x, z, h, 0x32343d));
      break;
    default:
      break;
  }

  switch (feature.padLane) {
    case "north":
      [-78, 0, 78].forEach((x) => spawnExtraBoostPad(x, 138));
      break;
    case "south":
      [-78, 0, 78].forEach((x) => spawnExtraBoostPad(x, -138));
      break;
    case "east":
      [-78, 0, 78].forEach((z) => spawnExtraBoostPad(138, z));
      break;
    case "west":
      [-78, 0, 78].forEach((z) => spawnExtraBoostPad(-138, z));
      break;
    case "ring":
      [
        [0, 148],
        [0, -148],
        [148, 0],
        [-148, 0],
      ].forEach(([x, z]) => spawnExtraBoostPad(x, z));
      break;
    default:
      spawnExtraBoostPad(0, 118);
      spawnExtraBoostPad(0, -118);
      break;
  }

  feature.extraRamps.forEach(({ x, z, kind }) => {
    const ramp = makeRamp(kind);
    ramp.position.set(x, 0, z);
    ramps.push(ramp);
  });
}

function getMaxSurfaceHeight(x, z) {
  return 0;
}

function makeMaxGoal(team, zSign) {
  const dims = getMaxArenaDimensions();
  const color = team === "blue" ? 0x56e9ff : 0xff6868;
  const goal = new THREE.Group();
  const accent = team === "blue" ? 0x163f66 : 0x5a1f24;
  const leftPost = new THREE.Mesh(
    new THREE.CylinderGeometry(1.1, 1.1, dims.goalHeight, 16),
    new THREE.MeshStandardMaterial({
      color: 0xf6fbff,
      emissive: color,
      emissiveIntensity: 0.35,
      roughness: 0.25,
    }),
  );
  const rightPost = leftPost.clone();
  const crossbar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.95, 0.95, dims.goalWidth * 2 + 2.2, 16),
    new THREE.MeshStandardMaterial({
      color: 0xf6fbff,
      emissive: color,
      emissiveIntensity: 0.35,
      roughness: 0.25,
    }),
  );
  crossbar.rotation.z = Math.PI / 2;
  const backPanel = new THREE.Mesh(
    new THREE.BoxGeometry(dims.goalWidth * 2 + 4, dims.goalHeight - 2.4, 0.8),
    new THREE.MeshStandardMaterial({
      color: accent,
      emissive: color,
      emissiveIntensity: 0.18,
      transparent: true,
      opacity: 0.92,
    }),
  );
  const netFloor = new THREE.Mesh(
    new THREE.BoxGeometry(dims.goalWidth * 2 + 2, 0.12, dims.goalDepth),
    new THREE.MeshStandardMaterial({
      color: accent,
      emissive: color,
      emissiveIntensity: 0.15,
      transparent: true,
      opacity: 0.5,
    }),
  );
  const mouthGlow = new THREE.Mesh(
    new THREE.BoxGeometry(dims.goalWidth * 2 + 10, 0.2, 8),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.42,
      transparent: true,
      opacity: 0.68,
    }),
  );
  leftPost.position.set(-dims.goalWidth, dims.goalHeight * 0.5, 0);
  rightPost.position.set(dims.goalWidth, dims.goalHeight * 0.5, 0);
  crossbar.position.set(0, dims.goalHeight, 0);
  backPanel.position.set(
    0,
    (dims.goalHeight - 2.4) * 0.5,
    zSign * dims.goalDepth,
  );
  netFloor.position.set(0, 0.08, zSign * dims.goalDepth * 0.5);
  mouthGlow.position.set(0, 0.08, zSign * 2.8);
  goal.add(leftPost, rightPost, crossbar, backPanel, netFloor, mouthGlow);
  goal.position.set(0, 0, zSign * dims.goalLineZ);
  props.add(goal);
}

function buildMaxArena() {
  clearWorld();
  const profile = getMaxDifficultyProfile();
  const dims = getMaxArenaDimensions();
  scene.fog.color.setHex(0x132338);
  scene.background = new THREE.Color(0x17375a);
  groundMaterial.color.setHex(0x102339);

  const field = new THREE.Mesh(
    new THREE.PlaneGeometry(dims.halfWidth * 2, dims.halfLength * 2),
    new THREE.MeshStandardMaterial({
      color: 0x25557f,
      roughness: 0.74,
      metalness: 0.08,
      emissive: 0x0a1826,
      emissiveIntensity: 0.12,
    }),
  );
  field.rotation.x = -Math.PI / 2;
  field.position.y = 0.01;
  arena.add(field);

  const midfieldLine = new THREE.Mesh(
    new THREE.PlaneGeometry(dims.halfWidth * 1.95, 3.2),
    new THREE.MeshStandardMaterial({
      color: 0xe8f7ff,
      emissive: 0xb9efff,
      emissiveIntensity: 0.22,
      transparent: true,
      opacity: 0.78,
    }),
  );
  midfieldLine.rotation.x = -Math.PI / 2;
  midfieldLine.position.y = 0.04;
  arena.add(midfieldLine);

  const centerCircle = new THREE.Mesh(
    new THREE.RingGeometry(
      18 * profile.arenaScale,
      26 * profile.arenaScale,
      48,
    ),
    new THREE.MeshStandardMaterial({
      color: 0xe8f7ff,
      emissive: 0xb9efff,
      emissiveIntensity: 0.28,
      transparent: true,
      opacity: 0.84,
      side: THREE.DoubleSide,
    }),
  );
  centerCircle.rotation.x = -Math.PI / 2;
  centerCircle.position.y = 0.05;
  arena.add(centerCircle);

  const leftLane = new THREE.Mesh(
    new THREE.PlaneGeometry(12, dims.halfLength * 1.8),
    new THREE.MeshStandardMaterial({
      color: 0x56e9ff,
      emissive: 0x56e9ff,
      emissiveIntensity: 0.16,
      transparent: true,
      opacity: 0.24,
    }),
  );
  const rightLane = leftLane.clone();
  leftLane.rotation.x = -Math.PI / 2;
  rightLane.rotation.x = -Math.PI / 2;
  leftLane.position.set(
    -dims.halfWidth + Math.max(28, dims.halfWidth * 0.26),
    0.03,
    0,
  );
  rightLane.position.set(
    dims.halfWidth - Math.max(28, dims.halfWidth * 0.26),
    0.03,
    0,
  );
  arena.add(leftLane, rightLane);

  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x21496f,
    roughness: 0.46,
    metalness: 0.14,
  });
  const sideWallL = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, dims.wallHeight, dims.halfLength * 2 + 28),
    wallMat,
  );
  const sideWallR = sideWallL.clone();
  const endWallN = new THREE.Mesh(
    new THREE.BoxGeometry(dims.halfWidth * 2 + 6.4, dims.wallHeight, 3.2),
    wallMat,
  );
  const endWallS = endWallN.clone();
  sideWallL.position.set(-dims.halfWidth - 1.6, dims.wallHeight * 0.5, 0);
  sideWallR.position.set(dims.halfWidth + 1.6, dims.wallHeight * 0.5, 0);
  endWallN.position.set(0, dims.wallHeight * 0.5, -dims.halfLength - 1.6);
  endWallS.position.set(0, dims.wallHeight * 0.5, dims.halfLength + 1.6);
  arena.add(sideWallL, sideWallR, endWallN, endWallS);

  [-1, 1].forEach((zSign) => {
    makeMaxGoal(zSign < 0 ? "blue" : "red", zSign);
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(dims.goalWidth * 2 + 20, 0.08, 18),
      new THREE.MeshStandardMaterial({
        color: zSign < 0 ? 0x56e9ff : 0xff6868,
        emissive: zSign < 0 ? 0x56e9ff : 0xff6868,
        emissiveIntensity: 0.42,
      }),
    );
    strip.position.set(0, 0.05, zSign * (dims.goalLineZ - 5));
    props.add(strip);
  });

  [
    [0, 0],
    [-0.38, 0],
    [0.38, 0],
    [-0.74, -0.22],
    [0.74, -0.22],
    [-0.74, 0.22],
    [0.74, 0.22],
    [-0.44, -0.6],
    [0.44, -0.6],
    [-0.44, 0.6],
    [0.44, 0.6],
    [0, -0.45],
    [0, 0.45],
  ].forEach(([xr, zr]) => {
    const pad = makeBoostPad();
    pad.position.set(
      Math.round(dims.halfWidth * xr),
      0,
      Math.round(dims.halfLength * zr),
    );
    pad.userData.maxMode = true;
    pad.userData.radius = 4.8;
    boostPads.push(pad);
  });

  maxMode.ball = new THREE.Group();
  const ballCore = new THREE.Mesh(
    new THREE.SphereGeometry(MAX_BALL_RADIUS, 28, 28),
    new THREE.MeshStandardMaterial({
      color: 0xf7f8fb,
      roughness: 0.18,
      metalness: 0.18,
    }),
  );
  const ballStripe = new THREE.Mesh(
    new THREE.TorusGeometry(MAX_BALL_RADIUS * 0.76, 0.24, 12, 40),
    new THREE.MeshStandardMaterial({
      color: 0x76c7ff,
      emissive: 0x76c7ff,
      emissiveIntensity: 0.35,
      roughness: 0.16,
    }),
  );
  ballStripe.rotation.y = Math.PI / 2;
  const ballStripe2 = ballStripe.clone();
  ballStripe2.rotation.x = Math.PI / 2;
  const ballShadow = new THREE.Mesh(
    new THREE.CircleGeometry(MAX_BALL_RADIUS * 1.2, 28),
    new THREE.MeshStandardMaterial({
      color: 0x09111a,
      transparent: true,
      opacity: 0.28,
    }),
  );
  ballShadow.rotation.x = -Math.PI / 2;
  ballShadow.position.y = -MAX_BALL_RADIUS + 0.08;
  const ballAura = new THREE.Mesh(
    new THREE.RingGeometry(MAX_BALL_RADIUS * 1.16, MAX_BALL_RADIUS * 1.64, 36),
    new THREE.MeshBasicMaterial({
      color: 0xa6ebff,
      transparent: true,
      opacity: 0.24,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  ballAura.rotation.x = -Math.PI / 2;
  ballAura.position.y = -MAX_BALL_RADIUS + 0.2;
  maxMode.ball.add(ballCore, ballStripe, ballStripe2, ballShadow, ballAura);
  maxMode.ball.position.set(0, MAX_BALL_RADIUS, 0);
  props.add(maxMode.ball);
  maxMode.ballVelocity.set(0, 0, 0);
  maxMode.ballPrevPosition.copy(maxMode.ball.position);
  maxMode.blueScore = 0;
  maxMode.redScore = 0;
  maxMode.goalFlashTimer = 0;
  maxMode.lastScoredTeam = null;
  resetMaxMatchState();
  if (scene.fog) {
    scene.fog.near = 120;
    scene.fog.far = 980;
  }
}

function isMenuOpen() {
  return menu.classList.contains("show");
}

function setMenuOpen(open) {
  menu.classList.toggle("show", open);
  refreshCustomizationMenu();
  refreshDevModeUi();
  debugLog("menu", open ? "menu_open" : "menu_close");
}

function clearWorld() {
  obstacles.splice(0, obstacles.length);
  clearModeObjectives();
  ramps.forEach((ramp) => {
    scene.remove(ramp);
    disposeObject3D(ramp);
  });
  ramps.splice(0, ramps.length);
  powerups.forEach((powerup) => {
    scene.remove(powerup);
    disposeObject3D(powerup);
  });
  powerups.splice(0, powerups.length);
  boostPads.forEach((pad) => {
    scene.remove(pad);
    disposeObject3D(pad);
  });
  boostPads.splice(0, boostPads.length);
  arena.children.forEach((child) => disposeObject3D(child));
  props.children.forEach((child) => disposeObject3D(child));
  arena.clear();
  props.clear();
  maxMode.ball = null;
  maxMode.ballVelocity.set(0, 0, 0);
  maxMode.ballPrevPosition.set(0, 0, 0);
  maxMode.goalFlashTimer = 0;
  maxMode.lastScoredTeam = null;
}

function buildWorld() {
  if (state.isBuildingWorld) return;
  state.isBuildingWorld = true;
  try {
    if (isMaxMode()) {
      buildMaxArena();
      state.buildCount += 1;
      debugLog("world", "buildMaxArena complete", {
        buildCount: state.buildCount,
      });
      return;
    }
    clearWorld();
    const world = getWorld();
    scene.fog.color.setHex(world.fog);
    scene.background = new THREE.Color(world.sky);
    groundMaterial.color.setHex(world.ground);

    const rampConfig = getRampDensityConfig(settings.rampDensity);
    spawnRampLayout(rampConfig);

    boostPads.length = 0;
    const padPoints = generateSpacedPolarPoints(14, 105, HALF_WORLD - 52, 64);
    padPoints.forEach(({ x, z }) => {
      const pad = makeBoostPad();
      pad.position.set(x, 0, z);
      boostPads.push(pad);
    });
    [
      { x: 20, z: 20 },
      { x: -20, z: 35 },
    ].forEach(({ x, z }) => {
      const pad = makeBoostPad();
      pad.position.set(x, 0, z);
      boostPads.push(pad);
    });
    applyLevelIdentity(world);
    state.buildCount += 1;
    debugLog("world", "buildWorld complete", {
      buildCount: state.buildCount,
      ramps: ramps.length,
      pads: boostPads.length,
      rampDensity: settings.rampDensity,
    });
  } finally {
    state.isBuildingWorld = false;
  }
}

function getWorld() {
  if (isMaxMode()) {
    return {
      name: "InfernoDrift4 Max Arena",
      accents: [0x56e9ff, 0xff6c6c],
      fog: 0x14304a,
      sky: 0x22486c,
      ground: 0x17314a,
      levels: [
        {
          name: `${getMaxDifficultyProfile().label} Arena`,
          time: MAX_MODE_MATCH_TIME,
          bots: 5,
          botSpeed: 44,
          spawnRate: 1,
        },
      ],
    };
  }
  return worldData[state.worldIndex];
}

function getLevel() {
  return isMaxMode()
    ? getWorld().levels[0]
    : getWorld().levels[state.levelIndex];
}

function resetLevel() {
  state.combo = 1;
  state.boost = 1;
  state.shield = 0;
  state.shieldTimer = 0;
  state.invincible = 0;
  state.elapsed = 0;
  state.heat = 0;
  state.airTime = 0;
  state.wasAirborne = false;
  state.backflipQueueTimer = 0;
  state.devJumpComboTimer = 0;
  state.devJumpActive = false;
  state.devJumpCarrySpeed = 0;
  state.backflipChainCount = 0;
  state.slowBotsTimer = 0;
  state.effectToast = "";
  state.effectToastTimer = 0;
  const level = getLevel();
  state.timeLeft = level.time;
  state.overtime = false;

  const spawnX = isMaxMode() ? 0 : PLAYER_SPAWN_X;
  const spawnZ = isMaxMode() ? getTeamSpawnSlots("blue")[0][1] : PLAYER_SPAWN_Z;
  player.setDemolished(false);
  player.setPosition(
    spawnX,
    isMaxMode() ? getMaxSurfaceHeight(spawnX, spawnZ) : 0,
    spawnZ,
  );
  player.velocity.set(0, 0, 0);
  player.speed = 0;
  player.heading = isMaxMode() ? 0 : 0;
  player.moveHeading = player.heading;
  state.minimapHeading = player.heading;
  state.minimapDebugTimer = 0;
  player.verticalVel = 0;
  player.maxHealth = MAX_HEALTH_MAX;
  player.maxStunTimer = 0;
  player.maxBoostTimer = 0;
  player.backflipActive = false;
  player.backflipProgress = 0;
  player.backflipRecovery = 0;
  player.lastRampTime = 0;
  player.prevPosition.copy(player.position);
  input.backflip = false;
  state.steerSmoothed = 0;
  state.throttleSmoothed = 0;
  state.cameraShake = 0;
  state.lastHitAt = 0;
  state.lastHitByBotId = -1;
  state.postHitSafeFrames = 0;
  state.padSpeedTimer = 0;
  state.padSpeedMult = 1;
  state.noBotsRecoveryTimer = 0;
  resetCampaignRiskMemory();

  applyPlayerCustomization();
  buildWorld();
  spawnBots();
  if (isMaxMode()) {
    state.lives = 3;
    state.shield = 0;
    state.boost = 1;
    resetMaxMatchState();
  } else {
    spawnPowerups();
  }
  spawnModeObjectives();
}

function clearBotState() {
  bots.forEach((bot) => {
    scene.remove(bot.group);
    scene.remove(bot.healthBarGroup);
  });
  bots.splice(0, bots.length);
  maxMode.teamCars = [];
}

function spawnMaxBots() {
  clearBotState();
  const aiRules = getMaxAiRules();
  const blueSlots = getTeamSpawnSlots("blue");
  const redSlots = getTeamSpawnSlots("red");
  player.team = "blue";
  player.role = "striker";
  player.visualRoot.scale.setScalar(1.14);
  player.collisionRadius = 1.72;
  const botSpecs = [
    {
      team: "blue",
      role: "goalie",
      color: 0xa5f4ff,
      x: blueSlots[1][0],
      z: blueSlots[1][1],
      heading: 0,
      skill: 0.96,
    },
    {
      team: "blue",
      role: "support",
      color: 0x5feaff,
      x: blueSlots[2][0],
      z: blueSlots[2][1],
      heading: 0.05,
      skill: 1,
    },
    {
      team: "blue",
      role: "wing",
      color: 0x7fdbff,
      x: blueSlots[3][0],
      z: blueSlots[3][1],
      heading: -0.03,
      skill: 1.02,
    },
    {
      team: "blue",
      role: "sweeper",
      color: 0x8fcfff,
      x: blueSlots[4][0],
      z: blueSlots[4][1],
      heading: 0,
      skill: 1.04,
    },
    {
      team: "red",
      role: "goalie",
      color: 0xffb0b0,
      x: redSlots[0][0],
      z: redSlots[0][1],
      heading: Math.PI,
      skill: 1.04,
    },
    {
      team: "red",
      role: "defender",
      color: 0xff8a8a,
      x: redSlots[1][0],
      z: redSlots[1][1],
      heading: Math.PI - 0.05,
      skill: 1.08,
    },
    {
      team: "red",
      role: "playmaker",
      color: 0xff7b90,
      x: redSlots[3][0],
      z: redSlots[3][1],
      heading: Math.PI + 0.05,
      skill: 1.12,
    },
    {
      team: "red",
      role: "striker",
      color: 0xff6c6c,
      x: redSlots[2][0],
      z: redSlots[2][1],
      heading: Math.PI,
      skill: 1.14,
    },
  ];
  botSpecs.forEach((spec) => {
    const bot = makeBot(spec.color);
    bot.team = spec.team;
    bot.role = spec.role;
    bot.riskSkill = (spec.skill ?? 1) * aiRules.skillMult;
    bot.setPosition(spec.x, getMaxSurfaceHeight(spec.x, spec.z), spec.z);
    bot.heading = spec.heading;
    bot.moveHeading = spec.heading;
    bot.maxSpeed =
      (spec.role === "goalie" ? 28 : 33) *
      (spec.skill ?? 1) *
      aiRules.topSpeedMult;
    bot.accel =
      (spec.role === "goalie" ? 13.5 : 13) *
      (0.98 + (spec.skill ?? 1) * 0.08) *
      (0.94 + aiRules.skillMult * 0.08);
    bot.turnRate =
      (spec.role === "goalie" ? 3.2 : 2.95) *
      (0.96 + (spec.skill ?? 1) * 0.06) *
      (0.96 + aiRules.reactionWeight * 0.06);
    bot.visualRoot.scale.setScalar(1.12);
    bot.collisionRadius = 1.68;
    if (spec.role === "goalie") {
      bot.visualRoot.scale.setScalar(1.26);
      bot.collisionRadius = 1.95;
    }
    bot.maxHealth = MAX_HEALTH_MAX;
    bot.maxStunTimer = 0;
    bot.maxBoostTimer = 0;
    bot.maxBotLungeTimer = 0;
    resetCarMatchStats(bot);
    bots.push(bot);
  });
  maxMode.teamCars = [player, ...bots];
}

function getRiskRoleWeight(bot) {
  return (
    {
      goalie: 0.72,
      defender: 0.92,
      sweeper: 1,
      support: 1.04,
      wing: 1.08,
      playmaker: 1.14,
      striker: 1.18,
    }[bot.role] ?? 1
  );
}

function constrainMaxArenaCar(car, dt = 0.016) {
  const dims = getMaxArenaDimensions();
  const limitX = dims.halfWidth - 2;
  const limitZ = dims.halfLength - 2;
  if (car.position.x < -limitX || car.position.x > limitX) {
    const side = Math.sign(car.position.x) || 1;
    car.position.x = THREE.MathUtils.clamp(car.position.x, -limitX, limitX);
    car.velocity.x = -Math.abs(car.velocity.x) * side * 0.34;
    car.speed *= 0.95;
  }
  if (car.position.z < -limitZ || car.position.z > limitZ) {
    const side = Math.sign(car.position.z) || 1;
    car.position.z = THREE.MathUtils.clamp(car.position.z, -limitZ, limitZ);
    car.velocity.z = -Math.abs(car.velocity.z) * side * 0.34;
    car.speed *= 0.95;
  }
  car.position.y = Math.max(0, car.position.y);
  car.onWall = false;
  car.surfacePitch += (0 - car.surfacePitch) * Math.min(1, dt * 10);
  car.surfaceRoll += (0 - car.surfaceRoll) * Math.min(1, dt * 10);
  car.group.position.copy(car.position);
}

function getMaxBotTarget(bot) {
  const dims = getMaxArenaDimensions();
  const ball = maxMode.ball?.position ?? new THREE.Vector3();
  const ballVel = maxMode.ballVelocity ?? new THREE.Vector3();
  const homeGoalZ = bot.team === "blue" ? -dims.goalLineZ : dims.goalLineZ;
  const attackGoalZ = bot.team === "blue" ? dims.goalLineZ : -dims.goalLineZ;
  const attackDir = new THREE.Vector3(0, 0, attackGoalZ - ball.z).normalize();
  const futureBall = new THREE.Vector3(
    THREE.MathUtils.clamp(
      ball.x + ballVel.x * 0.42,
      -dims.halfWidth + 28,
      dims.halfWidth - 28,
    ),
    0,
    THREE.MathUtils.clamp(
      ball.z + ballVel.z * 0.42,
      -dims.halfLength + 34,
      dims.halfLength - 34,
    ),
  );
  const behindBall = futureBall.clone().addScaledVector(attackDir, -16);
  const sideBias =
    bot.role === "wing"
      ? bot.position.x >= 0
        ? 1
        : -1
      : bot.team === "blue"
        ? 1
        : -1;
  const ownHalfBias = bot.team === "blue" ? -1 : 1;
  const ownGoalFront = homeGoalZ + ownHalfBias * 24;

  if (bot.role === "goalie") {
    const isThreatening =
      bot.team === "blue" ? futureBall.z < -84 : futureBall.z > 84;
    if (isThreatening) {
      return new THREE.Vector3(
        THREE.MathUtils.clamp(
          futureBall.x * 0.72,
          -dims.goalWidth + 8,
          dims.goalWidth - 8,
        ),
        0,
        THREE.MathUtils.clamp(
          THREE.MathUtils.lerp(ownGoalFront, futureBall.z, 0.36),
          -dims.halfLength + 22,
          dims.halfLength - 22,
        ),
      );
    }
    return new THREE.Vector3(
      THREE.MathUtils.clamp(ball.x * 0.18, -18, 18),
      0,
      ownGoalFront,
    );
  }

  if (bot.role === "defender") {
    if (
      (bot.team === "blue" && futureBall.z < 40) ||
      (bot.team === "red" && futureBall.z > -40)
    ) {
      return new THREE.Vector3(
        futureBall.x * 0.48,
        0,
        THREE.MathUtils.clamp(
          THREE.MathUtils.lerp(
            homeGoalZ + ownHalfBias * 24,
            futureBall.z,
            0.46,
          ),
          -dims.halfLength + 36,
          dims.halfLength - 36,
        ),
      );
    }
    return new THREE.Vector3(
      bot.position.x * 0.2,
      0,
      homeGoalZ + ownHalfBias * 18,
    );
  }
  if (bot.role === "support") {
    return new THREE.Vector3(
      THREE.MathUtils.clamp(
        behindBall.x * 0.85,
        -dims.halfWidth + 40,
        dims.halfWidth - 40,
      ),
      0,
      THREE.MathUtils.lerp(behindBall.z, attackGoalZ * 0.22, 0.18),
    );
  }
  if (bot.role === "wing") {
    return new THREE.Vector3(
      THREE.MathUtils.clamp(
        futureBall.x + 46 * sideBias,
        -dims.halfWidth + 34,
        dims.halfWidth - 34,
      ),
      0,
      THREE.MathUtils.clamp(
        THREE.MathUtils.lerp(futureBall.z, attackGoalZ, 0.22),
        -dims.halfLength + 40,
        dims.halfLength - 40,
      ),
    );
  }
  return new THREE.Vector3(
    THREE.MathUtils.clamp(
      behindBall.x,
      -dims.halfWidth + 28,
      dims.halfWidth - 28,
    ),
    0,
    THREE.MathUtils.clamp(
      behindBall.z,
      -dims.halfLength + 28,
      dims.halfLength - 28,
    ),
  );
}

function getRiskBotTarget(bot) {
  const dims = getMaxArenaDimensions();
  const aiRules = getMaxAiRules();
  const ball = maxMode.ball?.position ?? new THREE.Vector3();
  const ballVel = maxMode.ballVelocity ?? new THREE.Vector3();
  const pressure =
    1 +
    (maxMode.riskMemory.playerTouches * 0.05 +
      maxMode.riskMemory.recentMisses * 0.06) *
      aiRules.pressureMult;
  const teamConceded =
    bot.team === "blue"
      ? maxMode.riskMemory.blueConceded
      : maxMode.riskMemory.redConceded;
  const opponentConceded =
    bot.team === "blue"
      ? maxMode.riskMemory.redConceded
      : maxMode.riskMemory.blueConceded;
  const attackGoalZ = bot.team === "blue" ? dims.goalLineZ : -dims.goalLineZ;
  const defendGoalZ = -attackGoalZ;
  const attackDir = new THREE.Vector3(0, 0, attackGoalZ - ball.z).normalize();
  const futureBall = new THREE.Vector3(
    THREE.MathUtils.clamp(
      ball.x + ballVel.x * (aiRules.reactionLead + opponentConceded * 0.04),
      -dims.halfWidth + 22,
      dims.halfWidth - 22,
    ),
    0,
    THREE.MathUtils.clamp(
      ball.z + ballVel.z * (aiRules.reactionLead + teamConceded * 0.06),
      -dims.halfLength + 22,
      dims.halfLength - 22,
    ),
  );
  const supportLane = futureBall
    .clone()
    .addScaledVector(attackDir, -12 - teamConceded * 4);
  const emergency =
    bot.team === "blue"
      ? futureBall.z < -aiRules.emergencyDropDepth
      : futureBall.z > aiRules.emergencyDropDepth;
  const sideBias = bot.position.x >= 0 ? 1 : -1;

  if (bot.role === "goalie") {
    return new THREE.Vector3(
      THREE.MathUtils.clamp(
        futureBall.x * 0.68,
        -dims.goalWidth + 6,
        dims.goalWidth - 6,
      ),
      0,
      THREE.MathUtils.lerp(
        defendGoalZ + (bot.team === "blue" ? 18 : -18),
        futureBall.z,
        emergency ? 0.38 : 0.22,
      ),
    );
  }
  if (bot.role === "defender" || bot.role === "sweeper") {
    const dropZ = defendGoalZ + (bot.team === "blue" ? 38 : -38);
    return new THREE.Vector3(
      THREE.MathUtils.clamp(
        futureBall.x * 0.62,
        -dims.halfWidth + 28,
        dims.halfWidth - 28,
      ),
      0,
      emergency
        ? THREE.MathUtils.lerp(dropZ, futureBall.z, 0.62)
        : THREE.MathUtils.lerp(
            dropZ,
            supportLane.z,
            0.28 + teamConceded * 0.06,
          ),
    );
  }
  if (bot.role === "playmaker") {
    return new THREE.Vector3(
      THREE.MathUtils.clamp(
        futureBall.x + sideBias * aiRules.supportSpacing,
        -dims.halfWidth + 24,
        dims.halfWidth - 24,
      ),
      0,
      THREE.MathUtils.clamp(
        THREE.MathUtils.lerp(
          supportLane.z,
          attackGoalZ * 0.2,
          0.32 + pressure * 0.04,
        ),
        -dims.halfLength + 24,
        dims.halfLength - 24,
      ),
    );
  }
  if (bot.role === "support" || bot.role === "wing") {
    return new THREE.Vector3(
      THREE.MathUtils.clamp(
        supportLane.x + sideBias * (bot.role === "wing" ? 34 : 18),
        -dims.halfWidth + 24,
        dims.halfWidth - 24,
      ),
      0,
      THREE.MathUtils.clamp(
        supportLane.z,
        -dims.halfLength + 24,
        dims.halfLength - 24,
      ),
    );
  }
  return new THREE.Vector3(
    THREE.MathUtils.clamp(
      futureBall.x + attackDir.x * 10,
      -dims.halfWidth + 18,
      dims.halfWidth - 18,
    ),
    0,
    THREE.MathUtils.clamp(
      futureBall.z + attackDir.z * (8 + pressure * 3),
      -dims.halfLength + 18,
      dims.halfLength - 18,
    ),
  );
}

function spawnBots() {
  clearBotState();
  if (isMaxMode()) {
    spawnMaxBots();
    return;
  }
  player.team = null;
  player.role = null;
  player.visualRoot.scale.setScalar(1);
  player.collisionRadius = CAR_RADIUS;
  if (settings.difficulty === "no_bots") return;
  const level = getLevel();
  const palette = getWorld().accents;
  const difficultyScale = {
    no_bots: 0,
    casual: 0.7,
    classic: 1,
    brutal: 1.25,
  }[settings.difficulty];
  const profile = getDifficultyProfile();
  const botCount = Math.max(2, Math.round(level.bots * difficultyScale));
  const spawnPoints = generateSpacedPolarPoints(
    botCount,
    94,
    HALF_WORLD - 84,
    72,
  );
  for (let i = 0; i < botCount; i += 1) {
    const bot = makeBot(palette[i % palette.length]);
    const point = spawnPoints[i] ?? {
      x: THREE.MathUtils.randFloatSpread(HALF_WORLD * 1.1),
      z: THREE.MathUtils.randFloatSpread(HALF_WORLD * 1.1),
    };
    const safeZ =
      Math.sign(point.z || 1) *
      Math.max(Math.abs(point.z), Math.abs(PLAYER_SPAWN_Z) + 34 + i * 6);
    bot.setPosition(
      point.x,
      0,
      THREE.MathUtils.clamp(safeZ, -HALF_WORLD + 46, HALF_WORLD - 46),
    );
    bot.maxSpeed = level.botSpeed * difficultyScale * profile.speedMultiplier;
    bot.accel = (18 + level.bots * difficultyScale) * profile.botSkill;
    bot.turnRate = 2.1 * profile.botSkill;
    bot.aiBurstCooldown = Math.random() * 1.2;
    bot.lastRampTime = 0;
    if (settings.id4Mode === "boss" && i === 0) {
      bot.role = "boss";
      bot.maxSpeed *= 1.12;
      bot.accel *= 1.16;
      bot.visualRoot.scale.setScalar(1.34);
      bot.collisionRadius = BOT_RADIUS * 1.34;
    }
    bots.push(bot);
  }
}

function spawnPowerups() {
  powerups.forEach((powerup) => scene.remove(powerup));
  powerups.splice(0, powerups.length);
  const types = ["boost", "shield", "life", "slow"];
  for (let i = 0; i < 6; i += 1) {
    const type = types[Math.floor(Math.random() * types.length)];
    const powerup = makePowerup(type);
    powerup.position.set(
      THREE.MathUtils.randFloatSpread(HALF_WORLD * 1.85),
      1.8,
      THREE.MathUtils.randFloatSpread(HALF_WORLD * 1.85),
    );
    powerups.push(powerup);
  }
}

function renderCustomizationOptions(selectEl, options, selectedId, progress) {
  if (!selectEl) return;
  selectEl.innerHTML = "";
  options.forEach((option) => {
    const optionEl = document.createElement("option");
    const unlocked = isOptionUnlocked(option, progress);
    optionEl.value = option.id;
    optionEl.textContent = unlocked
      ? option.name
      : `${option.name} — ${getUnlockLabel(option)}`;
    optionEl.disabled = !unlocked;
    optionEl.selected = option.id === selectedId;
    selectEl.appendChild(optionEl);
  });
}

function refreshCustomizationMenu() {
  const progress = getProgressSnapshot();
  clampCustomizationToUnlocks(progress);
  const activePaintId =
    isMaxMode() && player.team
      ? maxTeamCustomization[player.team].paintId
      : customization.paintId;
  const activeAccentId =
    isMaxMode() && player.team
      ? maxTeamCustomization[player.team].accentId
      : customization.accentId;
  const activeTintId =
    isMaxMode() && player.team
      ? maxTeamCustomization[player.team].tintId
      : customization.tintId;
  const activeGlowId =
    isMaxMode() && player.team
      ? maxTeamCustomization[player.team].glowId
      : customization.glowId;
  renderCustomizationOptions(
    bodySelect,
    BODY_OPTIONS,
    customization.bodyId,
    progress,
  );
  renderCustomizationOptions(
    wheelSelect,
    WHEEL_OPTIONS,
    customization.wheelId,
    progress,
  );
  renderCustomizationOptions(
    styleSelect,
    STYLE_OPTIONS,
    customization.styleId,
    progress,
  );
  renderCustomizationOptions(
    powerSelect,
    POWER_OPTIONS,
    customization.powerId,
    progress,
  );
  renderCustomizationOptions(
    paintSelect,
    PAINT_OPTIONS,
    activePaintId,
    progress,
  );
  renderCustomizationOptions(
    accentSelect,
    ACCENT_OPTIONS,
    activeAccentId,
    progress,
  );
  renderCustomizationOptions(tintSelect, TINT_OPTIONS, activeTintId, progress);
  renderCustomizationOptions(
    spoilerSelect,
    SPOILER_OPTIONS,
    customization.spoilerId,
    progress,
  );
  renderCustomizationOptions(glowSelect, GLOW_OPTIONS, activeGlowId, progress);
  if (!customStats) return;
  const loadout = getCurrentCustomization();
  const stats = state.playerLoadoutStats ?? computePlayerLoadoutStats();
  customStats.innerHTML = `
    <div class="custom-group">
      <div class="custom-group-title">Performance</div>
      <div class="custom-stat"><span class="label">Top Speed</span><strong>${Math.round(stats.topSpeed * SPEED_TO_MPH_MULT)} MPH</strong><span>${loadout.body.name} body with ${loadout.wheels.name} wheels</span></div>
      <div class="custom-stat"><span class="label">Acceleration</span><strong>${stats.accel.toFixed(1)}</strong><span>${loadout.style.description}</span></div>
      <div class="custom-stat"><span class="label">Grip / Drift</span><strong>${stats.normalGrip.toFixed(2)} / ${stats.driftSlip.toFixed(2)}</strong><span>${loadout.style.name} tuning</span></div>
    </div>
    <div class="custom-group">
      <div class="custom-group-title">Equipped Power</div>
      <div class="custom-stat"><span class="label">Power Core</span><strong>${loadout.power.name}</strong><span>${loadout.power.description}</span></div>
      <div class="custom-stat"><span class="label">Boost Output</span><strong>${stats.boostSpeedMult.toFixed(2)}x</strong><span>Pad chain ${stats.padSpeedMult.toFixed(2)}x for ${stats.padDuration.toFixed(1)}s</span></div>
      <div class="custom-stat"><span class="label">Recovery</span><strong>${stats.invincibleDuration.toFixed(2)}s</strong><span>Landing bonus ${stats.landingBoost.toFixed(2)}</span></div>
    </div>
    <div class="custom-group">
      <div class="custom-group-title">Appearance</div>
      <div class="custom-stat"><span class="label">Paint / Accent</span><strong>${stats.appearance.paintName} / ${stats.appearance.accentName}</strong><span>Window tint ${stats.appearance.tintName}</span></div>
      <div class="custom-stat"><span class="label">Rear Kit</span><strong>${stats.appearance.spoilerName}</strong><span>Underglow ${stats.appearance.glowName}</span></div>
      <div class="custom-stat"><span class="label">Build Focus</span><strong>${loadout.body.name}</strong><span>${loadout.style.name} handling with ${loadout.power.name}</span></div>
    </div>
  `;
  if (customHint) {
    const lockedCounts = [
      BODY_OPTIONS.filter((option) => !isOptionUnlocked(option, progress))
        .length,
      WHEEL_OPTIONS.filter((option) => !isOptionUnlocked(option, progress))
        .length,
      STYLE_OPTIONS.filter((option) => !isOptionUnlocked(option, progress))
        .length,
      POWER_OPTIONS.filter((option) => !isOptionUnlocked(option, progress))
        .length,
      PAINT_OPTIONS.filter((option) => !isOptionUnlocked(option, progress))
        .length,
      ACCENT_OPTIONS.filter((option) => !isOptionUnlocked(option, progress))
        .length,
      TINT_OPTIONS.filter((option) => !isOptionUnlocked(option, progress))
        .length,
      SPOILER_OPTIONS.filter((option) => !isOptionUnlocked(option, progress))
        .length,
      GLOW_OPTIONS.filter((option) => !isOptionUnlocked(option, progress))
        .length,
    ].reduce((sum, count) => sum + count, 0);
    customHint.textContent =
      lockedCounts > 0
        ? `${lockedCounts} loadout upgrades are still locked. Clear more worlds to unlock them.`
        : "All loadout parts unlocked. Mix bodies, wheels, handling, and powers freely.";
  }
}

function updatePowerups(dt) {
  powerups.forEach((powerup) => {
    powerup.userData.spin += dt * 1.4;
    powerup.rotation.y = powerup.userData.spin;
    powerup.position.y = 1.8 + Math.sin(powerup.userData.spin * 2) * 0.25;
  });
}

function consumePowerup(powerup) {
  const type = powerup.userData.type;
  if (type === "boost") {
    state.boost = 1;
    state.padSpeedTimer = Math.max(state.padSpeedTimer, 1.2);
    state.padSpeedMult = Math.max(state.padSpeedMult, 1.12);
    state.score += 200;
    setEffectToast("Boost Refilled");
    debugLog("powerups", "boost_applied");
  }
  if (type === "shield") {
    state.shield = Math.min(1, state.shield + 0.75);
    state.shieldTimer = 7.5;
    state.score += 150;
    setEffectToast("Shield Up");
    debugLog("powerups", "shield_applied");
  }
  if (type === "life") {
    const previousLives = state.lives;
    state.lives = Math.min(5, state.lives + 1);
    if (state.lives > previousLives) state.livesPulse = 1;
    state.score += 250;
    setEffectToast(state.lives > previousLives ? "Extra Life" : "Life Maxed");
    debugLog("powerups", "life_applied", { lives: state.lives });
  }
  if (type === "slow") {
    state.heat = Math.max(0, state.heat - 0.4);
    state.slowBotsTimer = Math.max(state.slowBotsTimer, 6);
    state.campaignRisk.recentHits = Math.max(
      0,
      state.campaignRisk.recentHits - 0.8,
    );
    state.campaignRisk.nearMisses = Math.max(
      0,
      state.campaignRisk.nearMisses - 0.8,
    );
    state.score += 120;
    setEffectToast("Bots Slowed");
    debugLog("powerups", "slow_applied");
  }

  powerup.position.set(
    THREE.MathUtils.randFloatSpread(HALF_WORLD * 1.85),
    1.8,
    THREE.MathUtils.randFloatSpread(HALF_WORLD * 1.85),
  );
  powerup.userData.type = ["boost", "shield", "life", "slow"][
    Math.floor(Math.random() * 4)
  ];
  powerup.material.color.setHex(
    {
      boost: 0x28d7ff,
      shield: 0x7bff9d,
      life: 0xff4d2d,
      slow: 0xffc457,
    }[powerup.userData.type],
  );
  powerup.material.emissive.setHex(powerup.material.color.getHex());
}

function emitDrivingFx(dt, steer, driftActive, boostActive) {
  const speedAbs = Math.abs(player.speed);
  if (player.position.y > 0.25 || speedAbs < 6) return;

  const heading = player.moveHeading;
  const forward = tempVector.set(Math.sin(heading), 0, Math.cos(heading));
  const right = tempVectorB.set(Math.cos(heading), 0, -Math.sin(heading));
  const rearCenter = tempVectorC
    .copy(player.position)
    .addScaledVector(forward, -1.35);

  if (driftActive && speedAbs > 10 && Math.abs(steer) > 0.18) {
    const intensity = THREE.MathUtils.clamp(speedAbs / 50, 0.25, 1);
    const jitter = (Math.random() - 0.5) * 0.35;
    const sideForce = Math.sign(steer || 1) * 2.5;
    const leftSpawn = rearCenter.clone().addScaledVector(right, -0.8 + jitter);
    const rightSpawn = rearCenter.clone().addScaledVector(right, 0.8 + jitter);
    const baseVel = forward.clone().multiplyScalar(-5 - speedAbs * 0.08);
    spawnFx(
      leftSpawn,
      baseVel.clone().addScaledVector(right, -sideForce),
      0x9de8ff,
      0.45 * intensity,
      0.34,
    );
    spawnFx(
      rightSpawn,
      baseVel.addScaledVector(right, sideForce),
      0x9de8ff,
      0.45 * intensity,
      0.34,
    );
  }

  if (boostActive && speedAbs > 8) {
    const flameSpawn = rearCenter.clone().addScaledVector(forward, -0.45);
    const boostVel = forward.clone().multiplyScalar(-14 - speedAbs * 0.2);
    boostVel.x += (Math.random() - 0.5) * 1.2;
    boostVel.z += (Math.random() - 0.5) * 1.2;
    boostVel.y += (Math.random() - 0.5) * 0.6;
    spawnFx(flameSpawn, boostVel, 0xff9f45, 0.62, 0.28);
    if (Math.random() < 0.45) {
      spawnFx(
        flameSpawn,
        boostVel.clone().multiplyScalar(0.75),
        0xffe09b,
        0.38,
        0.22,
      );
    }
  }
}

function applyAirborneSpeedRules(
  car,
  {
    boostActive = false,
    padMult = 1,
    topSpeed = car.maxSpeed,
    boostSpeedMult = 1,
  } = {},
) {
  const airborneTopSpeed = topSpeed + AIRBORNE_SPEED_BONUS;
  const boostCap = boostActive ? boostSpeedMult * AIRBORNE_BOOST_CAP_MULT : 1;
  const airborneTargetSpeed =
    (boostActive ? AIRBORNE_BOOST_MPH : AIRBORNE_CRUISE_MPH) /
    SPEED_TO_MPH_MULT;
  const speedCap = Math.max(
    airborneTopSpeed * boostCap * padMult,
    airborneTargetSpeed,
  );
  car.speed = THREE.MathUtils.clamp(car.speed, -14, speedCap);
  if (car.speed > 0) {
    car.speed = Math.max(car.speed, airborneTargetSpeed);
  }
}

function attemptBackflip() {
  if (player.backflipActive && player.backflipProgress < 0.5) return false;
  const canFlipNow =
    player.position.y > 0.05 || Math.abs(player.verticalVel) > 0.08;
  if (!canFlipNow) {
    state.backflipQueueTimer = state.devJumpComboTimer > 0 ? 0.75 : 0.35;
    setEffectToast("Backflip Primed");
    return false;
  }
  player.triggerBackflip();
  state.backflipQueueTimer = 0;
  state.backflipChainCount += 1;
  state.score += 30 * state.combo;
  setEffectToast("Backflip");
  for (let i = 0; i < 7; i += 1) {
    spawnFx(
      player.position
        .clone()
        .add(
          new THREE.Vector3(
            (Math.random() - 0.5) * 0.7,
            0.55 + Math.random() * 0.25,
            (Math.random() - 0.5) * 0.7,
          ),
        ),
      new THREE.Vector3(
        (Math.random() - 0.5) * 1.8,
        1.2 + Math.random() * 1.6,
        (Math.random() - 0.5) * 1.8,
      ),
      0xffc76b,
      0.6,
      0.24,
    );
  }
  return true;
}

function attemptDevJump() {
  if (isCarAirborne(player) || player.backflipActive) return false;
  player.verticalVel = 12.4;
  player.position.y = 0.24;
  state.devJumpComboTimer = 0.8;
  state.devJumpActive = true;
  state.devJumpCarrySpeed = player.speed;
  state.backflipChainCount = 0;
  state.backflipQueueTimer = 0;
  setEffectToast("Jump");
  for (let i = 0; i < 5; i += 1) {
    spawnFx(
      player.position
        .clone()
        .add(
          new THREE.Vector3(
            (Math.random() - 0.5) * 0.8,
            0.18,
            (Math.random() - 0.5) * 0.8,
          ),
        ),
      new THREE.Vector3(
        (Math.random() - 0.5) * 1.4,
        1.0 + Math.random() * 0.8,
        (Math.random() - 0.5) * 1.4,
      ),
      0x8bd8ff,
      0.5,
      0.18,
    );
  }
  return true;
}

function updatePlayer(dt) {
  const loadoutStats = state.playerLoadoutStats ?? computePlayerLoadoutStats();
  const deviceAssist = getDeviceAssistTuning();
  const worldRule = getCombinedWorldRule();
  state.ballLungeCooldown = Math.max(0, state.ballLungeCooldown - dt);
  state.botLungeCooldown = Math.max(0, state.botLungeCooldown - dt);
  if (updateDemolishedCar(player, dt)) {
    player.update(dt);
    return;
  }
  player.maxStunTimer = Math.max(0, (player.maxStunTimer ?? 0) - dt);
  player.maxBoostTimer = Math.max(0, (player.maxBoostTimer ?? 0) - dt);
  player.maxBotLungeTimer = Math.max(0, (player.maxBotLungeTimer ?? 0) - dt);
  if (isMaxMode() && player.maxStunTimer <= 0) {
    player.maxHealth = Math.min(
      MAX_HEALTH_MAX,
      (player.maxHealth ?? MAX_HEALTH_MAX) + MAX_HEALTH_REFILL_RATE * dt,
    );
  }
  if (isMaxMode() && player.maxStunTimer > 0) {
    player.speed = THREE.MathUtils.lerp(player.speed, 0, Math.min(1, dt * 7));
    player.velocity.multiplyScalar(0.9);
    updateVerticalPhysics(player, dt);
    player.update(dt);
    constrainMaxArenaCar(player, dt);
    emitDrivingFx(dt, 0, false, false);
    return;
  }
  if (input.touchEnabled) {
    input.touchSteer +=
      (input.touchSteerTarget - input.touchSteer) *
      Math.min(1, dt * 60 * deviceAssist.touchResponse);
  }
  const maxProfile = isMaxMode() ? getMaxDifficultyProfile() : null;
  const inputSteer = getSteer() * (settings.invertSteer ? -1 : 1);
  const steerFilterBase = maxProfile
    ? maxProfile.player.steerFilter
    : DRIVING_TUNING.grounded.steerFilter;
  const steerFilter = input.drift
    ? DRIVING_TUNING.grounded.driftSteerFilter
    : steerFilterBase;
  state.steerSmoothed += (inputSteer - state.steerSmoothed) * dt * steerFilter;
  const steer = state.steerSmoothed;
  const airborne = isCarAirborne(player);
  if (state.devJumpComboTimer > 0) {
    state.devJumpComboTimer = Math.max(0, state.devJumpComboTimer - dt);
  }
  if (state.backflipQueueTimer > 0) {
    state.backflipQueueTimer = Math.max(0, state.backflipQueueTimer - dt);
    if (
      !player.backflipActive &&
      (player.position.y > 0.05 || Math.abs(player.verticalVel) > 0.08)
    ) {
      attemptBackflip();
    }
  }
  if (input.backflip && airborne && !player.backflipActive) {
    attemptBackflip();
  } else if (
    input.backflip &&
    airborne &&
    player.backflipActive &&
    player.backflipProgress > 0.58
  ) {
    attemptBackflip();
  }
  const rawDrive = (input.throttle ? 1 : 0) - (input.brake ? 0.74 : 0);
  state.throttleSmoothed +=
    (rawDrive - state.throttleSmoothed) * Math.min(1, dt * 12);
  const throttle = Math.max(0, state.throttleSmoothed);
  const brake = Math.max(0, -state.throttleSmoothed);
  const drift = input.drift && !airborne;
  const boostActive = input.boost && state.boost > 0.05;
  player.maxBoostTimer = boostActive
    ? 0.2
    : Math.max(0, (player.maxBoostTimer ?? 0) - dt);
  player.maxBallLungeTimer = Math.max(0, (player.maxBallLungeTimer ?? 0) - dt);
  if (state.padSpeedTimer > 0) {
    state.padSpeedTimer = Math.max(0, state.padSpeedTimer - dt);
    if (state.padSpeedTimer === 0) state.padSpeedMult = 1;
  }
  const padMult = state.padSpeedTimer > 0 ? state.padSpeedMult : 1;

  const speedAbs = Math.abs(player.speed);
  const speedRatio = THREE.MathUtils.clamp(speedAbs / player.maxSpeed, 0, 1);
  const maxModeActive = isMaxMode();
  const modeSpeedMult = maxModeActive
    ? DRIVING_TUNING.maxMode.speedMult * maxProfile.player.speedMult
    : 1;
  const modeTurnMult = maxModeActive
    ? DRIVING_TUNING.maxMode.turnMult * maxProfile.player.turnMult
    : 1;
  const maxModeCap = maxModeActive ? DRIVING_TUNING.maxMode.capMult : 1;
  const throttleResponse = THREE.MathUtils.lerp(
    maxModeActive ? 1.12 : 1.18,
    maxModeActive ? 0.94 : 0.9,
    speedRatio,
  );
  const boostResponse = boostActive ? (maxModeActive ? 1.38 : 1.52) : 1;
  const accel =
    player.accel *
    modeSpeedMult *
    (maxModeActive ? maxProfile.player.accelMult : 1) *
    worldRule.boostMult *
    boostResponse *
    padMult;
  if (!airborne) {
    if (throttle) player.speed += accel * throttleResponse * dt;
    if (brake)
      player.speed -=
        accel *
        dt *
        DRIVING_TUNING.grounded.brakeMult *
        (0.9 + speedRatio * 0.25);

    if (!throttle && !brake) {
      const coastDrag =
        (maxModeActive
          ? DRIVING_TUNING.maxMode.coastDragBase +
            speedRatio * DRIVING_TUNING.maxMode.coastDragSpeedMult
          : DRIVING_TUNING.grounded.coastDragBase +
            speedRatio * DRIVING_TUNING.grounded.coastDragSpeedMult) *
        worldRule.coastDragMult;
      player.speed -= Math.sign(player.speed) * coastDrag * dt;
      if (maxModeActive && speedAbs < 22) {
        player.speed = THREE.MathUtils.lerp(
          player.speed,
          0,
          Math.min(1, dt * 6.8),
        );
      }
    }
  } else {
    const airControlAccel =
      accel *
      DRIVING_TUNING.airborne.accelMult *
      (boostActive ? DRIVING_TUNING.airborne.boostAccelMult : 1);
    if (state.devJumpActive) {
      player.speed = Math.max(player.speed, state.devJumpCarrySpeed);
      if (boostActive) {
        player.speed += airControlAccel * dt;
      } else if (throttle) {
        player.speed += airControlAccel * dt;
      } else if (brake) {
        player.speed -= airControlAccel * dt * (0.9 + speedRatio * 0.25);
      } else {
        player.speed -=
          Math.sign(player.speed) * DRIVING_TUNING.airborne.carryCoastMult * dt;
      }
    } else {
      if (throttle) player.speed += airControlAccel * dt;
      if (brake)
        player.speed -= airControlAccel * dt * (0.9 + speedRatio * 0.25);
    }
  }

  if (airborne && (!state.devJumpActive || boostActive)) {
    applyAirborneSpeedRules(player, {
      boostActive,
      padMult,
      topSpeed: player.maxSpeed,
      boostSpeedMult: loadoutStats.boostSpeedMult,
    });
  } else {
    const boostCap = boostActive
      ? loadoutStats.boostSpeedMult * worldRule.boostMult
      : 1;
    player.speed = THREE.MathUtils.clamp(
      player.speed,
      -14,
      player.maxSpeed * boostCap * padMult * maxModeCap,
    );
  }

  const steerInputDamp = maxModeActive ? 0.66 : 1;
  const maxSteer = steer * steerInputDamp;
  const turnAssist =
    (maxModeActive
      ? maxProfile.player.turnAssistBase
      : DRIVING_TUNING.grounded.turnAssistBase) +
    (1 - speedRatio) *
      (maxModeActive
        ? maxProfile.player.turnAssistLowSpeedBonus
        : DRIVING_TUNING.grounded.turnAssistLowSpeedBonus);
  const turnPower =
    player.turnRate *
    modeTurnMult *
    turnAssist *
    (drift
      ? maxModeActive
        ? DRIVING_TUNING.maxMode.driftTurnMult
        : DRIVING_TUNING.grounded.driftTurnMult
      : 1) *
    (airborne ? DRIVING_TUNING.airborne.steerMult : 1);
  const direction = player.speed >= 0 ? 1 : -1;
  const steerMultiplier = airborne ? loadoutStats.airTurnRate * 0.68 : 1;
  player.heading += maxSteer * turnPower * dt * direction * steerMultiplier;

  const grip = airborne
    ? 1.22
    : drift
      ? player.driftGrip * worldRule.gripMult
      : maxModeActive
        ? player.normalGrip * 1.12 * worldRule.gripMult
        : player.normalGrip * worldRule.gripMult;
  const slipAmount = airborne
    ? 0.055
    : drift
      ? loadoutStats.driftSlip * worldRule.driftSlipMult
      : maxModeActive
        ? loadoutStats.roadSlip *
          DRIVING_TUNING.maxMode.roadSlipMult *
          worldRule.driftSlipMult
        : loadoutStats.roadSlip * worldRule.driftSlipMult;
  player.moveHeading = THREE.MathUtils.lerp(
    player.moveHeading,
    player.heading,
    grip * dt * (maxModeActive ? maxProfile.player.moveHeadingLerp : 1),
  );

  const forward = new THREE.Vector3(
    Math.sin(player.moveHeading),
    0,
    Math.cos(player.moveHeading),
  );
  player.velocity.copy(forward).multiplyScalar(player.speed);
  const lateral = new THREE.Vector3(
    Math.cos(player.moveHeading),
    0,
    -Math.sin(player.moveHeading),
  );
  player.velocity.addScaledVector(
    lateral,
    maxSteer *
      speedAbs *
      slipAmount *
      0.08 *
      (deviceAssist.usesTouch ? DRIVING_TUNING.grounded.touchSlipMult : 1),
  );
  if (drift && speedAbs > 18 && !maxModeActive) {
    state.boost = Math.min(
      1,
      state.boost +
        dt *
          0.035 *
          THREE.MathUtils.clamp(
            Math.abs(maxSteer) + speedRatio * 0.4,
            0.4,
            1.4,
          ),
    );
  }

  if (settings.devMode && devTuning.infiniteBoost) {
    state.boost = 1;
  } else if (boostActive) {
    state.boost = Math.max(
      0,
      state.boost - dt * 0.18 * loadoutStats.boostDrainMult,
    );
  } else {
    state.boost = Math.min(1, state.boost + dt * 0.095);
  }

  if (state.shieldTimer > 0) {
    state.shieldTimer -= dt;
  }

  state.invincible = Math.max(0, state.invincible - dt);

  updateVerticalPhysics(player, dt);
  player.update(dt);
  if (isMaxMode()) constrainMaxArenaCar(player, dt);
  updateCombo(dt, maxSteer);
  emitDrivingFx(dt, maxSteer, drift, boostActive);

  if (boostActive) {
    state.score += dt * 6 * state.combo;
    state.cameraShake = Math.min(0.42, state.cameraShake + dt * 0.08);
  }
}

function updateVerticalPhysics(car, dt) {
  const speedAbs = Math.abs(car.speed);
  const maxModeActive = isMaxMode();
  const loadoutStats = !car.isBot
    ? (state.playerLoadoutStats ?? computePlayerLoadoutStats())
    : null;
  const deviceAssist = !car.isBot ? getDeviceAssistTuning() : null;
  const worldRule = getCombinedWorldRule();
  const substeps = THREE.MathUtils.clamp(
    Math.ceil(speedAbs / 17),
    PHYSICS_SUBSTEPS_BASE,
    PHYSICS_SUBSTEPS_MAX,
  );
  const stepDt = dt / substeps;

  for (let step = 0; step < substeps; step += 1) {
    car.verticalVel += GRAVITY * stepDt;
    car.position.y += car.verticalVel * stepDt;
    const floorHeight = maxModeActive
      ? getMaxSurfaceHeight(car.position.x, car.position.z)
      : 0;

    if (car.position.y <= floorHeight) {
      car.position.y = floorHeight;
      car.verticalVel = 0;
      if (!car.isBot && state.wasAirborne) {
        const bonus = Math.min(2.5, state.airTime);
        if (bonus > 0.2) {
          state.score += Math.round(120 * bonus);
          state.boost = Math.min(
            1,
            state.boost + bonus * (0.15 + (loadoutStats?.landingBoost ?? 0)),
          );
          state.cameraShake = Math.min(0.58, state.cameraShake + bonus * 0.06);
        }
        if (state.backflipChainCount > 0) {
          const landingBoost = 34 + (state.backflipChainCount - 1) * 14;
          player.speed = Math.min(
            player.maxSpeed * 1.52,
            player.speed + landingBoost,
          );
          state.boost = Math.min(
            1,
            state.boost + 0.34 + state.backflipChainCount * 0.06,
          );
          state.padSpeedTimer = Math.max(
            state.padSpeedTimer,
            2.2 + state.backflipChainCount * 0.28,
          );
          state.padSpeedMult = Math.max(
            state.padSpeedMult,
            1.42 + state.backflipChainCount * 0.06,
          );
          setEffectToast(
            state.backflipChainCount > 1
              ? `Flip x${state.backflipChainCount} Boost`
              : "Flip Boost",
          );
          for (let i = 0; i < 28; i += 1) {
            spawnFx(
              player.position
                .clone()
                .add(
                  new THREE.Vector3(
                    (Math.random() - 0.5) * 1.2,
                    0.16 + Math.random() * 0.14,
                    (Math.random() - 0.5) * 1.2,
                  ),
                ),
              new THREE.Vector3(
                (Math.random() - 0.5) * 5.1,
                3.1 + Math.random() * 2.2,
                (Math.random() - 0.5) * 5.1,
              ),
              Math.random() < 0.5 ? 0xffd37a : 0x9fe7ff,
              1.08,
              0.52,
            );
          }
        }
        state.airTime = 0;
        state.wasAirborne = false;
        state.devJumpActive = false;
        state.backflipChainCount = 0;
      }
    } else if (!car.isBot) {
      state.airTime += stepDt;
      state.wasAirborne = true;
    }

    if (maxModeActive) continue;

    const phase = (step + 1) / substeps;
    const nowX = THREE.MathUtils.lerp(
      car.prevPosition.x,
      car.position.x,
      phase,
    );
    const nowZ = THREE.MathUtils.lerp(
      car.prevPosition.z,
      car.position.z,
      phase,
    );
    const nextX = nowX + car.velocity.x * stepDt;
    const nextZ = nowZ + car.velocity.z * stepDt;
    const hitTimeReady = performance.now() - car.lastRampTime > 140;

    for (let i = 0; i < ramps.length; i += 1) {
      const ramp = ramps[i];
      const radius = ramp.userData.radius;
      const jumpLift = (ramp.userData.jumpLift ?? 4) * worldRule.rampKickMult;
      const speedKick =
        (ramp.userData.speedKick ?? 11) * worldRule.rampKickMult;
      const launchMult =
        ramp.userData.kind === "titan" ? (ramp.userData.launchMult ?? 1) : 1;
      const prevDistance = Math.hypot(
        car.prevPosition.x - ramp.position.x,
        car.prevPosition.z - ramp.position.z,
      );
      const currentDistance = Math.hypot(
        nowX - ramp.position.x,
        nowZ - ramp.position.z,
      );
      const nextDistance = Math.hypot(
        nextX - ramp.position.x,
        nextZ - ramp.position.z,
      );
      const sweptFromPrev = pointSegmentDistance2D(
        ramp.position.x,
        ramp.position.z,
        car.prevPosition.x,
        car.prevPosition.z,
        nowX,
        nowZ,
      );
      const sweptDistance = pointSegmentDistance2D(
        ramp.position.x,
        ramp.position.z,
        nowX,
        nowZ,
        nextX,
        nextZ,
      );
      const speedMargin = Math.min(
        RAMP_MAX_SPEED_MARGIN,
        speedAbs * RAMP_SPEED_MARGIN_MULT,
      );
      const triggerRadius = radius + RAMP_TRIGGER_THICKNESS + speedMargin;
      const closestDistance = Math.min(
        prevDistance,
        currentDistance,
        nextDistance,
        sweptFromPrev,
        sweptDistance,
      );
      const centerBoost =
        1 - THREE.MathUtils.clamp(closestDistance / triggerRadius, 0, 1);
      const groundedEnough =
        car.position.y <=
        RAMP_MAX_GROUNDED_Y_FOR_TRIGGER +
          (!car.isBot
            ? (loadoutStats?.rampStick ?? 0) +
              (deviceAssist?.rampForgiveness ?? 0)
            : 0);
      const radialX = ramp.position.x - nowX;
      const radialZ = ramp.position.z - nowZ;
      const radialLen = Math.hypot(radialX, radialZ) || 1;
      const prevRadialX = ramp.position.x - car.prevPosition.x;
      const prevRadialZ = ramp.position.z - car.prevPosition.z;
      const prevRadialLen = Math.hypot(prevRadialX, prevRadialZ) || 1;
      const velLen = Math.hypot(car.velocity.x, car.velocity.z) || 1;
      const inwardApproachDot =
        (car.velocity.x * (radialX / radialLen) +
          car.velocity.z * (radialZ / radialLen)) /
        velLen;
      const segVelX = nowX - car.prevPosition.x;
      const segVelZ = nowZ - car.prevPosition.z;
      const segVelLen = Math.hypot(segVelX, segVelZ) || 1;
      const inwardApproachDotPrev =
        (segVelX * (prevRadialX / prevRadialLen) +
          segVelZ * (prevRadialZ / prevRadialLen)) /
        segVelLen;
      const coreRadius = radius * RAMP_CORE_RADIUS_FACTOR;
      const coreHit =
        Math.min(currentDistance, nextDistance, sweptDistance) <= coreRadius;
      const nearMissRejected =
        RAMP_NEAR_MISS_FIX_ENABLED &&
        (centerBoost < RAMP_MIN_CENTER_BOOST ||
          inwardApproachDot < RAMP_MIN_INWARD_APPROACH_DOT ||
          inwardApproachDotPrev < RAMP_MIN_INWARD_APPROACH_DOT ||
          !coreHit);
      if (
        closestDistance < triggerRadius &&
        groundedEnough &&
        hitTimeReady &&
        speedAbs > 1.5 &&
        !nearMissRejected
      ) {
        car.verticalVel =
          (10 + speedAbs * 0.092 + centerBoost * jumpLift) *
          RAMP_LAUNCH_VERTICAL_MULT *
          launchMult;
        const currentSign = Math.sign(car.speed || 1);
        car.speed =
          Math.min(car.maxSpeed * 1.45, speedAbs + speedKick) * currentSign;
        car.lastRampTime = performance.now();
        debugLog("ramps", "ramp contact", {
          carIsBot: car.isBot,
          rampKind: ramp.userData.kind,
          closestDistance,
          speedAbs,
          centerBoost,
          inwardApproachDot,
          inwardApproachDotPrev,
        });
        if (!car.isBot) {
          spawnFx(
            car.position.clone().add(new THREE.Vector3(0, 0.4, 0)),
            new THREE.Vector3(
              (Math.random() - 0.5) * 2.5,
              2.4,
              (Math.random() - 0.5) * 2.5,
            ),
            ramp.userData.kind === "titan" ? 0xffc46e : 0xff9c66,
            ramp.userData.kind === "titan" ? 0.75 : 0.52,
            0.28,
          );
        }
        if (!car.isBot)
          state.score += Math.round(80 + centerBoost * (80 + jumpLift * 9));
        break;
      } else if (
        RAMP_NEAR_MISS_FIX_ENABLED &&
        closestDistance < triggerRadius &&
        groundedEnough &&
        speedAbs > 1.5
      ) {
        const reason =
          centerBoost < RAMP_MIN_CENTER_BOOST
            ? "edge_graze"
            : inwardApproachDot < RAMP_MIN_INWARD_APPROACH_DOT ||
                inwardApproachDotPrev < RAMP_MIN_INWARD_APPROACH_DOT
              ? "tangent_pass"
              : "high_speed_near_miss";
        debugLog("ramps", "ramp near_miss rejected", {
          reason,
          rampKind: ramp.userData.kind,
          centerBoost,
          inwardApproachDot,
          inwardApproachDotPrev,
          coreHit,
          closestDistance,
          triggerRadius,
        });
      }
    }
  }
}

function isValidBotHit(playerCar, botCar, segmentDistance) {
  const horizontalTouch = segmentDistance < BOT_HIT_RADIUS;
  const verticalTouch =
    Math.abs(playerCar.position.y - botCar.position.y) <
    BOT_VERTICAL_HIT_TOLERANCE + BOT_COLLISION_HEIGHT;
  return {
    valid: horizontalTouch && verticalTouch,
    horizontalTouch,
    verticalTouch,
  };
}

function getCarReplayId(car) {
  if (car === player) return "player";
  return `bot-${car.botId}`;
}

function serializeCarSnapshot(car) {
  return {
    id: getCarReplayId(car),
    x: Number(car.position.x.toFixed(2)),
    y: Number(car.position.y.toFixed(2)),
    z: Number(car.position.z.toFixed(2)),
    heading: Number(car.heading.toFixed(3)),
    speed: Number(car.speed.toFixed(2)),
    demolished: Boolean(car.demolished),
  };
}

function captureMaxReplayFrame() {
  if (!isMaxMode() || !maxMode.ball) return;
  maxMode.replayBuffer.push({
    ball: {
      x: Number(maxMode.ball.position.x.toFixed(2)),
      y: Number(maxMode.ball.position.y.toFixed(2)),
      z: Number(maxMode.ball.position.z.toFixed(2)),
    },
    ballVelocity: {
      x: Number(maxMode.ballVelocity.x.toFixed(2)),
      y: Number(maxMode.ballVelocity.y.toFixed(2)),
      z: Number(maxMode.ballVelocity.z.toFixed(2)),
    },
    player: serializeCarSnapshot(player),
    score: { blue: maxMode.blueScore, red: maxMode.redScore },
  });
  if (maxMode.replayBuffer.length > MAX_REPLAY_RULES.maxFrames) {
    maxMode.replayBuffer.shift();
  }
}

function applyReplayFrame(frame) {
  if (!frame || !maxMode.ball) return;
  player.setDemolished(frame.player.demolished);
  player.setPosition(frame.player.x, frame.player.y, frame.player.z);
  player.heading = frame.player.heading;
  player.moveHeading = frame.player.heading;
  player.speed = frame.player.speed;
  bots.forEach((bot) => {
    bot.group.visible = false;
    bot.healthBarGroup.visible = false;
  });
  maxMode.ball.position.set(frame.ball.x, frame.ball.y, frame.ball.z);
}

function lerpReplayFrame(a, b, t) {
  if (!a) return b;
  if (!b) return a;
  const mix = THREE.MathUtils.clamp(t, 0, 1);
  return {
    player: {
      x: THREE.MathUtils.lerp(a.player.x, b.player.x, mix),
      y: THREE.MathUtils.lerp(a.player.y, b.player.y, mix),
      z: THREE.MathUtils.lerp(a.player.z, b.player.z, mix),
      heading: THREE.MathUtils.lerp(a.player.heading, b.player.heading, mix),
      speed: THREE.MathUtils.lerp(a.player.speed, b.player.speed, mix),
      demolished: mix < 0.5 ? a.player.demolished : b.player.demolished,
    },
    ball: {
      x: THREE.MathUtils.lerp(a.ball.x, b.ball.x, mix),
      y: THREE.MathUtils.lerp(a.ball.y, b.ball.y, mix),
      z: THREE.MathUtils.lerp(a.ball.z, b.ball.z, mix),
    },
  };
}

function startGoalReplay(frames, meta) {
  if (!devTuning.allowReplay || !frames?.length) return false;
  maxMode.replayActive = true;
  maxMode.replayFrames = frames.map((frame) => structuredClone(frame));
  maxMode.replayFrameIndex = 0;
  maxMode.replayFrameTimer = 0;
  maxMode.replayMeta = meta;
  addMatchEvent("replay", { meta });
  return true;
}

function finishGoalReplay() {
  maxMode.replayActive = false;
  maxMode.replayFrames = [];
  maxMode.replayFrameIndex = 0;
  maxMode.replayFrameTimer = 0;
  maxMode.replayMeta = "";
  bots.forEach((bot) => {
    bot.group.visible = !bot.demolished;
    bot.healthBarGroup.visible = false;
  });
  if (!maxMode.pendingKickoff) return;
  const { winner } = maxMode.pendingKickoff;
  resetMaxKickoffPositions();
  if (winner) {
    showMessage(
      winner,
      "Press Enter to run another match.",
      "Replay",
      "restart-current",
    );
  }
  maxMode.pendingKickoff = null;
}

function updateGoalReplay(dt) {
  if (!maxMode.replayActive || maxMode.replayFrames.length === 0) return false;
  maxMode.replayFrameTimer += dt;
  const frameDuration = 1 / MAX_REPLAY_RULES.playbackFps;
  while (maxMode.replayFrameTimer >= frameDuration) {
    maxMode.replayFrameTimer -= frameDuration;
    maxMode.replayFrameIndex += 1;
    if (maxMode.replayFrameIndex >= maxMode.replayFrames.length) {
      finishGoalReplay();
      return true;
    }
  }
  const currentFrame =
    maxMode.replayFrames[
      Math.min(maxMode.replayFrameIndex, maxMode.replayFrames.length - 1)
    ];
  const nextFrame =
    maxMode.replayFrames[
      Math.min(maxMode.replayFrameIndex + 1, maxMode.replayFrames.length - 1)
    ];
  applyReplayFrame(
    lerpReplayFrame(
      currentFrame,
      nextFrame,
      maxMode.replayFrameTimer / frameDuration,
    ),
  );
  return true;
}

function markShotForTouch(car) {
  if (!car?.team || !maxMode.stats) return;
  car.matchStats.shots += 1;
  maxMode.stats.teams[car.team].shots += 1;
  car.lastShotAt = state.elapsed;
  addMatchEvent("shot", { team: car.team, by: getCarLabel(car) });
}

function markSaveForTouch(car) {
  if (!car?.team || !maxMode.stats) return;
  car.matchStats.saves += 1;
  maxMode.stats.teams[car.team].saves += 1;
  addMatchEvent("save", { team: car.team, by: getCarLabel(car) });
}

function recordMaxBallTouch(car, preVelocity, postVelocity) {
  if (!car?.team || car.demolished) return;
  const dims = getMaxArenaDimensions();
  const now = state.elapsed;
  car.lastTouchAt = now;
  car.lastTouchType = "touch";
  if (isRiskMode()) {
    if (car === player) {
      maxMode.riskMemory.playerTouches = Math.min(
        8,
        maxMode.riskMemory.playerTouches + 1,
      );
    } else {
      maxMode.riskMemory.recentMisses = Math.max(
        0,
        maxMode.riskMemory.recentMisses - 1,
      );
    }
  }
  const attackDirection = car.team === "blue" ? 1 : -1;
  if (
    preVelocity.z * attackDirection > 10 &&
    postVelocity.z * attackDirection > preVelocity.z * attackDirection + 1
  ) {
    markShotForTouch(car);
  }
  const defendingGoalSide = car.team === "blue" ? -1 : 1;
  const nearOwnGoal =
    defendingGoalSide * maxMode.ball.position.z > dims.goalLineZ - 88 &&
    Math.abs(maxMode.ball.position.x) < dims.goalWidth + 18;
  const wasThreatening = preVelocity.z * defendingGoalSide > 9;
  const cleared = postVelocity.z * defendingGoalSide < 1;
  if (nearOwnGoal && wasThreatening && cleared) {
    markSaveForTouch(car);
  }
  maxMode.touchChain.push({
    team: car.team,
    label: getCarLabel(car),
    botId: car.botId ?? null,
    at: now,
  });
  maxMode.touchChain = maxMode.touchChain.filter(
    (touch) => now - touch.at <= 6,
  );
}

function applyGoalwardBallBias(car, hitForce, biasMode = "drive") {
  if (!maxMode.ballVelocity || !car?.team) return;
  const dims = getMaxArenaDimensions();
  const ballTuning = getMaxBallTuning();
  const targetGoalZ = car.team === "blue" ? dims.goalLineZ : -dims.goalLineZ;
  const targetVec = new THREE.Vector3(
    -maxMode.ball.position.x * 0.18,
    0,
    targetGoalZ - maxMode.ball.position.z,
  );
  if (targetVec.lengthSq() < 0.001) return;
  targetVec.normalize();
  const biasStrength =
    (biasMode === "lunge" ? ballTuning.lungeAimBase : ballTuning.driveAimBase) +
    hitForce *
      (biasMode === "lunge"
        ? ballTuning.lungeAimSpeedMult
        : ballTuning.driveAimSpeedMult);
  maxMode.ballVelocity.x *= ballTuning.lateralDampen;
  maxMode.ballVelocity.y *= ballTuning.verticalDampen;
  maxMode.ballVelocity.addScaledVector(targetVec, biasStrength);
}

function getGoalAttribution(team) {
  const chain = [...maxMode.touchChain].filter(
    (touch) => state.elapsed - touch.at <= 6,
  );
  const scorer =
    [...chain].reverse().find((touch) => touch.team === team) ?? null;
  const assist = scorer
    ? [...chain]
        .reverse()
        .find(
          (touch) =>
            touch.team === team &&
            touch.label !== scorer.label &&
            scorer.at - touch.at <= 5,
        )
    : null;
  return { scorer, assist };
}

function resetMaxKickoffPositions() {
  const ballTuning = getMaxBallTuning();
  const blueSpawns = getTeamSpawnSlots("blue");
  const redSpawns = getTeamSpawnSlots("red");
  player.setDemolished(false);
  player.setPosition(
    blueSpawns[0][0],
    getMaxSurfaceHeight(...blueSpawns[0]),
    blueSpawns[0][1],
  );
  player.heading = 0;
  player.moveHeading = 0;
  player.speed = 0;
  player.verticalVel = 0;
  player.maxHealth = MAX_HEALTH_MAX;
  player.maxStunTimer = 0;
  player.maxBoostTimer = 0;
  player.maxBotLungeTimer = 0;
  player.respawnTimer = 0;
  bots.forEach((bot, index) => {
    const list = bot.team === "blue" ? blueSpawns : redSpawns;
    const teamIndex =
      bots.filter(
        (candidate, candidateIndex) =>
          candidate.team === bot.team && candidateIndex <= index,
      ).length - 1;
    const slot = Math.min(teamIndex, list.length - 1);
    const [x, z] = list[slot] ?? list[list.length - 1];
    bot.setDemolished(false);
    bot.setPosition(x, getMaxSurfaceHeight(x, z), z);
    bot.speed = 0;
    bot.velocity.set(0, 0, 0);
    bot.verticalVel = 0;
    bot.heading = bot.team === "blue" ? 0 : Math.PI;
    bot.moveHeading = bot.heading;
    bot.maxHealth = MAX_HEALTH_MAX;
    bot.maxStunTimer = 0;
    bot.maxBoostTimer = 0;
    bot.maxBotLungeTimer = 0;
  });
  if (maxMode.ball) {
    maxMode.ball.position.set(0, MAX_BALL_RADIUS, 0);
    maxMode.ballVelocity.set(ballTuning.kickoffSpeed, 0, 0);
  }
  state.boost = 1;
  player.velocity.set(0, 0, 0);
  maxMode.touchChain = [];
}

function scoreMaxGoal(team) {
  const dims = getMaxArenaDimensions();
  const { scorer, assist } = getGoalAttribution(team);
  if (team === "blue") maxMode.blueScore += 1;
  else maxMode.redScore += 1;
  maxMode.lastScoredTeam = team;
  maxMode.goalFlashTimer = 1.6;
  state.effectToast = team === "blue" ? "Blue Scores" : "Red Scores";
  state.effectToastTimer = 1.8;
  if (!maxMode.stats) maxMode.stats = createEmptyMatchStats();
  maxMode.stats.teams[team].goals += 1;
  if (scorer) {
    const scorerCar = [player, ...bots].find(
      (car) => getCarLabel(car) === scorer.label,
    );
    if (scorerCar) scorerCar.matchStats.goals += 1;
  }
  if (assist) {
    const assistCar = [player, ...bots].find(
      (car) => getCarLabel(car) === assist.label,
    );
    if (assistCar) assistCar.matchStats.assists += 1;
  }
  const replayFrames = maxMode.replayBuffer.slice(
    -Math.min(maxMode.replayBuffer.length, 26),
  );
  const meta = `${team === "blue" ? "Blue" : "Red"} goal${scorer ? ` by ${scorer.label}` : ""}${assist ? `, assist ${assist.label}` : ""}`;
  maxMode.stats.lastGoal = { team, scorer, assist, replayFrames, meta };
  if (isRiskMode()) {
    if (team === "blue") {
      maxMode.riskMemory.redConceded += 1;
      maxMode.riskMemory.playerTouches = 0;
    } else {
      maxMode.riskMemory.blueConceded += 1;
      maxMode.riskMemory.recentMisses = Math.min(
        8,
        maxMode.riskMemory.recentMisses + 2,
      );
    }
  }
  addMatchEvent("goal", {
    team,
    scorer: scorer?.label ?? null,
    assist: assist?.label ?? null,
  });
  for (let i = 0; i < 34; i += 1) {
    spawnFx(
      new THREE.Vector3(
        0,
        1.4 + Math.random() * 2.4,
        team === "blue" ? dims.goalLineZ - 8 : -dims.goalLineZ + 8,
      ),
      new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        2.8 + Math.random() * 2.8,
        team === "blue" ? -3 - Math.random() * 3 : 3 + Math.random() * 3,
      ),
      team === "blue" ? 0x7feaff : 0xff8f76,
      0.9,
      0.48,
    );
  }
  const winner =
    maxMode.blueScore >= MAX_MODE_GOAL_TARGET ||
    maxMode.redScore >= MAX_MODE_GOAL_TARGET
      ? maxMode.blueScore > maxMode.redScore
        ? "Blue Team Wins"
        : "Red Team Wins"
      : null;
  maxMode.pendingKickoff = { winner };
  if (!startGoalReplay(replayFrames, meta)) {
    finishGoalReplay();
  }
}

function didBallEnterGoalFromFront(team) {
  if (!maxMode.ball) return false;
  const dims = getMaxArenaDimensions();
  const frontPlane =
    team === "blue"
      ? dims.goalLineZ + MAX_GOAL_RULES.frontPlaneOffset
      : -dims.goalLineZ - MAX_GOAL_RULES.frontPlaneOffset;
  const backPlane =
    team === "blue"
      ? dims.goalLineZ + dims.goalDepth + MAX_GOAL_RULES.backPlanePadding
      : -dims.goalLineZ - dims.goalDepth - MAX_GOAL_RULES.backPlanePadding;
  const prevZ = maxMode.ballPrevPosition.z;
  const currentZ = maxMode.ball.position.z;
  const crossedFront =
    team === "blue"
      ? prevZ <= frontPlane && currentZ > frontPlane
      : prevZ >= frontPlane && currentZ < frontPlane;
  const insideDepth =
    team === "blue" ? currentZ < backPlane : currentZ > backPlane;
  const insideGoalX =
    Math.abs(maxMode.ball.position.x) <=
    dims.goalWidth - MAX_GOAL_RULES.mouthWidthPadding;
  const insideGoalY =
    maxMode.ball.position.y <=
    dims.goalHeight - MAX_GOAL_RULES.mouthHeightPadding;
  return crossedFront && insideDepth && insideGoalX && insideGoalY;
}

function updateMaxBall(dt) {
  if (!maxMode.ball) return;
  const dims = getMaxArenaDimensions();
  const ballTuning = getMaxBallTuning();
  maxMode.ballPrevPosition.copy(maxMode.ball.position);
  maxMode.goalFlashTimer = Math.max(0, maxMode.goalFlashTimer - dt);
  maxMode.ballVelocity.y += GRAVITY * 0.68 * dt;
  maxMode.ball.position.addScaledVector(maxMode.ballVelocity, dt);
  const floorHeight =
    getMaxSurfaceHeight(maxMode.ball.position.x, maxMode.ball.position.z) +
    MAX_BALL_RADIUS;
  const grounded = maxMode.ball.position.y <= floorHeight + 0.05;
  maxMode.ballVelocity.multiplyScalar(
    grounded ? ballTuning.dragGrounded : ballTuning.dragAirborne,
  );
  if (maxMode.ball.position.y < floorHeight) {
    maxMode.ball.position.y = floorHeight;
    if (Math.abs(maxMode.ballVelocity.y) > 1.4) {
      maxMode.ballVelocity.y =
        Math.abs(maxMode.ballVelocity.y) * ballTuning.bounceY;
    } else {
      maxMode.ballVelocity.y = 0;
    }
    maxMode.ballVelocity.x *= ballTuning.groundRetention;
    maxMode.ballVelocity.z *= ballTuning.groundRetention;
  }
  if (didBallEnterGoalFromFront("blue")) {
    scoreMaxGoal("blue");
    return;
  }
  if (didBallEnterGoalFromFront("red")) {
    scoreMaxGoal("red");
    return;
  }
  const limitX = dims.halfWidth - MAX_BALL_RADIUS;
  const limitZ = dims.halfLength - MAX_BALL_RADIUS;
  if (Math.abs(maxMode.ball.position.x) > limitX) {
    const side = Math.sign(maxMode.ball.position.x) || 1;
    maxMode.ball.position.x = side * limitX;
    maxMode.ballVelocity.x *= -ballTuning.wallBounce;
  }
  const inGoalLane = Math.abs(maxMode.ball.position.x) <= dims.goalWidth;
  if (!inGoalLane && Math.abs(maxMode.ball.position.z) > limitZ) {
    const side = Math.sign(maxMode.ball.position.z) || 1;
    maxMode.ball.position.z = side * limitZ;
    maxMode.ballVelocity.z *= -ballTuning.wallBounce;
  }
}

function applyMaxDamage(target, amount, sourceTeam = "neutral") {
  if (!amount || amount <= 0) return;
  target.maxHealth = THREE.MathUtils.clamp(
    (target.maxHealth ?? MAX_HEALTH_MAX) - amount,
    0,
    MAX_HEALTH_MAX,
  );
  if (target.maxHealth <= 0 && (target.maxStunTimer ?? 0) <= 0) {
    target.maxHealth = 0;
    target.maxStunTimer = MAX_STUN_DURATION;
    target.speed *= 0.28;
    target.velocity.multiplyScalar(0.24);
    if (target === player) {
      setEffectToast("Stunned");
    } else if (sourceTeam === "blue") {
      setEffectToast("Bot Stunned");
    }
    for (let i = 0; i < 18; i += 1) {
      spawnFx(
        target.position
          .clone()
          .add(
            new THREE.Vector3(
              (Math.random() - 0.5) * 1.2,
              0.6 + Math.random() * 0.4,
              (Math.random() - 0.5) * 1.2,
            ),
          ),
        new THREE.Vector3(
          (Math.random() - 0.5) * 3,
          2 + Math.random() * 1.4,
          (Math.random() - 0.5) * 3,
        ),
        sourceTeam === "red" ? 0xff8a7a : 0x8fdfff,
        0.72,
        0.32,
      );
    }
  }
}

function shouldTriggerDemolition(a, b, nx, nz) {
  if (!devTuning.allowDemolitions) return false;
  if (!a.team || !b.team || a.team === b.team) return false;
  const relativeSpeed =
    Math.abs(a.speed - b.speed) + a.velocity.distanceTo(b.velocity);
  const approachA =
    a.velocity.lengthSq() > 0.1
      ? a.velocity
          .clone()
          .normalize()
          .dot(new THREE.Vector3(nx, 0, nz))
      : 0;
  const approachB =
    b.velocity.lengthSq() > 0.1
      ? b.velocity
          .clone()
          .normalize()
          .dot(new THREE.Vector3(-nx, 0, -nz))
      : 0;
  return (
    relativeSpeed >= MAX_DEMOLITION_RULES.relativeSpeedThreshold &&
    (approachA > MAX_DEMOLITION_RULES.approachDotThreshold ||
      approachB > MAX_DEMOLITION_RULES.approachDotThreshold)
  );
}

function getRespawnSlotForCar(car) {
  const team = car.team ?? "blue";
  const slots = getTeamSpawnSlots(team);
  if (car === player) return slots[0];
  const teamBots = bots.filter((candidate) => candidate.team === team);
  const slot = Math.min(teamBots.indexOf(car) + 1, slots.length - 1);
  return slots[slot] ?? slots[0];
}

function demolishCar(target, attacker, cause = "impact") {
  if (!target || target.demolished) return false;
  target.setDemolished(true);
  target.respawnTimer = MAX_DEMOLITION_RULES.respawnDelay;
  target.respawnPoint = getRespawnSlotForCar(target);
  const team = attacker?.team ?? "blue";
  if (attacker?.matchStats) attacker.matchStats.demolitions += 1;
  if (maxMode.stats?.teams[team]) maxMode.stats.teams[team].demolitions += 1;
  addMatchEvent("demo", {
    by: attacker ? getCarLabel(attacker) : "Arena",
    target: getCarLabel(target),
    cause,
  });
  if (target === player) setEffectToast("Demolished");
  else setEffectToast("Demolition");
  for (let i = 0; i < MAX_DEMOLITION_RULES.explosionBurstCount; i += 1) {
    spawnFx(
      target.position
        .clone()
        .add(
          new THREE.Vector3(
            (Math.random() - 0.5) * 1.3,
            0.4 + Math.random() * 0.8,
            (Math.random() - 0.5) * 1.3,
          ),
        ),
      new THREE.Vector3(
        (Math.random() - 0.5) * 6.2,
        2 + Math.random() * 2.4,
        (Math.random() - 0.5) * 6.2,
      ),
      Math.random() < 0.5 ? 0xffb877 : 0xff684d,
      0.9,
      0.42,
    );
  }
  return true;
}

function updateDemolishedCar(car, dt) {
  if (!car.demolished) return false;
  car.respawnTimer = Math.max(0, car.respawnTimer - dt);
  if (car.respawnTimer > 0) return true;
  const [x, z] = car.respawnPoint ?? getRespawnSlotForCar(car);
  car.setDemolished(false);
  car.setPosition(x, getMaxSurfaceHeight(x, z), z);
  car.heading = car.team === "red" ? Math.PI : 0;
  car.moveHeading = car.heading;
  car.maxHealth = MAX_HEALTH_MAX;
  car.maxBoostTimer = 0;
  car.maxBotLungeTimer = 0;
  car.maxStunTimer = 0;
  return true;
}

function resolveMaxBumps() {
  const ballTuning = getMaxBallTuning();
  const cars = [player, ...bots].filter((car) => !car.demolished);
  for (let i = 0; i < cars.length; i += 1) {
    for (let j = i + 1; j < cars.length; j += 1) {
      const a = cars[i];
      const b = cars[j];
      const dx = b.position.x - a.position.x;
      const dz = b.position.z - a.position.z;
      const dist = Math.hypot(dx, dz) || 0.001;
      const minDist = (getCollisionRadius(a) + getCollisionRadius(b)) * 1.05;
      if (dist >= minDist) continue;
      const nx = dx / dist;
      const nz = dz / dist;
      const overlap = minDist - dist;
      a.position.x -= nx * overlap * 0.5;
      a.position.z -= nz * overlap * 0.5;
      b.position.x += nx * overlap * 0.5;
      b.position.z += nz * overlap * 0.5;
      const aBoost =
        a === player
          ? input.boost && state.boost > 0.05
          : (a.maxBoostTimer ?? 0) > 0.08;
      const bBoost =
        b === player
          ? input.boost && state.boost > 0.05
          : (b.maxBoostTimer ?? 0) > 0.08;
      const bumpForce = 4.4 + (aBoost || bBoost ? 2.2 : 0);
      a.speed -= MAX_CAR_BUMP_FORCE * 0.12;
      b.speed += MAX_CAR_BUMP_FORCE * 0.12;
      a.velocity.add(new THREE.Vector3(-nx, 0, -nz).multiplyScalar(bumpForce));
      b.velocity.add(new THREE.Vector3(nx, 0, nz).multiplyScalar(bumpForce));
      const opposingTeams = a.team && b.team && a.team !== b.team;
      const aLunge =
        a === player
          ? state.botLungeCooldown > MAX_BOT_LUNGE_COOLDOWN - 0.22
          : (a.maxBotLungeTimer ?? 0) > 0.05;
      const bLunge =
        b === player
          ? state.botLungeCooldown > MAX_BOT_LUNGE_COOLDOWN - 0.22
          : (b.maxBotLungeTimer ?? 0) > 0.05;
      if (opposingTeams) {
        const demoTriggered = shouldTriggerDemolition(a, b, nx, nz);
        if (demoTriggered) {
          if (Math.abs(a.speed) >= Math.abs(b.speed)) demolishCar(b, a);
          else demolishCar(a, b);
        } else {
          if (aBoost || aLunge)
            applyMaxDamage(b, aLunge ? 42 : 28, a.team ?? "blue");
          else applyMaxDamage(b, 10, a.team ?? "blue");
          if (bBoost || bLunge)
            applyMaxDamage(a, bLunge ? 42 : 28, b.team ?? "red");
          else applyMaxDamage(a, 10, b.team ?? "red");
        }
      }
      spawnFx(
        a.position.clone().add(new THREE.Vector3(0, 0.45, 0)),
        new THREE.Vector3(-nx * 2, 1.4, -nz * 2),
        0xffc476,
        0.42,
        0.22,
      );
      spawnFx(
        b.position.clone().add(new THREE.Vector3(0, 0.45, 0)),
        new THREE.Vector3(nx * 2, 1.4, nz * 2),
        0x9fe7ff,
        0.42,
        0.22,
      );
      constrainMaxArenaCar(a, 0.016);
      constrainMaxArenaCar(b, 0.016);
    }
  }

  cars.forEach((car) => {
    if (!maxMode.ball) return;
    const dx = maxMode.ball.position.x - car.position.x;
    const dz = maxMode.ball.position.z - car.position.z;
    const dy = maxMode.ball.position.y - car.position.y;
    const dist = Math.hypot(dx, dz, dy) || 0.001;
    const minDist = MAX_BALL_RADIUS + getCollisionRadius(car) + 3.4;
    if (dist >= minDist) return;
    const nx = dx / dist;
    const ny = dy / dist;
    const nz = dz / dist;
    const boostVariant = getActiveMaxBoostVariant();
    const boostHit =
      car === player
        ? input.boost
          ? ballTuning.boostImpulseBonus
          : 0
        : (car.maxBoostTimer ?? 0) > 0.08
          ? ballTuning.boostImpulseBonus
          : 0;
    const hitForce = Math.max(
      ballTuning.minHitForce,
      (ballTuning.carImpulseBase +
        Math.abs(car.speed) * ballTuning.carImpulseSpeedMult +
        boostHit) *
        boostVariant.ballImpulseMult,
    );
    const lungeShot =
      car === player
        ? (player.maxBallLungeTimer ?? 0) > 0.02
        : (car.maxBallLungeTimer ?? 0) > 0.02;
    const preVelocity = maxMode.ballVelocity.clone();
    maxMode.ballVelocity.x += nx * hitForce + car.velocity.x * 0.36;
    maxMode.ballVelocity.y += Math.max(
      ballTuning.verticalImpulseBase,
      ny * ballTuning.verticalImpulseSpeedMult + 0.9,
    );
    maxMode.ballVelocity.z += nz * hitForce + car.velocity.z * 0.36;
    if (lungeShot) applyGoalwardBallBias(car, hitForce, "lunge");
    else if (isMaxMode()) applyGoalwardBallBias(car, hitForce, "drive");
    maxMode.ball.position.x = car.position.x + nx * minDist;
    maxMode.ball.position.y = car.position.y + ny * minDist;
    maxMode.ball.position.z = car.position.z + nz * minDist;
    recordMaxBallTouch(car, preVelocity, maxMode.ballVelocity.clone());
    spawnFx(
      maxMode.ball.position.clone(),
      new THREE.Vector3(nx * 2.4, 1.8, nz * 2.4),
      car.team === "red" ? 0xff8a7a : 0x7feaff,
      0.5,
      0.26,
    );
  });
}

function updateMaxBots(dt) {
  const aiRules = getMaxAiRules();
  const dims = getMaxArenaDimensions();
  const ballPos = maxMode.ball?.position ?? new THREE.Vector3();
  maxMode.riskMemory.playerTouches = Math.max(
    0,
    maxMode.riskMemory.playerTouches - dt * 0.18,
  );
  maxMode.riskMemory.recentMisses = Math.max(
    0,
    maxMode.riskMemory.recentMisses - dt * 0.12,
  );
  bots.forEach((bot) => {
    if (updateDemolishedCar(bot, dt)) {
      bot.update(dt);
      return;
    }
    bot.maxStunTimer = Math.max(0, (bot.maxStunTimer ?? 0) - dt);
    bot.maxBoostTimer = Math.max(0, (bot.maxBoostTimer ?? 0) - dt);
    bot.maxBotLungeTimer = Math.max(0, (bot.maxBotLungeTimer ?? 0) - dt);
    bot.maxBallLungeTimer = Math.max(0, (bot.maxBallLungeTimer ?? 0) - dt);
    if (bot.maxStunTimer <= 0) {
      bot.maxHealth = Math.min(
        MAX_HEALTH_MAX,
        (bot.maxHealth ?? MAX_HEALTH_MAX) + MAX_HEALTH_REFILL_RATE * dt,
      );
    }
    if (bot.maxStunTimer > 0) {
      bot.speed = THREE.MathUtils.lerp(bot.speed, 0, Math.min(1, dt * 7));
      bot.velocity.multiplyScalar(0.92);
      bot.update(dt);
      constrainMaxArenaCar(bot, dt);
      return;
    }
    const target = getRiskBotTarget(bot);
    const desiredHeading = Math.atan2(
      target.x - bot.position.x,
      target.z - bot.position.z,
    );
    const steer = THREE.MathUtils.clamp(
      angleDifference(bot.heading, desiredHeading),
      -1,
      1,
    );
    const riskWeight = getRiskRoleWeight(bot) * (bot.riskSkill ?? 1);
    const turnAuthority =
      (bot.role === "goalie" ? 1.04 : 0.9) *
      (0.96 + aiRules.reactionWeight * 0.08 + riskWeight * 0.03);
    bot.heading += steer * bot.turnRate * dt * turnAuthority;
    bot.moveHeading = THREE.MathUtils.lerp(
      bot.moveHeading,
      bot.heading,
      dt * ((bot.role === "goalie" ? 3.4 : 2.8) + riskWeight * 0.46),
    );
    const toBall = bot.position.distanceTo(ballPos);
    const attackSpeedBase =
      bot.role === "goalie"
        ? 30
        : bot.role === "defender"
          ? 32
          : bot.role === "sweeper"
            ? 35
            : bot.role === "support"
              ? 37
              : bot.role === "playmaker"
                ? 39
                : bot.role === "wing"
                  ? 40
                  : 43;
    const wantsBoost =
      bot.role !== "goalie" &&
      (toBall > aiRules.boostTriggerRange ||
        Math.abs(ballPos.z - bot.position.z) > dims.halfLength * 0.78 ||
        (bot.team === "red" && ballPos.z < 40) ||
        (bot.team === "blue" && ballPos.z > -40));
    if (wantsBoost && Math.random() < dt * (1.5 + aiRules.reactionWeight)) {
      bot.maxBoostTimer = 0.5;
    }
    const kickoffSpacingDampen =
      state.elapsed < 4 ? THREE.MathUtils.lerp(0.78, 1, state.elapsed / 4) : 1;
    const attackSpeed = THREE.MathUtils.clamp(
      attackSpeedBase +
        (toBall > 52 ? (bot.role === "goalie" ? 3 : 8) : 0) +
        ((bot.maxBoostTimer ?? 0) > 0 ? 9 : 0) +
        aiRules.attackSpeedBonus +
        (maxMode.riskMemory.playerTouches + maxMode.riskMemory.recentMisses) *
          0.5,
      24,
      bot.role === "goalie"
        ? 42 * aiRules.topSpeedMult
        : 55 * aiRules.topSpeedMult,
    );
    bot.speed +=
      (attackSpeed * kickoffSpacingDampen - bot.speed) *
      dt *
      ((bot.role === "goalie" ? 2.6 : 2.3) + riskWeight * 0.12);
    const forward = new THREE.Vector3(
      Math.sin(bot.moveHeading),
      0,
      Math.cos(bot.moveHeading),
    );
    bot.velocity.copy(forward).multiplyScalar(bot.speed);
    const separation = new THREE.Vector3();
    bots.forEach((other) => {
      if (other === bot) return;
      const dx = bot.position.x - other.position.x;
      const dz = bot.position.z - other.position.z;
      const distSq = dx * dx + dz * dz;
      if (
        distSq <= 1 ||
        distSq > aiRules.separationRadius * aiRules.separationRadius
      )
        return;
      separation.x += dx / distSq;
      separation.z += dz / distSq;
    });
    if (separation.lengthSq() > 0) {
      separation
        .normalize()
        .multiplyScalar(
          (4.8 - aiRules.pressureMult * 0.8) * (state.elapsed < 5 ? 1.35 : 1),
        );
      bot.velocity.add(separation);
    }
    const chainMate = bots.find(
      (other) =>
        other !== bot &&
        other.team === bot.team &&
        !other.demolished &&
        other.position.distanceTo(bot.position) < 82,
    );
    if (chainMate) {
      const handoff = chainMate.position
        .clone()
        .sub(bot.position)
        .multiplyScalar(0.06 * aiRules.passingBias);
      bot.velocity.add(handoff);
    }
    if (
      bot.team === "red" &&
      bot.position.distanceTo(player.position) < MAX_BOT_LUNGE_RANGE - 4 &&
      (bot.maxBotLungeTimer ?? 0) <= 0 &&
      Math.random() <
        dt * (bot.role === "goalie" ? 0.3 : 1.1) * aiRules.lungeRateMult
    ) {
      performMaxBotLunge(bot, player);
    }
    if (
      bot.position.distanceTo(ballPos) <
        (bot.role === "goalie"
          ? MAX_BALL_LUNGE_RANGE
          : MAX_BALL_LUNGE_RANGE - 8) &&
      Math.random() <
        dt *
          (bot.role === "goalie" ? 1.8 : 0.85) *
          (0.96 + aiRules.pressureMult * 0.28)
    ) {
      performMaxBallLunge(bot);
    } else if (bot.position.distanceTo(ballPos) < 24) {
      maxMode.riskMemory.recentMisses = Math.min(
        8,
        maxMode.riskMemory.recentMisses + dt * 0.8,
      );
    }
    if (bot.role === "goalie") {
      bot.velocity.x *= 1.16;
      bot.velocity.z *= 0.94;
    }
    updateVerticalPhysics(bot, dt);
    bot.update(dt);
    constrainMaxArenaCar(bot, dt);
  });
}

function updateBots(dt) {
  if (isMaxMode()) {
    if (settings.devMode && devTuning.freezeBots) return;
    updateMaxBots(dt);
    return;
  }
  if (settings.difficulty === "no_bots") return;
  if (settings.devMode && devTuning.freezeBots) {
    bots.forEach((bot) => {
      bot.speed = 0;
      bot.velocity.set(0, 0, 0);
      bot.prevPosition.copy(bot.position);
    });
    return;
  }
  const level = getLevel();
  const profile = getDifficultyProfile();
  const deviceAssist = getDeviceAssistTuning();
  const slowMultiplier = state.slowBotsTimer > 0 ? 0.72 : 1;
  const targetSpeed =
    (level.botSpeed + state.heat * 8 * profile.heatRamp) *
    profile.speedMultiplier *
    slowMultiplier *
    deviceAssist.botSpeedMult *
    (settings.devMode ? devTuning.botSpeedMult : 1);
  if (bots.length === 0) return;
  const riskAiActive = settings.campaignAiMode === "risk";

  const closestBotDistance = bots.reduce(
    (best, bot) => Math.min(best, bot.position.distanceTo(player.position)),
    Infinity,
  );
  const playerSpeedAbs = Math.abs(player.speed);
  if (
    riskAiActive &&
    closestBotDistance > 34 &&
    playerSpeedAbs > 18 &&
    state.running
  ) {
    state.campaignRisk.recentEscapes = Math.min(
      6,
      state.campaignRisk.recentEscapes + dt * 0.55,
    );
  } else {
    state.campaignRisk.recentEscapes = Math.max(
      0,
      state.campaignRisk.recentEscapes - dt * 0.18,
    );
  }
  state.campaignRisk.recentHits = Math.max(
    0,
    state.campaignRisk.recentHits - dt * 0.08,
  );
  state.campaignRisk.nearMisses = Math.max(
    0,
    state.campaignRisk.nearMisses - dt * 0.12,
  );
  const adaptivePressure = riskAiActive
    ? 1 +
      state.campaignRisk.recentEscapes * 0.16 +
      state.campaignRisk.recentHits * 0.08 +
      state.campaignRisk.nearMisses * 0.12
    : 1;

  const packCenter = new THREE.Vector3();
  for (let i = 0; i < bots.length; i += 1) {
    packCenter.add(bots[i].position);
  }
  packCenter.multiplyScalar(1 / bots.length);

  const playerForward = new THREE.Vector3(
    Math.sin(player.heading),
    0,
    Math.cos(player.heading),
  );
  const playerRight = new THREE.Vector3(
    Math.cos(player.heading),
    0,
    -Math.sin(player.heading),
  );

  bots.forEach((bot, index) => {
    bot.aiBurstCooldown = Math.max(0, bot.aiBurstCooldown - dt);
    const predictionTime = THREE.MathUtils.clamp(
      (bot.position.distanceTo(player.position) / 60) *
        profile.leadFactor *
        (1 + (riskAiActive ? state.campaignRisk.recentEscapes * 0.12 : 0)),
      0.05,
      1.05,
    );
    const predicted = tempVector
      .copy(player.position)
      .addScaledVector(player.velocity, predictionTime)
      .addScaledVector(
        playerForward,
        2.8 +
          Math.abs(player.speed) *
            (0.04 +
              (riskAiActive ? state.campaignRisk.recentEscapes * 0.01 : 0)),
      );

    const role = getBotRole(index, bots.length, profile.teamwork);
    const roleTarget = tempVectorB.copy(predicted);
    const flankOffset = Math.max(
      7,
      12 +
        profile.teamwork * 10 -
        (riskAiActive ? state.campaignRisk.recentEscapes * 2.4 : 0),
    );
    if (role === "intercept")
      roleTarget.addScaledVector(
        playerForward,
        11 + (riskAiActive ? state.campaignRisk.recentEscapes * 2.2 : 0),
      );
    if (role === "left_flank")
      roleTarget
        .addScaledVector(playerRight, -flankOffset)
        .addScaledVector(
          playerForward,
          4 + (riskAiActive ? state.campaignRisk.recentHits * 0.8 : 0),
        );
    if (role === "right_flank")
      roleTarget
        .addScaledVector(playerRight, flankOffset)
        .addScaledVector(
          playerForward,
          4 + (riskAiActive ? state.campaignRisk.recentHits * 0.8 : 0),
        );
    if (role === "cutoff")
      roleTarget.addScaledVector(
        playerForward,
        18 +
          Math.abs(player.speed) *
            (0.24 +
              (riskAiActive ? state.campaignRisk.recentEscapes * 0.03 : 0)),
      );
    if (role === "pressure")
      roleTarget.addScaledVector(
        playerForward,
        6 + (riskAiActive ? state.campaignRisk.nearMisses * 0.9 : 0),
      );

    // Team convergence keeps bots coordinated into a moving net on classic/brutal.
    roleTarget.addScaledVector(
      tempVectorC.copy(packCenter).sub(bot.position),
      profile.teamwork * 0.18 * adaptivePressure,
    );

    const toTarget = tempVectorC.copy(roleTarget).sub(bot.position);
    const distance = toTarget.length();
    const desiredHeading = Math.atan2(toTarget.x, toTarget.z);
    let steer = THREE.MathUtils.clamp(
      angleDifference(bot.heading, desiredHeading),
      -1,
      1,
    );
    steer *=
      profile.botSkill *
      Math.min(
        1.35,
        1 + (riskAiActive ? state.campaignRisk.recentEscapes * 0.06 : 0),
      );

    let nearestBotDistance = 999;
    // Local separation keeps bots from stacking and helps flanking spread.
    for (let j = 0; j < bots.length; j += 1) {
      if (j === index) continue;
      const other = bots[j];
      const dx = bot.position.x - other.position.x;
      const dz = bot.position.z - other.position.z;
      const d2 = dx * dx + dz * dz;
      const d = Math.sqrt(d2);
      if (d < nearestBotDistance) nearestBotDistance = d;
      if (
        d2 > 0.01 &&
        d2 < 36 + (riskAiActive ? state.campaignRisk.recentEscapes * 5 : 0)
      ) {
        steer += (dx - dz) * 0.0045;
      }
    }
    steer = THREE.MathUtils.clamp(steer, -1, 1);

    bot.heading +=
      steer *
      bot.turnRate *
      dt *
      profile.reaction *
      deviceAssist.botReactionMult *
      Math.min(
        1.3,
        1 + (riskAiActive ? state.campaignRisk.recentHits * 0.04 : 0),
      );
    bot.moveHeading = THREE.MathUtils.lerp(
      bot.moveHeading,
      bot.heading,
      (1.9 +
        profile.botSkill +
        (riskAiActive ? state.campaignRisk.nearMisses * 0.18 : 0)) *
        dt,
    );

    const desiredRange = Math.max(
      6,
      (role === "cutoff"
        ? 20
        : role === "left_flank" || role === "right_flank"
          ? 14
          : role === "intercept"
            ? 9
            : 11) - (riskAiActive ? state.campaignRisk.recentEscapes * 0.8 : 0),
    );
    const rangeError = distance - desiredRange;
    let throttleFactor = THREE.MathUtils.clamp(
      rangeError / 26 + 0.55,
      0.18,
      1.28,
    );
    if (distance < desiredRange * 0.8) throttleFactor *= 0.62;
    if (nearestBotDistance < 7) throttleFactor *= 0.7;

    let speedBoost =
      distance > 50
        ? 1.28 + (riskAiActive ? state.campaignRisk.recentEscapes * 0.06 : 0)
        : 1;
    if (
      bot.aiBurstCooldown <= 0 &&
      distance > desiredRange * 1.15 &&
      Math.random() < profile.burstChance * adaptivePressure * dt * 12
    ) {
      bot.aiBurstCooldown = THREE.MathUtils.randFloat(1.1, 2.1);
      speedBoost +=
        0.28 + (riskAiActive ? state.campaignRisk.nearMisses * 0.05 : 0);
    }
    bot.speed += bot.accel * dt * throttleFactor * slowMultiplier;
    if (distance < desiredRange * 0.65) {
      bot.speed *= 1 - dt * 0.9;
    }
    const roleCap =
      role === "cutoff"
        ? 1.2
        : role === "left_flank" || role === "right_flank"
          ? 1.12
          : role === "intercept"
            ? 1.08
            : 1;
    bot.speed = Math.min(
      targetSpeed *
        speedBoost *
        roleCap *
        Math.min(
          1.18,
          1 + (riskAiActive ? state.campaignRisk.recentEscapes * 0.04 : 0),
        ),
      bot.maxSpeed +
        state.heat * 6.5 * profile.heatRamp +
        (riskAiActive ? state.campaignRisk.recentHits * 1.4 : 0),
    );
    if (isCarAirborne(bot)) {
      applyAirborneSpeedRules(bot, {
        boostActive: bot.aiBurstCooldown > 0,
        topSpeed: bot.maxSpeed + state.heat * 6.5 * profile.heatRamp,
        boostSpeedMult: 1.08,
      });
    }

    const forward = tempVectorC.set(
      Math.sin(bot.moveHeading),
      0,
      Math.cos(bot.moveHeading),
    );
    bot.velocity.copy(forward).multiplyScalar(bot.speed);

    if (
      index % 2 === 0 &&
      distance < 18 + (riskAiActive ? state.campaignRisk.nearMisses * 1.4 : 0)
    ) {
      bot.velocity.add(
        new THREE.Vector3(
          Math.cos(bot.heading),
          0,
          -Math.sin(bot.heading),
        ).multiplyScalar(6 * profile.botSkill),
      );
    }

    updateVerticalPhysics(bot, dt);
    bot.update(dt);

    const segmentDistance = segmentSegmentDistance2D(
      player.prevPosition.x,
      player.prevPosition.z,
      player.position.x,
      player.position.z,
      bot.prevPosition.x,
      bot.prevPosition.z,
      bot.position.x,
      bot.position.z,
    );
    const nowDistance = Math.hypot(
      player.position.x - bot.position.x,
      player.position.z - bot.position.z,
    );
    const hitDistance = Math.min(segmentDistance, nowDistance);
    const hitEval = isValidBotHit(player, bot, hitDistance);
    if (hitEval.valid) {
      handlePlayerHit(bot.botId);
      bot.speed *= 0.65;
    } else if (hitEval.horizontalTouch && !hitEval.verticalTouch) {
      state.missedVerticalHitSamples += 1;
      if (riskAiActive)
        state.campaignRisk.nearMisses = Math.min(
          6,
          state.campaignRisk.nearMisses + 0.18,
        );
      debugLog("hits", "rejected_vertical_overlap", {
        botId: bot.botId,
        playerY: player.position.y,
        botY: bot.position.y,
      });
    } else if (
      state.running &&
      Math.abs(bot.speed) + Math.abs(player.speed) > 62 &&
      hitDistance < BOT_HIT_RADIUS * 1.6
    ) {
      state.missedHitSamples += 1;
      if (riskAiActive)
        state.campaignRisk.nearMisses = Math.min(
          6,
          state.campaignRisk.nearMisses + 0.12,
        );
    }
  });
}

function updateObstacles(entity) {
  obstacles.forEach((obstacle) => {
    const size = obstacle.size;
    const mesh = obstacle.mesh;
    if (
      Math.abs(entity.position.x - mesh.position.x) < size.x / 2 + CAR_RADIUS &&
      Math.abs(entity.position.z - mesh.position.z) < size.z / 2 + CAR_RADIUS
    ) {
      const pushX = entity.position.x - mesh.position.x;
      const pushZ = entity.position.z - mesh.position.z;
      const push = new THREE.Vector3(pushX, 0, pushZ).normalize();
      entity.position.addScaledVector(push, 2.4);
      entity.speed *= 0.5;
    }
  });

  entity.position.x = THREE.MathUtils.clamp(
    entity.position.x,
    -HALF_WORLD + 4,
    HALF_WORLD - 4,
  );
  entity.position.z = THREE.MathUtils.clamp(
    entity.position.z,
    -HALF_WORLD + 4,
    HALF_WORLD - 4,
  );
}

function updatePowerupCollisions() {
  const deviceAssist = getDeviceAssistTuning();
  powerups.forEach((powerup) => {
    const dist = powerup.position.distanceTo(player.position);
    if (dist < POWERUP_PICKUP_RADIUS * deviceAssist.powerupRadiusMult) {
      consumePowerup(powerup);
    }
  });
}

function updateBoostPads(dt = 0.016) {
  const loadoutStats = state.playerLoadoutStats ?? computePlayerLoadoutStats();
  const deviceAssist = getDeviceAssistTuning();
  const worldRule = getCombinedWorldRule();
  const maxBoostVariant = getActiveMaxBoostVariant();
  boostPads.forEach((pad) => {
    pad.userData.cooldown = Math.max(0, (pad.userData.cooldown ?? 0) - dt);
    pad.userData.phase =
      (pad.userData.phase ?? 0) + dt * (pad.userData.maxMode ? 2.2 : 2.8);
    const pulse = 0.9 + Math.sin(pad.userData.phase) * 0.12;
    if (pad.userData.ring) {
      pad.userData.ring.scale.setScalar(
        pad.userData.cooldown > 0 ? 0.7 : pulse,
      );
      pad.userData.ring.material.emissiveIntensity =
        pad.userData.cooldown > 0 ? 0.16 : 0.7 + pulse * 0.38;
    }
    if (pad.userData.beacon) {
      pad.userData.beacon.scale.y =
        pad.userData.cooldown > 0 ? 0.52 : 0.88 + pulse * 0.26;
      pad.userData.beacon.material.opacity =
        pad.userData.cooldown > 0 ? 0.08 : 0.15 + pulse * 0.12;
    }
    if (pad.userData.disc) {
      pad.userData.disc.material.emissiveIntensity =
        pad.userData.cooldown > 0 ? 0.12 : 0.34 + pulse * 0.16;
    }
    const distance = Math.hypot(
      player.position.x - pad.position.x,
      player.position.z - pad.position.z,
    );
    const groundedThreshold = isMaxMode()
      ? getMaxSurfaceHeight(player.position.x, player.position.z) + 0.8
      : 0.2;
    if (
      pad.userData.cooldown === 0 &&
      distance < pad.userData.radius * deviceAssist.boostPadRadiusMult &&
      player.position.y <= groundedThreshold
    ) {
      const maxModeBoost = isMaxMode() ? maxBoostVariant.padSpeedMult : 1;
      player.speed = Math.min(
        player.maxSpeed *
          loadoutStats.boostSpeedMult *
          loadoutStats.padSpeedMult *
          maxModeBoost *
          worldRule.boostMult,
        player.speed +
          (isMaxMode()
            ? 18 + maxBoostVariant.pickupBoost * 12
            : 30 * worldRule.padEnergyMult),
      );
      state.boost = Math.min(
        1,
        state.boost +
          (isMaxMode()
            ? maxBoostVariant.pickupBoost
            : 0.24 * worldRule.padEnergyMult),
      );
      state.padSpeedTimer = isMaxMode()
        ? Math.max(state.padSpeedTimer, maxBoostVariant.padDuration)
        : loadoutStats.padDuration;
      state.padSpeedMult = isMaxMode()
        ? Math.max(state.padSpeedMult, maxBoostVariant.padSpeedMult)
        : loadoutStats.padSpeedMult * worldRule.padEnergyMult;
      pad.userData.cooldown = isMaxMode() ? 0.9 : 0.4;
      if (pad.userData.ring) pad.userData.ring.scale.setScalar(1.24);
      state.score += 40;
      setEffectToast(isMaxMode() ? maxBoostVariant.name : "Pad Surge");
      if (Math.random() < 0.55) {
        spawnFx(
          player.position.clone().add(new THREE.Vector3(0, 0.35, 0)),
          new THREE.Vector3(
            (Math.random() - 0.5) * 2.1,
            2 + Math.random() * 1.4,
            (Math.random() - 0.5) * 2.1,
          ),
          0x5feaff,
          0.55,
          0.24,
        );
      }
    }
  });
}

function updateCamera(dt) {
  const deviceAssist = getDeviceAssistTuning();
  const maxProfile = isMaxMode() ? getMaxDifficultyProfile() : null;
  const speedMph = Math.abs(player.speed) * SPEED_TO_MPH_MULT;
  const speedRatio = THREE.MathUtils.clamp(
    speedMph / (isMaxMode() ? 86 : 150),
    0,
    1,
  );
  if (maxMode.replayActive && maxMode.ball) {
    const center = player.position.clone().lerp(maxMode.ball.position, 0.68);
    const desired = center
      .clone()
      .add(
        new THREE.Vector3(
          0,
          12.5 * (maxProfile?.camera.replayHeightMult ?? 1),
          -18 * (maxProfile?.camera.replayDistanceMult ?? 1),
        ),
      );
    camera.position.lerp(desired, dt * 4.4);
    camera.lookAt(center.clone().add(new THREE.Vector3(0, 2.2, 0)));
    return;
  }
  const cameraTarget = player.position.clone();
  const gameDistanceMult = isMaxMode()
    ? 1.08 * (maxProfile?.camera.distanceMult ?? 1)
    : 1;
  const gameHeightMult = isMaxMode()
    ? 1.04 * (maxProfile?.camera.heightMult ?? 1)
    : 1;
  const ballCamActive = state.ballCam && isMaxMode() && maxMode.ball;
  const headingForCamera =
    Math.abs(player.speed) > 8 ? player.moveHeading : player.heading;
  const forward = new THREE.Vector3(
    Math.sin(headingForCamera),
    0,
    Math.cos(headingForCamera),
  );
  const right = new THREE.Vector3(forward.z, 0, -forward.x);
  const speedDistance =
    CAMERA_BACK_DISTANCE + speedRatio * CAMERA_SPEED_DISTANCE_GAIN;
  const speedHeight = CAMERA_HEIGHT + speedRatio * CAMERA_SPEED_HEIGHT_GAIN;
  const back = forward
    .clone()
    .multiplyScalar(
      -speedDistance *
        deviceAssist.cameraDistanceMult *
        gameDistanceMult *
        (ballCamActive ? 1.14 : 1),
    );
  const lookAhead =
    CAMERA_SPEED_LOOKAHEAD *
    (0.28 + speedRatio * 0.72) *
    (ballCamActive ? 0.55 : 1);
  const desired = cameraTarget
    .clone()
    .add(back)
    .add(
      new THREE.Vector3(
        0,
        speedHeight *
          deviceAssist.cameraHeightMult *
          gameHeightMult *
          (ballCamActive ? 1.16 : 1),
        0,
      ),
    )
    .addScaledVector(forward, CAMERA_PLAYER_SCREEN_BIAS);
  desired.addScaledVector(
    right,
    -state.steerSmoothed * CAMERA_DRIFT_SIDE_GAIN * speedRatio,
  );

  if (input.focusCamera || settings.cameraFocus) {
    desired.add(new THREE.Vector3(0, 4 * deviceAssist.cameraHeightMult, 0));
  }
  if (state.cameraShake > 0) {
    desired.add(
      new THREE.Vector3(
        (Math.random() - 0.5) * state.cameraShake,
        (Math.random() - 0.5) * state.cameraShake * 0.45,
        (Math.random() - 0.5) * state.cameraShake,
      ),
    );
  }

  camera.position.lerp(
    desired,
    dt * THREE.MathUtils.lerp(3.6, 5.2, speedRatio),
  );
  const lookTarget = ballCamActive
    ? player.position
        .clone()
        .lerp(maxMode.ball.position, 0.7)
        .add(new THREE.Vector3(0, CAMERA_LOOK_HEIGHT + 0.8, 0))
    : player.position
        .clone()
        .add(new THREE.Vector3(0, CAMERA_LOOK_HEIGHT + speedRatio * 0.2, 0))
        .addScaledVector(forward, lookAhead)
        .addScaledVector(right, -state.steerSmoothed * 0.28 * speedRatio);
  camera.lookAt(lookTarget);
  const boostFov =
    input.boost && state.boost > 0.05
      ? CAMERA_BOOST_FOV_GAIN * (0.35 + speedRatio * 0.65)
      : 0;
  const targetFov = CAMERA_BASE_FOV + boostFov + speedRatio * 1.6;
  if (Math.abs(camera.fov - targetFov) > 0.04) {
    camera.fov = THREE.MathUtils.lerp(
      camera.fov,
      targetFov,
      Math.min(1, dt * 5),
    );
    camera.updateProjectionMatrix();
  }
  state.cameraShake = Math.max(0, state.cameraShake - dt * CAMERA_SHAKE_DECAY);
  state.cameraTelemetry.distance =
    speedDistance * deviceAssist.cameraDistanceMult * gameDistanceMult;
  state.cameraTelemetry.height =
    speedHeight * deviceAssist.cameraHeightMult * gameHeightMult;
  state.cameraTelemetry.lookAhead = lookAhead;
  state.cameraTelemetry.ballCam = ballCamActive;
}

function updatePlayfieldReadability(dt) {
  groundGrid.position.x = 0;
  groundGrid.position.z = 0;
  groundGrid.rotation.y = 0;
}

function updateCombo(dt, steer) {
  if (input.drift && Math.abs(steer) > 0.2 && Math.abs(player.speed) > 12) {
    state.combo = Math.min(6, state.combo + dt * 0.94);
    state.score += dt * 12 * state.combo;
  } else {
    state.combo = Math.max(1, state.combo - dt * 0.4);
  }
}

function updateDifficulty(dt) {
  state.elapsed += dt;
  if (isMaxMode()) {
    if (state.effectToastTimer > 0) {
      state.effectToastTimer = Math.max(0, state.effectToastTimer - dt);
      if (state.effectToastTimer === 0) state.effectToast = "";
    }
    return;
  }
  const profile = getDifficultyProfile();
  const heatRamp = settings.difficulty === "no_bots" ? 0.75 : profile.heatRamp;
  if (state.elapsed > 10) {
    state.heat = Math.min(1.35, state.heat + dt * 0.015 * heatRamp);
  }
  if (state.slowBotsTimer > 0)
    state.slowBotsTimer = Math.max(0, state.slowBotsTimer - dt);
  if (state.effectToastTimer > 0) {
    state.effectToastTimer = Math.max(0, state.effectToastTimer - dt);
    if (state.effectToastTimer === 0) state.effectToast = "";
  }
}

function stepGame(dt) {
  const pausedByMenu = isMenuOpen();
  const targetMinimapHeading = MINIMAP_USE_MOVE_HEADING
    ? player.moveHeading
    : player.heading;
  state.minimapHeading +=
    angleDifference(state.minimapHeading, targetMinimapHeading) *
    Math.min(1, dt * MINIMAP_HEADING_SMOOTH);

  if (maxMode.replayActive && !pausedByMenu) {
    updateGoalReplay(dt);
    updateFx(dt);
    updateCamera(dt);
    updateHud();
    renderer.render(scene, camera);
    return;
  }

  if (state.running && !pausedByMenu) {
    if (state.postHitSafeFrames > 0) state.postHitSafeFrames -= 1;
    state.timeLeft = Math.max(0, state.timeLeft - dt);
    updateDifficulty(dt);

    updatePlayer(dt);
    updateBots(dt);
    if (isMaxMode()) {
      updateMaxBall(dt);
      resolveMaxBumps();
      updateBoostPads(dt);
      maxMode.replaySampleTimer += dt;
      if (maxMode.replaySampleTimer >= MAX_REPLAY_RULES.sampleRate) {
        maxMode.replaySampleTimer = 0;
        captureMaxReplayFrame();
      }
      if (state.timeLeft <= 0 && !state.overtime) {
        if (maxMode.blueScore === maxMode.redScore) {
          state.overtime = true;
          state.timeLeft = 0;
          setEffectToast("Overtime");
        } else {
          showMessage(
            maxMode.blueScore > maxMode.redScore
              ? "Blue Team Wins"
              : "Red Team Wins",
            "Press Enter to replay the arena.",
            "Replay",
            "restart-current",
          );
        }
      } else if (state.overtime && maxMode.blueScore !== maxMode.redScore) {
        showMessage(
          maxMode.blueScore > maxMode.redScore
            ? "Blue Team Wins"
            : "Red Team Wins",
          "Golden goal locked it in. Press Enter to replay.",
          "Replay",
          "restart-current",
        );
      }
    } else {
      updateObstacles(player);
      bots.forEach((bot) => updateObstacles(bot));
      updatePowerups(dt);
      updatePowerupCollisions();
      updateBoostPads(dt);
    }
    updateOnlineTelemetry(dt);
    updateModeObjectives(dt);
    updateFx(dt);

    if (
      !isMaxMode() &&
      settings.difficulty === "no_bots" &&
      hasMovementInput() &&
      Math.abs(player.speed) < 0.2
    ) {
      state.noBotsRecoveryTimer += dt;
      if (state.noBotsRecoveryTimer > 0.55) {
        const loadoutStats =
          state.playerLoadoutStats ?? computePlayerLoadoutStats();
        state.steerSmoothed = 0;
        player.velocity.set(0, 0, 0);
        player.maxSpeed = loadoutStats.topSpeed;
        player.accel = loadoutStats.accel;
        state.noBotsRecoveryTimer = 0;
        debugLog("menu", "no_bots_recovery_applied");
      }
    } else {
      state.noBotsRecoveryTimer = 0;
    }

    if (!isMaxMode() && state.timeLeft <= 0) {
      completeLevel();
    }
    if (DEBUG_FLAGS.enabled && DEBUG_FLAGS.minimap) {
      state.minimapDebugTimer += dt;
      if (state.minimapDebugTimer > 0.5) {
        state.minimapDebugTimer = 0;
        debugLog("minimap", {
          playerHeading: player.heading.toFixed(3),
          playerMoveHeading: player.moveHeading.toFixed(3),
          minimapHeading: state.minimapHeading.toFixed(3),
        });
      }
    }
  } else {
    updateFx(dt);
  }

  updatePlayfieldReadability(dt);
  updateCamera(dt);
  updateHud();
  renderer.render(scene, camera);
}

function drawMinimap() {
  if (!minimapCtx || !minimapCanvas) return;
  const dims = getMaxArenaDimensions();
  const size = minimapCanvas.width;
  const pad = 12;
  const center = size * 0.5;
  const mapRadius = center - pad;
  const worldExtentX = isMaxMode() ? dims.halfWidth : HALF_WORLD;
  const worldExtentZ = isMaxMode() ? dims.halfLength : HALF_WORLD;
  const scale = mapRadius / Math.max(worldExtentX, worldExtentZ);
  const referenceHeading = state.minimapHeading;
  const cos = Math.cos(referenceHeading);
  const sin = Math.sin(referenceHeading);

  const project = (wx, wz) => {
    const dx = wx - player.position.x;
    const dz = wz - player.position.z;
    const rx = dx * cos - dz * sin;
    const rz = -dx * sin - dz * cos;
    return {
      x: center + rx * scale,
      y: center - rz * scale,
      inRange: Math.abs(rx) <= worldExtentX && Math.abs(rz) <= worldExtentZ,
    };
  };

  const drawHeadingMarker = (x, y, heading, color, sizePx) => {
    const rel = heading - referenceHeading;
    const fx = Math.sin(rel);
    const fy = Math.cos(rel);
    const tail = sizePx * 1.25;
    const nose = sizePx * 1.45;
    const wing = sizePx * 0.58;

    // Direction stem removes ambiguity and makes travel heading obvious.
    minimapCtx.strokeStyle = color;
    minimapCtx.lineWidth = Math.max(1.4, sizePx * 0.34);
    minimapCtx.beginPath();
    minimapCtx.moveTo(x - fx * tail, y + fy * tail);
    minimapCtx.lineTo(x + fx * nose, y - fy * nose);
    minimapCtx.stroke();

    minimapCtx.fillStyle = color;
    minimapCtx.beginPath();
    minimapCtx.moveTo(x + fx * nose, y - fy * nose);
    minimapCtx.lineTo(x - fy * wing, y - fx * wing);
    minimapCtx.lineTo(x + fy * wing, y + fx * wing);
    minimapCtx.closePath();
    minimapCtx.fill();

    minimapCtx.beginPath();
    minimapCtx.arc(x, y, Math.max(1.8, sizePx * 0.33), 0, Math.PI * 2);
    minimapCtx.fill();
  };

  minimapCtx.clearRect(0, 0, size, size);
  const bg = minimapCtx.createRadialGradient(
    center,
    center,
    mapRadius * 0.18,
    center,
    center,
    mapRadius,
  );
  bg.addColorStop(
    0,
    isMaxMode() ? "rgba(17, 33, 51, 0.98)" : "rgba(15, 24, 37, 0.98)",
  );
  bg.addColorStop(1, "rgba(5, 10, 18, 0.98)");
  minimapCtx.fillStyle = bg;
  minimapCtx.fillRect(0, 0, size, size);

  minimapCtx.save();
  minimapCtx.beginPath();
  minimapCtx.arc(center, center, mapRadius, 0, Math.PI * 2);
  minimapCtx.clip();

  const scan = minimapCtx.createLinearGradient(0, 0, 0, size);
  scan.addColorStop(0, "rgba(86, 233, 255, 0.06)");
  scan.addColorStop(0.5, "rgba(86, 233, 255, 0)");
  scan.addColorStop(1, "rgba(255, 154, 108, 0.04)");
  minimapCtx.fillStyle = scan;
  minimapCtx.fillRect(0, 0, size, size);

  minimapCtx.strokeStyle = "rgba(123, 161, 199, 0.4)";
  minimapCtx.lineWidth = 1;
  for (let ring = 1; ring <= 3; ring += 1) {
    minimapCtx.beginPath();
    minimapCtx.arc(center, center, (mapRadius * ring) / 3, 0, Math.PI * 2);
    minimapCtx.stroke();
  }

  minimapCtx.strokeStyle = "rgba(123, 161, 199, 0.28)";
  const step = (mapRadius * 2) / 4;
  for (let i = 1; i < 4; i += 1) {
    const p = center - mapRadius + step * i;
    minimapCtx.beginPath();
    minimapCtx.moveTo(p, center - mapRadius);
    minimapCtx.lineTo(p, center + mapRadius);
    minimapCtx.stroke();
    minimapCtx.beginPath();
    minimapCtx.moveTo(center - mapRadius, p);
    minimapCtx.lineTo(center + mapRadius, p);
    minimapCtx.stroke();
  }

  minimapCtx.strokeStyle = "rgba(135, 185, 228, 0.55)";
  minimapCtx.lineWidth = 1.2;
  const worldCorners = isMaxMode()
    ? [
        project(-dims.halfWidth, -dims.halfLength),
        project(dims.halfWidth, -dims.halfLength),
        project(dims.halfWidth, dims.halfLength),
        project(-dims.halfWidth, dims.halfLength),
      ]
    : [
        project(-worldExtentX, -worldExtentZ),
        project(worldExtentX, -worldExtentZ),
        project(worldExtentX, worldExtentZ),
        project(-worldExtentX, worldExtentZ),
      ];
  minimapCtx.beginPath();
  minimapCtx.moveTo(worldCorners[0].x, worldCorners[0].y);
  for (let i = 1; i < worldCorners.length; i += 1) {
    minimapCtx.lineTo(worldCorners[i].x, worldCorners[i].y);
  }
  minimapCtx.closePath();
  minimapCtx.stroke();
  if (DEBUG_FLAGS.enabled && DEBUG_FLAGS.minimap) {
    const edgeOverflow = worldCorners.some((corner) => {
      const dx = corner.x - center;
      const dy = corner.y - center;
      return Math.hypot(dx, dy) > mapRadius * 1.18;
    });
    if (edgeOverflow) {
      debugLog("minimap", "edge_projection_overflow", {
        worldExtentX,
        worldExtentZ,
        mapRadius,
        scale: Number(scale.toFixed(4)),
      });
    }
  }

  // Explicit north marker centered to current heading so map top is always your forward direction.
  minimapCtx.strokeStyle = "rgba(126, 255, 255, 0.78)";
  minimapCtx.lineWidth = 1.2;
  minimapCtx.beginPath();
  minimapCtx.moveTo(center, center - mapRadius + 8);
  minimapCtx.lineTo(center, center - mapRadius + 18);
  minimapCtx.stroke();

  if (!isMaxMode()) {
    boostPads.forEach((pad) => {
      const p = project(pad.position.x, pad.position.z);
      if (!p.inRange) return;
      minimapCtx.fillStyle = "rgba(86, 233, 255, 0.82)";
      minimapCtx.beginPath();
      minimapCtx.arc(p.x, p.y, 2.1, 0, Math.PI * 2);
      minimapCtx.fill();
    });
  }

  if (isMaxMode()) {
    [-1, 1].forEach((zSign) => {
      const p = project(0, zSign * dims.goalLineZ);
      minimapCtx.fillStyle =
        zSign < 0 ? "rgba(86, 233, 255, 0.95)" : "rgba(255, 108, 108, 0.95)";
      minimapCtx.fillRect(p.x - 10, p.y - 3, 20, 6);
    });
    if (maxMode.ball) {
      const ballP = project(maxMode.ball.position.x, maxMode.ball.position.z);
      if (ballP.inRange) {
        minimapCtx.fillStyle = "rgba(245, 245, 242, 0.96)";
        minimapCtx.beginPath();
        minimapCtx.arc(ballP.x, ballP.y, 4, 0, Math.PI * 2);
        minimapCtx.fill();
      }
    }
  } else {
    minimapCtx.fillStyle = "rgba(255, 171, 92, 0.94)";
    ramps.forEach((ramp) => {
      const p = project(ramp.position.x, ramp.position.z);
      if (!p.inRange) return;
      const r =
        ramp.userData.kind === "titan"
          ? 4.2
          : ramp.userData.kind === "mega"
            ? 3
            : 2;
      minimapCtx.beginPath();
      minimapCtx.arc(p.x, p.y, r, 0, Math.PI * 2);
      minimapCtx.fill();
    });
    powerups.forEach((powerup) => {
      const p = project(powerup.position.x, powerup.position.z);
      if (!p.inRange) return;
      minimapCtx.fillStyle = "rgba(255, 207, 103, 0.88)";
      minimapCtx.fillRect(p.x - 2, p.y - 2, 4, 4);
    });
  }

  bots.forEach((bot) => {
    const p = project(bot.position.x, bot.position.z);
    if (!p.inRange) return;
    const color = isMaxMode()
      ? bot.team === "blue"
        ? "rgba(86, 233, 255, 0.95)"
        : "rgba(255, 108, 108, 0.95)"
      : "rgba(255, 98, 98, 0.95)";
    drawHeadingMarker(p.x, p.y, bot.moveHeading, color, 4.2);
  });

  minimapCtx.fillStyle = "rgba(126, 255, 255, 0.12)";
  minimapCtx.beginPath();
  minimapCtx.moveTo(center, center);
  minimapCtx.arc(
    center,
    center,
    mapRadius * 0.52,
    -Math.PI * 0.2,
    Math.PI * 0.2,
  );
  minimapCtx.closePath();
  minimapCtx.fill();

  drawHeadingMarker(center, center, referenceHeading, "#7effff", 6.8);

  minimapCtx.restore();

  minimapCtx.strokeStyle = isMaxMode()
    ? "rgba(255, 154, 108, 0.18)"
    : "rgba(86, 233, 255, 0.22)";
  minimapCtx.lineWidth = 1.2;
  minimapCtx.beginPath();
  minimapCtx.arc(center, center, mapRadius, 0, Math.PI * 2);
  minimapCtx.stroke();
}

function createRadarModel() {
  const dims = getMaxArenaDimensions();
  const size = minimapCanvas.width;
  const pad = Math.max(4, size * 0.035);
  const center = size * 0.5;
  const half = center - pad;
  const range = Math.max(
    isMaxMode() ? dims.halfWidth : HALF_WORLD,
    isMaxMode() ? dims.halfLength : HALF_WORLD,
  );
  const scale = half / range;
  const referenceHeading = state.minimapHeading;
  const forwardX = Math.sin(referenceHeading);
  const forwardZ = Math.cos(referenceHeading);
  const rightX = Math.cos(referenceHeading);
  const rightZ = -Math.sin(referenceHeading);
  const project = (wx, wz, radius = 0) => {
    const dx = wx - player.position.x;
    const dz = wz - player.position.z;
    const right = dx * rightX + dz * rightZ;
    const forward = dx * forwardX + dz * forwardZ;
    const rawX = center + right * scale;
    const rawY = center - forward * scale;
    const edgePad = pad + radius + 2;
    const x = THREE.MathUtils.clamp(rawX, edgePad, size - edgePad);
    const y = THREE.MathUtils.clamp(rawY, edgePad, size - edgePad);
    const edge = x !== rawX || y !== rawY;
    const sector =
      Math.abs(forward) >= Math.abs(right)
        ? forward >= 0
          ? "front"
          : "rear"
        : right >= 0
          ? "right"
          : "left";
    return { x, y, rawX, rawY, right, forward, edge, sector };
  };
  const entities = [];
  const addEntity = (
    kind,
    wx,
    wz,
    heading = referenceHeading,
    color = "rgba(255,255,255,0.9)",
    sizePx = 4,
  ) => {
    const p = project(wx, wz, sizePx);
    entities.push({
      kind,
      x: p.x,
      y: p.y,
      right: p.right,
      forward: p.forward,
      sector: p.sector,
      edge: p.edge,
      heading: angleDifference(referenceHeading, heading),
      color,
      sizePx,
    });
  };

  if (isMaxMode()) {
    if (maxMode.ball) {
      addEntity(
        "ball",
        maxMode.ball.position.x,
        maxMode.ball.position.z,
        referenceHeading,
        "rgba(245,245,242,0.96)",
        4.6,
      );
    }
    addEntity("blue-goal", 0, -dims.goalLineZ, 0, "rgba(86,233,255,0.95)", 5);
    addEntity(
      "red-goal",
      0,
      dims.goalLineZ,
      Math.PI,
      "rgba(255,108,108,0.95)",
      5,
    );
  } else {
    boostPads
      .slice(0, 12)
      .forEach((pad) =>
        addEntity(
          "boost",
          pad.position.x,
          pad.position.z,
          referenceHeading,
          "rgba(86,233,255,0.78)",
          2.3,
        ),
      );
    ramps
      .slice(0, 18)
      .forEach((ramp) =>
        addEntity(
          ramp.userData.kind === "titan" ? "titan-ramp" : "ramp",
          ramp.position.x,
          ramp.position.z,
          referenceHeading,
          "rgba(255,171,92,0.9)",
          ramp.userData.kind === "titan" ? 4.4 : 3.1,
        ),
      );
    powerups.forEach((powerup) =>
      addEntity(
        `powerup-${powerup.userData.type}`,
        powerup.position.x,
        powerup.position.z,
        referenceHeading,
        "rgba(255,207,103,0.9)",
        3,
      ),
    );
    modeMarkers.forEach((marker) => {
      if (marker.userData?.complete) return;
      addEntity(
        marker.userData?.radarKind ?? "objective",
        marker.position.x,
        marker.position.z,
        referenceHeading,
        marker.userData?.radarColor ?? "rgba(255,255,255,0.9)",
        4.2,
      );
    });
  }

  bots.forEach((bot) => {
    addEntity(
      bot.role ?? (isMaxMode() ? (bot.team ?? "bot") : "hunter"),
      bot.position.x,
      bot.position.z,
      bot.moveHeading,
      isMaxMode()
        ? bot.team === "blue"
          ? "rgba(86,233,255,0.95)"
          : "rgba(255,108,108,0.95)"
        : bot.role === "boss"
          ? "rgba(255,72,46,0.98)"
          : "rgba(255,98,98,0.95)",
      bot.role === "boss" ? 5.8 : 4.3,
    );
  });

  state.radarSnapshot = {
    heading: Number(referenceHeading.toFixed(3)),
    range: Number(range.toFixed(1)),
    coordinateSystem:
      "player-relative radar: top/front, right/car-right, left/car-left, bottom/rear",
    entities: entities.slice(0, 32).map((entity) => ({
      kind: entity.kind,
      x: Number(entity.x.toFixed(2)),
      y: Number(entity.y.toFixed(2)),
      right: Number(entity.right.toFixed(2)),
      forward: Number(entity.forward.toFixed(2)),
      sector: entity.sector,
      edge: entity.edge,
      heading: Number(entity.heading.toFixed(3)),
    })),
  };

  return { size, pad, center, half, entities };
}

function drawRadar() {
  if (!minimapCtx || !minimapCanvas) return;
  const { size, pad, center, half, entities } = createRadarModel();
  minimapCtx.clearRect(0, 0, size, size);
  const bg = minimapCtx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, "rgba(11, 23, 36, 0.98)");
  bg.addColorStop(0.58, "rgba(5, 11, 18, 0.98)");
  bg.addColorStop(
    1,
    isMaxMode() ? "rgba(34,18,22,0.98)" : "rgba(9,16,26,0.98)",
  );
  minimapCtx.fillStyle = bg;
  minimapCtx.fillRect(0, 0, size, size);
  minimapCtx.save();
  minimapCtx.beginPath();
  minimapCtx.roundRect(pad, pad, size - pad * 2, size - pad * 2, 10);
  minimapCtx.clip();
  const scan = minimapCtx.createLinearGradient(0, 0, 0, size);
  scan.addColorStop(0, "rgba(86,233,255,0.08)");
  scan.addColorStop(0.5, "rgba(86,233,255,0)");
  scan.addColorStop(1, "rgba(255,154,108,0.04)");
  minimapCtx.fillStyle = scan;
  minimapCtx.fillRect(0, 0, size, size);
  minimapCtx.fillStyle = "rgba(126,255,255,0.09)";
  minimapCtx.beginPath();
  minimapCtx.moveTo(center, center);
  minimapCtx.arc(center, center, half * 0.76, -Math.PI * 0.68, -Math.PI * 0.32);
  minimapCtx.closePath();
  minimapCtx.fill();
  minimapCtx.strokeStyle = "rgba(126,255,255,0.5)";
  minimapCtx.lineWidth = 1;
  minimapCtx.beginPath();
  minimapCtx.moveTo(center, pad + 5);
  minimapCtx.lineTo(center, pad + 18);
  minimapCtx.stroke();

  const drawHeadingMarker = (x, y, relHeading, color, sizePx, edge = false) => {
    const fx = Math.sin(relHeading);
    const fy = Math.cos(relHeading);
    const nose = sizePx * (edge ? 1.75 : 1.55);
    const wing = sizePx * 0.72;
    minimapCtx.save();
    minimapCtx.translate(x, y);
    minimapCtx.fillStyle = color;
    minimapCtx.strokeStyle = "rgba(5,10,18,0.72)";
    minimapCtx.lineWidth = Math.max(1.1, sizePx * 0.24);
    minimapCtx.beginPath();
    minimapCtx.moveTo(fx * nose, -fy * nose);
    minimapCtx.lineTo(-fy * wing, -fx * wing);
    minimapCtx.lineTo(fy * wing, fx * wing);
    minimapCtx.closePath();
    minimapCtx.fill();
    minimapCtx.stroke();
    if (!edge) {
      minimapCtx.beginPath();
      minimapCtx.arc(0, 0, Math.max(1.5, sizePx * 0.28), 0, Math.PI * 2);
      minimapCtx.fill();
    }
    minimapCtx.restore();
  };
  const drawDot = (entity, radius, stroke = false) => {
    minimapCtx.fillStyle = entity.color;
    minimapCtx.strokeStyle = entity.color;
    minimapCtx.lineWidth = 1.6;
    minimapCtx.beginPath();
    minimapCtx.arc(entity.x, entity.y, radius, 0, Math.PI * 2);
    if (stroke) minimapCtx.stroke();
    else minimapCtx.fill();
  };
  const drawDiamond = (entity, radius) => {
    minimapCtx.fillStyle = entity.color;
    minimapCtx.beginPath();
    minimapCtx.moveTo(entity.x, entity.y - radius);
    minimapCtx.lineTo(entity.x + radius, entity.y);
    minimapCtx.lineTo(entity.x, entity.y + radius);
    minimapCtx.lineTo(entity.x - radius, entity.y);
    minimapCtx.closePath();
    minimapCtx.fill();
  };

  entities.forEach((entity) => {
    if (entity.kind === "boost") drawDot(entity, 2.1);
    else if (entity.kind.startsWith("powerup")) drawDiamond(entity, 3);
    else if (entity.kind.includes("ramp")) drawDiamond(entity, entity.sizePx);
    else if (entity.kind === "ball") drawDot(entity, 4.3, true);
    else if (entity.kind.includes("goal")) {
      minimapCtx.fillStyle = entity.color;
      minimapCtx.fillRect(entity.x - 8, entity.y - 2, 16, 4);
    } else if (entity.kind === "objective") drawDiamond(entity, 4.2);
    else
      drawHeadingMarker(
        entity.x,
        entity.y,
        entity.edge
          ? Math.atan2(entity.x - center, center - entity.y)
          : entity.heading,
        entity.color,
        entity.sizePx,
        entity.edge,
      );
  });

  drawHeadingMarker(center, center, 0, "#7effff", 7.2);
  minimapCtx.restore();
  minimapCtx.strokeStyle = isMaxMode()
    ? "rgba(255,154,108,0.28)"
    : "rgba(86,233,255,0.32)";
  minimapCtx.lineWidth = 1.4;
  minimapCtx.beginPath();
  minimapCtx.roundRect(pad, pad, size - pad * 2, size - pad * 2, 10);
  minimapCtx.stroke();
}

function updateDebugHud() {
  if (!debugHud) return;
  const visible = settings.devMode && DEBUG_FLAGS.enabled;
  debugHud.hidden = !visible;
  if (!visible) return;
  const mode = isMaxMode() ? "MAX" : "ID4";
  const ballSummary =
    isMaxMode() && maxMode.ball
      ? `BALL ${maxMode.ball.position.x.toFixed(0)}, ${maxMode.ball.position.z.toFixed(0)}`
      : "BALL -";
  debugHud.textContent = [
    `MODE ${mode}`,
    `WORLD ${state.worldIndex + 1}  LEVEL ${state.levelIndex + 1}`,
    `PLAYER ${player.position.x.toFixed(0)}, ${player.position.z.toFixed(0)}  SPD ${Math.round(Math.abs(player.speed) * SPEED_TO_MPH_MULT)}`,
    isMaxMode()
      ? `HEALTH ${Math.round(player.maxHealth ?? MAX_HEALTH_MAX)}  BLUE ${maxMode.blueScore} RED ${maxMode.redScore}`
      : `LIVES ${state.lives}  SHIELD ${Math.round(state.shield * 100)}%`,
    isMaxMode()
      ? `BALL LUNGE ${state.ballLungeCooldown.toFixed(1)}  TARGET ${state.botLungeCooldown.toFixed(1)}`
      : `BOOST ${Math.round(state.boost * 100)}  COMBO ${state.combo.toFixed(1)}`,
    ballSummary,
  ].join("\n");
}

function updateBotHealthBars() {
  bots.forEach((bot) => {
    const visible = isMaxMode();
    bot.setHealthBar(
      (bot.maxHealth ?? MAX_HEALTH_MAX) / MAX_HEALTH_MAX,
      visible,
    );
  });
}

function updateMatchPanel() {
  if (!matchPanel) return;
  const visible = isMaxMode();
  matchPanel.hidden = !visible;
  if (!visible) return;
  const compact = !settings.devMode && !isMenuOpen() && !maxMode.replayActive;
  matchPanel.classList.toggle("compact", compact);
  const maxProfile = getMaxDifficultyProfile();
  if (matchPanelScore) {
    matchPanelScore.textContent = `${maxMode.blueScore} - ${maxMode.redScore}`;
  }
  const playerStats = player.matchStats ?? {
    goals: 0,
    assists: 0,
    saves: 0,
    shots: 0,
    demolitions: 0,
  };
  if (matchPanelStats) {
    matchPanelStats.innerHTML = `
      <div class="match-stat"><span>Goals</span><strong>${playerStats.goals}</strong></div>
      <div class="match-stat"><span>Assists</span><strong>${playerStats.assists}</strong></div>
      <div class="match-stat"><span>Saves</span><strong>${playerStats.saves}</strong></div>
      <div class="match-stat"><span>Shots / Demos</span><strong>${playerStats.shots} / ${playerStats.demolitions}</strong></div>
    `;
  }
  if (matchPanelMeta) {
    const latestEvent = maxMode.stats?.events?.[0];
    matchPanelMeta.textContent = maxMode.replayActive
      ? maxMode.replayMeta
      : latestEvent
        ? `${maxProfile.label} • ${(latestEvent.by ?? latestEvent.team ?? latestEvent.type).toString().replace(/^./, (c) => c.toUpperCase())}`
        : compact
          ? `${maxProfile.label} • Live`
          : `${maxProfile.label} • Waiting`;
  }
}

function updateHud() {
  const level = getLevel();
  if (isMaxMode()) {
    if (statusLabelNodes.length >= 2) {
      statusLabelNodes[0].textContent = "Boost";
      statusLabelNodes[1].textContent = "Health";
    }
    if (hudLabelNodes.length >= 7) {
      hudLabelNodes[0].textContent = "Score";
      hudLabelNodes[1].textContent = "Preset";
      hudLabelNodes[2].textContent = "Clock";
      hudLabelNodes[3].textContent = "State";
      hudLabelNodes[4].textContent = "Speed";
      hudLabelNodes[5].textContent = "Team";
      hudLabelNodes[6].textContent = "Status";
    }
    hudWorld.textContent = `${maxMode.blueScore}-${maxMode.redScore}`;
    hudLevel.textContent = getMaxDifficultyProfile().label;
    hudScore.textContent = state.overtime
      ? "OT"
      : maxMode.replayActive
        ? "Replay"
        : player.demolished
          ? "Respawn"
          : "Live";
    hudSpeed.textContent = `${Math.round(Math.abs(player.speed) * SPEED_TO_MPH_MULT)} MPH`;
    hudHearts.innerHTML = "";
    hudLives.textContent = "Blue";
    hudCombo.textContent = state.effectToast || "Ready";
    if (hudLivesPill) hudLivesPill.hidden = true;
    if (hudComboPill) hudComboPill.hidden = true;
    if (hudLevelPill) hudLevelPill.hidden = false;
    if (hudWorldPill) hudWorldPill.hidden = false;
    if (hudTimePill) hudTimePill.hidden = false;
    if (hudScorePill) hudScorePill.hidden = false;
    if (hudSpeedPill) hudSpeedPill.hidden = false;
  } else {
    if (statusLabelNodes.length >= 2) {
      statusLabelNodes[0].textContent = "Boost";
      statusLabelNodes[1].textContent = "Shield";
    }
    if (hudLabelNodes.length >= 7) {
      hudLabelNodes[0].textContent = "World";
      hudLabelNodes[1].textContent = "Level";
      hudLabelNodes[2].textContent = "Time";
      hudLabelNodes[3].textContent = "Score";
      hudLabelNodes[4].textContent = "Speed";
      hudLabelNodes[5].textContent = "Lives";
      hudLabelNodes[6].textContent = "Drift";
    }
    const objective = state.modeObjective ?? MODE_OBJECTIVE_DEFAULT;
    const modeLabel =
      settings.id4Mode === "campaign" ? getWorld().name : objective.label;
    hudWorld.textContent = modeLabel;
    const levelLabel =
      settings.campaignAiMode === "risk" ? `${level.name} [Risk]` : level.name;
    const objectiveProgress =
      objective.target > 1
        ? `${objective.label} ${Math.floor(objective.progress)}/${Math.ceil(objective.target)}`
        : levelLabel;
    hudLevel.textContent = state.effectToast
      ? `${objectiveProgress} - ${state.effectToast}`
      : objectiveProgress;
    hudScore.textContent = Math.floor(state.score).toString();
    hudSpeed.textContent = `${Math.round(Math.abs(player.speed) * SPEED_TO_MPH_MULT)} MPH`;
    renderLivesHud();
    hudCombo.textContent = `x${state.combo.toFixed(1)}`;
    if (hudLivesPill) hudLivesPill.hidden = false;
    if (hudComboPill) hudComboPill.hidden = false;
    if (hudLevelPill) hudLevelPill.hidden = false;
    if (hudWorldPill) hudWorldPill.hidden = false;
    if (hudTimePill) hudTimePill.hidden = false;
    if (hudScorePill) hudScorePill.hidden = false;
    if (hudSpeedPill) hudSpeedPill.hidden = false;
  }
  const minutes = Math.floor(state.timeLeft / 60);
  const seconds = Math.floor(state.timeLeft % 60)
    .toString()
    .padStart(2, "0");
  hudTime.textContent = `${minutes}:${seconds}`;
  boostBar.style.width = `${Math.round(state.boost * 100)}%`;
  shieldBar.style.width = `${Math.round((isMaxMode() ? (player.maxHealth ?? MAX_HEALTH_MAX) / MAX_HEALTH_MAX : state.shield) * 100)}%`;
  progressBar.style.width = `${Math.min(100, (1 - state.timeLeft / level.time) * 100)}%`;
  drawRadar();
  updateDebugHud();
  updateBotHealthBars();
  updateMatchPanel();
}

function renderLivesHud() {
  if (state.lives !== lastLivesRendered || state.livesPulse !== 0) {
    const maxLives = 5;
    const change = state.livesPulse;
    const lostIndex = change < 0 ? state.lives : -1;
    const gainedIndex = change > 0 ? state.lives - 1 : -1;
    hudHearts.innerHTML = "";
    for (let i = 0; i < maxLives; i += 1) {
      const heart = document.createElement("span");
      heart.className = "heart";
      heart.textContent = "♥";
      if (i >= state.lives) heart.classList.add("off");
      if (i === lostIndex) heart.classList.add("lost");
      if (i === gainedIndex) heart.classList.add("gained");
      hudHearts.appendChild(heart);
    }
    hudLives.textContent = `${state.lives}/${maxLives}`;
    lastLivesRendered = state.lives;
    state.livesPulse = 0;
  }
}

function loseLife() {
  state.lives -= 1;
  state.livesPulse = -1;
  state.score = Math.max(0, state.score - 200);
  player.setPosition(PLAYER_SPAWN_X, 0, PLAYER_SPAWN_Z);
  player.speed = 0;
  player.velocity.set(0, 0, 0);
  player.verticalVel = 0;
  state.backflipQueueTimer = 0;
  state.devJumpComboTimer = 0;
  state.devJumpActive = false;
  state.devJumpCarrySpeed = 0;
  state.backflipChainCount = 0;
  player.backflipActive = false;
  player.backflipProgress = 0;
  player.backflipRecovery = 0;
  player.heading = 0;
  player.moveHeading = 0;
  player.prevPosition.copy(player.position);
  input.backflip = false;
  state.campaignRisk.recentEscapes = Math.max(
    0,
    state.campaignRisk.recentEscapes - 0.5,
  );
}

function handlePlayerHit(sourceBotId = -1) {
  if (isMaxMode()) return;
  if (settings.devMode && devTuning.invulnerable) {
    debugLog("hits", "suppressed_by_dev_invulnerable", { sourceBotId });
    return;
  }
  const loadoutStats = state.playerLoadoutStats ?? computePlayerLoadoutStats();
  const now = performance.now();
  if (state.postHitSafeFrames > 0) {
    debugLog("hits", "suppressed_by_post_safe_frames", {
      sourceBotId,
      postHitSafeFrames: state.postHitSafeFrames,
    });
    return;
  }
  if (state.invincible > 0) {
    debugLog("hits", "suppressed_by_invincibility", {
      sourceBotId,
      invincible: state.invincible,
    });
    return;
  }
  if (now - state.lastHitAt < BOT_HIT_COOLDOWN_MS) {
    debugLog("hits", "suppressed_by_hit_cooldown", {
      sourceBotId,
      deltaMs: now - state.lastHitAt,
    });
    return;
  }

  state.lastHitAt = now;
  state.lastHitByBotId = sourceBotId;
  state.hitCount += 1;
  state.campaignRisk.recentHits = Math.min(
    6,
    state.campaignRisk.recentHits + 1.25,
  );
  state.campaignRisk.nearMisses = Math.max(
    0,
    state.campaignRisk.nearMisses - 0.6,
  );
  debugLog("hits", "detected", { sourceBotId, hitCount: state.hitCount });

  if (state.shield > 0.2) {
    state.shield = Math.max(
      0,
      state.shield - (0.3 - loadoutStats.shieldRetention),
    );
  } else {
    loseLife();
    debugLog("hits", "life_decremented", { lives: state.lives });
  }
  state.invincible = loadoutStats.invincibleDuration;
  state.postHitSafeFrames = POST_HIT_SAFE_FRAMES;

  for (let i = 0; i < bots.length; i += 1) {
    const bot = bots[i];
    if (bot.position.distanceToSquared(player.position) < 26 * 26) {
      bot.prevPosition.copy(bot.position);
    }
  }

  if (state.lives <= 0) {
    awardRunProgress("fail");
    dispatchGameAction("retry");
    debugLog("hits", "restart_triggered");
  }
}

function getSteer() {
  if (input.touchEnabled) {
    return input.touchSteer;
  }
  if (input.pointerActive) {
    const delta =
      (input.pointerStartX - input.pointerX) / (window.innerWidth * 0.4);
    return THREE.MathUtils.clamp(delta, -1, 1);
  }
  return (input.left ? -1 : 0) + (input.right ? 1 : 0);
}

function angleDifference(a, b) {
  let diff = b - a;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

function hasMovementInput() {
  return (
    input.throttle ||
    input.brake ||
    input.left ||
    input.right ||
    Math.abs(input.touchSteer) > 0.08
  );
}

function startRun(resetLives = false) {
  overlay.classList.remove("show");
  message.classList.remove("show");
  document.body.classList.add("playing");
  setMenuOpen(false);
  if (resetLives) {
    state.lives = 3;
    state.livesPulse = 0;
    state.score = 0;
  }
  state.running = true;
  savePersistentState();
  resetLevel();
}

function dispatchGameAction(action) {
  if (action === "retry") {
    showMessage(
      "System Critical",
      "The hunters caught you. Press Enter to retry.",
      "Retry",
      "retry",
    );
    return;
  }
  if (action === "start") {
    startRun(true);
    return;
  }
  if (action === "restart-level") {
    startRun(false);
    return;
  }
  if (action === "restart-current") {
    startRun(true);
    return;
  }
  if (action === "message-next") {
    if (!message.classList.contains("show")) return;
    message.classList.remove("show");
    if (
      state.pendingAction === "retry" ||
      state.pendingAction === "restart-current"
    )
      startRun(true);
    else advanceNext();
  }
}

function showMessage(title, body, nextLabel = "Next", action = "next") {
  messageTitle.textContent = title;
  messageBody.textContent = body;
  nextBtn.textContent = nextLabel;
  retryBtn.hidden = action === "retry" || action === "restart-current";
  message.classList.add("show");
  document.body.classList.remove("playing");
  state.running = false;
  state.pendingAction = action;
}

function awardRunProgress(reason = "complete") {
  const matchGoals = player.matchStats?.goals ?? 0;
  const matchShots = player.matchStats?.shots ?? 0;
  const scoreAward = isMaxMode()
    ? (maxMode.blueScore + matchGoals + matchShots) * 160
    : Math.max(120, Math.floor(state.score));
  const modeKey = settings.id4Mode || ID4_MODE_DEFAULT;
  const medal =
    scoreAward > 2600
      ? "Inferno"
      : scoreAward > 1600
        ? "Gold"
        : scoreAward > 850
          ? "Silver"
          : "Bronze";
  state.progression.runs += 1;
  state.progression.xp +=
    reason === "complete" ? 300 + Math.floor(scoreAward / 8) : 100;
  state.progression.bestScore = Math.max(
    state.progression.bestScore,
    scoreAward,
  );
  state.progression.medals[modeKey] = medal;
  if (modeKey === "tutorial") state.progression.completedTutorial = true;
  refreshProgressionUi();
  savePersistentState();
  return { scoreAward, medal };
}

function completeLevel() {
  const reward = awardRunProgress("complete");
  if (isMaxMode()) {
    showMessage(
      "Blue Team Wins",
      `Arena complete. ${reward.medal} medal, +XP banked. Press Enter to replay.`,
      "Replay",
      "restart-current",
    );
    return;
  }
  const world = getWorld();
  const level = getLevel();
  const nextProgress = getNextProgressIndices();
  try {
    const payload = {
      worldIndex: nextProgress.worldIndex,
      levelIndex: nextProgress.levelIndex,
      settings: {
        difficulty: settings.difficulty,
        campaignAiMode: settings.campaignAiMode,
        invertSteer: settings.invertSteer,
        cameraFocus: settings.cameraFocus,
        rampDensity: settings.rampDensity,
        deviceMode: settings.deviceMode,
        activeGameMode: settings.activeGameMode,
        id4Mode: settings.id4Mode,
        reducedMotion: settings.reducedMotion,
        audioEnabled: settings.audioEnabled,
      },
      progression: {
        ...state.progression,
        medals: { ...state.progression.medals },
      },
      customization: {
        bodyId: customization.bodyId,
        wheelId: customization.wheelId,
        styleId: customization.styleId,
        powerId: customization.powerId,
        paintId: customization.paintId,
        accentId: customization.accentId,
        tintId: customization.tintId,
        spoilerId: customization.spoilerId,
        glowId: customization.glowId,
      },
    };
    localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    debugLog("menu", "save_failed", error?.message || error);
  }
  const isLastLevel = state.levelIndex === world.levels.length - 1;
  if (isLastLevel) {
    const isLastWorld = state.worldIndex === worldData.length - 1;
    if (isLastWorld) {
      showMessage(
        "Champion Crowned",
        `You outran every hunter. ${reward.medal} medal saved. Press Enter to restart.`,
        "Restart Saga",
      );
    } else {
      showMessage(
        `World Cleared: ${world.name}`,
        `New realm unlocked. ${reward.medal} medal and XP saved. Press Enter to ignite.`,
      );
    }
  } else {
    showMessage(
      `Level Cleared: ${level.name}`,
      `Momentum locked. ${reward.medal} medal and XP saved.`,
    );
  }
}

function advanceNext() {
  const world = getWorld();
  if (state.levelIndex < world.levels.length - 1) {
    state.levelIndex += 1;
  } else if (state.worldIndex < worldData.length - 1) {
    state.worldIndex += 1;
    state.levelIndex = 0;
  } else {
    state.worldIndex = 0;
    state.levelIndex = 0;
  }
  savePersistentState();
  startRun();
}

let lastTime = performance.now();
function animate(now) {
  const dt = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;
  stepGame(dt);
  requestAnimationFrame(animate);
}

window.addEventListener("resize", () => {
  if (settings.deviceMode === "auto") applyDeviceProfile();
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
});

window.addEventListener(
  "pointerdown",
  (event) => {
    if (event.pointerType === "touch") updateAutoInputMode("touch");
    if (event.pointerType === "mouse") updateAutoInputMode("desktop");
  },
  { capture: true },
);

window.addEventListener("keydown", (event) => {
  updateAutoInputMode("desktop");
  if (
    event.code === "Space" ||
    event.code === "ControlLeft" ||
    event.code === "ControlRight" ||
    event.code === "MetaLeft" ||
    event.code === "MetaRight"
  ) {
    event.preventDefault();
  }
  if (event.code === "KeyC") event.preventDefault();
  if (event.code === "KeyX") event.preventDefault();
  if (event.code === "ArrowLeft" || event.code === "KeyA") input.left = true;
  if (event.code === "ArrowRight" || event.code === "KeyD") input.right = true;
  if (event.code === "ArrowUp" || event.code === "KeyW") input.throttle = true;
  if (event.code === "ArrowDown" || event.code === "KeyS") input.brake = true;
  if (event.code === "Space") {
    if (isMaxMode()) performMaxBallLunge();
    else input.drift = true;
  }
  if (event.code === "ShiftLeft" || event.code === "ShiftRight")
    input.boost = true;
  if (
    event.code === "ControlLeft" ||
    event.code === "ControlRight" ||
    event.code === "MetaLeft" ||
    event.code === "MetaRight"
  ) {
    if (isMaxMode() && !event.repeat) performMaxBotLunge();
  }
  if (event.code === "KeyC") input.backflip = true;
  if (event.code === "KeyX") attemptDevJump();
  if (event.code === "KeyC") attemptBackflip();
  if (event.code === "KeyL" && isMaxMode() && !event.repeat) {
    state.ballCam = !state.ballCam;
    setEffectToast(state.ballCam ? "Ball Cam On" : "Ball Cam Off");
  }
  if (event.code === "KeyR") dispatchGameAction("restart-level");
  if (event.code === "KeyM") setMenuOpen(true);
  if (event.code === "Enter") {
    if (overlay.classList.contains("show")) {
      dispatchGameAction("start");
    } else if (message.classList.contains("show")) {
      dispatchGameAction("message-next");
    }
  }
  if (event.code === "Escape") {
    setMenuOpen(!isMenuOpen());
  }
  debugLog("input", "keydown", event.code);
});

window.addEventListener("keyup", (event) => {
  if (
    event.code === "Space" ||
    event.code === "ControlLeft" ||
    event.code === "ControlRight" ||
    event.code === "MetaLeft" ||
    event.code === "MetaRight"
  ) {
    event.preventDefault();
  }
  if (event.code === "ArrowLeft" || event.code === "KeyA") input.left = false;
  if (event.code === "ArrowRight" || event.code === "KeyD") input.right = false;
  if (event.code === "ArrowUp" || event.code === "KeyW") input.throttle = false;
  if (event.code === "ArrowDown" || event.code === "KeyS") input.brake = false;
  if (event.code === "Space" && !isMaxMode()) input.drift = false;
  if (event.code === "ShiftLeft" || event.code === "ShiftRight")
    input.boost = false;
  if (event.code === "KeyC") input.backflip = false;
  debugLog("input", "keyup", event.code);
});

canvas.addEventListener("pointerdown", (event) => {
  updateAutoInputMode(event.pointerType === "touch" ? "touch" : "desktop");
  input.pointerActive = true;
  input.pointerStartX = event.clientX;
  input.pointerX = event.clientX;
});

canvas.addEventListener("pointermove", (event) => {
  if (!input.pointerActive) return;
  input.pointerX = event.clientX;
});

window.addEventListener("pointerup", () => {
  input.pointerActive = false;
});

function updateTouchInput(clientX, clientY) {
  const deviceAssist = getDeviceAssistTuning();
  const rect = touchSteerPad.getBoundingClientRect();
  const cx = rect.left + rect.width * 0.5;
  const cy = rect.top + rect.height * 0.5;
  const dx = clientX - cx;
  const dy = clientY - cy;
  const radius = rect.width * 0.42;
  const dist = Math.hypot(dx, dy);
  const clampedDist = Math.min(radius, dist);
  const nx = dist > 0 ? dx / dist : 0;
  const ny = dist > 0 ? dy / dist : 0;
  const knobX = nx * clampedDist;
  const knobY = ny * clampedDist;
  touchSteerPad.classList.add("active");
  touchSteerKnob.style.transform = `translate(${knobX}px, ${knobY}px)`;
  const normalizedX = THREE.MathUtils.clamp(knobX / radius, -1, 1);
  const curvedSteer =
    Math.sign(normalizedX) * Math.pow(Math.abs(normalizedX), 1.45);
  input.touchSteerTarget =
    Math.abs(curvedSteer) < deviceAssist.touchDeadzone
      ? 0
      : THREE.MathUtils.clamp(
          curvedSteer * deviceAssist.touchSteerScale,
          -1,
          1,
        );
  input.touchSteer +=
    (input.touchSteerTarget - input.touchSteer) *
    THREE.MathUtils.clamp(deviceAssist.touchResponse, 0.08, 0.35);
  input.throttle = clampedDist > radius * 0.14 || ny < -0.08;
  input.brake = ny > 0.38 && clampedDist > radius * 0.28;
}

function resetTouchSteer() {
  input.touchSteer = 0;
  input.touchSteerTarget = 0;
  touchSteerPad.classList.remove("active");
  touchSteerKnob.style.transform = "translate(0px, 0px)";
  input.throttle = false;
  input.brake = false;
}

function bindPressAction(element, handler) {
  if (!element) return;
  let lastTouchActionAt = 0;
  element.addEventListener("pointerup", (event) => {
    if (event.pointerType === "mouse") return;
    event.preventDefault();
    lastTouchActionAt = performance.now();
    handler(event);
  });
  element.addEventListener("click", (event) => {
    if (performance.now() - lastTouchActionAt < 450) return;
    handler(event);
  });
}

function initTouchControls() {
  if (!touchSteerPad) return;
  touchSteerPad.style.touchAction = "none";
  touchSteerPad.addEventListener("pointerdown", (event) => {
    if (!input.touchEnabled) return;
    event.preventDefault();
    updateAutoInputMode("touch");
    touchSteerPad.setPointerCapture(event.pointerId);
    updateTouchInput(event.clientX, event.clientY);
  });
  touchSteerPad.addEventListener("pointermove", (event) => {
    if (!input.touchEnabled) return;
    event.preventDefault();
    if (event.pressure === 0 && event.buttons === 0) return;
    updateTouchInput(event.clientX, event.clientY);
  });
  const endSteer = () => resetTouchSteer();
  touchSteerPad.addEventListener("pointerup", endSteer);
  touchSteerPad.addEventListener("pointercancel", endSteer);
  touchSteerPad.addEventListener("pointerleave", endSteer);

  touchDrift.addEventListener("pointerdown", () => {
    if (input.touchEnabled) {
      updateAutoInputMode("touch");
      if (isMaxMode()) performMaxBallLunge();
      else input.drift = true;
    }
  });
  touchDrift.addEventListener("pointerup", () => {
    if (input.touchEnabled && !isMaxMode()) input.drift = false;
  });
  touchDrift.addEventListener("pointerleave", () => {
    if (input.touchEnabled && !isMaxMode()) input.drift = false;
  });
  touchBoost.addEventListener("pointerdown", () => {
    if (input.touchEnabled) {
      updateAutoInputMode("touch");
      input.boost = true;
    }
  });
  touchBoost.addEventListener("pointerup", () => {
    if (input.touchEnabled) input.boost = false;
  });
  touchBoost.addEventListener("pointerleave", () => {
    if (input.touchEnabled) input.boost = false;
  });
  if (touchJump) {
    bindPressAction(touchJump, () => {
      if (input.touchEnabled) {
        updateAutoInputMode("touch");
        attemptDevJump();
      }
    });
  }
  if (touchBackflip) {
    touchBackflip.addEventListener("pointerdown", () => {
      if (!input.touchEnabled) return;
      updateAutoInputMode("touch");
      if (isMaxMode()) {
        performMaxBotLunge();
      } else {
        input.backflip = true;
        attemptBackflip();
      }
    });
    const clearBackflip = () => {
      input.backflip = false;
    };
    touchBackflip.addEventListener("pointerup", clearBackflip);
    touchBackflip.addEventListener("pointercancel", clearBackflip);
    touchBackflip.addEventListener("pointerleave", clearBackflip);
  }
}

bindPressAction(startBtn, () => startRun(true));
bindPressAction(tutorialBtn, () => {
  tips.style.display = tips.style.display === "none" ? "grid" : "none";
});
bindPressAction(nextBtn, () => {
  dispatchGameAction("message-next");
});
bindPressAction(retryBtn, () => {
  message.classList.remove("show");
  if (state.pendingAction === "retry") {
    dispatchGameAction("start");
  } else {
    dispatchGameAction("restart-level");
  }
});

bindPressAction(menuBtn, () => {
  setMenuOpen(true);
});
bindPressAction(menuClose, () => {
  setMenuOpen(false);
});

tabButtons.forEach((button) => {
  bindPressAction(button, () => {
    if (button.hidden) return;
    setActiveTab(button.dataset.tab);
  });
});

gameCards.forEach((card) => {
  bindPressAction(card, () => {
    const nextMode = card.dataset.gameMode;
    setActiveGameMode(nextMode, { save: true, reset: state.running });
    setActiveTab("games");
    setEffectToast(
      nextMode === GAME_MODE_MAX1 || nextMode === GAME_MODE_RISK
        ? "Max Arena Ready"
        : "Campaign Ready",
    );
  });
});

id4ModeCards.forEach((card) => {
  bindPressAction(card, () => {
    setId4Mode(card.dataset.id4Mode, { save: true, reset: state.running });
    setActiveTab("games");
  });
});

onlineConnectBtn?.addEventListener("click", () => connectOnline());
onlineDisconnectBtn?.addEventListener("click", () => {
  onlineState.socket?.close();
  onlineState.socket = null;
  onlineState.status = "offline";
  onlineState.room = null;
  refreshOnlineUi();
});
onlineCreateRoomBtn?.addEventListener("click", () => {
  if (onlineState.status !== "live") connectOnline();
  sendOnline({
    type: "room.create",
    mode: onlinePlaylistSelect?.value ?? settings.id4Mode,
    size: onlinePlaylistSelect?.value === "ranked" ? 2 : 6,
    ranked: onlinePlaylistSelect?.value === "ranked",
    botFill: onlineBotfillToggle?.checked ?? true,
  });
});
onlineJoinRoomBtn?.addEventListener("click", () => {
  if (onlineState.status !== "live") connectOnline();
  sendOnline({
    type: "room.join",
    code: onlineRoomCodeInput?.value?.trim()?.toUpperCase() ?? "",
    botFill: onlineBotfillToggle?.checked ?? true,
  });
});
onlineQueueBtn?.addEventListener("click", () => {
  if (onlineState.status !== "live") connectOnline();
  sendOnline({
    type: "queue.join",
    mode: onlinePlaylistSelect?.value ?? settings.id4Mode,
    size: onlinePlaylistSelect?.value === "ranked" ? 2 : 6,
    ranked: onlinePlaylistSelect?.value === "ranked",
    botFill: onlineBotfillToggle?.checked ?? true,
  });
});
onlineChatSend?.addEventListener("click", () => {
  const text = onlineChatInput?.value?.trim() ?? "";
  if (!text) return;
  if (sendOnline({ type: "chat.send", text }) && onlineChatInput) {
    onlineChatInput.value = "";
  }
});
onlineChatInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") onlineChatSend?.click();
});
onlineQuickChatButtons.forEach((button) => {
  button.addEventListener("click", () => {
    sendOnline({ type: "quick.send", text: button.dataset.quickChat });
  });
});
onlineServerUrlInput?.addEventListener("change", () => {
  const normalized = normalizeServerUrl(onlineServerUrlInput.value);
  onlineServerUrlInput.value = normalized;
  if (normalized) localStorage.setItem("infernoDrift4.serverUrl", normalized);
  else localStorage.removeItem("infernoDrift4.serverUrl");
  refreshOnlineUi();
});
onlineUsernameInput?.addEventListener("change", () => {
  localStorage.setItem(
    "infernoDrift4.username",
    onlineUsernameInput.value.trim() || "Drifter",
  );
});

difficultySelect.addEventListener("change", (event) => {
  const previousDifficulty = settings.difficulty;
  settings.difficulty = event.target.value;
  clearBotState();
  spawnBots();
  state.noBotsRecoveryTimer = 0;
  state.padSpeedTimer = 0;
  state.padSpeedMult = 1;
  debugLog("menu", "difficulty_changed", {
    from: previousDifficulty,
    to: settings.difficulty,
    running: state.running,
    speed: player.speed,
    throttle: input.throttle,
    brake: input.brake,
  });
  savePersistentState();
});

campaignAiSelect?.addEventListener("change", (event) => {
  settings.campaignAiMode = event.target.value === "risk" ? "risk" : "normal";
  resetCampaignRiskMemory();
  refreshDevModeUi();
  savePersistentState();
});

maxDifficultySelect?.addEventListener("change", (event) => {
  settings.maxDifficulty = MAX_DIFFICULTY_PROFILES[event.target.value]
    ? event.target.value
    : MAX_DIFFICULTY_CLASSIC;
  applyPlayerCustomization();
  if (isMaxMode()) {
    if (state.running) {
      resetLevel();
    } else {
      buildWorld();
      spawnBots();
      updateHud();
    }
  }
  refreshGamesUi();
  refreshDevModeUi();
  savePersistentState();
});

if (rampDensitySelect) {
  rampDensitySelect.addEventListener("change", (event) => {
    settings.rampDensity = event.target.value;
    buildWorld();
    savePersistentState();
  });
}

if (devModeToggle) {
  const handleDevModeToggle = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const wantsDevMode = !settings.devMode;
    if (wantsDevMode) {
      const password = window.prompt("Enter Dev Mode password");
      if (!DEV_MODE_PASSWORDS.includes((password ?? "").trim().toLowerCase())) {
        setDevMode(false, { save: false, announce: false });
        setEffectToast("Dev Mode Locked");
        return;
      }
      setDevMode(true);
    } else {
      setDevMode(false);
    }
    window.setTimeout(refreshDevModeUi, 0);
  };
  devModeToggle.addEventListener("pointerdown", (event) => {
    event.preventDefault();
  });
  devModeToggle.addEventListener("click", handleDevModeToggle);
  devModeToggle.addEventListener("change", (event) => {
    event.preventDefault();
    refreshDevModeUi();
  });
}

if (devPlayerSpeed) {
  devPlayerSpeed.addEventListener("input", (event) => {
    if (!settings.devMode) return;
    setDevTuningValue("playerSpeedMult", Number(event.target.value) / 100);
  });
}

if (devBotSpeed) {
  devBotSpeed.addEventListener("input", (event) => {
    if (!settings.devMode) return;
    setDevTuningValue("botSpeedMult", Number(event.target.value) / 100);
  });
}

if (devInfiniteBoost) {
  devInfiniteBoost.addEventListener("change", (event) => {
    if (!settings.devMode) return;
    setDevTuningValue("infiniteBoost", event.target.checked);
  });
}

if (devInvulnerable) {
  devInvulnerable.addEventListener("change", (event) => {
    if (!settings.devMode) return;
    setDevTuningValue("invulnerable", event.target.checked);
  });
}

if (devFreezeBots) {
  devFreezeBots.addEventListener("change", (event) => {
    if (!settings.devMode) return;
    setDevTuningValue("freezeBots", event.target.checked);
  });
}

if (devMaxDemoToggle) {
  devMaxDemoToggle.addEventListener("change", (event) => {
    if (!settings.devMode) return;
    setDevTuningValue("allowDemolitions", event.target.checked);
  });
}

if (devMaxReplayToggle) {
  devMaxReplayToggle.addEventListener("change", (event) => {
    if (!settings.devMode) return;
    setDevTuningValue("allowReplay", event.target.checked);
  });
}

if (devMaxBoostVariant) {
  devMaxBoostVariant.addEventListener("change", (event) => {
    if (!settings.devMode) return;
    setDevTuningValue("maxBoostVariant", event.target.value);
  });
}

if (devWorldModifierSelect) {
  devWorldModifierSelect.addEventListener("change", (event) => {
    if (!settings.devMode) return;
    setDevTuningValue("worldModifier", event.target.value);
  });
}

if (devWorldSelect) {
  devWorldSelect.addEventListener("change", (event) => {
    if (!settings.devMode || isMaxMode()) return;
    jumpToCampaignLevel(Number(event.target.value), 0);
  });
}

if (devLevelSelect) {
  devLevelSelect.addEventListener("change", (event) => {
    if (!settings.devMode || isMaxMode()) return;
    jumpToCampaignLevel(state.worldIndex, Number(event.target.value));
  });
}

if (devDebugHud) {
  devDebugHud.addEventListener("change", (event) => {
    if (!settings.devMode) return;
    setDebugFlagsEnabled(event.target.checked);
    refreshDevModeUi();
  });
}

if (devDebugLogs) {
  devDebugLogs.addEventListener("change", (event) => {
    if (!settings.devMode) return;
    const enabled = event.target.checked;
    DEBUG_FLAGS.enabled = enabled || DEBUG_FLAGS.enabled;
    DEBUG_FLAGS.world = enabled;
    DEBUG_FLAGS.menu = enabled;
    DEBUG_FLAGS.hits = enabled;
    DEBUG_FLAGS.ramps = enabled;
    DEBUG_FLAGS.powerups = enabled;
    DEBUG_FLAGS.minimap = enabled;
    if (!enabled && !devDebugHud?.checked) {
      setDebugFlagsEnabled(false);
    }
    refreshDevModeUi();
  });
}

bindPressAction(devRefillBoost, () => {
  if (!settings.devMode) return;
  state.boost = 1;
  state.padSpeedTimer = Math.max(state.padSpeedTimer, 2.2);
  state.padSpeedMult = Math.max(state.padSpeedMult, 1.3);
  setEffectToast("Boost Refilled");
});

bindPressAction(devRefillShield, () => {
  if (!settings.devMode) return;
  if (isMaxMode()) {
    player.maxHealth = MAX_HEALTH_MAX;
    setEffectToast("Health Refilled");
  } else {
    state.shield = 1;
    state.shieldTimer = Math.max(state.shieldTimer, 10);
    setEffectToast("Shield Refilled");
  }
});

bindPressAction(devCoolBots, () => {
  if (!settings.devMode) return;
  state.heat = 0;
  state.slowBotsTimer = Math.max(state.slowBotsTimer, 8);
  setEffectToast("Bots Cooled");
});

bindPressAction(devHeal, () => {
  if (!settings.devMode) return;
  state.lives = 5;
  state.livesPulse = 1;
  renderLivesHud();
  setEffectToast("Lives Maxed");
});

bindPressAction(devClearLevel, () => {
  if (!settings.devMode) return;
  if (isMaxMode()) {
    maxMode.blueScore = MAX_MODE_GOAL_TARGET - 1;
    scoreMaxGoal("blue");
  } else {
    completeLevel();
  }
});

bindPressAction(devResetMatch, () => {
  if (!settings.devMode || !isMaxMode()) return;
  resetMaxMatch();
  setEffectToast("Arena Reset");
});

bindPressAction(devResetScore, () => {
  if (!settings.devMode || !isMaxMode()) return;
  maxMode.blueScore = 0;
  maxMode.redScore = 0;
  state.overtime = false;
  resetMaxMatchState();
  setEffectToast("Score Reset");
});

bindPressAction(devTriggerReplay, () => {
  if (!settings.devMode || !isMaxMode() || !devTuning.allowReplay) return;
  if (maxMode.stats?.lastGoal?.replayFrames?.length) {
    startGoalReplay(
      maxMode.stats.lastGoal.replayFrames,
      maxMode.stats.lastGoal.meta,
    );
  }
});

bindPressAction(devForceDemo, () => {
  if (!settings.devMode || !isMaxMode()) return;
  const target = bots.find((bot) => bot.team === "red" && !bot.demolished);
  if (!target) return;
  demolishCar(target, player, "forced");
});

bindPressAction(devResetTuning, () => {
  if (!settings.devMode) return;
  resetDevTuning();
  setEffectToast("Dev Tweaks Reset");
});

invertToggle.addEventListener("change", (event) => {
  settings.invertSteer = event.target.checked;
  savePersistentState();
});

cameraToggle.addEventListener("change", (event) => {
  settings.cameraFocus = event.target.checked;
  savePersistentState();
});

function handleCustomizationChange(group, key, fallbackId, event) {
  const selected = getOptionById(group, event.target.value, fallbackId);
  const cosmeticKeys = new Set(["paintId", "accentId", "tintId", "glowId"]);
  const usingMaxTeamSkin = isMaxMode() && player.team && cosmeticKeys.has(key);
  if (!usingMaxTeamSkin && !isOptionUnlocked(selected)) {
    refreshCustomizationMenu();
    return;
  }
  if (usingMaxTeamSkin) {
    maxTeamCustomization[player.team][key] = selected.id;
  } else {
    customization[key] = selected.id;
  }
  applyPlayerCustomization();
  savePersistentState();
}

if (bodySelect) {
  bodySelect.addEventListener("change", (event) => {
    handleCustomizationChange(
      BODY_OPTIONS,
      "bodyId",
      DEFAULT_CUSTOMIZATION.bodyId,
      event,
    );
  });
}

if (wheelSelect) {
  wheelSelect.addEventListener("change", (event) => {
    handleCustomizationChange(
      WHEEL_OPTIONS,
      "wheelId",
      DEFAULT_CUSTOMIZATION.wheelId,
      event,
    );
  });
}

if (styleSelect) {
  styleSelect.addEventListener("change", (event) => {
    handleCustomizationChange(
      STYLE_OPTIONS,
      "styleId",
      DEFAULT_CUSTOMIZATION.styleId,
      event,
    );
  });
}

if (powerSelect) {
  powerSelect.addEventListener("change", (event) => {
    handleCustomizationChange(
      POWER_OPTIONS,
      "powerId",
      DEFAULT_CUSTOMIZATION.powerId,
      event,
    );
  });
}

if (paintSelect) {
  paintSelect.addEventListener("change", (event) => {
    handleCustomizationChange(
      PAINT_OPTIONS,
      "paintId",
      DEFAULT_CUSTOMIZATION.paintId,
      event,
    );
  });
}

if (accentSelect) {
  accentSelect.addEventListener("change", (event) => {
    handleCustomizationChange(
      ACCENT_OPTIONS,
      "accentId",
      DEFAULT_CUSTOMIZATION.accentId,
      event,
    );
  });
}

if (tintSelect) {
  tintSelect.addEventListener("change", (event) => {
    handleCustomizationChange(
      TINT_OPTIONS,
      "tintId",
      DEFAULT_CUSTOMIZATION.tintId,
      event,
    );
  });
}

if (spoilerSelect) {
  spoilerSelect.addEventListener("change", (event) => {
    handleCustomizationChange(
      SPOILER_OPTIONS,
      "spoilerId",
      DEFAULT_CUSTOMIZATION.spoilerId,
      event,
    );
  });
}

if (glowSelect) {
  glowSelect.addEventListener("change", (event) => {
    handleCustomizationChange(
      GLOW_OPTIONS,
      "glowId",
      DEFAULT_CUSTOMIZATION.glowId,
      event,
    );
  });
}

if (deviceModeSelect) {
  deviceModeSelect.addEventListener("change", (event) => {
    settings.deviceMode = event.target.value;
    state.deviceInputMode =
      settings.deviceMode === "auto"
        ? "auto"
        : settings.deviceMode === "desktop"
          ? "desktop"
          : "touch";
    applyDeviceProfile();
    savePersistentState();
  });
}

window.render_game_to_text = () => {
  const currentCustomization = getCurrentCustomization();
  const dims = getMaxArenaDimensions();
  const payload = {
    mode: isMaxMode() ? GAME_MODE_MAX1 : GAME_MODE_ID33,
    id4Mode: settings.id4Mode,
    objective: getId4ModeRule().objective,
    note: "origin center, +x right, +z north/forward, +y up",
    running: state.running,
    replay: maxMode.replayActive,
    player: {
      x: Number(player.position.x.toFixed(2)),
      y: Number(player.position.y.toFixed(2)),
      z: Number(player.position.z.toFixed(2)),
      speed_mph: Math.round(Math.abs(player.speed) * SPEED_TO_MPH_MULT),
      boost: Number(state.boost.toFixed(2)),
      demolished: Boolean(player.demolished),
      skin: {
        paint: currentCustomization.paint.id,
        accent: currentCustomization.accent.id,
        tint: currentCustomization.tint.id,
        glow: currentCustomization.glow.id,
      },
    },
    hud: {
      time: Number(state.timeLeft.toFixed(2)),
      effect: state.effectToast || "",
      score: isMaxMode()
        ? { blue: maxMode.blueScore, red: maxMode.redScore }
        : Math.floor(state.score),
    },
    objectiveState: {
      label: state.modeObjective?.label ?? "",
      type: state.modeObjective?.type ?? "",
      progress: Number((state.modeObjective?.progress ?? 0).toFixed(2)),
      target: Number((state.modeObjective?.target ?? 0).toFixed(2)),
      minigameId: state.modeObjective?.minigameId ?? "",
      completed: Boolean(state.modeObjective?.completed),
    },
    radar: state.radarSnapshot,
    online: {
      status: onlineState.status,
      connected: onlineState.socket?.readyState === WebSocket.OPEN,
      roomCode: onlineState.room?.code ?? null,
      latencyMs: onlineState.latencyMs,
      players: onlineState.room?.players?.length ?? 0,
      bots: onlineState.room?.bots ?? null,
    },
    device: {
      mode: state.deviceProfile?.mode ?? settings.deviceMode,
      type: state.deviceProfile?.type ?? "desktop",
      touchActive: Boolean(input.touchEnabled),
      minimapSize:
        state.deviceProfile?.minimapSize ?? DEVICE_PROFILES.desktop.minimapSize,
    },
    camera: {
      distance: Number(state.cameraTelemetry.distance.toFixed(2)),
      height: Number(state.cameraTelemetry.height.toFixed(2)),
      lookAhead: Number(state.cameraTelemetry.lookAhead.toFixed(2)),
      ballCam: Boolean(state.cameraTelemetry.ballCam),
    },
    ball: maxMode.ball
      ? {
          x: Number(maxMode.ball.position.x.toFixed(2)),
          y: Number(maxMode.ball.position.y.toFixed(2)),
          z: Number(maxMode.ball.position.z.toFixed(2)),
          vx: Number(maxMode.ballVelocity.x.toFixed(2)),
          vy: Number(maxMode.ballVelocity.y.toFixed(2)),
          vz: Number(maxMode.ballVelocity.z.toFixed(2)),
        }
      : null,
    bots: bots.slice(0, 6).map((bot) => ({
      team: bot.team ?? "hunter",
      role: bot.role ?? "bot",
      x: Number(bot.position.x.toFixed(2)),
      y: Number(bot.position.y.toFixed(2)),
      z: Number(bot.position.z.toFixed(2)),
      demolished: Boolean(bot.demolished),
    })),
    stats: isMaxMode()
      ? {
          difficulty: settings.maxDifficulty,
          progression: state.progression,
          arena: {
            scale: Number(dims.scale.toFixed(2)),
            halfWidth: dims.halfWidth,
            halfLength: dims.halfLength,
          },
          player: player.matchStats,
          latest: maxMode.stats?.events?.[0] ?? null,
          risk: maxMode.riskMemory,
        }
      : {
          mode: settings.campaignAiMode,
          progression: state.progression,
          campaignRisk: state.campaignRisk,
        },
  };
  return JSON.stringify(payload);
};

window.advanceTime = (ms) => {
  const steps = Math.max(1, Math.round(ms / (1000 / 60)));
  state.steppingExternally = true;
  for (let i = 0; i < steps; i += 1) {
    stepGame(1 / 60);
  }
  state.steppingExternally = false;
};

window.__infernodriftTestApi = {
  forceMaxGoal: (team = "blue") => {
    if (!isMaxMode()) return false;
    scoreMaxGoal(team);
    return true;
  },
  setMaxBallState: ({
    x = 0,
    y = MAX_BALL_RADIUS,
    z = 0,
    vx = 0,
    vy = 0,
    vz = 0,
  } = {}) => {
    if (!maxMode.ball) return false;
    maxMode.ball.position.set(x, y, z);
    maxMode.ballVelocity.set(vx, vy, vz);
    return true;
  },
  getReplayState: () => ({
    active: maxMode.replayActive,
    meta: maxMode.replayMeta,
    frames: maxMode.replayFrames.length,
  }),
  getMatchStats: () => ({
    player: player.matchStats,
    teams: maxMode.stats?.teams ?? null,
    events: maxMode.stats?.events ?? [],
  }),
  setDeviceMode: (mode = "auto") => {
    if (!DEVICE_PROFILES[mode] && mode !== "auto") return null;
    settings.deviceMode = mode;
    state.deviceInputMode =
      mode === "auto" ? "auto" : mode === "desktop" ? "desktop" : "touch";
    applyDeviceProfile();
    return state.deviceProfile;
  },
};

loadPersistentState();
if (!MAX_DIFFICULTY_PROFILES[settings.maxDifficulty])
  settings.maxDifficulty = MAX_DIFFICULTY_CLASSIC;
createFxPool();
initTouchControls();
difficultySelect.value = settings.difficulty;
if (campaignAiSelect) campaignAiSelect.value = settings.campaignAiMode;
if (maxDifficultySelect) maxDifficultySelect.value = settings.maxDifficulty;
invertToggle.checked = settings.invertSteer;
cameraToggle.checked = settings.cameraFocus;
if (rampDensitySelect) rampDensitySelect.value = settings.rampDensity;
if (devModeToggle) devModeToggle.checked = settings.devMode;
applyDeviceProfile();
refreshDevModeUi();
refreshGamesUi();
applyPlayerCustomization({ progress: getProgressSnapshot() });
resetLevel();
updateHud();
requestAnimationFrame(animate);
