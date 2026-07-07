import { useEffect, useRef } from "react";
import * as THREE from "three";
import { CAR_CLASSES, type CarClassId } from "../../../packages/game-core/src";

export function GaragePreview({
  paint,
  accent,
  carClass,
}: {
  paint: string;
  accent: string;
  carClass: CarClassId;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const rotationRef = useRef(0);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x071018);
    scene.fog = new THREE.Fog(0x071018, 58, 150);
    const camera = new THREE.PerspectiveCamera(
      48,
      host.clientWidth / host.clientHeight,
      0.1,
      400,
    );
    camera.position.set(11, 10.5, 29);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
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

    scene.add(new THREE.HemisphereLight(0x9befff, 0x1d0907, 2.15));
    const key = new THREE.DirectionalLight(0xffd0a0, 2.6);
    key.position.set(28, 42, 26);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);
    const cyanStrip = new THREE.PointLight(0x35e8ff, 3.4, 120);
    cyanStrip.position.set(-24, 16, -14);
    scene.add(cyanStrip);
    const emberStrip = new THREE.PointLight(0xff6537, 3.8, 120);
    emberStrip.position.set(24, 14, 20);
    scene.add(emberStrip);

    const car = makeShowcaseCar(paint, accent, carClass);
    scene.add(car);
    const platform = makeShowroomPlatform(accent);
    scene.add(platform);
    const backdrop = makeBackdrop();
    scene.add(backdrop);

    let dragStart: number | null = null;
    let dragVelocity = 0;
    const pointerDown = (event: PointerEvent) => {
      dragStart = event.clientX;
      host.setPointerCapture?.(event.pointerId);
    };
    const pointerMove = (event: PointerEvent) => {
      if (dragStart === null) return;
      const delta = event.clientX - dragStart;
      rotationRef.current += delta * 0.01;
      dragVelocity = delta * 0.0016;
      dragStart = event.clientX;
    };
    const pointerUp = (event: PointerEvent) => {
      dragStart = null;
      dragVelocity *= 0.6;
      host.releasePointerCapture?.(event.pointerId);
    };
    host.addEventListener("pointerdown", pointerDown);
    host.addEventListener("pointermove", pointerMove);
    host.addEventListener("pointerup", pointerUp);
    host.addEventListener("pointercancel", pointerUp);

    const resize = () => {
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", resize);
    resize();

    let raf = 0;
    let lastFrame = performance.now();
    let elapsedTime = 0;
    const loop = () => {
      const now = performance.now();
      const dt = Math.min(0.033, (now - lastFrame) / 1000);
      lastFrame = now;
      elapsedTime += dt;
      rotationRef.current += 0.32 * dt + dragVelocity;
      dragVelocity *= 0.92;
      car.rotation.y = rotationRef.current;
      car.position.y = Math.sin(elapsedTime * 1.6) * 0.08;
      platform.rotation.y = -rotationRef.current * 0.12;
      const pulse = 0.78 + Math.sin(elapsedTime * 2.8) * 0.08;
      platform.traverse((child) => {
        if (
          child instanceof THREE.Mesh &&
          child.material instanceof THREE.MeshBasicMaterial
        ) {
          child.material.opacity =
            child.userData.role === "soft-glow" ? 0.12 + pulse * 0.08 : 0.34;
        }
      });
      camera.lookAt(0, 2.6, 0);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener("pointerdown", pointerDown);
      host.removeEventListener("pointermove", pointerMove);
      host.removeEventListener("pointerup", pointerUp);
      host.removeEventListener("pointercancel", pointerUp);
      window.removeEventListener("resize", resize);
      disposeObject(scene);
      renderer.dispose();
      host.removeChild(renderer.domElement);
    };
  }, [accent, carClass, paint]);

  return (
    <div className="garage-preview">
      <div
        ref={hostRef}
        className="garage-canvas"
        aria-label="3D garage preview"
      />
      <p>
        Drag to rotate. {CAR_CLASSES[carClass].label} changes handling and
        silhouette.
      </p>
    </div>
  );
}

function makeShowcaseCar(paint: string, accent: string, carClass: CarClassId) {
  const group = new THREE.Group();
  const spec = CAR_CLASSES[carClass];
  const length =
    carClass === "speed" ? 16.8 : carClass === "bruiser" ? 15.2 : 14.5;
  const width =
    carClass === "bruiser" ? 10.4 : carClass === "lightweight" ? 8.4 : 9.2;
  const bodyHeight = carClass === "stunt" ? 2.45 : 2.65;
  const rideHeight = carClass === "bruiser" ? 2.25 : 2;
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: paint,
    metalness: 0.58,
    roughness: 0.28,
  });
  const accentMaterial = new THREE.MeshBasicMaterial({
    color: accent,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
  });
  const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0x101923,
    emissive: new THREE.Color(accent),
    emissiveIntensity: 0.22,
    metalness: 0.36,
    roughness: 0.18,
  });

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(width, bodyHeight, length),
    bodyMaterial,
  );
  body.position.y = rideHeight;
  body.castShadow = true;
  group.add(body);

  const hood = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.78, 0.5, length * 0.32),
    bodyMaterial,
  );
  hood.position.set(0, rideHeight + bodyHeight * 0.55, length * 0.18);
  hood.castShadow = true;
  group.add(hood);

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.62, 2.15, length * 0.34),
    glassMaterial,
  );
  cabin.position.set(0, rideHeight + 2.2, -length * 0.13);
  cabin.castShadow = true;
  group.add(cabin);

  const stripe = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.14, 0.09, length * 0.98),
    accentMaterial,
  );
  stripe.position.set(0, rideHeight + bodyHeight * 0.63, 0.15);
  group.add(stripe);

  const splitter = new THREE.Mesh(
    new THREE.BoxGeometry(width * 1.06, 0.38, 0.9),
    accentMaterial,
  );
  splitter.position.set(0, rideHeight - 1.17, length * 0.51);
  group.add(splitter);

  const sideGlow = new THREE.Mesh(
    new THREE.BoxGeometry(width * 1.08, 0.1, length * 0.72),
    new THREE.MeshBasicMaterial({
      color: accent,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  sideGlow.position.set(0, 0.32, -0.2);
  group.add(sideGlow);

  const spoiler = new THREE.Mesh(
    new THREE.BoxGeometry(width * 1.08, 0.5, 1.15),
    accentMaterial,
  );
  spoiler.position.set(0, rideHeight + 3.05, -length * 0.52);
  group.add(spoiler);

  const tireMaterial = new THREE.MeshStandardMaterial({
    color: 0x08090b,
    metalness: 0.25,
    roughness: 0.55,
  });
  const hubMaterial = new THREE.MeshStandardMaterial({
    color: 0xd3dce2,
    emissive: new THREE.Color(accent),
    emissiveIntensity: 0.12,
    metalness: 0.65,
    roughness: 0.24,
  });
  const wheelRadius =
    carClass === "bruiser" ? 2.05 : carClass === "lightweight" ? 1.55 : 1.78;
  for (const x of [-width * 0.56, width * 0.56]) {
    for (const z of [-length * 0.35, length * 0.34]) {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(wheelRadius, wheelRadius, 1.45, 28),
        tireMaterial,
      );
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 1.05, z);
      wheel.castShadow = true;
      group.add(wheel);
      const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(
          wheelRadius * 0.46,
          wheelRadius * 0.46,
          1.52,
          18,
        ),
        hubMaterial,
      );
      hub.rotation.z = Math.PI / 2;
      hub.position.copy(wheel.position);
      group.add(hub);
    }
  }

  const headlightMaterial = new THREE.MeshBasicMaterial({
    color: 0xd9fbff,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
  });
  const tailMaterial = new THREE.MeshBasicMaterial({
    color: 0xff354d,
    transparent: true,
    opacity: 0.82,
    blending: THREE.AdditiveBlending,
  });
  for (const x of [-width * 0.28, width * 0.28]) {
    const headlight = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.18, 0.28, 0.2),
      headlightMaterial,
    );
    headlight.position.set(x, rideHeight + 0.08, length * 0.51);
    group.add(headlight);
    const tail = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.16, 0.28, 0.2),
      tailMaterial,
    );
    tail.position.set(x, rideHeight + 0.02, -length * 0.51);
    group.add(tail);
  }

  const massScale =
    spec.mass > 1.2 ? 1.05 : carClass === "lightweight" ? 0.94 : 1;
  group.scale.set(
    massScale * 1.18,
    carClass === "stunt" ? 1.24 : 1.18,
    massScale * 1.18,
  );
  group.rotation.x =
    carClass === "speed" ? -0.025 : carClass === "bruiser" ? 0.018 : 0;
  return group;
}

function makeShowroomPlatform(accent: string) {
  const group = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(18.5, 21, 1.1, 96),
    new THREE.MeshStandardMaterial({
      color: 0x121b23,
      emissive: 0x050b12,
      metalness: 0.38,
      roughness: 0.48,
    }),
  );
  base.position.y = -0.55;
  base.receiveShadow = true;
  group.add(base);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(19.5, 0.38, 10, 144),
    new THREE.MeshBasicMaterial({
      color: accent,
      transparent: true,
      opacity: 0.34,
      blending: THREE.AdditiveBlending,
    }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.userData.role = "hard-glow";
  group.add(ring);

  const glow = new THREE.Mesh(
    new THREE.RingGeometry(7.5, 23, 96),
    new THREE.MeshBasicMaterial({
      color: 0x35e8ff,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = 0.04;
  glow.userData.role = "soft-glow";
  group.add(glow);

  for (let index = 0; index < 10; index += 1) {
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.08, 38),
      new THREE.MeshBasicMaterial({
        color: index % 2 ? 0xff6537 : 0x35e8ff,
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
      }),
    );
    rail.position.y = 0.02;
    rail.rotation.y = (index / 10) * Math.PI;
    rail.userData.role = "soft-glow";
    group.add(rail);
  }
  return group;
}

function makeBackdrop() {
  const group = new THREE.Group();
  for (let index = 0; index < 7; index += 1) {
    const height = 12 + index * 1.6;
    const tower = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, height, 2.2),
      new THREE.MeshBasicMaterial({
        color: index % 2 ? 0xff6537 : 0x35e8ff,
        transparent: true,
        opacity: 0.16,
        blending: THREE.AdditiveBlending,
      }),
    );
    const x = (index - 3) * 8;
    tower.position.set(x, height / 2 - 0.2, -30 - Math.abs(index - 3) * 1.4);
    group.add(tower);
  }
  return group;
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
