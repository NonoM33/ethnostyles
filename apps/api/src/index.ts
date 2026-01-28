import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import { runMigrations } from '@etnostyles/db'
import { authRoutes } from './routes/auth'
import { teamRoutes } from './routes/team'
import { campaignRoutes } from './routes/campaigns'
import { questionnaireRoutes } from './routes/questionnaire'
import { dashboardRoutes } from './routes/dashboard'
import { apiKeyRoutes } from './routes/api-keys'
import { apiV1Routes } from './routes/api-v1'
import { organizationRoutes } from './routes/organization'
import { teamsRoutes } from './routes/teams'
import { analyticsRoutes } from './routes/analytics'
import { billingRoutes } from './routes/billing'
import { mcpRoutes } from './routes/mcp'

// Run migrations on startup
try {
  await runMigrations()
} catch (error) {
  console.error('Failed to run migrations on startup:', error)
  // Continue running the app even if migrations fail
  // This allows the health check to work and lets us debug the issue
}

const app = new Elysia()
  .use(cors({
    origin: process.env['WEB_URL'] || 'http://localhost:5173',
    credentials: true,
  }))
  .use(swagger({
    path: '/docs',
    documentation: {
      info: {
        title: 'Ethnostyles API',
        version: '1.0.0',
        description: `
# Ethnostyles Profiler API

## Authentication

### Session-based (Admin Console)
Use Bearer token in Authorization header for admin console endpoints.

### API Key (REST API v1)
Use X-API-Key header for programmatic access.

## Rate Limiting
API v1 endpoints are rate-limited to 100 requests per minute per API key.

## Response Format
All responses are JSON with consistent error format:
\`\`\`json
{ "error": "ERROR_CODE", "message": "Human readable message" }
\`\`\`
        `,
      },
      tags: [
        { name: 'Health', description: 'Health check endpoints' },
        { name: 'Auth', description: 'Authentication endpoints' },
        { name: 'Team', description: 'Team management endpoints' },
        { name: 'Campaigns', description: 'Campaign management endpoints' },
        { name: 'Questionnaire', description: 'Public questionnaire endpoints' },
        { name: 'Dashboard', description: 'Dashboard and analytics endpoints' },
        { name: 'API Keys', description: 'API key management' },
        { name: 'API v1', description: 'Public REST API (X-API-Key auth)' },
        { name: 'Organization', description: 'Organization settings' },
        { name: 'Teams', description: 'Team campaigns and composition (Epic 10)' },
        { name: 'Analytics', description: 'Advanced analytics - Culture map, Gap analysis, Trends (Epic 11)' },
        { name: 'Billing', description: 'Subscription, payments and invoices (Stripe integration)' },
        { name: 'MCP', description: 'Model Context Protocol for LLM integration' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            description: 'Session token from login',
          },
          apiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key',
            description: 'API key for REST API v1',
          },
        },
      },
    },
  }))
  .get('/health', () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'etnostyles-api'
  }), {
    detail: {
      tags: ['Health'],
      summary: 'Health check'
    }
  })
  .post('/db/migrate', async () => {
    const fs = await import('fs')

    // Check what's in the migrations folder
    const migrationsPath = '/app/packages/db/drizzle'
    let files: string[] = []
    let migrationError: string | null = null

    try {
      files = fs.readdirSync(migrationsPath)
    } catch (e) {
      migrationError = `Cannot read migrations folder: ${e instanceof Error ? e.message : 'Unknown error'}`
    }

    // Try to run migrations
    let migrationResult: string = 'not attempted'
    if (!migrationError) {
      try {
        const { runMigrations } = await import('@etnostyles/db')
        await runMigrations()
        migrationResult = 'success'
      } catch (e) {
        migrationResult = `failed: ${e instanceof Error ? e.message : 'Unknown error'}`
      }
    }

    // Check tables after migration
    const { db } = await import('@etnostyles/db')
    const { sql } = await import('drizzle-orm')
    let tables: any[] = []
    let tablesError: string | null = null
    let createdTables: string[] = []

    try {
      const result = await db.execute(sql`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name
      `)
      // Handle both array and object with rows property
      tables = Array.isArray(result) ? result : (result.rows || []) as any[]

      // Check for missing critical tables and create them
      const existingTables = (tables || []).map((t: any) => t.table_name)
      const requiredTables = ['tenants', 'users', 'sessions', 'accounts', 'verification_tokens', 'campaigns', 'respondents', 'responses', 'questions']

      for (const table of requiredTables) {
        if (!existingTables.includes(table)) {
          try {
            // Create missing tables
            if (table === 'sessions') {
              await db.execute(sql`
                CREATE TABLE IF NOT EXISTS "sessions" (
                  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
                  "token" varchar(255) NOT NULL UNIQUE,
                  "expires_at" timestamp NOT NULL,
                  "ip_address" varchar(45),
                  "user_agent" text,
                  "created_at" timestamp DEFAULT now() NOT NULL,
                  "updated_at" timestamp DEFAULT now() NOT NULL
                )
              `)
              createdTables.push('sessions')
            }
            if (table === 'accounts') {
              await db.execute(sql`
                CREATE TABLE IF NOT EXISTS "accounts" (
                  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
                  "account_id" varchar(255) NOT NULL,
                  "provider_id" varchar(50) NOT NULL,
                  "access_token" text,
                  "refresh_token" text,
                  "access_token_expires_at" timestamp,
                  "refresh_token_expires_at" timestamp,
                  "scope" text,
                  "id_token" text,
                  "password" text,
                  "created_at" timestamp DEFAULT now() NOT NULL,
                  "updated_at" timestamp DEFAULT now() NOT NULL
                )
              `)
              createdTables.push('accounts')
            }
            if (table === 'verification_tokens') {
              await db.execute(sql`
                CREATE TABLE IF NOT EXISTS "verification_tokens" (
                  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
                  "token" varchar(255) NOT NULL UNIQUE,
                  "expires_at" timestamp NOT NULL,
                  "created_at" timestamp DEFAULT now() NOT NULL
                )
              `)
              createdTables.push('verification_tokens')
            }
            if (table === 'campaigns') {
              await db.execute(sql`
                CREATE TABLE IF NOT EXISTS "campaigns" (
                  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
                  "name" varchar(255) NOT NULL,
                  "description" text,
                  "status" varchar(20) DEFAULT 'draft' NOT NULL,
                  "slug" varchar(100) NOT NULL UNIQUE,
                  "logo_url" varchar(500),
                  "primary_color" varchar(7),
                  "questionnaire_size" varchar(20) DEFAULT 'standard',
                  "webhook_url" varchar(500),
                  "webhook_secret" varchar(64),
                  "created_at" timestamp DEFAULT now() NOT NULL,
                  "updated_at" timestamp DEFAULT now() NOT NULL
                )
              `)
              createdTables.push('campaigns')
            }
            if (table === 'respondents') {
              await db.execute(sql`
                CREATE TABLE IF NOT EXISTS "respondents" (
                  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                  "campaign_id" uuid NOT NULL REFERENCES "campaigns"("id") ON DELETE CASCADE,
                  "email" varchar(255) NOT NULL,
                  "status" varchar(20) DEFAULT 'in_progress' NOT NULL,
                  "current_question" integer DEFAULT 1 NOT NULL,
                  "total_questions" integer DEFAULT 30 NOT NULL,
                  "consent_given" boolean DEFAULT false NOT NULL,
                  "consent_at" timestamp,
                  "passeport_code" varchar(14) UNIQUE,
                  "primary_mythe" varchar(50),
                  "secondary_mythe" varchar(50),
                  "confidence_score" integer,
                  "profile_data" text,
                  "started_at" timestamp DEFAULT now() NOT NULL,
                  "completed_at" timestamp,
                  "created_at" timestamp DEFAULT now() NOT NULL,
                  "updated_at" timestamp DEFAULT now() NOT NULL
                )
              `)
              createdTables.push('respondents')
            }
            if (table === 'responses') {
              await db.execute(sql`
                CREATE TABLE IF NOT EXISTS "responses" (
                  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                  "respondent_id" uuid NOT NULL REFERENCES "respondents"("id") ON DELETE CASCADE,
                  "question_id" integer NOT NULL,
                  "answer_index" integer NOT NULL,
                  "answered_at" timestamp DEFAULT now() NOT NULL
                )
              `)
              createdTables.push('responses')
            }
            if (table === 'questions') {
              await db.execute(sql`
                CREATE TABLE IF NOT EXISTS "questions" (
                  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                  "number" integer NOT NULL UNIQUE,
                  "text" text NOT NULL,
                  "type" varchar(20) DEFAULT 'choice' NOT NULL,
                  "round" integer,
                  "options" jsonb NOT NULL,
                  "category" varchar(50),
                  "weight" integer DEFAULT 1,
                  "is_active" boolean DEFAULT true NOT NULL
                )
              `)
              createdTables.push('questions')
            }
          } catch (tableErr) {
            // Ignore if table already exists
          }
        }
      }

      // Refresh table list
      const refreshResult = await db.execute(sql`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name
      `)
      tables = Array.isArray(refreshResult) ? refreshResult : (refreshResult.rows || []) as any[]
    } catch (e) {
      tablesError = e instanceof Error ? e.message : 'Unknown error'
    }

    return {
      migrationsPath,
      files,
      migrationError,
      migrationResult,
      tablesAfterMigration: tables,
      createdTables,
      tablesError,
      nodeEnv: process.env['NODE_ENV'],
      databaseUrlExists: !!process.env['DATABASE_URL'],
      cacheVersion: '2026-01-28-v1'
    }
  })
  .use(authRoutes)
  .use(teamRoutes)
  .use(campaignRoutes)
  .use(questionnaireRoutes)
  .use(dashboardRoutes)
  .use(apiKeyRoutes)
  .use(apiV1Routes)
  .use(organizationRoutes)
  .use(teamsRoutes)
  .use(analyticsRoutes)
  .use(billingRoutes)
  .use(mcpRoutes)
  .listen(process.env['API_PORT'] ? parseInt(process.env['API_PORT']) : 3000)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)

export type App = typeof app
