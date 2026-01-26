ALTER TYPE "public"."role" ADD VALUE 'manager' BEFORE 'viewer';--> statement-breakpoint
CREATE TABLE "target_cultures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"explorateur_target" integer DEFAULT 0,
	"gardien_target" integer DEFAULT 0,
	"createur_target" integer DEFAULT 0,
	"sage_target" integer DEFAULT 0,
	"heros_target" integer DEFAULT 0,
	"rebelle_target" integer DEFAULT 0,
	"magicien_target" integer DEFAULT 0,
	"innocent_target" integer DEFAULT 0,
	"is_active" varchar(10) DEFAULT 'true'
);
--> statement-breakpoint
CREATE TABLE "team_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"invited_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "export_schedule" varchar(20);--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "export_format" varchar(10);--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "campaign_type" varchar(20) DEFAULT 'other';--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "team_name" varchar(255);--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "department" varchar(255);--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "manager_id" uuid;--> statement-breakpoint
ALTER TABLE "target_cultures" ADD CONSTRAINT "target_cultures_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_invitations" ADD CONSTRAINT "team_invitations_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;