import {
  ACCOUNT_SECTION,
  FLOATING_NAV_ITEMS,
  GALLERY_SECTION,
  HERO_SECTION,
  INTERVIEW_SECTION,
  INVITATION_SECTION,
  SAMPLE_GUESTBOOK_MESSAGES,
  SNAP_SECTION,
  WEDDING_DATA,
} from '@/constants/wedding-data';
import type { WeddingContentV1 } from '@/types';

export const FALLBACK_WEDDING_CONTENT: WeddingContentV1 = {
  weddingData: WEDDING_DATA,
  heroSection: HERO_SECTION,
  invitationSection: INVITATION_SECTION,
  gallerySection: GALLERY_SECTION,
  interviewSection: INTERVIEW_SECTION,
  accountSection: ACCOUNT_SECTION,
  snapSection: SNAP_SECTION,
  floatingNavItems: FLOATING_NAV_ITEMS,
  sampleGuestbookMessages: SAMPLE_GUESTBOOK_MESSAGES,
};
