"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Condition, Trace, ConfidenceGroup } from "@/lib/data";
import { ParticleField } from "./ParticleField";

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden="true"
    >
      <path d={diagonal ? "M5 19 19 5M5 5h14v14" : "M4 12h16m-7-7 7 7-7 7"} />
    </svg>
  );
}
export function ResearchJourney({
  conditions,
  traces,
  confidence,
  control,
}: {
  conditions: Condition[];
  traces: Trace[];
  confidence: ConfidenceGroup[];
  control: { fixed: number; matched: number; matching: number; shots: number };
}) {
  const [bits, setBits] = useState([0, 0, 0]);
  const [shot, setShot] = useState(1),
    [round, setRound] = useState(3),
    [playing, setPlaying] = useState(false);
  const [noise, setNoise] = useState(3);
  const [cutoff, setCutoff] = useState(confidence.length - 1);
  const selectedConfidence = confidence[cutoff];
  const root = useRef<HTMLDivElement>(null);
  const trace = traces.find(
    (t) => t.measurementNoise === 0.03 && t.shotIndex === shot,
  )!;
  const condition = conditions[noise];
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(
      () =>
        setRound((r) => {
          if (r >= 3) {
            setPlaying(false);
            return r;
          }
          return r + 1;
        }),
      700,
    );
    return () => clearInterval(id);
  }, [playing]);
  useEffect(() => {
    const sections = root.current?.querySelectorAll(".story-scene");
    if (!sections) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) entry.target.classList.add("scene-entered");
      },
      { threshold: 0.15 },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);
  return (
    <div className="research-experience" ref={root}>
      <section className="experience-hero" aria-labelledby="synapse-title">
        <div className="hero-question">
          <span>Independent research by Assirem Benseddik</span>
          <h1 id="synapse-title">
            What happens when
            <br />
            the noise changes?
          </h1>
          <a href="#begin" className="round-link">
            Explore the research <Arrow diagonal />
          </a>
        </div>
        <ParticleField />
        <p className="pointer-hint">
          <span className="pointer-instruction">
            Move your pointer to disturb the field.
            <br />
          </span>
          This sculpture is a visual metaphor.
        </p>
        <div className="hero-signature" aria-label="Synapse">
          <span>Synapse</span>
        </div>
        <div className="hero-baseline">
          <span>A study of learning and quantum error correction</span>
          <a href="#begin">
            Scroll to explore <span className="scroll-cue">↓</span>
          </a>
        </div>
      </section>

      <section className="question-interlude story-scene" id="begin">
        <div className="interlude-orbit" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p>
          A quantum computer is fragile.
          <br />
          An error can change its answer.
        </p>
        <h2>
          Can a model trained
          <br />
          on one kind of noise
          <br />
          handle another?
        </h2>
        <div className="interlude-bottom">
          <p>
            I tested a small neural network on a simulated quantum memory.
            Here’s the idea, the experiment, and what didn’t work.
          </p>
          <span>Assirem Benseddik</span>
        </div>
      </section>

      <section className="story-scene parity-scene" id="checks">
        <div className="scene-copy">
          <h2>
            Look for changes.
            <br />
            Not the information.
          </h2>
          <p>
            We can’t read an unknown quantum state just to check whether it’s
            okay. Instead, we measure checks that give us clues about errors.
          </p>
          <p>
            This simple bit example shows how a comparison can reveal a change.
            Try flipping a readout.
          </p>
          <span className="demo-mode">
            Interactive analogy · three ordinary bits
          </span>
        </div>
        <div className="parity-demo">
          <div className="bit-links" aria-hidden="true">
            <i className={bits[0] !== bits[1] ? "active" : ""} />
            <i className={bits[1] !== bits[2] ? "active" : ""} />
          </div>
          <div className="giant-bits">
            {bits.map((b, i) => (
              <button
                key={i}
                aria-label={`Flip readout ${i + 1}, currently ${b}`}
                aria-pressed={!!b}
                onClick={() =>
                  setBits(bits.map((v, j) => (i === j ? 1 - v : v)))
                }
              >
                {b}
                <span>Readout {i + 1}</span>
              </button>
            ))}
          </div>
          <div className="parity-readouts">
            <span className={bits[0] !== bits[1] ? "changed" : ""}>
              {bits[0] !== bits[1] ? "Different" : "Same"}
              <small>First comparison</small>
            </span>
            <span className={bits[1] !== bits[2] ? "changed" : ""}>
              {bits[1] !== bits[2] ? "Different" : "Same"}
              <small>Second comparison</small>
            </span>
          </div>
          <p className="demo-explanation" aria-live="polite">
            {bits[0] === bits[1] && bits[1] === bits[2]
              ? "Both comparisons agree. That alone doesn’t prove nothing changed."
              : `${Number(bits[0] !== bits[1]) + Number(bits[1] !== bits[2])} comparison${bits[0] !== bits[1] && bits[1] !== bits[2] ? "s" : ""} changed. The pattern is a clue, not a complete answer.`}
          </p>
          <button
            className="understated-button"
            onClick={() => setBits([0, 0, 0])}
          >
            Reset readouts
          </button>
        </div>
      </section>

      <section className="story-scene history-scene" id="history">
        <div className="history-sticky">
          <div className="scene-copy">
            <h2>
              One clue is useful.
              <br />A history is better.
            </h2>
            <p>
              The actual experiment records 24 detection bits across four time
              boundaries. A lit point means a check changed from its expected
              behavior.
            </p>
            <p>
              A decoder reads the complete history and predicts whether the
              stored logical bit flipped.
            </p>
            <div className="history-actions">
              <button
                className="pill-action"
                onClick={() => {
                  setRound(0);
                  setPlaying(true);
                }}
              >
                Replay this history <Arrow />
              </button>
              <label>
                Saved shot
                <select
                  value={shot}
                  onChange={(e) => {
                    setShot(Number(e.target.value));
                    setRound(3);
                    setPlaying(false);
                  }}
                >
                  {Array.from({ length: 8 }, (_, i) => (
                    <option key={i} value={i}>
                      Shot {i}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          <div className="history-art">
            <div className="time-spine" />
            {[0, 1, 2, 3].map((layer) => (
              <div
                className={`history-layer ${layer <= round ? "revealed" : ""}`}
                key={layer}
              >
                <span>
                  {["Start", "Round 1", "Round 2", "Final readout"][layer]}
                </span>
                <div>
                  {Array.from(
                    { length: layer === 0 || layer === 3 ? 4 : 8 },
                    (_, j) => {
                      const id =
                        (layer === 0
                          ? 0
                          : layer === 1
                            ? 4
                            : layer === 2
                              ? 12
                              : 20) + j;
                      return (
                        <i
                          key={id}
                          className={
                            trace.detectionEvents[id] ? "detected" : ""
                          }
                          title={`D${id}: ${trace.detectionEvents[id] ? "event" : "no event"}`}
                        >
                          <span>D{id}</span>
                        </i>
                      );
                    },
                  )}
                </div>
              </div>
            ))}
            <div className="trace-verdict">
              <span>Model prediction</span>
              <strong>
                {trace.neuralPrediction ? "Logical flip" : "No logical flip"}
              </strong>
              <span>
                Actual outcome: {trace.observable ? "flip" : "no flip"}
              </span>
            </div>
          </div>
        </div>
        <div className="scene-footnote">
          <span>
            Real saved simulation · 3% measurement noise · shot {shot} · seed
            101
          </span>
          <Link href={`/explore?noise=0.03&shot=${shot}`}>
            Inspect every detector <Arrow diagonal />
          </Link>
        </div>
      </section>

      <section className="story-scene noise-scene" id="results">
        <div className="noise-heading">
          <h2>
            Same training.
            <br />
            More noise.
          </h2>
          <p>
            The model learned at 0.5% measurement noise. I kept its training
            fixed and tested four noise levels. Move between them.
          </p>
        </div>
        <div className="noise-console">
          <div
            className="noise-selection"
            role="group"
            aria-label="Measurement noise"
          >
            {conditions.map((c, i) => (
              <button
                key={i}
                aria-pressed={noise === i}
                onClick={() => setNoise(i)}
              >
                {(c.measurementNoise * 100).toFixed(1)}%
                {i === 1 && <small>Training level</small>}
              </button>
            ))}
          </div>
          <div className="error-race" aria-live="polite">
            <div>
              <span>Neural network</span>
              <div className="race-track">
                <i
                  style={{
                    width: `${(condition.neural.errorRate / 0.04) * 100}%`,
                  }}
                />
              </div>
              <strong>
                {condition.neural.failures}
                <small> / {condition.shots.toLocaleString()} errors</small>
              </strong>
            </div>
            <div>
              <span>Matching decoder</span>
              <div className="race-track">
                <i
                  style={{
                    width: `${(condition.matchedMatching.errorRate / 0.04) * 100}%`,
                  }}
                />
              </div>
              <strong>
                {condition.matchedMatching.failures}
                <small> / {condition.shots.toLocaleString()} errors</small>
              </strong>
            </div>
          </div>
          <div className="race-scale">
            <span>0% error</span>
            <span>4% error</span>
          </div>
        </div>
        <div className="noise-takeaway">
          <p>
            The network makes more mistakes at higher noise. Matching makes
            fewer at every setting tested.
          </p>
          <div>
            <p>
              Each pair uses the same 20,000 shots. Matching is told the
              test-noise model. Higher noise also makes the task harder, so this
              sweep alone can’t isolate the cost of a training mismatch.
            </p>
            <Link href="/study">
              See uncertainty and all model seeds <Arrow diagonal />
            </Link>
          </div>
        </div>
      </section>

      <section className="story-scene confidence-scene" id="confidence">
        <div className="scene-copy">
          <h2>
            Sure doesn’t
            <br />
            mean right.
          </h2>
          <p>
            At the highest noise, I looked at the frozen model’s most confident
            predictions on fresh test shots.
          </p>
          <p>
            Even among its most confident predictions, it still made mistakes.
            Change the cutoff to see how many shots remain.
          </p>
          <label className="confidence-control">
            Minimum class confidence:{" "}
            {Math.round(selectedConfidence.minimumConfidence! * 100)}%
            <input
              type="range"
              min="0"
              max={confidence.length - 1}
              step="1"
              value={cutoff}
              onChange={(e) => setCutoff(Number(e.target.value))}
            />
          </label>
          <Link href="/study/diagnostics" className="round-link">
            Explore confidence <Arrow diagonal />
          </Link>
        </div>
        <div className="confidence-art">
          <div className="confidence-number">
            {(selectedConfidence.meanConfidence! * 100).toFixed(2)}
            <span>%</span>
          </div>
          <p>Mean model confidence</p>
          <div className="confidence-divider">
            <span />
            <i />
          </div>
          <div className="confidence-number observed">
            {(selectedConfidence.observedAccuracy! * 100).toFixed(2)}
            <span>%</span>
          </div>
          <p>Observed accuracy</p>
          <p className="confidence-note">
            {selectedConfidence.count.toLocaleString()} retained shots ·{" "}
            {selectedConfidence.failures.toLocaleString()} mistakes
            <br />A descriptive subset, not a recommended cutoff.
          </p>
        </div>
      </section>

      <section className="story-scene conclusion-scene" id="conclusion">
        <h2>
          What if we teach it
          <br />
          the new noise?
        </h2>
        <div className="control-comparison">
          <div>
            <span>Fixed training</span>
            <strong>{control.fixed.toLocaleString()}</strong>
            <small>errors in 100,000 shots</small>
          </div>
          <Arrow />
          <div>
            <span>Training at the known test noise</span>
            <strong>{control.matched.toLocaleString()}</strong>
            <small>errors in the same 100,000 shots</small>
          </div>
        </div>
        <div className="conclusion-copy">
          <p>It helps at higher noise. It doesn’t close the gap.</p>
          <div>
            <p>
              A separate twelve-model control tested that question. Matching
              still made fewer errors: 1,838 on these shots. At the lowest
              noise, matched training didn’t improve classification error for
              any of the three initializations.
            </p>
            <p>
              This is a small simulation, with known noise and one training
              dataset per setting. It’s a useful result, not a claim about every
              neural decoder.
            </p>
            <Link className="pill-action" href="/study/training-control">
              Open the follow-up <Arrow />
            </Link>
          </div>
        </div>
      </section>

      <section className="experience-end">
        <p>Research by Assirem Benseddik</p>
        <h2>
          Read the methods.
          <br />
          Try the experiment.
        </h2>
        <div className="end-links">
          <Link href="/methods">
            How I tested it <Arrow diagonal />
          </Link>
          <Link href="/sources">
            Sources & exact claims <Arrow diagonal />
          </Link>
          <a href="/data/technical-report.md" download>
            Download the paper <Arrow diagonal />
          </a>
        </div>
        <Link href="/about" className="creator-credit">
          Synapse is an independent project by Assirem Benseddik.
        </Link>
      </section>
    </div>
  );
}
