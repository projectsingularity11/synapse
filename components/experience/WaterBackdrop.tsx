"use client";
import { useEffect, useRef } from "react";
import type WebGLFluidEnhanced from "webgl-fluid-enhanced";
import { softwareGraphics } from "@/lib/graphics";
import { useReducedEffects } from "../useReducedEffects";

/** Persistent, pointer-transparent fluid layer. Upstream MIT solver is loaded only on accelerated adapters. */
export function WaterBackdrop() {
  const root = useRef<HTMLDivElement>(null),
    fluidLayer = useRef<HTMLDivElement>(null),
    fallback = useRef<HTMLDivElement>(null),
    tracker = useRef<HTMLDivElement>(null),
    dot = useRef<HTMLDivElement>(null);
  const { reduced } = useReducedEffects();
  const quiet = useRef(reduced);
  useEffect(() => {
    quiet.current = reduced;
    window.dispatchEvent(new Event("synapse-visual-wake"));
  }, [reduced]);
  useEffect(() => {
    const node = root.current!,
      layer = fluidLayer.current!,
      rings = Array.from(fallback.current!.children) as HTMLElement[],
      ring = tracker.current!,
      point = dot.current!;
    const lights = Array.from(document.querySelectorAll<HTMLElement>(".ambient-light"));
    let fluid: WebGLFluidEnhanced | null = null,
      disposed = false,
      usingGPU = false,
      frame = 0,
      last = 0,
      px = -100,
      py = -100,
      x = -100,
      y = -100,
      previousX = -100,
      previousY = -100,
      seen = false,
      interactive = false,
      wasInteractive = false,
      iteration = 0,
      lastSplat = 0,
      slow = 0,
      quality = 0;
    let canvas: HTMLCanvasElement | null = null;
    function ready() {
      node.dataset.ready = "true";
      window.dispatchEvent(new Event("synapse-scene-ready"));
    }
    function activateLight() {
      fluid?.stop();
      usingGPU = false;
      layer.hidden = true;
      node.dataset.renderer = "compositor";
      document.documentElement.dataset.graphics = "software";
      ready();
    }
    async function initialize() {
      try {
        const probe = document.createElement("canvas");
        const adapter = probe.getContext("webgl2") || probe.getContext("webgl");
        if (!adapter || softwareGraphics(adapter as WebGLRenderingContext)) {
          adapter?.getExtension("WEBGL_lose_context")?.loseContext();
          activateLight();
          return;
        }
        adapter.getExtension("WEBGL_lose_context")?.loseContext();
        const { default: Fluid } = await import("webgl-fluid-enhanced");
        if (disposed) return;
        fluid = new Fluid(layer);
        fluid.setConfig({
          simResolution: 96,
          dyeResolution: 384,
          pressureIterations: 8,
          densityDissipation: 2.8,
          velocityDissipation: 1.1,
          curl: 14,
          splatRadius: 0.018,
          splatForce: 300,
          shading: true,
          colorful: false,
          colorPalette: ["#ff7925", "#ffa43b"],
          hover: false,
          transparent: true,
          brightness: 0.22,
          bloom: false,
          sunrays: false,
        });
        usingGPU = true;
        layer.hidden = false;
        node.dataset.renderer = "fluid";
        document.documentElement.dataset.graphics = "accelerated";
        canvas = layer.querySelector("canvas");
        canvas?.addEventListener("webglcontextlost", contextLost);
        if (!quiet.current && !document.hidden) fluid.start();
        ready();
      } catch {
        activateLight();
      }
    }
    function contextLost(event: Event) {
      event.preventDefault();
      activateLight();
    }
    function splat(stamp: number) {
      if (quiet.current || stamp - lastSplat < (usingGPU ? 14 : 28)) return;
      lastSplat = stamp;
      const dx = previousX < 0 ? 0 : px - previousX,
        dy = previousY < 0 ? 0 : py - previousY;
      previousX = px;
      previousY = py;
      if (usingGPU && fluid) {
        const scale = 0.65;
        fluid.splatAtLocation(
          px * devicePixelRatio * scale,
          py * scale,
          dx * 12,
          -dy * 12,
          iteration % 3 ? "#ff7925" : "#ffa43b",
        );
      } else {
        const ripple = rings[iteration % rings.length];
        ripple.getAnimations().forEach((a) => a.cancel());
        ripple.style.left = `${px}px`;
        ripple.style.top = `${py}px`;
        ripple.animate(
          [
            {
              transform: "translate(-50%,-50%) rotate(-18deg) scale(.06)",
              opacity: 0.34,
            },
            {
              transform: "translate(-50%,-50%) rotate(12deg) scale(1.5)",
              opacity: 0,
            },
          ],
          {
            duration: 650,
            easing: "cubic-bezier(.12,.45,.35,1)",
            fill: "forwards",
          },
        );
      }
      node.dataset.ripples = String(++iteration);
    }
    function move(event: PointerEvent) {
      px = event.clientX;
      py = event.clientY;
      if (!seen) {
        x = px;
        y = py;
        seen = true;
      }
      interactive = !!(event.target as Element | null)?.closest?.(
        "a,button,input,select,[data-cursor]",
      );
      node.dataset.touch = String(event.pointerType === "touch");
      node.dataset.pointer = "true";
      splat(performance.now());
      wake();
    }
    function draw(stamp: number) {
      frame = 0;
      if (disposed || document.hidden || quiet.current || !seen) return;
      const dt = last ? Math.min(50, stamp - last) : 16.67;
      last = stamp;
      const ease = 1 - Math.exp(-dt / 42);
      x += (px - x) * ease;
      y += (py - y) * ease;
      ring.style.transform = `translate3d(${x}px,${y}px,0) scale(${interactive ? 1.2 : 1})`;
      for (const light of lights) {
        light.style.setProperty("--ambient-x", `${(x - innerWidth / 2) * 0.18}px`);
        light.style.setProperty("--ambient-y", `${(y - innerHeight / 2) * 0.16}px`);
      }
      point.style.transform = `translate3d(${px}px,${py}px,0)`;
      if (interactive !== wasInteractive) {
        wasInteractive = interactive;
        node.dataset.interactive = String(interactive);
      }
      if (usingGPU) {
        slow = dt > 22 ? slow + 1 : Math.max(0, slow - 1);
        if (slow > 22) {
          if (quality === 0) {
            quality = 1;
            fluid?.setConfig({
              simResolution: 64,
              dyeResolution: 256,
              pressureIterations: 6,
            });
          } else activateLight();
          slow = 0;
        }
      }
      if (Math.abs(px - x) + Math.abs(py - y) > 0.05)
        frame = requestAnimationFrame(draw);
    }
    function wake() {
      if (!frame && !quiet.current && !document.hidden)
        frame = requestAnimationFrame(draw);
    }
    function preference() {
      if (quiet.current) {
        for (const light of lights) {
          light.style.removeProperty("--ambient-x");
          light.style.removeProperty("--ambient-y");
        }
        node.dataset.pointer = "false";
        fluid?.stop();
        fallback.current
          ?.getAnimations({ subtree: true })
          .forEach((a) => a.cancel());
        cancelAnimationFrame(frame);
        frame = 0;
      } else {
        if (usingGPU && !document.hidden) fluid?.start();
        wake();
      }
    }
    function visibility() {
      last = 0;
      if (document.hidden) {
        fluid?.stop();
        cancelAnimationFrame(frame);
        frame = 0;
        fallback.current
          ?.getAnimations({ subtree: true })
          .forEach((a) => a.pause());
      } else {
        if (usingGPU && !quiet.current) fluid?.start();
        wake();
      }
    }
    const leave = () => {
      node.dataset.pointer = "false";
      seen = false;
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("synapse-visual-wake", preference);
    initialize();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      fluid?.stop();
      canvas?.removeEventListener("webglcontextlost", contextLost);
      const gl = canvas?.getContext("webgl2") || canvas?.getContext("webgl");
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
      rings.forEach((r) => r.getAnimations().forEach((a) => a.cancel()));
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", move);
      document.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("synapse-visual-wake", preference);
    };
  }, []);
  return (
    <div className="water-backdrop" ref={root} aria-hidden="true">
      <div className="fluid-layer" ref={fluidLayer} hidden />
      <div className="water-fallback" ref={fallback}>
        {Array.from({ length: 8 }, (_, i) => (
          <i key={i} />
        ))}
      </div>
      <div ref={tracker} className="cursor-tracker" />
      <div ref={dot} className="cursor-point" />
    </div>
  );
}
