"use client";
import { useState } from "react";
import type { Study, Supplement } from "@/lib/data";
const pct = (n: number) => `${(n * 100).toFixed(2)}%`;
export function StudyFigures({
  study,
  supplement,
}: {
  study: Pick<Study, "runId" | "config" | "conditions">;
  supplement?: Supplement | null;
}) {
  const [index, setIndex] = useState(
    Math.max(
      0,
      study.conditions.findIndex(
        (c) => c.measurementNoise === study.config.trainMeasurementNoise,
      ),
    ),
  );
  const c = study.conditions[index];
  const conditions = study.conditions;
  const reliability =
    supplement?.conditions.find(
      (s) => s.measurementNoise === c.measurementNoise,
    )?.reliability ?? c.neural.reliability;
  const ymax =
    Math.max(
      0.05,
      ...conditions.flatMap((c) => [
        c.neural.ci95[1],
        c.fixedMatching.ci95[1],
        c.matchedMatching.ci95[1],
      ]),
    ) * 1.15;
  const xmin = Math.min(...conditions.map((c) => c.measurementNoise));
  const xmax = Math.max(...conditions.map((c) => c.measurementNoise));
  const x = (n: number) => 80 + ((n - xmin) / (xmax - xmin || 1)) * 680;
  const y = (n: number) => 330 - (n / ymax) * 280;
  const series = [
    {
      key: "neural" as const,
      label: "Neural · seed 101",
      color: "#326449",
      dash: "",
    },
    {
      key: "fixedMatching" as const,
      label: "Fixed-prior matching",
      color: "#55615b",
      dash: "6 4",
    },
    {
      key: "matchedMatching" as const,
      label: "Matched-prior matching",
      color: "#4b567e",
      dash: "2 4",
    },
  ];
  return (
    <>
      <section className="figure-section">
        <span className="eyebrow">FIGURE 01 / LOGICAL PREDICTION ERROR</span>
        <h2>When the noise changes.</h2>
        <p className="scroll-hint">
          The figure and data table scroll horizontally. Swipe, or focus either
          region and use the arrow keys, to inspect the full range.
        </p>
        <figure>
          <div
            className="chart-scroll"
            role="region"
            aria-label="Logical error comparison chart, scroll horizontally on small screens"
            tabIndex={0}
          >
            <svg
              className="chart"
              viewBox="0 0 840 420"
              role="img"
              aria-labelledby="comparison-title comparison-desc"
            >
              <title id="comparison-title">
                Logical prediction error across measurement-flip probability
              </title>
              <desc id="comparison-desc">
                Points are measured test conditions. Bars are 95 percent Wilson
                binomial confidence intervals. Exact values and counts are in
                the table below.
              </desc>
              {[0, 1, 2, 3, 4].map((i) => {
                const v = (ymax * i) / 4;
                return (
                  <g key={i}>
                    <path d={`M80 ${y(v)}H760`} stroke="#c4ccc0" />
                    <text x="64" y={y(v) + 4} textAnchor="end">
                      {pct(v)}
                    </text>
                  </g>
                );
              })}
              {conditions.map((c) => (
                <g key={c.measurementNoise}>
                  <text x={x(c.measurementNoise)} y="355" textAnchor="middle">
                    {pct(c.measurementNoise)}
                  </text>
                  <path
                    d={`M${x(c.measurementNoise)} 330v6`}
                    stroke="#59685e"
                  />
                </g>
              ))}
              {series.map((s, si) => (
                <g key={s.key}>
                  <polyline
                    points={conditions
                      .map(
                        (c) =>
                          `${x(c.measurementNoise)},${y(c[s.key].errorRate)}`,
                      )
                      .join(" ")}
                    fill="none"
                    stroke={s.color}
                    strokeWidth="2"
                    strokeDasharray={s.dash}
                  />
                  {conditions.map((c) => {
                    const m = c[s.key],
                      px = x(c.measurementNoise) + (si - 1) * 5;
                    return (
                      <g key={c.measurementNoise}>
                        <path
                          d={`M${px} ${y(m.ci95[0])}V${y(m.ci95[1])}m-4 0h8M${px - 4} ${y(m.ci95[0])}h8`}
                          stroke={s.color}
                        />
                        {si === 0 ? (
                          <path
                            d={`M${px} ${y(m.errorRate) - 5}l5 5-5 5-5-5z`}
                            fill={s.color}
                          />
                        ) : si === 1 ? (
                          <rect
                            x={px - 4}
                            y={y(m.errorRate) - 4}
                            width="8"
                            height="8"
                            fill={s.color}
                          />
                        ) : (
                          <circle
                            cx={px}
                            cy={y(m.errorRate)}
                            r="4"
                            fill={s.color}
                          />
                        )}
                      </g>
                    );
                  })}
                </g>
              ))}
              <text x="420" y="399" textAnchor="middle">
                Measurement-flip probability per measurement
              </text>
              <text
                transform="translate(16 192) rotate(-90)"
                textAnchor="middle"
              >
                Logical error per complete experiment
              </text>
            </svg>
          </div>
          <div className="legend">
            {series.map((s, i) => (
              <span key={s.key}>
                <b style={{ color: s.color }}>{["◇", "□", "○"][i]}</b>
                {s.label}
              </span>
            ))}
          </div>
          <figcaption>
            One complete distance-three, three-round Z-memory experiment per
            shot. Lines connect measured settings as a visual guide; no
            intervening setting was evaluated. Bars: 95% Wilson intervals
            conditional on one fitted model. Matched-prior matching knows the
            evaluation noise model. Run: {study.runId}.
          </figcaption>
        </figure>
        <details className="data-detail">
          <summary>Inspect exact failures, shot counts and intervals</summary>{" "}
          <div
            className="table-scroll"
            role="region"
            aria-label="Measured results table, scroll horizontally"
            tabIndex={0}
          >
            <table>
              <caption>
                Exact logical failures and test-shot counts. Error is per
                complete experiment.
              </caption>
              <thead>
                <tr>
                  <th>Measurement noise</th>
                  <th>Decoder</th>
                  <th>Failures / shots</th>
                  <th>Error</th>
                  <th>95% Wilson CI</th>
                </tr>
              </thead>
              <tbody>
                {conditions.flatMap((c) =>
                  series.map((s) => (
                    <tr key={`${c.measurementNoise}-${s.key}`}>
                      <td>{pct(c.measurementNoise)}</td>
                      <td>{s.label}</td>
                      <td>
                        {c[s.key].failures.toLocaleString()} /{" "}
                        {c.shots.toLocaleString()}
                      </td>
                      <td>{pct(c[s.key].errorRate)}</td>
                      <td>
                        {pct(c[s.key].ci95[0])}–{pct(c[s.key].ci95[1])}
                      </td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>
        </details>
      </section>
      <section className="figure-section">
        <span className="eyebrow">FIGURE 02 / PROBABILITY CALIBRATION</span>
        <h2>How much does confidence mean?</h2>
        <p className="muted">
          The model reports P(logical flip), not a physical fault probability. A
          calibrated predictor’s probability should agree with the observed flip
          frequency across comparable predictions.
        </p>
        <p className="caption">
          Brier score reflects both calibration and discrimination. Its increase
          alone does not isolate miscalibration.
        </p>
        <div className="controls">
          <label>
            Evaluation measurement noise
            <select
              value={index}
              onChange={(e) => setIndex(Number(e.target.value))}
            >
              {conditions.map((c, i) => (
                <option value={i} key={c.measurementNoise}>
                  {pct(c.measurementNoise)}
                </option>
              ))}
            </select>
          </label>
          <p>
            Brier score: <strong>{c.neural.brier.toFixed(5)}</strong>{" "}
            <span className="caption">(lower is better)</span>
          </p>
        </div>
        <p className="scroll-hint">
          The figure and data table scroll horizontally. Swipe, or focus either
          region and use the arrow keys, to inspect the full range.
        </p>
        <figure>
          <div
            className="chart-scroll"
            role="region"
            aria-label="Calibration chart, scroll horizontally on small screens"
            tabIndex={0}
          >
            <svg
              viewBox="0 0 840 410"
              className="chart"
              role="img"
              aria-labelledby="reliability-title"
            >
              <title id="reliability-title">{`Reliability diagram at ${pct(c.measurementNoise)} measurement noise`}</title>
              {[0, 0.25, 0.5, 0.75, 1].map((v) => (
                <g key={v}>
                  <path d={`M80 ${330 - v * 280}H760`} stroke="#c4ccc0" />
                  <text x="64" y={334 - v * 280} textAnchor="end">
                    {v.toFixed(2)}
                  </text>
                  <text x={80 + v * 680} y="353" textAnchor="middle">
                    {v.toFixed(2)}
                  </text>
                </g>
              ))}
              <path d="M80 330L760 50" stroke="#83917e" strokeDasharray="5 5" />
              {reliability
                .filter(
                  (b) =>
                    b.count > 0 &&
                    b.meanPrediction !== null &&
                    b.observedFrequency !== null,
                )
                .map((b, i) => (
                  <g key={i}>
                    {b.observedFrequencyCi95 && (
                      <path
                        d={`M${80 + b.meanPrediction! * 680} ${330 - b.observedFrequencyCi95[0] * 280}V${330 - b.observedFrequencyCi95[1] * 280}`}
                        stroke="#326449"
                        strokeWidth="1"
                      />
                    )}
                    <circle
                      cx={80 + b.meanPrediction! * 680}
                      cy={330 - b.observedFrequency! * 280}
                      r={5 + Math.sqrt(b.count / c.shots) * 12}
                      fill="#326449"
                      fillOpacity=".8"
                    />
                    <text
                      x={80 + b.meanPrediction! * 680 + 12}
                      y={330 - b.observedFrequency! * 280 - 8}
                    >
                      {b.count.toLocaleString()}
                    </text>
                  </g>
                ))}
              <text x="420" y="396" textAnchor="middle">
                Mean predicted probability of logical flip
              </text>
              <text
                transform="translate(16 192) rotate(-90)"
                textAnchor="middle"
              >
                Observed logical-flip frequency
              </text>
            </svg>
          </div>
          <figcaption>
            Ten equal-width probability bins. Dashed diagonal: ideal
            calibration. Labels show bin counts; empty bins have no point.
            Circle size also encodes count. Vertical bars are pointwise 95%
            Wilson intervals for observed frequency, conditional on bin
            membership. They are not simultaneous intervals and do not include
            training variability. Seed 101, {c.shots.toLocaleString()} test
            shots. Run: {study.runId}.
          </figcaption>
        </figure>
        <details className="data-detail">
          <summary>Inspect calibration bins, counts and uncertainty</summary>{" "}
          <div
            className="table-scroll"
            role="region"
            aria-label="Measured results table, scroll horizontally"
            tabIndex={0}
          >
            <table>
              <caption>
                Calibration bins at {pct(c.measurementNoise)} measurement noise
              </caption>
              <thead>
                <tr>
                  <th>Probability bin</th>
                  <th>Count</th>
                  <th>Mean prediction</th>
                  <th>Observed flip frequency</th>
                  <th>Pointwise 95% Wilson CI</th>
                </tr>
              </thead>
              <tbody>
                {reliability.map((b, i) => (
                  <tr key={i}>
                    <td>
                      [{b.lower.toFixed(1)}, {b.upper.toFixed(1)}
                      {i === 9 ? "]" : ")"}
                    </td>
                    <td>{b.count.toLocaleString()}</td>
                    <td>
                      {b.meanPrediction === null
                        ? "Empty bin"
                        : b.meanPrediction.toFixed(4)}
                    </td>
                    <td>
                      {b.observedFrequency === null
                        ? "Empty bin"
                        : b.observedFrequency.toFixed(4)}
                    </td>
                    <td>
                      {b.observedFrequencyCi95
                        ? `${b.observedFrequencyCi95[0].toFixed(4)}–${b.observedFrequencyCi95[1].toFixed(4)}`
                        : "Not available"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </section>
    </>
  );
}
