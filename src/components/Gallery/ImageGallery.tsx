"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import Carousel from "@/components/common/Carousel";
import { BLUR_PLACEHOLDER } from "@/lib/image-placeholder";
import FadeInUp from "@/components/common/FadeInUp";
import Icon from "@/components/common/Icon";
import ModalPortal from "@/components/common/ModalPortal";
import useModalLayer from "@/hooks/useModalLayer";
import type { GallerySectionData } from "@/types";

interface ImageGalleryProps {
  section: GallerySectionData;
}

const INITIAL_VISIBLE_COUNT = 9;
const EXPANDED_VISIBLE_COUNT = 24;

export default function ImageGallery({ section }: ImageGalleryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [revealRunId, setRevealRunId] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );
  const visibleCount = isExpanded
    ? EXPANDED_VISIBLE_COUNT
    : INITIAL_VISIBLE_COUNT;
  const visibleImages = section.images.slice(0, visibleCount);
  const hasImages = section.images.length > 0;
  const canShowMore =
    !isExpanded && section.images.length > INITIAL_VISIBLE_COUNT;
  const canGoPrev = selectedImageIndex !== null && selectedImageIndex > 0;
  const canGoNext =
    selectedImageIndex !== null &&
    selectedImageIndex < section.images.length - 1;

  useModalLayer({
    active: selectedImageIndex !== null,
    onEscape: () => setSelectedImageIndex(null),
  });

  useEffect(() => {
    const nextBatch = section.images.slice(INITIAL_VISIBLE_COUNT, EXPANDED_VISIBLE_COUNT);
    if (!nextBatch.length) return;

    const timer = setTimeout(() => {
      nextBatch.forEach((image) => {
        const img = new window.Image();
        img.src = image.url;
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [section.images]);

  return (
    <>
      <section id="gallery" className="bg-white py-16">
        <div className="mx-auto w-full max-w-md">
          <FadeInUp className="mb-8 text-center">
            <p className="font-crimson text-sm uppercase tracking-[0.33em] text-wedding-brown">
              {section.kicker}
            </p>
            <h2 className="mt-3 text-xl tracking-[0.04em] text-wedding-gray-dark">
              {section.title}
            </h2>
          </FadeInUp>

          {hasImages ? (
            <FadeInUp delay={0.08} amount={0.1}>
              <div className="grid grid-cols-3 gap-[2px] bg-white">
                {visibleImages.map((image, index) => {
                  const shouldRevealImage =
                    isExpanded &&
                    revealRunId > 0 &&
                    index >= INITIAL_VISIBLE_COUNT;

                  return (
                    <button
                      type="button"
                      key={`${image.id}-${image.url}-${index}-${
                        shouldRevealImage ? revealRunId : 0
                      }`}
                      className={`relative block aspect-square w-full overflow-hidden bg-[#f5f5f5] ${
                        shouldRevealImage
                          ? "animate-gallery-image-shade-in"
                          : ""
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                      aria-label={`${image.alt} 크게 보기`}
                    >
                      <Image
                        src={image.url}
                        alt={image.alt}
                        fill
                        className="object-cover object-center"
                        sizes="(max-width: 425px) 33vw, 140px"
                        quality={92}
                        placeholder="blur"
                        blurDataURL={BLUR_PLACEHOLDER}
                        priority={index < INITIAL_VISIBLE_COUNT}
                      />
                    </button>
                  );
                })}
              </div>

              {canShowMore ? (
                <div className="mt-12 flex justify-center px-9">
                  <button
                    type="button"
                    onClick={() => {
                      setRevealRunId((current) => current + 1);
                      setIsExpanded(true);
                    }}
                    className="inline-flex flex-col items-center gap-4 text-[#6f6b67] transition hover:text-[#3f3b37]"
                    aria-label={`갤러리 사진 ${
                      Math.min(EXPANDED_VISIBLE_COUNT, section.images.length) -
                      INITIAL_VISIBLE_COUNT
                    }장 더 보기`}
                  >
                    <span className="whitespace-nowrap text-xl font-medium tracking-[-0.02em]">
                      더보기
                    </span>
                    <Icon icon={ChevronDown} size="lg" />
                  </button>
                </div>
              ) : null}
            </FadeInUp>
          ) : null}
        </div>
      </section>

      {selectedImageIndex !== null && hasImages ? (
        <ModalPortal>
          <div
            className="fixed inset-0 z-[10010] bg-white"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              className="relative mx-auto h-[100dvh] w-full max-w-[430px] bg-white"
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                type="button"
                onClick={() => setSelectedImageIndex(null)}
                className="absolute right-0 top-3 z-30 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/75 text-#AFAFAF backdrop-blur transition hover:bg-white"
                aria-label="갤러리 사진 닫기"
              >
                <Icon icon={X} size="md" />
              </button>

              <Carousel
                items={section.images}
                index={selectedImageIndex}
                initialIndex={selectedImageIndex}
                onIndexChange={(index) => setSelectedImageIndex(index)}
                getItemKey={(item, index) => `${item.id}-${item.url}-${index}`}
                className="h-[100dvh]"
                viewportClassName="h-[100dvh]"
                slideClassName="h-[100dvh]"
                slideGapPx={12}
                showDots={false}
                showArrows={false}
                loop={false}
                prevAriaLabel="이전 갤러리 사진 보기"
                nextAriaLabel="다음 갤러리 사진 보기"
                renderItem={(item) => (
                  <div className="flex h-[100dvh] w-full items-center justify-center bg-white py-16">
                    <div className="relative h-full w-full">
                      <Image
                        src={item.url}
                        alt={item.alt}
                        fill
                        draggable={false}
                        className="object-contain object-center"
                        sizes="(max-width: 430px) 100vw, 430px"
                        quality={90}
                        placeholder="blur"
                        blurDataURL={BLUR_PLACEHOLDER}
                      />
                    </div>
                  </div>
                )}
              />

              <div className="pointer-events-none absolute bottom-[max(14px,env(safe-area-inset-bottom))] left-1/2 z-30 -translate-x-1/2">
                <div className="pointer-events-auto inline-flex items-center gap-1 rounded-lg bg-white/70 px-3 py-2 text-[#2a2a2a] ">
                  <button
                    type="button"
                    onClick={() => {
                      if (!canGoPrev || selectedImageIndex === null) return;
                      setSelectedImageIndex(selectedImageIndex - 1);
                    }}
                    disabled={!canGoPrev}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-wedding-gray-dark transition hover:bg-black/5 disabled:opacity-35"
                    aria-label="이전 갤러리 사진 보기"
                  >
                    <Icon icon={ChevronLeft} size="sm" />
                  </button>
                  <span
                    className="min-w-[64px] text-center font-mono text-sm font-medium tabular-nums"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {selectedImageIndex + 1} / {section.images.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (!canGoNext || selectedImageIndex === null) return;
                      setSelectedImageIndex(selectedImageIndex + 1);
                    }}
                    disabled={!canGoNext}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-wedding-gray-dark transition hover:bg-black/5 disabled:opacity-35"
                    aria-label="다음 갤러리 사진 보기"
                  >
                    <Icon icon={ChevronRight} size="sm" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </ModalPortal>
      ) : null}
    </>
  );
}

/*
 * Legacy carousel gallery component kept commented for rollback/reference.
 *
 * "use client";
 *
 * import {
 *   useEffect,
 *   useMemo,
 *   useRef,
 *   useState,
 *   type PointerEvent as ReactPointerEvent,
 * } from "react";
 * import Image from "next/image";
 * import { AnimatePresence, motion } from "framer-motion";
 * import { ChevronLeft, ChevronRight } from "lucide-react";
 * import FadeInUp from "@/components/common/FadeInUp";
 * import Icon from "@/components/common/Icon";
 * import type { GallerySectionData } from "@/types";
 *
 * interface ImageGalleryProps {
 *   section: GallerySectionData;
 * }
 *
 * const SWIPE_THRESHOLD_PX = 40;
 *
 * export default function LegacyCarouselImageGallery({
 *   section,
 * }: ImageGalleryProps) {
 *   const imageCount = section.images.length;
 *   const [selectedIndex, setSelectedIndex] = useState(0);
 *   const [thumbnailPage, setThumbnailPage] = useState(0);
 *   const [transitionDirection, setTransitionDirection] = useState<1 | -1>(1);
 *   const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
 *   const hasImages = imageCount > 0;
 *   const thumbnailsPerPage = 6;
 *   const pageCount = useMemo(
 *     () => Math.max(1, Math.ceil(imageCount / thumbnailsPerPage)),
 *     [imageCount, thumbnailsPerPage],
 *   );
 *   const thumbnailStart = thumbnailPage * thumbnailsPerPage;
 *   const visibleThumbnails = section.images.slice(
 *     thumbnailStart,
 *     thumbnailStart + thumbnailsPerPage,
 *   );
 *
 *   useEffect(() => {
 *     if (typeof window === "undefined") return;
 *     const hiddenImages = section.images.slice(thumbnailsPerPage);
 *     hiddenImages.forEach((image) => {
 *       const preloader = new window.Image();
 *       preloader.decoding = "async";
 *       preloader.src = image.url;
 *     });
 *   }, [section.images, thumbnailsPerPage]);
 *
 *   useEffect(() => {
 *     if (imageCount === 0) {
 *       setSelectedIndex(0);
 *       setThumbnailPage(0);
 *       return;
 *     }
 *     const clampedPage = Math.min(thumbnailPage, pageCount - 1);
 *     if (clampedPage !== thumbnailPage) {
 *       setThumbnailPage(clampedPage);
 *       return;
 *     }
 *     const clampedIndex = Math.min(selectedIndex, imageCount - 1);
 *     if (clampedIndex !== selectedIndex) {
 *       setSelectedIndex(clampedIndex);
 *       setThumbnailPage(Math.floor(clampedIndex / thumbnailsPerPage));
 *       return;
 *     }
 *   }, [imageCount, pageCount, selectedIndex, thumbnailPage, thumbnailsPerPage]);
 *
 *   const selectImage = (nextIndex: number, direction: 1 | -1) => {
 *     if (!hasImages || nextIndex === selectedIndex) return;
 *     setTransitionDirection(direction);
 *     setSelectedIndex(nextIndex);
 *   };
 *
 *   const moveSelection = (direction: -1 | 1) => {
 *     if (!hasImages) return;
 *     const nextIndex = (selectedIndex + direction + imageCount) % imageCount;
 *     selectImage(nextIndex, direction);
 *
 *     const pageStart = thumbnailPage * thumbnailsPerPage;
 *     const pageEnd = pageStart + thumbnailsPerPage - 1;
 *     if (nextIndex < pageStart || nextIndex > pageEnd) {
 *       setThumbnailPage(Math.floor(nextIndex / thumbnailsPerPage));
 *     }
 *   };
 *
 *   const selectedImage = section.images[selectedIndex];
 *
 *   const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
 *     if (imageCount <= 1) return;
 *     event.currentTarget.setPointerCapture(event.pointerId);
 *     pointerStartRef.current = { x: event.clientX, y: event.clientY };
 *   };
 *
 *   const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
 *     if (imageCount <= 1 || !pointerStartRef.current) return;
 *
 *     const deltaX = event.clientX - pointerStartRef.current.x;
 *     const deltaY = event.clientY - pointerStartRef.current.y;
 *     pointerStartRef.current = null;
 *
 *     if (
 *       Math.abs(deltaX) >= SWIPE_THRESHOLD_PX &&
 *       Math.abs(deltaX) > Math.abs(deltaY)
 *     ) {
 *       moveSelection(deltaX > 0 ? -1 : 1);
 *     }
 *   };
 *
 *   const handlePointerCancel = () => {
 *     pointerStartRef.current = null;
 *   };
 *
 *   return (
 *     <section id="gallery" className="bg-white py-16">
 *       <div className="mx-auto flex w-full max-w-md flex-col">
 *         <FadeInUp className="mb-8 text-center">
 *           <p className="font-crimson text-sm uppercase tracking-[0.33em] text-wedding-brown">
 *             {section.kicker}
 *           </p>
 *           <h2 className="mt-3 text-xl tracking-[0.04em] text-wedding-gray-dark">
 *             {section.title}
 *           </h2>
 *         </FadeInUp>
 *
 *         {hasImages ? (
 *           <>
 *             <FadeInUp className="px-9" delay={0.1}>
 *               <div
 *                 className="relative overflow-hidden rounded-md bg-[#f5f5f5] touch-pan-y select-none"
 *                 onPointerDown={handlePointerDown}
 *                 onPointerUp={handlePointerEnd}
 *                 onPointerCancel={handlePointerCancel}
 *                 onDragStart={(event) => event.preventDefault()}
 *               >
 *                 <div className="relative w-full">
 *                   <AnimatePresence
 *                     initial={false}
 *                     custom={transitionDirection}
 *                     mode="wait"
 *                   >
 *                     <motion.div
 *                       key={selectedImage.id}
 *                       className="w-full"
 *                       custom={transitionDirection}
 *                       initial={{
 *                         x: transitionDirection > 0 ? 36 : -36,
 *                         opacity: 0,
 *                       }}
 *                       animate={{ x: 0, opacity: 1 }}
 *                       exit={{
 *                         x: transitionDirection > 0 ? -36 : 36,
 *                         opacity: 0,
 *                       }}
 *                       transition={{
 *                         duration: 0.26,
 *                         ease: [0.22, 1, 0.36, 1],
 *                       }}
 *                     >
 *                       <Image
 *                         src={selectedImage.url}
 *                         alt={selectedImage.alt}
 *                         width={selectedImage.width}
 *                         height={selectedImage.height}
 *                         draggable={false}
 *                         className="h-auto w-full object-contain"
 *                         sizes="(max-width: 425px) 100vw, 420px"
 *                         quality={100}
 *                         unoptimized
 *                         priority
 *                       />
 *                     </motion.div>
 *                   </AnimatePresence>
 *                 </div>
 *                 {imageCount > 1 ? (
 *                   <>
 *                     <button type="button" aria-label="이전 사진 보기">
 *                       <Icon icon={ChevronLeft} size="md" />
 *                     </button>
 *                     <button type="button" aria-label="다음 사진 보기">
 *                       <Icon icon={ChevronRight} size="md" />
 *                     </button>
 *                   </>
 *                 ) : null}
 *               </div>
 *             </FadeInUp>
 *
 *             <FadeInUp className="mt-4 px-9" delay={0.16}>
 *               <div
 *                 className="grid gap-2"
 *                 style={{
 *                   gridTemplateColumns: `repeat(${thumbnailsPerPage}, minmax(0, 1fr))`,
 *                 }}
 *               >
 *                 {visibleThumbnails.map((image, index) => {
 *                   const absoluteIndex = thumbnailStart + index;
 *                   const isActive = absoluteIndex === selectedIndex;
 *                   return (
 *                     <button
 *                       type="button"
 *                       key={image.id}
 *                       onClick={() =>
 *                         selectImage(
 *                           absoluteIndex,
 *                           absoluteIndex >= selectedIndex ? 1 : -1,
 *                         )
 *                       }
 *                       aria-label={`${image.alt} 선택`}
 *                       aria-current={isActive}
 *                     >
 *                       <Image src={image.url} alt={image.alt} fill />
 *                     </button>
 *                   );
 *                 })}
 *               </div>
 *             </FadeInUp>
 *           </>
 *         ) : null}
 *       </div>
 *     </section>
 *   );
 * }
 */
