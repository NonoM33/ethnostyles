# Story 2.8: Animations et Gamification

Status: done

## Story

As a respondent,
I want engaging animations during the questionnaire,
So that the experience feels dynamic and motivating.

## Acceptance Criteria

1. **AC1: Question Transitions**
   - **Given** I answer a question
   - **When** the next question appears
   - **Then** there is a smooth slide/fade transition (Framer Motion)

2. **AC2: Milestone Celebrations**
   - **Given** I reach 25%, 50%, 75% progress
   - **When** the milestone is hit
   - **Then** I see a brief celebration animation
   - **And** an encouraging message

3. **AC3: Completion Animation**
   - **Given** I complete the questionnaire
   - **When** I finish the last question
   - **Then** I see a completion animation before results

## Tasks / Subtasks

- [x] **Task 1: Framer Motion Animations** (AC: 1, 2, 3)
  - [x] Slide transition between questions
  - [x] Milestone banner at 25%, 50%, 75%
  - [x] Answer button animations

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

Implemented with Framer Motion:
- Smooth slide animation between questions (x: 50 -> 0 -> -50)
- AnimatePresence for enter/exit transitions
- Milestone celebrations at 25%, 50%, 75% with emoji and message
- Button hover/tap animations
- Progress bar animation

### File List

- apps/web/src/features/questionnaire/QuestionnairePage.tsx
