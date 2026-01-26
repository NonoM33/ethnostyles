import { Elysia, t } from 'elysia'
import { db, apiKeys, campaigns, respondents, eq, and, sql, desc } from '@etnostyles/db'
import { createHash } from 'crypto'

// Rate limiting store (in-memory for MVP, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 100 // requests per minute

/**
 * Hash API key using SHA-256
 */
function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

/**
 * Check rate limit for API key
 */
function checkRateLimit(keyId: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(keyId)

  // Reset if window expired
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(keyId, { count: 1, resetAt: now + 60000 }) // 1 minute window
    return { allowed: true, remaining: RATE_LIMIT - 1, resetAt: now + 60000 }
  }

  // Check limit
  if (entry.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  // Increment
  entry.count++
  return { allowed: true, remaining: RATE_LIMIT - entry.count, resetAt: entry.resetAt }
}

/**
 * Authenticate API request using X-API-Key header
 */
async function authenticateApiKey(apiKeyHeader: string | undefined) {
  if (!apiKeyHeader) {
    return { error: 'API key required', tenantId: null }
  }

  const keyHash = hashApiKey(apiKeyHeader)

  const [key] = await db
    .select()
    .from(apiKeys)
    .where(and(
      eq(apiKeys.keyHash, keyHash),
      eq(apiKeys.isActive, true)
    ))
    .limit(1)

  if (!key) {
    return { error: 'Invalid API key', tenantId: null }
  }

  // Check expiration
  if (key.expiresAt && key.expiresAt < new Date()) {
    return { error: 'API key expired', tenantId: null }
  }

  // Check rate limit
  const rateLimit = checkRateLimit(key.id)
  if (!rateLimit.allowed) {
    return { error: 'Rate limit exceeded', tenantId: null, rateLimit }
  }

  // Update last used
  await db
    .update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, key.id))

  return { tenantId: key.tenantId, keyId: key.id, rateLimit }
}

export const apiV1Routes = new Elysia({ prefix: '/api/v1' })
  // List campaigns
  .get(
    '/campaigns',
    async ({ headers, set }) => {
      const auth = await authenticateApiKey(headers['x-api-key'])

      if (auth.error) {
        set.status = auth.error === 'Rate limit exceeded' ? 429 : 401
        if (auth.rateLimit) {
          set.headers['x-ratelimit-limit'] = String(RATE_LIMIT)
          set.headers['x-ratelimit-remaining'] = String(auth.rateLimit.remaining)
          set.headers['x-ratelimit-reset'] = String(Math.ceil(auth.rateLimit.resetAt / 1000))
        }
        return { error: auth.error }
      }

      // Add rate limit headers
      if (auth.rateLimit) {
        set.headers['x-ratelimit-limit'] = String(RATE_LIMIT)
        set.headers['x-ratelimit-remaining'] = String(auth.rateLimit.remaining)
        set.headers['x-ratelimit-reset'] = String(Math.ceil(auth.rateLimit.resetAt / 1000))
      }

      const campaignList = await db
        .select({
          id: campaigns.id,
          name: campaigns.name,
          description: campaigns.description,
          status: campaigns.status,
          slug: campaigns.slug,
          createdAt: campaigns.createdAt,
        })
        .from(campaigns)
        .where(eq(campaigns.tenantId, auth.tenantId!))

      return { campaigns: campaignList }
    },
    {
      detail: {
        tags: ['API v1'],
        summary: 'List all campaigns',
      },
    }
  )
  // Get campaign by ID
  .get(
    '/campaigns/:id',
    async ({ headers, params, set }) => {
      const auth = await authenticateApiKey(headers['x-api-key'])

      if (auth.error) {
        set.status = auth.error === 'Rate limit exceeded' ? 429 : 401
        return { error: auth.error }
      }

      if (auth.rateLimit) {
        set.headers['x-ratelimit-limit'] = String(RATE_LIMIT)
        set.headers['x-ratelimit-remaining'] = String(auth.rateLimit.remaining)
        set.headers['x-ratelimit-reset'] = String(Math.ceil(auth.rateLimit.resetAt / 1000))
      }

      const [campaign] = await db
        .select({
          id: campaigns.id,
          name: campaigns.name,
          description: campaigns.description,
          status: campaigns.status,
          slug: campaigns.slug,
          createdAt: campaigns.createdAt,
        })
        .from(campaigns)
        .where(and(
          eq(campaigns.id, params.id),
          eq(campaigns.tenantId, auth.tenantId!)
        ))
        .limit(1)

      if (!campaign) {
        set.status = 404
        return { error: 'Campaign not found' }
      }

      return { campaign }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['API v1'],
        summary: 'Get campaign by ID',
      },
    }
  )
  // Get campaign responses (profiles)
  .get(
    '/campaigns/:id/responses',
    async ({ headers, params, query, set }) => {
      const auth = await authenticateApiKey(headers['x-api-key'])

      if (auth.error) {
        set.status = auth.error === 'Rate limit exceeded' ? 429 : 401
        return { error: auth.error }
      }

      if (auth.rateLimit) {
        set.headers['x-ratelimit-limit'] = String(RATE_LIMIT)
        set.headers['x-ratelimit-remaining'] = String(auth.rateLimit.remaining)
        set.headers['x-ratelimit-reset'] = String(Math.ceil(auth.rateLimit.resetAt / 1000))
      }

      // Verify campaign belongs to tenant
      const [campaign] = await db
        .select()
        .from(campaigns)
        .where(and(
          eq(campaigns.id, params.id),
          eq(campaigns.tenantId, auth.tenantId!)
        ))
        .limit(1)

      if (!campaign) {
        set.status = 404
        return { error: 'Campaign not found' }
      }

      const page = query.page || 1
      const limit = Math.min(query.limit || 50, 100)
      const offset = (page - 1) * limit

      // Get total count
      const [countResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(respondents)
        .where(and(
          eq(respondents.campaignId, params.id),
          eq(respondents.status, 'completed')
        ))

      const total = countResult?.count || 0

      // Get responses
      const responseList = await db
        .select({
          id: respondents.id,
          email: respondents.email,
          primaryMythe: respondents.primaryMythe,
          profileData: respondents.profileData,
          passeportCode: respondents.passeportCode,
          completedAt: respondents.completedAt,
        })
        .from(respondents)
        .where(and(
          eq(respondents.campaignId, params.id),
          eq(respondents.status, 'completed')
        ))
        .orderBy(desc(respondents.completedAt))
        .limit(limit)
        .offset(offset)

      // Parse profile data
      const responses = responseList.map((r) => ({
        id: r.id,
        email: r.email,
        primaryMythe: r.primaryMythe,
        scores: r.profileData ? JSON.parse(r.profileData).scores : null,
        passeportCode: r.passeportCode,
        completedAt: r.completedAt?.toISOString(),
      }))

      return {
        responses,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      query: t.Object({
        page: t.Optional(t.Number({ minimum: 1 })),
        limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
      }),
      detail: {
        tags: ['API v1'],
        summary: 'Get campaign responses with Mythe data',
      },
    }
  )
  // Get single response by ID
  .get(
    '/responses/:id',
    async ({ headers, params, set }) => {
      const auth = await authenticateApiKey(headers['x-api-key'])

      if (auth.error) {
        set.status = auth.error === 'Rate limit exceeded' ? 429 : 401
        return { error: auth.error }
      }

      if (auth.rateLimit) {
        set.headers['x-ratelimit-limit'] = String(RATE_LIMIT)
        set.headers['x-ratelimit-remaining'] = String(auth.rateLimit.remaining)
        set.headers['x-ratelimit-reset'] = String(Math.ceil(auth.rateLimit.resetAt / 1000))
      }

      // Get response with campaign check
      const [response] = await db
        .select({
          id: respondents.id,
          email: respondents.email,
          primaryMythe: respondents.primaryMythe,
          profileData: respondents.profileData,
          passeportCode: respondents.passeportCode,
          completedAt: respondents.completedAt,
          campaignId: respondents.campaignId,
        })
        .from(respondents)
        .where(eq(respondents.id, params.id))
        .limit(1)

      if (!response) {
        set.status = 404
        return { error: 'Response not found' }
      }

      // Verify campaign belongs to tenant
      const [campaign] = await db
        .select()
        .from(campaigns)
        .where(and(
          eq(campaigns.id, response.campaignId),
          eq(campaigns.tenantId, auth.tenantId!)
        ))
        .limit(1)

      if (!campaign) {
        set.status = 404
        return { error: 'Response not found' }
      }

      return {
        response: {
          id: response.id,
          email: response.email,
          primaryMythe: response.primaryMythe,
          scores: response.profileData ? JSON.parse(response.profileData).scores : null,
          passeportCode: response.passeportCode,
          completedAt: response.completedAt?.toISOString(),
        },
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['API v1'],
        summary: 'Get response by ID',
      },
    }
  )
