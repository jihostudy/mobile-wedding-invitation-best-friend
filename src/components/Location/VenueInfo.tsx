'use client';

import { WEDDING_DATA } from '@/constants/wedding-data';

/**
 * 예식장 위치 정보
 * 카카오맵 API 연동 (선택사항)
 */
export default function VenueInfo() {
  const { venue, date } = WEDDING_DATA;

  const openNaverMap = () => {
    const url = `https://map.naver.com/v5/search/${encodeURIComponent(venue.address)}`;
    window.open(url, '_blank');
  };

  const openKakaoMap = () => {
    const url = `https://map.kakao.com/link/search/${encodeURIComponent(venue.address)}`;
    window.open(url, '_blank');
  };

  const openGoogleMap = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.address)}`;
    window.open(url, '_blank');
  };

  return (
    <section className="section bg-white">
      <div className="max-w-2xl w-full">
        {/* 타이틀 */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif text-wedding-brown mb-2">
            오시는 길
          </h2>
          <p className="text-wedding-brown-light">
            {date.year}년 {date.month}월 {date.day}일 {date.dayOfWeek} {date.time}
          </p>
        </div>

        {/* 예식장 정보 카드 */}
        <div className="card mb-6">
          <h3 className="text-xl font-semibold text-wedding-brown mb-4">
            {venue.name}
          </h3>
          <div className="space-y-3 text-wedding-brown">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <div>
                <p className="font-medium">{venue.address}</p>
                {venue.floor && venue.hall && (
                  <p className="text-sm text-wedding-brown-light mt-1">
                    {venue.floor} {venue.hall}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 지도 앱 연결 버튼 */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <button
            onClick={openNaverMap}
            className="btn-outline py-3 text-sm"
          >
            네이버 지도
          </button>
          <button
            onClick={openKakaoMap}
            className="btn-outline py-3 text-sm"
          >
            카카오맵
          </button>
          <button
            onClick={openGoogleMap}
            className="btn-outline py-3 text-sm"
          >
            구글 지도
          </button>
        </div>

        {/* 교통편 안내 */}
        {venue.transport && (
          <div className="space-y-6">
            {/* 지하철 */}
            {venue.transport.subway && venue.transport.subway.length > 0 && (
              <div className="card">
                <h4 className="font-semibold text-wedding-brown mb-3 flex items-center gap-2">
                  <span className="text-xl">🚇</span>
                  지하철
                </h4>
                <ul className="space-y-2 text-sm text-wedding-brown">
                  {venue.transport.subway.map((line, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-wedding-brown-light">•</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 버스 */}
            {venue.transport.bus && venue.transport.bus.length > 0 && (
              <div className="card">
                <h4 className="font-semibold text-wedding-brown mb-3 flex items-center gap-2">
                  <span className="text-xl">🚌</span>
                  버스
                </h4>
                <ul className="space-y-2 text-sm text-wedding-brown">
                  {venue.transport.bus.map((line, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-wedding-brown-light">•</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 주차 */}
            {venue.transport.parking && (
              <div className="card">
                <h4 className="font-semibold text-wedding-brown mb-3 flex items-center gap-2">
                  <span className="text-xl">🅿️</span>
                  주차 안내
                </h4>
                <p className="text-sm text-wedding-brown">
                  {venue.transport.parking}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

