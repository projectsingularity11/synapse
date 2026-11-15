"use client";
import { useEffect, useRef, type RefObject } from "react";
import type { Study, Trace } from "@/lib/data";
import { createDemoSvg } from "@/lib/demo-svg";
import type { DemoView } from "@/lib/demo-timeline";
import { useReducedEffects } from "../useReducedEffects";
import { softwareGraphics } from "@/lib/graphics";
export type DemoSceneHandle = { draw: () => void };
export function DemoScene({
  study,
  trace,
  clockRef,
  handleRef,
  layers,
  camera,
  zoom,
}: {
  study: Study;
  trace: Trace;
  clockRef: RefObject<number>;
  handleRef: RefObject<DemoSceneHandle | null>;
  layers: boolean;
  camera: "oblique" | "front" | "top";
  zoom: number;
}) {
  const root = useRef<HTMLDivElement>(null),
    canvas = useRef<HTMLCanvasElement>(null),
    svg = useRef<SVGSVGElement>(null);
  const { reduced } = useReducedEffects();
  const latest = useRef({ trace, layers, zoom, reduced }),
    orientation = useRef({ yaw: 0.7, pitch: 0.6 });
  useEffect(() => {
    latest.current = { trace, layers, zoom, reduced };
    handleRef.current?.draw();
  }, [trace, layers, zoom, reduced, handleRef]);
  useEffect(() => {
    orientation.current = {
      yaw: camera === "front" ? 0 : 0.7,
      pitch: camera === "top" ? 1.35 : camera === "front" ? 0.22 : 0.6,
    };
    handleRef.current?.draw();
  }, [camera, handleRef]);
  useEffect(() => {
    const node = root.current!,
      surface = canvas.current!,
      vector = svg.current!,
      fallback = createDemoSvg(vector, study);
    let visibleInViewport = true;
    let world: ReturnType<
        typeof import("@/lib/demo-webgl").createDemoWebGL
      > | null = null,
      disposed = false,
      frame = 0,
      drag = false,
      lastX = 0,
      lastY = 0,
      last = 0,
      slow = 0,
      drops = 0;
    function light() {
      world?.dispose();
      world = null;
      surface.hidden = true;
      vector.style.display = "block";
      node.dataset.renderer = "vector";
      schedule();
    }
    function draw(stamp: number) {
      frame = 0;
      if (disposed || document.hidden || !visibleInViewport) return;
      const v: DemoView = {
        seconds: clockRef.current,
        ...orientation.current,
        yaw:
          orientation.current.yaw +
          (latest.current.reduced
            ? 0
            : Math.sin(clockRef.current * 0.18) * 0.09),
        zoom: latest.current.zoom,
        layers: latest.current.layers,
        reduced: latest.current.reduced,
      };
      if (world) {
        world.render(v, latest.current.trace);
        const dt = stamp - last;
        slow = last && dt > 24 && dt < 150 ? slow + 1 : Math.max(0, slow - 1);
        if (slow > 25) {
          slow = 0;
          if (drops++ < 2) world.lowerQuality();
          else light();
        }
      } else fallback.render(v, latest.current.trace);
      last = stamp;
    }
    function schedule() {
      if (!disposed && !frame) frame = requestAnimationFrame(draw);
    }
    async function initialize() {
      try {
        const probe = document.createElement("canvas"),
          gl = probe.getContext("webgl2");
        if (!gl || softwareGraphics(gl)) {
          gl?.getExtension("WEBGL_lose_context")?.loseContext();
          return;
        }
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        const { createDemoWebGL } = await import("@/lib/demo-webgl");
        if (disposed) return;
        world = createDemoWebGL(surface, study);
        surface.hidden = false;
        vector.style.display = "none";
        node.dataset.renderer = "webgl";
        schedule();
      } catch {
        light();
      }
    }
    const down = (e: PointerEvent) => {
      drag = true;
      lastX = e.clientX;
      lastY = e.clientY;
      node.setPointerCapture(e.pointerId);
      node.dataset.dragging = "true";
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      orientation.current.yaw += (e.clientX - lastX) * 0.008;
      orientation.current.pitch = Math.max(
        0.12,
        Math.min(1.4, orientation.current.pitch + (e.clientY - lastY) * 0.004),
      );
      lastX = e.clientX;
      lastY = e.clientY;
      schedule();
    };
    const up = () => {
      drag = false;
      node.dataset.dragging = "false";
    };
    const lost = (e: Event) => {
      e.preventDefault();
      surface.removeEventListener("webglcontextlost", lost);
      light();
    };
    const visible = () => {
      last = 0;
      if (!document.hidden) schedule();
    };
    const intersection = new IntersectionObserver(
      ([entry]) => {
        visibleInViewport = entry.isIntersecting;
        if (visibleInViewport) {
          last = 0;
          schedule();
        }
      },
      { rootMargin: "80px" },
    );
    intersection.observe(node);
    const size = new ResizeObserver(schedule);
    size.observe(node);
    node.addEventListener("pointerdown", down);
    node.addEventListener("pointermove", move);
    node.addEventListener("pointerup", up);
    node.addEventListener("pointercancel", up);
    surface.addEventListener("webglcontextlost", lost);
    document.addEventListener("visibilitychange", visible);
    handleRef.current = { draw: schedule };
    node.dataset.renderer = "vector";
    schedule();
    void initialize();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      handleRef.current = null;
      size.disconnect();
      intersection.disconnect();
      node.removeEventListener("pointerdown", down);
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerup", up);
      node.removeEventListener("pointercancel", up);
      surface.removeEventListener("webglcontextlost", lost);
      document.removeEventListener("visibilitychange", visible);
      world?.dispose();
      fallback.dispose();
    };
  }, [study, clockRef, handleRef]);
  return (
    <div
      ref={root}
      className="demo-scene"
      data-cursor="drag"
      aria-label="Quantum memory and recorded detector history. Use the camera buttons or drag to rotate."
    >
      <canvas ref={canvas} hidden aria-hidden="true" />
      <svg
        ref={svg}
        role="img"
        aria-label="Coordinate-projected quantum memory and recorded detection events"
      />
      <span className="demo-drag-hint">
        Drag to rotate · camera controls available
      </span>
    </div>
  );
}
