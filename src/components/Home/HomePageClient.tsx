'use client';

import MainHero from '@/components/Hero/MainHero';
import BackgroundMusicPlayer from '@/components/Audio/BackgroundMusicPlayer';
import InvitationMessage from '@/components/Invitation/InvitationMessage';
import InterviewSection from '@/components/Interview/InterviewSection';
import WeddingCalendar from '@/components/Calendar/WeddingCalendar';
import ImageGallery from '@/components/Gallery/ImageGallery';
import VenueInfo from '@/components/Location/VenueInfo';
import Guestbook from '@/components/Guestbook/Guestbook';
import AccountSection from '@/components/Account/AccountSection';
import FinalThanksSection from '@/components/Closing/FinalThanksSection';
import FadeInUp from '@/components/common/FadeInUp';
import { FALLBACK_WEDDING_CONTENT } from '@/lib/wedding-content/fallback';
import { useWeddingContentQuery } from '@/lib/queries/wedding-content';

export default function HomePageClient() {
  const { data } = useWeddingContentQuery('main');
  const content = data?.content ?? FALLBACK_WEDDING_CONTENT;

  return (
    <main className="relative mx-auto w-full max-w-[425px] bg-white">
      <MainHero
        groom={content.weddingData.groom}
        bride={content.weddingData.bride}
        date={content.weddingData.date}
      />
      <div className="relative z-10 bg-white">
        <FadeInUp delay={0.05} amount={0.15}>
          <InvitationMessage
            section={content.invitationSection}
            groom={content.weddingData.groom}
            bride={content.weddingData.bride}
          />
        </FadeInUp>
        <InterviewSection section={content.interviewSection} />
        <FadeInUp delay={0.15} amount={0.15}>
          <ImageGallery section={content.gallerySection} />
        </FadeInUp>
        <FadeInUp delay={0.2} amount={0.15}>
          <WeddingCalendar
            groom={content.weddingData.groom}
            bride={content.weddingData.bride}
            date={content.weddingData.date}
          />
        </FadeInUp>
        <VenueInfo venue={content.weddingData.venue} date={content.weddingData.date} />
        <FadeInUp delay={0.3} amount={0.15}>
          <Guestbook />
        </FadeInUp>
        <FadeInUp delay={0.35} amount={0.15}>
          <AccountSection section={content.accountSection} />
        </FadeInUp>
        <FadeInUp delay={0.4} amount={0.15}>
          <FinalThanksSection />
        </FadeInUp>
      </div>
      <BackgroundMusicPlayer config={content.weddingData.backgroundMusic} />
    </main>
  );
}
