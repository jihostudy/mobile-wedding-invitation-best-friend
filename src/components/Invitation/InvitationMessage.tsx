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

function formatParentLine(person: Person, fallbackLabel: string) {
  const names = [person.parents?.father, person.parents?.mother].filter(
    (name): name is string => Boolean(name && name.trim()),
  );
  if (names.length === 0) {
    return `${fallbackLabel}의`;
  }
  return `${names.join(" · ")}의`;
}

export default function InvitationMessage({
  section,
  groom,
  bride,
}: InvitationMessageProps) {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const groomParentLine = formatParentLine(groom, "신랑");
  const brideParentLine = formatParentLine(bride, "신부");

  return (
    <section id="invitation" className="relative z-10 bg-white px-9 py-16">
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
            <div className="grid grid-cols-[1fr_46px_auto] items-center gap-x-1 gap-y-3 text-base">
              <p className="text-right text-wedding-gray font-medium">
                {groomParentLine}
              </p>
              <span className="text-center text-sm text-wedding-gray-light">
                아들
              </span>
              <span className="text-left font-semibold text-wedding-brown">
                {groom.name}
              </span>

              <p className="text-right text-wedding-gray font-medium">
                {brideParentLine}
              </p>
              <span className="text-center text-sm text-wedding-gray-light">
                딸
              </span>
              <span className="text-left font-semibold text-wedding-brown">
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
              <Icon
                icon={Phone}
                size="sm"
                className="text-wedding-gray-light"
              />
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
