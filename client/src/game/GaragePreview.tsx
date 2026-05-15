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
    scene.background = new THREE.Color(0x09131c);
    const camera = new THREE.PerspectiveCamera(
      55,
      host.clientWidth / host.clientHeight,
      0.1,
      400,
    );
    camera.position.set(0, 12, 34);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(host.clientWidth, host.clientHeight);
    host.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0x93ecff, 0x1d0907, 2.4));
    const light = new THREE.PointLight(0xff6537, 4, 120);
    light.position.set(-20, 20, 20);
    scene.add(light);
    const car = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(9, 2.6, 15),
      new THREE.MeshStandardMaterial({
        color: paint,
        metalness: 0.5,
        roughness: 0.32,
      }),
    );
    body.position.y = 2;
    car.add(body);
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(6, 2.2, 5.5),
      new THREE.MeshStandardMaterial({
        color: 0x101923,
        emissive: new THREE.Color(accent),
        emissiveIntensity: 0.18,
      }),
    );
    cabin.position.set(0, 4, -1);
    car.add(cabin);
    const spoiler = new THREE.Mesh(
      new THREE.BoxGeometry(10, 0.5, 1.2),
      new THREE.MeshBasicMaterial({ color: accent }),
    );
    spoiler.position.set(0, 4.6, 7.4);
    car.add(spoiler);
    for (const x of [-5, 5]) {
      for (const z of [-5.2, 5.2]) {
        const wheel = new THREE.Mesh(
          new THREE.CylinderGeometry(1.8, 1.8, 1.4, 24),
          new THREE.MeshStandardMaterial({
            color: 0x08090b,
            metalness: 0.35,
            roughness: 0.55,
          }),
        );
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, 1, z);
        car.add(wheel);
      }
    }
    car.scale.setScalar(
      CAR_CLASSES[carClass].mass > 1.2
        ? 1.08
        : carClass === "lightweight"
          ? 0.92
          : 1,
    );
    scene.add(car);
    const floor = new THREE.Mesh(
      new THREE.RingGeometry(12, 28, 64),
      new THREE.MeshBasicMaterial({
        color: 0x35e8ff,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
      }),
    );
    floor.rotation.x = Math.PI / 2;
    scene.add(floor);
    let dragStart: number | null = null;
    const pointerDown = (event: PointerEvent) => (dragStart = event.clientX);
    const pointerMove = (event: PointerEvent) => {
      if (dragStart === null) return;
      rotationRef.current += (event.clientX - dragStart) * 0.01;
      dragStart = event.clientX;
    };
    const pointerUp = () => (dragStart = null);
    host.addEventListener("pointerdown", pointerDown);
    window.addEventListener("pointermove", pointerMove);
    window.addEventListener("pointerup", pointerUp);
    let raf = 0;
    const loop = () => {
      rotationRef.current += 0.006;
      car.rotation.y = rotationRef.current;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener("pointerdown", pointerDown);
      window.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("pointerup", pointerUp);
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
