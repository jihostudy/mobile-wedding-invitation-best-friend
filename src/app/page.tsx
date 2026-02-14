import MainHero from '@/components/Hero/MainHero';
import InvitationMessage from '@/components/Invitation/InvitationMessage';
import WeddingCalendar from '@/components/Calendar/WeddingCalendar';
import ImageGallery from '@/components/Gallery/ImageGallery';
import VenueInfo from '@/components/Location/VenueInfo';
import Guestbook from '@/components/Guestbook/Guestbook';
import ThankYouSection from '@/components/ThankYou/ThankYouSection';
import AccountSection from '@/components/Account/AccountSection';
import FloatingNav from '@/components/Navigation/FloatingNav';
import {
  WEDDING_DATA,
  HERO_SECTION,
  INVITATION_SECTION,
  CALENDAR_SECTION,
  GALLERY_SECTION,
  LOCATION_SECTION,
  ACCOUNT_SECTION,
  CLOSING_SECTION,
  FLOATING_NAV_ITEMS,
} from '@/constants/wedding-data';

export default function HomePage() {
  return (
    <main className="relative mx-auto max-w-[600px] bg-[#F9F2EB]">
      <MainHero section={HERO_SECTION} groom={WEDDING_DATA.groom} bride={WEDDING_DATA.bride} />
      <InvitationMessage section={INVITATION_SECTION} groom={WEDDING_DATA.groom} bride={WEDDING_DATA.bride} />
      <WeddingCalendar
        section={CALENDAR_SECTION}
        groom={WEDDING_DATA.groom}
        bride={WEDDING_DATA.bride}
        date={WEDDING_DATA.date}
      />
      <ImageGallery section={GALLERY_SECTION} />
      <VenueInfo section={LOCATION_SECTION} venue={WEDDING_DATA.venue} date={WEDDING_DATA.date} />
      <AccountSection section={ACCOUNT_SECTION} />
      <Guestbook />
      <ThankYouSection
        section={CLOSING_SECTION}
        image={HERO_SECTION.mainImage}
        share={
          WEDDING_DATA.share || {
            title: `${WEDDING_DATA.groom.name} ♥ ${WEDDING_DATA.bride.name} 결혼합니다`,
            description: `${WEDDING_DATA.date.year}.${WEDDING_DATA.date.month}.${WEDDING_DATA.date.day}`,
          }
        }
      />
      <FloatingNav items={FLOATING_NAV_ITEMS} />
    </main>
  );
}
