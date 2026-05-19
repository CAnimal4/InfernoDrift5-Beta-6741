import * as THREE from "https://unpkg.com/three@0.161.0/build/three.module.js";

const canvas = document.getElementById("game");
const overlay = document.getElementById("overlay");
const schoolGate = document.getElementById("school-gate");
const schoolGateDetail = document.getElementById("school-gate-detail");
const schoolLeave = document.getElementById("school-leave");
const schoolContinue = document.getElementById("school-continue");
const message = document.getElementById("message");
const messageTitle = document.getElementById("message-title");
const messageBody = document.getElementById("message-body");
const messageStats = document.getElementById("message-stats");
const startBtn = document.getElementById("start-btn");
const startAccountUsername = document.getElementById("start-account-username");
const startAccountPassword = document.getElementById("start-account-password");
const startAccountAge = document.getElementById("start-account-age");
const startAccountSubmit = document.getElementById("start-account-submit");
const startAccountStatus = document.getElementById("start-account-status");
const overlaySubtitle = document.getElementById("overlay-subtitle");
const tutorialBtn = document.getElementById("tutorial-btn");
const tips = document.getElementById("tips");
const controlsRemap = document.getElementById("controls-remap");
const controllerStatus = document.getElementById("controller-status");
const howtoList = document.getElementById("howto-list");
const nextBtn = document.getElementById("next-btn");
const retryBtn = document.getElementById("retry-btn");
const helpBtn = document.getElementById("help-btn");
const boostBar = document.getElementById("boost-bar");
const shieldBar = document.getElementById("shield-bar");
const statusLabelNodes = document.querySelectorAll(".status .pill .label");
const effectToast = document.getElementById("effect-toast");
const dailyGiftNotice = document.getElementById("daily-gift");
const dailyGiftAmount = document.getElementById("daily-gift-amount");
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
const hudLabelNodes = document.querySelectorAll(
  ".hud .run-pill .label, .hud .drive-pill .label",
);
const hudWorldPill = hudWorld?.closest(".pill");
const hudLevelPill = hudLevel?.closest(".pill");
const hudTimePill = hudTime?.closest(".pill");
const hudScorePill = hudScore?.closest(".pill");
const hudSpeedPill = hudSpeed?.closest(".pill");
const hudLivesPill = hudLives?.closest(".pill");
const touchJump = document.getElementById("touch-jump");
const touchDrift = document.getElementById("touch-drift");
const touchBoost = document.getElementById("touch-boost");
const touchLaser = document.getElementById("touch-laser");
const touchBackflip = document.getElementById("touch-backflip");
const minimapCanvas = document.getElementById("minimap");
const minimapCtx = minimapCanvas ? minimapCanvas.getContext("2d") : null;
const menu = document.getElementById("menu");
const menuBtn = document.getElementById("menu-btn");
const menuFeedback = document.getElementById("menu-feedback");
const menuStateLabel = document.getElementById("menu-state-label");
const menuResume = document.getElementById("menu-resume");
const menuRestart = document.getElementById("menu-restart");
const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");
const gamesTabBtn = document.getElementById("games-tab-btn");
const modeBrief = document.getElementById("mode-brief");
const modeBoard = document.getElementById("mode-board");
const difficultySelect = document.getElementById("difficulty-select");
const campaignAiSelect = document.getElementById("campaign-ai-select");
const maxDifficultyField = document.getElementById("max-difficulty-field");
const maxDifficultySelect = document.getElementById("max-difficulty-select");
const invertToggle = document.getElementById("invert-toggle");
const cameraToggle = document.getElementById("camera-toggle");
const battleCockpitToggle = document.getElementById("battle-cockpit-toggle");
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
const progressPanel = document.getElementById("progress-panel");
const garagePreviewHost = document.getElementById("garage-preview");
const garageZoomIn = document.getElementById("garage-zoom-in");
const garageZoomOut = document.getElementById("garage-zoom-out");
const garageResetView = document.getElementById("garage-reset-view");
const loadoutSlots = document.getElementById("loadout-slots");
const carClassSelect = document.getElementById("car-class-select");
const garageClassSummary = document.getElementById("garage-class-summary");
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
const touchLayoutSelect = document.getElementById("touch-layout-select");
const touchScaleSelect = document.getElementById("touch-scale-select");
const exitLinkUrlInput = document.getElementById("exit-link-url");
const touchControlsRoot = document.getElementById("touch-controls");
const touchSteerPad = document.getElementById("touch-steer-pad");
const touchSteerKnob = document.getElementById("touch-steer-knob");
const onlineBackendUrlInput = document.getElementById("online-backend-url");
const onlineStatus = document.getElementById("online-status");
const onlineConnect = document.getElementById("online-connect");
const onlineDisconnect = document.getElementById("online-disconnect");
const onlineUsernameInput = document.getElementById("online-username");
const onlineAgeInput = document.getElementById("online-age");
const onlineClaim = document.getElementById("online-claim");
const onlineAgeNote = document.getElementById("online-age-note");
const onlineRoomMode = document.getElementById("online-room-mode");
const onlinePlaylist = document.getElementById("online-playlist");
const onlineTeamSize = document.getElementById("online-team-size");
const onlineBotFill = document.getElementById("online-bot-fill");
const onlineCreateRoom = document.getElementById("online-create-room");
const onlineQueue = document.getElementById("online-queue");
const onlineCancelQueue = document.getElementById("online-cancel-queue");
const onlineRoomCode = document.getElementById("online-room-code");
const onlineJoinRoom = document.getElementById("online-join-room");
const onlineShareRoom = document.getElementById("online-share-room");
const onlineRoomState = document.getElementById("online-room-state");
const onlinePopoutChat = document.getElementById("online-popout-chat");
const onlineQuickChat = document.getElementById("online-quick-chat");
const onlineChatLog = document.getElementById("online-chat-log");
const onlineChatInput = document.getElementById("online-chat-input");
const onlineChatSend = document.getElementById("online-chat-send");
const onlineLeaderboard = document.getElementById("online-leaderboard");
const onlineFriendName = document.getElementById("online-friend-name");
const onlineAddFriend = document.getElementById("online-add-friend");
const onlineFriendRequests = document.getElementById("online-friend-requests");
const onlineFriends = document.getElementById("online-friends");
const onlineRecent = document.getElementById("online-recent");
const profileDisplayName = document.getElementById("profile-display-name");
const profileStatusText = document.getElementById("profile-status-text");
const profileBadges = document.getElementById("profile-badges");
const profileLevel = document.getElementById("profile-level");
const profileXp = document.getElementById("profile-xp");
const profileSaveState = document.getElementById("profile-save-state");
const profileLeaderboardState = document.getElementById(
  "profile-leaderboard-state",
);
const profileRefresh = document.getElementById("profile-refresh");
const profileLogout = document.getElementById("profile-logout");
const profileDeleteConfirm = document.getElementById("profile-delete-confirm");
const profileDelete = document.getElementById("profile-delete");
const profileActionStatus = document.getElementById("profile-action-status");
const chatPopout = document.getElementById("chat-popout");
const chatPopoutClose = document.getElementById("chat-popout-close");
const chatPopoutQuick = document.getElementById("chat-popout-quick");
const chatPopoutLog = document.getElementById("chat-popout-log");
const chatPopoutInput = document.getElementById("chat-popout-input");
const chatPopoutSend = document.getElementById("chat-popout-send");
const chatNotice = document.getElementById("chat-notice");
const chatNoticeFrom = document.getElementById("chat-notice-from");
const chatNoticeText = document.getElementById("chat-notice-text");
const chatNoticeClose = document.getElementById("chat-notice-close");
const modeHelpCard = document.getElementById("mode-help-card");
const modeHelpTitle = document.getElementById("mode-help-title");
const modeHelpObjective = document.getElementById("mode-help-objective");
const modeHelpControls = document.getElementById("mode-help-controls");
const modeHelpScoring = document.getElementById("mode-help-scoring");
const modeHelpWin = document.getElementById("mode-help-win");
const modeHelpTip = document.getElementById("mode-help-tip");
const modeHelpResume = document.getElementById("mode-help-resume");
const modeHelpRestart = document.getElementById("mode-help-restart");
const feedbackModal = document.getElementById("feedback-modal");
const feedbackClose = document.getElementById("feedback-close");
const feedbackCancel = document.getElementById("feedback-cancel");
const feedbackSubmit = document.getElementById("feedback-submit");
const feedbackType = document.getElementById("feedback-type");
const feedbackMessage = document.getElementById("feedback-message");
const feedbackDiagnostics = document.getElementById("feedback-diagnostics");
const feedbackAge13 = document.getElementById("feedback-age-13");
const feedbackEmail = document.getElementById("feedback-email");
const feedbackStatus = document.getElementById("feedback-status");
const gameWrap = document.getElementById("game-wrap");
const remoteNameLayer = document.createElement("div");
remoteNameLayer.className = "remote-name-layer";
remoteNameLayer.setAttribute("aria-hidden", "true");
gameWrap?.appendChild(remoteNameLayer);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = false;

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
const PLAYER_BOOST_SPEED_MULT = 1.36;
const PLAYER_ACCEL_MULT = 1.2;
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
const SAVE_STORAGE_KEY = "infernoDrift4.save.v1";
const ACCOUNT_SAVE_STORAGE_PREFIX = "infernoDrift4.accountSave.v1:";
const LEGACY_SAVE_STORAGE_KEYS = ["infernoDrift3.save.v1"];
const ONLINE_STORAGE_KEY = "infernoDrift4.online.v1";
const FEEDBACK_STORAGE_KEY = "infernoDrift4.feedback.v1";
const EXIT_LINK_DEFAULT_URL = "https://lbusd.instructure.com/?login_success=1";
const EXIT_LINK_KEY_CODE = "KeyQ";
const ONLINE_PROGRESS_SYNC_INTERVAL_MS = 30_000;
const DAILY_GIFT_MIN_XP = 100;
const DAILY_GIFT_MAX_XP = 1000;
const DAILY_GIFT_STEP_XP = 25;
const ONLINE_PROTOCOL_VERSION = 1;
const LEGACY_PRODUCTION_BACKEND_URLS = new Set([
  "wss://infernodrift4-online.clarkbythebay.workers.dev/ws",
  "wss://infernodrift4-online.clarkbythebay.workers.dev/ws?room=global-v2",
]);
const DEFAULT_PRODUCTION_BACKEND_URL =
  "wss://infernodrift4-online.clarkbythebay.workers.dev/ws?room=global-v3";
const DEFAULT_LOCAL_BACKEND_URL = "ws://127.0.0.1:8787/ws";
const QUICK_CHAT_MESSAGES = [
  "Nice drift!",
  "Defending",
  "Need boost",
  "Passing left",
  "One more run",
  "Good save",
];
const SCHOOL_CLASS_SCHEDULE = {
  monday: [
    ["0 Period", "7:35", "8:35"],
    ["Period 1", "8:40", "9:31"],
    ["Period 2", "9:36", "10:27"],
    ["Period 3", "10:52", "11:43"],
    ["Period 4", "11:48", "12:39"],
    ["Period 5", "1:18", "2:09", "pm"],
    ["Period 6", "2:14", "3:05", "pm"],
  ],
  block: [
    ["0 Period", "7:35", "8:35"],
    ["Period 1/2", "8:40", "10:17"],
    ["Period 3/4", "10:41", "12:18"],
    ["Advisement/Tutorial", "12:53", "1:23", "pm"],
    ["Period 5/6", "1:28", "3:05", "pm"],
  ],
  friday: [
    ["Period 2", "9:10", "10:47"],
    ["Period 4", "11:12", "12:49"],
    ["Period 6", "1:28", "3:05", "pm"],
  ],
};

function schoolTimeToMinutes(value, meridiem = "") {
  const [hourPart, minutePart] = String(value).split(":");
  let hour = Number(hourPart);
  const minute = Number(minutePart);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return 0;
  if (String(meridiem).toLowerCase() === "pm" && hour < 12) hour += 12;
  return hour * 60 + minute;
}

function getSchoolScheduleForDate(date = new Date()) {
  const day = date.getDay();
  if (day === 0 || day === 6) return { dayType: "weekend", blocks: [] };
  if (day === 1)
    return {
      dayType: "monday",
      blocks: SCHOOL_CLASS_SCHEDULE.monday,
    };
  if (day >= 2 && day <= 4)
    return {
      dayType: "block",
      blocks: SCHOOL_CLASS_SCHEDULE.block,
    };
  return {
    dayType: "friday",
    blocks: SCHOOL_CLASS_SCHEDULE.friday,
  };
}

function getSchoolGateStatus(date = new Date()) {
  const { dayType, blocks } = getSchoolScheduleForDate(date);
  const minutes = date.getHours() * 60 + date.getMinutes();
  const classBlock = blocks.find(([label, start, end, meridiem]) => {
    const startMinutes = schoolTimeToMinutes(start, meridiem);
    const endMinutes = schoolTimeToMinutes(end, meridiem);
    return minutes >= startMinutes && minutes < endMinutes;
  });
  return {
    active: Boolean(classBlock),
    dayType,
    block: classBlock?.[0] ?? "",
    nowMinutes: minutes,
  };
}
const SEEDED_LEADERBOARD_ROWS = [
  {
    id: "seed-clark",
    userId: "seed-clark",
    username: "Clark",
    badge: "Founder",
    xp: 8200,
    totalXp: 8200,
    source: "server",
    scope: "Total XP",
  },
  {
    id: "seed-moderator",
    userId: "seed-moderator",
    username: "MODERATOR",
    badge: "MOD",
    moderator: true,
    xp: 7600,
    totalXp: 7600,
    source: "server",
    scope: "Total XP",
  },
  {
    id: "seed-joshua",
    userId: "seed-joshua",
    username: "Joshua",
    badge: "Advanced Player",
    xp: 5700,
    totalXp: 5700,
    source: "server",
    scope: "Total XP",
  },
  {
    id: "seed-tosh",
    userId: "seed-tosh",
    username: "Tosh the Sigma",
    badge: "Rizzler",
    xp: 4300,
    totalXp: 4300,
    source: "server",
    scope: "Total XP",
  },
];
const GAME_MODE_ID33 = "infernodrift33";
const GAME_MODE_MAX1 = "infernodriftmax1";
const GAME_MODE_RISK = "tryatyourownrisk";
const PUBLIC_MODE_CAMPAIGN = "campaign-survival";
const PUBLIC_MODE_MAX = "max-arena";
const GAME_MODE_RACE = "race";
const GAME_MODE_TIME_TRIAL = "time-trial";
const GAME_MODE_STUNT = "stunt-park";
const GAME_MODE_HUNTER_TAG = "hunter-tag";
const GAME_MODE_BOSS = "boss-chase";
const GAME_MODE_DRIFT_SCORE = "drift-score";
const GAME_MODE_BATTLE = "battle-arena";
const GAME_MODE_RAMP_RUSH = "ramp-rush";
const GAME_MODE_BOOST_BOWLING = "boost-bowling";
const GAME_MODE_LAVA_FLOOR = "lava-floor";
const GAME_MODE_KING_ZONE = "king-zone";
const GAME_MODE_TRICK_COMBO = "trick-combo";
const GAME_MODE_BOT_ESCAPE = "bot-escape";
const MODE_CATEGORY_LABELS = {
  campaign: "Campaign",
  arena: "Arena",
  speed: "Speed",
  tricks: "Tricks",
  chase: "Chase",
  minigames: "Minigames",
};
const CAMPAIGN_AI_NORMAL = "normal";
const CAMPAIGN_AI_ADAPTIVE = "adaptive";
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
const MAX_MODE_SPEED_MULT = 1.02;
const MAX_MODE_TURN_MULT = 1.06;
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
const GARAGE_LOADOUT_IDS = ["slot-1", "slot-2", "slot-3"];
const GARAGE_LOADOUT_NAMES = ["Street Heat", "Air Trick", "Arena Guard"];
const CAR_CLASS_OPTIONS = [
  {
    id: "balanced",
    name: "Street Balanced",
    bodyId: "street",
    styleId: "balanced",
    powerId: "nitro_core",
    description:
      "Forgiving handling, quick boost recovery, and the cleanest default InfernoDrift4 feel.",
  },
  {
    id: "drift",
    name: "Lightweight Drift",
    bodyId: "prototype",
    styleId: "drift",
    powerId: "slipstream",
    description:
      "Looser rear grip and higher speed retention for long combo chains.",
  },
  {
    id: "bruiser",
    name: "Heavy Bruiser",
    bodyId: "muscle",
    styleId: "grip",
    powerId: "shock_guard",
    description:
      "Stable impact recovery and stronger shield retention for hunter pressure.",
  },
  {
    id: "stunt",
    name: "Stunt Catalyst",
    bodyId: "rally",
    styleId: "balanced",
    powerId: "air_control",
    description:
      "Better air control, ramp exits, and landing boosts without changing the core car scale.",
  },
  {
    id: "speed",
    name: "Speed Prototype",
    bodyId: "interceptor",
    styleId: "speed",
    powerId: "pulse_charger",
    description:
      "Higher top speed and boost-pad chains with a narrower high-speed steering window.",
  },
];
const DEFAULT_CONTROL_BINDINGS = {
  throttle: ["KeyW", "ArrowUp"],
  brake: ["KeyS", "ArrowDown"],
  left: ["KeyA", "ArrowLeft"],
  right: ["KeyD", "ArrowRight"],
  drift: ["Space"],
  boost: ["ShiftLeft", "ShiftRight"],
  jumpTrick: ["KeyX"],
  altTrick: ["KeyB"],
  laser: ["KeyF"],
  help: ["KeyH"],
  targetLunge: ["ControlLeft", "ControlRight", "MetaLeft", "MetaRight"],
  ballCam: ["KeyL"],
  restart: ["KeyR"],
  menu: ["Escape", "KeyM"],
  chat: ["KeyC"],
};
const MOVEMENT_FALLBACK_BINDINGS = {
  throttle: ["KeyW", "ArrowUp"],
  brake: ["KeyS", "ArrowDown"],
  left: ["KeyA", "ArrowLeft"],
  right: ["KeyD", "ArrowRight"],
};
const CONTROL_ACTIONS = [
  { id: "throttle", label: "Forward", help: "Accelerate" },
  { id: "brake", label: "Reverse", help: "Brake or reverse" },
  { id: "left", label: "Left", help: "Steer left" },
  { id: "right", label: "Right", help: "Steer right" },
  { id: "drift", label: "Handbrake", help: "Drift in every mode" },
  {
    id: "targetLunge",
    label: "Arena Lunge",
    help: "Ctrl / Command lunges in Max Arena",
  },
  {
    id: "laser",
    label: "Laser",
    help: "F fires in Battle Arena",
  },
  {
    id: "help",
    label: "Mode Help",
    help: "H pauses with current mode rules",
  },
  { id: "boost", label: "Boost", help: "Hold for surge" },
  {
    id: "jumpTrick",
    label: "Jump / Trick",
    help: "X jumps, then flips in air",
  },
  {
    id: "altTrick",
    label: "Alt Backflip",
    help: "B is the alternate trick key",
  },
  { id: "ballCam", label: "Ball Cam", help: "Max Arena camera toggle" },
  { id: "restart", label: "Restart", help: "Fast retry" },
  { id: "menu", label: "Pause/Menu", help: "Open or close menu" },
  { id: "chat", label: "Chat", help: "Reserved for online phase" },
];
const CONTROL_ACTION_LABELS = Object.fromEntries(
  CONTROL_ACTIONS.map((action) => [action.id, action.label]),
);
const TOUCH_LAYOUT_OPTIONS = {
  classic: { label: "Classic", className: "touch-layout-classic" },
  compact: { label: "Compact", className: "touch-layout-compact" },
  lefty: { label: "Lefty", className: "touch-layout-lefty" },
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
const BATTLE_TEAM_SKINS = {
  blue: { primary: 0x35d7ff, accent: 0x0b2435, glow: 0x78f0ff },
  red: { primary: 0xff514d, accent: 0x3b1116, glow: 0xff817a },
};
const BATTLE_RULES = {
  maxHealth: 180,
  maxAmmo: 10,
  laserDamage: 24,
  laserRange: 152,
  laserWidth: 5.2,
  laserCooldown: 0.14,
  reloadSeconds: 0.58,
  respawnSeconds: 1.8,
  respawnShieldSeconds: 5,
  targetScore: 3,
  arenaHalfSize: 224,
  playerSpeedMult: 0.78,
  playerAccelMult: 0.68,
  playerTurnMult: 0.62,
  playerSteerFilterMult: 0.72,
  botSpeedMult: 0.82,
  coverCollisionSkin: 1.25,
};
const HUNTER_BOT_COLOR = 0x39ff8a;
const BOWLING_RULES = {
  frames: 10,
  laneHalfWidth: 38,
  startZ: -138,
  pinDeckZ: 108,
  endZ: 150,
  autoSpeed: 58,
  countdown: 3.2,
  resetSeconds: 1.45,
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
const MODE_CATALOG = [
  {
    id: GAME_MODE_ID33,
    label: "Campaign Survival",
    category: "campaign",
    base: "campaign",
    scene: "campaign",
    time: null,
    target: null,
    botCount: null,
    botSpeed: null,
    card: "World map, hunters, hazards, medals, unlock previews.",
    objective:
      "Survive the current world heat, bank a medal, and unlock the next reward preview.",
    reward: "World medals + garage unlock previews",
    medal: { bronze: 900, silver: 1600, gold: 2500, inferno: 3600 },
  },
  {
    id: GAME_MODE_MAX1,
    label: "Max Arena",
    category: "arena",
    base: "max",
    scene: "max",
    time: MAX_MODE_MATCH_TIME,
    target: MAX_MODE_GOAL_TARGET,
    botCount: 8,
    botSpeed: 44,
    card: "Ball goals, team roles, replays, ball cam.",
    objective: "Score for Blue before Red wins the arena.",
    reward: "Max team decal + goal burst",
    medal: { bronze: 600, silver: 1200, gold: 1900, inferno: 2800 },
  },
  {
    id: GAME_MODE_RACE,
    label: "Race",
    category: "speed",
    base: "campaign",
    scene: "track",
    time: 115,
    target: 8,
    botCount: 4,
    botSpeed: 38,
    card: "Winding road course, guardrails, checkpoints, rivals.",
    objective:
      "Race the winding course. Rivals bump like arcade racers, not hunters.",
    reward: "Speed class XP + ghost sample",
    medal: { bronze: 900, silver: 1500, gold: 2300, inferno: 3300 },
  },
  {
    id: GAME_MODE_TIME_TRIAL,
    label: "Time Trial",
    category: "speed",
    base: "campaign",
    scene: "track",
    time: 75,
    target: 8,
    botCount: 0,
    botSpeed: 0,
    card: "Solo winding track, clean restart, personal best ghost.",
    objective: "Beat the track quickly without rivals and set a cleaner ghost.",
    reward: "Chrono trail preview",
    medal: { bronze: 800, silver: 1500, gold: 2400, inferno: 3600 },
  },
  {
    id: GAME_MODE_STUNT,
    label: "Stunt Park",
    category: "tricks",
    base: "campaign",
    scene: "stunt",
    time: 120,
    target: 9,
    botCount: 0,
    botSpeed: 0,
    card: "Solo ramp park, loops, air rings, barrel rolls.",
    objective:
      "Chain loops, ramp rings, barrel rolls, flips, and clean landings.",
    reward: "Stunt kit + air control tune",
    medal: { bronze: 1000, silver: 1900, gold: 3100, inferno: 4700 },
  },
  {
    id: GAME_MODE_HUNTER_TAG,
    label: "Hunter Tag",
    category: "chase",
    base: "campaign",
    scene: "chase",
    time: 100,
    target: 5,
    botCount: 5,
    botSpeed: 42,
    card: "Evade, then tag a hunter back when you are it.",
    objective:
      "Clear escape gates. If tagged, tag a marked hunter to become chased again.",
    reward: "Hunter tag badge",
    medal: { bronze: 850, silver: 1550, gold: 2450, inferno: 3550 },
  },
  {
    id: GAME_MODE_BATTLE,
    label: "Battle Arena",
    category: "arena",
    base: "campaign",
    scene: "battle",
    time: 165,
    target: BATTLE_RULES.targetScore,
    botCount: 5,
    botSpeed: 36,
    card: "Red vs Blue laser tag, cover, ammo, shields.",
    objective:
      "Fight for Blue Team with forward lasers, cover, ammo, and shields.",
    reward: "Blue laser trail + arena shield",
    medal: { bronze: 850, silver: 1600, gold: 2500, inferno: 3700 },
  },
  {
    id: GAME_MODE_RAMP_RUSH,
    label: "Ramp Rush",
    category: "minigames",
    base: "campaign",
    scene: "stunt",
    time: 85,
    target: 10,
    botCount: 0,
    botSpeed: 0,
    card: "Ramp gauntlet, airborne rings, landing chains.",
    objective: "Hit every ramp lane and fly through midair rings for points.",
    reward: "Landing boost tune",
    medal: { bronze: 900, silver: 1700, gold: 2700, inferno: 4000 },
  },
  {
    id: GAME_MODE_BOOST_BOWLING,
    label: "Boost Bowling",
    category: "minigames",
    base: "campaign",
    scene: "bowling",
    time: 240,
    target: BOWLING_RULES.frames,
    botCount: 0,
    botSpeed: 0,
    card: "Ten-pin lane, countdown launch, steer-only rolls.",
    objective: "Bowl ten frames: steer the launch, knock pins, chase strikes.",
    reward: "Pin crusher horn",
    medal: { bronze: 700, silver: 1400, gold: 2300, inferno: 3400 },
  },
  {
    id: GAME_MODE_LAVA_FLOOR,
    label: "Lava Floor",
    category: "minigames",
    base: "campaign",
    scene: "lava",
    time: 90,
    target: 6,
    botCount: 4,
    botSpeed: 34,
    card: "Rising lava, higher safe platforms, bumping bots.",
    objective: "Reach each elevated safe platform before the lava rises.",
    reward: "Magma tire preview",
    medal: { bronze: 800, silver: 1450, gold: 2200, inferno: 3200 },
  },
  {
    id: GAME_MODE_KING_ZONE,
    label: "King of the Zone",
    category: "minigames",
    base: "campaign",
    scene: "zone",
    time: 90,
    target: 30,
    botCount: 4,
    botSpeed: 34,
    card: "Hold drifting zones while bots contest.",
    objective:
      "Control the zone with drift speed while bots try to bump you out.",
    reward: "Zone crown badge",
    medal: { bronze: 850, silver: 1550, gold: 2500, inferno: 3700 },
  },
];
const MODE_BY_ID = Object.fromEntries(
  MODE_CATALOG.map((mode) => [mode.id, mode]),
);
const MODE_THUMBNAIL_POSITIONS = {
  [GAME_MODE_ID33]: "0% 0%",
  [GAME_MODE_MAX1]: "25% 0%",
  [GAME_MODE_RACE]: "50% 0%",
  [GAME_MODE_TIME_TRIAL]: "75% 0%",
  [GAME_MODE_STUNT]: "100% 0%",
  [GAME_MODE_HUNTER_TAG]: "0% 50%",
  [GAME_MODE_BATTLE]: "75% 50%",
  [GAME_MODE_RAMP_RUSH]: "100% 50%",
  [GAME_MODE_BOOST_BOWLING]: "0% 100%",
  [GAME_MODE_LAVA_FLOOR]: "25% 100%",
  [GAME_MODE_KING_ZONE]: "50% 100%",
};
const MODE_ID_ALIASES = {
  [GAME_MODE_RISK]: GAME_MODE_MAX1,
  [PUBLIC_MODE_CAMPAIGN]: GAME_MODE_ID33,
  [PUBLIC_MODE_MAX]: GAME_MODE_MAX1,
  campaign: GAME_MODE_ID33,
  max: GAME_MODE_MAX1,
  max1: GAME_MODE_MAX1,
  "max-arena": GAME_MODE_MAX1,
  stunt: GAME_MODE_STUNT,
  hunter: GAME_MODE_HUNTER_TAG,
  boss: GAME_MODE_BOSS,
  battle: GAME_MODE_BATTLE,
};
const DRIVING_TUNING = {
  grounded: {
    steerFilter: 11.4,
    driftSteerFilter: 6.9,
    turnAssistBase: 0.94,
    turnAssistLowSpeedBonus: 0.62,
    driftTurnMult: 1.34,
    coastDragBase: 6.2,
    coastDragSpeedMult: 4.1,
    brakeMult: 1.12,
    touchSlipMult: 0.88,
  },
  airborne: {
    steerMult: 0.74,
    accelMult: 0.92,
    boostAccelMult: 1.3,
    carryCoastMult: 0.28,
  },
  maxMode: {
    speedMult: 1.08,
    steerFilter: 6.8,
    turnMult: 1.04,
    capMult: 1.18,
    turnAssistBase: 1.08,
    turnAssistLowSpeedBonus: 0.56,
    coastDragBase: 3.7,
    coastDragSpeedMult: 2.05,
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
  sampleRate: 1 / 30,
  maxFrames: 180,
  playbackFps: 8,
  playbackDuration: 6,
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
      speedMult: 0.96,
      accelMult: 1.06,
      steerFilter: 4.6,
      turnMult: 0.9,
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
      speedMult: 1.02,
      accelMult: 1.12,
      steerFilter: 5.1,
      turnMult: 0.95,
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
      speedMult: 1.08,
      accelMult: 1.18,
      steerFilter: 5.6,
      turnMult: 1.02,
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
      speedMult: 1.14,
      accelMult: 1.22,
      steerFilter: 6.1,
      turnMult: 1.06,
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

const input = {
  left: false,
  right: false,
  throttle: false,
  brake: false,
  drift: false,
  boost: false,
  laser: false,
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
  campaignAiMode: CAMPAIGN_AI_ADAPTIVE,
  maxDifficulty: "classic",
  invertSteer: true,
  cameraFocus: false,
  battleCockpitCamera: false,
  rampDensity: "normal",
  deviceMode: "auto",
  touchLayout: "classic",
  touchScale: 1,
  devMode: false,
  activeGameMode: GAME_MODE_ID33,
  exitLinkUrl: EXIT_LINK_DEFAULT_URL,
};

const customization = {
  ...DEFAULT_CUSTOMIZATION,
};

function makeGarageLoadout(index, overrides = {}) {
  return {
    id: GARAGE_LOADOUT_IDS[index] ?? `slot-${index + 1}`,
    name: GARAGE_LOADOUT_NAMES[index] ?? `Loadout ${index + 1}`,
    classId: index === 1 ? "stunt" : index === 2 ? "bruiser" : "balanced",
    ...DEFAULT_CUSTOMIZATION,
    ...overrides,
  };
}

const garageState = {
  activeLoadoutId: GARAGE_LOADOUT_IDS[0],
  loadouts: GARAGE_LOADOUT_IDS.map((_, index) => makeGarageLoadout(index)),
  preview: {
    ready: false,
    yaw: -0.42,
    zoom: 5.7,
    dragging: false,
    lastX: 0,
    lastY: 0,
    frame: 0,
  },
};

const controlBindings = Object.fromEntries(
  Object.entries(DEFAULT_CONTROL_BINDINGS).map(([key, value]) => [
    key,
    [...value],
  ]),
);

const gamepadState = {
  connected: false,
  id: "",
  steer: 0,
  throttle: 0,
  brake: 0,
  drift: false,
  boost: false,
  buttons: {},
  previousButtons: {},
};

const onlineState = {
  backendUrl: "",
  backendDefaulted: false,
  feedbackUrl: "",
  status: "offline",
  statusText: "Offline: no backend configured",
  socket: null,
  reconnectTimer: 0,
  reconnectAttempts: 0,
  autoConnectAttempted: false,
  lastError: "",
  lastMessageType: "",
  user: null,
  sessionToken: "",
  username: "Guest Racer",
  age: null,
  profileMode: "offline",
  guestTemporary: false,
  accountStatus: "Choose account or guest to start.",
  pendingAuth: null,
  pendingStartAfterAuth: false,
  authRequired: true,
  room: null,
  queue: null,
  chatOpen: false,
  feedbackReturnToMenu: false,
  chatMessages: [],
  leaderboard: [],
  leaderboardPlayerRow: null,
  leaderboardSyncStatus: "local",
  leaderboardSyncedAt: 0,
  lastProgressSyncAt: 0,
  nextProgressSyncAt: 0,
  saveSyncedAt: 0,
  profileSnapshot: null,
  profileActionStatus: "",
  profileDeleteStatus: "",
  onlineRestrictedUntil: "",
  friends: [],
  incomingFriendRequests: [],
  outgoingFriendRequests: [],
  recentPlayers: [],
  remoteSnapshots: [],
  roomShared: false,
  lastModerationStatus: "",
  moderationAction: null,
  pending: [],
  inputSeq: 0,
  lastSnapshotAt: 0,
  lastFeedbackStatus: "not_configured",
  lastFeedbackError: "",
  lastFeedbackDelivery: "not_configured",
  feedbackEmailConfigured: false,
  chatNoticeTimer: 0,
};

const maxTeamCustomization = {
  blue: { ...DEFAULT_MAX_TEAM_CUSTOMIZATION.blue },
  red: { ...DEFAULT_MAX_TEAM_CUSTOMIZATION.red },
};

const devTuning = {
  ...DEFAULT_DEV_TUNING,
};

function makeDailySeed(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function makeWeeklySeed(date = new Date()) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const day = Math.floor((date - start) / 86400000);
  return `${date.getUTCFullYear()}-W${Math.floor(day / 7) + 1}`;
}

function makeDailyGiftSalt() {
  return `gift-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function normalizeDailyGiftSalt(value) {
  const text = String(value ?? "").replace(/[^a-z0-9_-]/gi, "");
  return text.length >= 8 ? text.slice(0, 48) : makeDailyGiftSalt();
}

function hashStringToUnit(value) {
  let hash = 2166136261;
  const text = String(value ?? "");
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

function pickSteppedReward(min, max, step, unit) {
  const steps = Math.max(0, Math.floor((max - min) / step));
  return (
    min + Math.round(THREE.MathUtils.clamp(unit, 0, 0.999999) * steps) * step
  );
}

function randomUnit() {
  if (window.crypto?.getRandomValues) {
    const bytes = new Uint32Array(1);
    window.crypto.getRandomValues(bytes);
    return bytes[0] / 4294967296;
  }
  return Math.random();
}

function rollDailyGiftAmount() {
  const rarity = randomUnit();
  const amountRoll = randomUnit();
  if (rarity < 0.7)
    return pickSteppedReward(100, 350, DAILY_GIFT_STEP_XP, amountRoll);
  if (rarity < 0.92)
    return pickSteppedReward(375, 650, DAILY_GIFT_STEP_XP, amountRoll);
  if (rarity < 0.99)
    return pickSteppedReward(675, 900, DAILY_GIFT_STEP_XP, amountRoll);
  return pickSteppedReward(925, 1000, DAILY_GIFT_STEP_XP, amountRoll);
}

function createDailyGift(
  seed = makeDailySeed(),
  salt = makeDailyGiftSalt(),
  { source = "client", serverOwned = false } = {},
) {
  return {
    seed,
    amount: rollDailyGiftAmount(),
    claimed: false,
    claimedAt: "",
    randomSource: source,
    serverOwned: Boolean(serverOwned),
  };
}

function normalizeDailyGift(value = {}, salt = makeDailyGiftSalt()) {
  const today = makeDailySeed();
  const source = value && typeof value === "object" ? value : {};
  const rolled = createDailyGift(today, salt);
  if (source.seed !== today) return rolled;
  const amount = THREE.MathUtils.clamp(
    Math.round(Number(source.amount) || rolled.amount),
    100,
    1000,
  );
  return {
    ...rolled,
    amount,
    claimed: Boolean(source.claimed),
    claimedAt: String(source.claimedAt ?? ""),
    randomSource: String(
      source.randomSource || rolled.randomSource || "client",
    ),
    serverOwned: Boolean(source.serverOwned),
  };
}

function createProgressionV2() {
  const dailySeed = makeDailySeed();
  const weeklySeed = makeWeeklySeed();
  const dailyGiftSalt = makeDailyGiftSalt();
  return {
    schemaVersion: 2,
    xp: 0,
    totalXp: 0,
    level: 1,
    medals: {},
    personalBests: {},
    ghostSamples: {},
    unlockedRewards: ["starter-loadout"],
    rewardLog: [],
    dailyGiftSalt,
    dailyGift: createDailyGift(dailySeed, dailyGiftSalt),
    daily: {
      seed: dailySeed,
      label: "Daily Heat",
      modeId: GAME_MODE_STUNT,
      target: 2200,
      progress: 0,
      complete: false,
    },
    weekly: {
      seed: weeklySeed,
      label: "Weekly Tour",
      modeId: GAME_MODE_RACE,
      target: 4,
      progress: 0,
      complete: false,
    },
  };
}

function normalizeProgressionV2(value = {}) {
  const base = createProgressionV2();
  const source = value && typeof value === "object" ? value : {};
  const totalXp = Math.max(0, Number(source.totalXp ?? source.xp) || 0);
  const daily =
    source.daily && typeof source.daily === "object" ? source.daily : {};
  const weekly =
    source.weekly && typeof source.weekly === "object" ? source.weekly : {};
  const dailyGiftSalt = normalizeDailyGiftSalt(
    source.dailyGiftSalt ?? base.dailyGiftSalt,
  );
  const next = {
    ...base,
    ...source,
    schemaVersion: 2,
    xp: totalXp,
    totalXp,
    level: 1 + Math.floor(totalXp / 500),
    medals:
      source.medals && typeof source.medals === "object"
        ? { ...base.medals, ...source.medals }
        : base.medals,
    personalBests:
      source.personalBests && typeof source.personalBests === "object"
        ? { ...base.personalBests, ...source.personalBests }
        : base.personalBests,
    ghostSamples:
      source.ghostSamples && typeof source.ghostSamples === "object"
        ? { ...base.ghostSamples, ...source.ghostSamples }
        : base.ghostSamples,
    unlockedRewards: Array.isArray(source.unlockedRewards)
      ? [...new Set([...base.unlockedRewards, ...source.unlockedRewards])]
      : base.unlockedRewards,
    rewardLog: Array.isArray(source.rewardLog)
      ? source.rewardLog.slice(-12)
      : base.rewardLog,
    dailyGiftSalt,
    dailyGift: normalizeDailyGift(source.dailyGift, dailyGiftSalt),
    daily: { ...base.daily, ...daily },
    weekly: { ...base.weekly, ...weekly },
  };
  next.daily.progress = Math.max(0, Number(next.daily.progress) || 0);
  next.weekly.progress = Math.max(0, Number(next.weekly.progress) || 0);
  next.daily.complete = Boolean(next.daily.complete);
  next.weekly.complete = Boolean(next.weekly.complete);
  return next;
}

function createModeRunState() {
  return {
    id: GAME_MODE_ID33,
    progress: 0,
    target: 0,
    markerIndex: 0,
    medalEarned: "",
    xpGained: 0,
    rewardPreview: "",
    resultSummary: "",
    lastTrick: "",
    comboTimer: 0,
    tagState: "evader",
    tagCooldown: 0,
    xpTotalAfter: 0,
    taggedBotIndex: 0,
    bossPhase: 1,
    bossWeakTimer: 0,
    battlePickup: "",
    battlePickupTimer: 0,
    battleFlags: [],
    battle: {
      blueScore: 0,
      redScore: 0,
      targetScore: BATTLE_RULES.targetScore,
      health: BATTLE_RULES.maxHealth,
      ammo: BATTLE_RULES.maxAmmo,
      laserCooldown: 0,
      reloadTimer: 0,
      shield: 0,
      lastLaserHit: "",
      lastLaserBlocked: false,
      blueFlagCarrier: "",
      redFlagCarrier: "",
      flagMessage: "",
    },
    bowling: {
      frame: 1,
      roll: 1,
      rolls: [],
      pinsStanding: 10,
      rollStartPins: 10,
      countdown: BOWLING_RULES.countdown,
      rolling: false,
      resetTimer: 0,
      totalScore: 0,
      lastRollPins: 0,
      complete: false,
    },
    stunt: {
      trick: "",
      combo: 1,
      rings: 0,
      loopActive: false,
      loopTimer: 0,
      loopDuration: 1,
      loopCenter: null,
      loopHeading: 0,
      loopRadius: 15,
      barrelRolls: 0,
    },
    lava: {
      height: -1.15,
      graceTimer: 2.8,
      safeZoneIndex: 0,
      platformHeight: 1.6,
    },
    trackPath: [],
    trackWidth: 34,
    trackBounded: false,
    raceLap: 1,
    zoneIndex: 0,
    zoneTimer: 0,
    ghost: [],
    bestGhost: [],
  };
}

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
  lastEffectToast: "",
  cameraShake: 0,
  screenPulse: 0,
  comboMilestone: 1,
  bestCombo: 1,
  bestNearMissStreak: 0,
  nearMissStreak: 0,
  nearMissCooldown: 0,
  lastLandingGrade: "",
  threatToastCooldown: 0,
  lastFailReason: "",
  minimapHeading: 0,
  minimapDebugTimer: 0,
  radarSnapshot: {
    mode: "forward-relative",
    note: "top=front, left=car-left, right=car-right, bottom=behind",
    range: 0,
    heading: 0,
    entities: [],
  },
  cameraTelemetry: {
    distance: CAMERA_BACK_DISTANCE,
    height: CAMERA_HEIGHT,
    lookAhead: 0,
    ballCam: false,
    cockpit: false,
    scope: false,
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
  deviceProfile: { mode: "auto", ...DEVICE_PROFILES.desktop },
  steppingExternally: false,
  awaitingRemapAction: "",
  remapStatus: "",
  modeHelpOpen: false,
  modeHelpWasRunning: false,
  schoolGate: {
    active: false,
    dismissed: false,
    block: "",
    dayType: "",
  },
  progressionV2: createProgressionV2(),
  modeRun: createModeRunState(),
  campaignRisk: {
    recentHits: 0,
    recentEscapes: 0,
    nearMisses: 0,
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

function normalizeGameModeId(mode) {
  const normalized = MODE_ID_ALIASES[mode] ?? mode;
  return MODE_BY_ID[normalized] ? normalized : GAME_MODE_ID33;
}

function getPublicModeId(modeOrId = getModeDefinition()) {
  const modeId =
    typeof modeOrId === "string" ? normalizeGameModeId(modeOrId) : modeOrId.id;
  if (modeId === GAME_MODE_ID33) return PUBLIC_MODE_CAMPAIGN;
  if (modeId === GAME_MODE_MAX1) return PUBLIC_MODE_MAX;
  return modeId;
}

function getModeDefinition(mode = settings.activeGameMode) {
  return MODE_BY_ID[normalizeGameModeId(mode)] ?? MODE_BY_ID[GAME_MODE_ID33];
}

function isMaxMode() {
  return getModeDefinition().base === "max";
}

function isBattleMode() {
  return getModeDefinition().id === GAME_MODE_BATTLE;
}

function isTrackMode() {
  const id = getModeDefinition().id;
  return id === GAME_MODE_RACE || id === GAME_MODE_TIME_TRIAL;
}

function isBowlingMode() {
  return getModeDefinition().id === GAME_MODE_BOOST_BOWLING;
}

function isStuntMode() {
  const id = getModeDefinition().id;
  return id === GAME_MODE_STUNT || id === GAME_MODE_RAMP_RUSH;
}

function isLavaMode() {
  return getModeDefinition().id === GAME_MODE_LAVA_FLOOR;
}

function isRiskMode() {
  return isMaxMode();
}

function isCampaignSurvivalMode() {
  return normalizeGameModeId(settings.activeGameMode) === GAME_MODE_ID33;
}

function normalizeCampaignAiMode(value) {
  if (value === "risk" || value === CAMPAIGN_AI_ADAPTIVE)
    return CAMPAIGN_AI_ADAPTIVE;
  return CAMPAIGN_AI_NORMAL;
}

function isAdaptiveCampaignAi() {
  return settings.campaignAiMode === CAMPAIGN_AI_ADAPTIVE;
}

function getCampaignAiDisplayLabel() {
  return isAdaptiveCampaignAi() ? "Adaptive" : "Normal";
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
  const mode = getModeDefinition();
  if (isMaxMode())
    return {
      id: mode.id,
      title: mode.label,
      subtitle: `${getMaxDifficultyProfile().label} Arena`,
    };
  return {
    id: mode.id,
    title: mode.label,
    subtitle:
      mode.id === GAME_MODE_ID33
        ? isAdaptiveCampaignAi()
          ? "Adaptive Hunters"
          : "Classic Survival"
        : mode.card,
  };
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
  minimapCanvas.width = size;
  minimapCanvas.height = size;
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
    String(profile.controlScale * (Number(settings.touchScale) || 1)),
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
  applyTouchLayout();
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

function applyTouchLayout() {
  const layout = TOUCH_LAYOUT_OPTIONS[settings.touchLayout]
    ? settings.touchLayout
    : "classic";
  document.body.classList.remove(
    "touch-layout-classic",
    "touch-layout-compact",
    "touch-layout-lefty",
  );
  document.body.classList.add(TOUCH_LAYOUT_OPTIONS[layout].className);
  if (touchLayoutSelect) touchLayoutSelect.value = layout;
  if (touchScaleSelect) touchScaleSelect.value = String(settings.touchScale);
}

function getGarageUnlockLevel(unlock) {
  if (!unlock) return 1;
  if (Number.isFinite(unlock.level))
    return Math.max(1, Math.floor(unlock.level));
  const worldIndex = Math.max(0, Number(unlock.worldIndex) || 0);
  const levelIndex = Math.max(0, Number(unlock.levelIndex) || 0);
  return 1 + worldIndex * 2 + Math.ceil(levelIndex / 2);
}

function getGarageProgressLevel(progress = getProgressSnapshot()) {
  return Math.max(
    1,
    Number(progress?.progressionV2?.level ?? state.progressionV2?.level) || 1,
  );
}

function isProgressAtLeast(progress, unlock) {
  if (!unlock) return true;
  return getGarageProgressLevel(progress) >= getGarageUnlockLevel(unlock);
}

function getNextGarageUnlock(progress = getProgressSnapshot()) {
  const currentLevel = getGarageProgressLevel(progress);
  return getGarageOptionGroups()
    .flat()
    .map((option) => ({
      option,
      level: getGarageUnlockLevel(option.unlock),
    }))
    .filter(({ level }) => level > currentLevel)
    .sort(
      (a, b) => a.level - b.level || a.option.name.localeCompare(b.option.name),
    )[0];
}

function getProgressSnapshot() {
  return {
    worldIndex: state.worldIndex,
    levelIndex: state.levelIndex,
    progressionV2: state.progressionV2,
  };
}

function getGarageOptionGroups() {
  return [
    BODY_OPTIONS,
    WHEEL_OPTIONS,
    STYLE_OPTIONS,
    POWER_OPTIONS,
    PAINT_OPTIONS,
    ACCENT_OPTIONS,
    TINT_OPTIONS,
    SPOILER_OPTIONS,
    GLOW_OPTIONS,
  ];
}

function isOptionUnlocked(option, progress = getProgressSnapshot()) {
  return isProgressAtLeast(progress, option.unlock);
}

function getUnlockedOptions(group, progress = getProgressSnapshot()) {
  return group.filter((option) => isOptionUnlocked(option, progress));
}

function getLockedGarageOptionCount(progress = getProgressSnapshot()) {
  return getGarageOptionGroups()
    .flat()
    .filter((option) => !isOptionUnlocked(option, progress)).length;
}

function getOptionById(group, id, fallbackId) {
  return (
    group.find((option) => option.id === id) ??
    group.find((option) => option.id === fallbackId) ??
    group[0]
  );
}

function getActiveLoadoutIndex() {
  return Math.max(
    0,
    garageState.loadouts.findIndex(
      (loadout) => loadout.id === garageState.activeLoadoutId,
    ),
  );
}

function getActiveLoadout() {
  return (
    garageState.loadouts.find(
      (loadout) => loadout.id === garageState.activeLoadoutId,
    ) ?? garageState.loadouts[0]
  );
}

function copyCustomizationFromLoadout(loadout) {
  if (!loadout) return;
  Object.assign(customization, {
    bodyId: loadout.bodyId ?? DEFAULT_CUSTOMIZATION.bodyId,
    wheelId: loadout.wheelId ?? DEFAULT_CUSTOMIZATION.wheelId,
    styleId: loadout.styleId ?? DEFAULT_CUSTOMIZATION.styleId,
    powerId: loadout.powerId ?? DEFAULT_CUSTOMIZATION.powerId,
    paintId: loadout.paintId ?? DEFAULT_CUSTOMIZATION.paintId,
    accentId: loadout.accentId ?? DEFAULT_CUSTOMIZATION.accentId,
    tintId: loadout.tintId ?? DEFAULT_CUSTOMIZATION.tintId,
    spoilerId: loadout.spoilerId ?? DEFAULT_CUSTOMIZATION.spoilerId,
    glowId: loadout.glowId ?? DEFAULT_CUSTOMIZATION.glowId,
  });
}

function syncActiveLoadoutFromCustomization() {
  const loadout = getActiveLoadout();
  if (!loadout) return;
  Object.assign(loadout, {
    bodyId: customization.bodyId,
    wheelId: customization.wheelId,
    styleId: customization.styleId,
    powerId: customization.powerId,
    paintId: customization.paintId,
    accentId: customization.accentId,
    tintId: customization.tintId,
    spoilerId: customization.spoilerId,
    glowId: customization.glowId,
  });
}

function clampLoadoutToUnlocks(loadout, progress = getProgressSnapshot()) {
  copyCustomizationFromLoadout(loadout);
  clampCustomizationToUnlocks(progress);
  syncActiveLoadoutFromCustomization();
}

function normalizeGarageLoadout(
  value,
  index,
  progress = getProgressSnapshot(),
) {
  const base = makeGarageLoadout(index);
  const source = value && typeof value === "object" ? value : {};
  const classId =
    CAR_CLASS_OPTIONS.find((option) => option.id === source.classId)?.id ??
    base.classId;
  const next = makeGarageLoadout(index, {
    ...source,
    id: GARAGE_LOADOUT_IDS[index] ?? base.id,
    name:
      typeof source.name === "string" && source.name.trim()
        ? source.name.trim().slice(0, 22)
        : base.name,
    classId,
  });
  const previousActive = garageState.activeLoadoutId;
  garageState.activeLoadoutId = next.id;
  const previousLoadouts = garageState.loadouts;
  garageState.loadouts = previousLoadouts.map((loadout, loadoutIndex) =>
    loadoutIndex === index ? next : loadout,
  );
  clampLoadoutToUnlocks(next, progress);
  garageState.activeLoadoutId = previousActive;
  garageState.loadouts = previousLoadouts;
  return next;
}

function serializeGarageState() {
  syncActiveLoadoutFromCustomization();
  return {
    schemaVersion: 2,
    activeLoadoutId: garageState.activeLoadoutId,
    loadouts: garageState.loadouts.map((loadout) => ({ ...loadout })),
  };
}

function applyCarClass(classId, { save = true } = {}) {
  const option =
    CAR_CLASS_OPTIONS.find((item) => item.id === classId) ??
    CAR_CLASS_OPTIONS[0];
  const loadout = getActiveLoadout();
  if (loadout) loadout.classId = option.id;
  const progress = getProgressSnapshot();
  [
    ["bodyId", BODY_OPTIONS, option.bodyId],
    ["styleId", STYLE_OPTIONS, option.styleId],
    ["powerId", POWER_OPTIONS, option.powerId],
  ].forEach(([key, group, id]) => {
    const selected = getOptionById(group, id, DEFAULT_CUSTOMIZATION[key]);
    if (isOptionUnlocked(selected, progress)) customization[key] = selected.id;
  });
  applyPlayerCustomization();
  if (save) savePersistentState();
}

function selectGarageLoadout(loadoutId, { save = true } = {}) {
  const next =
    garageState.loadouts.find((loadout) => loadout.id === loadoutId) ??
    garageState.loadouts[0];
  garageState.activeLoadoutId = next.id;
  copyCustomizationFromLoadout(next);
  applyPlayerCustomization();
  if (save) savePersistentState();
}

function getClassSummary() {
  const loadout = getActiveLoadout();
  const option =
    CAR_CLASS_OPTIONS.find((item) => item.id === loadout?.classId) ??
    CAR_CLASS_OPTIONS[0];
  return option;
}

function formatCodeLabel(code) {
  return String(code)
    .replace(/^Key/, "")
    .replace(/^Arrow/, "")
    .replace("Space", "Space")
    .replace("ShiftLeft", "Shift")
    .replace("ShiftRight", "Shift")
    .replace("ControlLeft", "Ctrl")
    .replace("ControlRight", "Ctrl")
    .replace("MetaLeft", "Command")
    .replace("MetaRight", "Command");
}

function isActionCode(code, actionId) {
  if ((MOVEMENT_FALLBACK_BINDINGS[actionId] ?? []).includes(code)) return true;
  return (controlBindings[actionId] ?? []).includes(code);
}

function isTextEditingTarget(target) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

function normalizeExitLinkUrl(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return EXIT_LINK_DEFAULT_URL;
  try {
    const url = new URL(raw);
    return /^https?:$/i.test(url.protocol)
      ? url.toString()
      : EXIT_LINK_DEFAULT_URL;
  } catch {
    return EXIT_LINK_DEFAULT_URL;
  }
}

function openExitLink() {
  const url = normalizeExitLinkUrl(settings.exitLinkUrl);
  settings.exitLinkUrl = url;
  savePersistentState();
  window.location.assign(url);
}

function setPrimaryBinding(actionId, code) {
  if (!controlBindings[actionId]) return false;
  if (code === EXIT_LINK_KEY_CODE) {
    state.remapStatus = "Q is reserved for the Exit Link.";
    renderControlsUi();
    return false;
  }
  const duplicate = Object.entries(controlBindings).find(
    ([otherAction, codes]) =>
      otherAction !== actionId && codes[0] === code && code !== "Escape",
  );
  if (duplicate) {
    setEffectToast(
      `${formatCodeLabel(code)} already maps to ${CONTROL_ACTION_LABELS[duplicate[0]]}`,
    );
    renderControlsUi();
    return false;
  }
  const defaults = DEFAULT_CONTROL_BINDINGS[actionId] ?? [];
  controlBindings[actionId] = [
    code,
    ...defaults.filter((item) => item !== code).slice(1),
  ];
  renderControlsUi();
  savePersistentState();
  return true;
}

function hydrateControlBindings(value) {
  if (!value || typeof value !== "object") return;
  Object.entries(DEFAULT_CONTROL_BINDINGS).forEach(([actionId, defaults]) => {
    const incoming = value[actionId];
    if (!Array.isArray(incoming) || typeof incoming[0] !== "string") return;
    controlBindings[actionId] = [
      incoming[0],
      ...defaults.filter((code) => code !== incoming[0]).slice(1),
    ];
  });
}

function serializeControlBindings() {
  return Object.fromEntries(
    Object.entries(controlBindings).map(([actionId, codes]) => [
      actionId,
      [...codes],
    ]),
  );
}

function getUnlockLabel(option) {
  if (!option.unlock) return "Unlocked";
  return `Unlocks at XP Level ${getGarageUnlockLevel(option.unlock)}`;
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
    (isMaxMode() || isBattleMode()) &&
    maxTeamCustomization[player.team || "blue"]
      ? maxTeamCustomization[player.team || "blue"]
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

function getProgressionTotalXp(progress = state.progressionV2) {
  return Math.max(
    0,
    Math.floor(Number(progress?.totalXp ?? progress?.xp) || 0),
  );
}

function getProgressionLevel(progress = state.progressionV2) {
  return 1 + Math.floor(getProgressionTotalXp(progress) / 500);
}

function ensureDailyGiftState(progress = state.progressionV2) {
  if (!progress || typeof progress !== "object") return createDailyGift();
  progress.dailyGiftSalt = normalizeDailyGiftSalt(progress.dailyGiftSalt);
  progress.dailyGift = normalizeDailyGift(
    progress.dailyGift,
    progress.dailyGiftSalt,
  );
  return progress.dailyGift;
}

function getDailyGiftSnapshot(progress = state.progressionV2) {
  const gift = ensureDailyGiftState(progress);
  return {
    seed: gift.seed,
    amount: gift.amount,
    claimed: Boolean(gift.claimed),
    claimedAt: gift.claimedAt || "",
    available: !gift.claimed,
    randomSource: gift.randomSource || "client",
    serverOwned: Boolean(gift.serverOwned),
  };
}

function renderDailyGiftNotice() {
  const gift = getDailyGiftSnapshot();
  if (!dailyGiftNotice) return gift;
  dailyGiftNotice.hidden = !gift.available;
  dailyGiftNotice.classList.toggle("show", gift.available);
  dailyGiftNotice.setAttribute(
    "aria-label",
    gift.available
      ? `Redeem daily gift for ${gift.amount} XP`
      : "Daily gift claimed",
  );
  if (dailyGiftAmount) dailyGiftAmount.textContent = `+${gift.amount} XP`;
  return gift;
}

function redeemDailyGift() {
  const gift = getDailyGiftSnapshot();
  if (!gift.available) {
    renderDailyGiftNotice();
    return {
      ok: false,
      reason: "daily_gift_already_claimed",
      dailyGift: gift,
      progression: structuredClone(state.progressionV2),
    };
  }
  const amount = THREE.MathUtils.clamp(
    Math.round(gift.amount),
    DAILY_GIFT_MIN_XP,
    DAILY_GIFT_MAX_XP,
  );
  const progression = state.progressionV2;
  const totalXp = getProgressionTotalXp(progression) + amount;
  progression.xp = totalXp;
  progression.totalXp = totalXp;
  progression.level = getProgressionLevel(progression);
  progression.dailyGift = {
    ...progression.dailyGift,
    claimed: true,
    claimedAt: new Date().toISOString(),
  };
  progression.rewardLog = [
    {
      modeId: "daily-gift",
      label: "Daily Gift",
      medal: "Gift",
      xp: amount,
      reward: `Daily Gift +${amount} XP`,
      at: progression.dailyGift.claimedAt,
    },
    ...progression.rewardLog,
  ].slice(0, 12);
  setEffectToast(`Daily Gift +${amount} XP`, { pulse: 0.34 });
  renderDailyGiftNotice();
  renderProgressPanel();
  refreshGamesUi();
  updateOnlineUi();
  savePersistentState();
  syncProgressionToBackend();
  return {
    ok: true,
    amount,
    dailyGift: getDailyGiftSnapshot(),
    progression: structuredClone(progression),
  };
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
  const payload = buildPersistentSavePayload();
  try {
    const target = getPersistentSaveTarget();
    target.storage.setItem(target.key, JSON.stringify(payload));
  } catch (error) {
    debugLog("menu", "save_failed", error?.message || error);
  }
}

function getAccountSaveStorageKey(user = onlineState.user) {
  const id = String(user?.id || onlineState.user?.id || "").replace(
    /[^a-z0-9_-]/gi,
    "",
  );
  return id ? `${ACCOUNT_SAVE_STORAGE_PREFIX}${id}` : "";
}

function getPersistentSaveTarget() {
  if (onlineState.guestTemporary) {
    return { storage: sessionStorage, key: SAVE_STORAGE_KEY };
  }
  const accountKey =
    onlineState.profileMode === "account" ? getAccountSaveStorageKey() : "";
  return { storage: localStorage, key: accountKey || SAVE_STORAGE_KEY };
}

function readAccountSavePayload(user = onlineState.user) {
  const key = getAccountSaveStorageKey(user);
  if (!key) return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function buildPersistentSavePayload() {
  ensureDailyGiftState(state.progressionV2);
  state.progressionV2.xp = getProgressionTotalXp();
  state.progressionV2.totalXp = state.progressionV2.xp;
  state.progressionV2.level = getProgressionLevel();
  return {
    worldIndex: state.worldIndex,
    levelIndex: state.levelIndex,
    settings: {
      difficulty: settings.difficulty,
      campaignAiMode: settings.campaignAiMode,
      maxDifficulty: settings.maxDifficulty,
      invertSteer: settings.invertSteer,
      cameraFocus: settings.cameraFocus,
      battleCockpitCamera: settings.battleCockpitCamera,
      rampDensity: settings.rampDensity,
      deviceMode: settings.deviceMode,
      touchLayout: settings.touchLayout,
      touchScale: settings.touchScale,
      devMode: settings.devMode,
      activeGameMode: settings.activeGameMode,
      exitLinkUrl: settings.exitLinkUrl,
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
    garage: serializeGarageState(),
    progressionV2: state.progressionV2,
    controlBindings: serializeControlBindings(),
    maxTeamCustomization: {
      blue: { ...maxTeamCustomization.blue },
      red: { ...maxTeamCustomization.red },
    },
  };
}

function buildFreshAccountSavePayload() {
  return {
    worldIndex: 0,
    levelIndex: 0,
    settings: {
      difficulty: "classic",
      campaignAiMode: CAMPAIGN_AI_ADAPTIVE,
      maxDifficulty: "classic",
      invertSteer: true,
      cameraFocus: false,
      battleCockpitCamera: false,
      rampDensity: "normal",
      deviceMode: "auto",
      touchLayout: "classic",
      touchScale: 1,
      devMode: false,
      activeGameMode: GAME_MODE_ID33,
      exitLinkUrl: EXIT_LINK_DEFAULT_URL,
    },
    devTuning: { ...DEFAULT_DEV_TUNING },
    customization: { ...DEFAULT_CUSTOMIZATION },
    garage: {
      activeLoadoutId: GARAGE_LOADOUT_IDS[0],
      loadouts: GARAGE_LOADOUT_IDS.map((_, index) => makeGarageLoadout(index)),
    },
    progressionV2: createProgressionV2(),
    controlBindings: Object.fromEntries(
      Object.entries(DEFAULT_CONTROL_BINDINGS).map(([actionId, bindings]) => [
        actionId,
        [...bindings],
      ]),
    ),
    maxTeamCustomization: {
      blue: { ...DEFAULT_MAX_TEAM_CUSTOMIZATION.blue },
      red: { ...DEFAULT_MAX_TEAM_CUSTOMIZATION.red },
    },
  };
}

function syncProgressionToBackend() {
  if (
    !isOnlineSocketOpen() ||
    onlineState.profileMode !== "account" ||
    onlineState.guestTemporary
  ) {
    return false;
  }
  const now = performance.now();
  onlineState.lastProgressSyncAt = now;
  onlineState.nextProgressSyncAt = now + ONLINE_PROGRESS_SYNC_INTERVAL_MS;
  onlineState.leaderboardSyncStatus = "syncing";
  onlineState.leaderboardPlayerRow = {
    ...getCurrentPlayerXpLeaderboardRow(),
    source: "pending",
  };
  return sendOnlineMessage({
    type: "save.sync",
    schemaVersion: 2,
    payload: buildPersistentSavePayload(),
  });
}

function forceOnlineProgressSync({ force = false } = {}) {
  if (
    !isOnlineSocketOpen() ||
    onlineState.profileMode !== "account" ||
    onlineState.guestTemporary ||
    !onlineState.user
  ) {
    return false;
  }
  const now = performance.now();
  if (!force && now < onlineState.nextProgressSyncAt) return false;
  const sent = syncProgressionToBackend();
  requestOnlineProfile();
  requestOnlineLeaderboard({ force: true });
  if (!sent) {
    onlineState.nextProgressSyncAt = now + ONLINE_PROGRESS_SYNC_INTERVAL_MS;
  }
  return sent;
}

function applyServerSave(
  serverSave,
  { force = false, resetIfMissing = false, preferAccountLocal = false } = {},
) {
  const payload = serverSave?.payload;
  let nextPayload = payload && typeof payload === "object" ? payload : null;
  if (!nextPayload && preferAccountLocal) {
    nextPayload = readAccountSavePayload();
  }
  if (!nextPayload && resetIfMissing) {
    nextPayload = buildFreshAccountSavePayload();
  }
  if (!nextPayload) return false;
  const applied = applyPersistentSavePayload(nextPayload, {
    forceProgression: force || resetIfMissing || preferAccountLocal,
  });
  if (!applied) return false;
  renderDailyGiftNotice();
  renderProgressPanel();
  refreshGamesUi();
  onlineState.saveSyncedAt = Date.now();
  savePersistentState();
  return true;
}

function applyPersistentSavePayload(data, { forceProgression = true } = {}) {
  if (!data || typeof data !== "object") return false;
  try {
    if (data.settings && typeof data.settings === "object") {
      if (typeof data.settings.difficulty === "string")
        settings.difficulty = data.settings.difficulty;
      if (typeof data.settings.campaignAiMode === "string")
        settings.campaignAiMode = normalizeCampaignAiMode(
          data.settings.campaignAiMode,
        );
      if (typeof data.settings.maxDifficulty === "string")
        settings.maxDifficulty = data.settings.maxDifficulty;
      if (typeof data.settings.invertSteer === "boolean")
        settings.invertSteer = data.settings.invertSteer;
      if (typeof data.settings.cameraFocus === "boolean")
        settings.cameraFocus = data.settings.cameraFocus;
      if (typeof data.settings.battleCockpitCamera === "boolean")
        settings.battleCockpitCamera = data.settings.battleCockpitCamera;
      if (typeof data.settings.rampDensity === "string")
        settings.rampDensity = data.settings.rampDensity;
      if (typeof data.settings.deviceMode === "string")
        settings.deviceMode = data.settings.deviceMode;
      if (
        typeof data.settings.touchLayout === "string" &&
        TOUCH_LAYOUT_OPTIONS[data.settings.touchLayout]
      )
        settings.touchLayout = data.settings.touchLayout;
      if (Number.isFinite(data.settings.touchScale))
        settings.touchScale = THREE.MathUtils.clamp(
          Number(data.settings.touchScale),
          0.86,
          1.14,
        );
      if (typeof data.settings.devMode === "boolean")
        settings.devMode = data.settings.devMode;
      if (typeof data.settings.activeGameMode === "string")
        settings.activeGameMode = normalizeGameModeId(
          data.settings.activeGameMode,
        );
      if (typeof data.settings.exitLinkUrl === "string")
        settings.exitLinkUrl = normalizeExitLinkUrl(data.settings.exitLinkUrl);
    }
    if (data.progressionV2 && typeof data.progressionV2 === "object") {
      const nextProgression = normalizeProgressionV2(data.progressionV2);
      if (
        forceProgression ||
        getProgressionTotalXp(nextProgression) >= getProgressionTotalXp()
      ) {
        state.progressionV2 = nextProgression;
      }
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
    const progressForGarage = {
      worldIndex: Number.isFinite(data.worldIndex) ? data.worldIndex : 0,
      levelIndex: Number.isFinite(data.levelIndex) ? data.levelIndex : 0,
    };
    if (data.garage && typeof data.garage === "object") {
      const incomingLoadouts = Array.isArray(data.garage.loadouts)
        ? data.garage.loadouts
        : [];
      garageState.loadouts = GARAGE_LOADOUT_IDS.map((_, index) =>
        normalizeGarageLoadout(
          incomingLoadouts[index],
          index,
          progressForGarage,
        ),
      );
      garageState.activeLoadoutId = garageState.loadouts.some(
        (loadout) => loadout.id === data.garage.activeLoadoutId,
      )
        ? data.garage.activeLoadoutId
        : GARAGE_LOADOUT_IDS[0];
      copyCustomizationFromLoadout(getActiveLoadout());
    } else {
      garageState.activeLoadoutId = GARAGE_LOADOUT_IDS[0];
      garageState.loadouts[0] = makeGarageLoadout(0, { ...customization });
      syncActiveLoadoutFromCustomization();
    }
    hydrateControlBindings(data.controlBindings);
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
    syncActiveLoadoutFromCustomization();
    if (settings.activeGameMode === GAME_MODE_RISK)
      settings.activeGameMode = GAME_MODE_MAX1;
    return true;
  } catch (error) {
    debugLog("menu", "load_failed", error?.message || error);
    return false;
  }
}

function loadPersistentState() {
  try {
    const raw =
      sessionStorage.getItem(SAVE_STORAGE_KEY) ??
      localStorage.getItem(SAVE_STORAGE_KEY) ??
      LEGACY_SAVE_STORAGE_KEYS.map((key) => localStorage.getItem(key)).find(
        Boolean,
      );
    if (!raw) return false;
    return applyPersistentSavePayload(JSON.parse(raw));
  } catch (error) {
    debugLog("menu", "load_failed", error?.message || error);
    return false;
  }
}

function readLocalJson(key, fallback = {}) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocalJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    debugLog("menu", "online_save_failed", error?.message || error);
  }
}

function getRuntimeParam(...keys) {
  const params = new URLSearchParams(window.location.search);
  for (const key of keys) {
    const value = params.get(key);
    if (value) return value.trim();
  }
  return "";
}

function normalizeOnlineBackendUrl(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  if (/^wss?:\/\//i.test(raw)) return raw;
  if (/^https?:\/\//i.test(raw)) {
    const url = new URL(raw);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    if (!url.pathname || url.pathname === "/") url.pathname = "/ws";
    return url.toString();
  }
  return raw;
}

function getDefaultOnlineBackendUrl() {
  const configured =
    getRuntimeParam("online", "onlineUrl", "ws") || window.INFERNO_ONLINE_URL;
  if (configured) return normalizeOnlineBackendUrl(configured);
  return DEFAULT_PRODUCTION_BACKEND_URL;
}

function deriveFeedbackUrl(backendUrl) {
  try {
    if (!backendUrl) return "";
    const url = new URL(backendUrl);
    url.protocol = url.protocol === "wss:" ? "https:" : "http:";
    url.pathname = "/api/feedback";
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return "";
  }
}

function loadOnlineConfig() {
  const onlinePrefs = readLocalJson(ONLINE_STORAGE_KEY, {});
  const feedbackPrefs = readLocalJson(FEEDBACK_STORAGE_KEY, {});
  const explicitBackend =
    getRuntimeParam("online", "onlineUrl", "ws") ||
    window.INFERNO_ONLINE_URL ||
    onlinePrefs.backendUrl ||
    "";
  const configuredBackend = explicitBackend || getDefaultOnlineBackendUrl();
  const normalizedBackend = normalizeOnlineBackendUrl(configuredBackend);
  onlineState.backendUrl = LEGACY_PRODUCTION_BACKEND_URLS.has(normalizedBackend)
    ? DEFAULT_PRODUCTION_BACKEND_URL
    : normalizedBackend;
  onlineState.backendDefaulted =
    !explicitBackend && onlineState.backendUrl === DEFAULT_LOCAL_BACKEND_URL;
  onlineState.feedbackUrl =
    getRuntimeParam("feedback", "feedbackUrl") ||
    window.INFERNO_FEEDBACK_URL ||
    feedbackPrefs.feedbackUrl ||
    "";
  onlineState.username = sanitizeRemoteUsername(
    onlinePrefs.username || onlineState.username,
  );
  onlineState.sessionToken = String(onlinePrefs.sessionToken || "");
  onlineState.profileMode = onlinePrefs.profileMode || "offline";
  onlineState.guestTemporary = false;
  onlineState.age = Number.isFinite(Number(onlinePrefs.age))
    ? THREE.MathUtils.clamp(Number(onlinePrefs.age), 0, 120)
    : null;
  if (onlineBackendUrlInput)
    onlineBackendUrlInput.value = onlineState.backendUrl;
  if (onlineState.backendUrl && onlineState.status === "offline") {
    onlineState.statusText = `Backend ready: ${onlineState.backendUrl}`;
  }
  if (onlineUsernameInput) onlineUsernameInput.value = onlineState.username;
  if (onlineAgeInput && onlineState.age !== null)
    onlineAgeInput.value = String(onlineState.age);
}

function saveOnlineConfig() {
  const payload = {
    backendUrl: onlineState.backendUrl,
    age: onlineState.age,
    profileMode: onlineState.profileMode,
  };
  if (!onlineState.guestTemporary) {
    payload.username = onlineState.username;
    payload.sessionToken = onlineState.sessionToken;
  }
  writeLocalJson(ONLINE_STORAGE_KEY, payload);
  if (onlineState.feedbackUrl) {
    writeLocalJson(FEEDBACK_STORAGE_KEY, {
      feedbackUrl: onlineState.feedbackUrl,
    });
  }
}

function canUseOnlineFreeChat() {
  return Number.isFinite(onlineState.age) && onlineState.age >= 13;
}

function setOnlineStatus(status, text, detail = "") {
  onlineState.status = status;
  onlineState.statusText = text;
  onlineState.lastError = detail || "";
  if (onlineStatus) {
    onlineStatus.dataset.state =
      status === "connected" || status === "authenticated"
        ? "connected"
        : status === "error" || status === "not_configured"
          ? "error"
          : "offline";
    onlineStatus.textContent = detail ? `${text}: ${detail}` : text;
  }
}

function isOnlineSocketOpen() {
  return onlineState.socket?.readyState === WebSocket.OPEN;
}

function sendOnlineMessage(payload, { queue = true } = {}) {
  if (isOnlineSocketOpen()) {
    onlineState.socket.send(JSON.stringify(payload));
    return true;
  }
  if (queue) onlineState.pending.push(payload);
  updateOnlineUi();
  return false;
}

function flushOnlinePending() {
  while (onlineState.pending.length && isOnlineSocketOpen()) {
    onlineState.socket.send(JSON.stringify(onlineState.pending.shift()));
  }
}

function getOnlineRoomOptions() {
  return {
    mode: normalizeGameModeId(onlineRoomMode?.value || settings.activeGameMode),
    playlist: onlinePlaylist?.value || "casual",
    teamSize: Math.max(1, Math.min(3, Number(onlineTeamSize?.value) || 2)),
    botFill: onlineBotFill?.checked !== false,
  };
}

function makeRandomGuestUsername() {
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `Guest ${suffix}`;
}

function setStartAccountStatus(text, tone = "info") {
  onlineState.accountStatus = text;
  if (startAccountStatus) {
    startAccountStatus.textContent = text;
    startAccountStatus.dataset.state = tone;
  }
}

function syncStartAccountFields() {
  if (
    startAccountUsername &&
    document.activeElement !== startAccountUsername &&
    onlineState.profileMode !== "guest"
  ) {
    startAccountUsername.value = onlineState.username || "";
  }
  if (
    startAccountAge &&
    document.activeElement !== startAccountAge &&
    onlineState.age !== null
  ) {
    startAccountAge.value = String(onlineState.age);
  }
  setStartAccountStatus(
    onlineState.accountStatus || "Choose account or guest.",
  );
}

function buildAccountAuthPayload(mode = "auto") {
  const username = sanitizeRemoteUsername(startAccountUsername?.value || "");
  const password = String(startAccountPassword?.value || "");
  const ageValue = Number(startAccountAge?.value);
  if (!username || username.length < 2) {
    setStartAccountStatus(
      "Enter a username with at least 2 characters.",
      "error",
    );
    return null;
  }
  if (password.length < 6) {
    setStartAccountStatus("Password must be at least 6 characters.", "error");
    return null;
  }
  if (!Number.isFinite(ageValue) || ageValue < 0 || ageValue > 120) {
    setStartAccountStatus(
      "Enter an age from 0 to 120 for chat safety.",
      "error",
    );
    return null;
  }
  onlineState.username = username;
  onlineState.age = Math.round(ageValue);
  onlineState.profileMode = "account";
  onlineState.guestTemporary = false;
  return {
    type: "auth.account",
    version: ONLINE_PROTOCOL_VERSION,
    mode,
    username,
    password,
    age: onlineState.age,
    deviceId: navigator.userAgent.slice(0, 90),
  };
}

function submitStartAccount() {
  onlineState.backendUrl = normalizeOnlineBackendUrl(
    onlineBackendUrlInput?.value || onlineState.backendUrl,
  );
  if (!onlineState.backendUrl) {
    setStartAccountStatus(
      "Account sign-in requires a configured backend URL. Guest play stays offline-safe.",
      "error",
    );
    setActiveTab("online");
    setMenuOpen(true, "online");
    return false;
  }
  const payload = buildAccountAuthPayload("auto");
  if (!payload) return false;
  onlineState.pendingAuth = payload;
  onlineState.pendingStartAfterAuth = true;
  onlineState.sessionToken = "";
  saveOnlineConfig();
  setStartAccountStatus(`Connecting account for ${payload.username}...`);
  connectOnline();
  return true;
}

function startGuestProfile() {
  onlineState.username = makeRandomGuestUsername();
  onlineState.profileMode = "guest";
  onlineState.guestTemporary = true;
  onlineState.sessionToken = "";
  onlineState.accountStatus = `${onlineState.username} is a temporary guest. Progress saves only for this browser tab.`;
  if (onlineUsernameInput) onlineUsernameInput.value = onlineState.username;
  syncStartAccountFields();
  if (onlineState.backendUrl && !onlineState.backendDefaulted) {
    setStartAccountStatus(
      `${onlineState.username} is entering as a temporary online guest...`,
    );
    connectOnline();
  }
  try {
    sessionStorage.removeItem(SAVE_STORAGE_KEY);
  } catch {
    // Session storage may be unavailable in private modes.
  }
  startRun(true);
}

function claimOnlineGuest() {
  onlineState.username = sanitizeRemoteUsername(
    onlineUsernameInput?.value || onlineState.username,
  );
  onlineState.age = Number.isFinite(Number(onlineAgeInput?.value))
    ? THREE.MathUtils.clamp(Number(onlineAgeInput.value), 0, 120)
    : null;
  saveOnlineConfig();
  const payload = {
    type: "auth.guest",
    version: ONLINE_PROTOCOL_VERSION,
    username: onlineState.username,
    deviceId: navigator.userAgent.slice(0, 90),
  };
  if (onlineState.age !== null) payload.age = onlineState.age;
  if (onlineState.sessionToken) payload.sessionToken = onlineState.sessionToken;
  sendOnlineMessage(payload);
  onlineState.authRequired = true;
  setOnlineStatus(
    isOnlineSocketOpen() ? "connected" : "offline",
    isOnlineSocketOpen()
      ? `Claiming ${onlineState.username}`
      : "Saved guest profile; connect to claim",
  );
  updateOnlineUi();
}

function claimOnlineUsername() {
  onlineState.username = sanitizeRemoteUsername(
    onlineUsernameInput?.value || onlineState.username,
  );
  onlineState.age = Number.isFinite(Number(onlineAgeInput?.value))
    ? THREE.MathUtils.clamp(Number(onlineAgeInput.value), 0, 120)
    : onlineState.age;
  saveOnlineConfig();
  if (!isOnlineSocketOpen()) {
    claimOnlineGuest();
    return;
  }
  if (!onlineState.user) {
    claimOnlineGuest();
    return;
  }
  sendOnlineMessage({
    type: "profile.claimUsername",
    username: onlineState.username,
  });
  setOnlineStatus("connected", `Claiming username ${onlineState.username}`);
}

function requestOnlineProfile() {
  sendOnlineMessage({ type: "profile.get" }, { queue: false });
}

function requestOnlineLeaderboard({ force = false } = {}) {
  if (!isOnlineSocketOpen()) return false;
  const now = performance.now();
  if (!force && now - onlineState.leaderboardSyncedAt < 12000) return false;
  onlineState.leaderboardSyncedAt = now;
  return sendOnlineMessage(
    { type: "leaderboard.get", playlist: "casual" },
    { queue: false },
  );
}

function logoutOnlineProfile() {
  onlineState.profileActionStatus = "Logging out...";
  if (isOnlineSocketOpen()) {
    sendOnlineMessage({ type: "profile.logout" }, { queue: false });
  } else {
    completeLocalLogout("Logged out locally.");
  }
  updateOnlineUi();
}

function completeLocalLogout(message = "Logged out.") {
  onlineState.sessionToken = "";
  onlineState.user = null;
  onlineState.room = null;
  onlineState.queue = null;
  onlineState.profileMode = "offline";
  onlineState.guestTemporary = false;
  onlineState.authRequired = true;
  onlineState.chatMessages = [];
  onlineState.remoteSnapshots = [];
  onlineState.profileSnapshot = null;
  onlineState.profileActionStatus = message;
  setRemoteHumanPlayers([]);
  saveOnlineConfig();
  disconnectOnline({ manual: false, suppressReconnect: true });
  setStartAccountStatus("Choose account or guest.");
}

function forceOnlineRemoval(text, { until = "" } = {}) {
  state.running = false;
  state.modeHelpOpen = false;
  state.modeHelpWasRunning = false;
  input.left = false;
  input.right = false;
  input.throttle = false;
  input.brake = false;
  input.drift = false;
  input.boost = false;
  input.laser = false;
  input.backflip = false;
  if (modeHelpCard) modeHelpCard.hidden = true;
  message.classList.remove("show");
  completeLocalLogout(text);
  onlineState.onlineRestrictedUntil = until || "";
  onlineState.lastModerationStatus = text;
  onlineState.profileActionStatus = text;
  setOnlineStatus("error", text);
  setStartAccountStatus(text, "error");
  setChatPopoutOpen(false);
  setMenuOpen(true, "profile");
  updateOnlineUi();
}

function deleteOnlineProfile() {
  const confirmUsername = String(profileDeleteConfirm?.value || "").trim();
  const currentUsername = onlineState.user?.username || onlineState.username;
  if (
    !confirmUsername ||
    claimKeyClient(confirmUsername) !== claimKeyClient(currentUsername)
  ) {
    onlineState.profileDeleteStatus = `Type ${currentUsername} to confirm account deletion.`;
    updateOnlineUi();
    return;
  }
  onlineState.profileDeleteStatus = "Deleting account...";
  if (isOnlineSocketOpen()) {
    sendOnlineMessage(
      { type: "profile.delete", confirmUsername },
      { queue: false },
    );
  } else {
    onlineState.profileDeleteStatus =
      "Connect to the backend before deleting an account.";
  }
  updateOnlineUi();
}

function claimKeyClient(value = "") {
  return sanitizeRemoteUsername(value).trim().toLowerCase();
}

function describeOnlineError(error = "") {
  const code = String(error || "online_error");
  const labels = {
    account_requires_upgrade:
      "That name was a temporary guest profile. Try signing in again to upgrade it into a normal account, or choose another username.",
    account_not_found: "No account exists with that username yet.",
    invalid_credentials: "That username and password do not match.",
    username_reserved: "That username is reserved.",
    username_taken: "That username is already taken.",
    chat_requires_13_plus:
      "Typed chat requires your real age to be 13 or older. Quick chat still works.",
    room_not_found:
      "That room code was not found. Check the code and try again.",
    room_full: "That room is full.",
    account_banned:
      "This account or device is temporarily banned from online play.",
  };
  return labels[code] || code.replace(/_/g, " ");
}

function connectOnline({ reconnect = false } = {}) {
  onlineState.backendUrl = normalizeOnlineBackendUrl(
    onlineBackendUrlInput?.value || onlineState.backendUrl,
  );
  saveOnlineConfig();
  if (!onlineState.backendUrl) {
    setOnlineStatus("not_configured", "Offline: no backend configured");
    updateOnlineUi();
    return false;
  }
  if (isOnlineSocketOpen()) return true;
  try {
    if (onlineState.socket) onlineState.socket.close();
    setOnlineStatus(
      "connecting",
      reconnect ? "Reconnecting to backend" : "Connecting to backend",
    );
    const socket = new WebSocket(onlineState.backendUrl);
    onlineState.socket = socket;
    socket.addEventListener("open", () => {
      onlineState.reconnectAttempts = 0;
      const pendingAuth = onlineState.pendingAuth;
      setOnlineStatus(
        "connected",
        pendingAuth
          ? `Connected; signing in ${pendingAuth.username}`
          : onlineState.sessionToken
            ? "Connected; restoring guest session"
            : "Connected; claiming guest",
      );
      if (pendingAuth) {
        onlineState.pendingAuth = null;
        sendOnlineMessage(pendingAuth, { queue: false });
      } else if (onlineState.sessionToken) {
        sendOnlineMessage({
          type: "reconnect",
          sessionToken: onlineState.sessionToken,
          ...(onlineState.room?.code
            ? { roomCode: onlineState.room.code }
            : {}),
        });
      } else {
        claimOnlineGuest();
      }
      flushOnlinePending();
      sendOnlineMessage({ type: "leaderboard.get", playlist: "casual" });
      updateOnlineUi();
    });
    socket.addEventListener("message", (event) => {
      handleOnlineMessage(event.data);
    });
    socket.addEventListener("close", (event) => {
      if (onlineState.socket !== socket) return;
      if (event.code === 4002 || event.code === 4003) {
        const banned = event.code === 4003;
        forceOnlineRemoval(
          banned
            ? "You were banned by a moderator. Online access is restricted until the ban expires."
            : "You were kicked by a moderator. Please sign in again.",
          {
            until: banned ? onlineState.onlineRestrictedUntil || "active" : "",
          },
        );
        return;
      }
      onlineState.socket = null;
      onlineState.user = null;
      onlineState.room = null;
      onlineState.remoteSnapshots = [];
      setRemoteHumanPlayers([]);
      setOnlineStatus("offline", "Offline: backend disconnected");
      if (!onlineState.onlineRestrictedUntil) scheduleOnlineReconnect();
      updateOnlineUi();
    });
    socket.addEventListener("error", () => {
      setOnlineStatus("error", "Online backend error");
      updateOnlineUi();
    });
  } catch (error) {
    setOnlineStatus("error", "Online connection failed", error?.message || "");
    updateOnlineUi();
    return false;
  }
  return true;
}

function disconnectOnline({ manual = true, suppressReconnect = false } = {}) {
  if (onlineState.reconnectTimer) clearTimeout(onlineState.reconnectTimer);
  onlineState.reconnectTimer = 0;
  onlineState.pending = [];
  if (onlineState.socket) {
    const socket = onlineState.socket;
    onlineState.socket = null;
    socket.close();
  }
  onlineState.user = null;
  onlineState.room = null;
  onlineState.queue = null;
  onlineState.remoteSnapshots = [];
  setRemoteHumanPlayers([]);
  setOnlineStatus("offline", manual ? "Offline: disconnected" : "Offline");
  updateOnlineUi();
}

function scheduleOnlineReconnect() {
  if (onlineState.onlineRestrictedUntil) return;
  if (!onlineState.backendUrl || onlineState.reconnectTimer) return;
  onlineState.reconnectAttempts += 1;
  const delay = Math.min(12000, 1800 * onlineState.reconnectAttempts);
  onlineState.reconnectTimer = window.setTimeout(() => {
    onlineState.reconnectTimer = 0;
    connectOnline({ reconnect: true });
  }, delay);
}

function handleOnlineMessage(raw) {
  let message;
  try {
    message = JSON.parse(String(raw));
  } catch {
    return;
  }
  onlineState.lastMessageType = message.type || "";
  if (message.type === "hello") {
    onlineState.serverId = message.id || "";
  } else if (message.type === "auth.ok" || message.type === "reconnect.ok") {
    onlineState.user = message.user || null;
    onlineState.sessionToken = message.sessionToken || onlineState.sessionToken;
    if (onlineState.user?.username)
      onlineState.username = onlineState.user.username;
    applyServerSave(message.save, {
      force: true,
      resetIfMissing: message.user?.account,
      preferAccountLocal: message.user?.account,
    });
    saveOnlineConfig();
    onlineState.authRequired = false;
    onlineState.profileActionStatus = "";
    onlineState.profileDeleteStatus = "";
    onlineState.onlineRestrictedUntil = "";
    onlineState.profileMode = message.user?.account
      ? "account"
      : onlineState.profileMode;
    onlineState.guestTemporary = onlineState.profileMode === "guest";
    onlineState.accountStatus =
      onlineState.profileMode === "account"
        ? `Signed in as ${onlineState.user?.username || onlineState.username}${onlineState.user?.badge ? ` · ${onlineState.user.badge}` : ""}.`
        : `${onlineState.user?.username || onlineState.username} is playing as guest.`;
    syncStartAccountFields();
    setOnlineStatus(
      "authenticated",
      `Online as ${onlineState.user?.username || onlineState.username}`,
    );
    onlineState.nextProgressSyncAt =
      performance.now() + ONLINE_PROGRESS_SYNC_INTERVAL_MS;
    requestOnlineLeaderboard({ force: true });
    requestOnlineProfile();
    if (onlineState.pendingStartAfterAuth) {
      onlineState.pendingStartAfterAuth = false;
      if (overlay.classList.contains("show")) startRun(true);
    }
  } else if (message.type === "profile.snapshot") {
    onlineState.profileSnapshot = message;
    if (message.user) onlineState.user = message.user;
    applyServerSave(message.save, {
      force: Boolean(message.save),
      preferAccountLocal: Boolean(message.user?.account),
    });
    updateProfileUi();
  } else if (message.type === "save.synced") {
    applyServerSave({ payload: message.payload }, { force: true });
    onlineState.saveSyncedAt = performance.now();
    onlineState.profileActionStatus = "Progress synced to your account.";
    requestOnlineLeaderboard({ force: true });
    updateProfileUi();
  } else if (message.type === "progression.reward") {
    if (message.payload)
      applyServerSave({ payload: message.payload }, { force: true });
    const xp = Math.max(0, Number(message.xp) || 0);
    const label = sanitizeBadgeLabel(message.label || "Online Reward");
    onlineState.profileActionStatus = `${label}: +${xp} XP`;
    setEffectToast(`${label} +${xp} XP`, { pulse: 0.34 });
    requestOnlineLeaderboard({ force: true });
    renderProgressPanel();
    updateProfileUi();
  } else if (message.type === "profile.usernameClaimed") {
    onlineState.user = message.user || onlineState.user;
    onlineState.username = message.username || onlineState.username;
    saveOnlineConfig();
    setOnlineStatus(
      "authenticated",
      `Username claimed: ${onlineState.username}`,
    );
    requestOnlineLeaderboard({ force: true });
  } else if (message.type === "profile.loggedOut") {
    completeLocalLogout("Logged out of online account.");
  } else if (message.type === "profile.deleted") {
    onlineState.profileDeleteStatus =
      "Account deleted. Your online identity was removed.";
    completeLocalLogout("Account deleted.");
  } else if (message.type === "session.revoked") {
    const text =
      message.reason === "profile_deleted"
        ? "Session ended because the account was deleted."
        : "Session ended. Please sign in again.";
    onlineState.profileActionStatus = text;
    completeLocalLogout(text);
  } else if (message.type === "room.snapshot") {
    const previousCode = onlineState.room?.code || "";
    onlineState.room = message.room || null;
    onlineState.queue = null;
    onlineState.roomShared = Boolean(
      onlineState.room?.sharedBy?.includes?.(onlineState.user?.id),
    );
    if (previousCode && onlineState.room?.code !== previousCode) {
      onlineState.roomShared = false;
    }
    if (onlineState.room?.mode && MODE_BY_ID[onlineState.room.mode]) {
      const joinedNewRoom = Boolean(
        onlineState.room.code && onlineState.room.code !== previousCode,
      );
      const roomModeChanged = onlineState.room.mode !== settings.activeGameMode;
      enterOnlineRoomMode(onlineState.room.mode, {
        start: joinedNewRoom || roomModeChanged,
      });
    }
    if (
      onlineRoomCode &&
      onlineState.room?.code &&
      document.activeElement !== onlineRoomCode
    ) {
      onlineRoomCode.value = onlineState.room.code;
    }
    onlineState.leaderboard = Array.isArray(message.room?.leaderboard)
      ? message.room.leaderboard
      : onlineState.leaderboard;
    updateRemoteSnapshotsFromRoom(message.room);
  } else if (message.type === "queue.joined") {
    onlineState.queue = message;
  } else if (message.type === "room.left") {
    onlineState.room = null;
    onlineState.queue = null;
    onlineState.roomShared = false;
    onlineState.remoteSnapshots = [];
    setRemoteHumanPlayers([]);
  } else if (message.type === "chat.message") {
    pushOnlineChatMessage({
      from: message.from || "Server",
      userId: message.userId || "",
      badge: message.badge || "",
      moderator: Boolean(message.moderator),
      text: message.text || "",
      quick: Boolean(message.quick),
      at: message.at ? Date.parse(message.at) || Date.now() : Date.now(),
    });
  } else if (message.type === "chat.history") {
    onlineState.chatMessages = [];
    (Array.isArray(message.messages) ? message.messages : []).forEach((entry) =>
      pushOnlineChatMessage(
        {
          from: entry.from || "Server",
          userId: entry.userId || "",
          badge: entry.badge || "",
          moderator: Boolean(entry.moderator),
          text: entry.text || "",
          quick: Boolean(entry.quick),
          at: entry.at ? Date.parse(entry.at) || Date.now() : Date.now(),
        },
        { notify: false },
      ),
    );
  } else if (message.type === "leaderboard.snapshot") {
    onlineState.leaderboard = Array.isArray(message.leaderboard)
      ? message.leaderboard
      : [];
    onlineState.leaderboardPlayerRow = message.playerRow || null;
    onlineState.leaderboardSyncStatus = message.playerRow
      ? "server"
      : onlineState.leaderboard.length
        ? "server"
        : "local";
    onlineState.leaderboardSyncedAt = performance.now();
  } else if (message.type === "friends.snapshot") {
    onlineState.friends = Array.isArray(message.friends) ? message.friends : [];
    onlineState.incomingFriendRequests = Array.isArray(message.incomingRequests)
      ? message.incomingRequests
      : [];
    onlineState.outgoingFriendRequests = Array.isArray(message.outgoingRequests)
      ? message.outgoingRequests
      : [];
    onlineState.recentPlayers = Array.isArray(message.recentPlayers)
      ? message.recentPlayers
      : [];
  } else if (message.type === "friend.requested") {
    pushOnlineChatMessage({
      from: "Friends",
      text: `Request to ${message.username || "player"}: ${message.status || "sent"}`,
      quick: true,
    });
  } else if (message.type === "friend.accepted") {
    pushOnlineChatMessage({
      from: "Friends",
      text: `You are now friends with ${message.username || "that player"}.`,
      quick: true,
    });
  } else if (message.type === "room.shared") {
    onlineState.roomShared =
      message.status === "shared" || message.status === "already_shared";
    updateOnlineUi();
  } else if (message.type === "feedback.received") {
    onlineState.lastFeedbackStatus = "saved";
    onlineState.lastFeedbackDelivery = message.delivery || "stored";
    onlineState.feedbackEmailConfigured = Boolean(message.emailConfigured);
    onlineState.lastFeedbackError = message.emailError || "";
    updateFeedbackStatus(getFeedbackDeliveryMessage(message));
  } else if (message.type === "match.snapshot") {
    onlineState.lastSnapshotAt = performance.now();
    onlineState.remoteSnapshots = Array.isArray(message.players)
      ? message.players
      : [];
    updateRemoteSnapshotsFromMatch();
  } else if (message.type === "error") {
    const error = message.error || "online_error";
    if (error === "account_banned") {
      onlineState.onlineRestrictedUntil = message.until || "active";
    }
    if (onlineState.pendingStartAfterAuth) {
      onlineState.pendingStartAfterAuth = false;
      setStartAccountStatus(
        `Account error: ${describeOnlineError(error)}`,
        "error",
      );
    }
    setOnlineStatus(
      "error",
      "Online backend rejected request",
      describeOnlineError(error),
    );
    pushOnlineChatMessage({
      from: "System",
      text: describeOnlineError(error),
      quick: true,
    });
  } else if (
    message.type === "moderation.kicked" ||
    message.type === "moderation.banned"
  ) {
    const text =
      message.type === "moderation.banned"
        ? `You were banned until ${message.until || "tomorrow"}.`
        : "You were kicked by a moderator. Please sign in again.";
    onlineState.lastModerationStatus = text;
    forceOnlineRemoval(text, { until: message.until || "" });
  } else if (message.type === "moderation.done") {
    onlineState.lastModerationStatus = `${message.action || "Updated"} ${message.username || message.userId || "player"}`;
    pushOnlineChatMessage({
      from: "Moderation",
      text: onlineState.lastModerationStatus,
      quick: true,
    });
  }
  updateOnlineUi();
}

function updateRemoteSnapshotsFromRoom(room) {
  const players = Array.isArray(room?.players) ? room.players : [];
  const currentId = onlineState.user?.id;
  setRemoteHumanPlayers(
    players
      .filter((remote) => remote?.id && remote.id !== currentId)
      .map((remote, index) => ({
        id: remote.id,
        username: remote.username,
        badge: remote.badge || "",
        moderator: Boolean(remote.moderator),
        team: index % 2 === 0 ? "blue" : "red",
        x: player.position.x + 7 + index * 5,
        y: 0,
        z: player.position.z + 10 + index * 5,
        heading: 0,
        speed: 0,
      })),
  );
}

function updateRemoteSnapshotsFromMatch() {
  const currentId = onlineState.user?.id;
  setRemoteHumanPlayers(
    onlineState.remoteSnapshots
      .filter((remote) => remote?.id && remote.id !== currentId)
      .map((remote, index) => ({
        id: remote.id,
        username: remote.username,
        badge: remote.badge || "",
        moderator: Boolean(remote.moderator),
        team: remote.input?.team || (index % 2 === 0 ? "blue" : "red"),
        x: Number(remote.input?.x ?? player.position.x + 8 + index * 4),
        y: Number(remote.input?.y ?? 0),
        z: Number(remote.input?.z ?? player.position.z + 8 + index * 4),
        heading: Number(remote.input?.heading ?? 0),
        speed: Number(remote.input?.speed ?? 0),
        airborne: Boolean(remote.input?.airborne),
        backflip: Boolean(remote.input?.backflip),
        barrelRoll: Boolean(remote.input?.barrelRoll),
        boost: Boolean(remote.input?.boost),
        shield: Number(remote.input?.shield ?? 0),
        health: Number(remote.input?.health ?? 0),
        ammo: Number(remote.input?.ammo ?? 0),
        trick: remote.input?.trick || "",
        cosmetics: remote.input?.cosmetics || null,
      })),
  );
}

function sendOnlineInputFrame(dt = 1 / 60) {
  if (!isOnlineSocketOpen() || !onlineState.room || !state.running) return;
  onlineState.inputSeq += 1;
  if (onlineState.inputSeq % 4 !== 0) return;
  const battle = state.modeRun?.battle || {};
  sendOnlineMessage(
    {
      type: "input.frame",
      seq: onlineState.inputSeq,
      dt: Number(Math.min(0.12, Math.max(0, dt)).toFixed(3)),
      mode: getModeDefinition().id,
      x: Number(player.position.x.toFixed(2)),
      y: Number(player.position.y.toFixed(2)),
      z: Number(player.position.z.toFixed(2)),
      heading: Number(player.heading.toFixed(4)),
      speed: Math.round(Math.abs(player.speed) * SPEED_TO_MPH_MULT),
      throttle: input.throttle ? 1 : input.brake ? -1 : 0,
      steer: Number(getSteer().toFixed(3)),
      drift: Boolean(input.drift),
      boost: Boolean(input.boost),
      jump: Boolean(input.backflip),
      airborne: isCarAirborne(player),
      backflip: Boolean(player.backflipActive),
      barrelRoll: Boolean(player.barrelRollActive),
      trick: state.modeRun?.stunt?.trick
        ? state.modeRun.stunt.trick.toLowerCase().replace(/[^a-z0-9-]+/g, "-")
        : "",
      shield: Number(
        Math.max(state.shield || 0, (battle.shield || 0) / 5).toFixed(2),
      ),
      health: Math.round(battle.health || 0),
      ammo: Math.round(battle.ammo || 0),
      team: isBattleMode() || isMaxMode() ? "blue" : "neutral",
      cosmetics: {
        bodyId: customization.bodyId,
        wheelId: customization.wheelId,
        styleId: customization.styleId,
        powerId: customization.powerId,
        paintId: customization.paintId,
        accentId: customization.accentId,
        tintId: customization.tintId,
        spoilerId: customization.spoilerId,
        glowId: customization.glowId,
        classId: getActiveLoadout()?.classId || "balanced",
      },
      client: {
        x: Number(player.position.x.toFixed(2)),
        y: Number(player.position.y.toFixed(2)),
        z: Number(player.position.z.toFixed(2)),
        heading: Number(player.heading.toFixed(4)),
        airborne: isCarAirborne(player),
        speed: Math.round(Math.abs(player.speed) * SPEED_TO_MPH_MULT),
      },
    },
    { queue: false },
  );
}

function hideChatNotice() {
  if (onlineState.chatNoticeTimer) {
    clearTimeout(onlineState.chatNoticeTimer);
    onlineState.chatNoticeTimer = 0;
  }
  if (chatNotice) chatNotice.hidden = true;
}

function showChatNotice(message) {
  if (!chatNotice || onlineState.chatOpen) return;
  const from = sanitizeRemoteUsername(message.from || "Chat");
  const text = String(message.text || "")
    .replace(/[<>]/g, "")
    .trim();
  if (!text || from === "System") return;
  if (chatNoticeFrom) chatNoticeFrom.textContent = from.slice(0, 24);
  if (chatNoticeText) {
    chatNoticeText.textContent =
      text.length > 96 ? `${text.slice(0, 93).trim()}...` : text;
  }
  chatNotice.hidden = false;
  if (onlineState.chatNoticeTimer) clearTimeout(onlineState.chatNoticeTimer);
  onlineState.chatNoticeTimer = window.setTimeout(() => hideChatNotice(), 5000);
}

function pushOnlineChatMessage(message, { notify = true } = {}) {
  const clean = {
    from: sanitizeRemoteUsername(message.from || "System"),
    userId: String(message.userId || ""),
    badge: sanitizeBadgeLabel(message.badge),
    moderator: Boolean(message.moderator),
    text: String(message.text || "")
      .replace(/[<>]/g, "")
      .slice(0, 180),
    quick: Boolean(message.quick),
    at: Number.isFinite(Number(message.at)) ? Number(message.at) : Date.now(),
  };
  onlineState.chatMessages.push(clean);
  onlineState.chatMessages = onlineState.chatMessages.slice(-80);
  const ownUserId = onlineState.user?.id || "";
  const ownName = onlineState.user?.username || onlineState.username;
  if (
    notify &&
    clean.userId !== ownUserId &&
    clean.from !== ownName &&
    !onlineState.chatOpen
  ) {
    showChatNotice(clean);
  }
}

function sendQuickChat(text) {
  sendOnlineMessage({ type: "quick.send", text });
}

function sendFreeChat(text) {
  const clean = String(text || "").trim();
  if (!clean) return;
  if (!canUseOnlineFreeChat()) {
    pushOnlineChatMessage({
      from: "System",
      text: "Free chat is 13+; quick chat is available.",
      quick: true,
    });
    updateOnlineUi();
    return;
  }
  sendOnlineMessage({
    type: "chat.send",
    text: clean,
    age: onlineState.age,
    channel: "lobby",
  });
  if (onlineChatInput) onlineChatInput.value = "";
  if (chatPopoutInput) chatPopoutInput.value = "";
}

function renderChatLog(target) {
  if (!target) return;
  target.replaceChildren();
  const messages = onlineState.chatMessages.slice(-12);
  if (!messages.length) {
    const empty = document.createElement("div");
    empty.className = "hint";
    empty.textContent = "No chat messages yet.";
    target.appendChild(empty);
    return;
  }
  messages.forEach((message) => {
    const row = document.createElement("div");
    row.className = "chat-message";
    const from = document.createElement("span");
    from.className = "chat-sender";
    renderPlayerNameInline(from, {
      username: message.quick ? `${message.from} · Quick` : message.from,
      userId: message.userId,
      badge: message.badge,
      moderator: message.moderator,
    });
    const text = document.createElement("span");
    text.textContent = message.text;
    row.append(from, text);
    target.appendChild(row);
  });
  target.scrollTop = target.scrollHeight;
}

function renderQuickChat(target) {
  if (!target) return;
  target.replaceChildren();
  QUICK_CHAT_MESSAGES.forEach((text) => {
    const button = document.createElement("button");
    button.className = "ghost";
    button.type = "button";
    button.textContent = text;
    bindPressAction(button, () => sendQuickChat(text));
    target.appendChild(button);
  });
}

function renderOnlineRows(target, rows, emptyText, formatter) {
  if (!target) return;
  target.replaceChildren();
  if (!rows.length) {
    target.textContent = emptyText;
    return;
  }
  rows.forEach((row, index) => {
    const item = document.createElement("div");
    item.className = "online-row";
    const [left, right] = formatter(row, index);
    const leftNode = document.createElement("span");
    leftNode.textContent = left;
    const rightNode = document.createElement("strong");
    rightNode.textContent = right;
    item.append(leftNode, rightNode);
    target.appendChild(item);
  });
}

function renderOnlinePlayerRows(target, rows, emptyText, rightFormatter) {
  if (!target) return;
  target.replaceChildren();
  if (!rows.length) {
    target.textContent = emptyText;
    return;
  }
  rows.forEach((row) => {
    const item = document.createElement("div");
    item.className = "online-row player-row";
    const leftNode = document.createElement("span");
    leftNode.className = "online-player-name";
    renderPlayerNameInline(leftNode, {
      username: row.username || row.name || "Player",
      userId: row.userId || row.id,
      badge: row.badge,
      moderator: row.moderator,
    });
    const rightNode = document.createElement("strong");
    rightNode.textContent = rightFormatter(row);
    item.append(leftNode, rightNode);
    target.appendChild(item);
  });
}

function renderFriendRequestRows() {
  if (!onlineFriendRequests) return;
  onlineFriendRequests.replaceChildren();
  const incoming = onlineState.incomingFriendRequests;
  const outgoing = onlineState.outgoingFriendRequests;
  if (!incoming.length && !outgoing.length) {
    onlineFriendRequests.textContent = "No friend requests yet.";
    return;
  }
  incoming.forEach((request) => {
    const item = document.createElement("div");
    item.className = "online-row player-row";
    const leftNode = document.createElement("span");
    leftNode.className = "online-player-name";
    renderPlayerNameInline(leftNode, {
      username: request.fromUsername || request.username || "Player",
      userId: request.fromUserId,
      badge: request.badge,
      moderator: request.moderator,
    });
    const button = document.createElement("button");
    button.className = "ghost mini-action";
    button.type = "button";
    button.textContent = "Accept";
    bindPressAction(button, () => {
      sendOnlineMessage({ type: "friend.accept", requestId: request.id });
    });
    item.append(leftNode, button);
    onlineFriendRequests.appendChild(item);
  });
  outgoing.forEach((request) => {
    const item = document.createElement("div");
    item.className = "online-row player-row";
    const leftNode = document.createElement("span");
    leftNode.className = "online-player-name";
    renderPlayerNameInline(leftNode, {
      username: request.toUsername || request.username || "Player",
      userId: request.toUserId,
      badge: request.badge,
      moderator: request.moderator,
    });
    const rightNode = document.createElement("strong");
    rightNode.textContent = "Pending";
    item.append(leftNode, rightNode);
    onlineFriendRequests.appendChild(item);
  });
}

function getLeaderboardXp(row) {
  return Math.max(
    0,
    Math.floor(
      Number(row?.totalXp ?? row?.xp ?? row?.score ?? row?.rating) || 0,
    ),
  );
}

function compareLeaderboard(a, b) {
  return getLeaderboardXp(b) - getLeaderboardXp(a);
}

function getLeaderboardTier(row, index = 0) {
  const xp = getLeaderboardXp(row);
  if ((index === 0 && xp > 0) || xp >= 5000) return "Inferno";
  if (xp >= 3000) return "Diamond";
  if (xp >= 1500) return "Gold";
  if (xp >= 500) return "Silver";
  return "Bronze";
}

function getLocalXpLeaderboardRows() {
  return [...SEEDED_LEADERBOARD_ROWS, getCurrentPlayerXpLeaderboardRow()].sort(
    compareLeaderboard,
  );
}

function getCurrentPlayerXpLeaderboardRow() {
  const playerXp = getProgressionTotalXp();
  const userId = onlineState.user?.id || "";
  return {
    id: userId ? `local-${userId}` : "local-player-xp",
    userId,
    username: onlineState.username || "Guest Racer",
    badge: onlineState.user?.badge || "",
    moderator: isCurrentOnlineModerator(),
    xp: playerXp,
    totalXp: playerXp,
    playlist: "all modes",
    source: onlineState.guestTemporary ? "guest" : "local",
    scope: "Total XP",
  };
}

function getDisplayLeaderboardRows() {
  const rows = onlineState.leaderboard.length
    ? [...onlineState.leaderboard]
    : getLocalXpLeaderboardRows();
  const playerRow = onlineState.leaderboardPlayerRow
    ? {
        ...onlineState.leaderboardPlayerRow,
        source: onlineState.leaderboardPlayerRow.source || "server",
      }
    : getCurrentPlayerXpLeaderboardRow();
  const existingIndex = rows.findIndex(
    (row) => playerRow.userId && row.userId === playerRow.userId,
  );
  if (existingIndex >= 0) {
    const xp = Math.max(getLeaderboardXp(rows[existingIndex]), playerRow.xp);
    rows[existingIndex] = {
      ...rows[existingIndex],
      xp,
      totalXp: xp,
    };
  } else if (
    playerRow.userId ||
    playerRow.xp > 0 ||
    onlineState.guestTemporary
  ) {
    rows.push(playerRow);
  }
  return rows.sort(compareLeaderboard);
}

function renderLeaderboardRows(target, rows, emptyText) {
  if (!target) return;
  target.replaceChildren();
  if (!rows.length) {
    target.textContent = emptyText;
    return;
  }
  rows.forEach((row, index) => {
    const tier = getLeaderboardTier(row, index);
    const item = document.createElement("div");
    item.className = `leaderboard-row tier-${tier.toLowerCase()}`;
    const rank = document.createElement("span");
    rank.className = "rank-badge";
    rank.textContent = `#${index + 1}`;
    const middle = document.createElement("div");
    middle.className = "leaderboard-racer";
    const name = document.createElement("span");
    name.className = "leaderboard-name";
    renderPlayerNameInline(name, {
      username: row.username || "Player",
      userId: row.userId || row.id,
      badge: row.badge,
      moderator: row.moderator,
    });
    const meta = document.createElement("span");
    meta.textContent = `${row.scope || "Total XP"} · ${row.source === "server" ? "server" : row.source === "guest" ? "guest session" : "local"}`;
    middle.append(name, meta);
    const score = document.createElement("div");
    score.className = "leaderboard-score";
    const tierBadge = document.createElement("span");
    tierBadge.className = "tier-badge";
    tierBadge.textContent = tier;
    const value = document.createElement("strong");
    value.textContent = `${getLeaderboardXp(row).toLocaleString()} XP`;
    score.append(tierBadge, value);
    item.append(rank, middle, score);
    target.appendChild(item);
  });
}

function updateProfileUi() {
  const user = onlineState.user;
  const username = user?.username || onlineState.username || "Offline Driver";
  const totalXp = getProgressionTotalXp();
  if (profileDisplayName) profileDisplayName.textContent = username;
  if (profileStatusText) {
    profileStatusText.textContent = user
      ? onlineState.guestTemporary
        ? "Temporary guest profile. Online rooms work, but durable progress requires an account."
        : "Signed in. Progress, friends, chat, and leaderboard sync use the InfernoDrift4 backend."
      : "Offline profile. Sign in or play as guest to use online rooms, friends, chat, and leaderboard sync.";
  }
  if (profileBadges) {
    profileBadges.replaceChildren();
    [
      user?.badge,
      user?.moderator ? "Moderator" : "",
      onlineState.guestTemporary ? "Guest" : user ? "Account" : "Offline",
    ]
      .filter(Boolean)
      .forEach((label) => {
        const badge = document.createElement("span");
        badge.className = "profile-badge";
        badge.textContent = label;
        profileBadges.appendChild(badge);
      });
  }
  if (profileLevel) profileLevel.textContent = String(getProgressionLevel());
  if (profileXp) profileXp.textContent = totalXp.toLocaleString();
  if (profileSaveState) {
    profileSaveState.textContent =
      onlineState.profileMode === "account"
        ? onlineState.saveSyncedAt
          ? "Synced"
          : "Ready"
        : onlineState.guestTemporary
          ? "Guest"
          : "Local";
  }
  if (profileLeaderboardState) {
    profileLeaderboardState.textContent = onlineState.leaderboardSyncedAt
      ? "Live XP"
      : isOnlineSocketOpen()
        ? "Refreshing"
        : "Offline";
  }
  if (profileLogout) profileLogout.disabled = !onlineState.sessionToken;
  if (profileDelete) {
    profileDelete.disabled =
      !onlineState.user || onlineState.profileMode !== "account";
  }
  if (profileActionStatus) {
    profileActionStatus.textContent =
      onlineState.profileDeleteStatus ||
      onlineState.profileActionStatus ||
      "Deleting removes your online account, saves, friends, leaderboard identity, and releases your username.";
  }
}

function updateOnlineUi() {
  const connected = isOnlineSocketOpen();
  const activeTab =
    document.querySelector(".tab-btn.active")?.dataset.tab ?? "";
  if (connected && (activeTab === "leaderboard" || activeTab === "progress")) {
    requestOnlineLeaderboard();
  }
  if (
    connected &&
    activeTab === "profile" &&
    performance.now() - onlineState.leaderboardSyncedAt > 12000
  ) {
    requestOnlineProfile();
    requestOnlineLeaderboard();
  }
  if (
    onlineBackendUrlInput &&
    document.activeElement !== onlineBackendUrlInput
  ) {
    onlineBackendUrlInput.value = onlineState.backendUrl;
  }
  if (onlineUsernameInput && document.activeElement !== onlineUsernameInput) {
    onlineUsernameInput.value = onlineState.username;
  }
  if (onlineAgeInput && document.activeElement !== onlineAgeInput) {
    onlineAgeInput.value =
      onlineState.age === null ? "" : String(onlineState.age);
  }
  const chatAllowed = canUseOnlineFreeChat();
  if (onlineAgeNote) {
    onlineAgeNote.textContent = chatAllowed
      ? "13+ free chat is enabled. Quick chat stays available for everyone."
      : "Under-13 or unset age: quick chat only.";
  }
  [onlineChatInput, chatPopoutInput, onlineChatSend, chatPopoutSend].forEach(
    (node) => {
      if (node) node.disabled = !chatAllowed;
    },
  );
  if (onlineConnect) onlineConnect.disabled = connected;
  if (onlineDisconnect) onlineDisconnect.disabled = !onlineState.socket;
  if (onlineClaim) onlineClaim.disabled = false;
  if (onlineRoomMode && document.activeElement !== onlineRoomMode) {
    onlineRoomMode.value = onlineState.room?.mode || settings.activeGameMode;
  }
  if (onlineShareRoom) {
    onlineShareRoom.disabled =
      !onlineState.room?.code || onlineState.roomShared;
    onlineShareRoom.textContent = onlineState.roomShared
      ? "Shared"
      : "Share Code";
  }
  if (onlineRoomState) {
    const room = onlineState.room;
    onlineRoomState.textContent = room
      ? `Room ${room.code || room.id}: ${room.players?.length || 0}/${room.size || "?"} players, ${room.bots || 0} bots, ${getModeDefinition(room.mode).label}`
      : onlineState.queue
        ? `Queued for ${onlineState.queue.playlist || "casual"} ${onlineState.queue.teamSize || 2}v${onlineState.queue.teamSize || 2}`
        : "No room joined.";
  }
  renderChatLog(onlineChatLog);
  renderChatLog(chatPopoutLog);
  syncStartAccountFields();
  const leaderboardRows = getDisplayLeaderboardRows();
  renderLeaderboardRows(
    onlineLeaderboard,
    leaderboardRows,
    "Finish any run to enter the XP leaderboard.",
  );
  updateProfileUi();
  renderFriendRequestRows();
  renderOnlinePlayerRows(
    onlineFriends,
    onlineState.friends,
    "No friends from backend yet.",
    (row) => (row.online ? "Online" : ""),
  );
  renderOnlinePlayerRows(
    onlineRecent,
    onlineState.recentPlayers,
    "No recent players yet.",
    (row) => (row.online === false ? "Offline" : "Recent"),
  );
  if (chatPopout) chatPopout.hidden = !onlineState.chatOpen;
}

function setChatPopoutOpen(open) {
  onlineState.chatOpen = open;
  if (open) hideChatNotice();
  if (!open) returnFocusToGame();
  updateOnlineUi();
}

function openFeedbackModal() {
  onlineState.feedbackReturnToMenu = isMenuOpen();
  onlineState.chatOpen = false;
  if (onlineState.feedbackReturnToMenu) setMenuOpen(false);
  if (feedbackModal) {
    feedbackModal.classList.add("show");
    feedbackModal.style.transition = "none";
    feedbackModal.style.opacity = "1";
    feedbackModal.style.pointerEvents = "auto";
  }
  if (feedbackStatus) {
    feedbackStatus.dataset.state = onlineState.lastFeedbackStatus;
    feedbackStatus.textContent =
      onlineState.lastFeedbackStatus === "saved"
        ? getFeedbackDeliveryMessage({
            delivery: onlineState.lastFeedbackDelivery,
            emailConfigured: onlineState.feedbackEmailConfigured,
            emailError: onlineState.lastFeedbackError,
          })
        : onlineState.lastFeedbackError ||
          "Feedback saves only when a backend endpoint is configured.";
  }
}

function closeFeedbackModal() {
  if (feedbackModal) {
    feedbackModal.classList.remove("show");
    feedbackModal.style.transition = "";
    feedbackModal.style.opacity = "";
    feedbackModal.style.pointerEvents = "";
  }
  if (onlineState.feedbackReturnToMenu) {
    onlineState.feedbackReturnToMenu = false;
    setMenuOpen(true);
  } else {
    returnFocusToGame();
  }
}

function getFeedbackDeliveryMessage(result = {}) {
  const delivery = result.delivery || "stored";
  if (delivery === "delivered") {
    return "Feedback saved and email notification sent.";
  }
  if (delivery === "stored_email_failed") {
    const detail = result.emailError ? ` (${result.emailError})` : "";
    return `Feedback saved, but email delivery failed${detail}.`;
  }
  if (delivery === "stored_email_not_configured") {
    return "Feedback saved by the backend. Email delivery is not configured yet.";
  }
  return result.emailConfigured
    ? "Feedback saved by the configured backend."
    : "Feedback saved by the backend. Email delivery is not configured yet.";
}

async function submitFeedback() {
  const configuredUrl =
    onlineState.feedbackUrl ||
    (!onlineState.backendDefaulted || isOnlineSocketOpen()
      ? deriveFeedbackUrl(onlineState.backendUrl)
      : "");
  const message = String(feedbackMessage?.value || "").trim();
  if (!message) {
    onlineState.lastFeedbackStatus = "error";
    onlineState.lastFeedbackError = "Please add a feedback message.";
    updateFeedbackStatus();
    return;
  }
  if (!configuredUrl) {
    onlineState.lastFeedbackStatus = "not_configured";
    onlineState.lastFeedbackError =
      "Feedback is not configured. Set window.INFERNO_FEEDBACK_URL, ?feedback=, or local feedback config.";
    updateFeedbackStatus();
    return;
  }
  const age13 = Boolean(feedbackAge13?.checked);
  const payload = {
    feedbackType: feedbackType?.value || "other",
    message,
    diagnostics: feedbackDiagnostics?.checked
      ? JSON.parse(window.render_game_to_text())
      : null,
    replyEmail: age13 ? String(feedbackEmail?.value || "").trim() : "",
    age13OrOlder: age13,
    client: "InfernoDrift4 static client",
    at: new Date().toISOString(),
  };
  try {
    updateFeedbackStatus("Saving feedback...");
    const response = await fetch(configuredUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`backend returned ${response.status}`);
    }
    const result = await response.json().catch(() => ({}));
    onlineState.feedbackUrl = configuredUrl;
    onlineState.lastFeedbackStatus = "saved";
    onlineState.lastFeedbackDelivery = result.delivery || "stored";
    onlineState.feedbackEmailConfigured = Boolean(result.emailConfigured);
    onlineState.lastFeedbackError = result.emailError || "";
    saveOnlineConfig();
    if (feedbackMessage) feedbackMessage.value = "";
    updateFeedbackStatus(getFeedbackDeliveryMessage(result));
  } catch (error) {
    onlineState.lastFeedbackStatus = "error";
    onlineState.lastFeedbackDelivery = "error";
    onlineState.feedbackEmailConfigured = false;
    onlineState.lastFeedbackError = `Feedback was not saved: ${error?.message || "request failed"}`;
    updateFeedbackStatus();
  }
}

function updateFeedbackStatus(text = "") {
  if (!feedbackStatus) return;
  feedbackStatus.dataset.state = onlineState.lastFeedbackStatus;
  feedbackStatus.textContent =
    text ||
    onlineState.lastFeedbackError ||
    "Feedback saves only when a backend endpoint is configured.";
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
  if (touchLaser) {
    touchLaser.hidden = !(input.touchEnabled && isBattleMode());
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
    setEffectToast("Arena Lunge");
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

function renderModeBoard() {
  if (!modeBoard) return;
  const activeId = normalizeGameModeId(settings.activeGameMode);
  const groups = Object.keys(MODE_CATEGORY_LABELS)
    .map((category) => [
      category,
      MODE_CATALOG.filter((mode) => mode.category === category),
    ])
    .filter(([, modes]) => modes.length > 0);
  modeBoard.innerHTML = groups
    .map(
      ([category, modes]) => `
        <section class="mode-group" aria-label="${MODE_CATEGORY_LABELS[category]} modes">
          <div class="mode-group-title">${MODE_CATEGORY_LABELS[category]}</div>
          <div class="games-grid">
            ${modes
              .map((mode) => {
                const best = state.progressionV2.personalBests[mode.id];
                const medal = state.progressionV2.medals[mode.id] ?? "New";
                const length =
                  mode.time > 0 ? `${mode.time}s run` : "Campaign heat";
                const thumbPosition =
                  MODE_THUMBNAIL_POSITIONS[mode.id] ?? "50% 50%";
                const legacyId =
                  mode.id === GAME_MODE_ID33
                    ? ` id="game-card-id33"`
                    : mode.id === GAME_MODE_MAX1
                      ? ` id="game-card-max1"`
                      : "";
                return `
                  <button${legacyId} class="game-card mode-card ${activeId === mode.id ? "active" : ""}" data-game-mode="${mode.id}" type="button">
                    <div class="mode-card-art" data-scene="${mode.scene}" data-thumb="generated" style="--thumb-position: ${thumbPosition};" aria-hidden="true"></div>
                    <div class="game-card-copy">
                      <strong>${mode.label}</strong>
                      <span>${mode.objective}</span>
                      <small>${length} • ${mode.reward}</small>
                      <em>${medal} medal${best ? ` • Best ${best.score}` : ""}</em>
                    </div>
                  </button>`;
              })
              .join("")}
          </div>
        </section>`,
    )
    .join("");
}

function refreshGamesUi() {
  const maxProfile = getMaxDifficultyProfile();
  renderModeBoard();
  const activeMode = getModeDefinition();
  if (modeBrief) {
    const best = state.progressionV2.personalBests[activeMode.id];
    modeBrief.innerHTML = `<strong>${activeMode.label}</strong><span>${activeMode.objective}</span><em>${activeMode.reward}${best ? ` • Best ${best.score}` : ""}</em>`;
  }
  if (startBtn) {
    startBtn.textContent = "Play as Guest";
  }
  if (overlaySubtitle) {
    overlaySubtitle.textContent = isMaxMode()
      ? `${maxProfile.label} arena rules. Faster cars, cleaner reads, stronger squad play, and smarter goal pressure.`
      : `${activeMode.objective} Every run keeps the current InfernoDrift4 driving base: drift, boost, jump, recover, and restart fast.`;
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
      ? `Max settings: ${maxProfile.label} controls arena size, assist, camera, and enemy squad difficulty. Campaign hunter settings do not apply here.`
      : `Campaign settings: hunter difficulty, ramp density, free-play options, and Hunter AI (${getCampaignAiDisplayLabel()}).`;
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
}

function setActiveTab(tabName = "settings") {
  tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabName);
  });
  tabPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === `tab-${tabName}`);
  });
  if (tabName === "customize") {
    initGaragePreview();
    refreshGaragePreview();
  }
  if (tabName === "progress") renderProgressPanel();
  if (tabName === "controls") renderControlsUi();
  if (tabName === "profile") {
    if (isOnlineSocketOpen()) requestOnlineProfile();
    updateOnlineUi();
  }
  if (tabName === "online") updateOnlineUi();
  if (tabName === "leaderboard") {
    requestOnlineLeaderboard({ force: true });
    updateOnlineUi();
  }
}

function setActiveGameMode(mode, { save = true, reset = false } = {}) {
  const nextMode = normalizeGameModeId(mode);
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

function enterOnlineRoomMode(mode, { start = false } = {}) {
  const nextMode = normalizeGameModeId(mode);
  if (!MODE_BY_ID[nextMode]) return false;
  const previousMode = settings.activeGameMode;
  setActiveGameMode(nextMode, { save: true, reset: start });
  if (onlineRoomMode && document.activeElement !== onlineRoomMode) {
    onlineRoomMode.value = nextMode;
  }
  if (start || previousMode !== nextMode) {
    setEffectToast(`${getModeDefinition(nextMode).label} Room`, {
      pulse: 0.28,
    });
  }
  updateOnlineUi();
  return previousMode !== nextMode || start;
}

function getModeHelp(mode = getModeDefinition()) {
  const common = {
    controls: `Drive with WASD or arrows. ${formatCodeLabel(controlBindings.jumpTrick[0])} jumps and flips in air. Space drifts. Shift boosts.`,
    tips: "Restart with R for a fast retry.",
  };
  const table = {
    [GAME_MODE_ID33]: {
      title: "Campaign Survival",
      objective:
        "Survive the world heat, use ramps and boost pads, and dodge hunter bots until the timer ends.",
      scoring:
        "Score comes from survival, drifting, jumps, near misses, and clean landings.",
      win: "Win when the clock expires with lives remaining.",
      tips: "Hunter cars are green. Bait them wide, then cut back through boost pads.",
    },
    [GAME_MODE_MAX1]: {
      title: "Max Arena",
      objective: "Score goals for Blue by hitting the ball into the red goal.",
      scoring:
        "Goals decide the match; touches, saves, boosts, and replays add score.",
      win: "First to the goal target, or most goals when time ends.",
      tips: "Use Ball Cam with L and lunge with Ctrl or Command near the ball.",
    },
    [GAME_MODE_RACE]: {
      title: "Race",
      objective:
        "Follow the winding asphalt course through every gate while rivals race beside you.",
      scoring: "Gates, clean racing lines, and rival bumps add score.",
      win: "Clear all checkpoints before time runs out.",
      tips: "Rivals bump like arcade racers; they do not damage you.",
    },
    [GAME_MODE_TIME_TRIAL]: {
      title: "Time Trial",
      objective: "Drive the same winding course solo and beat your ghost.",
      scoring: "Fast gates and a clean finish build the best ghost.",
      win: "Clear all checkpoints before time runs out.",
      tips: "No bots, no hunters: keep the car on the guardrails and restart fast.",
    },
    [GAME_MODE_STUNT]: {
      title: "Stunt Park",
      objective:
        "Chain ramps, loops, rings, barrel rolls, flips, and clean landings.",
      scoring:
        "Air rings, loops, barrel rolls, and landing grades build the stunt chain.",
      win: "Reach the stunt target before time ends.",
      tips: "Use steering in the air for barrel rolls; loops need speed.",
    },
    [GAME_MODE_HUNTER_TAG]: {
      title: "Hunter Tag",
      objective:
        "Escape through gates. If tagged, chase the marked hunter and tag them back.",
      scoring: "Escape gates, near misses, and tag-backs add score.",
      win: "Clear the tag target before time ends.",
      tips: "When you are it, the marked hunter runs away while others screen you.",
    },
    [GAME_MODE_BATTLE]: {
      title: "Battle Arena",
      objective:
        "Blue team fights Red in toy-like laser tag. Use cover, ammo, and shields.",
      scoring:
        "Laser KOs score for your team. First team to the KO target wins.",
      controls: `${common.controls} F fires your forward laser. Pick up Ammo Refill and Shield Bubble.`,
      win: "Blue wins by reaching the KO target before Red.",
      tips: "Face enemies before firing; hide behind solid barriers while reloading.",
    },
    [GAME_MODE_RAMP_RUSH]: {
      title: "Ramp Rush",
      objective: "Hit each ramp lane and fly through the airborne rings.",
      scoring: "Ramp hits, ring passes, clean landings, and chain speed score.",
      win: "Clear all ramp rings before time ends.",
      tips: "No hunters here: line up early and hold boost into the big ramps.",
    },
    [GAME_MODE_BOOST_BOWLING]: {
      title: "Boost Bowling",
      objective:
        "Bowl ten frames down the lane. After GO, steer only and knock down pins.",
      scoring:
        "Standard strikes, spares, frame bonuses, and pin totals decide the score.",
      controls:
        "During a roll, steering is the only control. The launch accelerates for you.",
      win: "Finish all ten frames.",
      tips: "Aim before GO. Lane walls keep you in the alley.",
    },
    [GAME_MODE_LAVA_FLOOR]: {
      title: "Lava Floor",
      objective:
        "Drive up to each rising safe platform before the lava catches you.",
      scoring: "Safe platforms, clean climbs, and bump survival build score.",
      win: "Reach every safe platform before time ends.",
      tips: "Bots race for the same platforms and can bump you off.",
    },
    [GAME_MODE_KING_ZONE]: {
      title: "King of the Zone",
      objective: "Hold the active zones while bots try to bump you out.",
      scoring: "Time in zone and drift control build your score.",
      win: "Fill the zone timer before time runs out.",
      tips: "Short drifts hold the zone better than huge slides.",
    },
  };
  return {
    ...common,
    ...(table[mode.id] ?? table[GAME_MODE_ID33]),
  };
}

function openModeHelp() {
  state.modeHelpWasRunning = state.running;
  state.modeHelpOpen = true;
  setMenuOpen(false);
  renderModeHelpCard();
  document.body.classList.add("mode-help-open");
}

function closeModeHelp({ resume = true } = {}) {
  state.modeHelpOpen = false;
  if (modeHelpCard) modeHelpCard.hidden = true;
  document.body.classList.remove("mode-help-open");
  if (resume && state.modeHelpWasRunning) state.running = true;
  state.modeHelpWasRunning = false;
  returnFocusToGame();
}

function renderModeHelpCard() {
  if (!modeHelpCard) return;
  const help = getModeHelp();
  if (modeHelpTitle) modeHelpTitle.textContent = help.title;
  if (modeHelpObjective) modeHelpObjective.textContent = help.objective;
  if (modeHelpControls) modeHelpControls.textContent = help.controls;
  if (modeHelpScoring) modeHelpScoring.textContent = help.scoring;
  if (modeHelpWin) modeHelpWin.textContent = help.win;
  if (modeHelpTip) modeHelpTip.textContent = help.tips;
  modeHelpCard.hidden = false;
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
        <div><span>Handbrake:</span> Space</div>
        <div><span>Jump / Trick:</span> ${formatCodeLabel(controlBindings.jumpTrick[0])}</div>
        <div><span>Backflip:</span> ${formatCodeLabel(controlBindings.jumpTrick[0])} in air or ${formatCodeLabel(controlBindings.altTrick[0])}</div>
        <div><span>Arena Lunge:</span> Ctrl / Command near the ball or a rival</div>
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
        <div><span>Jump / Trick:</span> ${formatCodeLabel(controlBindings.jumpTrick[0])}</div>
        <div><span>Backflip:</span> ${formatCodeLabel(controlBindings.jumpTrick[0])} in air or ${formatCodeLabel(controlBindings.altTrick[0])}</div>
        <div><span>Restart:</span> R</div>
        <div><span>Menu:</span> Esc</div>
        <div><span>Start / Next:</span> Enter</div>
      `;
  }
  if (howtoList) {
    const help = getModeHelp();
    howtoList.innerHTML = `
      <li><strong>${help.title}:</strong> ${help.objective}</li>
      <li><strong>Controls:</strong> ${help.controls}</li>
      <li><strong>Scoring:</strong> ${help.scoring}</li>
      <li><strong>Win:</strong> ${help.win}</li>
      <li><strong>Tip:</strong> ${help.tips}</li>
    `;
  }
  if (state.modeHelpOpen) renderModeHelpCard();
  if (touchDrift) {
    touchDrift.textContent = "Drift";
  }
  if (touchBackflip) {
    touchBackflip.textContent = "Trick";
    touchBackflip.hidden = !input.touchEnabled;
  }
  if (touchLaser) {
    touchLaser.textContent = "Laser";
    touchLaser.hidden = !(input.touchEnabled && isBattleMode());
  }
}

function renderProgressPanel() {
  if (!progressPanel) return;
  const world = getWorld();
  const level = getLevel();
  const progression = state.progressionV2;
  const dailyGift = getDailyGiftSnapshot(progression);
  const clearedWorlds = state.worldIndex;
  const clearedLevels = state.levelIndex;
  const totalLevels = worldData.reduce(
    (sum, item) => sum + item.levels.length,
    0,
  );
  const clearedTotal =
    worldData
      .slice(0, state.worldIndex)
      .reduce((sum, item) => sum + item.levels.length, 0) + state.levelIndex;
  const percent = Math.round(
    (clearedTotal / Math.max(1, totalLevels - 1)) * 100,
  );
  const lockedParts = getLockedGarageOptionCount();
  const medals = Object.values(progression.medals);
  const bests = Object.entries(progression.personalBests)
    .sort(([, a], [, b]) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 3);
  const recentReward =
    progression.rewardLog[0]?.reward ??
    "Finish a run to preview the next reward.";
  const nextGarageUnlock = getNextGarageUnlock();
  const dailyMode = getModeDefinition(progression.daily.modeId);
  const weeklyMode = getModeDefinition(progression.weekly.modeId);
  const totalXp = getProgressionTotalXp(progression);
  const xpIntoLevel = totalXp % 500;
  const nextRecommended =
    bests.length === 0 ? "Campaign Survival" : MODE_BY_ID[GAME_MODE_RACE].label;
  progressPanel.innerHTML = `
    <div class="progress-card progress-card-wide"><span>Total XP</span><strong>Level ${getProgressionLevel(progression)}</strong><span>${xpIntoLevel}/500 XP to next level • ${totalXp} XP across every game and minigame</span></div>
    <div class="progress-card"><span>Daily Gift</span><strong>+${dailyGift.amount} XP</strong><span>${dailyGift.available ? "Ready to redeem from the glowing gift." : "Claimed today. Come back tomorrow."}</span></div>
    <div class="progress-card"><span>Current Zone</span><strong>${world.name}</strong><span>${level.name}</span></div>
    <div class="progress-card"><span>Campaign Map</span><strong>${percent}%</strong><span>${clearedWorlds + 1} zones reached, ${clearedLevels + 1} current heat</span></div>
    <div class="progress-card"><span>Medals</span><strong>${medals.length}</strong><span>${medals.slice(-4).join(" / ") || "Earn your first medal."}</span></div>
    <div class="progress-card"><span>Daily</span><strong>${dailyMode.label}</strong><span>${Math.floor(progression.daily.progress)}/${progression.daily.target} • ${progression.daily.complete ? "Complete" : "Open"}</span></div>
    <div class="progress-card"><span>Weekly</span><strong>${weeklyMode.label}</strong><span>${Math.floor(progression.weekly.progress)}/${progression.weekly.target} • ${progression.weekly.complete ? "Complete" : "Open"}</span></div>
    <div class="progress-card"><span>Best Runs</span><strong>${bests[0] ? `${getModeDefinition(bests[0][0]).label}` : "No best yet"}</strong><span>${bests.map(([modeId, best]) => `${getModeDefinition(modeId).label}: ${best.score}`).join(" • ") || "Start any mode to set a best."}</span></div>
    <div class="progress-card"><span>Garage Unlocks</span><strong>${lockedParts} locked</strong><span>${nextGarageUnlock ? `${nextGarageUnlock.option.name} at XP Level ${nextGarageUnlock.level}` : recentReward}</span></div>
    <div class="progress-card progress-card-wide"><span>Next Run</span><strong>${nextRecommended}</strong><span>Short runs, fast restarts, and visible reward previews keep progress moving.</span></div>
  `;
}

function renderGarageLoadouts() {
  if (!loadoutSlots) return;
  loadoutSlots.innerHTML = "";
  garageState.loadouts.forEach((loadout, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `ghost loadout-slot${loadout.id === garageState.activeLoadoutId ? " active" : ""}`;
    button.textContent = `${index + 1}. ${loadout.name}`;
    button.setAttribute(
      "aria-pressed",
      loadout.id === garageState.activeLoadoutId ? "true" : "false",
    );
    bindPressAction(button, () => selectGarageLoadout(loadout.id));
    loadoutSlots.appendChild(button);
  });
  if (carClassSelect) {
    carClassSelect.innerHTML = "";
    CAR_CLASS_OPTIONS.forEach((option) => {
      const optionEl = document.createElement("option");
      optionEl.value = option.id;
      optionEl.textContent = option.name;
      optionEl.selected = option.id === getClassSummary().id;
      carClassSelect.appendChild(optionEl);
    });
  }
  if (garageClassSummary) {
    const summary = getClassSummary();
    garageClassSummary.innerHTML = `<strong>${summary.name}</strong><span>${summary.description}</span>`;
  }
}

function renderControlsUi() {
  if (controlsRemap) {
    controlsRemap.innerHTML = "";
    CONTROL_ACTIONS.forEach((action) => {
      const row = document.createElement("div");
      row.className = "remap-row";
      const button = document.createElement("button");
      button.type = "button";
      button.className = "ghost remap-button";
      button.dataset.action = action.id;
      button.textContent = formatCodeLabel(
        controlBindings[action.id]?.[0] ?? "",
      );
      bindPressAction(button, () => {
        state.awaitingRemapAction = action.id;
        button.classList.add("listening");
        button.textContent = "Press key";
      });
      row.innerHTML = `<strong>${action.label}</strong><span>${action.help}</span>`;
      row.appendChild(button);
      controlsRemap.appendChild(row);
    });
  }
  if (touchLayoutSelect) touchLayoutSelect.value = settings.touchLayout;
  if (touchScaleSelect) touchScaleSelect.value = String(settings.touchScale);
  if (exitLinkUrlInput && document.activeElement !== exitLinkUrlInput) {
    exitLinkUrlInput.value = settings.exitLinkUrl;
  }
  if (controllerStatus) {
    controllerStatus.textContent = gamepadState.connected
      ? `Controller: ${gamepadState.id || "connected"}`
      : "Controller: not detected";
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
const modeMarkers = [];
const modeDecor = [];
const battlePickups = [];
const battleFlags = [];
const boostPads = [];
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
    material.opacity = 0.22;
  });
} else {
  groundGrid.material.transparent = true;
  groundGrid.material.opacity = 0.22;
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
    this.barrelRollActive = false;
    this.barrelRollProgress = 0;
    this.barrelRollDirection = 1;
    this.barrelRollSpin = 0;
    this.battleShieldTimer = 0;
    this.shieldBubble = null;
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

    const shieldBubble = new THREE.Mesh(
      new THREE.SphereGeometry(2.35, 24, 16),
      new THREE.MeshBasicMaterial({
        color: config.glowColor,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    shieldBubble.position.y = 0.72;
    shieldBubble.visible = false;
    this.visualRoot.add(shieldBubble);
    this.shieldBubble = shieldBubble;
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
    if (this.barrelRollActive) {
      this.barrelRollProgress = Math.min(
        1,
        this.barrelRollProgress + dt / 0.64,
      );
      const ease = 0.5 - Math.cos(this.barrelRollProgress * Math.PI) * 0.5;
      const spin = this.barrelRollDirection * ease * Math.PI * 2;
      this.visualRoot.rotation.z += spin - this.barrelRollSpin;
      this.barrelRollSpin = spin;
      if (this.barrelRollProgress >= 1) {
        this.barrelRollActive = false;
        this.barrelRollProgress = 0;
        this.barrelRollSpin = 0;
      }
    }
    this.visualRoot.rotation.z += this.surfaceRoll;
    this.visualRoot.rotation.x += this.surfacePitch;
    if (this.shieldBubble) {
      const active = this.battleShieldTimer > 0 && !this.demolished;
      this.shieldBubble.visible = active;
      if (active) {
        const pulse = 1 + Math.sin(state.elapsed * 10) * 0.05;
        this.shieldBubble.scale.setScalar(pulse);
        this.shieldBubble.material.opacity =
          0.16 + Math.min(1, this.battleShieldTimer / 5) * 0.12;
      }
    }
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

  triggerBarrelRoll(direction = 1) {
    this.barrelRollActive = true;
    this.barrelRollProgress = 0;
    this.barrelRollDirection = direction < 0 ? -1 : 1;
    this.barrelRollSpin = 0;
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
const remotePlayers = new Map();
const remoteNameProjector = new THREE.Vector3();
let garagePreview = null;

function initGaragePreview() {
  if (!garagePreviewHost || garagePreview) return garagePreview;
  const previewCanvas = document.createElement("canvas");
  previewCanvas.setAttribute("aria-hidden", "true");
  garagePreviewHost.appendChild(previewCanvas);
  const previewRenderer = new THREE.WebGLRenderer({
    canvas: previewCanvas,
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  previewRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
  const previewScene = new THREE.Scene();
  previewScene.fog = new THREE.Fog(0x09111a, 12, 26);
  const previewCamera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
  const ambient = new THREE.HemisphereLight(0x89ddff, 0x170d09, 1.15);
  const key = new THREE.DirectionalLight(0xffd18c, 1.65);
  key.position.set(3.8, 5.4, 4.8);
  const rim = new THREE.DirectionalLight(0x56e9ff, 1.1);
  rim.position.set(-5, 3.2, -4);
  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(2.85, 3.2, 0.14, 48),
    new THREE.MeshStandardMaterial({
      color: 0x0c1722,
      roughness: 0.62,
      metalness: 0.18,
      emissive: 0x071625,
      emissiveIntensity: 0.45,
    }),
  );
  platform.position.y = -0.08;
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.55, 0.025, 8, 72),
    new THREE.MeshBasicMaterial({
      color: 0x5feaff,
      transparent: true,
      opacity: 0.44,
    }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.02;
  const previewCar = new Car({
    color: 0xfff1d0,
    accent: 0x12151c,
    isBot: false,
  });
  scene.remove(previewCar.healthBarGroup);
  previewCar.group.scale.setScalar(1.05);
  previewCar.group.position.y = 0.05;
  previewScene.add(ambient, key, rim, platform, ring, previewCar.group);
  garagePreview = {
    canvas: previewCanvas,
    renderer: previewRenderer,
    scene: previewScene,
    camera: previewCamera,
    car: previewCar,
    ring,
    width: 0,
    height: 0,
  };
  garageState.preview.ready = true;
  previewCanvas.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    garageState.preview.dragging = true;
    garageState.preview.lastX = event.clientX;
    garageState.preview.lastY = event.clientY;
    previewCanvas.setPointerCapture(event.pointerId);
  });
  previewCanvas.addEventListener("pointermove", (event) => {
    if (!garageState.preview.dragging) return;
    const dx = event.clientX - garageState.preview.lastX;
    garageState.preview.lastX = event.clientX;
    garageState.preview.lastY = event.clientY;
    garageState.preview.yaw += dx * 0.012;
  });
  const stopDrag = () => {
    garageState.preview.dragging = false;
  };
  previewCanvas.addEventListener("pointerup", stopDrag);
  previewCanvas.addEventListener("pointercancel", stopDrag);
  previewCanvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    garageState.preview.zoom = THREE.MathUtils.clamp(
      garageState.preview.zoom + Math.sign(event.deltaY) * 0.35,
      4.1,
      7.6,
    );
  });
  refreshGaragePreview();
  return garagePreview;
}

function refreshGaragePreview() {
  if (!garagePreview) return;
  garagePreview.car.rebuildVisual(getCarVisualConfig());
  const summary = getClassSummary();
  if (garageClassSummary) {
    garageClassSummary.innerHTML = `<strong>${summary.name}</strong><span>${summary.description}</span>`;
  }
}

function renderGaragePreview() {
  if (!garagePreviewHost || !garagePreview) return;
  const activeTab =
    document.querySelector(".tab-btn.active")?.dataset.tab === "customize";
  if (!isMenuOpen() || !activeTab) return;
  const rect = garagePreviewHost.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));
  if (width !== garagePreview.width || height !== garagePreview.height) {
    garagePreview.width = width;
    garagePreview.height = height;
    garagePreview.renderer.setSize(width, height, false);
    garagePreview.camera.aspect = width / height;
    garagePreview.camera.updateProjectionMatrix();
  }
  garageState.preview.frame += 1;
  garagePreview.car.group.rotation.y = garageState.preview.yaw;
  garagePreview.car.updateWheels(0.36);
  garagePreview.ring.rotation.z += 0.006;
  const distance = garageState.preview.zoom;
  garagePreview.camera.position.set(0, 2.45, distance);
  garagePreview.camera.lookAt(0, 0.58, 0);
  garagePreview.renderer.render(garagePreview.scene, garagePreview.camera);
}

function getCarVisualConfig(loadout = getCurrentCustomization()) {
  return {
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
  };
}

function getTeamCarVisualConfig(team = "blue") {
  const base = getCarVisualConfig({
    ...getCurrentCustomization(),
    paint: getOptionById(PAINT_OPTIONS, "frost", DEFAULT_CUSTOMIZATION.paintId),
    accent: getOptionById(
      ACCENT_OPTIONS,
      team === "red" ? "copper" : "ice",
      DEFAULT_CUSTOMIZATION.accentId,
    ),
    glow: getOptionById(
      GLOW_OPTIONS,
      team === "red" ? "lava" : "cyan",
      DEFAULT_CUSTOMIZATION.glowId,
    ),
  });
  const skin = BATTLE_TEAM_SKINS[team] ?? BATTLE_TEAM_SKINS.blue;
  return {
    ...base,
    primary: skin.primary,
    accent: skin.accent,
    glowColor: skin.glow,
  };
}

function rebuildPlayerCarMesh() {
  player.rebuildVisual(
    isBattleMode() ? getTeamCarVisualConfig("blue") : getCarVisualConfig(),
  );
}

function applyPlayerCustomization(options = {}) {
  clampCustomizationToUnlocks(options.progress);
  syncActiveLoadoutFromCustomization();
  state.playerLoadoutStats = computePlayerLoadoutStats();
  applyRuntimePlayerStats();
  rebuildPlayerCarMesh();
  refreshCustomizationMenu();
  refreshGaragePreview();
}

function makeBot(color) {
  const bot = new Car({ color, accent: 0x14141a, isBot: true });
  bot.botId = botIdSeed++;
  scene.add(bot.group);
  return bot;
}

function sanitizeRemoteUsername(value) {
  return (
    String(value ?? "Player")
      .replace(/[<>]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/[^a-z0-9 _.-]/gi, "")
      .slice(0, 18) || "Player"
  );
}

function sanitizeBadgeLabel(value) {
  return String(value ?? "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[^a-z0-9 _.-]/gi, "")
    .slice(0, 24);
}

function isCurrentOnlineModerator() {
  return Boolean(
    onlineState.user?.moderator || onlineState.user?.role === "moderator",
  );
}

function makeBadgeNode(label) {
  const badge = sanitizeBadgeLabel(label);
  if (!badge) return null;
  const node = document.createElement("span");
  node.className = `player-badge badge-${badge.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  node.textContent = badge;
  return node;
}

function getRemotePlayerColor(team) {
  if (team === "red") return 0xff7f7f;
  if (team === "blue") return 0x78f0ff;
  return 0xffd17a;
}

function makeRemoteCar(team = "neutral") {
  const car = new Car({
    color: getRemotePlayerColor(team),
    accent: team === "red" ? 0x241316 : 0x111a24,
    isBot: false,
  });
  car.visualRoot.scale.setScalar(1.06);
  car.collisionRadius = CAR_RADIUS;
  car.healthBarGroup.visible = false;
  scene.add(car.group);
  return car;
}

function getRemoteVisualConfigFromIds(cosmetics = null, team = "neutral") {
  const ids = cosmetics && typeof cosmetics === "object" ? cosmetics : {};
  const loadout = {
    body: getOptionById(BODY_OPTIONS, ids.bodyId, DEFAULT_CUSTOMIZATION.bodyId),
    wheels: getOptionById(
      WHEEL_OPTIONS,
      ids.wheelId,
      DEFAULT_CUSTOMIZATION.wheelId,
    ),
    style: getOptionById(
      STYLE_OPTIONS,
      ids.styleId,
      DEFAULT_CUSTOMIZATION.styleId,
    ),
    power: getOptionById(
      POWER_OPTIONS,
      ids.powerId,
      DEFAULT_CUSTOMIZATION.powerId,
    ),
    paint: getOptionById(
      PAINT_OPTIONS,
      ids.paintId,
      DEFAULT_CUSTOMIZATION.paintId,
    ),
    accent: getOptionById(
      ACCENT_OPTIONS,
      ids.accentId,
      DEFAULT_CUSTOMIZATION.accentId,
    ),
    tint: getOptionById(TINT_OPTIONS, ids.tintId, DEFAULT_CUSTOMIZATION.tintId),
    spoiler: getOptionById(
      SPOILER_OPTIONS,
      ids.spoilerId,
      DEFAULT_CUSTOMIZATION.spoilerId,
    ),
    glow: getOptionById(GLOW_OPTIONS, ids.glowId, DEFAULT_CUSTOMIZATION.glowId),
  };
  const visual = getCarVisualConfig(loadout);
  if (team === "blue" || team === "red") {
    const teamVisual = getTeamCarVisualConfig(team);
    return {
      ...visual,
      primary: teamVisual.primary,
      glowColor: teamVisual.glowColor,
    };
  }
  return visual;
}

function createModeratorButton(target = {}) {
  if (!isCurrentOnlineModerator()) return null;
  const targetUsername = sanitizeRemoteUsername(target.username || target.name);
  const targetUserId = String(target.userId || target.id || "");
  if (!targetUsername || targetUserId === onlineState.user?.id) return null;
  const button = document.createElement("button");
  button.className = "moderation-menu-btn";
  button.type = "button";
  button.textContent = "⋯";
  button.title = `Moderation actions for ${targetUsername}`;
  button.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
  });
  bindPressAction(button, () =>
    promptModerationAction({
      username: targetUsername,
      userId: targetUserId,
    }),
  );
  return button;
}

function renderPlayerNameInline(target, data = {}) {
  target.replaceChildren();
  const name = document.createElement("strong");
  name.textContent = sanitizeRemoteUsername(data.username || data.name);
  target.appendChild(name);
  const badge = makeBadgeNode(data.badge);
  if (badge) target.appendChild(badge);
  const modButton = createModeratorButton(data);
  if (modButton) target.appendChild(modButton);
}

function sendModerationAction(action, target) {
  if (!isCurrentOnlineModerator()) return false;
  const payload = {
    type: action === "ban" ? "moderation.ban" : "moderation.kick",
    reason: action === "ban" ? "One-day moderation ban" : "Moderator kick",
  };
  if (target.userId) payload.userId = target.userId;
  else payload.username = target.username;
  sendOnlineMessage(payload);
  onlineState.lastModerationStatus = `${action === "ban" ? "Banned" : "Kicked"} ${target.username || target.userId}`;
  updateOnlineUi();
  return true;
}

function promptModerationAction(target) {
  const username = sanitizeRemoteUsername(target.username || target.userId);
  if (!username) return;
  const choice = window.prompt(
    `Moderator action for ${username}: type KICK or BAN`,
    "KICK",
  );
  if (!choice) return;
  const action = choice.trim().toLowerCase();
  if (action === "kick") sendModerationAction("kick", target);
  if (action === "ban") sendModerationAction("ban", target);
}

function removeRemotePlayer(id) {
  const remote = remotePlayers.get(id);
  if (!remote) return;
  scene.remove(remote.car.group);
  scene.remove(remote.car.healthBarGroup);
  remote.tag.remove();
  remotePlayers.delete(id);
}

function setRemoteHumanPlayers(players = []) {
  const keep = new Set();
  players.slice(0, 8).forEach((playerData, index) => {
    const id = String(
      playerData.id ?? playerData.username ?? `remote-${index}`,
    ).slice(0, 64);
    const username = sanitizeRemoteUsername(
      playerData.username ?? playerData.name,
    );
    const badge = sanitizeBadgeLabel(playerData.badge);
    const moderator = Boolean(playerData.moderator);
    const team = ["blue", "red", "neutral"].includes(playerData.team)
      ? playerData.team
      : "neutral";
    keep.add(id);
    let remote = remotePlayers.get(id);
    if (!remote) {
      const tag = document.createElement("div");
      tag.className = `remote-name-tag team-${team}`;
      remoteNameLayer.appendChild(tag);
      remote = {
        id,
        username,
        badge,
        moderator,
        team,
        car: makeRemoteCar(team),
        tag,
        target: new THREE.Vector3(),
        speed: 0,
        cosmeticsKey: "",
        backflip: false,
        barrelRoll: false,
        boost: false,
        airborne: false,
        visible: false,
      };
      remotePlayers.set(id, remote);
      renderPlayerNameInline(tag, { ...playerData, username, badge });
    }
    if (
      remote.username !== username ||
      remote.badge !== badge ||
      remote.moderator !== moderator
    ) {
      remote.username = username;
      remote.badge = badge;
      remote.moderator = moderator;
      renderPlayerNameInline(remote.tag, { ...playerData, username, badge });
    }
    const cosmeticsKey = JSON.stringify(playerData.cosmetics || {});
    if (remote.team !== team || remote.cosmeticsKey !== cosmeticsKey) {
      remote.team = team;
      remote.cosmeticsKey = cosmeticsKey;
      remote.tag.className = `remote-name-tag team-${team}`;
      remote.car.rebuildVisual(
        getRemoteVisualConfigFromIds(playerData.cosmetics, team),
      );
    }
    const x = Number.isFinite(Number(playerData.x))
      ? Number(playerData.x)
      : player.position.x + 8 + index * 4;
    const y = Number.isFinite(Number(playerData.y)) ? Number(playerData.y) : 0;
    const z = Number.isFinite(Number(playerData.z))
      ? Number(playerData.z)
      : player.position.z + 16 + index * 5;
    remote.target.set(x, y, z);
    remote.speed = Number.isFinite(Number(playerData.speed))
      ? Number(playerData.speed)
      : 0;
    if (!remote.visible) {
      remote.car.setPosition(x, y, z);
      remote.visible = true;
    }
    remote.car.heading = Number.isFinite(Number(playerData.heading))
      ? Number(playerData.heading)
      : remote.car.heading;
    remote.car.moveHeading = remote.car.heading;
    remote.airborne = Boolean(playerData.airborne);
    remote.backflip = Boolean(playerData.backflip);
    remote.barrelRoll = Boolean(playerData.barrelRoll);
    remote.boost = Boolean(playerData.boost);
    if (remote.backflip && !remote.car.backflipActive) {
      remote.car.backflipActive = true;
      remote.car.backflipProgress = 0;
    }
    if (remote.barrelRoll && !remote.car.barrelRollActive) {
      remote.car.barrelRollActive = true;
      remote.car.barrelRollProgress = 0;
      remote.car.barrelRollDirection = 1;
    }
    remote.car.setDemolished(Boolean(playerData.demolished));
  });
  for (const id of [...remotePlayers.keys()]) {
    if (!keep.has(id)) removeRemotePlayer(id);
  }
}

function updateRemoteHumanPlayers(dt) {
  for (const remote of remotePlayers.values()) {
    if (remote.car.demolished) {
      remote.car.group.visible = false;
      continue;
    }
    remote.car.group.visible = true;
    remote.car.position.lerp(remote.target, Math.min(1, dt * 12));
    remote.car.group.position.copy(remote.car.position);
    remote.car.group.rotation.y = remote.car.heading;
    remote.car.updateWheels(remote.speed * dt);
    if (remote.boost && Math.random() < 0.16) {
      spawnFx(
        remote.car.position,
        new THREE.Vector3(0, 0.4, -0.3),
        0x78f0ff,
        0.55,
        0.28,
      );
    }
  }
}

function updateRemoteNameTags() {
  if (!remoteNameLayer) return;
  const shouldShow =
    state.running && !isMenuOpen() && !overlay.classList.contains("show");
  remoteNameLayer.hidden = !shouldShow || remotePlayers.size === 0;
  if (remoteNameLayer.hidden) return;
  camera.updateMatrixWorld();

  for (const remote of remotePlayers.values()) {
    const tag = remote.tag;
    if (remote.car.demolished || !remote.car.group.visible) {
      tag.hidden = true;
      continue;
    }
    remoteNameProjector
      .set(
        remote.car.position.x,
        remote.car.position.y + 1.75,
        remote.car.position.z,
      )
      .project(camera);
    const onScreen =
      remoteNameProjector.z > -1 &&
      remoteNameProjector.z < 1 &&
      remoteNameProjector.x > -1.12 &&
      remoteNameProjector.x < 1.12 &&
      remoteNameProjector.y > -1.18 &&
      remoteNameProjector.y < 1.22;
    remote.screen = {
      x: Number(remoteNameProjector.x.toFixed(3)),
      y: Number(remoteNameProjector.y.toFixed(3)),
      z: Number(remoteNameProjector.z.toFixed(3)),
      onScreen,
    };
    if (!onScreen) {
      tag.hidden = true;
      continue;
    }
    const left = THREE.MathUtils.clamp(
      (remoteNameProjector.x * 0.5 + 0.5) * window.innerWidth,
      48,
      window.innerWidth - 48,
    );
    const top = THREE.MathUtils.clamp(
      (-remoteNameProjector.y * 0.5 + 0.5) * window.innerHeight,
      104,
      window.innerHeight - 28,
    );
    const distance = remote.car.position.distanceTo(player.position);
    const opacity = THREE.MathUtils.clamp(
      1 - (distance - 90) / 160,
      0.45,
      0.95,
    );
    tag.hidden = false;
    tag.style.opacity = opacity.toFixed(2);
    tag.style.transform = `translate3d(${left}px, ${top}px, 0) translate(-50%, -112%)`;
  }
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

function spawnBurst(
  position,
  color,
  count = 10,
  { scale = 0.48, life = 0.34, force = 3.2, lift = 1.2 } = {},
) {
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 0.35 + Math.random() * force;
    spawnFx(
      position
        .clone()
        .add(
          new THREE.Vector3(
            (Math.random() - 0.5) * 0.6,
            0.18 + Math.random() * 0.22,
            (Math.random() - 0.5) * 0.6,
          ),
        ),
      new THREE.Vector3(
        Math.cos(angle) * radius,
        lift + Math.random() * lift,
        Math.sin(angle) * radius,
      ),
      color,
      scale * (0.74 + Math.random() * 0.55),
      life * (0.76 + Math.random() * 0.42),
    );
  }
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

function setEffectToast(text, { shake = 0, pulse = 0 } = {}) {
  state.effectToast = text;
  state.lastEffectToast = text;
  state.effectToastTimer = 1.4;
  state.cameraShake = Math.max(state.cameraShake, shake);
  state.screenPulse = Math.max(state.screenPulse, pulse);
  if (effectToast) {
    effectToast.textContent = text;
    effectToast.classList.add("show");
  }
}

function clearEffectToast() {
  state.effectToast = "";
  effectToast?.classList.remove("show");
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

function spawnModeRampLayout(mode) {
  ramps.length = 0;
  const layouts = {
    track: [],
    stunt: [
      { x: -118, z: -118, kind: "mega" },
      { x: -68, z: -72, kind: "normal" },
      { x: 0, z: -28, kind: "titan" },
      { x: 68, z: 22, kind: "mega" },
      { x: 122, z: 82, kind: "normal" },
      { x: -118, z: 88, kind: "mega" },
      { x: -20, z: 128, kind: "mega" },
    ],
    rampRush: [
      { x: -124, z: -120, kind: "mega" },
      { x: -82, z: -84, kind: "normal" },
      { x: -42, z: -44, kind: "mega" },
      { x: 0, z: -4, kind: "normal" },
      { x: 42, z: 40, kind: "mega" },
      { x: 82, z: 84, kind: "normal" },
      { x: 124, z: 126, kind: "titan" },
      { x: -110, z: 42, kind: "normal" },
      { x: 110, z: -42, kind: "normal" },
    ],
    chase: [
      { x: -96, z: 66, kind: "normal" },
      { x: 92, z: -72, kind: "normal" },
    ],
    boss: [{ x: 0, z: 88, kind: "mega" }],
    drift: [
      { x: -88, z: -42, kind: "normal" },
      { x: 88, z: 44, kind: "normal" },
    ],
    lava: [
      { x: -100, z: 16, kind: "normal" },
      { x: 100, z: -16, kind: "normal" },
    ],
    zone: [{ x: 0, z: 0, kind: "normal" }],
    bowling: [],
    battle: [],
  };
  const rampPoints =
    mode.id === GAME_MODE_RAMP_RUSH
      ? layouts.rampRush
      : (layouts[mode.scene] ?? layouts.chase);
  rampPoints.forEach(({ x, z, kind }) => {
    const ramp = makeRamp(kind);
    ramp.position.set(x, 0, z);
    ramps.push(ramp);
  });
}

function getModeBoostPadPoints(mode) {
  if (isCampaignSurvivalMode()) return null;
  const tables = {
    track:
      mode.id === GAME_MODE_TIME_TRIAL
        ? []
        : [
            { x: -86, z: -82 },
            { x: 84, z: 12 },
            { x: -42, z: 88 },
          ],
    stunt: [
      { x: -40, z: -100 },
      { x: 40, z: -100 },
      { x: -86, z: 50 },
      { x: 86, z: 50 },
      { x: 0, z: 128 },
    ],
    chase: [
      { x: 0, z: -118 },
      { x: -112, z: -18 },
      { x: 112, z: 20 },
      { x: 0, z: 126 },
    ],
    boss: [
      { x: 0, z: -126 },
      { x: -92, z: 16 },
      { x: 92, z: 16 },
      { x: 0, z: 126 },
    ],
    drift: [
      { x: -72, z: -72 },
      { x: 72, z: -72 },
      { x: -72, z: 72 },
      { x: 72, z: 72 },
    ],
    battle: [
      { x: -64, z: -18 },
      { x: 64, z: 18 },
    ],
    lava: [
      { x: -72, z: -92 },
      { x: 72, z: -92 },
      { x: -72, z: 92 },
      { x: 72, z: 92 },
    ],
    zone: [
      { x: 0, z: -86 },
      { x: -86, z: 0 },
      { x: 86, z: 0 },
      { x: 0, z: 86 },
    ],
    bowling: [],
  };
  return tables[mode.scene] ?? tables.chase;
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

function disposeModeObject(object) {
  scene.remove(object);
  props.remove(object);
  arena.remove(object);
  disposeObject3D(object);
}

function clearModeObjects() {
  modeMarkers.forEach((marker) => disposeModeObject(marker.group));
  modeMarkers.splice(0, modeMarkers.length);
  modeDecor.forEach((item) => disposeModeObject(item));
  modeDecor.splice(0, modeDecor.length);
  battlePickups.forEach((pickup) => disposeModeObject(pickup.group));
  battlePickups.splice(0, battlePickups.length);
  battleFlags.forEach((flag) => disposeModeObject(flag.group));
  battleFlags.splice(0, battleFlags.length);
}

function makeModeMarker({
  id,
  label,
  kind = "checkpoint",
  x = 0,
  z = 0,
  radius = 11,
  color = 0x56e9ff,
  active = true,
}) {
  const group = new THREE.Group();
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, 0.08, 48),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.18,
      transparent: true,
      opacity: 0.24,
      roughness: 0.36,
      depthWrite: false,
    }),
  );
  disc.position.y = 0.05;
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(radius, Math.max(0.22, radius * 0.035), 12, 64),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.75,
      roughness: 0.2,
    }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.2;
  const beacon = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.18, radius * 0.42, 5.2, 20, 1, true),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.42,
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
    }),
  );
  beacon.position.y = 2.75;
  group.add(disc, ring, beacon);
  group.position.set(x, 0, z);
  group.userData.phase = Math.random() * Math.PI * 2;
  scene.add(group);
  const marker = {
    id,
    label,
    kind,
    group,
    radius,
    color,
    complete: false,
    active,
  };
  modeMarkers.push(marker);
  return marker;
}

function makeModeRail(x, z, width, depth, color = 0x56e9ff) {
  const rail = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.16, depth),
    new THREE.MeshStandardMaterial({
      color: 0x101924,
      emissive: color,
      emissiveIntensity: 0.32,
      roughness: 0.4,
    }),
  );
  rail.position.set(x, 0.08, z);
  scene.add(rail);
  modeDecor.push(rail);
  return rail;
}

function makeModeBarrier(
  x,
  z,
  width,
  depth,
  color = 0x253444,
  height = 3.2,
  solid = true,
  standable = false,
) {
  const barrier = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.08,
      roughness: 0.48,
    }),
  );
  barrier.position.set(x, height * 0.5, z);
  scene.add(barrier);
  modeDecor.push(barrier);
  if (solid) {
    obstacles.push({
      mesh: barrier,
      size: new THREE.Vector3(width, height, depth),
      standable,
      blocksLasers: true,
    });
  }
  return barrier;
}

function makeAirRing({
  id,
  label,
  x,
  y = 8,
  z,
  radius = 8,
  color = 0x56e9ff,
  active = true,
  kind = "ring",
}) {
  const group = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(radius, Math.max(0.32, radius * 0.055), 14, 64),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.9,
      roughness: 0.18,
    }),
  );
  ring.rotation.y = Math.PI / 2;
  const core = new THREE.Mesh(
    new THREE.CircleGeometry(radius * 0.82, 40),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  core.rotation.y = Math.PI / 2;
  group.add(ring, core);
  group.position.set(x, y, z);
  group.userData.phase = Math.random() * Math.PI * 2;
  scene.add(group);
  const marker = {
    id,
    label,
    kind,
    group,
    radius,
    y,
    color,
    complete: false,
    active,
    airborne: true,
  };
  modeMarkers.push(marker);
  return marker;
}

function makeLoopGate(x, z, color = 0xffa24c) {
  const group = new THREE.Group();
  const loop = new THREE.Mesh(
    new THREE.TorusGeometry(13.5, 1.15, 16, 72),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.48,
      roughness: 0.28,
    }),
  );
  loop.rotation.y = Math.PI / 2;
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(32, 1.2, 8),
    new THREE.MeshStandardMaterial({
      color: 0x2a2018,
      emissive: color,
      emissiveIntensity: 0.12,
      roughness: 0.5,
    }),
  );
  base.position.y = -12.8;
  group.add(loop, base);
  group.position.set(x, 14, z);
  scene.add(group);
  modeDecor.push(group);
  return makeAirRing({
    id: `loop-${x}-${z}`,
    label: "Loop the Loop",
    x,
    y: 13.5,
    z,
    radius: 12.5,
    color,
    kind: "loop",
  });
}

function makeLavaPlatform(marker, height, color) {
  const group = new THREE.Group();
  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(marker.radius * 2.1, 1.2, marker.radius * 2.1),
    new THREE.MeshStandardMaterial({
      color: 0x25313a,
      emissive: color,
      emissiveIntensity: 0.14,
      roughness: 0.45,
    }),
  );
  const ramp = new THREE.Mesh(
    new THREE.BoxGeometry(marker.radius * 1.5, 0.55, marker.radius * 1.45),
    new THREE.MeshStandardMaterial({
      color: 0x35343a,
      emissive: color,
      emissiveIntensity: 0.1,
      roughness: 0.55,
    }),
  );
  deck.position.y = height;
  ramp.position.set(0, height * 0.38, -marker.radius * 1.35);
  ramp.rotation.x = -Math.min(0.38, height * 0.08);
  group.add(deck, ramp);
  group.position.copy(marker.group.position);
  scene.add(group);
  modeDecor.push(group);
  marker.platformHeight = height + 0.72;
  marker.decor = [...(marker.decor ?? []), group];
  const launchRamp = makeRamp(height > 3 ? "mega" : "normal");
  launchRamp.position.set(
    marker.group.position.x,
    0,
    marker.group.position.z - marker.radius * 1.45,
  );
  launchRamp.userData.radius = Math.max(
    launchRamp.userData.radius ?? 9,
    marker.radius * 0.62,
  );
  launchRamp.userData.jumpLift = Math.max(
    launchRamp.userData.jumpLift ?? 8,
    8 + height * 1.9,
  );
  launchRamp.userData.speedKick = Math.max(
    launchRamp.userData.speedKick ?? 14,
    14 + height * 1.4,
  );
  ramps.push(launchRamp);
  return group;
}

function makeBattlePickup({ id, label, x, z, color }) {
  const group = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(4.2, 4.2, 0.26, 24),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.5,
      roughness: 0.2,
    }),
  );
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.1, 1),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: color,
      emissiveIntensity: 0.75,
      roughness: 0.18,
    }),
  );
  base.position.y = 0.16;
  core.position.y = 2.6;
  group.add(base, core);
  group.position.set(x, 0, z);
  scene.add(group);
  const pickup = { id, label, group, radius: 6.5, color, cooldown: 0 };
  battlePickups.push(pickup);
  return pickup;
}

function makeBattleFlag(team, x, z) {
  const color = team === "blue" ? 0x56e9ff : 0xff6666;
  const group = new THREE.Group();
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.32, 8.5, 12),
    new THREE.MeshStandardMaterial({
      color: 0xeaf7ff,
      emissive: color,
      emissiveIntensity: 0.22,
      roughness: 0.3,
    }),
  );
  const flag = new THREE.Mesh(
    new THREE.BoxGeometry(5.2, 2.7, 0.18),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.55,
      roughness: 0.26,
    }),
  );
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(4.8, 4.8, 0.35, 24),
    new THREE.MeshStandardMaterial({
      color: team === "blue" ? 0x12364e : 0x4d151b,
      emissive: color,
      emissiveIntensity: 0.18,
      roughness: 0.5,
    }),
  );
  pole.position.y = 4.25;
  flag.position.set(2.6, 6.4, 0);
  base.position.y = 0.18;
  group.add(base, pole, flag);
  group.position.set(x, 0, z);
  group.userData.home = new THREE.Vector3(x, 0, z);
  group.userData.carrier = null;
  group.userData.team = team;
  scene.add(group);
  const flagState = {
    team,
    group,
    home: group.userData.home.clone(),
    carrier: null,
    capturedBy: "",
  };
  battleFlags.push(flagState);
  return flagState;
}

function trackPoints(count = 8, radiusX = 138, radiusZ = 116, startAngle = 0) {
  return Array.from({ length: count }, (_, index) => {
    const angle = startAngle + (index / count) * Math.PI * 2;
    return {
      x: Math.sin(angle) * radiusX,
      z: Math.cos(angle) * radiusZ,
    };
  });
}

function getRaceTrackPoints(mode) {
  const race = [
    { x: 0, z: -184 },
    { x: -72, z: -174 },
    { x: -152, z: -120 },
    { x: -164, z: -46 },
    { x: -98, z: 12 },
    { x: -132, z: 84 },
    { x: -46, z: 154 },
    { x: 44, z: 158 },
    { x: 130, z: 104 },
    { x: 162, z: 28 },
    { x: 86, z: -22 },
    { x: 148, z: -98 },
    { x: 74, z: -166 },
  ];
  const trial = [
    { x: 0, z: -188 },
    { x: -92, z: -154 },
    { x: -154, z: -76 },
    { x: -118, z: -8 },
    { x: -42, z: 34 },
    { x: -104, z: 112 },
    { x: -16, z: 166 },
    { x: 82, z: 132 },
    { x: 132, z: 54 },
    { x: 72, z: -14 },
    { x: 152, z: -94 },
    { x: 74, z: -166 },
  ];
  return mode.id === GAME_MODE_TIME_TRIAL ? trial : race;
}

function makeTrackSegment(a, b, width = 28, color = 0x56e9ff) {
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const length = Math.max(1, Math.hypot(dx, dz));
  const segment = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.08, length),
    new THREE.MeshStandardMaterial({
      color: 0x242b30,
      emissive: color,
      emissiveIntensity: 0.04,
      roughness: 0.86,
      transparent: false,
      opacity: 1,
    }),
  );
  segment.position.set((a.x + b.x) * 0.5, 0.045, (a.z + b.z) * 0.5);
  segment.rotation.y = Math.atan2(dx, dz);
  scene.add(segment);
  modeDecor.push(segment);
  const stripe = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.1, length),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.34,
      roughness: 0.4,
      transparent: true,
      opacity: 0.56,
    }),
  );
  stripe.position.copy(segment.position);
  stripe.position.y = 0.11;
  stripe.rotation.y = segment.rotation.y;
  scene.add(stripe);
  modeDecor.push(stripe);
  const edgeMat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.42,
    roughness: 0.38,
    transparent: true,
    opacity: 0.78,
  });
  [-1, 1].forEach((side) => {
    const edge = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.11, length),
      edgeMat,
    );
    edge.position.copy(segment.position);
    edge.position.x += Math.cos(segment.rotation.y) * width * 0.43 * side;
    edge.position.z += -Math.sin(segment.rotation.y) * width * 0.43 * side;
    edge.position.y = 0.12;
    edge.rotation.y = segment.rotation.y;
    scene.add(edge);
    modeDecor.push(edge);
  });
  return segment;
}

function makeModeBumper(x, z, radius = 5, color = 0xffc457) {
  const bumper = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, 1.6, 24),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.25,
      roughness: 0.32,
    }),
  );
  bumper.position.set(x, 0.8, z);
  scene.add(bumper);
  modeDecor.push(bumper);
  obstacles.push({
    mesh: bumper,
    size: new THREE.Vector3(radius * 1.45, 1.6, radius * 1.45),
  });
  return bumper;
}

function makeBowlingPin(x, z, color = 0xffc457) {
  const group = new THREE.Group();
  const pinMaterial = new THREE.MeshStandardMaterial({
    color: 0xf8fbff,
    emissive: color,
    emissiveIntensity: 0.1,
    roughness: 0.28,
  });
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(1.35, 0.95, 4.2, 18),
    pinMaterial,
  );
  const crown = new THREE.Mesh(
    new THREE.SphereGeometry(1.18, 18, 12),
    pinMaterial,
  );
  const band = new THREE.Mesh(
    new THREE.TorusGeometry(1.5, 0.16, 8, 24),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.62,
      roughness: 0.22,
    }),
  );
  body.position.y = 2.8;
  crown.position.y = 5.08;
  band.position.y = 4.1;
  band.rotation.x = Math.PI / 2;
  group.add(body, crown, band);
  group.position.set(x, 0, z);
  scene.add(group);
  modeDecor.push(group);
  return group;
}

function setupModeSceneObjects() {
  const mode = getModeDefinition();
  if (isCampaignSurvivalMode() || isMaxMode()) return;
  const [primary, secondary] = getWorld().accents;

  if (mode.scene === "track") {
    const points = getRaceTrackPoints(mode);
    state.modeRun.trackPath = points.map((point) => ({ ...point }));
    state.modeRun.trackWidth = mode.id === GAME_MODE_TIME_TRIAL ? 24 : 28;
    points.forEach((point, index) => {
      const next = points[(index + 1) % points.length];
      makeTrackSegment(
        point,
        next,
        state.modeRun.trackWidth,
        index % 2 ? secondary : primary,
      );
      const dx = next.x - point.x;
      const dz = next.z - point.z;
      const len = Math.max(1, Math.hypot(dx, dz));
      const nx = -dz / len;
      const nz = dx / len;
      const midX = (point.x + next.x) * 0.5;
      const midZ = (point.z + next.z) * 0.5;
      const angle = Math.atan2(dx, dz);
      [-1, 1].forEach((side) => {
        const railX = midX + nx * state.modeRun.trackWidth * 0.58 * side;
        const railZ = midZ + nz * state.modeRun.trackWidth * 0.58 * side;
        const rail = makeModeBarrier(
          railX,
          railZ,
          1.35,
          len,
          0x121922,
          1.35,
          false,
        );
        rail.rotation.y = angle;
        const curb = makeModeRail(
          midX + nx * state.modeRun.trackWidth * 0.5 * side,
          midZ + nz * state.modeRun.trackWidth * 0.5 * side,
          0.62,
          len,
          side > 0 ? primary : secondary,
        );
        curb.rotation.y = angle;
        curb.position.y = 0.18;
      });
    });
    points.forEach((point, index) => {
      makeModeMarker({
        id: `${mode.id}-checkpoint-${index + 1}`,
        label: `Gate ${index + 1}`,
        kind: "checkpoint",
        x: point.x,
        z: point.z,
        radius: mode.id === GAME_MODE_TIME_TRIAL ? 11 : 14,
        color: index === 0 ? secondary : primary,
        active: index === 0,
      });
    });
    const start = points[0];
    const startNext = points[1] ?? { x: start.x, z: start.z + 1 };
    const startDx = startNext.x - start.x;
    const startDz = startNext.z - start.z;
    const startLen = Math.max(1, Math.hypot(startDx, startDz));
    const startForward = { x: startDx / startLen, z: startDz / startLen };
    const startRight = { x: startForward.z, z: -startForward.x };
    const startAngle = Math.atan2(startDx, startDz);
    const startGate = makeModeBarrier(
      start.x - startForward.x * 8,
      start.z - startForward.z * 8,
      88,
      2.4,
      secondary,
      1.2,
      false,
    );
    startGate.rotation.y = startAngle;
    [-18, 0, 18].forEach((x) => {
      const rail = makeModeRail(
        start.x - startForward.x * 2 + startRight.x * x,
        start.z - startForward.z * 2 + startRight.z * x,
        2,
        18,
        0xffffff,
      );
      rail.rotation.y = startAngle;
    });
    return;
  }

  if (mode.scene === "stunt") {
    const ringPoints =
      mode.id === GAME_MODE_RAMP_RUSH
        ? [
            [-124, -88, 8],
            [-82, -52, 10],
            [-42, -10, 11],
            [0, 34, 12],
            [42, 74, 13],
            [82, 116, 15],
            [124, 154, 17],
            [-110, 76, 12],
            [110, -8, 11],
            [0, 132, 15],
          ]
        : [
            [-102, -86, 8],
            [-44, -38, 10],
            [36, -2, 13],
            [92, 48, 11],
            [118, 106, 12],
            [-88, 88, 14],
            [-14, 126, 15],
            [72, -92, 9],
            [0, 48, 16],
          ];
    ringPoints.forEach(([x, z, y], index) =>
      makeAirRing({
        id: `${mode.id}-ring-${index + 1}`,
        label:
          mode.id === GAME_MODE_RAMP_RUSH
            ? `Air Ring ${index + 1}`
            : `Trick Ring ${index + 1}`,
        kind: "ring",
        x,
        y,
        z,
        radius: index % 3 === 0 ? 9.5 : 8,
        color: index % 2 === 0 ? secondary : primary,
        active: index === 0,
      }),
    );
    if (mode.id === GAME_MODE_STUNT) {
      makeLoopGate(-34, 34, primary);
      makeLoopGate(86, -74, secondary);
      makeModeBarrier(0, 0, 26, 2.2, primary, 1.4, false);
    }
    return;
  }

  if (mode.scene === "chase" || mode.scene === "boss") {
    trackPoints(mode.target, 135, 118).forEach((point, index) => {
      makeModeMarker({
        id: `${mode.id}-escape-${index + 1}`,
        label:
          mode.scene === "boss"
            ? `Weak Gate ${index + 1}`
            : `Escape ${index + 1}`,
        kind: "gate",
        x: point.x,
        z: point.z,
        radius: mode.scene === "boss" ? 16 : 13,
        color: index % 2 === 0 ? primary : secondary,
        active: index === 0,
      });
    });
    if (mode.scene === "boss") makeNeonBeacon(0, 0, 13, secondary);
    return;
  }

  if (mode.scene === "drift") {
    trackPoints(6, 118, 92).forEach((point, index) => {
      makeModeMarker({
        id: `${mode.id}-drift-${index + 1}`,
        label: "Drift Zone",
        kind: "zone",
        x: point.x,
        z: point.z,
        radius: 28,
        color: index % 2 === 0 ? primary : secondary,
        active: true,
      });
    });
    return;
  }

  if (mode.scene === "bowling") {
    state.modeRun.bowling.countdown = BOWLING_RULES.countdown;
    makeTrackSegment(
      { x: 0, z: BOWLING_RULES.startZ },
      { x: 0, z: BOWLING_RULES.endZ },
      BOWLING_RULES.laneHalfWidth * 2,
      primary,
    );
    makeModeBarrier(-BOWLING_RULES.laneHalfWidth - 4, 0, 4, 302, primary, 3.2);
    makeModeBarrier(BOWLING_RULES.laneHalfWidth + 4, 0, 4, 302, primary, 3.2);
    makeModeBarrier(0, -150, 92, 4.5, secondary, 2.2);
    makeModeBarrier(0, 154, 92, 4.5, secondary, 2.2);
    [-28, 28].forEach((x) => makeModeRail(x, 0, 1.8, 286, 0x111722));
    const spacing = 12;
    const pinRows = [
      [0, 132],
      [-spacing * 0.5, 118],
      [spacing * 0.5, 118],
      [-spacing, 104],
      [0, 104],
      [spacing, 104],
      [-spacing * 1.5, 90],
      [-spacing * 0.5, 90],
      [spacing * 0.5, 90],
      [spacing * 1.5, 90],
    ];
    pinRows.forEach(([x, z], index) => {
      const marker = makeModeMarker({
        id: `${mode.id}-pin-${index + 1}`,
        label: `Pin ${index + 1}`,
        kind: "pin",
        x,
        z,
        radius: 7.2,
        color: index % 2 === 0 ? primary : secondary,
        active: true,
      });
      marker.hideMarkerVisual = true;
      marker.group.visible = false;
      marker.decor = [
        makeBowlingPin(x, z, index % 2 === 0 ? primary : secondary),
      ];
    });
    return;
  }

  if (mode.scene === "battle") {
    const half = BATTLE_RULES.arenaHalfSize;
    const blueFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(half * 2, half),
      new THREE.MeshStandardMaterial({
        color: 0x143e58,
        emissive: 0x0b6f9a,
        emissiveIntensity: 0.12,
        roughness: 0.75,
      }),
    );
    const redFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(half * 2, half),
      new THREE.MeshStandardMaterial({
        color: 0x5a1d24,
        emissive: 0xa52a32,
        emissiveIntensity: 0.12,
        roughness: 0.75,
      }),
    );
    blueFloor.rotation.x = -Math.PI / 2;
    redFloor.rotation.x = -Math.PI / 2;
    blueFloor.position.set(0, 0.018, -half * 0.5);
    redFloor.position.set(0, 0.018, half * 0.5);
    scene.add(blueFloor, redFloor);
    modeDecor.push(blueFloor, redFloor);
    makeModeRail(0, 0, half * 2 - 8, 3.2, 0xffffff);
    makeModeBarrier(0, -half, half * 2, 4, 0x247fa6, 3.2);
    makeModeBarrier(0, half, half * 2, 4, 0xa84444, 3.2);
    makeModeBarrier(-half, 0, 4, half * 2, 0x24384a, 3.2);
    makeModeBarrier(half, 0, 4, half * 2, 0x4a2828, 3.2);
    [
      [-132, -76, 46, 10],
      [132, -76, 46, 10],
      [-132, 76, 46, 10],
      [132, 76, 46, 10],
      [-42, -142, 18, 38],
      [42, 142, 18, 38],
      [0, -44, 34, 12],
      [0, 44, 34, 12],
    ].forEach(([x, z, w, d], index) =>
      makeModeBarrier(
        x,
        z,
        w,
        d,
        index % 2 ? secondary : primary,
        4.2,
        true,
        true,
      ),
    );
    makeBattleFlag("blue", 0, -half + 34);
    makeBattleFlag("red", 0, half - 34);
    [
      ["reload", "Ammo Refill", -124, -14, 0x56e9ff],
      ["reload", "Ammo Refill", 124, 14, 0xff786f],
      ["shield", "Shield Bubble", -72, -150, 0x7bff9d],
      ["shield", "Shield Bubble", 72, 150, 0x7bff9d],
      ["speed", "Speed Cell", 0, 0, 0xffc457],
      ["reload", "Ammo Refill", 0, -106, 0x56e9ff],
      ["reload", "Ammo Refill", 0, 106, 0xff786f],
    ].forEach(([id, label, x, z, color]) =>
      makeBattlePickup({ id, label, x, z, color }),
    );
    return;
  }

  if (mode.scene === "lava" || mode.scene === "zone") {
    if (mode.scene === "lava") {
      const lava = new THREE.Mesh(
        new THREE.PlaneGeometry(HALF_WORLD * 2.2, HALF_WORLD * 2.2),
        new THREE.MeshStandardMaterial({
          color: 0xff4d22,
          emissive: 0xff2600,
          emissiveIntensity: 0.46,
          transparent: true,
          opacity: 0.58,
          roughness: 0.2,
        }),
      );
      lava.rotation.x = -Math.PI / 2;
      lava.position.y = -0.18;
      lava.userData.lavaFloor = true;
      scene.add(lava);
      modeDecor.push(lava);
    }
    trackPoints(mode.scene === "lava" ? 6 : 3, 112, 92).forEach(
      (point, index) => {
        const marker = makeModeMarker({
          id: `${mode.id}-zone-${index + 1}`,
          label: mode.scene === "lava" ? "Safe Zone" : "King Zone",
          kind: "zone",
          x: point.x,
          z: point.z,
          radius: mode.scene === "lava" ? 25 : 34,
          color: index % 2 === 0 ? primary : secondary,
          active: index === 0 || mode.scene === "zone",
        });
        if (mode.scene === "lava") {
          makeLavaPlatform(marker, 1.4 + index * 0.72, marker.color);
        }
      },
    );
  }
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

function getModeSurfaceHeight(x, z) {
  if (isBattleMode()) {
    let bestHeight = 0;
    obstacles.forEach((obstacle) => {
      if (!obstacle.standable) return;
      const { mesh, size } = obstacle;
      if (
        Math.abs(x - mesh.position.x) <= size.x * 0.5 + CAR_RADIUS * 0.35 &&
        Math.abs(z - mesh.position.z) <= size.z * 0.5 + CAR_RADIUS * 0.35
      ) {
        bestHeight = Math.max(bestHeight, mesh.position.y + size.y * 0.5);
      }
    });
    return bestHeight;
  }
  if (!isLavaMode()) return 0;
  let bestHeight = 0;
  modeMarkers.forEach((marker) => {
    if (marker.kind !== "zone" || !Number.isFinite(marker.platformHeight))
      return;
    const dist = Math.hypot(
      x - marker.group.position.x,
      z - marker.group.position.z,
    );
    if (dist <= marker.radius * 0.92) {
      bestHeight = Math.max(bestHeight, marker.platformHeight);
    }
  });
  return bestHeight;
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

function isFeedbackOpen() {
  return feedbackModal?.classList.contains("show") ?? false;
}

function getUiScreen() {
  if (schoolGate?.classList.contains("show")) return "school-gate";
  if (overlay.classList.contains("show")) return "title";
  if (message.classList.contains("show")) return "results";
  if (isMenuOpen() || isFeedbackOpen() || state.modeHelpOpen) return "paused";
  if (state.running) return "playing";
  return "idle";
}

function refreshMenuShell() {
  if (menuStateLabel) {
    menuStateLabel.textContent = state.running ? "Paused" : "Garage / Setup";
  }
  if (menuResume) menuResume.hidden = !state.running;
  renderProgressPanel();
  renderGarageLoadouts();
  renderControlsUi();
  if (isMenuOpen()) {
    initGaragePreview();
    refreshGaragePreview();
  }
}

function setMenuOpen(open, tabName = null) {
  if (open && state.modeHelpOpen) closeModeHelp({ resume: false });
  menu.classList.toggle("show", open);
  document.body.classList.toggle("menu-open", open);
  if (!open && modeHelpCard) modeHelpCard.hidden = true;
  if (open && tabName) setActiveTab(tabName);
  if (open && !tabName && !document.querySelector(".tab-btn.active")) {
    setActiveTab("games");
  }
  if (!open) returnFocusToGame();
  refreshCustomizationMenu();
  refreshDevModeUi();
  refreshMenuShell();
  debugLog("menu", open ? "menu_open" : "menu_close");
}

function clearWorld() {
  obstacles.splice(0, obstacles.length);
  clearModeObjects();
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

    const mode = getModeDefinition();
    const rampConfig = getRampDensityConfig(settings.rampDensity);
    if (isCampaignSurvivalMode()) spawnRampLayout(rampConfig);
    else spawnModeRampLayout(mode);

    boostPads.length = 0;
    const modePadPoints = getModeBoostPadPoints(mode);
    const padPoints =
      modePadPoints ?? generateSpacedPolarPoints(14, 105, HALF_WORLD - 52, 64);
    padPoints.forEach(({ x, z }) => {
      const pad = makeBoostPad();
      pad.position.set(x, 0, z);
      boostPads.push(pad);
    });
    if (isCampaignSurvivalMode()) {
      [
        { x: 20, z: 20 },
        { x: -20, z: 35 },
      ].forEach(({ x, z }) => {
        const pad = makeBoostPad();
        pad.position.set(x, 0, z);
        boostPads.push(pad);
      });
    }
    if (isCampaignSurvivalMode()) applyLevelIdentity(world);
    setupModeSceneObjects();
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

function getModeWorldDefinition(mode = getModeDefinition()) {
  const sceneTable = {
    track: {
      name: "Turbo Circuit",
      fog: 0x111f2c,
      sky: 0x18385a,
      ground: 0x142638,
      accents: [0x56e9ff, 0xffc457],
    },
    stunt: {
      name: "Launch Park",
      fog: 0x24170f,
      sky: 0x3e2115,
      ground: 0x2a2018,
      accents: [0xffa24c, 0x56e9ff],
    },
    chase: {
      name: "Hunter Grid",
      fog: 0x171326,
      sky: 0x251a44,
      ground: 0x19172d,
      accents: [0xff4d8a, 0x80fff1],
    },
    boss: {
      name: "Abyssal Finale",
      fog: 0x120f14,
      sky: 0x2f2134,
      ground: 0x1c1620,
      accents: [0xff80d0, 0xa7c0ff],
    },
    drift: {
      name: "Combo Loop",
      fog: 0x15262b,
      sky: 0x1f3f45,
      ground: 0x153234,
      accents: [0x7bff9d, 0xffc457],
    },
    battle: {
      name: "Bumper Forge",
      fog: 0x221522,
      sky: 0x442044,
      ground: 0x29182b,
      accents: [0x35d7ff, 0xff514d],
    },
    bowling: {
      name: "Boost Bowl",
      fog: 0x1f1827,
      sky: 0x302342,
      ground: 0x211a2c,
      accents: [0xffc457, 0x56e9ff],
    },
    lava: {
      name: "Magma Grid",
      fog: 0x2a1208,
      sky: 0x4a1808,
      ground: 0x2b160c,
      accents: [0xff4d2d, 0xffc457],
    },
    zone: {
      name: "Crown Zone",
      fog: 0x0f2632,
      sky: 0x12384a,
      ground: 0x122c32,
      accents: [0x80fff1, 0xffd66b],
    },
  };
  return sceneTable[mode.scene] ?? worldData[state.worldIndex];
}

function getWorld() {
  if (isMaxMode()) {
    return {
      name: "Max Arena",
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
  if (!isCampaignSurvivalMode()) {
    const mode = getModeDefinition();
    const world = getModeWorldDefinition(mode);
    return {
      ...world,
      levels: [
        {
          name: mode.label,
          time: mode.time,
          bots: mode.botCount,
          botSpeed: mode.botSpeed,
          spawnRate: 1,
        },
      ],
    };
  }
  return worldData[state.worldIndex];
}

function getLevel() {
  return isMaxMode() || !isCampaignSurvivalMode()
    ? getWorld().levels[0]
    : getWorld().levels[state.levelIndex];
}

function resetModeRunState() {
  const mode = getModeDefinition();
  const previousGhost =
    state.progressionV2.personalBests?.[mode.id]?.ghostSamples ?? [];
  state.modeRun = {
    ...createModeRunState(),
    id: mode.id,
    target:
      mode.id === GAME_MODE_ID33
        ? getLevel().time
        : mode.id === GAME_MODE_MAX1
          ? MAX_MODE_GOAL_TARGET
          : mode.target,
    rewardPreview: mode.reward,
    bestGhost: previousGhost.slice(0, 60),
    bossPhase: mode.id === GAME_MODE_BOSS ? 1 : 0,
    tagState: mode.id === GAME_MODE_HUNTER_TAG ? "evader" : "inactive",
  };
}

function getModeSpawn() {
  if (isMaxMode()) {
    const [x, z] = getTeamSpawnSlots("blue")[0];
    return { x, y: getMaxSurfaceHeight(x, z), z, heading: 0 };
  }
  const mode = getModeDefinition();
  const spawns = {
    [GAME_MODE_RACE]: { x: -8, z: -183, heading: -1.43 },
    [GAME_MODE_TIME_TRIAL]: { x: -10, z: -184, heading: -1.22 },
    [GAME_MODE_STUNT]: { x: -118, z: -118, heading: Math.PI * 0.22 },
    [GAME_MODE_RAMP_RUSH]: { x: -118, z: -118, heading: Math.PI * 0.22 },
    [GAME_MODE_BOOST_BOWLING]: { x: 0, z: -142, heading: 0 },
    [GAME_MODE_BATTLE]: { x: -62, z: -146, heading: 0 },
    [GAME_MODE_HUNTER_TAG]: { x: 0, z: -128, heading: 0 },
    [GAME_MODE_BOT_ESCAPE]: { x: 0, z: -128, heading: 0 },
    [GAME_MODE_BOSS]: { x: 0, z: -132, heading: 0 },
    [GAME_MODE_DRIFT_SCORE]: { x: 0, z: -104, heading: 0 },
    [GAME_MODE_LAVA_FLOOR]: { x: -96, z: -116, heading: Math.PI * 0.17 },
    [GAME_MODE_KING_ZONE]: { x: 0, z: -104, heading: 0 },
    [GAME_MODE_TRICK_COMBO]: { x: -118, z: -118, heading: Math.PI * 0.22 },
  };
  const spawn = spawns[mode.id] ?? {
    x: PLAYER_SPAWN_X,
    z: PLAYER_SPAWN_Z,
    heading: 0,
  };
  return { ...spawn, y: 0 };
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
  effectToast?.classList.remove("show");
  state.lastEffectToast = "";
  state.cameraShake = 0;
  state.screenPulse = 0;
  state.comboMilestone = 1;
  state.bestCombo = 1;
  state.nearMissStreak = 0;
  state.bestNearMissStreak = 0;
  state.nearMissCooldown = 0;
  state.lastLandingGrade = "";
  state.threatToastCooldown = 0;
  state.lastFailReason = "";
  state.modeHelpOpen = false;
  if (modeHelpCard) modeHelpCard.hidden = true;
  document.body.classList.remove("mode-help-open");
  const level = getLevel();
  state.timeLeft = level.time;
  state.overtime = false;
  resetModeRunState();

  const spawn = getModeSpawn();
  player.setDemolished(false);
  player.setPosition(spawn.x, spawn.y, spawn.z);
  player.velocity.set(0, 0, 0);
  player.speed = 0;
  player.heading = spawn.heading;
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
  player.barrelRollActive = false;
  player.barrelRollProgress = 0;
  player.battleShieldTimer = 0;
  player.lastRampTime = 0;
  player.prevPosition.copy(player.position);
  input.backflip = false;
  input.laser = false;
  state.steerSmoothed = 0;
  state.lastHitAt = 0;
  state.lastHitByBotId = -1;
  state.postHitSafeFrames = 0;
  state.padSpeedTimer = 0;
  state.padSpeedMult = 1;
  state.noBotsRecoveryTimer = 0;
  resetCampaignRiskMemory();

  player.team = getModeDefinition().id === GAME_MODE_BATTLE ? "blue" : null;
  applyPlayerCustomization();
  if (getModeDefinition().id === GAME_MODE_LAVA_FLOOR) {
    state.shield = 1;
    state.invincible = 2;
    state.modeRun.lava.height = -1.15;
    state.modeRun.lava.graceTimer = 2.8;
  }
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

function configureBattleCar(car, team, role = "laser") {
  car.team = team;
  car.role = role;
  car.battleHealth = BATTLE_RULES.maxHealth;
  car.battleAmmo = BATTLE_RULES.maxAmmo;
  car.battleLaserCooldown = 0;
  car.battleReloadTimer = 0;
  car.battleRespawnTimer = 0;
  car.battleShieldTimer = 0;
  car.rebuildVisual(getTeamCarVisualConfig(team));
  car.visualRoot.scale.setScalar(role === "guard" ? 1.14 : 1.06);
  car.collisionRadius = role === "guard" ? BOT_RADIUS * 1.08 : BOT_RADIUS;
}

function spawnBattleBots() {
  clearBotState();
  player.team = "blue";
  player.role = "captain";
  player.battleHealth = BATTLE_RULES.maxHealth;
  player.battleAmmo = BATTLE_RULES.maxAmmo;
  player.battleLaserCooldown = 0;
  player.battleReloadTimer = 0;
  player.battleShieldTimer = 0;
  player.rebuildVisual(getTeamCarVisualConfig("blue"));
  const specs = [
    { team: "blue", role: "support", x: 72, z: -132, heading: 0, speed: 36 },
    { team: "blue", role: "guard", x: -88, z: -178, heading: 0, speed: 32 },
    {
      team: "red",
      role: "striker",
      x: -72,
      z: 152,
      heading: Math.PI,
      speed: 36,
    },
    { team: "red", role: "guard", x: 88, z: 178, heading: Math.PI, speed: 32 },
    {
      team: "red",
      role: "flanker",
      x: 132,
      z: 92,
      heading: Math.PI,
      speed: 38,
    },
  ];
  specs.forEach((spec) => {
    const bot = makeBot(BATTLE_TEAM_SKINS[spec.team].primary);
    configureBattleCar(bot, spec.team, spec.role);
    bot.setPosition(spec.x, 0, spec.z);
    bot.heading = spec.heading;
    bot.moveHeading = spec.heading;
    bot.maxSpeed = spec.speed * BATTLE_RULES.botSpeedMult;
    bot.accel = 13.5;
    bot.turnRate = 1.92;
    bots.push(bot);
  });
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
  if (isBattleMode()) {
    spawnBattleBots();
    return;
  }
  player.team = null;
  player.role = null;
  player.visualRoot.scale.setScalar(1);
  player.collisionRadius = CAR_RADIUS;
  if (
    settings.difficulty === "no_bots" ||
    getModeDefinition().id === GAME_MODE_STUNT ||
    getModeDefinition().id === GAME_MODE_RAMP_RUSH
  )
    return;
  const level = getLevel();
  const mode = getModeDefinition();
  const palette =
    isCampaignSurvivalMode() || mode.id === GAME_MODE_HUNTER_TAG
      ? [HUNTER_BOT_COLOR]
      : getWorld().accents;
  const difficultyScale = {
    no_bots: 0,
    casual: 0.7,
    classic: 1,
    brutal: 1.25,
  }[settings.difficulty];
  const profile = getDifficultyProfile();
  const baseBotCount = Number.isFinite(mode.botCount)
    ? mode.botCount
    : level.bots;
  const botCount = Math.max(
    mode.id === GAME_MODE_TIME_TRIAL || mode.id === GAME_MODE_BOOST_BOWLING
      ? 0
      : 1,
    Math.round(baseBotCount * difficultyScale),
  );
  if (botCount <= 0) return;
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
    bot.maxSpeed =
      (Number.isFinite(mode.botSpeed) ? mode.botSpeed : level.botSpeed) *
      Math.max(0.55, difficultyScale || 1) *
      profile.speedMultiplier;
    bot.accel = (18 + level.bots * difficultyScale) * profile.botSkill;
    bot.turnRate = 2.1 * profile.botSkill;
    bot.aiBurstCooldown = Math.random() * 1.2;
    bot.lastRampTime = 0;
    bot.role =
      mode.id === GAME_MODE_BOSS && i === 0
        ? "boss"
        : mode.id === GAME_MODE_RACE
          ? `rival-${i + 1}`
          : mode.id === GAME_MODE_BATTLE
            ? `bumper-${i + 1}`
            : "hunter";
    bot.team = mode.id === GAME_MODE_RACE ? "rival" : "hunter";
    if (mode.id === GAME_MODE_BOSS && i === 0) {
      bot.visualRoot.scale.setScalar(1.52);
      bot.collisionRadius = BOT_RADIUS * 1.55;
      bot.maxSpeed *= 1.08;
      bot.accel *= 1.1;
    }
    bots.push(bot);
  }
}

function spawnPowerups() {
  powerups.forEach((powerup) => scene.remove(powerup));
  powerups.splice(0, powerups.length);
  const mode = getModeDefinition();
  if (
    mode.id === GAME_MODE_BOOST_BOWLING ||
    mode.id === GAME_MODE_RACE ||
    mode.id === GAME_MODE_TIME_TRIAL ||
    mode.id === GAME_MODE_STUNT ||
    mode.id === GAME_MODE_RAMP_RUSH ||
    mode.id === GAME_MODE_BATTLE
  )
    return;
  const modePowerups = {
    [GAME_MODE_RACE]: ["boost", "shield", "boost", "boost"],
    [GAME_MODE_TIME_TRIAL]: ["boost", "boost", "boost"],
    [GAME_MODE_STUNT]: ["boost", "shield", "boost", "life"],
    [GAME_MODE_RAMP_RUSH]: ["boost", "boost", "shield"],
    [GAME_MODE_LAVA_FLOOR]: ["shield", "life", "shield"],
    [GAME_MODE_KING_ZONE]: ["boost", "shield", "slow"],
    [GAME_MODE_BOSS]: ["shield", "boost", "life"],
  };
  const typePool = modePowerups[mode.id] ?? ["boost", "shield", "life", "slow"];
  const points =
    mode.scene === "track"
      ? trackPoints(typePool.length, 104, 88, Math.PI / 4)
      : generateSpacedPolarPoints(typePool.length + 2, 82, HALF_WORLD - 70, 70);
  typePool.forEach((type, index) => {
    const powerup = makePowerup(type);
    const point = points[index] ?? {
      x: THREE.MathUtils.randFloatSpread(HALF_WORLD * 1.6),
      z: THREE.MathUtils.randFloatSpread(HALF_WORLD * 1.6),
    };
    powerup.position.set(point.x, 1.8, point.z);
    powerups.push(powerup);
  });
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
    const lockedCounts = getLockedGarageOptionCount(progress);
    const nextUnlock = getNextGarageUnlock(progress);
    customHint.textContent =
      lockedCounts > 0
        ? `${lockedCounts} loadout upgrades are still locked. Earn XP in any mode to reach ${nextUnlock ? `Level ${nextUnlock.level} for ${nextUnlock.option.name}` : "the next Garage level"}.`
        : "All loadout parts unlocked. Mix bodies, wheels, handling, and powers freely.";
  }
  renderGarageLoadouts();
  refreshGaragePreview();
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
  const pickupColors = {
    boost: 0x28d7ff,
    shield: 0x7bff9d,
    life: 0xff4d2d,
    slow: 0xffc457,
  };
  if (type === "boost") {
    state.boost = 1;
    state.padSpeedTimer = Math.max(state.padSpeedTimer, 1.2);
    state.padSpeedMult = Math.max(state.padSpeedMult, 1.12);
    state.score += 200;
    setEffectToast("Boost Refilled", { pulse: 0.42 });
    debugLog("powerups", "boost_applied");
  }
  if (type === "shield") {
    state.shield = Math.min(1, state.shield + 0.75);
    state.shieldTimer = 7.5;
    state.score += 150;
    setEffectToast("Shield Up", { pulse: 0.3 });
    debugLog("powerups", "shield_applied");
  }
  if (type === "life") {
    const previousLives = state.lives;
    state.lives = Math.min(5, state.lives + 1);
    if (state.lives > previousLives) state.livesPulse = 1;
    state.score += 250;
    setEffectToast(state.lives > previousLives ? "Extra Life" : "Life Maxed", {
      pulse: 0.34,
    });
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
    setEffectToast("Bots Slowed", { pulse: 0.28 });
    debugLog("powerups", "slow_applied");
  }

  spawnBurst(
    powerup.position.clone().add(new THREE.Vector3(0, 0.25, 0)),
    pickupColors[type] ?? 0xffffff,
    16,
    { scale: 0.48, life: 0.36, force: 3.6, lift: 1.45 },
  );

  powerup.position.set(
    THREE.MathUtils.randFloatSpread(HALF_WORLD * 1.85),
    1.8,
    THREE.MathUtils.randFloatSpread(HALF_WORLD * 1.85),
  );
  powerup.userData.type = ["boost", "shield", "life", "slow"][
    Math.floor(Math.random() * 4)
  ];
  powerup.material.color.setHex(pickupColors[powerup.userData.type]);
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
    if (Math.random() < 0.38 + intensity * 0.22) {
      spawnFx(
        rearCenter.clone().addScaledVector(right, (Math.random() - 0.5) * 1.8),
        forward
          .clone()
          .multiplyScalar(-2.4 - speedAbs * 0.04)
          .addScaledVector(right, (Math.random() - 0.5) * 3.2),
        Math.random() < 0.5 ? 0xffd37a : 0xd8f6ff,
        0.32 * intensity,
        0.22,
      );
    }
  }

  if (boostActive && speedAbs > 8) {
    const flameSpawn = rearCenter.clone().addScaledVector(forward, -0.45);
    const boostVel = forward.clone().multiplyScalar(-14 - speedAbs * 0.2);
    boostVel.x += (Math.random() - 0.5) * 1.2;
    boostVel.z += (Math.random() - 0.5) * 1.2;
    boostVel.y += (Math.random() - 0.5) * 0.6;
    spawnFx(flameSpawn, boostVel, 0xff9f45, 0.62, 0.28);
    spawnFx(
      flameSpawn.clone().addScaledVector(right, (Math.random() - 0.5) * 0.9),
      boostVel.clone().multiplyScalar(0.62),
      0xff4d2d,
      0.5,
      0.2,
    );
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
    setEffectToast("Backflip Primed", { pulse: 0.12 });
    return false;
  }
  player.triggerBackflip();
  state.backflipQueueTimer = 0;
  state.backflipChainCount += 1;
  state.score += 30 * state.combo;
  setEffectToast("Backflip", { pulse: 0.26 });
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
  setEffectToast("Jump", { pulse: 0.2 });
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

function performJumpOrBackflip() {
  if (isCarAirborne(player) || player.backflipActive) return attemptBackflip();
  return attemptDevJump();
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
  const battleModeActive = isBattleMode();
  const inputSteer = getSteer() * (settings.invertSteer ? -1 : 1);
  const steerFilterBase = maxProfile
    ? maxProfile.player.steerFilter
    : DRIVING_TUNING.grounded.steerFilter;
  const steerFilter =
    (input.drift ? DRIVING_TUNING.grounded.driftSteerFilter : steerFilterBase) *
    (battleModeActive ? BATTLE_RULES.playerSteerFilterMult : 1);
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
  const bowlingActive = isBowlingMode();
  const bowling = state.modeRun.bowling;
  const bowlingRolling = bowlingActive && bowling.rolling;
  const throttle = bowlingActive
    ? bowlingRolling
      ? 1
      : 0
    : input.throttle || gamepadState.throttle > 0.16
      ? 1
      : 0;
  const brake = bowlingActive
    ? 0
    : input.brake || gamepadState.brake > 0.16
      ? 1
      : 0;
  const drift =
    !bowlingActive && (input.drift || gamepadState.drift) && !airborne;
  const boostActive =
    !bowlingActive && (input.boost || gamepadState.boost) && state.boost > 0.05;
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
    : battleModeActive
      ? BATTLE_RULES.playerSpeedMult
      : 1;
  const modeTurnMult = maxModeActive
    ? DRIVING_TUNING.maxMode.turnMult * maxProfile.player.turnMult
    : battleModeActive
      ? BATTLE_RULES.playerTurnMult
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
    (maxModeActive
      ? maxProfile.player.accelMult
      : battleModeActive
        ? BATTLE_RULES.playerAccelMult
        : 1) *
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
      player.maxSpeed * boostCap * padMult * maxModeCap * modeSpeedMult,
    );
  }

  if (bowlingActive) {
    if (bowlingRolling) {
      player.speed = THREE.MathUtils.lerp(
        player.speed,
        BOWLING_RULES.autoSpeed,
        Math.min(1, dt * 4.8),
      );
    } else {
      player.speed = THREE.MathUtils.lerp(player.speed, 0, Math.min(1, dt * 9));
    }
  }

  const steerInputDamp = maxModeActive ? 0.66 : battleModeActive ? 0.72 : 1;
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
    state.screenPulse = Math.max(state.screenPulse, 0.12);
    state.score += dt * 6 * state.combo;
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
      : getModeSurfaceHeight(car.position.x, car.position.z);

    if (car.position.y <= floorHeight) {
      car.position.y = floorHeight;
      car.verticalVel = 0;
      if (!car.isBot && state.wasAirborne) {
        const bonus = Math.min(2.5, state.airTime);
        if (bonus > 0.2) {
          const landingGrade =
            state.backflipChainCount > 1
              ? "Inferno Landing"
              : state.backflipChainCount === 1 || bonus > 1.4
                ? "Great Landing"
                : "Clean Landing";
          state.lastLandingGrade = landingGrade;
          state.score += Math.round(120 * bonus);
          state.boost = Math.min(
            1,
            state.boost + bonus * (0.15 + (loadoutStats?.landingBoost ?? 0)),
          );
          setEffectToast(`${landingGrade} +${Math.round(120 * bonus)}`, {
            pulse: 0.24 + Math.min(0.28, bonus * 0.1),
          });
          spawnBurst(
            player.position.clone().add(new THREE.Vector3(0, 0.12, 0)),
            landingGrade === "Inferno Landing" ? 0xffd37a : 0x9fe7ff,
            landingGrade === "Clean Landing" ? 10 : 18,
            { scale: 0.42, life: 0.32, force: 3.8, lift: 0.7 },
          );
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
            { pulse: 0.42, shake: 0.14 },
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
          const rampColor =
            ramp.userData.kind === "titan" ? 0xffc46e : 0xff9c66;
          spawnBurst(
            car.position.clone().add(new THREE.Vector3(0, 0.35, 0)),
            rampColor,
            ramp.userData.kind === "titan" ? 18 : 10,
            {
              scale: ramp.userData.kind === "titan" ? 0.58 : 0.42,
              life: 0.3,
              force: 3.4,
              lift: 1.8,
            },
          );
          setEffectToast(
            ramp.userData.kind === "titan" ? "Titan Launch" : "Ramp Launch",
            { pulse: 0.2 },
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
    -Math.min(maxMode.replayBuffer.length, MAX_REPLAY_RULES.maxFrames),
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
  const goalZ = team === "blue" ? dims.goalLineZ - 8 : -dims.goalLineZ + 8;
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(21, 1.25, 16, 96),
    new THREE.MeshBasicMaterial({
      color: team === "blue" ? 0x7feaff : 0xff8f76,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
    }),
  );
  ring.position.set(0, 8.5, goalZ);
  ring.rotation.x = Math.PI / 2;
  ring.userData.fxLife = 2.2;
  scene.add(ring);
  modeDecor.push(ring);
  state.screenPulse = Math.max(state.screenPulse, 0.72);
  state.cameraShake = Math.max(state.cameraShake, 0.42);
  for (let i = 0; i < 108; i += 1) {
    spawnFx(
      new THREE.Vector3(0, 1.4 + Math.random() * 4.6, goalZ),
      new THREE.Vector3(
        (Math.random() - 0.5) * 22,
        3.2 + Math.random() * 6.4,
        team === "blue" ? -5 - Math.random() * 7 : 5 + Math.random() * 7,
      ),
      team === "blue" ? 0x7feaff : 0xff8f76,
      1.45,
      0.92,
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

function updateBattleBots(dt) {
  updateBattleActorTimers(dt);
  updateBattlePickups();
  if (input.laser) fireBattleLaser(player);
  updateBattleFlags();
  bots.forEach((bot, index) => {
    if (bot.demolished) return;
    const enemies = allBattleCars().filter(
      (car) => car.team !== bot.team && !car.demolished,
    );
    const target =
      enemies.sort(
        (a, b) =>
          bot.position.distanceTo(a.position) -
          bot.position.distanceTo(b.position),
      )[0] ?? player;
    const lowHealth = (bot.battleHealth ?? BATTLE_RULES.maxHealth) < 38;
    const lowAmmo = (bot.battleAmmo ?? 0) <= 1;
    const preferredPickup = lowAmmo
      ? nearestBattlePickupFor(bot, ["reload"])
      : lowHealth
        ? nearestBattlePickupFor(bot, ["shield"])
        : nearestBattlePickupFor(bot, index % 2 ? ["speed"] : []);
    const ownFlag = getBattleFlag(bot.team);
    const enemyFlag = getBattleFlag(bot.team === "red" ? "blue" : "red");
    let destination = target.position;
    let stopRange = 24;
    if (bot.battleCarryingFlag && ownFlag) {
      destination = ownFlag.home;
      stopRange = 9;
    } else if (ownFlag?.carrier && ownFlag.carrier.team !== bot.team) {
      destination = ownFlag.carrier.position;
      stopRange = 18;
    } else if (
      preferredPickup &&
      (lowAmmo || lowHealth || Math.random() < dt * 0.55)
    ) {
      destination = preferredPickup.group.position;
      stopRange = 3.5;
    } else if (lowHealth) {
      const side = bot.team === "red" ? 1 : -1;
      destination = new THREE.Vector3(index % 2 ? 64 : -64, 0, side * 72);
      stopRange = 10;
    } else if (bot.role === "guard") {
      destination =
        ownFlag?.home
          .clone()
          .add(
            new THREE.Vector3(
              index % 2 ? 28 : -28,
              0,
              bot.team === "red" ? -18 : 18,
            ),
          ) ?? destination;
      stopRange = 13;
    } else if (enemyFlag && !enemyFlag.carrier) {
      destination = enemyFlag.group.position;
      stopRange = 10;
    }
    const distance = driveCarToward(bot, destination, dt, {
      stopRange,
      speedMult: lowHealth ? 0.9 : 1,
    });
    if (
      target &&
      !lowAmmo &&
      distance < BATTLE_RULES.laserRange * 0.85 &&
      bot.battleLaserCooldown <= 0
    ) {
      const aim = Math.abs(
        angleDifference(
          bot.heading,
          Math.atan2(
            target.position.x - bot.position.x,
            target.position.z - bot.position.z,
          ),
        ),
      );
      if (aim < 0.18) fireBattleLaser(bot);
    }
    updateVerticalPhysics(bot, dt);
    bot.update(dt);
    updateObstacles(bot);
    constrainBattleCar(bot);
  });
  constrainBattleCar(player);
  resolveBattleCarPushes();
}

function updateHunterTagBots(dt) {
  const playerIsIt = state.modeRun.tagState === "it";
  const markedIndex = state.modeRun.taggedBotIndex % Math.max(1, bots.length);
  bots.forEach((bot, index) => {
    let target = player.position;
    let stopRange = 7;
    let speedMult = 1;
    if (playerIsIt) {
      if (index === markedIndex) {
        const away = bot.position.clone().sub(player.position);
        if (away.lengthSq() < 0.001) away.set(1, 0, 0);
        away.normalize();
        target = bot.position
          .clone()
          .addScaledVector(away, 64)
          .setX(
            THREE.MathUtils.clamp(
              bot.position.x + away.x * 64,
              -HALF_WORLD + 34,
              HALF_WORLD - 34,
            ),
          )
          .setZ(
            THREE.MathUtils.clamp(
              bot.position.z + away.z * 64,
              -HALF_WORLD + 34,
              HALF_WORLD - 34,
            ),
          );
        speedMult = 1.04;
      } else {
        const marked = bots[markedIndex] ?? bot;
        target = player.position.clone().lerp(marked.position, 0.46);
        stopRange = 13;
        speedMult = 0.82;
      }
    } else {
      const flank = new THREE.Vector3(
        index % 2 ? 12 : -12,
        0,
        index % 3 ? 8 : -8,
      );
      target = player.position.clone().add(flank);
      speedMult = index === markedIndex ? 0.9 : 0.78;
      stopRange = 10;
    }
    driveCarToward(bot, target, dt, { stopRange, speedMult });
    updateVerticalPhysics(bot, dt);
    bot.update(dt);
    updateObstacles(bot);
    pushCarsApart(player, bot, playerIsIt ? 0.52 : 0.64);
    if (
      !playerIsIt &&
      state.modeRun.tagCooldown <= 0 &&
      bot.position.distanceTo(player.position) < BOT_HIT_RADIUS * 0.78
    ) {
      handlePlayerHit(bot.botId);
    }
  });
}

function updateBots(dt) {
  if (isMaxMode()) {
    if (settings.devMode && devTuning.freezeBots) return;
    updateMaxBots(dt);
    return;
  }
  if (isBattleMode()) {
    if (settings.devMode && devTuning.freezeBots) return;
    updateBattleBots(dt);
    return;
  }
  if (isLavaMode()) {
    if (settings.devMode && devTuning.freezeBots) return;
    return;
  }
  if (getModeDefinition().id === GAME_MODE_HUNTER_TAG) {
    if (settings.devMode && devTuning.freezeBots) return;
    updateHunterTagBots(dt);
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
  const mode = getModeDefinition();
  const raceModeActive = mode.id === GAME_MODE_RACE;
  const slowMultiplier = state.slowBotsTimer > 0 ? 0.72 : 1;
  const targetSpeed =
    (level.botSpeed + state.heat * 8 * profile.heatRamp) *
    profile.speedMultiplier *
    slowMultiplier *
    deviceAssist.botSpeedMult *
    (settings.devMode ? devTuning.botSpeedMult : 1);
  if (bots.length === 0) return;
  const riskAiActive = isAdaptiveCampaignAi();

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
    if (raceModeActive && modeMarkers.length > 0) {
      const marker =
        modeMarkers[
          (state.modeRun.markerIndex + index + 1) % modeMarkers.length
        ];
      roleTarget.set(
        marker.group.position.x + (index % 2 === 0 ? -11 : 11),
        0,
        marker.group.position.z + (index % 3 === 0 ? 7 : -7),
      );
    } else {
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
    }

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
      if (raceModeActive) {
        player.speed *= 0.86;
        bot.speed *= 0.74;
        state.cameraShake = Math.max(state.cameraShake, 0.12);
        setEffectToast("Rival Bump", { shake: 0.12, pulse: 0.08 });
      } else {
        handlePlayerHit(bot.botId);
      }
      bot.speed *= 0.65;
    } else if (hitEval.horizontalTouch && !hitEval.verticalTouch) {
      state.missedVerticalHitSamples += 1;
      if (riskAiActive)
        state.campaignRisk.nearMisses = Math.min(
          6,
          state.campaignRisk.nearMisses + 0.18,
        );
      registerNearMiss("Air Dodge", 1.25);
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
      registerNearMiss("Near Miss", 1);
    }
  });
}

function updateObstacles(entity) {
  obstacles.forEach((obstacle) => {
    const size = obstacle.size;
    const mesh = obstacle.mesh;
    const radius = entity.collisionRadius ?? CAR_RADIUS;
    const topY = mesh.position.y + size.y * 0.5;
    if (
      obstacle.standable &&
      entity.position.y >= topY - 0.32 &&
      entity.verticalVel <= 1
    ) {
      return;
    }
    if (
      isBattleMode() &&
      obstacle.blocksLasers !== false &&
      entity.prevPosition
    ) {
      const travelX = entity.position.x - entity.prevPosition.x;
      const travelZ = entity.position.z - entity.prevPosition.z;
      const travel = Math.hypot(travelX, travelZ);
      if (travel > 0.001) {
        const skin = BATTLE_RULES.coverCollisionSkin;
        const along = rayAabbDistance2D(
          entity.prevPosition,
          { x: travelX / travel, z: travelZ / travel },
          mesh.position,
          size.x * 0.5 + radius + skin,
          size.z * 0.5 + radius + skin,
          travel,
        );
        if (Number.isFinite(along) && along <= travel) {
          const safeAlong = Math.max(0, along - 0.1);
          entity.position.x =
            entity.prevPosition.x + (travelX / travel) * safeAlong;
          entity.position.z =
            entity.prevPosition.z + (travelZ / travel) * safeAlong;
          const normal = new THREE.Vector3(
            -travelX / travel,
            0,
            -travelZ / travel,
          );
          const normalSpeed = entity.velocity.dot(normal);
          if (normalSpeed < 0)
            entity.velocity.addScaledVector(normal, -normalSpeed);
          entity.speed = Math.min(entity.speed * 0.34, 18);
        }
      }
    }
    if (
      Math.abs(entity.position.x - mesh.position.x) < size.x / 2 + radius &&
      Math.abs(entity.position.z - mesh.position.z) < size.z / 2 + radius
    ) {
      const pushX = entity.position.x - mesh.position.x;
      const pushZ = entity.position.z - mesh.position.z;
      const overlapX = size.x / 2 + radius - Math.abs(pushX);
      const overlapZ = size.z / 2 + radius - Math.abs(pushZ);
      const push =
        overlapX < overlapZ
          ? new THREE.Vector3(Math.sign(pushX || 1), 0, 0)
          : new THREE.Vector3(0, 0, Math.sign(pushZ || 1));
      const overlap = Math.min(overlapX, overlapZ);
      entity.position.addScaledVector(push, overlap + 0.04);
      const normalSpeed = entity.velocity.dot(push);
      if (normalSpeed < 0) entity.velocity.addScaledVector(push, -normalSpeed);
      const tangent =
        Math.abs(push.x) > 0
          ? new THREE.Vector3(0, 0, Math.sign(entity.velocity.z || 1))
          : new THREE.Vector3(Math.sign(entity.velocity.x || 1), 0, 0);
      const tangentSpeed = Math.abs(entity.velocity.dot(tangent));
      entity.speed = isBattleMode()
        ? Math.min(entity.speed * 0.42, tangentSpeed + 4)
        : Math.min(entity.speed * 0.72, tangentSpeed + 8);
      entity.verticalVel = Math.min(entity.verticalVel ?? 0, 0);
      entity.prevPosition?.copy(entity.position);
      entity.group?.position.copy(entity.position);
    }
  });

  const worldLimit = isBattleMode() ? BATTLE_RULES.arenaHalfSize : HALF_WORLD;
  entity.position.x = THREE.MathUtils.clamp(
    entity.position.x,
    -worldLimit + 4,
    worldLimit - 4,
  );
  entity.position.z = THREE.MathUtils.clamp(
    entity.position.z,
    -worldLimit + 4,
    worldLimit - 4,
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

function activeModeMarkers() {
  return modeMarkers.filter((marker) => marker.active && !marker.complete);
}

function setModeMarkerActive(index) {
  modeMarkers.forEach((marker, markerIndex) => {
    marker.active = markerIndex === index && !marker.complete;
  });
}

function completeModeMarker(marker, amount = 1, score = 260) {
  if (!marker || marker.complete) return;
  marker.complete = true;
  marker.active = false;
  marker.group.visible = false;
  marker.decor?.forEach((object) => {
    object.visible = false;
  });
  state.modeRun.progress = Math.min(
    state.modeRun.target,
    state.modeRun.progress + amount,
  );
  state.score += score * Math.max(1, state.combo * 0.45);
  state.modeRun.markerIndex += 1;
  state.modeRun.lastTrick = marker.label;
  setEffectToast(`${marker.label} +${Math.round(score)}`, { pulse: 0.2 });
  const next = modeMarkers[state.modeRun.markerIndex];
  if (next) next.active = true;
}

function getModeProgressKey(mode = getModeDefinition()) {
  if (mode.id === GAME_MODE_ID33)
    return `${mode.id}-${state.worldIndex}-${state.levelIndex}`;
  return mode.id;
}

function medalForScore(score, mode = getModeDefinition()) {
  const table = mode.medal ?? MODE_BY_ID[GAME_MODE_ID33].medal;
  if (score >= table.inferno) return "Inferno";
  if (score >= table.gold) return "Gold";
  if (score >= table.silver) return "Silver";
  if (score >= table.bronze) return "Bronze";
  return "Clear";
}

function modeProgressPercent() {
  const target = Math.max(1, state.modeRun.target || getLevel().time || 1);
  return THREE.MathUtils.clamp(state.modeRun.progress / target, 0, 1);
}

function updateChallengeProgress(mode, score, won) {
  const progression = state.progressionV2;
  if (progression.daily.modeId === mode.id) {
    progression.daily.progress = Math.max(progression.daily.progress, score);
    progression.daily.complete =
      progression.daily.complete ||
      progression.daily.progress >= progression.daily.target;
  }
  if (progression.weekly.modeId === mode.id && won) {
    progression.weekly.progress = Math.min(
      progression.weekly.target,
      progression.weekly.progress + 1,
    );
    progression.weekly.complete =
      progression.weekly.progress >= progression.weekly.target;
  }
}

function awardModeProgression({ won = true, reason = "" } = {}) {
  const mode = getModeDefinition();
  const key = getModeProgressKey(mode);
  const score = Math.floor(state.score);
  const medal = won ? medalForScore(score, mode) : "Attempt";
  const xpGained = won
    ? 120 + Math.round(score / 18) + Math.round(modeProgressPercent() * 80)
    : 30 + Math.round(modeProgressPercent() * 40);
  const progression = state.progressionV2;
  progression.xp = getProgressionTotalXp(progression) + xpGained;
  progression.totalXp = progression.xp;
  progression.level = getProgressionLevel(progression);
  progression.medals[key] = medal;
  const previousBest = progression.personalBests[mode.id]?.score ?? 0;
  if (score >= previousBest) {
    progression.personalBests[mode.id] = {
      score,
      medal,
      time: Number((getLevel().time - state.timeLeft).toFixed(2)),
      progress: Number(state.modeRun.progress.toFixed(2)),
      ghostSamples: state.modeRun.ghost.slice(0, 60),
    };
  }
  if (won) {
    [mode.reward, `level-${progression.level}`]
      .filter(Boolean)
      .forEach((reward) => {
        const rewardId = reward.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        if (!progression.unlockedRewards.includes(rewardId))
          progression.unlockedRewards.push(rewardId);
      });
  }
  updateChallengeProgress(mode, score, won);
  progression.rewardLog = [
    {
      modeId: mode.id,
      label: mode.label,
      medal,
      xp: xpGained,
      reward: won ? mode.reward : reason || "Retry for the medal",
      at: new Date().toISOString(),
    },
    ...progression.rewardLog,
  ].slice(0, 8);
  state.modeRun.medalEarned = medal;
  state.modeRun.xpGained = xpGained;
  state.modeRun.xpTotalAfter = progression.xp;
  state.modeRun.resultSummary = won
    ? `${medal} medal, +${xpGained} XP, ${mode.reward}`
    : `${reason || "Objective failed"}, +${xpGained} XP`;
  savePersistentState();
  renderDailyGiftNotice();
  syncProgressionToBackend();
  return { medal, xpGained };
}

function getModeResultRows(won = true) {
  const mode = getModeDefinition();
  if (mode.id === GAME_MODE_BATTLE) {
    return [
      ["Mode", mode.label],
      ["Result", won ? "Blue Team" : "Red Team"],
      [
        "KOs",
        `${state.modeRun.battle.blueScore}-${state.modeRun.battle.redScore}`,
      ],
      ["Ammo", `${Math.round(player.battleAmmo ?? 0)}/${BATTLE_RULES.maxAmmo}`],
      ["XP", `+${state.modeRun.xpGained || 0}`],
      ["Total XP", `${state.modeRun.xpTotalAfter || getProgressionTotalXp()}`],
      ["Reward", won ? mode.reward : "Practice cover and reload timing"],
    ];
  }
  if (mode.id === GAME_MODE_BOOST_BOWLING) {
    return [
      ["Mode", mode.label],
      ["Frame", `${state.modeRun.bowling.frame}/${BOWLING_RULES.frames}`],
      ["Bowling Score", `${state.modeRun.bowling.totalScore}`],
      ["Last Roll", `${state.modeRun.bowling.lastRollPins} pins`],
      ["XP", `+${state.modeRun.xpGained || 0}`],
      ["Total XP", `${state.modeRun.xpTotalAfter || getProgressionTotalXp()}`],
      ["Reward", won ? mode.reward : "Line up the launch earlier"],
    ];
  }
  return [
    ["Mode", mode.label],
    ["Medal", state.modeRun.medalEarned || (won ? "Clear" : "Attempt")],
    ["XP", `+${state.modeRun.xpGained || 0}`],
    ["Total XP", `${state.modeRun.xpTotalAfter || getProgressionTotalXp()}`],
    [
      "Objective",
      `${Math.floor(state.modeRun.progress)}/${Math.floor(state.modeRun.target || 1)}`,
    ],
    ["Best Chain", `x${state.bestCombo.toFixed(1)}`],
    ["Reward", won ? mode.reward : "Retry preview kept"],
  ];
}

function completeModeRun() {
  if (!state.running) return;
  const mode = getModeDefinition();
  const { medal, xpGained } = awardModeProgression({ won: true });
  showMessage(
    `${mode.label} Complete`,
    `${mode.objective} ${medal} medal earned, +${xpGained} XP. ${mode.reward} is now previewed in Progress.`,
    "Run Again",
    "restart-current",
    getModeResultRows(true),
  );
}

function failModeRun(
  reason = "Time expired before the objective was complete.",
) {
  if (!state.running) return;
  const mode = getModeDefinition();
  awardModeProgression({ won: false, reason });
  showMessage(
    `${mode.label} Failed`,
    `${reason} Fast retry is ready; the reward preview stays visible.`,
    "Retry",
    "retry",
    getModeResultRows(false),
  );
}

function isInsideMarker(marker, radiusBoost = 0) {
  if (!marker) return false;
  return (
    Math.hypot(
      player.position.x - marker.group.position.x,
      player.position.z - marker.group.position.z,
    ) <=
    marker.radius + radiusBoost
  );
}

function updateModeMarkerVisuals(dt) {
  modeMarkers.forEach((marker) => {
    if (marker.hideMarkerVisual) {
      marker.group.visible = false;
      return;
    }
    marker.group.userData.phase = (marker.group.userData.phase ?? 0) + dt * 2.2;
    const pulse = marker.active
      ? 1 + Math.sin(marker.group.userData.phase) * 0.08
      : 0.72;
    marker.group.visible = !marker.complete;
    marker.group.scale.setScalar(pulse);
    marker.group.traverse((child) => {
      if (child.material?.emissiveIntensity !== undefined) {
        child.material.emissiveIntensity = marker.active ? 0.75 : 0.22;
      }
    });
  });
  battlePickups.forEach((pickup) => {
    pickup.cooldown = Math.max(0, pickup.cooldown - dt);
    pickup.group.visible = pickup.cooldown <= 0;
    pickup.group.rotation.y += dt * 1.9;
  });
  for (let i = modeDecor.length - 1; i >= 0; i -= 1) {
    const object = modeDecor[i];
    if (!Number.isFinite(object.userData?.fxLife)) continue;
    object.userData.fxLife = Math.max(0, object.userData.fxLife - dt);
    const alpha = THREE.MathUtils.clamp(object.userData.fxLife / 0.16, 0, 1);
    object.traverse((child) => {
      if (child.material?.opacity !== undefined) {
        if (child.userData.baseOpacity === undefined)
          child.userData.baseOpacity = child.material.opacity;
        child.material.opacity = child.userData.baseOpacity * alpha;
      }
    });
    if (object.userData.fxLife <= 0) {
      modeDecor.splice(i, 1);
      disposeModeObject(object);
    }
  }
}

function recordGhostSample(dt) {
  state.modeRun.zoneTimer += dt;
  if (state.modeRun.zoneTimer >= 0.25) {
    state.modeRun.zoneTimer = 0;
    state.modeRun.ghost.push({
      x: Number(player.position.x.toFixed(1)),
      z: Number(player.position.z.toFixed(1)),
      t: Number((getLevel().time - state.timeLeft).toFixed(2)),
    });
    state.modeRun.ghost = state.modeRun.ghost.slice(-90);
  }
}

function allBattleCars() {
  return [player, ...bots].filter(
    (car) => car.team === "blue" || car.team === "red",
  );
}

function applyBattlePickup(car, pickup) {
  if (!car || pickup.cooldown > 0 || car.demolished) return false;
  const distance = Math.hypot(
    car.position.x - pickup.group.position.x,
    car.position.z - pickup.group.position.z,
  );
  if (distance > pickup.radius + (car.collisionRadius ?? CAR_RADIUS))
    return false;
  if (pickup.id === "reload") {
    car.battleAmmo = BATTLE_RULES.maxAmmo;
    car.battleReloadTimer = 0;
  } else if (pickup.id === "shield") {
    car.battleShieldTimer = Math.max(car.battleShieldTimer ?? 0, 4.2);
    car.battleHealth = Math.min(
      BATTLE_RULES.maxHealth,
      (car.battleHealth ?? BATTLE_RULES.maxHealth) + 20,
    );
  } else if (pickup.id === "speed") {
    car.speed = Math.max(car.speed, 42);
    car.aiBurstCooldown = Math.max(car.aiBurstCooldown ?? 0, 0.8);
  }
  if (car === player) {
    state.modeRun.battlePickup = pickup.label;
    state.modeRun.battlePickupTimer = 5;
    state.score += 120;
    setEffectToast(pickup.label, { pulse: 0.28 });
  }
  pickup.cooldown = 8;
  return true;
}

function updateBattlePickups() {
  if (battlePickups.length === 0) return;
  battlePickups.forEach((pickup) => {
    if (pickup.cooldown > 0) return;
    for (const car of allBattleCars()) {
      if (applyBattlePickup(car, pickup)) break;
    }
  });
}

function getBattleFlag(team) {
  return battleFlags.find((flag) => flag.team === team) ?? null;
}

function releaseBattleFlag(car) {
  battleFlags.forEach((flag) => {
    if (flag.carrier !== car) return;
    flag.carrier = null;
    flag.group.userData.carrier = null;
    flag.group.position.set(car.position.x, 0, car.position.z);
    if (car) car.battleCarryingFlag = "";
  });
}

function resetBattleFlags() {
  battleFlags.forEach((flag) => {
    flag.carrier = null;
    flag.group.userData.carrier = null;
    flag.group.position.copy(flag.home);
  });
  allBattleCars().forEach((car) => {
    car.battleCarryingFlag = "";
  });
  state.modeRun.battle.blueFlagCarrier = "";
  state.modeRun.battle.redFlagCarrier = "";
}

function scoreBattleFlag(team) {
  if (team === "blue") {
    state.modeRun.battle.blueScore += 1;
    state.score += 900;
    setEffectToast("Blue Flag Captured", { pulse: 0.38, shake: 0.24 });
  } else {
    state.modeRun.battle.redScore += 1;
    setEffectToast("Red Flag Captured", { pulse: 0.32, shake: 0.2 });
  }
  state.modeRun.battle.flagMessage = `${team.toUpperCase()} flag point`;
  state.modeRun.progress = Math.max(
    state.modeRun.battle.blueScore,
    state.modeRun.battle.redScore,
  );
  spawnBurst(
    (getBattleFlag(team)?.home ?? player.position)
      .clone()
      .add(new THREE.Vector3(0, 1, 0)),
    team === "blue" ? 0x56e9ff : 0xff6666,
    34,
    { scale: 0.68, life: 0.48, force: 7.2, lift: 2.8 },
  );
  resetBattleFlags();
  if (state.modeRun.battle.blueScore >= BATTLE_RULES.targetScore)
    completeModeRun();
  else if (state.modeRun.battle.redScore >= BATTLE_RULES.targetScore)
    failModeRun("Red team captured three flags first.");
}

function updateBattleFlags() {
  battleFlags.forEach((flag) => {
    if (flag.carrier && flag.carrier.demolished) {
      releaseBattleFlag(flag.carrier);
    }
    if (flag.carrier && !flag.carrier.demolished) {
      flag.group.position.set(
        flag.carrier.position.x,
        flag.carrier.position.y + 1.2,
        flag.carrier.position.z,
      );
      flag.group.rotation.y = flag.carrier.heading;
      return;
    }
    flag.group.rotation.y += 0.02;
    allBattleCars().forEach((car) => {
      if (car.demolished || car.team === flag.team || car.battleCarryingFlag)
        return;
      if (car.position.distanceTo(flag.group.position) > 9) return;
      flag.carrier = car;
      flag.group.userData.carrier = car;
      car.battleCarryingFlag = flag.team;
      state.modeRun.battle.flagMessage =
        car.team === "blue" ? "You have the red flag" : "Red has the flag";
      if (car === player)
        setEffectToast("Red Flag Taken - Return Home", { pulse: 0.28 });
    });
  });

  allBattleCars().forEach((car) => {
    if (!car.battleCarryingFlag || car.demolished) return;
    const ownFlag = getBattleFlag(car.team);
    if (!ownFlag) return;
    if (car.position.distanceTo(ownFlag.home) <= 13) {
      scoreBattleFlag(car.team);
    }
  });

  const blueFlag = getBattleFlag("blue");
  const redFlag = getBattleFlag("red");
  state.modeRun.battle.blueFlagCarrier =
    blueFlag?.carrier === player
      ? "player"
      : blueFlag?.carrier
        ? (blueFlag.carrier.role ?? "red")
        : "";
  state.modeRun.battle.redFlagCarrier =
    redFlag?.carrier === player
      ? "player"
      : redFlag?.carrier
        ? (redFlag.carrier.role ?? "blue")
        : "";
}

function resetBowlingPins({ full = true } = {}) {
  modeMarkers
    .filter((marker) => marker.kind === "pin")
    .forEach((marker) => {
      marker.complete = !full && marker.complete;
      marker.active = !marker.complete;
      marker.group.visible = marker.hideMarkerVisual ? false : !marker.complete;
      marker.decor?.forEach((object) => {
        object.visible = !marker.complete;
        object.rotation.set(0, 0, 0);
        object.position.y = 0;
      });
    });
  state.modeRun.bowling.pinsStanding = modeMarkers.filter(
    (marker) => marker.kind === "pin" && !marker.complete,
  ).length;
  state.modeRun.bowling.rollStartPins = state.modeRun.bowling.pinsStanding;
}

function calculateBowlingScore(rolls) {
  let score = 0;
  let rollIndex = 0;
  for (let frame = 0; frame < BOWLING_RULES.frames; frame += 1) {
    const first = rolls[rollIndex] ?? 0;
    const second = rolls[rollIndex + 1] ?? 0;
    if (first === 10) {
      score += 10 + second + (rolls[rollIndex + 2] ?? 0);
      rollIndex += 1;
    } else if (first + second === 10) {
      score += 10 + (rolls[rollIndex + 2] ?? 0);
      rollIndex += 2;
    } else {
      score += first + second;
      rollIndex += 2;
    }
  }
  return score;
}

function resetBowlingPlayerForRoll() {
  player.setPosition(0, 0, BOWLING_RULES.startZ);
  player.heading = 0;
  player.moveHeading = 0;
  player.speed = 0;
  player.velocity.set(0, 0, 0);
  player.verticalVel = 0;
  state.modeRun.bowling.countdown = BOWLING_RULES.countdown;
  state.modeRun.bowling.rolling = false;
  state.modeRun.bowling.resetTimer = 0;
}

function completeBowlingRoll(pinsOverride = null) {
  const bowling = state.modeRun.bowling;
  if (bowling.complete) return bowling;
  const standing = modeMarkers.filter(
    (marker) => marker.kind === "pin" && !marker.complete,
  ).length;
  const pinsHit = THREE.MathUtils.clamp(
    Number.isFinite(pinsOverride)
      ? pinsOverride
      : bowling.rollStartPins - standing,
    0,
    bowling.rollStartPins,
  );
  bowling.rolls.push(pinsHit);
  bowling.lastRollPins = pinsHit;
  bowling.totalScore = calculateBowlingScore(bowling.rolls);
  state.score = Math.max(state.score, bowling.totalScore * 16);
  const frameBefore = bowling.frame;
  const strike = bowling.roll === 1 && pinsHit === 10;
  const spare = bowling.roll === 2 && bowling.rolls.at(-2) + pinsHit === 10;
  if (bowling.frame < BOWLING_RULES.frames) {
    if (strike || bowling.roll === 2) {
      bowling.frame += 1;
      bowling.roll = 1;
      resetBowlingPins({ full: true });
    } else {
      bowling.roll = 2;
      bowling.pinsStanding = Math.max(0, bowling.pinsStanding - pinsHit);
      resetBowlingPins({ full: false });
    }
  } else {
    const tenthRolls = bowling.rolls.slice(-3);
    const tenthCanContinue =
      tenthRolls.length < 3 &&
      (tenthRolls[0] === 10 ||
        (tenthRolls[0] ?? 0) + (tenthRolls[1] ?? 0) >= 10);
    if (tenthCanContinue && bowling.roll < 3) {
      bowling.roll += 1;
      resetBowlingPins({ full: true });
    } else {
      bowling.complete = true;
      bowling.frame = BOWLING_RULES.frames;
      bowling.roll = Math.min(3, bowling.roll);
    }
  }
  bowling.pinsStanding = modeMarkers.filter(
    (marker) => marker.kind === "pin" && !marker.complete,
  ).length;
  bowling.rollStartPins = bowling.pinsStanding;
  bowling.resetTimer = BOWLING_RULES.resetSeconds;
  state.modeRun.progress = Math.min(
    BOWLING_RULES.frames,
    bowling.complete
      ? BOWLING_RULES.frames
      : frameBefore - 1 + bowling.roll / 2,
  );
  setEffectToast(strike ? "Strike!" : spare ? "Spare!" : `${pinsHit} Pins`, {
    pulse: strike || spare ? 0.32 : 0.18,
  });
  if (bowling.complete) {
    completeModeRun();
  }
  return bowling;
}

function updateBowlingPins() {
  const bowling = state.modeRun.bowling;
  let standing = 0;
  modeMarkers
    .filter((marker) => marker.kind === "pin")
    .forEach((marker, index) => {
      if (marker.complete) return;
      standing += 1;
      const distance = Math.hypot(
        player.position.x - marker.group.position.x,
        player.position.z - marker.group.position.z,
      );
      const hitRadius = 5.4 + Math.abs(player.speed) * 0.045;
      if (distance <= hitRadius) {
        marker.complete = true;
        marker.active = false;
        marker.group.visible = false;
        marker.decor?.forEach((object) => {
          object.rotation.z = (index % 2 ? -1 : 1) * 1.24;
          object.position.y = 0.25;
          object.visible = true;
        });
        spawnBurst(
          marker.group.position.clone().add(new THREE.Vector3(0, 1.4, 0)),
          0xffffff,
          8,
          {
            scale: 0.25,
            life: 0.22,
            force: 2.2,
            lift: 0.8,
          },
        );
      }
    });
  bowling.pinsStanding = modeMarkers.filter(
    (marker) => marker.kind === "pin" && !marker.complete,
  ).length;
  if (standing > 0 && bowling.pinsStanding === 0) completeBowlingRoll(standing);
}

function updateBoostBowlingMode(dt) {
  const bowling = state.modeRun.bowling;
  player.position.x = THREE.MathUtils.clamp(
    player.position.x,
    -BOWLING_RULES.laneHalfWidth + 3,
    BOWLING_RULES.laneHalfWidth - 3,
  );
  if (bowling.complete) return;
  if (bowling.resetTimer > 0) {
    bowling.resetTimer = Math.max(0, bowling.resetTimer - dt);
    if (bowling.resetTimer === 0 && !bowling.complete)
      resetBowlingPlayerForRoll();
    return;
  }
  if (bowling.countdown > 0) {
    bowling.countdown = Math.max(0, bowling.countdown - dt);
    player.position.z = BOWLING_RULES.startZ;
    if (bowling.countdown === 0) {
      bowling.rolling = true;
      player.speed = BOWLING_RULES.autoSpeed;
      setEffectToast("GO!", { pulse: 0.3 });
    }
    return;
  }
  updateBowlingPins();
  if (player.position.z >= BOWLING_RULES.endZ - 4) completeBowlingRoll();
}

function closestPointOnTrack(x, z) {
  const path = state.modeRun.trackPath;
  if (!path?.length) return null;
  let best = null;
  let bestDistanceSq = Infinity;
  for (let i = 0; i < path.length; i += 1) {
    const a = path[i];
    const b = path[(i + 1) % path.length];
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const lenSq = dx * dx + dz * dz || 1;
    const t = THREE.MathUtils.clamp(
      ((x - a.x) * dx + (z - a.z) * dz) / lenSq,
      0,
      1,
    );
    const px = a.x + dx * t;
    const pz = a.z + dz * t;
    const dSq = (x - px) ** 2 + (z - pz) ** 2;
    if (dSq < bestDistanceSq) {
      bestDistanceSq = dSq;
      best = { x: px, z: pz, segment: i, distance: Math.sqrt(dSq) };
    }
  }
  return best;
}

function constrainEntityToTrack(entity) {
  if (!isTrackMode() || !state.modeRun.trackPath?.length) return;
  const nearest = closestPointOnTrack(entity.position.x, entity.position.z);
  if (!nearest) return;
  const limit = state.modeRun.trackWidth * 0.52;
  if (nearest.distance <= limit) return;
  const dx = entity.position.x - nearest.x;
  const dz = entity.position.z - nearest.z;
  const d = Math.max(0.001, Math.hypot(dx, dz));
  entity.position.x = nearest.x + (dx / d) * limit;
  entity.position.z = nearest.z + (dz / d) * limit;
  entity.speed *= 0.78;
  entity.velocity.multiplyScalar(0.72);
  entity.group.position.copy(entity.position);
  state.modeRun.trackBounded = true;
  if (entity === player && state.effectToastTimer < 0.1)
    setEffectToast("Back on Track", { pulse: 0.08 });
}

function updateTrackMode() {
  constrainEntityToTrack(player);
  bots.forEach((bot) => constrainEntityToTrack(bot));
  const marker = modeMarkers[state.modeRun.markerIndex];
  if (!marker) return;
  if (isInsideMarker(marker, 4)) {
    completeModeMarker(
      marker,
      1,
      getModeDefinition().id === GAME_MODE_RACE ? 320 : 380,
    );
    if (state.modeRun.markerIndex >= modeMarkers.length) {
      state.modeRun.raceLap += 1;
      state.modeRun.markerIndex = 0;
      modeMarkers.forEach((item, index) => {
        item.complete = false;
        item.active = index === 0;
        item.group.visible = true;
      });
    }
  }
  if (state.modeRun.progress >= state.modeRun.target) completeModeRun();
}

function updateStuntMode(dt) {
  const mode = getModeDefinition();
  const steerInput = getSteer();
  const steer = Math.abs(steerInput);
  const airborne = isCarAirborne(player);
  if (airborne && steer > 0.58 && state.modeRun.comboTimer <= 0) {
    state.modeRun.comboTimer = 0.75;
    state.modeRun.stunt.barrelRolls += 1;
    state.modeRun.stunt.combo += 0.35;
    state.modeRun.stunt.trick = steer > 0.82 ? "Barrel Roll" : "Air Twist";
    player.triggerBarrelRoll(steerInput < 0 ? -1 : 1);
    state.score += 180 * state.modeRun.stunt.combo;
    state.boost = Math.min(1, state.boost + 0.08);
    setEffectToast(
      `${state.modeRun.stunt.trick} x${state.modeRun.stunt.combo.toFixed(1)}`,
      {
        pulse: 0.24,
      },
    );
  }
  state.modeRun.comboTimer = Math.max(0, state.modeRun.comboTimer - dt);
  if (state.modeRun.stunt.loopActive) {
    state.modeRun.stunt.loopTimer += dt;
    const duration = Math.max(0.6, state.modeRun.stunt.loopDuration || 1);
    const t = THREE.MathUtils.clamp(
      state.modeRun.stunt.loopTimer / duration,
      0,
      1,
    );
    const center = state.modeRun.stunt.loopCenter ?? player.position;
    const heading = state.modeRun.stunt.loopHeading ?? player.heading;
    const radius = state.modeRun.stunt.loopRadius || 15;
    const forward = tempVector.set(Math.sin(heading), 0, Math.cos(heading));
    player.position.x = center.x + forward.x * (t * 2 - 1) * radius;
    player.position.z = center.z + forward.z * (t * 2 - 1) * radius;
    player.position.y = Math.max(
      player.position.y,
      1.3 + Math.sin(t * Math.PI) * radius * 1.55,
    );
    player.heading = THREE.MathUtils.lerp(player.heading, heading, dt * 5);
    player.moveHeading = player.heading;
    player.speed = Math.max(player.speed, 52);
    if (state.modeRun.stunt.loopTimer >= duration) {
      state.modeRun.stunt.loopActive = false;
      state.modeRun.stunt.loopTimer = 0;
      state.modeRun.stunt.loopCenter = null;
      state.modeRun.stunt.trick = "Loop Exit";
      player.verticalVel = Math.max(player.verticalVel, 5.5);
      spawnBurst(
        player.position.clone().add(new THREE.Vector3(0, 1.1, 0)),
        0xffc457,
        36,
        { scale: 0.72, life: 0.58, force: 8.5, lift: 4.2 },
      );
      state.cameraShake = Math.max(state.cameraShake, 0.22);
      state.screenPulse = Math.max(state.screenPulse, 0.28);
      setEffectToast("Loop Exit Boost", { pulse: 0.28 });
    }
  }
  const marker = modeMarkers[state.modeRun.markerIndex];
  if (!marker) return;
  const dx = player.position.x - marker.group.position.x;
  const dy = player.position.y - (marker.y ?? marker.group.position.y);
  const dz = player.position.z - marker.group.position.z;
  const distance = Math.hypot(dx, dy, dz);
  if (distance <= marker.radius + 2) {
    if (marker.kind === "loop") {
      if (Math.abs(player.speed) < 40) {
        setEffectToast("Loop needs more speed", { pulse: 0.08 });
        return;
      }
      state.modeRun.stunt.loopActive = true;
      state.modeRun.stunt.loopTimer = 0;
      state.modeRun.stunt.loopDuration = 1.05;
      state.modeRun.stunt.loopCenter = marker.group.position.clone();
      state.modeRun.stunt.loopHeading = player.heading;
      state.modeRun.stunt.loopRadius = marker.radius + 2;
      state.modeRun.stunt.trick = "Loop the Loop";
      player.verticalVel = Math.max(player.verticalVel, 9);
      player.triggerBarrelRoll(getSteer() < 0 ? -1 : 1);
      spawnBurst(
        marker.group.position.clone().add(new THREE.Vector3(0, 2.5, 0)),
        marker.color,
        44,
        { scale: 0.82, life: 0.62, force: 9, lift: 5.4 },
      );
      state.screenPulse = Math.max(state.screenPulse, 0.32);
    }
    state.modeRun.stunt.rings += 1;
    state.modeRun.stunt.combo += marker.kind === "loop" ? 0.65 : 0.22;
    completeModeMarker(
      marker,
      1,
      mode.id === GAME_MODE_RAMP_RUSH
        ? 420
        : marker.kind === "loop"
          ? 620
          : 360,
    );
  }
  if (state.modeRun.progress >= state.modeRun.target) completeModeRun();
}

function updateLavaFloorMode(dt) {
  const lava = state.modeRun.lava;
  lava.graceTimer = Math.max(0, (lava.graceTimer ?? 0) - dt);
  const riseRate =
    lava.graceTimer > 0 ? 0.006 : 0.014 + lava.safeZoneIndex * 0.004;
  lava.height = Math.min(5.8, lava.height + dt * riseRate);
  modeDecor.forEach((object) => {
    if (object.userData?.lavaFloor) {
      object.position.y = lava.height;
      object.material.opacity = 0.48 + Math.sin(state.elapsed * 3) * 0.08;
      object.material.emissiveIntensity = 0.46 + lava.height * 0.08;
    }
  });
  const active = modeMarkers[lava.safeZoneIndex] ?? modeMarkers[0];
  const inside = active ? isInsideMarker(active, 1.2) : false;
  lava.platformHeight = active?.platformHeight ?? 1.6;
  if (inside && player.position.y >= lava.platformHeight - 0.4) {
    completeModeMarker(active, 1, 460 + lava.safeZoneIndex * 40);
    lava.safeZoneIndex = Math.min(
      lava.safeZoneIndex + 1,
      modeMarkers.length - 1,
    );
    modeMarkers.forEach((marker, index) => {
      marker.active = index === lava.safeZoneIndex && !marker.complete;
    });
    setEffectToast("Safe Platform", { pulse: 0.24 });
  } else if (
    lava.graceTimer <= 0 &&
    player.position.y < lava.height + 0.35 &&
    state.invincible <= 0
  ) {
    state.shield = Math.max(0, state.shield - dt * 0.11);
    if (state.shield <= 0) {
      state.lastFailReason =
        "The lava caught you before the safe platform. Climb the ramps earlier and guard your line.";
      loseLife();
      state.invincible = 1.4;
      setEffectToast("Lava Hit", { shake: 0.34, pulse: 0.28 });
    }
  } else if (lava.graceTimer > 0 && player.position.y < lava.height + 0.35) {
    setEffectToast("Find the ramp", { pulse: 0.06 });
  }
  bots.forEach((bot, index) => {
    const target = modeMarkers[lava.safeZoneIndex] ?? active;
    if (!target) return;
    const offset = new THREE.Vector3(
      (index - 1.5) * 7,
      0,
      (index % 2 ? -1 : 1) * 5,
    );
    driveCarToward(bot, target.group.position.clone().add(offset), dt, {
      stopRange: 8,
      speedMult: 0.92,
    });
    updateVerticalPhysics(bot, dt);
    bot.update(dt);
    pushCarsApart(player, bot, 0.82);
  });
  if (state.modeRun.progress >= state.modeRun.target) completeModeRun();
}

function updateHunterTagMode(dt) {
  state.modeRun.tagCooldown = Math.max(0, state.modeRun.tagCooldown - dt);
  if (state.modeRun.tagState === "it") {
    const target =
      bots[state.modeRun.taggedBotIndex % Math.max(1, bots.length)];
    if (target && target.position.distanceTo(player.position) < 14) {
      state.modeRun.tagState = "evader";
      state.modeRun.tagCooldown = 3.2;
      completeModeMarker(modeMarkers[state.modeRun.markerIndex], 1, 440);
      setEffectToast("Escaping Again", { pulse: 0.3 });
      state.invincible = Math.max(state.invincible, 1.6);
    }
  } else {
    const marker = modeMarkers[state.modeRun.markerIndex];
    if (isInsideMarker(marker, 2)) completeModeMarker(marker, 1, 300);
  }
  if (state.modeRun.progress >= state.modeRun.target) completeModeRun();
}

function drawBattleLaser(actor, hitPoint, hit = false) {
  const start = actor.position.clone().add(new THREE.Vector3(0, 1.05, 0));
  const end = hitPoint.clone().setY(1.05);
  const delta = end.clone().sub(start);
  const length = Math.max(1, Math.hypot(delta.x, delta.z));
  const color = actor.team === "red" ? 0xff5b5b : 0x56e9ff;
  const angle = Math.atan2(delta.x, delta.z);
  const group = new THREE.Group();
  group.position.set((start.x + end.x) * 0.5, 1.05, (start.z + end.z) * 0.5);
  group.rotation.y = angle;

  const parts = [
    { width: hit ? 0.74 : 0.5, height: 0.18, opacity: hit ? 0.96 : 0.74 },
    { width: hit ? 1.8 : 1.25, height: 0.34, opacity: hit ? 0.32 : 0.22 },
    { width: 0.16, height: 0.08, opacity: 0.72, offset: -0.72 },
    { width: 0.16, height: 0.08, opacity: 0.72, offset: 0.72 },
  ];
  parts.forEach(({ width, height, opacity, offset = 0 }) => {
    const beam = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, length),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    beam.position.x = offset;
    beam.userData.baseOpacity = opacity;
    group.add(beam);
  });
  const muzzle = new THREE.Mesh(
    new THREE.TorusGeometry(hit ? 1.05 : 0.82, 0.08, 8, 28),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: hit ? 0.9 : 0.58,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  muzzle.rotation.x = Math.PI / 2;
  muzzle.position.z = -length * 0.5 + 1.8;
  muzzle.userData.baseOpacity = hit ? 0.9 : 0.58;
  group.add(muzzle);
  const impact = new THREE.Mesh(
    new THREE.TorusGeometry(hit ? 1.55 : 0.78, 0.1, 8, 30),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: hit ? 0.82 : 0.34,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  impact.rotation.x = Math.PI / 2;
  impact.position.z = length * 0.5;
  impact.userData.baseOpacity = hit ? 0.82 : 0.34;
  group.add(impact);
  group.userData.fxLife = hit ? 0.26 : 0.19;
  scene.add(group);
  modeDecor.push(group);
}

function rayAabbDistance2D(
  origin,
  direction,
  center,
  halfX,
  halfZ,
  maxDistance,
) {
  let tMin = 0;
  let tMax = maxDistance;
  const axes = [
    {
      o: origin.x,
      d: direction.x,
      min: center.x - halfX,
      max: center.x + halfX,
    },
    {
      o: origin.z,
      d: direction.z,
      min: center.z - halfZ,
      max: center.z + halfZ,
    },
  ];
  for (const axis of axes) {
    if (Math.abs(axis.d) < 0.0001) {
      if (axis.o < axis.min || axis.o > axis.max) return Infinity;
      continue;
    }
    const inv = 1 / axis.d;
    let t1 = (axis.min - axis.o) * inv;
    let t2 = (axis.max - axis.o) * inv;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);
    if (tMin > tMax) return Infinity;
  }
  return tMax < 0 ? Infinity : Math.max(0, tMin);
}

function getBattleLaserBlocker(actor, forward) {
  let best = null;
  let bestAlong = BATTLE_RULES.laserRange;
  const beamPadding = Math.max(0.8, BATTLE_RULES.laserWidth * 0.18);
  obstacles.forEach((obstacle) => {
    if (obstacle.blocksLasers === false) return;
    const { mesh, size } = obstacle;
    if (!mesh || !size || mesh.position.y + size.y * 0.5 < 0.8) return;
    const along = rayAabbDistance2D(
      actor.position,
      forward,
      mesh.position,
      size.x * 0.5 + beamPadding,
      size.z * 0.5 + beamPadding,
      BATTLE_RULES.laserRange,
    );
    if (along > 0.6 && along < bestAlong) {
      bestAlong = along;
      best = {
        along,
        hitPoint: actor.position.clone().addScaledVector(forward, along),
      };
    }
  });
  return best;
}

function getLaserTarget(actor) {
  const forward = new THREE.Vector3(
    Math.sin(actor.heading),
    0,
    Math.cos(actor.heading),
  );
  const right = new THREE.Vector3(
    Math.cos(actor.heading),
    0,
    -Math.sin(actor.heading),
  );
  let best = null;
  let bestAlong = BATTLE_RULES.laserRange;
  let friendlyBlock = Infinity;
  const coverBlock = getBattleLaserBlocker(actor, forward);
  if (coverBlock) bestAlong = coverBlock.along;
  allBattleCars().forEach((candidate) => {
    if (candidate === actor || candidate.demolished) return;
    const rel = candidate.position.clone().sub(actor.position);
    const along = rel.dot(forward);
    const lateral = Math.abs(rel.dot(right));
    const hitWidth =
      BATTLE_RULES.laserWidth + (candidate.collisionRadius ?? CAR_RADIUS);
    if (along < 1 || along > BATTLE_RULES.laserRange || lateral > hitWidth)
      return;
    if (candidate.team === actor.team) {
      friendlyBlock = Math.min(friendlyBlock, along);
      return;
    }
    if (along < bestAlong) {
      best = candidate;
      bestAlong = along;
    }
  });
  if (friendlyBlock < bestAlong) return null;
  if (coverBlock && coverBlock.along <= bestAlong) {
    return {
      target: null,
      along: coverBlock.along,
      forward,
      blockedByCover: true,
      hitPoint: coverBlock.hitPoint,
    };
  }
  return best ? { target: best, along: bestAlong, forward } : null;
}

function updateBattleStateFromPlayer() {
  state.modeRun.battle.health = Math.max(
    0,
    Math.round(player.battleHealth ?? BATTLE_RULES.maxHealth),
  );
  state.modeRun.battle.ammo = Math.max(0, Math.round(player.battleAmmo ?? 0));
  state.modeRun.battle.laserCooldown = Number(
    Math.max(0, player.battleLaserCooldown ?? 0).toFixed(2),
  );
  state.modeRun.battle.reloadTimer = Number(
    Math.max(0, player.battleReloadTimer ?? 0).toFixed(2),
  );
  state.modeRun.battle.shield = Number(
    Math.max(0, player.battleShieldTimer ?? 0).toFixed(2),
  );
  state.modeRun.battle.targetScore = BATTLE_RULES.targetScore;
}

function respawnBattleCar(car) {
  const red = car.team === "red";
  const spread = red
    ? bots.filter((bot) => bot.team === "red").indexOf(car)
    : 0;
  const half = BATTLE_RULES.arenaHalfSize;
  const x = red ? -90 + spread * 58 : car === player ? -62 : 54 + spread * 38;
  const z = red ? half - 42 : -half + 42;
  car.setDemolished(false);
  car.battleHealth = BATTLE_RULES.maxHealth;
  car.battleAmmo = Math.ceil(BATTLE_RULES.maxAmmo / 2);
  car.battleReloadTimer = BATTLE_RULES.reloadSeconds;
  car.battleLaserCooldown = 0;
  car.battleShieldTimer = BATTLE_RULES.respawnShieldSeconds;
  car.setPosition(THREE.MathUtils.clamp(x, -half + 22, half - 22), 0, z);
  car.heading = red ? Math.PI : 0;
  car.moveHeading = car.heading;
  car.speed = 0;
  car.velocity.set(0, 0, 0);
  car.battleRespawnTimer = 0;
  car.setHealthBar(1, car !== player);
  if (car === player) {
    state.invincible = BATTLE_RULES.respawnShieldSeconds;
    setEffectToast("Respawn Shield", { pulse: 0.24 });
  }
}

function applyBattleDamage(target, amount, attacker = player) {
  if (!target || target.demolished || amount <= 0) return false;
  if ((target.battleShieldTimer ?? 0) > 0) {
    spawnBurst(
      target.position.clone().add(new THREE.Vector3(0, 1.1, 0)),
      target.team === "red" ? 0xff8f76 : 0x7feaff,
      18,
      { scale: 0.48, life: 0.32, force: 4.6, lift: 1.8 },
    );
    if (target === player)
      setEffectToast("Shield Bubble", { pulse: 0.16, shake: 0.08 });
    return false;
  }
  target.battleHealth = Math.max(
    0,
    (target.battleHealth ?? BATTLE_RULES.maxHealth) - amount,
  );
  target.setHealthBar(
    target.battleHealth / BATTLE_RULES.maxHealth,
    target !== player,
  );
  const color = target.team === "red" ? 0xff7a65 : 0x56e9ff;
  spawnBurst(
    target.position.clone().add(new THREE.Vector3(0, 0.8, 0)),
    color,
    14,
    {
      scale: 0.42,
      life: 0.28,
      force: 4.8,
      lift: 1.2,
    },
  );
  if (target.battleHealth > 0) {
    if (target === player)
      setEffectToast("Laser Hit", { shake: 0.18, pulse: 0.16 });
    return true;
  }
  target.setDemolished(true);
  releaseBattleFlag(target);
  target.battleRespawnTimer = BATTLE_RULES.respawnSeconds;
  const scoringTeam = attacker.team === "red" ? "red" : "blue";
  state.score += scoringTeam === "blue" ? 360 : 80;
  state.modeRun.battle.lastLaserHit = `${scoringTeam.toUpperCase()} KO`;
  setEffectToast(scoringTeam === "blue" ? "Blue KO" : "Red KO", {
    shake: 0.24,
    pulse: 0.28,
  });
  return true;
}

function updateBattleActorTimers(dt) {
  allBattleCars().forEach((car) => {
    car.battleLaserCooldown = Math.max(0, (car.battleLaserCooldown ?? 0) - dt);
    car.battleShieldTimer = Math.max(0, (car.battleShieldTimer ?? 0) - dt);
    if (
      (car.battleAmmo ?? 0) < BATTLE_RULES.maxAmmo &&
      (car.battleReloadTimer ?? 0) <= 0
    ) {
      car.battleReloadTimer = BATTLE_RULES.reloadSeconds;
    }
    car.battleReloadTimer = Math.max(0, (car.battleReloadTimer ?? 0) - dt);
    if (
      (car.battleAmmo ?? 0) < BATTLE_RULES.maxAmmo &&
      car.battleReloadTimer <= 0
    ) {
      car.battleAmmo = Math.min(
        BATTLE_RULES.maxAmmo,
        (car.battleAmmo ?? 0) + 1,
      );
      car.battleReloadTimer =
        car.battleAmmo < BATTLE_RULES.maxAmmo ? BATTLE_RULES.reloadSeconds : 0;
      if (car === player && car.battleAmmo === BATTLE_RULES.maxAmmo)
        setEffectToast("Ammo Full", { pulse: 0.14 });
    }
    if (car.demolished) {
      car.battleRespawnTimer = Math.max(0, (car.battleRespawnTimer ?? 0) - dt);
      if (car.battleRespawnTimer <= 0) respawnBattleCar(car);
    }
  });
  updateBattleStateFromPlayer();
}

function fireBattleLaser(actor = player) {
  if (!isBattleMode() || !actor || actor.demolished) return false;
  if ((actor.battleLaserCooldown ?? 0) > 0) return false;
  if ((actor.battleAmmo ?? 0) <= 0) {
    actor.battleReloadTimer = Math.max(
      actor.battleReloadTimer ?? 0,
      BATTLE_RULES.reloadSeconds,
    );
    if (actor === player) setEffectToast("Reloading", { pulse: 0.12 });
    return false;
  }
  actor.battleLaserCooldown = BATTLE_RULES.laserCooldown;
  actor.battleAmmo = Math.max(
    0,
    (actor.battleAmmo ?? BATTLE_RULES.maxAmmo) - 1,
  );
  const lock = getLaserTarget(actor);
  const forward = new THREE.Vector3(
    Math.sin(actor.heading),
    0,
    Math.cos(actor.heading),
  );
  const hitPoint = lock?.hitPoint
    ? lock.hitPoint
    : lock?.target
      ? lock.target.position
      : actor.position
          .clone()
          .addScaledVector(forward, BATTLE_RULES.laserRange);
  const hitEnemy = Boolean(lock?.target);
  const hitCover = Boolean(lock?.blockedByCover);
  drawBattleLaser(actor, hitPoint, hitEnemy || hitCover);
  if (hitEnemy) applyBattleDamage(lock.target, BATTLE_RULES.laserDamage, actor);
  if (hitCover) {
    spawnBurst(
      hitPoint.clone().add(new THREE.Vector3(0, 1.05, 0)),
      actor.team === "red" ? 0xff8f76 : 0x7feaff,
      12,
      { scale: 0.32, life: 0.22, force: 2.4, lift: 0.9 },
    );
  }
  if (actor === player) {
    state.cameraShake = Math.max(state.cameraShake, 0.08);
    state.modeRun.battle.lastLaserBlocked = hitCover;
    state.modeRun.battle.lastLaserHit = hitCover
      ? "Cover blocked"
      : hitEnemy
        ? `Hit ${lock.target.team}`
        : "Laser fired";
    updateBattleStateFromPlayer();
  }
  return hitEnemy;
}

function nearestBattlePickupFor(car, preferredIds = []) {
  let best = null;
  let bestDistance = Infinity;
  battlePickups.forEach((pickup) => {
    if (pickup.cooldown > 0) return;
    if (preferredIds.length && !preferredIds.includes(pickup.id)) return;
    const distance = car.position.distanceTo(pickup.group.position);
    if (distance < bestDistance) {
      best = pickup;
      bestDistance = distance;
    }
  });
  return best;
}

function driveCarToward(
  car,
  target,
  dt,
  { stopRange = 6, speedMult = 1 } = {},
) {
  const toTarget = tempVector.copy(target).sub(car.position);
  const distance = toTarget.length();
  if (distance < 0.001) return distance;
  const desiredHeading = Math.atan2(toTarget.x, toTarget.z);
  const steer = THREE.MathUtils.clamp(
    angleDifference(car.heading, desiredHeading),
    -1,
    1,
  );
  car.heading += steer * car.turnRate * dt * 1.25;
  car.moveHeading = THREE.MathUtils.lerp(
    car.moveHeading,
    car.heading,
    dt * 4.2,
  );
  const throttle = distance > stopRange ? 1 : 0.25;
  car.speed += car.accel * dt * throttle * speedMult;
  car.speed = Math.min(car.speed, car.maxSpeed * speedMult);
  car.speed *= 1 - dt * (distance < stopRange ? 1.3 : 0.12);
  const forward = tempVectorB.set(
    Math.sin(car.moveHeading),
    0,
    Math.cos(car.moveHeading),
  );
  car.velocity.copy(forward).multiplyScalar(car.speed);
  return distance;
}

function pushCarsApart(a, b, strength = 0.5) {
  const dx = a.position.x - b.position.x;
  const dz = a.position.z - b.position.z;
  const minDistance =
    (a.collisionRadius ?? CAR_RADIUS) +
    (b.collisionRadius ?? BOT_RADIUS) +
    0.25;
  const distance = Math.hypot(dx, dz);
  if (distance <= 0.001 || distance > minDistance) return false;
  const nx = dx / distance;
  const nz = dz / distance;
  const push = (minDistance - distance) * strength;
  a.position.x += nx * push;
  a.position.z += nz * push;
  b.position.x -= nx * push;
  b.position.z -= nz * push;
  const impulse = Math.max(4, (Math.abs(a.speed) + Math.abs(b.speed)) * 0.08);
  a.velocity.add(new THREE.Vector3(nx, 0, nz).multiplyScalar(impulse));
  b.velocity.add(new THREE.Vector3(-nx, 0, -nz).multiplyScalar(impulse));
  a.speed *= 0.92;
  b.speed *= 0.92;
  return true;
}

function constrainBattleCar(car) {
  const limit = BATTLE_RULES.arenaHalfSize - 8;
  car.position.x = THREE.MathUtils.clamp(car.position.x, -limit, limit);
  car.position.z = THREE.MathUtils.clamp(car.position.z, -limit, limit);
  car.group.position.copy(car.position);
}

function resolveBattleCarPushes() {
  const cars = allBattleCars().filter((car) => !car.demolished);
  for (let i = 0; i < cars.length; i += 1) {
    for (let j = i + 1; j < cars.length; j += 1) {
      pushCarsApart(cars[i], cars[j], 0.62);
    }
  }
}

function updateNonCampaignMode(dt) {
  const mode = getModeDefinition();
  if (isCampaignSurvivalMode() || isMaxMode()) return;
  recordGhostSample(dt);
  updateModeMarkerVisuals(dt);
  state.modeRun.battlePickupTimer = Math.max(
    0,
    state.modeRun.battlePickupTimer - dt,
  );
  if (state.modeRun.battlePickupTimer === 0) state.modeRun.battlePickup = "";

  if (mode.id === GAME_MODE_LAVA_FLOOR) {
    updateLavaFloorMode(dt);
    return;
  }

  if (mode.id === GAME_MODE_KING_ZONE) {
    const zones = activeModeMarkers();
    const activeZone = zones[0] ?? modeMarkers[0];
    const inside = isInsideMarker(activeZone, 0);
    if (inside) {
      const driftBonus = input.drift ? 1.55 : 1;
      state.modeRun.progress = Math.min(
        mode.target,
        state.modeRun.progress + dt * driftBonus,
      );
      state.score += dt * 18 * driftBonus;
    }
    if (state.modeRun.progress >= mode.target) completeModeRun();
    return;
  }

  if (mode.id === GAME_MODE_BATTLE) {
    updateBattleStateFromPlayer();
    return;
  }

  if (mode.id === GAME_MODE_BOOST_BOWLING) {
    updateBoostBowlingMode(dt);
    return;
  }

  if (mode.id === GAME_MODE_HUNTER_TAG) {
    updateHunterTagMode(dt);
    return;
  }

  if (mode.id === GAME_MODE_BOSS) {
    const marker = modeMarkers[state.modeRun.markerIndex];
    state.modeRun.bossWeakTimer = Math.max(0, state.modeRun.bossWeakTimer - dt);
    state.modeRun.bossPhase = 1 + Math.floor(state.modeRun.progress);
    if (isInsideMarker(marker, 3)) {
      completeModeMarker(marker, 1, 520);
      state.modeRun.bossWeakTimer = 2.4;
      const boss = bots.find((bot) => bot.role === "boss") ?? bots[0];
      if (boss) {
        boss.speed *= 0.35;
        boss.aiBurstCooldown = 2.4;
      }
      setEffectToast("Boss Weak Point");
    }
    if (state.modeRun.progress >= mode.target) completeModeRun();
    return;
  }

  if (mode.id === GAME_MODE_RACE || mode.id === GAME_MODE_TIME_TRIAL) {
    updateTrackMode(dt);
    return;
  }

  if (mode.id === GAME_MODE_STUNT || mode.id === GAME_MODE_RAMP_RUSH) {
    updateStuntMode(dt);
    return;
  }

  const marker = modeMarkers[state.modeRun.markerIndex];
  if (
    isInsideMarker(
      marker,
      mode.id === GAME_MODE_RACE || mode.id === GAME_MODE_TIME_TRIAL ? 4 : 2,
    )
  ) {
    const airBonus =
      player.position.y > 0.3 || state.lastLandingGrade ? 1.25 : 1;
    completeModeMarker(
      marker,
      1,
      mode.id === GAME_MODE_RAMP_RUSH || mode.id === GAME_MODE_STUNT
        ? 300 * airBonus
        : 260,
    );
  }
  if (state.modeRun.progress >= mode.target) completeModeRun();
}

function handleModeTimeExpired() {
  const mode = getModeDefinition();
  if (isCampaignSurvivalMode()) {
    completeLevel();
    return;
  }
  if (state.modeRun.progress >= state.modeRun.target) completeModeRun();
  else failModeRun("Time expired before the mode objective was complete.");
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
      setEffectToast(isMaxMode() ? maxBoostVariant.name : "Pad Surge", {
        pulse: 0.36,
      });
      spawnBurst(
        player.position.clone().add(new THREE.Vector3(0, 0.25, 0)),
        0x5feaff,
        14,
        { scale: 0.5, life: 0.28, force: 4.2, lift: 1.6 },
      );
    }
  });
}

function updateCamera(dt) {
  const deviceAssist = getDeviceAssistTuning();
  const maxProfile = isMaxMode() ? getMaxDifficultyProfile() : null;
  const battleCockpitActive = settings.battleCockpitCamera && isBattleMode();
  document.body.classList.toggle(
    "battle-cockpit",
    battleCockpitActive && state.running,
  );
  document.body.classList.toggle(
    "battle-cockpit-scope",
    battleCockpitActive && state.running,
  );
  if (player.visualRoot)
    player.visualRoot.visible = !(battleCockpitActive && state.running);
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
    state.cameraTelemetry.cockpit = false;
    state.cameraTelemetry.scope = false;
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
  const right = new THREE.Vector3(
    Math.cos(headingForCamera),
    0,
    -Math.sin(headingForCamera),
  );
  if (battleCockpitActive) {
    const cockpit = player.position
      .clone()
      .add(new THREE.Vector3(0, 1.34 + speedRatio * 0.08, 0))
      .addScaledVector(forward, 1.95)
      .addScaledVector(
        right,
        THREE.MathUtils.clamp(state.steerSmoothed, -1, 1) * 0.12,
      );
    const lookTarget = player.position
      .clone()
      .add(new THREE.Vector3(0, 1.38, 0))
      .addScaledVector(forward, 42 + speedRatio * 18);
    camera.position.lerp(cockpit, dt * 9.2);
    if (state.cameraShake > 0 && !deviceAssist.reducedMotion) {
      const shake = state.cameraShake * 0.32;
      camera.position.x += (Math.random() - 0.5) * shake;
      camera.position.y += (Math.random() - 0.5) * shake * 0.25;
      camera.position.z += (Math.random() - 0.5) * shake;
    }
    camera.lookAt(lookTarget);
    const targetFov = 68 + speedRatio * 3.5 + state.screenPulse * 2.4;
    if (Math.abs(camera.fov - targetFov) > 0.02) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, dt * 7.4);
      camera.updateProjectionMatrix();
    }
    state.cameraTelemetry.distance = 0;
    state.cameraTelemetry.height = 1.34;
    state.cameraTelemetry.lookAhead = 42 + speedRatio * 18;
    state.cameraTelemetry.ballCam = false;
    state.cameraTelemetry.cockpit = true;
    state.cameraTelemetry.scope = true;
    return;
  }
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
  const driftLean =
    input.drift && !isMaxMode()
      ? THREE.MathUtils.clamp(state.steerSmoothed * speedRatio * 3.2, -2.4, 2.4)
      : 0;
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
    .addScaledVector(forward, CAMERA_PLAYER_SCREEN_BIAS)
    .addScaledVector(right, driftLean);

  if (input.focusCamera || settings.cameraFocus) {
    desired.add(new THREE.Vector3(0, 4 * deviceAssist.cameraHeightMult, 0));
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
        .addScaledVector(forward, lookAhead);
  if (state.cameraShake > 0 && !deviceAssist.reducedMotion) {
    const shake = state.cameraShake * (isMaxMode() ? 0.45 : 0.62);
    camera.position.x += (Math.random() - 0.5) * shake;
    camera.position.y += (Math.random() - 0.5) * shake * 0.42;
    camera.position.z += (Math.random() - 0.5) * shake;
  }
  camera.lookAt(lookTarget);
  const targetFov =
    62 +
    speedRatio * 1.7 +
    (input.boost && state.boost > 0.05 ? 2.4 : 0) +
    state.screenPulse * 3.8;
  if (Math.abs(camera.fov - targetFov) > 0.02) {
    camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, dt * 5.8);
    camera.updateProjectionMatrix();
  }
  state.cameraTelemetry.distance =
    speedDistance * deviceAssist.cameraDistanceMult * gameDistanceMult;
  state.cameraTelemetry.height =
    speedHeight * deviceAssist.cameraHeightMult * gameHeightMult;
  state.cameraTelemetry.lookAhead = lookAhead;
  state.cameraTelemetry.ballCam = ballCamActive;
  state.cameraTelemetry.cockpit = false;
  state.cameraTelemetry.scope = false;
}

function updatePlayfieldReadability(dt) {
  groundGrid.position.x = 0;
  groundGrid.position.z = 0;
  groundGrid.rotation.y = 0;
  const targetOpacity = isMaxMode()
    ? 0.16
    : state.deviceProfile.compactHud
      ? 0.18
      : 0.23;
  const materials = Array.isArray(groundGrid.material)
    ? groundGrid.material
    : [groundGrid.material];
  materials.forEach((material) => {
    material.opacity = THREE.MathUtils.lerp(
      material.opacity,
      targetOpacity,
      Math.min(1, dt * 3),
    );
  });
}

function updateCombo(dt, steer) {
  if (input.drift && Math.abs(steer) > 0.2 && Math.abs(player.speed) > 12) {
    state.combo = Math.min(6, state.combo + dt * 0.94);
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    state.score += dt * 12 * state.combo;
    const milestone = Math.floor(state.combo);
    if (milestone > state.comboMilestone && milestone >= 2) {
      state.comboMilestone = milestone;
      setEffectToast(`Drift Chain x${milestone}`, { pulse: 0.22 });
    }
  } else {
    state.combo = Math.max(1, state.combo - dt * 0.4);
    if (state.combo < state.comboMilestone - 0.35) {
      state.comboMilestone = Math.max(1, Math.floor(state.combo));
    }
  }
}

function updateDifficulty(dt) {
  state.elapsed += dt;
  if (isMaxMode()) {
    if (state.effectToastTimer > 0) {
      state.effectToastTimer = Math.max(0, state.effectToastTimer - dt);
      if (state.effectToastTimer === 0) clearEffectToast();
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
    if (state.effectToastTimer === 0) clearEffectToast();
  }
}

function updateTransientEffects(dt) {
  state.cameraShake = Math.max(0, state.cameraShake - dt * 2.8);
  state.screenPulse = Math.max(0, state.screenPulse - dt * 2.4);
  state.threatToastCooldown = Math.max(0, state.threatToastCooldown - dt);
  state.nearMissCooldown = Math.max(0, state.nearMissCooldown - dt);
}

function stepGame(dt) {
  updateGamepadInput();
  const pausedByMenu = isMenuOpen() || isFeedbackOpen() || state.modeHelpOpen;
  const targetMinimapHeading = MINIMAP_USE_MOVE_HEADING
    ? player.moveHeading
    : player.heading;
  state.minimapHeading +=
    angleDifference(state.minimapHeading, targetMinimapHeading) *
    Math.min(1, dt * MINIMAP_HEADING_SMOOTH);
  document.body.classList.toggle(
    "replay-active",
    Boolean(maxMode.replayActive),
  );

  if (maxMode.replayActive && !pausedByMenu) {
    updateGoalReplay(dt);
    updateFx(dt);
    updateRemoteHumanPlayers(dt);
    updateCamera(dt);
    updateHud();
    updateRemoteNameTags();
    renderer.render(scene, camera);
    renderGaragePreview();
    return;
  }

  if (state.running && !pausedByMenu) {
    if (state.postHitSafeFrames > 0) state.postHitSafeFrames -= 1;
    state.timeLeft = Math.max(0, state.timeLeft - dt);
    updateDifficulty(dt);
    updateTransientEffects(dt);

    updatePlayer(dt);
    updateBots(dt);
    updateHunterThreatFeedback();
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
      updateNonCampaignMode(dt);
    }
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

    if (!isMaxMode() && state.timeLeft <= 0) handleModeTimeExpired();
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
    updateTransientEffects(dt);
  }

  updatePlayfieldReadability(dt);
  sendOnlineInputFrame(dt);
  updateRemoteHumanPlayers(dt);
  updateCamera(dt);
  updateHud();
  updateRemoteNameTags();
  renderer.render(scene, camera);
  renderGaragePreview();
}

function getRadarSector(right, forward) {
  const absRight = Math.abs(right);
  const absForward = Math.abs(forward);
  if (absForward >= absRight * 1.15) return forward >= 0 ? "front" : "behind";
  if (absRight >= absForward * 1.15) return right >= 0 ? "right" : "left";
  return `${forward >= 0 ? "front" : "behind"}-${right >= 0 ? "right" : "left"}`;
}

function getRadarMetrics() {
  const dims = getMaxArenaDimensions();
  const size = minimapCanvas?.width || getDeviceProfile().minimapSize || 180;
  const pad = Math.max(5, size * 0.035);
  const center = size * 0.5;
  const half = center - pad;
  const range = isMaxMode()
    ? Math.max(dims.halfWidth, dims.halfLength) * 1.08
    : Math.min(HALF_WORLD, 245);
  return { size, pad, center, half, range, heading: state.minimapHeading };
}

function projectRadarPoint(wx, wz, metrics = getRadarMetrics()) {
  const dx = wx - player.position.x;
  const dz = wz - player.position.z;
  const cos = Math.cos(metrics.heading);
  const sin = Math.sin(metrics.heading);
  const right = dx * cos - dz * sin;
  const forward = dx * sin + dz * cos;
  let screenX = (right / metrics.range) * metrics.half;
  let screenY = (-forward / metrics.range) * metrics.half;
  const overflow = Math.max(Math.abs(screenX), Math.abs(screenY));
  const edge = overflow > metrics.half;
  if (edge && overflow > 0) {
    const clamp = metrics.half / overflow;
    screenX *= clamp;
    screenY *= clamp;
  }
  return {
    x: metrics.center + screenX,
    y: metrics.center + screenY,
    screenX: Number(((metrics.center + screenX) / metrics.size).toFixed(3)),
    screenY: Number(((metrics.center + screenY) / metrics.size).toFixed(3)),
    right: Number(right.toFixed(2)),
    forward: Number(forward.toFixed(2)),
    distance: Number(Math.hypot(right, forward).toFixed(2)),
    edge,
    inRange: !edge,
    sector: getRadarSector(right, forward),
  };
}

function addRadarEntity(
  entities,
  metrics,
  kind,
  label,
  wx,
  wz,
  heading = 0,
  extra = {},
) {
  const projection = projectRadarPoint(wx, wz, metrics);
  entities.push({
    kind,
    label,
    heading: Number(
      (
        ((heading - metrics.heading + Math.PI * 3) % (Math.PI * 2)) -
        Math.PI
      ).toFixed(3),
    ),
    ...projection,
    ...extra,
  });
}

function buildRadarSnapshot() {
  const metrics = getRadarMetrics();
  const entities = [];
  addRadarEntity(
    entities,
    metrics,
    "player",
    "you",
    player.position.x,
    player.position.z,
    player.heading,
    {
      team: player.team ?? "blue",
      priority: 100,
    },
  );
  bots.slice(0, isMaxMode() ? 10 : 8).forEach((bot, index) => {
    addRadarEntity(
      entities,
      metrics,
      "bot",
      bot.role ?? `hunter-${index + 1}`,
      bot.position.x,
      bot.position.z,
      bot.moveHeading,
      {
        team: bot.team ?? "hunter",
        threat: !isMaxMode(),
        priority: !isMaxMode() ? 80 : 58,
      },
    );
  });
  for (const remote of remotePlayers.values()) {
    addRadarEntity(
      entities,
      metrics,
      "human",
      remote.username,
      remote.car.position.x,
      remote.car.position.z,
      remote.car.heading,
      {
        team: remote.team,
        priority: 88,
      },
    );
  }
  if (isMaxMode()) {
    const dims = getMaxArenaDimensions();
    [-1, 1].forEach((zSign) => {
      addRadarEntity(
        entities,
        metrics,
        "goal",
        zSign < 0 ? "blue goal" : "red goal",
        0,
        zSign * dims.goalLineZ,
        0,
        {
          team: zSign < 0 ? "blue" : "red",
          priority: 48,
        },
      );
    });
    if (maxMode.ball) {
      addRadarEntity(
        entities,
        metrics,
        "ball",
        "ball",
        maxMode.ball.position.x,
        maxMode.ball.position.z,
        0,
        {
          team: "neutral",
          priority: 95,
        },
      );
    }
  } else {
    ramps.slice(0, 12).forEach((ramp) => {
      addRadarEntity(
        entities,
        metrics,
        "ramp",
        ramp.userData.kind ?? "ramp",
        ramp.position.x,
        ramp.position.z,
        0,
        {
          priority: ramp.userData.kind === "titan" ? 44 : 34,
        },
      );
    });
    powerups.forEach((powerup) => {
      addRadarEntity(
        entities,
        metrics,
        "powerup",
        powerup.userData.type ?? "powerup",
        powerup.position.x,
        powerup.position.z,
        0,
        {
          priority: 46,
        },
      );
    });
    modeMarkers
      .filter((marker) => !marker.complete)
      .slice(0, 12)
      .forEach((marker) => {
        addRadarEntity(
          entities,
          metrics,
          "marker",
          marker.label ?? marker.kind ?? "objective",
          marker.group.position.x,
          marker.group.position.z,
          0,
          {
            kindDetail: marker.kind,
            active: marker.active,
            priority: marker.active ? 76 : 42,
          },
        );
      });
    battlePickups
      .filter((pickup) => pickup.cooldown <= 0)
      .forEach((pickup) => {
        addRadarEntity(
          entities,
          metrics,
          "pickup",
          pickup.label,
          pickup.group.position.x,
          pickup.group.position.z,
          0,
          {
            priority: 64,
          },
        );
      });
    boostPads.slice(0, 16).forEach((pad) => {
      addRadarEntity(
        entities,
        metrics,
        "boost",
        "boost",
        pad.position.x,
        pad.position.z,
        0,
        {
          priority: 20,
        },
      );
    });
  }
  const snapshot = {
    mode: "forward-relative",
    note: "top=front, left=car-left, right=car-right, bottom=behind",
    range: Number(metrics.range.toFixed(1)),
    heading: Number(metrics.heading.toFixed(3)),
    entities: entities
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
      .map(({ x, y, priority, ...entity }) => entity),
  };
  state.radarSnapshot = snapshot;
  return { snapshot, metrics, entities };
}

function drawRadarRoundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width * 0.5, height * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawRadarChevron(ctx, x, y, angle, color, size, edge = false) {
  const fx = Math.sin(angle);
  const fy = Math.cos(angle);
  const wing = size * 0.62;
  const tail = edge ? size * 0.45 : size * 0.72;
  ctx.fillStyle = color;
  ctx.strokeStyle = edge ? "rgba(255, 255, 255, 0.7)" : "rgba(5, 10, 18, 0.7)";
  ctx.lineWidth = edge ? 1.6 : 1.1;
  ctx.beginPath();
  ctx.moveTo(x + fx * size, y - fy * size);
  ctx.lineTo(x - fy * wing - fx * tail, y - fx * wing + fy * tail);
  ctx.lineTo(x + fy * wing - fx * tail, y + fx * wing + fy * tail);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawRadarDot(ctx, entity, color, radius) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(entity.x, entity.y, radius, 0, Math.PI * 2);
  ctx.fill();
  if (entity.edge) {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.62)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
}

function drawMinimap() {
  if (!minimapCtx || !minimapCanvas) return;
  const { snapshot, metrics, entities } = buildRadarSnapshot();
  const { size, pad, center, half } = metrics;
  minimapCtx.clearRect(0, 0, size, size);

  const bg = minimapCtx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(
    0,
    isMaxMode() ? "rgba(13, 31, 49, 0.98)" : "rgba(8, 17, 29, 0.98)",
  );
  bg.addColorStop(1, "rgba(4, 8, 15, 0.98)");
  drawRadarRoundRect(minimapCtx, 0, 0, size, size, Math.max(12, size * 0.1));
  minimapCtx.fillStyle = bg;
  minimapCtx.fill();

  minimapCtx.save();
  drawRadarRoundRect(
    minimapCtx,
    pad,
    pad,
    size - pad * 2,
    size - pad * 2,
    Math.max(9, size * 0.065),
  );
  minimapCtx.clip();

  const cone = minimapCtx.createLinearGradient(center, pad, center, center);
  cone.addColorStop(0, "rgba(126, 255, 255, 0.16)");
  cone.addColorStop(1, "rgba(126, 255, 255, 0)");
  minimapCtx.fillStyle = cone;
  minimapCtx.beginPath();
  minimapCtx.moveTo(center, center);
  minimapCtx.lineTo(center - half * 0.42, pad);
  minimapCtx.lineTo(center + half * 0.42, pad);
  minimapCtx.closePath();
  minimapCtx.fill();

  const drawEntity = (entity) => {
    if (
      (entity.kind === "boost" ||
        entity.kind === "ramp" ||
        entity.kind === "powerup") &&
      entity.edge
    )
      return;
    if (entity.kind === "player") return;
    if (entity.kind === "bot") {
      const color = isMaxMode()
        ? entity.team === "blue"
          ? "rgba(72, 224, 255, 0.96)"
          : "rgba(255, 92, 92, 0.96)"
        : "rgba(255, 82, 82, 0.96)";
      drawRadarChevron(
        minimapCtx,
        entity.x,
        entity.y,
        entity.edge
          ? Math.atan2(entity.x - center, center - entity.y)
          : entity.heading,
        color,
        entity.edge ? 6.6 : 5.2,
        entity.edge,
      );
    } else if (entity.kind === "human") {
      drawRadarChevron(
        minimapCtx,
        entity.x,
        entity.y,
        entity.edge
          ? Math.atan2(entity.x - center, center - entity.y)
          : entity.heading,
        "rgba(120, 255, 190, 0.98)",
        entity.edge ? 6.6 : 5.4,
        entity.edge,
      );
    } else if (entity.kind === "ball") {
      drawRadarDot(
        minimapCtx,
        entity,
        "rgba(250, 250, 244, 0.98)",
        entity.edge ? 4.8 : 4.1,
      );
    } else if (entity.kind === "goal") {
      minimapCtx.fillStyle =
        entity.team === "blue"
          ? "rgba(72, 224, 255, 0.86)"
          : "rgba(255, 92, 92, 0.86)";
      minimapCtx.fillRect(entity.x - 8, entity.y - 2.5, 16, 5);
    } else if (entity.kind === "ramp") {
      drawRadarChevron(
        minimapCtx,
        entity.x,
        entity.y,
        0,
        "rgba(255, 171, 92, 0.94)",
        entity.label === "titan" ? 4.8 : 3.8,
      );
    } else if (entity.kind === "powerup") {
      minimapCtx.fillStyle = "rgba(255, 213, 95, 0.94)";
      minimapCtx.fillRect(entity.x - 2.6, entity.y - 2.6, 5.2, 5.2);
    } else if (entity.kind === "marker") {
      minimapCtx.strokeStyle = entity.active
        ? "rgba(255, 209, 122, 0.96)"
        : "rgba(126, 255, 255, 0.68)";
      minimapCtx.lineWidth = entity.active ? 2 : 1.2;
      minimapCtx.beginPath();
      minimapCtx.arc(
        entity.x,
        entity.y,
        entity.active ? 4.8 : 3.6,
        0,
        Math.PI * 2,
      );
      minimapCtx.stroke();
    } else if (entity.kind === "pickup") {
      minimapCtx.fillStyle = "rgba(192, 255, 126, 0.94)";
      minimapCtx.beginPath();
      minimapCtx.moveTo(entity.x, entity.y - 4.2);
      minimapCtx.lineTo(entity.x + 4.2, entity.y);
      minimapCtx.lineTo(entity.x, entity.y + 4.2);
      minimapCtx.lineTo(entity.x - 4.2, entity.y);
      minimapCtx.closePath();
      minimapCtx.fill();
    } else if (entity.kind === "boost") {
      drawRadarDot(minimapCtx, entity, "rgba(86, 233, 255, 0.74)", 2.1);
    }
  };

  entities.forEach(drawEntity);

  minimapCtx.restore();

  minimapCtx.strokeStyle = isMaxMode()
    ? "rgba(255, 154, 108, 0.24)"
    : "rgba(86, 233, 255, 0.24)";
  minimapCtx.lineWidth = 1.3;
  drawRadarRoundRect(
    minimapCtx,
    pad,
    pad,
    size - pad * 2,
    size - pad * 2,
    Math.max(9, size * 0.065),
  );
  minimapCtx.stroke();

  minimapCtx.strokeStyle = "rgba(126, 255, 255, 0.7)";
  minimapCtx.lineWidth = 1.4;
  minimapCtx.beginPath();
  minimapCtx.moveTo(center, pad + 5);
  minimapCtx.lineTo(center, pad + 16);
  minimapCtx.stroke();

  drawRadarChevron(minimapCtx, center, center, 0, "#7effff", 7.4);

  if (DEBUG_FLAGS.enabled && DEBUG_FLAGS.minimap) {
    debugLog("minimap", {
      mode: snapshot.mode,
      range: snapshot.range,
      entities: snapshot.entities.slice(0, 6),
    });
  }
}

function updateDebugHud() {
  if (!debugHud) return;
  const visible = settings.devMode && DEBUG_FLAGS.enabled;
  debugHud.hidden = !visible;
  if (!visible) return;
  const mode = getModeDefinition().label;
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

function getModeHudStatus(mode = getModeDefinition()) {
  if (isCampaignSurvivalMode()) return getLevel().name;
  if (mode.id === GAME_MODE_HUNTER_TAG) {
    return state.modeRun.tagState === "it" ? "YOU'RE IT" : "EVADING";
  }
  if (mode.id === GAME_MODE_BATTLE)
    return `${state.modeRun.battle.blueScore}-${state.modeRun.battle.redScore}`;
  const target = Math.max(1, state.modeRun.target || mode.target || 1);
  return `${Math.floor(state.modeRun.progress)}/${Math.floor(target)}`;
}

function updateHud() {
  const level = getLevel();
  const mode = getModeDefinition();
  if (isMaxMode()) {
    if (statusLabelNodes.length >= 2) {
      statusLabelNodes[0].textContent = "Boost";
      statusLabelNodes[1].textContent = "Health";
    }
    if (hudLabelNodes.length >= 6) {
      hudLabelNodes[0].textContent = "Match";
      hudLabelNodes[1].textContent = "Build";
      hudLabelNodes[2].textContent = "Clock";
      hudLabelNodes[3].textContent = "State";
      hudLabelNodes[4].textContent = "Speed";
      hudLabelNodes[5].textContent = "Team";
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
    if (hudLivesPill) hudLivesPill.hidden = true;
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
    if (hudLabelNodes.length >= 6) {
      hudLabelNodes[0].textContent = "Zone";
      hudLabelNodes[1].textContent = "Heat";
      hudLabelNodes[2].textContent = "Clock";
      hudLabelNodes[3].textContent = "Score";
      hudLabelNodes[4].textContent = "Speed";
      hudLabelNodes[5].textContent = "Lives";
    }
    if (mode.id === GAME_MODE_BATTLE) {
      hudLabelNodes[0].textContent = "Teams";
      hudLabelNodes[1].textContent = "Flags";
      hudLabelNodes[3].textContent = "Ammo";
      hudLabelNodes[5].textContent = "Health";
      hudWorld.textContent = "Blue vs Red";
      hudLevel.textContent = `${state.modeRun.battle.blueScore}-${state.modeRun.battle.redScore}`;
      hudScore.textContent = `${Math.round(player.battleAmmo ?? 0)}/${BATTLE_RULES.maxAmmo}`;
      hudLives.textContent =
        (player.battleShieldTimer ?? 0) > 0
          ? `Shield ${Math.ceil(player.battleShieldTimer)}`
          : `${Math.round(player.battleHealth ?? BATTLE_RULES.maxHealth)} HP`;
      hudHearts.innerHTML = "";
    } else if (mode.id === GAME_MODE_BOOST_BOWLING) {
      hudLabelNodes[0].textContent = "Lane";
      hudLabelNodes[1].textContent = "Frame";
      hudLabelNodes[3].textContent = "Pins";
      hudWorld.textContent = "Boost Bowl";
      hudLevel.textContent =
        state.modeRun.bowling.countdown > 0
          ? Math.ceil(state.modeRun.bowling.countdown).toString()
          : `${state.modeRun.bowling.frame}.${state.modeRun.bowling.roll}`;
      hudScore.textContent = `${state.modeRun.bowling.pinsStanding} pins`;
      renderLivesHud();
    } else if (mode.id === GAME_MODE_LAVA_FLOOR) {
      hudWorld.textContent = "Lava Floor";
      hudLevel.textContent = `Safe ${state.modeRun.lava.safeZoneIndex + 1}/${modeMarkers.length || 1}`;
      hudScore.textContent = Math.floor(state.score).toString();
      renderLivesHud();
    } else {
      hudWorld.textContent = isCampaignSurvivalMode()
        ? getWorld().name
        : mode.label;
      hudLevel.textContent = getModeHudStatus(mode);
      hudScore.textContent = Math.floor(state.score).toString();
      renderLivesHud();
    }
    hudSpeed.textContent = `${Math.round(Math.abs(player.speed) * SPEED_TO_MPH_MULT)} MPH`;
    if (hudLivesPill) hudLivesPill.hidden = false;
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
  const shieldRatio = isMaxMode()
    ? (player.maxHealth ?? MAX_HEALTH_MAX) / MAX_HEALTH_MAX
    : isBattleMode()
      ? (player.battleHealth ?? BATTLE_RULES.maxHealth) / BATTLE_RULES.maxHealth
      : state.shield;
  shieldBar.style.width = `${Math.round(shieldRatio * 100)}%`;
  const progressPercent =
    isCampaignSurvivalMode() || isMaxMode()
      ? Math.min(100, (1 - state.timeLeft / level.time) * 100)
      : modeProgressPercent() * 100;
  progressBar.style.width = `${progressPercent}%`;
  drawMinimap();
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
  const spawn = getModeSpawn();
  player.setPosition(spawn.x, spawn.y, spawn.z);
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
  player.heading = spawn.heading;
  player.moveHeading = spawn.heading;
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
  state.nearMissStreak = 0;
  state.cameraShake = Math.max(state.cameraShake, 0.62);
  state.screenPulse = Math.max(state.screenPulse, 0.35);
  state.campaignRisk.recentHits = Math.min(
    6,
    state.campaignRisk.recentHits + 1.25,
  );
  state.campaignRisk.nearMisses = Math.max(
    0,
    state.campaignRisk.nearMisses - 0.6,
  );
  debugLog("hits", "detected", { sourceBotId, hitCount: state.hitCount });

  if (
    getModeDefinition().id === GAME_MODE_HUNTER_TAG &&
    state.modeRun.tagState === "evader" &&
    state.modeRun.tagCooldown <= 0
  ) {
    state.modeRun.tagState = "it";
    state.modeRun.taggedBotIndex = Math.max(0, sourceBotId);
    state.modeRun.tagCooldown = 2.6;
    state.lastFailReason =
      "You were tagged. Chase the marked hunter and tag them back to resume the escape.";
    setEffectToast("You Are It - Tag a Hunter", { shake: 0.4, pulse: 0.3 });
    state.invincible = 2.2;
    return;
  }

  if (getModeDefinition().id === GAME_MODE_BATTLE) {
    const attacker = bots.find((bot) => bot.botId === sourceBotId) ?? null;
    applyBattleDamage(player, 18, attacker ?? { team: "red" });
    state.lastFailReason =
      "Red team tagged you. Use cover, reload pickups, and shields before re-engaging.";
    state.invincible = 1.3;
    return;
  }

  if (state.shield > 0.2) {
    state.shield = Math.max(
      0,
      state.shield - (0.3 - loadoutStats.shieldRetention),
    );
    setEffectToast("Shield Hit", { shake: 0.28, pulse: 0.2 });
  } else {
    loseLife();
    state.lastFailReason =
      "A hunter clipped your line. Brake late, drift wider, or grab Shield before the pack closes.";
    setEffectToast("Hunter Hit - Life Lost", { shake: 0.62, pulse: 0.36 });
    debugLog("hits", "life_decremented", { lives: state.lives });
  }
  spawnBurst(
    player.position.clone().add(new THREE.Vector3(0, 0.28, 0)),
    state.shield > 0 ? 0x56e9ff : 0xff4d2d,
    20,
    { scale: 0.48, life: 0.34, force: 5.2, lift: 1.1 },
  );
  state.invincible = loadoutStats.invincibleDuration;
  state.postHitSafeFrames = POST_HIT_SAFE_FRAMES;

  for (let i = 0; i < bots.length; i += 1) {
    const bot = bots[i];
    if (bot.position.distanceToSquared(player.position) < 26 * 26) {
      bot.prevPosition.copy(bot.position);
    }
  }

  if (state.lives <= 0) {
    dispatchGameAction("retry");
    debugLog("hits", "restart_triggered");
  }
}

function registerNearMiss(label = "Near Miss", strength = 1) {
  if (isMaxMode() || !state.running) return;
  if (state.nearMissCooldown > 0) return;
  state.nearMissCooldown = 0.38;
  const reward = Math.round(32 * strength * state.combo);
  state.nearMissStreak = Math.min(99, state.nearMissStreak + 1);
  state.bestNearMissStreak = Math.max(
    state.bestNearMissStreak,
    state.nearMissStreak,
  );
  state.score += reward;
  state.boost = Math.min(1, state.boost + 0.018 * strength);
  if (state.effectToastTimer < 0.25 || state.nearMissStreak % 3 === 0) {
    setEffectToast(
      state.nearMissStreak > 1
        ? `${label} x${state.nearMissStreak} +${reward}`
        : `${label} +${reward}`,
      { pulse: 0.18 },
    );
  }
}

function updateHunterThreatFeedback() {
  if (isMaxMode() || !state.running || bots.length === 0) return;
  let closest = Infinity;
  let closing = false;
  for (const bot of bots) {
    const dx = player.position.x - bot.position.x;
    const dz = player.position.z - bot.position.z;
    const dist = Math.hypot(dx, dz);
    if (dist < closest) closest = dist;
    const closingSpeed =
      ((bot.velocity.x - player.velocity.x) * dx +
        (bot.velocity.z - player.velocity.z) * dz) /
      Math.max(1, dist);
    if (dist < 42 && closingSpeed > 12) closing = true;
  }
  if (closest < 26 && state.threatToastCooldown <= 0) {
    setEffectToast(closing ? "Hunter Closing" : "Hunter Close", {
      pulse: 0.16,
      shake: 0.08,
    });
    state.threatToastCooldown = 1.35;
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
  const keyboardSteer = (input.left ? -1 : 0) + (input.right ? 1 : 0);
  const gamepadSteer =
    Math.abs(gamepadState.steer) > 0.12 ? gamepadState.steer : 0;
  return THREE.MathUtils.clamp(keyboardSteer + gamepadSteer, -1, 1);
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
    gamepadState.throttle > 0.16 ||
    gamepadState.brake > 0.16 ||
    Math.abs(gamepadState.steer) > 0.12 ||
    Math.abs(input.touchSteer) > 0.08
  );
}

function setSchoolGateVisible(visible, status = state.schoolGate) {
  state.schoolGate.active = Boolean(visible);
  state.schoolGate.block = status.block || "";
  state.schoolGate.dayType = status.dayType || "";
  if (schoolGateDetail) {
    schoolGateDetail.textContent = status.block
      ? `${status.block} may be in session right now.`
      : "InfernoDrift4 is paused while class may be in session.";
  }
  schoolGate?.classList.toggle("show", Boolean(visible));
  document.body.classList.toggle("school-gate-open", Boolean(visible));
  if (visible) {
    state.running = false;
    setMenuOpen(false);
    message.classList.remove("show");
    schoolLeave?.focus({ preventScroll: true });
  }
}

function evaluateSchoolGate(date = new Date()) {
  const status = getSchoolGateStatus(date);
  if (status.active && !state.schoolGate.dismissed) {
    setSchoolGateVisible(true, status);
  } else {
    setSchoolGateVisible(false, status);
  }
  return { ...status, dismissed: Boolean(state.schoolGate.dismissed) };
}

function continuePastSchoolGate() {
  state.schoolGate.dismissed = true;
  setSchoolGateVisible(false, state.schoolGate);
  overlay?.classList.add("show");
  startBtn?.focus({ preventScroll: true });
}

function leaveFromSchoolGate() {
  window.close();
  window.setTimeout(() => {
    if (!document.hidden) window.location.replace("about:blank");
  }, 120);
}

function startRun(resetLives = false) {
  if (state.schoolGate.active && !state.schoolGate.dismissed) return;
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
    const score = Math.floor(state.score);
    const combo = state.bestCombo.toFixed(1);
    const nearMiss = state.bestNearMissStreak;
    showMessage(
      "System Critical",
      `${state.lastFailReason || "The hunters caught you."} Score ${score}. Best chain x${combo}. Near-miss streak ${nearMiss}. Press Enter to retry fast.`,
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

function getResultRows() {
  return [
    ["Score", Math.floor(state.score).toString()],
    ["Best Chain", `x${state.bestCombo.toFixed(1)}`],
    ["Near Miss", `${state.bestNearMissStreak}`],
    ["Landing", state.lastLandingGrade || "Clean"],
    ["Clock", hudTime?.textContent || "0:00"],
    ["Next Hook", isMaxMode() ? "Replay arena" : "One more heat"],
  ];
}

function showMessage(
  title,
  body,
  nextLabel = "Next",
  action = "next",
  rows = null,
) {
  messageTitle.textContent = title;
  messageBody.textContent = body;
  nextBtn.textContent = nextLabel;
  retryBtn.hidden = action === "retry" || action === "restart-current";
  if (messageStats) {
    const statRows = rows ?? getResultRows();
    messageStats.hidden = statRows.length === 0;
    messageStats.innerHTML = statRows
      .map(
        ([label, value]) =>
          `<div class="result-stat"><span>${label}</span><strong>${value}</strong></div>`,
      )
      .join("");
  }
  message.classList.add("show");
  document.body.classList.remove("playing");
  state.running = false;
  state.pendingAction = action;
}

function completeLevel() {
  if (isMaxMode()) {
    const { medal, xpGained } = awardModeProgression({ won: true });
    showMessage(
      "Blue Team Wins",
      `Arena complete. ${medal} medal earned, +${xpGained} XP. Press Enter to replay.`,
      "Replay",
      "restart-current",
      getModeResultRows(true),
    );
    return;
  }
  if (!isCampaignSurvivalMode()) {
    completeModeRun();
    return;
  }
  const world = getWorld();
  const level = getLevel();
  const nextProgress = getNextProgressIndices();
  const currentWorld = state.worldIndex;
  const currentLevel = state.levelIndex;
  state.worldIndex = nextProgress.worldIndex;
  state.levelIndex = nextProgress.levelIndex;
  savePersistentState();
  state.worldIndex = currentWorld;
  state.levelIndex = currentLevel;
  const isLastLevel = state.levelIndex === world.levels.length - 1;
  const { medal, xpGained } = awardModeProgression({ won: true });
  const runSummary = `Score ${Math.floor(state.score)}. Best chain x${state.bestCombo.toFixed(1)}. Near-miss streak ${state.bestNearMissStreak}. ${state.lastLandingGrade ? `${state.lastLandingGrade}. ` : ""}Press Enter for the next heat.`;
  if (isLastLevel) {
    const isLastWorld = state.worldIndex === worldData.length - 1;
    if (isLastWorld) {
      showMessage(
        "Champion Crowned",
        `You outran every hunter. ${medal} medal, +${xpGained} XP. ${runSummary}`,
        "Restart Saga",
        "next",
        getModeResultRows(true),
      );
    } else {
      showMessage(
        `World Cleared: ${world.name}`,
        `New realm unlocked. ${medal} medal, +${xpGained} XP. ${runSummary}`,
        "Next Heat",
        "next",
        getModeResultRows(true),
      );
    }
  } else {
    showMessage(
      `Level Cleared: ${level.name}`,
      `Momentum locked. ${medal} medal, +${xpGained} XP. ${runSummary}`,
      "Next Heat",
      "next",
      getModeResultRows(true),
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
  forceOnlineProgressSync();
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

window.addEventListener(
  "focusin",
  (event) => {
    if (isTextEditingTarget(event.target)) {
      Object.assign(input, {
        left: false,
        right: false,
        throttle: false,
        brake: false,
        drift: false,
        boost: false,
        laser: false,
        backflip: false,
      });
    }
  },
  { capture: true },
);

window.addEventListener("keydown", (event) => {
  updateAutoInputMode("desktop");
  if (state.awaitingRemapAction && !event.repeat) {
    event.preventDefault();
    const action = state.awaitingRemapAction;
    state.awaitingRemapAction = "";
    setPrimaryBinding(action, event.code);
    renderControlsUi();
    return;
  }
  if (isTextEditingTarget(event.target)) return;
  if (state.schoolGate.active && !state.schoolGate.dismissed) {
    if (event.code === "Escape") leaveFromSchoolGate();
    event.preventDefault();
    return;
  }
  if (event.code === EXIT_LINK_KEY_CODE && !event.repeat) {
    event.preventDefault();
    openExitLink();
    return;
  }
  if (
    isActionCode(event.code, "drift") ||
    isActionCode(event.code, "targetLunge") ||
    isActionCode(event.code, "jumpTrick") ||
    isActionCode(event.code, "altTrick") ||
    isActionCode(event.code, "laser") ||
    isActionCode(event.code, "help")
  ) {
    event.preventDefault();
  }
  if (isActionCode(event.code, "left")) input.left = true;
  if (isActionCode(event.code, "right")) input.right = true;
  if (isActionCode(event.code, "throttle")) input.throttle = true;
  if (isActionCode(event.code, "brake")) input.brake = true;
  if (isActionCode(event.code, "drift")) input.drift = true;
  if (isActionCode(event.code, "boost")) input.boost = true;
  if (isActionCode(event.code, "laser")) {
    input.laser = true;
    if (!event.repeat) fireBattleLaser(player);
  }
  if (isActionCode(event.code, "help") && !event.repeat) {
    if (state.modeHelpOpen) closeModeHelp({ resume: true });
    else openModeHelp();
  }
  if (isActionCode(event.code, "targetLunge")) {
    if (isMaxMode() && !event.repeat)
      performMaxBallLunge() || performMaxBotLunge();
  }
  if (
    isActionCode(event.code, "jumpTrick") ||
    isActionCode(event.code, "altTrick")
  ) {
    if (isCarAirborne(player) || player.backflipActive) input.backflip = true;
    if (!event.repeat) performJumpOrBackflip();
  }
  if (isActionCode(event.code, "chat") && !event.repeat) {
    setChatPopoutOpen(!onlineState.chatOpen);
    setEffectToast(onlineState.chatOpen ? "Online Chat" : "Chat Closed");
  }
  if (isActionCode(event.code, "ballCam") && isMaxMode() && !event.repeat) {
    state.ballCam = !state.ballCam;
    setEffectToast(state.ballCam ? "Ball Cam On" : "Ball Cam Off");
  }
  if (isActionCode(event.code, "restart")) dispatchGameAction("restart-level");
  if (event.code === "Enter") {
    if (overlay.classList.contains("show")) {
      dispatchGameAction("start");
    } else if (message.classList.contains("show")) {
      dispatchGameAction("message-next");
    }
  }
  if (isActionCode(event.code, "menu")) {
    if (state.modeHelpOpen) {
      closeModeHelp({ resume: true });
      return;
    }
    setMenuOpen(!isMenuOpen());
  }
  debugLog("input", "keydown", event.code);
});

window.addEventListener("keyup", (event) => {
  if (isTextEditingTarget(event.target)) return;
  if (
    isActionCode(event.code, "drift") ||
    isActionCode(event.code, "targetLunge") ||
    isActionCode(event.code, "jumpTrick") ||
    isActionCode(event.code, "altTrick") ||
    isActionCode(event.code, "laser") ||
    isActionCode(event.code, "help")
  ) {
    event.preventDefault();
  }
  if (isActionCode(event.code, "left")) input.left = false;
  if (isActionCode(event.code, "right")) input.right = false;
  if (isActionCode(event.code, "throttle")) input.throttle = false;
  if (isActionCode(event.code, "brake")) input.brake = false;
  if (isActionCode(event.code, "drift")) input.drift = false;
  if (isActionCode(event.code, "boost")) input.boost = false;
  if (isActionCode(event.code, "laser")) input.laser = false;
  if (
    isActionCode(event.code, "jumpTrick") ||
    isActionCode(event.code, "altTrick")
  )
    input.backflip = false;
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

function wasGamepadPressed(index) {
  return (
    Boolean(gamepadState.buttons[index]) && !gamepadState.previousButtons[index]
  );
}

function updateGamepadInput() {
  const pads = navigator.getGamepads ? [...navigator.getGamepads()] : [];
  const pad = pads.find(Boolean);
  gamepadState.previousButtons = { ...gamepadState.buttons };
  if (!pad) {
    gamepadState.connected = false;
    gamepadState.id = "";
    gamepadState.steer = 0;
    gamepadState.throttle = 0;
    gamepadState.brake = 0;
    gamepadState.drift = false;
    gamepadState.boost = false;
    gamepadState.buttons = {};
    return;
  }
  gamepadState.connected = true;
  gamepadState.id = pad.id || "Gamepad";
  gamepadState.steer = THREE.MathUtils.clamp(pad.axes?.[0] ?? 0, -1, 1);
  const dpadLeft = pad.buttons?.[14]?.pressed ? -1 : 0;
  const dpadRight = pad.buttons?.[15]?.pressed ? 1 : 0;
  if (dpadLeft || dpadRight) gamepadState.steer = dpadLeft + dpadRight;
  gamepadState.throttle = Math.max(
    pad.buttons?.[7]?.value ?? 0,
    pad.buttons?.[12]?.pressed ? 1 : 0,
  );
  gamepadState.brake = Math.max(
    pad.buttons?.[6]?.value ?? 0,
    pad.buttons?.[13]?.pressed ? 1 : 0,
  );
  gamepadState.drift = Boolean(pad.buttons?.[2]?.pressed);
  gamepadState.boost = Boolean(pad.buttons?.[1]?.pressed);
  gamepadState.buttons = Object.fromEntries(
    pad.buttons.map((button, index) => [index, Boolean(button.pressed)]),
  );
  if (wasGamepadPressed(0)) performJumpOrBackflip();
  if ((wasGamepadPressed(4) || wasGamepadPressed(5)) && isMaxMode())
    performMaxBallLunge() || performMaxBotLunge();
  if (wasGamepadPressed(3) && isMaxMode()) {
    state.ballCam = !state.ballCam;
    setEffectToast(state.ballCam ? "Ball Cam On" : "Ball Cam Off");
  }
  if (wasGamepadPressed(8)) dispatchGameAction("restart-level");
  if (wasGamepadPressed(9)) setMenuOpen(!isMenuOpen());
  if (controllerStatus && isMenuOpen()) renderControlsUi();
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

function returnFocusToGame() {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
  window.focus();
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
      input.drift = true;
    }
  });
  touchDrift.addEventListener("pointerup", () => {
    if (input.touchEnabled) input.drift = false;
  });
  touchDrift.addEventListener("pointerleave", () => {
    if (input.touchEnabled) input.drift = false;
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
        performJumpOrBackflip();
      }
    });
  }
  if (touchBackflip) {
    touchBackflip.addEventListener("pointerdown", () => {
      if (!input.touchEnabled) return;
      updateAutoInputMode("touch");
      performJumpOrBackflip();
    });
    const clearBackflip = () => {
      input.backflip = false;
    };
    touchBackflip.addEventListener("pointerup", clearBackflip);
    touchBackflip.addEventListener("pointercancel", clearBackflip);
    touchBackflip.addEventListener("pointerleave", clearBackflip);
  }
  if (touchLaser) {
    touchLaser.addEventListener("pointerdown", () => {
      if (!input.touchEnabled) return;
      updateAutoInputMode("touch");
      input.laser = true;
      fireBattleLaser(player);
    });
    const clearLaser = () => {
      input.laser = false;
    };
    touchLaser.addEventListener("pointerup", clearLaser);
    touchLaser.addEventListener("pointercancel", clearLaser);
    touchLaser.addEventListener("pointerleave", clearLaser);
  }
}

bindPressAction(startBtn, () => startGuestProfile());
bindPressAction(startAccountSubmit, () => submitStartAccount());
bindPressAction(schoolLeave, () => leaveFromSchoolGate());
bindPressAction(schoolContinue, () => continuePastSchoolGate());
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
bindPressAction(helpBtn, () => openModeHelp());
bindPressAction(modeHelpResume, () => closeModeHelp({ resume: true }));
bindPressAction(modeHelpRestart, () => {
  closeModeHelp({ resume: false });
  dispatchGameAction("restart-level");
});

bindPressAction(menuBtn, () => {
  setMenuOpen(true, state.running ? "games" : null);
});
bindPressAction(menuFeedback, () => {
  openFeedbackModal();
});
bindPressAction(dailyGiftNotice, () => redeemDailyGift());
bindPressAction(menuResume, () => {
  setMenuOpen(false);
});
bindPressAction(menuRestart, () => {
  setMenuOpen(false);
  dispatchGameAction("restart-level");
});

tabButtons.forEach((button) => {
  bindPressAction(button, () => {
    if (button.hidden) return;
    setActiveTab(button.dataset.tab);
  });
});

renderQuickChat(onlineQuickChat);
renderQuickChat(chatPopoutQuick);

bindPressAction(onlineConnect, () => connectOnline());
bindPressAction(onlineDisconnect, () => disconnectOnline());
bindPressAction(onlineClaim, () => claimOnlineUsername());
bindPressAction(profileRefresh, () => {
  requestOnlineProfile();
  requestOnlineLeaderboard({ force: true });
});
bindPressAction(profileLogout, () => logoutOnlineProfile());
bindPressAction(profileDelete, () => deleteOnlineProfile());
bindPressAction(onlineCreateRoom, () => {
  const options = getOnlineRoomOptions();
  sendOnlineMessage({
    type: "room.create",
    ...options,
    private: true,
  });
});
bindPressAction(onlineQueue, () => {
  sendOnlineMessage({
    type: "queue.join",
    ...getOnlineRoomOptions(),
  });
});
bindPressAction(onlineCancelQueue, () => {
  sendOnlineMessage({ type: "queue.cancel" });
});
bindPressAction(onlineJoinRoom, () => {
  const code = String(onlineRoomCode?.value || "")
    .trim()
    .toUpperCase();
  if (!code) return;
  sendOnlineMessage({ type: "room.join", code });
});
bindPressAction(onlineShareRoom, () => {
  if (!onlineState.room?.code) {
    pushOnlineChatMessage({
      from: "System",
      text: "Create or join a room before sharing a code.",
      quick: true,
    });
    updateOnlineUi();
    return;
  }
  sendOnlineMessage({ type: "room.share" }, { queue: false });
});
bindPressAction(onlinePopoutChat, () => setChatPopoutOpen(true));
bindPressAction(chatPopoutClose, () => setChatPopoutOpen(false));
bindPressAction(chatNoticeClose, () => hideChatNotice());
bindPressAction(onlineChatSend, () => sendFreeChat(onlineChatInput?.value));
bindPressAction(chatPopoutSend, () => sendFreeChat(chatPopoutInput?.value));
bindPressAction(onlineAddFriend, () => {
  const username = sanitizeRemoteUsername(onlineFriendName?.value || "");
  if (!username) return;
  sendOnlineMessage({ type: "friend.request", username });
  if (onlineFriendName) onlineFriendName.value = "";
});
bindPressAction(feedbackClose, () => closeFeedbackModal());
bindPressAction(feedbackCancel, () => closeFeedbackModal());
bindPressAction(feedbackSubmit, () => submitFeedback());

[onlineChatInput, chatPopoutInput].forEach((inputNode) => {
  inputNode?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") sendFreeChat(inputNode.value);
  });
});

feedbackAge13?.addEventListener("change", () => {
  if (feedbackEmail) {
    feedbackEmail.disabled = !feedbackAge13.checked;
    if (!feedbackAge13.checked) feedbackEmail.value = "";
  }
});

onlineBackendUrlInput?.addEventListener("change", () => {
  onlineState.backendUrl = normalizeOnlineBackendUrl(
    onlineBackendUrlInput.value,
  );
  saveOnlineConfig();
  updateOnlineUi();
});

bindPressAction(garageZoomIn, () => {
  initGaragePreview();
  garageState.preview.zoom = THREE.MathUtils.clamp(
    garageState.preview.zoom - 0.45,
    4.1,
    7.6,
  );
});
bindPressAction(garageZoomOut, () => {
  initGaragePreview();
  garageState.preview.zoom = THREE.MathUtils.clamp(
    garageState.preview.zoom + 0.45,
    4.1,
    7.6,
  );
});
bindPressAction(garageResetView, () => {
  garageState.preview.yaw = -0.42;
  garageState.preview.zoom = 5.7;
});

carClassSelect?.addEventListener("change", (event) => {
  applyCarClass(event.target.value);
});

touchLayoutSelect?.addEventListener("change", (event) => {
  settings.touchLayout = TOUCH_LAYOUT_OPTIONS[event.target.value]
    ? event.target.value
    : "classic";
  applyDeviceProfile();
  savePersistentState();
});

touchScaleSelect?.addEventListener("change", (event) => {
  settings.touchScale = THREE.MathUtils.clamp(
    Number(event.target.value),
    0.86,
    1.14,
  );
  applyDeviceProfile();
  savePersistentState();
});

exitLinkUrlInput?.addEventListener("change", (event) => {
  settings.exitLinkUrl = normalizeExitLinkUrl(event.target.value);
  exitLinkUrlInput.value = settings.exitLinkUrl;
  savePersistentState();
});

modeBoard?.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const card = target?.closest("[data-game-mode]");
  if (!card) return;
  const nextMode = card.dataset.gameMode;
  const mode = getModeDefinition(nextMode);
  setActiveGameMode(nextMode, { save: true, reset: state.running });
  setActiveTab("games");
  setEffectToast(`${mode.label} Ready`);
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
  settings.campaignAiMode = normalizeCampaignAiMode(event.target.value);
  resetCampaignRiskMemory();
  refreshDevModeUi();
  refreshGamesUi();
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

if (battleCockpitToggle) {
  battleCockpitToggle.addEventListener("change", (event) => {
    settings.battleCockpitCamera = event.target.checked;
    savePersistentState();
  });
}

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
  const radarSnapshot = buildRadarSnapshot().snapshot;
  const mode = getModeDefinition();
  const activeTab =
    document.querySelector(".tab-btn.active")?.dataset.tab ?? "";
  const activeScreen = getUiScreen();
  const publicModeId = getPublicModeId(mode);
  const displayLeaderboard = getDisplayLeaderboardRows();
  const currentOnlineUserId = onlineState.user?.id || "";
  const currentOnlineUsername =
    onlineState.user?.username || onlineState.username;
  const currentPlayerPresentOnLeaderboard = displayLeaderboard.some(
    (row) =>
      (currentOnlineUserId && row.userId === currentOnlineUserId) ||
      row.username === currentOnlineUsername,
  );
  const remotePlayerSnapshots = [...remotePlayers.values()].map((remote) => ({
    id: remote.id,
    username: remote.username,
    badge: remote.badge,
    team: remote.team,
    x: Number(remote.car.position.x.toFixed(2)),
    y: Number(remote.car.position.y.toFixed(2)),
    z: Number(remote.car.position.z.toFixed(2)),
    heading: Number(remote.car.heading.toFixed(3)),
    speed: Number(remote.speed.toFixed(2)),
    airborne: Boolean(remote.airborne),
    backflip: Boolean(remote.backflip),
    barrelRoll: Boolean(remote.barrelRoll),
    boost: Boolean(remote.boost),
    cosmeticsKey: remote.cosmeticsKey,
    snapshotAgeMs: Math.max(
      0,
      Math.round(performance.now() - onlineState.lastSnapshotAt),
    ),
  }));
  const payload = {
    mode: publicModeId,
    modeInfo: {
      id: publicModeId,
      label: mode.label,
      category: mode.category,
      scene: mode.scene,
      objective: mode.objective,
      progress: Number(state.modeRun.progress.toFixed(2)),
      target: state.modeRun.target || mode.target || getLevel().time,
      medalPreview: mode.medal,
      rewardPreview: mode.reward,
    },
    note: "origin center, +x right, +z north/forward, +y up",
    running: state.running,
    replay: maxMode.replayActive,
    replayState: {
      active: maxMode.replayActive,
      ring: maxMode.replayActive,
      frames: maxMode.replayFrames.length,
      playbackFps: MAX_REPLAY_RULES.playbackFps,
      meta: maxMode.replayMeta,
    },
    ui: {
      screen: activeScreen,
      tab: activeTab,
      paused: isMenuOpen() || isFeedbackOpen() || state.modeHelpOpen,
      resultsVisible: message.classList.contains("show"),
      product: "InfernoDrift4",
      schoolGate: {
        visible: Boolean(schoolGate?.classList.contains("show")),
        active: Boolean(state.schoolGate.active),
        dismissed: Boolean(state.schoolGate.dismissed),
        block: state.schoolGate.block,
        dayType: state.schoolGate.dayType,
      },
    },
    modeHelp: {
      visible: Boolean(state.modeHelpOpen),
      title: getModeHelp(mode).title,
      objective: getModeHelp(mode).objective,
      placement: "bottom-right",
    },
    player: {
      x: Number(player.position.x.toFixed(2)),
      y: Number(player.position.y.toFixed(2)),
      z: Number(player.position.z.toFixed(2)),
      speed_mph: Math.round(Math.abs(player.speed) * SPEED_TO_MPH_MULT),
      boost: Number(state.boost.toFixed(2)),
      demolished: Boolean(player.demolished),
      backflipActive: Boolean(player.backflipActive),
      barrelRollActive: Boolean(player.barrelRollActive),
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
      combo: Number(state.combo.toFixed(2)),
      driftActive: Boolean(input.drift),
      boost: Number(state.boost.toFixed(2)),
      shield: Number(
        (isMaxMode()
          ? (player.maxHealth ?? MAX_HEALTH_MAX) / MAX_HEALTH_MAX
          : state.shield
        ).toFixed(2),
      ),
      score: isMaxMode()
        ? { blue: maxMode.blueScore, red: maxMode.redScore }
        : Math.floor(state.score),
    },
    effects: {
      lastToast: state.lastEffectToast || state.effectToast || "",
      activeToast: state.effectToast || "",
      shake: Number(state.cameraShake.toFixed(3)),
      pulse: Number(state.screenPulse.toFixed(3)),
      lastLandingGrade: state.lastLandingGrade,
      bestCombo: Number(state.bestCombo.toFixed(2)),
      bestNearMissStreak: state.bestNearMissStreak,
    },
    controls: {
      jumpTrickKey: formatCodeLabel(controlBindings.jumpTrick[0] ?? "KeyX"),
      backflipKey: formatCodeLabel(controlBindings.altTrick[0] ?? "KeyB"),
      alternateBackflipKey: formatCodeLabel(
        controlBindings.altTrick[0] ?? "KeyB",
      ),
      reservedChatKey: formatCodeLabel(controlBindings.chat[0] ?? "KeyC"),
      exitLinkKey: "Q",
      exitLinkUrl: settings.exitLinkUrl,
      bindings: serializeControlBindings(),
      touchLayout: settings.touchLayout,
      touchScale: Number(settings.touchScale),
      controller: {
        connected: gamepadState.connected,
        id: gamepadState.id,
        steer: Number(gamepadState.steer.toFixed(2)),
      },
    },
    garage: {
      activeLoadoutId: garageState.activeLoadoutId,
      activeLoadoutIndex: getActiveLoadoutIndex(),
      activeClass: getClassSummary().id,
      unlockRule: "xp-level",
      xpLevel: getGarageProgressLevel(),
      lockedCount: getLockedGarageOptionCount(),
      nextUnlock: (() => {
        const next = getNextGarageUnlock();
        return next ? { name: next.option.name, level: next.level } : null;
      })(),
      preview: {
        ready: garageState.preview.ready,
        yaw: Number(garageState.preview.yaw.toFixed(3)),
        zoom: Number(garageState.preview.zoom.toFixed(2)),
        frame: garageState.preview.frame,
      },
      loadouts: garageState.loadouts.map((loadout) => ({
        id: loadout.id,
        name: loadout.name,
        classId: loadout.classId,
        paintId: loadout.paintId,
        glowId: loadout.glowId,
      })),
    },
    radar: radarSnapshot,
    markers: modeMarkers.map((marker) => ({
      kind: marker.kind,
      label: marker.label,
      active: marker.active,
      complete: marker.complete,
      x: Number(marker.group.position.x.toFixed(2)),
      z: Number(marker.group.position.z.toFixed(2)),
    })),
    track: {
      checkpoints: modeMarkers.filter((marker) => marker.kind === "checkpoint")
        .length,
      lap: state.modeRun.raceLap,
      nextIndex: state.modeRun.markerIndex,
      progress: Number(modeProgressPercent().toFixed(3)),
      trackBounded: Boolean(state.modeRun.trackBounded),
      width: state.modeRun.trackWidth,
      rivals: bots.filter((bot) => String(bot.role).startsWith("rival")).length,
    },
    race: {
      lap: state.modeRun.raceLap,
      checkpoint: state.modeRun.markerIndex,
      trackBounded: Boolean(state.modeRun.trackBounded),
      rivals: bots.filter((bot) => String(bot.role).startsWith("rival")).length,
    },
    ghost: {
      samples: state.modeRun.ghost.length,
      bestSamples: state.modeRun.bestGhost?.length ?? 0,
    },
    battle: {
      team: player.team ?? "",
      health: Math.round(player.battleHealth ?? BATTLE_RULES.maxHealth),
      ammo: Math.round(player.battleAmmo ?? 0),
      score: {
        blue: state.modeRun.battle.blueScore,
        red: state.modeRun.battle.redScore,
      },
      targetScore: BATTLE_RULES.targetScore,
      laserCooldown: Number(
        Math.max(0, player.battleLaserCooldown ?? 0).toFixed(2),
      ),
      reloadTimer: Number(
        Math.max(0, player.battleReloadTimer ?? 0).toFixed(2),
      ),
      shield: Number(Math.max(0, player.battleShieldTimer ?? 0).toFixed(2)),
      flags: battleFlags.map((flag) => ({
        team: flag.team,
        carrier:
          flag.carrier === player
            ? "player"
            : flag.carrier
              ? (flag.carrier.role ?? flag.carrier.team)
              : "",
        x: Number(flag.group.position.x.toFixed(2)),
        z: Number(flag.group.position.z.toFixed(2)),
      })),
      lastLaserHit: state.modeRun.battle.lastLaserHit,
      lastLaserBlocked: Boolean(state.modeRun.battle.lastLaserBlocked),
      coverBlocksLasers: obstacles.filter(
        (obstacle) => obstacle.blocksLasers !== false,
      ).length,
    },
    bowling: {
      frame: state.modeRun.bowling.frame,
      roll: state.modeRun.bowling.roll,
      pinsStanding: state.modeRun.bowling.pinsStanding,
      score: state.modeRun.bowling.totalScore,
      countdown: Number(state.modeRun.bowling.countdown.toFixed(2)),
      rolling: state.modeRun.bowling.rolling,
      rolls: state.modeRun.bowling.rolls,
    },
    stunt: {
      trick: state.modeRun.stunt.trick,
      combo: Number(state.modeRun.stunt.combo.toFixed(2)),
      rings: state.modeRun.stunt.rings,
      loopActive: state.modeRun.stunt.loopActive,
      barrelRolls: state.modeRun.stunt.barrelRolls,
    },
    lava: {
      height: Number(state.modeRun.lava.height.toFixed(2)),
      safeZoneIndex: state.modeRun.lava.safeZoneIndex,
      platformHeight: Number(state.modeRun.lava.platformHeight.toFixed(2)),
    },
    battlePickups: battlePickups.map((pickup) => ({
      id: pickup.id,
      label: pickup.label,
      ready: pickup.cooldown <= 0,
    })),
    hunterTagState: {
      state: state.modeRun.tagState,
      cooldown: Number(state.modeRun.tagCooldown.toFixed(2)),
      taggedBotIndex: state.modeRun.taggedBotIndex,
    },
    bossPhase: state.modeRun.bossPhase,
    camera: {
      distance: Number(state.cameraTelemetry.distance.toFixed(2)),
      height: Number(state.cameraTelemetry.height.toFixed(2)),
      lookAhead: Number(state.cameraTelemetry.lookAhead.toFixed(2)),
      ballCam: Boolean(state.cameraTelemetry.ballCam),
      cockpit: Boolean(state.cameraTelemetry.cockpit),
      scope: Boolean(state.cameraTelemetry.scope),
      battleCockpitEnabled: Boolean(settings.battleCockpitCamera),
    },
    device: {
      profile: state.deviceProfile.type,
      mode: state.deviceProfile.mode,
      touchEnabled: Boolean(input.touchEnabled),
      touchAvailable: Boolean(state.deviceProfile.touchAvailable),
      layoutClass: TOUCH_LAYOUT_OPTIONS[settings.touchLayout]?.className ?? "",
      compactHud: Boolean(state.deviceProfile.compactHud),
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
      health: Math.round(bot.battleHealth ?? bot.maxHealth ?? 0),
      ammo: Math.round(bot.battleAmmo ?? 0),
      demolished: Boolean(bot.demolished),
    })),
    humanPlayers: [...remotePlayers.values()].map((remote) => ({
      id: remote.id,
      username: remote.username,
      team: remote.team,
      x: Number(remote.car.position.x.toFixed(2)),
      y: Number(remote.car.position.y.toFixed(2)),
      z: Number(remote.car.position.z.toFixed(2)),
      nameTagVisible: !remote.tag.hidden,
    })),
    stats: isMaxMode()
      ? {
          difficulty: settings.maxDifficulty,
          arena: {
            scale: Number(dims.scale.toFixed(2)),
            halfWidth: dims.halfWidth,
            halfLength: dims.halfLength,
          },
          player: player.matchStats,
          latest: maxMode.stats?.events?.[0] ?? null,
          adaptiveMemory: maxMode.riskMemory,
        }
      : {
          hunterAi: getCampaignAiDisplayLabel(),
          adaptiveHunters: state.campaignRisk,
        },
    progression: {
      saveKey: "infernoDrift4.localSave",
      worldIndex: state.worldIndex,
      levelIndex: state.levelIndex,
      world: getWorld().name,
      level: getLevel().name,
      levelNumber: state.progressionV2.level,
      xp: state.progressionV2.xp,
      totalXp: getProgressionTotalXp(),
      medals: state.progressionV2.medals,
      personalBests: state.progressionV2.personalBests,
      daily: state.progressionV2.daily,
      weekly: state.progressionV2.weekly,
      dailyGift: getDailyGiftSnapshot(),
      dailyGiftNoticeVisible: Boolean(
        dailyGiftNotice && !dailyGiftNotice.hidden,
      ),
      rewardLog: state.progressionV2.rewardLog.slice(-6),
    },
    online: {
      status: onlineState.status,
      configured: Boolean(onlineState.backendUrl),
      backendUrl: onlineState.backendUrl,
      feedbackConfigured: Boolean(
        onlineState.feedbackUrl ||
        (!onlineState.backendDefaulted &&
          deriveFeedbackUrl(onlineState.backendUrl)),
      ),
      feedbackStatus: onlineState.lastFeedbackStatus,
      feedback: {
        popupVisible: Boolean(feedbackModal?.classList.contains("show")),
        submitStatus: onlineState.lastFeedbackStatus,
        delivery: onlineState.lastFeedbackDelivery,
        emailConfigured: Boolean(onlineState.feedbackEmailConfigured),
        lastError: onlineState.lastFeedbackError,
      },
      profile: {
        tabVisible: Boolean(
          document.getElementById("tab-profile")?.classList.contains("active"),
        ),
        snapshot: onlineState.profileSnapshot,
        actionStatus: onlineState.profileActionStatus,
        deleteStatus: onlineState.profileDeleteStatus,
        saveSyncedAt: onlineState.saveSyncedAt,
        lastProgressSyncAt: onlineState.lastProgressSyncAt,
        nextProgressSyncInMs: Math.max(
          0,
          Math.round(onlineState.nextProgressSyncAt - performance.now()),
        ),
        leaderboardSyncedAt: onlineState.leaderboardSyncedAt,
        restrictedUntil: onlineState.onlineRestrictedUntil,
      },
      authenticated: Boolean(onlineState.user),
      profileMode: onlineState.profileMode,
      guestTemporary: Boolean(onlineState.guestTemporary),
      accountStatus: onlineState.accountStatus,
      username: onlineState.user?.username || onlineState.username,
      badge: onlineState.user?.badge || "",
      moderator: isCurrentOnlineModerator(),
      moderation: {
        lastStatus: onlineState.lastModerationStatus,
      },
      ageGate: {
        age: onlineState.age,
        freeChat13Plus: canUseOnlineFreeChat(),
        under13QuickChatOnly: !canUseOnlineFreeChat(),
      },
      chat: {
        popoutOpen: onlineState.chatOpen,
        quickChatAvailable: true,
        freeChatAvailable: canUseOnlineFreeChat(),
        messageCount: onlineState.chatMessages.length,
        historyWindowMs: 30 * 60 * 1000,
        noticeVisible: Boolean(chatNotice && !chatNotice.hidden),
        lastMessage: onlineState.chatMessages.at(-1) ?? null,
      },
      queue: onlineState.queue
        ? {
            playlist: onlineState.queue.playlist,
            teamSize: onlineState.queue.teamSize,
            botFill: onlineState.queue.botFill,
          }
        : null,
      room: onlineState.room
        ? {
            id: onlineState.room.id,
            code: onlineState.room.code,
            modeId: onlineState.room.mode || "",
            modeLabel: getModeDefinition(onlineState.room.mode).label,
            playlist: onlineState.room.playlist,
            host: onlineState.room.host || onlineState.room.hostUserId || "",
            shared: Boolean(onlineState.roomShared),
            sharedBy: onlineState.room.sharedBy || [],
            routingId: onlineState.room.routingId || onlineState.room.id,
            size: onlineState.room.size,
            members: onlineState.room.players || [],
            players: onlineState.room.players?.length ?? 0,
            bots: onlineState.room.bots ?? 0,
          }
        : null,
      leaderboard: displayLeaderboard.slice(0, 10),
      leaderboardState: {
        playerRow: onlineState.leaderboardPlayerRow,
        currentPlayerPresent: currentPlayerPresentOnLeaderboard,
        allXpAccountsLoaded: onlineState.leaderboardSyncStatus === "server",
        syncStatus: onlineState.leaderboardSyncStatus,
        rowSource:
          onlineState.leaderboardPlayerRow?.source ||
          (currentPlayerPresentOnLeaderboard ? "server" : "pending-local"),
      },
      friends: onlineState.friends,
      friendRequests: {
        incomingRequests: onlineState.incomingFriendRequests,
        outgoingRequests: onlineState.outgoingFriendRequests,
      },
      recentPlayers: onlineState.recentPlayers.slice(0, 8),
      remotePlayers: remotePlayerSnapshots,
      reconnect: {
        attempts: onlineState.reconnectAttempts,
        pendingMessages: onlineState.pending.length,
      },
      lastError: onlineState.lastError,
      note: onlineState.backendUrl
        ? "Static client keeps offline play stable and uses configured backend for online rooms."
        : "Static client is playable offline; live rooms require a configured backend URL.",
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
  setRemoteHumanPlayers: (players = []) => {
    setRemoteHumanPlayers(Array.isArray(players) ? players : []);
    return [...remotePlayers.values()].map((remote) => ({
      id: remote.id,
      username: remote.username,
      team: remote.team,
    }));
  },
  getRemoteNameTags: () =>
    [...remotePlayers.values()].map((remote) => ({
      id: remote.id,
      username: remote.username,
      team: remote.team,
      hidden: remote.tag.hidden,
      text: remote.tag.textContent ?? "",
      opacity: remote.tag.style.opacity || "",
      screen: remote.screen ?? null,
    })),
  setDeviceMode: (mode = "auto") => {
    settings.deviceMode =
      DEVICE_PROFILES[mode] || mode === "auto" ? mode : "auto";
    state.deviceInputMode =
      settings.deviceMode === "auto"
        ? "auto"
        : settings.deviceMode === "desktop"
          ? "desktop"
          : "touch";
    applyDeviceProfile();
    return { ...state.deviceProfile };
  },
  openMenuTab: (tabName = "games") => {
    setMenuOpen(true, tabName);
    return {
      screen: getUiScreen(),
      tab: document.querySelector(".tab-btn.active")?.dataset.tab ?? "",
    };
  },
  selectLoadout: (loadoutId = GARAGE_LOADOUT_IDS[0]) => {
    selectGarageLoadout(loadoutId, { save: false });
    return serializeGarageState();
  },
  getGaragePreviewState: () => ({
    ready: garageState.preview.ready,
    yaw: garageState.preview.yaw,
    zoom: garageState.preview.zoom,
    frame: garageState.preview.frame,
    hasCanvas: Boolean(garagePreviewHost?.querySelector("canvas")),
  }),
  setTouchLayout: (layout = "classic", scale = settings.touchScale) => {
    settings.touchLayout = TOUCH_LAYOUT_OPTIONS[layout] ? layout : "classic";
    settings.touchScale = THREE.MathUtils.clamp(Number(scale) || 1, 0.86, 1.14);
    applyDeviceProfile();
    return { layout: settings.touchLayout, scale: settings.touchScale };
  },
  setControlBinding: (actionId, code) => setPrimaryBinding(actionId, code),
  openModeHelp: () => {
    openModeHelp();
    const help = getModeHelp();
    return {
      visible: state.modeHelpOpen,
      title: help.title,
      objective: help.objective,
    };
  },
  fireBattleLaser: () => fireBattleLaser(player),
  setBattleAmmo: (value = BATTLE_RULES.maxAmmo) => {
    player.battleAmmo = THREE.MathUtils.clamp(
      Number(value) || 0,
      0,
      BATTLE_RULES.maxAmmo,
    );
    updateBattleStateFromPlayer();
    return player.battleAmmo;
  },
  setBattleCockpitCamera: (enabled = true) => {
    settings.battleCockpitCamera = Boolean(enabled);
    if (battleCockpitToggle)
      battleCockpitToggle.checked = settings.battleCockpitCamera;
    return settings.battleCockpitCamera;
  },
  setBattleActorPose: (
    actor = "player",
    {
      x = 0,
      z = 0,
      heading = 0,
      health = BATTLE_RULES.maxHealth,
      speed = 0,
      vx = null,
      vz = null,
    } = {},
  ) => {
    const target =
      actor === "player"
        ? player
        : (bots.find((bot) => bot.team === actor || bot.role === actor) ??
          bots[0]);
    if (!target) return false;
    target.setPosition(Number(x) || 0, 0, Number(z) || 0);
    target.heading = Number(heading) || 0;
    target.moveHeading = target.heading;
    target.speed = Number(speed) || 0;
    target.velocity.set(
      Number.isFinite(Number(vx))
        ? Number(vx)
        : Math.sin(target.moveHeading) * target.speed,
      0,
      Number.isFinite(Number(vz))
        ? Number(vz)
        : Math.cos(target.moveHeading) * target.speed,
    );
    if (Number.isFinite(Number(health))) target.battleHealth = Number(health);
    target.setHealthBar(
      (target.battleHealth ?? BATTLE_RULES.maxHealth) / BATTLE_RULES.maxHealth,
      target !== player,
    );
    updateBattleStateFromPlayer();
    return true;
  },
  getBattleArenaDebug: () => ({
    coverBlocksLasers: obstacles.filter(
      (obstacle) => obstacle.blocksLasers !== false,
    ).length,
    solidCover: obstacles.map((obstacle) => ({
      x: Number(obstacle.mesh.position.x.toFixed(2)),
      z: Number(obstacle.mesh.position.z.toFixed(2)),
      width: Number(obstacle.size.x.toFixed(2)),
      depth: Number(obstacle.size.z.toFixed(2)),
      standable: Boolean(obstacle.standable),
      blocksLasers: obstacle.blocksLasers !== false,
    })),
    lastLaserBlocked: Boolean(state.modeRun.battle.lastLaserBlocked),
    cockpitEnabled: Boolean(settings.battleCockpitCamera),
    cockpitActive: Boolean(state.cameraTelemetry.cockpit),
    scopeActive: Boolean(state.cameraTelemetry.scope),
  }),
  getBowlingState: () => structuredClone(state.modeRun.bowling),
  forceBowlingRollComplete: (pins = 0) =>
    structuredClone(completeBowlingRoll(Number(pins) || 0)),
  getTrackState: () => ({
    path: state.modeRun.trackPath,
    width: state.modeRun.trackWidth,
    bounded: state.modeRun.trackBounded,
    lap: state.modeRun.raceLap,
    checkpoint: state.modeRun.markerIndex,
    rivals: bots.filter((bot) => String(bot.role).startsWith("rival")).length,
  }),
  getLavaState: () => structuredClone(state.modeRun.lava),
  getStuntState: () => structuredClone(state.modeRun.stunt),
  getModeCatalog: () =>
    MODE_CATALOG.map((mode) => ({ ...mode, id: getPublicModeId(mode) })),
  selectMode: (modeId) => {
    setActiveGameMode(modeId, { save: false, reset: false });
    const mode = getModeDefinition();
    return { ...mode, id: getPublicModeId(mode) };
  },
  startMode: (modeId) => {
    setActiveGameMode(modeId, { save: false, reset: false });
    startRun(true);
    const mode = getModeDefinition();
    return { ...mode, id: getPublicModeId(mode) };
  },
  completeModeObjective: () => {
    if (isMaxMode()) scoreMaxGoal("blue");
    else if (isCampaignSurvivalMode()) completeLevel();
    else completeModeRun();
    return {
      mode: getPublicModeId(),
      progression: state.progressionV2,
      screen: getUiScreen(),
    };
  },
  failModeObjective: (reason = "Test fail") => {
    failModeRun(reason);
    return {
      mode: getPublicModeId(),
      progression: state.progressionV2,
      screen: getUiScreen(),
    };
  },
  getProgressionSnapshot: () => structuredClone(state.progressionV2),
  getDailyGiftState: () => getDailyGiftSnapshot(),
  redeemDailyGift: () => redeemDailyGift(),
  resetLocalProgressionForTest: () => {
    state.progressionV2 = createProgressionV2();
    savePersistentState();
    renderDailyGiftNotice();
    renderProgressPanel();
    refreshGamesUi();
    return structuredClone(state.progressionV2);
  },
  configureOnlineForTest: ({
    backendUrl = "",
    username = "SmokeHost",
    age = 13,
  } = {}) => {
    onlineState.backendUrl = normalizeOnlineBackendUrl(backendUrl);
    onlineState.username = sanitizeRemoteUsername(username);
    onlineState.age = Number.isFinite(Number(age)) ? Number(age) : null;
    if (onlineBackendUrlInput)
      onlineBackendUrlInput.value = onlineState.backendUrl;
    if (onlineUsernameInput) onlineUsernameInput.value = onlineState.username;
    if (onlineAgeInput)
      onlineAgeInput.value =
        onlineState.age === null ? "" : String(onlineState.age);
    saveOnlineConfig();
    updateOnlineUi();
    return {
      backendUrl: onlineState.backendUrl,
      username: onlineState.username,
      age: onlineState.age,
    };
  },
  setExitLinkUrl: (url = EXIT_LINK_DEFAULT_URL) => {
    settings.exitLinkUrl = normalizeExitLinkUrl(url);
    if (exitLinkUrlInput) exitLinkUrlInput.value = settings.exitLinkUrl;
    savePersistentState();
    return settings.exitLinkUrl;
  },
  getExitLinkUrl: () => settings.exitLinkUrl,
  getSchoolGateStatus: (iso = "") =>
    getSchoolGateStatus(iso ? new Date(iso) : new Date()),
  forceSchoolGateAt: (iso = "") => evaluateSchoolGate(new Date(iso)),
  dismissSchoolGateForTest: () => {
    continuePastSchoolGate();
    return { ...state.schoolGate };
  },
  forceOnlineProgressSync: () => forceOnlineProgressSync({ force: true }),
  sampleDailyGiftRolls: (count = 1000) =>
    Array.from(
      { length: Math.max(0, Math.min(5000, Number(count) || 0)) },
      () => rollDailyGiftAmount(),
    ),
  getOnlineState: () => ({
    status: onlineState.status,
    configured: Boolean(onlineState.backendUrl),
    authenticated: Boolean(onlineState.user),
    username: onlineState.user?.username || onlineState.username,
    badge: onlineState.user?.badge || "",
    moderator: isCurrentOnlineModerator(),
    age: onlineState.age,
    freeChat13Plus: canUseOnlineFreeChat(),
    room: onlineState.room,
    queue: onlineState.queue,
    chatMessages: onlineState.chatMessages,
    leaderboard: onlineState.leaderboard,
    friends: onlineState.friends,
    recentPlayers: onlineState.recentPlayers,
    chatOpen: onlineState.chatOpen,
    feedbackStatus: onlineState.lastFeedbackStatus,
    lastError: onlineState.lastError,
  }),
  sendModerationAction: (action = "kick", target = {}) =>
    sendModerationAction(action, target),
};

loadOnlineConfig();
loadPersistentState();
ensureDailyGiftState(state.progressionV2);
if (!MAX_DIFFICULTY_PROFILES[settings.maxDifficulty])
  settings.maxDifficulty = MAX_DIFFICULTY_CLASSIC;
createFxPool();
initTouchControls();
difficultySelect.value = settings.difficulty;
if (campaignAiSelect) campaignAiSelect.value = settings.campaignAiMode;
if (maxDifficultySelect) maxDifficultySelect.value = settings.maxDifficulty;
invertToggle.checked = settings.invertSteer;
cameraToggle.checked = settings.cameraFocus;
if (battleCockpitToggle)
  battleCockpitToggle.checked = settings.battleCockpitCamera;
if (rampDensitySelect) rampDensitySelect.value = settings.rampDensity;
if (devModeToggle) devModeToggle.checked = settings.devMode;
if (touchLayoutSelect) touchLayoutSelect.value = settings.touchLayout;
if (touchScaleSelect) touchScaleSelect.value = String(settings.touchScale);
if (exitLinkUrlInput) exitLinkUrlInput.value = settings.exitLinkUrl;
applyDeviceProfile();
refreshDevModeUi();
refreshGamesUi();
renderControlsUi();
renderDailyGiftNotice();
renderProgressPanel();
updateOnlineUi();
applyPlayerCustomization({ progress: getProgressSnapshot() });
resetLevel();
updateHud();
evaluateSchoolGate();
requestAnimationFrame(animate);
