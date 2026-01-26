# Story 4.1: Vue d'Ensemble Dashboard

Status: done

## Story

As an admin,
I want to see response count and completion rate per campaign,
So that I can track campaign performance.

## Acceptance Criteria

1. **AC1: Campaign Dashboard**
   - **Given** I am logged in as Admin
   - **When** I access a campaign dashboard
   - **Then** I see:
     - Total responses count
     - Completion rate (%)
     - Abandonment rate (%)
   - **And** the page loads in < 3 sec (NFR-P4)

2. **AC2: Overview**
   - **Given** I have multiple campaigns
   - **When** I view the main dashboard
   - **Then** I see a summary card for each active campaign

3. **AC3: Empty State**
   - **Given** no responses yet
   - **When** I view the dashboard
   - **Then** I see "Aucune réponse" with helpful tips

## Tasks / Subtasks

- [x] **Task 1: Backend API** (AC: 1, 2)
  - [x] GET /dashboard/overview - all campaigns stats
  - [x] GET /dashboard/campaigns/:id/stats - single campaign stats

- [x] **Task 2: Frontend** (AC: 1, 2, 3)
  - [x] Updated DashboardPage with real data
  - [x] CampaignDashboardPage for detailed view
  - [x] Stats cards with counts and rates
  - [x] Empty state handling

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

Implemented dashboard with:
- Overview endpoint returns all campaigns with response counts
- Stats cards: total responses, completed, completion rate
- Campaign list with click-through to detail dashboard
- Date filtering support
- Empty state with CTA to create campaign

### File List

- apps/api/src/routes/dashboard.ts (new)
- apps/web/src/features/dashboard/DashboardPage.tsx (updated)
- apps/web/src/features/campaigns/CampaignDashboardPage.tsx (new)
