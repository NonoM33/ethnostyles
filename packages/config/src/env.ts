// Environment variable validation and type-safe access

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

function getEnvNumber(key: string, defaultValue?: number): number {
  const value = process.env[key]
  if (value === undefined) {
    if (defaultValue === undefined) {
      throw new Error(`Missing required environment variable: ${key}`)
    }
    return defaultValue
  }
  const parsed = parseInt(value, 10)
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a number`)
  }
  return parsed
}

function getEnvBoolean(key: string, defaultValue?: boolean): boolean {
  const value = process.env[key]
  if (value === undefined) {
    if (defaultValue === undefined) {
      throw new Error(`Missing required environment variable: ${key}`)
    }
    return defaultValue
  }
  return value.toLowerCase() === 'true' || value === '1'
}

// Lazy-loaded environment configuration
export const env = {
  // Database
  get DATABASE_URL() {
    return getEnv('DATABASE_URL', 'postgresql://dev:dev@localhost:5432/etnostyles')
  },

  // API
  get API_PORT() {
    return getEnvNumber('API_PORT', 3000)
  },
  get API_HOST() {
    return getEnv('API_HOST', 'localhost')
  },

  // Auth
  get BETTER_AUTH_SECRET() {
    return getEnv('BETTER_AUTH_SECRET', 'development-secret-min-32-chars!!')
  },
  get BETTER_AUTH_URL() {
    return getEnv('BETTER_AUTH_URL', 'http://localhost:3000')
  },

  // Email
  get RESEND_API_KEY() {
    return getEnv('RESEND_API_KEY', '')
  },

  // Environment
  get NODE_ENV() {
    return getEnv('NODE_ENV', 'development') as 'development' | 'production' | 'test'
  },
  get isDevelopment() {
    return this.NODE_ENV === 'development'
  },
  get isProduction() {
    return this.NODE_ENV === 'production'
  },
  get isTest() {
    return this.NODE_ENV === 'test'
  },
}
