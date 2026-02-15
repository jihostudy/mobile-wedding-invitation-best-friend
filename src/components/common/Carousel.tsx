"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Icon from "@/components/common/Icon";

export interface CarouselRenderItemParams {
  index: number;
  isActive: boolean;
}

export interface CarouselProps<T> {
  items: T[];
  renderItem: (item: T, params: CarouselRenderItemParams) => ReactNode;
  getItemKey?: (item: T, index: number) => string | number;
  initialIndex?: number;
  loop?: boolean;
  showArrows?: boolean;
  showDots?: boolean;
  keyboard?: boolean;
  swipe?: boolean;
  onIndexChange?: (index: number) => void;
  className?: string;
  viewportClassName?: string;
  slideClassName?: string;
  prevAriaLabel?: string;
  nextAriaLabel?: string;
}

const SWIPE_THRESHOLD_PX = 40;

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

function clampIndex(index: number, length: number) {
  if (length <= 0) {
    return 0;
  }
  if (index < 0) {
    return 0;
  }
  if (index >= length) {
    return length - 1;
  }
  return index;
}

export default function Carousel<T>({
  items,
  renderItem,
  getItemKey,
  initialIndex = 0,
  loop = true,
  showArrows = true,
  showDots = true,
  keyboard = true,
  swipe = true,
  onIndexChange,
  className,
  viewportClassName,
  slideClassName,
  prevAriaLabel = "이전 슬라이드",
  nextAriaLabel = "다음 슬라이드",
}: CarouselProps<T>) {
  const itemCount = items.length;

  const [currentIndex, setCurrentIndex] = useState(() =>
    clampIndex(initialIndex, itemCount),
  );

  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  const normalizeIndex = useCallback(
    (index: number) => {
      if (itemCount <= 0) {
        return 0;
      }
      if (loop) {
        return ((index % itemCount) + itemCount) % itemCount;
      }
      return clampIndex(index, itemCount);
    },
    [itemCount, loop],
  );

  const goTo = useCallback(
    (nextIndex: number) => {
      const resolved = normalizeIndex(nextIndex);
      setCurrentIndex((prev) => {
        if (prev === resolved) {
          return prev;
        }
        onIndexChange?.(resolved);
        return resolved;
      });
    },
    [normalizeIndex, onIndexChange],
  );

  const next = useCallback(() => {
    goTo(currentIndex + 1);
  }, [currentIndex, goTo]);

  const prev = useCallback(() => {
    goTo(currentIndex - 1);
  }, [currentIndex, goTo]);

  useEffect(() => {
    if (itemCount === 0) {
      return;
    }
    setCurrentIndex((prev) => normalizeIndex(prev));
  }, [itemCount, normalizeIndex]);

  const isAtStart = currentIndex <= 0;
  const isAtEnd = currentIndex >= itemCount - 1;
  const disablePrev = itemCount <= 1 || (!loop && isAtStart);
  const disableNext = itemCount <= 1 || (!loop && isAtEnd);

  const trackStyle = useMemo(
    () => ({ transform: `translateX(-${currentIndex * 100}%)` }),
    [currentIndex],
  );

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!keyboard || itemCount <= 1) {
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      prev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      next();
    }
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!swipe || itemCount <= 1) {
      return;
    }
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!swipe || itemCount <= 1 || !pointerStartRef.current) {
      return;
    }
    const deltaX = event.clientX - pointerStartRef.current.x;
    const deltaY = event.clientY - pointerStartRef.current.y;
    pointerStartRef.current = null;

    if (
      Math.abs(deltaX) >= SWIPE_THRESHOLD_PX &&
      Math.abs(deltaX) > Math.abs(deltaY)
    ) {
      if (deltaX > 0) {
        prev();
      } else {
        next();
      }
    }
  };

  const handlePointerCancel = () => {
    pointerStartRef.current = null;
  };

  if (itemCount === 0) {
    return null;
  }

  return (
    <div
      className={cx("relative w-full", className)}
      role="region"
      aria-roledescription="carousel"
      tabIndex={keyboard ? 0 : -1}
      onKeyDown={handleKeyDown}
    >
      <div
        className={cx(
          "overflow-hidden touch-pan-y",
          swipe ? "cursor-grab active:cursor-grabbing" : undefined,
          viewportClassName,
        )}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerCancel}
      >
        <div
          className="flex transition-transform duration-300 ease-out"
          style={trackStyle}
        >
          {items.map((item, index) => (
            <div
              key={getItemKey ? getItemKey(item, index) : index}
              className={cx("min-w-full", slideClassName)}
            >
              {renderItem(item, { index, isActive: index === currentIndex })}
            </div>
          ))}
        </div>
      </div>

      {showArrows && (
        <>
          <button
            type="button"
            onClick={prev}
            disabled={disablePrev}
            aria-label={prevAriaLabel}
            className="absolute left-0 top-1/2 z-10 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-wedding-brown shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Icon icon={ChevronLeft} size="sm" />
          </button>
          <button
            type="button"
            onClick={next}
            disabled={disableNext}
            aria-label={nextAriaLabel}
            className="absolute right-0 top-1/2 z-10 flex h-8 w-8 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-wedding-brown shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Icon icon={ChevronRight} size="sm" />
          </button>
        </>
      )}

      {showDots && itemCount > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`${index + 1}번째 슬라이드로 이동`}
              aria-current={index === currentIndex}
              className={cx(
                "h-2 rounded-full transition-all",
                index === currentIndex
                  ? "w-5 bg-wedding-brown"
                  : "w-2 bg-wedding-brown/30",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
