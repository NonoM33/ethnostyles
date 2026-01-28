import postgres from 'postgres'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('DATABASE_URL not set, skipping migrations')
  process.exit(0)
}

const sql = postgres(databaseUrl, { max: 1 })

async function runMigrations() {
  console.log('Running database migrations...')

  try {
    // Check if we need to run full migrations (check if tenants table exists)
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'tenants'
      )
    `
    const needsFullMigration = !result[0].exists

    if (needsFullMigration) {
      console.log('Database is empty, running full migrations from SQL files...')

      // Get migration files directory
      const migrationsDir = '/app/packages/db/drizzle'
      const files = readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort()

      for (const file of files) {
        console.log(`Running migration: ${file}`)
        const filePath = join(migrationsDir, file)
        const content = readFileSync(filePath, 'utf-8')

        // Split by statement breakpoint and execute each statement
        const statements = content
          .split('--> statement-breakpoint')
          .map(s => s.trim())
          .filter(s => s.length > 0)

        for (const statement of statements) {
          try {
            await sql.unsafe(statement)
          } catch (err: unknown) {
            const error = err as { message?: string }
            // Ignore "already exists" errors
            if (!error.message?.includes('already exists')) {
              console.warn(`  Warning in ${file}:`, error.message?.substring(0, 100))
            }
          }
        }
      }
      console.log('Full migrations completed!')
    } else {
      console.log('Database exists, running incremental migrations...')
    }

    // Always run these incremental fixes
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

    // Add missing columns
    try {
      await sql`ALTER TABLE "respondents" ADD COLUMN IF NOT EXISTS "secondary_mythe" varchar(50)`
      await sql`ALTER TABLE "respondents" ADD COLUMN IF NOT EXISTS "confidence_score" integer`
      await sql`ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "questionnaire_size" "questionnaire_size" DEFAULT 'standard'`
    } catch { /* ignore */ }

    // Rename old column names if they exist (backwards compatibility)
    try {
      await sql`ALTER TABLE "responses" RENAME COLUMN "question_number" TO "question_id"`
    } catch { /* column may not exist or already renamed */ }
    try {
      await sql`ALTER TABLE "responses" RENAME COLUMN "answer" TO "answer_index"`
    } catch { /* column may not exist or already renamed */ }

    console.log('Migrations completed successfully!')
  } catch (error) {
    console.error('Migration error:', error)
  } finally {
    await sql.end()
  }
}

runMigrations()
