import { pgTable, uuid, varchar, text, integer, timestamp, boolean, pgEnum, jsonb } from 'drizzle-orm/pg-core'
import { campaigns } from './campaigns'

/**
 * Respondent status enum
 */
export const respondentStatusEnum = pgEnum('respondent_status', ['in_progress', 'completed', 'abandoned'])

/**
 * Question type enum for dynamic questionnaires
 */
export const questionTypeEnum = pgEnum('question_type', ['binary', 'choice'])

export const RESPONDENT_STATUSES = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned',
} as const

export type RespondentStatus = (typeof RESPONDENT_STATUSES)[keyof typeof RESPONDENT_STATUSES]

/**
 * Respondents table - people who take the questionnaire
 */
export const respondents = pgTable('respondents', {
  id: uuid('id').primaryKey().defaultRandom(),
  campaignId: uuid('campaign_id')
    .notNull()
    .references(() => campaigns.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  status: respondentStatusEnum('status').notNull().default('in_progress'),

  // Progress tracking
  currentQuestion: integer('current_question').notNull().default(1),
  totalQuestions: integer('total_questions').notNull().default(30), // Based on campaign questionnaire size

  // Consent
  consentGiven: boolean('consent_given').notNull().default(false),
  consentAt: timestamp('consent_at'),

  // Passeport (generated after completion)
  passeportCode: varchar('passeport_code', { length: 14 }).unique(), // XXXX-XXXX-XXXX

  // Profile result (calculated after completion)
  primaryMythe: varchar('primary_mythe', { length: 50 }),
  secondaryMythe: varchar('secondary_mythe', { length: 50 }),
  confidenceScore: integer('confidence_score'), // 0-100 percentage
  profileData: text('profile_data'), // JSON string with full profile scores

  // Timestamps
  startedAt: timestamp('started_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export type Respondent = typeof respondents.$inferSelect
export type NewRespondent = typeof respondents.$inferInsert

/**
 * Responses table - individual answers to questions
 */
export const responses = pgTable('responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  respondentId: uuid('respondent_id')
    .notNull()
    .references(() => respondents.id, { onDelete: 'cascade' }),
  questionId: integer('question_id').notNull(), // Question number/ID
  answerIndex: integer('answer_index').notNull(), // 0-based option index (0-1 for binary, 0-3 for choice)
  answeredAt: timestamp('answered_at').notNull().defaultNow(),
})

export type Response = typeof responses.$inferSelect
export type NewResponse = typeof responses.$inferInsert

/**
 * Questions table - dynamic questionnaire questions
 * Supports binary (2 options) and choice (4 options) types
 */
export const questions = pgTable('questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  number: integer('number').notNull().unique(),
  text: text('text').notNull(),
  type: questionTypeEnum('type').notNull().default('choice'), // binary or choice
  round: integer('round'), // Question grouping (1-6)
  options: jsonb('options').notNull(), // Array of options with scoring
  category: varchar('category', { length: 50 }), // Optional categorization
  weight: integer('weight').default(1), // Scoring weight
  isActive: boolean('is_active').notNull().default(true),
})

export type Question = typeof questions.$inferSelect
export type NewQuestion = typeof questions.$inferInsert

/**
 * QuestionOption type for typed options
 */
export interface QuestionOption {
  text: string
  groups: Record<string, number>  // Positive points per mythe
  negative?: Record<string, number>  // Negative points per mythe
}

export const QUESTION_TYPES = {
  BINARY: 'binary',  // 2 options - quick
  CHOICE: 'choice',  // 4 options - detailed
} as const

export type QuestionType = (typeof QUESTION_TYPES)[keyof typeof QUESTION_TYPES]
