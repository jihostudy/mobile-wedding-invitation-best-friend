'use client';

import { useState } from 'react';
import useToast from '@/components/common/toast/useToast';
import { useWeddingContentQuery } from '@/lib/queries/wedding-content';
import { FALLBACK_WEDDING_CONTENT } from '@/lib/wedding-content/fallback';
import {
  ensureKakaoInitialized,
  type KakaoSdk,
} from '@/lib/share/kakao';

/**
 * 공유 버튼 컴포넌트
 * 카카오톡, 링크 복사 등
 */
export default function ShareButtons() {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const { data } = useWeddingContentQuery('main');
  const content = data?.content ?? FALLBACK_WEDDING_CONTENT;

  const copyCurrentUrl = async () => {
    if (typeof window === 'undefined') return false;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch (error) {
      console.error('Failed to copy:', error);
      return false;
    }
  };

  // 카카오톡 공유
  const shareKakao = async () => {
    if (typeof window === 'undefined') return;

    // 카카오톡 SDK 로드 확인
    const kakao = (window as Window & { Kakao?: KakaoSdk }).Kakao;
    if (!kakao) {
      toast.error('카카오톡 SDK를 불러오지 못했습니다. 링크를 복사해 공유해 주세요.');
      await copyCurrentUrl();
      return;
    }

    const initResult = ensureKakaoInitialized({
      kakao,
      appKey: process.env.NEXT_PUBLIC_KAKAO_JS_KEY,
    });
    if (!initResult.ok) {
      toast.error(`${initResult.reason} 링크 복사로 공유해 주세요.`);
      await copyCurrentUrl();
      return;
    }

    try {
      kakao.Share.sendScrap({
        requestUrl: window.location.href,
      });
    } catch (error) {
      console.error('Failed to share via Kakao:', error);
      toast.error('카카오톡 공유에 실패했습니다. 링크를 복사해 공유해 주세요.');
      await copyCurrentUrl();
    }
  };

  // 링크 복사
  const copyLink = async () => {
    const copiedSuccessfully = await copyCurrentUrl();
    if (copiedSuccessfully) {
      toast.success('링크가 복사되었습니다.');
      return;
    }
    toast.error('링크 복사에 실패했습니다.');
  };

  // 페이스북 공유
  const shareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      '_blank',
      'width=600,height=400'
    );
  };

  // 트위터 공유
  const shareTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(
      `${content.weddingData.groom.name} ❤️ ${content.weddingData.bride.name} 결혼합니다`,
    );
    window.open(
      `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      '_blank',
      'width=600,height=400'
    );
  };

  return (
    <section className="section bg-white">
      <div className="max-w-md w-full">
        {/* 타이틀 */}
        <div className="text-center mb-8">
          <h2 className="text-3xl text-wedding-brown mb-2">
            청첩장 공유하기
          </h2>
          <p className="text-wedding-brown-light">
            소중한 분들께 전해주세요
          </p>
        </div>

        {/* 공유 버튼 그리드 */}
        <div className="grid grid-cols-2 gap-4">
          {/* 카카오톡 */}
          <button
            onClick={shareKakao}
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-[#FEE500] hover:bg-[#FDD835] transition-colors duration-300 shadow-lg"
          >
            <div className="w-12 h-12 flex items-center justify-center">
              <span className="text-3xl">💬</span>
            </div>
            <span className="text-sm font-medium text-[#3C1E1E]">
              카카오톡
            </span>
          </button>

          {/* 링크 복사 */}
          <button
            onClick={copyLink}
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-wedding-beige hover:bg-wedding-brown-light hover:text-white transition-colors duration-300 shadow-lg"
          >
            <div className="w-12 h-12 flex items-center justify-center">
              <span className="text-3xl">{copied ? '✅' : '🔗'}</span>
            </div>
            <span className="text-sm font-medium">
              {copied ? '복사됨!' : '링크 복사'}
            </span>
          </button>

          {/* 페이스북 */}
          <button
            onClick={shareFacebook}
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-[#1877F2] hover:bg-[#166FE5] text-white transition-colors duration-300 shadow-lg"
          >
            <div className="w-12 h-12 flex items-center justify-center">
              <span className="text-3xl">📘</span>
            </div>
            <span className="text-sm font-medium">
              페이스북
            </span>
          </button>

          {/* 트위터 */}
          <button
            onClick={shareTwitter}
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-[#1DA1F2] hover:bg-[#1A91DA] text-white transition-colors duration-300 shadow-lg"
          >
            <div className="w-12 h-12 flex items-center justify-center">
              <span className="text-3xl">🐦</span>
            </div>
            <span className="text-sm font-medium">
              트위터
            </span>
          </button>
        </div>

        {/* 캘린더 저장 버튼 */}
        <div className="mt-8">
          <a
            href="/api/calendar"
            download="wedding.ics"
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <span className="text-xl">📅</span>
            캘린더에 저장하기
          </a>
        </div>
      </div>
    </section>
  );
}
