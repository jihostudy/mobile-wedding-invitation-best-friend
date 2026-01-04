'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { GALLERY_IMAGES } from '@/constants/wedding-data';

/**
 * 이미지 갤러리 - 스와이프 가능한 인스타그램 스타일
 * 모바일 최적화된 터치 제스처 지원
 */
export default function ImageGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const handleScroll = () => {
      const scrollLeft = element.scrollLeft;
      const width = element.offsetWidth;
      const newIndex = Math.round(scrollLeft / width);
      setCurrentIndex(newIndex);
    };

    element.addEventListener('scroll', handleScroll);
    return () => element.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToImage = (index: number) => {
    const element = scrollRef.current;
    if (!element) return;

    const width = element.offsetWidth;
    element.scrollTo({
      left: width * index,
      behavior: 'smooth',
    });
  };

  return (
    <section className="section bg-wedding-cream">
      <div className="w-full max-w-2xl">
        {/* 타이틀 */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif text-wedding-brown mb-2">
            Our Story
          </h2>
          <p className="text-wedding-brown-light">
            우리의 소중한 순간들
          </p>
        </div>

        {/* 이미지 슬라이더 */}
        <div className="relative">
          {/* 스크롤 컨테이너 */}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {GALLERY_IMAGES.map((image) => (
              <div
                key={image.id}
                className="flex-shrink-0 w-full snap-center px-2"
              >
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 600px"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* 인디케이터 도트 */}
          <div className="flex justify-center gap-2 mt-6">
            {GALLERY_IMAGES.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToImage(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? 'w-8 h-2 bg-wedding-brown'
                    : 'w-2 h-2 bg-wedding-brown-light'
                }`}
                aria-label={`이미지 ${index + 1}번으로 이동`}
              />
            ))}
          </div>

          {/* 이미지 카운터 */}
          <div className="text-center mt-4">
            <p className="text-sm text-wedding-brown-light">
              {currentIndex + 1} / {GALLERY_IMAGES.length}
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

