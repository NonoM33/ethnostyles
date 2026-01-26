---
stepsCompleted: ['init', 'design', 'stories']
status: complete
inputDocuments:
  - '_bmad-output/planning-artifacts/prd-v2.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
workflowType: 'epics'
version: '2.0'
date: 2026-01-25
author: Renaud.cosson-ext
totalEpics: 12
totalStories: 78
---

# Epics & User Stories - Ethnostyles Profiler v2

**Version:** 2.0 - SaaS Ultra-Complet
**Date:** 2026-01-25
**Total Epics:** 12
**Total Stories:** 78

---

## Epic Overview

| Epic | Nom | Stories | Phase | Priorité |
|:----:|-----|:-------:|:-----:|:--------:|
| 0 | Project Foundation | 5 | MVP | 🔴 |
| 1 | Authentication & User Management | 8 | MVP | 🔴 |
| 2 | Organization & Multi-tenancy | 6 | MVP | 🔴 |
| 3 | Campaign Management | 9 | MVP | 🔴 |
| 4 | Questionnaire Experience | 10 | MVP | 🔴 |
| 5 | Profile & Results | 7 | MVP | 🔴 |
| 6 | Dashboard & Analytics | 8 | MVP | 🔴 |
| 7 | Export & Data | 5 | MVP | 🔴 |
| 8 | Passeport System | 6 | v1.5 | 🟠 |
| 9 | API & Integrations | 6 | v1.5 | 🟠 |
| 10 | Team & Manager Features | 4 | v2 | 🟡 |
| 11 | Advanced Analytics | 4 | v2 | 🟡 |

---

## Epic 0: Project Foundation

**Objectif:** Initialiser le monorepo Bun, configurer la stack technique et préparer l'infrastructure de base.

### Story 0.1: Initialize Monorepo Structure

**En tant que** développeur
**Je veux** un monorepo Bun configuré avec workspaces
**Afin de** avoir une base de code organisée et maintenable

**Critères d'acceptation:**
- [ ] Structure monorepo créée (apps/api, apps/web, packages/*)
- [ ] Bun workspaces configuré dans package.json
- [ ] bunfig.toml configuré
- [ ] TypeScript configuré avec paths aliases
- [ ] ESLint + Prettier configurés
- [ ] .gitignore et .env.example créés

**Tâches techniques:**
```bash
mkdir etnostyles && cd etnostyles
bun init -y
mkdir -p apps/api apps/web packages/db packages/shared packages/config packages/email
```

---

### Story 0.2: Setup Database Schema

**En tant que** développeur
**Je veux** un schéma PostgreSQL avec Drizzle ORM
**Afin de** avoir une base de données typée et versionnée

**Critères d'acceptation:**
- [ ] Package db créé avec Drizzle config
- [ ] Schema tenants avec colonnes de base
- [ ] Schema users avec rôles
- [ ] Schema campaigns avec branding
- [ ] Schema questions (170 questions)
- [ ] Schema responses (réponses questionnaire)
- [ ] Schema profiles (résultats calculés)
- [ ] Migrations générées et exécutables
- [ ] docker-compose.yml pour PostgreSQL local

**Schema de base:**
```typescript
// tenants, users, campaigns, questions, responses, profiles
```

---

### Story 0.3: Setup Backend API

**En tant que** développeur
**Je veux** un serveur Elysia configuré
**Afin de** avoir une API type-safe et performante

**Critères d'acceptation:**
- [ ] Elysia installé avec plugins (cors, swagger, jwt)
- [ ] Structure routes/ services/ middleware/ lib/
- [ ] Connexion Drizzle fonctionnelle
- [ ] Swagger auto-généré sur /swagger
- [ ] Health check endpoint /health
- [ ] Error handling global configuré
- [ ] Logger configuré

---

### Story 0.4: Setup Frontend App

**En tant que** développeur
**Je veux** une app React 19 avec Vite configurée
**Afin de** avoir un frontend moderne et performant

**Critères d'acceptation:**
- [ ] Vite + React 19 + TypeScript configurés
- [ ] Tailwind CSS 4 configuré
- [ ] shadcn/ui initialisé avec thème Ethnostyles
- [ ] React Router v7 configuré
- [ ] TanStack Query configuré
- [ ] Eden Treaty client configuré
- [ ] Structure features/ components/ hooks/ lib/
- [ ] Layout de base (Header, Sidebar, Main)

---

### Story 0.5: Setup Email Service

**En tant que** développeur
**Je veux** un service email avec Resend
**Afin de** envoyer les emails transactionnels (Passeport, résultats)

**Critères d'acceptation:**
- [ ] Package email créé
- [ ] Resend client configuré
- [ ] Template email résultat créé
- [ ] Template email Passeport créé
- [ ] Fonction sendEmail testable
- [ ] Variables d'environnement documentées

---

## Epic 1: Authentication & User Management

**Objectif:** Implémenter l'authentification avec Better Auth et la gestion des utilisateurs.

### Story 1.1: Setup Better Auth

**En tant que** développeur
**Je veux** Better Auth configuré
**Afin de** avoir une authentification sécurisée et self-hosted

**Critères d'acceptation:**
- [ ] Better Auth installé et configuré
- [ ] Session management fonctionnel
- [ ] Cookies sécurisés configurés
- [ ] Middleware d'auth créé
- [ ] Protection CSRF active

---

### Story 1.2: User Registration

**En tant que** nouvel utilisateur admin
**Je veux** créer un compte entreprise
**Afin de** accéder à la plateforme

**Critères d'acceptation:**
- [ ] Page /register avec formulaire (email, password, company name)
- [ ] Validation email format + password strength
- [ ] Création tenant automatique
- [ ] Création user avec rôle admin
- [ ] Email de vérification envoyé
- [ ] Redirect vers /verify-email

---

### Story 1.3: Email Verification

**En tant que** utilisateur nouvellement inscrit
**Je veux** vérifier mon email
**Afin de** activer mon compte

**Critères d'acceptation:**
- [ ] Page /verify-email avec instructions
- [ ] Lien de vérification dans l'email
- [ ] Page /verify/:token valide le token
- [ ] Compte activé après vérification
- [ ] Redirect vers /login avec message succès

---

### Story 1.4: User Login

**En tant que** utilisateur enregistré
**Je veux** me connecter à mon compte
**Afin de** accéder à mes campagnes

**Critères d'acceptation:**
- [ ] Page /login avec email + password
- [ ] Validation inline des champs
- [ ] Message d'erreur si credentials invalides
- [ ] Session créée après login réussi
- [ ] Redirect vers /dashboard
- [ ] "Remember me" optionnel

---

### Story 1.5: Password Reset

**En tant que** utilisateur ayant oublié son mot de passe
**Je veux** réinitialiser mon mot de passe
**Afin de** récupérer l'accès à mon compte

**Critères d'acceptation:**
- [ ] Lien "Mot de passe oublié ?" sur /login
- [ ] Page /forgot-password avec email input
- [ ] Email envoyé avec lien de reset
- [ ] Page /reset-password/:token
- [ ] Nouveau mot de passe validé
- [ ] Redirect vers /login avec message succès

---

### Story 1.6: User Logout

**En tant que** utilisateur connecté
**Je veux** me déconnecter
**Afin de** sécuriser mon compte

**Critères d'acceptation:**
- [ ] Bouton logout dans le header
- [ ] Session invalidée côté serveur
- [ ] Cookies supprimés
- [ ] Redirect vers /login

---

### Story 1.7: Invite Team Member

**En tant que** admin d'une organisation
**Je veux** inviter un collègue
**Afin de** partager l'accès aux campagnes

**Critères d'acceptation:**
- [ ] Page /settings/team avec liste membres
- [ ] Bouton "Inviter un membre"
- [ ] Modal avec email + rôle (Admin/Viewer)
- [ ] Email d'invitation envoyé
- [ ] Lien d'acceptation avec création compte
- [ ] Nouveau membre apparaît dans la liste

---

### Story 1.8: Manage Team Members

**En tant que** admin d'une organisation
**Je veux** gérer les membres de mon équipe
**Afin de** contrôler les accès

**Critères d'acceptation:**
- [ ] Liste des membres avec rôle et statut
- [ ] Dropdown pour changer le rôle
- [ ] Bouton pour révoquer l'accès
- [ ] Confirmation avant suppression
- [ ] Impossibilité de se supprimer soi-même

---

## Epic 2: Organization & Multi-tenancy

**Objectif:** Gérer les organisations (tenants) et assurer l'isolation des données.

### Story 2.1: Organization Settings

**En tant que** admin d'une organisation
**Je veux** configurer les paramètres de mon organisation
**Afin de** personnaliser mon espace

**Critères d'acceptation:**
- [ ] Page /settings/organization
- [ ] Champs : nom, domaine, description
- [ ] Upload logo organisation
- [ ] Sauvegarde avec feedback succès
- [ ] Validation inline

---

### Story 2.2: Organization Branding

**En tant que** admin d'une organisation
**Je veux** définir le branding par défaut
**Afin de** avoir une identité visuelle cohérente

**Critères d'acceptation:**
- [ ] Section branding dans settings
- [ ] Couleur primaire (color picker)
- [ ] Logo uploadable (PNG/SVG, max 2MB)
- [ ] Preview en temps réel
- [ ] Appliqué par défaut aux nouvelles campagnes

---

### Story 2.3: Tenant Data Isolation

**En tant que** développeur
**Je veux** une isolation stricte des données par tenant
**Afin de** garantir la sécurité des données

**Critères d'acceptation:**
- [ ] Middleware Elysia injecte tenant_id
- [ ] Toutes les queries filtrent par tenant_id
- [ ] Row-level security PostgreSQL configuré
- [ ] Tests d'isolation écrits
- [ ] Impossible d'accéder aux données d'un autre tenant

---

### Story 2.4: RGPD Settings

**En tant que** admin d'une organisation
**Je veux** configurer les paramètres RGPD
**Afin de** être conforme à la réglementation

**Critères d'acceptation:**
- [ ] Page /settings/privacy
- [ ] Durée de rétention des données configurable
- [ ] Texte de consentement personnalisable
- [ ] Contact DPO configurable
- [ ] Politique de confidentialité lien

---

### Story 2.5: Data Export (Organization)

**En tant que** admin d'une organisation
**Je veux** exporter toutes mes données
**Afin de** exercer mon droit à la portabilité

**Critères d'acceptation:**
- [ ] Bouton "Exporter toutes mes données" dans settings
- [ ] Export JSON complet (campaigns, responses, profiles)
- [ ] Email avec lien de téléchargement
- [ ] Lien expire après 24h

---

### Story 2.6: Account Deletion

**En tant que** admin d'une organisation
**Je veux** supprimer mon compte et mes données
**Afin de** exercer mon droit à l'oubli

**Critères d'acceptation:**
- [ ] Bouton "Supprimer mon compte" dans settings
- [ ] Modal de confirmation avec saisie "SUPPRIMER"
- [ ] Suppression de toutes les données associées
- [ ] Email de confirmation
- [ ] Données supprimées sous 30 jours

---

## Epic 3: Campaign Management

**Objectif:** Permettre aux admins de créer, configurer et gérer des campagnes de profiling.

### Story 3.1: Campaign List

**En tant que** admin
**Je veux** voir la liste de mes campagnes
**Afin de** gérer mes questionnaires actifs

**Critères d'acceptation:**
- [ ] Page /campaigns avec liste
- [ ] Colonnes : nom, statut, réponses, taux completion, date création
- [ ] Tri par colonne
- [ ] Filtres (statut, période)
- [ ] Recherche par nom
- [ ] Pagination

---

### Story 3.2: Create Campaign - Step 1 Identity

**En tant que** admin
**Je veux** créer une nouvelle campagne
**Afin de** collecter des profils

**Critères d'acceptation:**
- [ ] Bouton "Nouvelle campagne" → /campaigns/new
- [ ] Wizard step 1/3 : Identité
- [ ] Champ nom (requis)
- [ ] Champ description (optionnel)
- [ ] Champ type de campagne (recrutement, équipe, audit, etc.)
- [ ] Bouton "Suivant" vers step 2

---

### Story 3.3: Create Campaign - Step 2 Branding

**En tant que** admin
**Je veux** personnaliser l'apparence de ma campagne
**Afin de** refléter l'identité de mon entreprise

**Critères d'acceptation:**
- [ ] Wizard step 2/3 : Branding
- [ ] Upload logo (optionnel, hérite org par défaut)
- [ ] Couleur primaire (color picker)
- [ ] Message d'introduction (optionnel)
- [ ] Preview en temps réel
- [ ] Boutons "Retour" et "Suivant"

---

### Story 3.4: Create Campaign - Step 3 Preview & Launch

**En tant que** admin
**Je veux** prévisualiser et lancer ma campagne
**Afin de** valider avant diffusion

**Critères d'acceptation:**
- [ ] Wizard step 3/3 : Preview
- [ ] Aperçu mobile du questionnaire
- [ ] Récapitulatif des paramètres
- [ ] Bouton "Créer la campagne"
- [ ] Lien unique généré
- [ ] Bouton "Copier le lien" avec feedback
- [ ] Redirect vers /campaigns/:id

---

### Story 3.5: Campaign Detail View

**En tant que** admin
**Je veux** voir le détail d'une campagne
**Afin de** suivre ses performances

**Critères d'acceptation:**
- [ ] Page /campaigns/:id
- [ ] Header avec nom, statut, lien
- [ ] Métriques principales (réponses, completion, temps moyen)
- [ ] Graphique répartition Mythes
- [ ] Liste des dernières réponses
- [ ] Actions : éditer, dupliquer, archiver

---

### Story 3.6: Edit Campaign

**En tant que** admin
**Je veux** modifier une campagne existante
**Afin de** ajuster les paramètres

**Critères d'acceptation:**
- [ ] Bouton "Modifier" sur campaign detail
- [ ] Formulaire pré-rempli
- [ ] Modification nom, description, branding
- [ ] Le lien ne change pas
- [ ] Sauvegarde avec feedback

---

### Story 3.7: Duplicate Campaign

**En tant que** admin
**Je veux** dupliquer une campagne
**Afin de** réutiliser une configuration

**Critères d'acceptation:**
- [ ] Bouton "Dupliquer" sur campaign detail
- [ ] Nouveau nom suggéré : "[Nom original] (copie)"
- [ ] Nouvelle campagne créée avec mêmes paramètres
- [ ] Nouveau lien unique généré
- [ ] Redirect vers nouvelle campagne

---

### Story 3.8: Archive Campaign

**En tant que** admin
**Je veux** archiver une campagne terminée
**Afin de** garder un historique propre

**Critères d'acceptation:**
- [ ] Bouton "Archiver" sur campaign detail
- [ ] Confirmation requise
- [ ] Campagne marquée archivée
- [ ] Lien devient inactif
- [ ] Visible dans liste avec filtre "Archivées"

---

### Story 3.9: Campaign Link & QR Code

**En tant que** admin
**Je veux** partager le lien de ma campagne facilement
**Afin de** inviter des répondants

**Critères d'acceptation:**
- [ ] Lien affiché en évidence sur campaign detail
- [ ] Bouton "Copier" avec feedback toast
- [ ] QR Code généré automatiquement
- [ ] Bouton "Télécharger QR Code" (PNG)
- [ ] QR Code inclut le branding (couleur)

---

## Epic 4: Questionnaire Experience

**Objectif:** Créer une expérience de questionnaire engageante et fluide pour les répondants.

### Story 4.1: Questionnaire Landing Page

**En tant que** répondant
**Je veux** comprendre ce que je vais faire
**Afin de** décider de participer

**Critères d'acceptation:**
- [ ] Page /q/:campaignSlug
- [ ] Logo et branding de la campagne
- [ ] Titre accrocheur : "Découvre ton Mythe"
- [ ] Description courte (170 questions, ~10 min)
- [ ] Bouton CTA "Commencer"
- [ ] Design mobile-first

---

### Story 4.2: RGPD Consent

**En tant que** répondant
**Je veux** donner mon consentement éclairé
**Afin de** participer en connaissance de cause

**Critères d'acceptation:**
- [ ] Modal/page consentement après clic "Commencer"
- [ ] Texte clair sur utilisation des données
- [ ] Checkbox "J'accepte" (requis)
- [ ] Lien vers politique de confidentialité
- [ ] Bouton "Continuer" (désactivé sans checkbox)
- [ ] Consentement loggé avec timestamp

---

### Story 4.3: Email Collection

**En tant que** système
**Je veux** collecter l'email du répondant
**Afin de** envoyer le Passeport et les résultats

**Critères d'acceptation:**
- [ ] Page après consentement
- [ ] Champ email (requis)
- [ ] Validation format email
- [ ] Message : "Pour recevoir ton Passeport"
- [ ] Bouton "Commencer le questionnaire"
- [ ] Email stocké pour envoi ultérieur

---

### Story 4.4: Question Display

**En tant que** répondant
**Je veux** répondre aux questions une par une
**Afin de** compléter le questionnaire

**Critères d'acceptation:**
- [ ] Composant QuestionCard full-screen
- [ ] Question texte centré
- [ ] Options de réponse (échelle 1-5 ou choix)
- [ ] Tap/clic sur option = sélection
- [ ] Transition fluide vers question suivante
- [ ] < 200ms entre questions

---

### Story 4.5: Progress Bar

**En tant que** répondant
**Je veux** voir ma progression
**Afin de** savoir combien il reste

**Critères d'acceptation:**
- [ ] ProgressBar en haut de l'écran
- [ ] Pourcentage affiché (ex: 42%)
- [ ] Questions restantes (ex: "58 restantes")
- [ ] Animation fluide à chaque réponse
- [ ] Markers visuels pour Q50, Q100, Q150

---

### Story 4.6: Milestone Celebrations

**En tant que** répondant
**Je veux** être encouragé aux paliers
**Afin de** rester motivé

**Critères d'acceptation:**
- [ ] Animation à Q50 : "Déjà à mi-chemin !"
- [ ] Animation à Q100 : "Ton Mythe se dessine..."
- [ ] Animation à Q150 : "Sprint final ! Plus que 20..."
- [ ] Animations 2-3 sec max
- [ ] Respect prefers-reduced-motion
- [ ] Skip possible (tap to continue)

---

### Story 4.7: Auto-Save Progress

**En tant que** répondant
**Je veux** que mes réponses soient sauvegardées
**Afin de** ne pas perdre ma progression

**Critères d'acceptation:**
- [ ] Chaque réponse sauvegardée immédiatement
- [ ] Stockage local + API async
- [ ] Session ID dans URL
- [ ] Reprise possible via même URL
- [ ] Indicateur discret "Sauvegardé"

---

### Story 4.8: Resume Questionnaire

**En tant que** répondant ayant interrompu
**Je veux** reprendre où j'en étais
**Afin de** ne pas recommencer

**Critères d'acceptation:**
- [ ] Détection session existante à l'ouverture
- [ ] Message "Reprendre où tu t'es arrêté ?"
- [ ] Bouton "Reprendre" → question courante
- [ ] Bouton "Recommencer" → reset (avec confirmation)
- [ ] Progression restaurée

---

### Story 4.9: Mobile Optimization

**En tant que** répondant sur mobile
**Je veux** une expérience optimisée
**Afin de** répondre confortablement

**Critères d'acceptation:**
- [ ] Layout 100dvh (full viewport)
- [ ] Touch targets 48px minimum
- [ ] Swipe gesture supporté (optionnel)
- [ ] Pas de scroll horizontal
- [ ] Font size 16px minimum
- [ ] Testé sur iPhone et Android

---

### Story 4.10: Offline Tolerance

**En tant que** répondant avec connexion instable
**Je veux** pouvoir continuer malgré des coupures
**Afin de** ne pas perdre mes réponses

**Critères d'acceptation:**
- [ ] Réponses stockées localement d'abord
- [ ] Sync avec API quand connexion disponible
- [ ] Message "Mode hors-ligne" si déconnecté
- [ ] Pas de blocage si API indisponible temporairement
- [ ] Sync automatique à la reconnexion

---

## Epic 5: Profile & Results

**Objectif:** Calculer et afficher le profil Mythe de façon mémorable.

### Story 5.1: Profile Calculation

**En tant que** système
**Je veux** calculer le profil Ethnostyles
**Afin de** déterminer le Mythe du répondant

**Critères d'acceptation:**
- [ ] Service scoring.service.ts
- [ ] Algorithme basé sur les 170 réponses
- [ ] Calcul des scores pour les 8 Mythes
- [ ] Détermination du Mythe principal
- [ ] Calcul en < 3 secondes
- [ ] Résultat stocké en DB

---

### Story 5.2: Calculation Animation

**En tant que** répondant
**Je veux** une animation pendant le calcul
**Afin de** patienter agréablement

**Critères d'acceptation:**
- [ ] Animation engageante (2-3 sec)
- [ ] Messages progressifs ("Analyse en cours...", "Ton Mythe émerge...")
- [ ] Design cohérent avec branding
- [ ] Transition fluide vers reveal

---

### Story 5.3: Myth Reveal

**En tant que** répondant
**Je veux** découvrir mon Mythe de façon mémorable
**Afin de** vivre un moment fort

**Critères d'acceptation:**
- [ ] Composant MythReveal
- [ ] Animation cinématique (fade, typing effect)
- [ ] Nom du Mythe en grand (Playfair 48px)
- [ ] Sous-titre évocateur
- [ ] Gradient background dynamique
- [ ] Respect prefers-reduced-motion

---

### Story 5.4: Profile Description

**En tant que** répondant
**Je veux** lire la description de mon profil
**Afin de** me reconnaître

**Critères d'acceptation:**
- [ ] Description détaillée du Mythe (200-300 mots)
- [ ] Points forts
- [ ] Valeurs clés
- [ ] Style de communication
- [ ] Scroll fluide après reveal
- [ ] Ton personnel, pas clinique

---

### Story 5.5: Passport Code Display

**En tant que** répondant
**Je veux** recevoir mon code Passeport
**Afin de** garder mon profil

**Critères d'acceptation:**
- [ ] Composant PassportCard
- [ ] Code format ETH-XXX-XXXX (mémorable)
- [ ] Bouton "Copier" avec feedback
- [ ] Design premium (border, shadow)
- [ ] Message explicatif sur l'utilité
- [ ] Bouton "Partager"

---

### Story 5.6: Email Results

**En tant que** répondant
**Je veux** recevoir mes résultats par email
**Afin de** les conserver

**Critères d'acceptation:**
- [ ] Email envoyé automatiquement après calcul
- [ ] Contient le nom du Mythe
- [ ] Contient le code Passeport
- [ ] Lien vers la page résultat
- [ ] Design soigné (template email)
- [ ] Envoi via Resend

---

### Story 5.7: Social Sharing

**En tant que** répondant
**Je veux** partager mon Mythe
**Afin de** le montrer à mes proches

**Critères d'acceptation:**
- [ ] Bouton "Partager" sur la page résultat
- [ ] Partage LinkedIn avec image optimisée
- [ ] Partage Twitter/X
- [ ] Copier lien de partage
- [ ] Image OG générée (1200x630)
- [ ] Message pré-rempli personnalisable

---

## Epic 6: Dashboard & Analytics

**Objectif:** Fournir aux admins des insights actionnables sur leurs campagnes.

### Story 6.1: Main Dashboard

**En tant que** admin
**Je veux** voir un aperçu de mon activité
**Afin de** comprendre mes performances globales

**Critères d'acceptation:**
- [ ] Page /dashboard (home après login)
- [ ] KPIs globaux : profils totaux, ce mois, taux moyen
- [ ] Graphique évolution dans le temps
- [ ] Liste campagnes actives
- [ ] Quick actions (nouvelle campagne)

---

### Story 6.2: Campaign Dashboard

**En tant que** admin
**Je veux** voir les stats d'une campagne
**Afin de** suivre ses performances

**Critères d'acceptation:**
- [ ] Section dashboard sur /campaigns/:id
- [ ] Métriques : réponses, completion, temps moyen
- [ ] Graphique répartition des 8 Mythes (pie/bar)
- [ ] Évolution dans le temps
- [ ] Filtres par période

---

### Story 6.3: Real-time Updates

**En tant que** admin
**Je veux** voir les stats en temps réel
**Afin de** suivre une campagne active

**Critères d'acceptation:**
- [ ] SSE endpoint /campaigns/:id/stats/stream
- [ ] Dashboard se met à jour automatiquement
- [ ] Indicateur "Live" visible
- [ ] Nouvelle réponse = animation subtle
- [ ] Pas de refresh nécessaire

---

### Story 6.4: Myth Distribution Chart

**En tant que** admin
**Je veux** voir la répartition des Mythes
**Afin de** comprendre ma population

**Critères d'acceptation:**
- [ ] Graphique circulaire ou barres
- [ ] 8 segments (un par Mythe)
- [ ] Couleurs distinctives
- [ ] Pourcentages affichés
- [ ] Tooltip avec détails au hover
- [ ] Export image possible

---

### Story 6.5: Response List

**En tant que** admin
**Je veux** voir la liste des répondants
**Afin de** explorer les données

**Critères d'acceptation:**
- [ ] Table avec : email (masqué partiellement), Mythe, date, temps
- [ ] Tri par colonne
- [ ] Recherche par email
- [ ] Filtres par Mythe, période
- [ ] Pagination
- [ ] Clic → détail profil

---

### Story 6.6: Individual Profile View

**En tant que** admin
**Je veux** voir le profil détaillé d'un répondant
**Afin de** comprendre son résultat

**Critères d'acceptation:**
- [ ] Page /campaigns/:id/profiles/:profileId
- [ ] Mythe principal avec description
- [ ] Scores des 8 Mythes (radar chart)
- [ ] Métadonnées (date, temps, device)
- [ ] Bouton export PDF

---

### Story 6.7: Benchmark Comparison

**En tant que** admin
**Je veux** comparer mes résultats au benchmark national
**Afin de** situer ma population

**Critères d'acceptation:**
- [ ] Toggle "Comparer au benchmark" sur les charts
- [ ] Overlay benchmark national (2000 personnes)
- [ ] Écarts mis en évidence
- [ ] Légende explicative
- [ ] Données benchmark en DB

---

### Story 6.8: Dashboard Filters

**En tant que** admin
**Je veux** filtrer les données du dashboard
**Afin de** analyser des segments spécifiques

**Critères d'acceptation:**
- [ ] Filtre par période (7j, 30j, 90j, custom)
- [ ] Filtre par Mythe
- [ ] Filtre par champ custom (si configuré)
- [ ] Filtres persistants dans URL
- [ ] Reset filters button

---

## Epic 7: Export & Data

**Objectif:** Permettre l'export des données pour analyse externe.

### Story 7.1: Export CSV

**En tant que** admin
**Je veux** exporter les résultats en CSV
**Afin de** analyser dans Excel/BI

**Critères d'acceptation:**
- [ ] Bouton "Exporter CSV" sur campaign dashboard
- [ ] Modal de sélection colonnes
- [ ] Colonnes : email, mythe, scores, date, metadata
- [ ] Génération en background si > 1000 lignes
- [ ] Download automatique
- [ ] Encodage UTF-8 avec BOM

---

### Story 7.2: Export Excel

**En tant que** admin
**Je veux** exporter en Excel
**Afin de** avoir un format plus riche

**Critères d'acceptation:**
- [ ] Option "Format Excel" dans export
- [ ] Fichier .xlsx généré
- [ ] Colonnes formatées
- [ ] Onglet récapitulatif avec stats
- [ ] Download automatique

---

### Story 7.3: Export PDF Profile

**En tant que** admin
**Je veux** exporter un profil en PDF
**Afin de** le partager/imprimer

**Critères d'acceptation:**
- [ ] Bouton "PDF" sur profil individuel
- [ ] PDF généré côté serveur
- [ ] Contient : Mythe, description, radar chart
- [ ] Branding organisation
- [ ] Download automatique

---

### Story 7.4: Scheduled Export

**En tant que** admin
**Je veux** programmer des exports automatiques
**Afin de** recevoir les données régulièrement

**Critères d'acceptation:**
- [ ] Option "Export automatique" dans settings campagne
- [ ] Fréquence : quotidien, hebdo, mensuel
- [ ] Email avec lien de téléchargement
- [ ] Format configurable (CSV/Excel)
- [ ] Désactivation possible

---

### Story 7.5: Data Anonymization

**En tant que** admin
**Je veux** exporter des données anonymisées
**Afin de** faire des études sans données personnelles

**Critères d'acceptation:**
- [ ] Option "Export anonymisé" dans export
- [ ] Emails remplacés par IDs
- [ ] Données personnelles supprimées
- [ ] Profils agrégés possibles
- [ ] Warning affiché

---

## Epic 8: Passeport System

**Objectif:** Permettre la réutilisation du profil via le code Passeport.

### Story 8.1: Passport Code Generation

**En tant que** système
**Je veux** générer des codes Passeport uniques
**Afin de** identifier les profils

**Critères d'acceptation:**
- [ ] Format ETH-XXX-XXXX (lettres + chiffres)
- [ ] Unicité garantie
- [ ] Stocké en DB avec profil
- [ ] Non séquentiel (sécurité)
- [ ] Checksum pour validation

---

### Story 8.2: Passport Verification

**En tant que** répondant avec Passeport
**Je veux** utiliser mon code existant
**Afin de** ne pas refaire le questionnaire

**Critères d'acceptation:**
- [ ] Option "J'ai déjà un code" sur landing
- [ ] Champ de saisie du code
- [ ] Validation format + existence
- [ ] Si valide → récupération profil
- [ ] Profil associé à la nouvelle campagne
- [ ] Message de bienvenue personnalisé

---

### Story 8.3: Skip Questionnaire

**En tant que** répondant avec Passeport valide
**Je veux** accéder directement à mes résultats
**Afin de** gagner du temps

**Critères d'acceptation:**
- [ ] Passeport validé → skip questionnaire
- [ ] Page résultat affichée immédiatement
- [ ] Réponse enregistrée pour la campagne
- [ ] Admin voit le profil dans les stats
- [ ] Email optionnel (déjà connu)

---

### Story 8.4: Passport Recovery

**En tant que** répondant ayant perdu son code
**Je veux** récupérer mon Passeport
**Afin de** le réutiliser

**Critères d'acceptation:**
- [ ] Lien "Code perdu ?" sur saisie Passeport
- [ ] Saisie email
- [ ] Si email trouvé → envoi du code
- [ ] Si non trouvé → message explicatif
- [ ] Rate limiting (anti-abus)

---

### Story 8.5: Passport History

**En tant que** répondant
**Je veux** voir l'historique de mon Passeport
**Afin de** savoir où il a été utilisé

**Critères d'acceptation:**
- [ ] Page /passport/:code (accessible avec le code)
- [ ] Liste des campagnes participées
- [ ] Dates de participation
- [ ] Bouton "Supprimer mes données" (RGPD)
- [ ] Authentification par code (pas de compte)

---

### Story 8.6: Passport Data Deletion

**En tant que** répondant
**Je veux** supprimer mes données
**Afin de** exercer mon droit à l'oubli

**Critères d'acceptation:**
- [ ] Bouton "Supprimer mes données" sur /passport/:code
- [ ] Confirmation par email
- [ ] Lien de confirmation dans l'email
- [ ] Suppression de toutes les réponses et profils
- [ ] Code Passeport invalidé
- [ ] Confirmation finale

---

## Epic 9: API & Integrations

**Objectif:** Fournir une API REST pour les intégrations tierces.

### Story 9.1: API Key Management

**En tant que** admin
**Je veux** générer des clés API
**Afin de** intégrer Ethnostyles à mes outils

**Critères d'acceptation:**
- [ ] Page /settings/api
- [ ] Bouton "Générer une clé"
- [ ] Clé affichée une seule fois
- [ ] Liste des clés avec nom et date
- [ ] Bouton révoquer
- [ ] Rate limit affiché

---

### Story 9.2: API Authentication

**En tant que** développeur externe
**Je veux** m'authentifier à l'API
**Afin de** accéder aux données

**Critères d'acceptation:**
- [ ] Header Authorization: Bearer {api_key}
- [ ] Validation de la clé
- [ ] Extraction du tenant_id
- [ ] Rate limiting appliqué
- [ ] Erreur 401 si invalide

---

### Story 9.3: GET Profiles Endpoint

**En tant que** développeur externe
**Je veux** récupérer les profils
**Afin de** les intégrer à mon CRM

**Critères d'acceptation:**
- [ ] GET /api/v1/profiles
- [ ] Filtres : campaign_id, myth, date_from, date_to
- [ ] Pagination : limit, offset
- [ ] Response : array de profils avec scores
- [ ] Documentation Swagger

---

### Story 9.4: GET Campaigns Endpoint

**En tant que** développeur externe
**Je veux** lister mes campagnes
**Afin de** les gérer programmatiquement

**Critères d'acceptation:**
- [ ] GET /api/v1/campaigns
- [ ] GET /api/v1/campaigns/:id
- [ ] Inclut stats de base
- [ ] Documentation Swagger

---

### Story 9.5: Webhooks Configuration

**En tant que** admin
**Je veux** configurer des webhooks
**Afin de** être notifié des nouveaux profils

**Critères d'acceptation:**
- [ ] Page /settings/webhooks
- [ ] Ajouter webhook URL
- [ ] Sélection événements (profile.created, etc.)
- [ ] Test webhook (ping)
- [ ] Logs des appels
- [ ] Retry automatique (3x avec backoff)

---

### Story 9.6: API Documentation

**En tant que** développeur externe
**Je veux** une documentation complète
**Afin de** intégrer facilement

**Critères d'acceptation:**
- [ ] Swagger UI sur /api/docs
- [ ] Tous endpoints documentés
- [ ] Exemples de requêtes/réponses
- [ ] Authentification expliquée
- [ ] Rate limits documentés
- [ ] Changelog des versions

---

## Epic 10: Team & Manager Features

**Objectif:** Fonctionnalités spécifiques pour les managers et la gestion d'équipe.

### Story 10.1: Team Campaign Type

**En tant que** manager
**Je veux** créer une campagne "Équipe"
**Afin de** profiler mes collaborateurs

**Critères d'acceptation:**
- [ ] Type "Équipe" dans création campagne
- [ ] Champs spécifiques : nom équipe, département
- [ ] Invitation par liste d'emails
- [ ] Dashboard équipe dédié

---

### Story 10.2: Team Composition View

**En tant que** manager
**Je veux** voir la composition culturelle de mon équipe
**Afin de** comprendre les dynamiques

**Critères d'acceptation:**
- [ ] Visualisation des Mythes de l'équipe
- [ ] Radar chart global équipe
- [ ] Liste membres avec leur Mythe
- [ ] Identification profils similaires/complémentaires

---

### Story 10.3: Management Recommendations

**En tant que** manager
**Je veux** des conseils de management
**Afin de** adapter mon style

**Critères d'acceptation:**
- [ ] Section "Recommandations" sur dashboard équipe
- [ ] Tips par Mythe présent dans l'équipe
- [ ] Guide de communication adapté
- [ ] Points d'attention (conflits potentiels)

---

### Story 10.4: Manager Role

**En tant que** admin
**Je veux** créer des utilisateurs "Manager"
**Afin de** leur donner accès à leur équipe uniquement

**Critères d'acceptation:**
- [ ] Nouveau rôle "Manager" dans invite
- [ ] Manager voit uniquement ses campagnes équipe
- [ ] Pas d'accès aux settings organisation
- [ ] Dashboard restreint à son scope

---

## Epic 11: Advanced Analytics

**Objectif:** Analytics avancés pour les directions et cas d'usage spéciaux.

### Story 11.1: Organization Culture Map

**En tant que** direction
**Je veux** voir la culture globale de l'entreprise
**Afin de** piloter la transformation

**Critères d'acceptation:**
- [ ] Dashboard /analytics/culture
- [ ] Agrégation de toutes les campagnes internes
- [ ] Répartition globale des Mythes
- [ ] Breakdown par département/BU
- [ ] Évolution dans le temps

---

### Story 11.2: Culture Gap Analysis

**En tant que** direction
**Je veux** comparer culture actuelle vs souhaitée
**Afin de** identifier les écarts

**Critères d'acceptation:**
- [ ] Configuration "Culture cible"
- [ ] Visualisation écart actuel/cible
- [ ] Identification des gaps prioritaires
- [ ] Recommandations de recrutement

---

### Story 11.3: Recruitment Fit View

**En tant que** DRH
**Je veux** voir le fit culturel des candidats
**Afin de** améliorer mes recrutements

**Critères d'acceptation:**
- [ ] Dashboard recrutement
- [ ] Profil candidat vs profil équipe cible
- [ ] Visualisation compatibilité (pas de score)
- [ ] Historique des recrutements

---

### Story 11.4: Trend Analysis

**En tant que** direction
**Je veux** voir l'évolution culturelle
**Afin de** mesurer l'impact de mes actions

**Critères d'acceptation:**
- [ ] Graphique évolution Mythes dans le temps
- [ ] Comparaison périodes
- [ ] Détection tendances
- [ ] Export rapport périodique

---

## Implementation Notes

### Technical Dependencies

| Story | Dépend de |
|-------|-----------|
| 1.* | 0.* (Foundation) |
| 2.* | 1.* (Auth) |
| 3.* | 2.* (Organization) |
| 4.* | 3.* (Campaigns) + 0.3 (API) |
| 5.* | 4.* (Questionnaire) |
| 6.* | 5.* (Profiles) |
| 7.* | 6.* (Dashboard) |
| 8.* | 5.* (Profiles) |
| 9.* | 1.* (Auth) + 5.* (Profiles) |
| 10.* | 6.* (Dashboard) |
| 11.* | 6.* (Dashboard) + 10.* (Team) |

### Sprint Suggestion

**Sprint 1 (2 semaines):** Epic 0 + Epic 1 (Stories 1.1-1.6)
**Sprint 2 (2 semaines):** Epic 1 (fin) + Epic 2 + Epic 3 (Stories 3.1-3.4)
**Sprint 3 (2 semaines):** Epic 3 (fin) + Epic 4
**Sprint 4 (2 semaines):** Epic 5 + Epic 6 (Stories 6.1-6.4)
**Sprint 5 (2 semaines):** Epic 6 (fin) + Epic 7
**Sprint 6 (2 semaines):** Epic 8 + Epic 9
**Sprint 7+ :** Epic 10 + Epic 11

---

**Document généré le 2026-01-25**
**Total: 12 Epics, 78 Stories**
**Status: Prêt pour Sprint Planning**
