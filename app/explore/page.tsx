import { ReadoutLesson } from "@/components/ReadoutLesson";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Replay } from "@/components/Replay";
import { getStudy, getTraces, getTopology } from "@/lib/data";
export const metadata = { title: "Explore the traces" };
export default function Explore() {
  const s = getStudy(),
    t = getTraces();
  return (
    <article className="explore-page">
      <PageHeader index="SAVED EXPERIMENTS" title="Detector history explorer">
        Step through a saved surface-code memory shot. See exactly what the
        decoder receives, then reveal what it predicted.
      </PageHeader>
      <div className="page-body">
        <div className="data-links">
          <span>FIRST EIGHT SHOTS AT EACH NOISE SETTING</span>
          <div className="explore-subnav">
            <Link href="/demo">Recorded 3D demo ↗</Link>
            <Link href="/explore/failures">Failure gallery →</Link>
          </div>
        </div>
        <ReadoutLesson />
        {s && t ? (
          <Suspense fallback={<p>Loading saved instrument controls…</p>}>
            <Replay study={s} traces={t} topology={getTopology()} />
          </Suspense>
        ) : (
          <div className="empty">
            <h2>Saved traces unavailable</h2>
            <p>
              The replay will appear when a validated experiment artifact is
              available. No illustrative data are substituted for a real shot.
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
