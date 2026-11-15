"use client";
import { useEffect, useRef, useState } from "react";
export function PaperTools() {
  const [compact, setCompact] = useState(false),
    [copied, setCopied] = useState(false),
    [active, setActive] = useState("abstract");
  const progress = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const article = document.querySelector(".paper-page")!;
    let frame = 0;
    const update = () => {
      frame = 0;
      const top = article.getBoundingClientRect().top + scrollY;
      const length = article.scrollHeight - innerHeight;
      const p = Math.max(0, Math.min(1, (scrollY - top) / Math.max(1, length)));
      if (progress.current) progress.current.style.transform = `scaleX(${p})`;
    };
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const sections = article.querySelectorAll(".paper-article>section");
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-110px 0px -55% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    window.addEventListener("scroll", scroll, { passive: true });
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", scroll);
      delete (article as HTMLElement).dataset.density;
    };
  }, []);
  useEffect(() => {
    document.querySelectorAll('.paper-toc a[href^="#"]').forEach((a) => {
      if (a.getAttribute("href") === `#${active}`)
        a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    });
  }, [active]);
  function density() {
    const next = !compact;
    setCompact(next);
    const page = document.querySelector<HTMLElement>(".paper-page");
    if (page) page.dataset.density = next ? "compact" : "comfortable";
  }
  async function citation() {
    try {
      await navigator.clipboard.writeText(
        "Benseddik, A. (2026). Measurement-noise shift in a learned quantum decoder. Synapse. Independent computational study.",
      );
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }
  return (
    <>
      <div className="reading-progress" aria-hidden="true">
        <div ref={progress} />
      </div>
      <span className="micro">READING TOOLS</span>
      <button onClick={density} aria-pressed={compact}>
        Compact reading <span>{compact ? "On" : "Off"}</span>
      </button>
      <button onClick={() => window.print()}>
        Print / save PDF <span>↗</span>
      </button>
      <button onClick={citation}>
        {copied ? "Citation copied" : "Copy citation"}{" "}
        <span>{copied ? "✓" : "↗"}</span>
      </button>
      <div className="paper-at-a-glance">
        <span className="micro">STUDY AT A GLANCE</span>
        <dl>
          <div>
            <dt>Code distance</dt>
            <dd>3</dd>
          </div>
          <div>
            <dt>Rounds</dt>
            <dd>3</dd>
          </div>
          <div>
            <dt>Model parameters</dt>
            <dd>1,345</dd>
          </div>
          <div>
            <dt>Independent test shots</dt>
            <dd>880,000</dd>
          </div>
        </dl>
        <p>
          Original, confirmation, and control results are reported separately.
        </p>
      </div>
    </>
  );
}
