"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { DEMO_DURATION } from "@/lib/demo-timeline";
import type { DemoSceneHandle } from "./DemoScene";
export function useDemoPlayback(
  sceneRef: RefObject<DemoSceneHandle | null>,
  initialSeconds = 0,
) {
  const [playing, setPlaying] = useState(false),
    [position, setPosition] = useState(initialSeconds),
    [speed, setSpeed] = useState(1),
    [loop, setLoop] = useState(false);
  const clockRef = useRef(initialSeconds),
    sliderRef = useRef<HTMLInputElement>(null),
    stampRef = useRef<HTMLOutputElement>(null);
  const update = useCallback(
    (seconds: number) => {
      clockRef.current = Math.max(0, Math.min(DEMO_DURATION, seconds));
      if (sliderRef.current) sliderRef.current.value = String(clockRef.current);
      if (stampRef.current)
        stampRef.current.textContent = `00:${Math.floor(clockRef.current).toString().padStart(2, "0")} / 00:24`;
      sceneRef.current?.draw();
    },
    [sceneRef],
  );
  useEffect(() => {
    update(clockRef.current);
  }, [update]);
  const seek = useCallback(
    (seconds: number) => {
      update(seconds);
      setPosition(clockRef.current);
    },
    [update],
  );
  useEffect(() => {
    if (!playing) return;
    let frame = 0,
      last = 0,
      lastUi = 0;
    function tick(now: number) {
      if (last) {
        const next =
          clockRef.current + (Math.min(100, now - last) / 1000) * speed;
        if (next >= DEMO_DURATION) {
          if (loop) update(0);
          else {
            update(DEMO_DURATION);
            setPosition(DEMO_DURATION);
            setPlaying(false);
            return;
          }
        } else update(next);
      }
      last = now;
      if (now - lastUi > 160) {
        lastUi = now;
        setPosition(clockRef.current);
      }
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, speed, loop, update]);
  useEffect(() => {
    const hidden = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener("visibilitychange", hidden);
    return () => document.removeEventListener("visibilitychange", hidden);
  }, []);
  const toggle = () => {
    if (clockRef.current >= DEMO_DURATION) seek(0);
    setPlaying((p) => !p);
  };
  return {
    playing,
    setPlaying,
    position,
    speed,
    setSpeed,
    loop,
    setLoop,
    clockRef,
    sliderRef,
    stampRef,
    seek,
    toggle,
  };
}
