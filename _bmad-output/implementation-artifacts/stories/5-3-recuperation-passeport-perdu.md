# Story 5.3: Récupération Passeport Perdu

Status: done

## Story

As a respondent,
I want to recover my lost Passeport via email,
So that I can retrieve my profile.

## Acceptance Criteria

1. **AC1: Recovery Link**
   - **Given** I am on a campaign landing page
   - **When** I click "Passeport perdu?"
   - **Then** I can enter my email address

2. **AC2: Email with Passeport**
   - **Given** I enter an email with a Passeport
   - **When** I submit
   - **Then** an email is sent with my Passeport code
   - **And** I see "Un email vous a été envoyé"

3. **AC3: No Enumeration**
   - **Given** I enter an email without a Passeport
   - **When** I submit
   - **Then** I see the same message (no email enumeration)
   - **And** no email is sent

## Tasks / Subtasks

- [x] **Task 1: Recovery API** (AC: 2, 3)
  - [x] POST /q/passeport/recover endpoint
  - [x] Find respondent by email
  - [x] Send recovery email with Passeport code
  - [x] Same response for existing/non-existing emails (security)

- [x] **Task 2: UI Modal** (AC: 1)
  - [x] "Passeport perdu?" link below Passeport form
  - [x] Recovery modal with email input
  - [x] Success state after submission

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

Implemented Passeport recovery:
- API endpoint POST /q/passeport/recover
- Sends HTML email with Passeport code and Mythe
- Always returns same success message (prevents email enumeration)
- Modal UI with email input
- Success feedback on submission

### File List

- apps/api/src/routes/questionnaire.ts (recovery endpoint)
- apps/web/src/features/questionnaire/QuestionnaireLandingPage.tsx (recovery modal)
