import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { StudyFigures } from "@/components/StudyFigures";
import { getConfirmation, getStudy } from "@/lib/data";
export const metadata = { title: "Fresh-shot confirmation" };
const pct = (n: number) => (n * 100).toFixed(3) + "%";
export default function ConfirmationPage() {
  const s = getStudy(),
    c = getConfirmation();
  return (
    <>
      <PageHeader
        index="A SECOND LOOK / FROZEN MODEL"
        title="A fresh set of clues."
      >
        More held-out shots. The same frozen model. A separate check of the
        initial pattern, with narrower sampling uncertainty.
      </PageHeader>
      <div className="page-body">
        <div className="data-links">
          <Link href="/study">Original study →</Link>
          <a href="/data/confirmation.json" download>
            Fresh-shot data ↓
          </a>
          <a href="/data/confirmation-manifest.json" download>
            Confirmation manifest ↓
          </a>
          <a href="/data/confirmation-protocol.md">Recorded protocol ↓</a>
        </div>
        {c && s ? (
          <>
            <div className="notice">
              FROZEN-MODEL CONFIRMATION · {c.runId}. 100,000 new test shots per
              setting; no retraining, recalibration, threshold tuning or
              checkpoint selection. This follow-up was designed after seeing the
              original study and its protocol was committed before drawing the
              new test labels.
            </div>
            <p className="study-verdict">
              The pattern persists on fresh shots: the frozen neural model’s
              logical error rises under measurement-noise mismatch, and matching
              retains the lower observed error.
            </p>
            <div className="prose">
              <p>
                The additional 400,000 shots use random streams distinct from
                the original train, validation and test streams. They reduce
                Monte Carlo uncertainty conditional on the same fitted seed-101
                model. They do not independently repeat training, validate
                hardware, or establish universal robustness.
              </p>
              <p>
                The original 20,000-shot results remain separate. They are not
                pooled with the fresh 100,000-shot results. Both neural and
                matching predictions use the same new shots within each setting.
              </p>
            </div>
            <div
              className="table-scroll"
              role="region"
              tabIndex={0}
              aria-label="Original and fresh-shot neural errors"
            >
              <table>
                <caption>
                  Original and fresh-shot results for the same frozen neural
                  model; 95% Wilson intervals describe each sample separately.
                </caption>
                <thead>
                  <tr>
                    <th>Measurement noise</th>
                    <th>Original failures / shots</th>
                    <th>Original error [95% CI]</th>
                    <th>Fresh failures / shots</th>
                    <th>Fresh error [95% CI]</th>
                  </tr>
                </thead>
                <tbody>
                  {c.conditions.map((f) => {
                    const old = s.conditions.find(
                      (o) => o.measurementNoise === f.measurementNoise,
                    );
                    return (
                      <tr key={f.measurementNoise}>
                        <td>{(f.measurementNoise * 100).toFixed(1)}%</td>
                        <td>
                          {old?.neural.failures} / {old?.shots.toLocaleString()}
                        </td>
                        <td>
                          {old
                            ? `${pct(old.neural.errorRate)} [${old.neural.ci95.map(pct).join("–")}]`
                            : "Not measured"}
                        </td>
                        <td>
                          {f.neural.failures.toLocaleString()} /{" "}
                          {f.shots.toLocaleString()}
                        </td>
                        <td>
                          {pct(f.neural.errorRate)} [
                          {f.neural.ci95.map(pct).join("–")}]
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <StudyFigures study={c} />
            <div className="prose">
              <h2>Precision has a boundary.</h2>
              <p>
                A larger test sample tightens a confidence interval about this
                model in this simulator. It does not correct a misspecified
                physical noise model or make three training seeds representative
                of all models. Future work would repeat the entire
                data-generation and training procedure under a prespecified
                protocol.
              </p>
              <p>
                Parent run: {c.parentRunId}. The fresh-shot manifest records the
                frozen checkpoint hash, exact new seeds, package versions,
                source/config hashes and pre-label protocol commit.
              </p>
              <Link href="/sources#S08" className="text-link">
                Claim and source provenance →
              </Link>
            </div>
          </>
        ) : (
          <div className="empty">
            <h2>Confirmation pending.</h2>
            <p>
              No fresh-shot result is asserted until its validated artifact is
              available.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
