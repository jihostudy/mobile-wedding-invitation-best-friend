"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import FadeInUp from "@/components/common/FadeInUp";
import Icon from "@/components/common/Icon";
import FireflyOverlay from "@/components/Snap/FireflyOverlay";
import SnapUploadModal from "@/components/Snap/SnapUploadModal";
import type { SnapSectionData } from "@/types";

interface SnapSectionProps {
  section: SnapSectionData;
}

function formatUploadOpenAtLabel(uploadOpenAt: string) {
  const parsed = new Date(uploadOpenAt);
  if (Number.isNaN(parsed.getTime())) return "업로드 시간이 설정되지 않았습니다.";
  const hour = String(parsed.getHours()).padStart(2, "0");
  const minute = String(parsed.getMinutes()).padStart(2, "0");
  return `예식 당일 ${hour}:${minute}부터 업로드 가능합니다.`;
}

export default function SnapSection({ section }: SnapSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasEnteredViewport, setHasEnteredViewport] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const previewImages = section.images.slice(0, 3);

  useEffect(() => {
    if (hasEnteredViewport || !sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          setHasEnteredViewport(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [hasEnteredViewport]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <section
      ref={sectionRef}
      className="mt-12 rounded-[18px] bg-white px-6 py-12"
    >
      <FadeInUp className="mx-auto w-full max-w-md text-center">
        <div className="relative mx-auto h-[230px] w-full max-w-[320px]">
          {previewImages.map((image, index) => {
            const zIndex = index === 1 ? 20 : 10;
            const entryOffsetX = !hasEnteredViewport
              ? index === 0
                ? -76
                : index === 2
                  ? 76
                  : 0
              : 0;
            const entryOffsetY = !hasEnteredViewport ? 20 : 0;
            const baseX = image.offsetX;
            const floatX = index === 0 ? -7 : index === 2 ? 7 : 4;
            const floatY = index === 1 ? 7 : 10;
            const floatRotate = index === 1 ? 1.4 : 1;

            return (
              <div
                key={image.id}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                  zIndex,
                }}
              >
                <motion.div
                  className="relative h-[200px] w-[160px] overflow-hidden rounded-[22px] border-[10px] border-white bg-white shadow-[0_8px_18px_rgba(0,0,0,0.14)]"
                  initial={{
                    opacity: 0,
                    x: baseX + entryOffsetX,
                    y: entryOffsetY,
                    rotate: image.rotation,
                  }}
                  animate={
                    hasEnteredViewport
                      ? {
                          opacity: 1,
                          x: [baseX, baseX + floatX, baseX, baseX - floatX, baseX],
                          y: [0, -floatY, 0, floatY, 0],
                          rotate: [
                            image.rotation,
                            image.rotation + floatRotate,
                            image.rotation,
                            image.rotation - floatRotate,
                            image.rotation,
                          ],
                        }
                      : {
                          opacity: 0,
                          x: baseX + entryOffsetX,
                          y: entryOffsetY,
                          rotate: image.rotation,
                        }
                  }
                  transition={{
                    opacity: {
                      duration: 0.5,
                      delay: index * 0.12,
                    },
                    x: {
                      duration: 6.5,
                      ease: "easeInOut",
                      delay: index * 0.15,
                      repeat: Infinity,
                    },
                    y: {
                      duration: 5.8,
                      ease: "easeInOut",
                      delay: index * 0.18,
                      repeat: Infinity,
                    },
                    rotate: {
                      duration: 7.2,
                      ease: "easeInOut",
                      delay: index * 0.16,
                      repeat: Infinity,
                    },
                  }}
                >
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                  {index === 1 ? <FireflyOverlay /> : null}
                </motion.div>
              </div>
            );
          })}
        </div>

        <p className="mt-9 font-crimson text-sm uppercase tracking-[0.33em] text-wedding-brown">
          {section.kicker}
        </p>
        <h3 className="mt-3 text-xl tracking-[0.04em] text-wedding-gray-dark">
          {section.title}
        </h3>
        <p className="mt-8 whitespace-pre-line break-keep text-[14px] leading-8 text-wedding-gray sm:text-[15px]">
          {section.description}
        </p>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-[12px] border border-wedding-brown/25 bg-white/70 px-9 py-3 text-sm font-medium text-wedding-brown transition hover:bg-white"
          aria-label="사진 업로드 모달 열기"
        >
          <Icon icon={Camera} size="sm" className="text-wedding-brown" />
          사진 업로드
        </button>

        <p className="mt-6 text-sm leading-[1.5]">
          <span className="text-[#a2a2a2]">{formatUploadOpenAtLabel(section.uploadOpenAt)}</span>
        </p>
      </FadeInUp>
      <SnapUploadModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        section={section.modal}
        uploadOpenAt={section.uploadOpenAt}
      />
    </section>
  );
}
