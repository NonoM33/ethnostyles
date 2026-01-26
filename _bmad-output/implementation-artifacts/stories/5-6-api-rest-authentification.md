# Story 5.6: API REST - Authentification

Status: done

## Story

As an admin,
I want to authenticate to the API with a key,
So that I can securely access my data programmatically.

## Acceptance Criteria

1. **AC1: Generate Key**
   - **Given** I am in my account settings
   - **When** I click "Générer clé API"
   - **Then** a unique API key is generated
   - **And** it is displayed once (then hidden)

2. **AC2: Require Key**
   - **Given** I have an API key
   - **When** I make a request without it
   - **Then** I receive 401 Unauthorized

3. **AC3: Use Key**
   - **Given** I have a valid API key
   - **When** I include it in X-API-Key header
   - **Then** I can access API endpoints
   - **And** rate limiting applies (100 req/min - NFR-I2)

4. **AC4: Revoke Key**
   - **Given** I want to revoke a key
   - **When** I click "Révoquer"
   - **Then** the key is immediately invalidated

## Tasks / Subtasks

- [x] **Task 1: API Keys Schema** (AC: 1, 4)
  - [x] Create api_keys table
  - [x] Store hashed keys only
  - [x] Track last used timestamp

- [x] **Task 2: Key Management API** (AC: 1, 4)
  - [x] GET /api-keys - list keys
  - [x] POST /api-keys - create key
  - [x] DELETE /api-keys/:id - revoke key

- [x] **Task 3: X-API-Key Authentication** (AC: 2, 3)
  - [x] Middleware to validate X-API-Key header
  - [x] Return 401 for missing/invalid keys
  - [x] Rate limiting (100 req/min per key)
  - [x] Rate limit headers in response

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

Implemented API key authentication:
- api_keys table with hashed keys (SHA-256)
- Key format: ethno_sk_XXXXXXXX...
- Full key shown only once on creation
- Rate limiting: 100 req/min with X-RateLimit-* headers
- Soft delete for revocation (isActive flag)

### File List

- packages/db/src/schema/api-keys.ts (new table)
- packages/db/src/schema/index.ts (export)
- apps/api/src/routes/api-keys.ts (management endpoints)
- apps/api/src/routes/api-v1.ts (authenticated endpoints)
- apps/api/src/index.ts (register routes)
