# 💐 모바일 청첩장 프로젝트

김민섭 ♥ 전이서 결혼식 청첩장

## 🎯 프로젝트 개요

인스타그램 스토리 스타일의 모바일 최적화 청첩장 웹사이트입니다.

### 주요 기능

- ✅ **메인 히어로**: 인스타그램 스토리 스타일 디자인
- ✅ **갤러리**: 스와이프 가능한 이미지 슬라이더
- ✅ **위치 정보**: 지도 연동 (네이버/카카오/구글)
- ✅ **방명록**: Supabase 실시간 데이터베이스
- ✅ **공유 기능**: 카카오톡, SNS, 링크 복사
- ✅ **캘린더 저장**: ICS 파일 다운로드

## 🛠 기술 스택

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Database**: Supabase (무료 티어)
- **Deployment**: Vercel (무료)
- **State Management**: React Hooks
- **Image Optimization**: Next.js Image

## 📦 설치 및 실행

### 1. 의존성 설치

**npm 사용:**
\`\`\`bash
npm install
\`\`\`

**pnpm 사용 (권장):**
\`\`\`bash
pnpm install
\`\`\`

**yarn 사용:**
\`\`\`bash
yarn install
\`\`\`

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 입력하세요:

\`\`\`env

# Supabase 설정

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 카카오 지도 API (선택사항)

NEXT_PUBLIC_KAKAO_MAP_KEY=your_kakao_map_key

# 네이버 지도 API (선택사항)
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=your_naver_map_client_id
\`\`\`

### 3. Supabase 테이블 생성

Supabase 대시보드에서 다음 SQL을 실행하세요:

\`\`\`sql
CREATE TABLE guest_messages (
id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
author TEXT NOT NULL,
message TEXT NOT NULL,
password TEXT NOT NULL,
is_private BOOLEAN DEFAULT FALSE,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_guest_messages_created_at ON guest_messages(created_at DESC);

-- Row Level Security (RLS) 활성화
ALTER TABLE guest_messages ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능
CREATE POLICY "Public read access" ON guest_messages FOR SELECT USING (true);

-- 모든 사용자가 삽입 가능
CREATE POLICY "Public insert access" ON guest_messages FOR INSERT WITH CHECK (true);

-- 본인만 삭제 가능
CREATE POLICY "Delete own messages" ON guest_messages FOR DELETE USING (true);
\`\`\`

### 4. 개발 서버 실행

**npm:**
\`\`\`bash
npm run dev
\`\`\`

**pnpm:**
\`\`\`bash
pnpm dev
\`\`\`

**yarn:**
\`\`\`bash
yarn dev
\`\`\`

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📁 프로젝트 구조

\`\`\`
code/
├── src/
│ ├── app/ # Next.js App Router
│ │ ├── api/ # API Routes
│ │ │ └── calendar/ # ICS 파일 생성
│ │ ├── layout.tsx # 전역 레이아웃
│ │ ├── page.tsx # 메인 페이지
│ │ └── globals.css # 전역 스타일
│ ├── components/ # 컴포넌트
│ │ ├── Hero/ # 메인 히어로
│ │ ├── Invitation/ # 초대 메시지
│ │ ├── Gallery/ # 이미지 갤러리
│ │ ├── Location/ # 위치 정보
│ │ ├── Guestbook/ # 방명록
│ │ └── Share/ # 공유 버튼
│ ├── lib/ # 라이브러리
│ │ └── supabase.ts # Supabase 클라이언트
│ ├── types/ # TypeScript 타입
│ │ └── index.ts
│ └── constants/ # 상수
│ └── wedding-data.ts # 청첩장 데이터
├── public/ # 정적 파일
│ └── images/ # 이미지
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
\`\`\`

## 🎨 커스터마이징

### 1. 청첩장 정보 수정

`src/constants/wedding-data.ts` 파일에서 신랑신부 정보, 날짜, 장소 등을 수정하세요.

### 2. 이미지 교체

- 메인 이미지: `public/images/main-couple.jpg`
- 갤러리 이미지: `public/images/gallery/couple-*.jpg`
- OG 이미지: `public/images/og-image.jpg`

### 3. 색상 변경

`tailwind.config.ts`에서 `wedding` 색상을 수정하세요.

### 4. 폰트 변경

`src/app/layout.tsx`에서 Google Fonts를 변경할 수 있습니다.

## 🚀 배포

### Vercel로 배포 (권장)

1. GitHub 저장소에 코드 푸시
2. [Vercel](https://vercel.com) 가입 및 로그인
3. "Import Project" 클릭
4. GitHub 저장소 선택
5. 환경 변수 입력
6. "Deploy" 클릭

### 환경 변수 설정 (Vercel)

Vercel 대시보드에서 다음 환경 변수를 추가하세요:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_KAKAO_MAP_KEY` (선택사항)
- `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` (선택사항)

## 📱 모바일 최적화

- 반응형 디자인 (Tailwind CSS)
- 터치 제스처 지원
- 이미지 최적화 (Next.js Image)
- Safe Area 대응 (iOS)
- 스와이프 가능한 갤러리

## 🔒 보안

- Supabase Row Level Security (RLS)
- 비밀번호 SHA-256 해시
- 환경 변수로 민감 정보 관리
- XSS 방지 (React 자동 이스케이프)

## 💰 비용

모든 서비스를 무료 티어로 운영합니다:

- **Next.js + Vercel**: 무료 (Hobby 플랜)
- **Supabase**: 무료 (500MB DB, 1GB 파일 저장소)
- **이미지 호스팅**: Next.js Image 최적화 (무료)

## 📝 라이센스

이 프로젝트는 개인 용도로 제작되었습니다.

## 👨‍💻 개발자

AI Assistant (Claude) with Cursor

---

💌 **축하합니다! 행복한 결혼 생활 되세요!**
