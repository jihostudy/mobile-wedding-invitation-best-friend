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
  busDetails?: {
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
}

export interface AccountGroup {
  id: string;
  label: string;
  accounts: AccountItem[];
}

export interface HeroSectionData {
  primaryImage: ImageAsset;
  secondaryImage: ImageAsset;
  titleText: string;
}

export interface InvitationSectionData {
  kicker: string;
  title: string;
  message: string;
}

export interface CalendarSectionData {
  subtitle?: string;
}

export interface GallerySectionData {
  kicker: string;
  title: string;
  batchSize: number;
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
  kicker: string;
  title: string;
  description: string;
  uploadOpenAt: string;
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
  kicker: string;
  title: string;
  description: string;
}

export interface GuestbookSectionData {
  kicker: string;
  title: string;
}

export interface InterviewAnswer {
  side: "groom" | "bride";
  content: string;
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
  questions: InterviewQuestion[];
}

export interface LocationSectionData {
  mapCtaLabel?: string;
}

export interface AccountSectionData {
  kicker: string;
  title: string;
  description: string;
  groups: AccountGroup[];
}

export interface ClosingSectionData {
  image: ImageAsset;
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
  guestbookSection: GuestbookSectionData;
  rsvpSection: RsvpSectionData;
  accountSection: AccountSectionData;
  snapSection: SnapSectionData;
  closingSection: ClosingSectionData;
  floatingNavItems: FloatingNavItem[];
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

export interface WeddingContentAsset {
  url: string;
  path: string;
  bucket: string;
  width?: number;
  height?: number;
  altDefault?: string;
}

export interface WeddingContentAssetUploadResponse {
  success: true;
  asset: WeddingContentAsset;
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
  displayOrder: number;
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

