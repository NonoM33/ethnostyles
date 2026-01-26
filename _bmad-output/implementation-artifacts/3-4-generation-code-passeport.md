# Story 3.4: Génération du Code Passeport

Status: done

## Story

As a respondent,
I want a unique Passeport code generated,
So that I have a permanent identifier for my profile.

## Acceptance Criteria

1. **AC1: Generation**
   - **Given** my profile is calculated
   - **When** the calculation completes
   - **Then** a unique Passeport code is generated (format: XXXX-XXXX-XXXX)
   - **And** the code is stored with my respondent record

2. **AC2: Display**
   - **Given** the Passeport code exists
   - **When** I view my results
   - **Then** I see my Passeport code displayed prominently
   - **And** I can copy it with one click

3. **AC3: Uniqueness**
   - **Given** a Passeport code is generated
   - **When** checked against existing codes
   - **Then** it is guaranteed unique (no collisions)

## Tasks / Subtasks

- [x] **Task 1: Code Generation** (AC: 1, 3)
  - [x] Generate XXXX-XXXX-XXXX format
  - [x] Use unambiguous characters (no 0/O, 1/I)
  - [x] Check for uniqueness with retry

- [x] **Task 2: Display** (AC: 2)
  - [x] Show code prominently on results page
  - [x] Copy to clipboard button

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

Implemented Passeport generation:
- Format: XXXX-XXXX-XXXX (12 alphanumeric + 2 dashes)
- Characters: ABCDEFGHJKLMNPQRSTUVWXYZ23456789 (no confusing chars)
- Uniqueness check with up to 10 retries
- Stored in respondent.passeportCode
- Displayed on results page with copy button

### File List

- apps/api/src/routes/questionnaire.ts (generatePasseportCode function)
- apps/web/src/features/questionnaire/QuestionnaireResultsPage.tsx
