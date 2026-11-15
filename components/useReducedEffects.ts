"use client";
import { useEffect, useSyncExternalStore } from "react";

type Preference = "system" | "full" | "reduced";
const event = "syndrome-effects-change";
let memory: Preference = "system";
let storageWriteFailed = false;
function preference(): Preference {
  if (storageWriteFailed) return memory;
  try {
    const saved =
      localStorage.getItem("synapse-motion-v2") ??
      localStorage.getItem("syndrome-effects");
    return saved === "full" || saved === "reduced" ? saved : "system";
  } catch {
    return memory;
  }
}
function snapshot() {
  const value = preference();
  return value === "system"
    ? `system:${matchMedia("(prefers-reduced-motion: reduce)").matches ? "reduced" : "full"}`
    : value;
}
function subscribe(callback: () => void) {
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  window.addEventListener(event, callback);
  window.addEventListener("storage", callback);
  media.addEventListener("change", callback);
  return () => {
    window.removeEventListener(event, callback);
    window.removeEventListener("storage", callback);
    media.removeEventListener("change", callback);
  };
}
export function useReducedEffects() {
  const value = useSyncExternalStore(subscribe, snapshot, () => "system:full");
  const reduced = value.endsWith("reduced");
  useEffect(() => {
    document.documentElement.dataset.effects = reduced ? "reduced" : "full";
    document.documentElement.dataset.motionChoice = value.startsWith("system:")
      ? "system"
      : value;
  }, [value, reduced]);
  function toggle() {
    memory = reduced ? "full" : "reduced";
    try {
      localStorage.setItem("synapse-motion-v2", memory);
      localStorage.setItem("syndrome-effects", memory);
    } catch {
      storageWriteFailed = true;
    }
    window.dispatchEvent(new Event(event));
  }
  return { reduced, toggle, followsSystem: value.startsWith("system:") };
}
