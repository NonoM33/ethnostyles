// Schema barrel export
export const schemaVersion = '0.5.0'

// Base columns helper
export { tenantColumns, timestampColumns } from './base'

// Tables
export { tenants, type Tenant, type NewTenant } from './tenants'
export { users, type User, type NewUser } from './users'

// Auth tables
export {
  sessions,
  accounts,
  verificationTokens,
  passwordResetTokens,
  invitations,
  type Session,
  type NewSession,
  type Account,
  type NewAccount,
  type VerificationToken,
  type NewVerificationToken,
  type PasswordResetToken,
  type NewPasswordResetToken,
  type Invitation,
  type NewInvitation,
} from './auth'

// Campaign tables
export {
  campaigns,
  campaignStatusEnum,
  CAMPAIGN_STATUSES,
  CAMPAIGN_TYPES,
  type Campaign,
  type NewCampaign,
  type CampaignStatus,
  type CampaignType,
} from './campaigns'

// Questionnaire tables
export {
  respondents,
  responses,
  questions,
  respondentStatusEnum,
  RESPONDENT_STATUSES,
  type Respondent,
  type NewRespondent,
  type RespondentStatus,
  type Response,
  type NewResponse,
  type Question,
  type NewQuestion,
} from './questionnaire'

// API Keys
export {
  apiKeys,
  type ApiKey,
  type NewApiKey,
} from './api-keys'

// Analytics tables (Epic 10 & 11)
export {
  targetCultures,
  teamInvitations,
  MANAGEMENT_RECOMMENDATIONS,
  type TargetCulture,
  type NewTargetCulture,
  type TeamInvitation,
  type NewTeamInvitation,
  type TeamComposition,
  type CultureGap,
} from './analytics'

// Enums and constants
export { roleEnum, ROLES, type Role } from './roles'

// Billing tables
export {
  subscriptions,
  paymentMethods,
  invoices,
  usageRecords,
  subscriptionStatusEnum,
  planIdEnum,
  PLANS,
  type PlanId,
  type Subscription,
  type NewSubscription,
  type PaymentMethod,
  type NewPaymentMethod,
  type Invoice,
  type NewInvoice,
  type UsageRecord,
  type NewUsageRecord,
} from './billing'
