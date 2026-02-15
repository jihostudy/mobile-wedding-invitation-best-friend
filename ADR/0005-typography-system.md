# ADR-0005: Typography System (Tmoney 기본 + Crimson 보조)

## Status

Accepted

---

## Context

- 현재 폰트 적용 경로가 혼재되어 있다. (`layout`, Tailwind 토큰, 개별 클래스)
- 기본 폰트 일관성이 부족하다.
- 특정 헤드라인/장식 텍스트용 보조 폰트가 필요하다.

---

## Decision

- 기본 폰트는 `TmoneyRoundWind`를 사용한다.
- 보조 폰트는 Google Font `Crimson Pro`를 사용한다.
- 기본 적용 방식은 `layout.tsx`의 전역 `body` 클래스 기준으로 관리한다.
- Tailwind 토큰은 다음과 같이 사용한다.
  - 기본: `font-sans` (`TmoneyRoundWind`)
  - 보조: `font-crimson` (`Crimson Pro`)
- 운영 원칙:
  1. 폰트를 지정하지 않으면 기본(Tmoney) 폰트가 적용된다.
  2. 보조 폰트는 명시적으로 `font-crimson`을 부여한 경우에만 적용한다.
  3. `font-serif`는 사용 금지하며, 기존 사용처는 제거한다.

---

## Consequences

### 장점

- 전역 타이포그래피 일관성이 확보된다.
- 보조 폰트 사용 지점을 명확히 제어할 수 있다.

### 단점

- 기존 UI에서 줄바꿈/행간 차이가 일부 발생할 수 있다.

### 대응

- 헤더/버튼 텍스트 중심으로 `tracking`, `leading` 값을 미세 조정한다.

---

## Migration Plan

1. `layout.tsx`
   - Tmoney/Crimson 로더를 통합한다.
   - 기존 Noto 로더를 제거한다.
2. `tailwind.config.ts`
   - `font-crimson` 토큰을 등록한다.
   - serif 정책을 정리한다.
3. 컴포넌트
   - `font-serif` 사용을 전수 제거한다.
4. 검증
   - `rg "font-serif"` 결과가 0건인지 확인한다.
   - 폰트 미지정 텍스트가 Tmoney로 렌더링되는지 확인한다.
   - `font-crimson`을 1개 지점에 수동 적용해 정상 동작을 확인한다.

---

## Enforcement

코드리뷰 체크리스트에 아래 항목을 추가한다.

- 폰트 미지정 시 기본 Tmoney 적용이 유지되는가
- Crimson 사용 시 `font-crimson`으로만 적용했는가

---

## Notes

- 기존 계획 문서의 "README 또는 docs 문서화" 항목은 폐기한다.
- Typography 규칙의 단일 소스 오브 트루스는 본 ADR로 관리한다.
