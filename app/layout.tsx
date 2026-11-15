import type { Metadata } from "next";
import Link from "next/link";
import { SiteControls } from "@/components/SiteControls";
import "./globals.css";
import "./experience.css";
import "./dark-experience.css";
import "./cinematic.css";
import { WaterBackdrop } from "@/components/experience/WaterBackdrop";
import localFont from "next/font/local";
import { ExperienceMotion } from "@/components/experience/ExperienceMotion";
const display = localFont({
  src: "../public/fonts/ElMessiri.ttf",
  variable: "--font-display",
  display: "swap",
  weight: "400 700",
});
const space = localFont({
  src: "../public/fonts/SpaceGrotesk.ttf",
  variable: "--font-space",
  display: "swap",
  weight: "300 700",
});
const instrument = localFont({
  preload: false,
  src: "../public/fonts/InstrumentSerif-Italic.ttf",
  variable: "--font-instrument",
  display: "swap",
  weight: "400",
  style: "italic",
});
export const metadata: Metadata = {
  title: {
    default: "Synapse — Research by Assirem Benseddik",
    template: "%s · Synapse",
  },
  description:
    "An independent computational study of learned quantum error decoding under measurement-noise mismatch.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${space.variable} ${instrument.variable} ${display.variable}`}
    >
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <ExperienceMotion />
        <WaterBackdrop />
        <noscript>
          <style>{`.experience-loader{display:none!important}`}</style>
        </noscript>
        <SiteControls />
        <main id="main">{children}</main>
        <footer>
          <div>
            <Link href="/" className="footer-brand">
              Synapse
            </Link>
            <p>Independent research by Assirem Benseddik.</p>
          </div>
          <nav aria-label="Footer">
            <Link href="/about">About me</Link>
            <Link href="/sources">Sources</Link>
            <Link href="/credits">Licenses</Link>
            <Link href="/methods">Methods</Link>
            <Link href="/accessibility">Accessibility</Link>
            <a href="/data/study.json">Research data →</a>
          </nav>
          <a className="footer-note" href="#main">
            Back to top ↑
          </a>
        </footer>
      </body>
    </html>
  );
}
