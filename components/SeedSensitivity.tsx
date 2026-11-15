import type { Study } from "@/lib/data";
export function SeedSensitivity({ study }: { study: Study }) {
  return (
    <section className="figure-section">
      <span className="eyebrow">
        TRAINING VARIABILITY / THREE INITIALIZATIONS
      </span>
      <h2>Three starts. The same test.</h2>
      <p className="muted">
        All three models use the same disjoint training/validation splits and
        the same test shots. Each chooses its checkpoint on validation loss
        only. These are three fitted models, not 60,000 independent test shots
        at each noise setting.
      </p>
      <details className="data-detail">
        <summary>Inspect all three model initializations</summary>{" "}
        <div
          className="table-scroll"
          role="region"
          aria-label="Seed sensitivity table"
          tabIndex={0}
        >
          <table>
            <caption>
              Neural decoding across seeds; primary seed 101 was chosen in
              advance.
            </caption>
            <thead>
              <tr>
                <th>Measurement noise</th>
                <th>Model seed</th>
                <th>Failures / shots</th>
                <th>Logical error</th>
                <th>Brier score</th>
              </tr>
            </thead>
            <tbody>
              {study.conditions.flatMap((c) =>
                (c.neural.seeds ?? []).map((m) => (
                  <tr key={`${c.measurementNoise}-${m.seed}`}>
                    <td>{(c.measurementNoise * 100).toFixed(1)}%</td>
                    <td>{m.seed}</td>
                    <td>
                      {m.failures} / {c.shots.toLocaleString()}
                    </td>
                    <td>{(m.errorRate * 100).toFixed(3)}%</td>
                    <td>{m.brier.toFixed(5)}</td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      </details>
      <p className="caption">
        Seed variability is a separate source of uncertainty from the plotted
        Wilson intervals. Three seeds characterize only a small part of training
        variability; they do not establish robust performance across
        architectures or data budgets. Source: {study.runId}.
      </p>
    </section>
  );
}
