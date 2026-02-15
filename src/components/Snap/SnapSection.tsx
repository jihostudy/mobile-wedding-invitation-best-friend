"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import Icon from "@/components/common/Icon";
import SnapUploadModal from "@/components/Snap/SnapUploadModal";
import type { SnapSectionData } from "@/types";

interface SnapSectionProps {
  section: SnapSectionData;
}

export default function SnapSection({ section }: SnapSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const previewImages = section.images.slice(0, 3);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      sectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  return (
    <section
      ref={sectionRef}
      className="mt-12 rounded-[18px] bg-white px-6 py-12"
    >
      <div className="mx-auto w-full max-w-md text-center">
        <div
          className="relative mx-auto h-[230px] w-full max-w-[320px]"
          onMouseEnter={() => setIsCardHovered(true)}
          onMouseLeave={() => setIsCardHovered(false)}
        >
          {previewImages.map((image, index) => {
            const zIndex = index === 1 ? 20 : 10;
            const hoverOffsetX = index === 0 ? -22 : index === 2 ? 20 : 0;
            const hoverOffsetY = index === 0 ? -18 : index === 1 ? -18 : -14;
            return (
              <div
                key={image.id}
                className="absolute left-1/2 top-1/2 h-[200px] w-[160px] -translate-y-1/2 overflow-hidden rounded-[22px] border-[10px] border-white bg-white shadow-[0_8px_18px_rgba(0,0,0,0.14)] transition-transform duration-500 ease-out"
                style={{
                  transform: `translate(-50%, -50%) translateX(${image.offsetX + (isCardHovered ? hoverOffsetX : 0)}px) translateY(${isCardHovered ? hoverOffsetY : 0}px) rotate(${image.rotation}deg)`,
                  zIndex,
                }}
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  sizes="160px"
                />
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
        <p className="mt-8 whitespace-pre-line text-[15px] leading-8 text-wedding-gray">
          {section.description}
        </p>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="mt-8 inline-flex  items-center justify-center gap-2 rounded-[12px] border border-wedding-brown/25 bg-white/70 px-9 py-3 text-sm font-medium text-wedding-brown transition hover:bg-white"
          aria-label="사진 업로드 모달 열기"
        >
          <Icon icon={Camera} size="sm" className="text-wedding-brown" />
          {section.buttonLabel}
        </button>

        <p className="mt-6 text-sm leading-[1.5]">
          <span className="text-[#a2a2a2]">{section.availableFromLabel} </span>
          <span className="text-[#b0b0b0]">{section.availableHintLabel}</span>
        </p>
      </div>
      <SnapUploadModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        section={section.modal}
      />
    </section>
  );
}
