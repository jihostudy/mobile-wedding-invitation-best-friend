"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import Icon from "@/components/common/Icon";
import { createGuestMessage } from "@/lib/supabase";
import type { GuestMessageInput } from "@/types";

interface GuestbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GuestbookModal({
  isOpen,
  onClose,
  onSuccess,
}: GuestbookModalProps) {
  const [formData, setFormData] = useState<GuestMessageInput>({
    author: "",
    message: "",
    isPublic: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "unset";
      setFormData({ author: "", message: "", isPublic: true });
      setErrorMessage("");
      return;
    }

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

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
    const result = await createGuestMessage(formData);
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error || "오류가 발생했습니다.");
      return;
    }

    onSuccess();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-xl bg-white"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative px-6 pb-4 pt-6">
          <button
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
                setFormData((prev) => ({ ...prev, author: event.target.value }))
              }
              placeholder="이름을 입력해 주세요."
              className="w-full px-2 border-0 border-b border-gray-300 py-3 text-sm outline-none placeholder:text-gray-400 focus:border-gray-400"
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
              className="w-full resize-none border-0 border-b border-gray-300 px-2 py-3 text-sm outline-none placeholder:text-gray-400 focus:border-gray-400"
              placeholder="내용을 작성해 주세요. (최대 500자)"
              rows={4}
              maxLength={500}
              required
            />
          </div>

          <div>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
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
              disabled={isSubmitting}
              className="rounded-md w-full bg-black/10 px-8 py-3 text-base font-medium text-gray-400 disabled:opacity-50"
            >
              {isSubmitting ? "등록중" : "작성완료"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
