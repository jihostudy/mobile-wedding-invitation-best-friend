"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { BackgroundMusicConfig } from "@/types";

interface BackgroundMusicPlayerProps {
  config?: BackgroundMusicConfig;
}

const MUSIC_CONSENT_STORAGE_KEY = "bgm-consent-v1";

function getStoredMusicConsent() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(MUSIC_CONSENT_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function setStoredMusicConsent() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MUSIC_CONSENT_STORAGE_KEY, "true");
  } catch {
    // ignore storage write failures
  }
}

export default function BackgroundMusicPlayer({
  config,
}: BackgroundMusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const source = config?.src ?? "";
  const hasSource = Boolean(config?.enabled && source);
  const autoplay = config?.autoplay ?? true;
  const volume = config?.volume ?? 0.4;
  const loop = config?.loop ?? true;
  const title = config?.title ?? "배경음악";

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!hasSource) {
      return;
    }

    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const normalizedVolume = Math.max(0, Math.min(1, volume));
    const hasConsent = getStoredMusicConsent();

    audio.volume = normalizedVolume;
    audio.loop = loop;
    audio.muted = !hasConsent;

    const handlePlaying = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      setPlaybackError("audio-load-failed");
      setIsPlaying(false);
      console.warn("Background music failed to load.");
    };

    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);

    const tryAutoPlay = async () => {
      // Attempt muted autoplay first for stricter mobile browsers.
      // If user previously consented, play with sound.
      audio.muted = !hasConsent;
      try {
        await audio.play();
        if (hasConsent) {
          audio.muted = false;
          setStoredMusicConsent();
        }
      } catch (error) {
        // Autoplay may be blocked by browser policy; keep manual control available.
        setIsPlaying(false);
        const isBlockedByPolicy =
          error instanceof DOMException && error.name === "NotAllowedError";
        if (!isBlockedByPolicy) {
          console.warn("Background music autoplay failed.", error);
        }
      }
    };

    const playOnFirstInteraction = async () => {
      if (playbackError) return;
      try {
        audio.muted = false;
        audio.volume = normalizedVolume;
        await audio.play();
        setStoredMusicConsent();
      } catch (error) {
        const isBlockedByPolicy =
          error instanceof DOMException && error.name === "NotAllowedError";
        if (!isBlockedByPolicy) {
          console.warn(
            "Background music playback failed after user interaction.",
            error
          );
        }
      }
    };

    const setupFirstInteractionAutoPlay = () => {
      if (typeof window === "undefined") return () => {};
      const hasConsent = getStoredMusicConsent();
      if (hasConsent) return () => {};

      let handled = false;
      const onFirstInteraction = () => {
        if (handled) return;
        handled = true;
        void playOnFirstInteraction();
        window.removeEventListener("pointerdown", onFirstInteraction);
        window.removeEventListener("keydown", onFirstInteraction);
        window.removeEventListener("touchstart", onFirstInteraction);
      };

      window.addEventListener("pointerdown", onFirstInteraction);
      window.addEventListener("keydown", onFirstInteraction);
      window.addEventListener("touchstart", onFirstInteraction);

      return () => {
        window.removeEventListener("pointerdown", onFirstInteraction);
        window.removeEventListener("keydown", onFirstInteraction);
        window.removeEventListener("touchstart", onFirstInteraction);
      };
    };

    if (autoplay) {
      void tryAutoPlay();
    }
    const cleanupFirstInteraction = autoplay
      ? setupFirstInteractionAutoPlay()
      : () => {};

    return () => {
      audio.pause();
      cleanupFirstInteraction();
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
    };
  }, [autoplay, hasSource, loop, playbackError, volume]);

  if (!hasSource) {
    return null;
  }

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    if (playbackError) {
      console.warn("Background music is unavailable due to media load error.");
      return;
    }

    try {
      if (audio.paused) {
        audio.muted = false;
        audio.volume = Math.max(0, Math.min(1, volume));
        await audio.play();
        setStoredMusicConsent();
      } else {
        audio.pause();
      }
    } catch (error) {
      setIsPlaying(false);
      console.warn("Failed to toggle background music playback.", error);
    }
  };

  const renderPlayingBars = () => (
    <span className="flex items-center gap-[2px]" aria-hidden="true">
      <span className="music-eq-bar h-[9px] w-[2px] rounded-[1px] bg-[#6d5438]" />
      <span className="music-eq-bar music-eq-bar-delay-1 h-[9px] w-[2px] rounded-[1px] bg-[#6d5438]" />
      <span className="music-eq-bar music-eq-bar-delay-2 h-[9px] w-[2px] rounded-[1px] bg-[#6d5438]" />
      <span className="music-eq-bar h-[9px] w-[2px] rounded-[1px] bg-[#6d5438]" />
    </span>
  );

  const renderIdleSquares = () => (
    <span className="flex items-center gap-[2px]" aria-hidden="true">
      <span className="h-[3px] w-[3px] rounded-[1px] bg-[#6d5438]" />
      <span className="h-[3px] w-[3px] rounded-[1px] bg-[#6d5438]" />
      <span className="h-[3px] w-[3px] rounded-[1px] bg-[#6d5438]" />
      <span className="h-[3px] w-[3px] rounded-[1px] bg-[#6d5438]" />
    </span>
  );

  return (
    <>
      <audio
        ref={audioRef}
        src={source}
        preload="auto"
        autoPlay={autoplay}
        aria-hidden="true"
      />
      {mounted
        ? createPortal(
            <div className="fixed right-[max(12px,calc(50vw-212.5px+12px))] top-[max(12px,env(safe-area-inset-top))] z-[100]">
              <button
                type="button"
                onClick={() => void togglePlayback()}
                aria-label={isPlaying ? "배경음악 일시정지" : "배경음악 재생"}
                aria-pressed={isPlaying}
                title={title}
                className="flex h-6 min-w-[34px] items-center justify-center rounded-full border border-[#cdb291] bg-[#e7d5bf]/95 px-1 text-[#6d5438] shadow-[0_6px_14px_rgba(104,79,53,0.2)] transition hover:bg-[#ddc6aa] disabled:opacity-50"
                disabled={Boolean(playbackError)}
              >
                {isPlaying ? renderPlayingBars() : renderIdleSquares()}
              </button>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
