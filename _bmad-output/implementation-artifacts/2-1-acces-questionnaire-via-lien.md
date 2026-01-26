# Story 2.1: Accès au Questionnaire via Lien

Status: done

## Story

As a respondent,
I want to access the questionnaire via a shared link,
So that I can start answering questions.

## Acceptance Criteria

1. **AC1: Valid Link**
   - **Given** I have a valid campaign link
   - **When** I open the link in my browser
   - **Then** I see the campaign landing page with branding
   - **And** the page loads in < 2 sec (NFR-P1)

2. **AC2: Archived Campaign**
   - **Given** the campaign is archived
   - **When** I access the link
   - **Then** I see "Cette campagne est terminée" message

3. **AC3: Invalid Link**
   - **Given** an invalid campaign link
   - **When** I access it
   - **Then** I see a 404 page with helpful message

## Tasks / Subtasks

- [x] **Task 1: Database Schema** (AC: 1)
  - [x] Create respondents table
  - [x] Create responses table (answers)
  - [x] Create questions table (or seed data)

- [x] **Task 2: Public Route** (AC: 1, 2, 3)
  - [x] GET /q/:slug - public campaign access
  - [x] Return campaign data with branding

- [x] **Task 3: Frontend** (AC: 1, 2, 3)
  - [x] Create public questionnaire route
  - [x] QuestionnaireLandingPage component
  - [x] Handle archived/invalid states

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

Implemented full questionnaire access:
- Database: respondents, responses, questions tables
- API: GET /q/:slug returns campaign data with branding
- Frontend: Landing page shows campaign info, handles archived/invalid states
- 404 page for invalid links, "terminée" message for archived campaigns

### File List

- packages/db/src/schema/questionnaire.ts (new)
- apps/api/src/routes/questionnaire.ts (new)
- apps/web/src/features/questionnaire/QuestionnaireLandingPage.tsx (new)
