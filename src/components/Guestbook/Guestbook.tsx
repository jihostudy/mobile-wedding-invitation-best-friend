'use client';

import { useState, useEffect } from 'react';
import { getGuestMessages, createGuestMessage, deleteGuestMessage } from '@/lib/supabase';
import type { GuestMessage, GuestMessageInput } from '@/types';

/**
 * 방명록 컴포넌트
 * Supabase 연동
 */
export default function Guestbook() {
  const [messages, setMessages] = useState<GuestMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // 폼 상태
  const [formData, setFormData] = useState<GuestMessageInput>({
    author: '',
    message: '',
    password: '',
    isPrivate: false,
  });

  // 메시지 로드
  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    const data = await getGuestMessages();
    setMessages(data);
    setLoading(false);
  };

  // 메시지 작성
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.author.trim() || !formData.message.trim() || !formData.password) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    const result = await createGuestMessage(formData);

    if (result.success) {
      alert('축하 메시지가 등록되었습니다! 💐');
      setFormData({ author: '', message: '', password: '', isPrivate: false });
      setIsFormOpen(false);
      loadMessages();
    } else {
      alert(`오류가 발생했습니다: ${result.error}`);
    }
  };

  // 메시지 삭제
  const handleDelete = async (messageId: string) => {
    const password = prompt('삭제하려면 비밀번호를 입력하세요:');
    if (!password) return;

    const result = await deleteGuestMessage(messageId, password);

    if (result.success) {
      alert('메시지가 삭제되었습니다.');
      loadMessages();
    } else {
      alert(`오류: ${result.error}`);
    }
  };

  return (
    <section className="section bg-wedding-beige">
      <div className="max-w-2xl w-full">
        {/* 타이틀 */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif text-wedding-brown mb-2">
            축하 메시지
          </h2>
          <p className="text-wedding-brown-light">
            따뜻한 축하의 말을 남겨주세요
          </p>
        </div>

        {/* 메시지 작성 버튼 */}
        {!isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="btn-primary w-full mb-8"
          >
            축하 메시지 남기기 ✍️
          </button>
        )}

        {/* 메시지 작성 폼 */}
        {isFormOpen && (
          <form onSubmit={handleSubmit} className="card mb-8">
            <div className="space-y-4">
              <div>
                <label htmlFor="author" className="block text-sm font-medium text-wedding-brown mb-2">
                  작성자
                </label>
                <input
                  type="text"
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-4 py-2 border border-wedding-brown-light rounded-lg focus:outline-none focus:ring-2 focus:ring-wedding-brown"
                  placeholder="이름을 입력하세요"
                  maxLength={20}
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-wedding-brown mb-2">
                  메시지
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2 border border-wedding-brown-light rounded-lg focus:outline-none focus:ring-2 focus:ring-wedding-brown resize-none"
                  placeholder="축하 메시지를 입력하세요"
                  rows={4}
                  maxLength={300}
                />
                <p className="text-xs text-wedding-brown-light mt-1 text-right">
                  {formData.message.length}/300
                </p>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-wedding-brown mb-2">
                  비밀번호 (삭제시 필요)
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-wedding-brown-light rounded-lg focus:outline-none focus:ring-2 focus:ring-wedding-brown"
                  placeholder="4자리 이상"
                  minLength={4}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={formData.isPrivate}
                  onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                  className="w-4 h-4 text-wedding-brown rounded focus:ring-wedding-brown"
                />
                <label htmlFor="isPrivate" className="text-sm text-wedding-brown">
                  비공개 메시지로 작성
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  등록하기
                </button>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="btn-outline flex-1"
                >
                  취소
                </button>
              </div>
            </div>
          </form>
        )}

        {/* 메시지 목록 */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner w-12 h-12" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-wedding-brown-light">
              <p>첫 번째 축하 메시지를 남겨주세요! 💌</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="card">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-medium text-wedding-brown">{message.author}</p>
                    <p className="text-xs text-wedding-brown-light mt-1">
                      {new Date(message.createdAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(message.id)}
                    className="text-xs text-wedding-brown-light hover:text-wedding-brown"
                    aria-label="메시지 삭제"
                  >
                    삭제
                  </button>
                </div>

                {message.isPrivate ? (
                  <p className="text-sm text-wedding-brown-light italic">
                    🔒 비공개 메시지입니다
                  </p>
                ) : (
                  <p className="text-wedding-brown whitespace-pre-wrap break-words">
                    {message.message}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

