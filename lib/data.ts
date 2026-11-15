import fs from "node:fs";
import path from "node:path";
export function readArtifact<T = Record<string, unknown>>(
  file: string,
): T | null {
  const p = path.join(process.cwd(), "research", file);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8")) as T;
}
export type Metric = {
  failures: number;
  errorRate: number;
  ci95: [number, number];
};
export type Reliability = {
  lower: number;
  upper: number;
  count: number;
  meanPrediction: number | null;
  observedFrequency: number | null;
  observedFrequencyCi95?: [number, number] | null;
};
export type Condition = {
  measurementNoise: number;
  shots: number;
  neural: Metric & {
    brier: number;
    reliability: Reliability[];
    seeds?: (Metric & {
      seed: number;
      brier: number;
      reliability: Reliability[];
    })[];
    meanErrorRateAcrossSeeds?: number;
    sdErrorRateAcrossSeeds?: number;
  };
  fixedMatching: Metric;
  matchedMatching: Metric;
};
export type Study = {
  schemaVersion: number;
  runId: string;
  status: string;
  config: Record<string, number | string | number[]>;
  detectors: {
    id: number;
    coordinates: number[];
    boundary: "initial" | "interior" | "final";
    measurementRecordOffsets: number[];
  }[];
  qubits: {
    id: number;
    coordinates: number[];
    role: "data" | "measurement";
    checkBasis: "X" | "Z" | null;
  }[];
  model: {
    architecture: number[];
    parameterCount: number;
    seeds: number[];
    training?: {
      seed: number;
      epochsExecuted: number;
      selectedEpoch: number;
      validationLogLoss: number;
      validationLogLossByEpoch: number[];
    }[];
  };
  conditions: Condition[];
  timing: {
    scope: string;
    batchSize: number;
    repeats: number;
    threads: number;
    medianBatchMs: number;
    medianMicrosecondsPerShotAmortized: number;
    hardware: string;
    cpu: string;
    warmup: string;
  };
  manifestPath: string;
};
export type Trace = {
  id: string;
  measurementNoise: number;
  shotIndex: number;
  detectionEvents: number[];
  observable: number;
  neuralProbability: number;
  neuralPrediction: number;
  fixedPrediction: number;
  matchedPrediction: number;
};
export type Traces = {
  schemaVersion: number;
  runId: string;
  selection: string;
  traces: Trace[];
};
export type Source = {
  id: string;
  title: string;
  authors: string[] | string;
  date: string | null;
  url: string;
  accessDate: string;
  type: string;
  relevance: string;
  verification: string;
};
export const getStudy = () =>
  readArtifact<Study>("results/aggregates/study.json");
export const getTraces = () =>
  readArtifact<Traces>("results/representative-traces/traces.json");

export type Topology = {
  parentRunId: string;
  procedure: string;
  checks: { ancillaId: number; basis: string; dataQubitIds: number[] }[];
};
export type Supplement = {
  parentRunId: string;
  runId: string;
  analysis: string;
  manifestPath: string;
  conditions: {
    measurementNoise: number;
    shots: number;
    reliability: Reliability[];
    paired: {
      comparison: string;
      bothCorrect: number;
      neuralOnlyCorrect: number;
      matchingOnlyCorrect: number;
      bothWrong: number;
    }[];
  }[];
};
export const getTopology = () =>
  readArtifact<Topology>("results/aggregates/topology.json");
export const getSupplement = () =>
  readArtifact<Supplement>("results/aggregates/supplement.json");
export type Confirmation = Pick<
  Study,
  "schemaVersion" | "runId" | "config" | "conditions" | "model"
> & {
  parentRunId: string;
  purpose: string;
  status: string;
  manifestPath: string;
};
export const getConfirmation = () =>
  readArtifact<Confirmation>("results/aggregates/confirmation.json");
export function readTextArtifact(file: string): string | null {
  const location = path.join(process.cwd(), "research", file);
  return fs.existsSync(location) ? fs.readFileSync(location, "utf8") : null;
}
export type ConfidenceGroup = {
  lower?: number;
  upper?: number;
  minimumConfidence?: number;
  count: number;
  failures: number;
  coverage: number;
  errorRate: number | null;
  ci95: [number, number] | null;
  meanConfidence: number | null;
  observedAccuracy: number | null;
  observedAccuracyCi95: [number, number] | null;
};
export type ConfusionCounts = {
  trueNegative: number;
  falsePositive: number;
  falseNegative: number;
  truePositive: number;
};
export type DiagnosticCondition = {
  measurementNoise: number;
  testDataSeed: number;
  shots: number;
  observableOneCount: number;
  prevalence: number;
  meanPredictedFlipProbability: number;
  eventProbabilityGap: number;
  baselines: {
    alwaysNoFlip: Metric & { brier: number };
    trainingPrevalenceConstant: { probability: number; brier: number };
  };
  confusion: Record<
    "neural" | "fixedMatching" | "matchedMatching",
    ConfusionCounts
  >;
  confidenceBins: ConfidenceGroup[];
  selectiveRisk: ConfidenceGroup[];
};
export type Diagnostics = {
  schemaVersion: number;
  runId: string;
  parentRunIds: string[];
  purpose: string;
  status: string;
  trainingPrevalence: {
    sourceSeed: number;
    shots: number;
    observableOneCount: number;
    probability: number;
  };
  definitions: Record<string, string | number[]>;
  datasets: {
    source: "primary" | "confirmation";
    parentRunId: string;
    conditions: DiagnosticCondition[];
  }[];
  manifestPath: string;
};
export const getDiagnostics = () =>
  readArtifact<Diagnostics>("results/aggregates/diagnostics.json");
export type TrainingControl = {
  schemaVersion: number;
  runId: string;
  parentRunId: string;
  purpose: string;
  status: string;
  config: Record<string, string | number | number[]>;
  model: { architecture: number[]; parameterCount: number; seeds: number[] };
  conditions: {
    measurementNoise: number;
    testDataSeed: number;
    shots: number;
    seeds: {
      seed: number;
      fixedTraining: Metric & { brier: number };
      matchedTraining: Metric & { brier: number };
      paired: {
        bothCorrect: number;
        fixedOnlyCorrect: number;
        matchedOnlyCorrect: number;
        bothWrong: number;
      };
      errorDifferenceMatchedMinusFixed: number;
    }[];
    fixedMatching: Metric;
    matchedMatching: Metric;
  }[];
  manifestPath: string;
};
export const getTrainingControl = () =>
  readArtifact<TrainingControl>("results/aggregates/training-control.json");
