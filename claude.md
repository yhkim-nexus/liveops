# Service Planning Agent System

## 1. 프로젝트 개요 및 아키텍처

서비스/제품 기획 전 과정을 Claude 에이전트 팀이 자동화하는 시스템이다.
리서치 -> PRD -> 정책/UX/다이어그램 -> 리뷰까지의 파이프라인을 구조화된 문서와 품질 관리 워크플로우로 운영한다.

### 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 16, React 19, TypeScript |
| UI | Shadcn UI, Radix UI, Tailwind CSS 4 |
| Forms/Validation | React Hook Form, Zod |
| 데이터/상태 | React Query, React Table |
| 차트 | Recharts |
| 문서 포맷 | Markdown + YAML front matter |
| 에이전트 | Claude (Opus, Sonnet, Haiku) |

### 디렉토리 구조

```
/
├── .claude/
│   ├── agents/           # 에이전트 정의 (9개)
│   └── worktree/         # 워크플로우 정의
├── apps/
│   ├── admin/            # Next.js 관리자 대시보드
│   └── external-admin/   # Next.js 외부 관리자 앱
├── docs/                 # 기획 산출물 저장소
│   ├── meta.yml
│   ├── 01-research/
│   ├── 02-planning/
│   ├── 03-prd/
│   ├── 04-policy/
│   ├── 05-ux/
│   ├── 06-diagrams/
│   ├── 07-reviews/
│   └── 08-meeting-note/
├── shared/               # 공통 규칙 파일
├── templates/            # 문서 템플릿
└── config.yml            # 메인 설정 파일
```

### 표준 워크플로우

```
Planner (팀 리더)
  ├── Researcher (시장조사)       ← 병렬
  ├── Meeting-Note (세션 기록)    ← 병렬
  │
  └── PRD (요구사항 정의)         ← 리서치 완료 후
        ├── Policy (운영 정책)    ← 병렬
        ├── UIUX-Spec (화면 정의) ← 병렬
        └── Diagram (다이어그램)   ← 병렬
              │
              └── Reviewer (QA 검토)
```

---

## 2. 에이전트 역할 및 구조

### 에이전트 목록

| 에이전트 | 모델 | 역할 | 산출물 경로 |
|----------|------|------|------------|
| **planner** | Opus | 팀 리더. 프로젝트 생성, 에이전트 스폰, 워크플로우 조율 | `02-planning/` |
| **researcher** | Sonnet | 시장조사, 경쟁사 분석, 트렌드 파악 | `01-research/` |
| **meeting-note** | Haiku | 기획 대화 요약, 결정사항/액션아이템 추출 | `08-meeting-note/` |
| **prd** | Sonnet | 제품 요구사항 문서 작성 (기능 정의, 수용 기준) | `03-prd/` |
| **policy** | Sonnet | 서비스 운영 정책 (결제, 환불, 개인정보 등) | `04-policy/` |
| **uiux-spec** | Sonnet | 화면 정의서, 와이어프레임, 인터랙션 설계 | `05-ux/` |
| **diagram** | Sonnet | UML, 플로우차트, ERD, 시퀀스 다이어그램 | `06-diagrams/` |
| **reviewer** | Sonnet | 문서 품질 검토, 교차 검증, 승인/반려 | `07-reviews/` |
| **senior-frontend-developer** | - | 기획 산출물 기반 프론트엔드 구현 | `apps/` |

### 에이전트 호출 트리거

- **planner**: "기획 시작", "새 프로젝트", "팀 기획", "서비스 구상"
- **researcher**: "시장 조사", "경쟁사 분석", "트렌드", "벤치마킹"
- **prd**: "PRD 작성", "요구사항 문서", "기능 명세", "스펙 문서"
- **uiux-spec**: "화면 정의", "와이어프레임", "UI 스펙", "인터랙션"
- **policy**: "운영정책", "이용약관", "환불정책", "개인정보정책"
- **diagram**: "다이어그램", "플로우차트", "UML", "시퀀스", "ERD"
- **reviewer**: "문서 검토", "QA", "리뷰", "검증", "피드백"
- **meeting-note**: "회의록 작성", "대화 정리", "논의 내용 정리"
- **senior-frontend-developer**: PRD/UX 스펙 완료 후 구현 단계

### ID 체계

| 항목 | 패턴 | 예시 |
|------|------|------|
| 문서 | `{TYPE}-{PROJECT}-{NUM}` | PRD-MEM-001 |
| 기능 | `F-{n}` | F-001 |
| 유저스토리 | `US-{n}` | US-001 |
| 화면 | `SCR-{n}` | SCR-001 |
| UI 요소 | `E-{screen}-{n}` | E-001-01 |
| 인터랙션 | `INT-{screen}-{n}` | INT-001-01 |
| 리뷰 이슈 | `ISS-{n}` | ISS-001 |

### 파일 네이밍 규칙

```
{YYYY-MM-DD}_{TYPE}_{PROJECT}_{TOPIC}_v{VERSION}.md
예: 2025-02-13_PRD_membership_user-auth_v1.0.md
```

---

## 3. shared/ 규칙 파일 참조

모든 에이전트는 아래 공통 규칙 파일을 준수해야 한다.

| 파일 | 경로 | 설명 |
|------|------|------|
| 스타일 가이드 | `shared/style-guide.md` | 문서 작성 표준 (YAML front matter, 제목 구조, 포맷 규칙, 버전 관리) |
| 용어집 | `shared/terminology.md` | 표준 용어 정의 (회원/비회원, 결제/환불, 상태값 등) |
| 네이밍 규칙 | `shared/conventions.md` | 파일명, 문서 ID, 내부 항목 ID, 폴더 구조, 태깅 규칙 |
| 검토 체크리스트 | `shared/review-checklist.md` | QA 기준 (공통 체크리스트, 문서 유형별 체크리스트, 교차 검증, 승인 기준) |

### 핵심 규칙 요약

- **문서 상태 흐름**: `draft` -> `review` -> `approved` -> `archived`
- **버전 규칙**: v1.0(초기), v1.1~v1.9(소규모 수정), v2.0+(대규모 변경)
- **용어 통일**: "회원"(사용자X), "관리자"(administrator X), "결제"(지불X), "환불"(반품X)
- **YAML front matter 필수 필드**: id, title, project, version, status, created, updated, author

---

## 4. review-cycle.yml 워크플로우 요약

**파일 위치**: `.claude/worktree/review-cycle.yml`

### 개요

문서 검토 -> 피드백 -> 수정 -> 재검토 사이클을 정의한 워크플로우다.
Reviewer 에이전트가 리드하며, 담당 에이전트들과 협업하여 문서 품질을 보장한다.

### 참여 에이전트

reviewer(리드), prd, uiux-spec, diagram, policy

### 실행 단계

```
1. 검토 요청 수신
   └── 트리거: "문서 검토해줘", "PRD 리뷰 요청", "{project} 검토 시작"

2. 문서 수집
   └── docs/ 에서 status: review 문서 수집

3. 개별 문서 검토
   └── shared/review-checklist.md 기준 적용
   └── 이슈 기록: ID, 심각도(critical/major/minor), 위치, 설명, 제안

4. 교차 문서 검토
   ├── 기능 추적: PRD(F-xxx) -> UX(SCR-xxx), 다이어그램, 정책 매핑
   ├── 용어 일관성: shared/terminology.md 기준 검증
   └── ID 참조 유효성: 깨진 참조, 순환 참조 확인

5. 검토 리포트 작성
   └── 산출물: docs/07-reviews/{date}_REV_{project}_review-report_v{n}.md

6. 평가 및 분기
   ├── Pass    (Critical: 0, Major: 0, Minor: <=5) -> 승인 처리
   ├── Conditional (Critical: 0, Major: 1-3)       -> 피드백 전달 -> 수정 -> 재검토
   └── Fail    (Critical: >=1 또는 Major: >=4)     -> 피드백 전달 -> 수정 -> 재검토

7. 수정 및 재제출 (Conditional/Fail 시)
   └── 담당 에이전트가 피드백 반영 -> 버전 업데이트(v1.0 -> v1.1) -> 재검토 요청

8. 승인 처리 (Pass 시)
   └── 전체 문서 status: approved 변경 -> 최종 리포트 작성 -> meta.yml 업데이트
```

### 이슈 심각도

| 등급 | 조건 | 조치 |
|------|------|------|
| Critical | 서비스 영향, 법적 문제 | 즉시 수정 필수 |
| Major | 품질 저하, 혼란 유발 | 승인 전 수정 필수 |
| Minor | 개선 권장 사항 | 다음 버전에서 반영 |
