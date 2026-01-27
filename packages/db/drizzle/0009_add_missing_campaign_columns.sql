-- Add missing questionnaire_size column and enum to campaigns table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'questionnaire_size') THEN
        CREATE TYPE "public"."questionnaire_size" AS ENUM('express', 'standard', 'complete');
    END IF;
END$$;
--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "questionnaire_size" "questionnaire_size" DEFAULT 'standard';
