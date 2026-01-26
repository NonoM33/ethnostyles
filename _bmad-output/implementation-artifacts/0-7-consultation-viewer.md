# Story 0.7: Consultation Viewer

Status: done

## Story

As a Viewer,
I want to access dashboards in read-only mode,
So that I can see campaign results.

## Acceptance Criteria

1. **AC1: Dashboard Access**
   - **Given** I am logged in as Viewer
   - **When** I access the dashboard
   - **Then** I can see all campaign statistics

2. **AC2: Read-Only Mode**
   - **Given** I am logged in as Viewer
   - **When** I try to create/edit a campaign
   - **Then** I see a "Permission denied" message
   - **And** the action is blocked

## Tasks / Subtasks

- [x] **Task 1: Role-Based UI** (AC: 1, 2)
  - [x] Hide admin-only actions for viewers
  - [x] Show read-only indicators where appropriate

- [x] **Task 2: Backend Authorization** (AC: 2)
  - [x] Add role check middleware
  - [x] Protect admin-only endpoints

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

Implemented role-based UI in TeamPage:
- Viewers see a "Mode lecture seule" notice explaining their permissions
- Admin-only features (invite form, revoke/cancel buttons) are hidden for viewers
- Backend endpoints (POST /team/invite, DELETE /team/invite/:id, DELETE /team/members/:id, POST /team/members/:id/reactivate) all check for admin role and return 403 FORBIDDEN for non-admins

### File List

- apps/web/src/features/team/TeamPage.tsx (role-based UI)
- apps/api/src/routes/team.ts (role checks on all write endpoints)
