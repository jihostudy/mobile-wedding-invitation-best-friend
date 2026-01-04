import MainHero from '@/components/Hero/MainHero';
import InvitationMessage from '@/components/Invitation/InvitationMessage';
import WeddingCalendar from '@/components/Calendar/WeddingCalendar';
import ImageGallery from '@/components/Gallery/ImageGallery';
import VenueInfo from '@/components/Location/VenueInfo';
import Guestbook from '@/components/Guestbook/Guestbook';
import ThankYouSection from '@/components/ThankYou/ThankYouSection';

/**
 * 메인 페이지
 * 모든 섹션을 순서대로 렌더링
 */
export default function HomePage() {
  return (
    <main className="relative max-w-[600px] mx-auto bg-white">
      {/* 1. 메인 히어로 (인스타그램 스토리 스타일) */}
      <MainHero />

      {/* 2. 초대 메시지 */}
      <InvitationMessage />

      {/* 3. 캘린더 및 카운트다운 */}
      <WeddingCalendar />

      {/* 4. 갤러리 */}
      <ImageGallery />

      {/* 5. 위치 정보 */}
      <VenueInfo />

      {/* 6. 방명록 */}
      <Guestbook />

      {/* 7. 끝맺음 (Thank You) */}
      <ThankYouSection />

      {/* 푸터 */}
      <footer className="py-8 text-center bg-wedding-beige">
        <p className="text-xs text-wedding-brown-light">
          © 2025. All rights reserved.
        </p>
      </footer>
    </main>
  );
}

