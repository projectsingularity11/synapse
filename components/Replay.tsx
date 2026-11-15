"use client";
import { useState } from "react";
import { CheckInspector } from "./CheckInspector";
import { SpatialView } from "./SpatialView";
import { useSearchParams } from "next/navigation";
import type { Study, Traces, Topology } from "@/lib/data";
type Qubit = Study["qubits"][number];
export function Replay({
  study,
  traces,
  topology,
}: {
  study: Study;
  traces: Traces;
  topology?: Topology | null;
}) {
  const params = useSearchParams();
  const requestedNoise = Number(params.get("noise"));
  const invalidNoise =
    params.has("noise") &&
    !study.conditions.some((c) => c.measurementNoise === requestedNoise);
  const noise =
    params.has("noise") &&
    study.conditions.some((c) => c.measurementNoise === requestedNoise)
      ? requestedNoise
      : study.conditions[0].measurementNoise;
  const [time, setTime] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const available = traces.traces.filter((t) => t.measurementNoise === noise);
  const requestedShot = Number(params.get("shot"));
  const traceIndex = Math.max(
    0,
    available.findIndex((t) =>
      params.has("trace")
        ? t.id === params.get("trace")
        : t.shotIndex === requestedShot,
    ),
  );
  const trace = available[traceIndex] ?? available[0];
  const times = [...new Set(study.detectors.map((d) => d.coordinates[2]))].sort(
    (a, b) => a - b,
  );
  const currentTime = times[time] ?? times[0];
  const events = trace
    ? study.detectors.filter(
        (d) => trace.detectionEvents[d.id] && d.coordinates[2] <= currentTime,
      )
    : [];
  function changeNoise(n: number) {
    setRevealed(false);
    const url = new URL(location.href);
    url.searchParams.set("noise", String(n));
    url.searchParams.delete("shot");
    url.searchParams.delete("trace");
    history.replaceState(null, "", url);
  }
  if (!trace)
    return (
      <p className="empty" role="status">
        No saved replay exists at this setting. Choose another measured setting.
      </p>
    );
  return (
    <>
      {invalidNoise && (
        <p className="notice" role="status">
          The requested noise setting was not evaluated. Showing the measured{" "}
          {(noise * 100).toFixed(1)}% setting; no interpolation is performed.
        </p>
      )}
      <div className="notice">
        SAVED EXPERIMENTAL REPLAY · {study.runId}. No live simulation or browser
        inference. {traces.selection} Event bits are decoder inputs; the true
        observable is withheld until you reveal the outcome. Predictions use the
        complete saved 24-bit history, including slices hidden by the scrubber.
        This is not streaming decoding.
      </div>
      <div className="controls">
        <label>
          Measurement-flip probability
          <select
            value={noise}
            onChange={(e) => changeNoise(Number(e.target.value))}
          >
            {study.conditions.map((c) => (
              <option key={c.measurementNoise} value={c.measurementNoise}>
                {(c.measurementNoise * 100).toFixed(1)}%{" "}
                {c.measurementNoise ===
                Number(study.config.trainMeasurementNoise)
                  ? "— training setting"
                  : ""}
              </option>
            ))}
          </select>
        </label>
        <label>
          Saved test shot
          <select
            value={traceIndex}
            onChange={(e) => {
              const url = new URL(location.href);
              url.searchParams.set(
                "trace",
                available[Number(e.target.value)].id,
              );
              url.searchParams.delete("shot");
              history.replaceState(null, "", url);
              setRevealed(false);
            }}
          >
            {available.map((t, i) => (
              <option key={t.id} value={i}>
                Shot {t.shotIndex} ·{" "}
                {t.detectionEvents.reduce((a, b) => a + b, 0)} events
              </option>
            ))}
          </select>
        </label>
        <button
          className="control-button"
          onClick={() => {
            setTime(0);
            setRevealed(false);
          }}
        >
          Reset replay ↺
        </button>
      </div>
      <div className="replay-grid">
        <div>
          <div className="panel-title">
            <span>01 / Physical layout</span>
            <span>Time slice {currentTime}</span>
          </div>
          <svg
            className="detector-svg"
            viewBox="0 0 520 430"
            role="img"
            aria-label={`Stim-derived qubit layout. ${events.length} detection events revealed through time ${currentTime}.`}
          >
            <defs>
              <pattern
                id="replay-grid"
                width="48"
                height="48"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="1" cy="1" r="1" fill="#c4ccc0" />
              </pattern>
            </defs>
            <rect
              x="30"
              y="20"
              width="460"
              height="380"
              fill="url(#replay-grid)"
            />
            {topology?.checks.map((check) => {
              const support = check.dataQubitIds
                .map((id) => study.qubits?.find((q) => q.id === id))
                .filter((q): q is Qubit => Boolean(q));
              const cx =
                support.reduce((n, q) => n + q.coordinates[0], 0) /
                support.length;
              const cy =
                support.reduce((n, q) => n + q.coordinates[1], 0) /
                support.length;
              support.sort(
                (a, b) =>
                  Math.atan2(a.coordinates[1] - cy, a.coordinates[0] - cx) -
                  Math.atan2(b.coordinates[1] - cy, b.coordinates[0] - cx),
              );
              const points = support
                .map(
                  (q) =>
                    `${70 + q.coordinates[0] * 52},${40 + q.coordinates[1] * 52}`,
                )
                .join(" ");
              return support.length === 4 ? (
                <polygon
                  key={check.ancillaId}
                  points={points}
                  fill={check.basis === "X" ? "#dfe4d7" : "#e7e8dd"}
                  stroke="#9eae9c"
                  strokeDasharray={check.basis === "X" ? "4 4" : undefined}
                />
              ) : (
                <polyline
                  key={check.ancillaId}
                  points={points}
                  stroke="#9eae9c"
                  strokeWidth="8"
                  strokeOpacity=".35"
                  strokeDasharray={check.basis === "X" ? "4 4" : undefined}
                  fill="none"
                />
              );
            })}
            {study.qubits?.map((q) => {
              const [x, y] = q.coordinates;
              return (
                <g key={q.id}>
                  {q.role === "data" ? (
                    <>
                      <circle
                        cx={70 + x * 52}
                        cy={40 + y * 52}
                        r="13"
                        fill="none"
                        stroke="#9eae9c"
                      />
                      <circle
                        cx={70 + x * 52}
                        cy={40 + y * 52}
                        r="4"
                        fill="var(--ink)"
                      />
                    </>
                  ) : (
                    <>
                      <rect
                        x={65 + x * 52}
                        y={35 + y * 52}
                        width="10"
                        height="10"
                        fill="none"
                        stroke="#7b8b7e"
                      />
                      <text
                        x={81 + x * 52}
                        y={43 + y * 52}
                        fontSize="9"
                        fill="#59685e"
                      >
                        {q.checkBasis}
                      </text>
                    </>
                  )}
                </g>
              );
            })}
            {events
              .filter((d) => d.coordinates[2] === currentTime)
              .map((d) => (
                <g key={d.id}>
                  <rect
                    x={61 + d.coordinates[0] * 52}
                    y={31 + d.coordinates[1] * 52}
                    width="18"
                    height="18"
                    fill="#936020"
                  />
                  <text
                    x={70 + d.coordinates[0] * 52}
                    y={44 + d.coordinates[1] * 52}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#fff"
                  >
                    {d.id}
                  </text>
                </g>
              ))}
          </svg>
          <div className="legend">
            <span>
              <i />
              Data qubit
            </span>
            <span>□ Measurement ancilla</span>
            <span>
              <i className="event" /> Detection event
            </span>
          </div>
          <div className="scrubber">
            <label htmlFor="time">Reveal history</label>
            <input
              id="time"
              type="range"
              min="0"
              max={times.length - 1}
              step="1"
              value={time}
              onChange={(e) => setTime(Number(e.target.value))}
            />
            <output>t = {currentTime}</output>
          </div>
          <p className="caption">
            Literal layout from Stim qubit coordinates. Filled squares mark
            detector changes in the selected slice, not known fault locations.
            Initial/final boundaries contain fewer detectors. Qubit spacing is
            diagrammatic. Neutral patches/lines show data-qubit support of
            actual circuit checks; dashed edges denote X checks. They do not
            show physical faults or the quantum state.
          </p>
        </div>
        <div>
          <div className="panel-title">
            <span>02 / Syndrome history</span>
            <span>{study.detectors.length} detector bits</span>
          </div>
          <svg
            viewBox="0 0 420 240"
            className="trace-history"
            role="img"
            aria-label="Each numbered square is a detector, grouped by Stim time coordinate. Column slots are reused between rows. Filled squares are detection events."
          >
            {times.map((t, row) => (
              <g key={t}>
                <text x="4" y={38 + row * 48} fontSize="11" fill="#59685e">
                  t={t}
                </text>
                {study.detectors
                  .filter((d) => d.coordinates[2] === t)
                  .map((d, col) => (
                    <g key={d.id}>
                      <rect
                        x={55 + col * 42}
                        y={22 + row * 48}
                        width="25"
                        height="25"
                        fill={
                          t <= currentTime && trace.detectionEvents[d.id]
                            ? "#936020"
                            : "none"
                        }
                        stroke="#9cab9b"
                        opacity={t > currentTime ? 0.3 : 1}
                      />
                      <text
                        x={67 + col * 42}
                        y={39 + row * 48}
                        textAnchor="middle"
                        fontSize="9"
                        fill={
                          t <= currentTime && trace.detectionEvents[d.id]
                            ? "#fff"
                            : "#59685e"
                        }
                      >
                        {d.id}
                      </text>
                    </g>
                  ))}
              </g>
            ))}
          </svg>
          <p className="caption">
            Detector IDs follow the generated circuit. Unequal row lengths are
            expected. No missing bits are padded or invented.
          </p>
          <details>
            <summary>Read the revealed detector IDs</summary>
            <p className="caption">
              {events.length
                ? events
                    .map((d) => `D${d.id} (t=${d.coordinates[2]})`)
                    .join(", ")
                : "No detection events revealed in this portion of the history."}
            </p>
          </details>
          <button
            className="button"
            onClick={() => setRevealed(!revealed)}
            aria-expanded={revealed}
          >
            {revealed ? "Hide outcome" : "Reveal decoder outcome"}{" "}
            <span>→</span>
          </button>
          {revealed && (
            <div className="outcomes" aria-live="polite">
              <div className="outcome-row">
                <span>Simulator truth · observable flip</span>
                <strong>{trace.observable}</strong>
              </div>
              <div className="outcome-row">
                <span>◇ Neural prediction / P(flip)</span>
                <strong
                  className={
                    trace.neuralPrediction !== trace.observable ? "failure" : ""
                  }
                >
                  {trace.neuralPrediction} /{" "}
                  {(trace.neuralProbability * 100).toFixed(1)}%{" "}
                  {trace.neuralPrediction !== trace.observable
                    ? "× incorrect"
                    : "✓ correct"}
                </strong>
              </div>
              <div className="outcome-row">
                <span>Fixed-prior matching</span>
                <strong>
                  {trace.fixedPrediction}{" "}
                  {trace.fixedPrediction !== trace.observable
                    ? "× incorrect"
                    : "✓ correct"}
                </strong>
              </div>
              <div className="outcome-row">
                <span>Matched-prior matching</span>
                <strong>
                  {trace.matchedPrediction}{" "}
                  {trace.matchedPrediction !== trace.observable
                    ? "× incorrect"
                    : "✓ correct"}
                </strong>
              </div>
              <p className="caption">
                The decoder predicts a logical flip only. Neither a physical
                error location nor a recovery chain is inferred here. Truth
                comes from the simulator and is never an input to the model.
              </p>
            </div>
          )}
        </div>
      </div>
      <details>
        <summary>Trace provenance and exact input</summary>
        <pre
          style={{
            whiteSpace: "pre-wrap",
            overflowWrap: "anywhere",
            fontSize: 11,
          }}
        >
          {JSON.stringify(
            {
              ...trace,
              observable: revealed ? trace.observable : "withheld",
              neuralProbability: revealed
                ? trace.neuralProbability
                : "withheld",
              neuralPrediction: revealed ? trace.neuralPrediction : "withheld",
              fixedPrediction: revealed ? trace.fixedPrediction : "withheld",
              matchedPrediction: revealed
                ? trace.matchedPrediction
                : "withheld",
            },
            null,
            2,
          )}
        </pre>
      </details>
      {topology && <CheckInspector study={study} topology={topology} />}
      <SpatialView study={study} trace={trace} time={currentTime} />
    </>
  );
}
