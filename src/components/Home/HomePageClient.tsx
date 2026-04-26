"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import MainHero from "@/components/Hero/MainHero";
import ViewportZoomController from "@/components/Home/ViewportZoomController";
import InvitationMessage from "@/components/Invitation/InvitationMessage";
import InterviewSection from "@/components/Interview/InterviewSection";
import WeddingCalendar from "@/components/Calendar/WeddingCalendar";
import ImageGallery from "@/components/Gallery/ImageGallery";
import VenueInfo from "@/components/Location/VenueInfo";
import Guestbook from "@/components/Guestbook/Guestbook";
import RsvpSection from "@/components/Rsvp/RsvpSection";
import SnapSection from "@/components/Snap/SnapSection";
import AccountSection from "@/components/Account/AccountSection";
import FinalThanksSection from "@/components/Closing/FinalThanksSection";
import FadeInUp from "@/components/common/FadeInUp";
import useToast from "@/components/common/toast/useToast";
import { apiFetch } from "@/lib/api/client";
import { FALLBACK_WEDDING_CONTENT } from "@/lib/wedding-content/fallback";
import { useWeddingContentQuery } from "@/lib/queries/wedding-content";
import type { PageSectionId } from "@/types";

function FlowerNotice() {
  return (
    <FadeInUp delay={0.12} amount={0.15}>
      <div className="bg-white px-9 py-8 text-center">
        <p className="text-sm leading-7 text-wedding-gray-light">
          * 화환은 반입이 불가하오니, 정중히 사양합니다.
        </p>
      </div>
    </FadeInUp>
  );
}

export default function HomePageClient() {
  const toast = useToast();
  const hasShownLoginToast = useRef(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const { data } = useWeddingContentQuery("main");
  const content = data?.content ?? FALLBACK_WEDDING_CONTENT;
  const disableZoom = content.weddingData.display?.disableZoom !== false;

  const renderSection = (sectionId: PageSectionId) => {
    switch (sectionId) {
      case "hero":
        return (
          <MainHero
            groom={content.weddingData.groom}
            bride={content.weddingData.bride}
            date={content.weddingData.date}
            section={content.heroSection}
            venue={content.weddingData.venue}
            rsvpTitle={content.rsvpSection.title}
          />
        );
      case "invitation":
        return (
          <FadeInUp delay={0.05} amount={0.15}>
            <InvitationMessage
              section={content.invitationSection}
              groom={content.weddingData.groom}
              bride={content.weddingData.bride}
            />
          </FadeInUp>
        );
      case "interview":
        return (
          <InterviewSection
            section={content.interviewSection}
            groom={content.weddingData.groom}
            bride={content.weddingData.bride}
          />
        );
      case "gallery":
        return (
          <FadeInUp delay={0.15} amount={0.15}>
            <ImageGallery section={content.gallerySection} />
          </FadeInUp>
        );
      case "calendar":
        return (
          <FadeInUp delay={0.2} amount={0.15}>
            <WeddingCalendar
              date={content.weddingData.date}
              section={content.calendarSection}
            />
          </FadeInUp>
        );
      case "location":
        return (
          <VenueInfo
            venue={content.weddingData.venue}
            date={content.weddingData.date}
          />
        );
      case "guestbook":
        return (
          <FadeInUp delay={0.3} amount={0.15}>
            <Guestbook section={content.guestbookSection} />
          </FadeInUp>
        );
      case "rsvp":
        return (
          <FadeInUp delay={0.33} amount={0.15}>
            <RsvpSection
              section={content.rsvpSection}
              weddingData={content.weddingData}
            />
          </FadeInUp>
        );
      case "snap":
        return (
          <FadeInUp delay={0.36} amount={0.15}>
            <SnapSection section={content.snapSection} />
          </FadeInUp>
        );
      case "account":
        return (
          <FadeInUp delay={0.35} amount={0.15}>
            <AccountSection
              section={content.accountSection}
              weddingData={content.weddingData}
            />
          </FadeInUp>
        );
      case "closing":
        return (
          <FadeInUp delay={0.4} amount={0.15}>
            <FinalThanksSection section={content.closingSection} content={content} />
          </FadeInUp>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    if (hasShownLoginToast.current) return;

    let cancelled = false;
    void apiFetch<{ authenticated: boolean }>("/api/admin/auth/session")
      .then((result) => {
        if (cancelled) return;
        setIsAdminAuthenticated(result.authenticated);
        if (cancelled || !result.authenticated || hasShownLoginToast.current)
          return;
        hasShownLoginToast.current = true;
        toast.success("로그인되었습니다.");
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
      <ViewportZoomController disabled={disableZoom} />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[#EEDBC8]"
      >
        <div className="mx-auto h-full w-full max-w-[425px] bg-white" />
      </div>
      <main className="relative z-10 mx-auto w-full max-w-[425px] border-x border-[#efe2d1] bg-white/95 shadow-[0_24px_64px_rgba(103,76,48,0.16)] backdrop-blur-sm">
        <div className="relative z-10 bg-white/94">
          {content.pageSectionOrder
            .filter((sectionId) => content.pageSectionVisibility[sectionId])
            .map((sectionId) => (
              <div key={sectionId}>
                {renderSection(sectionId)}
                {sectionId === "rsvp" ? <FlowerNotice /> : null}
              </div>
            ))}
        </div>
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
