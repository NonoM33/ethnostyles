-- Billing tables migration
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'past_due', 'canceled', 'trialing', 'incomplete', 'incomplete_expired', 'paused');--> statement-breakpoint
CREATE TYPE "public"."plan_id" AS ENUM('free', 'pro', 'enterprise');--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "subscriptions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"stripe_customer_id" varchar(255) NOT NULL,
	"plan_id" "plan_id" DEFAULT 'free' NOT NULL,
	"status" "subscription_status" DEFAULT 'active' NOT NULL,
	"current_period_start" timestamp NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"canceled_at" timestamp,
	"trial_start" timestamp,
	"trial_end" timestamp,
	"seats_included" integer DEFAULT 2 NOT NULL,
	"seats_extra" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "payment_methods" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"stripe_customer_id" varchar(255) NOT NULL,
	"type" varchar(50) DEFAULT 'card' NOT NULL,
	"card_brand" varchar(50),
	"card_last4" varchar(4),
	"card_exp_month" integer,
	"card_exp_year" integer,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "invoices" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"subscription_id" varchar(255),
	"number" varchar(100),
	"status" varchar(50) NOT NULL,
	"amount" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'eur' NOT NULL,
	"period_start" timestamp,
	"period_end" timestamp,
	"paid_at" timestamp,
	"invoice_pdf" text,
	"hosted_invoice_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "usage_records" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"campaigns_used" integer DEFAULT 0 NOT NULL,
	"responses_used" integer DEFAULT 0 NOT NULL,
	"team_members_used" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "api_credits" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL UNIQUE,
	"balance" integer DEFAULT 0 NOT NULL,
	"weekly_used" integer DEFAULT 0 NOT NULL,
	"week_starts_at" timestamp NOT NULL,
	"total_purchased" integer DEFAULT 0 NOT NULL,
	"total_used" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "api_call_logs" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"api_key_id" varchar(36),
	"endpoint" varchar(255) NOT NULL,
	"method" varchar(10) NOT NULL,
	"status_code" integer NOT NULL,
	"response_time_ms" integer,
	"credits_used" integer DEFAULT 1 NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"request_body" text,
	"error_message" text,
	"called_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "credit_purchases" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"stripe_payment_intent_id" varchar(255),
	"credits" integer NOT NULL,
	"amount_paid" integer NOT NULL,
	"bundle_type" varchar(50),
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"purchased_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

-- Add foreign keys (only if tenants table exists with correct id type)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenants') THEN
        ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
        ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
        ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
        ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
        ALTER TABLE "api_credits" ADD CONSTRAINT "api_credits_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
        ALTER TABLE "api_call_logs" ADD CONSTRAINT "api_call_logs_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
        ALTER TABLE "credit_purchases" ADD CONSTRAINT "credit_purchases_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
    END IF;
END $$;
