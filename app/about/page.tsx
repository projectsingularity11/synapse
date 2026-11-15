import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
export const metadata = { title: "About the project" };
export default function About() {
  return (
    <>
      <PageHeader index="PROJECT NOTES / 06" title="A question I wanted to test.">
        Synapse is an independent project by Assirem Benseddik
        investigating classical learning for quantum error decoding.
      </PageHeader>
      <div className="page-body prose">
        <h2>A question, not a claim of advantage.</h2>
        <p>
          This project joins a small reproducible simulation with an accessible
          explanation of what decoding does. It asks how measurement-noise
          mismatch affects logical prediction and probability calibration for a
          modest neural model.
        </p>
        <p>
          No laboratory access, quantum hardware experiment, institutional
          affiliation, publication, award or external collaboration is claimed.
          AlphaQubit and other published neural decoders are prior work, not
          systems reproduced by this study.
        </p>
        <h2>Created by Assirem Benseddik.</h2>
        <p>
          The implementation, writing and computational pipeline were prepared
          with AI coding agents under the project owner’s brief. Research,
          experiment and frontend work were assigned separate ownership and
          integrated with tests. That process does not replace independent
          scientific peer review.
        </p>
        <p>
          The canonical research vault holds the protocol, source records, claim
          ledger, scripts, manifests and aggregate results. Large training
          datasets are generated locally and are not shipped to the browser.
        </p>
        <h2>What comes next?</h2>
        <p>
          A careful extension could vary code distance, repeat sampling budgets,
          examine calibration under additional noise changes, or evaluate a
          mixed-noise training distribution. Those are future experiments, not
          completed findings.
        </p>
        <Link href="/methods" className="text-link">
          Read the limits <span>→</span>
        </Link>
      </div>
    </>
  );
}
