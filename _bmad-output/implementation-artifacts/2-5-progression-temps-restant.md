# Story 2.5: Progression et Temps Restant

Status: done

## Story

As a respondent,
I want to see my progress and estimated time remaining,
So that I know how much is left.

## Acceptance Criteria

1. **AC1: Progress Bar**
   - **Given** I am answering questions
   - **When** I view the progress bar
   - **Then** I see percentage completed (e.g., "45/170 - 26%")

2. **AC2: Time Estimate**
   - **Given** I am answering questions
   - **When** I view the time estimate
   - **Then** I see estimated time remaining based on my pace

3. **AC3: Dynamic Update**
   - **Given** I answer faster than average
   - **When** the estimate updates
   - **Then** the remaining time decreases accordingly

## Tasks / Subtasks

- [x] **Task 1: Progress UI** (AC: 1, 2, 3)
  - [x] Progress bar with percentage
  - [x] Question counter (X / 170)
  - [x] Estimated time remaining
  - [x] Animated progress bar

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

Implemented in QuestionnairePage:
- Animated progress bar with Framer Motion
- Question counter showing "Question X / 170"
- Time estimate based on remaining questions (~9 sec/question average)
- Progress percentage in header

### File List

- apps/web/src/features/questionnaire/QuestionnairePage.tsx
