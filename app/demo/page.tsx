import "./demo.css";
import { Suspense } from "react";
import { RecordedDemo } from "@/components/demo/RecordedDemo";
import { getStudy, getTraces } from "@/lib/data";
import Link from "next/link";
export const metadata = {
  title: "Recorded 3D demo",
  description:
    "Explore a saved quantum-memory experiment with three-dimensional playback, measured noise settings, decoder comparisons, and recorded results.",
};
export default function DemoPage() {
  const study = getStudy(),
    traces = getTraces();
  if (!study || !traces)
    return (
      <article className="page-body">
        <h1>Recorded demo unavailable</h1>
        <p>The saved experiment data could not be loaded.</p>
        <Link href="/study/paper">Read the research paper</Link>
      </article>
    );
  return (
    <Suspense
      fallback={
        <article className="page-body">
          <h1>Recorded demo</h1>
          <p>
            Loading the saved experiment controls.{" "}
            <Link href="/study/paper">Read the full research paper</Link>.
          </p>
        </article>
      }
    >
      <RecordedDemo study={study} traces={traces} />
    </Suspense>
  );
}
