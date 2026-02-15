"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getGuestMessages } from "@/lib/supabase";
import type { GuestMessage } from "@/types";
import { SAMPLE_GUESTBOOK_MESSAGES } from "@/constants/wedding-data";
import Carousel from "@/components/common/Carousel";
import GuestbookModal from "./GuestbookModal";

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
    const publicMessages = data.filter((message) => message.isPublic);
    setMessages(
      publicMessages.length > 0 ? publicMessages : SAMPLE_GUESTBOOK_MESSAGES,
    );
    setLoading(false);
  };

  const chunkSize = 4;
  const messageSlides: GuestMessage[][] = [];
  for (let index = 0; index < messages.length; index += chunkSize) {
    messageSlides.push(messages.slice(index, index + chunkSize));
  }
  const hasMessages = messages.length > 0;

  return (
    <section id="guestbook" className="bg-white px-6 py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.33em] text-wedding-brown-light/70">
            GUESTBOOK
          </p>
          <h2 className="mt-3 text-xl text-wedding-brown">방명록</h2>
        </div>

        {!hasMessages && (
          <div className="mt-7 rounded-2xl border border-wedding-brown/10 bg-white/50 p-6 text-wedding-brown">
            <p className="leading-7">
              결혼을 진심으로 축하해 주시는 모든 마음에 감사드립니다. 두
              사람에게 따뜻한 한 마디를 남겨주세요.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-5 w-full rounded-lg border border-wedding-brown/25 bg-white py-3 text-sm font-medium text-wedding-brown hover:bg-wedding-beige"
            >
              작성하기
            </button>
          </div>
        )}

        <div className="mt-8">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="spinner h-8 w-8" />
            </div>
          ) : hasMessages ? (
            <Carousel
              items={messageSlides}
              getItemKey={(slide, slideIndex) =>
                slide[0]?.id ?? `guestbook-slide-${slideIndex}`
              }
              showArrows={messageSlides.length > 1}
              showDots={messageSlides.length > 1}
              loop={false}
              className="mx-auto max-w-md"
              viewportClassName="rounded-xl"
              slideClassName="px-1"
              prevAriaLabel="이전 방명록 보기"
              nextAriaLabel="다음 방명록 보기"
              renderItem={(slide) => (
                <div className="space-y-3">
                  {slide.map((message) => (
                    <article
                      key={message.id}
                      className="rounded-xl border border-gray-200 bg-[#f7f7f7] p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-[#2f2f2f]">
                          {message.author}
                        </p>
                      </div>
                      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-[#3e3e3e]">
                        {message.message}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            />
          ) : (
            <div className="rounded-xl border border-wedding-brown/15 bg-[#f7f7f7] p-4 text-center text-sm text-wedding-brown-light">
              아직 공개된 방명록이 없습니다.
            </div>
          )}
        </div>
        
        {hasMessages && (
          <div className="mt-5 flex justify-end">
            <button
              onClick={() => setIsModalOpen(true)}
              className="rounded-xl border border-wedding-brown/25 bg-white px-5 py-2.5 text-sm font-medium text-wedding-brown hover:bg-wedding-beige"
            >
              작성하기
            </button>
          </div>
        )}

        <div className="relative mt-12 h-[620px] w-full overflow-hidden rounded-[14px] bg-[#f4f4f4]">
          <Image
            src="/images/placeholder-couple.svg"
            alt="두 사람의 사진"
            fill
            className="object-cover object-center"
            sizes="(max-width: 425px) 100vw, 425px"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white to-transparent" />
        </div>
      </div>

      <GuestbookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadMessages}
      />
    </section>
  );
}
