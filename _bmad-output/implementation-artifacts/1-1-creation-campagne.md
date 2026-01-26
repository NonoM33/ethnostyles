# Story 1.1: Création de Campagne

Status: done

## Story

As an admin,
I want to create a new campaign with name and description,
So that I can start collecting respondent profiles.

## Acceptance Criteria

1. **AC1: Create Campaign**
   - **Given** I am logged in as Admin
   - **When** I click "New Campaign" and fill in name and description
   - **Then** a new campaign is created with status "draft"
   - **And** I am redirected to the campaign settings page

2. **AC2: Validation**
   - **Given** I try to create a campaign without a name
   - **When** I submit the form
   - **Then** I see a validation error "Name is required"

3. **AC3: Campaign List**
   - **Given** a campaign is created
   - **When** I view the campaign list
   - **Then** the new campaign appears with creation date

## Tasks / Subtasks

- [x] **Task 1: Database Schema** (AC: 1, 3)
  - [x] Create campaigns table (id, tenantId, name, description, status, slug, createdAt, updatedAt)
  - [x] Add campaign status enum (draft, active, archived)
  - [x] Run migration

- [x] **Task 2: Backend API** (AC: 1, 2, 3)
  - [x] POST /campaigns - create new campaign
  - [x] GET /campaigns - list campaigns for tenant
  - [x] GET /campaigns/:id - get single campaign
  - [x] PATCH /campaigns/:id - update campaign
  - [x] POST /campaigns/:id/activate - activate campaign
  - [x] POST /campaigns/:id/archive - archive campaign

- [x] **Task 3: Frontend UI** (AC: 1, 2, 3)
  - [x] Create CampaignsPage with list
  - [x] Create NewCampaignModal
  - [x] Add navigation link to campaigns

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

Implemented full campaign management:
- Database: campaigns table with status enum (draft/active/archived), slug, branding fields
- Backend: CRUD endpoints + activate/archive actions with role-based authorization
- Frontend: CampaignsPage with list, create modal, status badges, action buttons
- Viewers can see campaigns but cannot create/modify them

### File List

- packages/db/src/schema/campaigns.ts (new)
- packages/db/src/schema/index.ts (updated)
- apps/api/src/routes/campaigns.ts (new)
- apps/api/src/index.ts (updated)
- apps/web/src/features/campaigns/CampaignsPage.tsx (new)
- apps/web/src/components/DashboardLayout.tsx (updated)
- apps/web/src/App.tsx (updated)
