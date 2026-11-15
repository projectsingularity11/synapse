"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Lenis from "lenis";
import { useReducedEffects } from "../useReducedEffects";
import "lenis/dist/lenis.css";

export function ExperienceMotion() {
  const pathname = usePathname(),
    router = useRouter();
  const { reduced } = useReducedEffects();
  const [boot, setBoot] = useState(pathname === "/");
  const [cover, setCover] = useState(false);
  useEffect(() => {
    if (pathname !== "/") return;
    let disposed = false;
    const finish = () => {
      document.fonts.ready.then(() => {
        if (!disposed) setBoot(false);
      });
    };
    window.addEventListener("synapse-scene-ready", finish, { once: true });
    const timeout = setTimeout(finish, 1800);
    return () => {
      disposed = true;
      clearTimeout(timeout);
      window.removeEventListener("synapse-scene-ready", finish);
    };
  }, [pathname]);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced || media.matches) return;
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.085,
      smoothWheel: true,
      anchors: true,
    });
    const change = () => {
      if (media.matches) lenis.destroy();
    };
    media.addEventListener("change", change);
    return () => {
      media.removeEventListener("change", change);
      lenis.destroy();
    };
  }, [reduced]);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const click = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey ||
        reduced ||
        matchMedia("(prefers-reduced-motion: reduce)").matches
      )
        return;
      const link = (event.target as Element).closest("a");
      if (!link || link.hasAttribute("download") || link.target || !link.href)
        return;
      const url = new URL(link.href);
      if (
        url.origin !== location.origin ||
        url.pathname === location.pathname ||
        url.pathname.startsWith("/data/") ||
        url.pathname.startsWith("/figures/") ||
        /\.[a-z]+$/i.test(url.pathname)
      )
        return;
      event.preventDefault();
      setCover(true);
      timer = setTimeout(() => {
        router.push(url.pathname + url.search + url.hash);
      }, 260);
    };
    document.addEventListener("click", click, true);
    return () => {
      document.removeEventListener("click", click, true);
      clearTimeout(timer);
    };
  }, [router, reduced]);
  useEffect(() => {
    const t = setTimeout(() => setCover(false), 180);
    return () => clearTimeout(t);
  }, [pathname]);
  return (
    <>
      <div
        className={`route-curtain ${cover ? "cover" : ""}`}
        aria-hidden="true"
      >
        <span>Synapse</span>
      </div>
      {
        <div
          className={`experience-loader ${boot ? "" : "is-ready"}`}
          role={boot ? "status" : undefined}
          aria-hidden={!boot}
        >
          <span className="loader-brand">Synapse</span>
          <div className="loader-line" />
          <p>Preparing the interactive study</p>
        </div>
      }
    </>
  );
}
