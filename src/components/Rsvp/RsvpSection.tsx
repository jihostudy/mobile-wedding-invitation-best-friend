"use client";

import { useCallback, useEffect, useMemo } from "react";
import { Armchair } from "lucide-react";
import Icon from "@/components/common/Icon";
import {
  openRsvpEntryPromptOverlay,
  openRsvpFormOverlay,
} from "@/overlays/rsvpOverlay";
import type { RsvpSectionData } from "@/types";

interface RsvpSectionProps {
  section: RsvpSectionData;
}

export default function RsvpSection({ section }: RsvpSectionProps) {
  const HIDE_KEY = "rsvp_prompt_hide_until";
  const SUBMITTED_KEY = "rsvp_submitted_at";

  const todayLabel = useMemo(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);

  const hidePromptToday = useCallback(() => {
    localStorage.setItem(HIDE_KEY, todayLabel);
  }, [todayLabel]);

  const markSubmitted = useCallback(() => {
    localStorage.setItem(SUBMITTED_KEY, new Date().toISOString());
  }, []);

  const openRsvpForm = useCallback(() => {
    openRsvpFormOverlay({
      onComplete: markSubmitted,
    });
  }, [markSubmitted]);

  useEffect(() => {
    const hiddenUntil = localStorage.getItem(HIDE_KEY);
    const submittedAt = localStorage.getItem(SUBMITTED_KEY);
    const shouldHideToday = hiddenUntil === todayLabel;
    const hasSubmitted = Boolean(submittedAt);

    if (!shouldHideToday && !hasSubmitted) {
      openRsvpEntryPromptOverlay({
        onHideToday: hidePromptToday,
        onOpenRsvp: openRsvpForm,
      });
    }
  }, [hidePromptToday, openRsvpForm, todayLabel]);

  return (
    <section className="mt-12 rounded-[18px]  px-6 py-14">
      <div className="mx-auto w-full max-w-md text-center">
        <p className="font-crimson text-xs uppercase tracking-[0.35em] text-wedding-brown-light/75">
          {section.kicker}
        </p>
        <h3 className="mt-4 text-xl font-medium text-[#242424]">
          {section.title}
        </h3>
        <p className="mt-9 whitespace-pre-line text-[15px] leading-[2] text-[#555555]">
          {section.description}
        </p>

        <button
          type="button"
          onClick={openRsvpForm}
          className="mt-9 inline-flex items-center justify-center gap-2 rounded-[12px] border border-wedding-brown/25 bg-white/70 px-[22px] py-[10px] text-sm font-medium text-wedding-brown transition hover:bg-white"
          aria-label="참석의사 전달 모달 열기"
        >
          <Icon icon={Armchair} size="sm" className="text-wedding-brown" />
          {section.buttonLabel}
        </button>
      </div>
    </section>
  );
}
