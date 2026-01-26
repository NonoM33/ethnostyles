ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "description" text;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "logo_url" varchar(500);--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "domain" varchar(255);--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "primary_color" varchar(7) DEFAULT '#4F46E5';
