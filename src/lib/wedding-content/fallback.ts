import {
  ACCOUNT_SECTION,
  CALENDAR_SECTION,
  CLOSING_SECTION,
  FLOATING_NAV_ITEMS,
  PAGE_SECTION_ORDER,
  PAGE_SECTION_VISIBILITY,
  GALLERY_SECTION,
  GUESTBOOK_SECTION,
  HERO_SECTION,
  INTERVIEW_SECTION,
  INVITATION_SECTION,
  RSVP_SECTION,
  SNAP_SECTION,
  WEDDING_DATA,
} from '@/constants/wedding-data';
import type { WeddingContentV1 } from '@/types';

export const FALLBACK_WEDDING_CONTENT: WeddingContentV1 = {
  weddingData: WEDDING_DATA,
  heroSection: HERO_SECTION,
  invitationSection: INVITATION_SECTION,
  calendarSection: CALENDAR_SECTION,
  gallerySection: GALLERY_SECTION,
  interviewSection: INTERVIEW_SECTION,
  guestbookSection: GUESTBOOK_SECTION,
  rsvpSection: RSVP_SECTION,
  accountSection: ACCOUNT_SECTION,
  snapSection: SNAP_SECTION,
  closingSection: CLOSING_SECTION,
  pageSectionOrder: PAGE_SECTION_ORDER,
  pageSectionVisibility: PAGE_SECTION_VISIBILITY,
  floatingNavItems: FLOATING_NAV_ITEMS,
};
