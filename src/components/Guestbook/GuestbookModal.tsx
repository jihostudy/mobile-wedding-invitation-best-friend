'use client';

import { useState, useEffect } from 'react';
import { createGuestMessage } from '@/lib/supabase';
import type { GuestMessageInput } from '@/types';

interface GuestbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * 방명록 작성 모달
 */
export default function GuestbookModal({
  isOpen,
  onClose,
  onSuccess,
}: GuestbookModalProps) {
  const [formData, setFormData] = useState<GuestMessageInput>({
    author: '',
    message: '',
    isPublic: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 모달 열릴 때 body 스크롤 막기
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // 모달 닫을 때 폼 초기화
  useEffect(() => {
    if (!isOpen) {
      setFormData({ author: '', message: '', isPublic: true });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.author.trim()) {
      alert('이름 또는 닉네임을 입력해주세요.');
      return;
    }

    if (!formData.message.trim()) {
      alert('메시지를 입력해주세요.');
      return;
    }

    if (formData.message.length > 100) {
      alert('메시지는 최대 100자까지 입력 가능합니다.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createGuestMessage(formData);

      if (result.success) {
        alert('방명록이 등록되었습니다! 💐');
        onSuccess();
        onClose();
      } else {
        alert(`오류가 발생했습니다: ${result.error}`);
      }
    } catch (error) {
      console.error('Error submitting message:', error);
      alert('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="닫기"
        >
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* 헤더 */}
        <div className="px-6 pt-12 pb-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 text-center">
            신랑·신부에게
            <br />
            방명록을 남겨보세요.
          </h2>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 이름 또는 닉네임 */}
          <div>
            <label
              htmlFor="author"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              이름 또는 닉네임
            </label>
            <input
              type="text"
              id="author"
              value={formData.author}
              onChange={(e) =>
                setFormData({ ...formData, author: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wedding-brown focus:border-transparent"
              placeholder="이름 또는 닉네임을 입력해주세요."
              maxLength={20}
              required
            />
          </div>

          {/* 메시지 입력 */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              메세지 입력
            </label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wedding-brown focus:border-transparent resize-none"
              placeholder="신랑과 신부에게 전할 메세지를 입력해주세요. (최대 100자)"
              rows={5}
              maxLength={100}
              required
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {formData.message.length}/100
            </p>
          </div>

          {/* 공개 여부 */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) =>
                  setFormData({ ...formData, isPublic: e.target.checked })
                }
                className="w-5 h-5 text-wedding-brown rounded focus:ring-wedding-brown"
              />
              <span className="text-sm text-gray-700">
                청첩장에 공개하기
                {!formData.isPublic && (
                  <span className="text-gray-500 ml-1">
                    (비공개로 설정하면 청첩장에 표시되지 않습니다)
                  </span>
                )}
              </span>
            </label>
          </div>

          {/* 완료 버튼 */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '등록 중...' : '완료'}
          </button>
        </form>
      </div>
    </div>
  );
}

