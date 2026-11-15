"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { QuantumStage } from "./QuantumStage";
import { useReducedEffects } from "../useReducedEffects";
import type { Study, Trace } from "@/lib/data";
const chapters = [
  {
    name: "Store",
    title: "Protect one qubit with nine.",
    copy: "A quantum memory is fragile. This experiment spreads one logical qubit across nine data qubits, so a small disturbance does not have to erase the information.",
    detail: "Distance-three surface code · schematic layout",
  },
  {
    name: "Check",
    title: "Look for changes without reading the state.",
    copy: "Extra qubits measure checks around the memory. When an expected relation changes, it leaves a clue called a detection event.",
    detail: "Check illustration · not an animation of actual faults",
  },
  {
    name: "Remember",
    title: "Read the clues across time.",
    copy: "One round can be ambiguous. Keeping several rounds gives the decoder more context. Turn this saved shot to see two recorded events among its 24 detectors.",
    detail:
      "Saved shot 1 at 3% measurement noise · actual detector coordinates",
  },
  {
    name: "Decode",
    title: "Predict whether the information flipped.",
    copy: "The neural network reads all 24 detector bits and predicts one logical outcome. I then change the measurement noise to find out how well it holds up.",
    detail:
      "24 → 32 → 16 → 1 · architecture schematic; lines are not learned weights",
  },
];
export function ResearchFilm({
  detectors,
  trace,
}: {
  detectors: Study["detectors"];
  trace: Trace;
}) {
  const root = useRef<HTMLElement>(null),
    rail = useRef<HTMLDivElement>(null),
    bar = useRef<HTMLDivElement>(null),
    progress = useRef(0),
    manual = useRef<number | null>(null);
  const [chapter, setChapter] = useState(0),
    [scrub, setScrub] = useState(0);
  const { reduced } = useReducedEffects();
  useEffect(() => {
    let frame = 0,
      current = -1;
    const section = root.current!,
      track = rail.current!,
      line = bar.current!;
    const update = () => {
      frame = 0;
      const box = section.getBoundingClientRect();
      const p =
        manual.current ??
        Math.max(
          0,
          Math.min(
            1,
            -box.top / Math.max(1, section.offsetHeight - innerHeight),
          ),
        );
      progress.current = p;
      const c = Math.min(3, Math.floor(p * 4));
      track.style.transform = `translate3d(${-c * 100}%,0,0)`;
      line.style.transform = `scaleX(${p})`;
      if (c !== current) {
        current = c;
        setChapter(c);
      }
      setScrub(Math.round(p * 100));
      window.dispatchEvent(new Event("synapse-stage-wake"));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const release = (event: Event) => {
      if (
        (event.target as Element)?.closest?.(
          "input,button,canvas,.quantum-stage",
        )
      )
        return;
      manual.current = null;
      schedule();
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("wheel", release, { passive: true });
    window.addEventListener("touchmove", release, { passive: true });
    window.addEventListener("synapse-story-seek", schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("wheel", release);
      window.removeEventListener("touchmove", release);
      window.removeEventListener("synapse-story-seek", schedule);
    };
  }, [reduced]);
  function seek(value: number) {
    manual.current = value / 100;
    progress.current = value / 100;
    setScrub(value);
    setChapter(Math.min(3, Math.floor(value / 25)));
    window.dispatchEvent(new Event("synapse-story-seek"));
  }
  return (
    <section
      className="research-film"
      ref={root}
      id="inside"
      data-chapter={chapter}
      aria-label="How the quantum memory experiment works"
    >
      <div className="film-sticky">
        <div className="film-topline">
          <span className="micro">UNDERSTAND THE EXPERIMENT</span>
          <span className="micro">SCROLL THROUGH FOUR STEPS</span>
        </div>
        <div className="film-composition">
          <div className="film-reading-window">
            <div className="film-copy-rail" ref={rail}>
              {chapters.map((c, i) => (
                <div
                  className="film-copy"
                  key={c.name}
                  aria-hidden={i !== chapter}
                >
                  <span className="film-chapter">0{i + 1} / 04</span>
                  <h2>{c.title}</h2>
                  <p>{c.copy}</p>
                  <span className="film-scene-note">{c.detail}</span>
                  {i === 3 && (
                    <Link
                      className="editorial-link"
                      href="/explore?noise=0.03&shot=1"
                      tabIndex={i === chapter ? 0 : -1}
                    >
                      Inspect the saved shots <span>↗</span>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="film-visual">
            <QuantumStage
              mode="story"
              progress={progress}
              detectors={detectors}
              events={trace.detectionEvents}
              chapter={chapter}
            />
            <div className="film-data">
              <span>
                {chapter === 2
                  ? "SAVED SHOT 1 · p = 3%"
                  : chapter === 3
                    ? "NEURAL LOGICAL-OBSERVABLE CLASSIFIER"
                    : "SURFACE-CODE MEMORY · SCHEMATIC"}
              </span>
              <span>
                {chapter === 2
                  ? "2 EVENTS / 24 DETECTORS"
                  : chapter === 0
                    ? "9 DATA QUBITS"
                    : chapter === 1
                      ? "REPEATED PARITY CHECKS"
                      : "1,345 PARAMETERS"}
              </span>
            </div>
          </div>
        </div>
        <div className="film-bottom">
          <div className="chapter-navigation" aria-label="Explanation chapters">
            {chapters.map((c, i) => (
              <button
                key={c.name}
                aria-label={`Show step ${i + 1}: ${c.name}`}
                aria-pressed={chapter === i}
                onClick={() => seek(i === 3 ? 100 : i * 25 + 2)}
              >
                <span>0{i + 1}</span>
                {c.name}
              </button>
            ))}
          </div>
          <label className="film-scrubber">
            Scene progress
            <input
              type="range"
              min="0"
              max="100"
              value={scrub}
              onChange={(e) => seek(Number(e.target.value))}
            />
          </label>
        </div>
        <div className="film-progress">
          <div ref={bar} />
        </div>
        <div className="film-outcome" data-visible={chapter === 3}>
          Full-record prediction:{" "}
          {trace.neuralPrediction ? "logical flip" : "no logical flip"} ·
          simulator truth:{" "}
          {trace.observable ? "logical flip" : "no logical flip"}. The saved
          model is not rerun on partial histories.
        </div>
      </div>
      <noscript>
        <div className="film-transcript">
          {chapters.map((c) => (
            <div key={c.name}>
              <h2>{c.title}</h2>
              <p>{c.copy}</p>
            </div>
          ))}
        </div>
      </noscript>
    </section>
  );
}
