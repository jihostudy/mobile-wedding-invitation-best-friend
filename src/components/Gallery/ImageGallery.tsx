'use client';

import { useState } from 'react';
import Image from 'next/image';
import { GALLERY_IMAGES } from '@/constants/wedding-data';

/**
 * 웨딩 갤러리 - 3x3 그리드 형식
 */
export default function ImageGallery() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // 최대 9개 이미지만 표시 (3x3 그리드)
  const displayImages = GALLERY_IMAGES.slice(0, 9);

  return (
    <section className="section bg-wedding-beige">
      <div className="w-full max-w-2xl">
        {/* 타이틀 */}
        <div className="text-center mb-8">
          <p className="text-sm tracking-[0.3em] text-wedding-brown-light/60 uppercase font-serif mb-2">
            --------- Gallery ---------
          </p>
          <h2 className="text-3xl font-serif text-wedding-brown font-bold">
            웨딩 갤러리
          </h2>
        </div>

        {/* 3x3 그리드 */}
        <div className="grid grid-cols-3 gap-2">
          {displayImages.map((image) => (
            <div
              key={image.id}
              className="relative aspect-square overflow-hidden rounded-lg border border-wedding-brown/20 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedImage(image.url)}
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 33vw, 200px"
              />
            </div>
          ))}
        </div>

        {/* 이미지가 9개 미만일 경우 빈 칸 채우기 */}
        {displayImages.length < 9 && (
          <div className="grid grid-cols-3 gap-2 mt-2">
            {Array.from({ length: 9 - displayImages.length }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="aspect-square bg-wedding-brown/5 rounded-lg border border-wedding-brown/10 border-dashed"
              />
            ))}
          </div>
        )}
      </div>

      {/* 이미지 확대 모달 */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh]">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              aria-label="닫기"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
              <Image
                src={selectedImage}
                alt="확대된 이미지"
                fill
                className="object-contain"
                sizes="90vw"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

