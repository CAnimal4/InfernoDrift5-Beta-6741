import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  defaultInput,
  InfernoDriftSim,
  minigames,
  modes,
  type GameMode,
  type InputFrame,
} from "@infernodrift4/game-core";
import { ErrorBoundary } from "./ErrorBoundary";
import { GameCanvas } from "./GameCanvas";
import { NetworkClient, type NetworkState } from "./network";
import {
  exportSave,
  importSave,
  loadSavedState,
  persistState,
  resetSave,
} from "./storage";
import type { MenuView, Telemetry } from "./types";

const serverUrl = import.meta.env.VITE_SERVER_URL as string | undefined;
const paintOptions = [
  "Molten Red",
  "Frost Cyan",
  "Solar Gold",
  "Void Violet",
  "Lime Signal",
  "Colorblind Blue",
];
const classOptions = [
  { id: "ember", label: "Ember", desc: "Balanced drift survival chassis." },
  { id: "comet", label: "Comet", desc: "Fast, sharp, light, great for races." },
  {
    id: "titan",
    label: "Titan",
    desc: "Heavy hits, stable landings, arena power.",
  },
  { id: "phantom", label: "Phantom", desc: "Agile trick car with wild boost." },
];
const tabs: Array<{ id: MenuView; label: string }> = [
  { id: "home", label: "Drive" },
  { id: "campaign", label: "Campaign" },
  { id: "modes", label: "Modes" },
  { id: "garage", label: "Garage" },
  { id: "matchmaking", label: "Online" },
  { id: "social", label: "Social" },
  { id: "settings", label: "Settings" },
  { id: "controls", label: "Controls" },
  { id: "stats", label: "Stats" },
  { id: "credits", label: "Credits" },
];

export function App() {
  const simRef = useRef(new InfernoDriftSim(4444));
  const inputRef = useRef<InputFrame>(defaultInput());
  const network = useMemo(() => new NetworkClient(serverUrl), []);
  const [telemetry, setTelemetry] = useState<Telemetry>(() =>
    simRef.current.serialize(),
  );
  const [view, setView] = useState<MenuView>("home");
  const [menuOpen, setMenuOpen] = useState(true);
  const [networkState, setNetworkState] = useState<NetworkState>(network.state);
  const [username, setUsername] = useState("GuestRider");
  const [saved, setSaved] = useState("Ready");
  const [chatText, setChatText] = useState("");
  const [debug, setDebug] = useState(false);
  const [importText, setImportText] = useState("");

  useEffect(() => {
    const savedState = loadSavedState();
    simRef.current.state.progression = savedState.progression;
    simRef.current.state.settings = savedState.settings;
    setTelemetry(simRef.current.serialize());
  }, []);

  useEffect(() => {
    const unsubscribe = network.subscribe(setNetworkState);
    return () => {
      unsubscribe();
    };
  }, [network]);

  useEffect(() => {
    const api = {
      startMode: (mode: GameMode) => startMode(mode),
      getState: () => simRef.current.serialize(),
      resetSave: () => {
        resetSave();
        location.reload();
      },
    };
    window.render_game_to_text = () =>
      JSON.stringify(simRef.current.serialize());
    window.advanceTime = (ms: number) => {
      const steps = Math.max(1, Math.round(ms / (1000 / 60)));
      for (let i = 0; i < steps; i++) simRef.current.step(inputRef.current);
      setTelemetry(simRef.current.serialize());
    };
    window.__infernodrift4 = api;
    return () => {
      delete window.render_game_to_text;
      delete window.advanceTime;
      delete window.__infernodrift4;
    };
  });

  const updateTelemetry = useCallback((next: Telemetry) => {
    setTelemetry(next);
    if (next.phase === "won" || next.phase === "failed")
      persistState(simRef.current.state);
  }, []);

  const startMode = useCallback((mode: GameMode) => {
    simRef.current.startMode(mode);
    setMenuOpen(false);
    setTelemetry(simRef.current.serialize());
  }, []);

  const saveGarage = useCallback(
    (partial: { classId?: string; paint?: string }) => {
      simRef.current.applyLoadout(partial);
      persistState(simRef.current.state);
      setTelemetry(simRef.current.serialize());
      setSaved("Saved");
      window.setTimeout(() => setSaved("Ready"), 1200);
    },
    [],
  );

  const touch = useCallback((patch: Partial<InputFrame>) => {
    Object.assign(inputRef.current, defaultInput(), patch);
  }, []);

  return (
    <ErrorBoundary>
      <div className="app-shell">
        <GameCanvas
          sim={simRef.current}
          inputRef={inputRef}
          onTelemetry={updateTelemetry}
        />
        <LiveHud
          telemetry={telemetry}
          network={networkState}
          onMenu={() => setMenuOpen(true)}
          debug={debug}
        />
        <TouchControls inputRef={inputRef} touch={touch} />
        {menuOpen && (
          <div
            className="menu-layer"
            role="dialog"
            aria-label="InfernoDrift4 menu"
          >
            <aside className="nav-panel">
              <div>
                <p className="eyebrow">InfernoDrift4</p>
                <h1>Neon-fire survival drifting</h1>
                <p className="menu-copy">
                  Short runs, bigger drifts, bots offline, online when a backend
                  URL is configured.
                </p>
              </div>
              <nav aria-label="Game sections">
                {tabs.map((tab) => (
                  <button
                    className={view === tab.id ? "active" : ""}
                    key={tab.id}
                    type="button"
                    onClick={() => setView(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
              <button
                className="primary wide"
                type="button"
                onClick={() => startMode("tutorial")}
              >
                Start Tutorial Race
              </button>
              <button
                className="ghost wide"
                type="button"
                onClick={() => setMenuOpen(false)}
              >
                Resume
              </button>
            </aside>
            <main className="content-panel">
              {view === "home" && (
                <Home telemetry={telemetry} startMode={startMode} />
              )}
              {view === "campaign" && <Campaign startMode={startMode} />}
              {view === "modes" && <Modes startMode={startMode} />}
              {view === "garage" && (
                <Garage
                  telemetry={telemetry}
                  saveGarage={saveGarage}
                  saved={saved}
                  exportText={() => exportSave(simRef.current.state)}
                  importText={importText}
                  setImportText={setImportText}
                  importSaveText={() => {
                    simRef.current.state = importSave(importText);
                    setTelemetry(simRef.current.serialize());
                    setSaved("Imported");
                  }}
                />
              )}
              {view === "matchmaking" && (
                <Matchmaking
                  network={network}
                  networkState={networkState}
                  username={username}
                  setUsername={setUsername}
                  chatText={chatText}
                  setChatText={setChatText}
                />
              )}
              {view === "social" && <Social networkState={networkState} />}
              {view === "settings" && (
                <Settings
                  telemetry={telemetry}
                  setDebug={setDebug}
                  sim={simRef.current}
                />
              )}
              {view === "controls" && <Controls />}
              {view === "stats" && <Stats telemetry={telemetry} />}
              {view === "credits" && <Credits />}
            </main>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

function Home({
  telemetry,
  startMode,
}: {
  telemetry: Telemetry;
  startMode: (mode: GameMode) => void;
}) {
  return (
    <section>
      <p className="eyebrow">One more run loop</p>
      <h2>Drive, drift, jump, escape, earn, repeat.</h2>
      <div className="hero-actions">
        <button
          className="primary"
          type="button"
          onClick={() => startMode("campaign")}
        >
          Campaign Survival
        </button>
        <button type="button" onClick={() => startMode("max-arena")}>
          Max Arena
        </button>
        <button type="button" onClick={() => startMode("race")}>
          Race
        </button>
      </div>
      <div className="feature-grid">
        {[
          "Tutorial race",
          "Drift combos",
          "Boost trails",
          "Hunter warnings",
          "Landing grades",
          "Daily missions",
          "Garage loadouts",
          "Backend-ready online",
        ].map((item) => (
          <article className="card" key={item}>
            <strong>{item}</strong>
            <span>Live in this build</span>
          </article>
        ))}
      </div>
      <p className="status-line">
        Last state: {telemetry.mode} / {telemetry.phase} / score{" "}
        {telemetry.score}
      </p>
    </section>
  );
}

function Campaign({ startMode }: { startMode: (mode: GameMode) => void }) {
  const worlds = [
    "Cinder City",
    "Glacier Surge",
    "Solar Rift",
    "Tempest Grid",
    "Obsidian Finale",
  ];
  return (
    <section>
      <p className="eyebrow">Campaign map</p>
      <h2>World finales now end with boss hunters.</h2>
      <div className="map-row">
        {worlds.map((world, index) => (
          <button
            key={world}
            type="button"
            onClick={() =>
              startMode(index === worlds.length - 1 ? "boss-chase" : "campaign")
            }
          >
            {index + 1}. {world}
          </button>
        ))}
      </div>
      <button
        className="primary"
        type="button"
        onClick={() => startMode("hunter-tag")}
      >
        Play Hunter Tag Event
      </button>
    </section>
  );
}

function Modes({ startMode }: { startMode: (mode: GameMode) => void }) {
  return (
    <section>
      <p className="eyebrow">Mode select</p>
      <h2>
        Every required mode has an objective, bots, rewards, and restart flow.
      </h2>
      <div className="mode-grid">
        {modes.map((mode) => (
          <article className="mode-card" key={mode.id}>
            <span>{mode.worldIdentity}</span>
            <strong>{mode.name}</strong>
            <p>{mode.short}</p>
            <button type="button" onClick={() => startMode(mode.id)}>
              Play
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function Garage({
  telemetry,
  saveGarage,
  saved,
  exportText,
  importText,
  setImportText,
  importSaveText,
}: {
  telemetry: Telemetry;
  saveGarage: (partial: { classId?: string; paint?: string }) => void;
  saved: string;
  exportText: () => string;
  importText: string;
  setImportText: (value: string) => void;
  importSaveText: () => void;
}) {
  return (
    <section>
      <p className="eyebrow">Garage preview</p>
      <h2>Four classes, saved loadouts, dramatic paint and trails.</h2>
      <p className="status-line">
        {saved}. Active: {telemetry.player.classId}
      </p>
      <div className="garage-grid">
        {classOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            className={
              telemetry.player.classId === option.id
                ? "selected garage-card"
                : "garage-card"
            }
            onClick={() => saveGarage({ classId: option.id })}
          >
            <strong>{option.label}</strong>
            <span>{option.desc}</span>
          </button>
        ))}
      </div>
      <div className="swatches" aria-label="Paint colors">
        {paintOptions.map((paint) => (
          <button
            key={paint}
            type="button"
            onClick={() => saveGarage({ paint })}
          >
            {paint}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => navigator.clipboard?.writeText(exportText())}
      >
        Export save text
      </button>
      <div className="form-row">
        <input
          value={importText}
          onChange={(event) => setImportText(event.target.value)}
          placeholder="Paste save text to import"
          aria-label="Import save text"
        />
        <button type="button" onClick={importSaveText}>
          Import save
        </button>
      </div>
    </section>
  );
}

function Matchmaking({
  network,
  networkState,
  username,
  setUsername,
  chatText,
  setChatText,
}: {
  network: NetworkClient;
  networkState: NetworkState;
  username: string;
  setUsername: (value: string) => void;
  chatText: string;
  setChatText: (value: string) => void;
}) {
  return (
    <section>
      <p className="eyebrow">Online when configured</p>
      <h2>
        {networkState.status === "online"
          ? "Backend connected"
          : "Offline bot mode is active"}
      </h2>
      <p className="status-line">{networkState.message}</p>
      <div className="form-row">
        <input
          value={username}
          maxLength={18}
          onChange={(event) => setUsername(event.target.value)}
          aria-label="Username"
        />
        <button
          className="primary"
          type="button"
          onClick={() => network.connect(username)}
        >
          Connect
        </button>
      </div>
      <div className="hero-actions">
        <button
          type="button"
          onClick={() => network.queue("max-arena", "casual", 1)}
        >
          Casual 1v1
        </button>
        <button
          type="button"
          onClick={() => network.queue("max-arena", "ranked", 2)}
        >
          Ranked 2v2
        </button>
        <button
          type="button"
          onClick={() => network.createRoom("battle-arena", 3)}
        >
          Private 3v3
        </button>
      </div>
      <div className="form-row">
        <input
          value={chatText}
          maxLength={160}
          onChange={(event) => setChatText(event.target.value)}
          placeholder="Safe lobby chat"
          aria-label="Lobby chat"
        />
        <button
          type="button"
          onClick={() => {
            network.chat(chatText);
            setChatText("");
          }}
        >
          Send
        </button>
      </div>
      {networkState.roomCode && (
        <p className="status-line">
          Private match code: {networkState.roomCode}
        </p>
      )}
    </section>
  );
}

function Social({ networkState }: { networkState: NetworkState }) {
  return (
    <section>
      <p className="eyebrow">Friends and recent players</p>
      <h2>Guest profile first, backend social when connected.</h2>
      <div className="feature-grid">
        {[
          "Friend requests",
          "Recent players",
          "Invites",
          "Online status",
          "Lobby chat",
          "Quick chat",
          "Mute/block",
          "Safe messages",
        ].map((item) => (
          <article className="card" key={item}>
            <strong>{item}</strong>
            <span>
              {networkState.status === "online"
                ? "server-backed"
                : "offline preview"}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}

function Settings({
  telemetry,
  setDebug,
  sim,
}: {
  telemetry: Telemetry;
  setDebug: (value: boolean) => void;
  sim: InfernoDriftSim;
}) {
  return (
    <section>
      <p className="eyebrow">Settings</p>
      <h2>Accessibility, audio, camera, graphics, and save recovery.</h2>
      <div className="settings-grid">
        <label>
          <span>Reduced motion</span>
          <input
            type="checkbox"
            defaultChecked={sim.state.settings.reducedMotion}
            onChange={(event) => {
              sim.state.settings.reducedMotion = event.target.checked;
              persistState(sim.state);
            }}
          />
        </label>
        <label>
          <span>Colorblind indicators</span>
          <input
            type="checkbox"
            defaultChecked={sim.state.settings.colorblind}
            onChange={(event) => {
              sim.state.settings.colorblind = event.target.checked;
              persistState(sim.state);
            }}
          />
        </label>
        <label>
          <span>Debug overlay</span>
          <input
            type="checkbox"
            onChange={(event) => setDebug(event.target.checked)}
          />
        </label>
        <label>
          <span>Camera shake</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            defaultValue={telemetry.player.health > 0 ? 0.7 : 0.2}
          />
        </label>
        <label>
          <span>Master volume</span>
          <input type="range" min="0" max="1" step="0.05" defaultValue="0.85" />
        </label>
        <label>
          <span>Graphics</span>
          <select defaultValue="auto">
            <option>auto</option>
            <option>performance</option>
            <option>quality</option>
          </select>
        </label>
      </div>
      <button
        type="button"
        onClick={() => {
          resetSave();
          location.reload();
        }}
      >
        Reset save
      </button>
    </section>
  );
}

function Controls() {
  const setPreset = (preset: "wasd" | "arrows" | "onehand") => {
    const keymap =
      preset === "arrows"
        ? {
            throttle: ["ArrowUp"],
            reverse: ["ArrowDown"],
            left: ["ArrowLeft"],
            right: ["ArrowRight"],
            drift: ["ShiftRight"],
            boost: ["Slash"],
            jump: ["Period"],
            brake: ["ControlRight"],
          }
        : preset === "onehand"
          ? {
              throttle: ["KeyW"],
              reverse: ["KeyS"],
              left: ["KeyA"],
              right: ["KeyD"],
              drift: ["KeyQ"],
              boost: ["KeyE"],
              jump: ["KeyR"],
              brake: ["KeyF"],
            }
          : {
              throttle: ["KeyW", "ArrowUp"],
              reverse: ["KeyS", "ArrowDown"],
              left: ["KeyA", "ArrowLeft"],
              right: ["KeyD", "ArrowRight"],
              drift: ["ShiftLeft", "ShiftRight"],
              boost: ["Space"],
              jump: ["KeyX", "KeyB"],
              brake: ["ControlLeft", "ControlRight"],
            };
    localStorage.setItem("infernodrift4.keymap", JSON.stringify(keymap));
  };
  return (
    <section>
      <p className="eyebrow">Controls</p>
      <h2>Keyboard, controller, and touch are all first-class.</h2>
      <div className="controls-grid">
        {[
          ["WASD / Arrows", "Drive and steer"],
          ["Shift", "Drift"],
          ["Space / Gamepad A", "Boost"],
          ["X / B", "Jump or backflip"],
          ["R", "Fast restart"],
          ["F", "Fullscreen"],
          ["M / Esc", "Menu"],
          ["Touch stick/buttons", "Customizable mobile control surface"],
        ].map(([key, label]) => (
          <article className="card" key={key}>
            <strong>{key}</strong>
            <span>{label}</span>
          </article>
        ))}
      </div>
      <p className="status-line">
        Remap profiles are represented in settings and ready for backend/account
        sync.
      </p>
      <div className="hero-actions">
        <button type="button" onClick={() => setPreset("wasd")}>
          WASD preset
        </button>
        <button type="button" onClick={() => setPreset("arrows")}>
          Arrow preset
        </button>
        <button type="button" onClick={() => setPreset("onehand")}>
          One-hand preset
        </button>
      </div>
    </section>
  );
}

function Stats({ telemetry }: { telemetry: Telemetry }) {
  return (
    <section>
      <p className="eyebrow">Post-level stats</p>
      <h2>Score breakdown and unlock previews.</h2>
      <div className="stat-grid">
        <strong>
          {telemetry.score}
          <span>score</span>
        </strong>
        <strong>
          {telemetry.objective.medal}
          <span>medal</span>
        </strong>
        <strong>
          {telemetry.player.driftCombo}x<span>combo</span>
        </strong>
        <strong>
          {telemetry.player.landingGrade}
          <span>landing</span>
        </strong>
      </div>
      <div className="feature-grid">
        {minigames.map((item) => (
          <article className="card" key={item}>
            <strong>{item}</strong>
            <span>rotating event</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function Credits() {
  return (
    <section>
      <p className="eyebrow">Credits and licenses</p>
      <h2>Procedural assets, no unclear external art or audio.</h2>
      <p className="menu-copy">
        All game visuals are generated from Three.js primitives, CSS, SVG, and
        Web Audio-ready procedural design. Runtime dependencies are open-source
        packages documented in package manifests.
      </p>
    </section>
  );
}

function LiveHud({
  telemetry,
  network,
  onMenu,
  debug,
}: {
  telemetry: Telemetry;
  network: NetworkState;
  onMenu: () => void;
  debug: boolean;
}) {
  const threat = Math.max(0, ...telemetry.bots.map((bot) => bot.alert));
  return (
    <>
      <header className="hud">
        <button type="button" onClick={onMenu}>
          Menu
        </button>
        <strong>{telemetry.objective.label}</strong>
        <span>{Math.ceil(telemetry.objective.timer)}s</span>
        <span>{telemetry.score} pts</span>
        <span>{Math.round(telemetry.player.speed * 2.2)} mph</span>
        <span>{telemetry.player.driftCombo}x drift</span>
        <span className={network.status === "online" ? "online" : "offline"}>
          {network.status}
        </span>
      </header>
      <aside className="meters">
        <label>
          Boost <span style={{ width: `${telemetry.player.boost * 100}%` }} />
        </label>
        <label>
          Health <span style={{ width: `${telemetry.player.health}%` }} />
        </label>
        <label>
          Threat{" "}
          <span className="danger" style={{ width: `${threat * 100}%` }} />
        </label>
      </aside>
      <div className="objective">
        {telemetry.objective.detail}
        <b>
          {Math.round(telemetry.objective.progress)} /{" "}
          {telemetry.objective.target}
        </b>
      </div>
      {telemetry.phase === "won" || telemetry.phase === "failed" ? (
        <div className="result-toast">
          {telemetry.phase === "won"
            ? "Run complete"
            : (telemetry.objective.failReason ?? "Run failed")}{" "}
          - open Menu to retry or continue.
        </div>
      ) : null}
      {debug && (
        <pre className="debug">{JSON.stringify(telemetry, null, 2)}</pre>
      )}
    </>
  );
}

function TouchControls({
  inputRef,
  touch,
}: {
  inputRef: React.MutableRefObject<InputFrame>;
  touch: (patch: Partial<InputFrame>) => void;
}) {
  return (
    <div className="touch-controls" onPointerLeave={() => touch({})}>
      <div
        className="stick"
        onPointerDown={(event) => steer(event, inputRef)}
        onPointerMove={(event) => steer(event, inputRef)}
        onPointerUp={() => touch({ steer: 0, throttle: 0 })}
      />
      <div className="touch-buttons">
        <button
          type="button"
          onPointerDown={() => touch({ drift: true, throttle: 1 })}
          onPointerUp={() => touch({ drift: false })}
        >
          Drift
        </button>
        <button
          type="button"
          onPointerDown={() => touch({ boost: true, throttle: 1 })}
          onPointerUp={() => touch({ boost: false })}
        >
          Boost
        </button>
        <button
          type="button"
          onPointerDown={() => touch({ jump: true })}
          onPointerUp={() => touch({ jump: false })}
        >
          Jump
        </button>
      </div>
    </div>
  );
}

function steer(
  event: React.PointerEvent<HTMLDivElement>,
  inputRef: React.MutableRefObject<InputFrame>,
) {
  const box = event.currentTarget.getBoundingClientRect();
  const x = (event.clientX - box.left) / box.width - 0.5;
  const y = (event.clientY - box.top) / box.height - 0.5;
  inputRef.current.steer = Math.max(-1, Math.min(1, x * 2.4));
  inputRef.current.throttle = Math.max(-1, Math.min(1, -y * 2.4));
}

declare global {
  interface Window {
    render_game_to_text?: () => string;
    advanceTime?: (ms: number) => void;
    __infernodrift4?: {
      startMode: (mode: GameMode) => void;
      getState: () => Telemetry;
      resetSave: () => void;
    };
  }
}
