'use client';

import Image from 'next/image';
import { WEDDING_DATA, MAIN_IMAGE_URL } from '@/constants/wedding-data';

/**
 * 메인 히어로 섹션 - 인스타그램 스토리 스타일
 * GIF 이미지 디자인 재현
 */
export default function MainHero() {
  const { groom, bride, date } = WEDDING_DATA;

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

          {/* 장식 요소 (선택사항) */}
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center animate-float">
              <span className="text-2xl">💐</span>
            </div>
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

        {/* 날짜 및 시간 */}
        <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <p className="text-lg md:text-xl text-wedding-brown font-medium">
            {date.year}년 {date.month}월 {date.day}일 {date.dayOfWeek}
          </p>
          <p className="text-base md:text-lg text-wedding-brown-light mt-2">
            {date.time}
          </p>
        </div>

        {/* 스크롤 인디케이터 */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6 text-wedding-brown-light"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>

      {/* 하단 UI 버튼 (인스타그램 스타일) */}
      <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-center z-20 safe-bottom">
        {/* 프로필 아이콘 */}
        <button
          className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg"
          aria-label="프로필"
        >
          <svg
            className="w-5 h-5 text-wedding-brown"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* 음소거 버튼 (선택사항) */}
        <button
          className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg"
          aria-label="음소거"
        >
          <svg
            className="w-5 h-5 text-wedding-brown"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </section>
  );
}

