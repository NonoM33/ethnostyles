# Story 0.4: Connexion et Déconnexion

Status: review

## Story

As an admin,
I want to log in and log out,
So that I can securely access my account.

## Acceptance Criteria

1. **AC1: Login**
   - **Given** I have a registered account
   - **When** I enter correct email and password
   - **Then** I am logged in and redirected to dashboard
   - **And** a session is created

2. **AC2: Logout**
   - **Given** I am logged in
   - **When** I click logout
   - **Then** my session is invalidated
   - **And** I am redirected to login page

3. **AC3: Error Handling**
   - **Given** I enter wrong credentials
   - **When** I submit the form
   - **Then** I see an error message (without revealing which field is wrong)

## Tasks / Subtasks

- [x] **Task 1: Setup API Client** (AC: 1, 2)
  - [x] Install eden-treaty for type-safe API calls
  - [x] Create API client in apps/web/src/lib/api.ts
  - [x] Export App type from API for client

- [x] **Task 2: Create Auth Store** (AC: 1, 2)
  - [x] Create auth context/store for session management
  - [x] Implement login, logout, checkSession functions
  - [x] Store session token in localStorage

- [x] **Task 3: Create Login Page** (AC: 1, 3)
  - [x] Create LoginPage component with form
  - [x] Add form validation
  - [x] Handle login errors
  - [x] Redirect to dashboard on success

- [x] **Task 4: Create Dashboard Placeholder** (AC: 1, 2)
  - [x] Create basic dashboard page
  - [x] Add logout button
  - [x] Show current user info

- [x] **Task 5: Setup Routing** (AC: 1, 2)
  - [x] Configure protected routes
  - [x] Add auth redirect logic

## Dev Notes

### Eden Treaty Setup

```typescript
import { treaty } from '@elysiajs/eden'
import type { App } from '@etnostyles/api'

export const api = treaty<App>('http://localhost:3000')
```

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

**Frontend Authentication Completed:**

1. **API Client**: Eden Treaty setup for type-safe API calls
2. **Auth Context**: React context with login, logout, register, checkSession
3. **Login Page**: Form with validation and error handling
4. **Register Page**: Company + user registration form
5. **Dashboard**: Placeholder with user info and logout
6. **Routing**: Protected routes with auth redirects

**Validation Results:**
- TypeScript compile: ✅ Pass
- Routes configured: /, /login, /register, /dashboard

### File List

**Created:**
- `apps/web/src/lib/api.ts` - API client with eden-treaty
- `apps/web/src/lib/auth.tsx` - Auth context provider
- `apps/web/src/features/auth/LoginPage.tsx` - Login form
- `apps/web/src/features/auth/RegisterPage.tsx` - Registration form
- `apps/web/src/features/auth/index.ts` - Auth barrel export
- `apps/web/src/features/dashboard/DashboardPage.tsx` - Dashboard
- `apps/web/src/features/dashboard/index.ts` - Dashboard barrel export

**Modified:**
- `apps/web/src/App.tsx` - Routes and auth provider
- `apps/web/package.json` - Added eden-treaty
