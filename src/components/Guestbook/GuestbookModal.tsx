"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
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
      return;
    }

    closeButtonRef.current?.focus({ preventScroll: true });
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
        className="fixed inset-0 z-[10000] overflow-hidden overscroll-none"
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
            className="modal-scrollbar max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto overscroll-contain rounded-xl bg-white"
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
              <h3 className="text-center text-xl font-semibold text-gray-900">
                방명록 작성하기
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="px-6 pb-6 pt-2">
              <div className="py-3">
                <label
                  htmlFor="author"
                  className="mb-3 block text-base font-semibold text-gray-800"
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
                  className="w-full px-2 border-0 border-b border-gray-300 py-3 text-sm outline-none placeholder:text-gray-400 focus:border-gray-400 text-wedding-gray"
                  maxLength={20}
                  required
                />
              </div>

              <div className="py-3">
                <label
                  htmlFor="message"
                  className="mb-3 block text-base font-semibold text-gray-800"
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
                  className="w-full resize-none border-0 border-b border-gray-300 px-2 py-3 text-sm outline-none placeholder:text-gray-400 focus:border-gray-400 text-wedding-gray"
                  placeholder="내용을 작성해 주세요. (최대 500자)"
                  rows={4}
                  maxLength={500}
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        isPublic: event.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-gray-300 text-wedding-brown focus:ring-wedding-brown"
                  />
                  청첩장에 공개하기
                </label>
              </div>

              {errorMessage && (
                <p className="text-sm text-red-500">{errorMessage}</p>
              )}

              <div className="mt-4 flex justify-end  pt-6 w-full">
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
