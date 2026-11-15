"use client";
import type { ConfidenceGroup } from "@/lib/data";
import { ResponsivePlot, chartColors, Point } from "./ResponsivePlot";
export function SelectiveRisk({
  groups,
  selected,
}: {
  groups: ConfidenceGroup[];
  selected: number;
}) {
  const active = groups.filter(
    (g) => g.count > 0 && g.ci95 !== null && g.meanConfidence !== null,
  );
  const xmin = Math.max(0, Math.min(...active.map((g) => g.coverage)) - 0.03);
  const ymax = Math.max(
    0.01,
    Math.ceil(
      Math.max(...active.flatMap((g) => [g.ci95![1], 1 - g.meanConfidence!])) *
        1.15 *
        100,
    ) / 100,
  );
  return (
    <>
      <div className="axis-heading">
        Logical prediction error among retained shots (%)
      </div>
      <ResponsivePlot
        title="Confidence filtering: retained coverage and conditional error"
        description="Red is observed logical error; green is one minus the mean model confidence. The coverage axis is zoomed to the tested range. Threshold groups overlap."
      >
        {({ width, height }) => {
          const left = 46,
            right = 18,
            top = 20,
            bottom = height - 40;
          const x = (v: number) =>
              left + ((v - xmin) / (1 - xmin)) * (width - left - right),
            y = (v: number) => bottom - (v / ymax) * (bottom - top);
          return (
            <>
              {[0, 1, 2, 3, 4].map((i) => {
                const v = (i * ymax) / 4;
                return (
                  <g key={i}>
                    <path
                      d={`M${left} ${y(v)}H${width - right}`}
                      stroke={chartColors.grid}
                    />
                    <text x={left - 8} y={y(v) + 4} textAnchor="end">
                      {(v * 100).toFixed(1)}%
                    </text>
                  </g>
                );
              })}
              {[0, 0.5, 1].map((v) => {
                const coverage = xmin + (1 - xmin) * v;
                return (
                  <text
                    key={v}
                    x={x(coverage)}
                    y={bottom + 24}
                    textAnchor="middle"
                  >
                    {(coverage * 100).toFixed(0)}%
                  </text>
                );
              })}
              <polyline
                points={active
                  .map((g) => `${x(g.coverage)},${y(g.errorRate!)}`)
                  .join(" ")}
                stroke="var(--failure)"
                fill="none"
                strokeWidth="1.8"
              />
              <polyline
                points={active
                  .map((g) => `${x(g.coverage)},${y(1 - g.meanConfidence!)}`)
                  .join(" ")}
                stroke={chartColors.neural}
                fill="none"
                strokeDasharray="4 4"
                strokeWidth="1.8"
              />
              {active.map((g) => (
                <g key={g.minimumConfidence}>
                  <path
                    d={`M${x(g.coverage)} ${y(g.ci95![0])}V${y(g.ci95![1])}`}
                    stroke="var(--failure)"
                  />
                  <Point
                    x={x(g.coverage)}
                    y={y(g.errorRate!)}
                    kind="circle"
                    color="var(--failure)"
                  />
                  <Point
                    x={x(g.coverage)}
                    y={y(1 - g.meanConfidence!)}
                    kind="diamond"
                    color={chartColors.neural}
                  />
                  {g.minimumConfidence === selected && (
                    <circle
                      cx={x(g.coverage)}
                      cy={y(g.errorRate!)}
                      r="7"
                      fill="none"
                      stroke="var(--ink)"
                    />
                  )}
                </g>
              ))}
            </>
          );
        }}
      </ResponsivePlot>
      <div className="axis-footer">
        Share of the original test shots retained (%) · zoomed axis
      </div>
      <div className="legend">
        <span>
          <b className="failure-ink">●</b>Observed conditional error
        </span>
        <span>
          <b className="prediction-ink">◇</b>Model-implied mean error (dashed)
        </span>
      </div>
      <p className="caption">
        Each point is one cutoff fixed for this post-hoc analysis, not a new
        experiment. Threshold groups overlap. Bars are pointwise 95% Wilson
        intervals conditional on this model and selected group. Connecting lines
        only guide the eye.
      </p>
    </>
  );
}
