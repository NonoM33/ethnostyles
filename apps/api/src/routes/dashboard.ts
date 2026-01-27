import { Elysia, t } from 'elysia'
import { db, campaigns, respondents, tenants, users, sessions, eq, and, sql, desc } from '@etnostyles/db'
import * as XLSX from 'xlsx'
import PDFDocument from 'pdfkit'

// National benchmark data (static for MVP - would come from aggregated data in production)
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

// Mythe descriptions for PDF
const MYTHE_DESCRIPTIONS: Record<string, { subtitle: string; description: string; strengths: string[]; values: string[] }> = {
  Explorateur: {
    subtitle: 'L\'aventurier qui repousse les frontières',
    description: 'Vous êtes animé par une soif insatiable de découverte et d\'aventure. Votre curiosité vous pousse constamment à explorer de nouveaux horizons, que ce soit dans votre vie professionnelle ou personnelle. Vous êtes à l\'aise avec l\'incertitude et voyez chaque défi comme une opportunité d\'apprentissage.',
    strengths: ['Adaptabilité', 'Curiosité', 'Autonomie', 'Prise de risque'],
    values: ['Liberté', 'Authenticité', 'Découverte'],
  },
  Gardien: {
    subtitle: 'Le protecteur qui préserve l\'essentiel',
    description: 'Vous accordez une grande importance à la sécurité, à la stabilité et à la préservation de ce qui compte. Pilier de confiance pour votre entourage, vous êtes celui sur qui l\'on peut compter en toute circonstance. Votre sens de la responsabilité et votre loyauté font de vous un partenaire précieux.',
    strengths: ['Fiabilité', 'Organisation', 'Prudence', 'Loyauté'],
    values: ['Sécurité', 'Tradition', 'Stabilité'],
  },
  Créateur: {
    subtitle: 'L\'innovateur qui donne vie aux idées',
    description: 'Vous êtes porté par le désir de créer et d\'innover. Votre imagination débordante vous permet de voir des possibilités là où d\'autres voient des obstacles. Vous excellez à transformer les idées en réalité et à apporter une touche d\'originalité dans tout ce que vous entreprenez.',
    strengths: ['Créativité', 'Vision', 'Innovation', 'Expression'],
    values: ['Originalité', 'Excellence', 'Accomplissement'],
  },
  Sage: {
    subtitle: 'Le penseur qui cherche la vérité',
    description: 'Vous recherchez la vérité et la compréhension profonde des choses. Votre soif de savoir vous guide vers une réflexion constante et une analyse minutieuse. Vous êtes reconnu pour votre sagesse et votre capacité à prendre du recul pour voir la situation dans son ensemble.',
    strengths: ['Analyse', 'Réflexion', 'Objectivité', 'Expertise'],
    values: ['Connaissance', 'Vérité', 'Sagesse'],
  },
  Héros: {
    subtitle: 'Le champion qui relève tous les défis',
    description: 'Vous êtes prêt à relever tous les défis pour atteindre vos objectifs et prouver votre valeur. Votre détermination et votre courage inspirent les autres. Vous ne reculez devant aucun obstacle et tirez fierté de surmonter l\'adversité.',
    strengths: ['Courage', 'Détermination', 'Compétitivité', 'Leadership'],
    values: ['Excellence', 'Accomplissement', 'Maîtrise'],
  },
  Rebelle: {
    subtitle: 'Le révolutionnaire qui bouscule l\'ordre établi',
    description: 'Vous remettez en question l\'ordre établi et cherchez à transformer ce qui ne fonctionne pas. Votre esprit critique et votre audace vous permettent de voir au-delà des conventions. Vous êtes un agent de changement qui n\'a pas peur de défendre ses convictions.',
    strengths: ['Audace', 'Indépendance', 'Vision critique', 'Authenticité'],
    values: ['Liberté', 'Justice', 'Changement'],
  },
  Magicien: {
    subtitle: 'Le visionnaire qui transforme les possibles',
    description: 'Vous avez le don de voir les possibilités là où les autres voient des limites. Votre capacité à inspirer et à motiver les autres vous permet de réaliser des transformations remarquables. Vous croyez au pouvoir de la vision et de l\'intention.',
    strengths: ['Vision', 'Charisme', 'Transformation', 'Intuition'],
    values: ['Croissance', 'Potentiel', 'Transformation'],
  },
  Innocent: {
    subtitle: 'L\'optimiste qui croit en l\'humanité',
    description: 'Vous voyez le meilleur en chaque personne et situation. Votre foi en l\'humanité et votre optimisme inspirent la confiance autour de vous. Vous recherchez le bonheur simple et la joie dans les petites choses de la vie.',
    strengths: ['Optimisme', 'Confiance', 'Simplicité', 'Joie'],
    values: ['Bonheur', 'Harmonie', 'Authenticité'],
  },
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

/**
 * Mask email for privacy (j***@example.com)
 */
function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!local || !domain) return '***@***'
  return `${local[0]}***@${domain}`
}

export const dashboardRoutes = new Elysia({ prefix: '/dashboard' })
  // Get overview stats for all campaigns
  .get(
    '/overview',
    async ({ headers, set }) => {
      const user = await getCurrentUser(headers['authorization'])
      if (!user) {
        set.status = 401
        return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
      }

      // Get all campaigns with response counts
      const campaignStats = await db
        .select({
          id: campaigns.id,
          name: campaigns.name,
          status: campaigns.status,
          slug: campaigns.slug,
          createdAt: campaigns.createdAt,
        })
        .from(campaigns)
        .where(eq(campaigns.tenantId, user.tenantId))

      // Get response counts per campaign
      const stats = await Promise.all(
        campaignStats.map(async (campaign) => {
          const [counts] = await db
            .select({
              total: sql<number>`count(*)::int`,
              completed: sql<number>`count(*) filter (where ${respondents.status} = 'completed')::int`,
              inProgress: sql<number>`count(*) filter (where ${respondents.status} = 'in_progress')::int`,
            })
            .from(respondents)
            .where(eq(respondents.campaignId, campaign.id))

          return {
            ...campaign,
            stats: {
              total: counts?.total || 0,
              completed: counts?.completed || 0,
              inProgress: counts?.inProgress || 0,
              completionRate: counts?.total ? Math.round((counts.completed / counts.total) * 100) : 0,
            },
          }
        })
      )

      // Calculate totals
      const totals = stats.reduce(
        (acc, c) => ({
          totalResponses: acc.totalResponses + c.stats.total,
          completedResponses: acc.completedResponses + c.stats.completed,
          activeCampaigns: acc.activeCampaigns + (c.status === 'active' ? 1 : 0),
        }),
        { totalResponses: 0, completedResponses: 0, activeCampaigns: 0 }
      )

      return { campaigns: stats, totals }
    },
    {
      detail: {
        tags: ['Dashboard'],
        summary: 'Get overview statistics for all campaigns',
      },
    }
  )
  // Get detailed stats for a single campaign
  .get(
    '/campaigns/:id/stats',
    async ({ headers, params, query, set }) => {
      const user = await getCurrentUser(headers['authorization'])
      if (!user) {
        set.status = 401
        return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
      }

      // Verify campaign belongs to tenant
      const [campaign] = await db
        .select()
        .from(campaigns)
        .where(and(
          eq(campaigns.id, params.id),
          eq(campaigns.tenantId, user.tenantId)
        ))
        .limit(1)

      if (!campaign) {
        set.status = 404
        return { error: 'NOT_FOUND', message: 'Campaign not found' }
      }

      // Build date filter conditions
      const dateConditions = [eq(respondents.campaignId, params.id)]
      if (query.startDate) {
        dateConditions.push(sql`${respondents.completedAt} >= ${new Date(query.startDate)}` as any)
      }
      if (query.endDate) {
        const endDate = new Date(query.endDate)
        endDate.setHours(23, 59, 59, 999)
        dateConditions.push(sql`${respondents.completedAt} <= ${endDate}` as any)
      }

      // Get response counts
      const [counts] = await db
        .select({
          total: sql<number>`count(*)::int`,
          completed: sql<number>`count(*) filter (where ${respondents.status} = 'completed')::int`,
          inProgress: sql<number>`count(*) filter (where ${respondents.status} = 'in_progress')::int`,
          abandoned: sql<number>`count(*) filter (where ${respondents.status} = 'abandoned')::int`,
        })
        .from(respondents)
        .where(and(...dateConditions))

      // Get profile distribution
      const profileDistribution = await db
        .select({
          mythe: respondents.primaryMythe,
          count: sql<number>`count(*)::int`,
        })
        .from(respondents)
        .where(and(
          ...dateConditions,
          eq(respondents.status, 'completed')
        ))
        .groupBy(respondents.primaryMythe)

      // Calculate percentages
      const totalCompleted = counts?.completed || 0
      const distribution = profileDistribution.map((d) => ({
        mythe: d.mythe,
        count: d.count,
        percentage: totalCompleted ? Math.round((d.count / totalCompleted) * 100) : 0,
        benchmark: NATIONAL_BENCHMARK[d.mythe ?? ''] || 0,
      }))

      // Add missing mythes with 0 count if includeBenchmark
      const includeBenchmark = query.includeBenchmark === 'true'
      if (includeBenchmark) {
        const existingMythes = distribution.map(d => d.mythe)
        for (const [mythe, benchmark] of Object.entries(NATIONAL_BENCHMARK)) {
          if (!existingMythes.includes(mythe)) {
            distribution.push({
              mythe,
              count: 0,
              percentage: 0,
              benchmark,
            })
          }
        }
      }

      return {
        campaign: {
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          slug: campaign.slug,
        },
        stats: {
          total: counts?.total || 0,
          completed: counts?.completed || 0,
          inProgress: counts?.inProgress || 0,
          abandoned: counts?.abandoned || 0,
          completionRate: counts?.total ? Math.round((counts.completed / counts.total) * 100) : 0,
          abandonmentRate: counts?.total ? Math.round((counts.abandoned / counts.total) * 100) : 0,
        },
        profileDistribution: distribution,
        benchmark: includeBenchmark ? NATIONAL_BENCHMARK : undefined,
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      query: t.Object({
        startDate: t.Optional(t.String()),
        endDate: t.Optional(t.String()),
        includeBenchmark: t.Optional(t.String()),
      }),
      detail: {
        tags: ['Dashboard'],
        summary: 'Get detailed statistics for a campaign',
      },
    }
  )
  // Get responses list with pagination
  .get(
    '/campaigns/:id/responses',
    async ({ headers, params, query, set }) => {
      const user = await getCurrentUser(headers['authorization'])
      if (!user) {
        set.status = 401
        return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
      }

      // Verify campaign belongs to tenant
      const [campaign] = await db
        .select()
        .from(campaigns)
        .where(and(
          eq(campaigns.id, params.id),
          eq(campaigns.tenantId, user.tenantId)
        ))
        .limit(1)

      if (!campaign) {
        set.status = 404
        return { error: 'NOT_FOUND', message: 'Campaign not found' }
      }

      const page = query.page || 1
      const limit = query.limit || 20
      const offset = (page - 1) * limit

      // Get total count
      const [countResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(respondents)
        .where(eq(respondents.campaignId, params.id))

      const total = countResult?.count || 0

      // Get responses
      const responseList = await db
        .select({
          id: respondents.id,
          email: respondents.email,
          status: respondents.status,
          primaryMythe: respondents.primaryMythe,
          currentQuestion: respondents.currentQuestion,
          totalQuestions: respondents.totalQuestions,
          startedAt: respondents.startedAt,
          completedAt: respondents.completedAt,
        })
        .from(respondents)
        .where(eq(respondents.campaignId, params.id))
        .orderBy(desc(respondents.createdAt))
        .limit(limit)
        .offset(offset)

      // Mask emails for privacy
      const responses = responseList.map((r) => ({
        ...r,
        email: maskEmail(r.email),
        progress: r.totalQuestions ? Math.round((r.currentQuestion / r.totalQuestions) * 100) : 0,
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
        tags: ['Dashboard'],
        summary: 'Get paginated responses for a campaign',
      },
    }
  )
  // Export responses as CSV
  .get(
    '/campaigns/:id/export',
    async ({ headers, params, query, set }) => {
      const user = await getCurrentUser(headers['authorization'])
      if (!user) {
        set.status = 401
        return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
      }

      if (user.role !== 'admin') {
        set.status = 403
        return { error: 'FORBIDDEN', message: 'Only admins can export data' }
      }

      // Verify campaign belongs to tenant
      const [campaign] = await db
        .select()
        .from(campaigns)
        .where(and(
          eq(campaigns.id, params.id),
          eq(campaigns.tenantId, user.tenantId)
        ))
        .limit(1)

      if (!campaign) {
        set.status = 404
        return { error: 'NOT_FOUND', message: 'Campaign not found' }
      }

      // Get all completed responses
      const responseList = await db
        .select({
          id: respondents.id,
          email: respondents.email,
          primaryMythe: respondents.primaryMythe,
          profileData: respondents.profileData,
          passeportCode: respondents.passeportCode,
          startedAt: respondents.startedAt,
          completedAt: respondents.completedAt,
        })
        .from(respondents)
        .where(and(
          eq(respondents.campaignId, params.id),
          eq(respondents.status, 'completed')
        ))
        .orderBy(desc(respondents.completedAt))

      // Parse columns from query
      const columns = query.columns?.split(',') || ['email', 'primaryMythe', 'completedAt']
      const allColumns = ['id', 'email', 'primaryMythe', 'passeportCode', 'startedAt', 'completedAt']
      const includeBenchmark = query.includeBenchmark === 'true'

      // Filter to valid columns
      const selectedColumns = columns.filter((c) => allColumns.includes(c))
      if (selectedColumns.length === 0) {
        selectedColumns.push('email', 'primaryMythe', 'completedAt')
      }

      // Build CSV
      const csvRows: string[] = []

      // Header row
      const headerCols = [...selectedColumns]
      if (includeBenchmark && selectedColumns.includes('primaryMythe')) {
        headerCols.push('benchmarkNational')
      }
      csvRows.push(headerCols.join(','))

      // Data rows
      for (const response of responseList) {
        const row = selectedColumns.map((col) => {
          const value = response[col as keyof typeof response]
          if (value === null || value === undefined) return ''
          if (value instanceof Date) return value.toISOString()
          if (typeof value === 'string' && value.includes(',')) return `"${value}"`
          return String(value)
        })
        // Add benchmark if requested
        if (includeBenchmark && selectedColumns.includes('primaryMythe')) {
          const benchmark = NATIONAL_BENCHMARK[response.primaryMythe ?? ''] || 0
          row.push(String(benchmark))
        }
        csvRows.push(row.join(','))
      }

      const csv = csvRows.join('\n')

      // Log export for audit
      console.log(`[AUDIT] Export: user=${user.id}, campaign=${params.id}, rows=${responseList.length}`)

      // Return CSV with proper headers
      set.headers['content-type'] = 'text/csv'
      set.headers['content-disposition'] = `attachment; filename="${campaign.slug}-export.csv"`

      return csv
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      query: t.Object({
        columns: t.Optional(t.String()),
        includeBenchmark: t.Optional(t.String()),
      }),
      detail: {
        tags: ['Dashboard'],
        summary: 'Export campaign responses as CSV',
      },
    }
  )
  // Export responses as Excel
  .get(
    '/campaigns/:id/export-excel',
    async ({ headers, params, query, set }) => {
      const user = await getCurrentUser(headers['authorization'])
      if (!user) {
        set.status = 401
        return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
      }

      if (user.role !== 'admin') {
        set.status = 403
        return { error: 'FORBIDDEN', message: 'Only admins can export data' }
      }

      // Verify campaign belongs to tenant
      const [campaign] = await db
        .select()
        .from(campaigns)
        .where(and(
          eq(campaigns.id, params.id),
          eq(campaigns.tenantId, user.tenantId)
        ))
        .limit(1)

      if (!campaign) {
        set.status = 404
        return { error: 'NOT_FOUND', message: 'Campaign not found' }
      }

      // Get campaign stats
      const [stats] = await db
        .select({
          total: sql<number>`count(*)::int`,
          completed: sql<number>`count(*) filter (where ${respondents.status} = 'completed')::int`,
          inProgress: sql<number>`count(*) filter (where ${respondents.status} = 'in_progress')::int`,
        })
        .from(respondents)
        .where(eq(respondents.campaignId, params.id))

      // Get all completed responses
      const responseList = await db
        .select({
          id: respondents.id,
          email: respondents.email,
          primaryMythe: respondents.primaryMythe,
          profileData: respondents.profileData,
          passeportCode: respondents.passeportCode,
          startedAt: respondents.startedAt,
          completedAt: respondents.completedAt,
        })
        .from(respondents)
        .where(and(
          eq(respondents.campaignId, params.id),
          eq(respondents.status, 'completed')
        ))
        .orderBy(desc(respondents.completedAt))

      const includeBenchmark = query.includeBenchmark === 'true'

      // Create workbook
      const workbook = XLSX.utils.book_new()

      // Summary sheet
      const summaryData = [
        ['Rapport Export - Ethnostyles'],
        [],
        ['Campagne', campaign.name],
        ['Date d\'export', new Date().toLocaleDateString('fr-FR')],
        [],
        ['Statistiques'],
        ['Total réponses', stats?.total || 0],
        ['Complétés', stats?.completed || 0],
        ['En cours', stats?.inProgress || 0],
        ['Taux de complétion', stats?.total ? `${Math.round((stats.completed / stats.total) * 100)}%` : 'N/A'],
        [],
        ['Distribution des Mythes'],
      ]

      // Add mythe distribution
      const mytheCount: Record<string, number> = {}
      for (const r of responseList) {
        if (r.primaryMythe) {
          mytheCount[r.primaryMythe] = (mytheCount[r.primaryMythe] || 0) + 1
        }
      }
      for (const [mythe, count] of Object.entries(mytheCount)) {
        const percentage = responseList.length ? Math.round((count / responseList.length) * 100) : 0
        const benchmarkVal = includeBenchmark ? NATIONAL_BENCHMARK[mythe] || 0 : null
        if (includeBenchmark) {
          summaryData.push([mythe, count, `${percentage}%`, `Benchmark: ${benchmarkVal}%`])
        } else {
          summaryData.push([mythe, count, `${percentage}%`])
        }
      }

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Résumé')

      // Data sheet
      const dataHeaders = ['Email', 'Mythe Principal', 'Code Passeport', 'Date de début', 'Date de fin']
      if (includeBenchmark) {
        dataHeaders.push('Benchmark National')
      }

      const dataRows = responseList.map(r => {
        const row = [
          r.email,
          r.primaryMythe || '',
          r.passeportCode || '',
          r.startedAt.toLocaleDateString('fr-FR'),
          r.completedAt?.toLocaleDateString('fr-FR') || '',
        ]
        if (includeBenchmark) {
          row.push(r.primaryMythe ? `${NATIONAL_BENCHMARK[r.primaryMythe] || 0}%` : '')
        }
        return row
      })

      const dataSheet = XLSX.utils.aoa_to_sheet([dataHeaders, ...dataRows])

      // Set column widths
      dataSheet['!cols'] = [
        { wch: 30 }, // Email
        { wch: 20 }, // Mythe
        { wch: 18 }, // Passeport
        { wch: 15 }, // Start date
        { wch: 15 }, // End date
      ]
      if (includeBenchmark) {
        dataSheet['!cols'].push({ wch: 18 })
      }

      XLSX.utils.book_append_sheet(workbook, dataSheet, 'Données')

      // Generate buffer
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

      // Log export for audit
      console.log(`[AUDIT] Excel Export: user=${user.id}, campaign=${params.id}, rows=${responseList.length}`)

      // Return Excel with proper headers
      set.headers['content-type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      set.headers['content-disposition'] = `attachment; filename="${campaign.slug}-export.xlsx"`

      return new Response(excelBuffer)
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      query: t.Object({
        includeBenchmark: t.Optional(t.String()),
      }),
      detail: {
        tags: ['Dashboard'],
        summary: 'Export campaign responses as Excel',
      },
    }
  )
  // Export individual profile as PDF
  .get(
    '/respondents/:id/pdf',
    async ({ headers, params, set }) => {
      const user = await getCurrentUser(headers['authorization'])
      if (!user) {
        set.status = 401
        return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
      }

      // Get respondent with campaign
      const [respondent] = await db
        .select()
        .from(respondents)
        .where(eq(respondents.id, params.id))
        .limit(1)

      if (!respondent) {
        set.status = 404
        return { error: 'NOT_FOUND', message: 'Respondent not found' }
      }

      // Verify campaign belongs to tenant
      const [campaign] = await db
        .select()
        .from(campaigns)
        .where(and(
          eq(campaigns.id, respondent.campaignId),
          eq(campaigns.tenantId, user.tenantId)
        ))
        .limit(1)

      if (!campaign) {
        set.status = 404
        return { error: 'NOT_FOUND', message: 'Campaign not found' }
      }

      if (respondent.status !== 'completed' || !respondent.primaryMythe) {
        set.status = 400
        return { error: 'NOT_COMPLETED', message: 'Profile not completed' }
      }

      // Get tenant for branding
      const [tenant] = await db
        .select()
        .from(tenants)
        .where(eq(tenants.id, user.tenantId))
        .limit(1)

      const mytheInfo = MYTHE_DESCRIPTIONS[respondent.primaryMythe] || {
        subtitle: '',
        description: 'Description non disponible.',
        strengths: [],
        values: [],
      }

      // Generate PDF
      return new Promise<Response>((resolve) => {
        const chunks: Buffer[] = []
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
        })

        doc.on('data', (chunk: Buffer) => chunks.push(chunk))
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks)

          console.log(`[AUDIT] PDF Export: user=${user.id}, respondent=${params.id}`)

          set.headers['content-type'] = 'application/pdf'
          set.headers['content-disposition'] = `attachment; filename="profil-${respondent.primaryMythe?.toLowerCase() || 'ethnostyles'}.pdf"`

          resolve(new Response(pdfBuffer))
        })

        // Primary color
        const primaryColor = campaign.primaryColor || tenant?.primaryColor || '#4F46E5'

        // Header with branding
        doc
          .fontSize(10)
          .fillColor('#6B7280')
          .text(tenant?.name || 'Ethnostyles', { align: 'left' })
          .moveDown(0.5)

        // Title
        doc
          .fontSize(28)
          .fillColor(primaryColor)
          .text(`Profil Ethnostyles`, { align: 'center' })
          .moveDown(0.3)

        // Mythe name
        doc
          .fontSize(36)
          .fillColor('#1F2937')
          .text(respondent.primaryMythe!, { align: 'center' })
          .moveDown(0.2)

        // Subtitle
        doc
          .fontSize(14)
          .fillColor('#6B7280')
          .text(mytheInfo.subtitle, { align: 'center' })
          .moveDown(1.5)

        // Passeport code
        doc
          .fontSize(12)
          .fillColor('#6B7280')
          .text('Code Passeport', { align: 'center' })
          .fontSize(16)
          .fillColor(primaryColor)
          .text(respondent.passeportCode || 'N/A', { align: 'center' })
          .moveDown(2)

        // Description
        doc
          .fontSize(14)
          .fillColor('#1F2937')
          .text('Votre profil', { underline: true })
          .moveDown(0.5)
          .fontSize(11)
          .fillColor('#4B5563')
          .text(mytheInfo.description, { align: 'justify', lineGap: 4 })
          .moveDown(1.5)

        // Strengths
        if (mytheInfo.strengths.length > 0) {
          doc
            .fontSize(14)
            .fillColor('#1F2937')
            .text('Vos points forts', { underline: true })
            .moveDown(0.5)

          for (const strength of mytheInfo.strengths) {
            doc
              .fontSize(11)
              .fillColor('#4B5563')
              .text(`• ${strength}`, { indent: 20 })
          }
          doc.moveDown(1)
        }

        // Values
        if (mytheInfo.values.length > 0) {
          doc
            .fontSize(14)
            .fillColor('#1F2937')
            .text('Vos valeurs clés', { underline: true })
            .moveDown(0.5)

          for (const value of mytheInfo.values) {
            doc
              .fontSize(11)
              .fillColor('#4B5563')
              .text(`• ${value}`, { indent: 20 })
          }
          doc.moveDown(1)
        }

        // Benchmark comparison
        const benchmark = NATIONAL_BENCHMARK[respondent.primaryMythe!] || 0
        doc
          .moveDown(1)
          .fontSize(10)
          .fillColor('#9CA3AF')
          .text(`Benchmark national pour ${respondent.primaryMythe}: ${benchmark}%`, { align: 'center' })

        // Footer
        doc
          .moveDown(2)
          .fontSize(9)
          .fillColor('#9CA3AF')
          .text('—', { align: 'center' })
          .text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' })
          .text(`Campagne: ${campaign.name}`, { align: 'center' })

        doc.end()
      })
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['Dashboard'],
        summary: 'Export individual profile as PDF',
      },
    }
  )
