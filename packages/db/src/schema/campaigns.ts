import { pgTable, uuid, varchar, text, pgEnum, timestamp, integer } from 'drizzle-orm/pg-core'
import { tenantColumns } from './base'

/**
 * Campaign status enum
 */
export const campaignStatusEnum = pgEnum('campaign_status', ['draft', 'active', 'archived'])

/**
 * Questionnaire size enum
 */
export const questionnaireSizeEnum = pgEnum('questionnaire_size', ['express', 'standard', 'complete'])

/**
 * Questionnaire style enum
 */
export const questionnaireStyleEnum = pgEnum('questionnaire_style', ['professional', 'casual', 'neutral'])

export const CAMPAIGN_STATUSES = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  ARCHIVED: 'archived',
} as const

export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[keyof typeof CAMPAIGN_STATUSES]

/**
 * Campaign type constants (Epic 10 - Story 10.1)
 */
export const CAMPAIGN_TYPES = {
  RECRUITMENT: 'recruitment',
  TEAM: 'team',
  AUDIT: 'audit',
  OTHER: 'other',
} as const

export type CampaignType = (typeof CAMPAIGN_TYPES)[keyof typeof CAMPAIGN_TYPES]

/**
 * Questionnaire size constants
 */
export const QUESTIONNAIRE_SIZES = {
  EXPRESS: 'express',      // 8 questions - quick assessment
  STANDARD: 'standard',    // 16 questions - balanced
  COMPLETE: 'complete',    // 30 questions - full depth
} as const

export type QuestionnaireSize = (typeof QUESTIONNAIRE_SIZES)[keyof typeof QUESTIONNAIRE_SIZES]

/**
 * Questionnaire style constants
 */
export const QUESTIONNAIRE_STYLES = {
  PROFESSIONAL: 'professional',  // Formal language, work context
  CASUAL: 'casual',              // Friendly, personal context
  NEUTRAL: 'neutral',            // Standard balanced
} as const

export type QuestionnaireStyle = (typeof QUESTIONNAIRE_STYLES)[keyof typeof QUESTIONNAIRE_STYLES]

/**
 * Campaigns table - stores marketing campaigns for questionnaires
 */
export const campaigns = pgTable('campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  ...tenantColumns,
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  status: campaignStatusEnum('status').notNull().default('draft'),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  // Campaign type (Epic 10 - Story 10.1)
  campaignType: varchar('campaign_type', { length: 20 }).default('other'), // 'recruitment', 'team', 'audit', 'other'
  // Team-specific fields (Epic 10 - Story 10.1)
  teamName: varchar('team_name', { length: 255 }),
  department: varchar('department', { length: 255 }),
  managerId: uuid('manager_id'), // User who manages this team campaign
  // Questionnaire configuration
  questionnaireSize: questionnaireSizeEnum('questionnaire_size').default('standard'), // 8, 16, or 30 questions
  questionnaireStyle: questionnaireStyleEnum('questionnaire_style').default('professional'),
  customQuestionIds: text('custom_question_ids'), // JSON array of question IDs for custom selection
  // Branding (Story 1.2)
  logoUrl: varchar('logo_url', { length: 500 }),
  primaryColor: varchar('primary_color', { length: 7 }), // #RRGGBB format
  // Webhook (Story 6.3)
  webhookUrl: varchar('webhook_url', { length: 500 }),
  webhookSecret: varchar('webhook_secret', { length: 64 }),
  // Scheduled export (Story 7.4)
  exportSchedule: varchar('export_schedule', { length: 20 }), // 'daily', 'weekly', 'monthly', or null
  exportFormat: varchar('export_format', { length: 10 }).default('csv'), // 'csv' or 'xlsx'
  exportEmail: varchar('export_email', { length: 255 }),
  lastExportAt: timestamp('last_export_at'),
})

export type Campaign = typeof campaigns.$inferSelect
export type NewCampaign = typeof campaigns.$inferInsert
