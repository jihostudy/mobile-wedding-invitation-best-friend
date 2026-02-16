"use client";

import { useState } from "react";
import { Phone } from "lucide-react";
import ContactModal from "@/components/Contact/ContactModal";
import FadeInUp from "@/components/common/FadeInUp";
import Icon from "@/components/common/Icon";
import type { InvitationSectionData, Person } from "@/types";

interface InvitationMessageProps {
  section: InvitationSectionData;
  groom: Person;
  bride: Person;
}

export default function InvitationMessage({
  section,
  groom,
  bride,
}: InvitationMessageProps) {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <section id="invitation" className="relative z-10 bg-white px-6 py-16">
      <div className="mx-auto w-full max-w-md space-y-10">
        <div className="text-center">
          <p className="font-crimson text-sm uppercase tracking-[0.33em] text-wedding-brown">
            {section.kicker}
          </p>
          <h2 className="mt-3 text-xl tracking-[0.04em] text-wedding-gray-dark">
            {section.title}
          </h2>
          <p className="mt-8 whitespace-pre-line text-[15px] leading-8 text-wedding-gray">
            {section.message}
          </p>
        </div>

        <div className="mx-auto h-px w-11 bg-wedding-brown/15" />

        <FadeInUp className="space-y-8">
          <div className="mx-auto w-fit text-wedding-brown-light">
            <div className="grid grid-cols-[max-content_max-content] items-baseline gap-x-3 gap-y-3 text-base">
              <p className="text-right text-wedding-gray font-medium">
                {groom.parents?.father || "-"} · {groom.parents?.mother || "-"}
                <span className="text-sm text-wedding-gray-light"> 의 아들</span>
              </p>
              <span className="text-right font-semibold text-wedding-brown">
                {groom.name}
              </span>

              <p className="text-right text-wedding-gray font-medium">
                {bride.parents?.father || "-"} · {bride.parents?.mother || "-"}
                <span className="text-sm text-wedding-gray-light"> 의 딸</span>
              </p>
              <span className="text-right font-semibold text-wedding-brown">
                {bride.name}
              </span>
            </div>
          </div>

          <div className="flex justify-center rounded-[12px]">
            <button
              type="button"
              onClick={() => setIsContactModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-[12px] border border-wedding-brown/25 bg-white/70 px-9 py-3 text-sm font-medium text-wedding-brown transition hover:bg-white"
              aria-label="연락처 모달 열기"
            >
              <Icon icon={Phone} size="sm" className="text-wedding-gray-light" />
              연락하기
            </button>
          </div>
        </FadeInUp>
      </div>

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        groom={groom}
        bride={bride}
      />
    </section>
  );
}
