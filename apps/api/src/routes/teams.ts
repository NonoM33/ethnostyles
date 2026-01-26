import { Elysia, t } from 'elysia'
import { db, campaigns, respondents, teamInvitations, users, sessions, eq, and, sql, desc } from '@etnostyles/db'
import { MANAGEMENT_RECOMMENDATIONS, type TeamComposition } from '@etnostyles/db'

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
 * Generate slug from name
 */
function generateSlug(name: string): string {
  const randomSuffix = crypto.randomUUID().slice(0, 6)
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + randomSuffix
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
 * Find complementary and similar profiles in a team
 */
function analyzeTeamDynamics(responses: { id: string; email: string; primaryMythe: string | null }[]) {
  const byMythe = new Map<string, typeof responses>()

  for (const r of responses) {
    if (!r.primaryMythe) continue
    if (!byMythe.has(r.primaryMythe)) {
      byMythe.set(r.primaryMythe, [])
    }
    byMythe.get(r.primaryMythe)!.push(r)
  }

  // Find similar profiles (same mythe)
  const similarGroups: { mythe: string; members: { id: string; email: string }[] }[] = []
  for (const [mythe, members] of byMythe.entries()) {
    if (members.length >= 2) {
      similarGroups.push({
        mythe,
        members: members.map(m => ({
          id: m.id,
          email: m.email.replace(/(.{2}).*@/, '$1***@'),
        })),
      })
    }
  }

  // Define complementary pairs
  const complementaryPairs: [string, string][] = [
    ['Explorateur', 'Gardien'],
    ['Créateur', 'Sage'],
    ['Héros', 'Innocent'],
    ['Rebelle', 'Magicien'],
  ]

  const complementaryFound: { pair: [string, string]; members: { mythe: string; id: string; email: string }[] }[] = []
  for (const [mythe1, mythe2] of complementaryPairs) {
    if (byMythe.has(mythe1) && byMythe.has(mythe2)) {
      const members = [
        ...byMythe.get(mythe1)!.map(m => ({ mythe: mythe1, id: m.id, email: m.email.replace(/(.{2}).*@/, '$1***@') })),
        ...byMythe.get(mythe2)!.map(m => ({ mythe: mythe2, id: m.id, email: m.email.replace(/(.{2}).*@/, '$1***@') })),
      ]
      complementaryFound.push({ pair: [mythe1, mythe2], members })
    }
  }

  return { similarGroups, complementaryFound }
}

export const teamsRoutes = new Elysia({ prefix: '/teams' })
  // Epic 10 - Story 10.1: Create Team Campaign
  .post(
    '/campaigns',
    async ({ headers, body, set }) => {
      const user = await getCurrentUser(headers['authorization'])
      if (!user) {
        set.status = 401
        return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
      }

      // Admin or Manager can create team campaigns
      if (user.role !== 'admin' && user.role !== 'manager') {
        set.status = 403
        return { error: 'FORBIDDEN', message: 'Only admins and managers can create team campaigns' }
      }

      const slug = generateSlug(body.teamName || body.name)

      const [campaign] = await db
        .insert(campaigns)
        .values({
          tenantId: user.tenantId,
          name: body.name,
          description: body.description,
          status: 'draft',
          slug,
          campaignType: 'team',
          teamName: body.teamName,
          department: body.department,
          managerId: user.role === 'manager' ? user.id : body.managerId || user.id,
          logoUrl: body.logoUrl,
          primaryColor: body.primaryColor,
        })
        .returning()

      if (!campaign) {
        set.status = 500
        return { error: 'CREATE_FAILED', message: 'Failed to create campaign' }
      }

      // Create team invitations if emails provided
      if (body.emails && body.emails.length > 0) {
        const invitations = body.emails.map(email => ({
          campaignId: campaign.id,
          email: email.toLowerCase().trim(),
          status: 'pending',
        }))

        await db.insert(teamInvitations).values(invitations)
      }

      return { success: true, campaign }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1, maxLength: 255 }),
        description: t.Optional(t.String()),
        teamName: t.String({ minLength: 1, maxLength: 255 }),
        department: t.Optional(t.String({ maxLength: 255 })),
        managerId: t.Optional(t.String()),
        logoUrl: t.Optional(t.String()),
        primaryColor: t.Optional(t.String()),
        emails: t.Optional(t.Array(t.String())),
      }),
      detail: {
        tags: ['Teams'],
        summary: 'Create a new team campaign',
      },
    }
  )

  // Get team campaigns for user
  .get(
    '/campaigns',
    async ({ headers, set }) => {
      const user = await getCurrentUser(headers['authorization'])
      if (!user) {
        set.status = 401
        return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
      }

      // Build query based on role
      let query = db
        .select()
        .from(campaigns)
        .where(and(
          eq(campaigns.tenantId, user.tenantId),
          eq(campaigns.campaignType, 'team')
        ))

      // Managers only see their own campaigns
      if (user.role === 'manager') {
        query = db
          .select()
          .from(campaigns)
          .where(and(
            eq(campaigns.tenantId, user.tenantId),
            eq(campaigns.campaignType, 'team'),
            eq(campaigns.managerId, user.id)
          ))
      }

      const teamCampaigns = await query.orderBy(desc(campaigns.createdAt))

      // Get stats for each campaign
      const campaignsWithStats = await Promise.all(
        teamCampaigns.map(async (campaign) => {
          const [stats] = await db
            .select({
              total: sql<number>`count(*)::int`,
              completed: sql<number>`count(*) filter (where ${respondents.status} = 'completed')::int`,
            })
            .from(respondents)
            .where(eq(respondents.campaignId, campaign.id))

          const [inviteStats] = await db
            .select({
              total: sql<number>`count(*)::int`,
              pending: sql<number>`count(*) filter (where ${teamInvitations.status} = 'pending')::int`,
            })
            .from(teamInvitations)
            .where(eq(teamInvitations.campaignId, campaign.id))

          return {
            ...campaign,
            stats: {
              responses: stats?.total || 0,
              completed: stats?.completed || 0,
              invitations: inviteStats?.total || 0,
              pendingInvitations: inviteStats?.pending || 0,
            },
          }
        })
      )

      return { campaigns: campaignsWithStats }
    },
    {
      detail: {
        tags: ['Teams'],
        summary: 'Get all team campaigns for the current user',
      },
    }
  )

  // Epic 10 - Story 10.2: Team Composition View
  .get(
    '/campaigns/:id/composition',
    async ({ headers, params, set }) => {
      const user = await getCurrentUser(headers['authorization'])
      if (!user) {
        set.status = 401
        return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
      }

      // Verify access
      const [campaign] = await db
        .select()
        .from(campaigns)
        .where(and(
          eq(campaigns.id, params.id),
          eq(campaigns.tenantId, user.tenantId),
          eq(campaigns.campaignType, 'team')
        ))
        .limit(1)

      if (!campaign) {
        set.status = 404
        return { error: 'NOT_FOUND', message: 'Team campaign not found' }
      }

      // Managers can only see their own campaigns
      if (user.role === 'manager' && campaign.managerId !== user.id) {
        set.status = 403
        return { error: 'FORBIDDEN', message: 'Access denied' }
      }

      // Get all completed responses
      const teamMembers = await db
        .select({
          id: respondents.id,
          email: respondents.email,
          primaryMythe: respondents.primaryMythe,
          completedAt: respondents.completedAt,
        })
        .from(respondents)
        .where(and(
          eq(respondents.campaignId, params.id),
          eq(respondents.status, 'completed')
        ))
        .orderBy(respondents.completedAt)

      // Calculate composition
      const composition = calculateTeamComposition(teamMembers)

      // Analyze dynamics
      const dynamics = analyzeTeamDynamics(teamMembers)

      // Prepare member list with masked emails
      const members = teamMembers.map(m => ({
        id: m.id,
        email: m.email.replace(/(.{2}).*@/, '$1***@'),
        primaryMythe: m.primaryMythe,
        completedAt: m.completedAt,
      }))

      return {
        campaign: {
          id: campaign.id,
          name: campaign.name,
          teamName: campaign.teamName,
          department: campaign.department,
        },
        composition,
        members,
        dynamics,
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['Teams'],
        summary: 'Get team composition and dynamics',
      },
    }
  )

  // Epic 10 - Story 10.3: Management Recommendations
  .get(
    '/campaigns/:id/recommendations',
    async ({ headers, params, set }) => {
      const user = await getCurrentUser(headers['authorization'])
      if (!user) {
        set.status = 401
        return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
      }

      // Verify access
      const [campaign] = await db
        .select()
        .from(campaigns)
        .where(and(
          eq(campaigns.id, params.id),
          eq(campaigns.tenantId, user.tenantId),
          eq(campaigns.campaignType, 'team')
        ))
        .limit(1)

      if (!campaign) {
        set.status = 404
        return { error: 'NOT_FOUND', message: 'Team campaign not found' }
      }

      // Managers can only see their own campaigns
      if (user.role === 'manager' && campaign.managerId !== user.id) {
        set.status = 403
        return { error: 'FORBIDDEN', message: 'Access denied' }
      }

      // Get all completed responses
      const teamMembers = await db
        .select({ primaryMythe: respondents.primaryMythe })
        .from(respondents)
        .where(and(
          eq(respondents.campaignId, params.id),
          eq(respondents.status, 'completed')
        ))

      // Calculate composition
      const composition = calculateTeamComposition(teamMembers)

      // Get unique mythes present in the team
      const mythesPresent = Object.entries(composition.distribution)
        .filter(([_, count]) => count > 0)
        .map(([mythe]) => mythe)

      // Get recommendations for each mythe present
      const recommendations: {
        mythe: string
        count: number
        percentage: number
        tips: string[]
        communication: string
        strengths: string
        watchFor: string
      }[] = []

      for (const mythe of mythesPresent) {
        const rec = MANAGEMENT_RECOMMENDATIONS[mythe as keyof typeof MANAGEMENT_RECOMMENDATIONS]
        if (rec) {
          recommendations.push({
            mythe,
            count: composition.distribution[mythe as keyof typeof composition.distribution],
            percentage: composition.percentages[mythe as keyof typeof composition.percentages],
            tips: [...rec.tips],
            communication: rec.communication,
            strengths: rec.strengths,
            watchFor: rec.watchFor,
          })
        }
      }

      // Sort by count (most prevalent first)
      recommendations.sort((a, b) => b.count - a.count)

      // Identify potential conflicts
      const potentialConflicts: string[] = []

      // Rebelle vs Gardien can clash
      if (composition.distribution.Rebelle > 0 && composition.distribution.Gardien > 0) {
        potentialConflicts.push('Rebelle ↔ Gardien : tensions possibles entre changement et tradition. Créez des espaces de dialogue.')
      }

      // Héros vs Innocent
      if (composition.distribution.Héros > 0 && composition.distribution.Innocent > 0) {
        potentialConflicts.push('Héros ↔ Innocent : les Héros peuvent pousser trop fort pour l\'Innocent. Équilibrez les exigences.')
      }

      // Créateur vs Sage
      if (composition.distribution.Créateur > 0 && composition.distribution.Sage > 0) {
        potentialConflicts.push('Créateur ↔ Sage : créativité vs analyse. Valorisez les deux approches.')
      }

      // General team tips
      const generalTips: string[] = []

      if (mythesPresent.length <= 3) {
        generalTips.push('Équipe homogène : attention au manque de diversité de perspectives.')
      }
      if (mythesPresent.length >= 6) {
        generalTips.push('Équipe très diverse : excellente créativité, attention à la coordination.')
      }

      const dominantMythe = recommendations[0]
      if (dominantMythe && dominantMythe.percentage > 40) {
        generalTips.push(`Culture dominante ${dominantMythe.mythe} (${dominantMythe.percentage}%) : valorisez aussi les voix minoritaires.`)
      }

      return {
        campaign: {
          id: campaign.id,
          name: campaign.name,
          teamName: campaign.teamName,
        },
        teamSize: composition.total,
        mythesPresent: mythesPresent.length,
        recommendations,
        potentialConflicts,
        generalTips,
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['Teams'],
        summary: 'Get management recommendations for a team',
      },
    }
  )

  // Add team member invitations
  .post(
    '/campaigns/:id/invitations',
    async ({ headers, params, body, set }) => {
      const user = await getCurrentUser(headers['authorization'])
      if (!user) {
        set.status = 401
        return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
      }

      // Verify access
      const [campaign] = await db
        .select()
        .from(campaigns)
        .where(and(
          eq(campaigns.id, params.id),
          eq(campaigns.tenantId, user.tenantId),
          eq(campaigns.campaignType, 'team')
        ))
        .limit(1)

      if (!campaign) {
        set.status = 404
        return { error: 'NOT_FOUND', message: 'Team campaign not found' }
      }

      if (user.role === 'manager' && campaign.managerId !== user.id) {
        set.status = 403
        return { error: 'FORBIDDEN', message: 'Access denied' }
      }

      // Add invitations
      const invitations = body.emails.map(email => ({
        campaignId: params.id,
        email: email.toLowerCase().trim(),
        status: 'pending',
      }))

      await db.insert(teamInvitations).values(invitations)

      // TODO: Send invitation emails

      return { success: true, added: invitations.length }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        emails: t.Array(t.String(), { minItems: 1 }),
      }),
      detail: {
        tags: ['Teams'],
        summary: 'Add team member invitations',
      },
    }
  )

  // Get invitations for a campaign
  .get(
    '/campaigns/:id/invitations',
    async ({ headers, params, set }) => {
      const user = await getCurrentUser(headers['authorization'])
      if (!user) {
        set.status = 401
        return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
      }

      // Verify access
      const [campaign] = await db
        .select()
        .from(campaigns)
        .where(and(
          eq(campaigns.id, params.id),
          eq(campaigns.tenantId, user.tenantId),
          eq(campaigns.campaignType, 'team')
        ))
        .limit(1)

      if (!campaign) {
        set.status = 404
        return { error: 'NOT_FOUND', message: 'Team campaign not found' }
      }

      if (user.role === 'manager' && campaign.managerId !== user.id) {
        set.status = 403
        return { error: 'FORBIDDEN', message: 'Access denied' }
      }

      const invitations = await db
        .select()
        .from(teamInvitations)
        .where(eq(teamInvitations.campaignId, params.id))
        .orderBy(desc(teamInvitations.invitedAt))

      return { invitations }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['Teams'],
        summary: 'Get invitations for a team campaign',
      },
    }
  )
