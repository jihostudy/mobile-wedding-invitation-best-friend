"use client";

import { useEffect } from "react";

interface UseModalLayerOptions {
  active: boolean;
  onEscape?: () => void;
}

const LOCK_COUNT_KEY = "modalLayerLockCount";
const PREV_HTML_OVERFLOW_KEY = "modalLayerPrevHtmlOverflow";
const PREV_BODY_OVERFLOW_KEY = "modalLayerPrevBodyOverflow";
const PREV_BODY_PADDING_RIGHT_KEY = "modalLayerPrevBodyPaddingRight";

export default function useModalLayer({
  active,
  onEscape,
}: UseModalLayerOptions) {
  useEffect(() => {
    if (!active) return;

    const html = document.documentElement;
    const body = document.body;
    const currentCount = Number(body.dataset[LOCK_COUNT_KEY] ?? "0");

    if (currentCount === 0) {
      body.dataset[PREV_HTML_OVERFLOW_KEY] = html.style.overflow;
      body.dataset[PREV_BODY_OVERFLOW_KEY] = body.style.overflow;
      body.dataset[PREV_BODY_PADDING_RIGHT_KEY] = body.style.paddingRight;

      const scrollbarWidth = window.innerWidth - html.clientWidth;
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        body.style.paddingRight = `${scrollbarWidth}px`;
      }
    }
    body.dataset[LOCK_COUNT_KEY] = String(currentCount + 1);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onEscape?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);

      const lockCount = Number(body.dataset[LOCK_COUNT_KEY] ?? "0");
      const nextLockCount = Math.max(lockCount - 1, 0);

      if (nextLockCount === 0) {
        html.style.overflow = body.dataset[PREV_HTML_OVERFLOW_KEY] ?? "";
        body.style.overflow = body.dataset[PREV_BODY_OVERFLOW_KEY] ?? "";
        body.style.paddingRight =
          body.dataset[PREV_BODY_PADDING_RIGHT_KEY] ?? "";
        delete body.dataset[LOCK_COUNT_KEY];
        delete body.dataset[PREV_HTML_OVERFLOW_KEY];
        delete body.dataset[PREV_BODY_OVERFLOW_KEY];
        delete body.dataset[PREV_BODY_PADDING_RIGHT_KEY];
        return;
      }

      body.dataset[LOCK_COUNT_KEY] = String(nextLockCount);
    };
  }, [active, onEscape]);
}
