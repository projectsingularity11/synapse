import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export type QuantumWorldOptions = {
  canvas: HTMLCanvasElement;
  mode: "hero" | "story";
  detectors: { id: number; coordinates: number[] }[];
  events: number[];
};
/** Original scene; uses Three.js' MIT RoomEnvironment and instancing patterns. */
export function createQuantumWorld({
  canvas,
  mode,
  detectors,
  events,
}: QuantumWorldOptions) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: false,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 1);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.4));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  const scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(37, 1, 0.1, 100);
  camera.position.set(0, 1.4, 13.6);
  camera.lookAt(0, 0, 0);
  const environment = new RoomEnvironment(),
    pmrem = new THREE.PMREMGenerator(renderer),
    env = pmrem.fromScene(environment, 0.04, 0.1, 100, { size: 128 });
  scene.environment = env.texture;
  environment.dispose();
  pmrem.dispose();
  const group = new THREE.Group();
  scene.add(group);
  const fill = new THREE.HemisphereLight(0xffffff, 0x191210, 2.3);
  scene.add(fill);
  const key = new THREE.DirectionalLight(0xfff6eb, 4);
  key.position.set(-4, 6, 5);
  scene.add(key);
  const rim = new THREE.PointLight(0xff3c16, 55, 20, 2);
  rim.position.set(4, 1, -2);
  scene.add(rim);
  const front = new THREE.PointLight(0xff8040, 12, 20, 2);
  front.position.set(-4, -3, 4);
  scene.add(front);
  const sphere = new THREE.SphereGeometry(1, 40, 24),
    body = new THREE.MeshPhysicalMaterial({
      color: 0xf3eee6,
      metalness: 0.48,
      roughness: 0.17,
      clearcoat: 1,
      clearcoatRoughness: 0.18,
      envMapIntensity: 1.6,
    });
  const nodes = new THREE.InstancedMesh(sphere, body, 73);
  nodes.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  group.add(nodes);
  const lightMaterial = new THREE.MeshStandardMaterial({
    color: 0xff4c23,
    metalness: 0.35,
    roughness: 0.2,
    emissive: 0xff2909,
    emissiveIntensity: 0.7,
  });
  const signal = new THREE.InstancedMesh(sphere, lightMaterial, 24);
  signal.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  group.add(signal);
  const matrix = new THREE.Object3D(),
    color = new THREE.Color();
  const wireMaterial = new THREE.LineBasicMaterial({
    color: 0xff6c40,
    transparent: true,
    opacity: 0.24,
  });
  const wireGeometry = new THREE.BufferGeometry();
  const wirePositions = new Float32Array(1200 * 3);
  wireGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(wirePositions, 3).setUsage(
      THREE.DynamicDrawUsage,
    ),
  );
  const wires = new THREE.LineSegments(wireGeometry, wireMaterial);
  group.add(wires);
  const panelGeometry = new THREE.PlaneGeometry(6.9, 6.9),
    panelMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x6c241b,
      metalness: 0.45,
      roughness: 0.25,
      transparent: true,
      opacity: 0.055,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
  const panels = Array.from({ length: 4 }, () => {
    const p = new THREE.Mesh(panelGeometry, panelMaterial);
    group.add(p);
    return p;
  });
  const orbitGeometry = new THREE.TorusGeometry(3.85, 0.008, 6, 160),
    orbitMaterial = new THREE.MeshBasicMaterial({
      color: 0xff5c2e,
      transparent: true,
      opacity: 0.24,
    });
  const orbits = Array.from({ length: 3 }, (_, i) => {
    const o = new THREE.Mesh(orbitGeometry, orbitMaterial);
    o.rotation.set(i * 0.75 + 0.4, i * 0.6, 0.2);
    group.add(o);
    return o;
  });
  const particlesGeometry = new THREE.BufferGeometry(),
    particlePositions = new Float32Array(500 * 3);
  for (let i = 0; i < 500; i++) {
    const a = i * 2.39996323,
      r = 3.7 + (i % 17) * 0.035;
    particlePositions[i * 3] = Math.cos(a) * r;
    particlePositions[i * 3 + 1] = Math.sin(a) * r;
    particlePositions[i * 3 + 2] = Math.sin(i * 0.7) * 1.8;
  }
  particlesGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(particlePositions, 3),
  );
  const particles = new THREE.Points(
    particlesGeometry,
    new THREE.PointsMaterial({
      color: 0xff7042,
      size: 0.017,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    }),
  );
  group.add(particles);
  const start = new Float32Array(73 * 3),
    target = new Float32Array(73 * 3),
    positions = new Float32Array(73 * 3),
    sizes = new Float32Array(73),
    glowing = new Uint8Array(73);
  let phase = -1,
    frameCount = 0;
  function layout(step: number) {
    start.set(positions);
    target.fill(0);
    sizes.fill(0);
    glowing.fill(0);
    if (mode === "hero") {
      for (let i = 0; i < 9; i++) {
        target.set(
          [
            ((i % 3) - 1) * 1.8,
            (Math.floor(i / 3) - 1) * 1.8,
            0.24 + (i === 4 ? 0.2 : 0),
          ],
          i * 3,
        );
        sizes[i] = i === 4 ? 0.57 : 0.43;
        glowing[i] = i === 4 ? 1 : 0;
      }
    } else if (step === 0) {
      for (let i = 0; i < 9; i++) {
        target.set(
          [((i % 3) - 1) * 1.95, (Math.floor(i / 3) - 1) * 1.95, 0],
          i * 3,
        );
        sizes[i] = 0.48;
      }
    } else if (step === 1) {
      for (let i = 0; i < 9; i++) {
        target.set(
          [((i % 3) - 1) * 1.95, (Math.floor(i / 3) - 1) * 1.95, 0],
          i * 3,
        );
        sizes[i] = 0.28;
      }
      const checks = [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
        [-3, 1],
        [3, -1],
        [-1, -3],
        [1, 3],
      ];
      checks.forEach((c, i) => {
        target.set([c[0], c[1], 0.6], (i + 9) * 3);
        sizes[i + 9] = 0.16;
        glowing[i + 9] = i === 2 || i === 5 ? 1 : 0;
      });
    } else if (step === 2) {
      detectors.forEach((d, i) => {
        target.set(
          [
            (d.coordinates[0] - 3) * 0.8,
            (d.coordinates[1] - 3) * 0.8,
            (d.coordinates[2] - 1.5) * 1.6,
          ],
          i * 3,
        );
        sizes[i] = events[d.id] ? 0.19 : 0.11;
        glowing[i] = events[d.id] ? 1 : 0;
      });
    } else {
      const layers = [24, 32, 16, 1];
      let offset = 0;
      layers.forEach((count, l) => {
        for (let i = 0; i < count; i++) {
          const cols = count > 16 ? 4 : count > 1 ? 4 : 1,
            rows = Math.ceil(count / cols);
          target.set(
            [
              (l - 1.5) * 2.15,
              ((i % cols) - (cols - 1) / 2) * 0.64,
              (Math.floor(i / cols) - (rows - 1) / 2) * 0.64,
            ],
            (offset + i) * 3,
          );
          sizes[offset + i] = l === 3 ? 0.42 : 0.105;
          glowing[offset + i] = l === 0 ? events[i] || 0 : l === 3 ? 1 : 0;
        }
        offset += count;
      });
    }
    nodes.count =
      mode === "hero" || step === 0
        ? 9
        : step === 1
          ? 17
          : step === 2
            ? 24
            : 73;
    if (phase === -1) positions.set(target);
    phase = step;
  }
  const chipGeometry = new RoundedBoxGeometry(6.25, 6.25, 0.3, 5, 0.17),
    chipMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x111012,
      metalness: 0.83,
      roughness: 0.19,
      clearcoat: 1,
      envMapIntensity: 1.4,
    });
  const chip = new THREE.Mesh(chipGeometry, chipMaterial);
  chip.position.z = -0.55;
  chip.visible = mode === "hero";
  group.add(chip);
  const rimGeometry = new THREE.EdgesGeometry(
      new THREE.BoxGeometry(6.12, 6.12, 0.15),
    ),
    rimMaterial = new THREE.LineBasicMaterial({
      color: 0xba6039,
      transparent: true,
      opacity: 0.65,
    });
  const chipRim = new THREE.LineSegments(rimGeometry, rimMaterial);
  chipRim.position.z = -0.34;
  chipRim.visible = mode === "hero";
  group.add(chipRim);
  const socketGeometry = new THREE.TorusGeometry(0.53, 0.025, 8, 44),
    socketMaterial = new THREE.MeshStandardMaterial({
      color: 0x6a3a25,
      metalness: 0.82,
      roughness: 0.26,
    });
  for (let i = 0; i < 9; i++) {
    const socket = new THREE.Mesh(socketGeometry, socketMaterial);
    socket.position.set(
      ((i % 3) - 1) * 1.8,
      (Math.floor(i / 3) - 1) * 1.8,
      -0.22,
    );
    socket.visible = mode === "hero";
    group.add(socket);
  }
  layout(0);
  function line(i: number, j: number, index: number) {
    for (let k = 0; k < 3; k++) {
      wirePositions[index * 6 + k] = positions[i * 3 + k];
      wirePositions[index * 6 + 3 + k] = positions[j * 3 + k];
    }
  }
  const a = new THREE.Vector3(),
    b = new THREE.Vector3();
  function render({
    time,
    progress,
    pointerX,
    pointerY,
    rotation,
    reduced,
    pressed,
  }: {
    time: number;
    progress: number;
    pointerX: number;
    pointerY: number;
    rotation: number;
    reduced: boolean;
    pressed: boolean;
  }) {
    const step = Math.min(3, Math.floor(progress * 4));
    if (phase !== step) layout(step);
    let active = 0;
    for (let i = 0; i < 73; i++) {
      for (let k = 0; k < 3; k++)
        positions[i * 3 + k] +=
          (target[i * 3 + k] - positions[i * 3 + k]) * (reduced ? 1 : 0.13);
      const radius = sizes[i];
      matrix.position.fromArray(positions, i * 3);
      if (mode === "hero" && !reduced)
        matrix.position.z += Math.sin(time * 0.55 + i) * 0.17;
      matrix.scale.setScalar(radius);
      matrix.updateMatrix();
      nodes.setMatrixAt(i, matrix.matrix);
      color.setHex(glowing[i] ? 0x21100d : 0xeee9e3);
      nodes.setColorAt(i, color);
      if (glowing[i] && radius) {
        matrix.scale.setScalar(radius * 1.025);
        matrix.updateMatrix();
        signal.setMatrixAt(active++, matrix.matrix);
      }
    }
    nodes.instanceMatrix.needsUpdate = true;
    if (nodes.instanceColor) nodes.instanceColor.needsUpdate = true;
    signal.count = active;
    signal.instanceMatrix.needsUpdate = true;
    let lines = 0;
    if (mode === "hero" || step < 2) {
      for (let i = 0; i < 9; i++)
        for (let j = i + 1; j < 9; j++) {
          a.fromArray(positions, i * 3);
          b.fromArray(positions, j * 3);
          if (a.distanceTo(b) < (mode === "hero" ? 2.7 : 2.1)) {
            line(i, j, lines++);
          }
        }
    } else if (step === 2) {
      detectors.forEach((d, i) => {
        const j = detectors.findIndex(
          (next) =>
            next.coordinates[0] === d.coordinates[0] &&
            next.coordinates[1] === d.coordinates[1] &&
            next.coordinates[2] === d.coordinates[2] + 1,
        );
        if (j >= 0) {
          line(i, j, lines++);
        }
      });
    } else {
      for (let i = 0; i < 24; i += 2)
        for (let j = 24; j < 56; j += 8) {
          line(i, j, lines++);
        }
      for (let i = 24; i < 56; i += 2) {
        const j = 56 + (i % 16);
        line(i, j, lines++);
      }
      for (let i = 56; i < 72; i++) line(i, 72, lines++);
    }
    wireGeometry.setDrawRange(0, lines * 2);
    wireGeometry.attributes.position.needsUpdate = true;
    group.rotation.x = (mode === "hero" ? -0.55 : -0.4) + pointerY * 0.1;
    group.rotation.y =
      (mode === "hero" ? 0.25 : -0.5) +
      rotation +
      pointerX * 0.18 +
      (mode === "hero" && !reduced ? Math.sin(time * 0.1) * 0.12 : 0);
    group.rotation.z = mode === "hero" ? -0.17 : 0.02;
    panels.forEach((p, i) => {
      p.visible = mode === "story" && step === 2;
      p.position.z = (i - 1.5) * 1.6;
    });
    orbits.forEach((o, i) => {
      o.visible = mode === "hero" && i === 0;
      if (!reduced) o.rotation.z = time * 0.025 * (i % 2 ? -1 : 1);
    });
    particles.visible = mode === "hero";
    if (!reduced) particles.rotation.z = time * 0.012;
    rim.intensity = pressed ? 85 : 55;
    renderer.render(scene, camera);
    frameCount++;
  }
  function resize(width: number, height: number, quality = 1) {
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.4) * quality);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z =
      width / height < 0.9 ? 17 : mode === "hero" ? 13.3 : 14.5;
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }
  function dispose() {
    chipGeometry.dispose();
    chipMaterial.dispose();
    rimGeometry.dispose();
    rimMaterial.dispose();
    socketGeometry.dispose();
    socketMaterial.dispose();
    sphere.dispose();
    body.dispose();
    lightMaterial.dispose();
    wireGeometry.dispose();
    wireMaterial.dispose();
    panelGeometry.dispose();
    panelMaterial.dispose();
    orbitGeometry.dispose();
    orbitMaterial.dispose();
    particlesGeometry.dispose();
    (particles.material as THREE.Material).dispose();
    env.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  }
  const projected = new THREE.Vector3();
  function inspect(x: number, y: number) {
    let distance = 0.014,
      result = -1;
    for (let i = 0; i < 73; i++) {
      if (!sizes[i]) continue;
      projected
        .fromArray(positions, i * 3)
        .applyMatrix4(group.matrixWorld)
        .project(camera);
      const d = (projected.x - x) ** 2 + (projected.y - y) ** 2;
      if (d < distance) {
        distance = d;
        result = i;
      }
    }
    return result;
  }
  return {
    render,
    resize,
    dispose,
    inspect,
    get frames() {
      return frameCount;
    },
  };
}
