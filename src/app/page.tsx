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
import {
  WEDDING_DATA,
  HERO_SECTION,
  INVITATION_SECTION,
  INTERVIEW_SECTION,
  GALLERY_SECTION,
  ACCOUNT_SECTION,
} from '@/constants/wedding-data';

export default function HomePage() {
  return (
    <main className="relative mx-auto w-full max-w-[425px] bg-white">
      <MainHero
        section={HERO_SECTION}
        groom={WEDDING_DATA.groom}
        bride={WEDDING_DATA.bride}
        date={WEDDING_DATA.date}
      />
      <div className="relative z-10 bg-white">
        <FadeInUp delay={0.05} amount={0.15}>
          <InvitationMessage section={INVITATION_SECTION} groom={WEDDING_DATA.groom} bride={WEDDING_DATA.bride} />
        </FadeInUp>
        <InterviewSection section={INTERVIEW_SECTION} />
        <FadeInUp delay={0.15} amount={0.15}>
          <ImageGallery section={GALLERY_SECTION} />
        </FadeInUp>
        <FadeInUp delay={0.2} amount={0.15}>
          <WeddingCalendar
            groom={WEDDING_DATA.groom}
            bride={WEDDING_DATA.bride}
            date={WEDDING_DATA.date}
          />
        </FadeInUp>
        <VenueInfo venue={WEDDING_DATA.venue} date={WEDDING_DATA.date} />
        <FadeInUp delay={0.3} amount={0.15}>
          <Guestbook />
        </FadeInUp>
        <FadeInUp delay={0.35} amount={0.15}>
          <AccountSection section={ACCOUNT_SECTION} />
        </FadeInUp>
        <FadeInUp delay={0.4} amount={0.15}>
          <FinalThanksSection />
        </FadeInUp>
      </div>
      <BackgroundMusicPlayer config={WEDDING_DATA.backgroundMusic} />
    </main>
  );
}
