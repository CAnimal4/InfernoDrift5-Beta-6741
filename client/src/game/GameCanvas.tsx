import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { GameState, LandingGrade } from "../../../packages/game-core/src";

interface Props {
  game: GameState;
  paint: string;
  accent: string;
}

type MarkerVisual = THREE.Group & {
  userData: {
    ring: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>;
    pad: THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial>;
    beacon: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshBasicMaterial>;
    ramp: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>;
    chevron: THREE.Mesh<THREE.ConeGeometry, THREE.MeshBasicMaterial>;
  };
};

interface RenderState {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  car: THREE.Group;
  bots: THREE.Group[];
  ball: THREE.Group;
  markers: MarkerVisual[];
  trails: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>[];
  carShadow: THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial>;
  jumpColumn: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshBasicMaterial>;
  landingRing: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  cameraPosition: THREE.Vector3;
  cameraLook: THREE.Vector3;
  lastHeading: number | null;
  lastElapsed: number | null;
  turnVelocity: number;
  lastLandings: number | null;
  landingPulseStart: number;
  landingGrade: LandingGrade | null;
}

const ARENA_RADIUS = 260;
const BOOST_COLOR = new THREE.Color(0xff6a2a);
const DRIFT_COLOR = new THREE.Color(0x35e8ff);
const GOLD_COLOR = new THREE.Color(0xffd166);
const PLAYER_VECTOR = new THREE.Vector3();
const CAMERA_TARGET = new THREE.Vector3();
const LOOK_TARGET = new THREE.Vector3();
const FORWARD = new THREE.Vector3();
const RIGHT = new THREE.Vector3();

export function GameCanvas({ game, paint, accent }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const threeRef = useRef<RenderState | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050b12);
    scene.fog = new THREE.Fog(0x050b12, 170, 560);
    const camera = new THREE.PerspectiveCamera(
      64,
      host.clientWidth / host.clientHeight,
      0.1,
      1200,
    );
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    host.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight(0x9eefff, 0x170808, 2.15);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffd0a0, 3.2);
    sun.position.set(90, 175, -80);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 20;
    sun.shadow.camera.far = 420;
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0x35e8ff, 1.35);
    rim.position.set(-120, 70, 110);
    scene.add(rim);
    const emberFill = new THREE.PointLight(0xff5a24, 2.4, 280);
    emberFill.position.set(0, 48, -120);
    scene.add(emberFill);

    buildArena(scene);

    const carShadow = new THREE.Mesh(
      new THREE.CircleGeometry(7.8, 48),
      new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.34,
        depthWrite: false,
      }),
    );
    carShadow.rotation.x = -Math.PI / 2;
    carShadow.position.y = 0.045;
    scene.add(carShadow);

    const jumpColumn = new THREE.Mesh(
      new THREE.CylinderGeometry(1.8, 4.8, 1, 24, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0x35e8ff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    jumpColumn.visible = false;
    scene.add(jumpColumn);

    const landingRing = new THREE.Mesh(
      new THREE.RingGeometry(9, 11.5, 72),
      new THREE.MeshBasicMaterial({
        color: 0xffd166,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    landingRing.rotation.x = -Math.PI / 2;
    landingRing.visible = false;
    scene.add(landingRing);

    const car = makeCar(paint, accent);
    scene.add(car);
    const bots = Array.from({ length: 8 }, (_, index) => {
      const bot = makeCar(
        index % 2 ? "#ff3566" : "#35e8ff",
        index % 2 ? "#ffc857" : "#ffffff",
        0.74,
      );
      scene.add(bot);
      return bot;
    });

    const ball = makeBall();
    scene.add(ball);

    const markers = Array.from({ length: 16 }, () => {
      const marker = makeMarkerVisual();
      scene.add(marker);
      return marker;
    });

    const trails = Array.from({ length: 28 }, (_, index) => {
      const trail = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 0.16, 10),
        new THREE.MeshBasicMaterial({
          color: index % 2 ? BOOST_COLOR : DRIFT_COLOR,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      trail.userData.side = index % 2 ? -1 : 1;
      scene.add(trail);
      return trail;
    });

    const resize = () => {
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", resize);
    threeRef.current = {
      renderer,
      scene,
      camera,
      car,
      bots,
      ball,
      markers,
      trails,
      carShadow,
      jumpColumn,
      landingRing,
      cameraPosition: new THREE.Vector3(0, 24, -44),
      cameraLook: new THREE.Vector3(0, 4, 0),
      lastHeading: null,
      lastElapsed: null,
      turnVelocity: 0,
      lastLandings: null,
      landingPulseStart: -10,
      landingGrade: null,
    };
    resize();
    return () => {
      window.removeEventListener("resize", resize);
      threeRef.current = null;
      disposeObject(scene);
      renderer.dispose();
      host.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    const three = threeRef.current;
    if (!three) return;
    const {
      renderer,
      scene,
      camera,
      car,
      bots,
      ball,
      markers,
      trails,
      carShadow,
      jumpColumn,
      landingRing,
    } = three;
    updateCarMaterial(car, paint, accent);

    const player = game.player;
    const speed = Math.abs(player.speed);
    const speedRatio = clamp(speed / 120, 0, 1);
    const boostActive = player.boost < 0.985 && speed > 22;
    const driftActive = game.combo > 1.12 && !player.airborne && speed > 18;
    const airborne = player.airborne || player.y > 0.06;
    const comboLean = clamp((game.combo - 1) / 5.6, 0, 1);

    car.position.set(player.x, player.y + 1.18, player.z);
    const pitch = airborne ? clamp(-player.vy / 120, -0.34, 0.42) : 0;
    const bodyRoll = clamp(three.turnVelocity * 0.08, -0.18, 0.18);
    car.rotation.set(
      pitch,
      player.heading,
      bodyRoll + (airborne ? Math.sin(game.elapsed * 8) * 0.035 : 0),
      "YXZ",
    );

    carShadow.position.set(player.x, 0.045, player.z);
    const shadowScale = clamp(1 - player.y / 36, 0.46, 1);
    carShadow.scale.set(1.25 / shadowScale, shadowScale, 1);
    carShadow.material.opacity = airborne ? 0.15 + shadowScale * 0.16 : 0.34;

    updateJumpColumn(jumpColumn, player.x, player.z, player.y, airborne);
    updateLandingCue(three, landingRing, game);

    game.bots.forEach((bot, index) => {
      const mesh = bots[index];
      if (!mesh) return;
      mesh.visible = true;
      mesh.position.set(bot.x, 1.12, bot.z);
      mesh.rotation.set(0, bot.heading, 0);
      mesh.scale.setScalar(bot.personality === "boss" ? 1.35 : 0.82);
      const threatPulse =
        bot.team === "red" || bot.team === "hunter"
          ? 0.08 + Math.sin(game.elapsed * 7 + index) * 0.025
          : 0;
      mesh.position.y += threatPulse;
    });
    bots.slice(game.bots.length).forEach((mesh) => (mesh.visible = false));

    if (game.ball) {
      ball.visible = true;
      ball.position.set(game.ball.x, 7.5, game.ball.z);
      ball.rotation.y = game.elapsed * 2.2;
      ball.rotation.x = game.elapsed * 1.3;
      ball.scale.setScalar(1 + Math.sin(game.elapsed * 5) * 0.025);
    } else {
      ball.visible = false;
    }

    markers.forEach((marker, index) => {
      const data = game.markers[index];
      updateMarker(marker, data, game, index);
    });

    updateTrails(
      trails,
      game,
      speedRatio,
      boostActive,
      driftActive,
      player.landingBoost > 0,
    );
    updateCamera(three, game, speedRatio, comboLean);

    renderer.render(scene, camera);
  }, [accent, game, paint]);

  return <div ref={hostRef} className="game-canvas" />;
}

function buildArena(scene: THREE.Scene) {
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(ARENA_RADIUS, 128),
    new THREE.MeshStandardMaterial({
      color: 0x101820,
      emissive: 0x05080b,
      roughness: 0.86,
      metalness: 0.12,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const grid = new THREE.GridHelper(500, 32, 0xff6a2a, 0x2c5368);
  grid.position.y = 0.055;
  const gridMaterial = grid.material as THREE.Material;
  gridMaterial.transparent = true;
  gridMaterial.opacity = 0.22;
  scene.add(grid);

  for (const radius of [74, 124, 176, 226]) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.42, 8, 144),
      new THREE.MeshBasicMaterial({
        color: radius === 176 ? 0xff6a2a : 0x35e8ff,
        transparent: true,
        opacity: radius === 226 ? 0.28 : 0.18,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.12;
    scene.add(ring);
  }

  for (let index = 0; index < 12; index += 1) {
    const line = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.05, ARENA_RADIUS * 1.85),
      new THREE.MeshBasicMaterial({
        color: index % 3 === 0 ? 0xff6a2a : 0x31586a,
        transparent: true,
        opacity: index % 3 === 0 ? 0.18 : 0.1,
        depthWrite: false,
      }),
    );
    line.position.y = 0.08;
    line.rotation.y = (index / 12) * Math.PI;
    scene.add(line);
  }

  const boundary = new THREE.Mesh(
    new THREE.TorusGeometry(ARENA_RADIUS - 7, 1.45, 12, 160),
    new THREE.MeshBasicMaterial({
      color: 0xff6a2a,
      transparent: true,
      opacity: 0.62,
      blending: THREE.AdditiveBlending,
    }),
  );
  boundary.rotation.x = Math.PI / 2;
  boundary.position.y = 1.3;
  scene.add(boundary);

  for (let i = 0; i < 32; i += 1) {
    const angle = (i / 32) * Math.PI * 2;
    const height = 10 + (i % 4) * 4.5;
    const post = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, height, 3.8),
      new THREE.MeshStandardMaterial({
        color: i % 2 ? 0x162b35 : 0x261712,
        emissive: i % 2 ? 0x063a44 : 0x4d1608,
        emissiveIntensity: 0.75,
        roughness: 0.36,
        metalness: 0.28,
      }),
    );
    post.position.set(
      Math.sin(angle) * (ARENA_RADIUS - 24),
      height / 2,
      Math.cos(angle) * (ARENA_RADIUS - 24),
    );
    scene.add(post);
  }

  for (const z of [-224, 224]) {
    const goal = new THREE.Group();
    const color = z < 0 ? 0x35e8ff : 0xff6a2a;
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    for (const x of [-38, 38]) {
      const upright = new THREE.Mesh(new THREE.BoxGeometry(3, 28, 3), material);
      upright.position.set(x, 14, z);
      goal.add(upright);
    }
    const crossbar = new THREE.Mesh(new THREE.BoxGeometry(80, 3, 3), material);
    crossbar.position.set(0, 28, z);
    goal.add(crossbar);
    scene.add(goal);
  }
}

function makeBall() {
  const group = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(7, 32, 20),
    new THREE.MeshStandardMaterial({
      color: 0xf9fbff,
      emissive: 0x283848,
      emissiveIntensity: 0.28,
      roughness: 0.22,
      metalness: 0.42,
    }),
  );
  core.castShadow = true;
  group.add(core);
  const wire = new THREE.Mesh(
    new THREE.SphereGeometry(7.35, 16, 10),
    new THREE.MeshBasicMaterial({
      color: 0x35e8ff,
      transparent: true,
      opacity: 0.26,
      wireframe: true,
      blending: THREE.AdditiveBlending,
    }),
  );
  group.add(wire);
  return group;
}

function makeMarkerVisual(): MarkerVisual {
  const group = new THREE.Group() as MarkerVisual;
  const pad = new THREE.Mesh(
    new THREE.CircleGeometry(13, 56),
    new THREE.MeshBasicMaterial({
      color: 0x35e8ff,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  pad.rotation.x = -Math.PI / 2;
  pad.position.y = 0.1;
  group.add(pad);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(12, 1, 10, 44),
    new THREE.MeshBasicMaterial({
      color: 0xffd166,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
    }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.9;
  group.add(ring);

  const beacon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 2.4, 12, 18, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0xffd166,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  beacon.position.y = 6.2;
  group.add(beacon);

  const ramp = new THREE.Mesh(
    new THREE.BoxGeometry(18, 1.2, 25),
    new THREE.MeshStandardMaterial({
      color: 0x1b2731,
      emissive: 0xff4a1f,
      emissiveIntensity: 0.28,
      roughness: 0.52,
      metalness: 0.2,
    }),
  );
  ramp.rotation.x = -0.28;
  ramp.position.set(0, 0.56, -2);
  ramp.visible = false;
  ramp.castShadow = true;
  ramp.receiveShadow = true;
  group.add(ramp);

  const chevron = new THREE.Mesh(
    new THREE.ConeGeometry(3.2, 8, 3),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    }),
  );
  chevron.rotation.x = Math.PI / 2;
  chevron.position.set(0, 2.1, 0);
  group.add(chevron);

  group.userData = { ring, pad, beacon, ramp, chevron };
  return group;
}

function updateMarker(
  marker: MarkerVisual,
  data: GameState["markers"][number] | undefined,
  game: GameState,
  index: number,
) {
  marker.visible = Boolean(data && data.active && !data.complete);
  if (!data) return;
  const { ring, pad, beacon, ramp, chevron } = marker.userData;
  marker.position.set(data.x, 0, data.z);
  const radiusScale = clamp(data.radius / 14, 0.85, 2.7);
  marker.scale.setScalar(radiusScale);
  const pulse = 0.82 + Math.sin(game.elapsed * 4 + index) * 0.1;
  const color = markerColor(data.kind);
  ring.material.color.set(color);
  pad.material.color.set(color);
  beacon.material.color.set(color);
  chevron.material.color.set(color);
  ring.material.opacity = 0.62 + pulse * 0.24;
  pad.material.opacity = data.kind === "zone" ? 0.3 : 0.16;
  beacon.material.opacity = 0.12 + pulse * 0.08;
  ring.rotation.z = game.elapsed * 1.5 + index;
  beacon.scale.y = data.kind === "hazard" ? 0.65 : 1;
  const rampMode =
    game.mode === "stunt" ||
    game.mode === "ramp-rush" ||
    game.mode === "trick-combo";
  ramp.visible = rampMode && data.kind === "checkpoint";
  ramp.material.emissive.set(color);
  chevron.position.y = ramp.visible ? 4.8 : 2.1 + pulse * 0.5;
  chevron.rotation.z = Math.atan2(
    data.x - game.player.x,
    data.z - game.player.z,
  );
}

function updateTrails(
  trails: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>[],
  game: GameState,
  speedRatio: number,
  boostActive: boolean,
  driftActive: boolean,
  landingBoost: boolean,
) {
  const player = game.player;
  const visible =
    boostActive ||
    driftActive ||
    landingBoost ||
    player.nearMissTimer > 0 ||
    Math.abs(player.speed) > 38;
  const forwardX = Math.sin(player.heading);
  const forwardZ = Math.cos(player.heading);
  const rightX = Math.cos(player.heading);
  const rightZ = -Math.sin(player.heading);
  const baseOpacity =
    (boostActive ? 0.46 : driftActive ? 0.34 : 0.16) *
    (0.35 + speedRatio * 0.9);
  trails.forEach((trail, index) => {
    const t = index / trails.length;
    const side = Number(trail.userData.side ?? 1);
    const distance = 7 + index * (boostActive ? 3.2 : 2.45);
    const sideOffset = side * (3.6 + Math.sin(game.elapsed * 9 + index) * 0.35);
    trail.visible =
      visible && index < (boostActive ? 28 : driftActive ? 22 : 14);
    trail.position.set(
      player.x - forwardX * distance + rightX * sideOffset,
      0.38 + clamp(player.y, 0, 12) * 0.04,
      player.z - forwardZ * distance + rightZ * sideOffset,
    );
    trail.rotation.y = player.heading + side * (driftActive ? 0.12 : 0.04);
    trail.scale.set(
      0.7 + speedRatio * 0.7 + (driftActive ? 0.45 : 0),
      1,
      0.55 + (boostActive ? 1.15 : 0.45) * (1 - t),
    );
    trail.material.color
      .copy(boostActive || landingBoost ? BOOST_COLOR : DRIFT_COLOR)
      .lerp(GOLD_COLOR, player.nearMissTimer > 0 ? 0.45 : 0);
    trail.material.opacity = trail.visible
      ? Math.max(0, baseOpacity * (1 - t) + player.nearMissTimer * 0.12)
      : 0;
  });
}

function updateJumpColumn(
  column: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshBasicMaterial>,
  x: number,
  z: number,
  y: number,
  airborne: boolean,
) {
  const height = clamp(y, 0, 42);
  column.visible = airborne && height > 1.2;
  if (!column.visible) return;
  column.position.set(x, height / 2, z);
  column.scale.set(1, Math.max(1, height), 1);
  column.material.opacity = clamp(0.24 - height / 180, 0.06, 0.22);
}

function updateLandingCue(
  three: RenderState,
  landingRing: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>,
  game: GameState,
) {
  if (three.lastLandings === null) {
    three.lastLandings = game.stats.landings;
  } else if (game.stats.landings !== three.lastLandings) {
    three.lastLandings = game.stats.landings;
    three.landingPulseStart = game.elapsed;
    three.landingGrade = game.player.lastLanding;
  }
  const age = game.elapsed - three.landingPulseStart;
  const active = age >= 0 && age < 0.7;
  landingRing.visible = active || game.player.landingBoost > 0;
  if (!landingRing.visible) return;
  const grade = three.landingGrade ?? game.player.lastLanding;
  landingRing.position.set(game.player.x, 0.18, game.player.z);
  landingRing.material.color.set(landingColor(grade));
  landingRing.material.opacity =
    active && age < 0.7 ? 0.48 * (1 - age / 0.7) : 0.22;
  const scale = active ? 1 + age * 3.8 : 1.3 + game.player.landingBoost * 1.2;
  landingRing.scale.setScalar(scale);
}

function updateCamera(
  three: RenderState,
  game: GameState,
  speedRatio: number,
  comboLean: number,
) {
  const player = game.player;
  const elapsed = game.elapsed;
  if (three.lastHeading !== null && three.lastElapsed !== null) {
    const dt = Math.max(1 / 120, elapsed - three.lastElapsed);
    const turn = angleDelta(player.heading, three.lastHeading) / dt;
    three.turnVelocity = lerp(three.turnVelocity, clamp(turn, -3.2, 3.2), 0.18);
  }
  three.lastHeading = player.heading;
  three.lastElapsed = elapsed;

  const turnLean = clamp(three.turnVelocity / 3.2, -1, 1);
  FORWARD.set(Math.sin(player.heading), 0, Math.cos(player.heading));
  RIGHT.set(Math.cos(player.heading), 0, -Math.sin(player.heading));
  PLAYER_VECTOR.set(player.x, player.y + 1.6, player.z);
  const airborneLift = clamp(player.y, 0, 34);
  const distance = 38 + speedRatio * 22 + (player.airborne ? 8 : 0);
  const height = 18 + speedRatio * 7 + airborneLift * 0.48;
  const driftOffset = -turnLean * (5 + comboLean * 8);
  const shake = player.nearMissTimer * Math.sin(elapsed * 58) * 1.1;
  CAMERA_TARGET.copy(PLAYER_VECTOR)
    .addScaledVector(FORWARD, -distance)
    .addScaledVector(RIGHT, driftOffset + shake)
    .setY(height + Math.abs(shake) * 0.55);
  LOOK_TARGET.copy(PLAYER_VECTOR)
    .addScaledVector(FORWARD, 24 + speedRatio * 26)
    .addScaledVector(RIGHT, turnLean * (6 + comboLean * 9))
    .setY(4.8 + airborneLift * 0.22 + comboLean * 3);

  const cameraLerp = 0.12 + speedRatio * 0.08 + (player.airborne ? 0.03 : 0);
  if (three.cameraPosition.lengthSq() < 1) {
    three.cameraPosition.copy(CAMERA_TARGET);
    three.cameraLook.copy(LOOK_TARGET);
  } else {
    three.cameraPosition.lerp(CAMERA_TARGET, cameraLerp);
    three.cameraLook.lerp(LOOK_TARGET, 0.18 + speedRatio * 0.07);
  }
  three.camera.position.copy(three.cameraPosition);
  three.camera.lookAt(three.cameraLook);
  three.camera.rotateZ(turnLean * 0.055 + comboLean * 0.018);
  three.camera.fov = lerp(
    three.camera.fov,
    61 +
      speedRatio * 6 +
      (player.boost < 0.92 ? 4.5 : 0) +
      (player.landingBoost > 0 ? 2 : 0),
    0.12,
  );
  three.camera.updateProjectionMatrix();
}

function makeCar(primary: string, accent: string, scale = 1) {
  const group = new THREE.Group();
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: primary,
    roughness: 0.29,
    metalness: 0.56,
  });
  const accentMaterial = new THREE.MeshBasicMaterial({
    color: accent,
    transparent: true,
    opacity: 0.92,
    blending: THREE.AdditiveBlending,
  });
  const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0x0d1b24,
    emissive: new THREE.Color(accent),
    emissiveIntensity: 0.2,
    roughness: 0.16,
    metalness: 0.35,
  });
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(7.8, 2.1, 11.6),
    bodyMaterial,
  );
  body.userData.role = "primary";
  body.castShadow = true;
  body.position.y = 1.35;
  group.add(body);

  const hood = new THREE.Mesh(
    new THREE.BoxGeometry(6.8, 0.46, 4.6),
    bodyMaterial,
  );
  hood.userData.role = "primary";
  hood.position.set(0, 2.62, 2.95);
  hood.castShadow = true;
  group.add(hood);

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(5.3, 1.85, 4.3),
    glassMaterial,
  );
  cabin.userData.role = "glass";
  cabin.position.set(0, 3.02, -1.35);
  cabin.castShadow = true;
  group.add(cabin);

  const stripe = new THREE.Mesh(
    new THREE.BoxGeometry(1.25, 0.08, 11.95),
    accentMaterial,
  );
  stripe.userData.role = "accent";
  stripe.position.set(0, 2.45, 0.18);
  group.add(stripe);

  const frontSplitter = new THREE.Mesh(
    new THREE.BoxGeometry(8.6, 0.34, 0.82),
    accentMaterial,
  );
  frontSplitter.userData.role = "accent";
  frontSplitter.position.set(0, 0.74, 6.05);
  group.add(frontSplitter);

  const spoiler = new THREE.Mesh(
    new THREE.BoxGeometry(8.8, 0.36, 1),
    accentMaterial,
  );
  spoiler.userData.role = "accent";
  spoiler.position.set(0, 3.52, -6.1);
  group.add(spoiler);

  const spoilerStandMaterial = new THREE.MeshStandardMaterial({
    color: 0x101923,
    roughness: 0.38,
    metalness: 0.4,
  });
  for (const x of [-2.8, 2.8]) {
    const stand = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 1.1, 0.34),
      spoilerStandMaterial,
    );
    stand.position.set(x, 2.93, -5.72);
    group.add(stand);
  }

  const headlightMaterial = new THREE.MeshBasicMaterial({
    color: 0xcffaff,
    transparent: true,
    opacity: 0.92,
    blending: THREE.AdditiveBlending,
  });
  const tailMaterial = new THREE.MeshBasicMaterial({
    color: 0xff354d,
    transparent: true,
    opacity: 0.86,
    blending: THREE.AdditiveBlending,
  });
  for (const x of [-2.5, 2.5]) {
    const headlight = new THREE.Mesh(
      new THREE.BoxGeometry(1.45, 0.26, 0.18),
      headlightMaterial,
    );
    headlight.position.set(x, 1.82, 6.18);
    group.add(headlight);
    const tail = new THREE.Mesh(
      new THREE.BoxGeometry(1.35, 0.24, 0.18),
      tailMaterial,
    );
    tail.position.set(x, 1.72, -5.95);
    group.add(tail);
  }

  const tireMaterial = new THREE.MeshStandardMaterial({
    color: 0x07090b,
    roughness: 0.62,
    metalness: 0.18,
  });
  const hubMaterial = new THREE.MeshStandardMaterial({
    color: 0xced7df,
    emissive: new THREE.Color(accent),
    emissiveIntensity: 0.1,
    roughness: 0.28,
    metalness: 0.62,
  });
  for (const x of [-4.25, 4.25]) {
    for (const z of [-4.25, 4.45]) {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(1.48, 1.48, 1.2, 22),
        tireMaterial,
      );
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.76, z);
      wheel.castShadow = true;
      group.add(wheel);
      const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.72, 0.72, 1.28, 16),
        hubMaterial,
      );
      hub.rotation.z = Math.PI / 2;
      hub.position.set(x, 0.76, z);
      group.add(hub);
    }
  }

  const underglow = new THREE.Mesh(
    new THREE.BoxGeometry(6.8, 0.1, 8.8),
    new THREE.MeshBasicMaterial({
      color: accent,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  underglow.userData.role = "accent-dim";
  underglow.position.set(0, 0.22, 0);
  group.add(underglow);

  group.scale.setScalar(scale);
  return group;
}

function updateCarMaterial(
  group: THREE.Group,
  primary: string,
  accent: string,
) {
  group.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const role = child.userData.role;
    const material = child.material;
    if (Array.isArray(material)) return;
    if (role === "primary" && "color" in material) {
      material.color.set(primary);
    }
    if (role === "accent" && "color" in material) {
      material.color.set(accent);
      if ("opacity" in material) material.opacity = 0.92;
    }
    if (role === "accent-dim" && "color" in material) {
      material.color.set(accent);
    }
    if (role === "glass" && material instanceof THREE.MeshStandardMaterial) {
      material.emissive.set(accent);
    }
  });
}

function markerColor(kind: GameState["markers"][number]["kind"]) {
  if (kind === "target") return 0xff6a2a;
  if (kind === "zone") return 0xffd166;
  if (kind === "hazard") return 0xff3158;
  if (kind === "gate") return 0xf7fbff;
  return 0x35e8ff;
}

function landingColor(grade: LandingGrade | null) {
  if (grade === "inferno") return 0xff6a2a;
  if (grade === "perfect") return 0xffd166;
  if (grade === "clean") return 0x35e8ff;
  return 0xff3158;
}

function angleDelta(next: number, previous: number) {
  return Math.atan2(Math.sin(next - previous), Math.cos(next - previous));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function lerp(from: number, to: number, amount: number) {
  return from + (to - from) * amount;
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.geometry.dispose();
    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];
    materials.forEach((material) => material.dispose());
  });
}
