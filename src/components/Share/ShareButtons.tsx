'use client';

import { useState } from 'react';

interface KakaoApi {
  isInitialized: () => boolean;
  Share: {
    sendDefault: (options: unknown) => void;
  };
}

declare global {
  interface Window {
    Kakao?: KakaoApi;
  }
}

/**
 * 공유 버튼 컴포넌트
 * 카카오톡, 링크 복사 등
 */
export default function ShareButtons() {
  const [copied, setCopied] = useState(false);

  // 카카오톡 공유
  const shareKakao = () => {
    if (typeof window === 'undefined') return;

    // 카카오톡 SDK 로드 확인
    if (!window.Kakao) {
      alert('카카오톡 공유 기능을 사용할 수 없습니다.');
      return;
    }

    const kakao = window.Kakao;

    if (!kakao.isInitialized()) {
      // 카카오 JavaScript 키로 초기화 (실제 키 필요)
      // kakao.init('YOUR_KAKAO_JAVASCRIPT_KEY');
      alert('카카오톡 SDK 초기화가 필요합니다.');
      return;
    }

    kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: '김민섭 ♥ 전이서 결혼합니다',
        description: '2025년 3월 1일 토요일 오후 2시 50분',
        imageUrl: `${window.location.origin}/images/placeholder-couple.svg`,
        link: {
          mobileWebUrl: window.location.href,
          webUrl: window.location.href,
        },
      },
      buttons: [
        {
          title: '청첩장 보기',
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
      ],
    });
  };

  // 링크 복사
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('링크 복사에 실패했습니다.');
    }
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
    const text = encodeURIComponent('김민섭 ♥ 전이서 결혼합니다');
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
          <h2 className="text-3xl font-serif text-wedding-brown mb-2">
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
