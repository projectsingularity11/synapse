import type { Metadata } from "next";
import Link from "next/link";
import { SiteControls } from "@/components/SiteControls";
import "./globals.css";
import "./experience.css";
import { ExperienceMotion } from "@/components/experience/ExperienceMotion";
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
    <html lang="en">
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <ExperienceMotion />
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
            <Link href="/about">About the project</Link>
            <Link href="/credits">Credits & licenses</Link>
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
