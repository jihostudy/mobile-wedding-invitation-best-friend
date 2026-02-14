/**
 * 청첩장 정적 데이터
 * 실제 정보로 교체 필요
 */

import {
  WeddingInfo,
  GalleryImage,
  HeroSectionData,
  InvitationSectionData,
  CalendarSectionData,
  GallerySectionData,
  LocationSectionData,
  AccountSectionData,
  ClosingSectionData,
  FloatingNavItem,
} from "@/types";

export const WEDDING_DATA: WeddingInfo = {
  groom: {
    name: "김민섭",
    englishName: "Kim Min Seop",
    parents: {
      father: "김○○",
      mother: "○○○",
    },
    contact: "010-0000-0000",
  },
  bride: {
    name: "전이서",
    englishName: "Jeon Yi Seo",
    parents: {
      father: "전○○",
      mother: "○○○",
    },
    contact: "010-0000-0000",
  },
  date: {
    year: 2026,
    month: 6,
    day: 2,
    dayOfWeek: "화요일", // 2026년 6월 2일은 화요일
    time: "오후 12시 30분",
    fullDate: new Date(2026, 5, 2, 12, 30), // month는 0부터 시작 (5 = 6월), 12:30
  },
  venue: {
    name: "아펠가모 반포점",
    address: "서울특별시 강남구 테헤란로 123",
    floor: "5층",
    hall: "그랜드볼룸",
    coordinates: {
      lat: 37.5665,
      lng: 126.978,
    },
    parking: "건물 지하 1~3층 무료 주차 가능",
    transport: {
      subway: [
        "2호선 강남역 3번 출구 도보 5분",
        "신분당선 강남역 4번 출구 도보 3분",
      ],
      bus: ["간선버스: 146, 540, 4318", "지선버스: 3414, 4318"],
      parking: "건물 지하 1~3층 (3시간 무료)",
    },
  },
  account: {
    groom: {
      bank: "신한은행",
      account: "110-123-456789",
      holder: "김민섭",
      label: "신랑측",
    },
    bride: {
      bank: "카카오뱅크",
      account: "3333-01-1234567",
      holder: "전이서",
      label: "신부측",
    },
  },
  share: {
    title: "김민섭 ♥ 전이서 결혼합니다",
    description: "2026년 6월 2일 화요일 오후 12시 30분",
    imageUrl: "/images/placeholder-couple.svg",
  },
};

export const GALLERY_IMAGES: GalleryImage[] = [
  {
    id: "1",
    url: "/images/placeholder-couple.svg",
    alt: "신랑신부 메인 사진",
    width: 800,
    height: 1200,
  },
  {
    id: "2",
    url: "/images/placeholder-couple.svg",
    alt: "신랑신부 야외 사진",
    width: 800,
    height: 1200,
  },
  {
    id: "3",
    url: "/images/placeholder-couple.svg",
    alt: "신랑신부 웨딩 사진",
    width: 800,
    height: 1200,
  },
  {
    id: "4",
    url: "/images/placeholder-couple.svg",
    alt: "신랑신부 사진",
    width: 800,
    height: 1200,
  },
  {
    id: "5",
    url: "/images/placeholder-couple.svg",
    alt: "신랑신부 사진",
    width: 800,
    height: 1200,
  },
  {
    id: "6",
    url: "/images/placeholder-couple.svg",
    alt: "신랑신부 사진",
    width: 800,
    height: 1200,
  },
  {
    id: "7",
    url: "/images/placeholder-couple.svg",
    alt: "신랑신부 사진",
    width: 800,
    height: 1200,
  },
  {
    id: "8",
    url: "/images/placeholder-couple.svg",
    alt: "신랑신부 사진",
    width: 800,
    height: 1200,
  },
  {
    id: "9",
    url: "/images/placeholder-couple.svg",
    alt: "신랑신부 사진",
    width: 800,
    height: 1200,
  },
];

export const MAIN_IMAGE_URL = "/images/placeholder-couple.svg";

export const INVITATION_MESSAGE = `
예전, 아주 작은 인연이 저희를 연인으로 만들었고
오늘, 그 인연으로 저희가 하나가 됩니다.

작은 사랑으로 하나의 커다란 열매를 맺고
이제 또 다른 모습으로 사랑하고자 하는 두 사람.
오셔서 지켜봐 주시고 축하해 주십시오.

늘 그 인연을 생각하며 살겠습니다.
`.trim();

export const HERO_SECTION: HeroSectionData = {
  kicker: "THE WEDDING OF",
  title: `${WEDDING_DATA.groom.name} 그리고 ${WEDDING_DATA.bride.name}`,
  scriptLine: "We are getting married",
  dateLine: `${WEDDING_DATA.date.year}년 ${WEDDING_DATA.date.month}월 ${WEDDING_DATA.date.day}일 ${WEDDING_DATA.date.dayOfWeek} ${WEDDING_DATA.date.time}`,
  venueLine: WEDDING_DATA.venue.name,
  mainImage: {
    url: MAIN_IMAGE_URL,
    alt: `${WEDDING_DATA.groom.name}과 ${WEDDING_DATA.bride.name}의 결혼식`,
  },
};

export const INVITATION_SECTION: InvitationSectionData = {
  kicker: "INVITATION",
  title: "초대합니다",
  message: INVITATION_MESSAGE,
  contactCtaLabel: "연락하기",
};

export const CALENDAR_SECTION: CalendarSectionData = {
  title: "WEDDING DAY",
  subtitle: `${WEDDING_DATA.date.dayOfWeek} ${WEDDING_DATA.date.time}`,
  monthLabel: `${WEDDING_DATA.date.year}.${String(WEDDING_DATA.date.month).padStart(2, "0")}`,
};

export const GALLERY_SECTION: GallerySectionData = {
  kicker: "GALLERY",
  title: "우리의 순간",
  images: GALLERY_IMAGES,
};

export const LOCATION_SECTION: LocationSectionData = {
  kicker: "LOCATION",
  title: "오시는 길",
  mapCtaLabel: "네이버지도에서 보기",
};

export const ACCOUNT_SECTION: AccountSectionData = {
  kicker: "ACCOUNT",
  title: "마음 전하실 곳",
  description: "참석이 어려우신 분들을 위해 계좌번호를 안내드립니다.",
  accounts: WEDDING_DATA.account
    ? [WEDDING_DATA.account.groom, WEDDING_DATA.account.bride]
    : [],
};

export const CLOSING_SECTION: ClosingSectionData = {
  kicker: "THANK YOU",
  title: "소중한 분들을 초대합니다",
  messages: [
    "소중한 분들의 축복 속에서",
    "두 사람이 하나 되어 새로운 출발을 합니다.",
    "따뜻한 마음으로 지켜봐 주세요.",
  ],
  copyButtonLabel: "청첩장 링크 복사하기",
};

export const FLOATING_NAV_ITEMS: FloatingNavItem[] = [
  { id: "hero", label: "처음" },
  { id: "calendar", label: "일정" },
  { id: "gallery", label: "사진" },
  { id: "location", label: "오시는 길" },
  { id: "account", label: "계좌" },
  { id: "guestbook", label: "방명록" },
];
