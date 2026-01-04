'use client';

import { useState, useEffect } from 'react';
import { getGuestMessages } from '@/lib/supabase';
import type { GuestMessage } from '@/types';
import GuestbookModal from './GuestbookModal';

/**
 * 방명록 컴포넌트
 */
export default function Guestbook() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messages, setMessages] = useState<GuestMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // 메시지 로드
  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    const data = await getGuestMessages();
    setMessages(data);
    setLoading(false);
  };

  const handleWriteClick = () => {
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    loadMessages();
  };

  return (
    <section className="section bg-white">
      <div className="max-w-md w-full">
        {/* 타이틀 */}
        <div className="text-center mb-8">
          <p className="text-sm tracking-[0.3em] text-wedding-brown-light/60 uppercase font-serif mb-4">
            --------- Wedding Guest book ---------
          </p>
          <h2 className="text-3xl font-bold text-wedding-brown">
            방명록
          </h2>
        </div>

        {/* 축하 메시지 박스 */}
        <div className="relative mb-8">
          {/* 텍스처 배경 효과 */}
          <div className="absolute inset-0 bg-gradient-to-br from-wedding-beige/50 via-wedding-cream/30 to-wedding-beige/50 rounded-lg opacity-60" />
          <div 
            className="relative p-8 rounded-lg border border-wedding-brown/10 shadow-sm"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='paper' x='0' y='0' width='20' height='20' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='1' cy='1' r='0.5' fill='%23d4af37' opacity='0.1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23paper)'/%3E%3C/svg%3E")`,
              backgroundSize: '100px 100px',
            }}
          >
            {/* 불규칙한 가장자리 효과 */}
            <div className="absolute inset-0 rounded-lg overflow-hidden">
              <div className="absolute -top-2 -left-2 w-8 h-8 bg-white rounded-full opacity-20" />
              <div className="absolute -top-1 -right-3 w-6 h-6 bg-white rounded-full opacity-20" />
              <div className="absolute -bottom-2 -left-1 w-7 h-7 bg-white rounded-full opacity-20" />
              <div className="absolute -bottom-1 -right-2 w-5 h-5 bg-white rounded-full opacity-20" />
            </div>

            {/* 축하 메시지 */}
            <div className="relative z-10 text-left space-y-2 text-wedding-brown">
              <p>결혼을 진심으로</p>
              <p>진심으로축하드려요 💕</p>
              <p>두 분의 앞날이 언제나</p>
              <p>사랑과 웃음으로</p>
              <p>가득하길 바랍니다.</p>
              
              {/* 하단 서명 */}
              <div className="text-center mt-6 pt-4 border-t border-wedding-brown/10">
                <p className="text-sm text-wedding-brown/70">- 웨딩북 -</p>
              </div>
            </div>
          </div>
        </div>

        {/* 작성하기 버튼 */}
        <div className="text-center">
          <button
            onClick={handleWriteClick}
            className="px-8 py-3 bg-white border border-wedding-brown/20 rounded-lg text-wedding-brown font-medium hover:bg-wedding-beige/50 transition-colors shadow-sm"
          >
            작성하기
          </button>
        </div>

        {/* 방명록 목록 (공개 메시지만 표시) */}
        {messages.length > 0 && (
          <div className="mt-12 space-y-4">
            <h3 className="text-xl font-semibold text-wedding-brown mb-4 text-center">
              축하 메시지
            </h3>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="spinner w-8 h-8" />
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className="bg-white rounded-lg p-4 border border-wedding-brown/10 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-wedding-brown">
                      {message.author}
                    </p>
                    <p className="text-xs text-wedding-brown-light">
                      {new Date(message.createdAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <p className="text-wedding-brown whitespace-pre-wrap break-words">
                    {message.message}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 방명록 작성 모달 */}
      <GuestbookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </section>
  );
}

