# Story 0.1: Setup du Monorepo et Infrastructure de Base

Status: review

## Story

As a developer,
I want the project infrastructure set up with Bun monorepo,
so that I can start building features on a solid foundation.

## Acceptance Criteria

1. **AC1: Monorepo Structure**
   - **Given** a fresh repository
   - **When** I run `bun install`
   - **Then** all workspaces (apps/api, apps/web, packages/*) are installed
   - **And** TypeScript strict mode is configured
   - **And** ESLint/Prettier are configured

2. **AC2: Development Server**
   - **Given** the monorepo is set up
   - **When** I run `bun run dev`
   - **Then** both API and web servers start successfully
   - **And** API is accessible at http://localhost:3000
   - **And** Web is accessible at http://localhost:5173

3. **AC3: Workspace Dependencies**
   - **Given** packages are defined
   - **When** apps import from packages
   - **Then** TypeScript resolves imports correctly
   - **And** changes in packages reflect immediately in apps

## Tasks / Subtasks

- [x] **Task 1: Initialize Monorepo Root** (AC: 1)
  - [x] Create root directory and initialize with `bun init`
  - [x] Configure `package.json` with workspaces: `["apps/*", "packages/*"]`
  - [x] Create `bunfig.toml` for Bun configuration
  - [x] Create `.gitignore` with standard ignores (node_modules, dist, .env, etc.)
  - [x] Create `.env.example` with required environment variables

- [x] **Task 2: Setup apps/api** (AC: 1, 2)
  - [x] Initialize apps/api with `bun init`
  - [x] Install Elysia and core plugins: `@elysiajs/cors`, `@elysiajs/swagger`
  - [x] Create basic `src/index.ts` with Elysia app
  - [x] Add health check endpoint: `GET /health`
  - [x] Configure `tsconfig.json` with strict mode
  - [x] Add dev script: `bun run --watch src/index.ts`

- [x] **Task 3: Setup apps/web** (AC: 1, 2)
  - [x] Create Vite + React + TypeScript project
  - [x] Install core dependencies: `react-router-dom`, `@tanstack/react-query`
  - [x] Install Framer Motion: `bun add framer-motion`
  - [x] Configure `tailwind.config.ts` for Tailwind v4
  - [x] Create basic App.tsx with router placeholder
  - [x] Add dev script in package.json

- [x] **Task 4: Setup packages/db** (AC: 1, 3)
  - [x] Initialize package with `bun init`
  - [x] Install Drizzle: `drizzle-orm`, `postgres`, `drizzle-kit`
  - [x] Create `drizzle.config.ts`
  - [x] Create `src/index.ts` exporting db client placeholder
  - [x] Create `src/schema/index.ts` as schema barrel export

- [x] **Task 5: Setup packages/shared** (AC: 1, 3)
  - [x] Initialize package with `bun init`
  - [x] Install TypeBox: `@sinclair/typebox`
  - [x] Create `src/index.ts` as main export
  - [x] Create `src/schemas/index.ts` for shared validation schemas
  - [x] Create `src/types/index.ts` for shared types

- [x] **Task 6: Setup packages/config** (AC: 1, 3)
  - [x] Initialize package with `bun init`
  - [x] Create `src/env.ts` for environment variable validation
  - [x] Create `src/index.ts` exporting config

- [x] **Task 7: Setup packages/email** (AC: 1, 3)
  - [x] Initialize package with `bun init`
  - [x] Install Resend: `resend`
  - [x] Create `src/index.ts` with email client placeholder
  - [x] Create `src/templates/` directory for future email templates

- [x] **Task 8: Configure Root TypeScript** (AC: 1)
  - [x] Create `tooling/typescript/tsconfig.base.json` with shared settings
  - [x] Extend base config in all workspace tsconfigs
  - [x] Configure path aliases for workspace imports

- [x] **Task 9: Configure Docker for PostgreSQL** (AC: 2)
  - [x] Create `docker-compose.yml` with PostgreSQL 16
  - [x] Configure volume for data persistence
  - [x] Add environment variables for dev database

- [x] **Task 10: Add Root Scripts** (AC: 2)
  - [x] Add `dev` script to run all apps concurrently
  - [x] Add `build` script to build all workspaces
  - [x] Add `lint` script for ESLint
  - [x] Add `format` script for Prettier
  - [x] Add `db:migrate` script for Drizzle migrations

## Dev Notes

### Architecture Compliance

This story implements the monorepo structure defined in the Architecture document:

```
etnostyles/
├── apps/
│   ├── api/              # Backend Bun + Elysia
│   └── web/              # Frontend Bun + Vite + React 19
├── packages/
│   ├── db/               # Drizzle schema + migrations
│   ├── shared/           # Types partagés (TypeBox schemas)
│   ├── config/           # Variables env partagées
│   └── email/            # Templates Resend
├── docker-compose.yml
├── bunfig.toml
└── package.json          # Bun workspace
```

### Technology Stack (Exact Versions)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Bun** | 1.3+ | Runtime & package manager |
| **Elysia** | latest | API framework |
| **Vite** | 6.x | Frontend build tool |
| **React** | 19 | UI framework |
| **TypeScript** | 5.x | Type safety |
| **Drizzle ORM** | latest | Database ORM |
| **PostgreSQL** | 16 | Database |
| **Tailwind CSS** | 4 | Styling |
| **shadcn/ui** | latest | Component library |
| **TypeBox** | latest | Shared validation schemas |
| **Resend** | latest | Email service |

### References

- [Architecture Document: Starter Template Section](_bmad-output/planning-artifacts/architecture.md#starter-template-evaluation)
- [Architecture Document: Project Structure](_bmad-output/planning-artifacts/architecture.md#complete-project-directory-structure)
- [Project Context](_bmad-output/project-context.md)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes

**Implementation completed successfully:**

1. **Monorepo Structure**: Created Bun workspace with apps/ and packages/ directories
2. **API (apps/api)**: Elysia server with CORS, Swagger, and health endpoint
3. **Web (apps/web)**: Vite + React 19 + TanStack Query + Framer Motion + Tailwind v4
4. **packages/db**: Drizzle ORM with PostgreSQL configuration
5. **packages/shared**: TypeBox schemas and shared types
6. **packages/config**: Environment variable validation
7. **packages/email**: Resend email client
8. **TypeScript**: Strict mode, path aliases, workspace references
9. **Docker**: PostgreSQL 16 with health check
10. **Scripts**: dev, build, lint, format, db:migrate

**Validation Results:**
- `bun install`: ✅ 476 packages installed
- TypeScript compile (api): ✅ Pass
- TypeScript compile (web): ✅ Pass
- API health check: ✅ Returns `{"status":"ok"}`

### File List

**Created:**
- `package.json` - Root workspace config
- `bunfig.toml` - Bun configuration
- `.gitignore` - Git ignore rules
- `.env.example` - Environment template
- `tsconfig.json` - Root TypeScript config
- `docker-compose.yml` - PostgreSQL container
- `tooling/typescript/tsconfig.base.json` - Shared TS config
- `apps/api/package.json`
- `apps/api/tsconfig.json`
- `apps/api/src/index.ts`
- `apps/web/package.json`
- `apps/web/tsconfig.json`
- `apps/web/vite.config.ts`
- `apps/web/index.html`
- `apps/web/postcss.config.js`
- `apps/web/src/main.tsx`
- `apps/web/src/App.tsx`
- `apps/web/src/index.css`
- `packages/db/package.json`
- `packages/db/tsconfig.json`
- `packages/db/drizzle.config.ts`
- `packages/db/src/index.ts`
- `packages/db/src/schema/index.ts`
- `packages/shared/package.json`
- `packages/shared/tsconfig.json`
- `packages/shared/src/index.ts`
- `packages/shared/src/schemas/index.ts`
- `packages/shared/src/types/index.ts`
- `packages/config/package.json`
- `packages/config/tsconfig.json`
- `packages/config/src/index.ts`
- `packages/config/src/env.ts`
- `packages/email/package.json`
- `packages/email/tsconfig.json`
- `packages/email/src/index.ts`
- `packages/email/src/templates/.gitkeep`

### Change Log

- 2026-01-25: Initial monorepo setup completed with all 10 tasks
