import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env['DATABASE_URL'] || 'postgresql://dev:dev@localhost:5432/etnostyles'

const client = postgres(connectionString)
export const db = drizzle(client, { schema })

export * from './schema'
export type Database = typeof db

// Re-export drizzle-orm utilities for use in other packages
export { eq, and, or, sql, desc, asc, isNull, isNotNull, inArray, notInArray, gte, lte } from 'drizzle-orm'
