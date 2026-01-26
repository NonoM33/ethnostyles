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
  .get('/debug/info', async () => {
    const fs = await import('fs/promises')
    const migrationsFolder = '/app/packages/db/drizzle'
    let migrationFiles: string[] = []
    let migrationFolderExists = false

    try {
      migrationFiles = await fs.readdir(migrationsFolder)
      migrationFolderExists = true
    } catch {
      migrationFolderExists = false
    }

    return {
      nodeEnv: process.env['NODE_ENV'],
      databaseUrlSet: !!process.env['DATABASE_URL'],
      migrationsFolder,
      migrationFolderExists,
      migrationFiles,
      timestamp: new Date().toISOString()
    }
  })
  .get('/debug/test', () => ({ test: 'ok' }))
  .get('/debug/run-migrations', async () => {
    try {
      await runMigrations()
      return { success: true, message: 'Migrations completed successfully' }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
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
