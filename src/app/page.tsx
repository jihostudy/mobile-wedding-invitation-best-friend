import MainHero from '@/components/Hero/MainHero';
import InvitationMessage from '@/components/Invitation/InvitationMessage';
import ImageGallery from '@/components/Gallery/ImageGallery';
import VenueInfo from '@/components/Location/VenueInfo';
import Guestbook from '@/components/Guestbook/Guestbook';
import ShareButtons from '@/components/Share/ShareButtons';

/**
 * 메인 페이지
 * 모든 섹션을 순서대로 렌더링
 */
export default function HomePage() {
  return (
    <main className="relative">
      {/* 1. 메인 히어로 (인스타그램 스토리 스타일) */}
      <MainHero />

      {/* 2. 초대 메시지 */}
      <InvitationMessage />

      {/* 3. 갤러리 */}
      <ImageGallery />

      {/* 4. 위치 정보 */}
      <VenueInfo />

      {/* 5. 방명록 */}
      <Guestbook />

      {/* 6. 공유하기 */}
      <ShareButtons />

      {/* 푸터 */}
      <footer className="py-8 text-center bg-wedding-beige">
        <p className="text-sm text-wedding-brown-light">
          Thank you for celebrating with us
        </p>
        <p className="text-xs text-wedding-brown-light mt-2">
          © 2025. All rights reserved.
        </p>
      </footer>
    </main>
  );
}

