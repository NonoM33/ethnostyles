# Story 3.2: Affichage du Mythe Principal

Status: done

## Story

As a respondent,
I want to see my main "Mythe" profile,
So that I can understand my cultural archetype.

## Acceptance Criteria

1. **AC1: Mythe Display**
   - **Given** my profile is calculated
   - **When** I view the results page
   - **Then** I see my primary Mythe prominently displayed
   - **And** the Mythe has a distinctive visual identity (icon/color)

2. **AC2: Presentation**
   - **Given** I am viewing my Mythe
   - **When** I look at the presentation
   - **Then** I see the Mythe name in large text
   - **And** a brief tagline/summary

3. **AC3: Secondary Mythes**
   - **Given** my profile includes secondary Mythes
   - **When** I view the results
   - **Then** I see my top 3 Mythes ranked

## Tasks / Subtasks

- [x] **Task 1: Results Page UI** (AC: 1, 2, 3)
  - [x] Large Mythe name with emoji icon
  - [x] Colored header with campaign branding
  - [x] Tagline for each Mythe
  - [x] Score bars for top 4 Mythes

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

Implemented in QuestionnaireResultsPage:
- Large hero section with Mythe name and emoji
- Color-coded based on Mythe type
- Tagline for each Mythe archetype
- Animated score bars showing top 4 Mythes
- Campaign branding (logo, colors)

### File List

- apps/web/src/features/questionnaire/QuestionnaireResultsPage.tsx
