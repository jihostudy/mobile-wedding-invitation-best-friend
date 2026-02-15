/**
 * 청첩장 정적 데이터
 * 실제 정보로 교체 필요
 */

import {
  WeddingInfo,
  GalleryImage,
  GuestMessage,
  HeroSectionData,
  InvitationSectionData,
  CalendarSectionData,
  GallerySectionData,
  InterviewSectionData,
  LocationSectionData,
  AccountSectionData,
  FloatingNavItem,
} from "@/types";

export const WEDDING_DATA: WeddingInfo = {
  groom: {
    name: "김동현",
    englishName: "Kim Dong Hyun",
    parents: {
      father: "김○○",
      mother: "○○○",
    },
    contact: "010-0000-0000",
  },
  bride: {
    name: "강다연",
    englishName: "Kang Da Yeon",
    parents: {
      father: "강○○",
      mother: "○○○",
    },
    contact: "010-0000-0000",
  },
  date: {
    year: 2026,
    month: 6,
    day: 20,
    dayOfWeek: "토요일",
    time: "오후 12시 30분",
    fullDate: new Date(2026, 5, 2, 12, 30), // month는 0부터 시작 (5 = 6월), 12:30
  },
  venue: {
    name: "루클라비더화이트",
    address: "서울 강남구 논현로 742",
    floor: "2층, 4층",

    coordinates: {
      lat: 37.518468,
      lng: 127.029789,
    },
    parking: "건물 지하 1~3층 무료 주차 가능",
    transport: {
      subway: [
        "신분당선 신사역 1번 출구 도보 15분",
        "7호선 학동역 8번 출구 도보 7분",
      ],
      subwayDetails: [
        { label: "신분당선 신사역 1번 출구 도보 15분", color: "#D31145" },
        { label: "7호선 학동역 8번 출구 도보 7분", color: "#747F00" },
      ],
      bus: ["간선버스: 146, 540, 4318", "지선버스: 3414, 4318"],
      parking: "건물 지하 1~3층 (3시간 무료)",
      shuttlePickup: "학동역 8번 출구 앞 셔틀 탑승",
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
저희 두 사람의 작은 만남이
사랑의 결실을 이루어
소중한 결혼식을 올리게 되었습니다.

평생 서로 귀하게 여기며
첫 마음 그대로 존중하고 배려하며 살겠습니다.

오로지 믿음과 사랑을 약속하는 날
오셔서 축복해 주시면 더 없는 기쁨으로
간직하겠습니다.
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
  title: "소중한 분들을 초대합니다",
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
  title: "웨딩 갤러리",
  images: GALLERY_IMAGES,
};

export const INTERVIEW_SECTION: InterviewSectionData = {
  kicker: "INTERVIEW",
  title: "우리 두 사람의 이야기",
  description: "결혼을 앞두고 저희 두 사람의\n인터뷰를 준비했습니다.",
  image: {
    url: MAIN_IMAGE_URL,
    alt: "신랑 신부 인터뷰 대표 사진",
  },
  buttonLabel: "신랑 & 신부의 인터뷰 읽어보기",
  questions: [
    {
      question: "Q1. 결혼을 앞둔 소감",
      answers: [
        {
          role: "신랑",
          name: WEDDING_DATA.groom.name,
          paragraphs: [
            "드디어 장가갑니다! 먼저 인생에서 가장 큰 결심을 할 수 있게 해준 예비 신부에게 정말 고맙습니다.",
            "가족이라는 단어를 함께 한다는 것은 정말 설레고 아름다운 일이지만 그만큼 책임감을 더 갖고 살아야겠다고 다짐했습니다.",
            "저희 부부가 한걸음 한걸음 성장해 나가는 모습을 지켜봐주시고 응원해주세요.",
          ],
        },
        {
          role: "신부",
          name: WEDDING_DATA.bride.name,
          paragraphs: [
            "오래된 연인에서 이제는 서로의 부부가 되기로 약속했습니다.",
            "아직은 남자친구라는 말이 더 익숙하지만, 그동안 제 옆을 든든하게 지켜주면서 큰 행복을 준 예비 신랑에게 고맙습니다.",
            "이제는 저의 평생의 반려자가 될 신랑에게 좋은 아내로서 더욱 배려하며 큰 힘이 되는 존재로 살겠습니다.",
          ],
        },
      ],
    },
    {
      question: "Q2. 앞으로의 우리",
      answers: [
        {
          role: "신랑",
          name: WEDDING_DATA.groom.name,
          paragraphs: [
            "서로의 다름을 존중하면서 같은 방향을 바라보는 부부가 되고 싶습니다.",
            "사소한 일상에서도 감사함을 잊지 않고, 웃음이 많은 가정을 만들어가겠습니다.",
          ],
        },
        {
          role: "신부",
          name: WEDDING_DATA.bride.name,
          paragraphs: [
            "서로에게 가장 편안한 쉼이 되는 사람이 되고 싶습니다.",
            "좋은 날도 어려운 날도 손을 놓지 않고, 함께 성장하는 부부로 살아가겠습니다.",
          ],
        },
      ],
    },
  ],
};

export const LOCATION_SECTION: LocationSectionData = {
  kicker: "LOCATION",
  title: "오시는 길",
  mapCtaLabel: "네이버지도에서 보기",
};

export const ACCOUNT_SECTION: AccountSectionData = {
  kicker: "ACCOUNT",
  title: "마음 전하실 곳",
  description:
    "참석이 어려우신 분들을 위해\n계좌번호를 기재하였습니다.\n너그러운 마음으로 양해 부탁드립니다.",
  groups: [
    {
      id: "groom",
      label: "신랑측",
      accounts: [
        {
          holder: WEDDING_DATA.groom.name,
          bank: WEDDING_DATA.account?.groom.bank || "신한은행",
          account: WEDDING_DATA.account?.groom.account || "110-000-000000",
          kakaoPayLink: "https://pay.kakao.com",
        },
        {
          holder: WEDDING_DATA.groom.parents?.father || "신랑 아버지",
          bank: "우리은행",
          account: "110-000-000001",
        },
        {
          holder: WEDDING_DATA.groom.parents?.mother || "신랑 어머니",
          bank: "국민은행",
          account: "110-000-000002",
        },
      ],
    },
    {
      id: "bride",
      label: "신부측",
      accounts: [
        {
          holder: WEDDING_DATA.bride.name,
          bank: WEDDING_DATA.account?.bride.bank || "하나은행",
          account: WEDDING_DATA.account?.bride.account || "110-000-000003",
          kakaoPayLink: "https://pay.kakao.com",
        },
        {
          holder: WEDDING_DATA.bride.parents?.father || "신부 아버지",
          bank: "토스뱅크",
          account: "110-000-000004",
        },
        {
          holder: WEDDING_DATA.bride.parents?.mother || "신부 어머니",
          bank: "카카오뱅크",
          account: "110-000-000005",
        },
      ],
    },
  ],
};

export const FLOATING_NAV_ITEMS: FloatingNavItem[] = [
  { id: "hero", label: "처음" },
  { id: "interview", label: "인터뷰" },
  { id: "gallery", label: "사진" },
  { id: "calendar", label: "일정" },
  { id: "location", label: "오시는 길" },
  { id: "account", label: "계좌" },
  { id: "guestbook", label: "방명록" },
];

export const SAMPLE_GUESTBOOK_MESSAGES: GuestMessage[] = [
  {
    id: "sample-1",
    author: "해니",
    message:
      "🎀💘 결혼 너무 축하해요 💗💞🎉🎊 새로운 인생 시작 🔥 앞날이 행복으로 가득하길 바래요!!!!",
    createdAt: new Date("2026-03-10T10:20:00+09:00"),
    isPublic: true,
  },
  {
    id: "sample-2",
    author: "김현우",
    message:
      "🎉 진호님! 나은님! 드디어 현실판 로맨스 영화 개봉인가요?! 🎬 두 분, 진짜 천생연분이니까 행복만 하세요~ 쪽쪽쪽! 💖",
    createdAt: new Date("2026-03-11T12:05:00+09:00"),
    isPublic: true,
  },
  {
    id: "sample-3",
    author: "윤미",
    message:
      "이나은, 결혼 그거 나랑 하기로 했었잖아. 그래도 너의 행복을 위해 보내줄게~ 사랑하는 우리 나은 결혼 너무 너무 축하해!!!💖👰🏻🤵🏻💖",
    createdAt: new Date("2026-03-12T09:35:00+09:00"),
    isPublic: true,
  },
  {
    id: "sample-4",
    author: "유인",
    message:
      "진호형, 나은누나! 두 분의 결혼을 진심으로 축하드립니다💐 언제나 지금처럼 사랑 가득한 날들 보내세요!",
    createdAt: new Date("2026-03-12T20:10:00+09:00"),
    isPublic: true,
  },
];
