import { pgTable, varchar, integer, timestamp, boolean, text, jsonb, pgEnum } from 'drizzle-orm/pg-core'
import { tenantColumns, timestampColumns } from './base'
import { tenants } from './tenants'
import { relations } from 'drizzle-orm'

// Enums
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'past_due', 'canceled', 'trialing', 'incomplete', 'incomplete_expired', 'paused'])
export const planIdEnum = pgEnum('plan_id', ['free', 'pro', 'enterprise'])

// Plans configuration
export const PLANS = {
  free: {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    pricePerSeat: 0,
    limits: {
      campaigns: 1,
      responses: 50,
      teamMembers: 2,
    },
    features: ['1 campagne active', '50 reponses/mois', '2 membres'],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 4900, // in cents
    pricePerSeat: 900, // in cents
    limits: {
      campaigns: null, // unlimited
      responses: 1000,
      teamMembers: 10,
    },
    features: ['Campagnes illimitees', '1000 reponses/mois', '10 membres inclus', 'Analytics avances'],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 19900, // in cents
    pricePerSeat: 500, // in cents
    limits: {
      campaigns: null,
      responses: null,
      teamMembers: null,
    },
    features: ['Tout illimite', 'SSO/SAML', 'API access', 'Support dedie'],
  },
} as const

export type PlanId = keyof typeof PLANS

// Subscriptions table
export const subscriptions = pgTable('subscriptions', {
  id: varchar('id', { length: 255 }).primaryKey(), // Stripe subscription ID
  tenantId: varchar('tenant_id', { length: 36 }).notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }).notNull(),
  planId: planIdEnum('plan_id').notNull().default('free'),
  status: subscriptionStatusEnum('status').notNull().default('active'),
  currentPeriodStart: timestamp('current_period_start', { mode: 'date' }).notNull(),
  currentPeriodEnd: timestamp('current_period_end', { mode: 'date' }).notNull(),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
  canceledAt: timestamp('canceled_at', { mode: 'date' }),
  trialStart: timestamp('trial_start', { mode: 'date' }),
  trialEnd: timestamp('trial_end', { mode: 'date' }),
  seatsIncluded: integer('seats_included').notNull().default(2),
  seatsExtra: integer('seats_extra').notNull().default(0),
  metadata: jsonb('metadata').$type<Record<string, string>>(),
  ...timestampColumns,
})

// Payment methods table
export const paymentMethods = pgTable('payment_methods', {
  id: varchar('id', { length: 255 }).primaryKey(), // Stripe payment method ID
  tenantId: varchar('tenant_id', { length: 36 }).notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull().default('card'),
  cardBrand: varchar('card_brand', { length: 50 }),
  cardLast4: varchar('card_last4', { length: 4 }),
  cardExpMonth: integer('card_exp_month'),
  cardExpYear: integer('card_exp_year'),
  isDefault: boolean('is_default').notNull().default(false),
  ...timestampColumns,
})

// Invoices table (cached from Stripe)
export const invoices = pgTable('invoices', {
  id: varchar('id', { length: 255 }).primaryKey(), // Stripe invoice ID
  tenantId: varchar('tenant_id', { length: 36 }).notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  subscriptionId: varchar('subscription_id', { length: 255 }).references(() => subscriptions.id),
  number: varchar('number', { length: 100 }),
  status: varchar('status', { length: 50 }).notNull(), // draft, open, paid, void, uncollectible
  amount: integer('amount').notNull(), // in cents
  currency: varchar('currency', { length: 3 }).notNull().default('eur'),
  periodStart: timestamp('period_start', { mode: 'date' }),
  periodEnd: timestamp('period_end', { mode: 'date' }),
  paidAt: timestamp('paid_at', { mode: 'date' }),
  invoicePdf: text('invoice_pdf'),
  hostedInvoiceUrl: text('hosted_invoice_url'),
  ...timestampColumns,
})

// Usage tracking table
export const usageRecords = pgTable('usage_records', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: varchar('tenant_id', { length: 36 }).notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  periodStart: timestamp('period_start', { mode: 'date' }).notNull(),
  periodEnd: timestamp('period_end', { mode: 'date' }).notNull(),
  campaignsUsed: integer('campaigns_used').notNull().default(0),
  responsesUsed: integer('responses_used').notNull().default(0),
  teamMembersUsed: integer('team_members_used').notNull().default(0),
  ...timestampColumns,
})

// Relations
export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [subscriptions.tenantId],
    references: [tenants.id],
  }),
  invoices: many(invoices),
}))

export const invoicesRelations = relations(invoices, ({ one }) => ({
  tenant: one(tenants, {
    fields: [invoices.tenantId],
    references: [tenants.id],
  }),
  subscription: one(subscriptions, {
    fields: [invoices.subscriptionId],
    references: [subscriptions.id],
  }),
}))

// Types
export type Subscription = typeof subscriptions.$inferSelect
export type NewSubscription = typeof subscriptions.$inferInsert
export type PaymentMethod = typeof paymentMethods.$inferSelect
export type NewPaymentMethod = typeof paymentMethods.$inferInsert
export type Invoice = typeof invoices.$inferSelect
export type NewInvoice = typeof invoices.$inferInsert
export type UsageRecord = typeof usageRecords.$inferSelect
export type NewUsageRecord = typeof usageRecords.$inferInsert
