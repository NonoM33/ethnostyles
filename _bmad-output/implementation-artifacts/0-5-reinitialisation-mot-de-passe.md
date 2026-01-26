# Story 0.5: Réinitialisation Mot de Passe

Status: review

## Story

As an admin,
I want to reset my password,
So that I can recover access to my account.

## Acceptance Criteria

1. **AC1: Request Reset**
   - **Given** I am on the login page
   - **When** I click "Forgot password" and enter my email
   - **Then** I receive an email with a reset link

2. **AC2: Reset Password**
   - **Given** I have a valid reset link
   - **When** I set a new password
   - **Then** my password is updated
   - **And** all existing sessions are invalidated
   - **And** I can log in with the new password

3. **AC3: Expired Link**
   - **Given** I have an expired reset link (>1h)
   - **When** I try to use it
   - **Then** I see an error and must request a new link

## Tasks / Subtasks

- [x] **Task 1: Create Reset Token Schema** (AC: 1, 3)
  - [x] Add password_reset_tokens table
  - [x] Generate migration (0002_perpetual_kitty_pryde.sql)

- [x] **Task 2: Create Backend Endpoints** (AC: 1, 2, 3)
  - [x] POST /auth/forgot-password - generates reset token
  - [x] POST /auth/reset-password - validates token and updates password
  - [x] Invalidate all sessions on password reset

- [x] **Task 3: Create Frontend Pages** (AC: 1, 2, 3)
  - [x] ForgotPasswordPage with email form
  - [x] ResetPasswordPage with new password form
  - [x] Add routes and "Forgot password" link on login

## Dev Notes

### Reset Token Flow

1. User requests reset → generate token (UUID), store hash, send email
2. Token valid for 1 hour
3. On reset: verify token, update password, delete token, invalidate sessions

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

**Password Reset Implemented:**

1. **Schema**: Added password_reset_tokens table with tokenHash, expiresAt, usedAt
2. **Forgot Password**: Generates token (1h expiry), logs to console in dev
3. **Reset Password**: Validates token, updates password, invalidates all sessions
4. **Frontend**: ForgotPasswordPage, ResetPasswordPage with proper UX

**Security Features:**
- Token hashed with bcrypt before storage
- 1 hour expiration
- Single-use tokens (marked as used)
- All sessions invalidated on password change
- No email enumeration (always returns success)

**Validation Results:**
- TypeScript compile: ✅ Pass

**Note:** In production, integrate with Resend to send actual emails.

### File List

**Created:**
- `packages/db/drizzle/0002_perpetual_kitty_pryde.sql` - Migration
- `apps/web/src/features/auth/ForgotPasswordPage.tsx`
- `apps/web/src/features/auth/ResetPasswordPage.tsx`

**Modified:**
- `packages/db/src/schema/auth.ts` - Added passwordResetTokens table
- `packages/db/src/schema/index.ts` - Export passwordResetTokens
- `apps/api/src/routes/auth.ts` - Added forgot-password, reset-password endpoints
- `apps/web/src/App.tsx` - Added routes
- `apps/web/src/features/auth/index.ts` - Export new pages
- `apps/web/src/features/auth/LoginPage.tsx` - Added forgot password link
