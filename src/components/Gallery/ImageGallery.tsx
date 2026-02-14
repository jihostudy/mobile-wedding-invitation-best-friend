'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { GalleryImage, GallerySectionData } from '@/types';

interface ImageGalleryProps {
  section: GallerySectionData;
}

export default function ImageGallery({ section }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToIndex = (index: number) => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    container.scrollTo({
      left: index * container.clientWidth,
      behavior: 'smooth',
    });
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : section.images.length - 1;
    scrollToIndex(newIndex);
  };

  const goToNext = () => {
    const newIndex = currentIndex < section.images.length - 1 ? currentIndex + 1 : 0;
    scrollToIndex(newIndex);
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    setCurrentIndex(Math.round(container.scrollLeft / container.clientWidth));
  };

  useEffect(() => {
    if (!selectedImage) return;

    document.body.style.overflow = 'hidden';
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedImage(null);
      }
    };

    window.addEventListener('keydown', onEsc);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', onEsc);
    };
  }, [selectedImage]);

  return (
    <section id="gallery" className="bg-wedding-beige px-4 py-16">
      <div className="mx-auto flex w-full max-w-2xl flex-col">
        <div className="mb-8 text-center">
          <p className="font-serif text-xs uppercase tracking-[0.34em] text-wedding-brown-light/70">{section.kicker}</p>
          <h2 className="mt-3 text-3xl font-serif text-wedding-brown">{section.title}</h2>
        </div>

        <div className="relative">
          <button
            onClick={goToPrevious}
            className="absolute left-1 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/85 p-2 shadow"
            aria-label="이전 이미지"
          >
            <svg className="h-5 w-5 text-wedding-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="scrollbar-hide flex snap-x snap-mandatory overflow-x-auto"
          >
            {section.images.map((image) => (
              <button
                key={image.id}
                className="relative h-[66dvh] w-full flex-shrink-0 snap-center px-3 text-left"
                onClick={() => setSelectedImage(image)}
                aria-label={`${image.alt} 크게 보기`}
              >
                <span className="relative block h-full w-full overflow-hidden rounded-2xl bg-white/70 shadow-lg">
                  <Image src={image.url} alt={image.alt} fill className="object-contain" sizes="(max-width: 768px) 100vw, 720px" />
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={goToNext}
            className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/85 p-2 shadow"
            aria-label="다음 이미지"
          >
            <svg className="h-5 w-5 text-wedding-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="mt-5 flex justify-center gap-2">
            {section.images.map((_, index) => (
              <button
                key={`indicator-${index}`}
                onClick={() => scrollToIndex(index)}
                className={`h-2 rounded-full transition-all ${index === currentIndex ? 'w-6 bg-wedding-brown' : 'w-2 bg-wedding-brown/30'}`}
                aria-label={`${index + 1}번 이미지로 이동`}
              />
            ))}
          </div>
        </div>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative h-[88dvh] w-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-black/40 p-2"
              aria-label="갤러리 확대 닫기"
            >
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <Image src={selectedImage.url} alt={selectedImage.alt} fill className="object-contain" sizes="90vw" priority />
          </div>
        </div>
      )}
    </section>
  );
}
