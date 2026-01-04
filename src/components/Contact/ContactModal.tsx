'use client';

import { useState, useEffect } from 'react';
import { WEDDING_DATA } from '@/constants/wedding-data';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 연락처 모달 컴포넌트
 * 신랑측/신부측 연락처 정보 표시
 */
export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const { groom, bride } = WEDDING_DATA;
  const [copiedContact, setCopiedContact] = useState<string | null>(null);

  // 모달 열릴 때 body 스크롤 막기
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = async (text: string, contactType: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedContact(contactType);
      setTimeout(() => setCopiedContact(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('복사에 실패했습니다.');
    }
  };

  const ContactRow = ({
    label,
    name,
    phone,
    contactType,
    hasBackground = false,
  }: {
    label: string;
    name: string;
    phone?: string;
    contactType: string;
    hasBackground?: boolean;
  }) => {
    return (
      <div className="relative py-4 px-4 border-b border-wedding-brown/20 last:border-b-0">
        {/* 배경 이미지 효과 */}
        {hasBackground && (
          <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-wedding-beige/20 to-transparent blur-sm" />
          </div>
        )}

        <div className="relative z-10 grid grid-cols-[auto_1fr_auto] gap-4 items-center">
          {/* Label */}
          <span className="text-wedding-beige text-sm whitespace-nowrap">{label}</span>
          
          {/* Name */}
          <span className="text-wedding-beige font-medium text-center">{name}</span>
          
          {/* Buttons */}
          {phone ? (
            <div className="flex items-center gap-3">
              {/* 전화 버튼 */}
              <a
                href={`tel:${phone}`}
                className="p-2 rounded-full bg-wedding-beige/20 hover:bg-wedding-beige/30 transition-colors"
                aria-label={`${name}에게 전화하기`}
              >
                <svg
                  className="w-5 h-5 text-wedding-beige"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </a>

              {/* 복사 버튼 */}
              <button
                onClick={() => copyToClipboard(phone, contactType)}
                className="p-2 rounded-full bg-wedding-beige/20 hover:bg-wedding-beige/30 transition-colors"
                aria-label={`${name} 연락처 복사하기`}
              >
                {copiedContact === contactType ? (
                  <svg
                    className="w-5 h-5 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-wedding-beige"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {/* 연락처 없음 - 버튼 비활성화 */}
              <div className="p-2 rounded-full bg-wedding-beige/10 opacity-50">
                <svg
                  className="w-5 h-5 text-wedding-beige/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <div className="p-2 rounded-full bg-wedding-beige/10 opacity-50">
                <svg
                  className="w-5 h-5 text-wedding-beige/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* 모달 컨텐츠 */}
      <div
        className="relative w-full max-w-md bg-wedding-brown rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-wedding-beige/20 hover:bg-wedding-beige/30 transition-colors"
          aria-label="닫기"
        >
          <svg
            className="w-6 h-6 text-wedding-beige"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* 헤더 */}
        <div className="relative px-6 pt-8 pb-4">
          {/* 배경 텍스트 */}
          <div className="absolute top-4 left-6 right-6 opacity-10">
            <p className="text-wedding-beige text-xs">
              {groom.parents?.father}·{groom.parents?.mother} {groom.name}
            </p>
            <p className="text-wedding-beige text-xs mt-1">
              {bride.parents?.father}·{bride.parents?.mother} {bride.name}
            </p>
          </div>

          {/* Contact 타이틀 */}
          <div className="relative z-10 text-center">
            <p className="text-wedding-beige/60 text-sm mb-2 font-serif">
              --------- Contact ---------
            </p>
          </div>
        </div>

        {/* 연락처 리스트 */}
        <div className="max-h-[60vh] overflow-y-auto modal-scrollbar">
          {/* 신랑측 */}
          <div className="px-6 pb-4">
            <h3 className="text-wedding-beige font-semibold text-lg mb-2">신랑측</h3>
            <div className="bg-wedding-brown/50 rounded-lg overflow-hidden">
              <ContactRow
                label="신랑"
                name={groom.name}
                phone={groom.contact}
                contactType="groom"
              />
              <ContactRow
                label="신랑 아버지"
                name={groom.parents?.father || '김○○'}
                phone={groom.parents?.fatherContact}
                contactType="groom-father"
                hasBackground={true}
              />
              <ContactRow
                label="신랑 어머니"
                name={groom.parents?.mother || '○○○'}
                phone={groom.parents?.motherContact}
                contactType="groom-mother"
                hasBackground={true}
              />
            </div>
          </div>

          {/* 구분선 */}
          <div className="px-6 py-2">
            <div className="h-[1px] bg-wedding-brown-light/30" />
          </div>

          {/* 신부측 */}
          <div className="px-6 pb-6">
            <h3 className="text-wedding-beige font-semibold text-lg mb-2">신부측</h3>
            <div className="bg-wedding-brown/50 rounded-lg overflow-hidden">
              <ContactRow
                label="신부"
                name={bride.name}
                phone={bride.contact}
                contactType="bride"
              />
              <ContactRow
                label="신부 아버지"
                name={bride.parents?.father || '전○○'}
                phone={bride.parents?.fatherContact}
                contactType="bride-father"
                hasBackground={true}
              />
              <ContactRow
                label="신부 어머니"
                name={bride.parents?.mother || '○○○'}
                phone={bride.parents?.motherContact}
                contactType="bride-mother"
                hasBackground={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

