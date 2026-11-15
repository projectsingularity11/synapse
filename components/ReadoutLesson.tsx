"use client";
import { useState } from "react";
export function ReadoutLesson() {
  const [bits, setBits] = useState([0, 1, 0]);
  const differences = [bits[0] ^ bits[1], bits[1] ^ bits[2]];
  return (
    <details className="readout-lesson" id="checks">
      <summary>Why can one flipped readout leave two traces?</summary>
      <span className="eyebrow">CONCEPTUAL EXAMPLE / NOT A SAVED SHOT</span>
      <h2>A change is the clue.</h2>
      <p>
        Imagine one check whose three consecutive readouts should agree. A
        detection event marks disagreement between neighboring readouts. Toggle
        a bit and watch the two comparisons.
      </p>
      <div
        className="readout-bits"
        role="group"
        aria-label="Three conceptual check readouts"
      >
        {bits.map((b, i) => (
          <button
            key={i}
            aria-pressed={b === 1}
            aria-label={`Readout ${i + 1}: ${b}, toggle value`}
            onClick={() => setBits(bits.map((v, k) => (k === i ? 1 - v : v)))}
          >
            <span>READOUT {i + 1}</span>
            <strong>{b}</strong>
          </button>
        ))}
      </div>
      <div className="difference-pair" aria-live="polite">
        {differences.map((d, i) => (
          <div key={i}>
            <span>
              {bits[i]} XOR {bits[i + 1]}
            </span>
            <strong className={d ? "detected" : ""}>
              {d ? "■" : "□"} {d}
            </strong>
            <p>{d ? "Detection event" : "No change"}</p>
          </div>
        ))}
      </div>
      <button className="control-button" onClick={() => setBits([0, 0, 0])}>
        Set all readouts to zero
      </button>
      <button className="control-button" onClick={() => setBits([0, 1, 0])}>
        Flip the middle readout only
      </button>
      <p className="caption">
        This toy comparison omits preparation and final-readout boundaries. The
        real memory uses its exact circuit detector declarations, not this
        two-comparison rule everywhere. Two events do not uniquely identify a
        physical fault; different fault patterns can produce the same clues.
      </p>
    </details>
  );
}
