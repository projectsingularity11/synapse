"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { QuantumStage } from "./QuantumStage";
import { useReducedEffects } from "../useReducedEffects";
import type { Study, Trace } from "@/lib/data";
const chapters = [
  {
    name: "Store",
    title: "Why one logical qubit uses several physical qubits",
    copy: "In this experiment, nine data qubits work together to encode one logical qubit. That redundancy gives the decoder a way to recognize some disturbances without directly measuring the information the memory is supposed to preserve.",
    detail: "Distance-three surface code · schematic layout",
  },
  {
    name: "Check",
    title: "How the memory checks for changes without reading its state",
    copy: "Additional qubits measure relationships around the memory instead of reading its stored state directly. When an expected relationship changes, the resulting detection event gives the decoder evidence that something may have gone wrong.",
    detail: "Check illustration · not an animation of actual faults",
  },
  {
    name: "Remember",
    title: "Why the decoder needs a history of measurements",
    copy: "A single round does not always provide enough context, so the decoder reads checks across time. This saved shot contains two recorded events among 24 detectors; rotating the view makes it easier to see which time slices they belong to.",
    detail:
      "Saved shot 1 at 3% measurement noise · actual detector coordinates",
  },
  {
    name: "Decode",
    title: "How the neural network makes its final prediction",
    copy: "The neural network uses the complete 24-bit record to predict whether the memory’s logical readout has flipped. I evaluate that prediction against the simulator’s recorded outcome, then compare its overall error rate with the matching baselines.",
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
  function seek(value: number, showChapter = false) {
    manual.current = value / 100;
    progress.current = value / 100;
    setScrub(value);
    setChapter(Math.min(3, Math.floor(value / 25)));
    window.dispatchEvent(new Event("synapse-story-seek"));
    if (showChapter && (reduced || innerWidth <= 700))
      root.current?.scrollIntoView({
        block: "start",
        behavior: reduced ? "auto" : "smooth",
      });
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
          <span className="micro">How the experiment works</span>
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
                onClick={() => seek(i === 3 ? 100 : i * 25 + 2, true)}
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
