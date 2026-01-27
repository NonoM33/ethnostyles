import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import * as schema from './schema'

// Lazy initialization to ensure DATABASE_URL is available at runtime
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null
let _client: ReturnType<typeof postgres> | null = null

function getConnectionString(): string {
  const url = process.env['DATABASE_URL']
  if (!url) {
    console.warn('DATABASE_URL not set, using default localhost connection')
    return 'postgresql://dev:dev@localhost:5432/etnostyles'
  }
  return url
}

function initDb() {
  if (!_db) {
    const connectionString = getConnectionString()
    console.log(`Initializing database connection to: ${connectionString.substring(0, 30)}...`)
    _client = postgres(connectionString)
    _db = drizzle(_client, { schema })
  }
  return _db
}

// Proxy that lazily initializes the db on first access
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(target, prop) {
    const realDb = initDb()
    return (realDb as any)[prop]
  }
})

// Run migrations
export async function runMigrations() {
  const nodeEnv = process.env['NODE_ENV']
  console.log(`Starting migrations with NODE_ENV=${nodeEnv}`)

  // In Docker (production/staging), migrations are at /app/packages/db/drizzle
  // In development, they're relative to this file
  const isDocker = nodeEnv === 'production' || nodeEnv === 'staging'
  const migrationsFolder = isDocker
    ? '/app/packages/db/drizzle'
    : new URL('../drizzle', import.meta.url).pathname

  console.log(`Running database migrations from ${migrationsFolder}...`)
  console.log(`DATABASE_URL configured: ${process.env['DATABASE_URL'] ? 'yes' : 'no (using default)'}`)

  try {
    // Initialize db first to ensure connection is ready
    const realDb = initDb()
    await migrate(realDb, { migrationsFolder })
    console.log('Migrations completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}

export * from './schema'
export type Database = typeof db

// Re-export drizzle-orm utilities for use in other packages
export { eq, and, or, sql, desc, asc, isNull, isNotNull, inArray, notInArray, gte, lte } from 'drizzle-orm'
