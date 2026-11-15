"use client";
import { useEffect, useRef, useState } from "react";
import { enableInterfaceSound, playInterfaceSound } from "@/lib/sound";
export function AudioControls() {
  const [open, setOpen] = useState(false),
    [playing, setPlaying] = useState(false),
    [awaitingGesture, setAwaitingGesture] = useState(false),
    [sfx, setSfx] = useState(false),
    [volume, setVolume] = useState(0.18),
    [error, setError] = useState("");
  const root = useRef<HTMLDivElement>(null),
    audio = useRef<HTMLAudioElement>(null),
    wasPlaying = useRef(false),
    wanted = useRef(true);
  useEffect(() => {
    const element = audio.current!;
    let disposed = false;
    try {
      wanted.current = localStorage.getItem("synapse-music") !== "off";
    } catch {}
    element.volume = 0.18;
    const remove = () => {
      document.removeEventListener("pointerdown", gesture);
      document.removeEventListener("keydown", gesture);
    };
    const attempt = () => {
      if (!wanted.current || document.hidden) return;
      void element
        .play()
        .then(() => {
          if (!disposed) {
            setAwaitingGesture(false);
            remove();
          }
        })
        .catch((err: unknown) => {
          if (disposed) return;
          if (err instanceof DOMException && err.name === "NotAllowedError")
            setAwaitingGesture(true);
          else {
            setError("Music could not start. Select play to retry.");
            remove();
          }
        });
    };
    const gesture = (event: Event) => {
      if ((event.target as Element)?.closest?.(".audio-controls")) return;
      if (event instanceof KeyboardEvent && !["Enter", " "].includes(event.key))
        return;
      attempt();
    };
    if (wanted.current) {
      document.addEventListener("pointerdown", gesture);
      document.addEventListener("keydown", gesture);
      attempt();
    }
    return () => {
      disposed = true;
      remove();
    };
  }, []);
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
      } else if (wasPlaying.current && wanted.current) {
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
    if (!element.paused || awaitingGesture) {
      wanted.current = false;
      setAwaitingGesture(false);
      try {
        localStorage.setItem("synapse-music", "off");
      } catch {}
      element.pause();
      return;
    }
    wanted.current = true;
    try {
      localStorage.setItem("synapse-music", "on");
    } catch {}
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
        onPlay={() => {
          setPlaying(true);
          setAwaitingGesture(false);
        }}
        onPause={() => setPlaying(false)}
        onError={() => setError("Music is unavailable.")}
      >
        <source src="/audio/airport-lounge.mp3" type="audio/mpeg" />
      </audio>
      <button
        className="sound-toggle"
        aria-expanded={open}
        aria-controls="sound-panel"
        aria-label={`Sound settings. Music ${playing ? "on" : awaitingGesture ? "ready" : "off"}`}
        onClick={() => setOpen(!open)}
      >
        <span className="sound-bars" data-playing={playing} aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <i key={i} />
          ))}
        </span>
        <span className="sound-label">
          Sound {playing ? "on" : awaitingGesture ? "ready" : "off"}
        </span>
      </button>
      {open && (
        <div
          className="sound-panel"
          id="sound-panel"
          role="region"
          aria-label="Sound settings"
        >
          <div className="sound-panel-header">
            <strong>Audio settings</strong>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close sound settings"
            >
              ×
            </button>
          </div>
          <p>
            {awaitingGesture
              ? "Your browser requires an interaction before music can start."
              : "Instrumental jazz · automatic playback at low volume."}
          </p>
          <button
            className="music-play"
            aria-label={
              playing
                ? "Pause music"
                : awaitingGesture
                  ? "Disable automatic music"
                  : "Play lounge music"
            }
            aria-pressed={playing || awaitingGesture}
            onClick={toggleMusic}
          >
            <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
              {playing ? (
                <path
                  d="M6 4v12M14 4v12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
              ) : (
                <path d="M5 3l12 7-12 7Z" fill="currentColor" />
              )}
            </svg>
            {playing
              ? "Pause music"
              : awaitingGesture
                ? "Disable automatic music"
                : "Play lounge music"}
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
