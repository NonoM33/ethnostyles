import { Elysia, t } from 'elysia'
import { db, apiKeys, users, sessions, eq, and } from '@etnostyles/db'
import { createHash, randomBytes } from 'crypto'

/**
 * Hash API key using SHA-256
 */
function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

/**
 * Generate a new API key
 * Format: ethno_sk_XXXXXXXXXXXXXXXXXXXXXXXX
 */
function generateApiKey(): { key: string; prefix: string; hash: string } {
  const randomPart = randomBytes(24).toString('base64url')
  const key = `ethno_sk_${randomPart}`
  const prefix = key.substring(0, 16) // ethno_sk_XXXXXXX
  const hash = hashApiKey(key)
  return { key, prefix, hash }
}

/**
 * Get current user from session token
 */
async function getCurrentUser(authHeader: string | undefined) {
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.slice(7)
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1)

  if (!session || session.expiresAt < new Date()) {
    return null
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1)

  return user
}

export const apiKeyRoutes = new Elysia({ prefix: '/api-keys' })
  // List API keys for current tenant
  .get(
    '/',
    async ({ headers, set }) => {
      const user = await getCurrentUser(headers['authorization'])
      if (!user) {
        set.status = 401
        return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
      }

      if (user.role !== 'admin') {
        set.status = 403
        return { error: 'FORBIDDEN', message: 'Only admins can manage API keys' }
      }

      const keys = await db
        .select({
          id: apiKeys.id,
          name: apiKeys.name,
          keyPrefix: apiKeys.keyPrefix,
          isActive: apiKeys.isActive,
          lastUsedAt: apiKeys.lastUsedAt,
          expiresAt: apiKeys.expiresAt,
          createdAt: apiKeys.createdAt,
        })
        .from(apiKeys)
        .where(eq(apiKeys.tenantId, user.tenantId))

      return { keys }
    },
    {
      detail: {
        tags: ['API Keys'],
        summary: 'List all API keys for current tenant',
      },
    }
  )
  // Create new API key
  .post(
    '/',
    async ({ headers, body, set }) => {
      const user = await getCurrentUser(headers['authorization'])
      if (!user) {
        set.status = 401
        return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
      }

      if (user.role !== 'admin') {
        set.status = 403
        return { error: 'FORBIDDEN', message: 'Only admins can create API keys' }
      }

      const { name, expiresAt } = body
      const { key, prefix, hash } = generateApiKey()

      const [apiKey] = await db
        .insert(apiKeys)
        .values({
          tenantId: user.tenantId,
          userId: user.id,
          name,
          keyHash: hash,
          keyPrefix: prefix,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        })
        .returning({
          id: apiKeys.id,
          name: apiKeys.name,
          keyPrefix: apiKeys.keyPrefix,
          createdAt: apiKeys.createdAt,
          expiresAt: apiKeys.expiresAt,
        })

      if (!apiKey) {
        set.status = 500
        return { error: 'CREATE_FAILED', message: 'Failed to create API key' }
      }

      // Return the full key ONLY on creation (never shown again)
      return {
        success: true,
        key, // Only returned once!
        apiKey,
        warning: 'This is the only time the full key will be shown. Store it securely.',
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1, maxLength: 100 }),
        expiresAt: t.Optional(t.String()),
      }),
      detail: {
        tags: ['API Keys'],
        summary: 'Create a new API key',
      },
    }
  )
  // Revoke API key
  .delete(
    '/:id',
    async ({ headers, params, set }) => {
      const user = await getCurrentUser(headers['authorization'])
      if (!user) {
        set.status = 401
        return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
      }

      if (user.role !== 'admin') {
        set.status = 403
        return { error: 'FORBIDDEN', message: 'Only admins can revoke API keys' }
      }

      // Check key exists and belongs to tenant
      const [existing] = await db
        .select()
        .from(apiKeys)
        .where(and(
          eq(apiKeys.id, params.id),
          eq(apiKeys.tenantId, user.tenantId)
        ))
        .limit(1)

      if (!existing) {
        set.status = 404
        return { error: 'NOT_FOUND', message: 'API key not found' }
      }

      // Deactivate the key (soft delete)
      await db
        .update(apiKeys)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(apiKeys.id, params.id))

      return { success: true, message: 'API key revoked' }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['API Keys'],
        summary: 'Revoke an API key',
      },
    }
  )
