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
    <>
      <PageHeader index="THE INSTRUMENT / 02" title="A history of clues.">
        Step through a saved surface-code memory shot. See exactly what the
        decoder receives, then reveal what it predicted.
      </PageHeader>
      <div className="page-body">
        <div className="data-links">
          <span>FIRST EIGHT SHOTS / REPRESENTATIVE RULE</span>
          <Link href="/explore/failures">Open labeled failure gallery →</Link>
        </div>
        {s && t ? (
          <Suspense fallback={<p>Loading saved instrument controls…</p>}>
            <Replay study={s} traces={t} topology={getTopology()} />
          </Suspense>
        ) : (
          <div className="empty">
            <h2>Pilot pending.</h2>
            <p>
              The replay will appear when a validated experiment artifact is
              available. No illustrative data are substituted for a real shot.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
