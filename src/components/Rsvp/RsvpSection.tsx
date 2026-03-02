"use client";

import { useCallback, useEffect, useMemo } from "react";
import { Armchair } from "lucide-react";
import FadeInUp from "@/components/common/FadeInUp";
import Icon from "@/components/common/Icon";
import {
  openRsvpEntryPromptOverlay,
  openRsvpFormOverlay,
} from "@/overlays/rsvpOverlay";
import type { RsvpSectionData, WeddingInfo } from "@/types";

interface RsvpSectionProps {
  section: RsvpSectionData;
  weddingData: WeddingInfo;
}

export default function RsvpSection({ section, weddingData }: RsvpSectionProps) {
  const HIDE_KEY = "rsvp_prompt_hide_until";
  const SUBMITTED_KEY = "rsvp_submitted_at";

  const todayLabel = useMemo(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);

  const entryPromptDateLine = useMemo(() => {
    const { year, month, day, dayOfWeek, time } = weddingData.date;
    const normalizedDay = dayOfWeek.replace("요일", "");
    const dayLabel = normalizedDay[0] ?? dayOfWeek;
    return `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")} (${dayLabel}) ${time}`;
  }, [weddingData.date]);

  const entryPromptVenueLine = useMemo(() => {
    const { name, floor } = weddingData.venue;
    return floor ? `${name}, ${floor}` : name;
  }, [weddingData.venue]);

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
        title: section.title,
        dateLine: entryPromptDateLine,
        venueLine: entryPromptVenueLine,
        addressLine: weddingData.venue.address,
      });
    }
  }, [
    entryPromptDateLine,
    entryPromptVenueLine,
    hidePromptToday,
    openRsvpForm,
    section.title,
    todayLabel,
    weddingData.venue.address,
  ]);

  return (
    <section id="rsvp" className="mt-12 rounded-[18px]  px-6 py-14">
      <FadeInUp className="mx-auto w-full max-w-md text-center">
        <p className="font-crimson text-sm uppercase tracking-[0.33em] text-wedding-brown">
          {section.kicker}
        </p>
        <h3 className="mt-3 text-xl tracking-[0.04em] text-wedding-gray-dark">
          {section.title}
        </h3>
        <p className="mt-9 whitespace-pre-line text-[15px] leading-8 text-wedding-gray">
          {section.description}
        </p>

        <button
          type="button"
          onClick={openRsvpForm}
          className="mt-9 inline-flex items-center justify-center gap-2 rounded-[12px] border border-wedding-brown/25 bg-white/70 px-9 py-3 text-sm font-medium text-wedding-brown transition hover:bg-white"
          aria-label="참석의사 전달 모달 열기"
        >
          <Icon icon={Armchair} size="sm" className="text-wedding-brown" />
          참석의사 전달하기
        </button>
      </FadeInUp>
    </section>
  );
}
