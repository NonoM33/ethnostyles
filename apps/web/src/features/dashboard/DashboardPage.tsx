import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AreaChart, Area, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts'
import { OnboardingChecklist } from '../../components/OnboardingChecklist'
import { SkeletonDashboard } from '../../components/SkeletonLoader'
import { useAuth } from '../../lib/auth'
import { useDashboardOverview, useSubscription } from '../../lib/api'

interface CampaignStats {
  id: string
  name: string
  status: 'draft' | 'active' | 'archived'
  slug: string
  createdAt: string
  stats: {
    total: number
    completed: number
    inProgress: number
    completionRate: number
  }
}

interface ActivityItem {
  id: string
  type: 'completion' | 'start' | 'campaign' | 'milestone'
  message: string
  time: string
}

// Tips for users
const TIPS = [
  {
    id: 1,
    icon: '💡',
    title: 'Astuce du jour',
    content: 'Personnalisez vos campagnes avec le logo et les couleurs de votre entreprise pour augmenter le taux de participation.',
    link: '/settings/organization',
    linkText: 'Personnaliser'
  },
  {
    id: 2,
    icon: '📊',
    title: 'Le saviez-vous ?',
    content: 'Les équipes avec des profils culturels diversifiés sont 35% plus innovantes selon nos études.',
    link: '/teams',
    linkText: 'Voir les équipes'
  },
  {
    id: 3,
    icon: '🎯',
    title: 'Meilleure pratique',
    content: 'Envoyez vos invitations en début de semaine pour un taux de réponse optimal.',
    link: '/campaigns',
    linkText: 'Gérer les campagnes'
  },
  {
    id: 4,
    icon: '🔔',
    title: 'Rappel',
    content: 'Activez les webhooks pour être notifié en temps réel des nouvelles réponses.',
    link: '/campaigns',
    linkText: 'Configurer'
  }
]

// Quick action templates
const QUICK_ACTIONS = [
  {
    id: 'team-profiling',
    icon: '👥',
    title: 'Profiler mon équipe',
    description: 'Lancez une campagne pour analyser la culture de votre équipe',
    color: 'indigo',
    link: '/teams',
    badge: 'Populaire'
  },
  {
    id: 'recruitment',
    icon: '🎯',
    title: 'Recrutement',
    description: 'Évaluez la compatibilité culturelle des candidats',
    color: 'green',
    link: '/campaigns',
    badge: null
  },
  {
    id: 'onboarding',
    icon: '🚀',
    title: 'Onboarding',
    description: 'Intégrez vos nouvelles recrues avec leur profil culturel',
    color: 'purple',
    link: '/campaigns',
    badge: null
  },
  {
    id: 'transformation',
    icon: '📈',
    title: 'Transformation',
    description: 'Pilotez le changement culturel de votre organisation',
    color: 'amber',
    link: '/analytics',
    badge: 'Pro'
  }
]

// Help resources
const RESOURCES = [
  {
    id: 'guide',
    icon: '📖',
    title: 'Guide de démarrage',
    description: 'Apprenez à créer votre première campagne',
    time: '5 min'
  },
  {
    id: 'video',
    icon: '🎬',
    title: 'Tutoriel vidéo',
    description: 'Découvrez les fonctionnalités en vidéo',
    time: '3 min'
  },
  {
    id: 'faq',
    icon: '❓',
    title: 'FAQ',
    description: 'Réponses aux questions fréquentes',
    time: null
  },
  {
    id: 'support',
    icon: '💬',
    title: 'Support',
    description: 'Contactez notre équipe',
    time: null
  }
]

// Sample mythe data for preview
const SAMPLE_MYTHES = [
  { name: 'Liberté', value: 75 },
  { name: 'Sécurité', value: 60 },
  { name: 'Croissance', value: 85 },
  { name: 'Harmonie', value: 45 },
  { name: 'Excellence', value: 70 },
  { name: 'Innovation', value: 90 },
  { name: 'Tradition', value: 30 },
  { name: 'Leadership', value: 65 }
]

export function DashboardPage() {
  const { user, tenant } = useAuth()
  const { data, isLoading } = useDashboardOverview()
  const { data: subscriptionData } = useSubscription()
  const [dismissedTip, setDismissedTip] = useState<number | null>(null)
  const [showAllActions, setShowAllActions] = useState(false)
  const [dismissedUpgrade, setDismissedUpgrade] = useState(false)

  const subscription = subscriptionData?.subscription
  const usage = subscriptionData?.usage
  const isFreePlan = !subscription || subscription.planId === 'free'

  // Get random tip for today (based on day of month)
  const todayTip = TIPS[new Date().getDate() % TIPS.length]!

  const recentActivity = useMemo<ActivityItem[]>(() => {
    if (!data?.campaigns) return []
    return data.campaigns.slice(0, 5).map((c) => ({
      id: c.id,
      type: 'completion' as const,
      message: `${c.stats.completed} profils complétés pour "${c.name}"`,
      time: getRelativeTime(new Date(c.createdAt)),
    }))
  }, [data?.campaigns])

  const getStatusBadge = (status: CampaignStats['status']) => {
    switch (status) {
      case 'draft':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">Brouillon</span>
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Active</span>
      case 'archived':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">Archivée</span>
    }
  }

  if (isLoading) {
    return <SkeletonDashboard />
  }

  const hasData = data && (data.totals.totalResponses > 0 || data.campaigns.length > 0)
  const completionRate = data?.totals.totalResponses
    ? Math.round((data.totals.completedResponses / data.totals.totalResponses) * 100)
    : 0

  // Generate sparkline data (mock for demo)
  const sparklineData = generateSparklineData(data?.totals.totalResponses || 0)

  const showOnboarding = data &&
    (data.campaigns.length === 0 || data.totals.totalResponses === 0)

  // Calculate weekly goal progress
  const weeklyGoal = 10 // Target 10 responses per week
  const weeklyProgress = Math.min(100, Math.round(((data?.totals.completedResponses || 0) / weeklyGoal) * 100))

  // Get greeting based on time of day
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  const isAdmin = user?.role === 'admin'
  const isManager = user?.role === 'manager'

  return (
    <div className="space-y-8">
      {/* Welcome Banner with Time-based Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white rounded-full" />
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white rounded-full" />
        </div>

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {greeting}, {user?.name?.split(' ')[0] || 'utilisateur'} !
              <span className="text-2xl">{hour < 12 ? '☀️' : hour < 18 ? '🌤️' : '🌙'}</span>
            </h1>
            <p className="text-indigo-100 mt-1">
              Bienvenue sur le tableau de bord de {tenant?.name}
            </p>
            {data && data.totals.totalResponses > 0 && (
              <p className="text-sm text-indigo-200 mt-2">
                📈 Vous avez {data.totals.completedResponses} profils complétés cette semaine
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/campaigns"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium transition-colors shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nouvelle campagne
            </Link>
            <Link
              to="/teams"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Voir les équipes
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Upgrade Banner for Free Plan */}
      {isFreePlan && !dismissedUpgrade && isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 relative"
        >
          <button
            onClick={() => setDismissedUpgrade(true)}
            className="absolute top-3 right-3 text-amber-400 hover:text-amber-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Passez a Pro pour debloquer toutes les fonctionnalites</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Campagnes illimitees, analytics avances, plus de places et bien plus encore !
                </p>
                {usage && (
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                    <span>Campagnes: {usage.campaigns.used}/{usage.campaigns.limit}</span>
                    <span>Reponses: {usage.responses.used}/{usage.responses.limit}</span>
                    <span>Membres: {usage.teamMembers.used}/{usage.teamMembers.limit}</span>
                  </div>
                )}
              </div>
            </div>
            <Link
              to="/billing"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 transition-colors shadow-lg shadow-amber-200 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Passer a Pro
            </Link>
          </div>
        </motion.div>
      )}

      {/* Quick Action Templates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Que souhaitez-vous faire ?</h2>
          <button
            onClick={() => setShowAllActions(!showAllActions)}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {showAllActions ? 'Voir moins' : 'Voir tout'}
          </button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(showAllActions ? QUICK_ACTIONS : QUICK_ACTIONS.slice(0, 4)).map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Link
                to={action.link}
                className={`block p-5 bg-white rounded-xl shadow-sm border-2 border-transparent hover:border-${action.color}-200 hover:shadow-md transition-all group relative`}
              >
                {action.badge && (
                  <span className={`absolute top-3 right-3 px-2 py-0.5 text-xs font-medium rounded-full ${
                    action.badge === 'Populaire' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {action.badge}
                  </span>
                )}
                <div className="text-3xl mb-3">{action.icon}</div>
                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{action.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Stats & Campaigns */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-6 sm:grid-cols-3"
          >
            <div className="bg-white rounded-xl shadow-sm p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50 rounded-bl-full" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Campagnes actives</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{data?.totals.activeCampaigns || 0}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {data?.campaigns.length || 0} au total
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-bl-full" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Réponses totales</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{data?.totals.totalResponses || 0}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                {sparklineData.length > 0 && (
                  <div className="mt-2 h-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sparklineData}>
                        <defs>
                          <linearGradient id="colorResponses" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#10B981"
                          fill="url(#colorResponses)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-amber-50 rounded-bl-full" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Taux de complétion</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {data?.totals.totalResponses ? `${completionRate}%` : '-'}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionRate}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Weekly Goal Progress */}
          {hasData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xl">🎯</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Objectif de la semaine</h3>
                    <p className="text-sm text-gray-500">{data?.totals.completedResponses || 0} / {weeklyGoal} profils complétés</p>
                  </div>
                </div>
                {weeklyProgress >= 100 && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Atteint !
                  </span>
                )}
              </div>
              <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${weeklyProgress}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className={`h-full rounded-full ${
                    weeklyProgress >= 100
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                      : 'bg-gradient-to-r from-green-400 to-green-500'
                  }`}
                />
              </div>
              {weeklyProgress < 100 && (
                <p className="text-xs text-gray-500 mt-2">
                  Plus que {weeklyGoal - (data?.totals.completedResponses || 0)} profils pour atteindre votre objectif !
                </p>
              )}
            </motion.div>
          )}

          {/* Campaign List or Empty State */}
          {hasData ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Vos campagnes</h2>
                <Link
                  to="/campaigns"
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                >
                  Voir tout
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <ul className="divide-y divide-gray-100">
                {data?.campaigns.slice(0, 5).map((campaign, index) => (
                  <motion.li
                    key={campaign.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    <Link
                      to={`/campaigns/${campaign.id}/dashboard`}
                      className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {campaign.name}
                          </span>
                          {getStatusBadge(campaign.status)}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {campaign.stats.completed} réponses complétées
                        </p>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{campaign.stats.completionRate}%</p>
                          <p className="text-xs text-gray-500">complétion</p>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-12 text-center"
            >
              <div className="mx-auto w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Bienvenue sur Ethnostyles Profiler</h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Créez votre première campagne pour commencer à collecter des profils culturels.
              </p>
              <Link
                to="/campaigns"
                className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Créer une campagne
              </Link>
            </motion.div>
          )}

          {/* Culture Preview Chart (for users with data) */}
          {hasData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Aperçu culture globale</h2>
                  <p className="text-sm text-gray-500">Moyenne de tous vos profils</p>
                </div>
                <Link
                  to="/analytics"
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                >
                  Analyse détaillée
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="p-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={SAMPLE_MYTHES}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <Radar
                        name="Culture"
                        dataKey="value"
                        stroke="#6366f1"
                        fill="#6366f1"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {SAMPLE_MYTHES.slice(0, 4).map((mythe) => (
                    <span key={mythe.name} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm">
                      {mythe.name}: {mythe.value}%
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column - Activity, Tips & Resources */}
        <div className="space-y-8">
          {/* Onboarding Checklist */}
          {showOnboarding && (
            <OnboardingChecklist
              hasCampaigns={data?.campaigns && data.campaigns.length > 0}
              hasTeamMembers={false}
              hasResponses={data?.totals && data.totals.totalResponses > 0}
              hasProfile={Boolean(user?.name)}
            />
          )}

          {/* Tip of the Day */}
          <AnimatePresence>
            {dismissedTip !== todayTip.id && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100 relative"
              >
                <button
                  onClick={() => setDismissedTip(todayTip.id)}
                  className="absolute top-3 right-3 text-amber-400 hover:text-amber-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="flex gap-3">
                  <span className="text-2xl">{todayTip.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{todayTip.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{todayTip.content}</p>
                    <Link
                      to={todayTip.link}
                      className="inline-block mt-3 text-sm font-medium text-amber-700 hover:text-amber-800"
                    >
                      {todayTip.linkText} →
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Activité récente</h2>
            </div>

            {recentActivity.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm">Aucune activité récente</p>
                <p className="text-xs text-gray-400 mt-1">Les activités apparaîtront ici</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {recentActivity.map((activity, index) => (
                  <motion.li
                    key={activity.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    className="px-6 py-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        activity.type === 'completion' ? 'bg-green-100 text-green-600' :
                        activity.type === 'start' ? 'bg-blue-100 text-blue-600' :
                        activity.type === 'milestone' ? 'bg-amber-100 text-amber-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        {activity.type === 'completion' ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : activity.type === 'milestone' ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div>

          {/* Help & Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-lg">📚</span>
              Centre d'aide
            </h3>
            <div className="space-y-3">
              {RESOURCES.map((resource) => (
                <button
                  key={resource.id}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                >
                  <span className="text-xl">{resource.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{resource.title}</p>
                    <p className="text-xs text-gray-500">{resource.description}</p>
                  </div>
                  {resource.time && (
                    <span className="text-xs text-gray-400">{resource.time}</span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Accès rapide</h3>
            <div className="space-y-3">
              <Link
                to="/team"
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Inviter un membre</p>
                  <p className="text-xs text-gray-500">Ajoutez des collaborateurs</p>
                </div>
              </Link>
              {(isAdmin || isManager) && (
                <Link
                  to="/analytics"
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Analytics</p>
                    <p className="text-xs text-gray-500">Analysez vos données</p>
                  </div>
                </Link>
              )}
              <Link
                to="/settings"
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Paramètres</p>
                  <p className="text-xs text-gray-500">Personnalisez votre espace</p>
                </div>
              </Link>
            </div>
          </motion.div>

          {/* Keyboard Shortcuts Hint */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-gray-50 rounded-xl p-4 border border-gray-200"
          >
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-lg">⌨️</span>
              <span>Raccourci : </span>
              <kbd className="px-2 py-1 bg-white rounded border border-gray-300 text-xs font-mono">Ctrl</kbd>
              <span>+</span>
              <kbd className="px-2 py-1 bg-white rounded border border-gray-300 text-xs font-mono">K</kbd>
              <span className="text-gray-500">pour la recherche rapide</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return "Hier"
  if (diffDays < 7) return `Il y a ${diffDays} jours`
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`
  return `Il y a ${Math.floor(diffDays / 30)} mois`
}

function generateSparklineData(total: number): { value: number }[] {
  if (total === 0) return []

  const points = 7
  const data: { value: number }[] = []
  let cumulative = 0

  for (let i = 0; i < points; i++) {
    const increment = Math.floor((total / points) * (0.5 + Math.random()))
    cumulative = Math.min(cumulative + increment, total)
    data.push({ value: cumulative })
  }

  // Ensure last point is the total
  const lastPoint = data[data.length - 1]
  if (lastPoint) {
    lastPoint.value = total
  }

  return data
}
