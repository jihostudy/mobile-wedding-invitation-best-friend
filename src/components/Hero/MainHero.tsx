"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BLUR_PLACEHOLDER } from "@/lib/image-placeholder";
import {
  openRsvpEntryPromptOverlay,
  openRsvpFormOverlay,
} from "@/overlays/rsvpOverlay";
import type { HeroSectionData, Person, WeddingDate, Venue } from "@/types";

const PETAL_COUNT = 16;
const PETALS = Array.from({ length: PETAL_COUNT }, (_, i) => {
  // 속도: 9~16초
  const duration = 9 + ((i * 11) % 70) / 10;

  // 회전 방향·속도
  const rotDir = i % 3 === 0 ? -1 : 1;
  const rotTotal =
    i % 3 === 1
      ? 80 + ((i * 31) % 120) // 느린 회전
      : 300 + ((i * 53) % 360); // 빠른 회전
  const r0 = (i * 47) % 360;

  // 상단 전체에서 고르게 출발: left 4~96%
  const baseLeft = 4 + ((i * 37 + 11) % 92);

  // 가장자리는 화면 안쪽으로, 중앙은 좌우로 섞여 떨어지게 흐름을 분산
  const driftDirection =
    baseLeft < 28 ? 1 : baseLeft > 72 ? -1 : i % 2 === 0 ? 1 : -1;
  const totalDrift = driftDirection * (60 + ((i * 19) % 150));
  // 대각선 궤적 위에서 좌우 흩날리는 진폭
  const wave = 18 + ((i * 11) % 22);
  const ws = i % 2 === 0 ? 1 : -1;

  const px0 = 0;
  const px1 = totalDrift * 0.25 + ws * wave * 0.9;
  const px2 = totalDrift * 0.5 - ws * wave * 0.7;
  const px3 = totalDrift * 0.75 + ws * wave * 0.5;
  const px4 = totalDrift;
  const petalWidth = 5 + (i % 4) * 1.4;
  const petalHeight = petalWidth * (1.75 + (i % 3) * 0.12);

  return {
    id: i,
    left: `${baseLeft}%`,
    delay: `-${((i * 13) % Math.round(duration * 10)) / 10}s`,
    duration: `${duration}s`,
    width: `${petalWidth}px`,
    height: `${petalHeight}px`,
    innerRotation: `${-18 + ((i * 23) % 36)}deg`,
    px0: `${px0}px`,
    px1: `${px1}px`,
    px2: `${px2}px`,
    px3: `${px3}px`,
    px4: `${px4}px`,
    pr0: `${r0}deg`,
    pr1: `${r0 + rotDir * rotTotal * 0.25}deg`,
    pr2: `${r0 + rotDir * rotTotal * 0.5}deg`,
    pr3: `${r0 + rotDir * rotTotal * 0.75}deg`,
    pr4: `${r0 + rotDir * rotTotal}deg`,
    opacity: String(0.55 + (i % 4) * 0.1),
  };
});

const HIDE_KEY = "rsvp_prompt_hide_until";
const SUBMITTED_KEY = "rsvp_submitted_at";

interface MainHeroProps {
  groom: Person;
  bride: Person;
  date: WeddingDate;
  section: HeroSectionData;
  venue: Venue;
  rsvpTitle: string;
}

export default function MainHero({
  groom,
  bride,
  date,
  section,
  venue,
  rsvpTitle,
}: MainHeroProps) {
  const [blossomActive, setBlossomActive] = useState(false);
  const [heroViewportHeight, setHeroViewportHeight] = useState("100svh");
  const hasOpenedRsvpRef = useRef(false);

  const groomGivenName = useMemo(() => {
    const parts = (groom.englishName ?? groom.name).split(" ");
    return parts.length > 1 ? parts.slice(1).join(" ") : parts[0];
  }, [groom]);

  const brideGivenName = useMemo(() => {
    const parts = (bride.englishName ?? bride.name).split(" ");
    return parts.length > 1 ? parts.slice(1).join(" ") : parts[0];
  }, [bride]);

  const dateLabel = useMemo(() => {
    const { year, month, day, dayOfWeek, time } = date;
    return `${year}년 ${month}월 ${day}일 ${dayOfWeek} ${time}`;
  }, [date]);

  const venueLine = useMemo(() => {
    const { name, floor, hall } = venue;
    if (floor && hall) return `${name} ${floor} ${hall}`;
    if (floor) return `${name} ${floor}`;
    return name;
  }, [venue]);

  const dateLine = useMemo(() => {
    const { year, month, day, dayOfWeek, time } = date;
    const normalizedDay = dayOfWeek.replace("요일", "");
    const dayLabel = normalizedDay[0] ?? dayOfWeek;
    return `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")} (${dayLabel}) ${time}`;
  }, [date]);

  const openRsvpForm = useCallback(() => {
    openRsvpFormOverlay({
      onComplete: () => {
        localStorage.setItem(SUBMITTED_KEY, new Date().toISOString());
      },
    });
  }, []);

  const hidePromptToday = useCallback(() => {
    const today = new Date();
    const label = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    localStorage.setItem(HIDE_KEY, label);
  }, []);

  useEffect(() => {
    const lockViewportHeight = () => {
      const viewportHeight =
        window.visualViewport?.height ?? window.innerHeight;
      setHeroViewportHeight(`${Math.round(viewportHeight)}px`);
    };
    const handleOrientationChange = () => {
      window.setTimeout(lockViewportHeight, 250);
    };

    lockViewportHeight();
    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflowY = "hidden";
    const unlockTimer = setTimeout(() => {
      document.body.style.overflowY = "";
    }, 5200);
    return () => {
      clearTimeout(unlockTimer);
      document.body.style.overflowY = "";
    };
  }, []);

  useEffect(() => {
    const blossomTimer = setTimeout(() => setBlossomActive(true), 4400);

    const rsvpTimer = setTimeout(() => {
      if (hasOpenedRsvpRef.current) return;

      const today = new Date();
      const todayLabel = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      const hiddenUntil = localStorage.getItem(HIDE_KEY);
      const submittedAt = localStorage.getItem(SUBMITTED_KEY);

      if (hiddenUntil === todayLabel || submittedAt) return;

      hasOpenedRsvpRef.current = true;
      openRsvpEntryPromptOverlay({
        title: rsvpTitle,
        dateLine,
        venueLine,
        addressLine: venue.address,
        onHideToday: hidePromptToday,
        onOpenRsvp: openRsvpForm,
      });
    }, 5300);

    return () => {
      clearTimeout(blossomTimer);
      clearTimeout(rsvpTimer);
    };
  }, [
    dateLine,
    hidePromptToday,
    openRsvpForm,
    rsvpTitle,
    venue.address,
    venueLine,
  ]);

  return (
    <section
      id="hero"
      className="relative overflow-hidden"
      style={{ height: heroViewportHeight, minHeight: heroViewportHeight }}
    >
      <h1 className="sr-only">
        {groom.name} 그리고 {bride.name} 결혼합니다.
      </h1>

      {/* 배경 이미지 */}
      <Image
        src={section.mainImage.url}
        alt={section.mainImage.alt}
        fill
        className="object-cover"
        sizes="(max-width: 425px) 100vw, 425px"
        quality={90}
        placeholder="blur"
        blurDataURL={BLUR_PLACEHOLDER}
        priority
      />

      {/* 검은 오버레이 — 텍스트 가독성용, 텍스트와 함께 사라짐 */}
      <div
        className="absolute inset-0 bg-black/50"
        style={{ animation: "heroTextFadeOut 0.8s ease-out 4.4s both" }}
      />

      {/* 벚꽃 떨어지는 효과 */}
      {blossomActive &&
        PETALS.map((petal) => (
          <div
            key={petal.id}
            aria-hidden
            className="pointer-events-none absolute top-0"
            style={
              {
                left: petal.left,
                animation: `heroPetalFall ${petal.duration} ${petal.delay} infinite linear`,
                "--px-0": petal.px0,
                "--px-1": petal.px1,
                "--px-2": petal.px2,
                "--px-3": petal.px3,
                "--px-4": petal.px4,
                "--pr-0": petal.pr0,
                "--pr-1": petal.pr1,
                "--pr-2": petal.pr2,
                "--pr-3": petal.pr3,
                "--pr-4": petal.pr4,
                "--p-opacity": petal.opacity,
              } as React.CSSProperties
            }
          >
            <div
              style={{
                width: petal.width,
                height: petal.height,
                background:
                  "radial-gradient(ellipse at 35% 22%, rgba(255,239,246,0.98), rgba(255,198,216,0.95) 58%, rgba(239,142,171,0.88))",
                borderRadius: "72% 28% 76% 24% / 64% 42% 58% 36%",
                clipPath:
                  "polygon(50% 0%, 78% 16%, 94% 44%, 76% 78%, 54% 100%, 33% 78%, 9% 48%, 22% 18%)",
                filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.18))",
                transform: `rotate(${petal.innerRotation}) skewX(-5deg)`,
                transformOrigin: "50% 65%",
              }}
            />
          </div>
        ))}

      {/* 상단: 이름 */}
      <div className="absolute inset-x-0 top-10 text-center">
        <p
          className="font-crimson text-sm uppercase tracking-[0.3em]"
          style={{
            color: "#e8d5bc",
            textShadow: "0 1px 10px rgba(60, 35, 15, 0.45)",
          }}
        >
          {groomGivenName} &amp; {brideGivenName}
        </p>
      </div>

      {/* 중앙: 글씨 작성 애니메이션 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center -translate-y-4">
        <div className="-translate-x-8">
          <p
            className="font-tangerine text-[clamp(30px,8vw,40px)] font-normal leading-snug text-white/85 px-4 pt-3 pb-2"
            style={{
              animation:
                "writeClipOpen 1.8s cubic-bezier(0.25, 1, 0.5, 1) 0.25s both, heroTextFadeOut 0.8s ease-out 4.4s both",
              WebkitFontSmoothing: "antialiased",
              textShadow: "0 1px 6px rgba(0,0,0,0.18)",
            }}
          >
            Welcome to
          </p>
        </div>
        <div className="mt-1 translate-x-8">
          <p
            className="font-tangerine text-[clamp(30px,8vw,40px)] font-normal leading-snug text-white/85 px-4 pt-2 pb-5"
            style={{
              animation:
                "writeClipOpen 1.95s cubic-bezier(0.25, 1, 0.5, 1) 1.75s both, heroTextFadeOut 0.8s ease-out 4.4s both",
              WebkitFontSmoothing: "antialiased",
              textShadow: "0 1px 6px rgba(0,0,0,0.18)",
            }}
          >
            our wedding
          </p>
        </div>
      </div>

      {/* 하단: 날짜 및 장소 */}
      <div
        className="absolute inset-x-0 bottom-0 text-center space-y-1.5 px-6 pt-10 pb-10"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.52) 0%, transparent 100%)",
        }}
      >
        <p
          className="font-crimson text-lg tracking-[0.06em] text-white"
          style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}
        >
          {dateLabel}
        </p>
        <p
          className="font-crimson text-lg tracking-[0.06em] text-white"
          style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}
        >
          {venueLine}
        </p>
      </div>
    </section>
  );
}
