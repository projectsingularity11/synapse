"use client";
import type { Reliability } from "@/lib/data";
import { ResponsivePlot, chartColors } from "./ResponsivePlot";
export function ReliabilityPlot({ bins }: { bins: Reliability[] }) {
  return (
    <>
      <div className="axis-heading">Observed logical-flip frequency</div>
      <ResponsivePlot
        height={310}
        title="Reliability diagram"
        description="Mean predicted probability versus observed event frequency. Vertical bars are pointwise 95% Wilson intervals; circle area follows bin count."
      >
        {({ width, height }) => {
          const left = 46,
            right = 22,
            top = 24,
            bottom = height - 36;
          const x = (v: number) => left + v * (width - left - right),
            y = (v: number) => bottom - v * (bottom - top);
          const occupied = bins.filter(
            (b) =>
              b.count > 0 &&
              b.meanPrediction !== null &&
              b.observedFrequency !== null,
          );
          return (
            <>
              {[0, 0.25, 0.5, 0.75, 1].map((v) => (
                <g key={v}>
                  <path
                    d={`M${left} ${y(v)}H${width - right}`}
                    stroke={chartColors.grid}
                  />
                  <text x={left - 10} y={y(v) + 4} textAnchor="end">
                    {v.toFixed(v === 0 || v === 1 ? 0 : 2)}
                  </text>
                  <text x={x(v)} y={bottom + 24} textAnchor="middle">
                    {v.toFixed(v === 0 || v === 1 ? 0 : 2)}
                  </text>
                </g>
              ))}
              <path
                d={`M${x(0)} ${y(0)}L${x(1)} ${y(1)}`}
                stroke="#83917e"
                strokeDasharray="5 5"
              />
              {occupied.map((b, i) => {
                const px = x(b.meanPrediction!),
                  py = y(b.observedFrequency!);
                const total = bins.reduce((n, b) => n + b.count, 0);
                return (
                  <g key={i}>
                    {b.observedFrequencyCi95 && (
                      <path
                        d={`M${px} ${y(b.observedFrequencyCi95[0])}V${y(b.observedFrequencyCi95[1])}`}
                        stroke={chartColors.neural}
                      />
                    )}
                    <circle
                      cx={px}
                      cy={py}
                      r={Math.sqrt(12 + (180 * b.count) / total)}
                      fill={chartColors.neural}
                      fillOpacity=".78"
                    />
                    <title>{`Bin ${b.lower.toFixed(1)}–${b.upper.toFixed(1)}: ${b.count} shots; prediction ${b.meanPrediction!.toFixed(4)}, observed ${b.observedFrequency!.toFixed(4)}`}</title>
                  </g>
                );
              })}
            </>
          );
        }}
      </ResponsivePlot>
      <div className="axis-footer">
        Mean predicted probability of logical flip
      </div>
      <div className="bin-occupancy">
        <span className="axis-heading">How many shots support each bin?</span>
        <div
          className="bin-bars"
          role="img"
          aria-label={bins
            .map(
              (b) =>
                `${b.lower.toFixed(1)} to ${b.upper.toFixed(1)}: ${b.count} shots`,
            )
            .join("; ")}
        >
          {bins.map((b, i) => (
            <div key={i} className="bin-column">
              <span className="bin-count">{b.count.toLocaleString()}</span>
              <div className="bin-track">
                <i
                  style={{
                    height: `${b.count ? Math.max(3, (Math.log10(b.count + 1) / Math.log10(Math.max(...bins.map((b) => b.count)) + 1)) * 100) : 0}%`,
                  }}
                />
              </div>
              <span className="bin-edge">
                {b.lower.toFixed(1)}–{b.upper.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
        <p className="caption">
          Logarithmic count heights keep rare bins visible. Exact counts are
          printed above; zero-count bins have no bar. Bin edges: 0.0, 0.1, …,
          1.0.
        </p>
      </div>
    </>
  );
}
