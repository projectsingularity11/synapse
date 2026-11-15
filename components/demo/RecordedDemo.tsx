"use client";
import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Study, Traces } from "@/lib/data";
import { demoChapters, demoFrame, type Decoder } from "@/lib/demo-timeline";
import { DemoScene, type DemoSceneHandle } from "./DemoScene";
import { DemoSidebar } from "./DemoSidebar";
import { useDemoPlayback } from "./useDemoPlayback";
export function RecordedDemo({
  study,
  traces,
}: {
  study: Study;
  traces: Traces;
}) {
  const params = useSearchParams();
  const requestedNoise = Number(params.get("noise")),
    requestedShot = Number(params.get("shot"));
  const requestedDecoder = params.get("decoder");
  const initialSeconds = Math.max(
    0,
    Math.min(24, Number(params.get("at")) || 0),
  );
  const [noise, setNoise] = useState(() =>
      study.conditions.some((c) => c.measurementNoise === requestedNoise)
        ? requestedNoise
        : 0.03,
    ),
    [shot, setShot] = useState(() =>
      params.has("shot") &&
      Number.isInteger(requestedShot) &&
      requestedShot >= 0 &&
      requestedShot < 8
        ? requestedShot
        : 1,
    ),
    [decoder, setDecoder] = useState<Decoder>(() =>
      requestedDecoder === "fixedMatching" ||
      requestedDecoder === "matchedMatching"
        ? requestedDecoder
        : "neural",
    ),
    [layers, setLayers] = useState(true),
    [camera, setCamera] = useState<"oblique" | "front" | "top">("oblique"),
    [zoom, setZoom] = useState(1),
    [copied, setCopied] = useState(false),
    [copyError, setCopyError] = useState(false);
  const sceneRef = useRef<DemoSceneHandle | null>(null),
    workspace = useRef<HTMLDivElement>(null);
  const {
    playing,
    setPlaying,
    position,
    speed,
    setSpeed,
    loop,
    setLoop,
    clockRef,
    sliderRef,
    stampRef,
    seek,
    toggle,
  } = useDemoPlayback(sceneRef, initialSeconds);
  const available = traces.traces.filter((t) => t.measurementNoise === noise),
    trace = available.find((t) => t.shotIndex === shot) || available[0],
    f = demoFrame(position);
  function changeNoise(value: number) {
    setNoise(value);
    setPlaying(false);
    seek(0);
  }
  function changeShot(value: number) {
    setShot(value);
    setPlaying(false);
    seek(0);
  }
  async function share() {
    const url = new URL(location.href);
    url.search = new URLSearchParams({
      noise: String(noise),
      shot: String(trace.shotIndex),
      decoder,
      at: String(Math.floor(clockRef.current)),
    }).toString();
    history.replaceState(null, "", url);
    setCopyError(false);
    try {
      await navigator.clipboard.writeText(url.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      setCopyError(true);
    }
  }
  return (
    <article className="recorded-demo">
      <div className="demo-workspace" ref={workspace}>
        <DemoSidebar
          study={study}
          trace={trace}
          available={available}
          decoder={decoder}
          position={position}
          onNoise={changeNoise}
          onShot={changeShot}
          onDecoder={setDecoder}
        />
        <section
          className="demo-stage"
          aria-label="Recorded three-dimensional demonstration"
        >
          <div className="demo-stage-top">
            <div>
              <span className="demo-live-dot" /> RECORDED SURFACE-CODE MEMORY
            </div>
            <span>Distance 3 · 9 data qubits · 3 rounds</span>
          </div>
          <div className="demo-visual">
            <DemoScene
              study={study}
              trace={trace}
              clockRef={clockRef}
              handleRef={sceneRef}
              layers={layers}
              camera={camera}
              zoom={zoom}
            />
            <div className="demo-camera-tools" aria-label="Camera controls">
              <button
                aria-label="Zoom in"
                onClick={() => setZoom((z) => Math.min(1.5, z + 0.15))}
              >
                +
              </button>
              <button
                aria-label="Zoom out"
                onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
              >
                −
              </button>
              <span />
              <button
                aria-label="Oblique camera"
                aria-pressed={camera === "oblique"}
                onClick={() => setCamera("oblique")}
              >
                ◈
              </button>
              <button
                aria-label="Front camera"
                aria-pressed={camera === "front"}
                onClick={() => setCamera("front")}
              >
                ▣
              </button>
              <button
                aria-label="Top camera"
                aria-pressed={camera === "top"}
                onClick={() => setCamera("top")}
              >
                ▱
              </button>
              <span />
              <button
                aria-label="Expand demo"
                onClick={() => {
                  if (document.fullscreenElement)
                    void document.exitFullscreen();
                  else
                    void workspace.current
                      ?.requestFullscreen?.()
                      .catch(() => {});
                }}
              >
                ⤢
              </button>
            </div>
            <div className="demo-legend">
              <span>
                <i /> Data qubit
              </span>
              <span>
                <i className="demo-orange" /> Detection event
              </span>
              <span>
                <i className="demo-check" /> Check qubit
              </span>
              <label>
                <input
                  type="checkbox"
                  checked={layers}
                  onChange={(e) => setLayers(e.target.checked)}
                />{" "}
                Time layers
              </label>
            </div>
          </div>
          <div className="demo-caption" aria-live="polite">
            <span className="micro">0{f.phase + 1}</span>
            <div>
              <h2>{demoChapters[f.phase].title}</h2>
              <p>
                {f.phase === 2
                  ? `Time slice ${f.slice} of 3 · each elevated layer is a recorded detector slice, not a physical layer.`
                  : demoChapters[f.phase].detail}
              </p>
            </div>
          </div>
          <div className="demo-player">
            <div className="demo-player-main">
              <button
                className="demo-play"
                aria-label={playing ? "Pause demo" : "Play demo"}
                onClick={toggle}
              >
                <svg
                  viewBox="0 0 20 20"
                  width="18"
                  height="18"
                  aria-hidden="true"
                >
                  {playing ? (
                    <path
                      d="M6 4v12M14 4v12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                  ) : (
                    <path d="M5 3l12 7-12 7Z" fill="currentColor" />
                  )}
                </svg>
              </button>
              <button
                aria-label="Restart demo"
                onClick={() => {
                  setPlaying(false);
                  seek(0);
                }}
              >
                ↺
              </button>
              <div className="demo-timeline">
                <output ref={stampRef}>00:00 / 00:24</output>
                <input
                  ref={sliderRef}
                  aria-label="Demo playback position"
                  type="range"
                  min="0"
                  max="24"
                  step=".01"
                  defaultValue={initialSeconds}
                  onChange={(e) => seek(Number(e.target.value))}
                />
              </div>
              <button
                aria-label="Loop demo"
                aria-pressed={loop}
                onClick={() => setLoop(!loop)}
              >
                ↻
              </button>
              <label className="demo-speed">
                <span className="sr-only">Playback speed</span>
                <select
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                >
                  <option value="0.5">0.5×</option>
                  <option value="1">1×</option>
                  <option value="2">2×</option>
                </select>
              </label>
            </div>
            <nav className="demo-chapters" aria-label="Demo chapters">
              {demoChapters.map((c, i) => (
                <button
                  key={c.at}
                  aria-pressed={f.phase === i}
                  onClick={() => seek(c.at)}
                >
                  <span>0{i + 1}</span>
                  {
                    [
                      "Encoding",
                      "Parity checks",
                      "Detector history",
                      "Decoder result",
                    ][i]
                  }
                </button>
              ))}
            </nav>
          </div>
          <div className="demo-bottom-note">
            <span>
              Recorded bits and predictions · encoding/check motion is schematic
              · time is a presentation clock
            </span>
            <button onClick={share}>
              {copied
                ? "Link copied"
                : copyError
                  ? "Link ready in address bar"
                  : "Copy demo link ↗"}
            </button>
          </div>
        </section>
      </div>
      <noscript>
        <p className="notice">
          Interactive playback requires JavaScript. Read the full{" "}
          <a href="/study/paper">research paper</a> or download{" "}
          <a href="/data/traces.json">the recorded traces</a>.
        </p>
      </noscript>
    </article>
  );
}
