import { PageHeader } from "@/components/PageHeader";
export const metadata = { title: "Licenses" };
export default function Credits() {
  return (
    <>
      <PageHeader index="LEGAL" title="Licenses.">
        Attribution and permissions for the software and typefaces used here.
      </PageHeader>
      <div className="page-body prose">
        <h2>Typefaces</h2>
        <p>
          Syne by Bonjour Monde and Lucas Descroix, Instrument Serif by Rodrigo Fuenzalida, Space Grotesk by Florian
          Karsten, and Instrument Serif by Rodrigo Fuenzalida and Jordan Egstad
          are self-hosted under the SIL Open Font License.{" "}
          <a href="/fonts/OFL-BricolageGrotesque.txt">
            Bricolage Grotesque license
          </a>{" "}
          · <a href="/fonts/OFL-spacegrotesk.txt">Space Grotesk license</a> ·{" "}
          <a href="/fonts/OFL-instrumentserif.txt">Instrument Serif license</a>.
        </p>
        <h2>Software</h2>
        <p>
          <a href="https://github.com/quantumlib/Stim">Stim</a> and{" "}
          <a href="https://github.com/oscarhiggott/PyMatching">PyMatching</a>{" "}
          support the research under Apache-2.0. Next.js, React, TypeScript,
          Lenis, Three.js, React Three Fiber, and Drei supply application and
          optional spatial-view tooling under their respective open-source
          licenses.
        </p>
        <p>
          <a href="/THIRD-PARTY-NOTICES.txt">
            Full third-party software notices
          </a>
          . Exported research figures retain their{" "}
          <a href="/figures/LICENSE_DEJAVU.txt">DejaVu font permissions</a>.
        </p>
        <p>
          The 3D scenes use original geometry, Three.js instancing, and its
          MIT-licensed RoomEnvironment example. The persistent fluid effect uses{" "}
          <a href="https://github.com/michaelbrusegard/WebGL-Fluid-Enhanced">
            WebGL Fluid Enhanced
          </a>
          , derived from{" "}
          <a href="https://github.com/PavelDoGreat/WebGL-Fluid-Simulation">
            Pavel Dobryakov’s WebGL Fluid Simulation
          </a>
          , under the MIT license.{" "}
          <a href="/licenses/webgl-fluid-enhanced.txt">Retained license</a>.
          Circuit and architecture illustrations are labeled separately from
          actual saved detector records.
        </p>
        <p>
          Legacy glass-surface styling includes an integrated adaptation of{" "}
          <a href="https://github.com/DavidHDev/react-bits">
            React Bits GlassSurface
          </a>
          .{" "}
          <a href="/licenses/react-bits-glass-surface.txt">
            Retained MIT + Commons Clause terms
          </a>
          .
        </p>
        <h2 id="sound">Music and interface sounds</h2>
        <p>
          “Airport Lounge” Kevin MacLeod (
          <a href="https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100806">
            incompetech.com
          </a>
          ). Licensed under{" "}
          <a href="https://creativecommons.org/licenses/by/4.0/">
            Creative Commons: By Attribution 4.0
          </a>
          . Re-encoded at 96kbps for web delivery; playback volume is controlled
          by the visitor.
        </p>
        <p>
          Interface Sounds by{" "}
          <a href="https://kenney.nl/assets/interface-sounds">Kenney</a>,
          distributed under Creative Commons CC0 1.0. The three original Ogg
          clips are unmodified.{" "}
          <a href="/licenses/kenney-interface-sounds.txt">Full notice</a> ·{" "}
          <a href="/audio/ATTRIBUTION.txt">Audio attribution record</a>.
        </p>
      </div>
    </>
  );
}
