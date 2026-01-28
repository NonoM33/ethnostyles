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
    // Add missing columns to respondents table
    await sql`
      ALTER TABLE "respondents"
      ADD COLUMN IF NOT EXISTS "secondary_mythe" varchar(50)
    `
    console.log('Added secondary_mythe column (if not exists)')

    await sql`
      ALTER TABLE "respondents"
      ADD COLUMN IF NOT EXISTS "confidence_score" integer
    `
    console.log('Added confidence_score column (if not exists)')

    // Add questionnaire_size enum and column to campaigns
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'questionnaire_size') THEN
          CREATE TYPE "public"."questionnaire_size" AS ENUM('express', 'standard', 'complete');
        END IF;
      END$$
    `
    console.log('Created questionnaire_size enum (if not exists)')

    await sql`
      ALTER TABLE "campaigns"
      ADD COLUMN IF NOT EXISTS "questionnaire_size" "questionnaire_size" DEFAULT 'standard'
    `
    console.log('Added questionnaire_size column (if not exists)')

    console.log('Migrations completed successfully!')
  } catch (error) {
    console.error('Migration error:', error)
    // Don't exit with error, let the API try to start anyway
  } finally {
    await sql.end()
  }
}

runMigrations()
