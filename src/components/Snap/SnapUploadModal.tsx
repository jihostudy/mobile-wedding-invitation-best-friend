"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Upload, X } from "lucide-react";
import Icon from "@/components/common/Icon";
import Carousel from "@/components/common/Carousel";
import ModalPortal from "@/components/common/ModalPortal";
import useToast from "@/components/common/toast/useToast";
import useModalLayer from "@/hooks/useModalLayer";
import { ApiError } from "@/lib/api/client";
import { useCreateSnapSubmissionMutation } from "@/lib/queries/snap";
import type { SnapUploadModalData } from "@/types";

interface SnapUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: SnapUploadModalData;
  uploadOpenAt?: string;
}

interface SelectedImage {
  id: string;
  file: File;
  previewUrl: string;
}

const SNAP_COVER_IMAGE_ALT = "스냅 업로드 커버 이미지";
const SNAP_NAME_LABEL = "이름";
const SNAP_NAME_PLACEHOLDER = "이름을 입력해 주세요.";

export default function SnapUploadModal({
  isOpen,
  onClose,
  section,
  uploadOpenAt,
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
      imagesRef.current.forEach((image) =>
        URL.revokeObjectURL(image.previewUrl),
      );
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
  const noticeText = [
    ...section.guideLines,
    ...section.guideHighlightLines,
    ...section.policyLines,
  ].join("\n");
  const noticeLines = [
    `한 번에 최대 ${section.maxFiles}장까지 업로드하실 수 있습니다.`,
    "가능하면 여러 장을 한 번에 묶어서 업로드해 주세요.",
    "파일 크기는 사진 1장당 10MB 이하입니다.",
    "예식 당일부터 다음날까지 업로드 가능합니다.",
  ];

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

    if (uploadOpenAt) {
      const uploadOpenDate = new Date(uploadOpenAt);
      if (
        !Number.isNaN(uploadOpenDate.getTime()) &&
        Date.now() < uploadOpenDate.getTime()
      ) {
        toast.error("아직 스냅 업로드 시간이 아니에요.");
        return;
      }
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      await createSnapSubmissionMutation.mutateAsync({
        uploaderName: name,
        files: images.map((item) => item.file),
        eventSlug: "main",
      });

      images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      setName("");
      setImages([]);
      setPreviewIndex(null);
      toast.success("업로드되었습니다");
      onClose();
    } catch (error) {
      if (error instanceof ApiError && error.code === "SNAP_UPLOAD_NOT_OPEN") {
        toast.error("아직 스냅 업로드 시간이 아니에요.");
        setSubmitError("아직 스냅 업로드 시간이 아니에요.");
      } else {
        const message =
          error instanceof Error ? error.message : "업로드에 실패했습니다.";
        setSubmitError(message);
      }
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
      <motion.div
        className="fixed inset-0 z-[10000] overflow-hidden overscroll-none bg-black/45 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <button
          type="button"
          className="absolute inset-0 h-full w-full"
          onClick={onClose}
          aria-label="스냅 업로드 모달 닫기"
        />
        <motion.div
          className="modal-scrollbar relative z-10 mx-auto h-full w-full max-w-[430px] overflow-y-auto overscroll-contain bg-white px-4 py-5"
          onClick={(event) => event.stopPropagation()}
          initial={{ y: 20, opacity: 0.82 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-2 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 text-[#222222] hover:bg-black/5"
              aria-label="스냅 업로드 모달 닫기"
            >
              <Icon icon={X} size="lg" />
            </button>
          </div>

          <div className="group relative mx-auto w-full rounded-[22px] bg-gradient-to-br from-[#f8eee0] via-[#ffffff] to-[#efe2d0] p-[1.5px] shadow-[0_18px_34px_rgba(58,41,23,0.15)]">
            <div className="relative overflow-hidden rounded-[20px] bg-white">
              <img
                src={section.coverImage.url}
                alt={SNAP_COVER_IMAGE_ALT}
                className="block h-auto w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.012]"
                loading="eager"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/[0.07] via-transparent to-white/[0.14]" />
            </div>
          </div>

          <div className="mt-4 rounded-[14px]  px-4 py-5 text-[#1f1f1f]">
            <p className="text-[17px] font-semibold">{section.guideTitle}</p>
            {noticeText.length > 0 ? (
              <p className="mt-4 whitespace-pre-line text-sm leading-7">
                {noticeText}
              </p>
            ) : null}
          </div>

          <div className="mt-8">
            <label
              htmlFor="snap-uploader-name"
              className="text-[15px] font-semibold text-[#2f2f2f]"
            >
              {SNAP_NAME_LABEL}
            </label>
            <input
              id="snap-uploader-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={SNAP_NAME_PLACEHOLDER}
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
                        <img
                          src={image.previewUrl}
                          alt={image.file.name}
                          className="h-full w-full object-cover object-center"
                          loading="eager"
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

          {noticeLines.length > 0 ? (
            <ul className="mt-5 space-y-1 px-4 text-sm leading-7 text-[#757575]">
              {noticeLines.map((line, index) => (
                <li key={`${line}-${index}`} className="flex gap-2">
                  <span aria-hidden="true" className="pt-[2px]">
                    •
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="pb-8" />
        </motion.div>

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
      </motion.div>
    </ModalPortal>
  );
}
