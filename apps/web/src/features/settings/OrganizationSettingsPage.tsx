import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../lib/auth'
import { useOrganization, useUpdateOrganization, useRequestOrganizationExport, useRequestOrganizationDelete } from '../../lib/api'

export function OrganizationSettingsPage() {
  const { user, refreshTenant } = useAuth()
  const { data: orgData, isLoading } = useOrganization()
  const updateOrganization = useUpdateOrganization()
  const requestExport = useRequestOrganizationExport()
  const requestDelete = useRequestOrganizationDelete()

  const organization = orgData?.organization || null
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [domain, setDomain] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#4F46E5')

  // Initialize form when data loads
  useEffect(() => {
    if (organization) {
      setName(organization.name || '')
      setDescription(organization.description || '')
      setDomain(organization.domain || '')
      setLogoUrl(organization.logoUrl || '')
      setPrimaryColor(organization.primaryColor || '#4F46E5')
    }
  }, [organization])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      await updateOrganization.mutateAsync({
        name,
        description: description || null,
        domain: domain || null,
        logoUrl: logoUrl || null,
        primaryColor,
      })
      setSuccess('Paramètres enregistrés avec succès')
      if (refreshTenant) {
        refreshTenant()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
    }
  }

  const handleExport = async () => {
    setError('')
    setSuccess('')

    try {
      const result = await requestExport.mutateAsync()
      setSuccess(result.message || 'Email envoyé avec le lien de téléchargement')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la demande d\'export')
    }
  }

  const handleDeleteRequest = async () => {
    setError('')
    setSuccess('')

    try {
      const result = await requestDelete.mutateAsync()
      setSuccess(result.message || 'Email de confirmation envoyé')
      setShowDeleteModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la demande de suppression')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    )
  }

  const isAdmin = user?.role === 'admin'

  return (
    <div className="max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-900">Paramètres de l'organisation</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configurez les informations et l'identité visuelle de votre organisation.
          </p>
        </motion.div>

        {!isAdmin && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-700">
              <strong>Mode lecture seule</strong> — En tant que Viewer, vous pouvez consulter les paramètres mais pas les modifier.
            </p>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          {error && (
            <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Organization Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nom de l'organisation *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={!isAdmin}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Acme Corporation"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                disabled={!isAdmin}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                placeholder="Une brève description de votre organisation..."
              />
              <p className="mt-1 text-xs text-gray-500">Maximum 1000 caractères</p>
            </div>

            {/* Domain */}
            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-1">
                Site web
              </label>
              <input
                type="url"
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                disabled={!isAdmin}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="https://example.com"
              />
            </div>

            {/* Logo URL */}
            <div>
              <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-1">
                URL du logo
              </label>
              <input
                type="url"
                id="logoUrl"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                disabled={!isAdmin}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="https://example.com/logo.png"
              />
              {logoUrl && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">Aperçu :</p>
                  <img
                    src={logoUrl}
                    alt="Logo preview"
                    className="max-h-16 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Primary Color */}
            <div>
              <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-1">
                Couleur principale
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="primaryColor"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  disabled={!isAdmin}
                  className="h-10 w-14 border border-gray-300 rounded-lg cursor-pointer disabled:cursor-not-allowed"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => {
                    const val = e.target.value
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                      setPrimaryColor(val)
                    }
                  }}
                  disabled={!isAdmin}
                  className="w-28 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="#4F46E5"
                />
                <div
                  className="w-10 h-10 rounded-lg border border-gray-200"
                  style={{ backgroundColor: primaryColor }}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Cette couleur sera utilisée comme couleur par défaut pour vos campagnes.
              </p>
            </div>

            {/* Organization Info */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Informations</h3>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-gray-500">Identifiant</dt>
                  <dd className="font-mono text-gray-900">{organization?.slug}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Date de création</dt>
                  <dd className="text-gray-900">
                    {organization?.createdAt && new Date(organization.createdAt).toLocaleDateString('fr-FR')}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Submit Button */}
            {isAdmin && (
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={updateOrganization.isPending}
                  className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {updateOrganization.isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </div>
            )}
          </form>
        </motion.div>

        {/* Data Management Section (Admin only) */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Gestion des données</h2>

            {/* Export Data */}
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Exporter mes données</h3>
              <p className="text-sm text-gray-500 mb-3">
                Téléchargez toutes les données de votre organisation (campagnes, réponses) au format JSON.
                Conformément au RGPD, vous avez le droit à la portabilité de vos données.
              </p>
              <button
                onClick={handleExport}
                disabled={requestExport.isPending}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {requestExport.isPending ? 'Envoi en cours...' : 'Demander l\'export'}
              </button>
            </div>

            {/* Delete Account */}
            <div>
              <h3 className="text-sm font-medium text-red-600 mb-2">Zone dangereuse</h3>
              <p className="text-sm text-gray-500 mb-3">
                Supprimer définitivement votre compte et toutes vos données.
                Cette action est irréversible.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                Supprimer mon compte
              </button>
            </div>
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-xl p-6 max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Supprimer le compte ?</h3>
              <p className="text-sm text-gray-500 mb-4">
                Vous êtes sur le point de demander la suppression de votre compte.
                Un email de confirmation vous sera envoyé pour finaliser la suppression.
              </p>
              <p className="text-sm text-red-600 font-medium mb-4">
                Toutes vos campagnes, réponses et données seront définitivement supprimées.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteRequest}
                  disabled={requestDelete.isPending}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {requestDelete.isPending ? 'Envoi...' : 'Demander la suppression'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
    </div>
  )
}
