"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import type { HeroSectionData, Person, WeddingDate } from "@/types";

interface MainHeroProps {
  groom: Person;
  bride: Person;
  date: WeddingDate;
  section: HeroSectionData;
}

export default function MainHero({ groom, bride, date, section }: MainHeroProps) {
  const yearShort = String(date.year).slice(-2);
  const month = String(date.month).padStart(2, "0");
  const day = String(date.day).padStart(2, "0");
  const displayDate = `${yearShort}.${month}.${day}`;
  const snowflakes = Array.from({ length: 26 }, (_, index) => ({
    id: index,
    left: ((index * 37) % 100) + ((index % 3) * 2.1),
    size:
      2 +
      (index % 4) * 1.2 +
      (index % 11 === 0 ? 2.3 : 0) +
      (index % 17 === 0 ? 1.4 : 0),
    duration: 8 + (index % 5) * 1.3,
    delay: (index % 7) * -1.1,
    driftStart: -110 + (index % 6) * 14,
    driftMid: 24 + (index % 7) * 18,
    driftEnd: 96 + (index % 8) * 20,
    opacity: 0.26 + (index % 5) * 0.08,
    depth: -120 + (index % 9) * 28,
    blur: 0.3 + (index % 4) * 0.35,
    scale: 0.72 + (index % 6) * 0.1,
    timing:
      index % 2 === 0
        ? "cubic-bezier(0.33, 0, 0.67, 1)"
        : "cubic-bezier(0.24, 0.08, 0.42, 1)",
  }));

  return (
    <section
      id="hero"
      className="relative min-h-[640px] overflow-hidden bg-white"
    >
      <div className="hero-snow-layer absolute inset-0 z-20 pointer-events-none overflow-hidden">
        {snowflakes.map((flake) => (
          <span
            key={flake.id}
            className="hero-snowflake"
            style={
              {
                left: `${flake.left}%`,
                width: `${flake.size}px`,
                height: `${flake.size}px`,
                opacity: flake.opacity,
                animationDuration: `${flake.duration}s`,
                animationDelay: `${flake.delay}s`,
                animationTimingFunction: flake.timing,
                filter: `blur(${flake.blur}px)`,
                "--snow-drift-start": `${flake.driftStart}px`,
                "--snow-drift-mid": `${flake.driftMid}px`,
                "--snow-drift-end": `${flake.driftEnd}px`,
                "--snow-depth": `${flake.depth}px`,
                "--snow-scale": `${flake.scale}`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto flex min-h-[640px] w-full max-w-[425px] flex-col px-6 pb-14 pt-6">
        <h1 className="sr-only">
          {groom.name} 그리고 {bride.name} 결혼합니다. {displayDate}
        </h1>

        <div className="relative z-10 mx-auto mt-3 w-full max-w-[300px]">
          <div className="relative h-[240px] w-[220px] overflow-hidden rounded-[6px] border border-black/5 shadow-[0_10px_24px_rgba(0,0,0,0.12)]">
            <Image
              src={section.primaryImage.url}
              alt={section.primaryImage.alt}
              fill
              className="object-cover"
              sizes="220px"
              quality={100}
              unoptimized
              priority
            />
          </div>

          <div className="relative -mt-5 ml-auto h-[215px] w-[235px] overflow-hidden rounded-[6px] border border-black/5 shadow-[0_10px_24px_rgba(0,0,0,0.12)]">
            <Image
              src={section.secondaryImage.url}
              alt={section.secondaryImage.alt}
              fill
              className="object-cover"
              sizes="235px"
              quality={100}
              unoptimized
              loading="eager"
            />
          </div>
        </div>

        <div className="relative z-30 mt-8 ml-6 w-fit text-left text-[#202020]">
          <p className="font-hyejun ml-14 text-7xl font-medium leading-[0.98] tracking-wider -rotate-[8deg]">
            {section.titleText}
          </p>
          <p className="font-hyejun -mt-4 text-4xl ml-56 font-semibold leading-[0.98] tracking-normal -rotate-[8deg]">
            {displayDate}
          </p>
        </div>
      </div>
    </section>
  );
}
