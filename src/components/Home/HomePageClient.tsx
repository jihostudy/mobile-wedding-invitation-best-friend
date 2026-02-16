'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
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
import useToast from '@/components/common/toast/useToast';
import { apiFetch } from '@/lib/api/client';
import { FALLBACK_WEDDING_CONTENT } from '@/lib/wedding-content/fallback';
import { useWeddingContentQuery } from '@/lib/queries/wedding-content';

export default function HomePageClient() {
  const toast = useToast();
  const hasShownLoginToast = useRef(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const { data } = useWeddingContentQuery('main');
  const content = data?.content ?? FALLBACK_WEDDING_CONTENT;

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
        <div className="absolute -left-24 top-[12%] h-72 w-72 rounded-full bg-[#ffc8d2]/45 blur-3xl" />
        <div className="absolute -right-24 top-[34%] h-80 w-80 rounded-full bg-[#ffe2b8]/45 blur-3xl" />
        <div className="absolute left-1/2 top-[70%] h-64 w-64 -translate-x-1/2 rounded-full bg-[#ffd5de]/35 blur-3xl" />
      </div>
      <main className="relative z-10 mx-auto w-full max-w-[425px] border-x border-[#efe2d1] bg-white/95 shadow-[0_24px_64px_rgba(103,76,48,0.16)] backdrop-blur-sm">
        <MainHero
          groom={content.weddingData.groom}
          bride={content.weddingData.bride}
          date={content.weddingData.date}
        />
        <div className="relative z-10 bg-white/94">
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
        {isAdminAuthenticated ? (
          <Link
            href="/admin/guest-messages"
            className="fixed bottom-5 right-5 z-50 rounded-full bg-wedding-brown px-5 py-3 text-xs font-semibold tracking-[0.08em] text-white shadow-[0_10px_24px_rgba(68,47,33,0.3)] transition hover:bg-wedding-brown-light"
            aria-label="관리자 대시보드로 이동"
          >
            대시보드
          </Link>
        ) : null}
      </main>
    </>
  );
}
