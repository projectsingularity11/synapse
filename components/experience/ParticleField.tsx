"use client";
import { useEffect, useRef } from "react";

// Original point-surface shader. A visual metaphor, never experimental data.
const vertex = `
attribute vec2 aSeed;
uniform float uTime; uniform float uAspect; uniform vec2 uPointer; uniform float uScroll;
varying float vLight; varying float vBlue;
void main(){
 float t=aSeed.x*6.2831853; float v=aSeed.y*6.2831853;
 float r=1.05+0.34*cos(3.0*t);
 vec3 c=vec3(r*cos(2.0*t),r*sin(2.0*t),0.48*sin(3.0*t));
 vec3 n=normalize(vec3(cos(2.0*t)*cos(3.0*t),sin(2.0*t)*cos(3.0*t),sin(3.0*t)));
 vec3 b=normalize(cross(n,vec3(-sin(2.0*t),cos(2.0*t),0.4*cos(3.0*t))));
 vec3 p=c+0.25*(n*cos(v)+b*sin(v));
 float a=0.5+uTime*0.08+uPointer.x*0.22+uScroll*0.7;
 p.xz=mat2(cos(a),-sin(a),sin(a),cos(a))*p.xz;
 float tilt=0.65+uPointer.y*0.16;
 p.yz=mat2(cos(tilt),-sin(tilt),sin(tilt),cos(tilt))*p.yz;
 vec2 mouse=uPointer*vec2(uAspect,1.0)*1.6;
 float d=length(p.xy-mouse);
 p.xy+=normalize(p.xy-mouse+0.001)*exp(-d*3.0)*0.24;
 float perspective=3.6/(3.6-p.z);
 gl_Position=vec4(p.x*perspective/uAspect*0.67,p.y*perspective*0.67,0.0,1.0);
 gl_PointSize=clamp((1.35+aSeed.y*0.8)*perspective,1.0,4.0);
 vLight=clamp(0.28+(p.z+1.1)*0.32+pow(max(0.0,cos(v+0.8)),8.0)*0.5,0.0,1.0);
 vBlue=(1.0-smoothstep(0.0,0.52,d))*0.85;
}`;
const fragment = `precision mediump float; varying float vLight; varying float vBlue;
void main(){float d=length(gl_PointCoord-0.5);if(d>0.5)discard;
vec3 silver=mix(vec3(0.12,0.14,0.17),vec3(0.60,0.64,0.67),vLight);
gl_FragColor=vec4(mix(silver,vec3(0.1,0.25,1.0),vBlue),(1.0-smoothstep(0.28,0.5,d))*0.95);}`;
export function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    const ready = () => window.dispatchEvent(new Event("synapse-scene-ready"));
    if (!gl) {
      ready();
      return;
    }
    const shader = (type: number, source: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, source);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        gl.deleteShader(s);
        return null;
      }
      return s;
    };
    const vs = shader(gl.VERTEX_SHADER, vertex),
      fs = shader(gl.FRAGMENT_SHADER, fragment);
    if (!vs || !fs) {
      ready();
      return;
    }
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      ready();
      return;
    }
    gl.useProgram(program);
    const count = matchMedia("(max-width: 700px)").matches ? 14000 : 30000;
    const seeds = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      seeds[i * 2] = (i % 600) / 600;
      seeds[i * 2 + 1] = (Math.floor(i / 600) + 0.5) / Math.ceil(count / 600);
    }
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW);
    const attr = gl.getAttribLocation(program, "aSeed");
    gl.enableVertexAttribArray(attr);
    gl.vertexAttribPointer(attr, 2, gl.FLOAT, false, 0, 0);
    const time = gl.getUniformLocation(program, "uTime"),
      aspect = gl.getUniformLocation(program, "uAspect"),
      pointer = gl.getUniformLocation(program, "uPointer"),
      scroll = gl.getUniformLocation(program, "uScroll");
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    let dirty = true,
      wasQuiet = false,
      first = true,
      frame = 0,
      visible = true,
      lost = false,
      px = 0,
      py = 0,
      previousScroll = -1,
      phase = 0,
      previousTime = 0,
      dx = 0,
      dy = 0;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      dx = ((e.clientX - r.left) / r.width) * 2 - 1;
      dy = 1 - ((e.clientY - r.top) / r.height) * 2;
    };
    const resize = () => {
      dirty = true;
      const r = canvas.getBoundingClientRect(),
        dpr = Math.min(devicePixelRatio, 1.5);
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(aspect, r.width / r.height);
    };
    const render = (t: number) => {
      if (lost) return;
      const quiet =
        media.matches || document.documentElement.dataset.effects === "reduced";
      if (quiet !== wasQuiet) {
        dirty = true;
        wasQuiet = quiet;
      }
      const moved = Math.abs(dx - px) + Math.abs(dy - py) > 0.002;
      const scrolled = previousScroll !== window.scrollY;
      if (
        visible &&
        !document.hidden &&
        (dirty || (!quiet && (moved || scrolled)))
      ) {
        phase += Math.min((t - previousTime) / 1000, 0.04);
        previousScroll = window.scrollY;
        px += (dx - px) * 0.045;
        py += (dy - py) * 0.045;
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(
          time,
          media.matches ||
            document.documentElement.dataset.effects === "reduced"
            ? 0
            : phase,
        );
        gl.uniform2f(pointer, quiet ? 0 : px, quiet ? 0 : py);
        gl.uniform1f(
          scroll,
          quiet ? 0 : Math.min(window.scrollY / innerHeight, 2),
        );
        gl.drawArrays(gl.POINTS, 0, count);
        dirty = false;
        if (first) {
          first = false;
          canvas.parentElement!.dataset.rendered = "true";
          ready();
        }
      }
      previousTime = t;
      frame = requestAnimationFrame(render);
    };
    const observer = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    observer.observe(canvas);
    const lostContext = (e: Event) => {
      e.preventDefault();
      lost = true;
      canvas.style.opacity = "0";
      delete canvas.parentElement!.dataset.rendered;
      ready();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    frame = requestAnimationFrame(render);
    canvas.addEventListener("webglcontextlost", lostContext);
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", move);
      canvas.removeEventListener("webglcontextlost", lostContext);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);
  return (
    <div
      className="particle-art"
      role="img"
      aria-label="Interactive particle sculpture: an abstract visual metaphor for connected information"
    >
      <svg
        className="sculpture-fallback"
        viewBox="0 0 800 800"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="metal">
            <stop stopColor="#17191b" />
            <stop offset=".5" stopColor="#b4bdc3" />
            <stop offset="1" stopColor="#254aff" />
          </linearGradient>
        </defs>
        <g fill="none" stroke="url(#metal)" strokeWidth="2">
          {Array.from({ length: 22 }, (_, i) => (
            <ellipse
              key={i}
              cx="400"
              cy="400"
              rx={160 + i * 3}
              ry={65 + i * 3}
              transform={`rotate(${i * 8} 400 400)`}
            />
          ))}
        </g>
      </svg>
      <canvas ref={ref} aria-hidden="true" />
    </div>
  );
}
