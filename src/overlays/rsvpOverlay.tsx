"use client";

import { useEffect, useRef } from "react";
import type { FC } from "react";
import { overlay } from "overlay-kit";
import RsvpEntryPromptModal from "@/components/Rsvp/RsvpEntryPromptModal";
import RsvpModal from "@/components/Rsvp/RsvpModal";

const RSVP_ENTRY_PROMPT_OVERLAY_ID = "rsvp-entry-prompt";
const RSVP_FORM_OVERLAY_ID = "rsvp-form";
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
}

interface OpenRsvpFormOverlayParams {
  onComplete?: () => void;
}

interface RsvpEntryPromptOverlayViewProps extends OverlayControllerProps {
  onOpenRsvp: () => void;
  onHideToday: () => void;
  onClose?: () => void;
}

function RsvpEntryPromptOverlayView({
  isOpen,
  close,
  unmount,
  onOpenRsvp,
  onHideToday,
  onClose,
}: RsvpEntryPromptOverlayViewProps) {
  const hasOpenedRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      hasOpenedRef.current = true;
      return;
    }

    if (hasOpenedRef.current) {
      const timer = window.setTimeout(unmount, ENTRY_PROMPT_EXIT_DURATION_MS);
      return () => window.clearTimeout(timer);
    }
  }, [isOpen, unmount]);

  return (
    <RsvpEntryPromptModal
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
    />
  );
}

interface RsvpFormOverlayViewProps extends OverlayControllerProps {
  onComplete?: () => void;
}

function RsvpFormOverlayView({
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
      unmount();
    }
  }, [isOpen, unmount]);

  return <RsvpModal isOpen={isOpen} onClose={close} onComplete={onComplete} />;
}

export function openRsvpEntryPromptOverlay({
  onOpenRsvp,
  onHideToday,
  onClose,
}: OpenRsvpEntryPromptOverlayParams) {
  const controller: FC<OverlayControllerProps> = (overlayProps) => (
    <RsvpEntryPromptOverlayView
      {...overlayProps}
      onOpenRsvp={onOpenRsvp}
      onHideToday={onHideToday}
      onClose={onClose}
    />
  );

  return overlay.open(controller, { overlayId: RSVP_ENTRY_PROMPT_OVERLAY_ID });
}

export function openRsvpFormOverlay({ onComplete }: OpenRsvpFormOverlayParams) {
  const controller: FC<OverlayControllerProps> = (overlayProps) => (
    <RsvpFormOverlayView {...overlayProps} onComplete={onComplete} />
  );

  return overlay.open(controller, { overlayId: RSVP_FORM_OVERLAY_ID });
}
