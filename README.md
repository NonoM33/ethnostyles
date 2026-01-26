# Ethnostyles Profiler

B2B SaaS platform for cultural profiling questionnaires based on the Ethnostyles methodology.

## Tech Stack

- **Runtime**: Bun 1.3+
- **API**: Elysia with TypeBox validation
- **Web**: React + Vite + TailwindCSS
- **Database**: PostgreSQL with Drizzle ORM
- **Email**: Resend

## Getting Started

### Prerequisites

- Bun 1.3+
- Docker (for PostgreSQL)

### Setup

1. Clone the repository
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
3. Start PostgreSQL:
   ```bash
   docker-compose up -d
   ```
4. Install dependencies:
   ```bash
   bun install
   ```
5. Run migrations:
   ```bash
   bun run db:push
   ```
6. Seed the database:
   ```bash
   bun run db:seed
   ```
7. Start development servers:
   ```bash
   bun run dev
   ```

### Demo Credentials

After seeding:
- Email: `admin@demo.ethnostyles.com`
- Password: `password123`

## Project Structure

```
etnostyles/
├── apps/
│   ├── api/          # Elysia API server
│   └── web/          # React frontend
├── packages/
│   ├── db/           # Drizzle ORM schema & migrations
│   └── email/        # Email templates & sending
└── _bmad-output/     # Planning artifacts
```

## Features

- Multi-tenant architecture
- Campaign management with branding
- 170-question questionnaire with mobile-first UX
- 8 Mythe profiles (Explorateur, Gardien, Créateur, etc.)
- Passeport system for profile reuse
- Real-time dashboard with charts
- CSV/PDF export
- REST API with API key authentication
- Social sharing
- Webhooks
- RGPD compliance (data export/deletion)

## API Documentation

Swagger UI available at: `http://localhost:3000/swagger`
