# Story 5.5: Benchmark National

Status: done

## Story

As an admin,
I want to compare my results to national benchmark,
So that I can contextualize my data.

## Acceptance Criteria

1. **AC1: Enable Benchmark**
   - **Given** I am on the dashboard analytics
   - **When** I enable "Comparer au benchmark"
   - **Then** I see national averages alongside my data

2. **AC2: Chart Comparison**
   - **Given** benchmark is displayed
   - **When** I view the Mythe distribution chart
   - **Then** each segment shows my % vs national %

3. **AC3: Export with Benchmark**
   - **Given** I export data
   - **When** benchmark is enabled
   - **Then** the CSV includes a benchmark column

## Tasks / Subtasks

- [x] **Task 1: Benchmark Data** (AC: 1, 2)
  - [x] Add static national benchmark data (MVP)
  - [x] Include benchmark in stats API when requested
  - [x] Return benchmark percentage per Mythe

- [x] **Task 2: Dashboard UI** (AC: 1, 2)
  - [x] "Comparer au benchmark" checkbox toggle
  - [x] Show campaign % vs national % in chart
  - [x] Visual marker for benchmark on bars
  - [x] Legend for benchmark indicator

- [x] **Task 3: Export with Benchmark** (AC: 3)
  - [x] Add includeBenchmark query param to export
  - [x] Include benchmarkNational column in CSV

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

Implemented national benchmark comparison:
- Static benchmark data for 8 Mythes (represents national distribution)
- Stats API returns benchmark when ?includeBenchmark=true
- Dashboard toggle to enable comparison
- Chart shows: bar for campaign %, vertical marker for benchmark
- Difference shown in text (+X% or -X%)
- CSV export includes benchmarkNational column when enabled

Note: In production, benchmark would be calculated from aggregated data across all tenants.

### File List

- apps/api/src/routes/dashboard.ts (benchmark data + API params)
- apps/web/src/features/campaigns/CampaignDashboardPage.tsx (toggle + chart)
