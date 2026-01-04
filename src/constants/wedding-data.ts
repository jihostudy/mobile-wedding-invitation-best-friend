/**
 * 청첩장 정적 데이터
 * 실제 정보로 교체 필요
 */

import { WeddingInfo, GalleryImage } from '@/types';

export const WEDDING_DATA: WeddingInfo = {
  groom: {
    name: '김민섭',
    englishName: 'Kim Min Seop',
    parents: {
      father: '김○○',
      mother: '○○○',
    },
    contact: '010-0000-0000',
  },
  bride: {
    name: '전이서',
    englishName: 'Jeon Yi Seo',
    parents: {
      father: '전○○',
      mother: '○○○',
    },
    contact: '010-0000-0000',
  },
  date: {
    year: 2025,
    month: 3,
    day: 1,
    dayOfWeek: '토요일',
    time: '오후 2시 50분',
    fullDate: new Date(2025, 2, 1, 14, 50),
  },
  venue: {
    name: '더컨벤션 웨딩홀',
    address: '서울특별시 강남구 테헤란로 123',
    floor: '5층',
    hall: '그랜드볼룸',
    coordinates: {
      lat: 37.5665,
      lng: 126.9780,
    },
    parking: '건물 지하 1~3층 무료 주차 가능',
    transport: {
      subway: ['2호선 강남역 3번 출구 도보 5분', '신분당선 강남역 4번 출구 도보 3분'],
      bus: ['간선버스: 146, 540, 4318', '지선버스: 3414, 4318'],
      parking: '건물 지하 1~3층 (3시간 무료)',
    },
  },
};

export const GALLERY_IMAGES: GalleryImage[] = [
  {
    id: '1',
    url: '/images/gallery/couple-1.jpg',
    alt: '신랑신부 메인 사진',
    width: 800,
    height: 1200,
  },
  {
    id: '2',
    url: '/images/gallery/couple-2.jpg',
    alt: '신랑신부 야외 사진',
    width: 800,
    height: 1200,
  },
  {
    id: '3',
    url: '/images/gallery/couple-3.jpg',
    alt: '신랑신부 웨딩 사진',
    width: 800,
    height: 1200,
  },
  // 더 많은 이미지 추가 가능
];

export const MAIN_IMAGE_URL = '/images/main-couple.jpg';

export const INVITATION_MESSAGE = `
서로가 마주보며 다져온 사랑을
이제 함께 한 곳을 바라보며
걸어갈 수 있는 큰 사랑으로 키우고자 합니다.

저희 두 사람이 사랑의 이름으로 지켜나갈 수 있게
앞날을 축복해 주시면 감사하겠습니다.
`.trim();

export const ACCOUNT_INFO = {
  groom: {
    bank: '신한은행',
    account: '110-123-456789',
    holder: '김민섭',
  },
  bride: {
    bank: '카카오뱅크',
    account: '3333-01-1234567',
    holder: '전이서',
  },
};

