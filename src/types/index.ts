/**
 * 청첩장 데이터 타입 정의
 * Clean Architecture 원칙에 따라 도메인 모델 분리
 */

export interface WeddingInfo {
  groom: Person;
  bride: Person;
  date: WeddingDate;
  venue: Venue;
}

export interface Person {
  name: string;
  englishName?: string;
  parents?: Parents;
  contact?: string;
  instagram?: string;
}

export interface Parents {
  father: string;
  mother: string;
  fatherContact?: string;
  motherContact?: string;
}

export interface WeddingDate {
  year: number;
  month: number;
  day: number;
  dayOfWeek: string;
  time: string;
  fullDate: Date;
}

export interface Venue {
  name: string;
  address: string;
  floor?: string;
  hall?: string;
  contact?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  parking?: string;
  transport?: TransportInfo;
}

export interface TransportInfo {
  subway?: string[];
  bus?: string[];
  busNote?: string;
  parking?: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface GuestMessage {
  id: string;
  author: string;
  message: string;
  createdAt: Date;
  isPublic: boolean; // true: 공개, false: 비공개
}

export interface GuestMessageInput {
  author: string;
  message: string;
  isPublic: boolean; // true: 공개 (청첩장에 표시), false: 비공개
}

export interface ShareOptions {
  type: 'kakao' | 'link' | 'facebook';
  url: string;
  title: string;
  description: string;
  imageUrl: string;
}

