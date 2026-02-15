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
import {
  WEDDING_DATA,
  HERO_SECTION,
  INVITATION_SECTION,
  INTERVIEW_SECTION,
  CALENDAR_SECTION,
  GALLERY_SECTION,
  LOCATION_SECTION,
  ACCOUNT_SECTION,
} from '@/constants/wedding-data';

export default function HomePage() {
  return (
    <main className="relative mx-auto w-[425px] max-w-[425px] bg-white">
      <MainHero section={HERO_SECTION} groom={WEDDING_DATA.groom} bride={WEDDING_DATA.bride} />
      <div className="relative z-10 bg-white">
        <InvitationMessage section={INVITATION_SECTION} groom={WEDDING_DATA.groom} bride={WEDDING_DATA.bride} />
        <InterviewSection section={INTERVIEW_SECTION} />
        <ImageGallery section={GALLERY_SECTION} />
        <WeddingCalendar
          section={CALENDAR_SECTION}
          groom={WEDDING_DATA.groom}
          bride={WEDDING_DATA.bride}
          date={WEDDING_DATA.date}
        />
        <VenueInfo section={LOCATION_SECTION} venue={WEDDING_DATA.venue} date={WEDDING_DATA.date} />
        <Guestbook />
        <AccountSection section={ACCOUNT_SECTION} />
        <FinalThanksSection />
      </div>
      <BackgroundMusicPlayer config={WEDDING_DATA.backgroundMusic} />
    </main>
  );
}
