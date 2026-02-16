"use client";

import Image from "next/image";
import type { ClosingSectionData } from "@/types";

interface FinalThanksSectionProps {
  section: ClosingSectionData;
}

export default function FinalThanksSection({
  section,
}: FinalThanksSectionProps) {
  return (
    <section id="final-thanks" className="bg-white px-6 pb-10 pt-6">
      <div className="mx-auto w-full max-w-md">
        <div className="relative h-[560px] w-full overflow-hidden rounded-[4px] bg-[#f3f3f3]">
          <Image
            src={section.image.url}
            alt={section.image.alt}
            fill
            className="object-cover object-center"
            sizes="(max-width: 425px) 100vw, 425px"
            quality={100}
            unoptimized
            loading="eager"
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white to-transparent" />
          <div className="pointer-events-none absolute bottom-7 right-7">
            <p className="font-hyejun text-3xl text-[#1f1a17] [text-shadow:0_2px_10px_rgba(255,255,255,0.38)]">
              감사합니다.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="mx-auto mt-4 flex items-center gap-2 text-base font-medium text-[#2f2f2f]"
          onClick={() => alert("카카오톡 공유 연동은 추후 연결 예정입니다.")}
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-[3px] bg-[#FEE500] text-[11px] font-bold text-[#3b1d1d]">
            talk
          </span>
          카카오톡으로 초대장 보내기
        </button>
      </div>
    </section>
  );
}
