"use client";
import { ResponsivePlot } from "./charts/ResponsivePlot";
import type { Study } from "@/lib/data";
export function ModelTraining({
  study,
}: {
  study: Pick<Study, "model" | "runId">;
}) {
  const records = study.model.training ?? [];
  const ymax =
    Math.max(...records.flatMap((r) => r.validationLogLossByEpoch)) || 1;
  const maxEpoch = Math.max(...records.map((r) => r.epochsExecuted)) || 40;
  const colors = ["#ff8a58", "#e9b9a8", "#c4cad3"];
  return (
    <section className="figure-section" id="learning">
      <span className="eyebrow">CLASSICAL LEARNING / MODEL RECORD</span>
      <h2>Small enough to inspect.</h2>
      <div
        className="architecture-flow"
        role="img"
        aria-label="Network architecture: 24 detector inputs, 32 and 16 ReLU hidden units, one logistic probability output"
      >
        {study.model.architecture.map((n, i) => (
          <div key={i}>
            <span>
              {
                [
                  "DETECTOR INPUTS",
                  "RELU HIDDEN",
                  "RELU HIDDEN",
                  "P(OBSERVABLE FLIP)",
                ][i]
              }
            </span>
            <strong>{n}</strong>
          </div>
        ))}
      </div>
      <p className="caption">
        A diagram of layer widths, not a visualization of activations or
        attention. {study.model.parameterCount.toLocaleString()} trainable
        weights and biases. Only detector bits enter the network; neither true
        faults nor observable labels are input features.
      </p>
      {records.length > 0 && (
        <figure>
          <div className="axis-heading">Validation binary log loss</div>
          <ResponsivePlot
            title="Validation log loss for three training seeds"
            description="Dots mark validation-selected checkpoints. The entire epoch range is shown."
          >
            {({ width, height }) => {
              const left = 46,
                right = 18,
                top = 16,
                bottom = height - 40;
              const x = (epoch: number) =>
                left + ((epoch - 1) / (maxEpoch - 1)) * (width - left - right);
              const y = (loss: number) =>
                bottom - (loss / ymax) * (bottom - top);
              return (
                <>
                  {[0, 0.25, 0.5, 0.75, 1].map((v) => (
                    <g key={v}>
                      <path
                        d={`M${left} ${y(v * ymax)}H${width - right}`}
                        stroke="#c4ccc0"
                      />
                      <text x={left - 10} y={y(v * ymax) + 4} textAnchor="end">
                        {(v * ymax).toFixed(2)}
                      </text>
                    </g>
                  ))}
                  {[1, 10, 20, 30, 40]
                    .filter((e) => e <= maxEpoch)
                    .map((e) => (
                      <text
                        key={e}
                        x={x(e)}
                        y={bottom + 24}
                        textAnchor="middle"
                      >
                        {e}
                      </text>
                    ))}
                  {records.map((r, i) => (
                    <g key={r.seed}>
                      <polyline
                        fill="none"
                        stroke={colors[i % 3]}
                        strokeWidth="1.8"
                        strokeDasharray={
                          i === 1 ? "6 3" : i === 2 ? "2 3" : undefined
                        }
                        points={r.validationLogLossByEpoch
                          .map((loss, e) => `${x(e + 1)},${y(loss)}`)
                          .join(" ")}
                      />
                      <circle
                        cx={x(r.selectedEpoch)}
                        cy={y(r.validationLogLoss)}
                        r="4"
                        fill={colors[i % 3]}
                      />
                    </g>
                  ))}
                </>
              );
            }}
          </ResponsivePlot>
          <div className="axis-footer">Training epoch</div>
          <div className="legend">
            {records.map((r, i) => (
              <span key={r.seed}>
                <b style={{ color: colors[i % 3] }}>{["—", "– –", "···"][i]}</b>
                Seed {r.seed} / selected epoch {r.selectedEpoch}
              </span>
            ))}
          </div>
          <figcaption>
            Loss is measured on the same 8,000-shot validation split after every
            epoch; dots identify selected checkpoints. Test labels do not select
            epochs. A falling validation loss does not guarantee generalization
            under noise mismatch. Run: {study.runId}.
          </figcaption>
        </figure>
      )}
    </section>
  );
}
