import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import type { Study, Trace } from "./data";
import { demoFrame, type DemoView } from "./demo-timeline";
export function createDemoWebGL(canvas: HTMLCanvasElement, study: Study) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x17100b, 3));
  const key = new THREE.DirectionalLight(0xfff7eb, 4);
  key.position.set(-5, 10, 4);
  scene.add(key);
  const rim = new THREE.PointLight(0xff6724, 75, 25);
  rim.position.set(6, 4, -4);
  scene.add(rim);
  const boardGeometry = new RoundedBoxGeometry(9, 0.3, 9, 3, 0.12),
    boardMaterial = new THREE.MeshStandardMaterial({
      color: 0x202022,
      metalness: 0.65,
      roughness: 0.3,
    }),
    board = new THREE.Mesh(boardGeometry, boardMaterial);
  board.position.y = -0.4;
  scene.add(board);
  const grid = new THREE.GridHelper(8, 8, 0x6f5844, 0x38322b);
  grid.position.y = -0.23;
  scene.add(grid);
  const sphere = new THREE.SphereGeometry(1, 28, 20),
    material = new THREE.MeshStandardMaterial({
      metalness: 0.35,
      roughness: 0.22,
    });
  const qubits = new THREE.InstancedMesh(sphere, material, study.qubits.length),
    detectors = new THREE.InstancedMesh(sphere, material, 24);
  scene.add(qubits, detectors);
  const planeGeometry = new THREE.PlaneGeometry(8.6, 8.6),
    planeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffa45a,
      transparent: true,
      opacity: 0.035,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
  const planes = Array.from({ length: 4 }, (_, i) => {
    const p = new THREE.Mesh(planeGeometry, planeMaterial);
    p.rotation.x = -Math.PI / 2;
    p.position.y = 0.7 + i * 1.25;
    scene.add(p);
    const edge = new THREE.LineSegments(
      new THREE.EdgesGeometry(planeGeometry),
      new THREE.LineBasicMaterial({
        color: 0xc7b9a5,
        transparent: true,
        opacity: 0.22,
      }),
    );
    edge.rotation.copy(p.rotation);
    edge.position.copy(p.position);
    scene.add(edge);
    return { p, edge };
  });
  const object = new THREE.Object3D(),
    white = new THREE.Color(0xf4eee5),
    orange = new THREE.Color(0xff7d2b),
    quiet = new THREE.Color(0x888582);
  let width = 0,
    height = 0,
    quality = 1;
  return {
    render(v: DemoView, trace: Trace) {
      const w = canvas.clientWidth,
        h = canvas.clientHeight;
      if (w !== width || h !== height) {
        width = w;
        height = h;
        renderer.setSize(w, h, false);
        camera.aspect = w / Math.max(1, h);
        camera.updateProjectionMatrix();
      }
      const f = demoFrame(v.seconds),
        distance = 19 / v.zoom;
      camera.position.set(
        Math.sin(v.yaw) * distance * Math.cos(v.pitch),
        distance * Math.sin(v.pitch) + 2,
        Math.cos(v.yaw) * distance * Math.cos(v.pitch),
      );
      camera.lookAt(0, 1.4, 0);
      study.qubits.forEach((q, i) => {
        object.position.set(q.coordinates[0] - 3, 0, q.coordinates[1] - 3);
        object.scale.setScalar(
          q.role === "measurement" && f.phase === 0
            ? 0
            : q.role === "data"
              ? 0.29
              : 0.18,
        );
        object.updateMatrix();
        qubits.setMatrixAt(i, object.matrix);
        qubits.setColorAt(i, white);
      });
      qubits.instanceMatrix.needsUpdate = true;
      if (qubits.instanceColor) qubits.instanceColor.needsUpdate = true;
      study.detectors.forEach((d, i) => {
        object.position.set(
          d.coordinates[0] - 3,
          0.7 + d.coordinates[2] * 1.25,
          d.coordinates[1] - 3,
        );
        object.scale.setScalar(
          d.coordinates[2] > f.slice
            ? 0
            : trace.detectionEvents[d.id]
              ? 0.17 * (v.reduced ? 1 : 1 + Math.sin(v.seconds * 3) * 0.1)
              : 0.075,
        );
        object.updateMatrix();
        detectors.setMatrixAt(i, object.matrix);
        detectors.setColorAt(i, trace.detectionEvents[d.id] ? orange : quiet);
      });
      detectors.instanceMatrix.needsUpdate = true;
      if (detectors.instanceColor) detectors.instanceColor.needsUpdate = true;
      planes.forEach(({ p, edge }, i) => {
        p.visible = edge.visible = v.layers && i <= f.slice;
      });
      renderer.render(scene, camera);
    },
    lowerQuality() {
      quality = Math.max(0.6, quality - 0.2);
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5) * quality);
    },
    dispose() {
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.LineSegments) {
          o.geometry.dispose();
          const m = o.material;
          (Array.isArray(m) ? m : [m]).forEach((m) => m.dispose());
        }
      });
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
