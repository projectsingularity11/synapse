"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { createProgram, softwareGraphics } from "@/lib/graphics";
import { useReducedEffects } from "../useReducedEffects";

const vertex = `attribute vec3 position;attribute vec3 normal;uniform float time;uniform float aspect;uniform vec2 pointer;varying vec3 n;varying vec3 p;
mat3 rx(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,s,0.,-s,c);}mat3 ry(float a){float c=cos(a),s=sin(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}
void main(){mat3 r=rx(.45+pointer.y*.18)*ry(time*.09+pointer.x*.28);p=r*position;n=r*normal;float depth=8.5-p.z;gl_Position=vec4(p.x*2.5/aspect,p.y*2.5,depth*.99-.2,depth);}`;
const fragment = `precision mediump float;varying vec3 n;varying vec3 p;
void main(){vec3 N=normalize(n);vec3 V=normalize(vec3(0.,0.,8.5)-p);vec3 R=reflect(-V,N);
float band=pow(.5+.5*sin(R.y*7.+R.x*2.5),6.);float light=pow(max(dot(N,normalize(vec3(-2.,3.,4.))),0.),2.);
float rim=pow(1.-abs(dot(N,V)),2.);float spec=pow(max(dot(reflect(normalize(vec3(2.,-3.,-4.)),N),V),0.),36.);
vec3 c=mix(vec3(.055,.07,.075),vec3(.77,.81,.8),light*.6+band*.52);c+=vec3(.9,.96,.92)*spec*.9+vec3(.4,.51,.48)*rim*.36;
gl_FragColor=vec4(c,1.);}`;
function knot(u: number) {
  return [
    (2 + 0.56 * Math.cos(3 * u)) * Math.cos(2 * u),
    (2 + 0.56 * Math.cos(3 * u)) * Math.sin(2 * u),
    0.85 * Math.sin(3 * u),
  ];
}
function mesh() {
  const positions: number[] = [],
    normals: number[] = [];
  function sample(i: number, j: number) {
    const u = (i / 240) * Math.PI * 2,
      v = (j / 28) * Math.PI * 2,
      c = knot(u),
      d = knot(u + 0.001);
    let tx = d[0] - c[0],
      ty = d[1] - c[1],
      tz = d[2] - c[2];
    const len = Math.hypot(tx, ty, tz);
    tx /= len;
    ty /= len;
    tz /= len;
    const nl = Math.hypot(ty, tx),
      nx = -ty / nl,
      ny = tx / nl;
    const bx = -tz * ny,
      by = tz * nx,
      bz = tx * ny - ty * nx;
    const n = [
      nx * Math.cos(v) + bx * Math.sin(v),
      ny * Math.cos(v) + by * Math.sin(v),
      bz * Math.sin(v),
    ];
    return { p: c.map((x, k) => x + n[k] * 0.43), n };
  }
  for (let i = 0; i < 240; i++)
    for (let j = 0; j < 28; j++) {
      const a = sample(i, j),
        b = sample(i + 1, j),
        c = sample(i + 1, j + 1),
        d = sample(i, j + 1);
      for (const s of [a, b, d, b, c, d]) {
        positions.push(...s.p);
        normals.push(...s.n);
      }
    }
  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
  };
}
export function Sculpture() {
  const canvas = useRef<HTMLCanvasElement>(null),
    fallback = useRef<HTMLImageElement>(null),
    root = useRef<HTMLDivElement>(null);
  const { reduced } = useReducedEffects(),
    quiet = useRef(reduced);
  useEffect(() => {
    quiet.current = reduced;
    window.dispatchEvent(new Event("synapse-sculpture-wake"));
  }, [reduced]);
  useEffect(() => {
    const gpu = canvas.current!,
      plain = fallback.current!,
      container = root.current!;
    let gl: WebGLRenderingContext | null = null,
      program: WebGLProgram | null = null;
    const buffers: WebGLBuffer[] = [];
    let time: WebGLUniformLocation | null = null,
      aspect: WebGLUniformLocation | null = null,
      pointer: WebGLUniformLocation | null = null,
      count = 0;
    let frame = 0,
      last = 0,
      t = 0,
      onScreen = true,
      px = 0,
      py = 0,
      cx = 0,
      cy = 0,
      w = 1,
      h = 1,
      scale = 0.9,
      slow = 0,
      qualityAt = 0;

    try {
      gl = gpu.getContext("webgl", {
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      if (!gl || softwareGraphics(gl)) throw new Error("Lightweight sculpture");
      program = createProgram(gl, vertex, fragment);
      gl.useProgram(program);
      const geometry = mesh();
      count = geometry.positions.length / 3;
      for (const [name, data] of [
        ["position", geometry.positions],
        ["normal", geometry.normals],
      ] as const) {
        const buffer = gl.createBuffer()!;
        buffers.push(buffer);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        const attr = gl.getAttribLocation(program, name);
        gl.enableVertexAttribArray(attr);
        gl.vertexAttribPointer(attr, 3, gl.FLOAT, false, 0, 0);
      }
      time = gl.getUniformLocation(program, "time");
      aspect = gl.getUniformLocation(program, "aspect");
      pointer = gl.getUniformLocation(program, "pointer");
      gl.enable(gl.DEPTH_TEST);
      plain.hidden = true;
      container.dataset.renderer = "webgl";
    } catch {
      gpu.hidden = true;
      plain.hidden = false;
      container.dataset.renderer = "poster";
    }
    // A poster rendered from this same shader keeps software graphics visually complete.
    // Its motion is composited as a single texture, avoiding CPU rasterization on every frame.

    function resize() {
      const r = container.getBoundingClientRect();
      w = r.width;
      h = r.height;
      const dpr = Math.min(devicePixelRatio, 1.5) * scale;
      gpu.width = Math.max(1, Math.round(w * dpr));
      gpu.height = Math.max(1, Math.round(h * dpr));
      if (gl && !gpu.hidden) {
        gl.viewport(0, 0, gpu.width, gpu.height);
        gl.uniform1f(aspect, w / h);
      }
      wake();
    }
    function draw(stamp: number) {
      frame = 0;
      if (!onScreen || document.hidden) return;
      const dt = last ? Math.min(50, stamp - last) : 16.67;
      last = stamp;
      if (!quiet.current) t += dt / 1000;
      cx += (px - cx) * 0.07;
      cy += (py - cy) * 0.07;
      slow = dt > 21 ? slow + 1 : Math.max(0, slow - 1);
      if (slow > 24 && stamp - qualityAt > 2500 && scale > 0.5) {
        scale -= 0.15;
        qualityAt = stamp;
        slow = 0;
        resize();
      }
      if (gl && !gpu.hidden) {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.uniform1f(time, t);
        gl.uniform2f(pointer, cx, cy);
        gl.drawArrays(gl.TRIANGLES, 0, count);
      }
      if (!quiet.current && !gpu.hidden) frame = requestAnimationFrame(draw);
    }
    function syncPoster() {
      if (!gpu.hidden) return;
      const existing = plain.getAnimations()[0];
      if (quiet.current || !onScreen || document.hidden) {
        existing?.pause();
        plain.style.translate = "0px 0px";
      } else if (existing) existing.play();
      else
        plain.animate(
          [
            { transform: "rotate(-2.6deg)" },
            { transform: "rotate(2.6deg)" },
            { transform: "rotate(-2.6deg)" },
          ],
          { duration: 28000, iterations: Infinity, easing: "ease-in-out" },
        );
    }
    function wake() {
      syncPoster();
      if (gpu.hidden) return;
      if (!frame && onScreen && !document.hidden)
        frame = requestAnimationFrame(draw);
    }
    const visibility = () => {
      last = 0;
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
        syncPoster();
      } else wake();
    };
    const move = (e: PointerEvent) => {
      px = e.clientX / innerWidth - 0.5;
      py = e.clientY / innerHeight - 0.5;
      if (gpu.hidden && !quiet.current && onScreen)
        plain.style.translate = `${px * w * 0.035}px ${py * h * 0.025}px`;
    };
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (!onScreen) {
        cancelAnimationFrame(frame);
        frame = 0;
        last = 0;
        syncPoster();
      } else wake();
    });
    observer.observe(container);
    const size = new ResizeObserver(resize);
    size.observe(container);
    const lost = (e: Event) => {
      e.preventDefault();
      gpu.hidden = true;
      plain.hidden = false;
      container.dataset.renderer = "poster";
      wake();
    };
    gpu.addEventListener("webglcontextlost", lost);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("synapse-sculpture-wake", wake);
    resize();
    return () => {
      cancelAnimationFrame(frame);
      plain.getAnimations().forEach((animation) => animation.cancel());
      observer.disconnect();
      size.disconnect();
      gpu.removeEventListener("webglcontextlost", lost);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("synapse-sculpture-wake", wake);
      if (gl) {
        buffers.forEach((b) => gl!.deleteBuffer(b));
        if (program) gl.deleteProgram(program);
      }
    };
  }, []);
  return (
    <div className="sculpture" ref={root} aria-hidden="true">
      <canvas ref={canvas} />
      <Image
        ref={fallback}
        className="sculpture-poster"
        src="/art/synapse-knot.webp"
        alt=""
        width={1400}
        height={1400}
        unoptimized
        priority
      />
    </div>
  );
}
