import { Elysia, t } from 'elysia'
import { db, tenants, users, accounts, sessions, invitations, eq, and } from '@etnostyles/db'

/**
 * Get current user from session token
 */
async function getCurrentUser(authHeader: string | undefined) {
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.slice(7)
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1)

  if (!session || session.expiresAt < new Date()) {
    return null
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1)

  return user
}

export const teamRoutes = new Elysia({ prefix: '/team' })
  .get(
    '/',
    async ({ headers, set }) => {
      const user = await getCurrentUser(headers['authorization'])
      if (!user) {
        set.status = 401
        return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
      }

      // Get all team members
      const members = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          isActive: users.isActive,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.tenantId, user.tenantId))

      // Get pending invitations
      const pendingInvitations = await db
        .select({
          id: invitations.id,
          email: invitations.email,
          createdAt: invitations.createdAt,
          expiresAt: invitations.expiresAt,
        })
        .from(invitations)
        .where(and(
          eq(invitations.tenantId, user.tenantId),
          eq(invitations.acceptedAt, null as unknown as Date)
        ))

      return { members, pendingInvitations }
    },
    {
      detail: {
        tags: ['Team'],
        summary: 'List team members and pending invitations',
      },
    }
  )
  .post(
    '/invite',
    async ({ headers, body, set }) => {
      const user = await getCurrentUser(headers['authorization'])
      if (!user) {
        set.status = 401
        return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
      }

      if (user.role !== 'admin') {
        set.status = 403
        return { error: 'FORBIDDEN', message: 'Only admins can invite users' }
      }

      const { email } = body

      // Check if user already exists in this tenant
      const [existingUser] = await db
        .select()
        .from(users)
        .where(and(
          eq(users.tenantId, user.tenantId),
          eq(users.email, email)
        ))
        .limit(1)

      if (existingUser) {
        set.status = 400
        return { error: 'USER_EXISTS', message: 'User already in team' }
      }

      // Check if invitation already pending
      const [existingInvite] = await db
        .select()
        .from(invitations)
        .where(and(
          eq(invitations.tenantId, user.tenantId),
          eq(invitations.email, email),
          eq(invitations.acceptedAt, null as unknown as Date)
        ))
        .limit(1)

      if (existingInvite) {
        set.status = 400
        return { error: 'INVITATION_PENDING', message: 'Invitation already sent' }
      }

      // Generate invitation token
      const token = crypto.randomUUID()
      const tokenHash = await Bun.password.hash(token, { algorithm: 'bcrypt', cost: 4 })
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

      // Create invitation
      const [invitation] = await db
        .insert(invitations)
        .values({
          tenantId: user.tenantId,
          email,
          invitedBy: user.id,
          tokenHash,
          expiresAt,
        })
        .returning()

      if (!invitation) {
        set.status = 500
        return { error: 'INVITATION_FAILED', message: 'Failed to create invitation' }
      }

      // In production, send email here
      console.log(`[DEV] Invitation token for ${email}: ${token}`)

      return {
        success: true,
        invitation: {
          id: invitation.id,
          email: invitation.email,
          expiresAt: invitation.expiresAt.toISOString(),
        },
        // DEV ONLY
        ...(process.env['NODE_ENV'] !== 'production' && { devToken: token })
      }
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
      }),
      detail: {
        tags: ['Team'],
        summary: 'Invite a viewer to the team',
      },
    }
  )
  .delete(
    '/invite/:id',
    async ({ headers, params, set }) => {
      const user = await getCurrentUser(headers['authorization'])
      if (!user) {
        set.status = 401
        return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
      }

      if (user.role !== 'admin') {
        set.status = 403
        return { error: 'FORBIDDEN', message: 'Only admins can cancel invitations' }
      }

      await db
        .delete(invitations)
        .where(and(
          eq(invitations.id, params.id),
          eq(invitations.tenantId, user.tenantId)
        ))

      return { success: true }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['Team'],
        summary: 'Cancel a pending invitation',
      },
    }
  )
  .delete(
    '/members/:id',
    async ({ headers, params, set }) => {
      const user = await getCurrentUser(headers['authorization'])
      if (!user) {
        set.status = 401
        return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
      }

      if (user.role !== 'admin') {
        set.status = 403
        return { error: 'FORBIDDEN', message: 'Only admins can revoke access' }
      }

      // Cannot revoke own access
      if (params.id === user.id) {
        set.status = 400
        return { error: 'CANNOT_REVOKE_SELF', message: 'Cannot revoke your own access' }
      }

      // Check member belongs to same tenant
      const [member] = await db
        .select()
        .from(users)
        .where(and(
          eq(users.id, params.id),
          eq(users.tenantId, user.tenantId)
        ))
        .limit(1)

      if (!member) {
        set.status = 404
        return { error: 'MEMBER_NOT_FOUND', message: 'Member not found' }
      }

      // Cannot revoke another admin
      if (member.role === 'admin') {
        set.status = 403
        return { error: 'CANNOT_REVOKE_ADMIN', message: 'Cannot revoke admin access' }
      }

      // Deactivate user
      await db
        .update(users)
        .set({ isActive: false })
        .where(eq(users.id, params.id))

      // Invalidate all sessions
      await db
        .delete(sessions)
        .where(eq(sessions.userId, params.id))

      return { success: true, message: 'Access revoked' }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['Team'],
        summary: 'Revoke a team member access',
      },
    }
  )
  .post(
    '/members/:id/reactivate',
    async ({ headers, params, set }) => {
      const user = await getCurrentUser(headers['authorization'])
      if (!user) {
        set.status = 401
        return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
      }

      if (user.role !== 'admin') {
        set.status = 403
        return { error: 'FORBIDDEN', message: 'Only admins can reactivate members' }
      }

      // Check member belongs to same tenant
      const [member] = await db
        .select()
        .from(users)
        .where(and(
          eq(users.id, params.id),
          eq(users.tenantId, user.tenantId)
        ))
        .limit(1)

      if (!member) {
        set.status = 404
        return { error: 'MEMBER_NOT_FOUND', message: 'Member not found' }
      }

      // Reactivate user
      await db
        .update(users)
        .set({ isActive: true })
        .where(eq(users.id, params.id))

      return { success: true, message: 'Access restored' }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['Team'],
        summary: 'Reactivate a deactivated team member',
      },
    }
  )
