# Story 0.8: Révocation Accès Viewer

Status: done

## Story

As an admin,
I want to revoke a Viewer's access,
So that they can no longer see my data.

## Acceptance Criteria

1. **AC1: Revoke Access**
   - **Given** I am logged in as Admin
   - **When** I revoke a Viewer's access
   - **Then** their account is deactivated
   - **And** their sessions are invalidated
   - **And** they cannot log in anymore

2. **AC2: Blocked Access**
   - **Given** a Viewer's access is revoked
   - **When** they try to access the platform
   - **Then** they see an error message

## Tasks / Subtasks

- [x] **Task 1: Backend Revoke Endpoint** (AC: 1, 2)
  - [x] DELETE /team/members/:id - deactivate user
  - [x] Invalidate all user sessions

- [x] **Task 2: Frontend UI** (AC: 1)
  - [x] Add revoke button on TeamPage
  - [x] Confirmation dialog

- [x] **Task 3: Reactivate Feature** (bonus)
  - [x] POST /team/members/:id/reactivate - restore access
  - [x] UI to show inactive members and restore button

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

Implemented full access revocation flow:
- DELETE /team/members/:id sets isActive=false and deletes all sessions
- Protections: cannot revoke self, cannot revoke another admin
- Frontend shows "Révoquer" button for each viewer (admin only)
- Confirmation dialog before revocation
- Inactive members section shows revoked users with "Restaurer l'accès" button
- POST /team/members/:id/reactivate restores access

### File List

- apps/api/src/routes/team.ts (revoke and reactivate endpoints)
- apps/web/src/features/team/TeamPage.tsx (revoke UI, inactive members section)
