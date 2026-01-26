import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

interface Campaign {
  id: string
  name: string
  description: string | null
  logoUrl: string | null
  primaryColor: string | null
}

export function QuestionnaireLandingPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isArchived, setIsArchived] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState('')

  // Passeport mode
  const [showPasseport, setShowPasseport] = useState(false)
  const [passeportCode, setPasseportCode] = useState('')

  // Recovery mode
  const [showRecovery, setShowRecovery] = useState(false)
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [isRecovering, setIsRecovering] = useState(false)
  const [recoverySuccess, setRecoverySuccess] = useState(false)

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await fetch(`${import.meta.env['VITE_API_URL'] || 'http://localhost:3000'}/q/${slug}`)
        const data = await response.json()

        if (response.ok) {
          setCampaign(data.campaign)
          setIsArchived(data.isArchived)
        } else {
          setNotFound(true)
        }
      } catch {
        setNotFound(true)
      }
      setIsLoading(false)
    }
    fetchCampaign()
  }, [slug])

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!consent) {
      setError('Vous devez accepter la politique de confidentialité')
      return
    }

    setIsStarting(true)

    try {
      const response = await fetch(`${import.meta.env['VITE_API_URL'] || 'http://localhost:3000'}/q/${slug}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, consent }),
      })

      const data = await response.json()

      if (response.ok) {
        // Store respondent ID for the session
        sessionStorage.setItem('respondent_id', data.respondent.id)
        sessionStorage.setItem('campaign_slug', slug || '')

        if (data.respondent.status === 'completed') {
          // Already completed, go to results
          navigate(`/q/${slug}/results/${data.respondent.id}`)
        } else {
          // Go to questionnaire
          navigate(`/q/${slug}/questions`)
        }
      } else {
        setError(data.message || 'Erreur lors du démarrage')
      }
    } catch {
      setError('Erreur réseau')
    }

    setIsStarting(false)
  }

  const handlePasseportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!consent) {
      setError('Vous devez accepter la politique de confidentialité')
      return
    }

    // Format passeport code (uppercase, add dashes if missing)
    let formattedCode = passeportCode.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (formattedCode.length === 12) {
      formattedCode = `${formattedCode.slice(0, 4)}-${formattedCode.slice(4, 8)}-${formattedCode.slice(8, 12)}`
    }

    if (formattedCode.length !== 14) {
      setError('Format de code invalide (XXXX-XXXX-XXXX)')
      return
    }

    setIsStarting(true)

    try {
      const response = await fetch(`${import.meta.env['VITE_API_URL'] || 'http://localhost:3000'}/q/${slug}/passeport`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passeportCode: formattedCode,
          email,
          consent,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        sessionStorage.setItem('respondent_id', data.respondent.id)
        sessionStorage.setItem('campaign_slug', slug || '')
        // Go directly to results
        navigate(`/q/${slug}/results/${data.respondent.id}`)
      } else {
        setError(data.message || 'Code Passeport invalide')
      }
    } catch {
      setError('Erreur réseau')
    }

    setIsStarting(false)
  }

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsRecovering(true)

    try {
      const response = await fetch(`${import.meta.env['VITE_API_URL'] || 'http://localhost:3000'}/q/passeport/recover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoveryEmail }),
      })

      if (response.ok) {
        setRecoverySuccess(true)
      }
    } catch {
      // Still show success for security
      setRecoverySuccess(true)
    }

    setIsRecovering(false)
  }

  const primaryColor = campaign?.primaryColor || '#4F46E5'

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: primaryColor }} />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Campagne non trouvée</h1>
          <p className="text-gray-600">Le lien que vous avez utilisé n'est pas valide ou a expiré.</p>
        </div>
      </div>
    )
  }

  if (isArchived) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          {campaign?.logoUrl && (
            <img src={campaign.logoUrl} alt="" className="h-16 mx-auto mb-6 object-contain" />
          )}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Cette campagne est terminée</h1>
          <p className="text-gray-600">
            Merci de votre intérêt ! Cette campagne n'accepte plus de nouvelles réponses.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8"
        style={{ borderTop: `4px solid ${primaryColor}` }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          {campaign?.logoUrl ? (
            <img src={campaign.logoUrl} alt="" className="h-16 mx-auto mb-6 object-contain" />
          ) : (
            <div className="h-16 flex items-center justify-center mb-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <svg
                  className="w-8 h-8"
                  style={{ color: primaryColor }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          )}

          <h1 className="text-2xl font-bold text-gray-900 mb-2">{campaign?.name}</h1>
          {campaign?.description && (
            <p className="text-gray-600">{campaign.description}</p>
          )}
        </div>

        {/* Info */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Durée estimée: <strong>25-30 minutes</strong></span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span><strong>170 questions</strong> à choix multiples</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Vos réponses sont <strong>confidentielles</strong></span>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => { setShowPasseport(false); setError('') }}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                !showPasseport
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Nouveau
            </button>
            <button
              type="button"
              onClick={() => { setShowPasseport(true); setError('') }}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                showPasseport
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              J'ai un Passeport
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={showPasseport ? handlePasseportSubmit : handleStart} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {showPasseport && (
            <div>
              <label htmlFor="passeport" className="block text-sm font-medium text-gray-700 mb-1">
                Code Passeport
              </label>
              <input
                id="passeport"
                type="text"
                value={passeportCode}
                onChange={(e) => setPasseportCode(e.target.value.toUpperCase())}
                required
                placeholder="XXXX-XXXX-XXXX"
                maxLength={14}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent font-mono text-center text-lg tracking-wider"
                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
              />
              <p className="mt-1 text-xs text-gray-500">
                Entrez votre code Passeport pour récupérer votre profil existant
              </p>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Votre email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="votre@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
            />
            <p className="mt-1 text-xs text-gray-500">
              {showPasseport
                ? 'Pour confirmer votre identité'
                : 'Pour recevoir vos résultats et votre code Passeport'}
            </p>
          </div>

          <div className="flex items-start gap-3">
            <input
              id="consent"
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300"
              style={{ accentColor: primaryColor }}
            />
            <label htmlFor="consent" className="text-sm text-gray-600">
              J'accepte la{' '}
              <a
                href="/privacy"
                target="_blank"
                className="underline"
                style={{ color: primaryColor }}
              >
                politique de confidentialité
              </a>{' '}
              et consens au traitement de mes données conformément au RGPD.
            </label>
          </div>

          <button
            type="submit"
            disabled={isStarting || !email || !consent || (showPasseport && !passeportCode)}
            className="w-full py-3 text-white rounded-lg font-medium transition-all disabled:opacity-50"
            style={{ backgroundColor: primaryColor }}
          >
            {isStarting
              ? 'Chargement...'
              : showPasseport
                ? 'Utiliser mon Passeport'
                : 'Commencer le questionnaire'}
          </button>
        </form>

        {/* Passeport perdu link */}
        {showPasseport && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShowRecovery(true)}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Passeport perdu ?
            </button>
          </div>
        )}
      </motion.div>

      {/* Recovery Modal */}
      {showRecovery && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => { setShowRecovery(false); setRecoverySuccess(false); setRecoveryEmail('') }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {recoverySuccess ? (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Email envoyé !</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Si un Passeport existe pour cet email, vous le recevrez sous peu.
                </p>
                <button
                  onClick={() => { setShowRecovery(false); setRecoverySuccess(false); setRecoveryEmail('') }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Récupérer votre Passeport</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Entrez l'email que vous avez utilisé pour recevoir votre code Passeport.
                </p>
                <form onSubmit={handleRecovery} className="space-y-4">
                  <input
                    type="email"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    required
                    placeholder="votre@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                  />
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowRecovery(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isRecovering || !recoveryEmail}
                      className="flex-1 px-4 py-2 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {isRecovering ? 'Envoi...' : 'Envoyer'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
