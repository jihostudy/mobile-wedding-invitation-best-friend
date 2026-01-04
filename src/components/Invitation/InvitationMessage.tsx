'use client';

import { INVITATION_MESSAGE, WEDDING_DATA } from '@/constants/wedding-data';

/**
 * 초대 메시지 섹션
 */
export default function InvitationMessage() {
  const { groom, bride } = WEDDING_DATA;

  return (
    <section className="section bg-white">
      <div className="max-w-md w-full space-y-8">
        {/* 장식 라인 */}
        <div className="flex items-center justify-center gap-4">
          <div className="w-12 h-[1px] bg-wedding-brown-light" />
          <span className="text-2xl">🌸</span>
          <div className="w-12 h-[1px] bg-wedding-brown-light" />
        </div>

        {/* 초대 메시지 */}
        <div className="text-center">
          <h2 className="text-2xl font-serif text-wedding-brown mb-6">
            초대합니다
          </h2>
          <p className="text-base leading-loose text-wedding-brown whitespace-pre-line">
            {INVITATION_MESSAGE}
          </p>
        </div>

        {/* 신랑신부 부모님 정보 */}
        <div className="pt-8 space-y-6">
          {/* 신랑 측 */}
          {groom.parents && (
            <div className="text-center">
              <p className="text-sm text-wedding-brown-light mb-2">
                {groom.parents.father} · {groom.parents.mother}
                <span className="mx-2">의 아들</span>
              </p>
              <p className="text-lg font-medium text-wedding-brown">
                {groom.name}
              </p>
            </div>
          )}

          <div className="flex items-center justify-center">
            <div className="w-8 h-[1px] bg-wedding-brown-light" />
          </div>

          {/* 신부 측 */}
          {bride.parents && (
            <div className="text-center">
              <p className="text-sm text-wedding-brown-light mb-2">
                {bride.parents.father} · {bride.parents.mother}
                <span className="mx-2">의 딸</span>
              </p>
              <p className="text-lg font-medium text-wedding-brown">
                {bride.name}
              </p>
            </div>
          )}
        </div>

        {/* 연락하기 버튼 */}
        <div className="pt-8 flex gap-4 justify-center">
          {groom.contact && (
            <a
              href={`tel:${groom.contact}`}
              className="btn-outline text-sm"
              aria-label={`신랑 ${groom.name}에게 연락하기`}
            >
              신랑에게 연락하기
            </a>
          )}
          {bride.contact && (
            <a
              href={`tel:${bride.contact}`}
              className="btn-outline text-sm"
              aria-label={`신부 ${bride.name}에게 연락하기`}
            >
              신부에게 연락하기
            </a>
          )}
        </div>

        {/* 장식 라인 */}
        <div className="flex items-center justify-center gap-4 pt-8">
          <div className="w-12 h-[1px] bg-wedding-brown-light" />
          <span className="text-2xl">💐</span>
          <div className="w-12 h-[1px] bg-wedding-brown-light" />
        </div>
      </div>
    </section>
  );
}

