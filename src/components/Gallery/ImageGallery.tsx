"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
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
  const [modalIndex, setModalIndex] = useState(0);
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
  const canGoPrev = modalIndex > 0;
  const canGoNext = modalIndex < section.images.length - 1;

  useEffect(() => {
    setVisibleCount(Math.min(section.images.length, batchSize));
  }, [batchSize, section.images.length]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hiddenImages = section.images.slice(visibleCount);
    hiddenImages.forEach((image) => {
      const preloader = new window.Image();
      preloader.decoding = "async";
      preloader.src = image.url;
    });
  }, [section.images, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount(section.images.length);
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
                  const nextIndex = index >= 0 ? index : 0;
                  setSelectedIndex(nextIndex);
                  setModalIndex(nextIndex);
                }}
                aria-label={`${image.alt} 크게 보기`}
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  className="object-cover object-center"
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

      <ModalPortal>
        <AnimatePresence>
          {selectedIndex !== null ? (
            <motion.div
              className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
              onClick={() => setSelectedIndex(null)}
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <motion.div
                className="absolute inset-0 bg-black/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              />
              <motion.div
                className="relative mx-auto h-[88dvh] w-full max-w-[720px]"
                onClick={(event) => event.stopPropagation()}
                initial={{ y: 18, scale: 0.985, opacity: 0.82 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                exit={{ y: 14, scale: 0.99, opacity: 0.8 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedIndex(null)}
                  className="absolute right-3 top-3 z-20 rounded-full bg-black/45 p-2 md:right-4 md:top-4"
                  aria-label="갤러리 확대 닫기"
                >
                  <Icon icon={X} size="md" className="text-white" />
                </button>
                <Carousel
                  items={section.images}
                  index={modalIndex}
                  onIndexChange={setModalIndex}
                  initialIndex={selectedIndex}
                  loop={false}
                  getItemKey={(item) => item.id}
                  className="h-full"
                  viewportClassName="h-full"
                  slideClassName="h-full"
                  showDots={false}
                  showArrows={false}
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
                        quality={100}
                        unoptimized
                        loading="eager"
                      />
                    </div>
                  )}
                />

                {section.images.length > 1 ? (
                  <div className="pointer-events-none absolute bottom-[max(14px,env(safe-area-inset-bottom))] left-1/2 z-20 -translate-x-1/2">
                    <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-black/45 px-3 py-2 text-white backdrop-blur">
                      <button
                        type="button"
                        onClick={() => canGoPrev && setModalIndex((prev) => Math.max(prev - 1, 0))}
                        disabled={!canGoPrev}
                        aria-label="이전 사진 보기"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-white disabled:opacity-35"
                      >
                        <Icon icon={ChevronLeft} size="sm" />
                      </button>
                      <span className="font-pretendard min-w-[58px] text-center text-sm tabular-nums">
                        {modalIndex + 1} / {section.images.length}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          canGoNext &&
                          setModalIndex((prev) =>
                            Math.min(prev + 1, section.images.length - 1),
                          )
                        }
                        disabled={!canGoNext}
                        aria-label="다음 사진 보기"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-white disabled:opacity-35"
                      >
                        <Icon icon={ChevronRight} size="sm" />
                      </button>
                    </div>
                  </div>
                ) : null}
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </ModalPortal>
    </section>
  );
}
