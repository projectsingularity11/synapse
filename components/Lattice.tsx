export function Lattice({
  events = [1, 4, 10],
  dark = false,
}: {
  events?: number[];
  dark?: boolean;
}) {
  const nodes = Array.from({ length: 9 }, (_, i) => ({
    x: 180 + (i % 3) * 100,
    y: 110 + Math.floor(i / 3) * 100,
  }));
  return (
    <svg
      className={dark ? "lattice dark-lattice" : "lattice"}
      viewBox="0 0 600 500"
      role="img"
      aria-labelledby={dark ? "hero-lattice-title" : "lattice-title"}
    >
      <title id={dark ? "hero-lattice-title" : "lattice-title"}>
        Conceptual surface-code instrument: nine data qubits and square check
        signals
      </title>
      <defs>
        <pattern
          id={dark ? "dots-dark" : "dots"}
          width="25"
          height="25"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1" cy="1" r=".8" fill="currentColor" opacity=".2" />
        </pattern>
      </defs>
      <rect
        width="600"
        height="500"
        fill={`url(#${dark ? "dots-dark" : "dots"})`}
      />
      <g transform="translate(10 20) rotate(-24 300 240) skewX(12)">
        <path
          d="M180 110H380V310H180ZM180 210H380M280 110V310"
          stroke="currentColor"
          opacity=".4"
          fill="none"
        />
        {[0, 1, 2, 3].map((i) => (
          <path
            key={i}
            d={`M${130 + i * 100} 60V360 M130 ${60 + i * 100}H430`}
            stroke="currentColor"
            opacity=".12"
            fill="none"
          />
        ))}
        {nodes.map((n, i) => (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r="13" className="qubit-halo" />
            <circle cx={n.x} cy={n.y} r="4" fill="currentColor" />
          </g>
        ))}
        {Array.from({ length: 12 }, (_, i) => {
          const x = 130 + (i % 4) * 100,
            y = 110 + Math.floor(i / 4) * 100;
          return (
            <g key={i}>
              <rect
                x={x - 6}
                y={y - 6}
                width="12"
                height="12"
                fill={events.includes(i) ? "var(--event)" : "none"}
                stroke={events.includes(i) ? "var(--event)" : "currentColor"}
                opacity={events.includes(i) ? 1 : 0.35}
              />
              {events.includes(i) && (
                <path
                  d={`M${x} ${y + 16}v40`}
                  stroke="var(--event)"
                  strokeDasharray="2 4"
                />
              )}
            </g>
          );
        })}
      </g>
      <path d="M470 120h55M497 92v55" stroke="currentColor" opacity=".4" />
      <text x="490" y="170" className="svg-note">
        Z
      </text>
      <text x="45" y="440" className="svg-note">
        d = 3 / CONCEPTUAL SCENE
      </text>
      <text x="490" y="440" className="svg-note">
        01—09
      </text>
    </svg>
  );
}
