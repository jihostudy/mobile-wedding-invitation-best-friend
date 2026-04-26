"use client";

import { useEffect, useRef } from "react";
import type { FC } from "react";
import { overlay } from "overlay-kit";
import RsvpEntryPromptOverlay from "@/components/Rsvp/RsvpEntryPromptOverlay";
import RsvpModal from "@/components/Rsvp/RsvpModal";

const RSVP_OVERLAY_ID_PREFIX = {
  entryPrompt: "rsvp-entry-prompt",
  form: "rsvp-form",
} as const;
const ENTRY_PROMPT_EXIT_DURATION_MS = 300;

interface OverlayControllerProps {
  overlayId: string;
  isOpen: boolean;
  close: () => void;
  unmount: () => void;
}

interface OpenRsvpEntryPromptOverlayParams {
  onOpenRsvp: () => void;
  onHideToday: () => void;
  onClose?: () => void;
  title: string;
  dateLine: string;
  venueLine: string;
  addressLine: string;
}

interface OpenRsvpFormOverlayParams {
  onComplete?: () => void;
}

type RsvpOverlayType = keyof typeof RSVP_OVERLAY_ID_PREFIX;

const activeRsvpOverlayIds: Partial<Record<RsvpOverlayType, string>> = {};
let overlayIdSequence = 0;

function createRsvpOverlayId(type: RsvpOverlayType) {
  overlayIdSequence += 1;
  return `${RSVP_OVERLAY_ID_PREFIX[type]}-${Date.now()}-${overlayIdSequence}`;
}

function releaseRsvpOverlay(type: RsvpOverlayType, overlayId: string) {
  if (activeRsvpOverlayIds[type] === overlayId) {
    delete activeRsvpOverlayIds[type];
  }
}

function openSingleRsvpOverlay(
  type: RsvpOverlayType,
  controller: FC<OverlayControllerProps>,
) {
  const activeOverlayId = activeRsvpOverlayIds[type];
  if (activeOverlayId) {
    overlay.close(activeOverlayId);
    overlay.unmount(activeOverlayId);
    releaseRsvpOverlay(type, activeOverlayId);
  }

  const overlayId = createRsvpOverlayId(type);
  activeRsvpOverlayIds[type] = overlayId;

  try {
    return overlay.open(controller, { overlayId });
  } catch (error) {
    releaseRsvpOverlay(type, overlayId);
    throw error;
  }
}

interface RsvpEntryPromptOverlayViewProps extends OverlayControllerProps {
  onOpenRsvp: () => void;
  onHideToday: () => void;
  onClose?: () => void;
  title: string;
  dateLine: string;
  venueLine: string;
  addressLine: string;
}

function RsvpEntryPromptOverlayView({
  overlayId,
  isOpen,
  close,
  unmount,
  onOpenRsvp,
  onHideToday,
  onClose,
  title,
  dateLine,
  venueLine,
  addressLine,
}: RsvpEntryPromptOverlayViewProps) {
  const hasOpenedRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      hasOpenedRef.current = true;
      return;
    }

    if (hasOpenedRef.current) {
      const timer = window.setTimeout(() => {
        releaseRsvpOverlay("entryPrompt", overlayId);
        unmount();
      }, ENTRY_PROMPT_EXIT_DURATION_MS);
      return () => window.clearTimeout(timer);
    }
  }, [isOpen, overlayId, unmount]);

  return (
    <RsvpEntryPromptOverlay
      isOpen={isOpen}
      onClose={() => {
        onClose?.();
        close();
      }}
      onHideToday={() => {
        onHideToday();
        close();
      }}
      onOpenRsvp={() => {
        close();
        onOpenRsvp();
      }}
      title={title}
      dateLine={dateLine}
      venueLine={venueLine}
      addressLine={addressLine}
    />
  );
}

interface RsvpFormOverlayViewProps extends OverlayControllerProps {
  onComplete?: () => void;
}

function RsvpFormOverlayView({
  overlayId,
  isOpen,
  close,
  unmount,
  onComplete,
}: RsvpFormOverlayViewProps) {
  const hasOpenedRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      hasOpenedRef.current = true;
      return;
    }

    if (hasOpenedRef.current) {
      releaseRsvpOverlay("form", overlayId);
      unmount();
    }
  }, [isOpen, overlayId, unmount]);

  return <RsvpModal isOpen={isOpen} onClose={close} onComplete={onComplete} />;
}

export function openRsvpEntryPromptOverlay({
  onOpenRsvp,
  onHideToday,
  onClose,
  title,
  dateLine,
  venueLine,
  addressLine,
}: OpenRsvpEntryPromptOverlayParams) {
  const controller: FC<OverlayControllerProps> = (overlayProps) => (
    <RsvpEntryPromptOverlayView
      {...overlayProps}
      onOpenRsvp={onOpenRsvp}
      onHideToday={onHideToday}
      onClose={onClose}
      title={title}
      dateLine={dateLine}
      venueLine={venueLine}
      addressLine={addressLine}
    />
  );

  return openSingleRsvpOverlay("entryPrompt", controller);
}

export function openRsvpFormOverlay({ onComplete }: OpenRsvpFormOverlayParams) {
  const controller: FC<OverlayControllerProps> = (overlayProps) => (
    <RsvpFormOverlayView {...overlayProps} onComplete={onComplete} />
  );

  return openSingleRsvpOverlay("form", controller);
}
