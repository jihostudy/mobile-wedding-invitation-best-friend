/**
 * 청첩장 정적 데이터
 * 실제 정보로 교체 필요
 */

import { WeddingInfo, GalleryImage } from "@/types";

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
};

export const GALLERY_IMAGES: GalleryImage[] = [
  {
    id: "1",
    url: "/images/gallery/couple-1.jpg",
    alt: "신랑신부 메인 사진",
    width: 800,
    height: 1200,
  },
  {
    id: "2",
    url: "/images/gallery/couple-2.jpg",
    alt: "신랑신부 야외 사진",
    width: 800,
    height: 1200,
  },
  {
    id: "3",
    url: "/images/gallery/couple-3.jpg",
    alt: "신랑신부 웨딩 사진",
    width: 800,
    height: 1200,
  },
  {
    id: "4",
    url: "/images/gallery/couple-4.jpg",
    alt: "신랑신부 사진",
    width: 800,
    height: 1200,
  },
  {
    id: "5",
    url: "/images/gallery/couple-5.jpg",
    alt: "신랑신부 사진",
    width: 800,
    height: 1200,
  },
  {
    id: "6",
    url: "/images/gallery/couple-6.jpg",
    alt: "신랑신부 사진",
    width: 800,
    height: 1200,
  },
  {
    id: "7",
    url: "/images/gallery/couple-7.jpg",
    alt: "신랑신부 사진",
    width: 800,
    height: 1200,
  },
  {
    id: "8",
    url: "/images/gallery/couple-8.jpg",
    alt: "신랑신부 사진",
    width: 800,
    height: 1200,
  },
  {
    id: "9",
    url: "/images/gallery/couple-9.jpg",
    alt: "신랑신부 사진",
    width: 800,
    height: 1200,
  },
];

export const MAIN_IMAGE_URL = "/images/main-couple.jpg";

export const INVITATION_MESSAGE = `
예전, 아주 작은 인연이 저희를 연인으로 만들었고
오늘, 그 인연으로 저희가 하나가 됩니다.

작은 사랑으로 하나의 커다란 열매를 맺고
이제 또 다른 모습으로 사랑하고자 하는 두 사람.
오셔서 지켜봐 주시고 축하해 주십시오.

늘 그 인연을 생각하며 살겠습니다.
`.trim();

export const ACCOUNT_INFO = {
  groom: {
    bank: "신한은행",
    account: "110-123-456789",
    holder: "김민섭",
  },
  bride: {
    bank: "카카오뱅크",
    account: "3333-01-1234567",
    holder: "전이서",
  },
};
