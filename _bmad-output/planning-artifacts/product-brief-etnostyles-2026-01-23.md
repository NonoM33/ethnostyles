---
stepsCompleted: ['step-01-init', 'step-02-vision', 'step-03-target-users', 'step-04-ux-goals', 'elicitation-shark-tank', 'elicitation-pre-mortem', 'elicitation-jtbd', 'elicitation-competitive', 'step-05-features-mvp', 'step-06-metrics']
status: complete
inputDocuments:
  - '_bmad-output/analysis/brainstorming-session-2026-01-23.md'
date: 2026-01-23
author: Renaud.cosson-ext
---

# Product Brief: Ethnostyles Profiler

## Executive Summary

**Ethnostyles Profiler** est une plateforme d'assessment culturel qui permet aux entreprises de collecter les profils de valeurs de leurs contacts, clients ou collaborateurs. Via un questionnaire de 170 questions (10 min), chaque répondant découvre son profil Ethnostyles personnel — tandis que l'entreprise obtient des données de segmentation culturelle actionnables.

Ce modèle "win-win" transforme l'expertise ethnologique d'Ethnostyles en un service scalable : le répondant est motivé par son résultat personnel, l'entreprise obtient des insights impossibles à avoir autrement.

**Innovation clé : le "Passeport Ethnostyles"** — Chaque répondant reçoit un code unique après avoir complété le questionnaire. Ce code lui permet de réutiliser son profil à vie, sans refaire le test, sur n'importe quelle campagne Ethnostyles. RGPD-friendly par design.

---

## Core Vision

### Problem Statement

Les entreprises veulent comprendre les valeurs profondes de leurs clients, prospects ou collaborateurs — mais les méthodes actuelles sont soit trop superficielles (données démographiques), soit trop lourdes (études quali sur-mesure), soit peu engageantes (sondages sans valeur pour le répondant).

### Problem Impact

- **Marketing** : Segmentation par âge/localisation qui ne prédit pas les comportements réels
- **Sales** : Aucun insight sur ce qui motive vraiment le prospect
- **RH** : Évaluation du "culture fit" basée sur l'intuition, pas sur des données
- **Études** : Taux de réponse faibles car le répondant n'y gagne rien

### Why Existing Solutions Fall Short

| Solution | Limite |
|----------|--------|
| Enrichissement data (Clearbit) | Données firmographiques, pas de valeurs |
| Tests personnalité (DISC, MBTI) | Personnalité ≠ valeurs culturelles |
| Sondages classiques | Le répondant n'a aucune motivation à répondre |
| Études quali | Coûteuses, lentes, non scalables |

**Le gap** : Aucune solution ne combine **profondeur ethnologique** + **engagement du répondant** + **scalabilité**.

### Proposed Solution

**Ethnostyles Profiler** — une plateforme où :

1. **L'entreprise** crée une campagne et obtient un lien de questionnaire
2. **Elle diffuse** le lien à ses contacts/employés (email, site, app...)
3. **Le répondant** répond en 10 min et **découvre son profil** (sa motivation)
4. **L'entreprise** récupère les résultats (dashboard, export, API)

**Options de questionnaire :**
- Version complète : 170 questions (~10 min) — profil détaillé
- Version light : 70 questions (~5 min) — profil simplifié (à développer)

### Key Differentiators

| Différenciateur | Pourquoi ça marche |
|-----------------|-------------------|
| **Win-win** | Le répondant obtient son profil → taux de completion ~100% |
| **Passeport Ethnostyles** | Code unique, profil réutilisable à vie, RGPD-friendly |
| **170 valeurs** | Profondeur ethnologique unique vs tests de personnalité classiques |
| **Questionnaire existant** | Déjà en ligne, éprouvé, validé |
| **Référentiel national** | 2000 personnes, données propriétaires |
| **10 minutes** | Comparable à un DISC, acceptable pour la plupart des contextes |

---

## Feature clé : Passeport Ethnostyles

### Concept
Répondre une fois au questionnaire, garder son profil à vie.

### Mécanisme
```
Scénario 1 : Nouveau répondant
─────────────────────────────
Questionnaire (10 min)
       ↓
Profil généré
       ↓
Email avec résultat + CODE UNIQUE
       ↓
Le répondant garde son code à vie


Scénario 2 : Répondant existant
─────────────────────────────
Questionnaire affiché
       ↓
"Vous avez déjà un code Ethnostyles ?"
       ↓
Entre son code
       ↓
Profil récupéré instantanément (0 question)
       ↓
L'entreprise reçoit les données
```

### Bénéfices

| Bénéfice | Pour qui |
|----------|----------|
| **Pas de répétition** | Le répondant ne refait pas 170 questions |
| **Portabilité** | Le profil suit la personne d'une entreprise à l'autre |
| **RGPD** | L'utilisateur contrôle ses données (droit à la portabilité) |
| **Friction réduite** | Si quelqu'un a déjà son code, c'est instantané |
| **Effet réseau** | Plus de gens ont leur code → plus c'est facile de collecter des profils |

---

## Target Users

### Deux types d'utilisateurs distincts

Ethnostyles Profiler a une architecture **bi-face** :

| Rôle | Qui | Relation avec le produit |
|------|-----|-------------------------|
| **Acheteur/Admin** | L'entreprise (Marketing, RH, Data) | Paye, configure, analyse les résultats |
| **Répondant** | Contact, client, employé, candidat | Répond au questionnaire, reçoit son profil |

---

### Personas Acheteurs (Grands Comptes)

#### 1. Marie — Directrice Marketing

| Attribut | Détail |
|----------|--------|
| **Entreprise** | Groupe bancaire ou assurance (5000+ employés) |
| **Responsabilité** | Stratégie marketing, segmentation client, campagnes |
| **Budget** | Contrôle des budgets études et data marketing |
| **Frustration actuelle** | "Nos segments socio-démo ne prédisent rien. On sait que nos clients ont 35-50 ans, mais ça ne nous dit pas ce qui les fait acheter." |
| **Ce qu'elle cherche** | Segmentation par valeurs pour personnaliser les messages et prédire les comportements |
| **Objection possible** | "10 min de questionnaire, mes clients vont-ils répondre ?" |
| **Déclencheur d'achat** | ROI démontré sur une campagne pilote |

**User Journey Marie :**
```
Découverte → Démo commerciale → POC sur segment limité → Mesure uplift → Déploiement large
```

---

#### 2. Thomas — DRH

| Attribut | Détail |
|----------|--------|
| **Entreprise** | ETI ou Grand groupe (1000+ employés) |
| **Responsabilité** | Culture d'entreprise, recrutement, engagement |
| **Frustration actuelle** | "On recrute des gens compétents qui partent au bout d'un an. Le culture fit est flou." |
| **Ce qu'il cherche** | Objectiver le "culture fit", mapper les valeurs de l'entreprise vs candidats |
| **Cas d'usage** | Recrutement, onboarding, audit culturel interne |
| **Objection possible** | "Est-ce que c'est éthique de profiler les candidats ?" |
| **Déclencheur d'achat** | Turnover élevé, transformation culturelle en cours |

**User Journey Thomas :**
```
Problème turnover → Recherche solutions → Découvre Ethnostyles → POC sur cohorte recrutement → Compare fit score vs rétention → Généralise
```

---

#### 3. Sophie — Responsable Data & Insights

| Attribut | Détail |
|----------|--------|
| **Entreprise** | Retailer, média, ou service B2C (data-driven) |
| **Responsabilité** | Enrichissement data client, analytics, BI |
| **Frustration actuelle** | "On a beaucoup de data transactionnelle mais aucun insight sur les motivations profondes." |
| **Ce qu'elle cherche** | Variable de segmentation supplémentaire à intégrer dans le data lake |
| **Besoin technique** | API, export CSV, intégration CRM/CDP |
| **Objection possible** | "Comment ça s'intègre à notre stack ?" |
| **Déclencheur d'achat** | Projet de refonte segmentation, CDP en cours de déploiement |

**User Journey Sophie :**
```
Besoin data → Évalue sources d'enrichissement → Teste API Ethnostyles → Valide qualité data → Intègre au pipeline
```

---

### Personas Répondants

Les répondants ne "choisissent" pas Ethnostyles — ils sont **invités** par une entreprise. Leur motivation est **le résultat personnel**.

#### 1. Client d'une marque (B2C)

| Attribut | Détail |
|----------|--------|
| **Contexte** | Reçoit un email/SMS de sa banque, assurance, retailer |
| **Motivation** | "Découvrez votre profil de valeurs" — curiosité personnelle |
| **Friction** | 10 min c'est long, doit être convaincu de la valeur |
| **Ce qui le fait répondre** | Promesse du profil personnel + relation de confiance avec la marque |
| **Ce qui le fait abandonner** | Questions répétitives, pas de progression visible, pas de reward |

---

#### 2. Employé (contexte RH interne)

| Attribut | Détail |
|----------|--------|
| **Contexte** | Invitation de la DRH pour "mieux se connaître" ou audit culturel |
| **Motivation** | Curiosité + pression sociale douce (tout le monde le fait) |
| **Friction** | Peur que les résultats soient utilisés contre lui |
| **Ce qui le fait répondre** | Garantie d'anonymat, profil personnel en retour |
| **Ce qui le fait abandonner** | Sentiment de surveillance, pas de communication claire sur l'usage |

---

#### 3. Candidat en recrutement

| Attribut | Détail |
|----------|--------|
| **Contexte** | Étape du process de recrutement (comme un test de personnalité) |
| **Motivation** | Avancer dans le process + découvrir son profil |
| **Friction** | "Est-ce éliminatoire ?" — stress |
| **Ce qui le fait répondre** | Positionné comme étape obligatoire mais valorisante |
| **Ce qui le fait abandonner** | Si perçu comme un piège ou test biaisé |

---

### Matrice Acheteur × Répondant

| Acheteur | Répondants typiques | Volume estimé |
|----------|--------------------|--------------:|
| **Marketing** | Clients, prospects | 10K - 500K |
| **RH - Culture** | Employés | 100 - 10K |
| **RH - Recrutement** | Candidats | 50 - 5K/an |
| **Data/Insights** | Mix selon use case | Variable |

---

## User Experience Goals

### Principes UX fondamentaux

Ethnostyles Profiler doit offrir **deux expériences distinctes mais cohérentes** :

| Interface | Utilisateur | Objectif UX |
|-----------|-------------|-------------|
| **Console Admin** | Acheteur (entreprise) | Efficacité, clarté, contrôle |
| **Questionnaire** | Répondant | Engagement, fluidité, reward |

---

### UX Acheteur/Admin : "Je maîtrise ma campagne"

#### Objectifs clés

| # | Objectif | Métrique proxy |
|---|----------|----------------|
| 1 | **Autonomie** — Créer et lancer une campagne sans aide | Time-to-first-campaign < 15 min |
| 2 | **Visibilité** — Suivre les réponses en temps réel | Dashboard rafraîchi en temps réel |
| 3 | **Actionnable** — Exploiter les résultats facilement | Export en 2 clics, API documentée |
| 4 | **Confiance** — Comprendre ce que mesurent les profils | Documentation claire, exemples concrets |

#### Parcours cible Admin

```
┌─────────────────────────────────────────────────────────────────┐
│  1. CRÉER         2. CONFIGURER      3. DIFFUSER     4. ANALYSER │
│  ─────────        ───────────        ─────────       ────────── │
│  Nouvelle         - Branding         Copier le       Dashboard   │
│  campagne         - Champs custom    lien            temps réel  │
│                   - Paramètres                       + Export    │
└─────────────────────────────────────────────────────────────────┘
```

#### Principes de design Admin

- **Zero training** : Interface auto-explicative, pas de manuel nécessaire
- **Progressive disclosure** : Options avancées masquées par défaut
- **Feedback immédiat** : Chaque action a une confirmation visible
- **Data-first** : Le dashboard montre les insights, pas juste les chiffres

---

### UX Répondant : "Je découvre qui je suis"

#### Objectifs clés

| # | Objectif | Métrique proxy |
|---|----------|----------------|
| 1 | **Engagement** — Commencer le questionnaire | Taux de clic sur le lien > 5% |
| 2 | **Completion** — Aller jusqu'au bout | Taux de completion > 95% |
| 3 | **Satisfaction** — Apprécier son résultat | NPS répondant > 50 |
| 4 | **Viralité** — Partager / recommander | Taux de partage > 10% |

#### Parcours cible Répondant

```
┌────────────────────────────────────────────────────────────────────────┐
│  1. INVITATION     2. QUESTIONNAIRE    3. RÉSULTAT     4. PASSEPORT   │
│  ───────────       ──────────────      ──────────      ───────────    │
│  Email/lien        170 questions       Mon profil      Code unique    │
│  accrocheur        gamifiées           détaillé        à conserver    │
│                    + progression       + comparaison                  │
└────────────────────────────────────────────────────────────────────────┘
```

#### Principes de design Répondant

- **Hook immédiat** : La promesse du résultat est claire dès le début
- **Progression visible** : Barre de progression, estimation temps restant
- **Variété** : Formats de questions variés pour éviter la monotonie
- **Reward instantané** : Le profil apparaît immédiatement après la dernière question
- **Personnalisé** : Le résultat parle de MOI, pas de statistiques abstraites
- **Shareable** : Format de résultat conçu pour être partagé

---

### UX du Passeport Ethnostyles

#### Scénario "J'ai déjà mon code"

| Étape | UX attendue |
|-------|-------------|
| 1. Arrive sur le questionnaire | Option visible : "Vous avez déjà un code ?" |
| 2. Entre son code | Champ simple, format clair (ex: ETHNO-XXXX-XXXX) |
| 3. Validation | Confirmation instantanée : "Bienvenue [Prénom] !" |
| 4. Résultat | Profil affiché immédiatement, 0 question |

#### Gestion du code

- **Récupération** : "J'ai perdu mon code" → email de récupération
- **Format mémorable** : Code court et prononçable
- **Multi-support** : Fonctionne sur mobile, desktop, tablette

---

### Contraintes UX non-négociables

| Contrainte | Raison |
|------------|--------|
| **Mobile-first** | 60%+ des répondants seront sur mobile |
| **< 3 sec chargement** | Au-delà, abandon massif |
| **Accessible (WCAG 2.1 AA)** | Obligation légale + inclusivité |
| **Multi-langue** | Français + Anglais minimum (entreprises internationales) |
| **Offline-tolerant** | Le questionnaire doit supporter les déconnexions temporaires |

---

## Killer Usages

### Principe fondamental

Tous les usages d'Ethnostyles Profiler doivent être :
- ✅ **RGPD-compliant** — Consentement explicite, droit à l'oubli, portabilité
- ✅ **Non-discriminant** — Jamais utilisé pour exclure ou filtrer des personnes
- ✅ **Éthique** — Le répondant bénéficie toujours de son profil personnel

---

### 🎯 Marketing — Usages les plus scalables

| # | Usage | Valeur business | Pourquoi c'est safe |
|---|-------|-----------------|---------------------|
| **M1** | **Segmentation campagnes** — Adapter le message pub selon le profil de valeurs | +30-50% conversion | Opt-in explicite, données anonymisées |
| **M2** | **Persona data-driven** — Créer des personas basés sur données réelles | Stratégie fondée sur du réel | Données agrégées, pas individuelles |
| **M3** | **A/B testing par valeurs** — Tester quelle accroche marche sur quel profil | Optimisation continue | Consentement donné |
| **M4** | **Product-market fit** — Identifier quel segment aime le plus le produit | Priorisation roadmap | Étude anonyme, consentie |
| **M5** | **Tone of voice** — Adapter le ton de communication par segment | Brand plus authentique | Pas de données sensibles |
| **M6** | **Média planning** — Savoir quels profils consomment quels médias | ROI média optimisé | Données déclaratives, opt-in |

**Killer combo Marketing :**
> "Je sais que mes meilleurs clients sont des profils 'Innovateurs-Hédonistes'. Je cible mes pubs sur ce segment avec un message adapté. Conversion x2."

---

### 👥 RH — Usages éthiques uniquement

| # | Usage | Valeur business | Pourquoi c'est safe |
|---|-------|-----------------|---------------------|
| **R1** | **Cartographie culturelle** — "Quelle est la culture réelle de mon entreprise ?" | Diagnostic objectif | Données agrégées, anonymes, volontaires |
| **R2** | **Onboarding personnalisé** — Adapter l'intégration au profil du nouvel arrivant | Réduction turnover early | Le collaborateur reçoit SON profil |
| **R3** | **Team building** — Comprendre les dynamiques d'équipe | Meilleure collaboration | Exercice collectif volontaire |
| **R4** | **Formation personnalisée** — Adapter les parcours de formation | ROI formation | Bénéficie directement à l'employé |
| **R5** | **Communication interne** — Adapter les messages selon les profils majoritaires | Engagement employé | Données agrégées par département |
| **R6** | **Transformation culturelle** — Mesurer l'évolution de la culture dans le temps | Pilotage du changement | Comparaison avant/après, anonyme |

**Killer combo RH :**
> "On a mesuré notre culture. On est 70% 'Sécuritaires'. On recrute des 'Innovateurs' pour notre transformation digitale → on adapte l'onboarding pour qu'ils ne fuient pas après 3 mois."

---

### 📊 Data & Insights — Usages analytiques

| # | Usage | Valeur business | Pourquoi c'est safe |
|---|-------|-----------------|---------------------|
| **D1** | **Enrichissement CRM** — Ajouter le profil Ethnostyles au fichier client | Segmentation enrichie | Le client a consenti et reçu son profil |
| **D2** | **Corrélation comportement × valeurs** — "Les profils X achètent plus de Y" | Insights prédictifs | Analyse agrégée |
| **D3** | **Benchmark sectoriel** — "Ma base client vs le marché français" | Positionnement | Comparaison au référentiel national |
| **D4** | **Scoring appétence produit** — Probabilité d'intérêt pour un nouveau produit | Lancement produit | Propension, pas discrimination |
| **D5** | **Churn prediction** — Quels profils sont à risque de partir | Rétention | Action = mieux servir, pas exclure |
| **D6** | **NPS × Profil** — Comprendre pourquoi certains profils sont détracteurs | Amélioration produit | Diagnostic, pas exclusion |

**Killer combo Data :**
> "Mes détracteurs NPS sont à 80% des 'Exigeants-Rationnels'. Ils veulent plus de transparence pricing → je crée une page FAQ détaillée → NPS +15 points."

---

### 🚀 Top 5 Killer Features

| Rang | Feature | Cible | Pitch en 1 phrase |
|:----:|---------|-------|-------------------|
| 🥇 | **Segmentation par valeurs** | Marketing | "Arrêtez de cibler par âge, ciblez par ce qui motive vraiment vos clients" |
| 🥈 | **Cartographie culturelle** | RH/COMEX | "Découvrez la vraie culture de votre entreprise en données" |
| 🥉 | **Enrichissement CRM** | Data/Marketing | "Ajoutez une dimension 'valeurs' à votre base client" |
| 4 | **Onboarding IA personnalisé** | RH | "L'IA adapte votre process d'onboarding à chaque profil Ethnostyles" |
| 5 | **Partage social par Mythe** | Collaborateurs | "Je suis Mythe du Progrès — et toi ?" (viralité interne) |
| 6 | **Benchmark national** | Études/Stratégie | "Comparez votre base au référentiel français de 2000 personnes" |
| 7 | **Passeport Ethnostyles** | Tous | "Un code, un profil à vie, réutilisable partout" |

---

## Contraintes Éthiques & Légales

### ⚠️ SECTION NON-NÉGOCIABLE

Cette section définit les **lignes rouges** du produit. Aucune feature, aucun client, aucun revenu ne justifie de les franchir.

---

### Usages INTERDITS

| Usage interdit | Pourquoi | Risque |
|----------------|----------|--------|
| **Scoring candidat** | Discrimination à l'embauche | Procès, amende CNIL, bad buzz fatal |
| **Filtrage recrutement** | Exclusion basée sur les valeurs | Illégal (Code du travail) |
| **Prédiction turnover individuel** | "Ce collaborateur va partir" | Discrimination, surveillance |
| **Profil idéal à matcher** | Crée un biais d'exclusion | Discrimination indirecte |
| **Profilage sans consentement** | Le répondant ne sait pas qu'il est profilé | Violation RGPD |
| **Revente de données individuelles** | Données personnelles vendues à des tiers | Violation RGPD |

---

### Garde-fous produit

| Niveau | Garde-fou | Implémentation |
|--------|-----------|----------------|
| **Produit** | Pas de score de "fit" binaire | Jamais "compatible/incompatible" |
| **Produit** | Pas de comparaison candidat vs "profil idéal" | Fonctionnalité inexistante |
| **Data** | Pas d'historique turnover × profil individuel | Ne jamais croiser ces données |
| **UX** | Warning légal visible | Disclaimer à chaque export RH |
| **Contrat** | Clause d'usage responsable | Le client s'engage à ne pas discriminer |
| **Audit** | Log des exports RH | Traçabilité en cas de litige |

---

### Positionnement RH

**Ce qu'on vend :**
> "Comprenez la culture de votre entreprise et améliorez l'onboarding"

**Ce qu'on ne vend PAS :**
> ~~"Filtrez les mauvais candidats avant de les recruter"~~

| Use case RH | ✅ Autorisé | ❌ Interdit |
|-------------|:-----------:|:-----------:|
| Cartographier la culture d'entreprise | ✅ | |
| Améliorer l'onboarding personnalisé | ✅ | |
| Identifier les besoins de formation | ✅ | |
| Filtrer les candidatures | | ❌ |
| Prédire le turnover individuel | | ❌ |
| Scorer les candidats | | ❌ |

---

### Matrice Usage × Conformité

| Usage | RGPD | Non-discrim | Éthique | Statut |
|-------|:----:|:-----------:|:-------:|:------:|
| Segmentation marketing | ✅ | ✅ | ✅ | 🟢 GO |
| Enrichissement CRM | ✅ | ✅ | ✅ | 🟢 GO |
| Cartographie culture | ✅ | ✅ | ✅ | 🟢 GO |
| Onboarding perso | ✅ | ✅ | ✅ | 🟢 GO |
| Team building | ✅ | ✅ | ✅ | 🟢 GO |
| Scoring candidat | ✅ | ❌ | ❌ | 🔴 NO |
| Filtrage recrutement | ❌ | ❌ | ❌ | 🔴 NO |

---

## Analyse des Risques

*Synthèse des exercices Shark Tank et Pre-Mortem*

### Risques business (Shark Tank)

| Objection investisseur | Solidité réponse | Mitigation |
|------------------------|:----------------:|------------|
| "10 min, personne ne fera ça" | ✅ Fort | Win-win : le répondant reçoit son profil |
| "Quel est votre moat ?" | ⚠️ Moyen | Référentiel + effet réseau Passeport |
| "Comment vous scalez ?" | ✅ Fort | Self-service by design |
| "RGPD / éthique ?" | ✅ Fort | Passeport = contrôle utilisateur |

### Risques d'échec (Pre-Mortem)

| Scénario d'échec | Probabilité | Impact | Mitigation prioritaire |
|------------------|:-----------:|:------:|------------------------|
| **Désert commercial** — Pas de clients | Moyenne | Fatal | Valider demande avant sur-investir |
| **Gouffre technique** — Questionnaire non scalable | Moyenne | Élevé | Audit technique semaine 1 |
| **Cannibalisation** — Tue le business conseil | Faible | Moyen | Segmenter SaaS vs Conseil |
| **Rejet éthique** — Bad buzz discrimination | Faible | Fatal | Charte éthique + garde-fous produit |
| **Indifférence** — Clients ne savent pas exploiter | Moyenne | Élevé | Playbooks d'activation dès MVP |

### Top 3 actions préventives

1. **Valider la demande commerciale** avant de sur-investir en dev (LOI, POC payants)
2. **Auditer le questionnaire existant** (code, data, scoring) — faisabilité technique
3. **Prévoir l'activation client** dès le MVP (pas juste collecter, mais activer)

---

## Jobs-to-be-Done

*Le client n'achète pas un produit, il "engage" une solution pour accomplir un job.*

### Jobs des Acheteurs

#### Marie — Directrice Marketing

| Job | Contexte | Outcome |
|-----|----------|---------|
| **Principal** | "Quand je lance une campagne, je veux **segmenter par motivations profondes**..." | +30% conversion |
| Fonctionnel | Créer des segments actionnables | Export vers outils d'emailing |
| Émotionnel | Me sentir innovante | "On fait du marketing basé sur les valeurs" |
| Social | Impressionner le COMEX | Insights jamais vus |

#### Thomas — DRH

| Job | Contexte | Outcome |
|-----|----------|---------|
| **Principal** | "Quand j'intègre un nouveau, je veux **adapter son onboarding à son profil**..." | -30% turnover 1ère année |
| Fonctionnel | Connaître le profil avant jour 1 | Fiche profil dans kit onboarding |
| Émotionnel | Objectiver mes décisions | "Basé sur des données" |
| Social | Approche moderne | "On personnalise l'expérience" |

#### Sophie — Data & Insights

| Job | Contexte | Outcome |
|-----|----------|---------|
| **Principal** | "Quand j'analyse ma base, je veux **comprendre leurs valeurs**..." | Insights actionnables |
| Fonctionnel | Intégrer dans le data lake | API REST, format standard |
| Émotionnel | Trouver des insights uniques | "J'ai découvert pourquoi les X churent" |
| Social | Être la source de vérité | Le métier vient me voir |

### Jobs des Répondants

| Répondant | Job principal | Force de friction | Contremesure |
|-----------|---------------|-------------------|--------------|
| **Client B2C** | Découvrir mon profil pour mieux me connaître | "10 min c'est long" | Promesse du résultat |
| **Employé** | Comprendre mes valeurs et me situer dans l'équipe | "C'est de la surveillance" | Anonymat + résultat perso |
| **Candidat** | Montrer qui je suis au-delà du CV | "C'est éliminatoire ?" | "Pas de mauvais profil" |

### Job Stories clés

| # | Job Story |
|---|-----------|
| JS1 | Quand **je prépare une campagne**, je veux **connaître les valeurs de ma base**, pour que **mon message résonne** |
| JS2 | Quand **j'intègre un employé**, je veux **son profil de valeurs**, pour que **l'onboarding soit personnalisé** |
| JS3 | Quand **j'analyse le churn**, je veux **croiser avec les profils**, pour que **je comprenne le pourquoi** |
| JS4 | Quand **je réponds au questionnaire**, je veux **recevoir mon profil**, pour que **j'y gagne aussi** |

---

## Analyse Concurrentielle

*Competitive War Game : comment les acteurs réagiraient-ils ?*

### Mapping concurrentiel

| Concurrent | Type | Menace | Stratégie |
|------------|------|:------:|-----------|
| **AssessFirst, Predictive Index** | Tests RH | ⚠️ Moyenne | Différencier : profondeur + multi-usage |
| **Clearbit, ZoomInfo** | Enrichissement data | 🟢 Faible | Partenariat potentiel |
| **McKinsey, BCG** | Conseil | 🟢 Faible | En faire des prescripteurs |
| **Google, Meta, LinkedIn** | GAFAM | ⚠️ Moyenne LT | Jouer RGPD + science déclarative |
| **Culture Amp, Lattice** | Culture Tech | 🔴 Élevée | Aller vite, effet réseau Passeport |

### Avantages compétitifs durables (Moats)

| Moat | Durabilité | Renforcement |
|------|:----------:|--------------|
| **170 valeurs ethnologiques** | ✅ Forte | Publier, crédibilité scientifique |
| **Référentiel national 2000 pers.** | ✅ Forte | Enrichir continuellement |
| **Passeport Ethnostyles** | ⚠️ Moyenne | Atteindre masse critique vite |
| **15 ans d'expertise Ethnostyles** | ✅ Forte | Conférences, publications |
| **Multi-usage (Mktg + RH + Data)** | ⚠️ Moyenne | Ne pas se faire enfermer en niche |

### Réponse aux attaques

| Attaque concurrente | Défense Ethnostyles |
|---------------------|---------------------|
| "On a aussi un test valeurs" | 170 valeurs vs leurs 20 items génériques |
| "On est déjà intégrés chez le client" | Vous ciblez Marketing + Data, pas que RH |
| "On infère les valeurs par le comportement" | Inférence ≠ déclaratif validé scientifiquement |
| "Gratuit dans nos outils" | First-party data + RGPD-friendly |

---

## Features additionnelles identifiées

### Onboarding IA personnalisé

**Concept :**
```
Entreprise transmet son process d'onboarding
            ↓
    Ethnostyles IA adapte
            ↓
Onboarding personnalisé par profil Ethnostyles
```

**Exemple :**
- Profil "Mythe du Progrès" → Onboarding orienté innovation, autonomie rapide
- Profil "Mythe de la Sécurité" → Onboarding structuré, checklist, accompagnement

**Valeur :** Upsell premium, différenciateur fort

### Partage social par Mythe

**Concept :** Les collaborateurs partagent leur "Mythe" (identité), pas un score (comparatif).

| Approche évitée | Approche adoptée |
|-----------------|------------------|
| "J'ai 78/100" (compétition) | "Je suis Mythe du Progrès" (identité) |
| Hiérarchie entre profils | Différences à comprendre |

**Exemples de conversations :**
> "Moi je suis Mythe du Progrès — et toi ?"
> "Mythe de la Consommation — ça explique nos débats !"

**Effet :** Viralité interne, adoption organique, discussions machine à café

---

## Key Features & MVP Scope

### Features identifiées

| # | Feature | Cible | Priorité | Complexité |
|---|---------|-------|:--------:|:----------:|
| F1 | Questionnaire web (170Q) | Répondants | 🔴 Critique | Existe |
| F2 | Calcul profil / scoring | Backend | 🔴 Critique | Existe |
| F3 | Affichage résultat répondant | Répondants | 🔴 Critique | Existe |
| F4 | Console Admin — Création campagne | Acheteur | 🔴 Critique | Moyenne |
| F5 | Dashboard — Suivi temps réel | Acheteur | 🔴 Critique | Moyenne |
| F6 | Export CSV | Acheteur | 🔴 Critique | Faible |
| F7 | Passeport Ethnostyles — Code unique | Répondant | 🟠 Haute | Moyenne |
| F8 | Récupération profil par code | Répondant | 🟠 Haute | Moyenne |
| F9 | API REST | Data/Tech | 🟠 Haute | Moyenne |
| F10 | Branding campagne | Acheteur | 🟡 Moyenne | Faible |
| F11 | Champs custom | Acheteur | 🟡 Moyenne | Moyenne |
| F12 | Benchmark national | Acheteur | 🟡 Moyenne | Faible |
| F13 | Partage social Mythe | Répondant | 🟡 Moyenne | Faible |
| F14 | Onboarding IA personnalisé | RH | 🟢 Future | Élevée |
| F15 | Version light 70Q | Répondant | 🟢 Future | Moyenne |
| F16 | Multi-langue (EN) | Tous | 🟢 Future | Moyenne |

### MVP v1 — "Collecte & Visualisation"

| Feature | Statut |
|---------|:------:|
| F1 - Questionnaire web | ✅ Existant |
| F2 - Calcul scoring | ✅ Existant |
| F3 - Résultat répondant | ✅ Existant |
| F4 - Console Admin | ✅ MVP |
| F5 - Dashboard temps réel | ✅ MVP |
| F6 - Export CSV | ✅ MVP |
| F10 - Branding basique | ✅ MVP |

**Valeur :** Un client peut lancer une campagne et récupérer les données

### MVP v1.5 — "Passeport & API"

| Feature | Statut |
|---------|:------:|
| F7 - Passeport (code unique) | ✅ v1.5 |
| F8 - Récupération par code | ✅ v1.5 |
| F9 - API REST | ✅ v1.5 |
| F12 - Benchmark national | ✅ v1.5 |

**Valeur :** Effet réseau Passeport + intégration CRM

### v2 — "Engagement & Premium"

| Feature | Statut |
|---------|:------:|
| F11 - Champs custom | ✅ v2 |
| F13 - Partage social Mythe | ✅ v2 |
| F14 - Onboarding IA | ✅ v2 |
| F15 - Version light 70Q | ✅ v2 |
| F16 - Multi-langue | ✅ v2 |

**Valeur :** Upsell, rétention, expansion

### User Stories MVP v1

| # | User Story | Critère d'acceptation |
|---|------------|----------------------|
| US1 | En tant qu'Admin, je veux créer une campagne | Lien unique généré |
| US2 | En tant qu'Admin, je veux personnaliser le branding | Logo + couleur appliqués |
| US3 | En tant qu'Admin, je veux voir les réponses temps réel | Dashboard live |
| US4 | En tant qu'Admin, je veux exporter en CSV | CSV complet téléchargeable |
| US5 | En tant que Répondant, je veux répondre | Mobile-friendly, progression visible |
| US6 | En tant que Répondant, je veux voir mon profil | Affiché < 3 sec après fin |

---

## Success Metrics

### North Star Metric

**"Nombre de profils Ethnostyles générés par mois"**

- Reflète l'usage réel
- Corrélée au revenu
- Mesure les deux faces : acheteurs actifs × répondants engagés

### Métriques par phase

#### Phase 1 — MVP Launch (M1-M3)

| Métrique | Cible |
|----------|:-----:|
| Clients pilotes signés | 3-5 |
| Campagnes lancées | 10+ |
| Profils générés | 1 000 |
| Taux completion | > 90% |
| NPS répondant | > 40 |

#### Phase 2 — Traction (M4-M6)

| Métrique | Cible |
|----------|:-----:|
| Clients payants | 10+ |
| Profils / mois | 5 000 |
| Taux réponse email | > 5% |
| Churn client | < 10% / trimestre |
| ARR | 50K€+ |

#### Phase 3 — Scale (M7-M12)

| Métrique | Cible |
|----------|:-----:|
| Clients actifs | 30+ |
| Profils / mois | 20 000 |
| Passeports actifs | 10 000 |
| % via Passeport | > 20% |
| ARR | 200K€+ |

### Métriques Acheteur

| Métrique | Cible |
|----------|:-----:|
| Time-to-first-campaign | < 15 min |
| Campagnes / client / mois | > 2 |
| NPS Acheteur | > 50 |

### Métriques Répondant

| Métrique | Cible |
|----------|:-----:|
| Taux de clic email | > 5% |
| Taux completion | > 90% |
| Temps completion | < 12 min |
| Taux partage | > 10% |
| NPS Répondant | > 50 |

### Métriques Business (M12)

| Métrique | Cible |
|----------|:-----:|
| ARR | 200K€ |
| ARPU | 6-7K€ |
| CAC | < 2K€ |
| LTV | > 15K€ |
| LTV/CAC | > 3 |

---

## Résumé Exécutif Final

**Ethnostyles Profiler** est une plateforme d'assessment culturel B2B qui permet aux entreprises de collecter les profils de valeurs de leurs contacts via un questionnaire de 170 questions.

### Proposition de valeur unique
- **Win-win** : Le répondant découvre son profil, l'entreprise obtient des insights
- **Passeport Ethnostyles** : Un code, un profil à vie, réutilisable partout
- **170 valeurs ethnologiques** : Profondeur unique vs tests de personnalité classiques

### Cibles
- **Acheteurs** : Marketing, RH, Data/Insights dans les grands comptes
- **Répondants** : Clients, employés, candidats

### Killer Features
1. Segmentation par valeurs (Marketing)
2. Cartographie culturelle (RH)
3. Enrichissement CRM (Data)
4. Onboarding IA personnalisé (RH)
5. Partage social par Mythe (viralité)

### MVP v1
- Console Admin (création campagne, dashboard, export)
- Questionnaire existant adapté
- Branding basique

### Contraintes non-négociables
- RGPD by design
- Pas de scoring/filtrage candidats
- Transparence totale avec les répondants

### Objectifs M12
- 30 clients actifs
- 20K profils/mois
- 200K€ ARR

---

*Document généré le 2026-01-23*
*Auteur : Renaud.cosson-ext*
*Version : 1.0 — Product Brief finalisé*
