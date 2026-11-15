"use client";
import { useEffect, useSyncExternalStore } from "react";
const event = "syndrome-effects-change";
function subscribe(callback: () => void) {
  window.addEventListener(event, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(event, callback);
    window.removeEventListener("storage", callback);
  };
}
let memory = false;
let storageWriteFailed = false;
function snapshot() {
  if (storageWriteFailed) return memory;
  try {
    return localStorage.getItem("syndrome-effects") === "reduced";
  } catch {
    return memory;
  }
}
export function useReducedEffects() {
  const reduced = useSyncExternalStore(subscribe, snapshot, () => false);
  useEffect(() => {
    document.documentElement.dataset.effects = reduced ? "reduced" : "full";
  }, [reduced]);
  function toggle() {
    memory = !reduced;
    try {
      localStorage.setItem("syndrome-effects", reduced ? "full" : "reduced");
    } catch {
      storageWriteFailed = true;
    }
    window.dispatchEvent(new Event(event));
  }
  return { reduced, toggle };
}
