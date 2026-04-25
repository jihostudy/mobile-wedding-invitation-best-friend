"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";
import type { WeddingDate } from "@/types";

interface EnvelopeLetterFrameProps {
  groomName: string;
  brideName: string;
  date: WeddingDate;
}

const INITIAL_BOTTOM_OFFSET = -70;
const MAX_HIDDEN_OFFSET = -420;
const TOP_FLAP_HEIGHT = 360;
const DAY_LABELS: Record<string, string> = {
  일요일: "SUN",
  월요일: "MON",
  화요일: "TUE",
  수요일: "WED",
  목요일: "THU",
  금요일: "FRI",
  토요일: "SAT",
};

export default function EnvelopeLetterFrame({
  groomName,
  brideName,
  date,
}: EnvelopeLetterFrameProps) {
  const [bottomOffset, setBottomOffset] = useState(INITIAL_BOTTOM_OFFSET);
  const dayLabel = DAY_LABELS[date.dayOfWeek] ?? date.dayOfWeek.toUpperCase();

  useEffect(() => {
    let frameId = 0;

    const updateOffset = () => {
      frameId = 0;
      const nextOffset = Math.max(
        MAX_HIDDEN_OFFSET,
        INITIAL_BOTTOM_OFFSET - window.scrollY,
      );
      setBottomOffset(nextOffset);
    };

    const onScroll = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(updateOffset);
    };

    updateOffset();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-1/2 top-0 z-0 w-full max-w-[425px] -translate-x-1/2 overflow-hidden"
        style={{ height: TOP_FLAP_HEIGHT } as CSSProperties}
      >
        <div
          className="absolute inset-x-0 top-0 h-full"
          style={
            {
              backgroundColor: "#EEDAC6",
              backgroundImage:
                "radial-gradient(circle at 18% 24%, rgba(255,255,255,0.28) 0 1px, transparent 1.4px), radial-gradient(circle at 76% 18%, rgba(137,105,74,0.08) 0 0.8px, transparent 1.3px), linear-gradient(105deg, rgba(255,255,255,0.18), transparent 28%, rgba(120,90,62,0.05) 52%, transparent 78%)",
              backgroundSize: "18px 18px, 22px 22px, 100% 100%",
            } as CSSProperties
          }
        />
        <div
          className="absolute inset-x-0 bottom-0 h-[90px] bg-white"
          style={
            {
              backgroundImage:
                "radial-gradient(circle at 20% 30%, rgba(120,100,82,0.055) 0 0.7px, transparent 1.1px), radial-gradient(circle at 76% 62%, rgba(255,255,255,0.75) 0 0.8px, transparent 1.2px)",
              backgroundSize: "16px 16px, 22px 22px",
            } as CSSProperties
          }
        />
        <svg
          aria-hidden="true"
          className="absolute inset-x-0 top-[8px] h-[352px] w-full drop-shadow-[0_14px_34px_rgba(90,64,44,0.12)]"
          preserveAspectRatio="none"
          viewBox="0 0 425 352"
        >
          <defs>
            <pattern
              id="letter-paper-white-texture"
              width="18"
              height="18"
              patternUnits="userSpaceOnUse"
            >
              <rect width="18" height="18" fill="#ffffff" />
              <circle cx="3.5" cy="4" r="0.45" fill="#b9aea2" opacity="0.12" />
              <circle cx="13.5" cy="10.5" r="0.38" fill="#d9d2ca" opacity="0.14" />
              <path
                d="M0 14 C5 13.4 9 14.6 18 13.8"
                fill="none"
                stroke="#eee9e3"
                strokeOpacity="0.36"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <path
            d="M0 150 L188 18 Q212.5 4 237 18 L425 150 L425 352 L0 352 Z"
            fill="url(#letter-paper-white-texture)"
            stroke="#e1d8cf"
            strokeOpacity="0.45"
            strokeWidth="0.8"
          />
        </svg>
        <div className="absolute left-1/2 top-[86px] flex -translate-x-1/2 flex-col items-center text-center text-[#5b4637]">
          <Image
            src="/images/gallery/wedding.png"
            alt=""
            width={54}
            height={54}
            className="h-[54px] w-[54px] object-contain"
            priority
          />
          <p className="mt-3 font-crimson text-sm font-semibold tracking-[0.02em]">
            Wedding Invitation
          </p>
          <p className="mt-10 whitespace-pre-line text-base font-medium leading-[1.68] tracking-[0.02em]">
            {groomName}과 {brideName}의 결혼식에{"\n"}
            소중한 분들을 초대합니다.
          </p>
          <p className="mt-8 text-base font-semibold tracking-[0.08em]">
            {String(date.year).slice(2)}.{String(date.month).padStart(2, "0")}.
            {String(date.day).padStart(2, "0")}.{dayLabel}
          </p>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none mx-auto w-full max-w-[425px] bg-white"
        style={{ height: TOP_FLAP_HEIGHT } as CSSProperties}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-1/2 z-[20] w-full max-w-[425px] -translate-x-1/2"
        style={{ bottom: bottomOffset } as CSSProperties}
      >
        <div className="relative h-[318px] w-full overflow-hidden">
          <svg
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-[260px] w-full drop-shadow-[0_-8px_22px_rgba(96,67,42,0.035)]"
            preserveAspectRatio="none"
            viewBox="0 0 425 260"
          >
            <defs>
              <linearGradient
                id="envelope-left-fold"
                x1="0"
                x2="1"
                y1="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="68%" stopColor="#fffefd" />
                <stop offset="100%" stopColor="#f1eee9" />
              </linearGradient>
              <linearGradient
                id="envelope-right-fold"
                x1="1"
                x2="0"
                y1="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="68%" stopColor="#fffefd" />
                <stop offset="100%" stopColor="#f1eee9" />
              </linearGradient>
              <linearGradient
                id="envelope-bottom-fold"
                x1="0.5"
                x2="0.5"
                y1="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f1eee9" />
              </linearGradient>
            </defs>
            <path
              d="M0 0 L202 112 L0 260 Z"
              fill="url(#envelope-left-fold)"
              stroke="#f5f2ee"
              strokeOpacity="0.36"
              strokeWidth="1"
            />
            <path
              d="M425 0 L223 112 L425 260 Z"
              fill="url(#envelope-right-fold)"
              stroke="#f5f2ee"
              strokeOpacity="0.36"
              strokeWidth="1"
            />
            <path
              d="M0 260 L190 116 Q212.5 82 235 116 L425 260 Z"
              fill="url(#envelope-bottom-fold)"
              stroke="#f5f2ee"
              strokeOpacity="0.32"
              strokeWidth="1"
            />
          </svg>
        </div>
      </div>
    </>
  );
}
