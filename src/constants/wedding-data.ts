/**
 * 청첩장 데이터 원본
 *
 * 나는 admin 기능을 만들어서 친구가 이 사이트의 데이터들을 수정할 수 있는 admin 기능을 제공할거야.
 * 따라서, 동적으로 수정할 수 있는 부분과 수정 불가능한 부분을 잘 나눠서 데이터로 저장해야 한다.
 *
 * 원칙:
 * - 이 파일에는 admin에서 수정할 데이터만 저장한다.
 * - 섹션 제목/버튼 라벨 같은 고정 UI 문구는 각 컴포넌트 JSX에 둔다.
 * - 중복 파생 데이터(예: dateLine, title 조합문)는 저장하지 않고 화면에서 조합한다.
 */

import {
  WeddingInfo,
  GalleryImage,
  HeroSectionData,
  InvitationSectionData,
  CalendarSectionData,
  GallerySectionData,
  GuestbookSectionData,
  RsvpSectionData,
  SnapSectionData,
  InterviewSectionData,
  AccountSectionData,
  ClosingSectionData,
  FloatingNavItem,
  PageSectionId,
  PageSectionVisibility,
} from "@/types";
import {
  DEFAULT_PAGE_SECTION_ORDER,
  DEFAULT_PAGE_SECTION_VISIBILITY,
} from "@/lib/wedding-content/section-order";

// 1) Core wedding profile
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
    time: "낮 12시 30분",
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
      navigation: {
        description: "원하시는 앱을 선택하시면 길안내가 시작됩니다.",
        apps: [
          {
            id: "naver",
            label: "네이버지도",
            enabled: true,
            deepLink:
              "nmap://route/public?dlat=37.518468&dlng=127.029789&dname=%EB%A3%A8%ED%81%B4%EB%9D%BC%EB%B9%84%EB%8D%94%ED%99%94%EC%9D%B4%ED%8A%B8&appname=com.wedding.invitation",
            webUrl:
              "https://map.naver.com/v5/directions/-/127.029789,37.518468,%EB%A3%A8%ED%81%B4%EB%9D%BC%EB%B9%84%EB%8D%94%ED%99%94%EC%9D%B4%ED%8A%B8/-/transit",
          },
          {
            id: "tmap",
            label: "티맵",
            enabled: true,
            deepLink:
              "tmap://route?goalx=127.029789&goaly=37.518468&goalname=%EB%A3%A8%ED%81%B4%EB%9D%BC%EB%B9%84%EB%8D%94%ED%99%94%EC%9D%B4%ED%8A%B8",
            webUrl:
              "https://m.tmap.co.kr/tmap2/mobile/route.jsp?goalx=127.029789&goaly=37.518468&goalname=%EB%A3%A8%ED%81%B4%EB%9D%BC%EB%B9%84%EB%8D%94%ED%99%94%EC%9D%B4%ED%8A%B8",
          },
          {
            id: "kakao",
            label: "카카오내비",
            enabled: true,
            deepLink:
              "kakaonavi://navigate?name=%EB%A3%A8%ED%81%B4%EB%9D%BC%EB%B9%84%EB%8D%94%ED%99%94%EC%9D%B4%ED%8A%B8&x=127.029789&y=37.518468",
            webUrl:
              "https://map.kakao.com/link/to/%EB%A3%A8%ED%81%B4%EB%9D%BC%EB%B9%84%EB%8D%94%ED%99%94%EC%9D%B4%ED%8A%B8,37.518468,127.029789",
          },
        ],
      },
      subway: [
        "신분당선 신사역 1번 출구 도보 15분",
        "7호선 학동역 8번 출구 도보 7분",
      ],
      subwayDetails: [
        { label: "신분당선 신사역 1번 출구 도보 15분", color: "#D31145" },
        { label: "7호선 학동역 8번 출구 도보 7분", color: "#747F00" },
      ],
      busDetails: [
        { label: "간선버스 : 146, 540, 4318", color: "#1d3f8a" },
        { label: "지선버스 : 3414, 4318", color: "#2d9b46" },
      ],
      bus: ["간선버스: 146, 540, 4318", "지선버스: 3414, 4318"],
      parking: "건물 지하 1~3층 (3시간 무료)",
      shuttlePickup: "학동역 8번 출구 앞 셔틀 탑승",
    },
  },
  backgroundMusic: {
    enabled: true,
    src: "/audio/sound_test.mp3",
    autoplay: false,
    loop: true,
    volume: 0.4,
    title: "웨딩 배경음악",
  },
};

// 2) Hero
export const HERO_SECTION: HeroSectionData = {
  primaryImage: {
    url: "/images/placeholder-couple.svg",
    alt: `${WEDDING_DATA.groom.name}과 ${WEDDING_DATA.bride.name}의 결혼식`,
  },
  secondaryImage: {
    url: "/images/placeholder-couple.svg",
    alt: `${WEDDING_DATA.groom.name}과 ${WEDDING_DATA.bride.name}의 결혼식`,
  },
  titleText: "결혼합니다",
};

// 3) Invitation
export const INVITATION_SECTION: InvitationSectionData = {
  kicker: "INVITATION",
  title: "소중한 분들을 초대합니다",
  message: `
저희 두 사람의 작은 만남이
사랑의 결실을 이루어
소중한 결혼식을 올리게 되었습니다.

평생 서로 귀하게 여기며
첫 마음 그대로 존중하고 배려하며 살겠습니다.

오로지 믿음과 사랑을 약속하는 날
오셔서 축복해 주시면 더 없는 기쁨으로
간직하겠습니다.
`.trim(),
};

export const CALENDAR_SECTION: CalendarSectionData = {
  countdownLabel: "동현❤️강다연의 결혼식",
};

// 4) Gallery
const GALLERY_IMAGES: GalleryImage[] = [
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

export const GALLERY_SECTION: GallerySectionData = {
  kicker: "GALLERY",
  title: "웨딩 갤러리",
  batchSize: 6,
  images: GALLERY_IMAGES,
};

// 5) Interview
export const INTERVIEW_SECTION: InterviewSectionData = {
  kicker: "INTERVIEW",
  title: "우리 두 사람의 이야기",
  description: "결혼을 앞두고 저희 두 사람의\n인터뷰를 준비했습니다.",
  image: {
    url: "/images/placeholder-couple.svg",
    alt: "신랑 신부 인터뷰 대표 사진",
  },
  questions: [
    {
      question: "Q1. 결혼을 앞둔 소감",
      answers: [
        {
          side: "groom",
          content:
            "드디어 장가갑니다! 먼저 인생에서 가장 큰 결심을 할 수 있게 해준 예비 신부에게 정말 고맙습니다.\n\n가족이라는 단어를 함께 한다는 것은 정말 설레고 아름다운 일이지만 그만큼 책임감을 더 갖고 살아야겠다고 다짐했습니다.\n\n저희 부부가 한걸음 한걸음 성장해 나가는 모습을 지켜봐주시고 응원해주세요.",
        },
        {
          side: "bride",
          content:
            "오래된 연인에서 이제는 서로의 부부가 되기로 약속했습니다.\n\n아직은 남자친구라는 말이 더 익숙하지만, 그동안 제 옆을 든든하게 지켜주면서 큰 행복을 준 예비 신랑에게 고맙습니다.\n\n이제는 저의 평생의 반려자가 될 신랑에게 좋은 아내로서 더욱 배려하며 큰 힘이 되는 존재로 살겠습니다.",
        },
      ],
    },
    {
      question: "Q2. 앞으로의 우리",
      answers: [
        {
          side: "groom",
          content:
            "서로의 다름을 존중하면서 같은 방향을 바라보는 부부가 되고 싶습니다.\n\n사소한 일상에서도 감사함을 잊지 않고, 웃음이 많은 가정을 만들어가겠습니다.",
        },
        {
          side: "bride",
          content:
            "서로에게 가장 편안한 쉼이 되는 사람이 되고 싶습니다.\n\n좋은 날도 어려운 날도 손을 놓지 않고, 함께 성장하는 부부로 살아가겠습니다.",
        },
      ],
    },
  ],
};

// 6) Guestbook
export const GUESTBOOK_SECTION: GuestbookSectionData = {
  kicker: "GUESTBOOK",
  title: "방명록",
};

// 7) RSVP
export const RSVP_SECTION: RsvpSectionData = {
  kicker: "R.S.V.P.",
  title: "참석 의사 전달",
  description: "신랑, 신부에게 참석의사를\n미리 전달할 수 있어요.",
};

// 8) Account
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
          bank: "신한은행",
          account: "110-123-456789",
        },
        {
          bank: "우리은행",
          account: "110-000-000001",
        },
        {
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
          bank: "카카오뱅크",
          account: "3333-01-1234567",
        },
        {
          bank: "토스뱅크",
          account: "110-000-000004",
        },
        {
          bank: "카카오뱅크",
          account: "110-000-000005",
        },
      ],
    },
  ],
};

// 7) RSVP + Snap
export const SNAP_SECTION: SnapSectionData = {
  kicker: "CAPTURE OUR MOMENTS",
  title: "스냅",
  description:
    "신랑신부의 행복한 순간을 담아주세요.\n예식 당일, 아래 버튼을 통해 사진을 올려주세요.\n많은 참여 부탁드려요!",
  uploadOpenAt: "2026-06-20T11:30:00+09:00",
  images: [
    {
      id: "snap-1",
      url: "/images/placeholder-couple.svg",
      alt: "스냅 예시 사진 1",
      rotation: -16,
      offsetX: -52,
    },
    {
      id: "snap-2",
      url: "/images/placeholder-couple.svg",
      alt: "스냅 예시 사진 2",
      rotation: -4,
      offsetX: 0,
    },
    {
      id: "snap-3",
      url: "/images/placeholder-couple.svg",
      alt: "스냅 예시 사진 3",
      rotation: 10,
      offsetX: 50,
    },
  ],
  modal: {
    backLabel: "청첩장 보기",
    coverImage: {
      url: "/images/placeholder-couple.svg",
      alt: "스냅 업로드 커버 이미지",
    },
    coverKicker: "스냅",
    coverTitle: "예식 당일, 빛나는 순간을\n공유해 주세요!",
    coverNames: "김진호 · 이나은",
    guideTitle: "우리의 소중한 순간을 함께 담아주세요!",
    guideLines: [
      "1. 설렘 가득한 신랑·신부의 모습",
      "2. 두 사람의 빛나는 입장 & 행진",
      "3. 가족, 친구들과 함께한 따뜻한 찰나",
      "4. 그리고 여러분의 시선에서 담은 순간들까지!",
    ],
    guideHighlightLines: [
      "📸 가장 멋진 사진을 공유해주신 분께는 신랑·신부가 직접 준비한 맛있는 한 끼를 선물로 드립니다!",
      "✨ 예식 당일, 아래 사진 첨부하기 버튼을 눌러 사진을 업로드해주세요. 작은 순간 하나하나가 저희에게 큰 선물이 될 거예요.",
      "여러분의 많은 참여, 기다리고 있겠습니다❤️",
    ],
    nameLabel: "이름",
    namePlaceholder: "입력하신 이름으로 폴더가 생성됩니다.",
    uploadEmptyHint: "예식 당일 촬영한 사진을 업로드해 주세요.",
    attachButtonLabel: "사진 첨부하기",
    maxFiles: 40,
    policyLines: [
      "한 번에 최대 40장까지 업로드하실 수 있습니다.",
      "가능하면 여러 장을 한 번에 묶어서 업로드해 주세요.",
      "업로드 가능한 파일 크기는 사진 1장당 10MB 이하입니다.",
      "업로드는 예식 당일부터 다음날까지 가능합니다.",
    ],
  },
};

export const CLOSING_SECTION: ClosingSectionData = {
  image: {
    url: "/images/placeholder-couple.svg",
    alt: "감사 인사 이미지",
  },
};

export const PAGE_SECTION_ORDER: PageSectionId[] = [...DEFAULT_PAGE_SECTION_ORDER];
export const PAGE_SECTION_VISIBILITY: PageSectionVisibility = {
  ...DEFAULT_PAGE_SECTION_VISIBILITY,
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
