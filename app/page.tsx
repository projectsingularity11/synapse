import { ResearchJourney } from "@/components/experience/ResearchJourney";
import {
  getStudy,
  getTraces,
  getDiagnostics,
  getTrainingControl,
} from "@/lib/data";
export default function Home() {
  const study = getStudy(),
    traces = getTraces();
  const confidence = getDiagnostics()
    ?.datasets.find((d) => d.source === "confirmation")
    ?.conditions.find((c) => c.measurementNoise === 0.03)?.selectiveRisk;
  const control = getTrainingControl()?.conditions.find(
    (c) => c.measurementNoise === 0.03,
  );
  const pair = control?.seeds.find((s) => s.seed === 101);
  if (!study || !traces || !confidence || !control || !pair)
    return (
      <section className="page-body">
        <h1>The study is unavailable.</h1>
        <p>Please reload or open the methods page.</p>
      </section>
    );
  return (
    <ResearchJourney
      conditions={study.conditions.map((c) => ({
        ...c,
        neural: { ...c.neural, reliability: [], seeds: undefined },
      }))}
      traces={traces.traces.filter((t) => t.measurementNoise === 0.03)}
      confidence={confidence}
      control={{
        fixed: pair.fixedTraining.failures,
        matched: pair.matchedTraining.failures,
        matching: control.matchedMatching.failures,
        shots: control.shots,
      }}
    />
  );
}
