"use client";
import Link from "next/link";
import { useState } from "react";
import { useReducedEffects } from "./useReducedEffects";
const links = [
  ["/explore", "Explore"],
  ["/study", "The study"],
  ["/methods", "Methods"],
  ["/sources", "Sources"],
];
export function SiteControls() {
  const [open, setOpen] = useState(false);
  const { reduced: quiet, toggle } = useReducedEffects();
  return (
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label="Syndrome home">
        <svg
          className="brand-icon"
          viewBox="0 0 32 32"
          aria-hidden="true"
          width="28"
          height="28"
        >
          <path
            d="M7 7h18v18H7zM16 2v28M2 16h28"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
          />
          <path d="M12 12h8v8h-8z" fill="currentColor" />
        </svg>{" "}
        SYNDROME<span className="edition">RESEARCH / 001</span>
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
          <Link key={href} href={href} onClick={() => setOpen(false)}>
            {label}
          </Link>
        ))}
      </nav>
      <button className="effects" aria-pressed={quiet} onClick={toggle}>
        Reduced effects <span aria-hidden="true">{quiet ? "●" : "○"}</span>
      </button>
    </header>
  );
}
