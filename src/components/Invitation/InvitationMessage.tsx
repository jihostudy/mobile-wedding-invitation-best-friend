'use client';

import { useState } from 'react';
import { INVITATION_MESSAGE, WEDDING_DATA } from '@/constants/wedding-data';
import ContactModal from '@/components/Contact/ContactModal';

/**
 * 초대 메시지 섹션
 */
export default function InvitationMessage() {
  const { groom, bride } = WEDDING_DATA;
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <section className="section bg-wedding-beige">
      <div className="max-w-md w-full space-y-8">
        {/* 초대 메시지 */}
        <div className="text-center">
          <p className="text-sm tracking-[0.3em] text-wedding-brown-light/60 uppercase font-serif mb-4">
            INVITATION
          </p>
          <h2 className="text-2xl font-serif text-wedding-brown mb-6">
            초대합니다
          </h2>
          <p className="text-base leading-loose text-wedding-brown whitespace-pre-line">
            {INVITATION_MESSAGE}
          </p>
        </div>

        {/* 부모님 정보 이미지 */}
        <div className="pt-8">
          <div className="relative w-full aspect-[16/10] mb-8 rounded-2xl overflow-hidden bg-gradient-to-br from-wedding-brown/5 via-wedding-beige to-wedding-brown/10 flex items-center justify-center">
            {/* 장식 요소 */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <svg className="w-24 h-24 text-wedding-brown" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
          </div>

          {/* 신랑신부 부모님 정보 */}
          <div className="space-y-4 text-center">
            {/* 신랑 측 */}
            {groom.parents && (
              <p className="text-base text-wedding-brown-light">
                {groom.parents.father} · {groom.parents.mother}
                <span className="text-wedding-brown-light/60 mx-2">의 아들</span>
                <span className="text-wedding-brown font-medium">{groom.name}</span>
              </p>
            )}

            {/* 신부 측 */}
            {bride.parents && (
              <p className="text-base text-wedding-brown-light">
                {bride.parents.father} · {bride.parents.mother}
                <span className="text-wedding-brown-light/60 mx-2">의 딸</span>
                <span className="text-wedding-brown font-medium">{bride.name}</span>
              </p>
            )}
          </div>
        </div>

        {/* 연락하기 버튼 */}
        <div className="pt-8 flex justify-center">
          <button
            onClick={() => setIsContactModalOpen(true)}
            className="btn-primary"
            aria-label="연락하기"
          >
            연락하기
          </button>
        </div>
      </div>

      {/* 연락처 모달 */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </section>
  );
}

