"use client";

import { useEffect } from "react";

interface ViewportZoomControllerProps {
  disabled: boolean;
}

function getViewportContent(disabled: boolean) {
  if (disabled) {
    return "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no";
  }

  return "width=device-width, initial-scale=1";
}

function getOrCreateViewportMeta() {
  const existing = document.querySelector<HTMLMetaElement>(
    'meta[name="viewport"]',
  );
  if (existing) return existing;

  const meta = document.createElement("meta");
  meta.name = "viewport";
  document.head.appendChild(meta);
  return meta;
}

export default function ViewportZoomController({
  disabled,
}: ViewportZoomControllerProps) {
  useEffect(() => {
    const viewportMeta = getOrCreateViewportMeta();
    const previousViewportContent = viewportMeta.content;
    const html = document.documentElement;
    const body = document.body;
    const previousHtmlTouchAction = html.style.touchAction;
    const previousBodyTouchAction = body.style.touchAction;

    viewportMeta.content = getViewportContent(disabled);

    if (!disabled) {
      return () => {
        viewportMeta.content = previousViewportContent;
        html.style.touchAction = previousHtmlTouchAction;
        body.style.touchAction = previousBodyTouchAction;
      };
    }

    let lastTouchEndAt = 0;
    const preventDefault = (event: Event) => {
      event.preventDefault();
    };
    const preventPinchZoom = (event: TouchEvent) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    };
    const preventDoubleTapZoom = (event: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEndAt <= 300) {
        event.preventDefault();
      }
      lastTouchEndAt = now;
    };

    html.style.touchAction = "pan-x pan-y";
    body.style.touchAction = "pan-x pan-y";
    document.addEventListener("touchmove", preventPinchZoom, {
      passive: false,
    });
    document.addEventListener("touchend", preventDoubleTapZoom, {
      passive: false,
    });
    document.addEventListener("gesturestart", preventDefault, {
      passive: false,
    });
    document.addEventListener("gesturechange", preventDefault, {
      passive: false,
    });
    document.addEventListener("gestureend", preventDefault, {
      passive: false,
    });

    return () => {
      viewportMeta.content = previousViewportContent;
      html.style.touchAction = previousHtmlTouchAction;
      body.style.touchAction = previousBodyTouchAction;
      document.removeEventListener("touchmove", preventPinchZoom);
      document.removeEventListener("touchend", preventDoubleTapZoom);
      document.removeEventListener("gesturestart", preventDefault);
      document.removeEventListener("gesturechange", preventDefault);
      document.removeEventListener("gestureend", preventDefault);
    };
  }, [disabled]);

  return null;
}
