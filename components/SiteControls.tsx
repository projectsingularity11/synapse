"use client";
import Link from "next/link";
import { AudioControls } from "./AudioControls";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useReducedEffects } from "./useReducedEffects";
const links = [
  ["/explore", "Explore"],
  ["/demo", "Demo"],
  ["/study", "The study"],
  ["/study/paper", "Paper"],
  ["/about", "About me"],
];
export function SiteControls() {
  const [open, setOpen] = useState(false);
  const { reduced, toggle } = useReducedEffects();
  const pathname = usePathname();
  const header = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = header.current!;
    const update = () => {
      el.dataset.scrolled = scrollY > 30 ? "true" : "false";
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);
  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);
  return (
    <header
      ref={header}
      className={`site-header cinema-header ${pathname === "/" ? "on-home" : ""}`}
    >
      <Link href="/" className="wordmark" aria-label="Synapse home">
        <svg
          viewBox="0 0 48 48"
          width="32"
          height="32"
          aria-hidden="true"
          className="memory-mark"
        >
          <path
            d="M24 5 43 16 24 27 5 16Z M5 24l19 11 19-11 M5 32l19 11 19-11 M5 16v16 M43 16v16 M24 27v16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path d="m24 11 9 5-9 5-9-5Z" fill="#ff803d" />
        </svg>
        Synapse
      </Link>
      <button
        className="menu-toggle"
        aria-expanded={open}
        aria-controls="main-nav"
        onClick={() => setOpen(!open)}
      >
        Menu {open ? "−" : "+"}
      </button>
      <nav id="main-nav" aria-label="Main" className={open ? "is-open" : ""}>
        {links.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            aria-current={pathname === href ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            {label}
          </Link>
        ))}
      </nav>
      <AudioControls />
      <button
        className="effects"
        aria-label={`Reduced effects: ${reduced ? "on" : "off"}`}
        aria-pressed={reduced}
        onClick={toggle}
      >
        <span className="motion-dot" />
        Motion: {reduced ? "Reduced" : "Full"}
      </button>
    </header>
  );
}
