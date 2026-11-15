import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { StudyFigures } from "@/components/StudyFigures";
import { PairedComparison } from "@/components/PairedComparison";
import { SeedSensitivity } from "@/components/SeedSensitivity";
import { getStudy, getSupplement } from "@/lib/data";
export const metadata = { title: "The study" };
export default function StudyPage() {
  const s = getStudy();
  const baseline = s?.conditions.find(
    (c) => c.measurementNoise === s.config.trainMeasurementNoise,
  );
  const shifted = s?.conditions.at(-1);
  return (
    <>
      <PageHeader index="THE EVIDENCE / 03" title="Changing the conditions.">
        When measurement noise differs from the training distribution, how do
        logical prediction error and confidence calibration change for a compact
        neural decoder?
      </PageHeader>
      <div className="page-body">
        <div className="notice">
          {s ? `COMPLETED BOUNDED SIMULATION · ${s.runId}` : "PILOT PENDING"} ·
          Independent computational research. No quantum hardware experiment,
          quantum advantage claim, or reproduction of AlphaQubit.
        </div>
        {s ? (
          <>
            <p className="study-verdict">
              In this small study, the neural decoder makes more logical
              mistakes as measurement noise rises—and matching makes fewer
              mistakes at every tested setting.
            </p>
            <p className="muted">
              Read the measured curves and exact counts together. A lower Brier
              score alone does not establish better decoding; a low failure rate
              alone does not establish calibrated probabilities. This pilot is
              deliberately narrow.
            </p>
            {baseline && shifted && (
              <div className="finding-band" id="result-summary">
                <div>
                  <span>
                    TRAINING NOISE /{" "}
                    {(baseline.measurementNoise * 100).toFixed(1)}%
                  </span>
                  <strong>
                    {(baseline.neural.errorRate * 100).toFixed(2)}%
                  </strong>
                  <p>
                    Neural error · {baseline.neural.failures} /{" "}
                    {baseline.shots.toLocaleString()} shots
                  </p>
                </div>
                <div>
                  <span>
                    SHIFTED NOISE /{" "}
                    {(shifted.measurementNoise * 100).toFixed(1)}%
                  </span>
                  <strong>
                    {(shifted.neural.errorRate * 100).toFixed(2)}%
                  </strong>
                  <p>
                    Neural error · {shifted.neural.failures} /{" "}
                    {shifted.shots.toLocaleString()} shots
                  </p>
                </div>
                <div>
                  <span>
                    MATCHED MATCHING /{" "}
                    {(shifted.measurementNoise * 100).toFixed(1)}%
                  </span>
                  <strong>
                    {(shifted.matchedMatching.errorRate * 100).toFixed(2)}%
                  </strong>
                  <p>
                    {shifted.matchedMatching.failures} /{" "}
                    {shifted.shots.toLocaleString()} shots
                  </p>
                </div>
              </div>
            )}
            <p className="caption">
              Primary model seed 101, fixed before evaluation. Every rate is per
              complete memory experiment. Confidence intervals and all settings
              are below. This is a result of this bounded simulation, not a
              claim about all neural decoders.
            </p>
            <div className="data-links">
              <a href="/data/study.json" download>
                Download aggregate JSON ↓
              </a>
              <a href="/data/manifest.json" download>
                Run manifest ↓
              </a>
              <Link href="/methods">Inspect methods →</Link>
              <Link href="/study/confirmation">Fresh-shot confirmation →</Link>
              <a href="/data/metrics.csv" download>
                Metrics CSV ↓
              </a>
              <a href="/figures/logical-error-sweep.svg" download>
                Sweep figure SVG ↓
              </a>
              <a href="/figures/calibration.pdf" download>
                Calibration figure PDF ↓
              </a>
            </div>
            <StudyFigures study={s} supplement={getSupplement()} />
            <SeedSensitivity study={s} />
            <PairedComparison supplement={getSupplement()} />
            <section className="prose">
              <h2>What these results can tell us.</h2>
              <p>
                These measurements apply to the particular distance, rounds,
                basis, circuit noise, model capacity and shot budget documented
                here. A change along the sweep is descriptive evidence under
                controlled measurement-noise mismatch. It is not a general
                estimate of neural decoders on quantum hardware.
              </p>
              <p>
                The matching baselines solve a structured inference problem
                using an approximate graph derived from the circuit. The
                matched-prior baseline is given the true evaluation noise
                specification. The neural model is held fixed after training.
              </p>
              <h3>Read the limitations with the curves.</h3>
              <p>
                Binomial intervals describe finite test-shot uncertainty
                conditional on the fitted model. They do not include
                training-seed variability, noise-model misspecification, or
                hardware drift. Additional training seeds are reported
                separately in the downloadable artifact rather than pooled into
                an apparently larger test sample.
              </p>
              <Link className="text-link" href="/methods">
                Methods, seeds and limits <span>→</span>
              </Link>
            </section>
          </>
        ) : (
          <div className="empty">
            <h2>No results asserted.</h2>
            <p>
              The protocol exists, but this page requires a validated run. There
              are no invented benchmark values.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
