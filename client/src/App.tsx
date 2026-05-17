import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import {
  CAR_CLASSES,
  MODE_META,
  type GameState,
  type InputFrame,
  type ModeId,
  awardFounderBadge,
  cloneGameState,
  createInitialGameState,
  createRadar,
  migrateSave,
  startGame,
  stepGame,
} from "../../packages/game-core/src";
import {
  QUICK_CHAT,
  canUseFreeChat,
  normalizeUsername,
  sanitizeDisplayText,
} from "../../packages/protocol/src";
import { GameCanvas } from "./game/GameCanvas";
import { GaragePreview } from "./game/GaragePreview";

type PrimaryTab =
  | "play"
  | "garage"
  | "progress"
  | "online"
  | "settings"
  | "howto";

const MODE_GROUPS: Array<{ id: ModeId; tag: string }> = [
  { id: "tutorial", tag: "first run" },
  { id: "campaign", tag: "survival" },
  { id: "max", tag: "arena" },
  { id: "race", tag: "speed" },
  { id: "time-trial", tag: "ghost" },
  { id: "stunt", tag: "air" },
  { id: "hunter", tag: "threat" },
  { id: "boss", tag: "finale" },
  { id: "drift-score", tag: "combo" },
  { id: "battle", tag: "combat" },
  { id: "ramp-rush", tag: "mini" },
  { id: "boost-bowling", tag: "mini" },
  { id: "lava-floor", tag: "mini" },
  { id: "king-zone", tag: "mini" },
  { id: "trick-combo", tag: "mini" },
  { id: "bot-escape", tag: "mini" },
];

const DEFAULT_INPUT: InputFrame = {
  throttle: 0,
  steer: 0,
  drift: false,
  boost: false,
  jump: false,
  backflip: false,
};

interface OnlineState {
  status: "offline" | "connecting" | "live" | "error";
  serverUrl: string;
  username: string;
  age: number | null;
  roomCode: string | null;
  players: string[];
  chat: Array<{ from: string; text: string; quick?: boolean }>;
  freeChatEnabled: boolean;
  leaderboard: Array<{ username: string; rating: number }>;
  error: string | null;
}

declare global {
  interface Window {
    render_game_to_text?: () => string;
    advanceTime?: (ms: number) => void;
    __infernodriftTestApi?: Record<string, unknown>;
    INFERNO_SERVER_URL?: string;
  }
}

function loadInitialState(): GameState {
  try {
    const raw = localStorage.getItem("infernodrift4.react.save");
    if (!raw) return createInitialGameState("tutorial");
    const migrated = migrateSave(JSON.parse(raw));
    const state = createInitialGameState("tutorial");
    state.progression = migrated.progression;
    return state;
  } catch {
    return createInitialGameState("tutorial");
  }
}

export function App() {
  const [game, setGame] = useState<GameState>(() => loadInitialState());
  const gameRef = useRef(game);
  const [tab, setTab] = useState<PrimaryTab>("play");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<ModeId>("tutorial");
  const [deviceMode, setDeviceMode] = useState<
    "auto" | "desktop" | "tablet" | "phone"
  >("auto");
  const [devMode, setDevMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [cameraShake, setCameraShake] = useState(0.7);
  const [sfxVolume, setSfxVolume] = useState(0.55);
  const [musicVolume, setMusicVolume] = useState(0.35);
  const [touchKnob, setTouchKnob] = useState({ x: 0, y: 0, active: false });
  const [carClass, setCarClass] =
    useState<keyof typeof CAR_CLASSES>("balanced");
  const [paint, setPaint] = useState("#ff4a1f");
  const [accent, setAccent] = useState("#35e8ff");
  const [online, setOnline] = useState<OnlineState>(() => ({
    status: "offline",
    serverUrl:
      window.INFERNO_SERVER_URL ||
      localStorage.getItem("infernoDrift4.serverUrl") ||
      "",
    username: localStorage.getItem("infernoDrift4.username") || "Drifter",
    age: null,
    roomCode: null,
    players: [],
    chat: [],
    freeChatEnabled: false,
    leaderboard: [
      { username: "Clark", rating: 1600 },
      { username: "Ghost Apex", rating: 1480 },
      { username: "Neon Rookie", rating: 1000 },
    ],
    error: null,
  }));
  const wsRef = useRef<WebSocket | null>(null);
  const inputRef = useRef<InputFrame>({ ...DEFAULT_INPUT });
  const touchRef = useRef<InputFrame>({ ...DEFAULT_INPUT });
  const keysRef = useRef(new Set<string>());

  const readInputFrame = useCallback((): InputFrame => {
    const keys = keysRef.current;
    const frame: InputFrame = {
      throttle:
        keys.has("KeyW") || keys.has("ArrowUp")
          ? 1
          : keys.has("KeyS") || keys.has("ArrowDown")
            ? -0.55
            : touchRef.current.throttle,
      steer:
        (keys.has("KeyD") || keys.has("ArrowRight") ? 1 : 0) +
          (keys.has("KeyA") || keys.has("ArrowLeft") ? -1 : 0) ||
        touchRef.current.steer,
      drift: keys.has("Space") || touchRef.current.drift,
      boost:
        keys.has("ShiftLeft") ||
        keys.has("ShiftRight") ||
        touchRef.current.boost,
      jump: keys.has("KeyX") || touchRef.current.jump,
      backflip: keys.has("KeyC") || touchRef.current.backflip,
    };
    const pad = navigator.getGamepads?.()[0];
    if (pad) {
      frame.steer =
        Math.abs(pad.axes[0] ?? 0) > 0.14 ? (pad.axes[0] ?? 0) : frame.steer;
      frame.throttle =
        pad.buttons[7]?.pressed || pad.buttons[0]?.pressed
          ? 1
          : pad.buttons[6]?.pressed
            ? -0.55
            : frame.throttle;
      frame.drift = frame.drift || Boolean(pad.buttons[1]?.pressed);
      frame.boost = frame.boost || Boolean(pad.buttons[2]?.pressed);
      frame.jump = frame.jump || Boolean(pad.buttons[3]?.pressed);
    }
    inputRef.current = frame;
    return frame;
  }, []);

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  const commitGame = useCallback((next: GameState) => {
    gameRef.current = next;
    setGame(cloneGameState(next));
  }, []);

  const beginMode = useCallback(
    (mode: ModeId = selectedMode) => {
      const next = startGame(gameRef.current, mode);
      next.player.classId = carClass;
      next.machine = "playing";
      setSelectedMode(mode);
      setMenuOpen(false);
      commitGame(next);
    },
    [carClass, commitGame, selectedMode],
  );

  const showMenu = useCallback(
    (nextTab: PrimaryTab = tab) => {
      const next = cloneGameState(gameRef.current);
      next.machine = next.machine === "playing" ? "paused" : next.machine;
      commitGame(next);
      setTab(nextTab);
      setMenuOpen(true);
    },
    [commitGame, tab],
  );

  const closeMenu = useCallback(() => {
    const next = cloneGameState(gameRef.current);
    if (next.machine === "paused") next.machine = "playing";
    commitGame(next);
    setMenuOpen(false);
  }, [commitGame]);

  const serializeState = useCallback(() => {
    const state = gameRef.current;
    return JSON.stringify({
      mode: state.baseMode,
      id4Mode: state.mode,
      machine: state.machine,
      objective: state.objective.help,
      running: state.machine === "playing",
      player: {
        x: Number(state.player.x.toFixed(1)),
        y: Number(state.player.y.toFixed(1)),
        z: Number(state.player.z.toFixed(1)),
        speed_mph: Math.round(Math.abs(state.player.speed) * 0.78),
        boost: Number(state.player.boost.toFixed(2)),
        shield: Number(state.player.shield.toFixed(2)),
        classId: state.player.classId,
      },
      objectiveState: state.objective,
      radar: {
        coordinateSystem:
          "player-relative radar: top/front, right/car-right, left/car-left, bottom/rear",
        entities: state.radar,
      },
      online: {
        status: online.status,
        connected: online.status === "live",
        roomCode: online.roomCode,
        players: online.players.length,
        chat13Plus: online.freeChatEnabled,
      },
      bots: state.bots.map((bot) => ({
        role: bot.role,
        team: bot.team,
        personality: bot.personality,
        x: Number(bot.x.toFixed(1)),
        z: Number(bot.z.toFixed(1)),
      })),
      ball: state.ball,
      stats: {
        player: {
          demolitions: state.stats.demolitions,
          shots: state.stats.shots,
          nearMisses: Number(state.stats.nearMisses.toFixed(1)),
          landings: state.stats.landings,
        },
        teams: {
          blue: { goals: state.stats.goalsBlue },
          red: { goals: state.stats.goalsRed },
        },
      },
      progression: state.progression,
      device: {
        mode: deviceMode,
        type: resolveDeviceType(deviceMode),
        touchActive: deviceMode === "phone" || deviceMode === "tablet",
      },
      ui: { tab, menuOpen },
    });
  }, [deviceMode, menuOpen, online, tab]);

  useEffect(() => {
    window.render_game_to_text = serializeState;
    window.advanceTime = (ms: number) => {
      const frames = Math.max(1, Math.round(ms / (1000 / 60)));
      const next = gameRef.current;
      for (let i = 0; i < frames; i += 1)
        stepGame(next, readInputFrame(), 1 / 60);
      commitGame(next);
    };
    window.__infernodriftTestApi = {
      forceMaxGoal: (team = "blue") => {
        const next = gameRef.current;
        if (team === "blue") next.stats.goalsBlue += 1;
        else next.stats.goalsRed += 1;
        next.objective.progress += 1;
        next.replay = { active: true, meta: `${team} goal`, timer: 1.8 };
        next.machine = "replay";
        commitGame(next);
        return next.stats;
      },
      forceDemo: () => {
        const next = gameRef.current;
        next.stats.demolitions += 1;
        next.score += 150;
        commitGame(next);
        return next.stats.demolitions;
      },
      getReplayState: () => gameRef.current.replay,
      getMatchStats: () => ({
        teams: {
          blue: { goals: gameRef.current.stats.goalsBlue },
          red: { goals: gameRef.current.stats.goalsRed },
        },
        player: {
          demolitions: gameRef.current.stats.demolitions,
          shots: gameRef.current.stats.shots,
        },
      }),
      setDeviceMode: (mode: typeof deviceMode) => {
        setDeviceMode(mode);
        return mode;
      },
      selectMode: (mode: ModeId) => {
        setSelectedMode(mode);
        beginMode(mode);
      },
    };
  }, [beginMode, commitGame, readInputFrame, serializeState]);

  useEffect(() => {
    const save = {
      schemaVersion: 2,
      progression: game.progression,
      settings: {
        reducedMotion,
        cameraShake,
        sfxVolume,
        musicVolume,
        carClass,
        paint,
        accent,
      },
    };
    localStorage.setItem("infernodrift4.react.save", JSON.stringify(save));
  }, [
    accent,
    cameraShake,
    carClass,
    game.progression,
    musicVolume,
    paint,
    reducedMotion,
    sfxVolume,
  ]);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      keysRef.current.add(event.code);
      if (event.code === "Escape" || event.code === "KeyM") {
        event.preventDefault();
        if (menuOpen) closeMenu();
        else showMenu("play");
      }
      if (event.code === "KeyR") beginMode(selectedMode);
    };
    const up = (event: KeyboardEvent) => keysRef.current.delete(event.code);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [beginMode, closeMenu, menuOpen, selectedMode, showMenu]);

  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const input = readInputFrame();
      const next = gameRef.current;
      stepGame(next, input, dt);
      if (next.machine === "playing" || next.machine === "replay")
        setGame(cloneGameState(next));
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [readInputFrame]);

  const connectOnline = useCallback(() => {
    if (!online.serverUrl) {
      setOnline((prev) => ({
        ...prev,
        error: "Set a local or Cloudflare WebSocket URL first.",
      }));
      return;
    }
    try {
      wsRef.current?.close();
      const url = normalizeWsUrl(online.serverUrl);
      const ws = new WebSocket(url);
      wsRef.current = ws;
      setOnline((prev) => ({
        ...prev,
        status: "connecting",
        error: null,
        serverUrl: url,
      }));
      ws.addEventListener("open", () => {
        localStorage.setItem("infernoDrift4.serverUrl", url);
        localStorage.setItem("infernoDrift4.username", online.username);
        ws.send(
          JSON.stringify({
            type: "auth.guest",
            version: 1,
            username: normalizeUsername(online.username),
            age: online.age ?? undefined,
          }),
        );
      });
      ws.addEventListener("message", (event) => {
        const msg = JSON.parse(String(event.data));
        setOnline((prev) => handleOnlineMessage(prev, msg));
      });
      ws.addEventListener("close", () =>
        setOnline((prev) => ({ ...prev, status: "offline", roomCode: null })),
      );
      ws.addEventListener("error", () =>
        setOnline((prev) => ({
          ...prev,
          status: "error",
          error: "Backend connection failed.",
        })),
      );
    } catch {
      setOnline((prev) => ({
        ...prev,
        status: "error",
        error: "Invalid backend URL.",
      }));
    }
  }, [online.age, online.serverUrl, online.username]);

  const sendOnline = useCallback((payload: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
      return true;
    }
    setOnline((prev) => ({
      ...prev,
      error: "Backend offline - local bot mode remains playable.",
    }));
    return false;
  }, []);

  const updateTouchSteer = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const bounds = event.currentTarget.getBoundingClientRect();
      const radius = Math.max(1, Math.min(bounds.width, bounds.height) / 2);
      const dx = event.clientX - (bounds.left + bounds.width / 2);
      const dy = event.clientY - (bounds.top + bounds.height / 2);
      const distance = Math.hypot(dx, dy);
      const scale = distance > radius ? radius / distance : 1;
      const x = dx * scale;
      const y = dy * scale;
      touchRef.current.steer = clamp(x / radius, -1, 1);
      touchRef.current.throttle = clamp(-y / radius, -0.65, 1);
      setTouchKnob({ x, y, active: true });
    },
    [],
  );

  const resetTouchSteer = useCallback(() => {
    touchRef.current.steer = 0;
    touchRef.current.throttle = 0;
    setTouchKnob({ x: 0, y: 0, active: false });
  }, []);

  const activeMeta = MODE_META[selectedMode];
  const hudWorld =
    game.baseMode === "infernodriftmax1"
      ? `${game.stats.goalsBlue}-${game.stats.goalsRed}`
      : game.world;
  const hudLevel =
    game.baseMode === "infernodriftmax1"
      ? activeMeta.label
      : `${activeMeta.label}`;
  const freeChatLocked = !online.freeChatEnabled;
  const objectivePercent = Math.round(
    clamp(
      (game.objective.progress / Math.max(1, game.objective.target)) * 100,
      0,
      100,
    ),
  );
  const currentMedal = game.progression.medals[selectedMode] ?? "Unranked";
  const carSpec = CAR_CLASSES[carClass];
  const speedPercent = Math.round(
    clamp((carSpec.maxSpeed / 160) * 100, 12, 100),
  );
  const driftPercent = Math.round(clamp(carSpec.drift * 74, 12, 100));
  const airPercent = Math.round(clamp(carSpec.air * 70, 12, 100));
  const modeFamily =
    activeMeta.baseMode === "infernodriftmax1"
      ? "Max circuit"
      : "InfernoDrift4 circuit";
  const menuStatus =
    game.machine === "paused"
      ? "Paused"
      : game.machine === "playing"
        ? "Live run"
        : game.machine === "results"
          ? "Results"
          : "Ready";

  return (
    <div
      className={`app-shell device-${resolveDeviceType(deviceMode)} ${reducedMotion ? "reduced-motion" : ""}`}
    >
      <GameCanvas game={game} paint={paint} accent={accent} />

      <div className="hud" aria-label="Gameplay status">
        <div className="hud-cluster hud-objective">
          <div className="pill hud-mode-pill">
            <span className="label">Mode</span>
            <strong id="hud-level">{hudLevel}</strong>
            <small id="hud-world">{hudWorld}</small>
          </div>
          <div className="pill">
            <span className="label">Time</span>
            <strong id="hud-time">{formatTime(game.timeRemaining)}</strong>
          </div>
          <div className="pill">
            <span className="label">Score</span>
            <strong id="hud-score">{Math.round(game.score)}</strong>
          </div>
          <div className="pill hud-objective-meter">
            <span className="label">Objective</span>
            <strong>{objectivePercent}%</strong>
            <div className="bar tiny">
              <span style={{ width: `${objectivePercent}%` }} />
            </div>
          </div>
        </div>
        <div className="hud-cluster hud-vehicle">
          <div className="pill">
            <span className="label">Speed</span>
            <strong id="hud-speed">
              {Math.round(Math.abs(game.player.speed) * 0.78)} MPH
            </strong>
          </div>
          <div className="pill lives-pill">
            <span className="label">Lives</span>
            <div id="hud-hearts" className="hearts" aria-label="Lives">
              {Array.from({ length: 5 }, (_, index) => (
                <span
                  key={index}
                  className={index >= game.player.lives ? "off" : ""}
                />
              ))}
            </div>
            <strong id="hud-lives" className="lives-count">
              {game.player.lives}/5
            </strong>
          </div>
          <div className="pill">
            <span className="label">Drift</span>
            <strong id="hud-combo">x{game.combo.toFixed(1)}</strong>
          </div>
          <button
            className="pill menu-btn"
            id="menu-btn"
            type="button"
            onClick={() => showMenu("play")}
          >
            Cockpit
          </button>
        </div>
      </div>

      <div className="status" aria-hidden="true">
        <div className="pill">
          <div className="label">Boost Reserve</div>
          <div className="bar">
            <span style={{ width: `${game.player.boost * 100}%` }} />
          </div>
        </div>
        <div className="pill">
          <div className="label">Shield Cell</div>
          <div className="bar shield">
            <span style={{ width: `${game.player.shield * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="radar-panel">
        <div className="minimap-title">
          <span>Forward Radar</span>
          <b>{game.radar.length}</b>
        </div>
        <Radar entities={game.radar} />
      </div>

      <div
        id="match-panel"
        className={`match-panel ${game.replay.active ? "show" : ""}`}
        aria-hidden={!game.replay.active}
      >
        <span id="match-panel-meta">
          {game.replay.active
            ? `Replay: ${game.replay.meta}`
            : `${MODE_META[game.mode].label} ready`}
        </span>
      </div>

      <div className="transient-stack" aria-live="polite">
        {game.player.lastLanding && (
          <div className="toast">Landing: {game.player.lastLanding}</div>
        )}
        {game.player.nearMissTimer > 0 && (
          <div className="toast danger">Near miss + boost</div>
        )}
        {game.replay.active && (
          <div className="toast goal">{game.replay.meta}</div>
        )}
      </div>

      <div id="touch-controls" className="touch-controls">
        <div
          className="touch-steer-pad"
          aria-label="Touch steering and throttle"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            updateTouchSteer(event);
          }}
          onPointerMove={(event) => {
            if (touchKnob.active) updateTouchSteer(event);
          }}
          onPointerUp={(event) => {
            event.currentTarget.releasePointerCapture(event.pointerId);
            resetTouchSteer();
          }}
          onPointerCancel={resetTouchSteer}
        >
          <div
            className="touch-steer-knob"
            style={{
              transform: `translate(${touchKnob.x}px, ${touchKnob.y}px)`,
            }}
          />
        </div>
        <button
          onPointerDown={() => (touchRef.current.jump = true)}
          onPointerUp={() => (touchRef.current.jump = false)}
        >
          Jump
        </button>
        <button
          onPointerDown={() => (touchRef.current.drift = true)}
          onPointerUp={() => (touchRef.current.drift = false)}
        >
          Drift
        </button>
        <button
          className="primary"
          onPointerDown={() => (touchRef.current.boost = true)}
          onPointerUp={() => (touchRef.current.boost = false)}
        >
          Boost
        </button>
        <button
          onPointerDown={() => (touchRef.current.backflip = true)}
          onPointerUp={() => (touchRef.current.backflip = false)}
        >
          Backflip
        </button>
      </div>

      <div
        id="overlay"
        className={game.machine === "title" ? "overlay show" : "overlay"}
        role="dialog"
        aria-modal="true"
      >
        <div className="hero-panel">
          <div className="hero-copy">
            <span className="eyebrow">Neon drift cockpit online</span>
            <h1>InfernoDrift4</h1>
            <p>
              Launch a hot lap, throw the car into Max Arena, tune the garage,
              or keep the whole thing offline with bots.
            </p>
          </div>
          <div className="hero-telemetry" aria-label="Selected mode telemetry">
            <span>{modeFamily}</span>
            <strong>{activeMeta.label}</strong>
            <small>{activeMeta.help}</small>
          </div>
          <div className="cta-row">
            <button
              id="start-btn"
              className="primary"
              type="button"
              onClick={() => beginMode(selectedMode)}
            >
              Launch {activeMeta.label}
            </button>
            <button
              id="tutorial-btn"
              type="button"
              onClick={() => beginMode("tutorial")}
            >
              Training Run
            </button>
            <button type="button" onClick={() => showMenu("play")}>
              Open Cockpit
            </button>
          </div>
          <div className="mode-strip">
            <span>Offline bots armed</span>
            <span>Max Arena ready</span>
            <span>{currentMedal} license</span>
          </div>
        </div>
      </div>

      <div
        id="message"
        className={`overlay ${game.machine === "results" ? "show" : ""}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="results-panel">
          <span className="eyebrow">
            {game.objective.complete
              ? "Finish line cleared"
              : "Telemetry redline"}
          </span>
          <h2>{game.objective.complete ? "Run Complete" : "Run Failed"}</h2>
          <p className="result-copy">
            {game.objective.complete
              ? `${game.objective.label} banked ${Math.round(game.score)} points.`
              : game.objective.failReason}
          </p>
          <div className="stat-grid">
            <strong>
              <span>Medal</span>
              {game.progression.medals[game.mode] ?? "None"}
            </strong>
            <strong>
              <span>Near Miss</span>
              {game.stats.nearMisses.toFixed(1)}
            </strong>
            <strong>
              <span>Landings</span>
              {game.stats.landings}
            </strong>
          </div>
          <div className="cta-row">
            <button
              id="next-btn"
              className="primary"
              onClick={() => beginMode(selectedMode)}
            >
              Restart Run
            </button>
            <button id="retry-btn" onClick={() => showMenu("play")}>
              Mode Deck
            </button>
          </div>
        </div>
      </div>

      <div
        id="menu"
        className={`overlay ${menuOpen ? "show" : ""}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="menu-panel">
          <header className="menu-header">
            <div className="menu-title-block">
              <span className="eyebrow">{menuStatus} cockpit</span>
              <h2>InfernoDrift4</h2>
              <p>
                {activeMeta.label} tuned for {carSpec.label}.{" "}
                {online.status === "live"
                  ? `Online room ${online.roomCode ?? "lobby"} synced.`
                  : "Offline bot mode is ready."}
              </p>
            </div>
            <div className="menu-header-actions">
              <button
                className="primary"
                type="button"
                onClick={() => beginMode(selectedMode)}
              >
                Play Now
              </button>
              <button id="menu-close" onClick={closeMenu}>
                {game.machine === "paused" ? "Resume" : "Close"}
              </button>
            </div>
          </header>
          <nav className="menu-tabs" role="tablist">
            {(
              [
                "play",
                "garage",
                "progress",
                "online",
                "settings",
                "howto",
              ] as PrimaryTab[]
            ).map((item) => (
              <button
                key={item}
                id={item === "play" ? "games-tab-btn" : undefined}
                className={`tab-btn ${tab === item ? "active" : ""}`}
                data-tab={item === "play" ? "games" : item}
                role="tab"
                aria-selected={tab === item}
                onClick={() => setTab(item)}
              >
                <span>
                  {item === "howto"
                    ? "How To"
                    : item[0].toUpperCase() + item.slice(1)}
                </span>
                <small>{tabSubtitle(item)}</small>
              </button>
            ))}
          </nav>

          <main className="menu-content">
            {tab === "play" && (
              <section id="tab-games" className="tab-panel active">
                <div className="play-briefing">
                  <div>
                    <span className="eyebrow">{modeFamily}</span>
                    <h3>{activeMeta.label}</h3>
                    <p id="game-mode-hint" className="hint">
                      Current game: InfernoDrift4 {activeMeta.label} -{" "}
                      {activeMeta.help}
                    </p>
                  </div>
                  <div className="briefing-meter">
                    <span>Objective</span>
                    <strong>
                      {Math.round(game.objective.progress)}/
                      {game.objective.target}
                    </strong>
                    <div className="bar">
                      <span style={{ width: `${objectivePercent}%` }} />
                    </div>
                  </div>
                </div>
                <div className="featured-modes">
                  <button
                    id="game-card-id33"
                    data-game-mode="infernodrift33"
                    onClick={() => beginMode("campaign")}
                    type="button"
                  >
                    <em>InfernoDrift4 mainline</em>
                    <strong>Campaign Survival</strong>
                    <span>
                      World progression, adaptive hunters, bosses, medals.
                    </span>
                  </button>
                  <button
                    id="game-card-max1"
                    data-game-mode="infernodriftmax1"
                    onClick={() => beginMode("battle")}
                    type="button"
                  >
                    <em>Max circuit</em>
                    <strong>Max Arena</strong>
                    <span>
                      Ball hits, team roles, goal replay, 3v3 bot fill.
                    </span>
                  </button>
                </div>
                <div className="mode-grid">
                  {MODE_GROUPS.map(({ id, tag }) => (
                    <button
                      key={id}
                      className={selectedMode === id ? "active" : ""}
                      data-id4-mode={id}
                      onClick={() => beginMode(id)}
                      type="button"
                    >
                      <span className="mode-card-topline">
                        <em>{tag}</em>
                        <b>{MODE_META[id].target}</b>
                      </span>
                      <strong>{MODE_META[id].label}</strong>
                      <span>{MODE_META[id].help}</span>
                      <small>
                        {MODE_META[id].baseMode === "infernodriftmax1"
                          ? "Arena rules"
                          : "Street rules"}{" "}
                        · {game.progression.medals[id] ?? "No medal"}
                      </small>
                    </button>
                  ))}
                </div>
                <button
                  className="primary wide"
                  onClick={() => beginMode(selectedMode)}
                  id="play-selected-mode"
                >
                  Play {activeMeta.label}
                </button>
              </section>
            )}

            {tab === "garage" && (
              <section
                id="tab-customize"
                className="tab-panel active garage-layout"
              >
                <GaragePreview
                  paint={paint}
                  accent={accent}
                  carClass={carClass}
                />
                <div className="garage-controls">
                  <div className="garage-title">
                    <span className="eyebrow">Garage bay</span>
                    <h3>{carSpec.label}</h3>
                    <p className="hint">
                      Paint, underglow, and class stats update before your next
                      launch.
                    </p>
                  </div>
                  <label className="field">
                    <span>Car Class</span>
                    <select
                      value={carClass}
                      onChange={(event) =>
                        setCarClass(
                          event.target.value as keyof typeof CAR_CLASSES,
                        )
                      }
                    >
                      {Object.entries(CAR_CLASSES).map(([id, spec]) => (
                        <option key={id} value={id}>
                          {spec.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="paint-grid">
                    <label className="field color-field">
                      <span>Paint</span>
                      <input
                        type="color"
                        value={paint}
                        onChange={(event) => setPaint(event.target.value)}
                      />
                    </label>
                    <label className="field color-field">
                      <span>Underglow</span>
                      <input
                        type="color"
                        value={accent}
                        onChange={(event) => setAccent(event.target.value)}
                      />
                    </label>
                  </div>
                  <div id="custom-stats" className="custom-stats">
                    <strong>{carSpec.label}</strong>
                    <div className="stat-meter">
                      <span>Top {carSpec.maxSpeed}</span>
                      <div className="bar">
                        <span style={{ width: `${speedPercent}%` }} />
                      </div>
                    </div>
                    <div className="stat-meter">
                      <span>Drift {carSpec.drift.toFixed(2)}</span>
                      <div className="bar">
                        <span style={{ width: `${driftPercent}%` }} />
                      </div>
                    </div>
                    <div className="stat-meter">
                      <span>Air {carSpec.air.toFixed(2)}</span>
                      <div className="bar shield">
                        <span style={{ width: `${airPercent}%` }} />
                      </div>
                    </div>
                    <small>Mass {carSpec.mass.toFixed(2)}</small>
                  </div>
                  <button
                    className="primary wide"
                    type="button"
                    onClick={() => beginMode(selectedMode)}
                  >
                    Launch Tuned Car
                  </button>
                </div>
              </section>
            )}

            {tab === "progress" && (
              <section id="tab-progression" className="tab-panel active">
                <div className="progression-board" id="progression-board">
                  <strong>
                    <span>Driver Level</span>
                    {game.progression.level}
                  </strong>
                  <span>
                    <b>{game.progression.xp}</b> XP banked
                  </span>
                  <span>
                    <b>{game.progression.dailySeed}</b> daily seed
                  </span>
                  <span>
                    <b>{game.progression.weeklySeed}</b> weekly route
                  </span>
                </div>
                <div className="medal-wall" aria-label="Mode medals">
                  {MODE_GROUPS.slice(0, 10).map(({ id }) => (
                    <div key={id}>
                      <span>{MODE_META[id].label}</span>
                      <strong>{game.progression.medals[id] ?? "Open"}</strong>
                    </div>
                  ))}
                </div>
                <ul id="challenge-list" className="menu-list">
                  <li>Daily: score 900 drift points in {activeMeta.label}.</li>
                  <li>
                    Weekly: clear one minigame, one Max match, and one boss
                    route.
                  </li>
                  <li>
                    Live events use backend config when deployed; offline
                    rotation stays local.
                  </li>
                </ul>
              </section>
            )}

            {tab === "online" && (
              <section id="tab-online" className="tab-panel active">
                <div
                  id="online-status-card"
                  className={`online-status-card ${online.status}`}
                >
                  <div className="online-signal" aria-hidden="true" />
                  <div>
                    <strong>
                      {online.status === "live"
                        ? "Online backend connected"
                        : "Backend offline - bot mode active"}
                    </strong>
                    <span>
                      {online.error ||
                        (online.status === "live"
                          ? `Room ${online.roomCode ?? "lobby"} synced. Quick chat and 13+ moderated lobby chat are active.`
                          : "Set a WebSocket backend for rooms, social, and cloud saves.")}
                    </span>
                  </div>
                </div>
                <div className="online-grid">
                  <label className="field">
                    <span>Server URL</span>
                    <input
                      id="online-server-url"
                      value={online.serverUrl}
                      onChange={(event) =>
                        setOnline((prev) => ({
                          ...prev,
                          serverUrl: event.target.value,
                        }))
                      }
                      placeholder="wss://.../ws"
                    />
                  </label>
                  <label className="field">
                    <span>Guest name</span>
                    <input
                      id="online-username"
                      value={online.username}
                      maxLength={24}
                      onChange={(event) =>
                        setOnline((prev) => ({
                          ...prev,
                          username: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="field">
                    <span>Age for free chat</span>
                    <input
                      id="online-age"
                      value={online.age ?? ""}
                      inputMode="numeric"
                      placeholder="13+"
                      onChange={(event) => {
                        const age = event.target.value
                          ? Number(event.target.value)
                          : null;
                        setOnline((prev) => ({
                          ...prev,
                          age,
                          freeChatEnabled: canUseFreeChat(age),
                        }));
                      }}
                    />
                  </label>
                  <label className="field">
                    <span>Private code</span>
                    <input id="online-room-code" placeholder="AB12CD" />
                  </label>
                </div>
                <div className="cta-row online-actions">
                  <button
                    id="online-connect"
                    className="primary"
                    onClick={connectOnline}
                  >
                    Connect
                  </button>
                  <button
                    id="online-disconnect"
                    onClick={() => wsRef.current?.close()}
                  >
                    Disconnect
                  </button>
                  <button
                    id="online-create-room"
                    onClick={() =>
                      sendOnline({
                        type: "room.create",
                        playlist: "private",
                        teamSize: 3,
                        botFill: true,
                        private: true,
                      })
                    }
                  >
                    Create Private
                  </button>
                  <button
                    id="online-join-room"
                    onClick={() =>
                      sendOnline({
                        type: "room.join",
                        code:
                          (
                            document.getElementById(
                              "online-room-code",
                            ) as HTMLInputElement | null
                          )?.value || "",
                      })
                    }
                  >
                    Join Code
                  </button>
                  <button
                    id="online-queue"
                    onClick={() =>
                      sendOnline({
                        type: "queue.join",
                        playlist: "casual",
                        teamSize: 3,
                        botFill: true,
                      })
                    }
                  >
                    Queue
                  </button>
                </div>
                <div className="online-panels">
                  <div className="online-panel">
                    <strong>Room</strong>
                    <div id="online-room-state">
                      {online.roomCode
                        ? `Room ${online.roomCode}`
                        : "Offline bot mode"}
                    </div>
                    <ul id="online-room-list" className="menu-list compact">
                      {online.players.length ? (
                        online.players.map((player) => (
                          <li key={player}>{player}</li>
                        ))
                      ) : (
                        <li>Solo cockpit. Bots will fill the grid.</li>
                      )}
                    </ul>
                  </div>
                  <div className="online-panel">
                    <strong>Chat</strong>
                    <div id="online-chat-log" className="online-chat-log">
                      {online.chat.length ? (
                        online.chat.map((line, index) => (
                          <div key={index}>
                            <b>{line.from}</b> {line.text}
                          </div>
                        ))
                      ) : (
                        <span className="empty-note">
                          Quick chat is ready. Free chat unlocks at 13+.
                        </span>
                      )}
                    </div>
                    <div className="online-chat-row">
                      <input
                        id="online-chat-input"
                        placeholder={
                          freeChatLocked
                            ? "Free chat requires age 13+"
                            : "Safe lobby chat"
                        }
                        disabled={freeChatLocked}
                      />
                      <button
                        id="online-chat-send"
                        disabled={freeChatLocked}
                        onClick={() => {
                          const input = document.getElementById(
                            "online-chat-input",
                          ) as HTMLInputElement | null;
                          if (input?.value)
                            sendOnline({
                              type: "chat.send",
                              text: input.value,
                              age: online.age,
                              channel: "lobby",
                            });
                        }}
                      >
                        Send
                      </button>
                    </div>
                    <div className="quick-chat-row">
                      {QUICK_CHAT.slice(0, 3).map((text) => (
                        <button
                          key={text}
                          data-quick-chat={text}
                          onClick={() =>
                            sendOnline({ type: "quick.send", text })
                          }
                        >
                          {text}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="online-panel">
                    <strong>Rank / Social</strong>
                    <ul id="online-leaderboard" className="menu-list compact">
                      {online.leaderboard.map((row, index) => (
                        <li key={row.username}>
                          #{index + 1} {row.username} {row.rating}
                        </li>
                      ))}
                    </ul>
                    <ul id="online-social-list" className="menu-list compact">
                      <li>
                        Friends, blocks, reports, and DMs require D1 backend
                        persistence.
                      </li>
                    </ul>
                  </div>
                </div>
              </section>
            )}

            {tab === "settings" && (
              <section id="tab-settings" className="tab-panel active">
                <div className="settings-grid">
                  <div className="settings-panel">
                    <strong>Run Feel</strong>
                    <label
                      className="field"
                      id="max-difficulty-field"
                      hidden={game.baseMode !== "infernodriftmax1"}
                    >
                      <span>Max Difficulty</span>
                      <select id="max-difficulty-select">
                        <option value="classic">Classic</option>
                        <option value="brutal">Brutal</option>
                      </select>
                    </label>
                    <label className="field">
                      <span>Camera Shake {cameraShake.toFixed(1)}</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={cameraShake}
                        onChange={(event) =>
                          setCameraShake(Number(event.target.value))
                        }
                      />
                    </label>
                    <label className="field">
                      <span>SFX Volume {Math.round(sfxVolume * 100)}%</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={sfxVolume}
                        onChange={(event) =>
                          setSfxVolume(Number(event.target.value))
                        }
                      />
                    </label>
                    <label className="field">
                      <span>Music Volume {Math.round(musicVolume * 100)}%</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={musicVolume}
                        onChange={(event) =>
                          setMusicVolume(Number(event.target.value))
                        }
                      />
                    </label>
                  </div>
                  <div className="settings-panel">
                    <strong>Display</strong>
                    <label className="field">
                      <span>Device Mode</span>
                      <select
                        id="device-mode-select"
                        value={deviceMode}
                        onChange={(event) =>
                          setDeviceMode(event.target.value as typeof deviceMode)
                        }
                      >
                        <option value="auto">Auto</option>
                        <option value="desktop">Desktop</option>
                        <option value="tablet">Tablet</option>
                        <option value="phone">Phone</option>
                      </select>
                    </label>
                    <label className="field toggle">
                      <span>Reduced Motion</span>
                      <input
                        checked={reducedMotion}
                        onChange={(event) =>
                          setReducedMotion(event.target.checked)
                        }
                        type="checkbox"
                      />
                    </label>
                  </div>
                  <div className="settings-panel dev-panel">
                    <strong>Dev Console</strong>
                    <label className="field toggle">
                      <span>Dev Mode</span>
                      <input
                        id="dev-mode-toggle"
                        checked={devMode}
                        onChange={(event) => setDevMode(event.target.checked)}
                        type="checkbox"
                      />
                    </label>
                    <p id="dev-mode-hint" className="hint">
                      {devMode
                        ? "Dev Mode enabled. Test hooks and force actions are active."
                        : "Dev Mode disabled."}
                    </p>
                    <div className="dev-actions">
                      <button
                        id="dev-force-demo"
                        onClick={() => {
                          const api = window.__infernodriftTestApi as {
                            forceDemo?: () => void;
                          };
                          api.forceDemo?.();
                        }}
                      >
                        Force Demo
                      </button>
                      <select id="dev-max-boost-variant" defaultValue="hyper">
                        <option value="hyper">Hyper</option>
                        <option value="classic">Classic</option>
                      </select>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {tab === "howto" && (
              <section id="tab-howto" className="tab-panel active">
                <ol id="howto-list" className="menu-list">
                  <li>
                    Drive with WASD or arrows. Drift with Space, boost with
                    Shift, jump with X, backflip with C.
                  </li>
                  <li>
                    Each mode has a real objective, unique scoring hook, and
                    fast restart.
                  </li>
                  <li>
                    Quick chat is available to everyone. Free chat and DMs
                    require age 13+ and backend moderation.
                  </li>
                  <li>
                    Controller support uses the browser Gamepad API where
                    available; keyboard remapping is in the next settings pass.
                  </li>
                </ol>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function Radar({ entities }: { entities: GameState["radar"] }) {
  return (
    <div
      className="radar minimap-wrap"
      id="minimap"
      aria-label="Forward relative radar"
    >
      <div className="radar-boundary" />
      <div className="radar-player" />
      {entities.slice(0, 28).map((entity, index) => {
        const x = clamp(50 + entity.right * 0.22, 5, 95);
        const y = clamp(50 - entity.forward * 0.22, 5, 95);
        return (
          <span
            key={`${entity.kind}-${index}`}
            className={`radar-dot ${entity.kind} team-${entity.team} ${entity.edge ? "edge" : ""}`}
            style={{ left: `${x}%`, top: `${y}%` }}
            title={`${entity.kind} ${entity.sector}`}
          />
        );
      })}
    </div>
  );
}

function handleOnlineMessage(
  prev: OnlineState,
  msg: Record<string, unknown>,
): OnlineState {
  if (msg.type === "auth.ok") {
    return {
      ...prev,
      status: "live",
      error: null,
      username: sanitizeDisplayText(
        (msg.user as { username?: string })?.username ?? prev.username,
        24,
      ),
    };
  }
  if (msg.type === "room.snapshot") {
    const room = msg.room as
      | {
          code?: string;
          players?: Array<{ username?: string }>;
          leaderboard?: OnlineState["leaderboard"];
        }
      | undefined;
    return {
      ...prev,
      status: "live",
      roomCode: room?.code ?? prev.roomCode,
      players:
        room?.players?.map((player) => player.username ?? "Guest") ??
        prev.players,
      leaderboard: room?.leaderboard ?? prev.leaderboard,
    };
  }
  if (msg.type === "chat.message") {
    return {
      ...prev,
      chat: [
        ...prev.chat.slice(-12),
        {
          from: sanitizeDisplayText(msg.from, 24),
          text: sanitizeDisplayText(msg.text, 140),
          quick: Boolean(msg.quick),
        },
      ],
    };
  }
  if (msg.type === "error")
    return { ...prev, error: String(msg.error ?? "Backend error") };
  return prev;
}

function normalizeWsUrl(value: string): string {
  if (value.startsWith("ws://") || value.startsWith("wss://")) return value;
  if (value.startsWith("http://"))
    return `ws://${value.slice("http://".length)}`;
  if (value.startsWith("https://"))
    return `wss://${value.slice("https://".length)}`;
  return `wss://${value}`;
}

function resolveDeviceType(mode: "auto" | "desktop" | "tablet" | "phone") {
  if (mode !== "auto") return mode;
  if (window.innerWidth < 760) return "phone";
  if (window.innerWidth < 1100) return "tablet";
  return "desktop";
}

function tabSubtitle(tab: PrimaryTab): string {
  switch (tab) {
    case "play":
      return "Modes";
    case "garage":
      return "Tune";
    case "progress":
      return "Medals";
    case "online":
      return "Rooms";
    case "settings":
      return "Feel";
    case "howto":
      return "Controls";
  }
  return "";
}

function formatTime(value: number) {
  const minutes = Math.floor(value / 60);
  const seconds = Math.max(0, Math.floor(value % 60));
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
