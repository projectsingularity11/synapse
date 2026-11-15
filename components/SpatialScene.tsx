"use client";
import { Canvas, useThree } from "@react-three/fiber";
import {
  Instances,
  Instance,
  OrbitControls,
  Line,
  Html,
} from "@react-three/drei";
import { useEffect } from "react";
import type { Study, Trace } from "@/lib/data";
function Lifecycle({ onLost }: { onLost: () => void }) {
  const { gl } = useThree();
  useEffect(() => {
    const node = gl.domElement;
    const lost = (e: Event) => {
      e.preventDefault();
      onLost();
    };
    node.addEventListener("webglcontextlost", lost);
    node.setAttribute("data-context-loss-ready", "true");
    return () => {
      node.removeEventListener("webglcontextlost", lost);
      node.removeAttribute("data-context-loss-ready");
    };
  }, [gl, onLost]);
  return null;
}
export default function SpatialScene({
  study,
  trace,
  time,
  onLost,
  view,
}: {
  study: Study;
  trace: Trace;
  time: number;
  onLost: () => void;
  view: "oblique" | "front";
}) {
  return (
    <Canvas
      key={view}
      frameloop="demand"
      dpr={[1, 1.5]}
      camera={{
        position: view === "front" ? [0, 4, 14] : [10, 8, 12],
        fov: 42,
      }}
      gl={{ antialias: true, powerPreference: "low-power" }}
      fallback={<p>WebGL unavailable. Use the complete 2D view above.</p>}
      aria-label="Optional spatial detector-history view"
    >
      <color attach="background" args={["#15251e"]} />
      <Lifecycle onLost={onLost} />
      <ambientLight intensity={1.5} />
      <directionalLight position={[5, 10, 5]} intensity={2} />
      <Instances limit={24}>
        <boxGeometry args={[0.22, 0.22, 0.22]} />
        <meshStandardMaterial roughness={0.8} />
        {study.detectors.map((d) => (
          <Instance
            key={d.id}
            position={[
              d.coordinates[0] - 3,
              d.coordinates[2] * 1.8 - 2.7,
              d.coordinates[1] - 3,
            ]}
            color={
              trace.detectionEvents[d.id] && d.coordinates[2] <= time
                ? "#e2ae64"
                : "#6c8271"
            }
            scale={
              trace.detectionEvents[d.id] && d.coordinates[2] <= time
                ? 1.8
                : 0.7
            }
          />
        ))}
      </Instances>
      {[0, 1, 2, 3].map((t) => (
        <Line
          key={t}
          points={[
            [-3, t * 1.8 - 2.7, -3],
            [3, t * 1.8 - 2.7, -3],
            [3, t * 1.8 - 2.7, 3],
            [-3, t * 1.8 - 2.7, 3],
            [-3, t * 1.8 - 2.7, -3],
          ]}
          color="#536a5b"
          lineWidth={1}
        />
      ))}
      {[0, 1, 2, 3].map((t) => (
        <Html key={`label-${t}`} position={[-4, t * 1.8 - 2.7, 0]} center>
          <span className="layer-label">
            t = {t}
            <br />
            {t === 0 ? "initial" : t === 3 ? "final" : "interior"}
          </span>
        </Html>
      ))}
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping={false}
        minDistance={9}
        maxDistance={25}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}
