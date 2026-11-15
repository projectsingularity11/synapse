"use client";
import Image from "next/image";
import { useEffect, useRef, type RefObject } from "react";
import { useReducedEffects } from "../useReducedEffects";
import { softwareGraphics } from "@/lib/graphics";
import type {
  QuantumWorldOptions,
  createQuantumWorld,
} from "@/lib/quantum-world";
type World = ReturnType<typeof createQuantumWorld>;
export function QuantumStage({
  mode = "story",
  progress,
  detectors,
  events,
  chapter = 0,
}: {
  mode?: "hero" | "story";
  progress?: RefObject<number>;
  detectors: QuantumWorldOptions["detectors"];
  events: number[];
  chapter?: number;
}) {
  const root = useRef<HTMLDivElement>(null),
    canvas = useRef<HTMLCanvasElement>(null),
    poster = useRef<HTMLImageElement>(null),
    readout = useRef<HTMLDivElement>(null);
  const { reduced } = useReducedEffects(),
    quiet = useRef(reduced);
  useEffect(() => {
    quiet.current = reduced;
    window.dispatchEvent(new Event("synapse-stage-wake"));
  }, [reduced]);
  useEffect(() => {
    const node = root.current!,
      surface = canvas.current!,
      image = poster.current!,
      label = readout.current!;
    let world: World | null = null,
      disposed = false,
      frame = 0,
      visible = true,
      last = 0,
      time = 0,
      w = 1,
      h = 1,
      px = 0,
      py = 0,
      rotation = 0,
      drag = false,
      lastX = 0,
      pressed = false,
      interaction = performance.now(),
      quality = 1,
      slow = 0,
      lastQuality = 0,
      selection = -2,
      initialized = false;
    function light() {
      world?.dispose();
      world = null;
      surface.hidden = true;
      image.hidden = false;
      node.dataset.renderer = "poster";
      if (
        mode === "hero" &&
        !quiet.current &&
        !document.hidden &&
        visible &&
        !image.getAnimations().length
      )
        image.animate(
          [
            { transform: "rotate(-1.3deg)" },
            { transform: "rotate(1.3deg)" },
            { transform: "rotate(-1.3deg)" },
          ],
          { duration: 26000, iterations: Infinity, easing: "ease-in-out" },
        );
    }
    async function init() {
      try {
        const probe = document.createElement("canvas"),
          gl = probe.getContext("webgl2") || probe.getContext("webgl");
        if (!gl || softwareGraphics(gl as WebGLRenderingContext)) {
          gl?.getExtension("WEBGL_lose_context")?.loseContext();
          light();
          return;
        }
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        const { createQuantumWorld } = await import("@/lib/quantum-world");
        if (disposed) return;
        world = createQuantumWorld({
          canvas: surface,
          mode,
          detectors,
          events,
        });
        surface.hidden = false;
        node.dataset.renderer = "webgl";
        image.hidden = true;
        resize();
        wake();
      } catch {
        light();
      }
    }
    function resize() {
      const box = node.getBoundingClientRect();
      w = Math.max(1, box.width);
      h = Math.max(1, box.height);
      world?.resize(w, h, quality);
      interaction = performance.now();
      wake();
    }
    function draw(stamp: number) {
      frame = 0;
      if (disposed || !visible || document.hidden) return;
      const dt = last ? Math.min(50, stamp - last) : 16.67;
      last = stamp;
      if (!quiet.current) time += dt / 1000;
      if (world) {
        world.render({
          time,
          progress: progress?.current ?? 0,
          pointerX: px,
          pointerY: py,
          rotation,
          reduced: quiet.current,
          pressed,
        });
        if (!quiet.current) {
          slow = dt > 22 ? slow + 1 : Math.max(0, slow - 1);
          if (slow > 24 && stamp - lastQuality > 2000) {
            if (quality > 0.55) {
              quality -= 0.2;
              lastQuality = stamp;
              world.resize(w, h, quality);
            } else {
              light();
              return;
            }
            slow = 0;
          }
        }
        if (!quiet.current && (mode === "hero" || stamp - interaction < 1000))
          frame = requestAnimationFrame(draw);
      }
    }
    function wake() {
      if (
        !world &&
        mode === "hero" &&
        !quiet.current &&
        visible &&
        !document.hidden &&
        !image.getAnimations().length
      )
        light();
      interaction = performance.now();
      if (world && !frame && visible && !document.hidden)
        frame = requestAnimationFrame(draw);
      if (!world) {
        if (quiet.current) {
          image.getAnimations().forEach((a) => a.pause());
          image.style.translate = "0px 0px";
        } else if (visible && !document.hidden)
          image.getAnimations().forEach((a) => a.play());
      }
    }
    const down = (event: PointerEvent) => {
      if (quiet.current) return;
      drag = true;
      pressed = true;
      lastX = event.clientX;
      node.setPointerCapture(event.pointerId);
      node.dataset.dragging = "true";
      wake();
    };
    const move = (event: PointerEvent) => {
      const box = node.getBoundingClientRect();
      px = (event.clientX - box.left) / w - 0.5;
      py = (event.clientY - box.top) / h - 0.5;
      if (drag && !quiet.current) {
        rotation += (event.clientX - lastX) * 0.006;
        lastX = event.clientX;
      }
      if (!world && !quiet.current) {
        image.style.translate = `${px * 14}px ${py * 10}px`;
        image.style.rotate = `${rotation * 12}deg`;
      }
      if (world && mode === "story") {
        const hit = world.inspect(px * 2, -py * 2);
        if (hit !== selection) {
          selection = hit;
          label.textContent =
            hit < 0
              ? "Drag to turn the view"
              : (progress?.current ?? 0) > 0.49 &&
                  (progress?.current ?? 0) < 0.75
                ? `Detector D${hit} · ${events[hit] ? "event recorded" : "no event recorded"}`
                : (progress?.current ?? 0) > 0.74
                  ? "Network architecture · illustrative connections"
                  : `Data and check qubits · schematic view`;
        }
      }
      wake();
    };
    const up = () => {
      drag = false;
      pressed = false;
      node.dataset.dragging = "false";
      wake();
    };
    const lost = (e: Event) => {
      e.preventDefault();
      light();
    };
    const visibility = () => {
      last = 0;
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
        image.getAnimations().forEach((a) => a.pause());
      } else wake();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !initialized) {
          initialized = true;
          init();
        }
        if (!visible) {
          cancelAnimationFrame(frame);
          frame = 0;
          last = 0;
          image.getAnimations().forEach((a) => a.pause());
        } else wake();
      },
      { rootMargin: "80px" },
    );
    observer.observe(node);
    const size = new ResizeObserver(resize);
    size.observe(node);
    // Pointer listeners live on the shared container so the full-quality poster fallback remains interactive.
    node.addEventListener("pointerdown", down);
    node.addEventListener("pointermove", move);
    node.addEventListener("pointerup", up);
    node.addEventListener("pointercancel", up);
    surface.addEventListener("webglcontextlost", lost);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("synapse-stage-wake", wake);
    resize();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      image.getAnimations().forEach((a) => a.cancel());
      world?.dispose();
      observer.disconnect();
      size.disconnect();
      node.removeEventListener("pointerdown", down);
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerup", up);
      node.removeEventListener("pointercancel", up);
      surface.removeEventListener("webglcontextlost", lost);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("synapse-stage-wake", wake);
    };
  }, [mode, progress, detectors, events]);
  return (
    <div
      className={`quantum-stage ${mode === "hero" ? "hero-stage" : "story-stage"}`}
      ref={root}
      data-cursor="drag"
    >
      <canvas
        ref={canvas}
        aria-label={
          mode === "hero"
            ? "Interactive sculptural illustration of a quantum memory"
            : "Three-dimensional circuit and detector-history illustration"
        }
      />
      <Image
        ref={poster}
        className="quantum-poster"
        src={`/art/quantum-${mode === "hero" ? "hero" : chapter}.webp`}
        alt=""
        width={1400}
        height={1100}
        unoptimized
        priority={mode === "hero"}
      />
      <div className="stage-readout" ref={readout}>
        Drag to turn the view
      </div>
    </div>
  );
}
