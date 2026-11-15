import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { TrainingControlEvidence } from "@/components/TrainingControlEvidence";
import { getTrainingControl } from "@/lib/data";
export const metadata = { title: "Matched-training control" };
export default function TrainingControlPage() {
  const study = getTrainingControl();
  return (
    <>
      <PageHeader
        index="THE FOLLOW-UP / EQUAL TRAINING BUDGETS"
        title="What if training changed too?"
      >
        A stronger comparison within the same neural architecture: keep training
        fixed, or train with the known evaluation noise.
      </PageHeader>
      <div className="page-body">
        <div className="data-links">
          <Link href="/study">Original study →</Link>
          <Link href="/study/diagnostics">Confidence diagnostics →</Link>
          <a href="/data/training-control.json" download>
            Control data ↓
          </a>
          <a href="/data/training-control-manifest.json" download>
            Manifest ↓
          </a>
          <a href="/data/training-control-protocol.md">Recorded protocol ↓</a>
          <a href="/figures/follow-up/training-noise-control.pdf" download>
            Training-control figure PDF ↓
          </a>
        </div>
        <div className="notice">
          EXPLORATORY FOLLOW-UP / ORACLE NOISE KNOWLEDGE. The design follows the
          original results, but its source and protocol were committed before
          these fresh test labels were drawn. Matched training is given the
          evaluation noise model. It is not adaptation from unlabeled hardware
          drift.
        </div>
        <p className="large-copy">
          More noise makes decoding harder. The original sweep changed both task
          difficulty and mismatch together. This follow-up asks whether an
          equal-budget model trained for each noise setting fares differently.
        </p>
        {study ? (
          <TrainingControlEvidence
            study={{
              runId: study.runId,
              model: study.model,
              conditions: study.conditions.map((c) => ({
                ...c,
                seeds: c.seeds.map((s) => ({
                  ...s,
                  fixedTraining: {
                    failures: s.fixedTraining.failures,
                    errorRate: s.fixedTraining.errorRate,
                    ci95: s.fixedTraining.ci95,
                    brier: s.fixedTraining.brier,
                  },
                  matchedTraining: {
                    failures: s.matchedTraining.failures,
                    errorRate: s.matchedTraining.errorRate,
                    ci95: s.matchedTraining.ci95,
                    brier: s.matchedTraining.brier,
                  },
                })),
              })),
            }}
          />
        ) : (
          <p className="empty">
            Validated training-control results are unavailable. No result is
            substituted.
          </p>
        )}
        <section className="prose">
          <h2>What the control does—and does not—settle.</h2>
          <p>
            Matched training reduces the observed higher-noise errors for all
            three model initializations in this study. It does not erase the gap
            to matching, and it does not improve classification error at the
            lowest tested noise.
          </p>
          <p>
            Each noise setting uses one generated training/validation-data
            realization. Different datasets and optimization outcomes remain
            part of the learning-procedure contrast. Three initializations are
            not independent repetitions of the whole data-generating process,
            and their test shots must not be pooled as a larger sample.
          </p>
          <p>
            This does not isolate a universal causal mismatch penalty, establish
            hardware robustness or recommend a deployment strategy. The original
            results, frozen-model confirmation and this new-model control remain
            separate evidence.
          </p>
          <Link className="text-link" href="/sources#S10">
            Sources and exact claims S10 →
          </Link>
        </section>
      </div>
    </>
  );
}
