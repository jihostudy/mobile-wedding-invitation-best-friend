# 모바일 청첩장 웹 프로젝트

이 저장소는 신랑/신부의 결혼식 정보를 모바일 중심 UI로 제공하는 Next.js 기반 웹 애플리케이션입니다.  
단순 랜딩 페이지가 아니라, 공개 페이지 + 관리자 페이지 + Supabase 백엔드(API/스토리지)를 함께 운영하는 구조입니다.

## 프로젝트 핵심

- 공개 청첩장 페이지(` / `): 섹션형 스토리 UI, 갤러리, 일정/위치/공유, 방명록, RSVP, 스냅 업로드
- 관리자 페이지(` /admin `): 콘텐츠 편집, 방명록/참석/스냅 관리
- 데이터 저장소: Supabase(Postgres + Storage)
- 배포 대상: Vercel

## 기능과 구현 방식

### 1) 콘텐츠 관리(단일 문서 모델)

- 구현 포인트:
  - 청첩장 본문 데이터를 `wedding_content` 단일 문서 스키마로 관리
  - 서버에서 `getWeddingContent('main')`로 조회하고, 클라이언트에서 React Query hydration으로 초기 데이터 재사용
- 관련 코드:
  - `src/lib/wedding-content/repository.ts`
  - `src/app/page.tsx`
  - `src/components/Home/HomePageClient.tsx`
  - `src/app/api/wedding-content/route.ts`

### 2) 섹션형 모바일 UI

- 구현 포인트:
  - Hero/Invitation/Interview/Gallery/Calendar/Location/Guestbook/RSVP/Snap/Account/Closing 섹션 컴포넌트 분리
  - `max-w-[425px]` 기준 모바일 레이아웃 + 안전영역(safe-area) 처리
  - `framer-motion` + 커스텀 페이드/오버레이 애니메이션
- 관련 코드:
  - `src/components/Home/HomePageClient.tsx`
  - `src/components/**`
  - `src/app/globals.css`

### 3) 갤러리/모달 UX

- 구현 포인트:
  - 공통 `Carousel` 컴포넌트로 스와이프/키보드/화살표/인디케이터 제어
  - 갤러리 모달에서 현재 인덱스(`1 / N`) 기반 내비게이션 제공
  - 모바일 모달 스크롤 잠금 시 레이아웃 밀림 방지를 위한 `useModalLayer` 훅 사용
- 관련 코드:
  - `src/components/common/Carousel.tsx`
  - `src/components/Gallery/ImageGallery.tsx`
  - `src/hooks/useModalLayer.ts`

### 4) 방명록, RSVP, 스냅 업로드

- 구현 포인트:
  - 공개 API로 방명록 등록, RSVP 등록, 스냅 이미지 업로드 처리
  - 스냅 업로드는 Supabase Storage 버킷(`snap-uploads`) 사용
  - 관리자 API에서 방명록 정렬/공개여부/삭제, RSVP 조회, 스냅 승인/관리 제공
- 관련 코드:
  - 공개 API: `src/app/api/guest-messages/route.ts`, `src/app/api/rsvp-responses/route.ts`, `src/app/api/snap-submissions/route.ts`
  - 관리자 API: `src/app/api/admin/**`
  - UI: `src/components/Guestbook/*`, `src/components/Rsvp/*`, `src/components/Snap/*`

### 5) 관리자 인증 및 보안

- 구현 포인트:
  - `ADMIN_SESSION_SECRET` 기반 세션 쿠키 + CSRF 토큰 검증
  - 부트스트랩 API로 최초 관리자 비밀번호 설정
  - 민감 로직은 서버 전용 Supabase 클라이언트(`service role key`) 경유
- 관련 코드:
  - `src/lib/server/admin-auth.ts`
  - `src/app/api/admin/auth/bootstrap/route.ts`
  - `src/app/api/admin/auth/login/route.ts`

### 6) 타이포그래피/폰트 전략

- 구현 포인트:
  - `next/font` 기반 로컬/구글 폰트 로딩
  - 기본 폰트/보조 폰트 토큰화(`font-sans`, `font-crimson`, `font-pretendard`)
  - 로딩 안정성을 위한 `woff2` 사용
- 관련 코드:
  - `src/app/layout.tsx`
  - `tailwind.config.ts`
  - `public/fonts/*`

## 기술 스택

- Frontend: Next.js 14(App Router), React 18, TypeScript
- Styling/UI: Tailwind CSS, framer-motion, lucide-react
- Data Fetching: @tanstack/react-query
- Backend(BaaS): Supabase (Postgres, Storage)
- Deployment: Vercel

## 로컬 실행

### 1) 의존성 설치

```bash
pnpm install
```

### 2) 환경변수 설정

루트에 `.env.local` 파일을 생성하고 아래 값을 설정합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_KAKAO_JS_KEY=...
NEXT_PUBLIC_KAKAO_TEMPLATE_ID=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_SESSION_SECRET=...
ADMIN_BOOTSTRAP_TOKEN=...

# optional
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
WEDDING_CONTENT_ASSET_BUCKET=snap-uploads
```

배포 전 환경변수 검증:

```bash
pnpm check:deploy-env
```

### 3) 개발 서버 실행

```bash
pnpm dev
```

## DB/마이그레이션

Supabase SQL Editor에서 아래 파일을 순서대로 적용하세요.

1. `supabase/migrations/20260215_000001_wedding_content_single_document.sql`
2. `supabase/migrations/20260215_000002_remove_sample_guestbook_messages_from_wedding_content.sql`
3. `supabase/migrations/20260216_000003_admin_credentials_and_guest_messages_password_cleanup.sql`
4. `supabase/migrations/20260216_000004_guest_messages_display_order.sql`
5. `supabase/migrations/20260216_000005_allow_audio_uploads_for_wedding_assets.sql`

## 품질 체크 명령어

```bash
pnpm type-check
pnpm lint
pnpm build
```

## 관련 문서

### ADR

- [ADR-0001 PLAN-ACT 브랜치 워크플로](./ADR/0001-plan-act-branch-workflow.md)
- [ADR-0002 커밋 컨벤션](./ADR/0002-commit-convention.md)
- [ADR-0003 런타임 버전 관리(mise)](./ADR/0003-runtime-version-management.md)
- [ADR-0004 테스트 전략](./ADR/0004-test-strategy.md)
- [ADR-0005 타이포그래피 시스템](./ADR/0005-typography-system.md)

### Docs

- [Vercel 배포 점검 체크리스트](./docs/vercel-deployment-checklist.md)

## 디렉터리 개요

```text
src/
  app/
    api/                # 공개/관리자 API 라우트
    admin/              # 관리자 페이지
    layout.tsx          # 전역 폰트/메타/프로바이더
  components/           # 섹션/공통 UI 컴포넌트
  lib/                  # API 클라이언트, 쿼리, 서버 유틸
  hooks/                # 모달, 키보드 등 커스텀 훅
  types/                # 도메인 타입
public/
  fonts/                # woff2 폰트
  images/, audio/
supabase/migrations/    # DB 스키마 변경 이력
```
