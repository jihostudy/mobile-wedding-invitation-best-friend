"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronDown, X } from "lucide-react";
import FadeInUp from "@/components/common/FadeInUp";
import Icon from "@/components/common/Icon";
import Carousel from "@/components/common/Carousel";
import ModalPortal from "@/components/common/ModalPortal";
import useModalLayer from "@/hooks/useModalLayer";
import type { GallerySectionData } from "@/types";

interface ImageGalleryProps {
  section: GallerySectionData;
}

export default function ImageGallery({ section }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const batchSize = useMemo(
    () => Math.max(2, Math.floor((section.batchSize || 6) / 2) * 2),
    [section.batchSize],
  );
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(section.images.length, batchSize),
  );
  const visibleImages = section.images.slice(0, visibleCount);
  const hasMore = visibleCount < section.images.length;
  const isModalOpen = selectedIndex !== null;

  useEffect(() => {
    setVisibleCount(Math.min(section.images.length, batchSize));
  }, [batchSize, section.images.length]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(section.images.length, prev + batchSize));
  };

  useModalLayer({
    active: isModalOpen,
    onEscape: () => setSelectedIndex(null),
  });

  return (
    <section id="gallery" className="bg-white py-16">
      <div className="mx-auto flex w-full max-w-md flex-col">
        <FadeInUp className="mb-8 text-center">
          <p className="font-crimson text-sm uppercase tracking-[0.33em] text-wedding-brown">
            {section.kicker}
          </p>
          <h2 className="mt-3 text-xl tracking-[0.04em] text-wedding-gray-dark">
            {section.title}
          </h2>
        </FadeInUp>

        <FadeInUp className="px-[20px] py-[5px]" delay={0.1}>
          <div className="grid grid-cols-2 gap-2">
            {visibleImages.map((image) => (
              <button
                type="button"
                key={image.id}
                className="relative aspect-square w-full overflow-hidden rounded-md text-left"
                onClick={() => {
                  const index = section.images.findIndex(
                    (galleryImage) => galleryImage.id === image.id,
                  );
                  setSelectedIndex(index >= 0 ? index : 0);
                }}
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
        </FadeInUp>

        {hasMore && (
          <FadeInUp className="mt-8 flex justify-center" delay={0.18}>
            <button
              type="button"
              onClick={handleLoadMore}
              className="inline-flex items-center gap-1 text-base font-medium text-wedding-gray-dark"
              aria-label="갤러리 이미지 더 보기"
            >
              더보기
              <Icon icon={ChevronDown} size="sm" />
            </button>
          </FadeInUp>
        )}
      </div>

      {selectedIndex !== null ? (
        <ModalPortal>
          <div
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4"
            onClick={() => setSelectedIndex(null)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="relative h-[88dvh] w-full max-w-4xl"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedIndex(null)}
                className="absolute right-3 top-3 z-10 rounded-full bg-black/40 p-2"
                aria-label="갤러리 확대 닫기"
              >
                <Icon icon={X} size="md" className="text-white" />
              </button>
              <Carousel
                items={section.images}
                initialIndex={selectedIndex}
                getItemKey={(item) => item.id}
                className="h-full"
                viewportClassName="h-full"
                slideClassName="h-full"
                prevAriaLabel="이전 사진 보기"
                nextAriaLabel="다음 사진 보기"
                renderItem={(image) => (
                  <div className="relative h-full w-full">
                    <Image
                      src={image.url}
                      alt={image.alt}
                      fill
                      className="object-contain"
                      sizes="90vw"
                      priority
                    />
                  </div>
                )}
              />
            </div>
          </div>
        </ModalPortal>
      ) : null}
    </section>
  );
}
