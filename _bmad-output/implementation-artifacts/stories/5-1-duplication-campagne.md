# Story 5.1: Duplication de Campagne

Status: done

## Story

As an admin,
I want to duplicate an existing campaign,
So that I can quickly create similar campaigns.

## Acceptance Criteria

1. **AC1: Duplicate Campaign**
   - **Given** I have an existing campaign
   - **When** I click "Dupliquer"
   - **Then** a new campaign is created with:
     - Same name + " (copie)"
     - Same description
     - Same branding (logo, color)
     - Status "draft"

2. **AC2: No Response Copy**
   - **Given** I duplicate a campaign
   - **When** the copy is created
   - **Then** no responses are copied
   - **And** a new unique link is generated when activated

3. **AC3: Independent Editing**
   - **Given** I duplicate a campaign
   - **When** I view the copy
   - **Then** I can edit all settings independently

## Tasks / Subtasks

- [x] **Task 1: Duplicate API** (AC: 1, 2)
  - [x] POST /campaigns/:id/duplicate endpoint
  - [x] Copy name + " (copie)", description, branding
  - [x] Generate unique slug
  - [x] Set status to "draft"
  - [x] No response copying

- [x] **Task 2: UI Button** (AC: 1, 3)
  - [x] "Dupliquer" button on active campaigns
  - [x] "Dupliquer" button on archived campaigns
  - [x] Admin-only visibility

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

Implemented campaign duplication:
- API endpoint POST /campaigns/:id/duplicate
- Copies: name + " (copie)", description, logoUrl, primaryColor
- Generates new unique slug
- Sets status to "draft"
- No responses copied (new campaign is clean)
- Button available on both active and archived campaigns
- Admin-only permission

### File List

- apps/api/src/routes/campaigns.ts (duplicate endpoint)
- apps/web/src/features/campaigns/CampaignsPage.tsx (Dupliquer button)
