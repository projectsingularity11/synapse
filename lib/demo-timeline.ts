import type { Trace } from "./data";
export const DEMO_DURATION = 24;
export const demoChapters = [
  {
    at: 0,
    title: "Encode the memory",
    detail:
      "Nine data qubits encode one logical qubit. This is a layout illustration, not a reconstruction of physical faults.",
  },
  {
    at: 4,
    title: "Measure parity checks",
    detail:
      "Eight measurement qubits check relationships among the data qubits without directly reading the logical state.",
  },
  {
    at: 8,
    title: "Collect detector history",
    detail:
      "The layers show actual detector coordinates across four recorded time slices. Orange markers identify saved detection events.",
  },
  {
    at: 18,
    title: "Read the decoder result",
    detail:
      "The selected decoder predicts a logical-observable flip from the complete saved history. No model runs in your browser.",
  },
];
export function demoFrame(seconds: number) {
  const phase = seconds < 4 ? 0 : seconds < 8 ? 1 : seconds < 18 ? 2 : 3;
  return {
    phase,
    slice: seconds < 8 ? -1 : Math.min(3, Math.floor((seconds - 8) / 2.5)),
    complete: seconds >= 18,
  };
}
export type Decoder = "neural" | "matchedMatching" | "fixedMatching";
export function recordedPrediction(trace: Trace, decoder: Decoder) {
  return decoder === "neural"
    ? trace.neuralPrediction
    : decoder === "matchedMatching"
      ? trace.matchedPrediction
      : trace.fixedPrediction;
}
export type DemoView = {
  seconds: number;
  yaw: number;
  pitch: number;
  zoom: number;
  layers: boolean;
  reduced: boolean;
};
