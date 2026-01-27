import { Elysia, t } from 'elysia'
// Cache bust: 2026-01-27-v1
import { db, campaigns, tenants, users, sessions, eq, and } from '@etnostyles/db'
import { createHmac } from 'crypto'

/**
 * Generate a URL-safe slug from campaign name
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
}

/**
 * Generate unique campaign slug
 */
async function generateUniqueCampaignSlug(baseName: string, tenantId: string): Promise<string> {
  const baseSlug = slugify(baseName)
  let slug = baseSlug
  let counter = 1

  while (true) {
    const existing = await db
      .select({ id: campaigns.id })
      .from(campaigns)
      .where(eq(campaigns.slug, slug))
      .limit(1)

    if (existing.length === 0) {
      return slug
    }
    slug = `${baseSlug}-${counter}`
    counter++
  }
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

export const campaignRoutes = new Elysia({ prefix: '/campaigns' })
  .get(
    '/',
    async ({ headers, set }) => {
      const user = await getCurrentUser(headers['authorization'])
      if (!user) {
        set.status = 401
        return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
      }

      // Get all campaigns for tenant
      const campaignList = await db
        .select({
          id: campaigns.id,
          name: campaigns.name,
          description: campaigns.description,
          status: campaigns.status,
          slug: campaigns.slug,
          logoUrl: campaigns.logoUrl,
          primaryColor: campaigns.primaryColor,
          createdAt: campaigns.createdAt,
          updatedAt: campaigns.updatedAt,
        })
        .from(campaigns)
        .where(eq(campaigns.tenantId, user.tenantId))
        .orderBy(campaigns.createdAt)

      return { campaigns: campaignList }
    },
    {
      detail: {
        tags: ['Campaigns'],
        summary: 'List all campaigns for current tenant',
      },
    }
  )
  .get(
    '/:id',
    async ({ headers, params, set }) => {
      const user = await getCurrentUser(headers['authorization'])
      if (!user) {
        set.status = 401
        return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
      }

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

      return { campaign }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['Campaigns'],
        summary: 'Get a single campaign by ID',
      },
    }
  )
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
        return { error: 'FORBIDDEN', message: 'Only admins can create campaigns' }
      }

      const { name, description } = body

      // Generate unique slug
      const slug = await generateUniqueCampaignSlug(name, user.tenantId)

      // Fetch tenant branding defaults
      const [tenant] = await db
        .select({
          logoUrl: tenants.logoUrl,
          primaryColor: tenants.primaryColor,
        })
        .from(tenants)
        .where(eq(tenants.id, user.tenantId))
        .limit(1)

      // Create campaign with inherited branding
      const [campaign] = await db
        .insert(campaigns)
        .values({
          tenantId: user.tenantId,
          name,
          description: description || null,
          slug,
          status: 'draft',
          logoUrl: tenant?.logoUrl || null,
          primaryColor: tenant?.primaryColor || '#4F46E5',
        })
        .returning()

      if (!campaign) {
        set.status = 500
        return { error: 'CREATE_FAILED', message: 'Failed to create campaign' }
      }

      return {
        success: true,
        campaign: {
          id: campaign.id,
          name: campaign.name,
          description: campaign.description,
          status: campaign.status,
          slug: campaign.slug,
          createdAt: campaign.createdAt.toISOString(),
        },
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1, maxLength: 255 }),
        description: t.Optional(t.String()),
      }),
      detail: {
        tags: ['Campaigns'],
        summary: 'Create a new campaign',
      },
    }
  )
  .patch(
    '/:id',
    async ({ headers, params, body, set }) => {
      const user = await getCurrentUser(headers['authorization'])
      if (!user) {
        set.status = 401
        return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
      }

      if (user.role !== 'admin') {
        set.status = 403
        return { error: 'FORBIDDEN', message: 'Only admins can update campaigns' }
      }

      // Check campaign exists and belongs to tenant
      const [existing] = await db
        .select()
        .from(campaigns)
        .where(and(
          eq(campaigns.id, params.id),
          eq(campaigns.tenantId, user.tenantId)
        ))
        .limit(1)

      if (!existing) {
        set.status = 404
        return { error: 'NOT_FOUND', message: 'Campaign not found' }
      }

      // Cannot modify archived campaigns
      if (existing.status === 'archived') {
        set.status = 400
        return { error: 'ARCHIVED', message: 'Cannot modify archived campaigns' }
      }

      const updateData: Partial<typeof campaigns.$inferInsert> = {
        updatedAt: new Date(),
      }

      if (body.name !== undefined) {
        updateData.name = body.name
      }
      if (body.description !== undefined) {
        updateData.description = body.description
      }
      if (body.logoUrl !== undefined) {
        updateData.logoUrl = body.logoUrl
      }
      if (body.primaryColor !== undefined) {
        updateData.primaryColor = body.primaryColor
      }
      if (body.webhookUrl !== undefined) {
        updateData.webhookUrl = body.webhookUrl || null
      }
      if (body.webhookSecret !== undefined) {
        updateData.webhookSecret = body.webhookSecret || null
      }

      const [updated] = await db
        .update(campaigns)
        .set(updateData)
        .where(eq(campaigns.id, params.id))
        .returning()

      return { success: true, campaign: updated }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        name: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
        description: t.Optional(t.String()),
        logoUrl: t.Optional(t.String()),
        primaryColor: t.Optional(t.String({ pattern: '^#[0-9A-Fa-f]{6}$' })),
        webhookUrl: t.Optional(t.String()),
        webhookSecret: t.Optional(t.String()),
      }),
      detail: {
        tags: ['Campaigns'],
        summary: 'Update campaign details',
      },
    }
  )
  .post(
    '/:id/activate',
    async ({ headers, params, set }) => {
      const user = await getCurrentUser(headers['authorization'])
      if (!user) {
        set.status = 401
        return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
      }

      if (user.role !== 'admin') {
        set.status = 403
        return { error: 'FORBIDDEN', message: 'Only admins can activate campaigns' }
      }

      const [existing] = await db
        .select()
        .from(campaigns)
        .where(and(
          eq(campaigns.id, params.id),
          eq(campaigns.tenantId, user.tenantId)
        ))
        .limit(1)

      if (!existing) {
        set.status = 404
        return { error: 'NOT_FOUND', message: 'Campaign not found' }
      }

      if (existing.status === 'archived') {
        set.status = 400
        return { error: 'ARCHIVED', message: 'Cannot activate archived campaigns' }
      }

      const [updated] = await db
        .update(campaigns)
        .set({ status: 'active', updatedAt: new Date() })
        .where(eq(campaigns.id, params.id))
        .returning()

      if (!updated) {
        set.status = 500
        return { error: 'UPDATE_FAILED', message: 'Failed to activate campaign' }
      }

      return {
        success: true,
        campaign: updated,
        publicUrl: `/q/${updated.slug}`,
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['Campaigns'],
        summary: 'Activate a campaign (makes it publicly accessible)',
      },
    }
  )
  .post(
    '/:id/archive',
    async ({ headers, params, set }) => {
      const user = await getCurrentUser(headers['authorization'])
      if (!user) {
        set.status = 401
        return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
      }

      if (user.role !== 'admin') {
        set.status = 403
        return { error: 'FORBIDDEN', message: 'Only admins can archive campaigns' }
      }

      const [existing] = await db
        .select()
        .from(campaigns)
        .where(and(
          eq(campaigns.id, params.id),
          eq(campaigns.tenantId, user.tenantId)
        ))
        .limit(1)

      if (!existing) {
        set.status = 404
        return { error: 'NOT_FOUND', message: 'Campaign not found' }
      }

      const [updated] = await db
        .update(campaigns)
        .set({ status: 'archived', updatedAt: new Date() })
        .where(eq(campaigns.id, params.id))
        .returning()

      return { success: true, campaign: updated }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['Campaigns'],
        summary: 'Archive a campaign (no longer accepts responses)',
      },
    }
  )
  .post(
    '/:id/duplicate',
    async ({ headers, params, set }) => {
      const user = await getCurrentUser(headers['authorization'])
      if (!user) {
        set.status = 401
        return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
      }

      if (user.role !== 'admin') {
        set.status = 403
        return { error: 'FORBIDDEN', message: 'Only admins can duplicate campaigns' }
      }

      // Get original campaign
      const [original] = await db
        .select()
        .from(campaigns)
        .where(and(
          eq(campaigns.id, params.id),
          eq(campaigns.tenantId, user.tenantId)
        ))
        .limit(1)

      if (!original) {
        set.status = 404
        return { error: 'NOT_FOUND', message: 'Campaign not found' }
      }

      // Generate unique slug for the copy
      const newName = `${original.name} (copie)`
      const slug = await generateUniqueCampaignSlug(newName, user.tenantId)

      // Create duplicate with same settings but new ID, draft status
      const [duplicate] = await db
        .insert(campaigns)
        .values({
          tenantId: user.tenantId,
          name: newName,
          description: original.description,
          slug,
          status: 'draft',
          logoUrl: original.logoUrl,
          primaryColor: original.primaryColor,
        })
        .returning()

      if (!duplicate) {
        set.status = 500
        return { error: 'DUPLICATE_FAILED', message: 'Failed to duplicate campaign' }
      }

      return {
        success: true,
        campaign: duplicate,
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['Campaigns'],
        summary: 'Duplicate a campaign (copies settings, not responses)',
      },
    }
  )
  .post(
    '/:id/test-webhook',
    async ({ headers, params, set }) => {
      const user = await getCurrentUser(headers['authorization'])
      if (!user) {
        set.status = 401
        return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
      }

      if (user.role !== 'admin') {
        set.status = 403
        return { error: 'FORBIDDEN', message: 'Only admins can test webhooks' }
      }

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

      if (!campaign.webhookUrl) {
        set.status = 400
        return { error: 'NO_WEBHOOK', message: 'No webhook URL configured' }
      }

      // Send test payload
      const payload = {
        event: 'test',
        timestamp: new Date().toISOString(),
        data: {
          message: 'This is a test webhook from Ethnostyles',
          campaignId: campaign.id,
          campaignName: campaign.name,
        },
      }

      const body = JSON.stringify(payload)
      const signature = campaign.webhookSecret
        ? createHmac('sha256', campaign.webhookSecret).update(body).digest('hex')
        : undefined

      const reqHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (signature) {
        reqHeaders['X-Webhook-Signature'] = signature
      }

      try {
        const response = await fetch(campaign.webhookUrl, {
          method: 'POST',
          headers: reqHeaders,
          body,
          signal: AbortSignal.timeout(10000),
        })

        if (response.ok) {
          return { success: true, message: 'Webhook test successful', status: response.status }
        } else {
          return { success: false, message: `Webhook returned ${response.status}`, status: response.status }
        }
      } catch (err) {
        return { success: false, message: 'Webhook request failed', error: String(err) }
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['Campaigns'],
        summary: 'Test webhook configuration',
      },
    }
  )
  // Configure scheduled export (Story 7.4)
  .patch(
    '/:id/export-schedule',
    async ({ headers, params, body, set }) => {
      const user = await getCurrentUser(headers['authorization'])
      if (!user) {
        set.status = 401
        return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
      }

      if (user.role !== 'admin') {
        set.status = 403
        return { error: 'FORBIDDEN', message: 'Only admins can configure exports' }
      }

      const [existing] = await db
        .select()
        .from(campaigns)
        .where(and(
          eq(campaigns.id, params.id),
          eq(campaigns.tenantId, user.tenantId)
        ))
        .limit(1)

      if (!existing) {
        set.status = 404
        return { error: 'NOT_FOUND', message: 'Campaign not found' }
      }

      const { schedule, format, email } = body

      // Validate schedule
      if (schedule && !['daily', 'weekly', 'monthly'].includes(schedule)) {
        set.status = 400
        return { error: 'INVALID_SCHEDULE', message: 'Schedule must be daily, weekly, or monthly' }
      }

      // Validate format
      if (format && !['csv', 'xlsx'].includes(format)) {
        set.status = 400
        return { error: 'INVALID_FORMAT', message: 'Format must be csv or xlsx' }
      }

      // If enabling schedule, email is required
      if (schedule && !email && !existing.exportEmail) {
        set.status = 400
        return { error: 'EMAIL_REQUIRED', message: 'Email address is required for scheduled exports' }
      }

      const [updated] = await db
        .update(campaigns)
        .set({
          exportSchedule: schedule || null,
          exportFormat: format || existing.exportFormat || 'csv',
          exportEmail: email !== undefined ? email : existing.exportEmail,
          updatedAt: new Date(),
        })
        .where(eq(campaigns.id, params.id))
        .returning({
          id: campaigns.id,
          exportSchedule: campaigns.exportSchedule,
          exportFormat: campaigns.exportFormat,
          exportEmail: campaigns.exportEmail,
          lastExportAt: campaigns.lastExportAt,
        })

      if (!updated) {
        set.status = 500
        return { error: 'UPDATE_FAILED', message: 'Failed to update export schedule' }
      }

      const message = schedule
        ? `Export ${schedule} activé - envoi à ${email || existing.exportEmail}`
        : 'Export automatique désactivé'

      return {
        success: true,
        message,
        exportSettings: updated,
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        schedule: t.Optional(t.Union([t.Literal('daily'), t.Literal('weekly'), t.Literal('monthly'), t.Null()])),
        format: t.Optional(t.Union([t.Literal('csv'), t.Literal('xlsx')])),
        email: t.Optional(t.String({ format: 'email' })),
      }),
      detail: {
        tags: ['Campaigns'],
        summary: 'Configure scheduled export for a campaign',
      },
    }
  )
