# Story 6.4: Demande Suppression Données RGPD (FR46)

Status: done

## Story

As a respondent,
I want to request deletion of my data,
So that I can exercise my RGPD rights.

## Acceptance Criteria

1. **AC1: Delete Link**
   - **Given** I have completed a questionnaire
   - **When** I access the results page
   - **Then** I see "Supprimer mes données" link

2. **AC2: Email Verification**
   - **Given** I click delete request
   - **When** the confirmation modal appears
   - **Then** I must confirm with my email

3. **AC3: Confirmation Email**
   - **Given** I submit the deletion request
   - **When** my email matches
   - **Then** I receive a confirmation email with a link

4. **AC4: Data Anonymization**
   - **Given** I confirm deletion via the email link
   - **When** the request is processed
   - **Then** my email is removed
   - **And** my Passeport is invalidated
   - **And** my response data is anonymized

5. **AC5: Final Confirmation**
   - **Given** deletion is complete
   - **When** I see the confirmation page
   - **Then** I receive a final email confirming deletion

## Tasks / Subtasks

- [x] **Task 1: API Endpoints** (AC: 2, 3, 4, 5)
  - [x] POST /q/respondent/:id/delete-request - sends verification email
  - [x] POST /q/delete-confirm - confirms deletion with token
  - [x] Token-based verification (24h expiry)
  - [x] Anonymize email and invalidate Passeport

- [x] **Task 2: Email Templates** (AC: 3, 5)
  - [x] Deletion request confirmation email with link
  - [x] Deletion complete confirmation email

- [x] **Task 3: Results Page UI** (AC: 1, 2)
  - [x] "Supprimer mes données" link at bottom
  - [x] Modal with email input and warning
  - [x] Success/error states

- [x] **Task 4: Delete Confirmation Page** (AC: 5)
  - [x] /delete-confirm?token=xxx route
  - [x] Loading, success, error states
  - [x] Summary of what was deleted

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

Implemented RGPD data deletion:
- Token-based email verification (24h expiry)
- In-memory token store (in production, use Redis)
- Anonymizes email to `deleted-{timestamp}@deleted.local`
- Invalidates Passeport by setting to null
- Keeps anonymized response data for statistics
- Two confirmation emails: request + completion
- Modal on results page with warnings
- Dedicated confirmation page

### File List

- apps/api/src/routes/questionnaire.ts (deletion endpoints)
- apps/web/src/features/questionnaire/QuestionnaireResultsPage.tsx (delete link + modal)
- apps/web/src/features/questionnaire/DeleteConfirmPage.tsx (new)
- apps/web/src/App.tsx (route)
