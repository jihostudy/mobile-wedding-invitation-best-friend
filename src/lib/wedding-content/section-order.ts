import type { PageSectionId, PageSectionVisibility } from "@/types";

export const DEFAULT_PAGE_SECTION_ORDER: PageSectionId[] = [
  "hero",
  "invitation",
  "interview",
  "gallery",
  "calendar",
  "location",
  "guestbook",
  "rsvp",
  "snap",
  "account",
  "closing",
];

export const PAGE_SECTION_LABELS: Record<PageSectionId, string> = {
  hero: "상단 소개",
  invitation: "초대 문구",
  interview: "인터뷰",
  gallery: "갤러리",
  calendar: "예식 일정",
  location: "오시는 길",
  guestbook: "방명록",
  rsvp: "참석 의사 전달",
  snap: "스냅",
  account: "계좌 정보",
  closing: "마지막 감사 이미지",
};

export const DEFAULT_PAGE_SECTION_VISIBILITY: PageSectionVisibility = {
  hero: true,
  invitation: true,
  interview: true,
  gallery: true,
  calendar: true,
  location: true,
  guestbook: true,
  rsvp: true,
  snap: true,
  account: true,
  closing: true,
};

export function normalizePageSectionOrder(
  order?: readonly string[] | null,
): PageSectionId[] {
  const next: PageSectionId[] = [];
  const seen = new Set<PageSectionId>();

  for (const id of order ?? []) {
    if (!DEFAULT_PAGE_SECTION_ORDER.includes(id as PageSectionId)) continue;
    const sectionId = id as PageSectionId;
    if (seen.has(sectionId)) continue;
    next.push(sectionId);
    seen.add(sectionId);
  }

  for (const id of DEFAULT_PAGE_SECTION_ORDER) {
    if (seen.has(id)) continue;
    next.push(id);
  }

  return next;
}

export function normalizePageSectionVisibility(
  visibility?: unknown,
): PageSectionVisibility {
  const next: PageSectionVisibility = { ...DEFAULT_PAGE_SECTION_VISIBILITY };
  if (!visibility || typeof visibility !== "object") {
    return next;
  }

  const visibilityRecord = visibility as Record<string, unknown>;

  for (const id of DEFAULT_PAGE_SECTION_ORDER) {
    const value = visibilityRecord[id];
    if (typeof value === "boolean") {
      next[id] = value;
    }
  }

  return next;
}
