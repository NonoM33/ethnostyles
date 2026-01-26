# Story 3.6: Envoi Code Passeport par Email

Status: done

## Story

As a respondent,
I want to receive my Passeport code by email,
So that I can keep it safe and reuse it later.

## Acceptance Criteria

1. **AC1: Included in Email**
   - **Given** my Passeport is generated
   - **When** the results email is sent
   - **Then** the Passeport code is included in the email
   - **And** instructions explain how to use it

2. **AC2: Easy to Copy**
   - **Given** I receive the email
   - **When** I view the Passeport section
   - **Then** the code is easy to copy
   - **And** I understand it's my unique identifier

3. **AC3: Instructions**
   - **Given** I have the Passeport code
   - **When** I read the instructions
   - **Then** I know I can use it on future campaigns (v1.5)

## Tasks / Subtasks

- [x] **Task 1: Email Template** (AC: 1, 2, 3)
  - [x] Passeport section in results email
  - [x] Clear formatting for code
  - [x] Usage instructions

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

Implemented in results email template:
- Dedicated "Votre Code Passeport" section
- Large monospace font for easy reading
- Dashed border box for visual distinction
- Instructions about keeping the code
- Note about using on other campaigns

### File List

- packages/email/src/templates/results.ts
