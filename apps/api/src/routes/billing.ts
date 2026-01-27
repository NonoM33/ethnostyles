import { Elysia, t } from 'elysia'
import Stripe from 'stripe'
import { db } from '@etnostyles/db'
import {
  subscriptions,
  paymentMethods,
  invoices,
  usageRecords,
  apiCredits,
  creditPurchases,
  apiCallLogs,
  users,
  campaigns,
  respondents,
  sessions,
  PLANS,
  API_PRICING,
  type PlanId,
} from '@etnostyles/db/schema'
import { eq, and, count, gte, lte, desc, sql } from 'drizzle-orm'

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

// Helper to sync payment methods from Stripe
async function syncPaymentMethods(customerId: string, tenantId: string) {
  const stripePaymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: 'card',
  })

  // Get default payment method
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
  const defaultPmId = typeof customer.invoice_settings?.default_payment_method === 'string'
    ? customer.invoice_settings.default_payment_method
    : customer.invoice_settings?.default_payment_method?.id

  for (const pm of stripePaymentMethods.data) {
    if (pm.card) {
      await db.insert(paymentMethods).values({
        id: pm.id,
        tenantId,
        stripeCustomerId: customerId,
        type: 'card',
        cardBrand: pm.card.brand,
        cardLast4: pm.card.last4,
        cardExpMonth: pm.card.exp_month,
        cardExpYear: pm.card.exp_year,
        isDefault: pm.id === defaultPmId,
      }).onConflictDoUpdate({
        target: paymentMethods.id,
        set: {
          cardBrand: pm.card.brand,
          cardLast4: pm.card.last4,
          cardExpMonth: pm.card.exp_month,
          cardExpYear: pm.card.exp_year,
          isDefault: pm.id === defaultPmId,
          updatedAt: new Date(),
        },
      })
    }
  }
}

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

  // Preview seats change - calculates prorated amount locally
  .post('/preview-seats', async ({ headers, body, set }) => {
    const user = await getCurrentUser(headers['authorization'])
    if (!user) {
      set.status = 401
      return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
    }

    const { seats } = body as { seats: number }

    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.tenantId, user.tenantId),
    })

    if (!subscription || subscription.planId === 'free') {
      set.status = 400
      return { error: 'NO_SUBSCRIPTION', message: 'No active subscription' }
    }

    const plan = PLANS[subscription.planId]
    const currentSeats = subscription.seatsExtra
    const seatsChange = seats - currentSeats

    if (seatsChange === 0) {
      return {
        currentSeats,
        newSeats: seats,
        seatsChange: 0,
        prorationAmount: 0,
        prorationAmountFormatted: '0.00€',
        monthlyChange: 0,
        monthlyChangeFormatted: '0.00€',
        immediateCharge: false,
      }
    }

    // Calculate days remaining in billing period
    const now = new Date()
    const periodEnd = subscription.currentPeriodEnd
    const daysRemaining = Math.max(1, Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    const daysInPeriod = 30 // Approximate

    // Calculate prorated amount (in cents)
    const prorationAmount = Math.round((plan.pricePerSeat * seatsChange * daysRemaining) / daysInPeriod)
    const monthlyChange = plan.pricePerSeat * seatsChange

    return {
      currentSeats,
      newSeats: seats,
      seatsChange,
      prorationAmount, // Can be negative (credit) or positive (charge)
      prorationAmountFormatted: (prorationAmount / 100).toFixed(2) + '€',
      monthlyChange,
      monthlyChangeFormatted: (monthlyChange / 100).toFixed(2) + '€',
      immediateCharge: prorationAmount > 0,
      daysRemaining,
    }
  }, {
    body: t.Object({
      seats: t.Number(),
    }),
    detail: {
      tags: ['Billing'],
      summary: 'Preview seats change',
      security: [{ bearerAuth: [] }],
    },
  })

  // Update seats - modifies subscription with immediate proration
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

    const plan = PLANS[subscription.planId]
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.id)
    const currentSeats = subscription.seatsExtra

    // Find existing seat item
    const seatItem = stripeSubscription.items.data.find(
      (item) => item.price?.metadata?.type === 'seat'
    )

    try {
      if (seats === 0 && seatItem) {
        // Remove seats entirely
        await stripe.subscriptions.update(subscription.id, {
          items: [{ id: seatItem.id, deleted: true }],
          proration_behavior: 'create_prorations',
        })
      } else if (seatItem) {
        // Update existing seat item
        await stripe.subscriptionItems.update(seatItem.id, {
          quantity: seats,
          proration_behavior: seats > currentSeats ? 'always_invoice' : 'create_prorations',
          payment_behavior: seats > currentSeats ? 'error_if_incomplete' : 'allow_incomplete',
        })
      } else if (seats > 0) {
        // Create new seat item - first create a price
        const price = await stripe.prices.create({
          currency: 'eur',
          unit_amount: plan.pricePerSeat,
          recurring: { interval: 'month' },
          product_data: {
            name: 'Places supplementaires',
            metadata: { type: 'seat' },
          },
          metadata: { type: 'seat' },
        })

        // Add to subscription with immediate invoice
        await stripe.subscriptionItems.create({
          subscription: subscription.id,
          price: price.id,
          quantity: seats,
          proration_behavior: 'always_invoice',
          payment_behavior: 'error_if_incomplete',
        })
      }

      // Update local DB
      await db
        .update(subscriptions)
        .set({ seatsExtra: seats, updatedAt: new Date() })
        .where(eq(subscriptions.id, subscription.id))

      return {
        success: true,
        message: seats > currentSeats
          ? 'Places ajoutees et facturees avec succes'
          : 'Places mises a jour avec succes',
      }
    } catch (error: any) {
      // Handle payment failure
      if (error.type === 'StripeCardError' || error.code === 'payment_intent_authentication_failure') {
        set.status = 402
        return {
          error: 'PAYMENT_FAILED',
          message: 'Le paiement a echoue. Veuillez verifier votre moyen de paiement.',
        }
      }
      throw error
    }
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

  // Sync subscription from Stripe (called after checkout success)
  .post('/sync', async ({ headers, set }) => {
    const user = await getCurrentUser(headers['authorization'])
    if (!user) {
      set.status = 401
      return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
    }

    // Find existing subscription to get customer ID
    const existingSub = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.tenantId, user.tenantId),
    })

    // If we have a customer ID, fetch their subscriptions from Stripe
    if (existingSub?.stripeCustomerId) {
      const stripeSubscriptions = await stripe.subscriptions.list({
        customer: existingSub.stripeCustomerId,
        status: 'active',
        limit: 1,
      })

      if (stripeSubscriptions.data.length > 0) {
        const stripeSub = stripeSubscriptions.data[0]
        const planId = (stripeSub.metadata?.planId || 'pro') as PlanId
        const plan = PLANS[planId]

        await db
          .update(subscriptions)
          .set({
            id: stripeSub.id,
            planId,
            status: 'active',
            currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
            cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
            seatsIncluded: plan.limits.teamMembers || 999,
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.tenantId, user.tenantId))

        // Sync payment methods
        await syncPaymentMethods(existingSub.stripeCustomerId, user.tenantId)

        return { subscription: { planId, status: 'active' } }
      }
    }

    // Try to find customer by email and sync
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    })

    if (customers.data.length > 0) {
      const customer = customers.data[0]
      const stripeSubscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'active',
        limit: 1,
      })

      if (stripeSubscriptions.data.length > 0) {
        const stripeSub = stripeSubscriptions.data[0]
        const planId = (stripeSub.metadata?.planId || 'pro') as PlanId
        const plan = PLANS[planId]
        const extraSeats = parseInt(stripeSub.metadata?.extraSeats || '0')

        // Upsert subscription
        await db.insert(subscriptions).values({
          id: stripeSub.id,
          tenantId: user.tenantId,
          stripeCustomerId: customer.id,
          planId,
          status: 'active',
          currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
          cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
          seatsIncluded: plan.limits.teamMembers || 999,
          seatsExtra: extraSeats,
        }).onConflictDoUpdate({
          target: subscriptions.id,
          set: {
            planId,
            status: 'active',
            currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
            cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
            updatedAt: new Date(),
          },
        })

        // Sync payment methods
        await syncPaymentMethods(customer.id, user.tenantId)

        return { subscription: { planId, status: 'active' } }
      }
    }

    return { subscription: null }
  }, {
    detail: {
      tags: ['Billing'],
      summary: 'Sync subscription from Stripe after checkout',
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

      case 'payment_intent.succeeded': {
        // Handle credit purchase
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const { purchaseId } = paymentIntent.metadata || {}

        if (purchaseId) {
          const [purchase] = await db
            .select()
            .from(creditPurchases)
            .where(eq(creditPurchases.id, purchaseId))
            .limit(1)

          if (purchase && purchase.status === 'pending') {
            // Update purchase status
            await db
              .update(creditPurchases)
              .set({ status: 'completed', updatedAt: new Date() })
              .where(eq(creditPurchases.id, purchaseId))

            // Add credits to tenant
            const [existingCredits] = await db
              .select()
              .from(apiCredits)
              .where(eq(apiCredits.tenantId, purchase.tenantId))
              .limit(1)

            if (existingCredits) {
              await db
                .update(apiCredits)
                .set({
                  balance: existingCredits.balance + purchase.credits,
                  totalPurchased: existingCredits.totalPurchased + purchase.credits,
                  updatedAt: new Date(),
                })
                .where(eq(apiCredits.tenantId, purchase.tenantId))
            } else {
              await db.insert(apiCredits).values({
                tenantId: purchase.tenantId,
                balance: purchase.credits,
                weeklyUsed: 0,
                weekStartsAt: new Date(),
                totalPurchased: purchase.credits,
                totalUsed: 0,
              })
            }
          }
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

  // ═══════════════════════════════════════════════════════════════
  // API CREDITS & USAGE
  // ═══════════════════════════════════════════════════════════════

  // Get API credits and usage
  .get('/api-credits', async ({ headers, set }) => {
    const user = await getCurrentUser(headers['authorization'])
    if (!user) {
      set.status = 401
      return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
    }

    // Get or create credits record
    const weekStart = getWeekStart()
    let [credits] = await db
      .select()
      .from(apiCredits)
      .where(eq(apiCredits.tenantId, user.tenantId))
      .limit(1)

    if (!credits) {
      await db.insert(apiCredits).values({
        tenantId: user.tenantId,
        balance: 0,
        weeklyUsed: 0,
        weekStartsAt: weekStart,
        totalPurchased: 0,
        totalUsed: 0,
      })
      credits = {
        id: 'new',
        tenantId: user.tenantId,
        balance: 0,
        weeklyUsed: 0,
        weekStartsAt: weekStart,
        totalPurchased: 0,
        totalUsed: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    } else if (credits.weekStartsAt < weekStart) {
      // Reset weekly usage
      await db
        .update(apiCredits)
        .set({ weeklyUsed: 0, weekStartsAt: weekStart })
        .where(eq(apiCredits.id, credits.id))
      credits = { ...credits, weeklyUsed: 0, weekStartsAt: weekStart }
    }

    // Get plan limits
    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.tenantId, user.tenantId),
    })
    const planId = subscription?.planId || 'free'
    const plan = PLANS[planId]
    const weeklyLimit = plan.limits.apiCallsPerWeek || 0
    const apiEnabled = plan.limits.apiEnabled || false

    // Get recent API calls
    const recentCalls = await db
      .select({
        date: sql<string>`DATE(${apiCallLogs.calledAt})`,
        count: count(),
      })
      .from(apiCallLogs)
      .where(eq(apiCallLogs.tenantId, user.tenantId))
      .groupBy(sql`DATE(${apiCallLogs.calledAt})`)
      .orderBy(desc(sql`DATE(${apiCallLogs.calledAt})`))
      .limit(30)

    return {
      credits: {
        balance: credits.balance,
        weeklyUsed: credits.weeklyUsed,
        weeklyLimit,
        weeklyRemaining: Math.max(0, weeklyLimit - credits.weeklyUsed),
        totalPurchased: credits.totalPurchased,
        totalUsed: credits.totalUsed,
        weekResetsAt: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      apiEnabled,
      planId,
      recentUsage: recentCalls.map(c => ({ date: c.date, count: c.count })),
      pricing: API_PRICING,
    }
  }, {
    detail: {
      tags: ['Billing'],
      summary: 'Get API credits and usage',
      security: [{ bearerAuth: [] }],
    },
  })

  // Purchase API credits
  .post('/purchase-credits', async ({ headers, body, set }) => {
    const user = await getCurrentUser(headers['authorization'])
    if (!user) {
      set.status = 401
      return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
    }
    if (user.role !== 'admin') {
      set.status = 403
      return { error: 'FORBIDDEN', message: 'Admin access required' }
    }

    const { bundle } = body as { bundle: 'small' | 'medium' | 'large' }

    const bundleInfo = {
      small: API_PRICING.bundleSmall,
      medium: API_PRICING.bundleMedium,
      large: API_PRICING.bundleLarge,
    }[bundle]

    if (!bundleInfo) {
      set.status = 400
      return { error: 'INVALID_BUNDLE', message: 'Invalid bundle type' }
    }

    // Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomer(
      user.tenantId,
      user.email,
      user.name || undefined
    )

    // Create purchase record
    const purchaseId = crypto.randomUUID()
    await db.insert(creditPurchases).values({
      id: purchaseId,
      tenantId: user.tenantId,
      credits: bundleInfo.credits,
      amountPaid: bundleInfo.price,
      bundleType: bundle,
      status: 'pending',
    })

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: bundleInfo.price,
      currency: 'eur',
      customer: customerId,
      metadata: {
        purchaseId,
        tenantId: user.tenantId,
        bundle,
        credits: bundleInfo.credits.toString(),
      },
    })

    return {
      clientSecret: paymentIntent.client_secret,
      purchaseId,
      credits: bundleInfo.credits,
      amount: bundleInfo.price,
    }
  }, {
    body: t.Object({
      bundle: t.Union([t.Literal('small'), t.Literal('medium'), t.Literal('large')]),
    }),
    detail: {
      tags: ['Billing'],
      summary: 'Purchase API credits',
      security: [{ bearerAuth: [] }],
    },
  })

  // Get credit purchase history
  .get('/credit-purchases', async ({ headers, set }) => {
    const user = await getCurrentUser(headers['authorization'])
    if (!user) {
      set.status = 401
      return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
    }

    const purchases = await db
      .select()
      .from(creditPurchases)
      .where(eq(creditPurchases.tenantId, user.tenantId))
      .orderBy(desc(creditPurchases.purchasedAt))
      .limit(50)

    return {
      purchases: purchases.map(p => ({
        id: p.id,
        credits: p.credits,
        amountPaid: p.amountPaid,
        bundleType: p.bundleType,
        status: p.status,
        purchasedAt: p.purchasedAt.toISOString(),
      })),
    }
  }, {
    detail: {
      tags: ['Billing'],
      summary: 'Get credit purchase history',
      security: [{ bearerAuth: [] }],
    },
  })

  // Get API call logs
  .get('/api-logs', async ({ headers, query, set }) => {
    const user = await getCurrentUser(headers['authorization'])
    if (!user) {
      set.status = 401
      return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
    }

    const page = query.page || 1
    const limit = Math.min(query.limit || 50, 100)
    const offset = (page - 1) * limit

    const [countResult] = await db
      .select({ count: count() })
      .from(apiCallLogs)
      .where(eq(apiCallLogs.tenantId, user.tenantId))

    const logs = await db
      .select({
        id: apiCallLogs.id,
        endpoint: apiCallLogs.endpoint,
        method: apiCallLogs.method,
        statusCode: apiCallLogs.statusCode,
        responseTimeMs: apiCallLogs.responseTimeMs,
        creditsUsed: apiCallLogs.creditsUsed,
        calledAt: apiCallLogs.calledAt,
      })
      .from(apiCallLogs)
      .where(eq(apiCallLogs.tenantId, user.tenantId))
      .orderBy(desc(apiCallLogs.calledAt))
      .limit(limit)
      .offset(offset)

    return {
      logs: logs.map(l => ({
        ...l,
        calledAt: l.calledAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total: countResult?.count || 0,
        totalPages: Math.ceil((countResult?.count || 0) / limit),
      },
    }
  }, {
    query: t.Object({
      page: t.Optional(t.Number({ minimum: 1 })),
      limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
    }),
    detail: {
      tags: ['Billing'],
      summary: 'Get API call logs',
      security: [{ bearerAuth: [] }],
    },
  })

// Simple API usage endpoint for frontend
  .get('/api-usage', async ({ headers, set }) => {
    const user = await getCurrentUser(headers['authorization'])
    if (!user) {
      set.status = 401
      return { error: 'UNAUTHORIZED', message: 'Not authenticated' }
    }

    // Get or create credits record
    const weekStart = getWeekStart()
    let [credits] = await db
      .select()
      .from(apiCredits)
      .where(eq(apiCredits.tenantId, user.tenantId))
      .limit(1)

    if (!credits) {
      await db.insert(apiCredits).values({
        tenantId: user.tenantId,
        balance: 0,
        weeklyUsed: 0,
        weekStartsAt: weekStart,
        totalPurchased: 0,
        totalUsed: 0,
      })
      credits = {
        id: 'new',
        tenantId: user.tenantId,
        balance: 0,
        weeklyUsed: 0,
        weekStartsAt: weekStart,
        totalPurchased: 0,
        totalUsed: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    } else if (credits.weekStartsAt < weekStart) {
      await db
        .update(apiCredits)
        .set({ weeklyUsed: 0, weekStartsAt: weekStart })
        .where(eq(apiCredits.id, credits.id))
      credits = { ...credits, weeklyUsed: 0, weekStartsAt: weekStart }
    }

    // Get plan limits
    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.tenantId, user.tenantId),
    })
    const planId = subscription?.planId || 'free'
    const plan = PLANS[planId]
    const weeklyLimit = plan.limits.apiCallsPerWeek || 0
    const apiEnabled = plan.limits.apiEnabled || false

    // Count recent calls
    const [countResult] = await db
      .select({ count: count() })
      .from(apiCallLogs)
      .where(eq(apiCallLogs.tenantId, user.tenantId))

    return {
      credits: {
        balance: credits.balance,
        weeklyUsed: credits.weeklyUsed,
        weeklyLimit,
        weeklyRemaining: Math.max(0, weeklyLimit - credits.weeklyUsed),
        totalPurchased: credits.totalPurchased,
        totalUsed: credits.totalUsed,
        weekResetsAt: weekStart.getTime() + 7 * 24 * 60 * 60 * 1000,
      },
      apiEnabled,
      recentCallsCount: countResult?.count || 0,
    }
  }, {
    detail: {
      tags: ['Billing'],
      summary: 'Get API usage (simplified)',
      security: [{ bearerAuth: [] }],
    },
  })

// Helper function to get week start
function getWeekStart(): Date {
  const now = new Date()
  const day = now.getUTCDay()
  const diff = now.getUTCDate() - day + (day === 0 ? -6 : 1)
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), diff, 0, 0, 0, 0))
}
