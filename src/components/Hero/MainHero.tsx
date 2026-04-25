"use client";

import Image from "next/image";
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

  return (
    <section id="hero" className="relative overflow-hidden bg-white">
      <div className="mx-auto w-full max-w-[425px] px-7 py-6">
        <h1 className="sr-only">
          {groom.name} 그리고 {bride.name} 결혼합니다. {displayDate}
        </h1>

        <div className="relative aspect-[329/372] w-full overflow-hidden">
          <Image
            src={section.mainImage.url}
            alt={section.mainImage.alt}
            fill
            className="object-cover"
            sizes="(max-width: 425px) calc(100vw - 56px), 369px"
            quality={100}
            unoptimized
            priority
          />
        </div>
      </div>
    </section>
  );
}
