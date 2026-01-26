import { db, apiCredits, apiCallLogs, apiKeys, subscriptions, PLANS, eq, and } from '@etnostyles/db'
import { createHash } from 'crypto'

// Rate limiting store (in-memory for MVP, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  limit: number
  creditsRemaining: number
  creditsUsed: number
  weeklyLimit: number
  weeklyUsed: number
}

export interface AuthResult {
  tenantId: string | null
  keyId: string | null
  error: string | null
  rateLimit?: RateLimitResult
}

/**
 * Hash API key using SHA-256
 */
export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

/**
 * Get start of current week (Monday 00:00 UTC)
 */
function getWeekStart(): Date {
  const now = new Date()
  const day = now.getUTCDay()
  const diff = now.getUTCDate() - day + (day === 0 ? -6 : 1) // Adjust for Monday
  const weekStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), diff, 0, 0, 0, 0))
  return weekStart
}

/**
 * Get or create API credits record for tenant
 */
async function getOrCreateCredits(tenantId: string) {
  const weekStart = getWeekStart()

  let [credits] = await db
    .select()
    .from(apiCredits)
    .where(eq(apiCredits.tenantId, tenantId))
    .limit(1)

  if (!credits) {
    // Create new credits record
    const newCredits = {
      tenantId,
      balance: 0,
      weeklyUsed: 0,
      weekStartsAt: weekStart,
      totalPurchased: 0,
      totalUsed: 0,
    }
    await db.insert(apiCredits).values(newCredits)
    return { ...newCredits, id: 'new' }
  }

  // Check if we need to reset weekly usage
  if (credits.weekStartsAt < weekStart) {
    await db
      .update(apiCredits)
      .set({ weeklyUsed: 0, weekStartsAt: weekStart })
      .where(eq(apiCredits.id, credits.id))
    credits = { ...credits, weeklyUsed: 0, weekStartsAt: weekStart }
  }

  return credits
}

/**
 * Get plan limits for tenant
 */
async function getPlanLimits(tenantId: string): Promise<{ weeklyLimit: number; apiEnabled: boolean }> {
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(and(
      eq(subscriptions.tenantId, tenantId),
      eq(subscriptions.status, 'active')
    ))
    .limit(1)

  const planId = subscription?.planId || 'free'
  const plan = PLANS[planId as keyof typeof PLANS]

  return {
    weeklyLimit: plan.limits.apiCallsPerWeek || 0,
    apiEnabled: plan.limits.apiEnabled || false,
  }
}

/**
 * Check and consume API credit
 */
export async function checkAndConsumeCredit(
  tenantId: string,
  creditsToUse: number = 1
): Promise<{ allowed: boolean; creditsRemaining: number; weeklyUsed: number; weeklyLimit: number; error?: string }> {
  const planLimits = await getPlanLimits(tenantId)

  if (!planLimits.apiEnabled) {
    return {
      allowed: false,
      creditsRemaining: 0,
      weeklyUsed: 0,
      weeklyLimit: 0,
      error: 'API access not available on your plan. Please upgrade to Pro or Enterprise.'
    }
  }

  const credits = await getOrCreateCredits(tenantId)

  // Check weekly limit first
  if (credits.weeklyUsed >= planLimits.weeklyLimit) {
    // Check if they have purchased credits
    if (credits.balance < creditsToUse) {
      return {
        allowed: false,
        creditsRemaining: credits.balance,
        weeklyUsed: credits.weeklyUsed,
        weeklyLimit: planLimits.weeklyLimit,
        error: 'Weekly API limit reached. Purchase additional credits or wait until next week.'
      }
    }

    // Use purchased credits
    await db
      .update(apiCredits)
      .set({
        balance: credits.balance - creditsToUse,
        totalUsed: credits.totalUsed + creditsToUse
      })
      .where(eq(apiCredits.id, credits.id))

    return {
      allowed: true,
      creditsRemaining: credits.balance - creditsToUse,
      weeklyUsed: credits.weeklyUsed,
      weeklyLimit: planLimits.weeklyLimit
    }
  }

  // Use weekly allowance
  await db
    .update(apiCredits)
    .set({
      weeklyUsed: credits.weeklyUsed + creditsToUse,
      totalUsed: credits.totalUsed + creditsToUse
    })
    .where(eq(apiCredits.id, credits.id))

  return {
    allowed: true,
    creditsRemaining: credits.balance,
    weeklyUsed: credits.weeklyUsed + creditsToUse,
    weeklyLimit: planLimits.weeklyLimit
  }
}

/**
 * Log API call for analytics and billing
 */
export async function logApiCall(params: {
  tenantId: string
  apiKeyId?: string
  endpoint: string
  method: string
  statusCode: number
  responseTimeMs?: number
  creditsUsed: number
  ipAddress?: string
  userAgent?: string
  requestBody?: string
  errorMessage?: string
}) {
  try {
    await db.insert(apiCallLogs).values({
      tenantId: params.tenantId,
      apiKeyId: params.apiKeyId,
      endpoint: params.endpoint,
      method: params.method,
      statusCode: params.statusCode,
      responseTimeMs: params.responseTimeMs,
      creditsUsed: params.creditsUsed,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      requestBody: params.requestBody,
      errorMessage: params.errorMessage,
      calledAt: new Date(),
    })
  } catch (error) {
    console.error('Failed to log API call:', error)
  }
}

/**
 * Check minute-based rate limit (DoS protection)
 */
function checkMinuteRateLimit(keyId: string, limit: number = 60): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(keyId)

  // Reset if window expired
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(keyId, { count: 1, resetAt: now + 60000 }) // 1 minute window
    return { allowed: true, remaining: limit - 1, resetAt: now + 60000 }
  }

  // Check limit
  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  // Increment
  entry.count++
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt }
}

/**
 * Authenticate API request using X-API-Key header
 */
export async function authenticateApiKey(apiKeyHeader: string | undefined): Promise<AuthResult> {
  if (!apiKeyHeader) {
    return { error: 'API key required', tenantId: null, keyId: null }
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
    return { error: 'Invalid API key', tenantId: null, keyId: null }
  }

  // Check expiration
  if (key.expiresAt && key.expiresAt < new Date()) {
    return { error: 'API key expired', tenantId: null, keyId: null }
  }

  // Check minute-based rate limit (DoS protection)
  const minuteLimit = checkMinuteRateLimit(key.id, 60)
  if (!minuteLimit.allowed) {
    return {
      error: 'Too many requests. Please slow down.',
      tenantId: null,
      keyId: null,
      rateLimit: {
        allowed: false,
        remaining: minuteLimit.remaining,
        resetAt: minuteLimit.resetAt,
        limit: 60,
        creditsRemaining: 0,
        creditsUsed: 0,
        weeklyLimit: 0,
        weeklyUsed: 0
      }
    }
  }

  // Check and consume API credit
  const creditResult = await checkAndConsumeCredit(key.tenantId)

  if (!creditResult.allowed) {
    return {
      error: creditResult.error || 'API limit reached',
      tenantId: key.tenantId,
      keyId: key.id,
      rateLimit: {
        allowed: false,
        remaining: minuteLimit.remaining,
        resetAt: minuteLimit.resetAt,
        limit: 60,
        creditsRemaining: creditResult.creditsRemaining,
        creditsUsed: 0,
        weeklyLimit: creditResult.weeklyLimit,
        weeklyUsed: creditResult.weeklyUsed
      }
    }
  }

  // Update last used
  await db
    .update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, key.id))

  return {
    tenantId: key.tenantId,
    keyId: key.id,
    error: null,
    rateLimit: {
      allowed: true,
      remaining: minuteLimit.remaining,
      resetAt: minuteLimit.resetAt,
      limit: 60,
      creditsRemaining: creditResult.creditsRemaining,
      creditsUsed: 1,
      weeklyLimit: creditResult.weeklyLimit,
      weeklyUsed: creditResult.weeklyUsed
    }
  }
}

/**
 * Get API usage statistics for tenant
 */
export async function getApiUsageStats(tenantId: string) {
  const credits = await getOrCreateCredits(tenantId)
  const planLimits = await getPlanLimits(tenantId)

  // Get recent API calls count by day
  const recentCalls = await db
    .select()
    .from(apiCallLogs)
    .where(eq(apiCallLogs.tenantId, tenantId))
    .orderBy(apiCallLogs.calledAt)
    .limit(1000)

  return {
    credits: {
      balance: credits.balance,
      weeklyUsed: credits.weeklyUsed,
      weeklyLimit: planLimits.weeklyLimit,
      weeklyRemaining: Math.max(0, planLimits.weeklyLimit - credits.weeklyUsed),
      totalPurchased: credits.totalPurchased,
      totalUsed: credits.totalUsed,
      weekResetsAt: getWeekStart().getTime() + 7 * 24 * 60 * 60 * 1000,
    },
    apiEnabled: planLimits.apiEnabled,
    recentCallsCount: recentCalls.length,
  }
}
