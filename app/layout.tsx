import type { Metadata } from "next";
import Link from "next/link";
import { SiteControls } from "@/components/SiteControls";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "SYNDROME — Errors leave traces",
    template: "%s · SYNDROME",
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
        <SiteControls />
        <main id="main">{children}</main>
        <footer>
          <div>
            <Link href="/" className="footer-brand">
              SYNDROME
            </Link>
            <p>An independent study of learned quantum error decoding.</p>
          </div>
          <nav aria-label="Footer">
            <Link href="/about">About the project</Link>
            <Link href="/credits">Credits & licenses</Link>
            <Link href="/accessibility">Accessibility</Link>
            <a href="/data/study.json">Research data →</a>
          </nav>
          <span className="footer-note">
            CLASSICAL LEARNING.
            <br />
            QUANTUM QUESTIONS.
          </span>
        </footer>
      </body>
    </html>
  );
}
