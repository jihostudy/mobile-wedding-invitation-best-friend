"use client";

import { useEffect, useRef, useState } from "react";
import type { BackgroundMusicConfig } from "@/types";

interface BackgroundMusicPlayerProps {
  config?: BackgroundMusicConfig;
}

export default function BackgroundMusicPlayer({
  config,
}: BackgroundMusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const source = config?.src ?? "";
  const hasSource = Boolean(config?.enabled && source);
  const volume = config?.volume ?? 0.4;
  const loop = config?.loop ?? true;
  const autoplay = config?.autoplay ?? false;
  const title = config?.title ?? "배경음악";

  useEffect(() => {
    if (!hasSource) {
      return;
    }

    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.volume = Math.max(0, Math.min(1, volume));
    audio.loop = loop;

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
      if (!autoplay) {
        return;
      }
      try {
        await audio.play();
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

    void tryAutoPlay();

    return () => {
      audio.pause();
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
    };
  }, [autoplay, hasSource, loop, volume]);

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
        await audio.play();
      } else {
        audio.pause();
      }
    } catch (error) {
      setIsPlaying(false);
      console.warn("Failed to toggle background music playback.", error);
    }
  };

  const renderPlayingBars = () => (
    <span className="flex items-center gap-[3px]" aria-hidden="true">
      <span className="music-eq-bar h-3 w-[4px] rounded-[1px] bg-white" />
      <span className="music-eq-bar music-eq-bar-delay-1 h-3 w-[4px] rounded-[1px] bg-white" />
      <span className="music-eq-bar music-eq-bar-delay-2 h-3 w-[4px] rounded-[1px] bg-white" />
    </span>
  );

  const renderIdleSquares = () => (
    <span className="flex items-center gap-[3px]" aria-hidden="true">
      <span className="h-[4px] w-[4px] rounded-[1px] bg-white/95" />
      <span className="h-[4px] w-[4px] rounded-[1px] bg-white/80" />
      <span className="h-[4px] w-[4px] rounded-[1px] bg-white/95" />
    </span>
  );

  return (
    <>
      <audio ref={audioRef} src={source} preload="auto" aria-hidden="true" />
      <div className="absolute right-4 top-4 z-30">
        <button
          type="button"
          onClick={() => void togglePlayback()}
          aria-label={isPlaying ? "배경음악 일시정지" : "배경음악 재생"}
          aria-pressed={isPlaying}
          title={title}
          className="flex h-8 min-w-[48px] items-center justify-center rounded-full bg-black/20 px-1 text-white shadow-sm transition hover:bg-black/40 disabled:opacity-50"
          disabled={Boolean(playbackError)}
        >
          {isPlaying ? renderPlayingBars() : renderIdleSquares()}
        </button>
      </div>
    </>
  );
}
