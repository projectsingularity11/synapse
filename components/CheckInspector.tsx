"use client";
import { useState } from "react";
import type { Study, Topology } from "@/lib/data";
export function CheckInspector({
  study,
  topology,
}: {
  study: Study;
  topology: Topology;
}) {
  const [id, setId] = useState(topology.checks[0].ancillaId);
  const check = topology.checks.find((c) => c.ancillaId === id)!;
  const ancilla = study.qubits.find((q) => q.id === id)!;
  const detectors = study.detectors.filter(
    (d) =>
      d.coordinates[0] === ancilla.coordinates[0] &&
      d.coordinates[1] === ancilla.coordinates[1],
  );
  return (
    <details className="check-inspector">
      <summary>
        Go deeper: inspect a stabilizer check and its detector records
      </summary>
      <h2>One check, several clues.</h2>
      <p className="muted">
        The light patches in the layout identify which data qubits participate
        in a check. The repeated history records changes in expected
        relationships between measurements. A detection event is not a report of
        a known physical fault.
      </p>
      <div className="controls">
        <label>
          Inspect measurement ancilla
          <select value={id} onChange={(e) => setId(Number(e.target.value))}>
            {topology.checks.map((c) => (
              <option key={c.ancillaId} value={c.ancillaId}>
                Q{c.ancillaId} / {c.basis} check / weight{" "}
                {c.dataQubitIds.length}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="check-summary" aria-live="polite">
        <p>
          <strong>{check.basis}-type stabilizer check</strong> · ancilla Q
          {check.ancillaId} at ({ancilla.coordinates.join(", ")})
        </p>
        <p>
          Data-qubit support:{" "}
          <strong>{check.dataQubitIds.map((n) => `Q${n}`).join(", ")}</strong>.
          This is the set of data qubits interacting with this ancilla through
          actual CX gates in the generated circuit, not a nearest-neighbor guess
          or a predicted error path.
        </p>
      </div>
      <div
        className="table-scroll"
        role="region"
        aria-label="Detector record definitions for selected check"
        tabIndex={0}
      >
        <table>
          <caption>
            Detectors at this check coordinate, in circuit index order. Some
            checks have no initial or final detector in this memory basis.
          </caption>
          <thead>
            <tr>
              <th>Detector</th>
              <th>Stim time</th>
              <th>Boundary</th>
              <th>Measurement-record offsets</th>
            </tr>
          </thead>
          <tbody>
            {detectors.map((d) => (
              <tr key={d.id}>
                <td>D{d.id}</td>
                <td>{d.coordinates[2]}</td>
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
      <p className="caption">
        Record offsets are relative to each DETECTOR declaration in the circuit.
        Their parity relation defines the detector. The full generated circuit
        is retained in the repository. {topology.procedure} Parent run:{" "}
        {topology.parentRunId}.
      </p>
    </details>
  );
}
