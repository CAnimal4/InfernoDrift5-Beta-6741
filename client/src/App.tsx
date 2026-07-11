import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CHASSIS,
  EMPTY_INPUT,
  FIXED_STEP,
  applyResult,
  calculateResult,
  cloneSnapshot,
  createSimulation,
  dailySeed,
  districtName,
  stepSimulation,
  type ChassisId,
  type InputFrame,
  type MatchSnapshot,
  type ModeId,
  type RunResult,
  type SaveV1,
  type SimulationState,
} from "../../packages/afterburn-core/src/index";
import { QUICK_CHAT } from "../../packages/afterburn-protocol/src/index";
import { AfterburnAudio } from "./afterburn/audio";
import { InputController } from "./afterburn/input";
import { MultiplayerClient, type NetworkState } from "./afterburn/network";
import { AfterburnRenderer } from "./afterburn/renderer";
import { AfterburnProfileStore } from "./afterburn/storage";

type Screen = "title" | "menu" | "playing" | "results";
type Tab = "drive" | "garage" | "records" | "settings";

const MODE_DETAILS: Record<ModeId, { name: string; eyebrow: string; description: string; players: string }> = {
  "burn-run": {
    name: "Burn Run",
    eyebrow: "Flagship escape",
    description: "Outrun four hunter classes, bank volatile cores, and break through the Caldera Crown.",
    players: "Solo · 8–12 min",
  },
  "burn-crew": {
    name: "Burn Crew",
    eyebrow: "Co-op survival",
    description: "Revive your crew, share the route, and extract together before the Reaper closes in.",
    players: "1–4 online",
  },
  "heat-circuit": {
    name: "Heat Circuit",
    eyebrow: "Contact racing",
    description: "Six cars. Branching gates. Capped impacts, slipstream lanes, and no safe line.",
    players: "2–6 online",
  },
  "drift-clash": {
    name: "Drift Clash",
    eyebrow: "Score battle",
    description: "Chain angle, speed, and proximity into one unbroken two-minute assault.",
    players: "2–6 online",
  },
  wreckyard: {
    name: "Wreckyard",
    eyebrow: "Free drive",
    description: "Learn the chassis, test inputs, and find the edge without a timer.",
    players: "Solo practice",
  },
};

const DEFAULT_NETWORK: NetworkState = {
  status: "offline",
  playerId: null,
  room: null,
  snapshot: null,
  result: null,
  region: "offline",
  ping: 0,
  packetLoss: 0,
  message: "Local drive ready",
  quickMessage: "",
};

declare global {
  interface Window {
    render_game_to_text?: () => string;
    advanceTime?: (ms: number) => void;
    __infernodriftTestApi?: {
      startLocal: (mode?: ModeId) => void;
      skipCountdown: () => void;
      freeze: (value: boolean) => void;
      forceFinish: () => void;
      setTouch: (patch: Partial<InputFrame>) => void;
      getSnapshot: () => MatchSnapshot | null;
    };
  }
}

export function App() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<AfterburnRenderer | null>(null);
  const inputRef = useRef<InputController | null>(null);
  const audioRef = useRef(new AfterburnAudio());
  const storeRef = useRef(new AfterburnProfileStore());
  const simulationRef = useRef<SimulationState | null>(null);
  const snapshotRef = useRef<MatchSnapshot | null>(null);
  const screenRef = useRef<Screen>("title");
  const resultRef = useRef<RunResult | null>(null);
  const localPlayerIdRef = useRef("local-player");
  const lastAwardedTickRef = useRef(-1);
  const accumulatorRef = useRef(0);
  const sendAccumulatorRef = useRef(0);
  const frozenRef = useRef(false);
  const lastFrameRef = useRef(performance.now());
  const [screen, setScreen] = useState<Screen>("title");
  const [tab, setTab] = useState<Tab>("drive");
  const [selectedMode, setSelectedMode] = useState<ModeId>("burn-run");
  const [save, setSave] = useState<SaveV1 | null>(null);
  const [uiSnapshot, setUiSnapshot] = useState<MatchSnapshot | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);
  const [network, setNetwork] = useState<NetworkState>(DEFAULT_NETWORK);
  const [driverName, setDriverName] = useState(() => localStorage.getItem("infernodrift.afterburn.name") || "Drifter");
  const [roomCode, setRoomCode] = useState("");
  const [toast, setToast] = useState("");
  const [paused, setPaused] = useState(false);

  const networkClient = useMemo(
    () => new MultiplayerClient(import.meta.env.VITE_AFTERBURN_WS || "ws://127.0.0.1:8787"),
    [],
  );

  useEffect(() => {
    void storeRef.current.load().then(setSave);
    return networkClient.subscribe((next) => {
      setNetwork(next);
      if (next.snapshot) {
        snapshotRef.current = next.snapshot;
        setUiSnapshot(next.snapshot);
        if (screenRef.current !== "playing" && next.room?.phase !== "lobby") changeScreen("playing");
      }
      if (next.result) showResult(next.result);
    });
  }, [networkClient]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !save) return;
    const renderer = new AfterburnRenderer(host, save.settings);
    const input = new InputController();
    rendererRef.current = renderer;
    inputRef.current = input;
    const preview = createSimulation("wreckyard", 6026, [
      { id: "preview", name: "Afterburn", chassis: "vandal", bot: true },
    ]);
    preview.phase = "running";
    let raf = 0;
    const loop = (time: number) => {
      const rawDt = Math.min(0.05, (time - lastFrameRef.current) / 1000);
      lastFrameRef.current = time;
      if (frozenRef.current) {
        raf = requestAnimationFrame(loop);
        return;
      }
      if (screenRef.current === "playing" && !paused) {
        const onlineSnapshot = networkClient.state.snapshot;
        if (onlineSnapshot && networkClient.state.room?.phase !== "lobby") {
          const inputFrame = input.read();
          sendAccumulatorRef.current += rawDt;
          if (sendAccumulatorRef.current >= 1 / 20) {
            sendAccumulatorRef.current = 0;
            networkClient.sendInput(inputFrame);
          }
          snapshotRef.current = onlineSnapshot;
          renderer.update(onlineSnapshot, networkClient.state.playerId ?? Object.keys(onlineSnapshot.players)[0], rawDt);
          audioRef.current.update(onlineSnapshot.players[networkClient.state.playerId ?? ""], inputFrame.boost);
        } else if (simulationRef.current) {
          stepLocal(rawDt, input.read());
          const snapshot = snapshotRef.current;
          if (snapshot) {
            renderer.update(snapshot, localPlayerIdRef.current, rawDt);
            audioRef.current.update(snapshot.players[localPlayerIdRef.current], input.read().boost);
          }
        }
      } else {
        stepSimulation(preview, {}, FIXED_STEP);
        const snapshot = cloneSnapshot(preview);
        renderer.update(snapshot, "preview", Math.max(FIXED_STEP, rawDt));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const uiTimer = window.setInterval(() => {
      if (snapshotRef.current) setUiSnapshot(cloneSnapshot(snapshotRef.current));
    }, 100);
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(uiTimer);
      input.dispose();
      renderer.dispose();
      rendererRef.current = null;
      inputRef.current = null;
    };
  }, [save, paused, networkClient]);

  const changeScreen = useCallback((next: Screen) => {
    screenRef.current = next;
    setScreen(next);
  }, []);

  const stepLocal = useCallback((dt: number, input: InputFrame) => {
    const simulation = simulationRef.current;
    if (!simulation) return;
    accumulatorRef.current = Math.min(0.25, accumulatorRef.current + dt);
    while (accumulatorRef.current >= FIXED_STEP) {
      stepSimulation(simulation, { [localPlayerIdRef.current]: input }, FIXED_STEP);
      accumulatorRef.current -= FIXED_STEP;
    }
    snapshotRef.current = cloneSnapshot(simulation);
    const importantEvent = simulation.events.find((event) => event.type === "pickup" || event.type === "impact" || event.type === "boss");
    if (importantEvent) {
      setToast(importantEvent.type === "pickup" ? `${importantEvent.detail?.toUpperCase()} SECURED` : importantEvent.type === "boss" ? "REAPER INBOUND" : "HARD IMPACT");
      window.setTimeout(() => setToast(""), 1200);
      if (importantEvent.type === "pickup") audioRef.current.pickup();
      if (importantEvent.type === "impact") audioRef.current.impact();
    }
    if (simulation.phase === "finished" && lastAwardedTickRef.current !== simulation.tick) {
      lastAwardedTickRef.current = simulation.tick;
      showResult(calculateResult(simulation, localPlayerIdRef.current));
    }
  }, []);

  const startLocal = useCallback(
    async (mode = selectedMode, daily = false) => {
      if (!save) return;
      await audioRef.current.unlock(save.settings.masterVolume);
      const entrants = [{ id: "local-player", name: driverName, chassis: save.activeChassis, bot: false }];
      const botCount = mode === "burn-crew" ? 3 : mode === "heat-circuit" || mode === "drift-clash" ? 5 : 0;
      for (let index = 0; index < botCount; index += 1) {
        entrants.push({
          id: `local-bot-${index + 1}`,
          name: ["Ash", "Cinder", "Rook", "Nova", "Torque"][index],
          chassis: (["apex", "warden", "wraith", "vandal"] as ChassisId[])[index % 4],
          bot: true,
        });
      }
      simulationRef.current = createSimulation(mode, daily ? dailySeed() : Math.floor(Date.now() % 2_000_000_000), entrants);
      snapshotRef.current = cloneSnapshot(simulationRef.current);
      accumulatorRef.current = 0;
      lastAwardedTickRef.current = -1;
      setSelectedMode(mode);
      setResult(null);
      resultRef.current = null;
      setPaused(false);
      changeScreen("playing");
    },
    [changeScreen, driverName, save, selectedMode],
  );

  const showResult = useCallback(
    (nextResult: RunResult) => {
      if (resultRef.current) return;
      resultRef.current = nextResult;
      setResult(nextResult);
      if (save && !networkClient.state.result) {
        const nextSave = applyResult(save, nextResult);
        setSave(nextSave);
        void storeRef.current.save(nextSave);
      }
      changeScreen("results");
    },
    [changeScreen, networkClient.state.result, save],
  );

  const openMenu = useCallback(() => {
    setPaused(true);
    changeScreen("menu");
  }, [changeScreen]);

  const connectOnline = useCallback(async () => {
    localStorage.setItem("infernodrift.afterburn.name", driverName);
    const idToken = await storeRef.current.getIdToken();
    networkClient.connect(driverName, idToken);
  }, [driverName, networkClient]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code === "Escape" && screenRef.current === "playing") openMenu();
      if (event.code === "KeyF") {
        if (document.fullscreenElement) void document.exitFullscreen();
        else void document.documentElement.requestFullscreen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openMenu]);

  useEffect(() => {
    window.render_game_to_text = () => {
      const snapshot = snapshotRef.current;
      const playerId = networkClient.state.playerId ?? localPlayerIdRef.current;
      const player = snapshot?.players[playerId] ?? (snapshot ? Object.values(snapshot.players)[0] : null);
      return JSON.stringify({
        coordinateSystem: "x right, y up, z forward; distances in world metres",
        screen: screenRef.current,
        paused,
        online: {
          status: networkClient.state.status,
          roomCode: networkClient.state.room?.code ?? null,
          region: networkClient.state.region,
          ping: networkClient.state.ping,
        },
        mode: snapshot?.mode ?? selectedMode,
        phase: snapshot?.phase ?? "menu",
        district: snapshot ? districtName(snapshot.district) : null,
        elapsed: snapshot ? Number(snapshot.elapsed.toFixed(2)) : 0,
        routeLength: snapshot?.routeLength ?? 0,
        player: player
          ? {
              id: player.id,
              x: Number(player.x.toFixed(2)),
              y: Number(player.y.toFixed(2)),
              z: Number(player.z.toFixed(2)),
              speed: Number(player.speed.toFixed(2)),
              heading: Number(player.heading.toFixed(3)),
              slip: Number(player.slip.toFixed(3)),
              boost: Number(player.boost.toFixed(3)),
              integrity: Number(player.integrity.toFixed(3)),
              heat: Number(player.heat.toFixed(3)),
              cores: player.cores,
              checkpoint: player.checkpoint,
              score: Math.round(player.driftScore),
              downed: player.downed,
              finished: player.finished,
            }
          : null,
        players: snapshot ? Object.values(snapshot.players).map((entry) => ({ id: entry.id, name: entry.name, bot: entry.bot, x: Number(entry.x.toFixed(1)), z: Number(entry.z.toFixed(1)), downed: entry.downed, finished: entry.finished })) : [],
        hunters: snapshot?.hunters.map((hunter) => ({ id: hunter.id, archetype: hunter.archetype, x: Number(hunter.x.toFixed(1)), z: Number(hunter.z.toFixed(1)), targetId: hunter.targetId })) ?? [],
        pickups: snapshot?.pickups.filter((pickup) => pickup.active).slice(0, 12) ?? [],
        hazards: snapshot?.hazards.slice(0, 12) ?? [],
        result: resultRef.current,
      });
    };
    window.advanceTime = (ms: number) => {
      const simulation = simulationRef.current;
      if (!simulation) return;
      const steps = Math.max(1, Math.round(ms / (FIXED_STEP * 1000)));
      const input = inputRef.current?.read() ?? EMPTY_INPUT;
      for (let index = 0; index < steps; index += 1) stepSimulation(simulation, { [localPlayerIdRef.current]: input }, FIXED_STEP);
      snapshotRef.current = cloneSnapshot(simulation);
      setUiSnapshot(cloneSnapshot(simulation));
      rendererRef.current?.update(snapshotRef.current, localPlayerIdRef.current, FIXED_STEP);
    };
    window.__infernodriftTestApi = {
      startLocal: (mode = "burn-run") => void startLocal(mode),
      skipCountdown: () => {
        if (simulationRef.current) {
          simulationRef.current.countdown = 0;
          simulationRef.current.phase = "running";
        }
      },
      freeze: (value) => {
        frozenRef.current = Boolean(value);
      },
      forceFinish: () => {
        const simulation = simulationRef.current;
        if (!simulation) return;
        const player = simulation.players[localPlayerIdRef.current];
        simulation.countdown = 0;
        simulation.phase = "running";
        player.z = simulation.routeLength + 10;
        stepSimulation(simulation, { [player.id]: EMPTY_INPUT }, FIXED_STEP);
        snapshotRef.current = cloneSnapshot(simulation);
        showResult(calculateResult(simulation, player.id));
      },
      setTouch: (patch) => Object.assign(inputRef.current?.touch ?? {}, patch),
      getSnapshot: () => snapshotRef.current,
    };
    return () => {
      delete window.render_game_to_text;
      delete window.advanceTime;
      delete window.__infernodriftTestApi;
    };
  }, [networkClient, paused, selectedMode, showResult, startLocal]);

  if (!save) return <div className="boot-screen">IGNITING AFTERBURN</div>;
  const playerId = network.playerId ?? localPlayerIdRef.current;
  const player = uiSnapshot?.players[playerId] ?? (uiSnapshot ? Object.values(uiSnapshot.players)[0] : null);
  const progress = player && uiSnapshot ? Math.max(0, Math.min(1, player.z / Math.max(1, uiSnapshot.routeLength))) : 0;

  return (
    <main className={`afterburn-app screen-${screen}`}>
      <div ref={hostRef} className="world" aria-label="InfernoDrift Afterburn 3D game canvas" />
      <div className="cinema-grade" aria-hidden="true" />

      {screen === "title" && (
        <section className="title-screen">
          <div className="brand-lockup">
            <p className="kicker">THE ROAD IS ENDING</p>
            <h1><span>INFERNO</span>DRIFT</h1>
            <h2>AFTERBURN</h2>
            <p className="tagline">OUTRUN THE END OF THE ROAD.</p>
          </div>
          <div className="title-actions">
            <button id="start-btn" className="ignition" onClick={() => changeScreen("menu")}>
              <span>IGNITE</span><small>Enter the safehouse</small>
            </button>
            <button id="quick-run-btn" className="quiet-action" onClick={() => void startLocal("burn-run")}>Quick Burn Run</button>
          </div>
          <div className="title-rail"><span>4 chassis</span><span>3 districts</span><span>6-player servers</span></div>
        </section>
      )}

      {screen === "menu" && (
        <section className="menu-shell">
          <header className="menu-header">
            <button className="wordmark" onClick={() => changeScreen("title")}><b>INFERNO</b>DRIFT <em>AFTERBURN</em></button>
            <nav aria-label="Safehouse">
              {(["drive", "garage", "records", "settings"] as Tab[]).map((item) => (
                <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item}</button>
              ))}
            </nav>
            {simulationRef.current && <button className="resume" onClick={() => { setPaused(false); changeScreen("playing"); }}>Resume</button>}
          </header>
          <div className="menu-content">
            {tab === "drive" && (
              <DrivePanel
                selectedMode={selectedMode}
                setSelectedMode={setSelectedMode}
                startLocal={startLocal}
                network={network}
                name={driverName}
                setName={setDriverName}
                roomCode={roomCode}
                setRoomCode={setRoomCode}
                networkClient={networkClient}
                connectOnline={connectOnline}
              />
            )}
            {tab === "garage" && <GaragePanel save={save} setSave={(next) => { setSave(next); void storeRef.current.save(next); networkClient.selectChassis(next.activeChassis); }} />}
            {tab === "records" && <RecordsPanel save={save} />}
            {tab === "settings" && (
              <SettingsPanel
                save={save}
                update={(next) => {
                  setSave(next);
                  void storeRef.current.save(next);
                  rendererRef.current?.setSettings(next.settings);
                  audioRef.current.setVolume(next.settings.masterVolume);
                }}
              />
            )}
          </div>
        </section>
      )}

      {screen === "playing" && player && uiSnapshot && (
        <>
          <div className="run-progress"><i style={{ width: `${progress * 100}%` }} /></div>
          <header className="hud">
            <div className="objective">
              <small>{MODE_DETAILS[uiSnapshot.mode].name} · {districtName(uiSnapshot.district)}</small>
              <strong>{uiSnapshot.phase === "countdown" ? `IGNITION ${Math.ceil(uiSnapshot.countdown)}` : objectiveCopy(uiSnapshot, player)}</strong>
            </div>
            <div className="network-hud">
              <span className={`network-dot ${network.status}`} />
              <b>{network.room ? `${network.ping} ms` : "LOCAL"}</b>
              <small>{network.room?.code ?? "BOT SIM"}</small>
            </div>
          </header>
          <aside className="vitals">
            <div><small>HEAT</small><b>{Math.round(player.heat * 100)}</b><i><u style={{ width: `${player.heat * 100}%` }} /></i></div>
            <div><small>BOOST</small><b>{Math.round(player.boost * 100)}</b><i><u style={{ width: `${player.boost * 100}%` }} /></i></div>
            <div><small>INTEGRITY</small><b>{Math.round(player.integrity * 100)}</b><i><u style={{ width: `${player.integrity * 100}%` }} /></i></div>
          </aside>
          <div className="speedometer"><b>{Math.round(player.speed * 2.28)}</b><small>MPH</small><span>{player.combo > 1.05 ? `×${player.combo.toFixed(1)} DRIFT` : `${player.cores} CORES`}</span></div>
          <button className="pause-button" onClick={openMenu}>MENU</button>
          {toast && <div className="run-toast">{toast}</div>}
          {network.quickMessage && <div className="quick-toast">{network.quickMessage}</div>}
          {network.room && <QuickChat client={networkClient} />}
          <TouchControls input={inputRef.current} />
        </>
      )}

      {screen === "results" && result && (
        <section className="results-screen">
          <p className="kicker">{result.finished ? "EXTRACTION CONFIRMED" : "RUN LOST"}</p>
          <h2>{result.finished ? "YOU BEAT THE BURN." : "THE ROAD TOOK ITS CUT."}</h2>
          <div className="result-line"><span><small>PLACE</small><b>#{result.placement}</b></span><span><small>SCORE</small><b>{result.score.toLocaleString()}</b></span><span><small>TIME</small><b>{formatTime(result.time)}</b></span><span><small>CORES</small><b>{result.cores}</b></span></div>
          <p className="reward-copy">+{result.credits} credits · +{result.reputation} reputation {network.result ? "· server verified" : "· local result"}</p>
          <div className="result-actions">
            <button className="ignition" onClick={() => network.room ? networkClient.rematch() : void startLocal(result.mode)}><span>REMATCH</span><small>Same mode, new line</small></button>
            <button onClick={() => { setResult(null); resultRef.current = null; setTab("garage"); changeScreen("menu"); }}>Garage</button>
          </div>
        </section>
      )}
    </main>
  );
}

function DrivePanel(props: {
  selectedMode: ModeId;
  setSelectedMode: (mode: ModeId) => void;
  startLocal: (mode?: ModeId, daily?: boolean) => Promise<void>;
  network: NetworkState;
  name: string;
  setName: (value: string) => void;
  roomCode: string;
  setRoomCode: (value: string) => void;
  networkClient: MultiplayerClient;
  connectOnline: () => Promise<void>;
}) {
  const mode = MODE_DETAILS[props.selectedMode];
  const multiplayerMode = props.selectedMode === "burn-crew" || props.selectedMode === "heat-circuit" || props.selectedMode === "drift-clash";
  return (
    <div className="drive-layout">
      <div className="mode-list">
        <p className="section-label">Choose the next burn</p>
        {(Object.keys(MODE_DETAILS) as ModeId[]).map((id) => (
          <button key={id} className={props.selectedMode === id ? "selected" : ""} onClick={() => props.setSelectedMode(id)}>
            <span>{MODE_DETAILS[id].eyebrow}</span><b>{MODE_DETAILS[id].name}</b><small>{MODE_DETAILS[id].players}</small>
          </button>
        ))}
      </div>
      <div className="mode-brief">
        <p className="kicker">{mode.eyebrow}</p>
        <h2>{mode.name}</h2>
        <p>{mode.description}</p>
        <div className="mode-actions">
          <button className="ignition" onClick={() => void props.startLocal(props.selectedMode)}><span>DRIVE LOCAL</span><small>Instant bot simulation</small></button>
          <button onClick={() => void props.startLocal(props.selectedMode, true)}>Daily seed</button>
        </div>
        {multiplayerMode && (
          <div className="multiplayer-strip">
            <div className="online-heading"><span className={`network-dot ${props.network.status}`} /><b>AUTHORITATIVE MULTIPLAYER</b><small>{props.network.message}</small></div>
            {props.network.status === "offline" || props.network.status === "error" ? (
              <div className="connect-row">
                <label>Driver name<input value={props.name} maxLength={20} onChange={(event) => props.setName(event.target.value)} /></label>
                <button onClick={() => void props.connectOnline()}>Connect</button>
              </div>
            ) : props.network.room ? (
              <RoomView network={props.network} client={props.networkClient} />
            ) : (
              <div className="connect-row multiplayer-actions">
                <button className="primary-small" onClick={() => props.networkClient.quickPlay(props.selectedMode as Exclude<ModeId, "burn-run" | "wreckyard">)}>Quick play</button>
                <button onClick={() => props.networkClient.createRoom(props.selectedMode as Exclude<ModeId, "burn-run" | "wreckyard">)}>Private room</button>
                <label>Room code<input value={props.roomCode} maxLength={6} onChange={(event) => props.setRoomCode(event.target.value.toUpperCase())} /></label>
                <button onClick={() => props.networkClient.joinRoom(props.roomCode)}>Join</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function RoomView({ network, client }: { network: NetworkState; client: MultiplayerClient }) {
  const self = network.room?.players.find((player) => player.id === network.playerId);
  return (
    <div className="room-view">
      <div><small>ROOM CODE</small><strong>{network.room?.code}</strong></div>
      <div className="room-roster">{network.room?.players.map((player) => <span key={player.id} className={player.ready ? "ready" : ""}>{player.name}{player.bot ? " · BOT" : ""}</span>)}</div>
      {network.room?.phase === "lobby" && <button className="primary-small" onClick={() => client.ready(!self?.ready)}>{self?.ready ? "Stand down" : "Ready up"}</button>}
    </div>
  );
}

function GaragePanel({ save, setSave }: { save: SaveV1; setSave: (save: SaveV1) => void }) {
  return (
    <div className="garage-layout">
      <div><p className="kicker">SAFEHOUSE / GARAGE</p><h2>Pick your weapon.</h2><p>Every chassis changes acceleration, grip, armor, and the shape of a drift. No fake stat bars.</p></div>
      <div className="chassis-list">
        {(Object.keys(CHASSIS) as ChassisId[]).map((id) => {
          const config = CHASSIS[id];
          const unlocked = save.chassis.includes(id);
          return (
            <button key={id} disabled={!unlocked} className={save.activeChassis === id ? "selected" : ""} onClick={() => setSave({ ...save, activeChassis: id })}>
              <i style={{ background: config.color }} /><span><small>{unlocked ? config.tagline : `Unlock at ${id === "apex" ? "1,200" : id === "warden" ? "2,600" : "4,800"} rep`}</small><b>{config.name}</b></span>
              <em>{Math.round(config.topSpeed * 2.28)} mph</em>
            </button>
          );
        })}
      </div>
      <div className="garage-stats"><span><small>Credits</small><b>{save.credits.toLocaleString()}</b></span><span><small>Reputation</small><b>{save.reputation.toLocaleString()}</b></span><span><small>Legacy</small><b>{save.veteran ? "Veteran" : "Rookie"}</b></span></div>
    </div>
  );
}

function RecordsPanel({ save }: { save: SaveV1 }) {
  return (
    <div className="records-layout"><p className="kicker">DRIVER RECORD</p><h2>{save.contractsCompleted} extractions.</h2><div className="record-list">{(Object.keys(MODE_DETAILS) as ModeId[]).map((mode) => <div key={mode}><span>{MODE_DETAILS[mode].name}</span><b>{save.bests[mode] ? formatTime(save.bests[mode]!) : "—"}</b></div>)}</div></div>
  );
}

function SettingsPanel({ save, update }: { save: SaveV1; update: (save: SaveV1) => void }) {
  const settings = save.settings;
  return (
    <div className="settings-layout"><p className="kicker">DRIVE SETUP</p><h2>Make speed readable.</h2>
      <label>Graphics<select value={settings.quality} onChange={(event) => update({ ...save, settings: { ...settings, quality: event.target.value as SaveV1["settings"]["quality"] } })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
      <label>Camera shake<input type="range" min="0" max="1" step="0.05" value={settings.cameraShake} onChange={(event) => update({ ...save, settings: { ...settings, cameraShake: Number(event.target.value) } })} /></label>
      <label>Master volume<input type="range" min="0" max="1" step="0.05" value={settings.masterVolume} onChange={(event) => update({ ...save, settings: { ...settings, masterVolume: Number(event.target.value) } })} /></label>
      <label className="toggle"><input type="checkbox" checked={settings.reducedMotion} onChange={(event) => update({ ...save, settings: { ...settings, reducedMotion: event.target.checked } })} /> Reduced motion</label>
      <p className="control-copy">WASD / arrows steer · Space drift · Shift boost · X jump · R recover · F fullscreen · Esc menu · Gamepads supported</p>
    </div>
  );
}

function TouchControls({ input }: { input: InputController | null }) {
  if (!input) return null;
  const bind = (key: keyof InputController["touch"], value: number | boolean) => ({
    onPointerDown: (event: React.PointerEvent) => { event.currentTarget.setPointerCapture(event.pointerId); (input.touch as unknown as Record<string, number | boolean>)[key] = value; },
    onPointerUp: () => { (input.touch as unknown as Record<string, number | boolean>)[key] = typeof value === "number" ? 0 : false; },
    onPointerCancel: () => { (input.touch as unknown as Record<string, number | boolean>)[key] = typeof value === "number" ? 0 : false; },
  });
  return <div className="touch-controls"><div className="touch-steer"><button {...bind("steer", -1)}>◀</button><button {...bind("throttle", 1)}>▲</button><button {...bind("steer", 1)}>▶</button></div><div className="touch-actions"><button {...bind("drift", true)}>DRIFT</button><button className="boost-touch" {...bind("boost", true)}>BOOST</button><button {...bind("jump", true)}>JUMP</button><button {...bind("recover", true)}>RESET</button></div></div>;
}

function QuickChat({ client }: { client: MultiplayerClient }) {
  return <details className="quick-chat"><summary>COMMS</summary>{QUICK_CHAT.slice(0, 4).map((text) => <button key={text} onClick={() => client.quick(text)}>{text}</button>)}</details>;
}

function objectiveCopy(snapshot: MatchSnapshot, player: MatchSnapshot["players"][string]) {
  if (player.downed) return snapshot.mode === "burn-crew" ? "WAIT FOR CREW REVIVE" : "RECOVERING";
  if (snapshot.mode === "drift-clash") return `${Math.round(player.driftScore).toLocaleString()} · ×${player.combo.toFixed(1)} COMBO`;
  if (snapshot.bossActive) return `BREAK THE REAPER · ${Math.round(snapshot.bossIntegrity)}%`;
  return `GATE ${player.checkpoint + 1} · ${Math.max(0, Math.round(snapshot.routeLength - player.z))} M TO EXTRACTION`;
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${(seconds % 60).toFixed(2).padStart(5, "0")}`;
}
