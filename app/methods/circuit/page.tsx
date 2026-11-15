import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { getStudy, readTextArtifact } from "@/lib/data";
export const metadata = { title: "Circuit & detector record" };
export default function CircuitPage() {
  const study = getStudy();
  const circuit = readTextArtifact(
    "experiments/manifests/training-circuit.stim",
  );
  const dem = readTextArtifact("experiments/manifests/training-model.dem");
  return (
    <>
      <PageHeader
        index="UNDER THE INSTRUMENT"
        title="The circuit is the contract."
      >
        Inspect the generated instructions, detector definitions and noise-model
        conversion behind the visual replay.
      </PageHeader>
      <div className="page-body">
        <div className="data-links">
          <Link href="/methods">Methods →</Link>
          <Link href="/explore">Replay →</Link>
          <a href="/data/training-circuit.stim" download>
            Stim circuit ↓
          </a>
          <a href="/data/training-model.dem" download>
            Detector error model ↓
          </a>
        </div>
        <div className="prose">
          <h2>A record, not an abstraction.</h2>
          <p>
            This is the actual retained training-noise circuit for{" "}
            {study?.runId ?? "the study"}. QUBIT_COORDS define the physical
            diagram. DETECTOR instructions define each parity comparison and its
            space-time coordinate. OBSERVABLE_INCLUDE identifies the logical
            observable. The sampler returns the detector bits and target
            observable separately.
          </p>
          <p>
            DEPOLARIZE1/2, reset-flip channels and pre-measurement errors are
            literal simulated channels. Their probabilities are protocol
            choices. The measurement-noise sweep changes the generated
            pre-measurement flip parameter, including terminal data readout; the
            other configured channels remain fixed.
          </p>
        </div>
        <details open>
          <summary>
            Generated Stim circuit · training measurement noise 0.5%
          </summary>
          <pre
            className="code-record"
            tabIndex={0}
            aria-label="Actual generated Stim circuit"
          >
            {circuit ??
              "Retained circuit unavailable. No circuit is substituted."}
          </pre>
        </details>
        <details>
          <summary>
            Decomposed detector error model · fixed-prior matching
          </summary>
          <p className="caption">
            The caret-separated components in the DEM arise from graphlike
            decomposition. Ordinary matching here does not enable
            correlation-aware inference. An exact graph matching solution is not
            an exact posterior over every circuit fault.
          </p>
          <pre
            className="code-record"
            tabIndex={0}
            aria-label="Actual decomposed detector error model"
          >
            {dem ?? "Retained detector error model unavailable."}
          </pre>
        </details>
        {study && (
          <details>
            <summary>Every detector coordinate and boundary</summary>
            <div
              className="table-scroll"
              role="region"
              aria-label="Full detector definitions"
              tabIndex={0}
            >
              <table>
                <caption>
                  Detector IDs index the 24 input features in this exact order.
                </caption>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>x, y, t</th>
                    <th>Boundary</th>
                    <th>Record offsets (XOR)</th>
                  </tr>
                </thead>
                <tbody>
                  {study.detectors.map((d) => (
                    <tr key={d.id}>
                      <td>D{d.id}</td>
                      <td>{d.coordinates.join(", ")}</td>
                      <td>{d.boundary}</td>
                      <td>
                        {d.measurementRecordOffsets
                          .map((n) => `rec[${n}]`)
                          .join(" XOR ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        )}
        <p className="caption">
          Source: retained circuit and DEM; official syntax in{" "}
          <Link href="/sources#S03">S03</Link>. The replay is bound to these
          coordinates, not a guessed detector ordering.
        </p>
      </div>
    </>
  );
}
