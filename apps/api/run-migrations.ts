import postgres from 'postgres'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('DATABASE_URL not set, skipping migrations')
  process.exit(0)
}

const sql = postgres(databaseUrl)

async function runMigrations() {
  console.log('Running database migrations...')

  try {
    // Create enums if they don't exist
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'respondent_status') THEN
          CREATE TYPE "public"."respondent_status" AS ENUM('in_progress', 'completed', 'abandoned');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'question_type') THEN
          CREATE TYPE "public"."question_type" AS ENUM('binary', 'choice');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'questionnaire_size') THEN
          CREATE TYPE "public"."questionnaire_size" AS ENUM('express', 'standard', 'complete');
        END IF;
      END$$
    `
    console.log('Created enums (if not exists)')

    // Create respondents table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS "respondents" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "campaign_id" uuid NOT NULL,
        "email" varchar(255) NOT NULL,
        "status" "respondent_status" DEFAULT 'in_progress' NOT NULL,
        "current_question" integer DEFAULT 1 NOT NULL,
        "total_questions" integer DEFAULT 30 NOT NULL,
        "consent_given" boolean DEFAULT false NOT NULL,
        "consent_at" timestamp,
        "passeport_code" varchar(14) UNIQUE,
        "primary_mythe" varchar(50),
        "secondary_mythe" varchar(50),
        "confidence_score" integer,
        "profile_data" text,
        "started_at" timestamp DEFAULT now() NOT NULL,
        "completed_at" timestamp,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      )
    `
    console.log('Created respondents table (if not exists)')

    // Create responses table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS "responses" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "respondent_id" uuid NOT NULL,
        "question_id" integer NOT NULL,
        "answer_index" integer NOT NULL,
        "answered_at" timestamp DEFAULT now() NOT NULL
      )
    `
    console.log('Created responses table (if not exists)')

    // Rename old column names if they exist (backwards compatibility)
    try {
      await sql`ALTER TABLE "responses" RENAME COLUMN "question_number" TO "question_id"`
      console.log('Renamed question_number to question_id')
    } catch { /* column may not exist or already renamed */ }
    try {
      await sql`ALTER TABLE "responses" RENAME COLUMN "answer" TO "answer_index"`
      console.log('Renamed answer to answer_index')
    } catch { /* column may not exist or already renamed */ }

    // Create questions table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS "questions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "number" integer NOT NULL UNIQUE,
        "text" text NOT NULL,
        "type" "question_type" DEFAULT 'choice' NOT NULL,
        "round" integer,
        "options" jsonb NOT NULL,
        "category" varchar(50),
        "weight" integer DEFAULT 1,
        "is_active" boolean DEFAULT true NOT NULL
      )
    `
    console.log('Created questions table (if not exists)')

    // Add missing columns to existing tables
    await sql`
      ALTER TABLE "respondents"
      ADD COLUMN IF NOT EXISTS "secondary_mythe" varchar(50)
    `
    await sql`
      ALTER TABLE "respondents"
      ADD COLUMN IF NOT EXISTS "confidence_score" integer
    `
    console.log('Added missing columns to respondents')

    await sql`
      ALTER TABLE "campaigns"
      ADD COLUMN IF NOT EXISTS "questionnaire_size" "questionnaire_size" DEFAULT 'standard'
    `
    console.log('Added questionnaire_size column to campaigns')

    // Add foreign keys if they don't exist (ignore errors if already exists)
    try {
      await sql`
        ALTER TABLE "respondents"
        ADD CONSTRAINT "respondents_campaign_id_fk"
        FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE
      `
    } catch { /* constraint may already exist */ }

    try {
      await sql`
        ALTER TABLE "responses"
        ADD CONSTRAINT "responses_respondent_id_fk"
        FOREIGN KEY ("respondent_id") REFERENCES "respondents"("id") ON DELETE CASCADE
      `
    } catch { /* constraint may already exist */ }

    console.log('Migrations completed successfully!')
  } catch (error) {
    console.error('Migration error:', error)
    // Don't exit with error, let the API try to start anyway
  } finally {
    await sql.end()
  }
}

runMigrations()
