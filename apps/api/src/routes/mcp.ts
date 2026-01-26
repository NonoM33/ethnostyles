import { Elysia, t } from 'elysia'
import { db, campaigns, respondents, eq, and, sql, desc } from '@etnostyles/db'
import {
  authenticateApiKey,
  logApiCall,
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
 * MCP Tool definitions for Ethnostyles integration
 * These tools can be used by LLMs to interact with the cultural profiling system
 */
const MCP_TOOLS = [
  {
    name: 'ethnostyles_get_profiles',
    description: 'Get all 8 cultural profiles (Mythes) with their descriptions, keywords, and characteristics. Use this to understand the cultural profiling framework.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'ethnostyles_get_questions',
    description: 'Get questionnaire questions for cultural profiling. You can choose between express (8 questions), standard (16 questions), or complete (30 questions) versions.',
    inputSchema: {
      type: 'object',
      properties: {
        size: {
          type: 'number',
          enum: [8, 16, 30],
          description: 'Number of questions: 8 (express), 16 (standard), or 30 (complete)'
        }
      },
      required: []
    }
  },
  {
    name: 'ethnostyles_analyze_answers',
    description: 'Analyze questionnaire answers and get the cultural profile. Provide an array of answer indices (0-based) corresponding to the selected options.',
    inputSchema: {
      type: 'object',
      properties: {
        answers: {
          type: 'array',
          items: { type: 'number' },
          description: 'Array of answer indices (0-3) for each question'
        },
        size: {
          type: 'number',
          enum: [8, 16, 30],
          description: 'Questionnaire size that was used'
        }
      },
      required: ['answers']
    }
  },
  {
    name: 'ethnostyles_get_profile_details',
    description: 'Get detailed information about a specific cultural profile (mythe) including strengths, keywords, and recommendations.',
    inputSchema: {
      type: 'object',
      properties: {
        profile: {
          type: 'string',
          enum: ['maintien', 'reconciliation', 'incertitudes', 'consommation', 'plaisir', 'tradition', 'progres', 'famille'],
          description: 'The profile key to get details for'
        }
      },
      required: ['profile']
    }
  },
  {
    name: 'ethnostyles_list_campaigns',
    description: 'List all campaigns in your organization.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'ethnostyles_get_campaign_responses',
    description: 'Get responses and profiles from a specific campaign.',
    inputSchema: {
      type: 'object',
      properties: {
        campaign_id: {
          type: 'string',
          description: 'The campaign ID to get responses for'
        },
        page: {
          type: 'number',
          description: 'Page number (default: 1)'
        },
        limit: {
          type: 'number',
          description: 'Number of results per page (default: 50, max: 100)'
        }
      },
      required: ['campaign_id']
    }
  },
  {
    name: 'ethnostyles_compare_profiles',
    description: 'Compare two cultural profiles to understand their similarities, differences, and potential dynamics.',
    inputSchema: {
      type: 'object',
      properties: {
        profile1: {
          type: 'string',
          enum: ['maintien', 'reconciliation', 'incertitudes', 'consommation', 'plaisir', 'tradition', 'progres', 'famille'],
          description: 'First profile to compare'
        },
        profile2: {
          type: 'string',
          enum: ['maintien', 'reconciliation', 'incertitudes', 'consommation', 'plaisir', 'tradition', 'progres', 'famille'],
          description: 'Second profile to compare'
        }
      },
      required: ['profile1', 'profile2']
    }
  }
]

/**
 * Execute an MCP tool
 */
async function executeMcpTool(
  toolName: string,
  args: Record<string, unknown>,
  tenantId: string
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  switch (toolName) {
    case 'ethnostyles_get_profiles': {
      const profiles = Object.entries(ETS_GROUPS).map(([key, profile]) => ({
        key,
        name: profile.name,
        shortName: profile.shortName,
        tagline: profile.tagline,
        description: profile.description,
        emoji: profile.emoji,
        color: profile.color,
        percent: profile.percent,
        motto: profile.motto,
        strengths: profile.strengths,
        keywords: profile.keywords.slice(0, 6), // First 6 keywords
      }))

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            profiles,
            totalProfiles: profiles.length,
            framework: 'The 8 Mythes framework identifies cultural value systems that drive behavior and decision-making.'
          }, null, 2)
        }]
      }
    }

    case 'ethnostyles_get_questions': {
      const size = (args.size as number) || 30
      const questions = getQuestionsForSize(size as QuestionnaireSize)

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            instructions: `Present these ${questions.length} questions one by one. For each question, show the options and record the user's choice (0-based index). After all questions, use ethnostyles_analyze_answers to get the profile.`,
            questions: questions.map(q => ({
              id: q.id,
              type: q.type,
              question: q.question,
              options: q.options.map((o, i) => ({ index: i, text: o.text })),
              round: q.round
            })),
            totalQuestions: questions.length,
            rounds: [...new Set(questions.map(q => q.round))].sort()
          }, null, 2)
        }]
      }
    }

    case 'ethnostyles_analyze_answers': {
      const answers = args.answers as number[]
      const size = (args.size as number) || 30
      const questions = getQuestionsForSize(size as QuestionnaireSize)

      if (!answers || answers.length !== questions.length) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: `Expected ${questions.length} answers for size ${size}, got ${answers?.length || 0}`
            })
          }]
        }
      }

      const scores = calculateQuizScores(answers, questions)
      const { primary, secondary } = getDominantMyths(scores)
      const confidence = calculateConfidence(scores)

      const primaryGroup = ETS_GROUPS[primary.key]
      const secondaryGroup = ETS_GROUPS[secondary.key]

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            profile: {
              primary: {
                key: primary.key,
                name: primaryGroup.name,
                tagline: primaryGroup.tagline,
                description: primaryGroup.description,
                fullDescription: primaryGroup.fullDescription,
                strengths: primaryGroup.strengths,
                motto: primaryGroup.motto,
                score: Math.round(primary.score * 100)
              },
              secondary: {
                key: secondary.key,
                name: secondaryGroup.name,
                tagline: secondaryGroup.tagline,
                description: secondaryGroup.description,
                score: Math.round(secondary.score * 100)
              },
              confidence: Math.round(confidence * 100),
              allScores: Object.fromEntries(
                Object.entries(scores)
                  .sort(([, a], [, b]) => b - a)
                  .map(([key, value]) => [key, Math.round(value * 100)])
              )
            },
            interpretation: `This person's dominant cultural profile is "${primaryGroup.name}" (${Math.round(primary.score * 100)}%) with "${secondaryGroup.name}" as secondary (${Math.round(secondary.score * 100)}%). The confidence level is ${Math.round(confidence * 100)}%. ${primaryGroup.fullDescription}`
          }, null, 2)
        }]
      }
    }

    case 'ethnostyles_get_profile_details': {
      const profileKey = args.profile as GroupKey
      const profile = ETS_GROUPS[profileKey]

      if (!profile) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: `Unknown profile: ${profileKey}` })
          }]
        }
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            key: profileKey,
            ...profile,
            recommendations: [
              `Communication: Use keywords like ${profile.keywords.slice(0, 3).join(', ')}`,
              `Avoid: Topics related to ${profile.interdits.slice(0, 3).join(', ')}`,
              `Motivate with: ${profile.obligations.slice(0, 3).join(', ')}`,
            ]
          }, null, 2)
        }]
      }
    }

    case 'ethnostyles_list_campaigns': {
      const campaignList = await db
        .select({
          id: campaigns.id,
          name: campaigns.name,
          description: campaigns.description,
          status: campaigns.status,
          questionnaireSize: campaigns.questionnaireSize,
        })
        .from(campaigns)
        .where(eq(campaigns.tenantId, tenantId))

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ campaigns: campaignList, total: campaignList.length }, null, 2)
        }]
      }
    }

    case 'ethnostyles_get_campaign_responses': {
      const campaignId = args.campaign_id as string
      const page = (args.page as number) || 1
      const limit = Math.min((args.limit as number) || 50, 100)

      const [campaign] = await db
        .select()
        .from(campaigns)
        .where(and(
          eq(campaigns.id, campaignId),
          eq(campaigns.tenantId, tenantId)
        ))
        .limit(1)

      if (!campaign) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: 'Campaign not found or not accessible' })
          }]
        }
      }

      const [countResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(respondents)
        .where(and(
          eq(respondents.campaignId, campaignId),
          eq(respondents.status, 'completed')
        ))

      const responseList = await db
        .select({
          id: respondents.id,
          email: respondents.email,
          primaryMythe: respondents.primaryMythe,
          secondaryMythe: respondents.secondaryMythe,
          confidenceScore: respondents.confidenceScore,
          completedAt: respondents.completedAt,
        })
        .from(respondents)
        .where(and(
          eq(respondents.campaignId, campaignId),
          eq(respondents.status, 'completed')
        ))
        .orderBy(desc(respondents.completedAt))
        .limit(limit)
        .offset((page - 1) * limit)

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            campaign: { id: campaign.id, name: campaign.name },
            responses: responseList.map(r => ({
              ...r,
              primaryDetails: r.primaryMythe ? {
                name: ETS_GROUPS[r.primaryMythe as GroupKey].name,
                tagline: ETS_GROUPS[r.primaryMythe as GroupKey].tagline
              } : null
            })),
            pagination: {
              page,
              limit,
              total: countResult?.count || 0,
              totalPages: Math.ceil((countResult?.count || 0) / limit)
            }
          }, null, 2)
        }]
      }
    }

    case 'ethnostyles_compare_profiles': {
      const profile1Key = args.profile1 as GroupKey
      const profile2Key = args.profile2 as GroupKey
      const profile1 = ETS_GROUPS[profile1Key]
      const profile2 = ETS_GROUPS[profile2Key]

      if (!profile1 || !profile2) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: 'Invalid profile key(s)' })
          }]
        }
      }

      // Find common and different keywords
      const keywords1 = new Set(profile1.keywords)
      const keywords2 = new Set(profile2.keywords)
      const commonKeywords = [...keywords1].filter(k => keywords2.has(k))
      const uniqueKeywords1 = [...keywords1].filter(k => !keywords2.has(k))
      const uniqueKeywords2 = [...keywords2].filter(k => !keywords1.has(k))

      // Analyze potential conflicts
      const conflicts = profile1.interdits.filter(i =>
        profile2.obligations.some(o => o.toLowerCase().includes(i.toLowerCase()) || i.toLowerCase().includes(o.toLowerCase()))
      ).concat(
        profile2.interdits.filter(i =>
          profile1.obligations.some(o => o.toLowerCase().includes(i.toLowerCase()) || i.toLowerCase().includes(o.toLowerCase()))
        )
      )

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            comparison: {
              profile1: {
                key: profile1Key,
                name: profile1.name,
                tagline: profile1.tagline,
                motto: profile1.motto
              },
              profile2: {
                key: profile2Key,
                name: profile2.name,
                tagline: profile2.tagline,
                motto: profile2.motto
              },
              similarities: {
                commonKeywords: commonKeywords.slice(0, 5),
                sharedStrengths: profile1.strengths.filter(s =>
                  profile2.strengths.some(s2 => s.toLowerCase().includes(s2.toLowerCase().split(' ')[0]))
                )
              },
              differences: {
                uniqueTo1: uniqueKeywords1.slice(0, 5),
                uniqueTo2: uniqueKeywords2.slice(0, 5),
                potentialConflicts: [...new Set(conflicts)].slice(0, 5)
              },
              dynamics: conflicts.length > 2
                ? 'These profiles may have some tension points. Focus on shared values and clear communication.'
                : 'These profiles can complement each other well. Leverage different perspectives for stronger outcomes.'
            }
          }, null, 2)
        }]
      }
    }

    default:
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ error: `Unknown tool: ${toolName}` })
        }]
      }
  }
}

/**
 * MCP Routes - Model Context Protocol server for LLM integration
 */
export const mcpRoutes = new Elysia({ prefix: '/mcp' })
  // MCP Server Info
  .get(
    '/info',
    () => ({
      name: 'ethnostyles-mcp',
      version: '1.0.0',
      description: 'Model Context Protocol server for Ethnostyles cultural profiling',
      capabilities: {
        tools: true,
        resources: false,
        prompts: false
      }
    }),
    {
      detail: {
        tags: ['MCP'],
        summary: 'Get MCP server information'
      }
    }
  )

  // List available tools
  .get(
    '/tools',
    async ({ headers, set }) => {
      const auth = await authenticateApiKey(headers['x-api-key'])

      if (auth.error) {
        set.status = 401
        return { error: auth.error }
      }

      return { tools: MCP_TOOLS }
    },
    {
      detail: {
        tags: ['MCP'],
        summary: 'List available MCP tools',
        description: 'Returns all tools available for LLM integration'
      }
    }
  )

  // Execute a tool
  .post(
    '/tools/:name',
    async ({ headers, params, body, set }) => {
      const startTime = Date.now()
      const auth = await authenticateApiKey(headers['x-api-key'])

      if (auth.error) {
        set.status = auth.error.includes('Too many') ? 429 : auth.error.includes('limit') ? 402 : 401
        return { error: auth.error }
      }

      const tool = MCP_TOOLS.find(t => t.name === params.name)
      if (!tool) {
        set.status = 404
        return { error: `Tool not found: ${params.name}` }
      }

      try {
        const result = await executeMcpTool(params.name, body.arguments || {}, auth.tenantId!)

        await logApiCall({
          tenantId: auth.tenantId!,
          apiKeyId: auth.keyId || undefined,
          endpoint: `/mcp/tools/${params.name}`,
          method: 'POST',
          statusCode: 200,
          responseTimeMs: Date.now() - startTime,
          creditsUsed: params.name.includes('analyze') ? 2 : 1,
        })

        return result
      } catch (error) {
        set.status = 500
        return { error: `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}` }
      }
    },
    {
      params: t.Object({
        name: t.String()
      }),
      body: t.Object({
        arguments: t.Optional(t.Record(t.String(), t.Unknown()))
      }),
      detail: {
        tags: ['MCP'],
        summary: 'Execute an MCP tool',
        description: 'Execute a specific MCP tool with the provided arguments'
      }
    }
  )

  // SSE endpoint for streaming (MCP standard)
  .get(
    '/sse',
    async ({ headers, set }) => {
      const auth = await authenticateApiKey(headers['x-api-key'])

      if (auth.error) {
        set.status = 401
        return { error: auth.error }
      }

      set.headers['content-type'] = 'text/event-stream'
      set.headers['cache-control'] = 'no-cache'
      set.headers['connection'] = 'keep-alive'

      // Return server capabilities
      return `data: ${JSON.stringify({
        type: 'server_info',
        name: 'ethnostyles-mcp',
        version: '1.0.0',
        capabilities: { tools: true }
      })}\n\n`
    },
    {
      detail: {
        tags: ['MCP'],
        summary: 'SSE connection for MCP',
        description: 'Server-Sent Events endpoint for real-time MCP communication'
      }
    }
  )
