"use client";

import { useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import {
  OverlayProvider as OverlayKitProvider,
  useOverlayData,
} from "overlay-kit";

interface OverlayProviderProps {
  children: ReactNode;
}

function OverlayScrollLock() {
  const overlays = useOverlayData();
  const hasOpenOverlay = useMemo(
    () => Object.values(overlays).some((overlay) => overlay.isOpen),
    [overlays],
  );

  useEffect(() => {
    if (!hasOpenOverlay) return;

    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, [hasOpenOverlay]);

  return null;
}

export default function OverlayProvider({ children }: OverlayProviderProps) {
  return (
    <OverlayKitProvider>
      <OverlayScrollLock />
      {children}
    </OverlayKitProvider>
  );
}
