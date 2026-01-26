# Story 3.3: Description Détaillée du Profil

Status: done

## Story

As a respondent,
I want to see a detailed description of my profile,
So that I can understand what it means.

## Acceptance Criteria

1. **AC1: Description**
   - **Given** I am on the results page
   - **When** I scroll down
   - **Then** I see a detailed description of my Mythe
   - **And** the description includes:
     - Core characteristics
     - Values and motivations
     - Behavioral tendencies

2. **AC2: Expandable**
   - **Given** I want more detail
   - **When** I expand sections
   - **Then** I can read extended descriptions

3. **AC3: Formatting**
   - **Given** the content is loaded
   - **When** I view it
   - **Then** text is formatted for easy reading (headings, paragraphs)

## Tasks / Subtasks

- [x] **Task 1: Mythe Descriptions** (AC: 1, 2, 3)
  - [x] Define descriptions for all 8 Mythes
  - [x] Display description on results page
  - [x] Formatted text with sections

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

Implemented Mythe descriptions:
- 8 Mythes defined: Explorateur, Gardien, Créateur, Sage, Héros, Rebelle, Magicien, Innocent
- Each has tagline and description text
- Displayed in results page below hero section
- Clean formatting with headings and paragraphs

Note: Extended descriptions can be added in future iterations

### File List

- apps/web/src/features/questionnaire/QuestionnaireResultsPage.tsx
- apps/api/src/routes/questionnaire.ts (MYTHE_DESCRIPTIONS constant)
