import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Replay } from "@/components/Replay";
import { getStudy, getTopology, readArtifact, type Traces } from "@/lib/data";
export const metadata = { title: "Labeled failure gallery" };
export default function Failures() {
  const s = getStudy();
  const h = readArtifact<Traces & { parentRunId: string }>(
    "results/representative-traces/handpicked.json",
  );
  return (
    <>
      <PageHeader
        index="THE INSTRUMENT / SELECTED CASES"
        title="Where the decoders disagree."
      >
        A deliberately selected gallery of neural errors and disagreements.
        These examples explain failure modes; they do not estimate their
        frequency.
      </PageHeader>
      <div className="page-body">
        <div className="data-links">
          <Link href="/explore">Return to first-eight-shot replay →</Link>
          <a href="/data/handpicked.json" download>
            Download selected traces ↓
          </a>
        </div>
        <div className="notice">
          HANDPICKED / NOT REPRESENTATIVE. The first neural error and first
          neural-versus-matched disagreement at each measured setting were
          chosen deterministically after evaluation. A shot can appear twice
          under different selection rules. Use the complete aggregate counts to
          assess performance.
        </div>
        {s && h ? (
          <Suspense fallback={<p>Loading selected traces…</p>}>
            <Replay
              study={s}
              traces={{ ...h, runId: h.parentRunId }}
              topology={getTopology()}
            />
          </Suspense>
        ) : (
          <p className="empty">
            The selected-case artifact is unavailable. The main representative
            replay remains accessible.
          </p>
        )}
      </div>
    </>
  );
}
