# Story 5.7: API REST - Endpoints Profils

Status: done

## Story

As an admin,
I want to retrieve profiles via REST API,
So that I can integrate with my systems.

## Acceptance Criteria

1. **AC1: List Campaigns**
   - **Given** I am authenticated with API key
   - **When** I call GET /api/v1/campaigns
   - **Then** I receive my campaigns list (JSON)

2. **AC2: Get Responses**
   - **Given** I have a campaign ID
   - **When** I call GET /api/v1/campaigns/{id}/responses
   - **Then** I receive paginated responses
   - **And** each response includes Mythe data

3. **AC3: Pagination**
   - **Given** I call an endpoint
   - **When** I specify ?page=2&limit=50
   - **Then** pagination works correctly

4. **AC4: Error Handling**
   - **Given** the API is called
   - **When** any error occurs
   - **Then** proper error codes and messages are returned

## Tasks / Subtasks

- [x] **Task 1: Campaign Endpoints** (AC: 1)
  - [x] GET /api/v1/campaigns
  - [x] GET /api/v1/campaigns/:id

- [x] **Task 2: Response Endpoints** (AC: 2, 3)
  - [x] GET /api/v1/campaigns/:id/responses with pagination
  - [x] GET /api/v1/responses/:id for single response
  - [x] Include primaryMythe and scores in response

- [x] **Task 3: Error Handling** (AC: 4)
  - [x] 401 for missing/invalid API key
  - [x] 404 for not found resources
  - [x] 429 for rate limit exceeded

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

Implemented public REST API v1:
- GET /api/v1/campaigns - list all campaigns
- GET /api/v1/campaigns/:id - get single campaign
- GET /api/v1/campaigns/:id/responses - paginated responses with Mythe data
- GET /api/v1/responses/:id - single response with full profile

Response format includes:
- id, email, primaryMythe, scores (parsed from profileData)
- passeportCode, completedAt

Pagination: ?page=1&limit=50 (max 100)
Rate limit headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset

### File List

- apps/api/src/routes/api-v1.ts
