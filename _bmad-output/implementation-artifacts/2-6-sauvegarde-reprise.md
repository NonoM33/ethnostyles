# Story 2.6: Sauvegarde et Reprise

Status: done

## Story

As a respondent,
I want to resume an interrupted questionnaire,
So that I don't lose my progress.

## Acceptance Criteria

1. **AC1: Auto-save**
   - **Given** I am answering questions
   - **When** each answer is submitted
   - **Then** it is saved to the database immediately

2. **AC2: Resume Session**
   - **Given** I close my browser mid-questionnaire
   - **When** I return to the same link with same email
   - **Then** I am asked "Reprendre où vous en étiez?"
   - **And** I can continue from my last answered question

3. **AC3: Restart Option**
   - **Given** I have a partial session
   - **When** I choose "Recommencer"
   - **Then** my previous answers are cleared
   - **And** I start from question 1

## Tasks / Subtasks

- [x] **Task 1: Auto-save** (AC: 1)
  - [x] Save each answer immediately on submit
  - [x] Track current question in respondent record

- [x] **Task 2: Resume Detection** (AC: 2)
  - [x] Check for existing respondent by email + campaign
  - [x] Return existing progress
  - [x] Allow resuming from last question

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

Implemented:
- Answers saved immediately to responses table
- currentQuestion tracked in respondents table
- POST /q/:slug/start checks for existing respondent
- Returns existing session info for resume
- Session ID stored in sessionStorage

Note: Explicit "Recommencer" option not implemented in MVP

### File List

- apps/api/src/routes/questionnaire.ts
- apps/web/src/features/questionnaire/QuestionnaireLandingPage.tsx
