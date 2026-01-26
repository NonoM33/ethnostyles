import { pgTable, uuid, varchar, text, integer, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core'
import { campaigns } from './campaigns'

/**
 * Respondent status enum
 */
export const respondentStatusEnum = pgEnum('respondent_status', ['in_progress', 'completed', 'abandoned'])

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
  totalQuestions: integer('total_questions').notNull().default(170),

  // Consent
  consentGiven: boolean('consent_given').notNull().default(false),
  consentAt: timestamp('consent_at'),

  // Passeport (generated after completion)
  passeportCode: varchar('passeport_code', { length: 14 }).unique(), // XXXX-XXXX-XXXX

  // Profile result (calculated after completion)
  primaryMythe: varchar('primary_mythe', { length: 50 }),
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
  questionNumber: integer('question_number').notNull(),
  answer: integer('answer').notNull(), // 1-4 Likert scale
  answeredAt: timestamp('answered_at').notNull().defaultNow(),
})

export type Response = typeof responses.$inferSelect
export type NewResponse = typeof responses.$inferInsert

/**
 * Questions table - the 170 questions
 * Note: In production, this could be seeded from a CSV or loaded from a config
 */
export const questions = pgTable('questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  number: integer('number').notNull().unique(),
  text: text('text').notNull(),
  category: varchar('category', { length: 50 }), // Optional categorization
  mytheDimension: varchar('mythe_dimension', { length: 50 }), // Which mythe this affects
  weight: integer('weight').default(1), // Scoring weight
  isActive: boolean('is_active').notNull().default(true),
})

export type Question = typeof questions.$inferSelect
export type NewQuestion = typeof questions.$inferInsert
