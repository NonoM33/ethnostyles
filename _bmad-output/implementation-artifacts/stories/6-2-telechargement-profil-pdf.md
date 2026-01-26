# Story 6.2: Téléchargement Profil en PDF

Status: done

## Story

As a respondent,
I want to download my profile as PDF,
So that I can keep a professional document.

## Acceptance Criteria

1. **AC1: Download Button**
   - **Given** I am on my results page
   - **When** I click "Télécharger PDF"
   - **Then** a PDF is generated and downloaded

2. **AC2: PDF Content**
   - **Given** the PDF is generated
   - **When** I open it
   - **Then** it contains:
     - My Mythe with visual identity
     - Full profile description
     - Campaign branding
     - My Passeport code
     - Generation date

3. **AC3: Loading State**
   - **Given** PDF generation takes time
   - **When** I click download
   - **Then** I see a loading indicator
   - **And** the file downloads when ready

## Tasks / Subtasks

- [x] **Task 1: PDF Libraries** (AC: 1, 3)
  - [x] Install jspdf and html2canvas
  - [x] Client-side PDF generation

- [x] **Task 2: PDF Download** (AC: 1, 2, 3)
  - [x] "Télécharger PDF" button on results page
  - [x] Capture content with html2canvas
  - [x] Generate PDF with jspdf
  - [x] Loading state during generation
  - [x] Footer with generation date

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

Implemented PDF download:
- Uses jspdf + html2canvas for client-side generation
- Captures the results card as image
- Generates A4 PDF with centered content
- Adds footer with generation date
- Loading state on button during generation
- Filename: profil-ethnostyles-[mythe].pdf

### File List

- apps/web/package.json (dependencies: jspdf, html2canvas)
- apps/web/src/features/questionnaire/QuestionnaireResultsPage.tsx
