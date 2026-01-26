import { Elysia, t } from 'elysia'
import Stripe from 'stripe'
import { db } from '@etnostyles/db'
import {
  subscriptions,
  paymentMethods,
  invoices,
  usageRecords,
  users,
  campaigns,
  respondents,
  sessions,
  PLANS,
  type PlanId,
} from '@etnostyles/db/schema'
import { eq, and, count, gte, lte } from 'drizzle-orm'

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

const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'] || '', {
  apiVersion: '2025-01-27.acacia',
})

const STRIPE_WEBHOOK_SECRET = process.env['STRIPE_WEBHOOK_SECRET'] || ''

// Helper to get or create Stripe customer
async function getOrCreateStripeCustomer(tenantId: string, email: string, name?: string) {
  // Check if customer already exists
  const existingSub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.tenantId, tenantId),
  })

  if (existingSub?.stripeCustomerId) {
    return existingSub.stripeCustomerId
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { tenantId },
  })

  return customer.id
}

// Helper to calculate usage
async function calculateUsage(tenantId: string) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  // Count campaigns
  const [campaignCount] = await db
    .select({ count: count() })
    .from(campaigns)
    .where(and(eq(campaigns.tenantId, tenantId), eq(campaigns.status, 'active')))

  // Count responses this month
  const [responseCount] = await db
    .select({ count: count() })
    .from(respondents)
    .innerJoin(campaigns, eq(respondents.campaignId, campaigns.id))
    .where(
      and(
        eq(campaigns.tenantId, tenantId),
        gte(respondents.createdAt, startOfMonth),
        lte(respondents.createdAt, endOfMonth)
      )
    )

  // Count team members
  const [memberCount] = await db
    .select({ count: count() })
    .from(users)
    .where(and(eq(users.tenantId, tenantId), eq(users.isActive, true)))

  return {
    campaigns: campaignCount?.count || 0,
    responses: responseCount?.count || 0,
    teamMembers: memberCount?.count || 0,
  }
}

export const billingRoutes = new Elysia({ prefix: '/billing' })
  // Get subscription and usage
  .get('/subscription', async ({ headers, set }) => {
    const user = await getCurrentUser(headers['authorization'])
    if (!user) {
      set.status = 401
      return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
    }

    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.tenantId, user.tenantId),
    })

    const usage = await calculateUsage(user.tenantId)
    const plan = PLANS[subscription?.planId || 'free']

    return {
      subscription: subscription
        ? {
            id: subscription.id,
            planId: subscription.planId,
            planName: plan.name,
            status: subscription.status,
            currentPeriodStart: subscription.currentPeriodStart.toISOString(),
            currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
            seats: {
              included: subscription.seatsIncluded,
              used: usage.teamMembers,
              extra: subscription.seatsExtra,
            },
            pricePerSeat: plan.pricePerSeat / 100,
            basePrice: plan.price / 100,
          }
        : null,
      usage: {
        campaigns: { used: usage.campaigns, limit: plan.limits.campaigns },
        responses: { used: usage.responses, limit: plan.limits.responses },
        teamMembers: { used: usage.teamMembers, limit: plan.limits.teamMembers },
      },
    }
  }, {
    detail: {
      tags: ['Billing'],
      summary: 'Get subscription and usage',
      security: [{ bearerAuth: [] }],
    },
  })

  // Get invoices
  .get('/invoices', async ({ headers, set }) => {
    const user = await getCurrentUser(headers['authorization'])
    if (!user) {
      set.status = 401
      return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
    }

    const tenantInvoices = await db.query.invoices.findMany({
      where: eq(invoices.tenantId, user.tenantId),
      orderBy: (invoices, { desc }) => [desc(invoices.createdAt)],
      limit: 24,
    })

    return {
      invoices: tenantInvoices.map((inv) => ({
        id: inv.id,
        number: inv.number,
        status: inv.status,
        amount: inv.amount,
        currency: inv.currency,
        periodStart: inv.periodStart?.toISOString(),
        periodEnd: inv.periodEnd?.toISOString(),
        paidAt: inv.paidAt?.toISOString(),
        invoicePdf: inv.invoicePdf,
        hostedInvoiceUrl: inv.hostedInvoiceUrl,
        createdAt: inv.createdAt.toISOString(),
      })),
    }
  }, {
    detail: {
      tags: ['Billing'],
      summary: 'Get invoice history',
      security: [{ bearerAuth: [] }],
    },
  })

  // Get payment methods
  .get('/payment-methods', async ({ headers, set }) => {
    const user = await getCurrentUser(headers['authorization'])
    if (!user) {
      set.status = 401
      return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
    }

    const methods = await db.query.paymentMethods.findMany({
      where: eq(paymentMethods.tenantId, user.tenantId),
    })

    return {
      paymentMethods: methods.map((pm) => ({
        id: pm.id,
        type: pm.type,
        card: {
          brand: pm.cardBrand,
          last4: pm.cardLast4,
          expMonth: pm.cardExpMonth,
          expYear: pm.cardExpYear,
        },
        isDefault: pm.isDefault,
      })),
    }
  }, {
    detail: {
      tags: ['Billing'],
      summary: 'Get payment methods',
      security: [{ bearerAuth: [] }],
    },
  })

  // Create checkout session
  .post('/create-checkout-session', async ({ headers, body, set }) => {
    const user = await getCurrentUser(headers['authorization'])
    if (!user) {
      set.status = 401
      return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
    }
    if (user.role !== 'admin') {
      set.status = 403
      return { error: 'FORBIDDEN', message: 'Admin access required' }
    }

    const { planId, seats = 0 } = body as { planId: PlanId; seats?: number }
    const plan = PLANS[planId]
    if (!plan || planId === 'free') {
      set.status = 400
      return { error: 'INVALID_PLAN', message: 'Invalid plan' }
    }

    const customerId = await getOrCreateStripeCustomer(
      user.tenantId,
      user.email,
      user.name || undefined
    )

    // Calculate price based on plan and extra seats
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `${plan.name} Plan`,
            description: plan.features.join(', '),
          },
          unit_amount: plan.price,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      },
    ]

    if (seats > 0 && plan.pricePerSeat > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Places supplementaires',
            description: `${seats} place(s) supplementaire(s)`,
          },
          unit_amount: plan.pricePerSeat,
          recurring: { interval: 'month' },
        },
        quantity: seats,
      })
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${process.env['WEB_URL']}/billing?success=true`,
      cancel_url: `${process.env['WEB_URL']}/billing?canceled=true`,
      metadata: {
        tenantId: user.tenantId,
        planId,
        extraSeats: seats.toString(),
      },
      subscription_data: {
        metadata: {
          tenantId: user.tenantId,
          planId,
          extraSeats: seats.toString(),
        },
      },
    })

    return { url: checkoutSession.url }
  }, {
    body: t.Object({
      planId: t.String(),
      seats: t.Optional(t.Number()),
    }),
    detail: {
      tags: ['Billing'],
      summary: 'Create Stripe checkout session',
      security: [{ bearerAuth: [] }],
    },
  })

  // Create portal session
  .post('/create-portal-session', async ({ headers, set }) => {
    const user = await getCurrentUser(headers['authorization'])
    if (!user) {
      set.status = 401
      return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
    }
    if (user.role !== 'admin') {
      set.status = 403
      return { error: 'FORBIDDEN', message: 'Admin access required' }
    }

    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.tenantId, user.tenantId),
    })

    if (!subscription?.stripeCustomerId) {
      throw new Error('No subscription found')
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${process.env['WEB_URL']}/billing`,
    })

    return { url: portalSession.url }
  }, {
    detail: {
      tags: ['Billing'],
      summary: 'Create Stripe customer portal session',
      security: [{ bearerAuth: [] }],
    },
  })

  // Update seats
  .post('/update-seats', async ({ headers, body, set }) => {
    const user = await getCurrentUser(headers['authorization'])
    if (!user) {
      set.status = 401
      return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
    }
    if (user.role !== 'admin') {
      set.status = 403
      return { error: 'FORBIDDEN', message: 'Admin access required' }
    }

    const { seats } = body as { seats: number }

    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.tenantId, user.tenantId),
    })

    if (!subscription || subscription.planId === 'free') {
      throw new Error('No active subscription')
    }

    // Update in Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.id)
    const plan = PLANS[subscription.planId]

    // Find or create seat item
    const seatItem = stripeSubscription.items.data.find(
      (item) => item.price?.metadata?.type === 'seat'
    )

    if (seats > 0) {
      if (seatItem) {
        await stripe.subscriptionItems.update(seatItem.id, { quantity: seats })
      } else {
        await stripe.subscriptionItems.create({
          subscription: subscription.id,
          price_data: {
            currency: 'eur',
            product_data: { name: 'Places supplementaires' },
            unit_amount: plan.pricePerSeat,
            recurring: { interval: 'month' },
            metadata: { type: 'seat' },
          },
          quantity: seats,
        })
      }
    } else if (seatItem) {
      await stripe.subscriptionItems.del(seatItem.id)
    }

    // Update local DB
    await db
      .update(subscriptions)
      .set({ seatsExtra: seats, updatedAt: new Date() })
      .where(eq(subscriptions.id, subscription.id))

    return { success: true }
  }, {
    body: t.Object({
      seats: t.Number(),
    }),
    detail: {
      tags: ['Billing'],
      summary: 'Update extra seats',
      security: [{ bearerAuth: [] }],
    },
  })

  // Cancel subscription
  .post('/cancel', async ({ headers, body, set }) => {
    const user = await getCurrentUser(headers['authorization'])
    if (!user) {
      set.status = 401
      return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
    }
    if (user.role !== 'admin') {
      set.status = 403
      return { error: 'FORBIDDEN', message: 'Admin access required' }
    }

    const { cancelAtPeriodEnd = true } = body as { cancelAtPeriodEnd?: boolean }

    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.tenantId, user.tenantId),
    })

    if (!subscription || subscription.planId === 'free') {
      throw new Error('No active subscription')
    }

    await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: cancelAtPeriodEnd,
    })

    await db
      .update(subscriptions)
      .set({
        cancelAtPeriodEnd,
        canceledAt: cancelAtPeriodEnd ? null : new Date(),
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, subscription.id))

    return { success: true }
  }, {
    body: t.Object({
      cancelAtPeriodEnd: t.Optional(t.Boolean()),
    }),
    detail: {
      tags: ['Billing'],
      summary: 'Cancel subscription',
      security: [{ bearerAuth: [] }],
    },
  })

  // Reactivate subscription
  .post('/reactivate', async ({ headers, set }) => {
    const user = await getCurrentUser(headers['authorization'])
    if (!user) {
      set.status = 401
      return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
    }
    if (user.role !== 'admin') {
      set.status = 403
      return { error: 'FORBIDDEN', message: 'Admin access required' }
    }

    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.tenantId, user.tenantId),
    })

    if (!subscription) {
      throw new Error('No subscription found')
    }

    await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: false,
    })

    await db
      .update(subscriptions)
      .set({
        cancelAtPeriodEnd: false,
        canceledAt: null,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, subscription.id))

    return { success: true }
  }, {
    detail: {
      tags: ['Billing'],
      summary: 'Reactivate canceled subscription',
      security: [{ bearerAuth: [] }],
    },
  })

  // Stripe webhook handler
  .post('/webhook', async ({ request, headers }) => {
    const signature = headers['stripe-signature']
    if (!signature) throw new Error('Missing stripe-signature header')

    const body = await request.text()

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      throw new Error('Invalid signature')
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const { tenantId, planId, extraSeats } = session.metadata || {}

        if (tenantId && planId && session.subscription) {
          const stripeSubscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )

          const plan = PLANS[planId as PlanId]

          await db.insert(subscriptions).values({
            id: stripeSubscription.id,
            tenantId,
            stripeCustomerId: session.customer as string,
            planId: planId as PlanId,
            status: 'active',
            currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            seatsIncluded: plan.limits.teamMembers || 999,
            seatsExtra: parseInt(extraSeats || '0'),
          }).onConflictDoUpdate({
            target: subscriptions.id,
            set: {
              planId: planId as PlanId,
              status: 'active',
              currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
              currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
              updatedAt: new Date(),
            },
          })
        }
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const tenantId = invoice.subscription_details?.metadata?.tenantId

        if (tenantId) {
          await db.insert(invoices).values({
            id: invoice.id,
            tenantId,
            subscriptionId: invoice.subscription as string,
            number: invoice.number,
            status: 'paid',
            amount: invoice.amount_paid,
            currency: invoice.currency,
            periodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
            periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
            paidAt: new Date(),
            invoicePdf: invoice.invoice_pdf,
            hostedInvoiceUrl: invoice.hosted_invoice_url,
          }).onConflictDoUpdate({
            target: invoices.id,
            set: {
              status: 'paid',
              paidAt: new Date(),
              invoicePdf: invoice.invoice_pdf,
              hostedInvoiceUrl: invoice.hosted_invoice_url,
              updatedAt: new Date(),
            },
          })
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const tenantId = subscription.metadata?.tenantId

        if (tenantId) {
          await db
            .update(subscriptions)
            .set({
              status: subscription.status as any,
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
              canceledAt: subscription.canceled_at
                ? new Date(subscription.canceled_at * 1000)
                : null,
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.id, subscription.id))
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        await db
          .update(subscriptions)
          .set({
            status: 'canceled',
            canceledAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.id, subscription.id))
        break
      }

      case 'payment_method.attached': {
        const paymentMethod = event.data.object as Stripe.PaymentMethod
        const customerId = paymentMethod.customer as string

        // Find tenant by customer ID
        const subscription = await db.query.subscriptions.findFirst({
          where: eq(subscriptions.stripeCustomerId, customerId),
        })

        if (subscription && paymentMethod.card) {
          await db.insert(paymentMethods).values({
            id: paymentMethod.id,
            tenantId: subscription.tenantId,
            stripeCustomerId: customerId,
            type: 'card',
            cardBrand: paymentMethod.card.brand,
            cardLast4: paymentMethod.card.last4,
            cardExpMonth: paymentMethod.card.exp_month,
            cardExpYear: paymentMethod.card.exp_year,
            isDefault: false,
          }).onConflictDoNothing()
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return { received: true }
  }, {
    detail: {
      tags: ['Billing'],
      summary: 'Stripe webhook endpoint',
    },
  })
