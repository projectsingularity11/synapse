import type { Study, Trace } from "@/lib/data";
/** An original space-time projection of actual Stim coordinates and saved detector bits. */
export function Lattice({ study, trace }: { study: Study; trace: Trace }) {
  const project = (x: number, y: number, t: number) => ({
    x: 125 + x * 48 + t * 14,
    y: 165 + y * 43 - t * 38,
  });
  return (
    <svg
      className="lattice dark-lattice"
      viewBox="0 0 600 500"
      role="img"
      aria-labelledby="hero-lattice-title hero-lattice-description"
    >
      <title id="hero-lattice-title">
        Saved distance-three detector history
      </title>
      <desc id="hero-lattice-description">{`${study.qubits.filter((q) => q.role === "data").length} data qubits and ${study.detectors.length} detector positions use actual circuit coordinates. Amber squares are the ${trace.detectionEvents.reduce((n, v) => n + v, 0)} observed detection events in saved shot ${trace.shotIndex} at measurement noise ${trace.measurementNoise * 100} percent. Space-time depth is a visual metaphor, not a measured quantum state.`}</desc>
      <defs>
        <pattern
          id="hero-dots"
          width="25"
          height="25"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1" cy="1" r=".8" fill="currentColor" opacity=".15" />
        </pattern>
      </defs>
      <rect width="600" height="500" fill="url(#hero-dots)" />
      <g transform="translate(0 4) rotate(-24 300 250) skewX(10)">
        {[0, 1, 2, 3].map((t) => {
          const a = project(0, 0, t),
            b = project(6, 0, t),
            c = project(6, 6, t),
            d = project(0, 6, t);
          return (
            <g key={t}>
              <path
                d={`M${a.x} ${a.y}L${b.x} ${b.y}L${c.x} ${c.y}L${d.x} ${d.y}Z`}
                fill="none"
                stroke="currentColor"
                strokeOpacity={t === 0 ? 0.22 : 0.1}
              />
              <text x={c.x + 14} y={c.y + 3} className="svg-note">
                t{t}
              </text>
            </g>
          );
        })}
        {study.qubits
          .filter((q) => q.role === "data")
          .map((q) => {
            const p = project(q.coordinates[0], q.coordinates[1], 0);
            return (
              <g key={q.id}>
                <circle cx={p.x} cy={p.y} r="12" className="qubit-halo" />
                <circle cx={p.x} cy={p.y} r="3.5" fill="currentColor" />
              </g>
            );
          })}
        {study.detectors.map((d) => {
          const p = project(
            d.coordinates[0],
            d.coordinates[1],
            d.coordinates[2],
          );
          const active = trace.detectionEvents[d.id] === 1;
          return (
            <g key={d.id}>
              <rect
                x={p.x - (active ? 6 : 3)}
                y={p.y - (active ? 6 : 3)}
                width={active ? 12 : 6}
                height={active ? 12 : 6}
                fill={active ? "var(--event)" : "none"}
                stroke={active ? "var(--event)" : "currentColor"}
                strokeOpacity={active ? 1 : 0.3}
              />
              {active && (
                <text x={p.x + 12} y={p.y + 3} className="svg-note event-id">
                  D{d.id}
                </text>
              )}
            </g>
          );
        })}
      </g>
      <text x="44" y="470" className="svg-note">
        d = 3 / Z MEMORY / SAVED SHOT {trace.shotIndex}
      </text>
      <text x="452" y="470" className="svg-note">
        24 DETECTORS
      </text>
    </svg>
  );
}
