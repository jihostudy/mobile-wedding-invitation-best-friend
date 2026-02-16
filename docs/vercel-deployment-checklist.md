# Vercel 배포 동작 점검 체크리스트

이 문서는 실제 운영 배포 후 정상 동작을 빠르게 검증하기 위한 체크리스트입니다.

## 1) 환경변수 확인

### 필수
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_SESSION_SECRET`
- `ADMIN_BOOTSTRAP_TOKEN`

### 선택
- `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`

### 로컬/CI 사전 검증
```bash
pnpm check:deploy-env
# 또는
pnpm check:deploy-env .env.local
```

## 2) Supabase 상태 확인

아래 마이그레이션이 모두 반영되었는지 확인합니다.

- `supabase/migrations/20260215_000001_wedding_content_single_document.sql`
- `supabase/migrations/20260215_000002_remove_sample_guestbook_messages_from_wedding_content.sql`
- `supabase/migrations/20260216_000003_admin_credentials_and_guest_messages_password_cleanup.sql`
- `supabase/migrations/20260216_000004_guest_messages_display_order.sql`

핵심 확인 포인트:
- 테이블: `wedding_content`, `guest_messages`, `rsvp_responses`, `snap_upload_submissions`, `snap_upload_files`, `admin_credentials`, `admin_audit_logs`
- `guest_messages.display_order` 존재 + `NOT NULL` + `DEFAULT 0`
- storage bucket `snap-uploads` 존재
- RLS / policy가 마이그레이션 정의와 일치

## 3) 관리자 초기화 (최초 1회)

`admin_credentials`가 비어 있다면:

```bash
curl -i -X POST "https://<your-domain>/api/admin/auth/bootstrap" \
  -H "content-type: application/json" \
  -H "x-bootstrap-token: <ADMIN_BOOTSTRAP_TOKEN>" \
  --data '{"password":"<admin-password>"}'
```

성공 후 `/admin`에서 로그인합니다.

## 4) 스모크 테스트

아래 테스트는 브라우저 + 네트워크 탭에서 확인합니다.

### 메인
- `/` 200
- 주요 섹션 렌더
- 페이드인 애니메이션 동작
- 레이아웃/배경 깨짐 없음

### 공개 API
- `POST /api/guest-messages` 200
- `POST /api/rsvp-responses` 200
- `POST /api/snap-submissions` 200
- `GET /api/calendar` 200 + `.ics` 다운로드

### 지도
- `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` 설정 시 지도 렌더
- 미설정 시 fallback 안내 문구 노출

### 관리자
- `/admin` 로그인 성공
- 로그인 상태에서 메인 우하단 `대시보드` 플로팅 버튼 노출
- 목록 조회/수정/삭제/정렬 변경 API 정상
- CSRF 에러 없이 PATCH/DELETE 동작

### 오류 회귀
- 서버 로그에 `ADMIN_SESSION_SECRET_MISSING` 없어야 함
- Supabase auth/policy 관련 오류 없어야 함
- 401/403은 의도된 상황(미로그인/CSRF 위반)에서만 발생

## 5) 현재 리스크 메모

- 카카오 공유는 현재 코드에서 `Kakao.init(...)`가 구현되지 않아 실사용 시 실패할 수 있습니다.
