"use client";
import { useReducedEffects } from "./useReducedEffects";
export function AccessibilityControls() {
  const { reduced, toggle } = useReducedEffects();
  return (
    <button className="control-button" aria-pressed={reduced} onClick={toggle}>
      {reduced ? "Reduced effects enabled" : "Enable reduced effects"}
    </button>
  );
}
