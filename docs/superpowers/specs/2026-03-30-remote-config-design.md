# Remote Config (Key-Value) Design Spec

**Date:** 2026-03-30
**Status:** Approved
**Author:** Claude + David

---

## 1. Overview

### 1.1 Purpose

게임 클라이언트와 서버에서 참조하는 설정값을 어드민 콘솔에서 원격으로 관리하는 Key-Value Remote Config 시스템이다. 앱 업데이트 없이 밸런스 조정, 기능 플래그 토글, UI 텍스트 변경 등을 실시간으로 반영할 수 있다.

### 1.2 Scope

- 플랫 Key-Value 테이블 (dot notation 네임스페이스)
- Value 타입: string, number, boolean, JSON
- 적용 대상: client / server / both
- 전체 플레이어에게 동일 값 적용 (조건부 딜리버리 없음)
- 즉시 반영 (승인 워크플로우 없음)
- 변경 이력 (감사 로그 수준)

### 1.3 Out of Scope

- 세그먼트별 조건부 딜리버리
- 승인/발행 워크플로우
- 버전 스냅샷 및 롤백
- 환경(dev/staging/prod) 분리
- JSON Schema 유효성 검증

---

## 2. Data Model

### 2.1 RemoteConfigEntry

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | Y | 고유 식별자 |
| `key` | string | Y | 설정 키 (dot notation, 예: `game.reward.daily_coin`). 유니크 제약 |
| `valueType` | `"string" \| "number" \| "boolean" \| "json"` | Y | 값 타입 |
| `value` | string | Y | 직렬화된 값. 타입에 맞게 클라이언트가 파싱 |
| `description` | string | N | 운영자용 설명 메모 |
| `target` | `"client" \| "server" \| "both"` | Y | 적용 대상 |
| `tags` | string[] | N | 자유 태그 (필터링용, 예: `balance`, `ui`, `feature-flag`) |
| `createdAt` | ISO 8601 | Y | 생성 시각 |
| `createdBy` | string | Y | 생성자 |
| `updatedAt` | ISO 8601 | Y | 마지막 수정 시각 |
| `updatedBy` | string | Y | 마지막 수정자 |

### 2.2 RemoteConfigChangeLog

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Y | 이력 ID |
| `configId` | string | Y | RemoteConfigEntry ID |
| `action` | `"created" \| "updated" \| "deleted"` | Y | 변경 유형 |
| `field` | string | N | 변경된 필드명 (updated 시) |
| `previousValue` | string \| null | N | 이전 값 |
| `newValue` | string \| null | N | 새 값 |
| `changedBy` | string | Y | 변경자 |
| `changedAt` | ISO 8601 | Y | 변경 시각 |

### 2.3 Key 규칙

- 소문자 영문, 숫자, dot(`.`), underscore(`_`), hyphen(`-`) 허용
- dot으로 네임스페이스 구분 (예: `game.reward.daily_coin`)
- 최소 1자, 최대 256자
- 중복 불가

---

## 3. Screen Design

### 3.1 Navigation

사이드바에서 실험(Experiments)과 푸시 알림(Push) 사이에 배치:

```
📊 대시보드
👥 플레이어
🎯 세그먼트
📅 이벤트
🧪 실험
⚙️ Remote Config   ← NEW
📱 푸시 알림
⚙️ 설정
```

### 3.2 목록 페이지 (`/remote-config`)

**URL:** `/remote-config`
**접근 권한:** Viewer 이상

**레이아웃:**
```
┌─────────────────────────────────────────────────────────┐
│ Remote Config                          [+ 설정 추가]    │
├─────────────────────────────────────────────────────────┤
│ [🔍 키 또는 설명 검색...]                                │
│ [Target ▾ all]  [Type ▾ all]  [Tag ▾ all]              │
├─────────────────────────────────────────────────────────┤
│ Key              │ Value    │ Type   │ Target │ Updated │
│──────────────────┼──────────┼────────┼────────┼─────────│
│ game.reward.coin │ 100      │ number │ client │ 3분 전  │
│ ui.banner.text   │ "안녕"   │ string │ client │ 1시간전 │
│ feature.pvp      │ true     │ boolean│ both   │ 2일 전  │
│ server.match.max │ 50       │ number │ server │ 5일 전  │
├─────────────────────────────────────────────────────────┤
│ ◀ 1 2 3 ▶                              20개씩 보기 ▾   │
└─────────────────────────────────────────────────────────┘
```

**기능:**
- 검색: key, description 대상 부분 문자열 매칭
- 필터: Target (all/client/server/both), Type (all/string/number/boolean/json), Tag
- 정렬: Key 가나다순 (기본), Updated 최신순 토글
- 페이지네이션: 기존 PaginationBar 컴포넌트 재사용
- 행 클릭 → 상세 페이지(`/remote-config/[id]`)로 이동
- `+ 설정 추가` 버튼 → `/remote-config/new` (Editor 이상)

### 3.3 추가 페이지 (`/remote-config/new`)

**URL:** `/remote-config/new`
**접근 권한:** Editor 이상

**레이아웃:**
```
┌─────────────────────────────────────────────────────────┐
│ ← Remote Config    새 설정 추가                         │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 기본 정보                                           │ │
│ │                                                     │ │
│ │ Key *          [game.reward.daily_coin          ]   │ │
│ │ 설명           [일일 보상 코인 수량              ]   │ │
│ │ Target *       (●) Client  (○) Server  (○) Both    │ │
│ │ Tags           [balance] [reward] [+ 추가]         │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 값 설정                                             │ │
│ │                                                     │ │
│ │ Type *         [number ▾]                           │ │
│ │ Value *        [100                            ]    │ │
│ │                                                     │ │
│ │ ℹ️ number 타입: 정수 또는 소수점 숫자를 입력하세요   │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│                          [취소]  [저장]                  │
└─────────────────────────────────────────────────────────┘
```

**타입별 Value 입력:**
- `string`: 일반 텍스트 Input
- `number`: 숫자 Input (정수/소수 허용)
- `boolean`: Toggle Switch (true/false)
- `json`: 여러 줄 Textarea (JSON 유효성 실시간 검증)

**유효성 검증 (Zod):**
- Key: 필수, 정규식 패턴, 중복 체크 (blur 시 API 호출)
- Value: 필수, 타입에 맞는 값인지 검증
- Target: 필수

### 3.4 상세 페이지 (`/remote-config/[id]`)

**URL:** `/remote-config/[id]`
**접근 권한:** Viewer 이상

상단에 설정 정보 카드, 하단에 변경 이력 테이블 표시.
Editor 이상에게 [편집] [삭제] 버튼 노출.

### 3.5 편집 페이지 (`/remote-config/[id]/edit`)

추가 페이지와 동일한 폼 레이아웃. Key 필드는 읽기 전용 (키 변경 불가, 삭제 후 재생성으로 유도).

---

## 4. API Design

### 4.1 Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `GET` | `/api/remote-config` | 목록 조회 | Viewer+ |
| `GET` | `/api/remote-config/:id` | 단건 조회 + 변경이력 | Viewer+ |
| `POST` | `/api/remote-config` | 설정 추가 | Editor+ |
| `PUT` | `/api/remote-config/:id` | 설정 수정 | Editor+ |
| `DELETE` | `/api/remote-config/:id` | 설정 삭제 | Editor+ |

### 4.2 Query Parameters (GET 목록)

| Param | Type | Description |
|-------|------|-------------|
| `search` | string | key, description 검색 |
| `target` | string | client / server / both 필터 |
| `valueType` | string | string / number / boolean / json 필터 |
| `tag` | string | 태그 필터 |
| `sort` | string | `key_asc` (기본), `updated_desc` |
| `page` | number | 페이지 번호 |
| `size` | number | 페이지 크기 (기본 20) |

### 4.3 Response Format

기존 ApiResponse 래퍼 패턴 준수:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: { generatedAt: string; total?: number; page?: number; size?: number };
}
```

---

## 5. Frontend Architecture

### 5.1 File Structure

```
src/
├── app/remote-config/
│   ├── page.tsx                          # 목록 페이지
│   ├── new/page.tsx                      # 추가 페이지
│   └── [id]/
│       ├── page.tsx                      # 상세 페이지
│       └── edit/page.tsx                 # 편집 페이지
├── app/api/remote-config/
│   ├── route.ts                          # GET(목록), POST(생성)
│   └── [id]/route.ts                     # GET, PUT, DELETE
└── features/remote-config/
    ├── types/remote-config.ts            # 타입 정의
    ├── hooks/use-remote-config-queries.ts # React Query 훅
    ├── components/
    │   ├── RemoteConfigForm.tsx           # 추가/편집 공통 폼
    │   ├── RemoteConfigValueInput.tsx     # 타입별 값 입력
    │   ├── RemoteConfigTargetBadge.tsx    # target 뱃지
    │   ├── RemoteConfigTypeBadge.tsx      # valueType 뱃지
    │   └── ChangeLogTable.tsx            # 변경 이력 테이블
    └── lib/
        ├── mock-remote-config.ts          # Mock 데이터
        └── validation.ts                 # Zod 스키마
```

### 5.2 Reusable Components

기존 코드베이스에서 재사용:
- `PaginationBar` — 페이지네이션 (`src/components/ui/pagination-bar.tsx`)
- `Badge` — 태그, 타입, 타겟 표시 (`src/components/ui/badge.tsx`)
- `Table` — 목록 테이블 (`src/components/ui/table.tsx`)
- `Card` — 폼 섹션 래핑 (`src/components/ui/card.tsx`)
- `Input`, `Label`, `Select` — 폼 필드 (`src/components/ui/`)
- `Button` — 액션 버튼 (`src/components/ui/button.tsx`)

### 5.3 RBAC

기존 역할 체계 (`features/auth/lib/roles.ts`) 적용:
- **Viewer**: 목록, 상세 조회
- **Editor**: 추가, 수정, 삭제
- **Operator/Admin**: 전체 권한

`routes.ts`에 remote-config 경로 추가, `RoleGate` 컴포넌트로 권한 체크.

---

## 6. Verification

### 6.1 수동 테스트

1. 사이드바에서 Remote Config 메뉴 클릭 → 목록 페이지 렌더링 확인
2. `+ 설정 추가` → 폼 입력 → 저장 → 목록에 반영 확인
3. 각 타입(string/number/boolean/json)별 값 입력 UI 동작 확인
4. 검색, 필터(target/type/tag), 정렬 동작 확인
5. 설정 클릭 → 상세 → 편집 → 값 변경 → 변경 이력에 기록 확인
6. 설정 삭제 후 목록에서 제거 확인
7. Viewer 권한으로 추가/편집/삭제 버튼 미노출 확인

### 6.2 자동 테스트

- Zod 유효성 스키마 단위 테스트
- RemoteConfigForm 컴포넌트 테스트 (타입별 입력, 필수값 검증)
- API route handler 테스트 (CRUD 동작, 권한 체크)
