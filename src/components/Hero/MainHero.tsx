'use client';

import Image from 'next/image';
import type { HeroSectionData, Person } from '@/types';

interface MainHeroProps {
  section: HeroSectionData;
  groom: Person;
  bride: Person;
}

export default function MainHero({ section, groom, bride }: MainHeroProps) {
  const dateParts = section.dateLine.match(/\d+/g) ?? [];
  const yearShort = (dateParts[0] ? dateParts[0] : String(new Date().getFullYear())).slice(-2);
  const month = dateParts[1] ? dateParts[1].padStart(2, '0') : '06';
  const day = dateParts[2] ? dateParts[2].padStart(2, '0') : '02';

  return (
    <section id="hero" className="sticky top-0 h-[600px] overflow-hidden bg-white">
      <Image
        src={section.mainImage.url}
        alt={section.mainImage.alt}
        fill
        priority
        className="object-cover saturate-50 brightness-75 contrast-105"
        sizes="100vw"
      />

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(188,197,224,0.56),rgba(61,66,85,0.48)_58%,rgba(25,27,35,0.62))]" />

      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(221,232,255,0.2),transparent_55%)]" />
        <span className="absolute left-[8%] top-[18%] h-2 w-2 rounded-full bg-white/55 blur-[1px]" />
        <span className="absolute left-[22%] top-[40%] h-1.5 w-1.5 rounded-full bg-white/60" />
        <span className="absolute right-[18%] top-[33%] h-2 w-2 rounded-full bg-white/45 blur-[1px]" />
        <span className="absolute right-[28%] bottom-[25%] h-3 w-3 rounded-full bg-lime-200/70 blur-[1px]" />
        <span className="absolute left-[15%] bottom-[17%] h-3 w-3 rounded-full bg-yellow-200/65 blur-[1px]" />
      </div>

      <div className="relative z-10 flex h-full flex-col px-5 pb-10 pt-7 text-white safe-top safe-bottom">
        <div className="flex items-start justify-between">
          <p className="text-[0.76rem] font-semibold uppercase tracking-[0.12em] text-white/90">SIMPLY</p>
          <p className="text-[0.76rem] font-semibold uppercase tracking-[0.12em] text-white/90">MEANT</p>
        </div>

        <div className="mt-auto mb-[20vh] flex justify-center">
          <h1 className="sr-only">
            {groom.name} 그리고 {bride.name}
          </h1>
          <p className="w-[180px] text-center text-[7.7rem] font-black leading-[0.74] tracking-[-0.06em] text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.32)]">
            <span className="block">{yearShort}</span>
            <span className="block">{month}</span>
            <span className="block">{day}</span>
          </p>
        </div>

        <div className="mt-auto flex items-end justify-between text-white">
          <p className="font-serif text-[1.45rem] font-semibold uppercase tracking-[0.02em]">TO BE</p>
          <p className="font-serif text-[1.45rem] font-semibold uppercase tracking-[0.02em]">TOGETHER</p>
        </div>
      </div>
    </section>
  );
}
