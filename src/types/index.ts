/**
 * 청첩장 데이터 타입 정의
 * Clean Architecture 원칙에 따라 도메인 모델 분리
 */

export interface WeddingInfo {
  groom: Person;
  bride: Person;
  date: WeddingDate;
  venue: Venue;
  account?: {
    groom: AccountItem;
    bride: AccountItem;
  };
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
  subwayDetails?: {
    label: string;
    color: string;
  }[];
  bus?: string[];
  busNote?: string;
  parking?: string;
  shuttlePickup?: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface ImageAsset {
  url: string;
  alt: string;
}

export interface AccountItem {
  bank: string;
  account: string;
  holder: string;
  label?: string;
  kakaoPayLink?: string;
}

export interface AccountGroup {
  id: string;
  label: string;
  accounts: AccountItem[];
}

export interface HeroSectionData {
  kicker: string;
  title: string;
  scriptLine: string;
  dateLine: string;
  venueLine: string;
  mainImage: ImageAsset;
}

export interface InvitationSectionData {
  kicker: string;
  title: string;
  message: string;
  contactCtaLabel: string;
}

export interface CalendarSectionData {
  title: string;
  subtitle: string;
  monthLabel: string;
}

export interface GallerySectionData {
  kicker: string;
  title: string;
  images: GalleryImage[];
}

export interface InterviewAnswer {
  role: string;
  name: string;
  paragraphs: string[];
}

export interface InterviewQuestion {
  question: string;
  answers: InterviewAnswer[];
}

export interface InterviewSectionData {
  kicker: string;
  title: string;
  description: string;
  image: ImageAsset;
  buttonLabel: string;
  questions: InterviewQuestion[];
}

export interface LocationSectionData {
  kicker: string;
  title: string;
  mapCtaLabel: string;
}

export interface AccountSectionData {
  kicker: string;
  title: string;
  description: string;
  groups: AccountGroup[];
}

export interface FloatingNavItem {
  id: string;
  label: string;
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

