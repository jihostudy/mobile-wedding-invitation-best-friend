'use client';

import Link from 'next/link';
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import MainHero from '@/components/Hero/MainHero';
import BackgroundMusicPlayer from '@/components/Audio/BackgroundMusicPlayer';
import InvitationMessage from '@/components/Invitation/InvitationMessage';
import InterviewSection from '@/components/Interview/InterviewSection';
import WeddingCalendar from '@/components/Calendar/WeddingCalendar';
import ImageGallery from '@/components/Gallery/ImageGallery';
import VenueInfo from '@/components/Location/VenueInfo';
import Guestbook from '@/components/Guestbook/Guestbook';
import RsvpSection from '@/components/Rsvp/RsvpSection';
import SnapSection from '@/components/Snap/SnapSection';
import AccountSection from '@/components/Account/AccountSection';
import FinalThanksSection from '@/components/Closing/FinalThanksSection';
import FadeInUp from '@/components/common/FadeInUp';
import useToast from '@/components/common/toast/useToast';
import { apiFetch } from '@/lib/api/client';
import { FALLBACK_WEDDING_CONTENT } from '@/lib/wedding-content/fallback';
import { useWeddingContentQuery } from '@/lib/queries/wedding-content';
import type { PageSectionId } from '@/types';

export default function HomePageClient() {
  const toast = useToast();
  const hasShownLoginToast = useRef(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const { data } = useWeddingContentQuery('main');
  const content = data?.content ?? FALLBACK_WEDDING_CONTENT;

  const renderSection = (sectionId: PageSectionId) => {
    switch (sectionId) {
      case 'hero':
        return (
          <MainHero
            groom={content.weddingData.groom}
            bride={content.weddingData.bride}
            date={content.weddingData.date}
            section={content.heroSection}
          />
        );
      case 'invitation':
        return (
          <FadeInUp delay={0.05} amount={0.15}>
            <InvitationMessage
              section={content.invitationSection}
              groom={content.weddingData.groom}
              bride={content.weddingData.bride}
            />
          </FadeInUp>
        );
      case 'interview':
        return (
          <InterviewSection
            section={content.interviewSection}
            groom={content.weddingData.groom}
            bride={content.weddingData.bride}
          />
        );
      case 'gallery':
        return (
          <FadeInUp delay={0.15} amount={0.15}>
            <ImageGallery section={content.gallerySection} />
          </FadeInUp>
        );
      case 'calendar':
        return (
          <FadeInUp delay={0.2} amount={0.15}>
            <WeddingCalendar
              date={content.weddingData.date}
              section={content.calendarSection}
            />
          </FadeInUp>
        );
      case 'location':
        return <VenueInfo venue={content.weddingData.venue} date={content.weddingData.date} />;
      case 'guestbook':
        return (
          <FadeInUp delay={0.3} amount={0.15}>
            <Guestbook section={content.guestbookSection} />
          </FadeInUp>
        );
      case 'rsvp':
        return (
          <FadeInUp delay={0.33} amount={0.15}>
            <RsvpSection section={content.rsvpSection} weddingData={content.weddingData} />
          </FadeInUp>
        );
      case 'snap':
        return (
          <FadeInUp delay={0.36} amount={0.15}>
            <SnapSection section={content.snapSection} />
          </FadeInUp>
        );
      case 'account':
        return (
          <FadeInUp delay={0.35} amount={0.15}>
            <AccountSection
              section={content.accountSection}
              weddingData={content.weddingData}
            />
          </FadeInUp>
        );
      case 'closing':
        return (
          <FadeInUp delay={0.4} amount={0.15}>
            <FinalThanksSection section={content.closingSection} />
          </FadeInUp>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    if (hasShownLoginToast.current) return;

    let cancelled = false;
    void apiFetch<{ authenticated: boolean }>('/api/admin/auth/session')
      .then((result) => {
        if (cancelled) return;
        setIsAdminAuthenticated(result.authenticated);
        if (cancelled || !result.authenticated || hasShownLoginToast.current) return;
        hasShownLoginToast.current = true;
        toast.success('로그인되었습니다.');
      })
      .catch(() => {
        // no-op: main page should remain accessible regardless of admin session check failures
      });

    return () => {
      cancelled = true;
    };
  }, [toast]);

  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="ambient-gradient-layer" />
        <div
          className="ambient-gradient-blob -left-28 top-[10%] h-[24rem] w-[24rem] bg-[#ffccd6]/60"
          style={
            {
              "--blob-drift-x": "22px",
              "--blob-drift-y": "-26px",
              "--blob-scale": "1.16",
              "--blob-duration": "24s",
              "--blob-delay": "-4s",
            } as CSSProperties
          }
        />
        <div
          className="ambient-gradient-blob -right-28 top-[30%] h-[28rem] w-[28rem] bg-[#ffe4bd]/58"
          style={
            {
              "--blob-drift-x": "-20px",
              "--blob-drift-y": "22px",
              "--blob-scale": "1.13",
              "--blob-duration": "30s",
              "--blob-delay": "-11s",
            } as CSSProperties
          }
        />
        <div
          className="ambient-gradient-blob left-1/2 top-[68%] h-[21rem] w-[21rem] -translate-x-1/2 bg-[#ffd8df]/54"
          style={
            {
              "--blob-drift-x": "16px",
              "--blob-drift-y": "-18px",
              "--blob-scale": "1.12",
              "--blob-duration": "27s",
              "--blob-delay": "-7s",
            } as CSSProperties
          }
        />
      </div>
      <main className="relative z-10 mx-auto w-full max-w-[425px] border-x border-[#efe2d1] bg-white/95 shadow-[0_24px_64px_rgba(103,76,48,0.16)] backdrop-blur-sm">
        <div className="relative z-10 bg-white/94">
          {content.pageSectionOrder
            .filter((sectionId) => content.pageSectionVisibility[sectionId])
            .map((sectionId) => (
              <div key={sectionId}>{renderSection(sectionId)}</div>
            ))}
        </div>
        <BackgroundMusicPlayer config={content.weddingData.backgroundMusic} />
      </main>
      {isAdminAuthenticated ? (
        <Link
          href="/admin/guest-messages"
          className="fixed z-[10020] inline-flex max-w-[calc(100vw-24px)] items-center justify-center whitespace-nowrap rounded-full bg-wedding-brown px-4 py-2.5 text-[11px] font-semibold tracking-[0.08em] text-white shadow-[0_10px_24px_rgba(68,47,33,0.3)] transition hover:bg-wedding-brown-light bottom-[max(12px,calc(env(safe-area-inset-bottom)+8px))] right-[max(12px,env(safe-area-inset-right))] sm:px-5 sm:py-3 sm:text-xs"
          aria-label="관리자 대시보드로 이동"
        >
          대시보드
        </Link>
      ) : null}
    </>
  );
}
