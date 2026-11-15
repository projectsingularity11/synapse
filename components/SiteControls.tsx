"use client";
import Link from "next/link";
import { AudioControls } from "./AudioControls";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useReducedEffects } from "./useReducedEffects";
const links = [
  ["/explore", "Explore"],
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
        <svg viewBox="0 0 32 32" width="27" height="27" aria-hidden="true">
          <path
            d="M16 2v28M2 16h28M6 6l20 20M6 26 26 6"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle cx="16" cy="16" r="6" fill="currentColor" />
        </svg>
        synapse
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
