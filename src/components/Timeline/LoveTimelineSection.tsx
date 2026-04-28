"use client";

import Image from "next/image";
import { BLUR_PLACEHOLDER } from "@/lib/image-placeholder";
import type { GalleryImage } from "@/types";

interface TimelineImage {
  url: string;
  alt: string;
}

interface TimelineItem {
  id: string;
  dateLabel: string;
  title: string;
  description: string[];
  imageSide: "left" | "right";
  imageIndex: number;
}

interface LoveTimelineSectionProps {
  images: GalleryImage[];
}

const FALLBACK_IMAGES: TimelineImage[] = [
  {
    url: "/images/gallery/wedding.png",
    alt: "신랑 신부의 추억 사진",
  },
  {
    url: "/images/placeholder-couple.svg",
    alt: "신랑 신부의 추억 사진",
  },
];

const TIMELINE_ITEMS: TimelineItem[] = [
  {
    id: "first-meet",
    dateLabel: "21년 3월 20일, 서울",
    title: "🏢 운명 같은 첫 만남",
    description: [
      "회사에서 처음 만나",
      "어느 순간 서로에게",
      "스며들었던 우리",
    ],
    imageSide: "left",
    imageIndex: 0,
  },
  {
    id: "dating-days",
    dateLabel: "연애 기간 1,877일",
    title: "💕 행복했던 5년",
    description: ["항상 웃음이 머물던", "여러 계절들의 우리"],
    imageSide: "right",
    imageIndex: 1,
  },
  {
    id: "proposal",
    dateLabel: "24년 9월 17일, 일본",
    title: "💍 프로포즈",
    description: ["눈물과 함께한", "깜짝 프로포즈.", "대답은 당연히 “YES!”"],
    imageSide: "left",
    imageIndex: 2,
  },
  {
    id: "wedding-day",
    dateLabel: "26년 5월 9일, 춘천",
    title: "👰‍♀️🤵 웨딩데이",
    description: ["저희 둘이 드디어", "결혼합니다"],
    imageSide: "right",
    imageIndex: 3,
  },
];

const dateBadgeClassName =
  "inline-flex max-w-[calc(100%+28px)] whitespace-nowrap rounded-full bg-[#d8c7aa] px-4 py-3 text-xs font-semibold leading-none text-white shadow-[0_4px_12px_rgba(103,76,48,0.12)]";

function getTimelineImage(
  images: GalleryImage[],
  index: number,
): TimelineImage {
  if (images.length > 0) {
    const image = images[index % images.length] ?? images[0];
    return {
      url: image.url,
      alt: image.alt,
    };
  }

  return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
}

function TimelinePhoto({ image }: { image: TimelineImage }) {
  return (
    <div className="relative aspect-[1/1.1] w-full overflow-hidden rounded-2xl bg-wedding-brown/10">
      <Image
        src={image.url}
        alt={image.alt}
        fill
        className="object-cover object-center"
        sizes="(max-width: 425px) 42vw, 178px"
        quality={92}
        placeholder="blur"
        blurDataURL={BLUR_PLACEHOLDER}
      />
    </div>
  );
}

function TimelineText({ item }: { item: TimelineItem }) {
  return (
    <div>
      <p className="text-sm font-semibold leading-7 text-wedding-gray-dark">
        {item.title}
      </p>
      <div className="mt-3 text-xs leading-6 text-wedding-gray-light">
        {item.description.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  );
}

function TimelineCopy({
  item,
  align,
}: {
  item: TimelineItem;
  align: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      <div
        className={
          align === "right" ? "flex justify-end" : "flex justify-start"
        }
      >
        <span className={dateBadgeClassName}>{item.dateLabel}</span>
      </div>
      <div className="mt-4">
        <TimelineText item={item} />
      </div>
    </div>
  );
}

export default function LoveTimelineSection({
  images,
}: LoveTimelineSectionProps) {
  return (
    <section
      aria-label="두 사람의 추억 타임라인"
      className="overflow-hidden bg-white px-6 pb-4 pt-16"
    >
      <div className="mb-8 text-center">
        <p className="font-crimson text-sm uppercase tracking-[0.33em] text-wedding-brown">
          OUR TIMELINE
        </p>

        <p className="mt-2 text-xs leading-8 text-wedding-gray">
          저희 연애의 타임라인입니다
        </p>
      </div>

      <div className="relative mx-auto">
        {TIMELINE_ITEMS.map((item, index) => {
          const image = getTimelineImage(images, item.imageIndex);
          const isImageLeft = item.imageSide === "left";
          const isLastItem = index === TIMELINE_ITEMS.length - 1;

          return (
            <div
              key={item.id}
              className="relative grid h-[280px] grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-x-14"
            >
              <span
                aria-hidden
                className={`absolute left-1/2 top-0 w-px -translate-x-1/2 bg-wedding-brown/15 ${
                  isLastItem ? "" : "h-full"
                }`}
                style={
                  isLastItem
                    ? {
                        height: "calc(((min(100vw, 425px) - 104px) / 2) * 1.1)",
                      }
                    : undefined
                }
              />

              <span
                aria-hidden
                className="absolute left-1/2 top-[9px] z-10 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full bg-white"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-[#d8c7aa]" />
              </span>

              <div className="min-w-0">
                {isImageLeft ? (
                  <TimelinePhoto image={image} />
                ) : (
                  <TimelineCopy item={item} align="right" />
                )}
              </div>

              <div className="min-w-0">
                {isImageLeft ? (
                  <TimelineCopy item={item} align="left" />
                ) : (
                  <TimelinePhoto image={image} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
