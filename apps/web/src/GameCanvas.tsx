import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  defaultInput,
  modes,
  type GameMode,
  type InfernoDriftSim,
  type InputFrame,
} from "@infernodrift4/game-core";
import type { Telemetry } from "./types";

type Props = {
  sim: InfernoDriftSim;
  inputRef: React.MutableRefObject<InputFrame>;
  onTelemetry: (telemetry: Telemetry) => void;
};

const modeColors: Record<GameMode, number> = {
  tutorial: 0x73fbd3,
  campaign: 0xff4d2d,
  "max-arena": 0x4ea5ff,
  race: 0xffd166,
  "stunt-park": 0xff7ad9,
  "hunter-tag": 0xff6b35,
  "boss-chase": 0x9d4edd,
  "time-trial": 0xb8f7ff,
  "drift-score": 0xff9f1c,
  "battle-arena": 0xef476f,
  minigame: 0x95ff00,
};

export function GameCanvas({ sim, inputRef, onTelemetry }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, window.innerWidth < 720 ? 1.15 : 1.6),
    );
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x070a10);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x111827, 70, 360);
    const camera = new THREE.PerspectiveCamera(
      64,
      mount.clientWidth / mount.clientHeight,
      0.1,
      650,
    );
    const hemi = new THREE.HemisphereLight(0xdbeafe, 0x111827, 1.35);
    const sun = new THREE.DirectionalLight(0xffd6a5, 1.8);
    sun.position.set(60, 90, 40);
    scene.add(hemi, sun);

    const arena = new THREE.Group();
    scene.add(arena);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(320, 320, 24, 24),
      new THREE.MeshStandardMaterial({
        color: 0x101820,
        metalness: 0.15,
        roughness: 0.75,
      }),
    );
    floor.rotation.x = -Math.PI / 2;
    arena.add(floor);

    const grid = new THREE.GridHelper(320, 32, 0xff4d2d, 0x27364a);
    grid.position.y = 0.02;
    arena.add(grid);

    const walls = new THREE.Group();
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x202c3d,
      emissive: 0x111827,
      roughness: 0.55,
    });
    const wallSpecs: Array<[number, number, number, number]> = [
      [0, -154, 320, 4],
      [0, 154, 320, 4],
      [-154, 0, 4, 320],
      [154, 0, 4, 320],
    ];
    for (const [x, z, sx, sz] of wallSpecs) {
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(sx, 12, sz),
        wallMaterial,
      );
      wall.position.set(x, 6, z);
      walls.add(wall);
    }
    arena.add(walls);

    const rampMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd166,
      emissive: 0x3d2100,
      roughness: 0.45,
    });
    for (let i = 0; i < 8; i++) {
      const ramp = new THREE.Mesh(
        new THREE.BoxGeometry(20, 2, 28),
        rampMaterial,
      );
      ramp.position.set(Math.sin(i * 1.7) * 88, 1, Math.cos(i * 1.7) * 88);
      ramp.rotation.y = i * 0.78;
      ramp.rotation.x = -0.18;
      arena.add(ramp);
    }

    const car = new THREE.Group();
    car.add(
      new THREE.Mesh(
        new THREE.BoxGeometry(4.6, 1.2, 7),
        new THREE.MeshStandardMaterial({
          color: 0xff4d2d,
          emissive: 0x3b0902,
          metalness: 0.35,
          roughness: 0.35,
        }),
      ),
    );
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(3, 1.1, 2.5),
      new THREE.MeshStandardMaterial({
        color: 0x73fbd3,
        emissive: 0x062b2b,
        metalness: 0.2,
        roughness: 0.18,
      }),
    );
    cabin.position.set(0, 1, -0.6);
    car.add(cabin);
    const underglow = new THREE.PointLight(0x73fbd3, 2.4, 20);
    underglow.position.set(0, -0.2, 0);
    car.add(underglow);
    scene.add(car);

    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(4, 24, 16),
      new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        emissive: 0x102040,
        roughness: 0.25,
      }),
    );
    scene.add(ball);

    const botMeshes = new Map<string, THREE.Mesh>();
    const pickupMeshes = new Map<string, THREE.Mesh>();
    const sparks: THREE.Mesh[] = [];
    const sparkMaterial = new THREE.MeshBasicMaterial({
      color: 0xffd166,
      transparent: true,
      opacity: 0.75,
    });
    for (let i = 0; i < 36; i++) {
      const spark = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 8, 6),
        sparkMaterial.clone(),
      );
      spark.visible = false;
      sparks.push(spark);
      scene.add(spark);
    }

    const pressed = new Set<string>();
    const onKeyDown = (event: KeyboardEvent) => {
      pressed.add(event.code);
      if (event.code === "KeyF") void toggleFullscreen(mount);
      if (event.code === "KeyR") sim.startMode(sim.state.mode);
    };
    const onKeyUp = (event: KeyboardEvent) => pressed.delete(event.code);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    let raf = 0;
    let last = performance.now();
    let accumulator = 0;
    let visualTick = 0;

    const animate = (time: number) => {
      const dt = Math.min(0.08, (time - last) / 1000);
      last = time;
      accumulator += dt;
      sampleInput(pressed, inputRef.current);
      sampleGamepad(inputRef.current);
      let steps = 0;
      while (accumulator >= 1 / 60 && steps < 5) {
        sim.step(inputRef.current, 1 / 60);
        accumulator -= 1 / 60;
        steps++;
      }
      updateScene(
        sim,
        scene,
        car,
        ball,
        botMeshes,
        pickupMeshes,
        sparks,
        visualTick++,
      );
      updateCamera(sim, camera, dt);
      renderer.render(scene, camera);
      if (visualTick % 6 === 0) onTelemetry(sim.serialize());
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    const resize = () => {
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [inputRef, onTelemetry, sim]);

  return (
    <div
      className="game-canvas"
      ref={mountRef}
      aria-label="InfernoDrift4 3D gameplay canvas"
    />
  );
}

function sampleInput(pressed: Set<string>, input: InputFrame) {
  const keymap = readKeymap();
  const next = defaultInput();
  next.throttle = hasAny(pressed, keymap.throttle)
    ? 1
    : hasAny(pressed, keymap.reverse)
      ? -0.45
      : 0;
  next.steer =
    (hasAny(pressed, keymap.left) ? -1 : 0) +
    (hasAny(pressed, keymap.right) ? 1 : 0);
  next.drift = hasAny(pressed, keymap.drift);
  next.boost = hasAny(pressed, keymap.boost);
  next.jump = hasAny(pressed, keymap.jump);
  next.brake = hasAny(pressed, keymap.brake);
  Object.assign(input, mergeInput(next, input));
}

function hasAny(pressed: Set<string>, codes: string[]) {
  return codes.some((code) => pressed.has(code));
}

function readKeymap() {
  const fallback = {
    throttle: ["KeyW", "ArrowUp"],
    reverse: ["KeyS", "ArrowDown"],
    left: ["KeyA", "ArrowLeft"],
    right: ["KeyD", "ArrowRight"],
    drift: ["ShiftLeft", "ShiftRight"],
    boost: ["Space"],
    jump: ["KeyX", "KeyB"],
    brake: ["ControlLeft", "ControlRight"],
  };
  try {
    return {
      ...fallback,
      ...JSON.parse(localStorage.getItem("infernodrift4.keymap") ?? "{}"),
    } as typeof fallback;
  } catch {
    return fallback;
  }
}

function sampleGamepad(input: InputFrame) {
  const pad = navigator.getGamepads?.().find(Boolean);
  if (!pad) return;
  input.steer =
    Math.abs(pad.axes[0] ?? 0) > 0.08 ? (pad.axes[0] ?? 0) : input.steer;
  input.throttle = pad.buttons[7]?.pressed
    ? 1
    : pad.buttons[6]?.pressed
      ? -0.45
      : input.throttle;
  input.boost = input.boost || Boolean(pad.buttons[0]?.pressed);
  input.drift = input.drift || Boolean(pad.buttons[1]?.pressed);
  input.jump = input.jump || Boolean(pad.buttons[2]?.pressed);
}

function mergeInput(keyboard: InputFrame, touch: InputFrame): InputFrame {
  return {
    throttle:
      Math.abs(touch.throttle) > Math.abs(keyboard.throttle)
        ? touch.throttle
        : keyboard.throttle,
    steer:
      Math.abs(touch.steer) > Math.abs(keyboard.steer)
        ? touch.steer
        : keyboard.steer,
    drift: keyboard.drift || touch.drift,
    boost: keyboard.boost || touch.boost,
    jump: keyboard.jump || touch.jump,
    brake: keyboard.brake || touch.brake,
  };
}

function updateScene(
  sim: InfernoDriftSim,
  scene: THREE.Scene,
  car: THREE.Group,
  ball: THREE.Mesh,
  botMeshes: Map<string, THREE.Mesh>,
  pickupMeshes: Map<string, THREE.Mesh>,
  sparks: THREE.Mesh[],
  visualTick: number,
) {
  const state = sim.state;
  const color = modeColors[state.mode];
  scene.fog = new THREE.Fog(color, 90, 390);
  car.position.set(state.player.x, state.player.y + 1.1, state.player.z);
  car.rotation.set(
    state.player.airTime * 0.12,
    state.player.heading,
    state.player.driftCombo > 1.2 ? -0.08 : 0,
  );
  ball.visible = ["max-arena", "battle-arena", "minigame"].includes(state.mode);
  ball.position.set(state.ball.x, state.ball.y, state.ball.z);

  for (const bot of state.bots) {
    let mesh = botMeshes.get(bot.id);
    if (!mesh) {
      mesh = new THREE.Mesh(
        new THREE.ConeGeometry(
          bot.role === "boss" ? 5.5 : 3.2,
          bot.role === "boss" ? 8 : 5.5,
          4,
        ),
        new THREE.MeshStandardMaterial({
          color: bot.team === "blue" ? 0x4ea5ff : 0xef476f,
          emissive: bot.role === "boss" ? 0x2b0038 : 0x16040b,
          roughness: 0.4,
        }),
      );
      scene.add(mesh);
      botMeshes.set(bot.id, mesh);
    }
    mesh.position.set(bot.x, bot.role === "boss" ? 4 : 2.7, bot.z);
    mesh.rotation.set(0, bot.heading, 0);
  }
  for (const [id, mesh] of botMeshes) {
    if (!state.bots.some((bot) => bot.id === id)) {
      scene.remove(mesh);
      botMeshes.delete(id);
    }
  }

  for (const pickup of state.pickups) {
    let mesh = pickupMeshes.get(pickup.id);
    if (!mesh) {
      mesh = new THREE.Mesh(
        new THREE.TorusGeometry(2.4, 0.35, 8, 18),
        new THREE.MeshStandardMaterial({
          color:
            pickup.kind === "repair"
              ? 0x95ff00
              : pickup.kind === "xp"
                ? 0xffd166
                : 0x73fbd3,
          emissive: 0x082f2e,
        }),
      );
      scene.add(mesh);
      pickupMeshes.set(pickup.id, mesh);
    }
    mesh.visible = pickup.active;
    mesh.position.set(pickup.x, 2 + Math.sin(pickup.pulse) * 0.35, pickup.z);
    mesh.rotation.set(Math.PI / 2, 0, pickup.pulse);
  }

  for (let i = 0; i < sparks.length; i++) {
    const spark = sparks[i]!;
    const active = state.player.boost > 0 && state.player.speed > 30 && i < 18;
    spark.visible = active;
    if (active) {
      const back = new THREE.Vector3(
        -Math.sin(state.player.heading),
        0,
        -Math.cos(state.player.heading),
      );
      spark.position.set(
        state.player.x + back.x * (4 + (i % 6) * 1.3) + Math.sin(i * 13) * 0.6,
        0.35 + (i % 3) * 0.12,
        state.player.z + back.z * (4 + (i % 6) * 1.3) + Math.cos(i * 7) * 0.6,
      );
      spark.scale.setScalar(1 + Math.sin(visualTick * 0.18 + i) * 0.35);
    }
  }
}

function updateCamera(
  sim: InfernoDriftSim,
  camera: THREE.PerspectiveCamera,
  dt: number,
) {
  const player = sim.state.player;
  const speedRatio = Math.min(1, player.speed / 80);
  const back = new THREE.Vector3(
    -Math.sin(player.heading),
    0,
    -Math.cos(player.heading),
  );
  const target = new THREE.Vector3(
    player.x + Math.sin(player.heading) * 13,
    2.8,
    player.z + Math.cos(player.heading) * 13,
  );
  const desired = new THREE.Vector3(
    player.x + back.x * (19 + speedRatio * 8),
    11 + speedRatio * 4 + player.airTime * 0.4,
    player.z + back.z * (19 + speedRatio * 8),
  );
  if (sim.state.mode === "max-arena") {
    target.lerp(new THREE.Vector3(sim.state.ball.x, 3, sim.state.ball.z), 0.32);
  }
  camera.position.lerp(desired, Math.min(1, dt * 5.5));
  camera.fov +=
    (64 + speedRatio * 8 + (player.boost < 0.95 ? 5 : 0) - camera.fov) *
    Math.min(1, dt * 3);
  camera.updateProjectionMatrix();
  camera.lookAt(target);
}

async function toggleFullscreen(node: HTMLElement) {
  if (!document.fullscreenElement)
    await node.requestFullscreen().catch(() => undefined);
  else await document.exitFullscreen().catch(() => undefined);
}

export const inputDefaults = defaultInput;
export { modes };
