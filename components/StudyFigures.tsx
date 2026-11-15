"use client";
import { useState } from "react";
import type { Study, Supplement } from "@/lib/data";
import { ErrorComparison, decoderSeries } from "./charts/ErrorComparison";
import { ReliabilityPlot } from "./charts/ReliabilityPlot";
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
  const series = decoderSeries;
  return (
    <>
      <section className="figure-section">
        <span className="eyebrow">FIGURE 01 / LOGICAL PREDICTION ERROR</span>
        <h2>When the noise changes.</h2>
        <figure>
          <ErrorComparison
            conditions={conditions}
            trainingNoise={Number(study.config.trainMeasurementNoise)}
          />
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
        <h2>Do flip probabilities match reality?</h2>
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
        <figure>
          <ReliabilityPlot bins={reliability} />
          <figcaption>
            Ten equal-width probability bins. Dashed diagonal: ideal
            calibration. The count panel shows how many shots support each bin;
            empty bins have no point. Circle size also encodes count. Vertical
            bars are pointwise 95% Wilson intervals for observed frequency,
            conditional on bin membership. They are not simultaneous intervals
            and do not include training variability. Seed 101,{" "}
            {c.shots.toLocaleString()} test shots. Run: {study.runId}.
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
