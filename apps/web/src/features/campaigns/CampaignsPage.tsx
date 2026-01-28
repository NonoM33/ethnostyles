import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../lib/auth'
import { EmptyState } from '../../components/EmptyState'
import { SkeletonCardGrid, SkeletonList } from '../../components/SkeletonLoader'
import { useCampaigns, useCreateCampaign, useActivateCampaign, useArchiveCampaign, useDuplicateCampaign } from '../../lib/api'

interface Campaign {
  id: string
  name: string
  description: string | null
  status: 'draft' | 'active' | 'archived'
  slug: string
  logoUrl: string | null
  primaryColor: string | null
  createdAt: string
  updatedAt: string
}

type ViewMode = 'grid' | 'list'
type StatusFilter = 'all' | 'active' | 'draft' | 'archived'

export function CampaignsPage() {
  const { user } = useAuth()
  const { data, isLoading, error: queryError } = useCampaigns()
  const createCampaign = useCreateCampaign()
  const activateCampaign = useActivateCampaign()
  const archiveCampaign = useArchiveCampaign()
  const duplicateCampaign = useDuplicateCampaign()

  const campaigns = data?.campaigns || []
  const [error, setError] = useState('')
  const [showNewModal, setShowNewModal] = useState(false)
  const [newCampaignName, setNewCampaignName] = useState('')
  const [newCampaignDescription, setNewCampaignDescription] = useState('')
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)

  // UI state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('campaigns_view') as ViewMode) || 'list'
  })

  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    localStorage.setItem('campaigns_view', viewMode)
  }, [viewMode])

  useEffect(() => {
    if (queryError) setError(queryError.message)
  }, [queryError])

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      if (statusFilter !== 'all' && campaign.status !== statusFilter) {
        return false
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          campaign.name.toLowerCase().includes(query) ||
          campaign.description?.toLowerCase().includes(query) ||
          campaign.slug.toLowerCase().includes(query)
        )
      }
      return true
    })
  }, [campaigns, statusFilter, searchQuery])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await createCampaign.mutateAsync({
        name: newCampaignName,
        description: newCampaignDescription || undefined,
      })
      setShowNewModal(false)
      setNewCampaignName('')
      setNewCampaignDescription('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création')
    }
  }

  const handleActivate = async (id: string) => {
    try {
      await activateCampaign.mutateAsync(id)
    } catch {
      setError('Erreur lors de l\'activation')
    }
  }

  const handleArchive = async (id: string) => {
    if (!confirm('Voulez-vous vraiment archiver cette campagne ?')) return
    try {
      await archiveCampaign.mutateAsync(id)
    } catch {
      setError('Erreur lors de l\'archivage')
    }
  }

  const copyLink = async (slug: string) => {
    const url = `${window.location.origin}/q/${slug}`

    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url)
      } else {
        // Fallback for HTTP (non-secure context)
        const textArea = document.createElement('textarea')
        textArea.value = url
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        textArea.remove()
      }
      setCopiedSlug(slug)
      setTimeout(() => setCopiedSlug(null), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
      // Show the URL in a prompt as last resort
      window.prompt('Copiez ce lien:', url)
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateCampaign.mutateAsync(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la duplication')
    }
  }

  const isCreating = createCampaign.isPending

  const getStatusBadge = (status: Campaign['status']) => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
            Brouillon
          </span>
        )
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Active
          </span>
        )
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
            Archivée
          </span>
        )
    }
  }

  const statusCounts = useMemo(() => {
    return {
      all: campaigns.length,
      active: campaigns.filter(c => c.status === 'active').length,
      draft: campaigns.filter(c => c.status === 'draft').length,
      archived: campaigns.filter(c => c.status === 'archived').length,
    }
  }, [campaigns])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-60 bg-gray-200 rounded animate-pulse mt-2" />
          </div>
        </div>
        {viewMode === 'grid' ? <SkeletonCardGrid count={6} /> : <SkeletonList items={5} />}
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Campagnes</h1>
            <p className="text-gray-500">Gérez vos campagnes de profiling culturel</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowNewModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nouvelle campagne
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Read-only notice for viewers */}
        {!isAdmin && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-blue-700">
              <strong>Mode lecture seule</strong> — En tant que Viewer, vous pouvez consulter les campagnes mais pas les modifier.
            </p>
          </div>
        )}

        {/* Filters & Search */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher une campagne..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              {(['all', 'active', 'draft', 'archived'] as StatusFilter[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    statusFilter === status
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {status === 'all' ? 'Toutes' :
                   status === 'active' ? 'Actives' :
                   status === 'draft' ? 'Brouillons' : 'Archivées'}
                  <span className="ml-1.5 text-xs text-gray-500">
                    ({statusCounts[status]})
                  </span>
                </button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                title="Vue liste"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                title="Vue grille"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Campaigns */}
        {filteredCampaigns.length === 0 ? (
          campaigns.length === 0 ? (
            <EmptyState
              type="campaigns"
              actionHref={isAdmin ? undefined : undefined}
              onAction={isAdmin ? () => setShowNewModal(true) : undefined}
              actionLabel={isAdmin ? 'Créer une campagne' : undefined}
            />
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-gray-500">Aucune campagne ne correspond à votre recherche</p>
              <button
                onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )
        ) : viewMode === 'grid' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredCampaigns.map((campaign, index) => (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <Link to={`/campaigns/${campaign.id}/dashboard`} className="block p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: campaign.primaryColor || '#4F46E5' }}
                      >
                        <span className="text-white font-bold text-sm">
                          {campaign.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      {getStatusBadge(campaign.status)}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{campaign.name}</h3>
                    {campaign.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">{campaign.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-3">
                      Créée le {new Date(campaign.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </Link>

                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                    {/* Brouillon : CTA d'activation proéminent */}
                    {campaign.status === 'draft' && isAdmin && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                          <span>Lien non disponible</span>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleActivate(campaign.id) }}
                          disabled={activateCampaign.isPending}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
                        >
                          {activateCampaign.isPending ? (
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          Activer la campagne
                        </button>
                      </div>
                    )}

                    {/* Brouillon mais pas admin : juste l'explication */}
                    {campaign.status === 'draft' && !isAdmin && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <span>En attente d'activation par un admin</span>
                        </div>
                        <Link
                          to={`/campaigns/${campaign.id}`}
                          className="text-sm text-gray-600 hover:text-gray-900"
                        >
                          Voir
                        </Link>
                      </div>
                    )}

                    {/* Campagne active : afficher le lien de partage */}
                    {campaign.status === 'active' && (
                      <div className="flex items-center justify-between">
                        <button
                          onClick={(e) => { e.stopPropagation(); copyLink(campaign.slug) }}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            copiedSlug === campaign.slug
                              ? 'bg-green-100 text-green-700'
                              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                          }`}
                        >
                          {copiedSlug === campaign.slug ? (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Lien copié !
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                              </svg>
                              Copier le lien de partage
                            </>
                          )}
                        </button>
                        <Link
                          to={`/campaigns/${campaign.id}`}
                          className="text-sm text-gray-600 hover:text-gray-900"
                        >
                          Paramètres
                        </Link>
                      </div>
                    )}

                    {/* Campagne archivée */}
                    {campaign.status === 'archived' && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 italic">Campagne archivée</span>
                        <Link
                          to={`/campaigns/${campaign.id}`}
                          className="text-sm text-gray-600 hover:text-gray-900"
                        >
                          Voir
                        </Link>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <ul className="divide-y divide-gray-100">
              <AnimatePresence mode="popLayout">
                {filteredCampaigns.map((campaign, index) => (
                  <motion.li
                    key={campaign.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.03 }}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <Link to={`/campaigns/${campaign.id}/dashboard`} className="flex-1 flex items-center gap-4">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: campaign.primaryColor || '#4F46E5' }}
                        >
                          <span className="text-white font-bold text-sm">
                            {campaign.name.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium text-gray-900 hover:text-indigo-600 transition-colors">
                              {campaign.name}
                            </h3>
                            {getStatusBadge(campaign.status)}
                          </div>
                          {campaign.description && (
                            <p className="text-sm text-gray-500 truncate">{campaign.description}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            Créée le {new Date(campaign.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </Link>

                      <div className="flex items-center gap-2">
                        {/* Brouillon : CTA d'activation proéminent */}
                        {campaign.status === 'draft' && isAdmin && (
                          <>
                            <span className="text-sm text-gray-400 flex items-center gap-1.5">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                              Lien masqué
                            </span>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleActivate(campaign.id) }}
                              disabled={activateCampaign.isPending}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
                            >
                              {activateCampaign.isPending ? (
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              )}
                              Activer et publier
                            </button>
                          </>
                        )}

                        {/* Brouillon mais pas admin */}
                        {campaign.status === 'draft' && !isAdmin && (
                          <span className="text-sm text-gray-400 flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            En attente d'activation
                          </span>
                        )}

                        {/* Campagne active : bouton de partage proéminent */}
                        {campaign.status === 'active' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); copyLink(campaign.slug) }}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              copiedSlug === campaign.slug
                                ? 'bg-green-100 text-green-700 ring-2 ring-green-200'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                            }`}
                          >
                            {copiedSlug === campaign.slug ? (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Lien copié !
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                                Copier le lien
                              </>
                            )}
                          </button>
                        )}

                        {isAdmin && campaign.status === 'active' && (
                          <button
                            onClick={() => handleArchive(campaign.id)}
                            className="px-3 py-1.5 text-sm text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            Archiver
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            onClick={() => handleDuplicate(campaign.id)}
                            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            Dupliquer
                          </button>
                        )}

                        <Link
                          to={`/campaigns/${campaign.id}`}
                          className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          Paramètres
                        </Link>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </motion.div>
        )}
      </div>

      {/* New Campaign Modal */}
      <AnimatePresence>
        {showNewModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewModal(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Nouvelle campagne</h2>
                  <button
                    onClick={() => setShowNewModal(false)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nom de la campagne *
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={newCampaignName}
                      onChange={(e) => setNewCampaignName(e.target.value)}
                      required
                      placeholder="Ex: Équipe Marketing Q1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={newCampaignDescription}
                      onChange={(e) => setNewCampaignDescription(e.target.value)}
                      rows={3}
                      placeholder="Décrivez l'objectif de cette campagne..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowNewModal(false)}
                      className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isCreating || !newCampaignName.trim()}
                      className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isCreating ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Création...
                        </span>
                      ) : (
                        'Créer la campagne'
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
