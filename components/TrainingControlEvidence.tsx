"use client";
import { useState } from "react";
import type { TrainingControl } from "@/lib/data";
import { IntervalComparison, type ErrorSeries } from "./charts/ErrorComparison";
const pct = (n: number) => (n * 100).toFixed(3) + "%";
export function TrainingControlEvidence({
  study,
}: {
  study: Pick<TrainingControl, "runId" | "conditions" | "model">;
}) {
  const [seed, setSeed] = useState(101);
  const high = study.conditions.at(-1)!;
  const outcome = high.seeds.find((s) => s.seed === seed)!;
  const series: ErrorSeries[] = [
    {
      label: `Neural trained at 0.5% · seed ${seed}`,
      kind: "diamond",
      color: "#326449",
      dash: "6 4",
      points: study.conditions.map((c) => ({
        measurementNoise: c.measurementNoise,
        metric: c.seeds.find((s) => s.seed === seed)!.fixedTraining,
      })),
    },
    {
      label: `Neural trained at each test noise · seed ${seed}`,
      kind: "circle",
      color: "#326449",
      points: study.conditions.map((c) => ({
        measurementNoise: c.measurementNoise,
        metric: c.seeds.find((s) => s.seed === seed)!.matchedTraining,
      })),
    },
    {
      label: "Matched-prior matching",
      kind: "square",
      color: "#4b567e",
      dash: "2 4",
      points: study.conditions.map((c) => ({
        measurementNoise: c.measurementNoise,
        metric: c.matchedMatching,
      })),
    },
  ];
  return (
    <>
      <section className="figure-section">
        <span className="eyebrow">01 / THE CONTROL</span>
        <h2>Change what the model learns.</h2>
        <div className="training-design">
          <div>
            <span>FIXED TRAINING</span>
            <strong>0.5%</strong>
            <p>One fitted group is reused at all four test settings.</p>
          </div>
          <div>
            <span>MATCHED TRAINING</span>
            <strong>0.1 · 0.5 · 1.5 · 3.0%</strong>
            <p>A fitted group for each known test-noise setting.</p>
          </div>
        </div>
        <p className="caption">
          Every fit has 40,000 training shots, 8,000 validation shots, the same
          1,345-parameter architecture and the same maximum training budget.
          Twelve checkpoints were frozen before any new final test shots were
          generated. The 0.5% comparison uses identical models by construction.
        </p>
        <div className="controls">
          <label>
            Model initialization
            <select
              value={seed}
              onChange={(e) => setSeed(Number(e.target.value))}
            >
              {study.model.seeds.map((s) => (
                <option key={s} value={s}>
                  Seed {s}
                  {s === 101 ? " — primary report" : ""}
                </option>
              ))}
            </select>
          </label>
        </div>
        <figure>
          <IntervalComparison series={series} trainingNoise={0.005} />
          <figcaption>
            100,000 fresh test shots at each setting, shared by every decoder
            and model initialization. Rates are per complete memory experiment.
            Bars are 95% Wilson intervals conditional on each fitted model.
            Lines connect only the four evaluated settings. Run: {study.runId}.
          </figcaption>
        </figure>
      </section>
      <section className="figure-section">
        <span className="eyebrow">02 / AT THE HIGHEST TESTED NOISE</span>
        <h2>Training helps. It has limits.</h2>
        <div className="confidence-facts">
          <div>
            <span>FIXED-TRAINING NEURAL ERROR</span>
            <strong>{pct(outcome.fixedTraining.errorRate)}</strong>
            <p>
              {outcome.fixedTraining.failures.toLocaleString()} /{" "}
              {high.shots.toLocaleString()}
            </p>
          </div>
          <div>
            <span>MATCHED-TRAINING NEURAL ERROR</span>
            <strong>{pct(outcome.matchedTraining.errorRate)}</strong>
            <p>
              {outcome.matchedTraining.failures.toLocaleString()} /{" "}
              {high.shots.toLocaleString()}
            </p>
          </div>
          <div>
            <span>MATCHED-PRIOR MATCHING ERROR</span>
            <strong>{pct(high.matchedMatching.errorRate)}</strong>
            <p>
              {high.matchedMatching.failures.toLocaleString()} /{" "}
              {high.shots.toLocaleString()}
            </p>
          </div>
        </div>
        <p className="large-copy">
          At {(high.measurementNoise * 100).toFixed(1)}% measurement noise,
          matched neural training makes{" "}
          {(
            outcome.fixedTraining.failures - outcome.matchedTraining.failures
          ).toLocaleString()}{" "}
          fewer mistakes on these same {high.shots.toLocaleString()} shots for
          seed {seed}. Matching still makes fewer mistakes than either neural
          model.
        </p>
        <p className="muted">
          The result is not uniform across noise levels. At 0.1%, matched
          training slightly increases classification errors in all three
          initializations. Brier score can improve even when classification
          errors increase; they measure different properties.
        </p>
        <div className="paired-strips">
          <div>
            <span>Fixed training alone correct</span>
            <i
              style={{
                width: `${(outcome.paired.fixedOnlyCorrect / (outcome.paired.fixedOnlyCorrect + outcome.paired.matchedOnlyCorrect)) * 100}%`,
              }}
            />
            <strong>{outcome.paired.fixedOnlyCorrect.toLocaleString()}</strong>
          </div>
          <div>
            <span>Matched training alone correct</span>
            <i
              style={{
                width: `${(outcome.paired.matchedOnlyCorrect / (outcome.paired.fixedOnlyCorrect + outcome.paired.matchedOnlyCorrect)) * 100}%`,
              }}
            />
            <strong>
              {outcome.paired.matchedOnlyCorrect.toLocaleString()}
            </strong>
          </div>
        </div>
        <p className="caption">
          Bar lengths show each side’s share of disagreement shots only, not all
          shots. Both correct: {outcome.paired.bothCorrect.toLocaleString()};
          both wrong: {outcome.paired.bothWrong.toLocaleString()}. These are
          paired counts, not independent samples; no significance test is
          asserted.
        </p>
      </section>
      <details className="data-detail">
        <summary>
          Inspect every initialization, exact count and Brier score
        </summary>
        <div
          className="table-scroll"
          role="region"
          aria-label="Matched-training control exact results"
          tabIndex={0}
        >
          <table>
            <caption>
              All fits and all test conditions. Within each training-noise
              group, three initializations share one training/validation
              dataset. Fixed and matched groups differ away from 0.5%.
            </caption>
            <thead>
              <tr>
                <th>Test noise</th>
                <th>Seed</th>
                <th>Fixed-training failures / shots</th>
                <th>Matched-training failures / shots</th>
                <th>Fixed Brier</th>
                <th>Matched Brier</th>
              </tr>
            </thead>
            <tbody>
              {study.conditions.flatMap((c) =>
                c.seeds.map((s) => (
                  <tr key={`${c.measurementNoise}-${s.seed}`}>
                    <td>{(c.measurementNoise * 100).toFixed(1)}%</td>
                    <td>{s.seed}</td>
                    <td>
                      {s.fixedTraining.failures.toLocaleString()} /{" "}
                      {c.shots.toLocaleString()}
                    </td>
                    <td>
                      {s.matchedTraining.failures.toLocaleString()} /{" "}
                      {c.shots.toLocaleString()}
                    </td>
                    <td>{s.fixedTraining.brier.toFixed(6)}</td>
                    <td>{s.matchedTraining.brier.toFixed(6)}</td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      </details>
    </>
  );
}
