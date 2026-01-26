import { Elysia, t } from 'elysia'
import { db, tenants, users, accounts, sessions, passwordResetTokens, invitations, eq, and } from '@etnostyles/db'

/**
 * Generate a URL-safe slug from company name
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
}

/**
 * Generate unique slug by appending number if needed
 */
async function generateUniqueSlug(baseName: string): Promise<string> {
  const baseSlug = slugify(baseName)
  let slug = baseSlug
  let counter = 1

  while (true) {
    const existing = await db
      .select({ id: tenants.id })
      .from(tenants)
      .where(eq(tenants.slug, slug))
      .limit(1)

    if (existing.length === 0) {
      return slug
    }
    slug = `${baseSlug}-${counter}`
    counter++
  }
}

export const authRoutes = new Elysia({ prefix: '/auth' })
  .post(
    '/register',
    async ({ body, set }) => {
      const { companyName, email, password, name } = body

      // Check if email already exists
      const existingUser = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1)

      if (existingUser.length > 0) {
        set.status = 400
        return {
          error: 'EMAIL_EXISTS',
          message: 'Email already exists',
        }
      }

      // Create tenant
      const slug = await generateUniqueSlug(companyName)
      const [tenant] = await db
        .insert(tenants)
        .values({
          name: companyName,
          slug,
          isActive: true,
        })
        .returning()

      if (!tenant) {
        set.status = 500
        return { error: 'TENANT_CREATE_FAILED', message: 'Failed to create tenant' }
      }

      // Create user with admin role
      const [user] = await db
        .insert(users)
        .values({
          tenantId: tenant.id,
          email,
          name: name || email.split('@')[0],
          role: 'admin',
          isActive: true,
        })
        .returning()

      if (!user) {
        set.status = 500
        return { error: 'USER_CREATE_FAILED', message: 'Failed to create user' }
      }

      // Hash password and create account
      const hashedPassword = await Bun.password.hash(password, {
        algorithm: 'bcrypt',
        cost: 10,
      })

      await db.insert(accounts).values({
        userId: user.id,
        accountId: user.id,
        providerId: 'credential',
        password: hashedPassword,
      })

      // Create session
      const sessionToken = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

      await db.insert(sessions).values({
        userId: user.id,
        token: sessionToken,
        expiresAt,
      })

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
        },
        session: {
          token: sessionToken,
          expiresAt: expiresAt.toISOString(),
        },
      }
    },
    {
      body: t.Object({
        companyName: t.String({ minLength: 2, maxLength: 255 }),
        email: t.String({ format: 'email' }),
        password: t.String({ minLength: 8 }),
        name: t.Optional(t.String({ maxLength: 255 })),
      }),
      detail: {
        tags: ['Auth'],
        summary: 'Register a new company account',
        description: 'Creates a new tenant and admin user',
      },
    }
  )
  .post(
    '/login',
    async ({ body, set }) => {
      const { email, password } = body

      // Find user by email
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1)

      if (!user) {
        set.status = 401
        return {
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        }
      }

      // Get account with password
      const [account] = await db
        .select()
        .from(accounts)
        .where(eq(accounts.userId, user.id))
        .limit(1)

      if (!account?.password) {
        set.status = 401
        return {
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        }
      }

      // Verify password
      const isValid = await Bun.password.verify(password, account.password)
      if (!isValid) {
        set.status = 401
        return {
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        }
      }

      // Check if user is active
      if (!user.isActive) {
        set.status = 403
        return {
          error: 'ACCOUNT_DISABLED',
          message: 'Account is disabled',
        }
      }

      // Get tenant
      const [tenant] = await db
        .select()
        .from(tenants)
        .where(eq(tenants.id, user.tenantId))
        .limit(1)

      if (!tenant) {
        set.status = 500
        return { error: 'TENANT_NOT_FOUND', message: 'Tenant not found' }
      }

      // Create session
      const sessionToken = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

      await db.insert(sessions).values({
        userId: user.id,
        token: sessionToken,
        expiresAt,
      })

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
        },
        session: {
          token: sessionToken,
          expiresAt: expiresAt.toISOString(),
        },
      }
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String({ minLength: 1 }),
      }),
      detail: {
        tags: ['Auth'],
        summary: 'Login to an existing account',
      },
    }
  )
  .post(
    '/logout',
    async ({ headers, set }) => {
      const authHeader = headers['authorization']
      if (!authHeader?.startsWith('Bearer ')) {
        set.status = 401
        return { error: 'UNAUTHORIZED', message: 'No session token provided' }
      }

      const token = authHeader.slice(7)
      await db.delete(sessions).where(eq(sessions.token, token))

      return { success: true }
    },
    {
      detail: {
        tags: ['Auth'],
        summary: 'Logout and invalidate session',
      },
    }
  )
  .get(
    '/me',
    async ({ headers, set }) => {
      const authHeader = headers['authorization']
      if (!authHeader?.startsWith('Bearer ')) {
        set.status = 401
        return { error: 'UNAUTHORIZED', message: 'No session token provided' }
      }

      const token = authHeader.slice(7)

      // Find session
      const [session] = await db
        .select()
        .from(sessions)
        .where(eq(sessions.token, token))
        .limit(1)

      if (!session || session.expiresAt < new Date()) {
        set.status = 401
        return { error: 'SESSION_EXPIRED', message: 'Session expired or invalid' }
      }

      // Get user
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, session.userId))
        .limit(1)

      if (!user) {
        set.status = 401
        return { error: 'USER_NOT_FOUND', message: 'User not found' }
      }

      // Get tenant
      const [tenant] = await db
        .select()
        .from(tenants)
        .where(eq(tenants.id, user.tenantId))
        .limit(1)

      if (!tenant) {
        set.status = 500
        return { error: 'TENANT_NOT_FOUND', message: 'Tenant not found' }
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
        },
      }
    },
    {
      detail: {
        tags: ['Auth'],
        summary: 'Get current user info',
      },
    }
  )
  .post(
    '/forgot-password',
    async ({ body }) => {
      const { email } = body

      // Find user by email
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1)

      // Always return success to prevent email enumeration
      if (!user) {
        return { success: true, message: 'If the email exists, a reset link has been sent' }
      }

      // Generate reset token
      const token = crypto.randomUUID()
      const tokenHash = await Bun.password.hash(token, { algorithm: 'bcrypt', cost: 4 })
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      // Delete any existing reset tokens for this user
      await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id))

      // Create new reset token
      await db.insert(passwordResetTokens).values({
        userId: user.id,
        tokenHash,
        expiresAt,
      })

      // In production, send email here
      // For now, log the token (DEV ONLY)
      console.log(`[DEV] Password reset token for ${email}: ${token}`)

      return {
        success: true,
        message: 'If the email exists, a reset link has been sent',
        // DEV ONLY - remove in production
        ...(process.env['NODE_ENV'] !== 'production' && { devToken: token })
      }
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
      }),
      detail: {
        tags: ['Auth'],
        summary: 'Request password reset email',
      },
    }
  )
  .post(
    '/reset-password',
    async ({ body, set }) => {
      const { token, password } = body

      // Find all non-expired, unused tokens
      const resetTokens = await db
        .select()
        .from(passwordResetTokens)
        .where(and(
          eq(passwordResetTokens.usedAt, null as unknown as Date),
        ))

      // Find matching token
      let matchedToken = null
      for (const rt of resetTokens) {
        if (rt.expiresAt < new Date()) continue
        const isValid = await Bun.password.verify(token, rt.tokenHash)
        if (isValid) {
          matchedToken = rt
          break
        }
      }

      if (!matchedToken) {
        set.status = 400
        return { error: 'INVALID_TOKEN', message: 'Invalid or expired reset token' }
      }

      // Hash new password
      const hashedPassword = await Bun.password.hash(password, {
        algorithm: 'bcrypt',
        cost: 10,
      })

      // Update password in accounts table
      await db
        .update(accounts)
        .set({ password: hashedPassword })
        .where(eq(accounts.userId, matchedToken.userId))

      // Mark token as used
      await db
        .update(passwordResetTokens)
        .set({ usedAt: new Date() })
        .where(eq(passwordResetTokens.id, matchedToken.id))

      // Invalidate all existing sessions
      await db.delete(sessions).where(eq(sessions.userId, matchedToken.userId))

      return { success: true, message: 'Password has been reset successfully' }
    },
    {
      body: t.Object({
        token: t.String({ minLength: 1 }),
        password: t.String({ minLength: 8 }),
      }),
      detail: {
        tags: ['Auth'],
        summary: 'Reset password with token',
      },
    }
  )
  .post(
    '/accept-invitation',
    async ({ body, set }) => {
      const { token, password, name } = body

      // Find all pending invitations
      const pendingInvitations = await db
        .select()
        .from(invitations)
        .where(eq(invitations.acceptedAt, null as unknown as Date))

      // Find matching token
      let matchedInvite = null
      for (const inv of pendingInvitations) {
        if (inv.expiresAt < new Date()) continue
        const isValid = await Bun.password.verify(token, inv.tokenHash)
        if (isValid) {
          matchedInvite = inv
          break
        }
      }

      if (!matchedInvite) {
        set.status = 400
        return { error: 'INVALID_TOKEN', message: 'Invalid or expired invitation' }
      }

      // Check if user already exists with this email
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, matchedInvite.email))
        .limit(1)

      if (existingUser) {
        set.status = 400
        return { error: 'USER_EXISTS', message: 'User already has an account' }
      }

      // Create user with viewer role
      const [user] = await db
        .insert(users)
        .values({
          tenantId: matchedInvite.tenantId,
          email: matchedInvite.email,
          name: name || matchedInvite.email.split('@')[0],
          role: 'viewer',
          isActive: true,
        })
        .returning()

      if (!user) {
        set.status = 500
        return { error: 'USER_CREATE_FAILED', message: 'Failed to create user' }
      }

      // Hash password and create account
      const hashedPassword = await Bun.password.hash(password, {
        algorithm: 'bcrypt',
        cost: 10,
      })

      await db.insert(accounts).values({
        userId: user.id,
        accountId: user.id,
        providerId: 'credential',
        password: hashedPassword,
      })

      // Mark invitation as accepted
      await db
        .update(invitations)
        .set({ acceptedAt: new Date() })
        .where(eq(invitations.id, matchedInvite.id))

      // Get tenant info
      const [tenant] = await db
        .select()
        .from(tenants)
        .where(eq(tenants.id, matchedInvite.tenantId))
        .limit(1)

      // Create session
      const sessionToken = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

      await db.insert(sessions).values({
        userId: user.id,
        token: sessionToken,
        expiresAt,
      })

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        tenant: tenant ? {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
        } : null,
        session: {
          token: sessionToken,
          expiresAt: expiresAt.toISOString(),
        },
      }
    },
    {
      body: t.Object({
        token: t.String({ minLength: 1 }),
        password: t.String({ minLength: 8 }),
        name: t.Optional(t.String({ maxLength: 255 })),
      }),
      detail: {
        tags: ['Auth'],
        summary: 'Accept invitation and create account',
      },
    }
  )
