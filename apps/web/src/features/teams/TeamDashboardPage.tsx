import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTeamComposition, useTeamRecommendations } from '../../lib/api'

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

export function TeamDashboardPage() {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<'composition' | 'recommendations'>('composition')

  const { data: composition, isLoading: compositionLoading, error: compositionError } = useTeamComposition(id)
  const { data: recommendations } = useTeamRecommendations(id)

  const isLoading = compositionLoading
  const error = compositionError ? 'Erreur lors du chargement des donnees' : ''

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    )
  }

  if (!composition) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{error || 'Equipe non trouvee'}</p>
        <Link to="/teams" className="text-indigo-600 hover:underline mt-4 inline-block">
          Retour aux equipes
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <Link to="/teams" className="text-sm text-indigo-600 hover:underline mb-2 inline-block">
              ← Retour aux equipes
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{composition.campaign.name}</h1>
            <div className="flex items-center gap-4 text-gray-500">
              {composition.campaign.teamName && <span>Equipe: {composition.campaign.teamName}</span>}
              {composition.campaign.department && <span>Departement: {composition.campaign.department}</span>}
              <span>{composition.composition.total} membres</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('composition')}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'composition'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Composition
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'recommendations'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Recommandations
            </button>
          </nav>
        </div>

        {activeTab === 'composition' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Distribution Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Distribution des Mythes</h2>

              {composition.composition.total === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Aucun profil complete pour le moment
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(composition.composition.distribution)
                    .filter(([_, count]) => count > 0)
                    .sort(([, a], [, b]) => b - a)
                    .map(([mythe, count]) => {
                      const percentage = composition.composition.percentages[mythe] || 0
                      return (
                        <div key={mythe}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700">{mythe}</span>
                            <span className="text-gray-500">{count} ({percentage}%)</span>
                          </div>
                          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.5 }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: MYTHE_COLORS[mythe] || '#6B7280' }}
                            />
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </motion.div>

            {/* Members List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Membres de l'equipe</h2>

              {composition.members.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Aucun membre n'a complete le questionnaire
                </div>
              ) : (
                <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                  {composition.members.map((member) => (
                    <li key={member.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{member.email}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(member.completedAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      {member.primaryMythe && (
                        <span
                          className="px-3 py-1 text-sm font-medium rounded-full text-white"
                          style={{ backgroundColor: MYTHE_COLORS[member.primaryMythe] || '#6B7280' }}
                        >
                          {member.primaryMythe}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>

            {/* Team Dynamics */}
            {(composition.dynamics.similarGroups.length > 0 || composition.dynamics.complementaryFound.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Dynamiques d'equipe</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Similar Profiles */}
                  {composition.dynamics.similarGroups.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-700 mb-3">Profils similaires</h3>
                      <ul className="space-y-2">
                        {composition.dynamics.similarGroups.map((group, i) => (
                          <li key={i} className="bg-gray-50 rounded-lg p-3">
                            <p className="font-medium text-gray-900">{group.mythe}</p>
                            <p className="text-sm text-gray-500">
                              {group.members.map(m => m.email).join(', ')}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Complementary Profiles */}
                  {composition.dynamics.complementaryFound.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-700 mb-3">Profils complementaires</h3>
                      <ul className="space-y-2">
                        {composition.dynamics.complementaryFound.map((group, i) => (
                          <li key={i} className="bg-green-50 rounded-lg p-3">
                            <p className="font-medium text-green-800">
                              {group.pair[0]} ↔ {group.pair[1]}
                            </p>
                            <p className="text-sm text-green-600">
                              {group.members.length} membres avec ces profils complementaires
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {activeTab === 'recommendations' && recommendations && (
          <div className="space-y-8">
            {/* General Tips */}
            {recommendations.generalTips.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 border border-blue-200 rounded-xl p-6"
              >
                <h2 className="text-lg font-semibold text-blue-900 mb-4">Conseils generaux</h2>
                <ul className="space-y-2">
                  {recommendations.generalTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-blue-800">
                      <span className="text-blue-500">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Potential Conflicts */}
            {recommendations.potentialConflicts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-amber-50 border border-amber-200 rounded-xl p-6"
              >
                <h2 className="text-lg font-semibold text-amber-900 mb-4">Points d'attention</h2>
                <ul className="space-y-2">
                  {recommendations.potentialConflicts.map((conflict, i) => (
                    <li key={i} className="flex items-start gap-2 text-amber-800">
                      <span className="text-amber-500">⚠</span>
                      {conflict}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Per-Mythe Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.recommendations.map((rec, i) => (
                <motion.div
                  key={rec.mythe}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="bg-white rounded-xl shadow-sm p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{rec.mythe}</h3>
                    <span
                      className="px-3 py-1 text-sm font-medium rounded-full text-white"
                      style={{ backgroundColor: MYTHE_COLORS[rec.mythe] || '#6B7280' }}
                    >
                      {rec.count} ({rec.percentage}%)
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Points forts</p>
                      <p className="text-sm text-gray-600">{rec.strengths}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Communication</p>
                      <p className="text-sm text-gray-600">{rec.communication}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Conseils de management</p>
                      <ul className="space-y-1">
                        {rec.tips.map((tip, j) => (
                          <li key={j} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-indigo-500">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-sm font-medium text-amber-700 mb-1">A surveiller</p>
                      <p className="text-sm text-amber-600">{rec.watchFor}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
    </div>
  )
}
