"use client";

import { useState } from "react";
import Image from "next/image";
import { MAIN_IMAGE_URL, WEDDING_DATA } from "@/constants/wedding-data";

/**
 * 끝맺음 섹션 - Thank You
 */
export default function ThankYouSection() {
  const { groom, bride } = WEDDING_DATA;
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      alert("링크 복사에 실패했습니다.");
    }
  };

  return (
    <section className="section bg-white">
      <div className="w-full">
        {/* Thank You 타이틀 */}
        <div className="text-center mb-8">
          <p className="text-sm tracking-[0.3em] text-wedding-brown-light/60 uppercase font-serif mb-4">
            --------- Thank you ---------
          </p>
        </div>

        {/* 커플 사진 (프레임 효과) */}
        <div className="mb-8">
          <div className="relative w-full max-w-[300px] mx-auto">
            {/* 프레임 효과 */}
            <div className="absolute inset-0 bg-white rounded-lg shadow-lg transform rotate-1" />
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-xl border-4 border-white">
              <Image
                src={MAIN_IMAGE_URL}
                alt={`${groom.name}과 ${bride.name}의 결혼식`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 300px"
              />
            </div>
          </div>
        </div>

        {/* 감사 메시지 */}
        <div className="text-center mb-8 space-y-3">
          <p className="text-base leading-relaxed text-wedding-brown">
            소중한 분들의 축복 속에서
            <br />두 사람이 하나 되어 새로운 출발을 합니다.
          </p>
          <p className="text-base leading-relaxed text-wedding-brown">
            따뜻한 마음으로 지켜봐 주세요.
          </p>
        </div>

        {/* 청첩장 링크 복사 버튼 */}
        <div className="text-center">
          <button
            onClick={copyLink}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-900 font-medium transition-colors shadow-sm"
          >
            {copied ? "✓ 복사되었습니다!" : "청첩장 링크 복사하기"}
          </button>
        </div>
      </div>
    </section>
  );
}
