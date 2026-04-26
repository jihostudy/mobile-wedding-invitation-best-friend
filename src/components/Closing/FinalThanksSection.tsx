"use client";

import Image from "next/image";
import { BLUR_PLACEHOLDER } from "@/lib/image-placeholder";
import useToast from "@/components/common/toast/useToast";
import {
  KAKAO_SDK_SRC,
  ensureKakaoInitialized,
  buildKakaoSharePayload,
  type KakaoSdk,
} from "@/lib/share/kakao";
import type { ClosingSectionData, WeddingContentV1 } from "@/types";

interface FinalThanksSectionProps {
  section: ClosingSectionData;
  content: WeddingContentV1;
}

let kakaoSdkLoadPromise: Promise<KakaoSdk> | null = null;

function getKakaoSdk() {
  return (window as Window & { Kakao?: KakaoSdk }).Kakao;
}

function loadKakaoSdk() {
  const currentKakao = getKakaoSdk();
  if (currentKakao) return Promise.resolve(currentKakao);
  if (kakaoSdkLoadPromise) return kakaoSdkLoadPromise;

  kakaoSdkLoadPromise = new Promise<KakaoSdk>((resolve, reject) => {
    const existingScript = document.getElementById("kakao-sdk");
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement("script");
    script.id = "kakao-sdk";
    script.src = KAKAO_SDK_SRC;
    script.async = true;
    script.onload = () => {
      const loadedKakao = getKakaoSdk();
      if (loadedKakao) resolve(loadedKakao);
      else reject(new Error("Kakao SDK loaded without window.Kakao"));
    };
    script.onerror = () => reject(new Error("Kakao SDK script failed to load"));
    document.head.appendChild(script);
  });

  return kakaoSdkLoadPromise;
}

export default function FinalThanksSection({
  section,
  content,
}: FinalThanksSectionProps) {
  const toast = useToast();

  const shareKakao = async () => {
    if (typeof window === "undefined") return;

    const kakao = await loadKakaoSdk().catch((error: unknown) => {
      console.error("Failed to load Kakao SDK:", error);
      return null;
    });

    if (!kakao) {
      toast.error("카카오 SDK를 불러오지 못했어요.");
      return;
    }

    const initialized = ensureKakaoInitialized({
      kakao,
      appKey: process.env.NEXT_PUBLIC_KAKAO_JS_KEY,
    });

    if (!initialized.ok) {
      toast.error(initialized.reason);
      return;
    }

    try {
      const payload = buildKakaoSharePayload({
        content,
        origin: window.location.origin,
        url: window.location.href,
      });
      kakao.Share.sendDefault(payload);
    } catch (error) {
      console.error("Failed to share via Kakao:", error);
      toast.error("카카오톡 공유에 실패했어요.");
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
            quality={85}
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
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
          className="mx-auto mt-4 flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-base font-medium text-[#2f2f2f]"
          onClick={shareKakao}
        >
          <Image
            src="/icons/social/kakaotalk.png"
            alt=""
            width={20}
            height={20}
            className="h-5 w-5"
          />
          카카오톡으로 초대장 보내기
        </button>
      </div>
    </section>
  );
}
