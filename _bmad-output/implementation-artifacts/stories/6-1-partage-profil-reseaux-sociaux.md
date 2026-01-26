# Story 6.1: Partage Profil sur Réseaux Sociaux

Status: done

## Story

As a respondent,
I want to share my profile on social networks,
So that I can show my Mythe to others.

## Acceptance Criteria

1. **AC1: Share Buttons**
   - **Given** I am on my results page
   - **When** I click "Partager"
   - **Then** I see share options: LinkedIn, Twitter/X, Facebook

2. **AC2: Pre-filled Share**
   - **Given** I click a share button
   - **When** the share dialog opens
   - **Then** it includes:
     - Pre-filled message with my Mythe
     - Link to my shareable profile page
     - Campaign branding

3. **AC3: Public Profile**
   - **Given** someone clicks my shared link
   - **When** they open it
   - **Then** they see a public view of my Mythe (no raw scores)
   - **And** a CTA to discover their own profile

## Tasks / Subtasks

- [x] **Task 1: Share Buttons UI** (AC: 1, 2)
  - [x] Share card on results page
  - [x] Twitter/X, LinkedIn, Facebook buttons
  - [x] Copy link button
  - [x] Pre-filled share text with Mythe

- [x] **Task 2: Public Profile Page** (AC: 3)
  - [x] Route /profile/:respondentId
  - [x] Display Mythe with icon and description
  - [x] CTA to discover own profile
  - [x] No sensitive data (scores hidden)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

Implemented social sharing:
- Share card with Twitter, LinkedIn, Facebook, Copy Link buttons
- Pre-filled message: "Je viens de découvrir mon profil Ethnostyles : je suis [Mythe] !"
- Public profile page at /profile/:respondentId
- Displays Mythe with icon, tagline, description
- CTA button to discover own profile
- Gradient background matching Mythe color

### File List

- apps/web/src/features/questionnaire/QuestionnaireResultsPage.tsx (share buttons)
- apps/web/src/features/questionnaire/PublicProfilePage.tsx (new)
- apps/web/src/App.tsx (route)
