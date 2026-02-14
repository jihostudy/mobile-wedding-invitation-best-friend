'use client';

import { useEffect, useState } from 'react';
import { getGuestMessages } from '@/lib/supabase';
import type { GuestMessage } from '@/types';
import GuestbookModal from './GuestbookModal';

export default function Guestbook() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messages, setMessages] = useState<GuestMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    const data = await getGuestMessages();
    setMessages(data.filter((message) => message.isPublic));
    setLoading(false);
  };

  return (
    <section id="guestbook" className="bg-wedding-beige px-6 py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="text-center">
          <p className="font-serif text-xs uppercase tracking-[0.33em] text-wedding-brown-light/70">GUESTBOOK</p>
          <h2 className="mt-3 text-3xl font-serif text-wedding-brown">방명록</h2>
        </div>

        <div className="mt-7 rounded-2xl border border-wedding-brown/10 bg-white/50 p-6 text-wedding-brown">
          <p className="leading-7">
            결혼을 진심으로 축하해 주시는 모든 마음에 감사드립니다.
            두 사람에게 따뜻한 한 마디를 남겨주세요.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-5 w-full rounded-lg border border-wedding-brown/25 bg-white py-3 text-sm font-medium text-wedding-brown hover:bg-wedding-beige"
          >
            작성하기
          </button>
        </div>

        <div className="mt-8 space-y-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="spinner h-8 w-8" />
            </div>
          ) : (
            messages.map((message) => (
              <article key={message.id} className="rounded-xl border border-wedding-brown/10 bg-white/70 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-wedding-brown">{message.author}</p>
                  <p className="text-xs text-wedding-brown-light">
                    {new Date(message.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-wedding-brown">{message.message}</p>
              </article>
            ))
          )}
        </div>
      </div>

      <GuestbookModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={loadMessages} />
    </section>
  );
}
