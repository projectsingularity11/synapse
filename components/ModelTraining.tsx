import type { Study } from "@/lib/data";
export function ModelTraining({ study }: { study: Study }) {
  const records = study.model.training ?? [];
  const ymax =
    Math.max(...records.flatMap((r) => r.validationLogLossByEpoch)) || 1;
  const maxEpoch = Math.max(...records.map((r) => r.epochsExecuted)) || 40;
  const colors = ["#326449", "#55615b", "#4b567e"];
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
          <div
            className="chart-scroll"
            role="region"
            aria-label="Validation loss over training epochs"
            tabIndex={0}
          >
            <svg
              className="chart"
              viewBox="0 0 840 380"
              role="img"
              aria-labelledby="training-title"
            >
              <title id="training-title">
                Validation log loss for three training seeds
              </title>
              {[0, 0.25, 0.5, 0.75, 1].map((v) => (
                <g key={v}>
                  <path d={`M80 ${300 - v * 240}H760`} stroke="#c4ccc0" />
                  <text x="65" y={304 - v * 240} textAnchor="end">
                    {(v * ymax).toFixed(2)}
                  </text>
                </g>
              ))}
              {[1, 10, 20, 30, 40].map((epoch) => (
                <text
                  key={epoch}
                  x={80 + ((epoch - 1) / (maxEpoch - 1)) * 680}
                  y="326"
                  textAnchor="middle"
                >
                  {epoch}
                </text>
              ))}
              {records.map((r, i) => (
                <g key={r.seed}>
                  <polyline
                    fill="none"
                    stroke={colors[i % 3]}
                    strokeWidth="2"
                    strokeDasharray={
                      i === 1 ? "6 3" : i === 2 ? "2 3" : undefined
                    }
                    points={r.validationLogLossByEpoch
                      .map(
                        (loss, e) =>
                          `${80 + (e / (maxEpoch - 1)) * 680},${300 - (loss / ymax) * 240}`,
                      )
                      .join(" ")}
                  />
                  <circle
                    cx={80 + ((r.selectedEpoch - 1) / (maxEpoch - 1)) * 680}
                    cy={300 - (r.validationLogLoss / ymax) * 240}
                    r="4"
                    fill={colors[i % 3]}
                  />
                </g>
              ))}
              <text x="420" y="366" textAnchor="middle">
                Training epoch
              </text>
              <text
                transform="translate(20 180) rotate(-90)"
                textAnchor="middle"
              >
                Validation binary log loss
              </text>
            </svg>
          </div>
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
