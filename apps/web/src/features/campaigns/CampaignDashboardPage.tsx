import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts'
import { useAuth } from '../../lib/auth'
import { SkeletonPage } from '../../components/SkeletonLoader'
import { useDashboardCampaignStats, useCampaignResponses } from '../../lib/api'

const MYTHE_COLORS: Record<string, string> = {
  Explorateur: '#3B82F6',
  Gardien: '#10B981',
  Créateur: '#8B5CF6',
  Sage: '#F59E0B',
  Héros: '#EF4444',
  Rebelle: '#F97316',
  Magicien: '#6366F1',
  Innocent: '#EC4899',
}

// Tips for improving campaign performance
const TIPS = [
  {
    condition: (rate: number) => rate < 30,
    icon: '📧',
    title: 'Envoyez des rappels',
    description: 'Votre taux de complétion est faible. Pensez à envoyer des rappels aux participants.'
  },
  {
    condition: (rate: number) => rate >= 30 && rate < 60,
    icon: '⏰',
    title: 'Le timing compte',
    description: 'Envoyez vos invitations le mardi ou mercredi matin pour de meilleurs résultats.'
  },
  {
    condition: (rate: number) => rate >= 60 && rate < 80,
    icon: '🎯',
    title: 'Presque parfait !',
    description: 'Excellent taux de complétion. Un dernier rappel pourrait atteindre les 80%.'
  },
  {
    condition: (rate: number) => rate >= 80,
    icon: '🏆',
    title: 'Félicitations !',
    description: 'Votre campagne a un excellent taux de participation. Bravo !'
  }
]

export function CampaignDashboardPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()

  const [currentPage, setCurrentPage] = useState(1)
  const [isExporting, setIsExporting] = useState(false)
  const [dateFilter, setDateFilter] = useState({ startDate: '', endDate: '' })
  const [showBenchmark, setShowBenchmark] = useState(false)
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'radar'>('bar')
  const [copiedLink, setCopiedLink] = useState(false)
  const [showInsights, setShowInsights] = useState(true)

  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardCampaignStats(id, {
    startDate: dateFilter.startDate || undefined,
    endDate: dateFilter.endDate || undefined,
    includeBenchmark: showBenchmark,
  })

  // Debug: log any errors
  if (statsError) {
    console.error('Dashboard stats error:', statsError)
  }

  const { data: responsesData } = useCampaignResponses(id, currentPage, 10)
  const responses = responsesData?.responses || []
  const totalPages = responsesData?.pagination.totalPages || 1

  const isLoading = statsLoading
  const isAdmin = user?.role === 'admin'

  // Calculate insights
  const insights = useMemo(() => {
    if (!stats) return []

    const result = []

    // Dominant profile
    const topProfile = stats.profileDistribution
      .filter(d => d.mythe)
      .sort((a, b) => b.count - a.count)[0]

    if (topProfile && topProfile.percentage && topProfile.percentage > 30) {
      result.push({
        type: 'info',
        icon: '🎭',
        title: 'Profil dominant',
        description: `${topProfile.mythe} représente ${topProfile.percentage}% de votre équipe.`
      })
    }

    // Diversity indicator
    const uniqueProfiles = stats.profileDistribution.filter(d => d.count > 0).length
    if (uniqueProfiles >= 6) {
      result.push({
        type: 'success',
        icon: '🌈',
        title: 'Bonne diversité',
        description: 'Votre équipe présente une belle diversité culturelle avec ' + uniqueProfiles + ' profils différents.'
      })
    } else if (uniqueProfiles <= 3 && stats.stats.completed >= 5) {
      result.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Diversité limitée',
        description: 'Seulement ' + uniqueProfiles + ' profils représentés. Pensez à diversifier votre recrutement.'
      })
    }

    // Completion rate tip
    const tip = TIPS.find(t => t.condition(stats.stats.completionRate))
    if (tip) {
      result.push({
        type: stats.stats.completionRate >= 60 ? 'success' : 'tip',
        icon: tip.icon,
        title: tip.title,
        description: tip.description
      })
    }

    return result
  }, [stats])

  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsExporting(true)
    const token = localStorage.getItem('session_token')
    const params = new URLSearchParams({
      columns: 'email,primaryMythe,passeportCode,completedAt',
    })
    if (showBenchmark) params.append('includeBenchmark', 'true')

    try {
      const response = await fetch(
        `${import.meta.env['VITE_API_URL'] || 'http://localhost:3000'}/dashboard/campaigns/${id}/export?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `export-${stats?.campaign.name || 'campaign'}.${format}`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch {
      console.error('Export failed')
    }
    setIsExporting(false)
  }

  const copyShareLink = () => {
    if (!stats) return
    const url = `${window.location.origin}/q/${stats.campaign.slug}`
    navigator.clipboard.writeText(url)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  if (isLoading) {
    return <SkeletonPage />
  }

  if (!stats || statsError) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-500 mb-2">Campagne non trouvée</p>
        {statsError && (
          <p className="text-sm text-red-500 mb-4">
            {statsError instanceof Error ? statsError.message : 'Erreur inconnue'}
          </p>
        )}
        <Link to="/campaigns" className="text-indigo-600 hover:text-indigo-700 font-medium">
          Retour aux campagnes
        </Link>
      </div>
    )
  }

  // Prepare chart data
  const chartData = stats.profileDistribution
    .filter((d) => d.mythe)
    .sort((a, b) => b.count - a.count)
    .map((item) => ({
      name: item.mythe,
      value: item.count,
      percentage: item.percentage,
      benchmark: item.benchmark || 0,
      fill: MYTHE_COLORS[item.mythe || ''] || '#6B7280',
    }))

  // Radar chart data
  const radarData = stats.profileDistribution
    .filter((d) => d.mythe)
    .map((item) => ({
      mythe: item.mythe,
      value: item.percentage || 0,
      benchmark: item.benchmark || 12.5,
    }))

  // Funnel data
  const funnelData = [
    { name: 'Démarrées', value: stats.stats.total, color: '#6366F1', icon: '📥' },
    { name: 'En cours', value: stats.stats.inProgress, color: '#F59E0B', icon: '⏳' },
    { name: 'Complétées', value: stats.stats.completed, color: '#10B981', icon: '✅' },
  ]

  // Campaign health score
  const healthScore = Math.min(100, Math.round(
    (stats.stats.completionRate * 0.5) +
    (Math.min(stats.stats.completed, 20) / 20 * 30) +
    (chartData.length >= 4 ? 20 : chartData.length * 5)
  ))

  const getHealthColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-100'
    if (score >= 40) return 'text-amber-600 bg-amber-100'
    return 'text-red-600 bg-red-100'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link to="/campaigns" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Campagnes
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{stats.campaign.name}</h1>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${
              stats.campaign.status === 'active' ? 'bg-green-100 text-green-700' :
              stats.campaign.status === 'draft' ? 'bg-gray-100 text-gray-700' :
              'bg-amber-100 text-amber-700'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                stats.campaign.status === 'active' ? 'bg-green-500 animate-pulse' :
                stats.campaign.status === 'draft' ? 'bg-gray-400' : 'bg-amber-500'
              }`} />
              {stats.campaign.status === 'active' ? 'Active' :
               stats.campaign.status === 'draft' ? 'Brouillon' : 'Archivée'}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {stats.campaign.status === 'active' && (
            <button
              onClick={copyShareLink}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {copiedLink ? (
                <>
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copié !
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Partager
                </>
              )}
            </button>
          )}
          <Link
            to={`/campaigns/${id}`}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Paramètres
          </Link>
          {isAdmin && (
            <div className="relative group">
              <button
                disabled={isExporting || stats.stats.completed === 0}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {isExporting ? 'Export...' : 'Exporter'}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <span>📊</span> Export CSV
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <span>📄</span> Export PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Campaign Health Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-6 border border-indigo-100"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getHealthColor(healthScore)}`}>
              <span className="text-2xl font-bold">{healthScore}</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Score de santé</h2>
              <p className="text-sm text-gray-500">
                {healthScore >= 70 ? 'Excellente performance !' :
                 healthScore >= 40 ? 'Bonne progression, continuez !' :
                 'Besoin d\'attention'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.stats.completed}</p>
              <p className="text-xs text-gray-500">Profils complets</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.stats.completionRate}%</p>
              <p className="text-xs text-gray-500">Taux de complétion</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{chartData.length}</p>
              <p className="text-xs text-gray-500">Profils différents</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Insights */}
      {insights.length > 0 && showInsights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span>💡</span> Insights
            </h2>
            <button
              onClick={() => setShowInsights(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Masquer
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl border ${
                  insight.type === 'success' ? 'bg-green-50 border-green-200' :
                  insight.type === 'warning' ? 'bg-amber-50 border-amber-200' :
                  insight.type === 'tip' ? 'bg-blue-50 border-blue-200' :
                  'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{insight.icon}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{insight.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Date Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Filtrer par période:</span>
          <input
            type="date"
            value={dateFilter.startDate}
            onChange={(e) => setDateFilter((f) => ({ ...f, startDate: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <span className="text-gray-500">à</span>
          <input
            type="date"
            value={dateFilter.endDate}
            onChange={(e) => setDateFilter((f) => ({ ...f, endDate: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {(dateFilter.startDate || dateFilter.endDate) && (
            <button
              onClick={() => setDateFilter({ startDate: '', endDate: '' })}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <div className="bg-white rounded-xl shadow-sm p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50 rounded-bl-full" />
          <div className="relative flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Réponses totales</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-bl-full" />
          <div className="relative flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Complétées</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.stats.completed}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-50 rounded-bl-full" />
          <div className="relative flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">En cours</h3>
              <p className="text-3xl font-bold text-amber-600 mt-2">{stats.stats.inProgress}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-50 rounded-bl-full" />
          <div className="relative flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Taux de complétion</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.stats.completionRate}%</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.stats.completionRate}%` }}
              transition={{ duration: 0.8 }}
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* Response Funnel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Entonnoir de réponses</h2>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {funnelData.map((item, index) => (
            <div key={item.name} className="flex items-center">
              <div className="text-center">
                <div
                  className="w-28 h-28 rounded-xl flex flex-col items-center justify-center mx-auto mb-2 relative"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <span className="text-2xl mb-1">{item.icon}</span>
                  <span className="text-3xl font-bold" style={{ color: item.color }}>
                    {item.value}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-700">{item.name}</p>
                {index > 0 && stats.stats.total > 0 && (
                  <p className="text-xs text-gray-500">
                    {Math.round((item.value / stats.stats.total) * 100)}%
                  </p>
                )}
              </div>
              {index < funnelData.length - 1 && (
                <div className="mx-4 flex items-center">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Profile Distribution */}
      {stats.profileDistribution.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Répartition des profils</h2>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBenchmark}
                  onChange={(e) => setShowBenchmark(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-600">Benchmark national</span>
              </label>
              <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setChartType('bar')}
                  className={`p-1.5 rounded ${chartType === 'bar' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}
                  title="Barres"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setChartType('pie')}
                  className={`p-1.5 rounded ${chartType === 'pie' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}
                  title="Camembert"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </button>
                <button
                  onClick={() => setChartType('radar')}
                  className={`p-1.5 rounded ${chartType === 'radar' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}
                  title="Radar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {chartType === 'bar' ? (
              <motion.div
                key="bar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-80"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 80, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} />
                    <XAxis type="number" domain={[0, 'auto']} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0]?.payload
                          return (
                            <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                              <p className="font-medium text-gray-900">{data.name}</p>
                              <p className="text-sm text-gray-600">
                                {data.value} profils ({data.percentage}%)
                              </p>
                              {showBenchmark && (
                                <p className="text-sm text-gray-500">
                                  Benchmark: {data.benchmark}%
                                </p>
                              )}
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            ) : chartType === 'pie' ? (
              <motion.div
                key="pie"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-80 flex items-center justify-center"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, payload }) => `${name} (${(payload as { percentage?: number })?.percentage || 0}%)`}
                      labelLine={false}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0]?.payload
                          return (
                            <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                              <p className="font-medium text-gray-900">{data.name}</p>
                              <p className="text-sm text-gray-600">
                                {data.value} profils ({data.percentage}%)
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            ) : (
              <motion.div
                key="radar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-80"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="mythe" tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <Radar
                      name="Votre équipe"
                      dataKey="value"
                      stroke="#6366f1"
                      fill="#6366f1"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    {showBenchmark && (
                      <Radar
                        name="Benchmark"
                        dataKey="benchmark"
                        stroke="#9ca3af"
                        fill="#9ca3af"
                        fillOpacity={0.1}
                        strokeWidth={1}
                        strokeDasharray="5 5"
                      />
                    )}
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-sm text-gray-600">
                  {item.name} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty state for no completions */}
      {stats.stats.completed === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-8 text-center border border-amber-200"
        >
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📭</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune réponse pour l'instant</h3>
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            Partagez le lien de votre campagne pour commencer à collecter des profils culturels.
          </p>
          {stats.campaign.status === 'active' && (
            <button
              onClick={copyShareLink}
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Copier le lien de partage
            </button>
          )}
        </motion.div>
      )}

      {/* Responses List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Réponses récentes</h2>
          {responses.length > 0 && (
            <span className="text-sm text-gray-500">{stats.stats.total} au total</span>
          )}
        </div>

        {responses.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>Aucune réponse pour cette campagne</p>
            <p className="text-sm text-gray-400 mt-1">Les réponses apparaîtront ici</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mythe
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progression
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {responses.map((response) => (
                    <tr key={response.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {response.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                          response.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : response.status === 'in_progress'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            response.status === 'completed' ? 'bg-green-500' :
                            response.status === 'in_progress' ? 'bg-amber-500' : 'bg-gray-400'
                          }`} />
                          {response.status === 'completed' ? 'Complété' :
                           response.status === 'in_progress' ? 'En cours' : 'Abandonné'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {response.primaryMythe ? (
                          <span
                            className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full text-white"
                            style={{ backgroundColor: MYTHE_COLORS[response.primaryMythe] || '#6B7280' }}
                          >
                            {response.primaryMythe}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${response.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{response.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {response.completedAt
                          ? new Date(response.completedAt).toLocaleDateString('fr-FR')
                          : new Date(response.startedAt).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Précédent
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} sur {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  )
}
