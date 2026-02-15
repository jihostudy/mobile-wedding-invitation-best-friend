"use client";

import { useEffect } from "react";

interface UseKeyPressCallbackOptions {
  key: string;
  enabled?: boolean;
  callback: () => void;
}

export default function useKeyPressCallback({
  key,
  enabled = true,
  callback,
}: UseKeyPressCallbackOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === key) {
        callback();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [callback, enabled, key]);
}
