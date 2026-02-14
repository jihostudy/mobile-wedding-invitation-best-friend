"use client";

import { useState } from "react";
import ContactModal from "@/components/Contact/ContactModal";
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
          <p className="font-serif text-xs uppercase tracking-[0.33em] text-wedding-brown-light/70">
            {section.kicker}
          </p>
          <h2 className="mt-4 text-3xl text-wedding-brown font-serif">
            {section.title}
          </h2>
          <p className="mt-8 whitespace-pre-line text-[15px] leading-8 text-wedding-brown">
            {section.message}
          </p>
        </div>

        <div className="mx-auto h-px w-11 bg-wedding-brown/15" />

        <div className="mx-auto max-w-[340px] space-y-3 text-wedding-brown-light">
          <div className="grid grid-cols-[1fr_auto_72px] items-center gap-2 text-lg">
            <p className="justify-self-end">
              <span className="font-medium">{groom.parents?.father || "-"}</span>{" "}
              ·{" "}
              <span className="font-medium">{groom.parents?.mother || "-"}</span>
            </p>
            <span className="text-sm text-wedding-brown-light/70">의 아들</span>
            <span className="w-[72px] text-right font-semibold text-wedding-brown">
              {groom.name}
            </span>
          </div>
          <div className="grid grid-cols-[1fr_auto_72px] items-center gap-2 text-lg">
            <p className="justify-self-end">
              <span className="font-medium">{bride.parents?.father || "-"}</span>{" "}
              ·{" "}
              <span className="font-medium">{bride.parents?.mother || "-"}</span>
            </p>
            <span className="text-sm text-wedding-brown-light/70">의 딸</span>
            <span className="w-[72px] text-right font-semibold text-wedding-brown">
              {bride.name}
            </span>
          </div>
        </div>

        <div className="flex justify-center rounded-[12px]">
          <button
            onClick={() => setIsContactModalOpen(true)}
            className="rounded-[12px] border border-wedding-brown/25 bg-white/70 px-[22px] py-[10px] text-sm font-medium text-wedding-brown transition hover:bg-white"
            aria-label="연락처 모달 열기"
          >
            {section.contactCtaLabel}
          </button>
        </div>
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
