import { Elysia, t } from 'elysia'
import { db, campaigns, respondents, eq, and, sql, desc } from '@etnostyles/db'
import {
  authenticateApiKey,
  logApiCall,
  getApiUsageStats,
  type AuthResult
} from '../lib/rate-limiter'
import {
  ETS_GROUPS,
  QUIZ_QUESTIONS,
  getQuestionsForSize,
  calculateQuizScores,
  getDominantMyths,
  calculateConfidence,
  type GroupKey,
  type QuestionnaireSize
} from '@etnostyles/shared/ets-data'

/**
 * Set rate limit headers on response
 */
function setRateLimitHeaders(set: { headers: Record<string, string> }, auth: AuthResult) {
  if (auth.rateLimit) {
    set.headers['x-ratelimit-limit'] = String(auth.rateLimit.limit)
    set.headers['x-ratelimit-remaining'] = String(auth.rateLimit.remaining)
    set.headers['x-ratelimit-reset'] = String(Math.ceil(auth.rateLimit.resetAt / 1000))
    set.headers['x-credits-remaining'] = String(auth.rateLimit.creditsRemaining)
    set.headers['x-weekly-used'] = String(auth.rateLimit.weeklyUsed)
    set.headers['x-weekly-limit'] = String(auth.rateLimit.weeklyLimit)
  }
}

/**
 * API v1 Routes - Public REST API with API Key authentication
 */
export const apiV1Routes = new Elysia({ prefix: '/api/v1' })
  // ═══════════════════════════════════════════════════════════════
  // CAMPAIGNS
  // ═══════════════════════════════════════════════════════════════

  // List campaigns
  .get(
    '/campaigns',
    async ({ headers, set, request }) => {
      const startTime = Date.now()
      const auth = await authenticateApiKey(headers['x-api-key'])

      if (auth.error) {
        set.status = auth.error.includes('Too many') ? 429 : auth.error.includes('limit') ? 402 : 401
        setRateLimitHeaders(set, auth)

        await logApiCall({
          tenantId: auth.tenantId || 'unknown',
          apiKeyId: auth.keyId || undefined,
          endpoint: '/api/v1/campaigns',
          method: 'GET',
          statusCode: set.status as number,
          responseTimeMs: Date.now() - startTime,
          creditsUsed: 0,
          ipAddress: headers['x-forwarded-for'] || 'unknown',
          userAgent: headers['user-agent'],
          errorMessage: auth.error
        })

        return { error: auth.error }
      }

      setRateLimitHeaders(set, auth)

      const campaignList = await db
        .select({
          id: campaigns.id,
          name: campaigns.name,
          description: campaigns.description,
          status: campaigns.status,
          slug: campaigns.slug,
          questionnaireSize: campaigns.questionnaireSize,
          questionnaireStyle: campaigns.questionnaireStyle,
          createdAt: campaigns.createdAt,
        })
        .from(campaigns)
        .where(eq(campaigns.tenantId, auth.tenantId!))

      await logApiCall({
        tenantId: auth.tenantId!,
        apiKeyId: auth.keyId || undefined,
        endpoint: '/api/v1/campaigns',
        method: 'GET',
        statusCode: 200,
        responseTimeMs: Date.now() - startTime,
        creditsUsed: 1,
        ipAddress: headers['x-forwarded-for'] || 'unknown',
        userAgent: headers['user-agent'],
      })

      return { campaigns: campaignList }
    },
    {
      detail: {
        tags: ['API v1'],
        summary: 'List all campaigns',
        description: 'Returns all campaigns for your organization. Costs 1 API credit.',
      },
    }
  )

  // Get campaign by ID
  .get(
    '/campaigns/:id',
    async ({ headers, params, set }) => {
      const startTime = Date.now()
      const auth = await authenticateApiKey(headers['x-api-key'])

      if (auth.error) {
        set.status = auth.error.includes('Too many') ? 429 : auth.error.includes('limit') ? 402 : 401
        setRateLimitHeaders(set, auth)
        return { error: auth.error }
      }

      setRateLimitHeaders(set, auth)

      const [campaign] = await db
        .select({
          id: campaigns.id,
          name: campaigns.name,
          description: campaigns.description,
          status: campaigns.status,
          slug: campaigns.slug,
          questionnaireSize: campaigns.questionnaireSize,
          questionnaireStyle: campaigns.questionnaireStyle,
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
        await logApiCall({
          tenantId: auth.tenantId!,
          apiKeyId: auth.keyId || undefined,
          endpoint: `/api/v1/campaigns/${params.id}`,
          method: 'GET',
          statusCode: 404,
          responseTimeMs: Date.now() - startTime,
          creditsUsed: 1,
          errorMessage: 'Campaign not found'
        })
        return { error: 'Campaign not found' }
      }

      await logApiCall({
        tenantId: auth.tenantId!,
        apiKeyId: auth.keyId || undefined,
        endpoint: `/api/v1/campaigns/${params.id}`,
        method: 'GET',
        statusCode: 200,
        responseTimeMs: Date.now() - startTime,
        creditsUsed: 1,
      })

      return { campaign }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['API v1'],
        summary: 'Get campaign by ID',
        description: 'Returns detailed campaign information. Costs 1 API credit.',
      },
    }
  )

  // Get campaign responses (profiles)
  .get(
    '/campaigns/:id/responses',
    async ({ headers, params, query, set }) => {
      const startTime = Date.now()
      const auth = await authenticateApiKey(headers['x-api-key'])

      if (auth.error) {
        set.status = auth.error.includes('Too many') ? 429 : auth.error.includes('limit') ? 402 : 401
        setRateLimitHeaders(set, auth)
        return { error: auth.error }
      }

      setRateLimitHeaders(set, auth)

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
          secondaryMythe: respondents.secondaryMythe,
          confidenceScore: respondents.confidenceScore,
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

      // Parse profile data and enrich with group details
      const responses = responseList.map((r) => {
        const profileData = r.profileData ? JSON.parse(r.profileData) : null
        const primaryGroup = r.primaryMythe ? ETS_GROUPS[r.primaryMythe as GroupKey] : null
        const secondaryGroup = r.secondaryMythe ? ETS_GROUPS[r.secondaryMythe as GroupKey] : null

        return {
          id: r.id,
          email: r.email,
          profile: {
            primaryMythe: r.primaryMythe,
            primaryDetails: primaryGroup ? {
              name: primaryGroup.name,
              shortName: primaryGroup.shortName,
              tagline: primaryGroup.tagline,
              color: primaryGroup.color,
              emoji: primaryGroup.emoji,
            } : null,
            secondaryMythe: r.secondaryMythe,
            secondaryDetails: secondaryGroup ? {
              name: secondaryGroup.name,
              shortName: secondaryGroup.shortName,
              tagline: secondaryGroup.tagline,
              color: secondaryGroup.color,
              emoji: secondaryGroup.emoji,
            } : null,
            confidenceScore: r.confidenceScore,
            scores: profileData?.scores || null,
          },
          passeportCode: r.passeportCode,
          completedAt: r.completedAt?.toISOString(),
        }
      })

      await logApiCall({
        tenantId: auth.tenantId!,
        apiKeyId: auth.keyId || undefined,
        endpoint: `/api/v1/campaigns/${params.id}/responses`,
        method: 'GET',
        statusCode: 200,
        responseTimeMs: Date.now() - startTime,
        creditsUsed: 1,
      })

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
        summary: 'Get campaign responses with cultural profile data',
        description: 'Returns paginated list of completed questionnaire responses with profile data. Costs 1 API credit.',
      },
    }
  )

  // Get single response by ID
  .get(
    '/responses/:id',
    async ({ headers, params, set }) => {
      const startTime = Date.now()
      const auth = await authenticateApiKey(headers['x-api-key'])

      if (auth.error) {
        set.status = auth.error.includes('Too many') ? 429 : auth.error.includes('limit') ? 402 : 401
        setRateLimitHeaders(set, auth)
        return { error: auth.error }
      }

      setRateLimitHeaders(set, auth)

      // Get response with campaign check
      const [response] = await db
        .select({
          id: respondents.id,
          email: respondents.email,
          primaryMythe: respondents.primaryMythe,
          secondaryMythe: respondents.secondaryMythe,
          confidenceScore: respondents.confidenceScore,
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

      const profileData = response.profileData ? JSON.parse(response.profileData) : null
      const primaryGroup = response.primaryMythe ? ETS_GROUPS[response.primaryMythe as GroupKey] : null
      const secondaryGroup = response.secondaryMythe ? ETS_GROUPS[response.secondaryMythe as GroupKey] : null

      await logApiCall({
        tenantId: auth.tenantId!,
        apiKeyId: auth.keyId || undefined,
        endpoint: `/api/v1/responses/${params.id}`,
        method: 'GET',
        statusCode: 200,
        responseTimeMs: Date.now() - startTime,
        creditsUsed: 1,
      })

      return {
        response: {
          id: response.id,
          email: response.email,
          profile: {
            primaryMythe: response.primaryMythe,
            primaryDetails: primaryGroup,
            secondaryMythe: response.secondaryMythe,
            secondaryDetails: secondaryGroup,
            confidenceScore: response.confidenceScore,
            scores: profileData?.scores || null,
          },
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
        summary: 'Get response by ID with full profile details',
        description: 'Returns detailed cultural profile information for a specific response. Costs 1 API credit.',
      },
    }
  )

  // ═══════════════════════════════════════════════════════════════
  // PROFILE ANALYSIS (For LLM/AI Integration)
  // ═══════════════════════════════════════════════════════════════

  // Analyze answers and return profile (stateless)
  .post(
    '/analyze',
    async ({ headers, body, set }) => {
      const startTime = Date.now()
      const auth = await authenticateApiKey(headers['x-api-key'])

      if (auth.error) {
        set.status = auth.error.includes('Too many') ? 429 : auth.error.includes('limit') ? 402 : 401
        setRateLimitHeaders(set, auth)
        return { error: auth.error }
      }

      setRateLimitHeaders(set, auth)

      // Get questions based on size
      const size = body.size || 30
      const questions = getQuestionsForSize(size as QuestionnaireSize)

      // Validate answers
      if (!body.answers || !Array.isArray(body.answers)) {
        set.status = 400
        return { error: 'answers must be an array of answer indices' }
      }

      if (body.answers.length !== questions.length) {
        set.status = 400
        return { error: `Expected ${questions.length} answers for size ${size}, got ${body.answers.length}` }
      }

      // Calculate scores
      const scores = calculateQuizScores(body.answers, questions)
      const { primary, secondary } = getDominantMyths(scores)
      const confidence = calculateConfidence(scores)

      const primaryGroup = ETS_GROUPS[primary.key]
      const secondaryGroup = ETS_GROUPS[secondary.key]

      await logApiCall({
        tenantId: auth.tenantId!,
        apiKeyId: auth.keyId || undefined,
        endpoint: '/api/v1/analyze',
        method: 'POST',
        statusCode: 200,
        responseTimeMs: Date.now() - startTime,
        creditsUsed: 2, // Analysis costs 2 credits
      })

      return {
        profile: {
          primary: {
            key: primary.key,
            score: primary.score,
            ...primaryGroup,
          },
          secondary: {
            key: secondary.key,
            score: secondary.score,
            ...secondaryGroup,
          },
          confidence: Math.round(confidence * 100),
          scores: Object.fromEntries(
            Object.entries(scores).map(([key, value]) => [
              key,
              {
                score: Math.round(value * 100),
                group: ETS_GROUPS[key as GroupKey],
              }
            ])
          ),
        },
        metadata: {
          questionCount: questions.length,
          size: size,
          analyzedAt: new Date().toISOString(),
        }
      }
    },
    {
      body: t.Object({
        answers: t.Array(t.Number({ minimum: 0, maximum: 3 })),
        size: t.Optional(t.Union([t.Literal(8), t.Literal(16), t.Literal(30)])),
      }),
      detail: {
        tags: ['API v1'],
        summary: 'Analyze questionnaire answers',
        description: 'Stateless analysis of questionnaire answers. Returns cultural profile without storing. Costs 2 API credits. Perfect for LLM integration.',
      },
    }
  )

  // ═══════════════════════════════════════════════════════════════
  // REFERENCE DATA (For LLM/AI Integration)
  // ═══════════════════════════════════════════════════════════════

  // Get all cultural profiles reference
  .get(
    '/reference/profiles',
    async ({ headers, set }) => {
      const startTime = Date.now()
      const auth = await authenticateApiKey(headers['x-api-key'])

      if (auth.error) {
        set.status = auth.error.includes('Too many') ? 429 : auth.error.includes('limit') ? 402 : 401
        setRateLimitHeaders(set, auth)
        return { error: auth.error }
      }

      setRateLimitHeaders(set, auth)

      await logApiCall({
        tenantId: auth.tenantId!,
        apiKeyId: auth.keyId || undefined,
        endpoint: '/api/v1/reference/profiles',
        method: 'GET',
        statusCode: 200,
        responseTimeMs: Date.now() - startTime,
        creditsUsed: 1,
      })

      return {
        profiles: ETS_GROUPS,
        totalProfiles: Object.keys(ETS_GROUPS).length,
      }
    },
    {
      detail: {
        tags: ['API v1'],
        summary: 'Get all cultural profiles reference',
        description: 'Returns the complete 8 Mythes cultural profiles reference data. Useful for LLM context. Costs 1 API credit.',
      },
    }
  )

  // Get questions reference
  .get(
    '/reference/questions',
    async ({ headers, query, set }) => {
      const startTime = Date.now()
      const auth = await authenticateApiKey(headers['x-api-key'])

      if (auth.error) {
        set.status = auth.error.includes('Too many') ? 429 : auth.error.includes('limit') ? 402 : 401
        setRateLimitHeaders(set, auth)
        return { error: auth.error }
      }

      setRateLimitHeaders(set, auth)

      const size = query.size || 30
      const questions = getQuestionsForSize(size as QuestionnaireSize)

      await logApiCall({
        tenantId: auth.tenantId!,
        apiKeyId: auth.keyId || undefined,
        endpoint: '/api/v1/reference/questions',
        method: 'GET',
        statusCode: 200,
        responseTimeMs: Date.now() - startTime,
        creditsUsed: 1,
      })

      return {
        questions: questions.map(q => ({
          id: q.id,
          type: q.type,
          question: q.question,
          options: q.options.map(o => o.text),
          round: q.round,
        })),
        totalQuestions: questions.length,
        size,
        availableSizes: [8, 16, 30],
      }
    },
    {
      query: t.Object({
        size: t.Optional(t.Union([t.Literal(8), t.Literal(16), t.Literal(30)])),
      }),
      detail: {
        tags: ['API v1'],
        summary: 'Get questionnaire questions',
        description: 'Returns the questions for a specific questionnaire size. Costs 1 API credit.',
      },
    }
  )

  // ═══════════════════════════════════════════════════════════════
  // USAGE & CREDITS
  // ═══════════════════════════════════════════════════════════════

  // Get API usage statistics
  .get(
    '/usage',
    async ({ headers, set }) => {
      const auth = await authenticateApiKey(headers['x-api-key'])

      if (auth.error) {
        set.status = auth.error.includes('Too many') ? 429 : auth.error.includes('limit') ? 402 : 401
        setRateLimitHeaders(set, auth)
        return { error: auth.error }
      }

      setRateLimitHeaders(set, auth)

      const usage = await getApiUsageStats(auth.tenantId!)

      // This endpoint is free - don't charge credits

      return {
        usage,
        rateLimit: {
          remaining: auth.rateLimit?.remaining,
          resetAt: auth.rateLimit?.resetAt ? new Date(auth.rateLimit.resetAt).toISOString() : null,
        }
      }
    },
    {
      detail: {
        tags: ['API v1'],
        summary: 'Get API usage statistics',
        description: 'Returns current API usage, credit balance, and weekly limits. Free - does not consume credits.',
      },
    }
  )
