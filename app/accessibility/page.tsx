import { PageHeader } from "@/components/PageHeader";
import { AccessibilityControls } from "@/components/AccessibilityControls";
export const metadata = { title: "Accessibility" };
export default function Accessibility() {
  return (
    <>
      <PageHeader index="EXPERIENCE OPTIONS / 08" title="Another way in.">
        The research is available as ordinary text, diagrams, numeric tables and
        downloadable records. Sound, WebGL, dragging and animation are never
        required.
      </PageHeader>
      <div className="page-body prose">
        <AccessibilityControls />
        <h2>Read at your own pace.</h2>
        <p>
          The site follows your operating system’s reduced-motion preference. An
          explicit reduced-effects control is also available. Navigation is
          ordinary links and scrolling; there is no forced camera movement,
          custom cursor or timed entrance.
        </p>
        <h2>Keyboard and touch.</h2>
        <p>
          Tab moves through links and controls. Enter activates buttons and
          links. Arrow keys operate the replay’s native range control and select
          inputs. All scientific explanations are available without hover. On
          small screens, the Menu button opens the primary links.
        </p>
        <h2>Data beyond color.</h2>
        <p>
          Detection events use square markers and detector IDs. The neural
          decoder uses a diamond, fixed-prior matching a square, matched-prior
          matching a circle. Line patterns, labels and tables accompany colors.
          Every chart includes a text caption and exact numeric values.
        </p>
        <h2>Scope of verification.</h2>
        <p>
          WCAG 2.2 AA is the target. The QA record reports actual browser,
          automated accessibility and keyboard checks. Automated checks do not
          establish full conformance. A comprehensive manual screen-reader and
          assistive-technology review is still recommended.
        </p>
        <a className="text-link" href="/data/qa-report.md">
          Read the QA record →
        </a>
      </div>
    </>
  );
}
