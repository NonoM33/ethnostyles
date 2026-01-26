# Story 6.3: Notifications Webhook

Status: done

## Story

As an admin,
I want to configure webhooks for my campaigns,
So that I can receive notifications when respondents complete the questionnaire.

## Acceptance Criteria

1. **AC1: Webhook Configuration**
   - **Given** I am on campaign settings
   - **When** I configure a webhook URL
   - **Then** I can save it with an optional secret key

2. **AC2: Webhook Trigger**
   - **Given** a webhook is configured
   - **When** a respondent completes the questionnaire
   - **Then** a POST request is sent to the webhook URL

3. **AC3: Webhook Payload**
   - **Given** a webhook is triggered
   - **When** the request is sent
   - **Then** it contains: event type, respondent data, profile results

4. **AC4: Signature Verification**
   - **Given** a secret is configured
   - **When** the webhook is triggered
   - **Then** the request includes X-Webhook-Signature header (HMAC-SHA256)

5. **AC5: Test Webhook**
   - **Given** a webhook URL is configured
   - **When** I click "Test Webhook"
   - **Then** a test payload is sent and I see success/failure

## Tasks / Subtasks

- [x] **Task 1: Database Schema** (AC: 1)
  - [x] Add webhookUrl and webhookSecret to campaigns table

- [x] **Task 2: Webhook Sending** (AC: 2, 3, 4)
  - [x] sendWebhook function with retry logic (3 attempts, exponential backoff)
  - [x] HMAC-SHA256 signature when secret is set
  - [x] Call webhook on questionnaire completion

- [x] **Task 3: Test Endpoint** (AC: 5)
  - [x] POST /campaigns/:id/test-webhook endpoint
  - [x] Send test payload with signature

- [x] **Task 4: Settings UI** (AC: 1, 5)
  - [x] Webhook URL input field
  - [x] Secret input field (password type)
  - [x] Test Webhook button with loading state
  - [x] Update save to include webhook fields

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

Implemented webhook notifications:
- Added webhookUrl and webhookSecret fields to campaigns schema
- sendWebhook function with 3 retries (0s, 1s, 4s exponential backoff)
- HMAC-SHA256 signature in X-Webhook-Signature header when secret is set
- Webhook triggered on questionnaire completion (after email sending)
- POST /campaigns/:id/test-webhook endpoint for testing
- Settings UI with URL/secret inputs and test button

### File List

- packages/db/src/schema/campaigns.ts (webhook fields)
- apps/api/src/routes/questionnaire.ts (sendWebhook function, webhook call)
- apps/api/src/routes/campaigns.ts (PATCH update, test-webhook endpoint)
- apps/web/src/features/campaigns/CampaignSettingsPage.tsx (webhook UI)
