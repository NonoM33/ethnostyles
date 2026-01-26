# Story 1.2: Personnalisation Branding Campagne

Status: done

## Story

As an admin,
I want to customize the branding of my campaign (logo, color),
So that respondents see my company identity.

## Acceptance Criteria

1. **AC1: Upload Logo**
   - **Given** I am on the campaign settings page
   - **When** I upload a logo (PNG/JPG, max 2MB)
   - **Then** the logo is saved and previewed

2. **AC2: Select Color**
   - **Given** I am on the campaign settings page
   - **When** I select a primary color
   - **Then** the color is saved
   - **And** a preview shows how the questionnaire will look

3. **AC3: Graceful Fallback**
   - **Given** I don't upload a logo
   - **When** the questionnaire loads
   - **Then** no logo is displayed (graceful fallback)

## Tasks / Subtasks

- [x] **Task 1: Database Fields** (AC: 1, 2)
  - [x] logoUrl field already in campaigns table
  - [x] primaryColor field already in campaigns table

- [x] **Task 2: Campaign Settings Page** (AC: 1, 2, 3)
  - [x] Create CampaignSettingsPage
  - [x] Add logo upload (file input with preview)
  - [x] Add color picker
  - [x] Live preview panel

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

Implemented CampaignSettingsPage with:
- Logo upload with file validation (PNG/JPG, max 2MB)
- Color picker with hex input
- Live preview panel showing how questionnaire will look
- Graceful fallback when no logo

Note: Logo is currently stored as data URL. In production, should upload to cloud storage (S3, Cloudflare R2, etc.)

### File List

- apps/web/src/features/campaigns/CampaignSettingsPage.tsx (new)
- apps/web/src/App.tsx (updated with route)
