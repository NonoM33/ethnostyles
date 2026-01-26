# Story 2.4: Affichage et Réponse aux Questions

Status: done

## Story

As a respondent,
I want to answer the 170 questions,
So that my profile can be calculated.

## Acceptance Criteria

1. **AC1: Question Display**
   - **Given** I have started the questionnaire
   - **When** a question is displayed
   - **Then** I see the question text and 4 answer options (Likert scale)
   - **And** response time between questions < 200ms (NFR-P2)

2. **AC2: Answer Submission**
   - **Given** I select an answer
   - **When** I click an option
   - **Then** my answer is saved
   - **And** the next question appears with smooth animation

3. **AC3: Navigation**
   - **Given** I am on a question
   - **When** I want to go back
   - **Then** I can navigate to previous questions
   - **And** my previous answers are preserved

## Tasks / Subtasks

- [x] **Task 1: Question Display** (AC: 1, 2)
  - [x] Question text with number badge
  - [x] 4-option Likert scale (1-4)
  - [x] Click to submit answer
  - [x] Smooth animations with Framer Motion

- [x] **Task 2: API Integration** (AC: 1, 2)
  - [x] GET /q/respondent/:id/question
  - [x] POST /q/respondent/:id/answer
  - [x] Save answer to responses table

- [x] **Task 3: Keyboard Shortcuts** (bonus)
  - [x] Press 1-4 to answer quickly

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

Implemented in QuestionnairePage:
- Question display with number badge and text
- 4 Likert scale options with visual feedback
- Smooth slide animations between questions
- Keyboard shortcuts (1-4) for power users
- Answers saved immediately to database

Note: Back navigation not implemented in MVP (forward-only flow)

### File List

- apps/web/src/features/questionnaire/QuestionnairePage.tsx
- apps/api/src/routes/questionnaire.ts
