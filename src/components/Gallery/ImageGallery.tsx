"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { GalleryImage, GallerySectionData } from "@/types";

interface ImageGalleryProps {
  section: GallerySectionData;
}

export default function ImageGallery({ section }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const visibleImages = section.images.slice(0, visibleCount);
  const hasMore = visibleCount < section.images.length;

  const handleLoadMore = () => {
    setVisibleCount(section.images.length);
  };

  useEffect(() => {
    if (!selectedImage) return;

    document.body.style.overflow = "hidden";
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedImage(null);
      }
    };

    window.addEventListener("keydown", onEsc);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", onEsc);
    };
  }, [selectedImage]);

  return (
    <section id="gallery" className="bg-white py-16">
      <div className="mx-auto flex w-full max-w-md flex-col">
        <div className="mb-8 text-center">
          <p className="font-crimson text-xs uppercase tracking-[0.33em] text-wedding-brown-light/70">
            {section.kicker}
          </p>
          <h2 className="mt-3 text-xl text-wedding-brown">
            {section.title}
          </h2>
        </div>

        <div className="px-[20px] py-[5px]">
          <div className="grid grid-cols-2 gap-2">
            {visibleImages.map((image) => (
              <button
                key={image.id}
                className="relative aspect-square w-full overflow-hidden rounded-md text-left"
                onClick={() => setSelectedImage(image)}
                aria-label={`${image.alt} 크게 보기`}
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 425px) 50vw, 210px"
                />
              </button>
            ))}
          </div>
        </div>

        {hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleLoadMore}
              className="inline-flex items-center gap-1 text-base font-medium text-wedding-brown"
              aria-label="갤러리 이미지 더 보기"
            >
              더보기
              <span aria-hidden="true">⌄</span>
            </button>
          </div>
        )}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative h-[88dvh] w-full max-w-4xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-black/40 p-2"
              aria-label="갤러리 확대 닫기"
            >
              <svg
                className="h-5 w-5 text-white"
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
            <Image
              src={selectedImage.url}
              alt={selectedImage.alt}
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />
          </div>
        </div>
      )}
    </section>
  );
}
