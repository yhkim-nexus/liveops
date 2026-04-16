---
id: "MTG-GLO-001"
title: "회의록: Game LiveOps 프로젝트 킥오프 및 시장조사"
project: "GLO"
version: "v1.0"
status: "completed"
created: "2026-03-05"
author: "meeting-note"
session_type: "리서치정리"
participants:
  - "사용자"
  - "planner"
  - "researcher"
related_docs:
  - "SES-GLO-001"
  - "RES-GLO-001"
tags:
  - "project:game-liveops"
  - "type:meeting"
---

# 회의록: Game LiveOps 프로젝트 킥오프 및 시장조사

## 문서 정보

| 항목 | 내용 |
|------|------|
| ID | MTG-GLO-001 |
| 일시 | 2026-03-05 |
| 참석자 | 사용자, planner, researcher |
| 세션 유형 | 리서치정리 |
| 관련 문서 | SES-GLO-001, RES-GLO-001 |

---

## 1. 회의 목적

Game LiveOps 서비스 기획 프로젝트를 공식 킥오프하고, 시장조사를 통해 경쟁 서비스 현황, 제공 기능, 장단점을 파악한다.

---

## 2. 논의 내용

### 2.1 프로젝트 초기화

**배경**
- Game LiveOps 서비스 기획을 위한 신규 프로젝트를 시작
- 기존 에이전트 시스템의 산출물 경로를 `vault/`에서 `docs/`로 변경하고, 프로젝트 레벨 없이 단일 프로젝트 구조로 평탄화하는 사전 작업 완료

**논의 내용**
- Planner 에이전트를 통해 프로젝트 폴더 구조(docs/01-research ~ 07-reviews) 생성
- 프로젝트 코드를 "GLO"(Game LiveOps)로 확정
- meta.yml 및 킥오프 세션 문서(SES-GLO-001) 작성 완료

**결론**
- 프로젝트 초기화 완료, 시장조사 단계 진입

### 2.2 시장조사 요구사항 정의

**배경**
- 사용자가 시장조사에 반드시 포함할 항목을 명시

**논의 내용**
- 시장조사 필수 포함 사항:
  1. 현재 운영 중인 서비스명
  2. 홈페이지 주소(URL)
  3. 서비스별 장단점
  4. 서비스별 제공 기능
- Planner와 Researcher 에이전트를 병렬로 실행하여 프로젝트 초기화와 시장조사를 동시 진행

**결론**
- 4가지 필수 항목을 모두 포함하는 시장조사 리포트 작성을 researcher에게 위임

### 2.3 시장조사 결과 요약

**배경**
- Researcher 에이전트가 웹 검색을 통해 글로벌 Game LiveOps 서비스를 조사

**논의 내용**
- 총 14개 서비스를 식별하고 분석 완료:

| 카테고리 | 서비스 |
|----------|--------|
| 대형 플랫폼 (올인원) | Azure PlayFab, Unity UGS, AccelByte, Pragma |
| LiveOps 특화 | Metaplay, Balancy, Heroic Labs Satori, Beamable |
| 분석/데이터 특화 | GameAnalytics, devtodev |
| 범용 확장 | LaunchDarkly, brainCloud, LootLocker |
| AI 특화 (신생) | Magify |

- 핵심 발견 사항:
  - PlayFab과 Unity UGS가 시장 양분, 중소 게임사 대상 경량 솔루션에 공백 존재
  - 원격 설정, A/B 테스트, 이벤트 관리가 LiveOps 표준 기능셋으로 정착
  - 노코드/로우코드 운영 도구와 AI 기반 자동화가 차세대 경쟁력
  - 대부분 무료 티어 + MAU 기반 종량제 과금 모델 채택

- 14개 서비스 x 13개 기능 항목에 대한 비교표 작성 완료
- 서비스별 홈페이지 URL, 핵심 기능, 가격 정책, 강점/약점 모두 문서화

**결론**
- 시장조사 리포트(RES-GLO-001) 초안 작성 완료
- 기획 방향으로 "기획자가 바로 쓸 수 있는 노코드 Game LiveOps" 포지셔닝 제안

---

## 3. 결정 사항

| ID | 결정 내용 | 근거 | 비고 |
|----|----------|------|------|
| D-001 | Game LiveOps 서비스 기획 프로젝트 킥오프, 시장조사부터 시작 | 시장 현황 및 경쟁 서비스 파악이 기획의 기초 | SES-GLO-001에서 확정 |
| D-002 | 프로젝트 코드를 "GLO"로 확정 | Game LiveOps의 약어 | meta.yml에 반영됨 |
| D-003 | 시장조사에 서비스명, URL, 장단점, 제공기능을 필수 포함 | 사용자 요구사항 | RES-GLO-001에 반영됨 |

---

## 4. 액션 아이템

| ID | 항목 | 담당 | 기한 | 상태 |
|----|------|------|------|------|
| A-001 | 게임 라이브옵스 시장조사 수행 | researcher | - | 완료 |
| A-002 | 시장조사 결과 기반 기획 세션 진행 (서비스 컨셉, 핵심 기능, 타겟 사용자 확정) | planner | - | 대기 |
| A-003 | 경쟁사 심층 분석 리포트 작성 (상위 5개 서비스 상세) | researcher | - | 대기 |
| A-004 | 타겟 사용자 리서치 (게임사 규모/장르별 니즈) | researcher | - | 대기 |

---

## 5. 미결 사항

| ID | 이슈 | 필요한 정보/결정 | 담당 |
|----|------|-----------------|------|
| Q-001 | 라이브옵스 서비스의 핵심 타겟 사용자(게임사 규모, 장르 등)를 어떻게 설정할 것인가? | 사용자 리서치 결과 및 사용자 확정 필요 | planner |
| Q-002 | MVP 기능 범위를 어디까지 잡을 것인가? (원격설정 + 이벤트 + A/B 테스트 외 추가 기능?) | 기획 세션에서 논의 필요 | planner |
| Q-003 | 자체 서비스로 구축할 것인가, SaaS로 제공할 것인가? | 비즈니스 모델 결정 필요 | 사용자 |

---

## 6. 다음 회의 안건

- [ ] 시장조사 결과 리뷰 및 기획 방향 확정
- [ ] 타겟 사용자 세그먼트 결정 (인디/중소/대형 중 1차 타겟)
- [ ] MVP 핵심 기능 범위 확정
- [ ] 경쟁사 대비 차별화 전략 논의
- [ ] PRD 작성 시작 여부 결정

---

## 7. 서비스 컨텍스트 요약

> 이 섹션은 다른 에이전트가 참조할 수 있도록 현재까지 확정된 내용을 요약합니다.

```yaml
service:
  name: "Game LiveOps Service"
  target_user: "미정 (인디~중소 모바일 게임사 유력)"
  core_value: "기획자가 바로 쓸 수 있는 노코드 Game LiveOps 플랫폼"

current_phase: "research"

confirmed_features: []
  # MVP 후보 (시장조사 결과 기반, 미확정):
  # - 원격 설정 (Remote Config)
  # - 이벤트/프로모션 관리
  # - A/B 테스트
  # - 노코드 운영 대시보드

key_decisions:
  - "D-001: 시장조사부터 시작"
  - "D-002: 프로젝트 코드 GLO"
  - "D-003: 시장조사 필수 포함항목 4가지 확정"

constraints:
  - "비개발자(기획자/운영자) 친화적 도구 지향"
  - "무료 티어 포함 가격 모델 필요"

research_summary:
  total_competitors: 14
  market_leaders: ["Azure PlayFab", "Unity UGS"]
  key_opportunity: "노코드 LiveOps + AI 자동화"
  target_gap: "중소 게임사 대상 경량 솔루션 공백"
```

---

## 변경 이력

| 버전 | 일자 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| v1.0 | 2026-03-05 | 초안 작성 - 킥오프 및 시장조사 결과 정리 | meeting-note |
