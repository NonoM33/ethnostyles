# Story 1.3: Génération Lien Unique

Status: done

## Story

As an admin,
I want to get a unique shareable link for my campaign,
So that I can distribute it to respondents.

## Acceptance Criteria

1. **AC1: Generate Link**
   - **Given** I have created a campaign
   - **When** I activate the campaign
   - **Then** a unique URL is generated (e.g., /q/{campaign_slug})
   - **And** the link is displayed with a copy button

2. **AC2: Copy Link**
   - **Given** I have an active campaign link
   - **When** I click "Copy Link"
   - **Then** the URL is copied to clipboard
   - **And** I see a confirmation toast

3. **AC3: Draft State**
   - **Given** the campaign is in draft status
   - **When** I view the campaign
   - **Then** no shareable link is available yet

## Tasks / Subtasks

- [x] **Task 1: Slug Generation** (AC: 1)
  - [x] Generate unique slug from campaign name
  - [x] Store slug in campaigns table (already done in 1.1)

- [x] **Task 2: Activate Endpoint** (AC: 1, 3)
  - [x] POST /campaigns/:id/activate
  - [x] Return public URL

- [x] **Task 3: Frontend** (AC: 1, 2, 3)
  - [x] Copy link button on CampaignsPage
  - [x] Copy link button on CampaignSettingsPage
  - [x] Show public URL on active campaigns

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

Implemented link generation:
- Unique slug generated from campaign name (with counter if collision)
- Activation endpoint sets status to 'active' and returns public URL
- Copy link button uses navigator.clipboard API
- Link shown in CampaignSettingsPage for active campaigns

### File List

- apps/api/src/routes/campaigns.ts (activate endpoint)
- apps/web/src/features/campaigns/CampaignsPage.tsx (copy link)
- apps/web/src/features/campaigns/CampaignSettingsPage.tsx (copy link, show URL)
