'use client';

import { useState } from 'react';
import ContactModal from '@/components/Contact/ContactModal';
import type { InvitationSectionData, Person } from '@/types';

interface InvitationMessageProps {
  section: InvitationSectionData;
  groom: Person;
  bride: Person;
}

export default function InvitationMessage({ section, groom, bride }: InvitationMessageProps) {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <section id="invitation" className="bg-wedding-beige px-6 py-16">
      <div className="mx-auto w-full max-w-md space-y-10">
        <div className="text-center">
          <p className="font-serif text-xs uppercase tracking-[0.33em] text-wedding-brown-light/70">{section.kicker}</p>
          <h2 className="mt-4 text-3xl text-wedding-brown font-serif">{section.title}</h2>
          <p className="mt-8 whitespace-pre-line text-[15px] leading-8 text-wedding-brown">{section.message}</p>
        </div>

        <div className="rounded-2xl border border-wedding-brown/15 bg-white/40 p-6 text-center">
          <div className="space-y-3 text-wedding-brown-light">
            <p className="text-lg">
              <span className="font-medium">{groom.parents?.father || '-'}</span> · <span className="font-medium">{groom.parents?.mother || '-'}</span>
              <span className="mx-2 text-sm text-wedding-brown-light/70">의 아들</span>
              <span className="font-semibold text-wedding-brown">{groom.name}</span>
            </p>
            <p className="text-lg">
              <span className="font-medium">{bride.parents?.father || '-'}</span> · <span className="font-medium">{bride.parents?.mother || '-'}</span>
              <span className="mx-2 text-sm text-wedding-brown-light/70">의 딸</span>
              <span className="font-semibold text-wedding-brown">{bride.name}</span>
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => setIsContactModalOpen(true)}
            className="rounded-full border border-wedding-brown/25 bg-white/70 px-8 py-3 text-sm font-medium text-wedding-brown transition hover:bg-white"
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
