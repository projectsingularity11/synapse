import Link from "next/link";
import type { Study, Trace } from "@/lib/data";
import {
  demoFrame,
  recordedPrediction,
  type Decoder,
} from "@/lib/demo-timeline";
export function DemoSidebar({
  study,
  trace,
  available,
  decoder,
  position,
  onNoise,
  onShot,
  onDecoder,
}: {
  study: Study;
  trace: Trace;
  available: Trace[];
  decoder: Decoder;
  position: number;
  onNoise: (n: number) => void;
  onShot: (n: number) => void;
  onDecoder: (d: Decoder) => void;
}) {
  const f = demoFrame(position),
    condition = study.conditions.find(
      (c) => c.measurementNoise === trace.measurementNoise,
    )!,
    metric = condition[decoder],
    events = study.detectors.filter(
      (d) => d.coordinates[2] <= f.slice && trace.detectionEvents[d.id],
    ).length,
    observed = study.detectors.filter(
      (d) => d.coordinates[2] <= f.slice,
    ).length,
    prediction = recordedPrediction(trace, decoder);
  return (
    <aside
      className="demo-sidebar"
      aria-label="Recorded demo parameters and results"
    >
      <div className="demo-sidebar-heading">
        <span className="micro">SAVED EXPERIMENT</span>
        <h1>Recorded demo</h1>
        <p>
          Follow one quantum-memory shot, from encoding to the saved decoder
          result.
        </p>
      </div>
      <div className="demo-parameters">
        <label>
          Measurement noise
          <select
            aria-label="Measurement noise"
            value={trace.measurementNoise}
            onChange={(e) => onNoise(Number(e.target.value))}
          >
            {study.conditions.map((c) => (
              <option key={c.measurementNoise} value={c.measurementNoise}>
                {(c.measurementNoise * 100).toFixed(1)}%
                {c.measurementNoise === 0.005 ? " · training setting" : ""}
              </option>
            ))}
          </select>
        </label>
        <p>
          Changes the chance of a flipped measurement. Each choice loads a
          recorded evaluation setting.
        </p>
        <label>
          Saved shot
          <select
            aria-label="Saved shot"
            value={trace.shotIndex}
            onChange={(e) => onShot(Number(e.target.value))}
          >
            {available.map((t) => (
              <option key={t.id} value={t.shotIndex}>
                Shot {t.shotIndex} ·{" "}
                {t.detectionEvents.reduce((a, b) => a + b, 0)} events
              </option>
            ))}
          </select>
        </label>
        <label>
          Decoder
          <select
            aria-label="Decoder"
            value={decoder}
            onChange={(e) => onDecoder(e.target.value as Decoder)}
          >
            <option value="neural">Neural network</option>
            <option value="matchedMatching">Matching · known noise</option>
            <option value="fixedMatching">Matching · training noise</option>
          </select>
        </label>
      </div>
      <section className="demo-shot-stats">
        <h2>Current shot</h2>
        <dl>
          <div>
            <dt>Detector bits revealed</dt>
            <dd>
              {observed}
              <small> / 24</small>
            </dd>
          </div>
          <div>
            <dt>Detection events</dt>
            <dd>{events}</dd>
          </div>
        </dl>
        <div className="demo-result" aria-live="polite">
          {f.complete ? (
            <>
              <strong>
                {prediction
                  ? "Logical flip predicted"
                  : "No logical flip predicted"}
              </strong>
              <span>
                Simulator truth:{" "}
                {trace.observable ? "logical flip" : "no logical flip"} ·{" "}
                {prediction === trace.observable ? "correct" : "incorrect"}{" "}
                prediction
              </span>
            </>
          ) : (
            <>
              <strong>Result appears in step 4</strong>
              <span>
                The decoder uses all 24 bits, even while later slices are
                hidden.
              </span>
            </>
          )}
        </div>
      </section>
      <section className="demo-evaluation">
        <h2>Evaluation at this noise</h2>
        <dl>
          <div>
            <dt>Logical error rate</dt>
            <dd>
              {(metric.errorRate * 100).toFixed(3)}
              <small>%</small>
            </dd>
          </div>
          <div>
            <dt>Saved test shots</dt>
            <dd>{condition.shots.toLocaleString()}</dd>
          </div>
        </dl>
        <p>
          {metric.failures.toLocaleString()} failures in the complete
          evaluation, independent of playback position.
        </p>
        <Link href="/study">Compare all decoders ↗</Link>
      </section>
      <details className="demo-record-details">
        <summary>Recording details</summary>
        <p>
          The menu contains the first eight saved shots at each setting, not a
          representative error-rate sample. Evaluation metrics use all 20,000
          test shots. Other circuit-noise channels stay fixed at 0.1%. Neural
          results use the saved seed-101 model.
        </p>
      </details>
      <Link
        className="demo-record-link"
        href={`/explore?noise=${trace.measurementNoise}&shot=${trace.shotIndex}`}
      >
        Inspect this shot’s full record ↗
      </Link>
    </aside>
  );
}
