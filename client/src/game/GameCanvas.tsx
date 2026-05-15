import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { GameState } from "../../../packages/game-core/src";

interface Props {
  game: GameState;
  paint: string;
  accent: string;
}

export function GameCanvas({ game, paint, accent }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const threeRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    car: THREE.Group;
    bots: THREE.Group[];
    ball: THREE.Mesh;
    markers: THREE.Mesh[];
    trails: THREE.Mesh[];
  } | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x071018);
    scene.fog = new THREE.Fog(0x071018, 180, 520);
    const camera = new THREE.PerspectiveCamera(
      65,
      host.clientWidth / host.clientHeight,
      0.1,
      1200,
    );
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.shadowMap.enabled = true;
    host.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight(0x89e9ff, 0x12080a, 2.4);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffd0a0, 2.5);
    sun.position.set(80, 160, -60);
    sun.castShadow = true;
    scene.add(sun);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(260, 96),
      new THREE.MeshStandardMaterial({
        color: 0x121b23,
        roughness: 0.82,
        metalness: 0.15,
      }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(500, 28, 0xff4a1f, 0x23425a);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.34;
    scene.add(grid);

    for (let i = 0; i < 28; i += 1) {
      const angle = (i / 28) * Math.PI * 2;
      const pillar = new THREE.Mesh(
        new THREE.BoxGeometry(5, 18 + (i % 5) * 5, 5),
        new THREE.MeshStandardMaterial({
          color: i % 2 ? 0xff4a1f : 0x35e8ff,
          emissive: i % 2 ? 0x7a1808 : 0x063a44,
          roughness: 0.42,
        }),
      );
      pillar.position.set(
        Math.sin(angle) * 235,
        pillar.geometry.parameters.height / 2,
        Math.cos(angle) * 235,
      );
      scene.add(pillar);
    }

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
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(7, 28, 18),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0x283848,
        roughness: 0.2,
        metalness: 0.4,
      }),
    );
    ball.castShadow = true;
    scene.add(ball);
    const markers = Array.from({ length: 16 }, () => {
      const marker = new THREE.Mesh(
        new THREE.TorusGeometry(12, 1.1, 10, 36),
        new THREE.MeshBasicMaterial({
          color: 0xffd166,
          transparent: true,
          opacity: 0.92,
        }),
      );
      marker.rotation.x = Math.PI / 2;
      scene.add(marker);
      return marker;
    });
    const trails = Array.from({ length: 20 }, (_, index) => {
      const trail = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.4, 10),
        new THREE.MeshBasicMaterial({
          color: index % 2 ? 0xff4a1f : 0x35e8ff,
          transparent: true,
          opacity: 0.15,
        }),
      );
      scene.add(trail);
      return trail;
    });

    const resize = () => {
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(host.clientWidth, host.clientHeight);
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
    };
    return () => {
      window.removeEventListener("resize", resize);
      renderer.dispose();
      host.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    const three = threeRef.current;
    if (!three) return;
    const { renderer, scene, camera, car, bots, ball, markers, trails } = three;
    updateCarMaterial(car, paint, accent);
    car.position.set(game.player.x, game.player.y + 1.2, game.player.z);
    car.rotation.y = game.player.heading;
    game.bots.forEach((bot, index) => {
      const mesh = bots[index];
      if (!mesh) return;
      mesh.visible = true;
      mesh.position.set(bot.x, 1.1, bot.z);
      mesh.rotation.y = bot.heading;
      mesh.scale.setScalar(bot.personality === "boss" ? 1.35 : 0.82);
    });
    bots.slice(game.bots.length).forEach((mesh) => (mesh.visible = false));
    if (game.ball) {
      ball.visible = true;
      ball.position.set(game.ball.x, 7.5, game.ball.z);
    } else {
      ball.visible = false;
    }
    markers.forEach((marker, index) => {
      const data = game.markers[index];
      marker.visible = Boolean(data && data.active && !data.complete);
      if (data) marker.position.set(data.x, 0.6, data.z);
    });
    trails.forEach((trail, index) => {
      const t = index / trails.length;
      trail.position.set(
        game.player.x - Math.sin(game.player.heading) * (8 + index * 2.5),
        0.8,
        game.player.z - Math.cos(game.player.heading) * (8 + index * 2.5),
      );
      trail.rotation.y = game.player.heading;
      trail.scale.set(1 - t * 0.7, 1, 1);
      (trail.material as THREE.MeshBasicMaterial).opacity = Math.max(
        0.04,
        game.player.boost < 0.98 ? 0.3 - t * 0.22 : 0.12 - t * 0.08,
      );
    });
    const speedLean = Math.min(12, Math.abs(game.player.speed) * 0.045);
    const driftLean = Math.min(0.28, Math.max(0, game.combo - 1) * 0.025);
    const camDistance = 34 + speedLean;
    camera.position.set(
      game.player.x - Math.sin(game.player.heading) * camDistance,
      18 + speedLean * 0.32,
      game.player.z - Math.cos(game.player.heading) * camDistance,
    );
    camera.lookAt(
      game.player.x + Math.sin(game.player.heading) * 22,
      4 + driftLean * 10,
      game.player.z + Math.cos(game.player.heading) * 22,
    );
    camera.fov =
      62 +
      (game.player.boost < 0.92 ? 5 : 0) +
      Math.min(4, Math.abs(game.player.speed) * 0.02);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }, [accent, game, paint]);

  return <div ref={hostRef} className="game-canvas" />;
}

function makeCar(primary: string, accent: string, scale = 1) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(7.4, 2.1, 12),
    new THREE.MeshStandardMaterial({
      color: primary,
      roughness: 0.35,
      metalness: 0.45,
    }),
  );
  body.castShadow = true;
  body.position.y = 1.3;
  group.add(body);
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(5.1, 1.8, 4.5),
    new THREE.MeshStandardMaterial({
      color: 0x0f1b24,
      emissive: new THREE.Color(accent),
      emissiveIntensity: 0.15,
      roughness: 0.2,
      metalness: 0.2,
    }),
  );
  cabin.position.set(0, 2.8, -1.4);
  group.add(cabin);
  const spoiler = new THREE.Mesh(
    new THREE.BoxGeometry(8, 0.35, 1.1),
    new THREE.MeshBasicMaterial({ color: accent }),
  );
  spoiler.position.set(0, 3.1, 5.9);
  group.add(spoiler);
  for (const x of [-4.2, 4.2]) {
    for (const z of [-4.2, 4.3]) {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(1.45, 1.45, 1.2, 18),
        new THREE.MeshStandardMaterial({
          color: 0x090a0c,
          roughness: 0.6,
          metalness: 0.2,
        }),
      );
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.7, z);
      group.add(wheel);
    }
  }
  group.scale.setScalar(scale);
  return group;
}

function updateCarMaterial(
  group: THREE.Group,
  primary: string,
  accent: string,
) {
  const body = group.children[0] as THREE.Mesh<
    THREE.BoxGeometry,
    THREE.MeshStandardMaterial
  >;
  const spoiler = group.children[2] as THREE.Mesh<
    THREE.BoxGeometry,
    THREE.MeshBasicMaterial
  >;
  body.material.color.set(primary);
  spoiler.material.color.set(accent);
}
