"use client";

import Image from "next/image";
import { BLUR_PLACEHOLDER } from "@/lib/image-placeholder";
import type {
  ImageAsset,
  TimelineItemData,
  TimelineSectionData,
} from "@/types";

interface LoveTimelineSectionProps {
  section: TimelineSectionData;
}

const dateBadgeClassName =
  "inline-flex max-w-[calc(100%+28px)] whitespace-nowrap rounded-full bg-[#d8c7aa] px-5 py-3 text-xs font-semibold leading-none text-white shadow-[0_4px_12px_rgba(103,76,48,0.12)]";

function TimelinePhoto({ image }: { image: ImageAsset }) {
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

function TimelineText({ item }: { item: TimelineItemData }) {
  const bodyLines = item.body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div>
      <p className="inline-flex items-center gap-1.5 text-sm font-semibold leading-7 text-wedding-gray-dark">
        {item.bodyEmoji ? (
          <span className="inline-flex h-5 items-center leading-none">
            {item.bodyEmoji}
          </span>
        ) : null}
        <span>{item.bodyTitle}</span>
      </p>
      <div className="mt-3 text-[13px] leading-6 text-wedding-gray-light">
        {bodyLines.map((line) => (
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
  item: TimelineItemData;
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
  section,
}: LoveTimelineSectionProps) {
  return (
    <section
      aria-label="두 사람의 추억 타임라인"
      className="overflow-hidden bg-white px-6 pb-4 pt-12"
    >
      <div className="mb-8 text-center">
        <p className="font-crimson text-sm uppercase tracking-[0.33em] text-wedding-brown">
          {section.kicker}
        </p>

        <p className="mt-2 text-xs leading-8 text-wedding-gray">
          {section.description}
        </p>
      </div>

      <div className="relative mx-auto">
        {section.items.map((item, index) => {
          const isImageLeft = index % 2 === 0;
          const isLastItem = index === section.items.length - 1;

          return (
            <div
              key={item.id}
              className="relative grid h-[240px] grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-x-14"
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
                  <TimelinePhoto image={item.image} />
                ) : (
                  <TimelineCopy item={item} align="right" />
                )}
              </div>

              <div className="min-w-0">
                {isImageLeft ? (
                  <TimelineCopy item={item} align="left" />
                ) : (
                  <TimelinePhoto image={item.image} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
