'use client';

import Image from 'next/image';
import type { HeroSectionData, Person } from '@/types';

interface MainHeroProps {
  section: HeroSectionData;
  groom: Person;
  bride: Person;
}

export default function MainHero({ section, groom, bride }: MainHeroProps) {
  return (
    <section id="hero" className="relative min-h-[100dvh] bg-wedding-beige overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(139,115,85,0.2),transparent_55%)]" />
      </div>

      <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-6 pb-16 pt-14 safe-top safe-bottom">
        <p className="animate-fade-in text-xs tracking-[0.35em] text-wedding-brown-light uppercase font-serif">
          {section.kicker}
        </p>

        <h1 className="mt-6 text-center text-[2.2rem] leading-tight text-wedding-brown font-serif md:text-5xl animate-slide-up">
          {groom.name}
          <span className="mx-3 text-2xl text-wedding-brown-light">그리고</span>
          {bride.name}
        </h1>

        <div className="relative mt-10 w-full max-w-[390px] animate-scale-in">
          <div className="relative aspect-[3/4] rounded-t-[50%] overflow-hidden shadow-[0_12px_40px_rgba(139,115,85,0.28)]">
            <Image
              src={section.mainImage.url}
              alt={section.mainImage.alt}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 390px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-wedding-beige/20 to-transparent" />
          </div>
        </div>

        <p className="mt-9 text-3xl text-wedding-brown-light" style={{ fontFamily: 'cursive' }}>
          {section.scriptLine}
        </p>

        <div className="mt-8 text-center animate-fade-in-up">
          <p className="text-lg font-medium text-wedding-brown">{section.dateLine}</p>
          <p className="mt-2 text-base text-wedding-brown-light">{section.venueLine}</p>
        </div>
      </div>
    </section>
  );
}
