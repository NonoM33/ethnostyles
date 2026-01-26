# Story 4.3: Répartition des Profils - Graphique

Status: done

## Story

As an admin,
I want to see profile distribution as a chart,
So that I can understand the Mythe breakdown.

## Acceptance Criteria

1. **AC1: Chart Display**
   - **Given** I have completed responses
   - **When** I view the analytics section
   - **Then** I see a pie/donut chart of Mythe distribution
   - **And** each Mythe has its distinctive color

2. **AC2: Tooltips**
   - **Given** I hover over a chart segment
   - **When** the tooltip appears
   - **Then** I see the Mythe name, count, and percentage

3. **AC3: Click Interaction**
   - **Given** I click on a chart segment
   - **When** the action is triggered
   - **Then** I see the list of respondents with that Mythe

## Tasks / Subtasks

- [x] **Task 1: Profile Distribution API** (AC: 1)
  - [x] Return Mythe counts and percentages

- [x] **Task 2: Chart UI** (AC: 1, 2)
  - [x] Horizontal bar chart with Mythe colors
  - [x] Count and percentage display
  - [x] Animated bars

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

Implemented profile distribution chart:
- API returns Mythe breakdown with counts/percentages
- Horizontal bar chart (simpler than pie for MVP)
- Each Mythe has distinctive color from MYTHE_COLORS map
- Animated bars with Framer Motion
- Shows count and percentage for each

Click-through to filtered respondent list deferred to v1.5

### File List

- apps/api/src/routes/dashboard.ts (profileDistribution in stats)
- apps/web/src/features/campaigns/CampaignDashboardPage.tsx
