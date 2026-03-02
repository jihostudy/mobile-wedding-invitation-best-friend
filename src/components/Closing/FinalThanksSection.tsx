"use client";

import Image from "next/image";
import useToast from "@/components/common/toast/useToast";
import {
  ensureKakaoInitialized,
  type KakaoSdk,
} from "@/lib/share/kakao";
import type { ClosingSectionData } from "@/types";

interface FinalThanksSectionProps {
  section: ClosingSectionData;
}

export default function FinalThanksSection({
  section,
}: FinalThanksSectionProps) {
  const toast = useToast();

  const copyCurrentUrl = async () => {
    if (typeof window === "undefined") return false;
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("링크를 복사했어요. 카카오톡에 붙여넣어 공유해 주세요.");
      return true;
    } catch (error) {
      console.error("Failed to copy invitation link:", error);
      toast.error("링크 복사에 실패했어요. 브라우저 권한을 확인해 주세요.");
      return false;
    }
  };

  const shareKakao = async () => {
    if (typeof window === "undefined") return;

    const kakao = (window as Window & { Kakao?: KakaoSdk }).Kakao;
    if (!kakao) {
      toast.error("카카오 SDK를 불러오지 못했어요.");
      const copied = await copyCurrentUrl();
      if (!copied) {
        toast.error("카카오톡 공유를 사용할 수 없습니다.");
      }
      return;
    }

    const initialized = ensureKakaoInitialized({
      kakao,
      appKey: process.env.NEXT_PUBLIC_KAKAO_JS_KEY,
    });

    if (!initialized.ok) {
      toast.error(initialized.reason);
      const copied = await copyCurrentUrl();
      if (!copied) {
        toast.error("카카오톡 공유를 사용할 수 없습니다.");
      }
      return;
    }

    try {
      kakao.Share.sendScrap({
        requestUrl: window.location.href,
      });
    } catch (error) {
      console.error("Failed to share via Kakao:", error);
      toast.error("카카오톡 공유에 실패했어요.");
      const copied = await copyCurrentUrl();
      if (!copied) {
        toast.error("링크 복사도 실패했어요. 잠시 후 다시 시도해 주세요.");
      }
    }
  };

  return (
    <section id="closing" className="bg-white px-9 pb-10">
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
          onClick={() => {
            void shareKakao();
          }}
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
