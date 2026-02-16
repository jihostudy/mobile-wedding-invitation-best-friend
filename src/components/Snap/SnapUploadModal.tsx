"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Upload, X } from "lucide-react";
import Icon from "@/components/common/Icon";
import Carousel from "@/components/common/Carousel";
import ModalPortal from "@/components/common/ModalPortal";
import useToast from "@/components/common/toast/useToast";
import useModalLayer from "@/hooks/useModalLayer";
import { useCreateSnapSubmissionMutation } from "@/lib/queries/snap";
import type { SnapUploadModalData } from "@/types";

interface SnapUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: SnapUploadModalData;
}

interface SelectedImage {
  id: string;
  file: File;
  previewUrl: string;
}

export default function SnapUploadModal({
  isOpen,
  onClose,
  section,
}: SnapUploadModalProps) {
  const toast = useToast();
  const createSnapSubmissionMutation = useCreateSnapSubmissionMutation();
  const [name, setName] = useState("");
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<SelectedImage[]>([]);

  useModalLayer({
    active: isOpen,
    onEscape: () => {
      if (previewIndex !== null) {
        setPreviewIndex(null);
        return;
      }
      onClose();
    },
  });

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, []);

  const remainingCount = useMemo(
    () => Math.max(section.maxFiles - images.length, 0),
    [section.maxFiles, images.length],
  );
  const canGoPrev = previewIndex !== null && previewIndex > 0;
  const canGoNext =
    previewIndex !== null &&
    images.length > 0 &&
    previewIndex < images.length - 1;

  if (!isOpen) return null;

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const result = await createSnapSubmissionMutation
        .mutateAsync({
          uploaderName: name,
          files: images.map((item) => item.file),
          eventSlug: "main",
        })
        .then(() => ({ success: true as const }))
        .catch((error: unknown) => ({
          success: false as const,
          error:
            error instanceof Error ? error.message : "업로드에 실패했습니다.",
        }));

      if (!result.success) {
        setSubmitError(result.error || "업로드에 실패했습니다.");
        return;
      }

      images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      setName("");
      setImages([]);
      setPreviewIndex(null);
      toast.success("업로드되었습니다");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (selectedFiles.length === 0) return;

    setImages((prev) => {
      const available = section.maxFiles - prev.length;
      const acceptedFiles = selectedFiles.slice(0, Math.max(available, 0));
      const created = acceptedFiles.map((file, index) => ({
        id: `${file.name}-${file.lastModified}-${Date.now()}-${index}`,
        file,
        previewUrl: URL.createObjectURL(file),
      }));

      if (selectedFiles.length > acceptedFiles.length) {
        alert(`최대 ${section.maxFiles}장까지 업로드할 수 있습니다.`);
      }

      return [...prev, ...created];
    });

    event.target.value = "";
  };

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[10000] overflow-hidden overscroll-none bg-black/45 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          className="absolute inset-0 h-full w-full"
          onClick={onClose}
          aria-label="스냅 업로드 모달 닫기"
        />
        <div
          className="modal-scrollbar relative z-10 mx-auto h-full w-full max-w-[430px] overflow-y-auto overscroll-contain bg-white px-4 py-5"
          onClick={(event) => event.stopPropagation()}
        >
        <button
          type="button"
          onClick={onClose}
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-[#2f2f2f]"
          aria-label="스냅 업로드 모달 닫기"
        >
          <Icon icon={ChevronLeft} size="sm" />
          <span>{section.backLabel}</span>
        </button>

        <div className="relative h-[325px] overflow-hidden rounded-[14px]">
          <Image
            src={section.coverImage.url}
            alt={section.coverImage.alt}
            fill
            className="object-cover"
            sizes="(max-width: 425px) 100vw, 425px"
          />
        </div>

        <div className="mt-4 rounded-[14px]  px-4 py-5 text-[#1f1f1f]">
          <p className="text-[17px] font-semibold">{section.guideTitle}</p>
          <div className="mt-4 space-y-1">
            {section.guideLines.map((line) => (
              <p key={line} className="text-sm leading-7 mt-0">
                {line}
              </p>
            ))}
          </div>
          <div className="mt-5 space-y-1">
            {section.guideHighlightLines.map((line) => (
              <p key={line} className="text-sm leading-7">
                {line}
              </p>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <label
            htmlFor="snap-uploader-name"
            className="text-[15px] font-semibold text-[#2f2f2f]"
          >
            {section.nameLabel}
          </label>
          <input
            id="snap-uploader-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={section.namePlaceholder}
            className="mt-2 h-12 w-full rounded-[10px] border border-transparent bg-wedding-beige-dark px-4 text-[15px] text-[#3a3a3a] placeholder:text-[#bababa] focus:outline-none text-sm"
          />
        </div>

        <div className="mt-4 rounded-[12px]">
          {images.length === 0 ? (
            <div className="flex h-[240px] flex-col items-center justify-center rounded-[10px] border border-[#d6d6d6] ">
              <Icon icon={Upload} size="lg" className="text-[#8c8c8c]" />
              <p className="mt-4 text-center text-[14px] text-[#8c8c8c]">
                {section.uploadEmptyHint}
              </p>
              <button
                type="button"
                onClick={openFilePicker}
                className="mt-4 rounded-full bg-[#f4da30] px-6 py-3 text-sm font-medium text-[#2a2a2a]"
              >
                {section.attachButtonLabel}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="relative h-[88px] w-[88px] overflow-hidden rounded-[8px] border border-[#d0d0d0] bg-white"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        const index = images.findIndex(
                          (item) => item.id === image.id,
                        );
                        setPreviewIndex(index >= 0 ? index : 0);
                      }}
                      className="relative h-full w-full"
                      aria-label={`${image.file.name} 크게 보기`}
                    >
                      <Image
                        src={image.previewUrl}
                        alt={image.file.name}
                        fill
                        className="object-cover"
                        sizes="88px"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeImage(image.id);
                      }}
                      className="absolute right-1 top-1 rounded-full bg-black/50 p-0.5 text-white"
                      aria-label={`${image.file.name} 삭제`}
                    >
                      <Icon icon={X} size="sm" />
                    </button>
                  </div>
                ))}

                {remainingCount > 0 && (
                  <button
                    type="button"
                    onClick={openFilePicker}
                    className="flex h-[88px] w-[88px] items-center justify-center rounded-[8px] border border-[#cfcfcf] bg-[#ececec] text-[#888888]"
                    aria-label="사진 추가 첨부"
                  >
                    <span className="text-2xl">+</span>
                  </button>
                )}
              </div>
              {/* <button
                type="button"
                onClick={openFilePicker}
                className="rounded-full bg-[#f4da30] px-5 py-2 text-[15px] font-medium text-[#2a2a2a]"
                disabled={remainingCount === 0}
              >
                {section.attachButtonLabel}
              </button> */}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFiles}
          />
        </div>

        <p className="mt-3 text-right text-[13px] text-[#7f7f7f]">
          {images.length}/{section.maxFiles}장 업로드
        </p>

        {submitError && (
          <p className="mt-3 text-sm text-[#d62020]">{submitError}</p>
        )}

        <div className="mt-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              isSubmitting || images.length === 0 || name.trim().length === 0
            }
            className={`h-12 w-full rounded-[10px] text-sm font-semibold ${
              isSubmitting || images.length === 0 || name.trim().length === 0
                ? "bg-wedding-beige-dark text-[#b1b1b1]"
                : "bg-wedding-brown text-white"
            }`}
          >
            {isSubmitting ? "업로드 중..." : "업로드"}
          </button>
        </div>

        <div className="mt-6 space-y-0 pb-8">
          {section.policyLines.map((line, index) => (
            <p
              key={`${line}-${index}`}
              className="text-sm leading-7 text-[#8a8a8a]"
            >
              {line.startsWith("⚠️") || line.endsWith(":") ? line : `· ${line}`}
            </p>
          ))}
        </div>
      </div>

        {previewIndex !== null && images.length > 0 && (
          <div
            className="fixed inset-0 z-[10010] bg-white"
            role="dialog"
            aria-modal="true"
          >
            <div className="relative mx-auto h-[100dvh] w-full max-w-[430px]">
            <button
              type="button"
              onClick={() => setPreviewIndex(null)}
              className="absolute right-2 top-2 z-20 rounded-full bg-white/60 p-2 text-black"
              aria-label="사진 미리보기 닫기"
            >
              <Icon icon={X} size="md" />
            </button>

            <Carousel
              items={images}
              index={previewIndex}
              initialIndex={previewIndex}
              onIndexChange={(index) => setPreviewIndex(index)}
              getItemKey={(item) => item.id}
              className="h-[100dvh]"
              viewportClassName="h-[100dvh]"
              slideClassName="h-[100dvh]"
              showDots={false}
              showArrows={false}
              loop={false}
              prevAriaLabel="이전 업로드 사진 보기"
              nextAriaLabel="다음 업로드 사진 보기"
              renderItem={(item) => (
                <div className="flex h-[100dvh] w-full items-center justify-center bg-white">
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="max-h-[100dvh] max-w-full object-contain object-center"
                    draggable={false}
                  />
                </div>
              )}
            />

            {images.length > 0 && (
              <div className="pointer-events-none absolute bottom-[max(12px,env(safe-area-inset-bottom))] left-1/2 z-20 -translate-x-1/2">
                <div className="pointer-events-auto inline-flex gap-1 items-center rounded-lg bg-white/60 px-3 py-2 text-[13px] text-[#2a2a2a] backdrop-blur">
                  <button
                    type="button"
                    onClick={() => {
                      if (!canGoPrev || previewIndex === null) return;
                      setPreviewIndex(previewIndex - 1);
                    }}
                    disabled={!canGoPrev}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full text-wedding-gray-dark disabled:opacity-35"
                    aria-label="이전 업로드 사진 보기"
                  >
                    <Icon icon={ChevronLeft} size="sm" />
                  </button>
                  <span className="min-w-[56px] text-center font-medium text-sm tabular-nums font-mono">
                    {previewIndex + 1} / {images.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (!canGoNext || previewIndex === null) return;
                      setPreviewIndex(previewIndex + 1);
                    }}
                    disabled={!canGoNext}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full text-wedding-gray-dark disabled:opacity-35"
                    aria-label="다음 업로드 사진 보기"
                  >
                    <Icon icon={ChevronRight} size="sm" />
                  </button>
                </div>
              </div>
            )}
            </div>
          </div>
        )}
      </div>
    </ModalPortal>
  );
}
