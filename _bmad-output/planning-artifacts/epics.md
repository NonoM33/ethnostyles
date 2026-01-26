---
stepsCompleted: [1, 2, 3, 4]
status: complete
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
---

# Ethnostyles Profiler - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Ethnostyles Profiler, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

**Campaign Management (FR1-FR7)**
- FR1: Admin peut créer une nouvelle campagne
- FR2: Admin peut nommer et décrire une campagne
- FR3: Admin peut personnaliser le branding (logo, couleur)
- FR4: Admin peut obtenir un lien unique partageable
- FR5: Admin peut voir la liste de ses campagnes
- FR6: Admin peut archiver une campagne
- FR7: Admin peut dupliquer une campagne (v1.5)

**Questionnaire Experience (FR8-FR15)**
- FR8: Répondant peut accéder au questionnaire via un lien
- FR9: Répondant peut voir le temps estimé avant de commencer
- FR10: Répondant peut répondre aux 170 questions
- FR11: Répondant peut voir sa progression (% complété)
- FR12: Répondant peut voir le temps restant estimé
- FR13: Répondant peut reprendre un questionnaire interrompu
- FR14: Répondant peut compléter le questionnaire sur mobile
- FR15: Répondant peut entrer son code Passeport pour skip (v1.5)

**Profile & Results (FR16-FR22)**
- FR16: Répondant peut voir son profil immédiatement après completion
- FR17: Répondant peut voir son "Mythe" principal
- FR18: Répondant peut voir une description détaillée de son profil
- FR19: Répondant peut recevoir son profil par email
- FR20: Répondant peut recevoir son code Passeport par email
- FR21: Répondant peut partager son profil sur réseaux sociaux (v2)
- FR22: Répondant peut télécharger son profil en PDF (v2)

**Dashboard & Analytics (FR23-FR28)**
- FR23: Admin peut voir le nombre de réponses par campagne
- FR24: Admin peut voir le taux de completion
- FR25: Admin peut voir les réponses en temps réel
- FR26: Admin peut voir la répartition des profils (graphique)
- FR27: Admin peut filtrer les résultats par période
- FR28: Admin peut comparer au benchmark national (v1.5)

**Data Export & Integration (FR29-FR33)**
- FR29: Admin peut exporter les résultats en CSV
- FR30: Admin peut choisir les colonnes à exporter
- FR31: Admin peut récupérer les profils via API REST (v1.5)
- FR32: Admin peut s'authentifier à l'API avec une clé (v1.5)
- FR33: Admin peut recevoir des notifications webhook (v2)

**User Management (FR34-FR39)**
- FR34: Admin peut créer un compte entreprise
- FR35: Admin peut se connecter / déconnecter
- FR36: Admin peut inviter un Viewer à son compte
- FR37: Viewer peut consulter les dashboards (lecture seule)
- FR38: Admin peut révoquer l'accès d'un Viewer
- FR39: Admin peut réinitialiser son mot de passe

**Passeport System (FR40-FR43)**
- FR40: Système génère un code Passeport unique par répondant
- FR41: Répondant peut récupérer son Passeport perdu via email (v1.5)
- FR42: Répondant peut réutiliser son Passeport sur autre campagne (v1.5)
- FR43: Système reconnaît un Passeport et récupère le profil (v1.5)

**Compliance & Ethics (FR44-FR48)**
- FR44: Répondant peut consulter la politique de confidentialité
- FR45: Répondant doit consentir avant de commencer
- FR46: Répondant peut demander la suppression de ses données
- FR47: Répondant peut exporter ses données personnelles (RGPD)
- FR48: Système log les exports de données pour audit

### Non-Functional Requirements

**Performance (NFR-P1 à NFR-P6)**
- NFR-P1: Temps chargement questionnaire < 2 sec
- NFR-P2: Temps réponse entre questions < 200 ms
- NFR-P3: Temps calcul profil après completion < 3 sec
- NFR-P4: Temps chargement dashboard < 3 sec
- NFR-P5: Temps génération export CSV < 10 sec (1000 lignes)
- NFR-P6: Concurrence 500 utilisateurs simultanés minimum

**Sécurité (NFR-S1 à NFR-S8)**
- NFR-S1: Chiffrement at rest AES-256
- NFR-S2: Chiffrement in transit TLS 1.3
- NFR-S3: MFA optionnel pour admins
- NFR-S4: Session timeout 30 min
- NFR-S5: Logs d'audit actions CRUD, exports, accès
- NFR-S6: Isolation multi-tenant stricte
- NFR-S7: Sanitization inputs (XSS, injection)
- NFR-S8: API Keys rotation et révocation

**Scalabilité (NFR-SC1 à NFR-SC5)**
- NFR-SC1: 20 000 profils/mois à M12
- NFR-SC2: 50 tenants simultanés MVP, 200 v2
- NFR-SC3: 10 campagnes actives par tenant
- NFR-SC4: 100 répondants simultanés par campagne
- NFR-SC5: Dégradation < 20% latence à 2x capacity

**Accessibilité (NFR-A1 à NFR-A5)**
- NFR-A1: WCAG 2.1 niveau AA
- NFR-A2: Navigation clavier 100%
- NFR-A3: Compatible NVDA, VoiceOver
- NFR-A4: Contraste 4.5:1 minimum
- NFR-A5: Focus toujours visible

**Fiabilité (NFR-R1 à NFR-R6)**
- NFR-R1: Uptime > 99.5%
- NFR-R2: RTO < 4 heures
- NFR-R3: RPO < 1 heure
- NFR-R4: Backup quotidien, rétention 30 jours
- NFR-R5: Zéro régression scoring
- NFR-R6: Taux erreur API < 0.1%

**Intégration v1.5+ (NFR-I1 à NFR-I5)**
- NFR-I1: REST JSON, OpenAPI 3.0
- NFR-I2: Rate limiting 100 req/min
- NFR-I3: URL versioning API
- NFR-I4: Swagger UI + exemples
- NFR-I5: Webhooks 3 retries, backoff exponentiel

### Additional Requirements

**From Architecture:**
- Monorepo Bun avec workspaces (apps/api, apps/web, packages/*)
- Elysia + Eden Treaty pour type-safety end-to-end
- Drizzle ORM + PostgreSQL avec Row-Level Security multi-tenant
- Better Auth pour authentification self-hosted
- TanStack Query pour state management frontend
- React Hook Form + TypeBox pour validation
- shadcn/ui + Tailwind CSS v4 pour UI
- SSE pour dashboard temps réel
- Resend pour emails transactionnels
- Coolify pour déploiement self-hosted

**From UX Design:**
- Mobile-first pour questionnaire
- Desktop-first pour console admin
- Gamification questionnaire (progression, animations)
- Framer Motion pour animations
- PWA ready pour offline/reprise questionnaire
- Design system cohérent shadcn/ui

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1-FR6 | Epic 1 | Campaign Management |
| FR7 | Epic 5 | Dupliquer campagne (v1.5) |
| FR8-FR14 | Epic 2 | Questionnaire Experience |
| FR15 | Epic 5 | Passeport skip (v1.5) |
| FR16-FR20 | Epic 3 | Profile & Results |
| FR21-FR22 | Epic 6 | Partage social & PDF (v2) |
| FR23-FR27 | Epic 4 | Dashboard & Analytics |
| FR28 | Epic 5 | Benchmark national (v1.5) |
| FR29-FR30 | Epic 4 | Export CSV |
| FR31-FR32 | Epic 5 | API REST (v1.5) |
| FR33 | Epic 6 | Webhooks (v2) |
| FR34-FR39 | Epic 0 | User Management |
| FR40 | Epic 3 | Génération Passeport |
| FR41-FR43 | Epic 5 | Passeport réutilisable (v1.5) |
| FR44-FR45 | Epic 2 | Consentement RGPD |
| FR46-FR47 | Epic 6 | RGPD avancé (v2) |
| FR48 | Epic 4 | Audit logs |

## Epic List

### Epic 0: Project Foundation & Authentication
Les admins peuvent créer un compte entreprise, se connecter et gérer les accès de leur équipe.
**FRs covered:** FR34, FR35, FR36, FR37, FR38, FR39
**Scope:** MVP
**Technical:** Setup monorepo Bun, DB schema Drizzle, Better Auth, multi-tenant RLS

### Epic 1: Campaign Management
Les admins peuvent créer, configurer et gérer leurs campagnes de profiling avec branding personnalisé.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6
**Scope:** MVP
**Depends on:** Epic 0

### Epic 2: Questionnaire Experience
Les répondants peuvent accéder et compléter le questionnaire de 170 questions avec une UX mobile-first excellente.
**FRs covered:** FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR44, FR45
**Scope:** MVP
**Depends on:** Epic 1

### Epic 3: Profile & Results
Les répondants découvrent leur profil Ethnostyles ("Mythe") immédiatement et reçoivent leur code Passeport par email.
**FRs covered:** FR16, FR17, FR18, FR19, FR20, FR40
**Scope:** MVP
**Depends on:** Epic 2

### Epic 4: Dashboard & Export
Les admins peuvent suivre les réponses en temps réel, visualiser les statistiques et exporter les données en CSV.
**FRs covered:** FR23, FR24, FR25, FR26, FR27, FR29, FR30, FR48
**Scope:** MVP
**Depends on:** Epic 3

### Epic 5: Passeport System & API (v1.5)
Les répondants peuvent réutiliser leur Passeport sur d'autres campagnes, les admins accèdent à l'API REST.
**FRs covered:** FR7, FR15, FR28, FR31, FR32, FR41, FR42, FR43
**Scope:** v1.5
**Depends on:** Epic 4

### Epic 6: Advanced Features (v2)
Partage social du profil, téléchargement PDF, webhooks et fonctionnalités RGPD avancées.
**FRs covered:** FR21, FR22, FR33, FR46, FR47
**Scope:** v2
**Depends on:** Epic 5

---

## Epic 0: Project Foundation & Authentication

**Goal:** Les admins peuvent créer un compte entreprise, se connecter et gérer les accès de leur équipe.

**FRs covered:** FR34, FR35, FR36, FR37, FR38, FR39
**Technical:** Setup monorepo Bun, DB schema Drizzle, Better Auth, multi-tenant RLS

### Story 0.1: Setup du Monorepo et Infrastructure de Base

As a developer,
I want the project infrastructure set up with Bun monorepo,
So that I can start building features on a solid foundation.

**Acceptance Criteria:**

**Given** a fresh repository
**When** I run `bun install`
**Then** all workspaces (apps/api, apps/web, packages/*) are installed
**And** TypeScript strict mode is configured
**And** ESLint/Prettier are configured

**Given** the monorepo is set up
**When** I run `bun run dev`
**Then** both API and web servers start successfully

### Story 0.2: Database Schema et Multi-Tenant Foundation

As a developer,
I want the PostgreSQL database with multi-tenant RLS,
So that tenant data is always isolated.

**Acceptance Criteria:**

**Given** PostgreSQL is configured
**When** I create a record without tenant_id
**Then** the operation fails with a constraint error

**Given** RLS policies are enabled
**When** a user queries data
**Then** only their tenant's data is returned
**And** tables tenants, users are created with proper relationships

### Story 0.3: Création de Compte Entreprise (FR34)

As an admin,
I want to create an enterprise account,
So that I can start using the platform.

**Acceptance Criteria:**

**Given** I am on the registration page
**When** I fill in company name, email, and password
**Then** a new tenant is created
**And** my user account is created as Admin role
**And** I receive a confirmation email

**Given** I try to register with an existing email
**When** I submit the form
**Then** I see an error message "Email already exists"

### Story 0.4: Connexion et Déconnexion (FR35)

As an admin,
I want to log in and log out,
So that I can securely access my account.

**Acceptance Criteria:**

**Given** I have a registered account
**When** I enter correct email and password
**Then** I am logged in and redirected to dashboard
**And** a session is created with 30min timeout (NFR-S4)

**Given** I am logged in
**When** I click logout
**Then** my session is invalidated
**And** I am redirected to login page

**Given** I enter wrong credentials
**When** I submit the form
**Then** I see an error message (without revealing which field is wrong)

### Story 0.5: Réinitialisation Mot de Passe (FR39)

As an admin,
I want to reset my password,
So that I can recover access to my account.

**Acceptance Criteria:**

**Given** I am on the login page
**When** I click "Forgot password" and enter my email
**Then** I receive an email with a reset link

**Given** I have a valid reset link
**When** I set a new password
**Then** my password is updated
**And** all existing sessions are invalidated
**And** I can log in with the new password

**Given** I have an expired reset link (>1h)
**When** I try to use it
**Then** I see an error and must request a new link

### Story 0.6: Invitation Viewer (FR36)

As an admin,
I want to invite a Viewer to my account,
So that they can view dashboards.

**Acceptance Criteria:**

**Given** I am logged in as Admin
**When** I invite a user with email
**Then** they receive an invitation email
**And** a pending invitation is visible in my team list

**Given** I am an invited Viewer
**When** I click the invitation link
**Then** I can set my password
**And** I am added to the tenant with Viewer role

### Story 0.7: Consultation Viewer (FR37)

As a Viewer,
I want to access dashboards in read-only mode,
So that I can see campaign results.

**Acceptance Criteria:**

**Given** I am logged in as Viewer
**When** I access the dashboard
**Then** I can see all campaign statistics

**Given** I am logged in as Viewer
**When** I try to create/edit a campaign
**Then** I see a "Permission denied" message
**And** the action is blocked

### Story 0.8: Révocation Accès Viewer (FR38)

As an admin,
I want to revoke a Viewer's access,
So that they can no longer see my data.

**Acceptance Criteria:**

**Given** I am logged in as Admin
**When** I revoke a Viewer's access
**Then** their account is deactivated
**And** their sessions are invalidated
**And** they cannot log in anymore

**Given** a Viewer's access is revoked
**When** they try to access the platform
**Then** they see "Access revoked" message

---

## Epic 1: Campaign Management

**Goal:** Les admins peuvent créer, configurer et gérer leurs campagnes de profiling avec branding personnalisé.

**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6
**Depends on:** Epic 0

### Story 1.1: Création de Campagne (FR1, FR2)

As an admin,
I want to create a new campaign with name and description,
So that I can start collecting respondent profiles.

**Acceptance Criteria:**

**Given** I am logged in as Admin
**When** I click "New Campaign" and fill in name and description
**Then** a new campaign is created with status "draft"
**And** I am redirected to the campaign settings page

**Given** I try to create a campaign without a name
**When** I submit the form
**Then** I see a validation error "Name is required"

**Given** a campaign is created
**When** I view the campaign list
**Then** the new campaign appears with creation date

### Story 1.2: Personnalisation Branding Campagne (FR3)

As an admin,
I want to customize the branding of my campaign (logo, color),
So that respondents see my company identity.

**Acceptance Criteria:**

**Given** I am on the campaign settings page
**When** I upload a logo (PNG/JPG, max 2MB)
**Then** the logo is saved and previewed

**Given** I am on the campaign settings page
**When** I select a primary color
**Then** the color is saved
**And** a preview shows how the questionnaire will look

**Given** I don't upload a logo
**When** the questionnaire loads
**Then** no logo is displayed (graceful fallback)

### Story 1.3: Génération Lien Unique (FR4)

As an admin,
I want to get a unique shareable link for my campaign,
So that I can distribute it to respondents.

**Acceptance Criteria:**

**Given** I have created a campaign
**When** I activate the campaign
**Then** a unique URL is generated (e.g., /q/{campaign_slug})
**And** the link is displayed with a copy button

**Given** I have an active campaign link
**When** I click "Copy Link"
**Then** the URL is copied to clipboard
**And** I see a confirmation toast

**Given** the campaign is in draft status
**When** I view the campaign
**Then** no shareable link is available yet

### Story 1.4: Liste des Campagnes (FR5)

As an admin,
I want to see a list of all my campaigns,
So that I can manage them efficiently.

**Acceptance Criteria:**

**Given** I am logged in as Admin
**When** I access the campaigns page
**Then** I see all my campaigns with:
  - Name
  - Status (draft, active, archived)
  - Response count
  - Creation date

**Given** I have many campaigns
**When** I view the list
**Then** campaigns are sorted by last activity (most recent first)

**Given** I have both active and archived campaigns
**When** I view the list
**Then** archived campaigns are visually distinct (grayed out)

### Story 1.5: Archivage de Campagne (FR6)

As an admin,
I want to archive a campaign,
So that it no longer accepts responses but data is preserved.

**Acceptance Criteria:**

**Given** I have an active campaign
**When** I click "Archive"
**Then** a confirmation dialog appears

**Given** I confirm archiving
**When** the action completes
**Then** the campaign status changes to "archived"
**And** the public link returns "Campaign closed" message
**And** existing responses are preserved

**Given** I have an archived campaign
**When** I view it
**Then** I can still see all historical data
**And** I cannot edit the campaign settings

---

## Epic 2: Questionnaire Experience

**Goal:** Les répondants peuvent accéder et compléter le questionnaire de 170 questions avec une UX mobile-first excellente.

**FRs covered:** FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR44, FR45
**Depends on:** Epic 1

### Story 2.1: Accès au Questionnaire via Lien (FR8)

As a respondent,
I want to access the questionnaire via a shared link,
So that I can start answering questions.

**Acceptance Criteria:**

**Given** I have a valid campaign link
**When** I open the link in my browser
**Then** I see the campaign landing page with branding
**And** the page loads in < 2 sec (NFR-P1)

**Given** the campaign is archived
**When** I access the link
**Then** I see "Cette campagne est terminée" message

**Given** an invalid campaign link
**When** I access it
**Then** I see a 404 page with helpful message

### Story 2.2: Page d'Accueil et Consentement RGPD (FR9, FR44, FR45)

As a respondent,
I want to see estimated time and consent to privacy policy,
So that I know what to expect and my rights are protected.

**Acceptance Criteria:**

**Given** I am on the campaign landing page
**When** I view the page
**Then** I see:
  - Campaign branding (logo, colors)
  - Estimated time (25-30 minutes)
  - Privacy policy link
  - Consent checkbox

**Given** I click the privacy policy link
**When** the page opens
**Then** I can read the full RGPD-compliant policy

**Given** I have not checked the consent box
**When** I try to start the questionnaire
**Then** I see "Vous devez accepter la politique de confidentialité"

**Given** I check the consent box
**When** I click "Commencer"
**Then** the questionnaire starts

### Story 2.3: Saisie Email Répondant

As a respondent,
I want to enter my email before starting,
So that I can receive my results and Passeport.

**Acceptance Criteria:**

**Given** I have consented to the privacy policy
**When** I am prompted for email
**Then** I must enter a valid email address

**Given** I enter an invalid email format
**When** I try to continue
**Then** I see a validation error

**Given** I enter a valid email
**When** I continue
**Then** a respondent record is created
**And** I proceed to the first question

### Story 2.4: Affichage et Réponse aux Questions (FR10)

As a respondent,
I want to answer the 170 questions,
So that my profile can be calculated.

**Acceptance Criteria:**

**Given** I have started the questionnaire
**When** a question is displayed
**Then** I see the question text and 4 answer options (Likert scale)
**And** response time between questions < 200ms (NFR-P2)

**Given** I select an answer
**When** I click an option
**Then** my answer is saved
**And** the next question appears with smooth animation

**Given** I am on a question
**When** I want to go back
**Then** I can navigate to previous questions
**And** my previous answers are preserved

### Story 2.5: Progression et Temps Restant (FR11, FR12)

As a respondent,
I want to see my progress and estimated time remaining,
So that I know how much is left.

**Acceptance Criteria:**

**Given** I am answering questions
**When** I view the progress bar
**Then** I see percentage completed (e.g., "45/170 - 26%")

**Given** I am answering questions
**When** I view the time estimate
**Then** I see estimated time remaining based on my pace

**Given** I answer faster than average
**When** the estimate updates
**Then** the remaining time decreases accordingly

### Story 2.6: Sauvegarde et Reprise (FR13)

As a respondent,
I want to resume an interrupted questionnaire,
So that I don't lose my progress.

**Acceptance Criteria:**

**Given** I am answering questions
**When** each answer is submitted
**Then** it is saved to the database immediately

**Given** I close my browser mid-questionnaire
**When** I return to the same link with same email
**Then** I am asked "Reprendre où vous en étiez?"
**And** I can continue from my last answered question

**Given** I have a partial session
**When** I choose "Recommencer"
**Then** my previous answers are cleared
**And** I start from question 1

### Story 2.7: Expérience Mobile Optimisée (FR14)

As a respondent,
I want to complete the questionnaire on my mobile,
So that I can answer anywhere.

**Acceptance Criteria:**

**Given** I access the questionnaire on mobile
**When** the page loads
**Then** the UI is fully responsive
**And** touch targets are at least 44x44px

**Given** I am on mobile
**When** I swipe left/right
**Then** I can navigate between questions

**Given** I am on mobile
**When** I view the progress
**Then** the progress bar is visible but compact

**Given** screen width < 640px
**When** the questionnaire renders
**Then** all elements fit without horizontal scroll

### Story 2.8: Animations et Gamification

As a respondent,
I want engaging animations during the questionnaire,
So that the experience feels dynamic and motivating.

**Acceptance Criteria:**

**Given** I answer a question
**When** the next question appears
**Then** there is a smooth slide/fade transition (Framer Motion)

**Given** I reach 25%, 50%, 75% progress
**When** the milestone is hit
**Then** I see a brief celebration animation
**And** an encouraging message

**Given** I complete the questionnaire
**When** I finish the last question
**Then** I see a completion animation before results

---

## Epic 3: Profile & Results

**Goal:** Les répondants découvrent leur profil Ethnostyles ("Mythe") immédiatement et reçoivent leur code Passeport par email.

**FRs covered:** FR16, FR17, FR18, FR19, FR20, FR40
**Depends on:** Epic 2

### Story 3.1: Calcul du Profil Ethnostyles (FR16)

As a respondent,
I want my profile calculated immediately after completion,
So that I can discover my results without delay.

**Acceptance Criteria:**

**Given** I have answered all 170 questions
**When** I submit the last answer
**Then** my profile is calculated in < 3 sec (NFR-P3)
**And** I see a loading animation during calculation

**Given** the calculation completes
**When** results are ready
**Then** I am automatically redirected to the results page

**Given** a calculation error occurs
**When** the error is caught
**Then** I see a friendly error message
**And** the error is logged for investigation

### Story 3.2: Affichage du Mythe Principal (FR17)

As a respondent,
I want to see my main "Mythe" profile,
So that I can understand my cultural archetype.

**Acceptance Criteria:**

**Given** my profile is calculated
**When** I view the results page
**Then** I see my primary Mythe prominently displayed
**And** the Mythe has a distinctive visual identity (icon/color)

**Given** I am viewing my Mythe
**When** I look at the presentation
**Then** I see the Mythe name in large text
**And** a brief tagline/summary

**Given** my profile includes secondary Mythes
**When** I view the results
**Then** I see my top 3 Mythes ranked

### Story 3.3: Description Détaillée du Profil (FR18)

As a respondent,
I want to see a detailed description of my profile,
So that I can understand what it means.

**Acceptance Criteria:**

**Given** I am on the results page
**When** I scroll down
**Then** I see a detailed description of my Mythe
**And** the description includes:
  - Core characteristics
  - Values and motivations
  - Behavioral tendencies

**Given** I want more detail
**When** I expand sections
**Then** I can read extended descriptions

**Given** the content is loaded
**When** I view it
**Then** text is formatted for easy reading (headings, paragraphs)

### Story 3.4: Génération du Code Passeport (FR40)

As a respondent,
I want a unique Passeport code generated,
So that I have a permanent identifier for my profile.

**Acceptance Criteria:**

**Given** my profile is calculated
**When** the calculation completes
**Then** a unique Passeport code is generated (format: XXXX-XXXX-XXXX)
**And** the code is stored with my respondent record

**Given** the Passeport code exists
**When** I view my results
**Then** I see my Passeport code displayed prominently
**And** I can copy it with one click

**Given** a Passeport code is generated
**When** checked against existing codes
**Then** it is guaranteed unique (no collisions)

### Story 3.5: Envoi Résultats par Email (FR19)

As a respondent,
I want to receive my profile results by email,
So that I have a permanent record.

**Acceptance Criteria:**

**Given** my profile is calculated
**When** the results are ready
**Then** an email is automatically sent to my address
**And** the email arrives within 1 minute

**Given** I receive the results email
**When** I open it
**Then** I see:
  - My Mythe name and summary
  - A link to view full results online
  - Campaign branding (logo)

**Given** the email fails to send
**When** the error is caught
**Then** a retry is attempted (max 3 times)
**And** the failure is logged

### Story 3.6: Envoi Code Passeport par Email (FR20)

As a respondent,
I want to receive my Passeport code by email,
So that I can keep it safe and reuse it later.

**Acceptance Criteria:**

**Given** my Passeport is generated
**When** the results email is sent
**Then** the Passeport code is included in the email
**And** instructions explain how to use it

**Given** I receive the email
**When** I view the Passeport section
**Then** the code is easy to copy
**And** I understand it's my unique identifier

**Given** I have the Passeport code
**When** I read the instructions
**Then** I know I can use it on future campaigns (v1.5)

---

## Epic 4: Dashboard & Export

**Goal:** Les admins peuvent suivre les réponses en temps réel, visualiser les statistiques et exporter les données en CSV.

**FRs covered:** FR23, FR24, FR25, FR26, FR27, FR29, FR30, FR48
**Depends on:** Epic 3

### Story 4.1: Vue d'Ensemble Dashboard (FR23, FR24)

As an admin,
I want to see response count and completion rate per campaign,
So that I can track campaign performance.

**Acceptance Criteria:**

**Given** I am logged in as Admin
**When** I access a campaign dashboard
**Then** I see:
  - Total responses count
  - Completion rate (%)
  - Abandonment rate (%)
**And** the page loads in < 3 sec (NFR-P4)

**Given** I have multiple campaigns
**When** I view the main dashboard
**Then** I see a summary card for each active campaign

**Given** no responses yet
**When** I view the dashboard
**Then** I see "Aucune réponse" with helpful tips

### Story 4.2: Réponses en Temps Réel (FR25)

As an admin,
I want to see responses in real-time,
So that I can monitor campaign activity live.

**Acceptance Criteria:**

**Given** I am on the campaign dashboard
**When** a new response is submitted
**Then** the count updates automatically (SSE)
**And** I see a subtle notification

**Given** real-time is enabled
**When** multiple responses arrive
**Then** they are batched and displayed smoothly
**And** the UI doesn't flicker

**Given** connection is lost
**When** SSE reconnects
**Then** I see a brief "Reconnecting..." indicator
**And** data syncs automatically

### Story 4.3: Répartition des Profils - Graphique (FR26)

As an admin,
I want to see profile distribution as a chart,
So that I can understand the Mythe breakdown.

**Acceptance Criteria:**

**Given** I have completed responses
**When** I view the analytics section
**Then** I see a pie/donut chart of Mythe distribution
**And** each Mythe has its distinctive color

**Given** I hover over a chart segment
**When** the tooltip appears
**Then** I see the Mythe name, count, and percentage

**Given** I click on a chart segment
**When** the action is triggered
**Then** I see the list of respondents with that Mythe

### Story 4.4: Filtrage par Période (FR27)

As an admin,
I want to filter results by time period,
So that I can analyze specific timeframes.

**Acceptance Criteria:**

**Given** I am on the dashboard
**When** I select a date range filter
**Then** all metrics update to show only that period
**And** available presets: Today, Last 7 days, Last 30 days, Custom

**Given** I select a custom date range
**When** I pick start and end dates
**Then** the data filters accordingly

**Given** the selected period has no data
**When** the filter applies
**Then** I see "Aucune donnée pour cette période"

### Story 4.5: Liste des Réponses (FR25)

As an admin,
I want to see a list of all responses,
So that I can review individual results.

**Acceptance Criteria:**

**Given** I am on the campaign dashboard
**When** I click "Voir les réponses"
**Then** I see a paginated table with:
  - Email (masked: j***@example.com)
  - Mythe principal
  - Completion date
  - Status (complete/partial)

**Given** I click on a response row
**When** the detail opens
**Then** I see full profile details

**Given** I have 100+ responses
**When** I scroll the table
**Then** pagination works smoothly (20 per page)

### Story 4.6: Export CSV Basique (FR29)

As an admin,
I want to export results to CSV,
So that I can analyze data in spreadsheets.

**Acceptance Criteria:**

**Given** I am on the campaign dashboard
**When** I click "Exporter CSV"
**Then** a CSV file downloads
**And** export completes in < 10 sec for 1000 rows (NFR-P5)

**Given** the CSV is generated
**When** I open it
**Then** it contains:
  - Response ID
  - Email
  - Mythe principal
  - All Mythe scores
  - Completion date

**Given** I export data
**When** the export completes
**Then** an audit log entry is created (FR48)

### Story 4.7: Export CSV avec Sélection Colonnes (FR30)

As an admin,
I want to choose which columns to export,
So that I can customize my data extract.

**Acceptance Criteria:**

**Given** I click "Exporter CSV"
**When** the export modal opens
**Then** I see checkboxes for all available columns
**And** default selection includes common fields

**Given** I select specific columns
**When** I click "Exporter"
**Then** the CSV contains only selected columns

**Given** I frequently export
**When** I make a column selection
**Then** my preference is remembered for next time

### Story 4.8: Audit Logs (FR48)

As an admin,
I want data exports to be logged,
So that there's an audit trail for compliance.

**Acceptance Criteria:**

**Given** an admin exports data
**When** the export completes
**Then** an audit log entry is created with:
  - User ID
  - Action type (export)
  - Timestamp
  - Campaign ID
  - Row count exported

**Given** I am a super admin
**When** I access audit logs
**Then** I can view all export activities

**Given** an export fails
**When** the error occurs
**Then** the failure is also logged

---

## Epic 5: Passeport System & API (v1.5)

**Goal:** Les répondants peuvent réutiliser leur Passeport sur d'autres campagnes, les admins accèdent à l'API REST.

**FRs covered:** FR7, FR15, FR28, FR31, FR32, FR41, FR42, FR43
**Scope:** v1.5
**Depends on:** Epic 4

### Story 5.1: Duplication de Campagne (FR7)

As an admin,
I want to duplicate an existing campaign,
So that I can quickly create similar campaigns.

**Acceptance Criteria:**

**Given** I have an existing campaign
**When** I click "Dupliquer"
**Then** a new campaign is created with:
  - Same name + " (copie)"
  - Same description
  - Same branding (logo, color)
  - Status "draft"

**Given** I duplicate a campaign
**When** the copy is created
**Then** no responses are copied
**And** a new unique link is generated when activated

**Given** I duplicate a campaign
**When** I view the copy
**Then** I can edit all settings independently

### Story 5.2: Skip Questionnaire avec Passeport (FR15)

As a respondent,
I want to enter my Passeport code to skip the questionnaire,
So that I don't have to answer 170 questions again.

**Acceptance Criteria:**

**Given** I am on a campaign landing page
**When** I see the option "J'ai déjà un Passeport"
**Then** I can enter my existing Passeport code

**Given** I enter a valid Passeport code
**When** the code is verified
**Then** my existing profile is retrieved
**And** I skip directly to the results page
**And** my response is linked to this campaign

**Given** I enter an invalid Passeport code
**When** I submit
**Then** I see "Code Passeport invalide"
**And** I can try again or start the questionnaire

### Story 5.3: Récupération Passeport Perdu (FR41)

As a respondent,
I want to recover my lost Passeport via email,
So that I can retrieve my profile.

**Acceptance Criteria:**

**Given** I am on a campaign landing page
**When** I click "Passeport perdu?"
**Then** I can enter my email address

**Given** I enter an email with a Passeport
**When** I submit
**Then** an email is sent with my Passeport code
**And** I see "Un email vous a été envoyé"

**Given** I enter an email without a Passeport
**When** I submit
**Then** I see the same message (no email enumeration)
**And** no email is sent

### Story 5.4: Réutilisation Passeport Cross-Campagne (FR42, FR43)

As a respondent,
I want to use my Passeport on different campaigns,
So that my profile follows me across organizations.

**Acceptance Criteria:**

**Given** I have a valid Passeport from Campaign A
**When** I use it on Campaign B (different tenant)
**Then** my profile is retrieved
**And** a new response is created for Campaign B
**And** both tenants see my profile

**Given** I use my Passeport on a new campaign
**When** the profile is applied
**Then** the new campaign owner sees my Mythe
**And** my original raw answers are NOT shared (privacy)

**Given** I have used my Passeport on 3 campaigns
**When** I view my results
**Then** each campaign has its own response record

### Story 5.5: Benchmark National (FR28)

As an admin,
I want to compare my results to national benchmark,
So that I can contextualize my data.

**Acceptance Criteria:**

**Given** I am on the dashboard analytics
**When** I enable "Comparer au benchmark"
**Then** I see national averages alongside my data

**Given** benchmark is displayed
**When** I view the Mythe distribution chart
**Then** each segment shows my % vs national %

**Given** I export data
**When** benchmark is enabled
**Then** the CSV includes a benchmark column

### Story 5.6: API REST - Authentification (FR32)

As an admin,
I want to authenticate to the API with a key,
So that I can securely access my data programmatically.

**Acceptance Criteria:**

**Given** I am in my account settings
**When** I click "Générer clé API"
**Then** a unique API key is generated
**And** it is displayed once (then hidden)

**Given** I have an API key
**When** I make a request without it
**Then** I receive 401 Unauthorized

**Given** I have a valid API key
**When** I include it in X-API-Key header
**Then** I can access API endpoints
**And** rate limiting applies (100 req/min - NFR-I2)

**Given** I want to revoke a key
**When** I click "Révoquer"
**Then** the key is immediately invalidated

### Story 5.7: API REST - Endpoints Profils (FR31)

As an admin,
I want to retrieve profiles via REST API,
So that I can integrate with my systems.

**Acceptance Criteria:**

**Given** I am authenticated with API key
**When** I call GET /api/v1/campaigns
**Then** I receive my campaigns list (JSON)

**Given** I have a campaign ID
**When** I call GET /api/v1/campaigns/{id}/responses
**Then** I receive paginated responses
**And** each response includes Mythe data

**Given** I call an endpoint
**When** I specify ?page=2&limit=50
**Then** pagination works correctly

**Given** the API is called
**When** any error occurs
**Then** proper error codes and messages are returned

### Story 5.8: Documentation API Swagger (NFR-I4)

As a developer,
I want interactive API documentation,
So that I can easily integrate.

**Acceptance Criteria:**

**Given** I access /api/docs
**When** the page loads
**Then** I see Swagger UI with all endpoints

**Given** I view an endpoint
**When** I expand it
**Then** I see:
  - Request parameters
  - Response schema
  - Example responses

**Given** I have an API key
**When** I use "Try it out" in Swagger
**Then** I can test endpoints live

---

## Epic 6: Advanced Features (v2)

**Goal:** Partage social du profil, téléchargement PDF, webhooks et fonctionnalités RGPD avancées.

**FRs covered:** FR21, FR22, FR33, FR46, FR47
**Scope:** v2
**Depends on:** Epic 5

### Story 6.1: Partage Profil sur Réseaux Sociaux (FR21)

As a respondent,
I want to share my profile on social networks,
So that I can show my Mythe to others.

**Acceptance Criteria:**

**Given** I am on my results page
**When** I click "Partager"
**Then** I see share options: LinkedIn, Twitter/X, Facebook

**Given** I click a share button
**When** the share dialog opens
**Then** it includes:
  - Pre-filled message with my Mythe
  - Link to my shareable profile page
  - Campaign branding

**Given** someone clicks my shared link
**When** they open it
**Then** they see a public view of my Mythe (no raw scores)
**And** a CTA to discover their own profile

### Story 6.2: Téléchargement Profil en PDF (FR22)

As a respondent,
I want to download my profile as PDF,
So that I can keep a professional document.

**Acceptance Criteria:**

**Given** I am on my results page
**When** I click "Télécharger PDF"
**Then** a PDF is generated and downloaded

**Given** the PDF is generated
**When** I open it
**Then** it contains:
  - My Mythe with visual identity
  - Full profile description
  - Campaign branding
  - My Passeport code
  - Generation date

**Given** PDF generation takes time
**When** I click download
**Then** I see a loading indicator
**And** the file downloads when ready

### Story 6.3: Notifications Webhook (FR33)

As an admin,
I want to receive webhook notifications,
So that my systems react to new responses.

**Acceptance Criteria:**

**Given** I am in campaign settings
**When** I configure a webhook URL
**Then** I can set the URL and secret key

**Given** a webhook is configured
**When** a new response is completed
**Then** a POST request is sent to the URL
**And** payload includes response summary

**Given** a webhook call fails
**When** the error is detected
**Then** retry occurs (3 times, exponential backoff - NFR-I5)
**And** failures are logged

**Given** I want to test my webhook
**When** I click "Tester"
**Then** a test payload is sent
**And** I see success/failure result

### Story 6.4: Demande Suppression Données RGPD (FR46)

As a respondent,
I want to request deletion of my data,
So that I can exercise my RGPD rights.

**Acceptance Criteria:**

**Given** I have completed a questionnaire
**When** I access the results page
**Then** I see "Supprimer mes données" link

**Given** I click delete request
**When** the confirmation appears
**Then** I must confirm with my email

**Given** I confirm deletion
**When** the request is processed
**Then** my response data is anonymized
**And** my email is removed
**And** my Passeport is invalidated
**And** I receive confirmation email

**Given** deletion is requested
**When** it's processed
**Then** an audit log entry is created

### Story 6.5: Export Données Personnelles RGPD (FR47)

As a respondent,
I want to export my personal data,
So that I can exercise my RGPD portability rights.

**Acceptance Criteria:**

**Given** I am on my results page
**When** I click "Exporter mes données"
**Then** I must verify my email

**Given** I verify my email
**When** the export is requested
**Then** I receive an email with download link

**Given** I click the download link
**When** the file downloads
**Then** I receive a JSON file containing:
  - My profile data
  - My answers (anonymized question IDs)
  - My Passeport code
  - Timestamps

**Given** export is requested
**When** it's processed
**Then** an audit log entry is created (FR48)

---

## Summary

| Epic | Stories | FRs Covered | Scope |
|------|---------|-------------|-------|
| Epic 0 | 8 | FR34-39 | MVP |
| Epic 1 | 5 | FR1-6 | MVP |
| Epic 2 | 8 | FR8-14, FR44-45 | MVP |
| Epic 3 | 6 | FR16-20, FR40 | MVP |
| Epic 4 | 8 | FR23-27, FR29-30, FR48 | MVP |
| Epic 5 | 8 | FR7, FR15, FR28, FR31-32, FR41-43 | v1.5 |
| Epic 6 | 5 | FR21-22, FR33, FR46-47 | v2 |
| **TOTAL** | **48** | **48 FRs** | |
