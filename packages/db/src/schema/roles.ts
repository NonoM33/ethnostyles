import { pgEnum } from 'drizzle-orm/pg-core'

/**
 * RBAC role enum for user permissions.
 * - admin: Full access to tenant resources
 * - manager: Access to own team campaigns only
 * - viewer: Read-only access to tenant data
 */
export const roleEnum = pgEnum('role', ['admin', 'manager', 'viewer'])

export type Role = 'admin' | 'manager' | 'viewer'

export const ROLES = {
  ADMIN: 'admin' as const,
  MANAGER: 'manager' as const,
  VIEWER: 'viewer' as const,
}
