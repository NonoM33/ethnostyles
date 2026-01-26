# Story 5.4: Réutilisation Passeport Cross-Campagne

Status: done

## Story

As a respondent,
I want to use my Passeport on different campaigns,
So that my profile follows me across organizations.

## Acceptance Criteria

1. **AC1: Cross-Campaign Usage**
   - **Given** I have a valid Passeport from Campaign A
   - **When** I use it on Campaign B (different tenant)
   - **Then** my profile is retrieved
   - **And** a new response is created for Campaign B
   - **And** both tenants see my profile

2. **AC2: Privacy Protection**
   - **Given** I use my Passeport on a new campaign
   - **When** the profile is applied
   - **Then** the new campaign owner sees my Mythe
   - **And** my original raw answers are NOT shared (privacy)

3. **AC3: Multiple Campaigns**
   - **Given** I have used my Passeport on 3 campaigns
   - **When** I view my results
   - **Then** each campaign has its own response record

## Tasks / Subtasks

- [x] **Task 1: Cross-Campaign Passeport** (AC: 1, 2, 3)
  - Already implemented in Story 5-2
  - POST /q/:slug/passeport searches all respondents regardless of campaign
  - Creates new respondent with profile data (Mythe, scores) but not raw answers
  - Each campaign gets its own response record

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

Cross-campaign Passeport functionality was implemented as part of Story 5-2:
- The Passeport lookup searches across ALL respondents (any campaign, any tenant)
- Creates a new respondent for the current campaign
- Copies: passeportCode, primaryMythe, profileData (aggregated scores)
- Does NOT copy: individual question responses (privacy)
- Each campaign has its own response record linked by Passeport

### File List

- apps/api/src/routes/questionnaire.ts (passeport endpoint - implemented in 5-2)
