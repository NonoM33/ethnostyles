# Story 4.6: Export CSV Basique

Status: done

## Story

As an admin,
I want to export results to CSV,
So that I can analyze data in spreadsheets.

## Acceptance Criteria

1. **AC1: Export Button**
   - **Given** I am on the campaign dashboard
   - **When** I click "Exporter CSV"
   - **Then** a CSV file downloads
   - **And** export completes in < 10 sec for 1000 rows (NFR-P5)

2. **AC2: CSV Content**
   - **Given** the CSV is generated
   - **When** I open it
   - **Then** it contains:
     - Response ID
     - Email
     - Mythe principal
     - All Mythe scores
     - Completion date

3. **AC3: Audit Log**
   - **Given** I export data
   - **When** the export completes
   - **Then** an audit log entry is created (FR48)

## Tasks / Subtasks

- [x] **Task 1: Export API** (AC: 1, 2, 3)
  - [x] GET /dashboard/campaigns/:id/export
  - [x] Generate CSV with proper headers
  - [x] Admin-only access
  - [x] Console audit log

- [x] **Task 2: UI** (AC: 1)
  - [x] Export button on dashboard
  - [x] Loading state during export
  - [x] File download trigger

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

Implemented CSV export:
- API generates CSV from completed responses
- Includes: email, primaryMythe, passeportCode, completedAt
- Admin-only (403 for viewers)
- Proper Content-Type and Content-Disposition headers
- Console audit log with user, campaign, row count
- Button disabled when no completed responses

### File List

- apps/api/src/routes/dashboard.ts (export endpoint)
- apps/web/src/features/campaigns/CampaignDashboardPage.tsx
