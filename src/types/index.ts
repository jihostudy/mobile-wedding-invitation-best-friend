/**
 * 청첩장 데이터 타입 정의
 * Clean Architecture 원칙에 따라 도메인 모델 분리
 */

export interface WeddingInfo {
  groom: Person;
  bride: Person;
  date: WeddingDate;
  venue: Venue;
  backgroundMusic?: BackgroundMusicConfig;
}

export interface BackgroundMusicConfig {
  enabled: boolean;
  src?: string;
  volume?: number;
  loop?: boolean;
  autoplay?: boolean;
  title?: string;
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
  mainImage: ImageAsset;
}

export interface InvitationSectionData {
  message: string;
}

export interface CalendarSectionData {
  subtitle?: string;
}

export interface GallerySectionData {
  images: GalleryImage[];
}

export interface SnapImageItem {
  id: string;
  url: string;
  alt: string;
  rotation: number;
  offsetX: number;
}

export interface SnapSectionData {
  description: string;
  images: SnapImageItem[];
  modal: SnapUploadModalData;
}

export interface SnapUploadModalData {
  backLabel: string;
  coverImage: ImageAsset;
  coverKicker: string;
  coverTitle: string;
  coverNames: string;
  guideTitle: string;
  guideLines: string[];
  guideHighlightLines: string[];
  nameLabel: string;
  namePlaceholder: string;
  uploadEmptyHint: string;
  attachButtonLabel: string;
  maxFiles: number;
  policyLines: string[];
}

export interface RsvpSectionData {
  description?: string;
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
  description: string;
  image: ImageAsset;
  questions: InterviewQuestion[];
}

export interface LocationSectionData {
  mapCtaLabel?: string;
}

export interface AccountSectionData {
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

