import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env['DATABASE_URL'] || 'postgresql://dev:dev@localhost:5432/etnostyles'

const client = postgres(connectionString)
export const db = drizzle(client, { schema })

// Run migrations
export async function runMigrations() {
  // In production (Docker), migrations are at /app/packages/db/drizzle
  // In development, they're relative to this file
  const migrationsFolder = process.env['NODE_ENV'] === 'production'
    ? '/app/packages/db/drizzle'
    : new URL('../drizzle', import.meta.url).pathname

  console.log(`Running database migrations from ${migrationsFolder}...`)
  try {
    await migrate(db, { migrationsFolder })
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
