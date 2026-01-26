# Story 2.3: Saisie Email Répondant

Status: done

## Story

As a respondent,
I want to enter my email before starting,
So that I can receive my results and Passeport.

## Acceptance Criteria

1. **AC1: Email Required**
   - **Given** I have consented to the privacy policy
   - **When** I am prompted for email
   - **Then** I must enter a valid email address

2. **AC2: Validation**
   - **Given** I enter an invalid email format
   - **When** I try to continue
   - **Then** I see a validation error

3. **AC3: Create Respondent**
   - **Given** I enter a valid email
   - **When** I continue
   - **Then** a respondent record is created
   - **And** I proceed to the first question

## Tasks / Subtasks

- [x] **Task 1: Email Input** (AC: 1, 2, 3)
  - [x] Email field in landing page
  - [x] HTML5 email validation
  - [x] API validation
  - [x] Create respondent on submit

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

Implemented in QuestionnaireLandingPage:
- Email input with HTML5 validation (type="email", required)
- API validates email format using Elysia schema
- POST /q/:slug/start creates respondent with email
- Existing respondent check for resume functionality

### File List

- apps/web/src/features/questionnaire/QuestionnaireLandingPage.tsx
- apps/api/src/routes/questionnaire.ts
