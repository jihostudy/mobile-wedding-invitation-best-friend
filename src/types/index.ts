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

export type RsvpAttendStatus = "available" | "unavailable";
export type RsvpSide = "groom" | "bride";

export interface RsvpResponseInput {
  attendStatus: RsvpAttendStatus;
  side: RsvpSide;
  name: string;
  contact: string;
  extraCount: number;
  eatMeal: boolean;
  rideBus: boolean;
  note: string;
  agreePrivacy: boolean;
}

export interface SnapUploadInput {
  uploaderName: string;
  files: File[];
  eventSlug?: string;
}

export interface WeddingContentV1 {
  weddingData: WeddingInfo;
  heroSection: HeroSectionData;
  invitationSection: InvitationSectionData;
  gallerySection: GallerySectionData;
  interviewSection: InterviewSectionData;
  accountSection: AccountSectionData;
  snapSection: SnapSectionData;
  floatingNavItems: FloatingNavItem[];
  sampleGuestbookMessages: GuestMessage[];
}

export interface WeddingContentResponse {
  slug: string;
  version: number;
  content: WeddingContentV1;
}

export interface UpdateWeddingContentRequest {
  content: WeddingContentV1;
  expectedVersion: number;
}

export interface ApiErrorResponse {
  success: false;
  code: string;
  message: string;
  details?: unknown;
  latestVersion?: number;
}

export interface GuestMessageDto {
  id: string;
  author: string;
  message: string;
  isPublic: boolean;
  createdAt: string;
}

export interface RsvpResponseDto {
  id: string;
  attendStatus: RsvpAttendStatus;
  side: RsvpSide;
  name: string;
  contact: string;
  extraCount: number;
  eatMeal: boolean;
  rideBus: boolean;
  note: string;
  agreePrivacy: boolean;
  createdAt: string;
}

export interface SnapFileDto {
  id: string;
  storageBucket: string;
  storagePath: string;
  publicUrl: string | null;
  originalName: string;
  mimeType: string | null;
  sizeBytes: number;
  createdAt: string;
}

export interface SnapSubmissionDto {
  id: string;
  eventSlug: string;
  uploaderName: string;
  status: "uploaded" | "rejected" | "approved";
  createdAt: string;
  files: SnapFileDto[];
}

