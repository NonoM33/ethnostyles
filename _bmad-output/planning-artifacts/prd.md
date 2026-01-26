---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'step-12-complete']
completedAt: '2026-01-23'
inputDocuments:
  - '_bmad-output/planning-artifacts/product-brief-etnostyles-2026-01-23.md'
  - '_bmad-output/analysis/brainstorming-session-2026-01-23.md'
workflowType: 'prd'
documentCounts:
  brief: 1
  research: 0
  brainstorming: 1
  projectDocs: 0
classification:
  projectType: saas_b2b, web_app
  domain: MarTech / HR Tech
  complexity: medium
  projectContext: hybrid
futureRoadmap:
  - name: Ethnostyles Connect
    description: Passeport localStorage + API pour personnalisation e-commerce
    phase: v3+
date: 2026-01-23
author: Renaud.cosson-ext
---

# Product Requirements Document - Ethnostyles Profiler

**Author:** Renaud.cosson-ext
**Date:** 2026-01-23
**Version:** 1.0
**Status:** Complet — Prêt pour validation

---

## Executive Summary

**Ethnostyles Profiler** est une plateforme SaaS B2B qui permet aux entreprises de profiler leurs clients et collaborateurs selon leurs valeurs culturelles profondes via un questionnaire de 170 questions.

**Différenciateur clé :** Le modèle Win-Win — le répondant reçoit son profil personnel ("Mythe") en échange de sa participation, garantissant des taux de completion exceptionnels (~90% vs 10-20% industrie).

**Innovation stratégique :** Le "Passeport Ethnostyles" — un code unique portable permettant au profil de suivre la personne d'une entreprise à l'autre, créant un effet réseau.

| Cible | Besoin |
|-------|--------|
| **Marketing (grands comptes)** | Segmenter par valeurs, pas par démographie |
| **RH (ETI/grands comptes)** | Objectiver le culture fit, réduire le turnover |
| **Data Teams** | Enrichir le data lake avec la dimension "pourquoi" |

**North Star Metric :** Nombre de profils Ethnostyles générés par mois

---

## Document de référence

Ce PRD est basé sur le **Product Brief Ethnostyles Profiler** (2026-01-23) qui définit la vision, les personas, les killer features, les contraintes éthiques et les métriques de succès.

---

## Success Criteria

### North Star Metric

**"Nombre de profils Ethnostyles générés par mois"**

Cette métrique reflète l'usage réel, est corrélée au revenu, et mesure les deux faces du produit (acheteurs actifs × répondants engagés).

### User Success — Répondant

| Métrique | Cible | Moment de succès |
|----------|:-----:|------------------|
| Taux de clic email → questionnaire | > 5% | "Ce test m'intrigue" |
| Taux de completion | > 90% | "J'ai envie de voir mon résultat" |
| Temps completion | < 12 min | "C'était rapide finalement" |
| Taux de partage profil | > 10% | "Je veux montrer qui je suis" |
| NPS Répondant | > 50 | "Ce profil me correspond vraiment" |

**Moment "Aha!" :** Le répondant découvre son profil et se dit "C'est exactement moi".

### User Success — Acheteur/Admin

| Métrique | Cible | Moment de succès |
|----------|:-----:|------------------|
| Time-to-first-campaign | < 15 min | "C'était simple à configurer" |
| Campagnes / client / mois | > 2 | "J'utilise ça régulièrement" |
| Taux d'export/consultation | > 50% | "Ces données sont actionnables" |
| NPS Acheteur | > 50 | "Ça m'apporte une vraie valeur" |

**Moment "Aha!" :** L'admin découvre un insight sur ses clients qu'il n'aurait jamais eu autrement.

### Business Success

| Phase | Métrique | Cible |
|-------|----------|:-----:|
| **M1-M3 (MVP)** | Clients pilotes | 3-5 |
| | Campagnes lancées | 10+ |
| | Profils générés | 1 000 |
| **M4-M6 (Traction)** | Clients payants | 10+ |
| | Profils / mois | 5 000 |
| | ARR | 50K€+ |
| **M7-M12 (Scale)** | Clients actifs | 30+ |
| | Profils / mois | 20 000 |
| | ARR | 200K€ |
| | LTV/CAC | > 3 |

### Technical Success

*Détails complets : voir section [Non-Functional Requirements](#non-functional-requirements)*

| Métrique | Cible | Criticité |
|----------|:-----:|:---------:|
| Uptime plateforme | > 99.5% | 🔴 Haute |
| Temps chargement questionnaire | < 2 sec | 🔴 Haute |
| Temps calcul profil | < 3 sec | 🟠 Moyenne |
| Taux d'erreur API | < 0.1% | 🟠 Moyenne |
| Régression scoring | 0 bug | 🔴 Critique |

### Measurable Outcomes

| Outcome | Comment le mesurer | Fréquence |
|---------|-------------------|-----------|
| Product-Market Fit | NPS > 40, Retention > 80% | Mensuel |
| Activation client | % clients avec > 1 campagne | Hebdo |
| Engagement répondant | Completion rate | Temps réel |
| Viralité | % profils partagés | Mensuel |

---

## Product Scope

### MVP — Minimum Viable Product

**Objectif :** Un client peut lancer une campagne et récupérer des profils.

| Feature | Priorité | Existant |
|---------|:--------:|:--------:|
| Questionnaire web 170Q | 🔴 Critique | ✅ Oui |
| Calcul scoring/profil | 🔴 Critique | ✅ Oui |
| Affichage résultat répondant | 🔴 Critique | ✅ Oui |
| Console Admin — Création campagne | 🔴 Critique | ❌ À faire |
| Dashboard — Suivi temps réel | 🔴 Critique | ❌ À faire |
| Export CSV | 🔴 Critique | ❌ À faire |
| Branding basique (logo, couleur) | 🟠 Haute | ❌ À faire |

### Growth Features (v1.5)

| Feature | Valeur ajoutée |
|---------|----------------|
| Passeport Ethnostyles (code unique) | Effet réseau, friction réduite |
| Récupération profil par code | 0 question si déjà profilé |
| API REST | Intégration CRM/CDP |
| Benchmark national | Comparaison au référentiel 2000 pers. |

### Vision (v2+)

| Feature | Phase | Description |
|---------|:-----:|-------------|
| Champs custom | v2 | Ajouter des questions spécifiques |
| Partage social Mythe | v2 | Viralité interne entreprise |
| Onboarding IA personnalisé | v2 | L'IA adapte l'onboarding au profil |
| Version light 70Q | v2 | Questionnaire rapide 5 min |
| Multi-langue (EN) | v2 | Expansion internationale |
| Ethnostyles Connect | v3+ | Personnalisation e-commerce via Passeport |

---

## User Journeys

### Journey 1 : Marie, Directrice Marketing — "Comprendre enfin mes clients"

**Persona :** Marie, 42 ans, Directrice Marketing d'un groupe bancaire

**Opening Scene :**
Marie fixe son dashboard analytics avec frustration. Ses segments "25-35 ans urbains" ne prédisent rien. La dernière campagne email a fait 0.8% de conversion.

**Rising Action :**
1. Découvre Ethnostyles via webinar
2. Crée un compte et lance une campagne test sur 5 000 clients
3. Attend les réponses (3-6% répondent)
4. Consulte le dashboard : profils en temps réel

**Climax :**
Découvre que ses meilleurs clients sont 70% "Mythe du Progrès". Comprend POURQUOI ils achètent.

**Resolution :**
Campagne suivante : 2.4% de conversion. Devient ambassadrice interne.

---

### Journey 2 : Lucas, Client Banque — "Découvrir qui je suis"

**Persona :** Lucas, 34 ans, client bancaire, sur mobile dans le métro

**Opening Scene :**
Reçoit email : "Découvrez votre profil de valeurs — 10 min". Intrigué, clique.

**Rising Action :**
1. Écran d'accueil : "170 questions, votre profil en récompense"
2. Questions variées, pas ennuyeuses
3. Barre de progression : 30%... 60%... 90%...
4. Termine avant sa station

**Climax :**
Profil affiché : "Mythe du Progrès — Innovateur, optimiste". Pense "C'est exactement moi".

**Resolution :**
Reçoit code Passeport. Partage sur LinkedIn. Collègues font le test.

---

### Journey 3 : Thomas, DRH — "Objectiver le culture fit"

**Persona :** Thomas, DRH ETI 800 personnes, turnover 25% sur nouvelles recrues

**Opening Scene :**
Recrute des gens compétents qui partent après 8 mois. Intuition "fit culturel" ne marche pas.

**Rising Action :**
1. Lance Ethnostyles sur 50 dernières recrues
2. Profile ses "top performers"
3. Compare : top performers = 80% "Mythe de la Sécurité"
4. Réalise le décalage culture/recrutement

**Climax :**
Adapte l'onboarding par profil. Turnover 6 mois : 25% → 15%.

**Resolution :**
Intègre Ethnostyles dans l'onboarding jour 1.

---

### Journey 4 : Sophie, Data Analyst — "Intégrer dans le data lake"

**Persona :** Sophie, Data Analyst retailer, gère le data lake

**Opening Scene :**
Données transactionnelles mais aucune variable "motivation". CMO veut le "pourquoi".

**Rising Action :**
1. Évalue Ethnostyles comme enrichissement
2. Teste API sur 100 clients
3. Valide format et qualité
4. Intègre dans pipeline ETL

**Climax :**
Croise profil × achat : "Hédonistes" achètent 3x plus en promo flash.

**Resolution :**
Présente au COMEX. Décision : profiler toute la base.

---

### Journey 5 : Claire, Account Manager Ethnostyles — "Gérer les clients"

**Persona :** Claire, account manager interne, suit 15 clients

**Opening Scene :**
Doit voir d'un coup d'œil qui a des problèmes.

**Rising Action :**
1. Console admin interne
2. Dashboard global : campagnes, taux, alertes
3. Client avec completion 60% (anormal)
4. Investigue : bug mobile Safari

**Climax :**
Alerte dev, bug fixé en 2h. Contacte client.

**Resolution :**
Client satisfait de la réactivité. Churn évité.

---

### Journey Requirements Summary

| Capability | Journeys |
|------------|----------|
| Création campagne self-service | Marie, Thomas |
| Dashboard temps réel | Marie, Thomas, Claire |
| Export CSV | Marie, Thomas |
| API REST | Sophie |
| Questionnaire mobile-first | Lucas |
| Résultat immédiat < 3 sec | Lucas |
| Passeport (code unique) | Lucas |
| Partage social | Lucas |
| Console admin interne | Claire |
| Alertes/monitoring | Claire |

---

## Domain-Specific Requirements

### Compliance & Réglementaire

| Exigence | Niveau | Détail |
|----------|:------:|--------|
| **RGPD** | 🔴 Obligatoire | Données personnelles sur les valeurs |
| **Consentement explicite** | 🔴 Obligatoire | Opt-in avant questionnaire |
| **Droit à l'oubli** | 🔴 Obligatoire | Suppression sur demande |
| **Portabilité** | 🔴 Obligatoire | Export des données personnelles |

### Contraintes Éthiques

| Contrainte | Implémentation |
|------------|----------------|
| Pas de scoring candidat | Aucune feature de "fit score" |
| Pas de filtrage RH | Interdit d'utiliser pour exclure |
| Transparence répondant | Toujours montrer le profil au répondant |
| Clause contractuelle | Client s'engage à usage non-discriminant |

### Contraintes Techniques

*Détails complets : voir section [Non-Functional Requirements — Sécurité](#sécurité)*

| Contrainte | Cible |
|------------|:-----:|
| Chiffrement at rest | AES-256 |
| Chiffrement in transit | TLS 1.3 |
| Logs d'audit | Oui |
| Isolation multi-tenant | Stricte |

### Flow MVP — Intégrations

```
ADMIN                           PLATEFORME                      RÉPONDANT
─────                           ──────────                      ─────────
Crée campagne          →        Génère lien unique
Copie le lien
Envoie via SON outil   →        (externe)            →          Reçoit email
                                                                Clique lien
                                                                Fait questionnaire
                                Calcule profil       →          Voit résultat
                                Envoie email auto    →          Reçoit Passeport
Voit dashboard         ←        Stocke données
Exporte CSV            ←
```

**Seul email automatique MVP :** Email au répondant avec résultat + code Passeport

---

## Innovation & Novel Patterns

### Innovation principale : Passeport Ethnostyles

**Concept :** Code unique, portable, réutilisable à vie. Le profil suit la personne d'une entreprise à l'autre.

| Solution existante | Portabilité |
|-------------------|:-----------:|
| MBTI, DISC | ❌ Refaire à chaque fois |
| AssessFirst | ❌ Lié à une entreprise |
| **Ethnostyles** | ✅ Passeport à vie |

**Effet réseau :** Plus de gens ont leur Passeport → plus facile de collecter des profils → plus de valeur pour les entreprises.

### Innovation business model : Win-win Assessment

| Sondage classique | Ethnostyles |
|-------------------|-------------|
| "Aidez-nous" | "Découvrez-vous" |
| 10-20% completion | ~100% completion |
| Répondant = ressource | Répondant = bénéficiaire |

### Innovation future : Ethnostyles Connect (v3+)

Le profil de valeurs suit l'utilisateur sur le web et personnalise son expérience e-commerce. Self-Sovereign Identity pour les valeurs.

### Validation Approach

| Innovation | Comment valider | Quand |
|------------|-----------------|-------|
| Passeport | % codes réutilisés après 6 mois | Post-MVP |
| Win-win | Taux completion vs benchmark | MVP |
| Connect | POC avec 1 e-commerce partenaire | v3 |

---

## SaaS B2B Specific Requirements

### Multi-tenancy

- Isolation stricte par client (tenant)
- Chaque client voit uniquement ses campagnes et profils
- Pas de partage de données entre tenants

### Modèle de facturation

**Pricing par profil généré**
- Facturation à l'usage
- Compteur de profils par campagne
- Dashboard usage visible pour le client

### Permission Model (MVP)

| Rôle | Droits |
|------|--------|
| **Admin** | Tout : créer, éditer, supprimer, exporter, inviter |
| **Viewer** | Lecture seule : dashboard, résultats |

### Intégrations

| Intégration | Phase | Méthode |
|-------------|:-----:|---------|
| Export données | MVP | CSV téléchargeable |
| API REST | v1.5 | JSON, auth par API key |
| Webhooks | v2 | Notification nouveaux profils |

---

## Web App Specific Requirements

### Architecture

- SPA (Single Page Application)
- Framework : React ou Vue (à définir)
- État temps réel : WebSocket ou polling

### Browser Support

| Browser | Version |
|---------|---------|
| Chrome | Last 2 |
| Safari | Last 2 |
| Firefox | Last 2 |
| Edge | Last 2 |

### Responsive Design

- Console Admin : Desktop-first (responsive)
- Questionnaire : Mobile-first

### Accessibilité

- WCAG 2.1 AA
- Navigation clavier
- Lecteurs d'écran compatibles

---

## Project Scoping & Phased Development

### MVP Strategy

**Approche : Problem-Solving MVP + Experience MVP (répondant)**

| Composant | Approche UX | Justification |
|-----------|:-----------:|---------------|
| Questionnaire | 🔴 Excellence | Le win-win dépend de l'expérience répondant |
| Résultat profil | 🔴 Excellence | Moment "Wow" critique |
| Console Admin | 🟡 Fonctionnel | Le client B2B tolère une UX basique |
| Dashboard | 🟡 Fonctionnel | Lisible suffit pour MVP |

### UX Questionnaire — Non-négociable MVP

| Critère | Cible |
|---------|:-----:|
| Mobile-first | Oui |
| Progression visible | Barre + % |
| Temps estimé restant | Affiché |
| Questions variées | Pas monotone |
| Chargement | < 2 sec |
| Résultat immédiat | < 3 sec |
| Design | Moderne, agréable |

### MVP Feature Set (Phase 1)

**Journeys supportés :**
- ✅ Marie (Marketing) — Créer, voir, exporter
- ✅ Lucas (Répondant) — Questionnaire, profil
- ⚠️ Thomas (RH) — Possible, pas optimisé

**Must-Have :**

| Feature | Statut |
|---------|:------:|
| Questionnaire web UX excellent | ✅ MVP |
| Calcul profil | ✅ MVP (existe) |
| Résultat répondant UX excellent | ✅ MVP |
| Console Admin — Créer campagne | ✅ MVP |
| Dashboard — Voir réponses | ✅ MVP |
| Export CSV | ✅ MVP |
| Email auto — Résultat + Passeport | ✅ MVP |
| Branding basique | ✅ MVP |

### Post-MVP Features

**Phase 2 — Growth (v1.5) :**
- Passeport réutilisable (récupération par code)
- API REST
- Benchmark national
- Console admin interne
- Webhooks

**Phase 3 — Vision (v2+) :**
- Onboarding IA personnalisé
- Ethnostyles Connect (e-commerce)
- Multi-langue
- Version light 70Q
- Partage social Mythe

### Risk Mitigation

| Risque | Mitigation |
|--------|------------|
| Scoring bugué | Tests régression, audit code |
| Clients ne payent pas | LOI avant dev, POC payants |
| Ressources limitées | MVP ultra-lean |

---

## Functional Requirements

### Campaign Management

- **FR1:** Admin peut créer une nouvelle campagne
- **FR2:** Admin peut nommer et décrire une campagne
- **FR3:** Admin peut personnaliser le branding (logo, couleur)
- **FR4:** Admin peut obtenir un lien unique partageable
- **FR5:** Admin peut voir la liste de ses campagnes
- **FR6:** Admin peut archiver une campagne
- **FR7:** Admin peut dupliquer une campagne (v1.5)

### Questionnaire Experience

- **FR8:** Répondant peut accéder au questionnaire via un lien
- **FR9:** Répondant peut voir le temps estimé avant de commencer
- **FR10:** Répondant peut répondre aux 170 questions
- **FR11:** Répondant peut voir sa progression (% complété)
- **FR12:** Répondant peut voir le temps restant estimé
- **FR13:** Répondant peut reprendre un questionnaire interrompu
- **FR14:** Répondant peut compléter le questionnaire sur mobile
- **FR15:** Répondant peut entrer son code Passeport pour skip (v1.5)

### Profile & Results

- **FR16:** Répondant peut voir son profil immédiatement après completion
- **FR17:** Répondant peut voir son "Mythe" principal
- **FR18:** Répondant peut voir une description détaillée de son profil
- **FR19:** Répondant peut recevoir son profil par email
- **FR20:** Répondant peut recevoir son code Passeport par email
- **FR21:** Répondant peut partager son profil sur réseaux sociaux (v2)
- **FR22:** Répondant peut télécharger son profil en PDF (v2)

### Dashboard & Analytics

- **FR23:** Admin peut voir le nombre de réponses par campagne
- **FR24:** Admin peut voir le taux de completion
- **FR25:** Admin peut voir les réponses en temps réel
- **FR26:** Admin peut voir la répartition des profils (graphique)
- **FR27:** Admin peut filtrer les résultats par période
- **FR28:** Admin peut comparer au benchmark national (v1.5)

### Data Export & Integration

- **FR29:** Admin peut exporter les résultats en CSV
- **FR30:** Admin peut choisir les colonnes à exporter
- **FR31:** Admin peut récupérer les profils via API REST (v1.5)
- **FR32:** Admin peut s'authentifier à l'API avec une clé (v1.5)
- **FR33:** Admin peut recevoir des notifications webhook (v2)

### User Management

- **FR34:** Admin peut créer un compte entreprise
- **FR35:** Admin peut se connecter / déconnecter
- **FR36:** Admin peut inviter un Viewer à son compte
- **FR37:** Viewer peut consulter les dashboards (lecture seule)
- **FR38:** Admin peut révoquer l'accès d'un Viewer
- **FR39:** Admin peut réinitialiser son mot de passe

### Passeport System

- **FR40:** Système génère un code Passeport unique par répondant
- **FR41:** Répondant peut récupérer son Passeport perdu via email (v1.5)
- **FR42:** Répondant peut réutiliser son Passeport sur autre campagne (v1.5)
- **FR43:** Système reconnaît un Passeport et récupère le profil (v1.5)

### Compliance & Ethics

- **FR44:** Répondant peut consulter la politique de confidentialité
- **FR45:** Répondant doit consentir avant de commencer
- **FR46:** Répondant peut demander la suppression de ses données
- **FR47:** Répondant peut exporter ses données personnelles (RGPD)
- **FR48:** Système log les exports de données pour audit

---

## Non-Functional Requirements

### Performance

| NFR | Métrique | Cible | Criticité |
|-----|----------|:-----:|:---------:|
| **NFR-P1** | Temps chargement questionnaire | < 2 sec | 🔴 |
| **NFR-P2** | Temps réponse entre questions | < 200 ms | 🔴 |
| **NFR-P3** | Temps calcul profil après completion | < 3 sec | 🔴 |
| **NFR-P4** | Temps chargement dashboard | < 3 sec | 🟠 |
| **NFR-P5** | Temps génération export CSV | < 10 sec (1000 lignes) | 🟡 |
| **NFR-P6** | Concurrence utilisateurs simultanés | 500 minimum | 🟠 |

### Sécurité

| NFR | Exigence | Détail |
|-----|----------|--------|
| **NFR-S1** | Chiffrement at rest | AES-256 pour toutes données personnelles |
| **NFR-S2** | Chiffrement in transit | TLS 1.3 obligatoire |
| **NFR-S3** | Authentification | MFA optionnel pour admins |
| **NFR-S4** | Session timeout | 30 min d'inactivité |
| **NFR-S5** | Logs d'audit | Actions CRUD, exports, accès |
| **NFR-S6** | Isolation multi-tenant | Aucune fuite de données entre clients |
| **NFR-S7** | Sanitization inputs | Protection XSS, injection |
| **NFR-S8** | API Keys | Rotation possible, révocation immédiate |

### Scalabilité

| NFR | Exigence | Cible |
|-----|----------|:-----:|
| **NFR-SC1** | Profils / mois | 20 000 (M12) |
| **NFR-SC2** | Tenants simultanés | 50 (MVP), 200 (v2) |
| **NFR-SC3** | Campagnes actives / tenant | 10 |
| **NFR-SC4** | Répondants simultanés / campagne | 100 |
| **NFR-SC5** | Dégradation sous charge | < 20% latence à 2x capacity |

### Accessibilité

| NFR | Exigence | Standard |
|-----|----------|----------|
| **NFR-A1** | Conformité WCAG | 2.1 niveau AA |
| **NFR-A2** | Navigation clavier | 100% fonctionnalités accessibles |
| **NFR-A3** | Lecteurs d'écran | Compatible NVDA, VoiceOver |
| **NFR-A4** | Contraste couleurs | Ratio 4.5:1 minimum |
| **NFR-A5** | Focus visible | Toujours visible sur tous éléments interactifs |

### Fiabilité

| NFR | Exigence | Cible |
|-----|----------|:-----:|
| **NFR-R1** | Uptime plateforme | > 99.5% |
| **NFR-R2** | RTO (Recovery Time Objective) | < 4 heures |
| **NFR-R3** | RPO (Recovery Point Objective) | < 1 heure |
| **NFR-R4** | Backup données | Quotidien, rétention 30 jours |
| **NFR-R5** | Zéro régression scoring | Tests automatisés obligatoires |
| **NFR-R6** | Taux d'erreur API | < 0.1% |

### Intégration (v1.5+)

| NFR | Exigence | Standard |
|-----|----------|----------|
| **NFR-I1** | Format API | REST JSON, OpenAPI 3.0 |
| **NFR-I2** | Rate limiting | 100 req/min par API key |
| **NFR-I3** | Versioning API | URL versioning (v1, v2) |
| **NFR-I4** | Documentation API | Swagger UI + exemples |
| **NFR-I5** | Webhooks delivery | 3 retries, backoff exponentiel |

