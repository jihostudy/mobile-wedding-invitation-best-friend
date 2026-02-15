"use client";

import { useState } from "react";
import Image from "next/image";
import { Mail, UserRound, X } from "lucide-react";
import Icon from "@/components/common/Icon";
import FadeInUp from "@/components/common/FadeInUp";
import useModalLayer from "@/hooks/useModalLayer";
import type { InterviewSectionData } from "@/types";

interface InterviewSectionProps {
  section: InterviewSectionData;
}

export default function InterviewSection({ section }: InterviewSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  useModalLayer({
    active: isOpen,
    onEscape: () => setIsOpen(false),
  });

  return (
    <>
      <section id="interview" className="bg-white px-6 py-16">
        <div className="mx-auto w-full max-w-md text-center">
          <p className="font-crimson text-sm uppercase tracking-[0.33em] text-wedding-brown">
            INTERVIEW
          </p>
          <h2 className="mt-3 text-xl tracking-[0.04em] text-wedding-gray-dark">
            우리 두 사람의 이야기
          </h2>
          <p className="mt-8 whitespace-pre-line text-[15px] leading-8 text-wedding-gray">
            {section.description}
          </p>

          <FadeInUp className="mt-8">
            <div className="relative h-[210px] w-full overflow-hidden rounded-xl">
              <Image
                src={section.image.url}
                alt={section.image.alt}
                fill
                className="object-cover"
                sizes="(max-width: 425px) 100vw, 425px"
              />
            </div>

            <button
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

      {isOpen && (
        <div
          className="fixed inset-0 z-50 overflow-hidden overscroll-none bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal-scrollbar mx-auto h-[100dvh] w-full max-w-[425px] overflow-y-auto overscroll-contain bg-[#f7f7f7] px-6 pb-12 pt-6"
              onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="flex-1 text-center text-lg font-semibold text-wedding-gray-dark">
                우리 두 사람의 이야기
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="ml-4 rounded-full p-1 text-[#222] hover:bg-black/5"
                aria-label="인터뷰 닫기"
              >
                <Icon icon={X} size="lg" />
              </button>
            </div>

            <div className="mt-8 space-y-7">
              {section.questions.map((questionItem) => (
                <section
                  key={questionItem.question}
                  className="rounded-xl border border-[#e2e2e2] bg-white px-4 py-5"
                >
                  <h4 className="text-[16px] font-semibold text-[#333]">
                    {questionItem.question}
                  </h4>
                  <div className="mt-5 space-y-7">
                    {questionItem.answers.map((answer) => (
                      <div
                        key={`${questionItem.question}-${answer.role}-${answer.name}`}
                      >
                        <p className="flex items-center gap-2 text-[15px] text-[#333]">
                          <Icon
                            icon={UserRound}
                            size="sm"
                            className="text-[#666]"
                          />
                          {answer.role} {answer.name}
                        </p>
                        <div className="mt-3 space-y-4 text-[15px] leading-[1.62] text-[#333]">
                          {answer.paragraphs.map((paragraph) => (
                            <p key={paragraph}>{paragraph}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
