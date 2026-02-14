# ADR-0003: 런타임 버전 관리 방식 (mise)

## 메타 정보

| 항목 | 내용 |
| ---- | ---- |
| 상태 | Accepted |
| 목적 | 팀/CI가 동일한 Node.js, pnpm 버전을 사용하도록 표준화 |

---

## 1. 결정

- 이 프로젝트의 런타임 버전 관리는 `mise`를 표준으로 사용한다.
- 버전 고정 파일은 프로젝트 루트의 `.mise.toml`을 단일 소스로 사용한다.
- 버전 업데이트 시 `package.json`의 `engines`, `packageManager`와 함께 동기화한다.

---

## 2. 관리 방법들

### 2.1 파일 기반 버전 고정

- 저장소 루트에 `.mise.toml`을 두고 Node.js, pnpm 버전을 명시한다.
- 예시:

```toml
[tools]
node = "25.6.1"
pnpm = "8.15.0"
```

### 2.2 로컬 환경 설치/활성화

- 최초 1회: `mise install`
- 적용 확인: `mise current`
- 셸 훅 설정 시 디렉터리 진입만으로 자동 활성화된다.

### 2.3 명시적 실행 방식

- 자동 활성화를 쓰지 않는 환경에서는 `mise x -- <command>` 형태로 실행한다.
- 예시:
  - `mise x -- pnpm install`
  - `mise x -- pnpm dev`

### 2.4 버전 업데이트 절차

- 버전 변경이 필요하면 아래 순서로 반영한다.
  1. `.mise.toml` 버전 수정
  2. `package.json`의 `engines`/`packageManager` 값 동기화
  3. `pnpm install` 후 빌드/테스트 확인
  4. ADR의 버전 표 갱신

### 2.5 CI 적용 방식

- CI에서도 `mise install` 후 빌드/테스트를 수행한다.
- 목적은 개발자 로컬과 CI 런타임 불일치를 제거하는 것이다.

---

## 3. 이 프로젝트의 현재 기준 버전

`package.json` 기준(2026-02-14):

| 항목 | 버전 |
| ---- | ---- |
| Node.js | `>=18.0.0` |
| pnpm | `>=8.0.0` |
| packageManager | `pnpm@8.15.0` |

- 실제 고정 버전은 `.mise.toml`에 정의한다.
- 버전 변경 시 이 ADR과 `.mise.toml`, `package.json`을 함께 수정한다.
