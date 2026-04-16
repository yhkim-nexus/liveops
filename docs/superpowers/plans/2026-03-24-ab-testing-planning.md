# A/B 테스트 (실험) 기획 문서 산출물 생성 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 디자인 스펙(SPEC-GLO-001)을 기반으로 A/B 테스트 기능의 기획 산출물(회의록, PRD, UX 스펙, 다이어그램, 리뷰 리포트)을 생성한다.

**Architecture:** CLAUDE.md 표준 워크플로우에 따라 meeting-note → PRD → (UX-Spec, Diagram) 병렬 → Reviewer 순서로 에이전트를 실행한다. 각 에이전트는 디자인 스펙과 기존 문서(PRD-GLO-001, PRD-GLO-002, UX-GLO-001, UX-GLO-002, DIA-GLO-001, DIA-GLO-002)의 패턴을 따른다.

**Tech Stack:** Markdown + YAML front matter, Mermaid (다이어그램)

---

## 문서 ID 및 파일 체계

| 산출물 | 문서 ID | 파일명 |
|--------|---------|--------|
| 회의록 | MTG-GLO-005 | `docs/08-meeting-note/2026-03-24_MTG_GLO_ab-testing_v1.0.md` |
| PRD | PRD-GLO-003 | `docs/03-prd/2026-03-24_PRD_GLO_ab-testing_v1.0.md` |
| UX 스펙 | UX-GLO-003 | `docs/05-ux/2026-03-24_UX_GLO_ab-testing_v1.0.md` |
| 다이어그램 | DIA-GLO-003 | `docs/06-diagrams/2026-03-24_DIA_GLO_ab-testing_v1.0.md` |
| 리뷰 리포트 | REV-GLO-002 | `docs/07-reviews/2026-03-24_REV_GLO_ab-testing-review_v1.0.md` |

### ID 체계 (신규)

| 항목 | ID 범위 | 비고 |
|------|---------|------|
| 기능 (Feature) | F-017 ~ F-023 | F-001~008 세그멘테이션, F-009~016 라이브 이벤트 |
| 화면 (Screen) | SCR-013 ~ SCR-017 | SCR-001~005 세그멘테이션, SCR-006~012 라이브 이벤트 |
| 시나리오 | SC-007 ~ | SC-001~003 세그멘테이션, SC-004~006 라이브 이벤트 |
| 다이어그램 | DIA-015 ~ DIA-019 | DIA-001~009 세그멘테이션, DIA-010~014 라이브 이벤트. DIA-GLO-002 Part 2(A-015)가 DIA-014 이후를 사용할 수 있으나, 현재 미할당 확인 |

---

## 참조 문서

| 문서 | 경로 | 참조 내용 |
|------|------|----------|
| 디자인 스펙 | `docs/superpowers/specs/2026-03-24-ab-testing-design.md` | 전체 디자인 기반 |
| 경쟁사 분석 | `docs/01-research/2026-03-09_RES_GLO_competitor-analysis_v1.0.md` | Section 3.3 A/B 테스트 |
| 세그멘테이션 PRD | `docs/03-prd/2026-03-10_PRD_GLO_player-segmentation_v1.0.md` | F-006 타겟팅, F-007 택소노미 |
| 라이브 이벤트 PRD | `docs/03-prd/2026-03-23_PRD_GLO_live-events_v1.0.md` | 상태 머신/승인 패턴 |
| 세그멘테이션 UX | `docs/05-ux/2026-03-10_UX_GLO_player-segmentation_v1.0.md` | UX 패턴 참조 |
| 라이브 이벤트 UX | `docs/05-ux/2026-03-23_UX_GLO_live-events_v1.0.md` | UX 패턴/네비게이션 참조 |
| 세그멘테이션 다이어그램 | `docs/06-diagrams/2026-03-10_DIA_GLO_player-segmentation_v1.0.md` | ERD 확장 참조 |
| 라이브 이벤트 다이어그램 | `docs/06-diagrams/2026-03-23_DIA_GLO_live-events_v1.0.md` | ERD/상태 머신 패턴 참조 |
| 스타일 가이드 | `shared/style-guide.md` | 문서 작성 표준 |
| 용어집 | `shared/terminology.md` | 용어 통일 |
| 네이밍 규칙 | `shared/conventions.md` | ID/파일명 규칙 |
| 리뷰 체크리스트 | `shared/review-checklist.md` | QA 기준 |
| meta.yml | `docs/meta.yml` | 문서 등록 |

---

## Task 1: 회의록 작성 (meeting-note 에이전트)

**Agent:** meeting-note (Haiku)
**Files:**
- Create: `docs/08-meeting-note/2026-03-24_MTG_GLO_ab-testing_v1.0.md`

**에이전트 프롬프트 요약:**
디자인 스펙(SPEC-GLO-001)의 브레인스토밍 과정을 회의록으로 정리한다. 기존 MTG-GLO-004 형식을 따른다.

- [ ] **Step 1: meeting-note 에이전트 실행**

  meeting-note 에이전트를 실행하여 다음 내용을 포함하는 회의록을 작성한다:
  - 참석자: planner (진행), researcher (참고), prd (참고)
  - 안건: A/B 테스트 기능 기획 방향 논의
  - 결정사항 (D-019~): 원격 설정 확장형 설계, 비기술 운영팀 대상, 중급 통계, 오디언스 직접 활용, 사전 테스트 필수, 승인 워크플로우 필수
  - 액션아이템 (A-019~): PRD 작성, UX 스펙 작성, 다이어그램 작성, 리뷰 실시
  - 신규 질문 (Q-016~): 원격 설정 시스템 기획 시점, Feature Flag 시스템과의 통합 범위
  - 참조: SPEC-GLO-001, RES-GLO-002 Section 3.3

  입력: 디자인 스펙 `docs/superpowers/specs/2026-03-24-ab-testing-design.md`
  참고: 기존 회의록 `docs/08-meeting-note/2026-03-23_MTG_GLO_live-events_v1.0.md` (형식 참조)

- [ ] **Step 2: 회의록 검증**

  작성된 회의록이 `shared/style-guide.md` YAML front matter 규칙을 따르는지 확인.
  필수 필드: id(MTG-GLO-005), title, project(GLO), version(v1.0), status(draft), created, updated, author(meeting-note)

---

## Task 2: PRD 작성 (prd 에이전트)

**Agent:** prd (Sonnet)
**Files:**
- Create: `docs/03-prd/2026-03-24_PRD_GLO_ab-testing_v1.0.md`

**에이전트 프롬프트 요약:**
디자인 스펙(SPEC-GLO-001)을 기반으로 A/B 테스트 PRD를 작성한다. PRD-GLO-002(라이브 이벤트) 구조를 따르되, 실험 기능 특화 내용을 반영한다.

- [ ] **Step 1: prd 에이전트 실행**

  prd 에이전트를 실행하여 다음 구조의 PRD를 작성한다:

  **1. Overview**
  - 제품 비전: 비기술 운영팀이 코드 없이 A/B 테스트를 생성·실행·분석하는 실험 플랫폼
  - 배경 및 목적: RES-GLO-002 Section 3.3 근거, PRD-GLO-001 오디언스 재사용
  - 성공 지표: 실험 생성 소요 시간(10분 이내), 통계적 승자 판별 정확도, 승자 롤아웃 소요 시간

  **2. Target Users**
  - Primary: 김지연 (게임 기획자/LiveOps 운영자) — PRD-GLO-001 페르소나 재사용
  - Secondary: 박현수 (개발자/기술 운영자) — SDK 연동
  - Tertiary: 이수정 (팀 리드/승인 권한자) — 실험 승인

  **2.5. 실험 대상 유형 분류** (디자인 스펙 Section 2)
  - 원격 설정 변형, 이벤트 변형, Feature Flag 변형, 복합 변형 4가지 유형 정의
  - 각 유형별 config_overrides 구조 예시 포함

  **2.6. 기존 시스템 연동 포인트** (디자인 스펙 Section 2)
  - 오디언스 시스템 (PRD-GLO-001 F-006): 실험 타겟 오디언스 선택, 연동 계약
  - 이벤트 택소노미 (PRD-GLO-001 F-007): 목표 지표로 추적 이벤트/Computed Properties 활용
  - 라이브 이벤트 (PRD-GLO-002): 승인 워크플로우 패턴, 이벤트 변형 실험 연동

  **3. Features & Requirements** (디자인 스펙 기반)
  - F-017: 실험 생성 및 관리 (CRUD, 5단계 위저드)
  - F-018: 변형(Variant) 정의 (컨트롤 + 최대 3개, config_overrides)
  - F-019: 실험 오디언스 타겟팅 (PRD-GLO-001 F-006 연동)
  - F-020: 트래픽 분배 (MurmurHash3 결정적 할당, Sticky)
    - **중요**: 실험 중 오디언스 변경 처리 규칙 반드시 포함 (디자인 스펙 Section 6 "실험 중 오디언스 변경 처리"):
      - 오디언스 편집 허용, 기존 할당 Sticky 유지
      - 신규 진입 플레이어 해시 기반 할당
      - 오디언스 비활성화/삭제 시 자동 paused 전환 + 알림
  - F-021: 실험 상태 머신 및 승인 워크플로우 (9개 상태, RBAC)
  - F-022: 목표 지표 설정 및 통계 분석 (Chi-squared, Welch's t, Bonferroni)
  - F-023: 결과 대시보드 및 승자 롤아웃

  각 기능에 포함할 항목:
  - 개요
  - 사용자 스토리 (Given-When-Then)
  - 요구사항 (REQ-{feature}-{nn})
  - 수용 기준 (AC-{feature}-{nn}, Gherkin)
  - 비즈니스 규칙 (BR-{feature}-{nn})
  - 에러 처리 (ERR-EXP-001~005)
  - UI/UX 요구사항

  **4. Non-Functional Requirements**
  - 성능: 변형 할당 API p99 50ms 이하
  - 동시 실험: 20개 이상 동시 running 지원
  - 통계 계산: 결과 집계 주기 1시간, 최종 분석 5분 이내
  - 데이터 보존: EXPERIMENT_ASSIGNMENT 90일 후 삭제

  **5. Data Model** — 디자인 스펙 Section 7 그대로 반영 (EXPERIMENT, VARIANT, GOAL, ASSIGNMENT, RESULT, APPROVAL, STATE_LOG)

  **6. Dependencies** — PRD-GLO-001 (오디언스), 원격 설정 시스템 (미기획), SDK

  **7. Release Plan** — Phase 1 (MVP): F-017~F-023 전체

  입력: 디자인 스펙, PRD-GLO-001, PRD-GLO-002 (구조 참조)
  규칙: `shared/style-guide.md`, `shared/terminology.md`, `shared/conventions.md`

- [ ] **Step 2: PRD 자체 검증**

  - YAML front matter 필수 필드 확인 (id: PRD-GLO-003)
  - 기능 ID 연속성 확인 (F-017~F-023)
  - PRD-GLO-001 F-006 참조 정합성 확인
  - 용어 통일 확인 (`shared/terminology.md` 기준)

---

## Task 3: UX 스펙 작성 (uiux-spec 에이전트) — Task 2 완료 후

**Agent:** uiux-spec (Sonnet)
**Files:**
- Create: `docs/05-ux/2026-03-24_UX_GLO_ab-testing_v1.0.md`

**에이전트 프롬프트 요약:**
PRD-GLO-003과 디자인 스펙을 기반으로 A/B 테스트 화면 정의서를 작성한다. UX-GLO-002(라이브 이벤트) 구조를 따른다.

- [ ] **Step 1: uiux-spec 에이전트 실행**

  uiux-spec 에이전트를 실행하여 다음 구조의 화면 정의서를 작성한다:

  **1. Information Architecture**
  - 사이트맵: UX-GLO-002의 좌측 사이드바 "실험(Experiments)" 메뉴 하위
  - 네비게이션: 실험 목록, 승인 대기, 결과 분석 서브 탭
  - 경로: `/experiments`, `/experiments/new`, `/experiments/:id`, `/experiments/approvals`, `/experiments/:id/results`

  **2. 화면별 상세 정의** (디자인 스펙 Section 9 기반)

  **SCR-013: 실험 목록**
  - 레이아웃 구조 (와이어프레임)
  - UI 요소 목록 (E-012-01~): 검색바, 상태 필터, 테이블, 페이지네이션, "새 실험" CTA
  - 상태 변형: Default, Empty, Loading, Error
  - 인터랙션 (INT-012-01~): 행 클릭 → 상세, 필터 변경, 정렬

  **SCR-014: 실험 생성/편집 위저드**
  - 5단계 스텝 인디케이터
  - Step 1 기본 정보: 입력 필드, 가설 섹션 (What/Why/Expected)
  - Step 2 변형 정의: 변형 카드, Key-Value 에디터, 트래픽 슬라이더
  - Step 3 오디언스 선택: 드롭다운, 예상 플레이어 수, 충돌 경고 배너
  - Step 4 목표 지표: 지표 선택, 타입 선택, MDE 입력, 샘플 사이즈 가이드
  - Step 5 확인: 요약 카드, 저장 옵션
  - 각 단계별 UI 요소, 상태 변형, 인터랙션, 유효성 검증

  **SCR-015: 실험 상세**
  - 헤더: 실험명, 상태 배지, 액션 버튼
  - 탭: 설정 요약, 실시간 현황, 상태 이력
  - 상태별 액션 버튼 변형 (draft/testing/pending_approval/running/paused/completed)

  **SCR-016: 결과 대시보드**
  - 히어로 영역: 판별 상태 카드
  - 변형 비교 바 차트 (Recharts BarChart)
  - 신뢰구간 시각화 (ErrorBar)
  - 상세 통계 테이블
  - 일별 추이 라인 차트 (Recharts LineChart)
  - 승자 롤아웃 CTA + 확인 모달

  **SCR-017: 승인 검토**
  - 실험 설정 요약 (읽기 전용)
  - 사전 테스트 결과 요약
  - 승인/반려 버튼 + 코멘트 입력

  **3. 공통 컴포넌트**
  - 상태 배지 컴포넌트 (9개 상태 색상 정의)
  - 변형 트래픽 슬라이더
  - 통계 결과 카드 (p-value, CI, 승자 표시)

  **4. Design Tokens** — UX-GLO-001/002와 동일 토큰 재사용

  입력: PRD-GLO-003, 디자인 스펙 Section 9, UX-GLO-001, UX-GLO-002
  규칙: `shared/style-guide.md`

- [ ] **Step 2: UX 스펙 자체 검증**

  - PRD F-017~F-023 → SCR-013~017 매핑 누락 확인
  - 모든 화면에 Default/Empty/Loading/Error 상태 정의 확인
  - 인터랙션 ID 연속성 확인

---

## Task 4: 다이어그램 작성 (diagram 에이전트) — Task 2 완료 후, Task 3과 병렬

**Agent:** diagram (Sonnet)
**Files:**
- Create: `docs/06-diagrams/2026-03-24_DIA_GLO_ab-testing_v1.0.md`

**에이전트 프롬프트 요약:**
PRD-GLO-003과 디자인 스펙을 기반으로 A/B 테스트 다이어그램을 작성한다. DIA-GLO-002 구조를 따른다.

- [ ] **Step 1: diagram 에이전트 실행**

  diagram 에이전트를 실행하여 다음 다이어그램을 Mermaid로 작성한다:

  **DIA-015: ERD (Entity Relationship Diagram)**
  - EXPERIMENT 중심으로 VARIANT, GOAL, ASSIGNMENT, RESULT, APPROVAL, STATE_LOG 연결
  - AUDIENCE (DIA-GLO-001) 참조 관계
  - 각 엔티티의 주요 필드 포함
  - DIA-GLO-002의 ERD 확장 (LIVE_EVENT과의 관계 표현)

  **DIA-016: 실험 상태 머신 (State Machine Diagram)**
  - 9개 상태: draft, testing, pending_approval, running, paused, stopped, analyzing, completed, archived
  - 전이 조건 및 트리거 라벨 포함
  - RBAC 역할별 전이 권한 표시

  **DIA-017: 실험 생성 시퀀스 다이어그램**
  - 참여자: 운영자(Creator), 시스템, 승인자(Approver)
  - 흐름: 위저드 입력 → draft 저장 → testing → QA 확인 → pending_approval → 승인 → running
  - version_snapshot 저장 시점 표시

  **DIA-018: 트래픽 할당 플로우차트**
  - SDK 요청 → 실험 활성 확인 → 오디언스 멤버십 확인 → 기존 할당 조회 → 해시 버킷 계산 → 변형 반환
  - 캐시 레이어 표시

  **DIA-019: 결과 분석 플로우차트**
  - 이벤트 수집 → 집계 → 통계 검정 → 승자 판별 → 대시보드 갱신
  - Bonferroni 보정 분기 포함

  입력: PRD-GLO-003, 디자인 스펙 Section 4/6/7/8, DIA-GLO-001, DIA-GLO-002
  규칙: Mermaid 문법 정확성, `shared/style-guide.md`

- [ ] **Step 2: 다이어그램 자체 검증**

  - Mermaid 문법 렌더링 확인
  - PRD 데이터 모델과 ERD 정합성 확인
  - 상태 머신이 디자인 스펙 Section 4와 일치하는지 확인

---

## Task 5: 교차 검증 및 리뷰 (reviewer 에이전트) — Task 3, 4 완료 후

**Agent:** reviewer (Sonnet)
**Files:**
- Create: `docs/07-reviews/2026-03-24_REV_GLO_ab-testing-review_v1.0.md`

**에이전트 프롬프트 요약:**
PRD-GLO-003, UX-GLO-003, DIA-GLO-003을 `shared/review-checklist.md` 기준으로 교차 검증한다.

- [ ] **Step 1: reviewer 에이전트 실행**

  reviewer 에이전트를 실행하여 다음 검토를 수행한다:

  **개별 문서 검토:**
  - PRD: review-checklist.md PRD 체크리스트 적용
  - UX: review-checklist.md UX 체크리스트 적용
  - DIA: review-checklist.md Diagram 체크리스트 적용

  **교차 문서 검토:**
  - 기능 추적: PRD F-017~F-023 → UX SCR-013~017 매핑 완전성
  - PRD F-017~F-023 → DIA-015~019 커버리지
  - 용어 일관성: `shared/terminology.md` 기준
  - ID 참조 유효성: 깨진 참조, 순환 참조 없음
  - 디자인 스펙(SPEC-GLO-001) 대비 누락 확인

  **이전 문서와의 정합성:**
  - PRD-GLO-001 F-006 (오디언스 타겟팅) 연동 정합성
  - PRD-GLO-002 승인 워크플로우 패턴 일관성
  - DIA-GLO-001 ERD 확장 정합성

  **산출물:**
  - 이슈 목록 (ISS-{NNN}, 심각도 Critical/Major/Minor)
  - 평가: Pass / Conditional / Fail
  - Pass 기준: Critical 0, Major 0, Minor ≤ 5

  입력: PRD-GLO-003, UX-GLO-003, DIA-GLO-003, `shared/review-checklist.md`

- [ ] **Step 2: 리뷰 결과에 따른 분기**

  - **Pass**: Step 3으로 진행
  - **Conditional/Fail**: 해당 에이전트(prd/uiux-spec/diagram)로 피드백 전달 → 수정 → 버전 업데이트(v1.1) → 재리뷰

- [ ] **Step 3: 리뷰 리포트 최종화**

  REV-GLO-002 리포트를 최종 완성하고 저장.

---

## Task 6: meta.yml 업데이트 및 커밋

**Files:**
- Modify: `docs/meta.yml`

- [ ] **Step 1: meta.yml에 신규 문서 등록**

  다음 문서들을 `docs/meta.yml`의 documents 섹션에 추가:
  - MTG-GLO-005 (회의록)
  - PRD-GLO-003 (PRD)
  - UX-GLO-003 (UX 스펙)
  - DIA-GLO-003 (다이어그램)
  - REV-GLO-002 (리뷰 리포트)

  decisions 섹션에 추가:
  - D-019: A/B 테스트 원격 설정 확장형 설계 채택
  - D-020: 비기술 운영팀 대상 5단계 위저드 설계
  - D-021: 중급 통계 (Chi-squared + Welch's t + Bonferroni)
  - D-022: 기존 오디언스 직접 활용 (PRD-GLO-001 F-006)
  - D-023: 사전 테스트 + 승인 워크플로우 필수

  action_items 섹션에 추가:
  - A-019~: PRD 작성, UX 스펙 작성, 다이어그램 작성, 리뷰 실시

- [ ] **Step 2: 전체 산출물 커밋**

  ```bash
  git add docs/08-meeting-note/2026-03-24_MTG_GLO_ab-testing_v1.0.md
  git add docs/03-prd/2026-03-24_PRD_GLO_ab-testing_v1.0.md
  git add docs/05-ux/2026-03-24_UX_GLO_ab-testing_v1.0.md
  git add docs/06-diagrams/2026-03-24_DIA_GLO_ab-testing_v1.0.md
  git add docs/07-reviews/2026-03-24_REV_GLO_ab-testing-review_v1.0.md
  git add docs/meta.yml
  git commit -m "[planner] feat: A/B 테스트(실험) 기획 산출물 생성 - PRD, UX, 다이어그램, 리뷰"
  ```

---

## 실행 순서 요약

```
Task 1: 회의록 (meeting-note)
  ↓
Task 2: PRD (prd)
  ↓
Task 3: UX 스펙 (uiux-spec) ──┐
Task 4: 다이어그램 (diagram)  ──┤ 병렬 실행
                               ↓
Task 5: 리뷰 (reviewer)
  ↓
Task 6: meta.yml 업데이트 + 커밋
```

## 검증

- 모든 문서가 `shared/style-guide.md` YAML front matter 규칙을 따르는지 확인
- 기능 ID(F-017~F-023), 화면 ID(SCR-013~017), 다이어그램 ID(DIA-015~019)가 기존 체계와 연속적인지 확인
- reviewer 에이전트의 교차 검증 결과가 Pass인지 확인
- `docs/meta.yml`에 모든 신규 문서가 등록되었는지 확인
