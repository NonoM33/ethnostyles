-- Add missing columns to respondents table
ALTER TABLE "respondents" ADD COLUMN IF NOT EXISTS "secondary_mythe" varchar(50);
ALTER TABLE "respondents" ADD COLUMN IF NOT EXISTS "confidence_score" integer;
