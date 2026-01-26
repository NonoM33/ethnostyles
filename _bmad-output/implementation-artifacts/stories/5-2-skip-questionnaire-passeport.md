# Story 5.2: Skip Questionnaire avec Passeport

Status: done

## Story

As a respondent,
I want to enter my Passeport code to skip the questionnaire,
So that I don't have to answer 170 questions again.

## Acceptance Criteria

1. **AC1: Passeport Option**
   - **Given** I am on a campaign landing page
   - **When** I see the option "J'ai déjà un Passeport"
   - **Then** I can enter my existing Passeport code

2. **AC2: Valid Passeport**
   - **Given** I enter a valid Passeport code
   - **When** the code is verified
   - **Then** my existing profile is retrieved
   - **And** I skip directly to the results page
   - **And** my response is linked to this campaign

3. **AC3: Invalid Passeport**
   - **Given** I enter an invalid Passeport code
   - **When** I submit
   - **Then** I see "Code Passeport invalide"
   - **And** I can try again or start the questionnaire

## Tasks / Subtasks

- [x] **Task 1: Passeport API** (AC: 2, 3)
  - [x] POST /q/:slug/passeport endpoint
  - [x] Verify Passeport code exists and is completed
  - [x] Create new respondent linked to campaign with existing profile
  - [x] Return error for invalid codes

- [x] **Task 2: Landing Page UI** (AC: 1)
  - [x] Mode toggle: "Nouveau" vs "J'ai un Passeport"
  - [x] Passeport code input field (XXXX-XXXX-XXXX format)
  - [x] Auto-uppercase and format handling
  - [x] Redirect to results on success

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

Implemented Passeport skip feature:
- API endpoint POST /q/:slug/passeport verifies code and creates respondent
- Landing page has toggle between "Nouveau" and "J'ai un Passeport"
- Passeport input auto-formats (uppercase, adds dashes)
- On valid code: creates new respondent with existing profile, redirects to results
- On invalid code: shows error message
- Same email/consent flow for RGPD compliance

### File List

- apps/api/src/routes/questionnaire.ts (passeport endpoint)
- apps/web/src/features/questionnaire/QuestionnaireLandingPage.tsx (mode toggle + form)
