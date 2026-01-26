# Story 5.8: Documentation API Swagger

Status: done

## Story

As a developer,
I want interactive API documentation,
So that I can easily integrate.

## Acceptance Criteria

1. **AC1: Swagger UI**
   - **Given** I access /docs
   - **When** the page loads
   - **Then** I see Swagger UI with all endpoints

2. **AC2: Endpoint Details**
   - **Given** I view an endpoint
   - **When** I expand it
   - **Then** I see:
     - Request parameters
     - Response schema
     - Example responses

3. **AC3: Try It Out**
   - **Given** I have an API key
   - **When** I use "Try it out" in Swagger
   - **Then** I can test endpoints live

## Tasks / Subtasks

- [x] **Task 1: Swagger Setup** (AC: 1)
  - [x] @elysiajs/swagger already configured
  - [x] Path set to /docs

- [x] **Task 2: Enhanced Documentation** (AC: 2)
  - [x] API description with auth instructions
  - [x] Security schemes (Bearer + API Key)
  - [x] Tags for all endpoint groups
  - [x] Rate limit info

- [x] **Task 3: Endpoint Docs** (AC: 2, 3)
  - [x] All endpoints have tags
  - [x] All endpoints have summary
  - [x] TypeBox schemas auto-generate request/response docs

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

Swagger documentation enhanced:
- Available at /docs
- API overview with auth instructions
- Security schemes defined (bearerAuth, apiKeyAuth)
- Rate limiting documented
- All endpoints tagged and summarized
- Elysia's TypeBox schemas auto-generate OpenAPI specs

To test API v1:
1. Generate API key via POST /api-keys
2. Enter key in Swagger "Authorize" button
3. Use "Try it out" on any /api/v1/* endpoint

### File List

- apps/api/src/index.ts (enhanced swagger config)
