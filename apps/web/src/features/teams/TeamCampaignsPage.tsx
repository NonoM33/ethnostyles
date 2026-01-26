import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../lib/auth'
import { useTeamCampaigns, useCreateTeamCampaign } from '../../lib/api'

export function TeamCampaignsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data, isLoading } = useTeamCampaigns()
  const createTeamCampaign = useCreateTeamCampaign()
  const [error, setError] = useState('')
  const [showNewModal, setShowNewModal] = useState(false)

  // Form state
  const [form, setForm] = useState({
    name: '',
    teamName: '',
    department: '',
    emails: '',
  })

  const campaigns = data?.campaigns || []
  const isAdmin = user?.role === 'admin'
  const isManager = user?.role === 'manager'
  const canCreate = isAdmin || isManager

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const emailList = form.emails
      .split(/[,;\n]/)
      .map(e => e.trim())
      .filter(e => e.includes('@'))

    try {
      const result = await createTeamCampaign.mutateAsync({
        name: form.name,
        teamName: form.teamName,
        department: form.department || undefined,
        emails: emailList.length > 0 ? emailList : undefined,
      })
      setShowNewModal(false)
      setForm({ name: '', teamName: '', department: '', emails: '' })
      navigate(`/teams/${result.campaign.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la creation')
    }
  }

  const getStatusBadge = (status: 'draft' | 'active' | 'archived') => {
    switch (status) {
      case 'draft':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">Brouillon</span>
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Active</span>
      case 'archived':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">Archivee</span>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Equipes</h1>
            <p className="text-gray-500">Gerez vos campagnes d'equipe et analysez la composition culturelle</p>
          </div>
          {canCreate && (
            <button
              onClick={() => setShowNewModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Nouvelle equipe
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Team Campaigns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Campagnes equipe</h2>
          </div>

          {campaigns.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-4xl mb-4">👥</div>
              <p className="text-gray-500 mb-4">Aucune campagne d'equipe pour l'instant</p>
              {canCreate && (
                <button
                  onClick={() => setShowNewModal(true)}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Creer votre premiere campagne equipe
                </button>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <li key={campaign.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <Link to={`/teams/${campaign.id}`} className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-gray-900 hover:text-indigo-600">{campaign.name}</h3>
                        {getStatusBadge(campaign.status)}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        {campaign.teamName && <span>Equipe: {campaign.teamName}</span>}
                        {campaign.department && <span>Departement: {campaign.department}</span>}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>{campaign.stats.completed} profils completes</span>
                        <span>{campaign.stats.pendingInvitations} invitations en attente</span>
                      </div>
                    </Link>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/teams/${campaign.id}`}
                        className="px-3 py-1.5 text-sm bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors"
                      >
                        Voir l'equipe
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </motion.div>

      {/* New Team Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Nouvelle campagne equipe</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la campagne *
                </label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  placeholder="Profiling Equipe Tech"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'equipe *
                </label>
                <input
                  id="teamName"
                  type="text"
                  value={form.teamName}
                  onChange={(e) => setForm(f => ({ ...f, teamName: e.target.value }))}
                  required
                  placeholder="Equipe Developpement"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                  Departement
                </label>
                <input
                  id="department"
                  type="text"
                  value={form.department}
                  onChange={(e) => setForm(f => ({ ...f, department: e.target.value }))}
                  placeholder="Tech, RH, Finance..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="emails" className="block text-sm font-medium text-gray-700 mb-1">
                  Emails des membres (optionnel)
                </label>
                <textarea
                  id="emails"
                  value={form.emails}
                  onChange={(e) => setForm(f => ({ ...f, emails: e.target.value }))}
                  rows={3}
                  placeholder="jean@exemple.com, marie@exemple.com&#10;ou un email par ligne..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">Separez les emails par des virgules ou retours a la ligne</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createTeamCampaign.isPending || !form.name.trim() || !form.teamName.trim()}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {createTeamCampaign.isPending ? 'Creation...' : 'Creer'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
