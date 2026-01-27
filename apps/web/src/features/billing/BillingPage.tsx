import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useSubscription,
  useInvoices,
  usePaymentMethods,
  useCreateCheckoutSession,
  useCreatePortalSession,
  useUpdateSeats,
  useCancelSubscription,
  useReactivateSubscription,
} from '../../lib/api'
import { useAuth } from '../../lib/auth'

const PLANS = [
  {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    priceLabel: '0€',
    description: 'Pour decouvrir Ethnostyles',
    features: [
      '1 campagne active',
      '50 reponses/mois',
      '2 membres',
      'Rapports basiques',
    ],
    limits: {
      campaigns: 1,
      responses: 50,
      members: 2,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49,
    priceLabel: '49€',
    description: 'Pour les equipes en croissance',
    popular: true,
    features: [
      'Campagnes illimitees',
      '1000 reponses/mois',
      '10 membres inclus',
      '+9€/membre supplementaire',
      'Analytics avances',
      'Export CSV/PDF',
      'Support prioritaire',
    ],
    limits: {
      campaigns: null,
      responses: 1000,
      members: 10,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    priceLabel: '199€',
    description: 'Pour les grandes organisations',
    features: [
      'Tout illimite',
      'SSO / SAML',
      'API access',
      'SLA garanti',
      'Account manager dedie',
      'Formation personnalisee',
    ],
    limits: {
      campaigns: null,
      responses: null,
      members: null,
    },
  },
]

function PlanCard({
  plan,
  isCurrentPlan,
  onSelect,
  isLoading,
}: {
  plan: typeof PLANS[0]
  isCurrentPlan: boolean
  onSelect: () => void
  isLoading: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-white rounded-2xl border-2 p-6 ${
        plan.popular
          ? 'border-indigo-500 shadow-lg shadow-indigo-100'
          : isCurrentPlan
          ? 'border-green-500'
          : 'border-gray-200'
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Populaire
          </span>
        </div>
      )}
      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Actuel
          </span>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
        <p className="text-sm text-gray-500">{plan.description}</p>
      </div>

      <div className="mb-6">
        <span className="text-4xl font-bold text-gray-900">{plan.priceLabel}</span>
        <span className="text-gray-500">/mois</span>
      </div>

      <ul className="space-y-3 mb-6">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        disabled={isCurrentPlan || isLoading}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          isCurrentPlan
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : plan.popular
            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Chargement...
          </span>
        ) : isCurrentPlan ? (
          'Plan actuel'
        ) : (
          'Choisir ce plan'
        )}
      </button>
    </motion.div>
  )
}

function UsageBar({ used, limit, label }: { used: number; limit: number | null; label: string }) {
  const percentage = limit ? Math.min((used / limit) * 100, 100) : 0
  const isWarning = limit && percentage >= 80
  const isCritical = limit && percentage >= 95

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className={`font-medium ${isCritical ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-gray-900'}`}>
          {used} {limit ? `/ ${limit}` : '(illimite)'}
        </span>
      </div>
      {limit && (
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5 }}
            className={`h-full rounded-full ${
              isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-indigo-500'
            }`}
          />
        </div>
      )}
    </div>
  )
}

function SeatsManager({
  subscription,
  onUpdateSeats,
  isUpdating,
}: {
  subscription: NonNullable<ReturnType<typeof useSubscription>['data']>['subscription']
  onUpdateSeats: (seats: number) => void
  isUpdating: boolean
}) {
  const [extraSeats, setExtraSeats] = useState(subscription?.seats.extra || 0)
  const totalSeats = (subscription?.seats.included || 0) + extraSeats
  const monthlyCost = extraSeats * (subscription?.pricePerSeat || 9)

  if (!subscription) return null

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Gestion des places</h3>
          <p className="text-sm text-gray-500">Ajoutez des collaborateurs a votre equipe</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{totalSeats}</p>
          <p className="text-sm text-gray-500">places total</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{subscription.seats.included}</p>
          <p className="text-xs text-gray-500">Incluses</p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-indigo-600">{extraSeats}</p>
          <p className="text-xs text-gray-500">Supplementaires</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{subscription.seats.used}</p>
          <p className="text-xs text-gray-500">Utilisees</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Places supplementaires ({subscription.pricePerSeat}€/place/mois)
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setExtraSeats(Math.max(0, extraSeats - 1))}
              disabled={extraSeats === 0}
              className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <input
              type="number"
              value={extraSeats}
              onChange={(e) => setExtraSeats(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-20 text-center text-xl font-bold border border-gray-300 rounded-lg py-2"
            />
            <button
              onClick={() => setExtraSeats(extraSeats + 1)}
              className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {extraSeats !== subscription.seats.extra && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-indigo-50 rounded-lg p-4"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-700">Cout supplementaire mensuel</span>
              <span className="text-xl font-bold text-indigo-600">+{monthlyCost}€/mois</span>
            </div>
            <button
              onClick={() => onUpdateSeats(extraSeats)}
              disabled={isUpdating}
              className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUpdating ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Mise a jour...
                </>
              ) : (
                'Mettre a jour les places'
              )}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function InvoicesList() {
  const { data, isLoading } = useInvoices()
  const invoices = data?.invoices || []

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Payee</span>
      case 'open':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">En attente</span>
      case 'void':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">Annulee</span>
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">{status}</span>
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Historique des factures</h3>
      </div>

      {invoices.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500">Aucune facture pour le moment</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {invoices.map((invoice) => (
            <li key={invoice.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{invoice.number}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(invoice.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {(invoice.amount / 100).toLocaleString('fr-FR', { style: 'currency', currency: invoice.currency })}
                    </p>
                    {getStatusBadge(invoice.status)}
                  </div>
                  {invoice.invoicePdf && (
                    <a
                      href={invoice.invoicePdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Telecharger PDF"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function PaymentMethodCard() {
  const { data, isLoading } = usePaymentMethods()
  const createPortalSession = useCreatePortalSession()
  const methods = data?.paymentMethods || []
  const defaultMethod = methods.find((m) => m.isDefault)

  const handleManagePayment = async () => {
    try {
      const result = await createPortalSession.mutateAsync()
      window.location.href = result.url
    } catch (error) {
      console.error('Error creating portal session:', error)
    }
  }

  const getCardIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return (
          <svg className="w-10 h-6" viewBox="0 0 48 32" fill="none">
            <rect width="48" height="32" rx="4" fill="#1A1F71" />
            <path d="M18 21l2-10h3l-2 10h-3zm12-10l-3 7-1-1-1-4c0-1-1-2-2-2h-4l0 0c3 1 5 3 6 4l2 6h3l4-10h-3zm-7 10h-3l2-10h3l-2 10zm19-10h-2c-1 0-1 0-2 1l-4 9h3l1-2h3l0 2h2l-2-10zm-3 6l1-4 1 4h-2z" fill="white" />
          </svg>
        )
      case 'mastercard':
        return (
          <svg className="w-10 h-6" viewBox="0 0 48 32" fill="none">
            <rect width="48" height="32" rx="4" fill="#F7F7F7" />
            <circle cx="19" cy="16" r="8" fill="#EB001B" />
            <circle cx="29" cy="16" r="8" fill="#F79E1B" />
            <path d="M24 10a8 8 0 000 12 8 8 0 000-12z" fill="#FF5F00" />
          </svg>
        )
      default:
        return (
          <div className="w-10 h-6 bg-gray-200 rounded flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-16 bg-gray-100 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Moyen de paiement</h3>
        <button
          onClick={handleManagePayment}
          disabled={createPortalSession.isPending}
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          {createPortalSession.isPending ? 'Chargement...' : 'Gerer'}
        </button>
      </div>

      {defaultMethod ? (
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          {getCardIcon(defaultMethod.card.brand)}
          <div className="flex-1">
            <p className="font-medium text-gray-900 capitalize">
              {defaultMethod.card.brand} **** {defaultMethod.card.last4}
            </p>
            <p className="text-sm text-gray-500">
              Expire {defaultMethod.card.expMonth.toString().padStart(2, '0')}/{defaultMethod.card.expYear}
            </p>
          </div>
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
            Par defaut
          </span>
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-500 mb-3">Aucun moyen de paiement configure</p>
          <button
            onClick={handleManagePayment}
            disabled={createPortalSession.isPending}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Ajouter une carte
          </button>
        </div>
      )}
    </div>
  )
}

export function BillingPage() {
  const { user } = useAuth()
  const { data, isLoading } = useSubscription()
  const createCheckoutSession = useCreateCheckoutSession()
  const updateSeats = useUpdateSeats()
  const cancelSubscription = useCancelSubscription()
  const reactivateSubscription = useReactivateSubscription()
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const subscription = data?.subscription
  const usage = data?.usage
  const isAdmin = user?.role === 'admin'

  const handleSelectPlan = async (planId: string) => {
    if (planId === 'free') return
    setSelectedPlan(planId)
    setError(null)
    try {
      const result = await createCheckoutSession.mutateAsync({ planId })
      if (result.url) {
        window.location.href = result.url
      } else {
        setError('Erreur: pas d\'URL de redirection reçue')
      }
    } catch (err) {
      console.error('Error creating checkout session:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la creation de la session de paiement'
      setError(errorMessage)
    } finally {
      setSelectedPlan(null)
    }
  }

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription.mutateAsync(true)
      setShowCancelModal(false)
    } catch (error) {
      console.error('Error canceling subscription:', error)
    }
  }

  const handleReactivate = async () => {
    try {
      await reactivateSubscription.mutateAsync()
    } catch (error) {
      console.error('Error reactivating subscription:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Acces restreint</h2>
        <p className="text-gray-500 text-center max-w-md">
          Seuls les administrateurs peuvent acceder aux parametres de facturation.
          Contactez votre administrateur pour toute question.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Facturation</h1>
        <p className="text-gray-500">Gerez votre abonnement, vos places et vos factures</p>
      </div>

      {/* Current Plan Status */}
      {subscription && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl p-6 ${
            subscription.cancelAtPeriodEnd
              ? 'bg-amber-50 border border-amber-200'
              : subscription.status === 'past_due'
              ? 'bg-red-50 border border-red-200'
              : 'bg-gradient-to-r from-indigo-500 to-purple-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className={`text-xl font-bold ${
                  subscription.cancelAtPeriodEnd || subscription.status === 'past_due' ? 'text-gray-900' : 'text-white'
                }`}>
                  Plan {subscription.planName}
                </h2>
                {subscription.status === 'trialing' && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-white/20 text-white">
                    Essai gratuit
                  </span>
                )}
                {subscription.cancelAtPeriodEnd && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-200 text-amber-800">
                    Annulation programmee
                  </span>
                )}
                {subscription.status === 'past_due' && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-200 text-red-800">
                    Paiement en retard
                  </span>
                )}
              </div>
              <p className={`text-sm ${
                subscription.cancelAtPeriodEnd || subscription.status === 'past_due' ? 'text-gray-600' : 'text-white/80'
              }`}>
                {subscription.cancelAtPeriodEnd
                  ? `Votre abonnement prendra fin le ${new Date(subscription.currentPeriodEnd).toLocaleDateString('fr-FR')}`
                  : `Renouvellement le ${new Date(subscription.currentPeriodEnd).toLocaleDateString('fr-FR')}`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {subscription.cancelAtPeriodEnd ? (
                <button
                  onClick={handleReactivate}
                  disabled={reactivateSubscription.isPending}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  {reactivateSubscription.isPending ? 'Reactivation...' : 'Reactiver l\'abonnement'}
                </button>
              ) : subscription.planId !== 'free' && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors"
                >
                  Annuler
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Usage Stats */}
      {usage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Utilisation ce mois</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <UsageBar
              used={usage.campaigns.used}
              limit={usage.campaigns.limit}
              label="Campagnes"
            />
            <UsageBar
              used={usage.responses.used}
              limit={usage.responses.limit}
              label="Reponses"
            />
            <UsageBar
              used={usage.teamMembers.used}
              limit={usage.teamMembers.limit}
              label="Membres"
            />
          </div>
        </motion.div>
      )}

      {/* Seats Manager */}
      {subscription && subscription.planId !== 'free' && (
        <SeatsManager
          subscription={subscription}
          onUpdateSeats={(seats) => updateSeats.mutate(seats)}
          isUpdating={updateSeats.isPending}
        />
      )}

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
        >
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      )}

      {/* Plans */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Plans disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={subscription?.planId === plan.id || (!subscription && plan.id === 'free')}
              onSelect={() => handleSelectPlan(plan.id)}
              isLoading={selectedPlan === plan.id && createCheckoutSession.isPending}
            />
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <PaymentMethodCard />

      {/* Invoices */}
      <InvoicesList />

      {/* Cancel Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Annuler l'abonnement ?</h3>
                <p className="text-gray-500">
                  Votre abonnement restera actif jusqu'a la fin de la periode en cours.
                  Vous pourrez reactiver a tout moment.
                </p>
              </div>

              <div className="bg-amber-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-amber-800 mb-2">Vous perdrez l'acces a :</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Campagnes illimitees</li>
                  <li>• Analytics avances</li>
                  <li>• Places supplementaires</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Garder l'abonnement
                </button>
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelSubscription.isPending}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {cancelSubscription.isPending ? 'Annulation...' : 'Confirmer l\'annulation'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
