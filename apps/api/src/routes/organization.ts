import { Elysia, t } from 'elysia'
import { db, tenants, users, sessions, campaigns, respondents, responses, eq } from '@etnostyles/db'
import { sendEmail } from '@etnostyles/email'
import { randomBytes } from 'crypto'

// In-memory store for export tokens (use Redis in production)
const exportTokens = new Map<string, { tenantId: string; email: string; expiresAt: Date }>()
// In-memory store for deletion tokens
const deletionTokens = new Map<string, { tenantId: string; userId: string; email: string; expiresAt: Date }>()

/**
 * Generate secure token
 */
function generateToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Clean expired tokens
 */
function cleanExpiredTokens() {
  const now = new Date()
  for (const [token, data] of exportTokens.entries()) {
    if (data.expiresAt < now) exportTokens.delete(token)
  }
  for (const [token, data] of deletionTokens.entries()) {
    if (data.expiresAt < now) deletionTokens.delete(token)
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

export const organizationRoutes = new Elysia({ prefix: '/organization' })
  // Get organization settings
  .get(
    '/',
    async ({ headers, set }) => {
      const user = await getCurrentUser(headers['authorization'])
      if (!user) {
        set.status = 401
        return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
      }

      const [tenant] = await db
        .select({
          id: tenants.id,
          name: tenants.name,
          slug: tenants.slug,
          description: tenants.description,
          logoUrl: tenants.logoUrl,
          domain: tenants.domain,
          primaryColor: tenants.primaryColor,
          createdAt: tenants.createdAt,
        })
        .from(tenants)
        .where(eq(tenants.id, user.tenantId))
        .limit(1)

      if (!tenant) {
        set.status = 404
        return { error: 'NOT_FOUND', message: 'Organization not found' }
      }

      return { organization: tenant }
    },
    {
      detail: {
        tags: ['Organization'],
        summary: 'Get organization settings',
      },
    }
  )
  // Update organization settings
  .patch(
    '/',
    async ({ headers, body, set }) => {
      const user = await getCurrentUser(headers['authorization'])
      if (!user) {
        set.status = 401
        return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
      }

      if (user.role !== 'admin') {
        set.status = 403
        return { error: 'FORBIDDEN', message: 'Only admins can update organization settings' }
      }

      const { name, description, logoUrl, domain, primaryColor } = body

      // Validate primaryColor format
      if (primaryColor && !/^#[0-9A-Fa-f]{6}$/.test(primaryColor)) {
        set.status = 400
        return { error: 'INVALID_COLOR', message: 'Primary color must be a valid hex color (e.g., #4F46E5)' }
      }

      // Build update object with only provided fields
      const updateData: Partial<{
        name: string
        description: string | null
        logoUrl: string | null
        domain: string | null
        primaryColor: string
        updatedAt: Date
      }> = { updatedAt: new Date() }

      if (name !== undefined) updateData.name = name
      if (description !== undefined) updateData.description = description
      if (logoUrl !== undefined) updateData.logoUrl = logoUrl
      if (domain !== undefined) updateData.domain = domain
      if (primaryColor !== undefined) updateData.primaryColor = primaryColor

      const [updated] = await db
        .update(tenants)
        .set(updateData)
        .where(eq(tenants.id, user.tenantId))
        .returning({
          id: tenants.id,
          name: tenants.name,
          slug: tenants.slug,
          description: tenants.description,
          logoUrl: tenants.logoUrl,
          domain: tenants.domain,
          primaryColor: tenants.primaryColor,
          updatedAt: tenants.updatedAt,
        })

      if (!updated) {
        set.status = 500
        return { error: 'UPDATE_FAILED', message: 'Failed to update organization' }
      }

      return { success: true, organization: updated }
    },
    {
      body: t.Object({
        name: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
        description: t.Optional(t.Union([t.String({ maxLength: 1000 }), t.Null()])),
        logoUrl: t.Optional(t.Union([t.String({ maxLength: 500 }), t.Null()])),
        domain: t.Optional(t.Union([t.String({ maxLength: 255 }), t.Null()])),
        primaryColor: t.Optional(t.String({ minLength: 7, maxLength: 7 })),
      }),
      detail: {
        tags: ['Organization'],
        summary: 'Update organization settings',
      },
    }
  )
  // Request organization data export (RGPD)
  .post(
    '/export-request',
    async ({ headers, set }) => {
      const user = await getCurrentUser(headers['authorization'])
      if (!user) {
        set.status = 401
        return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
      }

      if (user.role !== 'admin') {
        set.status = 403
        return { error: 'FORBIDDEN', message: 'Only admins can request data export' }
      }

      cleanExpiredTokens()

      // Generate export token (valid for 24 hours)
      const token = generateToken()
      exportTokens.set(token, {
        tenantId: user.tenantId,
        email: user.email,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      })

      // Send email with download link
      const downloadUrl = `${process.env['API_URL'] || 'http://localhost:3000'}/organization/export-download?token=${token}`

      sendEmail({
        to: user.email,
        subject: 'Export de vos données - Ethnostyles',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
  <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <h1 style="color: #1f2937; font-size: 24px; margin: 0 0 16px 0;">Export de vos données</h1>

    <p style="color: #4b5563; line-height: 1.6; margin: 0 0 16px 0;">
      Vous avez demandé l'export de toutes les données de votre organisation conformément au RGPD.
    </p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${downloadUrl}" style="display: inline-block; background: #4F46E5; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
        Télécharger mes données
      </a>
    </div>

    <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
      Ce lien expire dans 24 heures. L'export inclut : informations de l'organisation, campagnes, et toutes les réponses.
    </p>
  </div>
</body>
</html>
        `,
      }).catch((err) => {
        console.error('[EMAIL] Failed to send export email:', err)
      })

      return { success: true, message: 'Un email avec le lien de téléchargement a été envoyé.' }
    },
    {
      detail: {
        tags: ['Organization'],
        summary: 'Request organization data export (RGPD)',
      },
    }
  )
  // Download organization export
  .get(
    '/export-download',
    async ({ query, set }) => {
      const { token } = query

      cleanExpiredTokens()

      const tokenData = exportTokens.get(token)
      if (!tokenData) {
        set.status = 400
        return { error: 'INVALID_TOKEN', message: 'Lien invalide ou expiré' }
      }

      if (tokenData.expiresAt < new Date()) {
        exportTokens.delete(token)
        set.status = 400
        return { error: 'EXPIRED_TOKEN', message: 'Lien expiré' }
      }

      // Get organization data
      const [tenant] = await db
        .select()
        .from(tenants)
        .where(eq(tenants.id, tokenData.tenantId))
        .limit(1)

      if (!tenant) {
        exportTokens.delete(token)
        set.status = 404
        return { error: 'NOT_FOUND', message: 'Organisation non trouvée' }
      }

      // Get all campaigns
      const campaignList = await db
        .select()
        .from(campaigns)
        .where(eq(campaigns.tenantId, tokenData.tenantId))

      // Get all respondents for all campaigns
      const campaignIds = campaignList.map(c => c.id)
      const respondentList = campaignIds.length > 0 && campaignIds[0]
        ? await db
            .select()
            .from(respondents)
            .where(eq(respondents.campaignId, campaignIds[0]))
        : []

      // For each additional campaign, get respondents
      for (let i = 1; i < campaignIds.length; i++) {
        const campaignId = campaignIds[i]
        if (!campaignId) continue
        const moreRespondents = await db
          .select()
          .from(respondents)
          .where(eq(respondents.campaignId, campaignId))
        respondentList.push(...moreRespondents)
      }

      // Delete token (single use)
      exportTokens.delete(token)

      // Build export data
      const exportData = {
        exportDate: new Date().toISOString(),
        exportFormat: 'RGPD-Compliant Organization Data Export',
        organization: {
          name: tenant.name,
          slug: tenant.slug,
          description: tenant.description,
          domain: tenant.domain,
          createdAt: tenant.createdAt.toISOString(),
        },
        campaigns: campaignList.map(c => ({
          id: c.id,
          name: c.name,
          description: c.description,
          status: c.status,
          slug: c.slug,
          createdAt: c.createdAt.toISOString(),
        })),
        responses: respondentList.map(r => ({
          campaignId: r.campaignId,
          email: r.email,
          status: r.status,
          primaryMythe: r.primaryMythe,
          completedAt: r.completedAt?.toISOString(),
        })),
        totalCampaigns: campaignList.length,
        totalResponses: respondentList.length,
      }

      console.log(`[RGPD] Organization export for tenant ${tokenData.tenantId}`)

      set.headers['Content-Type'] = 'application/json'
      set.headers['Content-Disposition'] = `attachment; filename="ethnostyles-org-export-${Date.now()}.json"`

      return exportData
    },
    {
      query: t.Object({
        token: t.String(),
      }),
      detail: {
        tags: ['Organization'],
        summary: 'Download organization data export',
      },
    }
  )
  // Request account deletion (RGPD)
  .post(
    '/delete-request',
    async ({ headers, set }) => {
      const user = await getCurrentUser(headers['authorization'])
      if (!user) {
        set.status = 401
        return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
      }

      if (user.role !== 'admin') {
        set.status = 403
        return { error: 'FORBIDDEN', message: 'Only admins can request account deletion' }
      }

      cleanExpiredTokens()

      // Generate deletion token (valid for 24 hours)
      const token = generateToken()
      deletionTokens.set(token, {
        tenantId: user.tenantId,
        userId: user.id,
        email: user.email,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      })

      // Send confirmation email
      const confirmUrl = `${process.env['WEB_URL'] || 'http://localhost:5173'}/delete-account-confirm?token=${token}`

      sendEmail({
        to: user.email,
        subject: 'Confirmation de suppression de compte - Ethnostyles',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
  <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <h1 style="color: #dc2626; font-size: 24px; margin: 0 0 16px 0;">Suppression de compte</h1>

    <p style="color: #4b5563; line-height: 1.6; margin: 0 0 16px 0;">
      Vous avez demandé la suppression de votre compte et de toutes vos données.
    </p>

    <p style="color: #dc2626; font-weight: 600; line-height: 1.6; margin: 0 0 24px 0;">
      Attention : Cette action est irréversible. Toutes vos campagnes, réponses et données seront définitivement supprimées.
    </p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${confirmUrl}" style="display: inline-block; background: #dc2626; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
        Confirmer la suppression
      </a>
    </div>

    <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
      Ce lien expire dans 24 heures. Si vous n'avez pas fait cette demande, ignorez cet email.
    </p>
  </div>
</body>
</html>
        `,
      }).catch((err) => {
        console.error('[EMAIL] Failed to send deletion email:', err)
      })

      return { success: true, message: 'Un email de confirmation a été envoyé.' }
    },
    {
      detail: {
        tags: ['Organization'],
        summary: 'Request account deletion (RGPD)',
      },
    }
  )
  // Confirm account deletion
  .post(
    '/delete-confirm',
    async ({ body, set }) => {
      const { token, confirmText } = body

      cleanExpiredTokens()

      const tokenData = deletionTokens.get(token)
      if (!tokenData) {
        set.status = 400
        return { error: 'INVALID_TOKEN', message: 'Lien invalide ou expiré' }
      }

      if (tokenData.expiresAt < new Date()) {
        deletionTokens.delete(token)
        set.status = 400
        return { error: 'EXPIRED_TOKEN', message: 'Lien expiré' }
      }

      // Verify confirmation text
      if (confirmText !== 'SUPPRIMER') {
        set.status = 400
        return { error: 'INVALID_CONFIRMATION', message: 'Veuillez saisir SUPPRIMER pour confirmer' }
      }

      // Get all campaigns for this tenant
      const campaignList = await db
        .select({ id: campaigns.id })
        .from(campaigns)
        .where(eq(campaigns.tenantId, tokenData.tenantId))

      // Delete all responses for each campaign
      for (const campaign of campaignList) {
        const campaignRespondents = await db
          .select({ id: respondents.id })
          .from(respondents)
          .where(eq(respondents.campaignId, campaign.id))

        for (const respondent of campaignRespondents) {
          await db.delete(responses).where(eq(responses.respondentId, respondent.id))
        }

        await db.delete(respondents).where(eq(respondents.campaignId, campaign.id))
      }

      // Delete all campaigns
      await db.delete(campaigns).where(eq(campaigns.tenantId, tokenData.tenantId))

      // Delete all users for this tenant
      await db.delete(users).where(eq(users.tenantId, tokenData.tenantId))

      // Delete all sessions for users of this tenant
      await db.delete(sessions).where(eq(sessions.userId, tokenData.userId))

      // Delete the tenant
      await db.delete(tenants).where(eq(tenants.id, tokenData.tenantId))

      // Delete the token
      deletionTokens.delete(token)

      // Send confirmation email
      sendEmail({
        to: tokenData.email,
        subject: 'Votre compte a été supprimé - Ethnostyles',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
  <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <h1 style="color: #1f2937; font-size: 24px; margin: 0 0 16px 0;">Compte supprimé</h1>

    <p style="color: #4b5563; line-height: 1.6; margin: 0 0 16px 0;">
      Conformément à votre demande, votre compte et toutes vos données ont été définitivement supprimés.
    </p>

    <ul style="color: #4b5563; line-height: 1.8; margin: 0 0 24px 0; padding-left: 20px;">
      <li>Toutes vos campagnes ont été supprimées</li>
      <li>Toutes les réponses ont été supprimées</li>
      <li>Votre organisation a été supprimée</li>
    </ul>

    <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
      Merci d'avoir utilisé Ethnostyles. Cette action est conforme au RGPD.
    </p>
  </div>
</body>
</html>
        `,
      }).catch((err) => {
        console.error('[EMAIL] Failed to send deletion confirmation:', err)
      })

      console.log(`[RGPD] Account deleted for tenant ${tokenData.tenantId}`)

      return { success: true, message: 'Votre compte a été supprimé avec succès.' }
    },
    {
      body: t.Object({
        token: t.String(),
        confirmText: t.String(),
      }),
      detail: {
        tags: ['Organization'],
        summary: 'Confirm account deletion (RGPD)',
      },
    }
  )
