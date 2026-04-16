---
id: "SPEC-GLO-004"
title: "MVP 사이드바 레이아웃 전환 디자인 스펙"
project: "GLO"
version: "v1.0"
status: "draft"
created: "2026-03-26"
updated: "2026-03-26"
author: "planner"
reviewers: []
related_docs:
  - "SPEC-GLO-002"
  - "SPEC-GLO-003"
  - "RES-GLO-002"
tags:
  - "project:game-liveops"
  - "type:spec"
  - "topic:mvp-layout"
---

# SPEC: MVP 사이드바 레이아웃 전환

> 기존 상단 GNB를 Ramp Console 패턴의 좌측 사이드바 레이아웃으로 전환하여 MVP 전체 셸(shell)을 구성한다

## 1. 개요

### 배경

CROSS Ramp Console의 좌측 사이드바 + 우측 콘텐츠 레이아웃을 LiveOps 관리자 대시보드에 적용한다. 기존 상단 GNB(E-RBAC-01)를 사이드바로 전환하고, 기존 RBAC/대시보드 기능을 그대로 유지한다.

### 변경 범위

- GNB.tsx → Sidebar.tsx 교체
- Header.tsx 신규 (우측 상단 사용자 정보 바)
- layout.tsx 수정 (사이드바 + 헤더 + 콘텐츠 3영역)
- 기존 RBAC/대시보드 기능은 변경 없음

## 2. 레이아웃 구조

```
┌───────────────────────────────────────────────┐
│ ┌──────────┐ ┌──────────────────────────────┐ │
│ │ LiveOps  │ │ Header (유저+역할+로그아웃)   │ │
│ │          │ ├──────────────────────────────┤ │
│ │ 대시보드  │ │                              │ │
│ │ 세그먼트  │ │ 콘텐츠 영역 (children)       │ │
│ │ 이벤트   │ │                              │ │
│ │ 실험     │ │                              │ │
│ │ ───────  │ │                              │ │
│ │ 설정     │ │                              │ │
│ │          │ │                              │ │
│ │ ◀ 접기   │ │                              │ │
│ └──────────┘ └──────────────────────────────┘ │
└───────────────────────────────────────────────┘
```

사이드바 너비: 펼침 240px / 접힘 64px (아이콘만)

## 3. 사이드바 메뉴

| 아이콘 | 라벨 | 경로 | 최소 역할 |
|--------|------|------|----------|
| LayoutDashboard | 대시보드 | /dashboard | viewer |
| Users | 세그먼트 | /segments | operator |
| Calendar | 이벤트 | /events | operator |
| FlaskConical | 실험 | /experiments | operator |
| (구분선) | | | |
| Settings | 설정 | /settings/admins | admin |

하단: 접기/펼치기 토글 버튼

## 4. Header 바

- 우측 정렬: 관리자 이름 + 역할 배지(RoleBadge) + 로그아웃 버튼
- 높이: 56px, 하단 border

## 5. 파일 변경

| 파일 | 액션 | 설명 |
|------|------|------|
| src/features/auth/components/Sidebar.tsx | 신규 | 좌측 사이드바 |
| src/features/auth/components/Header.tsx | 신규 | 상단 헤더 바 |
| src/features/auth/components/AppShell.tsx | 신규 | Sidebar + Header + Content 조합 |
| src/features/auth/components/GNB.tsx | 삭제 | 사이드바로 대체 |
| src/app/layout.tsx | 수정 | GNB → AppShell로 교체 |

## 변경 이력

| 버전 | 일자 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| v1.0 | 2026-03-26 | 초안 작성 | planner |
