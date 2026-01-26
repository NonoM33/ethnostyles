import { useState } from 'react'
import { motion } from 'framer-motion'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { useAuth } from '../../lib/auth'
import { SkeletonPage } from '../../components/SkeletonLoader'
import { useCultureMap, useCultureGap, useCultureTrends, useCreateTargetCulture } from '../../lib/api'

const MYTHE_COLORS: Record<string, string> = {
  Explorateur: '#3B82F6',
  Gardien: '#10B981',
  Createur: '#F59E0B',
  Sage: '#8B5CF6',
  Heros: '#EF4444',
  Rebelle: '#EC4899',
  Magicien: '#6366F1',
  Innocent: '#14B8A6',
}

const ALL_MYTHES = ['Explorateur', 'Gardien', 'Createur', 'Sage', 'Heros', 'Rebelle', 'Magicien', 'Innocent']

export function AnalyticsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'culture' | 'gap' | 'trends'>('culture')
  const [error, setError] = useState('')

  const { data: cultureMap, isLoading: mapLoading } = useCultureMap()
  const { data: cultureGap } = useCultureGap()
  const { data: trends } = useCultureTrends(12)
  const createTargetCulture = useCreateTargetCulture()

  const isLoading = mapLoading

  // Target culture form
  const [showTargetModal, setShowTargetModal] = useState(false)
  const [targetForm, setTargetForm] = useState({
    name: 'Culture Cible 2026',
    Explorateur: 12,
    Gardien: 12,
    Createur: 13,
    Sage: 13,
    Heros: 12,
    Rebelle: 13,
    Magicien: 12,
    Innocent: 13,
  })

  const isAdmin = user?.role === 'admin'

  const handleCreateTarget = async () => {
    try {
      await createTargetCulture.mutateAsync({
        name: targetForm.name,
        explorateurTarget: targetForm.Explorateur,
        gardienTarget: targetForm.Gardien,
        createurTarget: targetForm.Createur,
        sageTarget: targetForm.Sage,
        herosTarget: targetForm.Heros,
        rebelleTarget: targetForm.Rebelle,
        magicienTarget: targetForm.Magicien,
        innocentTarget: targetForm.Innocent,
      })
      setShowTargetModal(false)
    } catch {
      setError('Erreur lors de la création')
    }
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès réservé</h2>
        <p className="text-gray-500">Cette section est réservée aux administrateurs.</p>
      </div>
    )
  }

  if (isLoading) {
    return <SkeletonPage />
  }

  // Prepare radar chart data
  const radarData = ALL_MYTHES.map((mythe) => ({
    mythe,
    current: cultureMap?.globalComposition.percentages[mythe] || 0,
    benchmark: cultureMap?.benchmark[mythe] || 0,
    target: cultureGap?.targetComposition?.[mythe] || 0,
  }))

  // Prepare trend line data
  const trendLineData = trends?.trends.slice(-6).map((month) => ({
    name: month.month,
    total: month.total,
    ...ALL_MYTHES.reduce((acc, mythe) => ({
      ...acc,
      [mythe]: month.percentages[mythe] || 0,
    }), {}),
  })) || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics Culture</h1>
        <p className="text-gray-500">Analysez la culture de votre organisation et identifiez les écarts</p>
      </div>

      {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="border-b border-gray-200 px-6">
            <nav className="flex gap-8">
              {[
                { key: 'culture' as const, label: 'Carte Culture', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
                { key: 'gap' as const, label: 'Analyse des écarts', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
                { key: 'trends' as const, label: 'Tendances', icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
                  </svg>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Culture Map Tab */}
        {activeTab === 'culture' && cultureMap && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Radar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Vue radar</h2>
              <p className="text-sm text-gray-500 mb-6">{cultureMap.globalComposition.total} profils analysés</p>

              {cultureMap.globalComposition.total === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p>Aucun profil pour le moment</p>
                  <p className="text-sm mt-1">Lancez des campagnes internes pour analyser votre culture.</p>
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid strokeDasharray="3 3" />
                      <PolarAngleAxis dataKey="mythe" tick={{ fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 30]} tick={{ fontSize: 10 }} />
                      <Radar
                        name="Votre organisation"
                        dataKey="current"
                        stroke="#4F46E5"
                        fill="#4F46E5"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Radar
                        name="Benchmark national"
                        dataKey="benchmark"
                        stroke="#9CA3AF"
                        fill="#9CA3AF"
                        fillOpacity={0.1}
                        strokeDasharray="5 5"
                        strokeWidth={1}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                                <p className="font-medium text-gray-900">{label}</p>
                                {payload.map((entry, index) => (
                                  <p key={index} className="text-sm" style={{ color: entry.color }}>
                                    {entry.name}: {entry.value}%
                                  </p>
                                ))}
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </motion.div>

            {/* Distribution Bars */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Distribution globale</h2>

              <div className="space-y-4">
                {ALL_MYTHES.map((mythe, index) => {
                  const percentage = cultureMap.globalComposition.percentages[mythe] || 0
                  const benchmark = cultureMap.benchmark[mythe] || 0
                  const diff = percentage - benchmark

                  return (
                    <motion.div
                      key={mythe}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                    >
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{mythe}</span>
                        <span className="flex items-center gap-2">
                          <span className="text-gray-900 font-medium">{percentage}%</span>
                          {diff !== 0 && (
                            <span className={`text-xs ${diff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {diff > 0 ? '+' : ''}{diff}%
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: 0.2 + index * 0.05 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: MYTHE_COLORS[mythe] || '#6B7280' }}
                        />
                        {/* Benchmark marker */}
                        <div
                          className="absolute top-0 h-full w-0.5 bg-gray-600"
                          style={{ left: `${benchmark}%` }}
                          title={`Benchmark: ${benchmark}%`}
                        />
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-2 rounded bg-indigo-500" />
                  <span>Votre organisation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-0.5 h-4 bg-gray-600" />
                  <span>Benchmark national</span>
                </div>
              </div>
            </motion.div>

            {/* Department Breakdown */}
            {cultureMap.departmentBreakdown.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Par département</h2>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cultureMap.departmentBreakdown.map((dept) => (
                    <div key={dept.department} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium text-gray-900">{dept.department}</h3>
                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                          {dept.composition.total} profils
                        </span>
                      </div>
                      <div className="flex h-4 rounded-full overflow-hidden bg-white">
                        {ALL_MYTHES
                          .filter((m) => (dept.composition.percentages[m] || 0) > 0)
                          .map((mythe) => (
                            <div
                              key={mythe}
                              style={{
                                width: `${dept.composition.percentages[mythe] || 0}%`,
                                backgroundColor: MYTHE_COLORS[mythe] || '#6B7280',
                              }}
                              title={`${mythe}: ${dept.composition.percentages[mythe]}%`}
                            />
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Gap Analysis Tab */}
        {activeTab === 'gap' && cultureGap && (
          <div className="space-y-8">
            {!cultureGap.hasTarget ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-8 text-center"
              >
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Définissez votre culture cible</h2>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">{cultureGap.message}</p>
                <button
                  onClick={() => setShowTargetModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Créer une culture cible
                </button>
              </motion.div>
            ) : (
              <>
                {/* Target Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-semibold">{cultureGap.targetCulture?.name}</h2>
                      {cultureGap.targetCulture?.description && (
                        <p className="text-indigo-100 mt-1">{cultureGap.targetCulture.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setShowTargetModal(true)}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
                    >
                      Modifier
                    </button>
                  </div>
                </motion.div>

                {/* Gap Chart with Priority */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-xl shadow-sm p-6"
                >
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Écarts par Mythe</h2>

                  <div className="space-y-4">
                    {cultureGap.gaps?.map((gap, index) => (
                      <motion.div
                        key={gap.mythe}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                      >
                        <div className="flex justify-between text-sm mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">{gap.mythe}</span>
                            {gap.priority === 'high' && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                Priorité haute
                              </span>
                            )}
                          </div>
                          <span
                            className={`font-medium ${
                              gap.gap > 0 ? 'text-red-600' : gap.gap < 0 ? 'text-green-600' : 'text-gray-500'
                            }`}
                          >
                            {gap.gap > 0 ? '+' : ''}{gap.gap}%
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden relative">
                            {/* Current bar */}
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${gap.current}%` }}
                              transition={{ duration: 0.5, delay: 0.2 }}
                              className="h-full rounded-full"
                              style={{
                                backgroundColor: MYTHE_COLORS[gap.mythe] || '#6B7280',
                                opacity: 0.6,
                              }}
                            />
                            {/* Target marker */}
                            <div
                              className="absolute top-0 h-full w-1 bg-indigo-600 rounded"
                              style={{ left: `${Math.min(gap.target, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-28 text-right">
                            {gap.current}% → {gap.target}%
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-2 rounded bg-indigo-400 opacity-60" />
                      <span>Actuel</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-indigo-600 rounded" />
                      <span>Cible</span>
                    </div>
                  </div>
                </motion.div>

                {/* Recommendations */}
                {cultureGap.recommendations && cultureGap.recommendations.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-green-50 border border-green-200 rounded-xl p-6"
                  >
                    <h2 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Recommandations
                    </h2>
                    <ul className="space-y-3">
                      {cultureGap.recommendations?.map((rec, i) => (
                        <li key={i} className="flex items-start gap-3 text-green-800">
                          <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </>
            )}
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && trends && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total profils</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{trends.summary?.totalResponses || 0}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Période analysée</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{trends.summary?.months || 0} mois</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Changements significatifs</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{trends.significantChanges?.length || 0}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Significant Changes */}
            {trends.significantChanges && trends.significantChanges.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-amber-50 border border-amber-200 rounded-xl p-6"
              >
                <h2 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Changements récents
                </h2>
                <ul className="space-y-2">
                  {trends.significantChanges?.map((change, i) => (
                    <li key={i} className="flex items-start gap-2 text-amber-800">
                      <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      {change}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Trend Line Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Évolution mensuelle</h2>

              {trends.trends.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                  <p>Pas assez de données pour afficher les tendances</p>
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendLineData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 30]} tick={{ fontSize: 12 }} />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                                <p className="font-medium text-gray-900 mb-2">{label}</p>
                                {payload.map((entry, index) => (
                                  <p key={index} className="text-sm" style={{ color: entry.color }}>
                                    {entry.name}: {entry.value}%
                                  </p>
                                ))}
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      {ALL_MYTHES.slice(0, 4).map((mythe) => (
                        <Line
                          key={mythe}
                          type="monotone"
                          dataKey={mythe}
                          name={mythe}
                          stroke={MYTHE_COLORS[mythe]}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </motion.div>
          </div>
        )}

      {/* Target Culture Modal */}
      {showTargetModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowTargetModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Culture cible</h2>
                <button
                  onClick={() => setShowTargetModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    value={targetForm.name}
                    onChange={(e) => setTargetForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <p className="text-sm text-gray-500">
                  Définissez le pourcentage cible pour chaque Mythe. Le total devrait être proche de 100%.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {ALL_MYTHES.map((mythe) => (
                    <div key={mythe}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{mythe}</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={targetForm[mythe as keyof typeof targetForm] || 0}
                        onChange={(e) =>
                          setTargetForm((f) => ({ ...f, [mythe]: parseInt(e.target.value) || 0 }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>

                <p className="text-sm text-gray-500 text-right">
                  Total:{' '}
                  {Object.values(targetForm)
                    .filter((v) => typeof v === 'number')
                    .reduce((a, b) => a + (b as number), 0)}
                  %
                </p>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowTargetModal(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleCreateTarget}
                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  )
}
