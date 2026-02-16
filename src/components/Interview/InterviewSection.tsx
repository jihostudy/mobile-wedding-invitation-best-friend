"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { Mail, UserRound, X } from "lucide-react";
import Icon from "@/components/common/Icon";
import FadeInUp from "@/components/common/FadeInUp";
import useModalLayer from "@/hooks/useModalLayer";
import type { InterviewSectionData, Person } from "@/types";

interface InterviewSectionProps {
  section: InterviewSectionData;
  groom: Person;
  bride: Person;
}

export default function InterviewSection({
  section,
  groom,
  bride,
}: InterviewSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useModalLayer({
    active: isOpen,
    onEscape: () => setIsOpen(false),
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      <section id="interview" className="bg-white px-6 py-16">
        <div className="mx-auto w-full max-w-md text-center">
          <p className="font-crimson text-sm uppercase tracking-[0.33em] text-wedding-brown">
            {section.kicker}
          </p>
          <h2 className="mt-3 text-xl tracking-[0.04em] text-wedding-gray-dark">
            {section.title}
          </h2>
          <p className="mt-8 whitespace-pre-line text-[15px] leading-8 text-wedding-gray">
            {section.description}
          </p>

          <FadeInUp className="mt-8">
            <div className="relative aspect-[17/10] w-full overflow-hidden rounded-xl">
              <Image
                src={section.image.url}
                alt={section.image.alt}
                fill
                className="object-cover"
                sizes="(max-width: 425px) 100vw, 425px"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-[12px] border border-wedding-brown/25 bg-white/70 px-9 py-3 text-sm font-medium text-wedding-brown transition hover:bg-white"
              aria-label="신랑 신부 인터뷰 열기"
            >
              <Icon icon={Mail} size="md" />
              신랑 & 신부의 인터뷰 읽어보기
            </button>
          </FadeInUp>
        </div>
      </section>

      {isMounted && isOpen &&
        createPortal(
        <div
          className="fixed inset-0 z-[10000] overflow-hidden overscroll-none"
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-0 bg-[#f4eee4]/22 backdrop-blur-[2px]" />
          <div className="modal-scrollbar relative z-10 mx-auto h-[100dvh] w-full max-w-[425px] overflow-y-auto overscroll-contain bg-white px-6 pb-12 pt-6">
            <div className="flex items-center justify-between">
              <h3 className="flex-1 text-center text-lg font-semibold text-wedding-gray-dark">
                {section.title}
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="ml-4 rounded-full p-1 text-[#222] hover:bg-black/5"
                aria-label="인터뷰 닫기"
              >
                <Icon icon={X} size="lg" />
              </button>
            </div>

            <div className="mt-8 divide-y divide-[#dcdcdc]">
              {section.questions.map((questionItem) => (
                <section key={questionItem.question} className="py-7">
                  <h4 className="text-[16px] font-semibold text-[#333]">
                    {questionItem.question}
                  </h4>
                  <div className="mt-5 space-y-7">
                    {questionItem.answers.map((answer) => (
                      <div
                        key={`${questionItem.question}-${answer.side}`}
                      >
                        <p className="flex items-center gap-2 text-sm font-semibold text-[#333] ">
                          <Icon
                            icon={UserRound}
                            size="sm"
                            className="text-[#666]"
                          />
                          {answer.side === "groom" ? `신랑 ${groom.name}` : `신부 ${bride.name}`}
                        </p>
                        <p className="mt-3 whitespace-pre-line text-sm leading-[1.62] text-[#333]">
                          {answer.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
