# ADR-0001s: PLAN-ACT 브랜치 워크플로

## 메타 정보

| 항목 | 내용                                                                         |
| ---- | ---------------------------------------------------------------------------- |
| 상태 | Accepted                                                                     |
| 목적 | AI 에이전트 기반 개발에서 PLAN → ACT → CLEANUP 전 과정의 Git 워크플로 표준화 |
| 범위 | Git Worktree, GitHub Branch/Issue/PR, 로컬 브랜치 생명주기 전체              |
| 선행 | ADR-0002 (Commit Convention)                                                 |

---

## 1. 컨텍스트

- AI 에이전트(Cursor Agent)가 Plan Mode에서 이슈를 설계하고 Act Mode에서 코드를 작성한다.
- `main` 브랜치는 항상 **배포 가능한 최신 상태**를 유지해야 한다.
- 에이전트 작업은 독립된 환경(Worktree)에서 수행하여 `main` 을 오염시키지 않는다.
- 작업 완료 후 사용된 브랜치는 로컬·리모트 모두 정리하여 브랜치 누적을 방지한다.

---

## 2. 결정: 4단계 워크플로

전체 흐름은 **PLAN → SETUP → ACT → CLEANUP** 4단계로 구성한다.

```
main ─────────────────────────────────────────────────────── main (updated)
  │                                                            ▲
  ├─ worktree ──► feat/xxx ─────────────────────────► PR ──► merge
  │                  │
  │                  ├── feat/xxx-sub-1 ──► PR ──► merge ─┐
  │                  ├── feat/xxx-sub-2 ──► PR ──► merge ─┤
  │                  └── feat/xxx-sub-n ──► PR ──► merge ─┘
  │                                                   │
  │                                              feat/xxx
  │
  └─ cleanup: delete worktree, local/remote branches, sync main
```

---

## 3. 단계별 상세

### 3.1 PLAN — 이슈 설계 (Plan Mode)

| 순서 | 행위              | 설명                                                                      |
| ---- | ----------------- | ------------------------------------------------------------------------- |
| 1    | 요구사항 분석     | 에이전트에 전달된 내용을 분석하여 작업 범위를 확정한다                    |
| 2    | Parent Issue 생성 | GitHub에 상위 이슈를 만든다. 라벨: `epic`                                 |
| 3    | Sub Issue 분할    | 커밋 단위로 하위 이슈를 생성한다. 본문에 Parent Issue 번호를 참조         |
| 4    | 이슈 내용 작성    | 각 이슈에 태스크 리스트, 의사 코드, 수정 대상 파일 경로, 참조 이슈를 명시 |

> Sub Issue 분할 기준: **하나의 이슈 = 하나의 논리적 변경 = 하나의 PR**

### 3.2 SETUP — 작업 환경 구성

#### 3.2.1 Feature 브랜치 생성 (GitHub)

```bash
# GitHub에 feature 브랜치를 생성한다 (MCP 또는 gh CLI 사용)
# 명명 규칙: feat/<parent-issue-number>-<kebab-case-summary>
# 예: feat/30-product-search
```

#### 3.2.2 Worktree 생성 (로컬)

```bash
# main 브랜치에서 worktree를 생성하여 독립 작업 디렉터리를 확보한다
git fetch origin
git worktree add ../worktrees/feat-30-product-search origin/feat/30-product-search
cd ../worktrees/feat-30-product-search
```

| 규칙          | 내용                                                           |
| ------------- | -------------------------------------------------------------- |
| Worktree 경로 | 프로젝트 루트의 **형제 디렉터리** `../worktrees/<branch-slug>` |
| 명명          | `feat-<issue>-<summary>` (슬래시 → 하이픈)                     |
| 기준 브랜치   | 항상 `origin/main` 또는 방금 생성한 feature 브랜치의 최신 커밋 |

#### 3.2.3 Sub 브랜치 생성

```bash
# feature 브랜치 위에서 sub 브랜치를 생성한다
# 명명 규칙: feat/<parent-issue>-<sub-issue>-<summary>
git checkout -b feat/30-31-search-api
```

---

### 3.3 ACT — 구현 & PR (Act Mode)

#### 3.3.1 개발 사이클

```
[Sub Issue 선택]
      │
      ▼
  이슈 라벨 → "in-progress"
      │
      ▼
  Sub 브랜치에서 구현
      │
      ▼
  커밋 (ADR-0002 형식: feat: #31 Add search API endpoint)
      │
      ▼
  Push → GitHub PR 생성
    - base: feat/<parent-issue>-<summary>
    - head: feat/<parent-issue>-<sub-issue>-<summary>
    - body: Close #<sub-issue>
      │
      ▼
  PR 머지 → Sub 브랜치 삭제 (리모트)
      │
      ▼
  이슈 라벨 → "done" (자동 Close)
      │
      ▼
  다음 Sub Issue로 이동
```

#### 3.3.2 Sub Issue PR 규칙

| 항목      | 규칙                                                     |
| --------- | -------------------------------------------------------- |
| PR base   | Feature 브랜치 (`feat/<parent-issue>-<summary>`)         |
| PR head   | Sub 브랜치 (`feat/<parent-issue>-<sub-issue>-<summary>`) |
| PR body   | `Close #<sub-issue-number>` 포함                         |
| 머지 방식 | Squash Merge 권장                                        |
| 머지 후   | 리모트 sub 브랜치 자동 삭제                              |

#### 3.3.3 Feature → Main PR

모든 Sub Issue가 완료되면:

| 항목      | 규칙                                                     |
| --------- | -------------------------------------------------------- |
| PR base   | `main`                                                   |
| PR head   | Feature 브랜치 (`feat/<parent-issue>-<summary>`)         |
| PR title  | `feat: #<parent-issue> <summary>`                        |
| PR body   | Parent Issue 번호 참조, 포함된 Sub Issue 목록 체크리스트 |
| 머지 방식 | Merge Commit (히스토리 보존) 또는 Squash (간결)          |
| 머지 후   | 리모트 feature 브랜치 삭제                               |

---

### 3.4 CLEANUP — 정리 & 동기화

Feature → Main PR이 머지된 후 아래 순서로 정리한다.

#### 3.4.1 GitHub 이슈 정리

```
- Parent Issue: Close (PR 머지로 자동 또는 수동)
- 남은 Sub Issue: Close 확인
- 라벨 최종 상태: "done"
```

#### 3.4.2 로컬 Worktree 제거

```bash
# worktree 디렉터리에서 빠져나온 후
cd /path/to/main-repo

# worktree 제거
git worktree remove ../worktrees/feat-30-product-search
```

#### 3.4.3 로컬 브랜치 삭제

```bash
# feature 브랜치 및 sub 브랜치 정리
git branch -D feat/30-product-search
git branch -D feat/30-31-search-api
git branch -D feat/30-32-search-ui
# ... 모든 관련 브랜치
```

#### 3.4.4 리모트 트래킹 정리

```bash
# 이미 삭제된 리모트 브랜치의 로컬 트래킹 참조를 제거
git fetch --prune
```

#### 3.4.5 Main 브랜치 최신화

```bash
# main 브랜치로 이동 후 최신 상태로 업데이트
git checkout main
git pull origin main
```

#### 3.4.6 CLEANUP 체크리스트

| #   | 항목                           | 명령어 / 확인                            |
| --- | ------------------------------ | ---------------------------------------- |
| 1   | GitHub 이슈 모두 Closed        | GitHub Issues 페이지 확인                |
| 2   | Feature PR 머지 완료           | GitHub PR 페이지 확인                    |
| 3   | 리모트 feature/sub 브랜치 삭제 | `git ls-remote --heads origin`           |
| 4   | Worktree 제거                  | `git worktree list` 에 잔여 없음         |
| 5   | 로컬 브랜치 삭제               | `git branch` 에 `main` 만 존재           |
| 6   | 리모트 트래킹 정리             | `git fetch --prune`                      |
| 7   | Main 최신화                    | `git log --oneline -1` 이 최신 머지 커밋 |

---

## 4. 브랜치 명명 규칙 요약

| 용도         | 패턴                                | 예시                           |
| ------------ | ----------------------------------- | ------------------------------ |
| Feature      | `feat/<parent-issue>-<summary>`     | `feat/30-product-search`       |
| Sub (기능)   | `feat/<parent>-<sub>-<summary>`     | `feat/30-31-search-api`        |
| Sub (버그)   | `fix/<parent>-<sub>-<summary>`      | `fix/30-35-search-null-fix`    |
| Sub (리팩터) | `refactor/<parent>-<sub>-<summary>` | `refactor/30-36-extract-query` |

---

## 5. 에이전트 지시 형식

에이전트에게 작업을 전달할 때 아래 형식을 따른다.

```markdown
## 작업 요청

- Parent Issue: #<number> (또는 신규 생성 요청)
- 작업 내용: <요구사항 설명>
- 관련 파일: <경로 목록>
- 참조: <관련 이슈/ADR 번호>
```

에이전트는 이를 수신하면:

1. **Plan Mode**: 이슈 설계 (3.1)
2. **Act Mode**: SETUP(3.2) → ACT(3.3) → CLEANUP(3.4) 순서로 실행

---

## 6. 전체 흐름 요약 (Sequence)

```
User                Agent (Plan)           GitHub              Agent (Act)              Local Git
 │                      │                    │                      │                      │
 ├─ 작업 요청 ─────────►│                    │                      │                      │
 │                      ├─ Parent Issue ────►│                      │                      │
 │                      ├─ Sub Issues ──────►│                      │                      │
 │                      │                    │                      │                      │
 │                      ├─ SETUP ───────────────────────────────────────────────────────────┤
 │                      │                    ├─ feat branch ───────►│                      │
 │                      │                    │                      ├─ worktree add ───────►│
 │                      │                    │                      ├─ sub branch ─────────►│
 │                      │                    │                      │                      │
 │                      │                    │◄── push + PR ────────┤                      │
 │                      │                    ├─ merge sub PR ──────►│                      │
 │                      │                    │  (반복)               │                      │
 │                      │                    │                      │                      │
 │                      │                    │◄── feat→main PR ─────┤                      │
 │                      │                    ├─ merge to main ─────►│                      │
 │                      │                    │                      │                      │
 │                      │                    │                      ├─ CLEANUP ────────────►│
 │                      │                    │                      │  worktree remove      │
 │                      │                    │                      │  branch delete        │
 │                      │                    │                      │  fetch --prune        │
 │                      │                    │                      │  checkout main        │
 │                      │                    │                      │  pull origin main     │
 │                      │                    │                      │                      │
 ◄─── 완료 보고 ────────┤                    │                      │                      │
```

---

## 7. 타당성

| 관점   | 효과                                                                                |
| ------ | ----------------------------------------------------------------------------------- |
| 격리성 | Worktree로 main과 작업 공간을 물리적으로 분리. 작업 중 main 오염 불가               |
| 추적성 | Issue → Sub Issue → Sub PR → Feature PR → Main 머지까지 전 과정이 GitHub에 기록     |
| 원자성 | Sub Issue 단위로 PR을 생성하여 리뷰·롤백 단위를 최소화                              |
| 정합성 | CLEANUP 단계에서 브랜치 잔여물을 제거하고 main을 최신화하여 다음 작업의 기반을 보장 |
| 자동화 | 에이전트가 전 과정을 순차 실행 가능. 수동 개입 최소화                               |

---

## 9. 참조

- ADR-0002: Commit Convention
- `.cursorrules`: Agent Usage > Plan Mode / Act Mode
- Git Worktree 공식 문서: https://git-scm.com/docs/git-worktree
