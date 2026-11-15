import Link from "next/link";
import { Lattice } from "@/components/Lattice";
import { getStudy } from "@/lib/data";
export default function Home() {
  const study = getStudy();
  return (
    <>
      <section className="hero">
        <div className="hero-top">
          <span className="eyebrow">INDEPENDENT COMPUTATIONAL RESEARCH</span>
          <span className="status-dot">
            A SMALL CODE. A DIFFICULT QUESTION.
          </span>
        </div>
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="chapter-index">
              FIELD NOTES ON QUANTUM ERROR CORRECTION
            </p>
            <h1>
              Errors
              <br />
              leave <em>traces.</em>
            </h1>
            <p className="hero-deck">
              A quantum computer leaves clues about errors.
              <br />A model tries to interpret them.
            </p>
            <Link href="/explore" className="button light">
              Explore silently <span>→</span>
            </Link>
            <Link href="/study" className="text-link">
              Read the study <span>→</span>
            </Link>
          </div>
          <div className="hero-instrument">
            <Lattice dark />
            <div className="instrument-label">
              <span>
                <i className="square" /> CHECK SIGNAL
              </span>
              <span>SCHEMATIC / NOT A MEASUREMENT</span>
            </div>
          </div>
        </div>
        <div className="hero-bottom">
          <span>01 / FROM SIGNAL TO INFERENCE</span>
          <p>
            What happens when the noise changes,
            <br />
            but the model’s training does not?
          </p>
          <a
            href="#question"
            aria-label="Continue to research question"
            className="down-arrow"
          >
            ↓
          </a>
        </div>
      </section>
      <section className="intro section" id="question">
        <div className="section-marker">THE QUESTION / 01</div>
        <div>
          <h2>
            Reading between
            <br />
            the errors.
          </h2>
          <p className="large-copy">
            Quantum information is fragile. Protecting it means measuring
            checks, collecting a history of changes, and making an
            inference—without reading out the unknown quantum state itself.
          </p>
          <p>
            This study asks how a compact neural decoder behaves when
            measurement noise differs from its training distribution. Does it
            make more logical mistakes? Does its confidence still mean what it
            appears to mean?
          </p>
          <Link className="text-link" href="/methods">
            Meet the experiment <span>→</span>
          </Link>
        </div>
      </section>
      <section className="chapter-strip">
        <div>
          <span>THE INSTRUMENT</span>
          <strong>3</strong>
          <p>Code distance</p>
        </div>
        <div>
          <span>THE MEMORY</span>
          <strong>Z</strong>
          <p>One observable</p>
        </div>
        <div>
          <span>THE HISTORY</span>
          <strong>3</strong>
          <p>Measurement rounds</p>
        </div>
        <div>
          <span>THE STATUS</span>
          <strong className="word-stat">
            {study ? "Executed" : "Pending"}
          </strong>
          <p>{study ? "Bounded simulation study" : "Research pipeline"}</p>
        </div>
      </section>
      <section className="section journey">
        <div className="section-marker">A GUIDED INVESTIGATION / 02</div>
        <div>
          <h2>Follow the clues.</h2>
          {[
            [
              "01",
              "A protected bit of information",
              "Nine data qubits form a distance-three memory. The logical information belongs to the code, rather than any single qubit.",
              "/methods",
            ],
            [
              "02",
              "Errors leave traces",
              "Repeated checks create a syndrome history. Changes in expected parity become detection events.",
              "/explore",
            ],
            [
              "03",
              "A decoder makes an inference",
              "The model sees detector bits. Its task is to predict one logical-observable flip, not a complete physical recovery chain.",
              "/explore",
            ],
            [
              "04",
              "Learning the pattern",
              "A compact classical neural network learns from simulated examples. No quantum machine-learning hardware is involved.",
              "/methods",
            ],
            [
              "05",
              "Change the noise",
              "Evaluate a fixed trained model at discrete measurement-noise settings. Compare logical mistakes and calibration.",
              "/study",
            ],
            [
              "06",
              "Inspect the evidence",
              "Open counts, uncertainty, baselines, methods, source records and the limits of this small experiment.",
              "/sources",
            ],
          ].map(([n, title, copy, href]) => (
            <Link href={href} className="journey-row" key={n}>
              <span>{n}</span>
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="closing">
        <span className="eyebrow">EVIDENCE BEFORE CERTAINTY</span>
        <h2>
          A prediction is
          <br />
          not a guarantee.
        </h2>
        <p>
          Independent simulation. Explicit assumptions.
          <br />
          An open record of what worked—and what did not.
        </p>
        <Link href="/study" className="button">
          Inspect the evidence <span>→</span>
        </Link>
      </section>
    </>
  );
}
