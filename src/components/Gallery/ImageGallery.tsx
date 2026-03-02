"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FadeInUp from "@/components/common/FadeInUp";
import Icon from "@/components/common/Icon";
import type { GallerySectionData } from "@/types";

interface ImageGalleryProps {
  section: GallerySectionData;
}

const THUMBNAILS_PER_PAGE = 5;
const SWIPE_THRESHOLD_PX = 40;

export default function ImageGallery({ section }: ImageGalleryProps) {
  const imageCount = section.images.length;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [thumbnailPage, setThumbnailPage] = useState(0);
  const [transitionDirection, setTransitionDirection] = useState<1 | -1>(1);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const hasImages = imageCount > 0;
  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(imageCount / THUMBNAILS_PER_PAGE)),
    [imageCount],
  );
  const thumbnailStart = thumbnailPage * THUMBNAILS_PER_PAGE;
  const visibleThumbnails = section.images.slice(
    thumbnailStart,
    thumbnailStart + THUMBNAILS_PER_PAGE,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hiddenImages = section.images.slice(THUMBNAILS_PER_PAGE);
    hiddenImages.forEach((image) => {
      const preloader = new window.Image();
      preloader.decoding = "async";
      preloader.src = image.url;
    });
  }, [section.images]);

  useEffect(() => {
    if (imageCount === 0) {
      setSelectedIndex(0);
      setThumbnailPage(0);
      return;
    }
    const clampedIndex = Math.min(selectedIndex, imageCount - 1);
    if (clampedIndex !== selectedIndex) {
      setSelectedIndex(clampedIndex);
      setThumbnailPage(Math.floor(clampedIndex / THUMBNAILS_PER_PAGE));
      return;
    }
  }, [imageCount, selectedIndex]);

  const selectImage = (nextIndex: number, direction: 1 | -1) => {
    if (!hasImages || nextIndex === selectedIndex) return;
    setTransitionDirection(direction);
    setSelectedIndex(nextIndex);
  };

  const moveSelection = (direction: -1 | 1) => {
    if (!hasImages) return;
    const nextIndex = (selectedIndex + direction + imageCount) % imageCount;
    selectImage(nextIndex, direction);

    const pageStart = thumbnailPage * THUMBNAILS_PER_PAGE;
    const pageEnd = pageStart + THUMBNAILS_PER_PAGE - 1;
    if (nextIndex < pageStart || nextIndex > pageEnd) {
      setThumbnailPage(Math.floor(nextIndex / THUMBNAILS_PER_PAGE));
    }
  };

  const selectedImage = section.images[selectedIndex];

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (imageCount <= 1) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (imageCount <= 1 || !pointerStartRef.current) return;

    const deltaX = event.clientX - pointerStartRef.current.x;
    const deltaY = event.clientY - pointerStartRef.current.y;
    pointerStartRef.current = null;

    if (
      Math.abs(deltaX) >= SWIPE_THRESHOLD_PX &&
      Math.abs(deltaX) > Math.abs(deltaY)
    ) {
      moveSelection(deltaX > 0 ? -1 : 1);
    }
  };

  const handlePointerCancel = () => {
    pointerStartRef.current = null;
  };

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

        {hasImages ? (
          <>
            <FadeInUp className="px-[20px]" delay={0.1}>
              <div
                className="relative overflow-hidden rounded-md bg-[#f5f5f5] touch-pan-y select-none"
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerEnd}
                onPointerCancel={handlePointerCancel}
                onDragStart={(event) => event.preventDefault()}
              >
                <div className="relative w-full">
                  <AnimatePresence initial={false} custom={transitionDirection} mode="wait">
                    <motion.div
                      key={selectedImage.id}
                      className="w-full"
                      custom={transitionDirection}
                      initial={{ x: transitionDirection > 0 ? 36 : -36, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: transitionDirection > 0 ? -36 : 36, opacity: 0 }}
                      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Image
                        src={selectedImage.url}
                        alt={selectedImage.alt}
                        width={selectedImage.width}
                        height={selectedImage.height}
                        draggable={false}
                        className="h-auto w-full object-contain"
                        sizes="(max-width: 425px) 100vw, 420px"
                        priority
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
                {imageCount > 1 ? (
                  <>
                    <button
                      type="button"
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={(event) => {
                        event.stopPropagation();
                        moveSelection(-1);
                      }}
                      aria-label="이전 사진 보기"
                      className="absolute left-3 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm transition hover:bg-black/35"
                    >
                      <Icon icon={ChevronLeft} size="md" />
                    </button>
                    <button
                      type="button"
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={(event) => {
                        event.stopPropagation();
                        moveSelection(1);
                      }}
                      aria-label="다음 사진 보기"
                      className="absolute right-3 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm transition hover:bg-black/35"
                    >
                      <Icon icon={ChevronRight} size="md" />
                    </button>
                  </>
                ) : null}
              </div>
            </FadeInUp>

            <FadeInUp className="mt-4 px-[20px]" delay={0.16}>
              <div className="grid grid-cols-5 gap-2">
                {visibleThumbnails.map((image, index) => {
                  const absoluteIndex = thumbnailStart + index;
                  const isActive = absoluteIndex === selectedIndex;
                  return (
                    <button
                      type="button"
                      key={image.id}
                      className={`relative aspect-square w-full overflow-hidden rounded-md border ${
                        isActive
                          ? "border-wedding-brown"
                          : "border-transparent"
                      }`}
                      onClick={() =>
                        selectImage(
                          absoluteIndex,
                          absoluteIndex >= selectedIndex ? 1 : -1,
                        )
                      }
                      aria-label={`${image.alt} 선택`}
                      aria-current={isActive}
                    >
                      <Image
                        src={image.url}
                        alt={image.alt}
                        fill
                        draggable={false}
                        className="object-cover object-center"
                        sizes="(max-width: 425px) 20vw, 80px"
                      />
                    </button>
                  );
                })}
              </div>
            </FadeInUp>

            {pageCount > 1 ? (
              <div className="mt-4 flex items-center justify-center gap-2">
                {Array.from({ length: pageCount }).map((_, pageIndex) => (
                  <button
                    type="button"
                    key={pageIndex}
                    onClick={() => setThumbnailPage(pageIndex)}
                    aria-label={`${pageIndex + 1}번째 썸네일 페이지`}
                    aria-current={pageIndex === thumbnailPage}
                    className={`h-2 rounded-full transition-all ${
                      pageIndex === thumbnailPage
                        ? "w-6 bg-wedding-brown"
                        : "w-2 bg-wedding-brown/30"
                    }`}
                  />
                ))}
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  );
}
