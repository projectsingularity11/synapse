"use client";
import dynamic from "next/dynamic";
import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Study, Trace } from "@/lib/data";
const Scene = dynamic(() => import("./SpatialScene"), {
  ssr: false,
  loading: () => (
    <p className="spatial-loading">Loading optional spatial renderer…</p>
  ),
});
class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <p className="notice">
        The spatial renderer could not start. The 2D instrument and all research
        data remain available.
      </p>
    ) : (
      this.props.children
    );
  }
}
export function SpatialView({
  study,
  trace,
  time,
}: {
  study: Study;
  trace: Trace;
  time: number;
}) {
  const [enabled, setEnabled] = useState(false);
  const [lost, setLost] = useState(false);
  const [unsupported, setUnsupported] = useState(false);
  const [visible, setVisible] = useState(true);
  const [view, setView] = useState<"oblique" | "front">("oblique");
  const root = useRef<HTMLDivElement>(null);
  const onLost = useCallback(() => setLost(true), []);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "100px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <section ref={root} className="spatial-section">
      <div className="panel-title">
        <span>03 / Space × time</span>
        <span>OPTIONAL WEBGL</span>
      </div>
      <p className="caption">
        Lift the saved detector history into time. Each horizontal layer is one
        Stim time slice; amber cubes are observed events. Layer height is a
        visual metaphor, not a physical dimension. There are no inferred fault
        paths.
      </p>
      <div className="data-links">
        <button
          className="control-button"
          aria-pressed={enabled}
          onClick={() => {
            if (!enabled) {
              const canvas = document.createElement("canvas");
              const gl = canvas.getContext("webgl2");
              setUnsupported(!gl);
              gl?.getExtension("WEBGL_lose_context")?.loseContext();
            }
            setEnabled(!enabled);
            setLost(false);
          }}
        >
          {enabled ? "Close spatial view" : "Open spatial view"}
        </button>
        {enabled && (
          <>
            <button
              className="control-button"
              aria-pressed={view === "oblique"}
              onClick={() => setView("oblique")}
            >
              Oblique camera
            </button>
            <button
              className="control-button"
              aria-pressed={view === "front"}
              onClick={() => setView("front")}
            >
              Front camera
            </button>
          </>
        )}
      </div>
      {enabled &&
        (unsupported ? (
          <p role="status" className="notice">
            WebGL 2 is unavailable. The complete 2D instrument above remains
            usable.
          </p>
        ) : lost ? (
          <p role="status" className="notice">
            WebGL context lost. Close and reopen the spatial view to retry, or
            continue with the 2D view.
          </p>
        ) : (
          <SceneBoundary>
            <div className="spatial-canvas">
              {visible ? (
                <Scene
                  study={study}
                  trace={trace}
                  time={time}
                  onLost={onLost}
                  view={view}
                />
              ) : (
                <p className="spatial-loading">
                  Spatial rendering paused off screen.
                </p>
              )}
            </div>
          </SceneBoundary>
        ))}
      {enabled && (
        <p className="caption">
          Mouse or touch rotation is optional. The camera buttons provide
          keyboard alternatives. Rendering occurs on demand and the canvas is
          removed when off screen. DPR is capped at 1.5; no postprocessing,
          shadows or animation loop.
        </p>
      )}
    </section>
  );
}
