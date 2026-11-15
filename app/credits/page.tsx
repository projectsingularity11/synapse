import { PageHeader } from "@/components/PageHeader";
export const metadata = { title: "Credits & licenses" };
export default function Credits() {
  return (
    <>
      <PageHeader index="PROVENANCE / 07" title="Credits and licenses.">
        Original scientific diagrams and editorial design, supported by
        documented open-source tools.
      </PageHeader>
      <div className="page-body prose">
        <h2>Research software.</h2>
        <p>
          <a href="https://github.com/quantumlib/Stim">Stim</a> generates
          stabilizer-circuit samples and detector-error models.{" "}
          <a href="https://github.com/oscarhiggott/PyMatching">PyMatching</a>{" "}
          supplies minimum-weight perfect matching. Both use Apache-2.0
          licensing; retained distribution notices accompany the installed
          packages.
        </p>
        <h2>The public experience.</h2>
        <p>
          Next.js, React and TypeScript support the static editorial experience
          and replay. Native controls and original SVG figures keep exact
          results readable. The self-hosted Manrope font is distributed under
          its SIL Open Font License, retained at /fonts/OFL-Manrope.txt.
        </p>
        <p>
          <a href="https://github.com/pmndrs/react-three-fiber">
            React Three Fiber 9.8.2
          </a>
          , <a href="https://github.com/pmndrs/drei">Drei 10.7.9</a> and{" "}
          <a href="https://github.com/mrdoob/three.js">Three.js 0.187.0</a>{" "}
          power the explicitly activated spatial history view under MIT
          licenses. Lenis supplies smooth desktop scrolling under the MIT
          license; touch and reduced-motion reading retain native scrolling.
          Original SVG charts serve the evidence pages. Exact repository
          revisions and license evidence are in the dependency audit.
        </p>
        <h2>Visual assets.</h2>
        <p>
          The liquid background and pointer ripples use an original analytic
          wave shader with a Canvas 2D fallback. They are visual effects, not
          experimental data. The detector history uses actual saved simulation
          shots; its layers show time schematically. No paper figures or
          reference-site assets were copied. The glass styling adaptation is
          credited below.
        </p>
        <p>
          <a href="/THIRD-PARTY-NOTICES.txt">
            Read retained third-party software notices →
          </a>
        </p>
        <p>
          Standalone scientific figure exports use Matplotlib’s bundled DejaVu
          Sans. Its{" "}
          <a href="/figures/LICENSE_DEJAVU.txt">
            full font copyright and permission notices
          </a>{" "}
          are retained beside those downloads. It is not a downloaded website
          font.
        </p>
        <h2>Glass surfaces and typography.</h2>
        <p>
          The frosted-glass fallback styling is adapted from{" "}
          <a href="https://github.com/DavidHDev/react-bits">
            React Bits’ GlassSurface
          </a>{" "}
          at the recorded revision, under its MIT + Commons Clause terms. It is
          integrated into this website, not offered as a standalone component
          library.{" "}
          <a href="/licenses/react-bits-glass-surface.txt">
            Read the full retained license
          </a>
          .
        </p>
        <p>
          Syne is the display face and Manrope is the reading face. Their full{" "}
          <a href="/fonts/OFL-Syne.txt">Syne license</a> and{" "}
          <a href="/fonts/OFL-Manrope.txt">Manrope license</a> are retained.
          Both fonts are self-hosted as WOFF2 with all glyphs preserved.
        </p>
        <h2>Why there is no soundtrack.</h2>
        <p>
          Sound is off and unavailable in this release. The candidate individual
          music-track license could not be verified from this environment, so no
          audio file is included or downloaded. No claim of audition or seamless
          looping is made.
        </p>
        <div className="data-links">
          <a href="/data/dependency-audit.md">Dependency audit ↓</a>
          <a href="/data/asset-register.csv">Asset register ↓</a>
        </div>
      </div>
    </>
  );
}
