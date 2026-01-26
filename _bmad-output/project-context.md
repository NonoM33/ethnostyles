---
project_name: 'Ethnostyles Profiler'
user_name: 'Renaud.cosson-ext'
date: '2026-01-25'
status: 'complete'
---

# Project Context for AI Agents

_Règles critiques pour Ethnostyles Profiler. À lire avant toute implémentation._

---

## Technology Stack & Versions

| Tech | Version | Notes |
|------|---------|-------|
| **Runtime** | Bun 1.3+ | Front + Back unifié |
| **Backend** | Elysia latest | Bun-native, Eden Treaty |
| **ORM** | Drizzle latest | PostgreSQL, migrations SQL |
| **Database** | PostgreSQL 16 | Row-level security |
| **Frontend** | React 19 | Vite 6.x |
| **State** | TanStack Query 5.x | Cache, optimistic UI |
| **Forms** | React Hook Form | + TypeBox validation |
| **UI** | shadcn/ui + Tailwind 4 | WCAG 2.1 AA |
| **Auth** | Better Auth | Self-hosted |
| **Email** | Resend | Transactional |

---

## Critical Implementation Rules

### Multi-Tenant (OBLIGATOIRE)

- **TOUJOURS** inclure `tenant_id` dans les queries DB
- Middleware `tenant.ts` injecte le tenant_id automatiquement
- Row-Level Security activé sur toutes les tables
- **JAMAIS** de query sans filtre tenant

### Naming Conventions

| Context | Convention | Exemple |
|---------|------------|---------|
| DB tables | `snake_case` pluriel | `campaigns`, `user_profiles` |
| DB columns | `snake_case` | `tenant_id`, `created_at` |
| API endpoints | `kebab-case` pluriel | `/campaigns`, `/user-profiles` |
| Fichiers React | `PascalCase.tsx` | `CampaignCard.tsx` |
| Fonctions | `camelCase` | `getCampaigns()` |
| Types | `PascalCase` | `Campaign`, `UserProfile` |

### TypeScript Rules

- TypeBox pour TOUTE validation (partagé front/back via `packages/shared`)
- Eden Treaty pour les appels API (jamais fetch direct)
- Strict mode activé
- No `any` - utiliser `unknown` si nécessaire

### React Patterns

```typescript
// TOUJOURS ce pattern pour les queries
const { data, isLoading, isError, error } = useQuery(...)

if (isLoading) return <Skeleton />
if (isError) return <ErrorMessage error={error} />
return <Content data={data} />
```

- Tests co-located : `Component.tsx` + `Component.test.tsx`
- Exports via barrel : `features/campaigns/index.ts`
- Hooks custom dans `features/*/hooks/`

### API Response Format

```typescript
// Succès : retour direct (pas de wrapper)
GET /campaigns → Campaign[]

// Erreur : format standard
{
  error: "CAMPAIGN_NOT_FOUND",  // Code machine
  message: "La campagne n'existe pas",  // Message humain
  details?: unknown  // Validation errors
}
```

### Error Handling

- Backend : try/catch → format erreur standard → log
- Frontend : Error Boundary global + toast pour erreurs user
- Logging format : `logger.info('domain:action', { data })`

---

## Anti-Patterns (INTERDIT)

```typescript
// ❌ JAMAIS - Query sans tenant
db.select().from(campaigns)

// ✅ TOUJOURS
db.select().from(campaigns).where(eq(campaigns.tenant_id, tenantId))

// ❌ JAMAIS - fetch direct
const res = await fetch('/api/campaigns')

// ✅ TOUJOURS - Eden Treaty
const res = await api.campaigns.get()

// ❌ JAMAIS - any
function process(data: any)

// ✅ TOUJOURS
function process(data: unknown)

// ❌ JAMAIS - Skip loading state
return <List data={data} />

// ✅ TOUJOURS
if (isLoading) return <Skeleton />
```

---

## Project Structure

```
apps/api/src/routes/     → API endpoints
apps/api/src/services/   → Business logic
apps/api/src/middleware/ → Auth, tenant, logging
apps/web/src/features/   → Feature modules
apps/web/src/components/ → Shared UI
packages/db/src/schema/  → Drizzle schemas
packages/shared/         → TypeBox schemas partagés
packages/config/         → Env vars
packages/email/          → Templates Resend
```

---

## Testing Rules

- Tests co-located avec les fichiers source
- Nommage : `*.test.ts` ou `*.test.tsx`
- Pattern AAA : Arrange, Act, Assert
- Mock DB avec fixtures (`packages/db/seed.ts`)

---

## Security Checklist

- [ ] tenant_id vérifié sur chaque requête
- [ ] Input validé avec TypeBox
- [ ] Pas de données sensibles dans les logs
- [ ] CORS configuré (`@elysiajs/cors`)
- [ ] Rate limiting sur auth endpoints
