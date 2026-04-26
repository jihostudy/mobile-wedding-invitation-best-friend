"use client";

import { useCallback } from "react";
import { Armchair } from "lucide-react";
import FadeInUp from "@/components/common/FadeInUp";
import Icon from "@/components/common/Icon";
import { openRsvpFormOverlay } from "@/overlays/rsvpOverlay";
import type { RsvpSectionData, WeddingInfo } from "@/types";

const SUBMITTED_KEY = "rsvp_submitted_at";

interface RsvpSectionProps {
  section: RsvpSectionData;
  weddingData: WeddingInfo; // kept for API compatibility
}

export default function RsvpSection({ section }: RsvpSectionProps) {
  const openRsvpForm = useCallback(() => {
    openRsvpFormOverlay({
      onComplete: () => {
        localStorage.setItem(SUBMITTED_KEY, new Date().toISOString());
      },
    });
  }, []);

  return (
    <section id="rsvp" className="mt-12 rounded-[18px]  px-9 py-14">
      <FadeInUp className="mx-auto w-full max-w-md text-center">
        <p className="font-crimson text-sm uppercase tracking-[0.33em] text-wedding-brown">
          {section.kicker}
        </p>
        <h3 className="mt-3 text-xl tracking-[0.04em] text-wedding-gray-dark">
          {section.title}
        </h3>
        <p className="mt-9 whitespace-pre-line text-sm leading-8 text-wedding-gray">
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
