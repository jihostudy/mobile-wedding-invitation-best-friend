"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import Icon from "@/components/common/Icon";
import ModalPortal from "@/components/common/ModalPortal";
import useModalLayer from "@/hooks/useModalLayer";
import type { GuestMessageInput } from "@/types";

interface GuestbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    payload: GuestMessageInput,
  ) => Promise<{ success: boolean; error?: string }>;
}

export default function GuestbookModal({
  isOpen,
  onClose,
  onSubmit,
}: GuestbookModalProps) {
  const [formData, setFormData] = useState<GuestMessageInput>({
    author: "",
    message: "",
    isPublic: true,
  });
  const [visualViewportHeight, setVisualViewportHeight] = useState("100dvh");
  const [visualViewportTop, setVisualViewportTop] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const canSubmit =
    formData.author.trim().length > 0 && formData.message.trim().length > 0;

  useModalLayer({
    active: isOpen,
    onEscape: onClose,
  });

  useEffect(() => {
    if (!isOpen) {
      setFormData({ author: "", message: "", isPublic: true });
      setErrorMessage("");
      setVisualViewportHeight("100dvh");
      setVisualViewportTop(0);
      return;
    }

    closeButtonRef.current?.focus({ preventScroll: true });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const viewport = window.visualViewport;
    const syncVisualViewport = () => {
      setVisualViewportHeight(
        `${Math.round(viewport?.height ?? window.innerHeight)}px`,
      );
      setVisualViewportTop(Math.round(viewport?.offsetTop ?? 0));
    };

    syncVisualViewport();
    viewport?.addEventListener("resize", syncVisualViewport);
    viewport?.addEventListener("scroll", syncVisualViewport);
    window.addEventListener("resize", syncVisualViewport);

    return () => {
      viewport?.removeEventListener("resize", syncVisualViewport);
      viewport?.removeEventListener("scroll", syncVisualViewport);
      window.removeEventListener("resize", syncVisualViewport);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage("");

    if (!formData.author.trim()) {
      setErrorMessage("이름 또는 닉네임을 입력해주세요.");
      return;
    }
    if (!formData.message.trim()) {
      setErrorMessage("메시지를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    const result = await onSubmit(formData);
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error || "오류가 발생했습니다.");
      return;
    }

    onClose();
  };

  return (
    <ModalPortal>
      <motion.div
        className="fixed inset-x-0 top-0 z-[10000] overflow-hidden overscroll-none"
        style={{
          height: visualViewportHeight,
          transform: `translateY(${visualViewportTop}px)`,
        }}
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <button
          type="button"
          className="absolute inset-0 h-full w-full bg-black/65 backdrop-blur-sm"
          onClick={onClose}
          aria-label="방명록 모달 배경 닫기"
        />
        <div className="relative z-10 flex h-full w-full items-center justify-center p-4">
          <motion.div
            className="flex w-full max-w-md flex-col overflow-hidden rounded-xl bg-white"
            style={{ maxHeight: `calc(${visualViewportHeight} - 2rem)` }}
            onClick={(event) => event.stopPropagation()}
            initial={{ y: 20, opacity: 0.82 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative px-6 pb-4 pt-6">
              <button
                type="button"
                ref={closeButtonRef}
                onClick={onClose}
                className="absolute right-6 top-6 rounded-full p-1 text-gray-800 hover:bg-black/5"
                aria-label="방명록 모달 닫기"
              >
                <Icon icon={X} size="md" />
              </button>
              <h3 className="text-center text-lg font-semibold text-gray-900">
                방명록 작성하기
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="modal-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-4 pt-2">
                <div className="py-3">
                  <label
                    htmlFor="author"
                    className="mb-3 block text-sm font-semibold text-gray-800"
                  >
                    <span className="mr-1 text-red-500">*</span>이름
                  </label>
                  <input
                    id="author"
                    type="text"
                    value={formData.author}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        author: event.target.value,
                      }))
                    }
                    placeholder="이름을 입력해 주세요."
                    className="w-full border-0 border-b border-gray-300 px-2 pb-3 pt-1 text-sm text-wedding-gray outline-none placeholder:text-gray-400 focus:border-gray-400"
                    maxLength={20}
                    required
                  />
                </div>

                <div className="py-3">
                  <label
                    htmlFor="message"
                    className="mb-3 block text-sm font-semibold text-gray-800"
                  >
                    <span className="mr-1 text-red-500">*</span>내용
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        message: event.target.value,
                      }))
                    }
                    className="w-full resize-none border-0 border-b border-gray-300 px-2 pb-3 pt-1 text-sm text-wedding-gray outline-none placeholder:text-gray-400 focus:border-gray-400"
                    placeholder="내용을 작성해 주세요. (최대 500자)"
                    rows={4}
                    maxLength={500}
                    required
                  />
                </div>

                <div>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={formData.isPublic}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        isPublic: !prev.isPublic,
                      }))
                    }
                    className="inline-flex items-center gap-2 text-sm text-gray-700"
                  >
                    <span
                      className={`inline-flex h-4 w-4 items-center justify-center rounded border transition ${
                        formData.isPublic
                          ? "border-wedding-brown bg-wedding-brown text-white"
                          : "border-gray-300 bg-white text-transparent"
                      }`}
                      aria-hidden="true"
                    >
                      <Icon icon={Check} size="sm" className="!h-3 !w-3" />
                    </span>
                    청첩장에 공개하기
                  </button>
                </div>

                {errorMessage && (
                  <p className="mt-3 text-sm text-red-500">{errorMessage}</p>
                )}
              </div>

              <div className="shrink-0 border-t border-gray-100 bg-white px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3">
                <button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className={`w-full rounded-md px-8 py-3 text-base font-medium transition ${
                    canSubmit && !isSubmitting
                      ? "bg-wedding-brown-light text-wedding-beige"
                      : "bg-black/10 text-gray-400"
                  } disabled:opacity-50`}
                >
                  {isSubmitting ? "등록중" : "작성완료"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </ModalPortal>
  );
}
