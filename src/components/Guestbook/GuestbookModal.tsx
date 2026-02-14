'use client';

import { useEffect, useRef, useState } from 'react';
import { createGuestMessage } from '@/lib/supabase';
import type { GuestMessageInput } from '@/types';

interface GuestbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GuestbookModal({ isOpen, onClose, onSuccess }: GuestbookModalProps) {
  const [formData, setFormData] = useState<GuestMessageInput>({
    author: '',
    message: '',
    isPublic: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = 'unset';
      setFormData({ author: '', message: '', isPublic: true });
      setErrorMessage('');
      return;
    }

    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage('');

    if (!formData.author.trim()) {
      setErrorMessage('이름 또는 닉네임을 입력해주세요.');
      return;
    }
    if (!formData.message.trim()) {
      setErrorMessage('메시지를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    const result = await createGuestMessage(formData);
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error || '오류가 발생했습니다.');
      return;
    }

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white" onClick={(event) => event.stopPropagation()}>
        <div className="relative border-b border-gray-200 px-6 py-5">
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="absolute left-4 top-4 rounded-full p-2 hover:bg-gray-100"
            aria-label="방명록 모달 닫기"
          >
            <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-center text-lg font-semibold text-gray-900">신랑·신부에게 방명록을 남겨보세요</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div>
            <label htmlFor="author" className="mb-2 block text-sm font-medium text-gray-700">
              이름 또는 닉네임
            </label>
            <input
              id="author"
              type="text"
              value={formData.author}
              onChange={(event) => setFormData((prev) => ({ ...prev, author: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-wedding-brown focus:ring-2 focus:ring-wedding-brown/25"
              maxLength={20}
              required
            />
          </div>

          <div>
            <label htmlFor="message" className="mb-2 block text-sm font-medium text-gray-700">
              메시지 입력
            </label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(event) => setFormData((prev) => ({ ...prev, message: event.target.value }))}
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-wedding-brown focus:ring-2 focus:ring-wedding-brown/25"
              rows={4}
              maxLength={100}
              required
            />
            <p className="mt-1 text-right text-xs text-gray-500">{formData.message.length}/100</p>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={formData.isPublic}
              onChange={(event) => setFormData((prev) => ({ ...prev, isPublic: event.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-wedding-brown focus:ring-wedding-brown"
            />
            청첩장에 공개하기
          </label>

          {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-gray-900 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {isSubmitting ? '등록 중...' : '완료'}
          </button>
        </form>
      </div>
    </div>
  );
}
