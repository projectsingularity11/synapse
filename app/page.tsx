import Link from "next/link";
import { QuantumStage } from "@/components/experience/QuantumStage";
import { ResearchFilm } from "@/components/experience/ResearchFilm";
import { NoiseEvidence } from "@/components/experience/NoiseEvidence";
import { getStudy, getTraces } from "@/lib/data";
export default function Home() {
  const study = getStudy(),
    traces = getTraces(),
    trace = traces?.traces.find(
      (t) => t.measurementNoise === 0.03 && t.shotIndex === 1,
    );
  return (
    <div className="cinematic-home">
      <section className="cinema-hero" aria-labelledby="home-title">
        <div className="hero-atmosphere" aria-hidden="true" />
        <div className="hero-registration">
          <span className="micro">
            <i /> INDEPENDENT RESEARCH BY ASSIREM BENSEDDIK
          </span>
          <span className="micro">QUANTUM COMPUTING / MACHINE LEARNING</span>
        </div>
        <div className="cinema-title">
          <h1 id="home-title">
            Quantum error
            <br />
            decoding under
            <br />
            <em>measurement noise</em>
          </h1>
          <p>
            I trained a small model to read error clues from a quantum memory.
            Then I made the measurements noisier.
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="#inside">
              Explore the experiment <span>↘</span>
            </a>
            <Link className="quiet-action" href="/study/paper">
              Read the paper <span>↗</span>
            </Link>
          </div>
        </div>
        {study && trace && (
          <QuantumStage
            mode="hero"
            detectors={study.detectors}
            events={trace.detectionEvents}
          />
        )}
        <div className="hero-instrument-label">
          <span className="instrument-cross" aria-hidden="true">
            +
          </span>
          <div>
            <strong>Quantum memory schematic</strong>
            <span>Turn the structure by dragging.</span>
          </div>
        </div>
        <div className="hero-signal-strip">
          {[
            ["9", "Data qubits"],
            ["3", "Repeated rounds"],
            ["24", "Detector bits"],
            ["4", "Noise settings"],
          ].map(([value, label]) => (
            <div key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
          <a href="#question" aria-label="Scroll to the research question">
            Research question <span>↓</span>
          </a>
        </div>
      </section>
      <section className="research-question" id="question">
        <span className="micro">MEASUREMENT-NOISE SHIFT</span>
        <h2>
          The research question
        </h2>
        <div className="question-aside">
          <p>
            A quantum computer needs a way to tell whether its stored
            information has been disturbed. It cannot simply read the whole
            quantum state to check.
          </p>
          <p>
            Instead, it gathers clues. A decoder interprets those clues. I
            wanted to see what happens when a learned decoder encounters more
            measurement noise than it trained on.
          </p>
          <details className="inline-explanation">
            <summary>
              What does “noise” mean here? <span>+</span>
            </summary>
            <p>
              Here, noise is a configured chance that a recorded measurement
              flips. It is different from the chance that the complete memory
              experiment fails. The paper keeps those two probabilities
              separate.
            </p>
          </details>
        </div>
      </section>
      {study && trace && (
        <ResearchFilm detectors={study.detectors} trace={trace} />
      )}
      {study && (
        <NoiseEvidence
          conditions={study.conditions.map((c) => ({
            ...c,
            neural: { ...c.neural, reliability: [], seeds: undefined },
          }))}
        />
      )}
      <section className="research-door">
        <span className="micro">RESEARCH MATERIALS</span>
        <div className="research-door-title">
          <h2>
            Paper and experimental records
          </h2>
          <p>
            Read the methods and results, or inspect individual saved shots.
          </p>
        </div>
        <div className="research-doors">
          <Link href="/study/paper">
            <span>01 / PAPER</span>
            <h3>Full research paper</h3>
            <p>
              The mathematical task, experimental design, results, controls, and
              limitations.
            </p>
            <b aria-hidden="true">↗</b>
          </Link>
          <Link href="/explore">
            <span>02 / EXPLORER</span>
            <h3>Inspect a saved experiment</h3>
            <p>
              Turn the detector history, change the saved shot, and compare
              predictions with simulator truth.
            </p>
            <b aria-hidden="true">↗</b>
          </Link>
          <Link href="/about">
            <span>03 / ABOUT ME</span>
            <h3>About Assirem</h3>
            <p>
              My background in mathematics, physics, web development, CAD, and
              robotics.
            </p>
            <b aria-hidden="true">↗</b>
          </Link>
        </div>
      </section>
    </div>
  );
}
