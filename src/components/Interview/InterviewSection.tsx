"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { InterviewSectionData } from "@/types";

interface InterviewSectionProps {
  section: InterviewSectionData;
}

export default function InterviewSection({ section }: InterviewSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      <section id="interview" className="bg-white px-6 py-16">
        <div className="mx-auto w-full max-w-md text-center">
          <p className="font-serif text-xs uppercase tracking-[0.33em] text-wedding-brown-light/70">
            {section.kicker}
          </p>
          <h2 className="mt-3 text-xl font-serif text-wedding-brown">
            {section.title}
          </h2>
          <p className="mt-8 whitespace-pre-line text-[15px] leading-8 text-wedding-brown">
            {section.description}
          </p>

          <div className="relative mt-8 h-[210px] w-full overflow-hidden rounded-xl">
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
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-[14px] border border-wedding-brown/15 bg-[#f8f8f8] px-5 py-4 text-[16px] text-wedding-brown"
            aria-label="신랑 신부 인터뷰 열기"
          >
            <span aria-hidden="true">✉</span>
            {section.buttonLabel}
          </button>
        </div>
      </section>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/30"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="mx-auto min-h-screen w-full max-w-[425px] bg-[#f7f7f7] px-6 pb-12 pt-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="flex-1 text-center text-[24px] font-semibold text-[#222]">
                {section.title}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="ml-4 text-[24px] leading-none text-[#222]"
                aria-label="인터뷰 닫기"
              >
                ×
              </button>
            </div>

            <div className="mt-8 space-y-7">
              {section.questions.map((questionItem) => (
                <section key={questionItem.question} className="rounded-xl border border-[#e2e2e2] bg-white px-4 py-5">
                  <h4 className="text-[16px] font-medium text-[#333]">{questionItem.question}</h4>
                  <div className="mt-5 space-y-7">
                    {questionItem.answers.map((answer) => (
                      <div key={`${questionItem.question}-${answer.role}-${answer.name}`}>
                        <p className="text-[15px] text-[#333]">
                          <span className="mr-2" aria-hidden="true">
                            {answer.role === "신랑" ? "🤵🏻" : "👰🏻"}
                          </span>
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
