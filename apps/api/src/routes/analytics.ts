import { Elysia, t } from 'elysia'
import { db, campaigns, respondents, targetCultures, teamInvitations, tenants, users, sessions, eq, and, sql, desc, gte, lte } from '@etnostyles/db'
import { MANAGEMENT_RECOMMENDATIONS, type TeamComposition, type CultureGap } from '@etnostyles/db'

// National benchmark data
const NATIONAL_BENCHMARK: Record<string, number> = {
  Explorateur: 14,
  Gardien: 16,
  Créateur: 11,
  Sage: 13,
  Héros: 12,
  Rebelle: 10,
  Magicien: 9,
  Innocent: 15,
}

const ALL_MYTHES = ['Explorateur', 'Gardien', 'Créateur', 'Sage', 'Héros', 'Rebelle', 'Magicien', 'Innocent']

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

/**
 * Calculate team composition from responses
 */
function calculateTeamComposition(responses: { primaryMythe: string | null }[]): TeamComposition {
  const distribution = {
    Explorateur: 0,
    Gardien: 0,
    Créateur: 0,
    Sage: 0,
    Héros: 0,
    Rebelle: 0,
    Magicien: 0,
    Innocent: 0,
  }

  for (const r of responses) {
    if (r.primaryMythe && r.primaryMythe in distribution) {
      distribution[r.primaryMythe as keyof typeof distribution]++
    }
  }

  const total = responses.length
  const percentages = {
    Explorateur: total ? Math.round((distribution.Explorateur / total) * 100) : 0,
    Gardien: total ? Math.round((distribution.Gardien / total) * 100) : 0,
    Créateur: total ? Math.round((distribution.Créateur / total) * 100) : 0,
    Sage: total ? Math.round((distribution.Sage / total) * 100) : 0,
    Héros: total ? Math.round((distribution.Héros / total) * 100) : 0,
    Rebelle: total ? Math.round((distribution.Rebelle / total) * 100) : 0,
    Magicien: total ? Math.round((distribution.Magicien / total) * 100) : 0,
    Innocent: total ? Math.round((distribution.Innocent / total) * 100) : 0,
  }

  return { total, distribution, percentages }
}

/**
 * Calculate culture gaps
 */
function calculateCultureGaps(current: TeamComposition['percentages'], target: Record<string, number>): CultureGap[] {
  const gaps: CultureGap[] = []

  for (const mythe of ALL_MYTHES) {
    const currentVal = current[mythe as keyof typeof current] || 0
    const targetVal = target[mythe.toLowerCase().replace('é', 'e') + 'Target'] || target[mythe] || 0
    const gap = targetVal - currentVal

    let priority: 'high' | 'medium' | 'low' = 'low'
    if (Math.abs(gap) >= 10) priority = 'high'
    else if (Math.abs(gap) >= 5) priority = 'medium'

    gaps.push({
      mythe,
      current: currentVal,
      target: targetVal,
      gap,
      priority,
    })
  }

  return gaps.sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))
}

export const analyticsRoutes = new Elysia({ prefix: '/analytics' })
  // Epic 11 - Story 11.1: Organization Culture Map
  .get(
    '/culture-map',
    async ({ headers, query, set }) => {
      const user = await getCurrentUser(headers['authorization'])
      if (!user) {
        set.status = 401
        return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
      }

      if (user.role !== 'admin') {
        set.status = 403
        return { error: 'FORBIDDEN', message: 'Only admins can access culture map' }
      }

      // Get all internal campaigns (type 'team' or 'audit')
      const internalCampaigns = await db
        .select({
          id: campaigns.id,
          name: campaigns.name,
          department: campaigns.department,
          campaignType: campaigns.campaignType,
        })
        .from(campaigns)
        .where(and(
          eq(campaigns.tenantId, user.tenantId),
          sql`${campaigns.campaignType} IN ('team', 'audit')`
        ))

      // Get all completed responses for these campaigns
      const campaignIds = internalCampaigns.map(c => c.id)

      if (campaignIds.length === 0) {
        return {
          globalComposition: calculateTeamComposition([]),
          departmentBreakdown: [],
          campaigns: [],
          benchmark: NATIONAL_BENCHMARK,
        }
      }

      // Date filters
      let dateCondition = sql`true`
      if (query.startDate) {
        dateCondition = sql`${respondents.completedAt} >= ${new Date(query.startDate)}`
      }
      if (query.endDate) {
        const endDate = new Date(query.endDate)
        endDate.setHours(23, 59, 59, 999)
        dateCondition = and(dateCondition, sql`${respondents.completedAt} <= ${endDate}`)!
      }

      const allResponses = await db
        .select({
          primaryMythe: respondents.primaryMythe,
          campaignId: respondents.campaignId,
        })
        .from(respondents)
        .where(and(
          sql`${respondents.campaignId} IN (${sql.join(campaignIds.map(id => sql`${id}`), sql`, `)})`,
          eq(respondents.status, 'completed'),
          dateCondition
        ))

      // Calculate global composition
      const globalComposition = calculateTeamComposition(allResponses)

      // Calculate per-department breakdown
      const departmentMap = new Map<string, typeof allResponses>()
      for (const campaign of internalCampaigns) {
        const dept = campaign.department || 'Non assigné'
        if (!departmentMap.has(dept)) {
          departmentMap.set(dept, [])
        }
        const deptResponses = allResponses.filter(r => r.campaignId === campaign.id)
        departmentMap.get(dept)!.push(...deptResponses)
      }

      const departmentBreakdown = Array.from(departmentMap.entries()).map(([department, responses]) => ({
        department,
        composition: calculateTeamComposition(responses),
      }))

      // Per-campaign stats
      const campaignStats = internalCampaigns.map(campaign => {
        const campaignResponses = allResponses.filter(r => r.campaignId === campaign.id)
        return {
          id: campaign.id,
          name: campaign.name,
          department: campaign.department,
          type: campaign.campaignType,
          composition: calculateTeamComposition(campaignResponses),
        }
      })

      return {
        globalComposition,
        departmentBreakdown,
        campaigns: campaignStats,
        benchmark: NATIONAL_BENCHMARK,
      }
    },
    {
      query: t.Object({
        startDate: t.Optional(t.String()),
        endDate: t.Optional(t.String()),
      }),
      detail: {
        tags: ['Analytics'],
        summary: 'Get organization culture map with mythe distribution',
      },
    }
  )

  // Epic 11 - Story 11.2: Culture Gap Analysis
  .get(
    '/culture-gap',
    async ({ headers, set }) => {
      const user = await getCurrentUser(headers['authorization'])
      if (!user) {
        set.status = 401
        return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
      }

      if (user.role !== 'admin') {
        set.status = 403
        return { error: 'FORBIDDEN', message: 'Only admins can access gap analysis' }
      }

      // Get active target culture
      const [targetCulture] = await db
        .select()
        .from(targetCultures)
        .where(and(
          eq(targetCultures.tenantId, user.tenantId),
          eq(targetCultures.isActive, 'true')
        ))
        .orderBy(desc(targetCultures.createdAt))
        .limit(1)

      if (!targetCulture) {
        return {
          hasTarget: false,
          message: 'No target culture configured. Create one to see gap analysis.',
          gaps: [],
          recommendations: [],
        }
      }

      // Get current culture from all internal campaigns
      const internalCampaigns = await db
        .select({ id: campaigns.id })
        .from(campaigns)
        .where(and(
          eq(campaigns.tenantId, user.tenantId),
          sql`${campaigns.campaignType} IN ('team', 'audit')`
        ))

      const campaignIds = internalCampaigns.map(c => c.id)

      if (campaignIds.length === 0) {
        return {
          hasTarget: true,
          targetCulture: {
            id: targetCulture.id,
            name: targetCulture.name,
          },
          currentComposition: calculateTeamComposition([]),
          gaps: [],
          recommendations: ['Lancez des campagnes internes pour mesurer votre culture actuelle.'],
        }
      }

      const allResponses = await db
        .select({ primaryMythe: respondents.primaryMythe })
        .from(respondents)
        .where(and(
          sql`${respondents.campaignId} IN (${sql.join(campaignIds.map(id => sql`${id}`), sql`, `)})`,
          eq(respondents.status, 'completed')
        ))

      const currentComposition = calculateTeamComposition(allResponses)

      // Calculate gaps
      const targetValues = {
        explorateurTarget: targetCulture.explorateurTarget || 0,
        gardienTarget: targetCulture.gardienTarget || 0,
        createurTarget: targetCulture.createurTarget || 0,
        sageTarget: targetCulture.sageTarget || 0,
        herosTarget: targetCulture.herosTarget || 0,
        rebelleTarget: targetCulture.rebelleTarget || 0,
        magicienTarget: targetCulture.magicienTarget || 0,
        innocentTarget: targetCulture.innocentTarget || 0,
      }

      const gaps = calculateCultureGaps(currentComposition.percentages, {
        Explorateur: targetValues.explorateurTarget,
        Gardien: targetValues.gardienTarget,
        Créateur: targetValues.createurTarget,
        Sage: targetValues.sageTarget,
        Héros: targetValues.herosTarget,
        Rebelle: targetValues.rebelleTarget,
        Magicien: targetValues.magicienTarget,
        Innocent: targetValues.innocentTarget,
      })

      // Generate recommendations
      const recommendations: string[] = []
      const highPriorityGaps = gaps.filter(g => g.priority === 'high' && g.gap > 0)

      for (const gap of highPriorityGaps.slice(0, 3)) {
        recommendations.push(`Recrutez des profils ${gap.mythe} (+${gap.gap}% nécessaires)`)
      }

      const overrepresented = gaps.filter(g => g.gap < -5)
      if (overrepresented.length > 0) {
        recommendations.push(`Diversifiez vos équipes : surreprésentation de ${overrepresented.map(g => g.mythe).join(', ')}`)
      }

      return {
        hasTarget: true,
        targetCulture: {
          id: targetCulture.id,
          name: targetCulture.name,
          description: targetCulture.description,
        },
        currentComposition,
        targetComposition: {
          Explorateur: targetValues.explorateurTarget,
          Gardien: targetValues.gardienTarget,
          Créateur: targetValues.createurTarget,
          Sage: targetValues.sageTarget,
          Héros: targetValues.herosTarget,
          Rebelle: targetValues.rebelleTarget,
          Magicien: targetValues.magicienTarget,
          Innocent: targetValues.innocentTarget,
        },
        gaps,
        recommendations,
      }
    },
    {
      detail: {
        tags: ['Analytics'],
        summary: 'Get culture gap analysis comparing current vs target',
      },
    }
  )

  // Create/Update target culture
  .post(
    '/target-culture',
    async ({ headers, body, set }) => {
      const user = await getCurrentUser(headers['authorization'])
      if (!user) {
        set.status = 401
        return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
      }

      if (user.role !== 'admin') {
        set.status = 403
        return { error: 'FORBIDDEN', message: 'Only admins can manage target culture' }
      }

      // Deactivate existing target
      await db
        .update(targetCultures)
        .set({ isActive: 'false' })
        .where(eq(targetCultures.tenantId, user.tenantId))

      // Create new target
      const [newTarget] = await db
        .insert(targetCultures)
        .values({
          tenantId: user.tenantId,
          name: body.name,
          description: body.description,
          explorateurTarget: body.explorateurTarget || 12,
          gardienTarget: body.gardienTarget || 12,
          createurTarget: body.createurTarget || 13,
          sageTarget: body.sageTarget || 13,
          herosTarget: body.herosTarget || 12,
          rebelleTarget: body.rebelleTarget || 13,
          magicienTarget: body.magicienTarget || 12,
          innocentTarget: body.innocentTarget || 13,
          isActive: 'true',
        })
        .returning()

      return { success: true, targetCulture: newTarget }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1, maxLength: 255 }),
        description: t.Optional(t.String()),
        explorateurTarget: t.Optional(t.Number({ minimum: 0, maximum: 100 })),
        gardienTarget: t.Optional(t.Number({ minimum: 0, maximum: 100 })),
        createurTarget: t.Optional(t.Number({ minimum: 0, maximum: 100 })),
        sageTarget: t.Optional(t.Number({ minimum: 0, maximum: 100 })),
        herosTarget: t.Optional(t.Number({ minimum: 0, maximum: 100 })),
        rebelleTarget: t.Optional(t.Number({ minimum: 0, maximum: 100 })),
        magicienTarget: t.Optional(t.Number({ minimum: 0, maximum: 100 })),
        innocentTarget: t.Optional(t.Number({ minimum: 0, maximum: 100 })),
      }),
      detail: {
        tags: ['Analytics'],
        summary: 'Create or update target culture configuration',
      },
    }
  )

  // Epic 11 - Story 11.3: Recruitment Fit View
  .get(
    '/recruitment-fit/:campaignId',
    async ({ headers, params, set }) => {
      const user = await getCurrentUser(headers['authorization'])
      if (!user) {
        set.status = 401
        return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
      }

      // Verify campaign belongs to tenant and is recruitment type
      const [campaign] = await db
        .select()
        .from(campaigns)
        .where(and(
          eq(campaigns.id, params.campaignId),
          eq(campaigns.tenantId, user.tenantId)
        ))
        .limit(1)

      if (!campaign) {
        set.status = 404
        return { error: 'NOT_FOUND', message: 'Campaign not found' }
      }

      if (campaign.campaignType !== 'recruitment') {
        set.status = 400
        return { error: 'INVALID_TYPE', message: 'This feature is only for recruitment campaigns' }
      }

      // Get candidates from this campaign
      const candidates = await db
        .select({
          id: respondents.id,
          email: respondents.email,
          primaryMythe: respondents.primaryMythe,
          completedAt: respondents.completedAt,
        })
        .from(respondents)
        .where(and(
          eq(respondents.campaignId, params.campaignId),
          eq(respondents.status, 'completed')
        ))
        .orderBy(desc(respondents.completedAt))

      // Get target team composition (from internal campaigns)
      const internalCampaigns = await db
        .select({ id: campaigns.id })
        .from(campaigns)
        .where(and(
          eq(campaigns.tenantId, user.tenantId),
          sql`${campaigns.campaignType} IN ('team')`
        ))

      let teamComposition: TeamComposition | null = null
      if (internalCampaigns.length > 0) {
        const campaignIds = internalCampaigns.map(c => c.id)
        const teamResponses = await db
          .select({ primaryMythe: respondents.primaryMythe })
          .from(respondents)
          .where(and(
            sql`${respondents.campaignId} IN (${sql.join(campaignIds.map(id => sql`${id}`), sql`, `)})`,
            eq(respondents.status, 'completed')
          ))
        teamComposition = calculateTeamComposition(teamResponses)
      }

      // Calculate fit for each candidate
      const candidatesWithFit = candidates.map(candidate => {
        let fitAnalysis = {
          complementary: false,
          similar: false,
          diversityScore: 0,
        }

        if (teamComposition && candidate.primaryMythe) {
          const mythePercentage = teamComposition.percentages[candidate.primaryMythe as keyof typeof teamComposition.percentages] || 0

          // Low percentage in team = complementary
          if (mythePercentage < 10) {
            fitAnalysis.complementary = true
            fitAnalysis.diversityScore = 100 - mythePercentage
          }
          // High percentage = similar
          if (mythePercentage > 20) {
            fitAnalysis.similar = true
            fitAnalysis.diversityScore = 100 - mythePercentage
          }
          // Medium = balanced
          if (!fitAnalysis.complementary && !fitAnalysis.similar) {
            fitAnalysis.diversityScore = 50
          }
        }

        return {
          id: candidate.id,
          email: candidate.email.replace(/(.{2}).*@/, '$1***@'), // Mask email
          primaryMythe: candidate.primaryMythe,
          completedAt: candidate.completedAt,
          fitAnalysis,
        }
      })

      return {
        campaign: {
          id: campaign.id,
          name: campaign.name,
        },
        candidates: candidatesWithFit,
        teamComposition,
        totalCandidates: candidates.length,
      }
    },
    {
      params: t.Object({
        campaignId: t.String(),
      }),
      detail: {
        tags: ['Analytics'],
        summary: 'Get recruitment fit analysis for candidates',
      },
    }
  )

  // Epic 11 - Story 11.4: Trend Analysis
  .get(
    '/trends',
    async ({ headers, query, set }) => {
      const user = await getCurrentUser(headers['authorization'])
      if (!user) {
        set.status = 401
        return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
      }

      if (user.role !== 'admin') {
        set.status = 403
        return { error: 'FORBIDDEN', message: 'Only admins can access trend analysis' }
      }

      // Default to last 12 months
      const months = query.months || 12
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - months)
      startDate.setDate(1)
      startDate.setHours(0, 0, 0, 0)

      // Get all internal campaigns
      const internalCampaigns = await db
        .select({ id: campaigns.id })
        .from(campaigns)
        .where(and(
          eq(campaigns.tenantId, user.tenantId),
          sql`${campaigns.campaignType} IN ('team', 'audit')`
        ))

      if (internalCampaigns.length === 0) {
        return {
          trends: [],
          summary: {
            totalResponses: 0,
            periodStart: startDate,
            periodEnd: new Date(),
          },
        }
      }

      const campaignIds = internalCampaigns.map(c => c.id)

      // Get monthly data
      const monthlyData = await db
        .select({
          month: sql<string>`to_char(${respondents.completedAt}, 'YYYY-MM')`,
          primaryMythe: respondents.primaryMythe,
          count: sql<number>`count(*)::int`,
        })
        .from(respondents)
        .where(and(
          sql`${respondents.campaignId} IN (${sql.join(campaignIds.map(id => sql`${id}`), sql`, `)})`,
          eq(respondents.status, 'completed'),
          gte(respondents.completedAt, startDate)
        ))
        .groupBy(sql`to_char(${respondents.completedAt}, 'YYYY-MM')`, respondents.primaryMythe)
        .orderBy(sql`to_char(${respondents.completedAt}, 'YYYY-MM')`)

      // Transform into trends format
      const monthMap = new Map<string, Record<string, number>>()
      let totalResponses = 0

      for (const row of monthlyData) {
        const month = row.month
        if (!monthMap.has(month)) {
          monthMap.set(month, {
            Explorateur: 0,
            Gardien: 0,
            Créateur: 0,
            Sage: 0,
            Héros: 0,
            Rebelle: 0,
            Magicien: 0,
            Innocent: 0,
          })
        }
        if (row.primaryMythe) {
          monthMap.get(month)![row.primaryMythe] = row.count
          totalResponses += row.count
        }
      }

      const trends = Array.from(monthMap.entries()).map(([month, distribution]) => {
        const total = Object.values(distribution).reduce((a, b) => a + b, 0)
        const percentages: Record<string, number> = {}
        for (const [mythe, count] of Object.entries(distribution)) {
          percentages[mythe] = total ? Math.round((count / total) * 100) : 0
        }
        return {
          month,
          total,
          distribution,
          percentages,
        }
      })

      // Detect significant changes
      const changes: string[] = []
      if (trends.length >= 2) {
        const latest = trends[trends.length - 1]!
        const previous = trends[trends.length - 2]!

        for (const mythe of ALL_MYTHES) {
          const change = (latest.percentages[mythe] || 0) - (previous.percentages[mythe] || 0)
          if (Math.abs(change) >= 5) {
            changes.push(`${mythe}: ${change > 0 ? '+' : ''}${change}% ce mois`)
          }
        }
      }

      return {
        trends,
        summary: {
          totalResponses,
          periodStart: startDate,
          periodEnd: new Date(),
          months: trends.length,
        },
        significantChanges: changes,
        benchmark: NATIONAL_BENCHMARK,
      }
    },
    {
      query: t.Object({
        months: t.Optional(t.Number({ minimum: 1, maximum: 36 })),
      }),
      detail: {
        tags: ['Analytics'],
        summary: 'Get culture trend analysis over time',
      },
    }
  )
