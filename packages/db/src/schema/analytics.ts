import { pgTable, uuid, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { tenantColumns } from './base'
import { campaigns } from './campaigns'

/**
 * Target Culture table - stores desired culture configuration (Epic 11 - Story 11.2)
 * Used for culture gap analysis
 */
export const targetCultures = pgTable('target_cultures', {
  id: uuid('id').primaryKey().defaultRandom(),
  ...tenantColumns,
  name: varchar('name', { length: 255 }).notNull(), // e.g., "Culture Cible 2026"
  description: text('description'),
  // Target percentages for each mythe (should sum to 100)
  explorateurTarget: integer('explorateur_target').default(0),
  gardienTarget: integer('gardien_target').default(0),
  createurTarget: integer('createur_target').default(0),
  sageTarget: integer('sage_target').default(0),
  herosTarget: integer('heros_target').default(0),
  rebelleTarget: integer('rebelle_target').default(0),
  magicienTarget: integer('magicien_target').default(0),
  innocentTarget: integer('innocent_target').default(0),
  isActive: varchar('is_active', { length: 10 }).default('true'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export type TargetCulture = typeof targetCultures.$inferSelect
export type NewTargetCulture = typeof targetCultures.$inferInsert

/**
 * Team Invitations table - stores email invitations for team campaigns (Epic 10 - Story 10.1)
 */
export const teamInvitations = pgTable('team_invitations', {
  id: uuid('id').primaryKey().defaultRandom(),
  campaignId: uuid('campaign_id')
    .notNull()
    .references(() => campaigns.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  status: varchar('status', { length: 20 }).default('pending'), // 'pending', 'sent', 'completed'
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
})

export type TeamInvitation = typeof teamInvitations.$inferSelect
export type NewTeamInvitation = typeof teamInvitations.$inferInsert

/**
 * Management Recommendations - cached recommendations for teams (Epic 10 - Story 10.3)
 */
export const MANAGEMENT_RECOMMENDATIONS = {
  Explorateur: {
    tips: [
      "Laissez-leur de l'autonomie dans leurs projets",
      "Proposez des défis nouveaux régulièrement",
      "Évitez les routines trop strictes",
    ],
    communication: "Soyez direct et enthousiaste. Proposez des idées nouvelles.",
    strengths: "Innovation, adaptabilité, curiosité",
    watchFor: "Peuvent s'ennuyer avec les tâches répétitives",
  },
  Gardien: {
    tips: [
      "Valorisez leur loyauté et leur fiabilité",
      "Donnez-leur des responsabilités de mentorat",
      "Respectez les traditions de l'équipe",
    ],
    communication: "Soyez respectueux des processus établis. Expliquez le contexte.",
    strengths: "Stabilité, loyauté, protection de l'équipe",
    watchFor: "Peuvent résister aux changements trop rapides",
  },
  Créateur: {
    tips: [
      "Encouragez leur créativité et originalité",
      "Donnez-leur des projets où ils peuvent innover",
      "Acceptez les approches non-conventionnelles",
    ],
    communication: "Montrez de l'ouverture à leurs idées. Encouragez l'expression.",
    strengths: "Créativité, vision, authenticité",
    watchFor: "Peuvent avoir du mal avec les contraintes strictes",
  },
  Sage: {
    tips: [
      "Sollicitez leur expertise et leurs conseils",
      "Offrez des opportunités de formation continue",
      "Valorisez leur analyse approfondie",
    ],
    communication: "Utilisez des faits et des données. Soyez précis.",
    strengths: "Analyse, expertise, sagesse",
    watchFor: "Peuvent analyser trop longtemps avant d'agir",
  },
  Héros: {
    tips: [
      "Confiez-leur des missions à fort impact",
      "Reconnaissez publiquement leurs réussites",
      "Proposez des défis ambitieux",
    ],
    communication: "Soyez direct sur les objectifs. Montrez l'impact.",
    strengths: "Courage, détermination, leadership",
    watchFor: "Peuvent prendre trop de risques ou s'épuiser",
  },
  Rebelle: {
    tips: [
      "Écoutez leurs idées de changement",
      "Canalisez leur énergie vers l'amélioration",
      "Évitez les règles arbitraires",
    ],
    communication: "Soyez authentique. Acceptez les remises en question.",
    strengths: "Transformation, courage, authenticité",
    watchFor: "Peuvent créer des conflits avec l'autorité",
  },
  Magicien: {
    tips: [
      "Impliquez-les dans les projets de transformation",
      "Valorisez leur vision stratégique",
      "Donnez-leur de la latitude pour innover",
    ],
    communication: "Parlez vision et possibilités. Montrez le potentiel.",
    strengths: "Transformation, vision, influence",
    watchFor: "Peuvent promettre plus qu'ils ne peuvent livrer",
  },
  Innocent: {
    tips: [
      "Maintenez un environnement positif et harmonieux",
      "Protégez-les des conflits inutiles",
      "Valorisez leur optimisme",
    ],
    communication: "Soyez positif et encourageant. Évitez le cynisme.",
    strengths: "Optimisme, confiance, harmonie",
    watchFor: "Peuvent éviter les conflits nécessaires",
  },
} as const

/**
 * Team composition helper types
 */
export interface TeamComposition {
  total: number
  distribution: {
    Explorateur: number
    Gardien: number
    Créateur: number
    Sage: number
    Héros: number
    Rebelle: number
    Magicien: number
    Innocent: number
  }
  percentages: {
    Explorateur: number
    Gardien: number
    Créateur: number
    Sage: number
    Héros: number
    Rebelle: number
    Magicien: number
    Innocent: number
  }
}

export interface CultureGap {
  mythe: string
  current: number
  target: number
  gap: number
  priority: 'high' | 'medium' | 'low'
}
