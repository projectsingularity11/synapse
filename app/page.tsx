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
            <i /> Independent research by Assirem Benseddik
          </span>
        </div>
        <div className="cinema-title">
          <h1 id="home-title">
            Can a neural network recognize errors in a quantum memory?
          </h1>
          <p>
            I trained a small neural network to predict whether a simulated
            quantum memory’s final readout was wrong, using the error-checking
            measurements around it. Then I made those measurements less reliable
            to test how well the model would hold up.
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="/demo">
              Watch the recorded demo <span>↘</span>
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
      </section>
      <section className="research-question" id="question">
        <h2>Why I tested the decoder with noisier measurements</h2>
        <div className="question-aside">
          <p>
            A quantum memory cannot simply inspect its stored state to check for
            mistakes, because measuring that state can disturb the information
            it is trying to preserve. Instead, it measures relationships between
            qubits and asks a decoder to interpret the resulting clues.
          </p>
          <p>
            I wanted to find out whether a neural decoder could still make
            reliable predictions when those clues came from noisier measurements
            than it had trained on. I compared it with a matching decoder that
            knew the evaluation noise, rather than judging the network’s results
            on their own.
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
        <div className="research-door-title">
          <h2>Read the evidence and decide what it supports</h2>
          <p>
            If you want to check my reasoning, the paper explains the experiment
            and the saved-shot explorer lets you compare predictions with what
            the simulator actually recorded.
          </p>
        </div>
        <div className="research-doors">
          <Link href="/study/paper">
            <h3>Read the full research paper</h3>
            <p>
              I explain the experimental design, compare the decoders, and work
              through the limitations that matter when interpreting the results.
            </p>
            <b aria-hidden="true">↗</b>
          </Link>
          <Link href="/explore">
            <h3>Explore the saved experiment one shot at a time</h3>
            <p>
              Turn the detector history, change the saved shot, and compare
              predictions with simulator truth.
            </p>
            <b aria-hidden="true">↗</b>
          </Link>
        </div>
      </section>
    </div>
  );
}
