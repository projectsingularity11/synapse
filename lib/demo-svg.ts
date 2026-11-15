import type { Study, Trace } from "./data";
import { demoFrame, type DemoView } from "./demo-timeline";
const ns = "http://www.w3.org/2000/svg";
function element(tag: string, attrs: Record<string, string>) {
  const el = document.createElementNS(ns, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}
/** Coordinate-projected 3D view for software graphics; no invented fault paths. */
export function createDemoSvg(svg: SVGSVGElement, study: Study) {
  svg.setAttribute("viewBox", "0 0 1000 760");
  svg.innerHTML = `<defs><radialGradient id="demo-pearl" cx="32%" cy="23%"><stop stop-color="#fff"/><stop offset=".35" stop-color="#e8e6e1"/><stop offset="1" stop-color="#666769"/></radialGradient><radialGradient id="demo-event" cx="32%" cy="23%"><stop stop-color="#fff0c6"/><stop offset=".38" stop-color="#ffb64c"/><stop offset="1" stop-color="#c73712"/></radialGradient><linearGradient id="demo-board" x2=".7" y2="1"><stop stop-color="#353638"/><stop offset="1" stop-color="#101112"/></linearGradient></defs>`;
  const board = element("path", {
    fill: "url(#demo-board)",
    stroke: "#8b8278",
    "stroke-width": "1.3",
  });
  svg.append(board);
  const grid = element("path", {
    fill: "none",
    stroke: "#85817b",
    "stroke-opacity": ".22",
    "stroke-width": "1",
  });
  svg.append(grid);
  const planes = Array.from({ length: 4 }, (_, i) => {
    const el = element("path", {
      fill: "#ff8524",
      "fill-opacity": ".025",
      stroke: "#c3b9a9",
      "stroke-opacity": ".22",
      "stroke-width": "1",
    });
    svg.append(el);
    const label = element("text", { fill: "#c7beb2", "font-size": "11" });
    label.textContent = `t = ${i}`;
    svg.append(label);
    return { el, label };
  });
  const qubits = study.qubits.map((q) => {
    const group = element("g", {}),
      socket = element("ellipse", {
        fill: "#080808",
        stroke: q.role === "data" ? "#b7aea0" : "#a4998c",
        "stroke-width": "2",
      }),
      ball = element("circle", {
        fill: "url(#demo-pearl)",
        stroke: "#fff3",
        "stroke-width": ".7",
      });
    group.append(socket, ball);
    svg.append(group);
    return { q, group, socket, ball };
  });
  const detectors = study.detectors.map((d) => {
    const el = element("circle", { stroke: "#fff5", "stroke-width": ".6" });
    svg.append(el);
    return { d, el };
  });
  const project = (x: number, y: number, z: number, v: DemoView) => {
    const c = Math.cos(v.yaw),
      s = Math.sin(v.yaw),
      rx = x * c - z * s,
      rz = x * s + z * c;
    return [
      500 + rx * 58 * v.zoom,
      485 + (rz * Math.sin(v.pitch) - y * Math.cos(v.pitch)) * 58 * v.zoom,
    ];
  };
  const shape = (y: number, v: DemoView) =>
    [
      [-4.3, -4.3],
      [4.3, -4.3],
      [4.3, 4.3],
      [-4.3, 4.3],
    ]
      .map(([x, z], i) => `${i ? "L" : "M"}${project(x, y, z, v).join(",")}`)
      .join(" ") + "Z";
  return {
    render(v: DemoView, trace: Trace) {
      const f = demoFrame(v.seconds);
      board.setAttribute("d", shape(-0.3, v));
      let lines = "";
      for (let i = -3; i <= 3; i++) {
        lines += `M${project(i, -0.28, -4, v)}L${project(i, -0.28, 4, v)}M${project(-4, -0.28, i, v)}L${project(4, -0.28, i, v)}`;
      }
      grid.setAttribute("d", lines);
      planes.forEach(({ el, label }, i) => {
        const visible = v.layers && f.slice >= i;
        el.setAttribute("display", visible ? "block" : "none");
        label.setAttribute("display", visible ? "block" : "none");
        el.setAttribute("d", shape(0.7 + i * 1.25, v));
        const [x, y] = project(-4.5, 0.7 + i * 1.25, -4.3, v);
        label.setAttribute("x", String(x));
        label.setAttribute("y", String(y));
      });
      qubits.forEach(({ q, group, socket, ball }) => {
        group.setAttribute(
          "display",
          q.role === "data" || f.phase >= 1 ? "block" : "none",
        );
        const [x, y] = project(
          q.coordinates[0] - 3,
          0,
          q.coordinates[1] - 3,
          v,
        );
        socket.setAttribute("cx", String(x));
        socket.setAttribute("cy", String(y + 8 * v.zoom));
        socket.setAttribute("rx", String(20 * v.zoom));
        socket.setAttribute("ry", String(8 * v.zoom));
        ball.setAttribute("cx", String(x));
        ball.setAttribute("cy", String(y - 5 * v.zoom));
        ball.setAttribute("r", String((q.role === "data" ? 15 : 10) * v.zoom));
      });
      detectors.forEach(({ d, el }) => {
        const visible = d.coordinates[2] <= f.slice;
        el.setAttribute("display", visible ? "block" : "none");
        const active = !!trace.detectionEvents[d.id],
          [x, y] = project(
            d.coordinates[0] - 3,
            0.7 + d.coordinates[2] * 1.25,
            d.coordinates[1] - 3,
            v,
          );
        el.setAttribute("cx", String(x));
        el.setAttribute("cy", String(y));
        el.setAttribute(
          "r",
          String(
            (active
              ? 9 * (v.reduced ? 1 : 1 + Math.sin(v.seconds * 3) * 0.1)
              : 4) * v.zoom,
          ),
        );
        el.setAttribute("fill", active ? "url(#demo-event)" : "#c9c4bc");
      });
    },
    dispose() {
      svg.replaceChildren();
    },
  };
}
