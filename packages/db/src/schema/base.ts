import { uuid, timestamp } from 'drizzle-orm/pg-core'
import { tenants } from './tenants'

/**
 * Base columns for multi-tenant tables.
 * Include these columns in every tenant-scoped table.
 */
export const tenantColumns = {
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}

/**
 * Timestamps-only columns for non-tenant tables.
 */
export const timestampColumns = {
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}
