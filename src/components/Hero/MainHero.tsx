'use client';

import Image from 'next/image';
import { WEDDING_DATA, MAIN_IMAGE_URL } from '@/constants/wedding-data';

/**
 * 메인 히어로 섹션 - 인스타그램 스토리 스타일
 * GIF 이미지 디자인 재현
 */
export default function MainHero() {
  const { groom, bride, date, venue } = WEDDING_DATA;

  return (
    <section className="relative min-h-screen bg-wedding-beige overflow-hidden">
      {/* 배경 텍스처 (선택사항) */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#8B7355_1px,_transparent_1px)] bg-[length:30px_30px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12 safe-top safe-bottom">
        {/* 헤더 텍스트 */}
        <div className="text-center mb-8 animate-fade-in">
          <p className="text-sm tracking-[0.3em] text-wedding-brown-light uppercase font-serif mb-2">
            THE WEDDING OF
          </p>
        </div>

        {/* 신랑신부 이름 */}
        <div className="text-center mb-12 animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-serif text-wedding-brown mb-2">
            {groom.name}
            <span className="mx-4 text-3xl text-wedding-brown-light">그리고</span>
            {bride.name}
          </h1>
        </div>

        {/* 메인 이미지 - 아치형 프레임 */}
        <div className="relative w-full max-w-[400px] mb-12 animate-scale-in">
          {/* 아치형 컨테이너 */}
          <div className="relative aspect-[3/4] rounded-t-[50%] overflow-hidden shadow-2xl">
            <Image
              src={MAIN_IMAGE_URL}
              alt={`${groom.name}과 ${bride.name}의 결혼식`}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 400px"
            />
            
            {/* 이미지 오버레이 (부드러운 비네팅) */}
            <div className="absolute inset-0 bg-gradient-to-t from-wedding-beige/20 via-transparent to-transparent" />
          </div>
        </div>

        {/* We are getting Married - 필기체 */}
        <div className="text-center mb-8 animate-fade-in-up">
          <p 
            className="text-3xl text-wedding-brown-light"
            style={{ fontFamily: 'cursive' }}
          >
            We are getting Married
          </p>
        </div>

        {/* 날짜 및 시간 (한 줄) */}
        <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <p className="text-lg md:text-xl text-wedding-brown font-medium">
            {date.year}년 {date.month}월 {date.day}일 {date.dayOfWeek} {date.time}
          </p>
          {/* 위치 정보 */}
          <p className="text-base md:text-lg text-wedding-brown-light mt-2">
            {venue.name}
          </p>
        </div>
      </div>
    </section>
  );
}

