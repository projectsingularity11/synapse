import type { Supplement } from "@/lib/data";
export function PairedComparison({
  supplement,
}: {
  supplement: Supplement | null;
}) {
  if (!supplement) return null;
  return (
    <section className="figure-section">
      <span className="eyebrow">POST-HOC DIAGNOSTIC / PAIRED OUTCOMES</span>
      <h2>The same shot, two judgments.</h2>
      <p className="muted">
        These counts compare seed 101 with matching on exactly the same test
        shots. They reveal disagreements that two separate error rates hide.
        This descriptive analysis was added after the original run; it did not
        change the trained model, checkpoint or threshold.
      </p>
      <details className="data-detail">
        <summary>Inspect paired decoder counts</summary>{" "}
        <div
          className="table-scroll"
          role="region"
          aria-label="Paired decoder outcomes"
          tabIndex={0}
        >
          <table>
            <caption>
              Four mutually exclusive outcomes sum to 20,000 shots per
              comparison.
            </caption>
            <thead>
              <tr>
                <th>Measurement noise</th>
                <th>Matching prior</th>
                <th>Both correct</th>
                <th>Neural only correct</th>
                <th>Matching only correct</th>
                <th>Both wrong</th>
              </tr>
            </thead>
            <tbody>
              {supplement.conditions.flatMap((c) =>
                c.paired.map((p) => (
                  <tr key={`${c.measurementNoise}-${p.comparison}`}>
                    <td>{(c.measurementNoise * 100).toFixed(1)}%</td>
                    <td>
                      {p.comparison === "neural-vs-fixed" ? "Fixed" : "Matched"}
                    </td>
                    <td>{p.bothCorrect.toLocaleString()}</td>
                    <td>{p.neuralOnlyCorrect.toLocaleString()}</td>
                    <td>{p.matchingOnlyCorrect.toLocaleString()}</td>
                    <td>{p.bothWrong.toLocaleString()}</td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      </details>
      <p className="caption">
        No independent-sample significance claim is made from these paired data.
        Parent: {supplement.parentRunId}. Supplement: {supplement.runId}.
      </p>
      <a className="text-link" href="/data/supplement.json" download>
        Download diagnostics ↓
      </a>
    </section>
  );
}
