"use client";
import type { Condition, Metric } from "@/lib/data";
import { ResponsivePlot, Point, chartColors } from "./ResponsivePlot";
export const decoderSeries = [
  {
    key: "neural" as const,
    label: "Neural · seed 101",
    kind: "diamond" as const,
    color: chartColors.neural,
    dash: undefined,
  },
  {
    key: "fixedMatching" as const,
    label: "Fixed-prior matching",
    kind: "square" as const,
    color: chartColors.fixed,
    dash: "6 4",
  },
  {
    key: "matchedMatching" as const,
    label: "Matched-prior matching",
    kind: "circle" as const,
    color: chartColors.matched,
    dash: "2 4",
  },
];
export type ErrorSeries = {
  label: string;
  kind: "diamond" | "square" | "circle";
  color: string;
  dash?: string;
  points: { measurementNoise: number; metric: Metric }[];
};
export function ErrorComparison({
  conditions,
  trainingNoise,
}: {
  conditions: Condition[];
  trainingNoise: number;
}) {
  const series = decoderSeries.map((s) => ({
    ...s,
    points: conditions.map((c) => ({
      measurementNoise: c.measurementNoise,
      metric: c[s.key],
    })),
  }));
  return <IntervalComparison series={series} trainingNoise={trainingNoise} />;
}
export function IntervalComparison({
  series,
  trainingNoise,
}: {
  series: ErrorSeries[];
  trainingNoise: number;
}) {
  const conditions = series[0].points;
  const maximum = Math.max(
    ...series.flatMap((s) => s.points.map((p) => p.metric.ci95[1])),
  );
  const ymax = Math.max(0.01, Math.ceil(maximum * 1.15 * 100) / 100);
  const min = Math.min(...conditions.map((c) => c.measurementNoise)),
    max = Math.max(...conditions.map((c) => c.measurementNoise));
  return (
    <>
      <div className="axis-heading">
        Logical prediction error per complete experiment (%)
      </div>
      <ResponsivePlot
        title="Logical prediction error across measured noise settings"
        description="The complete noise range is shown. Points use exact measurement probabilities; vertical bars are 95% Wilson intervals."
      >
        {({ width, height }) => {
          const left = 46,
            right = 18,
            top = 18,
            bottom = height - 42;
          const x = (v: number) =>
            left + ((v - min) / (max - min || 1)) * (width - left - right);
          const y = (v: number) => bottom - (v / ymax) * (bottom - top);
          return (
            <>
              {Array.from({ length: 6 }, (_, i) => {
                const v = (ymax * i) / 5;
                return (
                  <g key={i}>
                    <path
                      d={`M${left} ${y(v)}H${width - right}`}
                      stroke={chartColors.grid}
                    />
                    <text x={left - 10} y={y(v) + 4} textAnchor="end">
                      {(v * 100).toFixed(v * 100 < 1 && v > 0 ? 1 : 0)}%
                    </text>
                  </g>
                );
              })}
              <path
                d={`M${x(trainingNoise)} ${top}V${bottom}`}
                stroke="#879482"
                strokeDasharray="2 5"
              />
              {conditions.map((c) => (
                <g key={c.measurementNoise}>
                  <text
                    x={x(c.measurementNoise)}
                    y={bottom + 24}
                    textAnchor="middle"
                  >
                    {(c.measurementNoise * 100).toFixed(1)}%
                  </text>
                  <path
                    d={`M${x(c.measurementNoise)} ${bottom}v5`}
                    stroke={chartColors.muted}
                  />
                </g>
              ))}
              {series.map((s) => (
                <g key={s.label}>
                  <polyline
                    points={s.points
                      .map(
                        (p) =>
                          `${x(p.measurementNoise)},${y(p.metric.errorRate)}`,
                      )
                      .join(" ")}
                    stroke={s.color}
                    strokeWidth="1.8"
                    strokeDasharray={s.dash}
                    fill="none"
                  />
                  {s.points.map((p) => {
                    const m = p.metric,
                      px = x(p.measurementNoise);
                    return (
                      <g key={p.measurementNoise}>
                        <path
                          d={`M${px} ${y(m.ci95[0])}V${y(m.ci95[1])}m-3 0h6M${px - 3} ${y(m.ci95[0])}h6`}
                          stroke={s.color}
                        />
                        <Point
                          x={px}
                          y={y(m.errorRate)}
                          kind={s.kind}
                          color={s.color}
                        />
                      </g>
                    );
                  })}
                </g>
              ))}
            </>
          );
        }}
      </ResponsivePlot>
      <div className="axis-footer">
        Measurement-flip probability per measurement (%)
      </div>
      <div className="legend">
        {series.map((s) => (
          <span key={s.label}>
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <Point x={7} y={7} kind={s.kind} color={s.color} />
            </svg>
            {s.label}
            {s.dash === "6 4"
              ? " (dashed)"
              : s.dash === "2 4"
                ? " (dotted)"
                : ""}
          </span>
        ))}
      </div>
      <p className="caption">
        The vertical guide marks the fixed-training measurement noise. Marker
        positions are exact; there is no horizontal jitter.
      </p>
    </>
  );
}
