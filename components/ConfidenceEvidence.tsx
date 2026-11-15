"use client";
import { useState } from "react";
import type { Diagnostics, Condition } from "@/lib/data";
import { SelectiveRisk } from "./charts/SelectiveRisk";
const percent = (n: number, digits = 2) => (n * 100).toFixed(digits) + "%";
export function ConfidenceEvidence({
  dataset,
  trainingPrevalence,
  conditions,
}: {
  dataset: Diagnostics["datasets"][number];
  trainingPrevalence: Diagnostics["trainingPrevalence"];
  conditions: Condition[];
}) {
  const [index, setIndex] = useState(dataset.conditions.length - 1);
  const [decoder, setDecoder] = useState<
    "neural" | "fixedMatching" | "matchedMatching"
  >("neural");
  const [cutoff, setCutoff] = useState(0.99);
  const c = dataset.conditions[index];
  const primary = conditions.find(
    (p) => p.measurementNoise === c.measurementNoise,
  )!;
  const matrix = c.confusion[decoder];
  const retained = c.selectiveRisk.find((g) => g.minimumConfidence === cutoff)!;
  const summary = [
    ["True no flip / predicted no flip", matrix.trueNegative, false],
    ["True no flip / predicted flip", matrix.falsePositive, true],
    ["True flip / predicted no flip", matrix.falseNegative, true],
    ["True flip / predicted flip", matrix.truePositive, false],
  ] as const;
  return (
    <>
      <div className="controls">
        <label>
          Noise setting for diagnostic sample
          <select
            value={index}
            onChange={(e) => setIndex(Number(e.target.value))}
          >
            {dataset.conditions.map((p, i) => (
              <option value={i} key={p.measurementNoise}>
                {percent(p.measurementNoise, 1)} measurement noise
              </option>
            ))}
          </select>
        </label>
        <span className="caption">
          {c.shots.toLocaleString()} saved confirmation shots · seed{" "}
          {c.testDataSeed}
        </span>
      </div>
      <section className="figure-section">
        <span className="eyebrow">01 / THE BASE RATE</span>
        <h2>A quiet majority.</h2>
        <p className="large-copy">
          {(c.shots - c.observableOneCount).toLocaleString()} of these{" "}
          {c.shots.toLocaleString()} shots have no logical flip. A predictor
          that always says “no flip” would already be{" "}
          {percent(1 - c.prevalence)} correct.
        </p>
        <figure>
          <div
            className="prevalence-bar"
            role="img"
            aria-label={`${c.shots - c.observableOneCount} no-flip labels and ${c.observableOneCount} flip labels`}
          >
            <span style={{ width: `${(1 - c.prevalence) * 100}%` }} />
            <i style={{ width: `${c.prevalence * 100}%` }} />
          </div>
          <div className="legend">
            <span>Plain: no flip · {percent(1 - c.prevalence)}</span>
            <span>Hatched: flip · {percent(c.prevalence)}</span>
          </div>
          <figcaption>
            Actual simulator labels, not fault locations. A logical flip is a
            target bit; it is not itself a decoder mistake. This class imbalance
            is why accuracy alone can be misleading.
          </figcaption>
        </figure>
        <div
          className="table-scroll"
          role="region"
          aria-label="Simple baseline comparison"
          tabIndex={0}
        >
          <table>
            <caption>
              Reference predictors versus the frozen neural decoder on exactly
              these shots.
            </caption>
            <thead>
              <tr>
                <th>Predictor</th>
                <th>Failures / shots</th>
                <th>Logical error</th>
                <th>95% error interval</th>
                <th>Brier score</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Always no flip</th>
                <td>
                  {c.baselines.alwaysNoFlip.failures.toLocaleString()} /{" "}
                  {c.shots.toLocaleString()}
                </td>
                <td>{percent(c.baselines.alwaysNoFlip.errorRate, 3)}</td>
                <td>
                  {c.baselines.alwaysNoFlip.ci95
                    .map((v) => percent(v, 3))
                    .join("–")}
                </td>
                <td>{c.baselines.alwaysNoFlip.brier.toFixed(5)}</td>
              </tr>
              <tr>
                <th>Constant training prevalence</th>
                <td>Same binary decisions as no flip</td>
                <td>{percent(c.prevalence, 3)}</td>
                <td>
                  {c.baselines.alwaysNoFlip.ci95
                    .map((v) => percent(v, 3))
                    .join("–")}
                </td>
                <td>
                  {c.baselines.trainingPrevalenceConstant.brier.toFixed(5)}
                </td>
              </tr>
              <tr>
                <th>Neural · seed 101</th>
                <td>
                  {primary.neural.failures.toLocaleString()} /{" "}
                  {c.shots.toLocaleString()}
                </td>
                <td>{percent(primary.neural.errorRate, 3)}</td>
                <td>
                  {primary.neural.ci95.map((v) => percent(v, 3)).join("–")}
                </td>
                <td>{primary.neural.brier.toFixed(5)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="caption">
          The constant-probability reference uses{" "}
          {trainingPrevalence.observableOneCount.toLocaleString()}/
          {trainingPrevalence.shots.toLocaleString()} original training labels:
          P(flip)={trainingPrevalence.probability.toFixed(6)}. No test label
          fits that constant. Since it is below 0.5, its binary decision is
          always no flip. Brier measures both discrimination and calibration.
          These are pointwise 95% Wilson error intervals conditional on the
          predictor.
        </p>
        <p className="muted">
          The neural decoder makes{" "}
          {(
            c.baselines.alwaysNoFlip.failures - primary.neural.failures
          ).toLocaleString()}{" "}
          fewer logical prediction errors than always saying “no flip” on these
          shots. That gain does not, by itself, establish calibrated confidence.
        </p>
      </section>
      <section className="figure-section">
        <span className="eyebrow">02 / TWO KINDS OF MISTAKE</span>
        <h2>Which answer was wrong?</h2>
        <div className="controls">
          <label>
            Decoder for outcome matrix
            <select
              value={decoder}
              onChange={(e) => setDecoder(e.target.value as typeof decoder)}
            >
              <option value="neural">Neural · seed 101</option>
              <option value="fixedMatching">Fixed-prior matching</option>
              <option value="matchedMatching">Matched-prior matching</option>
            </select>
          </label>
        </div>
        <figure>
          <div className="outcome-matrix">
            {summary.map(([label, count, wrong]) => (
              <div
                key={label}
                className={wrong ? "matrix-cell is-mistake" : "matrix-cell"}
              >
                <span>{wrong ? "× INCORRECT" : "CORRECT"}</span>
                <strong>{count.toLocaleString()}</strong>
                <p>{label}</p>
                <small>{percent(count / c.shots)} of all shots</small>
              </div>
            ))}
          </div>
          <figcaption>
            Four mutually exclusive groups sum to {c.shots.toLocaleString()}{" "}
            shots. A false positive predicts a flip that did not occur; a false
            negative misses a flip that did occur. The simulator supplies truth
            only for evaluation. Matched-prior matching knows the evaluation
            noise model.
          </figcaption>
        </figure>
      </section>
      <section className="figure-section">
        <span className="eyebrow">03 / CONFIDENCE IS NOT A GUARANTEE</span>
        <h2>Keep only the “sure” answers?</h2>
        <p className="muted">
          The original probability is P(flip). Here, confidence means
          max(P(flip), 1−P(flip)): confidence in whichever binary class the
          model predicts. A no-flip prediction can therefore have high
          confidence too.
        </p>
        <div className="controls">
          <label>
            Retain predictions with confidence at least
            <select
              value={cutoff}
              onChange={(e) => setCutoff(Number(e.target.value))}
            >
              {c.selectiveRisk.map((g) => (
                <option key={g.minimumConfidence} value={g.minimumConfidence}>
                  {percent(g.minimumConfidence!, 0)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="confidence-facts" aria-live="polite">
          <div>
            <span>RETAINED COVERAGE</span>
            <strong>{percent(retained.coverage, 1)}</strong>
            <p>
              {retained.count.toLocaleString()} / {c.shots.toLocaleString()}{" "}
              shots
            </p>
          </div>
          <div>
            <span>MEAN MODEL CONFIDENCE</span>
            <strong>
              {retained.meanConfidence === null
                ? "No shots"
                : percent(retained.meanConfidence, 2)}
            </strong>
            <p>Among retained predictions</p>
          </div>
          <div>
            <span>OBSERVED ACCURACY</span>
            <strong>
              {retained.observedAccuracy === null
                ? "No shots"
                : percent(retained.observedAccuracy, 2)}
            </strong>
            <p>{retained.failures.toLocaleString()} mistakes retained</p>
          </div>
        </div>
        <SelectiveRisk groups={c.selectiveRisk} selected={cutoff} />
        <details className="data-detail">
          <summary>Inspect every confidence cutoff and uncertainty</summary>
          <div
            className="table-scroll"
            tabIndex={0}
            role="region"
            aria-label="Confidence-filtering counts and intervals"
          >
            <table>
              <caption>
                Post-hoc descriptive cutoffs; they were not optimized on the
                labels.
              </caption>
              <thead>
                <tr>
                  <th>Confidence ≥</th>
                  <th>Retained</th>
                  <th>Coverage</th>
                  <th>Mistakes</th>
                  <th>Observed error [95% CI]</th>
                </tr>
              </thead>
              <tbody>
                {c.selectiveRisk.map((g) => (
                  <tr key={g.minimumConfidence}>
                    <td>{percent(g.minimumConfidence!, 0)}</td>
                    <td>{g.count.toLocaleString()}</td>
                    <td>{percent(g.coverage)}</td>
                    <td>{g.failures}</td>
                    <td>
                      {g.errorRate === null
                        ? "No shots"
                        : `${percent(g.errorRate, 3)} [${g.ci95?.map((v) => percent(v, 3)).join("–")}]`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
        <p className="notice">
          This is a diagnostic, not an operating recommendation or a fitted
          calibration method. Rejecting predictions changes coverage and error
          together; it does not repair incorrect probabilities. It cannot
          establish a safe deployment threshold.
        </p>
      </section>
    </>
  );
}
