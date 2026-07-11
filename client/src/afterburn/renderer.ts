import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  CHASSIS,
  districtName,
  roadCenter,
  roadWidth,
  type MatchSnapshot,
  type VehicleState,
} from "../../../packages/afterburn-core/src/index";

interface CarVisual {
  root: THREE.Group;
  body: THREE.Mesh<THREE.BoxGeometry, THREE.MeshPhysicalMaterial>;
  wheels: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshStandardMaterial>[];
  brakeLights: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>[];
  glow: THREE.PointLight;
  materials: THREE.MeshStandardMaterial[];
  assetReady: boolean;
}

interface Spark {
  life: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
}

export interface RendererSettings {
  quality: "low" | "medium" | "high";
  reducedMotion: boolean;
  cameraShake: number;
}

export class AfterburnRenderer {
  readonly canvas: HTMLCanvasElement;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly composer: EffectComposer | null;
  private readonly bloom: UnrealBloomPass | null;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(63, 1, 0.1, 1300);
  private readonly cars = new Map<string, CarVisual>();
  private readonly hunters = new Map<string, CarVisual>();
  private readonly pickups = new Map<string, THREE.Group>();
  private readonly hazards = new Map<string, THREE.Object3D>();
  private readonly routeGroup = new THREE.Group();
  private readonly environmentGroup = new THREE.Group();
  private readonly sparkGeometry = new THREE.BufferGeometry();
  private readonly sparkPositions = new Float32Array(240 * 3);
  private readonly sparkPoints: THREE.Points;
  private readonly sparks: Spark[] = [];
  private cameraPosition = new THREE.Vector3(0, 12, -24);
  private cameraLook = new THREE.Vector3(0, 2, 20);
  private lastSnapshot: MatchSnapshot | null = null;
  private lastRouteKey = "";
  private lastImpactTick = -1;
  private shake = 0;
  private readonly textureLoader = new THREE.TextureLoader();
  private readonly asphaltTextures: { map: THREE.Texture; normalMap: THREE.Texture; roughnessMap: THREE.Texture };
  private readonly rockTextures: { map: THREE.Texture; normalMap: THREE.Texture; roughnessMap: THREE.Texture };

  constructor(
    host: HTMLElement,
    private settings: RendererSettings,
  ) {
    this.canvas = document.createElement("canvas");
    this.canvas.className = "afterburn-canvas";
    host.appendChild(this.canvas);
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: settings.quality !== "low",
      powerPreference: "high-performance",
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.shadowMap.enabled = settings.quality !== "low";
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.setPixelRatio(Math.min(settings.quality === "high" ? 1.75 : 1.15, window.devicePixelRatio || 1));

    this.asphaltTextures = this.loadMaterialSet("asphalt", 5, 72);
    this.rockTextures = this.loadMaterialSet("rock", 3, 3);

    this.scene.background = new THREE.Color(0x2a110d);
    this.scene.fog = new THREE.FogExp2(0x2a130f, 0.0034);
    this.scene.add(this.routeGroup, this.environmentGroup);
    this.buildSky();
    this.buildLighting();
    this.buildLavaField();

    this.sparkGeometry.setAttribute("position", new THREE.BufferAttribute(this.sparkPositions, 3));
    this.sparkPoints = new THREE.Points(
      this.sparkGeometry,
      new THREE.PointsMaterial({
        color: 0xffbd48,
        size: 0.22,
        transparent: true,
        opacity: 0.94,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    this.scene.add(this.sparkPoints);

    if (settings.quality === "high") {
      const composer = new EffectComposer(this.renderer);
      composer.addPass(new RenderPass(this.scene, this.camera));
      const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.58, 0.55, 0.84);
      composer.addPass(bloom);
      this.composer = composer;
      this.bloom = bloom;
    } else {
      this.composer = null;
      this.bloom = null;
    }
    this.resize();
    window.addEventListener("resize", this.resize);
  }

  setSettings(settings: RendererSettings) {
    this.settings = settings;
    this.renderer.setPixelRatio(Math.min(settings.quality === "high" ? 1.75 : settings.quality === "medium" ? 1.2 : 1, window.devicePixelRatio || 1));
    this.renderer.shadowMap.enabled = settings.quality !== "low";
    this.resize();
  }

  update(snapshot: MatchSnapshot, localPlayerId: string, dt: number) {
    this.lastSnapshot = snapshot;
    const routeKey = `${snapshot.seed}:${snapshot.mode}`;
    const routeChanged = routeKey !== this.lastRouteKey;
    if (routeChanged) {
      this.lastRouteKey = routeKey;
      this.buildRoute(snapshot);
    }
    this.syncCars(snapshot);
    this.syncHunters(snapshot);
    this.syncPickups(snapshot);
    this.syncHazards(snapshot);
    const local = snapshot.players[localPlayerId] ?? Object.values(snapshot.players)[0];
    if (local) {
      if (routeChanged) this.snapCamera(local);
      this.updateCamera(local, dt);
      this.updateEffects(local, snapshot, dt);
    }
    this.animateEnvironment(snapshot.elapsed);
    this.render();
  }

  renderAttract(time: number) {
    const radius = 64;
    this.camera.position.set(Math.sin(time * 0.08) * radius, 24 + Math.sin(time * 0.14) * 5, -12 + Math.cos(time * 0.08) * radius);
    this.camera.lookAt(0, 2, 65);
    this.animateEnvironment(time);
    this.render();
  }

  dispose() {
    window.removeEventListener("resize", this.resize);
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
        object.geometry?.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material?.dispose());
      }
    });
    this.composer?.dispose();
    Object.values(this.asphaltTextures).forEach((texture) => texture.dispose());
    Object.values(this.rockTextures).forEach((texture) => texture.dispose());
    this.renderer.dispose();
    this.canvas.remove();
  }

  private buildSky() {
    const geometry = new THREE.SphereGeometry(720, 40, 20);
    const material = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        topColor: { value: new THREE.Color(0x34182a) },
        horizonColor: { value: new THREE.Color(0xff713d) },
        bottomColor: { value: new THREE.Color(0x1a0b09) },
      },
      vertexShader: `varying vec3 vWorld; void main(){ vec4 w=modelMatrix*vec4(position,1.0); vWorld=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
      fragmentShader: `
        uniform vec3 topColor; uniform vec3 horizonColor; uniform vec3 bottomColor; varying vec3 vWorld;
        void main(){ float h=normalize(vWorld).y; float sunset=exp(-abs(h)*5.0); vec3 c=mix(bottomColor,topColor,smoothstep(-0.18,0.72,h)); c=mix(c,horizonColor,sunset*0.82); gl_FragColor=vec4(c,1.0); }
      `,
    });
    this.scene.add(new THREE.Mesh(geometry, material));

    const sun = new THREE.Mesh(
      new THREE.CircleGeometry(48, 64),
      new THREE.MeshBasicMaterial({ color: 0xffd08a, fog: false }),
    );
    sun.position.set(-270, 72, 420);
    sun.lookAt(0, 30, 0);
    this.scene.add(sun);
  }

  private buildLighting() {
    const hemisphere = new THREE.HemisphereLight(0xffb277, 0x190b12, 2.15);
    this.scene.add(hemisphere);
    const sun = new THREE.DirectionalLight(0xffd0a0, 4.25);
    sun.position.set(-90, 160, -80);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -85;
    sun.shadow.camera.right = 85;
    sun.shadow.camera.top = 85;
    sun.shadow.camera.bottom = -85;
    sun.shadow.camera.far = 480;
    sun.shadow.bias = -0.0004;
    this.scene.add(sun);
    const rim = new THREE.DirectionalLight(0x38e8ff, 0.72);
    rim.position.set(90, 38, 80);
    this.scene.add(rim);
    const cameraFill = new THREE.PointLight(0xffdfbf, 2.3, 95, 1.6);
    cameraFill.position.set(0, 5, -2);
    this.camera.add(cameraFill);
    this.scene.add(this.camera);
  }

  private buildLavaField() {
    const lava = new THREE.Mesh(
      new THREE.PlaneGeometry(1200, 5200, 1, 1),
      new THREE.MeshStandardMaterial({
        color: 0x2a0704,
        emissive: 0xff2a05,
        emissiveIntensity: 1.35,
        roughness: 0.9,
        metalness: 0.05,
      }),
    );
    lava.rotation.x = -Math.PI / 2;
    lava.position.set(0, -3.4, 1800);
    lava.receiveShadow = false;
    lava.userData.kind = "lava-field";
    this.environmentGroup.add(lava);
  }

  private loadMaterialSet(name: "asphalt" | "rock", repeatX: number, repeatY: number) {
    const load = (suffix: "diff" | "normal" | "rough") => {
      const texture = this.textureLoader.load(`${import.meta.env.BASE_URL}assets/materials/${name}_${suffix}.jpg`);
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(repeatX, repeatY);
      texture.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
      if (suffix === "diff") texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    };
    return { map: load("diff"), normalMap: load("normal"), roughnessMap: load("rough") };
  }

  private buildRoute(snapshot: MatchSnapshot) {
    clearGroup(this.routeGroup);
    clearGroup(this.environmentGroup, (child) => child.userData.kind === "lava-field");
    const mode = snapshot.mode;
    const width = roadWidth(mode);
    const length = snapshot.routeLength;
    const segments = mode === "drift-clash" || mode === "wreckyard" ? 96 : 220;
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    const routeStart = mode === "drift-clash" || mode === "wreckyard" ? -110 : -420;
    const routeSpan = mode === "drift-clash" || mode === "wreckyard" ? 220 : length + 420;
    for (let index = 0; index <= segments; index += 1) {
      const z = routeStart + (index / segments) * routeSpan;
      const center = roadCenter(z, snapshot.seed, mode);
      positions.push(center - width, 0, z, center + width, 0, z);
      uvs.push(0, index / 7, 1, index / 7);
      if (index < segments) {
        const base = index * 2;
        indices.push(base, base + 2, base + 1, base + 1, base + 2, base + 3);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const road = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({
        color: 0x6a625c,
        map: this.asphaltTextures.map,
        normalMap: this.asphaltTextures.normalMap,
        normalScale: new THREE.Vector2(0.72, 0.72),
        roughnessMap: this.asphaltTextures.roughnessMap,
        roughness: 0.9,
        metalness: 0.04,
      }),
    );
    road.receiveShadow = true;
    this.routeGroup.add(road);

    if (mode === "drift-clash" || mode === "wreckyard") this.buildArena(width);
    else this.buildHighwayDetails(snapshot, segments, width);
    this.buildMountains(snapshot.seed);
  }

  private buildHighwayDetails(snapshot: MatchSnapshot, segments: number, width: number) {
    const railGeometry = new THREE.BoxGeometry(1, 1.05, 16);
    const railMaterial = new THREE.MeshStandardMaterial({ color: 0x33373b, metalness: 0.76, roughness: 0.38 });
    const railCount = segments * 2;
    const rails = new THREE.InstancedMesh(railGeometry, railMaterial, railCount);
    rails.castShadow = true;
    rails.receiveShadow = true;
    const markerGeometry = new THREE.BoxGeometry(0.22, 0.08, 8);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xffc05e });
    const markers = new THREE.InstancedMesh(markerGeometry, markerMaterial, segments);
    const dummy = new THREE.Object3D();
    for (let index = 0; index < segments; index += 1) {
      const z = (index / segments) * snapshot.routeLength;
      const nextZ = z + snapshot.routeLength / segments;
      const center = roadCenter(z, snapshot.seed, snapshot.mode);
      const nextCenter = roadCenter(nextZ, snapshot.seed, snapshot.mode);
      const heading = Math.atan2(nextCenter - center, nextZ - z);
      for (const side of [-1, 1]) {
        dummy.position.set(center + side * (width + 1.8), 0.62, z);
        dummy.rotation.set(0, heading, 0);
        dummy.updateMatrix();
        rails.setMatrixAt(index * 2 + (side === 1 ? 1 : 0), dummy.matrix);
      }
      dummy.position.set(center, 0.055, z);
      dummy.rotation.set(0, heading, 0);
      dummy.updateMatrix();
      markers.setMatrixAt(index, dummy.matrix);
    }
    this.routeGroup.add(rails, markers);

    for (let gate = 1; gate <= Math.floor(snapshot.routeLength / 300); gate += 1) {
      const z = gate * 300;
      const center = roadCenter(z, snapshot.seed, snapshot.mode);
      const arch = new THREE.Group();
      const metal = new THREE.MeshStandardMaterial({ color: 0x22292e, metalness: 0.8, roughness: 0.3 });
      const glow = new THREE.MeshBasicMaterial({ color: gate % 2 ? 0x38e8ff : 0xff6a24 });
      for (const side of [-1, 1]) {
        const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.5, 9, 1.5), metal);
        pillar.position.set(side * (width - 3), 4.5, 0);
        pillar.castShadow = true;
        arch.add(pillar);
      }
      const beam = new THREE.Mesh(new THREE.BoxGeometry(width * 2 - 5, 0.7, 0.65), glow);
      beam.position.y = 8.5;
      arch.add(beam);
      arch.position.set(center, 0, z);
      this.routeGroup.add(arch);
    }

    this.populateIndustrialDistrict(snapshot, width);
  }

  private populateIndustrialDistrict(snapshot: MatchSnapshot, width: number) {
    const routeKey = this.lastRouteKey;
    const group = new THREE.Group();
    group.userData.sharedAsset = true;
    this.environmentGroup.add(group);
    const names = ["building-a", "building-f", "building-k", "building-q", "chimney-large", "detail-tank"];
    void Promise.all(names.map(loadEnvironmentModel)).then((models) => {
      if (this.lastRouteKey !== routeKey || !group.parent) return;
      for (let index = 0; index < 42; index += 1) {
        const source = models[index % models.length];
        const model = source.clone(true);
        const z = 90 + index * (snapshot.routeLength / 40);
        const center = roadCenter(z, snapshot.seed, snapshot.mode);
        const side = index % 2 ? 1 : -1;
        const targetHeight = 9 + ((index * 19 + snapshot.seed) % 24);
        const bounds = new THREE.Box3().setFromObject(model);
        const size = bounds.getSize(new THREE.Vector3());
        const scale = targetHeight / Math.max(0.01, size.y);
        model.scale.setScalar(scale);
        const scaled = new THREE.Box3().setFromObject(model);
        const modelCenter = scaled.getCenter(new THREE.Vector3());
        model.position.set(
          center + side * (width + 18 + (index % 4) * 9) - modelCenter.x,
          -scaled.min.y - 3.1,
          z - modelCenter.z,
        );
        model.rotation.y = side < 0 ? 0.28 : Math.PI - 0.28;
        model.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.castShadow = this.settings.quality !== "low";
            object.receiveShadow = true;
          }
        });
        group.add(model);
        if (index % 4 === 0) {
          const beacon = new THREE.PointLight(index % 2 ? 0xff6a2a : 0x76efff, 4.5, 42, 2);
          beacon.position.set(model.position.x, targetHeight * 0.7, model.position.z);
          group.add(beacon);
        }
      }
    });
  }

  private buildArena(width: number) {
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(width, 96),
      new THREE.MeshStandardMaterial({ color: 0x151619, roughness: 0.78, metalness: 0.2 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.02;
    floor.receiveShadow = true;
    this.routeGroup.add(floor);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(width - 2, 1.2, 12, 128),
      new THREE.MeshStandardMaterial({ color: 0x272d31, emissive: 0xff4d1c, emissiveIntensity: 0.55, metalness: 0.8 }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 1;
    this.routeGroup.add(ring);
  }

  private buildMountains(seed: number) {
    const geometry = makeMountainGeometry();
    const material = new THREE.MeshStandardMaterial({
      color: 0x4b342c,
      map: this.rockTextures.map,
      normalMap: this.rockTextures.normalMap,
      normalScale: new THREE.Vector2(0.55, 0.55),
      roughnessMap: this.rockTextures.roughnessMap,
      roughness: 1,
      flatShading: false,
    });
    const mountains = new THREE.InstancedMesh(geometry, material, 90);
    const dummy = new THREE.Object3D();
    for (let index = 0; index < 90; index += 1) {
      const z = -180 + index * 55;
      const side = index % 2 ? 1 : -1;
      const height = 45 + ((index * 37 + seed) % 95);
      dummy.position.set(side * (155 + ((index * 19) % 170)), height / 2 - 4, z);
      dummy.scale.set(20 + (index % 4) * 9, height, 24 + (index % 3) * 12);
      dummy.rotation.y = index * 0.61;
      dummy.updateMatrix();
      mountains.setMatrixAt(index, dummy.matrix);
    }
    mountains.receiveShadow = true;
    this.environmentGroup.add(mountains);
  }

  private syncCars(snapshot: MatchSnapshot) {
    const active = new Set(Object.keys(snapshot.players));
    for (const [id, visual] of this.cars) {
      if (!active.has(id)) {
        this.scene.remove(visual.root);
        this.cars.delete(id);
      }
    }
    for (const vehicle of Object.values(snapshot.players)) {
      let visual = this.cars.get(vehicle.id);
      if (!visual) {
        visual = makeCar(vehicle, false);
        this.cars.set(vehicle.id, visual);
        this.scene.add(visual.root);
      }
      updateCar(visual, vehicle, snapshot.elapsed);
    }
  }

  private syncHunters(snapshot: MatchSnapshot) {
    const active = new Set(snapshot.hunters.map((hunter) => hunter.id));
    for (const [id, visual] of this.hunters) {
      if (!active.has(id)) {
        this.scene.remove(visual.root);
        this.hunters.delete(id);
      }
    }
    for (const hunter of snapshot.hunters) {
      let visual = this.hunters.get(hunter.id);
      if (!visual) {
        const fakeVehicle: VehicleState = {
          ...Object.values(snapshot.players)[0],
          id: hunter.id,
          name: hunter.archetype,
          chassis: hunter.archetype === "reaper" ? "warden" : hunter.archetype === "interceptor" ? "apex" : "vandal",
          team: "cyan",
          bot: true,
          x: hunter.x,
          z: hunter.z,
          heading: hunter.heading,
        };
        visual = makeCar(fakeVehicle, true);
        this.hunters.set(hunter.id, visual);
        this.scene.add(visual.root);
      }
      visual.root.position.set(hunter.x, 0.9, hunter.z);
      visual.root.rotation.y = hunter.heading;
      visual.glow.intensity = hunter.archetype === "reaper" ? 13 : 7;
    }
  }

  private syncPickups(snapshot: MatchSnapshot) {
    for (const pickup of snapshot.pickups) {
      let visual = this.pickups.get(pickup.id);
      if (!visual) {
        visual = makePickup(pickup.kind);
        visual.position.set(pickup.x, 2.2, pickup.z);
        this.pickups.set(pickup.id, visual);
        this.scene.add(visual);
      }
      visual.visible = pickup.active;
      if (pickup.active) {
        visual.rotation.y = snapshot.elapsed * 1.5 + pickup.z;
        visual.position.y = 2.2 + Math.sin(snapshot.elapsed * 2.6 + pickup.z) * 0.38;
      }
    }
  }

  private syncHazards(snapshot: MatchSnapshot) {
    for (const hazard of snapshot.hazards) {
      let visual = this.hazards.get(hazard.id);
      if (!visual) {
        visual = makeHazard(hazard.kind, hazard.radius);
        visual.position.set(hazard.x, hazard.kind === "barrier" ? 1.2 : 0.06, hazard.z);
        this.hazards.set(hazard.id, visual);
        this.scene.add(visual);
      }
      if (hazard.kind === "vent") {
        const active = Math.sin(snapshot.elapsed * 2.4 + hazard.phase) > 0.55;
        visual.scale.y = active ? 2.4 : 0.3;
      }
    }
  }

  private updateCamera(vehicle: VehicleState, dt: number) {
    const forward = new THREE.Vector3(Math.sin(vehicle.heading), 0, Math.cos(vehicle.heading));
    const speedRatio = Math.min(1, vehicle.speed / CHASSIS[vehicle.chassis].topSpeed);
    const wideMobile = this.camera.aspect > 1.95;
    const desired = new THREE.Vector3(vehicle.x, vehicle.y + 7.5 + speedRatio * 2.2 + (wideMobile ? 1.8 : 0), vehicle.z)
      .addScaledVector(forward, -(wideMobile ? 24 : 18) - speedRatio * 9);
    const look = new THREE.Vector3(vehicle.x, vehicle.y + 2.1, vehicle.z).addScaledVector(forward, 20 + speedRatio * 25);
    const response = 1 - Math.exp(-Math.max(2.8, 6.5 - speedRatio * 2.2) * dt);
    this.cameraPosition.lerp(desired, response);
    this.cameraLook.lerp(look, 1 - Math.exp(-7 * dt));
    this.shake *= Math.exp(-8 * dt);
    const shakeAmount = this.settings.reducedMotion ? 0 : this.shake * this.settings.cameraShake;
    this.camera.position.copy(this.cameraPosition).add(
      new THREE.Vector3(
        (Math.random() - 0.5) * shakeAmount,
        (Math.random() - 0.5) * shakeAmount * 0.5,
        (Math.random() - 0.5) * shakeAmount,
      ),
    );
    this.camera.lookAt(this.cameraLook);
    const fov = 61 + speedRatio * 11 + (vehicle.boost < 0.98 && vehicle.speed > 35 ? 4 : 0);
    this.camera.fov += (fov - this.camera.fov) * (1 - Math.exp(-4 * dt));
    this.camera.updateProjectionMatrix();
  }

  private snapCamera(vehicle: VehicleState) {
    const forward = new THREE.Vector3(Math.sin(vehicle.heading), 0, Math.cos(vehicle.heading));
    this.cameraPosition
      .set(vehicle.x, vehicle.y + 9.3, vehicle.z)
      .addScaledVector(forward, -24);
    this.cameraLook
      .set(vehicle.x, vehicle.y + 2.1, vehicle.z)
      .addScaledVector(forward, 24);
    this.camera.position.copy(this.cameraPosition);
    this.camera.lookAt(this.cameraLook);
  }

  private updateEffects(vehicle: VehicleState, snapshot: MatchSnapshot, dt: number) {
    const drifting = vehicle.slip > 0.13 && vehicle.speed > 16 && vehicle.y < 0.1;
    if (drifting && this.sparks.length < 220) {
      const count = this.settings.quality === "low" ? 1 : 3;
      for (let index = 0; index < count; index += 1) {
        this.sparks.push({
          life: 0.35 + Math.random() * 0.5,
          position: new THREE.Vector3(vehicle.x + (Math.random() - 0.5) * 3.6, 0.2, vehicle.z - 2.4),
          velocity: new THREE.Vector3(-vehicle.vx * 0.12 + (Math.random() - 0.5) * 5, 2 + Math.random() * 3, -vehicle.vz * 0.12),
        });
      }
    }
    const impact = snapshot.events.find((event) => event.type === "impact" && event.tick > this.lastImpactTick);
    if (impact) {
      this.lastImpactTick = impact.tick;
      this.shake = Math.min(2.6, this.shake + 1.4);
    }
    for (let index = this.sparks.length - 1; index >= 0; index -= 1) {
      const spark = this.sparks[index];
      spark.life -= dt;
      spark.velocity.y -= 12 * dt;
      spark.position.addScaledVector(spark.velocity, dt);
      if (spark.life <= 0) this.sparks.splice(index, 1);
    }
    this.sparkPositions.fill(9999);
    this.sparks.forEach((spark, index) => {
      this.sparkPositions[index * 3] = spark.position.x;
      this.sparkPositions[index * 3 + 1] = spark.position.y;
      this.sparkPositions[index * 3 + 2] = spark.position.z;
    });
    this.sparkGeometry.attributes.position.needsUpdate = true;
  }

  private animateEnvironment(time: number) {
    for (const child of this.environmentGroup.children) {
      if (child instanceof THREE.PointLight) child.intensity = 5 + Math.sin(time * 2.1 + child.position.z) * 1.6;
      if (child.userData.kind === "lava-field" && child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        child.material.emissiveIntensity = 1.25 + Math.sin(time * 0.8) * 0.18;
      }
    }
  }

  private render() {
    if (this.composer) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
  }

  private resize = () => {
    const parent = this.canvas.parentElement;
    const width = Math.max(1, parent?.clientWidth ?? window.innerWidth);
    const height = Math.max(1, parent?.clientHeight ?? window.innerHeight);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.composer?.setSize(width, height);
    this.bloom?.setSize(width, height);
  };
}

function makeCar(vehicle: VehicleState, hunter: boolean): CarVisual {
  const root = new THREE.Group();
  const config = CHASSIS[vehicle.chassis];
  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: hunter ? 0x111417 : config.color,
    metalness: 0.72,
    roughness: 0.24,
    clearcoat: 0.8,
    clearcoatRoughness: 0.18,
  });
  const body = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.15, 8.4, 2, 1, 4), bodyMaterial);
  body.position.y = 1.3;
  body.castShadow = true;
  root.add(body);
  const hood = new THREE.Mesh(
    new THREE.BoxGeometry(4.15, 0.52, 2.8),
    new THREE.MeshPhysicalMaterial({ color: hunter ? 0x1c1f22 : config.color, metalness: 0.78, roughness: 0.2, clearcoat: 1 }),
  );
  hood.position.set(0, 2, 2.3);
  hood.rotation.x = -0.08;
  hood.castShadow = true;
  root.add(hood);
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(3.45, 1.25, 3.5),
    new THREE.MeshPhysicalMaterial({ color: 0x07121a, metalness: 0.6, roughness: 0.12, transmission: 0.16 }),
  );
  cabin.position.set(0, 2.35, -0.55);
  cabin.castShadow = true;
  root.add(cabin);
  const splitter = new THREE.Mesh(
    new THREE.BoxGeometry(4.8, 0.2, 0.65),
    new THREE.MeshStandardMaterial({ color: 0x0b0c0e, metalness: 0.8, roughness: 0.4 }),
  );
  splitter.position.set(0, 0.82, 4.05);
  root.add(splitter);
  const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x050608, roughness: 0.68, metalness: 0.35 });
  const wheels: CarVisual["wheels"] = [];
  for (const x of [-2.25, 2.25]) {
    for (const z of [-2.55, 2.55]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.82, 0.62, 18), wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.85, z);
      wheel.castShadow = true;
      root.add(wheel);
      wheels.push(wheel);
    }
  }
  const brakeLights: CarVisual["brakeLights"] = [];
  for (const x of [-1.45, 1.45]) {
    const light = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.28, 0.08),
      new THREE.MeshBasicMaterial({ color: hunter ? 0x38e8ff : 0xff2d18 }),
    );
    light.position.set(x, 1.45, -4.23);
    root.add(light);
    brakeLights.push(light);
  }
  const headBar = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 0.18, 0.08),
    new THREE.MeshBasicMaterial({ color: hunter ? 0xff321a : 0xbdf8ff }),
  );
  headBar.position.set(0, 1.42, 4.23);
  root.add(headBar);
  const glow = new THREE.PointLight(hunter ? 0xff331d : config.color, hunter ? 8 : 4.5, 26, 2);
  glow.position.set(0, 0.6, -2.8);
  root.add(glow);
  const visual: CarVisual = {
    root,
    body,
    wheels,
    brakeLights,
    glow,
    materials: [bodyMaterial],
    assetReady: false,
  };
  void attachProfessionalCarModel(visual, vehicle.chassis, hunter);
  return visual;
}

function updateCar(visual: CarVisual, vehicle: VehicleState, elapsed: number) {
  visual.root.visible = !vehicle.downed || Math.sin(elapsed * 8) > -0.1;
  visual.root.position.set(vehicle.x, vehicle.y + 0.08, vehicle.z);
  const roll = -vehicle.steering * Math.min(0.13, vehicle.speed * 0.0022);
  const pitch = vehicle.y > 0 ? Math.max(-0.22, Math.min(0.22, -vehicle.vy * 0.012)) : 0;
  visual.root.rotation.set(pitch, vehicle.heading, roll, "YXZ");
  visual.wheels.forEach((wheel, index) => {
    wheel.rotation.x += vehicle.speed * 0.025;
    if (index >= 2) wheel.rotation.y = vehicle.steering * 0.35;
  });
  visual.materials.forEach((material) => {
    material.emissive.setHex(vehicle.integrity < 0.35 ? 0x360600 : 0x000000);
    material.emissiveIntensity = vehicle.integrity < 0.35 ? 0.6 + Math.sin(elapsed * 8) * 0.2 : 0;
  });
  visual.glow.intensity = vehicle.boost < 0.98 && vehicle.speed > 30 ? 11 : 3.2;
}

const vehicleLoader = new GLTFLoader();
const vehicleModelPromises = new Map<string, Promise<THREE.Group>>();
const environmentModelPromises = new Map<string, Promise<THREE.Group>>();

function attachProfessionalCarModel(visual: CarVisual, chassis: VehicleState["chassis"], hunter: boolean) {
  loadVehicleModel(chassis).then((source) => {
    if (!visual.root.parent && !visual.root.children.length) return;
    const model = source.clone(true);
    const materials: THREE.MeshStandardMaterial[] = [];
    model.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;
      const originals = Array.isArray(object.material) ? object.material : [object.material];
      const replacements = originals.map((original) => {
        const material = original instanceof THREE.MeshStandardMaterial
          ? original.clone()
          : new THREE.MeshStandardMaterial({ color: 0xffffff });
        material.metalness = Math.max(material.metalness, 0.28);
        material.roughness = Math.min(0.68, Math.max(0.24, material.roughness));
        if (hunter) {
          material.color.multiply(new THREE.Color(0x41464c));
          material.emissive.setHex(0x180604);
          material.emissiveIntensity = 0.22;
        }
        materials.push(material);
        return material;
      });
      object.material = Array.isArray(object.material) ? replacements : replacements[0];
    });
    const bounds = new THREE.Box3().setFromObject(model);
    const size = bounds.getSize(new THREE.Vector3());
    const longAxis = Math.max(size.x, size.z);
    const scale = 8.3 / Math.max(0.01, longAxis);
    model.scale.setScalar(scale);
    const scaledBounds = new THREE.Box3().setFromObject(model);
    const center = scaledBounds.getCenter(new THREE.Vector3());
    model.position.set(-center.x, -scaledBounds.min.y + 0.1, -center.z);
    if (size.x > size.z) model.rotation.y = Math.PI / 2;
    visual.body.visible = false;
    visual.wheels.forEach((wheel) => { wheel.visible = false; });
    visual.brakeLights.forEach((light) => { light.visible = false; });
    visual.root.add(model);
    visual.materials.push(...materials);
    visual.assetReady = true;
  }).catch(() => {
    visual.assetReady = false;
  });
}

function loadVehicleModel(chassis: VehicleState["chassis"]): Promise<THREE.Group> {
  const cached = vehicleModelPromises.get(chassis);
  if (cached) return cached;
  const promise = vehicleLoader
    .loadAsync(`${import.meta.env.BASE_URL}assets/vehicles/${chassis}.glb`)
    .then((gltf) => gltf.scene);
  vehicleModelPromises.set(chassis, promise);
  return promise;
}

function loadEnvironmentModel(name: string): Promise<THREE.Group> {
  const cached = environmentModelPromises.get(name);
  if (cached) return cached;
  const promise = vehicleLoader
    .loadAsync(`${import.meta.env.BASE_URL}assets/environment/${name}.glb`)
    .then((gltf) => gltf.scene);
  environmentModelPromises.set(name, promise);
  return promise;
}

function makePickup(kind: "core" | "boost" | "repair") {
  const group = new THREE.Group();
  const color = kind === "core" ? 0xff8a28 : kind === "boost" ? 0x38e8ff : 0x7dffac;
  const metal = new THREE.MeshStandardMaterial({ color: 0x34393c, metalness: 0.82, roughness: 0.34 });
  const glow = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 2.1, metalness: 0.35, roughness: 0.2 });
  if (kind === "core") {
    const cell = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 2.15, 12), metal);
    cell.rotation.z = Math.PI / 2;
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.48, 12), glow);
    band.rotation.z = Math.PI / 2;
    group.add(cell, band);
  } else if (kind === "boost") {
    const tank = new THREE.Mesh(new THREE.CapsuleGeometry(0.48, 1.1, 5, 10), metal);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.28, 0.28), glow);
    group.add(tank, stripe);
  } else {
    const caseMesh = new THREE.Mesh(new THREE.BoxGeometry(1.55, 1.08, 1.15), metal);
    const crossA = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.2, 1.18), glow);
    const crossB = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.72, 1.18), glow);
    crossA.position.z = 0.58;
    crossB.position.z = 0.58;
    group.add(caseMesh, crossA, crossB);
  }
  group.traverse((object) => { if (object instanceof THREE.Mesh) object.castShadow = true; });
  group.add(new THREE.PointLight(color, 3.5, 16, 2));
  return group;
}

function makeHazard(kind: "lava" | "barrier" | "vent", radius: number): THREE.Object3D {
  if (kind === "barrier") {
    const barrier = new THREE.Mesh(
      new THREE.BoxGeometry(7, 2.4, 1.4),
      new THREE.MeshStandardMaterial({ color: 0x2f3031, emissive: 0xff561c, emissiveIntensity: 0.35, metalness: 0.7 }),
    );
    barrier.castShadow = true;
    return barrier;
  }
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 28),
    new THREE.MeshBasicMaterial({ color: kind === "lava" ? 0xff3f0a : 0xffbe55, transparent: true, opacity: 0.8 }),
  );
  disc.rotation.x = -Math.PI / 2;
  return disc;
}

function clearGroup(group: THREE.Group, preserve?: (child: THREE.Object3D) => boolean) {
  for (const child of [...group.children]) {
    if (preserve?.(child)) continue;
    group.remove(child);
    if (child.userData.sharedAsset) continue;
    child.traverse((object) => {
      if (object instanceof THREE.Mesh || object instanceof THREE.InstancedMesh) {
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      }
    });
  }
}

function makeMountainGeometry() {
  const ring = 9;
  const positions: number[] = [];
  for (let level = 0; level < 2; level += 1) {
    const y = level === 0 ? 0 : 0.55;
    const radius = level === 0 ? 1 : 0.52;
    for (let index = 0; index < ring; index += 1) {
      const angle = (index / ring) * Math.PI * 2;
      const jitter = 0.83 + ((index * 37 + level * 13) % 21) / 100;
      positions.push(
        Math.cos(angle) * radius * jitter + (level ? 0.08 : 0),
        y + (level ? ((index * 7) % 4) * 0.018 : 0),
        Math.sin(angle) * radius * jitter - (level ? 0.05 : 0),
      );
    }
  }
  const peakIndex = positions.length / 3;
  positions.push(0.12, 1, -0.1);
  const indices: number[] = [];
  for (let index = 0; index < ring; index += 1) {
    const next = (index + 1) % ring;
    indices.push(index, next, ring + index, next, ring + next, ring + index);
    indices.push(ring + index, ring + next, peakIndex);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export { districtName };
