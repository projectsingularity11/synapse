"use client";
import { useEffect, useRef, useState } from "react";
import { useReducedEffects } from "../useReducedEffects";

const names = ["Bits", "Qubits", "A protected memory"];
export function Foundations() {
  const section = useRef<HTMLElement>(null),
    track = useRef<HTMLDivElement>(null),
    viewport = useRef<HTMLDivElement>(null);
  const { reduced } = useReducedEffects();
  const [active, setActive] = useState(0),
    [bit, setBit] = useState(0),
    [chance, setChance] = useState(50),
    [measurement, setMeasurement] = useState<number | null>(null),
    [marked, setMarked] = useState(-1);
  const activeRef = useRef(0);
  const pinnedRef = useRef(false);
  const [guided, setGuided] = useState(false);
  useEffect(() => {
    const root = section.current!,
      rail = track.current!,
      view = viewport.current!;
    let frame = 0,
      disposed = false;
    const update = () => {
      frame = 0;
      if (disposed) return;
      const desktop = innerWidth >= 900 && !reduced;
      root.dataset.guided = desktop ? "true" : "false";
      if (desktop !== pinnedRef.current) {
        pinnedRef.current = desktop;
        setGuided(desktop);
      }
      if (desktop) {
        const travel = view.clientWidth * 2;
        root.style.height = `${innerHeight + travel}px`;
        const progress = Math.max(
          0,
          Math.min(1, -root.getBoundingClientRect().top / travel),
        );
        rail.style.transform = `translate3d(${-progress * travel}px,0,0)`;
        const current = Math.round(progress * 2);
        if (current !== activeRef.current) {
          activeRef.current = current;
          setActive(current);
        }
        root.dataset.progress = progress.toFixed(3);
      } else {
        root.style.height = "auto";
        rail.style.transform = "none";
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    update();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [reduced]);
  function go(index: number) {
    const i = Math.max(0, Math.min(2, index)),
      root = section.current!;
    if (root.dataset.guided === "true") {
      const top =
        window.scrollY +
        root.getBoundingClientRect().top +
        i * viewport.current!.clientWidth;
      window.dispatchEvent(
        new CustomEvent("synapse-scroll-to", { detail: { top } }),
      );
    } else if (reduced) {
      track.current!.children[i].scrollIntoView({
        behavior: "auto",
        block: "start",
      });
      setActive(i);
    } else {
      viewport.current!.scrollTo({
        left: i * viewport.current!.clientWidth,
        behavior: "smooth",
      });
      setActive(i);
    }
  }
  return (
    <section
      ref={section}
      className="learning-chapters"
      id="learn"
      aria-labelledby="foundations-title"
    >
      <div className="learning-sticky">
        <div className="learning-heading">
          <h2 id="foundations-title">Start with the basics.</h2>
          <div className="learning-navigation">
            <span aria-live="polite">
              {active + 1} / 3 · {names[active]}
            </span>
            <button
              onClick={() => go(active - 1)}
              disabled={active === 0}
              aria-label="Previous concept"
            >
              ←
            </button>
            <button
              onClick={() => go(active + 1)}
              disabled={active === 2}
              aria-label="Next concept"
            >
              →
            </button>
          </div>
        </div>
        <div
          ref={viewport}
          className={`learning-window ${reduced ? "learning-reduced" : ""}`}
          tabIndex={0}
          role="region"
          aria-label="Three introductory concepts. Scroll down on desktop; swipe or use the concept buttons on touch screens."
          onScroll={(e) => {
            if (section.current?.dataset.guided !== "true" && !reduced) {
              const i = Math.round(
                e.currentTarget.scrollLeft / e.currentTarget.clientWidth,
              );
              activeRef.current = i;
              setActive(i);
            }
          }}
        >
          <div ref={track} className="learning-track">
            <article
              className="learning-slide"
              aria-label="Bits"
              inert={guided && active !== 0}
            >
              <div className="learning-copy">
                <h3>First, a bit.</h3>
                <p>
                  Your phone stores information as bits. Each bit is either{" "}
                  <strong>0 or 1</strong>. Flip it, and you change the
                  information.
                </p>
                <p>
                  If the value changes by accident, that’s an error. Protecting
                  information starts with noticing that change.
                </p>
                <span className="interaction-instruction">
                  Click the bit to change its value.
                </span>
              </div>
              <div className="bit-stage glass-surface">
                <button
                  className="single-bit"
                  aria-label={`Bit value ${bit}. Flip the bit.`}
                  onClick={() => setBit(1 - bit)}
                >
                  {bit}
                </button>
                <p>One ordinary bit · an interactive example</p>
              </div>
            </article>
            <article
              className="learning-slide"
              aria-label="Qubits"
              inert={guided && active !== 1}
            >
              <div className="learning-copy">
                <h3>Then, a qubit.</h3>
                <p>
                  A quantum computer uses qubits. A qubit’s state determines the
                  probabilities of measuring <strong>0 or 1</strong>.
                </p>
                <p>
                  Measuring an unknown state can disturb it. That’s why checking
                  a quantum memory takes more care than simply reading every
                  qubit.
                </p>
                <span className="interaction-instruction">
                  Change the probability, then try a measurement.
                </span>
              </div>
              <div className="qubit-stage glass-surface">
                <div
                  className="qubit-orbit"
                  style={
                    {
                      "--chance": `${chance}%`,
                      "--qubit-angle": `${chance * 1.8}deg`,
                    } as React.CSSProperties
                  }
                >
                  <span className="orbit-axis" />
                  <span className="orbit-axis second" />
                  <i />
                  <b>{measurement === null ? "?" : measurement}</b>
                </div>
                <label>
                  Chance of measuring 1 <strong>{chance}%</strong>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={chance}
                    onChange={(e) => {
                      setChance(Number(e.target.value));
                      setMeasurement(null);
                    }}
                  />
                </label>
                <button
                  className="pill-action"
                  onClick={() => {
                    const random = new Uint32Array(1);
                    crypto.getRandomValues(random);
                    setMeasurement(
                      random[0] / 4294967296 < chance / 100 ? 1 : 0,
                    );
                  }}
                >
                  Measure this example <span>↗</span>
                </button>
                <p aria-live="polite">
                  {measurement === null
                    ? "The next result is not known yet."
                    : `This measurement returned ${measurement}. Try again.`}
                </p>
                <small>
                  Probability analogy only. A full qubit state also includes
                  phase, which this display leaves out. This is not a saved
                  research shot.
                </small>
              </div>
            </article>
            <article
              className="learning-slide"
              aria-label="A protected memory"
              inert={guided && active !== 2}
            >
              <div className="learning-copy">
                <h3>
                  Protect one.
                  <br />
                  Use many.
                </h3>
                <p>
                  Quantum error correction spreads one encoded qubit across
                  several physical qubits. Extra qubits measure checks that
                  reveal clues about errors.
                </p>
                <p>
                  My simulated memory uses{" "}
                  <strong>9 data qubits and 8 check qubits</strong>. A decoder
                  turns the check history into a prediction about the stored
                  information.
                </p>
                <span className="interaction-instruction">
                  Mark a possible error location. This annotates the diagram; it
                  doesn’t simulate an error.
                </span>
              </div>
              <div className="memory-stage glass-surface">
                <div className="memory-grid">
                  {Array.from({ length: 9 }, (_, i) => (
                    <button
                      key={i}
                      aria-label={`Mark data qubit ${i + 1}`}
                      aria-pressed={marked === i}
                      onClick={() => setMarked(marked === i ? -1 : i)}
                    >
                      <span />
                    </button>
                  ))}
                </div>
                <p aria-live="polite">
                  {marked < 0
                    ? "Nine data qubits hold one encoded memory."
                    : `Data qubit ${marked + 1} marked. Checks provide clues about where errors may have happened.`}
                </p>
                <small>
                  Simplified arrangement of the nine data qubits. The eight
                  check qubits are omitted here and described in the full
                  circuit.
                </small>
              </div>
            </article>
          </div>
        </div>
        <div className="learning-progress" aria-hidden="true">
          <i style={{ transform: `scaleX(${(active + 1) / 3})` }} />
        </div>
        <p className="learning-scroll-hint">
          Scroll to move through the ideas. On touch screens, swipe the panels
          or use the arrows.
        </p>
      </div>
    </section>
  );
}
