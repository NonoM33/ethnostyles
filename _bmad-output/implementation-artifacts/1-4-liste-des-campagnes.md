# Story 1.4: Liste des Campagnes

Status: done

## Story

As an admin,
I want to see a list of all my campaigns,
So that I can manage them efficiently.

## Acceptance Criteria

1. **AC1: View List**
   - **Given** I am logged in as Admin
   - **When** I access the campaigns page
   - **Then** I see all my campaigns with:
     - Name
     - Status (draft, active, archived)
     - Response count (future)
     - Creation date

2. **AC2: Sorting**
   - **Given** I have many campaigns
   - **When** I view the list
   - **Then** campaigns are sorted by last activity (most recent first)

3. **AC3: Visual Distinction**
   - **Given** I have both active and archived campaigns
   - **When** I view the list
   - **Then** archived campaigns are visually distinct (grayed out)

## Tasks / Subtasks

- [x] **Task 1: Backend** (AC: 1, 2)
  - [x] GET /campaigns returns all tenant campaigns
  - [x] Sort by createdAt (descending)

- [x] **Task 2: Frontend** (AC: 1, 2, 3)
  - [x] CampaignsPage with campaign list
  - [x] Status badges (draft, active, archived)
  - [x] Separate sections for active/archived
  - [x] Visual styling for archived campaigns

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

Implemented in Story 1.1:
- CampaignsPage displays all campaigns
- Status badges with appropriate colors
- Separate sections for active and archived campaigns
- Archived campaigns shown in grayed-out section
- Links to campaign settings page

### File List

- apps/web/src/features/campaigns/CampaignsPage.tsx
- apps/api/src/routes/campaigns.ts (GET /)
