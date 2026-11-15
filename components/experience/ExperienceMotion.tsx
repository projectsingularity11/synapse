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
    if (reduced) {
      document.documentElement.dataset.scrollEngine = "native";
      return;
    }
    const lenis = new Lenis({
      autoRaf: false,
      lerp: 0.085,
      smoothWheel: true,
      anchors: true,
      syncTouch: false,
    });
    document.documentElement.dataset.scrollEngine = "lenis";
    let frame = 0;
    const tick = (now: number) => {
      lenis.raf(now);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const scrollTo = (event: Event) => {
      const { top } = (event as CustomEvent<{ top: number }>).detail;
      lenis.scrollTo(top, { duration: 1.15, force: true });
    };
    window.addEventListener("synapse-scroll-to", scrollTo);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("synapse-scroll-to", scrollTo);
      lenis.destroy();
      delete document.documentElement.dataset.scrollEngine;
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
        reduced
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
