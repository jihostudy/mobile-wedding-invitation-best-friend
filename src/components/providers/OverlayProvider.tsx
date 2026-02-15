"use client";

import type { ReactNode } from "react";
import { OverlayProvider as OverlayKitProvider } from "overlay-kit";

interface OverlayProviderProps {
  children: ReactNode;
}

export default function OverlayProvider({ children }: OverlayProviderProps) {
  return <OverlayKitProvider>{children}</OverlayKitProvider>;
}
