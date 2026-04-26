"use client";

import { useCallback } from "react";
import FadeInUp from "@/components/common/FadeInUp";
import { openRsvpFormOverlay } from "@/overlays/rsvpOverlay";
import type { RsvpSectionData, WeddingInfo } from "@/types";

const SUBMITTED_KEY = "rsvp_submitted_at";

interface RsvpSectionProps {
  section: RsvpSectionData;
  weddingData: WeddingInfo;
}

export default function RsvpSection({ section, weddingData }: RsvpSectionProps) {
  const openRsvpForm = useCallback(() => {
    openRsvpFormOverlay({
      onComplete: () => {
        localStorage.setItem(SUBMITTED_KEY, new Date().toISOString());
      },
    });
  }, []);

  const { groom, bride, date, venue } = weddingData;
  const dateLine = `${date.year}년 ${date.month}월 ${date.day}일`;
  const timeLine = `${date.dayOfWeek} ${date.time}`;

  return (
    <section id="rsvp" className="mt-12 px-4">
      <FadeInUp className="mx-auto w-full max-w-md text-center">
        <p className="font-crimson text-sm uppercase tracking-[0.33em] text-wedding-brown">
          {section.kicker}
        </p>
        <h3 className="mt-3 text-xl tracking-[0.04em] text-wedding-gray-dark">
          {section.title}
        </h3>
        <p className="mt-4 whitespace-pre-line text-sm leading-8 text-wedding-gray">
          {section.description}
        </p>
      </FadeInUp>

      <FadeInUp delay={0.15} className="mx-auto mt-8 w-full max-w-md">
        <div className="rounded-2xl border border-wedding-brown/15 bg-white/60 px-8 py-10 text-center">
          <p className="text-base tracking-wide text-wedding-gray-dark">
            신랑 {groom.name}{"  "}
            <span className="mx-2 text-wedding-brown">♥</span>{"  "}
            신부 {bride.name}
          </p>

          <hr className="my-5 border-wedding-brown/20" />

          <p className="text-sm leading-7 tracking-wide text-wedding-gray">
            {dateLine}
          </p>
          <p className="text-sm leading-7 tracking-wide text-wedding-gray">
            {timeLine}
          </p>

          <div className="mt-4" />

          <p className="text-sm leading-7 tracking-wide text-wedding-gray">
            {venue.name}{venue.floor ? ` ${venue.floor}` : ""}
          </p>

          <button
            type="button"
            onClick={openRsvpForm}
            className="mt-8 w-full rounded-xl bg-wedding-brown py-4 text-sm font-medium text-white transition hover:bg-wedding-brown-light"
            aria-label="참석의사 전달 모달 열기"
          >
            참석 의사 체크하기
          </button>
        </div>
      </FadeInUp>
    </section>
  );
}
