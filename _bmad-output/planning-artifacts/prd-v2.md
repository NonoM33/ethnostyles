---
stepsCompleted: ['init', 'personas', 'journeys', 'features', 'requirements']
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/product-brief-etnostyles-2026-01-23.md'
  - '_bmad-output/planning-artifacts/research/market-concurrence-profiling-culturel-2026-01-25.md'
workflowType: 'prd'
version: '2.0'
date: 2026-01-25
author: Renaud.cosson-ext
status: complete
---

# Product Requirements Document - Ethnostyles Profiler v2

**Author:** Renaud.cosson-ext
**Date:** 2026-01-25
**Version:** 2.0 - SaaS Complet Multi-Personas
**Status:** Complet

---

## Executive Summary

**Ethnostyles Profiler v2** est une plateforme SaaS B2B complète de profiling culturel permettant aux entreprises de comprendre, mapper et actionner les profils de valeurs de leurs collaborateurs, candidats et clients via un questionnaire de 170 questions basé sur les 8 Mythes Ethnostyles.

### Vision v2: SaaS Ultra-Complet

La v2 étend la plateforme à **tous les cas d'usage RH et Management** avec 10 personas distincts et des fonctionnalités avancées pour chaque segment.

| Cible | Use Case Principal | Valeur |
|-------|-------------------|--------|
| **DRH / Talent Acquisition** | Recrutement, culture fit | Réduire turnover, objectiver le fit |
| **Managers** | Adapter style management | Améliorer engagement équipe |
| **Responsable L&D** | Personnaliser formation | ROI formation optimisé |
| **HRBP** | Accompagnement individuel | Coaching ciblé |
| **Coach interne/externe** | Diagnostic profil | Base objective pour coaching |
| **Direction / COMEX** | Culture d'entreprise | Piloter transformation |
| **Succession Planning** | Identifier hauts potentiels | Fit culturel postes clés |
| **Change Manager** | Conduite du changement | Identifier résistances/leviers |
| **M&A / Due Diligence** | Fusion-acquisition | Compatibilité culturelle |
| **Candidat / Collaborateur** | Passeport culturel | Se positionner, trouver son fit |

**North Star Metric:** Nombre de profils actifs dans le système (incluant réutilisation Passeport)

---

## Target Users & Personas

### Persona 1: DRH / Talent Acquisition

| Attribut | Détail |
|----------|--------|
| **Rôle** | Directeur/Responsable des Ressources Humaines |
| **Entreprise** | ETI et Grands Groupes (500+ employés) |
| **Responsabilités** | Recrutement, culture d'entreprise, engagement, onboarding |
| **Frustration** | "On recrute des gens compétents qui partent après 8 mois. Le culture fit est basé sur l'intuition." |
| **Objectif** | Objectiver le fit culturel, personnaliser l'onboarding, réduire le turnover |
| **KPI** | Turnover 1ère année, time-to-productivity, eNPS |

**Jobs-to-be-Done:**
- Quand je recrute un candidat, je veux connaître son profil culturel pour adapter son intégration
- Quand j'onboarde un nouveau, je veux personnaliser son parcours selon son Mythe
- Quand j'audite la culture, je veux des données objectives sur les valeurs de l'entreprise

---

### Persona 2: Manager d'Équipe

| Attribut | Détail |
|----------|--------|
| **Rôle** | Manager, Team Lead, Chef de projet |
| **Entreprise** | Tout type, équipe de 5-20 personnes |
| **Responsabilités** | Performance équipe, engagement, développement collaborateurs |
| **Frustration** | "Je manage tout le monde de la même façon mais ça ne marche pas avec tous." |
| **Objectif** | Adapter son style de management à chaque profil, optimiser la composition d'équipe |
| **KPI** | Engagement équipe, performance, satisfaction |

**Jobs-to-be-Done:**
- Quand je manage mon équipe, je veux connaître le profil de chacun pour adapter ma communication
- Quand je compose une équipe projet, je veux des profils complémentaires
- Quand je fais un 1-1, je veux des insights sur les motivations profondes

---

### Persona 3: Responsable L&D (Learning & Development)

| Attribut | Détail |
|----------|--------|
| **Rôle** | Responsable Formation, Learning Manager |
| **Entreprise** | ETI et Grands Groupes avec département formation |
| **Responsabilités** | Parcours de formation, montée en compétences, ROI formation |
| **Frustration** | "Les formations one-size-fits-all ont peu d'impact. Le ROI est difficile à prouver." |
| **Objectif** | Personnaliser les parcours formation selon le style d'apprentissage culturel |
| **KPI** | ROI formation, completion rate, application terrain |

**Jobs-to-be-Done:**
- Quand je conçois un parcours, je veux l'adapter aux styles d'apprentissage des participants
- Quand je mesure l'impact, je veux corréler profil et efficacité formation

---

### Persona 4: HRBP (HR Business Partner)

| Attribut | Détail |
|----------|--------|
| **Rôle** | HR Business Partner, RRH |
| **Entreprise** | ETI et Grands Groupes |
| **Responsabilités** | Accompagnement managers, développement carrière, médiation |
| **Frustration** | "Je manque d'outils objectifs pour accompagner les collaborateurs et managers." |
| **Objectif** | Avoir des données fiables pour le coaching et l'accompagnement individuel |
| **KPI** | Satisfaction managers accompagnés, mobilité interne réussie |

**Jobs-to-be-Done:**
- Quand j'accompagne un manager, je veux lui montrer le profil de son équipe
- Quand je fais une médiation, je veux comprendre les différences culturelles en jeu
- Quand je prépare une mobilité, je veux évaluer le fit culturel avec le nouveau poste

---

### Persona 5: Coach Interne/Externe

| Attribut | Détail |
|----------|--------|
| **Rôle** | Coach professionnel, Consultant RH |
| **Entreprise** | Indépendant ou cabinet conseil |
| **Responsabilités** | Coaching individuel et collectif, développement leadership |
| **Frustration** | "Les tests existants (MBTI, DISC) sont connus et attendus. Je cherche un outil différenciant." |
| **Objectif** | Avoir un outil de diagnostic culturel unique pour enrichir ses accompagnements |
| **KPI** | Satisfaction coachés, renouvellement missions |

**Jobs-to-be-Done:**
- Quand je démarre un coaching, je veux un diagnostic profond des valeurs du coaché
- Quand je fais du coaching d'équipe, je veux visualiser les dynamiques culturelles
- Quand je propose mes services, je veux un outil différenciant vs la concurrence

---

### Persona 6: Direction / COMEX

| Attribut | Détail |
|----------|--------|
| **Rôle** | DG, Directeur de BU, Membre COMEX |
| **Entreprise** | ETI et Grands Groupes |
| **Responsabilités** | Vision stratégique, transformation, culture d'entreprise |
| **Frustration** | "Je parle de culture mais je n'ai aucune donnée objective. C'est du ressenti." |
| **Objectif** | Piloter la culture d'entreprise avec des données, mesurer l'évolution |
| **KPI** | Alignement culture/stratégie, engagement global |

**Jobs-to-be-Done:**
- Quand je pilote une transformation, je veux mesurer la culture actuelle vs souhaitée
- Quand je fais un COMEX, je veux des données sur l'état culturel de l'entreprise
- Quand je communique sur la culture, je veux m'appuyer sur des faits

---

### Persona 7: Responsable Succession Planning

| Attribut | Détail |
|----------|--------|
| **Rôle** | Responsable GPEC, Talent Manager |
| **Entreprise** | Grands Groupes |
| **Responsabilités** | Identifier hauts potentiels, préparer succession, pipeline leadership |
| **Frustration** | "On promeut sur les compétences techniques mais on échoue sur le leadership." |
| **Objectif** | Évaluer le fit culturel des successeurs potentiels avec les postes cibles |
| **KPI** | Taux de réussite des promotions, rétention hauts potentiels |

**Jobs-to-be-Done:**
- Quand j'identifie des hauts potentiels, je veux évaluer leur fit culturel leadership
- Quand je prépare une succession, je veux comparer profil successeur vs titulaire actuel
- Quand je construis un pipeline, je veux diversifier les profils culturels

---

### Persona 8: Change Manager

| Attribut | Détail |
|----------|--------|
| **Rôle** | Responsable Conduite du Changement, Consultant Transformation |
| **Entreprise** | ETI, Grands Groupes, Cabinets conseil |
| **Responsabilités** | Accompagner les transformations, gérer les résistances |
| **Frustration** | "Les résistances au changement sont imprévisibles. Je ne sais pas qui sera moteur ou frein." |
| **Objectif** | Cartographier les profils pour anticiper résistances et identifier les ambassadeurs |
| **KPI** | Adoption du changement, vitesse de transformation |

**Jobs-to-be-Done:**
- Quand je lance une transformation, je veux identifier les profils moteurs vs freins
- Quand je construis un réseau d'ambassadeurs, je veux cibler les bons profils
- Quand je communique sur le changement, je veux adapter le message par profil

---

### Persona 9: M&A / Due Diligence

| Attribut | Détail |
|----------|--------|
| **Rôle** | Directeur M&A, Responsable Intégration |
| **Entreprise** | Grands Groupes, Fonds d'investissement |
| **Responsabilités** | Évaluer les cibles, piloter l'intégration post-acquisition |
| **Frustration** | "50% des M&A échouent pour raisons culturelles. On ne mesure jamais la culture avant." |
| **Objectif** | Évaluer la compatibilité culturelle avant/pendant l'intégration |
| **KPI** | Succès intégration, rétention talents clés post-M&A |

**Jobs-to-be-Done:**
- Quand j'évalue une cible, je veux comparer sa culture à la nôtre
- Quand je pilote une intégration, je veux identifier les points de friction culturelle
- Quand je présente au board, je veux des données sur le risque culturel

---

### Persona 10: Candidat / Collaborateur

| Attribut | Détail |
|----------|--------|
| **Rôle** | Candidat en recrutement, Collaborateur en poste |
| **Entreprise** | N/A (utilisateur final) |
| **Responsabilités** | Trouver un emploi épanouissant, se développer |
| **Frustration** | "Je ne sais pas quelle entreprise me correspond vraiment. Les values affichées sont marketing." |
| **Objectif** | Connaître son profil, trouver un environnement aligné, capitaliser sur son Passeport |
| **KPI** | Satisfaction au travail, engagement, durée en poste |

**Jobs-to-be-Done:**
- Quand je cherche un emploi, je veux montrer mon profil authentique au-delà du CV
- Quand je rejoins une entreprise, je veux savoir si la culture me correspond
- Quand je change d'entreprise, je veux réutiliser mon Passeport

---

## User Journeys

### Journey 1: Recrutement Personnalisé (DRH)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ RECRUTEMENT PERSONNALISÉ                                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. DÉFINIR          2. PROFILER         3. COMPARER        4. ONBOARDER   │
│  ─────────           ─────────           ─────────          ───────────    │
│  Culture             Candidats           Fit culturel       Parcours       │
│  équipe cible        shortlistés         visualisé          personnalisé   │
│                                                                             │
│  DRH profile         Candidat fait       DRH voit           Onboarding     │
│  l'équipe            le test             compatibilité      adapté au      │
│  existante           (10 min)            (pas scoring)      Mythe          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Outcome:** Réduction turnover 1ère année de 30%

---

### Journey 2: Management Adaptatif (Manager)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ MANAGEMENT ADAPTATIF                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. CARTOGRAPHIER    2. COMPRENDRE      3. ADAPTER         4. SUIVRE       │
│  ─────────────       ───────────        ────────           ────────        │
│  Profiler            Voir les           Recommandations    Dashboard       │
│  toute l'équipe      Mythes             management         équipe          │
│                                                                             │
│  Manager lance       Visualisation      "Pour un           Évolution       │
│  campagne            équipe             Explorateur,       engagement      │
│  équipe              interactive        donnez autonomie"                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Outcome:** +20% engagement équipe

---

### Journey 3: Formation Personnalisée (L&D)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ FORMATION PERSONNALISÉE                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. PROFILER         2. SEGMENTER       3. ADAPTER         4. MESURER      │
│  ─────────           ──────────         ────────           ────────        │
│  Participants        Par style          Parcours           ROI par         │
│  formation           apprentissage      modulaire          profil          │
│                                                                             │
│  Avant               "Sages" =          Même contenu,      Corréler        │
│  inscription         théorie first      formats            profil ×        │
│                      "Héros" =          différents         efficacité      │
│                      practice first                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Outcome:** +40% application terrain

---

### Journey 4: Coaching Profond (Coach)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ COACHING PROFOND                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. DIAGNOSTIQUER    2. EXPLORER        3. ACCOMPAGNER     4. TRANSFORMER  │
│  ─────────────       ─────────          ────────────       ────────────    │
│  Test avant          Débriefing         Sessions           Re-test         │
│  1ère session        profil             adaptées           optionnel       │
│                                                                             │
│  Coaché fait         "Votre Mythe       Exercices          Mesurer         │
│  questionnaire       Gardien            ciblés             évolution       │
│                      explique..."       par profil                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Outcome:** Coaching plus ciblé et efficace

---

### Journey 5: Transformation Culturelle (Direction)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ TRANSFORMATION CULTURELLE                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. MESURER          2. COMPARER        3. PILOTER         4. ÉVALUER      │
│  ─────────           ─────────          ────────           ────────        │
│  Culture             Actuel vs          Actions            Re-mesurer      │
│  actuelle            souhaité           ciblées            (T+12 mois)     │
│                                                                             │
│  Profiler            Gap analysis       Recrutement,       Delta           │
│  tous les            visuel             comm, formation    culturel        │
│  collaborateurs      COMEX              adaptés                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Outcome:** Alignement culture/stratégie mesurable

---

### Journey 6: Due Diligence M&A

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ DUE DILIGENCE CULTURELLE                                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. PROFILER         2. COMPARER        3. IDENTIFIER      4. INTÉGRER     │
│  ─────────           ─────────          ──────────         ─────────       │
│  Cible               Acquéreur          Points de          Plan            │
│  acquisition         vs Cible           friction           intégration     │
│                                                                             │
│  Échantillon         Matrice            Risques            Actions         │
│  représentatif       compatibilité      culturels          mitigantes      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Outcome:** Réduction risque échec M&A

---

## Functional Requirements

### Module 1: Core Platform

#### 1.1 Gestion des Organisations (Multi-tenant)

| ID | Requirement | Priorité |
|----|-------------|:--------:|
| FR1.1 | Créer une organisation (tenant) | 🔴 MVP |
| FR1.2 | Configurer le branding organisation (logo, couleurs) | 🔴 MVP |
| FR1.3 | Gérer les utilisateurs de l'organisation | 🔴 MVP |
| FR1.4 | Définir les rôles et permissions | 🔴 MVP |
| FR1.5 | Configurer les paramètres RGPD | 🔴 MVP |
| FR1.6 | Voir l'historique d'activité | 🟠 v1.5 |
| FR1.7 | Gérer les quotas et facturation | 🟠 v1.5 |

#### 1.2 Gestion des Campagnes

| ID | Requirement | Priorité |
|----|-------------|:--------:|
| FR2.1 | Créer une campagne avec nom et description | 🔴 MVP |
| FR2.2 | Choisir le type de campagne (recrutement, équipe, audit, formation, etc.) | 🔴 MVP |
| FR2.3 | Personnaliser le branding de la campagne | 🔴 MVP |
| FR2.4 | Générer un lien unique partageable | 🔴 MVP |
| FR2.5 | Définir une date de fin de campagne | 🟠 v1.5 |
| FR2.6 | Ajouter des champs custom (métadonnées) | 🟠 v1.5 |
| FR2.7 | Dupliquer une campagne existante | 🟠 v1.5 |
| FR2.8 | Archiver/Supprimer une campagne | 🔴 MVP |
| FR2.9 | Importer une liste de répondants (email) | 🟡 v2 |
| FR2.10 | Envoyer des invitations par email | 🟡 v2 |
| FR2.11 | Configurer les relances automatiques | 🟡 v2 |

#### 1.3 Questionnaire & Profiling

| ID | Requirement | Priorité |
|----|-------------|:--------:|
| FR3.1 | Afficher le questionnaire 170 questions | 🔴 MVP |
| FR3.2 | Sauvegarder la progression en cours | 🔴 MVP |
| FR3.3 | Reprendre un questionnaire interrompu | 🔴 MVP |
| FR3.4 | Afficher la progression (%, temps restant) | 🔴 MVP |
| FR3.5 | Calculer le profil (8 Mythes) | 🔴 MVP |
| FR3.6 | Afficher le résultat immédiatement | 🔴 MVP |
| FR3.7 | Envoyer le résultat par email | 🔴 MVP |
| FR3.8 | Proposer questionnaire court (70Q) | 🟡 v2 |
| FR3.9 | Adapter les questions selon le contexte | 🟢 v3 |

#### 1.4 Système Passeport

| ID | Requirement | Priorité |
|----|-------------|:--------:|
| FR4.1 | Générer un code Passeport unique | 🔴 MVP |
| FR4.2 | Envoyer le Passeport par email | 🔴 MVP |
| FR4.3 | Vérifier un Passeport existant | 🟠 v1.5 |
| FR4.4 | Récupérer le profil via Passeport (skip questionnaire) | 🟠 v1.5 |
| FR4.5 | Récupérer un Passeport perdu (par email) | 🟠 v1.5 |
| FR4.6 | Historique d'utilisation du Passeport | 🟡 v2 |
| FR4.7 | Permettre au répondant de mettre à jour son profil | 🟢 v3 |

---

### Module 2: Analytics & Dashboards

#### 2.1 Dashboard Campagne

| ID | Requirement | Priorité |
|----|-------------|:--------:|
| FR5.1 | Voir le nombre de réponses en temps réel | 🔴 MVP |
| FR5.2 | Voir le taux de completion | 🔴 MVP |
| FR5.3 | Voir la répartition des 8 Mythes (graphique) | 🔴 MVP |
| FR5.4 | Filtrer par période | 🟠 v1.5 |
| FR5.5 | Filtrer par champs custom | 🟠 v1.5 |
| FR5.6 | Comparer au benchmark national | 🟠 v1.5 |
| FR5.7 | Export PDF du dashboard | 🟡 v2 |

#### 2.2 Dashboard Équipe (Manager)

| ID | Requirement | Priorité |
|----|-------------|:--------:|
| FR6.1 | Visualiser la composition culturelle de l'équipe | 🟠 v1.5 |
| FR6.2 | Voir le profil de chaque membre | 🟠 v1.5 |
| FR6.3 | Identifier les profils complémentaires/similaires | 🟡 v2 |
| FR6.4 | Recevoir des recommandations management | 🟡 v2 |
| FR6.5 | Comparer avec d'autres équipes | 🟡 v2 |
| FR6.6 | Simuler ajout d'un nouveau membre | 🟢 v3 |

#### 2.3 Dashboard Organisation (Direction)

| ID | Requirement | Priorité |
|----|-------------|:--------:|
| FR7.1 | Vue globale culture entreprise | 🟠 v1.5 |
| FR7.2 | Breakdown par département/BU | 🟠 v1.5 |
| FR7.3 | Évolution dans le temps | 🟡 v2 |
| FR7.4 | Comparaison culture actuelle vs souhaitée | 🟡 v2 |
| FR7.5 | Heatmap culturelle par entité | 🟡 v2 |
| FR7.6 | Alertes sur écarts culturels | 🟢 v3 |

#### 2.4 Dashboard Recrutement (DRH)

| ID | Requirement | Priorité |
|----|-------------|:--------:|
| FR8.1 | Voir le profil des candidats | 🔴 MVP |
| FR8.2 | Comparer candidat vs culture équipe | 🟠 v1.5 |
| FR8.3 | Visualiser le fit (pas de score, visuel) | 🟠 v1.5 |
| FR8.4 | Historique des candidats par poste | 🟡 v2 |
| FR8.5 | Corrélation profil × performance (avec consentement) | 🟢 v3 |

---

### Module 3: Export & Integration

#### 3.1 Export Données

| ID | Requirement | Priorité |
|----|-------------|:--------:|
| FR9.1 | Exporter en CSV | 🔴 MVP |
| FR9.2 | Choisir les colonnes à exporter | 🔴 MVP |
| FR9.3 | Exporter en Excel | 🟠 v1.5 |
| FR9.4 | Exporter profil individuel en PDF | 🟠 v1.5 |
| FR9.5 | Export anonymisé pour études | 🟡 v2 |
| FR9.6 | Export automatique planifié | 🟢 v3 |

#### 3.2 API REST

| ID | Requirement | Priorité |
|----|-------------|:--------:|
| FR10.1 | Authentification par API Key | 🟠 v1.5 |
| FR10.2 | Endpoint GET /profiles | 🟠 v1.5 |
| FR10.3 | Endpoint GET /campaigns | 🟠 v1.5 |
| FR10.4 | Endpoint POST /campaigns | 🟠 v1.5 |
| FR10.5 | Pagination et filtres | 🟠 v1.5 |
| FR10.6 | Rate limiting | 🟠 v1.5 |
| FR10.7 | Documentation Swagger | 🟠 v1.5 |
| FR10.8 | Webhooks (nouveaux profils) | 🟡 v2 |
| FR10.9 | SDK JavaScript | 🟢 v3 |

---

### Module 4: Recommandations & IA

#### 4.1 Recommandations Management

| ID | Requirement | Priorité |
|----|-------------|:--------:|
| FR11.1 | Tips management par Mythe | 🟡 v2 |
| FR11.2 | Guide de communication par profil | 🟡 v2 |
| FR11.3 | Alertes sur conflits potentiels | 🟢 v3 |
| FR11.4 | Suggestions composition équipe | 🟢 v3 |

#### 4.2 Onboarding Personnalisé

| ID | Requirement | Priorité |
|----|-------------|:--------:|
| FR12.1 | Templates onboarding par Mythe | 🟡 v2 |
| FR12.2 | Checklist adaptée au profil | 🟡 v2 |
| FR12.3 | Recommandations buddy/mentor | 🟢 v3 |
| FR12.4 | Parcours formation adapté | 🟢 v3 |

#### 4.3 IA & Insights Avancés

| ID | Requirement | Priorité |
|----|-------------|:--------:|
| FR13.1 | Analyse prédictive engagement | 🟢 v3 |
| FR13.2 | Détection signaux faibles | 🟢 v3 |
| FR13.3 | Recommandations transformation | 🟢 v3 |
| FR13.4 | Chatbot RH avec contexte culturel | 🟢 v3 |

---

### Module 5: Collaboration & Partage

#### 5.1 Partage Social

| ID | Requirement | Priorité |
|----|-------------|:--------:|
| FR14.1 | Partage profil sur LinkedIn | 🟠 v1.5 |
| FR14.2 | Badge Mythe pour signature email | 🟡 v2 |
| FR14.3 | Partage interne (Slack, Teams) | 🟡 v2 |
| FR14.4 | Classement ludique (opt-in) | 🟢 v3 |

#### 5.2 Espace Collaborateur

| ID | Requirement | Priorité |
|----|-------------|:--------:|
| FR15.1 | Accès à son profil personnel | 🔴 MVP |
| FR15.2 | Voir ses différentes participations | 🟠 v1.5 |
| FR15.3 | Gérer ses données (RGPD) | 🔴 MVP |
| FR15.4 | Demander suppression | 🔴 MVP |
| FR15.5 | Exporter ses données | 🔴 MVP |
| FR15.6 | Comparer avec collègues (opt-in) | 🟡 v2 |

---

### Module 6: Administration

#### 6.1 Super Admin (Ethnostyles)

| ID | Requirement | Priorité |
|----|-------------|:--------:|
| FR16.1 | Gérer tous les tenants | 🟠 v1.5 |
| FR16.2 | Voir analytics globales | 🟠 v1.5 |
| FR16.3 | Gérer le benchmark national | 🟠 v1.5 |
| FR16.4 | Configurer les quotas | 🟠 v1.5 |
| FR16.5 | Monitoring et alertes | 🟠 v1.5 |
| FR16.6 | Logs d'audit | 🟠 v1.5 |

#### 6.2 Gestion des Rôles

| ID | Requirement | Priorité |
|----|-------------|:--------:|
| FR17.1 | Rôle Admin (tout accès) | 🔴 MVP |
| FR17.2 | Rôle Viewer (lecture seule) | 🔴 MVP |
| FR17.3 | Rôle Manager (équipe uniquement) | 🟠 v1.5 |
| FR17.4 | Rôle Coach (accès limité) | 🟡 v2 |
| FR17.5 | Rôles custom | 🟢 v3 |

---

## Non-Functional Requirements

### Performance

| NFR | Métrique | Cible | Criticité |
|-----|----------|:-----:|:---------:|
| NFR-P1 | Temps chargement questionnaire | < 2 sec | 🔴 |
| NFR-P2 | Temps réponse entre questions | < 200 ms | 🔴 |
| NFR-P3 | Temps calcul profil | < 3 sec | 🔴 |
| NFR-P4 | Temps chargement dashboard | < 3 sec | 🟠 |
| NFR-P5 | Temps export CSV (10K lignes) | < 30 sec | 🟠 |
| NFR-P6 | Utilisateurs simultanés | 1000 minimum | 🟠 |
| NFR-P7 | API latency (p95) | < 500 ms | 🟠 |

### Sécurité

| NFR | Exigence | Détail |
|-----|----------|--------|
| NFR-S1 | Chiffrement at rest | AES-256 |
| NFR-S2 | Chiffrement in transit | TLS 1.3 |
| NFR-S3 | Authentification | JWT + refresh tokens |
| NFR-S4 | MFA | Optionnel admin, obligatoire super admin |
| NFR-S5 | Session timeout | 30 min inactivité |
| NFR-S6 | Isolation multi-tenant | Stricte, row-level security |
| NFR-S7 | Sanitization | Protection XSS, injection SQL |
| NFR-S8 | API Keys | Rotation, révocation immédiate |
| NFR-S9 | Audit logs | Toutes actions sensibles |
| NFR-S10 | Pen testing | Annuel minimum |

### Scalabilité

| NFR | Cible MVP | Cible v2 |
|-----|:---------:|:--------:|
| Profils/mois | 20K | 100K |
| Tenants actifs | 50 | 500 |
| Campagnes/tenant | 20 | 100 |
| Répondants simultanés | 500 | 5000 |
| Stockage/tenant | 1 GB | 10 GB |

### RGPD & Compliance

| NFR | Exigence |
|-----|----------|
| NFR-C1 | Consentement explicite avant questionnaire |
| NFR-C2 | Droit d'accès (export données personnelles) |
| NFR-C3 | Droit à l'oubli (suppression sur demande) |
| NFR-C4 | Portabilité (format standard) |
| NFR-C5 | Minimisation (collecter uniquement nécessaire) |
| NFR-C6 | Limitation conservation (durée définie) |
| NFR-C7 | DPO contact visible |
| NFR-C8 | Registre des traitements |

### Accessibilité

| NFR | Standard |
|-----|----------|
| NFR-A1 | WCAG 2.1 niveau AA |
| NFR-A2 | Navigation 100% clavier |
| NFR-A3 | Compatible NVDA, VoiceOver, JAWS |
| NFR-A4 | Contraste 4.5:1 minimum |
| NFR-A5 | Focus visible |
| NFR-A6 | Textes alternatifs |

### Disponibilité

| NFR | Cible |
|-----|:-----:|
| Uptime | 99.9% |
| RTO | < 2 heures |
| RPO | < 30 minutes |
| Backup | Quotidien, 90 jours rétention |
| DR | Multi-région |

---

## Phased Development Plan

### Phase 1: MVP (0-3 mois)

**Objectif:** Un client peut lancer une campagne et obtenir des profils.

| Module | Features |
|--------|----------|
| Organisation | Création compte, branding, utilisateurs |
| Campagnes | Création, lien, branding, archivage |
| Questionnaire | 170Q, progression, calcul, résultat |
| Passeport | Génération, envoi email |
| Dashboard | Réponses temps réel, répartition Mythes, taux completion |
| Export | CSV avec colonnes sélectionnables |
| RGPD | Consentement, suppression, export perso |

**Personas supportés:** DRH (basique), Manager (basique), Candidat/Collaborateur

---

### Phase 2: Growth (3-6 mois)

**Objectif:** API, Passeport réutilisable, dashboards avancés.

| Module | Features |
|--------|----------|
| Passeport | Vérification, récupération, réutilisation |
| API | Auth, endpoints, rate limiting, Swagger |
| Dashboard Équipe | Composition, profils membres |
| Dashboard Orga | Vue globale, breakdown départements |
| Dashboard Recrutement | Comparaison candidat/équipe |
| Export | Excel, PDF individuel |
| Partage | LinkedIn |
| Admin | Super admin, gestion tenants |

**Personas supportés:** Tous (fonctionnalités de base)

---

### Phase 3: Premium (6-12 mois)

**Objectif:** Recommandations IA, onboarding personnalisé, intégrations avancées.

| Module | Features |
|--------|----------|
| Questionnaire | Version courte 70Q |
| Recommandations | Tips management, guide communication |
| Onboarding | Templates par Mythe, checklist adaptée |
| Dashboard | Évolution temps, comparaison actuel/souhaité |
| Webhooks | Notifications temps réel |
| Partage | Slack, Teams, badge email |
| Rôles | Manager, Coach |

**Personas supportés:** Tous (fonctionnalités complètes)

---

### Phase 4: Enterprise (12+ mois)

**Objectif:** IA avancée, intégrations enterprise, compliance renforcée.

| Module | Features |
|--------|----------|
| IA | Prédictif engagement, signaux faibles, chatbot |
| Recommandations | Composition équipe, buddy/mentor |
| Intégrations | SDK JS, HRIS connectors |
| Rôles | Custom roles |
| Compliance | SSO, audit avancé |
| M&A | Module due diligence dédié |

**Personas supportés:** Tous (fonctionnalités enterprise)

---

## Success Metrics

### North Star Metric v2

**"Nombre de profils actifs mensuels (PAM)"**
= Nouveaux profils + Réutilisations Passeport

### Métriques par Phase

| Phase | Métrique | Cible |
|-------|----------|:-----:|
| **MVP (M3)** | Tenants actifs | 10 |
| | Profils générés | 5 000 |
| | Taux completion | > 90% |
| **Growth (M6)** | Tenants actifs | 30 |
| | PAM | 15 000 |
| | % via Passeport | > 15% |
| | ARR | 150K€ |
| **Premium (M12)** | Tenants actifs | 100 |
| | PAM | 50 000 |
| | % via Passeport | > 30% |
| | ARR | 500K€ |
| **Enterprise (M24)** | Tenants actifs | 300 |
| | PAM | 200 000 |
| | ARR | 2M€ |

### Métriques par Persona

| Persona | Métrique | Cible |
|---------|----------|:-----:|
| **DRH** | Turnover 1ère année post-Ethnostyles | -30% |
| **Manager** | Engagement équipe | +20% |
| **L&D** | ROI formation | +40% |
| **Direction** | Alignement culture/stratégie | Mesurable |
| **Coach** | Renouvellement missions | > 70% |
| **Candidat** | NPS répondant | > 60 |

---

## Appendix: Les 8 Mythes Ethnostyles

| Mythe | Description | Valeurs clés |
|-------|-------------|--------------|
| **Explorateur** | Curieux, aime découvrir, sort de sa zone de confort | Nouveauté, liberté, aventure |
| **Gardien** | Sécurité, stabilité, traditions, fiabilité | Prudence, loyauté, protection |
| **Créateur** | Innovation, art, vision unique, expression | Originalité, imagination, beauté |
| **Sage** | Connaissance, réflexion, compréhension | Vérité, sagesse, apprentissage |
| **Héros** | Défis, détermination, excellence, protection | Courage, ambition, accomplissement |
| **Rebelle** | Remise en question, changement, convictions | Liberté, révolution, authenticité |
| **Magicien** | Possibilités infinies, transformation, potentiel | Vision, pouvoir, réalisation |
| **Innocent** | Optimisme, confiance, simplicité, bonté | Joie, espoir, pureté |

---

**Document généré le 2026-01-25**
**Version:** 2.0 - SaaS Ultra-Complet
**Status:** Prêt pour Architecture et Epics/Stories
