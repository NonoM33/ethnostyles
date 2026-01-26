import { Elysia, t } from 'elysia'
import { db, campaigns, respondents, responses, questions, eq, and, desc } from '@etnostyles/db'
import { sendEmail, generateResultsEmailHtml, getResultsEmailSubject } from '@etnostyles/email'
import { createHmac, randomBytes } from 'crypto'
import {
  ETS_GROUPS,
  QUIZ_QUESTIONS,
  getQuestionsForSize,
  calculateQuizScores,
  getDominantMyths,
  calculateConfidence,
  QUESTIONNAIRE_SIZES,
  type GroupKey,
  type QuestionnaireSize,
} from '@etnostyles/shared/ets-data'

// In-memory store for deletion tokens (in production, use Redis or DB)
const deletionTokens = new Map<string, { respondentId: string; email: string; expiresAt: Date }>()

// In-memory store for export tokens (in production, use Redis or DB)
const exportTokens = new Map<string, { respondentId: string; email: string; expiresAt: Date }>()

/**
 * Generate a secure deletion token
 */
function generateDeletionToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Clean expired deletion tokens
 */
function cleanExpiredTokens() {
  const now = new Date()
  for (const [token, data] of deletionTokens.entries()) {
    if (data.expiresAt < now) {
      deletionTokens.delete(token)
    }
  }
}

// Mythe descriptions for email - uses ETS_GROUPS
function getMytheDescription(mytheKey: string): string {
  const group = ETS_GROUPS[mytheKey as GroupKey]
  return group?.fullDescription || group?.description || ''
}

// Get mythe name for display
function getMytheName(mytheKey: string): string {
  const group = ETS_GROUPS[mytheKey as GroupKey]
  return group?.name || mytheKey
}

/**
 * Get questions for a campaign based on its configuration
 */
function getCampaignQuestions(campaign: { questionnaireSize?: string | null; customQuestionIds?: string | null }) {
  // Check for custom question selection
  if (campaign.customQuestionIds) {
    try {
      const ids = JSON.parse(campaign.customQuestionIds) as number[]
      return QUIZ_QUESTIONS.filter(q => ids.includes(q.id))
    } catch {
      // Fall through to size-based selection
    }
  }

  // Use size-based selection
  const sizeMap: Record<string, QuestionnaireSize> = {
    express: QUESTIONNAIRE_SIZES.EXPRESS,
    standard: QUESTIONNAIRE_SIZES.STANDARD,
    complete: QUESTIONNAIRE_SIZES.COMPLETE,
  }
  const size = sizeMap[campaign.questionnaireSize || 'standard'] || QUESTIONNAIRE_SIZES.STANDARD
  return getQuestionsForSize(size)
}

/**
 * Generate a unique Passeport code (XXXX-XXXX-XXXX format)
 */
function generatePasseportCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // No confusing chars (0, O, I, 1)
  const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `${segment()}-${segment()}-${segment()}`
}

// getSampleQuestions is replaced by getCampaignQuestions above

/**
 * Send webhook notification with retry (3 attempts, exponential backoff)
 */
async function sendWebhook(
  webhookUrl: string,
  webhookSecret: string | null,
  payload: object
) {
  const body = JSON.stringify(payload)
  const signature = webhookSecret
    ? createHmac('sha256', webhookSecret).update(body).digest('hex')
    : undefined

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (signature) {
    headers['X-Webhook-Signature'] = signature
  }

  const delays = [0, 1000, 4000] // Exponential backoff: 0s, 1s, 4s

  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, delays[attempt]))
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body,
        signal: AbortSignal.timeout(10000), // 10s timeout
      })

      if (response.ok) {
        console.log(`[WEBHOOK] Success: ${webhookUrl}`)
        return true
      }

      console.log(`[WEBHOOK] Attempt ${attempt + 1} failed: ${response.status}`)
    } catch (err) {
      console.log(`[WEBHOOK] Attempt ${attempt + 1} error:`, err)
    }
  }

  console.error(`[WEBHOOK] All attempts failed for ${webhookUrl}`)
  return false
}

export const questionnaireRoutes = new Elysia({ prefix: '/q' })
  // Public route - get campaign by slug
  .get(
    '/:slug',
    async ({ params, set }) => {
      const [campaign] = await db
        .select({
          id: campaigns.id,
          name: campaigns.name,
          description: campaigns.description,
          status: campaigns.status,
          slug: campaigns.slug,
          logoUrl: campaigns.logoUrl,
          primaryColor: campaigns.primaryColor,
          questionnaireSize: campaigns.questionnaireSize,
          questionnaireStyle: campaigns.questionnaireStyle,
        })
        .from(campaigns)
        .where(eq(campaigns.slug, params.slug))
        .limit(1)

      if (!campaign) {
        set.status = 404
        return { error: 'NOT_FOUND', message: 'Campagne non trouvée' }
      }

      if (campaign.status === 'archived') {
        return {
          campaign,
          isArchived: true,
          message: 'Cette campagne est terminée',
        }
      }

      if (campaign.status === 'draft') {
        set.status = 404
        return { error: 'NOT_FOUND', message: 'Campagne non trouvée' }
      }

      return { campaign, isArchived: false }
    },
    {
      params: t.Object({
        slug: t.String(),
      }),
      detail: {
        tags: ['Questionnaire'],
        summary: 'Get public campaign info by slug',
      },
    }
  )
  // Start questionnaire - create respondent
  .post(
    '/:slug/start',
    async ({ params, body, set }) => {
      const { email, consent } = body

      if (!consent) {
        set.status = 400
        return { error: 'CONSENT_REQUIRED', message: 'Vous devez accepter la politique de confidentialité' }
      }

      // Get campaign
      const [campaign] = await db
        .select()
        .from(campaigns)
        .where(eq(campaigns.slug, params.slug))
        .limit(1)

      if (!campaign || campaign.status !== 'active') {
        set.status = 404
        return { error: 'CAMPAIGN_NOT_FOUND', message: 'Campagne non trouvée ou inactive' }
      }

      // Check if respondent already exists for this campaign
      const [existingRespondent] = await db
        .select()
        .from(respondents)
        .where(and(
          eq(respondents.campaignId, campaign.id),
          eq(respondents.email, email)
        ))
        .limit(1)

      if (existingRespondent) {
        // Return existing respondent (for resume functionality)
        return {
          respondent: {
            id: existingRespondent.id,
            currentQuestion: existingRespondent.currentQuestion,
            status: existingRespondent.status,
          },
          isExisting: true,
          message: existingRespondent.status === 'completed'
            ? 'Vous avez déjà complété ce questionnaire'
            : 'Reprise de votre session précédente',
        }
      }

      // Get total questions based on campaign configuration
      const questions = getCampaignQuestions(campaign)
      const totalQuestions = questions.length

      // Create new respondent
      const [respondent] = await db
        .insert(respondents)
        .values({
          campaignId: campaign.id,
          email,
          consentGiven: true,
          consentAt: new Date(),
          currentQuestion: 1,
          totalQuestions,
        })
        .returning()

      if (!respondent) {
        set.status = 500
        return { error: 'CREATE_FAILED', message: 'Erreur lors de la création' }
      }

      return {
        respondent: {
          id: respondent.id,
          currentQuestion: respondent.currentQuestion,
          status: respondent.status,
        },
        isExisting: false,
      }
    },
    {
      params: t.Object({
        slug: t.String(),
      }),
      body: t.Object({
        email: t.String({ format: 'email' }),
        consent: t.Boolean(),
      }),
      detail: {
        tags: ['Questionnaire'],
        summary: 'Start questionnaire (create respondent)',
      },
    }
  )
  // Get question
  .get(
    '/respondent/:id/question',
    async ({ params, set }) => {
      const [respondent] = await db
        .select()
        .from(respondents)
        .where(eq(respondents.id, params.id))
        .limit(1)

      if (!respondent) {
        set.status = 404
        return { error: 'NOT_FOUND', message: 'Session non trouvée' }
      }

      if (respondent.status === 'completed') {
        const primaryGroup = respondent.primaryMythe ? ETS_GROUPS[respondent.primaryMythe as GroupKey] : null
        return {
          isCompleted: true,
          passeportCode: respondent.passeportCode,
          primaryMythe: respondent.primaryMythe,
          primaryDetails: primaryGroup ? {
            name: primaryGroup.name,
            tagline: primaryGroup.tagline,
            emoji: primaryGroup.emoji,
            color: primaryGroup.color,
          } : null,
        }
      }

      // Get campaign for questionnaire configuration
      const [campaign] = await db
        .select({
          questionnaireSize: campaigns.questionnaireSize,
          customQuestionIds: campaigns.customQuestionIds,
        })
        .from(campaigns)
        .where(eq(campaigns.id, respondent.campaignId))
        .limit(1)

      // Get current question from dynamic questionnaire
      const questionList = getCampaignQuestions(campaign || {})
      const currentQ = questionList[respondent.currentQuestion - 1]

      if (!currentQ) {
        set.status = 500
        return { error: 'QUESTION_NOT_FOUND', message: 'Question non trouvée' }
      }

      return {
        isCompleted: false,
        question: {
          id: currentQ.id,
          type: currentQ.type,
          text: currentQ.question,
          options: currentQ.options.map(o => o.text),
          round: currentQ.round,
        },
        progress: {
          current: respondent.currentQuestion,
          total: respondent.totalQuestions,
          percentage: Math.round((respondent.currentQuestion / respondent.totalQuestions) * 100),
        },
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['Questionnaire'],
        summary: 'Get current question for respondent',
      },
    }
  )
  // Submit answer
  .post(
    '/respondent/:id/answer',
    async ({ params, body, set }) => {
      const { questionNumber, answerIndex } = body

      if (answerIndex < 0 || answerIndex > 3) {
        set.status = 400
        return { error: 'INVALID_ANSWER', message: 'L\'index de réponse doit être entre 0 et 3' }
      }

      const [respondent] = await db
        .select()
        .from(respondents)
        .where(eq(respondents.id, params.id))
        .limit(1)

      if (!respondent) {
        set.status = 404
        return { error: 'NOT_FOUND', message: 'Session non trouvée' }
      }

      if (respondent.status === 'completed') {
        set.status = 400
        return { error: 'ALREADY_COMPLETED', message: 'Questionnaire déjà complété' }
      }

      // Save answer
      await db.insert(responses).values({
        respondentId: respondent.id,
        questionId: questionNumber,
        answerIndex,
      })

      // Check if this was the last question
      const isLastQuestion = questionNumber >= respondent.totalQuestions

      if (isLastQuestion) {
        // Generate Passeport code
        let passeportCode = generatePasseportCode()
        // Ensure uniqueness
        let attempts = 0
        while (attempts < 10) {
          const [existing] = await db
            .select({ id: respondents.id })
            .from(respondents)
            .where(eq(respondents.passeportCode, passeportCode))
            .limit(1)
          if (!existing) break
          passeportCode = generatePasseportCode()
          attempts++
        }

        // Get campaign for questionnaire configuration
        const [campaignConfig] = await db
          .select({
            questionnaireSize: campaigns.questionnaireSize,
            customQuestionIds: campaigns.customQuestionIds,
          })
          .from(campaigns)
          .where(eq(campaigns.id, respondent.campaignId))
          .limit(1)

        // Get all answers for this respondent
        const allResponses = await db
          .select({
            questionId: responses.questionId,
            answerIndex: responses.answerIndex,
          })
          .from(responses)
          .where(eq(responses.respondentId, params.id))
          .orderBy(responses.questionId)

        // Get the questions used for this campaign
        const questionList = getCampaignQuestions(campaignConfig || {})

        // Build answers array in question order
        const answersArray = questionList.map((q) => {
          const resp = allResponses.find(r => r.questionId === q.id)
          return resp?.answerIndex ?? 0
        })

        // Calculate profile using the real scoring algorithm
        const scores = calculateQuizScores(answersArray, questionList)
        const { primary, secondary } = getDominantMyths(scores)
        const confidence = calculateConfidence(scores)

        const primaryMythe = primary.key
        const secondaryMythe = secondary.key
        const confidencePercent = Math.round(confidence * 100)

        // Update respondent as completed
        await db
          .update(respondents)
          .set({
            status: 'completed',
            currentQuestion: questionNumber,
            completedAt: new Date(),
            passeportCode,
            primaryMythe,
            secondaryMythe,
            confidenceScore: confidencePercent,
            profileData: JSON.stringify({
              primary: primaryMythe,
              secondary: secondaryMythe,
              confidence: confidencePercent,
              scores: Object.fromEntries(
                Object.entries(scores).map(([key, value]) => [key, Math.round(value * 100)])
              ),
            }),
            updatedAt: new Date(),
          })
          .where(eq(respondents.id, params.id))

        // Get campaign for branding in email and webhook
        const [campaign] = await db
          .select({
            name: campaigns.name,
            slug: campaigns.slug,
            logoUrl: campaigns.logoUrl,
            primaryColor: campaigns.primaryColor,
            webhookUrl: campaigns.webhookUrl,
            webhookSecret: campaigns.webhookSecret,
          })
          .from(campaigns)
          .where(eq(campaigns.id, respondent.campaignId))
          .limit(1)

        // Send results email (async, don't block response)
        const resultsUrl = `${process.env['WEB_URL'] || 'http://localhost:5173'}/q/${campaign?.slug}/results/${params.id}`

        const primaryGroup = ETS_GROUPS[primaryMythe as GroupKey]
        sendEmail({
          to: respondent.email,
          subject: getResultsEmailSubject(primaryGroup?.name || primaryMythe),
          html: generateResultsEmailHtml({
            primaryMythe: primaryGroup?.name || primaryMythe,
            mytheDescription: getMytheDescription(primaryMythe),
            passeportCode,
            resultsUrl,
            campaignName: campaign?.name || 'Ethnostyles',
            campaignLogo: campaign?.logoUrl,
            primaryColor: campaign?.primaryColor || primaryGroup?.color || undefined,
          }),
        }).catch((err) => {
          console.error('[EMAIL] Failed to send results email:', err)
        })

        // Send webhook notification if configured (async)
        if (campaign?.webhookUrl) {
          sendWebhook(campaign.webhookUrl, campaign.webhookSecret, {
            event: 'response.completed',
            timestamp: new Date().toISOString(),
            data: {
              respondentId: params.id,
              email: respondent.email,
              primaryMythe,
              secondaryMythe,
              confidence: confidencePercent,
              passeportCode,
              completedAt: new Date().toISOString(),
              campaignId: respondent.campaignId,
              campaignSlug: campaign.slug,
            },
          }).catch((err) => {
            console.error('[WEBHOOK] Failed:', err)
          })
        }

        return {
          isCompleted: true,
          passeportCode,
          primaryMythe,
          primaryDetails: primaryGroup ? {
            name: primaryGroup.name,
            tagline: primaryGroup.tagline,
            emoji: primaryGroup.emoji,
            color: primaryGroup.color,
          } : null,
          secondaryMythe,
          confidence: confidencePercent,
        }
      }

      // Update current question
      await db
        .update(respondents)
        .set({
          currentQuestion: questionNumber + 1,
          updatedAt: new Date(),
        })
        .where(eq(respondents.id, params.id))

      return {
        isCompleted: false,
        nextQuestion: questionNumber + 1,
        progress: {
          current: questionNumber + 1,
          total: respondent.totalQuestions,
          percentage: Math.round(((questionNumber + 1) / respondent.totalQuestions) * 100),
        },
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        questionNumber: t.Number({ minimum: 1 }),
        answerIndex: t.Number({ minimum: 0, maximum: 3 }),
      }),
      detail: {
        tags: ['Questionnaire'],
        summary: 'Submit answer to a question',
        description: 'Submit an answer using 0-based option index (0-1 for binary questions, 0-3 for choice questions)',
      },
    }
  )
  // Get results
  .get(
    '/respondent/:id/results',
    async ({ params, set }) => {
      const [respondent] = await db
        .select()
        .from(respondents)
        .where(eq(respondents.id, params.id))
        .limit(1)

      if (!respondent) {
        set.status = 404
        return { error: 'NOT_FOUND', message: 'Session non trouvée' }
      }

      if (respondent.status !== 'completed') {
        set.status = 400
        return { error: 'NOT_COMPLETED', message: 'Questionnaire non complété' }
      }

      // Get campaign for branding
      const [campaign] = await db
        .select({
          name: campaigns.name,
          logoUrl: campaigns.logoUrl,
          primaryColor: campaigns.primaryColor,
        })
        .from(campaigns)
        .where(eq(campaigns.id, respondent.campaignId))
        .limit(1)

      return {
        passeportCode: respondent.passeportCode,
        primaryMythe: respondent.primaryMythe,
        profileData: respondent.profileData ? JSON.parse(respondent.profileData) : null,
        completedAt: respondent.completedAt?.toISOString(),
        campaign,
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['Questionnaire'],
        summary: 'Get results for completed questionnaire',
      },
    }
  )
  // Use Passeport to skip questionnaire
  .post(
    '/:slug/passeport',
    async ({ params, body, set }) => {
      const { passeportCode, email, consent } = body

      if (!consent) {
        set.status = 400
        return { error: 'CONSENT_REQUIRED', message: 'Vous devez accepter la politique de confidentialité' }
      }

      // Get campaign
      const [campaign] = await db
        .select()
        .from(campaigns)
        .where(eq(campaigns.slug, params.slug))
        .limit(1)

      if (!campaign || campaign.status !== 'active') {
        set.status = 404
        return { error: 'CAMPAIGN_NOT_FOUND', message: 'Campagne non trouvée ou inactive' }
      }

      // Find respondent with this Passeport code
      const [existingProfile] = await db
        .select()
        .from(respondents)
        .where(and(
          eq(respondents.passeportCode, passeportCode.toUpperCase()),
          eq(respondents.status, 'completed')
        ))
        .limit(1)

      if (!existingProfile) {
        set.status = 400
        return { error: 'INVALID_PASSEPORT', message: 'Code Passeport invalide' }
      }

      // Check if already used this Passeport on this campaign
      const [existingRespondent] = await db
        .select()
        .from(respondents)
        .where(and(
          eq(respondents.campaignId, campaign.id),
          eq(respondents.email, email)
        ))
        .limit(1)

      if (existingRespondent) {
        // Already exists on this campaign
        return {
          respondent: {
            id: existingRespondent.id,
            passeportCode: existingRespondent.passeportCode,
            primaryMythe: existingRespondent.primaryMythe,
          },
          isExisting: true,
        }
      }

      // Create new respondent for this campaign with the existing profile
      const [newRespondent] = await db
        .insert(respondents)
        .values({
          campaignId: campaign.id,
          email,
          consentGiven: true,
          consentAt: new Date(),
          currentQuestion: 170,
          totalQuestions: 170,
          status: 'completed',
          completedAt: new Date(),
          passeportCode: existingProfile.passeportCode,
          primaryMythe: existingProfile.primaryMythe,
          profileData: existingProfile.profileData,
        })
        .returning()

      if (!newRespondent) {
        set.status = 500
        return { error: 'CREATE_FAILED', message: 'Erreur lors de la création' }
      }

      return {
        respondent: {
          id: newRespondent.id,
          passeportCode: newRespondent.passeportCode,
          primaryMythe: newRespondent.primaryMythe,
        },
        isExisting: false,
        profileReused: true,
      }
    },
    {
      params: t.Object({
        slug: t.String(),
      }),
      body: t.Object({
        passeportCode: t.String({ minLength: 14, maxLength: 14 }),
        email: t.String({ format: 'email' }),
        consent: t.Boolean(),
      }),
      detail: {
        tags: ['Questionnaire'],
        summary: 'Use existing Passeport to skip questionnaire',
      },
    }
  )
  // Recover lost Passeport
  .post(
    '/passeport/recover',
    async ({ body, set }) => {
      const { email } = body

      // Find respondent with this email who has a Passeport
      const [respondent] = await db
        .select({
          passeportCode: respondents.passeportCode,
          primaryMythe: respondents.primaryMythe,
        })
        .from(respondents)
        .where(and(
          eq(respondents.email, email),
          eq(respondents.status, 'completed')
        ))
        .orderBy(desc(respondents.completedAt))
        .limit(1)

      // Always return success to prevent email enumeration
      const successMessage = 'Si un Passeport existe pour cet email, vous recevrez un email sous peu.'

      if (!respondent || !respondent.passeportCode) {
        // No email sent, but same response for security
        return { success: true, message: successMessage }
      }

      // Send recovery email (async)
      sendEmail({
        to: email,
        subject: 'Votre code Passeport Ethnostyles',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
  <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <h1 style="color: #1f2937; font-size: 24px; margin: 0 0 16px 0;">Votre code Passeport</h1>

    <p style="color: #4b5563; line-height: 1.6; margin: 0 0 24px 0;">
      Vous avez demandé à récupérer votre code Passeport Ethnostyles. Le voici :
    </p>

    <div style="background: #f3f4f6; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
      <div style="font-size: 28px; font-weight: bold; color: #4F46E5; font-family: monospace; letter-spacing: 2px;">
        ${respondent.passeportCode}
      </div>
      <p style="color: #6b7280; font-size: 14px; margin: 12px 0 0 0;">
        Votre profil : <strong>${respondent.primaryMythe}</strong>
      </p>
    </div>

    <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
      Conservez ce code précieusement ! Il vous permet de récupérer votre profil sur toutes les campagnes Ethnostyles.
    </p>
  </div>
</body>
</html>
        `,
      }).catch((err) => {
        console.error('[EMAIL] Failed to send recovery email:', err)
      })

      return { success: true, message: successMessage }
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
      }),
      detail: {
        tags: ['Questionnaire'],
        summary: 'Recover lost Passeport by email',
      },
    }
  )
  // Request data deletion (RGPD)
  .post(
    '/respondent/:id/delete-request',
    async ({ params, body, set }) => {
      const { email } = body

      // Clean expired tokens periodically
      cleanExpiredTokens()

      const [respondent] = await db
        .select()
        .from(respondents)
        .where(and(
          eq(respondents.id, params.id),
          eq(respondents.email, email)
        ))
        .limit(1)

      // Always return success to prevent enumeration
      const successMessage = 'Si vos données existent, vous recevrez un email de confirmation sous peu.'

      if (!respondent) {
        return { success: true, message: successMessage }
      }

      // Check if already anonymized
      if (respondent.email.endsWith('@deleted.local')) {
        return { success: true, message: successMessage }
      }

      // Generate deletion token (valid for 24 hours)
      const token = generateDeletionToken()
      deletionTokens.set(token, {
        respondentId: params.id,
        email: respondent.email,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      })

      // Send confirmation email
      const confirmUrl = `${process.env['WEB_URL'] || 'http://localhost:5173'}/delete-confirm?token=${token}`

      sendEmail({
        to: respondent.email,
        subject: 'Confirmation de suppression de vos données - Ethnostyles',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
  <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <h1 style="color: #1f2937; font-size: 24px; margin: 0 0 16px 0;">Suppression de vos données</h1>

    <p style="color: #4b5563; line-height: 1.6; margin: 0 0 16px 0;">
      Vous avez demandé la suppression de vos données personnelles conformément au RGPD.
    </p>

    <p style="color: #4b5563; line-height: 1.6; margin: 0 0 24px 0;">
      <strong>Attention :</strong> Cette action est irréversible. Votre email sera supprimé et votre code Passeport sera invalidé.
    </p>

    <div style="text-align: center; margin-bottom: 24px;">
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
        console.error('[EMAIL] Failed to send deletion confirmation email:', err)
      })

      return { success: true, message: successMessage }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        email: t.String({ format: 'email' }),
      }),
      detail: {
        tags: ['Questionnaire'],
        summary: 'Request data deletion (RGPD)',
      },
    }
  )
  // Confirm data deletion (RGPD)
  .post(
    '/delete-confirm',
    async ({ body, set }) => {
      const { token } = body

      // Clean expired tokens
      cleanExpiredTokens()

      const tokenData = deletionTokens.get(token)
      if (!tokenData) {
        set.status = 400
        return { error: 'INVALID_TOKEN', message: 'Lien invalide ou expiré' }
      }

      // Check if token expired
      if (tokenData.expiresAt < new Date()) {
        deletionTokens.delete(token)
        set.status = 400
        return { error: 'EXPIRED_TOKEN', message: 'Lien expiré' }
      }

      // Get respondent
      const [respondent] = await db
        .select()
        .from(respondents)
        .where(eq(respondents.id, tokenData.respondentId))
        .limit(1)

      if (!respondent) {
        deletionTokens.delete(token)
        set.status = 404
        return { error: 'NOT_FOUND', message: 'Données non trouvées' }
      }

      // Anonymize the respondent
      const anonymizedEmail = `deleted-${Date.now()}@deleted.local`
      await db
        .update(respondents)
        .set({
          email: anonymizedEmail,
          passeportCode: null, // Invalidate Passeport
          updatedAt: new Date(),
        })
        .where(eq(respondents.id, tokenData.respondentId))

      // Delete the token
      deletionTokens.delete(token)

      // Send confirmation email to original email
      sendEmail({
        to: tokenData.email,
        subject: 'Vos données ont été supprimées - Ethnostyles',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
  <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <h1 style="color: #1f2937; font-size: 24px; margin: 0 0 16px 0;">Suppression confirmée</h1>

    <p style="color: #4b5563; line-height: 1.6; margin: 0 0 16px 0;">
      Conformément à votre demande, vos données personnelles ont été supprimées de notre système :
    </p>

    <ul style="color: #4b5563; line-height: 1.8; margin: 0 0 24px 0; padding-left: 20px;">
      <li>Votre adresse email a été supprimée</li>
      <li>Votre code Passeport a été invalidé</li>
      <li>Vos réponses ont été anonymisées</li>
    </ul>

    <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
      Cette action est conforme au Règlement Général sur la Protection des Données (RGPD).
    </p>
  </div>
</body>
</html>
        `,
      }).catch((err) => {
        console.error('[EMAIL] Failed to send deletion complete email:', err)
      })

      console.log(`[RGPD] Data deleted for respondent ${tokenData.respondentId}`)

      return {
        success: true,
        message: 'Vos données ont été supprimées avec succès',
      }
    },
    {
      body: t.Object({
        token: t.String(),
      }),
      detail: {
        tags: ['Questionnaire'],
        summary: 'Confirm data deletion (RGPD)',
      },
    }
  )
  // Request data export (RGPD)
  .post(
    '/respondent/:id/export-request',
    async ({ params, body, set }) => {
      const { email } = body

      // Clean expired tokens periodically
      const now = new Date()
      for (const [token, data] of exportTokens.entries()) {
        if (data.expiresAt < now) {
          exportTokens.delete(token)
        }
      }

      const [respondent] = await db
        .select()
        .from(respondents)
        .where(and(
          eq(respondents.id, params.id),
          eq(respondents.email, email)
        ))
        .limit(1)

      // Always return success to prevent enumeration
      const successMessage = 'Si vos données existent, vous recevrez un email avec un lien de téléchargement.'

      if (!respondent) {
        return { success: true, message: successMessage }
      }

      // Check if already anonymized
      if (respondent.email.endsWith('@deleted.local')) {
        return { success: true, message: successMessage }
      }

      // Generate export token (valid for 24 hours)
      const token = generateDeletionToken() // Reuse the same function
      exportTokens.set(token, {
        respondentId: params.id,
        email: respondent.email,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      })

      // Send export link email
      const downloadUrl = `${process.env['API_URL'] || 'http://localhost:3000'}/q/export-download?token=${token}`

      sendEmail({
        to: respondent.email,
        subject: 'Téléchargement de vos données - Ethnostyles',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
  <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <h1 style="color: #1f2937; font-size: 24px; margin: 0 0 16px 0;">Télécharger vos données</h1>

    <p style="color: #4b5563; line-height: 1.6; margin: 0 0 16px 0;">
      Vous avez demandé l'export de vos données personnelles conformément au RGPD.
    </p>

    <p style="color: #4b5563; line-height: 1.6; margin: 0 0 24px 0;">
      Cliquez sur le bouton ci-dessous pour télécharger vos données au format JSON :
    </p>

    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${downloadUrl}" style="display: inline-block; background: #4F46E5; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
        Télécharger mes données
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
        console.error('[EMAIL] Failed to send export email:', err)
      })

      return { success: true, message: successMessage }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        email: t.String({ format: 'email' }),
      }),
      detail: {
        tags: ['Questionnaire'],
        summary: 'Request data export (RGPD)',
      },
    }
  )
  // Download exported data (RGPD)
  .get(
    '/export-download',
    async ({ query, set }) => {
      const { token } = query

      // Clean expired tokens
      const now = new Date()
      for (const [t, data] of exportTokens.entries()) {
        if (data.expiresAt < now) {
          exportTokens.delete(t)
        }
      }

      const tokenData = exportTokens.get(token)
      if (!tokenData) {
        set.status = 400
        return { error: 'INVALID_TOKEN', message: 'Lien invalide ou expiré' }
      }

      // Check if token expired
      if (tokenData.expiresAt < new Date()) {
        exportTokens.delete(token)
        set.status = 400
        return { error: 'EXPIRED_TOKEN', message: 'Lien expiré' }
      }

      // Get respondent data
      const [respondent] = await db
        .select()
        .from(respondents)
        .where(eq(respondents.id, tokenData.respondentId))
        .limit(1)

      if (!respondent) {
        exportTokens.delete(token)
        set.status = 404
        return { error: 'NOT_FOUND', message: 'Données non trouvées' }
      }

      // Get all responses
      const responseList = await db
        .select({
          questionNumber: responses.questionNumber,
          answer: responses.answer,
          answeredAt: responses.answeredAt,
        })
        .from(responses)
        .where(eq(responses.respondentId, tokenData.respondentId))
        .orderBy(responses.questionNumber)

      // Get campaign info
      const [campaign] = await db
        .select({
          name: campaigns.name,
          slug: campaigns.slug,
        })
        .from(campaigns)
        .where(eq(campaigns.id, respondent.campaignId))
        .limit(1)

      // Delete the token (single use)
      exportTokens.delete(token)

      // Build export data
      const exportData = {
        exportDate: new Date().toISOString(),
        exportFormat: 'RGPD-Compliant Personal Data Export',
        profile: {
          primaryMythe: respondent.primaryMythe,
          profileData: respondent.profileData ? JSON.parse(respondent.profileData) : null,
          passeportCode: respondent.passeportCode,
        },
        personal: {
          email: respondent.email,
          consentGiven: respondent.consentGiven,
          consentAt: respondent.consentAt?.toISOString(),
        },
        questionnaire: {
          campaignName: campaign?.name,
          campaignSlug: campaign?.slug,
          startedAt: respondent.startedAt.toISOString(),
          completedAt: respondent.completedAt?.toISOString(),
          totalQuestions: respondent.totalQuestions,
        },
        responses: responseList.map((r) => ({
          questionNumber: r.questionNumber,
          answer: r.answer,
          answeredAt: r.answeredAt.toISOString(),
        })),
      }

      // Set headers for JSON download
      set.headers['Content-Type'] = 'application/json'
      set.headers['Content-Disposition'] = `attachment; filename="ethnostyles-data-${Date.now()}.json"`

      console.log(`[RGPD] Data exported for respondent ${tokenData.respondentId}`)

      return exportData
    },
    {
      query: t.Object({
        token: t.String(),
      }),
      detail: {
        tags: ['Questionnaire'],
        summary: 'Download exported data (RGPD)',
      },
    }
  )
