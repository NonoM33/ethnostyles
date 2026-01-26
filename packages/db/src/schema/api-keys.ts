import { pgTable, uuid, varchar, timestamp, boolean } from 'drizzle-orm/pg-core'
import { tenantColumns } from './base'
import { users } from './users'

/**
 * API Keys for REST API authentication.
 * Each key is scoped to a tenant and associated with a user.
 */
export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  ...tenantColumns,

  // The hashed API key (we only store hash, not the actual key)
  keyHash: varchar('key_hash', { length: 64 }).notNull().unique(),

  // Key prefix for identification (first 8 chars of key, e.g., "ethno_sk_")
  keyPrefix: varchar('key_prefix', { length: 20 }).notNull(),

  // Name/description for the key
  name: varchar('name', { length: 100 }).notNull(),

  // User who created the key
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Key status
  isActive: boolean('is_active').notNull().default(true),

  // Last used timestamp for monitoring
  lastUsedAt: timestamp('last_used_at'),

  // Expiration (optional)
  expiresAt: timestamp('expires_at'),
})

export type ApiKey = typeof apiKeys.$inferSelect
export type NewApiKey = typeof apiKeys.$inferInsert
