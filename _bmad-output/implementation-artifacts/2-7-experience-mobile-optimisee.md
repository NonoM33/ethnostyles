# Story 2.7: Expérience Mobile Optimisée

Status: done

## Story

As a respondent,
I want to complete the questionnaire on my mobile,
So that I can answer anywhere.

## Acceptance Criteria

1. **AC1: Responsive UI**
   - **Given** I access the questionnaire on mobile
   - **When** the page loads
   - **Then** the UI is fully responsive
   - **And** touch targets are at least 44x44px

2. **AC2: Touch Gestures**
   - **Given** I am on mobile
   - **When** I swipe left/right
   - **Then** I can navigate between questions

3. **AC3: Compact Progress**
   - **Given** I am on mobile
   - **When** I view the progress
   - **Then** the progress bar is visible but compact

4. **AC4: No Horizontal Scroll**
   - **Given** screen width < 640px
   - **When** the questionnaire renders
   - **Then** all elements fit without horizontal scroll

## Tasks / Subtasks

- [x] **Task 1: Responsive Design** (AC: 1, 3, 4)
  - [x] Mobile-first CSS
  - [x] Large touch targets for answer buttons
  - [x] Compact header on mobile
  - [x] No horizontal overflow

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

Implemented responsive design:
- Mobile-first approach with Tailwind CSS
- Answer buttons are full-width with 16px padding (large touch targets)
- Progress bar is compact on all screen sizes
- All content fits within viewport width
- Landing page optimized for mobile

Note: Swipe gestures not implemented in MVP (tap-only)

### File List

- apps/web/src/features/questionnaire/QuestionnairePage.tsx
- apps/web/src/features/questionnaire/QuestionnaireLandingPage.tsx
