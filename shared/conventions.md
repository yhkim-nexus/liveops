# 컨벤션 (Conventions)

파일명, ID, 폴더 구조에 대한 규칙입니다.

## 1. 파일 네이밍

### 1.1 기본 패턴

```
{날짜}_{타입}_{프로젝트}_{주제}_v{버전}.md
```

**예시:**
```
2025-02-13_PRD_membership_user-auth_v1.0.md
2025-02-13_RES_membership_competitor-analysis_v1.0.md
2025-02-13_UX_membership_login-screen_v1.2.md
```

### 1.2 타입 접두사

| 타입 | 접두사 | 에이전트 |
|------|--------|----------|
| 리서치 리포트 | `RES` | researcher |
| 회의록 | `MTG` | meeting-note |
| 기획 세션 | `SES` | planner |
| PRD | `PRD` | prd |
| 운영정책 | `POL` | policy |
| 화면정의서 | `UX` | uiux-spec |
| 다이어그램 | `DIA` | diagram |
| 검토 리포트 | `REV` | reviewer |

### 1.3 규칙

- 모든 문자 소문자 (타입 접두사 제외)
- 공백 대신 `-` (하이픈)
- 특수문자 금지
- 영문 사용 권장 (한글 가능)

## 2. ID 체계

### 2.1 문서 ID

```
{타입}-{프로젝트코드}-{순번}
```

**예시:**
```
PRD-MEM-001    # Membership 프로젝트 첫 번째 PRD
RES-MEM-002    # Membership 프로젝트 두 번째 리서치
UX-MEM-001     # Membership 프로젝트 첫 번째 화면정의서
```

### 2.2 프로젝트 코드

- 3-4자 영문 대문자
- 프로젝트 생성 시 `meta.yml`에 정의

**예시:**
```
MEM: Membership
PAY: Payment
NTF: Notification
```

### 2.3 내부 ID

문서 내부 항목 ID:

| 항목 | 패턴 | 예시 |
|------|------|------|
| 기능 | `F-{순번}` | F-001, F-002 |
| 요구사항 | `REQ-{기능}-{순번}` | REQ-001-01 |
| 화면 | `SCR-{순번}` | SCR-001 |
| UI 요소 | `E-{화면}-{순번}` | E-001-01 |
| 인터랙션 | `INT-{화면}-{순번}` | INT-001-01 |
| 결정사항 | `D-{순번}` | D-001 |
| 액션아이템 | `A-{순번}` | A-001 |
| 질문 | `Q-{순번}` | Q-001 |
| 리스크 | `R-{순번}` | R-001 |

## 3. 폴더 구조

### 3.1 프로젝트 폴더

```
docs/
├── meta.yml                 # 프로젝트 메타데이터
├── 01-research/             # 리서치 산출물
├── 02-planning/             # 기획 세션
├── 03-prd/                  # PRD 문서
├── 04-policy/               # 정책 문서
├── 05-ux/                   # 화면정의서
├── 06-diagrams/             # 다이어그램
├── 07-reviews/              # 검토 리포트
├── 08-meeting-note/         # 회의록
└── assets/                  # 이미지 등 첨부파일
```

### 3.2 폴더 번호

- 번호는 워크플로우 순서 반영
- 새 폴더 추가 시 기존 번호 유지

### 3.3 아카이브

완료된 프로젝트:
```
docs/archive/{YYYY}/{project-name}/
```

## 4. Git 커밋 메시지 (Optional)

```
[{에이전트}] {액션}: {설명}

예시:
[prd] create: PRD-MEM-001 초안 작성
[reviewer] update: REV-MEM-001 피드백 반영
[planner] complete: SES-MEM-003 세션 종료
```

## 5. 태그 규칙

문서 front matter의 tags:

```yaml
tags:
  - "project:{프로젝트명}"
  - "type:{문서타입}"
  - "status:{상태}"
  - "feature:{기능}"
```

**예시:**
```yaml
tags:
  - "project:membership"
  - "type:prd"
  - "status:review"
  - "feature:authentication"
```