"use client";
import { useState } from "react";
import Link from "next/link";
import type { Condition } from "@/lib/data";
export function NoiseEvidence({ conditions }: { conditions: Condition[] }) {
  const [index, setIndex] = useState(3);
  const selected = conditions[index];
  const x = (p: number) => 70 + ((p - 0.001) / 0.029) * 800,
    y = (e: number) => 290 - (e / 0.04) * 240;
  const neural = conditions
      .map((c) => `${x(c.measurementNoise)},${y(c.neural.errorRate)}`)
      .join(" "),
    matching = conditions
      .map((c) => `${x(c.measurementNoise)},${y(c.matchedMatching.errorRate)}`)
      .join(" ");
  return (
    <section className="home-evidence" id="findings">
      <div className="section-heading">
        <span className="micro">02 — THE OBSERVATION</span>
        <span className="micro">ORIGINAL EXPERIMENT / SEED 101</span>
      </div>
      <div className="evidence-intro">
        <h2>The noise increased.<br/>So did the errors.</h2>
        <p>
          I trained at 0.5% measurement noise, then changed it. More noise meant
          more mistakes. But that alone cannot tell us how much damage came from
          a mismatch in training.
        </p>
      </div>
      <div className="evidence-instrument">
        <div className="evidence-number">
          <span className="micro">NEURAL LOGICAL ERROR</span>
          <strong>
            {(selected.neural.errorRate * 100).toFixed(2)}
            <small>%</small>
          </strong>
          <p>
            {selected.neural.failures.toLocaleString()} errors /{" "}
            {selected.shots.toLocaleString()} complete experiments
          </p>
          <div className="evidence-baseline">
            <span>Matched-prior matching</span>
            <b>{(selected.matchedMatching.errorRate * 100).toFixed(2)}%</b>
          </div>
          <label className="noise-scrubber">
            Measurement noise{" "}
            <output>{(selected.measurementNoise * 100).toFixed(1)}%</output>
            <input
              aria-label="Homepage evaluation measurement noise"
              type="range"
              min="0"
              max={conditions.length - 1}
              step="1"
              value={index}
              onChange={(e) => setIndex(Number(e.target.value))}
            />
          </label>
          <span className="micro evidence-instruction">
            DRAG THROUGH THE FOUR TESTED SETTINGS
          </span>
        </div>
        <figure className="evidence-plot">
          <svg
            viewBox="0 0 940 350"
            role="img"
            aria-label="Neural logical error rises from 0.155% to 3.660%; matched matching has lower observed error at every tested noise setting."
          >
            {[0, 0.01, 0.02, 0.03, 0.04].map((e) => (
              <g key={e}>
                <line
                  x1="70"
                  x2="870"
                  y1={y(e)}
                  y2={y(e)}
                  stroke="currentColor"
                  opacity=".14"
                />
                <text x="45" y={y(e) + 4} textAnchor="end">
                  {Math.round(e * 100)}%
                </text>
              </g>
            ))}
            <line
              x1={x(0.005)}
              x2={x(0.005)}
              y1="35"
              y2="290"
              stroke="currentColor"
              opacity=".35"
              strokeDasharray="4 5"
            />
            <text x={x(0.005) + 10} y="30">
              TRAINING NOISE
            </text>
            <polyline
              points={neural}
              fill="none"
              stroke="#ff6638"
              strokeWidth="3"
            />
            <polyline
              points={matching}
              fill="none"
              stroke="#e9e7e3"
              strokeWidth="2"
            />
            {conditions.map((c, i) => (
              <g key={c.measurementNoise}>
                <circle
                  cx={x(c.measurementNoise)}
                  cy={y(c.neural.errorRate)}
                  r={i === index ? 8 : 4}
                  fill="#ff804b"
                />
                <circle
                  cx={x(c.measurementNoise)}
                  cy={y(c.matchedMatching.errorRate)}
                  r={i === index ? 6 : 3}
                  fill="#e9e7e3"
                />
                <text x={x(c.measurementNoise)} y="320" textAnchor="middle">
                  {(c.measurementNoise * 100).toFixed(1)}%
                </text>
              </g>
            ))}
            <text x="470" y="348" textAnchor="middle">
              MEASUREMENT-FLIP PROBABILITY
            </text>
          </svg>
          <figcaption>
            <span>
              <i /> Neural model
            </span>
            <span>
              <i /> Matched-prior matching
            </span>
            <p>
              Original experiment · seed 101 · 20,000 shots per setting. Lines
              join measured settings; they do not represent additional tests.
              Intervals and counts are in the study.
            </p>
          </figcaption>
        </figure>
      </div>
      <div className="evidence-conclusion">
        <p>
          Matching made fewer mistakes at every tested setting. The interesting
          part is understanding <em>why.</em>
        </p>
        <div>
          <p>
            A separate, equal-budget training control compares fixed and matched
            training on the same evaluation shots. At 3% noise, seed 101
            improves from 3.775% to 2.736% error. It still trails matching.
          </p>
          <Link className="editorial-link" href="/study">
            Read the full research <span>↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
