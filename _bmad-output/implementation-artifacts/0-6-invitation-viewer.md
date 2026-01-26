# Story 0.6: Invitation Viewer

Status: review

## Story

As an admin,
I want to invite a Viewer to my account,
So that they can view dashboards.

## Acceptance Criteria

1. **AC1: Send Invitation**
   - **Given** I am logged in as Admin
   - **When** I invite a user with email
   - **Then** they receive an invitation email
   - **And** a pending invitation is visible in my team list

2. **AC2: Accept Invitation**
   - **Given** I am an invited Viewer
   - **When** I click the invitation link
   - **Then** I can set my password
   - **And** I am added to the tenant with Viewer role

## Tasks / Subtasks

- [x] **Task 1: Create Invitation Schema** (AC: 1)
  - [x] Add invitations table
  - [x] Generate migration (0003_petite_luminals.sql)

- [x] **Task 2: Create Backend Endpoints** (AC: 1, 2)
  - [x] POST /team/invite - creates invitation (admin only)
  - [x] GET /team - list team members and pending invitations
  - [x] DELETE /team/invite/:id - cancel invitation
  - [x] POST /auth/accept-invitation - accept and set password

- [x] **Task 3: Create Frontend Pages** (AC: 1, 2)
  - [x] TeamPage with invite form and member list
  - [x] AcceptInvitationPage for new viewers
  - [x] DashboardLayout with navigation

## Dev Notes

### Invitation Flow

1. Admin enters email → invitation created with token
2. Email sent with link containing token
3. Viewer clicks link → AcceptInvitationPage
4. Viewer sets password → user created with viewer role

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

**Viewer Invitation Implemented:**

1. **Schema**: Added invitations table with token, expiry, tenant FK
2. **Team API**: GET /team, POST /team/invite, DELETE /team/invite/:id
3. **Accept Invitation**: POST /auth/accept-invitation creates viewer account
4. **Frontend**: TeamPage (invite form, member list), AcceptInvitationPage
5. **Navigation**: DashboardLayout with Dashboard/Équipe tabs

**Features:**
- Admin-only invitation (viewers cannot invite)
- 7-day token expiry
- Cancel pending invitations
- Token logged in dev mode

**Validation Results:**
- TypeScript compile: ✅ Pass

### File List

**Created:**
- `packages/db/drizzle/0003_petite_luminals.sql`
- `apps/api/src/routes/team.ts`
- `apps/web/src/components/DashboardLayout.tsx`
- `apps/web/src/features/team/TeamPage.tsx`
- `apps/web/src/features/team/index.ts`
- `apps/web/src/features/auth/AcceptInvitationPage.tsx`

**Modified:**
- `packages/db/src/schema/auth.ts` - Added invitations table
- `packages/db/src/schema/index.ts` - Export invitations
- `apps/api/src/routes/auth.ts` - Added accept-invitation endpoint
- `apps/api/src/index.ts` - Added team routes
- `apps/web/src/App.tsx` - Added routes
- `apps/web/src/features/auth/index.ts` - Export AcceptInvitationPage
- `apps/web/src/features/dashboard/DashboardPage.tsx` - Use DashboardLayout
