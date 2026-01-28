import postgres from 'postgres'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('DATABASE_URL not set, skipping migrations')
  process.exit(0)
}

const sql = postgres(databaseUrl, { max: 1 })

async function runMigrations() {
  console.log('Running database migrations...')

  try {
    // Check if we need to run full migrations
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'tenants'
      )
    `
    const needsFullMigration = !result[0].exists

    if (needsFullMigration) {
      console.log('Database is empty, creating base tables...')

      // Create enums
      await sql.unsafe(`CREATE TYPE "public"."role" AS ENUM('admin', 'viewer')`)
      await sql.unsafe(`CREATE TYPE "public"."campaign_status" AS ENUM('draft', 'active', 'archived')`)
      await sql.unsafe(`CREATE TYPE "public"."respondent_status" AS ENUM('in_progress', 'completed', 'abandoned')`)
      await sql.unsafe(`CREATE TYPE "public"."question_type" AS ENUM('binary', 'choice')`)
      await sql.unsafe(`CREATE TYPE "public"."questionnaire_size" AS ENUM('express', 'standard', 'complete')`)
      console.log('Created enums')

      // Create tenants table
      await sql.unsafe(`
        CREATE TABLE "tenants" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "name" varchar(255) NOT NULL,
          "slug" varchar(100) NOT NULL UNIQUE,
          "is_active" boolean DEFAULT true NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        )
      `)
      console.log('Created tenants table')

      // Create users table
      await sql.unsafe(`
        CREATE TABLE "users" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
          "email" varchar(255) NOT NULL,
          "name" varchar(255),
          "role" "role" DEFAULT 'viewer' NOT NULL,
          "is_active" boolean DEFAULT true NOT NULL,
          "email_verified_at" timestamp,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        )
      `)
      console.log('Created users table')

      // Create campaigns table
      await sql.unsafe(`
        CREATE TABLE "campaigns" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
          "name" varchar(255) NOT NULL,
          "description" text,
          "status" "campaign_status" DEFAULT 'draft' NOT NULL,
          "slug" varchar(100) NOT NULL UNIQUE,
          "logo_url" varchar(500),
          "primary_color" varchar(7),
          "questionnaire_size" "questionnaire_size" DEFAULT 'standard',
          "webhook_url" varchar(500),
          "webhook_secret" varchar(64),
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        )
      `)
      console.log('Created campaigns table')

      // Create respondents table
      await sql.unsafe(`
        CREATE TABLE "respondents" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "campaign_id" uuid NOT NULL REFERENCES "campaigns"("id") ON DELETE CASCADE,
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
      `)
      console.log('Created respondents table')

      // Create responses table
      await sql.unsafe(`
        CREATE TABLE "responses" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "respondent_id" uuid NOT NULL REFERENCES "respondents"("id") ON DELETE CASCADE,
          "question_id" integer NOT NULL,
          "answer_index" integer NOT NULL,
          "answered_at" timestamp DEFAULT now() NOT NULL
        )
      `)
      console.log('Created responses table')

      // Create questions table
      await sql.unsafe(`
        CREATE TABLE "questions" (
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
      `)
      console.log('Created questions table')

      // Create sessions table
      await sql.unsafe(`
        CREATE TABLE "sessions" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
          "token" varchar(64) NOT NULL UNIQUE,
          "expires_at" timestamp NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL
        )
      `)
      console.log('Created sessions table')

      console.log('Base tables created successfully!')
    } else {
      console.log('Database exists, running incremental migrations...')

      // Ensure enums exist
      try {
        await sql.unsafe(`CREATE TYPE "public"."respondent_status" AS ENUM('in_progress', 'completed', 'abandoned')`)
      } catch { /* exists */ }
      try {
        await sql.unsafe(`CREATE TYPE "public"."question_type" AS ENUM('binary', 'choice')`)
      } catch { /* exists */ }
      try {
        await sql.unsafe(`CREATE TYPE "public"."questionnaire_size" AS ENUM('express', 'standard', 'complete')`)
      } catch { /* exists */ }

      // Add missing columns
      try {
        await sql`ALTER TABLE "respondents" ADD COLUMN IF NOT EXISTS "secondary_mythe" varchar(50)`
        await sql`ALTER TABLE "respondents" ADD COLUMN IF NOT EXISTS "confidence_score" integer`
        await sql`ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "questionnaire_size" "questionnaire_size" DEFAULT 'standard'`
      } catch { /* ignore */ }

      // Rename old column names if they exist
      try {
        await sql`ALTER TABLE "responses" RENAME COLUMN "question_number" TO "question_id"`
      } catch { /* already renamed */ }
      try {
        await sql`ALTER TABLE "responses" RENAME COLUMN "answer" TO "answer_index"`
      } catch { /* already renamed */ }
    }

    console.log('Migrations completed successfully!')
  } catch (error) {
    console.error('Migration error:', error)
  } finally {
    await sql.end()
  }
}

runMigrations()
