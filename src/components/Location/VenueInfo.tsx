'use client';

import { WEDDING_DATA } from '@/constants/wedding-data';

/**
 * 예식장 위치 정보
 * 네이버지도 연동
 */
export default function VenueInfo() {
  const { venue, date } = WEDDING_DATA;

  // 네이버지도 링크 생성
  const getNaverMapUrl = () => {
    const query = encodeURIComponent(venue.address);
    return `https://map.naver.com/v5/search/${query}`;
  };

  // 네이버지도 iframe URL 생성
  const getNaverMapEmbedUrl = () => {
    const query = encodeURIComponent(venue.address);
    return `https://map.naver.com/v5/embed/search/${query}?c=15,0,0,0,dh`;
  };

  return (
    <section className="section bg-wedding-beige">
      <div className="max-w-2xl w-full">
        {/* 타이틀 */}
        <div className="text-center mb-6">
          <p className="text-sm tracking-[0.3em] text-wedding-brown-light/60 uppercase font-serif mb-4">
            --------- Location ---------
          </p>
          <h2 className="text-2xl font-serif text-wedding-brown mb-4">
            오시는 길
          </h2>
        </div>

        {/* 예식장 정보 */}
        <div className="mb-6 text-center">
          <h3 className="text-xl font-semibold text-wedding-brown mb-2">
            {venue.name}
            {venue.floor && <span className="text-lg"> {venue.floor}</span>}
          </h3>
          <div className="text-wedding-brown-light text-sm space-y-1">
            <p>{venue.address}</p>
            {venue.contact && (
              <p>Tel. {venue.contact}</p>
            )}
          </div>
        </div>

        {/* 네이버지도 */}
        <div className="mb-6 rounded-lg overflow-hidden shadow-lg border border-wedding-brown/20">
          <div className="relative w-full aspect-[4/3] bg-wedding-brown/10">
            {/* 네이버지도 링크 */}
            <a
              href={getNaverMapUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-wedding-brown/5 to-wedding-brown/10 hover:from-wedding-brown/10 hover:to-wedding-brown/15 transition-all"
              aria-label="네이버지도에서 위치 보기"
            >
              {/* 지도 아이콘 */}
              <div className="mb-3">
                <svg
                  className="w-16 h-16 text-wedding-brown/60"
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
              </div>
              {/* 위치 마커 */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
              </div>
              {/* 버튼 텍스트 */}
              <div className="mt-8">
                <span className="bg-white/90 px-6 py-3 rounded-full shadow-lg text-sm text-wedding-brown font-medium">
                  네이버지도에서 보기
                </span>
              </div>
            </a>
          </div>
        </div>

        {/* 교통편 안내 */}
        {venue.transport && (
          <div className="space-y-4">
            {/* 버스 */}
            {venue.transport.bus && venue.transport.bus.length > 0 && (
              <div className="bg-white rounded-lg p-5 shadow-sm border border-wedding-brown/10">
                <h4 className="font-semibold text-wedding-brown mb-3 text-lg">
                  버스
                </h4>
                <div className="space-y-2 text-sm text-wedding-brown">
                  {venue.transport.bus.map((line, index) => (
                    <p key={index} className="leading-relaxed">
                      {line}
                    </p>
                  ))}
                  {venue.transport.busNote && (
                    <p className="text-xs text-wedding-brown-light mt-3 leading-relaxed">
                      ※ {venue.transport.busNote}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* 지하철 */}
            {venue.transport.subway && venue.transport.subway.length > 0 && (
              <div className="bg-white rounded-lg p-5 shadow-sm border border-wedding-brown/10">
                <h4 className="font-semibold text-wedding-brown mb-3 text-lg">
                  지하철
                </h4>
                <p className="text-sm text-wedding-brown leading-relaxed whitespace-pre-line">
                  {venue.transport.subway.join('\n')}
                </p>
              </div>
            )}

            {/* 주차 */}
            {venue.transport.parking && (
              <div className="bg-white rounded-lg p-5 shadow-sm border border-wedding-brown/10">
                <h4 className="font-semibold text-wedding-brown mb-3 text-lg">
                  주차 안내
                </h4>
                <p className="text-sm text-wedding-brown leading-relaxed">
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

