"use client";
import { useEffect, useRef, useState } from "react";
import { enableInterfaceSound, playInterfaceSound } from "@/lib/sound";
export function AudioControls() {
  const [open, setOpen] = useState(false),
    [playing, setPlaying] = useState(false),
    [sfx, setSfx] = useState(false),
    [volume, setVolume] = useState(0.18),
    [error, setError] = useState("");
  const root = useRef<HTMLDivElement>(null),
    audio = useRef<HTMLAudioElement>(null),
    wasPlaying = useRef(false);
  useEffect(() => {
    const click = (e: MouseEvent) => {
      const target = (e.target as Element).closest("a,button,summary");
      if (target && !target.closest('[data-sound="off"]')) playInterfaceSound();
    };
    const change = (e: Event) => {
      if ((e.target as Element).matches("input,select"))
        playInterfaceSound("tick");
    };
    document.addEventListener("click", click);
    document.addEventListener("change", change);
    return () => {
      document.removeEventListener("click", click);
      document.removeEventListener("change", change);
    };
  }, []);
  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  useEffect(() => {
    const element = audio.current!;
    element.volume = volume;
  }, [volume]);
  useEffect(() => {
    const element = audio.current!;
    const visibility = () => {
      if (document.hidden) {
        wasPlaying.current = !element.paused;
        element.pause();
      } else if (wasPlaying.current) {
        element.play().catch(() => setError("Select play to resume."));
        wasPlaying.current = false;
      }
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      document.removeEventListener("visibilitychange", visibility);
      element.pause();
    };
  }, []);
  function toggleMusic() {
    const element = audio.current!;
    setError("");
    if (!element.paused) {
      element.pause();
      return;
    }
    element.volume = volume;
    element
      .play()
      .then(() => {
        if (!sfx) {
          setSfx(true);
          void enableInterfaceSound(true);
        }
      })
      .catch(() => setError("Music could not start. Try play again."));
  }
  function toggleSfx() {
    const next = !sfx;
    setSfx(next);
    void enableInterfaceSound(next).then(() => {
      if (next) playInterfaceSound("switch");
    });
  }
  return (
    <div className="audio-controls" ref={root} data-sound="off">
      <audio
        ref={audio}
        loop
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setError("Music is unavailable.")}
      >
        <source src="/audio/airport-lounge.mp3" type="audio/mpeg" />
      </audio>
      <button
        className="sound-toggle"
        aria-expanded={open}
        aria-controls="sound-panel"
        aria-label={`Sound settings. Music ${playing ? "on" : "off"}`}
        onClick={() => setOpen(!open)}
      >
        <span className="sound-bars" data-playing={playing} aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <i key={i} />
          ))}
        </span>
        <span className="sound-label">Sound {playing ? "on" : "off"}</span>
      </button>
      {open && (
        <div
          className="sound-panel"
          id="sound-panel"
          role="region"
          aria-label="Sound settings"
        >
          <div className="sound-panel-header">
            <strong>Set the atmosphere</strong>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close sound settings"
            >
              ×
            </button>
          </div>
          <p>Instrumental jazz, kept in the background.</p>
          <button
            className="music-play"
            aria-pressed={playing}
            onClick={toggleMusic}
          >
            <span>{playing ? "Ⅱ" : "▶"}</span>
            {playing ? "Pause music" : "Play lounge music"}
          </button>
          <label className="volume-control">
            Music volume <output>{Math.round(volume * 100)}%</output>
            <input
              aria-label="Music volume"
              type="range"
              min="0"
              max=".5"
              step=".01"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
            />
          </label>
          <button
            className="sfx-toggle"
            role="switch"
            aria-checked={sfx}
            onClick={toggleSfx}
          >
            Interface sounds <span>{sfx ? "On" : "Off"}</span>
          </button>
          <p className="music-credit">
            “Airport Lounge” · Kevin MacLeod
            <br />
            <a href="/credits#sound">Music and sound credits ↗</a>
          </p>
          {error && <p role="status">{error}</p>}
        </div>
      )}
    </div>
  );
}
