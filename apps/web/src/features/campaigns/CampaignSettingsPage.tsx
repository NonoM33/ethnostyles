import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../lib/auth'
import { useCampaign, useUpdateCampaign, useActivateCampaign, useTestWebhook } from '../../lib/api'

export function CampaignSettingsPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: campaignData, isLoading } = useCampaign(id)
  const updateCampaign = useUpdateCampaign()
  const activateCampaign = useActivateCampaign()
  const testWebhook = useTestWebhook()

  const campaign = campaignData || null
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#4F46E5')
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [webhookUrl, setWebhookUrl] = useState('')
  const [webhookSecret, setWebhookSecret] = useState('')

  const isAdmin = user?.role === 'admin'
  const isArchived = campaign?.status === 'archived'
  const canEdit = isAdmin && !isArchived

  // Initialize form when campaign data loads
  useEffect(() => {
    if (campaign) {
      setName(campaign.name)
      setDescription(campaign.description || '')
      setPrimaryColor(campaign.primaryColor || '#4F46E5')
      setLogoPreview(campaign.logoUrl)
      setWebhookUrl(campaign.webhookUrl || '')
      setWebhookSecret(campaign.webhookSecret || '')
    }
  }, [campaign])

  const handleSave = async () => {
    if (!id) return
    setError('')
    setSuccess('')

    try {
      await updateCampaign.mutateAsync({
        id,
        data: {
          name,
          description: description || undefined,
          primaryColor,
          logoUrl: logoPreview,
          webhookUrl: webhookUrl || undefined,
          webhookSecret: webhookSecret || undefined,
        },
      })
      setSuccess('Modifications enregistrées')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
    }
  }

  const handleActivate = async () => {
    if (!id) return
    try {
      await activateCampaign.mutateAsync(id)
      setSuccess('Campagne activée ! Lien public disponible.')
    } catch {
      setError('Erreur lors de l\'activation')
    }
  }

  const handleTestWebhook = async () => {
    if (!id) return
    if (!webhookUrl) {
      setError('Veuillez configurer une URL de webhook')
      return
    }

    // Save first if there are unsaved changes
    if (webhookUrl !== campaign?.webhookUrl || webhookSecret !== campaign?.webhookSecret) {
      await handleSave()
    }

    setError('')
    setSuccess('')

    try {
      const result = await testWebhook.mutateAsync(id)
      if (result.success) {
        setSuccess('Webhook testé avec succès !')
      } else {
        setError(result.message || 'Échec du test du webhook')
      }
    } catch {
      setError('Erreur lors du test du webhook')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setError('Le fichier ne doit pas dépasser 2 MB')
      return
    }

    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      setError('Format accepté: PNG ou JPG')
      return
    }

    // Create data URL for preview (in production, upload to storage)
    const reader = new FileReader()
    reader.onload = (event) => {
      setLogoPreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeLogo = () => {
    setLogoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const copyLink = () => {
    if (campaign) {
      const url = `${window.location.origin}/q/${campaign.slug}`
      navigator.clipboard.writeText(url)
      setSuccess('Lien copié !')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{error || 'Campagne non trouvée'}</p>
        <Link to="/campaigns" className="text-indigo-600 hover:text-indigo-700 mt-4 inline-block">
          Retour aux campagnes
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link to="/campaigns" className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block">
              &larr; Retour aux campagnes
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                campaign.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                campaign.status === 'active' ? 'bg-green-100 text-green-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {campaign.status === 'draft' ? 'Brouillon' :
                 campaign.status === 'active' ? 'Active' : 'Archivée'}
              </span>
            </div>
          </div>

          {campaign.status === 'active' && (
            <button
              onClick={copyLink}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Copier le lien
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        {isArchived && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-700">
              <strong>Campagne archivée</strong> — Cette campagne ne peut plus être modifiée.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Settings Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6 space-y-6"
          >
            <h2 className="text-lg font-semibold text-gray-900">Paramètres</h2>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nom de la campagne *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!canEdit}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!canEdit}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo (PNG ou JPG, max 2 MB)
              </label>
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <div className="relative">
                    <img
                      src={logoPreview}
                      alt="Logo"
                      className="h-16 w-16 object-contain rounded-lg border border-gray-200"
                    />
                    {canEdit && (
                      <button
                        onClick={removeLogo}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {canEdit && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {logoPreview ? 'Changer' : 'Ajouter un logo'}
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            <div>
              <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                Couleur principale
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="color"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  disabled={!canEdit}
                  className="w-12 h-10 rounded cursor-pointer disabled:cursor-not-allowed"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  disabled={!canEdit}
                  pattern="^#[0-9A-Fa-f]{6}$"
                  className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>
            </div>

            {canEdit && (
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={updateCampaign.isPending || !name.trim()}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {updateCampaign.isPending ? 'Enregistrement...' : 'Enregistrer'}
                </button>

                {campaign.status === 'draft' && (
                  <button
                    onClick={handleActivate}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Activer
                  </button>
                )}
              </div>
            )}
          </motion.div>

          {/* Webhook Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 space-y-6"
          >
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Webhook</h2>
              <p className="text-sm text-gray-500 mt-1">
                Recevez une notification HTTP lorsqu'un répondant complète le questionnaire
              </p>
            </div>

            <div>
              <label htmlFor="webhookUrl" className="block text-sm font-medium text-gray-700 mb-1">
                URL du webhook
              </label>
              <input
                id="webhookUrl"
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                disabled={!canEdit}
                placeholder="https://votre-serveur.com/webhook"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                POST avec payload JSON contenant les données du profil
              </p>
            </div>

            <div>
              <label htmlFor="webhookSecret" className="block text-sm font-medium text-gray-700 mb-1">
                Secret (optionnel)
              </label>
              <input
                id="webhookSecret"
                type="password"
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                disabled={!canEdit}
                placeholder="Votre clé secrète"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 font-mono"
              />
              <p className="text-xs text-gray-400 mt-1">
                Utilisé pour signer les requêtes (header X-Webhook-Signature, HMAC-SHA256)
              </p>
            </div>

            {canEdit && webhookUrl && (
              <button
                onClick={handleTestWebhook}
                disabled={testWebhook.isPending}
                className="w-full px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 disabled:opacity-50 transition-colors"
              >
                {testWebhook.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Test en cours...
                  </span>
                ) : (
                  'Tester le webhook'
                )}
              </button>
            )}
          </motion.div>

          {/* Preview Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Aperçu du questionnaire</h2>

            <div
              className="rounded-lg border-2 border-dashed border-gray-200 p-6"
              style={{ backgroundColor: `${primaryColor}10` }}
            >
              <div className="text-center space-y-4">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="h-16 mx-auto object-contain"
                  />
                ) : (
                  <div className="h-16 flex items-center justify-center text-gray-400 text-sm">
                    (Aucun logo)
                  </div>
                )}

                <h3 className="text-xl font-semibold" style={{ color: primaryColor }}>
                  {name || 'Nom de la campagne'}
                </h3>

                {description && (
                  <p className="text-gray-600 text-sm">{description}</p>
                )}

                <div className="pt-4">
                  <button
                    style={{ backgroundColor: primaryColor }}
                    className="px-6 py-3 text-white rounded-lg font-medium"
                  >
                    Commencer le questionnaire
                  </button>
                </div>

                <p className="text-xs text-gray-400">
                  Durée estimée: 25-30 minutes
                </p>
              </div>
            </div>

            {campaign.status === 'active' && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Lien public:</p>
                <code className="text-xs bg-white px-2 py-1 rounded border break-all">
                  {window.location.origin}/q/{campaign.slug}
                </code>
              </div>
            )}
          </motion.div>
        </div>
    </div>
  )
}
