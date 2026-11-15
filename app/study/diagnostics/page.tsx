import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { ConfidenceEvidence } from "@/components/ConfidenceEvidence";
import { getDiagnostics, getConfirmation } from "@/lib/data";
export const metadata = { title: "Class balance & confidence" };
export default function DiagnosticsPage() {
  const d = getDiagnostics(),
    c = getConfirmation();
  const dataset = d?.datasets.find((x) => x.source === "confirmation");
  return (
    <>
      <PageHeader
        index="READING THE PROBABILITIES"
        title="What does “sure” mean?"
      >
        A low error rate can hide rare labels. A high confidence can hide
        mistakes. Inspect both against the actual held-out shots.
      </PageHeader>
      <div className="page-body">
        <div className="data-links">
          <Link href="/study">Original study →</Link>
          <Link href="/study/confirmation">Fresh-shot confirmation →</Link>
          <a href="/data/diagnostics.json" download>
            Diagnostic data ↓
          </a>
          <a href="/data/diagnostics-manifest.json" download>
            Diagnostic manifest ↓
          </a>
          <a href="/figures/follow-up/confidence-coverage.svg" download>
            Confidence figure SVG ↓
          </a>
        </div>
        <div className="notice">
          POST-HOC DIAGNOSTICS / NO NEW INDEPENDENT SAMPLES. These views reuse
          the existing frozen model and confirmation test shots. Bins and
          cutoffs are descriptive; there is no retraining, threshold tuning or
          calibration fitting.
        </div>
        {d && dataset && c ? (
          <>
            <ConfidenceEvidence
              dataset={dataset}
              trainingPrevalence={d.trainingPrevalence}
              conditions={c.conditions}
            />
            <p className="caption">
              Data run: {dataset.parentRunId}. Analysis: {d.runId}.{" "}
              <Link href="/sources#S09">Source and exact claims S09 →</Link>
            </p>
          </>
        ) : (
          <p className="empty">
            Validated diagnostic records are unavailable. No values are
            substituted.
          </p>
        )}
      </div>
    </>
  );
}
