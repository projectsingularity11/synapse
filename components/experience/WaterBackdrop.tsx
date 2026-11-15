"use client";
import { useEffect, useRef } from "react";
import { useReducedEffects } from "../useReducedEffects";

// Original analytic wave field. WebGL 1 / no float textures or SVG filter dependencies.
const vertex = `attribute vec2 aPosition; varying vec2 vUv; void main(){vUv=aPosition*.5+.5;gl_Position=vec4(aPosition,0.,1.);}`;
const fragment = `precision highp float;
varying vec2 vUv; uniform vec2 uResolution; uniform float uTime; uniform vec2 uPointer; uniform vec4 uRipples[8];
void main(){
 float aspect=uResolution.x/uResolution.y; vec2 p=(vUv-.5)*vec2(aspect,1.);
 float t=uTime*.13;
 float a=p.x*2.4+p.y*1.7+t; float b=p.y*3.8-p.x*1.5-t*.65;
 vec2 grad=vec2(cos(a)*.38-cos(b)*.21,cos(a)*.27+cos(b)*.53);
 float h=sin(a)*.16+sin(b)*.14;
 for(int i=0;i<8;i++){
   vec4 r=uRipples[i]; if(r.w<.01 || uTime-r.z>4.0)continue; float age=max(0.,uTime-r.z);vec2 d=(vUv-r.xy)*vec2(aspect,1.);float dist=length(d)+.001;
   float envelope=exp(-age*1.35)*exp(-pow((dist-age*.24)*5.,2.))*r.w;
   float wave=dist*48.-age*9.;h+=sin(wave)*envelope*.12;
   grad+=d/dist*cos(wave)*envelope*2.1;
 }
 vec3 n=normalize(vec3(-grad,1.0));
 vec3 view=normalize(vec3((vUv-.5)*.2,1.));
 float blue=pow(max(dot(n,normalize(vec3(-.65,.6,1.))),0.),15.);
 float pink=pow(max(dot(n,normalize(vec3(.75,-.45,1.))),0.),20.);
 float ridge=pow(.5+.5*sin(h*15.+p.x*.7),18.);
 float fresnel=pow(1.-max(dot(n,view),0.),3.);
 vec3 color=vec3(.012,.019,.045);
 color+=vec3(.025,.17,.82)*(blue*.9+ridge*.08);
 color+=vec3(.8,.018,.28)*(pink*.85+fresnel*.25);
 color+=vec3(.20,.32,.55)*pow(blue*pink,2.)*.4;
 float vignette=1.-smoothstep(.15,1.25,length(p*.65));
 color*=.5+vignette*.5;
 gl_FragColor=vec4(color,1.);
}`;
export function WaterBackdrop() {
  const surface = useRef<HTMLDivElement>(null),
    canvas = useRef<HTMLCanvasElement>(null),
    fallback = useRef<HTMLCanvasElement>(null),
    cursor = useRef<HTMLDivElement>(null);
  const { reduced } = useReducedEffects();
  const quiet = useRef(reduced);
  useEffect(() => {
    quiet.current = reduced;
  }, [reduced]);
  useEffect(() => {
    const node = surface.current!,
      gpu = canvas.current!,
      plain = fallback.current!,
      lens = cursor.current!;
    let gl: WebGLRenderingContext | null = null,
      program: WebGLProgram | null = null,
      buffer: WebGLBuffer | null = null;
    const shaders: WebGLShader[] = [];
    let fallbackMode = false,
      frame = 0,
      dirty = true,
      previousQuiet = false,
      previous = 0;
    const start = performance.now() / 1000;
    let x = 0.72,
      y = 0.6,
      cx = 0.72,
      cy = 0.6,
      cursorX = 0,
      cursorY = 0,
      lastSplat = 0,
      next = 0,
      draws = 0,
      quality = 0.7,
      lastQualityChange = 0;
    const ripples = new Float32Array(32);
    for (let i = 0; i < 8; i++) ripples[i * 4 + 2] = -100;
    let resolution: WebGLUniformLocation | null = null,
      time: WebGLUniformLocation | null = null,
      point: WebGLUniformLocation | null = null,
      waves: WebGLUniformLocation | null = null;
    const ctx = plain.getContext("2d");
    const activateFallback = () => {
      fallbackMode = true;
      node.dataset.renderer = "canvas2d";
      gpu.style.visibility = "hidden";
      plain.style.display = "block";
      dirty = true;
    };
    try {
      gl = gpu.getContext("webgl", {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: "low-power",
      });
      if (!gl) throw new Error("WebGL unavailable");
      const debug = gl.getExtension("WEBGL_debug_renderer_info");
      const renderer = debug
        ? String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL))
        : "";
      if (/swiftshader|llvmpipe|softpipe|software/i.test(renderer)) {
        node.dataset.fallbackReason = "software-renderer";
        throw new Error("Use the light renderer on software graphics");
      }

      const compile = (type: number, source: string) => {
        const s = gl!.createShader(type)!;
        shaders.push(s);
        gl!.shaderSource(s, source);
        gl!.compileShader(s);
        if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS))
          throw new Error("Shader unavailable");
        return s;
      };
      program = gl.createProgram()!;
      gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw new Error("Shader program unavailable");
      gl.useProgram(program);
      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl.STATIC_DRAW,
      );
      const a = gl.getAttribLocation(program, "aPosition");
      gl.enableVertexAttribArray(a);
      gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
      resolution = gl.getUniformLocation(program, "uResolution");
      time = gl.getUniformLocation(program, "uTime");
      point = gl.getUniformLocation(program, "uPointer");
      waves = gl.getUniformLocation(program, "uRipples[0]");
      node.dataset.renderer = "webgl";
    } catch {
      activateFallback();
    }
    function resize() {
      const scale = innerWidth < 700 ? Math.min(0.85, quality + 0.1) : quality;
      const dpr = 1;
      const w = Math.max(1, Math.round(innerWidth * scale * dpr)),
        h = Math.max(1, Math.round(innerHeight * scale * dpr));
      gpu.width = w;
      gpu.height = h;
      plain.width = w;
      plain.height = h;
      if (gl && !fallbackMode) {
        gl.viewport(0, 0, w, h);
        gl.uniform2f(resolution, w, h);
      }
      dirty = true;
    }
    function splat(px: number, py: number, now: number, strength = 1) {
      const offset = (next++ % 8) * 4;
      ripples[offset] = px;
      ripples[offset + 1] = 1 - py;
      ripples[offset + 2] = now;
      ripples[offset + 3] = strength;
      dirty = true;
      node.dataset.ripples = String(next);
    }
    const move = (e: PointerEvent) => {
      x = e.clientX / innerWidth;
      y = e.clientY / innerHeight;
      lens.dataset.visible = e.pointerType === "touch" ? "false" : "true";
      if (quiet.current) return;
      const now = performance.now() / 1000;
      if (now - lastSplat > 0.045) {
        splat(x, y, now, 0.6);
        lastSplat = now;
      }
      // Update only the hovered glass: no page-wide layout walk per pointer event.
      const glass = (e.target as Element).closest<HTMLElement>(
        ".glass-surface",
      );
      if (glass) {
        const r = glass.getBoundingClientRect();
        glass.style.setProperty(
          "--glint-x",
          `${((e.clientX - r.left) / r.width) * 100}%`,
        );
        glass.style.setProperty(
          "--glint-y",
          `${((e.clientY - r.top) / r.height) * 100}%`,
        );
      }
    };
    const down = (e: PointerEvent) => {
      if (!quiet.current)
        splat(
          e.clientX / innerWidth,
          e.clientY / innerHeight,
          performance.now() / 1000,
          1.2,
        );
    };
    const leave = () => {
      lens.dataset.visible = "false";
    };
    const drawPlain = (now: number) => {
      if (!ctx) return;
      const w = plain.width,
        h = plain.height;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < 8; i++) {
        const o = i * 4,
          age = now - ripples[o + 2];
        if (age < 0 || age > 3) continue;
        const radius = age * h * 0.24,
          alpha = Math.exp(-age * 1.6) * ripples[o + 3];
        for (let ring = 0; ring < 3; ring++) {
          ctx.beginPath();
          ctx.ellipse(
            ripples[o] * w,
            (1 - ripples[o + 1]) * h,
            Math.max(1, radius - ring * 10),
            Math.max(1, (radius - ring * 10) * 0.72),
            -0.12,
            0,
            Math.PI * 2,
          );
          ctx.strokeStyle =
            ring % 2
              ? `rgba(255,65,171,${alpha * 0.45})`
              : `rgba(76,139,255,${alpha * 0.6})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    };
    const render = (stamp: number) => {
      frame = requestAnimationFrame(render);
      if (document.hidden) return;
      if (quiet.current !== previousQuiet) {
        previousQuiet = quiet.current;
        dirty = true;
      }
      if (quiet.current) {
        lens.dataset.visible = "false";
        if (!dirty) return;
      }
      if (!dirty && stamp - previous < 1000 / (innerWidth < 700 ? 30 : 60))
        return;
      const delta = stamp - previous;
      previous = stamp;
      const now = stamp / 1000;
      if (
        !quiet.current &&
        draws > 12 &&
        delta > 50 &&
        now - lastQualityChange > 2 &&
        quality > 0.4
      ) {
        quality = Math.max(0.4, quality - 0.1);
        lastQualityChange = now;
        resize();
        node.dataset.quality = quality.toFixed(1);
      }
      cx += (x - cx) * 0.13;
      cy += (y - cy) * 0.13;
      cursorX = cx * innerWidth;
      cursorY = cy * innerHeight;
      lens.style.transform = `translate3d(${cursorX - 15}px,${cursorY - 15}px,0)`;
      if (fallbackMode) drawPlain(quiet.current ? start : now);
      else if (gl) {
        gl.uniform1f(time, quiet.current ? start : now);
        gl.uniform2f(point, cx, 1 - cy);
        gl.uniform4fv(
          waves,
          quiet.current ? new Float32Array(32).fill(-100) : ripples,
        );
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      dirty = false;
      node.dataset.frames = String(++draws);
      if (draws === 1) {
        node.dataset.ready = "true";
        window.dispatchEvent(new Event("synapse-scene-ready"));
      }
    };
    const lost = (e: Event) => {
      e.preventDefault();
      activateFallback();
    };
    gpu.addEventListener("webglcontextlost", lost);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    document.addEventListener("pointerleave", leave);
    window.addEventListener("resize", resize, { passive: true });
    resize();
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      gpu.removeEventListener("webglcontextlost", lost);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      document.removeEventListener("pointerleave", leave);
      window.removeEventListener("resize", resize);
      if (gl) {
        if (buffer) gl.deleteBuffer(buffer);
        if (program) gl.deleteProgram(program);
        shaders.forEach((s) => gl!.deleteShader(s));
      }
    };
  }, []);
  return (
    <>
      <div ref={surface} className="water-backdrop" aria-hidden="true">
        <div className="atmosphere-fallback" />
        <canvas ref={canvas} />
        <canvas ref={fallback} className="water-fallback" />
      </div>
      <div ref={cursor} className="cursor-lens" aria-hidden="true">
        <span />
      </div>
    </>
  );
}
