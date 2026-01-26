# Story 6.5: Export Données Personnelles RGPD (FR47)

Status: done

## Story

As a respondent,
I want to export my personal data,
So that I can exercise my RGPD portability rights.

## Acceptance Criteria

1. **AC1: Export Link**
   - **Given** I am on my results page
   - **When** I click "Exporter mes données"
   - **Then** I see an export modal

2. **AC2: Email Verification**
   - **Given** I am in the export modal
   - **When** I enter my email
   - **Then** I must verify my email to receive the download link

3. **AC3: Download Email**
   - **Given** I verify my email
   - **When** the request is processed
   - **Then** I receive an email with a download link

4. **AC4: JSON Export Content**
   - **Given** I click the download link
   - **When** the file downloads
   - **Then** I receive a JSON file containing:
     - My profile data (Mythe, scores)
     - My answers (question numbers, values, timestamps)
     - My Passeport code
     - Consent information
     - All timestamps

## Tasks / Subtasks

- [x] **Task 1: API Endpoints** (AC: 2, 3, 4)
  - [x] POST /q/respondent/:id/export-request - sends download link email
  - [x] GET /q/export-download?token=xxx - returns JSON file
  - [x] Token-based verification (24h expiry, single use)
  - [x] Content-Disposition header for file download

- [x] **Task 2: Email Template** (AC: 3)
  - [x] Export link email with download button

- [x] **Task 3: Results Page UI** (AC: 1, 2)
  - [x] "Exporter mes données" link next to delete
  - [x] Modal with email input and content preview
  - [x] Success/error states

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

Implemented RGPD data export:
- Token-based email verification (24h expiry, single use)
- In-memory token store (in production, use Redis)
- JSON export includes: profile, personal data, questionnaire info, all responses
- Direct download from API (no intermediate page needed)
- Content-Disposition header triggers browser download
- Audit log on export

### File List

- apps/api/src/routes/questionnaire.ts (export endpoints)
- apps/web/src/features/questionnaire/QuestionnaireResultsPage.tsx (export link + modal)
