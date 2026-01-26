# Story 2.2: Page d'Accueil et Consentement RGPD

Status: done

## Story

As a respondent,
I want to see estimated time and consent to privacy policy,
So that I know what to expect and my rights are protected.

## Acceptance Criteria

1. **AC1: Landing Page**
   - **Given** I am on the campaign landing page
   - **When** I view the page
   - **Then** I see:
     - Campaign branding (logo, colors)
     - Estimated time (25-30 minutes)
     - Privacy policy link
     - Consent checkbox

2. **AC2: Privacy Policy**
   - **Given** I click the privacy policy link
   - **When** the page opens
   - **Then** I can read the full RGPD-compliant policy

3. **AC3: Consent Required**
   - **Given** I have not checked the consent box
   - **When** I try to start the questionnaire
   - **Then** I see "Vous devez accepter la politique de confidentialité"

4. **AC4: Start Questionnaire**
   - **Given** I check the consent box
   - **When** I click "Commencer"
   - **Then** the questionnaire starts

## Tasks / Subtasks

- [x] **Task 1: Landing Page UI** (AC: 1, 2, 3, 4)
  - [x] Campaign branding display
  - [x] Time estimate (25-30 min)
  - [x] Privacy policy link
  - [x] Consent checkbox
  - [x] Validation on form submit

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

Implemented in QuestionnaireLandingPage:
- Displays campaign logo and primary color
- Shows estimated time (25-30 minutes) and 170 questions count
- Consent checkbox with privacy policy link
- Form validation prevents start without consent
- Consent stored in respondent record with timestamp

### File List

- apps/web/src/features/questionnaire/QuestionnaireLandingPage.tsx
- apps/api/src/routes/questionnaire.ts (consent check in /start endpoint)
