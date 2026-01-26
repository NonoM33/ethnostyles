# Story 1.5: Archivage de Campagne

Status: done

## Story

As an admin,
I want to archive a campaign,
So that it no longer accepts responses but data is preserved.

## Acceptance Criteria

1. **AC1: Archive Action**
   - **Given** I have an active campaign
   - **When** I click "Archive"
   - **Then** a confirmation dialog appears

2. **AC2: Archive Effect**
   - **Given** I confirm archiving
   - **When** the action completes
   - **Then** the campaign status changes to "archived"
   - **And** the public link returns "Campaign closed" message
   - **And** existing responses are preserved

3. **AC3: View Archived**
   - **Given** I have an archived campaign
   - **When** I view it
   - **Then** I can still see all historical data
   - **And** I cannot edit the campaign settings

## Tasks / Subtasks

- [x] **Task 1: Backend** (AC: 1, 2)
  - [x] POST /campaigns/:id/archive
  - [x] Update status to 'archived'
  - [x] Prevent modification of archived campaigns (PATCH returns error)

- [x] **Task 2: Frontend** (AC: 1, 2, 3)
  - [x] Archive button with confirmation dialog
  - [x] Visual indication of archived status
  - [x] Read-only mode in settings page for archived campaigns

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

Implemented archiving:
- Archive endpoint sets status to 'archived'
- Confirmation dialog before archiving
- Archived campaigns shown separately in list
- CampaignSettingsPage shows read-only mode for archived campaigns
- PATCH endpoint rejects modifications to archived campaigns

### File List

- apps/api/src/routes/campaigns.ts (archive endpoint, PATCH protection)
- apps/web/src/features/campaigns/CampaignsPage.tsx (archive button, confirmation)
- apps/web/src/features/campaigns/CampaignSettingsPage.tsx (read-only mode)
